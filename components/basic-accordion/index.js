const ElementBase = globalThis.Element ?? class {};
const HTMLElementBase = globalThis.HTMLElement ?? class {};
const HTMLButtonElementBase = globalThis.HTMLButtonElement ?? class {};

export const ACCORDION_TAG_NAME = "basic-accordion";

const TRIGGER_SELECTOR = "[data-accordion-trigger]";
const PANEL_SELECTOR = "[data-accordion-panel]";

let nextAccordionInstanceId = 1;

function collectOwnedElements(root, scope, selector) {
    return Array.from(scope.querySelectorAll(selector)).filter(
        (element) => element instanceof HTMLElementBase && element.closest(ACCORDION_TAG_NAME) === root,
    );
}

function isAccordionItemDisabled(trigger) {
    return trigger.hasAttribute("disabled") || trigger.getAttribute("aria-disabled") === "true";
}

function findFirstEnabledAccordionIndex(itemStates) {
    for (let index = 0; index < itemStates.length; index += 1) {
        if (!itemStates[index]?.disabled) {
            return index;
        }
    }

    return -1;
}

function findLastEnabledAccordionIndex(itemStates) {
    for (let index = itemStates.length - 1; index >= 0; index -= 1) {
        if (!itemStates[index]?.disabled) {
            return index;
        }
    }

    return -1;
}

export function getInitialOpenAccordionIndexes(
    itemStates,
    { multiple = false, collapsible = false } = {},
) {
    const explicitOpenIndexes = [];

    for (let index = 0; index < itemStates.length; index += 1) {
        const itemState = itemStates[index];

        if (itemState?.open && !itemState.disabled) {
            explicitOpenIndexes.push(index);
        }
    }

    if (multiple) {
        return explicitOpenIndexes;
    }

    if (explicitOpenIndexes.length > 0) {
        return [explicitOpenIndexes[0]];
    }

    if (collapsible) {
        return [];
    }

    const firstEnabledIndex = findFirstEnabledAccordionIndex(itemStates);
    return firstEnabledIndex === -1 ? [] : [firstEnabledIndex];
}

export function findNextEnabledAccordionIndex(itemStates, startIndex, direction) {
    if (itemStates.length === 0) {
        return -1;
    }

    const step = direction < 0 ? -1 : 1;
    let nextIndex = startIndex;

    for (let checked = 0; checked < itemStates.length; checked += 1) {
        nextIndex += step;

        if (nextIndex < 0) {
            nextIndex = itemStates.length - 1;
        } else if (nextIndex >= itemStates.length) {
            nextIndex = 0;
        }

        if (!itemStates[nextIndex]?.disabled) {
            return nextIndex;
        }
    }

    return -1;
}

export class AccordionElement extends HTMLElementBase {
    static observedAttributes = ["data-collapsible", "data-multiple"];

    #instanceId = `${ACCORDION_TAG_NAME}-${nextAccordionInstanceId++}`;
    #triggers = [];
    #panels = [];
    #openIndexes = new Set();
    #focusIndex = -1;
    #eventsBound = false;

