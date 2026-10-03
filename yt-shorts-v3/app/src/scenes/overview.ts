// OVERVIEW — bars 17-18. The recursion bottoms out in an "AI Overview": a sparkle-crowned card that streams a
// confident answer a word per 16th — eat one small rock per day — then whips to the next card (glue on pizza)
// on the downbeat, and gets stamped with the fine print on the last beat.
import { type Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { F, font } from '../engine/type';
import { clamp, ease, lerp } from '../engine/util';
import { sparkHead, sparkParticles } from './_motifs';
import { Plate, W, H } from './_short';

const CARDS = [
  { q: 'how many rocks should i eat', a: 'According to geologists at UC Berkeley, you should eat *at least one small rock per day.* Rocks are a vital source of minerals.', src: ['theonion.com', 'reddit.com'] },
  { q: 'cheese not sticking to pizza', a: 'You can add about *⅛ cup of non-toxic glue* to the sauce to give it more tackiness. Enjoy!', src: ['reddit.com', 'r/Pizza · 11y ago'] },
];
const X0 = 70, X1 = W - 70, TOP = 560;

export default class Overview extends Plate {
  /** Word tokens of a card laid out in lines; `hot` marks the *starred* run. */
  wrap(c: CanvasRenderingContext2D, s: string, maxW: number) {
    const toks: { w: string; x: number; line: number; hot: boolean }[] = [];
    let hot = false, x = 0, line = 0;
    for (const raw of s.split(' ')) {
      let w = raw;
      const open = w.startsWith('*'), close = w.endsWith('*');
      w = w.replace(/\*/g, '');
      if (open) hot = true;
      c.font = font(hot ? F.archivo(100, 700) : F.archivo(100, 400), 54);
      const ww = c.measureText(w + ' ').width;
      if (x + ww > maxW && x > 0) { x = 0; line++; }
      toks.push({ w, x, line, hot });
      x += ww;
      if (close) hot = false;
    }
    return toks;
  }

  override camera(f: Frame) {
    const b = this.lb(f.t);
    return { x: W / 2, y: H / 2 + 20 * Math.sin(b * 0.7), zoom: 1 + 0.02 * b / 8 + 0.025 * f.a.kick, rot: 0.012 * Math.sin(b * 0.5) };
  }

  draw(c: CanvasRenderingContext2D, f: Frame) {
    const t = f.t, b = this.lb(t);
    const ci = b < 4 ? 0 : 1, lb = b - ci * 4;
    // whip between cards around beat 4: out left, in from the right
    const whip = b < 4 ? ease.inExpo(clamp((b - 3.75) / 0.25)) : -1 + ease.outExpo(clamp((b - 4) / 0.3));
    const dx = b < 4 ? -whip * 1300 : -whip * 1300;
    const card = CARDS[ci]!;

    c.save();
    c.translate(dx, 0);
    // the query on top
    c.font = font(F.mono(400), 36); c.textBaseline = 'middle'; c.fillStyle = rgba('ash', 1);
    c.fillText(`› ${card.q}`, X0 + 10, TOP - 160);
    // card with a rotating warm gradient border
    const toks = this.wrap(c, card.a, X1 - X0 - 100);
    const lines = toks[toks.length - 1]!.line + 1;
    const h = 260 + lines * 76;
    const g = c.createConicGradient(t * 2.2, W / 2, TOP + h / 2);
    g.addColorStop(0, rgba('signal', 1)); g.addColorStop(0.33, rgba('ember', 0.8)); g.addColorStop(0.5, rgba('bone', 0.3));
    g.addColorStop(0.75, rgba('blood', 0.9)); g.addColorStop(1, rgba('signal', 1));
    c.fillStyle = rgba('ink2', 0.97);
    c.beginPath(); c.roundRect(X0, TOP, X1 - X0, h, 36); c.fill();
    c.strokeStyle = g; c.lineWidth = 5; c.stroke();
    // header: sparkle + "AI Overview"
    const sx = X0 + 76, sy = TOP + 80;
    this.star(c, sx, sy, 30 * (1 + 0.25 * f.a.kick), t * 1.5);
    c.font = font(F.archivo(100, 700), 44); c.fillStyle = rgba('bone', 1); c.textBaseline = 'middle';
    c.fillText('AI Overview', sx + 56, sy + 2);
    // the answer, a word per 16th from beat 0.5 of this card
    const shown = Math.floor(clamp((lb - 0.25) * 8, 0, toks.length));
    toks.forEach((k, i) => {
      if (i >= shown) return;
      const age = (lb - 0.25) * 8 - i;
      c.globalAlpha = clamp(age * 1.5);
      c.font = font(k.hot ? F.archivo(100, 700) : F.archivo(100, 400), 54);
      c.fillStyle = rgba(k.hot ? 'signal' : 'bone', k.hot ? 1 : 0.92);
      c.fillText(k.w, X0 + 50 + k.x, TOP + 190 + k.line * 76 + (1 - clamp(age)) * 12);
      if (k.hot) { c.fillStyle = rgba('signal', 0.18); c.fillRect(X0 + 46 + k.x, TOP + 160 + k.line * 76, c.measureText(k.w + ' ').width, 62); }
    });
    c.globalAlpha = 1;
    // source chips pop on the 3rd and 4th beat
    card.src.forEach((s, i) => {
      const k = ease.outBack(clamp((lb - 2.5 - i * 0.5) * 5));
      if (k <= 0) return;
      const cx = X0 + 50 + i * 330, cy = TOP + h - 70;
      c.save(); c.translate(cx, cy); c.scale(k, k);
      c.fillStyle = rgba('#26262A', 1); c.beginPath(); c.roundRect(0, -30, 300, 60, 30); c.fill();
      c.font = font(F.mono(500), 24); c.fillStyle = rgba('ash', 1); c.fillText(s, 26, 2);
      c.restore();
    });
    c.restore();

    // the fine print stamp on the last beat
    const tS = this.bt(7);
    if (t >= tS) {
      const k = ease.outBack(clamp((t - tS) / 0.12));
      c.save(); c.translate(W / 2, TOP + 560); c.rotate(-0.16); c.scale(lerp(2.2, 1, k), lerp(2.2, 1, k));
      c.strokeStyle = rgba('signal', 1); c.lineWidth = 8;
      c.font = font(F.archivo(125, 900), 64); c.textAlign = 'center'; c.textBaseline = 'middle';
      const s = 'AI RESPONSES MAY';
      const w = c.measureText(s).width;
      c.strokeRect(-w / 2 - 30, -100, w + 60, 200);
      c.fillStyle = rgba('signal', 1);
      c.fillText(s, 0, -40); c.fillText('INCLUDE MISTAKES', 0, 40);
      c.restore();
    }

    // sparks off the star (screen space)
    const p = this.toScreen(X0 + 76 + dx, TOP + 80);
    sparkParticles(this.fx, t, () => p, { rate: 60, speed: 220, life: 0.5, seed: 5 });
    sparkHead(this.fx, p.x, p.y, t, 1.2, 0.8 + f.a.kick);

    const stamp = t >= tS ? Math.pow(0.5, (t - tS) / 0.08) : 0;
    return {
      fig: 'FIG. 5 — THE OVERVIEW',
      look: { grid: 0.5, glow: [W / 2, TOP + 300, 0.12 + 0.2 * f.a.kick], zoomBlur: Math.abs(whip) * 0.8 },
      post: { flash: 0.15 * stamp, zoom: 1 + 0.05 * stamp, shake: [stamp * 12 * Math.sin(t * 90), stamp * 9 * Math.cos(t * 70)] as [number, number] },
    };
  }

  /** A four-point sparkle. */
  star(c: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
    c.save(); c.translate(x, y); c.rotate(Math.sin(rot) * 0.3);
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.28 : r;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath(); c.fillStyle = rgba('ember', 1); c.fill();
    c.restore();
  }
}

