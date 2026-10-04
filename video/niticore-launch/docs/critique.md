# Critique log: niticore-launch

## Round 1
| hook | read | motion | variety | brand | sync | min |
|  7   |  6   |   7    |    7    |   8   |  7   |  6  |

Evidence: b0 "Move" already slamming over moving lanes (good) but the lanes are thin and the
type sits mid-frame at 60 % width. phone.png: stage leads (42 px) are ~10 px tall at phone size;
the product windows in 9:16 are thumbnails (whole 2000 px screens squeezed into 936 px). Springs,
overlap and motion blur are right; Govern b32.5-35 holds a mostly-white pan. Four stages share the
"title left / window right" layout. Real colours, Sora + Manrope, the wordmark from its own SVG,
real screens throughout. sync.py: 64/74 within 20 ms; the end-card bell/tick/blip are buried
under the final crash (-230 / -464 / -699 ms = undetected).

Worst three (most damaging first):
1. [b16-50, both formats, worst in 9x16] The product is shown too small to read: cameras frame
   1100-1700 image px at once, so the cursor's actions (typing, ticks, Upload) are specks.
   -> FIX: every interaction moment gets a close camera (16:9 s >= 1.15, 9:16 s >= 1.25) that
   follows the cursor target, then pulls back; stage leads 42 -> 48 px (16:9), 50 -> 54 (9:16).
2. [b32.5-37, 16x9 + 9x16] Govern's second half and Evidence's opening show empty white UI
   (dead air), and in 9:16 the five framework chips pile on top of each other.
   -> FIX: Govern pulls back to list + button in one frame (s 0.72, fx 1250); Evidence opens on
   the control names + status column, then pushes to Upload; 9:16 chips become a vertical
   stack under the evidence chip with links on the left.
3. [b73-75, audio] End-card accents inaudible; [b16.4] typing starts 38 ms early.
   -> FIX: sparkle bells gain 0.7, tagline tick -> blip gain 0.5, URL blip gain 0.6; type hit at
   16.45 with n 24.

Also: 9:16 hook sits in the top half (move block down ~220 px); 9:16 end-card outline star
overlaps the wordmark (move to y 1180); white patches behind "Clinical Decision Copilot" are a
shade off the panel (sample the real panel colour in init()).

Checks failed: variety (layout repeats across 4 stages).
Verdict: ANOTHER ROUND

## Round 2
| hook | read | motion | variety | brand | sync | min |
|  7   |  8   |   8    |    8    |   9   |  8   |  7  |

Evidence: close cameras fixed the product read (typed name, ticks, Upload, the Classify cards
after the push-in are all legible in phone.png). The dive now opens a glowing sparkle portal
onto the network. Improve has its own composition (title row + wide close band). Assess panel
copy no longer clips. sync.py 68/74 within 20 ms, median 2.4 ms; the 6 outliers are whooshes
whose peak (not start) sits on the hit, plus b72 at -20 ms (the score's own kick a frame early).

Worst three (most damaging first):
1. [b0-4, both] The hook is type over thin lanes on a locked frame; it needs more force for a
   portfolio opener. -> FIX: lanes 2-6 px and brighter, a slow camera push (1 -> 1.05) over
   b0-4, a hard shake on the brake at b4.
2. [b40-42, 9x16] "5x" and its label sit on the dimmed table and read busy. -> FIX: fade the
   window to 12 % as the 5x lands in 9:16.
3. [b49.7-51, both] The seven stage words fly out from the centre and their knock-out plates
   blot "A closed loop, not a one-time checkpoint." -> FIX: words arrive inward from 1.5x the
   ring radius, so nothing crosses the centre copy.

Checks failed: none.
Verdict: ANOTHER ROUND

## Round 3
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  8   |  8  |

Evidence: strip_brake shows lanes at full speed under a slow push, line 2 skidding in, leaning
and settling with the shake on b4. strip_whip: Assess streaks right and Govern enters from the
left, motion continuous. strip_loop: the words arrive inward and the centre copy stays clean;
the ring closes on Discover. phone.png / phone_9x16.png: every stage word and lead reads; the
product interactions read in 16:9 and are legible (small) in 9:16. Every frame uses the real
screens, the wordmark's own paths, the site's grid, card tones and violet doodles; one green
accent per heading. sync.py 68/74 within 20 ms (median 2.4 ms); outliers are peak-anchored
whooshes by design; -14.0 LUFS, -1.1 dBTP.

Remaining (not blocking):
1. [9x16, b16-36] Product windows are 936 px wide, so app text is ~20 px; a taller window
   (y 700-1490) with a 1.4x camera would read better on a phone.
2. [b72] The score's final kick lands ~20 ms before the picture hit; nudge the kick +1 frame.
3. [b46.6-47.1] The Monitor -> Improve hand-off is a plain slide; a match-cut on the chart's
   green tracer into the first violet highlight would be stronger.

Checks failed: none (longest gap without an event: b74.5-80, the end-card hold).
Verdict: READY
