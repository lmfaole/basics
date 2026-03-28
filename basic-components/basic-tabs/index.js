const ElementBase = globalThis.Element ?? class {};
const HTMLElementBase = globalThis.HTMLElement ?? class {};
const HTMLButtonElementBase = globalThis.HTMLButtonElement ?? class {};

export const TABS_TAG_NAME = "basic-tabs";

const DEFAULT_LABEL = "Faner";
const DEFAULT_ACTIVATION = "automatic";
const DEFAULT_ORIENTATION = "horizontal";
const MANUAL_ACTIVATION = "manual";
const TABLIST_SELECTOR = "[data-tabs-list]";
const TAB_SELECTOR = "[data-tab]";
const PANEL_SELECTOR = "[data-tab-panel]";

let nextTabsInstanceId = 1;

export function normalizeTabsOrientation(value) {
    return DEFAULT_ORIENTATION;
}

export function normalizeTabsActivation(value) {
    return value?.trim().toLowerCase() === MANUAL_ACTIVATION
        ? MANUAL_ACTIVATION
        : DEFAULT_ACTIVATION;
}

export function getInitialSelectedTabIndex(tabStates) {
    for (let index = 0; index < tabStates.length; index += 1) {
        const tabState = tabStates[index];

        if (tabState?.selected && !tabState.disabled) {
            return index;
        }
    }

    return findFirstEnabledTabIndex(tabStates);
}

export function findNextEnabledTabIndex(tabStates, startIndex, direction) {
    if (tabStates.length === 0) {
        return -1;
    }

    const step = direction < 0 ? -1 : 1;
    let nextIndex = startIndex;

    for (let checked = 0; checked < tabStates.length; checked += 1) {
        nextIndex += step;

        if (nextIndex < 0) {
            nextIndex = tabStates.length - 1;
        } else if (nextIndex >= tabStates.length) {
            nextIndex = 0;
        }

        if (!tabStates[nextIndex]?.disabled) {
            return nextIndex;
        }
    }

    return -1;
}

function collectOwnedElements(root, scope, selector) {
    return Array.from(scope.querySelectorAll(selector)).filter(
        (element) => element instanceof HTMLElementBase && element.closest(TABS_TAG_NAME) === root,
    );
}

function isTabDisabled(tab) {
    return tab.hasAttribute("disabled") || tab.getAttribute("aria-disabled") === "true";
}

function findFirstEnabledTabIndex(tabStates) {
    for (let index = 0; index < tabStates.length; index += 1) {
        if (!tabStates[index]?.disabled) {
            return index;
        }
    }

    return -1;
}

function findLastEnabledTabIndex(tabStates) {
    for (let index = tabStates.length - 1; index >= 0; index -= 1) {
        if (!tabStates[index]?.disabled) {
            return index;
        }
    }

    return -1;
}

export class TabsElement extends HTMLElementBase {
    static observedAttributes = [
        "data-activation",
        "data-label",
        "data-selected-index",
    ];

    #instanceId = `${TABS_TAG_NAME}-${nextTabsInstanceId++}`;
    #tabList = null;
    #tabs = [];
    #panels = [];
    #selectedIndex = -1;
    #focusIndex = -1;
    #eventsBound = false;

    connectedCallback() {
        if (!this.#eventsBound) {
            this.addEventListener("click", this.#handleClick);
            this.addEventListener("keydown", this.#handleKeyDown);
            this.#eventsBound = true;
        }

        this.#sync({ resetSelection: true });
    }

    disconnectedCallback() {
        if (!this.#eventsBound) {
            return;
        }

        this.removeEventListener("click", this.#handleClick);
        this.removeEventListener("keydown", this.#handleKeyDown);
        this.#eventsBound = false;
    }

    attributeChangedCallback(name) {
        this.#sync({ resetSelection: name === "data-selected-index" });
    }

    #handleClick = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const tab = event.target.closest(TAB_SELECTOR);

        if (!(tab instanceof HTMLElementBase) || tab.closest(TABS_TAG_NAME) !== this) {
            return;
        }

        const tabIndex = this.#tabs.indexOf(tab);

        if (tabIndex === -1) {
            return;
        }

        this.#selectTab(tabIndex, { focus: true });
    };

    #handleKeyDown = (event) => {
        if (!(event.target instanceof ElementBase)) {
            return;
        }

        const currentTab = event.target.closest(TAB_SELECTOR);

        if (!(currentTab instanceof HTMLElementBase) || currentTab.closest(TABS_TAG_NAME) !== this) {
            return;
        }

        const tabStates = this.#getTabStates();
        const currentIndex = this.#tabs.indexOf(currentTab);
        const activation = this.#getActivation();
        let nextIndex = -1;

        if (currentIndex === -1 || currentIndex >= tabStates.length) {
            return;
        }

        switch (event.key) {
            case "ArrowRight":
                nextIndex = findNextEnabledTabIndex(tabStates, currentIndex, 1);
                break;
            case "ArrowLeft":
                nextIndex = findNextEnabledTabIndex(tabStates, currentIndex, -1);
                break;
            case "Home":
                nextIndex = findFirstEnabledTabIndex(tabStates);
                break;
            case "End":
                nextIndex = findLastEnabledTabIndex(tabStates);
                break;
            case " ":
            case "Enter":
                event.preventDefault();
                this.#selectTab(this.#focusIndex === -1 ? currentIndex : this.#focusIndex, { focus: true });
                return;
            default:
                return;
        }

        if (nextIndex === -1) {
            return;
        }

        event.preventDefault();

        if (activation === MANUAL_ACTIVATION) {
            this.#focusIndex = nextIndex;
            this.#applyState({ focus: true });
            return;
        }

        this.#selectTab(nextIndex, { focus: true });
    };

    #getActivation() {
        return normalizeTabsActivation(this.getAttribute("data-activation"));
    }

    #getConfiguredSelectedIndex(tabStates) {
        const selectedIndex = Number.parseInt(
            this.getAttribute("data-selected-index") ?? "",
            10,
        );

        if (
            Number.isInteger(selectedIndex)
            && selectedIndex >= 0
            && selectedIndex < tabStates.length
            && !tabStates[selectedIndex]?.disabled
        ) {
            return selectedIndex;
        }

        return getInitialSelectedTabIndex(tabStates);
    }

