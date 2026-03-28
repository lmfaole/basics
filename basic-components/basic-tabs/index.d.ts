export interface TabsTabState {
    disabled: boolean;
    selected?: boolean;
}

export type TabsActivation = "automatic" | "manual";
export type TabsOrientation = "horizontal";

/**
 * Public tag name registered by `defineTabs`.
 */
export const TABS_TAG_NAME: "basic-tabs";

/**
 * Normalizes orientation values back to `"horizontal"`.
 */
export function normalizeTabsOrientation(
    value?: string | null,
): TabsOrientation;

/**
 * Normalizes unsupported activation values back to `"automatic"`.
 */
export function normalizeTabsActivation(
    value?: string | null,
): TabsActivation;

/**
 * Returns the initially active tab index, preferring an explicitly selected,
 * enabled tab and otherwise falling back to the first enabled one.
 */
export function getInitialSelectedTabIndex(
    tabStates: TabsTabState[],
): number;

/**
 * Returns the next enabled tab index, wrapping around the list when needed.
 */
export function findNextEnabledTabIndex(
    tabStates: TabsTabState[],
    startIndex: number,
    direction: number,
): number;

/**
 * Custom element that upgrades existing button-and-panel markup into
 * an accessible tabs interface.
 *
 * Attributes:
 * - `data-label`: fallback accessible name when the tablist has no own label
 * - `data-activation`: `automatic` or `manual`
 * - `data-selected-index`: zero-based initially selected tab index
 */
export class TabsElement extends HTMLElement {
    static observedAttributes: string[];
}

/**
 * Registers the `basic-tabs` custom element if it is not already defined.
 */
export function defineTabs(
    registry?: CustomElementRegistry,
): typeof TabsElement;
