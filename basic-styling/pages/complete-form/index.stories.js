import "../../../basic-components/basic-summary-table/register.js";
import { expect, userEvent, waitFor, within } from "storybook/test";

const completeFormSource = String.raw`<style>
  .registration-page {
    --page-max-width: 70rem;
    --page-padding: clamp(1rem, 2vw, 2rem);
    --page-divider: color-mix(in oklch, var(--basic-color-border) 80%, transparent);
    padding: var(--page-padding);
    background:
      linear-gradient(180deg, color-mix(in oklch, var(--basic-color-surface-selected) 28%, transparent), transparent 16rem),
      linear-gradient(180deg, var(--basic-color-background), color-mix(in oklch, var(--basic-color-background) 92%, var(--basic-color-surface)));
  }

  .registration-page__header,
  .registration-page__sheet {
    max-width: var(--page-max-width);
    margin-inline: auto;
  }

  .registration-page__header {
    padding-block: 0.5rem 1rem;
  }

  .registration-page__eyebrow {
    margin: 0 0 0.75rem;
    color: var(--basic-color-text-muted);
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .registration-page__header h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 0.98;
    max-width: 10ch;
  }

  .registration-page__header p {
    max-width: 42rem;
    margin: 1rem 0 0;
    color: var(--basic-color-text-muted);
    font-size: 1.05rem;
  }

  .registration-page__sheet {
    border: var(--basic-border-width) solid var(--basic-color-border);
    background: color-mix(in oklch, var(--basic-color-surface) 94%, white 6%);
  }

  .registration-page form {
    display: grid;
  }

  .registration-page__steps {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0;
    border-top: var(--basic-border-width) solid var(--page-divider);
    border-bottom: var(--basic-border-width) solid var(--page-divider);
  }

  .registration-page__step {
    display: grid;
    gap: 0.2rem;
    justify-items: start;
    padding: 1rem 1.5rem;
    border: 0;
    border-inline-end: var(--basic-border-width) solid var(--page-divider);
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .registration-page__step:last-child {
    border-inline-end: 0;
  }

  .registration-page__step-index {
    color: var(--basic-color-text-muted);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .registration-page__step-label {
    font-weight: 600;
  }

  .registration-page__step[aria-current="step"] {
    background: color-mix(in oklch, var(--basic-color-surface-selected) 55%, var(--basic-color-surface));
  }

  .registration-page__step[data-state="complete"] .registration-page__step-index {
    color: inherit;
  }

  .registration-page__progress {
    margin: 0;
    padding: 1rem 1.5rem 0;
    color: var(--basic-color-text-muted);
    font-size: 0.925rem;
  }

  .registration-page__panel {
    padding: 1.5rem;
  }

  .registration-page__panel[hidden] {
    display: none !important;
  }

  .registration-page__section-heading {
    display: grid;
    grid-template-columns: minmax(0, 16rem) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
    margin-bottom: 1.5rem;
  }

  .registration-page__section-heading h2 {
    margin: 0;
    font-size: 1rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .registration-page__section-heading p,
  .registration-page__hint,
  .registration-page__muted,
  .registration-page__footer-note {
    margin: 0;
    color: var(--basic-color-text-muted);
  }

  .registration-page__fields,
  .registration-page__split {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 1.25rem;
  }

  .registration-page__stack {
    display: grid;
    gap: 0.45rem;
  }

  .registration-page__stack--full,
  .registration-page__summary {
    grid-column: 1 / -1;
  }

  .registration-page label,
  .registration-page legend {
    font-weight: 600;
  }

  .registration-page input,
  .registration-page select,
  .registration-page textarea {
    width: 100%;
    padding: 0.8rem 0.9rem;
    border: var(--basic-border-width) solid var(--basic-color-border);
    background: var(--basic-color-surface);
    color: inherit;
  }

  .registration-page textarea {
    min-height: 8rem;
    resize: vertical;
  }

  .registration-page fieldset {
    margin: 0;
    padding: 0;
    border: 0;
    min-inline-size: 0;
  }

  .registration-page__choice-list {
    display: grid;
    gap: 0.75rem;
  }

  .registration-page__summary {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(16rem, 0.8fr);
    gap: 1.5rem;
    align-items: start;
  }

  .registration-page__summary-note {
    padding-top: 0.25rem;
  }

  .registration-page__deadline-list {
    display: grid;
    gap: 0.9rem;
    margin-top: 1rem;
  }

  .registration-page__deadline {
    padding-top: 0.9rem;
    border-top: var(--basic-border-width) solid var(--page-divider);
  }

  .registration-page__deadline strong {
    display: block;
    margin-bottom: 0.15rem;
  }

  .registration-page__deadline p {
    margin: 0;
    color: var(--basic-color-text-muted);
  }

  .registration-page__panel-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .registration-page__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.8rem 1.15rem;
    border: var(--basic-border-width) solid var(--basic-color-border);
    border-radius: 999px;
    background: transparent;
    color: inherit;
    font-weight: 600;
    text-decoration: none;
  }

  .registration-page__button--primary {
    border-color: var(--basic-color-border-selected);
    background: var(--basic-color-surface-selected);
  }

  .registration-page__footer-note {
    margin-top: 0.9rem;
    font-size: 0.925rem;
  }

  @media (max-width: 780px) {
    .registration-page__steps,
    .registration-page__section-heading,
    .registration-page__fields,
    .registration-page__split,
    .registration-page__summary {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="registration-page">
  <header class="registration-page__header">
    <p class="registration-page__eyebrow">Pages</p>
    <h1 id="registration-page-title">Conference registration</h1>
    <p>Multi-step form example built from native controls, checkbox panels, and a summary table in the final step. The layout stays flat: one sheet, section dividers, and no sidebar stack.</p>
  </header>

  <div class="registration-page__sheet">
    <nav class="registration-page__steps" aria-label="Registration steps">
      <button type="button" class="registration-page__step" data-step-target="0" aria-controls="registration-step-attendee">
        <span class="registration-page__step-index">Step 1</span>
        <span class="registration-page__step-label">Attendee</span>
      </button>
      <button type="button" class="registration-page__step" data-step-target="1" aria-controls="registration-step-attendance">
        <span class="registration-page__step-index">Step 2</span>
        <span class="registration-page__step-label">Attendance</span>
      </button>
      <button type="button" class="registration-page__step" data-step-target="2" aria-controls="registration-step-billing">
        <span class="registration-page__step-index">Step 3</span>
        <span class="registration-page__step-label">Billing</span>
      </button>
      <button type="button" class="registration-page__step" data-step-target="3" aria-controls="registration-step-review">
        <span class="registration-page__step-index">Step 4</span>
        <span class="registration-page__step-label">Review and submit</span>
      </button>
    </nav>

    <form aria-labelledby="registration-page-title">
      <p class="registration-page__progress" data-step-progress>Step 1 of 4</p>

      <section
        id="registration-step-attendee"
        class="registration-page__panel"
        data-step-panel="0"
        aria-labelledby="attendee-heading"
      >
        <div class="registration-page__section-heading">
          <h2 id="attendee-heading">Attendee details</h2>
          <p>Capture the primary contact and a few operational details so the event team can confirm the booking without chasing down missing information.</p>
        </div>

        <div class="registration-page__fields">
          <div class="registration-page__stack">
            <label for="full-name">Full name</label>
            <input id="full-name" name="full-name" type="text" autocomplete="name" value="Alex Morgan" />
          </div>

          <div class="registration-page__stack">
            <label for="work-email">Work email</label>
            <input id="work-email" name="work-email" type="email" autocomplete="email" value="alex@northshore.dev" />
          </div>

          <div class="registration-page__stack">
            <label for="company">Company</label>
            <input id="company" name="company" type="text" autocomplete="organization" value="Northshore Labs" />
          </div>

          <div class="registration-page__stack">
            <label for="role">Role</label>
            <select id="role" name="role">
              <option>Engineering manager</option>
              <option>Staff engineer</option>
              <option>Designer</option>
              <option>Product manager</option>
            </select>
          </div>
        </div>

        <div class="registration-page__panel-footer">
          <button class="registration-page__button" type="button">Save draft</button>
          <button class="registration-page__button registration-page__button--primary" type="button" data-step-direction="next">Next: Attendance</button>
        </div>
      </section>

      <section
        id="registration-step-attendance"
        class="registration-page__panel"
        data-step-panel="1"
        aria-labelledby="attendance-heading"
        hidden
      >
        <div class="registration-page__section-heading">
          <h2 id="attendance-heading">Attendance</h2>
          <p>Keep the choice patterns simple: one checklist for days, one radio group for the workshop, and a plain notes field for access or dietary constraints.</p>
        </div>

        <div class="registration-page__split">
          <fieldset>
            <legend>Attendance days</legend>
            <div class="registration-page__choice-list">
              <label>
                <input type="checkbox" name="days" data-panel checked />
                <span>
                  <strong>Day 1: Product systems</strong>
                  <span>Keynotes, leadership sessions, and case studies.</span>
                </span>
              </label>

              <label>
                <input type="checkbox" name="days" data-panel checked />
                <span>
                  <strong>Day 2: Frontend craft</strong>
                  <span>Accessibility, performance, and design system sessions.</span>
                </span>
              </label>

              <label>
                <input type="checkbox" name="days" data-panel />
                <span>
                  <strong>Day 3: Leadership lab</strong>
                  <span>Facilitated workshops for leads and staff engineers.</span>
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Workshop track</legend>
            <div class="registration-page__choice-list">
              <label>
                <input type="radio" name="track" checked />
                <span>
                  <strong>Design systems clinic</strong>
                  <span>Governance, migration plans, and rollout rituals.</span>
                </span>
              </label>

              <label>
                <input type="radio" name="track" />
                <span>
                  <strong>Platform performance</strong>
                  <span>Profiling, budgets, and production feedback loops.</span>
                </span>
              </label>
            </div>
          </fieldset>

          <div class="registration-page__stack registration-page__stack--full">
            <label for="access-needs">Accessibility or dietary notes</label>
            <textarea id="access-needs" name="access-needs">Please reserve a quiet workspace for focus sessions and provide vegetarian lunches.</textarea>
            <p class="registration-page__hint">Use this field for mobility access, captioning, dietary needs, or scheduling constraints.</p>
          </div>
        </div>

        <div class="registration-page__panel-footer">
          <button class="registration-page__button" type="button" data-step-direction="back">Back</button>
          <button class="registration-page__button registration-page__button--primary" type="button" data-step-direction="next">Next: Billing</button>
        </div>
      </section>

      <section
        id="registration-step-billing"
        class="registration-page__panel"
        data-step-panel="2"
        aria-labelledby="billing-heading"
        hidden
      >
        <div class="registration-page__section-heading">
          <h2 id="billing-heading">Billing</h2>
          <p>Finish with the invoice details and a clear confirmation step. No extra chrome, just the fields that matter and one final summary.</p>
        </div>

        <div class="registration-page__fields">
          <div class="registration-page__stack">
            <label for="invoice-email">Invoice email</label>
            <input id="invoice-email" name="invoice-email" type="email" value="finance@northshore.dev" />
          </div>

          <div class="registration-page__stack">
            <label for="po-number">Purchase order</label>
            <input id="po-number" name="po-number" type="text" value="PO-2048" />
          </div>

          <div class="registration-page__stack">
            <label for="country">Billing country</label>
            <select id="country" name="country">
              <option>Norway</option>
              <option>Sweden</option>
              <option>Denmark</option>
              <option>Germany</option>
            </select>
          </div>

          <div class="registration-page__stack">
            <label for="vat-id">VAT / Org number</label>
            <input id="vat-id" name="vat-id" type="text" value="NO 999 888 777" />
          </div>
        </div>

        <div class="registration-page__panel-footer">
          <button class="registration-page__button" type="button" data-step-direction="back">Back</button>
          <button class="registration-page__button registration-page__button--primary" type="button" data-step-direction="next">Next: Review</button>
        </div>
      </section>

      <section
        id="registration-step-review"
        class="registration-page__panel"
        data-step-panel="3"
        aria-labelledby="summary-heading"
        hidden
      >
        <div class="registration-page__section-heading">
          <h2 id="summary-heading">Summary</h2>
          <p>Review the selected options, check the final total, and confirm the submission. The summary stays in-flow as the last step instead of floating next to the form.</p>
        </div>

        <div class="registration-page__summary">
          <basic-summary-table data-caption="Estimated total" data-row-headers data-summary-columns="2,4" data-total-label="Total" data-locale="en-US" data-zebra data-separators="rows">
            <table>
              <thead>
                <tr>
                  <th>Line item</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Conference pass</td>
                  <td>1</td>
                  <td>$890.00</td>
                  <td>$890.00</td>
                </tr>
                <tr>
                  <td>Workshop track</td>
                  <td>1</td>
                  <td>$240.00</td>
                  <td>$240.00</td>
                </tr>
                <tr>
                  <td>Team dinner</td>
                  <td>2</td>
                  <td>$45.00</td>
                  <td>$90.00</td>
                </tr>
              </tbody>
            </table>
          </basic-summary-table>

          <div class="registration-page__summary-note">
            <p class="registration-page__muted">Important deadlines</p>
            <div class="registration-page__deadline-list">
              <div class="registration-page__deadline">
                <strong>May 16</strong>
                <p>Workshop track changes close.</p>
              </div>
              <div class="registration-page__deadline">
                <strong>May 21</strong>
                <p>Accessibility and dietary notes lock for catering.</p>
              </div>
              <div class="registration-page__deadline">
                <strong>May 24</strong>
                <p>Invoices are issued and seat confirmations are sent.</p>
              </div>
            </div>
          </div>
        </div>

        <fieldset style="margin-top: 1.5rem;">
          <legend>Confirmation</legend>
          <div class="registration-page__choice-list">
            <label>
              <input type="checkbox" name="consent" data-panel checked />
              <span>
                <strong>I confirm the attendee details and accept the registration terms.</strong>
                <span>Confirmation emails and invoice receipts will be sent to the addresses above.</span>
              </span>
            </label>
          </div>
        </fieldset>

        <div class="registration-page__panel-footer">
          <button class="registration-page__button" type="button" data-step-direction="back">Back</button>
          <button class="registration-page__button registration-page__button--primary" type="submit">Submit registration</button>
        </div>

        <p class="registration-page__footer-note">Submissions are reviewed within one business day. Workshop seats are reserved once the confirmation email is sent.</p>
      </section>
    </form>
  </div>
</div>`;

