// c02_pilgrim.js: chapter 2 (5–10 s), rice water. The camera pulls back out of a milky water surface (cream, matching
// c01's last frame) to a ceramic bowl. A drop falls in; Sak dips its bottle, lifts it full, caps it, dabs a drop on its
// cheek and glows, then tosses the bottle up into a darkening sky. Brush wipe out in NIGHT colours.
(() => {
  const T0 = 5, G = 900, SX = 700, U = 26;
  const BOWL = [1080, 770, 240, 52];                    // rim centre x, y, rx, ry
  const S = 150;                                        // bottle height
  const tDrop = .55, tSplash = .95, tDip = 1.35, tUp = 1.9, tCap = 2.15, tDab = 2.55, tGlow = 2.95, tWind = 3.55, tToss = 3.75;

  function set(lt) {
    boilSeed('sky2');   // above the wall: the sky the bottle flies into, getting darker the higher it goes
    paint(rectPts(-400, -1300, W + 800, 1100), { wash: mixCol(PAL.violet, PAL.night, .35), ink: null });
    paint(rectPts(-400, -500, W + 800, 520), { fill: PAL.rose, fillOp: 90, bleed: .2, tex: .5, ink: null });
    boilSeed('wall2');
    paint(rectPts(-400, -20, W + 800, G + 20), { wash: mixCol(PAL.paper, PAL.rose, .22), ink: null });
    paint(rectPts(-400, -220, W + 800, 300), { fill: mixCol(PAL.rose, PAL.violet, .45), fillOp: 150, bleed: .35, tex: .6, ink: null });   // soft top edge into the sky
    paint(ellPts(1500, 260, 560, 360, 30, 10), { fill: mixCol(PAL.cream, PAL.ochre, .3), fillOp: 80, bleed: .3, tex: .6, ink: null });   // morning window light
    paint(ellPts(300, 520, 420, 300, 30, 10), { fill: mixCol(PAL.sap, PAL.paper, .5), fillOp: 50, bleed: .3, tex: .6, ink: null });
    boilSeed('floor2');
    paint(rectPts(-400, G, W + 800, 500, 2), { wash: mixCol(PAL.sap, PAL.paper, .45), fill: PAL.sap, fillOp: 60, bleed: .05, tex: .6, ink: null });
    inkLine([[-300, G + 2], [W / 2, G - 2], [W + 300, G + 3]], 1.1, PAL.ink, 'ink', .5);
    boilSeed('cloth');   // a rose cloth under the bowl
    paint([[BOWL[0] - 330, G + 6], [BOWL[0] + 330, G + 4], [BOWL[0] + 380, G + 60], [BOWL[0] - 390, G + 64]], { wash: PAL.rose, fill: '#C9506F', fillOp: 50, bleed: .05, tex: .5, ink: PAL.ink, sw: .8 });
  }

  const [BX, BY, BRX, BRY] = BOWL;
  function bowlBack(lt) {
    boilSeed('bowlback');
    paint(ellPts(BX, BY, BRX, BRY, 36, 1), { wash: '#9DBFA9', ink: PAL.ink, sw: 1 });                 // inner wall
    paint(ellPts(BX, BY + 10, BRX * .9, BRY * .72, 36, 1), { wash: '#FBF6EC', fill: PAL.cream, fillOp: 70, bleed: .05, tex: .4, ink: null });   // milky water
    // ripples from the drop
    if (lt > tSplash) for (let i = 0; i < 3; i++) {
      const a = lt - tSplash - i * .18; if (a < 0 || a > 1.1) continue;
      const k = easeOut(a / 1.1), r = 20 + BRX * .85 * k;
      boilSeed('ripple' + i);
      inkLine(ellPts(BX, BY + 10, r, r * .22, 30).concat([[BX + r, BY + 10]]), .7 * (1 - k), mixCol(PAL.ink, PAL.cream, .4), 'inkfine', .5);
    }
  }
  function bowlFront() {
    boilSeed('bowlfront');
    const P = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI; P.push([BX + Math.cos(a) * BRX, BY + Math.sin(a) * (G - BY - 6)]); }
    paint(P, { wash: '#BFD8C8', fill: '#8DB59F', fillOp: 80, bleed: .05, tex: .6, ink: PAL.ink, sw: 1.1, curv: .3 });
    for (let i = 0; i < 5; i++) inkLine([[BX - 150 + i * 75, BY + 60], [BX - 135 + i * 75, BY + 82]], .6, mixCol(PAL.teal, PAL.ink, .3), 'inkfine', 0);   // glaze marks
    paint(rectPts(BX - 80, G - 14, 160, 14), { wash: '#8DB59F', ink: PAL.ink, sw: .8 });                  // foot
  }

  function shot(t, lt) {
    const dur = 5;
    // camera: out of the water surface → the room; drifts; tilts up after the toss
    const out = easeOut(seg(lt, 0, .8));
    // the toss: the bottle flies on an arc, and the camera rises after it (see below)
    const fly = seg(lt, tToss, tToss + 1.25), flyP = arcPt([0, 0], [380, -1500], 300, ease(fly));
    const follow = ease(seg(lt, tToss + .05, tToss + .5));
    const cx = lerp(BX, 930, out) + 14 * Math.sin(lt * .7) + 200 * follow;
    const cy = lerp(BY + 10, 760, out) + lerp(0, flyP[1] + 80, follow);
    const zoom = lerp(9, 1.7, out) * kf(lt, [[.8, 1], [tDab, 1.05], [tWind, 1.05], [tToss + .5, .8]]);
    camBegin(cx, cy, zoom);
    set(lt);
    bowlBack(lt);

    // Sak: happy → hopeful (watches the drop, dips) → proud (capped) → love (the glow) → excited (the toss)
    const mood = emotions(lt, [[0, 'happy'], [tDrop + .1, 'hopeful', { lookX: .9, lookY: -.6 }], [tSplash + .1, 'hopeful', { lookX: .9, lookY: .5 }],
                                [tCap + .05, 'proud'], [tGlow, 'love'], [tToss + .15, 'excited', { lookX: .5, lookY: -1 }]]);
    // the bottle arm: up holding it → lean and dip → lift → hold out → tip toward the cheek → wind-up → throw
    const dip = ease(seg(lt, tDip, tDip + .3)) * (1 - ease(seg(lt, tUp - .15, tUp + .15)));
    const tip = ease(seg(lt, tDab, tDab + .2)) * (1 - ease(seg(lt, tGlow + .1, tGlow + .4)));
    const wind = ease(seg(lt, tWind, tToss)), thr = seg(lt, tToss, tToss + .12);
    let aR = lerp(.6, -.2, dip);
    aR = lerp(aR, 1.0, tip);
    aR = lt < tToss ? lerp(aR, -.6, wind) : lerp(-.6, 1.5, easeOut(thr)) - .6 * ease(seg(lt, tToss + .6, tToss + 1.1));
    const pose = { ...mood, aR, rot: (mood.rot || 0) + .3 * dip, sq: (mood.sq || 0) + .18 * wind * (1 - thr) - .12 * Math.exp(-(lt - tToss) * 8) * (lt > tToss) };
    if (lt > tGlow) pose.lt = mixCol(CHAR.lt, PAL.cream, .5 * (1 - seg(lt, tGlow + 1, tGlow + 2)));
    const hand = armTipR(SX, G, U, pose);

    // the bottle: held at the hand until the throw, then on an arc up and out of the top of the frame
    const fill = ease(seg(lt, tDip + .25, tUp)), cap = seg(lt, tCap, tCap + .25);
    let bp = [hand[0], hand[1] + S * .36], brot = -.5 * tip + .1 * Math.sin(lt * 2) * (1 - dip);
    if (lt > tToss) { const from = armTipR(SX, G, U, { ...pose, aR: 1.5, sq: 0, rot: 0, dy: 0 }); bp = [from[0] + flyP[0], from[1] + S * .36 + flyP[1]]; brot = (lt - tToss) * 7; }
    sak(SX, G, U, pose);
    bottle(...bp, S, fill, cap, brot);
    bowlFront();                                          // in front of the bottle, so a dipped bottle sits inside the bowl
    sparkle(bp[0] + 30, bp[1] - S * .8, 40, seg(lt, tCap + .15, tCap + .55));

    // the drop: falls into the bowl → ripples (bowlBack); a second drop: bottle mouth → Sak's cheek → glow
    boilSeed('drops');
    if (lt > tDrop && lt < tSplash) { const k = easeIn(seg(lt, tDrop, tSplash)), y = lerp(BY - 700, BY + 8, k); paint(ellPts(BX + 20, y, 9, 13, 12), { wash: '#FBF6EC', ink: PAL.ink, sw: .6 }); }
    if (lt > tSplash && lt < tSplash + .5) for (let i = 0; i < 5; i++) { const k = seg(lt, tSplash, tSplash + .5), a = -Math.PI / 2 + (i - 2) * .45; paint(ellPts(BX + 20 + Math.cos(a) * 90 * k, BY + 8 + Math.sin(a) * 70 * k + 120 * k * k, 6 * (1 - k), 6 * (1 - k), 8), { wash: '#FBF6EC', ink: null }); }
    const cheek = [SX + 2.4 * U, G - 4.6 * U + (mood.dy || 0) * U];
    if (lt > tDab && lt < tGlow) { const k = seg(lt, tDab + .1, tGlow), m = [bp[0] - S * .2, bp[1] - S * .8], p = arcPt(m, cheek, 60, ease(k)); if (k > 0) paint(ellPts(p[0], p[1], 8, 11, 10), { wash: '#FBF6EC', ink: PAL.ink, sw: .5 }); }
    if (lt > tGlow) { const a = lt - tGlow; glow(...cheek, 90 + 200 * (1 - Math.exp(-a * 5)), '#FFF0D0', .9 * Math.exp(-a * 1.2)); for (let i = 0; i < 5; i++) { const ang = i / 5 * TAU + .4; sparkle(cheek[0] + Math.cos(ang) * 130 * seg(a, 0, .5), cheek[1] + Math.sin(ang) * 110 * seg(a, 0, .5), 26, seg(a, i * .04, .6 + i * .04)); } }
    camEnd();
    boilSeed('transition');
    flash(1 - seg(lt, .05, .4), PAL.cream);               // the cream hand-off from c01, dissolving into the water
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, NIGHT);
  }

  shots([[T0, shot]]);
})();
