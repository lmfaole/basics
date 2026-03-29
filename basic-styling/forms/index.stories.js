import { expect, userEvent, waitFor, within } from "storybook/test";

function withFrame(innerMarkup) {
    return `<style>
  .basic-form-technique {
    max-width: 52rem;
    padding: var(--basic-space-5);
  }

  .basic-form-technique-stack {
    display: grid;
    gap: var(--basic-space-4);
  }

  .basic-form-technique-group {
    display: grid;
    gap: var(--basic-space-3);
    margin: 0;
    padding: var(--basic-space-4);
    border: var(--basic-border-width) solid var(--basic-color-border);
    background: var(--basic-color-background);
  }

  .basic-form-technique-group > legend {
    padding-inline: var(--basic-space-2);
    font-weight: 700;
  }

  .basic-form-technique-group > p,
  .basic-form-technique-note {
    margin: 0;
    color: var(--basic-color-text-muted);
  }

  .basic-form-technique-choice-list {
    display: grid;
    gap: var(--basic-space-3);
  }

  .basic-form-technique-inline-note {
    font-size: 0.925rem;
  }
</style>

<div class="basic-form-technique">
  ${innerMarkup}
</div>`;
}

const checklistPanelsMarkup = `<form class="basic-form-technique-stack">
  <fieldset class="basic-form-technique-group">
    <legend>Attendance days</legend>
    <p>Add <code>data-panel</code> to the native checkbox and keep it as the first child inside the label.</p>

    <div class="basic-form-technique-choice-list">
      <label>
        <input type="checkbox" name="days" value="day-1" data-panel checked />
        <span>
          <strong>Day 1: Product systems</strong>
          <span>Keynotes, leadership sessions, and case studies.</span>
        </span>
      </label>

      <label>
        <input type="checkbox" name="days" value="day-2" data-panel />
        <span>
          <strong>Day 2: Frontend craft</strong>
          <span>Accessibility, performance, and design system sessions.</span>
        </span>
      </label>

      <label>
        <input type="checkbox" name="days" value="day-3" data-panel disabled />
        <span>
          <strong>Day 3: Leadership lab</strong>
          <span>Sold out in this example so the disabled state stays visible in docs.</span>
        </span>
      </label>
    </div>
  </fieldset>
</form>`;

const checklistPanelsSource = withFrame(checklistPanelsMarkup);

const confirmationPanelMarkup = `<form class="basic-form-technique-stack">
  <label>
    <input type="checkbox" name="consent" data-panel checked />
    <span>
      <strong>I confirm the attendee details and accept the registration terms.</strong>
      <span>Use the same pattern for a single confirmation step at the end of a flow.</span>
    </span>
  </label>

  <p class="basic-form-technique-note basic-form-technique-inline-note">
    The behavior stays native: keyboard interaction, form submission, and checked state are still owned by the browser.
  </p>
</form>`;

const confirmationPanelSource = withFrame(confirmationPanelMarkup);

const radioPanelsMarkup = `<form class="basic-form-technique-stack">
  <fieldset class="basic-form-technique-group">
    <legend>Workshop track</legend>
    <p>Add <code>data-panel</code> to native radios when the group should read like a single-select panel list.</p>

    <div class="basic-form-technique-choice-list">
      <label>
        <input type="radio" name="track" value="design-systems" data-panel checked />
        <span>
          <strong>Design systems clinic</strong>
          <span>Governance, migration sequencing, and rollout rituals for shared UI foundations.</span>
        </span>
      </label>

      <label>
        <input type="radio" name="track" value="performance" data-panel />
        <span>
          <strong>Platform performance</strong>
          <span>Profiling, budgets, and production feedback loops for web platform teams.</span>
        </span>
      </label>

      <label>
        <input type="radio" name="track" value="leadership" data-panel disabled />
        <span>
          <strong>Leadership operating model</strong>
          <span>This session is full in the example so the disabled state stays visible in docs.</span>
        </span>
      </label>
    </div>
  </fieldset>

  <p class="basic-form-technique-note basic-form-technique-inline-note">
    Radios stay native here too: one option remains selected, the shared <code>name</code> keeps the group linked, and browser keyboard behavior still applies.
  </p>
</form>`;

