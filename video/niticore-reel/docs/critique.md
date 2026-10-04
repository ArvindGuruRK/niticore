# Critique log: niticore-reel

Brief: the original goal (a pure motion-graphics reel with no product components or website
styling, rich VO) plus the later asks that don't conflict with it (India claim + logo open,
grid animation, Sora + Manrope, only the EU AI Act and ISO/IEC 42001 named, niticore.ai).

## Round 1 (stills b34-54)
| hook | read | motion | variety | brand | sync | min |
|  8   |  6   |   6    |    7    |   8   |  7   |  6  |
1. [b36-90] The AI systems vanished from the middle act: `tierK` was called without `u`, so every
   block height was NaN. -> fixed; blocks, threads and tags return.
2. [b56-68] Coral risk columns stay up through all of Comply, so the world reads alarming while
   the voice talks about control. -> risk heights calm as the controls map (b59-62.4).
3. [b41-50] Radar tags and the reticle could not be judged with the blocks missing. -> re-checked
   after fix 1: tags and the SHADOW AI → REGISTERED lock read.

## Round 2 (contact sheets, both formats)
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   8   |  7   |  7  |
1. [b68-77, 9x16] The portrait floor tilt pushed the gate and person-glyph under the caption. ->
   no tilt during the close guard shots.
2. [b56-68, 9x16] The monoliths at x = ±10 sat off the frame edges. -> ±5.5 in portrait.
3. [b70-76, 9x16] World tags clipped at the right edge. -> tags flip to the left near the edge.

## Round 3 (9:16 stills, audio)
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  8   |  8  |
sync.py: 20/33 within 20 ms (median 8.6 ms); misses are soft accents under the voice and
peak-anchored whooshes, all placed on exact picture times. -14.1 LUFS, -1.1 dBTP.
No product UI, cursor or website component in any frame (verified: no UI code in film.js).
Verdict: READY
