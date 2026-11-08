/** Motion pack — seamless background loops (every track returns to its t=0 value at t=duration). */
import type { Keyframe, Layer } from '../../../engine/types';
import { type Recipe, k, rect, circle, ellipse, group, path, radial, alpha, shade, lerpColor, starPath } from '../../kit';
import { osc, oscMap, loopOsc, smoothPath, rr } from './shared';

/** Optional tiny caption used by every background. */
function caption(x: Parameters<Recipe['build']>[0], fill: string): Layer {
  return x.body('brand', x.c.brand, {
    size: 2.3 * x.u,
    weight: 600,
    uppercase: true,
    tracking: 0.32,
    y: x.H - x.pick({ landscape: 6 * x.u, default: 7 * x.u }),
    fill,
  });
}

const BRAND_FIELD = { key: 'brand', label: 'Caption (optional)', default: '' };

// ------------------------------------------------------------------ Gradient Mesh

const meshLoop: Recipe = {
  id: 'mesh-loop',
  name: 'Gradient Mesh Loop',
  category: 'backgrounds',
  tags: ['background', 'loop', 'gradient', 'mesh', 'aurora', 'ambient', 'seamless'],
  description: 'Soft colour fields orbit on closed paths and blend into a living gradient mesh. Loops seamlessly.',
  duration: 8,
  fields: [BRAND_FIELD],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'sora', format: 'story' },
    { name: 'Lilac', palette: 'lilac', fonts: 'outfit', format: 'square' },
    { name: 'Cyber', palette: 'cyber', fonts: 'unbounded', format: 'landscape', copy: { brand: 'Signal / Noise' } },
    { name: 'Peach', palette: 'peach', fonts: 'fraunces', format: 'portrait', copy: { brand: 'Golden hour' } },
  ],
  build(x) {
    const { W, H, p } = x;
    const dur = 8;
    const S = Math.max(W, H);
    const blobs = [
      { c: p.accent, fx: 0.18, fy: 0.22, r: 0.46, orb: 0.12, dir: 1, ph: 0 },
      { c: p.accent2, fx: 0.86, fy: 0.3, r: 0.42, orb: 0.14, dir: -1, ph: 120 },
      { c: lerpColor(p.accent, p.accent2, 0.5), fx: 0.72, fy: 0.86, r: 0.48, orb: 0.11, dir: 1, ph: 240 },
      { c: shade(p.accent, 0.35), fx: 0.14, fy: 0.84, r: 0.38, orb: 0.13, dir: -1, ph: 60 },
      { c: p.bg2, fx: 0.5, fy: 0.52, r: 0.34, orb: 0.09, dir: 1, ph: 300 },
    ];
    const layers: Layer[] = blobs.map((b, i) =>
      group(
        `blob-${i}`,
        [
          circle(`blob-${i}-c`, b.r * S, {
            x: b.orb * S,
            y: 0,
            fill: radial(0.5, 0.5, 0.707, alpha(b.c, 0.85), alpha(b.c, 0.55), alpha(b.c, 0.18), alpha(b.c, 0)),
            scale: loopOsc(1, 0.1, dur, i % 2 ? 2 : 1, i % 4),
          }),
        ],
        { x: b.fx * W, y: b.fy * H, w: 1, h: 1, ax: 0, ay: 0, rotation: k([0, b.ph], [dur, b.ph + 360 * b.dir, 'linear']) },
      ),
    );
    layers.push(caption(x, alpha(p.fg, 0.75)));
    return { background: p.bg, layers };
  },
};

// ------------------------------------------------------------------ Pulse Grid

