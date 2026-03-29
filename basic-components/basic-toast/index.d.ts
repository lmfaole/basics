export const TOAST_TAG_NAME: "basic-toast";

/**
 * Normalizes unsupported or empty labels back to the default `"Toast"`.
 */
export function normalizeToastLabel(
    value?: string | null,
): string;

/**
 * Normalizes unsupported live-region values back to `"polite"`.
 */
export function normalizeToastLive(
    value?: string | null,
): "assertive" | "polite";

/**
 * Maps a toast live setting to the matching ARIA role.
 */
export function getToastRoleForLive(
    value?: string | null,
): "alert" | "status";

/**
 * Normalizes the optional `data-duration` attribute into milliseconds.
 * A value of `0` disables auto-dismiss.
 */
export function normalizeToastDuration(
    value?: string | null,
): number;

/**
 * Normalizes the optional `data-open` attribute into a boolean flag.
 */
export function normalizeToastOpen(
    value?: string | null,
): boolean;

/**
 * Custom element that upgrades trigger-and-panel markup into a toast
 * notification flow with optional auto-dismiss.
 *
 * Attributes:
 * - `data-label`: fallback accessible name when the toast has no title
 * - `data-live`: chooses between `status` and `alert` semantics
 * - `data-duration`: auto-dismiss timeout in milliseconds, `0` disables it
 * - `data-open`: optional initial open state
 *
 * Behavior:
 * - uses the Popover API in manual mode when available so the toast panel can
 *   render in the top layer
 * - announces the current toast text through an internal live region whenever
 *   the toast opens
 * - expects `[data-toast-panel]` to contain non-interactive message content
 */
export class ToastElement extends HTMLElement {
    static observedAttributes: string[];
    show(opener?: HTMLElement | null): boolean;
    hide(): boolean;
    toggle(opener?: HTMLElement | null): boolean;
}

/**
 * Registers the `basic-toast` custom element if it is not already defined.
 */
export function defineToast(
    registry?: CustomElementRegistry,
): typeof ToastElement;
