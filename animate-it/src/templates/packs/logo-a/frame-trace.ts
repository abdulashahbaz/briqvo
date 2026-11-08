import { type Recipe, k, rect, group, path, circle, radial, ta, fadeIn, alpha } from '../../kit';
import { fit, stack, titleH, bodyH } from './util';

type Shape = 'circle' | 'squircle' | 'hex';
const SHAPES: Shape[] = ['circle', 'squircle', 'hex'];

/** Closed outlines in a 100×100 box that start at 12 o'clock and run clockwise. */
const OUTLINE: Record<Shape, string> = {
  circle: 'M50 0 A50 50 0 1 1 50 100 A50 50 0 1 1 50 0 Z',
  squircle: 'M50 0 H76 A24 24 0 0 1 100 24 V76 A24 24 0 0 1 76 100 H24 A24 24 0 0 1 0 76 V24 A24 24 0 0 1 24 0 Z',
  hex: 'M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z',
};
/** N, E, S, W points on each outline (and the trim fraction where the stroke reaches them). */
const NODES: Record<Shape, [number, number, number][]> = {
  circle: [[50, 0, 1], [100, 50, 0.25], [50, 100, 0.5], [0, 50, 0.75]],
  squircle: [[50, 0, 1], [100, 50, 0.25], [50, 100, 0.5], [0, 50, 0.75]],
  hex: [[50, 0, 1], [93.3, 50, 0.25], [50, 100, 0.5], [6.7, 50, 0.75]],
};

/** Inverse of inOutCubic, to time events to the moment a trimmed stroke passes a point. */
function invInOutCubic(v: number) {
  return v < 0.5 ? Math.cbrt(v / 4) : 1 - Math.cbrt((1 - v) * 2) / 2;
}

