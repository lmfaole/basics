import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
    stories: [
        "./readme.mdx",
        "./changelog.mdx",
        "./contributing.mdx",
        "./security.mdx",
        "./palette.mdx",
        "../basic-styling/**/*.stories.js",
        "../basic-components/**/index.stories.js",
    ],
    addons: [
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "@storybook/addon-vitest",
        "@chromatic-com/storybook",
    ],
    framework: {
        name: "@storybook/web-components-vite",
        options: {},
    },
};

export default config;
