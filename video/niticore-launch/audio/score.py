# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""Niticore launch reel score. 128 BPM, 4/4, 80 beats = 37.5 s, D minor (i VI III VII).

    MOTION_REEL_SKILL=<skill> uv run niticore-launch/audio/score.py

Arc (beats):  0-4 "move fast" (driving 16ths)  ·  4-8 brake (tape stop, pad only)  ·  8-12 brand
(arp rises, snare roll, riser)  ·  12-52 the loop (full groove, lifts at 32)  ·  52-56 breakdown
(agents headline, sub, no kick)  ·  56-68 agent stack (groove + drive)  ·  68-72 build  ·  72 final
hit, 72-80 ring-out under the end card.
Writes audio/music.wav and beats.json (grid measured on the drum stem).
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
import soundfile as sf


def _skill_dir():
    if os.environ.get("MOTION_REEL_SKILL"):
        return Path(os.environ["MOTION_REEL_SKILL"])
    raise SystemExit("set MOTION_REEL_SKILL to the motion-reel skill folder")


sys.path.insert(0, str(_skill_dir() / "scripts"))
import dsp  # noqa: E402
from dsp import SR, Bus, bass_note, clap, crash, filt, hat, kick, measure_beats, midi, note_name, \
    pad_chord, pluck, reverb, riser, sidechain, sub_drop, sweep_filter  # noqa: E402

HERE = Path(__file__).resolve().parent
FILM = HERE.parent
BPM, BEATS = 128.0, 80
BEAT = 60 / BPM
DUR = BEATS * BEAT

# D minor loop: Dm  Bb  F  C  (one chord per bar)
LOOP = [("D3", "m"), ("A#2", ""), ("F3", ""), ("C3", "")]


def chord_notes(root, q):
    r = midi(root)
    third = 3 if q == "m" else 4
    return [note_name(r + 12), note_name(r + 12 + 7), note_name(r + 24 + third), note_name(r + 24 + 7)], note_name(r - 12)


def tape_stop(x, start, length):
    """Slow a stereo buffer to a halt from sample `start` over `length` s (pitch + speed fall)."""
    n = int(length * SR)
    seg = x[:, start:start + n * 2].copy()
    p = np.linspace(0, 1, n)
    rate = (1 - p) ** 1.6
    pos = np.cumsum(rate)
    pos = np.clip(pos, 0, seg.shape[1] - 1)
    out = np.stack([np.interp(pos, np.arange(seg.shape[1]), seg[c]) for c in range(2)])
    return out * (1 - p) ** 0.6


