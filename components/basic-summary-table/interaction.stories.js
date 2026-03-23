import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory() {
    const wrapper = document.createElement("div");
    const root = document.createElement("basic-summary-table");
    root.dataset.caption = "Prosjektsammendrag";
    root.dataset.rowHeaders = "true";
    root.dataset.summaryColumns = "2,4";

    const table = document.createElement("table");
    table.innerHTML = `
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

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Add line item";
    button.addEventListener("click", () => {
        table.tBodies[0]?.insertAdjacentHTML(
            "beforeend",
            `
                <tr>
                    <td>Support</td>
                    <td>4</td>
                    <td>90</td>
                    <td>360</td>
                </tr>
            `,
        );
    });

    root.append(table);
    wrapper.append(button, root);
    return wrapper;
}

export default {
    title: "Testing/Interaction/Summary Table",
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
        await userEvent.click(canvas.getByRole("button", { name: "Add line item" }));

        await waitFor(() => {
            const table = canvas.getByRole("table", { name: "Prosjektsammendrag" });
            const footerRow = table.tFoot?.rows[0];
            const totalRowHeader = within(table).getByRole("rowheader", { name: "Totalt" });
            const supportRowHeader = within(table).getByRole("rowheader", { name: "Support" });
            const hoursHeader = within(table).getByRole("columnheader", { name: "Timer" });
            const hoursTotal = footerRow?.cells[1];
            const costTotal = footerRow?.cells[3];
            const hoursHeaderIds = hoursTotal?.getAttribute("headers")?.split(/\s+/) ?? [];

            expect(supportRowHeader).toHaveAttribute("scope", "row");
            expect(hoursTotal).toHaveTextContent("30");
            expect(costTotal.getAttribute("data-value")).toBe("3140");
            expect(hoursHeaderIds).toEqual(expect.arrayContaining([totalRowHeader.id, hoursHeader.id]));
        });
    },
};
