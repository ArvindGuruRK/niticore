"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DIST, DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Step = { title: string; body: ReactNode };

/**
 * Pin and scrub: the block pins at the viewport top while vertical scroll
 * crossfades through the steps. Base pattern for the 7-stage governance loop.
 * Only on lg+ screens (1024px and up) without reduced motion, like HorizontalScroll. Below lg the
 * steps stack as a list that fades in step by step: on phones a long pin felt like the page had
 * stopped scrolling (a swipe moved nothing but the text), and touch keeps its native momentum.
 * Under reduced motion the steps stack as a plain list.
 *
 * `aside` renders a second column (e.g. an illustration) that holds still next to the crossfading
 * steps instead of animating with them — hidden below lg, where the steps alone still work full-width.
 * `background` renders behind everything else in the pinned box (absolutely positioned, `-z-10`) —
 * for a full-bleed illustration that should hold pinned position together with the text, not a
 * side-by-side column like `aside`. Hidden below xl: `GovernanceFabric`'s right-anchored radius
 * scales with container width, and between lg and xl (1024–1280px) its outer ring runs into the
 * text column's right edge — xl is where real clearance starts.
 * `header` renders static content (e.g. a section heading) inside the pinned box, above the steps, so
 * it stays on screen for the whole scrub instead of scrolling away before the pin engages — put a
 * section's own heading here rather than above <PinScrub>, or it disappears the moment the pin starts.
 * `showBar` hides the scrub progress hairline, which sits pinned to the top of the box (independent
 * of how `header`/`topAlign` lay out the rest) so it reads as a fixed rule rather than drifting with
 * whatever the content's vertical alignment happens to be. `minHeight` overrides the pin box height (default a
 * full viewport). `topAlign` sits the content near the top of the pin box instead of vertically
 * centring it — use when a header is included, so the pin doesn't read as a big empty stretch.
 */
export function PinScrub({
  steps,
  aside,
  background,
  header,
  showBar = true,
  minHeight = "100dvh",
  topAlign = false,
}: {
  steps: Step[];
  aside?: ReactNode;
  background?: ReactNode;
  header?: ReactNode;
  showBar?: boolean;
  minHeight?: string;
  topAlign?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${NO_REDUCE} and (max-width: 1023.98px)`, () => {
        gsap.utils.toArray<HTMLElement>("[data-step]", root.current).forEach((item) => {
          gsap.from(item, {
            opacity: 0,
            y: DIST,
            duration: DUR.base,
            ease: EASE.out,
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
          });
        });
      });
      mm.add(`${NO_REDUCE} and (min-width: 1024px)`, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-step]", root.current);
        const bar = barRef.current;
        gsap.set(items.slice(1), { opacity: 0, y: 28 });
        if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });

        const tl = gsap.timeline({
          defaults: { ease: EASE.linear },
          scrollTrigger: {
            trigger: root.current,
            start: "top top", // pin exactly when the block reaches the viewport top
            end: `+=${steps.length * 70}%`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            // Bar tracks raw scroll progress directly instead of riding the crossfade timeline,
            // so it can't drift out of sync with duration/position math elsewhere in the timeline.
            onUpdate: (self) => {
              if (bar) gsap.set(bar, { scaleX: self.progress });
            },
          },
        });
        items.slice(1).forEach((item, i) => {
          const at = i + 0.55;
          tl.to(items[i], { opacity: 0, y: -28, duration: 0.4 }, at).to(item, { opacity: 1, y: 0, duration: 0.4 }, at);
        });
      });
    },
    { scope: root, dependencies: [steps.length] },
  );

  const stepStack = (
    <div className="grid gap-12 lg:motion-safe:gap-0">
      {steps.map((step, i) => (
        <div
          key={step.title}
          data-step=""
          className="flex max-w-2xl flex-col gap-3 lg:motion-safe:col-start-1 lg:motion-safe:row-start-1"
        >
          <p className="type-caption tabular-nums">{String(i + 1).padStart(2, "0")}</p>
          <h3 className="type-h2 text-fg">{step.title}</h3>
          <div className="type-lead">{step.body}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={root}
      className={cn(
        "relative isolate flex flex-col gap-10 lg:motion-safe:min-h-[var(--pin-min-h)]",
        topAlign ? "justify-start lg:motion-safe:pt-24" : "lg:motion-safe:justify-center",
      )}
      style={{ "--pin-min-h": minHeight } as React.CSSProperties}
    >
      {background && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden xl:block">
          {background}
        </div>
      )}
      {showBar && (
        <div className="absolute inset-x-0 top-16 hidden h-0.5 bg-line-strong lg:motion-safe:block">
          <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
        </div>
      )}
      {header}
      {aside ? (
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-10">
          {stepStack}
          <div aria-hidden className="hidden lg:block">
            {aside}
          </div>
        </div>
      ) : (
        stepStack
      )}
    </div>
  );
}
