"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MegaphoneSimple } from "@phosphor-icons/react/ssr";

/** The AI Everything Abu Dhabi page. BackToTop reads it too, to know when this button is absent. */
export const EVENT_PATH = "/announcements";

/**
 * Floating link to the event page, in the Back to top button's look (same size, border, glass and
 * hover colour). Always visible in the bottom-right corner on every page except the event page
 * itself; BackToTop stacks above it.
 */
export function EventButton() {
  const pathname = usePathname();
  if (pathname === EVENT_PATH) return null;

  return (
    <Link
      href={EVENT_PATH}
      aria-label="AI Everything Abu Dhabi: see where to find us"
      title="Meet us at AI Everything Abu Dhabi"
      className="fixed bottom-[max(1.5rem,var(--safe-bottom))] right-[max(1.5rem,var(--safe-right))] z-[var(--z-menu)] grid size-12 place-items-center rounded-full border border-white/[0.14] bg-nav/70 text-fg shadow-panel backdrop-blur-xl transition-colors duration-300 hover:text-accent active:scale-[0.96] sm:bottom-[max(2rem,var(--safe-bottom))] sm:right-[max(2rem,var(--safe-right))]"
    >
      <MegaphoneSimple aria-hidden weight="bold" className="size-5" />
    </Link>
  );
}
