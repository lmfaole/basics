# @lmfaole/basics

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
