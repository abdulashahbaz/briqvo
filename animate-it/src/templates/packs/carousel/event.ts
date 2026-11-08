import type { Layer } from '../../../engine/types';
import { type Recipe, rect, circle, ellipse, group, image, k, fadeIn, pop, ta, alpha } from '../../kit';
import { chip, estW, fadeUp, icon, pad2, shadowCol, slideX, swipeCue, tsz } from './shared';

/** Event line-up: speakers, agenda and a ticket, with a marquee band that scrolls under every slide. */
export const eventLineup: Recipe = {
  id: 'carousel-event-lineup',
  name: 'Event Line-up',
  category: 'carousel',
  tags: ['carousel', 'event', 'conference', 'speakers', 'agenda', 'tickets', 'seamless'],
  description: 'Cover, two speaker slides, an agenda and a ticket, all riding a marquee band that scrolls across every slide.',
  duration: 5,
  slides: 5,
  images: [
    { key: 'sp1', label: 'Speaker 1 photo', art: 'portrait' },
    { key: 'sp2', label: 'Speaker 2 photo', art: 'portrait' },
    { key: 'sp3', label: 'Speaker 3 photo', art: 'portrait' },
    { key: 'sp4', label: 'Speaker 4 photo', art: 'portrait' },
  ],
  fields: [
    { key: 'brand', label: 'Organiser', default: 'Makers Guild' },
    { key: 'handle', label: 'Handle', default: '@makersguild' },
    { key: 'kicker', label: 'Cover kicker', default: 'Speaker line-up' },
    { key: 'event', label: 'Event name', default: 'Making Things Summit', multiline: true },
    { key: 'tagline', label: 'Tagline', default: 'Two days of craft, code and honest conversation.', multiline: true },
    { key: 'date', label: 'Date', default: 'March 14–15, 2027' },
    { key: 'place', label: 'Place', default: 'Lisbon & online' },
    { key: 'stage1', label: 'Speakers slide 1 label', default: 'Day one · Main stage' },
    { key: 'stage2', label: 'Speakers slide 2 label', default: 'Day two · Studio' },
    { key: 'n1', label: 'Speaker 1 name', default: 'Maya Okafor' },
    { key: 'r1', label: 'Speaker 1 role', default: 'Design Director, Lumen Health' },
    { key: 't1', label: 'Speaker 1 talk', default: 'Designing calm software' },
    { key: 'h1', label: 'Speaker 1 time', default: '09:30' },
    { key: 'n2', label: 'Speaker 2 name', default: 'Tomás Ferreira' },
    { key: 'r2', label: 'Speaker 2 role', default: 'Founder, Brickyard Games' },
    { key: 't2', label: 'Speaker 2 talk', default: 'Shipping a hit with six people' },
    { key: 'h2', label: 'Speaker 2 time', default: '11:00' },
    { key: 'n3', label: 'Speaker 3 name', default: 'Aiko Tanaka' },
    { key: 'r3', label: 'Speaker 3 role', default: 'Principal Engineer, Fjord Cloud' },
    { key: 't3', label: 'Speaker 3 talk', default: 'The boring tech that scales' },
    { key: 'h3', label: 'Speaker 3 time', default: '10:00' },
    { key: 'n4', label: 'Speaker 4 name', default: 'Sam Adeyemi' },
    { key: 'r4', label: 'Speaker 4 role', default: 'Head of Brand, Field & Folk' },
    { key: 't4', label: 'Speaker 4 talk', default: 'Brands people actually miss' },
    { key: 'h4', label: 'Speaker 4 time', default: '14:30' },
    { key: 'agendaTitle', label: 'Agenda title', default: 'Day one at a glance', multiline: true },
    { key: 'a1', label: 'Agenda 1 (time + title)', default: '09:00 Doors open & coffee' },
    { key: 'a2', label: 'Agenda 2', default: '09:30 Opening keynote' },
    { key: 'a3', label: 'Agenda 3', default: '11:00 Hands-on workshops' },
    { key: 'a4', label: 'Agenda 4', default: '13:00 Long lunch by the river' },
    { key: 'a5', label: 'Agenda 5', default: '17:30 Closing drinks' },
    { key: 'price', label: 'Ticket price', default: 'Early bird €149' },
    { key: 'cta', label: 'Final slide title', default: 'Grab your early-bird ticket', multiline: true },
    { key: 'ctaSub', label: 'Final slide line', default: 'Prices go up on February 1.' },
    { key: 'ctaBtn', label: 'Final slide button', default: 'Get tickets' },
  ],
  variants: [
    { name: 'Royal', palette: 'royal', fonts: 'syne' },
    {
      name: 'Cobalt Breakfast',
      palette: 'cobalt',
      fonts: 'editorial',
      copy: {
        brand: 'Local Founders',
        handle: '@localfounders',
        kicker: 'Who is speaking',
        event: 'Small Business Breakfast',
        tagline: 'Honest talks from owners who built it the hard way.',
        date: 'Thursday, May 8',
        place: 'The Assembly Rooms, Bristol',
        stage1: 'Morning talks',
        stage2: 'Fireside chats',
        n1: 'Grace Whitfield',
        r1: 'Owner, Copper Kettle Café',
        t1: 'From one stall to four shops',
        h1: '08:15',
        n2: 'Ravi Mehta',
        r2: 'Founder, Tidy Books Accounting',
        t2: 'Cash flow without the panic',
        h2: '08:45',
        n3: 'Chloe Marsh',
        r3: 'Co-founder, Fern & Fable Florists',
        t3: 'Instagram that sells flowers',
        h3: '09:15',
        n4: 'Daniel Osei',
        r4: 'Director, Osei Joinery',
        t4: 'Hiring your first five people',
        h4: '09:45',
        agendaTitle: 'The morning, minute by minute',
        a1: '07:45 Coffee & pastries',
        a2: '08:15 Morning talks',
        a3: '09:15 Fireside chats',
        a4: '10:00 Speed networking',
        a5: '10:45 Wrap up',
        price: 'Members free',
        cta: 'Save your seat at the table',
        ctaSub: 'Only 80 seats. Breakfast is on us.',
        ctaBtn: 'Reserve a seat',
      },
    },
    {
      name: 'Cyber Game Dev',
      palette: 'cyber',
      fonts: 'space',
      copy: {
        brand: 'Pixel Frontiers',
        handle: '@pixelfrontiers',
        kicker: 'Line-up drop',
        event: 'Pixel Frontiers Live',
        tagline: 'Indie game makers, live demos and late-night playtests.',
        date: 'October 3–4',
        place: 'Berlin · Hall 4',
        stage1: 'Day one · Arena',
        stage2: 'Day two · Dev lounge',
        n1: 'Kai Lindqvist',
        r1: 'Creative Lead, Moonwell Studio',
        t1: 'Worlds that feel hand-made',
        h1: '12:00',
        n2: 'Nadia Rahman',
        r2: 'Audio Director, Sixfold',
        t2: 'Sound is half the game',
        h2: '14:00',
        n3: 'Leo Martins',
        r3: 'Solo developer',
        t3: 'Launching on zero budget',
        h3: '11:00',
        n4: 'Yuna Park',
        r4: 'Producer, Lantern Arcade',
        t4: 'Playtests that tell the truth',
        h4: '15:30',
        agendaTitle: 'Day one schedule',
        a1: '10:00 Doors & demo floor',
        a2: '12:00 Keynote',
        a3: '14:00 Talks & panels',
        a4: '18:00 Indie showcase',
        a5: '21:00 Late-night playtests',
        price: '2-day pass €89',
        cta: 'Lock in your 2-day pass',
        ctaSub: 'Student tickets drop on Friday.',
        ctaBtn: 'Get passes',
      },
    },
    {
      name: 'Sand Festival',
      palette: 'sand',
      fonts: 'serif',
      copy: {
        brand: 'Harvest Table',
        handle: '@harvesttable.fest',
        kicker: 'Meet the cooks',
        event: 'Harvest Table Festival',
        tagline: 'Long tables, slow food and the people who grow it.',
        date: 'September 20–21',
        place: 'Old Mill Farm, Somerset',
        stage1: 'Saturday · Big tent',
        stage2: 'Sunday · Orchard stage',
        n1: 'Elena Russo',
        r1: 'Chef & owner, Casa Russo',
        t1: 'Pasta, the slow way',
        h1: '11:00',
        n2: 'Ben Harlow',
        r2: 'Grower, Harlow Market Garden',
        t2: 'Soil you can taste',
        h2: '13:00',
        n3: 'Amira Haddad',
        r3: 'Baker, Ember Bread Co.',
        t3: 'Sourdough for busy people',
        h3: '10:30',
        n4: 'Joe Lindley',
        r4: 'Forager & writer',
        t4: 'Dinner from the hedgerow',
        h4: '15:00',
        agendaTitle: 'Saturday at the farm',
        a1: '10:00 Gates & market open',
        a2: '11:00 Cooking demos',
        a3: '13:00 Long-table lunch',
        a4: '16:00 Cider tasting',
        a5: '19:00 Fireside supper',
        price: 'Weekend pass £45',
        cta: 'Pull up a chair at the long table',
        ctaSub: 'Kids under 12 go free.',
        ctaBtn: 'Book tickets',
      },
    },
  ],
  build(x) {
    const { u, W, H, p, slideW: S, slides: N } = x;
    const dur = 5;
    const m = 9 * u;
    const L: Layer[] = [];
    const bandY = 112 * u;

    // marquee band under every slide
    const unit = `${x.c.event.replace(/\n/g, ' ')}  •  ${x.c.date}  •  ${x.c.place}  •  `;
    const unitW = estW(unit, 3.1 * u, true, 0.14);
    const reps = Math.max(2, Math.ceil((W + 60 * u) / Math.max(1, unitW)) + 1);
    L.push(
      rect('mq-band', { x: 0, y: k([0, H + 1 * u], [0.7, bandY, 'outExpo']), ax: 0, ay: 0, w: W, h: H - bandY + 2 * u, fill: p.accent }),
      x.body('mq-text', unit.repeat(reps), {
        size: 3.1 * u,
        x: k([0, 0], [dur, -34 * u, 'linear']),
        y: k([0, H + 8 * u], [0.75, bandY + (H - bandY) / 2, 'outExpo']),
        ax: 0,
        align: 'left',
        weight: 700,
        fill: p.onAccent,
        uppercase: true,
        tracking: 0.14,
        lineHeight: 1,
      }),
    );

    for (let i = 1; i < N - 1; i++) {
      const X = slideX(x, i);
      L.push(x.body(`hd-c-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, { size: 2.8 * u, x: X + S - m, y: 14 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.08, opacity: fadeIn(0.1, 0.5) }));
    }

    // ---------------------------------------------------------------- cover
    {
      const ox = S - 23 * u;
      const oy = 25 * u;
      [7, 11, 15].forEach((r, j) =>
        L.push(
          ellipse(`cv-ring-${j}`, {
            x: ox,
            y: oy,
            w: r * 2 * u,
            h: r * 2 * u,
            stroke: alpha(p.accent, 0.55 - j * 0.15),
            strokeWidth: 0.5 * u,
            arcStart: k([0.1 + j * 0.1, 0.25], [1.4 + j * 0.1, 0, 'inOutCubic']),
            arcEnd: k([0.1 + j * 0.1, 0.25], [1.4 + j * 0.1, 1, 'inOutCubic']),
            rotation: k([0, 0], [dur, j % 2 ? -40 : 40, 'linear']),
          }),
        ),
      );
      L.push(
        circle('cv-ring-core', 4 * u, { x: ox, y: oy, fill: p.accent, scale: pop(0.3, 0.7, 'spring') }),
        icon('cv-ring-mic', 'mic', { x: ox, y: oy, size: 4.6 * u, color: p.onAccent, sw: 2, scale: pop(0.4, 0.6) }),
        chip(x, 'cv-kicker', x.c.kicker, {
          x: m,
          y: 14 * u,
          size: 2.9 * u,
          fill: alpha(p.accent, 0.16),
          color: p.accent,
          upper: true,
          tracking: 0.1,
          scale: k([0.1, 0.7], [0.6, 1, 'outBack']),
          opacity: fadeIn(0.1, 0.3),
        }),
        x.title('cv-event', x.c.event, { size: tsz(x, 11.6 * u), x: m, y: 66 * u, w: S - 2 * m, ax: 0, ay: 1, align: 'left', lineHeight: 0.98, anim: ta.riseLines(0.3, { stagger: 0.12 }) }),
        x.body('cv-tag', x.c.tagline, { size: 4.1 * u, x: m, y: 70.5 * u, w: S - 2 * m - 10 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1.38, fill: p.muted, anim: fadeUp(0.7) }),
        icon('cv-cal', 'calendar', { x: m + 2.2 * u, y: 90 * u, size: 4.2 * u, color: p.accent, sw: 2, opacity: fadeIn(1.0, 0.4) }),
        x.body('cv-date', x.c.date, { size: 3.6 * u, x: m + 6.6 * u, y: 90 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, anim: ta.slide(1.0, { stagger: 0.04 }) }),
        icon('cv-pin', 'pin', { x: m + 2.2 * u, y: 97.5 * u, size: 4.2 * u, color: p.accent, sw: 2, opacity: fadeIn(1.1, 0.4) }),
        x.body('cv-place', x.c.place, { size: 3.6 * u, x: m + 6.6 * u, y: 97.5 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, anim: ta.slide(1.1, { stagger: 0.04 }) }),
        swipeCue(x, 'cv-swipe', { x: S - m, y: 97.5 * u, bg: p.fg, fg: p.bg, t0: 1.2, dur }),
      );
    }

    // ---------------------------------------------------------------- speakers
    const sp: [string, string, string, string][] = [
      [x.c.n1, x.c.r1, x.c.t1, x.c.h1],
      [x.c.n2, x.c.r2, x.c.t2, x.c.h2],
      [x.c.n3, x.c.r3, x.c.t3, x.c.h3],
      [x.c.n4, x.c.r4, x.c.t4, x.c.h4],
    ];
    [1, 2].forEach((i) => {
      const X = slideX(x, i);
      L.push(
        chip(x, `sp-stage-${i}`, i === 1 ? x.c.stage1 : x.c.stage2, {
          x: X + m,
          y: 14 * u,
          size: 2.8 * u,
          fill: alpha(p.fg, 0.08),
          color: p.fg,
          icon: 'mic',
          iconColor: p.accent,
          opacity: fadeIn(0.1, 0.3),
          scale: k([0.1, 0.8], [0.6, 1, 'outBack']),
        }),
      );
      [0, 1].forEach((r) => {
        const j = (i - 1) * 2 + r;
        const [name, role, talk, time] = sp[j];
        const y0 = 25 * u + r * 43 * u;
        const t = 0.2 + r * 0.25;
        const px = X + m + 12.5 * u;
        const py = y0 + 15 * u;
        const tx = X + m + 31 * u;
        const tw = S - 2 * m - 31 * u;
        L.push(
          ellipse(`sp-ring-${j}`, { x: px, y: py, w: 30 * u, h: 30 * u, stroke: p.accent, strokeWidth: 0.5 * u, arcEnd: k([t, 0], [t + 1.0, 1, 'inOutCubic']), rotation: -30 }),
          image(`sp-img-${j}`, x.img[j], { x: px, y: py, w: 25 * u, h: 25 * u, radius: 12.5 * u, scale: pop(t, 0.7, 'outBack') }),
          chip(x, `sp-time-${j}`, time, {
            x: px,
            y: py + 13.5 * u,
            ax: 0.5,
            size: 2.5 * u,
            fill: p.accent,
            color: p.onAccent,
            icon: 'clock',
            scale: k([t + 0.5, 0.5], [t + 0.9, 1, 'outBack']),
            opacity: fadeIn(t + 0.5, 0.2),
          }),
          x.title(`sp-name-${j}`, name, { size: tsz(x, 6 * u), x: tx, y: y0 + 9.4 * u, w: tw, ax: 0, ay: 1, align: 'left', lineHeight: 1.02, anim: ta.rise(t + 0.15, { stagger: 0.05 }) }),
          x.body(`sp-role-${j}`, role, { size: 3.1 * u, x: tx, y: y0 + 11 * u, w: tw, ax: 0, ay: 0, align: 'left', weight: 500, fill: p.muted, lineHeight: 1.3, anim: fadeUp(t + 0.3, { stagger: 0.02 }) }),
          x.body(`sp-talk-${j}`, `“${talk}”`, { size: 3.9 * u, x: tx, y: y0 + 19.5 * u, w: tw, ax: 0, ay: 0, align: 'left', weight: 600, fill: p.fg, lineHeight: 1.3, anim: fadeUp(t + 0.4, { stagger: 0.025 }) }),
        );
        if (r === 0) L.push(rect(`sp-div-${i}`, { x: X + m, y: y0 + 37 * u, ax: 0, w: k([0.4, 0.01], [1.2, S - 2 * m, 'outExpo']), h: 0.2 * u, fill: alpha(p.fg, 0.12) }));
      });
    });

    // ---------------------------------------------------------------- agenda
    {
      const i = 3;
      const X = slideX(x, i);
      const rows = [x.c.a1, x.c.a2, x.c.a3, x.c.a4, x.c.a5].map((s) => {
        const sp = s.indexOf(' ');
        return sp > 0 ? [s.slice(0, sp), s.slice(sp + 1)] : ['', s];
      });
      const lx = X + m + 18 * u;
      const y0 = 42 * u;
      const step = 13.5 * u;
      L.push(
        x.title('ag-title', x.c.agendaTitle, { size: tsz(x, 7.6 * u), x: X + m, y: 21 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', lineHeight: 1.04, anim: ta.rise(0.15, { stagger: 0.05 }) }),
        rect('ag-line', { x: lx, y: y0, ax: 0.5, ay: 0, w: 0.3 * u, h: k([0.3, 0.01], [1.3, step * 4, 'inOutCubic']), fill: alpha(p.fg, 0.18) }),
      );
      rows.forEach(([tm, ttl], r) => {
        const y = y0 + r * step;
        const t = 0.35 + r * 0.12;
        L.push(
          x.body(`ag-t-${r}`, tm, { size: 3.4 * u, x: X + m, y, ax: 0, align: 'left', weight: 700, fill: p.accent, tracking: 0.02, anim: ta.slide(t, { by: 'char', stagger: 0.02 }) }),
          circle(`ag-d-${r}`, 1.3 * u, { x: lx, y, fill: r === 1 ? p.accent : p.bg, stroke: p.accent, strokeWidth: 0.45 * u, scale: pop(t + 0.1, 0.5) }),
          x.body(`ag-s-${r}`, ttl, { size: 4 * u, x: lx + 5 * u, y, w: X + S - m - (lx + 5 * u), ax: 0, align: 'left', weight: 600, fill: p.fg, anim: ta.slide(t + 0.05, { stagger: 0.03 }) }),
        );
      });
    }

    // ---------------------------------------------------------------- ticket CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const tw = S - 2 * m;
      const th = 38 * u;
      const cut = tw - 22 * u;
      const tick: Layer[] = [
        rect('tk-bg', { x: 0, y: 0, ax: 0, ay: 0, w: tw, h: th, radius: 3.4 * u, fill: p.accent, shadow: { color: shadowCol(p, 0.3), blur: 5 * u, y: 2 * u } }),
        circle('tk-n1', 2.8 * u, { x: cut, y: 0, fill: p.bg }),
        circle('tk-n2', 2.8 * u, { x: cut, y: th, fill: p.bg }),
        ...Array.from({ length: 7 }, (_, j) => rect(`tk-p${j}`, { x: cut, y: (6 + j * 5) * u, w: 0.4 * u, h: 2.4 * u, radius: 0.2 * u, fill: alpha(p.onAccent, 0.4) })),
        x.body('tk-admit', 'Admit one', { size: 2.4 * u, x: 5 * u, y: 7 * u, ax: 0, align: 'left', weight: 700, fill: alpha(p.onAccent, 0.75), uppercase: true, tracking: 0.18, lineHeight: 1 }),
        x.title('tk-event', x.c.event, { size: tsz(x, 4.6 * u), x: 5 * u, y: 11 * u, w: cut - 9 * u, ax: 0, ay: 0, align: 'left', lineHeight: 1.02, fill: p.onAccent }),
        x.body('tk-date', x.c.date, { size: 2.9 * u, x: 5 * u, y: th - 9.5 * u, ax: 0, align: 'left', weight: 700, fill: p.onAccent, lineHeight: 1 }),
        x.body('tk-place', x.c.place, { size: 2.9 * u, x: 5 * u, y: th - 5 * u, ax: 0, align: 'left', weight: 500, fill: alpha(p.onAccent, 0.8), lineHeight: 1 }),
        x.body('tk-price', x.c.price, { size: 3 * u, x: cut + 11 * u, y: th / 2, weight: 700, fill: p.onAccent, uppercase: true, tracking: 0.08, lineHeight: 1, rotation: -90 }),
      ];
      L.push(
        group('tk', tick, {
          x: k([0.1, X + S + 10 * u], [1.0, X + S / 2, 'outExpo']),
          y: 32 * u,
          w: tw,
          h: th,
          rotation: k([0.1, 8], [1.2, -3, 'outBack']),
          opacity: fadeIn(0.1, 0.3),
        }),
        x.title('ct-title', x.c.cta, { size: tsz(x, 8.4 * u), x: X + m, y: 83 * u, w: S - 2 * m, ax: 0, ay: 1, align: 'left', lineHeight: 1.03, anim: ta.rise(0.5, { stagger: 0.06 }) }),
        x.body('ct-sub', x.c.ctaSub, { size: 3.9 * u, x: X + m, y: 87.5 * u, w: S - 2 * m, ax: 0, ay: 0, align: 'left', fill: p.muted, anim: fadeUp(0.8) }),
        chip(x, 'ct-btn', x.c.ctaBtn, {
          x: X + m,
          y: 101 * u,
          size: 3.3 * u,
          fill: p.fg,
          color: p.bg,
          icon: 'ticket',
          scale: k([1.0, 0.6], [1.5, 1, 'outBack']),
          opacity: fadeIn(1.0, 0.25),
        }),
        x.body('ct-handle', x.c.handle, { size: 3 * u, x: X + S - m, y: 101 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, anim: ta.chars(1.2, { stagger: 0.02 }) }),
      );
    }

    return { layers: L };
  },
};
