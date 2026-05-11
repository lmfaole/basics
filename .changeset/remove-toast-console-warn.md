---
"@lmfaole/basics": patch
---

`basic-toast` no longer logs a console warning when its panel contains interactive content. The same guidance is documented in the toast README; runtime logging violated the package's "no logging, no telemetry" rule.
