const HTMLElementBase = globalThis.HTMLElement ?? class {};

export const CAROUSEL_TAG_NAME = "basic-carousel";

const DEFAULT_LABEL = "Carousel";
const DEFAULT_CONTROLS = "both";
const DEFAULT_SNAPPING = "center";
const TRACK_SELECTOR = "[data-carousel-track]";
const MANAGED_LABEL_ATTRIBUTE = "data-basic-carousel-managed-label";
const MANAGED_READY_ATTRIBUTE = "data-basic-carousel-ready";

let nextCarouselInstanceId = 1;

function collectOwnedElements(root, scope, selector) {
    return Array.from(scope.querySelectorAll(selector)).filter(
        (element) => element instanceof HTMLElementBase && element.closest(CAROUSEL_TAG_NAME) === root,
    );
}

function collectCarouselItems(track) {
    return Array.from(track.children).filter(
        (element) => element instanceof HTMLElementBase,
    );
}

function normalizeMarkerLabel(value, index, total) {
    const normalized = value?.trim();

    if (normalized) {
        return normalized;
    }

    return `Go to slide ${index} of ${total}`;
}

export function normalizeCarouselLabel(value) {
    return value?.trim() || DEFAULT_LABEL;
}

export function normalizeCarouselControls(value) {
    const normalized = value?.trim().toLowerCase();

    if (normalized === "none") {
        return "none";
    }

    if (
        normalized === "markers"
        || normalized === "numbers"
        || normalized === "number-buttons"
    ) {
        return "markers";
    }

    if (normalized === "arrows") {
        return "arrows";
    }

    return DEFAULT_CONTROLS;
}

export function normalizeCarouselScrollBehavior(value) {
    const normalized = value?.trim().toLowerCase();

    return normalized === "smooth" ? "smooth" : "auto";
}

export function normalizeCarouselSnapping(value) {
    const normalized = value?.trim().toLowerCase();

    if (normalized === "start" || normalized === "end") {
        return normalized;
    }

    return DEFAULT_SNAPPING;
}

export function clampCarouselIndex(index, itemCount) {
    if (!Number.isInteger(index) || itemCount <= 0) {
        return -1;
    }

    return Math.min(Math.max(index, 0), itemCount - 1);
}

function clampScrollOffset(offset, maxOffset) {
    return Math.min(Math.max(offset, 0), Math.max(maxOffset, 0));
}

function getItemInlineMetrics(track, item) {
    const trackRect = track.getBoundingClientRect?.();
    const itemRect = item.getBoundingClientRect?.();

    if (trackRect?.width > 0 && itemRect?.width > 0) {
        const start = itemRect.left - trackRect.left + track.scrollLeft;

        return {
            start,
            width: itemRect.width,
        };
    }

    return {
        start: item.offsetLeft || 0,
        width: item.offsetWidth || track.clientWidth || 0,
    };
}

function getTrackViewportWidth(track) {
    return track.clientWidth || track.getBoundingClientRect?.().width || 0;
}

function getScrollOffsetForItem(track, item, snapping) {
    const viewportWidth = getTrackViewportWidth(track);
    const { start, width } = getItemInlineMetrics(track, item);

    if (snapping === "end") {
        return start - (viewportWidth - width);
    }

    if (snapping === "center") {
        return start - ((viewportWidth - width) / 2);
    }

    return start;
}

export class CarouselElement extends HTMLElementBase {
    static observedAttributes = ["data-controls", "data-label", "data-snapping"];

    #instanceId = `${CAROUSEL_TAG_NAME}-${nextCarouselInstanceId++}`;
    #track = null;
    #items = [];

    connectedCallback() {
        this.refresh();
    }

    attributeChangedCallback() {
        this.#applyState();
    }

    get track() {
        return this.#track;
    }

    get items() {
        return [...this.#items];
    }

    refresh() {
        this.#track = collectOwnedElements(this, this, TRACK_SELECTOR)[0] ?? null;
        this.#items = this.#track ? collectCarouselItems(this.#track) : [];
        this.#applyState();
        return this.#items.length;
    }

    scrollToItem(index, options = {}) {
        const nextIndex = clampCarouselIndex(index, this.#items.length);
        const item = nextIndex === -1 ? null : this.#items[nextIndex];
        const track = this.#track;

        if (!(item instanceof HTMLElementBase) || !(track instanceof HTMLElementBase)) {
            return false;
        }

        const behavior = normalizeCarouselScrollBehavior(options.behavior);
        const snapping = normalizeCarouselSnapping(options.snapping ?? this.getAttribute("data-snapping"));
        const viewportWidth = getTrackViewportWidth(track);
        const maxOffset = Math.max(track.scrollWidth - viewportWidth, 0);
        const left = clampScrollOffset(getScrollOffsetForItem(track, item, snapping), maxOffset);

        if (typeof track.scrollTo === "function") {
            track.scrollTo({
                left,
                behavior,
            });
        } else {
            track.scrollLeft = left;
        }

        return true;
    }

    #applyState() {
        const baseId = this.id || this.#instanceId;
        const controls = normalizeCarouselControls(this.getAttribute("data-controls"));
        const snapping = normalizeCarouselSnapping(this.getAttribute("data-snapping"));

        if (this.#track instanceof HTMLElementBase && !this.#track.id) {
            this.#track.id = `${baseId}-track`;
        }

        this.dataset.basicCarouselControls = controls;
        this.dataset.basicCarouselSnapping = snapping;
        this.toggleAttribute(MANAGED_READY_ATTRIBUTE, this.#track instanceof HTMLElementBase && this.#items.length > 0);
        this.setAttribute("role", "region");
        this.#syncAccessibleLabel();

        const total = this.#items.length;

        for (const [index, item] of this.#items.entries()) {
            item.dataset.basicCarouselMarker = String(index + 1);
            item.dataset.basicCarouselMarkerLabel = normalizeMarkerLabel(
                item.getAttribute("data-carousel-marker-label"),
                index + 1,
                total,
            );

            if (!item.id) {
                item.id = `${baseId}-item-${index + 1}`;
            }
        }
    }

    #syncAccessibleLabel() {
        const nextLabel = normalizeCarouselLabel(this.getAttribute("data-label"));
        const hasManagedLabel = this.hasAttribute(MANAGED_LABEL_ATTRIBUTE);

        if (hasManagedLabel && this.getAttribute("aria-label") !== nextLabel) {
            this.removeAttribute("aria-label");
            this.removeAttribute(MANAGED_LABEL_ATTRIBUTE);
        }

        if (this.hasAttribute("aria-labelledby")) {
            if (hasManagedLabel) {
                this.removeAttribute("aria-label");
                this.removeAttribute(MANAGED_LABEL_ATTRIBUTE);
            }

            return;
        }

        const hasOwnAriaLabel = this.hasAttribute("aria-label") && !hasManagedLabel;

        if (hasOwnAriaLabel) {
            return;
        }

        this.setAttribute("aria-label", nextLabel);
        this.setAttribute(MANAGED_LABEL_ATTRIBUTE, "");
    }
}

export function defineCarousel(registry = globalThis.customElements) {
    if (!registry?.get || !registry?.define) {
        return CarouselElement;
    }

    if (!registry.get(CAROUSEL_TAG_NAME)) {
        registry.define(CAROUSEL_TAG_NAME, CarouselElement);
    }

    return CarouselElement;
}
