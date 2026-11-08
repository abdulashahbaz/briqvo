/**
 * Shared building blocks for the Product & UI pack: a palette-derived UI theme,
 * deterministic text-width estimates (layout runs before web fonts load),
 * cursor / toggle / checkbox / icon / chart helpers and a responsive heading block.
 */
import type { Anim, Counter, Ease, GroupLayer, Layer, Paint, PathLayer, TextLayer } from '../../../engine/types';
import { sample } from '../../../engine/anim';
import { luminance, parseColor } from '../../../engine/color';
import type { Palette } from '../../catalog';
import { type Ctx, k, rect, circle, group, path, alpha, shade, lerpColor, ICONS, ta } from '../../kit';

// ------------------------------------------------------------------ theme

export interface UI {
  dark: boolean;
  vivid: boolean;
  /** App / page background inside a device or browser. */
  app: string;
  /** Cards and panels on top of `app`. */
  card: string;
  text: string;
  muted: string;
  line: string;
  border: string;
  /** Neutral skeleton fill. */
  soft: string;
  /** Tinted accent fill (chips, highlights). */
  chip: string;
  /** Toggle / checkbox "off" colour. */
  off: string;
  accent: string;
  accent2: string;
  onAccent: string;
  knob: string;
  shadow: string;
}

function saturation(c: string) {
  const { r, g, b } = parseColor(c);
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  return mx === 0 ? 0 : (mx - mn) / mx;
}

export function isVivid(p: Palette) {
  const L = luminance(p.bg);
  return saturation(p.bg) > 0.45 && L > 0.08 && L < 0.75;
}

export function isDark(p: Palette) {
  return !isVivid(p) && luminance(p.bg) < 0.2;
}

/** UI colours that read as real product UI on any palette (light, dark or vivid). */
export function uiTheme(p: Palette): UI {
  if (isVivid(p)) {
    const text = shade(p.bg, -0.84);
    const app = shade(p.bg, 0.9);
    return {
      dark: false,
      vivid: true,
      app,
      card: shade(p.bg, 0.975),
      text,
      muted: lerpColor(text, app, 0.45),
      line: alpha(text, 0.08),
      border: alpha(text, 0.06),
      soft: alpha(text, 0.07),
      chip: alpha(p.bg, 0.13),
      off: alpha(text, 0.18),
      accent: p.bg,
      accent2: shade(p.bg, 0.45),
      onAccent: p.fg,
      knob: shade(p.bg, 0.985),
      shadow: alpha(shade(p.bg, -0.75), 0.3),
    };
  }
  if (luminance(p.bg) < 0.2) {
    return {
      dark: true,
      vivid: false,
      app: p.bg,
      card: p.surface,
      text: p.fg,
      muted: p.muted,
      line: alpha(p.fg, 0.08),
      border: alpha(p.fg, 0.07),
      soft: alpha(p.fg, 0.08),
      chip: alpha(p.accent, 0.16),
      off: alpha(p.fg, 0.2),
      accent: p.accent,
      accent2: p.accent2,
      onAccent: p.onAccent,
      knob: p.fg,
      shadow: alpha(shade(p.bg, -0.7), 0.55),
    };
  }
  return {
    dark: false,
    vivid: false,
    app: lerpColor(p.bg, p.bg2, 0.55),
    card: shade(p.surface, 0.85),
    text: p.fg,
    muted: p.muted,
    line: alpha(p.fg, 0.08),
    border: alpha(p.fg, 0.07),
    soft: alpha(p.fg, 0.07),
    chip: alpha(p.accent, 0.1),
    off: alpha(p.fg, 0.17),
    accent: p.accent,
    accent2: p.accent2,
    onAccent: p.onAccent,
    knob: shade(p.surface, 0.95),
    shadow: alpha(p.fg, 0.14),
  };
}

// ------------------------------------------------------------------ text estimates

