// p1_tableproof.js (4–10 s): the line from the open rises and becomes a scanline. It sweeps a scanned, crooked table;
// each row snaps clean as it passes and its values type in with a confidence. One cell reads "5.O2M" (an O for a 0),
// flags at 0.61; the signal clicks it, it corrects to 5.02M at 0.98. Then the table's rules stretch past the page and
// wave into contour lines, and the plane tilts back into terraced rice fields (see field.js): Pilgrim.
(() => {
  const COLS = [TABLE.x, TABLE.x + 200, TABLE.x + 410, TABLE.x + 600, TABLE.x + TABLE.w];
  const HEAD = ['QUARTER', 'REVENUE', 'MARGIN', 'CONF'];
  const ROWS = [["Q1 '24", '4.12M', '31.4%', '0.97'], ["Q2 '24", '4.38M', '32.0%', '0.95'], ["Q3 '24", '4.05M', '29.8%', '0.98'], ["Q4 '24", '4.61M', '33.1%', '0.96'],
                ["Q1 '25", '4.90M', '34.6%', '0.94'], ["Q2 '25", '5.O2M', '35.2%', '0.61'], ["Q3 '25", '4.87M', '33.9%', '0.97'], ["Q4 '25", '5.31M', '36.0%', '0.99']];
  const FLAG_R = 6;                                     // table row (header is row 0) of the flagged value
  const PAGE = { x: TABLE.x - 50, y: TABLE.y - 90, w: TABLE.w + 100, h: TABLE.rows * TABLE.rowH + 170 };
  const yTop = TABLE.y, yBot = TABLE.y + TABLE.rows * TABLE.rowH;
  const scanY = t => lerp(yTop, yBot, easeInOut(seg(t, T.scan0, T.scan1)));
  const snap = (t, y) => backOut(seg(scanY(t), y, y + 46));   // a row or rule snaps clean once the scanline is past it
  // the crooked "scanned" version of a point: a slight skew of the whole page plus per-line wobble
  const messy = (x, y, key) => [x + (y - 540) * .045 + 6 * Math.sin(key * 3.1 + x * .01), y + (x - 700) * .03 + 9 * (hash(key) - .5) + 4 * Math.sin(x * .02 + key)];

  function cellText(t, r, c, x, y) {
    const k = snap(t, TABLE.y + r * TABLE.rowH), fade = 1 - seg(t, T.morph0 + c * .08, T.morph0 + .5 + c * .08);
    if (fade <= 0) return;
    if (k < .98) {   // the scanned smudge: a grey bar, crooked
      const [mx, my] = messy(x + 10, y - 8, r * 7 + c), len = (r ? 70 : 90) + 40 * hash(r * 5 + c);
      stroke([[mx, my], [mx + len, my + 3 * (hash(c + r) - .5)]], { w: 9, col: PAL.boneDim, a: .35 * (1 - k) * fade * seg(t, 4.4, 5.0) });
    }
    if (k <= 0) return;
    let s = r ? ROWS[r - 1][c] : HEAD[c], col = PAL.bone, a = k * fade;
    if (r === FLAG_R && t > T.flag) {
      const fx = seg(t, T.click, T.fixed1);
      if (c === 1) { s = fx > .5 ? '5.02M' : '5.O2M'; col = mixCol(PAL.signal, PAL.bone, fx); }
      if (c === 3) { s = (0.61 + (0.98 - 0.61) * easeOut(fx)).toFixed(2); col = mixCol(PAL.signal, PAL.bone, fx); }
    }
    text(s, x + 14, y + 8, { size: r ? 24 : 15, col: r ? col : PAL.boneDim, a, ls: r ? 0 : 2, wght: r ? 400 : 500, glow: col === PAL.bone ? 0 : .7 * a });
  }

  function tableproof(t, lt) {
    const fadeOut = 1 - seg(t, T.morph0, T.morph0 + .6);
    // ---- the line arrives: full width at LINE_Y → the top of the table, page width ----
    const arrive = easeInOut(seg(t, 4.0, 4.6));
    const ext = easeInOut(seg(t, T.morph0 + .2, T.morph0 + 1.2));        // rules stretching past the page (seam)
    const wave = easeInOut(seg(t, T.wave0, T.wave0 + 1.0)), tilt = easeInOut(seg(t, T.tilt0, T.tilt1));

    // ---- page outline, drawn out from the top corners ----
    const pk = easeInOut(seg(t, 4.35, T.page1)) * fadeOut;
    if (pk > 0) {
      const { x, y, w, h } = PAGE;
      stroke(partial([[x + w / 2, y], [x, y], [x, y + h], [x + w / 2, y + h]], pk).pts, { w: 1.2, col: PAL.boneDim, a: .7 * fadeOut });
      stroke(partial([[x + w / 2, y], [x + w, y], [x + w, y + h], [x + w / 2, y + h]], pk).pts, { w: 1.2, col: PAL.boneDim, a: .7 * fadeOut });
      text('p.2 / 3', x + w - 12, y + 30, { size: 14, col: PAL.boneDim, a: .7 * pk, align: 'right', ls: 2 });
    }

    // ---- field lines: the table's rules (j = 3r), then the lines between and around them (seam) ----
    const tableIn = seg(t, 4.4, 5.0);
    for (let j = -12; j <= 42; j++) {
      const rule = j % 3 === 0 && j >= 0 && j <= 27, r = j / 3;
      let a = rule ? .85 * tableIn : .45 * seg(t, T.morph0 + .4 + Math.abs(j - 13) * .02, T.morph0 + 1.2 + Math.abs(j - 13) * .02);
      if (a <= 0) continue;
      const x0 = lerp(TABLE.x, -260, ext), x1 = lerp(TABLE.x + TABLE.w, W + 260, ext);
      let P = fieldLine(j, { wave, x0, x1, tilt });
      if (rule && t < T.morph0 + 1) {   // still on the page: crooked until the scanline straightens it
        const k = clamp(snap(t, fieldY(j)));
        P = P.map((p, i) => { const m = messy(p[0], p[1], j); return [lerp(m[0], p[0], k), lerp(m[1], p[1], k)]; });
      }
      // depth cue once the plane tilts: far lines fade
      stroke(P, { w: rule ? 1.4 : 1.1, col: PAL.bone, a: a * (1 - .5 * tilt * clamp((POOL[1] - fieldY(j)) / 600)) });
    }
    // vertical column rules, row by row, snapping with their rows; gone before the plane tilts
    if (fadeOut > 0) for (const [ci, x] of COLS.entries()) for (let r = 0; r < TABLE.rows; r++) {
      const y0 = TABLE.y + r * TABLE.rowH, k = clamp(snap(t, y0)), A = messy(x, y0, ci * 13 + r), B = messy(x, y0 + TABLE.rowH, ci * 13 + r + 1);
      stroke([[lerp(A[0], x, k), lerp(A[1], y0, k)], [lerp(B[0], x, k), lerp(B[1], y0 + TABLE.rowH, k)]], { w: ci === 0 || ci === 4 ? 1.4 : 1, col: PAL.bone, a: (ci === 0 || ci === 4 ? .85 : .4) * tableIn * fadeOut });
    }
    for (let r = 0; r < TABLE.rows; r++) for (let c = 0; c < 4; c++) cellText(t, r, c, COLS[c], TABLE.y + r * TABLE.rowH + TABLE.rowH / 2);

    // ---- the flag and the fix ----
    const fy = TABLE.y + FLAG_R * TABLE.rowH, fcx = (COLS[1] + COLS[2]) / 2, fcy = fy + TABLE.rowH / 2;
    if (t > T.flag && fadeOut > 0) {
      const on = seg(t, T.flag, T.flag + .15) * (1 - seg(t, T.fixed1, T.fixed1 + .3)), blink = .75 + .25 * Math.cos((t - T.flag) * TAU * 2);
      stroke([[COLS[1] + 4, fy + 4], [COLS[2] - 4, fy + 4], [COLS[2] - 4, fy + TABLE.rowH - 4], [COLS[1] + 4, fy + TABLE.rowH - 4]], { w: 2, col: PAL.signal, a: on * blink, glow: .8 * on, close: true });
      const wx = COLS[3] + 108, wy = fcy;   // a warning triangle beside the confidence
      stroke([[wx, wy - 12], [wx + 12, wy + 9], [wx - 12, wy + 9]], { w: 1.8, col: PAL.signal, a: on, close: true, glow: .6 * on });
      stroke([[wx, wy - 4], [wx, wy + 2]], { w: 1.8, col: PAL.signal, a: on });
      // the click: a ring expanding from the cell
      if (t > T.click) { const a = t - T.click; stroke(circlePts(fcx, fcy, 20 + 160 * easeOut(a / .6), undefined, 48), { w: 2, col: PAL.signal, a: (1 - seg(a, 0, .6)) * fadeOut, glow: .7 }); }
      // the tick, once corrected
      const tk = easeOut(seg(t, T.click + .2, T.fixed1));
      if (tk > 0) stroke(partial([[wx - 11, wy], [wx - 3, wy + 8], [wx + 13, wy - 10]], tk).pts, { w: 2.4, col: PAL.bone, a: fadeOut });
    }

    // ---- the side panel: title, spec lines, live counters, the JSON the fix produces ----
    const pr = easeOut(seg(t, 4.6, 5.2)) * fadeOut, LX = 1210;
    if (pr > 0) {
      X.save(); X.beginPath(); X.rect(LX - 10, 220, 900 * pr, 140); X.clip();
      text('TABLEPROOF', LX, 320, { fam: 'disp', size: 72, wght: 800, stretch: 'expanded', col: PAL.bone, a: pr });
      X.restore();
      const lines = ['PDF TABLE AUDITOR', 'GEMMA 4 · PAGE IMAGE → STRICT JSON', 'PER-CELL CONFIDENCE · PAGE CITATIONS'];
      lines.forEach((s, i) => text(s, LX, 380 + i * 32, { size: 18, col: PAL.boneDim, a: pr * seg(t, 4.9 + i * .1, 5.2 + i * .1), ls: 2 }));
      const flags = t < T.flag ? '00' : t < T.fixed1 ? '01' : '00', rows = String(Math.min(8, Math.floor(clamp((scanY(t) - yTop - TABLE.rowH) / TABLE.rowH) * 9))).padStart(2, '0');
      [['ROWS', rows], ['CELLS', String(Math.round(+rows * 4)).padStart(2, '0')], ['FLAGS', flags]].forEach(([k, v], i) => {
        text(k, LX, 560 + i * 40, { size: 18, col: PAL.boneDim, a: pr, ls: 3 });
        text(v, LX + 160, 560 + i * 40, { size: 22, col: k === 'FLAGS' && flags === '01' ? PAL.signal : PAL.bone, a: pr, glow: k === 'FLAGS' && flags === '01' ? .6 : 0 });
      });
      const jk = seg(t, T.fixed1, T.fixed1 + .25);
      if (jk > 0) text(`{ "Q2 '25": { "revenue": "5.02M", "conf": 0.98 } }`, LX, 720, { size: 17, col: PAL.ember, a: jk * pr, glow: .4 * jk });
    }

    // ---- the line, then the scanline ----
    if (t < T.scan1 + .3) {
      const y = t < T.scan0 ? lerp(LINE_Y, yTop, arrive) : scanY(t), x0 = lerp(-20, TABLE.x - 30, arrive), x1 = lerp(W + 20, TABLE.x + TABLE.w + 30, arrive);
      const a = 1 - seg(t, T.scan1, T.scan1 + .3);
      stroke([[x0, y], [x1, y]], { w: lerp(3, 2, arrive), col: mixCol(PAL.bone, PAL.signal, arrive), a, glow: .8 * a });
      if (t > T.scan0) X.fillStyle = rgba(PAL.signal, .05 * a), X.fillRect(x0, y - 40, x1 - x0, 40);   // the lit band trailing the scan
    }

    // ---- the signal: line centre → right end of the scanline → the flagged cell → riding the cell into the field ----
    let p;
    if (t < T.scan0) p = [lerp(W / 2, TABLE.x + TABLE.w + 30, arrive), lerp(LINE_Y, yTop, arrive)];
    else if (t < T.flag) p = [TABLE.x + TABLE.w + 30, scanY(t)];
    else if (t < T.click) p = arcPt([TABLE.x + TABLE.w + 30, yBot], [fcx, fcy], 180, easeInOut(seg(t, T.flag, T.click)));
    else p = flagCellPos(wave, tilt);
    spark(p[0], p[1], 1 + .5 * pulse(t, T.click, 6));
  }
  plate(4, tableproof);
})();

// where the flagged cell sits as the plane waves and tilts (the signal rides it into Pilgrim)
function flagCellPos(wave, tilt) {
  const x = TABLE.x + 305, j = 3 * 6 + 1.5;
  return fieldMap(x, fieldY(j) + wave * contour(j, x), tilt);
}
const arcPt = (p0, p1, h, k) => [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k) - h * 4 * k * (1 - k)];
