import { Doodle, type DoodleProps } from "./doodle";

// Two edges of a large four-point star that meet at a tip: meant to bleed off a viewport edge
const ARC = "M100 0 C 70 12, 40 28, 0 30 C 40 40, 62 78, 78 150";

/** Partial star that hangs off the page edge. Place it flush to the right edge with a negative offset. */
export function StarArc(props: Omit<DoodleProps, "paths" | "viewBox">) {
  return <Doodle paths={[ARC]} viewBox="0 0 100 150" {...props} />;
}
