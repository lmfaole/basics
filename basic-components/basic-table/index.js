const HTMLElementBase = globalThis.HTMLElement ?? class {};
const HTMLTableElementBase = globalThis.HTMLTableElement ?? class {};
const HTMLTableSectionElementBase = globalThis.HTMLTableSectionElement ?? class {};
const HTMLTableCellElementBase = globalThis.HTMLTableCellElement ?? class {};

export const TABLE_TAG_NAME = "basic-table";

const DEFAULT_LABEL = "Tabell";
const GENERATED_CAPTION_ATTRIBUTE = "data-basic-table-generated-caption";
const GENERATED_COLUMN_HEADER_ATTRIBUTE = "data-basic-table-generated-column-header";
const GENERATED_ROW_HEADER_ATTRIBUTE = "data-basic-table-generated-row-header";
const GENERATED_DESCRIPTION_ATTRIBUTE = "data-basic-table-generated-description";
const MANAGED_HEADERS_ATTRIBUTE = "data-basic-table-managed-headers";
const MANAGED_LABEL_ATTRIBUTE = "data-basic-table-managed-label";
const TABLE_OBSERVER_OPTIONS = {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
        "aria-describedby",
        "aria-label",
        "aria-labelledby",
        "colspan",
        "headers",
        "id",
        "rowspan",
        "scope",
    ],
};

let nextTableInstanceId = 1;

export function normalizeTableLabel(value) {
    return value?.trim() || DEFAULT_LABEL;
}

export function normalizeTableCaption(value) {
    return value?.trim() || "";
}

export function normalizeTableDescription(value) {
    return value?.trim() || "";
}

export function normalizeTableRowHeaders(value) {
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized !== "false" && normalized !== "0";
    }

    return Boolean(value);
}

export function normalizeTableColumnHeaders(value) {
    return normalizeTableRowHeaders(value);
}

export function normalizeTableRowHeaderColumn(value) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function normalizeTableCellSpan(value) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function collectOwnedTables(root) {
    return Array.from(root.querySelectorAll("table")).filter(
        (table) => table instanceof HTMLTableElementBase && table.closest(root.tagName.toLowerCase()) === root,
    );
}

function inferHeaderScope(
    cell,
    placement,
    { columnHeadersEnabled = false, rowHeadersEnabled = false, rowHeaderColumnIndex = 0 } = {},
) {
    const explicitScope = cell.getAttribute("scope")?.trim().toLowerCase();

    if (explicitScope) {
        return explicitScope;
    }

    if (cell.hasAttribute(GENERATED_COLUMN_HEADER_ATTRIBUTE)) {
        return "col";
    }

    if (placement.sectionTag === "thead") {
        return "col";
    }

    if (columnHeadersEnabled && placement.rowIndex === 0) {
        return "col";
    }

    if (
        rowHeadersEnabled
        && placement.sectionTag === "tbody"
        && placement.columnIndex <= rowHeaderColumnIndex
        && placement.columnIndex + placement.colSpan > rowHeaderColumnIndex
    ) {
        return "row";
    }

    return "";
}

function ensureHeaderId(cell, baseId, nextHeaderIndex) {
    if (!cell.id) {
        cell.id = `${baseId}-header-${nextHeaderIndex}`;
    }

    return cell.id;
}

function sortPlacementsInDocumentOrder(left, right) {
    if (left.rowIndex !== right.rowIndex) {
        return left.rowIndex - right.rowIndex;
    }

    return left.columnIndex - right.columnIndex;
}

function buildTablePlacements(table) {
    const rows = Array.from(table.rows);
    const grid = [];
    const placements = [];

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex];
        let columnIndex = 0;

        grid[rowIndex] ??= [];

        for (const cell of Array.from(row.cells)) {
            if (!(cell instanceof HTMLTableCellElementBase)) {
                continue;
            }

            while (grid[rowIndex][columnIndex]) {
                columnIndex += 1;
            }

            const rowSpan = normalizeTableCellSpan(cell.getAttribute("rowspan"));
            const colSpan = normalizeTableCellSpan(cell.getAttribute("colspan"));
            const section = row.parentElement;
            const sectionTag = section instanceof HTMLTableSectionElementBase
                ? section.tagName.toLowerCase()
                : "table";

            const placement = {
                cell,
                rowIndex,
                columnIndex,
                rowSpan,
                colSpan,
                sectionTag,
            };

            placements.push(placement);

            for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
                grid[rowIndex + rowOffset] ??= [];

                for (let columnOffset = 0; columnOffset < colSpan; columnOffset += 1) {
                    grid[rowIndex + rowOffset][columnIndex + columnOffset] = placement;
                }
            }

            columnIndex += colSpan;
        }
    }

    return placements;
}

