import { Doodle, type DoodleProps } from "./doodle";

// One pen pass round a five-point star: sharp tips, edges bowed slightly inward, uneven arm lengths,
// and a small overshoot past the start where the pen lifts, so it reads hand-drawn, not geometric.
const STAR =
  "M83.7 11.4 Q99.8 47.8 115.8 71.6 Q142.1 70.8 177.7 62.7 Q153.2 88 140.6 109.7 Q149.7 136.9 169.8 171.4 Q134.1 149.4 105.9 137.5 Q84.9 155.5 60.5 184.9 Q66.8 148.6 65.6 122.3 Q43.5 106.5 8.9 91.2 Q47 86.7 73.4 78.3 Q80.7 50.8 83.7 11.4 L88.7 20.4";

/** Hand-drawn five-point star. Made to hang off a page edge in a hero margin. */
export function StarFive(props: Omit<DoodleProps, "paths" | "viewBox">) {
  return <Doodle paths={[STAR]} viewBox="0 0 190 195" {...props} />;
}
