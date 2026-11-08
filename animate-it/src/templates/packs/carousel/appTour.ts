import type { Layer } from '../../../engine/types';
import type { Ctx } from '../../kit';
import { type Recipe, rect, circle, ellipse, group, phone, k, fadeIn, pop, ta, alpha, shade, linear } from '../../kit';
import { ambient, chip, estW, fadeUp, icon, isDark, list, pad2, seamLine, shadowCol, slideX, star, swipeCue } from './shared';

type Screen = (sw: number, sh: number) => Layer[];

function statusBar(x: Ctx, id: string, sw: number, color: string): Layer[] {
  const { u } = x;
  return [
    x.body(`${id}-time`, '9:41', { size: 1.9 * u, x: 3.6 * u, y: 3.4 * u, ax: 0, align: 'left', weight: 700, fill: color, lineHeight: 1 }),
    rect(`${id}-bat`, { x: sw - 3.4 * u, y: 3.4 * u, ax: 1, w: 3.2 * u, h: 1.5 * u, radius: 0.4 * u, fill: alpha(color, 0.85) }),
  ];
}

function homeScreen(x: Ctx, id: string): Screen {
  const { u, p } = x;
  return (sw, sh) => {
    const parts = x.c.ringText.split('/').map((s) => parseFloat(s));
    const frac = parts.length === 2 && parts[1] > 0 ? Math.min(1, parts[0] / parts[1]) : 0.6;
    const rows = list(x.c.rows).slice(0, 2);
    return [
      rect(`${id}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: p.surface }),
      ...statusBar(x, id, sw, p.fg),
      x.body(`${id}-hi`, x.c.greeting, { size: 2.9 * u, x: 3.6 * u, y: 11 * u, w: sw - 7 * u, ax: 0, ay: 0, align: 'left', weight: 700, fill: p.fg, lineHeight: 1.15 }),
      ellipse(`${id}-trk`, { x: sw / 2, y: 30 * u, w: 20 * u, h: 20 * u, stroke: alpha(p.fg, 0.08), strokeWidth: 2.2 * u }),
      ellipse(`${id}-arc`, { x: sw / 2, y: 30 * u, w: 20 * u, h: 20 * u, stroke: p.accent, strokeWidth: 2.2 * u, lineCap: 'round', arcEnd: k([0.6, 0], [1.8, frac, 'outCubic']) }),
      x.title(`${id}-rt`, x.c.ringText, { size: 4.6 * u, x: sw / 2, y: 29 * u, lineHeight: 1 }),
      x.body(`${id}-rl`, x.c.ringLabel, { size: 1.6 * u, x: sw / 2, y: 33.2 * u, weight: 600, fill: p.muted, lineHeight: 1 }),
      ...rows.flatMap((r, j) => [
        rect(`${id}-row${j}`, { x: 2.6 * u, y: (44 + j * 7.4) * u, ax: 0, w: sw - 5.2 * u, h: 6 * u, radius: 1.6 * u, fill: p.bg }),
        circle(`${id}-rc${j}`, 1.4 * u, { x: 5.6 * u, y: (44 + j * 7.4) * u, fill: j === 0 ? p.accent : alpha(p.fg, 0.12) }),
        x.body(`${id}-rt${j}`, r, { size: 1.9 * u, x: 8.6 * u, y: (44 + j * 7.4) * u, ax: 0, align: 'left', weight: 600, fill: p.fg, lineHeight: 1 }),
      ]),
    ];
  };
}

function peekScreen(x: Ctx, id: string): Screen {
  const { u, p } = x;
  return (sw, sh) => [
    rect(`${id}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: p.surface }),
    ...statusBar(x, id, sw, p.fg),
    x.body(`${id}-hi`, x.c.greeting, { size: 2.9 * u, x: 3.6 * u, y: 11 * u, w: sw - 7 * u, ax: 0, ay: 0, align: 'left', weight: 700, fill: p.fg, lineHeight: 1.15 }),
    rect(`${id}-card`, { x: 2.6 * u, y: 19 * u, ax: 0, ay: 0, w: sw - 5.2 * u, h: 12 * u, radius: 2 * u, fill: p.accent }),
  ];
}

