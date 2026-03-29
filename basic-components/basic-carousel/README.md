# `basic-carousel`

Named carousel regions built around a native scroll-snap track.

## Register

```js
import "@lmfaole/basics/basic-components/basic-carousel/register";
```

## Example

```html
<basic-carousel
  data-label="Featured stories"
  data-controls="both"
  data-snapping="center"
>
  <div data-carousel-track>
    <article>
      <h2>Launch Week</h2>
      <p>Three product updates shipping across the design system.</p>
    </article>

    <article data-carousel-marker-label="Go to the accessibility slide">
      <h2>Accessibility</h2>
      <p>Keyboard and announcement details for the next release.</p>
    </article>

    <article>
      <h2>Change Freeze Window</h2>
      <p>Friday deployment holds and rollback owners are published for the April migration.</p>
    </article>

    <article>
      <h2>Signup Funnel Feedback</h2>
      <p>Eight research sessions highlighted friction around plan limits and account handoff.</p>
    </article>

    <article>
      <h2>Tokens</h2>
      <p>New surface and border tokens for interaction states.</p>
    </article>

    <article>
      <h2>Migration Guides Updated</h2>
      <p>Upgrade notes now include copy-paste examples and QA checklists for current component consumers.</p>
    </article>

    <article>
      <h2>Bundle Audit Review</h2>
      <p>A new audit flags duplicate helper code across package entry points and the next trim targets.</p>
    </article>

    <article>
      <h2>Permission Model Review</h2>
      <p>Security notes now spell out which stories need elevated browser APIs and which ones stay sandbox-safe.</p>
    </article>

    <article>
      <h2>Pilot Teams Onboarded</h2>
      <p>Three product squads have moved their prototypes onto the package and started filing integration feedback.</p>
    </article>

    <article>
      <h2>Regression Sweep</h2>
      <p>A targeted browser sweep caught contrast regressions, stale labels, and one broken close action before release cut.</p>
    </article>
  </div>
</basic-carousel>
```

Import the optional starter carousel CSS when you want native `::scroll-button()` and `::scroll-marker` controls where the browser supports them.

## Props

| Prop | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-label` | Accessible name for the carousel region when no own `aria-label` or `aria-labelledby` is present. | string | `Carousel` | any string |
| `data-controls` | Chooses which native scroll controls to expose when the browser supports them. | string | `both` | `both`, `markers`, `arrows`, `none` |
| `data-snapping` | Chooses where each slide snaps within the scrollport and where `scrollToItem()` aligns it. | string | `center` | `start`, `center`, `end` |

## Markup Hooks

| Hook | Description | Type | Default | Options |
| --- | --- | --- | --- | --- |
| `data-carousel-track` | Marks the scroll container that owns the slides and native CSS controls. | descendant container attribute | required | present on one descendant scroll container |
| direct children of `[data-carousel-track]` | Each direct child becomes one carousel slide and one generated scroll marker. | descendant item | required | present on one or more direct child elements |
| `data-carousel-marker-label` | Optional per-slide label used for the generated marker's accessible name. | string attribute on a direct slide child | auto-generated | any string |

## Behavior

- Applies `role="region"` and a fallback accessible label on the root element
- Normalizes `data-controls` to `both`, `markers`, `arrows`, or `none`
- Normalizes `data-snapping` to `start`, `center`, or `end`
- Annotates each slide with generated marker text and marker labels for CSS `content: attr(...)`
- Exposes `refresh()` when the slide structure changes after connection
- Exposes `scrollToItem(index, options)` for programmatic navigation

## Markup Contract

- Provide one descendant element with `data-carousel-track`
- Keep each slide as a direct child of that track
- Add your own slide semantics inside each item, for example `article`, `li`, or `section`
- Use `data-controls="none"` for no generated controls, `data-controls="markers"` for numbered markers only, `data-controls="arrows"` for arrows only, or `data-controls="both"` for both controls
- Use `data-snapping="start"`, `center`, or `end` to align the active slide consistently
- Import starter CSS if you want generated scroll buttons and scroll markers
- Browsers without native scroll controls still get the scroll-snap track and manual scrolling
