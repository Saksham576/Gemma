// Shared base for the "Google It!" Short's plates (vertical 1080x1920).
// A plate draws its UI world in Canvas2D under a camera (crisp at any zoom); one fullscreen pass lays it over
// a living background (ink or paper, dot grid in world space, a signal glow), boosts the orange so it blooms,
// and can radial-blur the frame for punch-ins. Screen-space sparks go into an additive LineBatch on top.
import type * as THREE from 'three';
import { Scene, type Frame, type PostOverrides } from '../engine/scene';
import { FSPass, Layer2D, W, H } from '../engine/gl';
import { LineBatch } from '../engine/lines';
import { rgba } from '../engine/palette';
import { F, font, fitSize } from '../engine/type';
import { clamp, ease, hash, lerp } from '../engine/util';

export { W, H };
/** The link blue of a results page (the one accent beside the reference's signal orange). */
export const LINK = '#8AB4F8';

export interface Cam { x: number; y: number; zoom: number; rot: number }
export interface Look {
  /** 0 ink background, 1 paper (light-mode page). */
  paper?: number;
  /** Dot-grid opacity (0..1). */
  grid?: number;
  /** Signal glow in world px: x, y, strength. */
  glow?: number[];
  /** Radial (zoom) blur amount toward the screen centre, 0..1. */
  zoomBlur?: number;
  /** Multiplier on the orange bloom boost (default 1). */
  hot?: number;
}

const FRAG = /* glsl */ `
uniform sampler2D ui; uniform vec2 res; uniform vec4 cam; uniform float t, paper, grid, zb, hot; uniform vec3 glow;
vec2 toWorld(vec2 p) { vec2 d = p - res * 0.5; d = rot2(-cam.w) * d; return cam.xy + d / cam.z; }
vec4 tap(vec2 p) {
  vec2 uv = vec2(p.x / res.x, 1.0 - p.y / res.y);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  vec4 c = texture(ui, uv);
  return vec4(c.rgb * c.a, c.a); // premultiplied, so blurred edges don't darken
}
void main() {
  vec2 p = vec2(vUv.x * res.x, (1.0 - vUv.y) * res.y);
  vec2 q = toWorld(p);
  // background: ink (or paper) with slow fbm mottling and a world-space dot grid
  float n = fbm(q * 0.0022 + vec2(0.0, t * 0.04), 3);
  vec3 ink = C_INK + C_INK2 * (0.55 + 0.5 * n);
  vec3 pap = C_BONE * (0.93 + 0.05 * n);
  vec3 col = mix(ink, pap, paper);
  vec2 g = mod(q + 24.0, 48.0) - 24.0;
  float dotm = smoothstep(2.2, 0.8, length(g) * cam.z);
  // zoomed far out the dots would merge into a grey wall: fade them with the zoom
  col = mix(col, mix(C_GRAPHITE * 0.9, C_ASH * 0.55, paper), dotm * grid * 0.5 * smoothstep(0.3, 0.75, cam.z));
  col += C_SIGNAL * glow.z * exp(-length(q - glow.xy) / 300.0) * mix(0.55, 0.25, paper);
  // the UI layer, radially blurred toward the centre on punch-ins
  vec4 u = tap(p);
  if (zb > 0.001) {
    vec4 s = u; float wsum = 1.0;
    for (int i = 1; i <= 12; i++) {
      float k = float(i) / 12.0;
      vec2 pp = mix(p, res * 0.5, k * zb * 0.22);
      float w = 1.0 - k * 0.6;
      s += tap(pp) * w; wsum += w;
    }
    u = s / wsum;
  }
  vec3 uc = u.a > 1e-4 ? u.rgb / u.a : vec3(0.0);
  // orange glows: saturated warm pixels go HDR so the bloom picks them up
  float warm = sat((uc.r - uc.b) * 1.6) * sat(uc.r * 1.4 - 0.2);
  uc *= 1.0 + hot * warm * 2.6;
  // blend in sRGB like Canvas2D does: in linear light a 2% white square on black reads as mid grey
  col = toLinear(mix(toSRGB(max(col, 0.0)), toSRGB(uc), u.a));
  fragColor = vec4(col, 1.0);
}`;

export abstract class Plate extends Scene {
  ui = new Layer2D();
  fx = new LineBatch(8000, { blend: 'add' });
  pass!: FSPass;
  cam: Cam = { x: W / 2, y: H / 2, zoom: 1, rot: 0 };
  /** Beat index (continuous) at the plate's start. */
  b0 = 0;

  override init() {
    this.pass = new FSPass(FRAG, {
      ui: { value: this.ui.texture }, res: { value: [W, H] }, cam: { value: [W / 2, H / 2, 1, 0] }, t: { value: 0 },
      paper: { value: 0 }, grid: { value: 1 }, zb: { value: 0 }, hot: { value: 1 }, glow: { value: [0, 0, 0] },
    });
    this.b0 = this.ctx.audio.beatAt(this.ctx.start);
    return this.setup();
  }
  setup(): void | Promise<void> {}

