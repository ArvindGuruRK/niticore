import { Doodle, type DoodleProps } from "./doodle";

// The box (a curved rim so the opening reads in perspective, tapering to a flat base), two bands
// running left to right across its front like a real popcorn box's label stripes, and one
// scalloped stroke tracing the popped kernels piled over the rim.
const BOX = "M18,55 Q50,50 82,55 L72,110 L28,110 Z";
const BAND_1 = "M21.8,76 L78.2,76";
const BAND_2 = "M24.5,91 L75.5,91";
const KERNELS = "M16,54 C10,46 12,32 22,30 C20,20 34,16 40,24 C42,14 58,14 60,24 C66,16 80,20 78,30 C88,32 90,46 84,54";

/** Popcorn box, line-art. A demo/video-adjacent companion to the hero's doodle set. */
export function Popcorn(props: Omit<DoodleProps, "paths" | "viewBox">) {
  return <Doodle paths={[BOX, BAND_1, BAND_2, KERNELS]} viewBox="0 0 100 120" {...props} />;
}
