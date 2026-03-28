export const ALERT_TAG_NAME: "basic-alert";

/**
 * Normalizes unsupported or empty labels back to the default `"Alert"`.
 */
export function normalizeAlertLabel(
    value?: string | null,
): string;

/**
 * Normalizes unsupported live-region values back to `"assertive"`.
 */
export function normalizeAlertLive(
    value?: string | null,
): "assertive" | "polite";

/**
 * Maps an alert live setting to the matching ARIA role.
 */
export function getAlertRoleForLive(
    value?: string | null,
): "alert" | "status";

/**
 * Normalizes the optional `data-open` attribute into a boolean flag, using the
 * current `hidden` state as a fallback.
 */
export function normalizeAlertOpen(
    value?: string | null,
    hidden?: boolean,
): boolean;

/**
 * Custom element that upgrades inline content into a dismissible live-region
 * alert.
 *
 * Attributes:
 * - `data-label`: fallback accessible name when the alert has no title
 * - `data-live`: chooses between `alert` and `status` semantics
 * - `data-open`: optional managed visibility flag
 */
export class AlertElement extends HTMLElement {
    static observedAttributes: string[];
    show(): boolean;
    hide(): boolean;
}

/**
 * Registers the `basic-alert` custom element if it is not already defined.
 */
export function defineAlert(
    registry?: CustomElementRegistry,
): typeof AlertElement;
