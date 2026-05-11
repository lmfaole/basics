# Roadmap

This document collects future feature ideas for `@lmfaole/basics`. Items here are
not commitments; they are starting points for discussion. Open an issue or PR if
you would like to help shape one of these.

## New Components

- `basic-combobox`: accessible combobox built on native `<input>` plus the
  Popover API, with single- and multi-select variants.
- `basic-menu`: keyboard-navigable menu and menubar primitives backed by
  `<button popovertarget>` and roving `tabindex`.
- `basic-tooltip`: hover and focus tooltips using the Popover API and the CSS
  Anchor Positioning module.
- `basic-disclosure`: lightweight single-section disclosure that complements the
  multi-section accordion.
- `basic-tree`: tree view with keyboard navigation and optional `aria-owns` for
  flattened DOM.
- `basic-pagination`: navigation control with next/previous, jump, and page-size
  patterns.
- `basic-breadcrumbs`: structured breadcrumb trail with truncation behavior.
- `basic-progress`: determinate and indeterminate progress wrappers around
  `<progress>` with live-region announcements.
- `basic-skeleton`: content placeholder primitive that respects
  `prefers-reduced-motion`.
- `basic-stepper`: multi-step flow indicator with optional linear enforcement.
- `basic-file-input`: drag-and-drop wrapper around `<input type="file">` with
  preview slots.
- `basic-clipboard`: copy-to-clipboard button with success and error live
  regions.

## Existing Component Enhancements

- `basic-carousel`: thumbnail strip variant, programmatic API for `goTo(index)`,
  and a `data-loop` mode.
- `basic-dialog`: opt-in form-action helpers and a `data-dismiss-on-outside`
  switch.
- `basic-popover`: anchor-positioning helpers and arrow/caret primitives.
- `basic-tabs`: vertical orientation, scrollable tablist overflow, and lazy
  panel rendering.
- `basic-toast`: queue management, swipe-to-dismiss, and per-toast duration
  overrides.
- `basic-toc`: nested heading levels, active-section highlighting via
  `IntersectionObserver`, and offset configuration for sticky headers.
- `basic-table` / `basic-summary-table`: column sorting helpers, row selection,
  and sticky headers.
- `basic-accordion`: animated open/close using the
  `interpolate-size: allow-keywords` route once Baseline supports it.

## Starter Styling

- A `basic-styling/themes/` directory with ready-made token presets
  (high-contrast, dense, brand-neutral).
- Optional typography scale module separate from `global.css`.
- Print stylesheet covering tables, dialogs, and toasts.
- Right-to-left audit and `:dir()` coverage across components.
- Container-query layout utilities aligned with the existing token set.

## Developer Experience

- Per-component TypeScript declaration files exported alongside the registers.
- A `basics` CLI (or codemod) for scaffolding a new component into the repo.
- Storybook interaction tests for each component covering keyboard paths.
- Playwright smoke tests run in CI against the built Storybook.
- Visual regression coverage via Chromatic for the starter-styling layer.
- Bundle-size budgets enforced in CI for each component entry point.

## Accessibility and Quality

- Automated axe-core checks wired into the Storybook test runner.
- Documented WAI-ARIA Authoring Practices mapping for every component.
- Screen-reader test matrix (NVDA, VoiceOver, JAWS, TalkBack) tracked per
  release.
- Reduced-motion and forced-colors audits for the starter styling.

## Documentation

- A live playground site separate from Storybook for marketing and demos.
- "Recipes" section showing common composition patterns (dialog + form,
  popover + combobox, tabs + toc).
- Migration guides from popular headless libraries to the matching
  `basic-*` element.
- Versioned docs once the package hits a stable 1.0.

## Tooling and Release

- Move to changesets-driven release notes surfaced in the README's "What's New"
  section.
- Provenance attestations on published npm artifacts.
- Optional ESM-only build flavor for downstream tree-shaking experiments.

## Have an idea?

Open an issue with the `roadmap` label or start a discussion. Small, focused
proposals are easier to land than sweeping rewrites.
