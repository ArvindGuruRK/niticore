"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Cookie, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import {
  COOKIE_CATEGORIES,
  onOpenCookieSettings,
  openCookieSettings,
  readConsent,
  saveConsent,
  type ConsentCategory,
} from "@/lib/consent";
import { DIST, DUR, EASE, NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useConsent } from "./use-consent";

type Choice = Record<ConsentCategory, boolean>;

const ALL: Choice = { analytics: true, marketing: true };
const NONE: Choice = { analytics: false, marketing: false };

/**
 * The first-visit banner is off while the site sets no optional cookies: there is nothing to ask
 * consent for. Turn it on (true) in the same change that adds analytics or any other optional cookie.
 * The settings dialog and the footer's Cookie settings link work either way.
 */
const BANNER_ENABLED = false;

/** Waits for the hero to finish its entrance before asking */
const BANNER_DELAY = 1.2;

const motionOk = () => window.matchMedia(NO_REDUCE).matches;

/**
 * Cookie consent, mounted once in the root layout: a banner on the first visit (bottom left, full
 * width on phones; off for now, see BANNER_ENABLED) and the Cookie settings dialog, which the footer and the Cookie Policy also open.
 * Accept all and Reject all sit side by side at the same size, so saying no is as easy as saying yes.
 * The dialog is a native modal <dialog>: focus stays inside, Escape closes it, and it renders above
 * everything without a z-index. The page behind stops scrolling while it is open.
 */