/** Average advance (em) per font: [mixed case, caps & digits]. Measured in Chromium. */
const FW: Record<string, [number, number]> = {
  'Bricolage Grotesque': [0.46, 0.55],
  Sora: [0.53, 0.66],
  'Instrument Serif': [0.35, 0.44],
  'Playfair Display': [0.48, 0.62],
  'Space Grotesk': [0.5, 0.58],
  'JetBrains Mono': [0.6, 0.6],
  Syne: [0.8, 1.05],
  'Archivo Black': [0.57, 0.7],
  Archivo: [0.46, 0.62],
  Outfit: [0.46, 0.6],
  'DM Serif Display': [0.46, 0.54],
  'DM Sans': [0.48, 0.58],
  Manrope: [0.5, 0.6],
  Unbounded: [0.65, 0.8],
  Anton: [0.42, 0.45],
  Fraunces: [0.52, 0.67],
  Poppins: [0.52, 0.61],
  Inter: [0.49, 0.62],
};

function sizeOf(s: Anim<number>): number {
  if (typeof s === 'number') return s;
  return s.length ? s[s.length - 1].v : 16;
}

// Relative glyph advances (em) of a neutral grotesque; scaled per font by the table above.
const LOWER: Record<string, number> = {
  a: 0.55, b: 0.6, c: 0.53, d: 0.6, e: 0.56, f: 0.36, g: 0.6, h: 0.58, i: 0.25, j: 0.26, k: 0.53, l: 0.25, m: 0.87,
  n: 0.58, o: 0.58, p: 0.6, q: 0.6, r: 0.38, s: 0.5, t: 0.36, u: 0.58, v: 0.53, w: 0.78, x: 0.52, y: 0.53, z: 0.5,
  ' ': 0.27, '.': 0.27, ',': 0.27, ':': 0.27, ';': 0.27, "'": 0.22, '’': 0.22, '!': 0.28, '-': 0.4, '·': 0.3, '/': 0.4, '(': 0.33, ')': 0.33,
};
const UPPER: Record<string, number> = {
  A: 0.68, B: 0.64, C: 0.7, D: 0.72, E: 0.58, F: 0.56, G: 0.73, H: 0.73, I: 0.27, J: 0.5, K: 0.66, L: 0.54, M: 0.87,
  N: 0.74, O: 0.76, P: 0.62, Q: 0.76, R: 0.64, S: 0.62, T: 0.62, U: 0.72, V: 0.68, W: 0.97, X: 0.67, Y: 0.65, Z: 0.62,
  '$': 0.6, '%': 0.85, '+': 0.6, '&': 0.7, '#': 0.62, '@': 0.95, '×': 0.55, '€': 0.62, '£': 0.62,
};
const REF_MIXED = 'Launch in three clicks with Beacon';
const REF_CAPS = 'MAYA ROSSI PRODUCT DESIGNER';
function rawW(s: string): [number, number] {
  let lo = 0;
  let up = 0;
  for (const ch of s) {
    if (ch in LOWER) lo += LOWER[ch];
    else if (ch in UPPER) up += UPPER[ch];
    else if (/[0-9]/.test(ch)) up += 0.63;
    else lo += 0.55;
  }
  return [lo, up];
}
const scaleCache = new Map<string, [number, number]>();
function fontScale(font: string): [number, number] {
  let sc = scaleCache.get(font);
  if (!sc) {
    const [lo, up] = FW[font] ?? [0.53, 0.65];
    const m = rawW(REF_MIXED);
    const cps = rawW(REF_CAPS);
    // Caps scale from the all-caps sample; lowercase scale from the mixed sample after removing its capitals.
    const capS = (up * REF_CAPS.length - cps[0] * 0) / (cps[0] + cps[1]);
    const loS = (lo * REF_MIXED.length - m[1] * capS) / m[0];
    sc = [loS, capS];
    scaleCache.set(font, sc);
  }
  return sc;
}

