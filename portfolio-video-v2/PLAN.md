# Portfolio reel v2: plan

Status: **plan only**. Nothing is built yet.

## Decisions (answered 2026-10-03)

- **Style:** technical treatise. Ink `#0A0A0B` / panel `#151517` / bone paper `#EEE9DF`, one hazard-orange signal `#FF4D12` (ember `#FF8A3D`), plotter hairlines, Archivo for display, IBM Plex Mono for data, light 3D wireframes only. No mascot.
- **Sound:** a score and foley generated in code from the animation's own cue timeline (section 3).
- **Length:** ~30 s, a seamless loop (last frame = first frame).
- **End plate:** "Saksham", plus `TableProof · Pilgrim · Ultrahuman`. No contact details.
- **Delivery:** `portfolio-video-v2/` on `claude/clever-fermat-jy52f7`; v1 stays as it is; no PR unless asked.

## 1. What I analysed, and how

| Source | What I could check | Route |
|---|---|---|
| Min Choi's X post | Nothing. x.com (and YouTube) are blocked by this environment's network policy. | — |
| **JohnHeibel/PDoomVideo** (watercolour Clawd cartoon, MIT) | Full source, storyboard and soundtrack. I re-rendered its scene changes from source. | git clone + headless render |
| **mexicat/pdoom-video** (Three.js/GLSL "technical treatise", MIT) | Full source, `docs/TREATMENT.md`, `docs/ENGINE.md`, `data/audio.json` | git clone |

Both were made with Claude Opus 5.5 in Claude Code, and both are called "I'm Upping My P(doom)". Because x.com is blocked, I can't confirm which one Min Choi's post shows. AntiGravity's second analysis says mexicat, and its descriptions hold up against the source: the 180° roll on "boss" (`loss.ts:266`), the CRT collapse into a flatline (`shoggoth.ts:354`) and the paper tear (`bureau.ts`) are all real. **Its quoted code snippets are paraphrases, not the actual code**, so treat them as descriptions.

### What each one does at a scene change

**Heibel (watercolour):** within a chapter, the action carries the cut (a cause and its effect).
- The chomp's teeth close over the camera, and the open mouth reveals the stage.
- A heart bubble swells and pops, revealing the next set.
- A bomb fuse leads to a full-frame BOOM card, which clears into the jazz club.
- A dense cube drops through the floor and rolls into the next scene.
- A pull-back reveals the "apocalypse" was a stage set.

Between chapters it still uses **brush wipes**. So did my v1, at 2 of its 3 seams (an iris and a wipe), and that's the "clubbed scenes" feel you objected to.

**mexicat (treatise):** **one recurring element threads the whole video**, *the spark*: "one orange point of light dragging a line behind it". It writes the first lyric, draws the loss curve, becomes a stock chart, bends into the first paperclip, is revealed as a burning fuse, and detonates. At the seams, geometry turns into other geometry: a CRT collapse to a flatline that becomes an oscilloscope trace, contour rings that match UI rings, letters shattering into line segments, a paper tear, and an axis rotating 90° into a tower. The crop-mark frame appears only at the two ends, so **the last frame equals the first and the video loops**. Every cut is snapped to the analysed beat grid of the song (132.007 bpm, `data/audio.json`).

**The lesson for v2:** the clever part isn't the shaders. It's that **every seam is the same object changing shape, on a beat, in an unbroken camera move**.

## 2. The v2 idea: one thread, no cuts

**Rule:** one continuous take. No wipes, irises or dissolves. Every change of scene is the thread morphing into the next subject's geometry, on a downbeat. **Thread:** one orange signal point (`#FF4D12`) dragging an ink line. It is the cursor of Saksham's work.

| ~time | Plate | What the thread does (each seam is a morph of the thread, not a transition effect) |
|---|---|---|
| 0–3 s | **Open**: crop-mark sheet | The spark writes **Saksham** in a single-stroke plotter font. The underline it draws keeps going. |
| 3–10 s | **TableProof** | The underline becomes the scanline of a PDF page: the spark rasters down a messy scanned table. Wobbly cells snap into a clean grid, with confidence values in mono (`0.97`, `0.94`…). One cell flags orange (`0.61 ⚠`). The spark clicks it and it settles (`✓ 0.98`). |
| seam | grid → paddies | The camera pulls back, and the table's horizontal rules bend into contour lines: **the grid was a terraced rice field seen from above** (engraving / guilloché style). |
| 10–17 s | **Pilgrim** | The spark falls as a single drop of rice water into one terrace. Concentric ripples spread in engraved rings. The bottle is drawn in plotter lines around the ripple. |
| seam | ripple → ring | The ripple rings tighten into one band, which tilts in perspective into **a wireframe smart ring**. |
| 17–24 s | **Ultrahuman** | The spark orbits inside the ring as its sensor, and its trail unrolls into a heartbeat trace on an oscilloscope grid. A sleep hypnogram draws itself, and the readiness score counts up to `92`. |
| seam | heartbeat → signature | The trace flatlines, and the flat line rises as the baseline the spark signs on. |
| 24–30 s | **Outro** | The spark re-signs **Saksham**; the three subjects are recalled as tiny plates along the baseline. The crop marks close in around the opening's sheet. **The last frame = the first frame (a seamless loop).** |

