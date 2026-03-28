# `@lmfaole/basics`

Simple custom elements and DOM helpers, with optional starter styles.

## Install

```sh
pnpm add @lmfaole/basics
```

## Optional Styling

Import the full starter layer:

```css
@import "@lmfaole/basics/basic-styling";
```

Or split it into the global layer and component styles:

```css
@import "@lmfaole/basics/basic-styling/global.css";
@import "@lmfaole/basics/basic-styling/components.css";
```

Individual token and component files are also exported:

- `@lmfaole/basics/basic-styling/tokens/base.css`
- `@lmfaole/basics/basic-styling/tokens/palette.css`
- `@lmfaole/basics/basic-styling/tokens/palette.tokens.json`
- `@lmfaole/basics/basic-styling/components/basic-alert.css`
- `@lmfaole/basics/basic-styling/components/basic-accordion.css`
- `@lmfaole/basics/basic-styling/components/basic-dialog.css`
- `@lmfaole/basics/basic-styling/components/basic-popover.css`
- `@lmfaole/basics/basic-styling/components/basic-summary-table.css`
- `@lmfaole/basics/basic-styling/components/basic-table.css`
- `@lmfaole/basics/basic-styling/components/basic-tabs.css`
- `@lmfaole/basics/basic-styling/components/basic-toc.css`
- `@lmfaole/basics/basic-styling/components/basic-toast.css`

The core components remain unstyled by default. The `basic-styling` subpath is optional and meant as a very simple token-based baseline that focuses on spacing, padding, and margins first. The shared token sources live under `basic-styling/tokens/`, while the component-specific styles live under `basic-styling/components/`. `base.css` defines the non-color primitives, `palette.css` holds the computed color tokens and alternate palettes that the global layer consumes, and `palette.tokens.json` exposes the same palette data in W3C design-token format.

## Storybook

```sh
pnpm storybook
```

```sh
pnpm build-storybook
```

```sh
pnpm test:storybook
```

```sh
pnpm test:storybook:coverage
```

Autodocs is enabled globally for the package stories, and the Docs page includes Storybook's built-in Code panel for rendered examples.
Use the `Styling` toolbar control in Storybook to toggle the optional `basic-styling` layer on or off across all stories.
Use the `Theme` toolbar control to preview the starter styling in light, dark, or system mode through the CSS `light-dark()` tokens.
Use the `Palette` toolbar control to swap the computed starter palettes between `slate`, `sand`, `ocean`, and `berry`.
The `Techniques/Color` stories show how to force a local `color-scheme`, scope a different palette with `data-basic-palette`, and override the semantic `--basic-color-*` tokens for one section.
The `Overview/Palette Tokens` docs page renders the exported token values with Storybook's built-in `ColorPalette` and `ColorItem` blocks.
Storybook Test coverage is enabled through the Vitest addon. In the Storybook UI, turn coverage on in the testing panel to see the summary and open the full report at `/coverage/index.html`. From the CLI, `test:storybook:coverage` writes reports to `coverage/storybook/`.

The Visual Tests panel is provided by `@chromatic-com/storybook`. To run cloud visual checks, connect the addon to a Chromatic project from the Storybook UI.

GitHub Actions now splits Storybook automation by purpose:

- `CI` runs the browser-backed Storybook test suite on pull requests and pushes to `main`.
- `Storybook Preview` builds Storybook for pull requests and uploads `storybook-static` as an artifact.
- `Storybook Pages` deploys the built Storybook from `main` to GitHub Pages.
- `Chromatic` publishes Storybook builds on branch pushes when the `CHROMATIC_PROJECT_TOKEN` repository secret is configured.

## Changesets

For changes that affect the published package, run:

```sh
pnpm changeset
```

Commit the generated Markdown file under `.changeset/` with the rest of your work. If a change is repo-only and does not affect the published package, no changeset file is needed.

## Releasing

Merging changesets into `main` causes the `Release` workflow to open or update a `chore: release` pull request. Merging that release pull request will:

1. run `pnpm release`
2. publish the package to npm with trusted publishing from GitHub Actions
3. create the matching `vX.Y.Z` git tag and GitHub Release
4. attach the packed tarball to the GitHub Release

Trusted publishing must be configured on npm for `@lmfaole/basics` against the GitHub Actions workflow file `.github/workflows/release.yml` in the `lmfaole/basics` repository. No `NPM_TOKEN` repository secret is needed once trusted publishing is active.

