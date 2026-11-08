/**
 * Shared building blocks for the carousel pack.
 *
 * Carousel scenes are `slides × 1080` wide and 1350 tall. Every slide is
 * exported as its own video, so helpers here always work per slide (index
 * `i`, left edge `i × slideW`) and start animating near t = 0. Elements that
 * cross seams (lines, ribbons) are split into per-slide pieces that animate
 * simultaneously, so the panorama stays continuous at every frame.
 */
import type { Anim, Counter, Ease, EllipseLayer, GroupLayer, Layer, Paint, PathLayer, TextAnim, TextLayer } from '../../../engine/types';
import { contrast, luminance } from '../../../engine/color';
import type { Palette } from '../../catalog';
import { type Ctx, type TextOpts, rect, circle, group, path, k, fadeIn, bob, alpha, shade, radial, ICONS } from '../../kit';

type GroupOpts = Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>;
type PathOpts = Partial<Omit<PathLayer, 'type' | 'id' | 'd' | 'vw' | 'vh'>>;

/** Extra 24×24 icon paths not in the kit. */
export const XICONS: Record<string, string> = {
  close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  arrowUp: 'M12 20V5M6 11l6-6 6 6',
  arrowDown: 'M12 4v15M6 13l6 6 6-6',
  arrowUpRight: 'M6.5 17.5l11-11M8.5 6.5h9v9',
  flag: 'M5.5 21V4M5.5 4.5h12l-2.6 4 2.6 4h-12',
  pin: 'M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.6a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2z',
  layers: 'M12 3.5l9 4.8-9 4.8-9-4.8zM3 12.3l9 4.8 9-4.8M3 16.2l9 4.8 9-4.8',
  pen: 'M4 20l1.2-4.6L15.6 5a2.1 2.1 0 0 1 3 3L8.2 18.4zM13.8 6.8l3 3',
  wallet: 'M3.5 7.5h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-15zM3.5 7.5V6a2 2 0 0 1 2-2h11M16 14h2',
  chart: 'M4 20.5h16M7 17v-5M11.5 17V8M16 17v-8',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5',
  ticket: 'M3.5 7h17v3a2 2 0 0 0 0 4v3h-17v-3a2 2 0 0 0 0-4zM14 7v10',
  swap: 'M7 7h12M15 3l4 4-4 4M17 17H5M9 13l-4 4 4 4',
  chev: 'M9 5l7 7-7 7',
};

export function iconD(name: string): string {
  return ICONS[name] ?? XICONS[name] ?? ICONS.sparkle;
}

/** Filled block quote mark (24×24). */
export const QUOTE_D =
  'M3 19.5v-6.3C3 8.5 5.3 5.3 9.7 4l1 2.2C8.4 7.1 7.2 8.8 7.1 11.2h3.7v8.3zM13.2 19.5v-6.3c0-4.7 2.3-7.9 6.7-9.2l1 2.2c-2.3.9-3.5 2.6-3.6 5H21v8.3z';

/** Left edge of slide `i`. */
export const slideX = (x: Ctx, i: number) => i * x.slideW;

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Average glyph width (em) of each display face, used to keep wide faces from overflowing. */
const DISPLAY_CHAR_W: Record<string, number> = {
  grotesk: 0.55,
  sora: 0.6,
  serif: 0.42,
  editorial: 0.52,
  space: 0.56,
  mono: 0.6,
  syne: 0.75,
  archivo: 0.66,
  outfit: 0.53,
  dmserif: 0.48,
  manrope: 0.57,
  unbounded: 0.78,
  anton: 0.42,
  fraunces: 0.58,
  poppins: 0.6,
};

/** Title size adjusted down for wide display faces (never up). */
export function tsz(x: Ctx, size: number): number {
  const w = (DISPLAY_CHAR_W[x.f.id] ?? 0.56) * x.f.displayScale;
  return size * Math.min(1, 0.56 / w);
}

/** Rough text width estimate (fonts are not measured at build time). */
export function estW(label: string, size: number, upper = false, tracking = 0): number {
  return label.length * size * ((upper ? 0.68 : 0.54) + tracking);
}

export const isDark = (p: Palette) => luminance(p.bg) < 0.3;

/** Accent when it reads on `bg`, otherwise the foreground colour. */
export const accentOn = (p: Palette, bg: string, min = 2.6) => (contrast(p.accent, bg) >= min ? p.accent : p.fg);

/** A soft drop-shadow colour derived from the background. */
export const shadowCol = (p: Palette, a = 0.28) => alpha(shade(p.bg, -0.75), isDark(p) ? 0.55 : a);

/** Stroke icon from the kit set (or XICONS). */
export function icon(id: string, name: string, o: PathOpts & { size: number; color: Anim<string>; sw?: number }): PathLayer {
  const { size, color, sw = 2, ...rest } = o;
  return path(id, iconD(name), 24, 24, { w: size, h: size, stroke: color, strokeWidth: sw, ...rest });
}

