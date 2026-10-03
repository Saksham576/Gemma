// c04_signature.js: chapter 4 (15–20 s), the signature. The whip from c03 lands; Sak skids in with a giant brush and
// paints a swoosh across a clean sheet, and the name rides in behind the bristles. The three keepsakes arc in around it,
// the project line fades in, Sak bows, and the iris closes on it. The film opened on a messy stack of paper and ends on
// one clean, signed sheet.
(() => {
  const T0 = 15, G = 900, U = 27;
  const NAME = 'Saksham', NFONT = s => `800 ${s}px "Shantell Sans"`, NS = 190, NY = 455;
  const tSkid = .6, tTurn = .62, tPaint0 = .8, tPaint1 = 2.05, tKeep = 2.1, tLine = 2.75, tBow = 3.45, tIris = 4.15;
  const SHEET = [250, 200, 1420, 520];

  // character centres for the name, measured once in the bundled font
  let CH = null;
  const chars = () => {
    if (CH) return CH;
    const c = letG.drawingContext; c.font = NFONT(NS);
    const ws = [...NAME].map(ch => c.measureText(ch).width), tw = ws.reduce((a, b) => a + b, 0);
    let x = W / 2 - tw / 2; CH = { tw, at: ws.map(w => { const cx = x + w / 2; x += w; return cx; }) };
    return CH;
  };
  const swooshY = x => NY + 18 * Math.sin(x * .007) + 6;

  function room(lt) {
    boilSeed('wall4');
    paint(rectPts(-800, -300, W + 1600, G + 300), { wash: mixCol(PAL.paper, PAL.ochre, .1), ink: null });
    paint(ellPts(260, 220, 520, 340, 30, 10), { fill: mixCol(PAL.teal, PAL.paper, .45), fillOp: 60, bleed: .3, tex: .6, ink: null });
    paint(ellPts(1700, 300, 520, 360, 30, 10), { fill: mixCol(PAL.rose, PAL.paper, .3), fillOp: 60, bleed: .3, tex: .6, ink: null });
    paint(ellPts(960, 980, 900, 260, 30, 10), { fill: mixCol(PAL.ochre, PAL.paper, .3), fillOp: 60, bleed: .3, tex: .6, ink: null });
    boilSeed('floor4');
    paint(rectPts(-800, G, W + 1600, 400, 2), { wash: mixCol(PAL.clay, PAL.paper, .45), fill: PAL.clay, fillOp: 50, bleed: .05, tex: .6, ink: null });
    inkLine([[-600, G], [W / 2, G - 3], [W + 600, G + 2]], 1.1, PAL.ink, 'ink', .5);
    // the clean sheet, taped to the wall
    boilSeed('sheet');
    const [x, y, w, h] = SHEET;
    paint(rrPts(x + 12, y + 16, w, h, 10), { fill: PAL.ink, fillOp: 50, bleed: .15, tex: .3, ink: null });
    paint(rrPts(x, y, w, h, 10, 1.5), { wash: PAL.cream, fill: mixCol(PAL.cream, PAL.ochre, .2), fillOp: 40, bleed: .05, tex: .5, ink: PAL.ink, sw: 1 });
    for (const [tx, ty, r] of [[x + 30, y + 10, -.5], [x + w - 30, y + 10, .5]]) { push(); translate(tx, ty); rotate(r); paint(rectPts(-45, -14, 90, 28, 1), { wash: mixCol(PAL.ochre, PAL.cream, .5), washOp: 220, ink: null }); pop(); }
  }

  // the big brush: a handle from Sak's hand to the bristles at tip
  function bigBrush(hand, tip) {
    boilSeed('bigbrush');
    const d = Math.hypot(tip[0] - hand[0], tip[1] - hand[1]) || 1, ux = (tip[0] - hand[0]) / d, uy = (tip[1] - hand[1]) / d;
    const neck = [tip[0] - ux * 60, tip[1] - uy * 60];
    paint(ribbon([[hand[0] - ux * 30, hand[1] - uy * 30], hand, neck], 14, 18), { wash: PAL.ochre, fill: PAL.clayDk, fillOp: 50, ink: PAL.ink, sw: .8 });
    paint(ribbon([neck, [tip[0] - ux * 30, tip[1] - uy * 30]], 30, 26), { wash: '#B9B4C4', ink: PAL.ink, sw: .8 });   // ferrule
    paint(ribbon([[tip[0] - ux * 32, tip[1] - uy * 32], [tip[0] + ux * 6, tip[1] + uy * 6]], 34, 6), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 90, ink: PAL.ink, sw: .8 });   // bristles
  }

  function shot(t, lt) {
    const dur = 5;
    // camera: the whip from c03 decelerates into place, rotation overshoots and settles, then a slow push
    const land = easeOut(seg(lt, 0, .55));
    camBegin(lerp(460, 960, land) + 8 * Math.sin(lt * .8), 540, kf(lt, [[0, 1], [tBow, 1.04], [dur, 1.06]]), .05 * (1 - backOut(seg(lt, 0, .7))));
    room(lt);

    const { tw, at } = chars(), x0 = W / 2 - tw / 2 - 70, x1 = W / 2 + tw / 2 + 70;
    const paintK = ease(seg(lt, tPaint0, tPaint1)), tipX = lerp(x0, x1, paintK);

    // the swoosh: a clay ribbon from the start to wherever the bristles are now
    if (lt > tPaint0) {
      boilSeed('swoosh');
      const P = []; for (let k = 0; k <= 16; k++) { const x = lerp(x0, tipX, k / 16); P.push([x, swooshY(x)]); }
      if (tipX - x0 > 20) paint(ribbon(P, 120, 230), { wash: PAL.clay, fill: PAL.clayDk, fillOp: 70, bleed: .06, tex: .8, border: .6, ink: null,
        hatch: { d: 40, a: .05, o: { rand: .5, gradient: .4 }, b: 'charcoal', c: mixCol(PAL.clay, PAL.cream, .4), w: .6 } });
    }
    // the name rides in behind the bristles, letter by letter
    at.forEach((cx, i) => { const k = clamp((tipX - cx) / 140); if (k > 0) letter(NAME[i], cx, NY, NS, PAL.cream, { font: NFONT(NS), pop: k, rot: -.03 + .02 * Math.sin(i * 2) }); });
    // the project line, under the sheet's swoosh
    if (lt > tLine) letter('TableProof  ·  Pilgrim  ·  Ultrahuman', W / 2, 640, 44, PAL.ink, { font: '700 44px "Plus Jakarta Sans"', ink: false, alpha: ease(seg(lt, tLine, tLine + .4)), pop: .6 + .4 * seg(lt, tLine, tLine + .3) });

    // Sak: skids in (side view) → turns to the sheet → paints left to right → turns to us → happy → proud bow
    const mood = emotions(lt, [[0, 'determined'], [tTurn + .1, 'determined', { lookX: .6, lookY: -.8 }], [tPaint1 + .1, 'happy'], [tBow, 'proud']]);
    let sx, pose;
    if (lt < tSkid) {   // running in from the left, then skidding: lean back, stretch → squash, dust
      const k = easeOut(seg(lt, 0, tSkid));
      sx = lerp(-260, x0 - 300, k);
      pose = { ...mood, view: 'side', walk: sx / (3 * U), rot: -.28 * seg(lt, .25, tSkid), sq: -.1 * (1 - seg(lt, .2, .4)), smear: .6 * (1 - seg(lt, 0, .25)), smearDir: 1 };
    } else {
      sx = Math.max(x0 - 300, tipX - 300);
      const walking = lt > tPaint0 && lt < tPaint1, w = (sx - (x0 - 300)) / (3 * U);
      pose = { ...mood, ...(lt < tTurn + .15 ? turn(lt, tTurn, tTurn + .15, .25, 0) : {}),
               sq: (mood.sq || 0) + .22 * spring(lt, tSkid, 9, 20) + (lt > tBow ? .16 * ease(seg(lt, tBow, tBow + .25)) * (1 - ease(seg(lt, tBow + .6, tBow + .9))) : 0),
               dy: (mood.dy || 0) * (walking ? .2 : 1) - (walking ? Math.abs(Math.sin(w * Math.PI)) * .5 : 0), walk: walking ? w : null,
               aR: lt < tPaint1 + .2 ? 1.2 : lerp(1.2, mood.aR ?? .4, ease(seg(lt, tPaint1 + .2, tPaint1 + .6))) };
    }
    sak(sx, G, U, pose);
    // the brush: carried forward on the run, then its bristles ride the swoosh; set down after the last letter
    const hand = lt < tSkid ? [sx + 3.6 * U, G - 4.4 * U] : armTipR(sx, G, U, pose);
    const tip = lt < tTurn ? [hand[0] + 210, hand[1] - 150] : lt < tPaint1 + .2 ? [lerp(hand[0] + 210, tipX, ease(seg(lt, tTurn, tPaint0))), lerp(hand[1] - 150, swooshY(tipX), ease(seg(lt, tTurn, tPaint0)))]
      : [lerp(tipX, hand[0] + 60, ease(seg(lt, tPaint1 + .2, tPaint1 + .6))), lerp(swooshY(tipX), hand[1] - 280, ease(seg(lt, tPaint1 + .2, tPaint1 + .6)))];
    bigBrush(hand, tip);
    if (lt > .3 && lt < 1.1) for (let i = 0; i < 5; i++) { boilSeed('dust' + i); const a = seg(lt, .3 + i * .06, .9 + i * .06); if (a > 0 && a < 1) paint(ellPts(x0 - 300 - 80 - 60 * a * (1 + i * .3), G - 20 - 40 * a * hash(i), 30 * (1 - a * .5), 22 * (1 - a * .5), 12, 3), { fill: PAL.cream, fillOp: 200 * (1 - a), bleed: .2, tex: .4, ink: null }); }

    // the keepsakes arc in one at a time, each landing with a sparkle
    const keep = (i, from, to, draw) => {
      const t0 = tKeep + i * .22, k = seg(lt, t0, t0 + .45); if (k <= 0) return;
      const p = arcPt(from, to, 220, easeOut(k)), s = spring(lt, t0 + .45, 8, 20);
      draw(p[0], p[1] + 10 * s, (1 - k) * 2.5 * (i % 2 ? -1 : 1));
      sparkle(to[0] + 70, to[1] - 90, 40, seg(lt, t0 + .4, t0 + .85));
    };
    keep(0, [-200, 400], [330, 790], (x, y, r) => { push(); translate(x, y); rotate(r * .3); tableCard(0, 0, 230, 170, 1, 1, 1); pop(); });
    keep(1, [W / 2, -300], [600, G], (x, y, r) => bottle(x, y, 130, 1, 1, r * .15));
    keep(2, [W + 200, 400], [1640, 800], (x, y, r) => smartRing(x, y, 62, .7 + .3 * Math.sin(lt * 4), r * .2, .45));

    const eye = toScreen(sx, G - 4 * U);
    camEnd();
    boilSeed('transition');
    // c03's whip streaks, dying away as the camera lands
    const wk = 1 - seg(lt, 0, .35);
    if (wk > 0) for (let i = 0; i < 10; i++) { boilSeed('streak' + i); const y = 80 + i * 100 + 30 * hash(i), x = W * hash(i + 4); inkLine([[x - 500 * wk, y], [x + 300 * wk, y]], 1.4 * wk, mixCol(PAL.cream, PAL.ochre, .3), 'dry', 0); }
    if (lt > tIris) {   // iris to Sak, hold, shut; letters go under it
      flushLetters();
      const r = lt < tIris + .45 ? lerp(1500, 270, ease(seg(lt, tIris, tIris + .45))) : lt < dur - .25 ? lerp(270, 250, seg(lt, tIris + .45, dur - .25)) : lerp(250, 0, easeIn(seg(lt, dur - .25, dur - .04)));
      iris(...eye, r);
    }
  }

  shots([[T0, shot]]);
})();
