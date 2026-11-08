import { type Recipe, k, rect, group, ta, fadeIn } from '../../kit';
import { fit, stack, titleH, bodyH } from './util';

export const splitShift: Recipe = {
  id: 'split-shift',
  name: 'Split Shift',
  category: 'logo',
  tags: ['logo', 'split', 'mask', 'reveal', 'bold', 'two-tone'],
  description: 'Your mark and name arrive in two halves that slide in from opposite sides and lock together on a two-tone split.',
  duration: 4,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Shiftworks' },
    { key: 'tagline', label: 'Tagline', default: 'Built to move' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'archivo', logo: 'prism', format: 'portrait' },
    { name: 'Midnight', palette: 'midnight', fonts: 'unbounded', logo: 'orbit', format: 'landscape', copy: { brand: 'Orbitra', tagline: 'Data in orbit' } },
    { name: 'Paper', palette: 'paper', fonts: 'dmserif', logo: 'arc', format: 'square', copy: { brand: 'Archer & Lowe', tagline: 'Architecture studio' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'outfit', logo: 'wave', format: 'story', copy: { brand: 'Wavelet', tagline: 'Sound for creators' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'sora', logo: 'stack', format: 'portrait', copy: { brand: 'Layerstack', tagline: 'Cloud infrastructure' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const L = x.pick({ landscape: 30 * u, story: 44 * u, portrait: 36 * u, default: 32 * u });
    const maxW = Math.min(W - 14 * u, 140 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 10.5 * u, story: 14 * u, portrait: 12 * u, default: 11 * u }), maxW);
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 5.2 * u, default: 4.4 * u }), maxW, { body: true });
    const nH = titleH(x, nameSize);
    const [my, ny, ty] = stack(cy - x.pick({ landscape: 1 * u, default: 2 * u }), [L, nH, bodyH(tagSize)], [x.pick({ story: 13 * u, default: 10 * u }), x.pick({ story: 4.6 * u, default: 3.8 * u })]);
    const split = my;

    // Two-tone stage: the lower panel slides in from the right and settles on the split line.
    const panel = rect('ss-panel', {
      x: k([0, W], [0.85, 0, [0.7, 0, 0.2, 1]]),
      y: split,
      ax: 0,
      ay: 0,
      w: W,
      h: H - split,
      fill: p.bg2,
    });
    const seam = rect('ss-seam', {
      x: cx,
      y: split,
      h: 0.42 * u,
      fill: p.accent,
      w: k([0.1, 0], [0.8, W, [0.7, 0, 0.2, 1]], [1.25, W], [1.85, 0, 'inOutCubic']),
    });

    const travel = x.pick({ landscape: 54 * u, default: 44 * u });
    const half = (id: string, top: boolean) =>
      group(id, [x.logo(id + '-logo', { size: L, x: L / 2, y: L / 2, color: top ? p.fg : p.accent })], {
        x: k([0.3, L / 2 + (top ? -travel : travel)], [1.2, L / 2, [0.65, 0, 0.15, 1]]),
        y: L / 2,
        w: L,
        h: L,
        opacity: fadeIn(0.3, 0.25),
        mask: { shape: 'rect', x: -L, y: top ? -L : L / 2, w: L * 3, h: top ? L * 1.5 : L * 1.5 },
      });
    const mark = group('ss-mark', [half('ss-top', true), half('ss-bot', false)], {
      x: cx,
      y: my,
      w: L,
      h: L,
      scale: k([1.18, 1], [1.3, 1.045, 'outQuad'], [1.9, 1, 'outCubic']),
    });

    // The wordmark splits the same way, halves crossing in the opposite directions.
    const nBox = nH * 1.5;
    const nameHalf = (id: string, top: boolean) =>
      group(
        id,
        [x.title(id + '-t', x.c.brand, { size: nameSize, x: W / 2, y: nBox / 2 })],
        {
          x: k([0.9, cx + (top ? 1 : -1) * travel * 0.6], [1.8, cx, [0.65, 0, 0.15, 1]]),
          y: ny,
          w: W,
          h: nBox,
          opacity: fadeIn(0.9, 0.3),
          mask: { shape: 'rect', x: -W, y: top ? -nBox : nBox / 2, w: W * 3, h: nBox * 1.5 },
        },
      );

    return {
      background: p.bg,
      layers: [
        panel,
        seam,
        mark,
        nameHalf('ss-name-top', true),
        nameHalf('ss-name-bot', false),
        x.body('ss-tag', x.c.tagline, {
          size: tagSize,
          x: cx,
          y: ty,
          fill: p.muted,
          anim: ta.rise(1.75, { stagger: 0.06, from: { y: 1.6 } }),
        }),
      ],
    };
  },
};
