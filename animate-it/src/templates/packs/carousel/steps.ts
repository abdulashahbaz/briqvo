import type { Layer } from '../../../engine/types';
import { type Recipe, circle, k, fadeIn, pop, ta, alpha } from '../../kit';
import { chip, dots, fadeUp, glow, icon, pad2, seamDots, seamLine, slideX, smoothThrough, swipeCue } from './shared';

/** Process carousel: one winding route draws itself through every slide, each step a node on it. */
export const stepPath: Recipe = {
  id: 'carousel-step-path',
  name: 'Step Path',
  category: 'carousel',
  tags: ['carousel', 'how to', 'process', 'steps', 'guide', 'seamless', 'educational'],
  description: 'A winding route runs from the cover to the finish flag, drawing itself across every slide with numbered stops.',
  duration: 5.5,
  slides: 6,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'The Weekly Send' },
    { key: 'handle', label: 'Handle', default: '@theweeklysend' },
    { key: 'kicker', label: 'Cover kicker', default: 'Step-by-step' },
    { key: 'title', label: 'Cover title', default: 'Launch your newsletter this weekend', multiline: true },
    { key: 's1t', label: 'Step 1 time', default: 'Friday night' },
    { key: 's1h', label: 'Step 1 heading', default: 'Pick one reader' },
    { key: 's1b', label: 'Step 1 body', default: 'Write down who it is for and the one problem you will help them solve.', multiline: true },
    { key: 's2t', label: 'Step 2 time', default: 'Saturday am' },
    { key: 's2h', label: 'Step 2 heading', default: 'Draft three issues' },
    { key: 's2b', label: 'Step 2 body', default: 'Start with a buffer. Three ready drafts beat one perfect issue.', multiline: true },
    { key: 's3t', label: 'Step 3 time', default: 'Saturday pm' },
    { key: 's3h', label: 'Step 3 heading', default: 'Set up a signup page' },
    { key: 's3b', label: 'Step 3 body', default: 'One headline, one promise, one email field. Nothing else.', multiline: true },
    { key: 's4t', label: 'Step 4 time', default: 'Sunday' },
    { key: 's4h', label: 'Step 4 heading', default: 'Invite your first 50' },
    { key: 's4b', label: 'Step 4 body', default: 'Message friends and peers one by one. Personal invites convert 5× better.', multiline: true },
    { key: 'cta', label: 'Final slide title', default: 'Monday, hit send.', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'Save this plan and tag a friend who keeps saying “someday”.', multiline: true },
  ],
  variants: [
    { name: 'Cobalt Cream', palette: 'cobalt', fonts: 'grotesk' },
    {
      name: 'Forest Herbs',
      palette: 'forest',
      fonts: 'outfit',
      copy: {
        brand: 'Windowsill Garden',
        handle: '@windowsill.garden',
        kicker: 'Beginner guide',
        title: 'Grow herbs on any windowsill',
        s1t: 'Week 1',
        s1h: 'Find your brightest window',
        s1b: 'Herbs want 6 hours of light. South or west facing is ideal.',
        s2t: 'Week 1',
        s2h: 'Start with easy wins',
        s2b: 'Basil, chives and mint forgive almost every beginner mistake.',
        s3t: 'Weeks 2–5',
        s3h: 'Water from below',
        s3b: 'Sit pots in a tray for 10 minutes. Roots drink, leaves stay dry.',
        s4t: 'Week 6+',
        s4h: 'Harvest from the top',
        s4b: 'Pinch above a leaf pair and the plant grows back twice as bushy.',
        cta: 'Fresh herbs, all year round.',
        ctaSub: 'Save this guide and follow for weekly growing tips.',
      },
    },
    {
      name: 'Lilac Research',
      palette: 'lilac',
      fonts: 'sora',
      copy: {
        brand: 'Research Room',
        handle: '@researchroom',
        kicker: 'UX research 101',
        title: 'Run your first user interview',
        s1t: '30 min',
        s1h: 'Write five open questions',
        s1b: 'Start with “Tell me about the last time you…”, never “Would you…”.',
        s2t: '1 day',
        s2h: 'Recruit five real users',
        s2b: 'Five interviews uncover most of the big problems. More is diminishing.',
        s3t: '45 min each',
        s3h: 'Listen 80% of the time',
        s3b: 'Silence is a tool. Count to five before you ask the next question.',
        s4t: '1 hour',
        s4h: 'Share three insights',
        s4b: 'Quotes, patterns, one surprise. Keep the deck under ten slides.',
        cta: 'You just did real research.',
        ctaSub: 'Save this and send it to the PM who needs it.',
      },
    },
    {
      name: 'Citrus Meal Prep',
      palette: 'citrus',
      fonts: 'archivo',
      copy: {
        brand: 'Prep Club',
        handle: '@prep.club',
        kicker: '90-minute plan',
        title: 'Meal prep a full week on Sunday',
        s1t: '10 min',
        s1h: 'Plan three bases',
        s1b: 'One grain, two proteins, three sauces. Mix and match all week.',
        s2t: '20 min',
        s2h: 'Shop in one trip',
        s2b: 'Group your list by aisle. In and out in twenty minutes flat.',
        s3t: '45 min',
        s3h: 'Cook in parallel',
        s3b: 'Oven, stove and rice cooker all at once. Nothing waits.',
        s4t: '15 min',
        s4h: 'Pack and label',
        s4b: 'Glass boxes, dates on lids. Eat the fish first, freeze the rest.',
        cta: 'Five lunches. Zero stress.',
        ctaSub: 'Save this for Sunday and share it with your meal-prep buddy.',
      },
    },
  ],
  build(x) {
    const { u, p, slideW: S, slides: N } = x;
    const dur = 5.5;
    const m = 9 * u;
    const L: Layer[] = [];
    const seamY = 46 * u;
    const nodeY = 28 * u;
    const nx = [0.3, 0.7, 0.3, 0.7];
    const startX = m + 2.2 * u;
    const endX = (N - 1) * S + S / 2;
    const pts: [number, number][] = [[startX, 36 * u], [S * 0.55, 24 * u]];
    for (let i = 1; i < N - 1; i++) pts.push([i * S, seamY], [i * S + nx[i - 1] * S, nodeY]);
    pts.push([(N - 1) * S, seamY], [endX, 30 * u]);
    const fn = smoothThrough(pts);
    const t0 = 0.15;
    const d = 1.5;
    // approximate inOutCubic inverse for node arrival
    const arrive = (f: number) => t0 + d * (f < 0.5 ? Math.cbrt(f / 4) : 1 - Math.cbrt((1 - f) / 4));

    L.push(
      ...seamDots(x, 'route', fn, { from: startX, to: endX, gap: 2.6 * u, r: 0.32 * u, fill: alpha(p.fg, 0.28), opacity: fadeIn(0, 0.5) }),
      ...seamLine(x, 'path', fn, { from: startX, to: endX, stroke: p.accent, width: 1.1 * u, t0, dur: d }),
    );

    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      L.push(
        x.body(`hd-b-${i}`, x.c.brand, { size: 2.9 * u, x: X + m, y: 9 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, opacity: fadeIn(0.05, 0.5) }),
        x.body(`hd-c-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, { size: 2.8 * u, x: X + S - m, y: 9 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.08, opacity: fadeIn(0.1, 0.5) }),
        ...dots(x, i, { y: 118 * u, on: p.accent, off: alpha(p.fg, 0.18) }),
      );
    }

    // ---------------------------------------------------------------- cover
    L.push(
      circle('cv-start-ring', 3.2 * u, { x: startX, y: 36 * u, stroke: p.accent, strokeWidth: 0.6 * u, fill: p.bg, scale: pop(0.05, 0.5) }),
      circle('cv-start-dot', 1.3 * u, { x: startX, y: 36 * u, fill: p.accent, scale: pop(0.15, 0.5) }),
      x.body('cv-start-l', 'Start here', { size: 2.6 * u, x: m - 0.6 * u, y: 43 * u, ax: 0, align: 'left', weight: 700, fill: p.accent, uppercase: true, tracking: 0.14, anim: ta.slide(0.3, { stagger: 0.04 }) }),
      chip(x, 'cv-kicker', x.c.kicker, {
        x: m,
        y: 58 * u,
        size: 2.9 * u,
        fill: alpha(p.accent, 0.12),
        color: p.accent,
        upper: true,
        tracking: 0.1,
        scale: k([0.3, 0.7], [0.9, 1, 'outBack']),
        opacity: fadeIn(0.3, 0.3),
      }),
      x.title('cv-title', x.c.title, {
        size: 11 * u,
        x: m,
        y: 63.5 * u,
        w: S - 2 * m,
        ax: 0,
        ay: 0,
        align: 'left',
        lineHeight: 1.0,
        anim: ta.riseLines(0.4, { stagger: 0.12 }),
      }),
      x.body('cv-handle', x.c.handle, { size: 3 * u, x: m, y: 108 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, opacity: fadeIn(1.0, 0.5) }),
      swipeCue(x, 'cv-swipe', { x: S - m, y: 108 * u, bg: p.accent, fg: p.onAccent, t0: 1.0, dur }),
    );

    // ---------------------------------------------------------------- steps
    const steps: [string, string, string][] = [
      [x.c.s1t, x.c.s1h, x.c.s1b],
      [x.c.s2t, x.c.s2h, x.c.s2b],
      [x.c.s3t, x.c.s3h, x.c.s3b],
      [x.c.s4t, x.c.s4h, x.c.s4b],
    ];
    steps.forEach(([t, h, b], n) => {
      const i = n + 1;
      const X = slideX(x, i);
      const cx = X + nx[n] * S;
      const ta0 = arrive(nx[n]) - 0.15;
      L.push(
        circle(`st-halo-${i}`, 12 * u, {
          x: cx,
          y: nodeY,
          fill: alpha(p.accent, 0.12),
          scale: k([ta0, 0], [ta0 + 0.7, 1, 'outBack'], [ta0 + 1.6, 0.86, 'inOutSine'], [ta0 + 2.6, 1, 'inOutSine'], [dur, 0.9, 'inOutSine']),
        }),
        circle(`st-node-${i}`, 7.2 * u, { x: cx, y: nodeY, fill: p.accent, stroke: p.bg, strokeWidth: 0.8 * u, scale: pop(ta0, 0.6) }),
        x.title(`st-num-${i}`, String(i), { size: 6.4 * u, x: cx, y: nodeY, fill: p.onAccent, lineHeight: 1, scale: pop(ta0 + 0.1, 0.6) }),
        chip(x, `st-time-${i}`, t, {
          x: X + m,
          y: 56 * u,
          size: 2.8 * u,
          fill: alpha(p.accent, 0.12),
          color: p.accent,
          icon: 'clock',
          weight: 700,
          opacity: fadeIn(0.35, 0.4),
          scale: k([0.35, 0.8], [0.85, 1, 'outBack']),
        }),
        x.title(`st-h-${i}`, h, {
          size: 8.8 * u,
          x: X + m,
          y: 82 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 1,
          align: 'left',
          lineHeight: 1.04,
          anim: ta.rise(0.45, { stagger: 0.06 }),
        }),
        x.body(`st-b-${i}`, b, {
          size: 4.2 * u,
          x: X + m,
          y: 86.5 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.4,
          fill: p.muted,
          anim: fadeUp(0.8),
        }),
      );
    });

    // ---------------------------------------------------------------- finish
    {
      const i = N - 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      const tf = t0 + d - 0.2;
      L.push(
        glow('ct-glow', 30 * u, { x: cx, y: 30 * u, color: p.accent, a: 0.25, scale: k([tf, 0], [tf + 0.9, 1, 'outCubic']) }),
        circle('ct-ring', 13 * u, {
          x: cx,
          y: 30 * u,
          stroke: p.accent,
          strokeWidth: 0.4 * u,
          scale: k([tf + 0.3, 0.7], [tf + 1.5, 1.5, 'outCubic'], [tf + 1.51, 0.7], [tf + 2.7, 1.5, 'outCubic']),
          opacity: k([tf + 0.29, 0], [tf + 0.3, 0.9], [tf + 1.5, 0, 'outCubic'], [tf + 1.51, 0.9], [tf + 2.7, 0, 'outCubic']),
        }),
        circle('ct-node', 10 * u, { x: cx, y: 30 * u, fill: p.accent, stroke: p.bg, strokeWidth: 0.9 * u, scale: pop(tf, 0.7, 'spring') }),
        icon('ct-flag', 'flag', { x: cx + 0.6 * u, y: 30 * u, size: 9 * u, color: p.onAccent, sw: 2, trimEnd: k([tf + 0.2, 0], [tf + 0.9, 1, 'inOutCubic']) }),
        x.title('ct-title', x.c.cta, { size: 9 * u, x: cx, y: 70 * u, w: S - 2 * m - 10 * u, ay: 1, lineHeight: 1.04, anim: ta.rise(0.5, { stagger: 0.06 }) }),
        x.body('ct-sub', x.c.ctaSub, { size: 4 * u, x: cx, y: 74.5 * u, w: S - 2 * m - 6 * u, ay: 0, fill: p.muted, anim: fadeUp(0.85) }),
        chip(x, 'ct-follow', `Follow ${x.c.handle}`, {
          x: cx,
          y: 98 * u,
          ax: 0.5,
          size: 3.3 * u,
          fill: p.fg,
          color: p.bg,
          icon: 'plus',
          scale: k([1.1, 0.6], [1.7, 1, 'outBack']),
          opacity: fadeIn(1.1, 0.25),
        }),
      );
    }

    return { layers: L };
  },
};
