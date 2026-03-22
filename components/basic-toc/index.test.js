import { describe, expect, it, vi } from "vitest";
import {
    TABLE_OF_CONTENTS_TAG_NAME,
    TableOfContentsElement,
    buildTableOfContentsTree,
    createUniqueHeadingId,
    defineTableOfContents,
    normalizeHeadingText,
    slugifyHeading,
} from "./index.js";

describe("@lmfaole/basics basic-toc", () => {
    it("normalizes and slugifies heading text", () => {
        expect(normalizeHeadingText("  Flere\n   nivåer  ")).toBe("Flere nivåer");
        expect(slugifyHeading("Søk i /ds")).toBe("søk-i-ds");
    });

    it("creates unique ids for repeated headings", () => {
        const usedIds = new Set();

        expect(createUniqueHeadingId("Komponenter", usedIds)).toBe("komponenter");
        expect(createUniqueHeadingId("Komponenter", usedIds)).toBe("komponenter-2");
        expect(createUniqueHeadingId("Komponenter", usedIds)).toBe("komponenter-3");
    });

    it("builds a nested outline for all heading levels", () => {
        const tree = buildTableOfContentsTree([
            { id: "page", text: "Page", level: 1 },
            { id: "section", text: "Section", level: 2 },
            { id: "subsection", text: "Subsection", level: 3 },
            { id: "deep", text: "Deep", level: 4 },
            { id: "sibling", text: "Sibling", level: 2 },
        ]);

        expect(tree).toHaveLength(1);
        expect(tree[0]?.children).toHaveLength(2);
        expect(tree[0]?.children[0]?.children[0]?.id).toBe("subsection");
        expect(tree[0]?.children[0]?.children[0]?.children[0]?.id).toBe("deep");
        expect(tree[0]?.children[1]?.id).toBe("sibling");
    });

    it("defines the custom element only once", () => {
        const registry = {
            get: vi.fn().mockReturnValue(undefined),
            define: vi.fn(),
        };

        const defined = defineTableOfContents(registry);

        expect(defined).toBe(TableOfContentsElement);
        expect(registry.get).toHaveBeenCalledWith(TABLE_OF_CONTENTS_TAG_NAME);
        expect(registry.define).toHaveBeenCalledWith(
            TABLE_OF_CONTENTS_TAG_NAME,
            TableOfContentsElement,
        );

        registry.get.mockReturnValue(TableOfContentsElement);
        defineTableOfContents(registry);

        expect(registry.define).toHaveBeenCalledTimes(1);
    });
});
