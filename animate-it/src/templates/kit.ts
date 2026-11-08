/**
 * Recipe kit — the authoring API for templates.
 *
 * A Recipe is a responsive factory: given a format (size), a palette, a font
 * pair and copy, it returns layers. One recipe × several variants = several
 * gallery templates, and every template can be re-rendered in any format or
 * brand kit ("magic resize" and "see it in your brand").
 */
import type {
  Anim,
  Ease,
  EllipseLayer,
  GroupLayer,
  ImageLayer,
  Layer,
  LinearGradient,
  Paint,
  PathLayer,
  RadialGradient,
  RectLayer,
  TextAnim,
  TextLayer,
  TextUnitState,
} from '../engine/types';
import { k, rng } from '../engine/anim';
import type { CategoryId, FontPair, FormatId, Palette } from './catalog';
import type { ArtKind } from './art';

export { k, rng };
export { alpha, shade, lerpColor, readableOn } from '../engine/color';

// ---------------------------------------------------------------- recipe types

export interface Field {
  key: string;
  label: string;
  default: string;
  multiline?: boolean;
}

export interface ImageSlot {
  key: string;
  label: string;
  art: ArtKind;
}

export interface Variant {
  name: string;
  palette: string;
  fonts: string;
  copy?: Record<string, string>;
  format?: FormatId;
  /** Sample logo id (see SAMPLE_LOGOS) for logo-driven templates. */
  logo?: string;
  seed?: number;
}

export interface BuildResult {
  layers: Layer[];
  background?: Paint;
  duration?: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: CategoryId;
  tags: string[];
  description?: string;
  /** Seconds at speed 1. */
  duration: number;
  /** Supported formats. Default: square, portrait, story, landscape. */
  formats?: FormatId[];
  defaultFormat?: FormatId;
  /** Carousel recipes: number of slides (scene width = slides × 1080). */
  slides?: number;
  fields: Field[];
  images?: ImageSlot[];
  usesLogo?: boolean;
  variants: Variant[];
  build: (x: Ctx) => BuildResult;
}

export interface Ctx {
  W: number;
  H: number;
  /** 1% of the shorter side. Size everything in `u` so layouts scale. */
  u: number;
  cx: number;
  cy: number;
  format: FormatId;
  /** W / H */
  aspect: number;
  isSquare: boolean;
  isPortrait: boolean; // 4:5
  isStory: boolean; // 9:16
  isLandscape: boolean; // 16:9
  /** Tall = portrait or story. */
  tall: boolean;
  /** Carousel: slide count and width (1 / W for other formats). */
  slides: number;
  slideW: number;
  p: Palette;
  f: FontPair;
  /** Copy, keyed by field key (defaults already applied). */
  c: Record<string, string>;
  logoSrc: string;
  /** True for built-in single-colour sample marks (tint them); false for user uploads. */
  logoTint: boolean;
  /** Image slot sources, in the order of `recipe.images`. */
  img: string[];
  seed: number;
  rand: () => number;
  /** Choose a value per format. */
  pick<T>(o: { square?: T; portrait?: T; story?: T; landscape?: T; carousel?: T; default: T }): T;
  /** Display-font text (headlines). `size` is in scene px; displayScale is applied. */
  title(id: string, text: string, o: TextOpts): TextLayer;
  /** Body-font text. */
  body(id: string, text: string, o: TextOpts): TextLayer;
  /** The logo as an image layer (tinted to `color` when it is a sample mark). */
  logo(id: string, o: LayerOpts & { size: number; color?: string }): ImageLayer;
  /** Linear gradient from bg → bg2 (or custom). */
  grad(angle?: number, a?: string, b?: string): LinearGradient;
}

export type LayerOpts = Partial<Omit<RectLayer, 'type' | 'id'>> & Record<string, unknown>;
export type TextOpts = Partial<Omit<TextLayer, 'type' | 'id' | 'text' | 'size'>> & { size: Anim<number> };

// ---------------------------------------------------------------- layer builders

export function rect(id: string, o: Partial<Omit<RectLayer, 'type' | 'id'>>): RectLayer {
  return { type: 'rect', id, ...o };
}

export function ellipse(id: string, o: Partial<Omit<EllipseLayer, 'type' | 'id'>>): EllipseLayer {
  return { type: 'ellipse', id, ...o };
}

