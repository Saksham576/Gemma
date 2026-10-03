// kinetic.js: the house style for the Shorts, borrowed from the reference (mexicat's P(doom) video): words slam onto
// the beat in big Archivo, details tick in mono, one orange signal draws things, the frame is never still.
// Every helper is a pure function of t. A Short describes itself as a word timeline (WORDS) plus its own drawing.
const beatT = b => b * BEAT;                                   // beat number → seconds
const SAFE = { left: 70, right: W - 190, top: 170, bottom: H - 400 };   // keep clear of the Shorts UI (bottom, right)
const WORDS = [];
var drawWorld = t => {};                                       // each Short replaces this with its own drawing                                              // [{ b, text, x, y, size, ... }] — drives slams AND sound

// a word that slams in on its beat: overshoot scale, a tiny tilt, then holds until `until` (a beat) and snaps out
function slam(w, t) {
  const t0 = beatT(w.b), t1 = w.until != null ? beatT(w.until) : Infinity;
  if (t < t0 || t > t1 + .1) return;
  const k = clamp((t - t0) / .14), e = backOut(k), out = clamp((t - t1) / .1);
  const s = lerp(w.from ?? 1.9, 1, e) * (1 + .04 * pulse(t, t0 + .14, 10) + .06 * Math.max(0, t - t0)) * (1 - .3 * out);   // creeps while held: never still
  const a = clamp(k * 3) * (1 - out);
  // fit: never wider than the safe area
  let size = w.size || 150; const fam = w.fam || 'disp';
  X.font = fam === 'mono' ? `500 ${size}px "IBM Plex Mono"` : `${w.stretch || 'normal'} ${w.wght || 800} ${size}px "Archivo"`;
  const maxW = w.maxW || (SAFE.right - SAFE.left), tw = X.measureText(w.text).width; if (tw > maxW) size *= maxW / tw;
  X.save(); GX.save();
  for (const [c, f] of [[X, 1], [GX, .5]]) { c.translate(w.x * f, (w.y - 40 * out) * f); c.rotate((w.rot || 0) * (1 - e) + (w.tilt || 0)); c.scale(s, s); c.translate(-w.x * f, -w.y * f); }
  text(w.text, w.x, w.y, { fam, size, wght: w.wght || 800, stretch: w.stretch || 'normal', col: w.col || PAL.bone, a, align: w.align || 'center', ls: w.ls, glow: w.glow ?? (w.col === PAL.signal ? .8 * a : 0) });
  X.restore(); GX.restore();
  // accents: two outline echoes ring out from the word, on the hit and on the off-beat after it
  if (w.accent) for (const d of [0, BEAT / 2]) {
    const g = (t - t0 - d) / .35; if (g <= 0 || g >= 1) continue;
    X.save(); X.translate(w.x, w.y); X.scale(1 + .5 * easeOut(g), 1 + .5 * easeOut(g)); X.translate(-w.x, -w.y);
    X.font = `${w.stretch || 'normal'} ${w.wght || 800} ${size}px "Archivo"`; X.textAlign = w.align || 'center'; X.lineWidth = 3; X.strokeStyle = rgba(w.col || PAL.bone, .6 * (1 - g)); X.strokeText(w.text, w.x, w.y);
    X.restore();
  }
}
function drawWords(t) { for (const w of WORDS) slam(w, t); }

// mono typing: k 0..1 of the string, with a blinking caret
function typeOn(s, x, y, k, o = {}) {
  const n = Math.floor(s.length * clamp(k)), shown = s.slice(0, n);
  text(shown, x, y, { size: o.size || 34, col: o.col || PAL.bone, a: o.a ?? 1, wght: 500, glow: o.glow });
  if (o.caret !== false && (k < 1 || Math.floor(FRAME_T * 2) % 2 === 0)) {
    X.font = `500 ${o.size || 34}px "IBM Plex Mono"`; const w = X.measureText(shown).width;
    fillPoly([[x + w + 4, y - (o.size || 34) * .8], [x + w + 4 + (o.size || 34) * .55, y - (o.size || 34) * .8], [x + w + 4 + (o.size || 34) * .55, y + 6], [x + w + 4, y + 6]], PAL.signal, o.a ?? 1, .6);
  }
}
// a rolling number, with ease-out, formatted by fmt
const roll = (t, t0, t1, a, b, fmt = v => Math.round(v).toString()) => fmt(lerp(a, b, easeOut(seg(t, t0, t1))));

