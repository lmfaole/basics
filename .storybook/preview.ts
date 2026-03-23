import type { Preview } from "@storybook/web-components-vite";

const preview: Preview = {
    tags: ["autodocs"],
    parameters: {
        a11y: {
            test: "error",
        },
        controls: {
            expanded: true,
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
            sort: "requiredFirst",
        },
        docs: {
            codePanel: true,
            source: {
                language: "html",
                state: "open",
            },
        },
        options: {
            showRoots: true,
            storySort: {
                order: [
                    "Overview",
                    ["Readme"],
                    "Components",
                    [
                        "Disclosure",
                        ["Accordion"],
                        "Overlay",
                        ["Dialog", "Popover"],
                        "Navigation",
                        ["Tabs", "Table of Contents"],
                        "Data Display",
                        ["Table", "Summary Table"],
                    ],
                    "Testing",
                    [
                        "Accessibility",
                        [
                            "Dialog",
                            "Popover",
                            "Tabs",
                            "Table of Contents",
                            "Table",
                            "Summary Table",
                        ],
                        "Interaction",
                        [
                            "Accordion",
                            "Dialog",
                            "Popover",
                            "Tabs",
                            "Table of Contents",
                            "Table",
                            "Summary Table",
                        ],
                    ],
                    "*",
                ],
            },
        },
        layout: "padded",
    },
};

export default preview;
