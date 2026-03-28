const HTMLElementBase = globalThis.HTMLElement ?? class {};

export const TABLE_OF_CONTENTS_TAG_NAME = "basic-toc";

const DEFAULT_TITLE = "Innhold";
const DEFAULT_HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6";

export function normalizeHeadingText(text) {
    return text.replace(/\s+/g, " ").trim();
}

export function slugifyHeading(text) {
    const normalized = normalizeHeadingText(text)
        .toLocaleLowerCase("nb")
        .replace(/['’"]/g, "")
        .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return normalized || "overskrift";
}

export function createUniqueHeadingId(baseText, usedIds) {
    const baseId = slugifyHeading(baseText);
    let nextId = baseId;
    let suffix = 2;

    while (usedIds.has(nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
    }

    usedIds.add(nextId);
    return nextId;
}

export function buildTableOfContentsTree(headings) {
    const root = [];
    const stack = [];

    for (const heading of headings) {
        const item = {
            ...heading,
            children: [],
        };

        while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];

        if (parent) {
            parent.children.push(item);
        } else {
            root.push(item);
        }

        stack.push(item);
    }

    return root;
}

function renderTableOfContentsItems(items) {
    const list = document.createElement("ol");

    for (const item of items) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${item.id}`;
        link.textContent = item.text;
        listItem.append(link);

        if (item.children.length > 0) {
            listItem.append(renderTableOfContentsItems(item.children));
        }

        list.append(listItem);
    }

    return list;
}

function collectTableOfContentsHeadings(main, tocRoot, headingSelector) {
    const usedIds = new Set();
    const headings = [];

    for (const heading of main.querySelectorAll(headingSelector)) {
        if (!(heading instanceof HTMLHeadingElement)) {
            continue;
        }

        if (tocRoot.contains(heading) || heading.closest("[hidden], [aria-hidden='true']")) {
            continue;
        }

        const text = normalizeHeadingText(heading.textContent ?? "");

        if (!text) {
            continue;
        }

        const existingId = normalizeHeadingText(heading.id);

        if (existingId && !usedIds.has(existingId)) {
            usedIds.add(existingId);
        } else if (existingId) {
            heading.id = createUniqueHeadingId(existingId, usedIds);
        } else {
            heading.id = createUniqueHeadingId(text, usedIds);
        }

        headings.push({
            id: heading.id,
            text,
            level: Number(heading.tagName.slice(1)),
        });
    }

    return headings;
}

export class TableOfContentsElement extends HTMLElementBase {
    static observedAttributes = ["data-title", "data-heading-selector"];

    #observer = null;
    #observedMain = null;
    #scheduledFrame = 0;

    connectedCallback() {
        this.#ensureShell();
        this.#syncObserver();
    }

    disconnectedCallback() {
        this.#teardownObserver();
    }

    attributeChangedCallback() {
        this.#ensureShell();
        this.#scheduleUpdate();
    }

    #getTitle() {
        return this.getAttribute("data-title")?.trim() || DEFAULT_TITLE;
    }

    #getHeadingSelector() {
        return this.getAttribute("data-heading-selector")?.trim() || DEFAULT_HEADING_SELECTOR;
    }

    #getNav() {
        const nav = this.querySelector("[data-page-toc-nav]");
        return nav instanceof HTMLElement ? nav : null;
    }

    #ensureShell() {
        if (typeof document === "undefined") {
            return;
        }

        let nav = this.#getNav();

        if (!(nav instanceof HTMLElement)) {
            nav = document.createElement("nav");
            nav.dataset.pageTocNav = "";
            this.replaceChildren(nav);
        }

        nav.setAttribute("aria-label", this.#getTitle());
    }

    #scheduleUpdate() {
        if (this.#scheduledFrame !== 0 || typeof window === "undefined") {
            return;
        }

        this.#scheduledFrame = window.requestAnimationFrame(() => {
            this.#scheduledFrame = 0;
            this.#update();
        });
    }

    #syncObserver() {
        const main = this.closest("main");

        if (!(main instanceof HTMLElement)) {
            return;
        }

        if (main !== this.#observedMain) {
            this.#teardownObserver();
            this.#observedMain = main;
            this.#observer = new MutationObserver(() => {
                this.#scheduleUpdate();
            });
            this.#observer.observe(main, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }

        this.#update();
    }

    #teardownObserver() {
        this.#observer?.disconnect();
        this.#observer = null;
        this.#observedMain = null;

        if (this.#scheduledFrame !== 0 && typeof window !== "undefined") {
            window.cancelAnimationFrame(this.#scheduledFrame);
            this.#scheduledFrame = 0;
        }
    }

    #update() {
        const nav = this.#getNav();
        const main = this.closest("main");

        if (!(nav instanceof HTMLElement) || !(main instanceof HTMLElement)) {
            return;
        }

        const headings = collectTableOfContentsHeadings(
            main,
            this,
            this.#getHeadingSelector(),
        );
        const nextMarkup = headings.length > 0
            ? renderTableOfContentsItems(buildTableOfContentsTree(headings)).outerHTML
            : "";

        if (nav.innerHTML !== nextMarkup) {
            nav.innerHTML = nextMarkup;
        }

        this.hidden = headings.length === 0;
    }
}

export function defineTableOfContents(
    registry = globalThis.customElements,
) {
    if (!registry?.get || !registry?.define) {
        return TableOfContentsElement;
    }

    if (!registry.get(TABLE_OF_CONTENTS_TAG_NAME)) {
        registry.define(TABLE_OF_CONTENTS_TAG_NAME, TableOfContentsElement);
    }

    return TableOfContentsElement;
}
