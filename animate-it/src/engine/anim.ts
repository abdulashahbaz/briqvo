import { ease } from './easing';
import { lerpColor } from './color';
import type { Anim, Ease, Keyframe, Paint } from './types';

export function isTrack<T>(a: Anim<T> | undefined): a is Keyframe<T>[] {
  return Array.isArray(a) && a.length > 0 && typeof a[0] === 'object' && a[0] !== null && 't' in (a[0] as object);
}

function lerpValue<T>(a: T, b: T, p: number): T {
  if (typeof a === 'number' && typeof b === 'number') return (a + (b - a) * p) as T;
  if (typeof a === 'string' && typeof b === 'string') return lerpColor(a, b, p) as T;
  return (p < 0.5 ? a : b) as T;
}

export function sample<T>(a: Anim<T> | undefined, t: number, def: T): T {
  if (a === undefined) return def;
  if (!isTrack(a)) return a as T;
  const kfs = a;
  if (t <= kfs[0].t) return kfs[0].v;
  const last = kfs[kfs.length - 1];
  if (t >= last.t) return last.v;
  for (let i = 1; i < kfs.length; i++) {
    const b = kfs[i];
    if (t < b.t) {
      const k0 = kfs[i - 1];
      const span = b.t - k0.t;
      const p = span <= 0 ? 1 : ease(b.e, (t - k0.t) / span);
      return lerpValue(k0.v, b.v, p);
    }
  }
  return last.v;
}

export function samplePaint(a: Anim<Paint> | undefined, t: number, def: Paint): Paint {
  return sample<Paint>(a, t, def);
}

/** Keyframe builder: k([0, 0], [0.6, 1, 'outExpo']) — ease is the arrival easing. */
export function k<T>(...frames: [number, T, Ease?][]): Keyframe<T>[] {
  return frames.map(([t, v, e]) => (e ? { t, v, e } : { t, v }));
}

/** Shift every keyframe of a track in time. */
export function shiftTrack<T>(a: Anim<T>, dt: number): Anim<T> {
  if (!isTrack(a)) return a;
  return a.map((f) => ({ ...f, t: f.t + dt }));
}

/** Add a constant to a numeric track or value. */
export function offsetAnim(a: Anim<number> | undefined, d: number, def = 0): Anim<number> {
  if (a === undefined) return def + d;
  if (!isTrack(a)) return (a as number) + d;
  return a.map((f) => ({ ...f, v: f.v + d }));
}

/** Multiply a numeric track or value. */
export function scaleAnim(a: Anim<number> | undefined, m: number, def = 1): Anim<number> {
  if (a === undefined) return def * m;
  if (!isTrack(a)) return (a as number) * m;
  return a.map((f) => ({ ...f, v: f.v * m }));
}

export function trackTimes(a: unknown): number[] {
  return isTrack(a as Anim<unknown>) ? (a as Keyframe<unknown>[]).map((f) => f.t) : [];
}

export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic PRNG so generated templates are stable between renders. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}
