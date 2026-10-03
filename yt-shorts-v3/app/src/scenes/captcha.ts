// CAPTCHA — bars 19-20 (instrumental). "I'm not a robot": the cursor travels in dead-straight robotic lines,
// ticks the box, and the challenge reads "select all squares with a HUMAN". It picks every robot instead,
// faster and faster (8ths, then 16ths), hits VERIFY on beat 6, and gets stamped VERIFIED HUMAN.
import { type Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { F, font } from '../engine/type';
import { clamp, ease, hash, lerp } from '../engine/util';
import { Plate, person, W, H } from './_short';

const PX = 90, PW_ = 900, TOP = 470, TS = 212, GAP = 11;
const GY = TOP + 250; // grid top
const HUMANS = new Set([2, 5, 11, 12]);
const ROBOTS = Array.from({ length: 16 }, (_, i) => i).filter((i) => !HUMANS.has(i));
const ORDER = ROBOTS.map((i, n) => ROBOTS[(n * 5) % ROBOTS.length]!); // a scattered (but deterministic) pick order

export default class Captcha extends Plate {
  clickBeat(n: number) { return n < 4 ? 2 + n * 0.5 : 4 + (n - 4) * 0.25; }
  tileC(i: number) { return { x: PX + 10 + (i % 4) * (TS + GAP) + TS / 2, y: GY + Math.floor(i / 4) * (TS + GAP) + TS / 2 }; }

  /** Cursor position at local beat b: snaps along straight lines to each target just before its click. */
  cursor(b: number) {
    const targets: { b: number; x: number; y: number }[] = [{ b: -0.5, x: W - 120, y: H - 260 }, { b: 1, x: PX + 90, y: TOP + 120 }];
    ORDER.forEach((ti, n) => { const p = this.tileC(ti); targets.push({ b: this.clickBeat(n), x: p.x + 30, y: p.y + 30 }); });
    targets.push({ b: 6, x: PX + PW_ - 150, y: GY + 4 * (TS + GAP) + 60 });
    targets.push({ b: 9, x: PX + PW_ - 150, y: GY + 4 * (TS + GAP) + 60 });
    let i = 0;
    while (i < targets.length - 2 && targets[i + 1]!.b <= b) i++;
    const a = targets[i]!, z = targets[i + 1]!;
    const k = ease.inOutQuart(clamp((b - a.b) / Math.max(0.05, Math.min(0.4, z.b - a.b) * 0.8)));
    return { x: lerp(a.x, z.x, k), y: lerp(a.y, z.y, k) };
  }

  override camera(f: Frame) {
    const b = this.lb(f.t);
    return { x: W / 2, y: H / 2 + 40, zoom: 1.02 + 0.03 * clamp((b - 4) / 2) + 0.02 * f.a.kick, rot: 0.01 * Math.sin(b) };
  }

  draw(c: CanvasRenderingContext2D, f: Frame) {
    const t = f.t, b = this.lb(t);
    const open = ease.outExpo(clamp((b - 1.2) / 0.4)); // checkbox -> challenge
    c.textBaseline = 'middle';
    // panel
    const ph = lerp(220, 250 + 4 * (TS + GAP) + 160, open);
    c.fillStyle = rgba('ink2', 0.97); c.strokeStyle = rgba('bone', 0.25); c.lineWidth = 2;
    c.beginPath(); c.roundRect(PX - 10, TOP - 10, PW_ + 20, ph, 18); c.fill(); c.stroke();
    if (open < 0.5) {
      // "I'm not a robot"
      const ticked = b >= 1;
      c.strokeStyle = rgba('bone', 0.7); c.lineWidth = 4;
      c.strokeRect(PX + 50, TOP + 70, 80, 80);
      if (ticked) {
        c.strokeStyle = rgba('signal', 1); c.lineWidth = 10; c.lineCap = 'round';
        const k = clamp((b - 1) * 6);
        c.beginPath(); c.moveTo(PX + 62, TOP + 112); c.lineTo(PX + 85, TOP + 135);
        c.lineTo(lerp(PX + 85, PX + 122, k), lerp(TOP + 135, TOP + 78, k)); c.stroke();
      }
      c.font = font(F.archivo(100, 500), 52); c.fillStyle = rgba('bone', 1);
      c.fillText("I'm not a robot", PX + 170, TOP + 112);
    } else {
      // header
      c.fillStyle = rgba('signal', 1); c.fillRect(PX, TOP, PW_, 210);
      c.fillStyle = rgba('ink', 1);
      c.font = font(F.archivo(100, 500), 40); c.fillText('Select all squares with', PX + 40, TOP + 60);
      c.font = font(F.archivo(125, 900), 84); c.fillText('A HUMAN', PX + 40, TOP + 140);
      // tiles
      for (let i = 0; i < 16; i++) {
        const p = this.tileC(i), n = ORDER.indexOf(i);
        const tc = n >= 0 ? this.bt(this.clickBeat(n)) : Infinity;
        const sel = t >= tc;
        const pop = sel ? Math.pow(0.5, (t - tc) / 0.08) : 0;
        const appear = ease.outBack(clamp((b - 1.3 - (i % 4 + Math.floor(i / 4)) * 0.06) * 4));
        if (appear <= 0) continue;
        c.save(); c.translate(p.x, p.y);
        const s = appear * (sel ? 0.86 : 1) * (1 - 0.1 * pop);
        c.scale(s, s);
        c.fillStyle = rgba(sel ? 'blood' : '#202024', 1);
        c.fillRect(-TS / 2, -TS / 2, TS, TS);
        // engraved hatch
        c.strokeStyle = rgba('bone', 0.06); c.lineWidth = 2;
        for (let k = -TS; k < TS; k += 14) { c.beginPath(); c.moveTo(k, -TS / 2); c.lineTo(k + TS / 2, TS / 2); c.stroke(); }
        c.fillStyle = rgba(sel ? 'ember' : 'bone', 0.9);
        if (HUMANS.has(i)) person(c, 0, 10, 120);
        else this.robot(c, hash(i));
        if (sel) {
          c.fillStyle = rgba('signal', 1); c.beginPath(); c.arc(-TS / 2 + 34, -TS / 2 + 34, 24, 0, Math.PI * 2); c.fill();
          c.strokeStyle = rgba('ink', 1); c.lineWidth = 6;
          c.beginPath(); c.moveTo(-TS / 2 + 22, -TS / 2 + 34); c.lineTo(-TS / 2 + 31, -TS / 2 + 44); c.lineTo(-TS / 2 + 47, -TS / 2 + 24); c.stroke();
        }
        c.restore();
      }
      // VERIFY
      const vy = GY + 4 * (TS + GAP) + 40, vp = t >= this.bt(6) ? Math.pow(0.5, (t - this.bt(6)) / 0.1) : 0;
      c.fillStyle = rgba(vp > 0.05 ? 'ember' : 'signal', 1);
      c.beginPath(); c.roundRect(PX + PW_ - 290, vy, 280, 90, 10); c.fill();
      c.font = font(F.archivo(125, 900), 40); c.fillStyle = rgba('ink', 1); c.textAlign = 'center';
      c.fillText('VERIFY', PX + PW_ - 150, vy + 47); c.textAlign = 'left';
    }

    // the cursor: an arrow with a tiny sparkle (it's the AI)
    const cp = this.cursor(b);
    c.save(); c.translate(cp.x, cp.y);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 64); c.lineTo(16, 50); c.lineTo(28, 76); c.lineTo(38, 71); c.lineTo(26, 46); c.lineTo(46, 46); c.closePath();
    c.fillStyle = rgba('bone', 1); c.fill(); c.strokeStyle = rgba('ink', 1); c.lineWidth = 3; c.stroke();
    c.fillStyle = rgba('ember', 1); c.font = font(F.archivo(100, 900), 30); c.fillText('✦', 40, 4);
    c.restore();

    // VERIFIED HUMAN stamp
    const tv = this.bt(6.5);
    if (t >= tv) {
      const k = ease.outBack(clamp((t - tv) / 0.12));
      c.save(); c.translate(W / 2, GY + 2 * (TS + GAP)); c.rotate(0.14); c.scale(lerp(2.4, 1, k), lerp(2.4, 1, k));
      c.font = font(F.archivo(125, 900), 108); c.textAlign = 'center';
      const w = c.measureText('HUMAN ✓').width;
      c.fillStyle = rgba('ink', 0.92); c.fillRect(-w / 2 - 40, -170, w + 80, 300);
      c.strokeStyle = rgba('signal', 1); c.lineWidth = 10; c.strokeRect(-w / 2 - 40, -170, w + 80, 300);
      c.fillStyle = rgba('signal', 1);
      c.font = font(F.mono(600), 44); c.fillText('VERIFIED', 0, -100);
      c.font = font(F.archivo(125, 900), 108); c.fillText('HUMAN ✓', 0, 30);
      c.restore();
    }

    let click = 0;
    ORDER.forEach((_, n) => { const tc = this.bt(this.clickBeat(n)); if (t >= tc) click = Math.max(click, Math.pow(0.5, (t - tc) / 0.06)); });
    const stamp = t >= tv ? Math.pow(0.5, (t - tv) / 0.08) : 0;
    return {
      fig: 'FIG. 6 — PROVE YOU ARE HUMAN',
      look: { grid: 0.5, glow: [cp.x, cp.y, 0.3 * click + 0.08], hot: 0.55 },
      post: { zoom: 1 + 0.015 * click + 0.05 * stamp, flash: 0.15 * stamp, shake: [stamp * 12 * Math.sin(t * 90), stamp * 9 * Math.cos(t * 75)] as [number, number] },
    };
  }

  robot(c: CanvasRenderingContext2D, h: number) {
    const w = 104 + h * 20;
    c.beginPath(); c.roundRect(-w / 2, -36, w, 92, 16); c.fill();
    c.fillRect(-4, -70, 8, 34);
    c.beginPath(); c.arc(0, -74, 10, 0, Math.PI * 2); c.fill();
    c.save(); c.fillStyle = rgba('ink', 1);
    c.beginPath(); c.arc(-w / 5, 2, 11, 0, Math.PI * 2); c.arc(w / 5, 2, 11, 0, Math.PI * 2); c.fill();
    c.fillRect(-w / 5, 30, (2 * w) / 5, 8);
    c.restore();
  }
}
