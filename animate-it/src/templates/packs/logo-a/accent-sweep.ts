import type { Layer, Mask } from '../../../engine/types';
import { type Recipe, k, rect, group, ta } from '../../kit';
import { estW, fit, stack, titleH, bodyH } from './util';

const E: [number, number, number, number] = [0.76, 0, 0.24, 1];

interface Wipe {
  id: string;
  x0: number;
  x1: number;
  yc: number;
  h: number;
  t0: number;
  dir: 1 | -1;
  color: string;
  lead: string;
  W: number;
  H: number;
}

/** A bar grows across [x0, x1], then retracts; the returned mask reveals content behind its trailing edge. */
function wipe(o: Wipe): { bars: Layer[]; mask: Mask; done: number } {
  const X = o.x1 - o.x0;
  const t1 = o.t0 + 0.55;
  const t2 = t1 + 0.08;
  const t3 = t2 + 0.7;
  const dl = 0.07;
  const from = o.dir === 1 ? o.x0 : o.x1;
  const to = o.dir === 1 ? o.x1 : o.x0;
  const ax = o.dir === 1 ? 0 : 1;
  const bar = (id: string, fill: string, a: number, b: number): Layer =>
    rect(id, {
      ax,
      y: o.yc,
      h: o.h,
      fill,
      x: k([o.t0 + a, from], [t2 + b, from], [t3 + b, to, E]),
      w: k([o.t0 + a, 0], [t1 + a, X, E], [t2 + b, X], [t3 + b, 0, E]),
    });
  const after = t3 + 0.02;
  const mask: Mask = {
    shape: 'rect',
    x: o.dir === 1 ? k([0, o.x0], [after, -o.W, 'hold']) : k([t2, o.x1], [t3, o.x0, E], [after, -o.W, 'hold']),
    w: k([t2, 0], [t3, X, E], [after, o.W * 3, 'hold']),
    y: k([0, o.yc - o.h / 2], [after, -o.H, 'hold']),
    h: k([0, o.h], [after, o.H * 3, 'hold']),
  };
  return { bars: [bar(o.id + '-lead', o.lead, -dl, dl), bar(o.id + '-bar', o.color, 0, 0)], mask, done: t3 };
}

