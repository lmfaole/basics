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
 * @property {string} positionArea CSS anchor-positioning area used when anchorTrigger is enabled.
 * @property {string} positionTryFallbacks CSS anchor-positioning fallback list used when anchorTrigger is enabled.
 * @property {string} label Fallback accessible name when the popover has no title element.
 * @property {boolean} includeTitle Renders a heading that becomes the popover name.
 * @property {boolean} includeCloseButton Adds an explicit dismiss control inside the panel.
 * @property {boolean} includeViewportSpacer Adds enough preceding content to force scrolling for fallback placement tests.
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
    includeViewportSpacer,
}) {
    const wrapper = document.createElement("div");

    if (includeViewportSpacer) {
        for (let index = 0; index < 40; index += 1) {
            const paragraph = document.createElement("p");
            paragraph.textContent = `Viewport spacer before ${index + 1}`;
            wrapper.append(paragraph);
        }
    }

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

    if (includeTitle) {
        const title = document.createElement("h2");
        title.dataset.popoverTitle = "";
        title.textContent = "Filtre";
        panel.append(title);
    }

    const body = document.createElement("p");
    body.textContent = "Popoveren eier bare overlay-oppførselen, ikke layout eller stil.";
    panel.append(body);

    const field = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    field.append(checkbox, document.createTextNode(" Bare aktive elementer"));
    panel.append(field);

    if (includeCloseButton) {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.dataset.popoverClose = "";
        closeButton.textContent = "Close";
        panel.append(closeButton);
    }

    root.append(openButton, panel);
    wrapper.append(root);

    if (includeViewportSpacer) {
        for (let index = 0; index < 40; index += 1) {
            const paragraph = document.createElement("p");
            paragraph.textContent = `Viewport spacer after ${index + 1}`;
            wrapper.append(paragraph);
        }
    }

    return wrapper;
}