function listScreen(x: Ctx, id: string): Screen {
  const { u, p } = x;
  return (sw, sh) => {
    const rows = list(x.c.rows).slice(0, 5);
    const out: Layer[] = [
      rect(`${id}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: p.surface }),
      ...statusBar(x, id, sw, p.fg),
      x.title(`${id}-h`, x.c.rowsTitle, { size: 4.2 * u, x: 3.6 * u, y: 11.5 * u, ax: 0, align: 'left', lineHeight: 1 }),
      rect(`${id}-card`, { x: 2.6 * u, y: 17 * u, ax: 0, ay: 0, w: sw - 5.2 * u, h: 9.6 * u, radius: 2 * u, fill: p.accent }),
      x.body(`${id}-ct`, `${Math.min(3, rows.length)} of ${rows.length} done`, { size: 2.1 * u, x: 5 * u, y: 20 * u, ax: 0, align: 'left', weight: 700, fill: p.onAccent, lineHeight: 1 }),
      rect(`${id}-tr`, { x: 5 * u, y: 23.4 * u, ax: 0, w: sw - 10 * u, h: 1.1 * u, radius: 0.55 * u, fill: alpha(p.onAccent, 0.3) }),
      rect(`${id}-tf`, { x: 5 * u, y: 23.4 * u, ax: 0, w: k([0.5, 0.01], [1.9, (sw - 10 * u) * 0.6, 'inOutCubic']), h: 1.1 * u, radius: 0.55 * u, fill: p.onAccent }),
    ];
    rows.forEach((r, j) => {
      const y = (32 + j * 7.2) * u;
      const done = j < 3;
      const t = 0.7 + j * 0.25;
      out.push(
        rect(`${id}-row${j}`, { x: 2.6 * u, y, ax: 0, w: sw - 5.2 * u, h: 6 * u, radius: 1.6 * u, fill: p.bg }),
        circle(`${id}-cb${j}`, 1.5 * u, { x: 5.8 * u, y, stroke: alpha(p.fg, 0.25), strokeWidth: 0.3 * u }),
        ...(done
          ? [
              circle(`${id}-cf${j}`, 1.5 * u, { x: 5.8 * u, y, fill: p.accent, scale: pop(t, 0.4) }),
              icon(`${id}-ck${j}`, 'check', { x: 5.8 * u, y, size: 2 * u, color: p.onAccent, sw: 3.4, trimEnd: k([t + 0.1, 0], [t + 0.4, 1, 'outCubic']) }),
            ]
          : []),
        x.body(`${id}-rt${j}`, r, { size: 2 * u, x: 9 * u, y, ax: 0, align: 'left', weight: 600, fill: done ? k([t, p.fg], [t + 0.3, p.muted]) : p.fg, lineHeight: 1 }),
      );
    });
    return out;
  };
}

function statsScreen(x: Ctx, id: string): Screen {
  const { u, p } = x;
  return (sw, sh) => {
    const hs = [0.45, 0.7, 0.55, 0.85, 0.6, 0.95, 0.75];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const cw = sw - 5.2 * u;
    const bw = 2.4 * u;
    const gap = (cw - 6 * u - bw * 7) / 6;
    const out: Layer[] = [
      rect(`${id}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: p.surface }),
      ...statusBar(x, id, sw, p.fg),
      x.title(`${id}-h`, x.c.statsTitle, { size: 4.2 * u, x: 3.6 * u, y: 11.5 * u, ax: 0, align: 'left', lineHeight: 1 }),
      icon(`${id}-fl`, 'flame', { x: 6 * u, y: 20.5 * u, size: 4.6 * u, color: p.accent, sw: 2 }),
      x.title(`${id}-big`, x.c.big, { size: 7.4 * u, x: 9.6 * u, y: 20.5 * u, ax: 0, align: 'left', lineHeight: 1, fill: p.fg }),
      x.body(`${id}-bl`, x.c.bigLabel, { size: 1.8 * u, x: 3.6 * u, y: 26 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, lineHeight: 1 }),
      rect(`${id}-card`, { x: 2.6 * u, y: 30 * u, ax: 0, ay: 0, w: cw, h: 23 * u, radius: 2 * u, fill: p.bg }),
    ];
    hs.forEach((h, j) => {
      const bx = 2.6 * u + 3 * u + j * (bw + gap) + bw / 2;
      const t = 0.5 + j * 0.08;
      out.push(
        rect(`${id}-b${j}`, { x: bx, y: 48 * u, ay: 1, w: bw, h: k([t, 0.01], [t + 0.8, h * 14 * u, 'outExpo']), radius: 0.8 * u, fill: j === 5 ? p.accent : alpha(p.accent, 0.3) }),
        x.body(`${id}-d${j}`, days[j], { size: 1.5 * u, x: bx, y: 50.6 * u, weight: 600, fill: p.muted, lineHeight: 1 }),
      );
    });
    out.push(
      rect(`${id}-r1`, { x: 2.6 * u, y: 57.5 * u, ax: 0, w: cw, h: 5.6 * u, radius: 1.6 * u, fill: p.bg }),
      x.body(`${id}-r1t`, 'Best week', { size: 1.9 * u, x: 5 * u, y: 57.5 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, lineHeight: 1 }),
      rect(`${id}-r1b`, { x: sw - 5 * u, y: 57.5 * u, ax: 1, w: 9 * u, h: 1.4 * u, radius: 0.7 * u, fill: alpha(p.accent, 0.5) }),
    );
    return out;
  };
}

