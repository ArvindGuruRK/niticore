# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy", "scipy", "soundfile"]
# ///
"""Niticore particle cut v2.1: score + voice-over edit. 96 BPM, 4/4, 192 beats = 120 s, D major.

    MOTION_REEL_SKILL=<skill> uv run niticore-flow/audio/score.py

Song form (beats): 0-16 intro (air, then an accelerating pulse into the logo)  ·  16 logo  ·  16-24 a
warm, bright bell melody over I-IV  ·  24-36 verse (the AI agent avatar)  ·  36-46 shadow (B minor,
tense)  ·  46-48 stop  ·  48-88 chorus A (I V vi IV, hook; the paced loop)  ·  88-128 chorus B
(vi IV I V, octave hook; the six frameworks)  ·  128-132 breakdown ("six ways")  ·  132-168 chorus C
·  168-170 lift  ·  170-180 last chorus  ·  180 final hit.
Voice: audio/vo/af_heart/pNN.wav (tts.py); each phrase's speech onset placed on a beat (PLACE).
Writes audio/music.wav, audio/vo.wav, audio/vo.json, audio/vo_env.json (100 Hz loudness, drives the
avatar) and beats.json.
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
BPM, BEATS = 96.0, 290
BEAT = 60 / BPM
DUR = BEATS * BEAT
VOICE = "af_heart"
PLACE = [(0, 2), (1, 7), (2, 15), (3, 24), (4, 29), (5, 36), (6, 39.5), (7, 43), (8, 48.5),
         (9, 54), (10, 57.0), (11, 59.2), (12, 61.4), (13, 63.6), (14, 65.6),          # the loop, one stage at a time
         (15, 70.5), (16, 80),
         (17, 86), (18, 90.4), (19, 93.6), (20, 97.5), (21, 101.2), (22, 105.0), (23, 110.2),   # the six frameworks
         (24, 117), (25, 122), (26, 128), (27, 134), (28, 139.5), (29, 144.5), (30, 151), (31, 156), (32, 162.5),
         (33, 169.0), (34, 177.0), (35, 179.3), (36, 181.6), (37, 183.9), (38, 186.2), (39, 188.6),   # v3: the six industries
         (40, 198.0),                                                                                  # innovate with confidence
         (41, 208.0), (42, 213.5), (43, 220.5), (44, 228.5), (45, 238.25), (46, 247.5), (47, 257.25),  # the regulatory wave
         (48, 265.5), (49, 269.0), (50, 274.0),                                                        # the countdown, the call to action
         (51, 280.0), (52, 282.5)]


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
CHORUS_B = ["Bm", "G", "D", "A"]
SHADOW = ["Bm", "G", "Em", "F#m"]
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
    # loudness envelope at 100 Hz for the avatar: 30 ms RMS, normalised to the 98th percentile
    hop = SR // 100
    rms = np.sqrt(np.convolve(vo ** 2, np.ones(int(0.03 * SR)) / int(0.03 * SR), mode="same"))[::hop]
    rms = np.clip(rms / (np.percentile(rms[rms > 1e-4], 98) + 1e-9), 0, 1)
    (HERE / "vo_env.json").write_text(json.dumps({"rate": 100, "env": [round(float(v), 3) for v in rms]}))
    st = np.stack([vo, vo])
    ir = reverb_ir(0.9, 0.22, 7)
    wet = np.stack([signal.fftconvolve(st[c], ir[c])[: st.shape[1]] for c in range(2)])
    out = st + 0.11 * wet
    out *= 10 ** (-1 / 20) / (np.abs(out).max() + 1e-9)
    sf.write(HERE / "vo.wav", out.T, SR, subtype="PCM_24")
    (HERE / "vo.json").write_text(json.dumps(placed, indent=1))
    return placed


def main():
    dsp.seed(20261004)
    drums, bass, pads, arp, lead, piano, fx = (Bus(DUR, BPM) for _ in range(7))

    # ---------------- 0-16: intro — air and a piano arpeggio, then a pulse that keeps accelerating
    fx.add(sub_drop(1.6, 60, 28), 0, 0.45)
    pads.add(pad_chord(["D3", "A3", "E4", "F#4", "A4"], T(16) + 0.6, (300, 2200), attack=1.6, release=1.0), 0, 0.32)
    arpeg = ["D4", "A4", "E5", "F#5", "A5", "F#5", "E5", "A4"]
    for i, b in enumerate(np.arange(1, 8, 0.5)):
        piano.add(keys([arpeg[i % 8]], 1.4), b, 0.22 + 0.06 * (i % 2 == 0))
    for b in np.arange(8, 16, 0.5):   # the pulse: eighths, then sixteenths from 12
        bass.add(bass_note("D2", BEAT / 2 * 0.7, 500 + 120 * (b - 8)), b, 0.3 + 0.03 * (b - 8))
    for b in np.arange(10, 16, 0.5 if True else 0.25):
        drums.add(hat(), b, 0.05 + 0.01 * (b - 10), pan=0.25)
    for b in np.arange(12, 16, 0.25):
        nt = arpeg[int(b * 4) % 8]
        arp.add(pluck([note_name(midi(nt) + 12)], 0.1, 1400 + 400 * (b - 12)), b, 0.05 + 0.02 * (b - 12), pan=0.3 * np.sin(b * 5))
    for b in (8, 10, 12, 13, 14, 14.5, 15, 15.5):
        drums.add(kick(soft=b < 12), b, 0.55 + 0.04 * (b - 8))
    fx.add(riser(T(4)), 12, 0.22)
    fx.add(crash(1.6)[::-1] * 0.9, 16 - 1.6 / BEAT, 0.26)

    # ---------------- 16: the logo — a bright, open chord; 16-24 a warm bell melody over I (16) and IV (20)
    pads.add(pad_chord(["D4", "F#4", "A4", "E5"], T(4) + 0.6, (2600, 3400), attack=0.25, release=1.0), 16, 0.32)
    pads.add(pad_chord(["G3", "B3", "D4", "A4"], T(4) + 0.6, (2800, 3600), attack=0.4, release=1.2), 20, 0.3)
    piano.add(keys(["D5", "A4", "F#4", "D4"], 3.0), 16, 0.32)
    bass.add(bass_note("D2", T(3.5), 500), 16, 0.3)
    bass.add(bass_note("G1", T(3.5), 500), 20, 0.28)
    drums.add(kick(soft=True), 16, 0.5)
    fx.add(crash(2.0), 16, 0.1)
    MEL = [(16.5, "A5"), (17, "D6"), (17.5, "F#6"), (18, "E6"), (18.5, "D6"), (19, "A5"), (19.5, "B5"), (20, "D6"),
           (20.5, "B5"), (21, "D6"), (21.5, "G6"), (22, "F#6"), (22.5, "E6"), (23, "D6"), (23.5, "E6")]
    for b, nt in MEL:
        arp.add(keys([nt], 1.1), b, 0.12, pan=0.25 * np.sin(b * 2.1))
        arp.add(ks_pluck(hz(nt), 0.9, 0.5, 0.25), b, 0.045, pan=-0.2)
    for b in np.arange(18, 24, 0.5):
        nt = (["D5", "A5"] if b < 20 else ["G4", "D5"])[int(b * 2) % 2]
        lead.add(pluck([nt], 0.16, 2600), b, 0.05, pan=0.3)
    for b in np.arange(20, 24, 0.25):
        drums.add(hat(), b, 0.022 + 0.01 * ((b * 4) % 2 == 0), pan=0.2)

    # ---------------- 24-36: verse — the avatar; the pulse builds
    for bar, b0 in enumerate(range(24, 36, 4)):
        c = ["D", "A", "Bm"][bar % 3]
        pads.add(pad_chord(CH[c], T(4) + 0.3, (600, 1600 + 300 * bar), attack=0.1, release=0.4), b0, 0.3)
    for b in np.arange(24, 36, 0.5):
        c = ["D", "A", "Bm"][int((b - 24) // 4) % 3]
        bass.add(bass_note(ROOT[c], BEAT / 2 * 0.8, 700 + 50 * (b - 24)), b, 0.42 + 0.015 * (b - 24))
        if b >= 26:
            drums.add(hat(), b + 0.25 if b >= 30 else b, 0.06 + 0.004 * (b - 26), pan=0.25)
    for b in range(24, 36, 2):
        drums.add(kick(), b, 0.75)
    for b in np.arange(29, 36, 0.25):
        nt = CH[["D", "A", "Bm"][int((b - 24) // 4) % 3]][2 + int((b * 4) % 3)]
        arp.add(pluck([note_name(midi(nt) + 12)], 0.12, 1600 + 180 * (b - 29)), b, 0.06 + 0.01 * (b - 29), pan=0.3 * np.sin(b * 3))
    fx.add(riser(T(5)), 31, 0.2)

    # ---------------- 36-46: shadow — B minor, tense; 46-48 the floor drops out
    for bar, b0 in enumerate(range(36, 46, 4)):
        c = SHADOW[bar % 4]
        pads.add(pad_chord(CH[c][:4] + [note_name(midi(CH[c][3]) + 1)], T(4) + 0.3, (500, 900), attack=0.3, release=0.4), b0, 0.32)
    for b in np.arange(36, 46, 0.5):
        c = SHADOW[int((b - 36) // 4) % 4]
        bass.add(bass_note(ROOT[c], 0.2, 600), b, 0.46 if (b * 2) % 2 == 0 else 0.3)
    for b in np.arange(36, 46, 0.25):
        drums.add(hat(), b, 0.05 if (b * 4) % 2 else 0.08, pan=0.25)
    for b in range(36, 45, 2):
        drums.add(kick(), b, 0.6)
    for b in (36, 39.5, 43):
        fx.add(sub_drop(1.2, 58, 30), b, 0.32)
    fx.add(riser(T(2.0)), 46, 0.22)

    # ---------------- 48-168: the chorus sections (v3: 168-172 a breath; the new sections follow)
    def groove(b):
        return (48 <= b < 128) or (132 <= b < 168)

    for b0 in range(48, 168, 4):
        brk = 128 <= b0 < 132
        lift = 168 <= b0 < 170
        prog_ = CHORUS_B if 88 <= b0 < 128 else CHORUS
        c = prog_[((b0 - 48) // 4) % 4]
        if lift:
            continue
        pads.add(pad_chord(CH[c], T(4) + 0.3, (900, 1500) if brk else (1500, 3000), attack=0.04, release=0.4), b0, 0.3)
        if b0 >= 52 and not brk:
            for off, nt, ln in HOOK[c]:
                lead.add(keys([nt], ln * BEAT * 1.6), b0 + off, 0.2)
                if b0 >= 88:
                    lead.add(pluck([nt], ln * BEAT * 0.9, 3200), b0 + off, 0.1, pan=0.2)
        if brk:
            for j, nt in enumerate([CH[c][2], CH[c][3], CH[c][4], CH[c][3]]):
                piano.add(keys([note_name(midi(nt) + 12)], 1.6), b0 + j, 0.24)
            drums.add(kick(soft=True), b0, 0.6)
            drums.add(kick(soft=True), b0 + 2, 0.6)
        for s in range(16):
            b = b0 + s * 0.25
            if not groove(b):
                continue
            hi = b >= 132
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
    fx.add(sub_drop(1.6, 72, 28), 48, 0.55)
    drums.add(kick(), 48, 1.0)
    fx.add(crash(2.2), 48, 0.26)
    fx.add(crash(1.6), 88, 0.18)
    fx.add(riser(T(4)), 128, 0.26)
    fx.add(crash(2.0), 132, 0.24)
    fx.add(riser(T(2)), 168, 0.26)
    fx.add(crash(2.2), 170, 0.2)
    fx.add(sub_drop(1.4, 66, 28), 170, 0.32)

    # ---------------- v3 170-196: who it is for, a lighter groove under the six industries
    pads.add(pad_chord(CH["D"], T(2) + 0.3, (700, 1400), attack=0.3, release=0.4), 170, 0.26)
    for b0 in range(172, 196, 4):
        c = CHORUS[((b0 - 172) // 4) % 4]
        pads.add(pad_chord(CH[c], T(4) + 0.3, (1100, 2200), attack=0.06, release=0.4), b0, 0.28)
        for s in range(16):
            b = b0 + s * 0.25
            if s in (0, 8):
                drums.add(kick(soft=True), b, 0.7)
            if s in (4, 12):
                drums.add(clap(tight=True), b, 0.16, pan=0.05)
            if s % 4 == 2:
                drums.add(hat(), b, 0.07, pan=0.25)
            if s % 4 == 0:
                bass.add(bass_note(ROOT[c], BEAT * 0.8, 800), b, 0.42)
            if s % 2 == 0:
                pool = [CH[c][2], CH[c][3], CH[c][4], note_name(midi(CH[c][3]) + 12)]
                arp.add(pluck([pool[[0, 2, 1, 3][(s // 2) % 4]]], 0.14, 1700 + 30 * (b0 - 172)), b, 0.075, pan=0.35 * (1 if s % 4 else -1))
    fx.add(riser(T(4)), 192, 0.2)

    # ---------------- v3 196-206: everything together, the full chorus once more
    for b0 in range(196, 208, 4):
        c = CHORUS[((b0 - 196) // 4) % 4]
        pads.add(pad_chord(CH[c], T(4) + 0.3, (1500, 3000), attack=0.04, release=0.4), b0, 0.3)
        for off, nt, ln in HOOK[c]:
            if b0 + off < 206:
                lead.add(keys([nt], ln * BEAT * 1.6), b0 + off, 0.2)
                lead.add(pluck([nt], ln * BEAT * 0.9, 3200), b0 + off, 0.1, pan=0.2)
        for s in range(16):
            b = b0 + s * 0.25
            if b >= 206:
                break
            if s % 4 == 0:
                drums.add(kick(), b, 0.9)
            if s in (4, 12):
                drums.add(clap(), b, 0.3, pan=0.05)
            if s % 4 == 2:
                drums.add(hat(open_=True), b, 0.12, pan=0.25)
            if s % 2 == 0:
                bass.add(bass_note(ROOT[c] if s % 4 == 0 else note_name(midi(ROOT[c]) + 12), BEAT / 2 * 0.85, 1000), b, 0.5)
            pool = [CH[c][2], CH[c][3], CH[c][4], note_name(midi(CH[c][3]) + 12)]
            arp.add(pluck([pool[[0, 2, 1, 3, 2, 1, 3, 0][s % 8]]], 0.14, 2400), b, 0.12, pan=0.35 * (1 if s % 2 else -1))
    fx.add(crash(2.2), 196, 0.26)
    fx.add(sub_drop(1.4, 66, 28), 196, 0.4)

    # ---------------- v3 208-260: the regulatory wave, a slow swell that climbs a step with each milestone
    WAVE = [(208, "Bm", 700), (216, "G", 950), (224, "D", 1250), (232, "A", 1600), (240, "Bm", 2000), (248, "G", 2500)]
    for b0, c, cut in WAVE:
        pads.add(pad_chord(CH[c], T(8) + 0.4, (cut, cut * 1.5), attack=0.9, release=0.6), b0, 0.3)
        bass.add(bass_note(ROOT[c], T(7.6), 420 + cut * 0.1), b0, 0.3)
    for b in np.arange(216, 256, 2):
        drums.add(kick(soft=True), b, 0.42 + 0.006 * (b - 216))
    for b in np.arange(241, 256, 2):
        drums.add(kick(soft=True), b, 0.3)
    for b in np.arange(228, 256, 0.5):
        drums.add(hat(), b + 0.25, 0.03 + 0.0018 * (b - 228), pan=0.25)
    for b in np.arange(224, 257, 0.5):
        c = [w[1] for w in WAVE if w[0] <= b][-1]
        pool = [CH[c][2], CH[c][3], CH[c][4], note_name(midi(CH[c][2]) + 12)]
        arp.add(pluck([pool[int(b * 2) % 4]], 0.16, 1200 + 45 * (b - 224)), b, 0.035 + 0.0022 * (b - 224), pan=0.3 * np.sin(b * 3))
    fx.add(riser(T(5.2)), 252.0, 0.28)
    pads.add(pad_chord(["D3", "A3", "D4", "F#4", "A4", "D5"], T(3.2) + 0.6, (3400, 2000), attack=0.05, release=0.8), 257.25, 0.3)

    # ---------------- v3 260-272: the countdown, a clock ticking over a held minor chord
    fx.add(crash(2.4), 260.5, 0.22)
    fx.add(sub_drop(1.8, 62, 28), 260.5, 0.5)
    drums.add(kick(), 260.5, 0.8)
    pads.add(pad_chord(CH["Bm"], T(6) + 0.4, (900, 1300), attack=0.2, release=0.5), 260.5, 0.28)
    pads.add(pad_chord(CH["G"], T(5.5) + 0.4, (1100, 1700), attack=0.3, release=0.5), 266.5, 0.28)
    for b in np.arange(261, 272, 1):
        drums.add(hat(), b, 0.11, pan=-0.15)
        drums.add(hat(), b + 0.5, 0.04, pan=0.2)
    for b in (264, 268):
        bass.add(bass_note(ROOT["Bm" if b < 266 else "G"], T(3.5), 500), b, 0.36)
        drums.add(kick(soft=True), b, 0.55)
    fx.add(riser(T(3.4)), 268.6, 0.26)

    # ---------------- v3 272-280: the call to action, the chorus returns
    for b0 in (272, 276):
        c = CHORUS[((b0 - 272) // 4) % 4]
        pads.add(pad_chord(CH[c], T(4) + 0.3, (1500, 3000), attack=0.04, release=0.4), b0, 0.3)
        for off, nt, ln in HOOK[c]:
            lead.add(keys([nt], ln * BEAT * 1.6), b0 + off, 0.18)
        for s in range(16):
            b = b0 + s * 0.25
            if s % 4 == 0:
                drums.add(kick(), b, 0.85)
            if s in (4, 12):
                drums.add(clap(), b, 0.26, pan=0.05)
            if s % 4 == 2:
                drums.add(hat(open_=True), b, 0.1, pan=0.25)
            if s % 2 == 0:
                bass.add(bass_note(ROOT[c] if s % 4 == 0 else note_name(midi(ROOT[c]) + 12), BEAT / 2 * 0.85, 1000), b, 0.46)
    fx.add(crash(2.0), 272, 0.24)
    fx.add(riser(T(2)), 278, 0.2)

    # ---------------- 280: the resolve (the logo)
    fin = ["D3", "A3", "E4", "F#4", "A4"]
    pads.add(pad_chord(fin, T(9) + 1.0, (5200, 900), attack=0.004, release=1.5), 280, 0.55)
    piano.add(keys(["D5", "A4", "F#4", "D4"], 4.5), 280, 0.4)
    piano.add(keys(["E5", "A4"], 3.0), 282.5, 0.24)
    piano.add(keys(["F#5", "D5"], 3.5), 285, 0.22)
    drums.add(kick(), 280, 1.0)
    fx.add(crash(3.4), 280, 0.3)
    fx.add(sub_drop(2.2, 66, 26), 280, 0.6)
    bass.add(bass_note("D1", 2.8, 600), 280, 0.6)

    N = drums.n
    kick_t = [T(b) for b in np.arange(48, 290, 1) if groove(b) or 196 <= b < 206 or 272 <= b < 280]
    pump = sidechain(kick_t, drums.x.shape[1], 0.35, 0.12)
    ir = reverb_ir(2.4, 0.7, 5)
    wsrc = pads.x * 0.5 + arp.x * 0.6 + lead.x * 0.5 + piano.x * 0.6
    wet = np.stack([signal.fftconvolve(wsrc[c], ir[c])[: wsrc.shape[1]] for c in range(2)])
    bed = drums.x * 0.9 + (bass.x * 0.85 + pads.x + arp.x + lead.x) * pump + piano.x + fx.x * 0.8 + wet * 0.55
    for x0, x1 in ((46, 47.95), (168, 169.95), (206.2, 207.95)):   # the stops before the drops
        a, b = int(T(x0) * SR), int(T(x1) * SR)
        bed[:, a:b] = fx.x[:, a:b] * 0.8 + wet[:, a:b] * 0.3
    bed = np.stack([filt(c, "highpass", 28) for c in bed])[:, :N]
    fade = int(1.4 * SR)
    bed[:, -fade:] *= np.linspace(1, 0, fade) ** 2
    bed *= 10 ** (-3 / 20) / (np.abs(bed).max() + 1e-9)
    sf.write(HERE / "music.wav", bed.T, SR, subtype="PCM_24")

    placed = build_vo()

    grid_src = drums.x[:, :N].mean(axis=0).astype(np.float32)
    grid = measure_beats(grid_src, SR, BPM, n_beats=BEATS + 1)
    grid["beats"] = [x for x in grid["beats"] if x < DUR + 0.5]
    grid["downbeats"] = grid["beats"][::4]
    grid["sections"] = [{"name": n, "beat": bt} for n, bt in [("intro", 0), ("logo", 16), ("verse", 24), ("shadow", 36), ("chorus", 48),
                                                               ("chorus b", 88), ("breakdown", 128), ("chorus c", 132), ("industries", 170),
                                                               ("together", 196), ("wave", 208), ("countdown", 260), ("cta", 272), ("end", 280)]]
    # v3: keep the v2.1 grid exactly, so the first 100 s of picture are reused frame for frame
    grid["bpm"], grid["period"], grid["offset"] = 96.001, 0.624996, 0.00228
    grid["beats"] = [round(grid["offset"] + i * grid["period"], 5) for i in range(BEATS + 1)]
    grid["downbeats"] = grid["beats"][::4]
    grid["duration"] = DUR
    grid["designed_bpm"] = BPM
    grid["vo"] = placed
    grid["source"] = "niticore-flow/audio/score.py (v3), 96 bpm, D major song form; grid locked to the v2.1 measurement"
    (FILM / "beats.json").write_text(json.dumps(grid, indent=1))
    print(f"grid: {grid['bpm']} bpm, offset {grid['offset'] * 1000:.1f} ms, {len(grid['beats'])} beats, "
          f"fit {grid['fit_inliers']} inliers, rms {grid['fit_residual_ms']} ms")


if __name__ == "__main__":
    main()
