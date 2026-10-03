// DINO — bars 21-22 (instrumental). No internet: a pixel dinosaur runs the offline game, hopping cacti that
// arrive exactly on the beat (quarters, then 8ths when the second bar doubles up). On the last beats a meteor
// streaks in; its impact is the flash the couch plate opens on.
import { type Frame } from '../engine/scene';
import { LIN, rgba } from '../engine/palette';
import { F, font } from '../engine/type';
import { clamp, ease, hash, lerp } from '../engine/util';
import { sparkHead, sparkParticles } from './_motifs';
import { Plate, W, H } from './_short';

const SPRITE = [
  '          ########',
  '         ## ######',
  '         #########',
  '         #########',
  '         #####    ',
  '         #######  ',
  '#       #####     ',
  '#      #######    ',
  '##   #########    ',
  '############# #   ',
  ' ###########      ',
  '  ##########      ',
  '   ########       ',
  '    #######       ',
];
const LEGS = [['    ##  ##        ', '    #    ##       ', '    ##            '], ['    ##  ##        ', '     ##  #        ', '         ##       ']];
const P = 14, GROUND = 1260, DX = 170;

export default class Dino extends Plate {
  cacti: { t: number; h: number; v: number }[] = [];

  override setup() {
    for (let i = 1; i <= 4; i++) this.cacti.push({ t: this.bt(i), h: 1 + Math.floor(hash(i, 2) * 2), v: 1500 });
    for (let i = 4.5; i <= 6.5; i += 0.5) this.cacti.push({ t: this.bt(i), h: 1, v: 2300 });
  }

  /** Dino height above the ground: a hop centred on each cactus. */
  hop(t: number) {
    let y = 0;
    for (const k of this.cacti) {
      const w = k.v > 2000 ? 0.13 : 0.2, d = (t - k.t) / w;
      if (Math.abs(d) < 1) y = Math.max(y, (1 - d * d) * (k.v > 2000 ? 170 : 260) * k.h ** 0.3);
    }
    return y;
  }

  override camera(f: Frame) {
    const b = this.lb(f.t);
    return { x: W / 2, y: H / 2, zoom: 1 + 0.06 * clamp((b - 4) / 3) + 0.02 * f.a.kick, rot: 0 };
  }

  draw(c: CanvasRenderingContext2D, f: Frame) {
    const t = f.t, b = this.lb(t);
    c.textBaseline = 'middle';
    // header
    c.font = font(F.archivo(100, 700), 64); c.fillStyle = rgba('bone', 1);
    c.fillText('No internet', 80, 470);
    c.font = font(F.mono(400), 30); c.fillStyle = rgba('ash', 1);
    ['Try:', '›  Checking the network cables', '›  Reconnecting to Wi-Fi', '›  Asking an AI instead'].forEach((s, i) => {
      if (b >= i * 0.5) c.fillText(s, 80, 560 + i * 50);
    });
    if (b >= 1.5) { c.fillStyle = rgba('signal', 0.25); c.fillRect(74, 560 + 3 * 50 - 22, 420, 44); }
    c.font = font(F.mono(500), 30); c.fillStyle = rgba('ash', 1); c.textAlign = 'right';
    const score = Math.floor(clamp(b, 0, 8) * 97 + hash(Math.floor(t * 30)) * 3);
    c.fillText(`HI 04096  ${String(score).padStart(5, '0')}`, W - 80, 920);
    c.textAlign = 'left';

    // ground with scrolling pebbles
    const run = (t - this.ctx.start) * 1500 + Math.max(0, t - this.bt(4)) * 800;
    c.fillStyle = rgba('bone', 0.8); c.fillRect(0, GROUND, W, 4);
    for (let i = 0; i < 40; i++) {
      const x = ((hash(i, 1) * 3000 - run) % 1100 + 1100) % 1100;
      c.fillRect(x, GROUND + 14 + hash(i, 2) * 40, 6 + hash(i, 3) * 18, 4);
    }
    // cacti
    c.fillStyle = rgba('bone', 0.95);
    for (const k of this.cacti) {
      const x = DX + 120 + (k.t - t) * k.v;
      if (x < -100 || x > W + 100) continue;
      const hh = 70 + 40 * k.h;
      c.fillRect(x - 13, GROUND - hh, 26, hh);
      c.fillRect(x - 40, GROUND - hh * 0.75, 12, hh * 0.35); c.fillRect(x - 40, GROUND - hh * 0.45, 30, 12);
      c.fillRect(x + 28, GROUND - hh * 0.85, 12, hh * 0.35); c.fillRect(x + 10, GROUND - hh * 0.55, 30, 12);
    }
    // dino
    const y = GROUND - this.hop(t) - (SPRITE.length + 3) * P;
    const legs = this.hop(t) > 1 ? LEGS[0]! : LEGS[Math.floor(b * 4) % 2]!;
    const hit = f.a.kick;
    c.fillStyle = rgba(hit > 0.5 ? 'ember' : 'bone', 1);
    [...SPRITE, ...legs].forEach((row, j) => {
      for (let i = 0; i < row.length; i++) if (row[i] === '#') c.fillRect(DX + i * P, y + j * P, P, P);
    });
    c.fillStyle = rgba('ink', 1); c.fillRect(DX + 12 * P, y + 1 * P, P, P); // eye

    // meteor: beats 6.2 -> 8, from the top right into the dino
    const m0 = 6.2, k = clamp((b - m0) / (8 - m0));
    if (k > 0) {
      const at = (kk: number) => ({ x: lerp(W + 200, DX + 120, ease.inQuad(kk)), y: lerp(-200, GROUND - 120, ease.inQuad(kk)) });
      const hd = this.toScreen(at(k).x, at(k).y);
      const tail = this.toScreen(at(Math.max(0, k - 0.18)).x, at(Math.max(0, k - 0.18)).y);
      this.fx.seg2(tail.x, tail.y, hd.x, hd.y, 40 * k + 6, [LIN.signal[0] * 1.5, LIN.signal[1] * 1.5, LIN.signal[2] * 1.5], 0.6);
      this.fx.seg2(tail.x, tail.y, hd.x, hd.y, 10 * k + 3, [5, 3.5, 2], 1);
      sparkParticles(this.fx, t, (tb) => {
        const kb = clamp((this.lb(tb) - m0) / (8 - m0));
        if (kb <= 0) return null;
        const p = at(kb); return this.toScreen(p.x, p.y);
      }, { rate: 140, speed: 360, life: 0.5, seed: 9, width: 2.2 });
      sparkHead(this.fx, hd.x, hd.y, t, 2 + 3 * k, 1.5);
    }

    return {
      fig: 'FIG. 7 — NO CONNECTION',
      look: { grid: 0.35, glow: [DX + 120, GROUND - 120, 0.15 + 1.2 * k * k], zoomBlur: 0.4 * k * k },
      post: { zoom: 1 + 0.02 * hit, shake: [k * k * 10 * Math.sin(t * 95), k * k * 8 * Math.cos(t * 81)] as [number, number] },
    };
  }
}
