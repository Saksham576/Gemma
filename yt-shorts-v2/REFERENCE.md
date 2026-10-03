# The reference, measured

**The video:** the one from Min Choi's post, uploaded to branch `copilot/run-claude-remote-control-command`. It's 156.7 s, 480×270 at 60 fps. It is mexicat's *"I'm Upping My P(doom)"* ([mexicat/pdoom-video](https://github.com/mexicat/pdoom-video), MIT), a code-rendered "technical treatise" music video.

## What makes it work

1. **The song is the spine.** Every sung word lands on screen on its beat, and punch words go huge: "**AGI**" fills half the frame at about 3 s.
2. **It never stops moving.** Measured below, it has about 3.5 big visual hits per second and almost no still frames. Its first 20 s contain **zero hard cuts**: one orange spark keeps drawing (a plotted unicorn, a loss curve). It bursts into flicker cuts only on the hook (16 cuts between 20 and 40 s).
3. **Each line is a visual pun, packed with niche references.** It's AI and dev culture, so its audience recognises everything and rewatches to catch what they missed.
4. **One look:** ink black, bone and hazard orange, Archivo display type, mono details, bloom and grain.
5. **The bookend loop:** the end returns to the start.

## Measured pacing

`scripts/pacing.py`: frames sampled at 12 fps in greyscale. "Change" is the mean pixel difference between samples; a "big hit" is a step with change > 8; "still" means change < 0.6.

| | change/step | big hits/s | still |
|---|---|---|---|
| **reference** (first 60 s) | 9.9 | 3.5 | 3% |
| first Shorts (Toast / Tower / Cloud) | 1.9–2.3 | 0.0–0.7 | 3–15% |
| **this set:** `a_3am` | 12.2 | 4.2 | 7% |
| **this set:** `b_prompt` | 7.8 | 4.4 | 8% |
| **this set:** `c_last10` | 9.9 | 5.5 | 4% |

## How the new Shorts borrow it (without copying it)

| Reference device | Here |
|---|---|
| Lyrics slammed on the beat | a word timeline (`WORDS`), one word per beat, that drives both the slams and the sound |
| One recurring element (the spark) | each Short has one thread: the clock (3 AM), the prompt box (prompt), the progress bar (last 10%) |
| Branching tree on "FOOM" | `npm install` growing a dependency tree that doubles every eighth note |
| Odometer overflow | the 99.999…% digits overflowing the screen |
| Silence before a hit | the music drops out for a beat or a bar before every punchline |
| Bookend loop | each Short's last frame leads straight back into its first |
| Beat flashes, never still | a scrolling grid, a scan line every beat, a light strobe on the beat, a camera snap on the off-beat |

The song itself isn't reused. Every Short runs on an original, synthesised 120 bpm track.
