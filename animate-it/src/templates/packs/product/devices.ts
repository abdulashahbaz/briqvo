/** Category: devices — phone app showcase, laptop website reveal, phone + laptop duo, three phones fan. */
import type { Layer } from '../../../engine/types';
import { type Recipe, type Ctx, k, rect, circle, group, radial, linear, alpha, shade, lerpColor, ta, image, path, phone, laptop, starPath } from '../../kit';
import { uiTheme, heading, cursor, icon, pill, glow, fit, textW, countTo, smooth, chartPts, delta, checkbox, statusBar, homeBar, balance, type UI } from './ui';

// ------------------------------------------------------------------ shared bits

/** Phone body colour: keep a visible rim on dark backgrounds. */
function bodyFor(x: Ctx, ui: UI) {
  return ui.dark ? lerpColor(x.p.surface, x.p.fg, 0.16) : undefined;
}

/** Light ink that reads on photos / accent fills in every theme. */
function lightInk(x: Ctx, ui: UI) {
  return ui.dark ? x.p.fg : ui.card;
}

function fadeUp(t: number, y: number, dy: number, d = 0.7) {
  return { y: k([t, y + dy], [t + d, y, 'outExpo']), opacity: k([t, 0], [t + d * 0.5, 1, 'outCubic']) };
}

/** Floating notification card (scene space). */
function notif(
  x: Ctx,
  ui: UI,
  id: string,
  o: { x: number; y: number; w: number; title: string; sub: string; value?: string; icon: string; t: number; ax?: number; z?: number },
): Layer {
  const z = o.z ?? 1;
  const u = x.u * z;
  const h = 10.4 * u;
  const tile = 6.4 * u;
  const valW = o.value ? estW(x, o.value, 2.7 * u) + 2.5 * u : 0;
  const tw = o.w - tile - 7.6 * u - valW;
  return group(
    id,
    [
      rect(id + '-bg', { x: 0, y: 0, ax: 0, ay: 0, w: o.w, h, radius: 3 * u, fill: ui.card, stroke: ui.border, strokeWidth: 0.15 * u, shadow: { color: ui.shadow, blur: 5 * u, y: 1.8 * u } }),
      rect(id + '-tile', { x: 2 * u, y: h / 2, ax: 0, w: tile, h: tile, radius: 1.9 * u, fill: ui.accent }),
      icon(id + '-ic', o.icon, { x: 2 * u + tile / 2, y: h / 2, size: tile * 0.56, color: ui.onAccent, weight: 2, draw: [o.t + 0.25, 0.5] }),
      fit(x.body(id + '-t', o.title, { size: 2.6 * u, x: 2 * u + tile + 2.4 * u, y: h * 0.36, ax: 0, align: 'left', weight: 700, fill: ui.text }), tw),
      fit(x.body(id + '-s', o.sub, { size: 2.2 * u, x: 2 * u + tile + 2.4 * u, y: h * 0.66, ax: 0, align: 'left', fill: ui.muted }), tw),
      ...(o.value ? [x.body(id + '-v', o.value, { size: 2.7 * u, x: o.w - 2.4 * u, y: h / 2, ax: 1, align: 'right' as const, weight: 700, fill: ui.accent })] : []),
    ],
    {
      x: o.x,
      y: o.y,
      w: o.w,
      h,
      ax: o.ax ?? 0.5,
      ay: 0.5,
      opacity: k([o.t, 0], [o.t + 0.3, 1]),
      scale: k([o.t, 0.6], [o.t + 0.7, 1, 'outBack']),
    },
  );
}

/** Lighter outline behind a laptop lid so it reads on dark backgrounds. */
function rim(x: Ctx, ui: UI, lap: import('../../../engine/types').GroupLayer, lw: number) {
  if (!ui.dark) return;
  const lidW = lw * 0.8;
  const lidH = lidW * 0.64;
  const r = x.u * 0.35;
  lap.children.unshift(
    rect(lap.id + '-rim', { x: (lw - lidW) / 2 - r, y: -r, ax: 0, ay: 0, w: lidW + r * 2, h: lidH + r * 2, radius: lidW * 0.03 + r, fill: lerpColor(x.p.surface, x.p.fg, 0.2) }),
  );
}

function estW(x: Ctx, s: string, size: number) {
  return textW(x.body('tmp', s, { size }));
}

/** Rating row: five stars + label. Returns layers centred/left at (rx, ry). */
function rating(x: Ctx, id: string, label: string, rx: number, ry: number, align: 'left' | 'center', t: number, size: number): Layer[] {
  const { p } = x;
  const st = size * 1.15;
  const gap = size * 0.25;
  const lab = x.body(id + '-l', label, { size, x: 0, y: ry, ax: 0, align: 'left', weight: 600, fill: p.muted });
  const lw = textW(lab);
  const total = st * 5 + gap * 4 + size * 0.9 + lw;
  const x0 = align === 'left' ? rx : rx - total / 2;
  const out: Layer[] = [];
  for (let i = 0; i < 5; i++)
    out.push(path(`${id}-s${i}`, starPath(5, 0.48), 100, 100, { x: x0 + st / 2 + i * (st + gap), y: ry, w: st, h: st, fill: p.accent, scale: k([t + i * 0.06, 0], [t + i * 0.06 + 0.45, 1, 'outBack']) }));
  out.push(Object.assign(lab, { x: x0 + st * 5 + gap * 4 + size * 0.9, opacity: k([t + 0.3, 0], [t + 0.6, 1]) }));
  return out;
}

function tabBar(_x: Ctx, ui: UI, id: string, sw: number, sh: number, icons: string[], active = 0): Layer[] {
  const q = sw / 100;
  const th = 17 * q;
  const out: Layer[] = [
    rect(id + '-bg', { x: 0, y: sh - th, ax: 0, ay: 0, w: sw, h: th, fill: ui.card }),
    rect(id + '-line', { x: 0, y: sh - th, ax: 0, ay: 0, w: sw, h: 0.3 * q, fill: ui.line }),
  ];
  icons.forEach((ic, i) => {
    const ix = sw * ((i + 0.5) / icons.length);
    out.push(icon(`${id}-i${i}`, ic, { x: ix, y: sh - th + 6.6 * q, size: 5.4 * q, color: i === active ? ui.accent : ui.muted, weight: 1.9 }));
    if (i === active) out.push(circle(`${id}-dot`, 0.7 * q, { x: ix, y: sh - th + 11.6 * q, fill: ui.accent }));
  });
  out.push(homeBar(id + '-home', sw, sh, ui.text));
  return out;
}

// ------------------------------------------------------------------ App Showcase (phone)

