const ElementBase = globalThis.Element ?? class {};
const HTMLElementBase = globalThis.HTMLElement ?? class {};
const HTMLButtonElementBase = globalThis.HTMLButtonElement ?? class {};

export const TOAST_TAG_NAME = "basic-toast";

const DEFAULT_DURATION = 5000;
const DEFAULT_LABEL = "Toast";
const DEFAULT_LIVE = "polite";
const PANEL_SELECTOR = "[data-toast-panel]";
const TITLE_SELECTOR = "[data-toast-title]";
const OPEN_SELECTOR = "[data-toast-open]";
const CLOSE_SELECTOR = "[data-toast-close]";
const MANAGED_LABEL_ATTRIBUTE = "data-basic-toast-managed-label";
const MANAGED_LABELLEDBY_ATTRIBUTE = "data-basic-toast-managed-labelledby";
const MANAGED_POPOVER_ATTRIBUTE = "data-basic-toast-managed-popover";

let nextToastInstanceId = 1;

function collectOwnedElements(root, scope, selector) {
    return Array.from(scope.querySelectorAll(selector)).filter(
        (element) => element instanceof HTMLElementBase && element.closest(TOAST_TAG_NAME) === root,
    );
}

function supportsToastPopover(panel) {
    return panel instanceof HTMLElementBase
        && typeof panel.showPopover === "function"
        && typeof panel.hidePopover === "function";
}

function isToastPanelOpen(panel) {
    if (!(panel instanceof HTMLElementBase)) {
        return false;
    }

    try {
        return panel.matches(":popover-open");
    } catch {
        return panel.hasAttribute("data-open") || !panel.hidden;
    }
}

export function normalizeToastLabel(value) {
    return value?.trim() || DEFAULT_LABEL;
}

export function normalizeToastLive(value) {
    const normalized = value?.trim().toLowerCase();
    return normalized === "assertive" ? "assertive" : DEFAULT_LIVE;
}

export function getToastRoleForLive(value) {
    return normalizeToastLive(value) === "assertive" ? "alert" : "status";
}

export function normalizeToastDuration(value) {
    if (value == null || value.trim() === "") {
        return DEFAULT_DURATION;
    }

    const parsed = Number.parseInt(value, 10);

    if (Number.isInteger(parsed) && parsed >= 0) {
        return parsed;
    }

    return DEFAULT_DURATION;
}

