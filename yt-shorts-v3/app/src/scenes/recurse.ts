// RECURSE — "Just Google it! … Google". A light-mode results page whose image result is a screenshot of the
// page itself. On every beat the camera drops one level into it (a Droste zoom about the map's fixed
// point, so it never runs out), and each level's query is one step sillier. The sung words stamp in ink.
import { type Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { F, font, fitSize } from '../engine/type';
import { clamp, ease, lerp } from '../engine/util';
import { Plate, slam, lens, W, H } from './_short';

const T_JUST = 36.18, T_GOOGLE_IT = 36.48, T_GOOGLE = 38.22;
const BLUE = '#1A0DAB', GREY = '#4D5156';
/** The image result's rect on the page: the page itself at scale S. */
const R = { x: 300, y: 1010, w: 480, h: 480 * (H / W) };
const S = R.w / W;
const FIX = { x: R.x / (1 - S), y: R.y / (1 - S) }; // fixed point of p -> R.xy + S p
const QUERIES = ['google it', 'just google it', 'how to google it', 'google "how to google it"', 'google google', 'is google googling me', 'why am i like this', 'google it'];

export default class Recurse extends Plate {
  /** Continuous depth: one level per beat from beat 0.5, each step eased so it lands on the beat. */
  depth(b: number) {
    const x = clamp(b - 0.5, 0, 6);
    const n = Math.floor(x);
    return n + ease.inOutCubic(clamp((x - n) / 0.55));
  }

  draw(c: CanvasRenderingContext2D, f: Frame) {
    const t = f.t, b = this.lb(t);
    const u = this.depth(b), n = Math.floor(u), fr = u - n;
    // screen = zoom about FIX by S^-fr, then nest levels n, n+1, …
    this.screen(c);
    c.translate(FIX.x, FIX.y); c.scale(Math.pow(S, -fr), Math.pow(S, -fr)); c.translate(-FIX.x, -FIX.y);
    for (let L = 0; L < 5; L++) {
      this.page(c, QUERIES[(n + L) % QUERIES.length]!, f, L === 0);
      c.translate(R.x, R.y); c.scale(S, S);
    }

    // the sung words, in ink over the page
    this.screen(c);
    const fam = F.archivo(125, 900);
    const sz = fitSize('GOOGLE IT!', fam, 960, 300);
    const out = this.bt(3.6);
    slam(c, 'JUST', t, T_JUST, W / 2, 560, { fam: F.serif(600, true), size: 200, col: 'ink', out });
    slam(c, 'GOOGLE IT!', t, T_GOOGLE_IT, W / 2, 760, { fam, size: sz, col: 'ink', out });
    slam(c, 'GOOGLE', t, T_GOOGLE, W / 2, 700, { fam, size: fitSize('GOOGLE', fam, 960, 400), col: 'signal', out: this.bt(6.4) });
    this.world(c);

    const step = fr > 0 && fr < 1 ? Math.sin(Math.PI * fr) : 0;
    const lyr = [T_JUST, T_GOOGLE_IT, T_GOOGLE].reduce((m, x) => (t >= x ? Math.max(m, Math.pow(0.5, (t - x) / 0.08)) : m), 0);
    const toDark = clamp((b - 6.5) * 2);
    return {
      fig: 'FIG. 4 — DID YOU MEAN: RECURSION',
      look: { paper: 1 - toDark, grid: 0, zoomBlur: 0.5 * step, hot: 0.6 },
      post: { zoom: 1 + 0.03 * lyr, shake: [lyr * 7 * Math.sin(t * 93), lyr * 6 * Math.cos(t * 71)] as [number, number], vignette: 0.25, bloomThreshold: lerp(4, 0.85, toDark), halation: 0.25 * toDark, bloom: lerp(0.3, 0.55, toDark) },
    };
  }

  /** One results page in page coords (0..W, 0..H). `top` is the outermost (it may skip its background). */
  page(c: CanvasRenderingContext2D, q: string, f: Frame, top: boolean) {
    c.save();
    c.fillStyle = rgba('#F7F5F0', 1);
    c.fillRect(0, 0, W, H);
    if (!top) { c.strokeStyle = rgba('#000000', 0.25); c.lineWidth = 6; c.strokeRect(0, 0, W, H); }
    // search pill with the query
    c.fillStyle = rgba('#FFFFFF', 1); c.strokeStyle = rgba('#DADCE0', 1); c.lineWidth = 3;
    c.beginPath(); c.roundRect(60, 200, W - 120, 120, 60); c.fill(); c.stroke();
    lens(c, 128, 260, 22, 'graphite', 4);
    c.font = font(F.mono(400), 40); c.textBaseline = 'middle'; c.fillStyle = rgba('#202124', 1);
    c.fillText(q, 190, 262);
    // tabs
    c.font = font(F.mono(500), 28); c.fillStyle = rgba(GREY, 1);
    ['All', 'Images', 'Videos', 'News'].forEach((s, i) => c.fillText(s, 80 + i * 180, 380));
    c.fillStyle = rgba(BLUE, 1); c.fillRect(70, 404, 80, 5);
    // did you mean
    c.font = font(F.serif(400, true), 46); c.fillStyle = rgba('blood', 1);
    c.fillText('Did you mean:', 70, 480);
    c.font = font(F.serif(600, true), 46); c.fillStyle = rgba(BLUE, 1);
    c.fillText(q, 70 + 290, 480);
    // results
    const res = [
      ['reddit.com › r › NoStupidQuestions', 'How do I google something?', 'Top answer: "just google it". Edit: why is this…'],
      ['stackoverflow.com › questions', 'How to google it [duplicate]', 'This question already has an answer here: How to…'],
    ];
    res.forEach(([site, title, snip], i) => {
      const y = 580 + i * 200;
      c.fillStyle = rgba('#DADCE0', 1); c.beginPath(); c.arc(92, y, 20, 0, Math.PI * 2); c.fill();
      c.font = font(F.mono(400), 24); c.fillStyle = rgba(GREY, 1); c.fillText(site!, 130, y);
      c.font = font(F.archivo(100, 500), 44); c.fillStyle = rgba(BLUE, 1); c.fillText(title!, 70, y + 60);
      c.font = font(F.mono(400), 24); c.fillStyle = rgba(GREY, 1); c.fillText(snip!, 70, y + 115);
    });
    c.font = font(F.archivo(100, 700), 40); c.fillStyle = rgba('#202124', 1);
    c.fillText('Images', 70, 960);
    // the image result (the next level is drawn into R by the caller); its frame and a hot outline
    c.strokeStyle = rgba('signal', 0.6 + 0.4 * f.a.kick); c.lineWidth = 8;
    c.strokeRect(R.x - 4, R.y - 4, R.w + 8, R.h + 8);
    c.restore();
  }
}