function clampStepIndex(index, stepCount) {
    return Math.max(0, Math.min(index, stepCount - 1));
}

function getStepFocusTarget(panel) {
    return panel.querySelector("input, select, textarea, button");
}

function initializeMultiStepForm(root) {
    const panels = Array.from(root.querySelectorAll("[data-step-panel]"));
    const stepButtons = Array.from(root.querySelectorAll("[data-step-target]"));
    const progress = root.querySelector("[data-step-progress]");
    const form = root.querySelector("form");
    let currentStepIndex = 0;

    function syncSteps(nextStepIndex, { focusPanel = false } = {}) {
        currentStepIndex = clampStepIndex(nextStepIndex, panels.length);

        for (const [index, panel] of panels.entries()) {
            const isCurrent = index === currentStepIndex;
            panel.hidden = !isCurrent;
        }

        for (const [index, button] of stepButtons.entries()) {
            const isCurrent = index === currentStepIndex;
            button.setAttribute("aria-current", isCurrent ? "step" : "false");
            button.dataset.state = index < currentStepIndex
                ? "complete"
                : isCurrent
                    ? "current"
                    : "upcoming";
        }

        if (progress) {
            progress.textContent = `Step ${currentStepIndex + 1} of ${panels.length}`;
        }

        if (focusPanel) {
            getStepFocusTarget(panels[currentStepIndex])?.focus();
        }
    }

    for (const button of stepButtons) {
        button.addEventListener("click", () => {
            const targetIndex = Number.parseInt(button.dataset.stepTarget ?? "0", 10);
            syncSteps(targetIndex, { focusPanel: true });
        });
    }

    root.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const navigationButton = event.target.closest("[data-step-direction]");

        if (!(navigationButton instanceof HTMLButtonElement)) {
            return;
        }

        event.preventDefault();

        syncSteps(
            currentStepIndex + (navigationButton.dataset.stepDirection === "back" ? -1 : 1),
            { focusPanel: true },
        );
    });

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
    });

    syncSteps(0);
}

