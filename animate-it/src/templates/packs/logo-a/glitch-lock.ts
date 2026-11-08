import type { GradientStop, Layer } from '../../../engine/types';
import { type Recipe, k, rect, group, path, ta, alpha } from '../../kit';
import { estW, fit, stack, titleH, bodyH, jitter, holds, isDark } from './util';

export const glitchLock: Recipe = {
  id: 'glitch-lock',
  name: 'Signal Lock',
  category: 'logo',
  tags: ['logo', 'glitch', 'rgb split', 'tech', 'gaming', 'edgy', 'new'],
  description: 'Your mark and name tear through a burst of digital interference, then snap into a clean lock with a chromatic edge.',
  duration: 3.6,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Nullbyte' },
    { key: 'tagline', label: 'Tagline', default: 'Security, rewritten' },
  ],
  variants: [
    { name: 'Cyber', palette: 'cyber', fonts: 'mono', logo: 'prism', format: 'portrait' },
    { name: 'Noir', palette: 'noir', fonts: 'archivo', logo: 'knot', format: 'square', copy: { brand: 'Static Club', tagline: 'Live every Friday' } },
    { name: 'Midnight', palette: 'midnight', fonts: 'space', logo: 'stack', format: 'landscape', copy: { brand: 'Stackframe', tagline: 'Developer tools' } },
    { name: 'Graphite', palette: 'graphite', fonts: 'syne', logo: 'orbit', format: 'story', copy: { brand: 'Orbyte', tagline: 'Next-gen gaming' } },
    { name: 'Electric', palette: 'electric', fonts: 'unbounded', logo: 'arc', format: 'portrait', copy: { brand: 'Voltage FM', tagline: 'Radio for the restless' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const r = x.rand;
    const dark = isDark(x);
    const blend: GlobalCompositeOperation = dark ? 'screen' : 'multiply';
    const LOCK = 1.7;
    const L = x.pick({ landscape: 26 * u, story: 40 * u, portrait: 32 * u, default: 30 * u });
    const maxW = Math.min(W - 16 * u, 130 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 10 * u, story: 13.5 * u, portrait: 12 * u, default: 11 * u }), maxW);
    const tagOpts = { body: true, upper: true, tracking: 0.2 };
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 4 * u, default: 3.4 * u }), maxW, tagOpts);
    const nH = titleH(x, nameSize);
    const tH = bodyH(tagSize);
    const [my, ny, ty] = stack(cy, [L, nH, tH], [x.pick({ story: 10 * u, default: 8 * u }), x.pick({ story: 5 * u, default: 4 * u })]);
    const cA = p.accent;
    const cB = p.accent2 === p.fg ? p.accent : p.accent2;

    // ---- mark: horizontal bands that tear independently, plus two tinted ghosts.
    const NB = 6;
    const bandH = L / NB;
    const bands: Layer[] = Array.from({ length: NB }, (_, i) =>
      group(`gl-band-${i}`, [x.logo(`gl-band-${i}-logo`, { size: L, x: L / 2, y: L / 2, color: p.fg })], {
        x: jitter(r, { t0: 0.12, t1: LOCK, amp: 7 * u, base: L / 2, prob: 0.45 }),
        y: L / 2,
        w: L,
        h: L,
        mask: { shape: 'rect', x: -L * 2, y: i * bandH - 0.6, w: L * 5, h: bandH + 1.2 },
      }),
    );
    const ghost = (id: string, color: string, final: number) =>
      x.logo(id, {
        size: L,
        x: jitter(r, { t0: 0.1, t1: LOCK, amp: 5 * u, base: L / 2, final, prob: 0.8 }),
        y: jitter(r, { t0: 0.1, t1: LOCK, amp: 1.2 * u, base: L / 2, prob: 0.4 }),
        color,
        blend,
        opacity: holds(0, [0.1, 0.9], [LOCK, 0.85]),
      });
    const mark = group('gl-mark', [...bands, ghost('gl-ghost-a', cA, -0.5 * u), ghost('gl-ghost-b', cB, 0.5 * u)], {
      x: cx,
      y: my,
      w: L,
      h: L,
      opacity: holds(0, [0.1, 1], [0.16, 0], [0.24, 1], [0.33, 0.3], [0.38, 1], [0.9, 0.4], [0.94, 1]),
      scale: k([LOCK, 1.06], [LOCK + 0.5, 1, 'outCubic']),
    });

    // ---- wordmark: same treatment, full-width bands.
    const nb = nH * 1.7;
    const NNB = 3;
    const nameBands: Layer[] = Array.from({ length: NNB }, (_, i) =>
      group(`gl-nb-${i}`, [x.title(`gl-nb-${i}-t`, x.c.brand, { size: nameSize, x: W / 2, y: nb / 2 })], {
        x: jitter(r, { t0: 0.3, t1: LOCK, amp: 6 * u, base: W / 2, prob: 0.5 }),
        y: nb / 2,
        w: W,
        h: nb,
        mask: { shape: 'rect', x: -W, y: (i * nb) / NNB - 0.6, w: W * 3, h: nb / NNB + 1.2 },
      }),
    );
    const nameGhost = (id: string, color: string, final: number) =>
      x.title(id, x.c.brand, {
        size: nameSize,
        x: jitter(r, { t0: 0.3, t1: LOCK, amp: 4 * u, base: W / 2, final, prob: 0.8 }),
        y: nb / 2,
        fill: color,
        blend,
        opacity: holds(0, [0.3, 0.9], [LOCK, 0.8]),
      });
    const name = group('gl-name', [...nameBands, nameGhost('gl-ng-a', cA, -0.32 * u), nameGhost('gl-ng-b', cB, 0.32 * u)], {
      x: cx,
      y: ny,
      w: W,
      h: nb,
      opacity: holds(0, [0.28, 1], [0.36, 0], [0.46, 1], [1.1, 0.2], [1.15, 1]),
      scale: k([LOCK, 1.04], [LOCK + 0.5, 1, 'outCubic']),
    });

    // ---- interference: flickering slabs around the lockup.
    const top = my - L / 2 - 6 * u;
    const bottom = ny + nH;
    const blocks: Layer[] = Array.from({ length: 8 }, (_, i) => {
      const bursts = Array.from({ length: 3 }, () => 0.15 + r() * (LOCK - 0.3)).sort((a, b) => a - b);
      const xs: [number, number][] = [];
      const ys: [number, number][] = [];
      const ws: [number, number][] = [];
      const op: [number, number][] = [];
      for (const t of bursts) {
        xs.push([t, cx + (r() * 2 - 1) * Math.min(W * 0.4, 45 * u)]);
        ys.push([t, top + r() * (bottom - top)]);
        ws.push([t, (8 + r() * 34) * u]);
        op.push([t, 0.9], [t + 0.05 + r() * 0.08, 0]);
      }
      op.sort((a, b) => a[0] - b[0]);
      return rect(`gl-block-${i}`, {
        x: holds(xs[0][1], ...xs),
        y: holds(ys[0][1], ...ys),
        w: holds(ws[0][1], ...ws),
        h: (0.5 + r() * 1.8) * u,
        fill: [cA, cB, p.fg][i % 3],
        blend: i % 3 === 2 ? undefined : blend,
        opacity: holds(0, ...op),
        end: LOCK,
      });
    });

    // Scanlines (one gradient layer) that fade once the signal locks.
    const pitch = 1.4 * u;
    const lines = Math.ceil(H / pitch);
    const stops: GradientStop[] = [];
    const on = alpha(p.fg, dark ? 0.07 : 0.05);
    const off = alpha(p.fg, 0);
    for (let i = 0; i < lines; i++) {
      stops.push({ o: i / lines, c: on }, { o: (i + 0.5) / lines, c: off });
    }
    const scan = rect('gl-scan', {
      x: 0,
      y: 0,
      ax: 0,
      ay: 0,
      w: W,
      h: H,
      fill: { kind: 'linear', angle: 90, stops },
      opacity: k([0, 1], [LOCK, 1], [LOCK + 0.4, 0, 'outCubic']),
      end: LOCK + 0.45,
    });

    // Viewfinder brackets that lock onto the lockup.
    const tagW = estW(x, x.c.tagline, tagSize, tagOpts);
    const halfW = Math.min(W / 2 - 5 * u, Math.max(L, estW(x, x.c.brand, nameSize), tagW) / 2 + 9 * u);
    const bTop = my - L / 2 - 7 * u;
    const bBot = ty + tH / 2 + 6 * u;
    const bs = 5 * u;
    const corners: [number, number, number][] = [
      [cx - halfW, bTop, 0],
      [cx + halfW, bTop, 90],
      [cx + halfW, bBot, 180],
      [cx - halfW, bBot, 270],
    ];
    const brackets = corners.map(([bx, by, rot], i) => {
      const ox = bx < cx ? -1 : 1;
      const oy = by < my ? -1 : 1;
      return path(`gl-br-${i}`, 'M0 10 V0 H10', 10, 10, {
        x: k([LOCK - 0.1, bx + ox * 6 * u], [LOCK + 0.45, bx, 'outExpo']),
        y: k([LOCK - 0.1, by + oy * 6 * u], [LOCK + 0.45, by, 'outExpo']),
        w: bs,
        h: bs,
        ax: 0,
        ay: 0,
        rotation: rot,
        stroke: alpha(p.fg, 0.55),
        strokeWidth: (0.4 * u * 10) / bs,
        lineCap: 'square',
        opacity: holds(0, [LOCK - 0.1, 1], [LOCK - 0.05, 0.2], [LOCK, 1]),
      });
    });

    const layers: Layer[] = [scan, mark, name, ...blocks, ...brackets];
    if (dark) {
      layers.push(
        rect('gl-flash', {
          x: 0,
          y: 0,
          ax: 0,
          ay: 0,
          w: W,
          h: H,
          fill: p.fg,
          opacity: k([LOCK - 0.01, 0], [LOCK, 0.16, 'hold'], [LOCK + 0.35, 0, 'outCubic']),
          start: LOCK - 0.02,
          end: LOCK + 0.4,
        }),
      );
    }
    layers.push(
      x.body('gl-tag', x.c.tagline, {
        size: tagSize,
        x: cx,
        y: ty,
        fill: dark ? cB : p.accent,
        weight: 600,
        uppercase: true,
        tracking: 0.2,
        anim: ta.type(LOCK + 0.3, { stagger: 0.035 }),
      }),
    );

    return { background: p.bg, layers };
  },
};
