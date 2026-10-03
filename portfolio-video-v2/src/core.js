// core.js: canvas, palette, timing, geometry and drawing helpers for the reel. Every frame is a pure function of time t:
// nothing here keeps state between frames, so frames render in parallel and out of order.
const W = 1920, H = 1080, FPS = 30, DUR = 30, BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4;
const PAL = {
  ink: '#0A0A0B', panel: '#151517', bone: '#EEE9DF', boneDim: '#8E8A82', graphite: '#3A3A3E',
  signal: '#FF4D12', ember: '#FF8A3D', blood: '#C21D0B',
};

// ---------- timing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeIn = x => Math.pow(clamp(x), 3);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = x => { x = clamp(x); const s = 1.7; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const TAU = Math.PI * 2;
// keyframes: kf(t, [[t0, v0], [t1, v1], ...], easing); values may be numbers or arrays
function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
    return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
  }
  return keys[keys.length - 1][1];
}
const pulse = (t, t0, k = 8) => t < t0 ? 0 : Math.exp(-(t - t0) * k);   // 1 at t0, decays after
const mixCol = (a, b, k) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
};
const rgba = (hex, a) => { const p = parseInt(hex.slice(1), 16); return `rgba(${p >> 16},${(p >> 8) & 255},${p & 255},${clamp(a)})`; };

// ---------- polylines ----------
const plen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
// the first k (0..1, by arc length) of a polyline; also returns the pen tip
function partial(P, k) {
  if (k >= 1) return { pts: P, tip: P[P.length - 1] };
  if (k <= 0 || P.length < 2) return { pts: [], tip: P[0] };
  const L = plen(P) * k, out = [P[0]]; let acc = 0;
  for (let i = 1; i < P.length; i++) {
    const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (acc + d >= L) { const u = (L - acc) / (d || 1), q = [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]; out.push(q); return { pts: out, tip: q }; }
    acc += d; out.push(P[i]);
  }
  return { pts: out, tip: P[P.length - 1] };
}
// resample a polyline to n points evenly by arc length (for morphing one shape into another)
function resample(P, n) { const out = []; for (let i = 0; i < n; i++) out.push(partial(P, i / (n - 1)).tip); return out; }
const morph = (A, B, k) => A.map((p, i) => [lerp(p[0], B[i][0], k), lerp(p[1], B[i][1], k)]);
const circlePts = (cx, cy, rx, ry = rx, n = 64, a0 = 0) => { const P = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * TAU; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };

// ---------- 3D (wireframes only: projected to 2D lines) ----------
// cam: { x, y, z } position, yaw/pitch (radians), f (focal length px). Points are [x, y, z]; y is up.
function project([x, y, z], c) {
  let dx = x - c.x, dy = y - c.y, dz = z - c.z;
  const cy = Math.cos(c.yaw || 0), sy = Math.sin(c.yaw || 0);
  [dx, dz] = [dx * cy - dz * sy, dx * sy + dz * cy];
  const cp = Math.cos(c.pitch || 0), sp = Math.sin(c.pitch || 0);
  [dy, dz] = [dy * cp - dz * sp, dy * sp + dz * cp];
  if (dz < 1) return null;
  return [W / 2 + dx * c.f / dz, H / 2 - dy * c.f / dz, dz];
}

