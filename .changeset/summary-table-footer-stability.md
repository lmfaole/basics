---
"@lmfaole/basics": patch
---

Keep `basic-summary-table` footer rows stable between refreshes to avoid unnecessary DOM churn, and update the summary table examples to use more generic currency-based data.
Stop `basic-table` and `basic-summary-table` from repeatedly rewriting managed table cells during internal refreshes.
Preserve consistent displayed units such as `kr` and `t` in generated summary footer totals.
