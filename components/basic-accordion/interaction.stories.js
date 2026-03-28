import "./register.js";
import { expect, userEvent, waitFor } from "storybook/test";

function createStory() {
    const accordion = document.createElement("basic-accordion");

    const items = [
        { label: "Oversikt", body: "Kort sammendrag av mønsteret, med plass til innhold som eies av appen." },
        { label: "Implementasjon", body: "Hver seksjon kan eie sitt eget innhold uten at komponenten styrer layout eller stil." },
        { label: "Tilgjengelighet", body: "Triggerne får stabile aria-koblinger, og tastaturnavigasjonen holder seg på knappene." },
    ];

    for (const [index, item] of items.entries()) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = item.label;

        if (index === 1) {
            details.dataset.disabled = "";
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = item.body;
        details.append(summary, paragraph);

        accordion.append(details);
    }

    return accordion;
}

export default {
    title: "Testing/Accordion",
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
        const summaries = canvasElement.querySelectorAll("basic-accordion > details > summary");
        const overviewSummary = summaries[0];

        overviewSummary.focus();

        await waitFor(() => {
            expect(overviewSummary).toHaveFocus();
            expect(canvasElement.querySelectorAll("basic-accordion > details[open]")).toHaveLength(1);
            expect(canvasElement.querySelector("basic-accordion > details[open] > summary")).toHaveTextContent("Oversikt");
        });

        await userEvent.keyboard("{ArrowDown}");

        await waitFor(() => {
            const accessibilitySummary = canvasElement.querySelectorAll("basic-accordion > details > summary")[2];
            expect(accessibilitySummary).toHaveFocus();
            expect(canvasElement.querySelector("basic-accordion > details[open] > summary")).toHaveTextContent("Oversikt");
        });

        await userEvent.keyboard("{Enter}");

        await waitFor(() => {
            const openItems = canvasElement.querySelectorAll("basic-accordion > details[open]");
            expect(openItems).toHaveLength(1);
            expect(openItems[0].querySelector("summary")).toHaveTextContent("Tilgjengelighet");
        });
    },
};
