# Saksham — portfolio reel: storyboard

**Logline:** Sak, a little ink-and-watercolour builder, tames three messy problems in a row (a paper avalanche, a bowl of rice water, a sleepless night), and every one it solves leaves a keepsake that ends up around its name.

**Length:** 20 s · 1920×1080 · 24 fps, animated on twos · 120 bpm (one beat = 0.5 s). No music; everything still lands on the beat grid.

**Medium:** p5.brush only. Flat `wash` plus a boiling ink outline for characters and props, soft watercolour `fill` for grounds, `glow()` for anything that shines. Linework boils at 12 Hz. No pure black or white: ink `#2B2233`, paper `#F3EBDC`, cream `#FFF5E2`.

## Cast

| Who | Look | Role |
|---|---|---|
| **Sak** | The Clawd rig (10u × 8u block, four legs, two arm nubs, slit eyes), recoloured teal-sap (`#4F8F8A` / `#2E6460` / `#93CBBF`), with round ink-rim **glasses**. | The builder, and the only actor. Every emotion change goes through `emotions()`. |
| **The pages** | Cream rounded rectangles with scribbled, crooked table lines. | Chaos in chapter 1. |
| **The gem-lens** | A faceted blue gem (a nod to Gemma), held on Sak's arm. | The tool that turns chaos into a table. |
| **The table card** | A cream card with a clean 4×3 painted grid; one cell is rose (a flag), then sap with a tick. | Keepsake 1 (TableProof). |
| **The bottle** | A round ceramic bottle with a rose cap, filled with milky rice water. | Keepsake 2 (Pilgrim). |
| **The ring** | A slim dark-titanium ring with a teal inner glow. | Keepsake 3 (Ultrahuman). |

## World and colour arc

One paper world, with the light changing as the work changes:

- **Ch1 · warm lamp desk:** paper, ochre lamp light, clay desk.
- **Ch2 · rice-water morning:** cream, blush rose, pale sap.
- **Ch3 · night into dawn:** indigo and violet, then a teal ring glow, then an ochre sunrise.
- **Ch4 · back to warm paper:** paper ground with all three accent colours together.

**Motif:** *paper*. The film opens on a stack of blank paper that buries Sak and ends on one clean sheet carrying Sak's name. Each keepsake also returns in the finale.

**Sak's arc (emotion keys):** neutral → surprised → thinking → idea → determined → proud ‖ happy → hopeful → love ‖ sleepy → surprised → excited ‖ determined → happy → proud.

**Text policy:** chapters 1–3 have no words at all. The only lettering is the finale's name card, `Saksham` (Shantell Sans 800, ink drop-shadow), with one small line under it, `TableProof · Pilgrim · Ultrahuman` (Plus Jakarta Sans 700). The projects are identified once, at the end, beside the keepsakes that already showed them.

---

## Shots

