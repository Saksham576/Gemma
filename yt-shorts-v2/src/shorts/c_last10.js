// c_last10.js: "The last 10%" (24 s, loops). The progress bar is the thread.
//   bar 1  THE PROJECT → the bar shoots to 90% → 90% / DONE.
//   bar 2  THE LAST / 10% … ETA: 5 min
//   bars 3–6  an infinite zoom into the bar's last 10%: each zoom lands on the same picture, one more 9 each time
//             (99 → 99.9 → 99.99 …): ALMOST / BASICALLY / TECHNICALLY / ANY MINUTE / ETA: 2 WEEKS / IT'S THE TESTS /
//             IT'S THE CACHE / IT'S DNS
//   bar 7  the digits overflow the screen; glitch     bar 8  (silence) SHIP / IT. → 100%
//   bar 9  100% / v1.0 … bug report #1              bar 10 WHO / BROKE / PROD?
//   bar 11 HOTFIX → the bar drains to 0% / 0%        bar 12 BACK / TO / WORK. → the empty bar → loop
(() => {
  if (SHORT !== 'c_last10') return;
  const CX = (SAFE.left + SAFE.right) / 2, S = PAL.signal, B = PAL.bone;
  const w = (b, text, y, size, o = {}) => WORDS.push({ b, text, x: o.x ?? CX, y, size, until: o.until ?? Math.floor(b / 4) * 4 + 4, ...o });
  w(0, 'THE PROJECT', 380, 150, { stretch: 'expanded' }); w(2, '90%', 780, 380, { col: S, accent: 1 }); w(3, 'DONE.', 1360, 200);
  w(4, 'THE LAST', 400, 200); w(5, '10%', 800, 380, { col: S, accent: 1 });
  const desperate = [[8, 'ALMOST'], [10, 'BASICALLY'], [12, 'TECHNICALLY'], [14, 'ANY MINUTE']];
  desperate.forEach(([b, s]) => w(b, s, 640, 190, { until: b + 2 }));
  w(16, 'ETA:', 560, 200, { until: 18 }); w(17, '2 WEEKS', 760, 260, { col: S, accent: .8, until: 18 });
  w(18, "IT'S", 560, 200, { until: 20 }); w(19, 'THE TESTS', 760, 200, { until: 20 });
  w(20, "IT'S", 560, 200, { until: 22 }); w(21, 'THE CACHE', 760, 200, { until: 22 });
  w(22, "IT'S", 560, 200, { until: 24 }); w(23, 'DNS.', 790, 380, { col: S, accent: 1, until: 24 });
  w(29, 'SHIP', 560, 380, { until: 32 }); w(30, 'IT.', 960, 440, { col: S, accent: 1.3, until: 32 });
  w(32, '100%', 640, 380, { col: S, accent: .8, until: 35 }); w(33, 'v1.0', 860, 160, { until: 35 });
  w(36, 'WHO', 520, 260); w(37, 'BROKE', 760, 260); w(38, 'PROD?', 1040, 340, { col: S, accent: 1 });
  w(40, 'HOTFIX', 560, 240, { until: 43 }); w(43, '0%', 760, 420, { col: S, accent: .9, until: 44 });
  w(44, 'BACK', 520, 260, { until: 47.5 }); w(45, 'TO', 740, 220, { until: 47.5 }); w(46, 'WORK.', 980, 300, { col: S, accent: .8, until: 47.5 });

  const BAR = { x: SAFE.left, y: 1080, w: SAFE.right - SAFE.left, h: 70 };
  // the zoom: from beat 8 to 24, every 2 beats the camera dives ×10 into the bar's last 10% (1 beat), then holds
  const zoomState = b => { if (b < 8 || b >= 24) return { L: 0, e: 0 }; const L = Math.floor((b - 8) / 2), f = (b - 8) / 2 - L; return { L: L + 1, e: easeInOut(clamp(f * 2)) }; };
  // u (0..1 along the bar) → screen x, for zoom e within the current layer: the point u = .9 slides to the left edge
  const ux = (u, e) => { const s = Math.pow(10, e); return BAR.x + BAR.w * s * (u - .9) + BAR.w * .9 * (1 - e) + BAR.w * .9 * e * 0; };
  function progress(t, b) {
    const { L, e } = zoomState(b);
    // the fill level outside the zoom: 0 → 90% (bar 1), 100% after SHIP IT, draining to 0 in bar 11
    const base = b < 1 ? 0 : b < 29 ? .9 * easeOut(seg(b, 1, 1.4)) : b < 30 ? .9 + .1 * easeOut(seg(b, 29.8, 30)) : b < 41 ? 1 : 1 - easeInOut(seg(b, 41, 43));
    const shake = b >= 24 && b < 28 ? (hash(Math.floor(t * 30)) - .5) * 30 : 0;
    const y = BAR.y + shake;
    const box = [[BAR.x, y], [BAR.x + BAR.w, y], [BAR.x + BAR.w, y + BAR.h], [BAR.x, y + BAR.h]];
    stroke(box, { w: 3, col: B, close: true });
    const clip = (x0, x1) => [Math.max(BAR.x + 6, x0), Math.min(BAR.x + BAR.w - 6, x1)];
    if (b < 8 || b >= 24) {
      const [x0, x1] = clip(BAR.x + 6, BAR.x + 6 + (BAR.w - 12) * base);
      if (x1 > x0) fillPoly([[x0, y + 6], [x1, y + 6], [x1, y + BAR.h - 6], [x0, y + BAR.h - 6]], base >= 1 ? S : B, 1, base >= 1 ? .7 : 0);
    } else {
      // three nested levels: the main fill, the last-10% sub-fill, and the one inside that; each gains weight as we dive
      for (let j = 0; j < 3; j++) {
        const u0 = j === 0 ? 0 : 1 - Math.pow(.1, j), u1 = 1 - Math.pow(.1, j + 1);
        const weight = j === 0 ? 1 : j === 1 ? lerp(.35, 1, e) : lerp(.12, .35, e), hh = (BAR.h - 12) * (j === 0 ? 1 : j === 1 ? lerp(.4, 1, e) : lerp(.18, .4, e));
        const [x0, x1] = clip(ux(u0, e), ux(u1, e)); if (x1 <= x0) continue;
        fillPoly([[x0, y + BAR.h / 2 - hh / 2], [x1, y + BAR.h / 2 - hh / 2], [x1, y + BAR.h / 2 + hh / 2], [x0, y + BAR.h / 2 + hh / 2]], B, weight);
      }
      spark(Math.min(BAR.x + BAR.w - 8, ux(1 - Math.pow(.1, 2), e)), y + BAR.h / 2, 1.2);
    }
    // the percentage: one more 9 per zoom
    const pct = b < 8 ? base * 100 : b < 24 ? 100 - Math.pow(10, 1 - (L - 1) - e) : base * 100;
    const digits = b < 8 ? 0 : Math.min(9, L + 1);
    const label = b >= 24 && b < 28 ? '99.' + '9'.repeat(4 + Math.floor((b - 24) * 6)) + '%' : `${pct.toFixed(digits)}%`;
    text(label, b >= 24 && b < 28 ? SAFE.left : BAR.x + BAR.w, y - 30, { size: b >= 24 && b < 28 ? 44 : 54, col: base >= 1 && b >= 29 ? S : B, align: b >= 24 && b < 28 ? 'left' : 'right', wght: 500 });
    if (b >= 6 && b < 8) typeOn('ETA: 5 min', SAFE.left, y + BAR.h + 80, seg(b, 6, 6.8), { size: 40 });
    if (b >= 34 && b < 36) typeOn('bug report #1', SAFE.left, y + BAR.h + 80, seg(b, 34, 34.8), { size: 40 });
  }
  // bar 7: the nines overflow: rows of 9s scroll up and fill the screen
  function overflow(t, b) {
    if (b < 24 || b >= 28.5) return;
    const k = seg(b, 24, 28), out = seg(b, 28, 28.5), rows = Math.floor(k * 22);
    for (let i = 0; i < rows; i++) text('9'.repeat(30), SAFE.left - 20, 1500 - i * 58 - 200 * k, { size: 52, col: i % 4 ? PAL.graphite : S, a: (1 - out) * (i % 4 ? 1 : .8), wght: 500, glow: i % 4 ? 0 : .3 });
  }

  drawWorld = t => {
    const b = t / BEAT, hits = WORDS.filter(x => x.accent).map(x => beatT(x.b));
    const [sx, sy] = shakeAt(t, hits);
    cam2D(W / 2 - sx, H / 2 - sy, camZoom(t));
    hud(t, 'BUILD #4,096 — PROGRESS');
    overflow(t, b);
    progress(t, b);
    drawWords(t);
    camReset();
    beatStrobe(t, [[beatT(28), beatT(29.5)]]);
    // each zoom lands with a white flicker; SHIP IT with a full flash
    const { e } = zoomState(b); if (b >= 8 && b < 24) flashK(.18 * Math.max(0, 1 - Math.abs(e - .5) * 3), B);
    flashK(Math.exp(-(t - beatT(30)) * 8) * (t > beatT(30)), PAL.bone);
    glitch(Math.max(b >= 24 && b < 28 ? .6 * (1 - frac(b)) : 0, ...[23, 38].map(h => t > beatT(h) ? Math.exp(-(t - beatT(h)) * 10) : 0)), Math.floor(t * 30));
  };

  // ---- sound ----
  wordCues();
  cue(beatT(1), 'rise', { dur: .35, gain: 1.2 }); cue(beatT(1.4), 'ding', { note: 'E6' });
  for (let L = 0; L < 8; L++) { cue(beatT(8 + L * 2) - .05, 'rise', { dur: BEAT, gain: .7 }); cue(beatT(8 + L * 2 + 1), 'tick', { gain: 1.2 }); }
  cue(beatT(6), 'type', { n: 10, gap: .05 }); cue(beatT(34), 'type', { n: 13, gap: .04 });
  for (let i = 0; i < 16; i++) cue(beatT(24) + i * BEAT / 4, 'tick', { gain: .6 + i * .03 });
  cue(beatT(24), 'glitch'); cue(beatT(26), 'glitch'); cue(beatT(38), 'glitch');
  cue(beatT(30), 'boom', { gain: 1.2 }); for (let i = 0; i < 4; i++) cue(beatT(30) + .08 + i * .09, 'ding', { note: ['E6', 'G#6', 'B6', 'E7'][i], gain: .6 });
  cue(beatT(36), 'error', { gain: .8 }); cue(beatT(37), 'error', { gain: .8 });
  cue(beatT(41), 'rise', { dur: BEAT * 2, gain: .6 });
  SONG.bass = ['D1', 'D1', 'A#1', 'C2']; SONG.stabs = [['D3', 'F3', 'A3'], ['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['C3', 'E3', 'G3']];
  SONG.silent = [[beatT(28), beatT(29.5)]];                    // the held breath before SHIP IT
  SONG.riser = [beatT(26), beatT(28)];
})();