function findCellAtColumnIndex(row, targetColumnIndex) {
    let columnIndex = 0;

    for (const cell of Array.from(row.cells)) {
        if (!(cell instanceof HTMLTableCellElementBase)) {
            continue;
        }

        const colSpan = normalizeTableCellSpan(cell.getAttribute("colspan"));

        if (targetColumnIndex >= columnIndex && targetColumnIndex < columnIndex + colSpan) {
            return cell;
        }

        columnIndex += colSpan;
    }

    return null;
}

function replaceCellTag(cell, tagName, generatedAttributeName) {
    const replacement = document.createElement(tagName);

    for (const attribute of Array.from(cell.attributes)) {
        if (attribute.name === "headers" || attribute.name === MANAGED_HEADERS_ATTRIBUTE) {
            continue;
        }

        replacement.setAttribute(attribute.name, attribute.value);
    }

    replacement.setAttribute(generatedAttributeName, "");
    replacement.replaceChildren(...Array.from(cell.childNodes));
    cell.parentElement?.replaceChild(replacement, cell);

    return replacement;
}

function demoteManagedHeaderCell(cell, generatedAttributeName) {
    const replacement = document.createElement("td");

    for (const attribute of Array.from(cell.attributes)) {
        if (attribute.name === generatedAttributeName || attribute.name === "scope") {
            continue;
        }

        replacement.setAttribute(attribute.name, attribute.value);
    }

    replacement.replaceChildren(...Array.from(cell.childNodes));
    cell.parentElement?.replaceChild(replacement, cell);
}

function promoteFirstRowCellsToHeaders(table) {
    const firstRow = table.rows[0];

    if (!firstRow) {
        return;
    }

    for (const cell of Array.from(firstRow.cells)) {
        if (!(cell instanceof HTMLTableCellElementBase) || cell.tagName === "TH") {
            continue;
        }

        replaceCellTag(cell, "th", GENERATED_COLUMN_HEADER_ATTRIBUTE);
    }
}

function demoteManagedHeaders(table, generatedAttributeName) {
    for (const cell of Array.from(table.querySelectorAll(`th[${generatedAttributeName}]`))) {
        if (!(cell instanceof HTMLTableCellElementBase)) {
            continue;
        }

        demoteManagedHeaderCell(cell, generatedAttributeName);
    }
}

function syncBodyRowHeaders(table, rowHeaderColumnIndex, rowHeadersEnabled) {
    for (const section of Array.from(table.tBodies)) {
        for (const row of Array.from(section.rows)) {
            const targetCell = rowHeadersEnabled
                ? findCellAtColumnIndex(row, rowHeaderColumnIndex)
                : null;

            for (const cell of Array.from(row.cells)) {
                if (
                    !(cell instanceof HTMLTableCellElementBase)
                    || !cell.hasAttribute(GENERATED_ROW_HEADER_ATTRIBUTE)
                    || cell === targetCell
                ) {
                    continue;
                }

                demoteManagedHeaderCell(cell, GENERATED_ROW_HEADER_ATTRIBUTE);
            }

            if (!(targetCell instanceof HTMLTableCellElementBase) || targetCell.tagName === "TH") {
                continue;
            }

            replaceCellTag(targetCell, "th", GENERATED_ROW_HEADER_ATTRIBUTE);
        }
    }
}

function createGeneratedCaption(table) {
    const caption = document.createElement("caption");
    caption.setAttribute(GENERATED_CAPTION_ATTRIBUTE, "");
    table.insertBefore(caption, table.firstChild);
    return caption;
}

function syncTextContent(node, text) {
    if (node.textContent !== text) {
        node.textContent = text;
    }
}

