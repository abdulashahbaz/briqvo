import { type Recipe, k, rect, group, path, linear, radial, ta, fadeIn, alpha, shade, ICONS } from '../../kit';
import { estW, fit, stack, titleH, bodyH, isDark } from './util';

export const glossSweep: Recipe = {
  id: 'gloss-sweep',
  name: 'Gloss Sweep',
  category: 'logo',
  tags: ['logo', 'shine', 'app icon', 'gloss', 'premium', 'product'],
  description: 'An app-icon tile rises and settles with your mark, then a glossy light streak sweeps across the whole lockup.',
  duration: 3.8,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Waveform' },
    { key: 'tagline', label: 'Tagline', default: 'Your music, mastered' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'poppins', logo: 'wave', format: 'story' },
    { name: 'Royal', palette: 'royal', fonts: 'outfit', logo: 'prism', format: 'square', copy: { brand: 'Lumina Pay', tagline: 'Pay in a tap' } },
    { name: 'Mint', palette: 'mint', fonts: 'sora', logo: 'petal', format: 'landscape', copy: { brand: 'Sproutly', tagline: 'Habits that grow' } },
    { name: 'Peach', palette: 'peach', fonts: 'grotesk', logo: 'orbit', format: 'portrait', copy: { brand: 'Halo Fit', tagline: 'Train smarter, not longer' } },
    { name: 'Graphite', palette: 'graphite', fonts: 'manrope', logo: 'stack', format: 'story', copy: { brand: 'Stacknote', tagline: 'Notes for focused minds' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const dark = isDark(x);
    const T = x.pick({ landscape: 32 * u, story: 46 * u, portrait: 38 * u, default: 36 * u });
    const L = T * 0.56;
    const maxW = Math.min(W - 16 * u, 130 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 10 * u, story: 13.5 * u, portrait: 12 * u, default: 11 * u }), maxW);
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 4.6 * u, default: 3.9 * u }), maxW, { body: true });
    const nH = titleH(x, nameSize);
    const tH = bodyH(tagSize);
    const [ty0, ny, tgy] = stack(cy, [T, nH, tH], [x.pick({ story: 10 * u, default: 7.5 * u }), x.pick({ story: 4.4 * u, default: 3.5 * u })]);
    const rad = T * 0.24;

    const tileFill = linear(115, shade(p.accent, 0.18), p.accent, shade(p.accent, -0.22));
    const tileY = k([0.1, ty0 + 10 * u], [1.0, ty0, [0.2, 0.9, 0.25, 1]]);
    const tileS = k([0.1, 0.72], [1.0, 1, [0.2, 0.9, 0.25, 1]]);
    const tileO = fadeIn(0.1, 0.35);

    // Streak timing and bounds.
    const S0 = 1.75;
    const S1 = 2.8;
    const halfW = Math.max(T, estW(x, x.c.brand, nameSize), estW(x, x.c.tagline, tagSize, { body: true })) / 2;
    const span = tgy + tH / 2 - (ty0 - T / 2);
    const streakH = span * 1.5 + 20 * u;
    const midY = (ty0 - T / 2 + tgy + tH / 2) / 2;
    const glint = shade(p.accent2, 0.85);
    const streak = (id: string, w: number, a: number, lag: number) =>
      rect(id, {
        x: k([S0 + lag, cx - halfW - 26 * u], [S1 + lag, cx + halfW + 26 * u, 'inOutCubic']),
        y: midY,
        w,
        h: streakH,
        rotation: 22,
        fill: linear(0, alpha(glint, 0), alpha(glint, a), alpha(glint, 0)),
        blend: 'source-atop',
        start: S0 + lag,
        end: S1 + lag + 0.01,
      });

    const sparkleS = 9 * u;
    return {
      background: radial(0.5, ty0 / H, 0.95, dark ? p.bg2 : shade(p.bg2, 0.35), p.bg),
      layers: [
        // Soft cast shadow, drawn outside the isolated group so the streak never paints over it.
        rect('gs-shadow', {
          x: cx,
          y: tileY,
          w: T,
          h: T,
          radius: rad,
          fill: p.accent,
          scale: tileS,
          opacity: tileO,
          shadow: { color: alpha(shade(p.accent, -0.6), dark ? 0.55 : 0.35), blur: 6 * u, y: 3 * u },
        }),
        group(
          'gs-lockup',
          [
            rect('gs-tile', { x: cx, y: tileY, w: T, h: T, radius: rad, fill: tileFill, scale: tileS, opacity: tileO }),
            group(
              'gs-tile-hi',
              [
                rect('gs-hi', {
                  x: T / 2,
                  y: T * 0.25,
                  w: T,
                  h: T * 0.5,
                  fill: linear(90, alpha(shade(p.accent, 1), 0.22), alpha(shade(p.accent, 1), 0)),
                }),
              ],
              { x: cx, y: tileY, w: T, h: T, scale: tileS, opacity: tileO, clip: true, clipRadius: rad },
            ),
            x.logo('gs-logo', {
              size: L,
              x: cx,
              y: tileY,
              color: p.onAccent,
              scale: k([0.45, 0.4], [1.3, 1, 'spring']),
              opacity: fadeIn(0.45, 0.25),
            }),
            x.title('gs-name', x.c.brand, {
              size: nameSize,
              x: cx,
              y: ny,
              anim: ta.rise(0.85, { by: 'char', stagger: 0.03, dur: 0.75 }),
            }),
            x.body('gs-tag', x.c.tagline, {
              size: tagSize,
              x: cx,
              y: tgy,
              fill: p.muted,
              anim: ta.rise(1.2, { stagger: 0.05, from: { y: 1.6 } }),
            }),
            streak('gs-streak', 15 * u, 0.6, 0),
            streak('gs-streak-thin', 3.4 * u, 0.9, 0.1),
          ],
          { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, isolate: true },
        ),
        path('gs-sparkle', ICONS.sparkle, 24, 24, {
          x: cx + T / 2 - T * 0.06,
          y: ty0 - T / 2 + T * 0.06,
          w: sparkleS,
          h: sparkleS,
          fill: dark ? p.fg : shade(p.accent2, 0.1),
          scale: k([S1 - 0.15, 0], [S1 + 0.35, 1, 'outBack']),
          rotation: k([S1 - 0.15, -60], [3.8, 25, 'outCubic']),
        }),
      ],
    };
  },
};
