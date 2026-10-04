# Critique log: niticore-ad

Brief (v3, from the user): one minute, medium pace; open on "The first AI governance platform
from India" → "Introducing Niticore" (the logo); grid animations instead of particles; demo clicks
like a real software product ad; Sora + Manrope; only the EU AI Act and ISO/IEC 42001 named;
niticore.ai; a rich voice-over and music.

## Round 1 (stills across the film)
| hook | read | motion | variety | brand | sync | min |
|  8   |  5   |   7    |    8    |   8   |  7   |  5  |
1. [b37-83, 16x9] The app window fills ~55 % of the frame, so its UI text is ~11 px. -> push the
   camera in on each interaction (window fills the frame), UI layout 1440x900 so text renders larger.
2. [b35-83, 16x9] Chapter titles in the left column collide with the window's left edge. ->
   lower-left caption over a soft dark band; only "One clear view." keeps the side column.
3. [b51-55] The risk drawer clips its fifth factor bar. -> 44 px spacing.

## Round 2 (contact sheets, both formats)
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  7   |  7  |
1. [b14-34, 9x16] The world shots leave the top half of the frame as empty sky. -> portrait
   camera looks further down at the floor in the world shots.
2. [b8-14 / b90+, 9x16] The wordmark sits at ~45 % of the width. -> 5.6 units wide (73 %).
3. [audio] Check the voice under the music. -> faster-whisper on mix.wav: every line comes back,
   "Niticore" is heard as "Niti Core" (NEE-tee-core, as intended).

## Round 3 (9:16 stills, audio)
| hook | read | motion | variety | brand | sync | min |
|  8   |  8   |   8    |    8    |   9   |  8   |  8  |
sync.py: 23/35 hits within 20 ms (median 5.5 ms); the rest are soft blips/bells under the voice
and peak-anchored whooshes, all placed on their exact picture time. -14.1 LUFS, -1.2 dBTP.
Fix applied: 9:16 push-ins stay centred on the window (they cropped its left edge).
Remaining (not blocking): "audit-ready" is slightly soft in the read; the b14-24 world stretch
has no on-screen type (the voice carries it); click sounds sit a frame from the music's own onsets.
Verdict: READY