function walletScreen(x: Ctx, ui: UI, sw: number, _sh: number, T: Record<string, number>): Layer[] {
  const { c, p } = x;
  const q = sw / 100;
  const ink = lightInk(x, ui);
  const C: Layer[] = [];
  // header
  C.push(
    group(
      'ps-head',
      [
        circle('ps-av', 4.6 * q, { x: 10.5 * q, y: 5 * q, fill: linear(45, ui.accent2, ui.accent) }),
        x.body('ps-av-i', c.user.slice(0, 1).toUpperCase(), { size: 3.8 * q, x: 10.5 * q, y: 5 * q, weight: 700, fill: ink }),
        x.body('ps-hi', 'Good morning,', { size: 2.9 * q, x: 18.4 * q, y: 2.7 * q, ax: 0, align: 'left', fill: ui.muted }),
        fit(x.body('ps-name', c.user, { size: 4.3 * q, x: 18.4 * q, y: 7.4 * q, ax: 0, align: 'left', weight: 700, fill: ui.text }), 50 * q),
        circle('ps-bell-bg', 4.6 * q, { x: 88.5 * q, y: 5 * q, fill: ui.card, stroke: ui.border, strokeWidth: 0.3 * q }),
        icon('ps-bell', 'bell', { x: 88.5 * q, y: 5 * q, size: 4.4 * q, color: ui.text, weight: 1.8, rotation: k([T.notif, 0], [T.notif + 0.1, 14], [T.notif + 0.2, -12], [T.notif + 0.3, 8], [T.notif + 0.45, 0, 'outCubic']) }),
        circle('ps-bell-dot', 1.1 * q, { x: 90.9 * q, y: 2.2 * q, fill: ui.accent, scale: k([T.notif, 0], [T.notif + 0.4, 1, 'outBack']) }),
      ],
      { x: 0, ...fadeUp(T.ui, 15 * q, 3 * q), w: sw, h: 10 * q, ax: 0, ay: 0 },
    ),
  );
  // balance card
  const bw = 88 * q;
  const bh = 46 * q;
  const spts = chartPts([3, 4, 3.6, 5, 4.6, 6, 5.8, 7.2], 34 * q, 11 * q, 0.1);
  C.push(
    group(
      'ps-bal',
      [
        rect('ps-bal-bg', { x: 0, y: 0, ax: 0, ay: 0, w: bw, h: bh, radius: 5.5 * q, fill: linear(125, shade(ui.accent, 0.08), shade(ui.accent, -0.28)) }),
        circle('ps-bal-c1', 22 * q, { x: 82 * q, y: 2 * q, fill: alpha(ui.onAccent, 0.08) }),
        circle('ps-bal-c2', 14 * q, { x: 94 * q, y: 44 * q, fill: alpha(ui.onAccent, 0.06) }),
        x.body('ps-bal-l', c.balLabel, { size: 2.9 * q, x: 6 * q, y: 9 * q, ax: 0, align: 'left', fill: alpha(ui.onAccent, 0.78), weight: 500 }),
        fit(x.body('ps-bal-v', c.balance, { size: 7.4 * q, x: 6 * q, y: 17.4 * q, ax: 0, align: 'left', weight: 700, fill: ui.onAccent, tracking: -0.02, counter: countTo(c.balance, T.ui + 0.4, 1.6, 0.6) }), 76 * q),
        delta(x, 'ps-bal-d', c.delta, { x: 6 * q, y: 26.6 * q, size: 2.4 * q, color: ui.onAccent, fill: alpha(ui.onAccent, 0.16), opacity: k([T.ui + 1.4, 0], [T.ui + 1.7, 1]) }),
        x.body('ps-bal-n', '•••• 4821', { size: 2.6 * q, x: 6 * q, y: 39.5 * q, ax: 0, align: 'left', fill: alpha(ui.onAccent, 0.7), tracking: 0.08 }),
        path('ps-bal-sp', smooth(spts), 34 * q, 11 * q, { x: 50 * q, y: 30 * q, w: 34 * q, h: 11 * q, ax: 0, ay: 0, stroke: alpha(ui.onAccent, 0.85), strokeWidth: 0.7 * q, trimEnd: k([T.ui + 0.7, 0], [T.ui + 2, 1, 'inOutCubic']) }),
      ],
      { x: 6 * q, ...fadeUp(T.ui + 0.1, 30 * q, 4 * q), w: bw, h: bh, ax: 0, ay: 0, clip: true, clipRadius: 5.5 * q },
    ),
  );
  // quick actions
  const acts: [string, string][] = [
    ['send', 'Send'],
    ['plus', 'Top up'],
    ['cart', 'Pay'],
    ['share', 'Split'],
  ];
  acts.forEach(([ic, lab], i) => {
    const ax = 15 * q + i * 23.3 * q;
    const t = T.ui + 0.3 + i * 0.06;
    C.push(
      group(
        `ps-act${i}`,
        [
          circle(`ps-act${i}-bg`, 6.6 * q, { x: 7 * q, y: 6.6 * q, fill: ui.card, stroke: ui.border, strokeWidth: 0.3 * q }),
          icon(`ps-act${i}-ic`, ic, { x: 7 * q, y: 6.6 * q, size: 5.2 * q, color: ui.accent, weight: 1.9 }),
          x.body(`ps-act${i}-l`, lab, { size: 2.6 * q, x: 7 * q, y: 17 * q, fill: ui.text, weight: 600 }),
        ],
        { x: ax, y: 87 * q, w: 14 * q, h: 19 * q, ax: 0.5, ay: 0, scale: k([t, 0.5], [t + 0.5, 1, 'outBack']), opacity: k([t, 0], [t + 0.3, 1]) },
      ),
    );
  });
  // activity
  C.push(
    x.body('ps-sec', 'Recent activity', { size: 3.4 * q, x: 6 * q, y: 115 * q, ax: 0, align: 'left', weight: 700, fill: ui.text, opacity: k([T.ui + 0.5, 0], [T.ui + 0.9, 1]) }),
    x.body('ps-see', 'See all', { size: 2.7 * q, x: 94 * q, y: 115 * q, ax: 1, align: 'right', weight: 600, fill: ui.accent, opacity: k([T.ui + 0.5, 0], [T.ui + 0.9, 1]) }),
  );
  const rows: [string, string, string, string][] = [
    ['cart', 'Corner Market', 'Groceries · Today', '-$32.40'],
    ['music', 'Soundwave', 'Subscription · Mon', '-$9.99'],
    ['gift', c.payer, 'Transfer · Sun', '+$240.00'],
    ['rocket', 'Skyline Air', 'Travel · Fri', '-$186.00'],
  ];
  rows.forEach(([ic, name, sub, amt], i) => {
    const y = 125 * q + i * 15 * q;
    const t = T.ui + 0.55 + i * 0.06;
    const inc = amt.startsWith('+');
    C.push(
      group(
        `ps-row${i}`,
        [
          rect(`ps-row${i}-t`, { x: 6 * q, y: 6 * q, ax: 0, w: 11 * q, h: 11 * q, radius: 3.4 * q, fill: inc ? ui.chip : ui.soft }),
          icon(`ps-row${i}-ic`, ic, { x: 11.5 * q, y: 6 * q, size: 5.2 * q, color: inc ? ui.accent : ui.text, weight: 1.8 }),
          fit(x.body(`ps-row${i}-n`, name, { size: 3.1 * q, x: 21 * q, y: 3.8 * q, ax: 0, align: 'left', weight: 600, fill: ui.text }), 46 * q),
          x.body(`ps-row${i}-s`, sub, { size: 2.5 * q, x: 21 * q, y: 8.4 * q, ax: 0, align: 'left', fill: ui.muted }),
          x.body(`ps-row${i}-a`, amt, { size: 3.1 * q, x: 94 * q, y: 6 * q, ax: 1, align: 'right', weight: 700, fill: inc ? ui.accent : ui.text }),
        ],
        { x: 0, ...fadeUp(t, y, 3 * q), w: sw, h: 12 * q, ax: 0, ay: 0 },
      ),
    );
  });
  // promo card
  C.push(
    group(
      'ps-promo',
      [
        image('ps-promo-img', x.img[0], { x: 0, y: 0, ax: 0, ay: 0, w: 88 * q, h: 44 * q, radius: 5 * q }),
        rect('ps-promo-sh', { x: 0, y: 0, ax: 0, ay: 0, w: 88 * q, h: 44 * q, radius: 5 * q, fill: { kind: 'linear', angle: 90, stops: [{ o: 0.3, c: alpha(shade(p.bg, -0.9), 0) }, { o: 1, c: alpha(shade(p.bg, -0.9), 0.6) }] } }),
        x.body('ps-promo-k', 'TRAVEL POCKET', { size: 2.3 * q, x: 5 * q, y: 31 * q, ax: 0, align: 'left', weight: 700, tracking: 0.1, fill: alpha(ink, 0.85) }),
        x.body('ps-promo-t', 'Save for the weekend', { size: 3.6 * q, x: 5 * q, y: 37 * q, ax: 0, align: 'left', weight: 700, fill: ink }),
      ],
      { x: 6 * q, y: 199 * q, w: 88 * q, h: 44 * q, ax: 0, ay: 0 },
    ),
  );
  return C;
}