// ---------- drawing ----------
// Two layers: the main canvas (X) and a half-resolution glow layer (GX) that is blurred and added on top (bloom).
// Anything with glow > 0 is drawn on both.
let X, GX, OUT, OX, GLOWC, GRAIN = [], FRAME_T = 0, GLOW_GAIN = 1;   // plates on bone paper lower GLOW_GAIN: light barely blooms on a light ground
function stroke(P, o = {}) {
  if (!P || P.length < 2) return;
  const draw = (c, s) => {
    c.beginPath(); c.moveTo(P[0][0] * s, P[0][1] * s);
    for (let i = 1; i < P.length; i++) c.lineTo(P[i][0] * s, P[i][1] * s);
    if (o.close) c.closePath();
    c.lineWidth = (o.w || 1.5) * s; c.strokeStyle = rgba(o.col || PAL.bone, o.a ?? 1);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
  };
  draw(X, 1);
  if (o.glow) { GX.globalAlpha = clamp(o.glow); draw(GX, .5); GX.globalAlpha = 1; }
}
function fillPoly(P, col, a = 1, glow = 0) {
  const draw = (c, s) => { c.beginPath(); c.moveTo(P[0][0] * s, P[0][1] * s); for (const p of P) c.lineTo(p[0] * s, p[1] * s); c.closePath(); c.fillStyle = rgba(col, a); c.fill(); };
  draw(X, 1); if (glow) { GX.globalAlpha = clamp(glow); draw(GX, .5); GX.globalAlpha = 1; }
}
function dot(x, y, r, col, a = 1, glow = 0) { fillPoly(circlePts(x, y, r, r, 20), col, a, glow); }
// the signal: an orange point with a hot core and a halo
function spark(x, y, k = 1, r = 7) {
  if (k <= 0) return;
  GX.globalCompositeOperation = 'lighter';
  const g = GX.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, r * 9 * k / 2);
  g.addColorStop(0, rgba(PAL.ember, .95 * k)); g.addColorStop(.25, rgba(PAL.signal, .55 * k)); g.addColorStop(1, rgba(PAL.signal, 0));
  GX.fillStyle = g; GX.fillRect(x / 2 - r * 5 * k, y / 2 - r * 5 * k, r * 10 * k, r * 10 * k);
  GX.globalCompositeOperation = 'source-over';
  dot(x, y, r * k, PAL.signal, 1); dot(x, y, r * .45 * k, '#FFD9B8', 1);
}
// type. fam: 'mono' (IBM Plex Mono), 'disp' (Archivo, with stretch), 'serif' (Cormorant Garamond italic)
function text(s, x, y, o = {}) {
  const size = o.size || 22, fam = o.fam || 'mono';
  const font = fam === 'mono' ? `${o.wght || 400} ${size}px "IBM Plex Mono"`
    : fam === 'serif' ? `italic 500 ${size}px "Cormorant Garamond"`
    : `${o.stretch || 'normal'} ${o.wght || 700} ${size}px "Archivo"`;
  const draw = (c, s2) => {
    c.save(); c.font = font.replace(`${size}px`, `${size * s2}px`); c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    if (o.ls) c.letterSpacing = `${o.ls * s2}px`;
    c.fillStyle = rgba(o.col || PAL.bone, o.a ?? 1); c.fillText(s, x * s2, y * s2); c.restore();
  };
  draw(X, 1); if (o.glow) { GX.globalAlpha = clamp(o.glow); draw(GX, .5); GX.globalAlpha = 1; }
}
// crop marks at the corners of a box, pushed outward by `fly` px
function cropMarks(x, y, w, h, col, a = 1, fly = 0, len = 34) {
  const m = (cx, cy, sx, sy) => {
    stroke([[cx + sx * fly, cy + sy * (len + fly)], [cx + sx * fly, cy + sy * fly], [cx + sx * (len + fly), cy + sy * fly]], { w: 1.4, col, a });
  };
  m(x, y, -1, -1); m(x + w, y, 1, -1); m(x, y + h, -1, 1); m(x + w, y + h, 1, 1);
}

