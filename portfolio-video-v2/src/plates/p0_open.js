// p0_open.js (0–4 s): bone sheet with crop marks. The signal writes "Saksham", draws an underline under it, and then
// the whole sheet collapses vertically into that underline (a CRT switch-off), leaving one bright line on ink: the
// scanline that opens TableProof. Frame 0 is identical to the reel's last frame, so it loops.
(() => {
  const N = nameStrokes(), start = N.strokes[0][0];
  const UL = [[NAME.x - 60, LINE_Y], [NAME.x + N.width + 60, LINE_Y]];

  function open(t, lt) {
    // the collapse: everything on the sheet squashes toward LINE_Y; the sheet itself becomes the line
    const c = easeInOut(seg(t, T.flourish1, T.collapse1)), sy = lerp(1, 0, c), hh = Math.max(3, H * sy);
    GLOW_GAIN = lerp(.18, 1, c * c);
    X.fillStyle = PAL.bone; X.fillRect(0, LINE_Y - hh / 2, W, hh);
    X.save(); X.translate(0, LINE_Y); X.scale(1, Math.max(.002, sy)); X.translate(0, -LINE_Y);
    sheetChrome(1 - seg(t, T.flourish1, T.flourish1 + .35), 260 * easeIn(seg(t, T.flourish1, T.collapse1)));
    const k = seg(t, T.write0, T.write1);
    const tip = writeStrokes(N, easeInOut(k), { w: 4, col: PAL.panel });
    // the underline, drawn left to right by the signal
    const u = easeInOut(seg(t, T.flourish0, T.flourish1));
    if (u > 0) stroke([UL[0], [lerp(UL[0][0], UL[1][0], u), LINE_Y]], { w: 2.4, col: PAL.signal, glow: .6 });
    X.restore();
    // as the sheet collapses, the underline stretches to the frame edges and the sheet's last light is the line
    if (c > 0) stroke([[lerp(UL[0][0], -20, c), LINE_Y], [lerp(UL[1][0], W + 20, c), LINE_Y]], { w: lerp(2.4, 3, c), col: mixCol(PAL.signal, PAL.bone, c), glow: .8 * c });
    // the signal: at rest on the first stroke → the pen tip → along the underline → toward the centre as it collapses
    let p;
    if (t < T.write0) p = start;
    else if (tip) p = tip;
    else if (t < T.flourish0) p = N.strokes[N.strokes.length - 1].slice(-1)[0];
    else if (t < T.flourish1) p = [lerp(UL[0][0], UL[1][0], u), LINE_Y];
    else p = [lerp(UL[1][0], W / 2, easeInOut(c)), LINE_Y];
    if (t > T.write1 && t < T.flourish0) { const a = seg(t, T.write1, T.flourish0), e = N.strokes[N.strokes.length - 1].slice(-1)[0]; p = [lerp(e[0], UL[0][0], ease(a)), lerp(e[1], LINE_Y, ease(a)) - 40 * Math.sin(a * Math.PI)]; }
    spark(p[0], p[1], t < T.write0 ? breathe(t) : 1);
  }
  plate(0, open);
})();