export const accentSweep: Recipe = {
  id: 'accent-sweep',
  name: 'Accent Sweep',
  category: 'logo',
  tags: ['logo', 'wipe', 'bar', 'corporate', 'clean', 'lockup'],
  description: 'Two-tone bars sweep across your lockup and pull away to reveal the mark and name, finished with a crisp divider.',
  duration: 3.8,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Ledgerline' },
    { key: 'tagline', label: 'Tagline', default: 'Finance for builders' },
  ],
  variants: [
    { name: 'Cobalt', palette: 'cobalt', fonts: 'manrope', logo: 'stack', format: 'landscape' },
    { name: 'Slate', palette: 'slate', fonts: 'grotesk', logo: 'orbit', format: 'square', copy: { brand: 'Halden Health', tagline: 'Care that connects' } },
    { name: 'Citrus', palette: 'citrus', fonts: 'archivo', logo: 'arc', format: 'portrait', copy: { brand: 'Brightarc', tagline: 'Energy for everyday' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'outfit', logo: 'wave', format: 'story', copy: { brand: 'Tidewater', tagline: 'Coastal living' } },
    { name: 'Arctic', palette: 'arctic', fonts: 'sora', logo: 'prism', format: 'landscape', copy: { brand: 'Frostline', tagline: 'Cold-chain logistics' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const layers: Layer[] = [];
    const tagOpts = { body: true, upper: true, tracking: 0.14 };

    if (!x.tall) {
      // Horizontal lockup: [mark] | Name / TAGLINE
      const L = x.pick({ landscape: 25 * u, default: 19 * u });
      const gap = x.pick({ landscape: 9 * u, default: 6.5 * u });
      const textMax = W - x.pick({ landscape: 30 * u, default: 16 * u }) - L - gap;
      const nameSize = fit(x, x.c.brand, x.pick({ landscape: 13.5 * u, default: 10.5 * u }), textMax);
      const tagSize = fit(x, x.c.tagline, x.pick({ landscape: 3.7 * u, default: 3.1 * u }), textMax, tagOpts);
      const nH = titleH(x, nameSize);
      const tH = bodyH(tagSize);
      const g = x.pick({ landscape: 3.4 * u, default: 2.8 * u });
      const textW = Math.max(estW(x, x.c.brand, nameSize), estW(x, x.c.tagline, tagSize, tagOpts));
      const lockW = L + gap + textW;
      const left = cx - lockW / 2;
      const textX = left + L + gap;
      const bh = nH + g + tH;
      const nameY = cy - bh / 2 + nH / 2;
      const tagY = cy + bh / 2 - tH / 2;

      const w = wipe({ id: 'as-w', x0: left - 4 * u, x1: left + lockW + 4 * u, yc: cy, h: Math.max(L, bh) + 8 * u, t0: 0.3, dir: 1, color: p.accent, lead: p.accent2, W, H });
      const inner = group(
        'as-inner',
        [
          x.logo('as-logo', { size: L, x: left + L / 2, y: cy, color: p.fg }),
          x.title('as-name', x.c.brand, { size: nameSize, x: textX, y: nameY, ax: 0, align: 'left' }),
          x.body('as-tag', x.c.tagline, {
            size: tagSize,
            x: textX,
            y: tagY,
            ax: 0,
            align: 'left',
            fill: p.muted,
            weight: 600,
            uppercase: true,
            tracking: 0.14,
            anim: ta.rise(w.done - 0.25, { stagger: 0.05, from: { y: 1.6 } }),
          }),
        ],
        { x: k([w.done - 0.7, -5 * u], [w.done + 0.5, 0, 'outCubic']), y: 0, ax: 0, ay: 0, w: W, h: H },
      );
      layers.push(
        group('as-content', [inner], { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, mask: w.mask }),
        rect('as-divider', {
          x: left + L + gap / 2,
          y: cy,
          w: 0.4 * u,
          h: k([w.done, 0], [w.done + 0.7, Math.max(L, bh) * 0.86, 'outExpo']),
          radius: 0.2 * u,
          fill: p.accent,
        }),
        ...w.bars,
      );
    } else {
      // Stacked lockup: each row gets its own sweep, alternating direction.
      const L = x.pick({ story: 40 * u, default: 31 * u });
      const maxW = W - 16 * u;
      const nameSize = fit(x, x.c.brand, x.pick({ story: 14 * u, default: 11.5 * u }), maxW);
      const tagSize = fit(x, x.c.tagline, x.pick({ story: 4.4 * u, default: 3.7 * u }), maxW, tagOpts);
      const nH = titleH(x, nameSize);
      const tH = bodyH(tagSize);
      const [my, ny, ry, ty] = stack(cy, [L, nH, 0.8 * u, tH], [x.pick({ story: 11 * u, default: 9 * u }), 5 * u, 5 * u]);
      const nameW = Math.min(W - 6 * u, estW(x, x.c.brand, nameSize) * 1.06 + 9 * u);
      const tagW = Math.min(W - 6 * u, estW(x, x.c.tagline, tagSize, tagOpts) * 1.06 + 7 * u);
      const rows = [
        { id: 'as-r0', w: L + 9 * u, y: my, h: L + 8 * u, t0: 0.25, dir: 1 as const },
        { id: 'as-r1', w: nameW, y: ny, h: nH + 5 * u, t0: 0.5, dir: -1 as const },
        { id: 'as-r2', w: tagW, y: ty, h: tH + 3.4 * u, t0: 0.72, dir: 1 as const },
      ];
      const content: Layer[] = [
        x.logo('as-logo', { size: L, x: cx, y: my, color: p.fg }),
        x.title('as-name', x.c.brand, { size: nameSize, x: cx, y: ny }),
        x.body('as-tag', x.c.tagline, { size: tagSize, x: cx, y: ty, fill: p.muted, weight: 600, uppercase: true, tracking: 0.14 }),
      ];
      let done = 0;
      rows.forEach((r, i) => {
        const w = wipe({ id: r.id, x0: cx - r.w / 2, x1: cx + r.w / 2, yc: r.y, h: r.h, t0: r.t0, dir: r.dir, color: p.accent, lead: p.accent2, W, H });
        done = Math.max(done, w.done);
        const drift = r.dir * -4 * u;
        layers.push(
          group(`${r.id}-content`, [group(`${r.id}-inner`, [content[i]], { x: k([w.done - 0.7, drift], [w.done + 0.5, 0, 'outCubic']), y: 0, ax: 0, ay: 0, w: W, h: H })], {
            x: 0,
            y: 0,
            ax: 0,
            ay: 0,
            w: W,
            h: H,
            mask: w.mask,
          }),
          ...w.bars,
        );
      });
      layers.push(
        rect('as-rule', {
          x: cx,
          y: ry,
          h: 0.8 * u,
          radius: 0.4 * u,
          fill: p.accent,
          w: k([done - 0.1, 0], [done + 0.6, 12 * u, 'outExpo']),
        }),
      );
    }

    return { background: x.grad(160, p.bg, p.bg2), layers };
  },
};
