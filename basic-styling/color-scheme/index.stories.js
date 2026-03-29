import "../../basic-components/basic-alert/register.js";
import "../../basic-components/basic-tabs/register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

function withFrame(innerMarkup) {
    return `<style>
  .basic-color-technique-grid {
    display: grid;
    gap: var(--basic-space-4);
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  }

  .basic-color-technique-stack {
    display: grid;
    gap: var(--basic-space-4);
  }

  .basic-color-technique-example {
    padding: var(--basic-space-4);
    border: var(--basic-border-width) solid var(--basic-color-border);
    border-radius: var(--basic-radius);
    background: var(--basic-color-background);
    color: var(--basic-color-text);
  }

  .basic-color-technique-example > :where(*) {
    margin-block: 0;
  }

  .basic-color-technique-example > :where(* + *) {
    margin-block-start: var(--basic-flow-space);
  }

  .basic-color-technique-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--basic-space-2);
  }

  .basic-color-technique-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--basic-space-2) var(--basic-space-3);
    border: var(--basic-border-width) solid var(--basic-color-border);
    border-radius: var(--basic-radius-pill);
    background: var(--basic-color-surface-muted);
  }
</style>

${innerMarkup}`;
}

const colorSchemeSource = withFrame(`<section class="basic-color-technique-grid">
  <section class="basic-color-technique-example" style="color-scheme: light;">
    <p><strong>Forced light</strong></p>
    <p>Set <code>color-scheme: light</code> on the subtree that should stay light.</p>
    <basic-alert data-label="Changes saved" data-live="polite">
      <h2 data-alert-title>Changes saved</h2>
      <p>This alert resolves the starter tokens in light mode.</p>
      <button type="button" data-alert-close>Dismiss</button>
    </basic-alert>
  </section>

  <section class="basic-color-technique-example" style="color-scheme: dark;">
    <p><strong>Forced dark</strong></p>
    <p>Set <code>color-scheme: dark</code> on the subtree that should stay dark.</p>
    <basic-alert data-label="Changes saved" data-live="polite">
      <h2 data-alert-title>Changes saved</h2>
      <p>This alert resolves the starter tokens in dark mode.</p>
      <button type="button" data-alert-close>Dismiss</button>
    </basic-alert>
  </section>
</section>`);

const scopedPaletteSource = withFrame(`<section class="basic-color-technique-grid">
  <section class="basic-color-technique-example" data-basic-palette="sand">
    <p><strong>Scoped sand palette</strong></p>
    <p>Apply <code>data-basic-palette</code> on a subtree when one surface should use a different starter palette.</p>
    <div class="basic-color-technique-chip-row">
      <span class="basic-color-technique-chip">Neutral</span>
      <span class="basic-color-technique-chip">Warm</span>
      <span class="basic-color-technique-chip">Quiet</span>
    </div>
  </section>

  <section class="basic-color-technique-example" data-basic-palette="ocean">
    <p><strong>Scoped ocean palette</strong></p>
    <p>The same semantic tokens resolve differently inside this section without touching the global preview palette.</p>
    <div class="basic-color-technique-chip-row">
      <span class="basic-color-technique-chip">Calm</span>
      <span class="basic-color-technique-chip">Cool</span>
      <span class="basic-color-technique-chip">Dense</span>
    </div>
  </section>
</section>`);

const semanticOverrideSource = withFrame(`<section class="basic-color-technique-stack">
  <section
    class="basic-color-technique-example"
    style="
      --basic-color-background: light-dark(oklch(98% 0.01 85), oklch(26% 0.03 85));
      --basic-color-surface: light-dark(oklch(100% 0 0), oklch(31% 0.03 85));
      --basic-color-surface-muted: light-dark(oklch(94% 0.05 85), oklch(38% 0.06 85));
      --basic-color-text: light-dark(oklch(28% 0.03 70), oklch(95% 0.01 85));
      --basic-color-text-muted: light-dark(oklch(43% 0.03 70), oklch(84% 0.02 85));
      --basic-color-border: light-dark(oklch(82% 0.03 80), oklch(48% 0.04 85));
      --basic-color-focus: light-dark(oklch(72% 0.12 78 / 0.45), oklch(82% 0.08 82 / 0.55));
    "
  >
    <p><strong>Local semantic override</strong></p>
    <p>Override the semantic <code>--basic-color-*</code> tokens directly when a section needs a one-off treatment.</p>
    <basic-tabs data-label="Color technique tabs">
      <div data-tabs-list>
        <button type="button" data-tab>Overview</button>
        <button type="button" data-tab>Notes</button>
      </div>

      <section data-tab-panel>
        <p>The surrounding container remaps background, surface, text, border, and focus tokens.</p>
      </section>
      <section data-tab-panel>
        <p>This keeps the component CSS unchanged while the local section gets its own color treatment.</p>
      </section>
    </basic-tabs>
  </section>
</section>`);

const meta = {
    title: "Native Elements/Color",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            description: {
                component: "Practical ways to scope or override the starter color tokens without rewriting the component styles: force a color scheme, scope a palette to one subtree, remap the semantic color tokens locally, and let the shared interaction layer pick up those token changes for hover and selected surfaces automatically.",
            },
            source: {
                language: "html",
            },
        },
    },
};

export default meta;

export const ColorScheme = {
    render: () => colorSchemeSource,
    parameters: {
        docs: {
            source: {
                code: colorSchemeSource,
            },
            description: {
                story: "Force `color-scheme: light` or `color-scheme: dark` on a subtree when a specific app shell or embedded area should stay in one mode.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const dismissButton = canvas.getAllByRole("button", { name: /dismiss/i })[0];
        const idleBackground = getComputedStyle(dismissButton, "::before").backgroundColor;

        await userEvent.tab();

        await waitFor(() => {
            expect(dismissButton).toHaveFocus();
            expect(getComputedStyle(dismissButton, "::before").backgroundColor).not.toBe(idleBackground);
        });
    },
};

export const ScopedPalette = {
    render: () => scopedPaletteSource,
    parameters: {
        docs: {
            source: {
                code: scopedPaletteSource,
            },
            description: {
                story: "Apply `data-basic-palette` to a subtree when one part of the page should use a different starter palette than the document root.",
            },
        },
    },
};

export const SemanticOverrides = {
    render: () => semanticOverrideSource,
    parameters: {
        docs: {
            source: {
                code: semanticOverrideSource,
            },
            description: {
                story: "Override the semantic `--basic-color-*` tokens directly when a local section needs a custom treatment while the component CSS stays the same.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const overviewTab = canvas.getByRole("tab", { name: /overview/i });
        const notesTab = canvas.getByRole("tab", { name: /notes/i });
        const selectedBackground = getComputedStyle(overviewTab, "::before").backgroundColor;
        const idleBackground = getComputedStyle(notesTab, "::before").backgroundColor;

        await waitFor(() => {
            expect(selectedBackground).not.toBe(idleBackground);
        });

        await userEvent.click(notesTab);

        await waitFor(() => {
            expect(notesTab).toHaveAttribute("aria-selected", "true");
            expect(getComputedStyle(notesTab, "::before").backgroundColor).not.toBe(getComputedStyle(overviewTab, "::before").backgroundColor);
        });
    },
};
