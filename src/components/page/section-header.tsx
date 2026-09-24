import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { WarpHeading } from "@/components/motion/warp-heading";
import { cn } from "@/lib/utils";

/**
 * Section opener: WarpHeading (same as the landing sections) plus an optional lead. Pass `id` and
 * point the section's aria-labelledby at it. `children` overrides the heading markup (an accent span,
 * a doodle target) while `title` stays the plain text the warp canvas draws.
 */
export function SectionHeader({
  id,
  title,
  lead,
  align = "center",
  className,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  align?: "center" | "left";
  className?: string;
  children?: ReactNode;
}) {
  const center = align === "center";

  return (
    <div className={cn("flex flex-col gap-4", center ? "items-center text-center" : "items-start", className)}>
      <WarpHeading id={id} text={title} className={cn("type-h2 max-w-3xl text-fg", !center && "text-left")}>
        {children}
      </WarpHeading>
      {lead && (
        <Reveal>
          <p className="type-lead max-w-2xl">{lead}</p>
        </Reveal>
      )}
    </div>
  );
}
