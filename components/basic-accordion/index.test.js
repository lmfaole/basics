import { describe, expect, it, vi } from "vitest";
import {
    ACCORDION_TAG_NAME,
    AccordionElement,
    defineAccordion,
    findNextEnabledAccordionIndex,
    getInitialOpenAccordionIndexes,
} from "./index.js";

describe("@lmfaole/basics basic-accordion", () => {
    it("keeps explicit open items in multiple mode and falls back correctly in single mode", () => {
        expect(getInitialOpenAccordionIndexes([
            { disabled: false, open: false },
            { disabled: false, open: true },
            { disabled: false, open: true },
        ], { multiple: true })).toEqual([1, 2]);

        expect(getInitialOpenAccordionIndexes([
            { disabled: false, open: false },
            { disabled: false, open: true },
            { disabled: false, open: true },
        ])).toEqual([1]);

        expect(getInitialOpenAccordionIndexes([
            { disabled: true, open: false },
            { disabled: false, open: false },
        ])).toEqual([1]);

        expect(getInitialOpenAccordionIndexes([
            { disabled: true, open: false },
            { disabled: false, open: false },
        ], { collapsible: true })).toEqual([]);
    });

    it("wraps keyboard navigation and skips disabled triggers", () => {
        const items = [
            { disabled: false },
            { disabled: true },
            { disabled: false },
            { disabled: false },
        ];

        expect(findNextEnabledAccordionIndex(items, 0, 1)).toBe(2);
        expect(findNextEnabledAccordionIndex(items, 2, 1)).toBe(3);
        expect(findNextEnabledAccordionIndex(items, 3, 1)).toBe(0);
        expect(findNextEnabledAccordionIndex(items, 0, -1)).toBe(3);
    });

    it("returns no open or focus targets when every accordion item is disabled", () => {
        const items = [
            { disabled: true, open: true },
            { disabled: true, open: false },
        ];

        expect(getInitialOpenAccordionIndexes(items)).toEqual([]);
        expect(getInitialOpenAccordionIndexes(items, { multiple: true })).toEqual([]);
        expect(findNextEnabledAccordionIndex(items, 0, 1)).toBe(-1);
        expect(findNextEnabledAccordionIndex([], 0, 1)).toBe(-1);
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineAccordion(registry);

        expect(defined).toBe(AccordionElement);
        expect(registry.get).toHaveBeenCalledWith(ACCORDION_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            ACCORDION_TAG_NAME,
            AccordionElement,
        );

        registry.get.mockReturnValue(AccordionElement);
        defineAccordion(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
