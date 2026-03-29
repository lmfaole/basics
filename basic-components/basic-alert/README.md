# `basic-alert`

Inline live-region alert content without opinionated styling.

## Register

```js
import "@lmfaole/basics/basic-components/basic-alert/register";
```

## Example

```html
<basic-alert data-label="Lagring fullfort" data-live="polite">
  <h2 data-alert-title>Endringer lagret</h2>
  <p>Meldingen ble lagret uten feil.</p>
  <button type="button" data-alert-close>Dismiss</button>
</basic-alert>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-label` | Fallback accessible name when the alert has no `aria-label`, `aria-labelledby`, or `[data-alert-title]`. | string | `Alert` | any string |
| `data-live` | Chooses whether the alert announces as `role="alert"` or `role="status"`. | enum string | `assertive` | `assertive`, `polite` |
| `data-open` | Managed visibility flag. If omitted, the alert stays visible unless `hidden` is set. | boolean-ish attribute | visible | `present`, `omitted`, `false` |

## Markup Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-alert-title` | Makes the visible heading the alert's accessible name. | descendant heading attribute | none | present on a descendant heading |
| `data-alert-close` | Dismisses the alert when activated. | descendant control attribute | none | present on a descendant control |

## Behavior

- Applies the matching live-region role, `aria-live`, and `aria-atomic="true"` on the root element
- Uses `[data-alert-title]` as the accessible name when present, otherwise falls back to `data-label`
- `[data-alert-close]` hides the alert and removes its managed `data-open` state
- `show()` and `hide()` support programmatic visibility changes

## Markup Contract

- Put the content directly inside `<basic-alert>`
- Use `[data-alert-title]` when the alert should have a visible accessible name
- Use `[data-alert-close]` when the alert should be dismissible
- Keep layout and styling outside the package
