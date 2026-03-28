import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory({ selectedIndex = 0, disableImplementation = false } = {}) {
    const tabs = document.createElement("basic-tabs");
    tabs.dataset.label = "Eksempelkode";
    tabs.dataset.selectedIndex = String(selectedIndex);

    const list = document.createElement("div");
    list.dataset.tabsList = "";

    const items = ["Oversikt", "Implementasjon", "Tilgjengelighet"];

    for (const [index, label] of items.entries()) {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.dataset.tab = "";
        tab.textContent = label;

        if (disableImplementation && index === 1) {
            tab.disabled = true;
        }

        list.append(tab);

        const panel = document.createElement("section");
        panel.dataset.tabPanel = "";
        panel.textContent = label;
        tabs.append(panel);
    }

    tabs.prepend(list);
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
};

export const DisabledTabs = {
    render: () => createStory({ disableImplementation: true }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const firstTab = canvas.getByRole("tab", { name: "Oversikt" });

        firstTab.focus();

        await waitFor(() => {
            expect(firstTab).toHaveFocus();
            expect(firstTab).toHaveAttribute("aria-selected", "true");
        });

        await userEvent.keyboard("{ArrowRight}");

        await waitFor(() => {
            const accessibilityTab = canvas.getByRole("tab", { name: "Tilgjengelighet" });
            expect(accessibilityTab).toHaveFocus();
            expect(accessibilityTab).toHaveAttribute("aria-selected", "true");
            expect(canvas.getByRole("tabpanel", { name: "Tilgjengelighet" })).toBeInTheDocument();
        });
    },
};

export const HomeKeyNavigation = {
    render: () => createStory({ selectedIndex: 2 }),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const accessibilityTab = canvas.getByRole("tab", { name: "Tilgjengelighet" });

        accessibilityTab.focus();

        await waitFor(() => {
            expect(accessibilityTab).toHaveFocus();
            expect(accessibilityTab).toHaveAttribute("aria-selected", "true");
        });

        await userEvent.keyboard("{Home}");

        await waitFor(() => {
            const overviewTab = canvas.getByRole("tab", { name: "Oversikt" });
            expect(overviewTab).toHaveFocus();
            expect(overviewTab).toHaveAttribute("aria-selected", "true");
            expect(canvas.getByRole("tabpanel", { name: "Oversikt" })).toBeInTheDocument();
        });
    },
};
