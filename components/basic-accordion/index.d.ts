export interface AccordionItemState {
    disabled: boolean;
    open?: boolean;
}

/**
 * Public tag name registered by `defineAccordion`.
 */
export const ACCORDION_TAG_NAME: "basic-accordion";

/**
 * Returns the initially open accordion item indexes based on explicit state and
 * the root element's single-open or collapsible behavior.
 */
export function getInitialOpenAccordionIndexes(
    itemStates: AccordionItemState[],
    options?: {
        multiple?: boolean;
        collapsible?: boolean;
    },
): number[];

/**
 * Returns the next enabled accordion trigger index, wrapping around the list
 * when needed.
 */
export function findNextEnabledAccordionIndex(
    itemStates: AccordionItemState[],
    startIndex: number,
    direction: number,
): number;

/**
 * Custom element that upgrades existing trigger-and-panel markup into an
 * accessible accordion interface.
 *
 * Attributes:
 * - `data-multiple`: allows multiple panels to stay open
 * - `data-collapsible`: allows the last open panel in single mode to close
 */
export class AccordionElement extends HTMLElement {
    static observedAttributes: string[];
}

/**
 * Registers the `basic-accordion` custom element if it is not already defined.
 */
export function defineAccordion(
    registry?: CustomElementRegistry,
): typeof AccordionElement;
