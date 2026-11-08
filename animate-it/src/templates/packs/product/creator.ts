/** Category: creator — subscribe prompt, lower third, end screen. */
import type { Layer } from '../../../engine/types';
import { type Recipe, type Ctx, k, rect, circle, group, radial, linear, alpha, shade, lerpColor, readableOn, ta, image, path, ICONS } from '../../kit';
import { contrast } from '../../../engine/color';
import { uiTheme, isDark, cursor, icon, glow, fit, textW, blockH, balance, stack, stackH, type UI } from './ui';

function lightInk(x: Ctx, ui: UI) {
  return ui.dark ? x.p.fg : ui.card;
}

// ------------------------------------------------------------------ Subscribe Prompt

const subscribePrompt: Recipe = {
  id: 'subscribe-prompt',
  name: 'Subscribe Button',
  category: 'creator',
  tags: ['creator', 'youtube', 'subscribe', 'bell', 'button', 'cursor', 'channel', 'overlay'],
  description: 'A cursor clicks Subscribe, the button flips to Subscribed and the bell rings for notifications.',
  duration: 5,
  usesLogo: true,
  fields: [
    { key: 'prompt', label: 'Prompt', default: 'Enjoying the video?' },
    { key: 'brand', label: 'Channel name', default: 'Lumora Studio' },
    { key: 'subs', label: 'Subscribers', default: '128K subscribers' },
    { key: 'cta', label: 'Button', default: 'Subscribe' },
    { key: 'done', label: 'Button (done)', default: 'Subscribed' },
    { key: 'toast', label: 'Bell message', default: 'Notifications turned on' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'poppins', format: 'landscape', logo: 'orbit' },
    { name: 'Noir', palette: 'noir', fonts: 'space', format: 'square', logo: 'prism', copy: { prompt: 'New here?', brand: 'Prism Labs', subs: '86K subscribers', toast: 'You’ll never miss a drop' } },
    { name: 'Sunset', palette: 'sunset', fonts: 'archivo', format: 'story', logo: 'wave', copy: { prompt: 'Don’t miss part two', brand: 'Wave Kitchen', subs: '1.2M subscribers', toast: 'Bell is on — see you Sunday' } },
    { name: 'Arctic', palette: 'arctic', fonts: 'grotesk', format: 'portrait', logo: 'knot', copy: { prompt: 'Learn something every week', brand: 'Knot Academy', subs: '412K subscribers' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const vertical = x.tall;
    const z = x.pick({ landscape: 1.4, square: 1, portrait: 1.15, default: 1.5 });
    const s = u * z;
    const T = { card: 0.3, click: 1.95, bell: 2.75 };
    const L: Layer[] = [];
    // pieces
    const av = vertical ? 20 * s : 12 * s;
    const name = x.body('sp-name', c.brand, { size: (vertical ? 4.4 : 3.5) * s, x: 0, y: 0, ax: vertical ? 0.5 : 0, align: vertical ? 'center' : 'left', weight: 700, fill: ui.text });
    const subs = x.body('sp-subs', c.subs, { size: (vertical ? 3 : 2.5) * s, x: 0, y: 0, ax: vertical ? 0.5 : 0, align: vertical ? 'center' : 'left', fill: ui.muted, weight: 500 });
    const bh = 8.6 * s;
    const bs = 3 * s;
    const lab1 = x.body('sp-btn-a', c.cta, { size: bs, x: 0, y: 0, weight: 700, fill: ui.onAccent });
    const lab2 = x.body('sp-btn-b', c.done, { size: bs, x: 0, y: 0, weight: 700, fill: ui.text });
    const bw = Math.max(textW(lab1), textW(lab2) + bs * 1.6) + bs * 3.2;
    const bell = bh;
    const pad = 3.6 * s;
    let cw: number;
    let ch: number;
    const nameW = Math.min(Math.max(textW(name), textW(subs)), (vertical ? 70 : 40) * s);
    if (vertical) {
      cw = Math.max(Math.min(64 * s, W - 14 * u), bw + bell + 2.4 * s + pad * 2);
      ch = pad + av + 4 * s + 6 * s + 4 * s + 3 * s + bh + pad * 1.2;
    } else {
      cw = pad + av + 3 * s + nameW + 5 * s + bw + 2 * s + bell + pad;
      ch = av + pad * 1.6;
    }
    const maxW = W - (x.isLandscape ? 18 * u : 10 * u);
    const fitScale = Math.min(1, maxW / cw);
    // prompt + card + toast stack (scene space, card scaled by fitScale)
    const promptL = balance(fit(x.title('sp-prompt', c.prompt, { size: x.pick({ landscape: 8.4 * u, square: 6.4 * u, portrait: 7.6 * u, default: 10 * u }), x: W / 2, y: 0, w: 84 * u, ay: 0 }), x.isLandscape ? 140 * u : 84 * u, 2), x.isLandscape ? 140 * u : 84 * u);
    const pH = blockH(promptL, promptL.w as number);
    const toastH = 6.4 * s;
    const items = [{ h: pH }, { h: ch * fitScale, gap: x.pick({ landscape: 7 * u, square: 7 * u, portrait: 8 * u, default: 10 * u }) }, { h: toastH, gap: 4 * u }];
    const ys = stack((H - stackH(items)) / 2, items);
    Object.assign(promptL, { y: ys[0], anim: ta.rise(0.1, { stagger: 0.06 }) });
    L.push(promptL);
    const cx = W / 2;
    const cy = ys[1] + (ch * fitScale) / 2;
    const toScene = (lx: number, ly: number): [number, number] => [cx + (lx - cw / 2) * fitScale, cy + (ly - ch / 2) * fitScale];
    // card children (card space)
    const K: Layer[] = [rect('sp-card', { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: ch, radius: vertical ? 4 * s : ch / 2, fill: ui.card, stroke: ui.border, strokeWidth: 0.15 * u, shadow: { color: ui.shadow, blur: 6 * s, y: 2 * s } })];
    let avX: number;
    let avY: number;
    let bx: number;
    let by: number;
    let bellX: number;
    if (vertical) {
      avX = cw / 2;
      avY = pad + av / 2;
      Object.assign(name, { x: cw / 2, y: pad + av + 4 * s + 2.2 * s });
      fit(name, cw - pad * 2);
      Object.assign(subs, { x: cw / 2, y: pad + av + 4 * s + 7.4 * s });
      by = ch - pad * 1.2 - bh / 2;
      const rowW = bw + 2.4 * s + bell;
      bx = cw / 2 - rowW / 2;
      bellX = bx + bw + 2.4 * s + bell / 2;
    } else {
      avX = pad + av / 2;
      avY = ch / 2;
      Object.assign(name, { x: pad + av + 3 * s, y: ch / 2 - 2.2 * s });
      fit(name, nameW);
      Object.assign(subs, { x: pad + av + 3 * s, y: ch / 2 + 2.6 * s });
      fit(subs, nameW);
      by = ch / 2;
      bx = pad + av + 3 * s + nameW + 5 * s;
      bellX = bx + bw + 2 * s + bell / 2;
    }
    K.push(
      circle('sp-av-bg', av / 2, { x: avX, y: avY, fill: linear(135, shade(ui.accent, 0.15), shade(ui.accent, -0.2)), scale: k([T.card + 0.2, 0], [T.card + 0.7, 1, 'outBack']) }),
      x.logo('sp-logo', { size: av * 0.52, x: avX, y: avY, color: ui.onAccent, scale: k([T.card + 0.35, 0], [T.card + 0.85, 1, 'outBack']) }),
      { type: 'ellipse', id: 'sp-av-ring', x: avX, y: avY, w: av + 1.6 * s, h: av + 1.6 * s, stroke: ui.accent, strokeWidth: 0.4 * s, arcEnd: k([T.click + 0.1, 0], [T.click + 0.8, 1, 'inOutCubic']) },
      Object.assign(name, { anim: ta.rise(T.card + 0.4) }),
      Object.assign(subs, { anim: ta.blur(T.card + 0.55, { stagger: 0.04 }) }),
    );
    const tk = T.click;
    K.push(
      group(
        'sp-btn',
        [
          rect('sp-btn-bg', { x: 0, y: 0, ax: 0, ay: 0, w: bw, h: bh, radius: bh / 2, fill: k<string>([tk, ui.accent], [tk + 0.25, ui.soft, 'outCubic']) }),
          Object.assign(lab1, { x: bw / 2, y: bh / 2, opacity: k([tk, 1], [tk + 0.15, 0]) }),
          Object.assign(lab2, { x: bw / 2 + bs * 0.8, y: bh / 2, opacity: k([tk + 0.12, 0], [tk + 0.32, 1]) }),
          icon('sp-btn-chk', 'check', { x: bw / 2 - textW(lab2) / 2 - bs * 0.15, y: bh / 2, size: bs * 1.2, color: ui.text, weight: 2.8, draw: [tk + 0.2, 0.35] }),
        ],
        { x: bx, y: by, w: bw, h: bh, ax: 0, ay: 0.5, opacity: k([T.card + 0.6, 0], [T.card + 0.9, 1]), scale: k([T.card + 0.6, 0.7], [T.card + 1.1, 1, 'outBack'], [tk - 0.08, 1], [tk, 0.92, 'outQuad'], [tk + 0.4, 1, 'outBack']) },
      ),
    );
    const tb = T.bell;
    const wig = k([tb, 0], [tb + 0.08, 18], [tb + 0.2, -16], [tb + 0.32, 12], [tb + 0.44, -8], [tb + 0.56, 4], [tb + 0.7, 0, 'outCubic']);
    K.push(
      group(
        'sp-bell',
        [
          circle('sp-bell-bg', bell / 2, { x: bell / 2, y: bell / 2, fill: ui.soft }),
          path('sp-bell-ic', ICONS.bell, 24, 24, { x: bell / 2, y: bell * 0.47, w: bell * 0.52, h: bell * 0.52, ay: 0.15, stroke: ui.text, strokeWidth: 1.9, fill: k<string>([tb, alpha(ui.text, 0)], [tb + 0.1, ui.text]), rotation: wig }),
          path('sp-bell-r1', 'M4 6 Q2 12 4 18', 24, 24, { x: bell * 0.16, y: bell / 2, w: bell * 0.3, h: bell * 0.3, stroke: ui.accent, strokeWidth: 3, trimEnd: k([tb + 0.1, 0], [tb + 0.4, 1, 'outCubic']), opacity: k([tb + 0.1, 1], [tb + 1.2, 1], [tb + 1.6, 0]) }),
          path('sp-bell-r2', 'M20 6 Q22 12 20 18', 24, 24, { x: bell * 0.84, y: bell / 2, w: bell * 0.3, h: bell * 0.3, stroke: ui.accent, strokeWidth: 3, trimEnd: k([tb + 0.1, 0], [tb + 0.4, 1, 'outCubic']), opacity: k([tb + 0.1, 1], [tb + 1.2, 1], [tb + 1.6, 0]) }),
        ],
        { x: bellX, y: by, w: bell, h: bell, opacity: k([T.card + 0.7, 0], [T.card + 1.0, 1]), scale: k([T.card + 0.7, 0.6], [T.card + 1.2, 1, 'outBack'], [tb - 0.08, 1], [tb, 0.9, 'outQuad'], [tb + 0.4, 1, 'outBack']) },
      ),
    );
    L.push(
      group('sp-cardg', K, {
        x: cx,
        y: k([T.card, cy + 8 * u], [T.card + 0.9, cy, 'outExpo']),
        w: cw,
        h: ch,
        scale: k([T.card, fitScale * 0.9], [T.card + 0.9, fitScale, 'outExpo']),
        opacity: k([T.card, 0], [T.card + 0.35, 1]),
      }),
    );
    // toast
    const tl = x.body('sp-toast-l', c.toast, { size: 2.6 * s, x: 0, y: toastH / 2, ax: 0, align: 'left', weight: 600, fill: ui.dark ? ui.app : ui.card });
    const tw = textW(tl) + 9.6 * s;
    Object.assign(tl, { x: 6.6 * s });
    L.push(
      group(
        'sp-toast',
        [
          rect('sp-toast-bg', { x: 0, y: 0, ax: 0, ay: 0, w: tw, h: toastH, radius: toastH / 2, fill: ui.text }),
          icon('sp-toast-ic', 'bell', { x: 3.8 * s, y: toastH / 2, size: 2.8 * s, color: ui.dark ? ui.app : ui.card, weight: 2 }),
          tl,
        ],
        { x: cx, y: ys[2] + toastH / 2, w: tw, h: toastH, opacity: k([tb + 0.35, 0], [tb + 0.6, 1]), scale: k([tb + 0.35, 0.7], [tb + 0.85, 1, 'outBack']) },
      ),
    );
    const [btnX, btnY] = toScene(bx + bw * 0.62, by + bh * 0.1);
    const [bellSX, bellSY] = toScene(bellX + bell * 0.1, by + bell * 0.12);
    L.push(
      ...cursor(
        'sp-cur',
        [
          { t: 1.2, x: btnX + 14 * u, y: btnY + 16 * u },
          { t: 1.85, x: btnX, y: btnY },
          { t: 2.65, x: bellSX, y: bellSY },
          { t: 3.6, x: bellSX + 5 * u, y: bellSY + 7 * u, e: 'inOutSine' },
        ],
        { size: 4.2 * s * Math.max(0.85, fitScale), fill: ui.text, stroke: ui.card, ripple: ui.accent, clicks: [T.click, T.bell], shadow: alpha(shade(p.bg, -0.9), 0.3) },
      ),
    );
    return { background: radial(0.5, cy / H, 0.8, p.bg2, p.bg), layers: [glow('sp-glow', { x: cx, y: cy, r: cw * 0.7 * fitScale, color: p.accent, a: ui.dark ? 0.18 : 0.14 }), ...L] };
  },
};

// ------------------------------------------------------------------ Lower Third

const lowerThird: Recipe = {
  id: 'lower-third',
  name: 'Lower Third',
  category: 'creator',
  tags: ['creator', 'lower third', 'name tag', 'title', 'interview', 'video overlay', 'broadcast'],
  description: 'A logo block snaps in and name and role plates wipe out from behind it — built to sit over footage.',
  duration: 4,
  usesLogo: true,
  fields: [
    { key: 'name', label: 'Name', default: 'Maya Rossi' },
    { key: 'role', label: 'Role', default: 'Head of Design, Lumora' },
    { key: 'handle', label: 'Handle', default: '@mayamakes' },
  ],
  variants: [
    { name: 'Slate', palette: 'slate', fonts: 'manrope', format: 'landscape', logo: 'stack' },
    { name: 'Midnight', palette: 'midnight', fonts: 'sora', format: 'story', logo: 'orbit', copy: { name: 'Jordan Lee', role: 'Founder, Orbit Coffee', handle: '@jordanbrews' } },
    { name: 'Paper', palette: 'paper', fonts: 'serif', format: 'square', logo: 'petal', copy: { name: 'Elena Park', role: 'Florist & Author', handle: '@elenaflowers' } },
    { name: 'Electric', palette: 'electric', fonts: 'anton', format: 'portrait', logo: 'arc', copy: { name: 'Sam Ortiz', role: 'Pro Skater · Team Voltra', handle: '@samortiz' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const nameSize = x.pick({ landscape: 4.8 * u, square: 5.4 * u, portrait: 5.4 * u, default: 6.2 * u });
    const roleSize = nameSize * 0.5;
    const left = x.pick({ landscape: 7 * u, default: 6 * u });
    const bottom = H - x.pick({ landscape: 10 * u, square: 10 * u, portrait: 13 * u, default: 34 * u });
    const nameH = nameSize * 1.95;
    const roleH = roleSize * 2.5;
    const S = nameH + roleH;
    const maxPlate = W - left - S - 6 * u;
    const nameL = fit(x.title('lt-name', c.name, { size: nameSize, x: 0, y: 0, ax: 0, align: 'left', fill: isDark(p) ? p.bg : p.bg, lineHeight: 1 }), maxPlate - nameSize * 2);
    const roleL = fit(x.body('lt-role', c.role, { size: roleSize, x: 0, y: 0, ax: 0, align: 'left', weight: 700, uppercase: true, tracking: 0.12, fill: p.onAccent }), maxPlate - roleSize * 3);
    const tick = p.accent2 === p.fg ? p.accent : p.accent2;
    const nW = Math.min(maxPlate, textW(nameL) + (nameL.size as number) * 2);
    const rW = Math.min(maxPlate, textW(roleL) + roleSize * 3);
    const top = bottom - S;
    const px = left + S;
    const acc = contrast(p.accent, p.fg) < 1.6 && contrast(p.accent2, p.fg) >= 1.6 ? p.accent2 : p.accent;
    const onAcc = readableOn(acc, p.bg, p.fg);
    const T = { logo: 0.15, name: 0.55, role: 0.8 };
    const L: Layer[] = [];
    // logo block
    L.push(
      group(
        'lt-logo',
        [rect('lt-logo-bg', { x: 0, y: 0, ax: 0, ay: 0, w: S, h: S, fill: acc }), x.logo('lt-logo-m', { size: S * 0.5, x: S / 2, y: S / 2, color: onAcc, rotation: k([T.logo, -90], [T.logo + 0.7, 0, 'outBack']) })],
        { x: left, y: top, w: S, h: S, ax: 0, ay: 0, sy: k([T.logo, 0], [T.logo + 0.5, 1, 'outExpo']), sx: k([T.logo, 0.2], [T.logo + 0.6, 1, 'outBack']) },
      ),
    );
    // name plate
    L.push(
      group(
        'lt-np',
        [
          rect('lt-np-bg', { x: 0, y: 0, ax: 0, ay: 0, w: nW, h: nameH, fill: p.fg }),
          Object.assign(nameL, { x: (nameL.size as number), y: nameH / 2 + (nameL.size as number) * 0.04, anim: { by: 'char', start: T.name + 0.15, dur: 0.6, stagger: 0.025, ease: 'outExpo', from: { y: 1.1 }, mask: true } as const }),
        ],
        { x: px, y: top, w: nW, h: nameH, ax: 0, ay: 0, mask: { shape: 'rect', x: 0, y: 0, w: k([T.name, 0], [T.name + 0.7, nW, 'outExpo']), h: nameH } },
      ),
    );
    // role plate
    L.push(
      group(
        'lt-rp',
        [
          rect('lt-rp-bg', { x: 0, y: 0, ax: 0, ay: 0, w: rW, h: roleH, fill: acc }),
          Object.assign(roleL, { fill: onAcc, x: roleSize * 1.5, y: roleH / 2, anim: ta.slide(T.role + 0.2, { by: 'word', stagger: 0.05 }) }),
        ],
        { x: px, y: top + nameH, w: rW, h: roleH, ax: 0, ay: 0, mask: { shape: 'rect', x: 0, y: 0, w: k([T.role, 0], [T.role + 0.7, rW, 'outExpo']), h: roleH } },
      ),
    );
    // accent tick + handle
    L.push(
      rect('lt-tick', { x: px + nW, y: top, ax: 0, ay: 0, w: k([T.name + 0.45, 0], [T.name + 0.8, 0.9 * u, 'outExpo']), h: nameH, fill: acc === p.accent ? tick : acc }),
      x.body('lt-handle', c.handle, { size: roleSize * 1.05, x: px + roleSize * 1.5, y: bottom + roleSize * 1.9, ax: 0, align: 'left', weight: 600, fill: p.muted, anim: ta.chars(T.role + 0.5, { stagger: 0.02 }) }),
    );
    return { background: linear(90, p.bg, lerpColor(p.bg, p.bg2, 0.6)), layers: L };
  },
};

// ------------------------------------------------------------------ End Screen

const endScreen: Recipe = {
  id: 'end-screen',
  name: 'End Screen',
  category: 'creator',
  tags: ['creator', 'youtube', 'end screen', 'outro', 'watch next', 'subscribe', 'video'],
  description: 'Outro with two “watch next” videos sliding in and a subscribe circle that draws around your logo.',
  duration: 5,
  usesLogo: true,
  images: [
    { key: 'v1', label: 'Video 1 thumbnail', art: 'landscape' },
    { key: 'v2', label: 'Video 2 thumbnail', art: 'city' },
  ],
  fields: [
    { key: 'title', label: 'Title', default: 'Watch next', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'New videos every Tuesday' },
    { key: 'v1', label: 'Video 1 title', default: '30 days of slow mornings' },
    { key: 'd1', label: 'Video 1 length', default: '12:48' },
    { key: 'v2', label: 'Video 2 title', default: 'Tiny studio, big ideas' },
    { key: 'd2', label: 'Video 2 length', default: '18:05' },
    { key: 'brand', label: 'Channel name', default: 'Lumora Studio' },
    { key: 'cta', label: 'Subscribe label', default: 'Subscribe' },
  ],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'grotesk', format: 'landscape', logo: 'orbit' },
    { name: 'Azure', palette: 'azure', fonts: 'outfit', format: 'portrait', logo: 'arc', copy: { title: 'Keep watching', sub: 'Fresh tutorials every Friday', v1: 'Design a logo in 10 minutes', d1: '10:12', v2: 'My 2026 desk setup', d2: '14:30', brand: 'Archway Design' } },
    { name: 'Graphite', palette: 'graphite', fonts: 'editorial', format: 'square', logo: 'knot', copy: { title: 'Up next', sub: 'Stories from the road', v1: 'Driving the coast in winter', d1: '21:40', v2: 'Night trains of Europe', d2: '16:22', brand: 'Knot Travels' } },
    { name: 'Peach', palette: 'peach', fonts: 'poppins', format: 'story', logo: 'petal', copy: { title: 'Don’t stop here', sub: 'Two more recipes you’ll love', v1: 'Five-minute breakfast tacos', d1: '06:45', v2: 'Weeknight pasta, three ways', d2: '11:30', brand: 'Petal Kitchen' } },
  ],
  build(x) {
    const { u, W, H, p, c } = x;
    const ui = uiTheme(p);
    const ink = lightInk(x, ui);
    const L: Layer[] = [];
    const overlay = x.isLandscape || x.isStory;
    let vw: number;
    let vpos: [number, number][];
    let titleX: number;
    let titleY: number;
    let titleAlign: 'left' | 'center';
    let titleW: number;
    let subRow: [number, number, 'left' | 'center'];
    const tSize = x.pick({ landscape: 10 * u, square: 7.4 * u, portrait: 9.4 * u, default: 10.4 * u });
    const m = x.pick({ landscape: 8 * u, default: 7 * u });
    // title + sub measure
    const mkTitle = (w: number, align: 'left' | 'center') =>
      balance(fit(x.title('es-title', c.title, { size: tSize, x: 0, y: 0, w, ax: align === 'left' ? 0 : 0.5, ay: 0, align, lineHeight: 1.0 }), w, 2), w);
    if (x.isLandscape) {
      vw = 70 * u;
      const vh = vw * 0.5625;
      const vx = W - m - vw / 2;
      vpos = [
        [vx, H / 2 - vh / 2 - 2.4 * u],
        [vx, H / 2 + vh / 2 + 2.4 * u],
      ];
      titleW = W - m * 2 - vw - 10 * u;
      titleAlign = 'left';
      titleX = m;
      const tl = mkTitle(titleW, 'left');
      const th = blockH(tl, tl.w as number);
      const blockHt = th + 4 * u + 4 * u + 10 * u + 24 * u;
      titleY = H / 2 - blockHt / 2;
      subRow = [m, titleY + th + 4 * u, 'left'];
    } else if (x.isStory) {
      vw = 80 * u;
      const vh = vw * 0.5625;
      titleW = 86 * u;
      titleAlign = 'center';
      titleX = W / 2;
      const tl = mkTitle(titleW, 'center');
      const th = blockH(tl, tl.w as number);
      const items = [{ h: th }, { h: 4.4 * u, gap: 3 * u }, { h: vh, gap: 10 * u }, { h: vh, gap: 5 * u }, { h: 22 * u, gap: 10 * u }];
      const ys = stack((H - stackH(items)) / 2, items);
      titleY = ys[0];
      subRow = [W / 2, ys[1], 'center'];
      vpos = [
        [W / 2, ys[2] + vh / 2],
        [W / 2, ys[3] + vh / 2],
      ];
    } else {
      vw = (W - m * 2 - 4 * u) / 2;
      const vh = vw * 0.5625;
      titleW = 84 * u;
      titleAlign = 'center';
      titleX = W / 2;
      const tl = mkTitle(titleW, 'center');
      const th = blockH(tl, tl.w as number);
      const cap = x.pick({ square: 8 * u, default: 10 * u });
      const items = [{ h: th }, { h: 4 * u, gap: 2.6 * u }, { h: vh + cap, gap: x.pick({ square: 7 * u, default: 11 * u }) }, { h: x.pick({ square: 16 * u, default: 22 * u }), gap: x.pick({ square: 6 * u, default: 12 * u }) }];
      const ys = stack((H - stackH(items)) / 2, items);
      titleY = ys[0];
      subRow = [W / 2, ys[1], 'center'];
      vpos = [
        [m + vw / 2, ys[2] + vh / 2],
        [W - m - vw / 2, ys[2] + vh / 2],
      ];
    }
    const title = mkTitle(titleW, titleAlign);
    Object.assign(title, { x: titleX, y: titleY, anim: ta.rise(0.15, { by: 'char', stagger: 0.03 }) });
    L.push(title);
    L.push(x.body('es-sub', c.sub, { size: x.pick({ landscape: 3.2 * u, story: 3.8 * u, default: 3 * u }), x: subRow[0], y: subRow[1], ax: subRow[2] === 'left' ? 0 : 0.5, ay: 0, align: subRow[2], fill: p.muted, weight: 500, anim: ta.blur(0.5, { stagger: 0.04 }) }));
    // videos
    const vh = vw * 0.5625;
    const vids: [string, string][] = [
      [c.v1, c.d1],
      [c.v2, c.d2],
    ];
    vids.forEach(([vt, dur], i) => {
      const [vx, vy] = vpos[i];
      const t = 0.55 + i * 0.18;
      const r = Math.max(1.4 * u, vw * 0.035);
      const ds = Math.max(1.9 * u, vw * 0.032);
      const durL = x.body(`es-v${i}-dl`, dur, { size: ds, x: 0, y: 0, weight: 700, fill: ink });
      const dw = textW(durL) + ds * 1.2;
      const kids: Layer[] = [
        rect(`es-v${i}-sh`, { x: 0, y: 0, ax: 0, ay: 0, w: vw, h: vh, radius: r, fill: ui.card, shadow: { color: ui.shadow, blur: 4 * u, y: 1.6 * u } }),
        image(`es-v${i}-img`, x.img[i], { x: 0, y: 0, ax: 0, ay: 0, w: vw, h: vh, radius: r }),
        rect(`es-v${i}-grad`, { x: 0, y: 0, ax: 0, ay: 0, w: vw, h: vh, radius: r, fill: { kind: 'linear', angle: 90, stops: [{ o: overlay ? 0.35 : 0.6, c: alpha(shade(p.bg, -0.92), 0) }, { o: 1, c: alpha(shade(p.bg, -0.92), overlay ? 0.75 : 0.45) }] } }),
        rect(`es-v${i}-dbg`, { x: vw - ds * 0.9, y: vh - ds * 0.9, ax: 1, ay: 1, w: dw, h: ds * 1.7, radius: ds * 0.35, fill: alpha(shade(p.bg, -0.92), 0.72) }),
        Object.assign(durL, { x: vw - ds * 0.9 - dw / 2, y: vh - ds * 0.9 - ds * 0.85 }),
        circle(`es-v${i}-play`, vh * 0.13, { x: vw / 2, y: overlay ? vh * 0.42 : vh / 2, fill: alpha(ink, 0.92), scale: k([t + 0.5, 0], [t + 0.9, 1, 'outBack']) }),
        path(`es-v${i}-pi`, ICONS.play, 24, 24, { x: vw / 2 + vh * 0.012, y: overlay ? vh * 0.42 : vh / 2, w: vh * 0.15, h: vh * 0.15, fill: ui.accent, scale: k([t + 0.6, 0], [t + 1.0, 1, 'outBack']) }),
        rect(`es-v${i}-prog`, { x: 0, y: vh, ax: 0, ay: 1, w: i === 0 ? k([t + 0.8, 0], [t + 1.8, vw * 0.38, 'outCubic']) : 0, h: Math.max(0.5 * u, vh * 0.025), fill: ui.accent }),
      ];
      if (overlay) {
        kids.push(fit(x.body(`es-v${i}-t`, vt, { size: Math.max(2.6 * u, vw * 0.045), x: vw * 0.05, y: vh - ds * 1.75, ax: 0, align: 'left', weight: 700, fill: ink, anim: ta.rise(t + 0.6, { stagger: 0.04 }) }), vw - dw - vw * 0.12));
      }
      L.push(
        group(`es-v${i}`, kids, {
          x: k([t, vx + (i === 0 ? -1 : 1) * (x.isLandscape || x.isStory ? 0 : 10 * u)], [t + 0.9, vx, 'outExpo']),
          y: k([t, vy + (x.isLandscape || x.isStory ? 14 * u : 4 * u)], [t + 0.9, vy, 'outExpo']),
          w: vw,
          h: vh,
          opacity: k([t, 0], [t + 0.35, 1]),
          scale: i === 0 ? k([t, 0.92], [t + 0.9, 1, 'outExpo'], [2.6, 1], [3.0, 1.03, 'outBack']) : k([t, 0.92], [t + 0.9, 1, 'outExpo']),
        }),
      );
      if (i === 0)
        L.push(rect('es-v0-hover', { x: vx, y: vy, w: vw + 1.4 * u, h: vh + 1.4 * u, radius: r + 0.7 * u, stroke: ui.accent, strokeWidth: 0.5 * u, scale: k([2.6, 1], [3.0, 1.03, 'outBack']), opacity: k([2.6, 0], [2.9, 1]) }));
      if (!overlay) {
        L.push(fit(x.body(`es-v${i}-t`, vt, { size: x.pick({ square: 2.8 * u, default: 3.3 * u }), x: vx - vw / 2, y: vy + vh / 2 + 2 * u, w: vw, ax: 0, ay: 0, align: 'left', weight: 700, fill: p.fg, lineHeight: 1.25, anim: ta.rise(t + 0.6, { stagger: 0.04 }) }), vw, 2));
      }
    });
    // subscribe block
    const D = x.pick({ landscape: 22 * u, square: 15 * u, portrait: 21 * u, default: 22 * u });
    const nm = x.body('es-brand', c.brand, { size: x.pick({ landscape: 3.4 * u, story: 3.8 * u, default: 3.2 * u }), x: 0, y: 0, ax: 0, align: 'left', weight: 700, fill: p.fg });
    const ctaS = x.pick({ landscape: 2.8 * u, story: 3.2 * u, default: 2.6 * u });
    const ctaL = x.body('es-cta-l', c.cta, { size: ctaS, x: 0, y: 0, weight: 700, fill: p.onAccent });
    const cw = textW(ctaL) + ctaS * 2.8;
    const chh = ctaS * 2.5;
    const blockW = D + 4 * u + Math.max(textW(nm), cw);
    let sx0: number;
    let sy: number;
    if (x.isLandscape) {
      sx0 = m;
      sy = H / 2 + 22 * u;
      const tH = blockH(title, title.w as number);
      sy = titleY + tH + 4 * u + 4 * u + 10 * u + D / 2;
    } else {
      sx0 = W / 2 - blockW / 2;
      sy = x.isStory ? vpos[1][1] + vh / 2 + 10 * u + D / 2 : vpos[0][1] + vh / 2 + x.pick({ square: 8 * u, default: 10 * u }) + x.pick({ square: 6 * u, default: 12 * u }) + D / 2;
    }
    const scx = sx0 + D / 2;
    const tS = 1.3;
    fit(nm, (x.isLandscape ? W - m * 2 - vw - 10 * u : W - m * 2) - D - 4 * u);
    L.push(
      circle('es-sub-bg', D / 2, { x: scx, y: sy, fill: linear(135, shade(p.accent, 0.12), shade(p.accent, -0.22)), scale: k([tS, 0], [tS + 0.6, 1, 'outBack']) }),
      x.logo('es-logo', { size: D * 0.5, x: scx, y: sy, color: p.onAccent, scale: k([tS + 0.15, 0], [tS + 0.7, 1, 'outBack']), rotation: k([tS + 0.15, -60], [tS + 0.8, 0, 'outBack']) }),
      { type: 'ellipse', id: 'es-sub-ring', x: scx, y: sy, w: D + 2.4 * u, h: D + 2.4 * u, stroke: p.accent, strokeWidth: 0.45 * u, arcEnd: k([tS + 0.2, 0], [tS + 1.1, 1, 'inOutCubic']), rotation: k([tS + 0.2, -90], [tS + 1.1, 0, 'outCubic']) },
      circle('es-sub-pulse', D / 2 + 1.2 * u, { x: scx, y: sy, stroke: p.accent, strokeWidth: 0.4 * u, scale: k([3.2, 1], [4.0, 1.35, 'outCubic']), opacity: k([3.2, 0.8], [4.0, 0, 'inQuad']), start: 3.2, end: 4.05 }),
      Object.assign(nm, { x: sx0 + D + 4 * u, y: sy - chh * 0.62, anim: ta.rise(tS + 0.4) }),
      group(
        'es-cta',
        [rect('es-cta-bg', { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: chh, radius: chh / 2, fill: p.accent }), Object.assign(ctaL, { x: cw / 2, y: chh / 2 })],
        { x: sx0 + D + 4 * u, y: sy + chh * 0.55, w: cw, h: chh, ax: 0, ay: 0.5, opacity: k([tS + 0.55, 0], [tS + 0.8, 1]), scale: k([tS + 0.55, 0.6], [tS + 1.0, 1, 'outBack'], [3.15, 1], [3.25, 0.94], [3.6, 1, 'outBack']) },
      ),
    );
    return { background: radial(x.isLandscape ? 0.3 : 0.5, 0.35, 0.95, p.bg2, p.bg), layers: [glow('es-glow', { x: x.isLandscape ? W * 0.7 : W / 2, y: H / 2, r: vw, color: p.accent, a: ui.dark ? 0.2 : 0.14 }), ...L] };
  },
};

export const recipes: Recipe[] = [subscribePrompt, lowerThird, endScreen];
