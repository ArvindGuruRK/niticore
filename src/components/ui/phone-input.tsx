"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Country = { code: CountryCode; name: string; dial: string };

/** Every country libphonenumber-js knows, named in English by the browser and sorted by name. */
function useCountries(): Country[] {
  return useMemo(() => {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return getCountries()
      .map((code) => ({ code, name: names.of(code) ?? code, dial: `+${getCountryCallingCode(code)}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
}

/** Flag as a small SVG from /public/flags (country-flag-icons). Emoji flags don't render on Windows. */
function Flag({ code, className }: { code: CountryCode; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVGs, lazy-loaded in the list
    <img
      src={`/flags/${code}.svg`}
      alt=""
      width={20}
      height={14}
      loading="lazy"
      className={cn("h-3.5 w-5 shrink-0 rounded-[2px] object-cover", className)}
    />
  );
}

/**
 * International phone number: a searchable country picker (flag, name, dial code) joined to a number
 * box, both in the design system's field look.
 * - Validation and formatting come from libphonenumber-js (Google's libphonenumber rules): the number
 *   formats as it's typed where the country allows, and tidies itself on blur once it's valid. Typing a number that starts with "+" switches the country to match.
 * - The form receives one international value under `name` (E.164 when valid, e.g. +971501234567),
 *   so the server re-validates it with the same rules.
 * - `defaultCountry` preselects a country until the visitor picks one (e.g. from their location).
 * - One equal A to Z list (no pinned or suggested countries): flag, name, and the dial code in plain
 *   text on the right. The selected country's dial code is green, and the list opens scrolled to it.
 * - Picker keyboard: type to search, arrows move, Enter picks, Escape closes. The list scrolls
 *   without a visible scrollbar and opts out of Lenis so the wheel scrolls the list.
 */
export function PhoneInput({
  id,
  name,
  defaultCountry = "IN",
  invalid,
  describedBy,
  required,
  searchLabel = "Search countries",
  className,
}: {
  id: string;
  name: string;
  defaultCountry?: CountryCode;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
  searchLabel?: string;
  className?: string;
}) {
  const uid = useId();
  const countries = useCountries();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // The visitor's own pick wins; until they make one, the (possibly late-arriving) default shows
  const [chosen, setCountry] = useState<CountryCode | null>(null);
  const country = chosen ?? defaultCountry;
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const dial = `+${getCountryCallingCode(country)}`;
  const current = countries.find((c) => c.code === country);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.dial.slice(1).startsWith(q),
    );
  }, [countries, query]);

  // What the picker lists: every country, or the matches while searching
  const rows = filtered;

  // The value the form submits: one international number, E.164 when it parses
  const full = number.trim().startsWith("+") ? number.trim() : number.trim() ? `${dial} ${number.trim()}` : "";
  const parsed = full ? parsePhoneNumberFromString(full) : undefined;
  const value = parsed?.isValid() ? parsed.number : full;

  useGSAP(
    () => {
      if (!open) return;
      search.current?.focus({ preventScroll: true });
      if (window.matchMedia(NO_REDUCE).matches) {
        gsap.fromTo(
          panel.current,
          { opacity: 0, y: -6, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "power3.out", clearProps: "transform" },
        );
      }
    },
    { scope: root, dependencies: [open] },
  );

  // Close on a click outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the active option in view
  useEffect(() => {
    if (open) panel.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openPicker = () => {
    setQuery("");
    setActive(Math.max(0, countries.findIndex((c) => c.code === country))); // opens scrolled to it
    setOpen(true);
  };

  const choose = (code: CountryCode) => {
    setCountry(code);
    setOpen(false);
    // Re-read what's typed under the new country
    if (number && !number.startsWith("+")) setNumber(new AsYouType(code).input(number.replace(/\D/g, "")));
    document.getElementById(id)?.focus();
  };

  const onSearchKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, rows.length - 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(rows.length - 1);
    else if (e.key === "Enter") {
      if (rows[active]) choose(rows[active].code);
    } else if (e.key === "Escape") {
      setOpen(false);
      trigger.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
      return;
    } else return;
    e.preventDefault();
  };

  const onNumber = (raw: string) => {
    const typed = raw.replace(/[^\d+\s()-]/g, "");
    if (typed.trim().startsWith("+")) {
      // An international number: detect its country and keep the picker in step
      const formatter = new AsYouType();
      const formatted = formatter.input(typed);
      const detected = formatter.getCountry();
      if (detected) setCountry(detected);
      setNumber(formatted);
    } else {
      setNumber(new AsYouType(country).input(typed));
    }
  };

  // Tidy the number once it's complete and valid: the international format without the dial code,
  // which the picker already shows ("+971" + "50 123 4567", never "+971" + "050 123 4567")
  const onBlur = () => {
    if (!parsed?.isValid()) return;
    if (parsed.country && parsed.country !== country) setCountry(parsed.country);
    setNumber(parsed.formatInternational().replace(`+${parsed.countryCallingCode}`, "").trim());
  };

  return (
    <div ref={root} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-12 w-full rounded-field border border-line-strong bg-raised transition-colors duration-200 hover:border-white/25 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40",
          invalid && "border-status-risk/70",
          open && "border-accent ring-2 ring-accent/40",
        )}
      >
        <button
          ref={trigger}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${uid}-list`}
          aria-label={`Country: ${current?.name ?? country} ${dial}. Change country`}
          onClick={() => (open ? setOpen(false) : openPicker())}
          className="flex shrink-0 items-center gap-2 rounded-l-field bg-white/[0.04] pl-3.5 pr-3 text-[0.9375rem] font-semibold text-fg transition-colors hover:bg-white/[0.08] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Flag code={country} />
          <span className="tabular-nums">{dial}</span>
          <CaretDown
            weight="bold"
            aria-hidden
            className={cn("size-3.5 text-fg-subtle transition-transform duration-300 ease-out-expo", open && "rotate-180")}
          />
        </button>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={number}
          onChange={(e) => onNumber(e.target.value)}
          onBlur={onBlur}
          maxLength={24}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 rounded-r-field bg-transparent px-4 text-base font-medium text-fg placeholder:text-fg-subtle/70 focus:outline-none autofill:shadow-[inset_0_0_0_100px_var(--color-raised)] autofill:[-webkit-text-fill-color:var(--color-fg)] disabled:cursor-not-allowed"
        />
      </div>

      {/* The one value the form submits */}
      <input type="hidden" name={name} value={value} />
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-4 size-px opacity-0"
          required
          value={number}
          onChange={() => {}}
          onInvalid={() => document.getElementById(id)?.focus()}
        />
      )}

      {open && (
        <div
          ref={panel}
          className="absolute left-0 top-full z-10 mt-2 w-full min-w-[18rem] origin-top overflow-hidden rounded-field border border-line-strong bg-raised shadow-panel"
        >
          <div className="m-2 flex items-center gap-2.5 rounded-[0.625rem] border border-line bg-white/[0.04] px-3 transition-colors focus-within:border-accent/60">
            <MagnifyingGlass weight="bold" aria-hidden className="size-4 shrink-0 text-fg-subtle" />
            <input
              ref={search}
              type="text"
              role="combobox"
              aria-label={searchLabel}
              aria-expanded
              aria-controls={`${uid}-list`}
              aria-activedescendant={rows[active] ? `${uid}-opt-${rows[active].code}` : undefined}
              placeholder={searchLabel}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKey}
              className="h-10 w-full bg-transparent text-[0.9375rem] font-medium text-fg placeholder:text-fg-subtle/70 focus:outline-none"
            />
          </div>
          <ul
            id={`${uid}-list`}
            role="listbox"
            aria-label="Countries"
            data-lenis-prevent=""
            className="max-h-72 overflow-y-auto overscroll-contain p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {rows.length === 0 && (
              <li className="flex flex-col items-center gap-1 px-3 py-8 text-center">
                <span className="type-small text-fg">No country matches &ldquo;{query.trim()}&rdquo;</span>
                <span className="type-caption">Try its name, its code (AE) or its dial code (971).</span>
              </li>
            )}
            {rows.map((c, i) => {
              const selected = c.code === country;
              return (
                <li
                  key={c.code}
                  id={`${uid}-opt-${c.code}`}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  onPointerMove={() => setActive(i)}
                  onClick={() => choose(c.code)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-[0.625rem] px-3 py-2.5 text-[0.9375rem] font-medium transition-colors duration-150",
                    i === active ? "bg-white/[0.07] text-fg" : "text-fg-muted",
                    selected && "text-fg",
                  )}
                >
                  <Flag code={c.code} className="h-4 w-6" />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span
                    className={cn(
                      "shrink-0 text-base font-semibold tabular-nums",
                      selected ? "text-accent" : "text-fg-subtle",
                    )}
                  >
                    {c.dial}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
