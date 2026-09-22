import { Doodle, type DoodleProps } from "./doodle";

// A front-on clapperboard: the slate body, a divider inside it, the top bar hinged at the left and
// held open, three cross-stripes on the bar standing in for its black/white bands, and the hinge
// pin where bar and body meet.
const BODY = "M10,42 L90,42 L90,90 L10,90 Z";
const DIVIDER = "M10,60 L90,60";
const BAR = "M10,42 L94,24 L94,10 L10,28 Z";
const STRIPE_1 = "M26.8,38.4 L26.8,24.4";
const STRIPE_2 = "M52,33 L52,19";
const STRIPE_3 = "M77.2,27.6 L77.2,13.6";
const HINGE = "M10,35 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0";

/** Open film clapperboard, line-art. A demo/video-adjacent companion to the hero's doodle set. */
export function FilmClap(props: Omit<DoodleProps, "paths" | "viewBox">) {
  return (
    <Doodle
      paths={[BODY, DIVIDER, BAR, STRIPE_1, STRIPE_2, STRIPE_3, HINGE]}
      viewBox="0 0 100 100"
      {...props}
    />
  );
}
