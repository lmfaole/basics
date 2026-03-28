const ElementBase = globalThis.Element ?? class {};
const HTMLElementBase = globalThis.HTMLElement ?? class {};
const HTMLButtonElementBase = globalThis.HTMLButtonElement ?? class {};

export const ALERT_TAG_NAME = "basic-alert";

const DEFAULT_LABEL = "Alert";
const DEFAULT_LIVE = "assertive";
const TITLE_SELECTOR = "[data-alert-title]";
const CLOSE_SELECTOR = "[data-alert-close]";
const MANAGED_LABEL_ATTRIBUTE = "data-basic-alert-managed-label";
const MANAGED_LABELLEDBY_ATTRIBUTE = "data-basic-alert-managed-labelledby";

let nextAlertInstanceId = 1;

function collectOwnedElements(root, scope, selector) {
    return Array.from(scope.querySelectorAll(selector)).filter(
        (element) => element instanceof HTMLElementBase && element.closest(ALERT_TAG_NAME) === root,
    );
}

export function normalizeAlertLabel(value) {
    return value?.trim() || DEFAULT_LABEL;
}

export function normalizeAlertLive(value) {
    const normalized = value?.trim().toLowerCase();
    return normalized === "polite" ? "polite" : DEFAULT_LIVE;
}

export function getAlertRoleForLive(value) {
    return normalizeAlertLive(value) === "polite" ? "status" : "alert";
}

export function normalizeAlertOpen(value, hidden = false) {
    if (hidden) {
        return false;
    }

    if (value == null) {
        return true;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "" || normalized === "true" || normalized === "1";
}

export class AlertElement extends HTMLElementBase {
    static observedAttributes = ["data-label", "data-live", "data-open", "hidden"];

    #instanceId = `${ALERT_TAG_NAME}-${nextAlertInstanceId++}`;
    #title = null;
    #closeButtons = [];
    #eventsBound = false;

    connectedCallback() {
        if (!this.#eventsBound) {
            this.addEventListener("click", this.#handleClick);
            this.#eventsBound = true;
        }

        this.#sync();
    }

    disconnectedCallback() {
        if (!this.#eventsBound) {
            return;
        }

        this.removeEventListener("click", this.#handleClick);
        this.#eventsBound = false;
    }

    attributeChangedCallback() {
        this.#sync();
    }

    show() {
        this.hidden = false;
        this.toggleAttribute("data-open", true);
        this.#sync();
        return true;
    }

    hide() {
        this.hidden = true;
        this.toggleAttribute("data-open", false);
        this.#sync();
        return true;
    }

    #handleClick = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const closeButton = event.target.closest(CLOSE_SELECTOR);

        if (
            closeButton instanceof HTMLElementBase
            && closeButton.closest(ALERT_TAG_NAME) === this
        ) {
            event.preventDefault();
            this.hide();
        }
    };

    #sync() {
        const nextTitle = collectOwnedElements(this, this, TITLE_SELECTOR)[0] ?? null;

        this.#title = nextTitle instanceof HTMLElementBase ? nextTitle : null;
        this.#closeButtons = collectOwnedElements(this, this, CLOSE_SELECTOR);
        this.#applyState();
    }

    #applyState() {
        for (const button of this.#closeButtons) {
            if (button instanceof HTMLButtonElementBase && !button.hasAttribute("type")) {
                button.type = "button";
            }
        }

        const open = normalizeAlertOpen(this.getAttribute("data-open"), this.hidden);
        const baseId = this.id || this.#instanceId;

        if (this.#title instanceof HTMLElementBase && !this.#title.id) {
            this.#title.id = `${baseId}-title`;
        }

        this.hidden = !open;
        this.toggleAttribute("data-open", open);
        this.setAttribute("role", getAlertRoleForLive(this.getAttribute("data-live")));
        this.setAttribute("aria-live", normalizeAlertLive(this.getAttribute("data-live")));
        this.setAttribute("aria-atomic", "true");
        this.#syncAccessibleLabel();
    }

    #syncAccessibleLabel() {
        const nextLabel = normalizeAlertLabel(this.getAttribute("data-label"));
        const hasManagedLabel = this.hasAttribute(MANAGED_LABEL_ATTRIBUTE);
        const hasManagedLabelledBy = this.hasAttribute(MANAGED_LABELLEDBY_ATTRIBUTE);

        if (hasManagedLabel && this.getAttribute("aria-label") !== nextLabel) {
            this.removeAttribute("aria-label");
            this.removeAttribute(MANAGED_LABEL_ATTRIBUTE);
        }

        if (this.#title?.id) {
            if (this.hasAttribute(MANAGED_LABEL_ATTRIBUTE)) {
                this.removeAttribute("aria-label");
                this.removeAttribute(MANAGED_LABEL_ATTRIBUTE);
            }

            if (!this.hasAttribute("aria-labelledby") || hasManagedLabelledBy) {
                this.setAttribute("aria-labelledby", this.#title.id);
                this.setAttribute(MANAGED_LABELLEDBY_ATTRIBUTE, "");
            }

            return;
        }

        if (hasManagedLabelledBy) {
            this.removeAttribute("aria-labelledby");
            this.removeAttribute(MANAGED_LABELLEDBY_ATTRIBUTE);
        }

        const hasOwnAriaLabel = this.hasAttribute("aria-label") && !this.hasAttribute(MANAGED_LABEL_ATTRIBUTE);
        const hasOwnLabelledBy = this.hasAttribute("aria-labelledby");

        if (hasOwnAriaLabel || hasOwnLabelledBy) {
            return;
        }

        this.setAttribute("aria-label", nextLabel);
        this.setAttribute(MANAGED_LABEL_ATTRIBUTE, "");
    }
}

export function defineAlert(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return AlertElement;
    }

    if (!registry.get(ALERT_TAG_NAME)) {
        registry.define(ALERT_TAG_NAME, AlertElement);
    }

    return AlertElement;
}
