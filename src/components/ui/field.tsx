import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared control look: 12px field radius, raised fill (one step lighter than panels, so a field reads
 * on a card as well as on the page), hairline border, green focus ring. Browser autofill is repainted
 * to the same fill and text colour so it never flashes white or blue.
 */
const control =
  "w-full rounded-field border border-line-strong bg-raised px-4 text-base font-medium text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-colors duration-200 placeholder:text-fg-subtle/70 hover:border-white/25 focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/40 aria-[invalid=true]:border-status-risk/70 autofill:shadow-[inset_0_0_0_100px_var(--color-raised)] autofill:[-webkit-text-fill-color:var(--color-fg)]";

/**
 * Label above a control, with an optional hint under it. `htmlFor` must match the control's id.
 * `required` adds a violet asterisk to the label (the control's own `required` attribute tells
 * screen readers). `error` shows a message under the control with the id `${htmlFor}-error`; point the control's
 * aria-describedby at it and set aria-invalid, so screen readers read the message with the field.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="type-small font-semibold text-fg">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-tertiary">
            *
          </span>
        )}
        {optional && <span className="font-medium text-fg-subtle"> (optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="type-caption">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="type-small text-status-risk">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-32 resize-y py-3", className)} {...props} />;
}

/**
 * A checkbox styled as a toggle pill, for picking several from a set (e.g. frameworks). Off: raised
 * fill, muted text and an empty circle. On: solid green, dark text, and the circle becomes a check.
 * The icon slot is always there, so a pill never changes width when toggled and a wrapped row of
 * pills never reflows. Keyboard focus shows the green ring.
 */
export function CheckPill({ label, className, ...props }: Omit<ComponentProps<"input">, "type"> & { label: string }) {
  return (
    <label className={cn("group cursor-pointer", className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="inline-flex h-10 items-center gap-2 rounded-control border border-line-strong bg-raised px-4 text-sm font-semibold text-fg-muted transition-colors duration-200 hover:border-white/25 hover:text-fg peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-checked:hover:border-accent peer-checked:hover:text-accent-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas">
        <span aria-hidden className="-ml-0.5 grid size-4 shrink-0 place-items-center">
          {/* Off: an empty circle */}
          <span className="size-3.5 rounded-full border-[1.5px] border-current opacity-60 group-has-[:checked]:hidden" />
          {/* On: a check in the same slot */}
          <svg
            viewBox="0 0 16 16"
            className="hidden size-4 group-has-[:checked]:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.5l3.2 3L13 4.5" />
          </svg>
        </span>
        {label}
      </span>
    </label>
  );
}
