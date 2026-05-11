# @lmfaole/basics

## 0.6.0

### Minor Changes

- 5dc85c1: Expand and solidify the base token layer in `basic-styling/tokens/base.css`. Add typography tokens (`--basic-font-size-small`, `--basic-font-weight-medium`, `--basic-font-weight-strong`, `--basic-line-height-tight`) and focus-ring tokens (`--basic-focus-ring-width`, `--basic-focus-ring-offset`) that were previously hardcoded across the package CSS. All component sheets, `global.css`, and `forms.css` now consume these tokens, so consumers can retune typographic weight, secondary copy size, title leading, or the focus-ring shape from a single place. A new `Overview/Base Tokens` Storybook page documents each token.
- 27f7022: Make the typography tokens fluid. `--basic-font-size`, `--basic-font-size-small`, and `--basic-font-size-title` now resolve through `clamp(min, lerp, max)` and scale between viewport endpoints. The same `--basic-font-size-*` tokens components already consume keep working — they just respond to viewport width now.

  Consumers tune the fluidity with three new knobs:

  - `--basic-fluid-scale` (default `1`) — single multiplier for fluid intensity. Set to `0` to disable fluidity entirely (every size pins to its min), to `0.5` for gentler scaling, or to `>1` for bolder scaling.
  - `--basic-fluid-min-viewport` (default `20rem` / 320px) — viewport width where fluid scaling starts.
  - `--basic-fluid-max-viewport` (default `80rem` / 1280px) — viewport width where each size reaches its max.

  Per-size bounds are also overridable: `--basic-font-size-{small,title}-{min,max}` and `--basic-font-size-{min,max}`.

  The fluid clamp tokens are declared on `:root, [data-basic-typography]` (mirroring how `palette.css` re-exposes computed palette tokens on `:root, [data-basic-palette]`). Apply `data-basic-typography` to a subtree to recompute the clamp outputs against locally overridden inputs — without it, child overrides of `--basic-fluid-scale` or the min/max tokens don't reach the inherited clamp values. Overrides on `:root` work without the attribute. The `Overview/Base Tokens` Storybook page documents the new API and shows a side-by-side comparison of fluid-scale settings.

### Patch Changes

- bac5781: `basic-carousel` scroll markers now meet the 44 × 44 px touch-target minimum. The default `--basic-carousel-marker-size` is bumped from `1.75rem` to `2.75rem` so a tap reliably hits the indicator. Override the variable to restore the previous visual size.
- bac5781: `basic-toast` no longer logs a console warning when its panel contains interactive content. The same guidance is documented in the toast README; runtime logging violated the package's "no logging, no telemetry" rule.
- bac5781: Remove the unused `--basic-stack-gap` CSS custom property from `basic-styling/tokens/base.css`. The token was defined but referenced nowhere, violating the project's "no token without two uses" rule.
- c88ec2e: Add a `Native Elements/Typography` Storybook category with four stories that show off the fluid type scale and let consumers tweak the tokens live:

  - **Scale** — overview of `--basic-font-size-small`, `--basic-font-size`, and `--basic-font-size-title` with their labels.
  - **Fluid Scale Comparison** — side-by-side titles at `--basic-fluid-scale: 0`, `0.5`, `1`, and `2` (with viewport-range tokens pinned so scale is the only effective control).
  - **Per Size Override** — demonstrates overriding `--basic-font-size-title-min/-max` and `--basic-font-size-min/-max` on a subtree.
  - **Playground** — interactive sliders for `--basic-fluid-scale`, `--basic-fluid-min-viewport`, and `--basic-fluid-max-viewport` with a live readout so users can dial in their preferred fluidity before copying the values into their own CSS.

  Each story includes a `play` function that asserts the expected size hierarchy and fluid behavior.

## 0.5.0

### Minor Changes

- 58db2c0: Add a `basic-carousel` component with native CSS scroll buttons and scroll markers in the optional starter styling layer.

### Patch Changes

- 58db2c0: Add configurable native controls and snap alignment to `basic-carousel`, and add a Baseline-powered browser support overview to the README.
- 58db2c0: Add semantic hover, active, selected, and checked color tokens to the optional starter palette layer and use them in the starter accordion and tabs styles.
- 58db2c0: Refactor the optional starter component styles to use a shared style-query interaction layer for hover, active, and selected surface colors across accordion, tabs, popover, and button-like controls.
- 9dfb854: Rename the component source folder to `basic-components`, add matching `@lmfaole/basics/basic-components/*` exports, and keep the older `components` subpaths as compatibility aliases.
- 9dfb854: Add published Node.js engine metadata and formal project governance files for contributing, security reporting, and GitHub contribution templates.
- 58db2c0: Extend the optional `basic-styling/forms.css` `data-panel` hook to native radio groups and document the radio-panel pattern in Storybook and the README.

## 0.4.0

### Minor Changes

- 3896a2c: Change `basic-accordion` to use direct child `details` and `summary` markup instead of separate trigger and panel nodes, keeping the root element focused on accordion state rules and keyboard movement.
- 3896a2c: Add new `basic-alert` and `basic-toast` components with Storybook docs, tests, and optional starter styles.

### Patch Changes

- 3896a2c: Add an optional `basic-styling` CSS subpath with a simple token-based baseline focused on spacing and layout.
- 3896a2c: Update the optional `basic-styling` tokens to use CSS `light-dark()` colors and add a Storybook theme toolbar for previewing the components in light, dark, or system mode.
- 3896a2c: Convert the optional `basic-styling` starter color tokens to use `oklch()` consistently, including the light and dark theme values used by Storybook previews.
- 3896a2c: Add a dedicated `basic-styling/palette.css` file with multiple computed color palettes and a Storybook palette toolbar for previewing them.
- 3896a2c: Add a W3C-style `basic-styling/palette.tokens.json` export for the starter palettes and render the token values in Storybook with the built-in color docs blocks.
- 3896a2c: Keep `basic-summary-table` footer rows stable between refreshes to avoid unnecessary DOM churn, and update the summary table examples to use more generic currency-based data.
  Stop `basic-table` and `basic-summary-table` from repeatedly rewriting managed table cells during internal refreshes.
  Preserve consistent displayed units such as `kr` and `t` in generated summary footer totals.
- 3896a2c: Render `basic-toast` panels in the popover top layer when supported, and add starter CSS placement presets for corners and centered viewport positions.
- 3896a2c: Move the optional starter styling sources into dedicated folders under `basic-styling/`, with shared tokens in `tokens/` and component-specific CSS in `components/`.

## 0.3.0

### Minor Changes

- ccb060c: Add a new `basic-table` component that upgrades regular tables with generated captions and descriptions, configurable row-header columns, optional first-row column-header promotion, fallback naming, and `headers` associations for stronger accessibility. Also add `basic-summary-table` for calculation-heavy tables with generated footer totals.
- ccb060c: Remove vertical orientation support from `basic-tabs` and keep the tablist horizontal-only.

### Patch Changes

- 1015c34: Fix `basic-dialog` so `data-backdrop-close` only dismisses the modal for actual backdrop clicks, not clicks on empty space inside the dialog panel.

## 0.2.1

### Patch Changes

- caddcc2: Fix `basic-tabs` so the `Home` key moves focus to the first enabled tab instead of staying on the currently selected tab.

## 0.2.0

### Minor Changes

- acde619: Add `basic-accordion`, `basic-dialog`, and `basic-popover` custom elements for unstyled disclosure sections and overlay flows with accessible keyboard behavior.
