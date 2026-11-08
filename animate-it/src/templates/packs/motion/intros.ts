/** Motion pack — intros & title cards. */
import type { Layer } from '../../../engine/types';
import {
  type Recipe,
  k,
  rect,
  circle,
  ellipse,
  group,
  path,
  linear,
  radial,
  ta,
  tween,
  fadeIn,
  pop,
  alpha,
  shade,
  lerpColor,
  starPath,
  polygonPath,
  ICONS,
} from '../../kit';
import { fitTitle, fitBody, osc, darker, lighter, rr } from './shared';

// ------------------------------------------------------------------ Channel Burst

const channelBurst: Recipe = {
  id: 'channel-burst',
  name: 'Channel Burst',
  category: 'intros',
  tags: ['intro', 'youtube', 'channel', 'creator', 'shapes', 'playful', 'logo'],
  description: 'A colour pulse bursts into confetti shapes, your badge springs in and the channel name pops letter by letter.',
  duration: 4.5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Channel name', default: 'Pixel Pantry' },
    { key: 'sub', label: 'Subtitle', default: 'New recipes every Friday' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'poppins', format: 'landscape', logo: 'arc' },
    { name: 'Lilac', palette: 'lilac', fonts: 'outfit', format: 'landscape', logo: 'petal', copy: { brand: 'Studio Hours', sub: 'Design tips · twice a week' } },
    { name: 'Citrus', palette: 'citrus', fonts: 'archivo', format: 'square', logo: 'stack', copy: { brand: 'Gear Garage', sub: 'Honest tech reviews' } },
    { name: 'Cyber', palette: 'cyber', fonts: 'unbounded', format: 'story', logo: 'orbit', copy: { brand: 'Late Night Lab', sub: 'Live coding every Tuesday' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const L = x.isLandscape;
    const badgeR = x.pick({ landscape: 9 * u, story: 11 * u, default: 9.5 * u });
    const tFit = fitTitle(x, x.c.brand, {
      maxW: x.pick({ landscape: W * 0.62, default: W - 16 * u }),
      maxLines: L ? 1 : 2,
      max: x.pick({ landscape: 13 * u, story: 14 * u, default: 12 * u }),
      lineHeight: 1.0,
      balance: true,
    });
    const sFit = fitBody(x, x.c.sub, { maxW: W - 30 * u, max: x.pick({ story: 3.6 * u, default: 3.1 * u }), weight: 600, maxLines: 1 });
    const pillH = sFit.px * 2.3;
    const pillW = sFit.w + sFit.px * 2.6;
    const g1 = 5 * u;
    const g2 = 4.5 * u;
    const total = badgeR * 2 + g1 + tFit.h + g2 + pillH;
    const top = cy - total / 2;
    const by = top + badgeR;
    const ty = top + badgeR * 2 + g1;
    const py = ty + tFit.h + g2 + pillH / 2;

    const diag = Math.hypot(W, H);
    const layers: Layer[] = [
      circle('wipe-a', k([0, 0], [0.5, diag * 0.6, [0.6, 0, 0.3, 1]]), { x: cx, y: by, fill: p.accent }),
      circle('wipe-b', k([0.14, 0], [0.7, diag * 0.6, [0.6, 0, 0.3, 1]]), { x: cx, y: by, fill: p.bg }),
      circle('glow', badgeR * 4.5, {
        x: cx,
        y: by,
        fill: radial(0.5, 0.5, 0.7, alpha(p.accent2, 0.35), alpha(p.accent2, 0)),
        scale: k([0.5, 0.3], [1.6, 1, 'outExpo']),
        opacity: fadeIn(0.5, 0.6),
      }),
    ];
    // Shockwaves
    [0, 1].forEach((i) => {
      const t0 = 0.55 + i * 0.14;
      layers.push(
        ellipse(`wave-${i}`, {
          x: cx,
          y: by,
          w: k([t0, badgeR * 2], [t0 + 1.0, badgeR * 2 + 44 * u, 'outCubic']),
          h: k([t0, badgeR * 2], [t0 + 1.0, badgeR * 2 + 44 * u, 'outCubic']),
          stroke: i ? p.accent2 : p.accent,
          strokeWidth: k([t0, 1.2 * u], [t0 + 1.0, 0.1 * u, 'outCubic']),
          opacity: k([t0, 0], [t0 + 0.05, 1], [t0 + 1.0, 0, 'inQuad']),
          start: t0,
        }),
      );
    });

    // Confetti shapes: scattered around the content, never on top of it.
    const r = x.rand;
    const ex = {
      l: cx - Math.max(tFit.w, pillW, badgeR * 2) / 2 - 5 * u,
      r: cx + Math.max(tFit.w, pillW, badgeR * 2) / 2 + 5 * u,
      t: top - 5 * u,
      b: py + pillH / 2 + 5 * u,
    };
    const m = 6 * u;
    const pts: [number, number][] = [];
    const want = x.pick({ landscape: 18, story: 18, default: 15 });
    const minD = x.pick({ landscape: 17 * u, story: 16 * u, default: 14 * u });
    for (let tries = 0; tries < 900 && pts.length < want; tries++) {
      const px = rr(r, m, W - m);
      const py2 = rr(r, m, H - m);
      if (px > ex.l && px < ex.r && py2 > ex.t && py2 < ex.b) continue;
      if (pts.some(([a, b]) => Math.hypot(a - px, b - py2) < minD * (tries > 600 ? 0.7 : 1))) continue;
      pts.push([px, py2]);
    }
    const cols = [p.accent, p.accent2, p.fg, p.accent, p.accent2];
    const kinds = ['dot', 'ring', 'tri', 'square', 'spark', 'squiggle', 'plus', 'half'];
    pts.forEach(([fx, fy], i) => {
      const kind = kinds[i % kinds.length];
      const col = cols[i % cols.length];
      const s = rr(r, 2.4, 4.2) * u;
      const t0 = 0.5 + i * 0.018;
      const dir = i % 2 ? 1 : -1;
      const rot0 = rr(r, -30, 30);
      const bobA = rr(r, 0.6, 1.3) * u;
      const period = rr(r, 1.8, 2.6);
      const common = {
        x: k([t0, cx], [t0 + 1.25, fx, [0.16, 1, 0.3, 1]]),
        y: [
          { t: t0, v: by },
          { t: t0 + 1.25, v: fy - bobA, e: [0.16, 1, 0.3, 1] as [number, number, number, number] },
          ...osc(fy, bobA, period, { t0: t0 + 1.25, t1: 9, q: 3 }).slice(1),
        ],
        scale: k([t0, 0], [t0 + 0.4, 1.2, 'outCubic'], [t0 + 1.0, 1, 'inOutSine']),
        rotation: k([t0, rot0 - 200 * dir], [t0 + 1.3, rot0, 'outCubic'], [t0 + 6, rot0 + 40 * dir, 'linear']),
        start: t0,
      };
      let L2: Layer;
      switch (kind) {
        case 'dot':
          L2 = circle(`shape-${i}`, s * 0.5, { ...common, fill: col });
          break;
        case 'ring':
          L2 = ellipse(`shape-${i}`, { ...common, w: s * 1.1, h: s * 1.1, stroke: col, strokeWidth: s * 0.22 });
          break;
        case 'tri':
          L2 = path(`shape-${i}`, polygonPath(3), 100, 100, { ...common, w: s * 1.2, h: s * 1.2, fill: col });
          break;
        case 'square':
          L2 = rect(`shape-${i}`, { ...common, w: s * 0.9, h: s * 0.9, radius: s * 0.18, fill: col });
          break;
        case 'spark':
          L2 = path(`shape-${i}`, starPath(4, 0.32), 100, 100, { ...common, w: s * 1.4, h: s * 1.4, fill: col });
          break;
        case 'squiggle':
          L2 = path(`shape-${i}`, 'M2 12 Q7 2 12 12 T22 12 T32 12 T42 12', 44, 24, { ...common, w: s * 2.2, h: s * 1.2, stroke: col, strokeWidth: 4.2 });
          break;
        case 'plus':
          L2 = path(`shape-${i}`, ICONS.plus, 24, 24, { ...common, w: s * 1.2, h: s * 1.2, stroke: col, strokeWidth: 4 });
          break;
        default:
          L2 = ellipse(`shape-${i}`, { ...common, w: s * 1.2, h: s * 1.2, fill: col, arcStart: 0.25, arcEnd: 0.75 });
      }
      layers.push(L2);
    });

    layers.push(
      group(
        'badge',
        [
          circle('badge-bg', badgeR, { x: badgeR, y: badgeR, fill: linear(135, shade(p.accent, 0.12), shade(p.accent, -0.12)) }),
          x.logo('logo', { size: badgeR * 1.05, x: badgeR, y: badgeR, color: p.onAccent, rotation: k([0.7, -90], [1.5, 0, 'outBack']) }),
        ],
        {
          x: cx,
          y: by,
          w: badgeR * 2,
          h: badgeR * 2,
          scale: k([0.45, 0], [1.25, 1, 'spring']),
          shadow: { color: alpha(shade(p.accent, -0.5), 0.35), blur: 4 * u, y: 1.5 * u },
        },
      ),
      x.title('title', x.c.brand, {
        size: tFit.size,
        y: ty,
        ay: 0,
        w: tFit.wrapW,
        lineHeight: 1.0,
        anim: ta.pop(0.85, { stagger: 0.032, dur: 0.6 }),
      }),
      group(
        'pill',
        [
          rect('pill-bg', { x: pillW / 2, y: pillH / 2, w: pillW, h: pillH, radius: pillH / 2, fill: alpha(p.fg, 0.08), stroke: alpha(p.fg, 0.16), strokeWidth: 0.15 * u }),
          x.body('pill-text', x.c.sub, { size: sFit.size, weight: 600, x: pillW / 2, y: pillH / 2, fill: p.fg }),
        ],
        { x: cx, y: py, w: pillW, h: pillH, scale: k([1.4, 0.6], [2.0, 1, 'outBack']), opacity: fadeIn(1.4, 0.3) },
      ),
    );
    return { layers };
  },
};

// ------------------------------------------------------------------ Keynote Title

const keynoteTitle: Recipe = {
  id: 'keynote-title',
  name: 'Keynote Title',
  category: 'intros',
  tags: ['intro', 'presentation', 'title slide', 'keynote', 'grid', 'swiss', 'business'],
  description: 'Swiss-grid title slide: hairlines draw on, a Bauhaus mark assembles and the talk title rises with speaker and date.',
  duration: 5,
  fields: [
    { key: 'eyebrow', label: 'Event', default: 'Annual Design Summit' },
    { key: 'title', label: 'Talk title', default: 'Designing for the next decade', multiline: true },
    { key: 'speaker', label: 'Speaker', default: 'Maya Lindqvist' },
    { key: 'role', label: 'Role', default: 'Head of Product, Fieldnote' },
    { key: 'date', label: 'Date & place', default: '12 March 2027 · Copenhagen' },
  ],
  variants: [
    { name: 'Cobalt', palette: 'cobalt', fonts: 'grotesk', format: 'landscape' },
    {
      name: 'Graphite',
      palette: 'graphite',
      fonts: 'manrope',
      format: 'landscape',
      copy: { eyebrow: 'Q3 Business Review', title: 'Growth, retention and what comes next', speaker: 'Daniel Okafor', role: 'VP Strategy', date: 'October 2027 · Internal' },
    },
    {
      name: 'Paper',
      palette: 'paper',
      fonts: 'fraunces',
      format: 'portrait',
      copy: { eyebrow: 'Guest Lecture', title: 'The quiet power of good typography', speaker: 'Inès Moreau', role: 'Type designer', date: '4 May 2027' },
    },
    {
      name: 'Arctic',
      palette: 'arctic',
      fonts: 'sora',
      format: 'square',
      copy: { eyebrow: 'Workshop', title: 'Motion systems that scale', speaker: 'Kai Tanaka', role: 'Design lead', date: 'June 2027 · Online' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const m = x.pick({ landscape: 8 * u, default: 7 * u });
    const ruleT = x.pick({ landscape: 15 * u, default: 14 * u });
    const ruleB = H - x.pick({ landscape: 19 * u, story: 26 * u, default: 22 * u });
    const colX = L ? W * 0.63 : W - m;
    const line = alpha(p.fg, 0.28);
    const faint = alpha(p.fg, 0.07);
    const hair = Math.max(1, 0.16 * u);
    const layers: Layer[] = [];

    // Faint column grid drawing down.
    const cols = L ? 8 : 4;
    for (let i = 1; i < cols; i++) {
      const gx = m + ((W - 2 * m) * i) / cols;
      layers.push(rect(`grid-${i}`, { x: gx, y: 0, ax: 0.5, ay: 0, w: hair, h: tween(0, H, 0.05 + i * 0.05, 1.4, 'inOutCubic'), fill: faint }));
    }
    // Main rules.
    const hRule = (id: string, y: number, t: number) =>
      rect(id, { x: m, y, ax: 0, w: tween(0, W - 2 * m, t, 1.1, [0.65, 0, 0.25, 1]), h: hair, fill: line });
    const vRule = (id: string, xx: number, t: number) =>
      rect(id, { x: xx, y: ruleT, ax: 0.5, ay: 0, w: hair, h: tween(0, ruleB - ruleT, t, 1.0, [0.65, 0, 0.25, 1]), fill: line });
    layers.push(hRule('rule-top', ruleT, 0.15), hRule('rule-bottom', ruleB, 0.3), vRule('rule-left', m, 0.45));
    if (L) layers.push(vRule('rule-col', colX, 0.55));
    layers.push(vRule('rule-right', W - m, 0.6));
    // Crosshair marks at intersections.
    const marks: [number, number][] = [
      [m, ruleT],
      [W - m, ruleT],
      [m, ruleB],
      [W - m, ruleB],
      ...(L ? ([[colX, ruleT], [colX, ruleB]] as [number, number][]) : []),
    ];
    marks.forEach(([mx, my], i) =>
      layers.push(
        path(`mark-${i}`, ICONS.plus, 24, 24, {
          x: mx,
          y: my,
          w: 3.2 * u,
          h: 3.2 * u,
          stroke: p.fg,
          strokeWidth: 1.3,
          lineCap: 'butt',
          scale: pop(1.0 + i * 0.05, 0.5),
          rotation: k([1.0 + i * 0.05, -90], [1.6 + i * 0.05, 0, 'outCubic']),
        }),
      ),
    );

    // Top row: event + page number.
    const eyeSize = 2.4 * u;
    layers.push(
      x.body('eyebrow', x.c.eyebrow, {
        size: eyeSize,
        weight: 700,
        uppercase: true,
        tracking: 0.18,
        x: m,
        y: ruleT - 4.2 * u,
        ax: 0,
        align: 'left',
        fill: p.fg,
        anim: ta.type(0.5, { stagger: 0.025 }),
      }),
      x.body('page', '01', { size: eyeSize, weight: 700, tracking: 0.1, x: W - m, y: ruleT - 4.2 * u, ax: 1, align: 'right', fill: p.accent, opacity: fadeIn(0.9, 0.4) }),
    );

    // Bauhaus mark.
    const areaT = ruleT + 5 * u;
    const gr = L ? Math.min((W - m - colX) * 0.3, (ruleB - ruleT) * 0.3) : x.pick({ story: 17 * u, portrait: 14 * u, default: 11 * u });
    const gcx = L ? (colX + W - m) / 2 : W - m - 6 * u - gr;
    const gcy = L ? (ruleT + ruleB) / 2 : areaT + gr + 2 * u;
    layers.push(
      circle('disc', gr, { x: gcx, y: gcy, fill: p.accent, scale: k([0.7, 0], [1.6, 1, [0.2, 1, 0.3, 1]]) }),
      ellipse('half', {
        x: gcx - gr * 0.62,
        y: k([0.95, gcy + gr * 1.2], [1.9, gcy + gr * 0.62, [0.2, 1, 0.3, 1]]),
        w: gr * 1.25,
        h: gr * 1.25,
        fill: p.accent2,
        arcStart: 0.5,
        arcEnd: 1,
        opacity: fadeIn(0.95, 0.3),
        rotation: 90,
      }),
      group(
        'orbit',
        [
          ellipse('orbit-arc', {
            x: gr * 1.35,
            y: gr * 1.35,
            w: gr * 2.7,
            h: gr * 2.7,
            stroke: p.fg,
            strokeWidth: hair * 1.4,
            arcStart: 0,
            arcEnd: k([1.0, 0], [2.4, 0.78, 'inOutCubic']),
            lineCap: 'butt',
          }),
          circle('orbit-dot', gr * 0.12, { x: gr * 1.35, y: hair * 0.7, fill: p.fg, scale: pop(0.95, 0.4) }),
        ],
        { x: gcx, y: gcy, w: gr * 2.7, h: gr * 2.7, rotation: k([1.0, -70], [5, 25, [0.3, 0.6, 0.4, 1]]) },
      ),
    );

    // Title
    const tTop = L ? ruleT + 7 * u : gcy + gr + x.pick({ story: 10 * u, default: 7 * u });
    const tW = L ? colX - m - 12 * u : W - 2 * m - 6 * u;
    const tFit = fitTitle(x, x.c.title, {
      maxW: tW,
      maxH: ruleB - 6 * u - tTop,
      maxLines: 4,
      max: x.pick({ landscape: 12 * u, story: 12.5 * u, portrait: 10 * u, default: 8.6 * u }),
      lineHeight: 1.02,
      balance: true,
    });
    const tY = L ? (ruleT + ruleB) / 2 - tFit.h / 2 : ruleB - 5 * u - tFit.h;
    layers.push(
      x.title('title', x.c.title, {
        size: tFit.size,
        x: m + 4 * u,
        y: tY,
        ax: 0,
        ay: 0,
        w: tFit.wrapW,
        align: 'left',
        lineHeight: 1.02,
        anim: ta.riseLines(0.85, { stagger: 0.12, dur: 1.0 }),
      }),
      rect('title-bar', { x: m + 4 * u, y: tY - 3.2 * u, ax: 0, w: tween(0, 8 * u, 0.8, 0.8), h: 0.7 * u, fill: p.accent }),
    );

    // Bottom row: speaker + role, date.
    const nameSize = x.pick({ landscape: 3.1 * u, story: 3.3 * u, default: 2.9 * u });
    const by = ruleB + x.pick({ landscape: 5.5 * u, story: 7 * u, default: 6 * u });
    const half = (W - 2 * m) / 2 - 3 * u;
    const nameFit = fitBody(x, x.c.speaker, { maxW: half, max: nameSize, weight: 700, maxLines: 1 });
    const roleFit = fitBody(x, x.c.role, { maxW: half, max: nameSize * 0.85, maxLines: 1 });
    const dateFit = fitBody(x, x.c.date, { maxW: half, max: nameSize * 0.85, maxLines: 1 });
    layers.push(
      x.body('speaker', x.c.speaker, { size: nameFit.size, weight: 700, x: m, y: by, ax: 0, align: 'left', fill: p.fg, anim: ta.rise(1.55, { by: 'line' }) }),
      x.body('role', x.c.role, { size: roleFit.size, x: m, y: by + nameSize * 1.45, ax: 0, align: 'left', fill: p.muted, anim: ta.rise(1.68, { by: 'line' }) }),
      x.body('date', x.c.date, { size: dateFit.size, x: W - m, y: by, ax: 1, align: 'right', fill: p.muted, anim: ta.rise(1.8, { by: 'line' }) }),
    );
    return { background: p.bg, layers };
  },
};

// ------------------------------------------------------------------ Letterbox Title

const letterboxTitle: Recipe = {
  id: 'letterbox-title',
  name: 'Letterbox Title',
  category: 'intros',
  tags: ['intro', 'cinematic', 'film', 'trailer', 'title', 'serif', 'premium', 'new'],
  description: 'Letterbox bars close in, a serif title resolves out of the blur and a soft light sweep glides across the letters.',
  duration: 6,
  fields: [
    { key: 'title', label: 'Title', default: 'The Long Quiet' },
    { key: 'credit', label: 'Credit line', default: 'A film by Mara Ellison' },
    { key: 'release', label: 'Release line', default: 'In cinemas · Winter 2027' },
  ],
  variants: [
    { name: 'Royal', palette: 'royal', fonts: 'serif', format: 'landscape' },
    { name: 'Midnight', palette: 'midnight', fonts: 'editorial', format: 'landscape', copy: { title: 'Northern Lights', credit: 'An Aurora Pictures original', release: 'Streaming March 2027' } },
    { name: 'Noir', palette: 'noir', fonts: 'dmserif', format: 'story', copy: { title: 'After Hours', credit: 'A short film by Theo Marsh', release: 'Premieres Friday · 9 pm' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'fraunces', format: 'portrait', copy: { title: 'Salt & Signal', credit: 'A documentary series', release: 'Episode one out now' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const dark = darker(p.bg, p.fg);
    const light = lighter(p.bg, p.fg);
    const bar = shade(dark, -0.55);
    const innerH = x.pick({ landscape: H * 0.74, square: H * 0.6, portrait: H * 0.56, story: H * 0.44, default: H * 0.6 });
    const barH = (H - innerH) / 2;
    const tr = 0.12;
    const tFit = fitTitle(x, x.c.title, {
      maxW: W * 0.8,
      maxLines: 2,
      maxH: innerH * 0.42,
      max: x.pick({ landscape: 11 * u, story: 9.5 * u, default: 9 * u }),
      tracking: tr,
      upper: true,
      lineHeight: 1.08,
      balance: true,
    });
    const credit = fitBody(x, x.c.credit, { maxW: W * 0.8, max: x.pick({ story: 2.9 * u, default: 2.4 * u }), tracking: 0.3, upper: true, maxLines: 1 });
    const release = fitBody(x, x.c.release, { maxW: W * 0.8, max: x.pick({ story: 2.9 * u, default: 2.3 * u }), tracking: 0.26, upper: true, maxLines: 1, weight: 600 });
    const tY = cy + credit.px * 1.4;
    const tTop = tY - tFit.h / 2;
    const tw = tFit.w;
    const sweepW = Math.max(16 * u, tFit.px * 1.6);

    const r = x.rand;
    const dust: Layer[] = Array.from({ length: 22 }, (_, i) => {
      const x0 = rr(r, 0, W);
      const y0 = rr(r, barH, H - barH);
      const d = rr(r, 3, 9) * u;
      return circle(`dust-${i}`, rr(r, 0.12, 0.32) * u, {
        x: tween(x0, x0 + d, 0, 6, 'linear'),
        y: tween(y0, y0 - d * 0.6, 0, 6, 'linear'),
        fill: alpha(light, rr(r, 0.15, 0.45)),
        opacity: k([0, 0], [1.2, 1], [4.8, 1], [6, 0.4]),
      });
    });

    return {
      background: radial(0.5, 0.5, 0.75, lerpColor(dark, p.accent, 0.16), shade(dark, -0.3)),
      layers: [
        circle('haze', Math.max(W, H) * 0.42, {
          x: tween(cx - 10 * u, cx + 10 * u, 0, 6, 'inOutSine'),
          y: cy,
          sy: 0.55,
          fill: radial(0.5, 0.5, 0.7, alpha(lerpColor(p.accent, light, 0.25), 0.18), alpha(p.accent, 0)),
          opacity: fadeIn(0.4, 2),
        }),
        ...dust,
        rect('flare', {
          x: cx,
          y: tTop + tFit.h + Math.max(2 * u, tFit.px * 0.35),
          w: W * 0.9,
          h: Math.max(1.5, 0.22 * u),
          fill: linear(0, alpha(p.accent2, 0), alpha(shade(p.accent2, 0.5), 0.9), alpha(p.accent2, 0)),
          sx: k([1.9, 0], [3.1, 1, 'outCubic']),
          opacity: k([1.9, 0], [2.3, 0.9], [4.5, 0.35, 'inOutSine']),
        }),
        x.body('credit', x.c.credit, {
          size: credit.size,
          uppercase: true,
          tracking: 0.3,
          y: tTop - credit.px * 2.6,
          fill: alpha(light, 0.75),
          opacity: k([2.4, 0], [3.4, 1, 'inOutSine']),
          anim: { by: 'char', start: 2.4, dur: 1.0, stagger: 0.02, ease: 'outCubic', from: { opacity: 0, blur: 4 }, order: 'center' },
        }),
        group(
          'title-g',
          [
            x.title('title', x.c.title, {
              size: tFit.size,
              y: tY,
              w: tFit.wrapW,
              uppercase: true,
              tracking: tr,
              lineHeight: 1.08,
              fill: linear(90, light, lerpColor(light, p.accent, 0.45)),
              blur: k([1.0, 22], [2.7, 0, 'outCubic']),
              opacity: k([1.0, 0], [1.9, 1, 'outSine']),
              scale: k([1.0, 1.1], [4.0, 1, [0.2, 0.7, 0.3, 1]]),
            }),
            rect('sweep', {
              x: k([3.0, cx - tw / 2 - sweepW], [4.5, cx + tw / 2 + sweepW, 'inOutSine']),
              y: tY,
              w: sweepW,
              h: tFit.h * 1.6,
              skewX: -24,
              fill: linear(0, alpha(shade(light, 1), 0), alpha(shade(light, 1), 0.95), alpha(shade(light, 1), 0)),
              blend: 'source-atop',
              start: 2.95,
              end: 4.6,
            }),
          ],
          { x: 0, y: 0, w: W, h: H, ax: 0, ay: 0, isolate: true },
        ),
        rect('bar-top', { x: 0, y: k([0.25, -barH - 2], [1.6, 0, [0.7, 0, 0.25, 1]]), ax: 0, ay: 0, w: W, h: barH + 1, fill: bar }),
        rect('bar-bottom', { x: 0, y: k([0.25, H + 2], [1.6, H - barH, [0.7, 0, 0.25, 1]]), ax: 0, ay: 0, w: W, h: barH + 1, fill: bar }),
        x.body('release', x.c.release, {
          size: release.size,
          weight: 600,
          uppercase: true,
          tracking: 0.26,
          y: H - barH / 2,
          fill: alpha(light, 0.8),
          opacity: k([3.6, 0], [4.4, 1, 'inOutSine']),
        }),
        rect('fade', { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, fill: bar, opacity: k([0, 1], [0.9, 0, 'inOutSine']), end: 1 }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Episode Intro

const episodeIntro: Recipe = {
  id: 'episode-intro',
  name: 'Episode Intro',
  category: 'intros',
  tags: ['intro', 'podcast', 'episode', 'audio', 'waveform', 'show', 'creator'],
  description: 'Podcast opener: cover card flips up with the episode number, title rises and a live waveform plays along.',
  duration: 5.5,
  fields: [
    { key: 'brand', label: 'Show name', default: 'The Long Game' },
    { key: 'episode', label: 'Episode number', default: '42' },
    { key: 'title', label: 'Episode title', default: 'Building a studio that outlasts trends', multiline: true },
    { key: 'guest', label: 'Guest', default: 'with Dana Reyes' },
  ],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'sora', format: 'landscape' },
    { name: 'Sand', palette: 'sand', fonts: 'dmserif', format: 'square', copy: { brand: 'Slow Mornings', episode: '18', title: 'The art of doing less, better', guest: 'with Noor Haddad' } },
    { name: 'Peach', palette: 'peach', fonts: 'poppins', format: 'portrait', copy: { brand: 'Side Quest', episode: '07', title: 'Turning a hobby into a paycheck', guest: 'with Leo Martins' } },
    { name: 'Forest', palette: 'forest', fonts: 'space', format: 'story', copy: { brand: 'Field Notes', episode: '103', title: 'What ten years of hiking taught me about focus', guest: 'with Ava Lund' } },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const L = x.isLandscape;
    const m = x.pick({ landscape: 11 * u, default: 8 * u });
    const cs = x.pick({ landscape: 52 * u, story: 58 * u, portrait: 44 * u, default: 34 * u });
    const colL = L ? m + cs + 9 * u : m;
    const colW = L ? W - m - colL : W - 2 * m;
    const align = L ? ('left' as const) : ('center' as const);
    const tFit = fitTitle(x, x.c.title, {
      maxW: colW,
      maxLines: 3,
      maxH: x.pick({ landscape: 30 * u, story: 34 * u, portrait: 26 * u, default: 17 * u }),
      max: x.pick({ landscape: 7.5 * u, story: 9 * u, portrait: 7.5 * u, default: 6.8 * u }),
      lineHeight: 1.06,
      balance: true,
    });
    const eyeS = x.pick({ story: 3.2 * u, default: 2.6 * u });
    const guestS = x.pick({ story: 3.8 * u, default: 3.1 * u });
    const waveH = x.pick({ landscape: 11 * u, story: 14 * u, portrait: 11 * u, default: 8 * u });
    const g = x.pick({ story: 5 * u, default: 3.6 * u });
    const textH = eyeS * 1.3 + g + tFit.h + g * 0.7 + guestS * 1.3 + g * 1.6 + waveH + 3.5 * u;
    const total = L ? Math.max(cs, textH) : cs + g * 2.2 + textH;
    const top = cy - total / 2;
    const cardCx = L ? m + cs / 2 : cx;
    const cardCy = L ? cy : top + cs / 2;
    let ty = L ? cy - textH / 2 : top + cs + g * 2.2;
    const tx = L ? colL : cx;
    const tax = L ? 0 : 0.5;

    // Cover card
    const epFit = fitTitle(x, x.c.episode, { maxW: cs * 0.8, max: cs * 0.5, wrap: false });
    const cardKids: Layer[] = [
      rect('card-bg', { x: 0, y: 0, ax: 0, ay: 0, w: cs, h: cs, fill: linear(135, p.accent, lerpColor(p.accent, p.accent2, 0.55)) }),
      ...[0, 1, 2].map((i) =>
        ellipse(`card-arc-${i}`, {
          x: cs,
          y: 0,
          w: cs * (0.7 + i * 0.32),
          h: cs * (0.7 + i * 0.32),
          stroke: alpha(p.onAccent, 0.22 - i * 0.05),
          strokeWidth: cs * 0.012,
          arcStart: 0.5,
          arcEnd: k([0.6 + i * 0.1, 0.5], [1.6 + i * 0.1, 0.75, 'inOutCubic']),
          lineCap: 'butt',
        }),
      ),
      x.body('card-ep', 'EP', { size: cs * 0.07, weight: 700, tracking: 0.3, x: cs * 0.1, y: cs * 0.14, ax: 0, align: 'left', fill: alpha(p.onAccent, 0.75) }),
      x.title('card-num', x.c.episode, {
        size: epFit.size,
        x: cs * 0.09,
        y: cs * 0.2,
        ax: 0,
        ay: 0,
        align: 'left',
        fill: p.onAccent,
        lineHeight: 1,
        anim: ta.rise(0.7, { by: 'char', stagger: 0.07 }),
      }),
      x.body('card-show', x.c.brand, {
        size: Math.min(cs * 0.065, fitBody(x, x.c.brand, { maxW: cs * 0.8, max: cs * 0.065, weight: 700, tracking: 0.16, upper: true, maxLines: 1 }).size),
        weight: 700,
        uppercase: true,
        tracking: 0.16,
        x: cs * 0.1,
        y: cs * 0.86,
        ax: 0,
        align: 'left',
        fill: p.onAccent,
      }),
      circle('card-live', cs * 0.022, { x: cs * 0.9 - cs * 0.022, y: cs * 0.86, fill: p.onAccent, opacity: k([1.5, 1], [1.9, 0.25], [2.3, 1], [2.7, 0.25], [3.1, 1], [3.5, 0.25], [3.9, 1]) }),
    ];
    const layers: Layer[] = [
      circle('bg-glow', Math.max(W, H) * 0.5, {
        x: cardCx,
        y: cardCy,
        fill: radial(0.5, 0.5, 0.7, alpha(p.accent, 0.18), alpha(p.accent, 0)),
        opacity: fadeIn(0.2, 1.2),
      }),
      rect('card-shadow', {
        x: cardCx,
        y: cardCy,
        w: cs * 0.94,
        h: cs * 0.94,
        radius: cs * 0.06,
        fill: shade(p.accent, -0.3),
        shadow: { color: alpha(shade(p.accent, -0.7), 0.45), blur: 7 * u, y: 3 * u },
        scale: k([0.1, 0.82], [1.1, 1, [0.2, 1, 0.3, 1]]),
        rotation: k([0.1, -8], [1.2, 0, [0.2, 1, 0.3, 1]]),
        opacity: k([0.1, 0], [0.6, 0.9]),
      }),
      group('card', cardKids, {
        x: cardCx,
        y: cardCy,
        w: cs,
        h: cs,
        clip: true,
        clipRadius: cs * 0.06,
        scale: k([0.1, 0.82], [1.1, 1, [0.2, 1, 0.3, 1]]),
        rotation: k([0.1, -8], [1.2, 0, [0.2, 1, 0.3, 1]]),
        opacity: fadeIn(0.1, 0.35),
      }),
    ];
    // Text column
    layers.push(
      x.body('eyebrow', `Episode ${x.c.episode}`, {
        size: eyeS,
        weight: 700,
        uppercase: true,
        tracking: 0.2,
        x: tx,
        y: ty + (eyeS * 1.3) / 2,
        ax: tax,
        align,
        fill: p.accent,
        anim: ta.chars(0.75, { stagger: 0.025 }),
      }),
    );
    ty += eyeS * 1.3 + g;
    layers.push(
      x.title('title', x.c.title, {
        size: tFit.size,
        x: tx,
        y: ty,
        ax: tax,
        ay: 0,
        w: tFit.wrapW,
        align,
        lineHeight: 1.06,
        anim: ta.riseLines(0.95, { stagger: 0.1, dur: 0.9 }),
      }),
    );
    ty += tFit.h + g * 0.7;
    layers.push(
      x.body('guest', x.c.guest, {
        size: fitBody(x, x.c.guest, { maxW: colW, max: guestS, maxLines: 1 }).size,
        x: tx,
        y: ty + (guestS * 1.3) / 2,
        ax: tax,
        align,
        fill: p.muted,
        anim: ta.blur(1.35, { stagger: 0.05 }),
      }),
    );
    ty += guestS * 1.3 + g * 1.6;

    // Waveform + progress
    const ww = L ? colW : Math.min(colW, x.pick({ story: 80 * u, default: 74 * u }));
    const wl = L ? colL : cx - ww / 2;
    const n = x.pick({ landscape: 40, story: 30, default: 32 });
    const pitch = ww / n;
    const bw = pitch * 0.5;
    const wcy = ty + waveH / 2;
    const r = x.rand;
    const tp0 = 1.6;
    const tp1 = 5.5;
    const playEnd = 0.42;
    for (let i = 0; i < n; i++) {
      const bx = wl + pitch * (i + 0.5);
      const env = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * ((i + 0.5) / n)), 0.7) * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + 0.5)));
      const period = rr(r, 0.42, 0.78);
      const t0 = 1.2 + i * 0.012;
      const frac = (i + 0.5) / n;
      const tHit = frac <= playEnd ? tp0 + (frac / playEnd) * (tp1 - tp0) : 99;
      layers.push(
        rect(`bar-${i}`, {
          x: bx,
          y: wcy,
          w: bw,
          h: waveH * env,
          radius: bw / 2,
          fill: k([0, alpha(p.fg, 0.28)], [tHit, p.accent, 'hold']),
          scale: k([t0, 0], [t0 + 0.5, 1, 'outBack']),
          sy: osc(0.62, 0.38, period, { t0: t0 - period * rr(r, 0, 1), t1: 7, q: Math.floor(rr(r, 0, 4)) }),
        }),
      );
    }
    const py = wcy + waveH / 2 + 3.5 * u;
    layers.push(
      rect('prog-track', { x: wl, y: py, ax: 0, w: tween(0, ww, 1.3, 0.9, 'outExpo'), h: 0.4 * u, radius: 0.2 * u, fill: alpha(p.fg, 0.14) }),
      rect('prog', { x: wl, y: py, ax: 0, w: k([tp0, 0], [tp1, ww * playEnd, 'linear']), h: 0.4 * u, radius: 0.2 * u, fill: p.accent }),
      circle('playhead', 0.9 * u, { x: k([tp0, wl], [tp1, wl + ww * playEnd, 'linear']), y: py, fill: p.accent, scale: pop(tp0 - 0.2, 0.4) }),
    );
    return { layers };
  },
};

export const introRecipes: Recipe[] = [channelBurst, keynoteTitle, letterboxTitle, episodeIntro];
