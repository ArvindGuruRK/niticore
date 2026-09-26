import Link from "next/link";
import { Marquee } from "@/components/motion/marquee";

const MESSAGE = "Join us at AI Everything Abu Dhabi, 6–7 October 2026";

// Enough copies that one group is wider than a large monitor, so the loop never shows a gap.
const COPIES = 8;

/**
 * Event announcement above the nav. Sits at the very top of the document and scrolls away with the
 * page; SiteNav follows it up (see --banner-h and --scroll-y). Text runs left to right and pauses on
 * hover. The whole bar links to the event page.
 */
export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Announcement"
      className="absolute inset-x-0 top-0 z-[var(--z-nav)] h-[var(--banner-h)] bg-tertiary pt-safe text-accent-ink"
    >
      <Link
        href="/ai-everything"
        aria-label={`${MESSAGE}. See where to find us.`}
        className="group block h-full focus-visible:outline-offset-[-4px]"
      >
        {/* [&>div]:h-full lets the track fill the bar so the text centres vertically. The dark edge fades from Marquee are kept on purpose: they look good on the violet bar. */}
        <Marquee direction={-1} speed={45} reactToScroll={false} className="h-full [&>div]:h-full">
          {Array.from({ length: COPIES }, (_, i) => (
            <div key={i} aria-hidden className="flex items-center whitespace-nowrap">
              <span className="text-sm font-semibold underline-offset-4 group-hover:underline">{MESSAGE}</span>
              <span aria-hidden className="mx-8 size-1.5 rotate-45 bg-accent-ink/60" />
            </div>
          ))}
        </Marquee>
      </Link>
    </div>
  );
}
