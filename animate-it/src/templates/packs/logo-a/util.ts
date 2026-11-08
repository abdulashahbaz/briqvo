/**
 * Shared helpers for the logo-a pack: text-width estimates (fonts may not be
 * loaded when a scene is built, so we can't measure), vertical stacking,
 * hold-stepped jitter tracks and a couple of per-unit text tricks.
 */
import type { Ease, Keyframe, TextAnim } from '../../../engine/types';
import { luminance } from '../../../engine/color';
import { k, type Ctx } from '../../kit';

/** Average advance per glyph in em, measured on brand-like strings: [display, display caps, body, body caps]. */
const MET: Record<string, [number, number, number, number]> = {
  grotesk: [0.472, 0.549, 0.508, 0.629],
  sora: [0.557, 0.665, 0.508, 0.629],
  serif: [0.365, 0.444, 0.508, 0.629],
  editorial: [0.507, 0.64, 0.508, 0.629],
  space: [0.507, 0.575, 0.506, 0.575],
  mono: [0.6, 0.6, 0.6, 0.6],
  syne: [0.849, 1.079, 0.508, 0.629],
  archivo: [0.587, 0.713, 0.481, 0.646],
  outfit: [0.505, 0.627, 0.476, 0.609],
  dmserif: [0.476, 0.564, 0.498, 0.611],
  manrope: [0.523, 0.611, 0.494, 0.602],
  unbounded: [0.686, 0.815, 0.508, 0.629],
  anton: [0.419, 0.435, 0.514, 0.629],
  fraunces: [0.556, 0.699, 0.508, 0.629],
  poppins: [0.547, 0.615, 0.523, 0.604],
};

export interface EstOpts {
  body?: boolean;
  upper?: boolean;
  /** em; defaults to the font pair's display tracking (0 for body). */
  tracking?: number;
}

/** Estimated rendered width of a single line. `size` is the size you pass to x.title / x.body. */
export function estW(x: Ctx, s: string, size: number, o: EstOpts = {}): number {
  const m = MET[x.f.id] ?? [0.56, 0.68, 0.52, 0.64];
  const n = Array.from(s).length;
  const per = o.body ? (o.upper ? m[3] : m[2]) : o.upper ? m[1] : m[0];
  const sz = o.body ? size : size * x.f.displayScale;
  const tr = o.tracking ?? (o.body ? 0 : x.f.displayTracking);
  return (n * per + Math.max(0, n - 1) * tr) * sz * 1.09;
}

/** Shrink `size` so the estimated width stays within `maxW`. */
export function fit(x: Ctx, s: string, size: number, maxW: number, o: EstOpts = {}): number {
  const w = estW(x, s, size, o);
  return w > maxW ? (size * maxW) / w : size;
}

/** Visual slot height of a one-line display title (cap/ascender block). */
export const titleH = (x: Ctx, size: number) => size * x.f.displayScale * 0.86;
/** Visual slot height of a one-line body label. */
export const bodyH = (size: number) => size * 0.95;

/** Centres of vertically stacked slots (heights h, gaps g) balanced around `center`. */
export function stack(center: number, h: number[], g: number[]): number[] {
  const total = h.reduce((a, b) => a + b, 0) + g.slice(0, h.length - 1).reduce((a, b) => a + b, 0);
  let y = center - total / 2;
  return h.map((hh, i) => {
    const c = y + hh / 2;
    y += hh + (g[i] ?? 0);
    return c;
  });
}

/** Keyframes whose values jump (hold) at each time. */
export function holds(first: number, ...steps: [number, number][]): Keyframe<number>[] {
  return k<number>([0, first], ...steps.map(([t, v]) => [t, v, 'hold'] as [number, number, Ease]));
}

/**
 * Glitchy hold-stepped track: random jumps between t0 and t1 (amplitude decays),
 * snapping to `final` at t1. Values are offsets added to `base`.
 */
export function jitter(
  r: () => number,
  o: { t0: number; t1: number; amp: number; base?: number; final?: number; step?: number; prob?: number },
): Keyframe<number>[] {
  const { t0, t1, amp, base = 0, final = 0, step = 0.06, prob = 0.6 } = o;
  const steps: [number, number][] = [];
  for (let t = t0; t < t1 - 0.02; t += step * (0.6 + r() * 0.8)) {
    const env = 1 - ((t - t0) / (t1 - t0)) * 0.55;
    steps.push([t, base + (r() < prob ? (r() * 2 - 1) * amp * env : 0)]);
  }
  steps.push([t1, base + final]);
  return holds(base, ...steps);
}

/** Non-space glyph count (text-anim units exclude spaces). */
export const unitCount = (s: string) => Array.from(s).filter((c) => c !== ' ').length;

const FAR = 1000;
/**
 * Per-char text anim that shows ONLY unit j. Used to draw a caret glyph that sits
 * exactly where the engine lays out the text, whatever font is loaded.
 */
export function onlyUnit(j: number): TextAnim {
  return {
    by: 'char',
    start: (j - 0.5) * FAR,
    dur: 0.001,
    stagger: -FAR,
    ease: 'linear',
    from: { opacity: 0 },
    out: { start: (j + 0.5) * FAR, dur: 0.001, stagger: -FAR, ease: 'linear', to: { opacity: 0 } },
  };
}

/** Per-char text anim that hides the first and last unit (invisible padding glyphs). */
export function hideEdges(): TextAnim {
  return { by: 'char', start: 0.5 * FAR, dur: 0.001, stagger: -FAR, ease: 'linear', from: { opacity: 0 }, order: 'edges' };
}

/** True when the palette background is dark. */
export const isDark = (x: Ctx) => luminance(x.p.bg) < 0.22;

/** Ease-out-cubic and friends for hand-sampled tracks. */
export const outCubic = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
export const outQuart = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);
export const inOutCubic = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
