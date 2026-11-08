import type { Layer } from '../../../engine/types';
import { type Recipe, rect, circle, group, k, fadeIn, pop, ta, alpha } from '../../kit';
import { chip, chipW, estW, fadeUp, icon, list, pad2, seamLine, slideX, statTitle, swipeCue } from './shared';

/** Mini case study: a chapter rail runs across the top of every slide, problem → solution → result. */
export const caseFile: Recipe = {
  id: 'carousel-case-file',
  name: 'Case File',
  category: 'carousel',
  tags: ['carousel', 'case study', 'results', 'agency', 'b2b', 'linkedin', 'seamless'],
  description: 'Problem, solution and result with animated churn icons, checklist cards and counting results, tied together by a chapter rail.',
  duration: 5.5,
  slides: 5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Your brand', default: 'Oakridge Labs' },
    { key: 'handle', label: 'Handle', default: '@oakridgelabs' },
    { key: 'client', label: 'Client name', default: 'Fernway' },
    { key: 'kicker', label: 'Cover kicker', default: 'Case study' },
    { key: 'title', label: 'Cover title', default: 'How Fernway cut churn by 38% in 90 days', multiline: true },
    { key: 'meta', label: 'Cover facts (· separated)', default: 'B2B SaaS · 40 people · 90 days' },
    { key: 'chapters', label: 'Chapter labels (comma separated)', default: 'Overview, Problem, Solution, Result, Your turn' },
    { key: 'problem', label: 'Problem', default: 'New users were leaving before they ever saw the value.', multiline: true },
    { key: 'pain', label: 'Pain stat', default: '1 in 4' },
    { key: 'painLabel', label: 'Pain stat label', default: 'customers cancelled within their first 60 days', multiline: true },
    { key: 'solH', label: 'Solution heading', default: 'A three-step onboarding rebuild', multiline: true },
    { key: 'sol1', label: 'Solution step 1', default: 'Rebuilt the first-run checklist around one quick win' },
    { key: 'sol2', label: 'Solution step 2', default: 'Triggered help emails from real product behaviour' },
    { key: 'sol3', label: 'Solution step 3', default: 'Added a 15-minute kickoff call for every new team' },
    { key: 'res', label: 'Headline result', default: '38%' },
    { key: 'resLabel', label: 'Headline result label', default: 'lower churn in just 90 days', multiline: true },
    { key: 'r2', label: 'Result 2', default: '2.4×' },
    { key: 'r2l', label: 'Result 2 label', default: 'more weekly active users' },
    { key: 'r3', label: 'Result 3', default: '$410k' },
    { key: 'r3l', label: 'Result 3 label', default: 'yearly revenue retained' },
    { key: 'cta', label: 'Final slide title', default: 'Want results like Fernway’s?', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'We take on two new growth projects each quarter.', multiline: true },
    { key: 'ctaBtn', label: 'Final slide button', default: 'Book a free audit' },
  ],
  variants: [
    { name: 'Graphite', palette: 'graphite', fonts: 'manrope', logo: 'stack' },
    {
      name: 'Arctic Clinic',
      palette: 'arctic',
      fonts: 'grotesk',
      logo: 'arc',
      copy: {
        brand: 'Northbeam Studio',
        handle: '@northbeam.studio',
        client: 'Brightside Dental',
        title: 'How Brightside Dental doubled online bookings',
        meta: 'Local clinic · 3 locations · 1 quarter',
        problem: 'Phones rang all day, but the website booked almost nobody.',
        pain: '6%',
        painLabel: 'of site visitors ever reached the booking page',
        solH: 'A booking-first website in four weeks',
        sol1: 'Put “Book a visit” on every page, above the fold',
        sol2: 'Cut the booking form from 11 fields to 4',
        sol3: 'Sent automatic reminders 24 hours before visits',
        res: '2×',
        resLabel: 'more online bookings every month',
        r2: '−43%',
        r2l: 'missed appointments',
        r3: '212',
        r3l: 'new patients in one quarter',
        cta: 'Want a calendar this full?',
        ctaSub: 'Free 20-minute website review for clinics.',
        ctaBtn: 'Book a review',
      },
    },
    {
      name: 'Peach Bakery',
      palette: 'peach',
      fonts: 'dmserif',
      logo: 'petal',
      copy: {
        brand: 'Hearth Digital',
        handle: '@hearth.digital',
        client: 'Crumb & Co.',
        title: 'How Crumb & Co. tripled weekend pre-orders',
        meta: 'Bakery · 2 shops · 8 weeks',
        problem: 'Weekend queues were long and the croissants sold out by 10 am.',
        pain: '1 in 3',
        painLabel: 'customers left the queue without buying anything',
        solH: 'A pre-order flow regulars love',
        sol1: 'Opened next-morning pre-orders until 8 pm',
        sol2: 'Added a two-tap reorder for regulars',
        sol3: 'Shared tomorrow’s bakes in a 7 pm text',
        res: '3×',
        resLabel: 'more weekend pre-orders',
        r2: '−60%',
        r2l: 'unsold pastries at close',
        r3: '+$86k',
        r3l: 'extra revenue per year',
        cta: 'Ready to sell out on purpose?',
        ctaSub: 'We help independent food brands grow online.',
        ctaBtn: 'Book a free call',
      },
    },
    {
      name: 'Forest Fleet',
      palette: 'forest',
      fonts: 'space',
      logo: 'wave',
      copy: {
        brand: 'Fieldline Analytics',
        handle: '@fieldline.io',
        client: 'Greenroute',
        title: 'How Greenroute cut delivery emissions by 27%',
        meta: 'Logistics · 120 vans · 6 months',
        problem: 'Routes were planned by hand every morning, wasting fuel and hours.',
        pain: '31%',
        painLabel: 'of daily miles were empty runs or backtracking',
        solH: 'Smarter routes, planned overnight',
        sol1: 'Optimised every route automatically before 5 am',
        sol2: 'Switched 40 city vans to electric',
        sol3: 'Grouped drops by building to cut stops',
        res: '27%',
        resLabel: 'lower delivery emissions',
        r2: '1.6×',
        r2l: 'more drops per van, per day',
        r3: '$1.2M',
        r3l: 'saved on fuel each year',
        cta: 'Want a greener, faster fleet?',
        ctaSub: 'Get a free route audit in two weeks.',
        ctaBtn: 'Request an audit',
      },
    },
  ],
  build(x) {
    const { u, W, p, slideW: S, slides: N } = x;
    const dur = 5.5;
    const m = 9 * u;
    const L: Layer[] = [];
    const railY = 13 * u;
    const chapters = list(x.c.chapters);

    // chapter rail across every slide
    L.push(...seamLine(x, 'rail', () => railY, { from: m, to: W - m, stroke: alpha(p.fg, 0.22), width: 0.3 * u, t0: 0.05, dur: 1.0 }));
    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      const lab = chapters[i] ?? '';
      const lw = estW(lab, 2.5 * u, true, 0.14);
      const cnt = `${pad2(i + 1)}/${pad2(N)}`;
      const cw = estW(cnt, 2.5 * u, false, 0.06);
      L.push(
        circle(`rl-halo-${i}`, 3 * u, { x: X + m + 1.5 * u, y: railY, fill: alpha(p.accent, 0.2), scale: pop(0.3, 0.6) }),
        circle(`rl-node-${i}`, 1.5 * u, { x: X + m + 1.5 * u, y: railY, fill: p.accent, scale: pop(0.2, 0.5) }),
        rect(`rl-cut-${i}`, { x: X + m + 4 * u, y: railY, ax: 0, w: lw + 3.4 * u, h: 4 * u, fill: p.bg }),
        x.body(`rl-lab-${i}`, lab, { size: 2.5 * u, x: X + m + 5.4 * u, y: railY, ax: 0, align: 'left', weight: 700, fill: p.accent, uppercase: true, tracking: 0.14, lineHeight: 1, anim: ta.slide(0.25, { stagger: 0.04 }) }),
        rect(`rl-cut2-${i}`, { x: X + S - m + 0.5 * u, y: railY, ax: 1, w: cw + 3 * u, h: 4 * u, fill: p.bg }),
        x.body(`rl-cnt-${i}`, cnt, { size: 2.5 * u, x: X + S - m, y: railY, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.06, lineHeight: 1, opacity: fadeIn(0.3, 0.4) }),
        // footer
        x.logo(`ft-logo-${i}`, { size: 4 * u, x: X + m + 2 * u, y: 116 * u, color: p.fg, opacity: fadeIn(0.4, 0.5) }),
        x.body(`ft-brand-${i}`, x.c.brand, { size: 2.8 * u, x: X + m + 5.6 * u, y: 116 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, opacity: fadeIn(0.45, 0.5) }),
        x.body(`ft-handle-${i}`, x.c.handle, { size: 2.8 * u, x: X + S - m, y: 116 * u, ax: 1, align: 'right', weight: 500, fill: p.muted, opacity: fadeIn(0.5, 0.5) }),
      );
    }

    // ---------------------------------------------------------------- cover
    {
      const kw = chipW(x.c.kicker, 2.9 * u, { upper: true, tracking: 0.1, icon: true });
      L.push(
        chip(x, 'cv-kicker', x.c.kicker, {
          x: m,
          y: 26 * u,
          size: 2.9 * u,
          fill: p.accent,
          color: p.onAccent,
          upper: true,
          tracking: 0.1,
          icon: 'layers',
          scale: k([0.2, 0.7], [0.7, 1, 'outBack']),
          opacity: fadeIn(0.2, 0.3),
        }),
        x.body('cv-client', x.c.client, { size: 3.4 * u, x: m + kw + 3 * u, y: 26 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, anim: ta.slide(0.35, { stagger: 0.05 }) }),
        x.title('cv-title', x.c.title, {
          size: 10.4 * u,
          x: m,
          y: 34 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.0,
          anim: ta.riseLines(0.35, { stagger: 0.11 }),
        }),
      );
      let cx = m;
      list(x.c.meta, /\s*·\s*/).forEach((t, j) => {
        const w = chipW(t, 2.8 * u);
        if (cx + w > S - m) return;
        L.push(chip(x, `cv-meta-${j}`, t, { x: cx, y: 88 * u, size: 2.8 * u, fill: p.surface, color: p.fg, weight: 600, stroke: alpha(p.fg, 0.1), opacity: fadeIn(0.9 + j * 0.1, 0.3), scale: k([0.9 + j * 0.1, 0.7], [1.4 + j * 0.1, 1, 'outBack']) }));
        cx += w + 2 * u;
      });
      L.push(swipeCue(x, 'cv-swipe', { x: S - m, y: 101 * u, bg: p.accent, fg: p.onAccent, t0: 1.2, dur }));
    }

    // ---------------------------------------------------------------- problem
    {
      const i = 1;
      const X = slideX(x, i);
      const n = 8;
      const step = (S - 2 * m) / n;
      const lost = new Set([2, 6]);
      L.push(
        x.title('pb-title', x.c.problem, { size: 7.2 * u, x: X + m, y: 24 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.06, anim: ta.rise(0.2, { stagger: 0.04 }) }),
      );
      for (let j = 0; j < n; j++) {
        const cx = X + m + step * (j + 0.5);
        const t = 0.4 + j * 0.06;
        const gone = lost.has(j);
        L.push(
          circle(`pb-c-${j}`, 4.3 * u, {
            x: cx,
            y: gone ? k([1.4, 63 * u], [2.0, 67 * u, 'outCubic']) : 63 * u,
            fill: gone ? k([1.4, alpha(p.fg, 0.07)], [1.8, alpha(p.accent, 0.22)]) : alpha(p.fg, 0.07),
            scale: pop(t, 0.5),
            opacity: gone ? k([1.4, 1], [2.0, 0.75]) : 1,
          }),
          icon(`pb-u-${j}`, 'user', {
            x: cx,
            y: gone ? k([1.4, 63 * u], [2.0, 67 * u, 'outCubic']) : 63 * u,
            size: 5 * u,
            color: gone ? k([1.4, p.fg], [1.8, p.accent]) : p.fg,
            sw: 1.9,
            scale: pop(t + 0.05, 0.5),
            opacity: gone ? k([1.4, 1], [2.0, 0.75]) : 1,
          }),
        );
      }
      L.push(
        statTitle(x, 'pb-stat', x.c.pain, { size: 15 * u, x: X + m, y: 77 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1, fill: p.accent, start: 1.2, dur: 0.9 }),
        x.body('pb-lab', x.c.painLabel, { size: 4 * u, x: X + m, y: 94 * u, w: S - 2 * m - 10 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1.35, fill: p.muted, anim: fadeUp(1.4) }),
      );
    }

    // ---------------------------------------------------------------- solution
    {
      const i = 2;
      const X = slideX(x, i);
      const cw = S - 2 * m;
      const ch = 15.5 * u;
      L.push(x.title('sl-title', x.c.solH, { size: 7.4 * u, x: X + m, y: 24 * u, w: cw, ax: 0, ay: 0, align: 'left', lineHeight: 1.05, anim: ta.rise(0.2, { stagger: 0.05 }) }));
      [x.c.sol1, x.c.sol2, x.c.sol3].forEach((t, r) => {
        const t0 = 0.45 + r * 0.16;
        const y = 50 * u + r * 18.5 * u;
        L.push(
          group(
            `sl-card-${r}`,
            [
              rect(`sl-card-${r}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: ch, radius: 2.6 * u, fill: p.surface, stroke: alpha(p.fg, 0.08), strokeWidth: 0.2 * u }),
              circle(`sl-card-${r}-n`, 3.6 * u, { x: 6.5 * u, y: ch / 2, fill: p.accent, scale: pop(t0 + 0.2, 0.5) }),
              icon(`sl-card-${r}-ck`, 'check', { x: 6.5 * u, y: ch / 2, size: 4 * u, color: p.onAccent, sw: 2.8, trimEnd: k([t0 + 0.35, 0], [t0 + 0.75, 1, 'outCubic']) }),
              x.body(`sl-card-${r}-t`, t, { size: 3.8 * u, x: 13.5 * u, y: ch / 2, w: cw - 18 * u, ax: 0, align: 'left', lineHeight: 1.3, weight: 600, fill: p.fg }),
            ],
            { x: k([t0, X + m + 12 * u], [t0 + 0.8, X + m, 'outExpo']), y, w: cw, h: ch, ax: 0, ay: 0, opacity: fadeIn(t0, 0.35) },
          ),
        );
      });
    }

    // ---------------------------------------------------------------- result
    {
      const i = 3;
      const X = slideX(x, i);
      const tw = (S - 2 * m - 4 * u) / 2;
      const th = 29 * u;
      L.push(
        statTitle(x, 'rs-big', x.c.res, { size: 25 * u, x: X + m - 0.5 * u, y: 22 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1, fill: p.accent, start: 0.2, dur: 1.5 }),
        x.title('rs-lab', x.c.resLabel, { size: 6.6 * u, x: X + m, y: 50 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.05, anim: ta.rise(0.45, { stagger: 0.05 }) }),
      );
      [
        [x.c.r2, x.c.r2l],
        [x.c.r3, x.c.r3l],
      ].forEach(([v, l], j) => {
        const t = 0.7 + j * 0.15;
        L.push(
          group(
            `rs-t-${j}`,
            [
              rect(`rs-t-${j}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: tw, h: th, radius: 3 * u, fill: p.surface, stroke: alpha(p.fg, 0.08), strokeWidth: 0.2 * u }),
              statTitle(x, `rs-t-${j}-v`, v, { size: 9 * u, x: 4 * u, y: 10 * u, ax: 0, align: 'left', lineHeight: 1, start: t + 0.2, dur: 1.2 }),
              x.body(`rs-t-${j}-l`, l, { size: 3.3 * u, x: 4 * u, y: 16.5 * u, w: tw - 8 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1.3, fill: p.muted }),
            ],
            { x: X + m + j * (tw + 4 * u), y: k([t, 76 * u], [t + 0.8, 70 * u, 'outExpo']), w: tw, h: th, ax: 0, ay: 0, opacity: fadeIn(t, 0.35) },
          ),
        );
      });
    }

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      L.push(
        x.title('ct-title', x.c.cta, { size: 9.4 * u, x: X + m, y: 56 * u, w: S - 2 * m, ax: 0, ay: 1, align: 'left', lineHeight: 1.02, anim: ta.riseLines(0.25, { stagger: 0.12 }) }),
        rect('ct-rule', { x: X + m, y: 61 * u, ax: 0, w: k([0.6, 0.01], [1.3, 14 * u, 'outExpo']), h: 1 * u, radius: 0.5 * u, fill: p.accent }),
        x.body('ct-sub', x.c.ctaSub, { size: 4.2 * u, x: X + m, y: 66 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.38, fill: p.muted, anim: fadeUp(0.7) }),
        chip(x, 'ct-btn', x.c.ctaBtn, {
          x: X + m,
          y: 86 * u,
          size: 3.4 * u,
          fill: p.accent,
          color: p.onAccent,
          icon: 'calendar',
          scale: k([1.0, 0.6], [1.5, 1, 'outBack']),
          opacity: fadeIn(1.0, 0.25),
        }),
      );
    }

    return { layers: L };
  },
};
