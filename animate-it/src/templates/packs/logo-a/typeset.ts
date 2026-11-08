import type { Keyframe, Layer } from '../../../engine/types';
import { type Recipe, k, group, radial, ta, fadeIn } from '../../kit';
import { estW, fit, stack, titleH, bodyH, holds, unitCount, onlyUnit, hideEdges } from './util';

const MOVE: [number, number, number, number] = [0.7, 0, 0.2, 1];

/** Blink pattern from t0 to t1 (on first), as hold keyframes. */
function blink(t0: number, t1: number, period = 0.36): Keyframe<number>[] {
  const steps: [number, number][] = [];
  let on = true;
  for (let t = t0 + period; t < t1 - 0.05; t += period) {
    on = !on;
    steps.push([t, on ? 1 : 0]);
  }
  steps.push([t1, 0]);
  return holds(1, ...steps);
}

export const typeset: Recipe = {
  id: 'typeset',
  name: 'Typeset',
  category: 'logo',
  tags: ['logo', 'typewriter', 'type', 'caret', 'text', 'minimal', 'tech'],
  description: 'Your name types itself out behind a blinking caret, then the mark slides in to complete the lockup.',
  duration: 4.4,
  usesLogo: true,
  fields: [
    { key: 'brand', label: 'Brand name', default: 'Kernelworks' },
    { key: 'tagline', label: 'Tagline', default: 'Software, carefully made' },
  ],
  variants: [
    { name: 'Slate', palette: 'slate', fonts: 'mono', logo: 'stack', format: 'landscape' },
    { name: 'Paper', palette: 'paper', fonts: 'serif', logo: 'petal', format: 'portrait', copy: { brand: 'Wordsmith', tagline: 'Copy that converts' } },
    { name: 'Noir', palette: 'noir', fonts: 'space', logo: 'prism', format: 'story', copy: { brand: 'Glyphic', tagline: 'Independent type foundry' } },
    { name: 'Arctic', palette: 'arctic', fonts: 'manrope', logo: 'knot', format: 'landscape', copy: { brand: 'Quillon', tagline: 'Docs for modern teams' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'fraunces', logo: 'orbit', format: 'square', copy: { brand: 'Inkling', tagline: 'Stories worth telling' } },
  ],
  build(x) {
    const { u, W, cx, cy, p } = x;
    const r = x.rand;
    const horizontal = !x.tall;
    const brand = x.c.brand;
    const chars = Array.from(brand);
    const n = chars.length;
    const tagOpts = { body: true };
    // A thin space before the caret, except in monospace where the pipe cell already has air.
    const thin = x.f.id === 'mono' ? '' : '\u2009';
    const CARET = thin + '|';
    const PAD_L = '|' + thin; // hidden pad on the left that balances the caret slot when centred

    // ---- layout
    let L: number;
    let nameSize: number;
    let tagSize: number;
    let markX = cx;
    let markY = cy;
    let textX = cx;
    let nameY: number;
    let tagY: number;
    let shiftX = 0;
    let shiftY = 0;
    if (horizontal) {
      L = x.pick({ landscape: 22 * u, default: 17 * u });
      const gap = x.pick({ landscape: 6 * u, default: 4.6 * u });
      const textMax = W - x.pick({ landscape: 30 * u, default: 14 * u }) - L - gap;
      nameSize = fit(x, brand + ' |', x.pick({ landscape: 13 * u, default: 10.5 * u }), textMax);
      tagSize = fit(x, x.c.tagline, x.pick({ landscape: 4 * u, default: 3.5 * u }), textMax, tagOpts);
      const nH = titleH(x, nameSize);
      const tH = bodyH(tagSize);
      const g = 2.8 * u;
      const textW = Math.max(estW(x, brand, nameSize), estW(x, x.c.tagline, tagSize, tagOpts));
      const left = cx - (L + gap + textW) / 2;
      markX = left + L / 2;
      textX = left + L + gap;
      nameY = cy - (nH + g + tH) / 2 + nH / 2;
      tagY = cy + (nH + g + tH) / 2 - tH / 2;
      shiftX = -(L + gap) / 2;
    } else {
      L = x.pick({ story: 40 * u, default: 30 * u });
      const maxW = W - 18 * u;
      nameSize = fit(x, brand + ' |', x.pick({ story: 16 * u, default: 13 * u }), maxW);
      tagSize = fit(x, x.c.tagline, x.pick({ story: 5.2 * u, default: 4.3 * u }), maxW, tagOpts);
      [markY, nameY, tagY] = stack(cy, [L, titleH(x, nameSize), bodyH(tagSize)], [x.pick({ story: 9 * u, default: 7.5 * u }), x.pick({ story: 4.6 * u, default: 3.8 * u })]);
      shiftY = cy - nameY;
    }

    // ---- typing rhythm (slightly human)
    const T0 = 0.62;
    const step = Math.min(0.12, Math.max(0.055, 1.25 / Math.max(1, n)));
    const at: number[] = [0];
    let t = T0;
    for (let i = 1; i <= n; i++) {
      at.push(t);
      t += step * (0.65 + r() * 0.7) * (chars[i - 1] === ' ' ? 1.5 : 1);
    }
    const tEnd = n ? at[n] : T0;
    const tMark = tEnd + 0.8;
    const tOff = tMark + 0.2;

    // ---- typed text + caret
    const pad = horizontal ? '' : PAD_L;
    const tail = horizontal ? '' : CARET;
    const full = pad + brand + tail;
    const nU = unitCount(full);
    const pre = unitCount(pad);
    const revealAt = (i: number) => (i >= n ? 1 : (pre + unitCount(chars.slice(0, i).join('')) + 0.5) / Math.max(1, nU));
    const reveal = holds(revealAt(0), ...at.slice(1).map((ti, i) => [ti, revealAt(i + 1)] as [number, number]));
    const textOpts = horizontal ? { x: textX, ax: 0, align: 'left' as const } : { x: cx };

    const typed: Layer[] = [
      x.title('tp-name', full, {
        ...textOpts,
        size: nameSize,
        y: nameY,
        reveal,
        ...(horizontal ? {} : { anim: hideEdges() }),
        start: 0,
      }),
    ];
    for (let i = 0; i <= n; i++) {
      const prefix = chars.slice(0, i).join('');
      const suffix = horizontal ? '' : chars.slice(i).join('');
      const s = pad + prefix + CARET + suffix;
      const j = unitCount(pad + prefix + CARET) - 1;
      const from = at[i];
      const to = i < n ? at[i + 1] : tOff;
      typed.push(
        x.title(`tp-caret-${i}`, s, {
          ...textOpts,
          size: nameSize,
          y: nameY,
          fill: p.accent,
          anim: onlyUnit(j),
          start: from,
          end: to,
          ...(i === 0 ? { opacity: holds(1, [0.34, 0], [0.47, 1]) } : i === n ? { opacity: blink(tEnd, tOff) } : {}),
        }),
      );
    }

    const typeGroup = group('tp-type', typed, {
      x: horizontal ? k([0, shiftX], [tMark, shiftX], [tMark + 0.8, 0, MOVE]) : 0,
      y: horizontal ? 0 : k([0, shiftY], [tMark, shiftY], [tMark + 0.8, 0, MOVE]),
      ax: 0,
      ay: 0,
      w: W,
      h: x.H,
    });

    const logo = x.logo('tp-logo', {
      size: L,
      x: horizontal ? k([tMark, markX - 12 * u], [tMark + 0.85, markX, MOVE]) : markX,
      y: horizontal ? markY : k([tMark, markY - 10 * u], [tMark + 0.85, markY, MOVE]),
      color: p.fg,
      opacity: fadeIn(tMark, 0.35),
      rotation: horizontal ? k([tMark, -20], [tMark + 0.85, 0, MOVE]) : 0,
    });

    const tag = x.body('tp-tag', x.c.tagline, {
      size: tagSize,
      x: horizontal ? textX : cx,
      y: tagY,
      ...(horizontal ? { ax: 0, align: 'left' as const } : {}),
      fill: p.muted,
      anim: ta.rise(tMark + 0.45, { stagger: 0.05, from: { y: 1.6 } }),
    });

    return {
      background: radial(0.5, 0.42, 0.95, p.bg, p.bg2),
      layers: [logo, typeGroup, tag],
    };
  },
};