const pulseGrid: Recipe = {
  id: 'pulse-grid',
  name: 'Pulse Grid',
  category: 'backgrounds',
  tags: ['background', 'loop', 'pattern', 'grid', 'dots', 'geometric', 'wave', 'seamless'],
  description: 'A grid of shapes breathes in a travelling wave — dots, pills, diamonds or rings. Loops seamlessly.',
  duration: 6,
  fields: [BRAND_FIELD],
  variants: [
    { name: 'Noir', palette: 'noir', fonts: 'space', format: 'square', seed: 1 },
    { name: 'Azure', palette: 'azure', fonts: 'grotesk', format: 'landscape', seed: 2 },
    { name: 'Royal', palette: 'royal', fonts: 'outfit', format: 'story', seed: 3, copy: { brand: 'Members evening' } },
    { name: 'Mint', palette: 'mint', fonts: 'manrope', format: 'portrait', seed: 4 },
  ],
  build(x) {
    const { u, W, H, p, cx, cy } = x;
    const dur = 6;
    const P = 3;
    const mode = (['dot', 'pill', 'diamond', 'ring'] as const)[(((x.seed - 1) % 4) + 4) % 4];
    const g = Math.sqrt((W * H) / 120);
    const cols = Math.round(W / g);
    const rows = Math.round(H / g);
    const gx = W / cols;
    const gy = H / rows;
    const cell = Math.min(gx, gy);
    const radialWave = mode === 'dot' || mode === 'ring';
    const lo = alpha(p.fg, 0.14);
    const hi = p.accent;
    const mid = lerpColor(lo, hi, 0.5);
    const tr = { t0: -4 * P, t1: dur + P };
    const col = oscMap((s) => (s > 0 ? hi : s < 0 ? lo : mid), P, tr);
    const layers: Layer[] = [
      circle('glow', Math.max(W, H) * 0.55, {
        x: cx,
        y: cy,
        fill: radial(0.5, 0.5, 0.7, alpha(p.accent, 0.14), alpha(p.accent, 0)),
        scale: loopOsc(1, 0.08, dur, 1, 0),
      }),
    ];
    const maxD = Math.hypot(W / 2, H / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = (c + 0.5) * gx;
        const py = (r + 0.5) * gy;
        const d = radialWave ? Math.hypot(px - cx, py - cy) / maxD : (px / W + py / H) / 2;
        const dt = d * P * 1.25;
        const id = `cell-${r}-${c}`;
        let L: Layer;
        if (mode === 'dot') {
          L = circle(id, cell * 0.3, { x: px, y: py, fill: col, scale: osc(0.6, 0.4, P, tr) });
        } else if (mode === 'ring') {
          L = ellipse(id, { x: px, y: py, w: cell * 0.6, h: cell * 0.6, stroke: col, strokeWidth: Math.max(1.5, 0.32 * u), scale: osc(0.65, 0.35, P, tr) });
        } else if (mode === 'pill') {
          L = rect(id, { x: px, y: py, w: cell * 0.7, h: cell * 0.17, radius: cell * 0.085, fill: col, rotation: osc(0, 90, P, tr), scale: osc(0.85, 0.15, P, tr) });
        } else {
          const s = cell * 0.42;
          L = rect(id, { x: px, y: py, w: s, h: s, radius: s * 0.12, fill: col, rotation: osc(45, 45, P, tr), scale: osc(0.75, 0.25, P, tr) });
        }
        L.dt = dt;
        layers.push(L);
      }
    }
    layers.push(caption(x, alpha(p.fg, 0.8)));
    return { background: p.bg, layers };
  },
};

// ------------------------------------------------------------------ Flow Lines

