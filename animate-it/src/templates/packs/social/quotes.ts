/** Quotes & reviews: big quote, testimonial, review score, social post card. */
import type { Layer } from '../../../engine/types';
import { type Recipe, k, rect, circle, group, path, radial, ta, alpha, shade, readableOn, ICONS } from '../../kit';
import { type TS, txt, wrap, fit, tw, chip, stars, avatar, glow, brandRow, icon, ICON, burstD, to, num, splitNum, vivid, balance } from './util';

/** One quotation mark (“-style, head at the bottom) in a 26×36 box, offset by `ox`. */
function markD(ox = 0): string {
  const X = (v: number) => (v + ox).toFixed(1);
  return (
    `M${X(14)} 13 A11 11 0 0 1 ${X(14)} 35 A11 11 0 0 1 ${X(14)} 13 Z ` +
    `M${X(3)} 24 C${X(3)} 12 ${X(9)} 4 ${X(20)} 1 L${X(23.5)} 6 C${X(15.5)} 9.5 ${X(12.5)} 14 ${X(12.5)} 19 Z`
  );
}
const MARK = markD(0);

/** Verified badge: scalloped burst with a check, 100×100. */
const BADGE = burstD(12, 0.86);

// ------------------------------------------------------------------ Big Quote

const bigQuote: Recipe = {
  id: 'big-quote',
  name: 'Big Quote',
  category: 'quotes',
  tags: ['quote', 'typography', 'inspiration', 'minimal', 'editorial', 'thought leadership'],
  description: 'Oversized quotation marks spring in, the quote rises word by word and a marker highlights the final line.',
  duration: 5.5,
  fields: [
    { key: 'quote', label: 'Quote', default: 'Make it simple, then make it beautiful. Never the other way round.', multiline: true },
    { key: 'author', label: 'Author', default: 'Ines Moreau' },
    { key: 'role', label: 'Author role', default: 'Creative Director, Fieldnote Studio' },
  ],
  variants: [
    { name: 'Paper', palette: 'paper', fonts: 'serif', format: 'square' },
    {
      name: 'Royal',
      palette: 'royal',
      fonts: 'editorial',
      format: 'portrait',
      copy: { quote: 'The best brands don’t shout. They show up every day and keep their promises.', author: 'Daniel Okafor', role: 'Brand Strategist' },
    },
    {
      name: 'Noir',
      palette: 'noir',
      fonts: 'anton',
      format: 'story',
      copy: { quote: 'Done is better than perfect. Shipped is better than done.', author: 'Mara Quint', role: 'Founder, Byteforge' },
    },
    {
      name: 'Arctic',
      palette: 'arctic',
      fonts: 'manrope',
      format: 'landscape',
      copy: { quote: 'Customers forget features. They remember how you made them feel.', author: 'Leah Brandt', role: 'VP Customer Experience, Tidewater' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const m = x.pick({ landscape: 13 * u, story: 10 * u, default: 9 * u });
    const qW = x.pick({ landscape: Math.min(W - m * 2, 136 * u), default: W - m * 2 });
    const qSt = fit(
      x,
      x.c.quote,
      { role: 'title', size: x.pick({ landscape: 9.6 * u, story: 10.5 * u, portrait: 9.4 * u, square: 8.4 * u, default: 8.4 * u }), lh: 1.1 },
      qW,
      x.pick({ landscape: 4, story: 7, portrait: 6, default: 5 }),
    );
    const qBW = balance(x, x.c.quote, qSt, qW);
    const qWr = wrap(x, x.c.quote, qSt, qBW);
    const markH = x.pick({ landscape: 12 * u, story: 17 * u, portrait: 15 * u, default: 13 * u });
    const markW = (markH * 26) / 36;
    const nSt: TS = { role: 'body', size: x.pick({ story: 4.4 * u, default: 3.7 * u }), weight: 700 };
    const rSt: TS = { role: 'body', size: x.pick({ story: 3.7 * u, default: 3.1 * u }) };
    const rW = wrap(x, x.c.role, rSt, qW - 14 * u);
    const authorH = 1 * u + nSt.size * 1.35 + 0.6 * u + rW.h;
    const gap1 = x.pick({ story: 8 * u, default: 6 * u });
    const gap2 = x.pick({ story: 9 * u, default: 7 * u });
    const blockH = markH + gap1 + qWr.h + gap2 + authorH;
    const top = Math.max(m, (H - blockH) / 2 - x.pick({ story: 6 * u, default: 0 }));
    const yQuote = top + markH + gap1;
    const yAuthor = yQuote + qWr.h + gap2;
    const lastW = qWr.widths[qWr.n - 1];
    const lastTop = yQuote + (qWr.n - 1) * qWr.lineH;
    const dark = readableOn(p.bg) === '#ffffff';

    const mark = (id: string, ox: number, t0: number) =>
      path(id, MARK, 26, 36, {
        x: m + ox + markW / 2,
        y: top + markH / 2,
        w: markW,
        h: markH,
        fill: p.accent,
        scale: to(0, 1, t0, 0.8, 'spring'),
        rotation: to(-35, 0, t0, 0.9, 'outBack'),
      });

    const bigMarkH = x.pick({ landscape: 60 * u, story: 64 * u, default: 52 * u });
    return {
      background: dark ? radial(0.85, 0.15, 1.1, p.bg2, p.bg) : x.grad(150, p.bg, p.bg2),
      layers: [
        // Huge faint mark anchored in the far corner for depth.
        path('ghost-mark', markD(0) + ' ' + markD(28), 54, 36, {
          x: W - bigMarkH * 0.55,
          y: H - bigMarkH * 0.28,
          w: (bigMarkH * 54) / 36,
          h: bigMarkH,
          fill: alpha(p.accent, dark ? 0.08 : 0.06),
          rotation: k([0, 200], [5.5, 180, 'outCubic']),
          opacity: to(0, 1, 0, 1.2, 'outCubic'),
        }),
        mark('mark-a', 0, 0.1),
        mark('mark-b', markW * 1.08, 0.2),
        rect('marker', {
          x: m - 0.6 * u,
          y: lastTop + qWr.lineH * 0.52,
          ax: 0,
          h: qWr.lineH * 0.42,
          radius: 0.6 * u,
          fill: alpha(p.accent, dark ? 0.35 : 0.22),
          w: to(0, lastW + 1.2 * u, 1.75, 0.9, 'inOutCubic'),
        }),
        txt(x, 'quote', x.c.quote, qSt, {
          x: m,
          y: yQuote,
          w: qBW,
          ax: 0,
          ay: 0,
          align: 'left',
          anim: ta.rise(0.45, { stagger: 0.05, dur: 0.85 }),
        }),
        rect('rule', { x: m, y: yAuthor + 1 * u, ax: 0, h: 0.5 * u, radius: 0.25 * u, fill: p.accent, w: to(0, 10 * u, 2.1, 0.8, 'outExpo') }),
        txt(x, 'author', x.c.author, nSt, {
          x: m + 13 * u,
          y: yAuthor + 1 * u,
          ax: 0,
          ay: 0.5,
          align: 'left',
          anim: ta.slide(2.2, { stagger: 0.06 }),
        }),
        txt(x, 'role', rW.lines.join('\n'), rSt, {
          x: m + 13 * u,
          y: yAuthor + 1 * u + nSt.size * 0.68 + 0.6 * u,
          ax: 0,
          ay: 0,
          align: 'left',
          fill: p.muted,
          opacity: to(0, 1, 2.45, 0.7, 'outCubic'),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Testimonial

const testimonial: Recipe = {
  id: 'testimonial-stars',
  name: 'Customer Love',
  category: 'quotes',
  tags: ['testimonial', 'review', 'stars', 'customer', 'social proof', 'avatar'],
  description: 'A review card: the customer photo springs in, five stars pop one by one and their words fade up.',
  duration: 5.5,
  fields: [
    { key: 'label', label: 'Heading', default: 'What our customers say' },
    { key: 'quote', label: 'Review', default: 'Switched our whole team in a week. Support replies in minutes, not days.', multiline: true },
    { key: 'person', label: 'Customer name', default: 'Priya Raman' },
    { key: 'role', label: 'Customer role', default: 'Head of Ops, Fieldnote' },
    { key: 'rating', label: 'Stars (0–5)', default: '5' },
  ],
  images: [{ key: 'photo', label: 'Customer photo', art: 'portrait' }],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'manrope', format: 'portrait' },
    {
      name: 'Blush',
      palette: 'blush',
      fonts: 'dmserif',
      format: 'square',
      seed: 7,
      copy: { label: 'Real reviews', quote: 'My skin has never felt this calm. I’ve already reordered three times.', person: 'Chloé Martin', role: 'Verified buyer' },
    },
    {
      name: 'Forest',
      palette: 'forest',
      fonts: 'outfit',
      format: 'story',
      seed: 4,
      copy: { label: 'Trail tested', quote: 'The best hiking boots I’ve owned. Two hundred miles in and not a single blister.', person: 'Jonah Reyes', role: 'Ultra runner' },
    },
    {
      name: 'Midnight',
      palette: 'midnight',
      fonts: 'poppins',
      format: 'landscape',
      seed: 11,
      copy: { label: 'Loved by founders', quote: 'Setup took ten minutes. The reporting alone saves me a full day every month.', person: 'Marcus Lee', role: 'Founder, Northpeak Labs' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const dark = readableOn(p.bg) === '#ffffff';
    const cardW = x.pick({ landscape: 128 * u, story: 88 * u, default: 84 * u });
    const pad = x.pick({ landscape: 10 * u, story: 8 * u, default: 7 * u });
    const inner = cardW - pad * 2;
    const d = x.pick({ story: 28 * u, landscape: 18 * u, default: 19 * u });
    const starS = x.pick({ story: 7.2 * u, default: 5.2 * u });
    const qSt = fit(x, x.c.quote, { role: 'title', size: x.pick({ landscape: 6 * u, story: 8.4 * u, portrait: 6.6 * u, default: 5.8 * u }), lh: 1.16 }, inner, x.pick({ landscape: 3, story: 7, default: 5 }));
    const qBW = balance(x, x.c.quote, qSt, inner);
    const qWr = wrap(x, x.c.quote, qSt, qBW);
    const nSt: TS = { role: 'body', size: x.pick({ story: 5 * u, default: 3.6 * u }), weight: 700 };
    const rSt: TS = { role: 'body', size: x.pick({ story: 4 * u, default: 3 * u }) };
    const lSt = fit(x, x.c.label, { role: 'body', size: x.pick({ story: 3.8 * u, default: 2.8 * u }), weight: 700, uppercase: true, tracking: 0.16 }, W - 16 * u, 1);
    const rating = Math.max(0, Math.min(5, isNaN(num(x.c.rating)) ? 5 : num(x.c.rating)));

    // Card content stack (inside the card, below the avatar half that overlaps the top edge).
    const gStar = x.pick({ story: 5 * u, default: 4 * u });
    const gQuote = x.pick({ story: 7 * u, default: 5 * u });
    const gName = x.pick({ story: 7 * u, default: 5 * u });
    const contentH = d / 2 + gStar + starS + gQuote + qWr.h + gName + nSt.size * 1.35 + 0.6 * u + rSt.size * 1.35;
    const cardH = contentH + pad * 1.1;
    const labelGap = x.pick({ story: 9 * u, default: 7 * u });
    const totalH = lSt.size * 1.4 + labelGap + d / 2 + cardH;
    const top = (H - totalH) / 2 - x.pick({ story: 4 * u, default: 0 });
    const cardTop = top + lSt.size * 1.4 + labelGap + d / 2;
    const cx = W / 2;
    const yStars = cardTop + d / 2 + gStar;
    const yQuote = yStars + starS + gQuote;
    const yName = yQuote + qWr.h + gName;

    const st = stars('stars', {
      x: cx,
      y: yStars,
      ay: 0,
      size: starS,
      gap: starS * 0.22,
      rating,
      color: dark ? p.accent2 : p.accent,
      empty: alpha(p.fg, 0.12),
      t0: 1.0,
      stagger: 0.1,
    });
    const av = avatar('photo', x.img[0], {
      x: cx,
      y: cardTop,
      d,
      ring: p.surface,
      ringW: d * 0.06,
      gap: 0,
      imgScale: to(1.25, 1, 0.55, 1.4, 'outCubic'),
      g: { scale: to(0, 1, 0.55, 0.8, 'spring') },
    });
    const vbS = d * 0.3;
    const lastStarX = cx - st.w / 2 + (Math.ceil(rating) - 0.5) * (starS * 1.22);
    const sparks: Layer[] = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const r0 = starS * 0.7;
      const r1 = starS * 1.25;
      const t0 = 1.0 + (Math.ceil(rating) - 1) * 0.1 + 0.25;
      return rect(`spark-${i}`, {
        x: to(lastStarX + Math.cos(a) * r0, lastStarX + Math.cos(a) * r1, t0, 0.5, 'outCubic'),
        y: to(yStars + starS / 2 + Math.sin(a) * r0, yStars + starS / 2 + Math.sin(a) * r1, t0, 0.5, 'outCubic'),
        w: starS * 0.28,
        h: 0.5 * u,
        radius: 0.25 * u,
        rotation: (a * 180) / Math.PI,
        fill: dark ? p.accent2 : p.accent,
        opacity: k([t0, 0], [t0 + 0.1, 1], [t0 + 0.55, 0, 'inCubic']),
      });
    });

    return {
      background: x.grad(165, p.bg, p.bg2),
      layers: [
        glow('glow-a', { x: W * 0.12, y: H * 0.18, r: 50 * u, color: p.accent, a: dark ? 0.3 : 0.18, scale: to(0.6, 1, 0, 2, 'outCubic') }),
        glow('glow-b', { x: W * 0.9, y: H * 0.85, r: 55 * u, color: p.accent2, a: dark ? 0.22 : 0.2, scale: to(0.6, 1, 0.2, 2, 'outCubic') }),
        txt(x, 'label', x.c.label, lSt, { x: cx, y: top, ay: 0, fill: dark ? p.muted : p.accent, anim: ta.center(0.15, { stagger: 0.02 }) }),
        rect('card', {
          x: cx,
          y: to(cardTop + cardH / 2 + 10 * u, cardTop + cardH / 2, 0.2, 1.1, 'outExpo'),
          w: cardW,
          h: cardH,
          radius: 5 * u,
          fill: p.surface,
          stroke: alpha(p.fg, dark ? 0.1 : 0.05),
          strokeWidth: 0.2 * u,
          shadow: { color: alpha(dark ? '#000000' : '#0A1633', dark ? 0.4 : 0.12), blur: 6 * u, y: 2 * u },
          opacity: to(0, 1, 0.2, 0.5, 'outCubic'),
          scale: to(0.94, 1, 0.2, 1.1, 'outExpo'),
        }),
        av.layer,
        group(
          'verified',
          [
            path('verified-bg', BADGE, 100, 100, { x: vbS / 2, y: vbS / 2, w: vbS, h: vbS, fill: p.accent }),
            icon('verified-check', ICONS.check, { x: vbS / 2, y: vbS / 2, s: vbS * 0.55, color: p.onAccent, sw: 3.2, trimEnd: to(0, 1, 1.15, 0.4, 'outCubic') }),
          ],
          {
            x: cx + d * 0.36,
            y: cardTop + d * 0.34,
            w: vbS,
            h: vbS,
            scale: to(0, 1, 0.95, 0.6, 'spring'),
          },
        ),
        st.layer,
        ...sparks,
        txt(x, 'quote', x.c.quote, qSt, {
          x: cx,
          y: yQuote,
          w: qBW,
          ay: 0,
          anim: ta.blur(1.45, { stagger: 0.045 }),
        }),
        txt(x, 'person', x.c.person, nSt, { x: cx, y: yName, ay: 0, anim: ta.rise(2.3, { stagger: 0.06 }) }),
        txt(x, 'role', x.c.role, fit(x, x.c.role, rSt, inner, 1), {
          x: cx,
          y: yName + nSt.size * 1.35 + 0.6 * u,
          ay: 0,
          fill: p.muted,
          opacity: to(0, 1, 2.55, 0.6, 'outCubic'),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ Review Score

const reviewScore: Recipe = {
  id: 'review-score',
  name: 'Rating Score',
  category: 'quotes',
  tags: ['review', 'rating', 'stars', 'score', 'social proof', 'stats'],
  description: 'Your average rating counts up while the stars fill in sync, with an animated breakdown of every score.',
  duration: 5.5,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand', default: 'Kitepath' },
    { key: 'title', label: 'Heading', default: 'Loved by our customers', multiline: true },
    { key: 'score', label: 'Average score (out of 5)', default: '4.9' },
    { key: 'count', label: 'Number of reviews', default: '2,400' },
    { key: 'countLabel', label: 'Reviews label', default: 'verified reviews' },
    { key: 'badge', label: 'Badge', default: 'Top rated 2026' },
  ],
  variants: [
    { name: 'Arctic', palette: 'arctic', fonts: 'sora', format: 'square', logo: 'orbit' },
    {
      name: 'Paper',
      palette: 'paper',
      fonts: 'fraunces',
      format: 'portrait',
      logo: 'petal',
      copy: { brand: 'Fernly Goods', title: 'Rated by real gardeners', score: '4.8', count: '1,180', countLabel: 'reviews', badge: 'Customer favourite' },
    },
    {
      name: 'Graphite',
      palette: 'graphite',
      fonts: 'manrope',
      format: 'landscape',
      logo: 'stack',
      copy: { brand: 'Byteforge', title: 'Developers rate us', score: '4.7', count: '860', countLabel: 'reviews from teams', badge: 'Editor’s pick' },
    },
    {
      name: 'Lilac',
      palette: 'lilac',
      fonts: 'outfit',
      format: 'story',
      logo: 'wave',
      copy: { brand: 'Notewise', title: 'Our users are talking', score: '4.9', count: '12,400', countLabel: 'app ratings', badge: 'App of the day' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const L = x.isLandscape;
    const dark = readableOn(p.bg) === '#ffffff';
    const m = x.pick({ landscape: 10 * u, default: 8 * u });
    const sc = splitNum(x.c.score);
    const score = sc ? Math.max(0, Math.min(5, sc.v)) : 5;
    const dec = sc ? Math.max(1, sc.dec) : 1;
    const cnt = splitNum(x.c.count);

    // Distribution consistent with the average.
    const p5 = Math.max(0, Math.min(1, (score - 3.4) / 1.6));
    const dist = [p5, (1 - p5) * 0.6, (1 - p5) * 0.25, (1 - p5) * 0.1, (1 - p5) * 0.05].map((v) => Math.round(v * 100));

    // Layout modes: landscape = two columns; square/portrait = score row; story = centred stack.
    const mode: 'split' | 'row' | 'stack' = L ? 'split' : x.isStory ? 'stack' : 'row';
    const leftW = L ? 70 * u : W - m * 2;
    const leftX = L ? m + 4 * u : mode === 'row' ? m : W / 2;
    const barsW = L ? 74 * u : W - m * 2 - x.pick({ story: 4 * u, default: 0 });
    const barsX = L ? W - m - barsW - 4 * u : (W - barsW) / 2;
    const ax = mode === 'stack' ? 0.5 : 0;
    const align = mode === 'stack' ? 'center' : 'left';

    const logoS = x.pick({ story: 6.4 * u, default: 5.2 * u });
    const bSt: TS = { role: 'body', size: x.pick({ story: 4 * u, default: 3.4 * u }), weight: 700 };
    const titleW = L ? leftW : W - m * 2;
    const tSt = fit(x, x.c.title, { role: 'title', size: x.pick({ landscape: 7 * u, story: 9 * u, portrait: 8 * u, square: 6.6 * u, default: 7 * u }), lh: 1.04 }, titleW, 2);
    const tWr = wrap(x, x.c.title, tSt, titleW);
    const starS = x.pick({ landscape: 6.4 * u, story: 8 * u, portrait: 6.2 * u, default: 5.4 * u });
    const starsW = starS * 5 + starS * 0.2 * 4;
    const cSt: TS = { role: 'body', size: x.pick({ story: 3.9 * u, default: 3.2 * u }), weight: 500 };
    let scoreSt: TS = { role: 'title', size: x.pick({ landscape: 30 * u, story: 38 * u, portrait: 30 * u, square: 25 * u, default: 30 * u }), lh: 1 };
    const scoreText = score.toFixed(dec);
    const outText = '/ 5';
    const measureScore = () => {
      const sw = tw(x, scoreText, scoreSt) * 1.04;
      const os: TS = { role: 'body', size: scoreSt.size * 0.24, weight: 600 };
      return { sw, os, ow: tw(x, outText, os) };
    };
    let ms = measureScore();
    if (mode === 'row') {
      // Score + "/ 5" must leave room for the stars column on the right.
      const room = W - m * 2 - starsW - 6 * u;
      const need = ms.sw + 2 * u + ms.ow;
      if (need > room) {
        scoreSt = { ...scoreSt, size: (scoreSt.size * room) / need };
        ms = measureScore();
      }
    }
    if (mode === 'stack') {
      // Long headings: shrink the hero score so the whole stack stays inside the story safe area.
      const est =
        x.pick({ story: 6.4 * u, default: 5.2 * u }) + 7 * u + tWr.h + 6 * u + wrap(x, scoreText, scoreSt).h + 3 * u + starS + 4 * u + cSt.size * 1.35 + 8 * u + 8 * u * 5 + 12 * u;
      const avail = H - 30 * u;
      if (est > avail) {
        scoreSt = { ...scoreSt, size: Math.max(scoreSt.size * 0.6, scoreSt.size - ((est - avail) * 0.7) / x.f.displayScale) };
        ms = measureScore();
      }
    }
    const scoreW = ms.sw;
    const outSt = ms.os;
    const outW = ms.ow;
    const scoreH = wrap(x, scoreText, scoreSt).h;
    const eSt: TS = { role: 'body', size: x.pick({ story: 3.4 * u, default: 2.9 * u }), weight: 700 };
    const eH = eSt.size * 2.6;

    // Vertical layout
    const gT = x.pick({ story: 7 * u, default: 4.5 * u });
    const padTop = eH / 2 + 3 * u;
    const padBot = x.pick({ landscape: 5 * u, default: 3.5 * u });
    let rowH = x.pick({ landscape: 8.6 * u, story: 8 * u, default: 7 * u });
    let yBrand: number, yTitle: number, yScore: number, yStars: number, yCount: number, yBars: number;
    const countLines = mode === 'row' ? 2 : 1;
    const countH = cSt.size * 1.35 * countLines;
    if (mode === 'split') {
      const blk = logoS + gT + tWr.h + 5 * u + scoreH + 3 * u + starS + 4 * u + countH;
      yBrand = (H - blk) / 2;
      yTitle = yBrand + logoS + gT;
      yScore = yTitle + tWr.h + 5 * u;
      yStars = yScore + scoreH + 3 * u;
      yCount = yStars + starS + 4 * u;
      yBars = (H - (rowH * 5 + padTop + padBot)) / 2;
    } else if (mode === 'row') {
      yBrand = m;
      yTitle = yBrand + logoS + gT;
      yScore = yTitle + tWr.h + x.pick({ portrait: 6 * u, default: 4 * u });
      const rightH = starS + 2.6 * u + countH;
      yStars = yScore + (scoreH - rightH) / 2;
      yCount = yStars + starS + 2.6 * u;
      yBars = yScore + scoreH + x.pick({ portrait: 7 * u, default: 5 * u });
      const room = H - m - yBars;
      rowH = Math.max(5 * u, Math.min(x.pick({ portrait: 8.4 * u, default: 7.2 * u }), (room - padTop - padBot) / 5));
      yBars += Math.max(0, room - (rowH * 5 + padTop + padBot)) / 2;
    } else {
      let blk = logoS + gT + tWr.h + 6 * u + scoreH + 3 * u + starS + 4 * u + countH + 8 * u + rowH * 5 + padTop + padBot;
      const avail = H - 30 * u;
      if (blk > avail) {
        const r2 = Math.max(5.5 * u, rowH - (blk - avail) / 5);
        blk -= (rowH - r2) * 5;
        rowH = r2;
      }
      yBrand = Math.max(15 * u, (H - blk) / 2 - 3 * u);
      yTitle = yBrand + logoS + gT;
      yScore = yTitle + tWr.h + 6 * u;
      yStars = yScore + scoreH + 3 * u;
      yCount = yStars + starS + 4 * u;
      yBars = yCount + countH + 8 * u;
    }
    const barsH = rowH * 5 + padTop + padBot;
    const barH = rowH * 0.28;
    const labSt: TS = { role: 'body', size: Math.max(2.5 * u, Math.min(rowH * 0.5, 3.4 * u)), weight: 700 };
    const pctSt: TS = { role: 'body', size: Math.max(2.4 * u, Math.min(rowH * 0.46, 3.2 * u)), weight: 600 };
    const labW = tw(x, '5', labSt) + labSt.size * 1.3 + 1.6 * u;
    const pctW = tw(x, '100%', pctSt);
    const bpx = x.pick({ landscape: 5 * u, default: 4.5 * u });
    const trackW = barsW - bpx * 2 - labW - pctW - 2.6 * u;

    const T0 = 0.5;
    const TD = 1.9;
    const scoreLeft = mode === 'stack' ? W / 2 - (scoreW + 2 * u + outW) / 2 : leftX;
    const scoreRight = scoreLeft + scoreW;
    const starsX = mode === 'row' ? W - m - starsW : leftX;
    const st = stars('stars', {
      x: starsX,
      y: yStars,
      ax: mode === 'row' ? 0 : ax,
      ay: 0,
      size: starS,
      gap: starS * 0.2,
      rating: score,
      color: p.accent,
      empty: alpha(p.fg, 0.13),
      t0: T0,
      mode: 'sweep',
      sweepDur: TD,
      sweepEase: 'outCubic',
    });

    const rows: Layer[] = [];
    dist.forEach((pct, i) => {
      const y = yBars + padTop + i * rowH + rowH / 2;
      const t0 = 1.0 + i * 0.1;
      const x0 = barsX + bpx;
      rows.push(
        txt(x, `row-${i}-n`, String(5 - i), labSt, { x: x0, y, ax: 0, align: 'left', fill: p.fg, opacity: to(0, 1, t0, 0.4, 'outCubic') }),
        path(`row-${i}-s`, ICONS.star, 24, 24, {
          x: x0 + tw(x, '5', labSt) + labSt.size * 0.8,
          y,
          w: labSt.size * 1.05,
          h: labSt.size * 1.05,
          fill: p.accent,
          stroke: p.accent,
          strokeWidth: 1.5,
          scale: to(0, 1, t0, 0.5, 'outBack'),
        }),
        rect(`row-${i}-track`, { x: x0 + labW, y, ax: 0, w: trackW, h: barH, radius: barH / 2, fill: alpha(p.fg, 0.1) }),
        rect(`row-${i}-fill`, {
          x: x0 + labW,
          y,
          ax: 0,
          h: barH,
          radius: barH / 2,
          fill: i === 0 ? p.accent : shade(p.accent, dark ? -0.25 : 0.35),
          w: to(0, Math.max(barH, (trackW * pct) / 100), t0 + 0.1, 1.3, 'outExpo'),
        }),
        txt(x, `row-${i}-pct`, `${pct}%`, pctSt, {
          x: barsX + barsW - bpx,
          y,
          ax: 1,
          align: 'right',
          fill: p.muted,
          counter: { from: 0, to: pct, start: t0 + 0.1, dur: 1.3, ease: 'outExpo', suffix: '%' },
        }),
      );
    });

    const badge = chip(x, 'badge', x.c.badge, {
      x: barsX + barsW - 3 * u,
      y: yBars,
      ax: 1,
      ay: 0.5,
      st: eSt,
      h: eH,
      fill: p.fg,
      color: p.bg,
      icon: ICONS.trophy,
      g: { scale: to(0, 1, 2.6, 0.7, 'spring'), opacity: to(0, 1, 2.6, 0.2), rotation: to(-8, 0, 2.6, 0.8, 'outBack') },
    });

    return {
      background: dark ? radial(0.3, 0.3, 1.1, p.bg2, p.bg) : x.grad(160, p.bg, p.bg2),
      layers: [
        glow('glow', { x: mode === 'stack' ? W / 2 : leftX + 18 * u, y: yScore + scoreH / 2, r: 50 * u, color: p.accent, a: dark ? 0.3 : 0.2, scale: to(0.5, 1, 0.2, 1.6, 'outExpo') }),
        brandRow(x, 'brand', x.c.brand, {
          x: mode === 'stack' ? W / 2 : leftX,
          y: yBrand,
          ax,
          ay: 0,
          logo: logoS,
          st: bSt,
          color: p.fg,
          logoColor: p.accent,
          g: { opacity: to(0, 1, 0.1, 0.6, 'outCubic') },
        }).layer,
        txt(x, 'title', x.c.title, tSt, {
          x: mode === 'stack' ? W / 2 : leftX,
          y: yTitle,
          w: titleW,
          ax,
          ay: 0,
          align,
          anim: ta.rise(0.2, { stagger: 0.06 }),
        }),
        txt(x, 'score', scoreText, scoreSt, {
          x: scoreRight,
          y: yScore + scoreH,
          ax: 1,
          ay: 1,
          align: 'right',
          fill: p.fg,
          counter: { from: 0, to: score, start: T0, dur: TD, ease: 'outCubic', decimals: dec },
          scale: to(0.85, 1, T0, 1, 'outExpo'),
          opacity: to(0, 1, T0 - 0.1, 0.3, 'outCubic'),
        }),
        txt(x, 'out-of', outText, outSt, {
          x: scoreRight + 2 * u,
          y: yScore + scoreH - (scoreSt.size * x.f.displayScale - outSt.size) * 0.14,
          ax: 0,
          ay: 1,
          align: 'left',
          fill: p.muted,
          opacity: to(0, 1, T0 + 0.6, 0.6, 'outCubic'),
        }),
        st.layer,
        txt(x, 'count', x.c.count + (countLines > 1 ? '\n' : ' ') + x.c.countLabel, cSt, {
          x: mode === 'row' ? starsX : leftX,
          y: yCount,
          ax: mode === 'row' ? 0 : ax,
          ay: 0,
          align,
          fill: p.muted,
          ...(cnt
            ? { counter: { from: 0, to: cnt.v, start: T0, dur: TD, ease: 'outCubic', decimals: cnt.dec, prefix: cnt.pre, suffix: cnt.suf + (countLines > 1 ? '\n' : ' ') + x.c.countLabel } }
            : {}),
          opacity: to(0, 1, T0, 0.4, 'outCubic'),
        }),
        rect('bars-card', {
          x: barsX,
          y: yBars,
          ax: 0,
          ay: 0,
          w: barsW,
          h: barsH,
          radius: 4 * u,
          fill: dark ? alpha(p.fg, 0.05) : p.surface,
          stroke: alpha(p.fg, dark ? 0.1 : 0.06),
          strokeWidth: 0.2 * u,
          shadow: dark ? undefined : { color: alpha('#0A1633', 0.08), blur: 4 * u, y: 1.2 * u },
          opacity: to(0, 1, 0.8, 0.5, 'outCubic'),
          scale: to(0.95, 1, 0.8, 0.9, 'outExpo'),
        }),
        ...rows,
        badge.layer,
      ],
    };
  },
};

// ------------------------------------------------------------------ Post Card

const postCard: Recipe = {
  id: 'post-card',
  name: 'Post Card',
  category: 'quotes',
  tags: ['post', 'tweet', 'social', 'typing', 'likes', 'thread', 'new'],
  description: 'A social post that types itself out, then gets liked: the heart bursts and the counter ticks up.',
  duration: 6,
  fields: [
    { key: 'name', label: 'Display name', default: 'Maya Lindqvist' },
    { key: 'handle', label: 'Handle', default: '@mayamakes' },
    { key: 'post', label: 'Post', default: 'Shipped my first animated carousel today. Took ten minutes and got 3x the saves. Not going back.', multiline: true },
    { key: 'time', label: 'Timestamp', default: '9:41 AM · Nov 8' },
    { key: 'replies', label: 'Replies', default: '48' },
    { key: 'reposts', label: 'Reposts', default: '312' },
    { key: 'likes', label: 'Likes', default: '2,847' },
  ],
  images: [{ key: 'avatar', label: 'Profile photo', art: 'portrait' }],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', format: 'square', seed: 3 },
    {
      name: 'Midnight',
      palette: 'midnight',
      fonts: 'outfit',
      format: 'portrait',
      seed: 6,
      copy: { name: 'Dev Patel', handle: '@devbuilds', post: 'Hot take: your landing page doesn’t need another feature section. It needs one clear sentence.', time: '8:15 PM · Oct 2', replies: '210', reposts: '1.9K', likes: '12.4K' },
    },
    {
      name: 'Lilac',
      palette: 'lilac',
      fonts: 'poppins',
      format: 'story',
      seed: 9,
      copy: { name: 'Sofia Reyes', handle: '@sofiacooks', post: 'Made the 15-minute miso pasta again tonight. Five ingredients, zero regrets. Recipe in the replies!', time: '7:02 PM · Sep 14', replies: '96', reposts: '540', likes: '5,326' },
    },
    {
      name: 'Slate',
      palette: 'slate',
      fonts: 'manrope',
      format: 'landscape',
      seed: 2,
      copy: { name: 'Kitepath', handle: '@kitepath', post: 'We just crossed 100,000 creators. Thank you for every post, every template and every bit of feedback.', time: '10:00 AM · Nov 8', replies: '128', reposts: '864', likes: '9,614' },
    },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const dark = readableOn(p.surface) === '#ffffff';
    const cardW = x.pick({ landscape: 118 * u, story: 90 * u, portrait: 88 * u, default: 86 * u });
    const pad = x.pick({ landscape: 7 * u, story: 7.5 * u, portrait: 7 * u, default: 6 * u });
    const inner = cardW - pad * 2;
    const av = x.pick({ story: 15 * u, portrait: 12.5 * u, default: 11 * u });
    const nSt: TS = { role: 'body', size: x.pick({ story: 5 * u, portrait: 4.2 * u, default: 3.7 * u }), weight: 700 };
    const hSt: TS = { role: 'body', size: x.pick({ story: 4.2 * u, portrait: 3.6 * u, default: 3.2 * u }) };
    const pSt = fit(x, x.c.post, { role: 'body', size: x.pick({ landscape: 4.6 * u, story: 6.4 * u, portrait: 5.6 * u, default: 4.6 * u }), weight: 500, lh: 1.38 }, inner, x.pick({ landscape: 3, story: 8, portrait: 6, default: 5 }));
    const pWr = wrap(x, x.c.post, pSt, inner);
    const tSt: TS = { role: 'body', size: x.pick({ story: 4 * u, portrait: 3.4 * u, default: 3 * u }) };
    const aSt: TS = { role: 'body', size: x.pick({ story: 4.1 * u, portrait: 3.5 * u, default: 3.1 * u }), weight: 600 };
    const iconS = aSt.size * 1.5;
    const gPost = x.pick({ story: 6 * u, default: 5 * u });
    const gTime = x.pick({ story: 5 * u, default: 4 * u });
    const gRule = x.pick({ story: 4.5 * u, default: 3.5 * u });
    const actH = iconS * 1.6;
    const cardH = pad + av + gPost + pWr.h + gTime + tSt.size * 1.35 + gRule + 0.2 * u + actH + pad * 0.6;
    const cardTop = (H - cardH) / 2 - x.pick({ story: 4 * u, default: 0 });
    const cx = W / 2;
    const left = cx - cardW / 2 + pad;
    const yHead = cardTop + pad;
    const yPost = yHead + av + gPost;
    const yTime = yPost + pWr.h + gTime;
    const yRule = yTime + tSt.size * 1.35 + gRule;
    const yAct = yRule + 0.2 * u + actH / 2;

    // Typing + like timing
    const typeStart = 0.9;
    const chars = Array.from(x.c.post).length;
    const typeDur = Math.min(2.2, Math.max(1.2, chars * 0.022));
    const tLike = typeStart + typeDur + 0.45;

    const nameW = tw(x, x.c.name, nSt);
    const vb = nSt.size * 1.15;
    const textX = left + av + 3 * u;
    const nameY = yHead + av * 0.3;
    const handleY = yHead + av * 0.74;

    // Likes counter
    const lk = num(x.c.likes);
    const kFmt = /k/i.test(x.c.likes) || lk >= 10000;
    const likesTo = isNaN(lk) ? 0 : kFmt ? lk / 1000 : lk;
    const likesFrom = likesTo * 0.82;
    const slotW = inner / 4;
    const slot = (i: number) => left + i * slotW;
    const likeX = slot(2) + iconS / 2;
    const likeColor = vivid(p);

    const action = (i: number, id: string, d: string, label: string) => [
      icon(`${id}-i`, d, { x: slot(i) + iconS / 2, y: yAct, s: iconS, color: p.muted, sw: 1.9, opacity: to(0, 1, tLike - 0.9 + i * 0.08, 0.4, 'outCubic') }),
      txt(x, `${id}-n`, label, aSt, { x: slot(i) + iconS + 1.6 * u, y: yAct, ax: 0, align: 'left', fill: p.muted, opacity: to(0, 1, tLike - 0.85 + i * 0.08, 0.4, 'outCubic') }),
    ];

    const floaters: Layer[] = Array.from({ length: 4 }, (_, i) => {
      const t0 = tLike + 0.1 + i * 0.18;
      const dx = (i % 2 ? 1 : -1) * (1.2 + i * 0.8) * u;
      const s = (2.2 + (i % 3) * 0.7) * u;
      return path(`float-${i}`, ICONS.heart, 24, 24, {
        x: k([t0, likeX], [t0 + 1.6, likeX + dx, 'outSine']),
        y: k([t0, yAct], [t0 + 1.6, yAct - (8 + i * 2.5) * u, 'outCubic']),
        w: s,
        h: s,
        fill: i % 2 ? p.accent2 : likeColor,
        opacity: k([t0, 0], [t0 + 0.15, 1], [t0 + 1.1, 1], [t0 + 1.6, 0, 'inCubic']),
        scale: to(0.4, 1, t0, 0.5, 'outBack'),
        rotation: to(0, (i % 2 ? 1 : -1) * 18, t0, 1.6, 'outSine'),
        end: t0 + 1.61,
      });
    });

    const burst: Layer[] = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const r0 = iconS * 0.5;
      const r1 = iconS * 1.25;
      return circle(`burst-${i}`, 0.45 * u, {
        x: to(likeX + Math.cos(a) * r0, likeX + Math.cos(a) * r1, tLike + 0.05, 0.5, 'outCubic'),
        y: to(yAct + Math.sin(a) * r0, yAct + Math.sin(a) * r1, tLike + 0.05, 0.5, 'outCubic'),
        fill: i % 2 ? p.accent2 : likeColor,
        opacity: k([tLike, 0], [tLike + 0.08, 1], [tLike + 0.55, 0, 'inCubic']),
        end: tLike + 0.6,
      });
    });

    return {
      background: x.grad(140, p.bg, p.bg2),
      layers: [
        glow('glow-a', { x: W * 0.85, y: H * 0.12, r: 48 * u, color: p.accent, a: dark ? 0.35 : 0.22 }),
        glow('glow-b', { x: W * 0.1, y: H * 0.9, r: 52 * u, color: p.accent2, a: dark ? 0.25 : 0.2 }),
        rect('card', {
          x: cx,
          y: to(cardTop + cardH / 2 + 12 * u, cardTop + cardH / 2, 0, 1.1, 'outExpo'),
          w: cardW,
          h: cardH,
          radius: 4.5 * u,
          fill: p.surface,
          stroke: alpha(p.fg, dark ? 0.1 : 0.06),
          strokeWidth: 0.2 * u,
          shadow: { color: alpha(dark ? '#000000' : '#0A1633', dark ? 0.45 : 0.14), blur: 6 * u, y: 2 * u },
          opacity: to(0, 1, 0, 0.4, 'outCubic'),
        }),
        avatar('avatar', x.img[0], { x: left, y: yHead, ax: 0, ay: 0, d: av, g: { scale: to(0, 1, 0.35, 0.7, 'spring') } }).layer,
        txt(x, 'name', x.c.name, nSt, { x: textX, y: nameY, ax: 0, align: 'left', fill: p.fg, anim: ta.slide(0.45, { stagger: 0.05 }) }),
        group(
          'verified',
          [
            path('verified-bg', BADGE, 100, 100, { x: vb / 2, y: vb / 2, w: vb, h: vb, fill: p.accent }),
            icon('verified-check', ICONS.check, { x: vb / 2, y: vb / 2, s: vb * 0.58, color: p.onAccent, sw: 3.2 }),
          ],
          { x: textX + nameW + 1.2 * u + vb / 2, y: nameY, w: vb, h: vb, scale: to(0, 1, 0.75, 0.6, 'spring'), rotation: to(-90, 0, 0.75, 0.7, 'outBack') },
        ),
        txt(x, 'handle', x.c.handle, hSt, { x: textX, y: handleY, ax: 0, align: 'left', fill: p.muted, opacity: to(0, 1, 0.6, 0.5, 'outCubic') }),
        ...[0, 1, 2].map((i) =>
          circle(`more-${i}`, 0.45 * u, {
            x: cx + cardW / 2 - pad - i * 1.6 * u,
            y: yHead + av * 0.3,
            fill: p.muted,
            opacity: to(0, 1, 0.6, 0.4, 'outCubic'),
          }),
        ),
        txt(x, 'post', x.c.post, pSt, {
          x: left,
          y: yPost,
          w: inner,
          ax: 0,
          ay: 0,
          align: 'left',
          fill: p.fg,
          anim: ta.type(typeStart, { stagger: typeDur / Math.max(1, chars) }),
        }),
        rect('caret', {
          x: left,
          y: yPost,
          ax: 0,
          ay: 0,
          w: 0.45 * u,
          h: pWr.lineH * 0.9,
          fill: p.accent,
          opacity: k([0, 0], [0.5, 1], [0.7, 0], [0.9, 1]),
          end: typeStart,
        }),
        txt(x, 'time', x.c.time, tSt, { x: left, y: yTime, ax: 0, ay: 0, align: 'left', fill: p.muted, opacity: to(0, 1, typeStart + typeDur, 0.5, 'outCubic') }),
        rect('rule', { x: left, y: yRule, ax: 0, ay: 0, h: Math.max(1, 0.2 * u), fill: alpha(p.fg, 0.1), w: to(0, inner, typeStart + typeDur * 0.6, 0.8, 'outExpo') }),
        ...action(0, 'reply', ICON.reply, x.c.replies),
        ...action(1, 'repost', ICON.repost, x.c.reposts),
        icon('like-outline', ICONS.heart, {
          x: likeX,
          y: yAct,
          s: iconS,
          color: p.muted,
          sw: 1.9,
          opacity: k([tLike - 0.9 + 0.16, 0], [tLike - 0.5, 1, 'outCubic'], [tLike, 1], [tLike + 0.05, 0]),
        }),
        ...burst,
        path('like-fill', ICONS.heart, 24, 24, {
          x: likeX,
          y: yAct,
          w: iconS,
          h: iconS,
          fill: likeColor,
          stroke: likeColor,
          strokeWidth: 1.9,
          scale: k([tLike, 0], [tLike + 0.18, 1.35, 'outCubic'], [tLike + 0.6, 1, 'spring']),
        }),
        txt(x, 'likes', x.c.likes, aSt, {
          x: slot(2) + iconS + 1.6 * u,
          y: yAct,
          ax: 0,
          align: 'left',
          fill: k<string>([tLike, p.muted], [tLike + 0.3, likeColor, 'outCubic']),
          opacity: to(0, 1, tLike - 0.85 + 0.16, 0.4, 'outCubic'),
          ...(isNaN(lk)
            ? {}
            : { counter: { from: likesFrom, to: likesTo, start: tLike, dur: 6 - tLike - 0.2, ease: 'outCubic', decimals: kFmt ? 1 : 0, suffix: kFmt ? 'K' : '' } }),
        }),
        icon('share-i', ICONS.share, { x: slot(3) + slotW - iconS / 2, y: yAct, s: iconS * 0.95, color: p.muted, sw: 1.9, opacity: to(0, 1, tLike - 0.6, 0.4, 'outCubic') }),
        ...floaters,
      ],
    };
  },
};

export const quoteRecipes: Recipe[] = [bigQuote, testimonial, reviewScore, postCard];
