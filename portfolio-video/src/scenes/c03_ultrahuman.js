// c03_ultrahuman.js: chapter 3 (10–15 s), night into dawn. Sak dozes on a pillow on a night hill. The toss from c02
// comes down changed: a ring glints out of the sky and lands on Sak's arm. It glows and beats a pulse line across the
// sky; Sak wakes as the sun comes up, leaps, and runs off right into a whip pan (the hand-off to c04).
(() => {
  const T0 = 10, G = 840, SX = 880, U = 28;
  const tFall = .35, tLand = 1.05, tGlow = 1.35, tPulse0 = 1.5, tPulse1 = 2.7, tDawn = 2.5, tJump = 3.3, tRun = 3.85;
  const SUN = [1420, 1040, 640];                        // sun x, start y, risen y

  // the pulse line across the sky: flat, with a heartbeat blip every 300 px
  const BLIP = [[0, 0], [16, -18], [30, 0], [42, 12], [56, -120], [72, 52], [86, 0]];
  const PL = (() => { const P = []; for (let x0 = 160; x0 < 1800; x0 += 300) { for (let x = x0; x < x0 + 150; x += 30) P.push([x, 300]); for (const [dx, dy] of BLIP) P.push([x0 + 150 + dx, 300 + dy]); for (let x = x0 + 250; x < x0 + 300; x += 25) P.push([x, 300]); } return P; })();

  function sky(lt, dawn) {
    boilSeed('night');
    paint(rectPts(-600, -400, W + 2400, H + 800), { wash: mixCol(PAL.night, '#3A3F7A', dawn * .6), ink: null });
    paint(ellPts(500, 160, 900, 320, 30, 10), { fill: PAL.indigo, fillOp: 100, bleed: .3, tex: .5, ink: null });
    if (dawn > 0) {   // dawn light rising from behind the hill
      paint(ellPts(SUN[0], 900, 1300, 520 * dawn, 30, 10), { fill: mixCol(PAL.rose, PAL.ochre, .4), fillOp: 200 * dawn, bleed: .3, tex: .6, ink: null });
      paint(ellPts(SUN[0], 860, 800, 300 * dawn, 30, 10), { fill: PAL.ochre, fillOp: 160 * dawn, bleed: .3, tex: .6, ink: null });
    }
    for (let i = 0; i < 34; i++) {
      boilSeed('star' + i);
      const x = hash(i) * (W + 1600) - 200, y = hash(i + 50) * 560 - 30, tw = .55 + .45 * Math.sin(lt * (2 + 2 * hash(i + 9)) + i);
      const a = (1 - dawn * (.6 + .4 * (y / 560))) * tw;
      if (a > .05) paint(starPts(x, y, 3 + 5 * hash(i + 3) * tw, .35, 4), { wash: PAL.cream, washOp: 255 * clamp(a), ink: null });
    }
    if (dawn > 0) {
      const sy = lerp(SUN[1], SUN[2], easeOut(dawn));
      glow(SUN[0], sy, 260 + 80 * dawn, '#FFD27A', .9 * dawn);
      boilSeed('sun');
      paint(ellPts(SUN[0], sy, 120, 120, 30, 1.5), { wash: '#F6C25A', fill: PAL.ochre, fillOp: 90, bleed: .05, tex: .5, ink: PAL.ink, sw: 1 });
    }
  }
  function ground(lt) {
    boilSeed('hillfar');
    paint(ellPts(SUN[0] + 100, G + 160, 1100, 300, 40, 2), { wash: mixCol(PAL.teal, PAL.night, .5), fill: PAL.night, fillOp: 60, bleed: .05, tex: .5, ink: PAL.ink, sw: .9 });
    boilSeed('hill');
    const top = [], N = 24; for (let i = 0; i <= N; i++) { const x = lerp(-500, 3600, i / N); top.push([x, G + 8 * Math.sin(x * .004) + 6 * hash(i)]); }
    paint(top.concat([[3600, G + 600], [-500, G + 600]]), { wash: mixCol(PAL.sap, PAL.night, .4), fill: mixCol(PAL.sap, PAL.night, .6), fillOp: 90, bleed: .05, tex: .6, ink: null });
    for (let k = 0; k < 4; k++) inkLine(top.slice(k * 6, k * 6 + 7), 1.1, PAL.ink, 'ink', .5);   // the edge, in canvas-sized pieces
  }

  function shot(t, lt) {
    const dur = 5;
    const dawn = ease(seg(lt, tDawn, tDawn + 1.1));
    const run = seg(lt, tRun, dur), runX = SX + 1500 * easeIn(run) + 300 * run;
    const shake = lt > tLand && lt < tLand + .5 ? shakeXY(t, 6 * Math.exp(-(lt - tLand) * 7)) : [0, 0];
    const cx = kf(lt, [[0, 960], [tLand, 980], [tDawn, 1040], [tRun, 1080]]) + (lt > tRun ? (runX - SX) * .95 : 0) + shake[0];
    const cy = kf(lt, [[0, 560], [tLand, 600], [tDawn, 560], [tRun, 560]]) + shake[1];
    const zoom = kf(lt, [[0, 1.12], [tLand, 1.25], [tDawn, 1.2], [tJump, 1.05]]);
    camBegin(cx, cy, zoom);
    sky(lt, dawn);
    ground(lt);

    // the pillow Sak dozes on, left behind when Sak runs
    boilSeed('pillow');
    paint(rrPts(SX - 190, G - 46, 380, 70, 34, 2), { wash: PAL.cream, fill: mixCol(PAL.cream, PAL.violet, .3), fillOp: 90, bleed: .05, tex: .5, ink: PAL.ink, sw: 1 });

    // Sak: asleep → surprised (the ring lands) → hopeful (watching the pulse) → excited (dawn) → determined (the run)
    const mood = emotions(lt, [[0, 'sleepy'], [tLand + .05, 'surprised', { lookX: .9, lookY: .3 }], [tPulse0 + .1, 'hopeful', { lookX: .5, lookY: -.8 }],
                               [tDawn + .3, 'excited'], [tRun - .1, 'determined']]);
    const hop = jump(lt, tJump, tJump + .45, 3.2);
    const ringGlow = .35 + .65 * seg(lt, tGlow, tGlow + .4) * (.6 + .4 * pulse(t, 5));
    let pose = { ...mood, dy: (mood.dy || 0) + hop.dy, sq: (mood.sq || 0) + hop.sq };
    if (lt < tLand + .4) pose.aR = lerp(-.55, mood.aR ?? -.55, seg(lt, tLand, tLand + .4)) + spring(lt, tLand, 7, 24) * .4;
    if (lt > tRun - .15) {
      const st = seg(lt, tRun - .15, tRun);
      pose = { ...pose, ...(st < 1 ? turn(lt, tRun - .15, tRun, 0, .25) : { view: 'side' }), walk: (runX - SX) / (3 * U), dy: hop.dy - Math.abs(Math.sin((runX - SX) / (3 * U) * Math.PI)) * .8, rot: -.12 * seg(lt, tRun, tRun + .3),
               smear: .7 * seg(lt, dur - .45, dur), smearDir: 1 };
    }
    const wearing = lt >= tLand;
    sak(lt > tRun ? runX : SX, G - 30 * (1 - seg(lt, tJump - .1, tJump)), U, { ...pose,
      armR: wearing ? (u, sw) => smartRing(-.7 * u, 0, 1 * u, ringGlow, Math.PI / 2, .45) : null,
      armL: wearing && pose.view === 'side' ? (u, sw) => smartRing(-.7 * u, 0, 1 * u, ringGlow, Math.PI / 2, .45) : null });
    if (lt > tLand) for (let i = 0; i < 6; i++) { const h = armTipR(SX, G - 30, U, pose), a = i / 6 * TAU; sparkle(h[0] + Math.cos(a) * 80 * seg(lt, tLand, tLand + .4), h[1] + Math.sin(a) * 70 * seg(lt, tLand, tLand + .4), 22, seg(lt, tLand + i * .02, tLand + .45 + i * .02)); }

    // the ring falling out of the sky onto the arm tip, with a glinting trail
    if (lt > tFall && lt < tLand) {
      const hand = armTipR(SX, G - 30, U, { ...pose, aR: -.55 }), k = easeIn(seg(lt, tFall, tLand));
      const at = kk => [lerp(hand[0] + 300, hand[0], kk), lerp(60, hand[1], kk)];
      for (let i = 1; i < 7; i++) { const q = at(Math.max(0, k - i * .05)); sparkle(q[0], q[1], 18 - i * 2, .3 + i * .1); }
      glow(...at(k), 90, '#BFF3EC', 1);
      smartRing(...at(k), 40, .8, lt * 8, .45);
    }

    // the pulse line: drawn left to right from the ring's first glow, one heartbeat at a time
    if (lt > tPulse0) {
      const p = seg(lt, tPulse0, tPulse1), n = Math.max(2, Math.floor(p * PL.length));
      const fade = 1 - seg(lt, tDawn + .6, tDawn + 1.2);
      if (fade > 0) {
        boilSeed('pulse');
        const P = PL.slice(0, n);
        for (let k = 0; k < P.length - 1; k += 20) inkLine(P.slice(k, k + 21), 2.2 * fade, mixCol('#6FE3D6', PAL.cream, .2), 'ink', 0);
        if (p < 1) glow(...P[P.length - 1], 70, '#6FE3D6', 1);
      }
    }
    camEnd();
    boilSeed('transition');
    if (lt < .3) brushWipe(.5 + lt / .6, NIGHT);
    // whip: speed streaks across the frame as the camera races right (c04 opens on the same streaks)
    const wk = seg(lt, dur - .4, dur);
    if (wk > 0) for (let i = 0; i < 10; i++) { boilSeed('streak' + i); const y = 80 + i * 100 + 30 * hash(i), x = W * hash(i + 4); inkLine([[x - 500 * wk, y], [x + 300 * wk, y]], 1.4 * wk, mixCol(PAL.cream, PAL.ochre, .3), 'dry', 0); }
  }

  shots([[T0, shot]]);
})();
