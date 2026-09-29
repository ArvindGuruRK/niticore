import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { EventButton } from "@/components/event-button";
import { BackToTop } from "@/components/motion/back-to-top";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/**
 * What every site page has around its content, inside <body>: the no-JS fallback that un-hides
 * animated content, the announcement bar, smooth scrolling, Back to top, the event button and the
 * cookie dialog. Used by the site layout and the global 404.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <noscript>
        <style>{"[data-anim],[data-anim-stagger]>*,[data-word]{opacity:1!important}[data-split]{visibility:visible!important}[data-clip]{clip-path:none!important}[data-draw]{visibility:visible!important}"}</style>
      </noscript>
      <AnnouncementBar />
      <SmoothScroll />
      <BackToTop />
      <EventButton />
      {children}
      <CookieConsent />
    </>
  );
}
