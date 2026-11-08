/**
 * Shared helpers for the motion pack:
 *  - deterministic text measurement / fitting from measured glyph tables
 *  - exact-sine oscillators and wrap-around drifts for seamless loops
 *  - small path utilities
 */
import type { Ease, Keyframe } from '../../../engine/types';
import { luminance } from '../../../engine/color';
import type { Ctx } from '../../kit';
import { GLYPHS, VMETRICS, WIDTHS } from './metrics';

// ------------------------------------------------------------------ measurement

const B64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const tables = new Map<string, Map<string, number>>();
const GLYPH_LIST = Array.from(GLYPHS);

export interface FontRef {
  family: string;
  weight: number;
}

function nearestKey(family: string, weight: number, src: Record<string, unknown>): string | undefined {
  const exact = `${family}|${weight}`;
  if (exact in src) return exact;
  const cands = Object.keys(src).filter((key) => key.startsWith(family + '|'));
  if (!cands.length) return undefined;
  cands.sort((a, b) => Math.abs(+a.split('|')[1] - weight) - Math.abs(+b.split('|')[1] - weight));
  return cands[0];
}

function tableFor(f: FontRef): Map<string, number> {
  const id = `${f.family}|${f.weight}`;
  let t = tables.get(id);
  if (t) return t;
  const key = nearestKey(f.family, f.weight, WIDTHS) ?? 'Inter|700';
  const src = WIDTHS[key];
  t = new Map();
  for (let i = 0; i < GLYPH_LIST.length; i++) {
    t.set(GLYPH_LIST[i], (B64.indexOf(src[i * 2]) * 64 + B64.indexOf(src[i * 2 + 1])) / 1000);
  }
  tables.set(id, t);
  return t;
}

function glyphW(t: Map<string, number>, g: string): number {
  return t.get(g) ?? t.get('n') ?? 0.56;
}

/** Width (px) of one word (no spaces), matching the engine's word measure. */
function wordWidth(f: FontRef, word: string, size: number, tracking: number): number {
  const t = tableFor(f);
  const gs = Array.from(word);
  let w = 0;
  for (const g of gs) w += glyphW(t, g);
  return (w + tracking * Math.max(0, gs.length - 1)) * size;
}

export interface Wrapped {
  lines: string[];
  widths: number[];
  /** Widest line. */
  w: number;
}

/** Emulates the engine's greedy wrap (src/engine/text.ts) with measured widths. */
export function wrapText(f: FontRef, text: string, size: number, tracking = 0, wrapW?: number): Wrapped {
  const t = tableFor(f);
  const spaceW = (glyphW(t, ' ') + tracking) * size;
  const lines: string[] = [];
  const widths: number[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(/ +/).filter((s, _i, arr) => s.length > 0 || arr.length === 1);
    let cur: string[] = [];
    let curW = 0;
    const flush = () => {
      lines.push(cur.join(' '));
      widths.push(curW);
      cur = [];
      curW = 0;
    };
    for (const wd of words) {
      const ww = wordWidth(f, wd, size, tracking);
      const add = cur.length ? spaceW + ww : ww;
      if (wrapW !== undefined && cur.length && curW + add > wrapW + 0.5) flush();
      curW = cur.length ? curW + spaceW + ww : ww;
      cur.push(wd);
    }
    flush();
  }
  return { lines, widths, w: Math.max(0, ...widths) };
}

/** Width (px) of the inter-word gap, as the engine lays it out. */
export function spaceWidth(f: FontRef, size: number, tracking = 0): number {
  return (glyphW(tableFor(f), ' ') + tracking) * size;
}

/** Single-run width in px (spaces included). */
export function runWidth(f: FontRef, s: string, size: number, tracking = 0): number {
  return wrapText(f, s, size, tracking).w;
}

/** Per-character right edges (px from the run start) — for carets that follow typing. */
export function charEdges(f: FontRef, s: string, size: number, tracking = 0): number[] {
  const t = tableFor(f);
  const out: number[] = [];
  let x = 0;
  for (const g of Array.from(s)) {
    x += glyphW(t, g) * size;
    out.push(x);
    x += tracking * size;
  }
  return out;
}

export function vmetrics(f: FontRef): { asc: number; desc: number; cap: number; xh: number } {
  const key = nearestKey(f.family, f.weight, VMETRICS);
  const m = key ? VMETRICS[key] : [970, 250, 720, 530];
  return { asc: m[0] / 1000, desc: m[1] / 1000, cap: m[2] / 1000, xh: m[3] / 1000 };
}

/**
 * Offset (px) from a text line box's centre to the visual centre of its capitals.
 * Place a single-line uppercase layer at `y - capShift(...)` to centre the caps on y.
 */
export function capShift(f: FontRef, size: number): number {
  const m = vmetrics(f);
  return ((m.asc - m.desc) / 2 - m.cap / 2) * size;
}

export const displayFont = (x: Ctx): FontRef => ({ family: x.f.display, weight: x.f.displayWeight });
export const bodyFont = (x: Ctx, weight?: number): FontRef => ({ family: x.f.body, weight: weight ?? x.f.bodyWeight });

