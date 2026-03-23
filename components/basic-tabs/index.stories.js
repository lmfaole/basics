import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

/**
 * @typedef {object} TabsStoryArgs
 * @property {"automatic" | "manual"} activation Whether arrow keys also activate the target panel.
 * @property {number} selectedIndex Initially selected panel index.
 */

const TAB_ITEMS = [
    {
        label: "Oversikt",
        title: "Oversikt",
        body: "Kort sammendrag av mønsteret, med plass til innhold som eies av appen.",
    },
    {
        label: "Implementasjon",
        title: "Implementasjon",
        body: "Teknisk dokumentasjon kan ligge i sitt eget panel uten at widgeten styrer layouten.",
    },
    {
        label: "Tilgjengelighet",
        title: "Tilgjengelighet",
        body: "Panelet kan romme tekst, kort, tabeller eller egne komponenter.",
    },
];

/**
 * @param {TabsStoryArgs} args
 */
function createStory({ activation, selectedIndex }) {
    const tabs = document.createElement("basic-tabs");
    tabs.dataset.label = "Eksempelkode";
    tabs.dataset.activation = activation;
    tabs.dataset.selectedIndex = String(selectedIndex);

    const list = document.createElement("div");
    list.dataset.tabsList = "";

    const panels = [];

    for (const [index, item] of TAB_ITEMS.entries()) {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.dataset.tab = "";
        tab.textContent = item.label;

        list.append(tab);

        const panel = document.createElement("section");
        panel.dataset.tabPanel = "";

        const heading = document.createElement("h2");
        heading.textContent = item.title;

        const body = document.createElement("p");
        body.textContent = item.body;

        panel.append(heading, body);
        panels.push(panel);
    }

    tabs.append(list, ...panels);
    return tabs;
}

export default {
    title: "Components/Navigation/Tabs",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element that upgrades existing button-and-panel markup into an accessible tabs interface.

Use it when the page already owns the layout and visual treatment, but still needs predictable roles, ids, and keyboard navigation:

- provide one descendant \`[data-tabs-list]\` container for the tab controls
- provide matching \`[data-tab]\` and \`[data-tab-panel]\` elements in the same order
- optionally set \`data-label\`, \`data-activation\`, and \`data-selected-index\` on the root element

The component assigns missing ids, keeps inactive panels hidden, and supports click activation plus left and right arrow keys, \`Home\`, and \`End\`.
                `,
            },
            source: {
                code: `<basic-tabs data-label="Eksempelkode" data-selected-index="0">
  <div data-tabs-list>
    <button type="button" data-tab>Oversikt</button>
    <button type="button" data-tab>Implementasjon</button>
    <button type="button" data-tab>Tilgjengelighet</button>
  </div>

  <section data-tab-panel>...</section>
  <section data-tab-panel>...</section>
  <section data-tab-panel>...</section>
</basic-tabs>`,
            },
        },
    },
    render: createStory,
    args: {
        activation: "automatic",
        selectedIndex: 0,
    },
    argTypes: {
        activation: {
            control: "inline-radio",
            options: ["automatic", "manual"],
            description: "Maps to `data-activation` and decides whether arrow keys also activate the panel.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "automatic",
                },
            },
        },
        selectedIndex: {
            control: { type: "number", min: 0, max: 2, step: 1 },
            description: "Maps to `data-selected-index` and chooses the initial tab by zero-based index.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "0",
                },
            },
        },
    },
};

export const Default = {
    parameters: {
        docs: {
            description: {
                story: "Accessibility test proving that the default tabs story exposes a named tablist, correct control relationships, and hidden inactive panels.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const tablist = canvas.getByRole("tablist", { name: "Eksempelkode" });
        const overviewTab = canvas.getByRole("tab", { name: "Oversikt" });
        const implementationTab = canvas.getByRole("tab", { name: "Implementasjon" });
        const overviewPanel = canvas.getByRole("tabpanel", { name: "Oversikt" });
        const implementationPanel = canvasElement.querySelectorAll("[data-tab-panel]")[1];

        await waitFor(() => {
            expect(tablist).toHaveAttribute("aria-orientation", "horizontal");
            expect(tablist).toHaveAttribute("aria-label", "Eksempelkode");
            expect(overviewTab).toHaveAttribute("aria-selected", "true");
            expect(overviewTab).toHaveAttribute("aria-controls", overviewPanel.id);
            expect(overviewPanel).toHaveAttribute("aria-labelledby", overviewTab.id);
            expect(overviewTab).toHaveAttribute("tabindex", "0");
            expect(implementationTab).toHaveAttribute("tabindex", "-1");
            expect(implementationPanel).toHaveProperty("hidden", true);
        });
    },
};

export const ManualActivation = {
    args: {
        activation: "manual",
    },
    parameters: {
        docs: {
            description: {
                story: "In manual mode arrow keys move focus first, then `Enter` or `Space` activates the panel.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const overviewTab = canvas.getByRole("tab", { name: "Oversikt" });

        overviewTab.focus();

        await waitFor(() => {
            expect(overviewTab).toHaveFocus();
            expect(overviewTab).toHaveAttribute("aria-selected", "true");
        });

        await userEvent.keyboard("{ArrowRight}");

        await waitFor(() => {
            const implementationTab = canvas.getByRole("tab", { name: "Implementasjon" });
            expect(implementationTab).toHaveFocus();
            expect(implementationTab).toHaveAttribute("aria-selected", "false");
            expect(canvas.getByRole("tabpanel", { name: "Oversikt" })).toBeInTheDocument();
        });

        await userEvent.keyboard("{Enter}");

        await waitFor(() => {
            const implementationTab = canvas.getByRole("tab", { name: "Implementasjon" });
            expect(implementationTab).toHaveAttribute("aria-selected", "true");
            expect(canvas.getByRole("tabpanel", { name: "Implementasjon" })).toBeInTheDocument();
            expect(canvas.queryByRole("tabpanel", { name: "Oversikt" })).not.toBeInTheDocument();
        });
    },
};
