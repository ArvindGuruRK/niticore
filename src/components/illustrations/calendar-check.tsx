import { Doodle, type DoodleProps } from "./doodle";

// Drawn in order: the page, the header rule, the two binder rings, then the check mark last.
const PAGE =
  "M34 52 C 34 44, 40 40, 48 40 L 152 40 C 160 40, 166 44, 166 52 L 166 164 C 166 172, 160 176, 152 176 L 48 176 C 40 176, 34 172, 34 164 Z";
const HEADER = "M34 76 L166 76";
const RING_L = "M72 26 L72 54";
const RING_R = "M128 26 L128 54";
const CHECK = "M74 128 L94 148 L130 106";

/** Hand-drawn calendar page with a check mark: "slot booked". */
export function CalendarCheck(props: Omit<DoodleProps, "paths" | "viewBox">) {
  return <Doodle paths={[PAGE, HEADER, RING_L, RING_R, CHECK]} viewBox="20 16 160 170" {...props} />;
}
