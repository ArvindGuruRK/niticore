"use client";

import { useState } from "react";
import { LiveNumber } from "@/components/motion/live-number";
import { RadarChart } from "@/components/motion/radar-chart";
import { Button } from "@/components/ui/button";

/** docs/content/02 §5 sub-domain figures. "Rotate" shifts them one axis round so the shape morphs. */
const LABELS = ["AI Inventory", "AI Literacy", "Policy Coverage", "Risk Assessment", "Control Effectiveness", "Evidence Readiness"];
const VALUES = [92, 84, 81, 76, 72, 68];

export function RadarDemo() {
  const [shift, setShift] = useState(0);
  const values = VALUES.map((_, i) => VALUES[(i + shift) % VALUES.length]);
  const active = shift % LABELS.length;

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,26rem)_1fr]">
      <RadarChart
        label="Demo radar"
        axes={LABELS.map((label, i) => ({ label, value: values[i] }))}
        rings={[30, 50, 70, 85, 100]}
        active={active}
      />
      <div className="flex flex-col items-start gap-4">
        <p className="flex items-baseline gap-2">
          <LiveNumber value={values[active]} className="type-display text-fg" />
          <span className="type-body">{LABELS[active]}</span>
        </p>
        <Button variant="secondary" onClick={() => setShift((s) => s + 1)}>
          Rotate values
        </Button>
      </div>
    </div>
  );
}
