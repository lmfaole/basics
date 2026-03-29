import "./register.js";
import { expect, waitFor } from "storybook/test";

/**
 * @typedef {object} CarouselStoryArgs
 * @property {string} label Accessible label applied to the carousel region.
 * @property {"both" | "markers" | "arrows" | "none"} controls Generated native controls to show where supported.
 * @property {"start" | "center" | "end"} snapping Where each slide should snap within the scrollport.
 */

/**
 * @param {CarouselStoryArgs} args
 */
function createStory({ label, controls, snapping }) {
    const frame = document.createElement("div");
    const carousel = document.createElement("basic-carousel");
    carousel.dataset.label = label;
    carousel.dataset.controls = controls;
    carousel.dataset.snapping = snapping;

    frame.style.maxInlineSize = "30rem";
    frame.style.margin = "0 auto";
    frame.style.padding = "var(--basic-space-5, 1.5rem)";

    const track = document.createElement("div");
    track.dataset.carouselTrack = "";

    const slides = [
        {
            eyebrow: "Feature",
            title: "Launch Week",
            body: "Three product updates shipping across the design system with rollout notes for product teams.",
            action: "Read update",
        },
        {
            eyebrow: "Accessibility",
            title: "Audits in Progress",
            body: "Keyboard, contrast, and announcement fixes queued for the next documentation sprint.",
            action: "Review checklist",
            markerLabel: "Go to the accessibility slide",
        },
        {
            eyebrow: "Release Ops",
            title: "Change Freeze Window",
            body: "A Friday deployment hold and rollback owner list are now published for the April migration.",
            action: "View runbook",
        },
        {
            eyebrow: "Research",
            title: "Signup Funnel Feedback",
            body: "Eight moderated sessions surfaced confusion around plan limits, pricing language, and account handoff.",
            action: "Read synthesis",
        },
        {
            eyebrow: "Tokens",
            title: "Interaction Surfaces",
            body: "Shared hover, active, and selected surfaces now derive from one starter interaction layer.",
            action: "Open tokens",
        },
        {
            eyebrow: "Docs",
            title: "Migration Guides Updated",
            body: "Upgrade notes for dialog, toast, and summary table consumers now include copy-paste examples and QA checklists.",
            action: "Browse guides",
        },
        {
            eyebrow: "Performance",
            title: "Bundle Audit Review",
            body: "A new audit flags duplicate helper code across package entry points and highlights the next trim targets.",
            action: "Inspect report",
        },
        {
            eyebrow: "Security",
            title: "Permission Model Review",
            body: "Security notes now spell out which stories need elevated browser APIs and which ones stay fully sandbox-safe.",
            action: "Review notes",
        },
        {
            eyebrow: "Adoption",
            title: "Pilot Teams Onboarded",
            body: "Three product squads have moved their internal prototypes onto the package and started filing integration feedback.",
            action: "See rollout",
        },
        {
            eyebrow: "QA",
            title: "Regression Sweep",
            body: "A targeted browser sweep caught contrast regressions, stale labels, and one broken close action before release cut.",
            action: "Open checklist",
        },
    ];

    for (const slideData of slides) {
        const slide = document.createElement("article");

        if (slideData.markerLabel) {
            slide.setAttribute("data-carousel-marker-label", slideData.markerLabel);
        }

        const eyebrow = document.createElement("p");
        eyebrow.textContent = slideData.eyebrow;

        const title = document.createElement("h2");
        title.textContent = slideData.title;

        const body = document.createElement("p");
        body.textContent = slideData.body;

        const action = document.createElement("a");
        action.href = "#";
        action.textContent = slideData.action;

        slide.append(eyebrow, title, body, action);
        track.append(slide);
    }

    carousel.append(track);
    frame.append(carousel);

    return frame;
}

function getCarouselParts(canvasElement) {
    const carousel = canvasElement.querySelector("basic-carousel");
    const track = canvasElement.querySelector("[data-carousel-track]");
    const slides = track ? Array.from(track.children) : [];

    return { carousel, track, slides };
}

