# `basic-dialog`

Modal dialog flow built on native `<dialog>`.

## Register

```js
import "@lmfaole/basics/basic-components/basic-dialog/register";
```

## Example

```html
<basic-dialog data-label="Bekreft handling" data-backdrop-close>
  <button type="button" data-dialog-open>Open dialog</button>

  <dialog data-dialog-panel>
    <h2 data-dialog-title>Bekreft handling</h2>
    <p>Dialog body.</p>
    <button type="button" data-dialog-close>Cancel</button>
    <button type="button" data-dialog-close data-dialog-close-value="confirmed">
      Confirm
    </button>
  </dialog>
</basic-dialog>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-label` | Fallback accessible name when the dialog has no `aria-label`, `aria-labelledby`, or `[data-dialog-title]`. | string | `Dialog` | any string |
| `data-backdrop-close` | Allows clicks on the dialog backdrop to close the modal. | boolean attribute | off | `present`, `omitted` |

## Markup Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-dialog-open` | Opens the managed dialog. | descendant control attribute | none | present on a descendant button or control |
| `data-dialog-panel` | Marks the native dialog element managed by the component. | descendant `<dialog>` attribute | required | present on one descendant `<dialog>` |
| `data-dialog-title` | Makes the visible heading the dialog's accessible name. | descendant heading attribute | none | present on a descendant heading |
| `data-dialog-close` | Closes the dialog when activated. | descendant control attribute | none | present on a descendant button or control |
| `data-dialog-close-value` | Return value passed to `dialog.close()` when used on a `[data-dialog-close]` control. | string | empty string | any string |

## Behavior

- Uses native modal dialog behavior via `showModal()`
- Restores focus to the opener on close
- Lets the platform handle modal focus and `Esc` dismissal
- `[data-dialog-close]` can optionally set `data-dialog-close-value`

## Markup Contract

- Provide one descendant `<dialog data-dialog-panel>`
- Use `[data-dialog-open]` on buttons that should open the modal
- Use `[data-dialog-title]` when the heading should become the accessible name
- Keep layout and styling outside the package
