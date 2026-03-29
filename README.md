# `@lmfaole/basics`

Unstyled custom elements for common UI patterns, with an optional starter CSS layer.

## Install

```sh
pnpm add @lmfaole/basics
```

## Quick Start

1. Import the register module for the component you want to use.
2. Render the expected HTML markup.
3. Optionally import the starter styles.

```html
<basic-dialog data-label="Confirm action">
  <button type="button" data-dialog-open>Open dialog</button>

  <dialog data-dialog-panel>
    <h2 data-dialog-title>Confirm action</h2>
    <p>Dialog body.</p>
    <button type="button" data-dialog-close>Cancel</button>
    <button type="button" data-dialog-close data-dialog-close-value="confirmed">
      Confirm
    </button>
  </dialog>
</basic-dialog>

<script type="module">
  import "@lmfaole/basics/basic-components/basic-dialog/register";
</script>
```

Import register modules once in your app entry point. They define the custom element and leave styling to your application unless you also opt into `basic-styling`.

## Component Guides

Each component now has its own colocated README with markup, attributes, behavior, and usage notes:

- [`basic-alert`](./basic-components/basic-alert/README.md): inline live-region alerts
- [`basic-accordion`](./basic-components/basic-accordion/README.md): single-open or multi-open disclosure sections
- [`basic-carousel`](./basic-components/basic-carousel/README.md): scroll-snap carousels with native CSS controls where supported
- [`basic-dialog`](./basic-components/basic-dialog/README.md): modal dialogs built on native `<dialog>`
- [`basic-popover`](./basic-components/basic-popover/README.md): non-modal overlays using the Popover API
- [`basic-summary-table`](./basic-components/basic-summary-table/README.md): tables with generated totals in `<tfoot>`
- [`basic-table`](./basic-components/basic-table/README.md): accessible table naming and header relationships
- [`basic-tabs`](./basic-components/basic-tabs/README.md): accessible tablists and panels
- [`basic-toast`](./basic-components/basic-toast/README.md): transient toast notifications
- [`basic-toc`](./basic-components/basic-toc/README.md): generated table-of-contents navigation

## Optional Styling

The components are unstyled by default. To opt into the starter CSS:

```css
@import "@lmfaole/basics/basic-styling";
```

Or import the global layer and component layer separately:

```css
@import "@lmfaole/basics/basic-styling/global.css";
@import "@lmfaole/basics/basic-styling/components.css";
```

You can also import individual files from:

- `@lmfaole/basics/basic-styling/forms.css`
- `@lmfaole/basics/basic-styling/tokens/*`
- `@lmfaole/basics/basic-styling/components/basic-*.css`

The starter styling is intentionally minimal. It provides tokens, spacing, and baseline component styles without taking over your design system.

### Selection Panels

The form layer can render a native checkbox or radio like a selectable panel by adding `data-panel` to the input.

```html
<label>
  <input type="checkbox" name="days" value="day-1" data-panel checked />
  <span>
    <strong>Day 1: Product systems</strong>
    <span>Keynotes, leadership sessions, and case studies.</span>
  </span>
</label>
```

Use the pattern like this:

- Import `@lmfaole/basics/basic-styling/forms.css`, `global.css`, or the full `basic-styling` entry point.
- Put `data-panel` on the native checkbox or radio, not on the label.
- Keep the control as a direct child of the label.
- Place the visible body copy after the input in a sibling `span` or `div`.
- Use native `fieldset` and `legend` when the choices belong to one group.
- Keep shared `name` values on radio groups so the browser preserves single-select behavior.

This is still a native checkbox or radio. Keyboard behavior, form submission, validation, checked state, and radio-group semantics all stay browser-driven.
See Storybook `Native Elements/Forms` for live examples of the same markup.

## Package Entry Points

- Register a custom element: `@lmfaole/basics/basic-components/<component>/register`
- Import a component module directly: `@lmfaole/basics/basic-components/<component>`
- Root module exports the component classes and helpers from `@lmfaole/basics`
- Legacy compatibility aliases remain available under `@lmfaole/basics/components/<component>`

## Browser Support

The package targets modern evergreen browsers. The live widgets below render in Storybook's Readme page via the official `<baseline-status>` custom element, and each line also links to the underlying feature page for plain Markdown viewers.

As of March 29, 2026, the biggest compatibility gaps are the shared style-query layer in Firefox and the native carousel marker/button controls outside Chromium-based browsers.

- Core custom elements (`basic-alert`, `basic-accordion`, `basic-carousel`, `basic-summary-table`, `basic-table`, `basic-tabs`, `basic-toc`, `basic-toast`): <baseline-status featureId="autonomous-custom-elements"></baseline-status> ([Autonomous custom elements](https://web-platform-dx.github.io/web-features-explorer/features/autonomous-custom-elements/))
- `basic-dialog` modal behavior: <baseline-status featureId="dialog"></baseline-status> ([`<dialog>`](https://web-platform-dx.github.io/web-features-explorer/features/dialog/))
- `basic-popover` overlays and `basic-toast` top-layer placement: <baseline-status featureId="popover"></baseline-status> ([Popover](https://web-platform-dx.github.io/web-features-explorer/features/popover/))
- `basic-carousel` scroll-snap foundation: <baseline-status featureId="scroll-snap"></baseline-status> ([Scroll snap](https://web-platform-dx.github.io/web-features-explorer/features/scroll-snap/))
- `basic-carousel` native marker and arrow controls: <baseline-status featureId="scroll-markers"></baseline-status> <baseline-status featureId="scroll-buttons"></baseline-status> ([Scroll markers](https://web-platform-dx.github.io/web-features-explorer/features/scroll-markers/), [`::scroll-button`](https://web-platform-dx.github.io/web-features-explorer/features/scroll-buttons/))
- Starter CSS color and selector baseline: <baseline-status featureId="nesting"></baseline-status> <baseline-status featureId="has"></baseline-status> <baseline-status featureId="light-dark"></baseline-status> <baseline-status featureId="oklab"></baseline-status> ([Nesting](https://web-platform-dx.github.io/web-features-explorer/features/nesting/), [`:has()`](https://web-platform-dx.github.io/web-features-explorer/features/has/), [`light-dark()`](https://web-platform-dx.github.io/web-features-explorer/features/light-dark/), [Oklab and OkLCh](https://web-platform-dx.github.io/web-features-explorer/features/oklab/))
- Shared interaction state layer and other style-query-driven refinements: <baseline-status featureId="container-style-queries"></baseline-status> ([Container style queries](https://web-platform-dx.github.io/web-features-explorer/features/container-style-queries/))

## Storybook

```sh
pnpm storybook
```

```sh
pnpm build-storybook
```

Storybook now focuses on package documentation pages such as the readme, changelog, contributing guide, security policy, and palette tokens.

## More Docs

- [CHANGELOG.md](./CHANGELOG.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SECURITY.md](./SECURITY.md)
