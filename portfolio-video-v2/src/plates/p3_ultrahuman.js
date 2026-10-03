// p3_ultrahuman.js (17–24 s): the ripple band is now a ring, a wireframe torus. The signal orbits inside it as its
// sensor; then it leaves the ring and its trail becomes a heartbeat on an oscilloscope, with a sleep hypnogram and a
// readiness score. After the last beat the trace flatlines, and the flat line stretches across the frame and drops to
// LINE_Y: the line the outro opens back into the sheet.
const RING = { ax: 1.12, tube: 26 };                  // the ring's tilt (radians) and tube radius at rest
// ring placement over time: forms at RING_C, then slides left and shrinks to make room for the scope
const ringPose = t => { const k = easeInOut(seg(t, T.orbit1, T.orbit1 + .8)); return { c: [lerp(RING_C[0], 470, k), lerp(RING_C[1], 560, k)], s: lerp(1, .78, k) }; };
const ringSpin = t => (t - T.ring0) * .55;
// a point on the torus (u around the ring, v around the tube), tilted by ax and placed at pose
function torusPt(u, v, tube, ax, pose) {
  const R = RING_R * pose.s, r = tube * pose.s;
  const x = (R + r * Math.cos(v)) * Math.cos(u), y = (R + r * Math.cos(v)) * Math.sin(u), z = r * Math.sin(v);
  const y2 = y * Math.cos(ax) - z * Math.sin(ax), z2 = y * Math.sin(ax) + z * Math.cos(ax);
  const f = 1400 / (1400 + z2);
  return [pose.c[0] + x * f, pose.c[1] + y2 * f, z2];
}
// k: 0..1 how far the flat band has become the ring (tilt and tube both grow)
function drawRing(t, k = 1, a = 1) {
  const ax = RING.ax * k, tube = RING.tube * k, pose = ringPose(t), sp = ringSpin(t);
  // parallels (around the ring), then meridians (around the tube); depth fades the far side
  for (const v of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const P = []; for (let i = 0; i <= 96; i++) P.push(torusPt(i / 96 * TAU, v, tube, ax, pose));
    for (let i = 0; i < 96; i += 8) { const S = P.slice(i, i + 9), z = S[4][2]; stroke(S, { w: v === 0 ? 2.4 : 1.2, col: PAL.bone, a: a * (v === 0 ? .95 : .55) * lerp(1, .35, clamp((z + RING_R) / (2 * RING_R))) }); }
  }
  if (k > .3) for (let m = 0; m < 36; m++) {
    const u = m / 36 * TAU + sp, P = []; for (let i = 0; i <= 16; i++) P.push(torusPt(u, i / 16 * TAU, tube, ax, pose));
    stroke(P, { w: 1, col: PAL.bone, a: a * .4 * k * lerp(1, .3, clamp((P[0][2] + RING_R) / (2 * RING_R))) });
  }
  // the sensors on the inner face, pulsing on the beat
  if (k > .5) for (let s = 0; s < 3; s++) { const p = torusPt(Math.PI / 2 + (s - 1) * .16 + sp * 0, Math.PI, tube, ax, pose); dot(p[0], p[1], 3.5, PAL.signal, a * (.5 + .5 * Math.exp(-((t / BEAT) % 1) * 4)), .5 * a); }
}
// the signal riding the inner face of the ring
const ringSensor = (t, k = 1) => torusPt(-Math.PI / 2 - (t - T.ring0) * 2.4, Math.PI, RING.tube * k, RING.ax * k, ringPose(t));

