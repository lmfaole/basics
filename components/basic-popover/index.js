const ElementBase = globalThis.Element ?? class {};
const HTMLElementBase = globalThis.HTMLElement ?? class {};
const HTMLButtonElementBase = globalThis.HTMLButtonElement ?? class {};

export const POPOVER_TAG_NAME = "basic-popover";

const DEFAULT_LABEL = "Popover";
const PANEL_SELECTOR = "[data-popover-panel]";
const TITLE_SELECTOR = "[data-popover-title]";
const OPEN_SELECTOR = "[data-popover-open]";
const CLOSE_SELECTOR = "[data-popover-close]";
const MANAGED_ANCHORED_ATTRIBUTE = "data-basic-popover-anchored";
const MANAGED_POPOVER_ATTRIBUTE = "data-basic-popover-managed-popover";
const MANAGED_LABEL_ATTRIBUTE = "data-basic-popover-managed-label";
const MANAGED_LABELLEDBY_ATTRIBUTE = "data-basic-popover-managed-labelledby";
const MANAGED_ROLE_ATTRIBUTE = "data-basic-popover-managed-role";
const MANAGED_MODAL_ATTRIBUTE = "data-basic-popover-managed-modal";
const MANAGED_POSITION_AREA_VARIABLE = "--basic-popover-position-area";
const MANAGED_POSITION_TRY_VARIABLE = "--basic-popover-position-try-fallbacks";
const POPOVER_STYLE_ID = "basic-popover-anchor-styles";

let nextPopoverInstanceId = 1;

function collectOwnedElements(root, scope, selector) {
    return Array.from(scope.querySelectorAll(selector)).filter(
        (element) => element instanceof HTMLElementBase && element.closest(POPOVER_TAG_NAME) === root,
    );
}

function ensurePopoverAnchorStyles(documentRef) {
    if (!documentRef?.head || documentRef.getElementById(POPOVER_STYLE_ID)) {
        return;
    }

    const style = documentRef.createElement("style");
    style.id = POPOVER_STYLE_ID;
    style.textContent = `${POPOVER_TAG_NAME} [data-popover-panel][${MANAGED_ANCHORED_ATTRIBUTE}] { inset: auto; margin: 0; position-area: var(${MANAGED_POSITION_AREA_VARIABLE}, bottom); position-try-fallbacks: var(${MANAGED_POSITION_TRY_VARIABLE}, flip-block, flip-inline, flip-block flip-inline); position-try: var(${MANAGED_POSITION_TRY_VARIABLE}, flip-block, flip-inline, flip-block flip-inline); }`;
    documentRef.head.append(style);
}

export function normalizePopoverLabel(value) {
    return value?.trim() || DEFAULT_LABEL;
}

