import type { Layer } from '../../../engine/types';
import { type Recipe, rect, circle, group, k, fadeIn, pop, ta, alpha } from '../../kit';
import { chip, chipW, dots, fadeUp, glow, icon, pad2, shadowCol, slideX, swipeCue, tsz } from './shared';

/** Myth vs fact: the myth gets stamped “busted”, then the fact slides up on a bold sheet. */
export const mythFact: Recipe = {
  id: 'carousel-myth-fact',
  name: 'Myth vs Fact',
  category: 'carousel',
  tags: ['carousel', 'myth', 'fact', 'educational', 'debunk', 'tips'],
  description: 'Toggle-switch cover, three myths stamped “busted” with the fact rising on a bold sheet, and a comment-bait finale.',
  duration: 5,
  slides: 5,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Better Work Lab' },
    { key: 'handle', label: 'Handle', default: '@betterworklab' },
    { key: 'kicker', label: 'Cover kicker', default: 'Myth vs fact' },
    { key: 'title', label: 'Cover title', default: 'Productivity myths to drop this year', multiline: true },
    { key: 'm1', label: 'Myth 1', default: 'Multitasking gets more done.', multiline: true },
    { key: 'f1', label: 'Fact 1', default: 'Switching between tasks can eat up to 40% of your productive time. Batch similar work instead.', multiline: true },
    { key: 'm2', label: 'Myth 2', default: 'Early birds are more productive.', multiline: true },
    { key: 'f2', label: 'Fact 2', default: 'Output comes from matching hard work to your own peak hours, not from beating the sunrise.', multiline: true },
    { key: 'm3', label: 'Myth 3', default: 'Longer hours mean better results.', multiline: true },
    { key: 'f3', label: 'Fact 3', default: 'Past about 50 hours a week, output per hour drops sharply. Rest is part of the work.', multiline: true },
    { key: 'stamp', label: 'Stamp word', default: 'Busted' },
    { key: 'cta', label: 'Final slide title', default: 'Which myth did you believe?', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'Tell me in the comments and save this for your next planning day.', multiline: true },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'archivo' },
    {
      name: 'Paper Sleep',
      palette: 'paper',
      fonts: 'editorial',
      copy: {
        brand: 'The Rest Report',
        handle: '@therestreport',
        title: 'Sleep myths that keep you tired',
        m1: 'You can catch up on sleep at the weekend.',
        f1: 'Lie-ins shift your body clock and make Monday harder. A steady wake-up time works better.',
        m2: 'A nightcap helps you sleep.',
        f2: 'Alcohol knocks you out, then breaks up your deep sleep in the second half of the night.',
        m3: 'Everyone needs exactly 8 hours.',
        f3: 'Most adults need 7 to 9. Wake without an alarm on holiday to find your own number.',
        stamp: 'Not true',
        cta: 'Which one surprised you?',
        ctaSub: 'Comment below and send this to the friend who naps at 6 pm.',
      },
    },
    {
      name: 'Noir Gym',
      palette: 'noir',
      fonts: 'anton',
      copy: {
        brand: 'Iron Basics',
        handle: '@ironbasics',
        kicker: 'Gym myths, busted',
        title: 'Stop believing these gym myths',
        m1: 'Lifting weights makes you bulky.',
        f1: 'Big muscle takes years of targeted training and eating. Lifting mostly makes you strong.',
        m2: 'Crunches burn belly fat.',
        f2: 'You cannot spot-reduce fat. Overall activity and diet decide where it comes off.',
        m3: 'No pain, no gain.',
        f3: 'Soreness is not a progress meter. Consistent sessions you recover from win long term.',
        stamp: 'Wrong',
        cta: 'Which one did you fall for?',
        ctaSub: 'Drop it in the comments and save this for leg day.',
      },
    },
    {
      name: 'Lilac Money',
      palette: 'lilac',
      fonts: 'outfit',
      copy: {
        brand: 'Pocket Money Club',
        handle: '@pocketmoneyclub',
        kicker: 'Money myths',
        title: 'Money myths costing you thousands',
        m1: 'You need a lot of money to start investing.',
        f1: 'Many platforms let you start with the price of a coffee. Time in the market beats amount.',
        m2: 'Renting is throwing money away.',
        f2: 'Rent buys flexibility. Owning costs too: interest, repairs, fees and taxes.',
        m3: 'Budgeting means cutting back.',
        f3: 'A good budget tells money where to go, including the fun you plan for.',
        stamp: 'Myth',
        cta: 'Which myth were you living by?',
        ctaSub: 'Tell me below and share this with your money buddy.',
      },
    },
  ],
  build(x) {
    const { u, H, p, slideW: S, slides: N } = x;
    const dur = 5;
    const m = 9 * u;
    const L: Layer[] = [];
    const top: Layer[] = [];
    const panelY = 60 * u;

    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      L.push(
        x.body(`hd-b-${i}`, x.c.brand, { size: 2.9 * u, x: X + m, y: 9 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, opacity: fadeIn(0.05, 0.5) }),
        x.body(`hd-c-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, { size: 2.8 * u, x: X + S - m, y: 9 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.08, opacity: fadeIn(0.1, 0.5) }),
      );
      const onPanel = i > 0 && i < N - 1;
      top.push(...dots(x, i, { y: 117 * u, on: onPanel ? p.onAccent : p.accent, off: alpha(onPanel ? p.onAccent : p.fg, 0.25) }));
    }

    // ---------------------------------------------------------------- cover: toggle switch
    {
      const cx = S / 2;
      const ty = 36 * u;
      const tw = 34 * u;
      const th = 17 * u;
      const s0 = 0.9;
      const s1 = 1.45;
      L.push(
        glow('cv-glow', 34 * u, { x: cx + 8 * u, y: ty, color: p.accent, a: 0.22, opacity: k([s0, 0], [s1 + 0.3, 1, 'outCubic']) }),
        rect('cv-track', {
          x: cx,
          y: ty,
          w: tw,
          h: th,
          radius: th / 2,
          fill: k([s0, alpha(p.fg, 0.14)], [s1, p.accent, 'inOutCubic']),
          scale: k([0.1, 0.6], [0.7, 1, 'outBack']),
          opacity: fadeIn(0.1, 0.3),
        }),
        circle('cv-knob', th / 2 - 1.6 * u, {
          x: k([s0, cx - tw / 2 + th / 2], [s1, cx + tw / 2 - th / 2, 'inOutCubic']),
          y: ty,
          fill: p.bg,
          shadow: { color: shadowCol(p, 0.3), blur: 2 * u, y: 0.6 * u },
          scale: pop(0.3, 0.5),
        }),
        icon('cv-knob-x', 'close', {
          x: k([s0, cx - tw / 2 + th / 2], [s1, cx + tw / 2 - th / 2, 'inOutCubic']),
          y: ty,
          size: 6 * u,
          color: p.muted,
          sw: 2.6,
          opacity: k([0.3, 0], [0.6, 1], [s0 + 0.15, 1], [s0 + 0.4, 0]),
        }),
        icon('cv-knob-ck', 'check', {
          x: k([s0, cx - tw / 2 + th / 2], [s1, cx + tw / 2 - th / 2, 'inOutCubic']),
          y: ty,
          size: 6.4 * u,
          color: p.accent,
          sw: 2.8,
          trimEnd: k([s1 - 0.2, 0], [s1 + 0.3, 1, 'outCubic']),
        }),
        x.title('cv-myth', 'Myth', {
          size: tsz(x, 6.4 * u),
          x: cx - tw / 2 - 4 * u,
          y: ty,
          ax: 1,
          align: 'right',
          lineHeight: 1,
          fill: k([s0, p.fg], [s1, alpha(p.fg, 0.35)]),
          anim: ta.slide(0.25, { by: 'char', stagger: 0.03 }),
        }),
        x.title('cv-fact', 'Fact', {
          size: tsz(x, 6.4 * u),
          x: cx + tw / 2 + 4 * u,
          y: ty,
          ax: 0,
          align: 'left',
          lineHeight: 1,
          fill: k([s0, alpha(p.fg, 0.35)], [s1, p.fg]),
          anim: ta.slide(0.35, { by: 'char', stagger: 0.03 }),
        }),
        chip(x, 'cv-kicker', x.c.kicker, {
          x: m,
          y: 61 * u,
          size: 2.9 * u,
          fill: alpha(p.accent, 0.16),
          color: p.accent,
          upper: true,
          tracking: 0.1,
          scale: k([0.4, 0.7], [0.9, 1, 'outBack']),
          opacity: fadeIn(0.4, 0.3),
        }),
        x.title('cv-title', x.c.title, {
          size: tsz(x, 10.8 * u),
          x: m,
          y: 66.5 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.0,
          anim: ta.riseLines(0.5, { stagger: 0.12 }),
        }),
        x.body('cv-handle', x.c.handle, { size: 3 * u, x: m, y: 108 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, opacity: fadeIn(1.0, 0.5) }),
        swipeCue(x, 'cv-swipe', { x: S - m, y: 108 * u, bg: p.fg, fg: p.bg, t0: 1.1, dur }),
      );
    }

    // ---------------------------------------------------------------- myths
    const pairs: [string, string][] = [
      [x.c.m1, x.c.f1],
      [x.c.m2, x.c.f2],
      [x.c.m3, x.c.f3],
    ];
    pairs.forEach(([myth, fact], n) => {
      const i = n + 1;
      const X = slideX(x, i);
      const stamp = x.c.stamp;
      const sw = Math.max(26 * u, stamp.length * 3.9 * u + 9 * u);
      L.push(
        chip(x, `my-chip-${i}`, `Myth #${n + 1}`, {
          x: X + m,
          y: 20 * u,
          size: 2.8 * u,
          fill: alpha(p.fg, 0.1),
          color: p.fg,
          upper: true,
          tracking: 0.12,
          icon: 'close',
          opacity: fadeIn(0.1, 0.3),
          scale: k([0.1, 0.8], [0.5, 1, 'outBack']),
        }),
        x.title(`my-t-${i}`, `“${myth}”`, {
          size: tsz(x, 7.6 * u),
          x: X + m,
          y: 27.5 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.04,
          fill: k([0.2, p.fg], [0.95, p.fg], [1.25, alpha(p.fg, 0.5)]),
          anim: ta.rise(0.2, { stagger: 0.05 }),
        }),
        // fact sheet
        rect(`fc-sheet-${i}`, {
          x: X + 3 * u,
          y: k([0.55, H + 2 * u], [1.25, panelY, 'outExpo']),
          ax: 0,
          ay: 0,
          w: S - 6 * u,
          h: H - panelY + 10 * u,
          radius: 6 * u,
          fill: p.accent,
          shadow: { color: shadowCol(p, 0.2), blur: 5 * u, y: -1 * u },
        }),
        chip(x, `fc-chip-${i}`, 'Fact', {
          x: X + m,
          y: k([0.95, 76 * u], [1.45, 71 * u, 'outExpo']),
          size: 2.8 * u,
          fill: alpha(p.onAccent, 0.16),
          color: p.onAccent,
          upper: true,
          tracking: 0.12,
          icon: 'check',
          opacity: fadeIn(0.95, 0.3),
        }),
        x.body(`fc-t-${i}`, fact, {
          size: 5.2 * u,
          x: X + m,
          y: 79 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.36,
          weight: 600,
          fill: p.onAccent,
          anim: fadeUp(1.1, { stagger: 0.02 }),
        }),
        group(
          `my-stamp-${i}`,
          [
            rect(`my-stamp-${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: 9 * u, radius: 1.4 * u, fill: p.fg, shadow: { color: shadowCol(p, 0.25), blur: 2.5 * u, y: 1 * u } }),
            rect(`my-stamp-${i}-in`, { x: 1 * u, y: 1 * u, ax: 0, ay: 0, w: sw - 2 * u, h: 7 * u, radius: 0.8 * u, stroke: alpha(p.bg, 0.5), strokeWidth: 0.25 * u }),
            x.title(`my-stamp-${i}-t`, stamp, { size: tsz(x, 4.4 * u), x: sw / 2, y: 4.5 * u, fill: p.bg, uppercase: true, tracking: 0.08, lineHeight: 1 }),
          ],
          {
            x: X + S - m,
            y: panelY,
            w: sw,
            h: 9 * u,
            ax: 1,
            ay: 0.5,
            rotation: k([0.85, -18], [1.2, -7, 'outBack']),
            scale: k([0.85, 2.2], [1.2, 1, 'outCubic']),
            opacity: k([0.85, 0], [0.95, 1]),
          },
        ),
      );
    });

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      const c1 = 'Comment';
      const c2 = 'Save';
      const w1 = chipW(c1, 3.2 * u, { icon: true });
      const w2 = chipW(c2, 3.2 * u, { icon: true });
      const gap = 3 * u;
      const x0 = cx - (w1 + gap + w2) / 2;
      L.push(
        glow('ct-glow', 32 * u, { x: cx, y: 32 * u, color: p.accent, a: 0.25, scale: k([0.1, 0.4], [1.3, 1, 'outCubic']) }),
        circle('ct-badge', 11 * u, { x: cx, y: 32 * u, fill: p.accent, scale: pop(0.15, 0.8, 'spring') }),
        icon('ct-chat', 'chat', { x: cx, y: 32.5 * u, size: 10.5 * u, color: p.onAccent, sw: 1.8, trimEnd: k([0.45, 0], [1.2, 1, 'inOutCubic']) }),
        ...[0, 1, 2].map((j) =>
          circle(`ct-typing-${j}`, 0.75 * u, {
            x: cx + (j - 1) * 2.4 * u,
            y: 31.8 * u,
            fill: p.onAccent,
            opacity: k([1.0, 0], [1.2, 1], [3.6, 1], [3.8, 0]),
            scale: k([1.0 + j * 0.15, 1], [1.35 + j * 0.15, 1.35, 'inOutSine'], [1.7 + j * 0.15, 1, 'inOutSine'], [2.4 + j * 0.15, 1], [2.75 + j * 0.15, 1.35, 'inOutSine'], [3.1 + j * 0.15, 1, 'inOutSine']),
          }),
        ),
        x.title('ct-title', x.c.cta, { size: tsz(x, 8.8 * u), x: cx, y: 68 * u, w: S - 2 * m - 10 * u, ay: 1, lineHeight: 1.04, anim: ta.rise(0.45, { stagger: 0.06 }) }),
        x.body('ct-sub', x.c.ctaSub, { size: 4 * u, x: cx, y: 72.5 * u, w: S - 2 * m - 6 * u, ay: 0, fill: p.muted, anim: fadeUp(0.8) }),
        chip(x, 'ct-c1', c1, { x: x0, y: 94 * u, size: 3.2 * u, fill: p.fg, color: p.bg, icon: 'chat', scale: k([1.0, 0.6], [1.5, 1, 'outBack']), opacity: fadeIn(1.0, 0.25) }),
        chip(x, 'ct-c2', c2, { x: x0 + w1 + gap, y: 94 * u, size: 3.2 * u, fill: p.accent, color: p.onAccent, icon: 'bookmark', scale: k([1.12, 0.6], [1.62, 1, 'outBack']), opacity: fadeIn(1.12, 0.25) }),
        x.body('ct-handle', x.c.handle, { size: 3 * u, x: cx, y: 105 * u, weight: 600, fill: p.muted, anim: ta.chars(1.3, { stagger: 0.02 }) }),
      );
    }
    return { layers: [...L, ...top] };
  },
};
