import "./register.js";
import { expect, waitFor, within } from "storybook/test";

/**
 * @typedef {object} BasicTableStoryArgs
 * @property {string} label Fallback accessible name used when no caption is present.
 * @property {string} caption Generated caption inserted when the table does not provide one.
 * @property {string} description Generated description connected through `aria-describedby`.
 * @property {boolean} columnHeaders Promotes the first row to column headers.
 * @property {boolean} rowHeaders Promotes the first cell in each body row to a row header.
 * @property {number} rowHeaderColumn One-based column index used for generated row headers.
 * @property {boolean} usePlainRows Uses bare tbody rows instead of an authored thead.
 * @property {boolean} useAuthorCaption Uses a hand-authored caption to prove it is preserved.
 */

/**
 * @param {BasicTableStoryArgs} args
 */
function createStory({
    label,
    caption,
    description,
    columnHeaders,
    rowHeaders,
    rowHeaderColumn,
    usePlainRows,
    useAuthorCaption,
}) {
    const wrapper = document.createElement("div");

    const tableRoot = document.createElement("basic-table");
    tableRoot.dataset.label = label;

    if (caption) {
        tableRoot.dataset.caption = caption;
    }

    if (description) {
        tableRoot.dataset.description = description;
    }

    if (columnHeaders) {
        tableRoot.dataset.columnHeaders = "true";
    }

    if (rowHeaders) {
        tableRoot.dataset.rowHeaders = "true";
    }

    if (rowHeaderColumn > 1) {
        tableRoot.dataset.rowHeaderColumn = String(rowHeaderColumn);
    }

    const table = document.createElement("table");

    if (useAuthorCaption) {
        const authorCaption = document.createElement("caption");
        authorCaption.textContent = "Bemanning per sprint";
        table.append(authorCaption);
    }

    table.innerHTML += usePlainRows
        ? `
            <tbody>
              <tr>
                <td>Team</td>
                <td>Lokasjon</td>
                <td>Ledige timer</td>
              </tr>
              <tr>
                <td>Plattform</td>
                <td>Oslo</td>
                <td>18</td>
              </tr>
              <tr>
                <td>Designsystem</td>
                <td>Trondheim</td>
                <td>10</td>
              </tr>
            </tbody>
        `
        : `
            <thead>
              <tr>
                <th scope="col">Statuskode</th>
                <th scope="col">Team</th>
                <th scope="col">Lokasjon</th>
                <th scope="col">Ledige timer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>A1</td>
                <td>Plattform</td>
                <td>Oslo</td>
                <td>18</td>
              </tr>
              <tr>
                <td>B4</td>
                <td>Designsystem</td>
                <td>Trondheim</td>
                <td>10</td>
              </tr>
            </tbody>
        `;

    tableRoot.append(table);
    wrapper.append(tableRoot);

    return wrapper;
}

