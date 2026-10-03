# pacing.py: how much the picture changes, compared with the reference. Samples at 12 fps, greyscale, small size.
#   change/step = mean |pixel difference| between samples (0–255); big hits/s = steps with change > 8; still = steps < 0.6
# Usage: python3 scripts/pacing.py video.mp4 [seconds] [w h]
import subprocess, sys, numpy as np
path, secs = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 24
w, h = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (54, 96)
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-t', str(secs), '-i', path, '-vf', f'fps=12,scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(float)
d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
print(f'{path}: change/step {d.mean():5.2f}   big hits/s {(d > 8).sum() / (len(d) / 12):4.2f}   still {(d < .6).mean() * 100:3.0f}%')
