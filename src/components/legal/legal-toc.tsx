"use client";

import { useRef, useState, type MouseEvent } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToId } from "@/lib/lenis";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; title: string };

/**
 * "On this page" for the legal pages. From lg it is a sticky column beside the text: a violet rail
 * fills as the article is read (a progress readout, so it runs under reduced motion too) and the
 * section being read is highlighted. Below lg it is a collapsed panel above the text that closes
 * again after a jump. Links scroll through Lenis with room for the nav, and update the URL hash.
 */
export function LegalToc({ items, articleId }: { items: TocItem[]; articleId: string }) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const details = useRef<HTMLDetailsElement>(null);
  const [active, setActive] = useState(items[0]?.id);

  useGSAP(
    () => {
      const article = document.getElementById(articleId);
      if (!article) return;

      ScrollTrigger.create({
        trigger: article,
        start: "top 30%",
        end: "bottom 70%",
        onUpdate: (self) => gsap.set(fill.current, { scaleY: self.progress }),
        onRefresh: (self) => gsap.set(fill.current, { scaleY: self.progress }),
      });

      // The section crossing the upper third of the screen is the one being read
      items.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top 30%",
          end: "bottom 30%",
          onToggle: (self) => self.isActive && setActive(id),
        });
      });
    },
    { scope: root, dependencies: [articleId, items] },
  );

  const jump = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToId(id);
    window.history.replaceState(null, "", `#${id}`);
    setActive(id);
    details.current?.removeAttribute("open");
  };

  const list = (
    <ol className="flex flex-col gap-1">
      {items.map((item, i) => {
        const current = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => jump(e, item.id)}
              aria-current={current ? "location" : undefined}
              className={cn(
                "type-small flex gap-3 rounded-field py-1.5 pr-2 transition-colors duration-200 hover:text-fg",
                current ? "text-fg" : "text-fg-subtle",
              )}
            >
              <span className={cn("w-6 shrink-0 tabular-nums transition-colors", current && "text-tertiary")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div ref={root} className="lg:sticky lg:top-32 lg:self-start">
      {/* Phones and tablets */}
      <details
        ref={details}
        className="group rounded-panel border border-line bg-surface shadow-panel lg:hidden"
      >
        <summary className="flex min-h-[var(--spacing-tap)] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 type-h4 text-fg [&::-webkit-details-marker]:hidden">
          On this page
          <CaretDown
            aria-hidden
            weight="bold"
            className="size-4 text-fg-muted transition-transform duration-300 ease-out-expo group-open:rotate-180"
          />
        </summary>
        <nav aria-label="On this page" className="px-5 pb-4">
          {list}
        </nav>
      </details>

      {/* Desktop */}
      <nav aria-label="On this page" className="hidden gap-5 lg:flex lg:flex-col">
        <p className="type-h4 text-fg">On this page</p>
        <div className="relative pl-5">
          <span aria-hidden className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-line-strong" />
          <span
            ref={fill}
            aria-hidden
            // GSAP owns transform here (a Tailwind scale-y-* class would set `scale` and stack with it)
            style={{ transform: "scaleY(0)" }}
            className="absolute inset-y-1 left-0 w-0.5 origin-top rounded-full bg-tertiary"
          />
          {list}
        </div>
      </nav>
    </div>
  );
}
