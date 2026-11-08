import type { Layer } from '../../../engine/types';
import { type Recipe, k, rect, group, ta, fadeIn } from '../../kit';
import { fit, stack, titleH, bodyH } from './util';

export const mosaicReveal: Recipe = {
  id: 'mosaic-reveal',
  name: 'Mosaic Reveal',
  category: 'logo',
  tags: ['logo', 'tiles', 'grid', 'mosaic', 'wave', 'colourful', 'new'],
  description: 'A colourful grid of tiles cascades in, then flips away in a ripple from the centre to unveil your lockup inside a mosaic frame.',
  duration: 4.4,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Blockhaus' },
    { key: 'tagline', label: 'Tagline', default: 'Modular living' },
  ],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'grotesk', logo: 'stack', format: 'story' },
    { name: 'Paper', palette: 'paper', fonts: 'archivo', logo: 'arc', format: 'square', copy: { brand: 'Tessera', tagline: 'Tile & stone studio' } },
    { name: 'Cyber', palette: 'cyber', fonts: 'syne', logo: 'prism', format: 'landscape', copy: { brand: 'Pixelforge', tagline: 'Games, handcrafted' } },
    { name: 'Sunset', palette: 'sunset', fonts: 'outfit', logo: 'orbit', format: 'portrait', copy: { brand: 'Solstice Fest', tagline: 'Three days of summer' } },
    { name: 'Forest', palette: 'forest', fonts: 'manrope', logo: 'petal', format: 'story', copy: { brand: 'Gridleaf', tagline: 'Urban gardens' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const r = x.rand;

    // ---- grid: odd counts so the frame ring is symmetric
    const P = x.isLandscape ? H / 7 : W / 7;
    let cols = Math.ceil(W / P - 0.05);
    let rows = Math.ceil(H / P - 0.05);
    if (cols % 2 === 0) cols++;
    if (rows % 2 === 0) rows++;
    const ox = (W - cols * P) / 2;
    const oy = (H - rows * P) / 2;
    const gap = P * 0.085;
    const T = P - gap;
    const cc = (cols - 1) / 2;
    const rc = (rows - 1) / 2;

    // ---- lockup inside the frame
    const innerW = (cols - 2) * P;
    const innerH = (rows - 2) * P;
    const L = Math.min(innerH * 0.36, x.pick({ landscape: 26 * u, story: 36 * u, portrait: 30 * u, default: 26 * u }));
    const maxW = Math.min(innerW - 10 * u, 120 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 10 * u, story: 12.5 * u, portrait: 11 * u, default: 10 * u }), maxW);
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 4.4 * u, default: 3.8 * u }), maxW, { body: true });
    const [my, ny, ty] = stack(cy, [L, titleH(x, nameSize), bodyH(tagSize)], [x.pick({ story: 9 * u, default: 7 * u }), x.pick({ story: 4.2 * u, default: 3.4 * u })]);

    const tones = [p.bg2, p.surface, p.accent, p.accent2];
    const weights = [0.34, 0.3, 0.22, 0.14];
    const pickTone = () => {
      let v = r();
      for (let i = 0; i < tones.length; i++) {
        if ((v -= weights[i]) <= 0) return tones[i];
      }
      return tones[0];
    };

    const IN = 0.05;
    const OUT = 1.45;
    const tiles: Layer[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const border = row === 0 || col === 0 || row === rows - 1 || col === cols - 1;
        const d1 = IN + (col + row) * 0.032 + r() * 0.03;
        const dist = Math.hypot((col - cc) / Math.max(1, cc), (row - rc) / Math.max(1, rc));
        const d2 = OUT + dist * 0.5 + r() * 0.04;
        const round = r() < 0.28;
        const fill = pickTone();
        tiles.push(
          rect(`mr-t-${row}-${col}`, {
            x: ox + col * P + P / 2,
            y: oy + row * P + P / 2,
            w: T,
            h: T,
            radius: round ? T / 2 : T * 0.2,
            fill,
            scale: border
              ? k([d1, 0], [d1 + 0.55, 1, 'outBack'], [d2, 1], [d2 + 0.2, 0.8, 'outQuad'], [d2 + 0.75, 0.9, 'outBack'])
              : k([d1, 0], [d1 + 0.55, 1, 'outBack']),
            sx: border ? 1 : k([d2, 1], [d2 + 0.32, 0, 'inBack']),
            rotation: border ? k([d2, 0], [d2 + 0.75, round ? 0 : 90, [0.6, 0, 0.2, 1]]) : 0,
            ...(border ? {} : { end: d2 + 0.33 }),
          }),
        );
      }
    }

    const lockup = group(
      'mr-lockup',
      [
        x.logo('mr-logo', { size: L, x: cx, y: my, color: p.fg }),
        x.title('mr-name', x.c.brand, { size: nameSize, x: cx, y: ny, anim: ta.rise(OUT + 0.45, { by: 'char', stagger: 0.03, dur: 0.75 }) }),
        x.body('mr-tag', x.c.tagline, { size: tagSize, x: cx, y: ty, fill: p.muted, anim: ta.blur(OUT + 0.85, { stagger: 0.07 }) }),
      ],
      {
        x: cx,
        y: cy,
        w: W,
        h: H,
        scale: k([OUT, 1.12], [OUT + 1.2, 1, [0.2, 0.8, 0.2, 1]]),
        opacity: fadeIn(OUT, 0.3),
      },
    );

    return { background: p.bg, layers: [lockup, ...tiles] };
  },
};