    connectedCallback() {
        if (!this.#eventsBound) {
            this.addEventListener("click", this.#handleClick);
            this.addEventListener("keydown", this.#handleKeyDown);
            this.#eventsBound = true;
        }

        this.#sync({ resetOpen: true });
    }

    disconnectedCallback() {
        if (!this.#eventsBound) {
            return;
        }

        this.removeEventListener("click", this.#handleClick);
        this.removeEventListener("keydown", this.#handleKeyDown);
        this.#eventsBound = false;
    }

    attributeChangedCallback() {
        this.#sync({ resetOpen: true });
    }

    #handleClick = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const trigger = event.target.closest(TRIGGER_SELECTOR);

        if (
            !(trigger instanceof HTMLElementBase)
            || trigger.closest(ACCORDION_TAG_NAME) !== this
        ) {
            return;
        }

        const triggerIndex = this.#triggers.indexOf(trigger);

        if (triggerIndex === -1) {
            return;
        }

        this.#toggleIndex(triggerIndex, { focus: true });
    };

    #handleKeyDown = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const currentTrigger = event.target.closest(TRIGGER_SELECTOR);

        if (
            !(currentTrigger instanceof HTMLElementBase)
            || currentTrigger.closest(ACCORDION_TAG_NAME) !== this
        ) {
            return;
        }

        const itemStates = this.#getItemStates();
        const currentIndex = this.#triggers.indexOf(currentTrigger);
        let nextIndex = -1;

        if (currentIndex === -1 || currentIndex >= itemStates.length) {
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                nextIndex = findNextEnabledAccordionIndex(itemStates, currentIndex, 1);
                break;
            case "ArrowUp":
                nextIndex = findNextEnabledAccordionIndex(itemStates, currentIndex, -1);
                break;
            case "Home":
                nextIndex = findFirstEnabledAccordionIndex(itemStates);
                break;
            case "End":
                nextIndex = findLastEnabledAccordionIndex(itemStates);
                break;
            case " ":
            case "Enter":
                event.preventDefault();
                this.#toggleIndex(currentIndex, { focus: true });
                return;
            default:
                return;
        }

        if (nextIndex === -1) {
            return;
        }

        event.preventDefault();
        this.#focusIndex = nextIndex;
        this.#applyState({ focus: true });
    };

    #getItemStates() {
        const pairCount = Math.min(this.#triggers.length, this.#panels.length);

        return this.#triggers.slice(0, pairCount).map((trigger, index) => ({
            disabled: isAccordionItemDisabled(trigger),
            open: trigger.hasAttribute("data-open")
                || trigger.getAttribute("aria-expanded") === "true"
                || this.#panels[index]?.hasAttribute("data-open"),
        }));
    }

    #isCollapsible() {
        return this.hasAttribute("data-collapsible");
    }

    #isMultiple() {
        return this.hasAttribute("data-multiple");
    }

    #getNextFocusableIndex(itemStates) {
        for (const openIndex of this.#openIndexes) {
            if (!itemStates[openIndex]?.disabled) {
                return openIndex;
            }
        }

        return findFirstEnabledAccordionIndex(itemStates);
    }

    #sync({ resetOpen = false } = {}) {
        this.#triggers = collectOwnedElements(this, this, TRIGGER_SELECTOR);
        this.#panels = collectOwnedElements(this, this, PANEL_SELECTOR);

        const itemStates = this.#getItemStates();

        if (resetOpen) {
            this.#openIndexes = new Set(
                getInitialOpenAccordionIndexes(itemStates, {
                    multiple: this.#isMultiple(),
                    collapsible: this.#isCollapsible(),
                }),
            );
        } else {
            const nextOpenIndexes = Array.from(this.#openIndexes).filter(
                (index) => index >= 0 && index < itemStates.length && !itemStates[index]?.disabled,
            );

            if (!this.#isMultiple() && nextOpenIndexes.length > 1) {
                nextOpenIndexes.splice(1);
            }

            if (
                !this.#isMultiple()
                && nextOpenIndexes.length === 0
                && !this.#isCollapsible()
            ) {
                const fallbackIndex = findFirstEnabledAccordionIndex(itemStates);

                if (fallbackIndex !== -1) {
                    nextOpenIndexes.push(fallbackIndex);
                }
            }

            this.#openIndexes = new Set(nextOpenIndexes);
        }

        if (resetOpen || itemStates[this.#focusIndex]?.disabled || this.#focusIndex >= itemStates.length) {
            this.#focusIndex = this.#getNextFocusableIndex(itemStates);
        }

        this.#applyState();
    }

    #applyState({ focus = false } = {}) {
        const pairCount = Math.min(this.#triggers.length, this.#panels.length);
        const baseId = this.id || this.#instanceId;

        for (let index = 0; index < this.#triggers.length; index += 1) {
            const trigger = this.#triggers[index];
            const panel = index < pairCount ? this.#panels[index] : null;
            const disabled = index >= pairCount || isAccordionItemDisabled(trigger);
            const open = !disabled && this.#openIndexes.has(index);
            const focusable = !disabled && index === this.#focusIndex;

            if (!trigger.id) {
                trigger.id = `${baseId}-trigger-${index + 1}`;
            }

            if (trigger instanceof HTMLButtonElementBase && !trigger.hasAttribute("type")) {
                trigger.type = "button";
            }

            trigger.setAttribute("aria-expanded", String(open));
            trigger.tabIndex = focusable ? 0 : -1;
            trigger.toggleAttribute("data-open", open);

            if (panel) {
                if (!panel.id) {
                    panel.id = `${baseId}-panel-${index + 1}`;
                }

                trigger.setAttribute("aria-controls", panel.id);
            } else {
                trigger.removeAttribute("aria-controls");
            }
        }

        for (let index = 0; index < this.#panels.length; index += 1) {
            const panel = this.#panels[index];
            const trigger = this.#triggers[index];
            const open = index < pairCount
                && !isAccordionItemDisabled(trigger)
                && this.#openIndexes.has(index);

            if (!panel.id) {
                panel.id = `${baseId}-panel-${index + 1}`;
            }

            panel.setAttribute("role", "region");

            if (trigger?.id) {
                panel.setAttribute("aria-labelledby", trigger.id);
            } else {
                panel.removeAttribute("aria-labelledby");
            }

            panel.hidden = !open;
            panel.toggleAttribute("data-open", open);
        }

        if (focus && this.#focusIndex !== -1) {
            this.#triggers[this.#focusIndex]?.focus();
        }
    }

    #toggleIndex(index, { focus = false } = {}) {
        const itemStates = this.#getItemStates();

        if (index < 0 || index >= itemStates.length || itemStates[index]?.disabled) {
            return;
        }

        const nextOpenIndexes = new Set(this.#openIndexes);
        const isOpen = nextOpenIndexes.has(index);

        if (this.#isMultiple()) {
            if (isOpen) {
                nextOpenIndexes.delete(index);
            } else {
                nextOpenIndexes.add(index);
            }
        } else if (isOpen) {
            if (!this.#isCollapsible()) {
                this.#focusIndex = index;
                this.#applyState({ focus });
                return;
            }

            nextOpenIndexes.clear();
        } else {
            nextOpenIndexes.clear();
            nextOpenIndexes.add(index);
        }

        this.#openIndexes = nextOpenIndexes;
        this.#focusIndex = index;
        this.#applyState({ focus });
    }
}

export function defineAccordion(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return AccordionElement;
    }

    if (!registry.get(ACCORDION_TAG_NAME)) {
        registry.define(ACCORDION_TAG_NAME, AccordionElement);
    }

    return AccordionElement;
}
