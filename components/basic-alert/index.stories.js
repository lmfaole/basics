import "./register.js";

/**
 * @typedef {object} AlertStoryArgs
 * @property {string} label Fallback accessible name when the alert has no title element.
 * @property {"assertive" | "polite"} live Controls whether the alert announces as `alert` or `status`.
 * @property {boolean} includeTitle Renders a heading that becomes the alert name.
 * @property {boolean} dismissible Adds a dismiss button inside the alert.
 */

/**
 * @param {AlertStoryArgs} args
 */
function createStory({ label, live, includeTitle, dismissible }) {
    const alert = document.createElement("basic-alert");
    alert.dataset.label = label;
    alert.dataset.live = live;

    if (includeTitle) {
        const title = document.createElement("h2");
        title.dataset.alertTitle = "";
        title.textContent = "Endringer lagret";
        alert.append(title);
    }

    const body = document.createElement("p");
    body.textContent = "Varslet gir en enkel live region rundt innhold som allerede eies av siden.";
    alert.append(body);

    if (dismissible) {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.dataset.alertClose = "";
        closeButton.textContent = "Dismiss";
        alert.append(closeButton);
    }

    return alert;
}

export default {
    title: "Components/Alert",
    tags: ["alert", "status", "live-region", "feedback", "basic-alert"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Custom element that upgrades inline content into a named live-region alert.

Use it when the page already owns the content and layout, but still needs predictable live-region semantics:

- place your content directly inside \`<basic-alert>\`
- optionally add \`[data-alert-title]\` when the alert should have a visible accessible name
- optionally add \`[data-alert-close]\` for a built-in dismiss action
- optionally set \`data-live="polite"\` when the message should behave like a status instead of an assertive alert

The component keeps the live-region role and accessible name in sync without taking over the content structure.
                `,
            },
            source: {
                code: `<basic-alert data-label="Lagring fullfort">
  <h2 data-alert-title>Endringer lagret</h2>
  <p>Meldingen ble lagret uten feil.</p>
  <button type="button" data-alert-close>Dismiss</button>
</basic-alert>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Lagring fullfort",
        live: "assertive",
        includeTitle: true,
        dismissible: false,
    },
    argTypes: {
        label: {
            control: "text",
            description: "Maps to `data-label` and becomes the fallback accessible name when no title is present.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "Lagring fullfort",
                },
            },
        },
        live: {
            control: "inline-radio",
            options: ["assertive", "polite"],
            description: "Maps to `data-live` and switches between `alert` and `status` semantics.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "assertive",
                },
            },
        },
        includeTitle: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-alert-title]` heading.",
            table: {
                category: "Story Controls",
            },
        },
        dismissible: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-alert-close]` dismiss button.",
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
                story: "Simple configurable alert example using one `basic-alert` element with inline content.",
            },
        },
    },
};

export const PoliteStatus = {
    args: {
        live: "polite",
    },
    parameters: {
        docs: {
            description: {
                story: "Use `data-live=\"polite\"` when the message should behave like a status update instead of an assertive alert.",
            },
        },
    },
};
