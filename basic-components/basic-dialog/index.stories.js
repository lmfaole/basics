import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

/**
 * @typedef {object} DialogStoryArgs
 * @property {string} label Fallback accessible name when the dialog has no title element.
 * @property {boolean} backdropClose Allows dialog backdrop clicks to close the modal.
 * @property {boolean} includeTitle Renders a title that becomes the dialog name.
 * @property {boolean} includeSecondaryAction Adds a second close button with a return value.
 */

/**
 * @param {DialogStoryArgs} args
 */
function createStory({ label, backdropClose, includeTitle, includeSecondaryAction }) {
    const root = document.createElement("basic-dialog");
    root.dataset.label = label;

    if (backdropClose) {
        root.dataset.backdropClose = "";
    }

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.dialogOpen = "";
    openButton.textContent = "Open dialog";

    const dialog = document.createElement("dialog");
    dialog.dataset.dialogPanel = "";
    dialog.style.inlineSize = "24rem";
    dialog.style.minBlockSize = "12rem";
    dialog.style.padding = "2rem";

    if (includeTitle) {
        const title = document.createElement("h2");
        title.dataset.dialogTitle = "";
        title.textContent = "Confirm action";
        dialog.append(title);
    }

    const body = document.createElement("p");
    body.textContent = "The component coordinates open and close behavior while leaving layout and content to the page.";
    dialog.append(body);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.dataset.dialogClose = "";
    cancelButton.textContent = "Cancel";
    dialog.append(cancelButton);

    if (includeSecondaryAction) {
        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.dataset.dialogClose = "";
        confirmButton.dataset.dialogCloseValue = "confirmed";
        confirmButton.textContent = "Confirm";
        dialog.append(confirmButton);
    }

    root.append(openButton, dialog);
    return root;
}

export default {
    title: "Custom Elements/Dialog",
    tags: ["dialog", "modal", "overlay", "basic-dialog"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element that upgrades native \`<dialog>\` markup into a modal dialog flow.

Use it when the page already owns visual design and layout, but still needs predictable open and close hooks:

- provide one descendant \`<dialog data-dialog-panel>\`
- use \`[data-dialog-open]\` on buttons that should open the modal
- use \`[data-dialog-close]\` on buttons inside the dialog that should close it
- optionally add \`[data-dialog-title]\` for the accessible name and \`data-backdrop-close\` on the root
                `,
            },
            source: {
                code: `<basic-dialog data-label="Confirm action">
  <button type="button" data-dialog-open>Open dialog</button>

  <dialog data-dialog-panel>
    <h2 data-dialog-title>Confirm action</h2>
    <p>Dialog body.</p>
    <button type="button" data-dialog-close>Cancel</button>
  </dialog>
</basic-dialog>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Confirm action",
        backdropClose: false,
        includeTitle: true,
        includeSecondaryAction: false,
    },
    argTypes: {
        label: {
            control: "text",
            description: "Maps to `data-label` and is used when the dialog has no own title.",
            table: {
                category: "Attributes",
            },
        },
        backdropClose: {
            control: "boolean",
            description: "Maps to `data-backdrop-close` and allows backdrop clicks to close the dialog.",
            table: {
                category: "Attributes",
            },
        },
        includeTitle: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-dialog-title]` heading.",
            table: {
                category: "Story Controls",
            },
        },
        includeSecondaryAction: {
            control: "boolean",
            description: "Story-only toggle that adds a second close button with a return value.",
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
        label: "Delete item",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));

        await waitFor(() => {
            const dialog = canvas.getByRole("dialog", { name: "Delete item" });

            expect(dialog).toHaveAttribute("aria-modal", "true");
            expect(dialog).toHaveAttribute("aria-label", "Delete item");
            expect(dialog).not.toHaveAttribute("aria-labelledby");
        });
    },
};

export const WithSecondaryAction = {
    args: {
        includeSecondaryAction: true,
    },
};
