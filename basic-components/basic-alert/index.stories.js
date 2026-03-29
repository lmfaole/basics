import "./register.js";
import { expect, userEvent, waitFor } from "storybook/test";

/**
 * @typedef {object} AlertStoryArgs
 * @property {string} label Fallback accessible name when the alert has no title element.
 * @property {"assertive" | "polite"} live Controls whether the alert announces as `alert` or `status`.
 * @property {boolean} includeTitle Renders a title that becomes the alert name.
 * @property {boolean} dismissible Adds a dismiss button inside the alert.
 */

/**
 * @param {AlertStoryArgs} args
 */
function createStory({ label, live, includeTitle, dismissible }) {
    const alert = document.createElement("basic-alert");
    alert.dataset.label = label;
    alert.dataset.live = live;

    if (includeTitle) {
        const title = document.createElement("h2");
        title.dataset.alertTitle = "";
        title.textContent = "Changes saved";
        alert.append(title);
    }

    const body = document.createElement("p");
    body.textContent = "Inline content stays owned by the page while the component manages live-region semantics.";
    alert.append(body);

    if (dismissible) {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.dataset.alertClose = "";
        closeButton.textContent = "Dismiss";
        alert.append(closeButton);
    }

    return alert;
}

export default {
    title: "Custom Elements/Alert",
    tags: ["alert", "status", "live-region", "feedback", "basic-alert"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Custom element that upgrades inline content into a named live-region alert.

Use it when the page already owns the content and layout, but still needs predictable live-region semantics:

- place your content directly inside \`<basic-alert>\`
- optionally add \`[data-alert-title]\` when the alert should have a visible accessible name
- optionally add \`[data-alert-close]\` for a built-in dismiss action
- optionally set \`data-live="polite"\` when the message should behave like a status instead of an assertive alert
                `,
            },
            source: {
                code: `<basic-alert data-label="Save complete">
  <h2 data-alert-title>Changes saved</h2>
  <p>Your changes were saved successfully.</p>
  <button type="button" data-alert-close>Dismiss</button>
</basic-alert>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Save complete",
        live: "assertive",
        includeTitle: true,
        dismissible: false,
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
            options: ["assertive", "polite"],
            description: "Maps to `data-live` and switches between `alert` and `status` semantics.",
            table: {
                category: "Attributes",
            },
        },
        includeTitle: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-alert-title]` heading.",
            table: {
                category: "Story Controls",
            },
        },
        dismissible: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-alert-close]` dismiss button.",
            table: {
                category: "Story Controls",
            },
        },
    },
};

export const Default = {};

export const PoliteStatus = {
    args: {
        live: "polite",
    },
};

export const Dismissible = {
    args: {
        dismissible: true,
    },
    play: async ({ canvasElement }) => {
        const closeButton = canvasElement.querySelector("[data-alert-close]");
        const alert = canvasElement.querySelector("basic-alert");

        await waitFor(() => {
            expect(closeButton).not.toBeNull();
            expect(alert).not.toHaveAttribute("hidden");
        });

        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(alert).toHaveAttribute("hidden");
            expect(alert).not.toHaveAttribute("data-open");
        });

        alert.show();

        await waitFor(() => {
            expect(alert).not.toHaveAttribute("hidden");
            expect(alert).toHaveAttribute("data-open");
        });
    },
};
