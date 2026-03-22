import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

/**
 * @typedef {object} TabsStoryArgs
 * @property {"horizontal" | "vertical"} orientation Keyboard direction used by the tabs widget.
 * @property {"automatic" | "manual"} activation Whether arrow keys also activate the target panel.
 * @property {number} selectedIndex Initially selected panel index.
 * @property {boolean} disableImplementation Disables the middle tab to show skipped keyboard navigation.
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
function createStory({ orientation, activation, selectedIndex, disableImplementation }) {
    const wrapper = document.createElement("div");
    wrapper.style.padding = "2rem";
    wrapper.style.background = "linear-gradient(180deg, #f9f6f0 0%, #ffffff 100%)";

    const style = document.createElement("style");
    style.textContent = `
        basic-tabs [data-tab][data-selected] {
            background: #3a2d1a;
            border-color: #3a2d1a;
            color: #fff7eb;
        }

        basic-tabs [data-tab]:focus-visible {
            outline: 3px solid #8b5e34;
            outline-offset: 2px;
        }
    `;

    const tabs = document.createElement("basic-tabs");
    tabs.dataset.label = "Eksempelkode";
    tabs.dataset.activation = activation;
    tabs.dataset.selectedIndex = String(selectedIndex);
    tabs.style.display = "grid";
    tabs.style.gap = "1rem";
    tabs.style.maxWidth = "56rem";
    tabs.style.padding = "1.5rem";
    tabs.style.border = "1px solid #d8d1c2";
    tabs.style.background = "#fffdf8";
    tabs.style.boxShadow = "0 1rem 2.5rem rgb(58 45 26 / 0.08)";

    if (orientation === "vertical") {
        tabs.dataset.orientation = orientation;
        tabs.style.gridTemplateColumns = "minmax(12rem, 14rem) minmax(0, 1fr)";
        tabs.style.alignItems = "start";
    }

    const list = document.createElement("div");
    list.dataset.tabsList = "";
    list.style.display = "flex";
    list.style.flexDirection = orientation === "vertical" ? "column" : "row";
    list.style.gap = "0.5rem";
    list.style.flexWrap = "wrap";

    const panels = [];

    for (const [index, item] of TAB_ITEMS.entries()) {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.dataset.tab = "";
        tab.textContent = item.label;
        tab.style.padding = "0.75rem 1rem";
        tab.style.border = "1px solid #c9bea8";
        tab.style.background = "#f6efe2";
        tab.style.color = "#3a2d1a";
        tab.style.font = "inherit";
        tab.style.cursor = "pointer";

        if (disableImplementation && index === 1) {
            tab.disabled = true;
            tab.style.opacity = "0.55";
            tab.style.cursor = "not-allowed";
        }

        list.append(tab);

        const panel = document.createElement("section");
        panel.dataset.tabPanel = "";
        panel.style.padding = "1rem 0 0";
        panel.style.borderTop = orientation === "vertical" ? "none" : "1px solid #e7dfd0";
        panel.innerHTML = `
            <h2 style="margin: 0 0 0.75rem; font-size: 1.125rem;">${item.title}</h2>
            <p style="margin: 0; line-height: 1.6;">${item.body}</p>
        `;
        panels.push(panel);
    }

    tabs.append(list, ...panels);
    wrapper.append(style, tabs);
    return wrapper;
}

export default {
    title: "Basics/Basic Tabs",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element that upgrades existing button-and-panel markup into an accessible tabs interface.

Use it when the page already owns the layout and visual treatment, but still needs predictable roles, ids, and keyboard navigation:

- provide one descendant \`[data-tabs-list]\` container for the tab controls
- provide matching \`[data-tab]\` and \`[data-tab-panel]\` elements in the same order
- optionally set \`data-label\`, \`data-orientation\`, \`data-activation\`, and \`data-selected-index\` on the root element

The component assigns missing ids, keeps inactive panels hidden, and supports click activation plus arrow keys, \`Home\`, and \`End\`.
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
        orientation: "horizontal",
        activation: "automatic",
        selectedIndex: 0,
        disableImplementation: false,
    },
    argTypes: {
        orientation: {
            control: "inline-radio",
            options: ["horizontal", "vertical"],
            description: "Maps to the root `data-orientation` attribute and controls arrow-key direction.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "horizontal",
                },
            },
        },
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
        disableImplementation: {
            control: "boolean",
            description: "Story-only toggle that disables the middle tab.",
            table: {
                category: "Story Controls",
            },
        },
    },
};

export const Default = {};

export const Vertical = {
    args: {
        orientation: "vertical",
    },
    parameters: {
        docs: {
            description: {
                story: "Shows the same markup contract with vertical arrow-key behavior.",
            },
        },
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
        });
    },
};

export const DisabledTabs = {
    args: {
        disableImplementation: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Interaction test proving that keyboard navigation skips disabled tabs.",
            },
        },
    },
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
