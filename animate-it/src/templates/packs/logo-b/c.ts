/**
 * logo-b, part C: Confetti Launch, Panel Sweep, Pixel Mosaic, Seal Stamp.
 */
import type { Ease, Layer, TextAnim } from '../../../engine/types';
import {
  type Recipe,
  k,
  rect,
  circle,
  ellipse,
  group,
  path,
  radial,
  linear,
  ta,
  alpha,
  shade,
  lerpColor,
  starPath,
  rng,
} from '../../kit';
import {
  brandField,
  taglineField,
  fitTitle,
  fitBody,
  titleW,
  titleH,
  bodyW,
  charEm,
  sampled,
  easeAt,
  hLockup,
  colorful,
  thenBob,
} from './shared';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ------------------------------------------------------------------ 9. Confetti Launch

const confettiLaunch: Recipe = {
  id: 'confetti-launch',
  name: 'Confetti Launch',
  category: 'logo',
  tags: ['logo', 'confetti', 'launch', 'celebration', 'party', 'announcement'],
  description: 'Your mark pops with a burst of confetti and side cannons: made for launches, openings and big news.',
  duration: 4.6,
  usesLogo: true,
  fields: [brandField('Partyline'), taglineField('Now live')],
  variants: [
    { name: 'Lilac', palette: 'lilac', fonts: 'grotesk', logo: 'stack', format: 'square' },
    { name: 'Electric', palette: 'electric', fonts: 'poppins', logo: 'orbit', format: 'story', copy: { brand: 'Hooray', tagline: 'Launching today' } },
    { name: 'Peach', palette: 'peach', fonts: 'syne', logo: 'petal', format: 'landscape', copy: { brand: 'Fiesta Co', tagline: 'Grand opening' } },
    { name: 'Midnight', palette: 'midnight', fonts: 'archivo', logo: 'prism', format: 'portrait', copy: { brand: 'Popcorn+', tagline: 'Now streaming' } },
    { name: 'Citrus', palette: 'citrus', fonts: 'outfit', logo: 'wave', format: 'story', copy: { brand: 'Sprinkle', tagline: 'Sale starts now' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const dur = 4.6;
    const D = x.pick({ story: 46 * u, portrait: 36 * u, landscape: 28 * u, default: 30 * u });
    const L = D * 0.52;
    const maxTW = x.pick({ landscape: 110 * u, default: 84 * u });
    const B = fitTitle(x, x.c.brand, x.pick({ story: 16 * u, portrait: 13 * u, default: 11 * u }), maxTW);
    const tTrack = 0.16;
    const T = fitBody(x, x.c.tagline, x.pick({ story: 4.2 * u, portrait: 3.4 * u, default: 3.1 * u }), maxTW - 10 * u, tTrack, true);
    const bh = titleH(x, B);
    const pillH = T * 2.7;
    const pillW = bodyW(x, x.c.tagline, T, tTrack, true) + T * 3.4;
    const g1 = x.pick({ story: 10 * u, default: 6.5 * u });
    const g2 = x.pick({ story: 5 * u, default: 3.6 * u });
    const block = D + g1 + bh + g2 + pillH;
    const top = cy - block / 2;
    const my = top + D / 2;
    const brandY = top + D + g1;
    const pillY = brandY + bh + g2 + pillH / 2;

    const cols = [
      p.accent,
      shade(p.accent, 0.45),
      colorful(p.accent2) ? p.accent2 : shade(p.accent, -0.25),
      colorful(p.accent2) ? shade(p.accent2, 0.35) : lerpColor(p.accent, p.bg2, 0.45),
    ];
    const r = rng(x.seed * 131 + 7);
    const kDrag = 2.5;
    const vt = 15 * u;
    const sx = x.pick({ landscape: 1.6, default: 1 });
    const sy = x.pick({ story: 1.45, portrait: 1.15, default: 1 });

    type Piece = { x0: number; y0: number; vx: number; vy: number; t0: number };
    const pieces: Piece[] = [];
    const tb = 0.52;
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2 + (r() - 0.5) * 0.35;
      const s = (75 + r() * 95) * u;
      pieces.push({ x0: cx, y0: my, vx: Math.cos(a) * s * sx, vy: Math.sin(a) * s * sy - 35 * u, t0: tb });
    }
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < 12; i++) {
        const a = -Math.PI / 2 + (side ? -1 : 1) * (0.32 + r() * 0.42);
        const s = (120 + r() * 90) * u * Math.max(1, sy * 0.95);
        pieces.push({ x0: side ? W + 2 * u : -2 * u, y0: H + 2 * u, vx: Math.cos(a) * s * Math.min(sx, 1.3), vy: Math.sin(a) * s, t0: 0.66 + i * 0.012 });
      }
    }
    const confetti: Layer[] = pieces.map((pc, i) => {
      const kind = i % 4;
      const col = cols[(i * 7 + (i >> 2)) % cols.length];
      const spin = (r() > 0.5 ? 1 : -1) * (220 + r() * 420);
      const rot0 = r() * 360;
      const flip = 6 + r() * 8;
      const ph = r() * Math.PI * 2;
      const sway = (1 + r() * 1.6) * u;
      const posX = (t: number) => {
        const tau = Math.max(0, t - pc.t0);
        const e = 1 - Math.exp(-kDrag * tau);
        return pc.x0 + (pc.vx * e) / kDrag + Math.sin(tau * 4.5 + ph) * sway * e;
      };
      const posY = (t: number) => {
        const tau = Math.max(0, t - pc.t0);
        return pc.y0 + vt * tau + ((pc.vy - vt) * (1 - Math.exp(-kDrag * tau))) / kDrag;
      };
      const common = {
        x: sampled(pc.t0, dur, 0.08, posX, 2),
        y: sampled(pc.t0, dur, 0.08, posY, 2),
        rotation: sampled(pc.t0, dur, 0.16, (t) => rot0 + spin * (t - pc.t0), 1),
        fill: col,
        start: pc.t0,
      };
      const big = x.pick({ story: 1.25, default: 1 }) * (0.85 + r() * 0.35);
      if (kind === 1) return circle(`conf-${i}`, 1.05 * u * big, common);
      const dims = kind === 0 ? [2.2, 3.4] : kind === 2 ? [1, 5.2] : [2.4, 2.4];
      return rect(`conf-${i}`, {
        ...common,
        w: dims[0] * u * big,
        h: dims[1] * u * big,
        radius: kind === 2 ? 0.5 * u : 0.3 * u,
        sx: sampled(pc.t0, dur, 0.08, (t) => Math.cos((t - pc.t0) * flip + ph), 2),
      });
    });

    const sparkles: Layer[] = [
      { a: -2.35, d: 0.78, s: 4.2 },
      { a: -0.55, d: 0.86, s: 3.2 },
      { a: 0.35, d: 0.8, s: 2.4 },
    ].map((o, i) => {
      const t0 = 0.75 + i * 0.12;
      return path(`sparkle-${i}`, starPath(4, 0.32), 100, 100, {
        x: cx + Math.cos(o.a) * D * o.d,
        y: my + Math.sin(o.a) * D * o.d,
        w: o.s * u,
        h: o.s * u,
        fill: i === 1 ? cols[2] : p.accent,
        scale: thenBob(k([t0, 0], [t0 + 0.5, 1, 'outBack']), 1, 0.18, t0 + 0.5, dur, 2, i % 2 ? 1 : -1),
        rotation: k([t0, -90], [dur, 45, 'outCubic']),
      });
    });

    return {
      background: radial(0.5, my / H, 0.9, p.bg2, p.bg),
      layers: [
        ellipse('charge', {
          x: cx,
          y: my,
          w: k([0.05, D * 2.4], [0.5, D * 0.4, 'inCubic']),
          h: k([0.05, D * 2.4], [0.5, D * 0.4, 'inCubic']),
          stroke: p.accent,
          strokeWidth: k([0.05, 0.3 * u], [0.5, 1.2 * u, 'inCubic']),
          opacity: k([0.05, 0], [0.3, 0.8], [0.5, 1]),
          end: 0.5,
        }),
        ...confetti,
        ellipse('flash', {
          x: cx,
          y: my,
          w: k([0.5, D], [1.2, D * 2.3, 'outCubic']),
          h: k([0.5, D], [1.2, D * 2.3, 'outCubic']),
          stroke: p.accent,
          strokeWidth: k([0.5, 2 * u], [1.2, 0.2 * u, 'outCubic']),
          opacity: k([0.5, 0.8], [1.2, 0, 'inSine']),
          start: 0.5,
          end: 1.2,
        }),
        circle('disc', D / 2, {
          x: cx,
          y: my,
          fill: linear(135, shade(p.accent, 0.12), shade(p.accent, -0.1)),
          shadow: { color: alpha(shade(p.accent, -0.5), 0.3), blur: 4 * u, y: 1.5 * u },
          scale: k([0.45, 0], [1.2, 1, 'spring']),
        }),
        x.logo('mark', {
          size: L,
          x: cx,
          y: my,
          color: p.onAccent,
          scale: k([0.55, 0], [1.25, 1, 'outBack']),
          rotation: k([0.55, -30], [1.3, 0, 'outBack']),
        }),
        ...sparkles,
        x.title('brand', x.c.brand, {
          size: B,
          x: cx,
          y: brandY,
          ay: 0,
          anim: ta.pop(0.95, { stagger: 0.035, dur: 0.55 }),
        }),
        group(
          'pill',
          [
            rect('pill-bg', { x: pillW / 2, y: pillH / 2, w: pillW, h: pillH, radius: pillH / 2, fill: p.accent }),
            x.body('pill-label', x.c.tagline, {
              size: T,
              x: pillW / 2,
              y: pillH / 2,
              weight: 700,
              fill: p.onAccent,
              uppercase: true,
              tracking: tTrack,
              anim: ta.chars(1.65, { stagger: 0.02, dur: 0.4 }),
            }),
          ],
          { x: cx, y: pillY, w: pillW, h: pillH, scale: k([1.4, 0], [1.95, 1, 'outBack']) },
        ),
      ],
    };
  },
};