function renderCompleteForm() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = completeFormSource;
    initializeMultiStepForm(wrapper);
    return wrapper;
}

export default {
    title: "Pages/Complete Form",
    tags: ["!autodocs"],
    globals: {
        starterTheme: "light",
    },
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: "Full-page example showing how the starter tokens and table components can be composed into a multi-step registration form with one sheet, explicit step navigation, and a final in-flow review step.",
            },
            source: {
                code: completeFormSource,
                language: "html",
            },
        },
    },
    render: renderCompleteForm,
};

export const CompleteForm = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const stepOnePanel = canvasElement.querySelector("[data-step-panel='0']");
        const stepTwoPanel = canvasElement.querySelector("[data-step-panel='1']");
        const stepFourPanel = canvasElement.querySelector("[data-step-panel='3']");

        await waitFor(() => {
            expect(canvas.getByRole("heading", { level: 1, name: "Conference registration" })).toBeInTheDocument();
            expect(canvas.getByRole("form", { name: "Conference registration" })).toBeInTheDocument();
            expect(stepOnePanel).not.toHaveAttribute("hidden");
            expect(stepTwoPanel).toHaveAttribute("hidden");
            expect(canvas.getByText("Step 1 of 4")).toBeInTheDocument();
        });

        await userEvent.click(canvas.getByRole("button", { name: "Next: Attendance" }));

        await waitFor(() => {
            expect(stepOnePanel).toHaveAttribute("hidden");
            expect(stepTwoPanel).not.toHaveAttribute("hidden");
            expect(canvas.getByText("Step 2 of 4")).toBeInTheDocument();
            const selectedDayCheckbox = canvas.getByRole("checkbox", { name: /Day 1: Product systems/i });
            const unselectedDayCheckbox = canvas.getByRole("checkbox", { name: /Day 3: Leadership lab/i });
            const selectedDayStyles = getComputedStyle(selectedDayCheckbox.closest("label"));
            const unselectedDayStyles = getComputedStyle(unselectedDayCheckbox.closest("label"));

            expect(selectedDayCheckbox).toHaveAttribute("data-panel");
            expect(selectedDayStyles.display).toBe("grid");
            expect(selectedDayStyles.backgroundColor).not.toBe(unselectedDayStyles.backgroundColor);
        });

        await userEvent.click(canvas.getByRole("button", { name: /Review and submit/i }));

        await waitFor(() => {
            expect(stepFourPanel).not.toHaveAttribute("hidden");
            expect(canvas.getByRole("table", { name: "Estimated total" })).toBeInTheDocument();
            expect(canvas.getByRole("button", { name: "Submit registration" })).toBeInTheDocument();
        });
    },
};