  /** The camera for this frame (world px). */
  camera(_f: Frame): Cam { return { x: W / 2, y: H / 2, zoom: 1, rot: 0 }; }
  /** Draw the world (camera transform already applied). Return the look and post overrides. */
  abstract draw(c: CanvasRenderingContext2D, f: Frame): { look?: Look; post?: PostOverrides; fig?: string } | void;

  /** Song time of local beat i (0 = the plate's first beat). */
  bt(i: number) { return this.ctx.audio.timeOfBeat(this.b0 + i); }
  /** Local beat position (continuous) at song time t. */
  lb(t: number) { return this.ctx.audio.beatAt(t) - this.b0; }
  /** Onsets of a kind inside this plate. */
  hits(kind: string, minStrength = 0) { return this.ctx.audio.events(kind, this.ctx.start, this.ctx.end).filter(([, s]) => s >= minStrength); }
  /** Reset to the camera transform (after drawing in screen space). */
  world(c: CanvasRenderingContext2D) {
    const k = this.cam;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.translate(W / 2, H / 2); c.rotate(-k.rot); c.scale(k.zoom, k.zoom); c.translate(-k.x, -k.y);
  }
  screen(c: CanvasRenderingContext2D) { c.setTransform(1, 0, 0, 1, 0, 0); }
  /** World point -> screen px (for screen-space sparks). */
  toScreen(x: number, y: number) {
    const k = this.cam, dx = (x - k.x) * k.zoom, dy = (y - k.y) * k.zoom, cs = Math.cos(-k.rot), sn = Math.sin(-k.rot);
    return { x: W / 2 + dx * cs - dy * sn, y: H / 2 + dx * sn + dy * cs };
  }

  /** The plate's figure caption, top-left in screen space (above the Shorts title overlay), and a beat ticker. */
  caption(c: CanvasRenderingContext2D, f: Frame, text: string, paper: number) {
    this.screen(c);
    const a = clamp((f.t - this.ctx.start) / 0.15);
    const ink = paper > 0.5;
    c.save();
    c.globalAlpha = a;
    c.font = font(F.mono(500), 22);
    c.letterSpacing = '4px';
    c.textBaseline = 'alphabetic';
    c.fillStyle = rgba(ink ? 'blood' : 'signal', 1);
    const n = Math.floor(text.length * clamp((f.t - this.ctx.start) / 0.35));
    c.fillText(text.slice(0, n), 64, 190);
    // beat ticker: four ticks, the current beat lit
    const bi = Math.floor(f.beat + 1e-4) % 4;
    for (let i = 0; i < 4; i++) {
      c.fillStyle = i === bi ? rgba(ink ? 'blood' : 'signal', 1) : rgba(ink ? 'ink' : 'bone', 0.25);
      c.fillRect(W - 64 - (4 - i) * 26, 172, 18, 18);
    }
    c.restore();
    this.world(c);
  }

  render(f: Frame, out: THREE.WebGLRenderTarget): PostOverrides | void {
    this.cam = this.camera(f);
    this.ui.clear();
    this.fx.clear();
    const c = this.ui.ctx;
    this.world(c);
    const r = this.draw(c, f) ?? {};
    if (r.fig) this.caption(c, f, r.fig, r.look?.paper ?? 0);
    this.ui.upload();
    const L = r.look ?? {}, k = this.cam, u = this.pass.u;
    u.cam!.value = [k.x, k.y, k.zoom, k.rot];
    u.t!.value = f.t; u.paper!.value = L.paper ?? 0; u.grid!.value = L.grid ?? 1; u.zb!.value = L.zoomBlur ?? 0; u.hot!.value = L.hot ?? 1;
    u.glow!.value = L.glow ?? [0, 0, 0];
    this.pass.render(this.ctx.renderer, out);
    if (this.fx.count) this.fx.render(this.ctx.renderer, out);
    // bloom threshold above bone white: only the boosted orange glows (white type would haze the whole frame)
    // plates give flashes as perceived (sRGB) amounts; the engine adds them in linear light
    const post = { ...(r.post ?? {}) };
    if (post.flash) post.flash = Math.pow(clamp(post.flash), 2.2);
    return { hud: 0, grain: 0.06, ca: 1.6, vignette: 0.4, bloomThreshold: 1.05, paper: L.paper ?? 0, ...post };
  }
}

// ------------------------------------------------------------------ shared drawing

export function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}

