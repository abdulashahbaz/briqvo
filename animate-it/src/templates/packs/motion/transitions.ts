/** Motion pack — transitions. Their last frame is the incoming scene; the ~55% frame is mid-transition. */
import type { Layer } from '../../../engine/types';
import { parseColor } from '../../../engine/color';
import { type Recipe, k, rect, circle, group, path, linear, ta, alpha, shade, ICONS } from '../../kit';
import { fitTitle, fitBody } from './shared';

type Bez = [number, number, number, number];

/** First `n` colours from `cands` that are visibly different from each other. */
function distinct(cands: string[], n: number): string[] {
  const out: string[] = [];
  const dist = (a: string, b: string) => {
    const A = parseColor(a);
    const B = parseColor(b);
    return Math.hypot(A.r - B.r, A.g - B.g, A.b - B.b);
  };
  for (const c of cands) {
    if (out.length >= n) break;
    if (out.every((o) => dist(o, c) > 60)) out.push(c);
  }
  while (out.length < n) out.push(cands[out.length % cands.length]);
  return out;
}

// ------------------------------------------------------------------ Shape Wipe

const shapeWipe: Recipe = {
  id: 'shape-wipe',
  name: 'Shape Wipe',
  category: 'transitions',
  tags: ['transition', 'wipe', 'circle', 'shape', 'reveal', 'next up', 'chapter'],
  description: 'Concentric colour shapes bloom from the centre and wipe to a new scene that announces what’s next.',
  duration: 3.4,
  fields: [
    { key: 'from', label: 'Outgoing title', default: 'Chapter one' },
    { key: 'eyebrow', label: 'Eyebrow', default: 'Next up' },
    { key: 'title', label: 'Incoming title', default: 'Chapter two' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', format: 'landscape', seed: 1 },
    { name: 'Sunset', palette: 'sunset', fonts: 'syne', format: 'square', seed: 2, copy: { from: 'Morning routine', eyebrow: 'Coming up', title: 'Evening wind-down' } },
    { name: 'Noir', palette: 'noir', fonts: 'space', format: 'story', seed: 3, copy: { from: 'The problem', eyebrow: 'Next', title: 'The fix' } },
    { name: 'Peach', palette: 'peach', fonts: 'fraunces', format: 'portrait', seed: 4, copy: { from: 'Ingredients', eyebrow: 'Next up', title: 'The method' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const round = x.seed % 2 === 0;
    const R = Math.hypot(W / 2, H / 2) * 1.04;
    const S = Math.max(W, H) * 0.68;
    const e: Bez = [0.6, 0, 0.3, 1];
    const d = 1.0;
    const tA = 0.95;
    const tB = 1.38;
    const [cA, cB] = distinct([p.accent2, p.accent, p.bg2, shade(p.accent, -0.3)], 2);
    const sceneB = p.fg;
    const inkB = p.bg;

    const grow = (id: string, t: number, fill: string): Layer =>
      round
        ? rect(id, { x: cx, y: cy, w: k([t, 0], [t + d, 2 * S, e]), h: k([t, 0], [t + d, 2 * S, e]), radius: k([t, 0], [t + d, S * 0.5, e]), fill })
        : circle(id, k([t, 0], [t + d, R, e]), { x: cx, y: cy, fill });
    const mask = round
      ? {
          shape: 'rect' as const,
          x: k([tB, cx], [tB + d, cx - S, e]),
          y: k([tB, cy], [tB + d, cy - S, e]),
          w: k([tB, 0], [tB + d, 2 * S, e]),
          h: k([tB, 0], [tB + d, 2 * S, e]),
          r: k([tB, 0], [tB + d, S * 0.5, e]),
        }
      : { shape: 'circle' as const, x: cx, y: cy, r: k([tB, 0], [tB + d, R, e]) };

    const maxW = W - x.pick({ landscape: 30 * u, default: 16 * u });
    const aFit = fitTitle(x, x.c.from, { maxW, maxLines: 2, max: x.pick({ landscape: 12 * u, story: 17 * u, default: 13 * u }), balance: true });
    const bFit = fitTitle(x, x.c.title, { maxW, maxLines: 2, max: x.pick({ landscape: 14 * u, story: 19 * u, default: 15 * u }), balance: true });
    const eyeS = x.pick({ story: 3.8 * u, default: 3.2 * u });
    const eye = fitBody(x, x.c.eyebrow, { maxW, max: eyeS, weight: 700, tracking: 0.24, upper: true, maxLines: 1 });

    return {
      background: p.bg,
      layers: [
        group(
          'scene-a',
          [
            x.body('a-index', '01', { size: eyeS, weight: 700, tracking: 0.2, x: cx, y: cy - aFit.h / 2 - 6 * u, fill: p.accent }),
            x.title('a-title', x.c.from, { size: aFit.size, x: cx, y: cy, w: aFit.wrapW }),
            rect('a-rule', { x: cx, y: cy + aFit.h / 2 + 5 * u, w: 10 * u, h: 0.6 * u, radius: 0.3 * u, fill: p.accent }),
          ],
          {
            x: cx,
            y: cy,
            w: W,
            h: H,
            scale: k([0, 1], [tA, 1.03, 'linear'], [tB + 0.5, 0.9, 'inCubic']),
            opacity: k([tA + 0.2, 1], [tB + 0.4, 0, 'inCubic']),
            end: tB + d,
          },
        ),
        grow('wave-a', tA, cA),
        grow('wave-b', tA + 0.21, cB),
        group(
          'scene-b',
          [
            rect('b-bg', { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, fill: sceneB }),
            group(
              'b-content',
              [
                circle('b-dot', eyeS * 0.32, { x: cx - eye.w / 2 - eyeS * 1.1, y: cy - bFit.h / 2 - 6 * u, fill: p.accent, scale: k([2.0, 0], [2.4, 1, 'outBack']) }),
                x.body('b-eyebrow', x.c.eyebrow, {
                  size: eye.size,
                  weight: 700,
                  uppercase: true,
                  tracking: 0.24,
                  x: cx,
                  y: cy - bFit.h / 2 - 6 * u,
                  fill: alpha(inkB, 0.7),
                  anim: ta.chars(1.95, { stagger: 0.03 }),
                }),
                x.title('b-title', x.c.title, {
                  size: bFit.size,
                  x: cx,
                  y: cy,
                  w: bFit.wrapW,
                  fill: inkB,
                  anim: ta.riseLines(2.0, { stagger: 0.1, dur: 0.9 }),
                }),
                path('b-arrow', ICONS.arrowRight, 24, 24, {
                  x: k([2.5, cx - 3 * u], [3.1, cx, 'outExpo']),
                  y: cy + bFit.h / 2 + 7 * u,
                  w: 5 * u,
                  h: 5 * u,
                  stroke: p.accent,
                  strokeWidth: 2.2,
                  trimEnd: k([2.45, 0], [3.0, 1, 'outCubic']),
                }),
              ],
              { x: cx, y: cy, w: W, h: H, scale: k([tB, 1.12], [tB + 1.4, 1, [0.2, 0.8, 0.3, 1]]) },
            ),
          ],
          { x: 0, y: 0, w: W, h: H, ax: 0, ay: 0, mask },
        ),
      ],
    };
  },
};

// ------------------------------------------------------------------ Stripe Swipe

const stripeSwipe: Recipe = {
  id: 'stripe-swipe',
  name: 'Stripe Swipe',
  category: 'transitions',
  tags: ['transition', 'stripes', 'diagonal', 'swipe', 'energetic', 'sport'],
  description: 'Six diagonal colour stripes slash across in a stagger, then peel away to the next scene.',
  duration: 3.2,
  fields: [
    { key: 'from', label: 'Outgoing title', default: 'Today’s agenda' },
    { key: 'eyebrow', label: 'Eyebrow', default: 'Up next' },
    { key: 'title', label: 'Incoming title', default: 'Live Q&A' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'anton', format: 'square' },
    { name: 'Cobalt', palette: 'cobalt', fonts: 'outfit', format: 'landscape', copy: { from: 'Product update', eyebrow: 'Next', title: 'Roadmap 2027' } },
    { name: 'Cyber', palette: 'cyber', fonts: 'syne', format: 'portrait', copy: { from: 'Round one', eyebrow: 'Get ready', title: 'Final round' } },
    { name: 'Citrus', palette: 'citrus', fonts: 'manrope', format: 'story', copy: { from: 'Warm-up', eyebrow: 'Now', title: 'Full workout' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const D = Math.hypot(W, H) * 1.12;
    const n = 6;
    const sh = D / n;
    const e: Bez = [0.7, 0, 0.3, 1];
    const sIn = 0.4;
    const st = 0.055;
    const dIn = 0.55;
    const sOut = 1.36;
    const dOut = 0.62;
    const tSwitch = sIn + (n - 1) * st + dIn + 0.04;
    const cols = distinct([p.accent, p.fg, p.accent2, p.bg2, shade(p.accent, -0.3), shade(p.fg, 0.3)], 3);
    const stripes: Layer[] = Array.from({ length: n }, (_, i) => {
      const a = sIn + i * st;
      const b = sOut + i * st;
      const c = cols[i % 3];
      return rect(`stripe-${i}`, {
        x: k([a, -D], [a + dIn, 0, e], [b, 0], [b + dOut, D, e]),
        y: i * sh - 1,
        ax: 0,
        ay: 0,
        w: D,
        h: sh + 2,
        fill: linear(0, shade(c, -0.1), c),
      });
    });
    const maxW = W - x.pick({ landscape: 30 * u, default: 16 * u });
    const aFit = fitTitle(x, x.c.from, { maxW, maxLines: 2, max: x.pick({ landscape: 12 * u, story: 14 * u, default: 12 * u }), balance: true });
    const bFit = fitTitle(x, x.c.title, { maxW, maxLines: 2, max: x.pick({ landscape: 15 * u, story: 17 * u, default: 15 * u }), balance: true });
    const eyeS = x.pick({ story: 3.4 * u, default: 2.8 * u });
    const eye = fitBody(x, x.c.eyebrow, { maxW, max: eyeS, weight: 700, tracking: 0.24, upper: true, maxLines: 1 });
    const ang = x.pick({ landscape: -22, default: -28 });

    return {
      background: p.bg,
      layers: [
        group(
          'scene-a',
          [
            x.title('a-title', x.c.from, { size: aFit.size, x: cx, y: cy, w: aFit.wrapW }),
            rect('a-rule', { x: cx, y: cy + aFit.h / 2 + 4.5 * u, w: 10 * u, h: 0.6 * u, radius: 0.3 * u, fill: p.accent }),
          ],
          { x: cx, y: cy, w: W, h: H, end: tSwitch, scale: k([0, 1], [tSwitch, 1.05, 'inCubic']) },
        ),
        group(
          'scene-b',
          [
            rect('b-bg', { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, fill: p.accent }),
            x.body('b-eyebrow', x.c.eyebrow, {
              size: eye.size,
              weight: 700,
              uppercase: true,
              tracking: 0.24,
              x: cx,
              y: cy - bFit.h / 2 - 5.5 * u,
              fill: alpha(p.onAccent, 0.75),
              anim: ta.slide(1.7, { by: 'char', stagger: 0.025, from: { x: -1.2, opacity: 0 } }),
            }),
            x.title('b-title', x.c.title, {
              size: bFit.size,
              x: cx,
              y: cy,
              w: bFit.wrapW,
              fill: p.onAccent,
              anim: { by: 'char', start: 1.65, dur: 0.8, stagger: 0.03, ease: 'outExpo', from: { x: -1.5, opacity: 0, rotation: 0 }, mask: true },
              skewX: k([1.65, -12], [2.6, 0, 'outExpo']),
            }),
            rect('b-rule', { x: cx, y: cy + bFit.h / 2 + 4.5 * u, w: k([2.0, 0], [2.7, 12 * u, 'outExpo']), h: 0.7 * u, radius: 0.35 * u, fill: p.onAccent }),
          ],
          { x: 0, y: 0, w: W, h: H, ax: 0, ay: 0, start: tSwitch },
        ),
        group('stripes', stripes, { x: cx, y: cy, w: D, h: D, rotation: ang }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Split Doors

const splitDoors: Recipe = {
  id: 'split-doors',
  name: 'Split Doors',
  category: 'transitions',
  tags: ['transition', 'doors', 'reveal', 'split', 'opening', 'launch', 'elegant'],
  description: 'Two doors carrying your teaser line slide apart, splitting it in half, as light spills out and the title resolves.',
  duration: 3.6,
  fields: [
    { key: 'door', label: 'Door line', default: 'Introducing' },
    { key: 'title', label: 'Title', default: 'The Spring Collection' },
    { key: 'sub', label: 'Supporting line', default: 'Online & in store from 27 March' },
  ],
  variants: [
    { name: 'Royal', palette: 'royal', fonts: 'editorial', format: 'landscape' },
    { name: 'Blush', palette: 'blush', fonts: 'serif', format: 'portrait', copy: { door: 'Save the date', title: 'Ava & Theo', sub: '14 · 09 · 2027 · Lisbon' } },
    { name: 'Forest', palette: 'forest', fonts: 'grotesk', format: 'square', copy: { door: 'Now open', title: 'Greenhouse Café', sub: 'Daily from 8 am · 12 Elm Street' } },
    { name: 'Graphite', palette: 'graphite', fonts: 'sora', format: 'story', copy: { door: 'Members only', title: 'The Vault Sale', sub: '48 hours · starts at midnight' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const half = W / 2;
    const e: Bez = [0.76, 0, 0.24, 1];
    const t0 = 1.3;
    const t1 = 2.6;
    const door = p.accent;
    const ink = p.onAccent;
    const dFit = fitTitle(x, x.c.door, { maxW: W * 0.78, maxLines: 1, max: x.pick({ landscape: 9 * u, default: 8.5 * u }), upper: true, tracking: 0.06 });
    const tFit = fitTitle(x, x.c.title, { maxW: W - x.pick({ landscape: 28 * u, default: 14 * u }), maxLines: 3, max: x.pick({ landscape: 13 * u, story: 14 * u, default: 12 * u }), balance: true });
    const sFit = fitBody(x, x.c.sub, { maxW: W - 16 * u, max: x.pick({ story: 3.6 * u, default: 3.1 * u }), maxLines: 2, balance: true });
    const titleY = cy - sFit.h / 2 - 2 * u;
    const subY = titleY + tFit.h / 2 + 5 * u;

    const doorKids = (side: 'l' | 'r'): Layer[] => {
      const seamX = side === 'l' ? half : 0;
      return [
        rect(`door-${side}-bg`, {
          x: 0,
          y: 0,
          ax: 0,
          ay: 0,
          w: half,
          h: H,
          fill: linear(side === 'l' ? 0 : 180, door, shade(door, -0.16)),
        }),
        x.title(`door-${side}-label`, x.c.door, {
          size: dFit.size,
          x: seamX,
          y: cy,
          uppercase: true,
          tracking: 0.06,
          fill: ink,
          anim: ta.rise(0.15, { by: 'char', stagger: 0.03, dur: 0.8 }),
        }),
      ];
    };

    return {
      background: p.bg,
      layers: [
        rect('spill', {
          x: cx,
          y: cy,
          w: k([t0, 0], [t1, W * 1.1, e]),
          h: H,
          fill: linear(0, alpha(p.accent2, 0), alpha(p.accent2, 0.3), alpha(p.accent2, 0)),
          opacity: k([t0, 1], [t1 + 0.6, 0.35, 'inOutSine']),
        }),
        x.title('title', x.c.title, {
          size: tFit.size,
          x: cx,
          y: titleY,
          w: tFit.wrapW,
          scale: k([t0, 1.14], [t1 + 0.7, 1, [0.2, 0.8, 0.3, 1]]),
          blur: k([t0, 12], [t1 - 0.1, 0, 'outCubic']),
          opacity: k([t0, 0], [t0 + 0.45, 1, 'outSine']),
        }),
        x.body('sub', x.c.sub, {
          size: sFit.size,
          x: cx,
          y: subY,
          ay: 0,
          w: sFit.wrapW,
          fill: p.muted,
          anim: ta.rise(t1 - 0.3, { stagger: 0.04 }),
        }),
        group('door-l', doorKids('l'), { x: k([t0, 0], [t1, -half - 4 * u, e]), y: 0, ax: 0, ay: 0, w: half, h: H, clip: true }),
        group('door-r', doorKids('r'), { x: k([t0, half], [t1, W + 4 * u, e]), y: 0, ax: 0, ay: 0, w: half, h: H, clip: true }),
        rect('seam', {
          x: cx,
          y: cy,
          w: Math.max(1.5, 0.25 * u),
          h: H,
          fill: p.accent2,
          opacity: k([0.6, 0], [1.0, 0.8], [t0, 0.8], [t0 + 0.15, 0]),
        }),
      ],
    };
  },
};

export const transitionRecipes: Recipe[] = [shapeWipe, stripeSwipe, splitDoors];
