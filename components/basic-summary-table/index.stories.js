import "./register.js";
import { expect, waitFor, within } from "storybook/test";

/**
 * @typedef {object} SummaryTableStoryArgs
 * @property {string} caption Generated caption inserted when the table does not provide one.
 * @property {string} description Generated description connected through `aria-describedby`.
 * @property {string} summaryColumns Comma-separated one-based columns that should be totalled.
 * @property {string} totalLabel Label used for the generated footer row.
 * @property {string} locale Locale passed to `Intl.NumberFormat`.
 * @property {boolean} useDataValues Uses formatted display values backed by raw `data-value` attributes.
 */

/**
 * @param {SummaryTableStoryArgs} args
 */
function createStory({
    caption,
    description,
    summaryColumns,
    totalLabel,
    locale,
    useDataValues,
}) {
    const wrapper = document.createElement("div");

    const root = document.createElement("basic-summary-table");
    root.dataset.caption = caption;
    root.dataset.rowHeaders = "true";
    root.dataset.summaryColumns = summaryColumns;

    if (description) {
        root.dataset.description = description;
    }

    if (totalLabel) {
        root.dataset.totalLabel = totalLabel;
    }

    if (locale) {
        root.dataset.locale = locale;
    }

    const table = document.createElement("table");

    table.innerHTML = useDataValues
        ? `
            <thead>
              <tr>
                <th scope="col">Post</th>
                <th scope="col">Timer</th>
                <th scope="col">Kostnad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Analyse</td>
                <td data-value="8.5">8.5</td>
                <td data-value="1250.50">$1,250.50</td>
              </tr>
              <tr>
                <td>Implementasjon</td>
                <td data-value="14.25">14.25</td>
                <td data-value="2140.00">$2,140.00</td>
              </tr>
            </tbody>
        `
        : `
            <thead>
              <tr>
                <th scope="col">Post</th>
                <th scope="col">Timer</th>
                <th scope="col">Sats</th>
                <th scope="col">Kostnad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Analyse</td>
                <td>8</td>
                <td>100</td>
                <td>800</td>
              </tr>
              <tr>
                <td>Implementasjon</td>
                <td>12</td>
                <td>120</td>
                <td>1440</td>
              </tr>
              <tr>
                <td>QA</td>
                <td>6</td>
                <td>90</td>
                <td>540</td>
              </tr>
            </tbody>
        `;

    root.append(table);
    wrapper.append(root);

    return wrapper;
}

export default {
    title: "Components/Data Display/Summary Table",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element focused on calculation-heavy summary tables.

Use it when you want a regular semantic table plus an automatically maintained totals row in \`<tfoot>\`:

- provide one descendant \`<table>\` with line items in \`<tbody>\`
- set \`data-summary-columns\` when you want explicit control over which one-based columns are totalled
- optionally set \`data-total-label\`, \`data-locale\`, and \`data-description\`

The component inherits the accessible naming and row-header behavior from \`basic-table\`, parses numeric values from cell text or \`data-value\`, and keeps a generated footer row in sync with the body rows.
                `,
            },
            source: {
                code: `<basic-summary-table
  data-caption="Prosjektsammendrag"
  data-description="Viser timer og total kostnad for prosjektets leveranser."
  data-row-headers
  data-summary-columns="2,4"
  data-total-label="Totalt"
>
  <table>
    <thead>
      <tr>
        <th>Post</th>
        <th>Timer</th>
        <th>Sats</th>
        <th>Kostnad</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Analyse</td>
        <td>8</td>
        <td>100</td>
        <td>800</td>
      </tr>
    </tbody>
  </table>
</basic-summary-table>`,
            },
        },
    },
    render: createStory,
    args: {
        caption: "Prosjektsammendrag",
        description: "",
        summaryColumns: "2,4",
        totalLabel: "Totalt",
        locale: "",
        useDataValues: false,
    },
    argTypes: {
        caption: {
            control: "text",
            description: "Maps to `data-caption` and generates a visible caption when the table does not already define one.",
            table: {
                category: "Attributes",
            },
        },
        description: {
            control: "text",
            description: "Maps to `data-description` and generates hidden helper text connected through `aria-describedby`.",
            table: {
                category: "Attributes",
            },
        },
        summaryColumns: {
            control: "text",
            description: "Maps to `data-summary-columns` and selects which one-based columns are totalled in the footer.",
            table: {
                category: "Attributes",
            },
        },
        totalLabel: {
            control: "text",
            description: "Maps to `data-total-label` and becomes the footer row label.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "Totalt",
                },
            },
        },
        locale: {
            control: "text",
            description: "Maps to `data-locale` and controls `Intl.NumberFormat` output in the footer.",
            table: {
                category: "Attributes",
            },
        },
        useDataValues: {
            control: "boolean",
            description: "Story-only toggle that uses formatted currency text backed by raw `data-value` attributes.",
            table: {
                category: "Story Controls",
            },
        },
    },
};