export function circle(id: string, r: Anim<number> | number, o: Partial<Omit<EllipseLayer, 'type' | 'id'>>): EllipseLayer {
  const d = typeof r === 'number' ? r * 2 : r.map((f) => ({ ...f, v: f.v * 2 }));
  return { type: 'ellipse', id, w: d, h: d, ...o };
}

export function group(id: string, children: Layer[], o: Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>> = {}): GroupLayer {
  return { type: 'group', id, children, ...o };
}

export function image(id: string, src: string, o: Partial<Omit<ImageLayer, 'type' | 'id' | 'src'>>): ImageLayer {
  return { type: 'image', id, src, fit: 'cover', ...o };
}

export function path(id: string, d: string, vw: number, vh: number, o: Partial<Omit<PathLayer, 'type' | 'id' | 'd' | 'vw' | 'vh'>>): PathLayer {
  return { type: 'path', id, d, vw, vh, ...o };
}

export function text(id: string, s: string, o: Partial<Omit<TextLayer, 'type' | 'id' | 'text'>> & { font: string; size: Anim<number> }): TextLayer {
  return { type: 'text', id, text: s, ...o };
}

// ---------------------------------------------------------------- paints

export const linear = (angle: number, ...stops: string[]): LinearGradient => ({
  kind: 'linear',
  angle,
  stops: stops.map((c, i) => ({ o: stops.length === 1 ? 0 : i / (stops.length - 1), c })),
});

export const radial = (cx: number, cy: number, r: number, ...stops: string[]): RadialGradient => ({
  kind: 'radial',
  cx,
  cy,
  r,
  stops: stops.map((c, i) => ({ o: stops.length === 1 ? 0 : i / (stops.length - 1), c })),
});

// ---------------------------------------------------------------- tracks

/** Fade 0 → 1. */
export const fadeIn = (t0: number, d = 0.5, e: Ease = 'outCubic') => k<number>([t0, 0], [t0 + d, 1, e]);
/** Fade 1 → 0. */
export const fadeOut = (t0: number, d = 0.4, e: Ease = 'inCubic') => k<number>([t0, 1], [t0 + d, 0, e]);
/** Fade in at t0, out at t1. */
export const fadeInOut = (t0: number, t1: number, d = 0.4) =>
  k<number>([t0, 0], [t0 + d, 1, 'outCubic'], [t1, 1], [t1 + d, 0, 'inCubic']);
/** Animate a → b. */
export const tween = (a: number, b: number, t0: number, d: number, e: Ease = 'outExpo') => k<number>([t0, a], [t0 + d, b, e]);
/** Scale pop 0 → 1. */
export const pop = (t0: number, d = 0.6, e: Ease = 'outBack') => k<number>([t0, 0], [t0 + d, 1, e]);
/** Linear loop a → b over [t0, t1] (for ambient motion). */
export const drift = (a: number, b: number, t0: number, t1: number) => k<number>([t0, a], [t1, b, 'linear']);
/** Multi-stop helper: seq(v0, [t1, v1, ease?], [t2, v2, ease?] …) with v0 at time 0. */
export function seq(v0: number, ...rest: [number, number, Ease?][]) {
  return k<number>([0, v0], ...rest);
}
/**
 * Smooth sine oscillation for loops: base ± amp, `cycles` full periods over `dur`.
 * Densely sampled with linear segments so velocity never stalls between keyframes.
 */
export function bob(base: number, amp: number, dur: number, cycles = 1, phase = 0) {
  const steps = Math.max(12, Math.round(cycles * 24));
  const frames: [number, number, Ease?][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * dur;
    const v = base + amp * Math.sin(phase + (i / steps) * cycles * Math.PI * 2);
    frames.push([t, v, 'linear']);
  }
  return k<number>(...frames);
}

// ---------------------------------------------------------------- text animation presets

type TA = (start: number, o?: Partial<TextAnim> & { exit?: number }) => TextAnim;

function withExit(a: TextAnim, exit: number | undefined, to: TextUnitState): TextAnim {
  if (exit === undefined) return a;
  return { ...a, out: { start: exit, dur: a.dur * 0.7, stagger: a.stagger * 0.6, ease: 'inCubic', to } };
}

