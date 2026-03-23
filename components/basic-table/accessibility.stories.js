import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory() {
    const wrapper = document.createElement("div");

    const root = document.createElement("basic-table");
    root.dataset.label = "Bemanning";
    root.dataset.caption = "Bemanning per sprint";
    root.dataset.description = "Generert hjelpebeskrivelse for tabellen.";
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

    const authorDescription = document.createElement("p");
    authorDescription.id = "author-table-description";
    authorDescription.textContent = "Forfatterbeskrivelse for tabellen.";

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.textContent = "Clear generated description";
    clearButton.addEventListener("click", () => {
        root.removeAttribute("data-description");
    });

    const hoursHeader = table.tHead?.rows[0]?.cells[3];
    const availableCell = table.tBodies[0]?.rows[0]?.cells[3];

    table.setAttribute("aria-describedby", authorDescription.id);

    if (hoursHeader) {
        hoursHeader.id = "author-hours-header";
    }

    availableCell?.setAttribute("headers", "author-hours-header");

    root.append(table);
    wrapper.append(clearButton, root, authorDescription);

    return wrapper;
}

export default {
    title: "Testing/Accessibility/Table",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
    render: createStory,
};

export const PreservesAuthorRelationships = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Bemanning per sprint" });
            const generatedDescription = canvasElement.querySelector("[data-basic-table-generated-description]");
            const describedByIds = table.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
            const availableCell = table.tBodies[0]?.rows[0]?.cells[3];

            expect(describedByIds).toEqual(
                expect.arrayContaining(["author-table-description", generatedDescription.id]),
            );
            expect(availableCell).toHaveAttribute("headers", "author-hours-header");
        });

        await userEvent.click(canvas.getByRole("button", { name: "Clear generated description" }));

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Bemanning per sprint" });
            const describedByIds = table.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
            const availableCell = table.tBodies[0]?.rows[0]?.cells[3];

            expect(canvasElement.querySelector("[data-basic-table-generated-description]")).toBeNull();
            expect(describedByIds).toEqual(["author-table-description"]);
            expect(availableCell).toHaveAttribute("headers", "author-hours-header");
        });
    },
};
