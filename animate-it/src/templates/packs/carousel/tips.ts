import type { Layer } from '../../../engine/types';
import { type Recipe, rect, group, k, tween, fadeIn, pop, ta, alpha } from '../../kit';
import { chip, fadeUp, glow, icon, pad2, shadowCol, slideX, swipeCue, tsz } from './shared';

/** Listicle: oversized numerals, fanned card cover, progress bar that fills slide by slide. */
export const bigNumberTips: Recipe = {
  id: 'carousel-big-number-tips',
  name: 'Big Number Tips',
  category: 'carousel',
  tags: ['carousel', 'tips', 'listicle', 'educational', 'linkedin', 'instagram', 'numbers'],
  description: 'Six-slide listicle with oversized numerals, a fanned-card cover and a progress bar that fills slide by slide.',
  duration: 5,
  slides: 6,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Northlane Studio' },
    { key: 'handle', label: 'Handle', default: '@northlane.studio' },
    { key: 'kicker', label: 'Cover kicker', default: '4 ways to' },
    { key: 'title', label: 'Cover title', default: 'Write hooks that stop the scroll', multiline: true },
    { key: 't1h', label: 'Tip 1 heading', default: 'Open with the outcome' },
    { key: 't1b', label: 'Tip 1 body', default: 'Lead with the result your reader wants, then show how to get there.', multiline: true },
    { key: 't2h', label: 'Tip 2 heading', default: 'Cut the warm-up' },
    { key: 't2b', label: 'Tip 2 body', default: 'Delete your first sentence. The second one is almost always stronger.', multiline: true },
    { key: 't3h', label: 'Tip 3 heading', default: 'Use real numbers' },
    { key: 't3b', label: 'Tip 3 body', default: '“Saved 6 hours a week” beats “saves time” every single time.', multiline: true },
    { key: 't4h', label: 'Tip 4 heading', default: 'Leave a loop open' },
    { key: 't4b', label: 'Tip 4 body', default: 'Ask a question in line one and answer it on the very last slide.', multiline: true },
    { key: 'cta', label: 'Final slide CTA', default: 'Save this for your next post', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'New writing tips every Tuesday.' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk' },
    {
      name: 'Noir Focus',
      palette: 'noir',
      fonts: 'space',
      copy: {
        brand: 'Deepwork Weekly',
        handle: '@deepworkweekly',
        kicker: '4 habits for',
        title: 'Deep work in a noisy office',
        t1h: 'Book mornings, not hours',
        t1b: 'Block 9–11 as “focus” every day. Meetings start after lunch.',
        t2h: 'One tab, one task',
        t2b: 'Close everything you are not using. Your brain reloads every tab.',
        t3h: 'Batch your replies',
        t3b: 'Answer messages at 11, 2 and 4. Nothing is that urgent.',
        t4h: 'End with a note',
        t4b: 'Write tomorrow’s first step before you log off. Start warm.',
        cta: 'Save this for Monday morning',
        ctaSub: 'Follow for one focus habit a week.',
      },
    },
    {
      name: 'Peach Home',
      palette: 'peach',
      fonts: 'fraunces',
      copy: {
        brand: 'Small Room Club',
        handle: '@smallroomclub',
        kicker: '4 ways to',
        title: 'Make a small room feel bigger',
        t1h: 'Raise the curtains',
        t1b: 'Hang rods just below the ceiling. Walls instantly look taller.',
        t2h: 'Lift furniture up',
        t2b: 'Pick sofas and beds on legs. Visible floor reads as more space.',
        t3h: 'Go big on the rug',
        t3b: 'A rug that fits under every piece pulls the room together.',
        t4h: 'Mirror the window',
        t4b: 'Place a mirror opposite the light to double the daylight.',
        cta: 'Save this before you redecorate',
        ctaSub: 'Small-space ideas every week.',
      },
    },
    {
      name: 'Electric Pricing',
      palette: 'electric',
      fonts: 'unbounded',
      copy: {
        brand: 'Rate Club',
        handle: '@rate.club',
        kicker: '4 rules for',
        title: 'Pricing your freelance work',
        t1h: 'Price the result',
        t1b: 'Clients buy outcomes, not hours. Anchor on what the work is worth.',
        t2h: 'Always offer three',
        t2b: 'A basic, a recommended and a premium option. Most pick the middle.',
        t3h: 'Raise every January',
        t3b: 'A 10% yearly increase is normal. Announce it 60 days ahead.',
        t4h: 'Charge a deposit',
        t4b: '50% upfront filters serious clients and protects your cash flow.',
        cta: 'Send this to a freelance friend',
        ctaSub: 'Pricing tips for creatives, weekly.',
      },
    },
  ],
  build(x) {
    const { u, H, p, slideW: S, slides: N } = x;
    const dur = 5;
    const m = 9 * u;
    const L: Layer[] = [];
    const tips: [string, string][] = [
      [x.c.t1h, x.c.t1b],
      [x.c.t2h, x.c.t2b],
      [x.c.t3h, x.c.t3b],
      [x.c.t4h, x.c.t4b],
    ];
    const barY = H - 9 * u;
    const trackW = S - 2 * m;

    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      // header: logo + brand left, counter right
      L.push(
        x.logo(`hd-logo-${i}`, { size: 5 * u, x: X + m + 2.5 * u, y: 9 * u, color: p.accent, opacity: fadeIn(0.05, 0.5) }),
        x.body(`hd-brand-${i}`, x.c.brand, {
          size: 3 * u,
          x: X + m + 7 * u,
          y: 9 * u,
          ax: 0,
          align: 'left',
          weight: 700,
          fill: p.fg,
          anim: ta.slide(0.1, { stagger: 0.04 }),
        }),
        x.body(`hd-count-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, {
          size: 2.8 * u,
          x: X + S - m,
          y: 9 * u,
          ax: 1,
          align: 'right',
          weight: 600,
          fill: p.muted,
          tracking: 0.08,
          opacity: fadeIn(0.15, 0.5),
        }),
        // progress track
        rect(`bar-bg-${i}`, { x: X + m, y: barY, ax: 0, w: trackW, h: 0.8 * u, radius: 0.4 * u, fill: alpha(p.fg, 0.1) }),
        rect(`bar-fg-${i}`, {
          x: X + m,
          y: barY,
          ax: 0,
          w: k([0.2, Math.max(0.01, (trackW * Math.max(0, i - 1)) / (N - 1))], [1.2, Math.max(0.01, (trackW * i) / (N - 1)), 'inOutCubic']),
          h: 0.8 * u,
          radius: 0.4 * u,
          fill: p.accent,
        }),
      );
    }

    // ---------------------------------------------------------------- cover
    {
      const X = 0;
      L.push(glow('cv-glow', 46 * u, { x: X + S * 0.55, y: 35 * u, color: p.accent, a: 0.18, scale: tween(0.6, 1, 0, 1.6, 'outCubic') }));
      const fan = [3, 2, 1, 0];
      for (const j of fan) {
        const cw = 27 * u;
        const ch = 36 * u;
        const fx = X + S / 2 + (j - 1.5) * 15.5 * u;
        const fy = 34 * u + Math.abs(j - 1.5) * 2.4 * u;
        const rot = (j - 1.5) * 8.5;
        const t = 0.15 + (3 - j) * 0.09;
        const top = j === 0;
        L.push(
          group(
            `cv-card-${j}`,
            [
              rect(`cv-card-${j}-bg`, {
                x: 0,
                y: 0,
                ax: 0,
                ay: 0,
                w: cw,
                h: ch,
                radius: 3 * u,
                fill: top ? p.accent : p.surface,
                stroke: top ? undefined : alpha(p.fg, 0.08),
                strokeWidth: top ? 0 : 0.2 * u,
                shadow: { color: shadowCol(p), blur: 5 * u, y: 1.6 * u },
              }),
              x.title(`cv-card-${j}-n`, pad2(j + 1), {
                size: tsz(x, 13 * u),
                x: 4 * u,
                y: 4 * u,
                ax: 0,
                ay: 0,
                align: 'left',
                fill: top ? p.onAccent : p.accent,
              }),
              rect(`cv-card-${j}-l1`, { x: 4 * u, y: ch - 10.5 * u, ax: 0, w: cw - 8 * u, h: 1.4 * u, radius: 0.7 * u, fill: alpha(top ? p.onAccent : p.fg, top ? 0.55 : 0.14) }),
              rect(`cv-card-${j}-l2`, { x: 4 * u, y: ch - 6.5 * u, ax: 0, w: cw - 14 * u, h: 1.4 * u, radius: 0.7 * u, fill: alpha(top ? p.onAccent : p.fg, top ? 0.35 : 0.09) }),
            ],
            {
              x: k([t, X + S / 2], [t + 1.1, fx, 'outExpo']),
              y: k([t, fy + 30 * u], [t + 0.9, fy, 'outExpo']),
              w: cw,
              h: ch,
              rotation: k([t, 0], [t + 1.2, rot, 'outBack']),
              opacity: fadeIn(t, 0.3),
            },
          ),
        );
      }
      L.push(
        chip(x, 'cv-kicker', x.c.kicker, {
          x: X + m,
          y: 60.5 * u,
          size: 2.9 * u,
          fill: alpha(p.accent, 0.12),
          color: p.accent,
          upper: true,
          tracking: 0.1,
          scale: k([0.35, 0.7], [0.9, 1, 'outBack']),
          opacity: fadeIn(0.35, 0.3),
        }),
        x.title('cv-title', x.c.title, {
          size: tsz(x, 11 * u),
          x: X + m,
          y: 66 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.0,
          anim: ta.riseLines(0.4, { stagger: 0.12 }),
        }),
        x.body('cv-handle', x.c.handle, { size: 3 * u, x: X + m, y: 108 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, opacity: fadeIn(1.0, 0.5) }),
        swipeCue(x, 'cv-swipe', { x: X + S - m, y: 108 * u, bg: p.fg, fg: p.bg, t0: 1.0, dur }),
      );
    }

    // ---------------------------------------------------------------- tips
    tips.forEach(([h, b], n) => {
      const i = n + 1;
      const X = slideX(x, i);
      L.push(
        x.title(`tp-echo-${i}`, pad2(i), {
          size: 42 * u,
          x: k([0.3, X + m - 1 * u], [1.3, X + m + 0.8 * u, 'outExpo']),
          y: k([0.3, 16 * u], [1.3, 17.8 * u, 'outExpo']),
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1,
          fill: 'transparent',
          stroke: alpha(p.accent, 0.45),
          strokeWidth: 0.22 * u,
          opacity: fadeIn(0.3, 0.6),
        }),
        x.title(`tp-num-${i}`, pad2(i), {
          size: 42 * u,
          x: X + m - 1 * u,
          y: 16 * u,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1,
          fill: p.accent,
          anim: ta.rise(0.12, { by: 'char', stagger: 0.09, dur: 0.95 }),
        }),
        x.title(`tp-h-${i}`, h, {
          size: tsz(x, 8.6 * u),
          x: X + m,
          y: 84 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 1,
          align: 'left',
          lineHeight: 1.04,
          anim: ta.rise(0.35, { stagger: 0.06 }),
        }),
        rect(`tp-rule-${i}`, { x: X + m, y: 88.5 * u, ax: 0, w: tween(0, 14 * u, 0.6, 0.8), h: 1 * u, radius: 0.5 * u, fill: p.accent }),
        x.body(`tp-b-${i}`, b, {
          size: 4.2 * u,
          x: X + m,
          y: 93 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.4,
          fill: p.muted,
          anim: fadeUp(0.7),
        }),
      );
    });

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      L.push(
        glow('ct-glow', 40 * u, { x: cx, y: 36 * u, color: p.accent, a: 0.2, scale: tween(0.4, 1, 0.1, 1.4, 'outCubic') }),
        rect('ct-tile', {
          x: cx,
          y: 36 * u,
          w: 24 * u,
          h: 24 * u,
          radius: 6.5 * u,
          fill: p.accent,
          shadow: { color: shadowCol(p, 0.3), blur: 5 * u, y: 2 * u },
          scale: pop(0.15, 0.8, 'spring'),
          rotation: k([0.15, -14], [1.0, 0, 'outBack']),
        }),
        icon('ct-icon', 'bookmark', {
          x: cx,
          y: 36 * u,
          size: 12 * u,
          color: p.onAccent,
          sw: 2,
          trimEnd: k([0.55, 0], [1.3, 1, 'inOutCubic']),
        }),
        x.title('ct-title', x.c.cta, {
          size: tsz(x, 8.6 * u),
          x: cx,
          y: 70 * u,
          w: S - 2 * m,
          ay: 1,
          lineHeight: 1.04,
          anim: ta.rise(0.45, { stagger: 0.06 }),
        }),
        x.body('ct-sub', x.c.ctaSub, { size: 4 * u, x: cx, y: 74.5 * u, w: S - 2 * m, ay: 0, fill: p.muted, anim: fadeUp(0.8) }),
        chip(x, 'ct-follow', `Follow ${x.c.handle}`, {
          x: cx,
          y: 95 * u,
          ax: 0.5,
          size: 3.3 * u,
          fill: p.fg,
          color: p.bg,
          icon: 'plus',
          scale: k([1.0, 0.6], [1.6, 1, 'outBack']),
          opacity: fadeIn(1.0, 0.25),
        }),
      );
    }
    return { layers: L };
  },
};
