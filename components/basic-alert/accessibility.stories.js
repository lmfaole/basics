import "./register.js";
import { expect, waitFor, within } from "storybook/test";

function createStory() {
    const alert = document.createElement("basic-alert");
    alert.dataset.live = "polite";

    const authorLabel = document.createElement("p");
    authorLabel.id = "author-alert-label";
    authorLabel.textContent = "Manuelt navngitt status";

    const title = document.createElement("h2");
    title.dataset.alertTitle = "";
    title.textContent = "Endringer lagret";

    const body = document.createElement("p");
    body.textContent = "Varslet skal bevare et forfattet navn når ett allerede finnes.";

    alert.setAttribute("aria-labelledby", authorLabel.id);
    alert.append(authorLabel, title, body);

    return alert;
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

export const PreservesAuthorAccessibleName = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const alert = canvas.getByRole("status", { name: "Manuelt navngitt status" });

            expect(alert).toHaveAttribute("aria-labelledby", "author-alert-label");
            expect(alert).toHaveAttribute("aria-live", "polite");
            expect(alert).toHaveAttribute("aria-atomic", "true");
            expect(alert).not.toHaveAttribute("aria-label");
        });
    },
};
