/**
 * Cookie consent: the visitor's choice for each optional cookie category, kept in one first-party
 * cookie so the server could read it too. Strictly necessary storage needs no consent and is not
 * a category here.
 *
 * Nothing optional runs on the site yet. Anything added later (analytics, marketing pixels) must
 * check first: `useConsent()?.analytics` (from components/consent/use-consent) in a component, or
 * `hasConsent("analytics")` elsewhere, and listen for changes with `onConsentChange`. Nothing loads
 * until the visitor says yes.
 */

export type ConsentCategory = "analytics" | "marketing";

export type Consent = Record<ConsentCategory, boolean> & {
  /** When the choice was made (ISO), for the record */
  updatedAt: string;
};

export const CONSENT_COOKIE = "niticore_consent";
/** Bump when categories change, so everyone is asked again */
const VERSION = 1;
/** Six months, then the visitor is asked again */
export const CONSENT_MAX_AGE_DAYS = 180;

const OPEN_EVENT = "niticore:cookie-settings";
const listeners = new Set<() => void>();

function readCookie(): string | null {
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  return match ? match.slice(CONSENT_COOKIE.length + 1) : null;
}

// useSyncExternalStore needs the same object back while nothing changed, so parse once per raw value
let cachedRaw: string | null | undefined;
let cachedConsent: Consent | null = null;

function parse(raw: string | null): Consent | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw));
    if (data?.v !== VERSION) return null;
    return { analytics: data.a === true, marketing: data.m === true, updatedAt: String(data.t ?? "") };
  } catch {
    return null;
  }
}

/** The stored choice, or null when the visitor hasn't chosen yet (or the choice has expired). */
export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = readCookie();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedConsent = parse(raw);
  }
  return cachedConsent;
}

export function hasConsent(category: ConsentCategory): boolean {
  return readConsent()?.[category] === true;
}

export function saveConsent(choice: Record<ConsentCategory, boolean>) {
  const value = encodeURIComponent(
    JSON.stringify({ v: VERSION, a: choice.analytics, m: choice.marketing, t: new Date().toISOString() }),
  );
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE_DAYS * 86_400}; SameSite=Lax${secure}`;
  listeners.forEach((listener) => listener());
}

/** Runs `listener` whenever the choice is saved. Returns the unsubscribe function. */
export function onConsentChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Opens the cookie settings dialog from anywhere (footer link, Cookie Policy page, banner when enabled). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookieSettings(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

/** The categories as the settings dialog and the Cookie Policy describe them. */
export const COOKIE_CATEGORIES = [
  {
    id: "necessary",
    title: "Strictly necessary",
    body: "Keep the site working and secure, and remember your cookie choice. They can't be switched off.",
    inUse: true,
  },
  {
    id: "analytics",
    title: "Analytics",
    body: "Would help us see which pages are useful, counted in aggregate. Not used on this site today.",
    inUse: false,
  },
  {
    id: "marketing",
    title: "Marketing",
    body: "Would measure our campaigns on other sites. Not used on this site today.",
    inUse: false,
  },
] as const satisfies readonly { id: ConsentCategory | "necessary"; title: string; body: string; inUse: boolean }[];