export interface Fit extends Wrapped {
  /** Nominal size to pass to x.title (displayScale is applied by the kit). */
  size: number;
  /** Rendered px size. */
  px: number;
  /** Rendered block height (lines × line height). */
  h: number;
  /** Wrap width to give the layer (narrowest width keeping the line count when balanced). */
  wrapW: number;
}

/** Narrowest wrap width (≤ maxW) that keeps `text` in the same number of lines — avoids orphans. */
function balancedWidth(f: FontRef, text: string, px: number, tr: number, maxW: number): number {
  const n = wrapText(f, text, px, tr, maxW).lines.length;
  if (n <= 1) return maxW;
  const words = text.split(/\s+/).filter(Boolean);
  const widest = Math.max(...words.map((w) => wordWidth(f, w, px, tr)));
  let lo = Math.max(widest, maxW / n);
  let hi = maxW;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    if (wrapText(f, text, px, tr, mid).lines.length <= n) hi = mid;
    else lo = mid;
  }
  return Math.min(maxW, hi + 1);
}

function finishFit(f: FontRef, s: string, size: number, px: number, tr: number, lh: number, maxW: number, balance: boolean, wrap = true): Fit {
  const wrapW = balance && wrap ? balancedWidth(f, s, px, tr, maxW) : maxW;
  const wr = wrapText(f, s, px, tr, wrap ? wrapW : undefined);
  return { ...wr, size, px, h: wr.lines.length * px * lh, wrapW };
}

/**
 * Largest display size (nominal, ≤ max) such that `text` wraps inside maxW without any word overflowing,
 * in at most maxLines lines and at most maxH tall.
 */
export function fitTitle(
  x: Ctx,
  text: string,
  o: {
    maxW: number;
    max: number;
    maxH?: number;
    maxLines?: number;
    lineHeight?: number;
    tracking?: number;
    upper?: boolean;
    min?: number;
    wrap?: boolean;
    balance?: boolean;
  },
): Fit {
  const f = displayFont(x);
  const ds = x.f.displayScale;
  const tr = o.tracking ?? x.f.displayTracking;
  const lh = o.lineHeight ?? 1.02;
  const s = o.upper ? text.toUpperCase() : text;
  const words = s.split(/\s+/).filter(Boolean);
  const min = o.min ?? o.max * 0.15;
  const wrap = o.wrap !== false;
  let size = o.max;
  for (let i = 0; i < 80; i++) {
    const px = size * ds;
    const wr = wrapText(f, s, px, tr, wrap ? o.maxW : undefined);
    const widest = Math.max(wr.w, ...words.map((w) => wordWidth(f, w, px, tr)));
    const h = wr.lines.length * px * lh;
    const ok = widest <= o.maxW && (o.maxH === undefined || h <= o.maxH) && (o.maxLines === undefined || wr.lines.length <= o.maxLines);
    if (ok || size <= min) break;
    size *= 0.97;
  }
  return finishFit(f, s, size, size * ds, tr, lh, o.maxW, !!o.balance, wrap);
}

/** Same as fitTitle but for the body face (size is rendered px). */
export function fitBody(
  x: Ctx,
  text: string,
  o: { maxW: number; max: number; maxH?: number; maxLines?: number; lineHeight?: number; tracking?: number; upper?: boolean; weight?: number; min?: number; balance?: boolean },
): Fit {
  const f = bodyFont(x, o.weight);
  const tr = o.tracking ?? 0;
  const lh = o.lineHeight ?? 1.35;
  const s = o.upper ? text.toUpperCase() : text;
  const words = s.split(/\s+/).filter(Boolean);
  const min = o.min ?? o.max * 0.4;
  let size = o.max;
  for (let i = 0; i < 60; i++) {
    const wr = wrapText(f, s, size, tr, o.maxW);
    const widest = Math.max(wr.w, ...words.map((w) => wordWidth(f, w, size, tr)));
    const h = wr.lines.length * size * lh;
    const ok = widest <= o.maxW && (o.maxH === undefined || h <= o.maxH) && (o.maxLines === undefined || wr.lines.length <= o.maxLines);
    if (ok || size <= min) break;
    size *= 0.97;
  }
  return finishFit(f, s, size, size, tr, lh, o.maxW, !!o.balance);
}

// ------------------------------------------------------------------ tracks

const QS = [0, 1, 0, -1];

/**
 * Exact sine oscillation built from quarter-period keyframes: `outSine` into peaks, `inSine` into
 * zero crossings, so velocity is continuous. Phase `q` is in quarter turns. Spans [t0, t1].
 */
export function osc(base: number, amp: number, period: number, o: { t1: number; t0?: number; q?: number }): Keyframe<number>[] {
  return oscMap((s) => base + amp * s, period, o);
}

