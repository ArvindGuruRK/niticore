/**
 * The three solid card tones (see the card-* utilities in globals.css). `light` is the SpotlightCard
 * disc that follows the cursor, in a contrast colour: green on blue and violet cards, violet on green
 * cards (space-separated RGB).
 */
export const CARD_TONES = {
  blue: { className: "card-blue", light: "31 138 49" },
  violet: { className: "card-violet", light: "31 138 49" },
  green: { className: "card-green", light: "139 104 245" },
} as const;

export type CardTone = keyof typeof CARD_TONES;