If a release needs to be retried after the workflow changes land, use the `Release` workflow's `publish_current_version` manual input to publish the current `package.json` version from `main` when it is still unpublished.

## Commits

Use Conventional Commits for commit messages and pull request titles. The GitHub workflow accepts `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`, with an optional scope such as `feat(tabs): add keyboard support`.

## Basic Alert

```html
<basic-alert data-label="Lagring fullfort" data-live="polite">
  <h2 data-alert-title>Endringer lagret</h2>
  <p>Meldingen ble lagret uten feil.</p>
  <button type="button" data-alert-close>Dismiss</button>
</basic-alert>

<script type="module">
  import "@lmfaole/basics/components/basic-alert/register";
</script>
```

The element upgrades inline content into a named live-region alert without adding any styles of its own.

### Attributes

- `data-label`: fallback accessible name when the alert has no `aria-label`, `aria-labelledby`, or `[data-alert-title]`.
- `data-live`: chooses the live-region mode. Use `assertive` for `role="alert"` or `polite` for `role="status"`.

### Behavior

- Applies the matching live-region role, `aria-live`, and `aria-atomic="true"` on the root element.
- Uses `[data-alert-title]` as the accessible name when present, otherwise falls back to `data-label`.
- `[data-alert-close]` controls hide the alert and remove its managed `data-open` state.
- `show()` and `hide()` methods can be used for programmatic visibility changes.

### Markup Contract

- Put the content directly inside `<basic-alert>`.
- Use `[data-alert-title]` when the alert should have a visible accessible name.
- Use `[data-alert-close]` when the alert should be dismissible.
- Keep layout and styling outside the package; the component only manages semantics and simple dismissal behavior.

## Basic Toast

```html
<basic-toast data-label="Lagring fullfort" data-duration="5000">
  <button type="button" data-toast-open>Show toast</button>

  <section data-toast-panel>
    <h2 data-toast-title>Lagret</h2>
    <p>Meldingen ble lagret uten feil.</p>
    <button type="button" data-toast-close>Dismiss</button>
  </section>
</basic-toast>

<script type="module">
  import "@lmfaole/basics/components/basic-toast/register";
</script>
```

The element upgrades trigger-and-panel markup into a toast notification flow without adding any styles of its own.

### Attributes

- `data-label`: fallback accessible name when the toast panel has no `aria-label`, `aria-labelledby`, or `[data-toast-title]`.
- `data-live`: chooses the live-region mode. Use `polite` for `role="status"` or `assertive` for `role="alert"`.
- `data-duration`: auto-dismiss timeout in milliseconds. Use `0` to disable auto-dismiss.
- `data-open`: optional initial open state for the toast panel.

### Behavior

- Uses the Popover API in manual mode when available so the toast panel can render in the top layer.
- Syncs the panel's open state, `hidden`, and `data-open` on the toast panel and root element.
- Uses `[data-toast-title]` as the accessible name when present, otherwise falls back to `data-label`.
- `[data-toast-open]` toggles the toast, while `[data-toast-close]` dismisses it.
- Auto-dismisses after `data-duration` milliseconds unless the duration is `0`.
- `show()`, `hide()`, and `toggle()` methods support programmatic control.

### Markup Contract

- Provide one descendant `[data-toast-panel]`.
- Use `[data-toast-open]` on buttons that should show or toggle the toast.
- Use `[data-toast-close]` when the toast should expose an explicit dismiss action.
- Use `[data-toast-title]` when the toast should have a visible accessible name.
- When using the optional starter styling, set `data-toast-position` to presets such as `top-right`, `bottom-center`, or `center` to move the top-layer toast around the viewport.
- Keep layout and styling outside the package; the component only manages semantics, open state, and optional auto-dismiss behavior.

## Basic Popover

```html
<basic-popover data-label="Filtre" data-anchor-trigger data-position-area="bottom">
  <button type="button" data-popover-open>Toggle popover</button>

  <section data-popover-panel>
    <h2 data-popover-title>Filtre</h2>
    <p>Popover body.</p>
    <button type="button" data-popover-close>Close</button>
  </section>
</basic-popover>

<script type="module">
  import "@lmfaole/basics/components/basic-popover/register";
</script>
```

The element upgrades popover trigger-and-panel markup into an accessible non-modal overlay without adding any styles of its own.

### Attributes

