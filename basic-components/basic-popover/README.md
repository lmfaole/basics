# `basic-popover`

Non-modal overlay behavior using the Popover API.

## Register

```js
import "@lmfaole/basics/basic-components/basic-popover/register";
```

## Example

```html
<basic-popover data-label="Filtre" data-anchor-trigger data-position-area="bottom">
  <button type="button" data-popover-open>Toggle popover</button>

  <section data-popover-panel>
    <h2 data-popover-title>Filtre</h2>
    <p>Popover body.</p>
    <button type="button" data-popover-close>Close</button>
  </section>
</basic-popover>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-label` | Fallback accessible name when the popover has no `aria-label`, `aria-labelledby`, or `[data-popover-title]`. | string | `Popover` | any string |
| `data-anchor-trigger` | Uses the opener as the popover's implicit anchor. | boolean attribute | off | `present`, `omitted` |
| `data-position-area` | Default anchored placement used when `data-anchor-trigger` is enabled. | CSS `position-area` token | `bottom` | any CSS `position-area` token such as `bottom`, `top`, `left`, `right`, `block-start`, `block-end`, `inline-start`, or `inline-end` |
| `data-position-try-fallbacks` | Overrides the built-in fallback sequence used when the default placement would overflow. | comma-separated string list | derived from `data-position-area` | comma-separated CSS fallback list |

## Markup Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-popover-open` | Toggles the popover open state. | descendant control attribute | none | present on a descendant button or control |
| `data-popover-panel` | Marks the overlay panel managed by the component. | descendant element attribute | required | present on one descendant element |
| `data-popover-title` | Makes the visible heading the popover's accessible name. | descendant heading attribute | none | present on a descendant heading |
| `data-popover-close` | Closes the popover when activated. | descendant control attribute | none | present on a descendant button or control |

## Behavior

- Uses the native Popover API in auto mode for outside-click and `Esc` dismissal
- Syncs `aria-expanded`, `aria-controls`, and `data-open` between the trigger and panel
- Restores focus when dismissal should return to the opener
- Supports anchored placement when `data-anchor-trigger` is set

## Markup Contract

- Provide one descendant `[data-popover-panel]`
- Use `[data-popover-open]` on buttons that should toggle the panel
- Use `[data-popover-title]` when the heading should become the accessible name
- Use `[data-popover-close]` when the panel should expose an explicit dismiss action
- Keep layout and styling outside the package
