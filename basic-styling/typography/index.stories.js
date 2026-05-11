import { expect, waitFor, within } from "storybook/test";

function withFrame(innerMarkup, extraStyles = "") {
    return `<style>
  .basic-type-frame {
    display: grid;
    gap: var(--basic-space-4);
    padding: var(--basic-space-5);
    color: var(--basic-color-text);
  }

  .basic-type-frame > p {
    margin: 0;
    color: var(--basic-color-text-muted);
  }

  .basic-type-grid {
    display: grid;
    gap: var(--basic-space-4);
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  }

  .basic-type-card {
    display: grid;
    gap: var(--basic-space-2);
    padding: var(--basic-space-4);
    border: var(--basic-border-width) solid var(--basic-color-border);
    border-radius: var(--basic-radius);
    background: var(--basic-color-surface);
  }

  .basic-type-card__label {
    color: var(--basic-color-text-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8rem;
  }

  .basic-type-card__sample {
    margin: 0;
    color: var(--basic-color-text);
    line-height: var(--basic-line-height-tight);
  }

  ${extraStyles}
</style>

<div class="basic-type-frame">${innerMarkup}</div>`;
}

const scaleMarkup = `<section class="basic-type-grid">
  <article class="basic-type-card">
    <span class="basic-type-card__label">--basic-font-size-small</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size-small);" data-type-sample="small">
      Secondary copy stays legible without crowding the line.
    </p>
  </article>

  <article class="basic-type-card">
    <span class="basic-type-card__label">--basic-font-size</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size);" data-type-sample="body">
      Body copy. Resize the window to watch the size grow smoothly.
    </p>
  </article>

  <article class="basic-type-card">
    <span class="basic-type-card__label">--basic-font-size-title</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size-title);" data-type-sample="title">
      Panel and dialog titles.
    </p>
  </article>
</section>`;

const scaleSource = withFrame(`<p>The three font-size tokens form the package's type scale. Each one is fluid by default — its computed value lives between a configured min and max as the viewport grows.</p>
${scaleMarkup}`);

const fluidComparisonExtraStyles = `
  .basic-type-fluid-card[data-scale="0"] { --basic-fluid-scale: 0; }
  .basic-type-fluid-card[data-scale="0-5"] { --basic-fluid-scale: 0.5; }
  .basic-type-fluid-card[data-scale="1"] { --basic-fluid-scale: 1; }
  .basic-type-fluid-card[data-scale="2"] { --basic-fluid-scale: 2; }
`;

const fluidComparisonMarkup = `<section class="basic-type-grid">
  <article class="basic-type-card basic-type-fluid-card" data-basic-typography data-scale="0">
    <span class="basic-type-card__label">--basic-fluid-scale: 0</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size-title);" data-fluid-title="static">
      Title pinned to its min.
    </p>
  </article>

  <article class="basic-type-card basic-type-fluid-card" data-basic-typography data-scale="0-5">
    <span class="basic-type-card__label">--basic-fluid-scale: 0.5</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size-title);" data-fluid-title="half">
      Gentle scaling — halfway response to viewport.
    </p>
  </article>

  <article class="basic-type-card basic-type-fluid-card" data-basic-typography data-scale="1">
    <span class="basic-type-card__label">--basic-fluid-scale: 1</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size-title);" data-fluid-title="default">
      Default response.
    </p>
  </article>

  <article class="basic-type-card basic-type-fluid-card" data-basic-typography data-scale="2">
    <span class="basic-type-card__label">--basic-fluid-scale: 2</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size-title);" data-fluid-title="bold">
      Bolder — reaches max at half the viewport range.
    </p>
  </article>
</section>`;

const fluidComparisonSource = withFrame(
    `<p>Each card sets <code>data-basic-typography</code> (so the clamp tokens recompute on that subtree) and pins <code>--basic-fluid-scale</code> to a different value. With <code>0</code> the title sticks to its min; with <code>1</code> it follows the default response; higher values reach max sooner.</p>
${fluidComparisonMarkup}`,
    fluidComparisonExtraStyles,
);

