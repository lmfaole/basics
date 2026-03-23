import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory() {
    const root = document.createElement("basic-dialog");
    root.dataset.label = "Bekreft handling";

    const authorLabel = document.createElement("p");
    authorLabel.id = "author-dialog-label";
    authorLabel.textContent = "Manuelt navngitt dialog";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.dialogOpen = "";
    openButton.textContent = "Open dialog";

    const dialog = document.createElement("dialog");
    dialog.dataset.dialogPanel = "";
    dialog.setAttribute("aria-labelledby", authorLabel.id);

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
    root.append(authorLabel, openButton, dialog);

    return root;
}

export default {
    title: "Testing/Accessibility/Dialog",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
    render: createStory,
};

export const PreservesAuthorAccessibleName = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));

        await waitFor(() => {
            const dialog = canvas.getByRole("dialog", { name: "Manuelt navngitt dialog" });

            expect(dialog).toHaveAttribute("aria-labelledby", "author-dialog-label");
            expect(dialog).not.toHaveAttribute("aria-label");
            expect(within(dialog).getByRole("heading", { name: "Bekreft handling" })).toBeInTheDocument();
        });
    },
};
