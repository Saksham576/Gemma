// a_3am.js: "Your code at 3 AM" (24 s = 12 bars at 120 bpm, loops). One word per beat; the clock is the thread.
//   bar 1  IT'S / 3 AM                         bar 7  …you touched it: glitch, ERROR flood
//   bar 2  ONE / MORE / FIX. // TODO: sleep     bar 8  CTRL+Z ×3, the clock spins backwards
//   bar 3  $ npm install → the dependency tree  bar 9  IT'S / 5 AM / THE BIRDS / ARE UP.
//   bar 4  847 / PACKAGES / FOR A / BUTTON.     bar 10 STANDUP / IN / 3 HOURS
//   bar 5  compiling… IT / WORKS ✓              bar 11 BASICALLY / DONE. (then a silent 5-minute nap)
//   bar 6  DON'T. / TOUCH. / IT.                bar 12 the alarm; the clock rewinds to 3:00; AGAIN. → loop
(() => {
  if (SHORT !== 'a_3am') return;
  const CX = (SAFE.left + SAFE.right) / 2, S = PAL.signal, B = PAL.bone;
  const w = (b, text, y, size, o = {}) => WORDS.push({ b, text, x: o.x ?? CX, y, size, until: o.until ?? Math.floor(b / 4) * 4 + 4, ...o });
  // bar 1
  w(0, "IT'S", 560, 190); w(1, '3 AM', 840, 400, { col: S, accent: .9 });
  // bar 2
  w(4, 'ONE', 520, 240); w(5, 'MORE', 760, 240); w(6, 'FIX.', 1040, 320, { col: S, accent: .7, tilt: -.04 });
  // bar 4 (bar 3 is the tree)
  w(12, '847', 600, 420, { col: S, accent: 1 }); w(13, 'PACKAGES', 820, 170); w(14, 'FOR A', 980, 130, { stretch: 'expanded' }); w(15, 'BUTTON.', 1150, 220, { col: S, accent: .8 });
  // bar 5
  w(17, 'IT', 560, 300); w(18, 'WORKS', 840, 300, { col: S, accent: .8 });
  // bar 6: one word at a time, each alone on screen
  w(20, "DON'T.", 760, 340, { until: 21 }); w(21, 'TOUCH.', 760, 340, { until: 22 }); w(22, 'IT.', 760, 520, { col: S, accent: 1, until: 23 });
  // bar 7
  w(25, 'ERROR', 820, 330, { col: S, accent: 1, tilt: .05, until: 28 });
  // bar 8
  w(28, 'CTRL+Z', 500, 230, { until: 32 }); w(29, 'CTRL+Z', 760, 230, { until: 32, tilt: .05 }); w(30, 'CTRL+Z', 1020, 230, { col: S, accent: .7, until: 32, tilt: -.05 });
  // bar 9
  w(32, "IT'S", 520, 190); w(33, '5 AM', 780, 380, { col: S, accent: .9 }); w(34, 'THE BIRDS', 1000, 150); w(35, 'ARE UP.', 1150, 150, { stretch: 'expanded' });
  // bar 10
  w(36, 'STANDUP', 560, 230); w(37, 'IN', 760, 200); w(38, '3 HOURS', 980, 260, { col: S, accent: .8 });
  // bar 11
  w(40, 'BASICALLY', 640, 200, { until: 42 }); w(41, 'DONE.', 880, 320, { col: S, accent: .9, until: 42 });
  // bar 12
  w(45, 'AGAIN.', 760, 380, { col: S, accent: 1, until: 47.5 });

  // ---- the clock: always there, small; its hands carry the story (3:00 → 5:30, rewound to 3:00 by the loop) ----
  const CLK = [CX, 1290], R = 150;
  const minutes = t => {   // minutes past 3:00
    const b = t / BEAT;
    if (b < 28) return kf(b, [[0, 0], [24, 50]], x => x);
    if (b < 32) return kf(b, [[28, 50], [31.5, 10]], easeInOut);                  // CTRL+Z: spins back
    if (b < 44) return kf(b, [[31.5, 10], [33, 120], [42, 150], [43.5, 175]], easeInOut);   // …and jumps to 5 AM anyway
    return kf(b, [[44, 175], [44.5, 175], [47, 0]], easeInOut);                    // the rewind to 3:00
  };
  function clock(t, big) {
    const m = minutes(t), hA = ((3 + m / 60) / 12) * TAU - Math.PI / 2, mA = (m / 60) * TAU - Math.PI / 2, [cx, cy] = CLK, r = R * big;
    stroke(circlePts(cx, cy, r, r, 64), { w: 3, col: B, a: .9 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; stroke([[cx + Math.cos(a) * r * .86, cy + Math.sin(a) * r * .86], [cx + Math.cos(a) * r * .97, cy + Math.sin(a) * r * .97]], { w: i % 3 ? 2 : 4, col: B, a: .7 }); }
    stroke([[cx, cy], [cx + Math.cos(hA) * r * .5, cy + Math.sin(hA) * r * .5]], { w: 8, col: B });
    const tip = [cx + Math.cos(mA) * r * .82, cy + Math.sin(mA) * r * .82];
    stroke([[cx, cy], tip], { w: 4, col: S, glow: .6 });
    spark(...tip, 1 + .5 * pulse(t, Math.floor(t / BEAT) * BEAT, 8), 7);
    text(`${String(3 + Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')} AM`, cx, cy + r + 70, { size: 34, col: B, align: 'center', wght: 500, ls: 4 });
  }

  // ---- bar 3: npm install → the dependency tree, doubling every eighth note until it fills the frame ----
  function tree(t) {
    const t0 = beatT(9), k = (t - t0) / (BEAT / 2);   // levels grown so far
    if (t < t0 || t > beatT(12)) return;
    const fade = 1 - seg(t, beatT(11.6), beatT(12));
    const root = [CX, 520], node = (lv, i) => { const n = 2 ** lv, span = Math.min(SAFE.right - SAFE.left, 120 * n); return [CX - span / 2 + (i + .5) * span / n + 10 * Math.sin(lv * 3 + i), root[1] + lv * 110]; };
    for (let lv = 1; lv <= 7; lv++) {
      const g = clamp(k - (lv - 1)); if (g <= 0) break;
      for (let i = 0; i < 2 ** lv; i++) {
        const p = node(lv - 1, i >> 1), q = node(lv, i), e = easeOut(g);
        stroke([p, [lerp(p[0], q[0], e), lerp(p[1], q[1], e)]], { w: Math.max(1, 3 - lv * .3), col: lv > 4 ? S : B, a: .85 * fade, glow: lv > 4 ? .4 * fade : 0 });
        if (g >= 1) dot(q[0], q[1], Math.max(2, 7 - lv), lv > 4 ? S : B, fade, lv > 4 ? .5 : 0);
      }
    }
    dot(...root, 9, S, fade, .8);
    text(`PACKAGES ${roll(t, t0, beatT(12), 0, 847)}`, CX, 1460, { fam: 'disp', size: 64, wght: 800, col: S, align: 'center', glow: .6 * fade, a: fade });
  }
  // ---- bar 7: …you touched it. Glitch, then ERROR lines flood up the screen, one per eighth note ----
  const ERRS = ['TypeError: undefined is not a function', 'Cannot read properties of null', 'ERR! peer dep conflict', 'Segmentation fault (core dumped)', 'Uncaught (in promise)', 'Maximum call stack size exceeded', 'ENOENT: no such file', 'error: expected ";"'];
  function flood(t) {
    const t0 = beatT(24), t1 = beatT(28.5); if (t < t0 || t > t1) return;
    const n = Math.floor((t - t0) / (BEAT / 2)) + 1, out = seg(t, beatT(28), t1);
    for (let i = 0; i < n; i++) {
      const y = 1520 - (n - i) * 70, k = clamp((t - t0 - i * BEAT / 2) / .08);
      if (y < SAFE.top - 40) continue;
      text(`✕ ${ERRS[i % ERRS.length]}`, SAFE.left - 10 + (1 - k) * 60, y, { size: 36, col: i % 3 ? S : B, a: k * (1 - out), wght: 500, glow: i % 3 ? .4 : 0, maxW: 0 });
    }
  }

  drawWorld = t => {
    const b = t / BEAT, hits = WORDS.filter(x => x.accent).map(x => beatT(x.b));
    const [sx, sy] = shakeAt(t, hits);
    // flash-cut: the frame inverts for two frames on the biggest accents
    const inv = [12, 22, 25, 45].some(h => t >= beatT(h) && t < beatT(h) + 2 / 30);
    cam2D(W / 2 - sx, H / 2 - sy, camZoom(t));
    hud(t, 'DEV LOG — NIGHT 412');
    const big = b < 4 || b >= 46 ? 1.25 : b >= 28 && b < 32 ? 1.15 : 1;
    if (!(b >= 9 && b < 12) && !(b >= 24 && b < 28)) clock(t, big);   // out of the way of the tree and the error flood
    tree(t); flood(t);
    if (b >= 7 && b < 8) typeOn('// TODO: sleep', SAFE.left, 1480, seg(b, 7, 7.8), { size: 40 });
    if (b >= 8 && b < 9.2) typeOn('$ npm install', SAFE.left, 460, seg(b, 8, 8.9), { size: 48 });
    if (b >= 16 && b < 17.5) typeOn('compiling…', SAFE.left, 460, seg(b, 16, 16.8), { size: 48 });
    if (b >= 19 && b < 20) { const k = easeOut(seg(b, 19, 19.5)); stroke(partial([[CX - 120, 1080], [CX - 30, 1170], [CX + 150, 960]], k).pts, { w: 22, col: S, glow: .9 }); }
    if (b >= 23 && b < 24) typeOn('> just one tiny refactor…', SAFE.left, 760, seg(b, 23, 23.8), { size: 40 });
    if (b >= 39 && b < 40) typeOn("status: 'basically done'", SAFE.left, 1480, seg(b, 39, 39.8), { size: 38 });
    if (b >= 42 && b < 44) { typeOn('5 min nap', SAFE.left, 760, seg(b, 42, 42.6), { size: 54, caret: false }); text('z z z', CX + 180, 640 - 40 * seg(b, 42, 44), { size: 60, col: PAL.boneDim, a: seg(b, 42.4, 43) }); }
    drawWords(t);
    camReset();
    beatStrobe(t, [[beatT(42), beatT(44)]]);
    if (b >= 42 && b < 44) { X.save(); X.globalAlpha = .55 * seg(b, 42, 42.5) * (1 - seg(b, 43.8, 44)); X.fillStyle = PAL.ink; X.fillRect(0, 0, W, H); X.restore(); }   // lights out
    if (b >= 44 && b < 45) text('⏰', CX, 820, { size: 260, col: S, align: 'center', a: 1 - seg(b, 44.8, 45) });
    glitch(Math.max(Math.exp(-(t - beatT(24)) * 6) * (t > beatT(24)), ...[25, 26, 27, 44].map(h => t > beatT(h) ? Math.exp(-(t - beatT(h)) * 10) : 0)), Math.floor(t * 30));
    if (inv) { X.save(); X.globalCompositeOperation = 'difference'; X.fillStyle = PAL.bone; X.fillRect(0, 0, W, H); X.restore(); }
  };

  // ---- sound ----
  wordCues();
  for (let b = 0; b < 48; b++) if (!(b >= 9 && b < 12) && !(b >= 42 && b < 44)) cue(beatT(b) + BEAT / 2, 'tick', { gain: 1.6 });
  cue(beatT(7), 'type', { n: 10, gap: .04 }); cue(beatT(8), 'type', { n: 9, gap: .05 }); cue(beatT(16), 'type', { n: 7 }); cue(beatT(23), 'type', { n: 14, gap: .03 }); cue(beatT(39), 'type', { n: 12, gap: .035 });
  for (let i = 0; i < 6; i++) cue(beatT(9) + i * BEAT / 2, 'pop', { gain: .5 + i * .1, pan: (i % 2 ? .3 : -.3) });
  cue(beatT(19), 'ding', { note: 'E6' }); cue(beatT(19) + .08, 'ding', { note: 'B6' });
  cue(beatT(24), 'boom'); cue(beatT(24), 'glitch');
  for (let i = 0; i < 9; i++) cue(beatT(24) + i * BEAT / 2, 'error', { gain: .6, pan: (hash(i) - .5) });
  for (const h of [25, 26, 27]) cue(beatT(h), 'glitch', { gain: .7 });
  cue(beatT(31), 'rise', { dur: BEAT }); cue(beatT(44), 'glitch'); for (let i = 0; i < 6; i++) cue(beatT(44) + i * .09, 'ding', { note: 'C7', gain: .5 });
  cue(beatT(46), 'rise', { dur: BEAT * 1.5 });
  SONG.bass = ['A1', 'A1', 'F1', 'G1']; SONG.stabs = [['A3', 'C4', 'E4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']];
  SONG.silent = [[beatT(42), beatT(44)]];                      // the nap: the beat stops
  SONG.riser = [beatT(22), beatT(24)];                         // into …you touched it
})();
