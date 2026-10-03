# check_audio.py: does every percussive cue actually sound on its frame?
# Detects onsets in the sfx stem (spectral flux, 2.5 ms hop) and, for each cue that should start with a hit, finds
# the nearest onset. Pass = within one video frame (33.3 ms). Swells/risers are skipped: they fade in by design.
# Usage: python3 scripts/check_audio.py out/audio/sfx.wav out/audio/cues.json
import json, sys, wave
import numpy as np

wav, cues = sys.argv[1], json.load(open(sys.argv[2]))
with wave.open(wav) as w:
    sr, n = w.getframerate(), w.getnframes()
    x = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, 2).mean(axis=1) / 32768.0

hop, win = int(sr * .0025), 1024
frames = np.lib.stride_tricks.sliding_window_view(np.pad(x, (win, 0)), win)[::hop] * np.hanning(win)
mag = np.abs(np.fft.rfft(frames, axis=1))
flux = np.maximum(0, np.diff(np.log1p(mag * 50), axis=0)).sum(axis=1)
flux = np.convolve(flux, np.ones(3) / 3, mode='same')
thr = np.median(flux) + 2.5 * np.std(flux)
peaks = [i for i in range(1, len(flux) - 1) if flux[i] > thr and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]]
onsets = np.array([(i + 1) * hop / sr - win / sr / 2 for i in peaks])   # centre of the analysis window

HITS = {'motif', 'thump', 'tick', 'warn', 'knock', 'confirm', 'drop', 'shimmer', 'ting', 'ping', 'heart', 'step', 'count', 'ding', 'chime', 'flatline'}
FRAME = 1 / 30
rows, bad = [], 0
for c in cues:
    if c['kind'] not in HITS: continue
    d = onsets - c['t']
    near = d[np.argmin(np.abs(d))] if len(d) else 9
    # second test, for soft or low sounds the flux misses: the stem's energy in the frame after the cue vs just before
    i0 = int(c['t'] * sr)
    pre = np.sqrt(np.mean(x[max(0, i0 - int(.06 * sr)):i0] ** 2) + 1e-9)
    post = np.sqrt(np.mean(x[i0:i0 + int(FRAME * sr)] ** 2) + 1e-9)
    rise = 20 * np.log10(post / pre)
    ok = abs(near) <= FRAME or rise >= 3
    bad += not ok
    rows.append(f"{c['t']:7.3f}s  {c['kind']:9s}  onset {near * 1000:+7.1f} ms  rise {rise:+5.1f} dB  {'ok' if ok else 'MISS'}")
print('\n'.join(rows))
print(f"\n{len(rows) - bad}/{len(rows)} hit cues sound within one frame (onset within ±33 ms, or energy +3 dB in the frame after the cue); {len(onsets)} onsets detected")
sys.exit(1 if bad else 0)
