import { describe, expect, it, vi } from "vitest";
import {
    DIALOG_TAG_NAME,
    DialogElement,
    defineDialog,
    normalizeDialogBackdropClose,
    normalizeDialogLabel,
} from "./index.js";

describe("@lmfaole/basics basic-dialog", () => {
    it("normalizes dialog attributes", () => {
        expect(normalizeDialogLabel("Bekreft")).toBe("Bekreft");
        expect(normalizeDialogLabel("   ")).toBe("Dialog");

        expect(normalizeDialogBackdropClose("")).toBe(true);
        expect(normalizeDialogBackdropClose("true")).toBe(true);
        expect(normalizeDialogBackdropClose("false")).toBe(false);
        expect(normalizeDialogBackdropClose(null)).toBe(false);
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineDialog(registry);

        expect(defined).toBe(DialogElement);
        expect(registry.get).toHaveBeenCalledWith(DIALOG_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            DIALOG_TAG_NAME,
            DialogElement,
        );

        registry.get.mockReturnValue(DialogElement);
        defineDialog(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