// ---------- Hershey single-stroke lettering ----------
// Returns the strokes of a string as world-space polylines, plus the total length, so a pen can write it over time.
function hersheyStrokes(str, font, x, y, size, track = 0) {
  const F = HERSHEY[font], sc = size / 32, strokes = [];
  let cx = x;
  for (const ch of str) {
    const g = ch === ' ' ? { o: 8, s: [] } : F[ch.charCodeAt(0) - 33] || F[0];
    for (const s of g.s) { const P = []; for (let i = 0; i < s.length; i += 2) P.push([cx + s[i] * sc, y + (s[i + 1] - 22) * sc]); strokes.push(P); }
    cx += (g.o * 2 + track) * sc;
  }
  return { strokes, width: cx - x, len: strokes.reduce((a, P) => a + plen(P), 0) };
}
function hersheyWidth(str, font, size, track = 0) { return hersheyStrokes(str, font, 0, 0, size, track).width; }
// write k (0..1) of the strokes; returns the pen tip (or null when done or not started)
function writeStrokes(H_, k, o = {}) {
  let left = H_.len * clamp(k), tip = null;
  for (const P of H_.strokes) {
    if (left <= 0) break;
    const L = plen(P);
    if (left >= L) { stroke(P, o); left -= L; tip = P[P.length - 1]; }
    else { const p = partial(P, left / L); stroke(p.pts, o); tip = p.tip; left = 0; }
  }
  return k > 0 && k < 1 ? tip : null;
}

// ---------- frame ----------
function makeGrain(seed) {
  const c = document.createElement('canvas'); c.width = W / 2; c.height = H / 2;
  const g = c.getContext('2d'), id = g.createImageData(c.width, c.height), d = id.data;
  let s = seed * 9301 + 49297; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < d.length; i += 4) { const v = 128 + (rnd() - .5) * 90; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
}
function setupCanvas() {
  OUT = document.getElementById('out'); OX = OUT.getContext('2d');
  const main = document.createElement('canvas'); main.width = W; main.height = H; X = main.getContext('2d');
  GLOWC = document.createElement('canvas'); GLOWC.width = W / 2; GLOWC.height = H / 2; GX = GLOWC.getContext('2d');
  for (let i = 0; i < 4; i++) GRAIN.push(makeGrain(i + 1));
}
function renderFrame(t) {
  FRAME_T = t;
  X.setTransform(1, 0, 0, 1, 0, 0); GX.setTransform(1, 0, 0, 1, 0, 0);
  X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
  X.fillStyle = PAL.ink; X.fillRect(0, 0, W, H);
  GX.clearRect(0, 0, W / 2, H / 2); GLOW_GAIN = 1;
  drawWorld(t);
  // composite: picture, then bloom (two blur radii, added), then grain and vignette
  OX.globalCompositeOperation = 'source-over'; OX.filter = 'none'; OX.globalAlpha = 1;
  OX.drawImage(X.canvas, 0, 0);
  OX.globalCompositeOperation = 'lighter';
  OX.filter = 'blur(6px)'; OX.globalAlpha = GLOW_GAIN; OX.drawImage(GLOWC, 0, 0, W, H);
  OX.filter = 'blur(26px)'; OX.globalAlpha = .9 * GLOW_GAIN; OX.drawImage(GLOWC, 0, 0, W, H);
  OX.filter = 'none'; OX.globalAlpha = 1;
  OX.globalCompositeOperation = 'overlay'; OX.globalAlpha = .1;
  OX.drawImage(GRAIN[Math.floor(t * 24) % 4], 0, 0, W, H);
  OX.globalAlpha = 1; OX.globalCompositeOperation = 'source-over';
  const v = OX.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.0);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.24)');
  OX.fillStyle = v; OX.fillRect(0, 0, W, H);
}

// 2D camera: world point (cx, cy) lands at screen point (sx, sy), scaled by zoom. Applies to both layers.
function cam2D(cx, cy, zoom = 1, sx = W / 2, sy = H / 2) {
  X.setTransform(zoom, 0, 0, zoom, sx - cx * zoom, sy - cy * zoom);
  GX.setTransform(zoom, 0, 0, zoom, (sx - cx * zoom) / 2, (sy - cy * zoom) / 2);
}
function camReset() { X.setTransform(1, 0, 0, 1, 0, 0); GX.setTransform(1, 0, 0, 1, 0, 0); }
