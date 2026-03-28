import type { TableElement } from "../basic-table";

export const SUMMARY_TABLE_TAG_NAME: "basic-summary-table";

/**
 * Normalizes configured summary columns from a comma-separated one-based list.
 */
export function normalizeSummaryColumns(
    value?: string | null,
): number[];

/**
 * Normalizes the generated footer row label back to `"Totalt"`.
 */
export function normalizeSummaryTotalLabel(
    value?: string | null,
): string;

/**
 * Normalizes the optional `Intl.NumberFormat` locale.
 */
export function normalizeSummaryLocale(
    value?: string | null,
): string | undefined;

/**
 * Parses common formatted number strings such as `1,200.50` or `1 200,50`.
 */
export function parseSummaryNumber(
    value?: string | number | null,
): number | null;

/**
 * Formats a summary value for footer display.
 */
export function formatSummaryNumber(
    value: number,
    options?: {
        locale?: string;
        fractionDigits?: number;
    },
): string;

/**
 * Custom element that upgrades a regular summary table with generated footer
 * totals.
 *
 * Attributes:
 * - `data-caption`: optional generated `<caption>` text when the table has none
 * - `data-description`: optional generated description wired through `aria-describedby`
 * - `data-label`: fallback accessible name when the table has neither a caption
 *   nor its own label
 * - `data-row-headers`: enables generated row headers in tbody rows
 * - `data-row-header-column`: one-based body column used for row headers
 * - `data-summary-columns`: optional comma-separated one-based columns to total
 * - `data-total-label`: label text used for the generated footer row
 * - `data-locale`: optional locale used to format footer totals
 */
export class SummaryTableElement extends TableElement {
    static observedAttributes: string[];
    refresh(): void;
}

/**
 * Registers the `basic-summary-table` custom element if it is not already defined.
 */
export function defineSummaryTable(
    registry?: CustomElementRegistry,
): typeof SummaryTableElement;