- `data-label`: fallback accessible name when the popover has no `aria-label`, `aria-labelledby`, or `[data-popover-title]`.
- `data-anchor-trigger`: uses the opener as the popover's implicit anchor so consumer CSS can position the panel relative to the trigger.
- `data-position-area`: sets the CSS anchor-positioning area used when `data-anchor-trigger` is enabled. Defaults to `bottom`.
- `data-position-try-fallbacks`: optional comma-separated fallback list used when the default anchored placement would overflow. By default the component derives a sensible sequence from `data-position-area`.

### Behavior

- Uses the native Popover API in auto mode for outside-click and `Esc` dismissal.
- Syncs `aria-expanded`, `aria-controls`, and `data-open` between the trigger and panel.
- Restores focus to the opener when dismissal should return to it, while preserving focus on an outside control the user explicitly clicked.
- When `data-anchor-trigger` is set, opening the popover passes the trigger as the Popover API `source`, establishes the panel's implicit anchor, and applies the configured `position-area`.
- When `data-anchor-trigger` is set and `data-position-try-fallbacks` is not provided, the component derives a fallback sequence from the default placement:
  `bottom` or `top` start with `flip-block`, while `left` or `right` start with `flip-inline`.
- `[data-popover-close]` controls can dismiss the panel from inside the overlay.

### Markup Contract

- Provide one descendant `[data-popover-panel]`.
- Use `[data-popover-open]` on buttons that should toggle the panel.
- Use `[data-popover-title]` for the popover heading when you want it to become the accessible name.
- If you set `data-anchor-trigger`, you can tune the default anchored placement with `data-position-area` and optionally override its overflow fallbacks with `data-position-try-fallbacks`.
- Keep layout and styling outside the package; the component only manages semantics and open or close behavior.

## Basic Dialog

```html
<basic-dialog data-label="Bekreft handling" data-backdrop-close>
  <button type="button" data-dialog-open>Open dialog</button>

  <dialog data-dialog-panel>
    <h2 data-dialog-title>Bekreft handling</h2>
    <p>Dialog body.</p>
    <button type="button" data-dialog-close>Cancel</button>
    <button type="button" data-dialog-close data-dialog-close-value="confirmed">
      Confirm
    </button>
  </dialog>
</basic-dialog>

<script type="module">
  import "@lmfaole/basics/components/basic-dialog/register";
</script>
```

The element upgrades native `<dialog>` markup into an accessible modal flow without adding any styles of its own.

### Attributes

- `data-label`: fallback accessible name when the dialog has no `aria-label`, `aria-labelledby`, or `[data-dialog-title]`.
- `data-backdrop-close`: allows clicks on the dialog backdrop to close the modal.

### Behavior

- Uses the native dialog element's modal behavior via `showModal()`.
- Restores focus to the element that opened the dialog when the modal closes.
- `Esc` closes the modal through the platform's dialog behavior.
- `[data-dialog-close]` controls can optionally set `data-dialog-close-value` to pass a close value.

### Markup Contract

- Provide one descendant `<dialog data-dialog-panel>`.
- Use `[data-dialog-open]` on buttons that should open the modal.
- Use `[data-dialog-title]` for the dialog heading when you want it to become the accessible name.
- Keep layout and styling outside the package; the component only manages semantics and open or close behavior.

## Basic Accordion

```html
<basic-accordion>
  <details open>
    <summary>Oversikt</summary>
    <p>Viser en kort oppsummering.</p>
  </details>

  <details>
    <summary>Implementasjon</summary>
    <p>Viser implementasjonsdetaljer.</p>
  </details>
</basic-accordion>

<script type="module">
  import "@lmfaole/basics/components/basic-accordion/register";
</script>
```

The element coordinates direct child `details` items into an accordion without adding any styles of its own.

### Attributes

- `data-multiple`: allows multiple items to stay open at the same time.
- `data-collapsible`: allows the last open item in single mode to close.

### Markup Contract

- Provide direct child `<details>` items, each with a first-child `<summary>`.
- Add `open` to any item that should start expanded.
- Add `data-disabled` to a `<details>` item when it should be skipped by arrow-key navigation and blocked from toggling.
- Keep layout and styling outside the package; the component only manages root-level open-state rules and keyboard behavior.

### Behavior

