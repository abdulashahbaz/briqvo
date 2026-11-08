/** Category: product — feature spotlight, dashboard reveal, launch hero, changelog. */
import type { Layer } from '../../../engine/types';
import { type Recipe, type Ctx, k, rect, circle, group, radial, alpha, shade, ta, image, path, browser, starPath } from '../../kit';
import { uiTheme, heading, balance, toggle, checkbox, cursor, icon, pill, glow, fit, textW, textLines as textLinesOf, countTo, smooth, areaPath, chartPts, delta, stack, stackH, type UI } from './ui';

/** Staggered appear for UI parts: fade + small rise. */
function part(t: number, dy: number) {
  return { opacity: k([t, 0], [t + 0.45, 1, 'outCubic']), dy: k([t, dy], [t + 0.6, 0, 'outExpo']) };
}

function bgFor(x: Ctx, cxr = 0.5, cyr = 0.45) {
  return radial(cxr, cyr, 0.9, x.p.bg2, x.p.bg);
}

// ------------------------------------------------------------------ Feature Spotlight

function spotlightCard(x: Ctx, ui: UI, q: number, cw: number, ch: number, T: Record<string, number>): Layer[] {
  const { c } = x;
  const P = 6 * q;
  const L: Layer[] = [];
  const mk = (id: string, t: number, children: Layer[], y: number, h: number) => {
    const a = part(t, 2.5 * q);
    return group(id, children, { x: 0, y: a.dy.map((f) => ({ ...f, v: f.v + y })), w: cw, h, ax: 0, ay: 0, opacity: a.opacity });
  };
  L.push(
    rect('fs-card', { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: ch, radius: 4.2 * q, fill: ui.card, stroke: ui.border, strokeWidth: 0.3 * q, shadow: { color: ui.shadow, blur: 7 * q, y: 2.5 * q } }),
  );
  // header
  const tile = 10 * q;
  const draft = pill(x, 'fs-draft', 'Draft', { x: cw - P, y: tile / 2, ax: 1, size: 2.7 * q, h: 5.6 * q, fill: ui.soft, color: ui.muted, weight: 600, opacity: k([T.publish + 0.05, 1], [T.publish + 0.25, 0]) });
  const live = pill(x, 'fs-live', 'Live', { x: cw - P, y: tile / 2, ax: 1, size: 2.7 * q, h: 5.6 * q, fill: ui.chip, color: ui.accent, weight: 700, padX: 1.9, opacity: k([T.publish + 0.1, 0], [T.publish + 0.35, 1]), scale: k([T.publish + 0.1, 0.6], [T.publish + 0.6, 1, 'outBack']) });
  live.children.push(
    circle('fs-live-dot', 0.75 * q, { x: 2.4 * q, y: live.ph / 2, fill: ui.accent }),
  );
  L.push(
    mk(
      'fs-head',
      T.card + 0.25,
      [
        rect('fs-tile', { x: P, y: 0, ax: 0, ay: 0, w: tile, h: tile, radius: 2.8 * q, fill: ui.accent }),
        x.logo('fs-logo', { size: tile * 0.56, x: P + tile / 2, y: tile / 2, color: ui.onAccent }),
        fit(x.body('fs-panel', c.panel, { size: 4.1 * q, x: P + tile + 3.4 * q, y: tile * 0.3, ax: 0, align: 'left', weight: 700, fill: ui.text }), cw - P * 2 - tile - 22 * q),
        x.body('fs-panel-sub', c.panelSub, { size: 2.9 * q, x: P + tile + 3.4 * q, y: tile * 0.78, ax: 0, align: 'left', fill: ui.muted }),
        draft,
        live,
      ],
      P,
      tile,
    ),
  );
  L.push(rect('fs-div1', { x: P, y: 20.5 * q, ax: 0, w: cw - P * 2, h: 0.25 * q, fill: ui.line, opacity: k([T.card + 0.3, 0], [T.card + 0.7, 1]) }));
  // toggle rows
  const rowIcons = ['bell', 'globe'];
  [c.opt1, c.opt2].forEach((label, i) => {
    const y = 27.5 * q + i * 11 * q;
    L.push(
      mk(
        `fs-opt${i}`,
        T.card + 0.35 + i * 0.08,
        [
          circle(`fs-opt${i}-ic-bg`, 3.6 * q, { x: P + 3.6 * q, y: 4 * q, fill: ui.chip }),
          icon(`fs-opt${i}-ic`, rowIcons[i], { x: P + 3.6 * q, y: 4 * q, size: 4.1 * q, color: ui.accent, weight: 2 }),
          fit(x.body(`fs-opt${i}-l`, label, { size: 3.4 * q, x: P + 10.4 * q, y: 4 * q, ax: 0, align: 'left', weight: 600, fill: ui.text }), cw - P * 2 - 24 * q),
          toggle(`fs-tg${i}`, { x: cw - P, y: 4 * q, h: 5.6 * q, at: i === 0 ? T.tg1 : T.tg2, ui }),
        ],
        y - 4 * q,
        8 * q,
      ),
    );
  });
  L.push(rect('fs-div2', { x: P, y: 45 * q, ax: 0, w: cw - P * 2, h: 0.25 * q, fill: ui.line, opacity: k([T.card + 0.45, 0], [T.card + 0.85, 1]) }));
  // checklist
  const prog = (cw - P * 2) * 0.42;
  const checks = [T.ck1, T.ck2, T.ck3];
  L.push(
    mk(
      'fs-cl',
      T.card + 0.5,
      [
        x.body('fs-cl-l', c.listLabel, { size: 2.5 * q, x: P, y: 2 * q, ax: 0, align: 'left', weight: 700, uppercase: true, tracking: 0.12, fill: ui.muted }),
        rect('fs-prog-bg', { x: cw - P - 7 * q, y: 2 * q, ax: 1, w: prog, h: 1.3 * q, radius: 0.65 * q, fill: ui.soft }),
        rect('fs-prog', {
          x: cw - P - 7 * q - prog,
          y: 2 * q,
          ax: 0,
          w: k([checks[0], 0], [checks[0] + 0.4, prog / 3, 'outCubic'], [checks[1], prog / 3], [checks[1] + 0.4, (prog * 2) / 3, 'outCubic'], [checks[2], (prog * 2) / 3], [checks[2] + 0.4, prog, 'outCubic']),
          h: 1.3 * q,
          radius: 0.65 * q,
          fill: ui.accent,
        }),
        x.body('fs-count', '3/3', {
          size: 2.7 * q,
          x: cw - P,
          y: 2 * q,
          ax: 1,
          align: 'right',
          weight: 700,
          fill: ui.text,
          counter: { from: 0, to: 3, start: checks[0] - 0.125, dur: 0.75, ease: 'linear', suffix: '/3' },
        }),
      ],
      48 * q,
      4 * q,
    ),
  );
  [c.task1, c.task2, c.task3].forEach((label, i) => {
    const y = 57.5 * q + i * 8 * q;
    L.push(
      mk(
        `fs-task${i}`,
        T.card + 0.55 + i * 0.07,
        [
          checkbox(`fs-ck${i}`, { x: P, y: 3 * q, size: 4.6 * q, at: checks[i], ui }),
          fit(x.body(`fs-task${i}-l`, label, { size: 3.2 * q, x: P + 7.6 * q, y: 3 * q, ax: 0, align: 'left', weight: 500, fill: k<string>([checks[i], ui.text], [checks[i] + 0.3, ui.muted]) }), cw - P * 2 - 9 * q),
        ],
        y - 3 * q,
        6 * q,
      ),
    );
  });
  L.push(rect('fs-div3', { x: P, y: 79.5 * q, ax: 0, w: cw - P * 2, h: 0.25 * q, fill: ui.line, opacity: k([T.card + 0.6, 0], [T.card + 1, 1]) }));
  // footer
  const btnH = 7.4 * q;
  const btnLabel = x.body('fs-btn-a', c.cta, { size: 3.1 * q, x: 0, y: 0, weight: 700, fill: ui.onAccent });
  const doneLabel = x.body('fs-btn-b', c.done, { size: 3.1 * q, x: 0, y: 0, weight: 700, fill: ui.onAccent });
  const bw = Math.max(textW(btnLabel), textW(doneLabel) + 5 * q) + 7 * q;
  const by = 86 * q;
  L.push(
    mk(
      'fs-foot',
      T.card + 0.7,
      [
        icon('fs-clock', 'clock', { x: P + 2 * q, y: btnH / 2, size: 3.6 * q, color: ui.muted, weight: 2 }),
        fit(x.body('fs-when', c.when, { size: 2.9 * q, x: P + 5.2 * q, y: btnH / 2, ax: 0, align: 'left', fill: ui.muted }), cw - P * 2 - bw - 9 * q),
        group(
          'fs-btn',
          [
            rect('fs-btn-bg', { x: 0, y: 0, ax: 0, ay: 0, w: bw, h: btnH, radius: btnH / 2, fill: k<string>([T.publish, ui.accent], [T.publish + 0.3, shade(ui.accent, -0.12)]) }),
            Object.assign(btnLabel, { x: bw / 2, y: btnH / 2, opacity: k([T.publish + 0.05, 1], [T.publish + 0.2, 0]) }),
            Object.assign(doneLabel, { x: bw / 2 + 2.3 * q, y: btnH / 2, opacity: k([T.publish + 0.15, 0], [T.publish + 0.35, 1]) }),
            icon('fs-btn-tick', 'check', { x: bw / 2 - textW(doneLabel) / 2 - 0.4 * q, y: btnH / 2, size: 3.6 * q, color: ui.onAccent, weight: 3, draw: [T.publish + 0.2, 0.35] }),
          ],
          { x: cw - P, y: btnH / 2, w: bw, h: btnH, ax: 1, ay: 0.5, scale: k([T.publish - 0.06, 1], [T.publish, 0.94, 'outQuad'], [T.publish + 0.35, 1, 'outBack']) },
        ),
      ],
      by - btnH / 2,
      btnH,
    ),
  );
  return L;
}

