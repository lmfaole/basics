const ElementBase = globalThis.Element ?? class {};
const HTMLElementBase = globalThis.HTMLElement ?? class {};
const HTMLDetailsElementBase = globalThis.HTMLDetailsElement ?? class {};

export const ACCORDION_TAG_NAME = "basic-accordion";

const SUMMARY_TAG_NAME = "SUMMARY";

function findDirectAccordionSummary(details) {
    return Array.from(details.children).find(
        (child) => child instanceof HTMLElementBase && child.tagName === SUMMARY_TAG_NAME,
    ) ?? null;
}

function collectOwnedAccordionItems(root) {
    return Array.from(root.children).flatMap((child) => {
        if (!(child instanceof HTMLDetailsElementBase)) {
            return [];
        }

        const summary = findDirectAccordionSummary(child);

        if (!(summary instanceof HTMLElementBase)) {
            return [];
        }

        return [{ details: child, summary }];
    });
}

function isAccordionItemDisabled(details) {
    return details.hasAttribute("data-disabled")
        || details.hasAttribute("disabled")
        || details.getAttribute("aria-disabled") === "true";
}

function getOpenAccordionIndexes(itemStates) {
    const openIndexes = [];

    for (let index = 0; index < itemStates.length; index += 1) {
        if (itemStates[index]?.open && !itemStates[index]?.disabled) {
            openIndexes.push(index);
        }
    }

    return openIndexes;
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

    #items = [];
    #eventsBound = false;
    #isSyncingState = false;

    connectedCallback() {
        if (!this.#eventsBound) {
            this.addEventListener("click", this.#handleClick);
            this.addEventListener("keydown", this.#handleKeyDown);
            this.#eventsBound = true;
        }

        this.#sync({ resetOpen: true });
    }

    disconnectedCallback() {
        if (this.#eventsBound) {
            this.removeEventListener("click", this.#handleClick);
            this.removeEventListener("keydown", this.#handleKeyDown);
            this.#eventsBound = false;
        }

        for (const { details } of this.#items) {
            details.removeEventListener("toggle", this.#handleToggle);
        }

        this.#items = [];
    }

    attributeChangedCallback() {
        this.#sync({ resetOpen: true });
    }

    #handleClick = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const summary = event.target.closest("summary");
        const summaryIndex = this.#findSummaryIndex(summary);

        if (summaryIndex === -1) {
            return;
        }

        const itemStates = this.#getItemStates();

        if (itemStates[summaryIndex]?.disabled) {
            event.preventDefault();
            return;
        }

        if (
            !this.#isMultiple()
            && !this.#isCollapsible()
            && itemStates[summaryIndex]?.open
            && getOpenAccordionIndexes(itemStates).length === 1
        ) {
            event.preventDefault();
        }
    };

    #handleKeyDown = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const currentSummary = event.target.closest("summary");
        const currentIndex = this.#findSummaryIndex(currentSummary);
        const itemStates = this.#getItemStates();
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

                if (itemStates[currentIndex]?.disabled) {
                    return;
                }

                if (
                    !this.#isMultiple()
                    && !this.#isCollapsible()
                    && itemStates[currentIndex]?.open
                    && getOpenAccordionIndexes(itemStates).length === 1
                ) {
                    return;
                }

                this.#items[currentIndex].details.open = !this.#items[currentIndex].details.open;
                return;
            default:
                return;
        }

        if (nextIndex === -1) {
            return;
        }

        event.preventDefault();
        this.#items[nextIndex]?.summary.focus();
    };

    #handleToggle = (event) => {
        if (this.#isSyncingState) {
            return;
        }

        const details = event.currentTarget;
        const preferredIndex = this.#items.findIndex((item) => item.details === details);

        if (preferredIndex === -1) {
            return;
        }

        this.#sync({ preferredIndex });
    };

    #findSummaryIndex(summary) {
        if (!(summary instanceof HTMLElementBase)) {
            return -1;
        }

        return this.#items.findIndex((item) => item.summary === summary);
    }

    #isCollapsible() {
        return this.hasAttribute("data-collapsible");
    }

    #isMultiple() {
        return this.hasAttribute("data-multiple");
    }

    #getItemStates({ includeDataOpen = false } = {}) {
        return this.#items.map(({ details }) => ({
            disabled: isAccordionItemDisabled(details),
            open: details.hasAttribute("open")
                || (includeDataOpen && details.hasAttribute("data-open")),
        }));
    }

    #sync({ resetOpen = false, preferredIndex = -1 } = {}) {
        const previousDetails = this.#items.map((item) => item.details);
        const nextItems = collectOwnedAccordionItems(this);
        const nextDetails = nextItems.map((item) => item.details);

        for (const details of previousDetails) {
            if (!nextDetails.includes(details)) {
                details.removeEventListener("toggle", this.#handleToggle);
            }
        }

        for (const details of nextDetails) {
            if (!previousDetails.includes(details)) {
                details.addEventListener("toggle", this.#handleToggle);
            }
        }

        this.#items = nextItems;
        this.#normalizeOpenState({
            itemStates: this.#getItemStates({ includeDataOpen: resetOpen }),
            resetOpen,
            preferredIndex,
        });
        this.#applyState();
    }

    #normalizeOpenState({ itemStates, resetOpen = false, preferredIndex = -1 }) {
        let openIndexes = [];

        if (resetOpen) {
            openIndexes = getInitialOpenAccordionIndexes(itemStates, {
                multiple: this.#isMultiple(),
                collapsible: this.#isCollapsible(),
            });
        } else if (this.#isMultiple()) {
            openIndexes = getOpenAccordionIndexes(itemStates);
        } else {
            openIndexes = getOpenAccordionIndexes(itemStates);

            if (
                preferredIndex !== -1
                && openIndexes.includes(preferredIndex)
                && !itemStates[preferredIndex]?.disabled
            ) {
                openIndexes = [preferredIndex];
            } else if (openIndexes.length > 0) {
                openIndexes = [openIndexes[0]];
            } else if (!this.#isCollapsible()) {
                const fallbackIndex = findFirstEnabledAccordionIndex(itemStates);

                if (fallbackIndex !== -1) {
                    openIndexes = [fallbackIndex];
                }
            }
        }

        const openIndexSet = new Set(openIndexes);

        this.#isSyncingState = true;

        try {
            for (let index = 0; index < this.#items.length; index += 1) {
                const details = this.#items[index].details;
                const open = !itemStates[index]?.disabled && openIndexSet.has(index);

                if (details.open !== open) {
                    details.open = open;
                }
            }
        } finally {
            this.#isSyncingState = false;
        }
    }

    #applyState() {
        for (const { details, summary } of this.#items) {
            const disabled = isAccordionItemDisabled(details);
            const open = !disabled && details.open;

            if (disabled && details.open) {
                details.open = false;
            }

            details.toggleAttribute("data-open", open);

            if (disabled) {
                summary.setAttribute("aria-disabled", "true");
                summary.tabIndex = -1;
            } else {
                summary.removeAttribute("aria-disabled");
                summary.tabIndex = 0;
            }
        }
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