export const frameTrace: Recipe = {
  id: 'frame-trace',
  name: 'Frame Trace',
  category: 'logo',
  tags: ['logo', 'line', 'trace', 'outline', 'geometric', 'minimal', 'intro'],
  description: 'A geometric frame traces itself around your mark, the mark fills in like a rising level and the frame settles with a spring.',
  duration: 4.2,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Novaro' },
    { key: 'tagline', label: 'Tagline', default: 'Smart money, made simple' },
  ],
  variants: [
    { name: 'Azure Ring', palette: 'azure', fonts: 'sora', logo: 'orbit', format: 'square', seed: 1 },
    { name: 'Midnight Tile', palette: 'midnight', fonts: 'grotesk', logo: 'knot', format: 'story', seed: 2, copy: { brand: 'Kestrel Labs', tagline: 'Research that ships' } },
    { name: 'Mint Hex', palette: 'mint', fonts: 'manrope', logo: 'petal', format: 'portrait', seed: 3, copy: { brand: 'Greenfold', tagline: 'Plant-based essentials' } },
    { name: 'Graphite Ring', palette: 'graphite', fonts: 'space', logo: 'prism', format: 'landscape', seed: 4, copy: { brand: 'Vertexa', tagline: 'Precision engineering' } },
    { name: 'Cobalt Tile', palette: 'cobalt', fonts: 'fraunces', logo: 'stack', format: 'square', seed: 5, copy: { brand: 'Pagewell', tagline: 'Independent publishing' } },
  ],
  build(x) {
    const { u, W, cx, cy, p } = x;
    const shape = SHAPES[(Math.max(1, x.seed) - 1) % 3];
    const F = x.pick({ landscape: 38 * u, story: 52 * u, portrait: 44 * u, default: 40 * u });
    const L = F * (shape === 'hex' ? 0.5 : 0.52);
    const maxW = Math.min(W - 16 * u, 130 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 9.5 * u, story: 11.5 * u, default: 10 * u }), maxW);
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 3.8 * u, default: 3.3 * u }), maxW, { body: true, upper: true, tracking: 0.16 });
    const [fy, ny, ty] = stack(cy, [F, titleH(x, nameSize), bodyH(tagSize)], [x.pick({ story: 9 * u, default: 7.5 * u }), x.pick({ story: 4.4 * u, default: 3.6 * u })]);

    const vb = 100 / F; // scene units → viewBox units
    const d = OUTLINE[shape];
    const T0 = 0.35;
    const T1 = 1.55;
    const at = (frac: number) => T0 + invInOutCubic(frac) * (T1 - T0);

    const nodes = NODES[shape].map(([nx, ny2, frac], i) =>
      circle(`ft-node-${i}`, 1.05 * u, {
        x: (nx / 100) * F,
        y: (ny2 / 100) * F,
        fill: p.accent2,
        scale: k([at(frac) - 0.02, 0], [at(frac) + 0.4, 1, 'outBack']),
      }),
    );

    const frame = group(
      'ft-frame',
      [
        path('ft-guide', d, 100, 100, {
          x: F / 2, y: F / 2, w: F, h: F,
          stroke: alpha(p.fg, 0.14),
          strokeWidth: 0.3 * u * vb,
          opacity: k([0, 0], [0.5, 1, 'outCubic'], [1.6, 1], [2.3, 0, 'inOutCubic']),
        }),
        path('ft-fill', d, 100, 100, {
          x: F / 2, y: F / 2, w: F, h: F,
          fill: alpha(p.accent, 0.08),
          scale: k([1.45, 0.6], [2.3, 1, 'outExpo']),
          opacity: fadeIn(1.45, 0.5),
        }),
        path('ft-comet', d, 100, 100, {
          x: F / 2, y: F / 2, w: F, h: F,
          stroke: p.accent2,
          strokeWidth: 1.1 * u * vb,
          trimEnd: k([0.08, 0], [1.2, 1, 'inOutCubic']),
          trimStart: k([0.3, 0], [1.42, 1, 'inOutCubic']),
        }),
        path('ft-stroke', d, 100, 100, {
          x: F / 2, y: F / 2, w: F, h: F,
          stroke: p.accent,
          strokeWidth: k([T0, 1.0 * u * vb], [T1, 1.0 * u * vb], [2.3, 0.75 * u * vb, 'inOutCubic']),
          trimEnd: k([T0, 0], [T1, 1, 'inOutCubic']),
        }),
        ...nodes,
      ],
      {
        x: cx,
        y: fy,
        w: F,
        h: F,
        scale: k([0, 0.92], [T1 - 0.1, 1, 'outCubic'], [T1 + 0.18, 0.93, 'outCubic'], [2.5, 1, 'spring']),
        rotation: k([0, -8], [T1, 0, 'outCubic']),
      },
    );

    // Construction lines that sketch the grid before the frame is drawn.
    const span = F * 1.42;
    const lineA = alpha(p.fg, 0.16);
    const guides = [
      rect('ft-h', {
        x: cx, y: fy, h: 0.22 * u, fill: lineA,
        w: k([0.0, 0], [0.8, span, 'outExpo'], [1.5, span], [2.2, 0, 'inOutCubic']),
      }),
      rect('ft-v', {
        x: cx, y: fy, w: 0.22 * u, fill: lineA,
        h: k([0.1, 0], [0.9, F * 1.24, 'outExpo'], [1.5, F * 1.24], [2.2, 0, 'inOutCubic']),
      }),
    ];

    // The mark "fills" from the bottom: a faint ghost first, then a rising mask with a level line.
    const fill0 = 1.5;
    const fill1 = 2.25;
    const mark = group('ft-mark', [x.logo('ft-logo', { size: L, x: L / 2, y: L / 2, color: p.fg })], {
      x: cx,
      y: fy,
      w: L,
      h: L,
      mask: {
        shape: 'rect',
        x: -L * 0.1,
        w: L * 1.2,
        y: k([fill0, L], [fill1, -L * 0.05, 'inOutCubic']),
        h: k([fill0, 0], [fill1, L * 1.1, 'inOutCubic']),
      },
      scale: k([fill0, 0.94], [fill1 + 0.4, 1, 'spring']),
    });
    const ghost = x.logo('ft-ghost', {
      size: L,
      x: cx,
      y: fy,
      color: p.fg,
      opacity: k([1.1, 0], [1.5, 0.13, 'outCubic'], [fill1, 0.13], [fill1 + 0.05, 0]),
    });
    const level = rect('ft-level', {
      x: cx,
      y: k([fill0, fy + L / 2], [fill1, fy - L / 2 - L * 0.05, 'inOutCubic']),
      w: L * 1.14,
      h: 0.35 * u,
      radius: 0.2 * u,
      fill: p.accent2,
      opacity: k([fill0 - 0.05, 0], [fill0 + 0.1, 1], [fill1 - 0.1, 1], [fill1 + 0.05, 0]),
    });

    return {
      background: radial(0.5, fy / x.H, 0.85, p.bg2, p.bg),
      layers: [
        ...guides,
        frame,
        ghost,
        mark,
        level,
        x.title('ft-name', x.c.brand, {
          size: nameSize,
          x: cx,
          y: ny,
          anim: ta.rise(2.0, { by: 'char', stagger: 0.035, dur: 0.8 }),
        }),
        x.body('ft-tag', x.c.tagline, {
          size: tagSize,
          x: cx,
          y: ty,
          fill: p.muted,
          weight: 600,
          tracking: 0.16,
          uppercase: true,
          anim: ta.blur(2.45, { stagger: 0.08 }),
        }),
      ],
    };
  },
};
