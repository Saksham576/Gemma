# Saksham — portfolio reel v2

**Watch:** [`out/portfolio_v2.mp4`](out/portfolio_v2.mp4). 1920×1080, 30 fps, 30 s, AAC stereo at −14 LUFS. It loops seamlessly.

A single continuous take. One orange signal point draws a line that becomes every scene in turn: it signs the name, scans a table clean (**TableProof**), turns out to have been drawing terraced rice fields, falls as a drop of rice water (**Pilgrim**), ripples into a ring (**Ultrahuman**), beats as a heart, flatlines into the page, and signs the name again. No wipes, dissolves or cuts. The beat-by-beat plan is in [STORYBOARD.md](STORYBOARD.md).

## How it's built

- **Picture:** plain Canvas2D, with no WebGL, so it renders fast even without a GPU (~45 ms/frame here). Every frame is a pure function of time; frames render in parallel and out of order. Bloom comes from a half-res glow layer that is blurred and added; grain and a vignette are composited over the top.
- **One timeline:** `src/timeline.js` holds every time constant (`T`). The plates and the sound read the same numbers.
- **The seams are shared geometry, not effects.** `src/field.js` defines one set of lines that are first the table's rules, then contour lines, then terraces in perspective. The ripple radius converges into the torus that `p3_ultrahuman.js` draws.
- **Sound:** `src/score.js` synthesises the score (a D-major pad, plucks, bass, and a 4-note motif that plays whenever the name is signed) and 77 foley cues with Tone.js `Offline`, in the same headless Chrome. Each sound's pan follows its source on screen.
- **Sync check:** `scripts/check_audio.py` detects onsets in the sfx stem and confirms every hit cue sounds within one frame (±33 ms). `out/sync_sheet.jpg` shows frames above the final mix's spectrogram, with the cues marked.

## Run it

You need Node.js, Chrome or Chromium, ffmpeg, and Python 3 with numpy (for the sync check).

```bash
cd portfolio-video-v2
npm install
open studio.html                               # scrub; ▶ plays it with sound in real time
node render.mjs --sheet=1,5,8,12,15,19,22,26,29 --out=out/check/sheet.jpg
node render.mjs --frames --workers=3           # → out/frames (resumable)
node render.mjs --audio                        # → out/audio/{music,sfx,mix}.wav + cues.json
node render.mjs --encode                       # → out/portfolio_v2.mp4
python3 scripts/check_audio.py out/audio/sfx.wav out/audio/cues.json
```

## Credits

- Analysis references: [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video) (the recurring "spark" thread, the bookend loop, beat-snapped seams) and [JohnHeibel/PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) (transitions motivated by on-screen action). Both are MIT. No code from either is used here.
- Fonts (SIL OFL, bundled): Archivo, IBM Plex Mono, Cormorant Garamond. Single-stroke lettering: Hershey fonts (public domain) via [hersheytext](https://github.com/techninja/hersheytextjs) (MIT).
- Audio: [Tone.js](https://tonejs.github.io) (MIT). Every sound is synthesised; there are no samples.
