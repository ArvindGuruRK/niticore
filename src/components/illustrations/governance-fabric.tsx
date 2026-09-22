"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The Governance Fabric: AI systems, agents, policies and regulations drift in
 * scattered, then settle into orbits around a shield core. Green pulses carry
 * evidence inward. The pointer nudges nodes so the fabric feels alive.
 *
 * Motion is imperative (canvas + rAF). No React state is touched per frame.
 * Under prefers-reduced-motion it renders one settled static frame.
 */

type Ring = {
  count: number;
  radius: number;
  speed: number;
  labels: Record<number, string>;
};

const RINGS: Ring[] = [
  { count: 6, radius: 0.36, speed: 0.05, labels: { 0: "Evidence", 2: "Controls", 4: "Policies" } },
  { count: 10, radius: 0.68, speed: -0.034, labels: { 0: "Models", 3: "Agents", 5: "Risks", 8: "Data" } },
  {
    count: 14,
    radius: 1,
    speed: 0.022,
    labels: { 1: "EU AI Act", 4: "ISO 42001", 7: "NIST AI RMF", 10: "AI Systems", 12: "Vendors" },
  },
];

type FabricNode = {
  ring: number;
  angle: number;
  scatterX: number;
  scatterY: number;
  delay: number;
  size: number;
  label?: string;
  x: number;
  y: number;
  offX: number;
  offY: number;
  velX: number;
  velY: number;
  progress: number;
  spokeTarget: number; // nearest node one ring inward, -1 until resolved
  spokeAlpha: number;
};

type Edge = { a: number; b: number }; // b === -1 targets the core
type Pulse = { a: number; b: number; t: number; speed: number }; // b === -1 targets the core

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Animated governance network on a canvas: nodes assemble, pulses travel the links, the pointer
 * repels nearby nodes. `align="right"` anchors the network to the right edge (for a split layout),
 * `align="center"` centres it in its box (for a panel or a full-width section).
 */
