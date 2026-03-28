import "./register.js";

/**
 * @typedef {object} TableOfContentsStoryArgs
 * @property {string} title Accessible label copied to the generated nav.
 * @property {string} headingSelector CSS selector used to pick headings from the article.
 * @property {boolean} includeAppendix Adds an extra section to the example article.
 */

/**
 * @param {TableOfContentsStoryArgs} args
 */
function createStory({ title, headingSelector, includeAppendix }) {
    const main = document.createElement("main");

    const toc = document.createElement("basic-toc");
    toc.dataset.title = title;

    if (headingSelector) {
        toc.dataset.headingSelector = headingSelector;
    }

    const nav = document.createElement("nav");
    nav.dataset.pageTocNav = "";
    toc.append(nav);

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
            Consumers provide the nav container, and the custom element keeps it in sync
            with the document outline.
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
    title: "Components/Table of Contents",
    tags: ["table-of-contents", "toc", "navigation", "headings", "basic-toc"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element that mirrors the heading structure of the nearest \`<main>\`.

Use it when the page already owns its visual design and you only want a stable outline generator:

- provide a descendant \`[data-page-toc-nav]\` container
- place the element inside the same \`<main>\` as the content it should index
- optionally set \`data-title\` for the nav label and \`data-heading-selector\` to limit which headings are included

The element assigns missing heading ids, keeps duplicate headings unique, and rebuilds automatically when the document outline changes.
                `,
            },
            source: {
                code: `<basic-toc data-title="Innhold">
  <nav aria-label="Innhold" data-page-toc-nav></nav>
</basic-toc>`,
            },
        },
    },
    render: createStory,
    args: {
        title: "Innhold",
        headingSelector: "",
        includeAppendix: true,
    },
    argTypes: {
        title: {
            control: "text",
            description: "Maps to the `data-title` attribute and becomes the generated nav's aria-label.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "Innhold",
                },
            },
        },
        headingSelector: {
            control: "text",
            description: "Maps to `data-heading-selector` and limits which headings are collected.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "h1, h2, h3, h4, h5, h6",
                },
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

export const Default = {
    parameters: {
        docs: {
            description: {
                story: "Simple configurable table of contents example that indexes one nearby article.",
            },
        },
    },
};
