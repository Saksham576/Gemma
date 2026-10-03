// EVERYBODY — "Google it! / Everybody". The magnifier ring from the query lands as the first O of GOOGLE,
// IT! slams under it; on "Everybody" the result count rolls to 8,100,000,000 and the camera pulls out
// through a crowd of that many people, the words shrinking to a speck among them. On the last beat every
// person squares off into a keycap: the grid the keyboard plate opens on.
import { type Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { F, font, fitSize } from '../engine/type';
import { clamp, ease, hash, lerp } from '../engine/util';
import { Plate, person, W, H } from './_short';
import { LENS } from './query';

const T_GOOGLE = 29.31, T_IT = 29.61, T_EVERY = 30.48, T_EVERY_END = 31.38;
export const PITCH = 64; // crowd/keycap grid pitch (world px)
const CY = 760; // word block centre

export default class Everybody extends Plate {
  fam = F.archivo(125, 900);
  gSize = 0;

  override setup() { this.gSize = fitSize('GOOGLE', this.fam, 940, 400); }

  override camera(f: Frame) {
    const b = this.lb(f.t);
    // pull out from beat 2 (Everybody) to 5.6, then hold
    const k = ease.inOutCubic(clamp((b - 2.1) / 3.5));
    const z = Math.exp(lerp(Math.log(1), Math.log(0.16), k));
    const sh = Math.pow(0.5, Math.max(0, f.t - T_IT) / 0.08) * (f.t >= T_IT ? 1 : 0);
    return { x: W / 2 + sh * 14 * Math.sin(f.t * 90), y: H / 2 - 120 * (1 - k), zoom: z * (1 + 0.04 * sh), rot: -0.03 * k };
  }

  draw(c: CanvasRenderingContext2D, f: Frame) {
    const t = f.t, b = this.lb(t), z = this.cam.zoom;
    const square = ease.inOutCubic(clamp((b - 5.2) / 0.6)); // persons -> keycaps

    // ---- the crowd: visible cells only, popping in outward from the centre after "Everybody"
    if (t >= T_EVERY - 0.05) {
      const hw = W / 2 / z + PITCH, hh = H / 2 / z + PITCH;
      const i0 = Math.floor((this.cam.x - hw) / PITCH), i1 = Math.ceil((this.cam.x + hw) / PITCH);
      const j0 = Math.floor((this.cam.y - hh) / PITCH), j1 = Math.ceil((this.cam.y + hh) / PITCH);
      const tiny = PITCH * z < 14;
      const hole = { x0: 40, x1: W - 40, y0: CY - this.gSize * 0.75, y1: CY + this.gSize * 1.15 };
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const x = i * PITCH + PITCH / 2, y = j * PITCH + PITCH / 2;
        if (x > hole.x0 && x < hole.x1 && y > hole.y0 && y < hole.y1 && square < 0.5) continue;
        const d = Math.hypot(x - W / 2, y - CY);
        const t0 = T_EVERY + Math.sqrt(d) / 85 + hash(i, j) * 0.12;
        if (t < t0) continue;
        const pop = clamp((t - t0) / 0.1);
        const hot = hash(i, j, 3) < 0.035;
        const blink = hot && hash(i, j, Math.floor(b * 4)) < 0.6;
        c.fillStyle = blink ? rgba('signal', 1) : rgba('bone', lerp(0.75, 0.1, square) * pop);
        if (square > 0) {
          const s = PITCH * lerp(0.45, 0.82, square);
          c.beginPath(); c.roundRect(x - s / 2, y - s / 2, s, s, s * 0.18); c.fill();
        } else if (tiny) c.fillRect(x - 6, y - 8, 12, 16);
        else person(c, x, y, PITCH * 0.62 * ease.outBack(pop));
      }
    }

    // ---- GOOGLE (its O's are rings: the lens) / IT!
    const gs = this.gSize;
    c.font = font(this.fam, gs);
    c.textBaseline = 'middle';
    const letters = 'GOOGLE'.split('');
    const ws = letters.map((l) => c.measureText(l).width);
    const total = ws.reduce((a, x) => a + x, 0);
    let x = W / 2 - total / 2;
    const ringR = gs * 0.33;
    letters.forEach((l, i) => {
      const cx = x + ws[i]! / 2;
      const ti = T_GOOGLE + i * 0.045;
      if (l === 'O' && (i === 1 || t >= ti)) {
        // the first O flies in from the lens (huge, from the previous plate's dive), the second pops
        const k = ease.outCubic(clamp((t - this.ctx.start) / (i === 1 ? 0.22 : 0.3)));
        const r = i === 1 ? lerp(2600, ringR, k) : ringR * ease.outBack(clamp((t - ti) / 0.14));
        const ox = i === 1 ? lerp(LENS.x, cx, k) : cx;
        c.strokeStyle = rgba('signal', 1);
        c.lineWidth = gs * 0.17;
        c.beginPath(); c.arc(ox, CY, Math.max(1, r), 0, Math.PI * 2); c.stroke();
      } else if (l !== 'O' && t >= ti) {
        const k = ease.outBack(clamp((t - ti) / 0.12));
        c.save(); c.translate(cx, CY); c.scale(lerp(1.8, 1, k), lerp(1.8, 1, k));
        c.globalAlpha = clamp((t - ti) / 0.04);
        c.fillStyle = rgba('bone', 1); c.textAlign = 'center';
        c.fillText(l, 0, 0); c.restore();
      }
      x += ws[i]!;
    });
    if (t >= T_IT) {
      const k = ease.outBack(clamp((t - T_IT) / 0.12));
      const s = fitSize('IT!', this.fam, 700, 600);
      c.save(); c.translate(W / 2, CY + gs * 0.5 + s * 0.48); c.scale(lerp(2.4, 1, k), lerp(2.4, 1, k));
      c.font = font(this.fam, s); c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgba('bone', 1); c.fillText('IT!', 0, 0); c.restore();
    }

    // ---- the result count, rolling through "Everybody"
    if (t >= T_EVERY - 0.1) {
      const k = ease.outExpo(clamp((t - T_EVERY) / (T_EVERY_END - T_EVERY)));
      const n = Math.round(8_100_000_000 * k / 1000) * 1000 + (k < 1 ? Math.floor(hash(Math.floor(t * 60)) * 999) : 0);
      c.save();
      c.font = font(F.mono(500), 34);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgba('ink', 0.9);
      const s = `About ${n.toLocaleString('en-US')} results (0.31 seconds)`;
      const w = c.measureText(s).width;
      c.fillRect(W / 2 - w / 2 - 18, CY - gs * 0.62 - 30, w + 36, 60);
      c.fillStyle = rgba('ash', 1);
      c.fillText(s, W / 2, CY - gs * 0.62);
      c.restore();
    }

    // "EVERYBODY" in wide italic, stamped across the crowd as it's sung
    if (t >= T_EVERY && t < T_EVERY_END + 0.9) {
      const k = ease.outBack(clamp((t - T_EVERY) / 0.15));
      const out = clamp((t - T_EVERY_END - 0.6) / 0.3);
      const fam = F.archivoItalic(125, 800);
      const s = fitSize('EVERYBODY', fam, 1000, 300) / z; // constant on screen while the camera pulls out
      const p = { x: this.cam.x, y: this.cam.y + 520 / z };
      c.save();
      c.translate(p.x, p.y); c.rotate(-0.08); c.scale(lerp(1.5, 1, k), lerp(1.5, 1, k));
      c.globalAlpha = (1 - out) * clamp((t - T_EVERY) / 0.05);
      c.font = font(fam, s); c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgba('ink', 0.85);
      const w = c.measureText('EVERYBODY').width;
      c.fillRect(-w / 2 - 20 / z, -s * 0.55, w + 40 / z, s * 1.1);
      c.fillStyle = rgba('signal', 1);
      c.fillText('EVERYBODY', 0, 0);
      c.restore();
    }

    const itHit = t >= T_IT ? Math.pow(0.5, (t - T_IT) / 0.07) : 0;
    const gHit = t >= T_GOOGLE ? Math.pow(0.5, (t - T_GOOGLE) / 0.07) : 0;
    return {
      fig: 'FIG. 2 — EVERYBODY',
      look: { grid: 0.6, glow: [W / 2, CY, 0.5 * gHit + 0.4 * f.a.kick], hot: 1.1 },
      post: { flash: 0.18 * itHit + 0.08 * gHit, zoom: 1 + 0.05 * itHit + 0.02 * f.a.kick, shake: [itHit * 10 * Math.sin(t * 97), itHit * 8 * Math.cos(t * 83)] as [number, number] },
    };
  }
}