The same thread chain works in either visual style (question 1). In the watercolour style the grid → paddy pull-back, the ripple → ring, and the pulse → signature line are painted instead of drawn as hairlines.

## 3. Sound design (v1 had none: see the chat message for why)

All sound comes from the same timeline as the picture, so sync is exact and every sound is royalty-free.

1. **A cue list from the scenes.** Each scene registers its sound cues in closed form (`cue(t, 'scan-tick', {x})`), just as it draws. The renderer exports `out/cues.json`, with each cue's time, type, gain, and stereo pan taken from the source's screen x.
2. **Synthesis.** Tone.js (npm) renders inside the same headless Chrome with `Tone.Offline`, so it is deterministic. Fallback: Python + numpy.
   - **Score:** one continuous piece at a fixed bpm, with cuts on downbeats. A 4-note "Saksham" motif, re-voiced per plate: plucked/kalimba for the table, soft koto-like plucks and water for Pilgrim, a warm pad with a heartbeat kick for the ring, and the full motif resolving for the signature. Morph seams land on key changes.
   - **Foley:** pen scratch for the plotter strokes (band-passed noise), soft clicks as each table cell snaps, a warning blip then a confirm chime on the flagged cell, a water drop and ripple shimmer, a ring "ting", heartbeat thumps, and a riser into the signature.
   - **Mix:** sidechain duck under hits, pan follows the image, and loudness normalised to −14 LUFS (ffmpeg `loudnorm`). Also exports `music.wav` / `sfx.wav` stems.
3. **Mux:** AAC 192k, 48 kHz.
4. **Verification.** I can't listen, so I check numerically: detect onsets in the rendered audio (librosa) and confirm each designed cue lands within ±1 frame. I'll also render a spectrogram strip aligned under a contact sheet (sent to you), and check the loudness report.

Alternative: you supply a licensed track. Then I do mexicat's step: beat/downbeat analysis, then snap the edit to the beat grid. Sound effects still play on top.

## 4. Build steps (each with its check)

1. **Benchmark the engine first** (CPU-only container): one test plate rendered at 1080p. → check: seconds per frame. This decides the motion-blur samples and on-ones vs on-twos rendering, keeping the total render under ~3 h.
2. Write `STORYBOARD.md`: the beat grid, every seam as "geometry A → geometry B on beat N", and the reads per plate, like v1's format. → check: no seam uses a wipe, dissolve or cut.
3. Build the thread first (`thread(t)` → position, trail, morph state) as one function used by every plate. → check: a strip across each seam shows one continuous object.
4. Build the plates in order, each a pure `f(t)`. → check: contact sheet per plate, plus a 24-frame strip across every seam.
5. Sound: cues, then the score and foley, then the mix. → check: onset alignment report and spectrogram/sheet.
6. Render (resumable, in under-2 h chunks so the background limit can't kill it), encode, and mux. → check: ffprobe for duration, resolution and the audio stream, and that frame 0 equals the last frame for the loop.
7. Commit to `portfolio-video-v2/` on `claude/clever-fermat-jy52f7` (v1 stays as it is) and push. Opening a PR is your call.

## 5. Risks I'm planning around

- **CPU rendering.** Raymarched GLSL and many-sample motion blur are very slow in software WebGL. In the treatise style I'd keep it to lines, type and light 3D wireframes; no raymarched volumes unless step 1 shows they're affordable.
- **2 h limit on background jobs.** I'll render in resumable chunks, not one run (v1 lost a run to this).
- **I can't hear the mix.** It's verified by onsets, spectrogram and loudness only. Your ears are the final check.
- **Brand names.** Pilgrim and Ultrahuman would appear only as small mono labels, with no logos.