export const Default = {
    parameters: {
        docs: {
            description: {
                story: "Accessibility test proving that a generated footer row exposes totals in `tfoot` and keeps the footer label as a row header.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Prosjektsammendrag" });
            const footerRow = table.tFoot?.rows[0];
            const footerLabel = footerRow?.cells[0];
            const totalRowHeader = within(table).getByRole("rowheader", { name: "Totalt" });
            const analysisRowHeader = within(table).getByRole("rowheader", { name: "Analyse" });
            const hoursHeader = within(table).getByRole("columnheader", { name: "Timer" });
            const costHeader = within(table).getByRole("columnheader", { name: "Kostnad" });
            const hoursTotal = footerRow?.cells[1];
            const costTotal = footerRow?.cells[3];
            const hoursHeaderIds = hoursTotal?.getAttribute("headers")?.split(/\s+/) ?? [];
            const costHeaderIds = costTotal?.getAttribute("headers")?.split(/\s+/) ?? [];

            expect(footerLabel.tagName).toBe("TH");
            expect(table).not.toHaveAttribute("aria-label");
            expect(footerLabel).toHaveAttribute("scope", "row");
            expect(footerLabel).toHaveTextContent("Totalt");
            expect(totalRowHeader).toBe(footerLabel);
            expect(analysisRowHeader).toHaveAttribute("scope", "row");
            expect(hoursTotal).toHaveTextContent("26");
            expect(costTotal.getAttribute("data-value")).toBe("2780");
            expect(hoursHeaderIds).toEqual(expect.arrayContaining([footerLabel.id, hoursHeader.id]));
            expect(costHeaderIds).toEqual(expect.arrayContaining([footerLabel.id, costHeader.id]));
        });
    },
};

export const UsesDataValueOverrides = {
    args: {
        caption: "Fakturagrunnlag",
        description: "Viser summerte timer og kostnader med formatterte visningsverdier.",
        locale: "en-US",
        summaryColumns: "2,3",
        totalLabel: "Grand total",
        useDataValues: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Accessibility test proving that footer totals can be calculated from raw `data-value` attributes while the body cells remain independently formatted.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Fakturagrunnlag" });
            const footerRow = table.tFoot?.rows[0];
            const totalRowHeader = within(table).getByRole("rowheader", { name: "Grand total" });
            const costHeader = within(table).getByRole("columnheader", { name: "Kostnad" });
            const hoursTotal = footerRow?.cells[1];
            const costTotal = footerRow?.cells[2];
            const description = canvasElement.querySelector("[data-basic-table-generated-description]");
            const costHeaderIds = costTotal?.getAttribute("headers")?.split(/\s+/) ?? [];

            expect(hoursTotal).toHaveTextContent("22.75");
            expect(costTotal).toHaveTextContent("3,390.50");
            expect(costTotal.getAttribute("data-value")).toBe("3390.5");
            expect(description).toHaveTextContent("Viser summerte timer og kostnader med formatterte visningsverdier.");
            expect(description).toHaveAttribute("hidden");
            expect(table.getAttribute("aria-describedby")).toContain(description.id);
            expect(costHeaderIds).toEqual(expect.arrayContaining([totalRowHeader.id, costHeader.id]));
        });
    },
};
