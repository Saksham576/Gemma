// cast.js: Sak (the lead) and the props the chapters share. Loaded before the chapter files; everything here is a
// pure drawing function of its arguments.

// Sak is the Clawd rig recoloured teal-sap, with round glasses. emotions() cross-fades from CHAR, so moods stay on model.
CHAR.col = '#4F8F8A'; CHAR.dk = '#2E6460'; CHAR.lt = '#93CBBF';
const sak = (x, y, u, o = {}) => clawd(x, y, u, { glasses: true, ...o });

// Wipe colours shared by both sides of the c02 → c03 cut.
const NIGHT = [PAL.indigo, PAL.violet];

// A four-point sparkle that pops (k 0 → 1) and fades.
const sparkle = (x, y, r, k) => { if (k > 0 && k < 1) paint(starPts(x, y, r * backOut(k) * (1 - k * .6), .25, 4, k * 2), { wash: PAL.cream, washOp: 255 * (1 - k * k), ink: null }); };

// A loose page: cream sheet with a crooked, scribbled table on it. (x, y) is its centre; s scales it; key seeds its scribble.
function page(x, y, s, rot, key) {
  boilSeed('page' + key);
  push(); translate(x, y); rotate(rot);
  const w = 150 * s, h = 110 * s;
  paint(rrPts(-w / 2, -h / 2, w, h, 6 * s, 1.5), { wash: PAL.cream, fill: mixCol(PAL.cream, PAL.ochre, .25), fillOp: 50, bleed: .05, tex: .5, ink: PAL.ink, sw: .7 });
  for (let r = 0; r < 4; r++) {   // wobbly rows, each tilted its own way
    const yy = -h * .3 + r * h * .2, tilt = (hash(key * 7 + r) - .5) * h * .18;
    inkLine([[-w * .38, yy], [0, yy + tilt * .5 + (hash(key + r) - .5) * 4 * s], [w * .38, yy + tilt]], .45, PAL.ink, 'inkfine', .5);
  }
  inkLine([[-w * .1 + (hash(key) - .5) * 20 * s, -h * .38], [w * .02, h * .36]], .45, PAL.ink, 'inkfine', .3);
  pop();
}

// The gem-lens: a faceted blue gem. glowK 0..1 lights it.
function gem(x, y, r, glowK = 0, rot = 0) {
  if (glowK > 0) glow(x, y, r * (2.4 + 1.6 * glowK), '#9CC8FF', .3 + .7 * glowK);
  boilSeed('gem');
  push(); translate(x, y); rotate(rot);
  const P = [[-r, -r * .2], [-r * .55, -r * .75], [r * .55, -r * .75], [r, -r * .2], [0, r * 1.05]];
  paint(P, { wash: '#4F7FD0', fill: '#9CC8FF', fillOp: 90, bleed: .05, tex: .4, ink: PAL.ink, sw: clamp(r / 30, .4, 1) });
  paint([[-r * .55, -r * .75], [r * .55, -r * .75], [r * .3, -r * .2], [-r * .3, -r * .2]], { wash: '#8DB6F2', ink: null });
  inkLine([[-r, -r * .2], [r, -r * .2]], clamp(r / 50, .3, .7), PAL.ink, 'inkfine', 0);
  inkLine([[-r * .3, -r * .2], [0, r * 1.05], [r * .3, -r * .2]], clamp(r / 60, .25, .6), PAL.ink, 'inkfine', 0);
  inkLine([[-r * .45, -r * .55], [-r * .15, -r * .55]], clamp(r / 40, .3, .8), PAL.cream, 'inkfine', 0);   // glint
  pop();
}

