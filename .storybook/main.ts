import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
    stories: [
        "../readme.mdx",
        "../components/basic-toc/**/*.stories.@(js|jsx|ts|tsx)",
        "../components/basic-tabs/**/*.stories.@(js|jsx|ts|tsx)",
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