function syncTableCaption(table, captionText) {
    const existingCaption = table.caption;
    const generatedCaption = existingCaption?.hasAttribute(GENERATED_CAPTION_ATTRIBUTE)
        ? existingCaption
        : null;

    if (!captionText) {
        generatedCaption?.remove();
        return;
    }

    if (existingCaption && !generatedCaption) {
        return;
    }

    const caption = generatedCaption ?? createGeneratedCaption(table);
    syncTextContent(caption, captionText);
}

function syncFallbackAccessibleName(table, label) {
    const hasCaption = Boolean(table.caption);
    const hasManagedLabel = table.hasAttribute(MANAGED_LABEL_ATTRIBUTE);
    const hasOwnAriaLabel = table.hasAttribute("aria-label") && !hasManagedLabel;
    const hasOwnLabelledBy = table.hasAttribute("aria-labelledby");

    if (hasCaption || hasOwnAriaLabel || hasOwnLabelledBy) {
        if (hasManagedLabel) {
            table.removeAttribute("aria-label");
            table.removeAttribute(MANAGED_LABEL_ATTRIBUTE);
        }

        return;
    }

    if (table.getAttribute("aria-label") !== label) {
        table.setAttribute("aria-label", label);
    }

    if (!hasManagedLabel) {
        table.setAttribute(MANAGED_LABEL_ATTRIBUTE, "");
    }
}

function getGeneratedDescription(root) {
    const description = root.querySelector(`[${GENERATED_DESCRIPTION_ATTRIBUTE}]`);
    return description instanceof HTMLElementBase && description.closest(root.tagName.toLowerCase()) === root
        ? description
        : null;
}

function getAriaReferenceTokens(value) {
    return value?.trim() ? value.trim().split(/\s+/) : [];
}

function syncTableDescription(root, table, descriptionText, baseId) {
    const existingDescription = getGeneratedDescription(root);

    if (!descriptionText) {
        if (existingDescription?.id) {
            const tokens = getAriaReferenceTokens(table.getAttribute("aria-describedby")).filter(
                (token) => token !== existingDescription.id,
            );

            if (tokens.length > 0) {
                const nextValue = tokens.join(" ");

                if (table.getAttribute("aria-describedby") !== nextValue) {
                    table.setAttribute("aria-describedby", nextValue);
                }
            } else {
                table.removeAttribute("aria-describedby");
            }
        }

        existingDescription?.remove();
        return;
    }

    const description = existingDescription ?? document.createElement("p");

    if (!existingDescription) {
        description.setAttribute(GENERATED_DESCRIPTION_ATTRIBUTE, "");
        description.hidden = true;
        root.append(description);
    }

    if (!description.id) {
        description.id = `${baseId}-description`;
    }

    syncTextContent(description, descriptionText);

    const tokens = getAriaReferenceTokens(table.getAttribute("aria-describedby")).filter(
        (token) => token !== description.id,
    );
    tokens.push(description.id);
    const nextValue = tokens.join(" ");

    if (table.getAttribute("aria-describedby") !== nextValue) {
        table.setAttribute("aria-describedby", nextValue);
    }
}

export class TableElement extends HTMLElementBase {
    static observedAttributes = [
        "data-caption",
        "data-column-headers",
        "data-description",
        "data-label",
        "data-row-header-column",
        "data-row-headers",
    ];

    #instanceId = `${TABLE_TAG_NAME}-${nextTableInstanceId++}`;
    #observer = null;
    #observing = false;
    #scheduledFrame = 0;

    connectedCallback() {
        this.#syncObserver();
        this.refresh();
    }