// ------------------------------------------------------------------ 10. Panel Sweep

const panelSweep: Recipe = {
  id: 'panel-sweep',
  name: 'Panel Sweep',
  category: 'logo',
  tags: ['logo', 'panels', 'wipe', 'colour', 'bold', 'agency', 'transition'],
  description: 'Four colour panels sweep across in quick succession; the last one carries your lockup and leaves a striped edge.',
  duration: 4.0,
  usesLogo: true,
  fields: [brandField('Layerform'), taglineField('Design systems studio')],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'space', logo: 'stack', format: 'portrait' },
    { name: 'Sunset', palette: 'sunset', fonts: 'anton', logo: 'arc', format: 'landscape', copy: { brand: 'Chroma', tagline: 'Paint & print' } },
    { name: 'Noir', palette: 'noir', fonts: 'grotesk', logo: 'prism', format: 'square', copy: { brand: 'Shiftwork', tagline: 'Move forward' } },
    { name: 'Forest', palette: 'forest', fonts: 'dmserif', logo: 'petal', format: 'story', copy: { brand: 'Greenhouse', tagline: 'Plant shop & café' } },
    { name: 'Cobalt Cream', palette: 'cobalt', fonts: 'manrope', logo: 'knot', format: 'square', copy: { brand: 'Tandem', tagline: 'Better together' } },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const vertical = x.tall;
    const land = x.isLandscape;
    const sW = x.pick({ landscape: 4.5 * u, story: 5 * u, default: 4 * u });
    const sweep: Ease = [0.75, 0, 0.15, 1];
    const dPanel = 0.9;
    const t0s = [0, 0.16, 0.32, 0.48];
    const cols = [
      shade(p.accent, 0.5),
      colorful(p.accent2) ? p.accent2 : shade(p.accent, -0.3),
      p.fg,
      p.accent,
    ];
    const ink = p.onAccent;

    // Area of the final panel (local to its group).
    const areaW = vertical ? W : W - 3 * sW;
    const areaH = vertical ? H - 3 * sW : H;
    const acx = areaW / 2;
    const acy = areaH / 2;

    const tTrack = 0.16;
    const t3 = t0s[3];
    const tl = t3 + dPanel;
    let lockup: Layer[];
    if (land) {
      const Lm = 30 * u;
      const B = fitTitle(x, x.c.brand, 13 * u, areaW - Lm - 40 * u);
      const T = fitBody(x, x.c.tagline, 3.4 * u, areaW - Lm - 40 * u, tTrack, true);
      const tw = Math.max(titleW(x, x.c.brand, B), bodyW(x, x.c.tagline, T, tTrack, true));
      const total = Lm + 9 * u + tw;
      const left = acx - total / 2;
      const bh = titleH(x, B);
      const blk = bh + 2.4 * u + T * 1.35;
      lockup = [
        x.logo('mark', {
          size: Lm,
          x: k([tl - 0.55, left + Lm / 2 - 26 * u], [tl + 0.35, left + Lm / 2, 'outExpo']),
          y: acy,
          color: ink,
          opacity: k([tl - 0.55, 0], [tl - 0.15, 1]),
          rotation: k([tl - 0.55, -50], [tl + 0.4, 0, 'outExpo']),
        }),
        x.title('brand', x.c.brand, {
          size: B,
          x: left + Lm + 9 * u,
          y: acy - blk / 2,
          ax: 0,
          ay: 0,
          align: 'left',
          fill: ink,
          anim: ta.rise(tl - 0.2, { dur: 0.85, stagger: 0.08 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: T,
          x: left + Lm + 9 * u,
          y: acy - blk / 2 + bh + 2.4 * u,
          ax: 0,
          ay: 0,
          align: 'left',
          fill: alpha(ink, 0.8),
          weight: 600,
          uppercase: true,
          tracking: tTrack,
          anim: ta.chars(tl + 0.2, { stagger: 0.02 }),
        }),
      ];
    } else {
      const Lm = x.pick({ story: 34 * u, portrait: 28 * u, default: 26 * u });
      const maxTW = areaW - 16 * u;
      const B = fitTitle(x, x.c.brand, x.pick({ story: 14 * u, portrait: 12 * u, default: 11 * u }), maxTW);
      const T = fitBody(x, x.c.tagline, x.pick({ story: 4 * u, default: 3.3 * u }), maxTW, tTrack, true);
      const bh = titleH(x, B);
      const g1 = x.pick({ story: 9 * u, default: 6 * u });
      const g2 = 2.8 * u;
      const blk = Lm + g1 + bh + g2 + T * 1.35;
      const top = acy - blk / 2;
      lockup = [
        x.logo('mark', {
          size: Lm,
          x: vertical ? acx : k([tl - 0.55, acx - 22 * u], [tl + 0.35, acx, 'outExpo']),
          y: vertical ? k([tl - 0.55, top + Lm / 2 - 22 * u], [tl + 0.35, top + Lm / 2, 'outExpo']) : top + Lm / 2,
          color: ink,
          opacity: k([tl - 0.55, 0], [tl - 0.15, 1]),
          rotation: k([tl - 0.55, -50], [tl + 0.4, 0, 'outExpo']),
        }),
        x.title('brand', x.c.brand, {
          size: B,
          x: acx,
          y: top + Lm + g1,
          ay: 0,
          fill: ink,
          anim: ta.rise(tl - 0.2, { dur: 0.85, stagger: 0.08 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: T,
          x: acx,
          y: top + Lm + g1 + bh + g2,
          ay: 0,
          fill: alpha(ink, 0.8),
          weight: 600,
          uppercase: true,
          tracking: tTrack,
          anim: ta.chars(tl + 0.2, { stagger: 0.02 }),
        }),
      ];
    }

    const panels: Layer[] = cols.map((c, i) => {
      const t0 = t0s[i];
      const off = i * sW;
      const motion = vertical
        ? { x: 0, y: k([t0, -H - 14 * u], [t0 + dPanel, off, sweep]) }
        : {
            x: k([t0, -W - 14 * u], [t0 + dPanel, off, sweep]),
            y: 0,
            skewX: k([t0, 0], [t0 + dPanel * 0.45, -10, 'inOutSine'], [t0 + dPanel, 0, 'outCubic']),
          };
      const bg = rect(`panel-${i}-bg`, {
        x: -6 * u,
        y: -6 * u,
        w: W + 20 * u,
        h: H + 20 * u,
        ax: 0,
        ay: 0,
        fill: c,
      });
      return group(`panel-${i}`, i === 3 ? [bg, ...lockup] : [bg], {
        ...motion,
        w: vertical ? W : W - off,
        h: vertical ? H - off : H,
        ax: 0,
        ay: 0,
        clip: true,
      });
    });

    return {
      background: p.bg,
      layers: [...panels],
    };
  },
};

// ------------------------------------------------------------------ 11. Pixel Mosaic

const pixelMosaic: Recipe = {
  id: 'pixel-mosaic',
  name: 'Pixel Mosaic',
  category: 'logo',
  tags: ['logo', 'pixel', 'mosaic', 'grid', 'digital', 'gaming', 'retro'],
  description: 'A pixel grid assembles in a diagonal wave into a dithered badge, and your mark snaps into focus on top.',
  duration: 4.4,
  usesLogo: true,
  fields: [brandField('Pixelwise'), taglineField('Built bit by bit')],
  variants: [
    { name: 'Graphite', palette: 'graphite', fonts: 'mono', logo: 'stack', format: 'square' },
    { name: 'Electric', palette: 'electric', fonts: 'space', logo: 'prism', format: 'portrait', copy: { brand: 'Bitcraft', tagline: 'Indie game studio' } },
    { name: 'Paper', palette: 'paper', fonts: 'fraunces', logo: 'petal', format: 'story', copy: { brand: 'Tessera', tagline: 'Mosaic & tile' } },
    { name: 'Azure', palette: 'azure', fonts: 'outfit', logo: 'knot', format: 'landscape', copy: { brand: 'Gridline', tagline: 'Architecture studio' } },
    { name: 'Cyber', palette: 'cyber', fonts: 'unbounded', logo: 'orbit', format: 'portrait', copy: { brand: '8-Bit Café', tagline: 'Play & coffee' } },
  ],
  build(x) {
    const { u, cx, cy, p, H } = x;
    const land = x.isLandscape;
    const n = 9;
    const cell = x.pick({ story: 7.2 * u, portrait: 5.8 * u, landscape: 5.8 * u, default: 4.7 * u });
    const S = n * cell;
    const halo = 2.4;
    const ext = (n / 2 - 0.05 + halo) * 2 * cell;
    const L = S * 0.46;
    const tTrack = 0.18;

    let bx: number;
    let by: number;
    let textX: number;
    let brandY: number;
    let tagY: number;
    let B: number;
    let T: number;
    if (land) {
      B = fitTitle(x, x.c.brand, 12 * u, 80 * u);
      T = fitBody(x, x.c.tagline, 3.4 * u, 80 * u, tTrack, true);
      const tw = Math.max(titleW(x, x.c.brand, B), bodyW(x, x.c.tagline, T, tTrack, true));
      const lk = hLockup(x, ext, 5 * u, tw);
      bx = lk.markX;
      by = cy;
      textX = lk.textX;
      const bh = titleH(x, B);
      const blk = bh + 2.6 * u + T * 1.35;
      brandY = cy - blk / 2;
      tagY = brandY + bh + 2.6 * u;
    } else {
      B = fitTitle(x, x.c.brand, x.pick({ story: 14 * u, portrait: 12 * u, default: 10.5 * u }), 84 * u);
      T = fitBody(x, x.c.tagline, x.pick({ story: 4 * u, default: 3.3 * u }), 84 * u, tTrack, true);
      const bh = titleH(x, B);
      const g1 = x.pick({ story: 8 * u, default: 4.5 * u });
      const g2 = 2.6 * u;
      const blk = ext + g1 + bh + g2 + T * 1.35;
      const top = cy - blk / 2;
      bx = cx;
      by = top + ext / 2;
      textX = cx;
      brandY = top + ext + g1;
      tagY = brandY + bh + g2;
    }

    const r = rng(x.seed * 977 + 3);
    const tile = cell * 0.88;
    const R = n / 2 - 0.05;
    const tiles: Layer[] = [];
    const span = Math.ceil(R + halo);
    for (let j = -span; j <= span; j++) {
      for (let i = -span; i <= span; i++) {
        const d = Math.hypot(i, j);
        const inside = d <= R;
        if (!inside) {
          const f = (d - R) / halo;
          if (f > 1 || r() > 0.62 * (1 - f)) continue;
        }
        const roll = r();
        let fill = p.accent;
        if (inside) {
          if (roll < 0.18) fill = shade(p.accent, 0.14);
          else if (roll < 0.3) fill = shade(p.accent, -0.12);
        } else {
          fill = alpha(p.accent, 0.75 - ((d - R) / halo) * 0.45);
        }
        const sc = inside ? 1 : 0.72 - ((d - R) / halo) * 0.3;
        const delay = 0.12 + (i + j + 2 * span) * 0.03 + (inside ? 0 : 0.12);
        const glint = 2.5 + (i + j + 2 * span) * 0.035;
        tiles.push(
          rect(`px-${i + span}-${j + span}`, {
            x: bx + i * cell,
            y: by + j * cell,
            w: tile,
            h: tile,
            radius: tile * 0.16,
            fill: inside ? k([0, fill], [glint, fill], [glint + 0.15, shade(fill, 0.28)], [glint + 0.45, fill]) : fill,
            scale: k([delay, 0], [delay + 0.45, sc, 'outBack']),
            rotation: k([delay, -90], [delay + 0.5, 0, 'outCubic']),
          }),
        );
      }
    }

    const randomChars: TextAnim = { by: 'char', start: 1.35, dur: 0.16, stagger: 0.04, ease: 'outCubic', from: { opacity: 0, scale: 0.4 }, order: 'random' };
    return {
      background: radial(0.5, by / H, 0.9, p.bg2, p.bg),
      layers: [
        ...tiles,
        x.logo('mark', {
          size: L,
          x: bx,
          y: by,
          color: p.onAccent,
          scale: k([0.95, 1.35], [1.5, 1, 'outExpo']),
          opacity: k([0.95, 0], [1.2, 1]),
          blur: k([0.95, 2 * u], [1.45, 0, 'outCubic']),
        }),
        x.title('brand', x.c.brand, {
          size: B,
          x: textX,
          y: brandY,
          ay: 0,
          ...(land ? { ax: 0, align: 'left' as const } : {}),
          anim: randomChars,
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
          anim: ta.blur(1.85, { stagger: 0.07 }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ 12. Seal Stamp

const sealStamp: Recipe = {
  id: 'seal-stamp',
  name: 'Seal Stamp',
  category: 'logo',
  tags: ['logo', 'badge', 'seal', 'stamp', 'circular text', 'craft', 'vintage'],
  description: 'A scalloped seal spins in as your tagline writes itself around the ring, then your mark stamps down in the centre.',
  duration: 4.6,
  usesLogo: true,
  fields: [brandField('Oak & Ember'), taglineField('Handmade goods')],
  variants: [
    { name: 'Sand', palette: 'sand', fonts: 'dmserif', logo: 'petal', format: 'square' },
    { name: 'Forest', palette: 'forest', fonts: 'fraunces', logo: 'arc', format: 'story', copy: { brand: 'Wildroot', tagline: 'Small batch honey' } },
    { name: 'Paper', palette: 'paper', fonts: 'archivo', logo: 'wave', format: 'portrait', copy: { brand: 'Old Harbor', tagline: 'Coffee roasters' } },
    { name: 'Royal', palette: 'royal', fonts: 'editorial', logo: 'prism', format: 'landscape', copy: { brand: 'Crown & Quill', tagline: 'Fine stationery' } },
    { name: 'Slate', palette: 'slate', fonts: 'space', logo: 'knot', format: 'portrait', copy: { brand: 'Summit Supply', tagline: 'Outdoor gear' } },
  ],
  build(x) {
    const { u, cx, cy, p, H } = x;
    const dur = 4.6;
    const land = x.isLandscape;
    const R = x.pick({ story: 40 * u, portrait: 34 * u, landscape: 32 * u, default: 30 * u });
    const tStamp = 1.3;
    const tHit = tStamp + 0.2;

    let sx: number;
    let sy: number;
    let textX: number;
    let brandY: number;
    let B: number;
    const barGap = 3 * u;
    if (land) {
      B = fitTitle(x, x.c.brand, 13 * u, 84 * u);
      const tw = titleW(x, x.c.brand, B);
      const lk = hLockup(x, R * 2, 11 * u, tw);
      sx = lk.markX;
      sy = cy;
      textX = lk.textX;
      brandY = cy - (titleH(x, B) + barGap + 0.8 * u) / 2;
    } else {
      B = fitTitle(x, x.c.brand, x.pick({ story: 14 * u, portrait: 12 * u, default: 10.5 * u }), 86 * u);
      const g1 = x.pick({ story: 10 * u, default: 6.5 * u });
      const blk = R * 2 + g1 + titleH(x, B) + barGap + 0.8 * u;
      const top = cy - blk / 2;
      sx = cx;
      sy = top + R;
      textX = cx;
      brandY = top + R * 2 + g1;
    }
    const barY = brandY + titleH(x, B) + barGap;

    // Circular text: the tagline repeated around the band, dots between repeats.
    const Rt = R * 0.735;
    const bandW = R * 0.27;
    const C = Math.PI * 2 * Rt;
    const track = 0.14;
    const phrase = Array.from(x.c.tagline.toUpperCase());
    const sepEm = 1.7;
    const perRep = phrase.reduce((a, ch) => a + (ch === ' ' ? 0.3 : charEm(x, ch)) + track, 0) + sepEm;
    const target = bandW * 0.5;
    const reps = Math.max(1, Math.round(C / (target * perRep)));
    const size = Math.min(C / (perRep * reps), bandW * 0.6);
    const units: { ch: string; adv: number }[] = [];
    for (let rI = 0; rI < reps; rI++) {
      for (const ch of phrase) units.push({ ch, adv: ((ch === ' ' ? 0.3 : charEm(x, ch)) + track) * size });
      units.push({ ch: '•', adv: sepEm * size });
    }
    const used = units.reduce((a, b) => a + b.adv, 0);
    const extra = (C - used) / units.length;
    const ink = p.onAccent;
    const ringChars: Layer[] = [];
    let acc = 0;
    units.forEach((un, i) => {
      const adv = un.adv + extra;
      const th = (acc + adv / 2) / Rt;
      acc += adv;
      if (un.ch === ' ') return;
      const px = R + Rt * Math.sin(th);
      const py = R - Rt * Math.cos(th);
      const tIn = 0.45 + (i / units.length) * 0.75;
      if (un.ch === '•') {
        ringChars.push(
          circle(`ring-dot-${i}`, size * 0.13, { x: px, y: py, fill: ink, scale: k([tIn, 0], [tIn + 0.3, 1, 'outBack']) }),
        );
        return;
      }
      ringChars.push(
        x.body(`ring-ch-${i}`, un.ch, {
          size,
          x: px,
          y: py,
          rotation: (th * 180) / Math.PI,
          weight: 700,
          lineHeight: 1,
          fill: ink,
          opacity: k([tIn, 0], [tIn + 0.25, 1]),
          scale: k([tIn, 0.6], [tIn + 0.35, 1, 'outBack']),
        }),
      );
    });

    const spinIn = (t: number) => -140 * (1 - easeAt('outCubic', clamp((t - 0.1) / 1.2, 0, 1))) - 4 * Math.max(0, t - 0.1);
    const hitScale = k<number>([0.1, 0], [1.0, 1, 'spring'], [tHit, 1], [tHit + 0.07, 0.95, 'outQuad'], [tHit + 0.45, 1, 'outBack']);
    const shake = k<number>([tHit, 0], [tHit + 0.05, 0.9 * u], [tHit + 0.11, -0.7 * u], [tHit + 0.17, 0.4 * u], [tHit + 0.25, 0, 'outQuad']);

    const dust: Layer[] = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      const d0 = R * 0.98;
      const d1 = R + (5 + (i % 3) * 2.5) * u;
      return circle(`dust-${i}`, (0.5 + (i % 2) * 0.35) * u, {
        x: k([tHit, sx + Math.cos(a) * d0], [tHit + 0.6, sx + Math.cos(a) * d1, 'outCubic']),
        y: k([tHit, sy + Math.sin(a) * d0], [tHit + 0.6, sy + Math.sin(a) * d1, 'outCubic']),
        fill: p.accent,
        opacity: k([tHit, 1], [tHit + 0.6, 0, 'inQuad']),
        start: tHit,
        end: tHit + 0.6,
      });
    });

    return {
      background: radial(0.5, sy / H, 0.9, p.bg2, p.bg),
      layers: [
        ellipse('impact', {
          x: sx,
          y: sy,
          w: k([tHit, R * 2], [tHit + 0.8, R * 2 + 26 * u, 'outCubic']),
          h: k([tHit, R * 2], [tHit + 0.8, R * 2 + 26 * u, 'outCubic']),
          stroke: p.accent,
          strokeWidth: k([tHit, 1.4 * u], [tHit + 0.8, 0.2 * u, 'outCubic']),
          opacity: k([tHit, 0.7], [tHit + 0.8, 0, 'inSine']),
          start: tHit,
          end: tHit + 0.8,
        }),
        ...dust,
        group(
          'seal',
          [
            path('seal-body', starPath(44, 0.94), 100, 100, {
              x: R,
              y: R,
              w: R * 2,
              h: R * 2,
              fill: linear(135, shade(p.accent, 0.1), shade(p.accent, -0.12)),
              shadow: { color: alpha(shade(p.accent, -0.6), 0.3), blur: 4 * u, y: 1.6 * u },
            }),
            ellipse('seal-ring-out', { x: R, y: R, w: R * 1.74, h: R * 1.74, stroke: alpha(ink, 0.55), strokeWidth: 0.3 * u }),
            ellipse('seal-ring-in', { x: R, y: R, w: R * 1.2, h: R * 1.2, stroke: alpha(ink, 0.55), strokeWidth: 0.3 * u }),
            ...ringChars,
          ],
          {
            x: k<number>([0, sx], [tHit, sx]).concat(shake.slice(1).map((f) => ({ ...f, v: sx + f.v }))),
            y: sy,
            w: R * 2,
            h: R * 2,
            scale: hitScale,
            rotation: sampled(0, dur, 0.05, spinIn, 2),
          },
        ),
        x.logo('mark', {
          size: R * 0.66,
          x: sx,
          y: sy,
          color: ink,
          scale: k([tStamp, 2.6], [tHit, 0.9, 'inQuart'], [tHit + 0.4, 1, 'outBack']),
          opacity: k([tStamp, 0], [tStamp + 0.12, 1]),
          rotation: k([tStamp, -12], [tHit, 0, 'outCubic']),
        }),
        x.title('brand', x.c.brand, {
          size: B,
          x: textX,
          y: brandY,
          ay: 0,
          ...(land ? { ax: 0, align: 'left' as const } : {}),
          anim: ta.rise(1.75, { by: 'char', stagger: 0.03, dur: 0.8 }),
        }),
        rect('rule', {
          x: textX,
          y: barY,
          ax: land ? 0 : 0.5,
          w: k([2.05, 0], [2.7, 12 * u, 'outExpo']),
          h: 0.8 * u,
          radius: 0.4 * u,
          fill: p.accent,
        }),
      ],
    };
  },
};

export const recipesC: Recipe[] = [confettiLaunch, panelSweep, pixelMosaic, sealStamp];