const radioPanelsSource = withFrame(radioPanelsMarkup);

const meta = {
    title: "Native Elements/Forms",
    tags: ["!autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
Use \`data-panel\` when a native checkbox or radio should read like a selectable panel instead of a plain inline control.

Markup contract:

- import \`@lmfaole/basics/basic-styling/forms.css\`, \`global.css\`, or the full \`basic-styling\` entry point
- put \`data-panel\` on a native \`<input type="checkbox">\` or \`<input type="radio">\`
- keep the control as a direct child of the \`<label>\`
- place the visible body copy after the input in a sibling \`<span>\` or \`<div>\`
- keep using native \`<fieldset>\` and \`<legend>\` for grouped choices
- keep shared \`name\` values on radio groups so the browser preserves single-select behavior
                `,
            },
            source: {
                language: "html",
            },
        },
    },
};

export default meta;

export const CheckboxPanels = {
    render: () => checklistPanelsSource,
    parameters: {
        docs: {
            source: {
                code: checklistPanelsMarkup,
            },
            description: {
                story: "Recommended grouped markup for rich checkbox choices: the input stays native, while the surrounding label picks up the panel styling.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await waitFor(() => {
            const selectedCheckbox = canvas.getByRole("checkbox", { name: /Day 1: Product systems/i });
            const unselectedCheckbox = canvas.getByRole("checkbox", { name: /Day 2: Frontend craft/i });
            const disabledCheckbox = canvas.getByRole("checkbox", { name: /Day 3: Leadership lab/i });
            const selectedLabel = selectedCheckbox.closest("label");
            const unselectedLabel = unselectedCheckbox.closest("label");

            expect(selectedCheckbox).toHaveAttribute("data-panel");
            expect(selectedCheckbox).toBeChecked();
            expect(disabledCheckbox).toBeDisabled();
            expect(selectedLabel).not.toBeNull();
            expect(unselectedLabel).not.toBeNull();
            expect(getComputedStyle(selectedLabel).display).toBe("grid");
            expect(getComputedStyle(selectedLabel).backgroundColor).not.toBe(getComputedStyle(unselectedLabel).backgroundColor);
        });
    },
};

export const RadioPanels = {
    render: () => radioPanelsSource,
    parameters: {
        docs: {
            source: {
                code: radioPanelsMarkup,
            },
            description: {
                story: "Use the same panel treatment for single-select radio groups while preserving native checked state and browser keyboard behavior.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const selectedRadio = canvas.getByRole("radio", { name: /Design systems clinic/i });
        const unselectedRadio = canvas.getByRole("radio", { name: /Platform performance/i });
        const disabledRadio = canvas.getByRole("radio", { name: /Leadership operating model/i });
        const selectedLabel = selectedRadio.closest("label");
        const unselectedLabel = unselectedRadio.closest("label");

        await waitFor(() => {
            expect(selectedRadio).toHaveAttribute("data-panel");
            expect(selectedRadio).toBeChecked();
            expect(disabledRadio).toBeDisabled();
            expect(selectedLabel).not.toBeNull();
            expect(unselectedLabel).not.toBeNull();
            expect(getComputedStyle(selectedLabel).display).toBe("grid");
            expect(getComputedStyle(selectedLabel).backgroundColor).not.toBe(getComputedStyle(unselectedLabel).backgroundColor);
        });

        await userEvent.click(unselectedRadio);

        await waitFor(() => {
            expect(unselectedRadio).toBeChecked();
            expect(selectedRadio).not.toBeChecked();
            expect(getComputedStyle(unselectedLabel).backgroundColor).not.toBe(getComputedStyle(selectedLabel).backgroundColor);
        });
    },
};

export const SingleConfirmation = {
    render: () => confirmationPanelSource,
    parameters: {
        docs: {
            source: {
                code: confirmationPanelMarkup,
            },
            description: {
                story: "The same pattern also works for one-off confirmation checkboxes, such as terms acceptance or final acknowledgements.",
            },
        },
    },
};
