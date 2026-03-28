import "./register.js";

/**
 * @typedef {object} ToastStoryArgs
 * @property {string} label Fallback accessible name when the toast has no title element.
 * @property {"assertive" | "polite"} live Controls whether the toast announces as `alert` or `status`.
 * @property {number} duration Auto-dismiss timeout in milliseconds. Use `0` to keep the toast open.
 * @property {string} position Starter CSS preset used to place the top-layer toast in the viewport.
 * @property {boolean} includeTitle Renders a heading that becomes the toast name.
 * @property {boolean} includeCloseButton Adds a dismiss button inside the toast panel.
 * @property {boolean} openInitially Shows the toast immediately on first render.
 */

const POSITION_OPTIONS = [
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
];

/**
 * @param {ToastStoryArgs} args
 */
function createStory({
    label,
    live,
    duration,
    position,
    includeTitle,
    includeCloseButton,
    openInitially,
}) {
    const root = document.createElement("basic-toast");
    root.dataset.label = label;
    root.dataset.live = live;
    root.dataset.duration = String(duration);
    root.dataset.toastPosition = position;

    if (openInitially) {
        root.setAttribute("data-open", "");
    }

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.dataset.toastOpen = "";
    openButton.textContent = "Show toast";

    const panel = document.createElement("section");
    panel.dataset.toastPanel = "";

    if (includeTitle) {
        const title = document.createElement("h2");
        title.dataset.toastTitle = "";
        title.textContent = "Lagret";
        panel.append(title);
    }

    const body = document.createElement("p");
    body.textContent = "Toasten viser en kort melding uten at komponenten eier layouten rundt den.";
    panel.append(body);

    if (includeCloseButton) {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.dataset.toastClose = "";
        closeButton.textContent = "Dismiss";
        panel.append(closeButton);
    }

    root.append(openButton, panel);
    return root;
}

export default {
    title: "Components/Toast",
    tags: ["toast", "notification", "feedback", "basic-toast"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Custom element that upgrades trigger-and-panel markup into a toast notification flow.

Use it when the page already owns the content and placement, but still needs a predictable live-region toast primitive:

- provide one descendant \`[data-toast-panel]\`
- use \`[data-toast-open]\` on buttons that should show or toggle the toast
- optionally add \`[data-toast-close]\` for explicit dismissal
- optionally add \`[data-toast-title]\` for the accessible name
- optionally set \`data-duration="0"\` to disable auto-dismiss

The component manages the live-region role, accessible name, open state, and optional timeout without taking over your content structure.
When the platform supports the Popover API, the toast panel is shown in the top layer. The starter toast CSS can then place it with a simple root attribute such as \`data-toast-position="top-right"\`, \`data-toast-position="bottom-center"\`, or \`data-toast-position="center"\`.
                `,
            },
            source: {
                code: `<basic-toast
  data-label="Lagring fullfort"
  data-duration="5000"
  data-toast-position="top-right"
>
  <button type="button" data-toast-open>Show toast</button>

  <section data-toast-panel>
    <h2 data-toast-title>Lagret</h2>
    <p>Meldingen ble lagret uten feil.</p>
    <button type="button" data-toast-close>Dismiss</button>
  </section>
</basic-toast>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Lagring fullfort",
        live: "polite",
        duration: 5000,
        position: "bottom-right",
        includeTitle: true,
        includeCloseButton: true,
        openInitially: false,
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
            options: ["polite", "assertive"],
            description: "Maps to `data-live` and switches between `status` and `alert` semantics.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "polite",
                },
            },
        },
        duration: {
            control: { type: "number", min: 0, max: 10000, step: 250 },
            description: "Maps to `data-duration` in milliseconds. Use `0` to disable auto-dismiss.",
            table: {
                category: "Attributes",
                defaultValue: {
                    summary: "5000",
                },
            },
        },
        position: {
            control: "select",
            options: POSITION_OPTIONS,
            description: "Starter styling hook that sets `data-toast-position` for top-layer placement.",
            table: {
                category: "Starter Styling",
                defaultValue: {
                    summary: "bottom-right",
                },
                type: {
                    summary: POSITION_OPTIONS.join(" | "),
                },
            },
        },
        includeTitle: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-toast-title]` heading.",
            table: {
                category: "Story Controls",
            },
        },
        includeCloseButton: {
            control: "boolean",
            description: "Story-only toggle that renders a `[data-toast-close]` dismiss button.",
            table: {
                category: "Story Controls",
            },
        },
        openInitially: {
            control: "boolean",
            description: "Story-only toggle that opens the toast on first render.",
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
                story: "Simple configurable toast example with one trigger, one panel, and optional auto-dismiss.",
            },
        },
    },
};

export const Persistent = {
    args: {
        duration: 0,
        openInitially: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Set `data-duration=\"0\"` when the toast should stay open until the user dismisses it.",
            },
        },
    },
};

export const Positioned = {
    args: {
        duration: 0,
        openInitially: true,
        position: "top-center",
    },
    parameters: {
        docs: {
            description: {
                story: "With the optional starter styling enabled, move the top-layer toast by changing `data-toast-position` to a corner or center preset such as `top-right`, `bottom-center`, or `center`.",
            },
        },
    },
};
