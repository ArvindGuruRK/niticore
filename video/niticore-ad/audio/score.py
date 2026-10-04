# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""Niticore ad score + voice-over edit. 96 BPM, 4/4, 100 beats = 62.5 s, D major.

    MOTION_REEL_SKILL=<skill> uv run niticore-ad/audio/score.py

Song form (beats): 0-8 intro (piano arpeggio, air)  ·  8 logo hit  ·  8-14 halo (pad, shimmer,
half-time)  ·  14-24 verse (pulse builds, riser)  ·  24-34 shadow (B minor, tense, stop at 34)
·  35-79 chorus (I V vi IV, four-on-the-floor, melodic hook; second layer from 55)  ·
79-83 breakdown (piano + pads, heartbeat)  ·  83-90 last chorus  ·  90 final hit, ring-out.
Voice: audio/vo/af_heart/pNN.wav (tts.py); each phrase's speech onset placed on a beat (PLACE).
Writes audio/music.wav, audio/vo.wav, audio/vo.json and beats.json.
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

sys.path.insert(0, str(Path(os.environ["MOTION_REEL_SKILL"]) / "scripts"))
import dsp  # noqa: E402
from dsp import SR, Bus, bass_note, clap, crash, filt, hat, keys, kick, ks_pluck, hz, measure_beats, midi, \
    note_name, pad_chord, peq, pluck, reverb_ir, riser, sidechain, sub_drop  # noqa: E402

HERE = Path(__file__).resolve().parent
FILM = HERE.parent
BPM, BEATS = 96.0, 100
BEAT = 60 / BPM
DUR = BEATS * BEAT
VOICE = "af_heart"
PLACE = [(0, 1), (1, 8), (2, 14), (3, 19), (4, 25), (5, 28), (6, 31), (7, 35), (8, 40.5), (9, 50),
         (10, 56), (11, 68.5), (12, 77), (13, 83.5), (14, 90.5), (15, 92.5)]


def T(b):
    return b * BEAT


# ---------------------------------------------------------------- harmony
CH = {
    "D": ["D3", "A3", "D4", "F#4", "A4"], "A": ["A2", "E3", "A3", "C#4", "E4"],
    "Bm": ["B2", "F#3", "B3", "D4", "F#4"], "G": ["G2", "D3", "G3", "B3", "D4"],
    "Em": ["E3", "B3", "E4", "G4", "B4"], "F#m": ["F#2", "C#3", "F#3", "A3", "C#4"],
}
ROOT = {"D": "D2", "A": "A1", "Bm": "B1", "G": "G1", "Em": "E2", "F#m": "F#1"}
CHORUS = ["D", "A", "Bm", "G"]
SHADOW = ["Bm", "G", "Em", "F#m"]
# the hook: (beat in bar, note, length in beats) for each chord of the chorus
HOOK = {
    "D": [(0, "F#5", 1), (1, "A5", 0.5), (1.5, "B5", 1), (2.5, "A5", 1.5)],
    "A": [(0, "E5", 1), (1, "C#5", 0.5), (1.5, "E5", 1), (2.5, "A5", 1.5)],
    "Bm": [(0, "F#5", 1), (1, "D5", 0.5), (1.5, "B4", 1), (2.5, "D5", 1.5)],
    "G": [(0, "D5", 0.5), (0.5, "E5", 0.5), (1, "F#5", 1), (2, "E5", 2)],
}


def vo_chain(y):
    y = filt(y, "highpass", 75)
    y = peq(y, 180, 2.0, 0.8)
    y = peq(y, 3200, 2.5, 1.0)
    y = peq(y, 10000, 2.0, 0.7)
    env = dsp.env_follow(np.abs(y), 0.005, 0.12) + 1e-6
    lvl = 20 * np.log10(env / (np.abs(y).max() + 1e-9))
    gr = np.where(lvl > -20, (lvl + 20) * (1 - 1 / 3), 0)
    y = y * 10 ** (-gr / 20)
    return y / (np.abs(y).max() + 1e-9)


