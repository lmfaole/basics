const ElementBase = globalThis.Element ?? class {};
const HTMLElementBase = globalThis.HTMLElement ?? class {};
const HTMLButtonElementBase = globalThis.HTMLButtonElement ?? class {};
const HTMLDialogElementBase = globalThis.HTMLDialogElement ?? class {};

export const DIALOG_TAG_NAME = "basic-dialog";

const DEFAULT_LABEL = "Dialog";
const PANEL_SELECTOR = "[data-dialog-panel]";
const TITLE_SELECTOR = "[data-dialog-title]";
const OPEN_SELECTOR = "[data-dialog-open]";
const CLOSE_SELECTOR = "[data-dialog-close]";
const MANAGED_LABEL_ATTRIBUTE = "data-basic-dialog-managed-label";
const MANAGED_LABELLEDBY_ATTRIBUTE = "data-basic-dialog-managed-labelledby";

let nextDialogInstanceId = 1;

function collectOwnedElements(root, scope, selector) {
    return Array.from(scope.querySelectorAll(selector)).filter(
        (element) => element instanceof HTMLElementBase && element.closest(DIALOG_TAG_NAME) === root,
    );
}

function normalizeDialogCloseValue(value) {
    return value?.trim() ?? "";
}

export function normalizeDialogBackdropClose(value) {
    if (value == null) {
        return false;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "" || normalized === "true";
}

export function normalizeDialogLabel(value) {
    return value?.trim() || DEFAULT_LABEL;
}

export class DialogElement extends HTMLElementBase {
    static observedAttributes = ["data-backdrop-close", "data-label"];

    #instanceId = `${DIALOG_TAG_NAME}-${nextDialogInstanceId++}`;
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
            this.#eventsBound = true;
        }

        this.#sync();
    }

    disconnectedCallback() {
        if (this.#eventsBound) {
            this.removeEventListener("click", this.#handleClick);
            this.#eventsBound = false;
        }

        this.#syncPanelEvents(null);
    }

    attributeChangedCallback() {
        this.#sync();
    }

    showModal(opener = null) {
        this.#sync();

        if (
            !(this.#panel instanceof HTMLDialogElementBase)
            || typeof this.#panel.showModal !== "function"
        ) {
            return false;
        }

        if (this.#panel.open) {
            this.#applyState();
            return true;
        }

        const fallbackOpener = opener instanceof HTMLElementBase
            ? opener
            : this.ownerDocument?.activeElement instanceof HTMLElementBase
                ? this.ownerDocument.activeElement
                : null;

        this.#restoreFocusTo = fallbackOpener;
        this.#panel.showModal();
        this.#applyState();
        return true;
    }

    close(returnValue = "") {
        if (
            !(this.#panel instanceof HTMLDialogElementBase)
            || typeof this.#panel.close !== "function"
            || !this.#panel.open
        ) {
            return false;
        }

        this.#panel.close(returnValue);
        return true;
    }

    #handleClick = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const openButton = event.target.closest(OPEN_SELECTOR);

        if (
            openButton instanceof HTMLElementBase
            && openButton.closest(DIALOG_TAG_NAME) === this
        ) {
            event.preventDefault();
            this.showModal(openButton);
            return;
        }

        const closeButton = event.target.closest(CLOSE_SELECTOR);

        if (
            closeButton instanceof HTMLElementBase
            && closeButton.closest(DIALOG_TAG_NAME) === this
        ) {
            event.preventDefault();
            this.close(normalizeDialogCloseValue(
                closeButton.getAttribute("data-dialog-close-value"),
            ));
            return;
        }

        if (
            event.target === this.#panel
            && normalizeDialogBackdropClose(this.getAttribute("data-backdrop-close"))
        ) {
            this.close();
        }
    };

    #handleDialogClose = () => {
        this.#applyState();

        if (
            this.#restoreFocusTo instanceof HTMLElementBase
            && this.#restoreFocusTo.isConnected
        ) {
            this.#restoreFocusTo.focus();
        }

        this.#restoreFocusTo = null;
    };

    #handleDialogCancel = () => {
        this.#applyState();
    };

    #sync() {
        const nextPanel = collectOwnedElements(this, this, PANEL_SELECTOR)[0] ?? null;
        const nextTitle = collectOwnedElements(this, this, TITLE_SELECTOR)[0] ?? null;

        this.#syncPanelEvents(nextPanel instanceof HTMLDialogElementBase ? nextPanel : null);
        this.#panel = nextPanel instanceof HTMLDialogElementBase ? nextPanel : null;
        this.#title = nextTitle instanceof HTMLElementBase ? nextTitle : null;
        this.#openButtons = collectOwnedElements(this, this, OPEN_SELECTOR);
        this.#closeButtons = collectOwnedElements(this, this, CLOSE_SELECTOR);
        this.#applyState();
    }

    #syncPanelEvents(nextPanel) {
        if (this.#panelWithEvents === nextPanel) {
            return;
        }

        if (this.#panelWithEvents instanceof HTMLDialogElementBase) {
            this.#panelWithEvents.removeEventListener("close", this.#handleDialogClose);
            this.#panelWithEvents.removeEventListener("cancel", this.#handleDialogCancel);
        }

        if (nextPanel instanceof HTMLDialogElementBase) {
            nextPanel.addEventListener("close", this.#handleDialogClose);
            nextPanel.addEventListener("cancel", this.#handleDialogCancel);
        }

        this.#panelWithEvents = nextPanel;
    }

    #applyState() {
        for (const button of [...this.#openButtons, ...this.#closeButtons]) {
            if (button instanceof HTMLButtonElementBase && !button.hasAttribute("type")) {
                button.type = "button";
            }
        }

        if (!(this.#panel instanceof HTMLDialogElementBase)) {
            this.toggleAttribute("data-open", false);
            return;
        }

        const baseId = this.id || this.#instanceId;

        if (this.#title instanceof HTMLElementBase && !this.#title.id) {
            this.#title.id = `${baseId}-title`;
        }

        this.#panel.setAttribute("aria-modal", "true");
        this.#syncAccessibleLabel();
        this.toggleAttribute("data-open", this.#panel.open);
    }

    #syncAccessibleLabel() {
        if (!(this.#panel instanceof HTMLDialogElementBase)) {
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
                normalizeDialogLabel(this.getAttribute("data-label")),
            );
            this.#panel.setAttribute(MANAGED_LABEL_ATTRIBUTE, "");
        }
    }
}

export function defineDialog(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return DialogElement;
    }

    if (!registry.get(DIALOG_TAG_NAME)) {
        registry.define(DIALOG_TAG_NAME, DialogElement);
    }

    return DialogElement;
}
