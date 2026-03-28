export const DIALOG_TAG_NAME: "basic-dialog";

/**
 * Normalizes the root `data-backdrop-close` attribute into a boolean flag.
 */
export function normalizeDialogBackdropClose(
    value?: string | null,
): boolean;

/**
 * Normalizes unsupported or empty labels back to the default `"Dialog"`.
 */
export function normalizeDialogLabel(
    value?: string | null,
): string;

/**
 * Custom element that upgrades native `<dialog>` markup into a modal dialog
 * flow with open and close triggers.
 *
 * Attributes:
 * - `data-label`: fallback accessible name when the dialog has no title
 * - `data-backdrop-close`: allows clicks on the dialog backdrop to close it
 */
export class DialogElement extends HTMLElement {
    static observedAttributes: string[];
    showModal(opener?: HTMLElement | null): boolean;
    close(returnValue?: string): boolean;
}

/**
 * Registers the `basic-dialog` custom element if it is not already defined.
 */
export function defineDialog(
    registry?: CustomElementRegistry,
): typeof DialogElement;
