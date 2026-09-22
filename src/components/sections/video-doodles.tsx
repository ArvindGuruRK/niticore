import { FilmClap } from "@/components/illustrations/film-clap";
import { Popcorn } from "@/components/illustrations/popcorn";

/**
 * Line-art accents in the video section's margins, either side of the "Watch demo" pill: a film
 * clapperboard on the left, tilted slightly right, sitting a little below the frame's top edge;
 * and a popcorn box on the right, tilted slightly left, sitting just below the pill, close to the
 * frame but held clear of the viewport edge. Each stroke draws fully before the next starts
 * (stagger equal to duration), so the line builds one path at a time instead of overlapping.
 * Draws once as the section scrolls into view, mirroring the hero's doodle set. Hidden on phones,
 * where there is no margin to hold them.
 */
export function VideoDoodles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      <FilmClap
        trigger="view"
        delay={0.15}
        duration={0.22}
        stagger={0.22}
        strokeWidth={3.5}
        className="absolute left-[-1vw] top-[16%] w-[clamp(4.5rem,7.5vw,7rem)] rotate-[8deg] text-tertiary"
      />
      <Popcorn
        trigger="view"
        delay={0.35}
        duration={0.32}
        stagger={0.32}
        strokeWidth={3.5}
        className="absolute right-[-2vw] top-[54%] w-[clamp(4.5rem,7.5vw,7rem)] -rotate-[8deg] text-tertiary"
      />
    </div>
  );
}
