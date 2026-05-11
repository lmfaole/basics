# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tooling

- Node.js `24.x` (see `.nvmrc` / `.node-version`).
- `pnpm@10.30.3` (declared as the project's `packageManager`).
- Install with `pnpm install --frozen-lockfile`.

## Commands

Development:

```sh
pnpm storybook              # local Storybook on :6006 (primary dev surface)
pnpm build-storybook        # static Storybook for previews
```

Testing:

```sh
pnpm test                   # runs test:unit then test:storybook
pnpm run test:unit          # vitest, Node env, matches **/*.test.js
pnpm run test:storybook     # Storybook stories run as Vitest browser tests (Chromium via Playwright)
pnpm run test:storybook:watch
pnpm run test:storybook:coverage

# single unit test
pnpm exec vitest run --config vitest.config.ts basic-components/basic-dialog/index.test.js
# single story test by name
pnpm exec vitest run --config vitest.storybook.config.ts -t "Confirm action"
```

The Storybook test runner needs Chromium installed once: `pnpm exec playwright install --with-deps chromium`.

Repo guards (run in CI under `package-validation`):

```sh
pnpm run check:generated-files            # palette tokens are up to date
pnpm run check:package                    # files in package.exports actually pack via `npm pack`
pnpm run check:breaking-change-codemods   # every major changeset has a matching codemods/<slug>/
```

Releases run from `pnpm release` (gated by `pnpm test`) and `changeset publish`. Don't invoke either directly — the `Release` workflow handles them after a `chore: release` PR is merged.

## Architecture

This is a published npm package (`@lmfaole/basics`) of **unstyled autonomous custom elements** with an **opt-in starter CSS layer**. There is no bundler in the package output — files are shipped as-authored ESM.

### Two top-level packages, one repo

- `basic-components/<name>/` — one directory per custom element. Each contains `index.js` (the class plus a `define<Name>()` factory and named exports for helpers), `register.js` (side-effectful `define<Name>()` call), matching `.d.ts` files, `index.test.js` (Vitest unit tests), `index.stories.js` (Storybook + interaction tests), and a `README.md`. The directory name is the custom element tag (`basic-dialog`, `basic-tabs`, …).
- `basic-styling/` — token-driven CSS. Entry `index.css` aggregates `global.css` (resets, tokens, color-scheme, interaction) and `components.css` (per-component sheets in `components/`). Tokens live under `tokens/` and the palette CSS is generated from `tokens/palette.tokens.json` via `scripts/generate-palette-tokens.mjs`.

`index.js` at the repo root re-exports every component module so `import { DialogElement, defineDialog } from "@lmfaole/basics"` works for consumers that prefer a single import.

### Custom element conventions

All components follow the same shape (see `basic-components/basic-dialog/index.js` as the canonical example):

1. Re-bind `Element`, `HTMLElement`, and any specific subclass off `globalThis` at module top so the file is **importable in a Node environment** (unit tests). Anything that needs DOM gates on `instanceof` checks against those locals.
2. Export the class (`DialogElement`), a `<NAME>_TAG_NAME` constant, and pure helper functions for attribute parsing (`normalizeDialogLabel`, `normalizeDialogBackdropClose`). Unit tests cover these helpers without booting a browser.
3. Export a `define<Name>(registry = globalThis.customElements)` that no-ops when the registry is missing and is idempotent (checks `registry.get(tag)` first). `register.js` is a one-line side-effectful call to this.
4. Use `data-*` attributes on light-DOM children (`data-dialog-panel`, `data-dialog-open`, …) — components are content-projection wrappers, not shadow roots. Scope queries with `element.closest(TAG_NAME) === this` so nested instances don't steal each other's children.
5. Reflect state back to the host with `toggleAttribute("data-open", …)` rather than introducing new attributes. Mirror managed ARIA attributes only when the author hasn't set them, and tag them with a `data-basic-*-managed-*` sentinel so re-syncs don't clobber author values.

When adding a new component, copy an existing one, register its directory in `index.js`, add its `register.js` to `sideEffects` in `package.json`, and let `pnpm run check:package` confirm the `exports` map resolves the new subpaths.

### Tests

- `vitest.config.ts` runs unit tests in **node** (no DOM); keep them focused on pure helpers and registry behavior.
- `vitest.storybook.config.ts` runs every `*.stories.js` `play` function as a real browser test via `@storybook/addon-vitest` + `@vitest/browser-playwright`. End-to-end DOM behavior belongs in story `play` functions, not in `index.test.js`.
- Coverage thresholds are configured for the Storybook runner only; unit tests are coverage-exempt.

### Changesets and breaking changes

- Anything that changes the published package needs a changeset (`pnpm changeset`); repo-only changes do not.
- Conventional Commits are enforced on commit messages and PR titles by the `conventional-commits` workflow (allowed types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`).
- **Every major changeset must ship a codemod** at `codemods/<changeset-slug>/` with `index.mjs` and `README.md`; `check:breaking-change-codemods` fails CI otherwise. Start from `codemods/_template/`.

### Generated files

`basic-styling/tokens/palette.css`, `palette.tokens.json`, and `palette-docs.js` are generated. Edit the palette definition in `scripts/generate-palette-tokens.mjs` and regenerate; never hand-edit the outputs (`check:generated-files` enforces this).

## Style

- 4-space indent for JS/TS/CSS, 2-space for Markdown/YAML (`.editorconfig`).
- LF line endings, final newline, no trailing whitespace.
- No build step: write modern ESM that runs in Node 24 and evergreen browsers as-is.
