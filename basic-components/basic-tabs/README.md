# `basic-tabs`

Accessible tablists and panels from existing markup.

## Register

```js
import "@lmfaole/basics/basic-components/basic-tabs/register";
```

## Example

```html
<basic-tabs data-label="Eksempelkode">
  <div data-tabs-list>
    <button type="button" data-tab>Oversikt</button>
    <button type="button" data-tab>Implementasjon</button>
    <button type="button" data-tab>Tilgjengelighet</button>
  </div>

  <section data-tab-panel>
    <p>Viser en kort oppsummering.</p>
  </section>
  <section data-tab-panel>
    <p>Viser implementasjonsdetaljer.</p>
  </section>
  <section data-tab-panel>
    <p>Viser tilgjengelighetsnotater.</p>
  </section>
</basic-tabs>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-label` | Accessible name for the generated tablist when it does not already have one. | string | `Faner` | any string |
| `data-activation` | Chooses whether arrow-key focus changes also activate the selected panel. | enum string | `automatic` | `automatic`, `manual` |
| `data-selected-index` | Sets the initially selected tab by index. Invalid values fall back to the first enabled tab. | zero-based integer | first enabled tab | zero-based integer |

## Markup Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-tabs-list` | Holds the interactive tab controls. | descendant container attribute | required | present on one descendant container |
| `data-tab` | Marks each tab control. Prefer `<button>` elements. | descendant control attribute | required | present on matching descendant controls |
| `data-tab-panel` | Marks each panel in the same order as the tabs. | descendant panel attribute | required | present on matching descendant panels |
| `disabled` on a `[data-tab]` control | Removes that tab from keyboard navigation and selection. | boolean attribute | off | `present`, `omitted` |

## Behavior

- Generates missing tab and panel ids
- Keeps `aria-selected`, `aria-controls`, `aria-labelledby`, `hidden`, and `data-selected` in sync
- Supports click, `ArrowLeft`, `ArrowRight`, `Home`, and `End`
- Skips disabled tabs during keyboard navigation
- In `manual` mode, arrow keys move focus and `Enter` or `Space` activates

## Markup Contract

- Provide one descendant element with `data-tabs-list`
- Provide matching counts of `[data-tab]` and `[data-tab-panel]` in the same order
- Prefer `<button>` elements for tabs
- Keep layout and styling outside the package
