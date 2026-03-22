import { describe, expect, it, vi } from "vitest";
import {
    TABS_TAG_NAME,
    TabsElement,
    defineTabs,
    findNextEnabledTabIndex,
    getInitialSelectedTabIndex,
    normalizeTabsActivation,
    normalizeTabsOrientation,
} from "./index.js";

describe("@lmfaole/basics tabs", () => {
    it("normalizes supported and unsupported attributes", () => {
        expect(normalizeTabsOrientation("vertical")).toBe("vertical");
        expect(normalizeTabsOrientation("horizontal")).toBe("horizontal");
        expect(normalizeTabsOrientation(" diagonal ")).toBe("horizontal");

        expect(normalizeTabsActivation("manual")).toBe("manual");
        expect(normalizeTabsActivation("automatic")).toBe("automatic");
        expect(normalizeTabsActivation("other")).toBe("automatic");
    });

    it("prefers an explicitly selected enabled tab and otherwise falls back to the first enabled one", () => {
        expect(getInitialSelectedTabIndex([
            { disabled: false, selected: false },
            { disabled: false, selected: true },
            { disabled: false, selected: false },
        ])).toBe(1);

        expect(getInitialSelectedTabIndex([
            { disabled: true, selected: true },
            { disabled: false, selected: false },
            { disabled: false, selected: false },
        ])).toBe(1);

        expect(getInitialSelectedTabIndex([
            { disabled: true, selected: false },
            { disabled: true, selected: false },
        ])).toBe(-1);
    });

    it("wraps keyboard navigation and skips disabled tabs", () => {
        const tabs = [
            { disabled: false },
            { disabled: true },
            { disabled: false },
            { disabled: false },
        ];

        expect(findNextEnabledTabIndex(tabs, 0, 1)).toBe(2);
        expect(findNextEnabledTabIndex(tabs, 2, 1)).toBe(3);
        expect(findNextEnabledTabIndex(tabs, 3, 1)).toBe(0);
        expect(findNextEnabledTabIndex(tabs, 0, -1)).toBe(3);
    });

    it("returns no selection target when every tab is disabled", () => {
        const tabs = [
            { disabled: true, selected: true },
            { disabled: true, selected: false },
        ];

        expect(getInitialSelectedTabIndex(tabs)).toBe(-1);
        expect(findNextEnabledTabIndex(tabs, 0, 1)).toBe(-1);
        expect(findNextEnabledTabIndex([], 0, 1)).toBe(-1);
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineTabs(registry);

        expect(defined).toBe(TabsElement);
        expect(registry.get).toHaveBeenCalledWith(TABS_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            TABS_TAG_NAME,
            TabsElement,
        );

        registry.get.mockReturnValue(TabsElement);
        defineTabs(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
