"use client";

import { useSyncExternalStore } from "react";
import { onConsentChange, readConsent, type Consent } from "@/lib/consent";

/**
 * The visitor's cookie choice, live. `undefined` during server rendering and hydration (unknown),
 * `null` when they haven't chosen yet, else their choice.
 */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(onConsentChange, readConsent, () => undefined);
}
