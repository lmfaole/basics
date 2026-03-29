import type { Preview } from "@storybook/web-components-vite";
import basicStylingCss from "../basic-styling/index.css?inline";

const STARTER_STYLING_STYLE_ID = "basic-styling-storybook-preview";
const BASELINE_STATUS_SCRIPT_ID = "baseline-status-storybook-preview";
const BASELINE_STATUS_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/baseline-status@1/baseline-status.min.js";

function syncStarterStyling(mode: string) {
    if (typeof document === "undefined") {
        return;
    }

    const existingStyle = document.getElementById(STARTER_STYLING_STYLE_ID);

    if (mode !== "on") {
        existingStyle?.remove();
        return;
    }

    const style = existingStyle instanceof HTMLStyleElement
        ? existingStyle
        : document.createElement("style");

    style.id = STARTER_STYLING_STYLE_ID;

    if (style.textContent !== basicStylingCss) {
        style.textContent = basicStylingCss;
    }

    if (!style.isConnected) {
        document.head.append(style);
    }
}

function syncPreviewTheme(mode: string) {
    if (typeof document === "undefined") {
        return;
    }

    const colorScheme = mode === "dark" || mode === "light"
        ? mode
        : "light dark";

    document.documentElement.style.colorScheme = colorScheme;

    if (document.body) {
        document.body.style.colorScheme = colorScheme;
    }
}

function syncPreviewPalette(mode: string) {
    if (typeof document === "undefined") {
        return;
    }

    if (mode === "slate") {
        delete document.documentElement.dataset.basicPalette;
        return;
    }

    document.documentElement.dataset.basicPalette = mode;
}

function ensureBaselineStatusWidget(shouldLoad: boolean) {
    if (typeof document === "undefined" || !shouldLoad) {
        return;
    }

    if (document.getElementById(BASELINE_STATUS_SCRIPT_ID)) {
        return;
    }

    const script = document.createElement("script");
    script.id = BASELINE_STATUS_SCRIPT_ID;
    script.src = BASELINE_STATUS_SCRIPT_SRC;
    script.type = "module";
    document.head.append(script);
}

const preview: Preview = {
    tags: ["autodocs"],
    globalTypes: {
        starterStyling: {
            name: "Styling",
            description: "Toggle the optional basic-styling starter CSS for all stories.",
            defaultValue: "on",
            toolbar: {
                title: "Styling",
                icon: "paintbrush",
                dynamicTitle: true,
                items: [
                    { value: "off", title: "Styling Off" },
                    { value: "on", title: "Styling On" },
                ],
            },
        },
        starterTheme: {
            name: "Theme",
            description: "Preview the optional basic-styling layer in light or dark mode.",
            defaultValue: "light",
            toolbar: {
                title: "Theme",
                icon: "mirror",
                dynamicTitle: true,
                items: [
                    { value: "light", title: "Light" },
                    { value: "dark", title: "Dark" },
                    { value: "system", title: "System" },
                ],
            },
        },
        starterPalette: {
            name: "Palette",
            description: "Preview the optional basic-styling layer with different computed color palettes.",
            defaultValue: "slate",
            toolbar: {
                title: "Palette",
                icon: "paintbrush",
                dynamicTitle: true,
                items: [
                    { value: "slate", title: "Slate" },
                    { value: "sand", title: "Sand" },
                    { value: "ocean", title: "Ocean" },
                    { value: "berry", title: "Berry" },
                ],
            },
        },
    },
    initialGlobals: {
        starterStyling: "on",
    },
    decorators: [
        (story, context) => {
            syncStarterStyling(String(context.globals.starterStyling ?? "off"));
            syncPreviewTheme(String(context.globals.starterTheme ?? "light"));
            syncPreviewPalette(String(context.globals.starterPalette ?? "slate"));
            ensureBaselineStatusWidget(context.title === "Overview/Readme");
            return story();
        },
    ],
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
            toc: {
                headingSelector: "h1, h2, h3",
            },
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
                    ["Readme", "Changelog", "Contributing", "Security", "Palette Tokens"],
                    "Custom Elements",
                    "Native Elements",
                    ["Color", "Forms"],
                    "Pages",
                    ["Complete Form"],
                    "*",
                ],
            },
        },
        layout: "padded",
    },
};

export default preview;