export function CookieConsent() {
  const consent = useConsent();
  const [draft, setDraft] = useState<Choice>(NONE);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLElement>(null);
  const closing = useRef(false);

  const showBanner = BANNER_ENABLED && consent === null;

  const openDialog = () => {
    const el = dialog.current;
    if (!el || el.open) return;
    const saved = readConsent();
    setDraft(saved ? { analytics: saved.analytics, marketing: saved.marketing } : NONE);
    el.showModal();
    getLenis()?.stop();
    if (motionOk()) {
      gsap.fromTo(
        panel.current,
        { opacity: 0, y: DIST, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: DUR.fast, ease: EASE.out, clearProps: "transform,opacity" },
      );
    }
  };

  const closeDialog = () => {
    const el = dialog.current;
    if (!el?.open || closing.current) return;
    if (!motionOk()) {
      el.close();
      return;
    }
    closing.current = true;
    gsap.to(panel.current, {
      opacity: 0,
      y: DIST / 2,
      duration: DUR.fast * 0.6,
      ease: EASE.inOut,
      onComplete: () => {
        closing.current = false;
        el.close();
        gsap.set(panel.current, { clearProps: "transform,opacity" });
      },
    });
  };

  useEffect(() => onOpenCookieSettings(openDialog));

  // Banner entrance, once it is needed
  useGSAP(
    () => {
      if (!showBanner || !banner.current) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCE, () => {
        gsap.fromTo(
          banner.current,
          { autoAlpha: 0, y: DIST },
          { autoAlpha: 1, y: 0, delay: BANNER_DELAY, duration: DUR.base, ease: EASE.out, clearProps: "transform" },
        );
      });
    },
    { dependencies: [showBanner] },
  );

  // Save, then let the banner slip away (it unmounts once a choice exists)
  const decide = (choice: Choice) => {
    const el = banner.current;
    if (!el || !motionOk()) {
      saveConsent(choice);
      return;
    }
    gsap.to(el, {
      autoAlpha: 0,
      y: DIST,
      duration: DUR.fast,
      ease: EASE.inOut,
      onComplete: () => saveConsent(choice),
    });
  };

  const saveFromDialog = (choice: Choice) => {
    saveConsent(choice);
    closeDialog();
  };

  return (
    <>
      {showBanner && (
        <section
          ref={banner}
          aria-labelledby="cookie-banner-title"
          className="fixed inset-x-3 bottom-[max(0.75rem,var(--safe-bottom))] z-[var(--z-menu)] flex flex-col gap-4 rounded-panel border border-line-strong bg-surface p-card shadow-panel sm:inset-x-auto sm:bottom-[max(1.5rem,var(--safe-bottom))] sm:left-[max(1.5rem,var(--safe-left))] sm:w-[26rem]"
        >
          <div className="flex items-start gap-3">
            <Cookie aria-hidden weight="duotone" className="size-7 shrink-0 text-tertiary" />
            <div className="flex flex-col gap-1">
              <h2 id="cookie-banner-title" className="type-h4 text-fg">
                Your cookie choice
              </h2>
              <p className="type-small">
                We only use the cookies this site needs to work. Any analytics or marketing cookies stay off unless
                you allow them.{" "}
                <Link href="/cookies" className="font-semibold text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg">
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="md" className="w-full" onClick={() => decide(ALL)}>
              Accept all
            </Button>
            <Button size="md" variant="secondary" className="w-full" onClick={() => decide(NONE)}>
              Reject all
            </Button>
            <Button size="md" variant="ghost" className="col-span-2 w-full" onClick={openDialog}>
              Customise
            </Button>
          </div>
        </section>
      )}

      <dialog
        ref={dialog}
        aria-labelledby="cookie-settings-title"
        aria-describedby="cookie-settings-intro"
        onCancel={(e) => {
          e.preventDefault();
          closeDialog();
        }}
        onClose={() => getLenis()?.start()}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeDialog();
        }}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(34rem,calc(100vw-1.5rem))] max-w-none overflow-visible bg-transparent p-0 text-fg backdrop:bg-canvas/80 backdrop:animate-fade-in motion-reduce:backdrop:animate-none"
      >
        <div
          ref={panel}
          className="flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-panel border border-line-strong bg-surface shadow-panel"
        >
          <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5 sm:px-8 sm:pt-7">
            <h2 id="cookie-settings-title" className="type-h3 text-fg">
              Cookie settings
            </h2>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="Close cookie settings"
              className="tap-target -mr-2 grid place-items-center rounded-control text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
            >
              <X aria-hidden weight="bold" className="size-5" />
            </button>
          </div>

          <div data-lenis-prevent className="flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pb-2 sm:px-8">
            <p id="cookie-settings-intro" className="type-small">
              Choose which optional cookies we may use. Your choice is saved in this browser for six months, and you can
              change it any time from the footer.{" "}
              <Link href="/cookies" onClick={closeDialog} className="font-semibold text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg">
                Read the Cookie Policy
              </Link>
            </p>

            <ul className="flex flex-col gap-3">
              {COOKIE_CATEGORIES.map((c) => {
                const locked = c.id === "necessary";
                const checked = locked || draft[c.id];
                return (
                  <li key={c.id} className="flex flex-col gap-2 rounded-field border border-line bg-raised/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 id={`cookie-${c.id}-title`} className="type-h4 text-fg">
                        {c.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        {locked && <span className="type-caption">Always on</span>}
                        <Switch
                          checked={checked}
                          disabled={locked}
                          aria-labelledby={`cookie-${c.id}-title`}
                          aria-describedby={`cookie-${c.id}-body`}
                          onCheckedChange={
                            locked ? undefined : (on) => setDraft((d) => ({ ...d, [c.id]: on }))
                          }
                        />
                      </div>
                    </div>
                    <p id={`cookie-${c.id}-body`} className="type-small">
                      {c.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2 px-5 pb-5 pt-4 sm:px-8 sm:pb-7">
            <Button size="md" className="col-span-2 w-full" onClick={() => saveFromDialog(draft)}>
              Save my choices
            </Button>
            <Button size="md" variant="secondary" className="w-full" onClick={() => saveFromDialog(NONE)}>
              Reject all
            </Button>
            <Button size="md" variant="secondary" className="w-full" onClick={() => saveFromDialog(ALL)}>
              Accept all
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/** "Cookie settings" as a link-styled button: reopens the dialog from the footer or a page. */
export function CookieSettingsButton({ className, children = "Cookie settings", ...props }: ComponentProps<"button">) {
  return (
    <button type="button" onClick={openCookieSettings} className={cn(className)} {...props}>
      {children}
    </button>
  );
}

/** The same, as a secondary Button, for opening the dialog from page content. */
export function CookieSettingsCta({ children = "Open cookie settings" }: { children?: ReactNode }) {
  return (
    <Button variant="secondary" onClick={openCookieSettings}>
      {children}
    </Button>
  );
}
