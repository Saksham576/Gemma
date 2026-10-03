# Kinetic Shorts: three AI/dev hot takes

Three beat-synced, kinetic-type YouTube Shorts in the style of the reference video Min Choi's post was about (see [REFERENCE.md](REFERENCE.md)). Each is 24 s, 1080×1920 at 30 fps, with an original synthesised track, and loops seamlessly.

| Short | The take | Thread |
|---|---|---|
| [`a_3am`](out/a_3am/a_3am.mp4) | Your code at 3 AM: 847 packages for a button, "DON'T. TOUCH. IT.", the error flood, CTRL+Z ×3, it's 5 AM anyway | the clock |
| [`b_prompt`](out/b_prompt/b_prompt.mp4) | How an AI reads "make it pop": tokens, odds race, "Sure! I've made it pop." and the screen literally pops; prompt engineering is vibes | the prompt box |
| [`c_last10`](out/c_last10/c_last10.mp4) | The last 10%: an infinite zoom into the progress bar (99.9 → 99.99 → …), it's DNS, SHIP IT, who broke prod, back to 0% | the progress bar |

**Posting:** see [UPLOAD.md](UPLOAD.md).

## How it's built

- **Engine:** the Canvas2D engine from `portfolio-video-v2` (bloom, grain, plotter lettering), made vertical. About 50 ms per frame, so a Short renders in about a minute on any machine, with no GPU needed.
- **`src/kinetic.js`, the house style:**
  - `slam()` for beat words: overshoot, creep, echo outlines on accents, auto-fit to the safe area.
  - `typeOn`, `roll` (counters), `glitch`, `shakeAt`, `beatStrobe`, `camZoom`, `hud`.
  - `SAFE` keeps everything out of the Shorts UI (bottom 400 px, right 190 px).
- **`src/music.js`:** a 120 bpm track (kick, snare/clap, hats, saw bass, stabs, risers, silences before punchlines) plus foley. Every slammed word gets a whoosh, and every accent an impact, derived from the same `WORDS` timeline.
- **`src/shorts/*.js`:** one file per Short: its `WORDS`, its drawing, and its cues.

## Run it

```bash
cd yt-shorts-v2 && npm install
open "studio.html?short=b_prompt"                       # scrub, or ▶ to play with sound
node render.mjs --short=b_prompt --sheet=1,4,8,12,16,20 --cols=6 --w=220 --out=out/check/b.jpg
node render.mjs --short=b_prompt --frames --workers=3   # → out/b_prompt/frames
node render.mjs --short=b_prompt --audio                # → out/b_prompt/{music,sfx,mix}.wav + cues.json
node render.mjs --short=b_prompt --encode               # → out/b_prompt/b_prompt.mp4
python3 scripts/pacing.py out/b_prompt/b_prompt.mp4     # big hits/s vs the reference's 3.5
python3 scripts/check_audio.py out/b_prompt/sfx.wav out/b_prompt/cues.json
```

## Credits

- Style reference: [mexicat/pdoom-video](https://github.com/mexicat/pdoom-video) (MIT). It was analysed, not copied; no code or audio from it is used here.
- Fonts (SIL OFL): Archivo, IBM Plex Mono, Cormorant Garamond. Hershey lettering via hersheytext (MIT). Sound: Tone.js (MIT).
