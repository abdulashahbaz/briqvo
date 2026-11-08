/** Category: charts — bar chart growth, donut progress, KPI stat grid. */
import type { Ease, Keyframe, Layer } from '../../../engine/types';
import { ease } from '../../../engine/easing';
import { type Recipe, k, rect, group, radial, alpha, lerpColor, ta, path } from '../../kit';
import { uiTheme, isDark, heading, icon, pill, glow, fit, textW, blockH, countTo, numList, strList, smooth, areaPath, chartPts, delta, series, balance } from './ui';

function niceCeil(v: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(1e-9, v))));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * p;
}

function fmt(v: number, decimals: number) {
  const s = v.toFixed(decimals);
  return s.replace(/\.0+$/, '');
}

// ------------------------------------------------------------------ Bar Chart Growth

const barGrowth: Recipe = {
  id: 'bar-growth',
  name: 'Bar Chart Growth',
  category: 'charts',
  tags: ['charts', 'bar chart', 'growth', 'revenue', 'data', 'report', 'investor', 'counter'],
  description: 'Bars grow one by one with counting labels, a clean axis and a highlighted final year.',
  duration: 5.4,
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Annual report' },
    { key: 'title', label: 'Title', default: 'Revenue keeps climbing', multiline: true },
    { key: 'sub', label: 'Subtitle', default: 'Annual recurring revenue, in millions' },
    { key: 'values', label: 'Values (comma separated)', default: '12, 18, 24, 31, 42, 58' },
    { key: 'labels', label: 'Labels (comma separated)', default: '2021, 2022, 2023, 2024, 2025, 2026' },
    { key: 'prefix', label: 'Value prefix', default: '$' },
    { key: 'suffix', label: 'Value suffix', default: 'M' },
    { key: 'stat', label: 'Highlight stat', default: '+38%' },
    { key: 'statLabel', label: 'Highlight label', default: 'growth vs last year' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'space', format: 'square' },
    { name: 'Royal', palette: 'royal', fonts: 'sora', format: 'landscape', copy: { eyebrow: 'Community', title: 'Members, year over year', sub: 'Active members, in thousands', values: '8, 14, 22, 35, 51, 74', suffix: 'k', prefix: '', stat: '+45%', statLabel: 'new members this year' } },
    { name: 'Paper', palette: 'paper', fonts: 'editorial', format: 'portrait', copy: { eyebrow: 'Impact report', title: 'Trees planted, every season', sub: 'Saplings in the ground, thousands', values: '4, 9, 15, 19, 28, 36', labels: 'Spr 24, Sum 24, Aut 24, Spr 25, Sum 25, Aut 25', prefix: '', suffix: 'k', stat: '36k', statLabel: 'trees this autumn' } },
    { name: 'Noir', palette: 'noir', fonts: 'mono', format: 'story', copy: { eyebrow: 'Build log', title: 'Weekly deploys', sub: 'Production releases per week', values: '6, 9, 8, 14, 19, 27', labels: 'W1, W2, W3, W4, W5, W6', prefix: '', suffix: '', stat: '4.5×', statLabel: 'faster than week one' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const vals = numList(c.values, [12, 18, 24, 31, 42, 58]).slice(0, 8);
    const labs = strList(c.labels, ['2021', '2022', '2023', '2024', '2025', '2026']);
    const n = vals.length;
    const m = x.pick({ landscape: 9 * u, default: 8 * u });
    const hd0 = { eyebrow: c.eyebrow, title: c.title, sub: c.sub, x: m, y: 0, align: 'left' as const, pill: false, maxLines: 2, subLines: 1, t0: 0.1 };
    const statSize = x.pick({ landscape: 11 * u, square: 9 * u, portrait: 10 * u, default: 13 * u });
    const statT = 0.55;
    const stat = x.title('bg-stat', c.stat, { size: statSize, x: 0, y: 0, ay: 0, fill: p.accent, counter: countTo(c.stat, statT + 0.2, 1.6), opacity: k([statT, 0], [statT + 0.3, 1]) });
    const statL = x.body('bg-stat-l', c.statLabel, { size: x.pick({ story: 3.4 * u, default: 2.7 * u }), x: 0, y: 0, ay: 0, fill: p.muted, weight: 500, anim: ta.blur(statT + 0.4, { stagger: 0.04 }) });
    const sideStat = x.isLandscape || x.isSquare;
    const statW = Math.max(textW(stat), textW(statL));
    const hw = sideStat ? W - m * 2 - statW - 6 * u : W - m * 2;
    const head = heading(x, { ...hd0, y: x.pick({ landscape: 9 * u, square: 8 * u, portrait: 9 * u, default: 16 * u }), w: hw, size: x.pick({ landscape: 7 * u, square: 6 * u, portrait: 7.4 * u, default: 9.4 * u }) });
    let chartTop: number;
    if (sideStat) {
      Object.assign(stat, { x: W - m, ax: 1, align: 'right', y: head.top - statSize * 0.08 });
      Object.assign(statL, { x: W - m, ax: 1, align: 'right', y: head.top + statSize * 1.02 });
      chartTop = Math.max(head.bottom, head.top + statSize * 1.1 + 4 * u) + x.pick({ landscape: 7 * u, default: 7 * u });
    } else {
      const sy = head.bottom + x.pick({ portrait: 5 * u, default: 8 * u });
      Object.assign(stat, { x: m, ax: 0, align: 'left', y: sy });
      Object.assign(statL, { x: m, ax: 0, align: 'left', y: sy + statSize * 1.04 });
      chartTop = sy + statSize * 1.04 + (statL.size as number) * 1.4 + x.pick({ portrait: 6 * u, default: 9 * u });
    }
    const base = H - x.pick({ landscape: 15 * u, square: 13 * u, portrait: 14 * u, default: 26 * u });
    const ch = base - chartTop;
    const yl = 7 * u;
    const cx0 = m + yl;
    const cw = W - m - cx0;
    const mx = niceCeil((Math.max(...vals) * 1.12) / 4) * 4;
    const gap = 0.42;
    const bw = cw / (n + (n - 1) * gap);
    const L: Layer[] = [];
    const dec = Math.max(...vals.map((v) => (String(v).split('.')[1] ?? '').length));
    // grid
    const gN = 4;
    for (let i = 0; i <= gN; i++) {
      const gy = base - (ch * i) / gN;
      const t = 0.3 + i * 0.06;
      L.push(
        rect(`bg-grid${i}`, { x: cx0, y: gy, ax: 0, w: k([t, 0], [t + 0.9, cw, 'outExpo']), h: i === 0 ? 0.3 * u : 0.14 * u, fill: alpha(p.fg, i === 0 ? 0.3 : 0.1) }),
        x.body(`bg-gl${i}`, `${c.prefix}${fmt((mx * i) / gN, dec)}${c.suffix}`, { size: 2.1 * u, x: cx0 - 1.8 * u, y: gy, ax: 1, align: 'right', fill: p.muted, opacity: k([t + 0.2, 0], [t + 0.6, 1]) }),
      );
    }
    const t0 = 0.8;
    const st = Math.min(0.14, 1.2 / n);
    vals.forEach((v, i) => {
      const bh = (v / mx) * ch;
      const bx = cx0 + i * bw * (1 + gap) + bw / 2;
      const t = t0 + i * st;
      const last = i === n - 1;
      const fill = last ? { kind: 'linear' as const, angle: 90, stops: [{ o: 0, c: lerpColor(p.accent, p.fg, 0.08) }, { o: 1, c: p.accent }] } : isDark(p) ? lerpColor(p.bg2, p.fg, 0.14) : lerpColor(p.accent, p.bg, 0.7);
      const hk = k([t, 0], [t + 1.0, bh, 'outExpo']);
      L.push(rect(`bg-bar${i}`, { x: bx, y: base, ay: 1, w: bw, h: hk, radius: Math.min(bw * 0.16, 1.4 * u), fill }));
      const vs = Math.min(x.pick({ story: 3.4 * u, default: 2.6 * u }), bw * 0.36);
      L.push(
        x.body(`bg-val${i}`, `${c.prefix}${v}${c.suffix}`, {
          size: vs,
          x: bx,
          y: k([t, base - 1.2 * u], [t + 1.0, base - bh - 1.4 * u, 'outExpo']),
          ay: 1,
          weight: 700,
          fill: last ? p.fg : p.muted,
          counter: { from: 0, to: v, start: t, dur: 1.0, ease: 'outExpo', prefix: c.prefix, suffix: c.suffix, decimals: dec },
          opacity: k([t + 0.1, 0], [t + 0.4, 1]),
        }),
        fit(x.body(`bg-lab${i}`, labs[i] ?? '', { size: x.pick({ story: 2.8 * u, default: 2.3 * u }), x: bx, y: base + 3.4 * u, fill: last ? p.fg : p.muted, weight: last ? 700 : 500, opacity: k([t, 0], [t + 0.4, 1]) }), bw * (1 + gap) * 0.95),
      );
    });
    const lastX = cx0 + (n - 1) * bw * (1 + gap) + bw / 2;
    const lastTop = base - (vals[n - 1] / mx) * ch;
    return {
      background: radial(0.85, 0.15, 1.0, p.bg2, p.bg),
      layers: [glow('bg-glow', { x: lastX, y: lastTop, r: ch * 0.7, color: p.accent, a: 0.16 }), ...head.layers, stat, statL, ...L],
    };
  },
};

// ------------------------------------------------------------------ Donut Progress

/** Global sweep: arcs of a donut drawn in sequence with one continuous easing. */
function sweepTrack(a: number, b: number, t0: number, dur: number, e: Ease): Keyframe<number>[] {
  const inv = (f: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (ease(e, mid) < f) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const ts = t0 + dur * inv(a);
  const te = t0 + dur * inv(b);
  const N = 6;
  const out: Keyframe<number>[] = [{ t: ts, v: a }];
  for (let i = 1; i <= N; i++) {
    const t = ts + ((te - ts) * i) / N;
    out.push({ t, v: Math.min(b, ease(e, (t - t0) / dur)), e: 'linear' });
  }
  out[out.length - 1].v = b;
  return out;
}

const donutProgress: Recipe = {
  id: 'donut-progress',
  name: 'Donut Breakdown',
  category: 'charts',
  tags: ['charts', 'donut', 'pie', 'ring', 'percentage', 'breakdown', 'legend', 'data'],
  description: 'A donut sweeps around in one motion, the lead share counts up in the centre and the legend fills in.',
  duration: 5,
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Audience' },
    { key: 'title', label: 'Title', default: 'Where people watch', multiline: true },
    { key: 'sub', label: 'Subtitle', default: 'Share of sessions, last 90 days' },
    { key: 'l1', label: 'Segment 1', default: 'Mobile' },
    { key: 'v1', label: 'Segment 1 %', default: '58' },
    { key: 'l2', label: 'Segment 2', default: 'Desktop' },
    { key: 'v2', label: 'Segment 2 %', default: '24' },
    { key: 'l3', label: 'Segment 3', default: 'Tablet' },
    { key: 'v3', label: 'Segment 3 %', default: '12' },
    { key: 'l4', label: 'Segment 4', default: 'TV' },
    { key: 'v4', label: 'Segment 4 %', default: '6' },
  ],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'manrope', format: 'square' },
    { name: 'Mint', palette: 'mint', fonts: 'grotesk', format: 'portrait', copy: { eyebrow: 'Budget', title: 'Where the money goes', sub: 'Monthly spend by category', l1: 'Housing', v1: '42', l2: 'Food', v2: '27', l3: 'Travel', v3: '19', l4: 'Other', v4: '12' } },
    { name: 'Cobalt', palette: 'cobalt', fonts: 'fraunces', format: 'landscape', copy: { eyebrow: 'Survey results', title: 'How teams work now', sub: '2,400 respondents, October 2026', l1: 'Hybrid', v1: '51', l2: 'Remote', v2: '31', l3: 'Office', v3: '14', l4: 'Other', v4: '4' } },
    { name: 'Cyber', palette: 'cyber', fonts: 'space', format: 'story', copy: { eyebrow: 'Storage', title: 'Disk usage', sub: '512 GB drive', l1: 'Video', v1: '46', l2: 'Apps', v2: '25', l3: 'Photos', v3: '18', l4: 'System', v4: '11' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const segs = [
      [c.l1, c.v1],
      [c.l2, c.v2],
      [c.l3, c.v3],
      [c.l4, c.v4],
    ]
      .map(([l, v]) => ({ l, v: Math.max(0, parseFloat(v) || 0) }))
      .filter((s) => s.l.trim() && s.v > 0);
    const total = segs.reduce((a, s) => a + s.v, 0) || 1;
    const cols = [p.accent, p.accent2, lerpColor(p.accent, p.bg, 0.55), alpha(p.fg, ui.dark ? 0.32 : 0.22)];
    const m = x.pick({ landscape: 9 * u, default: 8 * u });
    let D: number;
    let dx: number;
    let dy: number;
    const L: Layer[] = [];
    // legend geometry
    let legX: number;
    let legY: number;
    let legW: number;
    let legRow: number;
    let legCols = 1;
    if (x.isLandscape) {
      D = 66 * u;
      dx = 9 * u + D / 2 + 4 * u;
      dy = H / 2;
      legX = dx + D / 2 + 16 * u;
      legW = W - m - legX;
      const hd = heading(x, { eyebrow: c.eyebrow, title: c.title, sub: c.sub, x: legX, y: 0, w: legW, size: 7.4 * u, pill: false, maxLines: 2, subLines: 1, t0: 0.1 });
      legRow = 8.4 * u;
      const blockH = hd.h + 6 * u + legRow * segs.length;
      const top = H / 2 - blockH / 2;
      L.push(...heading(x, { eyebrow: c.eyebrow, title: c.title, sub: c.sub, x: legX, y: top, w: legW, size: 7.4 * u, pill: false, maxLines: 2, subLines: 1, t0: 0.1 }).layers);
      legY = top + hd.h + 6 * u;
    } else {
      const hs = x.pick({ square: 6.4 * u, portrait: 7.6 * u, default: 9.4 * u });
      const hd = heading(x, { eyebrow: c.eyebrow, title: c.title, sub: c.sub, x: W / 2, y: x.pick({ square: 8 * u, portrait: 9 * u, default: 16 * u }), w: 84 * u, size: hs, align: 'center', pill: false, maxLines: 2, subLines: 1, t0: 0.1 });
      L.push(...hd.layers);
      if (x.isSquare) {
        D = 46 * u;
        dx = m + D / 2;
        dy = hd.bottom + (H - hd.bottom) / 2;
        legX = dx + D / 2 + 7 * u;
        legW = W - m - legX;
        legRow = 8.4 * u;
        legY = dy - (legRow * segs.length) / 2;
      } else {
        D = x.pick({ portrait: 54 * u, default: 64 * u });
        legRow = x.pick({ portrait: 9 * u, default: 10 * u });
        legCols = x.isPortrait ? 2 : 1;
        const rows = Math.ceil(segs.length / legCols);
        const gapA = x.pick({ portrait: 7 * u, default: 10 * u });
        const avail = H - hd.bottom - x.pick({ portrait: 7 * u, default: 18 * u });
        D = Math.max(36 * u, Math.min(D, avail - gapA - rows * legRow - 6 * u));
        const blockH = D + gapA + rows * legRow;
        const top = hd.bottom + Math.max(5 * u, (avail - blockH) / 2);
        dx = W / 2;
        dy = top + D / 2;
        legX = m;
        legW = W - m * 2;
        legY = top + D + gapA;
      }
    }
    const sw = D * 0.13;
    const gapF = 0.007;
    const T0 = 0.6;
    const dur = 1.8;
    L.push({ type: 'ellipse', id: 'dn-track', x: dx, y: dy, w: D, h: D, stroke: alpha(p.fg, 0.07), strokeWidth: sw, opacity: k([0.3, 0], [0.7, 1]) });
    let acc = 0;
    segs.forEach((s, i) => {
      const a = acc / total;
      acc += s.v;
      const b = acc / total;
      const a0 = a + gapF / 2;
      const b0 = Math.max(a0 + 0.001, b - gapF / 2);
      L.push({
        type: 'ellipse',
        id: `dn-seg${i}`,
        x: dx,
        y: dy,
        w: D,
        h: D,
        stroke: cols[i % cols.length],
        strokeWidth: sw,
        lineCap: 'butt',
        arcStart: a0,
        arcEnd: sweepTrack(a0, b0, T0, dur, 'inOutCubic'),
        scale: i === 0 ? k([T0 + dur, 1], [T0 + dur + 0.2, 1.03, 'outCubic'], [T0 + dur + 0.6, 1, 'outBack']) : 1,
      });
    });
    const lead = segs[0] ?? { l: '', v: 0 };
    const pct = Math.round((lead.v / total) * 100);
    L.push(
      x.title('dn-pct', `${pct}%`, { size: D * 0.24, x: dx, y: dy - D * 0.03, counter: { from: 0, to: pct, start: T0, dur: dur * 0.55, ease: 'outCubic', suffix: '%' }, opacity: k([T0, 0], [T0 + 0.3, 1]) }),
      fit(x.body('dn-lead', lead.l, { size: D * 0.065, x: dx, y: dy + D * 0.14, weight: 600, fill: p.muted, uppercase: true, tracking: 0.1, opacity: k([T0 + 0.4, 0], [T0 + 0.8, 1]) }), D * 0.55),
    );
    // legend
    const rowsPerCol = Math.ceil(segs.length / legCols);
    const colW = (legW - (legCols - 1) * 6 * u) / legCols;
    const ls = Math.min(legRow * 0.36, x.pick({ story: 3.8 * u, default: 3 * u }));
    segs.forEach((s, i) => {
      const col = Math.floor(i / rowsPerCol);
      const row = i % rowsPerCol;
      const rx = legX + col * (colW + 6 * u);
      const ry = legY + row * legRow + legRow / 2;
      const t = T0 + 0.5 + i * 0.12;
      const v = Math.round((s.v / total) * 100);
      L.push(
        group(
          `dn-leg${i}`,
          [
            rect(`dn-leg${i}-sw`, { x: 0, y: legRow / 2, ax: 0, w: ls * 0.9, h: ls * 0.9, radius: ls * 0.25, fill: cols[i % cols.length] }),
            fit(x.body(`dn-leg${i}-l`, s.l, { size: ls, x: ls * 1.6, y: legRow / 2, ax: 0, align: 'left', weight: 600, fill: p.fg }), colW - ls * 4.6),
            x.body(`dn-leg${i}-v`, `${v}%`, { size: ls, x: colW, y: legRow / 2, ax: 1, align: 'right', weight: 700, fill: p.fg, counter: { from: 0, to: v, start: t, dur: 1, suffix: '%' } }),
            rect(`dn-leg${i}-ln`, { x: 0, y: legRow, ax: 0, ay: 1, w: k([t, 0], [t + 0.8, colW, 'outExpo']), h: 0.14 * u, fill: alpha(p.fg, 0.1) }),
          ],
          { x: k([t, rx + 3 * u], [t + 0.7, rx, 'outExpo']), y: ry, w: colW, h: legRow, ax: 0, ay: 0.5, opacity: k([t, 0], [t + 0.35, 1]) },
        ),
      );
    });
    return { background: radial(dx / W, dy / H, 0.8, p.bg2, p.bg), layers: [glow('dn-glow', { x: dx, y: dy, r: D * 0.85, color: p.accent, a: ui.dark ? 0.22 : 0.16 }), ...L] };
  },
};

// ------------------------------------------------------------------ KPI Stat Grid

const kpiGrid: Recipe = {
  id: 'kpi-grid',
  name: 'KPI Stat Grid',
  category: 'charts',
  tags: ['charts', 'kpi', 'metrics', 'dashboard', 'stats', 'sparkline', 'report', 'new'],
  description: 'Four metric tiles count up, sparklines draw across them and each change lands with an arrow.',
  duration: 5.6,
  fields: [
    { key: 'title', label: 'Title', default: 'Q3 at a glance', multiline: true },
    { key: 'range', label: 'Period', default: 'Jul – Sep 2026' },
    { key: 'l1', label: 'Tile 1 label', default: 'Revenue' },
    { key: 'v1', label: 'Tile 1 value', default: '$1.24M' },
    { key: 'd1', label: 'Tile 1 change', default: '+18.2%' },
    { key: 'l2', label: 'Tile 2 label', default: 'New customers' },
    { key: 'v2', label: 'Tile 2 value', default: '3,480' },
    { key: 'd2', label: 'Tile 2 change', default: '+12.5%' },
    { key: 'l3', label: 'Tile 3 label', default: 'Churn rate' },
    { key: 'v3', label: 'Tile 3 value', default: '2.1%' },
    { key: 'd3', label: 'Tile 3 change', default: '-0.6%' },
    { key: 'l4', label: 'Tile 4 label', default: 'NPS' },
    { key: 'v4', label: 'Tile 4 value', default: '62' },
    { key: 'd4', label: 'Tile 4 change', default: '+4 pts' },
  ],
  variants: [
    { name: 'Slate', palette: 'slate', fonts: 'grotesk', format: 'landscape' },
    { name: 'Graphite', palette: 'graphite', fonts: 'space', format: 'square', copy: { title: 'Launch week', range: 'Mon – Sun', l1: 'Signups', v1: '18,240', d1: '+64%', l2: 'Activation', v2: '41%', d2: '+9.3%', l3: 'Bounce rate', v3: '28%', d3: '-4.1%', l4: 'Paid plans', v4: '1,312', d4: '+22%' } },
    { name: 'Arctic', palette: 'arctic', fonts: 'manrope', format: 'portrait', copy: { title: 'Your month in numbers', range: 'October 2026', l1: 'Followers', v1: '24.8k', d1: '+3.2k', l2: 'Reach', v2: '1.9M', d2: '+41%', l3: 'Unfollows', v3: '312', d3: '-18%', l4: 'Saves', v4: '8,604', d4: '+27%' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'sora', format: 'story', copy: { title: 'Store health', range: 'Last 30 days', l1: 'Orders', v1: '9,412', d1: '+14%', l2: 'Avg. basket', v2: '$64.80', d2: '+$5.10', l3: 'Returns', v3: '3.4%', d3: '-1.2%', l4: 'Rating', v4: '4.8', d4: '+0.2' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const m = x.pick({ landscape: 9 * u, default: 7 * u });
    const tiles = [
      [c.l1, c.v1, c.d1, 'bolt'],
      [c.l2, c.v2, c.d2, 'user'],
      [c.l3, c.v3, c.d3, 'chat'],
      [c.l4, c.v4, c.d4, 'star'],
    ];
    const L: Layer[] = [];
    const titleSize = x.pick({ landscape: 7 * u, square: 6.4 * u, portrait: 7.6 * u, default: 9.4 * u });
    const ty = x.pick({ landscape: 10 * u, square: 8 * u, portrait: 9 * u, default: 15 * u });
    const range = pill(x, 'kp-range', c.range, { x: W - m, y: 0, ax: 1, size: x.pick({ story: 2.8 * u, default: 2.4 * u }), h: x.pick({ story: 6.4 * u, default: 5.6 * u }), fill: ui.chip, color: ui.accent, weight: 700, padX: 1.4, opacity: k([0.35, 0], [0.7, 1]), sx: k([0.35, 0.6], [0.9, 1, 'outExpo']) });
    const titleW = x.isLandscape ? W - m * 2 - range.pw - 6 * u : W - m * 2;
    const title = balance(fit(x.title('kp-title', c.title, { size: titleSize, x: m, y: ty, w: titleW, ax: 0, ay: 0, align: 'left', anim: ta.rise(0.15) }), titleW, 2), titleW);
    const tH = blockH(title, title.w as number);
    L.push(title);
    let gridTop: number;
    if (x.isLandscape) {
      range.y = ty + (title.size as number) * 0.52;
      gridTop = ty + tH + 8 * u;
    } else {
      Object.assign(range, { x: m, ax: 0, y: ty + tH + 3 * u + range.ph / 2 });
      gridTop = ty + tH + 3 * u + range.ph + x.pick({ square: 5 * u, portrait: 6 * u, default: 8 * u });
    }
    L.push(range);
    const colsN = x.isLandscape ? 4 : 2;
    const gap = x.pick({ landscape: 3 * u, story: 3.4 * u, default: 3 * u });
    const tw = (W - m * 2 - gap * (colsN - 1)) / colsN;
    const bottom = H - x.pick({ landscape: 10 * u, square: 7 * u, portrait: 8 * u, default: 16 * u });
    const rowsN = 4 / colsN;
    const th = (bottom - gridTop - gap * (rowsN - 1)) / rowsN;
    const tq = Math.min(tw / 32, th / 28);
    // Deltas sit in the top row unless a label would get squeezed; then they move under the value.
    const padQ = 3.2 * tq;
    const deltaBelow = tiles.some(([lab, , d]) => {
      const lw = textW(x.body('kp-probe', lab, { size: 2.6 * tq, weight: 600 }));
      const dw = textW(x.body('kp-probe2', d, { size: 2.2 * tq, weight: 700 })) + 2.2 * tq * 2.6;
      return lw > tw - padQ * 2 - 4.4 * tq - 1.4 * tq - dw - 2 * tq;
    });
    tiles.forEach(([lab, val, d, ic], i) => {
      const col = i % colsN;
      const row = Math.floor(i / colsN);
      const gx = m + col * (tw + gap);
      const gy = gridTop + row * (th + gap);
      const t = 0.5 + i * 0.12;
      const up = !d.trim().startsWith('-');
      const pad = 3.2 * tq;
      const dt = t + 1.5;
      const dl = delta(x, `kp-t${i}-d`, d.replace(/^[+-]/, ''), {
        x: deltaBelow ? pad : tw - pad,
        y: deltaBelow ? pad + 4 * tq + 11.2 * tq : pad + 2 * tq,
        ax: deltaBelow ? 0 : 1,
        size: 2.2 * tq,
        up,
        color: up ? ui.accent : ui.muted,
        fill: up ? ui.chip : ui.soft,
        opacity: k([dt, 0], [dt + 0.3, 1]),
        scale: k([dt, 0.6], [dt + 0.5, 1, 'outBack']),
      });
      const its = 4.4 * tq;
      const vs = fit(
        x.body(`kp-t${i}-v`, val, { size: 7.4 * tq, x: pad, y: pad + 4 * tq + 5.2 * tq, ax: 0, align: 'left', weight: 700, fill: ui.text, tracking: -0.02, counter: countTo(val, t + 0.3, 1.6) }),
        tw - pad * 2,
      );
      const vals = series(9, i * 7 + (x.seed % 5) + 3, up ? 1 : -0.6, 0.55);
      const top = pad + 4 * tq + (deltaBelow ? 17 : 11.6) * tq;
      const spH = Math.max(th * 0.28, th - top);
      const spts = chartPts(vals, tw, spH, 0.14);
      const sy0 = th - spH;
      L.push(
        group(
          `kp-t${i}`,
          [
            rect(`kp-t${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: tw, h: th, radius: 3 * tq, fill: ui.card, stroke: ui.border, strokeWidth: 0.15 * u }),
            icon(`kp-t${i}-ic`, ic, { x: pad + its / 2, y: pad + 2 * tq, size: its, color: ui.accent, weight: 2, draw: [t + 0.2, 0.6] }),
            fit(x.body(`kp-t${i}-l`, lab, { size: 2.6 * tq, x: pad + its + 1.4 * tq, y: pad + 2 * tq, ax: 0, align: 'left', weight: 600, fill: ui.muted }), tw - pad * 2 - its - 1.4 * tq - (deltaBelow ? 0 : dl.pw + 2 * tq)),
            dl,
            vs,
            group(
              `kp-t${i}-ag`,
              [
                path(`kp-t${i}-area`, areaPath(spts, spH), tw, spH, {
                  x: 0,
                  y: 0,
                  w: tw,
                  h: spH,
                  ax: 0,
                  ay: 0,
                  fill: { kind: 'linear', angle: 90, stops: [{ o: 0, c: alpha(up ? ui.accent : ui.muted, 0.22) }, { o: 1, c: alpha(up ? ui.accent : ui.muted, 0) }] },
                }),
              ],
              { x: 0, y: sy0, w: tw, h: spH, ax: 0, ay: 0, mask: { shape: 'rect', x: 0, y: -1 * u, w: k([t + 0.5, 0], [t + 1.8, tw, 'inOutCubic']), h: spH + 2 * u } },
            ),
            path(`kp-t${i}-line`, smooth(spts), tw, spH, { x: 0, y: sy0, w: tw, h: spH, ax: 0, ay: 0, stroke: up ? ui.accent : ui.muted, strokeWidth: 0.42 * u, trimEnd: k([t + 0.5, 0], [t + 1.8, 1, 'inOutCubic']) }),
          ],
          { x: gx, y: k([t, gy + 5 * u], [t + 0.9, gy, 'outExpo']), w: tw, h: th, ax: 0, ay: 0, opacity: k([t, 0], [t + 0.4, 1]), clip: true, clipRadius: 3 * tq },
        ),
      );
    });
    return { background: radial(0.2, 0.1, 1.1, p.bg2, p.bg), layers: [glow('kp-glow', { x: W * 0.75, y: gridTop, r: W * 0.4, color: p.accent, a: ui.dark ? 0.16 : 0.12 }), ...L] };
  },
};

export const recipes: Recipe[] = [barGrowth, donutProgress, kpiGrid];
