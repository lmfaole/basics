import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory({ duration = 5000 } = {}) {
    const toast = document.createElement("basic-toast");
    toast.dataset.label = "Lagring fullfort";
    toast.dataset.duration = String(duration);

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.toastOpen = "";
    openButton.textContent = "Show toast";

    const panel = document.createElement("section");
    panel.dataset.toastPanel = "";

    const title = document.createElement("h2");
    title.dataset.toastTitle = "";
    title.textContent = "Lagret";

    const body = document.createElement("p");
    body.textContent = "Toasten kan vises, skjules og eventuelt auto-lukkes fra samme primitive.";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.dataset.toastClose = "";
    closeButton.textContent = "Dismiss";

    panel.append(title, body, closeButton);
    toast.append(openButton, panel);

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
};

export const DismissButton = {
    render: () => createStory({ duration: 0 }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Show toast" });

        await userEvent.click(opener);

        await waitFor(() => {
            expect(canvas.getByRole("status", { name: "Lagret" })).toBeInTheDocument();
        });

        await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));

        await waitFor(() => {
            expect(canvas.queryByRole("status", { name: "Lagret" })).not.toBeInTheDocument();
            expect(opener).toHaveFocus();
        });
    },
};

export const AutoDismiss = {
    render: () => createStory({ duration: 150 }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));

        await waitFor(() => {
            expect(canvas.getByRole("status", { name: "Lagret" })).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(canvas.queryByRole("status", { name: "Lagret" })).not.toBeInTheDocument();
        }, { timeout: 2000 });
    },
};
