// field.js: the geometry that carries TableProof into Pilgrim. The table's horizontal rules ARE field lines: rule r is
// field line j = 3r. Between rules, extra lines fade in; then every line waves into a contour (rice terraces seen from
// above) and the whole plane tilts back into perspective. Because it is one set of lines throughout, the morph has no
// seam: the same strokes change meaning.
const TABLE = { x: 330, y: 230, w: 760, rows: 9, rowH: 68 };     // 1 header row + 8 data rows
const FSTEP = TABLE.rowH / 3;
const fieldY = j => TABLE.y + j * FSTEP;
const POOL = [880, 610];                                          // the terrace pool the drop falls into (flat coords)

// contour offset for line j at x: a few long sines whose phase drifts slowly with j, so neighbouring lines nest
const contour = (j, x) => 46 * Math.sin(x * .0038 + j * .06) + 30 * Math.sin(x * .0015 - j * .03 + 1.3) + 6 * Math.sin(x * .009 + j * .1);   // nested: offsets drift slower than the line spacing, so lines never cross

// flat (table space) → screen, tilted back by `tilt` (0 = flat, 1 = terraces in perspective)
const FIELD_CAM = { x: 0, y: 760, z: -260, pitch: -.62, f: 1150 };
function fieldMap(x, y, tilt) {
  if (tilt <= 0) return [x, y];
  const p = project([(x - POOL[0]) * 1.45, 0, 420 + (H - y) * 1.9], FIELD_CAM);
  if (!p) return [x, y];
  // keep the pool where it is on screen while tilting, so the eye never loses it
  const p0 = project([0, 0, 420 + (H - POOL[1]) * 1.9], FIELD_CAM);
  const sx = p[0] - p0[0] + POOL[0], sy = p[1] - p0[1] + POOL[1] - 40 * tilt;
  return [lerp(x, sx, tilt), lerp(y, sy, tilt)];
}

// ripples on the plane: rings spread from POOL from t0, every .28 s, and bump the field lines they cross
function rippleR(i, t, t0) { const a = t - t0 - i * .28; return a < 0 ? -1 : 420 * Math.pow(a, .7); }
function rippleBump(x, y, t, t0, n = 4) {
  if (t < t0) return 0;
  let dy = 0; const d = Math.hypot(x - POOL[0], (y - POOL[1]) * 1.31);   // 1.31 = the plane's depth/width scale, so ripples are round on the ground
  for (let i = 0; i < n; i++) { const r = rippleR(i, t, t0); if (r < 0) continue; const amp = 22 * Math.exp(-(t - t0 - i * .28) * 1.1); dy += amp * Math.exp(-((d - r) ** 2) / 900); }
  return dy;
}

// one field line as screen points. o: { wave 0..1, x0, x1 (flat extent), tilt 0..1, rip: { t, t0 } }
function fieldLine(j, o) {
  const P = [], n = 64;
  for (let i = 0; i <= n; i++) {
    const x = lerp(o.x0, o.x1, i / n);
    let y = fieldY(j) + (o.wave || 0) * contour(j, x);
    if (o.rip) y -= rippleBump(x, y, o.rip.t, o.rip.t0);
    P.push(fieldMap(x, y, o.tilt || 0));
  }
  return P;
}
