import { Doodle, type DoodleProps } from "./doodle";

// A pen that drops straight down, turns right, steps down again and runs out uphill. The last run
// ends on the viewBox's right edge, so placed flush to the viewport edge it reads as leaving the page.
const ZIGZAG =
  "M44 6 C 43 38, 44 58, 46 70 C 47 76, 50 77, 58 75 L 124 60 C 132 58, 134 62, 132 70 L 124 116 C 122 124, 126 126, 134 122 L 200 88";

/** Hand-drawn zigzag. Place flush to the right edge (or mirrored with -scale-x-100 on the left). */
export function Zigzag(props: Omit<DoodleProps, "paths" | "viewBox">) {
  return <Doodle paths={[ZIGZAG]} viewBox="0 0 200 130" {...props} />;
}
