import { describe, expect, it, vi } from "vitest";
import {
    ALERT_TAG_NAME,
    AlertElement,
    defineAlert,
    getAlertRoleForLive,
    normalizeAlertLabel,
    normalizeAlertLive,
    normalizeAlertOpen,
} from "./index.js";

describe("@lmfaole/basics basic-alert", () => {
    it("normalizes alert attributes", () => {
        expect(normalizeAlertLabel("Lagret")).toBe("Lagret");
        expect(normalizeAlertLabel("   ")).toBe("Alert");

        expect(normalizeAlertLive("polite")).toBe("polite");
        expect(normalizeAlertLive("assertive")).toBe("assertive");
        expect(normalizeAlertLive("other")).toBe("assertive");
        expect(getAlertRoleForLive("polite")).toBe("status");
        expect(getAlertRoleForLive("assertive")).toBe("alert");

        expect(normalizeAlertOpen("")).toBe(true);
        expect(normalizeAlertOpen("true")).toBe(true);
        expect(normalizeAlertOpen("false")).toBe(false);
        expect(normalizeAlertOpen(null)).toBe(true);
        expect(normalizeAlertOpen("", true)).toBe(false);
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineAlert(registry);

        expect(defined).toBe(AlertElement);
        expect(registry.get).toHaveBeenCalledWith(ALERT_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            ALERT_TAG_NAME,
            AlertElement,
        );

        registry.get.mockReturnValue(AlertElement);
        defineAlert(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
