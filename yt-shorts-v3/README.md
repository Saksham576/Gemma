# "Google It!" — flagship Short (vertical, 31.9 s)

A music-video Short cut to the song's first chorus and the start of verse 2 (song time 26.38–58.28 s, 14 bars at 105.3 BPM).
It is built on the engine from mexicat's *I'm Upping My P(doom)* (MIT, see `LICENSE-pdoom-video`), made vertical.

- **Preview** (rendered in the cloud, software GL): `out/preview_google_it.mp4`.
- **Full quality** (your GPU): see [RENDER-ON-PC.md](RENDER-ON-PC.md).

## Treatment

**One idea:** the song says "Google it"; in 2026 nobody googles any more. Every plate is a piece of search UI, pushed into an AI-era joke.

**One recurring object:** the search pill and its magnifier.
- The pill opens and closes the Short.
- The magnifier's ring becomes the O in GOOGLE.
- The crowd's grid becomes the keyboard.
- The keyboard types the next query.

**Seams:** every cut lands on a beat and carries geometry across it (a ring, a grid, a pill or a meteor flash). There are no crossfades.

**Loop:** the last beat clears the pill, which matches the first frame.

| # | Plate | Song time | Lyric (aligned) | Picture |
|---|---|---|---|---|
| 1 | `query` | 26.38 | "really?" | A question is typed on the 16ths. Autocomplete drifts from "be productive" to "stop asking ai". On ⏎ the camera dives into the magnifier. |
| 2 | `everybody` | 29.23 | "Google it! / Everybody" | The lens ring lands as the O of GOOGLE and IT! slams in. The result count rolls to 8,100,000,000 while the camera pulls out through a crowd of that many people. |
| 3 | `keys` | 32.65 | "Click clack" | The people square off into keycaps. Drum hits press keys and the last six 8ths type G-O-O-G-L-E. |
| 4 | `recurse` | 36.07 | "Just Google it! … Google" | A light-mode results page whose image result is the page itself. The camera drops one level per beat (Droste zoom), and each query gets sillier. |
| 5 | `overview` | 40.05 | — | ✦ AI Overview: "eat at least one small rock per day". A whip to the next card ("⅛ cup of non-toxic glue"), then the AI-mistakes fine print slams on. |
| 6 | `captcha` | 44.61 | (instrumental) | "Select all squares with A HUMAN". The AI cursor picks every robot, then stamps VERIFIED HUMAN. |
| 7 | `dino` | 49.16 | (instrumental) | No internet. The pixel dino jumps cacti that arrive on the beat, then a meteor hits. |
| 8 | `couch` | 53.72 | "Are you stuck on the couch? / What's the capital of Norway?" | Both questions are typed as they're sung. "oslo — you knew that". The pill is cleared, which closes the loop. |

## Lyrics and timing

**Lyrics are partial.** `data/google-it/lyrics.json` holds only the words the speech recogniser could hear with confidence:
- The recogniser is Vosk small-en, run offline. Its model came from an npm package, because the model hosts are blocked here.
- It used a constrained grammar on the mix.
- The other lines in this window are left without captions.

**To add the real lyrics:** paste them and they get aligned the same way. Plates 5–7 can then quote them.

**Song analysis:** `data/google-it/audio.json` comes from `analysis/light_analyze.py` (librosa). It holds beats, downbeats, onsets and envelopes, in the reference's schema.

## Layout

- `app/src/scenes/_short.ts`: shared plate base. It covers the camera, the background shader (ink/paper, dot grid, glow), the radial blur, the orange bloom boost, figure captions and drawing helpers.
- `app/src/scenes/{query,everybody,keys,recurse,overview,captcha,dino,couch}.ts`: the plates.
- `app/src/timeline.ts`: the cut, with cuts snapped to beats and lyric words. `?landscape` restores the reference's timeline and size, kept for benchmarking.