export default {
    title: "Components/Popover",
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
- optionally add \`data-anchor-trigger\` on the root to establish the opener as the panel's implicit anchor and apply a \`position-area\`
- optionally add \`data-position-try-fallbacks\` to override the built-in fallback list

The component uses the native Popover API in auto mode, syncs \`aria-expanded\`, closes on outside click or \`Esc\`, restores focus when dismissal should return to the opener, and anchors the panel with a configurable default placement plus a fallback sequence when there isn't enough space.
                `,
            },
            source: {
                code: `<basic-popover
  data-label="Filtre"
  data-anchor-trigger
  data-position-area="bottom"
  data-position-try-fallbacks="flip-block, flip-inline, flip-block flip-inline"
>
  <button type="button" data-popover-open>Toggle popover</button>

  <section data-popover-panel>
    <h2 data-popover-title>Filtre</h2>
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
        label: "Filtre",
        includeTitle: true,
        includeCloseButton: true,
        includeViewportSpacer: false,
    },
    argTypes: {
        anchorTrigger: {
            control: "boolean",
            description: "Maps to `data-anchor-trigger` and uses the opener as the popover's implicit anchor.",
            table: {
                category: "Attributes",
            },
        },
        positionArea: {
            control: "select",
            options: POSITION_AREA_OPTIONS,
            description: "Maps to `data-position-area` and controls the default anchored placement relative to the trigger.",
            if: {
                arg: "anchorTrigger",
                truthy: true,
            },
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "bottom",
                },
                type: {
                    summary: POSITION_AREA_OPTIONS.join(" | "),
                },
            },
        },
        positionTryFallbacks: {
            control: "text",
            description: "Maps to `data-position-try-fallbacks`; leave empty to use the component's built-in fallback list.",
            if: {
                arg: "anchorTrigger",
                truthy: true,
            },
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "derived from `data-position-area`",
                },
            },
        },
        label: {
            control: "text",
            description: "Maps to the root `data-label` attribute and is used when the popover has no own title.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "Filtre",
                },
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
            description: "Story-only toggle that renders an explicit close button inside the panel.",
            table: {
                category: "Story Controls",
            },
        },
        includeViewportSpacer: {
            control: "boolean",
            description: "Story-only toggle that adds preceding content so the trigger can be scrolled to the viewport edge.",
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
                story: "Simple configurable popover example with one trigger and one panel.",
            },
        },
    },
};

export const LabelFallback = {
    args: {
        includeTitle: false,
        label: "Filterpanel",
    },
    parameters: {
        docs: {
            description: {
                story: "Shows how the root `data-label` becomes the accessible name when the popover has no title element.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });
        await userEvent.click(opener);

        await waitFor(() => {
            const panel = canvas.getByRole("dialog", { name: "Filterpanel" });

            expect(opener).toHaveAttribute("aria-haspopup", "dialog");
            expect(opener).toHaveAttribute("aria-controls", panel.id);
            expect(opener).toHaveAttribute("aria-expanded", "true");
            expect(panel).toHaveAttribute("aria-label", "Filterpanel");
            expect(panel).not.toHaveAttribute("aria-labelledby");
        });
    },
};

export const AnchoredToTrigger = {
    args: {
        anchorTrigger: true,
        positionArea: "bottom",
    },
    parameters: {
        docs: {
            description: {
                story: "Interaction test proving that the popover is actually positioned below the trigger when anchoring is enabled.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });
        await userEvent.click(opener);

        await waitFor(() => {
            const panel = canvas.getByRole("dialog", { name: "Filtre" });
            const openerRect = opener.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();

            expect(panelRect.top).toBeGreaterThanOrEqual(openerRect.bottom - 2);
            expect(panelRect.left).toBeLessThan(openerRect.right + 2);
            expect(panelRect.right).toBeGreaterThan(openerRect.left - 2);
        });
    },
};

export const TopPlacement = {
    args: {
        anchorTrigger: true,
        positionArea: "top",
        includeViewportSpacer: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Interaction test proving that changing `data-position-area` changes the default anchored placement.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });

        opener.scrollIntoView({ block: "center" });
        await waitFor(() => {
            const openerRect = opener.getBoundingClientRect();

            expect(openerRect.top).toBeGreaterThan(window.innerHeight * 0.25);
            expect(openerRect.bottom).toBeLessThan(window.innerHeight * 0.75);
        });

        await userEvent.click(opener);

        await waitFor(() => {
            const panel = canvas.getByRole("dialog", { name: "Filtre" });
            const openerRect = opener.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();

            expect(panelRect.bottom).toBeLessThanOrEqual(openerRect.top + 2);
        });
    },
};

export const FallbackPlacement = {
    args: {
        anchorTrigger: true,
        positionArea: "bottom",
        includeViewportSpacer: true,
    },
    parameters: {
        layout: "fullscreen",
        chromatic: {
            disableSnapshot: true,
        },
        docs: {
            description: {
                story: "Interaction test proving that the popover flips to a fallback placement when the default anchored placement would overflow the viewport.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });

        opener.scrollIntoView({ block: "end" });
        await waitFor(() => {
            const openerRect = opener.getBoundingClientRect();
            expect(openerRect.bottom).toBeGreaterThan(window.innerHeight - 48);
        });

        await userEvent.click(opener);

        await waitFor(() => {
            const panel = canvas.getByRole("dialog", { name: "Filtre" });
            const openerRect = opener.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();

            expect(panel.style.getPropertyValue("--basic-popover-position-try-fallbacks").trim()).toBe(
                "flip-block, flip-inline, flip-block flip-inline",
            );
            expect(panelRect.bottom).toBeLessThanOrEqual(openerRect.top + 2);
            expect(panelRect.bottom).toBeLessThanOrEqual(window.innerHeight);
        });
    },
};

export const InlineFallbackPlacement = {
    args: {
        anchorTrigger: true,
        positionArea: "left",
        positionTryFallbacks: "right",
    },
    parameters: {
        layout: "fullscreen",
        chromatic: {
            disableSnapshot: true,
        },
        docs: {
            description: {
                story: "Interaction test proving that an explicit inline fallback can move the popover to the other side of the trigger when the default side lacks space.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });

        await userEvent.click(opener);

        await waitFor(() => {
            const panel = canvas.getByRole("dialog", { name: "Filtre" });
            const openerRect = opener.getBoundingClientRect();
            const panelRect = panel.getBoundingClientRect();

            expect(panel.style.getPropertyValue("--basic-popover-position-try-fallbacks").trim()).toBe("right");
            expect(panelRect.left).toBeGreaterThanOrEqual(openerRect.right - 2);
            expect(panelRect.top).toBeLessThan(openerRect.bottom + 2);
            expect(panelRect.bottom).toBeGreaterThan(openerRect.top - 2);
        });
    },
};
