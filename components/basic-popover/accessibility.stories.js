import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory() {
    const root = document.createElement("basic-popover");
    root.dataset.label = "Filtre";

    const authorLabel = document.createElement("p");
    authorLabel.id = "author-popover-label";
    authorLabel.textContent = "Manuelt navngitt panel";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.popoverOpen = "";
    openButton.textContent = "Toggle popover";

    const panel = document.createElement("section");
    panel.dataset.popoverPanel = "";
    panel.setAttribute("aria-labelledby", authorLabel.id);

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
    root.append(authorLabel, openButton, panel);

    return root;
}

export default {
    title: "Testing/Accessibility/Popover",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "centered",
    },
    render: createStory,
};

export const PreservesAuthorAccessibleName = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opener = canvas.getByRole("button", { name: "Toggle popover" });
        await userEvent.click(opener);

        await waitFor(() => {
            const panel = canvas.getByRole("dialog", { name: "Manuelt navngitt panel" });

            expect(opener).toHaveAttribute("aria-controls", panel.id);
            expect(panel).toHaveAttribute("aria-labelledby", "author-popover-label");
            expect(panel).not.toHaveAttribute("aria-label");
            expect(within(panel).getByRole("heading", { name: "Filtre" })).toBeInTheDocument();
        });
    },
};
