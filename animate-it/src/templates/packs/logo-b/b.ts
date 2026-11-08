/**
 * logo-b, part B: Neon Sign, Rising Tide, Satellite, Warp Tunnel.
 */
import type { Layer } from '../../../engine/types';
import {
  type Recipe,
  k,
  rect,
  circle,
  ellipse,
  group,
  path,
  radial,
  linear,
  ta,
  bob,
  alpha,
  shade,
  lerpColor,
} from '../../kit';
import {
  brandField,
  taglineField,
  fitTitle,
  fitBody,
  titleW,
  titleH,
  bodyW,
  sampled,
  stepped,
  easeAt,
} from './shared';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ------------------------------------------------------------------ 5. Neon Sign

const neonSign: Recipe = {
  id: 'neon-sign',
  name: 'Neon Sign',
  category: 'logo',
  tags: ['logo', 'neon', 'glow', 'night', 'retro', 'dark', 'bar'],
  description: 'Unlit glass tubes buzz and flicker to life, then your mark and name hold a steady neon glow.',
  duration: 4.4,
  usesLogo: true,
  fields: [brandField('Night Owl'), taglineField('Open late')],
  variants: [
    { name: 'Cyber', palette: 'cyber', fonts: 'outfit', logo: 'knot', format: 'square' },
    { name: 'Midnight', palette: 'midnight', fonts: 'sora', logo: 'orbit', format: 'landscape', copy: { brand: 'Afterglow', tagline: 'Cocktail lounge' } },
    { name: 'Noir', palette: 'noir', fonts: 'space', logo: 'stack', format: 'story', copy: { brand: 'Volt Arcade', tagline: 'Play all night' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'manrope', logo: 'wave', format: 'portrait', copy: { brand: 'Riptide', tagline: 'Surf club' } },
    { name: 'Royal', palette: 'royal', fonts: 'syne', logo: 'prism', format: 'landscape', copy: { brand: 'Starlight', tagline: 'Live music' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const L = x.pick({ story: 40 * u, portrait: 30 * u, landscape: 26 * u, default: 26 * u });
    const maxTW = x.pick({ landscape: 110 * u, story: 72 * u, default: 72 * u });
    const B = fitTitle(x, x.c.brand, x.pick({ story: 15 * u, portrait: 11.5 * u, default: 10.5 * u }), maxTW);
    const tTrack = 0.3;
    const T = fitBody(x, x.c.tagline, x.pick({ story: 4.6 * u, default: 3.3 * u }), maxTW, tTrack, true);
    const bh = titleH(x, B);
    const g1 = x.pick({ story: 11 * u, default: 6.5 * u });
    const g2 = x.pick({ story: 4.5 * u, default: 3.2 * u });
    const block = L + g1 + bh + g2 + T * 1.35;
    const top = cy - block / 2;
    const my = top + L / 2;
    const brandY = top + L + g1;
    const tagY = brandY + bh + g2;

    const padX = x.pick({ landscape: 14 * u, default: 10 * u });
    const padY = x.pick({ story: 16 * u, portrait: 10 * u, default: 8 * u });
    const contentW = Math.max(L, titleW(x, x.c.brand, B, x.f.displayTracking), bodyW(x, x.c.tagline, T, tTrack, true));
    const fw = clamp(contentW + padX * 2, x.pick({ landscape: 92 * u, story: 80 * u, default: 64 * u }), W - 12 * u);
    const fh = Math.min(block + padY * 2, H - 12 * u);

    const markGlow = p.accent;
    const markCore = shade(p.accent, 0.6);
    const textGlow = p.accent2;
    const textCore = shade(p.accent2, 0.62);
    const unlit = alpha(p.fg, 0.1);

    // Flicker scripts (hold-stepped opacity), then a steady glow.
    const fMark = stepped([[0, 0], [0.32, 1], [0.38, 0.1], [0.46, 0.85], [0.52, 0.12], [0.64, 1], [1.62, 1], [1.66, 0.35], [1.72, 1]]);
    const fFrame = stepped([[0, 0], [0.72, 0.7], [0.77, 0], [0.88, 1], [0.93, 0.25], [1.02, 1]]);
    const fBrand = stepped([[0, 0], [1.08, 1], [1.13, 0.15], [1.22, 0.9], [1.3, 0.2], [1.38, 1], [2.72, 1], [2.76, 0.4], [2.82, 1]]);
    const spill = stepped([[0, 0], [0.32, 0.8], [0.38, 0.1], [0.46, 0.7], [0.52, 0.12], [0.64, 0.9], [1.08, 1]]);

    const tag = (id: string, o: Record<string, unknown>): Layer =>
      x.body(id, x.c.tagline, { size: T, x: cx, y: tagY, ay: 0, weight: 600, uppercase: true, tracking: tTrack, ...o });
    const brand = (id: string, o: Record<string, unknown>): Layer =>
      x.title(id, x.c.brand, { size: B, x: cx, y: brandY, ay: 0, weight: 600, ...o });
    const frame = (id: string, o: Record<string, unknown>): Layer =>
      rect(id, { x: cx, y: cy, w: fw, h: fh, radius: 5 * u, ...o });

    return {
      background: radial(0.5, 0.5, 0.95, p.bg2, p.bg),
      layers: [
        // Light spilling onto the wall.
        circle('spill', Math.max(fw, fh) * 0.75, {
          x: cx,
          y: cy,
          fill: radial(0.5, 0.5, 0.7, alpha(markGlow, 0.26), alpha(markGlow, 0)),
          opacity: spill,
        }),
        // Unlit tubes.
        frame('frame-unlit', { stroke: unlit, strokeWidth: 0.5 * u }),
        x.logo('mark-unlit', { size: L, x: cx, y: my, color: p.fg, opacity: 0.1 }),
        brand('brand-unlit', { fill: unlit }),
        // Frame tube.
        frame('frame-glow', { stroke: markGlow, strokeWidth: 1.4 * u, blur: 1.6 * u, opacity: fFrame }),
        frame('frame', { stroke: markCore, strokeWidth: 0.45 * u, shadow: { color: markGlow, blur: 2.2 * u }, opacity: fFrame }),
        // Mark tube.
        x.logo('mark-glow', { size: L, x: cx, y: my, color: markGlow, blur: 2.4 * u, scale: 1.03, opacity: fMark }),
        x.logo('mark', { size: L, x: cx, y: my, color: markCore, shadow: { color: markGlow, blur: 2.4 * u }, opacity: fMark }),
        // Name tube.
        brand('brand-glow', { fill: textGlow, blur: 1.6 * u, opacity: fBrand }),
        brand('brand', { fill: textCore, shadow: { color: textGlow, blur: 2 * u }, opacity: fBrand }),
        tag('tagline', {
          fill: lerpColor(p.muted, p.fg, 0.4),
          shadow: { color: alpha(textGlow, 0.6), blur: 1.2 * u },
          anim: ta.chars(1.85, { stagger: 0.035, from: { opacity: 0 }, dur: 0.12, ease: 'linear' }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ 6. Rising Tide (liquid fill)

/** A wave strip in a 400×140 box: four periods, crest line near the top. */
function wavePath(phase: number): string {
  let d = '';
  for (let xx = 0; xx <= 400; xx += 5) {
    const y = 8 + 5 * Math.sin((xx / 100) * Math.PI * 2 + phase);
    d += `${xx === 0 ? 'M' : 'L'}${xx} ${y.toFixed(2)} `;
  }
  return d + 'L400 140 L0 140 Z';
}

const risingTide: Recipe = {
  id: 'rising-tide',
  name: 'Rising Tide',
  category: 'logo',
  tags: ['logo', 'liquid', 'fill', 'wave', 'water', 'drink', 'new'],
  description: 'Liquid rises inside your mark with rolling waves and bubbles until it is solid, then splashes into place.',
  duration: 4.6,
  usesLogo: true,
  fields: [brandField('Aquaria'), taglineField('Pure water, daily')],
  variants: [
    { name: 'Arctic', palette: 'arctic', fonts: 'manrope', logo: 'wave', format: 'portrait' },
    { name: 'Sunset', palette: 'sunset', fonts: 'poppins', logo: 'petal', format: 'square', copy: { brand: 'Brewly', tagline: 'Coffee, poured right' } },
    { name: 'Ocean', palette: 'ocean', fonts: 'outfit', logo: 'orbit', format: 'landscape', copy: { brand: 'Deepwell', tagline: 'Hydration lab' } },
    { name: 'Sand', palette: 'sand', fonts: 'fraunces', logo: 'arc', format: 'story', copy: { brand: 'Honeyhive', tagline: 'Raw wildflower honey' } },
    { name: 'Lilac', palette: 'lilac', fonts: 'grotesk', logo: 'knot', format: 'square', copy: { brand: 'Fizzy', tagline: 'Sparkling since 2019' } },
  ],
  build(x) {
    const { u, cx, cy, p, H } = x;
    const dur = 4.6;
    const L = x.pick({ story: 60 * u, portrait: 46 * u, landscape: 38 * u, default: 40 * u });
    const maxTW = x.pick({ landscape: 120 * u, default: 84 * u });
    const B = fitTitle(x, x.c.brand, x.pick({ story: 15 * u, portrait: 11.5 * u, default: 10 * u }), maxTW);
    const tTrack = 0.16;
    const T = fitBody(x, x.c.tagline, x.pick({ story: 4.4 * u, portrait: 3.5 * u, default: 3.3 * u }), maxTW, tTrack, true);
    const bh = titleH(x, B);
    const g1 = x.pick({ story: 11 * u, default: 7 * u });
    const g2 = 2.8 * u;
    const block = L + g1 + bh + g2 + T * 1.35;
    const top = cy - block / 2;
    const my = top + L / 2;
    const brandY = top + L + g1;
    const tagY = brandY + bh + g2;

    // Fill level 0 → 1 (surface y in vessel space = L·(1 − h)).
    const r0 = 0.3;
    const r1 = 2.75;
    const level = (t: number, lead = 0) => clamp(easeAt('inOutSine', (t - r0) / (r1 - r0)) + lead, 0, 1);
    const surf = (h: number) => L * (1.07 - h * 1.15);
    const waveY = (t: number, lead: number) => surf(level(t, lead)) - 0.08 * L;
    const wave = (id: string, phase: number, fill: string, dir: 1 | -1, lead: number): Layer =>
      path(id, wavePath(phase), 400, 140, {
        x: dir > 0 ? k([0, 0], [dur, -3 * L, 'linear']) : k([0, -3 * L], [dur, 0, 'linear']),
        y: sampled(0, dur, 0.1, (t) => waveY(t, lead)),
        w: 4 * L,
        h: 1.4 * L,
        ax: 0,
        ay: 0,
        fill,
        blend: 'destination-in',
      });

    // Bubbles: rise from the bottom and pop at the surface.
    const bubbles: Layer[] = Array.from({ length: 7 }, (_, i) => {
      const t0 = 0.55 + i * 0.27;
      const bx = L * (0.2 + ((i * 0.37) % 0.6));
      const speed = L * (0.42 + (i % 3) * 0.08);
      const r = L * (0.018 + (i % 3) * 0.008);
      const yAt = (t: number) => L * 1.02 - (t - t0) * speed;
      let tPop = t0;
      while (tPop < dur && yAt(tPop) > surf(level(tPop)) + r * 2) tPop += 0.02;
      return circle(`bubble-${i}`, r, {
        x: sampled(t0, tPop, 0.1, (t) => bx + Math.sin((t - t0) * 7 + i) * L * 0.015),
        y: k([t0, yAt(t0)], [tPop, yAt(tPop), 'linear']),
        fill: alpha(shade(p.accent, 0.65), 0.9),
        blend: 'source-atop',
        start: t0,
        end: tPop,
      });
    });

    // Splash droplets when the vessel tops up.
    const ts = 2.55;
    const drops: Layer[] = [-0.3, -0.12, 0.05, 0.2, 0.34].map((dx, i) => {
      const x0 = cx + dx * L;
      const y0 = my - L * 0.42;
      const vx = dx * 26 * u;
      const vy = -(16 + (i % 3) * 5) * u;
      const g = 70 * u;
      const life = 0.75;
      return circle(`splash-${i}`, (0.7 + (i % 2) * 0.35) * u, {
        x: sampled(ts, ts + life, 0.05, (t) => x0 + vx * (t - ts)),
        y: sampled(ts, ts + life, 0.05, (t) => y0 + vy * (t - ts) + 0.5 * g * (t - ts) ** 2),
        fill: p.accent,
        opacity: k([ts, 1], [ts + life * 0.6, 1], [ts + life, 0]),
        start: ts,
        end: ts + life,
      });
    });

    const bump = k<number>([0, 1], [2.62, 1], [2.78, 1.05, 'outQuad'], [3.3, 1, 'outBack']);
    const vessel = (id: string, children: Layer[]) =>
      group(id, children, { x: cx, y: my, w: L, h: L, isolate: true, scale: bump });
    const logoIn = (id: string, color: string) => x.logo(id, { size: L, x: L / 2, y: L / 2, color });

    return {
      background: radial(0.5, my / H, 0.9, p.bg2, p.bg),
      layers: [
        circle('halo', L * 0.9, {
          x: cx,
          y: my,
          fill: radial(0.5, 0.5, 0.7, alpha(p.accent, 0.12), alpha(p.accent, 0)),
          scale: k([0, 0.6], [3.0, 1.1, 'outCubic']),
          opacity: k([0, 0], [1.0, 1, 'outCubic']),
        }),
        x.logo('ghost', {
          size: L,
          x: cx,
          y: my,
          color: lerpColor(p.bg, p.fg, 0.12),
          opacity: x.logoTint ? k([0, 0], [0.4, 1, 'outCubic']) : k([0, 0], [0.4, 0.18, 'outCubic']),
          scale: bump,
        }),
        vessel('liquid-back', [logoIn('liquid-back-logo', shade(p.accent, 0.4)), wave('wave-back', 1.6, p.fg, -1, 0.05)]),
        vessel('liquid-front', [logoIn('liquid-logo', p.accent), wave('wave-front', 0, p.fg, 1, 0), ...bubbles]),
        ...drops,
        x.title('brand', x.c.brand, {
          size: B,
          x: cx,
          y: brandY,
          ay: 0,
          anim: ta.rise(1.9, { by: 'char', stagger: 0.035, dur: 0.85 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: T,
          x: cx,
          y: tagY,
          ay: 0,
          fill: p.muted,
          weight: 600,
          uppercase: true,
          tracking: tTrack,
          anim: ta.blur(2.35, { stagger: 0.07 }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ 7. Satellite (orbit system)

const satellite: Recipe = {
  id: 'satellite-orbit',
  name: 'Satellite',
  category: 'logo',
  tags: ['logo', 'orbit', 'space', 'planets', 'tech', 'science'],
  description: 'Planets trace tilted orbits around your mark, weaving in front of and behind it like a tiny solar system.',
  duration: 4.8,
  usesLogo: true,
  fields: [brandField('Astrelle'), taglineField('Explore further')],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'space', logo: 'orbit', format: 'story' },
    { name: 'Azure', palette: 'azure', fonts: 'sora', logo: 'knot', format: 'portrait', copy: { brand: 'Orbitly', tagline: 'Connected teams' } },
    { name: 'Graphite', palette: 'graphite', fonts: 'mono', logo: 'prism', format: 'square', copy: { brand: 'Cosmolab', tagline: 'Science for everyone' } },
    { name: 'Forest', palette: 'forest', fonts: 'fraunces', logo: 'petal', format: 'landscape', copy: { brand: 'Moonfield', tagline: 'Night-sky tours' } },
    { name: 'Cobalt Cream', palette: 'cobalt', fonts: 'outfit', logo: 'arc', format: 'story', copy: { brand: 'Satella', tagline: 'Signal, everywhere' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const dur = 4.8;
    const D = x.pick({ story: 40 * u, portrait: 30 * u, landscape: 27 * u, default: 26 * u });
    const L = D * 0.56;
    const radii = x.pick({
      story: [33, 41.5, 48.5],
      portrait: [27, 36, 45],
      landscape: [31, 46, 62],
      default: [25, 34.5, 44],
    }).map((v) => v * u);
    const flats = x.pick({ story: [0.56, 0.48, 0.41], portrait: [0.46, 0.39, 0.33], default: [0.38, 0.31, 0.26] });
    const specs = [
      { tilt: -17, flat: flats[0], size: 1.8 * u, col: p.accent2, t0: 0.4, w: 0.9 },
      { tilt: 11, flat: flats[1], size: 2.6 * u, col: p.accent, t0: 0.6, w: 0.62 },
      { tilt: -5, flat: flats[2], size: 1.5 * u, col: p.fg, t0: 0.8, w: 0.45 },
    ];
    // Vertical half-extent of the whole system.
    const half = Math.max(
      D / 2,
      ...specs.map((s, i) => {
        const rx = radii[i];
        const ry = rx * s.flat;
        const a = (s.tilt * Math.PI) / 180;
        return Math.hypot(rx * Math.sin(a), ry * Math.cos(a)) + s.size;
      }),
    );
    const maxTW = x.pick({ landscape: 120 * u, default: 84 * u });
    const B = fitTitle(x, x.c.brand, x.pick({ story: 16 * u, portrait: 12 * u, default: 10.5 * u }), maxTW);
    const tTrack = 0.2;
    const T = fitBody(x, x.c.tagline, x.pick({ story: 4.4 * u, portrait: 3.6 * u, default: 3.3 * u }), maxTW, tTrack, true);
    const bh = titleH(x, B);
    const g1 = x.pick({ story: 9 * u, default: 6 * u });
    const g2 = 2.6 * u;
    const block = half * 2 + g1 + bh + g2 + T * 1.35;
    const top = cy - block / 2;
    const my = top + half;
    const brandY = top + half * 2 + g1;
    const tagY = brandY + bh + g2;

    const back: Layer[] = [];
    const front: Layer[] = [];
    specs.forEach((s, i) => {
      const rx = radii[i];
      const ry = rx * s.flat;
      const sw = 0.34 * u;
      const ex = rx - sw / 2;
      const ey = ry - sw / 2;
      // Angle: a fast entrance that eases into a steady orbit.
      const omega = s.w * Math.PI * 2 * 0.32;
      const kk = 2.4;
      const Bn = (Math.PI * 2 - omega * 1.1) / (1 - Math.exp(-kk * 1.1));
      const phi = (t: number) => (t <= s.t0 ? 0 : omega * (t - s.t0) + Bn * (1 - Math.exp(-kk * (t - s.t0))));
      const arc = (t: number) => 0.25 + phi(t) / (Math.PI * 2);
      let tDone = s.t0;
      while (arc(tDone) < 1.25 && tDone < dur) tDone += 0.01;
      const px = sampled(s.t0, dur, 0.04, (t) => rx + ex * Math.cos(phi(t)), 2);
      const py = sampled(s.t0, dur, 0.04, (t) => ry + ey * Math.sin(phi(t)), 2);
      // Front/back visibility switches as the planet crosses the horizon.
      const vis = (wantFront: boolean): [number, number][] => {
        const out: [number, number][] = [[0, 0]];
        let prev: boolean | null = null;
        for (let t = s.t0; t <= dur + 0.001; t += 0.01) {
          const f = Math.sin(phi(t)) >= 0;
          if (f !== prev) {
            out.push([t, f === wantFront ? 1 : 0]);
            prev = f;
          }
        }
        return out;
      };
      const orbitBox = { x: cx, y: my, w: rx * 2, h: ry * 2, rotation: s.tilt };
      const lineCol = alpha(p.fg, 0.42);
      back.push(
        group(
          `orbit-back-${i}`,
          [
            ellipse(`orbit-back-line-${i}`, {
              x: rx,
              y: ry,
              w: rx * 2,
              h: ry * 2,
              stroke: alpha(p.fg, 0.2),
              strokeWidth: sw,
              arcStart: 0.75,
              arcEnd: sampled(s.t0, tDone + 0.02, 0.03, (t) => clamp(arc(t), 0.75, 1.25)),
            }),
            circle(`planet-back-${i}`, s.size, { x: px, y: py, fill: lerpColor(s.col, p.bg, 0.25), scale: 0.85, opacity: stepped(vis(false)) }),
          ],
          orbitBox,
        ),
      );
      front.push(
        group(
          `orbit-front-${i}`,
          [
            ellipse(`orbit-front-line-${i}`, {
              x: rx,
              y: ry,
              w: rx * 2,
              h: ry * 2,
              stroke: lineCol,
              strokeWidth: sw,
              arcStart: 0.25,
              arcEnd: sampled(s.t0, tDone + 0.02, 0.03, (t) => clamp(arc(t), 0.25, 0.75)),
            }),
            circle(`planet-front-${i}`, s.size, {
              x: px,
              y: py,
              fill: s.col,
              shadow: { color: alpha(s.col, 0.6), blur: s.size * 1.6 },
              opacity: stepped(vis(true)),
            }),
          ],
          orbitBox,
        ),
      );
    });

    // Twinkling starfield.
    const stars: Layer[] = Array.from({ length: 26 }, (_, i) => {
      const sx = x.rand() * W;
      const sy = x.rand() * H;
      const base = 0.18 + x.rand() * 0.25;
      return circle(`star-${i}`, (0.18 + x.rand() * 0.3) * u, {
        x: sx,
        y: sy,
        fill: p.fg,
        opacity: bob(base, base * 0.7, dur, 1 + (i % 3), i),
      });
    });

    return {
      background: radial(0.5, my / H, 0.9, p.bg2, p.bg),
      layers: [
        ...stars,
        circle('halo', D * 1.4, {
          x: cx,
          y: my,
          fill: radial(0.5, 0.5, 0.7, alpha(p.accent, 0.3), alpha(p.accent, 0)),
          scale: k([0.1, 0.4], [1.4, 1, 'outExpo']),
          opacity: k([0.1, 0], [0.8, 1]),
        }),
        ...back,
        circle('core', D / 2, {
          x: cx,
          y: my,
          fill: linear(135, shade(p.accent, 0.15), shade(p.accent, -0.12)),
          shadow: { color: alpha(p.accent, 0.45), blur: 4 * u },
          scale: k([0.1, 0], [0.95, 1, 'spring']),
        }),
        x.logo('mark', {
          size: L,
          x: cx,
          y: my,
          color: p.onAccent,
          scale: k([0.3, 0], [1.05, 1, 'outBack']),
          rotation: k([0.3, 60], [1.2, 0, 'outCubic']),
        }),
        ...front,
        x.title('brand', x.c.brand, {
          size: B,
          x: cx,
          y: brandY,
          ay: 0,
          anim: ta.rise(1.2, { stagger: 0.03, by: 'char', dur: 0.8 }),
        }),
        x.body('tagline', x.c.tagline, {
          size: T,
          x: cx,
          y: tagY,
          ay: 0,
          fill: p.muted,
          weight: 600,
          uppercase: true,
          tracking: tTrack,
          anim: ta.blur(1.6, { stagger: 0.07 }),
        }),
      ],
    };
  },
};

// ------------------------------------------------------------------ 8. Warp Tunnel

const warpTunnel: Recipe = {
  id: 'warp-tunnel',
  name: 'Warp Tunnel',
  category: 'logo',
  tags: ['logo', 'tunnel', 'zoom', 'depth', 'portal', 'tech', 'new'],
  description: 'Fly through a tunnel of nested frames that rush past the camera and land on your logo card.',
  duration: 4.4,
  usesLogo: true,
  fields: [brandField('Warpline'), taglineField('Faster by design')],
  variants: [
    { name: 'Electric', palette: 'electric', fonts: 'unbounded', logo: 'prism', format: 'landscape' },
    { name: 'Cyber', palette: 'cyber', fonts: 'syne', logo: 'orbit', format: 'story', copy: { brand: 'Portalis', tagline: 'Step inside' } },
    { name: 'Slate', palette: 'slate', fonts: 'grotesk', logo: 'stack', format: 'portrait', copy: { brand: 'Deepend', tagline: 'Data infrastructure' } },
    { name: 'Graphite', palette: 'graphite', fonts: 'sora', logo: 'wave', format: 'square', copy: { brand: 'Infinito', tagline: 'No limits' } },
    { name: 'Mint', palette: 'mint', fonts: 'archivo', logo: 'knot', format: 'landscape', copy: { brand: 'Loopway', tagline: 'Endless ideas' } },
  ],
  build(x) {
    const { u, W, H, cx, cy, p } = x;
    const dur = 4.4;
    const cw = x.pick({ landscape: 92 * u, story: 72 * u, portrait: 62 * u, default: 56 * u });
    const ch = x.pick({ landscape: 54 * u, story: 114 * u, portrait: 76 * u, default: 56 * u });
    const rad = Math.min(cw, ch) * 0.09;
    const q = 1.24;
    const N = 27;
    const g0 = 1 / 46;
    const T = 2.5;
    const prog = (t: number) => easeAt('outCubic', clamp(t / T, 0, 1));
    const zoom = (t: number) => (t <= T ? Math.exp(Math.log(g0) * (1 - prog(t))) : 1 + 0.03 * ((t - T) / (dur - T)));

    // Card content.
    const L = Math.min(cw, ch) * x.pick({ landscape: 0.34, story: 0.42, default: 0.36 });
    const tTrack = 0.18;
    const Bs = fitTitle(x, x.c.brand, x.pick({ story: 12.5 * u, landscape: 9 * u, default: 8.5 * u }), cw - 12 * u);
    const Ts = fitBody(x, x.c.tagline, x.pick({ story: 3.4 * u, default: 2.8 * u }), cw - 12 * u, tTrack, true);
    const bh = titleH(x, Bs);
    const g1 = x.pick({ story: 6 * u, default: 4 * u });
    const g2 = 2 * u;
    const block = L + g1 + bh + g2 + Ts * 1.35;
    const ctop = cy - block / 2;

    const bands: Layer[] = [];
    for (let i = N; i >= 1; i--) {
      const s = Math.pow(q, i);
      bands.push(
        rect(`band-${i}`, {
          x: cx,
          y: cy,
          w: cw * s,
          h: ch * s,
          radius: rad * s,
          fill: i % 2 ? p.bg2 : p.bg,
          stroke: alpha(p.accent, 0.5),
          strokeWidth: 0.35 * u * Math.min(s, 3),
        }),
      );
    }

    // Light streaks rushing past during the flight.
    const streaks: Layer[] = Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2 + (i % 2) * 0.17;
      const t0 = 0.05 + (i % 6) * 0.22;
      const life = 0.7;
      const d0 = 6 * u;
      const d1 = Math.hypot(W, H) * 0.6;
      const dist = (t: number) => d0 + (d1 - d0) * easeAt('inCubic', (t - t0) / life);
      return rect(`streak-${i}`, {
        x: sampled(t0, t0 + life, 0.05, (t) => cx + Math.cos(a) * dist(t)),
        y: sampled(t0, t0 + life, 0.05, (t) => cy + Math.sin(a) * dist(t)),
        w: 0.35 * u,
        h: k([t0, 1 * u], [t0 + life, 14 * u, 'inCubic']),
        radius: 0.2 * u,
        rotation: (a * 180) / Math.PI + 90,
        fill: alpha(p.fg, 0.55),
        opacity: k([t0, 0], [t0 + 0.2, 1], [t0 + life, 0.2]),
        start: t0,
        end: t0 + life,
      });
    });

    const textOn = p.onAccent;
    return {
      background: p.bg,
      layers: [
        group(
          'tunnel',
          [
            ...bands,
            rect('card', {
              x: W / 2,
              y: H / 2,
              w: cw,
              h: ch,
              radius: rad,
              fill: linear(135, shade(p.accent, 0.12), shade(p.accent, -0.08)),
              shadow: { color: alpha(shade(p.accent, -0.6), 0.4), blur: 5 * u, y: 1.5 * u },
            }),
            x.logo('mark', {
              size: L,
              x: W / 2,
              y: ctop + L / 2,
              color: textOn,
              scale: k([1.25, 0.6], [2.1, 1, 'outBack']),
              opacity: k([1.25, 0], [1.6, 1]),
            }),
            x.title('brand', x.c.brand, {
              size: Bs,
              x: W / 2,
              y: ctop + L + g1,
              ay: 0,
              fill: textOn,
              anim: ta.rise(2.0, { by: 'char', stagger: 0.03, dur: 0.8 }),
            }),
            x.body('tagline', x.c.tagline, {
              size: Ts,
              x: W / 2,
              y: ctop + L + g1 + bh + g2,
              ay: 0,
              fill: alpha(textOn, 0.78),
              weight: 600,
              uppercase: true,
              tracking: tTrack,
              anim: ta.blur(2.4, { stagger: 0.07 }),
            }),
          ],
          {
            x: cx,
            y: cy,
            w: W,
            h: H,
            scale: sampled(0, dur, 0.04, zoom, 5),
            rotation: sampled(0, T, 0.05, (t) => 28 * (1 - prog(t)), 3),
          },
        ),
        ...streaks,
        rect('vignette', {
          x: cx,
          y: cy,
          w: W,
          h: H,
          fill: radial(0.5, 0.5, 1, alpha(p.bg, 0), alpha(p.bg, 0), alpha(shade(p.bg, -0.6), 0.35)),
        }),
      ],
    };
  },
};

export const recipesB: Recipe[] = [neonSign, risingTide, satellite, warpTunnel];