const featureSpotlight: Recipe = {
  id: 'feature-spotlight',
  name: 'Feature Spotlight',
  category: 'product',
  tags: ['product', 'saas', 'ui', 'feature', 'toggle', 'checklist', 'cursor', 'app'],
  description: 'A settings card assembles itself: switches flip on, tasks check off and a cursor clicks Publish.',
  duration: 5.8,
  usesLogo: true,
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'New · Launch kit' },
    { key: 'headline', label: 'Headline', default: 'Launch in three clicks', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Set it up once. Every release ships itself.', multiline: true },
    { key: 'panel', label: 'Card title', default: 'Launch settings' },
    { key: 'panelSub', label: 'Card subtitle', default: 'Spring release · v2.4' },
    { key: 'opt1', label: 'Switch 1', default: 'Notify subscribers' },
    { key: 'opt2', label: 'Switch 2', default: 'Make page public' },
    { key: 'listLabel', label: 'Checklist label', default: 'Checklist' },
    { key: 'task1', label: 'Task 1', default: 'Upload product shots' },
    { key: 'task2', label: 'Task 2', default: 'Write release notes' },
    { key: 'task3', label: 'Task 3', default: 'Set launch price' },
    { key: 'when', label: 'Schedule text', default: 'Today, 9:00 AM' },
    { key: 'cta', label: 'Button', default: 'Publish' },
    { key: 'done', label: 'Button (done)', default: 'Published' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', format: 'square', logo: 'prism' },
    {
      name: 'Midnight',
      palette: 'midnight',
      fonts: 'sora',
      format: 'landscape',
      logo: 'orbit',
      copy: { eyebrow: 'Automations', headline: 'Busywork, switched off.', sub: 'Flip a switch and let the routine run itself.', panel: 'Weekly report', panelSub: 'Runs every Monday', opt1: 'Email the team', opt2: 'Share to #updates', task1: 'Connect data source', task2: 'Pick the metrics', task3: 'Choose recipients', when: 'Next run Mon, 8:00', cta: 'Activate', done: 'Active' },
    },
    {
      name: 'Lilac',
      palette: 'lilac',
      fonts: 'outfit',
      format: 'portrait',
      logo: 'petal',
      copy: { eyebrow: 'Just shipped', headline: 'Onboarding that runs itself', sub: 'New hires get set up before their first coffee.', panel: 'New hire setup', panelSub: 'Design team · 3 people', opt1: 'Send welcome email', opt2: 'Invite to workspace', task1: 'Create accounts', task2: 'Assign a buddy', task3: 'Book intro calls', when: 'Starts Monday', cta: 'Start', done: 'Started' },
    },
    {
      name: 'Noir',
      palette: 'noir',
      fonts: 'space',
      format: 'story',
      logo: 'stack',
      copy: { eyebrow: 'Release 4.0', headline: 'Ship it before lunch.', sub: 'Previews, checks and rollout in one tidy panel.', panel: 'Deploy to production', panelSub: 'main · 12 commits', opt1: 'Run smoke tests', opt2: 'Gradual rollout', task1: 'Build passed', task2: 'Preview approved', task3: 'Changelog ready', when: 'ETA 2 minutes', cta: 'Deploy', done: 'Deployed' },
    },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const T = { card: 0.35, tg1: 1.85, tg2: 2.4, ck1: 2.75, ck2: 3.0, ck3: 3.25, publish: 3.85 };
    const q = x.pick({ landscape: 0.8 * u, square: 0.7 * u, portrait: 0.8 * u, story: 0.9 * u, default: 0.8 * u });
    const cw = 100 * q;
    const ch = 95 * q;
    let ccx: number;
    let ccy: number;
    let head;
    const hd = { eyebrow: c.eyebrow, title: c.headline, t0: 0.15 };
    if (x.isLandscape) {
      ccx = W - 9 * u - cw / 2;
      ccy = H / 2;
      const hw = ccx - cw / 2 - 9 * u - 9 * u;
      head = heading(x, { ...hd, sub: c.sub, x: 9 * u, y: H / 2, w: hw, size: 9.4 * u, vAlign: 'center', maxLines: 3 });
    } else {
      const size = x.pick({ square: 6.6 * u, portrait: 7.6 * u, default: 10.5 * u });
      const sub = x.isSquare ? undefined : c.sub;
      const opts = { ...hd, sub, x: W / 2, y: 0, w: 84 * u, size, align: 'center' as const, maxLines: x.isSquare ? 1 : x.isStory ? 3 : 2, subLines: 2 };
      const probe = heading(x, opts);
      const gap = x.pick({ square: 5 * u, portrait: 6 * u, default: 9 * u });
      const total = probe.h + gap + ch;
      const top = x.isStory ? (H - total) / 2 - 3 * u : (H - total) / 2;
      head = heading(x, { ...opts, y: top });
      ccx = W / 2;
      ccy = top + probe.h + gap + ch / 2;
    }
    const left = ccx - cw / 2;
    const topY = ccy - ch / 2;
    const P = 6 * q;
    const tgX = left + cw - P - 5.6 * q * 1.72 * 0.4;
    const tg1Y = topY + 27.5 * q;
    const tg2Y = topY + 38.5 * q;
    const btnX = left + cw - P - 9 * q;
    const btnY = topY + 86 * q;
    const cs = x.pick({ landscape: 4.6 * u, default: 4.4 * u });
    return {
      background: bgFor(x, x.isLandscape ? 0.7 : 0.5, 0.6),
      layers: [
        glow('fs-glow', { x: ccx, y: ccy, r: cw * 0.85, color: p.accent, a: ui.dark ? 0.18 : 0.22, scale: k([0.2, 0.6], [1.6, 1, 'outExpo']) }),
        ...head.layers,
        group('fs-cardg', spotlightCard(x, ui, q, cw, ch, T), {
          x: ccx,
          y: k([T.card, ccy + 10 * u], [T.card + 1.1, ccy, 'outExpo']),
          w: cw,
          h: ch,
          opacity: k([T.card, 0], [T.card + 0.4, 1]),
          scale: k([T.card, 0.94], [T.card + 1.1, 1, 'outExpo']),
        }),
        ...cursor(
          'fs-cur',
          [
            { t: 1.25, x: left + cw + 6 * u, y: topY + ch * 0.62 },
            { t: 1.75, x: tgX, y: tg1Y },
            { t: 2.3, x: tgX, y: tg2Y },
            { t: 2.95, x: tgX - 4 * u, y: tg2Y + 7 * u, e: 'inOutSine' },
            { t: 3.75, x: btnX, y: btnY },
            { t: 4.6, x: btnX + 3 * u, y: btnY + 4 * u },
          ],
          { size: cs, fill: ui.dark ? p.fg : ui.text, stroke: ui.dark ? p.bg : ui.card, ripple: ui.accent, clicks: [1.8, 2.35, 3.85], shadow: alpha(shade(p.bg, -0.9), 0.35) },
        ),
      ],
    };
  },
};


