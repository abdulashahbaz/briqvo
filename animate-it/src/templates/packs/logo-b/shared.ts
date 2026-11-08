/**
 * Shared helpers for the logo-b pack: text width estimates (calibrated against
 * the real web fonts so brand names fit and horizontal lockups centre), track
 * samplers for physics/orbit motion and small layout utilities.
 */
import type { Ease, Keyframe } from '../../../engine/types';
import { ease } from '../../../engine/easing';
import { parseColor, luminance } from '../../../engine/color';
import type { Ctx, Field } from '../../kit';

export const brandField = (def: string): Field => ({ key: 'brand', label: 'Brand name', default: def });
export const taglineField = (def: string): Field => ({ key: 'tagline', label: 'Tagline', default: def });

// ---------------------------------------------------------------- text metrics

/** Reference advance widths (em) of a neutral grotesk. */
function emOf(s: string): number {
  let w = 0;
  for (const ch of s) {
    if (ch === ' ') w += 0.26;
    else if ("il.,:;!|'’j".includes(ch)) w += 0.25;
    else if ('ftr'.includes(ch)) w += 0.36;
    else if ('mw'.includes(ch)) w += 0.84;
    else if (ch === 'I') w += 0.3;
    else if ('MW'.includes(ch)) w += 0.86;
    else if (ch >= 'A' && ch <= 'Z') w += 0.68;
    else if (ch >= '0' && ch <= '9') w += 0.6;
    else if (ch === '&') w += 0.7;
    else w += 0.56;
  }
  return w;
}

/** Display-face width relative to the reference (measured, rounded up a touch). */
const DISPLAY_F: Record<string, number> = {
  grotesk: 1.0,
  sora: 1.2,
  serif: 0.8,
  editorial: 1.1,
  space: 1.06,
  syne: 1.82,
  archivo: 1.24,
  outfit: 1.08,
  dmserif: 1.02,
  manrope: 1.1,
  unbounded: 1.45,
  anton: 0.87,
  fraunces: 1.2,
  poppins: 1.16,
};

/** Estimated rendered width of x.title(text, { size }) (size before displayScale). */
export function titleW(x: Ctx, s: string, size: number, tracking = x.f.displayTracking, upper = false): number {
  const str = upper ? s.toUpperCase() : s;
  const n = Array.from(str).length;
  const base = x.f.id === 'mono' ? n * 0.62 : emOf(str) * (DISPLAY_F[x.f.id] ?? 1.2);
  return size * x.f.displayScale * (base + Math.max(0, n - 1) * tracking);
}

/** Line-box height of a one-line title. */
export function titleH(x: Ctx, size: number, lineHeight = 1.02): number {
  return size * x.f.displayScale * lineHeight;
}

/** Title size (pre displayScale) that keeps `s` within maxW. */
export function fitTitle(x: Ctx, s: string, base: number, maxW: number, tracking?: number, upper = false): number {
  const w = titleW(x, s, base, tracking, upper);
  return w > maxW ? (base * maxW) / w : base;
}

/** Estimated width of x.body text. */
export function bodyW(x: Ctx, s: string, size: number, tracking = 0, upper = false): number {
  const str = upper ? s.toUpperCase() : s;
  const n = Array.from(str).length;
  const base = x.f.body === 'JetBrains Mono' ? n * 0.62 : emOf(str) * 1.08;
  return size * (base + Math.max(0, n - 1) * tracking);
}

export function fitBody(x: Ctx, s: string, base: number, maxW: number, tracking = 0, upper = false): number {
  const w = bodyW(x, s, base, tracking, upper);
  return w > maxW ? (base * maxW) / w : base;
}

/** Advance (em) of one character for circular text, using the body face. */
export function charEm(x: Ctx, ch: string): number {
  if (x.f.body === 'JetBrains Mono') return 0.62;
  return emOf(ch) * 1.08;
}

// ---------------------------------------------------------------- tracks

/** Sample fn(t) on [t0, t1] every dt into a linear keyframe track. */
export function sampled(t0: number, t1: number, dt: number, fn: (t: number) => number, digits = 3): Keyframe<number>[] {
  const out: Keyframe<number>[] = [];
  const n = Math.max(1, Math.ceil((t1 - t0) / dt));
  const f = Math.pow(10, digits);
  for (let i = 0; i <= n; i++) {
    const t = Math.min(t1, t0 + i * dt);
    const v = Math.round(fn(t) * f) / f;
    out.push(i === 0 ? { t, v } : { t, v, e: 'linear' });
  }
  return out;
}

/** Keyframes that hold each value until the next time (flicker / stepped motion). */
export function stepped(pairs: [number, number][]): Keyframe<number>[] {
  return pairs.map(([t, v], i) => (i === 0 ? { t, v } : { t, v, e: 'hold' as Ease }));
}

/** Append a gentle sine bob after an entrance track has landed on `base` at t0. */
export function thenBob(
  entrance: Keyframe<number>[],
  base: number,
  amp: number,
  t0: number,
  t1: number,
  cycles = 1,
  phaseSign = 1,
): Keyframe<number>[] {
  const steps = Math.max(4, Math.round(cycles * 4));
  const out = [...entrance];
  for (let i = 1; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    out.push({ t, v: base + phaseSign * amp * Math.sin((i / steps) * cycles * Math.PI * 2), e: 'inOutSine' });
  }
  return out;
}

export const easeAt = (e: Ease, p: number) => ease(e, p);

/** Horizontal lockup: [mark][gap][text], centred as a whole. */
export function hLockup(x: Ctx, markW: number, gap: number, textW: number) {
  const total = markW + gap + textW;
  const left = x.cx - total / 2;
  return { markX: left + markW / 2, textX: left + markW + gap, left, total };
}

/** True for a saturated mid-tone colour (usable as a decorative tint). */
export function colorful(c: string): boolean {
  const { r, g, b } = parseColor(c);
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  const sat = mx === 0 ? 0 : (mx - mn) / mx;
  const L = luminance(c);
  return sat > 0.35 && L > 0.06 && L < 0.9;
}
