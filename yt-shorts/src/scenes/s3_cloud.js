// s3_cloud.js: "Cloud" (20 s, loops). Hook type: absurd premise.
//   0–2     a tiny grey cloud rains on Sak and only on Sak (frame 0 is already mid-drizzle); Sak glares up
//   2–4.6   Sak dashes left, then right; the cloud follows each time and overshoots. Fury (the lid pops)
//   5.4–8   an umbrella! Dry… until the cloud ducks under it and rains sideways. Deadpan.
//   8.6–12  an idea: Sak plants a seed in the puddle; the rain grows it into a huge flower that shades Sak
//   12–14.6 the cloud rains itself out; the sun comes out; Sak is in love with the flower
//   15.4–17 the flower sniffs… ACHOO: a puff of pollen that greys into a new tiny cloud over Sak
//   17–20   the flower curls back into the ground; drizzle again: the last frame flows into frame 0
(() => {
  if (SHORT !== 'cloud') return;
  const G = 1420, U = 30, X0 = 520, FL = 700;          // ground, Sak's size and home spot, the flower's spot
  const tDashL = 2.0, tDashR = 3.3, tFury = 4.6, tUmb = 5.4, tSide = 6.6, tDrop = 8.0, tIdea = 8.6, tPlant = 9.4, tGrow = 10.2, tBloom = 12.0, tSun = 13.4, tSniff = 15.4, tAchoo = 16.2, tCurl = 17.2, DUR = 20;
  // Sak's x: home → dash left → dash right → home; then a step toward the flower to plant and back
  const sakX = t => kf(t, [[0, X0], [tDashL, X0], [tDashL + .35, 260], [tDashR, 260], [tDashR + .4, 800], [tFury + .2, 800], [tUmb - .3, X0], [tIdea + .2, X0], [tPlant, 610], [tGrow + .4, X0 - 60], [tCurl + .6, X0 - 60], [tCurl + 1.4, X0]], easeInOut);
  // the cloud follows Sak with a lag and an overshooting spring; it shrinks and fades in the sun; a new one forms from the pollen
  const cloudX = t => { const lag = sakX(t - .45) ; return lag + 50 * spring(t, tDashL + .7, 5, 9) - 50 * spring(t, tDashR + .8, 5, 9); };
  const cloudK = t => t < tSun ? 1 : t < tAchoo + .3 ? 1 - ease(seg(t, tSun, tSun + .9)) : ease(seg(t, tAchoo + .6, tCurl + .6));   // its size/darkness
  const raining = t => (t < tUmb + .2 || (t > tSide + .3 && t < tSun + .4) || t > tCurl + .4) ? 1 : 0;
  const flowerK = t => t < tGrow ? 0 : t < tCurl ? easeOut(seg(t, tGrow, tBloom)) : 1 - easeInOut(seg(t, tCurl, tCurl + 1.6));
  const petals = t => t < tBloom - .2 ? 0 : t < tCurl ? backOut(seg(t, tBloom - .2, tBloom + .4)) : 1 - ease(seg(t, tCurl, tCurl + .8));
  const cloudY = 760;

  function world(t) {
    const sun = ease(seg(t, tSun, tSun + 1)) * (1 - ease(seg(t, tAchoo, tCurl + .5)));
    boilSeed('sky');
    paint(rectPts(-300, -800, W + 600, G + 800), { wash: mixCol(mixCol(PAL.sky, PAL.paper, .25), PAL.boneDim || '#B9B4C4', .25 * (1 - sun)), ink: null });
    paint(ellPts(800, 300, 600, 380, 30, 10), { fill: mixCol(PAL.cream, PAL.ochre, .35), fillOp: 140 * sun, bleed: .3, tex: .5, ink: null });
    if (sun > 0) { glow(860, 300, 240 + 40 * sun, '#FFD27A', .9 * sun); boilSeed('sun'); paint(ellPts(860, 300 - 80 * (1 - sun), 95, 95, 28, 1.5), { wash: '#F6C25A', fill: PAL.ochre, fillOp: 80, ink: PAL.ink, sw: 1 }); }
    boilSeed('hills');
    paint(ellPts(200, G + 120, 620, 260, 36, 3), { wash: mixCol(PAL.sap, PAL.paper, .3), ink: PAL.ink, sw: .9 });
    paint(ellPts(980, G + 160, 700, 300, 36, 3), { wash: mixCol(PAL.sap, PAL.teal, .3), ink: PAL.ink, sw: .9 });
    boilSeed('ground');
    paint(rectPts(-300, G, W + 600, 900, 2), { wash: PAL.sap, fill: mixCol(PAL.sap, PAL.ink, .3), fillOp: 60, bleed: .05, tex: .6, ink: null });
    inkLine([[-200, G], [W / 2, G - 3], [W + 200, G + 1]], 1.2, PAL.ink, 'ink', .5);
    for (let i = 0; i < 14; i++) { boilSeed('tuft' + i); const x = hash(i) * W, s = 6 * Math.sin(t * 2 + i); for (const k of [-1, 0, 1]) inkLine([[x + k * 8, G + 4], [x + k * 12 + s, G - 22 - 6 * hash(i + k)]], .7, mixCol(PAL.sap, PAL.ink, .4), 'inkfine', .4); }
    boilSeed('puddle');   // the puddle under Sak's spot, rippling in the rain
    paint(ellPts(X0 + 30, G + 16, 210, 26, 24, 2), { wash: mixCol(PAL.sky, PAL.ink, .15), washOp: 200, ink: PAL.ink, sw: .6 });
  }
  function cloud(x, y, k, t) {
    if (k <= .02) return;
    boilSeed('cloud');
    const g = mixCol('#8E8A9A', PAL.cream, .1), s = .45 + .55 * k;
    for (const [dx, dy, r] of [[-60, 10, 52], [0, -18, 66], [62, 6, 50], [20, 22, 54], [-30, 26, 48]]) paint(ellPts(x + dx * s, y + dy * s, r * s, r * s * .86, 18, 2), { wash: g, washOp: 255 * clamp(k * 1.4), ink: null });
    paint(ellPts(x, y + 6 * s, 112 * s, 52 * s, 24, 2), { ink: PAL.ink, sw: .9 * k });
    // a little grumpy face: the cloud is a character too
    if (k > .5) { for (const e of [-1, 1]) inkLine([[x + e * 24 * s - 8, y - 2 * s - e * 3], [x + e * 24 * s + 8, y - 2 * s + e * 3]], 1.4, PAL.ink, 'ink', 0); inkLine([[x - 10 * s, y + 20 * s], [x, y + 16 * s], [x + 10 * s, y + 20 * s]], 1, PAL.ink, 'ink', .5); }
  }
  function rain(x0, y0, x1, wide, t, dir = 0) {
    for (let i = 0; i < 14; i++) {   // streaks falling on a loop; each its own column, phase and boil seed
      boilSeed('drop' + i);
      const ph = frac(t * 2.4 + hash(i)), cx = x0 + (hash(i + 3) - .5) * wide, y = lerp(y0, x1, ph);
      inkLine([[cx + dir * (y - y0) * .6, y], [cx + dir * (y - y0 + 34) * .6, y + 34]], 1.3, mixCol(PAL.sky, PAL.ink, .35), 'inkfine', 0);
    }
  }
  function flower(x, k, pk, t) {
    if (k <= 0) return;
    boilSeed('stem');
    const h = 520 * k, top = [x + 16 * Math.sin(t * 1.4) * k, G - h];
    paint(ribbon([[x, G], [x + 10, G - h * .5], top], 16, 11), { wash: PAL.sap, ink: PAL.ink, sw: .9 });
    for (const s of [-1, 1]) if (k > .4) paint(ellPts(x + s * 46, G - h * .38, 52 * k, 20 * k, 16, 1, s * -.5), { wash: mixCol(PAL.sap, PAL.cream, .2), ink: PAL.ink, sw: .8 });
    if (pk > 0) {   // petals open wide over Sak, like an umbrella, then a face in the middle
      boilSeed('petals');
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .5 * pk, r = 150 * pk; paint(ellPts(top[0] + Math.cos(a) * r, top[1] + Math.sin(a) * r * .55 - 20, 86 * pk, 44 * pk, 16, 2, a), { wash: i % 2 ? PAL.rose : mixCol(PAL.rose, PAL.cream, .35), ink: PAL.ink, sw: .9 }); }
      paint(ellPts(top[0], top[1] - 20, 70 * pk, 58 * pk, 22, 1.5), { wash: PAL.ochre, fill: '#F2C53D', fillOp: 80, ink: PAL.ink, sw: 1 });
      const sn = t > tSniff && t < tAchoo ? Math.sin((t - tSniff) * 18) * .5 + .5 : 0, ach = t > tAchoo - .15 && t < tAchoo + .4;
      for (const e of [-1, 1]) { if (ach || sn > .7) inkLine([[top[0] + e * 28 - 9, top[1] - 26], [top[0] + e * 28 + 9, top[1] - 26]], 1.6, PAL.ink, 'ink', 0); else paint(ellPts(top[0] + e * 26, top[1] - 28, 6, 9, 10), { wash: PAL.ink, ink: null }); }
      if (ach) paint(ellPts(top[0], top[1] - 2, 16, 12, 12), { wash: PAL.ink, ink: null }); else inkLine([[top[0] - 14, top[1] - 6], [top[0], top[1] + 2], [top[0] + 14, top[1] - 6]], 1.2, PAL.ink, 'ink', .5);
    }
    return top;
  }

  function shot(t) {
    const ach = t > tAchoo && t < tAchoo + .5 ? shakeXY(t, 8 * Math.exp(-(t - tAchoo) * 7)) : [0, 0];
    camBegin(570 + ach[0], 1060 + ach[1] - 60 * ease(seg(t, tGrow, tBloom)) * (1 - ease(seg(t, tCurl, tCurl + 1.5))), kf(t, [[0, 1.14], [tFury, 1.2], [tUmb, 1.14], [tGrow, 1.04], [tSun, 1.02], [tCurl + 1.5, 1.14]]));
    world(t);
    const sx = sakX(t), cx = cloudX(t), ck = cloudK(t);
    // the cloud ducks under the umbrella to rain sideways (6.0–8.0), and later sits over the flower until it rains out
    const duck = ease(seg(t, tSide - .6, tSide)) * (1 - ease(seg(t, tDrop, tDrop + .4)));
    const overFlower = ease(seg(t, tGrow, tBloom)) * (1 - ease(seg(t, tSun, tSun + .6)));
    const top = flower(FL, flowerK(t), petals(t), t);
    let ccx = lerp(cx, sx + 210, duck), ccy = lerp(cloudY, G - 300, duck);
    if (overFlower > 0 && top) { ccx = lerp(ccx, top[0], overFlower); ccy = lerp(ccy, top[1] - 230, overFlower); }
    // the new cloud forms where the pollen puffs (above Sak), so it is over Sak again by the loop point
    if (t > tAchoo) { const pc = [lerp(top ? top[0] - 120 : sx, sx, ease(seg(t, tAchoo, tCurl + .6))), lerp(G - 600, cloudY, ease(seg(t, tAchoo + .3, tCurl + .6)))]; ccx = pc[0]; ccy = pc[1]; }
    if (raining(t) && ck > .3) rain(ccx, ccy + 40, duck > .5 ? ccy + 140 : G, 150, t, duck > .5 ? -1.6 : 0);

    // Sak: grumpy → angry (dashes) → furious → happy (umbrella) → bored (sideways rain) → idea → determined → happy → love → surprised → sad/grumpy
    const mood = emotions(t, [[0, 'sad', { lookY: -1 }], [tDashL - .1, 'angry', { lookX: -.8 }], [tDashR - .1, 'angry', { lookX: .8 }], [tFury, 'furious'], [tUmb, 'happy'], [tSide + .4, 'bored', { lookX: .8 }],
      [tIdea, 'idea'], [tPlant - .3, 'determined', { lookX: .8, lookY: .6 }], [tGrow + .5, 'surprised', { lookY: -1 }], [tBloom + .2, 'love'], [tAchoo - .1, 'surprised', { lookX: .8, lookY: -.6 }], [tCurl + .5, 'sad', { lookY: -1 }]]);
    let pose = { ...mood };
    const dashing = (t > tDashL && t < tDashL + .35) || (t > tDashR && t < tDashR + .4) || (t > tFury + .2 && t < tUmb - .3) || (t > tIdea + .2 && t < tPlant) || (t > tPlant + .5 && t < tGrow + .4) || (t > tCurl + .6 && t < tCurl + 1.4);
    if (dashing) { const goingLeft = sakX(t + .02) < sakX(t); pose = { ...pose, view: 'side', flip: goingLeft, walk: sx / (3 * U), smear: (t < tFury) ? .5 : 0, smearDir: goingLeft ? -1 : 1 }; }
    if (t > tPlant - .2 && t < tPlant + .5) pose.sq = (pose.sq || 0) + .25 * Math.sin(seg(t, tPlant - .2, tPlant + .5) * Math.PI);   // crouch to plant
    const umb = t > tUmb && t < tDrop + .3;
    if (umb) pose.aR = 1.3;
    sak(sx, G, U, pose);
    if (umb) {   // the umbrella, held up in the right hand; dropped at the end
      const h = armTipR(sx, G, U, pose), dropK = seg(t, tDrop, tDrop + .3), open = backOut(seg(t, tUmb, tUmb + .3));
      boilSeed('umbrella');
      const c = [h[0] - 20, h[1] - 150 + 160 * dropK * dropK];
      inkLine([[h[0], h[1]], [c[0], c[1]]], 2, PAL.ink, 'ink', 0);
      const P = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; P.push([c[0] + Math.cos(a) * 170 * open, c[1] + Math.sin(a) * 90 * open]); }
      for (let i = 5; i >= 0; i--) P.push([c[0] - 170 * open + i * 68 * open, c[1] + 14 * (i % 2)]);
      paint(P, { wash: PAL.violet, ink: PAL.ink, sw: 1 });
    }
    if (t > tPlant && t < tGrow + .3) { boilSeed('seed'); paint(ellPts(FL, G - 6 - 0 * seg(t, tPlant, tPlant + .2), 10, 7, 10), { wash: '#8A6A3A', ink: PAL.ink, sw: .6 }); }
    cloud(ccx, ccy, ck, t);
    // the sneeze: a pollen puff that greys into the new cloud
    if (t > tAchoo && t < tAchoo + 1.4 && top) { const k = seg(t, tAchoo, tAchoo + 1.4); for (let i = 0; i < 8; i++) { boilSeed('pollen' + i); const a = -Math.PI / 2 - .6 + i * .18; paint(ellPts(top[0] - 60 + Math.cos(a) * 160 * easeOut(k), top[1] - 40 + Math.sin(a) * 120 * easeOut(k), 18 * (1 - k * .5), 18 * (1 - k * .5), 10), { wash: mixCol('#F2C53D', '#8E8A9A', k), washOp: 255 * (1 - k), ink: null }); } }
    if (top && petals(t) > .9) sparkle(top[0] + 170, top[1] - 120, 50, seg(t, tBloom + .1, tBloom + .7));
    camEnd();
    if (t > tAchoo && t < tAchoo + .6) sfx('ACHOO!', 600, 600, 130, PAL.rose, t - tAchoo, { life: .6 });
  }
  shots([[0, shot]]);

  // ---- sound ----
  cue(0, 'rain', { dur: tUmb + .2, pan: panX(X0) }); cue(tSide + .3, 'rain', { dur: tSun + .4 - tSide - .3, pan: panX(X0) }); cue(tCurl + .4, 'rain', { dur: DUR - tCurl - .4, pan: panX(X0) });
  for (let k = 0; k < 6; k++) cue(.3 + k * .27, 'drip', { pan: panX(X0), gain: .7 });
  cue(tDashL, 'whoosh', { dur: .3, pan: -.4 }); cue(tDashR, 'whoosh', { dur: .3, pan: .4 }); cue(tDashL + .5, 'slideDown', { dur: .3, pan: -.4 }); cue(tDashR + .6, 'slideDown', { dur: .3, pan: .4 });
  cue(tFury, 'boing', { pan: panX(800) }); cue(tUmb, 'pop', { pan: panX(X0) }); cue(tSide, 'whoosh', { dur: .4, pan: .3 }); cue(tSide + .4, 'sad', { gain: .6 });
  cue(tDrop + .3, 'thud', { gain: .4 }); cue(tIdea, 'ding', { note: 'A5' }); cue(tPlant, 'step', { gain: 2 }); cue(tPlant + .1, 'drip', { pan: panX(FL) });
  cue(tGrow, 'grow', { dur: tBloom - tGrow, pan: panX(FL) }); cue(tBloom, 'bloom', { pan: panX(FL) }); cue(tBloom + .1, 'sparkle', { pan: panX(FL) });
  cue(tSun, 'slideUp', { dur: .8, gain: .6 }); cue(tSniff, 'puff', { gain: .4, pan: panX(FL) }); cue(tSniff + .4, 'puff', { gain: .4, pan: panX(FL) });
  cue(tAchoo - .12, 'achoo', { pan: panX(FL) }); cue(tAchoo + .3, 'puff', { gain: .6 }); cue(tCurl, 'slideDown', { dur: 1.2, pan: panX(FL) });
  MUSIC.chords = [[['G3', 'B3', 'D4'], ['G1', 'D2', 'G2', 'D2']], [['E3', 'G3', 'B3'], ['E2', 'B1', 'E2', 'B1']], [['C3', 'E3', 'G3'], ['C2', 'G1', 'C2', 'G1']], [['D3', 'F#3', 'A3'], ['D2', 'A1', 'D2', 'F#2']]];
  MUSIC.quiet = [[tSide + .3, tIdea]];
})();
