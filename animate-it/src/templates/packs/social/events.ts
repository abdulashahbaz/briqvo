/** Events & countdowns: webinar, flip countdown, save the date, live now. */
import type { Layer, Ease } from '../../../engine/types';
import { type Recipe, k, rect, circle, group, path, image, radial, linear, ta, alpha, shade, readableOn, ICONS } from '../../kit';
import { type TS, txt, wrap, fit, tw, chip, avatar, glow, brandRow, icon, ICON, to, pulse, cycle, splitNum, vivid, balance } from './util';

// ------------------------------------------------------------------ Webinar Invite

const webinar: Recipe = {
  id: 'webinar-invite',
  name: 'Webinar Invite',
  category: 'events',
  tags: ['webinar', 'event', 'speaker', 'live', 'registration', 'b2b'],
  description: 'Webinar announcement with a speaker card that wipes in, date and time chips and a registration button.',
  duration: 5.5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Host brand', default: 'Kitepath' },
    { key: 'label', label: 'Label', default: 'Free webinar' },
    { key: 'title', label: 'Title', default: 'Design systems that scale', multiline: true },
    { key: 'speaker', label: 'Speaker', default: 'Ines Moreau' },
    { key: 'role', label: 'Speaker role', default: 'Design Lead, Kitepath' },
    { key: 'date', label: 'Date', default: 'Thu, Dec 4' },
    { key: 'time', label: 'Time', default: '6:00 PM CET' },
    { key: 'cta', label: 'Button', default: 'Save your seat' },
  ],
  images: [{ key: 'speaker', label: 'Speaker photo', art: 'portrait' }],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'grotesk', format: 'landscape', logo: 'orbit', seed: 5 },
    {
      name: 'Azure',
      palette: 'azure',
      fonts: 'sora',
      format: 'square',
      logo: 'stack',
      seed: 8,
      copy: { brand: 'Ledgerly', label: 'Live session', title: 'Close your books in half the time', speaker: 'Amara Osei', role: 'CFO, Ledgerly', date: 'Tue, Mar 18', time: '11:00 AM EST', cta: 'Register free' },
    },
    {
      name: 'Cobalt',
      palette: 'cobalt',
      fonts: 'fraunces',
      format: 'portrait',
      logo: 'petal',
      seed: 3,
      copy: { brand: 'Fieldnote', label: 'Masterclass', title: 'Writing that sells without selling out', speaker: 'Theo Lindgren', role: 'Copy Chief, Fieldnote', date: 'Wed, Apr 9', time: '5:00 PM GMT', cta: 'Reserve a spot' },
    },
    {
      name: 'Graphite',
      palette: 'graphite',
      fonts: 'space',
      format: 'story',
      logo: 'knot',
      seed: 12,
      copy: { brand: 'Byteforge', label: 'Dev live', title: 'Shipping AI features safely', speaker: 'Mara Quint', role: 'Staff Engineer, Byteforge', date: 'Fri, Feb 7', time: '4:00 PM UTC', cta: 'Join the stream' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const story = x.isStory;
    const dark = readableOn(p.bg) === '#ffffff';
    const hot = vivid(p);
    const m = x.pick({ landscape: 9 * u, default: 7 * u });
    const logoS = x.pick({ story: 6 * u, default: 5 * u });
    const bSt: TS = { role: 'body', size: x.pick({ story: 3.8 * u, default: 3.3 * u }), weight: 700 };
    const lSt: TS = { role: 'body', size: x.pick({ story: 3.3 * u, default: 2.8 * u }), weight: 700, uppercase: true, tracking: 0.14 };
    const lH = lSt.size * 2.5;
    const colW = L ? 86 * u : W - m * 2;
    const tSt = fit(x, x.c.title, { role: 'title', size: x.pick({ landscape: 9 * u, story: 10.5 * u, portrait: 9.4 * u, default: 8.2 * u }), lh: 1.04 }, colW, 3);
    const tBW = balance(x, x.c.title, tSt, colW);
    const tWr = wrap(x, x.c.title, tSt, tBW);
    const cSt: TS = { role: 'body', size: x.pick({ story: 3.8 * u, default: 3.2 * u }), weight: 600 };
    const cH = cSt.size * 2.6;
    let ctaSt: TS = { role: 'body', size: x.pick({ story: 4 * u, default: 3.3 * u }), weight: 700 };
    const ctaH = ctaSt.size * 2.8;
    const nSt: TS = { role: 'body', size: x.pick({ story: 4.2 * u, default: 3.5 * u }), weight: 700 };
    const rSt: TS = { role: 'body', size: x.pick({ story: 3.3 * u, default: 2.7 * u }) };

    // Layout
    let cardX: number, cardY: number, cardW: number, cardH: number;
    let yBrand: number, yLabel: number, yTitle: number, yChips: number, yCta: number, chipsX: number;
    let chipsVertical = false;
    if (L) {
      const blk = logoS + 6 * u + lH + 4 * u + tWr.h + 7 * u + cH + 6 * u + ctaH;
      yBrand = (H - blk) / 2;
      yLabel = yBrand + logoS + 6 * u;
      yTitle = yLabel + lH + 4 * u;
      yChips = yTitle + tWr.h + 7 * u;
      yCta = yChips + cH + 6 * u;
      chipsX = m;
      cardW = 58 * u;
      cardH = 80 * u;
      cardX = W - m - cardW - 4 * u;
      cardY = (H - cardH) / 2;
    } else if (story) {
      yBrand = 15 * u;
      yLabel = yBrand + logoS + 6 * u;
      yTitle = yLabel + lH + 4 * u;
      const below = yTitle + tWr.h + 7 * u;
      const tail = 7 * u + cH + 5 * u + ctaH;
      cardW = 64 * u;
      cardH = Math.min(76 * u, H - 22 * u - below - tail);
      cardX = (W - cardW) / 2;
      cardY = below;
      yChips = cardY + cardH + 7 * u;
      yCta = yChips + cH + 5 * u;
      chipsX = W / 2;
    } else {
      yBrand = m;
      yLabel = yBrand + logoS + 5 * u;
      yTitle = yLabel + lH + 4 * u;
      cardY = yTitle + tWr.h + x.pick({ portrait: 8 * u, default: 6 * u });
      cardH = H - m - 3 * u - cardY;
      cardW = Math.min(x.pick({ portrait: 48 * u, default: 44 * u }), cardH * 0.92);
      cardX = m;
      chipsVertical = true;
      chipsX = cardX + cardW + 6 * u;
      const colH = cH * 2 + 2.4 * u + 6 * u + ctaH;
      yChips = cardY + (cardH - colH) / 2;
      yCta = yChips + cH * 2 + 2.4 * u + 6 * u;
    }
    const tax = story ? 0.5 : 0;
    const tx = story ? W / 2 : m;
    const align = story ? 'center' : 'left';

    // Speaker card
    const plateH = nSt.size * 1.35 + 0.8 * u + rSt.size * 1.35 + 4 * u;
    const plateW = cardW - 5 * u;
    const card = group(
      'card',
      [
        rect('card-bg', { x: 0, y: 0, ax: 0, ay: 0, w: cardW, h: cardH, radius: 4.5 * u, fill: p.surface }),
        group('card-photo', [image('card-img', x.img[0], { x: cardW / 2, y: cardH / 2, w: cardW, h: cardH, scale: k([0.5, 1.3], [2.6, 1, 'outCubic']) })], {
          x: 0,
          y: 0,
          ax: 0,
          ay: 0,
          w: cardW,
          h: cardH,
          clip: true,
          clipRadius: 4.5 * u,
        }),
        chip(x, 'card-tag', 'Speaker', {
          x: 3 * u,
          y: 3 * u,
          ax: 0,
          ay: 0,
          st: { role: 'body', size: x.pick({ story: 2.8 * u, default: 2.4 * u }), weight: 700, uppercase: true, tracking: 0.12 },
          fill: p.surface,
          color: p.fg,
          dot: hot,
        }).layer,
      ],
      {
        x: cardX,
        y: cardY,
        ax: 0,
        ay: 0,
        w: cardW,
        h: cardH,
        mask: { shape: 'rect', x: 0, y: k([0.5, cardH], [1.4, 0, 'inOutCubic']), w: cardW, h: cardH + 1, r: 4.5 * u },
      },
    );
    const plateX = cardX + (cardW - plateW) / 2;
    const plateY = cardY + cardH - plateH * 0.62;
    const plate = group(
      'plate',
      [
        rect('plate-bg', { x: 0, y: 0, ax: 0, ay: 0, w: plateW, h: plateH, radius: 3 * u, fill: p.surface, shadow: { color: alpha('#0A1633', dark ? 0.4 : 0.16), blur: 3 * u, y: 1 * u } }),
        txt(x, 'plate-name', x.c.speaker, fit(x, x.c.speaker, nSt, plateW - 5 * u, 1), { x: 2.5 * u, y: 2 * u, ax: 0, ay: 0, align: 'left', fill: p.fg }),
        txt(x, 'plate-role', x.c.role, fit(x, x.c.role, rSt, plateW - 5 * u, 1), {
          x: 2.5 * u,
          y: 2 * u + nSt.size * 1.35 + 0.8 * u,
          ax: 0,
          ay: 0,
          align: 'left',
          fill: p.muted,
        }),
      ],
      { x: plateX, y: to(plateY + 5 * u, plateY, 1.35, 0.8, 'outExpo'), ax: 0, ay: 0, w: plateW, h: plateH, opacity: to(0, 1, 1.35, 0.3) },
    );

    // Chips + CTA
    const dateC = chip(x, 'date', x.c.date, {
      x: 0,
      y: yChips,
      ax: 0,
      ay: 0,
      st: cSt,
      h: cH,
      fill: dark ? alpha(p.fg, 0.07) : p.surface,
      stroke: alpha(p.fg, dark ? 0.14 : 0.1),
      strokeWidth: 0.2 * u,
      color: p.fg,
      icon: ICONS.calendar,
      iconColor: p.accent,
      g: { scale: to(0, 1, 1.6, 0.6, 'spring'), opacity: to(0, 1, 1.6, 0.2) },
    });
    const timeC = chip(x, 'time', x.c.time, {
      x: 0,
      y: yChips,
      ax: 0,
      ay: 0,
      st: cSt,
      h: cH,
      fill: dark ? alpha(p.fg, 0.07) : p.surface,
      stroke: alpha(p.fg, dark ? 0.14 : 0.1),
      strokeWidth: 0.2 * u,
      color: p.fg,
      icon: ICONS.clock,
      iconColor: p.accent,
      g: { scale: to(0, 1, 1.75, 0.6, 'spring'), opacity: to(0, 1, 1.75, 0.2) },
    });
    if (chipsVertical) {
      dateC.layer.x = chipsX;
      timeC.layer.x = chipsX;
      timeC.layer.y = yChips + cH + 2.4 * u;
    } else if (story) {
      const tot = dateC.w + 2.4 * u + timeC.w;
      dateC.layer.x = W / 2 - tot / 2;
      timeC.layer.x = W / 2 - tot / 2 + dateC.w + 2.4 * u;
    } else {
      dateC.layer.x = chipsX;
      timeC.layer.x = chipsX + dateC.w + 2.4 * u;
    }
    if (chipsVertical) {
      // Text + arrow + padding must fit between the card and the right margin.
      const room = W - m - chipsX - ctaH * 1.2 - ctaSt.size * 1.8;
      ctaSt = fit(x, x.c.cta, ctaSt, room, 1, 0.7);
    }
    const cta = chip(x, 'cta', x.c.cta, {
      x: chipsVertical ? chipsX : tx,
      y: yCta,
      ax: chipsVertical ? 0 : tax,
      ay: 0,
      st: ctaSt,
      h: ctaH,
      padX: ctaH * 0.6,
      fill: p.accent,
      color: p.onAccent,
      icon: ICONS.arrowRight,
      iconRight: true,
      g: { scale: to(0, 1, 2.05, 0.7, 'spring'), opacity: to(0, 1, 2.05, 0.2) },
    });

    const label = chip(x, 'label', x.c.label, {
      x: tx,
      y: yLabel,
      ax: tax,
      ay: 0,
      st: lSt,
      h: lH,
      fill: alpha(hot, dark ? 0.2 : 0.12),
      color: dark ? p.fg : hot,
      icon: ICON.video,
      iconColor: hot,
      g: { sx: to(0, 1, 0.25, 0.7, 'outExpo'), opacity: to(0, 1, 0.25, 0.2) },
    });

    // Dot grid texture behind the card
    const dots: Layer[] = [];
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        dots.push(
          circle(`dot-${r}-${c}`, 0.45 * u, {
            x: chipsVertical ? W - 4 * u - c * 3.4 * u : cardX + cardW + 3 * u - c * 3.4 * u,
            y: chipsVertical ? H - 4 * u - r * 3.4 * u : cardY - 3 * u + r * 3.4 * u,
            fill: alpha(p.accent, 0.4),
            opacity: to(0, 1, 0.6 + (r + c) * 0.04, 0.4),
          }),
        );

    return {
      background: dark ? radial(0.8, 0.2, 1.1, p.bg2, p.bg) : x.grad(160, p.bg, p.bg2),
      layers: [
        glow('glow', { x: cardX + cardW / 2, y: cardY + cardH / 2, r: Math.max(cardW, cardH) * 0.85, color: p.accent, a: dark ? 0.35 : 0.2 }),
        ...dots,
        brandRow(x, 'brand', x.c.brand, { x: tx, y: yBrand, ax: tax, ay: 0, logo: logoS, st: bSt, color: p.fg, logoColor: p.accent, g: { opacity: to(0, 1, 0.1, 0.5) } }).layer,
        label.layer,
        txt(x, 'title', x.c.title, tSt, { x: tx, y: yTitle, w: tBW, ax: tax, ay: 0, align, anim: ta.riseLines(0.4, { stagger: 0.12 }) }),
        card,
        plate,
        dateC.layer,
        timeC.layer,
        cta.layer,
      ],
    };
  },
};

