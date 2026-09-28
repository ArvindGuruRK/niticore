"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * On/off toggle (role="switch"), for settings that apply straight away or on save, like cookie
 * categories. A pill track in the control shape: raised fill when off, solid green with an ink thumb
 * when on, like CheckPill. The hit area extends past the track to the 44px touch minimum. Label it
 * with aria-labelledby (or aria-label) and describe it with aria-describedby.
 */
export function Switch({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: Omit<ComponentProps<"button">, "onChange" | "role" | "type"> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "group relative inline-flex h-7 w-12 shrink-0 items-center rounded-control border transition-colors duration-300 ease-out-expo",
        // Invisible hit area: 44px tall, a little wider than the track
        "before:absolute before:-inset-x-1 before:-inset-y-2 before:content-['']",
        checked
          ? "border-accent bg-accent"
          : "border-line-strong bg-raised hover:border-white/30",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "size-5 rounded-full shadow-[0_2px_6px_rgb(2_0_14/0.45)] transition-[translate,background-color] duration-300 ease-out-expo motion-reduce:transition-none",
          checked ? "translate-x-[1.4375rem] bg-accent-ink" : "translate-x-[0.1875rem] bg-fg-subtle",
        )}
      />
    </button>
  );
}
