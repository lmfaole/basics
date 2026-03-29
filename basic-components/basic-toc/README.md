# `basic-toc`

Generated table-of-contents navigation from the nearest `<main>`.

## Register

```js
import "@lmfaole/basics/basic-components/basic-toc/register";
```

## Example

```html
<basic-toc data-title="Innhold">
  <nav aria-label="Innhold" data-page-toc-nav></nav>
</basic-toc>
```

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-title` | Accessible label applied to the generated nav. | string | `Innhold` | any string |
| `data-heading-selector` | Selector used to collect headings from the nearest `<main>`. | CSS selector | `h1, h2, h3, h4, h5, h6` | any CSS selector |

## Markup Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-page-toc-nav` | Container where the generated outline links are rendered. | descendant element attribute | required | present on one descendant element |

## Behavior

- Generates missing heading ids automatically
- Gives duplicate headings unique fragment ids
- Ignores hidden headings
- Rebuilds the outline when matching headings are added or changed

## Markup Contract

- Render the element inside the same `<main>` that contains the content it should index
- Provide a descendant element with `data-page-toc-nav` for the generated links
- Keep layout and styling outside the package
