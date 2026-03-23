import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory({ includeOutsideTarget = false } = {}) {
    const wrapper = document.createElement("div");
    const root = document.createElement("basic-popover");
    root.dataset.label = "Filtre";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.popoverOpen = "";
    openButton.textContent = "Toggle popover";

    const panel = document.createElement("section");
    panel.dataset.popoverPanel = "";

    const title = document.createElement("h2");
    title.dataset.popoverTitle = "";
    title.textContent = "Filtre";

    const body = document.createElement("p");
    body.textContent = "Popoveren eier bare overlay-oppførselen, ikke layout eller stil.";

    const field = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    field.append(checkbox, document.createTextNode(" Bare aktive elementer"));

    panel.append(title, body, field);
    root.append(openButton, panel);
    wrapper.append(root);

    if (includeOutsideTarget) {
        const outsideButton = document.createElement("button");
        outsideButton.type = "button";
        outsideButton.textContent = "Outside action";
        wrapper.append(outsideButton);
    }

    return wrapper;
}

export default {
    title: "Testing/Interaction/Popover",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "centered",
    },
};

export const OutsideDismiss = {
    render: () => createStory({ includeOutsideTarget: true }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Toggle popover" }));

        const outsideButton = canvas.getByRole("button", { name: "Outside action" });
        await userEvent.click(outsideButton);

        await waitFor(() => {
            expect(canvas.queryByRole("dialog", { name: "Filtre" })).not.toBeInTheDocument();
            expect(outsideButton).toHaveFocus();
        });
    },
};

export const EscapeDismiss = {
    render: () => createStory(),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });

        await userEvent.click(opener);
        await userEvent.tab();

        await waitFor(() => {
            expect(canvas.getByRole("checkbox", { name: "Bare aktive elementer" })).toHaveFocus();
        });

        await userEvent.keyboard("{Escape}");

        await waitFor(() => {
            expect(canvas.queryByRole("dialog", { name: "Filtre" })).not.toBeInTheDocument();
            expect(opener).toHaveFocus();
        });
    },
};
