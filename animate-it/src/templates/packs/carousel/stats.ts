import type { Layer } from '../../../engine/types';
import { type Recipe, rect, circle, ellipse, group, path, k, fadeIn, pop, ta, alpha, linear } from '../../kit';
import { chip, fadeUp, icon, list, pad2, parseStat, seamLine, slideX, statTitle, swipeCue, tsz } from './shared';

/** Data story: ring, bars and stat tiles, all sitting on one growth line that runs under every slide. */
export const numbersStory: Recipe = {
  id: 'carousel-numbers-story',
  name: 'Numbers Story',
  category: 'carousel',
  tags: ['carousel', 'stats', 'data', 'report', 'charts', 'counters', 'seamless'],
  description: 'A data report in five slides: counting ring, growing bars and stat tiles on one trend line that runs across them all.',
  duration: 5.5,
  slides: 5,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Distributed Co.' },
    { key: 'handle', label: 'Handle', default: '@distributed.co' },
    { key: 'kicker', label: 'Cover kicker', default: 'Report 2026' },
    { key: 'title', label: 'Cover title', default: 'Remote work, by the numbers', multiline: true },
    { key: 'sub', label: 'Cover line', default: 'What 1,200 distributed teams told us this year.', multiline: true },
    { key: 'ring', label: 'Ring stat', default: '73%' },
    { key: 'ringLabel', label: 'Ring label', default: 'of teams now work async-first', multiline: true },
    { key: 'barsTitle', label: 'Bar chart title', default: 'Hours saved per person, per week', multiline: true },
    { key: 'bars', label: 'Bar values (comma separated)', default: '3.1, 4.4, 5.2, 6.8, 8.5' },
    { key: 'barLabels', label: 'Bar labels (comma separated)', default: '2022, 2023, 2024, 2025, 2026' },
    { key: 's1', label: 'Stat A', default: '2.4×' },
    { key: 's1l', label: 'Stat A label', default: 'faster hiring for fully remote roles', multiline: true },
    { key: 's2', label: 'Stat B', default: '−31%' },
    { key: 's2l', label: 'Stat B label', default: 'office costs after going hybrid', multiline: true },
    { key: 'insight', label: 'Insight', default: 'Teams that write things down hire faster and spend less.', multiline: true },
    { key: 'trend', label: 'Trend tag', default: '+174% since 2022' },
    { key: 'cta', label: 'Final slide title', default: 'Get the full 40-page report', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'Free download, link in bio. Share it with your team.', multiline: true },
    { key: 'source', label: 'Source note', default: 'Source: Distributed Co. survey, n = 1,200, Jan 2026' },
  ],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'space' },
    {
      name: 'Azure Creators',
      palette: 'azure',
      fonts: 'sora',
      copy: {
        brand: 'Creator Pulse',
        handle: '@creatorpulse',
        kicker: 'State of creators',
        title: 'The creator economy in 2026',
        sub: 'We surveyed 3,400 full-time creators. Here is what changed.',
        ring: '62%',
        ringLabel: 'now earn from more than three platforms',
        barsTitle: 'Median monthly income, in $k',
        bars: '1.2, 1.9, 2.6, 3.4, 4.1',
        s1: '3.2×',
        s1l: 'more revenue from newsletters than ads',
        s2: '−18%',
        s2l: 'organic reach on short video this year',
        insight: 'Own your audience. Rented reach is getting more expensive.',
        trend: '+242% since 2022',
        cta: 'Download the full creator report',
        ctaSub: 'Free, no email needed. Link in bio.',
        source: 'Source: Creator Pulse survey, n = 3,400, 2026',
      },
    },
    {
      name: 'Sand Coffee',
      palette: 'sand',
      fonts: 'editorial',
      copy: {
        brand: 'Roast & Ledger',
        handle: '@roastandledger',
        kicker: 'Café industry report',
        title: 'What coffee shops learned this year',
        sub: 'Data from 640 independent cafés across 12 cities.',
        ring: '58%',
        ringLabel: 'of orders are now placed ahead on mobile',
        barsTitle: 'Average spend per visit, in dollars',
        bars: '4.2, 4.6, 5.1, 5.5, 6.2',
        s1: '1.8×',
        s1l: 'more monthly visits from loyalty members',
        s2: '−22%',
        s2l: 'average queue time with order-ahead',
        insight: 'Regulars are the business. Make coming back effortless.',
        trend: '+48% since 2022',
        cta: 'Read the full café report',
        ctaSub: 'Free for independent owners. Link in bio.',
        source: 'Source: Roast & Ledger café panel, n = 640, 2026',
      },
    },
    {
      name: 'Cyber Gaming',
      palette: 'cyber',
      fonts: 'unbounded',
      copy: {
        brand: 'Level Data',
        handle: '@leveldata.gg',
        kicker: 'Player report',
        title: 'How the world plays now',
        sub: 'Insights from 9,000 players in 30 countries.',
        ring: '81%',
        ringLabel: 'play on more than one device every week',
        barsTitle: 'Hours played per week',
        bars: '6.4, 7.1, 7.9, 8.3, 9.2',
        s1: '2.7×',
        s1l: 'longer sessions in co-op games',
        s2: '+46%',
        s2l: 'growth in cloud play year on year',
        insight: 'Play is social now. Build for friends, not just players.',
        trend: '+44% since 2022',
        cta: 'Get the full player report',
        ctaSub: 'Free PDF, link in bio. Tag your squad.',
        source: 'Source: Level Data player panel, n = 9,000, 2026',
      },
    },
  ],
  build(x) {
    const { u, W, H, p, slideW: S, slides: N } = x;
    const dur = 5.5;
    const m = 9 * u;
    const L: Layer[] = [];
    const endX = W - m;
    const trend = (gx: number) => {
      const f = Math.min(1, gx / endX);
      return 114 * u - 20 * u * Math.pow(f, 1.35) + 1.7 * u * Math.sin((gx / S) * Math.PI * 1.8 + 0.6) + 0.8 * u * Math.sin((gx / S) * Math.PI * 5.2);
    };
    const bandTop = 88 * u;
    // area under the trend, one layer for the whole panorama (box = bottom band only)
    let ad = '';
    const steps = 160;
    for (let j = 0; j <= steps; j++) {
      const gx = (endX * j) / steps;
      ad += `${j ? 'L' : 'M'}${gx.toFixed(1)} ${(trend(gx) - bandTop).toFixed(1)} `;
    }
    ad += `L${endX.toFixed(1)} ${(H - bandTop + 2).toFixed(1)} L0 ${(H - bandTop + 2).toFixed(1)} Z`;
    L.push(
      path('tr-area', ad, W, H - bandTop, {
        x: 0,
        y: bandTop,
        w: W,
        h: H - bandTop,
        ax: 0,
        ay: 0,
        fill: linear(90, alpha(p.accent, 0.22), alpha(p.accent, 0.0)),
        opacity: fadeIn(0.4, 1.2),
      }),
      ...seamLine(x, 'tr-line', trend, { to: endX, stroke: p.accent, width: 0.7 * u, t0: 0.15, dur: 1.5 }),
    );
    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      const px = X + S * 0.5;
      if (px < endX)
        L.push(circle(`tr-pt-${i}`, 1.3 * u, { x: px, y: trend(px), fill: p.bg, stroke: p.accent, strokeWidth: 0.5 * u, scale: pop(0.75, 0.5) }));
      L.push(
        x.body(`hd-b-${i}`, x.c.brand, { size: 2.7 * u, x: X + m, y: 9 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, uppercase: true, tracking: 0.12, opacity: fadeIn(0.05, 0.5) }),
        x.body(`hd-c-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, { size: 2.7 * u, x: X + S - m, y: 9 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.08, opacity: fadeIn(0.1, 0.5) }),
        rect(`hd-rule-${i}`, { x: X + m, y: 13 * u, ax: 0, w: k([0, 0.01], [0.9, S - 2 * m, 'outExpo']), h: 0.18 * u, fill: alpha(p.fg, 0.12) }),
      );
    }

    const label = (id: string, i: number, s: string) =>
      x.body(id, s, { size: 2.8 * u, x: slideX(x, i) + m, y: 20 * u, ax: 0, align: 'left', weight: 700, fill: p.accent, uppercase: true, tracking: 0.14, anim: ta.slide(0.15, { stagger: 0.04 }) });

    // ---------------------------------------------------------------- cover
    L.push(
      chip(x, 'cv-kicker', x.c.kicker, {
        x: m,
        y: 22 * u,
        size: 2.9 * u,
        fill: alpha(p.accent, 0.14),
        color: p.accent,
        upper: true,
        tracking: 0.1,
        icon: 'chart',
        scale: k([0.1, 0.7], [0.7, 1, 'outBack']),
        opacity: fadeIn(0.1, 0.3),
      }),
      x.title('cv-title', x.c.title, {
        size: tsz(x, 12.5 * u),
        x: m,
        y: 29 * u,
        w: S - 2 * m,
        ax: 0,
        ay: 0,
        align: 'left',
        lineHeight: 0.98,
        anim: ta.riseLines(0.25, { stagger: 0.12 }),
      }),
      x.body('cv-sub', x.c.sub, { size: 4.2 * u, x: m, y: 74 * u, w: S - 2 * m - 10 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1.4, fill: p.muted, anim: fadeUp(0.7) }),
      swipeCue(x, 'cv-swipe', { x: m, y: 95 * u, ax: 0, bg: p.accent, fg: p.onAccent, t0: 1.0, dur }),
    );

    // ---------------------------------------------------------------- ring
    {
      const i = 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      const cy = 50 * u;
      const R = 23 * u;
      const st = parseStat(x.c.ring);
      const frac = st ? Math.max(0.02, Math.min(1, st.value / 100)) : 0.75;
      L.push(
        label('rg-l', i, 'Finding 01'),
        ellipse('rg-track', { x: cx, y: cy, w: R * 2, h: R * 2, stroke: alpha(p.fg, 0.09), strokeWidth: 3.6 * u, opacity: fadeIn(0.1, 0.4) }),
        ellipse('rg-arc', {
          x: cx,
          y: cy,
          w: R * 2,
          h: R * 2,
          stroke: p.accent,
          strokeWidth: 3.6 * u,
          lineCap: 'round',
          arcStart: 0,
          arcEnd: k([0.25, 0], [1.8, frac, 'outCubic']),
        }),
        circle('rg-inner', R - 5 * u, { x: cx, y: cy, fill: alpha(p.accent, 0.08), scale: pop(0.2, 0.8, 'outBack') }),
        statTitle(x, 'rg-num', x.c.ring, { size: tsz(x, 14 * u), x: cx, y: cy, lineHeight: 1, start: 0.25, dur: 1.55 }),
        x.title('rg-lab', x.c.ringLabel, { size: tsz(x, 6.4 * u), x: cx, y: 81 * u, w: S - 2 * m - 6 * u, ay: 0, lineHeight: 1.06, anim: ta.rise(0.6, { stagger: 0.05 }) }),
      );
    }

    // ---------------------------------------------------------------- bars
    {
      const i = 2;
      const X = slideX(x, i);
      const vals = list(x.c.bars).map((v) => parseFloat(v.replace(/[^\d.-]/g, '')) || 0);
      const labs = list(x.c.barLabels);
      const n = Math.max(1, vals.length);
      const max = Math.max(...vals, 0.0001);
      const gap = 4.5 * u;
      const bw = (S - 2 * m - gap * (n - 1)) / n;
      const base = 89 * u;
      const maxH = 38 * u;
      const dec = Math.max(0, ...list(x.c.bars).map((v) => (v.includes('.') ? v.split('.')[1].replace(/\D/g, '').length : 0)));
      L.push(
        label('br-l', i, 'Finding 02'),
        x.title('br-title', x.c.barsTitle, { size: tsz(x, 7 * u), x: X + m, y: 25 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.04, anim: ta.rise(0.2, { stagger: 0.05 }) }),
        rect('br-base', { x: X + m, y: base, ax: 0, w: k([0.2, 0.01], [1.0, S - 2 * m, 'outExpo']), h: 0.25 * u, fill: alpha(p.fg, 0.25) }),
      );
      vals.forEach((v, j) => {
        const bx = X + m + j * (bw + gap) + bw / 2;
        const bh = Math.max(1 * u, (v / max) * maxH);
        const t = 0.4 + j * 0.1;
        const last = j === n - 1;
        L.push(
          rect(`br-bar-${j}`, {
            x: bx,
            y: base,
            ay: 1,
            w: bw,
            h: k([t, 0.01], [t + 1.0, bh, 'outExpo']),
            radius: 1.6 * u,
            fill: last ? p.accent : alpha(p.accent, 0.32),
          }),
          x.body(`br-val-${j}`, String(v), {
            size: 3.4 * u,
            x: bx,
            y: k([t, base - 3.2 * u], [t + 1.0, base - bh - 3.2 * u, 'outExpo']),
            weight: 700,
            fill: last ? p.accent : p.fg,
            counter: { from: 0, to: v, start: t, dur: 1.0, ease: 'outExpo', decimals: dec, separator: false },
            opacity: fadeIn(t, 0.3),
          }),
          x.body(`br-lab-${j}`, labs[j] ?? '', { size: 2.8 * u, x: bx, y: base + 3.6 * u, weight: 600, fill: p.muted, opacity: fadeIn(t + 0.2, 0.4) }),
        );
      });
    }

    // ---------------------------------------------------------------- tiles
    {
      const i = 3;
      const X = slideX(x, i);
      const tw = (S - 2 * m - 4 * u) / 2;
      const th = 44 * u;
      const tiles: [string, string, string][] = [
        [x.c.s1, x.c.s1l, 'arrowUpRight'],
        [x.c.s2, x.c.s2l, x.c.s2.trim().startsWith('+') ? 'arrowUpRight' : 'arrowDown'],
      ];
      L.push(label('tl-l', i, 'Finding 03'));
      tiles.forEach(([v, l, ic], j) => {
        const t = 0.2 + j * 0.15;
        L.push(
          group(
            `tl-${j}`,
            [
              rect(`tl-${j}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: tw, h: th, radius: 3 * u, fill: p.surface, stroke: alpha(p.fg, 0.08), strokeWidth: 0.2 * u }),
              circle(`tl-${j}-ic-bg`, 3.4 * u, { x: 7.4 * u, y: 8 * u, fill: alpha(p.accent, 0.16), scale: pop(t + 0.3, 0.5) }),
              icon(`tl-${j}-ic`, ic, { x: 7.4 * u, y: 8 * u, size: 3.8 * u, color: p.accent, sw: 2.4, scale: pop(t + 0.35, 0.5) }),
              statTitle(x, `tl-${j}-v`, v, { size: tsz(x, 11 * u), x: 4 * u, y: 21.5 * u, ax: 0, align: 'left', lineHeight: 1, start: t + 0.2, dur: 1.3 }),
              x.body(`tl-${j}-l`, l, { size: 3.4 * u, x: 4 * u, y: 29 * u, w: tw - 8 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1.32, fill: p.muted, anim: fadeUp(t + 0.45, { stagger: 0.02 }) }),
            ],
            { x: X + m + j * (tw + 4 * u), y: k([t, 32 * u], [t + 0.9, 24 * u, 'outExpo']), w: tw, h: th, ax: 0, ay: 0, opacity: fadeIn(t, 0.4) },
          ),
        );
      });
      L.push(
        x.title('tl-insight', x.c.insight, { size: tsz(x, 6.2 * u), x: X + m, y: 75 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.08, anim: ta.rise(0.7, { stagger: 0.04 }) }),
      );
    }

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const ey = trend(endX);
      L.push(
        circle('ct-badge', 7 * u, { x: X + m + 7 * u, y: 27 * u, fill: p.accent, scale: pop(0.15, 0.7, 'spring') }),
        icon('ct-ic', 'layers', { x: X + m + 7 * u, y: 27 * u, size: 7 * u, color: p.onAccent, sw: 2, trimEnd: k([0.4, 0], [1.1, 1, 'inOutCubic']) }),
        x.title('ct-title', x.c.cta, { size: tsz(x, 9 * u), x: X + m, y: 38 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.03, anim: ta.rise(0.35, { stagger: 0.06 }) }),
        x.body('ct-sub', x.c.ctaSub, { size: 4 * u, x: X + m, y: 61 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.4, fill: p.muted, anim: fadeUp(0.7) }),
        chip(x, 'ct-follow', `Follow ${x.c.handle}`, {
          x: X + m,
          y: 79 * u,
          size: 3.2 * u,
          fill: p.fg,
          color: p.bg,
          icon: 'plus',
          scale: k([0.9, 0.6], [1.5, 1, 'outBack']),
          opacity: fadeIn(0.9, 0.25),
        }),
        circle('ct-end-ring', 2.6 * u, {
          x: endX,
          y: ey,
          stroke: p.accent,
          strokeWidth: 0.4 * u,
          scale: k([1.6, 1], [2.6, 2.6, 'outCubic'], [2.61, 1], [3.6, 2.6, 'outCubic'], [3.61, 1], [4.6, 2.6, 'outCubic']),
          opacity: k([1.59, 0], [1.6, 0.9], [2.6, 0, 'outCubic'], [2.61, 0.9], [3.6, 0, 'outCubic'], [3.61, 0.9], [4.6, 0, 'outCubic']),
        }),
        circle('ct-end', 1.9 * u, { x: endX, y: ey, fill: p.accent, stroke: p.bg, strokeWidth: 0.6 * u, scale: pop(1.55, 0.5) }),
        chip(x, 'ct-trend', x.c.trend, {
          x: endX,
          y: ey - 8 * u,
          ax: 1,
          size: 2.8 * u,
          fill: p.accent,
          color: p.onAccent,
          icon: 'arrowUpRight',
          scale: k([1.7, 0.6], [2.2, 1, 'outBack']),
          opacity: fadeIn(1.7, 0.25),
        }),
        x.body('ct-source', x.c.source, { size: 2.4 * u, x: X + m, y: 117 * u, w: S - 2 * m, ax: 0, align: 'left', weight: 500, fill: p.muted, opacity: fadeIn(1.2, 0.6) }),
      );
    }

    return { layers: L };
  },
};
