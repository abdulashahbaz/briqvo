import type { Layer } from '../../../engine/types';
import { type Recipe, rect, circle, group, image, path, k, tween, fadeIn, ta } from '../../kit';
import { chip, chipW, fadeUp, icon, pad2, seamLine, shadowCol, slideX, swipeCue, bandD } from './shared';

/** Seamless panorama: one wide image across every slide, revealed slide by slide through expanding windows. */
export const horizonPanorama: Recipe = {
  id: 'carousel-horizon-panorama',
  name: 'Horizon Panorama',
  category: 'carousel',
  tags: ['carousel', 'panorama', 'seamless', 'product', 'brand', 'showcase', 'image', 'new'],
  description: 'One wide photo runs across all five slides with a wavy horizon, feature hotspots and a shop-now finale.',
  duration: 5.5,
  slides: 5,
  images: [{ key: 'pano', label: 'Panorama image (very wide)', art: 'landscape' }],
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Aster Outdoor' },
    { key: 'handle', label: 'Handle', default: '@asteroutdoor' },
    { key: 'kicker', label: 'Cover kicker', default: 'The Ridge collection' },
    { key: 'title', label: 'Cover title', default: 'Made for the long way round', multiline: true },
    { key: 'f1h', label: 'Feature 1 heading', default: 'Storm-proof shell' },
    { key: 'f1b', label: 'Feature 1 body', default: 'Three-layer fabric that shrugs off sideways rain and still breathes.', multiline: true },
    { key: 'f2h', label: 'Feature 2 heading', default: 'Packs to a fist' },
    { key: 'f2b', label: 'Feature 2 body', default: 'Rolls into its own pocket, 340 g, ready for every summit push.', multiline: true },
    { key: 'f3h', label: 'Feature 3 heading', default: 'Repair for life' },
    { key: 'f3b', label: 'Feature 3 body', default: 'Rips, zips or worn seams: send it back and we fix it for free.', multiline: true },
    { key: 'cta', label: 'Final slide title', default: 'Explore the full collection', multiline: true },
    { key: 'button', label: 'Button label', default: 'Shop now' },
  ],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'sora' },
    {
      name: 'Paper Linen',
      palette: 'paper',
      fonts: 'dmserif',
      copy: {
        brand: 'Atelier Linen',
        handle: '@atelierlinen',
        kicker: 'Slow mornings edit',
        title: 'Rooms that breathe with the light',
        f1h: 'Stonewashed linen',
        f1b: 'Softer with every wash and woven in a family mill since 1931.',
        f2h: 'Colours from earth',
        f2b: 'Clay, oat and moss tones dyed with low-impact pigments.',
        f3h: 'Made to be lived in',
        f3b: 'Relaxed creases are the point. No ironing, ever.',
        cta: 'Bring the slow mornings home',
        button: 'Shop the edit',
      },
    },
    {
      name: 'Ocean Surf',
      palette: 'ocean',
      fonts: 'outfit',
      copy: {
        brand: 'Tidewater Surf Co.',
        handle: '@tidewater.surf',
        kicker: 'Cold water series',
        title: 'Built for the first wave at 6 am',
        f1h: '5 mm, zero flush',
        f1b: 'Sealed seams and a glide-skin chest keep the Atlantic out.',
        f2h: 'Moves like skin',
        f2b: 'Stretch panels in the shoulders mean longer sessions, less fatigue.',
        f3h: 'Recycled rubber',
        f3b: 'Made from old suits and tyres, not fresh petroleum.',
        cta: 'Find your size before winter',
        button: 'Shop wetsuits',
      },
    },
    {
      name: 'Sunset Cycles',
      palette: 'sunset',
      fonts: 'anton',
      copy: {
        brand: 'Dune Cycles',
        handle: '@dunecycles',
        kicker: 'Golden hour drop',
        title: 'Ride further than the road goes',
        f1h: 'Wide gravel tyres',
        f1b: 'Grip on sand, dust and washboard without losing speed.',
        f2h: 'Frame bags included',
        f2b: 'Room for two days of kit, mounted without a single tool.',
        f3h: 'Dynamo lights',
        f3b: 'Pedal power keeps you lit long after the sun goes down.',
        cta: 'Book a test ride this weekend',
        button: 'Book a ride',
      },
    },
  ],
  build(x) {
    const { u, W, H, p, slideW: S, slides: N } = x;
    const dur = 5.5;
    const m = 9 * u;
    const bandH = 70 * u;
    const edge = (gx: number) => bandH - 6 * u + 2.6 * u * Math.sin((gx / S) * Math.PI * 0.9 + 0.4) + 1.1 * u * Math.sin((gx / S) * Math.PI * 2.6 + 1.3);
    const L: Layer[] = [];

    // Panorama image, one copy per slide so each slide opens through its own window.
    for (let i = 0; i < N; i++) {
      const X = slideX(x, i);
      const t = 0.05 + i * 0.03;
      L.push(
        group(
          `pn-win-${i}`,
          [
            image(`pn-img-${i}`, x.img[0], {
              x: W / 2 - X,
              y: bandH / 2,
              w: W,
              h: bandH,
              scale: k([0, 1.12], [dur, 1, 'outCubic']),
            }),
          ],
          {
            x: X,
            y: 0,
            w: S,
            h: bandH,
            ax: 0,
            ay: 0,
            clip: true,
            mask: {
              shape: 'rect',
              x: k([t, S * 0.32], [t + 1.1, 0, 'inOutQuart']),
              y: k([t, bandH * 0.36], [t + 1.1, 0, 'inOutQuart']),
              w: k([t, S * 0.36], [t + 1.1, S, 'inOutQuart']),
              h: k([t, bandH * 0.28], [t + 1.1, bandH, 'inOutQuart']),
              r: k([t, 8 * u], [t + 1.1, 0, 'inOutQuart']),
            },
          },
        ),
      );
    }
    // Wavy horizon edge: content panel shape spanning every slide.
    L.push(path('pn-edge', bandD(edge, () => H + 2, 0, W, 24), W, H, { x: 0, y: 0, w: W, h: H, ax: 0, ay: 0, fill: p.bg }));
    L.push(...seamLine(x, 'pn-horizon', edge, { stroke: p.accent, width: 0.55 * u, t0: 0.6, dur: 1.2, stagger: 0.02 }));

    // ---------------------------------------------------------------- cover
    {
      const X = 0;
      const bw = Math.max(30 * u, x.c.brand.length * 1.75 * u + 13 * u);
      L.push(
        group(
          'cv-brand',
          [
            rect('cv-brand-bg', { x: 0, y: 0, ax: 0, ay: 0, w: bw, h: 8 * u, radius: 4 * u, fill: p.bg, shadow: { color: shadowCol(p), blur: 3 * u, y: 1 * u } }),
            x.logo('cv-brand-logo', { size: 4.2 * u, x: 4.6 * u, y: 4 * u, color: p.accent }),
            x.body('cv-brand-t', x.c.brand, { size: 3 * u, x: 8.4 * u, y: 4 * u, ax: 0, align: 'left', weight: 700, fill: p.fg, lineHeight: 1 }),
          ],
          { x: X + m, y: 11 * u, w: bw, h: 8 * u, ax: 0, ay: 0.5, opacity: fadeIn(0.6, 0.4), scale: k([0.6, 0.85], [1.2, 1, 'outBack']) },
        ),
        swipeCue(x, 'cv-swipe', { x: X + S - m, y: 11 * u, bg: p.bg, fg: p.fg, t0: 1.2, dur }),
        x.body('cv-kicker', x.c.kicker, {
          size: 3 * u,
          x: X + m,
          y: 76 * u,
          ax: 0,
          align: 'left',
          weight: 700,
          fill: p.accent,
          uppercase: true,
          tracking: 0.14,
          anim: ta.slide(0.55, { stagger: 0.05 }),
        }),
        x.title('cv-title', x.c.title, {
          size: 10.4 * u,
          x: X + m,
          y: 80.5 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.0,
          anim: ta.riseLines(0.7, { stagger: 0.12 }),
        }),
      );
    }

    // ---------------------------------------------------------------- features with hotspots
    const feats: [string, string][] = [
      [x.c.f1h, x.c.f1b],
      [x.c.f2h, x.c.f2b],
      [x.c.f3h, x.c.f3b],
    ];
    const spots: [number, number][] = [
      [0.36, 30],
      [0.62, 40],
      [0.42, 26],
    ];
    feats.forEach(([h, b], n) => {
      const i = n + 1;
      const X = slideX(x, i);
      const [fx, fy] = spots[n];
      const hx = X + S * fx;
      const hy = fy * u;
      const tEdge = edge(hx);
      L.push(
        chip(x, `ft-count-${i}`, `${pad2(i + 1)} / ${pad2(N)}`, {
          x: X + S - m,
          y: 11 * u,
          ax: 1,
          size: 2.6 * u,
          fill: p.bg,
          color: p.fg,
          tracking: 0.06,
          opacity: fadeIn(0.8, 0.4),
        }),
        // leader line from hotspot down to the horizon
        rect(`ft-lead-${i}`, {
          x: hx,
          y: hy,
          ax: 0.5,
          ay: 0,
          w: 0.35 * u,
          h: tween(0, tEdge - hy, 1.1, 0.7, 'outCubic'),
          fill: p.bg,
          opacity: 0.85,
        }),
        circle(`ft-ring-${i}`, 3.6 * u, {
          x: hx,
          y: hy,
          stroke: p.bg,
          strokeWidth: 0.45 * u,
          scale: k([1.2, 0.6], [2.2, 2.1, 'outCubic'], [2.21, 0.6], [3.4, 2.1, 'outCubic'], [3.41, 0.6], [4.6, 2.1, 'outCubic']),
          opacity: k([1.2, 0], [1.3, 0.9], [2.2, 0], [2.21, 0.9], [3.4, 0], [3.41, 0.9], [4.6, 0]),
        }),
        circle(`ft-dot-${i}`, 2.6 * u, {
          x: hx,
          y: hy,
          fill: p.accent,
          stroke: p.bg,
          strokeWidth: 0.7 * u,
          scale: k([0.9, 0], [1.5, 1, 'outBack']),
        }),
        circle(`ft-foot-${i}`, 1.1 * u, { x: hx, y: tEdge, fill: p.accent, scale: k([1.6, 0], [2.0, 1, 'outBack']) }),
        x.body(`ft-idx-${i}`, `Feature ${pad2(i)}`, {
          size: 2.8 * u,
          x: X + m,
          y: 77 * u,
          ax: 0,
          align: 'left',
          weight: 700,
          fill: p.accent,
          uppercase: true,
          tracking: 0.12,
          anim: ta.slide(0.6, { stagger: 0.04 }),
        }),
        x.title(`ft-h-${i}`, h, {
          size: 7.8 * u,
          x: X + m,
          y: 97 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 1,
          align: 'left',
          lineHeight: 1.04,
          anim: ta.rise(0.7, { stagger: 0.06 }),
        }),
        x.body(`ft-b-${i}`, b, {
          size: 3.9 * u,
          x: X + m,
          y: 101 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 0,
          align: 'left',
          lineHeight: 1.4,
          fill: p.muted,
          anim: fadeUp(1.0),
        }),
      );
    });

    // ---------------------------------------------------------------- CTA
    {
      const i = N - 1;
      const X = slideX(x, i);
      const bw = chipW(x.c.button, 3.5 * u, { padX: 1.6 });
      L.push(
        chip(x, `ct-count`, `${pad2(N)} / ${pad2(N)}`, {
          x: X + S - m,
          y: 11 * u,
          ax: 1,
          size: 2.6 * u,
          fill: p.bg,
          color: p.fg,
          tracking: 0.06,
          opacity: fadeIn(0.8, 0.4),
        }),
        x.title('ct-title', x.c.cta, {
          size: 8.6 * u,
          x: X + m,
          y: 95 * u,
          w: S - 2 * m,
          ax: 0,
          ay: 1,
          align: 'left',
          lineHeight: 1.02,
          anim: ta.riseLines(0.6, { stagger: 0.12 }),
        }),
        group(
          'ct-btn',
          [
            chip(x, 'ct-btn-c', x.c.button, { x: 0, y: 4.2 * u, size: 3.5 * u, fill: p.accent, color: p.onAccent, padX: 1.6 }),
          ],
          { x: X + m, y: 106 * u, w: bw, h: 8.4 * u, ax: 0, ay: 0.5, scale: k([1.0, 0.7], [1.6, 1, 'outBack']), opacity: fadeIn(1.0, 0.3) },
        ),
        icon('ct-arrow', 'arrowRight', {
          x: k([1.2, X + m + bw + 1 * u], [1.8, X + m + bw + 5 * u, 'outExpo']),
          y: 106 * u,
          size: 5 * u,
          color: p.accent,
          sw: 2.2,
          opacity: fadeIn(1.2, 0.4),
        }),
        x.body('ct-handle', x.c.handle, {
          size: 3.2 * u,
          x: X + S - m,
          y: 106 * u,
          ax: 1,
          align: 'right',
          weight: 600,
          fill: p.muted,
          anim: ta.chars(1.3, { stagger: 0.02 }),
        }),
      );
    }

    return { layers: L, background: p.bg };
  },
};

