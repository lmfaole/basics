# Codemods

Breaking changes must ship with a codemod.

For a major changeset named `.changeset/example-change.md`, add:

- `codemods/example-change/index.mjs`
- `codemods/example-change/README.md`

The `README.md` should describe what the codemod rewrites, how to run it, and any migration steps that still need manual follow-up.

You can start from the template in `codemods/_template/`.
