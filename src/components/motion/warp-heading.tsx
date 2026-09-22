"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";
import { WarpText } from "@/components/motion/warp-text";
import { cn } from "@/lib/utils";

const WARP_QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Subscribes to whether the pointer/motion environment supports the hover effect at all — a fine
 *  pointer that can hover, with no reduced-motion preference. useSyncExternalStore (not
 *  useState+useEffect) so the SSR pass and the first client paint agree (both "off") and React
 *  reconciles the real value itself post-hydration, instead of us hand-rolling that with setState. */
function useWarpEnabled() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(WARP_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WARP_QUERY).matches,
    () => false,
  );
}

/**
 * WarpText's canvas rasteriser draws `text` as a single line (it only breaks on literal "\n") and
 * shrinks the font until that one line fits the box — so if the real heading wraps onto 2 lines at
 * the current viewport width, the WarpText version renders 1 line at a noticeably smaller size
 * instead of matching. Rather than guess wrap points per breakpoint, this measures where the browser
 * actually broke the live heading (via Range.getClientRects() on its text node, grouping words by
 * which line box they land in) and feeds WarpText that same break as an explicit "\n" — so the hover
 * state is always pixel-identical to the real line breaks, at any width, in any font-loading state.
 *
 * Returns `null` until the first real measurement lands. That's deliberate: `WarpText` must never
 * mount with a guessed/placeholder value, because it does an *immediate* WebGL rasterize on mount —
 * if that first rasterize ever ran with the raw, un-wrapped `text`, it would briefly (or, on a slow
 * paint, visibly) render as one shrunk-to-fit line before the corrected value replaces it. Gating the
 * whole overlay on a non-null result means WarpText only ever mounts once, already correct.
 */
function useWrappedText(ref: RefObject<HTMLElement | null>, text: string, enabled: boolean) {
  const [wrapped, setWrapped] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const measure = () => {
      const textNode = el.firstChild;
      if (el.childNodes.length !== 1 || textNode?.nodeType !== Node.TEXT_NODE) {
        setWrapped(text);
        return;
      }

      const words = text.split(" ");
      const range = document.createRange();
      const lines: string[][] = [];
      let lastTop: number | null = null;
      let cursor = 0;

      for (const word of words) {
        range.setStart(textNode, cursor);
        range.setEnd(textNode, cursor + word.length);
        const rect: DOMRect | undefined = range.getClientRects()[0];
        let lineTop: number = lastTop ?? 0;
        if (rect) lineTop = Math.round(rect.top);

        if (lastTop === null || Math.abs(lineTop - lastTop) > 1) {
          lines.push([word]);
          lastTop = lineTop;
        } else {
          lines[lines.length - 1].push(word);
        }

        cursor += word.length + 1;
      }

      setWrapped(lines.map((line) => line.join(" ")).join("\n"));
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => resizeObserver.disconnect();
  }, [ref, text, enabled]);

  return enabled ? wrapped : null;
}

/**
 * Section `<h2>` that swaps to the React Bits WarpText glass-distortion effect on hover. The real
 * heading text never leaves the DOM or changes size — it just fades out while an absolutely
 * positioned, exactly-same-box WarpText canvas fades in over it, so no section's layout, height, or
 * wrap point moves on hover. WebGL only mounts for pointers that can actually hover (skips touch)
 * and only under `prefers-reduced-motion: no-preference` — same gating TiltCard uses for its pointer
 * effect (see FINE_POINTER/NO_REDUCE there), applied here via matchMedia since the swap has to
 * decide whether to render the canvas at all, not just gate a GSAP timeline.
 */
export function WarpHeading({
  as: Tag = "h2",
  id,
  text,
  className,
  color = "#f2f0fb",
  children,
}: {
  as?: ElementType;
  id?: string;
  text: string;
  className?: string;
  /** Text fill colour baked into the WarpText canvas texture; defaults to the design system's --color-fg. */
  color?: string;
  /** Optional markup to render instead of the plain string (e.g. a <br /> line break) — `text` still
   *  drives the WarpText canvas texture and must be the plain-text equivalent. */
  children?: ReactNode;
}) {
  const warpEnabled = useWarpEnabled();
  const textRef = useRef<HTMLSpanElement>(null);
  const wrappedText = useWrappedText(textRef, text, warpEnabled && !children);
  const warpReady = warpEnabled && wrappedText !== null;

  return (
    <Tag id={id} className={cn("group relative isolate", className)}>
      <span ref={textRef} className={cn("block transition-opacity duration-300", warpReady && "group-hover:opacity-0")}>
        {children ?? text}
      </span>
      {warpEnabled && wrappedText !== null ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100"
        >
          <WarpText
            text={wrappedText}
            color={color}
            fontFamily="inherit"
            fontWeight={600}
            letterSpacing="inherit"
            lineHeight="inherit"
            fontSize="1em"
            // wrappedText already mirrors the real heading's own line breaks inside a box sized to
            // its exact bounding rect, so there's nothing left to "fit": the text is already the
            // right size. Disable WarpText's own auto-fit shrink — its width estimate (summed
            // per-character ctx.measureText() calls) reliably overshoots the browser's real, kerned
            // text width by a few percent, which otherwise shrinks text that already fits perfectly.
            fitText={false}
            warpStrength={0.08}
            warpScale={1.7}
            speed={0.55}
            pointerInfluence={0.42}
            pointerStrength={0.38}
            refraction={0.018}
            ripple
            className="size-full"
          />
        </span>
      ) : null}
    </Tag>
  );
}
