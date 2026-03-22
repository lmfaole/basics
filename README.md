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

## Releasing

1. Update `package.json` to the version you want to ship.
2. Publish the package to npm with `npm publish --access public --registry=https://registry.npmjs.org`.
3. Push a matching git tag such as `v0.1.0`.
4. GitHub Actions will run the test suite, pack the published files, and create a GitHub Release with the tarball attached.

## Commits

Use Conventional Commits for commit messages and pull request titles. The GitHub workflow accepts `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`, with an optional scope such as `feat(tabs): add keyboard support`.

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
