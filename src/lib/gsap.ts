"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Mobile browsers resize the viewport as the URL bar collapses. Without this, every such
// resize refreshes all triggers mid-scroll and pinned sections jump. Orientation changes
// and real width changes still refresh.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, useGSAP };
