import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

/**
 * @typedef {object} AccordionStoryArgs
 * @property {boolean} multiple Allows multiple panels to stay open.
 * @property {boolean} collapsible Allows the last open panel in single mode to close.
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
        const heading = document.createElement("h3");
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.dataset.accordionTrigger = "";
        trigger.textContent = item.label;

        if (openStates[index]) {
            trigger.dataset.open = "";
        }

        heading.append(trigger);

        const panel = document.createElement("section");
        panel.dataset.accordionPanel = "";

        const paragraph = document.createElement("p");
        paragraph.textContent = item.body;
        panel.append(paragraph);

        accordion.append(heading, panel);
    }

    return accordion;
}

export default {
    title: "Components/Disclosure/Accordion",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element that upgrades existing trigger-and-panel markup into an accessible accordion.

Use it when the page already owns its heading structure and styling, but still needs stable aria wiring and predictable keyboard support:

- provide matching \`[data-accordion-trigger]\` and \`[data-accordion-panel]\` descendants in the same order
- prefer real \`<button>\` elements for triggers, usually inside your own heading elements
- optionally add \`data-multiple\` and \`data-collapsible\` on the root element

The component assigns missing ids, syncs \`aria-expanded\`, and supports \`ArrowUp\`, \`ArrowDown\`, \`Home\`, \`End\`, \`Enter\`, and \`Space\`.
                `,
            },
            source: {
                code: `<basic-accordion>
  <h3><button type="button" data-accordion-trigger>Oversikt</button></h3>
  <section data-accordion-panel>...</section>

  <h3><button type="button" data-accordion-trigger>Implementasjon</button></h3>
  <section data-accordion-panel>...</section>
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
            description: "Maps to `data-multiple` and allows more than one panel to stay open.",
            table: {
                category: "Attributes",
            },
        },
        collapsible: {
            control: "boolean",
            description: "Maps to `data-collapsible` and allows the last open panel in single mode to close.",
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
                story: "Accessibility test proving that the default accordion wires trigger and panel semantics, roving tab focus, and hidden state correctly.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const overviewTrigger = canvas.getByRole("button", { name: "Oversikt" });
        const overviewPanel = canvas.getByRole("region", { name: "Oversikt" });
        const implementationTrigger = canvas.getByRole("button", { name: "Implementasjon" });
        const implementationPanel = canvasElement.querySelectorAll("[data-accordion-panel]")[1];

        await waitFor(() => {
            expect(overviewTrigger).toHaveAttribute("aria-expanded", "true");
            expect(overviewTrigger).toHaveAttribute("aria-controls", overviewPanel.id);
            expect(overviewPanel).toHaveAttribute("aria-labelledby", overviewTrigger.id);
            expect(overviewTrigger).toHaveAttribute("tabindex", "0");
            expect(implementationTrigger).toHaveAttribute("tabindex", "-1");
            expect(implementationPanel).toHaveAttribute("aria-labelledby", implementationTrigger.id);
            expect(implementationPanel).toHaveProperty("hidden", true);
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
                story: "Interaction test proving that single mode can close its last open panel when `data-collapsible` is set.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const overviewTrigger = canvas.getByRole("button", { name: "Oversikt" });

        await waitFor(() => {
            expect(overviewTrigger).toHaveAttribute("aria-expanded", "true");
            expect(canvas.getByRole("region", { name: "Oversikt" })).toBeInTheDocument();
        });

        await userEvent.click(overviewTrigger);

        await waitFor(() => {
            expect(overviewTrigger).toHaveAttribute("aria-expanded", "false");
            expect(canvas.queryByRole("region", { name: "Oversikt" })).not.toBeInTheDocument();
        });
    },
};

export const MultipleRegions = {
    args: {
        multiple: true,
        openFirst: true,
        openSecond: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Accessibility test proving that multiple open items are each exposed as their own named region when multi-open mode is enabled.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const overviewRegion = canvas.getByRole("region", { name: "Oversikt" });
            const implementationRegion = canvas.getByRole("region", { name: "Implementasjon" });

            expect(overviewRegion).toBeInTheDocument();
            expect(implementationRegion).toBeInTheDocument();
            expect(canvas.queryByRole("region", { name: "Tilgjengelighet" })).not.toBeInTheDocument();
        });
    },
};
