---
"@lmfaole/basics": patch
---

Remove the unused `--basic-stack-gap` CSS custom property from `basic-styling/tokens/base.css`. The token was defined but referenced nowhere, violating the project's "no token without two uses" rule.