export function estWidth(s: string, font: string, size: number, tracking = 0, upper = false): number {
  const str = upper ? s.toUpperCase() : s;
  const n = Array.from(str).length;
  if (!n) return 0;
  if (/Mono/.test(font)) return (n * 0.6 + Math.max(0, n - 1) * tracking) * size * 1.02;
  const [loS, upS] = fontScale(font);
  const [lo, up] = rawW(str);
  return (lo * loS + up * upS + Math.max(0, n - 1) * tracking) * size * 1.03;
}

function finalText(L: TextLayer): string {
  if (!L.counter) return L.text;
  const c = L.counter;
  let s = c.to.toFixed(c.decimals ?? 0);
  if (c.separator !== false) {
    const [i, d] = s.split('.');
    s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '');
  }
  return (c.prefix ?? '') + s + (c.suffix ?? '');
}

/** Estimated single-line width of a text layer. */
export function textW(L: TextLayer): number {
  const lines = finalText(L).split('\n');
  return Math.max(...lines.map((l) => estWidth(l, L.font, sizeOf(L.size), L.tracking ?? 0, !!L.uppercase)));
}

/** Estimated number of wrapped lines for a text layer at a wrap width. */
export function textLines(L: TextLayer, wrapW: number): number {
  const size = sizeOf(L.size);
  const tr = L.tracking ?? 0;
  const up = !!L.uppercase;
  const space = estWidth('a', L.font, size, tr, up) * 0.55;
  let count = 0;
  for (const para of finalText(L).split('\n')) {
    let cur = 0;
    let lines = 1;
    for (const w of para.split(/ +/)) {
      const ww = estWidth(w, L.font, size, tr, up);
      if (cur > 0 && cur + space + ww > wrapW) {
        lines++;
        cur = ww;
      } else cur += (cur > 0 ? space : 0) + ww;
    }
    count += lines;
  }
  return count;
}

function longestWord(L: TextLayer): number {
  const size = sizeOf(L.size);
  return Math.max(0, ...finalText(L).split(/[\s\n]+/).map((w) => estWidth(w, L.font, size, L.tracking ?? 0, !!L.uppercase)));
}

/** Shrink a text layer's (static) size until it fits `maxW` in at most `maxLines` lines. */
export function fit<T extends TextLayer>(L: T, maxW: number, maxLines = 1, minScale = 0.45): T {
  if (typeof L.size !== 'number') return L;
  const s0 = L.size;
  let s = s0;
  const ok = () => {
    L.size = s;
    if (longestWord(L) > maxW) return false;
    if (maxLines <= 1 && L.w === undefined) return textW(L) <= maxW;
    return textLines(L, maxW) <= maxLines;
  };
  while (!ok() && s > s0 * minScale) s *= 0.95;
  L.size = s;
  return L;
}

/** Balanced wrap: narrowest wrap width that keeps the same line count (avoids orphans). Sets L.w. */
export function balance<T extends TextLayer>(L: T, maxW: number): T {
  const n = textLines(L, maxW);
  L.w = maxW;
  if (n > 1) {
    let lo = maxW * 0.35;
    let hi = maxW;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (textLines(L, mid) <= n) hi = mid;
      else lo = mid;
    }
    L.w = Math.min(maxW, hi * 1.08);
  }
  return L;
}

/** Text block height estimate (lines × line height). */
export function blockH(L: TextLayer, wrapW?: number): number {
  const lines = wrapW ? textLines(L, wrapW) : finalText(L).split('\n').length;
  return lines * sizeOf(L.size) * (L.lineHeight ?? 1.15);
}

// ------------------------------------------------------------------ numbers

export interface NumParts {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
  separator: boolean;
}

export function parseNum(s: string): NumParts | null {
  const m = /^([^\d-]*?)(-?[\d,]*\.?\d+)(.*)$/.exec(s.trim());
  if (!m) return null;
  const raw = m[2];
  const value = parseFloat(raw.replace(/,/g, ''));
  if (!isFinite(value)) return null;
  const dot = raw.indexOf('.');
  return { prefix: m[1], value, decimals: dot >= 0 ? raw.length - dot - 1 : 0, suffix: m[3], separator: raw.includes(',') };
}