/** Generic oscillator: `at(s)` maps the sine value s ∈ {-1, 0, 1} at each quarter to a keyframe value. */
export function oscMap<T>(at: (s: number) => T, period: number, o: { t1: number; t0?: number; q?: number }): Keyframe<T>[] {
  const t0 = o.t0 ?? 0;
  const q = ((o.q ?? 0) % 4 + 4) % 4;
  const step = period / 4;
  const n = Math.max(1, Math.round((o.t1 - t0) / step));
  const out: Keyframe<T>[] = [];
  for (let i = 0; i <= n; i++) {
    const qi = (q + i) % 4;
    const kf: Keyframe<T> = { t: t0 + i * step, v: at(QS[qi]) };
    if (i > 0) kf.e = qi % 2 === 1 ? 'outSine' : 'inSine';
    out.push(kf);
  }
  return out;
}

/** Seamless loop oscillation: whole `cycles` over [0, dur]. */
export const loopOsc = (base: number, amp: number, dur: number, cycles = 1, q = 0) => osc(base, amp, dur / cycles, { t1: dur, q });

/**
 * Wrap-around linear drift for loops: value moves by `dist` over [0, dur] and wraps inside [lo, hi).
 * `dist` should be a whole multiple of (hi - lo) for a seamless loop; jumps happen at the edges (off screen).
 */
export function wrapDrift(v0: number, lo: number, hi: number, dist: number, dur: number): Keyframe<number>[] {
  const speed = dist / dur;
  const out: Keyframe<number>[] = [{ t: 0, v: v0 }];
  let v = v0;
  let t = 0;
  const eps = 1e-4;
  for (let guard = 0; guard < 64; guard++) {
    const edge = speed < 0 ? lo : hi;
    const tEdge = t + (edge - v) / speed;
    if (tEdge >= dur - eps) break;
    out.push({ t: tEdge, v: edge, e: 'linear' });
    v = speed < 0 ? hi : lo;
    t = tEdge + eps;
    out.push({ t, v, e: 'linear' });
  }
  out.push({ t: dur, v: v + speed * (dur - t), e: 'linear' });
  return out;
}

/** Step track: value v0, then jumps to each value at its time ('hold'). */
export function steps<T>(v0: T, ...rest: [number, T][]): Keyframe<T>[] {
  return [{ t: 0, v: v0 }, ...rest.map(([t, v]) => ({ t, v, e: 'hold' as Ease }))];
}

/** Caret blink: on/off every `half` seconds from t0 to t1 (steady before t0). */
export function blink(t0: number, t1: number, half = 0.42): Keyframe<number>[] {
  const out: [number, number][] = [];
  let on = false;
  for (let t = t0; t < t1; t += half) {
    out.push([t, on ? 1 : 0]);
    on = !on;
  }
  return steps(1, ...out);
}

// ------------------------------------------------------------------ paths

const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

/** Catmull-Rom spline through points as cubic Béziers. */
export function smoothPath(pts: [number, number][], closed = false): string {
  const n = pts.length;
  if (n < 2) return '';
  const P = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1);
    const p1 = P(i);
    const p2 = P(i + 1);
    const p3 = P(i + 2);
    d += ` C${n1(p1[0] + (p2[0] - p0[0]) / 6)} ${n1(p1[1] + (p2[1] - p0[1]) / 6)} ${n1(p2[0] - (p3[0] - p1[0]) / 6)} ${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return closed ? d + ' Z' : d;
}

// ------------------------------------------------------------------ colour

/** True when the palette background is light. */
export const isLight = (c: string) => luminance(c) > 0.35;

/** Pick whichever of two colours is darker / lighter. */
export const darker = (a: string, b: string) => (luminance(a) <= luminance(b) ? a : b);
export const lighter = (a: string, b: string) => (luminance(a) > luminance(b) ? a : b);

/** Deterministic shuffle-free random helper in [a, b). */
export const rr = (r: () => number, a: number, b: number) => a + r() * (b - a);

/** Split copy into sentences at . ! ? … (keeps the punctuation). */
export function sentences(text: string): string[] {
  const out: string[] = [];
  let cur: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    cur.push(w);
    if (/[.!?…]$/.test(w)) {
      out.push(cur.join(' '));
      cur = [];
    }
  }
  if (cur.length) out.push(cur.join(' '));
  return out;
}

/**
 * fitTitle that prefers one sentence per line ("Fewer meetings. / More making.") when that keeps the type
 * at ≥ 60% of the max size; otherwise a normal (balanced) fit. Use the returned `text` for the layer.
 */
export function fitTitleSentences(x: Ctx, text: string, o: Parameters<typeof fitTitle>[2]): Fit & { text: string } {
  const sents = text.includes('\n') ? [] : sentences(text);
  if (sents.length > 1) {
    const t2 = sents.join('\n');
    const keep = fitTitle(x, t2, { ...o, maxLines: Math.min(o.maxLines ?? 99, sents.length), min: o.max * 0.6, balance: false });
    if (keep.lines.length <= sents.length && keep.w <= o.maxW && (o.maxH === undefined || keep.h <= o.maxH)) return { ...keep, text: t2 };
  }
  return { ...fitTitle(x, text, o), text };
}
