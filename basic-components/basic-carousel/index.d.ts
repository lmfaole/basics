export const CAROUSEL_TAG_NAME: "basic-carousel";
export type CarouselControls = "both" | "markers" | "arrows" | "none";
export type CarouselSnapping = "start" | "center" | "end";

export interface CarouselScrollOptions {
    behavior?: ScrollBehavior | null;
    snapping?: CarouselSnapping | string | null;
}

/**
 * Normalizes unsupported or empty labels back to the default `"Carousel"`.
 */
export function normalizeCarouselLabel(
    value?: string | null,
): string;

/**
 * Normalizes carousel controls to `"both"`, `"markers"`, `"arrows"`, or `"none"`.
 */
export function normalizeCarouselControls(
    value?: string | null,
): CarouselControls;

/**
 * Normalizes scroll behaviors to `"auto"` or `"smooth"`.
 */
export function normalizeCarouselScrollBehavior(
    value?: string | null,
): ScrollBehavior;

/**
 * Normalizes snap positions to `"start"`, `"center"`, or `"end"`.
 */
export function normalizeCarouselSnapping(
    value?: string | null,
): CarouselSnapping;

/**
 * Clamps a requested item index into the available carousel range.
 */
export function clampCarouselIndex(
    index: number,
    itemCount: number,
): number;

/**
 * Custom element that upgrades a scroll-snap track into a named carousel region
 * and annotates each slide for CSS-native scroll buttons and markers.
 *
 * Attributes:
 * - `data-label`: fallback accessible name for the carousel region
 * - `data-controls`: show generated markers, arrows, both, or no generated controls where supported
 * - `data-snapping`: align slides to the start, center, or end of the scrollport
 *
 * Descendant hooks:
 * - one `[data-carousel-track]` scroll container
 * - direct child items inside that track
 * - optional `data-carousel-marker-label` on each item for custom marker names
 */
export class CarouselElement extends HTMLElement {
    static observedAttributes: string[];
    get track(): HTMLElement | null;
    get items(): HTMLElement[];
    refresh(): number;
    scrollToItem(index: number, options?: CarouselScrollOptions): boolean;
}

/**
 * Registers the `basic-carousel` custom element if it is not already defined.
 */
export function defineCarousel(
    registry?: CustomElementRegistry,
): typeof CarouselElement;
