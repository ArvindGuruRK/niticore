/**
 * Governance Readiness™ scoring (docs/content/04 §1). Levels and their 0 to 100 bands come from
 * src/content/assessments.json; nothing here invents a figure.
 */
export type Level = {
  level: number;
  name: string;
  min: number;
  max: number;
  summary: string;
  traits: string;
  platform: string;
  note: string | null;
};

/** Window event that selects an assessment in the suite index; `detail` is the assessment id. */
export const SELECT_ASSESSMENT = "niticore:select-assessment";

/** The level whose band holds `score`. */
export function levelFor(levels: Level[], score: number) {
  const s = Math.round(score);
  return levels.find((l) => s >= l.min && s <= l.max) ?? levels[levels.length - 1];
}

/**
 * Score for an answer. Answer i describes maturity level i + 1, so it scores the middle of that
 * level's band. A dimension answered at level 3 scores inside Operational, and an organisation that
 * answers level 3 everywhere lands in Operational too.
 */
export function answerScore(levels: Level[], index: number) {
  const l = levels[Math.min(index, levels.length - 1)];
  return Math.round((l.min + l.max) / 2);
}
