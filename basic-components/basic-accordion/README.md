# `basic-accordion`

Coordinates direct child `<details>` items into an accordion.

## Register

```js
import "@lmfaole/basics/basic-components/basic-accordion/register";
```

## Example

```html
<basic-accordion>
  <details open>
    <summary>Oversikt</summary>
    <p>Viser en kort oppsummering.</p>
  </details>

  <details>
    <summary>Implementasjon</summary>
    <p>Viser implementasjonsdetaljer.</p>
  </details>
</basic-accordion>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-multiple` | Allows more than one accordion item to stay open at the same time. | boolean attribute | off | `present`, `omitted` |
| `data-collapsible` | Allows the last open item in single-open mode to close. | boolean attribute | off | `present`, `omitted` |

## Item Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `open` on a child `<details>` | Sets an item's initial expanded state before the accordion normalizes it. | boolean attribute | closed | `present`, `omitted` |
| `data-disabled` on a child `<details>` | Removes the item from toggle behavior and arrow-key navigation. | boolean attribute | off | `present`, `omitted` |

## Behavior

- Preserves native `details` and `summary` semantics
- Keeps `data-open` in sync with the normalized open state
- Supports `ArrowUp`, `ArrowDown`, `Home`, and `End` between enabled summaries
- In single-open mode, keeps one enabled item open unless `data-collapsible` is set

## Markup Contract

- Provide direct child `<details>` items, each with a first-child `<summary>`
- Add `open` to any item that should start expanded
- Add `data-disabled` to a `<details>` item when it should be skipped by arrow-key navigation and blocked from toggling
- Keep layout and styling outside the package