function notifyScreen(x: Ctx, id: string): Screen {
  const { u, p } = x;
  return (sw, sh) => {
    const notes = [x.c.n1, x.c.n2, x.c.n3];
    const out: Layer[] = [
      rect(`${id}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: linear(160, p.accent, shade(p.accent, -0.45)) }),
      ...statusBar(x, id, sw, p.onAccent),
      x.title(`${id}-clock`, '9:41', { size: 10 * u, x: sw / 2, y: 15 * u, fill: p.onAccent, lineHeight: 1 }),
      x.body(`${id}-date`, 'Tuesday, 4 March', { size: 1.9 * u, x: sw / 2, y: 21.5 * u, weight: 600, fill: alpha(p.onAccent, 0.8), lineHeight: 1 }),
    ];
    notes.forEach((n, j) => {
      const nw = sw - 4.4 * u;
      const nh = 10.4 * u;
      const y = (28 + j * 12) * u;
      const t = 0.6 + j * 0.3;
      out.push(
        group(
          `${id}-n${j}`,
          [
            rect(`${id}-n${j}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: nw, h: nh, radius: 2.4 * u, fill: alpha(p.surface, 0.95) }),
            rect(`${id}-n${j}-ic`, { x: 4 * u, y: nh / 2, w: 4.4 * u, h: 4.4 * u, radius: 1.1 * u, fill: p.accent }),
            x.logo(`${id}-n${j}-lg`, { size: 2.8 * u, x: 4 * u, y: nh / 2, color: p.onAccent }),
            x.body(`${id}-n${j}-t`, x.c.brand, { size: 1.8 * u, x: 7.6 * u, y: 2.9 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, lineHeight: 1 }),
            x.body(`${id}-n${j}-now`, j === 0 ? 'now' : `${j * 2 + 1}m`, { size: 1.5 * u, x: nw - 2.4 * u, y: 2.9 * u, ax: 1, align: 'right', weight: 500, fill: p.muted, lineHeight: 1 }),
            x.body(`${id}-n${j}-b`, n, { size: 1.75 * u, x: 7.6 * u, y: 4.6 * u, w: nw - 10 * u, ax: 0, ay: 0, align: 'left', weight: 500, fill: p.fg, lineHeight: 1.25 }),
          ],
          { x: 2.2 * u, y: k([t, y - 8 * u], [t + 0.7, y, 'outBack']), w: nw, h: nh, ax: 0, ay: 0, opacity: fadeIn(t, 0.3), scale: k([t, 0.92], [t + 0.7, 1, 'outBack']) },
        ),
      );
    });
    return out;
  };
}

