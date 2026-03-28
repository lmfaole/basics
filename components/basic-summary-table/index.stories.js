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
                <th scope="col">Beløp</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rådgivning</td>
                <td data-value="8.5">8,5 t</td>
                <td data-value="1250.50">1 250,50 kr</td>
              </tr>
              <tr>
                <td>Implementering</td>
                <td data-value="14.25">14,25 t</td>
                <td data-value="2140.00">2 140,00 kr</td>
              </tr>
              <tr>
                <td>QA</td>
                <td data-value="6.75">6,75 t</td>
                <td data-value="810.00">810,00 kr</td>
              </tr>
              <tr>
                <td>Support</td>
                <td data-value="3.25">3,25 t</td>
                <td data-value="420.00">420,00 kr</td>
              </tr>
            </tbody>
        `
        : `
            <thead>
              <tr>
                <th scope="col">Post</th>
                <th scope="col">Antall</th>
                <th scope="col">Enhetspris</th>
                <th scope="col">Beløp</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basisabonnement</td>
                <td>12</td>
                <td>49,00 kr</td>
                <td>588,00 kr</td>
              </tr>
              <tr>
                <td>Supportavtale</td>
                <td>1</td>
                <td>299,00 kr</td>
                <td>299,00 kr</td>
              </tr>
              <tr>
                <td>Lagringstillegg</td>
                <td>4</td>
                <td>120,00 kr</td>
                <td>480,00 kr</td>
              </tr>
              <tr>
                <td>Opplæringsplasser</td>
                <td>3</td>
                <td>180,00 kr</td>
                <td>540,00 kr</td>
              </tr>
              <tr>
                <td>Levering</td>
                <td>1</td>
                <td>95,00 kr</td>
                <td>95,00 kr</td>
              </tr>
            </tbody>
        `;

    root.append(table);
    wrapper.append(root);

    return wrapper;
}

export default {
    title: "Components/Summary Table",
    tags: ["summary-table", "table", "totals", "data-display", "basic-summary-table"],
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
  data-caption="Månedlig kostnadsoversikt"
  data-description="Viser antall og summerte beløp for faste kostnader."
  data-row-headers
  data-summary-columns="2,4"
  data-total-label="Totalt"
  data-locale="nb-NO"
>
  <table>
    <thead>
      <tr>
        <th>Post</th>
        <th>Antall</th>
        <th>Enhetspris</th>
        <th>Beløp</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Basisabonnement</td>
        <td>12</td>
        <td>49,00 kr</td>
        <td>588,00 kr</td>
      </tr>
      <tr>
        <td>Supportavtale</td>
        <td>1</td>
        <td>299,00 kr</td>
        <td>299,00 kr</td>
      </tr>
      <tr>
        <td>Lagringstillegg</td>
        <td>4</td>
        <td>120,00 kr</td>
        <td>480,00 kr</td>
      </tr>
      <tr>
        <td>Opplæringsplasser</td>
        <td>3</td>
        <td>180,00 kr</td>
        <td>540,00 kr</td>
      </tr>
    </tbody>
  </table>
</basic-summary-table>`,
            },
        },
    },
    render: createStory,
    args: {
        caption: "Månedlig kostnadsoversikt",
        description: "",
        summaryColumns: "2,4",
        totalLabel: "Totalt",
        locale: "nb-NO",
        useDataValues: false,
    },
    argTypes: {
        caption: {
            control: "text",
            description: "Maps to `data-caption` and generates a visible caption when the table does not already define one.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "none",
                },
            },
        },
        description: {
            control: "text",
            description: "Maps to `data-description` and generates hidden helper text connected through `aria-describedby`.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "none",
                },
            },
        },
        summaryColumns: {
            control: "text",
            description: "Maps to `data-summary-columns` and selects which one-based columns are totalled in the footer.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "infer numeric columns",
                },
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
                defaultValue: {
                    summary: "browser default",
                },
            },
        },
        useDataValues: {
            control: "boolean",
            description: "Story-only toggle that uses formatted currency text backed by raw `data-value` attributes.",
            table: {
                category: "Story Controls",
                defaultValue: {
                    summary: "false",
                },
            },
        },
    },
};

export const Default = {
    parameters: {
        docs: {
            description: {
                story: "Configurable summary table example with Norwegian defaults, kroner-formatted values, and generated totals.",
            },
        },
    },
};

export const UsesDataValueOverrides = {
    args: {
        caption: "Fakturagrunnlag",
        description: "Viser summerte timer og beløp med formatterte visningsverdier.",
        locale: "nb-NO",
        summaryColumns: "2,3",
        totalLabel: "Totalt",
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
            const totalRowHeader = within(table).getByRole("rowheader", { name: "Totalt" });
            const costHeader = within(table).getByRole("columnheader", { name: "Beløp" });
            const hoursTotal = footerRow?.cells[1];
            const costTotal = footerRow?.cells[2];
            const description = canvasElement.querySelector("[data-basic-table-generated-description]");
            const costHeaderIds = costTotal?.getAttribute("headers")?.split(/\s+/) ?? [];

            expect(hoursTotal).toHaveTextContent("32,75 t");
            expect(costTotal?.textContent ?? "").toMatch(/4(?:\s|\u00a0)620,50 kr/);
            expect(costTotal.getAttribute("data-value")).toBe("4620.5");
            expect(description).toHaveTextContent("Viser summerte timer og beløp med formatterte visningsverdier.");
            expect(description).toHaveAttribute("hidden");
            expect(table.getAttribute("aria-describedby")).toContain(description.id);
            expect(costHeaderIds).toEqual(expect.arrayContaining([totalRowHeader.id, costHeader.id]));
        });
    },
};