/** Filled star. */
export function star(id: string, o: PathOpts & { size: number; color: string }): PathLayer {
  const { size, color, ...rest } = o;
  return path(id, ICONS.star, 24, 24, { w: size, h: size, fill: color, ...rest });
}

/** Soft radial glow. */
export function glow(id: string, r: number, o: Partial<Omit<EllipseLayer, 'type' | 'id'>> & { color: string; a?: number }) {
  const { color, a = 0.22, ...rest } = o;
  return circle(id, r, { fill: radial(0.5, 0.5, 0.7, alpha(color, a), alpha(color, 0)), ...rest });
}

/** Word fade-up, the default body-copy entrance. */
export const fadeUp = (start: number, o: Partial<TextAnim> = {}): TextAnim => ({
  by: 'word',
  start,
  dur: 0.7,
  stagger: 0.025,
  ease: 'outCubic',
  from: { y: 0.6, opacity: 0 },
  ...o,
});

/** Slide up + fade for a group/layer (returns y and opacity tracks). */
export function enter(y: number, t0: number, dist: number, d = 0.8, e: Ease = 'outExpo') {
  return { y: k<number>([t0, y + dist], [t0 + d, y, e]), opacity: fadeIn(t0, d * 0.5) };
}

export interface ChipOpts extends GroupOpts {
  x: Anim<number>;
  y: Anim<number>;
  size: number;
  fill: Paint;
  color: string;
  upper?: boolean;
  tracking?: number;
  weight?: number;
  icon?: string;
  iconColor?: string;
  stroke?: string;
  minW?: number;
  padX?: number;
}

/** Pill chip with optional leading icon. Anchored left-centre by default (ax 0, ay 0.5). */
export function chip(x: Ctx, id: string, label: string, o: ChipOpts): GroupLayer {
  const { size, fill, color, upper = false, tracking = 0, weight = 700, icon: ic, iconColor, stroke, minW = 0, padX = 1.15, ...rest } = o;
  const tw = estW(label, size, upper, tracking);
  const pad = size * padX;
  const iw = ic ? size * 1.7 : 0;
  const w = Math.max(minW, tw + pad * 2 + iw);
  const h = size * 2.4;
  const children: Layer[] = [
    rect(id + '-bg', {
      x: 0,
      y: 0,
      ax: 0,
      ay: 0,
      w,
      h,
      radius: h / 2,
      fill,
      ...(stroke ? { stroke, strokeWidth: size * 0.11 } : {}),
    }),
  ];
  if (ic) children.push(icon(id + '-ic', ic, { x: pad + size * 0.55, y: h / 2, size: size * 1.3, color: iconColor ?? color, sw: 2.4 }));
  children.push(
    x.body(id + '-t', label, {
      size,
      x: ic ? pad + iw + (w - pad * 2 - iw) / 2 : w / 2,
      y: h / 2,
      weight,
      fill: color,
      uppercase: upper,
      tracking,
      lineHeight: 1,
    }),
  );
  return group(id, children, { w, h, ax: 0, ay: 0.5, ...rest });
}

/** Chip width (for laying chips out in a row). */
export function chipW(label: string, size: number, o: { upper?: boolean; tracking?: number; icon?: boolean; padX?: number } = {}) {
  return estW(label, size, o.upper, o.tracking ?? 0) + size * (o.padX ?? 1.15) * 2 + (o.icon ? size * 1.7 : 0);
}

/** Dot pager for slide `i`; the active dot stretches in. */
export function dots(x: Ctx, i: number, o: { y: number; on: string; off: string; t0?: number; cx?: number; size?: number; prefix?: string }): Layer[] {
  const { u, slides: n, slideW: S } = x;
  const d = (o.size ?? 1.25) * u;
  const gap = d * 2.6;
  const cx = slideX(x, i) + (o.cx ?? S / 2);
  const t0 = o.t0 ?? 0.25;
  const out: Layer[] = [];
  for (let j = 0; j < n; j++) {
    const active = j === i;
    out.push(
      rect(`${o.prefix ?? 'pg'}-${i}-${j}`, {
        x: cx + (j - (n - 1) / 2) * gap,
        y: o.y,
        w: active ? k([t0, d], [t0 + 0.6, d * 2.2, 'outExpo']) : d,
        h: d,
        radius: d / 2,
        fill: active ? o.on : o.off,
        opacity: fadeIn(t0 - 0.1 + j * 0.03, 0.4),
      }),
    );
  }
  return out;
}

