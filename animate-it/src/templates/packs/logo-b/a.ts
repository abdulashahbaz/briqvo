/**
 * logo-b, part A: Sonar Pulse, Blob Bloom, Shape Party, Drop & Spin.
 */
import type { Layer } from '../../../engine/types';
import {
  type Recipe,
  k,
  rect,
  circle,
  ellipse,
  path,
  radial,
  linear,
  ta,
  tween,
  alpha,
  shade,
  blobPath,
  polygonPath,
} from '../../kit';
import { brandField, taglineField, fitTitle, fitBody, titleW, titleH, bodyW, hLockup, thenBob, colorful } from './shared';

// ------------------------------------------------------------------ 1. Sonar Pulse (ripple)

const sonarPulse: Recipe = {
  id: 'sonar-pulse',
  name: 'Sonar Pulse',
  category: 'logo',
  tags: ['logo', 'ripple', 'pulse', 'rings', 'minimal', 'tech', 'intro'],
  description: 'Rings ripple out from your mark as it springs in, then settle into a calm sonar backdrop.',
  duration: 4.2,
  usesLogo: true,
  fields: [brandField('Pulsewave'), taglineField('Signal, amplified')],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', logo: 'orbit', format: 'square' },
    { name: 'Midnight', palette: 'midnight', fonts: 'sora', logo: 'wave', format: 'landscape', copy: { brand: 'Tidewell', tagline: 'Listen to the ocean' } },
    { name: 'Mint', palette: 'mint', fonts: 'outfit', logo: 'petal', format: 'story', copy: { brand: 'Calmly', tagline: 'Breathe in, breathe out' } },
    { name: 'Royal', palette: 'royal', fonts: 'fraunces', logo: 'arc', format: 'portrait', copy: { brand: 'Archer & Vale', tagline: 'Private wealth' } },
    { name: 'Citrus', palette: 'citrus', fonts: 'archivo', logo: 'stack', format: 'square', copy: { brand: 'Zapline', tagline: 'Fast charging' } },
  ],
  build(x) {
    const { u, cx, cy, p, H } = x;
    const D = x.pick({ story: 46 * u, portrait: 38 * u, default: 32 * u });
    const L = D * 0.5;
    const maxTW = x.pick({ landscape: 120 * u, default: 84 * u });
    const B = fitTitle(x, x.c.brand, x.pick({ story: 14 * u, portrait: 11.5 * u, default: 10 * u }), maxTW);
    const T = fitBody(x, x.c.tagline, x.pick({ story: 4.2 * u, portrait: 3.5 * u, default: 3.2 * u }), maxTW, 0.16, true);
    const g1 = x.pick({ story: 11 * u, portrait: 9 * u, default: 7.5 * u });
    const g2 = x.pick({ story: 3.4 * u, default: 2.6 * u });
    const bh = titleH(x, B);
    const block = D + g1 + bh + g2 + T * 1.35;
    const top = cy - block / 2;
    const my = top + D / 2;
    const brandY = top + D + g1;
    const tagY = brandY + bh + g2;

    // Static sonar rings (geometric spacing reads as depth).
    const rg = x.pick({ story: 8.5 * u, default: 7 * u });
    const ringCount = x.pick({ landscape: 6, story: 5, default: 5 });
    const rings: Layer[] = [];
    let r = D / 2;
    for (let i = 0; i < ringCount; i++) {
      r += rg * (1 + i * 0.22);
      const t0 = 1.15 + i * 0.09;
      rings.push(
        ellipse(`ring-${i}`, {
          x: cx,
          y: my,
          w: r * 2,
          h: r * 2,
          stroke: alpha(p.accent, Math.max(0.07, 0.3 - i * 0.05)),
          strokeWidth: 0.28 * u,
          scale: k([t0, 0.86], [t0 + 1.1, 1, 'outExpo']),
          opacity: k([t0, 0], [t0 + 0.5, 1, 'outCubic']),
        }),
      );
    }

    // Travelling ripples: an entrance burst and a later heartbeat.
    const spread = x.pick({ landscape: 84 * u, story: 74 * u, portrait: 64 * u, default: 60 * u });
    const ripple = (id: string, t0: number, peak: number, life: number): Layer =>
      ellipse(id, {
        x: cx,
        y: my,
        w: k([t0, D], [t0 + life, D + spread * 2, 'outCubic']),
        h: k([t0, D], [t0 + life, D + spread * 2, 'outCubic']),
        stroke: p.accent,
        strokeWidth: k([t0, 1.3 * u], [t0 + life, 0.2 * u, 'outCubic']),
        opacity: k([t0, 0], [t0 + 0.06, peak], [t0 + life, 0, 'inSine']),
        start: t0,
        end: t0 + life,
      });
    const ripples = [
      ...[0, 1, 2, 3].map((i) => ripple(`ripple-${i}`, 0.45 + i * 0.2, 0.85 - i * 0.12, 1.6)),
      ripple('ripple-late-0', 2.45, 0.5, 1.5),
      ripple('ripple-late-1', 2.62, 0.3, 1.45),
    ];

    return {
      background: radial(0.5, my / H, 0.85, p.bg2, p.bg),
      layers: [
        ...rings,
        ...ripples,
        circle('pulse-fill', D / 2, {
          x: cx,
          y: my,
          fill: alpha(p.accent, 0.22),
          scale: k([0.5, 1], [1.6, 2.7, 'outCubic']),
          opacity: k([0.5, 0], [0.56, 1], [1.6, 0, 'inSine']),
          start: 0.5,
          end: 1.6,
        }),
        circle('disc', D / 2, {
          x: cx,
          y: my,
          fill: linear(120, shade(p.accent, 0.14), shade(p.accent, -0.1)),
          shadow: { color: alpha(p.accent, 0.4), blur: 5 * u, y: 1.6 * u },
          scale: k([0.15, 0], [0.95, 1, 'spring'], [2.38, 1], [2.5, 1.06, 'outQuad'], [2.95, 1, 'outBack']),
        }),
        x.logo('mark', {
          size: L,
          x: cx,
          y: my,
          color: p.onAccent,
          scale: k([0.35, 0.2], [1.15, 1, 'outBack'], [2.38, 1], [2.5, 1.06, 'outQuad'], [2.95, 1, 'outBack']),
          rotation: k([0.35, -40], [1.25, 0, 'outBack']),
          opacity: k([0.35, 0], [0.55, 1]),
        }),
        x.title('brand', x.c.brand, {
          size: B,
          x: cx,
          y: brandY,
          ay: 0,
          anim: ta.rise(1.0, { by: 'char', stagger: 0.03, dur: 0.8 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: T,
          x: cx,
          y: tagY,
          ay: 0,
          fill: p.muted,
          weight: 600,
          uppercase: true,
          tracking: 0.16,
          anim: ta.blur(1.4, { stagger: 0.08 }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ 2. Blob Bloom (blob morph)

const blobBloom: Recipe = {
  id: 'blob-bloom',
  name: 'Blob Bloom',
  category: 'logo',
  tags: ['logo', 'blob', 'organic', 'morph', 'playful', 'badge'],
  description: 'Organic blobs bloom and morph behind your mark, then settle into a soft, living badge.',
  duration: 4.4,
  usesLogo: true,
  fields: [brandField('Bloomly'), taglineField('Flowers, delivered')],
  variants: [
    { name: 'Lilac', palette: 'lilac', fonts: 'poppins', logo: 'petal', format: 'portrait' },
    { name: 'Peach', palette: 'peach', fonts: 'fraunces', logo: 'wave', format: 'square', copy: { brand: 'Gumdrop', tagline: 'Small-batch sweets' } },
    { name: 'Mint', palette: 'mint', fonts: 'manrope', logo: 'knot', format: 'landscape', copy: { brand: 'Fernway', tagline: 'Plant-based skincare' } },
    { name: 'Cyber', palette: 'cyber', fonts: 'unbounded', logo: 'orbit', format: 'story', copy: { brand: 'Jellybean', tagline: 'Games for curious kids' } },
    { name: 'Blush', palette: 'blush', fonts: 'dmserif', logo: 'arc', format: 'landscape', copy: { brand: 'Softly', tagline: 'Slow living goods' } },
  ],
  build(x) {
    const { u, cx, cy, p, H } = x;
    const dur = 4.4;
    const land = x.isLandscape;
    const S = x.pick({ story: 66 * u, portrait: 58 * u, landscape: 56 * u, default: 52 * u });
    const L = S * 0.4;
    const tTrack = 0.14;
    let bx: number;
    let by: number;
    let textX: number;
    let brandY: number;
    let tagY: number;
    let B: number;
    let T: number;
    if (land) {
      B = fitTitle(x, x.c.brand, 12 * u, 84 * u);
      T = fitBody(x, x.c.tagline, 3.4 * u, 84 * u, tTrack, true);
      const tw = Math.max(titleW(x, x.c.brand, B), bodyW(x, x.c.tagline, T, tTrack, true));
      const lk = hLockup(x, S, 9 * u, tw);
      bx = lk.markX;
      by = cy;
      textX = lk.textX;
      const bh = titleH(x, B);
      const block = bh + 2.4 * u + T * 1.35;
      brandY = cy - block / 2;
      tagY = brandY + bh + 2.4 * u;
    } else {
      B = fitTitle(x, x.c.brand, x.pick({ story: 13 * u, portrait: 11.5 * u, default: 10.5 * u }), 84 * u);
      T = fitBody(x, x.c.tagline, x.pick({ story: 3.9 * u, default: 3.3 * u }), 84 * u, tTrack, true);
      const bh = titleH(x, B);
      const g1 = x.pick({ story: 9 * u, default: 6 * u });
      const g2 = 2.6 * u;
      const block = S + g1 + bh + g2 + T * 1.35;
      const top = cy - block / 2;
      bx = cx;
      by = top + S / 2;
      textX = cx;
      brandY = top + S + g1;
      tagY = brandY + bh + g2;
    }
    const s0 = x.seed * 7;
    const echo = colorful(p.accent2) ? alpha(p.accent2, 0.42) : alpha(shade(p.accent, 0.45), 0.75);
    const paint = p.accent;
    const blob = (id: string, d: string, o: Record<string, unknown>): Layer =>
      path(id, d, 100, 100, { x: bx, y: by, w: S, h: S, fill: paint, ...o });

    const drops: Layer[] = [
      { a: -2.45, d: 5 * u, r: 2.4 * u, c: p.accent2 },
      { a: -0.62, d: 3.8 * u, r: 1.5 * u, c: p.accent },
      { a: 2.7, d: 5.5 * u, r: 1.1 * u, c: p.accent2 },
    ].map((o, i) => {
      const t0 = 1.35 + i * 0.12;
      const fx = bx + Math.cos(o.a) * (S / 2 + o.d);
      const fy = by + Math.sin(o.a) * (S / 2 + o.d);
      return circle(`drop-${i}`, o.r, {
        x: k([t0, bx + Math.cos(o.a) * S * 0.3], [t0 + 0.8, fx, 'outBack']),
        y: thenBob(k([t0, by + Math.sin(o.a) * S * 0.3], [t0 + 0.8, fy, 'outBack']), fy, 0.8 * u, t0 + 0.8, dur, 1, i % 2 ? 1 : -1),
        scale: k([t0, 0.4], [t0 + 0.5, 1, 'outBack']),
        fill: o.c,
        start: t0,
      });
    });

    return {
      background: radial(0.5, by / H, 0.9, p.bg2, p.bg),
      layers: [
        path('blob-echo', blobPath(s0 + 4, 7, 0.16), 100, 100, {
          x: bx + 2.6 * u,
          y: by + 2.6 * u,
          w: S * 1.04,
          h: S * 1.04,
          fill: echo,
          scale: k([1.05, 0], [2.0, 1, 'outExpo']),
          rotation: k([1.05, 40], [2.0, 0, 'outExpo'], [dur, -10, 'linear']),
        }),
        ...drops,
        blob('blob-a', blobPath(s0 + 1, 6, 0.38), {
          scale: k([0.1, 0], [0.75, 0.84, 'outBack'], [1.2, 0.84], [1.75, 0.5, 'inOutCubic']),
          rotation: k([0.1, -60], [1.75, 25, 'outCubic']),
        }),
        blob('blob-b', blobPath(s0 + 2, 5, 0.34), {
          scale: k([0.42, 0], [1.02, 0.94, 'outBack'], [1.35, 0.94], [1.85, 0.5, 'inOutCubic']),
          rotation: k([0.42, 50], [1.85, -15, 'outCubic']),
        }),
        blob('blob-c', blobPath(s0 + 3, 7, 0.11), {
          shadow: { color: alpha(shade(p.accent, -0.4), 0.22), blur: 5 * u, y: 2 * u },
          scale: k([0.82, 0], [1.75, 1, 'spring']),
          rotation: k([0.82, -35], [1.9, 0, 'outCubic'], [dur, 9, 'linear']),
        }),
        x.logo('mark', {
          size: L,
          x: bx,
          y: by,
          color: p.onAccent,
          scale: k([1.0, 0], [1.75, 1, 'spring']),
          rotation: k([1.0, -25], [1.8, 0, 'outBack']),
        }),
        x.title('brand', x.c.brand, {
          size: B,
          x: textX,
          y: brandY,
          ay: 0,
          ...(land ? { ax: 0, align: 'left' as const } : {}),
          anim: ta.rise(1.35, { by: 'char', stagger: 0.035, dur: 0.85 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: T,
          x: textX,
          y: tagY,
          ay: 0,
          ...(land ? { ax: 0, align: 'left' as const } : {}),
          fill: p.muted,
          weight: 600,
          uppercase: true,
          tracking: tTrack,
          anim: ta.blur(1.8, { stagger: 0.07 }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ 3. Shape Party (shape assembly)

const shapeParty: Recipe = {
  id: 'shape-party',
  name: 'Shape Party',
  category: 'logo',
  tags: ['logo', 'shapes', 'geometric', 'playful', 'kids', 'bauhaus'],
  description: 'A circle, square, triangle and pill spring in from every edge and settle into a playful cluster around your mark.',
  duration: 4.2,
  usesLogo: true,
  fields: [brandField('Playhouse'), taglineField('Design for little ones')],
  variants: [
    { name: 'Cobalt Cream', palette: 'cobalt', fonts: 'grotesk', logo: 'stack', format: 'story' },
    { name: 'Citrus', palette: 'citrus', fonts: 'syne', logo: 'arc', format: 'portrait', copy: { brand: 'Bento Lab', tagline: 'Creative studio' } },
    { name: 'Sunset', palette: 'sunset', fonts: 'outfit', logo: 'prism', format: 'square', copy: { brand: 'Shapeshift', tagline: 'Brand & motion' } },
    { name: 'Azure', palette: 'azure', fonts: 'poppins', logo: 'knot', format: 'landscape', copy: { brand: 'Blocksy', tagline: 'Learn by building' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'space', logo: 'petal', format: 'portrait', copy: { brand: 'Tumble', tagline: 'Toys that teach' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const dur = 4.2;
    const C = x.pick({ story: 74 * u, portrait: 64 * u, landscape: 60 * u, default: 58 * u });
    const L = C * 0.32;
    const maxTW = x.pick({ landscape: 120 * u, default: 86 * u });
    const B = fitTitle(x, x.c.brand, x.pick({ story: 12.5 * u, portrait: 11 * u, default: 10 * u }), maxTW);
    const T = fitBody(x, x.c.tagline, x.pick({ story: 3.8 * u, default: 3.2 * u }), maxTW, 0.14, true);
    const bh = titleH(x, B);
    const g1 = x.pick({ story: 9 * u, portrait: 7 * u, default: 5.5 * u });
    const g2 = 2.6 * u;
    const block = C + g1 + bh + g2 + T * 1.35;
    const top = cy - block / 2;
    const my = top + C / 2;
    const brandY = top + C + g1;
    const tagY = brandY + bh + g2;

    const at = (rx: number, ry: number) => [cx + rx * C, my + ry * C] as const;
    const c3 = shade(p.accent, 0.45);

    // Each shape: lands with a spring, then bobs gently.
    const land = (
      rx: number,
      ry: number,
      from: [number, number],
      t0: number,
      rot: [number, number],
      build: (o: Record<string, unknown>) => Layer,
      phase: number,
    ): Layer => {
      const [fx, fy] = at(rx, ry);
      const tl = t0 + 1.0;
      return build({
        x: k([t0, from[0]], [tl, fx, 'spring']),
        y: thenBob(k([t0, from[1]], [tl, fy, 'spring']), fy, 0.9 * u, tl, dur, 1, phase),
        rotation: thenBob(k([t0, rot[0]], [tl, rot[1], 'spring']), rot[1], 3, tl, dur, 1, -phase),
      });
    };

    const shapes: Layer[] = [
      land(-0.26, 0.28, [cx - C * 0.2, H + C * 0.35], 0.42, [50, -32], (o) =>
        rect('sh-pill', { ...o, w: C * 0.5, h: C * 0.19, radius: C * 0.095, fill: p.fg }), -1),
      land(0.26, 0.25, [W + C * 0.35, my + C * 0.15], 0.3, [120, 14], (o) =>
        rect('sh-square', { ...o, w: C * 0.34, h: C * 0.34, radius: C * 0.06, fill: p.accent2 }), 1),
      land(0.27, -0.24, [cx + C * 0.15, -C * 0.35], 0.18, [-140, -12], (o) =>
        path('sh-tri', polygonPath(3), 100, 100, { ...o, w: C * 0.44, h: C * 0.44, fill: c3 }), -1),
      land(-0.25, -0.21, [-C * 0.35, my - C * 0.1], 0.06, [0, 0], (o) => circle('sh-circle', C * 0.21, { ...o, fill: p.accent }), 1),
    ];

    // Little accents that pop after the shapes land.
    const zig = 'M0 10 L10 0 L20 10 L30 0 L40 10 L50 0 L60 10';
    const [zx, zy] = at(0.02, -0.53);
    const [ox, oy] = at(0.55, -0.02);
    const [dx, dy] = at(-0.56, 0.04);
    const extras: Layer[] = [
      path('zigzag', zig, 60, 10, {
        x: zx,
        y: zy,
        w: C * 0.22,
        h: C * 0.037,
        stroke: p.accent,
        strokeWidth: 3.2,
        trimEnd: k([1.1, 0], [1.65, 1, 'inOutCubic']),
      }),
      circle('ring-dot', C * 0.04, {
        x: ox,
        y: oy,
        stroke: p.accent,
        strokeWidth: 0.6 * u,
        scale: k([1.2, 0], [1.7, 1, 'outBack']),
      }),
      circle('solid-dot', C * 0.024, {
        x: dx,
        y: dy,
        fill: p.accent2,
        scale: k([1.3, 0], [1.75, 1, 'outBack']),
      }),
    ];
    const R0 = C * 0.28;

    return {
      background: p.bg,
      layers: [
        ...shapes,
        ...extras,
        circle('sticker', R0, {
          x: cx,
          y: my,
          fill: p.surface,
          shadow: { color: alpha(p.fg, 0.16), blur: 3.5 * u, y: 1.2 * u },
          scale: k([0.8, 0], [1.5, 1, 'spring']),
        }),
        x.logo('mark', {
          size: L,
          x: cx,
          y: my,
          color: p.fg,
          scale: k([1.0, 0], [1.75, 1, 'spring']),
          rotation: k([1.0, 25], [1.8, 0, 'outBack']),
        }),
        x.title('brand', x.c.brand, {
          size: B,
          x: cx,
          y: brandY,
          ay: 0,
          anim: ta.pop(1.25, { stagger: 0.04, dur: 0.6 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: T,
          x: cx,
          y: tagY,
          ay: 0,
          fill: p.muted,
          weight: 600,
          uppercase: true,
          tracking: 0.14,
          anim: ta.chars(1.7, { stagger: 0.02 }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ 4. Drop & Spin (letter drop)

const dropSpin: Recipe = {
  id: 'drop-spin',
  name: 'Drop & Spin',
  category: 'logo',
  tags: ['logo', 'wordmark', 'bounce', 'spin', 'playful', 'kinetic'],
  description: 'Your mark spins in a full turn while the wordmark letters drop and bounce onto a baseline.',
  duration: 4.4,
  usesLogo: true,
  fields: [brandField('Hopscotch'), taglineField('Play every day')],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'archivo', logo: 'knot', format: 'landscape' },
    { name: 'Paper', palette: 'paper', fonts: 'editorial', logo: 'petal', format: 'story', copy: { brand: 'Marigold', tagline: 'Floral studio' } },
    { name: 'Noir', palette: 'noir', fonts: 'unbounded', logo: 'prism', format: 'portrait', copy: { brand: 'Vertex', tagline: 'Gaming gear' } },
    { name: 'Arctic', palette: 'arctic', fonts: 'sora', logo: 'orbit', format: 'square', copy: { brand: 'Nimbus', tagline: 'Cloud storage' } },
    { name: 'Peach', palette: 'peach', fonts: 'poppins', logo: 'wave', format: 'story', copy: { brand: 'Sundae', tagline: 'Ice cream bar' } },
  ],
  build(x) {
    const { u, cx, cy, p, H } = x;
    const land = x.isLandscape;
    const L = x.pick({ story: 46 * u, portrait: 32 * u, landscape: 30 * u, default: 28 * u });
    const tTrack = 0.18;
    const maxTW = land ? 96 * u : 86 * u;
    const B = fitTitle(x, x.c.brand, x.pick({ story: 17.5 * u, portrait: 13 * u, landscape: 13 * u, default: 11.5 * u }), maxTW);
    const T = fitBody(x, x.c.tagline, x.pick({ story: 4.4 * u, portrait: 3.6 * u, default: 3.3 * u }), maxTW, tTrack, true);
    const bh = titleH(x, B);
    const bw = titleW(x, x.c.brand, B);
    const gBar = 2.4 * u;
    const barH = 0.8 * u;
    const gTag = 3 * u;
    const textBlock = bh + gBar + barH + gTag + T * 1.35;

    let mx: number;
    let my: number;
    let tx: number;
    let brandY: number;
    if (land) {
      const tw = Math.max(bw, bodyW(x, x.c.tagline, T, tTrack, true));
      const lk = hLockup(x, L, 8 * u, tw);
      mx = lk.markX;
      my = cy;
      tx = lk.textX;
      brandY = cy - textBlock / 2;
    } else {
      const g1 = x.pick({ story: 10 * u, default: 7 * u });
      const block = L + g1 + textBlock;
      const top = cy - block / 2;
      mx = cx;
      my = top + L / 2;
      tx = cx;
      brandY = top + L + g1;
    }
    const barY = brandY + bh + gBar + barH / 2;
    const tagY = barY + barH / 2 + gTag;
    const n = Array.from(x.c.brand).length;
    const tLand = Math.max(1.9, 0.7 + (n - 1) * 0.055 + 0.95);
    const floorY = brandY + bh * 0.84;
    const floorW = bw + 6 * u;
    const barW = Math.min(16 * u, bw * 0.6);
    // Bar anchor: centred under stacked text, flush left in the landscape lockup.
    const barAx = land ? 0 : 0.5;
    const barX = tx;

    const spinRot = k<number>([0.1, -360], [1.2, 0, 'outBack']);
    const ghost = (i: number): Layer =>
      x.logo(`mark-ghost-${i}`, {
        size: L,
        x: mx,
        y: my,
        color: p.accent,
        scale: k([0.1 + i * 0.05, 0], [1.0 + i * 0.05, 1, 'outBack']),
        rotation: k([0.1 + i * 0.06, -360], [1.2 + i * 0.06, 0, 'outBack']),
        opacity: k([0.1, 0], [0.25, 0.3 - i * 0.12], [1.05, 0, 'inQuad']),
      });

    return {
      background: radial(0.5, my / H, 0.9, p.bg2, p.bg),
      layers: [
        ghost(2),
        ghost(1),
        ellipse('land-ring', {
          x: mx,
          y: my,
          w: k([1.0, L * 0.9], [1.7, L * 1.6, 'outCubic']),
          h: k([1.0, L * 0.9], [1.7, L * 1.6, 'outCubic']),
          stroke: p.accent,
          strokeWidth: 0.5 * u,
          opacity: k([1.0, 0], [1.05, 0.5], [1.7, 0, 'inSine']),
          start: 1.0,
          end: 1.7,
        }),
        x.logo('mark', {
          size: L,
          x: mx,
          y: my,
          color: p.accent,
          scale: k([0.1, 0], [1.0, 1, 'outBack']),
          rotation: spinRot,
        }),
        rect('floor', {
          x: k([0.5, barX], [tLand, barX], [tLand + 0.6, barX, 'inOutCubic']),
          y: k([0.5, floorY], [tLand, floorY], [tLand + 0.6, barY, 'inOutCubic']),
          ax: barAx,
          w: k([0.5, 0], [0.95, floorW, 'outExpo'], [tLand, floorW], [tLand + 0.6, barW, 'inOutCubic']),
          h: k([0.5, 0.3 * u], [tLand, 0.3 * u], [tLand + 0.6, barH, 'inOutCubic']),
          radius: barH / 2,
          fill: k([0.5, alpha(p.fg, 0.22)], [tLand, alpha(p.fg, 0.22)], [tLand + 0.6, p.accent, 'inOutCubic']),
        }),
        x.title('brand', x.c.brand, {
          size: B,
          x: tx,
          y: brandY,
          ay: 0,
          ...(land ? { ax: 0, align: 'left' as const } : {}),
          anim: ta.drop(0.7, { stagger: 0.055, dur: 0.95 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: T,
          x: tx,
          y: tagY,
          ay: 0,
          ...(land ? { ax: 0, align: 'left' as const } : {}),
          fill: p.muted,
          weight: 600,
          uppercase: true,
          tracking: tTrack,
          opacity: tween(0, 1, tLand + 0.3, 0.6, 'outCubic'),
          anim: ta.rise(tLand + 0.3, { dur: 0.7 }),
        }),
      ],
    };
  },
};

export const recipesA: Recipe[] = [sonarPulse, blobBloom, shapeParty, dropSpin];
