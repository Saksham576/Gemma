// c01_tableproof.js: chapter 1 (0–5 s), the paper avalanche. A stack of pages topples onto Sak; Sak lifts the
// gem-lens and the pages fly through its beam into a clean table card. One cell flags, Sak fixes it, and the camera
// pushes into a clean cream cell until cream fills the frame (the hand-off to c02).
(() => {
  const G = 800, SX = 620, U = 28;                      // desk line, Sak's spot and size
  const STACK = [1010, G], NP = 12;                     // the stack's base, page count
  const tLean = .55, tFall = 1.0, tIdea = 2.2, tFly = 2.5, tFlag = 3.45, tFix = 3.95, tPush = 4.35;
  const CARD = [1420, 470, 440, 320];                   // table card: centre x, y, w, h
  const cardIn = t => backOut(seg(t, 2.25, 2.6));

  // where page i lands in the heap after the topple, and how it is turned there
  const heap = i => [SX - 360 + (i % 6) * 150 + (hash(i * 3) - .5) * 60, G - 30 - Math.floor(i / 6) * 30 - hash(i + 4) * 14];
  const heapRot = i => (hash(i * 5) - .5) * .9;
  // the order pages fly to the card; each flight lasts .45 s, starting every .07 s
  const flyT = i => tFly + i * .07;

  function room(t) {
    boilSeed('wall');
    paint(rectPts(-400, -300, W + 800, G + 300), { wash: mixCol(PAL.paper, PAL.ochre, .18), ink: null });
    paint(ellPts(260, 260, 620, 420, 30, 10), { fill: PAL.ochre, fillOp: 70, bleed: .3, tex: .6, ink: null });   // lamp light on the wall
    paint(ellPts(1600, 180, 520, 300, 30, 10), { fill: mixCol(PAL.rose, PAL.paper, .5), fillOp: 40, bleed: .3, tex: .6, ink: null });
    // the lamp: arm and shade, top left
    boilSeed('lamp');
    inkLine([[150, G - 4], [150, 420], [300, 250]], 2.2, PAL.ink, 'ink', .3);
    paint([[240, 210], [380, 190], [420, 300], [260, 330]], { wash: PAL.ochre, fill: PAL.clay, fillOp: 60, ink: PAL.ink, sw: 1 });
    glow(340, 330, 260 + 10 * Math.sin(t * 3), '#FFD58A', .75);
    // the desk
    boilSeed('desk');
    paint(rectPts(-400, G, W + 800, 500, 2), { wash: PAL.clayDk, fill: mixCol(PAL.clayDk, PAL.ink, .3), fillOp: 90, bleed: .05, tex: .7, ink: null });
    paint(rectPts(-400, G - 6, W + 800, 30, 2), { wash: PAL.clay, ink: null });
    inkLine([[-300, G - 6], [W / 2, G - 9], [W + 300, G - 5]], 1.1, PAL.ink, 'ink', .5);
  }

  // the stack: thin edge-on slabs piled up, leaning (ang) about its bottom right corner
  function stack(t, ang, n) {
    push(); translate(STACK[0] + 90, STACK[1]); rotate(ang);
    for (let i = 0; i < n; i++) {
      boilSeed('slab' + i);
      const off = (hash(i * 11) - .5) * 26 + Math.sin(t * 6 + i) * i * .6;
      paint(rectPts(-180 + off, -(i + 1) * 30, 180, 26, 1.5), { wash: i % 2 ? PAL.cream : mixCol(PAL.cream, PAL.ochre, .15), ink: PAL.ink, sw: .7 });
      inkLine([[-170 + off, -(i + 1) * 30 + 13], [-20 + off, -(i + 1) * 30 + 12]], .35, PAL.ink, 'inkfine', 0);
    }
    pop();
  }
  // a page's position before it falls: on the leaning stack (rotated about the pivot)
  const onStack = (i, ang) => {
    const lx = -90, ly = -(i + 1) * 30 + 13, c = Math.cos(ang), s = Math.sin(ang);
    return [STACK[0] + 90 + lx * c - ly * s, STACK[1] + lx * s + ly * c];
  };

  function shot(t, lt) {
    const dur = 5;                                      // fixed: the push-through must end exactly at the cut
    const shake = t > tFall && t < tFall + .6 ? shakeXY(t, 10 * Math.exp(-(t - tFall) * 6)) : [0, 0];
    const push_ = easeIn(seg(t, tPush, dur - .05));
    const C0 = cardCells(...CARD)[2];                    // the clean cream cell the camera dives into
    const cx = kf(t, [[0, 900], [2, 900], [3, 1080], [tPush, 1100], [dur, C0[0]]]) + shake[0];
    const cy = kf(t, [[0, 560], [2, 540], [tPush, 520], [dur, C0[1]]]) + shake[1];
    const zoom = kf(t, [[0, 1], [2, 1.06], [3, 1.1], [tPush, 1.12]]) * (1 + 7 * push_);
    camBegin(cx, cy, zoom);
    room(t);

    // the stack wobbles, leans back (anticipation), then tips over toward Sak
    const ang = t < tLean ? .03 * Math.sin(t * 9) : -.12 * easeOut(seg(t, tLean, tLean + .3)) * (1 - seg(t, .85, tFall)) - 1.1 * easeIn(seg(t, .85, tFall));
    if (t < tFall) stack(t, ang, NP);

    // the card pops up on the right, then fills as the pages arrive
    const arrived = t < tFly ? 0 : clamp((t - tFly - .45) / (NP * .07 + .01) + .01);
    if (t > 2.25) {
      const k = cardIn(t);
      push(); translate(CARD[0], CARD[1] + 300); scale(k, k); translate(-CARD[0], -CARD[1] - 300);
      boilSeed('easel');
      inkLine([[CARD[0] - 120, G], [CARD[0], CARD[1]]], 1.6, PAL.ink, 'ink', 0);
      inkLine([[CARD[0] + 120, G], [CARD[0], CARD[1]]], 1.6, PAL.ink, 'ink', 0);
      tableCard(...CARD, arrived, seg(t, tFlag, tFlag + .15), ease(seg(t, tFix + .1, tFix + .45)));
      pop();
      sparkle(CARD[0] + 200, CARD[1] - 160, 40, seg(t, 2.45, 2.9));
      if (t > tFlag) {   // the flagged cell gets a "?" and a pulse
        const [fx, fy] = cardCells(...CARD)[FLAG];
        boilSeed('flag');
        if (t < tFix + .05) emote('?', fx + 40, fy - 70, 34, seg(t, tFlag, tFlag + .2), t - tFlag);
        sparkle(fx, fy, 70, seg(t, tFix + .1, tFix + .55));
      }
    }

    // Sak: neutral → surprised (the topple) → thinking → idea (the gem) → determined (aiming) → proud
    const mood = emotions(t, [[0, 'neutral', { lookX: .6 }], [tFall + .05, 'surprised', { lookX: .7, lookY: -.5 }], [1.7, 'thinking', { lookX: -.2, lookY: .6 }],
                               [tIdea, 'idea'], [2.7, 'determined', { lookX: .9, lookY: -.4 }], [tFlag + .1, 'determined', { lookX: 1, lookY: -.2 }], [tPush - .05, 'proud']]);
    const hop = jump(t, tIdea - .05, tIdea + .3, 2.2);
    mood.dy = (mood.dy || 0) + hop.dy; mood.sq = (mood.sq || 0) + hop.sq;
    const gemK = backOut(seg(t, tIdea, tIdea + .3));
    // the gem arm: up with the idea, then swings to aim at the card; a little recoil on the fix
    const aim = ease(seg(t, 2.55, 2.85)), rec = spring(t, tFix, 7, 22) * .25;
    const aR = t < tIdea ? mood.aR : lerp(mood.aR ?? 1.5, .55, aim) + rec * (1 - seg(t, tPush, tPush + .3));
    const gemAt = [SX + 4.9 * U + Math.cos(aR) * 2.2 * U + 16, G + (mood.dy || 0) * U - 4.5 * U * (1 - (mood.sq || 0)) - Math.sin(aR) * 2.2 * U];
    sak(SX, G, U, { ...mood, aR, armR: t > tIdea ? (u, sw) => paint(ellPts(0, 0, u * .5, u * .5, 10), { wash: CHAR.dk, ink: PAL.ink, sw: sw * .6 }) : null });
    if (t > tIdea) {
      // the beam from the gem to the card while the pages fly
      const bk = seg(t, tFly - .1, tFly + .1) * (1 - seg(t, flyT(NP - 1) + .45, flyT(NP - 1) + .7));
      if (bk > 0) {
        boilSeed('beam');
        paint([gemAt, [CARD[0] - CARD[2] / 2, CARD[1] - CARD[3] * .4], [CARD[0] - CARD[2] / 2, CARD[1] + CARD[3] * .4]], { fill: '#9CC8FF', fillOp: 110 * bk, bleed: .2, tex: .3, ink: null });
      }
      // a spark zips from the gem to the flagged cell for the fix
      if (t > tFix - .15 && t < tFix + .1) {
        const [fx, fy] = cardCells(...CARD)[FLAG], k = seg(t, tFix - .15, tFix + .05);
        const p = arcPt(gemAt, [fx, fy], 60, easeIn(k)); glow(...p, 60, '#9CC8FF', 1); sparkle(...p, 26, .35);
      }
      gem(...gemAt, 34 * gemK, .4 * (bk + clamp(spring(t, tFix, 6, 20))), .3 * Math.sin(t * 2));
    }

    // the pages: on the stack → flying off on arcs into a heap over Sak's feet → flying through the beam into the card
    if (t > tFall) for (let i = 0; i < NP; i++) {
      const h = heap(i), fall0 = tFall + i * .03, fall1 = fall0 + .38 + hash(i) * .12;
      let p, r, s = 1;
      if (t < fall1) { const k = seg(t, fall0, fall1); p = arcPt(onStack(i, -1.1), h, 120 + 80 * hash(i + 2), easeIn(k) * .4 + k * .6); r = lerp(-1.1, heapRot(i), k) + k * (1 - k) * 4; }
      else if (t < flyT(i)) { const a = t - fall1; p = [h[0], h[1] - 18 * Math.exp(-a * 9) * Math.abs(Math.sin(a * 16))]; r = heapRot(i); }
      else if (t < flyT(i) + .45) {
        const k = seg(t, flyT(i), flyT(i) + .45), mid = [lerp(h[0], CARD[0] - CARD[2] / 2, .55), CARD[1] - 40];
        p = k < .5 ? arcPt(h, mid, 140, easeOut(k * 2)) : arcPt(mid, [CARD[0] - 120, CARD[1]], 40, easeIn((k - .5) * 2));
        r = lerp(heapRot(i), 0, k) + Math.sin(k * Math.PI) * 1.2; s = 1 - .75 * easeIn(k);
      } else continue;
      page(p[0], p[1], s, r, i);
    }
    camEnd();
    // full-frame: iris in from ink; cream fills the frame as the camera dives into the clean cell
    boilSeed('transition');
    if (lt < .6) iris(...toScreen(SX, G - 4 * U, { cx, cy, zoom, rot: 0 }), lerp(0, 1500, easeIn(lt / .6)));
    flash(seg(t, dur - .55, dur - .12), PAL.cream);
  }

  shots([[0, shot]]);
})();
