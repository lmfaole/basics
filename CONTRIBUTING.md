# Contributing

## Tooling

- Node.js `24.x`
- `pnpm@10.30.3`

Use `.nvmrc` or `.node-version` if you want your version manager to match the repo default automatically.

Install dependencies with:

```sh
pnpm install --frozen-lockfile
```

If you need a local environment file, start from `.env.example` and keep `.env` uncommitted.

## Local Development

Useful commands:

```sh
pnpm storybook
pnpm run test:unit
pnpm run test:storybook
pnpm run check:generated-files
pnpm run check:package
pnpm run check:breaking-change-codemods
```

## Changesets

For changes that affect the published package, run:

```sh
pnpm changeset
```

Commit the generated Markdown file under `.changeset/` with the rest of your work. If a change is repo-only and does not affect the published package, no changeset file is needed.

## Breaking Changes

Any breaking change with a `major` changeset must also include a codemod in `codemods/<changeset-slug>/`, where `<changeset-slug>` matches the changeset filename.

Each codemod directory must contain:

- `index.mjs`: the codemod entry point
- `README.md`: what the codemod changes, how to run it, and any limits

Start from `codemods/_template/` when you need a new one. CI rejects major changesets that do not include that codemod folder.

## Commit and PR Expectations

Use Conventional Commits for commit messages and pull request titles. The workflow accepts `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, and `test`, with an optional scope such as `feat(tabs): add keyboard support`.

Before opening a pull request:

- run the relevant tests for the area you changed
- add or update Storybook coverage when behavior changes
- add a changeset when the published package changes
- add a codemod when the change is breaking

## Release Flow

Merging changesets into `main` causes the `Release` workflow to open or update a `chore: release` pull request. Merging that release pull request will:

1. run `pnpm release`
2. publish the package to npm with trusted publishing from GitHub Actions
3. create the matching `vX.Y.Z` git tag and GitHub Release
4. attach the packed tarball to the GitHub Release

If a release needs to be retried after the workflow changes land, use the `Release` workflow's `publish_current_version` manual input to publish the current `package.json` version from `main` when it is still unpublished.
