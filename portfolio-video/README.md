# Saksham — portfolio reel

A 20-second, hand-painted motion-graphics reel (1920×1080, 24 fps, animated on twos). Every frame is procedurally painted in [p5.js](https://p5js.org) and [p5.brush](https://github.com/acamposuribe/p5.brush). Watch **[`out/portfolio_web.mp4`](out/portfolio_web.mp4)**. The full-quality master, `out/portfolio.mp4`, is too large to commit; rebuild it with the steps below.

Sak, a little ink-and-watercolour builder, works through the three projects in this repo:

| time | chapter | project |
|---|---|---|
| 0–5 s | a paper avalanche, sorted into a clean table through a gem-lens, with one flagged cell fixed | **TableProof**: the Gemma 4 PDF table auditor (`frontend/`, `backend/`) |
| 5–10 s | milky rice water, bottled, capped, dabbed on the cheek | **Pilgrim**: the rice-water moisturizer landing page (`pilgrim/`) |
| 10–15 s | a ring falls from the sky, beats a pulse line, and the sun comes up | **Ultrahuman**: the smart-ring landing page (`ultrahuman_landing/`) |
| 15–20 s | Sak paints its name across a clean sheet; the three keepsakes land around it | the signature |

## How it's made

- **No video model.** Each frame is a pure function of time, `frame(t)`. There's no state between frames, so frames render in parallel and out of order.
- **Linework boils at 12 Hz.** The randomness reseeds 12 times a second, like hand-drawn cartoons shot on twos. The final render is on twos as well.
- **Everything is painted.** Washes, watercolour fills that bleed into a paper texture, and ink outlines. There are no plain digital shapes and no pure black or white.
- **Acted faces.** Mood changes go through an `emotions()` timeline: anticipation squash, squint, swap, take, then an overshoot settle.
- **Workflow:** [STORYBOARD.md](STORYBOARD.md) (shots and the timing of each read), then [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) (the project contract plus the kit's rules), then one IIFE file per chapter in `src/scenes/`. Contact sheets were checked chapter by chapter before the final render.

## Run it

You need Node.js, Chrome or Chromium, and ffmpeg.

```bash
cd portfolio-video
npm install
open studio.html                                   # scrub it in Chrome (?t=12 jumps to a time)
node render.mjs --sheet=1,3,6,8,11,13,16,19 --cols=4 --w=480 --out=out/check/sheet.jpg
node render.mjs --frames --twos --workers=3        # parallel, resumable frames → out/frames
node render.mjs --encode --out=out/portfolio.mp4
ffmpeg -i out/portfolio.mp4 -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart out/portfolio_web.mp4
```

Add `--soft-gl` on a machine with no GPU. The watercolour fills then render slowly, about 30 s per frame. If Chrome isn't in a standard location, pass `--chrome=<path>`.

## Credits

- Engine, Clawd rig and renderer: [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) by John Heibel (MIT, `LICENSE-ClaudeAnimationBase`). It's the base behind the "I'm Upping My P(doom)" video.
- Fonts (SIL Open Font License, bundled in `assets/fonts`): Shantell Sans, Permanent Marker, Plus Jakarta Sans, Instrument Serif.
