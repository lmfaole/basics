# `basic-summary-table`

Tables with generated totals in `<tfoot>`.

## Register

```js
import "@lmfaole/basics/basic-components/basic-summary-table/register";
```

## Example

```html
<basic-summary-table
  data-caption="Månedlig kostnadsoversikt"
  data-description="Viser antall og summerte beløp for faste kostnader."
  data-row-headers
  data-summary-columns="2,4"
  data-total-label="Totalt"
  data-locale="nb-NO"
>
  <table>
    <thead>
      <tr>
        <th>Post</th>
        <th>Antall</th>
        <th>Enhetspris</th>
        <th>Beløp</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Basisabonnement</td>
        <td>12</td>
        <td>49,00 kr</td>
        <td>588,00 kr</td>
      </tr>
      <tr>
        <td>Supportavtale</td>
        <td>1</td>
        <td>299,00 kr</td>
        <td>299,00 kr</td>
      </tr>
      <tr>
        <td>Lagringstillegg</td>
        <td>4</td>
        <td>120,00 kr</td>
        <td>480,00 kr</td>
      </tr>
    </tbody>
  </table>
</basic-summary-table>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-caption` | Generates a visible `<caption>` when the wrapped table does not already define one. | string | none | any string |
| `data-description` | Generates hidden helper text and connects it with `aria-describedby`. | string | none | any string |
| `data-label` | Fallback accessible name when the table has no caption, `aria-label`, or `aria-labelledby`. | string | `Tabell` | any string |
| `data-row-headers` | Enables generated row headers in body rows. This is also enabled automatically when `data-row-header-column` is present. | boolean attribute | off | `present`, `omitted` |
| `data-row-header-column` | Chooses which one-based body column becomes the row header. | positive integer | `1` | positive integer |
| `data-summary-columns` | Selects which columns are totalled in the generated footer row. | comma-separated integer list | infer numeric body columns | comma-separated one-based column indexes |
| `data-total-label` | Footer row label used for the generated totals row. | string | `Totalt` | any string |
| `data-locale` | Locale passed to generated footer totals. | locale string | browser default | any `Intl.NumberFormat` locale string |

## Starter Styling Prop

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-zebra` | Optional starter-CSS hook that adds alternating body-row backgrounds when you import `basic-styling`. | boolean attribute | off | `present`, `omitted` |
| `data-separators` | Optional starter-CSS hook that chooses whether interior dividers appear between rows, columns, or both when you import `basic-styling`. | enum string | `rows` | `rows`, `columns`, `both` |

## Cell Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-value` on a body cell | Raw numeric value used for calculations when the displayed text is formatted differently. | numeric string | uses the cell text | any parseable numeric string |

## Behavior

- Inherits caption, description, row-header, and `headers` association behavior from `basic-table`
- Parses numbers from cell text and supports raw values through `data-value` on body cells
- Generates and updates a totals row in `<tfoot>`
- Recalculates when body rows or `data-value` attributes change

## Markup Contract

- Provide one descendant `<table>` with line items in `<tbody>`
- Prefer a label column and enable `data-row-headers` so each row remains easy to navigate
- Use `data-value` on cells when the displayed text differs from the numeric value you want summed
- Keep layout and styling outside the package