const perSizeOverrideExtraStyles = `
  .basic-type-bigger-titles {
    --basic-font-size-title-min: 1.5rem;
    --basic-font-size-title-max: 2.5rem;
  }
  .basic-type-smaller-body {
    --basic-font-size-min: 0.875rem;
    --basic-font-size-max: 0.9375rem;
    --basic-font-size-small-min: 0.75rem;
    --basic-font-size-small-max: 0.8125rem;
  }
`;

const perSizeOverrideMarkup = `<section class="basic-type-grid">
  <article class="basic-type-card basic-type-bigger-titles" data-basic-typography>
    <span class="basic-type-card__label">Bigger titles (1.5rem → 2.5rem)</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size-title);" data-override="bigger-title">
      Override <code>--basic-font-size-title-min/-max</code> on a subtree to give it a louder title scale without touching anything else.
    </p>
  </article>

  <article class="basic-type-card basic-type-smaller-body" data-basic-typography>
    <span class="basic-type-card__label">Compact body (0.875rem → 0.9375rem)</span>
    <p class="basic-type-card__sample" style="font-size: var(--basic-font-size);" data-override="smaller-body">
      Override the body and small bounds when a section needs denser copy.
    </p>
  </article>
</section>`;

const perSizeOverrideSource = withFrame(
    `<p>Each fluid step exposes its own <code>--basic-font-size-*-min</code> and <code>--basic-font-size-*-max</code> tokens. Add <code>data-basic-typography</code> to the subtree so the clamp tokens recompute, then override the bounds — the rest of the scale stays put.</p>
${perSizeOverrideMarkup}`,
    perSizeOverrideExtraStyles,
);

function renderPlayground({ fluidScale, minViewport, maxViewport }) {
    return `<style>
  .basic-type-playground {
    --basic-fluid-scale: ${fluidScale};
    --basic-fluid-min-viewport: ${minViewport}rem;
    --basic-fluid-max-viewport: ${maxViewport}rem;
    display: grid;
    gap: var(--basic-space-3);
    padding: var(--basic-space-5);
    color: var(--basic-color-text);
  }

  .basic-type-playground__readout {
    margin: 0;
    padding: var(--basic-space-3);
    border: var(--basic-border-width) solid var(--basic-color-border);
    border-radius: var(--basic-radius);
    background: var(--basic-color-surface-muted);
    color: var(--basic-color-text-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8rem;
    line-height: var(--basic-line-height);
  }

  .basic-type-playground__samples {
    display: grid;
    gap: var(--basic-space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .basic-type-playground__samples li {
    margin: 0;
    line-height: var(--basic-line-height-tight);
  }
</style>

<section class="basic-type-playground" data-basic-typography>
  <pre class="basic-type-playground__readout">--basic-fluid-scale: ${fluidScale};
--basic-fluid-min-viewport: ${minViewport}rem;
--basic-fluid-max-viewport: ${maxViewport}rem;</pre>

  <ul class="basic-type-playground__samples">
    <li style="font-size: var(--basic-font-size-small);" data-playground-sample="small">Small — labels and captions.</li>
    <li style="font-size: var(--basic-font-size);" data-playground-sample="body">Body — comfortable reading.</li>
    <li style="font-size: var(--basic-font-size-title);" data-playground-sample="title">Title — panel and dialog emphasis.</li>
  </ul>
</section>`;
}

const meta = {
    title: "Native Elements/Typography",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            description: {
                component: `The starter typography scale is built from three fluid font-size tokens — \`--basic-font-size-small\`, \`--basic-font-size\`, and \`--basic-font-size-title\`. Each one resolves through \`clamp(min, lerp, max)\` and grows linearly as the viewport widens between \`--basic-fluid-min-viewport\` and \`--basic-fluid-max-viewport\`. A single multiplier — \`--basic-fluid-scale\` — controls how aggressively the scale responds; set it to \`0\` to disable fluidity entirely.`,
            },
            source: {
                language: "html",
            },
        },
    },
};

export default meta;