export function normalizePopoverAnchorTrigger(value) {
    if (value == null) {
        return false;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "" || normalized === "true";
}

export function normalizePopoverPositionArea(value) {
    return value?.trim() || "bottom";
}

export function getDefaultPopoverPositionTryFallbacks(positionArea) {
    const normalizedArea = normalizePopoverPositionArea(positionArea).toLowerCase();
    const blockDirectionalTokens = [
        "top",
        "bottom",
        "block-start",
        "block-end",
        "y-start",
        "y-end",
        "span-top",
        "span-bottom",
        "span-block-start",
        "span-block-end",
        "span-y-start",
        "span-y-end",
    ];
    const inlineDirectionalTokens = [
        "left",
        "right",
        "inline-start",
        "inline-end",
        "x-start",
        "x-end",
        "span-left",
        "span-right",
        "span-inline-start",
        "span-inline-end",
        "span-x-start",
        "span-x-end",
    ];
    const primaryFlip = blockDirectionalTokens.some((token) => normalizedArea.includes(token))
        ? "flip-block"
        : inlineDirectionalTokens.some((token) => normalizedArea.includes(token))
            ? "flip-inline"
            : "flip-block";
    const secondaryFlip = primaryFlip === "flip-block" ? "flip-inline" : "flip-block";

    return `${primaryFlip}, ${secondaryFlip}, ${primaryFlip} ${secondaryFlip}`;
}

export function normalizePopoverPositionTryFallbacks(value, positionArea) {
    return value?.trim() || getDefaultPopoverPositionTryFallbacks(positionArea);
}

export function isPopoverOpen(panel) {
    if (!(panel instanceof HTMLElementBase)) {
        return false;
    }

    try {
        return panel.matches(":popover-open");
    } catch {
        return panel.hasAttribute("data-open");
    }
}

export class PopoverElement extends HTMLElementBase {
    static observedAttributes = [
        "data-anchor-trigger",
        "data-label",
        "data-position-area",
        "data-position-try-fallbacks",
    ];

    #instanceId = `${POPOVER_TAG_NAME}-${nextPopoverInstanceId++}`;
    #panel = null;
    #panelWithEvents = null;
    #title = null;
    #openButtons = [];
    #closeButtons = [];
    #restoreFocusTo = null;
    #eventsBound = false;

    connectedCallback() {
        if (!this.#eventsBound) {
            this.addEventListener("click", this.#handleClick);
            this.addEventListener("keydown", this.#handleKeyDown);
            this.ownerDocument?.addEventListener("click", this.#handleDocumentClick);
            this.#eventsBound = true;
        }

        ensurePopoverAnchorStyles(this.ownerDocument);
        this.#sync();
    }

    disconnectedCallback() {
        if (this.#eventsBound) {
            this.removeEventListener("click", this.#handleClick);
            this.removeEventListener("keydown", this.#handleKeyDown);
            this.ownerDocument?.removeEventListener("click", this.#handleDocumentClick);
            this.#eventsBound = false;
        }

        this.#syncPanelEvents(null);
    }

    attributeChangedCallback() {
        this.#sync();
    }

    show(opener = null) {
        this.#sync();

        if (
            !(this.#panel instanceof HTMLElementBase)
            || typeof this.#panel.showPopover !== "function"
        ) {
            return false;
        }

        if (isPopoverOpen(this.#panel)) {
            this.#applyState();
            return true;
        }

        const fallbackOpener = opener instanceof HTMLElementBase
            ? opener
            : this.ownerDocument?.activeElement instanceof HTMLElementBase
                ? this.ownerDocument.activeElement
                : null;

        this.#restoreFocusTo = fallbackOpener;

        if (this.#shouldAnchorTrigger() && fallbackOpener instanceof HTMLElementBase) {
            try {
                this.#panel.showPopover({ source: fallbackOpener });
            } catch {
                this.#panel.showPopover();
            }
        } else {
            this.#panel.showPopover();
        }

        this.#applyState();
        return true;
    }

    hide() {
        if (
            !(this.#panel instanceof HTMLElementBase)
            || typeof this.#panel.hidePopover !== "function"
            || !isPopoverOpen(this.#panel)
        ) {
            return false;
        }

        this.#panel.hidePopover();
        return true;
    }

    toggle(opener = null) {
        if (isPopoverOpen(this.#panel)) {
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
            && openButton.closest(POPOVER_TAG_NAME) === this
        ) {
            event.preventDefault();
            this.toggle(openButton);
            return;
        }

        const closeButton = event.target.closest(CLOSE_SELECTOR);

        if (
            closeButton instanceof HTMLElementBase
            && closeButton.closest(POPOVER_TAG_NAME) === this
        ) {
            event.preventDefault();
            this.hide();
        }
    };

    #shouldAnchorTrigger() {
        return normalizePopoverAnchorTrigger(this.getAttribute("data-anchor-trigger"));
    }

    #getPositionArea() {
        return normalizePopoverPositionArea(this.getAttribute("data-position-area"));
    }

    #getPositionTryFallbacks() {
        return normalizePopoverPositionTryFallbacks(
            this.getAttribute("data-position-try-fallbacks"),
            this.#getPositionArea(),
        );
    }

    #handleKeyDown = (event) => {
        if (
            event.key !== "Escape"
            || !isPopoverOpen(this.#panel)
            || !(event.target instanceof ElementBase)
            || !this.contains(event.target)
        ) {
            return;
        }

        event.preventDefault();
        this.hide();
    };

    #handleDocumentClick = (event) => {
        if (
            !isPopoverOpen(this.#panel)
            || !(event.target instanceof ElementBase)
            || this.contains(event.target)
        ) {
            return;
        }

        this.hide();
    };

    #handleToggle = () => {
        this.#applyState();

        if (isPopoverOpen(this.#panel)) {
            return;
        }

        const activeElement = this.ownerDocument?.activeElement;
        const shouldRestoreFocus = !(
            activeElement instanceof HTMLElementBase
            && activeElement !== this.ownerDocument?.body
            && !this.contains(activeElement)
        );

        if (
            shouldRestoreFocus
            && this.#restoreFocusTo instanceof HTMLElementBase
            && this.#restoreFocusTo.isConnected
        ) {
            this.#restoreFocusTo.focus();
        }

        this.#restoreFocusTo = null;
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
            this.#panelWithEvents.removeEventListener("toggle", this.#handleToggle);
        }

        if (nextPanel instanceof HTMLElementBase) {
            nextPanel.addEventListener("toggle", this.#handleToggle);
        }

        this.#panelWithEvents = nextPanel;
    }

    #applyState() {
        for (const button of [...this.#openButtons, ...this.#closeButtons]) {
            if (button instanceof HTMLButtonElementBase && !button.hasAttribute("type")) {
                button.type = "button";
            }
        }

        if (!(this.#panel instanceof HTMLElementBase)) {
            this.toggleAttribute("data-open", false);
            return;
        }

        const baseId = this.id || this.#instanceId;
        const open = isPopoverOpen(this.#panel);

        if (!this.#panel.id) {
            this.#panel.id = `${baseId}-panel`;
        }

        if (this.#title instanceof HTMLElementBase && !this.#title.id) {
            this.#title.id = `${baseId}-title`;
        }

        if (
            !this.#panel.hasAttribute("popover")
            || this.#panel.hasAttribute(MANAGED_POPOVER_ATTRIBUTE)
        ) {
            this.#panel.setAttribute("popover", "auto");
            this.#panel.setAttribute(MANAGED_POPOVER_ATTRIBUTE, "");
        }

        if (!this.#panel.hasAttribute("role") || this.#panel.hasAttribute(MANAGED_ROLE_ATTRIBUTE)) {
            this.#panel.setAttribute("role", "dialog");
            this.#panel.setAttribute(MANAGED_ROLE_ATTRIBUTE, "");
        }

        if (
            !this.#panel.hasAttribute("aria-modal")
            || this.#panel.hasAttribute(MANAGED_MODAL_ATTRIBUTE)
        ) {
            this.#panel.setAttribute("aria-modal", "false");
            this.#panel.setAttribute(MANAGED_MODAL_ATTRIBUTE, "");
        }

        this.#syncAccessibleLabel();

        if (this.#shouldAnchorTrigger()) {
            ensurePopoverAnchorStyles(this.ownerDocument);
            this.#panel.setAttribute(MANAGED_ANCHORED_ATTRIBUTE, "");
            this.#panel.style.setProperty(
                MANAGED_POSITION_AREA_VARIABLE,
                this.#getPositionArea(),
            );
            this.#panel.style.setProperty(
                MANAGED_POSITION_TRY_VARIABLE,
                this.#getPositionTryFallbacks(),
            );
        } else {
            this.#panel.removeAttribute(MANAGED_ANCHORED_ATTRIBUTE);
            this.#panel.style.removeProperty(MANAGED_POSITION_AREA_VARIABLE);
            this.#panel.style.removeProperty(MANAGED_POSITION_TRY_VARIABLE);
        }

        for (const button of this.#openButtons) {
            button.setAttribute("aria-haspopup", "dialog");
            button.setAttribute("aria-controls", this.#panel.id);
            button.setAttribute("aria-expanded", String(open));
        }

        this.#panel.toggleAttribute("data-open", open);
        this.toggleAttribute("data-open", open);
    }

    #syncAccessibleLabel() {
        if (!(this.#panel instanceof HTMLElementBase)) {
            return;
        }

        if (this.#title?.id) {
            if (this.#panel.hasAttribute(MANAGED_LABEL_ATTRIBUTE)) {
                this.#panel.removeAttribute("aria-label");
                this.#panel.removeAttribute(MANAGED_LABEL_ATTRIBUTE);
            }

            if (
                !this.#panel.hasAttribute("aria-labelledby")
                || this.#panel.hasAttribute(MANAGED_LABELLEDBY_ATTRIBUTE)
            ) {
                this.#panel.setAttribute("aria-labelledby", this.#title.id);
                this.#panel.setAttribute(MANAGED_LABELLEDBY_ATTRIBUTE, "");
            }

            return;
        }

        if (this.#panel.hasAttribute(MANAGED_LABELLEDBY_ATTRIBUTE)) {
            this.#panel.removeAttribute("aria-labelledby");
            this.#panel.removeAttribute(MANAGED_LABELLEDBY_ATTRIBUTE);
        }

        if (
            !this.#panel.hasAttribute("aria-label")
            || this.#panel.hasAttribute(MANAGED_LABEL_ATTRIBUTE)
        ) {
            this.#panel.setAttribute(
                "aria-label",
                normalizePopoverLabel(this.getAttribute("data-label")),
            );
            this.#panel.setAttribute(MANAGED_LABEL_ATTRIBUTE, "");
        }
    }
}

export function definePopover(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return PopoverElement;
    }

    if (!registry.get(POPOVER_TAG_NAME)) {
        registry.define(POPOVER_TAG_NAME, PopoverElement);
    }

    return PopoverElement;
}