// ------------------------------------------------------------------ Days To Go (flip clock)

const daysToGo: Recipe = {
  id: 'days-to-go',
  name: 'Days To Go',
  category: 'events',
  tags: ['countdown', 'flip clock', 'event', 'launch', 'days left', 'teaser'],
  description: 'Split-flap countdown: the digits flip down day by day and land on your number, with the event below.',
  duration: 5,
  fields: [
    { key: 'days', label: 'Days left', default: '3' },
    { key: 'unit', label: 'Unit line', default: 'Days to go' },
    { key: 'event', label: 'Event', default: 'Kitepath Summit 2027', multiline: true },
    { key: 'date', label: 'Date & place', default: 'June 12 · Lisbon' },
  ],
  variants: [
    { name: 'Royal', palette: 'royal', fonts: 'unbounded', format: 'square' },
    { name: 'Noir', palette: 'noir', fonts: 'grotesk', format: 'story', copy: { days: '7', unit: 'Days until launch', event: 'Byteforge v4', date: 'Live March 3 · Online' } },
    { name: 'Paper', palette: 'paper', fonts: 'editorial', format: 'portrait', copy: { days: '12', unit: 'Days to go', event: 'The Spring Market', date: 'April 20 · Old Town Hall' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'sora', format: 'landscape', copy: { days: '5', unit: 'Days left', event: 'Tidewater Ocean Week', date: 'Aug 4–10 · Cape Town' } },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const dark = readableOn(p.bg) === '#ffffff';
    const m = x.pick({ landscape: 10 * u, default: 8 * u });

    const n = parseInt(x.c.days.replace(/[^\d]/g, ''), 10);
    const valid = !isNaN(n) && n >= 0 && n <= 96 && /^\s*\d+\s*$/.test(x.c.days);
    const values = valid ? [n + 3, n + 2, n + 1, n] : [];
    const digits = valid ? String(n + 3).length : 0;
    const strs = valid ? values.map((v) => String(v).padStart(digits, '0')) : [x.c.days];
    const nCards = valid ? digits : 1;

    const ch = x.pick({ landscape: 54 * u, story: 58 * u, portrait: 46 * u, default: 40 * u }) * (nCards > 1 ? 0.88 : 1);
    const cw = valid ? ch * 0.74 : Math.max(ch * 0.74, tw(x, x.c.days, { role: 'title', size: ch * 0.62 }) + ch * 0.3);
    const gapC = ch * 0.08;
    const cardsW = nCards * cw + (nCards - 1) * gapC;
    const digitSt = fit(x, valid ? '0' : x.c.days, { role: 'title', size: (ch * 0.74) / x.f.displayScale, lh: 1 }, valid ? cw * 0.8 : cw * 0.84, 1);
    const cardFill = dark ? shade(p.surface, 0.06) : p.surface;
    const cardFill2 = dark ? p.surface : shade(p.surface, -0.04);
    const ink = p.fg;

    const uSt = fit(x, x.c.unit, { role: 'title', size: x.pick({ landscape: 10 * u, story: 11 * u, portrait: 9 * u, default: 7.8 * u }), lh: 1.02 }, L ? 70 * u : W - m * 2, 2);
    const uBW = balance(x, x.c.unit, uSt, L ? 70 * u : W - m * 2);
    const uWr = wrap(x, x.c.unit, uSt, uBW);
    const eSt = fit(x, x.c.event, { role: 'body', size: x.pick({ story: 5 * u, landscape: 4.4 * u, default: 3.9 * u }), weight: 600 }, L ? 70 * u : W - m * 2, 2);
    const eBW = balance(x, x.c.event, eSt, L ? 70 * u : W - m * 2);
    const eWr = wrap(x, x.c.event, eSt, eBW);
    const dSt: TS = { role: 'body', size: x.pick({ story: 3.6 * u, default: 3 * u }), weight: 600 };
    const dH = dSt.size * 2.6;

    let cardsX: number, cardsY: number, tx: number, yUnit: number;
    const tax = L ? 0 : 0.5;
    if (L) {
      cardsX = 18 * u;
      cardsY = (H - ch) / 2;
      tx = cardsX + cardsW + 14 * u;
      const blk = uWr.h + 4 * u + eWr.h + 6 * u + dH;
      yUnit = (H - blk) / 2;
    } else {
      const blk = ch + 9 * u + uWr.h + 4 * u + eWr.h + 6 * u + dH;
      const top = (H - blk) / 2 - x.pick({ story: 4 * u, default: 0 });
      cardsX = (W - cardsW) / 2;
      cardsY = top;
      tx = W / 2;
      yUnit = top + ch + 9 * u;
    }
    const yEvent = yUnit + uWr.h + 4 * u;
    const yDate = yEvent + eWr.h + 6 * u;

    const T = [0.85, 1.55, 2.25];
    const D = [0.5, 0.5, 0.7];
    const hingeY = cardsY + ch / 2;
    const layers: Layer[] = [];

    const half = (id: string, val: string, which: 'top' | 'bot', cxPos: number, extra: object, shadeTrack?: object) => {
      const top = which === 'top';
      const kids: Layer[] = [
        rect(id + '-bg', { x: 0, y: top ? 0 : -ch / 2, ax: 0, ay: 0, w: cw, h: ch, radius: ch * 0.09, fill: top ? cardFill : cardFill2 }),
        txt(x, id + '-t', val, digitSt, { x: cw / 2, y: top ? ch / 2 : 0, fill: ink }),
      ];
      if (shadeTrack) kids.push(rect(id + '-sh', { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: ch / 2, fill: alpha('#000000', 0.35), ...shadeTrack }));
      return group(id, kids, { x: cxPos, y: hingeY, w: cw, h: ch / 2, ax: 0.5, ay: top ? 1 : 0, clip: true, ...extra });
    };

    for (let j = 0; j < nCards; j++) {
      const cxPos = cardsX + j * (cw + gapC) + cw / 2;
      layers.push(
        rect(`card-${j}-shadow`, {
          x: cxPos,
          y: hingeY,
          w: cw,
          h: ch,
          radius: ch * 0.09,
          fill: cardFill2,
          shadow: { color: alpha('#000000', dark ? 0.5 : 0.18), blur: 4 * u, y: 2 * u },
        }),
      );
      const d = (i: number) => (valid ? strs[i][j] : strs[0]);
      // Static halves: tops switch at flip start, bottoms at flip end.
      let segStartTop = 0;
      let segStartBot = 0;
      let cur = 0;
      const steps = valid ? 3 : 0;
      for (let i = 0; i < steps; i++) {
        if (d(i) === d(i + 1)) continue;
        layers.push(half(`c${j}-top-${i}`, d(cur), 'top', cxPos, { start: segStartTop, end: T[i] }));
        layers.push(half(`c${j}-bot-${i}`, d(cur), 'bot', cxPos, { start: segStartBot, end: T[i] + D[i] }));
        segStartTop = T[i];
        segStartBot = T[i] + D[i];
        cur = i + 1;
      }
      layers.push(half(`c${j}-top-end`, d(cur), 'top', cxPos, { start: segStartTop }));
      layers.push(half(`c${j}-bot-end`, d(cur), 'bot', cxPos, { start: segStartBot }));
      // Flaps
      for (let i = 0; i < steps; i++) {
        if (d(i) === d(i + 1)) continue;
        const t0 = T[i];
        const mid = t0 + D[i] / 2;
        const t1 = t0 + D[i];
        layers.push(
          half(`c${j}-ft-${i}`, d(i), 'top', cxPos, { start: t0, end: mid, sy: k([t0, 1], [mid, 0, 'inQuad' as Ease]) }, { opacity: k([t0, 0], [mid, 1, 'inQuad' as Ease]) }),
          half(`c${j}-fb-${i}`, d(i + 1), 'bot', cxPos, { start: mid, end: t1 + 0.001, sy: k([mid, 0], [t1, 1, 'outBack' as Ease]) }, { opacity: k([mid, 1], [t1, 0, 'outQuad' as Ease]) }),
        );
      }
      // Hinge line + side pins
      layers.push(
        rect(`card-${j}-hinge`, { x: cxPos, y: hingeY, w: cw, h: Math.max(2, ch * 0.012), fill: alpha(dark ? '#000000' : p.fg, dark ? 0.6 : 0.18) }),
        rect(`card-${j}-pinl`, { x: cxPos - cw / 2 + ch * 0.012, y: hingeY, w: ch * 0.024, h: ch * 0.09, radius: ch * 0.012, fill: alpha(p.fg, 0.25) }),
        rect(`card-${j}-pinr`, { x: cxPos + cw / 2 - ch * 0.012, y: hingeY, w: ch * 0.024, h: ch * 0.09, radius: ch * 0.012, fill: alpha(p.fg, 0.25) }),
      );
    }

    const datePill = chip(x, 'date', x.c.date, {
      x: tx,
      y: yDate,
      ax: tax,
      ay: 0,
      st: dSt,
      h: dH,
      fill: p.accent,
      color: p.onAccent,
      icon: ICONS.calendar,
      g: { scale: to(0, 1, 2.9, 0.7, 'spring'), opacity: to(0, 1, 2.9, 0.2) },
    });

    // Tick marks circling the cards for a subtle "clock" feel.
    const ticks: Layer[] = [];
    const R = Math.min(Math.max(cardsW, ch) * 0.86, hingeY - 3 * u, L ? H / 2 - 3 * u : W / 2 - 3 * u);
    const ccx = cardsX + cardsW / 2;
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2 - Math.PI / 2;
      ticks.push(
        rect(`tick-${i}`, {
          x: ccx + Math.cos(a) * R,
          y: hingeY + Math.sin(a) * R,
          w: i % 3 === 0 ? 2.2 * u : 1.2 * u,
          h: 0.45 * u,
          radius: 0.2 * u,
          rotation: (a * 180) / Math.PI,
          fill: alpha(p.accent, i % 3 === 0 ? 0.7 : 0.35),
          opacity: k([0.1 + i * 0.02, 0], [0.3 + i * 0.02, 1, 'outCubic']),
        }),
      );
    }

    return {
      background: dark ? radial(L ? 0.25 : 0.5, 0.4, 1, p.bg2, p.bg) : x.grad(170, p.bg, p.bg2),
      layers: [
        glow('glow', { x: ccx, y: hingeY, r: R * 1.2, color: p.accent, a: dark ? 0.32 : 0.18, scale: pulse(1, 5, 1.6, 1, 1.06) }),
        ...ticks,
        group('cards', layers, {
          x: ccx,
          y: hingeY,
          ax: ccx / W,
          ay: hingeY / H,
          w: W,
          h: H,
          scale: k([0, 0.85], [0.8, 1, 'outExpo']),
          opacity: to(0, 1, 0, 0.35),
        }),
        txt(x, 'unit', x.c.unit, uSt, { x: tx, y: yUnit, w: uBW, ax: tax, ay: 0, align: L ? 'left' : 'center', anim: ta.rise(2.6, { stagger: 0.07 }) }),
        txt(x, 'event', x.c.event, eSt, {
          x: tx,
          y: yEvent,
          w: eBW,
          ax: tax,
          ay: 0,
          align: L ? 'left' : 'center',
          fill: p.muted,
          anim: ta.blur(2.8, { stagger: 0.05 }),
        }),
        datePill.layer,
      ],
    };
  },
};