// camera shake on the kick (every other beat), plus extra on big hits
function shakeAt(t, hits = []) {
  let amp = 6 * Math.exp(-frac(t / (BEAT * 2)) * BEAT * 2 * 14);
  for (const h of hits) if (t >= h) amp += 24 * Math.exp(-(t - h) * 12);
  const f = Math.floor(t * 30); return [(hash(f * 1.7) - .5) * 2 * amp, (hash(f * 2.3 + 9) - .5) * 2 * amp];
}
// a full-frame flash (k 0..1)
function flashK(k, col = PAL.bone) { if (k > .01) { X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = clamp(k); X.fillStyle = col; X.fillRect(0, 0, W, H); X.restore(); } }
// glitch: horizontal slices of what's been drawn, offset sideways (amount 0..1)
function glitch(amount, seed) {
  if (amount <= .01) return;
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 9; i++) {
    const y = Math.floor(hash(seed * 13 + i) * H), h = 20 + Math.floor(hash(seed * 7 + i) * 140), dx = (hash(seed * 3 + i) - .5) * 260 * amount;
    X.drawImage(X.canvas, 0, y, W, h, dx, y, W, h);
    if (i % 3 === 0) { X.globalAlpha = .5 * amount; X.fillStyle = i % 2 ? PAL.signal : PAL.bone; X.fillRect(0, y, W, 3); X.globalAlpha = 1; }
  }
  X.restore();
}
// the HUD: a faint grid that pulses on the beat, corner marks, mono read-outs. The frame is never still.
function hud(t, label) {
  const p = pulse(t, Math.floor(t / BEAT) * BEAT, 6), off = (t * 120) % 120;   // the grid scrolls up 120 px a second
  for (let x = 60; x < W; x += 120) stroke([[x, 0], [x, H]], { w: 1, col: PAL.graphite, a: .35 + .25 * p });
  for (let y = 40 - off; y < H; y += 120) stroke([[0, y], [W, y]], { w: 1, col: PAL.graphite, a: .35 + .25 * p });
  const sy = frac(t / BEAT) * H;                                                   // a scan line, once per beat
  stroke([[0, sy], [W, sy]], { w: 2, col: PAL.signal, a: .35, glow: .25 });
  for (let i = 0; i < 6; i++) text(hash(Math.floor(t * 12) * 7 + i).toString(16).slice(2, 10).toUpperCase(), W - 30, 300 + i * 34, { size: 16, col: PAL.graphite, align: 'right', ls: 2 });
  cropMarks(SAFE.left - 20, SAFE.top - 60, SAFE.right - SAFE.left + 40, SAFE.bottom - SAFE.top + 60, PAL.boneDim, .7);
  text(label, SAFE.left - 20, SAFE.top - 80, { size: 20, col: PAL.boneDim, ls: 4, wght: 500 });
  text(`T+${t.toFixed(2)}`, SAFE.right + 20, SAFE.top - 80, { size: 20, col: PAL.boneDim, align: 'right', ls: 2 });
  text(`BPM ${BPM} · BAR ${1 + Math.floor(t / BAR)}/${DUR / BAR}`, SAFE.left - 20, SAFE.bottom + 50, { size: 18, col: PAL.boneDim, ls: 3 });
}

// the camera's zoom: pushes in through each bar and snaps back on the downbeat (a hit every bar), plus a kick pulse
const camZoom = t => 1 + .05 * frac(t / BAR) + .03 * pulse(t, Math.floor(t / (BEAT * 2)) * BEAT * 2, 6) + .025 * pulse(t, (Math.floor(t / BEAT) + .5) * BEAT, 14) * (frac(t / BEAT) >= .5);   // + a snap on every off-beat
// a light strobe on every beat (two frames), like the reference's beat flashes; skipped where a Short wants silence
function beatStrobe(t, quiet = []) { const bt = Math.floor(t / BEAT) * BEAT; if (quiet.some(([a, z]) => bt >= a && bt < z)) return; flashK(.10 * Math.exp(-(t - bt) * 22), PAL.bone); }   // 2 flashes a second: under the 3/s photosensitivity guideline
