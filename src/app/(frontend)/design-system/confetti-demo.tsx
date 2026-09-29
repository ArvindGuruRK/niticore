"use client";

import { celebrate } from "@/components/motion/confetti";
import { Button } from "@/components/ui/button";

export function ConfettiDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => celebrate()}>
        Celebrate
      </Button>
    </div>
  );
}
