import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const plugins = await storybookTest({
    configDir: path.join(dirname, ".storybook"),
    storybookScript: "pnpm storybook --ci",
});

export default defineConfig({
    plugins,
    test: {
        name: "storybook",
        browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
        },
        coverage: {
            provider: "v8",
            exclude: [
                ...coverageConfigDefaults.exclude,
                "**/.storybook/**",
                "**/*.stories.*",
                "**/storybook-static/**",
            ],
            reporter: ["text", "json-summary", "html", "lcov"],
            reportsDirectory: "./coverage/storybook",
            watermarks: {
                branches: [70, 80],
                functions: [90, 100],
                lines: [80, 90],
                statements: [80, 90],
            },
        },
    },
});
