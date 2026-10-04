# Niticore — "The governed loop": shot list
37.5 s · 128 bpm · 80 beats (20 bars, 1 beat = 0.469 s) · formats: 16x9 (primary), 9x16
Music: bespoke score (`audio/score.py`), D minor, dark house. VO: none.

**Idea.** AI moves fast (speed lanes, chaos). Niticore makes it governed (the lanes snap into the
site's 40 px grid). Then the viewer *uses* the product through the seven-stage loop — a cursor
clicks, types and ticks on the real screens — before the loop closes, the agent guardrails stack
up, and the wordmark assembles from its own SVG paths with its two sparkles.

**Look.** Canvas `#06011F` with the site's grid (white 9 %, radial mask). Sora 600 display,
Manrope 500 UI. Green `#4AE057` only for the one key word / action. Violet `#A98BFF` for the
hand-drawn marks (swash, circle, sparkle, scan beam, click rings). Product screens float as bright
sheets inside the site's `bezel` shell (hairline, faint fill, concentric radius). Card tones
blue / violet / green from `globals.css`. All copy is the site's own words.

| # | beats | time | shot | on screen (asset) | motion | out (transition) | sound (hits) |
|---|-------|------|------|-------------------|--------|------------------|--------------|
| 1 | 0-4 | 0.00-1.88 | Hook: "Move fast with AI." | type + 14 speed lanes (green/violet streaks) | words slam in per half beat from the right with skew, lanes streak past (frame 0 already moving) | lanes keep racing | impact @0, click @0.5/1/1.5 |
| 2 | 4-8 | 1.88-3.75 | Brake: "Govern it with confidence." | type; "confidence." green; violet double swash (the hero's mark) | hard stop with squash; lanes decelerate and snap into the grid lines; swash draws b5.5-6.5 | headline compresses into a point | thud @4, whoosh @5.5 (swash), tick @7 |
| 3 | 8-12 | 3.75-5.63 | Brand drop-in | logo sparkle path (from `assets/logo/logo_img.svg`) + "The operating layer for governed AI." | sparkle spins in on an arc and lands b8; tagline rises per word b9; riser; camera dives into the sparkle b11-12 | push-through: sparkle becomes the network's centre node | bell @8, riser → @12 |
| 4 | 12-16 | 5.63-7.50 | 01 Discover — the network | pure shapes: nodes + links, labels Models / Datasets / Agents / Vendors / Tools / Teams; stage text left | nodes fly in from the dark on 8ths, links draw to the centre; slow orbit | centre node scales up into the wizard sheet | impact @12, blip ×6 @12.5-15 |
| 5 | 16-18 | 7.50-8.44 | Register a system | `assets/app/new_usecase.png` | sheet springs up; cursor clicks name field b16, types "Clinical Decision Copilot"; System Profile updates live as you type | camera pushes right to "Provisional classification" | click @16, type @16.25 |
| 6 | 18-24 | 8.44-11.25 | 02 Classify — regulatory mapping | wizard crop → 8 framework cards cropped from `section_02_…png` | cards deal in on 8ths around the system tile; mapping lines draw from tile to each card | cards flip away, scan beam enters | whoosh @18, pop ×8 @19-22.5 |
| 7 | 24-30 | 11.25-14.06 | 03 Assess — AI risk assessment | `assets/app/risk_usecase.png` | macro on 7.83 HIGH; violet scan beam sweeps b25-26.5; pull back to the Risk Register (52 active · 13 high) b27 | whip pan left | thud @24, whoosh @25, tick @27 |
| 8 | 30-36 | 14.06-16.88 | 04 Govern — controls | `assets/app/assign_controls.png` | cursor ticks 3 Recommended controls b31 / 31.5 / 32, presses "Next: Configure" b33.5 | sheet tilts away, Policy Manager slides in | whoosh @30, tick ×3, click @33.5 |
| 9 | 36-42 | 16.88-19.69 | 05 Evidence — reusable evidence | `assets/app/policy_manager.png` + framework chips | cursor clicks Upload b37; evidence chip lifts out and fans to EU AI Act / ISO 42001 / NIST AI RMF / GDPR / ISO 27001 b38-39.5; "5×" lands b40 | 5× shrinks into the dashboard's KPI row | click @37, blip ×5, impact-lite @40 |
| 10 | 42-47 | 19.69-22.03 | 06 Monitor — runtime telemetry | `assets/app/dashboard.png` | camera glides KPI row → Audit event volume; green tracer runs the real curve, crest at 43 on b44; "19 jurisdictions" | camera slides right to Score Reduction Actions | whoosh @42, sweep @43-45, bell @44 |
| 11 | 47-52 | 22.03-24.38 | 07 Improve → the loop closes | `risk_usecase.png` right column, then 7 stage words on a ring | three reduction actions light in turn b48-49; then the seven words fly onto a ring and the ring closes Improve → Discover b50-52 | ring collapses to black: breakdown | tick ×3, swell → @52 |
| 12 | 52-56 | 24.38-26.25 | "AI agents don't just predict. They take action." | type; violet circle draws round "AI agents" | words rise per beat; sub drop; drums out | first card slams up from below | sub @52, whoosh @54 (circle) |
| 13 | 56-68 | 26.25-31.88 | Agent guardrails stack | six cards in the site's tones: Agent Identity, Autonomy Scope, Tools & API Access, Hard Guardrails, Human-in-the-Loop, Runtime Telemetry; each with a pure-shape micro-demo | a new card every 2 beats lands on the stack; older cards step back (scale, rise, dim) — the About page's stack motif | stack flies apart into four words | thud @56,58,60,62,64,66 + one pitched accent each |
| 14 | 68-72 | 31.88-33.75 | The promise | four words on four beats over the real screens: Continuous visibility. / Risk intelligence. / Reusable evidence. / Agent guardrails. | hard cuts on the beat, screens push 6 % each | everything sucks into one point | click ×4 + snare roll → @72 |
| 15 | 72-80 | 33.75-37.50 | End card | wordmark built from the SVG paths, both sparkles, "The operating layer for governed AI.", niticore.vercel.app | letters rise with overlap b72-73, sparkles twinkle b73/73.5, tagline b74, URL b74.5; hold 2.6 s | — | impact @72, bell @73 / 73.5 |

Formats:
- 9x16: hook type stacks one word per line at 1.3× size; stage text sits above the screen in the
  top third and the sheet takes the lower 60 % with a tighter crop on the action (name field,
  checkboxes, Upload, the 7.83 score); framework cards deal in a 2-column stack; agent cards are
  taller and narrower; the end card stacks the wordmark over the tagline.

Longest gap without a new event: beats 74.5-80 (end-card hold, 2.6 s). Elsewhere ≤ 2 beats.
