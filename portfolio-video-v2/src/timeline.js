// timeline.js: the one edit. Every time constant lives here, so the picture (plates) and the sound (score.js) read the
// same numbers and stay in sync to the frame. 120 bpm: a beat is 0.5 s, a bar 2 s. Every seam lands on a bar line.
const T = {
  // open (0–4): the signal writes the name on a sheet, underlines it, and the sheet collapses into that underline
  write0: .4, write1: 2.4, flourish0: 2.85, flourish1: 3.2, collapse1: 4.0,
  // TableProof (4–10): the line becomes a scanline; a scanned table snaps clean; one flagged cell is fixed
  page1: 4.9, scan0: 5.0, scan1: 7.0, flag: 7.0, click: 7.5, fixed1: 7.9,
  // seam (8–10): the table's rules extend and wave into contour lines and tilt back into terraced fields
  morph0: 8.0, wave0: 8.6, tilt0: 9.0, tilt1: 10.0,
  // Pilgrim (10–17): the signal falls as a drop of rice water; ripples; top-down; a bottle is plotted around them
  lift0: 11.0, drop0: 11.5, splash: 12.0, top0: 13.0, top1: 14.0, bottle0: 14.0, bottle1: 15.5, ring0: 16.0, ring1: 17.0,
  // Ultrahuman (17–24): the ripple is a ring; the signal is its sensor; its trail becomes a heartbeat
  orbit1: 18.5, ecg0: 18.5, beats: [19.0, 20.0, 21.0, 22.0], hyp0: 19.5, hyp1: 21.5, score0: 20.5, score1: 22.0, flat0: 23.0,
  // outro (24–30): the flat line opens into the sheet again; the name is re-signed; then the ink lifts → frame 0
  paper1: 25.0, sign0: 25.2, sign1: 27.2, chips: [27.2, 27.7, 28.2], unsign0: 29.0, unsign1: 29.8,
};
const LINE_Y = 590;                                   // the underline / scanline / flatline height, shared by every seam
const NAME = { str: 'Saksham', size: 190, track: -5, x: 0, y: 520 };
NAME.x = W / 2 - hersheyWidth(NAME.str, 'scripts', NAME.size, NAME.track) / 2;

const PLATES = [];
function plate(t0, fn) { PLATES.push([t0, fn]); PLATES.sort((a, b) => a[0] - b[0]); }
function drawWorld(t) {
  let i = 0; while (i + 1 < PLATES.length && t >= PLATES[i + 1][0]) i++;
  const [t0, fn] = PLATES[i], t1 = i + 1 < PLATES.length ? PLATES[i + 1][0] : DUR;
  fn(t, t - t0, t1 - t0);
}

// ---------- the sheet: shared by the open and the outro (they must match exactly, so the reel loops) ----------
const SHEET = { x: 170, y: 120, w: W - 340, h: H - 240 };
function nameStrokes() { return hersheyStrokes(NAME.str, 'scripts', NAME.x, NAME.y, NAME.size, NAME.track); }
function sheetChrome(a = 1, fly = 0) {
  cropMarks(SHEET.x, SHEET.y, SHEET.w, SHEET.h, PAL.panel, a, fly);
  text('SAKSHAM — REEL 02', SHEET.x, SHEET.y - 22, { size: 16, col: PAL.panel, a: .75 * a, ls: 3 });
  text('PORTFOLIO · 2026', SHEET.x + SHEET.w, SHEET.y - 22, { size: 16, col: PAL.panel, a: .75 * a, ls: 3, align: 'right' });
  text('PL. 0', SHEET.x, SHEET.y + SHEET.h + 40, { size: 16, col: PAL.panel, a: .6 * a, ls: 3 });
}
// the signal breathing at rest at the start of the name: identical at t = 0 and t = 30
const breathe = t => .82 + .18 * Math.sin(t * TAU / 2);
