import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Pill label for the hero. Sections use eyebrows sparingly: at most one per three sections. */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "type-label inline-flex items-center rounded-control border border-accent/25 bg-accent/[0.07] px-3.5 py-1.5 text-accent",
        className,
      )}
      {...props}
    />
  );
}