const flowLines: Recipe = {
  id: 'flow-lines',
  name: 'Flow Lines',
  category: 'backgrounds',
  tags: ['background', 'loop', 'lines', 'waves', 'flow', 'silk', 'tech', 'seamless'],
  description: 'A ribbon of fine sine lines drifts and breathes while light pulses race along it. Loops seamlessly.',
  duration: 8,
  fields: [BRAND_FIELD],
  variants: [
    { name: 'Ocean', palette: 'ocean', fonts: 'sora', format: 'landscape' },
    { name: 'Cyber', palette: 'cyber', fonts: 'unbounded', format: 'story', copy: { brand: 'Night shift' } },
    { name: 'Arctic', palette: 'arctic', fonts: 'manrope', format: 'square' },
    { name: 'Blush', palette: 'blush', fonts: 'dmserif', format: 'portrait' },
  ],
  build(x) {
    const { u, W, H, p, cy } = x;
    const dur = 8;
    const N = x.pick({ landscape: 18, default: 16 });
    const lam = x.pick({ landscape: W * 0.62, default: W * 0.92 });
    const A = x.pick({ landscape: 12 * u, story: 22 * u, portrait: 16 * u, default: 14 * u });
    const gap = x.pick({ landscape: 2.3 * u, story: 4.6 * u, portrait: 3.3 * u, default: 2.8 * u });
    const pathW = W + lam * 2.05;
    const steps = Math.ceil(pathW / (lam / 20));
    const xTrack = k([-dur, 0], [2 * dur, -3 * lam, 'linear']);
    const layers: Layer[] = [
      ellipse('glow', {
        x: x.cx,
        y: cy,
        w: W * 1.2,
        h: (N * gap + A * 2) * 2.2,
        fill: radial(0.5, 0.5, 0.7, alpha(p.accent, 0.18), alpha(p.accent, 0)),
        scale: loopOsc(1, 0.05, dur, 1, 0),
      }),
    ];
    const lines: { d: string; dt: number; y: Keyframe<number>[] }[] = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const base = cy + (t - 0.5) * gap * (N - 1);
      const amp = A * (0.45 + 0.55 * Math.sin(Math.PI * t));
      const ph = t * 1.5;
      const pts: [number, number][] = [];
      for (let s = 0; s <= steps; s++) {
        const xx = (s / steps) * pathW;
        const k1 = (2 * Math.PI * xx) / lam;
        // Fundamental + second harmonic: both repeat every wavelength, so translating by λ is seamless.
        pts.push([xx, base + amp * Math.sin(k1 + ph) + A * 0.22 * Math.sin(2 * k1 - t * 2.2)]);
      }
      const d = smoothPath(pts);
      const y = osc(0, 1.6 * u, dur, { t0: -dur, t1: 2 * dur, q: 0 });
      const dt = t * dur * 0.5;
      lines.push({ d, dt, y });
      layers.push(
        path(`line-${i}`, d, pathW, H, {
          x: xTrack,
          y,
          ax: 0,
          ay: 0,
          w: pathW,
          h: H,
          stroke: alpha(lerpColor(p.accent, p.accent2, t), 0.35 + 0.5 * Math.sin(Math.PI * t)),
          strokeWidth: (0.16 + 0.2 * Math.sin(Math.PI * t)) * u,
          dt,
        }),
      );
    }
    // Light pulses travelling along a few lines.
    const T = dur / 2;
    const w = 0.06;
    [3, Math.floor(N / 2), N - 4].forEach((li, j) => {
      const L = lines[li];
      const off = j * 1.3;
      const ts: Keyframe<number>[] = [];
      const te: Keyframe<number>[] = [];
      for (let c = -4; c <= 6; c++) {
        const a = c * T + off;
        ts.push({ t: a, v: -w, e: 'hold' }, { t: a + T * 0.999, v: 1, e: 'linear' });
        te.push({ t: a, v: 0, e: 'hold' }, { t: a + T * 0.999, v: 1 + w, e: 'linear' });
      }
      layers.push(
        path(`pulse-${j}`, L.d, pathW, H, {
          x: xTrack,
          y: L.y,
          ax: 0,
          ay: 0,
          w: pathW,
          h: H,
          stroke: shade(p.accent2, 0.55),
          strokeWidth: 0.5 * u,
          trimStart: ts,
          trimEnd: te,
          dt: L.dt,
        }),
      );
    });
    layers.push(caption(x, alpha(p.fg, 0.8)));
    return { background: radial(0.5, 0.5, 0.8, p.bg2, p.bg), layers };
  },
};

// ------------------------------------------------------------------ Drift Particles

