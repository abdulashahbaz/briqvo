import type { Layer } from '../../../engine/types';
import type { Ctx } from '../../kit';
import { type Recipe, rect, circle, group, k, fadeIn, pop, ta, alpha, shade, linear } from '../../kit';
import { accentOn, chip, chipW, progress, estW, fadeUp, icon, list, pad2, shadowCol, slideX, swipeCue, tsz } from './shared';

/** App-style icon tile (gradient square + stroke icon). */
function tile(x: Ctx, id: string, ic: string, o: { x: number; y: number; size: number; t: number; rot?: number; ax?: number; ay?: number }): Layer {
  const { p } = x;
  const s = o.size;
  return group(
    id,
    [
      rect(`${id}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: s, h: s, radius: s * 0.27, fill: linear(135, shade(p.accent, 0.12), shade(p.accent, -0.22)), shadow: { color: shadowCol(p, 0.3), blur: s * 0.18, y: s * 0.07 } }),
      icon(`${id}-ic`, ic, { x: s / 2, y: s / 2, size: s * 0.5, color: p.onAccent, sw: 2, trimEnd: k([o.t + 0.25, 0], [o.t + 0.95, 1, 'inOutCubic']) }),
    ],
    {
      x: o.x,
      y: o.y,
      w: s,
      h: s,
      ax: o.ax ?? 0.5,
      ay: o.ay ?? 0.5,
      scale: pop(o.t, 0.7, 'spring'),
      rotation: k([o.t, (o.rot ?? 0) - 18], [o.t + 0.9, o.rot ?? 0, 'outBack']),
    },
  );
}

/** Top-5 list with app-icon tiles, rank badges and a “best for” card on every tool slide. */
export const toolkitTop5: Recipe = {
  id: 'carousel-toolkit-top5',
  name: 'Toolkit Top 5',
  category: 'carousel',
  tags: ['carousel', 'tools', 'resources', 'list', 'top 5', 'apps', 'productivity'],
  description: 'Seven slides: an icon-cluster cover, five tool slides with springy app tiles and rank badges, and a save-and-share finale.',
  duration: 5,
  slides: 7,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Solo Studio' },
    { key: 'handle', label: 'Handle', default: '@solostudio.co' },
    { key: 'kicker', label: 'Cover kicker', default: 'Bookmark these' },
    { key: 'title', label: 'Cover title', default: '5 tools that save me 10 hours a week', multiline: true },
    { key: 'icons', label: 'Icons (comma separated)', default: 'clock, send, sparkle, lock, calendar' },
    { key: 'n1', label: 'Tool 1 name', default: 'A time tracker' },
    { key: 'd1', label: 'Tool 1 description', default: 'One click to start, one to stop. Every invoice now matches the hours I actually worked.', multiline: true },
    { key: 'b1', label: 'Tool 1 best for', default: 'Hourly client work' },
    { key: 'p1', label: 'Tool 1 price', default: 'Free plan' },
    { key: 'n2', label: 'Tool 2 name', default: 'An invoice builder' },
    { key: 'd2', label: 'Tool 2 description', default: 'Branded invoices in a minute, plus automatic reminders when a client pays late.', multiline: true },
    { key: 'b2', label: 'Tool 2 best for', default: 'Getting paid on time' },
    { key: 'p2', label: 'Tool 2 price', default: '$8 / month' },
    { key: 'n3', label: 'Tool 3 name', default: 'A mood-board app' },
    { key: 'd3', label: 'Tool 3 description', default: 'Drag in screenshots, colours and fonts. Clients approve a direction before I design.', multiline: true },
    { key: 'b3', label: 'Tool 3 best for', default: 'Kick-off meetings' },
    { key: 'p3', label: 'Tool 3 price', default: 'Free' },
    { key: 'n4', label: 'Tool 4 name', default: 'A password vault' },
    { key: 'd4', label: 'Tool 4 description', default: 'Share client logins safely and stop pasting passwords into chat threads.', multiline: true },
    { key: 'b4', label: 'Tool 4 best for', default: 'Client handovers' },
    { key: 'p4', label: 'Tool 4 price', default: '$3 / month' },
    { key: 'n5', label: 'Tool 5 name', default: 'A scheduling link' },
    { key: 'd5', label: 'Tool 5 description', default: 'Clients pick a slot that suits us both. No more eight-email back-and-forth.', multiline: true },
    { key: 'b5', label: 'Tool 5 best for', default: 'Discovery calls' },
    { key: 'p5', label: 'Tool 5 price', default: 'Free plan' },
    { key: 'cta', label: 'Final slide title', default: 'Which one are you trying first?', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'Save this list and share it with a friend who freelances.', multiline: true },
  ],
  variants: [
    { name: 'Arctic', palette: 'arctic', fonts: 'poppins' },
    {
      name: 'Noir Design',
      palette: 'noir',
      fonts: 'grotesk',
      copy: {
        brand: 'Pixel School',
        handle: '@pixel.school',
        kicker: 'Free resources',
        title: '5 free ways to learn UI design',
        icons: 'layers, eye, sparkle, play, chat',
        n1: 'A pattern library',
        d1: 'Hundreds of real app screens, sorted by flow. Steal structure, not pixels.',
        b1: 'Layout inspiration',
        p1: 'Free',
        n2: 'A contrast checker',
        d2: 'Paste two colours, get a pass or fail. Accessible design in ten seconds.',
        b2: 'Colour decisions',
        p2: 'Free',
        n3: 'An open icon set',
        d3: 'Thousands of consistent, open-licence icons you can use in any project.',
        b3: 'Mockups & prototypes',
        p3: 'Free',
        n4: 'A video course',
        d4: 'Ten hours on hierarchy, spacing and type, taught by working designers.',
        b4: 'Total beginners',
        p4: 'Free to audit',
        n5: 'A critique community',
        d5: 'Post your work, get honest feedback within a day. Give two, get one.',
        b5: 'Levelling up fast',
        p5: 'Free',
        cta: 'Save this and start tonight',
        ctaSub: 'Send it to the friend who keeps saying they want to learn design.',
      },
    },
    {
      name: 'Mint Calm',
      palette: 'mint',
      fonts: 'outfit',
      copy: {
        brand: 'Calm Desk',
        handle: '@calmdesk',
        kicker: 'Slow productivity',
        title: '5 apps for a calmer week',
        icons: 'check, clock, calendar, wallet, music',
        n1: 'A habit tracker',
        d1: 'Tiny daily check-ins. Seeing a streak is weirdly motivating.',
        b1: 'Building routines',
        p1: 'Free',
        n2: 'A focus timer',
        d2: '25 minutes on, 5 off. The break is the part that makes it work.',
        b2: 'Deep work blocks',
        p2: 'Free',
        n3: 'A meal planner',
        d3: 'Plan Sunday, shop once, stop deciding dinner at 7 pm every night.',
        b3: 'Busy weeknights',
        p3: '$4 / month',
        n4: 'A budget app',
        d4: 'Every payment sorted automatically. Money stress, down a level.',
        b4: 'Payday planning',
        p4: 'Free plan',
        n5: 'A sleep sound mixer',
        d5: 'Rain, fan or forest. Fall asleep faster without the phone in hand.',
        b5: 'Winding down',
        p5: 'Free',
        cta: 'Which one helps you most?',
        ctaSub: 'Save this for Sunday planning and share it with your team.',
      },
    },
    {
      name: 'Sunset Shop',
      palette: 'sunset',
      fonts: 'syne',
      copy: {
        brand: 'Shopfront Weekly',
        handle: '@shopfront.weekly',
        kicker: 'Small shop stack',
        title: '5 tools every small shop needs',
        icons: 'cart, mail, camera, star, calendar',
        n1: 'An online checkout',
        d1: 'Take card and wallet payments from one link. Live in an afternoon.',
        b1: 'Selling online fast',
        p1: '2.9% per sale',
        n2: 'An email newsletter',
        d2: 'Your best customers, one send away. Still the highest-return channel.',
        b2: 'Repeat customers',
        p2: 'Free to 500',
        n3: 'A phone photo studio',
        d3: 'A light box and a free editing app. Product shots that look pro.',
        b3: 'Listings & social',
        p3: '$40 once',
        n4: 'A review collector',
        d4: 'Ask every buyer for a review automatically, two days after delivery.',
        b4: 'Building trust',
        p4: 'Free plan',
        n5: 'A booking calendar',
        d5: 'Workshops and fittings, booked and paid for without a single call.',
        b5: 'Services & events',
        p5: '$12 / month',
        cta: 'Which one is next for your shop?',
        ctaSub: 'Save this and tag a fellow shop owner.',
      },
    },
  ],
  build(x) {
    const { u, p, slideW: S, slides: N } = x;
    const dur = 5;
    const m = 9 * u;
    const L: Layer[] = [];
    const icons = list(x.c.icons);
    const ic = (j: number) => icons[j] ?? 'sparkle';
    const tools: [string, string, string, string][] = [
      [x.c.n1, x.c.d1, x.c.b1, x.c.p1],
      [x.c.n2, x.c.d2, x.c.b2, x.c.p2],
      [x.c.n3, x.c.d3, x.c.b3, x.c.p3],
      [x.c.n4, x.c.d4, x.c.b4, x.c.p4],
      [x.c.n5, x.c.d5, x.c.b5, x.c.p5],
    ];

    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      L.push(
        x.body(`hd-b-${i}`, x.c.brand, { size: 2.9 * u, x: X + m, y: 9 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, opacity: fadeIn(0.05, 0.5) }),
        x.body(`hd-c-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, { size: 2.8 * u, x: X + S - m, y: 9 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.08, opacity: fadeIn(0.1, 0.5) }),
        ...progress(x, i, { y: 118 * u, on: p.accent, off: alpha(p.fg, 0.14) }),
      );
    }

    // ---------------------------------------------------------------- cover
    tools.forEach((_, j) => {
      L.push(tile(x, `cv-tile-${j}`, ic(j), { x: S / 2 + (j - 2) * 16.6 * u, y: 31 * u + Math.abs(j - 2) * 2.6 * u, size: 14 * u, t: 0.15 + j * 0.08, rot: (j - 2) * 6 }));
    });
    L.push(
      chip(x, 'cv-kicker', x.c.kicker, {
        x: m,
        y: 55 * u,
        size: 2.9 * u,
        fill: alpha(p.accent, 0.14),
        color: p.accent,
        upper: true,
        tracking: 0.1,
        icon: 'bookmark',
        scale: k([0.4, 0.7], [0.9, 1, 'outBack']),
        opacity: fadeIn(0.4, 0.3),
      }),
      x.title('cv-title', x.c.title, { size: tsz(x, 11 * u), x: m, y: 60.5 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.0, anim: ta.riseLines(0.5, { stagger: 0.12 }) }),
      x.body('cv-handle', x.c.handle, { size: 3 * u, x: m, y: 108 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, opacity: fadeIn(1.0, 0.5) }),
      swipeCue(x, 'cv-swipe', { x: S - m, y: 108 * u, bg: p.accent, fg: p.onAccent, t0: 1.1, dur }),
    );

    // ---------------------------------------------------------------- tools
    tools.forEach(([name, desc, best, price], j) => {
      const i = j + 1;
      const X = slideX(x, i);
      const ts = 30 * u;
      const tx = X + m;
      const ty = 18 * u;
      const rcx = tx + ts + 6 * u;
      L.push(
        tile(x, `tl-tile-${i}`, ic(j), { x: tx + ts / 2, y: ty + ts / 2, size: ts, t: 0.1, rot: j % 2 ? 4 : -4 }),
        circle(`tl-rank-${i}`, 4.4 * u, { x: tx + ts - 0.5 * u, y: ty + 0.5 * u, fill: p.fg, stroke: p.bg, strokeWidth: 0.6 * u, scale: pop(0.55, 0.5) }),
        x.title(`tl-rank-t-${i}`, String(i), { size: tsz(x, 4.4 * u), x: tx + ts - 0.5 * u, y: ty + 0.5 * u, fill: p.bg, lineHeight: 1, scale: pop(0.6, 0.5) }),
        x.body(`tl-no-${i}`, `No. ${i} of ${tools.length}`, { size: 2.8 * u, x: rcx, y: ty + 9 * u, ax: 0, align: 'left', weight: 700, fill: p.accent, uppercase: true, tracking: 0.14, anim: ta.slide(0.35, { stagger: 0.04 }) }),
        chip(x, `tl-price-${i}`, price, {
          x: rcx,
          y: ty + 18 * u,
          size: 3 * u,
          fill: p.surface,
          color: p.fg,
          stroke: alpha(p.fg, 0.12),
          icon: 'gift',
          iconColor: accentOn(p, p.surface),
          scale: k([0.5, 0.7], [1.0, 1, 'outBack']),
          opacity: fadeIn(0.5, 0.25),
        }),
        x.title(`tl-name-${i}`, name, { size: tsz(x, 9 * u), x: X + m, y: 70 * u, w: S - 2 * m, ax: 0, ay: 1, align: 'left', lineHeight: 1.03, anim: ta.rise(0.4, { stagger: 0.06 }) }),
        x.body(`tl-desc-${i}`, desc, { size: 4.1 * u, x: X + m, y: 74 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.4, fill: p.muted, anim: fadeUp(0.7) }),
        group(
          `tl-best-${i}`,
          [
            rect(`tl-best-${i}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: S - 2 * m, h: 11 * u, radius: 2.6 * u, fill: p.surface, stroke: alpha(p.fg, 0.08), strokeWidth: 0.2 * u }),
            icon(`tl-best-${i}-ic`, 'target', { x: 5 * u, y: 5.5 * u, size: 4.2 * u, color: accentOn(p, p.surface), sw: 2 }),
            x.body(`tl-best-${i}-l`, 'Best for', { size: 2.6 * u, x: 9.4 * u, y: 5.5 * u, ax: 0, align: 'left', weight: 700, fill: accentOn(p, p.surface), uppercase: true, tracking: 0.14, lineHeight: 1 }),
            x.body(`tl-best-${i}-v`, best, { size: 3.6 * u, x: 9.4 * u + estW('Best for', 2.6 * u, true, 0.14) + 2.6 * u, y: 5.5 * u, ax: 0, align: 'left', weight: 600, fill: p.fg, lineHeight: 1 }),
          ],
          { x: X + m, y: k([0.9, 101 * u], [1.6, 98 * u, 'outExpo']), w: S - 2 * m, h: 11 * u, ax: 0, ay: 0, opacity: fadeIn(0.9, 0.4) },
        ),
      );
    });

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      const c1 = 'Save';
      const c2 = 'Share';
      const w1 = chipW(c1, 3.3 * u, { icon: true });
      const w2 = chipW(c2, 3.3 * u, { icon: true });
      const gap = 3 * u;
      const x0 = cx - (w1 + gap + w2) / 2;
      tools.forEach((_, j) => L.push(tile(x, `ct-tile-${j}`, ic(j), { x: cx + (j - 2) * 12.4 * u, y: 32 * u, size: 10.4 * u, t: 0.1 + j * 0.07, rot: 0 })));
      L.push(
        x.title('ct-title', x.c.cta, { size: tsz(x, 8.8 * u), x: cx, y: 64 * u, w: S - 2 * m - 8 * u, ay: 1, lineHeight: 1.04, anim: ta.rise(0.45, { stagger: 0.06 }) }),
        x.body('ct-sub', x.c.ctaSub, { size: 4 * u, x: cx, y: 68.5 * u, w: S - 2 * m - 6 * u, ay: 0, fill: p.muted, anim: fadeUp(0.8) }),
        chip(x, 'ct-c1', c1, { x: x0, y: 90 * u, size: 3.3 * u, fill: p.accent, color: p.onAccent, icon: 'bookmark', scale: k([1.0, 0.6], [1.5, 1, 'outBack']), opacity: fadeIn(1.0, 0.25) }),
        chip(x, 'ct-c2', c2, { x: x0 + w1 + gap, y: 90 * u, size: 3.3 * u, fill: p.fg, color: p.bg, icon: 'send', scale: k([1.12, 0.6], [1.62, 1, 'outBack']), opacity: fadeIn(1.12, 0.25) }),
        x.body('ct-handle', x.c.handle, { size: 3 * u, x: cx, y: 101 * u, weight: 600, fill: p.muted, anim: ta.chars(1.3, { stagger: 0.02 }) }),
      );
    }

    return { layers: L };
  },
};
