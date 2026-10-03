// p2_pilgrim.js (10–17 s): the terraces from TableProof. The signal leaves the corrected cell, hovers over a terrace
// pool, lifts, and falls as a drop of rice water. Ripples spread through the contour lines. The view comes back to
// top-down and a bottle is plotted around the calm ripples. Then every ripple converges into one band, which tilts into
// the ring that opens Ultrahuman.
const RING_C = [720, 560], RING_R = 230;               // where the ring forms (shared with p3)
(() => {
  const BOT = { R: 200 };
  // the bottle, in screen space around RING_C: body circle, shoulders, neck, cap. One pen path, plotted in order.
  const bottlePath = () => {
    const [cx, cy] = RING_C, R = BOT.R, nk = 54, P = [];
    const a0 = -Math.PI / 2 + .3, a1 = -Math.PI / 2 - .3 + TAU;
    for (let i = 0; i <= 60; i++) { const a = lerp(a0, a1, i / 60); P.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
    const top = cy - R * Math.cos(.3);
    P.push([cx - nk, top - 10], [cx - nk, top - 70], [cx - nk - 12, top - 74], [cx - nk - 12, top - 140], [cx + nk + 12, top - 140], [cx + nk + 12, top - 74], [cx + nk, top - 70], [cx + nk, top - 10], P[0]);
    return P;
  };
  const BP = bottlePath();

  function pilgrim(t, lt) {
    // camera: terraces (tilted) → back to top-down, with the pool moving to RING_C
    const tilt = 1 - easeInOut(seg(t, T.top0, T.top1)), top = easeInOut(seg(t, T.top0, T.top1));
    const poolScr = fieldMap(POOL[0], POOL[1], tilt);
    const zoom = lerp(1, 1.18, top);
    cam2D(poolScr[0], poolScr[1], zoom, lerp(poolScr[0], RING_C[0], top), lerp(poolScr[1], RING_C[1], top));
    const fieldA = (1 - seg(t, T.ring0, T.ring0 + .5)) * lerp(1, .35, seg(t, T.top1 - .2, T.bottle0 + .6));   // quieter behind the bottle
    const rip = { t, t0: T.splash };

    // ---- terraces / contour lines, with the ripple running through them ----
    if (fieldA > 0) for (let j = -12; j <= 42; j++) {
      const rule = j % 3 === 0 && j >= 0 && j <= 27, a = (rule ? lerp(.85, .5, seg(t, 10, 11)) : .45) * fieldA;
      stroke(fieldLine(j, { wave: 1, x0: -260, x1: W + 260, tilt, rip }), { w: rule ? 1.4 : 1.1, col: PAL.bone, a: a * (1 - .5 * tilt * clamp((POOL[1] - fieldY(j)) / 600)) });
    }
    // ---- ripples: rings on the ground plane around the pool; the first carries the signal's colour ----
    if (t > T.splash) for (let i = 0; i < 4; i++) {
      const r = rippleR(i, t, T.splash); if (r < 0) continue;
      const age = t - T.splash - i * .28, a = Math.exp(-age * .9) * fieldA;
      const P = circlePts(POOL[0], POOL[1], r, r * .76, 72).map(([x, y]) => fieldMap(x, y, tilt));
      stroke(P, { w: i ? 2 : 3, col: i ? PAL.bone : PAL.signal, a: Math.min(1, a * 1.4), glow: i ? .15 * a : .8 * a });
    }
    // ---- calm water inside the bottle: slow rings from the centre on every beat, top-down ----
    const calm = seg(t, T.top1 - .3, T.top1 + .2) * (1 - seg(t, T.ring0, T.ring0 + .4));
    if (calm > 0) for (let k = 0; k < 4; k++) {
      const ph = ((t - T.top1) / BEAT + k / 4) % 1, r = 20 + ph * (BOT.R - 30);
      stroke(circlePts(POOL[0], POOL[1], r / zoom, r / zoom), { w: 1.2, col: PAL.bone, a: calm * .7 * Math.sin(ph * Math.PI) });
    }
    camReset();

    // ---- splash droplets (screen space) ----
    const ps = fieldMap(POOL[0], POOL[1], 1);
    if (t > T.splash && t < T.splash + .7) for (let i = 0; i < 7; i++) {
      const k = seg(t, T.splash, T.splash + .7), a = -Math.PI / 2 + (i - 3) * .32;
      dot(ps[0] + Math.cos(a) * 140 * k, ps[1] + Math.sin(a) * 160 * k + 320 * k * k, 4 * (1 - k), i === 3 ? PAL.ember : PAL.bone, 1 - k, i === 3 ? .6 : 0);
    }

    // ---- the bottle, plotted by the signal around the calm water; retracted at the seam ----
    const bk = easeInOut(seg(t, T.bottle0, T.bottle1)) * (1 - easeInOut(seg(t, T.ring0, T.ring0 + .55)));
    let pen = null;
    if (bk > 0) { const pr = partial(BP, bk); stroke(pr.pts, { w: 2.2, col: PAL.bone, a: 1 }); if (t < T.bottle1 || t > T.ring0) pen = pr.tip; }
    // leader-line annotations, treatise style
    const an = seg(t, T.bottle1 - .2, T.bottle1 + .3) * (1 - seg(t, T.ring0, T.ring0 + .3));
    if (an > 0) {
      const [cx, cy] = RING_C;
      stroke([[cx + 120, cy + 70], [cx + 300, cy + 170], [cx + 420, cy + 170]], { w: 1, col: PAL.boneDim, a: an });
      text('RICE WATER · FERMENTED', cx + 430, cy + 176, { size: 15, col: PAL.boneDim, a: an, ls: 2 });
      stroke([[cx + 62, cy - BOT.R - 105], [cx + 260, cy - BOT.R - 105]], { w: 1, col: PAL.boneDim, a: an });
      text('pH 5.5', cx + 270, cy - BOT.R - 99, { size: 15, col: PAL.boneDim, a: an, ls: 2 });
    }
    // ---- side panel (same grid as TableProof) ----
    const pr = easeOut(seg(t, T.top1 - .2, T.top1 + .4)) * (1 - seg(t, T.ring0, T.ring0 + .5)), LX = 1210;
    if (pr > 0) {
      X.save(); X.beginPath(); X.rect(LX - 10, 220, 900 * pr, 140); X.clip();
      text('PILGRIM', LX, 320, { fam: 'disp', size: 72, wght: 800, stretch: 'expanded', col: PAL.bone, a: pr });
      X.restore();
      ['RICE WATER MOISTURIZER', 'OUTREACH LANDING PAGE', 'K-BEAUTY · HYDRATION'].forEach((s, i) => text(s, LX, 380 + i * 32, { size: 18, col: PAL.boneDim, a: pr * seg(t, T.top1 + i * .1, T.top1 + .3 + i * .1), ls: 2 }));
    }

    // ---- the seam: every ripple converges into one band at RING_R, which then tilts into the ring ----
    const conv = easeInOut(seg(t, T.ring0 + .2, T.ring0 + .7)), tiltR = easeInOut(seg(t, T.ring0 + .6, T.ring1));
    if (t > T.ring0 + .2) {
      if (tiltR <= 0) for (let k = 0; k < 4; k++) { const r = lerp(40 + k * 50, RING_R, conv); stroke(circlePts(...RING_C, r, r), { w: lerp(1.2, 2.6, conv), col: mixCol(PAL.bone, PAL.signal, conv * .3), a: .8 }); }
      else drawRing(t, tiltR);
    }

    // ---- the signal ----
    let p;
    const cell = flagCellPos(1, 1), hover = [ps[0], ps[1] - 110];
    if (t < T.lift0) p = arcPt(cell, hover, 80, easeInOut(seg(t, 10, T.lift0)));
    else if (t < T.drop0) p = [hover[0], hover[1] - 40 * Math.sin(seg(t, T.lift0, T.drop0) * Math.PI / 2)];
    else if (t < T.splash) p = [hover[0], lerp(hover[1] - 40, ps[1], easeIn(seg(t, T.drop0, T.splash)))];
    if (p && t >= T.drop0) {   // falling: a teardrop that stretches with speed
      const v = seg(t, T.drop0, T.splash), L = 10 + 40 * v * v;
      fillPoly([[p[0], p[1] - L], [p[0] + 7, p[1] - 4], ...circlePts(p[0], p[1], 7, 7, 12, 0).slice(0, 7), [p[0] - 7, p[1] - 4]], PAL.signal, 1, .9);
    }
    if (t >= T.splash) {
      // dissolved into the water until the bottle is plotted; then the pen; then onto the band
      if (pen) p = pen;
      else if (t < T.bottle0) p = null;
      else if (t < T.ring0) p = BP[BP.length - 1];
      else p = ringSensor(t, Math.max(tiltR, 0));
      if (t > T.ring0 && !pen) { const k = easeInOut(seg(t, T.ring0 + .3, T.ring0 + .7)); p = k < 1 ? [lerp(RING_C[0], ringSensor(t, tiltR)[0], k), lerp(RING_C[1] - BOT.R, ringSensor(t, tiltR)[1], k)] : ringSensor(t, tiltR); }
    }
    if (t >= T.bottle0 - .25 && t < T.bottle0) p = [RING_C[0], RING_C[1] - BOT.R * .95], spark(...p, seg(t, T.bottle0 - .25, T.bottle0));
    else if (p) spark(p[0], p[1], 1 + .8 * pulse(t, T.splash, 5));
    if (t >= T.splash && t < T.splash + .4) spark(ps[0], ps[1], 1.6 * (1 - seg(t, T.splash, T.splash + .4)));
  }
  plate(10, pilgrim);
})();
