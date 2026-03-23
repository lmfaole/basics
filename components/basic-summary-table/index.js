import {
    TableElement,
    normalizeTableCellSpan,
    normalizeTableRowHeaderColumn,
} from "../basic-table/index.js";

const HTMLTableElementBase = globalThis.HTMLTableElement ?? class {};

export const SUMMARY_TABLE_TAG_NAME = "basic-summary-table";

const DEFAULT_TOTAL_LABEL = "Totalt";
const GENERATED_SUMMARY_ROW_ATTRIBUTE = "data-basic-summary-table-generated-row";
const GENERATED_SUMMARY_CELL_ATTRIBUTE = "data-basic-summary-table-generated-cell";
const GENERATED_SUMMARY_LABEL_ATTRIBUTE = "data-basic-summary-table-generated-label";

export function normalizeSummaryColumns(value) {
    if (!value?.trim()) {
        return [];
    }

    return Array.from(
        new Set(
            value
                .split(",")
                .map((part) => Number.parseInt(part.trim(), 10))
                .filter((column) => Number.isInteger(column) && column > 0),
        ),
    ).sort((left, right) => left - right);
}

export function normalizeSummaryTotalLabel(value) {
    return value?.trim() || DEFAULT_TOTAL_LABEL;
}

export function normalizeSummaryLocale(value) {
    return value?.trim() || undefined;
}

function getDecimalSeparator(value) {
    const text = value.trim();
    const lastComma = text.lastIndexOf(",");
    const lastDot = text.lastIndexOf(".");

    if (lastComma !== -1 && lastDot !== -1) {
        return lastComma > lastDot ? "," : ".";
    }

    if (lastComma !== -1) {
        const digitsAfter = text.length - lastComma - 1;
        return digitsAfter > 0 && digitsAfter <= 2 ? "," : null;
    }

    if (lastDot !== -1) {
        const digitsAfter = text.length - lastDot - 1;
        return digitsAfter > 0 && digitsAfter <= 2 ? "." : null;
    }

    return null;
}

function countFractionDigits(value) {
    const text = String(value ?? "").trim();

    if (!text) {
        return 0;
    }

    const decimalSeparator = getDecimalSeparator(text);

    if (!decimalSeparator) {
        return 0;
    }

    return text.length - text.lastIndexOf(decimalSeparator) - 1;
}

