"use client";

import { useRef, type ComponentProps, type ElementType } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";

gsap.registerPlugin(SplitText);

type SplitHeadingProps = Omit<ComponentProps<"h2">, "children"> & {
  /** Plain text only: it is split into masked lines or words */
  children: string;
  as?: ElementType;
  /** Rise line by line (headlines) or word by word (short punchy copy) */
  by?: "lines" | "words";
  delay?: number;
};

/**
 * Masked text rise. Each line or word slides up from behind a clip, once, when the heading
 * enters the viewport. Re-splits on resize and after web fonts load (autoSplit), so line
 * breaks always match the final layout. SplitText labels the element for screen readers.
 */
export function SplitHeading({ as: Tag = "h2", by = "lines", delay = 0, children, ...props }: SplitHeadingProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        const el = root.current!;
        SplitText.create(el, {
          type: by === "lines" ? "lines" : "lines,words",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { visibility: "visible" });
            return gsap.from(by === "lines" ? self.lines : self.words, {
              yPercent: 110,
              duration: DUR.slow,
              ease: EASE.out,
              stagger: by === "lines" ? 0.1 : 0.05,
              delay,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
          },
        });
      });
    },
    { scope: root, dependencies: [by, delay, children] },
  );

  return (
    <Tag ref={root} data-split="" {...props}>
      {children}
    </Tag>
  );
}
