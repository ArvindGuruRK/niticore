import { Flourish } from "@/components/illustrations/flourish";
import { Sparkle } from "@/components/illustrations/sparkle";
import { StarArc } from "@/components/illustrations/star-arc";

/**
 * Line-art accents that live in the hero margins and bleed off the viewport edges, never between
 * the copy and the UI: a loose curl on the left, a partial star and a sparkle on the right.
 * Sizes follow the viewport width. Hidden on phones, where there is no margin to hold them.
 */
export function HeroDoodles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      <Flourish
        trigger="load"
        delay={1.9}
        duration={1.8}
        strokeWidth={3.5}
        className="absolute left-[-3vw] top-[56%] w-[clamp(8rem,15.5vw,18rem)] text-accent"
      />
      <StarArc
        trigger="load"
        delay={1.2}
        duration={1.4}
        strokeWidth={3.5}
        className="absolute right-[-1vw] top-[17%] w-[clamp(3.25rem,5.6vw,6.5rem)] text-accent"
      />
      <Sparkle size={76} delay={1.5} trigger="load" className="absolute right-[4.5vw] top-[33%] text-accent" />
    </div>
  );
}