/** Segmented progress bar for slide `i` (cheaper than dots on long carousels). */
export function progress(x: Ctx, i: number, o: { y: number; on: string; off: string; t0?: number; w?: number; prefix?: string }): Layer[] {
  const { u, slides: n, slideW: S } = x;
  const w = o.w ?? 30 * u;
  const X = slideX(x, i) + (S - w) / 2;
  const t0 = o.t0 ?? 0.2;
  const id = o.prefix ?? 'pb';
  return [
    rect(`${id}-bg-${i}`, { x: X, y: o.y, ax: 0, w, h: 0.9 * u, radius: 0.45 * u, fill: o.off, opacity: fadeIn(0.05, 0.4) }),
    rect(`${id}-fg-${i}`, {
      x: X,
      y: o.y,
      ax: 0,
      w: k([t0, Math.max(0.01, (w * i) / n)], [t0 + 1, (w * (i + 1)) / n, 'inOutCubic']),
      h: 0.9 * u,
      radius: 0.45 * u,
      fill: o.on,
    }),
  ];
}

/** "Swipe →" pill. Anchored right-centre by default. */
export function swipeCue(
  x: Ctx,
  id: string,
  o: { x: number; y: number; bg: Paint; fg: string; label?: string; t0?: number; ax?: number; dur: number; stroke?: string },
): GroupLayer {
  const u = x.u;
  const label = o.label ?? 'Swipe';
  const size = 3.1 * u;
  const tw = estW(label, size);
  const h = 7.6 * u;
  const w = tw + 13 * u;
  const t0 = o.t0 ?? 0.9;
  return group(
    id,
    [
      rect(id + '-bg', {
        x: 0,
        y: 0,
        ax: 0,
        ay: 0,
        w,
        h,
        radius: h / 2,
        fill: o.bg,
        ...(o.stroke ? { stroke: o.stroke, strokeWidth: 0.25 * u } : {}),
      }),
      x.body(id + '-t', label, { size, x: 3.6 * u, y: h / 2, ax: 0, align: 'left', weight: 700, fill: o.fg, lineHeight: 1 }),
      path(id + '-arrow', ICONS.arrowRight, 24, 24, {
        x: k([0, w - 5 * u], [t0 + 0.6, w - 5 * u], ...bobFrames(w - 5 * u, 0.9 * u, t0 + 0.6, o.dur)),
        y: h / 2,
        w: 4.2 * u,
        h: 4.2 * u,
        stroke: o.fg,
        strokeWidth: 2.4,
      }),
    ],
    { x: o.x, y: o.y, w, h, ax: o.ax ?? 1, ay: 0.5, scale: k([t0, 0.6], [t0 + 0.6, 1, 'outBack']), opacity: fadeIn(t0, 0.25) },
  );
}

/** Nudge frames (right-and-back) for arrows, starting at t0. */
function bobFrames(base: number, amp: number, t0: number, dur: number): [number, number, Ease][] {
  const out: [number, number, Ease][] = [];
  let t = t0;
  while (t + 0.9 < dur) {
    out.push([t + 0.35, base + amp, 'inOutSine'], [t + 0.9, base, 'inOutSine']);
    t += 1.3;
  }
  return out;
}

export interface SeamLineOpts {
  from?: number;
  to?: number;
  stroke: Anim<string>;
  width: number;
  t0: number;
  dur: number;
  ease?: Ease;
  /** Extra delay per slide (keep tiny: every slide must move from t≈0). */
  stagger?: number;
  step?: number;
  opacity?: Anim<number>;
  cap?: CanvasLineCap;
  /** Static, fully drawn (for ghost tracks). */
  still?: boolean;
}

function polyD(fn: (gx: number) => number, a: number, b: number, ox: number, step: number): string {
  const n = Math.max(2, Math.ceil((b - a) / step));
  let d = '';
  for (let j = 0; j <= n; j++) {
    const gx = a + ((b - a) * j) / n;
    d += `${j ? 'L' : 'M'}${(gx - ox).toFixed(1)} ${fn(gx).toFixed(1)} `;
  }
  return d;
}

/**
 * One continuous line y = fn(globalX) split into per-slide pieces that draw
 * themselves at the same time, so seams always line up.
 */
export function seamLine(x: Ctx, id: string, fn: (gx: number) => number, o: SeamLineOpts): PathLayer[] {
  const { slideW: S, H } = x;
  const from = o.from ?? 0;
  const to = o.to ?? x.W;
  const out: PathLayer[] = [];
  for (let i = 0; i < x.slides; i++) {
    const a = Math.max(from, i * S);
    const b = Math.min(to, (i + 1) * S);
    if (b - a < 1) continue;
    const t0 = o.t0 + (o.stagger ?? 0) * i;
    out.push(
      path(`${id}-${i}`, polyD(fn, a, b, i * S, o.step ?? 16), S, H, {
        x: i * S,
        y: 0,
        w: S,
        h: H,
        ax: 0,
        ay: 0,
        stroke: o.stroke,
        strokeWidth: o.width,
        lineCap: o.cap ?? 'butt',
        ...(o.still ? {} : { trimEnd: k([t0, 0], [t0 + o.dur, 1, o.ease ?? 'inOutCubic']) }),
        ...(o.opacity !== undefined ? { opacity: o.opacity } : {}),
      }),
    );
  }
  return out;
}