    #getLabel() {
        return this.getAttribute("data-label")?.trim() || DEFAULT_LABEL;
    }

    #getTabStates(configuredSelectedIndex = null) {
        const pairCount = Math.min(this.#tabs.length, this.#panels.length);

        return this.#tabs.slice(0, pairCount).map((tab, index) => ({
            disabled: isTabDisabled(tab),
            selected: index === configuredSelectedIndex
                || tab.hasAttribute("data-selected")
                || tab.getAttribute("aria-selected") === "true",
        }));
    }

    #sync({ resetSelection = false } = {}) {
        this.#tabList = collectOwnedElements(this, this, TABLIST_SELECTOR)[0] ?? null;
        this.#tabs = this.#tabList
            ? collectOwnedElements(this, this.#tabList, TAB_SELECTOR)
            : [];
        this.#panels = collectOwnedElements(this, this, PANEL_SELECTOR).filter(
            (panel) => !this.#tabList?.contains(panel),
        );

        const tabStates = this.#getTabStates();

        if (resetSelection || this.#selectedIndex === -1 || tabStates[this.#selectedIndex]?.disabled) {
            this.#selectedIndex = this.#getConfiguredSelectedIndex(tabStates);
        }

        if (resetSelection || this.#focusIndex === -1 || tabStates[this.#focusIndex]?.disabled) {
            this.#focusIndex = this.#selectedIndex;
        }

        this.#applyState();
    }

    #applyState({ focus = false } = {}) {
        if (!(this.#tabList instanceof HTMLElementBase)) {
            return;
        }

        const pairCount = Math.min(this.#tabs.length, this.#panels.length);
        const baseId = this.id || this.#instanceId;

        if (!this.#tabList.hasAttribute("aria-label") && !this.#tabList.hasAttribute("aria-labelledby")) {
            this.#tabList.setAttribute("aria-label", this.#getLabel());
        }

        this.#tabList.setAttribute("role", "tablist");
        this.#tabList.setAttribute("aria-orientation", DEFAULT_ORIENTATION);

        for (let index = 0; index < this.#tabs.length; index += 1) {
            const tab = this.#tabs[index];
            const panel = index < pairCount ? this.#panels[index] : null;
            const disabled = index >= pairCount || isTabDisabled(tab);
            const selected = index === this.#selectedIndex && !disabled;
            const focusable = index === this.#focusIndex && !disabled;

            if (!tab.id) {
                tab.id = `${baseId}-tab-${index + 1}`;
            }

            if (tab instanceof HTMLButtonElementBase && !tab.hasAttribute("type")) {
                tab.type = "button";
            }

            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = focusable ? 0 : -1;
            tab.toggleAttribute("data-selected", selected);

            if (panel) {
                if (!panel.id) {
                    panel.id = `${baseId}-panel-${index + 1}`;
                }

                tab.setAttribute("aria-controls", panel.id);
            } else {
                tab.removeAttribute("aria-controls");
            }
        }

        for (let index = 0; index < this.#panels.length; index += 1) {
            const panel = this.#panels[index];
            const tab = this.#tabs[index];
            const selected = index === this.#selectedIndex && index < pairCount;

            if (!panel.id) {
                panel.id = `${baseId}-panel-${index + 1}`;
            }

            panel.setAttribute("role", "tabpanel");

            if (tab?.id) {
                panel.setAttribute("aria-labelledby", tab.id);
            } else {
                panel.removeAttribute("aria-labelledby");
            }

            panel.hidden = !selected;
            panel.toggleAttribute("data-selected", selected);
        }

        if (focus && this.#focusIndex !== -1) {
            this.#tabs[this.#focusIndex]?.focus();
        }
    }

    #selectTab(index, { focus = false } = {}) {
        const tabStates = this.#getTabStates();

        if (index < 0 || index >= tabStates.length || tabStates[index]?.disabled) {
            return;
        }

        this.#selectedIndex = index;
        this.#focusIndex = index;
        this.#applyState({ focus });
    }
}

export function defineTabs(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return TabsElement;
    }

    if (!registry.get(TABS_TAG_NAME)) {
        registry.define(TABS_TAG_NAME, TabsElement);
    }

    return TabsElement;
}
