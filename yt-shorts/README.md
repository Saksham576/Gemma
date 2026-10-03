# Sak Shorts: three pilot animated YouTube Shorts

These are three wordless, looping cartoon gags starring Sak, the watercolour mascot from the portfolio reel. Each one is built to test a different hook on YouTube Shorts.

| Short | Length | Hook type | The gag |
|---|---|---|---|
| [Toast](out/toast/toast.mp4) | 18 s | suspense | Sak stares down a ticking toaster; the toast flies off and doesn't come back… until it does, as a hat |
| [Tower](out/tower/tower.mp4) | 20 s | tension | One more block on a wobbling tower; perfect balance; a fly lands |
| [Cloud](out/cloud/cloud.mp4) | 20 s | absurd premise | A personal rain cloud that follows Sak everywhere, defeated by a flower… which sneezes |

- **[RESEARCH.md](RESEARCH.md):** what's working in animated Shorts right now, whether to start with Shorts or long-form, and the craft rules these pilots follow.
- **[UPLOAD.md](UPLOAD.md):** titles, descriptions, hashtags, posting order, and the metrics to watch.

## How they're made

- **Picture:** p5.js and p5.brush, built on [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (MIT). Linework boils at 12 Hz, the character is the Clawd rig recoloured as Sak, and faces change through `emotions()`. The canvas is vertical, 1080×1920. Every frame is a pure function of time, and each Short's last frame flows into its first.
- **Sound:** `src/audio.js` synthesises a cartoon foley library and a looping music bed with Tone.js `Offline`. Each Short registers its cues from the same time constants as its shots. The music drops out for each gag's silent beat.
- **Fast fills:** on a CPU-only machine, p5.brush's bleeding watercolour fills cost ~30 s per frame. `--fast` swaps them for flat translucent washes (~1–2 s per frame, nearly identical look). The final renders use it. Drop `--fast` on a machine with a GPU for the full watercolour texture.
- **Safe zones:** the action stays out of the bottom 380 px and the right 180 px, where the Shorts player draws its buttons.

## Run it

```bash
cd yt-shorts && npm install
open "studio.html?short=tower"                   # scrub a Short in Chrome
node render.mjs --short=tower --fast --sheet=1,5,10,15 --cols=4 --w=300 --out=out/check/tower.jpg
node render.mjs --short=tower --fast --frames --workers=3   # → out/tower/frames (resumable, 24 fps)
node render.mjs --short=tower --fast --sound                # → out/tower/{music,sfx,mix}.wav + cues.json
node render.mjs --short=tower --encode                      # → out/tower/tower.mp4
python3 scripts/check_audio.py out/tower/sfx.wav out/tower/cues.json
```

On a machine without a GPU, add `--soft-gl` (and `--chrome=<path>` if Chrome isn't found).

## Credits

- Engine and Clawd rig: [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) by John Heibel (MIT, `LICENSE-ClaudeAnimationBase`).
- Fonts (SIL OFL, bundled): Shantell Sans, Permanent Marker, Plus Jakarta Sans, Instrument Serif.
- Sound: [Tone.js](https://tonejs.github.io) (MIT). Every sound is synthesised.
