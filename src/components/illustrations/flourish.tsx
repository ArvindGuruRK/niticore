import { Doodle, type DoodleProps } from "./doodle";

const LOOPS =
  "M4 40 C 70 34, 128 78, 138 132 C 146 182, 78 204, 44 174 C 16 148, 44 112, 112 108 C 176 104, 232 156, 228 214 C 224 262, 184 274, 156 258 C 130 242, 152 190, 204 166 C 246 148, 286 160, 316 192";

/** Looping flourish, the loose curl from the illustration set. Use as a pointer or a page accent. */
export function Flourish(props: Omit<DoodleProps, "paths" | "viewBox">) {
  return <Doodle paths={[LOOPS]} viewBox="0 0 320 300" {...props} />;
}