export const Scale = {
    render: () => scaleSource,
    parameters: {
        docs: {
            source: {
                code: scaleMarkup,
            },
            description: {
                story: "Overview of the three font-size tokens. Each value is fluid — resize the preview window to see the body and title sizes grow.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const small = canvas.getByText(/Secondary copy stays legible/i);
        const body = canvas.getByText(/Resize the window/i);
        const title = canvas.getByText(/Panel and dialog titles\./i);

        await waitFor(() => {
            const smallPx = parseFloat(getComputedStyle(small).fontSize);
            const bodyPx = parseFloat(getComputedStyle(body).fontSize);
            const titlePx = parseFloat(getComputedStyle(title).fontSize);

            expect(smallPx).toBeLessThan(bodyPx);
            expect(bodyPx).toBeLessThan(titlePx);
        });
    },
};

export const FluidScaleComparison = {
    render: () => fluidComparisonSource,
    parameters: {
        docs: {
            source: {
                code: fluidComparisonMarkup,
            },
            description: {
                story: "Side-by-side comparison of `--basic-fluid-scale` at `0`, `0.5`, `1`, and `2`. Each card forces the viewport-range tokens to ~0 so the scale value is the only thing that moves the title.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const staticTitle = canvasElement.querySelector('[data-fluid-title="static"]');
        const halfTitle = canvasElement.querySelector('[data-fluid-title="half"]');
        const defaultTitle = canvasElement.querySelector('[data-fluid-title="default"]');
        const boldTitle = canvasElement.querySelector('[data-fluid-title="bold"]');

        await waitFor(() => {
            const staticPx = parseFloat(getComputedStyle(staticTitle).fontSize);
            const halfPx = parseFloat(getComputedStyle(halfTitle).fontSize);
            const defaultPx = parseFloat(getComputedStyle(defaultTitle).fontSize);
            const boldPx = parseFloat(getComputedStyle(boldTitle).fontSize);

            expect(staticPx).toBeLessThan(halfPx);
            expect(halfPx).toBeLessThan(defaultPx);
            expect(defaultPx).toBeLessThanOrEqual(boldPx);
        });
    },
};

export const PerSizeOverride = {
    render: () => perSizeOverrideSource,
    parameters: {
        docs: {
            source: {
                code: perSizeOverrideMarkup,
            },
            description: {
                story: "Each step exposes `--basic-font-size-*-min` and `--basic-font-size-*-max`. Override them on a subtree to retune one step in isolation — the global `--basic-fluid-scale` and viewport range stay untouched.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const biggerTitle = canvasElement.querySelector('[data-override="bigger-title"]');
        const smallerBody = canvasElement.querySelector('[data-override="smaller-body"]');

        await waitFor(() => {
            const biggerPx = parseFloat(getComputedStyle(biggerTitle).fontSize);
            const smallerPx = parseFloat(getComputedStyle(smallerBody).fontSize);

            expect(biggerPx).toBeGreaterThanOrEqual(24);
            expect(smallerPx).toBeLessThanOrEqual(16);
        });
    },
};

export const Playground = {
    args: {
        fluidScale: 1,
        minViewport: 20,
        maxViewport: 80,
    },
    argTypes: {
        fluidScale: {
            name: "--basic-fluid-scale",
            description: "Multiplier for fluid intensity. `0` disables fluidity, `1` is the default, `>1` reaches max sooner.",
            control: { type: "range", min: 0, max: 3, step: 0.1 },
        },
        minViewport: {
            name: "--basic-fluid-min-viewport (rem)",
            description: "Viewport width where fluid scaling starts.",
            control: { type: "range", min: 10, max: 50, step: 1 },
        },
        maxViewport: {
            name: "--basic-fluid-max-viewport (rem)",
            description: "Viewport width where each size reaches its max.",
            control: { type: "range", min: 40, max: 160, step: 5 },
        },
    },
    render: renderPlayground,
    parameters: {
        docs: {
            description: {
                story: "Drag the controls to retune the fluid scale live. The readout shows the exact custom-property values applied to the surrounding subtree.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const title = canvasElement.querySelector('[data-playground-sample="title"]');
        const body = canvasElement.querySelector('[data-playground-sample="body"]');
        const small = canvasElement.querySelector('[data-playground-sample="small"]');

        await waitFor(() => {
            const titlePx = parseFloat(getComputedStyle(title).fontSize);
            const bodyPx = parseFloat(getComputedStyle(body).fontSize);
            const smallPx = parseFloat(getComputedStyle(small).fontSize);

            expect(smallPx).toBeLessThan(bodyPx);
            expect(bodyPx).toBeLessThan(titlePx);
        });
    },
};
