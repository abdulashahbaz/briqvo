import { type Recipe, k, rect, ellipse, group, circle, radial, ta, fadeIn, alpha, shade } from '../../kit';
import { fit, stack, titleH, bodyH } from './util';

const IRIS: [number, number, number, number] = [0.75, 0, 0.18, 1];

export const irisBloom: Recipe = {
  id: 'iris-bloom',
  name: 'Iris Bloom',
  category: 'logo',
  tags: ['logo', 'iris', 'circle', 'mask', 'reveal', 'bold', 'colour'],
  description: 'A single dot charges up, then a circular iris blooms open to reveal your mark on a full-colour stage with sonar rings.',
  duration: 4,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Petalcraft' },
    { key: 'tagline', label: 'Tagline', default: 'Flowers, delivered daily' },
  ],
  variants: [
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', logo: 'petal', format: 'story' },
    { name: 'Noir', palette: 'noir', fonts: 'space', logo: 'knot', format: 'square', copy: { brand: 'Knotwork', tagline: 'Independent creative agency' } },
    { name: 'Sunset', palette: 'sunset', fonts: 'poppins', logo: 'orbit', format: 'landscape', copy: { brand: 'Solenne', tagline: 'Golden hour skincare' } },
    { name: 'Royal', palette: 'royal', fonts: 'editorial', logo: 'arc', format: 'portrait', copy: { brand: 'Regalia', tagline: 'Private banking' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'syne', logo: 'prism', format: 'story', copy: { brand: 'Facet', tagline: 'Ideas, refracted' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const L = x.pick({ landscape: 26 * u, story: 40 * u, portrait: 32 * u, default: 30 * u });
    const maxW = Math.min(W - 14 * u, 130 * u);
    const nameSize = fit(x, x.c.brand, x.pick({ landscape: 10 * u, story: 14 * u, portrait: 12 * u, default: 11 * u }), maxW);
    const tagSize = fit(x, x.c.tagline, x.pick({ story: 4.8 * u, default: 4 * u }), maxW, { body: true });
    const [my, ny, ty] = stack(cy, [L, titleH(x, nameSize), bodyH(tagSize)], [x.pick({ story: 10 * u, default: 8 * u }), x.pick({ story: 4.5 * u, default: 3.6 * u })]);
    const R = Math.hypot(Math.max(cx, W - cx), Math.max(my, H - my)) + 4 * u;

    // Sonar rings that stay on the coloured stage as texture.
    const ringR = [0.78, 1.25, 1.85, 2.6, 3.5, 4.6];
    const rings = ringR.map((m, i) =>
      ellipse(`ib-ring-${i}`, {
        x: cx,
        y: my,
        w: L * m * 2,
        h: L * m * 2,
        stroke: alpha(p.onAccent, Math.max(0.05, 0.2 - i * 0.03)),
        strokeWidth: 0.25 * u,
        scale: k([0.75 + i * 0.07, 0.55], [1.8 + i * 0.07, 1, 'outExpo']),
        opacity: fadeIn(0.75 + i * 0.07, 0.4),
      }),
    );

    const stage = group(
      'ib-stage',
      [
        rect('ib-fill', { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, fill: radial(cx / W, my / H, 0.95, shade(p.accent, 0.1), shade(p.accent, -0.12)) }),
        circle('ib-halo', L * 1.1, { x: cx, y: my, fill: radial(0.5, 0.5, 0.7, alpha(p.onAccent, 0.16), alpha(p.onAccent, 0)), scale: k([0.8, 0.3], [2.0, 1, 'outExpo']) }),
        ...rings,
        x.logo('ib-logo', {
          size: L,
          x: cx,
          y: my,
          color: p.onAccent,
          scale: k([0.78, 0.25], [1.65, 1, 'spring']),
          rotation: k([0.78, -30], [1.65, 0, 'outBack']),
          opacity: fadeIn(0.78, 0.2),
        }),
        x.title('ib-name', x.c.brand, {
          size: nameSize,
          x: cx,
          y: ny,
          fill: p.onAccent,
          anim: ta.rise(1.3, { by: 'char', stagger: 0.04, dur: 0.85 }),
        }),
        x.body('ib-tag', x.c.tagline, {
          size: tagSize,
          x: cx,
          y: ty,
          fill: alpha(p.onAccent, 0.78),
          anim: ta.blur(1.75, { stagger: 0.07 }),
        }),
      ],
      { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, mask: { shape: 'circle', x: cx, y: my, r: k([0.62, 0], [1.5, R, IRIS]) } },
    );

    // Leading edge: a second-colour iris a beat ahead of the main one.
    const lead = group('ib-lead', [rect('ib-lead-fill', { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, fill: p.accent2 })], {
      x: 0,
      y: 0,
      ax: 0,
      ay: 0,
      w: W,
      h: H,
      mask: { shape: 'circle', x: cx, y: my, r: k([0.5, 0], [1.36, R, IRIS]) },
      end: 1.55,
    });

    return {
      background: radial(cx / W, my / H, 0.9, p.bg, p.bg2),
      layers: [
        ellipse('ib-charge', {
          x: cx,
          y: my,
          w: k([0.0, 22 * u], [0.55, 3.5 * u, 'inCubic']),
          h: k([0.0, 22 * u], [0.55, 3.5 * u, 'inCubic']),
          stroke: p.accent,
          strokeWidth: 0.4 * u,
          opacity: k([0.0, 0], [0.2, 1, 'outCubic'], [0.5, 1], [0.6, 0]),
        }),
        circle('ib-dot', 2 * u, {
          x: cx,
          y: my,
          fill: p.accent,
          scale: k([0.0, 0], [0.3, 1, 'outBack'], [0.46, 0.7, 'inOutQuad'], [0.6, 1.6, 'outQuad']),
          end: 0.8,
        }),
        lead,
        stage,
      ],
    };
  },
};
