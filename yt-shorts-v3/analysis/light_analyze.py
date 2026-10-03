"""Light music analysis -> data/audio.json, in the same schema as the reference's analyze.py, with no ML models.

The reference separates stems with Demucs (model download); this environment can't fetch models, so the stems are
approximated: harmonic/percussive separation (HPSS) gives a "drums" proxy, the harmonic mid band (300 Hz - 3.4 kHz)
a "vocal" proxy, the low band a "bass" proxy. Beats: a constant-tempo grid fitted to the onset envelope.
Downbeats: the beat phase (mod 4) with the strongest low-band onsets. Sections: novelty on beat-synchronous chroma +
loudness, snapped to downbeats.

Usage: python3 light_analyze.py ../audio/song.mp3 ../data/audio.json
"""
import json, sys
import numpy as np
import librosa
from scipy.ndimage import uniform_filter1d
from scipy.signal import find_peaks

src, dst = sys.argv[1], sys.argv[2]
SR, HOP, FPS = 44100, 441, 100
y, _ = librosa.load(src, sr=SR, mono=True)
dur = len(y) / SR

# ---- envelopes (100 fps), each normalised by its 99th percentile, attack/release smoothed like the reference ----
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
f = librosa.fft_frequencies(sr=SR, n_fft=2048)
H, P = librosa.decompose.hpss(S, margin=2.0)
def band(M, lo, hi): return np.sqrt((M[(f >= lo) & (f < hi)] ** 2).mean(axis=0))
def smooth(x, att=.01, rel=.09):
    a, r, out, v = np.exp(-1 / (att * FPS)), np.exp(-1 / (rel * FPS)), np.zeros_like(x), 0.0
    for i, s in enumerate(x): k = a if s > v else r; v = k * v + (1 - k) * s; out[i] = v
    return out
def norm(x): p = np.percentile(x, 99) or 1; return np.clip(x / p, 0, 1)
feats = {
    'rms': band(S, 20, 20000), 'low': band(S, 20, 150), 'mid': band(S, 150, 2000), 'high': band(S, 4000, 16000),
    'vocal': band(H, 300, 3400), 'drums': band(P, 20, 16000), 'bass': band(H, 30, 200), 'other': band(H, 3400, 12000),
}
feats = {k: [round(float(v), 3) for v in norm(smooth(x))] for k, x in feats.items()}

# ---- beats: constant tempo grid fitted to the onset envelope ----
oenv = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
tempo, beat_frames = librosa.beat.beat_track(onset_envelope=oenv, sr=SR, hop_length=HOP, units='frames')
bt = librosa.frames_to_time(beat_frames, sr=SR, hop_length=HOP)
period = float(np.median(np.diff(bt)))
# least-squares phase for a constant grid through the tracked beats
idx = np.round((bt - bt[0]) / period)
period = float(np.polyfit(idx, bt, 1)[0]); phase = float(np.median(bt - idx * period))
first = phase - np.floor(phase / period) * period
beats = [round(first + i * period, 3) for i in range(int((dur - first) / period) + 1)]

# ---- percussive onsets: kick (<120 Hz), snare (1.5-5 kHz), hat (>7 kHz), and vocal-band onsets ----
def onsets(M, lo, hi, delta=.08, wait=8):
    env = np.maximum(0, np.diff(np.log1p(band(M, lo, hi) * 100), prepend=0))
    env = env / (np.percentile(env, 99.5) or 1)
    pk, props = find_peaks(env, height=delta, distance=wait)
    return [[round(p / FPS, 3), round(float(min(1, h)), 3)] for p, h in zip(pk, props['peak_heights'])]
ons = {'kick': onsets(P, 20, 120, .15), 'snare': onsets(P, 1500, 5000, .2), 'hat': onsets(P, 7000, 16000, .2, 6), 'vocal': onsets(H, 300, 3400, .18, 10)}

# ---- downbeats: the beat phase (0..3) whose beats carry the most low-band onset energy ----
low_on = np.zeros(int(dur * FPS) + 2)
for t, s in ons['kick']: low_on[int(t * FPS)] += s
score = [sum(low_on[max(0, int(b * FPS) - 3):int(b * FPS) + 4].sum() for b in beats[k::4]) for k in range(4)]
k0 = int(np.argmax(score)); downbeats = beats[k0::4]

# ---- sections: novelty of beat-synchronous chroma + loudness, peaks snapped to downbeats ----
# CQT needs a power-of-two hop: analyse chroma at 22.05 kHz / 512 (a 441 hop at 44.1 kHz exhausts memory)
y22 = librosa.resample(y, orig_sr=SR, target_sr=22050)
chroma = librosa.feature.chroma_cqt(y=y22, sr=22050, hop_length=512)
bf = np.clip((np.array(downbeats) * 22050 / 512).astype(int), 0, chroma.shape[1] - 1)
bfe = np.clip((np.array(downbeats) * FPS).astype(int), 0, len(feats['rms']) - 1)
C = librosa.util.sync(chroma, bf, aggregate=np.median)
L = np.array([np.mean(feats['rms'][a:b]) if b > a else 0 for a, b in zip(bfe, list(bfe[1:]) + [len(feats['rms'])])])
n = min(C.shape[1], len(L)); Xf = np.vstack([C[:, :n], L[None, :n] * 2])
nov = np.r_[0, np.linalg.norm(np.diff(Xf, axis=1), axis=0)]
nov = uniform_filter1d(nov, 2)
cuts = [0] + sorted(i for i in find_peaks(nov, distance=4, prominence=np.percentile(nov, 70))[0]) + [len(downbeats)]
sections = []
for n, (a, b) in enumerate(zip(cuts[:-1], cuts[1:])):
    s = downbeats[a] if a < len(downbeats) else dur; e = downbeats[b] if b < len(downbeats) else dur
    lvl = float(np.mean(L[a:b])) if b > a else 0
    sections.append({'name': f's{n:02d}', 'start': round(s if n else 0.0, 3), 'end': round(e, 3), 'loudness': round(lvl, 3)})

out = {'duration': round(dur, 3), 'bpm': round(60 / period, 3), 'beat_period': round(period, 5), 'time_signature': 4,
       'beats': beats, 'downbeats': downbeats, 'sections': sections, 'fps': FPS, **feats, 'onsets': ons,
       'notes': 'light_analyze.py: no stems (model downloads blocked). drums/vocal/bass/other are HPSS + band proxies, '
                'not separated stems. Constant tempo grid; downbeat phase from low-band onsets; sections from chroma+loudness novelty.'}
json.dump(out, open(dst, 'w'))
print(f"duration {dur:.2f}s  bpm {60 / period:.2f}  beats {len(beats)}  downbeats {len(downbeats)} (phase {k0})  sections {len(sections)}")
for s in sections: print(f"  {s['name']}  {s['start']:7.2f} - {s['end']:7.2f}   loud {s['loudness']:.2f}")
print('onsets', {k: len(v) for k, v in ons.items()})
