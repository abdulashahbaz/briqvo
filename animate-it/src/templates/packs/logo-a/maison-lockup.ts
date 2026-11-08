import { type Recipe, k, rect, group, path, radial, ta, fadeIn, alpha } from '../../kit';
import { estW, fit, stack, titleH, bodyH } from './util';

/** Lighter cuts read as more refined at wide tracking. */
const LUX_WEIGHT: Record<string, number> = { editorial: 500, fraunces: 600, outfit: 300, sora: 400, manrope: 500, poppins: 400 };

export const maisonLockup: Recipe = {
  id: 'maison-lockup',
  name: 'Maison Lockup',
  category: 'logo',
  tags: ['logo', 'luxury', 'elegant', 'serif', 'fashion', 'beauty', 'slow'],
  description: 'A slow, refined reveal: a fine double frame draws itself, letters de-blur from wide tracking and hairline rules extend from the centre.',
  duration: 5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Maison Ivoire' },
    { key: 'tagline', label: 'Tagline', default: 'Parfums & bougies' },
    { key: 'est', label: 'Established', default: 'Est. 2026' },
  ],
  variants: [
    { name: 'Paper', palette: 'paper', fonts: 'serif', logo: 'petal', format: 'square' },
    { name: 'Sand', palette: 'sand', fonts: 'fraunces', logo: 'arc', format: 'portrait', copy: { brand: 'Atelier Sable', tagline: 'Handmade leather goods', est: 'Since 1998' } },
    { name: 'Royal', palette: 'royal', fonts: 'dmserif', logo: 'prism', format: 'landscape', copy: { brand: 'Halcyon House', tagline: "Private members' club", est: 'Est. 1921' } },
    { name: 'Noir', palette: 'noir', fonts: 'outfit', logo: 'knot', format: 'story', copy: { brand: 'Oblique', tagline: 'Fine jewellery', est: 'Paris · Milan' } },
    { name: 'Blush', palette: 'blush', fonts: 'editorial', logo: 'wave', format: 'landscape', copy: { brand: 'Rose Celeste', tagline: 'Skin & fragrance', est: 'Est. 2019' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const fm = x.pick({ landscape: 5 * u, default: 5.5 * u });
    const L = x.pick({ landscape: 14 * u, story: 24 * u, portrait: 17 * u, default: 15 * u });
    const track = 0.26;
    const nameOpts = { upper: true, tracking: track };
    const maxW = Math.min(W - fm * 2 - 16 * u, 140 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 8.4 * u, story: 11 * u, portrait: 9 * u, default: 7.8 * u }), maxW, nameOpts);
    const tagOpts = { body: true, upper: true, tracking: 0.34 };
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 3.8 * u, portrait: 3.1 * u, default: 2.8 * u }), maxW, tagOpts);
    const estOpts = { body: true, upper: true, tracking: 0.3 };
    const estSize = x.pick({ story: 3 * u, default: 2.6 * u });
    const [my, ny, ry, ty] = stack(cy, [L, titleH(x, nameSize), 1.6 * u, bodyH(tagSize)], [x.pick({ story: 10 * u, default: 6 * u }), x.pick({ story: 6.5 * u, default: 4.5 * u }), x.pick({ story: 6.5 * u, default: 4.5 * u })]);

    // ---- double frame drawn from the top centre down both sides, parting around the label.
    const gapHalf = estW(x, x.c.est, estSize, estOpts) / 2 + 3 * u;
    const frameLine = (id: string, inset: number, t0: number, a: number, sw: number) => {
      const l = inset;
      const rgt = W - inset;
      const b = H - inset;
      const left = `M${cx} ${l} H${l} V${b} H${cx - gapHalf}`;
      const right = `M${cx} ${l} H${rgt} V${b} H${cx + gapHalf}`;
      const o = { x: 0, y: 0, w: W, h: H, ax: 0, ay: 0, stroke: alpha(p.fg, a), strokeWidth: sw, lineCap: 'butt' as const, lineJoin: 'miter' as const, trimEnd: k([t0, 0], [t0 + 1.7, 1, 'inOutCubic']) };
      return [path(id + '-l', left, W, H, o), path(id + '-r', right, W, H, o)];
    };

    const R = Math.min(24 * u, maxW / 2 - 2 * u);
    const weight = LUX_WEIGHT[x.f.id] ?? x.f.displayWeight;

    const comp = group(
      'mx-comp',
      [
        x.logo('mx-logo', {
          size: L,
          x: cx,
          y: my,
          color: p.fg,
          blur: k([0.5, 10], [1.8, 0, 'outCubic']),
          opacity: fadeIn(0.5, 1.1),
          scale: k([0.5, 1.12], [2.2, 1, 'outCubic']),
        }),
        x.title('mx-name', x.c.brand, {
          size: nameSize,
          x: cx,
          y: ny,
          weight,
          uppercase: true,
          tracking: track,
          sx: k([1.0, 1.1], [2.9, 1, [0.2, 0.7, 0.2, 1]]),
          anim: { by: 'char', start: 1.0, dur: 1.4, stagger: 0.055, ease: 'outCubic', order: 'center', from: { opacity: 0, blur: 12, scale: 1.25 } },
        }),
        rect('mx-rule-l', { x: cx - 2.6 * u, y: ry, ax: 1, h: 0.26 * u, fill: alpha(p.fg, 0.6), w: k([2.0, 0], [3.3, R, 'inOutCubic']) }),
        rect('mx-rule-r', { x: cx + 2.6 * u, y: ry, ax: 0, h: 0.26 * u, fill: alpha(p.fg, 0.6), w: k([2.0, 0], [3.3, R, 'inOutCubic']) }),
        rect('mx-diamond', {
          x: cx,
          y: ry,
          w: 1.3 * u,
          h: 1.3 * u,
          fill: p.accent,
          rotation: k([1.9, -45], [2.8, 45, 'outCubic']),
          scale: k([1.9, 0], [2.6, 1, 'outBack']),
        }),
        x.body('mx-tag', x.c.tagline, {
          size: tagSize,
          x: cx,
          y: ty,
          fill: p.muted,
          weight: 500,
          uppercase: true,
          tracking: 0.34,
          anim: ta.blur(2.6, { stagger: 0.12, dur: 1.2 }),
        }),
      ],
      { x: cx, y: cy, w: W, h: H, scale: k([0, 1.035], [4.8, 1, 'outCubic']) },
    );

    return {
      background: radial(0.5, 0.45, 1.05, p.bg, p.bg2),
      layers: [
        ...frameLine('mx-frame', fm, 0.15, 0.32, 0.18 * u),
        ...frameLine('mx-frame2', fm + 1.3 * u, 0.35, 0.18, 0.12 * u),
        comp,
        x.body('mx-est', x.c.est, {
          size: estSize,
          x: cx,
          y: H - fm - 0.65 * u,
          fill: p.muted,
          weight: 500,
          uppercase: true,
          tracking: 0.3,
          opacity: fadeIn(2.0, 1.0),
          anim: ta.center(2.0, { dur: 1.1, stagger: 0.04 }),
        }),
      ],
    };
  },
};
