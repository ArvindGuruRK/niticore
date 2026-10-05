# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["kokoro-onnx", "soundfile", "numpy"]
# ///
"""Voice-over takes for the Niticore ad, one wav per phrase, with Kokoro (Apache-2.0, offline).

    uv run --python 3.12 niticore-flow/audio/tts.py [voice ...]

Model files live in video/models/ (kokoro-v1.0.onnx, voices-v1.0.bin; not committed).
Writes niticore-flow/audio/vo/<voice>/pNN.wav (24 kHz mono) and prints each phrase's length.
"Niticore" is forced to NEE-tee-core (from Sanskrit niti); the tokenizer alone says NIT-ee-core.
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

HERE = Path(__file__).resolve().parent
MODELS = HERE.parent.parent / "models"
PHRASES = [l.strip() for l in (HERE / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]
BRAND_DEFAULT, BRAND = "nˈɪɾɪkˌɔːɹ", "nˈiːtikˌɔːɹ"
# [ABC] in script.txt is spelled out letter by letter (each letter phonemized on its own)
SPELL = re.compile(r"\[([A-Z]+)\]")

def phonemize(tok, text):
    out, pos = [], 0
    for m in SPELL.finditer(text):
        if text[pos:m.start()].strip(): out.append(tok.phonemize(text[pos:m.start()], "en-us"))
        out.append(" ".join(tok.phonemize(ch, "en-us").strip(" .") for ch in m.group(1)))
        pos = m.end()
    if text[pos:].strip(): out.append(tok.phonemize(text[pos:], "en-us"))
    return " ".join(o.strip() for o in out)
SPEED = 0.92

def main():
    voices = sys.argv[1:] or ["af_heart"]
    k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
    tok = Tokenizer()
    report = {}
    for v in voices:
        out = HERE / "vo" / v
        out.mkdir(parents=True, exist_ok=True)
        lens = []
        for i, text in enumerate(PHRASES):
            ph = phonemize(tok, text).replace(BRAND_DEFAULT, BRAND)
            y, sr = k.create(ph, voice=v, speed=SPEED, lang="en-us", is_phonemes=True)
            y = np.asarray(y, dtype=np.float32)
            sf.write(out / f"p{i:02d}.wav", y, sr)
            lens.append(round(len(y) / sr, 3))
            print(f"{v} p{i:02d} {len(y) / sr:5.2f}s  {text}  |  {ph}")
        report[v] = {"sr": sr, "lengths": lens, "total": round(sum(lens), 2)}
        print(f"{v}: {sum(lens):.1f}s of speech over {len(PHRASES)} phrases")
    (HERE / "vo" / "takes.json").write_text(json.dumps({"phrases": PHRASES, "speed": SPEED, "voices": report}, indent=1))

if __name__ == "__main__":
    main()
