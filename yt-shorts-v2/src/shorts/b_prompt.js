// b_prompt.js: "How an AI reads your prompt" (24 s, loops). The prompt box is the thread.
//   bar 1  YOU TYPE: "make it pop" ⏎          bar 7  the screen literally POPs; MADE IT / POP.
//   bar 2  THE AI / SEES: → three token chips  bar 8  YOU: "make it pop" / BUT
//   bar 3  IT DOESN'T / READ. / IT / GUESSES.   bar 9  LESS / POP. → the bars re-race: fizz wins
//   bar 4  next-token odds race; the spark picks bar 10 "Sure! I've made it fizz." → bubbles
//   bar 5  "Sure! I've made it pop." word by word bar 11 PROMPT / ENGINEERING / IS / VIBES.
//   bar 6  WAIT. / WHAT / POP?  (silent bar)    bar 12 bubbles pop → the empty prompt box → loop
(() => {
  if (SHORT !== 'b_prompt') return;
  const CX = (SAFE.left + SAFE.right) / 2, S = PAL.signal, B = PAL.bone;
  const w = (b, text, y, size, o = {}) => WORDS.push({ b, text, x: o.x ?? CX, y, size, until: o.until ?? Math.floor(b / 4) * 4 + 4, ...o });
  w(0, 'YOU TYPE:', 420, 130, { stretch: 'expanded' });
  w(4, 'THE AI', 420, 200); w(5, 'SEES:', 610, 200, { col: S, accent: .6 });
  w(8, "IT DOESN'T", 560, 170); w(9, 'READ.', 780, 300, { col: S, accent: .8 }); w(10, 'IT', 1000, 200); w(11, 'GUESSES.', 1190, 210, { col: S, accent: .9 });
  w(20, 'WAIT.', 640, 280, { until: 21 }); w(21, 'WHAT', 640, 280, { until: 22 }); w(22, 'POP?', 760, 420, { col: S, accent: .8, until: 24 });
  w(24, 'POP!', 820, 520, { col: S, accent: 1.3, until: 26, tilt: -.06 }); w(26, 'MADE IT', 640, 220, { until: 28 }); w(27, 'POP.', 880, 300, { col: S, accent: .7, until: 28 });
  w(28, 'YOU:', 420, 150, { until: 32 }); w(31, 'BUT', 1200, 220, { until: 32 });
  w(32, 'LESS', 430, 260); w(33, 'POP.', 660, 260, { col: S, accent: .8 });
  w(40, 'PROMPT', 560, 230); w(41, 'ENGINEERING', 780, 230, { col: S, accent: .8 }); w(42, 'IS', 1000, 200); w(43, 'VIBES.', 1220, 300, { col: S, accent: 1 });

  const BOX = { x: SAFE.left, y: 1260, w: SAFE.right - SAFE.left, h: 130 };
  function box(t, txt, k, a = 1) {
    stroke(rrect(BOX.x, BOX.y, BOX.w, BOX.h, 26), { w: 3, col: B, a: .9 * a, close: true });
    text('Message the AI…', BOX.x + 30, BOX.y - 22, { size: 22, col: PAL.boneDim, a: a, ls: 2 });
    typeOn(txt, BOX.x + 34, BOX.y + 80, k, { size: 46, a });
    const sx = BOX.x + BOX.w - 60, sy = BOX.y + BOX.h / 2;   // the send button
    fillPoly(circlePts(sx, sy, 32, 32, 24), S, a, .5); stroke([[sx - 12, sy + 2], [sx, sy - 12], [sx + 12, sy + 2]], { w: 4, col: PAL.ink, a });
  }
  const rrect = (x, y, w, h, r) => { const P = []; for (const [cx, cy, a0] of [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]) for (let i = 0; i <= 6; i++) { const a = a0 + i / 6 * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; };
  // the token chips: the words split apart and drop into boxes with their ids
  function chips(t, b0, toks) {
    toks.forEach(([s, id], i) => {
      const tb = beatT(b0 + i * .5), k = backOut(seg(t, tb, tb + .2)); if (k <= 0) return;
      const x = SAFE.left + 20 + i * 290, y = 860 + (1 - k) * 220;
      stroke(rrect(x, y - 70, 270, 120, 18), { w: 3, col: S, a: k, close: true, glow: .5 * k });
      text(s, x + 135, y, { size: 52, col: B, align: 'center', wght: 500, a: k });
      text(id, x + 135, y + 34, { size: 22, col: S, align: 'center', a: k, ls: 2 });
    });
  }
  // next-token odds: bars racing to their values; the winner lights up when the spark lands on it
  function odds(t, b0, rows, pick, Y = 700) {
    rows.forEach(([lab, v], i) => {
      const y = Y + i * 120, g = easeOut(seg(t, beatT(b0) + i * .12, beatT(b0 + 2) + i * .12)) * (1 + .04 * Math.sin(t * 40 + i) * (1 - seg(t, beatT(b0 + 2), beatT(b0 + 3))));
      const won = i === 0 && t > beatT(pick), col = won ? S : B;
      text(lab, SAFE.left, y, { size: 44, col, wght: 500, glow: won ? .6 : 0 });
      fillPoly([[SAFE.left + 300, y - 32], [SAFE.left + 300 + 400 * v * g / rows[0][1], y - 32], [SAFE.left + 300 + 400 * v * g / rows[0][1], y + 6], [SAFE.left + 300, y + 6]], col, won ? 1 : .7, won ? .6 : 0);
      text((v * g).toFixed(2), SAFE.right, y, { size: 36, col, align: 'right' });
    });
    const k = easeInOut(seg(t, beatT(pick) - .3, beatT(pick)));
    if (t > beatT(b0 + 1)) spark(lerp(SAFE.right, SAFE.left + 300 + 400, k), lerp(Y + 360, Y - 12, k), 1.2);
  }
  // the reply, one word per beat, each with a little flicker of odds under it
  function reply(t, b0, words) {
    const shown = words.filter((_, i) => t >= beatT(b0 + i * .75));
    if (!shown.length) return;
    text('AI', SAFE.left, 560, { size: 26, col: S, ls: 4, wght: 500 });
    let x = SAFE.left, y = 660;
    X.font = '500 64px "IBM Plex Mono"';
    shown.forEach((wd, i) => { const ww = X.measureText(wd + ' ').width; if (x + ww > SAFE.right) { x = SAFE.left; y += 90; } const k = clamp((t - beatT(b0 + i * .75)) / .1); text(wd, x, y, { size: 64, col: i === words.length - 1 ? S : B, a: k, wght: 500, glow: i === words.length - 1 ? .6 * k : 0 }); x += ww; });
  }
  // the POP: radial burst, letters flying, confetti falling for a bar
  function burst(t, t0, col = S) {
    const a = t - t0; if (a < 0 || a > 2.2) return;
    for (let i = 0; i < 28; i++) { const ang = i / 28 * TAU + hash(i), r = 80 + 900 * easeOut(a / .5); stroke([[CX + Math.cos(ang) * r * .6, 960 + Math.sin(ang) * r * .6], [CX + Math.cos(ang) * r, 960 + Math.sin(ang) * r]], { w: 6, col: i % 2 ? col : B, a: 1 - seg(a, .2, .6), glow: .5 }); }
    for (let i = 0; i < 60; i++) { const x = SAFE.left + hash(i) * (SAFE.right - SAFE.left), y = 200 + a * (500 + 400 * hash(i + 9)) + 300 * a * a - 400 * Math.exp(-a * 4) * hash(i + 3), r = 6 + 10 * hash(i + 1);
      if (y < H) fillPoly([[x - r, y - r * .5], [x + r, y - r * .2], [x + r * .6, y + r * .6], [x - r * .8, y + r * .3]], i % 3 ? S : B, 1 - seg(a, 1.6, 2.2)); }
  }
  // bubbles for the fizz, rising and popping
  function fizz(t, t0, t1) {
    for (let i = 0; i < 40; i++) { const ph = (t - t0) * (.6 + hash(i)) + hash(i + 4), y = H - 300 - frac(ph) * 1500, x = SAFE.left + hash(i + 2) * (SAFE.right - SAFE.left) + 20 * Math.sin(t * 3 + i), r = 8 + 22 * hash(i + 7);
      const a = clamp((t - t0) * 3) * (1 - seg(t, t1 - .4, t1)); if (a > 0) stroke(circlePts(x, y, r, r, 18), { w: 3, col: i % 4 ? B : S, a, glow: i % 4 ? 0 : .4 }); }
  }

  drawWorld = t => {
    const b = t / BEAT, hits = WORDS.filter(x => x.accent).map(x => beatT(x.b));
    const [sx, sy] = shakeAt(t, hits.concat([beatT(24), beatT(24) + .05]));
    cam2D(W / 2 - sx, H / 2 - sy, camZoom(t));
    hud(t, 'INFERENCE — TOKEN BY TOKEN');
    // the prompt box: typed at the start and again in bar 8; empty (caret blinking) at the loop point
    const typing = b < 4 ? seg(b, .6, 2.6) : b >= 28 && b < 32 ? seg(b, 28.6, 30.4) : 0;
    const boxA = (b < 24 || b >= 28) ? 1 - seg(b, 24, 24.2) : 0;
    if (b < 4 || (b >= 28 && b < 32)) box(t, 'make it pop', typing, boxA);
    else if (b >= 46 || b < 24) box(t, '', 0, b >= 46 ? seg(b, 46, 46.5) : .5);
    if (b >= 3 && b < 3.3) flashK(.25 * (1 - seg(b, 3, 3.3)), S);
    if (b >= 6 && b < 8) chips(t, 6, [['make', '#4120'], [' it', '#433'], [' pop', '#2059']]);
    if (b >= 12 && b < 16) odds(t, 12, [[' pop', .41], [' explode', .22], [' 🎉', .09], [' dance', .07]], 15);
    if (b >= 16 && b < 20) reply(t, 16, ['Sure!', "I've", 'made', 'it', 'pop.']);
    burst(t, beatT(24));
    if (b >= 32 && b < 36) odds(t, 33.5, [[' fizz', .38], [' pop', .02], [' calm', .11], [' beige', .06]], 35.5, 900);
    if (b >= 36 && b < 40) reply(t, 36, ['Sure!', "I've", 'made', 'it', 'fizz.']);
    if (b >= 39 && b < 46.5) fizz(t, beatT(39), beatT(46.5));
    drawWords(t);
    camReset();
    beatStrobe(t, [[beatT(23), beatT(24)]]);
    flashK(Math.exp(-(t - beatT(24)) * 9) * (t > beatT(24)), PAL.bone);
    glitch(Math.max(...[24, 33, 43].map(h => t > beatT(h) ? Math.exp(-(t - beatT(h)) * 10) : 0)), Math.floor(t * 30));
  };

  // ---- sound ----
  wordCues();
  cue(beatT(.6), 'type', { n: 11, gap: .09 }); cue(beatT(3), 'pop', { gain: .6 }); cue(beatT(28.6), 'type', { n: 11, gap: .08 });
  for (let i = 0; i < 3; i++) cue(beatT(6 + i * .5), 'impact', { gain: .45, pan: -.4 + i * .4 });
  for (let i = 0; i < 4; i++) cue(beatT(12) + i * .12, 'rise', { dur: BEAT * 1.6, gain: .5 });
  cue(beatT(15), 'ding', { note: 'A6' }); cue(beatT(35.5), 'ding', { note: 'C7' });
  for (let i = 0; i < 5; i++) { cue(beatT(16 + i * .75), 'type', { n: 3, gap: .04 }); cue(beatT(36 + i * .75), 'type', { n: 3, gap: .04 }); }
  cue(beatT(24), 'boom', { gain: 1.2 }); cue(beatT(24), 'pop', { gain: 1.4 }); for (let i = 0; i < 10; i++) cue(beatT(24) + .1 + i * .07, 'pop', { gain: .35, pan: hash(i) - .5 });
  for (let i = 0; i < 16; i++) cue(beatT(39) + i * BEAT / 2 + .05 * hash(i), 'pop', { gain: .25, pan: hash(i + 3) - .5 });
  cue(beatT(33), 'glitch'); cue(beatT(43), 'glitch');
  SONG.bass = ['E1', 'E1', 'C2', 'D2']; SONG.stabs = [['E3', 'G3', 'B3'], ['E3', 'G3', 'B3'], ['C3', 'E3', 'G3'], ['D3', 'F#3', 'A3']];
  SONG.silent = [[beatT(23), beatT(24)]];                      // one beat of silence before the POP
  SONG.riser = [beatT(20), beatT(23)];
})();