/** Counter that counts up to the number written in `s` (keeps prefix/suffix); undefined if `s` has no number. */
export function countTo(s: string, start: number, dur: number, fromFrac = 0, e: Ease = 'outCubic'): Counter | undefined {
  const n = parseNum(s);
  if (!n) return undefined;
  const from = n.decimals ? +(n.value * fromFrac).toFixed(n.decimals) : Math.round(n.value * fromFrac);
  return { from, to: n.value, start, dur, ease: e, decimals: n.decimals, prefix: n.prefix, suffix: n.suffix, separator: n.separator };
}

export function numList(s: string, fallback: number[]): number[] {
  const v = s
    .split(/[,;\s]+/)
    .map((t) => parseFloat(t))
    .filter((n) => isFinite(n));
  return v.length >= 2 ? v : fallback;
}

export function strList(s: string, fallback: string[]): string[] {
  const v = s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return v.length >= 2 ? v : fallback;
}

// ------------------------------------------------------------------ primitives

export interface Waypoint {
  t: number;
  x: number;
  y: number;
  e?: Ease;
}

const CURSOR_D = 'M6 3.2v15.9l4.2-4 2.7 6.1 2.9-1.3-2.7-6h5.9z';

/** Pointer that follows waypoints; each click dips the pointer and emits a ripple. */
export function cursor(
  id: string,
  pts: Waypoint[],
  o: { size: number; fill: string; stroke: string; ripple: string; clicks?: number[]; show?: number; shadow?: string },
): Layer[] {
  const X = k<number>(...pts.map((p, i) => [p.t, p.x, i ? p.e ?? 'inOutCubic' : undefined] as [number, number, Ease?]));
  const Y = k<number>(...pts.map((p, i) => [p.t, p.y, i ? p.e ?? 'inOutCubic' : undefined] as [number, number, Ease?]));
  const s = o.size;
  const clicks = o.clicks ?? [];
  const sc: [number, number, Ease?][] = [[0, 1]];
  for (const c of clicks) sc.push([c - 0.08, 1], [c, 0.8, 'outQuad'], [c + 0.28, 1, 'outBack']);
  const show = o.show ?? pts[0].t;
  const ripples = clicks.map((c, i) =>
    circle(`${id}-rip${i}`, s * 0.6, {
      x: sample(X, c, 0),
      y: sample(Y, c, 0),
      stroke: o.ripple,
      strokeWidth: s * 0.07,
      scale: k([c, 0.15], [c + 0.6, 1.2, 'outCubic']),
      opacity: k([c, 0], [c + 0.03, 0.9], [c + 0.6, 0, 'inQuad']),
      start: c,
      end: c + 0.62,
    }),
  );
  const ptr = group(
    id,
    [
      path(id + '-p', CURSOR_D, 24, 24, {
        x: s / 2,
        y: s / 2,
        w: s,
        h: s,
        fill: o.fill,
        stroke: o.stroke,
        strokeWidth: 1.4,
        lineJoin: 'round',
        shadow: o.shadow ? { color: o.shadow, blur: s * 0.18, y: s * 0.06 } : undefined,
      }),
    ],
    { x: X, y: Y, w: s, h: s, ax: 6 / 24, ay: 3.2 / 24, scale: k(...sc), opacity: k([show, 0], [show + 0.25, 1, 'outCubic']) },
  );
  return [...ripples, ptr];
}

