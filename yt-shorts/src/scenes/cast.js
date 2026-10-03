// cast.js: Sak (the recurring lead) and helpers shared by the three Shorts.
// Sak is the Clawd rig recoloured teal-sap with round glasses, the same mascot as the portfolio reel.
CHAR.col = '#4F8F8A'; CHAR.dk = '#2E6460'; CHAR.lt = '#93CBBF';
const sak = (x, y, u, o = {}) => clawd(x, y, u, { glasses: true, ...o });
// a four-point sparkle that pops (k 0 → 1) and fades
const sparkle = (x, y, r, k) => { if (k > 0 && k < 1) paint(starPts(x, y, r * backOut(k) * (1 - k * .6), .25, 4, k * 2), { wash: PAL.cream, washOp: 255 * (1 - k * k), ink: null }); };
// the world position of Sak's right arm tip for a pose (front view), so held things touch the hand
function armTipR(x, y, u, o) {
  const a = o.aR ?? .2, sq = (o.sq || 0), rot = o.rot || 0;
  const px = (4.9 + .55 * clamp((Math.abs(a) - .7) / .9)) * u, py = -4.5 * u;
  let lx = (px + Math.cos(a) * 2.2 * u) * (1 + sq * .6), ly = (py - Math.sin(a) * 2.2 * u) * (1 - sq);
  if (o.flip) lx = -lx;
  const c = Math.cos(rot), s = Math.sin(rot);
  return [x + (o.dx || 0) * u + lx * c - ly * s, y + (o.dy || 0) * u + lx * s + ly * c];
}
// the top-centre of Sak's head for a pose (props that sit on Sak ride here)
const headTop = (x, y, u, o) => [x + (o.dx || 0) * u, y + (o.dy || 0) * u - 8 * u * (1 - (o.sq || 0))];
// YouTube's Shorts UI covers the bottom ~380 px and the right ~180 px: keep the action out of there
const SAFE = { bottom: H - 380, right: W - 180 };
