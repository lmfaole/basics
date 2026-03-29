# `basic-table`

Accessible naming and header relationships for regular tables.

## Register

```js
import "@lmfaole/basics/basic-components/basic-table/register";
```

## Example

```html
<basic-table
  data-caption="Bemanning per sprint"
  data-description="Viser team, lokasjon og ledig kapasitet per sprint."
  data-row-headers
  data-row-header-column="2"
>
  <table>
    <thead>
      <tr>
        <th>Statuskode</th>
        <th>Team</th>
        <th>Lokasjon</th>
        <th>Sprint</th>
        <th>Ledige timer</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>A1</td>
        <td>Plattform</td>
        <td>Oslo</td>
        <td>14</td>
        <td>18</td>
      </tr>
      <tr>
        <td>B4</td>
        <td>Designsystem</td>
        <td>Trondheim</td>
        <td>14</td>
        <td>10</td>
      </tr>
      <tr>
        <td>C2</td>
        <td>Innsikt</td>
        <td>Bergen</td>
        <td>15</td>
        <td>26</td>
      </tr>
    </tbody>
  </table>
</basic-table>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-caption` | Generates a visible `<caption>` when the table does not already define one. | string | none | any string |
| `data-column-headers` | Promotes the first row to column headers when the author provides a plain table without a header row. | boolean attribute | off | `present`, `omitted` |
| `data-description` | Generates hidden helper text and connects it with `aria-describedby`. | string | none | any string |
| `data-label` | Fallback accessible name when the table has no caption, `aria-label`, or `aria-labelledby`. | string | `Tabell` | any string |
| `data-row-header-column` | One-based body column that should become the generated row header. | positive integer | `1` | positive integer |
| `data-row-headers` | Enables generated row headers in body rows. This is also enabled automatically when `data-row-header-column` is present. | boolean attribute | off | `present`, `omitted` |

## Starter Styling Prop

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-zebra` | Optional starter-CSS hook that adds alternating body-row backgrounds when you import `basic-styling`. | boolean attribute | off | `present`, `omitted` |
| `data-separators` | Optional starter-CSS hook that chooses whether interior dividers appear between rows, columns, or both when you import `basic-styling`. | enum string | `rows` | `rows`, `columns`, `both` |

## Behavior

- Preserves author-provided captions and only generates one when needed
- Can generate hidden helper text for extra context
- Can promote a plain first row to column headers
- Assigns missing header ids and populates `headers` on data cells
- Re-runs automatically when the wrapped table changes

## Markup Contract

- Provide one descendant `<table>`
- Use real table sections and header cells where possible
- Add `data-row-headers` when one body column identifies each row
- Add `data-column-headers` only when you want the component to promote a plain first row
- Keep layout and styling outside the package
