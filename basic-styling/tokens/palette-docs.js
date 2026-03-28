import paletteTokens from "./palette.tokens.json";

const PALETTE_ORDER = ["slate", "sand", "ocean", "berry"];
const BASE_TOKEN_ORDER = ["surface", "text", "accent"];
const COMPUTED_TOKEN_ORDER = ["background", "surface", "surface-muted", "text-muted", "border", "overlay", "focus"];

function toTitleCase(value) {
    return value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function toCssColor(token) {
    const { components, alpha } = token.$value;
    const [lightness, chroma, hue] = components;

    return alpha == null
        ? `oklch(${lightness}% ${chroma} ${hue})`
        : `oklch(${lightness}% ${chroma} ${hue} / ${alpha})`;
}

function buildRows(paletteName, groupName, tokenNames) {
    const group = paletteTokens.basic.palette[paletteName][groupName];

    return tokenNames.map((tokenName) => ({
        id: `${paletteName}-${groupName}-${tokenName}`,
        title: toTitleCase(tokenName),
        subtitle: `basic.palette.${paletteName}.${groupName}.${tokenName}`,
        colors: {
            light: toCssColor(group[tokenName].light),
            dark: toCssColor(group[tokenName].dark),
        },
    }));
}

export const paletteDocs = PALETTE_ORDER.map((paletteName) => ({
    id: paletteName,
    title: toTitleCase(paletteName),
    description: paletteTokens.basic.palette[paletteName].$description,
    baseRows: buildRows(paletteName, "base", BASE_TOKEN_ORDER),
    computedRows: buildRows(paletteName, "computed", COMPUTED_TOKEN_ORDER),
}));