const driftParticles: Recipe = {
  id: 'drift-particles',
  name: 'Drift Particles',
  category: 'backgrounds',
  tags: ['background', 'loop', 'particles', 'stars', 'bokeh', 'parallax', 'ambient', 'seamless'],
  description: 'Three depths of particles rise, glow and fade at different speeds for a soft parallax field. Loops seamlessly.',
  duration: 8,
  fields: [BRAND_FIELD],
  variants: [
    { name: 'Midnight', palette: 'midnight', fonts: 'grotesk', format: 'story' },
    { name: 'Royal', palette: 'royal', fonts: 'editorial', format: 'landscape', copy: { brand: 'An evening of firsts' } },
    { name: 'Peach', palette: 'peach', fonts: 'poppins', format: 'square' },
    { name: 'Forest', palette: 'forest', fonts: 'fraunces', format: 'portrait', copy: { brand: 'Summer nights' } },
  ],
  build(x) {
    const { u, W, H, p } = x;
    const dur = 8;
    const S = Math.max(W, H);
    const a = Math.sqrt((W * H) / (1080 * 1080));
    const r = x.rand;
    const layers: Layer[] = [];
    // Nebula: two soft glows on slow closed orbits.
    [
      { c: p.accent, fx: 0.3, fy: 0.35, rad: 0.42, orb: 0.1, dir: 1 },
      { c: p.accent2, fx: 0.72, fy: 0.68, rad: 0.38, orb: 0.12, dir: -1 },
    ].forEach((n, i) =>
      layers.push(
        group(
          `nebula-${i}`,
          [circle(`nebula-${i}-c`, n.rad * S, { x: n.orb * S, y: 0, fill: radial(0.5, 0.5, 0.707, alpha(n.c, 0.22), alpha(n.c, 0.08), alpha(n.c, 0)) })],
          { x: n.fx * W, y: n.fy * H, w: 1, h: 1, ax: 0, ay: 0, rotation: k([0, i * 140], [dur, i * 140 + 360 * n.dir, 'linear']) },
        ),
      ),
    );
    const depths = [
      { id: 'far', n: Math.round(34 * a), life: dur / 2, rise: 3.5 * u, size: [0.16, 0.3], peak: [0.35, 0.9], sway: 0.4 * u },
      { id: 'mid', n: Math.round(16 * a), life: dur / 2, rise: 8 * u, size: [0.35, 0.6], peak: [0.5, 0.95], sway: 1 * u },
      { id: 'near', n: Math.round(7 * a), life: dur / 2, rise: 18 * u, size: [1.4, 3.0], peak: [0.6, 0.95], sway: 2.2 * u },
    ];
    depths.forEach((dp) => {
      for (let i = 0; i < dp.n; i++) {
        const x0 = rr(r, 0, W);
        const y0 = rr(r, 0, H);
        const Pl = dp.life;
        const dt = rr(r, 0, Pl);
        const peak = rr(r, dp.peak[0], dp.peak[1]);
        const yTrack: Keyframe<number>[] = [];
        for (let c = -1; c <= Math.ceil(dur / Pl); c++) {
          yTrack.push({ t: c * Pl, v: y0 + dp.rise / 2, e: 'hold' }, { t: (c + 1) * Pl - 0.001, v: y0 - dp.rise / 2, e: 'linear' });
        }
        const span = { t0: -Pl, t1: dur, q: 3 };
        const common = {
          x: osc(x0, dp.sway, Pl, { t0: -Pl, t1: dur, q: i % 2 ? 0 : 2 }),
          y: yTrack,
          opacity: oscMap((s) => (peak * (1 + s)) / 2, Pl, span),
          dt,
        };
        const id = `${dp.id}-${i}`;
        const rad = rr(r, dp.size[0], dp.size[1]) * u;
        if (dp.id === 'far') {
          layers.push(circle(id, rad, { ...common, fill: p.fg }));
        } else if (dp.id === 'mid') {
          layers.push(circle(id, rad, { ...common, fill: i % 3 === 0 ? p.accent2 : p.fg }));
        } else if (i % 3 === 2) {
          layers.push(
            path(id, starPath(4, 0.26), 100, 100, {
              ...common,
              w: rad * 2.2,
              h: rad * 2.2,
              fill: shade(p.accent2, 0.4),
              rotation: k([-Pl, 0], [dur, (90 * (dur + Pl)) / Pl, 'linear']),
            }),
          );
        } else {
          const c = i % 2 ? p.accent : p.accent2;
          layers.push(circle(id, rad, { ...common, fill: radial(0.5, 0.5, 0.707, alpha(shade(c, 0.3), 0.95), alpha(c, 0.45), alpha(c, 0)) }));
        }
      }
    });
    layers.push(caption(x, alpha(p.fg, 0.8)));
    return { background: radial(0.5, 0.42, 0.9, p.bg2, p.bg), layers };
  },
};

export const backgroundRecipes: Recipe[] = [meshLoop, pulseGrid, flowLines, driftParticles];
