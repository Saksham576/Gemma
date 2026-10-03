// s2_tower.js: "Tower" (20 s, loops). Hook type: tension ("don't fall").
//   0–2.5   a wobbling tower of blocks; Sak on a stool holds one more over it, sweating (frame 0 is already mid-wobble)
//   2.5     Sak places it: the wobble gets worse, Sak freezes in horror… and it settles (5.0). Relief.
//   5.6–8.4 an idea: one tiny gold cube on top. Perfect stillness. Triumph.
//   9–11    a fly buzzes in, circles, and lands on the gold cube. Silence.
//   12.0    everything comes down; Sak ducks; dizzy among the blocks
//   14–16.6 the blocks bounce back up and land, one per beat, into the tower; the last one lands in Sak's arms
//   17–20   Sak holds it over the wobbling tower again: the last frame flows into frame 0
(() => {
  if (SHORT !== 'tower') return;
  const G = 1420, TX = 690, BW = 150, BH = 92, N = 6, U = 28;
  const STOOL = { x: 420, h: 170 }, SY = G - 170;                 // Sak stands on the stool
  const COLS = [PAL.rose, PAL.ochre, PAL.sky, PAL.sap, PAL.violet, PAL.clay, PAL.teal];
  const tPlace = 2.5, tCalm = 5.0, tIdea = 5.6, tGold = 8.0, tFly = 9.0, tLand = 11.0, tFall = 12.0, tRe = 14.0, tCatch = 16.6, DUR = 20;
  // the wobble: one sway a second; bigger after the 7th block goes on, dying away; still while the gold cube sits
  const amp = t => t < tPlace ? .035 : t < tCalm ? .11 * (1 - ease(seg(t, tPlace + .4, tCalm))) + .01 : t < tLand ? 0 : t < tFall ? .02 * Math.sin((t - tLand) * 30) * seg(t, tLand, tFall) : t < tRe ? 0 : .035 * ease(seg(t, tRe, tCatch));
  const theta = t => amp(t) * Math.sin(t * TAU);
  const inTower = t => t < tFall ? (t < tPlace + .25 ? N : N + 1) : 0;   // blocks standing (the 7th joins at the placement)
  // the centre and angle of block i in a tower swaying by th: each block tilts a little more than the one below
  function stackAt(i, th) {
    let x = TX, y = G, a = 0;
    for (let k = 0; k <= i; k++) {
      const ak = th * (k + 1) / N, h = k === i ? BH / 2 : BH;
      x += Math.sin(ak) * h; y -= Math.cos(ak) * h; a = ak;
      if (k === i) return [x, y, a];
    }
    return [x, y, a];
  }
  // where block i lands when the tower falls, and the order they come back
  const landAt = i => [[160, G - 46], [980, G - 46], [300, G - 46], [860, G - 46], [560, G - 46], [740, G - 46], [440, G - 46]][i];
  const backT = i => tRe + i * .4;                                 // bottom block first, one every beat-ish (0.4 s)

  function room(t) {
    boilSeed('wall');
    paint(rectPts(-200, -600, W + 400, G + 600), { wash: mixCol(PAL.paper, PAL.sky, .28), ink: null });
    paint(ellPts(560, 700, 560, 520, 30, 10), { fill: mixCol(PAL.cream, PAL.sky, .2), fillOp: 90, bleed: .3, tex: .6, ink: null });
    boilSeed('frame');   // a picture frame on the wall (a tiny tower doodle in it: the plan)
    paint(rrPts(130, 520, 220, 170, 6), { wash: PAL.cream, ink: PAL.ink, sw: 1.2 });
    for (let k = 0; k < 4; k++) paint(rectPts(220 + 8 * Math.sin(k), 650 - k * 28, 40, 24), { wash: COLS[k], ink: PAL.ink, sw: .5 });
    boilSeed('floor');
    paint(rectPts(-200, G, W + 400, 900, 2), { wash: '#C99A68', fill: '#A9774A', fillOp: 70, bleed: .05, tex: .6, ink: null });
    for (let k = 0; k < 5; k++) inkLine([[-100, G + 60 + k * 70], [W + 100, G + 62 + k * 70]], .5, mixCol('#A9774A', PAL.ink, .4), 'inkfine', .2);
    inkLine([[-100, G], [W / 2, G - 3], [W + 100, G + 1]], 1.2, PAL.ink, 'ink', .5);
  }
  function block(x, y, a, i, s = 1) {
    boilSeed('block' + i);
    push(); translate(x, y); rotate(a); scale(s);
    paint(rrPts(-BW / 2, -BH / 2, BW, BH, 10, 1), { wash: COLS[i], ink: PAL.ink, sw: 1.1 });
    paint(rrPts(-BW / 2 + 10, -BH / 2 + 8, BW - 50, 14, 7), { wash: PAL.cream, washOp: 120, ink: null });   // highlight
    paint(ellPts(0, 6, 16, 16, 12), { wash: mixCol(COLS[i], PAL.ink, .25), ink: null });                   // a painted dot, like toy blocks
    pop();
  }
  function gold(x, y, a, s = 1) {
    boilSeed('gold'); push(); translate(x, y); rotate(a); scale(s);
    paint(rrPts(-24, -24, 48, 48, 6), { wash: '#F2C53D', fill: PAL.ochre, fillOp: 90, ink: PAL.ink, sw: .9 }); pop();
  }
  function fly(x, y, t) {
    boilSeed('fly');
    const flap = Math.sin(t * 90) * .5, k = 1.9;
    for (const s of [-1, 1]) paint(ellPts(x + s * 8 * k, y - 10 * k, 10 * k, (6 + 4 * flap) * k, 10, 0, s * .6), { wash: PAL.cream, washOp: 200, ink: PAL.ink, sw: .5 });
    paint(ellPts(x, y, 9 * k, 7 * k, 10), { wash: PAL.ink, ink: null });
    for (const s of [-1, 1]) paint(ellPts(x + s * 5, y - 3, 3, 3, 8), { wash: '#C2412F', ink: null });   // big red fly eyes
  }
  // the fly's flight: in from the right, two loops around the top, down onto the gold cube; off again after the crash
  function flyPos(t, top) {
    if (t < tFly || t > tFall + 1.2) return null;
    if (t < tLand) { const k = seg(t, tFly, tLand), a = k * TAU * 2.2; const r = lerp(260, 0, easeIn(k)); return [lerp(1150, top[0], ease(k)) + Math.cos(a) * r * .9, lerp(560, top[1] - 34, ease(k)) + Math.sin(a * 1.3) * r * .45]; }
    if (t < tFall + .1) return [top[0], top[1] - 34];
    const k = seg(t, tFall + .1, tFall + 1.2); return [lerp(top[0], 1250, easeIn(k)), lerp(top[1] - 34, 200, k) + 40 * Math.sin(k * 20)];
  }

  function shot(t) {
    const th = theta(t), shake = t > tFall && t < tFall + 1 ? shakeXY(t, 14 * Math.exp(-(t - tFall) * 5)) : [0, 0];
    camBegin(600 + shake[0], 1060 + shake[1] - 30 * ease(seg(t, tIdea, tGold)) * (1 - seg(t, tLand, tFall)), kf(t, [[0, 1.12], [tGold, 1.16], [tLand, 1.24], [tFall, 1.1], [tRe, 1.12]]));
    room(t);
    // the stool
    boilSeed('stool');
    paint(rectPts(STOOL.x - 110, SY, 220, 26, 1), { wash: '#B5835A', ink: PAL.ink, sw: 1 });
    for (const s of [-1, 1]) paint(rectPts(STOOL.x + s * 80 - 12, SY + 24, 24, STOOL.h - 24), { wash: '#9C6B45', ink: PAL.ink, sw: .9 });

    // Sak: nervous → scared (it wobbles) → relieved → idea → determined → proud → suspicious (the fly) → scared → dizzy → confused → surprised → nervous
    const mood = emotions(t, [[0, 'nervous', { lookX: .8, lookY: -.6 }], [tPlace + .2, 'scared', { lookX: .8, lookY: -.3 }], [tCalm + .2, 'relieved'], [tIdea, 'idea'],
      [7.0, 'determined', { lookX: .8, lookY: -.7 }], [tGold + .4, 'proud'], [tFly + .4, 'suspicious'], [tLand, 'scared', { lookX: .7, lookY: -.8 }], [tFall + .05, 'surprised', { lookY: -1 }],
      [tFall + .9, 'dizzy'], [tRe + .2, 'confused', { lookX: .8, lookY: -.5 }], [tCatch, 'surprised', { lookY: -.8 }], [tCatch + .6, 'nervous', { lookX: .8, lookY: -.6 }]]);
    let pose = { ...mood };
    const holding = t < tPlace || t > tCatch;
    if (holding) { pose.aL = pose.aR = 1.45 + .05 * Math.sin(t * TAU); pose.dy = (pose.dy || 0) - .3; }             // on tiptoe, block overhead
    if (t > tPlace - .3 && t < tPlace + .4) { pose.aR = lerp(1.45, .4, ease(seg(t, tPlace - .3, tPlace))); pose.rot = .12 * Math.sin(seg(t, tPlace - .3, tPlace + .4) * Math.PI); }
    if (t > 7.0 && t < tGold + .2) { pose.aR = lerp(.3, 1.1, ease(seg(t, 7.0, tGold - .3))); pose.dy = (pose.dy || 0) - .6 * Math.sin(seg(t, 7, tGold + .2) * Math.PI); pose.rot = .1; }
    if (t > tFall && t < tFall + .8) { pose.sq = (pose.sq || 0) + .3 * Math.sin(seg(t, tFall, tFall + .8) * Math.PI); pose.aL = pose.aR = -.6; }   // duck
    if (t > tFall + .2 && t < tRe + .1) pose.dy = (pose.dy || 0) + 0;
    // Sak hops down to the floor for the crash and back up for the catch
    const onFloor = seg(t, tFall + .05, tFall + .35) * (1 - seg(t, tCatch - .6, tCatch - .2));
    const sy = lerp(SY, G, ease(onFloor)), sxx = lerp(STOOL.x, STOOL.x - 150, ease(onFloor));
    sak(sxx, sy, U, pose);

    // the tower (and the block in hand), the gold cube, the fall and the return
    const top = stackAt(N, th);
    for (let i = 0; i <= N; i++) {
      let p, a = 0;
      if (i === N && holding) { const hd = headTop(sxx, sy, U, pose); p = [sxx, hd[1] - BH / 2 - 14]; a = .05 * Math.sin(t * TAU); }
      else if (i === N && t < tPlace + .25) { const k = ease(seg(t, tPlace - .3, tPlace + .25)), s = stackAt(N, th); p = arcPt([sxx, headTop(sxx, sy, U, pose)[1] - BH / 2 - 14], [s[0], s[1]], 90, k); a = lerp(0, s[2], k); }
      else if (t < tFall) { const s = stackAt(i, th); p = [s[0], s[1]]; a = s[2]; }
      else if (t < tRe) {   // falling: each block flies off the tower on an arc, top ones first, and bounces where it lands
        const s0 = stackAt(i, theta(tFall) + .25), L = landAt(i), d0 = tFall + (N - i) * .05, k = seg(t, d0, d0 + .5 + .04 * i);
        p = arcPt([s0[0], s0[1]], L, 160 + 40 * hash(i), easeIn(k) * .3 + k * .7); a = (hash(i + 7) - .5) * 6 * k;
        if (k >= 1) { const b = t - d0 - .5 - .04 * i; p = [L[0], L[1] - 50 * Math.exp(-b * 6) * Math.abs(Math.sin(b * 14))]; a = (hash(i + 7) - .5) * 6 + .2 * Math.sin(i); }
      } else {             // coming back: bounce up off the floor and land in place, bottom first; the 7th into Sak's arms
        const L = landAt(i), aL = (hash(i + 7) - .5) * 6 + .2 * Math.sin(i), t0 = backT(i), k = ease(seg(t, t0 - .35, t0));
        const dst = i === N ? [STOOL.x, SY - 8 * U - BH / 2 - 14] : stackAt(i, th);
        p = arcPt(L, [dst[0], dst[1]], 260, k); a = lerp(aL, i === N ? 0 : dst[2], k);
        if (i === N && t >= tCatch) continue;   // drawn by the holding branch above
      }
      block(p[0], p[1], a, i);
    }
    // the gold cube: from Sak's hand to the very top; then lost in the crash (it flies off the top of the frame)
    if (t > 7.0 && t < tFall + 1) {
      let gp, ga = 0; const tp = [top[0], top[1] - BH / 2 - 24];
      if (t < tGold) { const h = armTipR(sxx, sy, U, pose); gp = arcPt(h, tp, 70, ease(seg(t, tGold - .5, tGold))); if (t < tGold - .5) gp = h; }
      else if (t < tFall) gp = tp;
      else { const k = seg(t, tFall, tFall + 1); gp = arcPt(tp, [1150, -300], 300, k); ga = k * 9; }
      gold(gp[0], gp[1], ga);
      if (t > tGold) sparkle(tp[0] + 50, tp[1] - 40, 40, seg(t, tGold + .1, tGold + .6));
    }
    const fp = flyPos(t, [top[0], top[1] - BH / 2 - 24]); if (fp) fly(fp[0], fp[1], t);
    camEnd();
    if (t > tFall && t < tFall + .7) sfx('CRASH!', 560, 520, 140, PAL.clay, t - tFall, { life: .7 });
  }
  shots([[0, shot]]);

  // ---- sound ----
  for (const tc of [.25, 1.25, 17.25, 18.25, 19.25]) cue(tc, 'slideDown', { dur: .3, gain: .35, pan: panX(TX) });   // creaks with the sway
  cue(.8, 'sweat', { pan: panX(STOOL.x) });
  cue(tPlace + .25, 'clack', { pan: panX(TX), gain: 1.2 }); cue(tPlace + .5, 'slideUp', { dur: .4, pan: panX(TX) }); cue(tPlace + 1.2, 'slideDown', { dur: .5, pan: panX(TX) });
  cue(tCalm + .2, 'puff', { pan: panX(STOOL.x), gain: .7 }); cue(tIdea, 'ding', { note: 'A5', pan: panX(STOOL.x) });
  cue(tGold, 'clack', { pan: panX(TX), gain: .8 }); cue(tGold + .1, 'sparkle', { pan: panX(TX) });
  cue(tFly, 'buzz', { dur: tLand - tFly, pan: .4 }); cue(tFall + .1, 'buzz', { dur: 1.1, pan: .5 });
  cue(tFall, 'crash', { pan: panX(TX), gain: 1.2 }); cue(tFall + .02, 'whoosh', { dur: .4 });
  for (let i = 0; i <= N; i++) cue(tFall + (N - i) * .05 + .5 + .04 * i, 'thud', { pan: panX(landAt(i)[0]), gain: .35 });
  cue(tFall + .9, 'sad', { pan: panX(STOOL.x), gain: .7 });
  for (let i = 0; i <= N; i++) cue(backT(i), i === N ? 'pop' : 'clack', { pan: panX(i === N ? STOOL.x : TX), gain: .9 });
  MUSIC.chords = [[['F3', 'A3', 'C4'], ['F1', 'C2', 'F2', 'C2']], [['D3', 'F3', 'A3'], ['D2', 'A1', 'D2', 'A1']], [['A#2', 'D3', 'F3'], ['A#1', 'F2', 'A#1', 'F2']], [['C3', 'E3', 'G3'], ['C2', 'G1', 'C2', 'E2']]];
  MUSIC.quiet = [[tLand, tFall + .9]];
})();