const phoneShowcase: Recipe = {
  id: 'phone-showcase',
  name: 'App Showcase',
  category: 'devices',
  tags: ['devices', 'phone', 'app', 'mockup', 'fintech', 'scroll', 'mobile', 'app store'],
  description: 'A phone floats in and the app scrolls through its screens while a notification pops out.',
  duration: 6,
  images: [{ key: 'promo', label: 'In-app photo', art: 'landscape' }],
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Now on iOS & Android' },
    { key: 'headline', label: 'Headline', default: 'Money, finally made simple.', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Budgets, cards and savings in one calm app.', multiline: true },
    { key: 'rating', label: 'Rating label', default: '4.9 · 18k reviews' },
    { key: 'user', label: 'User name', default: 'Maya' },
    { key: 'balLabel', label: 'Card label', default: 'Total balance' },
    { key: 'balance', label: 'Balance', default: '$12,480.50' },
    { key: 'delta', label: 'Change', default: '4.2% this month' },
    { key: 'payer', label: 'Incoming from', default: 'Jordan Lee' },
    { key: 'nTitle', label: 'Notification title', default: 'Payment received' },
    { key: 'nValue', label: 'Notification amount', default: '+$240.00' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'sora', format: 'landscape' },
    { name: 'Cyber', palette: 'cyber', fonts: 'unbounded', format: 'story', copy: { eyebrow: 'Out now', headline: 'Your money, levelled up.', sub: 'Instant splits, smart pockets, zero fees.', user: 'Kai', balance: '$3,920.75', delta: '12.8% this month', payer: 'Rio Park', nValue: '+$85.00' } },
    { name: 'Peach', palette: 'peach', fonts: 'poppins', format: 'square', copy: { eyebrow: 'Free download', headline: 'Save without thinking.', sub: 'Round-ups that quietly add up.', user: 'Lena', balLabel: 'Savings', balance: '$8,214.00', delta: '6.1% this month', payer: 'Sam Ortiz', nTitle: 'Goal reached', nValue: '+$500.00' } },
    { name: 'Forest', palette: 'forest', fonts: 'grotesk', format: 'portrait', copy: { eyebrow: 'Banking, but calm', headline: 'Spend green. Save greener.', sub: 'See your footprint with every purchase.', user: 'Noah', balance: '$5,630.20', delta: '3.4% this month', payer: 'Ava Brooks', nTitle: 'Round-up saved', nValue: '+$12.40' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const T = { phone: 0.25, ui: 0.85, s1: 2.25, s2: 3.85, notif: 3.2 };
    const ph = x.pick({ landscape: 86 * u, square: 82 * u, portrait: 78 * u, default: 104 * u });
    const pw = ph * 0.49;
    let pcx: number;
    let pcy: number;
    const layers: Layer[] = [];
    if (x.isLandscape || x.isSquare) {
      const m = x.isLandscape ? 9 * u : 7 * u;
      pcx = x.isLandscape ? W * 0.67 : W - m - pw / 2 + 1 * u;
      pcy = H / 2 + (x.isSquare ? 1 * u : 0);
      const tw = pcx - pw / 2 - m - (x.isLandscape ? 10 * u : 5 * u);
      const hd = heading(x, { eyebrow: c.eyebrow, title: c.headline, sub: c.sub, x: m, y: H / 2 - 3 * u, w: tw, size: x.isLandscape ? 9 * u : 7 * u, vAlign: 'center', maxLines: 3, subLines: 3, t0: 0.15 });
      layers.push(...hd.layers, ...rating(x, 'ps-rate', c.rating, m, hd.bottom + 5.5 * u, 'left', 1.3, x.isLandscape ? 2.6 * u : 2.4 * u));
    } else {
      const size = x.pick({ portrait: 7.2 * u, default: 9.4 * u });
      const opts = { eyebrow: c.eyebrow, title: c.headline, sub: c.sub, x: W / 2, y: 0, w: 84 * u, size, align: 'center' as const, maxLines: 2, subLines: 2, t0: 0.15 };
      const probe = heading(x, opts);
      const gap = x.pick({ portrait: 6 * u, default: 9 * u });
      const total = probe.h + gap + ph;
      const top = (H - total) / 2 + (x.isStory ? -1 * u : 1.5 * u);
      layers.push(...heading(x, { ...opts, y: top }).layers);
      pcx = W / 2;
      pcy = top + probe.h + gap + ph / 2;
    }
    const nx = pcx;
    const ny = pcy + ph * 0.13;
    const sw = ph * 0.446;
    const q = sw / 100;
    const scrollH = 250 * q;
    const fone = phone(
      'ps-phone',
      {
        x: pcx,
        y: k([T.phone, pcy + 40 * u], [T.phone + 1.3, pcy, 'outExpo'], [3.6, pcy - 1.2 * u, 'inOutSine'], [6, pcy, 'inOutSine']),
        h: ph,
        body: bodyFor(x, ui),
        rotation: k([T.phone, 10], [T.phone + 1.4, 0, 'outBack']),
        opacity: k([T.phone, 0], [T.phone + 0.4, 1]),
      },
      (sw2, sh2) => [
        rect('ps-app', { x: 0, y: 0, ax: 0, ay: 0, w: sw2, h: sh2, fill: ui.app }),
        group('ps-scroll', walletScreen(x, ui, sw2, sh2, T), {
          x: 0,
          y: k([T.s1, 0], [T.s1 + 0.9, -96 * q, 'inOutCubic'], [T.s2, -96 * q], [T.s2 + 1.0, 0, 'inOutCubic']),
          w: sw2,
          h: scrollH,
          ax: 0,
          ay: 0,
        }),
        rect('ps-topfade', { x: 0, y: 0, ax: 0, ay: 0, w: sw2, h: 12 * q, fill: ui.app }),
        ...statusBar('ps-sb', x, sw2, ui.text),
        ...tabBar(x, ui, 'ps-tab', sw2, sh2, ['bolt', 'calendar', 'chat', 'user']),
      ],
    );
    const nw = pw * 1.14;
    return {
      background: radial(pcx / W, pcy / H, 0.8, p.bg2, p.bg),
      layers: [
        glow('ps-glow', { x: pcx, y: pcy, r: ph * 0.62, color: p.accent, a: ui.dark ? 0.3 : 0.25, scale: k([0.2, 0.5], [1.6, 1, 'outExpo']) }),
        ...layers,
        fone,
        notif(x, ui, 'ps-notif', { x: nx, y: ny, w: nw, ax: 0.5, title: c.nTitle, sub: `From ${c.payer}`, value: c.nValue, icon: 'bell', t: T.notif, z: x.pick({ story: 1.15, square: 0.92, default: 1 }) }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Website Reveal (laptop)

function siteScreen(x: Ctx, ui: UI, sw: number, sh: number, T: Record<string, number>): { layers: Layer[]; cta: [number, number] } {
  const { c } = x;
  const q = sw / 100;
  const L: Layer[] = [rect('lr-page', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh * 2.2, fill: ui.card })];
  const ap = (t: number) => ({ opacity: k([t, 0], [t + 0.4, 1]) });
  // nav
  const lt = 3.8 * q;
  L.push(
    rect('lr-logo-bg', { x: 5 * q, y: 4.2 * q, ax: 0, w: lt, h: lt, radius: 1 * q, fill: ui.accent, ...ap(T.site) }),
    x.logo('lr-logo', { size: lt * 0.6, x: 5 * q + lt / 2, y: 4.2 * q, color: ui.onAccent, ...ap(T.site) }),
    fit(x.body('lr-brand', c.brand, { size: 2.1 * q, x: 5 * q + lt + 1.4 * q, y: 4.2 * q, ax: 0, align: 'left', weight: 700, fill: ui.text, ...ap(T.site) }), 22 * q),
  );
  ['Product', 'Pricing', 'Stories'].forEach((l, i) =>
    L.push(x.body(`lr-nav${i}`, l, { size: 1.75 * q, x: 46 * q + i * 10 * q, y: 4.2 * q, fill: ui.muted, weight: 500, ...ap(T.site + 0.05 * i) })),
  );
  L.push(pill(x, 'lr-signup', 'Sign up', { x: 95 * q, y: 4.2 * q, ax: 1, size: 1.7 * q, h: 4.2 * q, fill: ui.text, color: ui.card, weight: 600, ...ap(T.site + 0.2) }));
  L.push(rect('lr-navline', { x: 0, y: 8.4 * q, ax: 0, ay: 0, w: sw, h: 0.15 * q, fill: ui.line }));
  // hero
  const hx = 5 * q;
  const hw = 44 * q;
  const eye = pill(x, 'lr-eye', c.badge, { x: hx, y: 15.5 * q, ax: 0, size: 1.5 * q, h: 3.6 * q, fill: ui.chip, color: ui.accent, weight: 700, ...ap(T.site + 0.25) });
  const hl = balance(fit(x.title('lr-h1', c.siteHead, { size: 5.4 * q, x: hx, y: 19.5 * q, w: hw, ax: 0, ay: 0, align: 'left', fill: ui.text, lineHeight: 1.04, anim: ta.rise(T.site + 0.3, { stagger: 0.05 }) }), hw, 3), hw);
  const hlH = (hl.size as number) * 1.04 * Math.min(3, Math.max(1, Math.round(((textW(hl) / (hl.w as number)) * 1.0) + 0.49)));
  const subY = 19.5 * q + hlH + 2.4 * q;
  L.push(
    eye,
    hl,
    fit(x.body('lr-sub', c.siteSub, { size: 1.9 * q, x: hx, y: subY, w: hw * 0.92, ax: 0, ay: 0, align: 'left', fill: ui.muted, lineHeight: 1.45, anim: ta.blur(T.site + 0.6, { stagger: 0.02 }) }), hw * 0.92, 2),
  );
  const by = subY + 9.6 * q;
  const b1 = pill(x, 'lr-b1', c.siteCta, { x: hx, y: by, ax: 0, size: 1.8 * q, h: 5 * q, fill: ui.accent, color: ui.onAccent, weight: 700, padX: 1.6, ...ap(T.site + 0.8), scale: k([T.click - 0.06, 1], [T.click, 0.93, 'outQuad'], [T.click + 0.3, 1, 'outBack']) });
  const b2 = pill(x, 'lr-b2', 'See features', { x: hx + b1.pw + 1.6 * q, y: by, ax: 0, size: 1.8 * q, h: 5 * q, fill: ui.soft, color: ui.text, weight: 600, padX: 1.6, ...ap(T.site + 0.9) });
  L.push(b1, b2);
  // hero image with floating stat
  const iw = 42 * q;
  const ih = 40 * q;
  L.push(
    group(
      'lr-hero-img',
      [
        image('lr-img', x.img[0], { x: 0, y: 0, ax: 0, ay: 0, w: iw, h: ih, radius: 2.4 * q }),
      ],
      { x: 53 * q, y: k([T.site + 0.35, 15 * q], [T.site + 1.2, 13 * q, 'outExpo']), w: iw, h: ih, ax: 0, ay: 0, opacity: k([T.site + 0.35, 0], [T.site + 0.8, 1]) },
    ),
    group(
      'lr-stat',
      [
        rect('lr-stat-bg', { x: 0, y: 0, ax: 0, ay: 0, w: 18 * q, h: 9.4 * q, radius: 1.8 * q, fill: ui.card, shadow: { color: ui.shadow, blur: 3 * q, y: 1 * q } }),
        x.body('lr-stat-v', c.stat, { size: 3 * q, x: 2 * q, y: 3.6 * q, ax: 0, align: 'left', weight: 800, fill: ui.accent, counter: countTo(c.stat, T.site + 1.1, 1.2) }),
        x.body('lr-stat-l', c.statLabel, { size: 1.5 * q, x: 2 * q, y: 7 * q, ax: 0, align: 'left', fill: ui.muted }),
      ],
      { x: 49 * q, y: 44 * q, w: 18 * q, h: 9.4 * q, ax: 0, ay: 0.5, scale: k([T.site + 1.0, 0.4], [T.site + 1.5, 1, 'outBack']), opacity: k([T.site + 1.0, 0], [T.site + 1.2, 1]) },
    ),
  );
  // features section (second screen)
  const fy = sh;
  L.push(
    rect('lr-feat-bg', { x: 0, y: fy, ax: 0, ay: 0, w: sw, h: sh * 1.2, fill: ui.app }),
    x.body('lr-feat-k', 'FEATURES', { size: 1.5 * q, x: sw / 2, y: fy + 8 * q, weight: 700, tracking: 0.16, fill: ui.accent }),
    fit(x.title('lr-feat-h', c.featHead, { size: 4 * q, x: sw / 2, y: fy + 13.5 * q, fill: ui.text }), 80 * q),
  );
  const feats: [string, string][] = [
    ['bolt', 'Instant pages'],
    ['globe', 'Global hosting'],
    ['lock', 'Secure checkout'],
  ];
  feats.forEach(([ic, t], i) => {
    const fx = 5 * q + i * 31 * q;
    const tt = T.scroll + 0.5 + i * 0.12;
    L.push(
      group(
        `lr-f${i}`,
        [
          rect(`lr-f${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: 28 * q, h: 30 * q, radius: 2.2 * q, fill: ui.card, stroke: ui.border, strokeWidth: 0.15 * q }),
          rect(`lr-f${i}-t`, { x: 3 * q, y: 3 * q, ax: 0, ay: 0, w: 6 * q, h: 6 * q, radius: 1.6 * q, fill: ui.chip }),
          icon(`lr-f${i}-ic`, ic, { x: 6 * q, y: 6 * q, size: 3.6 * q, color: ui.accent, weight: 2, draw: [tt + 0.2, 0.5] }),
          x.body(`lr-f${i}-h`, t, { size: 2.1 * q, x: 3 * q, y: 13.5 * q, ax: 0, align: 'left', weight: 700, fill: ui.text }),
          rect(`lr-f${i}-l1`, { x: 3 * q, y: 18 * q, ax: 0, w: 21 * q, h: 1.1 * q, radius: 0.55 * q, fill: ui.soft }),
          rect(`lr-f${i}-l2`, { x: 3 * q, y: 21 * q, ax: 0, w: 17 * q, h: 1.1 * q, radius: 0.55 * q, fill: ui.soft }),
          rect(`lr-f${i}-l3`, { x: 3 * q, y: 24 * q, ax: 0, w: 12 * q, h: 1.1 * q, radius: 0.55 * q, fill: ui.soft }),
        ],
        { x: fx, y: k([tt, fy + 24 * q], [tt + 0.7, fy + 20 * q, 'outExpo']), w: 28 * q, h: 30 * q, ax: 0, ay: 0, opacity: k([tt, 0], [tt + 0.3, 1]) },
      ),
    );
  });
  return { layers: L, cta: [hx + b1.pw + 1.6 * q + 8 * q, by] };
}

const laptopReveal: Recipe = {
  id: 'laptop-reveal',
  name: 'Website Reveal',
  category: 'devices',
  tags: ['devices', 'laptop', 'website', 'landing page', 'mockup', 'scroll', 'cursor', 'web'],
  description: 'A laptop rises in, the landing page builds itself, a cursor clicks and the page scrolls to features.',
  duration: 6.2,
  usesLogo: true,
  images: [{ key: 'hero', label: 'Website hero image', art: 'landscape' }],
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Website builder' },
    { key: 'headline', label: 'Headline', default: 'A site that sells while you sleep.', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Launch a fast, beautiful store in an afternoon.', multiline: true },
    { key: 'brand', label: 'Brand', default: 'Northwind' },
    { key: 'badge', label: 'Site badge', default: 'New: 1-click checkout' },
    { key: 'siteHead', label: 'Site headline', default: 'Beautiful stores, built in minutes', multiline: true },
    { key: 'siteSub', label: 'Site sub', default: 'Pick a theme, add products and start selling today.', multiline: true },
    { key: 'siteCta', label: 'Site button', default: 'Start free' },
    { key: 'stat', label: 'Stat', default: '+38%' },
    { key: 'statLabel', label: 'Stat label', default: 'more conversions' },
    { key: 'featHead', label: 'Features title', default: 'Everything you need to launch' },
    { key: 'f1', label: 'Point 1 (story)', default: 'Free custom domain' },
    { key: 'f2', label: 'Point 2 (story)', default: 'Checkout built in' },
    { key: 'f3', label: 'Point 3 (story)', default: 'Live in 60 seconds' },
  ],
  variants: [
    { name: 'Arctic', palette: 'arctic', fonts: 'grotesk', format: 'landscape', logo: 'wave' },
    { name: 'Midnight', palette: 'midnight', fonts: 'space', format: 'square', logo: 'orbit', copy: { eyebrow: 'For studios', headline: 'Your portfolio, upgraded.', sub: 'A studio site that wins the brief before the call.', brand: 'Orbit Studio', badge: 'Now with case studies', siteHead: 'Work that speaks for itself', siteSub: 'Case studies, galleries and a contact form that converts.', siteCta: 'View work', stat: '+212%', statLabel: 'more enquiries', featHead: 'Built for creative teams' } },
    { name: 'Paper', palette: 'paper', fonts: 'serif', format: 'portrait', logo: 'petal', copy: { eyebrow: 'Hospitality', headline: 'Bookings, beautifully handled.', sub: 'A guesthouse site that fills rooms on its own.', brand: 'Maison Fleur', badge: 'Open for spring', siteHead: 'Stay a little longer this season', siteSub: 'Twelve rooms, one garden and breakfast until noon.', siteCta: 'Book a room', stat: '4.9', statLabel: 'guest rating', featHead: 'Everything for a slow weekend' } },
    { name: 'Electric', palette: 'electric', fonts: 'archivo', format: 'story', logo: 'prism', copy: { eyebrow: 'Launch week', headline: 'Ship your landing page today.', sub: 'Templates, forms and analytics. No code required.', brand: 'Voltra', badge: 'Beta is open', siteHead: 'Power tools for tiny teams', siteSub: 'Automate the boring parts and keep the fun ones.', siteCta: 'Join the beta', stat: '3x', statLabel: 'faster launches', featHead: 'Tools that do the heavy lifting', f1: 'Unlimited pages', f2: 'Forms that sync', f3: 'Analytics included' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const T = { laptop: 0.25, site: 0.95, click: 2.55, scroll: 2.65, back: 4.55 };
    const lw = x.pick({ landscape: 104 * u, square: 92 * u, portrait: 96 * u, default: 98 * u });
    const lidW = lw * 0.8;
    const lidH = lidW * 0.64;
    const lh = lidH + lw * 0.045;
    const sw = lidW - lidW * 0.025 * 2;
    const sh = lidH - lidW * 0.025 * 2.4;
    let lcx: number;
    let ltop: number;
    const layers: Layer[] = [];
    if (x.isLandscape) {
      const m = 9 * u;
      lcx = W - m - lw / 2 + 4 * u;
      ltop = H / 2 - lh / 2;
      const tw = lcx - lw / 2 - m - 2 * u;
      layers.push(...heading(x, { eyebrow: c.eyebrow, title: c.headline, sub: c.sub, x: m, y: H / 2, w: tw, size: 8 * u, vAlign: 'center', maxLines: 3, subLines: 3, t0: 0.15 }).layers);
    } else {
      const size = x.pick({ square: 6.4 * u, portrait: 7.6 * u, default: 9.4 * u });
      const opts = { eyebrow: c.eyebrow, title: c.headline, sub: x.isSquare ? undefined : c.sub, x: W / 2, y: 0, w: 84 * u, size, align: 'center' as const, maxLines: x.isSquare ? 1 : 3, subLines: 2, t0: 0.15 };
      const probe = heading(x, opts);
      const gap = x.pick({ square: 7 * u, portrait: 9 * u, default: 10 * u });
      const extra = x.isStory ? 30 * u : 0;
      const total = probe.h + gap + lh + extra;
      const top = (H - total) / 2;
      layers.push(...heading(x, { ...opts, y: top }).layers);
      lcx = W / 2;
      ltop = top + probe.h + gap;
      if (x.isStory) {
        const fy = ltop + lh + 12 * u;
        const feats = [c.f1, c.f2, c.f3];
        feats.forEach((f, i) => {
          const t = 2.9 + i * 0.15;
          const ry = fy + i * 7.4 * u;
          layers.push(
            circle(`lr-sf${i}-bg`, 2.2 * u, { x: 16 * u, y: ry, fill: p.accent, scale: k([t, 0], [t + 0.4, 1, 'outBack']) }),
            icon(`lr-sf${i}-ic`, 'check', { x: 16 * u, y: ry, size: 3 * u, color: p.onAccent, weight: 3, draw: [t + 0.15, 0.35] }),
            x.body(`lr-sf${i}-l`, f, { size: 3.6 * u, x: 21.5 * u, y: ry, ax: 0, align: 'left', weight: 600, fill: p.fg, anim: ta.slide(t + 0.1, { stagger: 0.04 }) }),
          );
        });
      }
    }
    let cta: [number, number] = [0, 0];
    const scrollY = k([T.scroll, 0], [T.scroll + 0.9, -sh, 'inOutCubic'], [T.back, -sh], [T.back + 1.0, 0, 'inOutCubic']);
    const lap = laptop(
      'lr-lap',
      {
        x: lcx,
        y: k([T.laptop, ltop + 30 * u], [T.laptop + 1.2, ltop, 'outExpo']),
        w: lw,
        ax: 0.5,
        ay: 0,
        opacity: k([T.laptop, 0], [T.laptop + 0.4, 1]),
      },
      (sw2, sh2) => {
        const r = siteScreen(x, ui, sw2, sh2, T);
        cta = r.cta;
        return [
          rect('lr-boot', { x: 0, y: 0, ax: 0, ay: 0, w: sw2, h: sh2, fill: ui.card }),
          group('lr-scroll', r.layers, { x: 0, y: scrollY, w: sw2, h: sh2 * 2.2, ax: 0, ay: 0 }),
          rect('lr-off', { x: 0, y: 0, ax: 0, ay: 0, w: sw2, h: sh2, fill: shade(p.bg, -0.9), opacity: k([T.site - 0.4, 1], [T.site, 0, 'outCubic']) }),
        ];
      },
    );
    rim(x, ui, lap, lw);
    const sx0 = lcx - lw / 2 + (lw - lidW) / 2 + lidW * 0.025;
    const sy0 = ltop + lidW * 0.025 * 1.4;
    const cx2 = sx0 + cta[0];
    const cy2 = sy0 + cta[1];
    void sw;
    return {
      background: radial(lcx / W, (ltop + lh * 0.45) / H, 0.85, p.bg2, p.bg),
      layers: [
        glow('lr-glow', { x: lcx, y: ltop + lh * 0.45, r: lw * 0.62, color: p.accent, a: ui.dark ? 0.26 : 0.2 }),
        ...layers,
        lap,
        ...cursor(
          'lr-cur',
          [
            { t: 1.6, x: lcx + lw * 0.38, y: ltop + lh * 0.75 },
            { t: 2.45, x: cx2, y: cy2 },
            { t: 3.6, x: cx2 + 6 * u, y: cy2 - 4 * u, e: 'inOutSine' },
            { t: 5.6, x: cx2 + 3 * u, y: cy2 + 2 * u, e: 'inOutSine' },
          ],
          { size: x.pick({ landscape: 3.6 * u, default: 3.4 * u }), fill: ui.text, stroke: ui.card, ripple: ui.accent, clicks: [T.click], shadow: alpha(shade(p.bg, -0.9), 0.3) },
        ),
      ],
    };
  },
};

// ------------------------------------------------------------------ Phone + Laptop Duo

function boardScreen(x: Ctx, ui: UI, sw: number, sh: number, T: Record<string, number>): Layer[] {
  const { c } = x;
  const q = sw / 100;
  const L: Layer[] = [rect('dd-lap-bg', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: ui.app })];
  // top bar
  L.push(
    rect('dd-top', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: 7 * q, fill: ui.card }),
    rect('dd-top-l', { x: 0, y: 7 * q, ax: 0, ay: 0, w: sw, h: 0.15 * q, fill: ui.line }),
    rect('dd-logo-bg', { x: 3.5 * q, y: 3.5 * q, ax: 0, w: 3.6 * q, h: 3.6 * q, radius: 1 * q, fill: ui.accent }),
    x.logo('dd-logo', { size: 2.2 * q, x: 5.3 * q, y: 3.5 * q, color: ui.onAccent }),
    fit(x.body('dd-board', c.board, { size: 2.1 * q, x: 9 * q, y: 3.5 * q, ax: 0, align: 'left', weight: 700, fill: ui.text }), 40 * q),
  );
  [0, 1, 2].forEach((i) =>
    L.push(circle(`dd-av${i}`, 1.7 * q, { x: 88 * q + i * 2.6 * q, y: 3.5 * q, fill: [ui.accent, ui.accent2, ui.muted][i], stroke: ui.card, strokeWidth: 0.35 * q })),
  );
  const cols = [c.col1, c.col2, c.col3];
  const colW = 29.5 * q;
  const tasks = [
    [c.task1, 'Design'],
    [c.task2, 'Copy'],
    [c.task3, 'Dev'],
    [c.task4, 'Design'],
    [c.task5, 'QA'],
  ];
  // column layout: todo: 0,1 ; doing: 2,3 ; done: 4 (+3 moves here at sync)
  const place: [number, number][] = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 0],
  ];
  cols.forEach((name, ci) => {
    const cx0 = 3.5 * q + ci * (colW + 2.5 * q);
    const t = T.ui + ci * 0.1;
    L.push(
      group(
        `dd-col${ci}`,
        [
          rect(`dd-col${ci}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: colW, h: sh - 11 * q, radius: 1.6 * q, fill: ui.soft }),
          circle(`dd-col${ci}-d`, 0.8 * q, { x: 2.6 * q, y: 3.6 * q, fill: [ui.muted, ui.accent2, ui.accent][ci] }),
          fit(x.body(`dd-col${ci}-n`, name, { size: 1.8 * q, x: 4.4 * q, y: 3.6 * q, ax: 0, align: 'left', weight: 700, fill: ui.text }), colW - 9 * q),
        ],
        { x: cx0, y: 10 * q, w: colW, h: sh - 11 * q, ax: 0, ay: 0, opacity: k([t, 0], [t + 0.4, 1]) },
      ),
    );
  });
  const cardH = 10.5 * q;
  const posOf = (col: number, row: number): [number, number] => [3.5 * q + col * (colW + 2.5 * q) + 1.5 * q, 10 * q + 7 * q + row * (cardH + 1.8 * q)];
  tasks.forEach(([name, tag], i) => {
    const [col, row] = place[i];
    const [px, py] = posOf(col, row);
    const t = T.ui + 0.25 + i * 0.07;
    const moving = i === 3;
    const [tx, ty] = posOf(2, 1);
    const kids: Layer[] = [
      rect(`dd-c${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: colW - 3 * q, h: cardH, radius: 1.3 * q, fill: ui.card, stroke: moving ? k<string>([T.sync + 0.1, ui.border], [T.sync + 0.3, ui.accent], [T.sync + 1.3, ui.accent], [T.sync + 1.7, ui.border]) : ui.border, strokeWidth: moving ? 0.35 * q : 0.15 * q, shadow: { color: alpha(ui.shadow, 0.5), blur: 1.2 * q, y: 0.4 * q } }),
      pill(x, `dd-c${i}-tag`, tag, { x: 2 * q, y: 3 * q, ax: 0, size: 1.3 * q, h: 2.6 * q, fill: ui.chip, color: ui.accent, weight: 700, padX: 0.8 }),
      fit(x.body(`dd-c${i}-t`, name, { size: 1.75 * q, x: 2 * q, y: 7 * q, ax: 0, align: 'left', weight: 600, fill: ui.text }), colW - 7 * q),
    ];
    if (i === 4 || moving)
      kids.push(
        circle(`dd-c${i}-ok`, 1.1 * q, { x: colW - 5.2 * q, y: 3 * q, fill: ui.accent, ...(moving ? { scale: k([T.sync + 0.9, 0], [T.sync + 1.3, 1, 'outBack']) } : {}) }),
        icon(`dd-c${i}-okc`, 'check', { x: colW - 5.2 * q, y: 3 * q, size: 1.6 * q, color: ui.onAccent, weight: 3.4, ...(moving ? { opacity: k([T.sync + 1.0, 0], [T.sync + 1.2, 1]) } : {}) }),
      );
    L.push(
      group(`dd-c${i}`, kids, {
        x: moving ? k([T.sync + 0.25, px], [T.sync + 1.05, tx, 'inOutCubic']) : px,
        y: moving ? k([t, py + 2 * q], [t + 0.6, py, 'outExpo'], [T.sync + 0.25, py], [T.sync + 1.05, ty, 'inOutCubic']) : k([t, py + 2 * q], [t + 0.6, py, 'outExpo']),
        w: colW - 3 * q,
        h: cardH,
        ax: 0,
        ay: 0,
        opacity: k([t, 0], [t + 0.35, 1]),
        ...(moving ? { scale: k([T.sync + 0.2, 1], [T.sync + 0.5, 1.06, 'outCubic'], [T.sync + 1.05, 1, 'inOutCubic']) } : {}),
      }),
    );
  });
  return L;
}

function listScreen(x: Ctx, ui: UI, sw: number, sh: number, T: Record<string, number>): Layer[] {
  const { c } = x;
  const q = sw / 100;
  const L: Layer[] = [rect('dd-ph-bg', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: ui.app }), ...statusBar('dd-sb', x, sw, ui.text)];
  L.push(
    x.body('dd-ph-k', 'TODAY', { size: 2.6 * q, x: 7 * q, y: 19 * q, ax: 0, align: 'left', weight: 700, tracking: 0.12, fill: ui.accent }),
    fit(x.title('dd-ph-h', c.board, { size: 6.4 * q, x: 7 * q, y: 26.5 * q, ax: 0, align: 'left', fill: ui.text }), 86 * q),
    x.body('dd-ph-p', '3 of 5 done', { size: 2.7 * q, x: 7 * q, y: 33.5 * q, ax: 0, align: 'left', fill: ui.muted }),
  );
  const tasks = [c.task1, c.task2, c.task3, c.task4, c.task5];
  tasks.forEach((t, i) => {
    const ry = 42 * q + i * 15 * q;
    const at = i === 4 ? 0.1 : i === 3 ? T.sync : 99;
    L.push(
      group(
        `dd-pr${i}`,
        [
          rect(`dd-pr${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: 86 * q, h: 12.4 * q, radius: 3 * q, fill: ui.card, stroke: ui.border, strokeWidth: 0.25 * q }),
          checkbox(`dd-pr${i}-ck`, { x: 4 * q, y: 6.2 * q, size: 5 * q, at, ui, round: true }),
          fit(x.body(`dd-pr${i}-l`, t, { size: 3.1 * q, x: 12.5 * q, y: 6.2 * q, ax: 0, align: 'left', weight: 600, fill: i === 4 ? ui.muted : i === 3 ? k<string>([T.sync, ui.text], [T.sync + 0.3, ui.muted]) : ui.text }), 68 * q),
        ],
        { x: 7 * q, ...fadeUp(T.ui + 0.4 + i * 0.07, ry, 3 * q), w: 86 * q, h: 12.4 * q, ax: 0, ay: 0 },
      ),
    );
  });
  L.push(
    circle('dd-fab', 7 * q, { x: 82 * q, y: sh - 16 * q, fill: ui.accent, shadow: { color: alpha(ui.accent, 0.4), blur: 3 * q, y: 1.2 * q }, scale: k([T.ui + 0.8, 0], [T.ui + 1.2, 1, 'outBack']) }),
    icon('dd-fab-ic', 'plus', { x: 82 * q, y: sh - 16 * q, size: 5.4 * q, color: ui.onAccent, weight: 2.4, scale: k([T.ui + 0.8, 0], [T.ui + 1.2, 1, 'outBack']) }),
    homeBar('dd-home', sw, sh, ui.text),
  );
  return L;
}

const deviceDuo: Recipe = {
  id: 'device-duo',
  name: 'Phone + Laptop Sync',
  category: 'devices',
  tags: ['devices', 'phone', 'laptop', 'sync', 'productivity', 'saas', 'responsive', 'mockup'],
  description: 'Laptop and phone side by side: tick a task on the phone and it glides to Done on the desktop.',
  duration: 6,
  usesLogo: true,
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Desktop + mobile' },
    { key: 'headline', label: 'Headline', default: 'One plan. Every screen.', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Check it off anywhere — it’s done everywhere.', multiline: true },
    { key: 'board', label: 'Board name', default: 'Spring launch' },
    { key: 'col1', label: 'Column 1', default: 'To do' },
    { key: 'col2', label: 'Column 2', default: 'In progress' },
    { key: 'col3', label: 'Column 3', default: 'Done' },
    { key: 'task1', label: 'Task 1', default: 'Pricing page' },
    { key: 'task2', label: 'Task 2', default: 'Launch email' },
    { key: 'task3', label: 'Task 3', default: 'Onboarding flow' },
    { key: 'task4', label: 'Task 4 (gets done)', default: 'App store shots' },
    { key: 'task5', label: 'Task 5', default: 'Beta feedback' },
    { key: 'synced', label: 'Sync label', default: 'Synced' },
  ],
  variants: [
    { name: 'Cobalt', palette: 'cobalt', fonts: 'sora', format: 'landscape', logo: 'stack' },
    { name: 'Graphite', palette: 'graphite', fonts: 'manrope', format: 'portrait', logo: 'knot', copy: { eyebrow: 'Works offline', headline: 'Your sprint, in your pocket.', sub: 'Plan on desktop. Ship from anywhere.', board: 'Sprint 24', task1: 'Auth refactor', task2: 'Billing webhooks', task3: 'Search filters', task4: 'Crash on resume', task5: 'Dark mode QA' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'fraunces', format: 'square', logo: 'petal', copy: { eyebrow: 'For small teams', headline: 'Plans that follow you.', board: 'Wedding plan', col1: 'Ideas', col2: 'Booking', col3: 'Sorted', task1: 'Flower wall', task2: 'Playlist', task3: 'Seating chart', task4: 'Venue deposit', task5: 'Invitations' } },
    { name: 'Azure', palette: 'azure', fonts: 'outfit', format: 'story', logo: 'orbit', copy: { eyebrow: 'Always in sync', headline: 'Start on desktop. Finish anywhere.', board: 'Q3 roadmap', task1: 'Team offsite', task2: 'Hiring plan', task3: 'Partner deck', task4: 'Budget review', task5: 'OKR draft' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const T = { laptop: 0.25, phone: 0.75, ui: 0.95, sync: 2.9 };
    const lw = x.pick({ landscape: 96 * u, square: 76 * u, portrait: 80 * u, default: 90 * u });
    const lidW = lw * 0.8;
    const lidH = lidW * 0.64;
    const lh = lidH + lw * 0.045;
    const ph = x.pick({ landscape: 54 * u, square: 46 * u, portrait: 52 * u, default: 74 * u });
    const pw = ph * 0.49;
    const drop = lidH * 0.56;
    const devH = Math.max(lh, drop + ph);
    let lcx: number;
    let ltop: number;
    let pcx: number;
    const layers: Layer[] = [];
    if (x.isLandscape) {
      const m = 9 * u;
      pcx = W - m - pw / 2;
      lcx = pcx - pw / 2 + 7 * u - lw / 2;
      ltop = H / 2 - devH / 2;
      const tw = lcx - lw / 2 - m - 5 * u;
      layers.push(...heading(x, { eyebrow: c.eyebrow, title: c.headline, sub: c.sub, x: m, y: H / 2, w: tw, size: 7.6 * u, vAlign: 'center', maxLines: 3, subLines: 3, t0: 0.15 }).layers);
    } else {
      const size = x.pick({ square: 6.4 * u, portrait: 7.6 * u, default: 9.4 * u });
      const opts = { eyebrow: c.eyebrow, title: c.headline, sub: x.isSquare ? undefined : c.sub, x: W / 2, y: 0, w: 84 * u, size, align: 'center' as const, maxLines: x.isSquare ? 1 : 3, subLines: 2, t0: 0.15 };
      const probe = heading(x, opts);
      const gap = x.pick({ square: 6 * u, portrait: 7 * u, default: 10 * u });
      const total = probe.h + gap + devH;
      const top = (H - total) / 2;
      layers.push(...heading(x, { ...opts, y: top }).layers);
      lcx = Math.max(lw / 2 + 4 * u, W / 2 - x.pick({ square: 8 * u, portrait: 7 * u, default: 6 * u }));
      ltop = top + probe.h + gap;
      pcx = Math.min(W - 5 * u - pw / 2, lcx + lidW / 2 + pw * 0.1);
    }
    const pcy = ltop + drop + ph / 2;
    const lap = laptop('dd-lap', { x: lcx, y: k([T.laptop, ltop + 30 * u], [T.laptop + 1.2, ltop, 'outExpo']), w: lw, ax: 0.5, ay: 0, opacity: k([T.laptop, 0], [T.laptop + 0.4, 1]) }, (sw, sh) => boardScreen(x, ui, sw, sh, T));
    rim(x, ui, lap, lw);
    const fone = phone(
      'dd-phone',
      {
        x: k([T.phone, pcx + 24 * u], [T.phone + 1.1, pcx, 'outExpo']),
        y: pcy,
        h: ph,
        body: bodyFor(x, ui),
        rotation: k([T.phone, 8], [T.phone + 1.2, 0, 'outBack']),
        opacity: k([T.phone, 0], [T.phone + 0.35, 1]),
      },
      (sw, sh) => listScreen(x, ui, sw, sh, T),
    );
    // tap on the phone checkbox (task 4)
    const sq = (ph * 0.446) / 100;
    const tapX = pcx - pw / 2 + ph * 0.022 + (7 + 4 + 2.5) * sq;
    const tapY = pcy - ph / 2 + ph * 0.022 + (42 + 3 * 15 + 6.2) * sq;
    // sync chip between devices
    const chip = pill(x, 'dd-sync', c.synced, {
      x: x.isLandscape ? pcx : pcx - pw / 2 - 2.5 * u,
      y: x.isLandscape ? pcy - ph / 2 - 5.5 * u : pcy - ph * 0.26,
      ax: x.isLandscape ? 0.5 : 1,
      size: 2.5 * u,
      h: 6 * u,
      fill: ui.text,
      color: ui.dark ? ui.app : ui.card,
      weight: 700,
      padX: 1.56,
      opacity: k([T.sync + 0.35, 0], [T.sync + 0.55, 1]),
      scale: k([T.sync + 0.35, 0.5], [T.sync + 0.85, 1, 'outBack']),
    });
    chip.children.push(icon('dd-sync-ic', 'check', { x: 3.4 * u, y: chip.ph / 2, size: 2.4 * u, color: ui.dark ? ui.app : ui.card, weight: 3, draw: [T.sync + 0.6, 0.4] }));
    (chip.children[1] as { x: number }).x = chip.pw / 2 + 1.7 * u;
    return {
      background: radial(0.6, 0.55, 0.85, p.bg2, p.bg),
      layers: [
        glow('dd-glow', { x: lcx, y: ltop + lh / 2, r: lw * 0.6, color: p.accent, a: ui.dark ? 0.24 : 0.2 }),
        ...layers,
        lap,
        fone,
        chip,
        ...cursor(
          'dd-tap',
          [
            { t: 2.2, x: tapX + 7 * u, y: tapY + 9 * u },
            { t: 2.8, x: tapX, y: tapY },
            { t: 3.8, x: tapX + 3 * u, y: tapY + 5 * u, e: 'inOutSine' },
          ],
          { size: 3.4 * u, fill: ui.text, stroke: ui.card, ripple: ui.accent, clicks: [T.sync - 0.02], shadow: alpha(shade(p.bg, -0.9), 0.3) },
        ),
      ],
    };
  },
};

// ------------------------------------------------------------------ Three Phones Fan

function feedScreen(x: Ctx, ui: UI, sw: number, sh: number, t0: number): Layer[] {
  const { c, p } = x;
  const q = sw / 100;
  const ink = lightInk(x, ui);
  return [
    rect('pf-a-bg', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: ui.app }),
    ...statusBar('pf-a-sb', x, sw, ui.text),
    fit(x.title('pf-a-h', c.s1, { size: 7.4 * q, x: 7 * q, y: 22 * q, ax: 0, align: 'left', fill: ui.text }), 70 * q),
    circle('pf-a-av', 4.6 * q, { x: 88 * q, y: 22 * q, fill: linear(45, ui.accent2, ui.accent) }),
    rect('pf-a-search', { x: 7 * q, y: 32 * q, ax: 0, ay: 0, w: 86 * q, h: 10 * q, radius: 5 * q, fill: ui.card, stroke: ui.border, strokeWidth: 0.3 * q }),
    icon('pf-a-si', 'search', { x: 13 * q, y: 37 * q, size: 4 * q, color: ui.muted, weight: 2 }),
    x.body('pf-a-sl', 'Search places', { size: 3 * q, x: 18 * q, y: 37 * q, ax: 0, align: 'left', fill: ui.muted }),
    group(
      'pf-a-hero',
      [
        image('pf-a-img', x.img[0], { x: 0, y: 0, ax: 0, ay: 0, w: 86 * q, h: 92 * q, radius: 5 * q }),
        rect('pf-a-grad', { x: 0, y: 0, ax: 0, ay: 0, w: 86 * q, h: 92 * q, radius: 5 * q, fill: { kind: 'linear', angle: 90, stops: [{ o: 0.45, c: alpha(shade(p.bg, -0.9), 0) }, { o: 1, c: alpha(shade(p.bg, -0.9), 0.65) }] } }),
        pill(x, 'pf-a-chip', c.tag, { x: 5 * q, y: 8 * q, ax: 0, size: 2.6 * q, h: 6 * q, fill: alpha(ink, 0.92), color: ui.dark ? p.bg : ui.text, weight: 700 }),
        fit(x.title('pf-a-t', c.place, { size: 6.4 * q, x: 5 * q, y: 74 * q, ax: 0, align: 'left', fill: ink }), 76 * q),
        x.body('pf-a-s', c.placeSub, { size: 3 * q, x: 5 * q, y: 82 * q, ax: 0, align: 'left', fill: alpha(ink, 0.8) }),
        circle('pf-a-heart-bg', 5 * q, { x: 76 * q, y: 11 * q, fill: alpha(ink, 0.9) }),
        icon('pf-a-heart', 'heart', { x: 76 * q, y: 11.3 * q, size: 5 * q, color: ui.accent, weight: 2, fill: k<string>([t0 + 1.6, alpha(ui.accent, 0)], [t0 + 1.8, ui.accent]), scale: k([t0 + 1.55, 1], [t0 + 1.7, 0.7], [t0 + 2.1, 1, 'outBack']) }),
      ],
      { x: 7 * q, y: k([t0 + 0.2, 52 * q], [t0 + 1, 47 * q, 'outExpo']), w: 86 * q, h: 92 * q, ax: 0, ay: 0, opacity: k([t0 + 0.2, 0], [t0 + 0.6, 1]) },
    ),
    x.body('pf-a-sec', 'Nearby', { size: 3.6 * q, x: 7 * q, y: 148 * q, ax: 0, align: 'left', weight: 700, fill: ui.text }),
    ...[0, 1].map((i) =>
      group(
        `pf-a-sm${i}`,
        [
          image(`pf-a-sm${i}-img`, x.img[i === 0 ? 1 : 0], { x: 0, y: 0, ax: 0, ay: 0, w: 41 * q, h: 30 * q, radius: 3.6 * q }),
          x.body(`pf-a-sm${i}-t`, i === 0 ? 'Old town' : 'Harbour', { size: 3 * q, x: 1 * q, y: 35 * q, ax: 0, align: 'left', weight: 700, fill: ui.text }),
          x.body(`pf-a-sm${i}-s`, i === 0 ? '1.2 km' : '3.4 km', { size: 2.6 * q, x: 1 * q, y: 40 * q, ax: 0, align: 'left', fill: ui.muted }),
        ],
        { x: 7 * q + i * 45 * q, y: k([t0 + 0.4 + i * 0.1, 158 * q], [t0 + 1.1 + i * 0.1, 154 * q, 'outExpo']), w: 41 * q, h: 42 * q, ax: 0, ay: 0, opacity: k([t0 + 0.4 + i * 0.1, 0], [t0 + 0.8 + i * 0.1, 1]) },
      ),
    ),
    ...tabBar(x, ui, 'pf-a-tab', sw, sh, ['globe', 'search', 'heart', 'user']),
  ];
}

function onboardScreen(x: Ctx, ui: UI, sw: number, sh: number, t0: number): Layer[] {
  const { c } = x;
  const q = sw / 100;
  const tl = balance(fit(x.title('pf-b-h', c.s2, { size: 7.6 * q, x: sw / 2, y: 128 * q, w: 84 * q, ay: 0, fill: ui.text, lineHeight: 1.05 }), 84 * q, 2), 84 * q);
  return [
    rect('pf-b-bg', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: ui.app }),
    group(
      'pf-b-art',
      [
        image('pf-b-img', x.img[1], { x: 0, y: 0, ax: 0, ay: 0, w: 86 * q, h: 106 * q, radius: 6 * q }),
      ],
      { x: 7 * q, y: 14 * q, w: 86 * q, h: 106 * q, ax: 0, ay: 0, scale: k([t0, 1.08], [t0 + 1.4, 1, 'outExpo']) },
    ),
    ...statusBar('pf-b-sb', x, sw, lightInk(x, ui)),
    tl,
    x.body('pf-b-s', c.s2sub, { size: 3.2 * q, x: sw / 2, y: 154 * q, w: 78 * q, ay: 0, fill: ui.muted, lineHeight: 1.4 }),
    ...[0, 1, 2].map((i) => rect(`pf-b-dot${i}`, { x: sw / 2 + (i - 1) * 4 * q + (i === 0 ? -1.5 * q : i === 2 ? 1.5 * q : 0), y: 174 * q, w: i === 1 ? 6 * q : 1.8 * q, h: 1.8 * q, radius: 0.9 * q, fill: i === 1 ? ui.accent : ui.off })),
    rect('pf-b-btn', { x: sw / 2, y: 186 * q, w: 86 * q, h: 12 * q, radius: 6 * q, fill: ui.accent }),
    x.body('pf-b-btn-l', c.s2cta, { size: 3.4 * q, x: sw / 2, y: 186 * q, weight: 700, fill: ui.onAccent }),
    homeBar('pf-b-home', sw, sh, ui.text),
  ];
}

function statsScreen(x: Ctx, ui: UI, sw: number, sh: number, t0: number): Layer[] {
  const { c } = x;
  const q = sw / 100;
  const ring = 44 * q;
  const stats: [string, string][] = [
    ['24', 'Trips'],
    ['61', 'Cities'],
    ['9', 'Countries'],
  ];
  return [
    rect('pf-c-bg', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: sh, fill: ui.app }),
    ...statusBar('pf-c-sb', x, sw, ui.text),
    image('pf-c-av', x.img[2], { x: sw / 2, y: 33 * q, w: 22 * q, h: 22 * q, radius: 11 * q }),
    circle('pf-c-av-ring', 12.6 * q, { x: sw / 2, y: 33 * q, stroke: ui.accent, strokeWidth: 0.7 * q, arcEnd: k([t0 + 0.3, 0], [t0 + 1.2, 1, 'inOutCubic']) }),
    fit(x.title('pf-c-name', c.s3, { size: 5.6 * q, x: sw / 2, y: 52 * q, fill: ui.text }), 84 * q),
    x.body('pf-c-sub', c.s3sub, { size: 2.9 * q, x: sw / 2, y: 58.5 * q, fill: ui.muted }),
    rect('pf-c-statbg', { x: 7 * q, y: 66 * q, ax: 0, ay: 0, w: 86 * q, h: 20 * q, radius: 4 * q, fill: ui.card, stroke: ui.border, strokeWidth: 0.3 * q }),
    ...stats.flatMap(([v, l], i) => [
      x.body(`pf-c-sv${i}`, v, { size: 5 * q, x: 7 * q + 86 * q * ((i + 0.5) / 3), y: 73.5 * q, weight: 700, fill: ui.text, counter: { from: 0, to: +v, start: t0 + 0.4, dur: 1.4 } }),
      x.body(`pf-c-sl${i}`, l, { size: 2.6 * q, x: 7 * q + 86 * q * ((i + 0.5) / 3), y: 80 * q, fill: ui.muted }),
    ]),
    rect('pf-c-goal', { x: 7 * q, y: 92 * q, ax: 0, ay: 0, w: 86 * q, h: 70 * q, radius: 4 * q, fill: ui.card, stroke: ui.border, strokeWidth: 0.3 * q }),
    x.body('pf-c-gt', 'Yearly goal', { size: 3.2 * q, x: 13 * q, y: 100 * q, ax: 0, align: 'left', weight: 700, fill: ui.text }),
    circle('pf-c-track', ring / 2, { x: sw / 2, y: 128 * q, stroke: ui.soft, strokeWidth: 4 * q }),
    circle('pf-c-arc', ring / 2, { x: sw / 2, y: 128 * q, stroke: ui.accent, strokeWidth: 4 * q, arcEnd: k([t0 + 0.4, 0], [t0 + 1.8, 0.72, 'inOutCubic']) }),
    x.body('pf-c-pct', '72%', { size: 7 * q, x: sw / 2, y: 128 * q, weight: 700, fill: ui.text, counter: { from: 0, to: 72, start: t0 + 0.4, dur: 1.4, ease: 'inOutCubic', suffix: '%' } }),
    x.body('pf-c-gl', '18 of 25 trips', { size: 2.6 * q, x: sw / 2, y: 154 * q, fill: ui.muted }),
    ...tabBar(x, ui, 'pf-c-tab', sw, sh, ['globe', 'search', 'heart', 'user'], 3),
  ];
}

const phoneFan: Recipe = {
  id: 'phone-fan',
  name: 'Three Phones Fan',
  category: 'devices',
  tags: ['devices', 'phone', 'app', 'screens', 'mockup', 'launch', 'travel', 'new'],
  description: 'Three phones fan out from a stack, each showing a different screen of your app.',
  duration: 5.6,
  images: [
    { key: 'hero', label: 'Feed photo', art: 'landscape' },
    { key: 'second', label: 'Onboarding photo', art: 'city' },
    { key: 'avatar', label: 'Profile photo', art: 'portrait' },
  ],
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Meet the app' },
    { key: 'headline', label: 'Headline', default: 'Plan less. Travel more.', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Trips, tickets and friends in one place.', multiline: true },
    { key: 's1', label: 'Screen 1 title', default: 'Discover' },
    { key: 'tag', label: 'Photo tag', default: 'Trending' },
    { key: 'place', label: 'Place', default: 'Coastal Escape' },
    { key: 'placeSub', label: 'Place detail', default: '3 nights · from $420' },
    { key: 's2', label: 'Screen 2 title', default: 'Plan trips together', multiline: true },
    { key: 's2sub', label: 'Screen 2 text', default: 'Invite friends, vote on plans, split costs.', multiline: true },
    { key: 's2cta', label: 'Screen 2 button', default: 'Get started' },
    { key: 's3', label: 'Profile name', default: 'Maya Rossi' },
    { key: 's3sub', label: 'Profile detail', default: 'Explorer since 2021' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'grotesk', format: 'square' },
    { name: 'Midnight', palette: 'midnight', fonts: 'syne', format: 'landscape', copy: { eyebrow: 'Version 2.0', headline: 'Every trip, beautifully planned.', tag: 'Editor’s pick', place: 'Northern Lights', placeSub: '5 nights · from $890' } },
    { name: 'Citrus', palette: 'citrus', fonts: 'archivo', format: 'story', copy: { eyebrow: 'Out now', headline: 'Your city, unlocked.', sub: 'Hidden spots, live events and friends nearby.', s1: 'Tonight', tag: 'Live now', place: 'Rooftop Sessions', placeSub: 'Starts 9 PM · 1.2 km', s2: 'Find your people', s2sub: 'Join plans in your neighbourhood.', s2cta: 'Join free', s3: 'Leo Park', s3sub: 'Night owl · 112 plans' } },
    { name: 'Arctic', palette: 'arctic', fonts: 'poppins', format: 'portrait', copy: { eyebrow: 'Coming soon', headline: 'Weekends, sorted.', sub: 'Book stays, trains and tables in one tap.', tag: 'Weekend deal', place: 'Lakeside Cabin', placeSub: '2 nights · from $260' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const ph = x.pick({ landscape: 66 * u, square: 64 * u, portrait: 70 * u, default: 80 * u });
    const pw = ph * 0.49;
    const spread = x.pick({ landscape: pw * 0.95, square: pw * 0.78, portrait: pw * 0.74, default: pw * 0.64 });
    const rot = x.pick({ landscape: 9, default: 10 });
    let cy: number;
    const layers: Layer[] = [];
    const size = x.pick({ landscape: 6.4 * u, square: 6.4 * u, portrait: 7.6 * u, default: 9.4 * u });
    const showSub = x.isStory || x.isPortrait;
    const opts = { eyebrow: c.eyebrow, title: c.headline, sub: showSub ? c.sub : undefined, x: W / 2, y: 0, w: x.isLandscape ? 140 * u : 84 * u, size, align: 'center' as const, maxLines: x.isStory ? 2 : 1, subLines: 2, t0: 0.15 };
    const probe = heading(x, opts);
    const gap = x.pick({ landscape: 6 * u, square: 6 * u, portrait: 8 * u, default: 12 * u });
    const fanH = ph * 1.04;
    const total = probe.h + gap + fanH;
    const top = (H - total) / 2;
    layers.push(...heading(x, { ...opts, y: top }).layers);
    cy = top + probe.h + gap + fanH / 2;
    const T0 = 0.35;
    const T1 = 1.15;
    const mk = (id: string, i: number, scr: (sw: number, sh: number) => Layer[]) => {
      const side = i - 1;
      const s = side === 0 ? 1 : 0.88;
      return phone(id, {
        x: k([T0, W / 2], [T1, W / 2], [T1 + 0.9, W / 2 + side * spread, 'outExpo']),
        y: k([T0, cy + 40 * u], [T1 - 0.05, cy + (side ? 3 * u : 0), 'outExpo'], [T1 + 0.9, cy + (side ? ph * 0.04 : 0), 'outExpo']),
        h: ph,
        body: bodyFor(x, ui),
        scale: s,
        rotation: k([T1, 0], [T1 + 0.9, side * rot, 'outBack']),
        opacity: k([T0, 0], [T0 + 0.3, 1]),
      }, scr);
    };
    const left = mk('pf-left', 0, (sw, sh) => onboardScreen(x, ui, sw, sh, T1));
    const right = mk('pf-right', 2, (sw, sh) => statsScreen(x, ui, sw, sh, T1 + 0.2));
    const mid = mk('pf-mid', 1, (sw, sh) => feedScreen(x, ui, sw, sh, T1 - 0.4));
    return {
      background: radial(0.5, cy / H, 0.8, p.bg2, p.bg),
      layers: [
        glow('pf-glow', { x: W / 2, y: cy, r: ph * 0.9, color: x.isLandscape || ui.vivid ? p.accent2 : p.accent, a: ui.vivid ? 0.28 : 0.24, scale: k([0.3, 0.4], [1.8, 1, 'outExpo']) }),
        ...layers,
        left,
        right,
        mid,
      ],
    };
  },
};

export const recipes: Recipe[] = [phoneShowcase, laptopReveal, deviceDuo, phoneFan];
