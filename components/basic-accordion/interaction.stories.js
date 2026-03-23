import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory() {
    const accordion = document.createElement("basic-accordion");

    const items = [
        { label: "Oversikt", body: "Kort sammendrag av mønsteret, med plass til innhold som eies av appen." },
        { label: "Implementasjon", body: "Hver seksjon kan eie sitt eget innhold uten at komponenten styrer layout eller stil." },
        { label: "Tilgjengelighet", body: "Triggerne får stabile aria-koblinger, og tastaturnavigasjonen holder seg på knappene." },
    ];

    for (const [index, item] of items.entries()) {
        const heading = document.createElement("h3");
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.dataset.accordionTrigger = "";
        trigger.textContent = item.label;

        if (index === 1) {
            trigger.disabled = true;
        }

        heading.append(trigger);

        const panel = document.createElement("section");
        panel.dataset.accordionPanel = "";
        panel.textContent = item.body;

        accordion.append(heading, panel);
    }

    return accordion;
}

export default {
    title: "Testing/Interaction/Accordion",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
    render: createStory,
};

export const KeyboardNavigation = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const overviewTrigger = canvas.getByRole("button", { name: "Oversikt" });

        overviewTrigger.focus();

        await waitFor(() => {
            expect(overviewTrigger).toHaveFocus();
            expect(overviewTrigger).toHaveAttribute("aria-expanded", "true");
        });

        await userEvent.keyboard("{ArrowDown}");

        await waitFor(() => {
            const accessibilityTrigger = canvas.getByRole("button", { name: "Tilgjengelighet" });
            expect(accessibilityTrigger).toHaveFocus();
            expect(accessibilityTrigger).toHaveAttribute("aria-expanded", "false");
            expect(canvas.getByRole("region", { name: "Oversikt" })).toBeInTheDocument();
        });

        await userEvent.keyboard("{Enter}");

        await waitFor(() => {
            const accessibilityTrigger = canvas.getByRole("button", { name: "Tilgjengelighet" });
            expect(accessibilityTrigger).toHaveAttribute("aria-expanded", "true");
            expect(canvas.getByRole("region", { name: "Tilgjengelighet" })).toBeInTheDocument();
        });
    },
};
