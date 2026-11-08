import type { Ease, Keyframe, Layer } from '../../../engine/types';
import { type Recipe, k, ellipse, circle, radial, ta, alpha, shade } from '../../kit';
import { fit, stack, titleH, bodyH, isDark } from './util';

export const bounceDrop: Recipe = {
  id: 'bounce-drop',
  name: 'Bounce Drop',
  category: 'logo',
  tags: ['logo', 'bounce', 'squash', 'stretch', 'playful', 'fun', 'kids'],
  description: 'Your mark drops in with cartoon squash-and-stretch, kicks up a puff of dust and bounces to rest while the letters hop in.',
  duration: 4,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Popsy' },
    { key: 'tagline', label: 'Tagline', default: 'Snacks with spring' },
  ],
  variants: [
    { name: 'Citrus', palette: 'citrus', fonts: 'unbounded', logo: 'orbit', format: 'square' },
    { name: 'Peach', palette: 'peach', fonts: 'poppins', logo: 'petal', format: 'portrait', copy: { brand: 'Pipkin', tagline: 'Toys for tiny hands' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'syne', logo: 'arc', format: 'story', copy: { brand: 'Bubbloo', tagline: 'Learning, but make it fun' } },
    { name: 'Mint', palette: 'mint', fonts: 'outfit', logo: 'wave', format: 'landscape', copy: { brand: 'Fizzwell', tagline: 'Sparkling botanicals' } },
    { name: 'Blush', palette: 'blush', fonts: 'grotesk', logo: 'prism', format: 'square', copy: { brand: 'Gumdrop Studio', tagline: 'Candy-coloured design' } },
  ],
  build(x) {
    const { u, W, cx, cy, p } = x;
    const r = x.rand;
    const L = x.pick({ landscape: 28 * u, story: 40 * u, portrait: 34 * u, default: 31 * u });
    const maxW = Math.min(W - 14 * u, 130 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 10.5 * u, story: 14 * u, portrait: 12 * u, default: 11 * u }), maxW);
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 4.8 * u, default: 4 * u }), maxW, { body: true });
    const nH = titleH(x, nameSize);
    const tH = bodyH(tagSize);
    const [my, ny, ty] = stack(cy, [L, nH, tH], [x.pick({ story: 11 * u, default: 9 * u }), x.pick({ story: 4.6 * u, default: 3.8 * u })]);
    const ground = my + L / 2; // the mark is anchored at its bottom edge

    // ---- bounce: y keyframes (bottom edge) with matching squash & stretch
    const hop1 = 16 * u;
    const hop2 = 5.5 * u;
    const yK: [number, number, Ease?][] = [
      [0, -2 * u],
      [0.55, ground, 'inQuad'],
      [0.88, ground - hop1, 'outQuad'],
      [1.18, ground, 'inQuad'],
      [1.36, ground - hop2, 'outQuad'],
      [1.53, ground, 'inQuad'],
    ];
    const sxK = k<number>(
      [0, 0.84], [0.5, 0.86], [0.55, 1.34, 'outQuad'], [0.68, 0.9, 'outQuad'], [0.84, 1.0, 'inOutSine'],
      [1.12, 0.95], [1.18, 1.18, 'outQuad'], [1.28, 0.95, 'outQuad'], [1.36, 1, 'inOutSine'],
      [1.5, 1], [1.53, 1.08, 'outQuad'], [1.75, 1, 'softSpring'],
    );
    const syK = k<number>(
      [0, 1.2], [0.5, 1.16], [0.55, 0.68, 'outQuad'], [0.68, 1.12, 'outQuad'], [0.84, 1.0, 'inOutSine'],
      [1.12, 1.05], [1.18, 0.84, 'outQuad'], [1.28, 1.05, 'outQuad'], [1.36, 1, 'inOutSine'],
      [1.5, 1], [1.53, 0.93, 'outQuad'], [1.75, 1, 'softSpring'],
    );
    // Shadow follows the height with the same timing/easing.
    const shadowFrom = (v: number) => {
      const h = Math.max(0, Math.min(1, (ground - v) / (ground + 2 * u)));
      return h;
    };
    const shScale: Keyframe<number>[] = yK.map(([t, v, e]) => ({ t, v: 1 - 0.7 * shadowFrom(v), ...(e ? { e } : {}) }));
    const shOp: Keyframe<number>[] = yK.map(([t, v, e]) => ({ t, v: 1 - 0.85 * shadowFrom(v), ...(e ? { e } : {}) }));
    const shadowCol = isDark(x) ? shade(p.bg, -0.7) : shade(p.accent, -0.55);

    // ---- dust puffs on the first impact
    const dust: Layer[] = [];
    for (let i = 0; i < 8; i++) {
      const side = i % 2 ? 1 : -1;
      const t0 = 0.55 + r() * 0.04;
      const sx0 = cx + side * L * (0.32 + r() * 0.1);
      const out = side * (7 + r() * 9) * u;
      const rad = (1.0 + r() * 1.1) * u;
      dust.push(
        circle(`bd-dust-${i}`, rad, {
          x: k([t0, sx0], [t0 + 0.6, sx0 + out, 'outCubic']),
          y: k([t0, ground - rad * 0.6], [t0 + 0.6, ground - (2 + r() * 4) * u, 'outCubic']),
          scale: k([t0, 0.4], [t0 + 0.15, 1, 'outQuad'], [t0 + 0.6, 0, 'inQuad']),
          fill: alpha(p.fg, 0.16),
          start: t0,
          end: t0 + 0.62,
        }),
      );
    }

    return {
      background: p.bg,
      layers: [
        circle('bd-spot', L * 1.18, {
          x: cx,
          y: my,
          fill: radial(0.5, 0.5, 0.7, p.bg2, alpha(p.bg2, 0)),
          scale: k([0.45, 0], [1.3, 1, 'outBack']),
        }),
        ellipse('bd-shadow', {
          x: cx,
          y: ground + 0.4 * u,
          w: L * 0.92,
          h: L * 0.13,
          fill: radial(0.5, 0.5, 0.72, alpha(shadowCol, 0.32), alpha(shadowCol, 0)),
          scale: shScale,
          opacity: shOp,
        }),
        ...dust,
        x.logo('bd-logo', {
          size: L,
          x: cx,
          y: k<number>(...yK),
          ay: 1,
          color: p.accent,
          sx: sxK,
          sy: syK,
          rotation: k([0, -8], [0.55, 0, 'inQuad'], [0.88, 4, 'outQuad'], [1.18, 0, 'inQuad']),
        }),
        x.title('bd-name', x.c.brand, {
          size: nameSize,
          x: cx,
          y: ny,
          anim: ta.drop(1.3, { stagger: 0.05, dur: 0.85 }),
        }),
        x.body('bd-tag', x.c.tagline, {
          size: tagSize,
          x: cx,
          y: ty,
          fill: p.muted,
          anim: ta.pop(2.05, { by: 'word', stagger: 0.08, dur: 0.6 }),
        }),
      ],
    };
  },
};
