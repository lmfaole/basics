# `@lmfaole/basics`

Simple unstyled custom elements and DOM helpers.

## Install

```sh
pnpm add @lmfaole/basics
```

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
  <h3><button type="button" data-accordion-trigger>Oversikt</button></h3>
  <section data-accordion-panel>
    <p>Viser en kort oppsummering.</p>
  </section>

  <h3><button type="button" data-accordion-trigger>Implementasjon</button></h3>
  <section data-accordion-panel>
    <p>Viser implementasjonsdetaljer.</p>
  </section>
</basic-accordion>

<script type="module">
  import "@lmfaole/basics/components/basic-accordion/register";
</script>
```

The element upgrades existing trigger-and-panel markup into an accessible accordion without adding any styles of its own.

### Attributes

- `data-multiple`: allows multiple panels to stay open at the same time.
- `data-collapsible`: allows the last open panel in single mode to close.

### Behavior

- Missing trigger and panel ids are generated automatically.
- `aria-expanded`, `aria-controls`, `aria-labelledby`, `hidden`, and `data-open` stay in sync with the current state.
- `ArrowUp`, `ArrowDown`, `Home`, and `End` move focus between enabled triggers.
- `Enter` and `Space` toggle the focused item.
- Disabled triggers are skipped during keyboard navigation.

### Markup Contract

- Provide matching counts of `[data-accordion-trigger]` and `[data-accordion-panel]` descendants in the same order.
- Prefer `<button>` elements for triggers, usually inside your own heading elements.
- Keep layout and styling outside the package; the component only manages semantics, state, and keyboard behavior.

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
- `data-orientation`: sets arrow-key behavior and mirrors `aria-orientation` on the tablist. Supported values are `horizontal` and `vertical`.
- `data-activation`: chooses whether arrow-key focus changes also activate the panel. Supported values are `automatic` and `manual`.
- `data-selected-index`: sets the initially selected tab by zero-based index. Defaults to the first enabled tab.

### Behavior

- Missing tab and panel ids are generated automatically.
- `aria-selected`, `aria-controls`, `aria-labelledby`, `hidden`, and `data-selected` stay in sync with the active tab.
- Click, `Home`, `End`, and orientation-aware arrow keys move between tabs.
- Disabled tabs are skipped during keyboard navigation.
- In `manual` mode, arrow keys move focus and `Enter` or `Space` activates the focused tab.

### Markup Contract

- Provide one descendant element with `data-tabs-list` to hold the interactive tab controls.
- Provide matching counts of `[data-tab]` and `[data-tab-panel]` descendants in the same order.
- Prefer `<button>` elements for tabs so click and keyboard activation stay native.
- Keep layout and styling outside the package; the component only manages semantics, state, and keyboard behavior.

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
