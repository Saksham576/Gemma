// p4_outro.js (24–30 s): the flat line opens back into the bone sheet (the open's collapse, reversed). The signal
// re-signs the name; the three projects are recalled as small plotted marks along a baseline. Then the ink lifts, the
// name un-writes back into the pen, and the signal comes to rest where frame 0 starts: the reel loops.
(() => {
  const N = nameStrokes(), start = N.strokes[0][0];
  const CHIPS = [['TABLEPROOF', 660], ['PILGRIM', 960], ['ULTRAHUMAN', 1260]], CY = 700;
  const icon = (i, cx, cy, k, a) => {   // a small mark for each project, plotted on
    X.save(); X.translate(cx, cy); X.scale(1.4, 1.4); X.translate(-cx, -cy);
    const o = { w: 1.6, col: PAL.panel, a };
    if (i === 0) { for (let r = 0; r < 4; r++) stroke(partial([[cx - 26, cy - 18 + r * 12], [cx + 26, cy - 18 + r * 12]], k).pts, o); for (let c = 0; c < 3; c++) stroke(partial([[cx - 26 + c * 26, cy - 18], [cx - 26 + c * 26, cy + 18]], k).pts, o); }
    if (i === 1) for (const r of [8, 17, 26]) stroke(partial(circlePts(cx, cy, r, r * .7, 40), k).pts, o);
    if (i === 2) { stroke(partial(circlePts(cx, cy, 28, 11, 40), k).pts, { ...o, w: 2.2 }); stroke(partial(circlePts(cx, cy + 5, 28, 11, 40), k).pts, o); }
    X.restore();
  };

  function outro(t, lt) {
    const o = easeInOut(seg(t, 24, T.paper1)), hh = Math.max(3, H * o);
    GLOW_GAIN = lerp(1, .18, Math.sqrt(o));
    X.fillStyle = PAL.bone; X.fillRect(0, LINE_Y - hh / 2, W, hh);
    if (o < 1) stroke([[-20, LINE_Y], [W + 20, LINE_Y]], { w: 3, col: mixCol(PAL.bone, PAL.panel, o), a: 1 - o, glow: .5 * (1 - o) });
    X.save(); X.translate(0, LINE_Y); X.scale(1, Math.max(.002, o)); X.translate(0, -LINE_Y);
    sheetChrome(seg(t, 24.6, T.paper1 + .2), 260 * (1 - easeOut(seg(t, 24.4, T.paper1 + .2))));
    // the name: signed, held, then un-signed back into the pen
    const k = t < T.unsign0 ? easeInOut(seg(t, T.sign0, T.sign1)) : 1 - easeInOut(seg(t, T.unsign0, T.unsign1));
    const tip = writeStrokes(N, k, { w: 4, col: PAL.panel });
    // the projects, one per beat
    const fade = 1 - seg(t, T.unsign0, T.unsign0 + .4);
    CHIPS.forEach(([s, x], i) => {
      const t0 = T.chips[i], ck = easeOut(seg(t, t0, t0 + .35)); if (ck <= 0 || fade <= 0) return;
      icon(i, x, CY, ck, fade);
      text(s, x, CY + 74, { size: 20, col: PAL.panel, a: fade * seg(t, t0 + .1, t0 + .4), ls: 4, align: 'center', wght: 500 });
    });
    if (fade > 0 && t > T.chips[0]) { const bk = easeInOut(seg(t, T.chips[0] - .2, T.chips[2] + .2)); stroke([[540, CY + 104], [lerp(540, 1380, bk), CY + 104]], { w: 1, col: PAL.panel, a: .5 * fade }); }
    X.restore();
    // the signal: centre of the line → the name's first stroke → the pen → (held at the end) → back to rest at the start
    let p, kk = 1;
    if (t < T.sign0) p = arcPt([W / 2, LINE_Y], start, 160, easeInOut(seg(t, 24.2, T.sign0)));
    else if (tip) p = tip;
    else if (t < T.unsign0) p = N.strokes[N.strokes.length - 1].slice(-1)[0];
    else p = start;
    if (t > T.unsign1 - .3) kk = lerp(1, breathe(t), seg(t, T.unsign1 - .3, T.unsign1 + .1));
    spark(p[0], p[1], kk);
  }
  plate(24, outro);
})();