    disconnectedCallback() {
        this.#stopObserving();
        this.#observer = null;

        if (this.#scheduledFrame !== 0 && typeof window !== "undefined") {
            window.cancelAnimationFrame(this.#scheduledFrame);
            this.#scheduledFrame = 0;
        }
    }

    attributeChangedCallback() {
        this.#scheduleRefresh();
    }

    refresh() {
        this.#stopObserving();

        try {
            const table = collectOwnedTables(this)[0] ?? null;

            if (!(table instanceof HTMLTableElementBase)) {
                return;
            }

            const label = normalizeTableLabel(this.getAttribute("data-label"));
            const caption = normalizeTableCaption(this.getAttribute("data-caption"));
            const description = normalizeTableDescription(this.getAttribute("data-description"));
            const columnHeadersEnabled = normalizeTableColumnHeaders(
                this.getAttribute("data-column-headers") ?? this.hasAttribute("data-column-headers"),
            );
            const rowHeaderColumnIndex = normalizeTableRowHeaderColumn(
                this.getAttribute("data-row-header-column"),
            ) - 1;
            const rowHeadersEnabled = normalizeTableRowHeaders(
                this.getAttribute("data-row-headers") ?? this.hasAttribute("data-row-header-column"),
            );
            const baseId = this.id || this.#instanceId;

            syncTableCaption(table, caption);
            syncFallbackAccessibleName(table, label);
            syncTableDescription(this, table, description, baseId);

            if (columnHeadersEnabled) {
                promoteFirstRowCellsToHeaders(table);
            } else {
                demoteManagedHeaders(table, GENERATED_COLUMN_HEADER_ATTRIBUTE);
            }

            syncBodyRowHeaders(table, rowHeaderColumnIndex, rowHeadersEnabled);

            const placements = buildTablePlacements(table);
            const headerPlacements = [];
            let nextHeaderIndex = 1;

            for (const placement of placements) {
                if (placement.cell.tagName !== "TH") {
                    continue;
                }

                const scope = inferHeaderScope(placement.cell, placement, {
                    columnHeadersEnabled,
                    rowHeadersEnabled,
                    rowHeaderColumnIndex,
                });

                if (scope) {
                    if (placement.cell.getAttribute("scope") !== scope) {
                        placement.cell.setAttribute("scope", scope);
                    }
                }

                headerPlacements.push({
                    ...placement,
                    scope,
                    id: ensureHeaderId(placement.cell, this.id || this.#instanceId, nextHeaderIndex),
                });
                nextHeaderIndex += 1;
            }

            headerPlacements.sort(sortPlacementsInDocumentOrder);

            for (const placement of placements) {
                if (placement.cell.tagName !== "TD") {
                    continue;
                }

                const associatedHeaders = headerPlacements.filter((header) => {
                    switch (header.scope) {
                        case "col":
                        case "colgroup":
                            return (
                                header.rowIndex < placement.rowIndex
                                && header.columnIndex < placement.columnIndex + placement.colSpan
                                && header.columnIndex + header.colSpan > placement.columnIndex
                            );
                        case "row":
                        case "rowgroup":
                            return (
                                header.columnIndex < placement.columnIndex
                                && header.rowIndex < placement.rowIndex + placement.rowSpan
                                && header.rowIndex + header.rowSpan > placement.rowIndex
                            );
                        default:
                            return false;
                    }
                });

                if (associatedHeaders.length === 0) {
                    if (placement.cell.hasAttribute(MANAGED_HEADERS_ATTRIBUTE)) {
                        placement.cell.removeAttribute("headers");
                        placement.cell.removeAttribute(MANAGED_HEADERS_ATTRIBUTE);
                    }

                    continue;
                }

                if (
                    placement.cell.hasAttribute("headers")
                    && !placement.cell.hasAttribute(MANAGED_HEADERS_ATTRIBUTE)
                ) {
                    continue;
                }

                const nextHeaders = associatedHeaders.map((header) => header.id).join(" ");

                if (placement.cell.getAttribute("headers") !== nextHeaders) {
                    placement.cell.setAttribute("headers", nextHeaders);
                }

                if (!placement.cell.hasAttribute(MANAGED_HEADERS_ATTRIBUTE)) {
                    placement.cell.setAttribute(MANAGED_HEADERS_ATTRIBUTE, "");
                }
            }
        } finally {
            this.#startObserving();
        }
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

    #syncObserver() {
        if (this.#observer || typeof MutationObserver === "undefined") {
            return;
        }

        this.#observer = new MutationObserver(() => {
            this.#scheduleRefresh();
        });

        this.#startObserving();
    }

    #startObserving() {
        if (!this.#observer || this.#observing) {
            return;
        }

        this.#observer.observe(this, TABLE_OBSERVER_OPTIONS);
        this.#observing = true;
    }

    #stopObserving() {
        if (!this.#observer || !this.#observing) {
            return;
        }

        this.#observer.disconnect();
        this.#observing = false;
    }
}

export function defineTable(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return TableElement;
    }

    if (!registry.get(TABLE_TAG_NAME)) {
        registry.define(TABLE_TAG_NAME, TableElement);
    }

    return TableElement;
}
