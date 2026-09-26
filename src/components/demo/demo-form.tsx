"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Warning } from "@phosphor-icons/react";
import { getCountries, type CountryCode } from "libphonenumber-js/min";
import { detectCountry, requestDemo } from "@/app/(site)/demo/actions";
import { celebrate } from "@/components/motion/confetti";
import { Button } from "@/components/ui/button";
import { CheckPill, Field, Input, Textarea } from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
import { gsap } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { HONEYPOT, type DemoField, type DemoState } from "@/lib/demo-request";

const INITIAL: DemoState = { status: "idle" };

/** Field ids, so a server-side error can focus the right control */
const IDS: Record<DemoField, string> = {
  name: "demo-name",
  email: "demo-email",
  company: "demo-company",
  phone: "demo-phone",
  notes: "demo-notes",
};

/**
 * Demo request form, sent by the `requestDemo` server action (Resend emails the team and the visitor).
 *
 * - Submits through onSubmit + startTransition rather than <form action>: React resets a form after
 *   an action-attribute submit, which would wipe what people typed when the server returns an error.
 * - Browser validation runs first (required, email format); the server validates everything again.
 * - While sending, every control is disabled (one request per click) and the button shows progress.
 * - Field errors from the server show under each field and focus the first one; a sending failure
 *   shows an alert above the button with the form still filled in, ready to retry.
 * - On success the form is replaced by a confirmation panel that takes focus, with confetti.
 */
export function DemoForm({
  phone,
  frameworks,
  submit,
  nextStep,
}: {
  phone: { label: string; hint: string; search: string };
  frameworks: string[];
  submit: string;
  /** One line beside the button: what happens after sending */
  nextStep: string;
}) {
  const [state, dispatch, pending] = useActionState(requestDemo, INITIAL);
  const [country, setCountry] = useState<CountryCode>("IN");

  // Preselect the phone country: Vercel's location first, then the browser's region, else India
  useEffect(() => {
    const known = new Set<string>(getCountries());
    const region = navigator.language.split("-")[1]?.toUpperCase();
    let cancelled = false;
    detectCountry()
      .catch(() => null)
      .then((code) => {
        const pick = [code, region].find((c): c is string => Boolean(c && known.has(c)));
        if (!cancelled && pick) setCountry(pick as CountryCode);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const errors = state.status === "invalid" ? state.errors : {};

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };

  // Focus the first field the server rejected
  useEffect(() => {
    if (state.status !== "invalid") return;
    const first = (Object.keys(IDS) as DemoField[]).find((key) => state.errors[key]);
    if (first) document.getElementById(IDS[first])?.focus();
  }, [state]);

  if (state.status === "sent") return <Sent state={state} />;

  const described = (key: DemoField) => (errors[key] ? `${IDS[key]}-error` : undefined);

  return (
    <form onSubmit={onSubmit} className="relative">
      {/* Honeypot: invisible to people and assistive tech; bots that fill it are dropped by the server */}
      <div aria-hidden className="absolute -left-[9999px] top-0 size-px overflow-hidden">
        <label>
          Company website
          <input type="text" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Full name" htmlFor={IDS.name} error={errors.name} required>
            <Input
              id={IDS.name}
              name="name"
              autoComplete="name"
              maxLength={120}
              required
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={described("name")}
            />
          </Field>
          <Field label="Work email" htmlFor={IDS.email} error={errors.email} required>
            <Input
              id={IDS.email}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={described("email")}
            />
          </Field>
          <Field label="Company" htmlFor={IDS.company} error={errors.company} required>
            <Input
              id={IDS.company}
              name="company"
              autoComplete="organization"
              maxLength={160}
              required
              aria-invalid={errors.company ? true : undefined}
              aria-describedby={described("company")}
            />
          </Field>
          <Field label={phone.label} htmlFor={IDS.phone} hint={phone.hint} error={errors.phone} optional>
            <PhoneInput
              id={IDS.phone}
              name="phone"
              defaultCountry={country}
              searchLabel={phone.search}
              invalid={Boolean(errors.phone)}
              describedBy={errors.phone ? `${IDS.phone}-error` : undefined}
            />
          </Field>
        </div>

        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="type-small mb-3 font-semibold text-fg">
            Frameworks you need to meet <span className="font-medium text-fg-subtle">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {frameworks.map((f) => (
              <CheckPill key={f} name="frameworks" value={f} label={f} />
            ))}
          </div>
        </fieldset>

        <Field label="Anything we should know?" htmlFor={IDS.notes} optional error={errors.notes}>
          <Textarea
            id={IDS.notes}
            name="notes"
            maxLength={2000}
            aria-invalid={errors.notes ? true : undefined}
            aria-describedby={described("notes")}
          />
        </Field>

        {state.status === "error" && (
          <p
            role="alert"
            className="type-small flex items-start gap-3 rounded-field border border-status-risk/40 bg-status-risk/10 px-4 py-3 text-fg"
          >
            <Warning weight="fill" aria-hidden className="mt-0.5 size-4 shrink-0 text-status-risk" />
            {state.message}
          </p>
        )}

        {/* What happens next on the left, the action on the right; stacked with the button last on phones */}
        <div className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p className="type-small max-w-sm text-fg">{nextStep}</p>
          <Button
            type="submit"
            size="lg"
            arrow={!pending}
            aria-busy={pending}
            className="w-full shrink-0 sm:w-auto"
          >
            {pending && (
              <span
                aria-hidden
                className="size-4 rounded-full border-2 border-accent-ink/30 border-t-accent-ink motion-safe:animate-spin"
              />
            )}
            {pending ? "Sending…" : submit}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

/** The confirmation that replaces the form: it takes focus, pops its tick in, and fires confetti once. */
function Sent({ state }: { state: Extract<DemoState, { status: "sent" }> }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const tick = useRef<HTMLSpanElement>(null);
  const shown = useRef(false);

  useEffect(() => {
    heading.current?.focus();
    // Once only, even when React runs effects twice in development
    if (shown.current) return;
    shown.current = true;
    celebrate();
    if (window.matchMedia(NO_REDUCE).matches) {
      gsap.fromTo(tick.current, { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.2)" });
    }
  }, []);

  return (
    <div className="flex flex-col items-start gap-5" role="status">
      <span
        ref={tick}
        className="grid size-14 place-items-center rounded-full bg-accent text-accent-ink shadow-accent"
      >
        <Check weight="bold" aria-hidden className="size-7" />
      </span>
      <h2 ref={heading} tabIndex={-1} className="type-h2 text-fg focus:outline-none">
        Request sent.
      </h2>
      <p className="type-lead max-w-xl">
        Thanks{state.firstName ? `, ${state.firstName}` : ""}. A certified AI governance specialist will be in touch to
        schedule your live platform demo.
      </p>
      {state.confirmationSent && state.email && (
        <p className="type-body">
          We&apos;ve sent a confirmation to <span className="font-semibold text-fg">{state.email}</span>.
        </p>
      )}
      <Button href="/platform" variant="secondary" size="lg" arrow className="mt-2">
        Explore the platform
      </Button>
    </div>
  );
}
