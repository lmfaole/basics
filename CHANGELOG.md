# @lmfaole/basics

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
