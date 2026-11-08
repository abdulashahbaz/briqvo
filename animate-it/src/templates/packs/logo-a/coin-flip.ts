import type { Ease, Keyframe, Layer } from '../../../engine/types';
import { type Recipe, k, rect, ellipse, group, radial, ta, fadeIn, alpha, shade, readableOn } from '../../kit';
import { estW, fit, stack, titleH, bodyH, outQuart } from './util';

const MOVE: [number, number, number, number] = [0.7, 0, 0.2, 1];

export const coinFlip: Recipe = {
  id: 'coin-flip',
  name: 'Coin Flip',
  category: 'logo',
  tags: ['logo', 'flip', '3d', 'coin', 'badge', 'playful'],
  description: 'Your mark spins in as a two-sided coin with a real edge and soft shadow, lands face-up, and the name slides out from behind it.',
  duration: 4,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Crestmark' },
    { key: 'tagline', label: 'Tagline', default: 'Wealth, well kept' },
  ],
  variants: [
    { name: 'Royal', palette: 'royal', fonts: 'fraunces', logo: 'arc', format: 'landscape' },
    { name: 'Citrus', palette: 'citrus', fonts: 'poppins', logo: 'orbit', format: 'square', copy: { brand: 'Zesto', tagline: 'Fresh-pressed daily' } },
    { name: 'Electric', palette: 'electric', fonts: 'sora', logo: 'knot', format: 'portrait', copy: { brand: 'Tokenly', tagline: 'Rewards that add up' } },
    { name: 'Forest', palette: 'forest', fonts: 'dmserif', logo: 'petal', format: 'story', copy: { brand: 'Fernwood', tagline: 'Organic farm co-op' } },
    { name: 'Slate', palette: 'slate', fonts: 'space', logo: 'stack', format: 'landscape', copy: { brand: 'Coinstack', tagline: 'Save on autopilot' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const horizontal = !x.tall;
    const D = x.pick({ landscape: 33 * u, story: 42 * u, portrait: 36 * u, default: 27 * u });
    const L = D * 0.5;
    const th = D * 0.075;

    // ---- layout
    let coinX = cx;
    let coinY = cy;
    let textX = cx;
    let nameY: number;
    let tagY: number;
    let nameSize: number;
    let tagSize: number;
    const tagOpts = { body: true };
    if (horizontal) {
      const gap = x.pick({ landscape: 6 * u, default: 5 * u });
      const textMax = W - x.pick({ landscape: 28 * u, default: 14 * u }) - D - gap;
      nameSize = fit(x, x.c.brand, x.pick({ landscape: 13 * u, default: 10.5 * u }), textMax);
      tagSize = fit(x, x.c.tagline, x.pick({ landscape: 4.2 * u, default: 3.6 * u }), textMax, tagOpts);
      const textW = Math.max(estW(x, x.c.brand, nameSize), estW(x, x.c.tagline, tagSize, tagOpts));
      const left = cx - (D + gap + textW) / 2;
      coinX = left + D / 2;
      textX = left + D + gap;
      const nH = titleH(x, nameSize);
      const tH = bodyH(tagSize);
      const g = 2.6 * u;
      nameY = cy - (nH + g + tH) / 2 + nH / 2;
      tagY = cy + (nH + g + tH) / 2 - tH / 2;
    } else {
      const maxW = W - 16 * u;
      nameSize = fit(x, x.c.brand, x.pick({ story: 14 * u, default: 12 * u }), maxW);
      tagSize = fit(x, x.c.tagline, x.pick({ story: 4.8 * u, default: 4.1 * u }), maxW, tagOpts);
      [coinY, nameY, tagY] = stack(cy, [D, titleH(x, nameSize), bodyH(tagSize)], [x.pick({ story: 10 * u, default: 8 * u }), x.pick({ story: 4.6 * u, default: 3.8 * u })]);
    }

    // ---- spin: sample a decelerating rotation into dense linear keyframes
    const S0 = 0.2;
    const S1 = 1.9;
    const PHI = Math.PI * 3.5;
    const sxK: Keyframe<number>[] = [];
    const rimW: Keyframe<number>[] = [];
    const rimX: Keyframe<number>[] = [];
    const hiX: Keyframe<number>[] = [];
    const shSX: Keyframe<number>[] = [];
    const frontO: Keyframe<number>[] = [];
    const backO: Keyframe<number>[] = [];
    let lastFront: boolean | null = null;
    const steps = Math.round((S1 - S0) * 40);
    for (let i = 0; i <= steps; i++) {
      const t = S0 + (i / steps) * (S1 - S0);
      const phi = PHI * (1 - outQuart(i / steps));
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      const lin: Ease = 'linear';
      sxK.push({ t, v: Math.max(0.002, Math.abs(c)), e: lin });
      rimW.push({ t, v: D * Math.abs(c) + th * Math.abs(s), e: lin });
      rimX.push({ t, v: D / 2 - (s * th) / 2, e: lin });
      hiX.push({ t, v: D / 2 - s * D * 0.28, e: lin });
      shSX.push({ t, v: 0.45 + 0.55 * Math.abs(c), e: lin });
      const front = c >= 0;
      if (front !== lastFront) {
        frontO.push({ t, v: front ? 1 : 0, e: 'hold' });
        backO.push({ t, v: front ? 0 : 1, e: 'hold' });
        lastFront = front;
      }
    }

    const face = (id: string, fill: string, ink: string, opacity: Keyframe<number>[]) =>
      group(
        id,
        [
          ellipse(id + '-disc', { x: D / 2, y: D / 2, w: D, h: D, fill: radial(0.34, 0.28, 1.05, shade(fill, 0.22), fill, shade(fill, -0.18)) }),
          ellipse(id + '-ring', { x: D / 2, y: D / 2, w: D * 0.86, h: D * 0.86, stroke: alpha(ink, 0.3), strokeWidth: 0.35 * u }),
          x.logo(id + '-logo', { size: L, x: D / 2, y: D / 2, color: ink }),
          group(id + '-hi', [ellipse(id + '-hi-e', { x: hiX, y: D * 0.35, w: D * 0.9, h: D * 0.7, fill: radial(0.5, 0.5, 0.7, alpha(shade(fill, 1), 0.28), alpha(shade(fill, 1), 0)) })], {
            x: D / 2,
            y: D / 2,
            w: D,
            h: D,
            clip: true,
            clipRadius: D / 2,
          }),
        ],
        { x: D / 2, y: D / 2, w: D, h: D, sx: sxK, opacity },
      );

    // ---- move into the lockup
    const M0 = 2.0;
    const M1 = 2.8;
    const lift: [number, number, Ease?][] = [
      [S0, coinY + 18 * u],
      [1.05, coinY - 5 * u, 'outCubic'],
      [S1, coinY, 'inOutSine'],
    ];
    const flipY = horizontal ? coinY : cy;
    const coinYTrack = horizontal
      ? k<number>(...lift)
      : k<number>([S0, flipY + 18 * u], [1.05, flipY - 5 * u, 'outCubic'], [S1, flipY, 'inOutSine'], [M0, flipY], [M1, coinY, MOVE]);
    const coinXTrack = horizontal ? k<number>([M0, cx], [M1, coinX, MOVE]) : cx;

    const coin = group(
      'cf-coin',
      [
        rect('cf-rim', { x: rimX, y: D / 2, w: rimW, h: D * 0.995, radius: D / 2, fill: shade(p.accent, -0.38) }),
        face('cf-back', p.accent2, readableOn(p.accent2, p.fg, p.bg), backO),
        face('cf-front', p.accent, p.onAccent, frontO),
      ],
      {
        x: coinXTrack,
        y: coinYTrack,
        w: D,
        h: D,
        scale: k([S0, 0.55], [1.05, 1, 'outCubic']),
        opacity: fadeIn(S0, 0.2),
      },
    );

    const groundOff = D / 2 + 3.2 * u;
    const shadow = ellipse('cf-shadow', {
      x: coinXTrack,
      y: horizontal ? coinY + groundOff : k([0, flipY + groundOff], [M0, flipY + groundOff], [M1, coinY + groundOff, MOVE]),
      w: D * 0.82,
      h: D * 0.12,
      fill: radial(0.5, 0.5, 0.75, alpha(shade(p.bg, -0.7), 0.35), alpha(shade(p.bg, -0.7), 0)),
      sx: shSX,
      scale: k([S0, 0.4], [1.05, 0.7, 'outCubic'], [S1, 1, 'inOutSine']),
      opacity: horizontal ? k([S0, 0], [1.05, 0.6], [S1, 1]) : k([S0, 0], [1.05, 0.6], [S1, 1], [M0, 1], [M1 - 0.3, 0]),
    });

    // ---- wordmark slides out from behind the coin
    let text: Layer;
    if (horizontal) {
      const from = cx - D * 0.4 - textX;
      text = group(
        'cf-text',
        [
          group(
            'cf-text-move',
            [
              x.title('cf-name', x.c.brand, { size: nameSize, x: textX, y: nameY, ax: 0, align: 'left' }),
              x.body('cf-tag', x.c.tagline, { size: tagSize, x: textX, y: tagY, ax: 0, align: 'left', fill: p.muted }),
            ],
            { x: k([M0, from], [M1 + 0.15, 0, MOVE]), y: 0, ax: 0, ay: 0, w: W, h: H },
          ),
        ],
        { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, start: M0, mask: { shape: 'rect', x: k([M0, cx], [M1, coinX, MOVE]), y: 0, w: W * 2, h: H } },
      );
    } else {
      const from = cy - D * 0.4 - nameY;
      text = group(
        'cf-text',
        [
          group(
            'cf-text-move',
            [
              x.title('cf-name', x.c.brand, { size: nameSize, x: cx, y: nameY }),
              x.body('cf-tag', x.c.tagline, { size: tagSize, x: cx, y: tagY, fill: p.muted, anim: ta.rise(M1, { stagger: 0.05, from: { y: 1.6 } }) }),
            ],
            { x: 0, y: k([M0, from], [M1 + 0.15, 0, MOVE]), ax: 0, ay: 0, w: W, h: H },
          ),
        ],
        { x: 0, y: 0, ax: 0, ay: 0, w: W, h: H, start: M0, mask: { shape: 'rect', x: 0, y: k([M0, cy], [M1, coinY, MOVE]), w: W, h: H * 2 } },
      );
    }

    return {
      background: radial(0.5, 0.45, 0.9, p.bg2, p.bg),
      layers: [shadow, text, coin],
    };
  },
};
