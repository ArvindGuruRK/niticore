import { Marquee } from "@/components/motion/marquee";

const MESSAGE = "Join us at AI Everything Abu Dhabi, 6–7 October 2026";

// Enough copies that one group is wider than a large monitor, so the loop never shows a gap.
const COPIES = 8;

/**
 * Event announcement above the nav. Sits at the very top of the document and scrolls away with the
 * page; SiteNav follows it up (see --banner-h and --scroll-y). Text runs left to right and pauses on hover.
 */
export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Announcement"
      className="absolute inset-x-0 top-0 z-[var(--z-nav)] h-[var(--banner-h)] bg-tertiary pt-safe text-accent-ink"
    >
      {/* [&>div]:h-full lets the track fill the bar so the text centres vertically; the edge fade is off on a solid bar. */}
      <Marquee direction={-1} speed={45} reactToScroll={false} className="h-full [mask-image:none] [&>div]:h-full">
        {Array.from({ length: COPIES }, (_, i) => (
          <div key={i} aria-hidden={i > 0} className="flex items-center whitespace-nowrap">
            <span className="text-sm font-semibold">{MESSAGE}</span>
            <span aria-hidden className="mx-8 size-1.5 rotate-45 bg-accent-ink/60" />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
