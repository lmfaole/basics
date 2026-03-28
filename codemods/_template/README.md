# Example Codemod

Copy this folder to `codemods/<changeset-slug>/` for a real breaking change.

Replace the placeholder transform in `index.mjs` with the migration needed for
that release, and document:

- what the codemod rewrites
- how to run it
- which files it targets
- which follow-up steps still need manual review

Example run:

```sh
node codemods/<changeset-slug>/index.mjs src/**/*.html
```