def speech_onset(y, sr):
    hop = int(0.01 * sr)
    rms = np.sqrt(np.convolve(y ** 2, np.ones(hop) / hop, mode="same"))[::hop]
    thr = rms.max() * 10 ** (-36 / 20)
    on = int(np.argmax(rms > thr))
    off = len(rms) - int(np.argmax(rms[::-1] > thr))
    return on * hop / sr, off * hop / sr


def build_vo():
    n = int(DUR * SR) + SR * 2
    vo = np.zeros(n)
    placed, prev_end = [], 0
    lines = [l.strip() for l in (HERE / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]
    for idx, beat in PLACE:
        y, sr = sf.read(HERE / "vo" / VOICE / f"p{idx:02d}.wav")
        on, off = speech_onset(y, sr)
        y = signal.resample_poly(y, SR, sr)
        a, b = int(on * SR), int(off * SR) + int(0.08 * SR)
        seg = y[max(0, a - int(0.03 * SR)):b]
        fade = int(0.04 * SR)
        seg[-fade:] *= np.linspace(1, 0, fade)
        start = T(beat) - 0.03
        s = int(start * SR)
        vo[s:s + len(seg)] += seg
        end = start + len(seg) / SR
        gap = start - prev_end
        print(f"p{idx:02d} @b{beat:<5} {start:6.2f}-{end:6.2f}s  gap {gap:+5.2f}s{'  OVERLAP' if gap < 0 else ''}  {lines[idx]}")
        placed.append({"i": idx, "beat": beat, "t0": round(T(beat), 3), "t1": round(end, 3), "text": lines[idx]})
        prev_end = end
    vo = vo_chain(vo[: int(DUR * SR)])
    st = np.stack([vo, vo])
    ir = reverb_ir(0.9, 0.22, 7)
    wet = np.stack([signal.fftconvolve(st[c], ir[c])[: st.shape[1]] for c in range(2)])
    out = st + 0.11 * wet
    out *= 10 ** (-1 / 20) / (np.abs(out).max() + 1e-9)
    sf.write(HERE / "vo.wav", out.T, SR, subtype="PCM_24")
    (HERE / "vo.json").write_text(json.dumps(placed, indent=1))
    return placed


def main():
    dsp.seed(20261003)
    drums, bass, pads, arp, lead, piano, fx = (Bus(DUR, BPM) for _ in range(7))

    # ---------------- 0-8: intro — a piano arpeggio over air
    fx.add(sub_drop(1.6, 60, 28), 0, 0.45)
    pads.add(pad_chord(["D3", "A3", "E4", "F#4", "A4"], T(8) + 0.6, (300, 1600), attack=1.4, release=1.0), 0, 0.34)
    arpeg = ["D4", "A4", "E5", "F#5", "A5", "F#5", "E5", "A4"]
    for i, b in enumerate(np.arange(1, 8, 0.5)):
        piano.add(keys([arpeg[i % 8]], 1.4), b, 0.22 + 0.06 * (i % 2 == 0))
    fx.add(crash(1.6)[::-1] * 0.9, 8 - 1.6 / BEAT, 0.28)

    # ---------------- 8: the logo — a big chord; 8-14 halo
    pads.add(pad_chord(["D3", "A3", "D4", "F#4", "A4"], T(6) + 0.6, (4200, 1400), attack=0.005, release=0.8), 8, 0.5)
    piano.add(keys(["D5", "A4", "F#4", "D4"], 3.0), 8, 0.36)
    fx.add(sub_drop(1.8, 70, 28), 8, 0.6)
    drums.add(kick(), 8, 1.0)
    fx.add(crash(2.4), 8, 0.26)
    for b in np.arange(8.5, 14, 0.5):
        if dsp.rng.uniform() < 0.5:
            nt = ["A5", "D6", "E6", "F#6", "A6"][int(dsp.rng.uniform() * 5)]
            arp.add(ks_pluck(hz(nt), 1.2, 0.5, 0.2), b, 0.12, pan=dsp.rng.uniform(-0.6, 0.6))
    for b in (10, 12):
        drums.add(kick(soft=True), b, 0.7)

    # ---------------- 14-24: verse — the pulse builds
    for bar, b0 in enumerate(range(14, 24, 4)):
        c = ["D", "A", "Bm"][bar % 3]
        pads.add(pad_chord(CH[c], T(4) + 0.3, (600, 1600 + 300 * bar), attack=0.1, release=0.4), b0, 0.3)
    for b in np.arange(14, 24, 0.5):
        c = ["D", "A", "Bm"][int((b - 14) // 4) % 3]
        bass.add(bass_note(ROOT[c], BEAT / 2 * 0.8, 700 + 60 * (b - 14)), b, 0.42 + 0.02 * (b - 14))
        if b >= 16:
            drums.add(hat(), b + 0.25 if b >= 19 else b, 0.06 + 0.005 * (b - 16), pan=0.25)
    for b in range(14, 24, 2):
        drums.add(kick(), b, 0.75)
    for b in np.arange(18, 24, 0.25):
        nt = CH[["D", "A", "Bm"][int((b - 14) // 4) % 3]][2 + int((b * 4) % 3)]
        arp.add(pluck([note_name(midi(nt) + 12)], 0.12, 1600 + 220 * (b - 18)), b, 0.06 + 0.012 * (b - 18), pan=0.3 * np.sin(b * 3))
    fx.add(riser(T(5)), 19, 0.2)

    # ---------------- 24-34: shadow — B minor, tense
    for bar, b0 in enumerate(range(24, 34, 4)):
        c = SHADOW[bar % 4]
        pads.add(pad_chord(CH[c][:4] + [note_name(midi(CH[c][3]) + 1)], T(4) + 0.3, (500, 900), attack=0.3, release=0.4), b0, 0.32)
    for b in np.arange(24, 34, 0.5):
        c = SHADOW[int((b - 24) // 4) % 4]
        bass.add(bass_note(ROOT[c], 0.2, 600), b, 0.46 if (b * 2) % 2 == 0 else 0.3)
    for b in np.arange(24, 34, 0.25):
        drums.add(hat(), b, 0.05 if (b * 4) % 2 else 0.08, pan=0.25)
    for b in range(24, 33, 2):
        drums.add(kick(), b, 0.6)
    for b in (25, 28, 31):
        fx.add(sub_drop(1.2, 58, 30), b, 0.32)
    fx.add(riser(T(1.0)), 34, 0.2)

    # ---------------- 34.5-90: the chorus (with a breakdown at 77-83)
    def groove(b):
        return (35 <= b < 79) or (83 <= b < 90)

    bar0 = 35
    nb = int((90 - bar0) / 4)
    for bar in range(nb + 1):
        b0 = bar0 + bar * 4
        if b0 >= 90:
            break
        c = CHORUS[bar % 4]
        brk = 79 <= b0 < 83
        pads.add(pad_chord(CH[c], T(4) + 0.3, (900, 1500) if brk else (1500, 3000), attack=0.04, release=0.4), b0, 0.3)
        # the hook (lead), from 38.5; an octave double from 56
        if b0 >= 39 and not brk:
            for off, nt, ln in HOOK[c]:
                lead.add(keys([nt], ln * BEAT * 1.6), b0 + off, 0.2)
                if b0 >= 55:
                    lead.add(pluck([nt], ln * BEAT * 0.9, 3200), b0 + off, 0.1, pan=0.2)
        if brk:
            for j, nt in enumerate([CH[c][2], CH[c][3], CH[c][4], CH[c][3]]):
                piano.add(keys([note_name(midi(nt) + 12)], 1.6), b0 + j, 0.24)
            drums.add(kick(soft=True), b0, 0.6)
            drums.add(kick(soft=True), b0 + 0.3, 0.35)
            drums.add(kick(soft=True), b0 + 2, 0.6)
        for s in range(16):
            b = b0 + s * 0.25
            if b >= 90 or not groove(b):
                continue
            hi = b >= 55
            if s % 4 == 0:
                drums.add(kick(), b, 0.9)
            if s in (4, 12):
                drums.add(clap(), b, 0.3, pan=0.05)
            if s % 4 == 2:
                drums.add(hat(open_=hi), b, 0.12 if hi else 0.09, pan=0.25)
            if s % 2 == 0:
                bass.add(bass_note(ROOT[c] if s % 4 == 0 else note_name(midi(ROOT[c]) + 12), BEAT / 2 * 0.85, 1000), b, 0.5)
            pool = [CH[c][2], CH[c][3], CH[c][4], note_name(midi(CH[c][3]) + 12)]
            nt = pool[[0, 2, 1, 3, 2, 1, 3, 0][s % 8]]
            arp.add(pluck([nt], 0.14, 2400 if hi else 1900), b, 0.1 if not hi else 0.12, pan=0.35 * (1 if s % 2 else -1))
    fx.add(sub_drop(1.6, 72, 28), 35, 0.55)
    drums.add(kick(), 35, 1.0)
    fx.add(crash(2.2), 35, 0.26)
    fx.add(crash(1.6), 55, 0.18)
    fx.add(riser(T(4)), 79, 0.28)
    for b in np.arange(81, 83, 0.25):
        if b >= 82 or (b * 2) % 1 == 0:
            drums.add(clap(tight=True), b, 0.08 + 0.22 * (b - 81) / 2, pan=-0.05)
    fx.add(crash(2.0), 83, 0.24)

    # ---------------- 90: the resolve
    fin = ["D3", "A3", "E4", "F#4", "A4"]
    pads.add(pad_chord(fin, T(10) + 1.0, (5200, 900), attack=0.004, release=1.5), 90, 0.55)
    piano.add(keys(["D5", "A4", "F#4", "D4"], 4.5), 90, 0.4)
    piano.add(keys(["E5", "A4"], 3.0), 92.5, 0.24)
    piano.add(keys(["F#5", "D5"], 3.5), 95, 0.22)
    drums.add(kick(), 90, 1.0)
    fx.add(crash(3.4), 90, 0.3)
    fx.add(sub_drop(2.2, 66, 26), 90, 0.6)
    bass.add(bass_note("D1", 2.8, 600), 90, 0.6)

    N = drums.n
    kick_t = [T(b) for b in np.arange(35, 90, 1) if groove(b)]
    pump = sidechain(kick_t, drums.x.shape[1], 0.35, 0.12)
    ir = reverb_ir(2.4, 0.7, 5)
    wsrc = pads.x * 0.5 + arp.x * 0.6 + lead.x * 0.5 + piano.x * 0.6
    wet = np.stack([signal.fftconvolve(wsrc[c], ir[c])[: wsrc.shape[1]] for c in range(2)])
    bed = drums.x * 0.9 + (bass.x * 0.85 + pads.x + arp.x + lead.x) * pump + piano.x + fx.x * 0.8 + wet * 0.55
    a, b = int(T(34) * SR), int(T(34.95) * SR)
    bed[:, a:b] = fx.x[:, a:b] * 0.8 + wet[:, a:b] * 0.3
    bed = np.stack([filt(c, "highpass", 28) for c in bed])[:, :N]
    fade = int(1.2 * SR)
    bed[:, -fade:] *= np.linspace(1, 0, fade) ** 2
    bed *= 10 ** (-3 / 20) / (np.abs(bed).max() + 1e-9)
    sf.write(HERE / "music.wav", bed.T, SR, subtype="PCM_24")

    placed = build_vo()

    grid_src = drums.x[:, :N].mean(axis=0).astype(np.float32)
    grid = measure_beats(grid_src, SR, BPM, n_beats=BEATS + 1)
    grid["beats"] = [x for x in grid["beats"] if x < DUR + 0.5]
    grid["downbeats"] = grid["beats"][::4]
    grid["sections"] = [{"name": n, "beat": bt} for n, bt in [("intro", 0), ("logo", 8), ("verse", 14), ("shadow", 24), ("chorus", 35),
                                                               ("lift", 55), ("breakdown", 79), ("last", 83), ("end", 90)]]
    grid["duration"] = DUR
    grid["designed_bpm"] = BPM
    grid["vo"] = placed
    grid["source"] = "niticore-ad/audio/score.py, 96 bpm, D major song form, grid measured on the drum stem"
    (FILM / "beats.json").write_text(json.dumps(grid, indent=1))
    print(f"grid: {grid['bpm']} bpm, offset {grid['offset'] * 1000:.1f} ms, {len(grid['beats'])} beats, "
          f"fit {grid['fit_inliers']} inliers, rms {grid['fit_residual_ms']} ms")


if __name__ == "__main__":
    main()
