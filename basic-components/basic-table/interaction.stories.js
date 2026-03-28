import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory() {
    const wrapper = document.createElement("div");
    const root = document.createElement("basic-table");
    root.dataset.label = "Bemanning";
    root.dataset.caption = "Bemanning per sprint";
    root.dataset.rowHeaders = "true";
    root.dataset.rowHeaderColumn = "2";

    const table = document.createElement("table");
    table.innerHTML = `
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

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Add row";
    button.addEventListener("click", () => {
        table.tBodies[0]?.insertAdjacentHTML(
            "beforeend",
            `
                <tr>
                    <td>C2</td>
                    <td>Analyse</td>
                    <td>Bergen</td>
                    <td>6</td>
                </tr>
            `,
        );
    });

    root.append(table);
    wrapper.append(button, root);
    return wrapper;
}

export default {
    title: "Testing/Table",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
    render: createStory,
};

export const UpdatesAfterMutation = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Add row" }));

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Bemanning per sprint" });
            const rowHeader = table.tBodies[0]?.rows[2]?.cells[1];
            const bergenCell = table.tBodies[0]?.rows[2]?.cells[2];
            const locationHeader = within(table).getByRole("columnheader", { name: "Lokasjon" });
            const availableHeader = within(table).getByRole("columnheader", { name: "Ledige timer" });
            const availableCell = table.tBodies[0]?.rows[2]?.cells[3];
            const bergenHeaderIds = bergenCell?.getAttribute("headers")?.split(/\s+/) ?? [];
            const availableHeaderIds = availableCell?.getAttribute("headers")?.split(/\s+/) ?? [];

            expect(rowHeader).toHaveAttribute("scope", "row");
            expect(bergenHeaderIds).toEqual(expect.arrayContaining([rowHeader.id, locationHeader.id]));
            expect(availableHeaderIds).toEqual(expect.arrayContaining([rowHeader.id, availableHeader.id]));
        });
    },
};
