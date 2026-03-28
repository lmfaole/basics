import { describe, expect, it, vi } from "vitest";
import {
    TABLE_TAG_NAME,
    TableElement,
    defineTable,
    normalizeTableCaption,
    normalizeTableCellSpan,
    normalizeTableColumnHeaders,
    normalizeTableDescription,
    normalizeTableLabel,
    normalizeTableRowHeaderColumn,
    normalizeTableRowHeaders,
} from "./index.js";

describe("@lmfaole/basics basic-table", () => {
    it("normalizes labels, captions, row header flags, and cell spans", () => {
        expect(normalizeTableLabel("  Prosjektstatus  ")).toBe("Prosjektstatus");
        expect(normalizeTableLabel("")).toBe("Tabell");

        expect(normalizeTableCaption("  Team capacity  ")).toBe("Team capacity");
        expect(normalizeTableCaption("")).toBe("");

        expect(normalizeTableDescription("  Weekly staffing snapshot  ")).toBe("Weekly staffing snapshot");
        expect(normalizeTableDescription("")).toBe("");

        expect(normalizeTableRowHeaders(true)).toBe(true);
        expect(normalizeTableRowHeaders("true")).toBe(true);
        expect(normalizeTableRowHeaders("false")).toBe(false);
        expect(normalizeTableRowHeaders("0")).toBe(false);

        expect(normalizeTableColumnHeaders(true)).toBe(true);
        expect(normalizeTableColumnHeaders("false")).toBe(false);

        expect(normalizeTableRowHeaderColumn("3")).toBe(3);
        expect(normalizeTableRowHeaderColumn("0")).toBe(1);
        expect(normalizeTableRowHeaderColumn("bad")).toBe(1);

        expect(normalizeTableCellSpan("3")).toBe(3);
        expect(normalizeTableCellSpan("0")).toBe(1);
        expect(normalizeTableCellSpan("nope")).toBe(1);
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineTable(registry);

        expect(defined).toBe(TableElement);
        expect(registry.get).toHaveBeenCalledWith(TABLE_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            TABLE_TAG_NAME,
            TableElement,
        );

        registry.get.mockReturnValue(TableElement);
        defineTable(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