/** App tour: phones with live UI on every slide, riding one swoosh that winds across the carousel. */
export const appTour: Recipe = {
  id: 'carousel-app-tour',
  name: 'App Feature Tour',
  category: 'carousel',
  tags: ['carousel', 'app', 'product', 'features', 'phone', 'mockup', 'launch', 'new'],
  description: 'Five slides of phone mockups with animated UI (checklist, charts, notifications) riding one continuous swoosh.',
  duration: 5.5,
  slides: 5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'App name', default: 'Loopday' },
    { key: 'handle', label: 'Handle', default: '@loopday.app' },
    { key: 'title', label: 'Cover title', default: 'The habit app that actually sticks', multiline: true },
    { key: 'greeting', label: 'Home screen greeting', default: 'Good morning, Sam' },
    { key: 'ringText', label: 'Home ring value', default: '3/5' },
    { key: 'ringLabel', label: 'Home ring label', default: 'habits done' },
    { key: 'f1h', label: 'Feature 1 heading', default: 'Plan your day in one swipe', multiline: true },
    { key: 'f1b', label: 'Feature 1 body', default: 'Your habits, sorted by when you actually do them.', multiline: true },
    { key: 'rowsTitle', label: 'List screen title', default: 'Today' },
    { key: 'rows', label: 'List items (comma separated)', default: 'Morning run, Read 20 pages, Drink water, Stretch, Journal' },
    { key: 'chip1', label: 'Feature 1 badge', default: '3 done before 9 am' },
    { key: 'f2h', label: 'Feature 2 heading', default: 'Watch your streaks grow', multiline: true },
    { key: 'f2b', label: 'Feature 2 body', default: 'Weekly charts that make showing up feel like a game.', multiline: true },
    { key: 'statsTitle', label: 'Stats screen title', default: 'Streaks' },
    { key: 'big', label: 'Stats number', default: '21' },
    { key: 'bigLabel', label: 'Stats label', default: 'day streak · personal best' },
    { key: 'chip2', label: 'Feature 2 badge', default: 'New record: 21 days' },
    { key: 'f3h', label: 'Feature 3 heading', default: 'Nudges, not nagging', multiline: true },
    { key: 'f3b', label: 'Feature 3 body', default: 'Smart reminders that learn when you are free.', multiline: true },
    { key: 'n1', label: 'Notification 1', default: 'Two minutes free? Time for your stretch.' },
    { key: 'n2', label: 'Notification 2', default: 'You are on a 21-day streak. Keep going!' },
    { key: 'n3', label: 'Notification 3', default: 'Water break. Your future self says thanks.' },
    { key: 'chip3', label: 'Feature 3 badge', default: 'Snoozed until 3 pm' },
    { key: 'cta', label: 'Final slide title', default: 'Start your first streak today', multiline: true },
    { key: 'rating', label: 'Rating line', default: '4.8 · 12k ratings' },
    { key: 'ctaBtn', label: 'Final slide button', default: 'Get it free' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'outfit', logo: 'orbit' },
    {
      name: 'Midnight Money',
      palette: 'midnight',
      fonts: 'poppins',
      logo: 'stack',
      copy: {
        brand: 'Stashwise',
        handle: '@stashwise',
        title: 'Money that sorts itself out',
        greeting: 'Hi Jordan, you are on track',
        ringText: '68%',
        ringLabel: 'of monthly budget',
        f1h: 'Every expense, auto-sorted',
        f1b: 'Connect once. We file every payment in the right pot.',
        rowsTitle: 'This week',
        rows: 'Groceries, Rent, Coffee, Gym, Weekend trip',
        chip1: '$40 under budget',
        f2h: 'Watch your savings grow',
        f2b: 'Round-ups and goals that make saving automatic.',
        statsTitle: 'Savings',
        big: '$1,240',
        bigLabel: 'saved since January',
        chip2: 'Goal 62% complete',
        f3h: 'Heads-ups, not guilt trips',
        f3b: 'Friendly alerts before a bill lands, never after.',
        n1: 'Rent leaves tomorrow. You are covered.',
        n2: 'Round-ups added $3.20 to Holiday.',
        n3: 'Payday! Move $200 into savings?',
        chip3: 'Bill reminder set',
        cta: 'Take control in five minutes',
        rating: '4.9 · 31k ratings',
        ctaBtn: 'Download free',
      },
    },
    {
      name: 'Blush Journal',
      palette: 'blush',
      fonts: 'sora',
      logo: 'petal',
      copy: {
        brand: 'Petalnote',
        handle: '@petalnote',
        title: 'A calmer mind in five minutes a day',
        greeting: 'Evening, Mia. How was today?',
        ringText: '4/5',
        ringLabel: 'rituals done',
        f1h: 'Rituals that fit real life',
        f1b: 'Tiny prompts for mornings, lunch breaks and bedtime.',
        rowsTitle: 'Tonight',
        rows: 'Gratitude x3, Evening walk, Read 10 pages, Tea no screens, Lights out by 11',
        chip1: 'Gratitude logged',
        f2h: 'See your mood, gently',
        f2b: 'Soft weekly charts that spot what lifts you up.',
        statsTitle: 'Mood',
        big: '48',
        bigLabel: 'entries this month',
        chip2: 'Best week this year',
        f3h: 'Reminders that feel kind',
        f3b: 'Quiet nudges at the moments you set aside for you.',
        n1: 'Two minutes for tonight’s reflection?',
        n2: 'You wrote five days in a row.',
        n3: 'A memory from one year ago today.',
        chip3: 'Quiet hours on',
        cta: 'Your first entry is waiting',
        rating: '4.9 · 8k ratings',
        ctaBtn: 'Try it free',
      },
    },
    {
      name: 'Citrus Running',
      palette: 'citrus',
      fonts: 'manrope',
      logo: 'bolt',
      copy: {
        brand: 'Pacecraft',
        handle: '@pacecraft.run',
        title: 'Run more. Hurt less. Smile more.',
        greeting: 'Morning, Alex. Ready?',
        ringText: '3/4',
        ringLabel: 'runs this week',
        f1h: 'Plans that adapt to you',
        f1b: 'Missed a run? Your week rebalances automatically.',
        rowsTitle: 'This week',
        rows: 'Easy 5K, Hill repeats, Rest day, Tempo 8K, Long run 16K',
        chip1: 'Plan adjusted',
        f2h: 'Progress you can feel',
        f2b: 'Pace, distance and streaks in one clean view.',
        statsTitle: 'Distance',
        big: '142 km',
        bigLabel: 'run this month',
        chip2: 'New 5K best: 24:18',
        f3h: 'Coaching in your ear',
        f3b: 'Timely tips on pace, form and recovery.',
        n1: 'Perfect running weather at 6 pm.',
        n2: 'New 5K personal best: 24:18!',
        n3: 'Rest day tomorrow. You earned it.',
        chip3: 'Rest day booked',
        cta: 'Lace up for your first plan',
        rating: '4.8 · 19k ratings',
        ctaBtn: 'Start running',
      },
    },
  ],
  build(x) {
    const { u, H, p, slideW: S, slides: N } = x;
    const dur = 5.5;
    const m = 9 * u;
    const L: Layer[] = [];
    const body = isDark(p) ? shade(p.bg2, 0.28) : p.fg;
    const ph = 76 * u;
    const phoneY = 56 * u + ph / 2;

    // swoosh behind all phones
    const sw1 = (g: number) => 86 * u + 13 * u * Math.sin((g / S) * Math.PI * 1.05 + 0.4);
    const sw2 = (g: number) => 92 * u + 10 * u * Math.sin((g / S) * Math.PI * 1.05 + 1.5);
    L.push(
      ...seamLine(x, 'sw-a', sw1, { stroke: alpha(p.accent, 0.22), width: 9 * u, t0: 0.05, dur: 1.4 }),
      ...seamLine(x, 'sw-b', sw2, { stroke: p.accent2, width: 0.8 * u, t0: 0.2, dur: 1.4, opacity: 0.55 }),
    );

    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      if (i > 0) {
        L.push(
          rect(`hd-tile-${i}`, { x: X + m + 2.6 * u, y: 9 * u, w: 5.2 * u, h: 5.2 * u, radius: 1.4 * u, fill: p.accent, scale: pop(0.05, 0.5) }),
          x.logo(`hd-logo-${i}`, { size: 3.3 * u, x: X + m + 2.6 * u, y: 9 * u, color: p.onAccent, scale: pop(0.1, 0.5) }),
          x.body(`hd-b-${i}`, x.c.brand, { size: 3 * u, x: X + m + 7 * u, y: 9 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, opacity: fadeIn(0.1, 0.5) }),
          x.body(`hd-c-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, { size: 2.8 * u, x: X + S - m, y: 9 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.08, opacity: fadeIn(0.15, 0.5) }),
        );
      }
    }

    const mkPhone = (id: string, cx: number, rot: number, scr: Screen, t: number, y = phoneY) =>
      phone(id, { x: cx, y: k([t, y + 30 * u], [t + 1.0, y, 'outExpo']), h: ph, body, rotation: k([t, rot * 2.5], [t + 1.2, rot, 'outBack']), opacity: fadeIn(t, 0.3) }, scr);

    const floatChip = (id: string, label: string, ic: string, cx: number, cy: number, t: number) =>
      chip(x, id, label, {
        x: cx,
        y: ambient(cy, 0.8 * u, t + 0.6, dur, 1.4),
        ax: 0.5,
        size: 2.8 * u,
        fill: p.surface,
        color: p.fg,
        icon: ic,
        iconColor: p.accent,
        shadow: { color: shadowCol(p, 0.25), blur: 3 * u, y: 1 * u },
        scale: k([t, 0.4], [t + 0.6, 1, 'outBack']),
        opacity: fadeIn(t, 0.2),
      });

    // ---------------------------------------------------------------- cover
    {
      const cx = S / 2;
      L.push(
        rect('cv-tile', { x: m + 3.6 * u, y: 12 * u, w: 7.2 * u, h: 7.2 * u, radius: 2 * u, fill: p.accent, scale: pop(0.05, 0.6, 'spring') }),
        x.logo('cv-logo', { size: 4.6 * u, x: m + 3.6 * u, y: 12 * u, color: p.onAccent, scale: pop(0.12, 0.6, 'spring') }),
        x.body('cv-brand', x.c.brand, { size: 3.6 * u, x: m + 9.4 * u, y: 12 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, anim: ta.slide(0.2, { stagger: 0.04 }) }),
        swipeCue(x, 'cv-swipe', { x: S - m, y: 12 * u, bg: p.fg, fg: p.bg, t0: 1.1, dur }),
        x.title('cv-title', x.c.title, { size: 9.4 * u, x: cx, y: 47 * u, w: S - 2 * m, ay: 1, lineHeight: 1.02, anim: ta.riseLines(0.25, { stagger: 0.12 }) }),
        mkPhone('cv-phone', cx, -4, homeScreen(x, 'cv-scr'), 0.35),
        floatChip('cv-chip', `${x.c.ringText} ${x.c.ringLabel}`, 'check', cx + 25 * u, 104 * u, 1.3),
      );
    }

    // ---------------------------------------------------------------- features
    const feats: [string, string, Screen, string, string, number][] = [
      [x.c.f1h, x.c.f1b, listScreen(x, 'f1-scr'), x.c.chip1, 'check', -1],
      [x.c.f2h, x.c.f2b, statsScreen(x, 'f2-scr'), x.c.chip2, 'trophy', 1],
      [x.c.f3h, x.c.f3b, notifyScreen(x, 'f3-scr'), x.c.chip3, 'bell', -1],
    ];
    feats.forEach(([h, b, scr, c, ic, side], n) => {
      const i = n + 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      L.push(
        x.body(`ft-k-${i}`, `Feature ${pad2(i)}`, { size: 2.7 * u, x: cx, y: 17 * u, weight: 700, fill: p.accent, uppercase: true, tracking: 0.16, anim: ta.chars(0.1, { stagger: 0.02 }) }),
        x.title(`ft-h-${i}`, h, { size: 8.2 * u, x: cx, y: 38 * u, w: S - 2 * m, ay: 1, lineHeight: 1.03, anim: ta.rise(0.2, { stagger: 0.06 }) }),
        x.body(`ft-b-${i}`, b, { size: 3.8 * u, x: cx, y: 41.5 * u, w: S - 2 * m - 8 * u, ay: 0, lineHeight: 1.38, fill: p.muted, anim: fadeUp(0.5) }),
        mkPhone(`ft-phone-${i}`, cx, side * -3, scr, 0.25),
        floatChip(`ft-chip-${i}`, c, ic, cx + side * 25 * u, [96, 104, 66][n] * u, 1.2),
      );
    });

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      const rx0 = cx - (23 * u + estW(x.c.rating, 3.2 * u)) / 2;
      L.push(
        rect('ct-tile', { x: cx, y: 30 * u, w: 22 * u, h: 22 * u, radius: 6 * u, fill: p.accent, shadow: { color: shadowCol(p, 0.3), blur: 5 * u, y: 2 * u }, scale: pop(0.1, 0.8, 'spring'), rotation: k([0.1, -12], [1.0, 0, 'outBack']) }),
        x.logo('ct-logo', { size: 13 * u, x: cx, y: 30 * u, color: p.onAccent, scale: pop(0.2, 0.8, 'spring'), rotation: k([0.2, -12], [1.1, 0, 'outBack']) }),
        x.title('ct-title', x.c.cta, { size: 8.4 * u, x: cx, y: 46 * u, w: S - 2 * m - 6 * u, ay: 0, lineHeight: 1.04, anim: ta.rise(0.45, { stagger: 0.06 }) }),
        ...Array.from({ length: 5 }, (_, j) => star(`ct-star-${j}`, { x: rx0 + 1.7 * u + j * 4.2 * u, y: 69 * u, size: 3.4 * u, color: p.accent, scale: pop(0.8 + j * 0.06, 0.4) })),
        x.body('ct-rating', x.c.rating, { size: 3.2 * u, x: rx0 + 23 * u, y: 69 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, opacity: fadeIn(1.1, 0.4) }),
        chip(x, 'ct-btn', x.c.ctaBtn, {
          x: cx,
          y: 80 * u,
          ax: 0.5,
          size: 3.4 * u,
          fill: p.fg,
          color: p.bg,
          icon: 'arrowDown',
          scale: k([1.0, 0.6], [1.5, 1, 'outBack']),
          opacity: fadeIn(1.0, 0.25),
        }),
        x.body('ct-handle', x.c.handle, { size: 3 * u, x: cx, y: 90 * u, weight: 600, fill: p.muted, anim: ta.chars(1.2, { stagger: 0.02 }) }),
        mkPhone('ct-phone', cx, 0, peekScreen(x, 'ct-scr'), 0.5, H - 22 * u + ph / 2),
      );
    }

    return { layers: L };
  },
};
