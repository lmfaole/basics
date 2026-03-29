# `basic-toast`

Toast notifications with managed open state and live-region announcements.

## Register

```js
import "@lmfaole/basics/basic-components/basic-toast/register";
```

## Example

```html
<basic-toast data-label="Lagring fullfort" data-duration="5000">
  <button type="button" data-toast-open>Show toast</button>

  <section data-toast-panel>
    <h2 data-toast-title>Lagret</h2>
    <p>Meldingen ble lagret uten feil.</p>
  </section>
</basic-toast>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-label` | Fallback accessible name when the toast panel has no `aria-label`, `aria-labelledby`, or `[data-toast-title]`. | string | `Toast` | any string |
| `data-live` | Chooses whether the announcement behaves like `status` or `alert`. | enum string | `polite` | `polite`, `assertive` |
| `data-duration` | Auto-dismiss timeout for the toast. | non-negative integer | `5000` | non-negative integer milliseconds, `0` disables auto-dismiss |
| `data-open` | Optional initial open state for the managed toast panel. | boolean-ish attribute | closed | `present`, `omitted`, `false` |

## Starter Styling Prop

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-toast-position` | Optional starter-CSS hook for viewport placement when you import `basic-styling`. | enum string | none | `top-left`, `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center`, `bottom-right` |

## Markup Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-toast-open` | Shows or toggles the toast. | descendant control attribute | none | present on a descendant button or control |
| `data-toast-panel` | Marks the message container managed by the component. | descendant element attribute | required | present on one descendant element |
| `data-toast-title` | Makes the visible heading the toast's accessible name. | descendant heading attribute | none | present on a descendant heading |
| `data-toast-close` | Closes the toast when activated. | descendant control attribute | none | present on a descendant control outside `[data-toast-panel]` |

## Behavior

- Uses the Popover API in manual mode when available so the toast can render in the top layer
- Announces the current toast text through an internal live region whenever the toast opens
- Syncs `hidden` and `data-open` on the panel and root element
- Uses `[data-toast-title]` as the accessible name when present, otherwise falls back to `data-label`
- Supports `show()`, `hide()`, and `toggle()`

## Markup Contract

- Provide one descendant `[data-toast-panel]`
- Keep `[data-toast-panel]` to non-interactive message content
- Use `[data-toast-open]` on buttons that should show or toggle the toast
- If you need an explicit dismiss control, place `[data-toast-close]` outside `[data-toast-panel]`
- Keep layout and styling outside the package