export function parseSummaryNumber(value) {
    const text = String(value ?? "").trim();

    if (!text) {
        return null;
    }

    const decimalSeparator = getDecimalSeparator(text);
    let normalized = text.replace(/[^\d,.\-]/g, "");

    if (!normalized || normalized === "-") {
        return null;
    }

    if (decimalSeparator === ",") {
        normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else if (decimalSeparator === ".") {
        normalized = normalized.replace(/,/g, "");
    } else {
        normalized = normalized.replace(/[.,]/g, "");
    }

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

export function formatSummaryNumber(value, { locale, fractionDigits = 0 } = {}) {
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
}

function findCellAtColumnIndex(row, targetColumnIndex) {
    let columnIndex = 0;

    for (const cell of Array.from(row.cells)) {
        const colSpan = normalizeTableCellSpan(cell.getAttribute("colspan"));

        if (targetColumnIndex >= columnIndex && targetColumnIndex < columnIndex + colSpan) {
            return cell;
        }

        columnIndex += colSpan;
    }

    return null;
}

function getTable(root) {
    const table = root.querySelector("table");
    return table instanceof HTMLTableElementBase && table.closest(root.tagName.toLowerCase()) === root
        ? table
        : null;
}

function getLogicalColumnCount(table) {
    let maxColumns = 0;

    for (const row of Array.from(table.rows)) {
        let columnCount = 0;

        for (const cell of Array.from(row.cells)) {
            columnCount += normalizeTableCellSpan(cell.getAttribute("colspan"));
        }

        maxColumns = Math.max(maxColumns, columnCount);
    }

    return maxColumns;
}

function getBodyRows(table) {
    if (table.tBodies.length > 0) {
        return Array.from(table.tBodies).flatMap((section) => Array.from(section.rows));
    }

    return Array.from(table.rows).filter(
        (row) => row.parentElement?.tagName !== "THEAD" && row.parentElement?.tagName !== "TFOOT",
    );
}

function collectSummaryColumns(table, configuredColumns, labelColumnIndex) {
    if (configuredColumns.length > 0) {
        return configuredColumns
            .map((column) => column - 1)
            .filter((column) => column >= 0 && column !== labelColumnIndex);
    }

    const inferredColumns = new Set();

    for (const row of getBodyRows(table)) {
        const logicalColumnCount = getLogicalColumnCount(table);

        for (let columnIndex = 0; columnIndex < logicalColumnCount; columnIndex += 1) {
            if (columnIndex === labelColumnIndex) {
                continue;
            }

            const cell = findCellAtColumnIndex(row, columnIndex);
            const rawValue = cell?.getAttribute("data-value") ?? cell?.textContent ?? "";

            if (parseSummaryNumber(rawValue) !== null) {
                inferredColumns.add(columnIndex);
            }
        }
    }

    return Array.from(inferredColumns).sort((left, right) => left - right);
}

function calculateSummaryTotals(table, summaryColumns) {
    const totals = new Map();

    for (const columnIndex of summaryColumns) {
        totals.set(columnIndex, {
            total: 0,
            fractionDigits: 0,
        });
    }

    for (const row of getBodyRows(table)) {
        for (const columnIndex of summaryColumns) {
            const cell = findCellAtColumnIndex(row, columnIndex);
            const rawValue = cell?.getAttribute("data-value") ?? cell?.textContent ?? "";
            const parsedValue = parseSummaryNumber(rawValue);

            if (parsedValue === null) {
                continue;
            }

            const current = totals.get(columnIndex);

            if (!current) {
                continue;
            }

            current.total += parsedValue;
            current.fractionDigits = Math.max(current.fractionDigits, countFractionDigits(rawValue));
        }
    }

    return totals;
}

function ensureGeneratedSummaryRow(table) {
    let tfoot = table.tFoot;

    if (!tfoot) {
        tfoot = document.createElement("tfoot");
        table.append(tfoot);
    }

    let row = tfoot.querySelector(`tr[${GENERATED_SUMMARY_ROW_ATTRIBUTE}]`);

    if (!row) {
        row = document.createElement("tr");
        row.setAttribute(GENERATED_SUMMARY_ROW_ATTRIBUTE, "");
        tfoot.append(row);
    }

    return row;
}

function removeGeneratedSummaryRow(table) {
    table.querySelector(`tr[${GENERATED_SUMMARY_ROW_ATTRIBUTE}]`)?.remove();
}

function syncSummaryFooter(table, {
    labelColumnIndex,
    locale,
    summaryColumns,
    totalLabel,
    totals,
}) {
    if (summaryColumns.length === 0) {
        removeGeneratedSummaryRow(table);
        return false;
    }

    const logicalColumnCount = getLogicalColumnCount(table);
    const effectiveLabelColumnIndex = Math.min(labelColumnIndex, Math.max(logicalColumnCount - 1, 0));
    const summaryColumnSet = new Set(summaryColumns.filter((column) => column < logicalColumnCount));
    const row = ensureGeneratedSummaryRow(table);

    row.replaceChildren();

    for (let columnIndex = 0; columnIndex < logicalColumnCount; columnIndex += 1) {
        if (columnIndex === effectiveLabelColumnIndex) {
            const labelCell = document.createElement("th");
            labelCell.scope = "row";
            labelCell.textContent = totalLabel;
            labelCell.setAttribute(GENERATED_SUMMARY_LABEL_ATTRIBUTE, "");
            row.append(labelCell);
            continue;
        }

        const valueCell = document.createElement("td");
        valueCell.setAttribute(GENERATED_SUMMARY_CELL_ATTRIBUTE, "");

        if (summaryColumnSet.has(columnIndex)) {
            const summary = totals.get(columnIndex) ?? { total: 0, fractionDigits: 0 };
            valueCell.textContent = formatSummaryNumber(summary.total, {
                locale,
                fractionDigits: summary.fractionDigits,
            });
            valueCell.dataset.value = String(summary.total);
            valueCell.dataset.summaryTotal = "";
        } else {
            valueCell.dataset.summaryEmpty = "";
        }

        row.append(valueCell);
    }

    return true;
}

export class SummaryTableElement extends TableElement {
    static observedAttributes = [
        ...TableElement.observedAttributes,
        "data-locale",
        "data-summary-columns",
        "data-total-label",
    ];

    #summaryObserver = null;
    #scheduledFrame = 0;

    connectedCallback() {
        super.connectedCallback();
        this.#syncSummaryObserver();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#summaryObserver?.disconnect();
        this.#summaryObserver = null;

        if (this.#scheduledFrame !== 0 && typeof window !== "undefined") {
            window.cancelAnimationFrame(this.#scheduledFrame);
            this.#scheduledFrame = 0;
        }
    }

    refresh() {
        super.refresh();

        const table = getTable(this);

        if (!(table instanceof HTMLTableElementBase)) {
            return;
        }

        const labelColumnIndex = normalizeTableRowHeaderColumn(
            this.getAttribute("data-row-header-column"),
        ) - 1;
        const summaryColumns = collectSummaryColumns(
            table,
            normalizeSummaryColumns(this.getAttribute("data-summary-columns")),
            labelColumnIndex,
        );
        const totals = calculateSummaryTotals(table, summaryColumns);

        syncSummaryFooter(table, {
            labelColumnIndex,
            locale: normalizeSummaryLocale(this.getAttribute("data-locale")),
            summaryColumns,
            totalLabel: normalizeSummaryTotalLabel(this.getAttribute("data-total-label")),
            totals,
        });

        super.refresh();
    }

    #scheduleRefresh() {
        if (this.#scheduledFrame !== 0 || typeof window === "undefined") {
            return;
        }

        this.#scheduledFrame = window.requestAnimationFrame(() => {
            this.#scheduledFrame = 0;
            this.refresh();
        });
    }

    #syncSummaryObserver() {
        if (this.#summaryObserver || typeof MutationObserver === "undefined") {
            return;
        }

        this.#summaryObserver = new MutationObserver(() => {
            this.#scheduleRefresh();
        });

        this.#summaryObserver.observe(this, {
            subtree: true,
            attributes: true,
            attributeFilter: ["data-value"],
        });
    }
}

export function defineSummaryTable(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return SummaryTableElement;
    }

    if (!registry.get(SUMMARY_TABLE_TAG_NAME)) {
        registry.define(SUMMARY_TABLE_TAG_NAME, SummaryTableElement);
    }

    return SummaryTableElement;
}