export default {
    title: "Custom Elements/Carousel",
    tags: ["carousel", "scroll-snap", "css-overflow", "basic-carousel"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: `
Custom element that upgrades a named scroll-snap region and annotates its slides for CSS-native scroll controls.

Use it when the page already owns the slide content and layout, but still needs a predictable region label and a small programmatic API:

- provide one descendant \`[data-carousel-track]\` scroll container
- keep each slide as a direct child of that track
- pick \`data-controls="none"\`, \`"markers"\`, \`"arrows"\`, or \`"both"\` for supported native controls
- set \`data-snapping="start"\`, \`"center"\`, or \`"end"\` to align slides consistently in CSS and JS
- optionally add \`data-carousel-marker-label\` on a slide for a custom generated marker name
- import the starter carousel CSS if you want native \`::scroll-button()\` and \`::scroll-marker\` controls where supported
                `,
            },
            source: {
                code: `<basic-carousel
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
      <p>Keyboard and announcement fixes queued for the next sprint.</p>
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
      <p>Shared interaction surfaces now derive from one starter layer.</p>
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
</basic-carousel>`,
            },
        },
    },
    render: createStory,
    args: {
        label: "Featured stories",
        controls: "both",
        snapping: "center",
    },
    argTypes: {
        label: {
            control: "text",
            description: "Maps to `data-label` and becomes the fallback accessible name for the carousel region.",
            table: {
                category: "Attributes",
            },
        },
        controls: {
            control: "inline-radio",
            options: ["both", "markers", "arrows", "none"],
            description: "Chooses whether native scroll markers, arrows, both, or no generated controls are shown where the browser supports them.",
            table: {
                category: "Attributes",
            },
        },
        snapping: {
            control: "inline-radio",
            options: ["start", "center", "end"],
            description: "Controls the slide snap position for both CSS `scroll-snap-align` and `scrollToItem()`.",
            table: {
                category: "Attributes",
            },
        },
    },
};

export const Default = {
    play: async ({ canvasElement }) => {
        const { carousel, track, slides } = getCarouselParts(canvasElement);

        await waitFor(() => {
            const slideWidth = slides[0].getBoundingClientRect().width;
            const trackWidth = track.getBoundingClientRect().width;
            const slideWidthRatio = slideWidth / trackWidth;

            expect(carousel).not.toBeNull();
            expect(track).not.toBeNull();
            expect(carousel).toHaveAttribute("role", "region");
            expect(carousel).toHaveAttribute("aria-label", "Featured stories");
            expect(carousel).toHaveAttribute("data-basic-carousel-controls", "both");
            expect(carousel).toHaveAttribute("data-basic-carousel-snapping", "center");
            expect(carousel).toHaveAttribute("data-basic-carousel-ready");
            expect(slides).toHaveLength(10);
            expect(slides[0]).toHaveAttribute("data-basic-carousel-marker", "1");
            expect(slides[1]).toHaveAttribute("data-basic-carousel-marker-label", "Go to the accessibility slide");
            expect(getComputedStyle(slides[0]).scrollSnapAlign).toBe("center");
            expect(slideWidthRatio).toBeGreaterThan(0.88);
            expect(slideWidthRatio).toBeLessThan(0.92);
        });

        expect(carousel.scrollToItem(9, { behavior: "auto" })).toBe(true);

        await waitFor(() => {
            expect(track.scrollLeft).toBeGreaterThan(0);
            const startButtonStyles = getComputedStyle(track, "::scroll-button(inline-start)");
            const markerGroupStyles = getComputedStyle(track, "::scroll-marker-group");

            expect(startButtonStyles.content).not.toBe("none");
            expect(startButtonStyles.gridRowStart).toBe("2");
            expect(markerGroupStyles.display).toBe("flex");
            expect(markerGroupStyles.gridRowStart).toBe("2");
            expect(getComputedStyle(slides[0], "::scroll-marker").content).not.toBe("none");
        });
    },
};

export const MarkersOnly = {
    args: {
        controls: "markers",
    },
    play: async ({ canvasElement }) => {
        const { carousel, track, slides } = getCarouselParts(canvasElement);

        await waitFor(() => {
            expect(carousel).toHaveAttribute("data-basic-carousel-controls", "markers");
            expect(getComputedStyle(track, "::scroll-button(inline-start)").display).toBe("none");
            expect(getComputedStyle(slides[0], "::scroll-marker").content).not.toBe("none");
        });
    },
};

export const ArrowsOnly = {
    args: {
        controls: "arrows",
    },
};

export const NoControls = {
    args: {
        controls: "none",
    },
    play: async ({ canvasElement }) => {
        const { carousel, track, slides } = getCarouselParts(canvasElement);

        await waitFor(() => {
            expect(carousel).toHaveAttribute("data-basic-carousel-controls", "none");
            expect(getComputedStyle(track, "::scroll-button(inline-start)").display).toBe("none");
            expect(["", "none"]).toContain(getComputedStyle(slides[0], "::scroll-marker").content);
        });
    },
};

export const StartSnap = {
    args: {
        snapping: "start",
    },
};
