import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function waitForAnimationFrames(count = 2) {
    return new Promise((resolve) => {
        const step = () => {
            if (count <= 0) {
                resolve();
                return;
            }

            count -= 1;
            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    });
}

function createStory() {
    const wrapper = document.createElement("div");
    const root = document.createElement("basic-summary-table");
    root.dataset.caption = "Prosjektsammendrag";
    root.dataset.locale = "nb-NO";
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
            <td>8 t</td>
            <td>100 kr</td>
            <td>800 kr</td>
          </tr>
          <tr>
            <td>Implementasjon</td>
            <td>12 t</td>
            <td>120 kr</td>
            <td>1 440 kr</td>
          </tr>
          <tr>
            <td>QA</td>
            <td>6 t</td>
            <td>90 kr</td>
            <td>540 kr</td>
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
                    <td>4 t</td>
                    <td>90 kr</td>
                    <td>360 kr</td>
                </tr>
            `,
        );
    });

    root.append(table);
    wrapper.append(button, root);
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
            expect(hoursTotal).toHaveTextContent("30 t");
            expect(costTotal.getAttribute("data-value")).toBe("3140");
            expect(costTotal?.textContent ?? "").toMatch(/3(?:\s|\u00a0)140 kr/);
            expect(hoursHeaderIds).toEqual(expect.arrayContaining([totalRowHeader.id, hoursHeader.id]));
        });
    },
};

export const StaysStableAtRest = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole("table", { name: "Prosjektsammendrag" });

        await waitFor(() => {
            expect(table.tFoot?.rows[0]).toBeTruthy();
        });

        const initialRowHeader = table.tBodies[0]?.rows[0]?.cells[0];
        const initialBodyCell = table.tBodies[0]?.rows[0]?.cells[3];
        const initialFooterCell = table.tFoot?.rows[0]?.cells[3];

        await waitForAnimationFrames(3);

        expect(table.tBodies[0]?.rows[0]?.cells[0]).toBe(initialRowHeader);
        expect(table.tBodies[0]?.rows[0]?.cells[3]).toBe(initialBodyCell);
        expect(table.tFoot?.rows[0]?.cells[3]).toBe(initialFooterCell);
    },
};
