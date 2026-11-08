import type { Layer } from '../../../engine/types';
import { type Recipe, rect, circle, group, image, path, k, fadeIn, pop, ta, alpha, lerpColor, linear } from '../../kit';
import { QUOTE_D, bandD, chip, fadeUp, pad2, shadowCol, slideX, smoothThrough, star, statTitle, swipeCue, tsz } from './shared';

/** Testimonials: review cards floating on one ribbon that winds behind every slide. */
export const reviewRibbon: Recipe = {
  id: 'carousel-review-ribbon',
  name: 'Review Ribbon',
  category: 'carousel',
  tags: ['carousel', 'testimonials', 'reviews', 'social proof', 'quotes', 'seamless', 'ecommerce'],
  description: 'Counting star rating on the cover, three review cards on a winding ribbon and a customer-stack call to action.',
  duration: 5,
  slides: 5,
  images: [
    { key: 'face1', label: 'Reviewer 1 photo', art: 'portrait' },
    { key: 'face2', label: 'Reviewer 2 photo', art: 'portrait' },
    { key: 'face3', label: 'Reviewer 3 photo', art: 'portrait' },
  ],
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Kindred Skin' },
    { key: 'handle', label: 'Handle', default: '@kindred.skin' },
    { key: 'rating', label: 'Average rating', default: '4.9' },
    { key: 'count', label: 'Rating note', default: 'from 2,300+ verified reviews' },
    { key: 'title', label: 'Cover title', default: 'Don’t just take our word for it', multiline: true },
    { key: 'q1', label: 'Review 1', default: 'My skin has never been this calm. Three weeks in and the redness is basically gone.', multiline: true },
    { key: 'n1', label: 'Reviewer 1 name', default: 'Amara J.' },
    { key: 'r1', label: 'Reviewer 1 detail', default: 'Sensitive skin · Calm Set' },
    { key: 'q2', label: 'Review 2', default: 'Finally a routine I actually stick to. Four steps, five minutes, zero guesswork.', multiline: true },
    { key: 'n2', label: 'Reviewer 2 name', default: 'Daniel R.' },
    { key: 'r2', label: 'Reviewer 2 detail', default: 'Verified buyer · London' },
    { key: 'q3', label: 'Review 3', default: 'I doubted the price, but one bottle lasted me almost four months. Worth it.', multiline: true },
    { key: 'n3', label: 'Reviewer 3 name', default: 'Priya S.' },
    { key: 'r3', label: 'Reviewer 3 detail', default: 'Customer since 2024' },
    { key: 'cta', label: 'Final slide title', default: 'Join 2,300+ happy customers', multiline: true },
    { key: 'ctaBtn', label: 'Final slide button', default: 'Shop the bestsellers' },
    { key: 'more', label: 'Avatar badge', default: '+2k' },
  ],
  variants: [
    { name: 'Slate', palette: 'slate', fonts: 'serif' },
    {
      name: 'Royal Hotel',
      palette: 'royal',
      fonts: 'fraunces',
      copy: {
        brand: 'Juniper House',
        handle: '@juniperhouse.stays',
        rating: '4.8',
        count: 'from 1,140 guest reviews',
        title: 'What our guests remember',
        q1: 'The quietest night’s sleep I have had in years. Breakfast on the terrace was unreal.',
        n1: 'Sofia M.',
        r1: 'Stayed 3 nights · June',
        q2: 'They remembered my coffee order on day two. Small touches like that are rare.',
        n2: 'James O.',
        r2: 'Business trip · Garden room',
        q3: 'We came for the weekend and extended twice. Already booked next spring.',
        n3: 'Lena & Tom',
        r3: 'Anniversary stay',
        cta: 'Your table on the terrace is waiting',
        ctaBtn: 'Book your stay',
        more: '+1k',
      },
    },
    {
      name: 'Mint Fitness',
      palette: 'mint',
      fonts: 'poppins',
      copy: {
        brand: 'Fieldwork Fitness',
        handle: '@fieldwork.fit',
        rating: '5.0',
        count: 'from 860 member reviews',
        title: 'Real members, real results',
        q1: 'Down 9 kg and up a whole personality. The 7 am crew is the best part of my day.',
        n1: 'Marcus T.',
        r1: 'Member · 14 months',
        q2: 'Coaches who actually watch your form. My back pain is gone after years.',
        n2: 'Hannah L.',
        r2: 'Strength track',
        q3: 'I hated gyms. This does not feel like one. Small groups, zero judgment.',
        n3: 'Ade K.',
        r3: 'Member · 6 months',
        cta: 'Your first week is on us',
        ctaBtn: 'Claim your free week',
        more: '+800',
      },
    },
    {
      name: 'Electric SaaS',
      palette: 'electric',
      fonts: 'grotesk',
      copy: {
        brand: 'Plannery',
        handle: '@plannery.app',
        rating: '4.8',
        count: 'from 12,000+ teams',
        title: 'Teams switch. Then they stay.',
        q1: 'We replaced four tools and a weekly status meeting. Planning takes ten minutes now.',
        n1: 'Ruth A.',
        r1: 'Head of Ops · 40-person team',
        q2: 'The first project tool our engineers did not complain about. Huge win.',
        n2: 'Kenji W.',
        r2: 'CTO · Seed-stage startup',
        q3: 'Onboarding took one afternoon. The templates alone saved us a week.',
        n3: 'Elif D.',
        r3: 'Agency founder',
        cta: 'Try it free with your team',
        ctaBtn: 'Start free trial',
        more: '+12k',
      },
    },
  ],
  build(x) {
    const { u, W, p, slideW: S, slides: N } = x;
    const dur = 5;
    const m = 9 * u;
    const L: Layer[] = [];

    // ribbon that winds behind every slide
    const centre = smoothThrough([
      [-20 * u, 104 * u],
      [S * 0.5, 110 * u],
      [S, 92 * u],
      [S * 1.5, 62 * u],
      [S * 2, 76 * u],
      [S * 2.5, 58 * u],
      [S * 3, 78 * u],
      [S * 3.5, 62 * u],
      [S * 4, 92 * u],
      [S * 4.5, 110 * u],
      [W + 20 * u, 104 * u],
    ]);
    const thick = 11 * u;
    L.push(
      path('rb-ribbon', bandD((g) => centre(g) - thick / 2, (g) => centre(g) + thick / 2, -20 * u, W + 20 * u, 18), x.W, x.H, {
        x: k([0, 0], [dur, -5 * u, 'linear']),
        y: 0,
        w: x.W,
        h: x.H,
        ax: 0,
        ay: 0,
        fill: linear(0, p.accent, lerpColor(p.accent, p.accent2, 0.55), p.accent, lerpColor(p.accent, p.accent2, 0.55), p.accent),
        opacity: fadeIn(0, 0.8),
      }),
    );

    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      L.push(
        x.body(`hd-b-${i}`, x.c.brand, { size: 2.9 * u, x: X + m, y: 8.5 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, opacity: fadeIn(0.05, 0.5) }),
        x.body(`hd-c-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, { size: 2.8 * u, x: X + S - m, y: 8.5 * u, ax: 1, align: 'right', weight: 600, fill: p.muted, tracking: 0.08, opacity: fadeIn(0.1, 0.5) }),
      );
    }

    const starRow = (id: string, cx: number, y: number, size: number, t0: number, color: string): Layer[] =>
      Array.from({ length: 5 }, (_, j) =>
        star(`${id}-${j}`, { x: cx + (j - 2) * size * 1.22, y, size, color, scale: pop(t0 + j * 0.07, 0.5), rotation: k([t0 + j * 0.07, -40], [t0 + j * 0.07 + 0.5, 0, 'outBack']) }),
      );

    // ---------------------------------------------------------------- cover
    {
      const cx = S / 2;
      L.push(
        statTitle(x, 'cv-rating', x.c.rating, { size: tsz(x, 30 * u), x: cx, y: 31 * u, lineHeight: 1, start: 0.15, dur: 1.4 }),
        ...starRow('cv-star', cx, 51 * u, 6 * u, 0.5, p.accent),
        x.body('cv-count', x.c.count, { size: 3.6 * u, x: cx, y: 59 * u, weight: 600, fill: p.muted, anim: fadeUp(0.8) }),
        x.title('cv-title', x.c.title, { size: tsz(x, 9.6 * u), x: cx, y: 67 * u, w: S - 2 * m, ay: 0, lineHeight: 1.02, anim: ta.riseLines(0.5, { stagger: 0.12 }) }),
        swipeCue(x, 'cv-swipe', { x: cx, y: 106 * u, ax: 0.5, bg: p.fg, fg: p.bg, t0: 1.1, dur, label: 'Read reviews' }),
      );
    }

    // ---------------------------------------------------------------- reviews
    const reviews: [string, string, string][] = [
      [x.c.q1, x.c.n1, x.c.r1],
      [x.c.q2, x.c.n2, x.c.r2],
      [x.c.q3, x.c.n3, x.c.r3],
    ];
    const tilt = [-1.4, 1.2, -1];
    reviews.forEach(([q, n, r], j) => {
      const i = j + 1;
      const X = slideX(x, i);
      const cw = S - 16 * u;
      const ch = 88 * u;
      const id = `rv-${i}`;
      L.push(
        group(
          id,
          [
            rect(`${id}-bg`, { x: 0, y: 0, ax: 0, ay: 0, w: cw, h: ch, radius: 4 * u, fill: p.surface, stroke: alpha(p.fg, 0.07), strokeWidth: 0.2 * u, shadow: { color: shadowCol(p, 0.22), blur: 6 * u, y: 2.4 * u } }),
            path(`${id}-qm`, QUOTE_D, 24, 24, { x: cw - 12 * u, y: 12 * u, w: 14 * u, h: 14 * u, fill: alpha(p.accent, 0.16), scale: pop(0.35, 0.6) }),
            ...starRow(`${id}-st`, 7 * u + 2 * 4.6 * u * 1.22, 11 * u, 4.6 * u, 0.4, p.accent),
            x.title(`${id}-q`, q, {
              size: tsz(x, 6.9 * u),
              x: 7 * u,
              y: 19.5 * u,
              w: cw - 14 * u,
              ax: 0,
              ay: 0,
              align: 'left',
              lineHeight: 1.12,
              anim: ta.rise(0.45, { stagger: 0.03, dur: 0.7 }),
            }),
            rect(`${id}-div`, { x: 7 * u, y: 70 * u, ax: 0, w: k([0.6, 0.01], [1.4, cw - 14 * u, 'outExpo']), h: 0.2 * u, fill: alpha(p.fg, 0.1) }),
            circle(`${id}-ring`, 7.4 * u, { x: 13.5 * u, y: 79.5 * u, fill: alpha(p.accent, 0.2), scale: pop(0.8, 0.6) }),
            image(`${id}-av`, x.img[j], { x: 13.5 * u, y: 79.5 * u, w: 12.6 * u, h: 12.6 * u, radius: 6.3 * u, scale: pop(0.85, 0.6) }),
            x.body(`${id}-n`, n, { size: 4 * u, x: 23.5 * u, y: 77 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, anim: ta.slide(0.95, { stagger: 0.04 }) }),
            x.body(`${id}-r`, r, { size: 3 * u, x: 23.5 * u, y: 82.5 * u, ax: 0, align: 'left', weight: 500, fill: p.muted, anim: ta.slide(1.05, { stagger: 0.03 }) }),
          ],
          {
            x: X + S / 2,
            y: k([0.1, 71 * u], [1.0, 60 * u, 'outExpo']),
            w: cw,
            h: ch,
            rotation: k([0.1, tilt[j] * 4], [1.2, tilt[j], 'outBack']),
            opacity: fadeIn(0.1, 0.35),
          },
        ),
        chip(x, `${id}-badge`, 'Verified', {
          x: X + S - 12 * u,
          y: k([1.1, 16 * u], [1.6, 17 * u, 'outBack']),
          ax: 1,
          size: 2.5 * u,
          fill: p.accent,
          color: p.onAccent,
          icon: 'check',
          rotation: tilt[j] * 2,
          scale: k([1.1, 0.5], [1.6, 1, 'outBack']),
          opacity: fadeIn(1.1, 0.2),
        }),
      );
    });

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const cx = X + S / 2;
      const av = 15 * u;
      const step = 11 * u;
      const n = 4;
      const x0 = cx - ((n - 1) * step) / 2;
      for (let j = 0; j < 3; j++) {
        L.push(
          circle(`ct-avr-${j}`, av / 2 + 0.7 * u, { x: x0 + j * step, y: 27 * u, fill: p.bg, scale: pop(0.15 + j * 0.08, 0.6) }),
          image(`ct-av-${j}`, x.img[j], { x: x0 + j * step, y: 27 * u, w: av, h: av, radius: av / 2, scale: pop(0.15 + j * 0.08, 0.6) }),
        );
      }
      L.push(
        circle('ct-more-r', av / 2 + 0.7 * u, { x: x0 + 3 * step, y: 27 * u, fill: p.bg, scale: pop(0.4, 0.6) }),
        circle('ct-more', av / 2, { x: x0 + 3 * step, y: 27 * u, fill: p.accent, scale: pop(0.4, 0.6) }),
        x.body('ct-more-t', x.c.more, { size: 3.4 * u, x: x0 + 3 * step, y: 27 * u, weight: 700, fill: p.onAccent, lineHeight: 1, scale: pop(0.5, 0.5) }),
        ...starRow('ct-star', cx, 41 * u, 4 * u, 0.55, p.accent),
        x.title('ct-title', x.c.cta, { size: tsz(x, 8.6 * u), x: cx, y: 48 * u, w: S - 2 * m - 8 * u, ay: 0, lineHeight: 1.04, anim: ta.rise(0.5, { stagger: 0.06 }) }),
        chip(x, 'ct-btn', x.c.ctaBtn, {
          x: cx,
          y: 77 * u,
          ax: 0.5,
          size: 3.4 * u,
          fill: p.fg,
          color: p.bg,
          icon: 'sparkle',
          scale: k([1.0, 0.6], [1.6, 1, 'outBack']),
          opacity: fadeIn(1.0, 0.25),
        }),
        x.body('ct-handle', x.c.handle, { size: 3.1 * u, x: cx, y: 88 * u, weight: 600, fill: p.muted, anim: ta.chars(1.2, { stagger: 0.02 }) }),
      );
    }

    return { layers: L };
  },
};
