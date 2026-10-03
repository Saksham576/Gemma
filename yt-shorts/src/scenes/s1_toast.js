// s1_toast.js: "Toast" (18 s, loops). Hook type: suspense.
//   0–4    Sak stares down a ticking toaster, leaning closer, sweating (frame 0 is already mid-tension)
//   4      POP: both slices rocket out of the top of the frame; Sak's take knocks it onto its bottom
//   4.6–10 Sak waits, arms up, ready to catch… nothing comes down. Music drops out. "?" then sad.
//   10.0   the slices finally drop onto Sak's head and stack up like a hat; Sak is delighted, dances
//   13–14.4 Sak puts them back in the slots and pushes the lever again
//   14.4–18 back to the stare: the last frame flows into frame 0
(() => {
  if (SHORT !== 'toast') return;
  const G = 1330, SX = 365, U = 30;                              // counter line, Sak's spot and size
  const TOA = { x: 745, w: 320, h: 230 };                         // toaster: centre x, size (sits on the counter)
  const slot = i => [TOA.x - 62 + i * 124, G - TOA.h + 6];        // the two slot mouths
  const LEVER = [TOA.x - TOA.w / 2 - 8, G - 110];
  const tPop = 4.0, tFall = 10.0, tBack = 13.0, tLever = 14.35, DUR = 18;
  // lean toward the toaster: grows through the stare, resets after the pop; same value at t = 0 and t = 18
  const stare = t => t < tPop ? .55 + .45 * seg(t, 0, tPop) : t > tLever ? .55 * seg(t, tLever, DUR) : 0;

  function kitchen(t) {
    boilSeed('wall');
    paint(rectPts(-200, -600, W + 400, G + 600), { wash: mixCol(PAL.paper, PAL.ochre, .22), ink: null });
    paint(ellPts(760, 420, 520, 420, 30, 10), { fill: mixCol(PAL.cream, PAL.ochre, .35), fillOp: 90, bleed: .3, tex: .6, ink: null });   // window light
    boilSeed('window');   // a window over the counter: sky, a cloud drifting, the frame and its cross bars
    const WX = 600, WY = 700, WW = 380, WH = 340;
    paint(rrPts(WX - WW / 2, WY - WH / 2, WW, WH, 10), { wash: PAL.sky, fill: mixCol(PAL.sky, PAL.cream, .4), fillOp: 90, bleed: .1, tex: .5, ink: null });
    paint(ellPts(WX - 60 + 30 * Math.sin(t * .3), WY - 60, 90, 34, 18, 3), { wash: PAL.cream, washOp: 230, ink: null });
    paint(rrPts(WX - WW / 2, WY - WH / 2, WW, WH, 10), { ink: PAL.ink, sw: 1.4 });
    inkLine([[WX, WY - WH / 2], [WX, WY + WH / 2]], 1.6, PAL.ink, 'ink', 0); inkLine([[WX - WW / 2, WY], [WX + WW / 2, WY]], 1.6, PAL.ink, 'ink', 0);
    paint(rectPts(WX - WW / 2 - 30, WY + WH / 2, WW + 60, 26, 1), { wash: PAL.clayLt, ink: PAL.ink, sw: 1 });   // sill
    boilSeed('plant');   // a little potted plant on the sill, swaying
    paint(rrPts(WX + 110, WY + WH / 2 - 60, 70, 60, 8), { wash: PAL.rose, ink: PAL.ink, sw: .9 });
    for (let k = -1; k <= 1; k++) inkLine([[WX + 145, WY + WH / 2 - 58], [WX + 145 + k * 34 + 6 * Math.sin(t * 2 + k), WY + WH / 2 - 120 - 20 * (k === 0)]], 2.4, PAL.sap, 'ink', .4);
    boilSeed('counter');
    paint(rectPts(-200, G, W + 400, 900, 2), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 70, bleed: .05, tex: .6, ink: null });
    paint(rectPts(-200, G - 8, W + 400, 34, 2), { wash: PAL.clayLt, ink: null });
    inkLine([[-100, G - 8], [W / 2, G - 11], [W + 100, G - 7]], 1.2, PAL.ink, 'ink', .5);
  }
  function toaster(t, glowK, shake) {
    const { x, w, h } = TOA, dx = shake;
    boilSeed('toaster');
    if (glowK > 0) for (const i of [0, 1]) glow(slot(i)[0] + dx, slot(i)[1] + 10, 90, '#FF9A4A', glowK);
    paint(rrPts(x - w / 2 + dx, G - h, w, h, 46, 1), { wash: '#9DC4C0', fill: '#6FA29D', fillOp: 70, bleed: .05, tex: .5, ink: PAL.ink, sw: 1.2 });
    paint(rrPts(x - w / 2 + 18 + dx, G - h + 22, 60, h - 60, 20), { wash: '#C7E0DC', washOp: 200, ink: null });   // shine
    for (const i of [0, 1]) { const [sx, sy] = slot(i); paint(rrPts(sx - 48 + dx, sy - 6, 96, 16, 8), { wash: PAL.ink, ink: null }); }
    paint(rectPts(x - w / 2 - 20 + dx, G - 150, 22, 90), { wash: '#6FA29D', ink: PAL.ink, sw: .8 });             // lever track
    paint(rrPts(x + w / 2 - 60 + dx, G - 70, 36, 36, 18), { wash: PAL.ochre, ink: PAL.ink, sw: .8 });             // dial
    for (const s of [-1, 1]) paint(rectPts(x + s * (w / 2 - 50) - 14 + dx, G - 14, 28, 16), { wash: PAL.ink, ink: null });   // feet
  }
  function lever(down) { boilSeed('lever'); paint(rrPts(LEVER[0] - 46, lerp(G - 150, G - 80, down) - 12, 56, 24, 10), { wash: PAL.ink, ink: null }); }
  function toast(x, y, rot, key) {   // a slice: golden crust, pale crumb
    boilSeed('toast' + key);
    push(); translate(x, y); rotate(rot);
    const P = [[-46, 40], [-48, -18], [-56, -40], [-36, -62], [0, -56], [36, -62], [56, -40], [48, -18], [46, 40]];
    paint(P, { wash: '#C98A3E', ink: PAL.ink, sw: .9, curv: .3 });
    paint(P.map(([a, b]) => [a * .78, b * .78 + 4]), { wash: '#F2D49A', fill: '#E3B465', fillOp: 70, tex: .6, ink: null, curv: .3 });
    pop();
  }

  function shot(t) {
    const pop = t > tPop && t < tPop + .6 ? shakeXY(t, 12 * Math.exp(-(t - tPop) * 8)) : [0, 0];
    const look = easeInOut(seg(t, tPop + .2, tPop + 1.2)) * (1 - easeInOut(seg(t, tFall - .1, tFall + .5)));   // tilt up to the empty ceiling
    const camY = 1130 - 330 * look, push_ = 1.16 + .06 * stare(t) - .1 * look;
    camBegin(590 + pop[0], camY + pop[1], push_);
    kitchen(t);
    const ticking = t < tPop || t > tLever;
    toaster(t, ticking ? .55 + .2 * pulse(t, 8) : .6 * Math.exp(-(t - tPop) * 3), ticking ? 1.5 * Math.sin(t * 40) * pulse(t, 10) : 0);

    // Sak: nervous stare → surprised (pop) → hopeful (arms up) → confused → sad → surprised (bonk) → happy → proud → nervous
    const mood = emotions(t, [[0, 'nervous', { lookX: .9, lookY: .3 }], [tPop + .02, 'surprised', { lookX: .2, lookY: -.9 }], [tPop + 1.1, 'hopeful', { lookY: -1 }],
                               [7.0, 'confused', { lookY: -1 }], [8.6, 'sad'], [tFall + .26, 'surprised', { lookY: -1 }], [11.0, 'happy'], [tBack + .2, 'proud', { lookX: .8 }], [tLever + .05, 'nervous', { lookX: .9, lookY: .3 }]]);
    const lean = stare(t), fallBack = t > tPop && t < tPop + 1.2 ? Math.sin(seg(t, tPop, tPop + 1.2) * Math.PI) : 0;
    let pose = { ...mood, rot: (mood.rot || 0) + .16 * lean - .3 * fallBack, dx: (mood.dx || 0) + 1.2 * lean - .8 * fallBack };
    if (t > tPop + 1.1 && t < 8.6) pose.aL = pose.aR = 1.35 + .08 * Math.sin(t * 7);                       // ready to catch
    if (t >= tFall && t < tBack) pose = { ...pose, ...move('bounce', t), eyes: pose.eyes, mouth: pose.mouth, sq: (pose.sq || 0) + .25 * Math.exp(-(t - tFall - .25) * 6) * (t > tFall + .25) };
    // putting the toast back: arms up to the head, then out to the slots; then the lever
    const back = seg(t, tBack, tBack + 1.1);
    if (t >= tBack && t < tLever + .3) { pose.aL = lerp(1.4, .3, ease(seg(t, tBack + .3, tBack + 1))); pose.aR = t < tLever - .3 ? lerp(1.4, .4, ease(seg(t, tBack + .3, tBack + 1))) : lerp(.4, -.5, ease(seg(t, tLever - .3, tLever))); pose.rot = .12; }
    sak(SX, G, U, pose);
    lever(t < tPop ? 1 : t < tLever - .1 ? 1 - backOut(seg(t, tPop, tPop + .15)) : ease(seg(t, tLever - .1, tLever)));

    // the slices
    const head = headTop(SX, G, U, pose);
    for (const i of [0, 1]) {
      const [sx, sy] = slot(i), restIn = [sx, sy + 34];                  // sitting in the slot, crust peeking out
      let p, r = 0;
      if (t < tPop || t > tBack + 1.4) { const k = t < tPop ? 0 : ease(seg(t, tBack + 1.4, tLever)); p = [restIn[0], restIn[1] + 20 * k * 0]; if (t > tBack + 1.4 && t < tLever) p = [sx, lerp(sy - 20, sy + 34, ease(seg(t, tBack + 1.4 + i * .1, tLever - .2)))]; }
      else if (t < tPop + .5) { const k = easeOut(seg(t, tPop + i * .05, tPop + .45 + i * .05)); p = [sx + (i ? 20 : -20) * k, lerp(restIn[1], camY - 1300, k)]; r = (i ? .4 : -.4) * k; }
      else if (t < tFall + i * .32) continue;                               // somewhere above the ceiling
      else if (t < tFall + .25 + i * .32) { const k = easeIn(seg(t, tFall + i * .32, tFall + .25 + i * .32)); p = [lerp(head[0] + (i ? 30 : -20), head[0] + (i ? 10 : -6), k), lerp(camY - 1100, head[1] - 30 - i * 46, k)]; r = (i ? 1.5 : -.8) * (1 - k); }
      else if (t < tBack + .3) { p = [head[0] + (i ? 10 : -6) + 4 * Math.sin(t * 9 + i), head[1] - 30 - i * 46 + 3 * spring(t, tFall + .25 + i * .32, 7, 22)]; r = (i ? .06 : -.04) + .12 * spring(t, tFall + .25 + i * .32, 6, 18) + .05 * Math.sin(t * 5 + i); }
      else { const k = ease(seg(t, tBack + .3 + i * .15, tBack + 1.4)), from = [head[0] + (i ? 10 : -6), head[1] - 30 - i * 46]; p = arcPt(from, [sx, sy - 20], 160, k); r = (1 - k) * (i ? .5 : -.5) + k * 0; }
      toast(p[0], p[1], r, i);
    }
    // a lit-up sparkle when the hat lands, and dust where Sak hits the counter
    sparkle(head[0] + 90, head[1] - 80, 46, seg(t, 11, 11.5));
    if (t > tPop + .3 && t < tPop + 1) for (let i = 0; i < 4; i++) { boilSeed('dust' + i); const k = seg(t, tPop + .3, tPop + 1); paint(ellPts(SX - 120 - 60 * k * (i + 1) * .5, G - 20 - 30 * k * hash(i), 28 * (1 - k * .5), 20 * (1 - k * .5), 12, 3), { fill: PAL.cream, fillOp: 180 * (1 - k), bleed: .2, ink: null }); }
    camEnd();
    if (t > tPop && t < tPop + .5) sfx('POP!', 760, 520, 150, PAL.clay, t - tPop, { life: .5 });
  }
  shots([[0, shot]]);

  // ---- sound: ticks under the stare, the pop, the long silent wait, the bonks, the slices going back ----
  for (let k = 0; k * .5 < tPop; k++) cue(k * .5, k % 2 ? 'tock' : 'tick', { pan: panX(TOA.x) });
  for (let k = Math.ceil(tLever * 2); k * .5 < DUR; k++) cue(k * .5, k % 2 ? 'tock' : 'tick', { pan: panX(TOA.x) });
  cue(1.0, 'sweat', { pan: panX(SX) }); cue(2.5, 'gulp', { pan: panX(SX) });
  cue(tPop, 'pop', { pan: panX(TOA.x), gain: 1.4 }); cue(tPop + .02, 'whoosh', { dur: .4, pan: panX(TOA.x) }); cue(tPop + .35, 'thud', { pan: panX(SX), gain: .7 });
  cue(7.0, 'gulp', { pan: panX(SX) }); cue(8.6, 'sad', { pan: panX(SX) });
  cue(tFall - .1, 'slideDown', { dur: .35 }); cue(tFall + .25, 'boing', { pan: panX(SX) }); cue(tFall + .57, 'thud', { pan: panX(SX), gain: .5 });
  cue(11.0, 'sparkle', { pan: panX(SX) });
  cue(tBack + .5, 'whoosh', { dur: .5, pan: panX(TOA.x) }); cue(tBack + 1.45, 'clack', { pan: panX(TOA.x - 60) }); cue(tBack + 1.55, 'clack', { pan: panX(TOA.x + 60) });
  cue(tLever, 'lever', { pan: panX(LEVER[0]), gain: 1.3 });
  MUSIC.chords = [[['C4', 'E4', 'G4'], ['C2', 'G2', 'C3', 'G2']], [['A3', 'C4', 'E4'], ['A1', 'E2', 'A2', 'E2']], [['F3', 'A3', 'C4'], ['F1', 'C2', 'F2', 'C2']], [['G3', 'B3', 'D4'], ['G1', 'D2', 'G2', 'B1']]];
  MUSIC.quiet = [[tPop + .4, tFall]];                                  // the wait plays in silence
})();
