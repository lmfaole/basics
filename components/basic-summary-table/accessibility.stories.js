import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory() {
    const wrapper = document.createElement("div");

    const root = document.createElement("basic-summary-table");
    root.dataset.caption = "Fakturagrunnlag";
    root.dataset.rowHeaders = "true";
    root.dataset.summaryColumns = "2,3";
    root.dataset.totalLabel = "Grand total";
    root.dataset.locale = "en-US";

    const table = document.createElement("table");
    table.innerHTML = `
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
    `;

    const updateButton = document.createElement("button");
    updateButton.type = "button";
    updateButton.textContent = "Update line item";
    updateButton.addEventListener("click", () => {
        const hoursCell = table.tBodies[0]?.rows[0]?.cells[1];
        const costCell = table.tBodies[0]?.rows[0]?.cells[2];

        if (hoursCell) {
            hoursCell.dataset.value = "10.75";
            hoursCell.textContent = "10.75";
        }

        if (costCell) {
            costCell.dataset.value = "1600.25";
            costCell.textContent = "$1,600.25";
        }
    });

    root.append(table);
    wrapper.append(updateButton, root);

    return wrapper;
}

export default {
    title: "Testing/Summary Table",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
    render: createStory,
};

export const UpdatesAfterValueChange = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Update line item" }));

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Fakturagrunnlag" });
            const footerRow = table.tFoot?.rows[0];
            const totalRowHeader = within(table).getByRole("rowheader", { name: "Grand total" });
            const costHeader = within(table).getByRole("columnheader", { name: "Kostnad" });
            const hoursTotal = footerRow?.cells[1];
            const costTotal = footerRow?.cells[2];
            const costHeaderIds = costTotal?.getAttribute("headers")?.split(/\s+/) ?? [];

            expect(hoursTotal).toHaveTextContent("25.00");
            expect(costTotal).toHaveTextContent("3,740.25");
            expect(costTotal.getAttribute("data-value")).toBe("3740.25");
            expect(costHeaderIds).toEqual(expect.arrayContaining([totalRowHeader.id, costHeader.id]));
        });
    },
};