// ------------------------------------------------------------------ Save the Date

/** Hand-drawn ellipse loop for circling a date, 100×60. */
const LOOP = 'M62 6C34 2 6 12 5 31c-1 17 24 26 50 24 26-2 42-12 40-28C93 12 74 5 50 6 38 7 26 10 18 15';

const saveTheDate: Recipe = {
  id: 'save-the-date',
  name: 'Save the Date',
  category: 'events',
  tags: ['save the date', 'calendar', 'event', 'invitation', 'party', 'wedding'],
  description: 'A calendar tile drops in, its pages flip to your date and a hand-drawn loop circles the day.',
  duration: 5.5,
  fields: [
    { key: 'title', label: 'Title', default: 'Save the date' },
    { key: 'month', label: 'Month', default: 'June' },
    { key: 'day', label: 'Day', default: '14' },
    { key: 'weekday', label: 'Weekday', default: 'Saturday' },
    { key: 'event', label: 'Event', default: 'Kitepath Summer Party', multiline: true },
    { key: 'details', label: 'Place & time', default: 'The Glasshouse, Lisbon · 7 PM' },
  ],
  variants: [
    { name: 'Blush', palette: 'blush', fonts: 'serif', format: 'portrait', copy: { event: 'Ava & Leo are getting married', details: 'Villa Rosa, Porto · 4 PM', month: 'September', day: '20', weekday: 'Saturday' } },
    { name: 'Sand', palette: 'sand', fonts: 'dmserif', format: 'square' },
    {
      name: 'Midnight',
      palette: 'midnight',
      fonts: 'fraunces',
      format: 'story',
      copy: { title: 'Mark your calendar', month: 'Nov', day: '28', weekday: 'Friday', event: 'Orbitly Launch Night', details: 'Pier 9, San Francisco · 8 PM' },
    },
    {
      name: 'Arctic',
      palette: 'arctic',
      fonts: 'grotesk',
      format: 'landscape',
      copy: { title: 'Save the date', month: 'Oct', day: '07', weekday: 'Tuesday', event: 'Tidewater Annual Summit', details: 'Harbour Hall, Oslo · 9 AM' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const dark = readableOn(p.bg) === '#ffffff';
    const hot = vivid(p);
    const m = x.pick({ landscape: 10 * u, default: 8 * u });

    const T = x.pick({ landscape: 52 * u, story: 62 * u, portrait: 44 * u, default: 38 * u }); // tile width
    const TH = T * 1.1;
    const colW = L ? 74 * u : W - m * 2;
    const tSt = fit(x, x.c.title, { role: 'title', size: x.pick({ landscape: 11.5 * u, story: 13.5 * u, portrait: 11 * u, default: 9.5 * u }), lh: 1.02 }, colW, 2);
    const tBW = balance(x, x.c.title, tSt, colW);
    const tWr = wrap(x, x.c.title, tSt, tBW);
    const eSt = fit(x, x.c.event, { role: 'body', size: x.pick({ story: 5.6 * u, landscape: 4.8 * u, default: 4.2 * u }), weight: 700 }, colW, 2);
    const eBW = balance(x, x.c.event, eSt, colW);
    const eWr = wrap(x, x.c.event, eSt, eBW);
    const dSt = fit(x, x.c.details, { role: 'body', size: x.pick({ story: 4.2 * u, landscape: 3.6 * u, default: 3.2 * u }) }, colW - 6 * u, 1);
    const dW = tw(x, x.c.details, dSt);

    let tileX: number, tileY: number, tx: number, yTitle: number, yEvent: number, yDet: number;
    const tax = L ? 0 : 0.5;
    if (L) {
      tileX = 50 * u;
      tileY = H / 2;
      tx = 92 * u;
      const blk = tWr.h + 6 * u + eWr.h + 3 * u + dSt.size * 1.4;
      yTitle = (H - blk) / 2;
      yEvent = yTitle + tWr.h + 6 * u;
      yDet = yEvent + eWr.h + 3 * u;
    } else {
      const g1 = x.pick({ story: 8 * u, default: 6 * u }) + T * 1.1 * 0.27 * 0.35;
      const g2 = x.pick({ story: 8 * u, default: 6 * u });
      const blk = tWr.h + g1 + TH + g2 + eWr.h + 3 * u + dSt.size * 1.4;
      const top = (H - blk) / 2 - x.pick({ story: 4 * u, default: 0 });
      yTitle = top;
      tileY = top + tWr.h + g1 + TH / 2;
      tileX = W / 2;
      tx = W / 2;
      yEvent = tileY + TH / 2 + g2;
      yDet = yEvent + eWr.h + 3 * u;
    }

    // Calendar tile (box space T × TH)
    const headH = TH * 0.27;
    const monthSt = fit(x, x.c.month, { role: 'body', size: T * 0.1, weight: 800, uppercase: true, tracking: 0.2 }, T * 0.8, 1);
    const daySt = fit(x, x.c.day, { role: 'title', size: T * 0.46, lh: 1 }, T * 0.8, 1);
    const wdSt = fit(x, x.c.weekday, { role: 'body', size: T * 0.075, weight: 600, uppercase: true, tracking: 0.14 }, T * 0.8, 1);
    const dayY = headH + (TH - headH) * 0.46;
    const wdY = TH - (TH - headH) * 0.14;
    const dayN = parseInt(x.c.day, 10);
    const pad2 = (v: number) => (x.c.day.length === 2 && v < 10 ? '0' + v : String(v));
    const prev = !isNaN(dayN) && dayN > 2 ? [pad2(dayN - 2), pad2(dayN - 1)] : [x.c.day, x.c.day];
    const flipT = [1.15, 1.6];

    const page = (id: string, dayText: string, t0: number): Layer =>
      group(
        id,
        [
          rect(id + '-bg', { x: 0, y: 0, ax: 0, ay: 0, w: T, h: TH - headH, fill: p.surface, radius: T * 0.06 }),
          rect(id + '-sq', { x: 0, y: 0, ax: 0, ay: 0, w: T, h: T * 0.08, fill: p.surface }),
          txt(x, id + '-d', dayText, daySt, { x: T / 2, y: dayY - headH, fill: p.fg }),
          txt(x, id + '-w', x.c.weekday, wdSt, { x: T / 2, y: wdY - headH, fill: p.muted }),
          rect(id + '-shade', { x: 0, y: 0, ax: 0, ay: 0, w: T, h: TH - headH, fill: alpha('#000000', 0.25), opacity: k([t0, 0], [t0 + 0.4, 1, 'inQuad']) }),
        ],
        {
          x: T / 2,
          y: headH,
          w: T,
          h: TH - headH,
          ay: 0,
          sy: k([t0, 1], [t0 + 0.42, -0.15, 'inCubic']),
          skewX: k([t0, 0], [t0 + 0.42, -8, 'inCubic']),
          end: t0 + 0.42,
        },
      );

    const ringW = T * 0.055;
    const tile = group(
      'tile',
      [
        rect('tile-base', { x: 0, y: 0, ax: 0, ay: 0, w: T, h: TH, radius: T * 0.08, fill: p.surface, shadow: { color: alpha('#0A1633', dark ? 0.5 : 0.18), blur: 5 * u, y: 2 * u } }),
        rect('tile-edge', { x: T * 0.04, y: TH, ax: 0, ay: 0, w: T * 0.92, h: T * 0.025, radius: T * 0.012, fill: shade(p.surface, dark ? 0.1 : -0.08) }),
        txt(x, 'tile-day', x.c.day, daySt, { x: T / 2, y: dayY, fill: p.fg }),
        txt(x, 'tile-wd', x.c.weekday, wdSt, { x: T / 2, y: wdY, fill: p.muted }),
        page('page-a', prev[0], flipT[0]),
        page('page-b', prev[1], flipT[1]),
        group(
          'tile-head',
          [
            rect('head-bg', { x: 0, y: 0, ax: 0, ay: 0, w: T, h: headH, radius: T * 0.08, fill: linear(90, p.accent, shade(p.accent, -0.15)) }),
            rect('head-sq', { x: 0, y: headH * 0.5, ax: 0, ay: 0, w: T, h: headH * 0.5, fill: shade(p.accent, -0.07) }),
            txt(x, 'head-month', x.c.month, monthSt, { x: T / 2, y: headH * 0.56, fill: p.onAccent }),
          ],
          { x: 0, y: 0, ax: 0, ay: 0, w: T, h: headH },
        ),
        ...[0.28, 0.72].map((fx, i) =>
          rect(`ring-${i}`, { x: T * fx, y: 0, w: ringW, h: headH * 0.62, radius: ringW / 2, fill: dark ? p.fg : shade(p.fg, 0.15), shadow: { color: alpha('#000000', 0.2), blur: 0.6 * u, y: 0.3 * u } }),
        ),
        path('loop', LOOP, 100, 60, {
          x: T / 2,
          y: dayY - T * 0.01,
          w: T * 0.82,
          h: T * 0.5,
          stroke: hot,
          strokeWidth: 3.4,
          trimEnd: to(0, 1, 2.2, 0.8, 'inOutCubic'),
        }),
      ],
      {
        x: tileX,
        y: k([0.1, tileY - 30 * u], [0.9, tileY, 'outBounce']),
        w: T,
        h: TH,
        rotation: k([0.1, -8], [1.0, 0, 'outBack'], [3.5, 1.5, 'inOutSine'], [5.5, 0, 'inOutSine']),
        opacity: to(0, 1, 0.1, 0.25),
      },
    );

    const heart = path('heart', ICONS.heart, 24, 24, {
      x: tileX + T * 0.5,
      y: tileY - TH * 0.5,
      w: T * 0.22,
      h: T * 0.22,
      fill: hot,
      stroke: hot,
      strokeWidth: 1.5,
      rotation: 14,
      scale: k([2.6, 0], [3.1, 1, 'spring'], [3.6, 1], [3.8, 1.12, 'inOutSine'], [4.0, 1, 'inOutSine'], [4.2, 1.1, 'inOutSine'], [4.5, 1, 'inOutSine']),
    });

    // Thin frame that draws itself around the canvas.
    const inset = x.pick({ landscape: 4 * u, default: 3.5 * u });
    const frame = path('frame', `M${W / 2} ${inset} H${W - inset} V${H - inset} H${inset} V${inset} Z`, W, H, {
      x: 0,
      y: 0,
      ax: 0,
      ay: 0,
      w: W,
      h: H,
      stroke: alpha(p.accent, 0.45),
      strokeWidth: Math.max(2, 0.25 * u),
      lineCap: 'butt',
      trimEnd: to(0, 1, 0, 2.2, 'inOutCubic'),
    });

    const detX = L ? tx : W / 2 - (dW + 5 * u) / 2;
    return {
      background: dark ? radial(0.5, 0.35, 1, p.bg2, p.bg) : x.grad(180, p.bg, p.bg2),
      layers: [
        frame,
        glow('glow', { x: tileX, y: tileY, r: T * 1.1, color: p.accent, a: dark ? 0.35 : 0.2 }),
        txt(x, 'title', x.c.title, tSt, { x: tx, y: yTitle, w: tBW, ax: tax, ay: 0, align: L ? 'left' : 'center', anim: ta.rise(0.3, { by: 'char', stagger: 0.03 }) }),
        tile,
        heart,
        txt(x, 'event', x.c.event, eSt, { x: tx, y: yEvent, w: eBW, ax: tax, ay: 0, align: L ? 'left' : 'center', anim: ta.rise(2.4, { stagger: 0.06 }) }),
        icon('pin', ICON.pin, { x: detX + 1.8 * u, y: yDet + dSt.size * 0.7, s: dSt.size * 1.4, color: p.accent, sw: 2, opacity: to(0, 1, 2.8, 0.5) }),
        txt(x, 'details', x.c.details, dSt, { x: detX + 5 * u, y: yDet, ax: 0, ay: 0, align: 'left', fill: p.muted, opacity: to(0, 1, 2.85, 0.6) }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Live Now

const liveNow: Recipe = {
  id: 'live-now',
  name: 'Live Now',
  category: 'events',
  tags: ['live', 'stream', 'going live', 'broadcast', 'creator', 'pulse', 'new'],
  description: '“Going live” post: the host photo ripples like a broadcast, the LIVE badge pulses and viewers tick up.',
  duration: 6,
  fields: [
    { key: 'label', label: 'Badge', default: 'Live' },
    { key: 'title', label: 'Title', default: 'We’re going live', multiline: true },
    { key: 'topic', label: 'Topic', default: 'Q&A: building in public', multiline: true },
    { key: 'host', label: 'Host', default: 'with Ines Moreau' },
    { key: 'time', label: 'Time', default: 'Today · 7 PM' },
    { key: 'viewers', label: 'Viewers', default: '1,248' },
    { key: 'viewersLabel', label: 'Viewers label', default: 'watching' },
  ],
  images: [{ key: 'host', label: 'Host photo', art: 'portrait' }],
  variants: [
    { name: 'Cyber', palette: 'cyber', fonts: 'grotesk', format: 'story', seed: 4 },
    {
      name: 'Azure',
      palette: 'azure',
      fonts: 'outfit',
      format: 'square',
      seed: 9,
      copy: { title: 'Live in 5 minutes', topic: 'Product demo: the new editor', host: 'with the Kitepath team', time: 'Starts 5 PM CET', viewers: '860', viewersLabel: 'waiting' },
    },
    {
      name: 'Sunset',
      palette: 'sunset',
      fonts: 'archivo',
      format: 'portrait',
      seed: 2,
      copy: { title: 'Cooking live tonight', topic: 'Three pasta sauces in 30 minutes', host: 'with Chef Rosa', time: 'Tonight · 8 PM', viewers: '3,410' },
    },
    {
      name: 'Graphite',
      palette: 'graphite',
      fonts: 'sora',
      format: 'landscape',
      seed: 7,
      copy: { title: 'Live coding session', topic: 'Building a realtime chat from scratch', host: 'with Dev Patel', time: 'Thursday · 6 PM', viewers: '2,096' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const dark = readableOn(p.bg) === '#ffffff';
    const hot = vivid(p);
    const onHot = hot === p.accent ? p.onAccent : readableOn(hot, p.fg, p.bg);
    const m = x.pick({ landscape: 10 * u, default: 8 * u });
    let d = x.pick({ landscape: 44 * u, story: 56 * u, portrait: 36 * u, default: 28 * u });
    let ringW = d * 0.05;
    let gapR = d * 0.04;
    let D = d + 2 * (ringW + gapR);
    const colW = L ? 76 * u : W - m * 2;
    const tSt = fit(x, x.c.title, { role: 'title', size: x.pick({ landscape: 10 * u, story: 14 * u, portrait: 11 * u, default: 9 * u }), lh: 1.02 }, colW, 2);
    const tBW = balance(x, x.c.title, tSt, colW);
    const tWr = wrap(x, x.c.title, tSt, tBW);
    const oSt = fit(x, x.c.topic, { role: 'body', size: x.pick({ story: 5 * u, default: 3.7 * u }), weight: 500 }, colW, 2);
    const oBW = balance(x, x.c.topic, oSt, colW);
    const oWr = wrap(x, x.c.topic, oSt, oBW);
    const hSt: TS = { role: 'body', size: x.pick({ story: 4.3 * u, default: 3.2 * u }), weight: 700 };
    const bSt: TS = { role: 'body', size: x.pick({ story: 4.6 * u, landscape: 3.6 * u, default: 3.2 * u }), weight: 800, uppercase: true, tracking: 0.16 };
    const bH = bSt.size * 2.5;
    const cSt: TS = { role: 'body', size: x.pick({ story: 4.1 * u, default: 3.1 * u }), weight: 600 };
    const cH = cSt.size * 2.6;

    let ax0: number, ay0: number, tx: number, yHost: number, yTitle: number, yTopic: number, yChips: number;
    const tax = L ? 0 : 0.5;
    if (!L) {
      // Shrink the portrait if the stack would crowd the frame edges (ripples need room too).
      const g0 = x.pick({ story: 1.3, default: 1 });
      const rest = bH * 0.5 + 7 * u * g0 + hSt.size * 1.35 + 3 * u * g0 + tWr.h + 3.5 * u * g0 + oWr.h + 6 * u * g0 + cH;
      const avail = H - x.pick({ story: 44 * u, default: 16 * u });
      if (D + rest > avail) {
        D = Math.max(x.pick({ story: 40 * u, default: 22 * u }), avail - rest);
        d = D / (1 + 2 * 0.09);
        ringW = d * 0.05;
        gapR = d * 0.04;
      }
    }
    if (L) {
      ax0 = 48 * u;
      ay0 = H / 2 - 3 * u;
      tx = 94 * u;
      const blk = hSt.size * 1.35 + 3 * u + tWr.h + 4 * u + oWr.h + 7 * u + cH;
      yHost = (H - blk) / 2;
      yTitle = yHost + hSt.size * 1.35 + 3 * u;
      yTopic = yTitle + tWr.h + 4 * u;
      yChips = yTopic + oWr.h + 7 * u;
    } else {
      const g = x.pick({ story: 1.3, default: 1 });
      const blk = D + bH * 0.5 + 7 * u * g + hSt.size * 1.35 + 3 * u * g + tWr.h + 3.5 * u * g + oWr.h + 6 * u * g + cH;
      const top = (H - blk) / 2 - x.pick({ story: 4 * u, default: 0 });
      ax0 = W / 2;
      ay0 = top + D / 2;
      tx = W / 2;
      yHost = ay0 + D / 2 + bH * 0.5 + 7 * u * g;
      yTitle = yHost + hSt.size * 1.35 + 3 * u * g;
      yTopic = yTitle + tWr.h + 3.5 * u * g;
      yChips = yTopic + oWr.h + 6 * u * g;
    }

    // Ripples
    const ripples: Layer[] = [0, 1, 2].map((i) =>
      circle(`ripple-${i}`, D / 2, {
        x: ax0,
        y: ay0,
        stroke: hot,
        strokeWidth: 0.35 * u,
        scale: cycle(0.9 + i * 0.6, 6.2, 1.8, 1, x.isSquare ? 1.55 : 1.75, 'outCubic'),
        opacity: k(...(cycle(0.9 + i * 0.6, 6.2, 1.8, 0.7, 0, 'inQuad').map((f) => [f.t, f.v, f.e] as [number, number, Ease?]))),
        start: 0.9 + i * 0.6,
      }),
    );

    const av = avatar('host', x.img[0], {
      x: ax0,
      y: ay0,
      d,
      ring: linear(135, hot, p.accent2 === hot ? p.accent : p.accent2),
      ringW,
      gap: gapR,
      gapFill: p.bg,
      imgScale: to(1.3, 1, 0.3, 1.6, 'outCubic'),
      g: { scale: to(0, 1, 0.3, 0.8, 'spring'), rotation: to(-30, 0, 0.3, 0.9, 'outBack') },
    });

    // LIVE badge with pulsing dot
    const badgeW = tw(x, x.c.label, bSt) + bSt.size * 0.9 + bSt.size * 0.6 + bH * 0.9;
    const badge = chip(x, 'badge', x.c.label, {
      x: ax0,
      y: ay0 + D / 2,
      st: bSt,
      h: bH,
      fill: hot,
      color: onHot,
      stroke: p.bg,
      strokeWidth: 0.5 * u,
      dot: onHot,
      g: { scale: k([0.9, 0], [1.4, 1, 'spring'], [2.4, 1], [2.6, 1.08, 'inOutSine'], [2.8, 1, 'inOutSine']) },
      extra: (w, h) => [
        circle('badge-halo', bSt.size * 0.45, {
          x: (w - (bSt.size * 0.55 + bSt.size * 0.55 + tw(x, x.c.label, bSt))) / 2 + bSt.size * 0.275,
          y: h / 2,
          fill: alpha(onHot, 0.5),
          scale: cycle(1.4, 6.2, 1, 1, 2.6, 'outCubic'),
          opacity: k(...(cycle(1.4, 6.2, 1, 0.8, 0, 'inQuad').map((f) => [f.t, f.v, f.e] as [number, number, Ease?]))),
        }),
      ],
    });
    void badgeW;

    // Floating reactions
    const floaters: Layer[] = Array.from({ length: 6 }, (_, i) => {
      const t0 = 2.2 + i * 0.55;
      const sx = ax0 + D * 0.42 + (i % 2) * 2 * u;
      const s = (3 + (i % 3)) * u;
      return path(`react-${i}`, ICONS.heart, 24, 24, {
        x: k([t0, sx], [t0 + 1.8, sx + (i % 2 ? 6 : -2) * u, 'outSine']),
        y: k([t0, ay0 + D * 0.2], [t0 + 1.8, ay0 - D * 0.62, 'outCubic']),
        w: s,
        h: s,
        fill: i % 2 ? p.accent2 : hot,
        opacity: k([t0, 0], [t0 + 0.2, 1], [t0 + 1.3, 1], [t0 + 1.8, 0, 'inCubic']),
        scale: to(0.3, 1, t0, 0.5, 'outBack'),
        rotation: to(0, i % 2 ? 16 : -16, t0, 1.8, 'outSine'),
        start: t0,
        end: t0 + 1.81,
      });
    });

    const timeC = chip(x, 'time', x.c.time, {
      x: 0,
      y: yChips,
      ax: 0,
      ay: 0,
      st: cSt,
      h: cH,
      fill: dark ? alpha(p.fg, 0.08) : alpha(p.surface, 0.8),
      stroke: alpha(p.fg, 0.14),
      strokeWidth: 0.2 * u,
      color: p.fg,
      icon: ICONS.clock,
      g: { scale: to(0, 1, 2.0, 0.6, 'spring'), opacity: to(0, 1, 2.0, 0.2) },
    });
    const vNum = splitNum(x.c.viewers);
    const vText = `${x.c.viewers} ${x.c.viewersLabel}`;
    const viewC = chip(x, 'viewers', vText, {
      x: 0,
      y: yChips,
      ax: 0,
      ay: 0,
      st: cSt,
      h: cH,
      minW: tw(x, vText, cSt) + cSt.size * 1.3 + cSt.size * 0.5 + cH * 0.9 + 1 * u,
      fill: dark ? alpha(p.fg, 0.08) : alpha(p.surface, 0.8),
      stroke: alpha(p.fg, 0.14),
      strokeWidth: 0.2 * u,
      color: p.fg,
      icon: ICONS.eye,
      iconColor: hot,
      g: { scale: to(0, 1, 2.15, 0.6, 'spring'), opacity: to(0, 1, 2.15, 0.2) },
    });
    // Counter on the viewers label
    const vt = viewC.layer.children[viewC.layer.children.length - 1];
    if (vNum && vt.type === 'text') {
      vt.counter = { from: Math.round(vNum.v * 0.55), to: vNum.v, start: 2.2, dur: 3.6, ease: 'outCubic', decimals: vNum.dec, prefix: vNum.pre, suffix: vNum.suf + ' ' + x.c.viewersLabel };
    }
    const chipsW = timeC.w + 2.2 * u + viewC.w;
    const chipsX = L ? tx : W / 2 - chipsW / 2;
    timeC.layer.x = chipsX;
    viewC.layer.x = chipsX + timeC.w + 2.2 * u;

    return {
      background: dark ? radial(L ? 0.27 : 0.5, L ? 0.5 : 0.35, 1, p.bg2, p.bg) : x.grad(170, p.bg, p.bg2),
      layers: [
        glow('glow', { x: ax0, y: ay0, r: D * 1.2, color: hot, a: dark ? 0.35 : 0.22, scale: pulse(0.6, 6, 1.8, 1, 1.08) }),
        ...ripples,
        av.layer,
        ...floaters,
        badge.layer,
        txt(x, 'host-name', x.c.host, hSt, { x: tx, y: yHost, ax: tax, ay: 0, align: L ? 'left' : 'center', fill: p.muted, anim: ta.chars(1.3, { stagger: 0.02 }) }),
        txt(x, 'title', x.c.title, tSt, { x: tx, y: yTitle, w: tBW, ax: tax, ay: 0, align: L ? 'left' : 'center', anim: ta.rise(1.45, { stagger: 0.08 }) }),
        txt(x, 'topic', x.c.topic, oSt, { x: tx, y: yTopic, w: oBW, ax: tax, ay: 0, align: L ? 'left' : 'center', fill: p.muted, anim: ta.blur(1.8, { stagger: 0.04 }) }),
        timeC.layer,
        viewC.layer,
      ],
    };
  },
};

export const eventRecipes: Recipe[] = [webinar, daysToGo, saveTheDate, liveNow];
