import { describe, expect, it, vi } from "vitest";
import {
    POPOVER_TAG_NAME,
    PopoverElement,
    definePopover,
    getDefaultPopoverPositionTryFallbacks,
    isPopoverOpen,
    normalizePopoverAnchorTrigger,
    normalizePopoverLabel,
    normalizePopoverPositionArea,
    normalizePopoverPositionTryFallbacks,
} from "./index.js";

describe("@lmfaole/basics basic-popover", () => {
    it("normalizes fallback labels", () => {
        expect(normalizePopoverLabel("Filtre")).toBe("Filtre");
        expect(normalizePopoverLabel("   ")).toBe("Popover");

        expect(normalizePopoverAnchorTrigger("")).toBe(true);
        expect(normalizePopoverAnchorTrigger("true")).toBe(true);
        expect(normalizePopoverAnchorTrigger("false")).toBe(false);
        expect(normalizePopoverAnchorTrigger(null)).toBe(false);

        expect(normalizePopoverPositionArea("top")).toBe("top");
        expect(normalizePopoverPositionArea(" block-end ")).toBe("block-end");
        expect(normalizePopoverPositionArea("")).toBe("bottom");

        expect(getDefaultPopoverPositionTryFallbacks("bottom")).toBe(
            "flip-block, flip-inline, flip-block flip-inline",
        );
        expect(getDefaultPopoverPositionTryFallbacks("top")).toBe(
            "flip-block, flip-inline, flip-block flip-inline",
        );
        expect(getDefaultPopoverPositionTryFallbacks("right")).toBe(
            "flip-inline, flip-block, flip-inline flip-block",
        );
        expect(getDefaultPopoverPositionTryFallbacks("inline-start")).toBe(
            "flip-inline, flip-block, flip-inline flip-block",
        );

        expect(normalizePopoverPositionTryFallbacks("", "bottom")).toBe(
            "flip-block, flip-inline, flip-block flip-inline",
        );
        expect(normalizePopoverPositionTryFallbacks("top, right", "bottom")).toBe(
            "top, right",
        );
        expect(normalizePopoverPositionTryFallbacks(" right ", "left")).toBe(
            "right",
        );
    });

    it("reports closed state for missing or unsupported panels", () => {
        expect(isPopoverOpen(null)).toBe(false);
        expect(isPopoverOpen(undefined)).toBe(false);
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = definePopover(registry);

        expect(defined).toBe(PopoverElement);
        expect(registry.get).toHaveBeenCalledWith(POPOVER_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            POPOVER_TAG_NAME,
            PopoverElement,
        );

        registry.get.mockReturnValue(PopoverElement);
        definePopover(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
