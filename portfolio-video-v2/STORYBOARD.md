# Reel v2: storyboard

**One continuous take, 30 s, loops.** 120 bpm (beat 0.5 s, bar 2 s). There are no wipes, irises, dissolves or cuts: every change of scene is the same object changing shape. **The thread:** one orange signal point (`#FF4D12`) drawing an ink line. Every time constant lives in `src/timeline.js` (`T`), and the picture and the sound both read it.

| time | plate | what happens | how it hands off (the seam) |
|---|---|---|---|
| 0.0–0.4 | open | Bone sheet, crop marks; the signal breathes at the start of the name (identical to the last frame) | — |
| 0.4–2.4 | open | The signal writes **Saksham** in a single-stroke plotter script; the motif plays across it on a bell | — |
| 2.85–3.2 | open | It draws an orange underline | — |
| 3.2–4.0 | open → TableProof | **The sheet collapses vertically into the underline** (a CRT switch-off). One bright line on ink remains | the underline *is* the next scanline |
| 4.0–4.9 | TableProof | The line rises and contracts into the top of a page; a crooked, scanned table fades in | — |
| 5.0–7.0 | TableProof | The scanline sweeps down; each row **snaps clean** as it passes (a click per rule) and its values type in | — |
| 7.0–7.9 | TableProof | `5.O2M` flags orange at 0.61 (two warning beeps); the signal arcs to it and clicks; it corrects to `5.02M` at 0.98 (chime) and the JSON appears | — |
| 8.0–10.0 | TableProof → Pilgrim | The page dissolves; **the table's rules stretch past the page**, lines fade in between them, everything waves into contour lines, and the plane tilts back | the rules *are* the terraces |
| 10–12 | Pilgrim | Terraced fields in perspective. The signal leaves the corrected cell, hovers over a pool, lifts, and **falls as a drop of rice water** | — |
| 12–14 | Pilgrim | Splash: ripples run through the contour lines; the view returns to top-down | — |
| 14–16 | Pilgrim | The signal plots a bottle around the calm ripples; leader-line annotations | — |
| 16–17 | Pilgrim → Ultrahuman | The bottle retracts; **every ripple converges into one band**, which tilts and thickens into a wireframe torus | the ripple *is* the ring |
| 17–18.5 | Ultrahuman | The ring spins; the signal orbits its inner face as the sensor (a ping on each beat) | — |
| 18.5–23 | Ultrahuman | The ring slides left; **the signal leaves it and its trail becomes a heartbeat** (lub-dub on 19, 20, 21, 22); a hypnogram draws; the readiness count reaches 92 | — |
| 23–24 | Ultrahuman → outro | No more beats: **the trace flatlines** (monitor tone), stretches edge to edge and drops to the underline's height | the flatline *is* the sheet's edge |
| 24–25 | outro | **The line opens back into the bone sheet** (the open's collapse, reversed); the crop marks fly in | — |
| 25.2–27.2 | outro | The name is re-signed (the same strokes, the same motif) | — |
| 27.2–28.2 | outro | One mark and name per project, one per beat, each with a chime | — |
| 29.0–29.8 | outro → open | **The ink lifts**: the name un-writes back into the pen; the signal comes to rest at frame 0's position | the last frame *is* the first |

## Reads (what the viewer must get, in order)

1. A name is being signed. 2. The signature's line becomes a scanner. 3. A messy table becomes clean, and one wrong cell is caught and fixed. 4. The table was a landscape. 5. A drop of rice water, and the product around it. 6. The ripple is a ring. 7. The ring reads a heartbeat, sleep and readiness. 8. The heartbeat flatlines into the page. 9. The name again, with the three projects.

Each project gets its title in the same place, with the same reveal, held for at least 1.5 s.
