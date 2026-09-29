"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export function SwitchDemo() {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const rows = [
    { id: "ds-switch-necessary", label: "Strictly necessary (locked on)", checked: true, locked: true },
    { id: "ds-switch-analytics", label: "Analytics", checked: analytics, onChange: setAnalytics },
    { id: "ds-switch-marketing", label: "Marketing", checked: marketing, onChange: setMarketing },
  ];

  return (
    <div className="flex max-w-sm flex-col gap-4">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between gap-4">
          <span id={row.id} className="type-small font-semibold text-fg">
            {row.label}
          </span>
          <Switch
            aria-labelledby={row.id}
            checked={row.checked}
            disabled={row.locked}
            onCheckedChange={row.onChange}
          />
        </div>
      ))}
    </div>
  );
}
