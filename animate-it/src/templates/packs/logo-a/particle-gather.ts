import type { Layer } from '../../../engine/types';
import { type Recipe, k, ellipse, group, circle, path, radial, ta, fadeIn, alpha, ICONS } from '../../kit';
import { estW, fit, stack, titleH, bodyH } from './util';

export const particleGather: Recipe = {
  id: 'particle-gather',
  name: 'Stardust Gather',
  category: 'logo',
  tags: ['logo', 'particles', 'converge', 'spiral', 'tech', 'dynamic'],
  description: 'A field of particles spirals inwards and condenses into a glowing core, which bursts into your mark with a shockwave.',
  duration: 4.2,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Constella' },
    { key: 'tagline', label: 'Tagline', default: 'Intelligence, assembled' },
  ],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'sora', logo: 'orbit', format: 'square' },
    { name: 'Cyber', palette: 'cyber', fonts: 'unbounded', logo: 'prism', format: 'story', copy: { brand: 'Neonix', tagline: 'Play without limits' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'manrope', logo: 'wave', format: 'landscape', copy: { brand: 'Driftwell', tagline: 'Ocean intelligence' } },
    { name: 'Forest', palette: 'forest', fonts: 'grotesk', logo: 'petal', format: 'portrait', copy: { brand: 'Fernhollow', tagline: 'Rewilding the city' } },
    { name: 'Azure', palette: 'azure', fonts: 'outfit', logo: 'knot', format: 'square', copy: { brand: 'Linkwise', tagline: 'Teams, connected' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const r = x.rand;
    const L = x.pick({ landscape: 26 * u, story: 40 * u, portrait: 32 * u, default: 30 * u });
    const maxW = Math.min(W - 14 * u, 130 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 10 * u, story: 14 * u, portrait: 12 * u, default: 11 * u }), maxW);
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 4.8 * u, default: 4 * u }), maxW, { body: true });
    const nH = titleH(x, nameSize);
    const tH = bodyH(tagSize);
    const [my, ny, ty] = stack(cy, [L, nH, tH], [x.pick({ story: 10 * u, default: 8 * u }), x.pick({ story: 4.5 * u, default: 3.6 * u })]);
    const POP = 1.55;

    // Lockup bounds, kept clear of the ambient particles.
    const bw = Math.max(L, estW(x, x.c.brand, nameSize), estW(x, x.c.tagline, tagSize, { body: true })) / 2 + 8 * u;
    const bx0 = cx - bw;
    const bx1 = cx + bw;
    const by0 = my - L / 2 - 8 * u;
    const by1 = ty + tH / 2 + 7 * u;

    const cols = [p.accent, p.accent2, p.fg];
    const swarm: Layer[] = [];
    const N = 32;
    for (let i = 0; i < N; i++) {
      const a = r() * Math.PI * 2;
      const dist = (0.35 + r() * 0.75) * Math.hypot(W, H) * 0.5;
      const sx = cx + Math.cos(a) * dist;
      const sy = my + Math.sin(a) * dist;
      const rad = (0.4 + r() * 0.85) * u;
      const ts = 0.15 + r() * 0.45;
      const tArr = 1.1 + r() * 0.4;
      const jx = (r() * 2 - 1) * 1.2 * u;
      const jy = (r() * 2 - 1) * 1.2 * u;
      const dx = Math.cos(a + 1.7) * (1.5 + r() * 3) * u;
      const dy = Math.sin(a + 1.7) * (1.5 + r() * 3) * u;
      swarm.push(
        circle(`pg-p-${i}`, rad, {
          x: k([0, sx], [ts, sx + dx, 'outSine'], [tArr, cx + jx, 'inOutCubic']),
          y: k([0, sy], [ts, sy + dy, 'outSine'], [tArr, my + jy, 'inCubic']),
          scale: k([ts, 1], [tArr, 0.3, 'inQuad']),
          opacity: k([0, 0], [0.12 + r() * 0.25, 0.95, 'outCubic'], [tArr - 0.05, 0.95], [tArr + 0.02, 0]),
          fill: cols[i % 3],
          end: 1.7,
        }),
      );
    }

    // Ambient specks that stay in the poster, away from the lockup.
    const ambient: Layer[] = [];
    let tries = 0;
    while (ambient.length < 11 && tries < 400) {
      tries++;
      const ax = W * (0.05 + r() * 0.9);
      const ay = H * (0.05 + r() * 0.9);
      if (ax > bx0 && ax < bx1 && ay > by0 && ay < by1) continue;
      const i = ambient.length;
      const drift = (r() * 2 - 1) * 3 * u;
      ambient.push(
        circle(`pg-a-${i}`, (0.35 + r() * 0.55) * u, {
          x: k([0, ax], [4.2, ax + drift, 'linear']),
          y: k([0, ay], [4.2, ay - (1 + r() * 3) * u, 'linear']),
          fill: i % 2 ? p.accent2 : p.accent,
          opacity: k([0, 0], [0.4 + r() * 0.6, 0.25 + r() * 0.4, 'outCubic']),
        }),
      );
    }

    const sparkles: Layer[] = Array.from({ length: 6 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 6) * Math.PI * 2 + r() * 0.5;
      const rr = L * (0.62 + r() * 0.22);
      const t0 = POP + 0.12 + i * 0.06;
      const s = (2.2 + r() * 1.6) * u;
      return path(`pg-spark-${i}`, ICONS.sparkle, 24, 24, {
        x: cx + Math.cos(a) * rr,
        y: my + Math.sin(a) * rr,
        w: s,
        h: s,
        fill: i % 2 ? p.accent2 : p.fg,
        scale: k([t0, 0], [t0 + 0.3, 1, 'outBack'], [t0 + 0.8, 0, 'inCubic']),
        rotation: k([t0, -40], [t0 + 0.8, 40, 'linear']),
        start: t0,
        end: t0 + 0.85,
      });
    });

    return {
      background: radial(0.5, my / H, 0.9, p.bg2, p.bg),
      layers: [
        ...ambient,
        circle('pg-glow', L * 1.1, {
          x: cx,
          y: my,
          fill: radial(0.5, 0.5, 0.7, alpha(p.accent, 0.45), alpha(p.accent, 0)),
          scale: k([0.6, 0.2], [POP, 1, 'outCubic']),
          opacity: k([0.6, 0], [1.3, 1], [2.6, 0.6, 'inOutCubic']),
        }),
        group('pg-swarm', swarm, {
          x: cx,
          y: my,
          w: W,
          h: H,
          ax: cx / W,
          ay: my / H,
          rotation: k([0, -55], [1.6, 0, 'outCubic']),
        }),
        circle('pg-core', 2.4 * u, {
          x: cx,
          y: my,
          fill: p.accent2,
          scale: k([0.7, 0], [POP - 0.05, 1.5, 'inQuad'], [POP + 0.08, 0, 'inQuad']),
          end: POP + 0.1,
        }),
        ellipse('pg-shock', {
          x: cx,
          y: my,
          w: L * 1.15,
          h: L * 1.15,
          stroke: p.accent2,
          strokeWidth: 0.45 * u,
          scale: k([POP, 0.3], [POP + 0.8, 2.1, 'outCubic']),
          opacity: k([POP - 0.01, 0], [POP + 0.02, 1], [POP + 0.8, 0, 'inQuad']),
          start: POP - 0.02,
          end: POP + 0.82,
        }),
        ellipse('pg-shock2', {
          x: cx,
          y: my,
          w: L * 1.15,
          h: L * 1.15,
          stroke: p.accent,
          strokeWidth: 0.25 * u,
          scale: k([POP + 0.1, 0.3], [POP + 1.0, 2.7, 'outCubic']),
          opacity: k([POP + 0.09, 0], [POP + 0.12, 0.8], [POP + 1.0, 0, 'inQuad']),
          start: POP + 0.08,
          end: POP + 1.02,
        }),
        x.logo('pg-logo', {
          size: L,
          x: cx,
          y: my,
          color: p.fg,
          scale: k([POP - 0.03, 0], [POP + 0.7, 1, 'spring']),
          opacity: fadeIn(POP - 0.03, 0.1),
        }),
        ...sparkles,
        x.title('pg-name', x.c.brand, {
          size: nameSize,
          x: cx,
          y: ny,
          anim: ta.center(POP + 0.35, { dur: 0.8, stagger: 0.04 }),
        }),
        x.body('pg-tag', x.c.tagline, {
          size: tagSize,
          x: cx,
          y: ty,
          fill: p.muted,
          anim: ta.blur(POP + 0.8, { stagger: 0.07 }),
        }),
      ],
    };
  },
};
