// COUCH — "Are you stuck on the couch? / What's the capital of Norway?". Out of the meteor's flash the pill
// redraws itself; the questions are typed word by word as they're sung (and echoed big in serif above),
// the first one select-all-deleted on the beat. The last beat clears the pill: the loop lands on the query
// plate's opening frame.
import { type Frame } from '../engine/scene';
import { rgba } from '../engine/palette';
import { F, font } from '../engine/type';
import { Lyrics, type Line } from '../engine/lyrics';
import { clamp, ease, lerp } from '../engine/util';
import { Plate, PILL, pill, caret, lens, W, H } from './_short';

export default class Couch extends Plate {
  q1!: Line; q2!: Line;
  override setup() {
    this.q1 = this.ctx.lyrics.get('stuck on the couch');
    this.q2 = this.ctx.lyrics.get('capital of Norway');
  }

  override camera(f: Frame) {
    const b = this.lb(f.t);
    return { x: W / 2, y: H / 2 - 40 + 40 * ease.inOutCubic(clamp((b - 7.4) / 0.6)), zoom: lerp(1.08, 1, ease.inOutCubic(clamp((b - 7.2) / 0.8))) + 0.015 * f.a.kick, rot: 0.015 * Math.sin(b * 0.8) * (1 - clamp((b - 7) / 1)) };
  }

