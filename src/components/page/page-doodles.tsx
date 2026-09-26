import { Drift } from "@/components/illustrations/drift";
import { Petal } from "@/components/illustrations/petal";
import { StarFive } from "@/components/illustrations/star-five";
import { Zigzag } from "@/components/illustrations/zigzag";
import { cn } from "@/lib/utils";

export type DoodleShape = "star" | "petal" | "zigzag";

/** Draw order across the hero: heading words, then the sparkle, then the two edge shapes. */
const DRAW_AT = { left: 0.9, right: 1.2 } as const;

function Shape({ shape, side }: { shape: DoodleShape; side: "left" | "right" }) {
  const common = { trigger: "load" as const, delay: DRAW_AT[side], duration: 1.6, strokeWidth: 3 };
  // The zigzag's last run ends on its right edge, so on the left it is mirrored to exit that side
  if (shape === "zigzag") return <Zigzag {...common} className={cn("w-full", side === "left" && "-scale-x-100")} />;
  if (shape === "petal") return <Petal {...common} className="w-full" />;
  return <StarFive {...common} className="w-full" />;
}

/**
 * Hand-drawn line art for the inner-page heroes, after the Postiz reference: one shape bleeding off
 * each viewport edge, at different heights so the pair reads as scattered rather than mirrored.
 * Violet (text-tertiary) like every illustration on the site. Each page passes its own pair, so the
 * five heroes share one language without repeating. Hidden below lg: on phones and tablets
 * there is no room beside the centred copy, so the shapes ran over the headline and lead.
 */
export function PageDoodles({ left, right }: { left: DoodleShape; right: DoodleShape }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden text-tertiary lg:block">
      <Drift
        delay={DRAW_AT.left + 1.6}
        className={cn(
          "absolute top-[52%] w-[clamp(5rem,11vw,12.5rem)]",
          left === "zigzag" ? "left-0" : "left-[-3.5vw] -rotate-12",
        )}
      >
        <Shape shape={left} side="left" />
      </Drift>
      <Drift
        delay={DRAW_AT.right + 1.6}
        amount={8}
        className={cn(
          "absolute top-[20%] w-[clamp(5rem,11vw,12.5rem)]",
          right === "zigzag" ? "right-0" : "right-[-3.5vw] rotate-12",
        )}
      >
        <Shape shape={right} side="right" />
      </Drift>
    </div>
  );
}