export const ta: Record<string, TA> = {
  /** Words rise from behind a line mask. */
  rise: (start, o = {}) =>
    withExit({ by: 'word', start, dur: 0.8, stagger: 0.07, ease: 'outExpo', from: { y: 1.1 }, mask: true, ...o }, o.exit, { y: -1.1 }),
  /** Lines rise from behind a mask. */
  riseLines: (start, o = {}) =>
    withExit({ by: 'line', start, dur: 0.9, stagger: 0.12, ease: 'outExpo', from: { y: 1.1 }, mask: true, ...o }, o.exit, { y: -1.1 }),
  /** Characters fade & lift. */
  chars: (start, o = {}) =>
    withExit({ by: 'char', start, dur: 0.6, stagger: 0.025, ease: 'outCubic', from: { y: 0.35, opacity: 0 }, ...o }, o.exit, { y: -0.35, opacity: 0 }),
  /** Words de-blur in. */
  blur: (start, o = {}) =>
    withExit({ by: 'word', start, dur: 0.9, stagger: 0.08, ease: 'outCubic', from: { opacity: 0, blur: 14, scale: 1.08 }, ...o }, o.exit, { opacity: 0, blur: 14 }),
  /** Characters pop with overshoot. */
  pop: (start, o = {}) =>
    withExit({ by: 'char', start, dur: 0.55, stagger: 0.03, ease: 'outBack', from: { scale: 0, opacity: 0 }, ...o }, o.exit, { scale: 0, opacity: 0 }),
  /** Words slide in from the left. */
  slide: (start, o = {}) =>
    withExit({ by: 'word', start, dur: 0.7, stagger: 0.06, ease: 'outExpo', from: { x: -0.6, opacity: 0 }, ...o }, o.exit, { x: 0.6, opacity: 0 }),
  /** Characters drop with a bounce. */
  drop: (start, o = {}) =>
    withExit({ by: 'char', start, dur: 0.8, stagger: 0.035, ease: 'outBounce', from: { y: -1.2, opacity: 0 }, ...o }, o.exit, { y: 1, opacity: 0 }),
  /** Typewriter. */
  type: (start, o = {}) =>
    withExit({ by: 'char', start, dur: 0.01, stagger: 0.045, ease: 'linear', from: { opacity: 0 }, ...o }, o.exit, { opacity: 0 }),
  /** Characters flip in with rotation. */
  flip: (start, o = {}) =>
    withExit({ by: 'char', start, dur: 0.7, stagger: 0.03, ease: 'outBack', from: { rotation: -70, y: 0.5, opacity: 0 }, ...o }, o.exit, { rotation: 60, opacity: 0 }),
  /** Words scale up from small. */
  zoom: (start, o = {}) =>
    withExit({ by: 'word', start, dur: 0.7, stagger: 0.09, ease: 'outExpo', from: { scale: 0.4, opacity: 0 }, ...o }, o.exit, { scale: 1.6, opacity: 0 }),
  /** Characters spread in from the centre. */
  center: (start, o = {}) =>
    withExit({ by: 'char', start, dur: 0.7, stagger: 0.035, ease: 'outExpo', from: { y: 0.6, opacity: 0, blur: 6 }, order: 'center', ...o }, o.exit, { opacity: 0, blur: 6 }),
};

// ---------------------------------------------------------------- shapes (path data)

