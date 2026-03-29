import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

const POSITION_AREA_OPTIONS = [
    "bottom",
    "top",
    "left",
    "right",
    "block-start",
    "block-end",
    "inline-start",
    "inline-end",
];

/**
 * @typedef {object} PopoverStoryArgs
 * @property {boolean} anchorTrigger Uses the opener as the popover's implicit anchor.
 * @property {string} positionArea CSS anchor-positioning area used when anchoring is enabled.
 * @property {string} positionTryFallbacks CSS anchor-positioning fallback list used when anchoring is enabled.
 * @property {string} label Fallback accessible name when the popover has no title element.
 * @property {boolean} includeTitle Renders a title that becomes the popover name.
 * @property {boolean} includeCloseButton Adds an explicit dismiss button inside the panel.
 */

/**
 * @param {PopoverStoryArgs} args
 */
function createStory({
    anchorTrigger,
    positionArea,
    positionTryFallbacks,
    label,
    includeTitle,
    includeCloseButton,
}) {
    const wrapper = document.createElement("div");
    wrapper.style.padding = "6rem";

    const root = document.createElement("basic-popover");
    root.dataset.label = label;

    if (anchorTrigger) {
        root.dataset.anchorTrigger = "";
        root.dataset.positionArea = positionArea;

        if (positionTryFallbacks) {
            root.dataset.positionTryFallbacks = positionTryFallbacks;
        }
    }

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.popoverOpen = "";
    openButton.textContent = "Toggle popover";

    const panel = document.createElement("section");
    panel.dataset.popoverPanel = "";
    panel.style.inlineSize = "18rem";
    panel.style.padding = "1rem";

    if (includeTitle) {
        const title = document.createElement("h2");
        title.dataset.popoverTitle = "";
        title.textContent = "Filters";
        panel.append(title);
    }

    const body = document.createElement("p");
    body.textContent = "The component owns overlay behavior without taking over the panel markup.";
    panel.append(body);

    const labelRow = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    labelRow.append(checkbox, document.createTextNode(" Only active items"));
    panel.append(labelRow);

    if (includeCloseButton) {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.dataset.popoverClose = "";
        closeButton.textContent = "Close";
        panel.append(closeButton);
    }

    root.append(openButton, panel);
    wrapper.append(root);
    return wrapper;
}

export default {
    title: "Custom Elements/Popover",
    tags: ["popover", "overlay", "anchored", "basic-popover"],
    parameters: {
        layout: "centered",
        docs: {
            description: {
                component: `
Unstyled custom element that upgrades popover trigger-and-panel markup into a non-modal overlay flow.

Use it when the page already owns layout and styling, but still needs a stable overlay primitive:

- provide one descendant \`[data-popover-panel]\`
- use \`[data-popover-open]\` on buttons that should toggle the panel
- optionally add \`[data-popover-close]\` for explicit dismiss actions
- optionally add \`[data-popover-title]\` for the accessible name
- optionally add \`data-anchor-trigger\` on the root to establish the opener as the panel's implicit anchor
                `,
            },
            source: {
                code: `<basic-popover data-label="Filters" data-anchor-trigger data-position-area="bottom">
  <button type="button" data-popover-open>Toggle popover</button>

  <section data-popover-panel>
    <h2 data-popover-title>Filters</h2>
    <p>Popover body.</p>
    <button type="button" data-popover-close>Close</button>
  </section>
</basic-popover>`,
            },
        },
    },
    render: createStory,
    args: {
        anchorTrigger: false,
        positionArea: "bottom",
        positionTryFallbacks: "",
        label: "Filters",
        includeTitle: true,
        includeCloseButton: true,
    },
    argTypes: {
        anchorTrigger: {
            control: "boolean",
            description: "Maps to `data-anchor-trigger` and uses the opener as the implicit anchor.",
            table: {
                category: "Attributes",
            },
        },
        positionArea: {
            control: "select",
            options: POSITION_AREA_OPTIONS,
            description: "Maps to `data-position-area` and controls the default anchored placement.",
            table: {
                category: "Attributes",
            },
        },
        positionTryFallbacks: {
            control: "text",
            description: "Maps to `data-position-try-fallbacks` and overrides the fallback placement list.",
            table: {
                category: "Attributes",
            },
        },
        label: {
            control: "text",
            description: "Maps to `data-label` and becomes the fallback accessible name when no title is present.",
            table: {
                category: "Attributes",
            },
        },
        includeTitle: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-popover-title]` heading.",
            table: {
                category: "Story Controls",
            },
        },
        includeCloseButton: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-popover-close]` button.",
            table: {
                category: "Story Controls",
            },
        },
    },
};

export const Default = {};

export const LabelFallback = {
    args: {
        includeTitle: false,
        label: "Filter panel",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });

        await userEvent.click(opener);

        await waitFor(() => {
            const panel = canvas.getByRole("dialog", { name: "Filter panel" });

            expect(opener).toHaveAttribute("aria-haspopup", "dialog");
            expect(opener).toHaveAttribute("aria-controls", panel.id);
            expect(opener).toHaveAttribute("aria-expanded", "true");
            expect(panel).toHaveAttribute("aria-label", "Filter panel");
            expect(panel).not.toHaveAttribute("aria-labelledby");
        });
    },
};

export const AnchoredToTrigger = {
    args: {
        anchorTrigger: true,
        positionArea: "bottom",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });

        await userEvent.click(opener);

        await waitFor(() => {
            const panel = canvas.getByRole("dialog", { name: "Filters" });

            expect(panel).toHaveAttribute("data-basic-popover-anchored");
            expect(panel.style.getPropertyValue("--basic-popover-position-area").trim()).toBe("bottom");
            expect(opener).toHaveAttribute("aria-expanded", "true");
        });
    },
};