export function normalizeToastOpen(value) {
    if (value == null) {
        return false;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "" || normalized === "true" || normalized === "1";
}

export class ToastElement extends HTMLElementBase {
    static observedAttributes = ["data-duration", "data-label", "data-live", "data-open"];

    #instanceId = `${TOAST_TAG_NAME}-${nextToastInstanceId++}`;
    #panel = null;
    #panelWithEvents = null;
    #title = null;
    #openButtons = [];
    #closeButtons = [];
    #restoreFocusTo = null;
    #dismissTimer = 0;
    #eventsBound = false;

    connectedCallback() {
        if (!this.#eventsBound) {
            this.addEventListener("click", this.#handleClick);
            this.addEventListener("keydown", this.#handleKeyDown);
            this.#eventsBound = true;
        }

        this.#sync();
    }

    disconnectedCallback() {
        if (!this.#eventsBound) {
            return;
        }

        this.removeEventListener("click", this.#handleClick);
        this.removeEventListener("keydown", this.#handleKeyDown);
        this.#eventsBound = false;
        this.#syncPanelEvents(null);
        this.#clearDismissTimer();
    }

    attributeChangedCallback() {
        this.#sync();
    }

    show(opener = null) {
        this.#sync();

        if (!(this.#panel instanceof HTMLElementBase)) {
            return false;
        }

        const fallbackOpener = opener instanceof HTMLElementBase
            ? opener
            : this.ownerDocument?.activeElement instanceof HTMLElementBase
                ? this.ownerDocument.activeElement
                : null;

        this.#restoreFocusTo = fallbackOpener;
        this.toggleAttribute("data-open", true);
        this.#syncOpenState();
        return true;
    }

    hide() {
        if (!(this.#panel instanceof HTMLElementBase) || !this.#isOpen()) {
            return false;
        }

        const shouldRestoreFocus = this.#panel.contains(this.ownerDocument?.activeElement);

        this.toggleAttribute("data-open", false);
        this.#syncOpenState();

        if (
            shouldRestoreFocus
            && this.#restoreFocusTo instanceof HTMLElementBase
            && this.#restoreFocusTo.isConnected
        ) {
            this.#restoreFocusTo.focus();
        }

        this.#restoreFocusTo = null;
        return true;
    }

    toggle(opener = null) {
        if (this.#isOpen()) {
            return this.hide();
        }

        return this.show(opener);
    }

    #handleClick = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const openButton = event.target.closest(OPEN_SELECTOR);

        if (
            openButton instanceof HTMLElementBase
            && openButton.closest(TOAST_TAG_NAME) === this
        ) {
            event.preventDefault();
            this.toggle(openButton);
            return;
        }

        const closeButton = event.target.closest(CLOSE_SELECTOR);

        if (
            closeButton instanceof HTMLElementBase
            && closeButton.closest(TOAST_TAG_NAME) === this
        ) {
            event.preventDefault();
            this.hide();
        }
    };

    #handleKeyDown = (event) => {
        if (
            event.key !== "Escape"
            || !(event.target instanceof ElementBase)
            || event.target.closest(TOAST_TAG_NAME) !== this
            || !(this.#panel instanceof HTMLElementBase)
            || !this.#isOpen()
        ) {
            return;
        }

        event.preventDefault();
        this.hide();
    };

    #handlePanelToggle = () => {
        this.#syncStateFromPanel();
    };

    #sync() {
        const nextPanel = collectOwnedElements(this, this, PANEL_SELECTOR)[0] ?? null;
        const nextTitle = collectOwnedElements(this, this, TITLE_SELECTOR)[0] ?? null;

        this.#syncPanelEvents(nextPanel instanceof HTMLElementBase ? nextPanel : null);
        this.#panel = nextPanel instanceof HTMLElementBase ? nextPanel : null;
        this.#title = nextTitle instanceof HTMLElementBase ? nextTitle : null;
        this.#openButtons = collectOwnedElements(this, this, OPEN_SELECTOR);
        this.#closeButtons = collectOwnedElements(this, this, CLOSE_SELECTOR);
        this.#applyState();
    }

    #syncPanelEvents(nextPanel) {
        if (this.#panelWithEvents === nextPanel) {
            return;
        }

        if (this.#panelWithEvents instanceof HTMLElementBase) {
            this.#panelWithEvents.removeEventListener("toggle", this.#handlePanelToggle);
        }

        if (nextPanel instanceof HTMLElementBase) {
            nextPanel.addEventListener("toggle", this.#handlePanelToggle);
        }

        this.#panelWithEvents = nextPanel;
    }

    #shouldBeOpen() {
        return normalizeToastOpen(this.getAttribute("data-open"));
    }

    #isOpen() {
        if (!(this.#panel instanceof HTMLElementBase)) {
            return false;
        }

        if (supportsToastPopover(this.#panel)) {
            return isToastPanelOpen(this.#panel);
        }

        return !this.#panel.hidden;
    }

    #applyState() {
        for (const button of [...this.#openButtons, ...this.#closeButtons]) {
            if (button instanceof HTMLButtonElementBase && !button.hasAttribute("type")) {
                button.type = "button";
            }
        }

        if (!(this.#panel instanceof HTMLElementBase)) {
            this.#clearDismissTimer();
            return;
        }

        const baseId = this.id || this.#instanceId;

        if (this.#title instanceof HTMLElementBase && !this.#title.id) {
            this.#title.id = `${baseId}-title`;
        }

        this.#panel.setAttribute("role", getToastRoleForLive(this.getAttribute("data-live")));
        this.#panel.setAttribute("aria-live", normalizeToastLive(this.getAttribute("data-live")));
        this.#panel.setAttribute("aria-atomic", "true");
        this.#syncAccessibleLabel();
        this.#syncPopoverState();
        this.#syncOpenState();
    }

    #scheduleDismiss() {
        this.#clearDismissTimer();

        if (typeof window === "undefined") {
            return;
        }

        const duration = normalizeToastDuration(this.getAttribute("data-duration"));

        if (duration === 0) {
            return;
        }

        this.#dismissTimer = window.setTimeout(() => {
            this.#dismissTimer = 0;
            this.hide();
        }, duration);
    }

    #clearDismissTimer() {
        if (this.#dismissTimer === 0 || typeof window === "undefined") {
            return;
        }

        window.clearTimeout(this.#dismissTimer);
        this.#dismissTimer = 0;
    }

    #syncPopoverState() {
        if (!(this.#panel instanceof HTMLElementBase) || !supportsToastPopover(this.#panel)) {
            return;
        }

        if (!this.#panel.hasAttribute("popover")) {
            this.#panel.setAttribute("popover", "manual");
            this.#panel.setAttribute(MANAGED_POPOVER_ATTRIBUTE, "");
        }
    }

    #syncOpenState() {
        if (!(this.#panel instanceof HTMLElementBase)) {
            this.#clearDismissTimer();
            return;
        }

        const open = this.#shouldBeOpen();

        if (supportsToastPopover(this.#panel)) {
            this.#panel.hidden = false;

            try {
                if (open && !isToastPanelOpen(this.#panel)) {
                    this.#panel.showPopover();
                } else if (!open && isToastPanelOpen(this.#panel)) {
                    this.#panel.hidePopover();
                }
            } catch {
                this.#panel.hidden = !open;
            }
        } else {
            this.#panel.hidden = !open;
        }

        this.#syncStateFromPanel();
    }

    #syncStateFromPanel() {
        if (!(this.#panel instanceof HTMLElementBase)) {
            this.#clearDismissTimer();
            return;
        }

        const open = supportsToastPopover(this.#panel)
            ? isToastPanelOpen(this.#panel)
            : !this.#panel.hidden;

        this.#panel.hidden = !open;
        this.#panel.toggleAttribute("data-open", open);
        this.toggleAttribute("data-open", open);

        if (open) {
            this.#scheduleDismiss();
        } else {
            this.#clearDismissTimer();
        }
    }

    #syncAccessibleLabel() {
        if (!(this.#panel instanceof HTMLElementBase)) {
            return;
        }

        const nextLabel = normalizeToastLabel(this.getAttribute("data-label"));
        const hasManagedLabelledBy = this.#panel.hasAttribute(MANAGED_LABELLEDBY_ATTRIBUTE);

        if (
            this.#panel.hasAttribute(MANAGED_LABEL_ATTRIBUTE)
            && this.#panel.getAttribute("aria-label") !== nextLabel
        ) {
            this.#panel.removeAttribute("aria-label");
            this.#panel.removeAttribute(MANAGED_LABEL_ATTRIBUTE);
        }

        if (this.#title?.id) {
            if (this.#panel.hasAttribute(MANAGED_LABEL_ATTRIBUTE)) {
                this.#panel.removeAttribute("aria-label");
                this.#panel.removeAttribute(MANAGED_LABEL_ATTRIBUTE);
            }

            if (!this.#panel.hasAttribute("aria-labelledby") || hasManagedLabelledBy) {
                this.#panel.setAttribute("aria-labelledby", this.#title.id);
                this.#panel.setAttribute(MANAGED_LABELLEDBY_ATTRIBUTE, "");
            }

            return;
        }

        if (hasManagedLabelledBy) {
            this.#panel.removeAttribute("aria-labelledby");
            this.#panel.removeAttribute(MANAGED_LABELLEDBY_ATTRIBUTE);
        }

        const hasOwnAriaLabel = this.#panel.hasAttribute("aria-label")
            && !this.#panel.hasAttribute(MANAGED_LABEL_ATTRIBUTE);
        const hasOwnLabelledBy = this.#panel.hasAttribute("aria-labelledby");

        if (hasOwnAriaLabel || hasOwnLabelledBy) {
            return;
        }

        this.#panel.setAttribute("aria-label", nextLabel);
        this.#panel.setAttribute(MANAGED_LABEL_ATTRIBUTE, "");
    }
}

export function defineToast(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return ToastElement;
    }

    if (!registry.get(TOAST_TAG_NAME)) {
        registry.define(TOAST_TAG_NAME, ToastElement);
    }

    return ToastElement;
}
