// QUERY — bar 11 ("…really?"). The pill is already there (the loop lands on it). A question is typed on the
// 16ths; autocomplete fans out on the 8ths, drifting from "be productive" to "stop asking ai"; "really?"
// lands in serif over it; on the last beat the cursor picks "google it", ⏎, and the camera dives into the
// magnifier: its ring becomes the first O of GOOGLE on the next plate.
import { type Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { F, font } from '../engine/type';
import { clamp, ease, lerp, smoothstep } from '../engine/util';
import { Plate, PILL, pill, caret, typed, W, H, lens } from './_short';

const Q = 'how do i be productive';
const SUGG = [
  'how do i be productive',
  'how do i be productive without ai',
  'how do i make ai do it for me',
  'how do i stop asking ai',
  'how do i google',
  'how do i google it',
];
export const LENS = { x: PILL.x - PILL.w / 2 + PILL.h * 0.55 - PILL.h * 0.2 * 0.15, y: PILL.y - PILL.h * 0.2 * 0.15, r: PILL.h * 0.2 };

export default class Query extends Plate {
  override camera(f: Frame) {
    const b = this.lb(f.t);
    const dive = ease.inExpo(clamp((b - 4.35) / 0.65));
    const z = lerp(1, 1.1, ease.inOutQuad(clamp(b / 4.3))) * Math.pow(9, dive);
    return { x: lerp(W / 2, LENS.x, dive ** 0.35), y: lerp(H / 2 - 40, LENS.y, dive ** 0.35), zoom: z, rot: 0.02 * Math.sin(b * 0.9) * (1 - dive) };
  }

  draw(c: CanvasRenderingContext2D, f: Frame) {
    const t = f.t, b = this.lb(t);
    // the question, two chars per 16th from beat 0.25
    const n = clamp((b - 0.25) * 8, 0, Q.length);
    const enter = b >= 4;
    pill(c, { glow: f.a.kick * 0.5 + (enter ? 0.9 * Math.pow(0.5, (b - 4) * 4) : 0) });
    const fs = 44;
    c.font = font(F.mono(400), fs);
    c.textBaseline = 'middle';
    c.fillStyle = rgba('bone', 0.95);
    const tx = PILL.x - PILL.w / 2 + PILL.h * 1.05;
    const q = enter ? 'how do i google it' : Q;
    const x1 = typed(c, q, enter ? q.length : n, tx, PILL.y + 2);
    caret(c, x1 + 4, PILL.y, 54, b, 'signal', n > 0 && n < Q.length);

    // autocomplete: a row per 8th from beat 2; the cursor walks down to "google it" on beat 3.5
    const rows = Math.floor(clamp((b - 1.5) * 2 + 1, 0, SUGG.length));
    const sel = b >= 3.5 ? SUGG.length - 1 : -1;
    const rh = 92, y0 = PILL.y + PILL.h / 2 + 18;
    if (rows > 0 && !enter) {
      const k = ease.outCubic(clamp((b - 1.5) * 3));
      c.save();
      c.fillStyle = rgba('ink2', 0.96);
      c.strokeStyle = rgba('bone', 0.18);
      c.lineWidth = 2;
      c.beginPath(); c.roundRect(PILL.x - PILL.w / 2, y0, PILL.w, (rows * rh + 24) * k, 28); c.fill(); c.stroke();
      c.font = font(F.mono(400), 34);
      for (let i = 0; i < rows; i++) {
        const y = y0 + 12 + rh * (i + 0.5);
        const pop = ease.outBack(clamp((b - (1.5 + i / 2)) * 5));
        c.save();
        c.globalAlpha = pop;
        c.translate(0, (1 - pop) * -20);
        if (i === sel) { c.fillStyle = rgba('signal', 0.22); c.fillRect(PILL.x - PILL.w / 2 + 6, y - rh / 2 + 4, PILL.w - 12, rh - 8); }
        lens(c, PILL.x - PILL.w / 2 + 64, y, 13, i === sel ? 'signal' : 'graphite', 3);
        const s = SUGG[i]!;
        c.fillStyle = rgba(i === sel ? 'signal' : 'ash', 1);
        // the typed prefix stays dim, the completion is bright (like the real thing)
        const pre = s.startsWith(Q) ? Q.length : 'how do i '.length;
        c.fillText(s.slice(0, pre), PILL.x - PILL.w / 2 + 112, y);
        const w0 = c.measureText(s.slice(0, pre)).width;
        c.fillStyle = rgba(i === sel ? 'ember' : 'bone', 1);
        c.font = font(F.mono(600), 34);
        c.fillText(s.slice(pre), PILL.x - PILL.w / 2 + 112 + w0, y);
        c.font = font(F.mono(400), 34);
        c.restore();
      }
      c.restore();
    }

    // "really?" — the sung word, in serif over the pill
    const tr = 28.14;
    if (t >= tr - 0.02) {
      const k = ease.outBack(clamp((t - tr) / 0.18));
      const out = smoothstep(4.2, 4.5, b);
      c.save();
      c.globalAlpha = clamp((t - tr) / 0.06) * (1 - out);
      c.translate(W / 2, PILL.y - 300);
      c.scale(lerp(1.6, 1, k), lerp(1.6, 1, k));
      c.rotate(-0.06);
      c.font = font(F.serif(400, true), 230);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgba('bone', 1);
      c.fillText('really?', 0, 0);
      c.restore();
    }

    // ⏎ key flash at beat 4
    if (enter) {
      const k = Math.pow(0.5, (b - 4) * 5);
      c.save();
      c.font = font(F.mono(500), 64);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = rgba('signal', clamp(k * 1.5));
      c.fillText('⏎', PILL.x + PILL.w / 2 - 80, PILL.y);
      c.restore();
    }
    const dive = clamp((b - 4.35) / 0.65);
    return {
      fig: 'FIG. 1 — THE QUERY', look: { grid: 1 - dive, glow: [LENS.x, LENS.y, enter ? 0.8 * Math.pow(0.5, (b - 4) * 3) : 0.25 * f.a.kick], zoomBlur: ease.inQuad(dive) * 0.9 },
      post: { flash: enter ? 0.35 * Math.pow(0.5, (b - 4) * 8) : 0, zoom: 1 + 0.025 * f.a.kick, shake: [0, 0] as [number, number] },
    };
  }
}

