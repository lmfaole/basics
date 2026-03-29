import "./register.js";
import { expect, waitFor, within } from "storybook/test";

const SEPARATOR_OPTIONS = ["rows", "columns", "both"];

/**
 * @typedef {object} TableStoryArgs
 * @property {string} label Fallback accessible name used when no caption is present.
 * @property {string} caption Generated caption inserted when the table does not provide one.
 * @property {string} description Generated description connected through `aria-describedby`.
 * @property {boolean} zebra Applies alternating row backgrounds when the optional starter styling is enabled.
 * @property {"rows" | "columns" | "both"} separators Controls whether starter styling draws separators between rows, columns, or both.
 * @property {boolean} columnHeaders Promotes the first row to column headers.
 * @property {boolean} rowHeaders Promotes one body column to row headers.
 * @property {number} rowHeaderColumn One-based column index used for generated row headers.
 * @property {boolean} usePlainRows Uses bare tbody rows instead of an authored thead.
 */

/**
 * @param {TableStoryArgs} args
 */
function createStory({
    label,
    caption,
    description,
    zebra,
    separators,
    columnHeaders,
    rowHeaders,
    rowHeaderColumn,
    usePlainRows,
}) {
    const root = document.createElement("basic-table");
    root.dataset.label = label;

    if (caption) {
        root.dataset.caption = caption;
    }

    if (description) {
        root.dataset.description = description;
    }

    if (zebra) {
        root.dataset.zebra = "";
    }

    root.dataset.separators = separators;

    if (columnHeaders) {
        root.dataset.columnHeaders = "true";
    }

    if (rowHeaders) {
        root.dataset.rowHeaders = "true";
    } else if (rowHeaderColumn > 1) {
        root.dataset.rowHeaders = "false";
    }

    if (rowHeaderColumn > 1) {
        root.dataset.rowHeaderColumn = String(rowHeaderColumn);
    }

    const table = document.createElement("table");
    table.innerHTML = usePlainRows
        ? `
            <tbody>
              <tr>
                <td>Team</td>
                <td>Location</td>
                <td>Sprint</td>
                <td>Available hours</td>
              </tr>
              <tr>
                <td>Platform</td>
                <td>Oslo</td>
                <td>14</td>
                <td>18</td>
              </tr>
              <tr>
                <td>Design system</td>
                <td>Trondheim</td>
                <td>14</td>
                <td>10</td>
              </tr>
              <tr>
                <td>Insights</td>
                <td>Bergen</td>
                <td>15</td>
                <td>26</td>
              </tr>
              <tr>
                <td>Payments</td>
                <td>Stockholm</td>
                <td>15</td>
                <td>8</td>
              </tr>
              <tr>
                <td>Mobile</td>
                <td>Copenhagen</td>
                <td>16</td>
                <td>12</td>
              </tr>
              <tr>
                <td>Core web</td>
                <td>Helsinki</td>
                <td>16</td>
                <td>22</td>
              </tr>
            </tbody>
        `
        : `
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col">Team</th>
                <th scope="col">Location</th>
                <th scope="col">Sprint</th>
                <th scope="col">Available hours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A1</td>
                <td>Platform</td>
                <td>Oslo</td>
                <td>14</td>
                <td>18</td>
              </tr>
              <tr>
                <td>B4</td>
                <td>Design system</td>
                <td>Trondheim</td>
                <td>14</td>
                <td>10</td>
              </tr>
              <tr>
                <td>C2</td>
                <td>Insights</td>
                <td>Bergen</td>
                <td>15</td>
                <td>26</td>
              </tr>
              <tr>
                <td>D7</td>
                <td>Payments</td>
                <td>Stockholm</td>
                <td>15</td>
                <td>8</td>
              </tr>
              <tr>
                <td>E3</td>
                <td>Mobile</td>
                <td>Copenhagen</td>
                <td>16</td>
                <td>12</td>
              </tr>
              <tr>
                <td>F6</td>
                <td>Core web</td>
                <td>Helsinki</td>
                <td>16</td>
                <td>22</td>
              </tr>
            </tbody>
        `;

    root.append(table);
    return root;
}