// ------------------------------------------------------------------ Dashboard Reveal

function dashContent(x: Ctx, ui: UI, cw: number, chh: number, s: number, T: Record<string, number>) {
  const { c } = x;
  const L: Layer[] = [rect('db-app', { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: chh, fill: ui.app })];
  const full = cw / s >= 118;
  const sb = full ? 27 * s : 12 * s;
  // ---- sidebar
  L.push(
    rect('db-side', { x: 0, y: 0, ax: 0, ay: 0, w: sb, h: chh, fill: ui.card }),
    rect('db-side-line', { x: sb, y: 0, ax: 0, ay: 0, w: 0.2 * s, h: chh, fill: ui.line }),
  );
  const lt = 6.4 * s;
  const lx = full ? 4 * s : (sb - lt) / 2;
  L.push(
    rect('db-logo-bg', { x: lx, y: 4.5 * s, ax: 0, ay: 0, w: lt, h: lt, radius: 1.8 * s, fill: ui.accent }),
    x.logo('db-logo', { size: lt * 0.58, x: lx + lt / 2, y: 4.5 * s + lt / 2, color: ui.onAccent }),
  );
  if (full) L.push(fit(x.body('db-brand', c.brand, { size: 3.2 * s, x: lx + lt + 2.2 * s, y: 4.5 * s + lt / 2, ax: 0, align: 'left', weight: 700, fill: ui.text }), sb - lt - 8 * s));
  const nav: [string, string][] = [[c.page, 'bolt'], ['Customers', 'user'], ['Orders', 'cart'], ['Messages', 'chat'], ['Schedule', 'calendar']];
  nav.forEach(([label, ic], i) => {
    const t = T.ui + 0.15 + i * 0.06;
    const act = i === 0;
    const kids: Layer[] = [];
    if (act) kids.push(rect('db-nav-act', { x: 2.2 * s, y: 3 * s, ax: 0, w: sb - 4.4 * s, h: 6 * s, radius: 1.6 * s, fill: ui.chip, sx: k([T.ui + 0.5, 0.2], [T.ui + 1.0, 1, 'outExpo']) }));
    kids.push(icon(`db-nav${i}-ic`, ic, { x: full ? 6.8 * s : sb / 2, y: 3 * s, size: 3.4 * s, color: act ? ui.accent : ui.muted, weight: 2 }));
    if (full) kids.push(fit(x.body(`db-nav${i}-l`, label, { size: 2.7 * s, x: 11 * s, y: 3 * s, ax: 0, align: 'left', weight: act ? 700 : 500, fill: act ? ui.text : ui.muted }), sb - 14 * s));
    L.push(group(`db-nav${i}`, kids, { x: k([t, -3 * s], [t + 0.6, 0, 'outExpo']), y: 16.5 * s + i * 7.2 * s, w: sb, h: 6 * s, ax: 0, ay: 0, opacity: k([t, 0], [t + 0.4, 1]) }));
  });
  L.push(circle('db-avatar', 2.6 * s, { x: full ? 6.8 * s : sb / 2, y: chh - 6.5 * s, fill: { kind: 'linear', angle: 45, stops: [{ o: 0, c: ui.accent }, { o: 1, c: ui.accent2 }] }, opacity: k([T.ui + 0.5, 0], [T.ui + 0.9, 1]) }));
  if (full)
    L.push(
      x.body('db-user', 'Alex Morgan', { size: 2.5 * s, x: 11 * s, y: chh - 7.6 * s, ax: 0, align: 'left', weight: 600, fill: ui.text, opacity: k([T.ui + 0.5, 0], [T.ui + 0.9, 1]) }),
      x.body('db-role', 'Admin', { size: 2.1 * s, x: 11 * s, y: chh - 4.9 * s, ax: 0, align: 'left', fill: ui.muted, opacity: k([T.ui + 0.5, 0], [T.ui + 0.9, 1]) }),
    );
  // ---- top bar
  const mx = sb + 4.5 * s;
  const mw = cw - mx - 4.5 * s;
  const range = pill(x, 'db-range', c.range, { x: mx + mw, y: 7.6 * s, ax: 1, size: 2.4 * s, h: 5.8 * s, fill: ui.card, color: ui.text, weight: 600, opacity: k([T.ui + 0.3, 0], [T.ui + 0.7, 1]) });
  L.push(fit(x.body('db-page', c.page, { size: 4.6 * s, x: mx, y: 7.6 * s, ax: 0, align: 'left', weight: 700, fill: ui.text, anim: ta.rise(T.ui + 0.2) }), mw - range.pw - 4 * s), range);
  if (mw / s > 100) {
    const sw = 32 * s;
    const sx0 = mx + mw - range.pw - 2.5 * s - sw;
    L.push(
      group(
        'db-search',
        [
          rect('db-search-bg', { x: 0, y: 0, ax: 0, ay: 0, w: sw, h: 5.8 * s, radius: 2.9 * s, fill: ui.card }),
          icon('db-search-ic', 'search', { x: 3.6 * s, y: 2.9 * s, size: 2.8 * s, color: ui.muted, weight: 2.2 }),
          x.body('db-search-l', 'Search…', { size: 2.3 * s, x: 6.4 * s, y: 2.9 * s, ax: 0, align: 'left', fill: ui.muted }),
        ],
        { x: sx0, y: 4.7 * s, w: sw, h: 5.8 * s, ax: 0, ay: 0, opacity: k([T.ui + 0.35, 0], [T.ui + 0.75, 1]) },
      ),
    );
  }
  // ---- KPI cards
  const ky = 14.5 * s;
  const kh = 19.5 * s;
  const kg = 3 * s;
  const kw = (mw - 2 * kg) / 3;
  const kpis = [
    [c.k1l, c.k1, c.k1d],
    [c.k2l, c.k2, c.k2d],
    [c.k3l, c.k3, c.k3d],
  ];
  kpis.forEach(([lab, val, d], i) => {
    const t = T.kpi + i * 0.1;
    const kp = 2.8 * s;
    const v = fit(x.body(`db-k${i}-v`, val, { size: 5.2 * s, x: kp, y: 10.2 * s, ax: 0, align: 'left', fill: ui.text, weight: 700, tracking: -0.02, counter: countTo(val, t + 0.25, 1.7) }), kw - kp * 2);
    L.push(
      group(
        `db-k${i}`,
        [
          rect(`db-k${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: kw, h: kh, radius: 2.4 * s, fill: ui.card, stroke: ui.border, strokeWidth: 0.2 * s }),
          fit(x.body(`db-k${i}-l`, lab, { size: 2.4 * s, x: kp, y: 4.6 * s, ax: 0, align: 'left', fill: ui.muted, weight: 500 }), kw - kp * 2),
          v,
          delta(x, `db-k${i}-d`, d, { x: kp, y: 15.6 * s, size: 1.9 * s, up: !d.trim().startsWith('-'), color: ui.accent, fill: ui.chip, opacity: k([t + 1.3, 0], [t + 1.6, 1]), scale: k([t + 1.3, 0.6], [t + 1.8, 1, 'outBack']) }),
        ],
        { x: mx + i * (kw + kg), y: k([t, ky + 4 * s], [t + 0.8, ky, 'outExpo']), w: kw, h: kh, ax: 0, ay: 0, opacity: k([t, 0], [t + 0.4, 1]) },
      ),
    );
  });
  // ---- chart card
  const cy0 = ky + kh + 3 * s;
  const avail = chh - cy0 - 4 * s;
  const split = avail > 76 * s;
  const chH = split ? avail * 0.6 : avail;
  const chW = mw;
  const yl = 6 * s;
  const px = 3 * s + yl;
  const py = 11.5 * s;
  const pw = chW - px - 3 * s;
  const ph = chH - py - 7 * s;
  const vals = [18, 22, 20, 27, 25, 31, 29, 35, 33, 40, 38, 46];
  const prev = [15, 17, 19, 18, 21, 20, 24, 23, 25, 27, 26, 29];
  const pts = chartPts(vals, pw, ph, 0, 10, 50);
  const ppts = chartPts(prev, pw, ph, 0, 10, 50);
  const tc = T.chart;
  const ck: Layer[] = [
    rect('db-ch-bg', { x: 0, y: 0, ax: 0, ay: 0, w: chW, h: chH, radius: 2.4 * s, fill: ui.card, stroke: ui.border, strokeWidth: 0.2 * s }),
    x.body('db-ch-t', c.chart, { size: 3.1 * s, x: 3 * s, y: 5.4 * s, ax: 0, align: 'left', weight: 700, fill: ui.text }),
  ];
  // legend
  const lg1 = x.body('db-lg1', 'This period', { size: 2.2 * s, x: 0, y: 5.4 * s, ax: 0, align: 'left', fill: ui.muted });
  const lg2 = x.body('db-lg2', 'Last period', { size: 2.2 * s, x: 0, y: 5.4 * s, ax: 0, align: 'left', fill: ui.muted });
  const w2 = textW(lg2);
  const w1 = textW(lg1);
  const l2x = chW - 3 * s - w2;
  const l1x = l2x - 4 * s - w1 - 2.4 * s;
  if (l1x > chW * 0.35) {
    ck.push(
      Object.assign(lg2, { x: l2x }),
      circle('db-lg2-d', 0.8 * s, { x: l2x - 1.8 * s, y: 5.4 * s, fill: alpha(ui.muted, 0.6) }),
      Object.assign(lg1, { x: l1x }),
      circle('db-lg1-d', 0.8 * s, { x: l1x - 1.8 * s, y: 5.4 * s, fill: ui.accent }),
    );
  }
  const gN = ph / s >= 24 ? 4 : 2;
  for (let i = 0; i <= gN; i++) {
    const gy = py + (ph * i) / gN;
    ck.push(
      rect(`db-grid${i}`, { x: px, y: gy, ax: 0, w: k([tc - 0.3 + i * 0.05, 0], [tc + 0.4 + i * 0.05, pw, 'outExpo']), h: 0.18 * s, fill: ui.line }),
      x.body(`db-yl${i}`, `${50 - (i * 40) / gN}k`, { size: 2 * s, x: px - 1.6 * s, y: gy, ax: 1, align: 'right', fill: ui.muted, opacity: k([tc - 0.2, 0], [tc + 0.2, 1]) }),
    );
  }
  const xl = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const step = pw / s < 55 ? 2 : 1;
  xl.forEach((m, i) => {
    if (i % step) return;
    ck.push(x.body(`db-xl${i}`, m, { size: 2 * s, x: px + (pw * i) / 6, y: py + ph + 3.6 * s, fill: ui.muted, opacity: k([tc - 0.2, 0], [tc + 0.2, 1]) }));
  });
  ck.push(
    path('db-prev', smooth(ppts), pw, ph, { x: px, y: py, w: pw, h: ph, ax: 0, ay: 0, stroke: alpha(ui.muted, 0.5), strokeWidth: 0.35 * s, trimEnd: k([tc, 0], [tc + 1.6, 1, 'inOutCubic']) }),
    group(
      'db-area-g',
      [
        path('db-area', areaPath(pts, ph), pw, ph, {
          x: 0,
          y: 0,
          w: pw,
          h: ph,
          ax: 0,
          ay: 0,
          fill: { kind: 'linear', angle: 90, stops: [{ o: 0, c: alpha(ui.accent, 0.28) }, { o: 1, c: alpha(ui.accent, 0) }] },
        }),
      ],
      { x: px, y: py, w: pw, h: ph, ax: 0, ay: 0, mask: { shape: 'rect', x: 0, y: -2 * s, w: k([tc + 0.1, 0], [tc + 1.7, pw, 'inOutCubic']), h: ph + 4 * s } },
    ),
    path('db-line', smooth(pts), pw, ph, { x: px, y: py, w: pw, h: ph, ax: 0, ay: 0, stroke: ui.accent, strokeWidth: 0.6 * s, trimEnd: k([tc + 0.1, 0], [tc + 1.7, 1, 'inOutCubic']) }),
  );
  const dx = px + pw;
  const dy = py + pts[pts.length - 1][1];
  const tt = tc + 1.75;
  ck.push(
    rect('db-hover', { x: dx, y: dy, ax: 0.5, ay: 0, w: 0.01, h: py + ph - dy, stroke: alpha(ui.accent, 0.55), strokeWidth: 0.22 * s, dash: [0.9 * s, 0.9 * s], opacity: k([tt, 0], [tt + 0.3, 1]) }),
    circle('db-dot-halo', 2.6 * s, { x: dx, y: dy, fill: alpha(ui.accent, 0.18), scale: k([tt, 0], [tt + 0.5, 1, 'outBack']) }),
    circle('db-dot', 1.25 * s, { x: dx, y: dy, fill: ui.card, stroke: ui.accent, strokeWidth: 0.55 * s, scale: k([tt, 0], [tt + 0.4, 1, 'outBack']) }),
  );
  const tipV = x.body('db-tip-v', c.tip, { size: 2.8 * s, x: 2.4 * s, y: 3.3 * s, ax: 0, align: 'left', weight: 700, fill: ui.dark ? ui.app : ui.card });
  const tipL = x.body('db-tip-l', 'Jul 31', { size: 2 * s, x: 2.4 * s, y: 6.6 * s, ax: 0, align: 'left', fill: alpha(ui.dark ? ui.app : ui.card, 0.7) });
  const tw = Math.max(textW(tipV), textW(tipL)) + 4.8 * s;
  ck.push(
    group('db-tip', [rect('db-tip-bg', { x: 0, y: 0, ax: 0, ay: 0, w: tw, h: 9.6 * s, radius: 1.8 * s, fill: ui.text }), tipV, tipL], {
      x: dx - 3.4 * s,
      y: dy,
      w: tw,
      h: 9.6 * s,
      ax: 1,
      ay: 0.5,
      opacity: k([tt + 0.15, 0], [tt + 0.4, 1]),
      scale: k([tt + 0.15, 0.85], [tt + 0.6, 1, 'outBack']),
    }),
  );
  L.push(group('db-chart', ck, { x: mx, y: k([T.chart - 0.5, cy0 + 4 * s], [T.chart + 0.3, cy0, 'outExpo']), w: chW, h: chH, ax: 0, ay: 0, opacity: k([T.chart - 0.5, 0], [T.chart - 0.1, 1]) }));
  // ---- channels card (tall layouts)
  if (split) {
    const ly0 = cy0 + chH + 3 * s;
    const lh = avail - chH - 3 * s;
    const rows: [string, number][] = [
      ['Organic search', 0.48],
      ['Social', 0.31],
      ['Referral', 0.21],
    ];
    const lk: Layer[] = [
      rect('db-ls-bg', { x: 0, y: 0, ax: 0, ay: 0, w: chW, h: lh, radius: 2.4 * s, fill: ui.card, stroke: ui.border, strokeWidth: 0.2 * s }),
      x.body('db-ls-t', 'Top channels', { size: 3.1 * s, x: 3 * s, y: 5.4 * s, ax: 0, align: 'left', weight: 700, fill: ui.text }),
    ];
    const rh = (lh - 10 * s) / 3;
    rows.forEach(([name, v], i) => {
      const ry = 10 * s + rh * i + rh * 0.38;
      const tr = T.chart + 0.4 + i * 0.12;
      const bw = chW - 6 * s;
      lk.push(
        x.body(`db-ls${i}-l`, name, { size: 2.5 * s, x: 3 * s, y: ry, ax: 0, align: 'left', weight: 500, fill: ui.text }),
        x.body(`db-ls${i}-v`, `${Math.round(v * 100)}%`, { size: 2.5 * s, x: chW - 3 * s, y: ry, ax: 1, align: 'right', weight: 700, fill: ui.text, counter: { from: 0, to: Math.round(v * 100), start: tr, dur: 1.2, suffix: '%' } }),
        rect(`db-ls${i}-bg`, { x: 3 * s, y: ry + 3.3 * s, ax: 0, w: bw, h: 1.3 * s, radius: 0.65 * s, fill: ui.soft }),
        rect(`db-ls${i}-f`, { x: 3 * s, y: ry + 3.3 * s, ax: 0, w: k([tr, 0], [tr + 1.2, bw * v * 1.6, 'outExpo']), h: 1.3 * s, radius: 0.65 * s, fill: i === 0 ? ui.accent : alpha(ui.accent, 0.55 - i * 0.12) }),
      );
    });
    L.push(group('db-list', lk, { x: mx, y: k([T.chart, ly0 + 4 * s], [T.chart + 0.8, ly0, 'outExpo']), w: chW, h: lh, ax: 0, ay: 0, opacity: k([T.chart, 0], [T.chart + 0.4, 1]) }));
  }
  return { layers: L, dot: [mx + dx, (split ? 0 : 0) + cy0 + dy] as [number, number] };
}

const dashboardReveal: Recipe = {
  id: 'dashboard-reveal',
  name: 'Dashboard Reveal',
  category: 'product',
  tags: ['product', 'saas', 'dashboard', 'analytics', 'browser', 'kpi', 'chart', 'ui'],
  description: 'A browser rises in, KPI cards count up and a revenue line draws itself across the chart.',
  duration: 6,
  usesLogo: true,
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Analytics' },
    { key: 'headline', label: 'Headline', default: 'Every number, one glance.', multiline: true },
    { key: 'brand', label: 'App name', default: 'Lumora' },
    { key: 'page', label: 'Page title', default: 'Overview' },
    { key: 'range', label: 'Date range', default: 'Last 30 days' },
    { key: 'k1l', label: 'KPI 1 label', default: 'Revenue' },
    { key: 'k1', label: 'KPI 1 value', default: '$48,240' },
    { key: 'k1d', label: 'KPI 1 change', default: '12.4%' },
    { key: 'k2l', label: 'KPI 2 label', default: 'Active users' },
    { key: 'k2', label: 'KPI 2 value', default: '12,480' },
    { key: 'k2d', label: 'KPI 2 change', default: '8.1%' },
    { key: 'k3l', label: 'KPI 3 label', default: 'Conversion' },
    { key: 'k3', label: 'KPI 3 value', default: '3.6%' },
    { key: 'k3d', label: 'KPI 3 change', default: '0.4%' },
    { key: 'chart', label: 'Chart title', default: 'Revenue over time' },
    { key: 'tip', label: 'Tooltip value', default: '$46.2k' },
  ],
  variants: [
    { name: 'Arctic', palette: 'arctic', fonts: 'manrope', format: 'landscape', logo: 'orbit' },
    {
      name: 'Graphite',
      palette: 'graphite',
      fonts: 'sora',
      format: 'square',
      logo: 'stack',
      copy: { eyebrow: 'Live metrics', headline: 'Know what moved, instantly.', brand: 'Stacklane', k1l: 'MRR', k1: '$86,400', k1d: '9.2%', k2l: 'Customers', k2: '2,318', k2d: '4.7%', k3l: 'Churn', k3: '1.8%', k3d: '-0.3%', chart: 'Monthly recurring revenue', tip: '$86.4k' },
    },
    {
      name: 'Cobalt',
      palette: 'cobalt',
      fonts: 'dmserif',
      format: 'portrait',
      logo: 'arc',
      copy: { eyebrow: 'Store insights', headline: 'Your shop, at a glance', brand: 'Archway', page: 'Sales', k1l: 'Sales', k1: '$21,930', k1d: '18.6%', k2l: 'Orders', k2: '1,204', k2d: '11.2%', k3l: 'Avg. order', k3: '$58.20', k3d: '3.1%', chart: 'Sales this year', tip: '$21.9k' },
    },
    {
      name: 'Ocean',
      palette: 'ocean',
      fonts: 'space',
      format: 'story',
      logo: 'wave',
      copy: { eyebrow: 'Weekly report', headline: 'Growth you can actually see.', brand: 'Tidal', page: 'Dashboard', k1l: 'Visitors', k1: '94,210', k1d: '22.5%', k2l: 'Signups', k2: '3,872', k2d: '14.0%', k3l: 'Retention', k3: '68%', k3d: '2.6%', chart: 'Visitors', tip: '94.2k' },
    },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const T = { browser: 0.3, ui: 0.75, kpi: 1.0, chart: 1.6 };
    const size = x.pick({ landscape: 6.4 * u, square: 6 * u, portrait: 7 * u, default: 9 * u });
    const hopts = { eyebrow: c.eyebrow, title: c.headline, x: W / 2, y: 0, w: x.pick({ landscape: 120 * u, default: 86 * u }), size, align: 'center' as const, maxLines: x.tall ? 2 : 1, t0: 0.1 };
    const probe = heading(x, hopts);
    const top = x.pick({ landscape: 6 * u, square: 6 * u, portrait: 7 * u, default: 15 * u });
    const head = heading(x, { ...hopts, y: top });
    const bw = x.pick({ landscape: 146 * u, square: 88 * u, portrait: 88 * u, default: 90 * u });
    const by = top + probe.h + x.pick({ landscape: 5 * u, square: 5 * u, portrait: 6 * u, default: 8 * u });
    const bottomPad = x.pick({ landscape: 5 * u, square: 5 * u, portrait: 6 * u, default: 14 * u });
    const bh = H - by - bottomPad;
    const s = x.pick({ landscape: 0.8 * u, square: 0.74 * u, portrait: 0.8 * u, default: 0.84 * u });
    const bar = Math.max(24, bh * 0.07);
    let dot: [number, number] = [0, 0];
    const b = browser('db-br', { x: W / 2, y: k([T.browser, by + 20 * u], [T.browser + 1.2, by, 'outExpo']), w: bw, h: bh, ax: 0.5, ay: 0, dark: ui.dark, opacity: k([T.browser, 0], [T.browser + 0.4, 1]) }, (cw, chh) => {
      const r = dashContent(x, ui, cw, chh, s, T);
      dot = r.dot;
      return r.layers;
    });
    const host = `${c.brand.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app'}.app/${c.page.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    b.children.push(
      icon('db-lock', 'lock', { x: bw / 2 - estUrl(host, bar) / 2 - bar * 0.22, y: bar / 2, size: bar * 0.3, color: ui.muted, weight: 2.2 }),
      x.body('db-url', host, { size: bar * 0.28, x: bw / 2 + bar * 0.12, y: bar / 2, fill: ui.muted }),
    );
    const left = W / 2 - bw / 2;
    const dX = left + dot[0];
    const dY = by + bar + dot[1];
    return {
      background: bgFor(x, 0.5, 0.15),
      layers: [
        glow('db-glow', { x: W / 2, y: by + bh * 0.4, r: bw * 0.6, color: p.accent, a: ui.dark ? 0.22 : 0.2 }),
        ...head.layers,
        b,
        ...cursor(
          'db-cur',
          [
            { t: T.chart + 1.0, x: dX + 6 * u, y: dY + 16 * u },
            { t: T.chart + 1.75, x: dX + 0.6 * u, y: dY + 1 * u },
            { t: 5.2, x: dX + 1.2 * u, y: dY + 2 * u, e: 'inOutSine' },
          ],
          { size: x.pick({ landscape: 4 * u, default: 3.6 * u }), fill: ui.dark ? p.fg : ui.text, stroke: ui.dark ? p.bg : ui.card, ripple: ui.accent, shadow: alpha(shade(p.bg, -0.9), 0.3) },
        ),
      ],
    };
  },
};

function estUrl(s: string, bar: number) {
  return s.length * bar * 0.28 * 0.52;
}

// ------------------------------------------------------------------ Launch Hero

const launchHero: Recipe = {
  id: 'launch-hero',
  name: 'Product Launch',
  category: 'product',
  tags: ['product', 'launch', 'ecommerce', 'hero', 'price', 'drop', 'release'],
  description: 'Your product rises onto a stage, a sticker pops and the name, price and availability land.',
  duration: 5.2,
  images: [{ key: 'product', label: 'Product photo', art: 'product' }],
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'Introducing' },
    { key: 'name', label: 'Product name', default: 'Aero Bottle', multiline: true },
    { key: 'desc', label: 'Description', default: 'Cold for 24 hours. Lighter than your phone.', multiline: true },
    { key: 'price', label: 'Price', default: '$39' },
    { key: 'status', label: 'Availability', default: 'Available now' },
    { key: 'cta', label: 'Button', default: 'Shop now' },
    { key: 'sticker', label: 'Sticker', default: 'New' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'unbounded', format: 'portrait' },
    { name: 'Sand', palette: 'sand', fonts: 'fraunces', format: 'square', copy: { eyebrow: 'Small batch', name: 'Clay Cold Brew', desc: 'Steeped for 18 hours. Bottled the same day.', price: '$14', status: 'In stock', cta: 'Order now', sticker: 'Limited' } },
    { name: 'Noir', palette: 'noir', fonts: 'syne', format: 'landscape', copy: { eyebrow: 'Drop 07', name: 'Volt Tonic', desc: 'Clean energy, zero sugar, sharp citrus finish.', price: '$4.50', status: 'Shipping today', cta: 'Get yours', sticker: 'Drop' } },
    { name: 'Blush', palette: 'blush', fonts: 'dmserif', format: 'story', copy: { eyebrow: 'New season', name: 'Glow Serum', desc: 'Vitamin C, a little magic and nothing else.', price: '$28', status: 'Available now', cta: 'Shop the drop', sticker: 'New' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const S = x.pick({ landscape: 64 * u, square: 44 * u, portrait: 56 * u, default: 80 * u });
    const z = x.isStory ? 1.25 : 1;
    const align: 'left' | 'center' = x.isLandscape ? 'left' : 'center';
    const tw = x.isLandscape ? W - W * 0.555 - 9 * u : 84 * u;
    const tx = x.isLandscape ? W * 0.555 : W / 2;
    const ax = x.isLandscape ? 0 : 0.5;
    const nameSize = x.pick({ landscape: 10 * u, square: 7.6 * u, portrait: 8.6 * u, default: 10.5 * u });
    // text pieces
    const eye = x.body('lh-eye', c.eyebrow, { size: 2.8 * u * z, x: tx, y: 0, ax, ay: 0, align, weight: 700, uppercase: true, tracking: 0.16, fill: p.accent });
    const name = fit(x.title('lh-name', c.name, { size: nameSize, x: tx, y: 0, w: tw, ax, ay: 0, align, lineHeight: 1.02 }), tw, x.isSquare ? 1 : 2);
    const nameH = blockHEst(name, tw);
    const showDesc = !x.isSquare;
    const desc = fit(x.body('lh-desc', c.desc, { size: x.pick({ landscape: 3.2 * u, story: 4 * u, default: 3.3 * u }), x: tx, y: 0, w: x.isLandscape ? tw * 0.92 : 76 * u, ax, ay: 0, align, fill: p.muted, lineHeight: 1.4 }), x.isLandscape ? tw * 0.92 : 76 * u, 2);
    const descH = showDesc ? blockHEst(desc, desc.w as number) : 0;
    const priceSize = x.pick({ landscape: 7.4 * u, square: 6 * u, portrait: 6.6 * u, default: 9 * u });
    const price = x.title('lh-price', c.price, { size: priceSize, x: 0, y: 0, ax: 0, ay: 0.5, align: 'left', fill: p.fg });
    const showCta = !x.isSquare;
    const items = [
      { h: 3.4 * u * z },
      { h: nameH, gap: 2.4 * u * z },
      ...(showDesc ? [{ h: descH, gap: 2.2 * u }] : []),
      { h: Math.max((price.size as number) * 1.05, 6 * u * z), gap: 3.6 * u * z },
      ...(showCta ? [{ h: 8.4 * u * z, gap: 4.4 * u * z }] : []),
    ];
    const textH = stackH(items);
    let imgX: number;
    let imgY: number;
    let top: number;
    if (x.isLandscape) {
      imgX = W * 0.29;
      imgY = H / 2;
      top = H / 2 - textH / 2;
    } else {
      const gap = x.pick({ square: 6 * u, portrait: 7 * u, default: 9 * u });
      const total = S + gap + textH;
      const t0 = (H - total) / 2 + x.pick({ square: 1 * u, default: 0 });
      imgX = W / 2;
      imgY = t0 + S / 2;
      top = t0 + S + gap;
    }
    const ys = stack(top, items);
    let n = 0;
    const eyeY = ys[n++];
    const nameY = ys[n++];
    const descY = showDesc ? ys[n++] : 0;
    const rowY = ys[n++];
    const ctaY = showCta ? ys[n++] : 0;
    Object.assign(eye, { y: eyeY, anim: ta.chars(0.55, { stagger: 0.025 }) });
    Object.assign(name, { y: nameY, anim: ta.rise(0.7, { by: 'char', stagger: 0.03, dur: 0.8 }) });
    Object.assign(desc, { y: descY, anim: ta.blur(1.15, { stagger: 0.04 }) });
    // price row
    const priceW = textW(price);
    const st = x.body('lh-status', c.status, { size: 2.6 * u * z, x: 0, y: 0, ax: 0, align: 'left', weight: 600, fill: p.fg });
    const stW = textW(st) + 7.4 * u * z;
    const stH = 5.8 * u * z;
    const rowW = priceW + 3.4 * u + stW;
    const rx = x.isLandscape ? tx : W / 2 - rowW / 2;
    const rowCY = rowY + items[showDesc ? 3 : 2].h / 2;
    Object.assign(price, { x: rx, y: rowCY, counter: countTo(c.price, 1.35, 1.1, 0.4), opacity: k([1.35, 0], [1.6, 1]) });
    const tP = 1.6;
    const status = group(
      'lh-st',
      [
        rect('lh-st-bg', { x: 0, y: 0, ax: 0, ay: 0, w: stW, h: stH, radius: stH / 2, fill: alpha(p.fg, 0.07), stroke: alpha(p.fg, 0.12), strokeWidth: 0.15 * u }),
        circle('lh-st-pulse', 1.0 * u * z, { x: 2.9 * u * z, y: stH / 2, fill: alpha(p.accent, 0.5), scale: k([2.0, 1], [2.9, 2.6, 'outCubic'], [2.9001, 1], [3.8, 2.6, 'outCubic'], [3.8001, 1], [4.7, 2.6, 'outCubic']), opacity: k([2.0, 0.9], [2.9, 0, 'outCubic'], [2.9001, 0.9], [3.8, 0, 'outCubic'], [3.8001, 0.9], [4.7, 0, 'outCubic']) }),
        circle('lh-st-dot', 0.85 * u * z, { x: 2.9 * u * z, y: stH / 2, fill: p.accent }),
        Object.assign(st, { x: 5.2 * u * z, y: stH / 2 }),
      ],
      { x: rx + priceW + 3.4 * u, y: rowCY, w: stW, h: stH, ax: 0, ay: 0.5, opacity: k([tP, 0], [tP + 0.3, 1]), scale: k([tP, 0.7], [tP + 0.6, 1, 'outBack']) },
    );
    const layers: Layer[] = [
      // stage
      glow('lh-glow', { x: imgX, y: imgY, r: S * 0.95, color: p.accent, a: 0.38, scale: k([0, 0.5], [1.4, 1, 'outExpo']) }),
      ellipseRing('lh-ring1', imgX, imgY, S * 1.34, alpha(p.fg, 0.1), 0.15 * u, 0.1, -40, p.accent, 1.0 * u),
      ellipseRing('lh-ring2', imgX, imgY, S * (x.isLandscape ? 1.7 : 1.5), alpha(p.fg, 0.07), 0.15 * u, 0.25, 50, p.accent, 0.7 * u),
      // floor shadow
      ellipseShadow('lh-floor', imgX, imgY + S * 0.56, S * 0.9, S * 0.1, shade(p.bg, -0.85)),
      group(
        'lh-prod',
        [
          rect('lh-prod-sh', { x: S / 2, y: S / 2, w: S, h: S, radius: S * 0.09, fill: p.bg2, shadow: { color: alpha(shade(p.bg, -0.85), 0.4), blur: 7 * u, y: 3.5 * u } }),
          image('lh-img', x.img[0], { x: S / 2, y: S / 2, w: S, h: S, radius: S * 0.09 }),
        ],
        {
          x: imgX,
          y: k([0.15, imgY + 34 * u], [1.35, imgY, 'outExpo'], [3.2, imgY - 1.2 * u, 'inOutSine'], [5.2, imgY - 0.2 * u, 'inOutSine']),
          w: S,
          h: S,
          rotation: k([0.15, -7], [1.5, 0, 'outBack']),
          opacity: k([0.15, 0], [0.5, 1]),
        },
      ),
      sticker(x, 'lh-stk', c.sticker, imgX + S * 0.43, imgY - S * 0.43, S * 0.27, 1.25),
      eye,
      name,
      ...(showDesc ? [desc] : []),
      price,
      status,
    ];
    if (showCta) {
      const lab = x.body('lh-cta-l', c.cta, { size: 2.9 * u * z, x: 0, y: 0, ax: 0, align: 'left', weight: 700, fill: p.onAccent });
      const lw = textW(lab);
      const bh = 8.4 * u * z;
      const bw = lw + (3.2 * u + 3.4 * u * 2) * z;
      const bx = x.isLandscape ? tx : W / 2 - bw / 2;
      Object.assign(lab, { x: 3.4 * u * z, y: bh / 2 });
      layers.push(
        group(
          'lh-cta',
          [
            rect('lh-cta-bg', { x: 0, y: 0, ax: 0, ay: 0, w: bw, h: bh, radius: bh / 2, fill: p.accent }),
            lab,
            icon('lh-cta-ar', 'arrowRight', { x: k([2.2, (3.4 * u + 0.8 * u) * z + lw], [2.7, (3.4 * u + 2.2 * u) * z + lw, 'outBack']), y: bh / 2, size: 2.8 * u * z, color: p.onAccent, weight: 2.4 }),
          ],
          { x: bx, y: ctaY, w: bw, h: bh, ax: 0, ay: 0, opacity: k([1.9, 0], [2.2, 1]), scale: k([1.9, 0.8], [2.4, 1, 'outBack']) },
        ),
      );
    }
    return { background: radial(x.isLandscape ? 0.29 : 0.5, x.isLandscape ? 0.5 : imgY / H, 0.85, p.bg2, p.bg), layers };
  },
};

function blockHEst(L: import('../../../engine/types').TextLayer, w: number) {
  return textLinesOf(L, w) * (L.size as number) * (L.lineHeight ?? 1.15);
}

function ellipseRing(id: string, cx: number, cy: number, d: number, color: string, sw: number, t0: number, rot: number, dot: string, dr: number): Layer {
  return group(
    id,
    [
      { type: 'ellipse', id: id + '-arc', x: d / 2, y: d / 2, w: d, h: d, stroke: color, strokeWidth: sw, arcEnd: k([t0, 0], [t0 + 1.6, 1, 'inOutCubic']) },
      circle(id + '-dot', dr, { x: d / 2, y: sw / 2, fill: dot, scale: k([t0 + 1.2, 0], [t0 + 1.7, 1, 'outBack']) }),
    ],
    { x: cx, y: cy, w: d, h: d, rotation: k([0, rot - 75], [5.2, rot, 'outSine']) },
  );
}

function ellipseShadow(id: string, cx: number, cy: number, w: number, h: number, color: string): Layer {
  return {
    type: 'ellipse',
    id,
    x: cx,
    y: cy,
    w,
    h,
    fill: radial(0.5, 0.5, 0.72, alpha(color, 0.35), alpha(color, 0)),
    sx: k([0.15, 0.3], [1.35, 1, 'outExpo'], [3.2, 0.92, 'inOutSine'], [5.2, 0.99, 'inOutSine']),
    opacity: k([0.15, 0], [1.2, 1]),
  };
}

function sticker(x: Ctx, id: string, label: string, sx: number, sy: number, d: number, t: number): Layer {
  const { p } = x;
  const lab = fit(x.body(id + '-l', label, { size: d * 0.2, x: d / 2, y: d / 2, weight: 800, uppercase: true, tracking: 0.04, fill: p.onAccent }), d * 0.68);
  return group(id, [path(id + '-burst', starPath(16, 0.86), 100, 100, { x: d / 2, y: d / 2, w: d, h: d, fill: p.accent }), lab], {
    x: sx,
    y: sy,
    w: d,
    h: d,
    rotation: k([t, -60], [t + 0.8, -12, 'outBack'], [5.2, -6, 'inOutSine']),
    scale: k([t, 0], [t + 0.7, 1, 'spring']),
  });
}

// ------------------------------------------------------------------ What's New

const whatsNew: Recipe = {
  id: 'whats-new',
  name: "What's New",
  category: 'product',
  tags: ['product', 'changelog', 'release notes', 'update', 'saas', 'list', 'version'],
  description: 'Changelog card: version tag, then each update slides in with its NEW / IMPROVED / FIXED label.',
  duration: 5.6,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'App name', default: 'Lumora' },
    { key: 'version', label: 'Version', default: 'v3.2' },
    { key: 'date', label: 'Date', default: 'November 2026' },
    { key: 'title', label: 'Title', default: 'What’s new', multiline: true },
    { key: 'tag1', label: 'Tag 1', default: 'New' },
    { key: 'item1', label: 'Update 1', default: 'Dark mode on every screen' },
    { key: 'tag2', label: 'Tag 2', default: 'New' },
    { key: 'item2', label: 'Update 2', default: 'Shared brand kits for teams' },
    { key: 'tag3', label: 'Tag 3', default: 'Improved' },
    { key: 'item3', label: 'Update 3', default: 'Exports up to 3× faster' },
    { key: 'tag4', label: 'Tag 4', default: 'Fixed' },
    { key: 'item4', label: 'Update 4', default: 'Timeline snapping on zoom' },
    { key: 'cta', label: 'Button', default: 'Update now' },
  ],
  variants: [
    { name: 'Slate', palette: 'slate', fonts: 'manrope', format: 'portrait', logo: 'knot' },
    { name: 'Midnight', palette: 'midnight', fonts: 'grotesk', format: 'square', logo: 'orbit', copy: { brand: 'Orbit', version: 'v5.0', date: 'Spring update', title: 'Fresh in 5.0', item1: 'Offline mode for the mobile app', item2: 'Smart folders that sort themselves', item3: 'Search is twice as fast', item4: 'Sync conflicts on shared files' } },
    { name: 'Mint', palette: 'mint', fonts: 'outfit', format: 'landscape', logo: 'petal', copy: { brand: 'Sprout', version: 'v2.8', date: 'This week', title: 'Fresh this week', tag2: 'Improved', item1: 'Recurring tasks with reminders', item2: 'Cleaner calendar view', item3: 'Widgets load instantly', item4: 'Notifications on Android 15' } },
    { name: 'Royal', palette: 'royal', fonts: 'sora', format: 'story', logo: 'arc', copy: { brand: 'Archway', version: 'v1.4', date: 'Release notes', title: 'What’s new in 1.4', item1: 'Shared trip planning', item2: 'Offline maps for 120 cities', item3: 'Booking flow in two taps', item4: 'Currency rounding in receipts', cta: 'Get the update' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const m = x.pick({ landscape: 9 * u, default: 8 * u });
    const tags = [c.tag1, c.tag2, c.tag3, c.tag4];
    const items = [c.item1, c.item2, c.item3, c.item4];
    const icons = ['sparkle', 'user', 'bolt', 'check'];
    const rh = x.pick({ landscape: 15.5 * u, square: 12.4 * u, portrait: 14.5 * u, default: 19.5 * u });
    const rg = x.pick({ landscape: 2.6 * u, square: 2 * u, portrait: 2.6 * u, default: 3.4 * u });
    const listH = rh * 4 + rg * 3;
    let rw: number;
    let rx: number;
    let ry: number;
    const layers: Layer[] = [];
    const brandRow = (bx: number, by: number) => {
      const ls = 6.2 * u;
      return group(
        'wn-brand',
        [
          rect('wn-logo-bg', { x: 0, y: 0, ax: 0, ay: 0, w: ls, h: ls, radius: 1.8 * u, fill: p.accent }),
          x.logo('wn-logo', { size: ls * 0.6, x: ls / 2, y: ls / 2, color: p.onAccent }),
          fit(x.body('wn-brand-l', c.brand, { size: 3.2 * u, x: ls + 2 * u, y: ls / 2, ax: 0, align: 'left', weight: 700, fill: p.fg }), 40 * u),
        ],
        { x: bx, y: by, w: 50 * u, h: ls, ax: 0, ay: 0, opacity: k([0.1, 0], [0.5, 1]) },
      );
    };
    const verPill = (vx: number, vy: number, vax: number) =>
      pill(x, 'wn-ver', c.version, { x: vx, y: vy, ax: vax, ay: 0.5, size: 2.7 * u, h: 5.4 * u, fill: p.accent, color: p.onAccent, weight: 800, padX: 1.3, scale: k([0.35, 0], [0.85, 1, 'outBack']) });
    if (x.isLandscape) {
      rw = 86 * u;
      rx = W - m - rw;
      ry = H / 2 - listH / 2;
      const cw = rx - m - 10 * u;
      const title = balance(fit(x.title('wn-title', c.title, { size: 11 * u, x: m, y: 0, w: cw, ax: 0, ay: 0, align: 'left', lineHeight: 1.0 }), cw, 2), cw);
      const tH = blockHEst(title, cw);
      const blockTop = H / 2 - (6.2 * u + 7 * u + 5.4 * u + 4 * u + tH + 4 * u + 4 * u) / 2;
      const vy = blockTop + 6.2 * u + 7 * u + 2.7 * u;
      const vp = verPill(m, vy, 0);
      layers.push(
        brandRow(m, blockTop),
        vp,
        x.body('wn-date', c.date, { size: 2.9 * u, x: m + vp.pw + 2.4 * u, y: vy, ax: 0, align: 'left', fill: p.muted, weight: 500, opacity: k([0.6, 0], [1, 1]) }),
        Object.assign(title, { y: vy + 2.7 * u + 4 * u, anim: ta.rise(0.45) }),
      );
      layers.push(...ctaBtn(x, 'wn-cta', c.cta, m, vy + 2.7 * u + 4 * u + tH + 5 * u, 0, 2.4));
    } else {
      rw = W - m * 2;
      rx = m;
      const tSize = x.pick({ square: 8 * u, portrait: 9.4 * u, default: 12 * u });
      const title = balance(fit(x.title('wn-title', c.title, { size: tSize, x: m, y: 0, w: rw, ax: 0, ay: 0, align: 'left', lineHeight: 1.0 }), rw, x.isSquare ? 1 : 2), rw);
      const tH = blockHEst(title, rw);
      const showCta = x.isStory;
      const parts = [
        { h: 6.2 * u },
        { h: tH, gap: x.pick({ square: 4.2 * u, default: 6 * u }) },
        { h: listH, gap: x.pick({ square: 4.4 * u, portrait: 6 * u, default: 7 * u }) },
        ...(showCta ? [{ h: 8.4 * u * 1.2, gap: 7 * u }] : []),
      ];
      const top = (H - stackH(parts)) / 2;
      const ys = stack(top, parts);
      const vp = verPill(W - m, ys[0] + 3.1 * u, 1);
      layers.push(
        brandRow(m, ys[0]),
        vp,
        x.body('wn-date', c.date, { size: 2.7 * u, x: W - m - vp.pw - 2.2 * u, y: ys[0] + 3.1 * u, ax: 1, align: 'right', fill: p.muted, weight: 500, opacity: k([0.6, 0], [1, 1]) }),
        Object.assign(title, { y: ys[1], anim: ta.rise(0.4) }),
      );
      ry = ys[2];
      if (showCta) layers.push(...ctaBtn(x, 'wn-cta', c.cta, W / 2, ys[3], 0.5, 2.6, 1.2));
    }
    // rows
    const style = (tag: string) => {
      const t = tag.toLowerCase();
      if (t.includes('fix')) return { tile: ui.soft, ic: ui.muted, chip: ui.soft, chipText: ui.muted };
      if (t.includes('new')) return { tile: ui.accent, ic: ui.onAccent, chip: ui.accent, chipText: ui.onAccent };
      return { tile: ui.chip, ic: ui.accent, chip: ui.chip, chipText: ui.accent };
    };
    items.forEach((it, i) => {
      const t = 0.85 + i * 0.17;
      const st = style(tags[i]);
      const pad = rh * 0.2;
      const tile = rh * 0.58;
      const txX = pad + tile + pad * 0.95;
      const chipSize = Math.max(1.9 * u, rh * 0.13);
      const chip = pill(x, `wn-r${i}-tag`, tags[i], { x: txX, y: rh * 0.34, ax: 0, size: chipSize, h: chipSize * 2, fill: st.chip, color: st.chipText, weight: 800, upper: true, tracking: 0.1, padX: 0.85, scale: k([t + 0.25, 0.5], [t + 0.65, 1, 'outBack']), opacity: k([t + 0.25, 0], [t + 0.45, 1]) });
      const label = fit(x.body(`wn-r${i}-l`, it, { size: Math.min(x.isStory ? 3.9 * u : 3.3 * u, rh * 0.215), x: txX, y: rh * 0.68, ax: 0, align: 'left', weight: 600, fill: ui.text }), rw - txX - pad);
      layers.push(
        group(
          `wn-r${i}`,
          [
            rect(`wn-r${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: rw, h: rh, radius: rh * 0.22, fill: ui.card, stroke: ui.border, strokeWidth: 0.15 * u, shadow: { color: alpha(ui.shadow, 0.6), blur: 3 * u, y: 1 * u } }),
            rect(`wn-r${i}-tile`, { x: pad + tile / 2, y: rh / 2, w: tile, h: tile, radius: tile * 0.28, fill: st.tile, scale: k([t + 0.15, 0.4], [t + 0.6, 1, 'outBack']) }),
            icon(`wn-r${i}-ic`, icons[i], { x: pad + tile / 2, y: rh / 2, size: tile * 0.52, color: st.ic, weight: 2, draw: [t + 0.3, 0.6] }),
            chip,
            label,
          ],
          { x: k([t, rx + 14 * u], [t + 0.9, rx, 'outExpo']), y: ry + i * (rh + rg), w: rw, h: rh, ax: 0, ay: 0, opacity: k([t, 0], [t + 0.35, 1]) },
        ),
      );
    });
    return { background: bgFor(x, x.isLandscape ? 0.75 : 0.5, 0.65), layers: [glow('wn-glow', { x: rx + rw / 2, y: ry + listH / 2, r: rw * 0.75, color: p.accent, a: ui.dark ? 0.16 : 0.14 }), ...layers] };
  },
};

function ctaBtn(x: Ctx, id: string, label: string, bx: number, by: number, ax: number, t: number, z = 1): Layer[] {
  const { p } = x;
  const u = x.u * z;
  const lab = x.body(id + '-l', label, { size: 2.9 * u, x: 0, y: 0, ax: 0, align: 'left', weight: 700, fill: p.onAccent });
  const lw = textW(lab);
  const bh = 8.4 * u;
  const bw = lw + 3.2 * u + 3.4 * u * 2;
  Object.assign(lab, { x: 3.4 * u, y: bh / 2 });
  return [
    group(
      id,
      [
        rect(id + '-bg', { x: 0, y: 0, ax: 0, ay: 0, w: bw, h: bh, radius: bh / 2, fill: p.accent }),
        lab,
        icon(id + '-ar', 'arrowRight', { x: k([t + 0.3, 3.4 * u + lw + 0.8 * u], [t + 0.8, 3.4 * u + lw + 2.2 * u, 'outBack']), y: bh / 2, size: 2.8 * u, color: p.onAccent, weight: 2.4 }),
      ],
      { x: bx, y: by, w: bw, h: bh, ax, ay: 0, opacity: k([t, 0], [t + 0.3, 1]), scale: k([t, 0.8], [t + 0.5, 1, 'outBack']) },
    ),
  ];
}

export const recipes: Recipe[] = [featureSpotlight, dashboardReveal, launchHero, whatsNew];
