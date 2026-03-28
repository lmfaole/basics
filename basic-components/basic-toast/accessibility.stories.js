import "./register.js";
import { expect, waitFor, within } from "storybook/test";

function createStory() {
    const toast = document.createElement("basic-toast");
    toast.dataset.live = "assertive";
    toast.dataset.duration = "0";
    toast.setAttribute("data-open", "");

    const authorLabel = document.createElement("p");
    authorLabel.id = "author-toast-label";
    authorLabel.textContent = "Manuelt navngitt toast";

    const panel = document.createElement("section");
    panel.dataset.toastPanel = "";
    panel.setAttribute("aria-labelledby", authorLabel.id);

    const title = document.createElement("h2");
    title.dataset.toastTitle = "";
    title.textContent = "Lagret";

    const body = document.createElement("p");
    body.textContent = "Toasten skal bevare et forfattet navn når panelet allerede har ett.";

    panel.append(title, body);
    toast.append(authorLabel, panel);

    return toast;
}

export default {
    title: "Testing/Toast",
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

        await waitFor(() => {
            const toast = canvas.getByRole("alert", { name: "Manuelt navngitt toast" });

            expect(toast).toHaveAttribute("aria-labelledby", "author-toast-label");
            expect(toast).toHaveAttribute("aria-live", "assertive");
            expect(toast).toHaveAttribute("aria-atomic", "true");
            expect(toast).not.toHaveAttribute("aria-label");
        });
    },
};