  draw(c: CanvasRenderingContext2D, f: Frame) {
    const t = f.t, b = this.lb(t);
    const line = t < this.q2.words[0]!.start - 0.1 ? this.q1 : this.q2;
    const chars = Lyrics.lineCharProgress(line, t);
    const sel1 = b >= 3.5 && line === this.q1, gone1 = b >= 4 && line === this.q1;
    const clear = b >= 7.5;
    pill(c, { draw: ease.outCubic(clamp(b / 0.5)) });
    // pill text
    c.font = font(F.mono(400), 40); c.textBaseline = 'middle';
    const txt = (gone1 || clear) ? '' : line.text.toLowerCase().slice(0, Math.floor(chars));
    const tx = PILL.x - PILL.w / 2 + PILL.h * 1.05;
    if (sel1 && !gone1 || (b >= 7.25 && !clear)) { c.fillStyle = rgba('signal', 0.4); c.fillRect(tx - 4, PILL.y - 30, c.measureText(txt).width + 8, 60); }
    c.fillStyle = rgba('bone', 0.95); c.fillText(txt, tx, PILL.y + 2);
    caret(c, tx + c.measureText(txt).width + 4, PILL.y, 54, b, 'signal', chars > 0 && chars < line.text.length && !gone1);

    // big serif echo of the line above the pill, word by word
    if (!clear) {
      const ws = line.words;
      c.save();
      c.font = font(F.serif(400, true), 118); c.textAlign = 'left';
      const lines: string[][] = [[]]; let w = 0;
      ws.forEach((wd) => { const ww = c.measureText(wd.w + ' ').width; if (w + ww > 920 && w > 0) { lines.push([]); w = 0; } lines[lines.length - 1]!.push(wd.w); w += ww; });
      let gi = 0;
      lines.forEach((ln, li) => {
        let x = 80;
        ln.forEach((s) => {
          const wd = ws[gi++]!;
          if (t >= wd.start - 0.02) {
            const k = ease.outBack(clamp((t - wd.start) / 0.15));
            const fade = line === this.q1 ? 1 - clamp((b - 3.6) * 3) : 1 - clamp((b - 7.2) * 3);
            c.save(); c.globalAlpha = clamp((t - wd.start) / 0.05) * fade;
            c.translate(x, 400 + li * 130 + (1 - k) * 30);
            c.fillStyle = rgba(/couch|norway/i.test(s) ? 'signal' : 'bone', 1);
            c.fillText(s, 0, 0); c.restore();
          }
          x += c.measureText(s + ' ').width;
        });
      });
      c.restore();
    }

    // suggestion under the pill on the second question: the answer, which nobody needed to google
    if (line === this.q2 && b >= 6.75 && !clear) {
      const k = ease.outBack(clamp((b - 6.75) * 4));
      const y0 = PILL.y + PILL.h / 2 + 18;
      c.save(); c.globalAlpha = k;
      c.fillStyle = rgba('ink2', 0.96); c.strokeStyle = rgba('bone', 0.18); c.lineWidth = 2;
      c.beginPath(); c.roundRect(PILL.x - PILL.w / 2, y0, PILL.w, 110 * k, 28); c.fill(); c.stroke();
      lens(c, PILL.x - PILL.w / 2 + 64, y0 + 55, 13, 'signal', 3);
      c.font = font(F.mono(600), 38); c.fillStyle = rgba('ember', 1); c.fillText('oslo', PILL.x - PILL.w / 2 + 112, y0 + 57);
      c.font = font(F.mono(400), 30); c.fillStyle = rgba('ash', 1); c.fillText('— you knew that', PILL.x - PILL.w / 2 + 230, y0 + 57);
      c.restore();
    }

    // a line-drawn couch with someone sinking into it (first question), a Nordic cross (second)
    c.save();
    c.strokeStyle = rgba('bone', 0.6); c.lineWidth = 6; c.lineJoin = 'round';
    const cy = 1240;
    if (line === this.q1) {
      const a = clamp((t - this.q1.words[0]!.start) * 3) * (1 - clamp((b - 3.6) * 3));
      c.globalAlpha = a;
      const sink = 30 * ease.outCubic(clamp((t - this.q1.start) / 1.2));
      c.beginPath(); c.roundRect(W / 2 - 300, cy - 150, 600, 150, 30); c.stroke();
      c.beginPath(); c.roundRect(W / 2 - 360, cy - 90, 80, 160, 30); c.roundRect(W / 2 + 280, cy - 90, 80, 160, 30); c.stroke();
      c.beginPath(); c.roundRect(W / 2 - 290, cy, 580, 70, 16); c.stroke();
      c.fillStyle = rgba('bone', 0.85);
      c.beginPath(); c.arc(W / 2, cy - 70 + sink, 38, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(W / 2, cy + 20 + sink * 0.5, 70, 60, 0, Math.PI, 0); c.fill();
      c.fillStyle = rgba('signal', 0.9); c.fillRect(W / 2 + 40, cy - 20 + sink, 30, 46); // phone
    } else if (!clear) {
      const a = clamp((t - this.q2.words[0]!.start) * 3) * (1 - clamp((b - 7.2) * 3));
      c.globalAlpha = a; c.strokeStyle = rgba('signal', 0.9); c.lineWidth = 8;
      const fw = 520, fh = 380, x0 = W / 2 - fw / 2, y0 = cy - 220;
      const d = clamp((t - this.q2.words[3]!.start) / 0.6); // drawn on "capital"
      c.setLineDash([2400 * d, 2400]);
      c.strokeRect(x0, y0, fw, fh);
      c.beginPath(); c.moveTo(x0 + fw * 0.33, y0); c.lineTo(x0 + fw * 0.33, y0 + fh); c.moveTo(x0, y0 + fh / 2); c.lineTo(x0 + fw, y0 + fh / 2); c.stroke();
    }
    c.restore();

    const inFlash = Math.pow(0.5, (t - this.ctx.start) / 0.09);
    return {
      fig: 'FIG. 8 — THE NEXT QUESTION',
      look: { grid: 0.4 + 0.6 * clamp((b - 7) / 1), glow: [W / 2, PILL.y, 0.2 * f.a.kick + 1.4 * inFlash] },
      post: { flash: 0.8 * inFlash, shake: [inFlash * 16 * Math.sin(t * 90), inFlash * 12 * Math.cos(t * 70)] as [number, number], zoom: 1 + 0.06 * inFlash },
    };
  }
}