def main():
    dsp.seed(20261001)
    drums, bass, music, arp, fx = (Bus(DUR, BPM) for _ in range(5))

    def bar_chord(b):
        return chord_notes(*LOOP[(int(b) // 4) % 4])

    groove = lambda b: (0 <= b < 4) or (12 <= b < 51.5) or (56 <= b < 68)
    for i in range(BEATS * 4):          # 16th grid
        b = i / 4
        sub16 = i % 4
        notes, broot = bar_chord(b)
        # ---------------- drums
        if groove(b):
            if sub16 == 0:
                drums.add(kick(), b, 1.0)
                if int(b) % 2 == 1:
                    drums.add(clap(), b, 0.42, pan=0.05)
            if sub16 == 2:
                drums.add(hat(open_=(b >= 12)), b, 0.2 if b >= 12 else 0.16, pan=0.2)
            if sub16 in (1, 3) and (b < 4 or b >= 32):
                drums.add(hat(), b, 0.07, pan=-0.3)
        # brake: a soft clock under the pad
        if 4.5 <= b < 8 and sub16 == 2:
            drums.add(hat(), b, 0.06, pan=0.3)
        # brand section: soft kick on 9, 10, 11 then a snare roll into 12
        if 8 <= b < 12 and sub16 == 0 and b >= 9:
            drums.add(kick(soft=True), b, 0.55)
        if 10 <= b < 12:
            step = 2 if b < 11 else 1
            if i % step == 0:
                drums.add(clap(tight=True), b, 0.12 + 0.25 * (b - 10) / 2, pan=-0.05)
        # build into the end: 8ths then 16ths, kick on quarters
        if 68 <= b < 72:
            if sub16 == 0:
                drums.add(kick(), b, 0.9)
            step = 2 if b < 70 else 1
            if i % step == 0:
                drums.add(clap(tight=True), b, 0.14 + 0.3 * (b - 68) / 4, pan=0.05)
        # ---------------- bass: driving 8ths on the root (octave jump on the and)
        if groove(b) and sub16 in (0, 2):
            up = sub16 == 2 and b >= 12
            nt = broot[:-1] + str(int(broot[-1]) + (1 if up else 0))
            bass.add(bass_note(nt, BEAT / 2 * 0.85, 1300 if b >= 56 else 1000), b, 0.62 if sub16 == 0 else 0.48)
        if 68 <= b < 72 and sub16 in (0, 2):
            bass.add(bass_note("D1", BEAT / 2 * 0.85, 900 + 500 * (b - 68)), b, 0.55)
        # ---------------- arp: 16ths over chord tones, two octaves ("data" texture)
        arp_on = (0 <= b < 4) or (8 <= b < 12) or (12 <= b < 52) or (52 <= b < 72)
        if arp_on:
            pool = [notes[1], notes[2], notes[3], note_name(midi(notes[1]) + 12), note_name(midi(notes[2]) + 12)]
            pat = [0, 2, 1, 3, 2, 4, 1, 3]
            nt = pool[pat[i % 8]]
            if b >= 32 and b < 52:
                nt = note_name(midi(nt) + 12) if i % 8 in (5, 7) else nt
            g = 0.16
            if 8 <= b < 12:
                g = 0.05 + 0.14 * (b - 8) / 4
            if 52 <= b < 56:
                g = 0.07
            arp.add(pluck([nt], 0.16, 2400 if b < 52 else 3200), b, g, pan=0.35 * (1 if i % 2 else -1))
        # ---------------- pads, one chord per bar
        if sub16 == 0 and int(b) % 4 == 0 and b < 72:
            L = 4 * BEAT + 0.15
            if b == 4:     # the brake: an opening Dm
                music.add(pad_chord(notes, L, (400, 2400), attack=0.03), b, 0.42)
            elif 52 <= b < 56:
                music.add(pad_chord(notes, L, (700, 3200), attack=0.2), b, 0.45)
            elif b != 0:
                music.add(pad_chord(notes, L, 2200, attack=0.01), b, 0.3)

    # hook bar 0 also gets a pad, tighter
    n0, _ = chord_notes("D3", "m")
    music.add(pad_chord(n0, 4 * BEAT, 3000, attack=0.005), 0, 0.26)
    # transitions inside the score (sfx.mjs adds the per-hit sounds on top)
    fx.add(riser(4 * BEAT), 8, 0.32)
    fx.add(crash(1.6), 12, 0.22)
    fx.add(sub_drop(1.2, 76, 32), 12, 0.5)
    fx.add(crash(1.2)[::-1] * 0.8, 52 - 1.2 / BEAT, 0.22)
    fx.add(sub_drop(1.6, 70, 28), 52, 0.6)
    fx.add(riser(2 * BEAT), 54, 0.22)
    fx.add(crash(1.4), 56, 0.2)
    fx.add(riser(4 * BEAT), 68, 0.35)
    # the final chord: Dm add9, wide
    fin = ["D3", "A3", "E4", "F4", "A4", "D5"]
    music.add(pad_chord(fin, 8 * BEAT + 0.5, (5200, 900), attack=0.004, release=1.2, voices=5), 72, 0.55)
    drums.add(kick(), 72, 1.0)
    drums.add(crash(3.0), 72, 0.3)
    fx.add(sub_drop(1.8, 66, 26), 72, 0.6)
    bass.add(bass_note("D1", 2.2, 700), 72, 0.6)

    N = drums.n
    kick_t = [b * BEAT for b in np.arange(0, BEATS) if groove(b) or 68 <= b < 72]
    pump = sidechain(kick_t, drums.x.shape[1], 0.5, 0.11)
    # the brake: tape-stop the groove's last half beat into beat 4
    bed = drums.x + (bass.x * 0.9 + reverb(music.x, 0.35) + reverb(arp.x, 0.25)) * pump + fx.x * 0.8
    a = int(4 * BEAT * SR)
    ts = tape_stop(bed, int(3.75 * BEAT * SR), 0.45)
    bed[:, int(3.75 * BEAT * SR):int(3.75 * BEAT * SR) + ts.shape[1]] = ts
    # restore the pad + clock that start on beat 4 (laid over the stop's tail)
    brake = Bus(DUR, BPM)
    notes4, _ = chord_notes("D3", "m")
    brake.add(pad_chord(notes4, 4 * BEAT + 0.15, (380, 2600), attack=0.06), 4, 0.42)
    seg = slice(a, int(8 * BEAT * SR))
    bed[:, seg] = 0
    bed[:, int(3.75 * BEAT * SR):int(3.75 * BEAT * SR) + ts.shape[1]] = ts
    bed += reverb(brake.x, 0.4)
    for bb in np.arange(4.5, 8, 0.5):
        h = hat()
        s = int(bb * BEAT * SR)
        bed[0, s:s + len(h)] += h * 0.05
        bed[1, s:s + len(h)] += h * 0.07

    bed = np.stack([filt(ch, "highpass", 28) for ch in bed])[:, :N]
    fade = int(0.6 * SR)
    bed[:, -fade:] *= np.linspace(1, 0, fade) ** 2
    bed *= 10 ** (-3 / 20) / (np.abs(bed).max() + 1e-9)
    sf.write(HERE / "music.wav", bed.T, SR, subtype="PCM_24")

    grid_src = drums.x[:, :N].mean(axis=0).astype(np.float32)
    grid = measure_beats(grid_src, SR, BPM, n_beats=BEATS + 1)
    grid["beats"] = [b for b in grid["beats"] if b < DUR + 0.5]
    grid["downbeats"] = grid["beats"][::4]
    grid["sections"] = [{"name": "hook", "beat": 0}, {"name": "brake", "beat": 4}, {"name": "brand", "beat": 8},
                        {"name": "loop", "beat": 12}, {"name": "agents", "beat": 52},
                        {"name": "stack", "beat": 56}, {"name": "build", "beat": 68}, {"name": "end", "beat": 72}]
    mono = bed.mean(axis=0)
    bar_s = grid["period"] * 4
    grid["bar_energy"] = [round(float(np.sqrt(np.mean(mono[int((grid["offset"] + i * bar_s) * SR):int((grid["offset"] + (i + 1) * bar_s) * SR)] ** 2) + 1e-12)), 4)
                          for i in range(int(DUR / bar_s))]
    grid["duration"] = DUR
    grid["designed_bpm"] = BPM
    grid["source"] = "niticore-launch/audio/score.py, D minor 128 bpm, grid measured on the drum stem"
    (FILM / "beats.json").write_text(json.dumps(grid, indent=1))
    print(f"grid: {grid['bpm']} bpm, offset {grid['offset'] * 1000:.1f} ms, {len(grid['beats'])} beats, "
          f"fit {grid['fit_inliers']} inliers, rms {grid['fit_residual_ms']} ms")


if __name__ == "__main__":
    main()
