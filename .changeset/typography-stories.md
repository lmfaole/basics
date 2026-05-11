---
"@lmfaole/basics": patch
---

Add a `Native Elements/Typography` Storybook category with four stories that show off the fluid type scale and let consumers tweak the tokens live:

- **Scale** — overview of `--basic-font-size-small`, `--basic-font-size`, and `--basic-font-size-title` with their labels.
- **Fluid Scale Comparison** — side-by-side titles at `--basic-fluid-scale: 0`, `0.5`, `1`, and `2` (with viewport-range tokens pinned so scale is the only effective control).
- **Per Size Override** — demonstrates overriding `--basic-font-size-title-min/-max` and `--basic-font-size-min/-max` on a subtree.
- **Playground** — interactive sliders for `--basic-fluid-scale`, `--basic-fluid-min-viewport`, and `--basic-fluid-max-viewport` with a live readout so users can dial in their preferred fluidity before copying the values into their own CSS.

Each story includes a `play` function that asserts the expected size hierarchy and fluid behavior.