/** Dotted route along fn, one filled path per slide. */
export function seamDots(x: Ctx, id: string, fn: (gx: number) => number, o: { from?: number; to?: number; gap: number; r: number; fill: string; opacity?: Anim<number> }): PathLayer[] {
  const { slideW: S, H } = x;
  const from = o.from ?? 0;
  const to = o.to ?? x.W;
  const out: PathLayer[] = [];
  for (let i = 0; i < x.slides; i++) {
    let d = '';
    const start = Math.ceil(Math.max(from, i * S) / o.gap) * o.gap;
    for (let gx = start; gx <= Math.min(to, (i + 1) * S); gx += o.gap) {
      const lx = gx - i * S;
      const y = fn(gx);
      d += `M${(lx + o.r).toFixed(1)} ${y.toFixed(1)}a${o.r} ${o.r} 0 1 0 ${(-2 * o.r).toFixed(1)} 0a${o.r} ${o.r} 0 1 0 ${(2 * o.r).toFixed(1)} 0`;
    }
    if (!d) continue;
    out.push(path(`${id}-${i}`, d, S, H, { x: i * S, y: 0, w: S, h: H, ax: 0, ay: 0, fill: o.fill, ...(o.opacity !== undefined ? { opacity: o.opacity } : {}) }));
  }
  return out;
}

/** Closed area between fn and a baseline, as global path data (one layer spans all slides). */
export function areaD(fn: (gx: number) => number, from: number, to: number, base: number, step = 20): string {
  return polyD(fn, from, to, 0, step) + `L${to.toFixed(1)} ${base.toFixed(1)} L${from.toFixed(1)} ${base.toFixed(1)} Z`;
}

/** Band between two curves (top/bottom), global path data. */
export function bandD(top: (gx: number) => number, bottom: (gx: number) => number, from: number, to: number, step = 20): string {
  let d = polyD(top, from, to, 0, step);
  const n = Math.max(2, Math.ceil((to - from) / step));
  for (let j = n; j >= 0; j--) {
    const gx = from + ((to - from) * j) / n;
    d += `L${gx.toFixed(1)} ${bottom(gx).toFixed(1)} `;
  }
  return d + 'Z';
}

/**
 * Smooth function through waypoints with flat tangents at each point
 * (ease-in-out between them), so peaks and seams stay level.
 */
export function smoothThrough(pts: [number, number][]): (gx: number) => number {
  return (gx) => {
    if (gx <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      if (gx <= x1) {
        const [x0, y0] = pts[i - 1];
        const t = (gx - x0) / Math.max(1e-6, x1 - x0);
        const s = t * t * (3 - 2 * t);
        return y0 + (y1 - y0) * s;
      }
    }
    return pts[pts.length - 1][1];
  };
}

/** Parse "38%", "$410k", "2.4×", "1,200" into a counter. */
export function parseStat(s: string): { prefix: string; value: number; suffix: string; decimals: number; sep: boolean } | null {
  const m = s.trim().match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const num = m[2];
  const value = parseFloat(num.replace(/,/g, ''));
  if (!isFinite(value)) return null;
  const dec = num.includes('.') ? num.split('.')[1].length : 0;
  return { prefix: m[1], value, suffix: m[3], decimals: dec, sep: num.includes(',') };
}

/** Counter for a stat string (falls back to static text when it is not numeric). */
export function statCounter(s: string, start: number, dur: number, ease: Ease = 'outExpo'): Counter | undefined {
  const st = parseStat(s);
  if (!st || (st.value <= 1 && st.decimals === 0)) return undefined;
  return { from: 0, to: st.value, start, dur, ease, decimals: st.decimals, prefix: st.prefix, suffix: st.suffix, separator: st.sep };
}

/** Title text that counts up when the copy is numeric. */
export function statTitle(x: Ctx, id: string, s: string, o: TextOpts & { start: number; dur: number }): TextLayer {
  const { start, dur, ...rest } = o;
  const c = statCounter(s, start, dur);
  return x.title(id, s, { ...rest, ...(c ? { counter: c } : {}) });
}

/** Split a comma/pipe separated field. */
export const list = (s: string, sep = /\s*[,|]\s*/) => s.split(sep).filter((v) => v.length > 0);

/** Ambient drift for a value after `t0` (sine). */
export function ambient(base: number, amp: number, t0: number, dur: number, cycles = 1.5, phase = 0) {
  const b = bob(base, amp, Math.max(0.5, dur - t0), cycles, phase);
  return b.map((f) => ({ ...f, t: f.t + t0 }));
}
