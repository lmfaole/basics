import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const WHITE = { components: [100, 0, 0], alpha: 1 };
const BLACK = { components: [0, 0, 0], alpha: 1 };
const TRANSPARENT = { components: [0, 0, 0], alpha: 0 };

const PALETTES = {
    slate: {
        description: "Neutral slate palette used as the default starter styling theme.",
        surface: {
            light: [98.6, 0.004, 255],
            dark: [27.8, 0.033, 256.848],
        },
        text: {
            light: [21, 0.034, 264.665],
            dark: [98.5, 0.002, 247.839],
        },
        accent: {
            light: [54.6, 0.245, 262.881],
            dark: [70.7, 0.165, 254.624],
        },
    },
    sand: {
        description: "Warm sand palette with muted earth tones and an amber accent.",
        surface: {
            light: [97.8, 0.012, 85],
            dark: [30.5, 0.022, 75],
        },
        text: {
            light: [29, 0.028, 65],
            dark: [96.4, 0.01, 85],
        },
        accent: {
            light: [63, 0.18, 58],
            dark: [76, 0.14, 72],
        },
    },
    ocean: {
        description: "Cool ocean palette with blue surfaces and a brighter cyan-blue accent.",
        surface: {
            light: [97.4, 0.01, 225],
            dark: [30, 0.04, 245],
        },
        text: {
            light: [28, 0.05, 250],
            dark: [95.2, 0.01, 225],
        },
        accent: {
            light: [62, 0.14, 222],
            dark: [77, 0.11, 210],
        },
    },
    berry: {
        description: "Berry palette with red-violet undertones and a saturated berry accent.",
        surface: {
            light: [97.2, 0.012, 10],
            dark: [30.2, 0.05, 5],
        },
        text: {
            light: [27.5, 0.06, 8],
            dark: [95.8, 0.012, 8],
        },
        accent: {
            light: [60, 0.2, 12],
            dark: [73, 0.16, 8],
        },
    },
};

function round(value, precision = 3) {
    return Number(value.toFixed(precision));
}

function mixHue(first, second, weightSecond) {
    const [ , firstChroma, firstHue ] = first;
    const [ , secondChroma, secondHue ] = second;

    if (firstChroma === 0 && secondChroma === 0) {
        return 0;
    }

    if (firstChroma === 0) {
        return secondHue;
    }

    if (secondChroma === 0) {
        return firstHue;
    }

    const delta = ((((secondHue - firstHue) % 360) + 540) % 360) - 180;
    return (firstHue + (delta * weightSecond) + 360) % 360;
}

function mix(first, firstWeight, second, secondWeight = 100 - firstWeight) {
    const total = firstWeight + secondWeight;
    const weightFirst = firstWeight / total;
    const weightSecond = secondWeight / total;
    const alphaFirst = first.alpha ?? 1;
    const alphaSecond = second.alpha ?? 1;

    return {
        components: [
            round((first.components[0] * weightFirst) + (second.components[0] * weightSecond)),
            round((first.components[1] * weightFirst) + (second.components[1] * weightSecond), 6),
            round(mixHue(first.components, second.components, weightSecond)),
        ],
        alpha: round((alphaFirst * weightFirst) + (alphaSecond * weightSecond), 6),
    };
}

function createColorToken([lightness, chroma, hue], description, alpha = 1) {
    const value = {
        colorSpace: "oklch",
        components: [lightness, chroma, hue],
    };

    if (alpha < 1) {
        value.alpha = alpha;
    }

    return {
        $value: value,
        $description: description,
    };
}

function createMixedColorToken(mixedColor, description) {
    return createColorToken(mixedColor.components, description, mixedColor.alpha ?? 1);
}

function buildPaletteTokens(name, palette) {
    const surfaceLight = { components: palette.surface.light, alpha: 1 };
    const surfaceDark = { components: palette.surface.dark, alpha: 1 };
    const textLight = { components: palette.text.light, alpha: 1 };
    const textDark = { components: palette.text.dark, alpha: 1 };
    const accentLight = { components: palette.accent.light, alpha: 1 };
    const accentDark = { components: palette.accent.dark, alpha: 1 };

    return {
        $description: palette.description,
        base: {
            $type: "color",
            surface: {
                light: createColorToken(palette.surface.light, `${name} base surface color for light mode.`),
                dark: createColorToken(palette.surface.dark, `${name} base surface color for dark mode.`),
            },
            text: {
                light: createColorToken(palette.text.light, `${name} base text color for light mode.`),
                dark: createColorToken(palette.text.dark, `${name} base text color for dark mode.`),
            },
            accent: {
                light: createColorToken(palette.accent.light, `${name} accent color for light mode.`),
                dark: createColorToken(palette.accent.dark, `${name} accent color for dark mode.`),
            },
        },
        computed: {
            $type: "color",
            background: {
                light: createMixedColorToken(
                    mix(surfaceLight, 92, WHITE, 8),
                    `${name} computed background color for light mode.`,
                ),
                dark: createMixedColorToken(
                    mix(surfaceDark, 82, BLACK, 18),
                    `${name} computed background color for dark mode.`,
                ),
            },
            surface: {
                light: createMixedColorToken(
                    mix(surfaceLight, 96, WHITE, 4),
                    `${name} computed surface color for light mode.`,
                ),
                dark: createMixedColorToken(
                    mix(surfaceDark, 94, BLACK, 6),
                    `${name} computed surface color for dark mode.`,
                ),
            },
            "surface-muted": {
                light: createMixedColorToken(
                    mix(accentLight, 10, surfaceLight, 90),
                    `${name} computed muted surface color for light mode.`,
                ),
                dark: createMixedColorToken(
                    mix(accentDark, 18, surfaceDark, 82),
                    `${name} computed muted surface color for dark mode.`,
                ),
            },
            "text-muted": {
                light: createMixedColorToken(
                    mix(textLight, 68, surfaceLight, 32),
                    `${name} computed muted text color for light mode.`,
                ),
                dark: createMixedColorToken(
                    mix(textDark, 78, surfaceDark, 22),
                    `${name} computed muted text color for dark mode.`,
                ),
            },
            border: {
                light: createMixedColorToken(
                    mix(textLight, 16, surfaceLight, 84),
                    `${name} computed border color for light mode.`,
                ),
                dark: createMixedColorToken(
                    mix(textDark, 24, surfaceDark, 76),
                    `${name} computed border color for dark mode.`,
                ),
            },
            overlay: {
                light: createMixedColorToken(
                    mix(textLight, 24, TRANSPARENT, 76),
                    `${name} computed overlay color for light mode.`,
                ),
                dark: createMixedColorToken(
                    mix(BLACK, 56, TRANSPARENT, 44),
                    `${name} computed overlay color for dark mode.`,
                ),
            },
            focus: {
                light: createMixedColorToken(
                    mix(accentLight, 28, TRANSPARENT, 72),
                    `${name} computed focus color for light mode.`,
                ),
                dark: createMixedColorToken(
                    mix(accentDark, 38, TRANSPARENT, 62),
                    `${name} computed focus color for dark mode.`,
                ),
            },
        },
    };
}

const tokens = {
    $schema: "https://www.designtokens.org/schemas/2025.10/format.json",
    basic: {
        palette: Object.fromEntries(
            Object.entries(PALETTES).map(([name, palette]) => [name, buildPaletteTokens(name, palette)]),
        ),
    },
};

const outputPath = fileURLToPath(new URL("../basic-styling/tokens/palette.tokens.json", import.meta.url));

writeFileSync(outputPath, `${JSON.stringify(tokens, null, 2)}\n`);
