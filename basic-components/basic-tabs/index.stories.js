import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

/**
 * @typedef {object} TabsStoryArgs
 * @property {"automatic" | "manual"} activation Whether arrow keys also activate the target panel.
 * @property {number} selectedIndex Initially selected panel index.
 */

const TAB_ITEMS = [
    {
        label: "Overview",
        title: "Overview",
        body: "Short summary content can live in its own panel without the component taking over layout.",
    },
    {
        label: "Implementation",
        title: "Implementation",
        body: "Technical guidance can stay close to the UI without becoming coupled to the tabs widget.",
    },
    {
        label: "Accessibility",
        title: "Accessibility",
        body: "Each panel can contain any content while the component coordinates roles and keyboard support.",
    },
];

/**
 * @param {TabsStoryArgs} args
 */
function createStory({ activation, selectedIndex }) {
    const tabs = document.createElement("basic-tabs");
    tabs.dataset.label = "Example tabs";
    tabs.dataset.activation = activation;
    tabs.dataset.selectedIndex = String(selectedIndex);

    const list = document.createElement("div");
    list.dataset.tabsList = "";

    const panels = [];

    for (const item of TAB_ITEMS) {
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
    title: "Custom Elements/Tabs",
    tags: ["tabs", "tablist", "navigation", "basic-tabs"],
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
                `,
            },
            source: {
                code: `<basic-tabs data-label="Example tabs" data-selected-index="0">
  <div data-tabs-list>
    <button type="button" data-tab>Overview</button>
    <button type="button" data-tab>Implementation</button>
    <button type="button" data-tab>Accessibility</button>
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
            },
        },
        selectedIndex: {
            control: { type: "number", min: 0, max: 2, step: 1 },
            description: "Maps to `data-selected-index` and chooses the initial tab by zero-based index.",
            table: {
                category: "Attributes",
            },
        },
    },
};

export const Default = {};

export const ManualActivation = {
    args: {
        activation: "manual",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const overviewTab = canvas.getByRole("tab", { name: "Overview" });

        overviewTab.focus();

        await waitFor(() => {
            expect(overviewTab).toHaveFocus();
            expect(overviewTab).toHaveAttribute("aria-selected", "true");
        });

        await userEvent.keyboard("{ArrowRight}");

        await waitFor(() => {
            const implementationTab = canvas.getByRole("tab", { name: "Implementation" });
            expect(implementationTab).toHaveFocus();
            expect(implementationTab).toHaveAttribute("aria-selected", "false");
            expect(canvas.getByRole("tabpanel", { name: "Overview" })).toBeInTheDocument();
        });

        await userEvent.keyboard("{Enter}");

        await waitFor(() => {
            const implementationTab = canvas.getByRole("tab", { name: "Implementation" });
            expect(implementationTab).toHaveAttribute("aria-selected", "true");
            expect(canvas.getByRole("tabpanel", { name: "Implementation" })).toBeInTheDocument();
            expect(canvas.queryByRole("tabpanel", { name: "Overview" })).not.toBeInTheDocument();
        });
    },
};
