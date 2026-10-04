# Critique log: niticore-flow (particle cut)

Brief: the user's latest ask: particles (not a grid), smooth transitions between every scene and
label, the real Niticore components from the design system, sentence case (no all-caps labels), a
proper transition video. Same 62.5 s VO and score as the reel.

## Round 1 (stills + strips, 16x9 and 9x16)
| hook | read | motion | variety | brand | sync | min |
|  8   |  6   |   6    |    8    |   8   |  7   |  6  |
1. [b0-7] The ribbons ran straight through the claim, so "from India." was hard to read. -> the
   ribbons flow under the headline (16x9 y -2.25, 9x16 y -3.9).
2. [b39-78] Component-to-component flights spread into a shapeless cloud mid-way. -> particles now
   pour through a twisting stream between the two boards (squeeze + vortex), and the camera holds
   while each component starts to dissolve, then travels with the stream.
3. [b44-74] Future elements showed as faint particle ghosts (the shadow-AI row, the FRIA pill, the
   "Approved" state over "Approval required"). -> hidden elements have zero ghost and fly in
   nearly invisible; the guard layer is sampled before the approval; residue after a component
   resolves is quieter (0.02-0.04).
Also: caption bug (widths printed as text) fixed; chips 44 px with 18 px text and flipped at the
right edge; nodes for labels chosen to stay on screen; the constellation re-laid out in the free
side of the frame (it covered the caption); a lighter orbit round the wordmark; widow fixed on
"Assess the risk of each one."

## Round 2 (contact sheets 16x9 + 9x16, strips across every transition, audio)
| hook | read | motion | variety | brand | sync | min |
|  8   |  7   |   7    |    8    |   8   |  8   |  7  |
1. [b12.6-15, b33-36] Wordmark → network and network → cockpit still burst into a screen-wide dust
   storm. -> both now pour through a stream too (the network one aims well ahead of the camera, so
   "all of it" is pulled forward into one view); particles that are not part of a component fly at
   a third of the brightness, and anything closer than 6 units fades out.
2. [b25-33] The "Unapproved model" label never appeared (its node failed the on-screen test), and
   "Risk not measured" landed on the stacked statements. -> label nodes fall back to the nearest
   visible node, and must sit outside the caption column (16x9 x > 900, 9x16 y > 640).
3. [b8-13, b90-100, 9x16] The wordmark and its orbit filled the portrait width edge to edge. ->
   portrait wordmark 718 px, orbit radius 3.75.
Sound: 61 hits voiced; -14.0 LUFS, -1.2 dBTP; 34/61 within 20 ms (median 11.6 ms); the misses are
peak-anchored whooshes and soft accents under the voice, placed on exact picture beats.

## Round 3 (contact sheet 16x9, 9x16 stills, strips of the reworked transitions)
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  8   |  8  |
Every scene now hands its particles to the next as a stream; captions roll out as the next rolls
in; labels sit outside the caption column; hidden elements stay hidden until they resolve. Only
real design-system components on screen, sentence case throughout, copy and figures from docs/.
Remaining: the portrait pull into the cockpit (b33.5-35) is still a dense rush for about a second;
the network labels are small on a phone.
Verdict: READY

---
# v2: client fine-tune (2026-10-04)
Brief: keep the v1 flow and look; apply the client's changes (see shotlist.md "v1 → v2"):
new three-line opening, no ring behind the wordmark (richer letter-by-letter wordmark instead),
a 3D AI-agent avatar for the problem lines, six framework cards, guardrails and "watch over
everything" removed, the five-stage loop, "Six ways governance actually gets enforced" with a demo
for each, the new components in the constellation, the niticore-sub end card with www.niticore.ai.
Length follows the content: 172 beats, 107.5 s. Content from the production repo (niticore-website-v2).

## v2 round 1 (stills both formats, contact 16x9, strips: wordmark → avatar, avatar → cockpit, six demos, constellation → end)
| hook | read | motion | variety | brand | sync | min |
|  8   |  7   |   7    |    9    |   8   |  7   |  7  |
1. [b22-46] The avatar read as crumpled foil: sharp studio-light patches, tiny eyes. -> calmer
   displacement, softer reflections, a saturated violet body, larger painted eyes with soft sockets;
   it now reads as a character that breathes with the voice.
2. [b54-61] The loop's labels were clipped at the board edge and its centre readout doubled with the
   particle ghost of another stage. -> a wider board, labels set out from the nodes, the live readout
   and comet kept out of the particle sample.
3. [b160-172] The end ribbons crossed the subtitle and the URL. -> lower and quieter, well under
   www.niticore.ai. Also: the agent labels are clamped inside the frame; the avatar → cockpit rush is
   squeezed into a tighter stream with near particles faded.
Sound: 91 hits; -14.1 LUFS, -1.2 dBTP; 46/91 within 20 ms (misses are peak-anchored whooshes and
soft accents under the voice).

## v2 round 2 (contact 9x16, 9x16 stills of every new scene)
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    9    |   9   |  8   |  8  |
1. [b54-61, 9x16] The loop ring sat off-centre with "Monitor" near the edge. -> centred in portrait.
2. [b160-172, 9x16] Ribbons touched www.niticore.ai. -> lower in portrait.
3. [b54-61] Ring particles glowed over the node numbers. -> 60% brightness, labels set further out.

## v2 round 3 (detail stills: avatar, loop, six frameworks, deployment gate)
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    9    |   9   |  8   |  8  |
Six FrameworkCards match the production site (tones, marks incl. the ADGM and DIFC wordmarks,
figures, notes); the loop is the site's OrbitSteps; the six mechanisms use the site's own words.
Remaining: the avatar turns pale lavender at some angles while it speaks; the avatar → cockpit rush
is still dense for about a second.
Verdict: READY

---
# v2.1: client fixes (2026-10-04)
1. Framework names spoken in full and spelled out: "the U-A-E P-D-P-L", "A-D-G-M D-P-R twenty
   twenty-one", "and D-I-F-C Regulation ten" (tts.py spells [ABC] letter by letter). One phrase per
   framework; each card lands on its name. Transcript of the mix: UAE PDPL, ADGM DPR 2021,
   DIFC Regulation 10, NIST AI RMF all heard.
2. The loop is paced: "One continuous loop." then each stage on its own word, a pause between; the
   green arc and comet step node by node and hold on Monitor (no return to Discover).
3. The avatar is one seamless character: built from the wordmark's particles (the skin fills in
   out of that light with a glowing edge), buds its agents like liquid, and transforms itself on each
   line (amber flicker; a stretch that tears a piece away, eyes following it; coral spikes and a
   swell), calms, takes everything back, and peels away into the cockpit's particles. Drawn opaque
   in its own pass, so overlaps no longer wash out; moods in linear colour, so they stay saturated.
4. Frozen-frame fix: a still board is always drawn at the end of its last animation, so render
   chunks can't disagree (the 0:12 star wobble); the wordmark's hold starts after its spring settles.
5. "Six ways": titles 36 px, descriptions 23 px, the list centred in the left column (portrait
   42/28 px).
6. Music after the logo: an open D major chord into G, an ordered bell melody, light plucks and a
   soft shaker; no sub rumble, closing filter or heartbeat kicks. The logo hit is a swell into a bell
   chord.
Length 192 beats (120 s). -14.1 LUFS, -1.1 dBTP; 48/92 hits within 20 ms.
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    9    |   9   |  8   |  8  |
Verdict: READY
7. Client: "Even the ones hiding in the shadows." removed from the voice ("Discover every model,
   agent and dataset.") and from the caption (heading only). The inventory panel is unchanged.
