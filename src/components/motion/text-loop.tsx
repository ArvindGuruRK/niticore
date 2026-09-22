"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const EDGE_PAD = 6;
const FALLBACK_W = 1200;
const FALLBACK_H = 200;

type Shape = "wave" | "circle" | "infinity" | "arch" | "line";

/**
 * Builds the path in the SAME pixel units as the rendered box (viewBox = actual width/height,
 * no preserveAspectRatio scaling). A fixed viewBox scaled to fit a wide, short container would
 * either crop the wave's peaks (slice) or shrink the whole thing to fit the height (meet) — sizing
 * to the real box is what keeps the ribbon and wave fully visible at any width.
 */
const buildPath = (shape: Shape, curviness: number, ribbonWidth: number, width: number, height: number) => {
  const cx = width / 2;
  const cy = height / 2;
  const c = Math.max(0, curviness);
  const room = Math.max(10, cy - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);
  const bleed = Math.max(width * 0.27, 80);

  switch (shape) {
    case "circle": {
      const r = Math.min(90 + c * 0.95, room, cx - EDGE_PAD);
      return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
    }
    case "infinity": {
      const r = Math.min(150 + c * 1.4, cx - EDGE_PAD);
      const h = Math.min(60 + c * 0.95, room);
      return [
        `M ${cx} ${cy}`,
        `C ${cx + r * 0.55} ${cy - h} ${cx + r} ${cy - h} ${cx + r} ${cy}`,
        `C ${cx + r} ${cy + h} ${cx + r * 0.55} ${cy + h} ${cx} ${cy}`,
        `C ${cx - r * 0.55} ${cy - h} ${cx - r} ${cy - h} ${cx - r} ${cy}`,
        `C ${cx - r} ${cy + h} ${cx - r * 0.55} ${cy + h} ${cx} ${cy}`,
        "Z",
      ].join(" ");
    }
    case "arch": {
      const rise = Math.min(120 + c * 1.1, room * 2);
      return `M ${EDGE_PAD} ${cy + rise / 2} Q ${cx} ${cy - rise * 1.5} ${width - EDGE_PAD} ${cy + rise / 2}`;
    }
    case "line":
      return `M ${-bleed} ${cy} L ${width + bleed} ${cy}`;
    case "wave":
    default: {
      const a = Math.min(c * 2.2, room);
      const step = bleed;
      const span = width + bleed * 2;
      const segments = Math.max(2, Math.ceil(span / step));
      const commands = [`M ${-bleed} ${cy}`, `Q ${-bleed + step / 2} ${cy - a} ${-bleed + step} ${cy}`];
      for (let i = 2; i <= segments; i += 1) {
        commands.push(`T ${-bleed + step * i} ${cy}`);
      }
      return commands.join(" ");
    }
  }
};

