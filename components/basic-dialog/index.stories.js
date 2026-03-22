import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

/**
 * @typedef {object} DialogStoryArgs
 * @property {string} label Fallback accessible name when the dialog has no title element.
 * @property {boolean} backdropClose Allows dialog backdrop clicks to close the modal.
 * @property {boolean} includeTitle Renders a heading that becomes the dialog name.
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

    if (includeTitle) {
        const title = document.createElement("h2");
        title.dataset.dialogTitle = "";
        title.textContent = "Bekreft handling";
        dialog.append(title);
    }

    const body = document.createElement("p");
    body.textContent = "Dialogen styrer fokus og lukking, men eier ikke layout eller stil.";
    dialog.append(body);

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.dataset.dialogClose = "";
    closeButton.textContent = "Cancel";
    dialog.append(closeButton);

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
    title: "Basics/Basic Dialog",
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

The component opens the dialog with \`showModal()\`, restores focus to the opener on close, and lets the platform handle modal focus behavior and \`Esc\`.
                `,
            },
            source: {
                code: `<basic-dialog data-label="Bekreft handling">
  <button type="button" data-dialog-open>Open dialog</button>

  <dialog data-dialog-panel>
    <h2 data-dialog-title>Bekreft handling</h2>
    <p>Dialog body.</p>
    <button type="button" data-dialog-close>Cancel</button>
  </dialog>
</basic-dialog>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Bekreft handling",
        backdropClose: false,
        includeTitle: true,
        includeSecondaryAction: false,
    },
    argTypes: {
        label: {
            control: "text",
            description: "Maps to the root `data-label` attribute and is used when the dialog has no own title.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "Bekreft handling",
                },
            },
        },
        backdropClose: {
            control: "boolean",
            description: "Maps to `data-backdrop-close` and allows clicks on the dialog backdrop to close it.",
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

export const Default = {
    args: {
        includeSecondaryAction: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Open dialog" });

        opener.focus();
        await userEvent.click(opener);

        await waitFor(() => {
            expect(canvas.getByRole("dialog", { name: "Bekreft handling" })).toHaveAttribute("open");
        });

        await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));

        await waitFor(() => {
            expect(canvas.queryByRole("dialog", { name: "Bekreft handling" })).not.toBeInTheDocument();
            expect(opener).toHaveFocus();
        });
    },
};

export const BackdropClose = {
    args: {
        backdropClose: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Interaction test proving that the modal closes when the dialog backdrop is clicked.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));

        const dialog = await canvas.findByRole("dialog", { name: "Bekreft handling" });
        await userEvent.click(dialog);

        await waitFor(() => {
            expect(canvas.queryByRole("dialog", { name: "Bekreft handling" })).not.toBeInTheDocument();
        });
    },
};

export const LabelFallback = {
    args: {
        includeTitle: false,
        label: "Bekreft sletting",
    },
    parameters: {
        docs: {
            description: {
                story: "Shows how the root `data-label` becomes the accessible name when the dialog has no title element.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));

        await waitFor(() => {
            const dialog = canvas.getByRole("dialog", { name: "Bekreft sletting" });

            expect(dialog).toHaveAttribute("aria-modal", "true");
            expect(dialog).toHaveAttribute("aria-label", "Bekreft sletting");
            expect(dialog).not.toHaveAttribute("aria-labelledby");
        });
    },
};

export const ConfirmAction = {
    args: {
        includeSecondaryAction: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Interaction test proving that a `[data-dialog-close]` button can close with a return value and still restore focus to the opener.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Open dialog" });
        const dialog = canvasElement.querySelector("dialog");

        await userEvent.click(opener);
        await userEvent.click(canvas.getByRole("button", { name: "Confirm" }));

        await waitFor(() => {
            expect(canvas.queryByRole("dialog", { name: "Bekreft handling" })).not.toBeInTheDocument();
            expect(dialog?.returnValue).toBe("confirmed");
            expect(opener).toHaveFocus();
        });
    },
};