/** iOS-style switch that flips on at `at`. Anchored right-centre by default. */
export function toggle(id: string, o: { x: number; y: number; h: number; at: number; ui: UI; ax?: number; ay?: number }): GroupLayer {
  const { h, ui, at } = o;
  const w = h * 1.72;
  const r = h / 2;
  const kr = h * 0.39;
  return group(
    id,
    [
      rect(id + '-trk', { x: 0, y: 0, ax: 0, ay: 0, w, h, radius: r, fill: k<string>([at, ui.off], [at + 0.3, ui.accent, 'outCubic']) }),
      circle(id + '-knob', kr, {
        x: k([at, r], [at + 0.45, w - r, 'outBack']),
        y: h / 2,
        fill: ui.knob,
        shadow: { color: alpha(shade(ui.text, -1), 0.25), blur: h * 0.15, y: h * 0.05 },
      }),
    ],
    { x: o.x, y: o.y, w, h, ax: o.ax ?? 1, ay: o.ay ?? 0.5 },
  );
}

/** Checkbox that fills and draws a tick at `at`. */
export function checkbox(id: string, o: { x: number; y: number; size: number; at: number; ui: UI; round?: boolean; ax?: number; ay?: number }): GroupLayer {
  const { size: s, ui, at } = o;
  const r = o.round ? s / 2 : s * 0.3;
  return group(
    id,
    [
      rect(id + '-box', { x: 0, y: 0, ax: 0, ay: 0, w: s, h: s, radius: r, stroke: ui.off, strokeWidth: s * 0.09 }),
      rect(id + '-fill', { x: s / 2, y: s / 2, w: s, h: s, radius: r, fill: ui.accent, scale: k([at, 0], [at + 0.38, 1, 'outBack']) }),
      path(id + '-tick', ICONS.check, 24, 24, {
        x: s / 2,
        y: s / 2,
        w: s * 0.86,
        h: s * 0.86,
        stroke: ui.onAccent,
        strokeWidth: 3,
        trimEnd: k([at + 0.1, 0], [at + 0.42, 1, 'outCubic']),
      }),
    ],
    { x: o.x, y: o.y, w: s, h: s, ax: o.ax ?? 0, ay: o.ay ?? 0.5 },
  );
}

/** A 24×24 stroke icon from the kit, optionally drawing on over [t0, t0 + d]. */
export function icon(
  id: string,
  name: string,
  o: { x: Anim<number>; y: Anim<number>; size: number; color: string; weight?: number; draw?: [number, number]; fill?: Anim<Paint> } & Partial<Omit<PathLayer, 'type' | 'id' | 'd' | 'vw' | 'vh' | 'fill'>>,
): PathLayer {
  const { size, color, weight = 1.8, draw, fill, ...rest } = o;
  return path(id, ICONS[name] ?? ICONS.sparkle, 24, 24, {
    w: size,
    h: size,
    stroke: color,
    strokeWidth: weight,
    ...(fill !== undefined ? { fill } : {}),
    ...(draw ? { trimEnd: k([draw[0], 0], [draw[0] + draw[1], 1, 'inOutCubic']) } : {}),
    ...rest,
  });
}

// ------------------------------------------------------------------ charts

const f2 = (n: number) => +n.toFixed(2);