export function GovernanceFabric({ className, align = "right" }: { className?: string; align?: "right" | "center" }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    const accent = token("--color-signal-400", "#4ae057");
    const ink = token("--color-ink-950", "#06011f");
    const fontFamily = getComputedStyle(document.body).fontFamily;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build nodes and edges once. Geometry is resolved per frame from the canvas size.
    const nodes: FabricNode[] = [];
    const ringStart: number[] = [];
    RINGS.forEach((ring, ringIndex) => {
      ringStart.push(nodes.length);
      for (let i = 0; i < ring.count; i++) {
        nodes.push({
          ring: ringIndex,
          angle: (i / ring.count) * Math.PI * 2 + ringIndex * 0.55,
          scatterX: Math.random(),
          scatterY: Math.random(),
          delay: 0.15 + ringIndex * 0.25 + Math.random() * 0.7,
          size: ringIndex === 2 ? 3.25 : 3.75,
          label: ring.labels[i],
          x: 0,
          y: 0,
          offX: 0,
          offY: 0,
          velX: 0,
          velY: 0,
          progress: 0,
          spokeTarget: -1,
          spokeAlpha: 0,
        });
      }
    });

    // Static links: neighbours on the same ring, and the inner ring into the core.
    // Spokes between rings are resolved per frame so they stay short as rings rotate.
    const edges: Edge[] = [];
    RINGS.forEach((ring, ringIndex) => {
      const first = ringStart[ringIndex];
      for (let i = 0; i < ring.count; i++) {
        edges.push({ a: first + i, b: first + ((i + 1) % ring.count) });
        if (ringIndex === 0) edges.push({ a: first + i, b: -1 });
      }
    });

    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let radius = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Keep the whole network clear of the floating nav (top) and the ticker fade (bottom)
      const centered = align === "center";
      const topPad = centered ? 32 : width < 640 ? 24 : 116;
      const bottomPad = centered ? 32 : width < 640 ? 24 : 56;
      const availH = Math.max(height - topPad - bottomPad, 120);
      const wide = width >= 600;
      radius = Math.min(width * (wide ? 0.21 : 0.2), availH / 2 / 0.9);
      if (centered) radius = Math.min(width * 0.25, availH / 2 / 0.9, width / 2 - 76);
      // Wide: anchor to the right so the outer labels end at the container edge
      cx = centered || !wide ? width * 0.5 : width - radius - 32;
      cy = topPad + availH / 2;
    };

    const pointer = { x: -9999, y: -9999, active: false };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    const pulses: Pulse[] = [];
    let elapsed = 0;
    let nextPulseAt = 1.8;

    const render = (dt: number, animate: boolean) => {
      const k = dt * 60;
      ctx.clearRect(0, 0, width, height);
      const showOuterLabels = width >= 640;

      // Orbit guides
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      const coreIntro = easeOutCubic(clamp(elapsed / 1.2));
      RINGS.forEach((ring) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * ring.radius, radius * ring.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.globalAlpha = coreIntro;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Node positions: scatter -> orbit, plus pointer spring
      for (const node of nodes) {
        const ring = RINGS[node.ring];
        node.progress = animate ? easeOutCubic(clamp((elapsed - node.delay) / 1.7)) : 1;
        const angle = node.angle + (animate ? elapsed * ring.speed : 0);
        const homeX = cx + Math.cos(angle) * radius * ring.radius;
        const homeY = cy + Math.sin(angle) * radius * ring.radius * 0.9;
        const baseX = node.scatterX * width + (homeX - node.scatterX * width) * node.progress;
        const baseY = node.scatterY * height + (homeY - node.scatterY * height) * node.progress;

        if (animate && pointer.active) {
          const dx = baseX + node.offX - pointer.x;
          const dy = baseY + node.offY - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 150) {
            const force = ((150 - dist) / 150) * 1.1 * k;
            node.velX += (dx / dist) * force;
            node.velY += (dy / dist) * force;
          }
        }
        node.velX += -node.offX * 0.06 * k;
        node.velY += -node.offY * 0.06 * k;
        const damping = Math.pow(0.86, k);
        node.velX *= damping;
        node.velY *= damping;
        node.offX += node.velX * k;
        node.offY += node.velY * k;
        node.x = baseX + node.offX;
        node.y = baseY + node.offY;
      }

      // Spokes: each node links to its nearest neighbour one ring inward
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.ring === 0) continue;
        const first = ringStart[node.ring - 1];
        let nearest = first;
        let best = Infinity;
        for (let j = first; j < first + RINGS[node.ring - 1].count; j++) {
          const d = Math.hypot(nodes[j].x - node.x, nodes[j].y - node.y);
          if (d < best) {
            best = d;
            nearest = j;
          }
        }
        if (node.spokeTarget === -1 || !animate) {
          node.spokeTarget = nearest;
          node.spokeAlpha = 1;
        } else if (nearest !== node.spokeTarget) {
          node.spokeAlpha -= dt * 4;
          if (node.spokeAlpha <= 0) {
            node.spokeTarget = nearest;
            node.spokeAlpha = 0;
          }
        } else {
          node.spokeAlpha = Math.min(1, node.spokeAlpha + dt * 2.5);
        }
      }

      // Links
      const link = (ax: number, ay: number, bx: number, by: number, strength: number) => {
        if (strength <= 0.01) return;
        let near = 0;
        if (animate && pointer.active) {
          near = clamp(1 - Math.hypot((ax + bx) / 2 - pointer.x, (ay + by) / 2 - pointer.y) / 190);
        }
        ctx.lineWidth = 1.5 + near * 0.75;
        ctx.strokeStyle =
          near > 0.02
            ? `rgba(74,224,87,${(0.16 + near * 0.55) * strength})`
            : `rgba(190,184,235,${0.2 * strength})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      };
      for (const edge of edges) {
        const a = nodes[edge.a];
        const b = edge.b === -1 ? null : nodes[edge.b];
        link(a.x, a.y, b ? b.x : cx, b ? b.y : cy, Math.min(a.progress, b ? b.progress : coreIntro));
      }
      for (const node of nodes) {
        if (node.spokeTarget < 0) continue;
        const target = nodes[node.spokeTarget];
        link(node.x, node.y, target.x, target.y, Math.min(node.progress, target.progress) * node.spokeAlpha);
      }

      // Evidence pulses hop inward, ring by ring, and land on the core (the HTML mark overlay, not canvas)
      if (animate) {
        if (elapsed > nextPulseAt && pulses.length < 8) {
          const outer = nodes[nodes.length - 1 - Math.floor(Math.random() * RINGS[2].count)];
          if (outer.spokeTarget >= 0 && outer.progress > 0.95) {
            pulses.push({ a: nodes.indexOf(outer), b: outer.spokeTarget, t: 0, speed: 0.7 + Math.random() * 0.35 });
          }
          nextPulseAt = elapsed + 0.5 + Math.random() * 0.6;
        }
        for (let i = pulses.length - 1; i >= 0; i--) {
          const pulse = pulses[i];
          pulse.t += dt * pulse.speed;
          const from = nodes[pulse.a];
          const bx = pulse.b === -1 ? cx : nodes[pulse.b].x;
          const by = pulse.b === -1 ? cy : nodes[pulse.b].y;
          if (pulse.t >= 1) {
            pulses.splice(i, 1);
            if (pulse.b !== -1) {
              const landed = nodes[pulse.b];
              pulses.push({
                a: pulse.b,
                b: landed.ring === 0 ? -1 : landed.spokeTarget,
                t: 0,
                speed: pulse.speed,
              });
            }
            continue;
          }
          const px = from.x + (bx - from.x) * pulse.t;
          const py = from.y + (by - from.y) * pulse.t;
          const tail = Math.max(0, pulse.t - 0.22);
          const tx = from.x + (bx - from.x) * tail;
          const ty = from.y + (by - from.y) * tail;
          const trail = ctx.createLinearGradient(tx, ty, px, py);
          trail.addColorStop(0, "rgba(74,224,87,0)");
          trail.addColorStop(1, "rgba(74,224,87,0.95)");
          ctx.strokeStyle = trail;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(px, py, 2.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Nodes and labels
      ctx.font = `700 13px ${fontFamily}`;
      ctx.textBaseline = "middle";
      for (const node of nodes) {
        if (node.progress <= 0.01) continue;
        const named = Boolean(node.label);
        ctx.globalAlpha = node.progress;
        ctx.fillStyle = ink;
        ctx.strokeStyle = named ? accent : "rgba(242,240,251,0.7)";
        ctx.lineWidth = named ? 2.25 : 1.75;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (named && node.progress > 0.85 && (node.ring < 2 || showOuterLabels)) {
          const rightSide = node.x >= cx;
          ctx.textAlign = rightSide ? "left" : "right";
          ctx.fillStyle = "rgba(196,191,226,0.92)";
          ctx.fillText(node.label!, node.x + (rightSide ? 11 : -11), node.y);
        }
      }
      ctx.globalAlpha = 1;
    };

    // The core sits at (cx, cy), computed in resize(). Publish it as CSS pixel offsets on the
    // wrapper so the HTML mark overlay can sit exactly on top of it without redrawing on canvas —
    // no flashing halo, no coreFlash pulse: a plain, static mark.
    const publishCore = () => {
      wrap.style.setProperty("--core-x", `${cx}px`);
      wrap.style.setProperty("--core-y", `${cy}px`);
    };

    resize();
    publishCore();
    const observer = new ResizeObserver(() => {
      resize();
      publishCore();
      if (reduceMotion) render(0, false);
    });
    observer.observe(canvas);

    if (reduceMotion) {
      elapsed = 10;
      render(0, false);
      return () => observer.disconnect();
    }

    let raf = 0;
    let running = false;
    let last = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      render(dt, true);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Pause work when the hero is off-screen or the tab is hidden
    let inView = true;
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !document.hidden) start();
      else stop();
    });
    visibility.observe(canvas);
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      stop();
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [align]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <canvas ref={canvasRef} aria-hidden className="size-full" />
      {/* The mark sits exactly on the canvas-computed core (see publishCore in the effect above):
          a plain, static logo — no glow, no flash. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/niticore-mark.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute size-9 -translate-x-1/2 -translate-y-1/2"
        style={{ left: "var(--core-x, 50%)", top: "var(--core-y, 50%)" }}
      />
    </div>
  );
}
