import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

const POSITION_OPTIONS = [
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
];

/**
 * @typedef {object} ToastStoryArgs
 * @property {string} label Fallback accessible name when the toast has no title element.
 * @property {"assertive" | "polite"} live Controls whether the toast announces as `alert` or `status`.
 * @property {number} duration Auto-dismiss timeout in milliseconds. Use `0` to keep the toast open.
 * @property {string} position Starter CSS preset used to place the top-layer toast.
 * @property {boolean} includeTitle Renders a title that becomes the toast name.
 * @property {boolean} includeCloseButton Adds a dismiss button inside the toast panel.
 * @property {boolean} openInitially Shows the toast immediately on first render.
 */

/**
 * @param {ToastStoryArgs} args
 */
function createStory({
    label,
    live,
    duration,
    position,
    includeTitle,
    includeCloseButton,
    openInitially,
}) {
    const root = document.createElement("basic-toast");
    root.dataset.label = label;
    root.dataset.live = live;
    root.dataset.duration = String(duration);
    root.dataset.toastPosition = position;

    if (openInitially) {
        root.setAttribute("data-open", "");
    }

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.toastOpen = "";
    openButton.textContent = "Show toast";

    const panel = document.createElement("section");
    panel.dataset.toastPanel = "";
    panel.style.inlineSize = "20rem";
    panel.style.padding = "1rem";

    if (includeTitle) {
        const title = document.createElement("h2");
        title.dataset.toastTitle = "";
        title.textContent = "Saved";
        panel.append(title);
    }

    const body = document.createElement("p");
    body.textContent = "The toast keeps announcement and open state in sync without owning surrounding layout.";
    panel.append(body);

    if (includeCloseButton) {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.dataset.toastClose = "";
        closeButton.textContent = "Dismiss";
        panel.append(closeButton);
    }

    root.append(openButton, panel);
    return root;
}

export default {
    title: "Custom Elements/Toast",
    tags: ["toast", "notification", "feedback", "basic-toast"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Custom element that upgrades trigger-and-panel markup into a toast notification flow.

Use it when the page already owns the content and placement, but still needs a predictable live-region toast primitive:

- provide one descendant \`[data-toast-panel]\`
- use \`[data-toast-open]\` on buttons that should show or toggle the toast
- optionally add \`[data-toast-close]\` for explicit dismissal
- optionally add \`[data-toast-title]\` for the accessible name
- optionally set \`data-duration="0"\` to disable auto-dismiss
                `,
            },
            source: {
                code: `<basic-toast data-label="Save complete" data-duration="5000" data-toast-position="top-right">
  <button type="button" data-toast-open>Show toast</button>

  <section data-toast-panel>
    <h2 data-toast-title>Saved</h2>
    <p>Your changes were saved successfully.</p>
  </section>
</basic-toast>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Save complete",
        live: "polite",
        duration: 5000,
        position: "bottom-right",
        includeTitle: true,
        includeCloseButton: false,
        openInitially: false,
    },
    argTypes: {
        label: {
            control: "text",
            description: "Maps to `data-label` and becomes the fallback accessible name when no title is present.",
            table: {
                category: "Attributes",
            },
        },
        live: {
            control: "inline-radio",
            options: ["polite", "assertive"],
            description: "Maps to `data-live` and switches between `status` and `alert` semantics.",
            table: {
                category: "Attributes",
            },
        },
        duration: {
            control: { type: "number", min: 0, max: 10000, step: 250 },
            description: "Maps to `data-duration` in milliseconds. Use `0` to disable auto-dismiss.",
            table: {
                category: "Attributes",
            },
        },
        position: {
            control: "select",
            options: POSITION_OPTIONS,
            description: "Starter styling hook that sets `data-toast-position` for top-layer placement.",
            table: {
                category: "Starter Styling",
            },
        },
        includeTitle: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-toast-title]` heading.",
            table: {
                category: "Story Controls",
            },
        },
        includeCloseButton: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-toast-close]` button.",
            table: {
                category: "Story Controls",
            },
        },
        openInitially: {
            control: "boolean",
            description: "Story-only toggle that opens the toast on first render.",
            table: {
                category: "Story Controls",
            },
        },
    },
};

export const Default = {};

export const Persistent = {
    args: {
        duration: 0,
        openInitially: true,
        position: "top-center",
    },
};

export const LabelFallback = {
    args: {
        duration: 0,
        includeTitle: false,
        label: "Saved notification",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Show toast" });

        await userEvent.click(opener);

        await waitFor(() => {
            const toast = canvas.getByRole("group", { name: "Saved notification" });

            expect(toast).toHaveAttribute("aria-label", "Saved notification");
            expect(toast).not.toHaveAttribute("aria-labelledby");
        });
    },
};
