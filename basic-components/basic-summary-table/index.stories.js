import "./register.js";
import { expect, waitFor, within } from "storybook/test";

const SEPARATOR_OPTIONS = ["rows", "columns", "both"];

/**
 * @typedef {object} SummaryTableStoryArgs
 * @property {string} caption Generated caption inserted when the table does not provide one.
 * @property {string} description Generated description connected through `aria-describedby`.
 * @property {string} summaryColumns Comma-separated one-based columns that should be totalled.
 * @property {string} totalLabel Label used for the generated footer row.
 * @property {string} locale Locale passed to `Intl.NumberFormat`.
 * @property {boolean} zebra Applies alternating row backgrounds when the optional starter styling is enabled.
 * @property {"rows" | "columns" | "both"} separators Controls whether starter styling draws separators between rows, columns, or both.
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
    zebra,
    separators,
    useDataValues,
}) {
    const root = document.createElement("basic-summary-table");
    root.dataset.rowHeaders = "true";

    if (caption) {
        root.dataset.caption = caption;
    }

    if (description) {
        root.dataset.description = description;
    }

    if (summaryColumns) {
        root.dataset.summaryColumns = summaryColumns;
    }

    if (totalLabel) {
        root.dataset.totalLabel = totalLabel;
    }

    if (locale) {
        root.dataset.locale = locale;
    }

    if (zebra) {
        root.dataset.zebra = "";
    }

    root.dataset.separators = separators;

    const table = document.createElement("table");
    table.innerHTML = useDataValues
        ? `
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Hours</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Consulting</td>
                <td data-value="8.5">8,5 h</td>
                <td data-value="1250.50">1 250,50 kr</td>
              </tr>
              <tr>
                <td>Implementation</td>
                <td data-value="14.25">14,25 h</td>
                <td data-value="2140.00">2 140,00 kr</td>
              </tr>
              <tr>
                <td>QA</td>
                <td data-value="6.75">6,75 h</td>
                <td data-value="810.00">810,00 kr</td>
              </tr>
              <tr>
                <td>Support</td>
                <td data-value="3.25">3,25 h</td>
                <td data-value="420.00">420,00 kr</td>
              </tr>
              <tr>
                <td>Research</td>
                <td data-value="4.5">4,5 h</td>
                <td data-value="560.00">560,00 kr</td>
              </tr>
              <tr>
                <td>Rollout</td>
                <td data-value="2.0">2,0 h</td>
                <td data-value="300.00">300,00 kr</td>
              </tr>
            </tbody>
        `
        : `
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Count</th>
                <th scope="col">Unit price</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Base subscription</td>
                <td>12</td>
                <td>49,00 kr</td>
                <td>588,00 kr</td>
              </tr>
              <tr>
                <td>Support contract</td>
                <td>1</td>
                <td>299,00 kr</td>
                <td>299,00 kr</td>
              </tr>
              <tr>
                <td>Storage add-on</td>
                <td>4</td>
                <td>120,00 kr</td>
                <td>480,00 kr</td>
              </tr>
              <tr>
                <td>Training seats</td>
                <td>3</td>
                <td>180,00 kr</td>
                <td>540,00 kr</td>
              </tr>
              <tr>
                <td>Delivery</td>
                <td>1</td>
                <td>95,00 kr</td>
                <td>95,00 kr</td>
              </tr>
              <tr>
                <td>Priority support</td>
                <td>2</td>
                <td>225,00 kr</td>
                <td>450,00 kr</td>
              </tr>
            </tbody>
        `;

    root.append(table);
    return root;
}

export default {
    title: "Custom Elements/Summary Table",
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
- optionally add \`data-zebra\` when you use \`basic-styling\` and want alternating body-row backgrounds
- optionally set \`data-separators="rows" | "columns" | "both"\` when you use \`basic-styling\` and want to control interior dividers
                `,
            },
            source: {
                code: `<basic-summary-table data-caption="Monthly costs" data-row-headers data-summary-columns="2,4" data-separators="rows">
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Count</th>
        <th>Unit price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Base subscription</td>
        <td>12</td>
        <td>49,00 kr</td>
        <td>588,00 kr</td>
      </tr>
      <tr>
        <td>Support contract</td>
        <td>1</td>
        <td>299,00 kr</td>
        <td>299,00 kr</td>
      </tr>
      <tr>
        <td>Storage add-on</td>
        <td>4</td>
        <td>120,00 kr</td>
        <td>480,00 kr</td>
      </tr>
    </tbody>
  </table>
</basic-summary-table>`,
            },
        },
    },
    render: createStory,
    args: {
        caption: "Monthly costs",
        description: "",
        summaryColumns: "2,4",
        totalLabel: "Total",
        locale: "nb-NO",
        zebra: false,
        separators: "rows",
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
            description: "Maps to `data-description` and generates helper text connected through `aria-describedby`.",
            table: {
                category: "Attributes",
            },
        },
        summaryColumns: {
            control: "text",
            description: "Maps to `data-summary-columns` and selects which one-based columns are totalled.",
            table: {
                category: "Attributes",
            },
        },
        totalLabel: {
            control: "text",
            description: "Maps to `data-total-label` and becomes the footer row label.",
            table: {
                category: "Attributes",
            },
        },
        locale: {
            control: "text",
            description: "Maps to `data-locale` and controls `Intl.NumberFormat` output in the footer.",
            table: {
                category: "Attributes",
            },
        },
        zebra: {
            control: "boolean",
            description: "Starter styling hook that adds alternating body-row backgrounds when `basic-styling` is enabled.",
            table: {
                category: "Starter Styling",
            },
        },
        separators: {
            control: "inline-radio",
            options: SEPARATOR_OPTIONS,
            description: "Starter styling hook that controls whether interior separators appear between rows, columns, or both.",
            table: {
                category: "Starter Styling",
            },
        },
        useDataValues: {
            control: "boolean",
            description: "Story-only toggle that uses formatted cell text backed by raw `data-value` attributes.",
            table: {
                category: "Story Controls",
            },
        },
    },
};

export const Default = {};

export const UsesDataValueOverrides = {
    args: {
        caption: "Invoice basis",
        description: "Shows summed hours and totals while the body keeps its own formatting.",
        summaryColumns: "2,3",
        totalLabel: "Total",
        useDataValues: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Invoice basis" });
            const footerRow = table.tFoot?.rows[0];
            const totalRowHeader = within(table).getByRole("rowheader", { name: "Total" });
            const amountHeader = within(table).getByRole("columnheader", { name: "Amount" });
            const hoursTotal = footerRow?.cells[1];
            const amountTotal = footerRow?.cells[2];
            const description = canvasElement.querySelector("[data-basic-table-generated-description]");
            const amountHeaderIds = amountTotal?.getAttribute("headers")?.split(/\s+/) ?? [];

            expect(hoursTotal).toHaveTextContent("39,25 h");
            expect(amountTotal?.textContent ?? "").toMatch(/5(?:\s|\u00a0)480,50 kr/);
            expect(amountTotal?.getAttribute("data-value")).toBe("5480.5");
            expect(description).toHaveTextContent("Shows summed hours and totals while the body keeps its own formatting.");
            expect(table.getAttribute("aria-describedby")).toContain(description.id);
            expect(amountHeaderIds).toEqual(expect.arrayContaining([totalRowHeader.id, amountHeader.id]));
        });
    },
};

export const ZebraStripes = {
    args: {
        zebra: true,
    },
    globals: {
        starterTheme: "light",
    },
    parameters: {
        docs: {
            description: {
                story: "Enable `data-zebra` when you use the optional starter styling and want alternating body-row backgrounds without affecting the generated footer row.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const bodyRows = canvasElement.querySelectorAll("tbody tr");
        const footerRow = canvasElement.querySelector("tfoot tr");

        await waitFor(() => {
            const firstRowBackground = getComputedStyle(bodyRows[0].cells[0]).backgroundColor;
            const secondRowBackground = getComputedStyle(bodyRows[1].cells[0]).backgroundColor;
            const fourthRowBackground = getComputedStyle(bodyRows[3].cells[0]).backgroundColor;
            const footerBackground = getComputedStyle(footerRow.cells[0]).backgroundColor;

            expect(bodyRows).toHaveLength(6);
            expect(firstRowBackground).not.toBe(secondRowBackground);
            expect(secondRowBackground).toBe(fourthRowBackground);
            expect(footerBackground).not.toBe(secondRowBackground);
        });
    },
};

export const BothSeparators = {
    args: {
        separators: "both",
    },
    globals: {
        starterTheme: "light",
    },
    parameters: {
        docs: {
            description: {
                story: "Set `data-separators=\"both\"` when the starter styling should draw both row and column dividers, including the summary section split.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const firstBodyRow = canvasElement.querySelector("tbody tr");
        const firstCell = firstBodyRow.cells[0];
        const footerRow = canvasElement.querySelector("tfoot tr");

        await waitFor(() => {
            const firstCellStyles = getComputedStyle(firstCell);
            const footerFirstCellStyles = getComputedStyle(footerRow.cells[0]);

            expect(firstCellStyles.getPropertyValue("border-inline-end-width")).toBe("1px");
            expect(firstCellStyles.getPropertyValue("border-block-end-width")).toBe("1px");
            expect(footerFirstCellStyles.getPropertyValue("border-block-start-width")).toBe("2px");
        });
    },
};
