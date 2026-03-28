import "./register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function createStory() {
    const wrapper = document.createElement("div");

    const showButton = document.createElement("button");
    showButton.type = "button";
    showButton.textContent = "Show alert";

    const alert = document.createElement("basic-alert");
    alert.dataset.label = "Lagring fullfort";
    alert.hidden = true;

    const title = document.createElement("h2");
    title.dataset.alertTitle = "";
    title.textContent = "Endringer lagret";

    const body = document.createElement("p");
    body.textContent = "Varslet kan vises og skjules programmatisk uten ekstra wrappers.";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.dataset.alertClose = "";
    closeButton.textContent = "Dismiss";

    alert.append(title, body, closeButton);
    showButton.addEventListener("click", () => {
        alert.show();
    });

    wrapper.append(showButton, alert);
    return wrapper;
}

export default {
    title: "Testing/Alert",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            disable: true,
        },
        layout: "fullscreen",
    },
    render: createStory,
};

export const ShowAndDismiss = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Show alert" }));

        await waitFor(() => {
            const alert = canvas.getByRole("alert", { name: "Endringer lagret" });
            expect(alert).toHaveAttribute("data-open");
        });

        await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));

        await waitFor(() => {
            expect(canvas.queryByRole("alert", { name: "Endringer lagret" })).not.toBeInTheDocument();
        });
    },
};
