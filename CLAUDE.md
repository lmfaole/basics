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

## Rules

These are binding. When a rule and convenience conflict, the rule wins.

### Lightweight

- No runtime `dependencies`. This package ships with zero — every dependency would be a transitive burden on consumers.
- No new `devDependencies` without justification. Today's set is Vitest, Storybook, Playwright, Changesets, Chromatic, TypeScript types. Don't add bundlers, minifiers, postcss, sass, tailwind, vite, esbuild, etc.
- No frameworks (React, Vue, Lit, Solid, jQuery) and no utility libs (lodash, date-fns, zod, ramda). Consumers may use them; this package may not.
- No polyfills, no analytics, no logging, no telemetry.
- Use the platform first: `Intl`, `<dialog>` + `showModal`, `popover` + `popovertarget`, `<details>`, anchor positioning, `URLPattern`, `AbortController`, `crypto.randomUUID`, `structuredClone`, `Object.groupBy`, `toSorted`/`toReversed`/`with`, CSS nesting, `:has()`/`:is()`/`:where()`, `@container`, `field-sizing: content`, `color-mix()`/`light-dark()`, view transitions, custom-element lifecycle (`connectedCallback`, `disconnectedCallback`, `attributeChangedCallback` + `observedAttributes`).
- Delete dead code and unused exports when you see them.

### CSS (`basic-styling`)

- The starter styling is token-driven. Reference variables from `basic-styling/tokens/*.css`; don't hardcode colors, spacing, or font sizes.
- Palette files under `basic-styling/tokens/` (`palette.css`, `palette.tokens.json`, `palette-docs.js`) are generated. Edit `scripts/generate-palette-tokens.mjs` and regenerate — `pnpm run check:generated-files` enforces this.
- Don't add a new token until it has at least two uses.
- Don't add new `@layer`s. The existing structure is the contract.
- Semantic HTML first (`<button>`, `<a href>`, `<dialog>`, `<details>`, `<table>`, `<form>`). Reach for ARIA only when HTML doesn't cover the case.
- Use `:focus-visible` for focus styles; never strip outline without replacement.
- Respect `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `prefers-reduced-transparency`. Defaults must work without JS interaction-state shims.
- Touch targets ≥ 44 × 44 px.
- Animations: < 300 ms, must support understanding (no decorative motion).

### Custom-element discipline

(extends [Architecture > Custom element conventions](#custom-element-conventions))

- Components are **dumb**: no global state, no implicit network, no business logic the consumer didn't opt into. They render from light-DOM children + `data-*` and emit when the user acts.
- Data flows in via attributes (`observedAttributes` + `attributeChangedCallback`) or DOM children. Signals flow out via `dispatchEvent(new CustomEvent(...))`. No global event bus, no module-scope shared state.
- Light DOM only — no shadow DOM. Consumers style with their own CSS.
- When the element writes to an author-owned node (the `<dialog>` panel, a button), mark the write with a `data-basic-*-managed-*` sentinel so the next sync doesn't clobber an author override. See `MANAGED_LABELLEDBY_ATTRIBUTE` in `basic-components/basic-dialog/index.js` for the pattern.
- The pure helpers (`normalize*`, ID parsing, attribute parsing) are the testable surface. Keep them exported and pure; let `index.test.js` cover them in Node without a DOM.

### Tests

- Pure helpers go in `*.test.js` under the Node Vitest config. End-to-end DOM behavior goes in `*.stories.js` `play` functions under the Storybook Vitest config.
- Test behavior, not implementation. Don't assert against private internals — extract them into testable helpers or leave them.
- Don't test the platform (`Intl`, `URL`, DOM, `<dialog>`). Test your use of it.
- Keep tests deterministic. No `Date.now()`, `new Date()`, `Math.random()`, `crypto.randomUUID()` without injection.
- Don't `test.skip` / `test.todo` without a dated TODO and an owner.
- Delete tests with the code they cover. Never comment them out.

### Codemods (`codemods/`)

- Every major changeset needs a matching codemod folder at `codemods/<changeset-slug>/`, where the slug matches the `.changeset/<slug>.md` filename. `pnpm run check:breaking-change-codemods` enforces this in CI.
- Each folder ships `index.mjs` and `README.md`. Start from `codemods/_template/`; don't invent a different layout.
- `README.md` documents what the codemod rewrites, how to run it, which files it targets, and which manual steps still need follow-up.
- Node built-ins only (`node:fs`, `node:path`, `node:url`). No runtime or dev dependencies — the codemod runs in the consumer's environment, and the lightweight rule applies here too.
- Plain ESM that runs as-is on Node 24 — no build step, no TypeScript, no transpile.
- Accept input file paths as CLI args (`process.argv.slice(2)`). Let the shell glob; don't pull in a glob library.
- Idempotent: skip the write when `nextSource === previousSource`, and re-running the codemod must be a no-op.
- One codemod per breaking change. Don't bundle migrations across releases into a single script, and don't reuse a slug for a later release.
- If a rewrite can't be safely automated, ship the folder with a README-only migration guide and say so explicitly — the check still requires both files to exist.

### Simplicity

- Match the size of the solution to the problem. A small feature does not get a generalized framework around it.
- Aim under ~200 lines per module. Split when one file does more than one thing.
- Don't add parameters, options, or config knobs without a caller that needs them.
- Don't generalize before two real call sites exist. Don't DRY at copy #2 — wait for copy #3.
- Don't wrap a function just to rename it. Don't write single-caller helpers — inline them.
- Don't write defensive code for states the type system rules out.
- Prefer deleting code to adding code.

### Refactor first

- Read nearby code before adding new code.
- Extend or generalize existing patterns instead of writing a parallel copy.
- Refactor and feature go in separate commits. Refactor first, run tests, then build the new thing.
- Follow established patterns: helpers exported and unit-tested, `define<Name>(registry)` idempotent factory, `register.js` one-liner, `data-*` slotting, managed-ARIA sentinels, scoped `closest(TAG) === this` queries.
- Don't introduce local exceptions to a convention. Change the convention everywhere or not at all.

### Types

- No `any`. Use `unknown` and narrow.
- No `as` casts unless a real runtime narrowing step justifies it.
- Don't wrap things in `try/catch` you can't handle meaningfully — let them propagate.
- Don't null-check values the types already guarantee.

### Files and imports

- Lowercase filenames; kebab-case for multi-word; single word when possible.
- Custom-element tag names: `basic-<name>`. Directory name matches the tag.
- Relative imports only — no path aliases.
- Named imports only — no `import * as foo`.
- No circular imports.
- Co-locate tests, stories, types, and component-local helpers in the component's directory.

### Formatting

- 4-space indent for JS/TS/CSS, 2-space for Markdown/YAML (`.editorconfig`).
- LF line endings, final newline, no trailing whitespace.
- No build step: write modern ESM that runs in Node 24 and evergreen browsers as-is.

### When in doubt

- Pick the option with the fewest files, fewest lines, fewest dependencies.
- Platform > library > own code > copy.
- If the spec doesn't mention it, it isn't in scope.
- Ask before adding a new top-level concept, a new CSS layer, or a new dev dependency.
