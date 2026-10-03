// KEYS — "Click clack". The crowd's squares are keycaps: the camera dives into an ortholinear keyboard laid on
// the same grid. Every drum onset presses a key and kicks out a little CLICK/CLACK; the sung "Click clack"
// slams full-width. On the last six 8ths the keys type G-O-O-G-L-E into the pill above (the recursion plate
// opens on that query).
import { type Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { F, font, fitSize } from '../engine/type';
import { clamp, ease, hash, lerp } from '../engine/util';
import { Plate, slam, W, H } from './_short';
import { PITCH } from './everybody';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL;', 'ZXCVBNM,./'];
const I0 = 3, J0 = 13; // grid cell of the Q key
const T_CLICK = 32.79, T_CLACK = 33.06;

interface Key { ch: string; i: number; j: number; w: number }
interface Press { t: number; k: number; word: string }

export default class Keys extends Plate {
  keys: Key[] = [];
  presses: Press[] = [];
  spell: Press[] = [];

  override setup() {
    ROWS.forEach((r, j) => r.split('').forEach((ch, i) => this.keys.push({ ch, i: I0 + i, j: J0 + j, w: 1 })));
    this.keys.push({ ch: 'space', i: I0 + 2, j: J0 + 3, w: 6 }, { ch: '⏎', i: I0 + 9, j: J0 + 3, w: 1 });
    const idx = (ch: string) => this.keys.findIndex((k) => k.ch === ch);
    // spelled: G O O G L E on the 8ths of beats 3..5.5
    this.spell = 'GOOGLE'.split('').map((ch, n) => ({ t: this.bt(3 + n / 2), k: idx(ch), word: '' }));
    // drum hits before the spelling press random letter keys
    const tEnd = this.bt(2.9);
    const hs = [...this.hits('kick', 0.25), ...this.hits('snare', 0.25)].filter(([t]) => t < tEnd).sort((a, b) => a[0] - b[0]);
    let last = -1;
    hs.forEach(([t], n) => {
      if (t - last < 0.07) return;
      last = t;
      this.presses.push({ t, k: Math.floor(hash(n, 11) * 30), word: n % 2 ? 'CLACK' : 'CLICK' });
    });
    this.presses.push(...this.spell);
  }

  /** Keyboard centre (world). */
  kc() { return { x: (I0 + 5) * PITCH, y: (J0 + 2) * PITCH }; }

  override camera(f: Frame) {
    const b = this.lb(f.t), kc = this.kc();
    const k = ease.inOutCubic(clamp(b / 1.1));
    const z = Math.exp(lerp(Math.log(0.16), Math.log(1.5), k));
    const db = Math.floor(f.bar);
    const roll = (db % 2 ? 1 : -1) * 0.07 * ease.outBack(clamp(f.barPhase * 6)) * k;
    return { x: lerp(W / 2, kc.x, k), y: lerp(H / 2, kc.y - 30, k), zoom: z * (1 + 0.03 * f.a.kick), rot: lerp(-0.03, roll, k) };
  }

  draw(c: CanvasRenderingContext2D, f: Frame) {
    const t = f.t, b = this.lb(t), z = this.cam.zoom;
    const fadeCrowd = 1 - clamp(b / 0.6);

    // the crowd's leftover squares, fading as we dive
    if (fadeCrowd > 0) {
      const hw = W / 2 / z + PITCH, hh = H / 2 / z + PITCH;
      c.fillStyle = rgba('bone', 0.07 * fadeCrowd);
      for (let j = Math.floor((this.cam.y - hh) / PITCH); j <= (this.cam.y + hh) / PITCH; j++)
        for (let i = Math.floor((this.cam.x - hw) / PITCH); i <= (this.cam.x + hw) / PITCH; i++) {
          if (j >= J0 && j < J0 + 4 && i >= I0 && i < I0 + 10) continue;
          const s = PITCH * 0.82, x = i * PITCH + PITCH / 2, y = j * PITCH + PITCH / 2;
          c.beginPath(); c.roundRect(x - s / 2, y - s / 2, s, s, s * 0.18); c.fill();
        }
    }

    // keycaps: top face lifted by `depth`, front face below; a press sinks it and lights it
    const depth = 11;
    this.keys.forEach((k, n) => {
      let p = 0;
      for (const pr of this.presses) if (pr.k === n && t >= pr.t) p = Math.max(p, Math.pow(0.5, (t - pr.t) / 0.09));
      const x = k.i * PITCH + PITCH * 0.09, y = k.j * PITCH + PITCH * 0.09;
      const w = PITCH * k.w - PITCH * 0.18, h = PITCH * 0.82;
      const d = depth * (1 - 0.8 * p);
      const spelt = this.spell.some((s) => s.k === n && t >= s.t);
      c.fillStyle = rgba(spelt || p > 0.3 ? 'blood' : '#1d1d20', 1);
      c.beginPath(); c.roundRect(x, y + depth - d + 4, w, h, 9); c.fill();
      c.fillStyle = p > 0.02 ? rgba('signal', 0.25 + 0.75 * p) : spelt ? rgba('signal', 0.55) : rgba('#2a2a2e', 1);
      c.beginPath(); c.roundRect(x, y + depth - d - 6, w, h - 4, 9); c.fill();
      c.strokeStyle = rgba('bone', 0.12 + 0.5 * p);
      c.lineWidth = 1.5; c.stroke();
      c.fillStyle = rgba(p > 0.3 ? 'ink' : 'bone', 0.85);
      c.font = font(F.mono(500), k.ch.length > 1 ? 14 : 22);
      c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillText(k.ch, x + 8, y + depth - d);
    });

    // little CLICK/CLACKs flying off pressed keys
    for (const pr of this.presses) {
      if (!pr.word || t < pr.t || t > pr.t + 0.5) continue;
      const k = this.keys[pr.k]!, age = t - pr.t;
      const dir = hash(pr.t * 100) - 0.5;
      const x = k.i * PITCH + PITCH * k.w / 2 + dir * 220 * age, y = k.j * PITCH - 260 * age + 300 * age * age;
      c.save(); c.translate(x, y); c.rotate(dir * 0.6);
      c.globalAlpha = 1 - age / 0.5;
      c.font = font(F.archivoItalic(125, 800), 30); c.textAlign = 'center';
      c.fillStyle = rgba('ember', 1); c.fillText(pr.word, 0, 0); c.restore();
    }

    // the pill above the keyboard, filling with the spelled letters
    const kc = this.kc(), py = J0 * PITCH - 120;
    const ns = this.spell.filter((s) => t >= s.t).length;
    if (b > 2.9) {
      const a = clamp((b - 2.9) * 6);
      c.save(); c.globalAlpha = a;
      c.fillStyle = rgba('ink2', 0.95); c.strokeStyle = rgba('bone', 0.5); c.lineWidth = 2;
      c.beginPath(); c.roundRect(kc.x - 300, py - 44, 600, 88, 44); c.fill(); c.stroke();
      c.font = font(F.mono(400), 40); c.fillStyle = rgba('bone', 1); c.textBaseline = 'middle'; c.textAlign = 'left';
      const s = 'google'.slice(0, ns);
      c.fillText(s, kc.x - 240, py + 2);
      const cw = c.measureText(s).width;
      if (b % 1 < 0.5 || ns < 6) { c.fillStyle = rgba('signal', 1); c.fillRect(kc.x - 236 + cw, py - 24, 4, 48); }
      c.restore();
    }

    // the sung words, full width in screen space
    this.screen(c);
    const fam = F.archivo(125, 900);
    const s1 = fitSize('CLACK', fam, 840, 380);
    slam(c, 'CLICK', t, T_CLICK, W / 2, 470, { fam, size: s1, out: this.bt(2.6) });
    slam(c, 'CLACK', t, T_CLACK, W / 2, 470 + s1 * 0.95, { fam, size: s1, col: 'signal', out: this.bt(2.6) });
    this.world(c);

    let hit = 0;
    for (const pr of this.presses) if (t >= pr.t) hit = Math.max(hit, Math.pow(0.5, (t - pr.t) / 0.07));
    const lyr = [T_CLICK, T_CLACK].reduce((m, x) => (t >= x ? Math.max(m, Math.pow(0.5, (t - x) / 0.08)) : m), 0);
    return {
      fig: 'FIG. 3 — CLICK CLACK',
      look: { grid: 0.3, glow: [kc.x, kc.y, 0.6 * hit], hot: 1.2 },
      post: { zoom: 1 + 0.035 * lyr, shake: [lyr * 9 * Math.sin(t * 91), lyr * 7 * Math.cos(t * 77)] as [number, number], flash: 0.1 * lyr },
    };
  }
}