/** Regular star in a 100×100 box. */
export function starPath(points = 5, inner = 0.45): string {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 50 : 50 * inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    d += `${i === 0 ? 'M' : 'L'}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
}

/** Regular polygon in a 100×100 box. */
export function polygonPath(sides = 6): string {
  let d = '';
  for (let i = 0; i < sides; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
    d += `${i === 0 ? 'M' : 'L'}${(50 + 50 * Math.cos(a)).toFixed(2)} ${(50 + 50 * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
}

/** Organic blob in a 100×100 box. */
export function blobPath(seed = 1, points = 7, wobble = 0.22): string {
  const r = rng(seed);
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const rad = 50 * (1 - wobble + r() * wobble);
    return [50 + rad * Math.cos(a), 50 + rad * Math.sin(a)];
  });
  let d = '';
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    if (i === 0) d += `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)} `;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `;
  }
  return d + 'Z';
}

/** Simple 24×24 icon paths (stroke-based, round caps). */
export const ICONS: Record<string, string> = {
  heart: 'M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.3 4.5 6.9 4.5c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.6 0 5.5 3.5 4.2 6.8C19.5 15.9 12 20.5 12 20.5z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  check: 'M4.5 12.5l5 5 10-11',
  plus: 'M12 5v14M5 12h14',
  arrowRight: 'M4 12h15M13 6l6 6-6 6',
  play: 'M8 5.5v13l10.5-6.5z',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  bolt: 'M13 2.5L5 13.5h6l-1 8 8-11h-6z',
  chat: 'M4 5.5h16v10H9l-5 4z',
  cart: 'M3 4h2.5l2.2 10.5h10.6L20.5 7H6.6M9.5 19.5a1 1 0 1 0 0 .01M17 19.5a1 1 0 1 0 0 .01',
  thumb: 'M7 10.5v9H4v-9zM7 10.5l4-7c1.6 0 2.5 1.2 2 2.8l-1 3.2h6.2c1.3 0 2.2 1.2 1.9 2.4l-1.6 6.2c-.3 1-1.1 1.4-2 1.4H7',
  sparkle: 'M12 3c.8 4.6 2.4 6.2 7 7-4.6.8-6.2 2.4-7 7-.8-4.6-2.4-6.2-7-7 4.6-.8 6.2-2.4 7-7z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5l5 5',
  share: 'M18 8a3 3 0 1 0 0-.01M6 15a3 3 0 1 0 0-.01M18 22a3 3 0 1 0 0-.01M8.6 13.5l6.8 3.9M15.4 6.6l-6.8 3.9',
  bookmark: 'M6 3.5h12v17l-6-4-6 4z',
  send: 'M21 3L10 14M21 3l-7 18-4-7-7-4z',
  calendar: 'M4 6.5h16v14H4zM4 10.5h16M8.5 3.5v5M15.5 3.5v5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  gift: 'M4 10h16v10.5H4zM3 6.5h18V10H3zM12 6.5v14M12 6.5C10 2 6 3 7.5 6.5M12 6.5c2-4.5 6-3.5 4.5 0',
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0zM7 6H4c0 3 1.5 4.5 3.5 4.5M17 6h3c0 3-1.5 4.5-3.5 4.5M12 14v4M8 21h8',
  rocket: 'M12 3c3.5 2.4 5 6 4.5 10l-2 3h-5l-2-3c-.5-4 1-7.6 4.5-10zM9.5 16l-3 3.5M14.5 16l3 3.5M12 9.5a1.2 1.2 0 1 0 0 .01',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
  lock: 'M6 11h12v9.5H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  mail: 'M3.5 5.5h17v13h-17zM3.5 6l8.5 7 8.5-7',
  camera: 'M3.5 7.5h4l1.5-2.5h6l1.5 2.5h4v12h-17zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  music: 'M9 18V5.5l11-2V16M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM20 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  flame: 'M12 21c-4 0-6.5-2.7-6.5-6.2 0-3.6 3-5.6 3.5-9.3 2.4 1.4 3.7 3.4 3.8 5.6 1-.9 1.6-2.1 1.7-3.4 2.4 2 4 4.4 4 7.1 0 3.5-2.5 6.2-6.5 6.2z',
};

// ---------------------------------------------------------------- device frames

/** Phone with a clipped screen. `screen(sw, sh)` builds layers in screen space. */
export function phone(
  id: string,
  o: { x: Anim<number>; y: Anim<number>; h: number; body?: string; ax?: number; ay?: number } & Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>,
  screen: (sw: number, sh: number) => Layer[],
): GroupLayer {
  const h = o.h;
  const w = h * 0.49;
  const bez = h * 0.022;
  const sw = w - bez * 2;
  const sh = h - bez * 2;
  const { body = '#0E1116', ...rest } = o;
  return group(
    id,
    [
      rect(id + '-body', { x: 0, y: 0, w, h, ax: 0, ay: 0, radius: h * 0.075, fill: body, shadow: { color: 'rgba(5,15,40,0.35)', blur: h * 0.06, y: h * 0.03 } }),
      group(id + '-screen', screen(sw, sh), { x: bez, y: bez, w: sw, h: sh, ax: 0, ay: 0, clip: true, clipRadius: h * 0.06 }),
      rect(id + '-island', { x: w / 2, y: bez + h * 0.022, w: w * 0.28, h: h * 0.026, ay: 0, radius: h * 0.013, fill: '#000' }),
    ],
    { ...rest, w, h },
  );
}

/** Laptop (screen + base). `screen(sw, sh)` builds the display content. */
export function laptop(
  id: string,
  o: { x: Anim<number>; y: Anim<number>; w: number } & Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>,
  screen: (sw: number, sh: number) => Layer[],
): GroupLayer {
  const w = o.w;
  const lidW = w * 0.8;
  const lidH = lidW * 0.64;
  const bez = lidW * 0.025;
  const sw = lidW - bez * 2;
  const sh = lidH - bez * 2.4;
  const h = lidH + w * 0.045;
  const lx = (w - lidW) / 2;
  return group(
    id,
    [
      rect(id + '-lid', { x: lx, y: 0, w: lidW, h: lidH, ax: 0, ay: 0, radius: lidW * 0.03, fill: '#15181E', shadow: { color: 'rgba(5,15,40,0.3)', blur: w * 0.05, y: w * 0.02 } }),
      group(id + '-screen', screen(sw, sh), { x: lx + bez, y: bez * 1.4, w: sw, h: sh, ax: 0, ay: 0, clip: true, clipRadius: lidW * 0.008 }),
      rect(id + '-base', { x: 0, y: lidH, w, h: w * 0.035, ax: 0, ay: 0, radius: w * 0.012, fill: linear(90, '#C9CED8', '#EEF1F6', '#B9BFCB') }),
      rect(id + '-notch', { x: w / 2, y: lidH, w: w * 0.14, h: w * 0.012, ay: 0, radius: w * 0.006, fill: '#9AA1AE' }),
    ],
    { ...o, w, h },
  );
}

/** Browser window chrome. */
export function browser(
  id: string,
  o: { x: Anim<number>; y: Anim<number>; w: number; h: number; dark?: boolean } & Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>,
  content: (cw: number, ch: number) => Layer[],
): GroupLayer {
  const { w, h, dark = false, ...rest } = o;
  const bar = Math.max(24, h * 0.07);
  const r = Math.min(w, h) * 0.03;
  const chrome = dark ? '#1B1F27' : '#F2F4F8';
  const dot = bar * 0.22;
  return group(
    id,
    [
      rect(id + '-frame', { x: 0, y: 0, w, h, ax: 0, ay: 0, radius: r, fill: dark ? '#0F1218' : '#FFFFFF', shadow: { color: 'rgba(8,20,50,0.22)', blur: w * 0.04, y: w * 0.015 } }),
      rect(id + '-bar', { x: 0, y: 0, w, h: bar, ax: 0, ay: 0, radius: r, fill: chrome }),
      rect(id + '-bar2', { x: 0, y: bar * 0.5, w, h: bar * 0.5, ax: 0, ay: 0, fill: chrome }),
      ...['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) =>
        circle(id + '-dot' + i, dot, { x: bar * 0.6 + i * dot * 3, y: bar / 2, fill: c }),
      ),
      rect(id + '-url', { x: w / 2, y: bar / 2, w: w * 0.4, h: bar * 0.56, radius: bar * 0.28, fill: dark ? '#262B35' : '#FFFFFF' }),
      group(id + '-content', content(w, h - bar), { x: 0, y: bar, w, h: h - bar, ax: 0, ay: 0, clip: true }),
    ],
    { ...rest, w, h },
  );
}

/** Pill-shaped button with label. */
export function button(
  id: string,
  label: string,
  o: { x: Anim<number>; y: Anim<number>; font: string; size: number; fill: Paint; color: string; weight?: number; padX?: number; padY?: number } & Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>,
): GroupLayer {
  const { font, size, fill, color, weight = 600, padX = 1.1, padY = 0.75, ...rest } = o;
  const estW = label.length * size * 0.56 + size * padX * 2;
  const h = size * (1 + padY * 2);
  return group(
    id,
    [
      rect(id + '-bg', { x: estW / 2, y: h / 2, w: estW, h, radius: h / 2, fill }),
      text(id + '-label', label, { x: estW / 2, y: h / 2, font, size, weight, fill: color, align: 'center' }),
    ],
    { ...rest, w: estW, h },
  );
}
