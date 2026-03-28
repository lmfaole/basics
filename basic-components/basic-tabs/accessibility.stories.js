import "./register.js";
import { expect, waitFor, within } from "storybook/test";

function createStory() {
    const tabs = document.createElement("basic-tabs");
    tabs.dataset.label = "Eksempelkode";
    tabs.dataset.selectedIndex = "0";

    const authorLabel = document.createElement("h2");
    authorLabel.id = "authored-tabs-label";
    authorLabel.textContent = "Manuell faneliste";

    const list = document.createElement("div");
    list.dataset.tabsList = "";
    list.setAttribute("aria-labelledby", authorLabel.id);

    const tabLabels = ["Oversikt", "Implementasjon", "Tilgjengelighet"];

    for (const label of tabLabels) {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.dataset.tab = "";
        tab.textContent = label;
        list.append(tab);

        const panel = document.createElement("section");
        panel.dataset.tabPanel = "";
        panel.textContent = label;
        tabs.append(panel);
    }

    tabs.prepend(authorLabel, list);

    return tabs;
}

export default {
    title: "Testing/Tabs",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
    render: createStory,
};

export const PreservesAuthorTablistName = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const tablist = canvas.getByRole("tablist", { name: "Manuell faneliste" });

            expect(tablist).toHaveAttribute("aria-labelledby", "authored-tabs-label");
            expect(tablist).not.toHaveAttribute("aria-label");
        });
    },
};
