import { describe, expect, it, vi } from "vitest";
import {
    TOAST_TAG_NAME,
    ToastElement,
    defineToast,
    getToastRoleForLive,
    normalizeToastDuration,
    normalizeToastLabel,
    normalizeToastLive,
    normalizeToastOpen,
} from "./index.js";

describe("@lmfaole/basics basic-toast", () => {
    it("normalizes toast attributes", () => {
        expect(normalizeToastLabel("Lagret")).toBe("Lagret");
        expect(normalizeToastLabel("   ")).toBe("Toast");

        expect(normalizeToastLive("assertive")).toBe("assertive");
        expect(normalizeToastLive("polite")).toBe("polite");
        expect(normalizeToastLive("other")).toBe("polite");
        expect(getToastRoleForLive("assertive")).toBe("alert");
        expect(getToastRoleForLive("polite")).toBe("status");

        expect(normalizeToastDuration("0")).toBe(0);
        expect(normalizeToastDuration("2500")).toBe(2500);
        expect(normalizeToastDuration("")).toBe(5000);
        expect(normalizeToastDuration("invalid")).toBe(5000);

        expect(normalizeToastOpen("")).toBe(true);
        expect(normalizeToastOpen("true")).toBe(true);
        expect(normalizeToastOpen("false")).toBe(false);
        expect(normalizeToastOpen(null)).toBe(false);
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineToast(registry);

        expect(defined).toBe(ToastElement);
        expect(registry.get).toHaveBeenCalledWith(TOAST_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            TOAST_TAG_NAME,
            ToastElement,
        );

        registry.get.mockReturnValue(ToastElement);
        defineToast(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
