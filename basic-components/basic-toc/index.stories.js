import "./register.js";
import { expect, waitFor, within } from "storybook/test";

/**
 * @typedef {object} TocStoryArgs
 * @property {string} title Accessible label copied to the generated nav.
 * @property {string} headingSelector CSS selector used to pick headings from the article.
 * @property {boolean} includeAppendix Adds an extra section to the example article.
 */

/**
 * @param {TocStoryArgs} args
 */
function createStory({ title, headingSelector, includeAppendix }) {
    const main = document.createElement("main");

    const toc = document.createElement("basic-toc");
    toc.dataset.title = title;

    if (headingSelector) {
        toc.dataset.headingSelector = headingSelector;
    }

    const article = document.createElement("article");
    article.innerHTML = `
        <h1>Table of contents</h1>
        <p>
            Storybook story for checking how the custom element collects headings from
            nearby content without any app-specific wrappers.
        </p>
        <h2>Overview</h2>
        <p>
            The component watches the nearest main element and rebuilds its link tree
            when headings change.
        </p>
        <h2>Usage</h2>
        <p>
            Consumers provide the shell and the custom element keeps it in sync with
            the surrounding document outline.
        </p>
        <h3>Custom title</h3>
        <p>
            The visible label stays outside the component's responsibilities, but the
            nav aria-label tracks the configured title.
        </p>
        <h3>Heading filters</h3>
        <p>
            Set data-heading-selector when you want a narrower subset of headings.
        </p>
    `;

    if (includeAppendix) {
        article.insertAdjacentHTML(
            "beforeend",
            `
                <h2>Appendix</h2>
                <p>
                    Extra content makes it easier to confirm that nested sections still
                    produce stable ids and links.
                </p>
            `,
        );
    }

    main.append(toc, article);
    return main;
}

export default {
    title: "Custom Elements/Table of Contents",
    tags: ["table-of-contents", "toc", "navigation", "headings", "basic-toc"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element that mirrors the heading structure of the nearest \`<main>\`.

Use it when the page already owns its visual design and you only want a stable outline generator:

- place the element inside the same \`<main>\` as the content it should index
- optionally set \`data-title\` for the nav label
- optionally set \`data-heading-selector\` to limit which headings are included
                `,
            },
            source: {
                code: `<main>
  <basic-toc data-title="Contents"></basic-toc>
  <article>
    <h1>Overview</h1>
    <h2>Usage</h2>
  </article>
</main>`,
            },
        },
    },
    render: createStory,
    args: {
        title: "Contents",
        headingSelector: "",
        includeAppendix: true,
    },
    argTypes: {
        title: {
            control: "text",
            description: "Maps to `data-title` and becomes the generated nav label.",
            table: {
                category: "Attributes",
            },
        },
        headingSelector: {
            control: "text",
            description: "Maps to `data-heading-selector` and limits which headings are collected.",
            table: {
                category: "Attributes",
            },
        },
        includeAppendix: {
            control: "boolean",
            description: "Story-only toggle that adds another section to the demo article.",
            table: {
                category: "Story Controls",
            },
        },
    },
};

export const Default = {};

export const FilteredHeadings = {
    args: {
        headingSelector: "h2, h3",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const nav = canvas.getByRole("navigation", { name: "Contents" });
            const links = within(nav).getAllByRole("link");

            expect(links.map((link) => link.textContent)).toEqual([
                "Overview",
                "Usage",
                "Custom title",
                "Heading filters",
                "Appendix",
            ]);
            expect(within(nav).queryByRole("link", { name: "Table of contents" })).toBeNull();
        });
    },
};
