import "./register.js";
import { expect, waitFor, within } from "storybook/test";

function createStory() {
    const main = document.createElement("main");

    const toc = document.createElement("basic-toc");
    toc.dataset.title = "Innhold";

    const nav = document.createElement("nav");
    nav.dataset.pageTocNav = "";
    toc.append(nav);

    const article = document.createElement("article");
    article.innerHTML = `
        <h1>Table of contents</h1>
        <h2>Overview</h2>
        <p>Overview section.</p>
        <h2>Repeated section</h2>
        <p>First repeated section.</p>
        <h2>Repeated section</h2>
        <p>Second repeated section.</p>
        <h2 hidden>Hidden section</h2>
        <section aria-hidden="true">
            <h2>Decorative section</h2>
        </section>
    `;

    main.append(toc, article);

    return main;
}

export default {
    title: "Testing/Accessibility/Table of Contents",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
    render: createStory,
};

export const IgnoresHiddenAndDeduplicates = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const toc = canvas.getByRole("navigation", { name: "Innhold" });
            const repeatedLinks = within(toc).getAllByRole("link", { name: "Repeated section" });

            expect(repeatedLinks).toHaveLength(2);
            expect(repeatedLinks[0]).toHaveAttribute("href", "#repeated-section");
            expect(repeatedLinks[1]).toHaveAttribute("href", "#repeated-section-2");
            expect(within(toc).queryByRole("link", { name: "Hidden section" })).not.toBeInTheDocument();
            expect(within(toc).queryByRole("link", { name: "Decorative section" })).not.toBeInTheDocument();
            expect(canvasElement.querySelector("#repeated-section")).toBeTruthy();
            expect(canvasElement.querySelector("#repeated-section-2")).toBeTruthy();
        });
    },
};
