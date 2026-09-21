"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, NO_REDUCE } from "@/lib/motion";

type Step = { title: string; body: string };

/**
 * Pin and scrub: the block pins at the viewport top while vertical scroll
 * crossfades through the steps. Base pattern for the 7-stage governance loop.
 * Under reduced motion the steps stack as a plain list.
 */
export function PinScrub({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-step]", root.current);
        const bar = root.current!.querySelector("[data-bar]");
        gsap.set(items.slice(1), { opacity: 0, y: 28 });

        const tl = gsap.timeline({
          defaults: { ease: EASE.linear },
          scrollTrigger: {
            trigger: root.current,
            start: "top top", // pin exactly when the block reaches the viewport top
            end: `+=${steps.length * 70}%`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: steps.length - 1 }, 0);
        items.slice(1).forEach((item, i) => {
          const at = i + 0.55;
          tl.to(items[i], { opacity: 0, y: -28, duration: 0.4 }, at).to(item, { opacity: 1, y: 0, duration: 0.4 }, at);
        });
      });
    },
    { scope: root, dependencies: [steps.length] },
  );

  return (
    <div
      ref={root}
      className="flex min-h-[100dvh] flex-col justify-center gap-10 motion-reduce:min-h-0 motion-reduce:py-10"
    >
      <div className="h-px w-full bg-line-strong motion-reduce:hidden">
        <div data-bar="" className="h-full origin-left scale-x-0 bg-accent" />
      </div>
      <div className="grid motion-reduce:gap-8">
        {steps.map((step, i) => (
          <div
            key={step.title}
            data-step=""
            className="col-start-1 row-start-1 flex max-w-2xl flex-col gap-3 motion-reduce:col-auto motion-reduce:row-auto"
          >
            <p className="type-caption tabular-nums">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="type-h2 text-fg">{step.title}</h3>
            <p className="type-lead">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