(() => {
  const SC = { x0: 790, x1: 1820, y: 500, top: 380, bot: 620 };   // oscilloscope
  const headX = t => lerp(SC.x0, SC.x1, seg(t, T.ecg0 + .1, T.flat0 + .4));
  const BEAT_X = T.beats.map(headX);
  // one heartbeat (P wave, QRS spike, T wave) as a y offset at distance d (px) after the beat's x
  const blip = d => d < 0 || d > 90 ? 0 : d < 18 ? -10 * Math.sin(d / 18 * Math.PI) : d < 26 ? 0 : d < 32 ? 14 * (d - 26) / 6 : d < 40 ? lerp(14, -120, (d - 32) / 8) : d < 48 ? lerp(-120, 46, (d - 40) / 8) : d < 54 ? lerp(46, 0, (d - 48) / 6) : -16 * Math.sin((d - 60) / 30 * Math.PI) * (d > 60);
  const ecgY = (x, flat) => SC.y + (1 - flat) * BEAT_X.reduce((s, bx) => s + blip(x - bx), 0);
  const HYP = [[.06, 0], [.1, 2], [.16, 3], [.1, 2], [.1, 1], [.12, 2], [.1, 3], [.12, 1], [.06, 2], [.08, 0]];   // [width, stage]

  function ultra(t, lt) {
    const out = 1 - seg(t, T.flat0, T.flat0 + .5);            // everything but the trace leaves after the last beat
    const flat = easeInOut(seg(t, T.flat0 + .1, T.flat0 + .6)), drop = easeInOut(seg(t, T.flat0 + .4, 24));
    drawRing(t, 1, out);

    // ---- title + spec line ----
    const pr = easeOut(seg(t, 17.2, 17.8)) * out;
    if (pr > 0) {
      X.save(); X.beginPath(); X.rect(SC.x0 - 10, 170, 1100 * pr, 120); X.clip();
      text('ULTRAHUMAN', SC.x0, 262, { fam: 'disp', size: 84, wght: 800, stretch: 'expanded', col: PAL.bone, a: pr });
      X.restore();
      text('SMART RING · LANDING PAGE · SLEEP · HEART · RECOVERY', SC.x0, 316, { size: 18, col: PAL.boneDim, a: pr * seg(t, 17.6, 18), ls: 2 });
    }
    // ---- oscilloscope grid ----
    const gk = seg(t, T.ecg0, T.ecg0 + .5) * out;
    if (gk > 0) {
      for (let x = SC.x0; x <= SC.x1 + 1; x += 40) stroke([[x, SC.top], [x, SC.bot]], { w: 1, col: PAL.graphite, a: gk * (x % 200 === SC.x0 % 200 ? .9 : .45) });
      for (let y = SC.top; y <= SC.bot + 1; y += 40) stroke([[SC.x0, y], [SC.x1, y]], { w: 1, col: PAL.graphite, a: gk * .6 });
      const hr = t < T.beats[0] ? '--' : '60';
      text(`HR ${hr} BPM`, SC.x0, SC.bot + 34, { size: 16, col: PAL.boneDim, a: gk, ls: 2 });
      text('HRV 68 ms', SC.x0 + 220, SC.bot + 34, { size: 16, col: PAL.boneDim, a: gk * seg(t, 20, 20.3), ls: 2 });
    }
    // ---- hypnogram ----
    const hk = easeInOut(seg(t, T.hyp0, T.hyp1));
    if (hk > 0 && out > 0) {
      const x0 = SC.x0, wTot = 640, ys = s => 700 + s * 34, P = []; let x = x0;
      for (const [w, s] of HYP) { P.push([x, ys(s)], [x + w * wTot, ys(s)]); x += w * wTot; }
      stroke(partial(P, hk).pts, { w: 2, col: PAL.bone, a: out });
      ['AWAKE', 'REM', 'LIGHT', 'DEEP'].forEach((s, i) => text(s, x0 - 14, ys(i) + 5, { size: 13, col: PAL.boneDim, a: out * seg(t, T.hyp0, T.hyp0 + .3), align: 'right', ls: 2 }));
    }
    // ---- readiness score ----
    const sk = seg(t, T.score0, T.score1);
    if (sk > 0 && out > 0) {
      text('READINESS', 1560, 690, { size: 16, col: PAL.boneDim, a: out, ls: 3 });
      text(String(Math.round(92 * easeOut(sk))), 1556, 830, { fam: 'disp', size: 150, wght: 700, stretch: 'condensed', col: sk >= 1 ? PAL.signal : PAL.bone, a: out, glow: sk >= 1 ? .5 * out : 0 });
    }

    // ---- the trace: from the ring out to the scope, then the heartbeat; flatlines, stretches, drops to LINE_Y ----
    let tip = null;
    if (t > T.ecg0) {
      const hx = headX(t), y0 = lerp(SC.y, LINE_Y, drop), P = [];
      const exit = ringSensor(T.ecg0, 1), ext = easeInOut(seg(t, T.flat0 + .3, 24));
      const xs = lerp(SC.x0, -20, ext), xe = lerp(hx, W + 20, ext);
      if (ext < 1) {   // the lead-in from the ring's sensor to the scope, fading as the trace takes over
        const a = 1 - seg(t, T.flat0, T.flat0 + .4), k = seg(t, T.ecg0, T.ecg0 + .1);
        stroke([exit, [lerp(exit[0], SC.x0, k), lerp(exit[1], SC.y, k)]], { w: 1.6, col: PAL.signal, a: .6 * a * out, glow: .3 * a });
      }
      for (let x = xs; x <= xe; x += 3) P.push([x, ecgY(x, flat) + y0 - SC.y]);
      if (P.length > 1) {
        stroke(P, { w: lerp(2, 3, ext), col: mixCol(PAL.bone, PAL.bone, 1), a: .85 });
        const hot = P.filter(p => p[0] > xe - 160);   // the fresh end of the trace glows in the signal colour
        if (ext < 1) stroke(hot, { w: 2.4, col: PAL.signal, a: 1, glow: .9 });
        else stroke(P, { w: 3, col: PAL.bone, a: 1, glow: .5 });
        tip = P[P.length - 1];
      }
    }
    // ---- the signal: sensor → the trace head → the centre of the flat line ----
    let p = t < T.ecg0 ? ringSensor(t, 1) : tip || ringSensor(t, 1);
    if (t > T.flat0 + .3) { const k = easeInOut(seg(t, T.flat0 + .3, 24)); p = [lerp(headX(T.flat0 + .3), W / 2, k), lerp(SC.y, LINE_Y, drop)]; }
    spark(p[0], p[1], 1 + .6 * T.beats.reduce((s, b) => s + pulse(t, b, 7), 0));
  }
  plate(17, ultra);
})();
