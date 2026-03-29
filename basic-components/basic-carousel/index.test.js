import { describe, expect, it, vi } from "vitest";
import {
    CAROUSEL_TAG_NAME,
    CarouselElement,
    clampCarouselIndex,
    defineCarousel,
    normalizeCarouselControls,
    normalizeCarouselLabel,
    normalizeCarouselScrollBehavior,
    normalizeCarouselSnapping,
} from "./index.js";

describe("@lmfaole/basics basic-carousel", () => {
    it("normalizes carousel attributes and helpers", () => {
        expect(normalizeCarouselLabel("Featured stories")).toBe("Featured stories");
        expect(normalizeCarouselLabel("   ")).toBe("Carousel");

        expect(normalizeCarouselControls("none")).toBe("none");
        expect(normalizeCarouselControls("markers")).toBe("markers");
        expect(normalizeCarouselControls(" numbers ")).toBe("markers");
        expect(normalizeCarouselControls("arrows")).toBe("arrows");
        expect(normalizeCarouselControls("toggles")).toBe("both");

        expect(normalizeCarouselScrollBehavior("smooth")).toBe("smooth");
        expect(normalizeCarouselScrollBehavior(" auto ")).toBe("auto");
        expect(normalizeCarouselScrollBehavior("instant")).toBe("auto");

        expect(normalizeCarouselSnapping("start")).toBe("start");
        expect(normalizeCarouselSnapping(" end ")).toBe("end");
        expect(normalizeCarouselSnapping("outside")).toBe("center");

        expect(clampCarouselIndex(0, 3)).toBe(0);
        expect(clampCarouselIndex(4, 3)).toBe(2);
        expect(clampCarouselIndex(-2, 3)).toBe(0);
        expect(clampCarouselIndex(1, 0)).toBe(-1);
        expect(clampCarouselIndex(Number.NaN, 3)).toBe(-1);
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineCarousel(registry);

        expect(defined).toBe(CarouselElement);
        expect(registry.get).toHaveBeenCalledWith(CAROUSEL_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            CAROUSEL_TAG_NAME,
            CarouselElement,
        );

        registry.get.mockReturnValue(CarouselElement);
        defineCarousel(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
