"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NO_REDUCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Custom dropdown in the design system's look (the native <select> menu can't be styled). A trigger
 * that matches the text fields opens a raised panel of options; the chosen one is green with a check.
 * - Keyboard: Enter, Space or the arrows open it; arrows move, Home and End jump, typing a letter
 *   jumps to the next option starting with it, Enter or Space picks, Escape or Tab closes.
 * - Clicking outside closes it. The panel eases open (off under reduced motion).
 * - The panel shows every option at full height, with no scrollbar. Only a list taller than 70% of
 *   the screen scrolls, and it opts out of Lenis so the wheel scrolls the list, not the page.
 * - Forms: a visually hidden input carries `name` and `required`, so native form validation and
 *   FormData work as with a real <select>.
 * ARIA: button with aria-haspopup="listbox"; the listbox takes focus and tracks the active option
 * with aria-activedescendant.
 */
export function Select({
  id,
  name,
  options,
  placeholder,
  required,
  invalid,
  describedBy,
  className,
}: {
  id: string;
  name: string;
  options: string[];
  placeholder: string;
  required?: boolean;
  /** Marks the trigger invalid (red border) for a form error */
  invalid?: boolean;
  /** Id of the element describing the trigger, e.g. its error message */
  describedBy?: string;
  className?: string;
}) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  // Ease the panel open
  useGSAP(
    () => {
      if (!open) return;
      list.current?.focus({ preventScroll: true });
      if (!window.matchMedia(NO_REDUCE).matches) {
        gsap.fromTo(
          list.current,
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

  // Keep the active option in view inside the scrollable panel
  useEffect(() => {
    if (open) list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };
  const choose = (index: number) => {
    setValue(options[index]);
    setOpen(false);
    trigger.current?.focus();
  };

  const onTriggerKey = (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      const current = value ? options.indexOf(value) : 0;
      openAt(e.key === "ArrowUp" && !value ? options.length - 1 : current);
    }
  };

  const onListKey = (e: KeyboardEvent) => {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, last));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") {
      setOpen(false);
      trigger.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
      return;
    } else if (e.key.length === 1) {
      // Typeahead: next option starting with the typed letter
      const k = e.key.toLowerCase();
      const order = [...options.keys()].map((i) => (active + 1 + i) % options.length);
      const hit = order.find((i) => options[i].toLowerCase().startsWith(k));
      if (hit !== undefined) setActive(hit);
    } else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        // A button can't carry aria-invalid; the linked error message is read out instead
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openAt(value ? options.indexOf(value) : 0))}
        onKeyDown={onTriggerKey}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-3 rounded-field border border-line-strong bg-raised px-4 text-left text-base font-medium transition-colors duration-200 hover:border-white/25 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60",
          invalid && !open && "border-status-risk/70",
          open && "border-accent ring-2 ring-accent/40",
          value ? "text-fg" : "text-fg-subtle",
        )}
      >
        <span className="truncate">{value ?? placeholder}</span>
        <CaretDown
          weight="bold"
          aria-hidden
          className={cn("size-4 shrink-0 text-fg-subtle transition-transform duration-300 ease-out-expo", open && "rotate-180")}
        />
      </button>

      {/* Carries the value into the form, with native required validation */}
      <input
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-4 size-px opacity-0"
        name={name}
        required={required}
        value={value ?? ""}
        onChange={() => {}}
        onInvalid={() => trigger.current?.focus()}
      />

      {open && (
        <ul
          ref={list}
          id={`${uid}-list`}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={id}
          aria-activedescendant={`${uid}-opt-${active}`}
          onKeyDown={onListKey}
          // Lenis owns wheel scrolling; this opts the panel out so a long list can still scroll itself
          data-lenis-prevent=""
          className="absolute inset-x-0 top-full z-10 mt-2 max-h-[70vh] origin-top overflow-y-auto overscroll-contain rounded-field border border-line-strong bg-raised p-1.5 shadow-panel [scrollbar-width:none] focus:outline-none [&::-webkit-scrollbar]:hidden"
        >
          {options.map((option, i) => {
            const selected = option === value;
            return (
              <li
                key={option}
                id={`${uid}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                onPointerMove={() => setActive(i)}
                onClick={() => choose(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-[0.5rem] px-3 py-2.5 text-[0.9375rem] font-medium transition-colors duration-150",
                  i === active ? "bg-white/[0.07] text-fg" : "text-fg-muted",
                  selected && "text-accent",
                )}
              >
                {option}
                {selected && <Check weight="bold" aria-hidden className="size-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
