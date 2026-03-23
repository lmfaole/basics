import { describe, expect, it, vi } from "vitest";
import {
    SUMMARY_TABLE_TAG_NAME,
    SummaryTableElement,
    defineSummaryTable,
    formatSummaryNumber,
    normalizeSummaryColumns,
    normalizeSummaryLocale,
    normalizeSummaryTotalLabel,
    parseSummaryNumber,
} from "./index.js";

describe("@lmfaole/basics basic-summary-table", () => {
    it("normalizes summary configuration and parses common number formats", () => {
        expect(normalizeSummaryColumns("2, 4, 2, nope")).toEqual([2, 4]);
        expect(normalizeSummaryColumns("")).toEqual([]);
        expect(normalizeSummaryTotalLabel("  Grand total  ")).toBe("Grand total");
        expect(normalizeSummaryTotalLabel("")).toBe("Totalt");
        expect(normalizeSummaryLocale("  en-US  ")).toBe("en-US");
        expect(normalizeSummaryLocale("")).toBeUndefined();

        expect(parseSummaryNumber("$1,200.50")).toBe(1200.5);
        expect(parseSummaryNumber("1 200,50")).toBe(1200.5);
        expect(parseSummaryNumber("1,200")).toBe(1200);
        expect(parseSummaryNumber("")).toBeNull();
        expect(formatSummaryNumber(1200.5, { locale: "en-US", fractionDigits: 2 })).toBe("1,200.50");
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineSummaryTable(registry);

        expect(defined).toBe(SummaryTableElement);
        expect(registry.get).toHaveBeenCalledWith(SUMMARY_TABLE_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            SUMMARY_TABLE_TAG_NAME,
            SummaryTableElement,
        );

        registry.get.mockReturnValue(SummaryTableElement);
        defineSummaryTable(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
