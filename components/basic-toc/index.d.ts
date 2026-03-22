/**
 * Normalized heading data collected from the nearest `<main>`.
 */
export interface TableOfContentsHeading {
    id: string;
    text: string;
    level: number;
}

/**
 * Nested outline item returned by `buildTableOfContentsTree`.
 */
export interface TableOfContentsItem extends TableOfContentsHeading {
    children: TableOfContentsItem[];
}

/**
 * Public tag name registered by `defineTableOfContents`.
 */
export const TABLE_OF_CONTENTS_TAG_NAME: "basic-toc";

/**
 * Collapses repeated whitespace and trims the result.
 */
export function normalizeHeadingText(text: string): string;
/**
 * Converts heading text into a stable fragment id.
 */
export function slugifyHeading(text: string): string;
/**
 * Returns a unique heading id and stores it in the provided set.
 */
export function createUniqueHeadingId(baseText: string, usedIds: Set<string>): string;
/**
 * Converts a flat heading list into a nested outline tree.
 */
export function buildTableOfContentsTree(
    headings: TableOfContentsHeading[],
): TableOfContentsItem[];

/**
 * Custom element that renders a heading outline into a descendant
 * `[data-page-toc-nav]` container.
 *
 * Attributes:
 * - `data-title`: aria-label for the generated nav. Defaults to `"Innhold"`.
 * - `data-heading-selector`: CSS selector used to collect headings from the nearest `<main>`.
 */
export class TableOfContentsElement extends HTMLElement {
    static observedAttributes: string[];
}

/**
 * Registers the `basic-toc` custom element if it is not already defined.
 */
export function defineTableOfContents(
    registry?: CustomElementRegistry,
): typeof TableOfContentsElement;
