import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory({ backdropClose = false, includeSecondaryAction = false } = {}) {
    const root = document.createElement("basic-dialog");

    if (backdropClose) {
        root.dataset.backdropClose = "";
    }

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.dialogOpen = "";
    openButton.textContent = "Open dialog";

    const dialog = document.createElement("dialog");
    dialog.dataset.dialogPanel = "";
    dialog.style.width = "24rem";
    dialog.style.minHeight = "12rem";
    dialog.style.padding = "3rem";

    const title = document.createElement("h2");
    title.dataset.dialogTitle = "";
    title.textContent = "Bekreft handling";

    const body = document.createElement("p");
    body.textContent = "Dialogen styrer fokus og lukking, men eier ikke layout eller stil.";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.dataset.dialogClose = "";
    closeButton.textContent = "Cancel";

    dialog.append(title, body, closeButton);

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
    title: "Testing/Interaction/Dialog",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
};

export const BackdropClose = {
    render: () => createStory({ backdropClose: true }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));

        const dialog = await canvas.findByRole("dialog", { name: "Bekreft handling" });
        const insideBounds = dialog.getBoundingClientRect();
        dialog.dispatchEvent(new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            clientX: insideBounds.left + 16,
            clientY: insideBounds.top + 16,
        }));

        await waitFor(() => {
            expect(canvas.getByRole("dialog", { name: "Bekreft handling" })).toHaveAttribute("open");
        });

        dialog.dispatchEvent(new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            clientX: insideBounds.left - 16,
            clientY: insideBounds.top - 16,
        }));

        await waitFor(() => {
            expect(canvas.queryByRole("dialog", { name: "Bekreft handling" })).not.toBeInTheDocument();
        });
    },
};

export const ConfirmAction = {
    render: () => createStory({ includeSecondaryAction: true }),
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