/** Smooth Catmull-Rom curve through points, as SVG path data. */
export function smooth(pts: [number, number][], tension = 1): string {
  if (pts.length < 2) return '';
  let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += ` C${f2(c1x)} ${f2(c1y)} ${f2(c2x)} ${f2(c2y)} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return d;
}

/** Map values into a w×h box (y down). `pad` keeps the line off the top/bottom edges. */
export function chartPts(vals: number[], w: number, h: number, pad = 0.08, lo?: number, hi?: number): [number, number][] {
  const mn = lo ?? Math.min(...vals);
  const mx = hi ?? Math.max(...vals);
  const span = mx - mn || 1;
  return vals.map((v, i) => [(i / Math.max(1, vals.length - 1)) * w, h - pad * h - ((v - mn) / span) * h * (1 - pad * 2)]);
}

export function areaPath(pts: [number, number][], h: number, tension = 1): string {
  const last = pts[pts.length - 1];
  return `${smooth(pts, tension)} L${f2(last[0])} ${f2(h)} L${f2(pts[0][0])} ${f2(h)} Z`;
}

/** Deterministic wavy upward series. */
export function series(n: number, seed: number, trend = 1, wobble = 0.35): number[] {
  let s = seed * 9301 + 49297;
  const r = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out: number[] = [];
  let v = 1;
  for (let i = 0; i < n; i++) {
    v += trend * (0.4 + r() * 0.6) + (r() - 0.5) * wobble * 2;
    out.push(v);
  }
  return out;
}

// ------------------------------------------------------------------ device chrome

/** Status bar for phone screens (screen unit q = sw / 100). */
export function statusBar(id: string, x: Ctx, sw: number, color: string, t0 = 0): Layer[] {
  const q = sw / 100;
  const y = 7.6 * q;
  const bars = [0, 1, 2, 3].map((i) =>
    rect(`${id}-sig${i}`, { x: 68 * q + i * 2.1 * q, y: y + 1.5 * q, ax: 0, ay: 1, w: 1.4 * q, h: (1.3 + i * 0.6) * q, radius: 0.3 * q, fill: color }),
  );
  return [
    x.body(`${id}-time`, '9:41', { size: 3.7 * q, x: 18 * q, y, weight: 600, fill: color, opacity: t0 ? k([t0, 0], [t0 + 0.3, 1]) : 1 }),
    ...bars,
    rect(`${id}-bat`, { x: 78.5 * q, y, ax: 0, w: 6.4 * q, h: 3.2 * q, radius: 0.9 * q, stroke: alpha(color, 0.45), strokeWidth: 0.35 * q }),
    rect(`${id}-batf`, { x: 79.3 * q, y, ax: 0, w: 4.4 * q, h: 1.9 * q, radius: 0.45 * q, fill: color }),
  ];
}

/** Home indicator bar at the bottom of a phone screen. */
export function homeBar(id: string, sw: number, sh: number, color: string): Layer {
  const q = sw / 100;
  return rect(id, { x: sw / 2, y: sh - 2.6 * q, w: 34 * q, h: 1.3 * q, radius: 0.65 * q, fill: color });
}

// ------------------------------------------------------------------ heading block

export interface HeadingOpts {
  id?: string;
  eyebrow?: string;
  title: string;
  sub?: string;
  x: number;
  /** Top of the block (or its centre when `vAlign` is 'center'). */
  y: number;
  w: number;
  align?: 'left' | 'center';
  size: number;
  subSize?: number;
  maxLines?: number;
  subLines?: number;
  t0?: number;
  vAlign?: 'top' | 'center' | 'bottom';
  /** Eyebrow as a tinted pill (default) or plain text. */
  pill?: boolean;
  titleColor?: string;
  eyebrowColor?: string;
  subColor?: string;
  gap?: number;
  titleAnim?: 'rise' | 'riseLines' | 'chars' | 'blur';
  balance?: boolean;
}

/** Eyebrow + headline + sub stacked with estimated heights. Returns layers and the block bottom. */
export function heading(x: Ctx, o: HeadingOpts): { layers: Layer[]; top: number; bottom: number; h: number } {
  const { u, p } = x;
  const id = o.id ?? 'hd';
  const align = o.align ?? 'left';
  const t0 = o.t0 ?? 0.2;
  const ax = align === 'left' ? 0 : 0.5;
  const gap = o.gap ?? o.size * 0.42;
  const title = fit(
    x.title(`${id}-title`, o.title, { size: o.size, x: o.x, y: 0, w: o.w, ax, ay: 0, align, fill: o.titleColor ?? p.fg, lineHeight: 1.04 }),
    o.w,
    o.maxLines ?? 3,
  );
  if (o.balance !== false) balance(title, o.w);
  const tH = blockH(title, title.w as number);
  const eyeSize = Math.max(2.3 * u, (title.size as number) * 0.24);
  const eyeH = o.eyebrow ? (o.pill === false ? eyeSize * 1.3 : eyeSize * 2.5) : 0;
  const subSize = o.subSize ?? Math.max(2.8 * u, (title.size as number) * 0.36);
  const sub = o.sub
    ? fit(x.body(`${id}-sub`, o.sub, { size: subSize, x: o.x, y: 0, w: o.w, ax, ay: 0, align, fill: o.subColor ?? p.muted, lineHeight: 1.38 }), o.w, o.subLines ?? 3)
    : null;
  const sH = sub ? blockH(sub, o.w) : 0;
  const h = eyeH + (o.eyebrow ? gap * 0.9 : 0) + tH + (sub ? gap + sH * 0.97 : 0);
  const top = o.vAlign === 'center' ? o.y - h / 2 : o.vAlign === 'bottom' ? o.y - h : o.y;
  const layers: Layer[] = [];
  let cy = top;
  if (o.eyebrow) {
    const col = o.eyebrowColor ?? p.accent;
    const lab = x.body(`${id}-eye`, o.eyebrow, {
      size: eyeSize,
      x: 0,
      y: 0,
      weight: 700,
      uppercase: true,
      tracking: 0.12,
      fill: col,
    });
    if (o.pill === false) {
      Object.assign(lab, { x: o.x, y: cy + eyeH / 2, ax, align, anim: ta.chars(t0, { stagger: 0.02 }) });
      layers.push(lab);
    } else {
      const lw = textW(lab);
      const dot = eyeSize * 0.62;
      const pw = lw + eyeSize * 2.4 + dot;
      const ph = eyeH;
      const px = align === 'left' ? o.x : o.x - pw / 2;
      layers.push(
        group(
          `${id}-eyepill`,
          [
            rect(`${id}-eyebg`, { x: 0, y: 0, ax: 0, ay: 0, w: pw, h: ph, radius: ph / 2, fill: alpha(col, 0.13) }),
            circle(`${id}-eyedot`, dot / 2, { x: eyeSize * 1.0 + dot / 2, y: ph / 2, fill: col }),
            Object.assign(lab, { x: eyeSize * 1.0 + dot + eyeSize * 0.55, y: ph / 2, ax: 0, align: 'left' as const }),
          ],
          { x: px, y: cy, w: pw, h: ph, ax: 0, ay: 0, opacity: k([t0, 0], [t0 + 0.4, 1, 'outCubic']), sx: k([t0, 0.6], [t0 + 0.6, 1, 'outExpo']) },
        ),
      );
    }
    cy += eyeH + gap * 0.9;
  }
  const ta0 = t0 + (o.eyebrow ? 0.15 : 0);
  const anim =
    o.titleAnim === 'chars'
      ? ta.chars(ta0)
      : o.titleAnim === 'blur'
        ? ta.blur(ta0)
        : o.titleAnim === 'riseLines'
          ? ta.riseLines(ta0, { stagger: 0.12 })
          : ta.rise(ta0, { stagger: 0.06 });
  Object.assign(title, { y: cy, anim });
  layers.push(title);
  cy += tH;
  if (sub) {
    cy += gap;
    Object.assign(sub, { y: cy, anim: ta.blur(ta0 + 0.45, { stagger: 0.035, dur: 0.8 }) });
    layers.push(sub);
    cy += sH;
  }
  return { layers, top, bottom: cy, h };
}

/** Rounded pill with centred label (width from an estimate, so text stays centred). */
export function pill(
  x: Ctx,
  id: string,
  label: string,
  o: { x: Anim<number>; y: Anim<number>; size: number; fill: string; color: string; weight?: number; padX?: number; h?: number; ax?: number; ay?: number; upper?: boolean; tracking?: number; minW?: number; display?: boolean } & Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>,
): GroupLayer & { pw: number; ph: number } {
  const { size, fill, color, weight = 600, padX = 1.15, h, ax = 0.5, ay = 0.5, upper, tracking, minW = 0, display, ...rest } = o;
  const base = { size, x: 0, y: 0, fill: color, uppercase: upper, align: 'center' as const };
  const lab = display
    ? x.title(id + '-l', label, { ...base, ...(tracking !== undefined ? { tracking } : {}) })
    : x.body(id + '-l', label, { ...base, weight, tracking: tracking ?? 0 });
  const lw = textW(lab);
  const ph = h ?? size * 2.3;
  const pw = Math.max(minW, lw + size * padX * 2);
  Object.assign(lab, { x: pw / 2, y: ph / 2 + size * 0.02 });
  const g = group(id, [rect(id + '-bg', { x: 0, y: 0, ax: 0, ay: 0, w: pw, h: ph, radius: ph / 2, fill }), lab], {
    ...rest,
    x: o.x,
    y: o.y,
    w: pw,
    h: ph,
    ax,
    ay,
  });
  return Object.assign(g, { pw, ph });
}

/** Soft blurred-looking glow (radial gradient circle, no blur filter). */
export function glow(id: string, o: { x: number; y: number; r: number; color: string; a?: number } & Record<string, unknown>) {
  const { x: gx, y: gy, r, color, a = 0.35, ...rest } = o;
  return circle(id, r, {
    x: gx,
    y: gy,
    fill: { kind: 'radial', cx: 0.5, cy: 0.5, r: 0.72, stops: [{ o: 0, c: alpha(color, a) }, { o: 1, c: alpha(color, 0) }] },
    ...(rest as object),
  });
}

/** Ease-out rise for a block: y offset + fade. */
export function riseIn(t0: number, y: number, dy: number, d = 0.9, e: Ease = 'outExpo') {
  return { y: k([t0, y + dy], [t0 + d, y, e]), opacity: k([t0, 0], [t0 + d * 0.5, 1, 'outCubic']) };
}

/** Small delta chip: arrow + value (e.g. +12.4%). */
export function delta(
  x: Ctx,
  id: string,
  label: string,
  o: { x: number; y: number; size: number; up?: boolean; color: string; fill: string; ax?: number; ay?: number } & Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>,
): GroupLayer & { pw: number; ph: number } {
  const { size, up = true, color, fill, ax = 0, ay = 0.5, ...rest } = o;
  const lab = x.body(id + '-l', label, { size, x: 0, y: 0, ax: 0, align: 'left', weight: 700, fill: color });
  const lw = textW(lab);
  const ph = size * 1.95;
  const ar = size * 1.0;
  const pw = lw + ar + size * 1.55;
  Object.assign(lab, { x: size * 0.62 + ar + size * 0.22, y: ph / 2 });
  const g = group(
    id,
    [
      rect(id + '-bg', { x: 0, y: 0, ax: 0, ay: 0, w: pw, h: ph, radius: ph / 2, fill }),
      path(id + '-ar', up ? 'M12 19V5.5M5.5 12L12 5.5l6.5 6.5' : 'M12 5v13.5M5.5 12l6.5 6.5 6.5-6.5', 24, 24, {
        x: size * 0.62 + ar / 2,
        y: ph / 2,
        w: ar,
        h: ar,
        stroke: color,
        strokeWidth: 3.2,
      }),
      lab,
    ],
    { ...rest, x: o.x, y: o.y, w: pw, h: ph, ax, ay },
  );
  return Object.assign(g, { pw, ph });
}

/** Vertical stack: place blocks of known height top-to-bottom from `top`. Returns y of each block's top. */
export function stack(top: number, items: { h: number; gap?: number }[]): number[] {
  const out: number[] = [];
  let y = top;
  items.forEach((it, i) => {
    if (i > 0) y += it.gap ?? 0;
    out.push(y);
    y += it.h;
  });
  return out;
}

export function stackH(items: { h: number; gap?: number }[]): number {
  return items.reduce((a, it, i) => a + it.h + (i > 0 ? it.gap ?? 0 : 0), 0);
}
