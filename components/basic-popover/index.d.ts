export const POPOVER_TAG_NAME: "basic-popover";

/**
 * Normalizes unsupported or empty labels back to the default `"Popover"`.
 */
export function normalizePopoverLabel(
    value?: string | null,
): string;

/**
 * Normalizes the root `data-anchor-trigger` attribute into a boolean flag.
 */
export function normalizePopoverAnchorTrigger(
    value?: string | null,
): boolean;

/**
 * Normalizes unsupported or empty position-area values back to `"bottom"`.
 */
export function normalizePopoverPositionArea(
    value?: string | null,
): string;

/**
 * Returns the built-in fallback sequence used for a given default anchored placement.
 */
export function getDefaultPopoverPositionTryFallbacks(
    positionArea?: string | null,
): string;

/**
 * Normalizes custom fallback values and otherwise returns the built-in fallback
 * sequence derived from the default position area.
 */
export function normalizePopoverPositionTryFallbacks(
    value?: string | null,
    positionArea?: string | null,
): string;

/**
 * Returns whether the managed popover panel is currently open.
 */
export function isPopoverOpen(
    panel: HTMLElement | null | undefined,
): boolean;

/**
 * Custom element that upgrades popover trigger-and-panel markup into a
 * non-modal overlay flow.
 *
 * Attributes:
 * - `data-anchor-trigger`: establishes the opener as the popover's implicit anchor
 * - `data-label`: fallback accessible name when the popover has no title
 * - `data-position-area`: CSS anchor-positioning area to use when anchoring is enabled
 * - `data-position-try-fallbacks`: optional CSS fallback list to try when the
 *   default anchored position would overflow
 */
export class PopoverElement extends HTMLElement {
    static observedAttributes: string[];
    show(opener?: HTMLElement | null): boolean;
    hide(): boolean;
    toggle(opener?: HTMLElement | null): boolean;
}

/**
 * Registers the `basic-popover` custom element if it is not already defined.
 */
export function definePopover(
    registry?: CustomElementRegistry,
): typeof PopoverElement;
