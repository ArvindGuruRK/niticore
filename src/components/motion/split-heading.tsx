"use client";

import { useRef, type ComponentProps, type ElementType, type ReactNode } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, EASE, NO_REDUCE } from "@/lib/motion";

gsap.registerPlugin(SplitText);

type SplitHeadingProps = Omit<ComponentProps<"h2">, "children"> & {
  /** Static content only: the text is split into DOM lines and words. Inline spans (an accent word) are kept. */
  children: ReactNode;
  as?: ElementType;
  /** Rise line by line (headlines, paragraphs) or word by word (short punchy copy) */
  by?: "lines" | "words";
  /** "view" plays once on entering the viewport, "load" plays right after mount (hero) */
  trigger?: "view" | "load";
  delay?: number;
};

/**
 * Masked text rise. Each line or word slides up from behind a clip. Re-splits on resize and
 * after web fonts load (autoSplit), so line breaks always match the final layout. SplitText
 * labels the element for screen readers, and reduced motion renders the plain text.
 */
export function SplitHeading({
  as: Tag = "h2",
  by = "lines",
  trigger = "view",
  delay = 0,
  children,
  ...props
}: SplitHeadingProps) {
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
              stagger: by === "lines" ? 0.1 : 0.06,
              delay,
              scrollTrigger: trigger === "view" ? { trigger: el, start: "top 88%", once: true } : undefined,
            });
          },
        });
      });
    },
    { scope: root, dependencies: [by, trigger, delay] },
  );

  return (
    <Tag ref={root} data-split="" {...props}>
      {children}
    </Tag>
  );
}