- Native `details` and `summary` semantics are preserved.
- `data-open` stays in sync with the normalized open state for optional styling hooks.
- `ArrowUp`, `ArrowDown`, `Home`, and `End` move focus between enabled summaries.
- `Enter` and `Space` keep using the platform's native `summary` toggle behavior.
- In single-open mode, the component keeps one enabled item open unless `data-collapsible` is set.

## Basic Tabs

```html
<basic-tabs data-label="Eksempelkode">
  <div data-tabs-list>
    <button type="button" data-tab>Oversikt</button>
    <button type="button" data-tab>Implementasjon</button>
    <button type="button" data-tab>Tilgjengelighet</button>
  </div>

  <section data-tab-panel>
    <p>Viser en kort oppsummering.</p>
  </section>
  <section data-tab-panel>
    <p>Viser implementasjonsdetaljer.</p>
  </section>
  <section data-tab-panel>
    <p>Viser tilgjengelighetsnotater.</p>
  </section>
</basic-tabs>

<script type="module">
  import "@lmfaole/basics/components/basic-tabs/register";
</script>
```

The element upgrades existing markup into an accessible tab interface without adding any styles of its own.

### Attributes

- `data-label`: sets the generated tablist's accessible name when the tablist does not already have `aria-label` or `aria-labelledby`. Defaults to `Faner`.
- `data-activation`: chooses whether arrow-key focus changes also activate the panel. Supported values are `automatic` and `manual`.
- `data-selected-index`: sets the initially selected tab by zero-based index. Defaults to the first enabled tab.

### Behavior

- Missing tab and panel ids are generated automatically.
- `aria-selected`, `aria-controls`, `aria-labelledby`, `hidden`, and `data-selected` stay in sync with the active tab.
- Click, `ArrowLeft`, `ArrowRight`, `Home`, and `End` move between tabs.
- Disabled tabs are skipped during keyboard navigation.
- In `manual` mode, arrow keys move focus and `Enter` or `Space` activates the focused tab.

### Markup Contract

- Provide one descendant element with `data-tabs-list` to hold the interactive tab controls.
- Provide matching counts of `[data-tab]` and `[data-tab-panel]` descendants in the same order.
- Prefer `<button>` elements for tabs so click and keyboard activation stay native.
- Keep layout and styling outside the package; the component only manages semantics, state, and keyboard behavior.

## Basic Table

```html
<basic-table
  data-caption="Bemanning per sprint"
  data-description="Viser team, lokasjon og ledig kapasitet per sprint."
  data-row-headers
  data-row-header-column="2"
>
  <table>
    <thead>
      <tr>
        <th>Statuskode</th>
        <th>Team</th>
        <th>Lokasjon</th>
        <th>Sprint</th>
        <th>Ledige timer</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>A1</td>
        <td>Plattform</td>
        <td>Oslo</td>
        <td>14</td>
        <td>18</td>
      </tr>
      <tr>
        <td>B4</td>
        <td>Designsystem</td>
        <td>Trondheim</td>
        <td>14</td>
        <td>10</td>
      </tr>
      <tr>
        <td>C2</td>
        <td>Innsikt</td>
        <td>Bergen</td>
        <td>15</td>
        <td>26</td>
      </tr>
      <tr>
        <td>D7</td>
        <td>Betaling</td>
        <td>Stockholm</td>
        <td>15</td>
        <td>8</td>
      </tr>
    </tbody>
  </table>
</basic-table>

<script type="module">
  import "@lmfaole/basics/components/basic-table/register";
</script>
```

The element upgrades a regular table with stronger accessible naming and header associations without imposing any styles.

### Attributes

- `data-caption`: generates a visible `<caption>` when the wrapped table does not already define one.
- `data-column-headers`: promotes the first row to column headers when the author provides a plain table without a header row.
- `data-description`: generates a hidden description and connects it with `aria-describedby`.
- `data-label`: sets a fallback accessible name when the table has no caption, `aria-label`, or `aria-labelledby`. Defaults to `Tabell`.
- `data-row-header-column`: sets which one-based body column should become the generated row header. Defaults to `1`.
- `data-row-headers`: enables generated row headers in body rows. If `data-row-header-column` is present, row-header mode is enabled automatically.

### Behavior

- Preserves author-provided captions and only generates one when needed.
- Can generate hidden helper text for extra context without requiring a separate authored description element.
- Can promote a plain first row to column headers when consumers start from simple body-only markup.
- Infers common `scope` values for header cells and assigns missing header ids.
- Populates each data cell's `headers` attribute from the matching row and column headers.
- Re-runs automatically when the wrapped table changes.

