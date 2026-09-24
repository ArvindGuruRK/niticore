import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared control look: 12px field radius, surface fill, hairline border, green focus ring. */
const control =
  "w-full rounded-field border border-line-strong bg-surface px-4 text-base font-medium text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-colors duration-200 placeholder:text-fg-subtle/70 hover:border-white/25 focus:border-accent focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/40";

/** Label above a control, with an optional hint under it. `htmlFor` must match the control's id. */
export function Field({
  label,
  htmlFor,
  hint,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="type-small font-semibold text-fg">
        {label}
        {optional && <span className="font-medium text-fg-subtle"> (optional)</span>}
      </label>
      {children}
      {hint && <p className="type-caption">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-32 resize-y py-3", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "h-12 appearance-none pr-11", className)} {...props}>
        {children}
      </select>
      {/* Chevron: the native arrow is hidden so the control matches the inputs */}
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
      >
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** A checkbox styled as a toggle pill: pick several from a set (e.g. frameworks). */
export function CheckPill({ label, className, ...props }: Omit<ComponentProps<"input">, "type"> & { label: string }) {
  return (
    <label className={cn("cursor-pointer", className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="inline-flex h-10 items-center rounded-control border border-line-strong bg-surface px-4 text-sm font-semibold text-fg-muted transition-colors duration-200 hover:border-white/25 hover:text-fg peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/60">
        {label}
      </span>
    </label>
  );
}