// The table card: a clean 4 × 3 grid with a header row. filled 0..1 fills cells in reading order; flag 0..1 turns cell
// FLAG rose; fixed 0..1 turns it sap and paints a tick. Returns the screen-independent world centre of each cell.
const CARD_COLS = 4, CARD_ROWS = 3, FLAG = 6;
function cardCells(x, y, w, h) {
  const cw = w * .9 / CARD_COLS, ch = h * .66 / CARD_ROWS, x0 = x - w * .45, y0 = y - h * .5 + h * .28, out = [];
  for (let r = 0; r < CARD_ROWS; r++) for (let c = 0; c < CARD_COLS; c++) out.push([x0 + (c + .5) * cw, y0 + (r + .5) * ch, cw, ch]);
  return out;
}
function tableCard(x, y, w, h, filled = 1, flag = 0, fixed = 0) {
  boilSeed('card');
  paint(rrPts(x - w / 2 + 10, y - h / 2 + 14, w, h, 14), { fill: PAL.ink, fillOp: 60, bleed: .15, tex: .3, ink: null });   // shadow
  paint(rrPts(x - w / 2, y - h / 2, w, h, 14, 1), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
  paint(rrPts(x - w * .45, y - h * .4, w * .9, h * .16, 8), { wash: mixCol(PAL.ochre, PAL.cream, .35), ink: PAL.ink, sw: .6 });   // header
  for (let k = 0; k < 3; k++) inkLine([[x - w * .4 + k * w * .28, y - h * .32], [x - w * .24 + k * w * .28, y - h * .32]], .8, PAL.ink, 'ink', 0);
  const C = cardCells(x, y, w, h), n = filled * C.length;
  C.forEach(([cx, cy, cw, ch], i) => {
    const k = clamp(n - i);
    if (i === FLAG && flag > 0) {
      const col = mixCol(mixCol(PAL.cream, PAL.rose, flag), PAL.sap, fixed);
      paint(rectPts(cx - cw / 2 + 3, cy - ch / 2 + 3, cw - 6, ch - 6), { wash: col, ink: null });
      if (fixed > 0) {   // the tick paints in stroke by stroke
        const a = [cx - cw * .18, cy], b = [cx - cw * .04, cy + ch * .2], c = [cx + cw * .22, cy - ch * .25];
        const p1 = clamp(fixed * 2), p2 = clamp(fixed * 2 - 1);
        inkLine([a, [lerp(a[0], b[0], p1), lerp(a[1], b[1], p1)]], 1.4, PAL.ink, 'ink', 0);
        if (p2 > 0) inkLine([b, [lerp(b[0], c[0], p2), lerp(b[1], c[1], p2)]], 1.4, PAL.ink, 'ink', 0);
      }
    }
    if (k > 0) {   // a data mark: a short ink dash, popping in
      const L = cw * .5 * backOut(k);
      inkLine([[cx - L / 2, cy + (hash(i) - .5) * 4], [cx + L / 2, cy + (hash(i + 9) - .5) * 4]], .7, PAL.ink, 'inkfine', 0);
    }
  });
  for (let r = 0; r <= CARD_ROWS; r++) { const yy = y - h * .5 + h * .28 + r * h * .66 / CARD_ROWS; inkLine([[x - w * .45, yy], [x + w * .45, yy]], .5, PAL.ink, 'inkfine', 0); }
  for (let c = 1; c < CARD_COLS; c++) { const xx = x - w * .45 + c * w * .9 / CARD_COLS; inkLine([[xx, y - h * .22], [xx, y + h * .44]], .5, PAL.ink, 'inkfine', 0); }
  return C;
}

// The bottle: a round ceramic bottle, milky rice water filling it (fill 0..1), a rose cap (cap 0..1 seats it).
// (x, y) is the bottom centre; s is its height in px.
function bottle(x, y, s, fill = 1, cap = 1, rot = 0) {
  boilSeed('bottle');
  push(); translate(x, y); rotate(rot);
  const r = s * .36, cy = -r, sw = clamp(s / 160, .5, 1.1);
  paint(ellPts(0, cy, r, r, 28, .5), { wash: '#EAE2D6', ink: null });
  if (fill > 0) {   // the milk, filling from the bottom of the round body
    const lvl = cy + r - 2 * r * fill, P = [];
    for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI; const px = Math.cos(a) * r * .98, py = cy + Math.sin(a) * r * .98; if (py >= lvl) P.push([px, py]); }
    const half = Math.sqrt(Math.max(0, r * r - (lvl - cy) ** 2)) * .98;
    P.push([-half, lvl], [half, lvl]);
    if (P.length > 3) paint(P, { wash: '#FBF6EC', fill: PAL.cream, fillOp: 80, bleed: .05, tex: .3, ink: null, curv: .2 });
  }
  paint(ellPts(-r * .4, cy - r * .35, r * .18, r * .3, 12, 0, .4), { wash: PAL.cream, washOp: 200, ink: null });   // shine
  paint(rectPts(-r * .3, cy - r * 1.35, r * .6, r * .42), { wash: '#EAE2D6', ink: PAL.ink, sw: sw * .8 });          // neck
  paint(ellPts(0, cy, r, r, 28, .5), { ink: PAL.ink, sw });
  paint(rrPts(-r * .5, cy - r * .2, r, r * .55, 6), { wash: mixCol(PAL.rose, PAL.cream, .55), ink: PAL.ink, sw: sw * .6 });   // label (no words)
  inkLine([[-r * .3, cy + r * .05], [r * .3, cy + r * .05]], sw * .5, PAL.ink, 'inkfine', 0);
  if (cap > 0) {
    const lift = (1 - backOut(cap)) * r * 1.2;
    paint(rrPts(-r * .42, cy - r * 1.75 - lift, r * .84, r * .5, 5), { wash: PAL.rose, fill: '#C9506F', fillOp: 70, ink: PAL.ink, sw: sw * .8 });
  }
  pop();
}

