import type { Ease, EaseName } from './types';

const PI = Math.PI;
const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;

function bounceOut(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
}

export const EASINGS: Record<EaseName, (x: number) => number> = {
  linear: (x) => x,
  hold: (x) => (x < 1 ? 0 : 1),
  inSine: (x) => 1 - Math.cos((x * PI) / 2),
  outSine: (x) => Math.sin((x * PI) / 2),
  inOutSine: (x) => -(Math.cos(PI * x) - 1) / 2,
  inQuad: (x) => x * x,
  outQuad: (x) => 1 - (1 - x) * (1 - x),
  inOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
  inCubic: (x) => x * x * x,
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inQuart: (x) => x * x * x * x,
  outQuart: (x) => 1 - Math.pow(1 - x, 4),
  inOutQuart: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2),
  inQuint: (x) => x ** 5,
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  inOutQuint: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2),
  inExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
  outExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutExpo: (x) =>
    x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  inCirc: (x) => 1 - Math.sqrt(1 - x * x),
  outCirc: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
  inOutCirc: (x) =>
    x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2,
  inBack: (x) => c3 * x * x * x - c1 * x * x,
  outBack: (x) => 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2),
  inOutBack: (x) =>
    x < 0.5
      ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2,
  outElastic: (x) =>
    x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * PI) / 3)) + 1,
  outBounce: bounceOut,
  // Under-damped spring, normalised to land exactly on 1.
  spring: (x) => (x >= 1 ? 1 : 1 - Math.exp(-6.5 * x) * Math.cos(x * PI * 2.6)),
  softSpring: (x) => (x >= 1 ? 1 : 1 - Math.exp(-5 * x) * Math.cos(x * PI * 1.6) * (1 - x * 0.1)),
};

const bezierCache = new Map<string, (x: number) => number>();

/** Cubic-bezier solver (same curve model as CSS). */
function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const solve = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (x > v) lo = t;
      else hi = t;
      t = (hi - lo) / 2 + lo;
      if (hi - lo < 1e-7) break;
    }
    return t;
  };
  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solve(x)));
}

export function easeFn(e: Ease | undefined): (x: number) => number {
  if (!e) return EASINGS.inOutCubic;
  if (typeof e === 'string') return EASINGS[e] ?? EASINGS.inOutCubic;
  const key = e.join(',');
  let fn = bezierCache.get(key);
  if (!fn) {
    fn = cubicBezier(e[0], e[1], e[2], e[3]);
    bezierCache.set(key, fn);
  }
  return fn;
}

export function ease(e: Ease | undefined, x: number): number {
  return easeFn(e)(x < 0 ? 0 : x > 1 ? 1 : x);
}

export const EASE_NAMES = Object.keys(EASINGS) as EaseName[];