```
A  0.0–5.0   [in: iris opens from ink onto Sak]   CH1 · TableProof · the paper avalanche
   Sak (u 24) at a clay desk under an ochre lamp; a tall wobbling stack of pages beside it.
   EVENT: the stack topples and buries the desk in scribbled pages. Sak finds the gem-lens; pages fly through
          its beam and land as a neat grid card. One cell flags rose, Sak taps it, and it turns sap with a tick.
   camera: slow push 1.0 → 1.08; shake on the topple; drift right toward the card; push into the card at the end.
   reads: 0.0–0.6  iris opens on Sak at a desk, with a stack of paper beside it (stack already wobbling)
          0.6–1.3  the stack leans (anticipation), then topples: pages rain down (shake on 1.0)
          1.0–1.6  Sak's surprised take ("!"), half-buried
          1.6–2.3  Sak thinking (dots), looks at the mess  → 2.2 idea (bulb), arm shoots up with the gem
          2.4–3.4  gem glows; pages arc one by one through the beam into the card; grid cells fill on eighths
          3.4–3.9  one cell flashes rose with a "?"; Sak's eyes go to it
          3.9–4.3  Sak taps it: the cell turns sap and a tick is painted in (spring)
          4.3–5.0  Sak proud (spark); the camera pushes into the clean cream cell until it fills the frame
   [out: push-through. The cream cell becomes the cream frame that opens shot B (match on colour/shape)]

B  5.0–10.0  [in: cream fills the frame, zoom back out to milky water]   CH2 · Pilgrim · rice water
   A ceramic bowl of milky rice water on a rose cloth; Sak (u 26) beside it holding an empty round bottle.
   EVENT: a drop falls into the bowl. Sak dips the bottle, lifts it full, caps it with a pop, dabs a drop on its
          cheek and glows; then it tosses the bottle high.
   camera: zoom out 2.2 → 1.0 on the bowl; gentle drift; tilt up to follow the toss.
   reads: 5.0–5.6  zoom out from the water surface: a bowl, and Sak beside it (happy)
          5.6–6.2  a drop falls (eye leads from the top), ripples ring out
          6.2–7.0  Sak (hopeful) dips the bottle on an arc into the bowl, then lifts it; milk fills from the bottom up
          7.0–7.4  cap pops on (spring and sparkle)
          7.4–8.3  Sak dabs a drop on its cheek: glow and sparkle, then love (hearts, blush)
          8.4–10.0 wind-up, then a toss: the bottle flies up on an arc and the camera tilts after it into a darkening sky
   [out: brush wipe in indigo/violet as the bottle leaves frame top (9.7–10.3)]

C  10.0–15.0 [in: brush wipe drags off]   CH3 · Ultrahuman · night → dawn
   Night hill, indigo sky with boiling stars; Sak (u 26) asleep on a little pillow.
   EVENT: something glinting falls from the sky (the toss comes down changed): a ring. It lands on Sak's arm nub,
          glows teal and beats a pulse across the sky; Sak wakes, the sun rises behind, Sak leaps and runs off.
   camera: slow push; shake on the landing; tilt down with the ring; then pull back for the sunrise and pan right with the run.
   reads: 10.0–10.9 night, Sak asleep (zzz); a glint starts high in the sky and falls toward Sak (eye leads)
          10.9–11.4 the ring lands on Sak's arm: spring and sparkle
          11.4–12.4 the ring glows teal and a pulse line draws across the sky, beat by beat; Sak stirs → surprised
          12.4–13.3 dawn: an ochre sun rises behind the hill, the sky warms; Sak → excited
          13.3–14.0 jump (crouch, stretch, land)
          14.0–15.0 Sak trots right, faster; the camera whips right after it
   [out: whip pan right, smear and cut on action into shot D]

D  15.0–20.0 [in: whip pan lands, Sak skids in from the left]   CH4 · the signature
   Warm paper; one big clean sheet laid on the ground (it rhymes with the opening stack).
   EVENT: Sak skids in holding a big brush and paints a swoosh; the name rides the swoosh in. The three keepsakes
          arc in around it, then Sak takes a bow and the iris closes on it.
   camera: settles from the whip (rotation overshoot), slow push 1.0 → 1.05.
   reads: 15.0–15.6 Sak skids in (stretch → squash), determined, brush in its arm
          15.6–17.0 Sak drags the brush in a big swoosh; "Saksham" pops in letter by letter behind the bristles
          17.0–18.0 the keepsakes arc in one at a time (card left, bottle centre, ring right), each with a sparkle
          17.7–18.3 the project line fades in under the name
          18.3–19.2 Sak looks at us, happy, then proud and takes a bow
          19.2–20.0 iris closes on Sak; hold; black
   [out: iris to ink]
```

## Checks against the rules

- **An event in every shot:** topple and solve; fill, cap and toss; ring lands and wakes Sak; paint and bow. ✔
- **Reads in sequence:** no two big reads overlap; every cause comes before its reaction (topple → take, drop → dip, ring → wake). ✔
- **A transition at every seam:** iris in · push-through match · brush wipe · whip pan · iris out. ✔
- **Text:** only the end card. ✔
- **Ending rhymes with the opening:** a stack of messy paper becomes one clean signed sheet; iris in and iris out. ✔