/** The search pill: the Short's recurring object. Centre (x, y), width w; `draw` 0..1 strokes its outline on. */
export const PILL = { x: W / 2, y: 820, w: 900, h: 132 };
export function pill(c: CanvasRenderingContext2D, o: { x?: number; y?: number; w?: number; h?: number; draw?: number; ink?: boolean; glow?: number } = {}) {
  const x = o.x ?? PILL.x, y = o.y ?? PILL.y, w = o.w ?? PILL.w, h = o.h ?? PILL.h, k = o.draw ?? 1;
  c.save();
  roundRect(c, x - w / 2, y - h / 2, w, h, h / 2);
  c.fillStyle = o.ink ? rgba('#ffffff', 1) : rgba('ink2', 0.92);
  if (k >= 1) c.fill();
  c.lineWidth = 3;
  c.strokeStyle = o.ink ? rgba('graphite', 0.5) : rgba('bone', 0.55);
  const per = 2 * (w - h) + Math.PI * h;
  c.setLineDash([per * k, per]);
  c.stroke();
  if ((o.glow ?? 0) > 0) { c.strokeStyle = rgba('signal', clamp(o.glow!)); c.lineWidth = 5; c.stroke(); }
  c.restore();
  // magnifier
  lens(c, x - w / 2 + h * 0.55, y, h * 0.2, o.ink ? 'graphite' : 'ash', 4, k);
}

/** A magnifier: ring centre (x, y), radius r; the handle points down-right. */
export function lens(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, lw = 4, k = 1) {
  c.save();
  c.strokeStyle = rgba(col, clamp(k * 2));
  c.lineWidth = lw;
  c.lineCap = 'round';
  c.beginPath(); c.arc(x - r * 0.15, y - r * 0.15, r, 0, Math.PI * 2 * clamp(k)); c.stroke();
  if (k > 0.5) {
    const a = Math.PI / 4, r0 = r * 0.85, r1 = r * 1.75;
    c.beginPath(); c.moveTo(x - r * 0.15 + Math.cos(a) * r0, y - r * 0.15 + Math.sin(a) * r0);
    c.lineTo(x - r * 0.15 + Math.cos(a) * r1, y - r * 0.15 + Math.sin(a) * r1); c.stroke();
  }
  c.restore();
}

/** Blinking text caret (on for the first half of each beat). */
export function caret(c: CanvasRenderingContext2D, x: number, y: number, h: number, beat: number, col = 'signal', force = false) {
  if (!force && beat - Math.floor(beat) > 0.5) return;
  c.fillStyle = rgba(col, 1);
  c.fillRect(x, y - h / 2, 5, h);
}

/** Text typed character-wise: `n` chars of `s` (fractional n shows nothing extra). Returns the end x. */
export function typed(c: CanvasRenderingContext2D, s: string, n: number, x: number, y: number) {
  const shown = s.slice(0, Math.max(0, Math.floor(n)));
  c.fillText(shown, x, y);
  return x + c.measureText(shown).width;
}

/**
 * A lyric slam: text scales from `big` to 1 with an overshoot over ~0.12 s after t0, centred at (x, y).
 * Fits `maxW`. Returns the drawn size.
 */
export function slam(c: CanvasRenderingContext2D, text: string, t: number, t0: number, x: number, y: number, o: { fam?: string; maxW?: number; size?: number; col?: string; big?: number; out?: number; italic?: boolean } = {}) {
  if (t < t0) return 0;
  const fam = o.fam ?? F.archivo(125, 900);
  const size = o.size ?? fitSize(text, fam, o.maxW ?? 960, 520);
  const k = clamp((t - t0) / 0.13);
  const s = lerp(o.big ?? 2.2, 1, ease.outBack(k));
  const a = clamp((t - t0) / 0.05) * (o.out != null ? 1 - clamp((t - o.out) / 0.12) : 1);
  if (a <= 0) return size;
  c.save();
  c.translate(x, y); c.scale(s, s);
  c.globalAlpha *= a;
  c.font = font(fam, size);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = rgba(o.col ?? 'bone', 1);
  c.fillText(text, 0, 0);
  c.restore();
  return size;
}

/** A tiny person glyph (head + shoulders), centred at (x, y), height h. */
export function person(c: CanvasRenderingContext2D, x: number, y: number, h: number) {
  c.beginPath();
  c.arc(x, y - h * 0.22, h * 0.2, 0, Math.PI * 2);
  c.moveTo(x - h * 0.36, y + h * 0.5);
  c.ellipse(x, y + h * 0.5, h * 0.36, h * 0.42, 0, Math.PI, 0);
  c.fill();
}

/** Decaying pulse from the most recent of `times` before t (1 at the hit). */
export function pulseFrom(times: number[], t: number, hl = 0.1) {
  let v = 0;
  for (const x of times) if (x <= t) v = Math.max(v, Math.pow(0.5, (t - x) / hl));
  return v;
}

/** Deterministic pick from a list. */
export const pick = <T,>(xs: T[], ...k: number[]) => xs[Math.floor(hash(...k) * xs.length) % xs.length]!;
