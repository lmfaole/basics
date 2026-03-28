import "./register.js";
import { expect, userEvent, waitFor } from "storybook/test";

/**
 * @typedef {object} AccordionStoryArgs
 * @property {boolean} multiple Allows multiple items to stay open.
 * @property {boolean} collapsible Allows the last open item in single mode to close.
 * @property {boolean} openFirst Marks the first item as initially open.
 * @property {boolean} openSecond Marks the second item as initially open.
 * @property {boolean} openThird Marks the third item as initially open.
 */

const ACCORDION_ITEMS = [
    {
        label: "Oversikt",
        body: "Kort sammendrag av mønsteret, med plass til innhold som eies av appen.",
    },
    {
        label: "Implementasjon",
        body: "Hver seksjon kan eie sitt eget innhold uten at komponenten styrer layout eller stil.",
    },
    {
        label: "Tilgjengelighet",
        body: "Triggerne får stabile aria-koblinger, og tastaturnavigasjonen holder seg på knappene.",
    },
];

/**
 * @param {AccordionStoryArgs} args
 */
function createStory({
    multiple,
    collapsible,
    openFirst,
    openSecond,
    openThird,
}) {
    const accordion = document.createElement("basic-accordion");

    if (multiple) {
        accordion.dataset.multiple = "";
    }

    if (collapsible) {
        accordion.dataset.collapsible = "";
    }

    const openStates = [openFirst, openSecond, openThird];

    for (const [index, item] of ACCORDION_ITEMS.entries()) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = item.label;

        if (openStates[index]) {
            details.open = true;
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = item.body;
        details.append(summary, paragraph);

        accordion.append(details);
    }

    return accordion;
}

export default {
    title: "Components/Accordion",
    tags: ["accordion", "details", "disclosure", "expand-collapse", "basic-accordion"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element that coordinates direct child \`<details>\` items into a simple accordion.

Use it when the page already owns the content and styling, but still needs predictable single-open behavior and arrow-key movement:

- provide direct child \`<details>\` elements, each with a first-child \`<summary>\`
- optionally author \`open\` on any item for the initial state
- optionally add \`data-disabled\` on a \`<details>\` item to remove it from toggle and keyboard interaction
- optionally add \`data-multiple\` and \`data-collapsible\` on the root element

The component leaves the native \`details\` and \`summary\` semantics intact, keeps open state consistent with the root rules, and supports \`ArrowUp\`, \`ArrowDown\`, \`Home\`, and \`End\` between enabled summaries.
                `,
            },
            source: {
                code: `<basic-accordion>
  <details open>
    <summary>Oversikt</summary>
    <p>...</p>
  </details>

  <details>
    <summary>Implementasjon</summary>
    <p>...</p>
  </details>
</basic-accordion>`,
            },
        },
    },
    render: createStory,
    args: {
        multiple: false,
        collapsible: false,
        openFirst: false,
        openSecond: false,
        openThird: false,
    },
    argTypes: {
        multiple: {
            control: "boolean",
            description: "Maps to `data-multiple` and allows more than one item to stay open.",
            table: {
                category: "Attributes",
            },
        },
        collapsible: {
            control: "boolean",
            description: "Maps to `data-collapsible` and allows the last open item in single mode to close.",
            table: {
                category: "Attributes",
            },
        },
        openFirst: {
            control: "boolean",
            description: "Story-only toggle for the first item's initial open state.",
            table: {
                category: "Story Controls",
            },
        },
        openSecond: {
            control: "boolean",
            description: "Story-only toggle for the second item's initial open state.",
            table: {
                category: "Story Controls",
            },
        },
        openThird: {
            control: "boolean",
            description: "Story-only toggle for the third item's initial open state.",
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
                story: "Simple configurable accordion example using one `basic-accordion` element with three items.",
            },
        },
    },
};

export const Semantics = {
    parameters: {
        docs: {
            description: {
                story: "Semantics test proving that the accordion preserves native `details` markup while normalizing initial single-open state.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const detailsItems = canvasElement.querySelectorAll("basic-accordion > details");
        const summaries = canvasElement.querySelectorAll("basic-accordion > details > summary");

        await waitFor(() => {
            expect(detailsItems).toHaveLength(3);
            expect(summaries).toHaveLength(3);
            expect(detailsItems[0]).toHaveAttribute("open");
            expect(detailsItems[0]).toHaveAttribute("data-open");
            expect(detailsItems[1]).not.toHaveAttribute("open");
            expect(detailsItems[1]).not.toHaveAttribute("data-open");
            expect(summaries[0]).toHaveTextContent("Oversikt");
            expect(summaries[1]).toHaveTextContent("Implementasjon");
            expect(summaries[0]).toHaveAttribute("tabindex", "0");
        });
    },
};

export const Collapsible = {
    args: {
        collapsible: true,
        openFirst: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Interaction test proving that single mode can close its last open item when `data-collapsible` is set.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const overviewSummary = canvasElement.querySelector("basic-accordion > details > summary");

        await waitFor(() => {
            expect(overviewSummary).not.toBeNull();
            expect(canvasElement.querySelectorAll("basic-accordion > details[open]")).toHaveLength(1);
        });

        await userEvent.click(overviewSummary);

        await waitFor(() => {
            expect(canvasElement.querySelectorAll("basic-accordion > details[open]")).toHaveLength(0);
        });
    },
};

export const MultipleOpen = {
    args: {
        multiple: true,
        openFirst: true,
        openSecond: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Semantics test proving that `data-multiple` allows more than one `details` item to stay open.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const openItems = canvasElement.querySelectorAll("basic-accordion > details[open]");

            expect(openItems).toHaveLength(2);
            expect(openItems[0].querySelector("summary")).toHaveTextContent("Oversikt");
            expect(openItems[1].querySelector("summary")).toHaveTextContent("Implementasjon");
        });
    },
};
