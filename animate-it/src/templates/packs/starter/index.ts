/**
 * Reference recipes. They show the conventions every pack follows:
 *  - size everything in `x.u` and branch layout with `x.pick` / `x.tall`
 *  - colours only from `x.p`, fonts only via `x.title` / `x.body`
 *  - stable, unique layer ids
 *  - motion that resolves to a clean, readable end frame
 */
import type { Layer } from '../../../engine/types';
import {
  type Recipe,
  k,
  rect,
  circle,
  group,
  path,
  radial,
  ta,
  tween,
  fadeIn,
  pop,
  bob,
  alpha,
  ICONS,
} from '../../kit';

// ------------------------------------------------------------------ logo: Orbit Reveal

const orbitReveal: Recipe = {
  id: 'orbit-reveal',
  name: 'Orbit Reveal',
  category: 'logo',
  tags: ['logo', 'reveal', 'ring', 'minimal', 'intro'],
  description: 'A ring draws around your mark, it springs into place and your name rises underneath.',
  duration: 4.2,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Lumora' },
    { key: 'tagline', label: 'Tagline', default: 'Design in motion' },
  ],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'sora', logo: 'orbit', format: 'square' },
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', logo: 'bolt', format: 'landscape', copy: { brand: 'Voltra', tagline: 'Power, simplified' } },
    { name: 'Noir', palette: 'noir', fonts: 'space', logo: 'prism', format: 'story', copy: { brand: 'Prisma', tagline: 'See every angle' } },
    { name: 'Paper', palette: 'paper', fonts: 'dmserif', logo: 'petal', format: 'square', copy: { brand: 'Fleur & Co', tagline: 'Botanical studio' } },
    { name: 'Royal', palette: 'royal', fonts: 'outfit', logo: 'arc', format: 'portrait', copy: { brand: 'Archway', tagline: 'Built to last' } },
  ],
  build(x) {
    const { u, cx, cy, p } = x;
    const L = x.pick({ landscape: 22 * u, story: 30 * u, default: 26 * u });
    const ly = cy - x.pick({ landscape: 9 * u, story: 10 * u, default: 8 * u });
    const ring = L * 1.75;
    const nameY = ly + L / 2 + x.pick({ landscape: 9 * u, default: 11 * u });

    const burst: Layer[] = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const r1 = ring * 0.62;
      return circle(`burst-${i}`, 0.9 * u, {
        x: tween(cx + Math.cos(a) * L * 0.5, cx + Math.cos(a) * r1, 1.05, 0.7, 'outCubic'),
        y: tween(ly + Math.sin(a) * L * 0.5, ly + Math.sin(a) * r1, 1.05, 0.7, 'outCubic'),
        scale: k([1.05, 1], [1.75, 0, 'inQuad']),
        opacity: k([1.0, 0], [1.05, 1]),
        fill: i % 2 ? p.accent : p.accent2,
        start: 1,
      });
    });

    return {
      background: radial(0.5, 0.42, 0.75, x.p.bg2, x.p.bg),
      layers: [
        circle('glow', ring * 0.9, {
          x: cx,
          y: ly,
          fill: radial(0.5, 0.5, 0.7, alpha(p.accent, 0.35), alpha(p.accent, 0)),
          scale: k([0.8, 0.4], [1.8, 1, 'outExpo']),
          opacity: fadeIn(0.8, 0.8),
        }),
        group(
          'ring-group',
          [
            {
              type: 'ellipse',
              id: 'ring',
              x: ring / 2,
              y: ring / 2,
              w: ring,
              h: ring,
              stroke: p.accent,
              strokeWidth: 0.9 * u,
              arcStart: k([0.75, 0], [1.6, 1, 'inOutCubic']),
              arcEnd: k([0.05, 0], [1.05, 1, 'inOutCubic']),
            },
            circle('ring-dot', 1.3 * u, {
              x: ring / 2,
              y: 0.45 * u,
              fill: p.accent2,
              opacity: k([0, 0], [0.1, 1], [1.4, 1], [1.6, 0]),
            }),
          ],
          {
            x: cx,
            y: ly,
            w: ring,
            h: ring,
            rotation: k([0, -60], [1.6, 120, 'inOutCubic']),
          },
        ),
        ...burst,
        x.logo('logo', {
          size: L,
          x: cx,
          y: ly,
          color: p.fg,
          scale: k([0.85, 0], [1.75, 1, 'spring']),
          rotation: k([0.85, -25], [1.75, 0, 'outBack']),
        }),
        x.title('brand', x.c.brand, {
          size: x.pick({ landscape: 8 * u, default: 9.5 * u }),
          x: cx,
          y: nameY,
          ay: 0,
          anim: ta.rise(1.45, { by: 'char', stagger: 0.035, dur: 0.75 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: 3.4 * u,
          x: cx,
          y: nameY + x.pick({ landscape: 11 * u, default: 13 * u }),
          ay: 0,
          fill: p.muted,
          tracking: 0.12,
          uppercase: true,
          anim: ta.blur(1.95, { stagger: 0.1 }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ text: Headline Rise

const headlineRise: Recipe = {
  id: 'headline-rise',
  name: 'Headline Rise',
  category: 'text',
  tags: ['text', 'headline', 'kinetic', 'announcement', 'minimal'],
  description: 'Bold headline rising line by line from behind a mask, with a sweeping accent bar.',
  duration: 5,
  fields: [
    { key: 'eyebrow', label: 'Eyebrow', default: 'New for 2027' },
    { key: 'headline', label: 'Headline', default: 'Make every frame count.', multiline: true },
    { key: 'sub', label: 'Supporting line', default: 'Templates, motion and export in one place.', multiline: true },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', format: 'portrait' },
    { name: 'Electric', palette: 'electric', fonts: 'unbounded', format: 'square', copy: { headline: 'Big ideas move fast.' } },
    { name: 'Paper', palette: 'paper', fonts: 'serif', format: 'portrait', copy: { eyebrow: 'Issue 07', headline: 'Slow is smooth, smooth is fast.', sub: 'Notes on craft, motion and patience.' } },
    { name: 'Noir', palette: 'noir', fonts: 'archivo', format: 'story', copy: { headline: 'Ship it before Friday.' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'fraunces', format: 'landscape', copy: { eyebrow: 'Keynote', headline: 'The future is animated.' } },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const m = x.pick({ landscape: 9 * u, default: 8 * u });
    const size = x.pick({ landscape: 11 * u, story: 15.5 * u, square: 12 * u, default: 14 * u });
    const baseY = x.pick({ landscape: H * 0.62, story: H * 0.58, default: H * 0.6 });
    const textW = W - m * 2;
    return {
      layers: [
        circle('orb', x.pick({ landscape: 40 * u, default: 46 * u }), {
          x: W - m * 0.5,
          y: m * 1.5,
          fill: radial(0.35, 0.35, 0.8, alpha(p.accent2, 0.9), alpha(p.accent, 0.0)),
          scale: k([0, 0.6], [1.4, 1, 'outExpo']),
          opacity: 0.9,
        }),
        rect('eyebrow-pill', {
          x: m,
          y: m + 2.6 * u,
          ax: 0,
          w: tween(0, Math.max(26 * u, x.c.eyebrow.length * 2.05 * u + 7 * u), 0.15, 0.6, 'outExpo'),
          h: 5.6 * u,
          radius: 2.8 * u,
          fill: alpha(p.accent, 0.12),
        }),
        x.body('eyebrow', x.c.eyebrow, {
          size: 2.8 * u,
          x: m + 3.5 * u,
          y: m + 2.6 * u,
          ax: 0,
          align: 'left',
          weight: 700,
          fill: p.accent,
          uppercase: true,
          tracking: 0.12,
          anim: ta.type(0.45, { stagger: 0.035 }),
        }),
        x.title('headline', x.c.headline, {
          size,
          x: m,
          y: baseY,
          w: textW,
          ax: 0,
          ay: 1,
          align: 'left',
          lineHeight: 1.0,
          anim: ta.riseLines(0.5, { stagger: 0.14, dur: 1.0 }),
        }),
        rect('bar', {
          x: m,
          y: baseY + 4 * u,
          ax: 0,
          w: tween(0, 22 * u, 1.3, 0.9, 'outExpo'),
          h: 1.1 * u,
          radius: 0.55 * u,
          fill: p.accent,
        }),
        x.body('sub', x.c.sub, {
          size: x.pick({ landscape: 3.4 * u, story: 4.6 * u, default: 4 * u }),
          x: m,
          y: baseY + 9 * u,
          w: Math.min(textW, x.pick({ landscape: 70 * u, default: 80 * u })),
          ax: 0,
          ay: 0,
          align: 'left',
          fill: p.muted,
          anim: ta.blur(1.6, { stagger: 0.05 }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ carousel: Flow Story

const flowStory: Recipe = {
  id: 'flow-story',
  name: 'Flow Story',
  category: 'carousel',
  tags: ['carousel', 'instagram', 'linkedin', 'educational', 'tips', 'seamless'],
  description: 'Five-slide carousel joined by one continuous line that draws itself across every slide.',
  duration: 5,
  slides: 5,
  fields: [
    { key: 'kicker', label: 'Cover kicker', default: '3 rules for' },
    { key: 'title', label: 'Cover title', default: 'Motion that sells', multiline: true },
    { key: 's1h', label: 'Slide 2 heading', default: 'Lead with movement' },
    { key: 's1b', label: 'Slide 2 body', default: 'The first 0.5s decide the scroll. Open on motion, not on a logo.', multiline: true },
    { key: 's2h', label: 'Slide 3 heading', default: 'One idea per slide' },
    { key: 's2b', label: 'Slide 3 body', default: 'Give each slide a single job. Short lines, big type, clear contrast.', multiline: true },
    { key: 's3h', label: 'Slide 4 heading', default: 'Ease, don’t snap' },
    { key: 's3b', label: 'Slide 4 body', default: 'Soft easing reads as premium. Linear motion reads as cheap.', multiline: true },
    { key: 'cta', label: 'Final slide CTA', default: 'Save this for your next post' },
    { key: 'handle', label: 'Handle', default: '@animateit' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk' },
    { name: 'Midnight', palette: 'midnight', fonts: 'sora', copy: { kicker: '3 habits of', title: 'Teams that ship' } },
    { name: 'Paper', palette: 'paper', fonts: 'dmserif', copy: { kicker: 'A guide to', title: 'Better carousels' } },
    { name: 'Citrus', palette: 'citrus', fonts: 'archivo', copy: { kicker: 'Stop doing', title: 'Boring slides' } },
  ],
  build(x) {
    const { u, W, H, p, slideW: S, slides } = x;
    const m = 8 * u;
    // One continuous wave across the whole panorama.
    let d = `M0 ${H * 0.8}`;
    for (let i = 0; i < slides; i++) {
      const x0 = i * S;
      const up = i % 2 === 0;
      d += ` C${x0 + S * 0.35} ${H * (up ? 0.98 : 0.62)} ${x0 + S * 0.65} ${H * (up ? 0.62 : 0.98)} ${x0 + S} ${H * 0.8}`;
    }
    const layers: Layer[] = [
      path('flow', d, W, H, {
        x: 0,
        y: 0,
        w: W,
        h: H,
        ax: 0,
        ay: 0,
        stroke: p.accent,
        strokeWidth: 1.4 * u,
        trimEnd: k([0.1, 0], [3.2, 1, 'inOutCubic']),
      }),
    ];

    // Slide indicator dots on every slide.
    for (let s = 0; s < slides; s++) {
      for (let i = 0; i < slides; i++) {
        layers.push(
          rect(`dot-${s}-${i}`, {
            x: s * S + S / 2 + (i - (slides - 1) / 2) * 3.4 * u,
            y: H - 5 * u,
            w: i === s ? 4.2 * u : 1.4 * u,
            h: 1.4 * u,
            radius: 0.7 * u,
            fill: i === s ? p.accent : alpha(p.fg, 0.2),
            opacity: fadeIn(0.3 + i * 0.05, 0.4),
          }),
        );
      }
    }

    // Cover
    layers.push(
      x.body('kicker', x.c.kicker, {
        size: 4.4 * u,
        x: m,
        y: H * 0.3,
        ax: 0,
        align: 'left',
        weight: 600,
        fill: p.accent,
        anim: ta.slide(0.2),
      }),
      x.title('title', x.c.title, {
        size: 15 * u,
        x: m,
        y: H * 0.34,
        w: S - m * 2,
        ax: 0,
        ay: 0,
        align: 'left',
        lineHeight: 0.98,
        anim: ta.riseLines(0.35, { stagger: 0.12 }),
      }),
      group(
        'swipe',
        [
          rect('swipe-bg', { x: 13 * u, y: 3.6 * u, w: 26 * u, h: 7.2 * u, radius: 3.6 * u, fill: p.fg }),
          x.body('swipe-label', 'Swipe', { size: 3.2 * u, x: 10 * u, y: 3.6 * u, weight: 700, fill: p.bg }),
          path('swipe-arrow', ICONS.arrowRight, 24, 24, {
            x: bob(20 * u, 1.2 * u, 5, 4),
            y: 3.6 * u,
            w: 4 * u,
            h: 4 * u,
            stroke: p.bg,
            strokeWidth: 2.4,
          }),
        ],
        { x: S - m, y: H - 16 * u, w: 26 * u, h: 7.2 * u, ax: 1, ay: 0.5, scale: pop(0.9, 0.6), opacity: fadeIn(0.9, 0.2) },
      ),
    );

    // Content slides
    const contents: [string, string][] = [
      [x.c.s1h, x.c.s1b],
      [x.c.s2h, x.c.s2b],
      [x.c.s3h, x.c.s3b],
    ];
    contents.forEach(([h, b], i) => {
      const ox = (i + 1) * S;
      layers.push(
        x.title(`num-${i}`, String(i + 1).padStart(2, '0'), {
          size: 30 * u,
          x: ox + m,
          y: H * 0.3,
          ax: 0,
          align: 'left',
          fill: 'transparent',
          stroke: p.accent,
          strokeWidth: 0.35 * u,
          anim: ta.rise(0.2, { by: 'char', stagger: 0.08 }),
        }),
        x.title(`h-${i}`, h, {
          size: 8.4 * u,
          x: ox + m,
          y: H * 0.47,
          w: S - m * 2,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.04,
          anim: ta.rise(0.45),
        }),
        x.body(`b-${i}`, b, {
          size: 4.1 * u,
          x: ox + m,
          y: H * 0.47 + 22 * u,
          w: S - m * 2,
          ax: 0,
          ay: 0,
          align: 'left',
          fill: p.muted,
          anim: ta.blur(0.9, { stagger: 0.03 }),
        }),
      );
    });

    // Final slide CTA
    const fx = (slides - 1) * S;
    layers.push(
      circle('cta-ring', 16 * u, {
        x: fx + S / 2,
        y: H * 0.3,
        fill: p.accent,
        scale: pop(0.2, 0.8, 'spring'),
      }),
      path('cta-icon', ICONS.bookmark, 24, 24, {
        x: fx + S / 2,
        y: H * 0.3,
        w: 13 * u,
        h: 13 * u,
        stroke: p.onAccent,
        strokeWidth: 1.8,
        trimEnd: k([0.6, 0], [1.4, 1, 'inOutCubic']),
      }),
      x.title('cta', x.c.cta, {
        size: 8 * u,
        x: fx + S / 2,
        y: H * 0.5,
        w: S - m * 2,
        ay: 0,
        lineHeight: 1.04,
        anim: ta.rise(0.7),
      }),
      x.body('handle', x.c.handle, {
        size: 4 * u,
        x: fx + S / 2,
        y: H * 0.74,
        weight: 700,
        fill: p.accent,
        scale: bob(1, 0.03, 5, 3),
        anim: ta.chars(1.2),
      }),
    );

    return { layers };
  },
};

export const recipes: Recipe[] = [orbitReveal, headlineRise, flowStory];