type TextLoopProps = {
  text?: string;
  shape?: Shape;
  path?: string;
  speed?: number;
  direction?: "forward" | "reverse";
  separator?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  uppercase?: boolean;
  color?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Repeats `text` along an SVG path (wave, circle, infinity, arch or line) with a solid
 * ribbon behind it. Adapted from React Bits' TextLoop onto this project's gsap wrapper.
 */
export function TextLoop({
  text = "NitiCore",
  shape = "wave",
  path,
  speed = 90,
  direction = "forward",
  separator = "✦",
  curviness = 90,
  fontSize = 46,
  fontWeight = 800,
  letterSpacing = 2,
  uppercase = true,
  color = "#ffffff",
  ribbon = true,
  ribbonColor = "#5227FF",
  ribbonWidth = 86,
  pauseOnHover = true,
  className = "",
  style = {},
}: TextLoopProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const headRef = useRef<SVGTextPathElement>(null);
  const tailRef = useRef<SVGTextPathElement>(null);

  const [box, setBox] = useState({ width: FALLBACK_W, height: FALLBACK_H });
  const [metrics, setMetrics] = useState({ length: 0, reps: 1 });

  const rawId = useId();
  const pathId = `text-loop-${rawId.replace(/:/g, "")}`;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const measureBox = () => {
      const rect = root.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBox((prev) =>
          prev.width === rect.width && prev.height === rect.height ? prev : { width: rect.width, height: rect.height },
        );
      }
    };

    measureBox();
    const ro = new ResizeObserver(measureBox);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const d = useMemo(
    () => path || buildPath(shape, curviness, ribbonWidth, box.width, box.height),
    [path, shape, curviness, ribbonWidth, box.width, box.height],
  );

  const unit = useMemo(() => {
    const base = uppercase ? String(text).toUpperCase() : String(text);
    const gap = separator ? ` ${separator} ` : "   ";
    return `${base}${gap}`;
  }, [text, separator, uppercase]);

  const textStyle = useMemo(
    () => ({ fontSize: `${fontSize}px`, fontWeight, letterSpacing: `${letterSpacing}px` }),
    [fontSize, fontWeight, letterSpacing],
  );

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    const measureEl = measureRef.current;
    if (!pathEl || !measureEl) return undefined;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      let length = 0;
      let unitWidth = 0;
      try {
        length = pathEl.getTotalLength();
        unitWidth = measureEl.getComputedTextLength();
      } catch {
        return;
      }
      if (!length) return;

      const reps = unitWidth > 0 ? Math.max(1, Math.round(length / unitWidth)) : 1;
      setMetrics((prev) => (prev.length === length && prev.reps === reps ? prev : { length, reps }));
    };

    measure();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [d, unit, fontSize, fontWeight, letterSpacing]);

  useLayoutEffect(() => {
    const { length } = metrics;
    const head = headRef.current;
    const tail = tailRef.current;
    if (!head || !tail || !length) return undefined;

    const apply = (offset: number) => {
      const partner = offset >= 0 ? offset - length : offset + length;
      head.setAttribute("startOffset", String(offset));
      tail.setAttribute("startOffset", String(partner));
    };

    apply(0);

    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || speed <= 0) return undefined;

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: direction === "reverse" ? -length : length,
      duration: length / speed,
      ease: "none",
      repeat: -1,
      onUpdate: () => apply(state.offset),
    });

    const root = rootRef.current;
    const pause = () => tween.pause();
    const resume = () => tween.resume();

    if (pauseOnHover && root) {
      root.addEventListener("pointerenter", pause);
      root.addEventListener("pointerleave", resume);
    }

    return () => {
      tween.kill();
      if (pauseOnHover && root) {
        root.removeEventListener("pointerenter", pause);
        root.removeEventListener("pointerleave", resume);
      }
    };
  }, [metrics, speed, direction, pauseOnHover]);

  const loopText = unit.repeat(metrics.reps);
  const fitLength = metrics.length || undefined;

  return (
    <div ref={rootRef} className={cn("relative w-full overflow-hidden", className)} style={style}>
      <svg
        className="block h-full w-full"
        viewBox={`0 0 ${box.width} ${box.height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={text}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={d}
          fill="none"
          stroke={ribbon ? ribbonColor : "none"}
          strokeWidth={ribbon ? ribbonWidth : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text ref={measureRef} className="invisible pointer-events-none" style={textStyle} aria-hidden="true">
          {unit}
        </text>

        <text
          className="select-none"
          style={textStyle}
          fill={color}
          dominantBaseline="central"
          aria-hidden="true"
          textLength={fitLength}
          lengthAdjust="spacing"
        >
          <textPath ref={headRef} href={`#${pathId}`} startOffset={0}>
            {loopText}
          </textPath>
        </text>

        <text
          className="select-none"
          style={textStyle}
          fill={color}
          dominantBaseline="central"
          aria-hidden="true"
          textLength={fitLength}
          lengthAdjust="spacing"
        >
          <textPath ref={tailRef} href={`#${pathId}`} startOffset={0}>
            {loopText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
