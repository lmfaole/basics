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
            storySort: {
                order: ["Readme", "Basics"],
            },
        },
        layout: "padded",
    },
};

export default preview;