### Markup Contract

- Provide one descendant `<table>` inside the custom element.
- Use real table sections and header cells where possible; the component strengthens semantics but does not replace the HTML table model.
- Add `data-row-headers` when one body column identifies each row, and use `data-row-header-column` when that column is not the first one.
- Add `data-column-headers` when you want the component to promote a plain first row instead of authoring a header row yourself.
- Keep layout and styling outside the package; the component only manages semantics and accessibility metadata.

## Basic Summary Table

```html
<basic-summary-table
  data-caption="Månedlig kostnadsoversikt"
  data-description="Viser antall og summerte beløp for faste kostnader."
  data-row-headers
  data-summary-columns="2,4"
  data-total-label="Totalt"
  data-locale="nb-NO"
>
  <table>
    <thead>
      <tr>
        <th>Post</th>
        <th>Antall</th>
        <th>Enhetspris</th>
        <th>Beløp</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Basisabonnement</td>
        <td>12</td>
        <td>49,00 kr</td>
        <td>588,00 kr</td>
      </tr>
      <tr>
        <td>Supportavtale</td>
        <td>1</td>
        <td>299,00 kr</td>
        <td>299,00 kr</td>
      </tr>
      <tr>
        <td>Lagringstillegg</td>
        <td>4</td>
        <td>120,00 kr</td>
        <td>480,00 kr</td>
      </tr>
      <tr>
        <td>Opplæringsplasser</td>
        <td>3</td>
        <td>180,00 kr</td>
        <td>540,00 kr</td>
      </tr>
    </tbody>
  </table>
</basic-summary-table>

<script type="module">
  import "@lmfaole/basics/components/basic-summary-table/register";
</script>
```

The element upgrades a calculation-heavy table with an automatically maintained totals row in `<tfoot>`.

### Attributes

- `data-caption`: generates a visible `<caption>` when the wrapped table does not already define one.
- `data-description`: generates hidden helper text and connects it with `aria-describedby`.
- `data-label`: sets a fallback accessible name when the table has no caption, `aria-label`, or `aria-labelledby`. Defaults to `Tabell`.
- `data-row-headers`: enables generated row headers in body rows.
- `data-row-header-column`: sets which one-based body column should become the generated row header. Defaults to `1`.
- `data-summary-columns`: chooses which one-based columns should be totalled in the generated footer row. If omitted, numeric body columns are inferred automatically.
- `data-total-label`: sets the footer row label. Defaults to `Totalt`.
- `data-locale`: passes a locale through to `Intl.NumberFormat` for generated footer totals.

### Behavior

- Inherits caption, description, row-header, and `headers` association behavior from `basic-table`.
- Parses numbers from cell text and supports raw calculation values through `data-value` on individual body cells.
- Generates or updates a totals row in `<tfoot>` without requiring consumers to author the footer manually.
- Preserves a consistent displayed unit or currency affix such as `kr`, `%`, or `t` in generated footer totals.
- Recalculates totals automatically when body rows or `data-value` attributes change.

### Markup Contract

- Provide one descendant `<table>` with line items in `<tbody>`.
- Prefer a label column such as `Post` or `Kategori` and enable `data-row-headers` so each line item remains easy to navigate.
- Use `data-value` on cells when the displayed text is formatted differently from the numeric value you want summed.
- Keep layout and styling outside the package; the component only manages semantics, totals, and footer structure.

## Basic Toc

```html
<basic-toc data-title="Innhold">
  <nav aria-label="Innhold" data-page-toc-nav></nav>
</basic-toc>

<script type="module">
  import "@lmfaole/basics/components/basic-toc/register";
</script>
```

The element reads headings from the nearest `<main>` and updates automatically when that content changes.

### Attributes

- `data-title`: sets the generated nav's accessible label. Defaults to `Innhold`.
- `data-heading-selector`: limits which headings are indexed. Defaults to `h1, h2, h3, h4, h5, h6`.

### Behavior

- Missing heading ids are generated automatically.
- Duplicate headings receive unique fragment ids.
- Hidden headings are ignored.
- The outline is rebuilt when matching headings are added or changed.

### Markup Contract

- Render the element inside the same `<main>` that contains the content it should index.
- Provide a descendant element with `data-page-toc-nav` for the generated links.
- Keep layout and styling outside the package; the component only manages structure and link generation.
