export const TABLE_TAG_NAME: "basic-table";

/**
 * Normalizes unsupported or empty labels back to the default `"Tabell"`.
 */
export function normalizeTableLabel(
    value?: string | null,
): string;

/**
 * Normalizes the generated caption text. Empty values disable caption generation.
 */
export function normalizeTableCaption(
    value?: string | null,
): string;

/**
 * Normalizes the generated description text. Empty values disable description generation.
 */
export function normalizeTableDescription(
    value?: string | null,
): string;

/**
 * Normalizes the root `data-row-headers` attribute into a boolean flag.
 */
export function normalizeTableRowHeaders(
    value?: string | boolean | null,
): boolean;

/**
 * Normalizes the root `data-column-headers` attribute into a boolean flag.
 */
export function normalizeTableColumnHeaders(
    value?: string | boolean | null,
): boolean;

/**
 * Normalizes invalid row-header-column values back to `1`.
 */
export function normalizeTableRowHeaderColumn(
    value?: string | null,
): number;

/**
 * Normalizes invalid `rowspan` and `colspan` values back to `1`.
 */
export function normalizeTableCellSpan(
    value?: string | null,
): number;

/**
 * Custom element that upgrades existing table markup with stronger accessible
 * naming and header associations.
 *
 * Attributes:
 * - `data-caption`: optional generated `<caption>` text when the table has none
 * - `data-column-headers`: promotes the first row to column headers
 * - `data-description`: optional generated description wired through `aria-describedby`
 * - `data-label`: fallback accessible name when the table has neither a caption
 *   nor its own label
 * - `data-row-header-column`: one-based column index to use for generated row headers
 * - `data-row-headers`: promotes the first cell in each body row to a row header
 */
export class TableElement extends HTMLElement {
    static observedAttributes: string[];
    refresh(): void;
}

/**
 * Registers the `basic-table` custom element if it is not already defined.
 */
export function defineTable(
    registry?: CustomElementRegistry,
): typeof TableElement;