export default {
    title: "Custom Elements/Table",
    tags: ["table", "data-display", "basic-table"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Unstyled custom element that upgrades a regular \`<table>\` with stronger accessible naming and header relationships.

Use it when your app already owns the visual table styling, but you want a safer default accessibility baseline:

- provide one descendant \`<table>\`
- optionally set \`data-caption\` to generate a visible caption when the table has none
- optionally set \`data-description\` for extra screen-reader context
- optionally set \`data-label\`, \`data-column-headers\`, and \`data-row-header-column\`
- optionally add \`data-zebra\` when you use \`basic-styling\` and want alternating body-row backgrounds
- optionally set \`data-separators="rows" | "columns" | "both"\` when you use \`basic-styling\` and want to control interior dividers
                `,
            },
            source: {
                code: `<basic-table data-caption="Sprint staffing" data-description="Shows team capacity per sprint." data-row-headers data-row-header-column="2" data-separators="rows">
  <table>
    <thead>
      <tr>
        <th>Status</th>
        <th>Team</th>
        <th>Location</th>
        <th>Sprint</th>
        <th>Available hours</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>A1</td>
        <td>Platform</td>
        <td>Oslo</td>
        <td>14</td>
        <td>18</td>
      </tr>
      <tr>
        <td>B4</td>
        <td>Design system</td>
        <td>Trondheim</td>
        <td>14</td>
        <td>10</td>
      </tr>
      <tr>
        <td>C2</td>
        <td>Insights</td>
        <td>Bergen</td>
        <td>15</td>
        <td>26</td>
      </tr>
    </tbody>
  </table>
</basic-table>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Sprint staffing",
        caption: "Sprint staffing",
        description: "",
        zebra: false,
        separators: "rows",
        columnHeaders: false,
        rowHeaders: true,
        rowHeaderColumn: 2,
        usePlainRows: false,
    },
    argTypes: {
        label: {
            control: "text",
            description: "Maps to `data-label` and becomes the fallback accessible name when the table has no caption.",
            table: {
                category: "Attributes",
            },
        },
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
        columnHeaders: {
            control: "boolean",
            description: "Maps to `data-column-headers` and promotes the first row to column headers for plain tables.",
            table: {
                category: "Attributes",
            },
        },
        rowHeaders: {
            control: "boolean",
            description: "Maps to `data-row-headers` and enables generated row headers in tbody rows.",
            table: {
                category: "Attributes",
            },
        },
        rowHeaderColumn: {
            control: { type: "number", min: 1, max: 5, step: 1 },
            description: "Maps to `data-row-header-column` and picks which one-based column should act as the row header.",
            table: {
                category: "Attributes",
            },
        },
        usePlainRows: {
            control: "boolean",
            description: "Story-only toggle that removes the authored thead so first-row promotion can be demonstrated.",
            table: {
                category: "Story Controls",
            },
        },
    },
};

export const Default = {};

export const AddsDescription = {
    args: {
        description: "Shows team, location, and available capacity per sprint.",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Sprint staffing" });
            const description = canvasElement.querySelector("[data-basic-table-generated-description]");

            expect(description).toHaveTextContent("Shows team, location, and available capacity per sprint.");
            expect(description).toHaveAttribute("hidden");
            expect(table.getAttribute("aria-describedby")).toContain(description.id);
        });
    },
};

export const LabelFallback = {
    args: {
        caption: "",
        label: "Capacity table",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Capacity table" });

            expect(table).toHaveAttribute("aria-label", "Capacity table");
            expect(table.querySelector("caption")).toBeNull();
        });
    },
};

export const PromotesFirstRowToColumnHeaders = {
    args: {
        caption: "",
        label: "Capacity table",
        columnHeaders: true,
        rowHeaders: false,
        rowHeaderColumn: 1,
        usePlainRows: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Capacity table" });
            const firstHeader = table.tBodies[0]?.rows[0]?.cells[0];
            const locationHeader = within(table).getByRole("columnheader", { name: "Location" });
            const platformCell = table.tBodies[0]?.rows[1]?.cells[0];
            const trondheimCell = table.tBodies[0]?.rows[2]?.cells[1];

            expect(firstHeader.tagName).toBe("TH");
            expect(firstHeader).toHaveAttribute("scope", "col");
            expect(platformCell.tagName).toBe("TD");
            expect(platformCell.getAttribute("headers")).toContain(firstHeader.id);
            expect(trondheimCell.getAttribute("headers")).toContain(locationHeader.id);
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
                story: "Enable `data-zebra` when you use the optional starter styling and want alternating body-row backgrounds.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const bodyRows = canvasElement.querySelectorAll("tbody tr");

        await waitFor(() => {
            const firstRowBackground = getComputedStyle(bodyRows[0].cells[0]).backgroundColor;
            const secondRowBackground = getComputedStyle(bodyRows[1].cells[0]).backgroundColor;
            const fourthRowBackground = getComputedStyle(bodyRows[3].cells[0]).backgroundColor;

            expect(bodyRows).toHaveLength(6);
            expect(firstRowBackground).not.toBe(secondRowBackground);
            expect(secondRowBackground).toBe(fourthRowBackground);
        });
    },
};

export const ColumnSeparators = {
    args: {
        separators: "columns",
    },
    globals: {
        starterTheme: "light",
    },
    parameters: {
        docs: {
            description: {
                story: "Set `data-separators=\"columns\"` when the starter styling should draw vertical dividers without horizontal row separators.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const firstBodyRow = canvasElement.querySelector("tbody tr");
        const firstCell = firstBodyRow.cells[0];
        const secondCell = firstBodyRow.cells[1];

        await waitFor(() => {
            const firstCellStyles = getComputedStyle(firstCell);
            const secondCellStyles = getComputedStyle(secondCell);

            expect(firstCellStyles.getPropertyValue("border-inline-end-width")).toBe("1px");
            expect(firstCellStyles.getPropertyValue("border-block-end-width")).toBe("0px");
            expect(secondCellStyles.getPropertyValue("border-inline-end-width")).toBe("1px");
        });
    },
};
