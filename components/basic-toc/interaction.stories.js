import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory({ headingSelector = "", allowMutation = false } = {}) {
    const main = document.createElement("main");
    const toc = document.createElement("basic-toc");
    toc.dataset.title = "Innhold";

    if (headingSelector) {
        toc.dataset.headingSelector = headingSelector;
    }

    const nav = document.createElement("nav");
    nav.dataset.pageTocNav = "";
    toc.append(nav);

    const article = document.createElement("article");
    article.innerHTML = `
        <h1>Table of contents</h1>
        <h2>Overview</h2>
        <p>Overview section.</p>
        <h2>Usage</h2>
        <p>Usage section.</p>
        <h3>Custom title</h3>
        <p>Custom title section.</p>
        <h3>Heading filters</h3>
        <p>Heading filters section.</p>
    `;

    if (allowMutation) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Add section";
        button.addEventListener("click", () => {
            if (article.querySelector("[data-inserted-section]")) {
                return;
            }

            article.insertAdjacentHTML("beforeend", `<h2 data-inserted-section>Inserted section</h2><p>Inserted.</p>`);
        });
        article.prepend(button);
    }

    main.append(toc, article);
    return main;
}

export default {
    title: "Testing/Table of Contents",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
};

export const UpdatesAfterMutation = {
    render: () => createStory({ allowMutation: true }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Add section" }));

        await waitFor(() => {
            const toc = canvas.getByRole("navigation", { name: "Innhold" });
            expect(within(toc).getByRole("link", { name: "Inserted section" })).toBeInTheDocument();
        });
    },
};

export const NoMatchingHeadings = {
    render: () => createStory({ headingSelector: "h4, h5, h6" }),
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const toc = canvasElement.querySelector("basic-toc");
            const nav = canvasElement.querySelector("[data-page-toc-nav]");

            expect(toc).toHaveProperty("hidden", true);
            expect(nav?.querySelectorAll("a")).toHaveLength(0);
        });
    },
};
