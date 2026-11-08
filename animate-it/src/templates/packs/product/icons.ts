/** Category: icons — animated icon set grid, like/reaction burst, success checkmark badge. */
import type { Layer } from '../../../engine/types';
import { type Recipe, k, rect, circle, group, radial, alpha, shade, lerpColor, rng, path, ICONS } from '../../kit';
import { uiTheme, heading, icon, glow, fit, textW, countTo, stack, stackH, balance, blockH } from './ui';

// ------------------------------------------------------------------ Icon Set Grid

const SETS = [
  ['bell', 'chat', 'heart', 'search', 'camera', 'calendar', 'mail', 'bolt', 'cart', 'globe', 'lock', 'rocket'],
  ['music', 'play', 'star', 'user', 'clock', 'gift', 'trophy', 'flame', 'eye', 'bookmark', 'send', 'share'],
  ['rocket', 'sparkle', 'thumb', 'camera', 'music', 'globe', 'calendar', 'lock', 'chat', 'heart', 'bolt', 'search'],
  ['gift', 'cart', 'mail', 'bell', 'user', 'star', 'eye', 'clock', 'trophy', 'send', 'flame', 'bookmark'],
];

const iconGrid: Recipe = {
  id: 'icon-grid',
  name: 'Icon Set Grid',
  category: 'icons',
  tags: ['icons', 'icon set', 'line icons', 'grid', 'draw', 'ui kit', 'stroke'],
  description: 'Twelve line icons draw themselves in a staggered grid of tiles, then one tile lights up.',
  duration: 4.6,
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Free icon pack' },
    { key: 'title', label: 'Title', default: 'Icons that move with you', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Crisp line icons with draw-on animation built in.', multiline: true },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'outfit', format: 'square' },
    { name: 'Noir', palette: 'noir', fonts: 'grotesk', format: 'portrait', copy: { eyebrow: 'UI kit · 2.0', title: 'Line icons, alive.', sub: 'Pixel-perfect at 24px. Smooth at any size.' } },
    { name: 'Sunset', palette: 'sunset', fonts: 'archivo', format: 'landscape', copy: { eyebrow: 'New drop', title: 'Little icons, big energy', sub: 'Twelve essentials, ready for your next app.' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'sora', format: 'story', copy: { eyebrow: 'Design system', title: 'Every icon, in motion', sub: 'Consistent strokes, rounded caps, zero fuss.' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const set = SETS[(Math.abs(x.seed) - 1 + SETS.length * 10) % SETS.length];
    const cols = x.tall ? 3 : 4;
    const rows = 12 / cols;
    let gx0: number;
    let gy0: number;
    let ts: number;
    const gapR = 0.18;
    const L: Layer[] = [];
    if (x.isLandscape) {
      ts = 18.5 * u;
      const gw = cols * ts + (cols - 1) * ts * gapR;
      const gh = rows * ts + (rows - 1) * ts * gapR;
      gx0 = W - 9 * u - gw;
      gy0 = H / 2 - gh / 2;
      L.push(...heading(x, { eyebrow: c.eyebrow, title: c.title, sub: c.sub, x: 9 * u, y: H / 2, w: gx0 - 9 * u - 10 * u, size: 8.6 * u, vAlign: 'center', maxLines: 3, subLines: 3, t0: 0.1 }).layers);
    } else {
      const size = x.pick({ square: 6.6 * u, portrait: 7.6 * u, default: 9.4 * u });
      const opts = { eyebrow: c.eyebrow, title: c.title, sub: x.isSquare ? undefined : c.sub, x: W / 2, y: 0, w: 84 * u, size, align: 'center' as const, maxLines: x.isSquare ? 1 : 2, subLines: 2, t0: 0.1 };
      const probe = heading(x, opts);
      ts = x.pick({ square: 16.6 * u, portrait: 15.6 * u, default: 23 * u });
      const gw = cols * ts + (cols - 1) * ts * gapR;
      const gh = rows * ts + (rows - 1) * ts * gapR;
      const gap = x.pick({ square: 6 * u, portrait: 7 * u, default: 10 * u });
      const top = (H - (probe.h + gap + gh)) / 2;
      L.push(...heading(x, { ...opts, y: top }).layers);
      gx0 = W / 2 - gw / 2;
      gy0 = top + probe.h + gap;
    }
    const hi = cols === 4 ? 5 : 4;
    const TH = 2.75;
    set.forEach((name, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = gx0 + col * ts * (1 + gapR) + ts / 2;
      const ty = gy0 + row * ts * (1 + gapR) + ts / 2;
      const t = 0.45 + (col + row) * 0.08;
      const isHi = i === hi;
      L.push(
        rect(`ig-t${i}`, {
          x: tx,
          y: ty,
          w: ts,
          h: ts,
          radius: ts * 0.26,
          fill: isHi ? k<string>([TH, ui.card], [TH + 0.3, ui.accent, 'outCubic']) : ui.card,
          stroke: ui.border,
          strokeWidth: 0.15 * u,
          shadow: { color: alpha(ui.shadow, 0.7), blur: ts * 0.16, y: ts * 0.05 },
          scale: isHi ? k([t, 0.4], [t + 0.6, 1, 'outBack'], [TH, 1], [TH + 0.18, 1.1, 'outCubic'], [TH + 0.7, 1, 'spring']) : k([t, 0.4], [t + 0.6, 1, 'outBack']),
          opacity: k([t, 0], [t + 0.25, 1]),
        }),
        icon(`ig-i${i}`, name, {
          x: tx,
          y: ty,
          size: ts * 0.44,
          color: ui.accent,
          weight: 1.7,
          draw: [t + 0.25, 0.9],
          ...(isHi ? { stroke: k<string>([TH, ui.accent], [TH + 0.3, ui.onAccent]), scale: k([TH, 1], [TH + 0.18, 1.12, 'outCubic'], [TH + 0.7, 1, 'spring']) } : {}),
        }),
      );
      if (isHi) {
        L.push(
          rect('ig-pulse', { x: tx, y: ty, w: ts, h: ts, radius: ts * 0.26, stroke: ui.accent, strokeWidth: 0.5 * u, scale: k([TH + 0.05, 1], [TH + 0.9, 1.45, 'outCubic']), opacity: k([TH, 0], [TH + 0.08, 0.8], [TH + 0.9, 0, 'inQuad']), start: TH, end: TH + 1 }),
          ...[0, 1, 2, 3].map((j) => {
            const a = Math.PI / 4 + (j * Math.PI) / 2;
            const r0 = ts * 0.55;
            const r1 = ts * 0.92;
            return circle(`ig-sp${j}`, 0.7 * u, {
              x: k([TH + 0.1, tx + Math.cos(a) * r0], [TH + 0.7, tx + Math.cos(a) * r1, 'outCubic']),
              y: k([TH + 0.1, ty + Math.sin(a) * r0], [TH + 0.7, ty + Math.sin(a) * r1, 'outCubic']),
              fill: j % 2 ? p.accent2 : ui.accent,
              scale: k([TH + 0.1, 1], [TH + 0.8, 0, 'inQuad']),
              start: TH + 0.1,
              end: TH + 0.85,
            });
          }),
        );
      }
    });
    return { background: radial(x.isLandscape ? 0.72 : 0.5, 0.62, 0.9, p.bg2, p.bg), layers: [glow('ig-glow', { x: gx0 + (cols * ts * (1 + gapR)) / 2, y: gy0 + (rows * ts * (1 + gapR)) / 2, r: ts * 3.4, color: p.accent, a: ui.dark ? 0.16 : 0.2 }), ...L] };
  },
};

// ------------------------------------------------------------------ Like Burst

const reactionBurst: Recipe = {
  id: 'reaction-burst',
  name: 'Like Burst',
  category: 'icons',
  tags: ['icons', 'like', 'heart', 'reaction', 'sticker', 'social', 'engagement', 'burst'],
  description: 'A heart gets tapped, pops with a burst ring and a stream of tiny hearts floats up as likes roll in.',
  duration: 5,
  fields: [
    { key: 'caption', label: 'Caption', default: 'Double-tap if this made your day', multiline: true },
    { key: 'count', label: 'Like count', default: '12,480' },
    { key: 'countLabel', label: 'Count label', default: 'likes' },
    { key: 'handle', label: 'Handle', default: '@lumora.studio' },
  ],
  variants: [
    { name: 'Blush', palette: 'blush', fonts: 'poppins', format: 'square' },
    { name: 'Midnight', palette: 'midnight', fonts: 'unbounded', format: 'story', copy: { caption: 'Tap the heart if you’re in', count: '48,210', handle: '@nightshift.fm' } },
    { name: 'Electric', palette: 'electric', fonts: 'grotesk', format: 'portrait', copy: { caption: 'Show this some love', count: '3,906', countLabel: 'reactions', handle: '@voltra' } },
    { name: 'Peach', palette: 'peach', fonts: 'fraunces', format: 'landscape', copy: { caption: 'Saved you a seat. Like if you’re coming.', count: '1,284', handle: '@slowbakery' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const R = x.pick({ landscape: 16 * u, square: 14 * u, portrait: 16.5 * u, default: 23 * u });
    const capSize = x.pick({ landscape: 7.4 * u, square: 6.2 * u, portrait: 7.2 * u, default: 10.2 * u });
    const capW = x.isLandscape ? 78 * u : 84 * u;
    const align: 'left' | 'center' = x.isLandscape ? 'left' : 'center';
    const cap = balance(fit(x.title('rb-cap', c.caption, { size: capSize, x: 0, y: 0, w: capW, ax: x.isLandscape ? 0 : 0.5, ay: 0, align, lineHeight: 1.06 }), capW, x.isLandscape ? 3 : 2), capW);
    const capH = blockH(cap, cap.w as number);
    const pillH = x.pick({ story: 10 * u, default: 7.6 * u });
    const hs = x.pick({ story: 3.6 * u, default: 2.8 * u });
    const showHandle = !x.isSquare;
    let cx: number;
    let cy: number;
    let ys: number[];
    let tx: number;
    let rise: number;
    if (x.isLandscape) {
      const items = [{ h: capH }, { h: pillH, gap: 6 * u }, { h: hs * 1.3, gap: 4 * u }];
      ys = stack(H / 2 - stackH(items) / 2, items);
      tx = 9 * u;
      cx = W * 0.7;
      cy = H * 0.64;
      rise = cy - R - 9 * u;
    } else {
      rise = x.pick({ square: 22 * u, portrait: 30 * u, default: 42 * u });
      const items = [
        { h: rise },
        { h: R * 2 },
        { h: capH, gap: x.pick({ square: 6 * u, portrait: 8 * u, default: 12 * u }) },
        { h: pillH, gap: x.pick({ square: 4.6 * u, portrait: 6 * u, default: 8 * u }) },
        ...(showHandle ? [{ h: hs * 1.3, gap: x.pick({ portrait: 4 * u, default: 5 * u }) }] : []),
      ];
      const all = stack((H - stackH(items)) / 2, items);
      cx = W / 2;
      cy = all[1] + R;
      tx = W / 2;
      ys = all.slice(2);
    }
    const T = 1.0;
    const r = rng(x.seed * 31 + 7);
    const L: Layer[] = [];
    Object.assign(cap, { x: tx, y: ys[0], anim: { by: 'word', start: 0.15, dur: 0.7, stagger: 0.06, ease: 'outBack', from: { y: 0.5, opacity: 0, scale: 0.8 } } });
    L.push(cap);
    // floating mini hearts (behind the button)
    const n = 11;
    const hearts: Layer[] = [];
    for (let i = 0; i < n; i++) {
      const ts = T + 0.15 + i * 0.26;
      const life = 1.8 + r() * 0.5;
      const x0 = cx + (r() - 0.5) * R * 0.9;
      const dx = (r() - 0.5) * (x.isLandscape ? 34 : x.isStory ? 30 : 24) * u;
      const s = (0.6 + r() * 0.7) * R * 0.42;
      const col = [p.accent, shade(p.accent, 0.35), lerpColor(p.accent, p.accent2, 0.35)][i % 3];
      hearts.push(
        path(`rb-h${i}`, ICONS.heart, 24, 24, {
          x: k([ts, x0], [ts + life * 0.33, x0 + dx * 0.55, 'inOutSine'], [ts + life * 0.66, x0 + dx * 0.2, 'inOutSine'], [ts + life, x0 + dx, 'inOutSine']),
          y: k([ts, cy - R * 0.2], [ts + life, cy - R - rise * (0.62 + r() * 0.3) + s * 0.5, 'outCubic']),
          w: s,
          h: s,
          fill: col,
          rotation: k([ts, (r() - 0.5) * 40], [ts + life, (r() - 0.5) * 40, 'inOutSine']),
          scale: k([ts, 0], [ts + 0.4, 1, 'outBack']),
          opacity: k([ts, 1], [ts + life * 0.6, 1], [ts + life, 0, 'inQuad']),
          start: ts,
          end: ts + life,
        }),
      );
    }
    L.push(...hearts);
    // burst rings + particles
    L.push(
      circle('rb-ring1', R * 1.05, { x: cx, y: cy, stroke: p.accent, strokeWidth: k([T, 1.6 * u], [T + 0.7, 0.1 * u, 'outCubic']), scale: k([T, 0.7], [T + 0.7, 1.55, 'outCubic']), opacity: k([T, 1], [T + 0.7, 0, 'inQuad']), start: T, end: T + 0.75 }),
      circle('rb-ring2', R * 1.05, { x: cx, y: cy, stroke: p.accent2, strokeWidth: k([T + 0.1, 1 * u], [T + 0.8, 0.1 * u, 'outCubic']), scale: k([T + 0.1, 0.8], [T + 0.8, 1.85, 'outCubic']), opacity: k([T + 0.1, 0.8], [T + 0.8, 0, 'inQuad']), start: T + 0.1, end: T + 0.85 }),
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.2;
      const r0 = R * 0.9;
      const r1 = R * (1.55 + (i % 2) * 0.35);
      L.push(
        circle(`rb-p${i}`, (i % 2 ? 0.7 : 1.05) * u, {
          x: k([T + 0.05, cx + Math.cos(a) * r0], [T + 0.7, cx + Math.cos(a) * r1, 'outCubic']),
          y: k([T + 0.05, cy + Math.sin(a) * r0], [T + 0.7, cy + Math.sin(a) * r1, 'outCubic']),
          fill: i % 3 === 0 ? p.accent2 : p.accent,
          scale: k([T + 0.05, 1], [T + 0.75, 0, 'inQuad']),
          start: T + 0.05,
          end: T + 0.8,
        }),
      );
    }
    // button
    const press = k([0, 0.3], [0.65, 1, 'outBack'], [T - 0.15, 1], [T, 0.9, 'inQuad'], [T + 0.55, 1, 'outBack']);
    L.push(
      circle('rb-btn', R, { x: cx, y: cy, fill: ui.dark ? lerpColor(p.surface, p.fg, 0.07) : ui.card, stroke: ui.dark ? alpha(p.fg, 0.12) : undefined, strokeWidth: 0.3 * u, shadow: { color: ui.shadow, blur: R * 0.5, y: R * 0.14 }, scale: press, opacity: k([0, 0], [0.3, 1]) }),
      circle('rb-tap', R * 0.9, { x: cx, y: cy, fill: alpha(p.accent, 0.16), scale: k([T - 0.05, 0.3], [T + 0.5, 1, 'outCubic']), opacity: k([T - 0.05, 1], [T + 0.6, 0, 'inQuad']), start: T - 0.05, end: T + 0.65 }),
      path('rb-heart', ICONS.heart, 24, 24, {
        x: cx,
        y: cy + R * 0.03,
        w: R * 1.05,
        h: R * 1.05,
        stroke: k<string>([T, ui.muted], [T + 0.05, p.accent]),
        strokeWidth: 1.7,
        fill: k<string>([T, alpha(p.accent, 0)], [T + 0.08, p.accent]),
        scale: k([0.2, 0], [0.75, 1, 'outBack'], [T - 0.15, 1], [T, 0.7, 'inQuad'], [T + 0.6, 1, 'spring']),
      }),
    );
    // +1
    L.push(
      x.title('rb-plus', '+1', { size: R * 0.42, x: cx + R * 0.95, y: k([T + 0.15, cy - R * 0.7], [T + 1.1, cy - R * 1.45, 'outCubic']), fill: p.accent, opacity: k([T + 0.15, 0], [T + 0.3, 1], [T + 0.8, 1], [T + 1.1, 0]), start: T + 0.1, end: T + 1.15 }),
    );
    // counter pill
    const ctr = x.body('rb-count', `${c.count} ${c.countLabel}`, { size: pillH * 0.36, x: 0, y: pillH / 2, ax: 0, align: 'left', weight: 700, fill: ui.text, counter: (() => {
      const cn = countTo(c.count, T + 0.1, 2.2, 0.985, 'outCubic');
      return cn ? { ...cn, suffix: cn.suffix + ' ' + c.countLabel } : undefined;
    })() });
    const hw = pillH * 0.42;
    const pw = textW(ctr) + hw + pillH * 1.2;
    Object.assign(ctr, { x: pillH * 0.45 + hw + pillH * 0.22 });
    L.push(
      group(
        'rb-pill',
        [
          rect('rb-pill-bg', { x: 0, y: 0, ax: 0, ay: 0, w: pw, h: pillH, radius: pillH / 2, fill: ui.card, shadow: { color: alpha(ui.shadow, 0.7), blur: 2.4 * u, y: 0.8 * u } }),
          path('rb-pill-h', ICONS.heart, 24, 24, { x: pillH * 0.45 + hw / 2, y: pillH / 2, w: hw, h: hw, fill: p.accent, scale: k([T, 1], [T + 0.15, 1.4, 'outCubic'], [T + 0.5, 1, 'outBack']) }),
          ctr,
        ],
        { x: tx, y: ys[1] + pillH / 2, w: pw, h: pillH, ax: x.isLandscape ? 0 : 0.5, opacity: k([0.5, 0], [0.8, 1]), scale: k([0.5, 0.7], [1.0, 1, 'outBack']) },
      ),
    );
    if (showHandle) L.push(x.body('rb-handle', c.handle, { size: hs, x: tx, y: ys[2] + hs * 0.65, ax: x.isLandscape ? 0 : 0.5, align, weight: 600, fill: p.muted, opacity: k([1.6, 0], [2.0, 1]) }));
    return { background: radial(0.5, cy / H, 0.8, p.bg2, p.bg), layers: [glow('rb-glow', { x: cx, y: cy, r: R * 3, color: p.accent, a: ui.dark ? 0.25 : 0.22, scale: k([T, 0.7], [T + 0.8, 1, 'outCubic']) }), ...L] };
  },
};

// ------------------------------------------------------------------ Success Check

const successCheck: Recipe = {
  id: 'success-check',
  name: 'Success Check',
  category: 'icons',
  tags: ['icons', 'success', 'checkmark', 'badge', 'payment', 'confirmation', 'micro-animation', 'ui'],
  description: 'A ring draws, the badge pops, a checkmark strokes in and sparkles land around it.',
  duration: 4.4,
  fields: [
    { key: 'title', label: 'Title', default: 'Payment successful', multiline: true },
    { key: 'sub', label: 'Message', default: 'Your receipt is on its way to your inbox.', multiline: true },
    { key: 'r1l', label: 'Row 1 label', default: 'Amount paid' },
    { key: 'r1', label: 'Row 1 value', default: '$129.00' },
    { key: 'r2l', label: 'Row 2 label', default: 'Reference' },
    { key: 'r2', label: 'Row 2 value', default: '#AX-48213' },
  ],
  variants: [
    { name: 'Mint', palette: 'mint', fonts: 'manrope', format: 'square' },
    { name: 'Azure', palette: 'azure', fonts: 'sora', format: 'portrait', copy: { title: 'You’re all set!', sub: 'Your account is ready. Let’s build something great.', r1l: 'Plan', r1: 'Pro · yearly', r2l: 'Workspace', r2: 'lumora-team' } },
    { name: 'Royal', palette: 'royal', fonts: 'dmserif', format: 'landscape', copy: { title: 'Booking confirmed', sub: 'See you on Friday. We’ve saved your table.', r1l: 'Guests', r1: '4 people', r2l: 'Time', r2: 'Fri, 8:30 PM' } },
    { name: 'Forest', palette: 'forest', fonts: 'outfit', format: 'story', copy: { title: 'Order placed', sub: 'We’re packing it now. Track it any time.', r1l: 'Total', r1: '$64.20', r2l: 'Arrives', r2: 'Thursday' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const D = x.pick({ landscape: 36 * u, square: 26 * u, portrait: 32 * u, default: 46 * u });
    const L: Layer[] = [];
    const align: 'left' | 'center' = x.isLandscape ? 'left' : 'center';
    const tw = x.isLandscape ? 74 * u : 84 * u;
    const tSize = x.pick({ landscape: 8.6 * u, square: 7 * u, portrait: 7.6 * u, default: 10.4 * u });
    const title = balance(fit(x.title('sc-title', c.title, { size: tSize, x: 0, y: 0, w: tw, ax: align === 'left' ? 0 : 0.5, ay: 0, align, lineHeight: 1.04 }), tw, 2), tw);
    const sub = fit(x.body('sc-sub', c.sub, { size: x.pick({ story: 4 * u, default: 3.2 * u }), x: 0, y: 0, w: x.isLandscape ? 64 * u : 70 * u, ax: align === 'left' ? 0 : 0.5, ay: 0, align, fill: p.muted, lineHeight: 1.4 }), x.isLandscape ? 64 * u : 70 * u, 2);
    const cw = x.isLandscape ? 64 * u : x.pick({ square: 62 * u, portrait: 68 * u, default: 80 * u });
    const rowH = x.pick({ story: 9.6 * u, default: 7 * u });
    const cardH = rowH * 2 + 2.4 * u;
    const tH = blockH(title, title.w as number);
    const sH = blockH(sub, sub.w as number);
    let bx: number;
    let by: number;
    let ys: number[];
    let tx: number;
    if (x.isLandscape) {
      const items = [{ h: tH }, { h: sH, gap: 2.6 * u }, { h: cardH, gap: 6 * u }];
      tx = W * 0.5;
      ys = stack(H / 2 - stackH(items) / 2, items);
      bx = W * 0.27;
      by = H / 2;
    } else {
      const items = [{ h: D * 1.75 }, { h: tH, gap: x.pick({ square: 2 * u, default: 4 * u }) }, { h: sH, gap: 2.6 * u }, { h: cardH, gap: x.pick({ square: 5 * u, default: 7 * u }) }];
      const all = stack(H / 2 - stackH(items) / 2, items);
      bx = W / 2;
      by = all[0] + D * 0.875;
      ys = all.slice(1);
      tx = W / 2;
    }
    const T = { ring: 0.15, pop: 0.85, check: 1.15, spark: 1.45, text: 1.3 };
    // halo + ring
    L.push(
      glow('sc-halo', { x: bx, y: by, r: D * 1.25, color: p.accent, a: ui.dark ? 0.35 : 0.3, scale: k([T.pop, 0.5], [T.pop + 0.8, 1, 'outCubic'], [3.2, 1.08, 'inOutSine'], [4.4, 1, 'inOutSine']) }),
      { type: 'ellipse', id: 'sc-track', x: bx, y: by, w: D * 1.2, h: D * 1.2, stroke: alpha(p.accent, 0.18), strokeWidth: D * 0.035, opacity: k([0, 0], [0.3, 1]) },
      { type: 'ellipse', id: 'sc-ring', x: bx, y: by, w: D * 1.2, h: D * 1.2, stroke: p.accent, strokeWidth: D * 0.035, arcEnd: k([T.ring, 0], [T.ring + 0.85, 1, 'inOutCubic']), rotation: k([T.ring, -40], [T.ring + 0.85, 0, 'outCubic']) },
      circle('sc-disc', D / 2, { x: bx, y: by, fill: radial(0.35, 0.3, 0.8, shade(p.accent, 0.18), shade(p.accent, -0.12)), scale: k([T.pop, 0], [T.pop + 0.6, 1, 'outBack']), shadow: { color: alpha(p.accent, 0.45), blur: D * 0.25, y: D * 0.08 } }),
      path('sc-check', ICONS.check, 24, 24, { x: bx, y: by + D * 0.02, w: D * 0.62, h: D * 0.62, stroke: p.onAccent, strokeWidth: 2.6, trimEnd: k([T.check, 0], [T.check + 0.45, 1, 'outCubic']), scale: k([T.check + 0.35, 1], [T.check + 0.5, 1.1, 'outCubic'], [T.check + 0.9, 1, 'outBack']) }),
    );
    // sparkles
    const sp: [number, number, number][] = [
      [-1.0, -0.5, 0.2],
      [0.98, -0.66, 0.15],
      [1.1, 0.3, 0.11],
      [-1.02, 0.36, 0.12],
      [0.36, -1.02, 0.09],
      [-0.42, -1.04, 0.08],
    ];
    sp.forEach(([sx, sy, s], i) => {
      const t = T.spark + i * 0.06;
      L.push(
        path(`sc-sp${i}`, ICONS.sparkle, 24, 24, {
          x: bx + sx * D * 0.86,
          y: by + sy * D * 0.86,
          w: D * s * 1.6,
          h: D * s * 1.6,
          fill: i % 2 ? p.accent2 : p.accent,
          scale: k([t, 0], [t + 0.5, 1, 'outBack'], [t + 1.2, 0.8, 'inOutSine'], [t + 1.9, 1, 'inOutSine']),
          rotation: k([t, -45], [t + 0.6, 0, 'outCubic']),
        }),
      );
    });
    // confetti
    const r = rng(x.seed * 13 + 5);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + r() * 0.3;
      const r0 = D * 0.55;
      const r1 = D * (1.1 + r() * 0.5);
      const t = T.pop + 0.05;
      L.push(
        rect(`sc-cf${i}`, {
          x: k([t, bx + Math.cos(a) * r0], [t + 0.9, bx + Math.cos(a) * r1, 'outCubic']),
          y: k([t, by + Math.sin(a) * r0], [t + 0.9, by + Math.sin(a) * r1 + 2 * u, 'outCubic']),
          w: 1.4 * u,
          h: 0.7 * u,
          radius: 0.3 * u,
          fill: [p.accent, p.accent2, lerpColor(p.accent, p.fg, 0.4)][i % 3],
          rotation: k([t, r() * 180], [t + 0.9, r() * 360, 'outCubic']),
          opacity: k([t, 1], [t + 0.6, 1], [t + 0.95, 0]),
          start: t,
          end: t + 1,
        }),
      );
    }
    // text
    Object.assign(title, { x: tx, y: ys[0], anim: { by: 'word', start: T.text, dur: 0.8, stagger: 0.07, ease: 'outExpo', from: { y: 1.1 }, mask: true } });
    Object.assign(sub, { x: tx, y: ys[1], anim: { by: 'word', start: T.text + 0.35, dur: 0.8, stagger: 0.03, ease: 'outCubic', from: { opacity: 0, blur: 10 } } });
    L.push(title, sub);
    const cx0 = align === 'left' ? tx : tx - cw / 2;
    const rows: [string, string][] = [
      [c.r1l, c.r1],
      [c.r2l, c.r2],
    ];
    const rs = rowH * 0.4;
    L.push(
      group(
        'sc-card',
        [
          rect('sc-card-bg', { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: cardH, radius: 2.4 * u, fill: ui.card, stroke: ui.border, strokeWidth: 0.15 * u, shadow: { color: alpha(ui.shadow, 0.7), blur: 3 * u, y: 1 * u } }),
          rect('sc-card-div', { x: 3 * u, y: cardH / 2, ax: 0, w: k([T.text + 0.9, 0], [T.text + 1.5, cw - 6 * u, 'outExpo']), h: 0.15 * u, fill: ui.line }),
          ...rows.flatMap(([l, v], i) => [
            fit(x.body(`sc-r${i}-l`, l, { size: rs, x: 3 * u, y: 1.2 * u + rowH * (i + 0.5), ax: 0, align: 'left', fill: ui.muted, weight: 500 }), cw * 0.45),
            fit(x.body(`sc-r${i}-v`, v, { size: rs, x: cw - 3 * u, y: 1.2 * u + rowH * (i + 0.5), ax: 1, align: 'right', fill: ui.text, weight: 700 }), cw * 0.5),
          ]),
        ],
        { x: cx0, y: k([T.text + 0.6, ys[2] + 3 * u], [T.text + 1.3, ys[2], 'outExpo']), w: cw, h: cardH, ax: 0, ay: 0, opacity: k([T.text + 0.6, 0], [T.text + 0.95, 1]) },
      ),
    );
    return { background: radial(bx / W, by / H, 0.85, p.bg2, p.bg), layers: L };
  },
};

export const recipes: Recipe[] = [iconGrid, reactionBurst, successCheck];
