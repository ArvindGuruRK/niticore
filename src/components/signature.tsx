"use client";

import { useEffect } from "react";

// Module-level so the dev-mode double effect (Strict Mode) and client navigations log it only once
let signed = false;

/**
 * Easter egg for anyone who opens the browser's developer tools: a plain signed note in the
 * console. Renders nothing on the page.
 */
export function Signature() {
  useEffect(() => {
    if (signed) return;
    signed = true;
    console.log("Built by RKAY");
  }, []);

  return null;
}
