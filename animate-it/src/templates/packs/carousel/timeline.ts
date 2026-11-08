import type { Layer } from '../../../engine/types';
import { type Recipe, circle, path, k, fadeIn, pop, ta, alpha } from '../../kit';
import { chip, fadeUp, icon, list, pad2, progress, seamDots, seamLine, slideX, swipeCue, tsz } from './shared';

/** Brand timeline: one ruler track runs through every slide, each milestone a node with a counting year. */
export const milestoneTrack: Recipe = {
  id: 'carousel-milestone-track',
  name: 'Milestone Track',
  category: 'carousel',
  tags: ['carousel', 'timeline', 'history', 'brand story', 'milestones', 'about us', 'seamless'],
  description: 'A ruler-style track runs through six slides; each milestone pops a node while its year counts up from the last one.',
  duration: 5.5,
  slides: 6,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Hearth & Co.' },
    { key: 'handle', label: 'Handle', default: '@hearthandco' },
    { key: 'kicker', label: 'Cover kicker', default: 'Our story' },
    { key: 'title', label: 'Cover title', default: 'From a kitchen table to 2 million homes', multiline: true },
    { key: 'sub', label: 'Cover line', default: 'Seven years, four big leaps and one stubborn idea.', multiline: true },
    { key: 'since', label: 'Track start label', default: 'Since 2019' },
    { key: 'icons', label: 'Milestone icons (comma separated)', default: 'flame, user, globe, trophy' },
    { key: 'y1', label: 'Year 1', default: '2019' },
    { key: 'h1', label: 'Milestone 1', default: 'Started at a kitchen table' },
    { key: 'b1', label: 'Milestone 1 detail', default: 'Two friends, one laptop and a waitlist of 40 neighbours.', multiline: true },
    { key: 'y2', label: 'Year 2', default: '2021' },
    { key: 'h2', label: 'Milestone 2', default: 'Our first 10,000 customers' },
    { key: 'b2', label: 'Milestone 2 detail', default: 'All word of mouth. We still have never run a TV ad.', multiline: true },
    { key: 'y3', label: 'Year 3', default: '2023' },
    { key: 'h3', label: 'Milestone 3', default: 'A team of 50 in three cities' },
    { key: 'b3', label: 'Milestone 3 detail', default: 'Lisbon, Leeds and Toronto. Fully remote, very caffeinated.', multiline: true },
    { key: 'y4', label: 'Year 4', default: '2026' },
    { key: 'h4', label: 'Milestone 4', default: '2 million homes and counting' },
    { key: 'b4', label: 'Milestone 4 detail', default: 'Now in 14 countries, still answering every email ourselves.', multiline: true },
    { key: 'cta', label: 'Final slide title', default: 'This is only chapter one.', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'Follow along for what we build next.', multiline: true },
  ],
  variants: [
    { name: 'Ocean', palette: 'ocean', fonts: 'fraunces', logo: 'wave' },
    {
      name: 'Slate Startup',
      palette: 'slate',
      fonts: 'manrope',
      logo: 'knot',
      copy: {
        brand: 'Relay',
        handle: '@relay.hq',
        kicker: 'Five years of Relay',
        title: 'From side project to 40,000 teams',
        sub: 'A short history of the tool we built to fix our own handoffs.',
        since: 'Since 2021',
        icons: 'bolt, rocket, user, trophy',
        y1: '2021',
        h1: 'A weekend side project',
        b1: 'Built to stop our own team from losing work between shifts.',
        y2: '2022',
        h2: 'Public launch day',
        b2: '1,200 sign-ups in 24 hours and one very tired server.',
        y3: '2024',
        h3: 'Series A and 60 people',
        b3: 'Funding to go deep on reliability, security and support.',
        y4: '2026',
        h4: '40,000 teams on board',
        b4: 'From startups to hospitals, handoffs now take seconds.',
        cta: 'The next chapter starts now.',
        ctaSub: 'Follow us for the roadmap reveal next month.',
      },
    },
    {
      name: 'Azure Library',
      palette: 'azure',
      fonts: 'dmserif',
      logo: 'arc',
      copy: {
        brand: 'Open Shelf',
        handle: '@openshelf.org',
        kicker: 'Our impact',
        title: 'From one bookshelf to 120 free libraries',
        sub: 'How a neighbourhood swap box became a national network.',
        since: 'Since 2018',
        icons: 'bookmark, heart, globe, star',
        y1: '2018',
        h1: 'One shelf on one street',
        b1: 'A painted box outside a café and a sign that said “take one”.',
        y2: '2020',
        h2: '25 shelves, 60 volunteers',
        b2: 'Neighbours started building their own. We wrote a how-to.',
        y3: '2023',
        h3: 'Registered as a charity',
        b3: 'School partnerships brought books to 9,000 children.',
        y4: '2026',
        h4: '120 libraries nationwide',
        b4: 'Over 300,000 books swapped, every single one for free.',
        cta: 'Help us open shelf 121.',
        ctaSub: 'Follow, share or volunteer. Every bit counts.',
      },
    },
    {
      name: 'Graphite Roasters',
      palette: 'graphite',
      fonts: 'sora',
      logo: 'orbit',
      copy: {
        brand: 'Ember & Oak',
        handle: '@emberandoak',
        kicker: 'Roasted since 2017',
        title: 'From a garage roaster to 30 cafés',
        sub: 'Ten years of chasing a better cup, one batch at a time.',
        since: 'Since 2017',
        icons: 'flame, gift, globe, trophy',
        y1: '2017',
        h1: 'First batch in a garage',
        b1: 'A secondhand 5 kg roaster and a lot of burnt beans.',
        y2: '2019',
        h2: 'Our first café partner',
        b2: 'A corner shop down the road took a chance on us.',
        y3: '2022',
        h3: 'Direct trade with 8 farms',
        b3: 'Fair prices, long-term deals and visits every harvest.',
        y4: '2026',
        h4: '30 cafés pour our coffee',
        b4: 'Plus a roastery you can visit every Saturday morning.',
        cta: 'Come taste chapter two.',
        ctaSub: 'Follow for new single-origin drops every month.',
      },
    },
  ],
  build(x) {
    const { u, W, H, p, slideW: S, slides: N } = x;
    const dur = 5.5;
    const m = 9 * u;
    const L: Layer[] = [];
    const ty = 62 * u;
    const nodeDX = m + 5.5 * u;
    const endX = (N - 1) * S + nodeDX;
    const icons = list(x.c.icons);
    const t0 = 0.15;
    const d = 1.3;

    // track: ghost rail, ticks, then the accent progress drawing on every slide
    L.push(...seamLine(x, 'trk-ghost', () => ty, { from: m, to: endX, stroke: alpha(p.fg, 0.12), width: 1.2 * u, t0: 0, dur: 0.6, ease: 'outCubic' }));
    for (let i = 0; i < N; i++) {
      let d2 = '';
      const step = 4.5 * u;
      const from = i === 0 ? m : 0;
      const to = i === N - 1 ? S - m : S;
      for (let tx = Math.ceil(from / step) * step; tx <= to; tx += step) d2 += `M${tx.toFixed(1)} ${(ty + 2.6 * u).toFixed(1)}V${(ty + (Math.round(tx / step) % 4 === 0 ? 5.6 : 4.2) * u).toFixed(1)}`;
      L.push(path(`trk-ticks-${i}`, d2, S, H, { x: i * S, y: 0, w: S, h: H, ax: 0, ay: 0, stroke: alpha(p.fg, 0.22), strokeWidth: 0.22 * u, lineCap: 'butt', opacity: fadeIn(0.1, 0.8) }));
    }
    L.push(
      ...seamLine(x, 'trk-fill', () => ty, { from: m, to: endX, stroke: p.accent, width: 1.2 * u, t0, dur: d }),
      ...seamDots(x, 'trk-future', () => ty, { from: endX + 8 * u, to: W - m, gap: 2.4 * u, r: 0.45 * u, fill: p.accent, opacity: fadeIn(1.2, 0.6) }),
    );

    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      L.push(
        x.logo(`hd-logo-${i}`, { size: 4.6 * u, x: X + m + 2.3 * u, y: 9 * u, color: p.accent, opacity: fadeIn(0.05, 0.5) }),
        x.body(`hd-b-${i}`, x.c.brand, { size: 2.9 * u, x: X + m + 6.4 * u, y: 9 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, opacity: fadeIn(0.1, 0.5) }),
        x.body(`hd-c-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, { size: 2.8 * u, x: X + S - m, y: 9 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.08, opacity: fadeIn(0.15, 0.5) }),
        ...progress(x, i, { y: 118 * u, on: p.accent, off: alpha(p.fg, 0.14) }),
      );
    }

    // ---------------------------------------------------------------- cover
    L.push(
      chip(x, 'cv-kicker', x.c.kicker, {
        x: m,
        y: 20 * u,
        size: 2.9 * u,
        fill: alpha(p.accent, 0.14),
        color: p.accent,
        upper: true,
        tracking: 0.1,
        scale: k([0.1, 0.7], [0.6, 1, 'outBack']),
        opacity: fadeIn(0.1, 0.3),
      }),
      x.title('cv-title', x.c.title, { size: tsz(x, 9.8 * u), x: m, y: 26 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.0, anim: ta.riseLines(0.25, { stagger: 0.12 }) }),
      circle('cv-start-r', 2.6 * u, { x: m + 2.6 * u, y: ty, fill: p.bg, stroke: p.accent, strokeWidth: 0.6 * u, scale: pop(0.05, 0.5) }),
      x.body('cv-since', x.c.since, { size: 2.7 * u, x: m, y: ty + 10 * u, ax: 0, align: 'left', weight: 700, fill: p.accent, uppercase: true, tracking: 0.14, anim: ta.slide(0.4, { stagger: 0.04 }) }),
      x.body('cv-sub', x.c.sub, { size: 4.2 * u, x: m, y: 80 * u, w: S - 2 * m - 8 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1.4, fill: p.muted, anim: fadeUp(0.7) }),
      x.body('cv-handle', x.c.handle, { size: 3 * u, x: m, y: 106 * u, ax: 0, align: 'left', weight: 600, fill: p.muted, opacity: fadeIn(1.0, 0.5) }),
      swipeCue(x, 'cv-swipe', { x: S - m, y: 106 * u, bg: p.accent, fg: p.onAccent, t0: 1.1, dur }),
    );

    // ---------------------------------------------------------------- milestones
    const ms: [string, string, string][] = [
      [x.c.y1, x.c.h1, x.c.b1],
      [x.c.y2, x.c.h2, x.c.b2],
      [x.c.y3, x.c.h3, x.c.b3],
      [x.c.y4, x.c.h4, x.c.b4],
    ];
    ms.forEach(([yr, h, b], n) => {
      const i = n + 1;
      const X = slideX(x, i);
      const nx = X + nodeDX;
      const arrive = t0 + d * 0.32;
      const cur = parseInt(yr, 10);
      const prev = n === 0 ? cur - 3 : parseInt(ms[n - 1][0], 10);
      const isYear = /^\d{4}$/.test(yr.trim()) && isFinite(prev);
      L.push(
        x.body(`ms-ch-${i}`, `Chapter ${pad2(i)}`, { size: 2.7 * u, x: X + m, y: 22 * u, ax: 0, align: 'left', weight: 700, fill: p.muted, uppercase: true, tracking: 0.16, anim: ta.slide(0.1, { stagger: 0.04 }) }),
        x.title(`ms-yr-${i}`, yr, {
          size: tsz(x, 21 * u),
          x: X + m - 0.6 * u,
          y: 54 * u,
          ax: 0,
          ay: 1,
          align: 'left',
          lineHeight: 1,
          fill: p.accent,
          ...(isYear ? { counter: { from: prev, to: cur, start: 0.25, dur: 1.3, ease: 'outExpo' as const, separator: false } } : {}),
          opacity: fadeIn(0.2, 0.4),
        }),
        circle(`ms-halo-${i}`, 8.5 * u, {
          x: nx,
          y: ty,
          fill: alpha(p.accent, 0.18),
          scale: k([arrive, 0], [arrive + 0.6, 1, 'outBack'], [arrive + 1.6, 0.82, 'inOutSine'], [arrive + 2.6, 1, 'inOutSine'], [dur, 0.85, 'inOutSine']),
        }),
        circle(`ms-node-${i}`, 5.6 * u, { x: nx, y: ty, fill: p.accent, stroke: p.bg, strokeWidth: 0.7 * u, scale: pop(arrive, 0.55) }),
        icon(`ms-ic-${i}`, icons[n] ?? 'star', { x: nx, y: ty, size: 5.4 * u, color: p.onAccent, sw: 2, trimEnd: k([arrive + 0.15, 0], [arrive + 0.8, 1, 'inOutCubic']) }),
        x.title(`ms-h-${i}`, h, { size: tsz(x, 7.4 * u), x: X + m, y: 87 * u, w: S - 2 * m, ax: 0, ay: 1, align: 'left', lineHeight: 1.04, anim: ta.rise(0.55, { stagger: 0.05 }) }),
        x.body(`ms-b-${i}`, b, { size: 4 * u, x: X + m, y: 91 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.4, fill: p.muted, anim: fadeUp(0.85) }),
      );
    });

    // ---------------------------------------------------------------- CTA / now
    {
      const i = N - 1;
      const X = slideX(x, i);
      const nx = X + nodeDX;
      const arrive = t0 + d * 0.32;
      L.push(
        circle('ct-pulse', 7 * u, {
          x: nx,
          y: ty,
          stroke: p.accent,
          strokeWidth: 0.4 * u,
          scale: k([arrive + 0.3, 1], [arrive + 1.5, 2.2, 'outCubic'], [arrive + 1.51, 1], [arrive + 2.7, 2.2, 'outCubic']),
          opacity: k([arrive + 0.29, 0], [arrive + 0.3, 0.9], [arrive + 1.5, 0, 'outCubic'], [arrive + 1.51, 0.9], [arrive + 2.7, 0, 'outCubic']),
        }),
        circle('ct-node', 6.4 * u, { x: nx, y: ty, fill: p.accent, stroke: p.bg, strokeWidth: 0.7 * u, scale: pop(arrive, 0.7, 'spring') }),
        icon('ct-ic', 'sparkle', { x: nx, y: ty, size: 6.4 * u, color: p.onAccent, sw: 2, trimEnd: k([arrive + 0.15, 0], [arrive + 0.8, 1, 'inOutCubic']) }),
        x.body('ct-next', 'What’s next', { size: 2.7 * u, x: X + S - m, y: ty - 5.5 * u, ax: 1, align: 'right', weight: 700, fill: p.accent, uppercase: true, tracking: 0.14, anim: ta.slide(1.2, { stagger: 0.04 }) }),
        icon('ct-arrow', 'arrowRight', { x: X + S - m - 2 * u, y: ty, size: 4.4 * u, color: p.accent, sw: 2.2, opacity: fadeIn(1.3, 0.3) }),
        x.title('ct-title', x.c.cta, { size: tsz(x, 9.4 * u), x: X + m, y: 52 * u, w: S - 2 * m, ax: 0, ay: 1, align: 'left', lineHeight: 1.02, anim: ta.riseLines(0.3, { stagger: 0.12 }) }),
        x.body('ct-sub', x.c.ctaSub, { size: 4.2 * u, x: X + m, y: 76 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.4, fill: p.muted, anim: fadeUp(0.7) }),
        chip(x, 'ct-follow', `Follow ${x.c.handle}`, {
          x: X + m,
          y: 95 * u,
          size: 3.3 * u,
          fill: p.fg,
          color: p.bg,
          icon: 'plus',
          scale: k([1.0, 0.6], [1.5, 1, 'outBack']),
          opacity: fadeIn(1.0, 0.25),
        }),
      );
    }

    return { layers: L };
  },
};