export default {
    title: "Components/Data Display/Table",
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
- optionally set \`data-label\` for fallback naming, \`data-column-headers\` to promote a plain first row, and \`data-row-header-column\` when row labels are not in the first column

The component preserves author-provided captions, assigns missing header ids, infers common header scopes, and keeps each data cell's \`headers\` attribute aligned with the row and column headers that describe it.
                `,
            },
            source: {
                code: `<basic-table
  data-caption="Bemanning per sprint"
  data-description="Viser team, lokasjon og ledig kapasitet per sprint."
  data-row-headers
  data-row-header-column="2"
>
  <table>
    <thead>
      <tr>
        <th>Statuskode</th>
        <th>Team</th>
        <th>Lokasjon</th>
        <th>Ledige timer</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>A1</td>
        <td>Plattform</td>
        <td>Oslo</td>
        <td>18</td>
      </tr>
    </tbody>
  </table>
</basic-table>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Bemanning",
        caption: "Bemanning per sprint",
        description: "",
        columnHeaders: false,
        rowHeaders: true,
        rowHeaderColumn: 2,
        usePlainRows: false,
        useAuthorCaption: false,
    },
    argTypes: {
        label: {
            control: "text",
            description: "Maps to `data-label` and becomes the fallback accessible name when the table has no caption.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "Tabell",
                },
            },
        },
        caption: {
            control: "text",
            description: "Maps to `data-caption` and generates a visible `<caption>` when the table does not already define one.",
            table: {
                category: "Attributes",
            },
        },
        description: {
            control: "text",
            description: "Maps to `data-description` and generates a hidden description connected through `aria-describedby`.",
            table: {
                category: "Attributes",
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
            control: { type: "number", min: 1, max: 4, step: 1 },
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
        useAuthorCaption: {
            control: "boolean",
            description: "Story-only toggle that adds a hand-authored caption to the underlying table.",
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
                story: "Accessibility test proving that the generated caption, row headers, and `headers` associations are wired automatically for a standard data table.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Bemanning per sprint" });
            const caption = table.querySelector("caption");
            const statusCodeHeader = within(table).getByRole("columnheader", { name: "Statuskode" });
            const teamHeader = within(table).getByRole("columnheader", { name: "Team" });
            const locationHeader = within(table).getByRole("columnheader", { name: "Lokasjon" });
            const hoursHeader = within(table).getByRole("columnheader", { name: "Ledige timer" });
            const platformRowHeader = within(table).getByRole("rowheader", { name: "Plattform" });
            const osloCell = table.tBodies[0]?.rows[0]?.cells[2];
            const availableCell = table.tBodies[0]?.rows[0]?.cells[3];
            const osloHeaderIds = osloCell?.getAttribute("headers")?.split(/\s+/) ?? [];
            const availableHeaderIds = availableCell?.getAttribute("headers")?.split(/\s+/) ?? [];

            expect(caption).toHaveTextContent("Bemanning per sprint");
            expect(table).not.toHaveAttribute("aria-label");
            expect(statusCodeHeader).toHaveAttribute("scope", "col");
            expect(teamHeader).toHaveAttribute("scope", "col");
            expect(locationHeader).toHaveAttribute("scope", "col");
            expect(hoursHeader).toHaveAttribute("scope", "col");
            expect(platformRowHeader.tagName).toBe("TH");
            expect(platformRowHeader).toHaveAttribute("scope", "row");
            expect(osloHeaderIds).toEqual(expect.arrayContaining([platformRowHeader.id, locationHeader.id]));
            expect(availableHeaderIds).toEqual(expect.arrayContaining([platformRowHeader.id, hoursHeader.id]));
        });
    },
};

export const AddsDescription = {
    args: {
        description: "Viser team, lokasjon og ledig kapasitet per sprint.",
    },
    parameters: {
        docs: {
            description: {
                story: "Accessibility test proving that a generated description is connected through `aria-describedby` without forcing consumers to author another helper node.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Bemanning per sprint" });
            const description = canvasElement.querySelector("[data-basic-table-generated-description]");

            expect(description).toHaveTextContent("Viser team, lokasjon og ledig kapasitet per sprint.");
            expect(description).toHaveAttribute("hidden");
            expect(table.getAttribute("aria-describedby")).toContain(description.id);
        });
    },
};

export const LabelFallback = {
    args: {
        caption: "",
        label: "Bemanningstabell",
    },
    parameters: {
        docs: {
            description: {
                story: "Accessibility test proving that the root `data-label` becomes the table name when no authored or generated caption is present.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Bemanningstabell" });

            expect(table).toHaveAttribute("aria-label", "Bemanningstabell");
            expect(table.querySelector("caption")).toBeNull();
        });
    },
};

export const PreservesAuthorCaption = {
    args: {
        useAuthorCaption: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Accessibility test proving that an existing caption is preserved instead of being replaced by the generated one.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Bemanning per sprint" });
            const caption = table.querySelector("caption");

            expect(caption).toHaveTextContent("Bemanning per sprint");
            expect(caption).not.toHaveAttribute("data-basic-table-generated-caption");
        });
    },
};

export const PromotesFirstRowToColumnHeaders = {
    args: {
        caption: "",
        columnHeaders: true,
        label: "Kapasitetstabell",
        rowHeaders: false,
        rowHeaderColumn: 1,
        usePlainRows: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Accessibility test proving that a plain first row can be promoted to column headers when the author does not provide a thead.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Kapasitetstabell" });
            const firstHeader = table.tBodies[0]?.rows[0]?.cells[0];
            const locationHeader = within(table).getByRole("columnheader", { name: "Lokasjon" });
            const platformCell = table.tBodies[0]?.rows[1]?.cells[0];
            const trondheimCell = table.tBodies[0]?.rows[2]?.cells[1];

            expect(firstHeader.tagName).toBe("TH");
            expect(firstHeader).toHaveAttribute("scope", "col");
            expect(platformCell.tagName).toBe("TD");
            expect(within(table).queryByRole("rowheader", { name: "Plattform" })).toBeNull();
            expect(platformCell.getAttribute("headers")).toContain(firstHeader.id);
            expect(trondheimCell.getAttribute("headers")).toContain(locationHeader.id);
        });
    },
};