// The ring: a slim titanium band seen at an angle; glowK 0..1 lights its inner sensor teal. (x, y) is its centre,
// r its radius, tilt the squash of the ellipse.
function smartRing(x, y, r, glowK = 0, rot = 0, tilt = .42) {
  if (glowK > 0) glow(x, y, r * (2 + 2.5 * glowK), '#6FE3D6', .25 + .75 * glowK);
  boilSeed('ring');
  push(); translate(x, y); rotate(rot);
  const arc = (a0, a1) => { const P = []; for (let i = 0; i <= 14; i++) { const a = lerp(a0, a1, i / 14); P.push([Math.cos(a) * r, Math.sin(a) * r * tilt]); } return P; };
  const band = Math.max(3, r * .22), sw = clamp(r / 40, .4, 1);
  paint(ribbon(arc(Math.PI, TAU), band, band), { wash: '#3B3A48', fill: '#6FE3D6', fillOp: 60 + 160 * glowK, bleed: .05, tex: .3, ink: PAL.ink, sw });   // back half (inside shows)
  paint(ribbon(arc(0, Math.PI), band, band), { wash: '#55546A', fill: '#9A99B0', fillOp: 70, bleed: .05, tex: .5, ink: PAL.ink, sw });                    // front half
  inkLine(arc(.4, 1.2).map(([a, b]) => [a, b + band * .1]), sw * .5, PAL.cream, 'inkfine', .5);   // glint
  pop();
}

// World position of Sak's right arm tip for a pose (front view; the same maths as clawd()'s arms, smear ignored).
// Props a pose holds are drawn here, so they touch the hand.
function armTipR(x, y, u, o) {
  const a = o.aR ?? .2, sq = (o.sq || 0), rot = o.rot || 0;
  const px = (4.9 + .55 * clamp((Math.abs(a) - .7) / .9)) * u, py = -4.5 * u;
  let lx = (px + Math.cos(a) * 2.2 * u) * (1 + sq * .6), ly = (py - Math.sin(a) * 2.2 * u) * (1 - sq);
  if (o.flip) lx = -lx;
  const c = Math.cos(rot), s = Math.sin(rot);
  return [x + (o.dx || 0) * u + lx * c - ly * s, y + (o.dy || 0) * u + lx * s + ly * c];
}
