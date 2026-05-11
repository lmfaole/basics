---
"@lmfaole/basics": minor
---

Expand and solidify the base token layer in `basic-styling/tokens/base.css`. Add typography tokens (`--basic-font-size-small`, `--basic-font-weight-medium`, `--basic-font-weight-strong`, `--basic-line-height-tight`) and focus-ring tokens (`--basic-focus-ring-width`, `--basic-focus-ring-offset`) that were previously hardcoded across the package CSS. All component sheets, `global.css`, and `forms.css` now consume these tokens, so consumers can retune typographic weight, secondary copy size, title leading, or the focus-ring shape from a single place. A new `Overview/Base Tokens` Storybook page documents each token.
