/**
 * Shared helpers for the social pack: text measurement that mirrors the
 * engine's layout (so pills, chips and stacked blocks can be sized at build
 * time, before fonts load), plus reusable pieces — chips, star rows, avatars,
 * confetti and looping tracks.
 */
import type { Anim, Ease, GroupLayer, Keyframe, Layer, Paint, PathLayer, TextAnim, TextLayer } from '../../../engine/types';
import { type Ctx, rect, circle, ellipse, group, path, image, alpha, ICONS } from '../../kit';
import { parseColor } from '../../../engine/color';
import type { Palette } from '../../catalog';
import { CHARS, WIDTHS } from './metrics';

/** Chroma 0..1 (how colourful, independent of lightness). */
export function sat(c: string): number {
  const { r, g, b } = parseColor(c);
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}

/** The palette's most colourful accent (for likes, live dots, highlights). */
export function vivid(p: Palette): string {
  return sat(p.accent) >= 0.25 || sat(p.accent2) < sat(p.accent) ? p.accent : p.accent2;
}

// ---------------------------------------------------------------- metrics

const tables = new Map<string, Map<string, number>>();

function decode(key: string): Map<string, number> {
  let t = tables.get(key);
  if (!t) {
    const enc = WIDTHS[key];
    t = new Map();
    for (let i = 0; i < CHARS.length; i++) t.set(CHARS[i], parseInt(enc.slice(i * 2, i * 2 + 2), 36));
    tables.set(key, t);
  }
  return t;
}

function tableFor(family: string, weight: number): Map<string, number> {
  const exact = `${family}|${weight}`;
  if (WIDTHS[exact]) return decode(exact);
  let best = '';
  let bestD = Infinity;
  for (const key of Object.keys(WIDTHS)) {
    const [fam, w] = key.split('|');
    if (fam !== family) continue;
    const d = Math.abs(Number(w) - weight);
    if (d < bestD) {
      bestD = d;
      best = key;
    }
  }
  return decode(best || 'Inter|500');
}

/** Text style used both for measuring and for building the layer. */
export interface TS {
  role: 'title' | 'body';
  /** Design size in px (title sizes get the font pair's displayScale, like x.title). */
  size: number;
  weight?: number;
  tracking?: number;
  uppercase?: boolean;
  lh?: number;
}

interface Resolved {
  family: string;
  weight: number;
  size: number;
  tracking: number;
  lh: number;
  upper: boolean;
}

export function res(x: Ctx, st: TS): Resolved {
  const t = st.role === 'title';
  return {
    family: t ? x.f.display : x.f.body,
    weight: st.weight ?? (t ? x.f.displayWeight : x.f.bodyWeight),
    size: t ? st.size * x.f.displayScale : st.size,
    tracking: st.tracking ?? (t ? x.f.displayTracking : 0),
    lh: st.lh ?? (t ? 1.02 : 1.35),
    upper: !!st.uppercase,
  };
}

function wordW(r: Resolved, tbl: Map<string, number>, w: string): number {
  let sum = 0;
  let n = 0;
  const fallback = tbl.get('n') ?? 550;
  for (const ch of w) {
    sum += tbl.get(ch) ?? fallback;
    n++;
  }
  return (sum / 1000) * r.size + Math.max(0, n - 1) * r.tracking * r.size;
}

export interface Wrapped {
  lines: string[];
  widths: number[];
  /** Number of lines. */
  n: number;
  /** Widest line. */
  w: number;
  /** Block height (lines × line height). */
  h: number;
  /** Actual font size in px. */
  size: number;
  lineH: number;
  /** Widest single word (cannot wrap). */
  maxWord: number;
}

/** Greedy word wrap identical to the engine's layoutText. */
export function wrap(x: Ctx, s: string, st: TS, maxW?: number): Wrapped {
  const r = res(x, st);
  const tbl = tableFor(r.family, r.weight);
  const str = r.upper ? s.toUpperCase() : s;
  const spaceW = ((tbl.get(' ') ?? 250) / 1000) * r.size + r.tracking * r.size;
  const lines: string[] = [];
  const widths: number[] = [];
  let maxWord = 0;
  for (const para of str.split('\n')) {
    const words = para.split(/ +/).filter((w, _i, arr) => w.length > 0 || arr.length === 1);
    let cur: string[] = [];
    let curW = 0;
    for (const wd of words) {
      const ww = wordW(r, tbl, wd);
      maxWord = Math.max(maxWord, ww);
      const add = cur.length ? spaceW + ww : ww;
      if (maxW !== undefined && cur.length && curW + add > maxW + 0.5) {
        lines.push(cur.join(' '));
        widths.push(curW);
        cur = [];
        curW = 0;
      }
      curW = cur.length ? curW + spaceW + ww : ww;
      cur.push(wd);
    }
    lines.push(cur.join(' '));
    widths.push(curW);
  }
  const lineH = r.size * r.lh;
  return { lines, widths, n: lines.length, w: Math.max(0, ...widths), h: lines.length * lineH, size: r.size, lineH, maxWord };
}

/** Single-line width of `s`. */
export function tw(x: Ctx, s: string, st: TS): number {
  return wrap(x, s, st).w;
}

/** Shrink `st.size` until `s` fits in `maxLines` lines of `maxW` (and no word overflows). */
export function fit(x: Ctx, s: string, st: TS, maxW: number, maxLines = 1, minScale = 0.45): TS {
  let size = st.size;
  const min = st.size * minScale;
  for (let i = 0; i < 40; i++) {
    const wr = wrap(x, s, { ...st, size }, maxW);
    if ((wr.n <= maxLines && wr.maxWord <= maxW) || size <= min) break;
    size *= 0.95;
  }
  return { ...st, size: Math.max(min, size) };
}

export type TOpts = Partial<Omit<TextLayer, 'type' | 'id' | 'text' | 'size' | 'font'>>;

/** Text layer from a style (title → display font, body → body font). */
export function txt(x: Ctx, id: string, s: string, st: TS, o: TOpts = {}): TextLayer {
  const r = res(x, st);
  const base = {
    size: st.size,
    weight: r.weight,
    tracking: r.tracking,
    lineHeight: r.lh,
    ...(st.uppercase ? { uppercase: true } : {}),
    ...o,
  };
  return st.role === 'title' ? x.title(id, s, base) : x.body(id, s, base);
}

// ---------------------------------------------------------------- tracks

/** Sawtooth loop a → b every `period` between t0 and t1 (ripples, shimmer). */
export function cycle(t0: number, t1: number, period: number, a: number, b: number, e: Ease = 'outCubic'): Keyframe<number>[] {
  const out: Keyframe<number>[] = [{ t: 0, v: a }];
  for (let t = t0; t < t1; t += period) {
    out.push({ t: Math.max(t, out[out.length - 1].t + 0.001), v: a });
    out.push({ t: t + period - 0.002, v: b, e });
  }
  return out;
}

/** Smooth ping-pong a ↔ b starting at t0 (pulsing dots, breathing glows). */
export function pulse(t0: number, t1: number, period: number, a: number, b: number): Keyframe<number>[] {
  const out: Keyframe<number>[] = [{ t: 0, v: a }, { t: t0, v: a }];
  let i = 0;
  for (let t = t0 + period / 2; t <= t1 + period / 2; t += period / 2) out.push({ t, v: i++ % 2 === 0 ? b : a, e: 'inOutSine' });
  return out;
}

/** a → b with the given ease starting at t0 (shorthand). */
export const to = (a: number, b: number, t0: number, d: number, e: Ease = 'outExpo'): Keyframe<number>[] => [
  { t: t0, v: a },
  { t: t0 + d, v: b, e },
];

// ---------------------------------------------------------------- icons

/** Extra 24×24 stroke icons used by this pack. */
export const ICON = {
  ...ICONS,
  bulb: 'M9.2 17.5h5.6M10 20.5h4M12 3.5a6 6 0 0 0-3.6 10.8c.7.6 1 1.2 1 2v.2h5.2v-.2c0-.8.3-1.4 1-2A6 6 0 0 0 12 3.5z',
  truck: 'M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3 3.5v3h-7zM6.5 18.5a1.8 1.8 0 1 0 0-.01M17 18.5a1.8 1.8 0 1 0 0-.01',
  download: 'M12 3.5v11.5M6.5 9.5l5.5 5.5 5.5-5.5M4.5 20h15',
  repost: 'M7 7.5h10.5v6M14.5 10.5l3-3 3 3M17 16.5H6.5v-6M9.5 13.5l-3 3-3-3',
  reply: 'M20.5 12a8 8 0 0 1-11.6 7.1L3.5 20.5l1.4-4.6A8 8 0 1 1 20.5 12z',
  copy: 'M8.5 8.5h11v11h-11zM15.5 8.5v-4h-11v11h4',
  pin: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  tag: 'M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3-8.7 8.7zM8 8a.5.5 0 1 0 0 .01',
  video: 'M3.5 6.5h12v11h-12zM15.5 10.5l5-3v9l-5-3z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 19.5c.8-3.3 3.3-5 6.5-5s5.7 1.7 6.5 5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c2 .6 3.2 2.2 3.6 4.7',
};

/** Arrow cursor (filled), 24×24. */
export const CURSOR = 'M5.5 3.2l13.2 7.4-5.9 1.6 3.4 6.3-2.6 1.4-3.4-6.3-4.7 4.1z';

/** Rounded 5-point star, vertically centred in a 100×100 box. */
export function starD(inner = 0.5): string {
  let d = '';
  const dy = 4.8;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 50 : 50 * inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i === 0 ? 'M' : 'L'}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + dy + r * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
}
const STAR = starD(0.5);

/** Many-pointed burst (stickers, badges), 100×100. */
export function burstD(points = 16, inner = 0.82): string {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 50 : 50 * inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    d += `${i === 0 ? 'M' : 'L'}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)} `;
  }
  return d + 'Z';
}

/** Icon layer from a 24×24 stroke path. */
export function icon(id: string, d: string, o: { x: Anim<number>; y: Anim<number>; s: number; color: string; sw?: number; fill?: Paint } & Partial<Omit<PathLayer, 'type' | 'id' | 'd' | 'x' | 'y' | 'fill'>>) {
  const { s, color, sw = 2, fill, ...rest } = o;
  return path(id, d, 24, 24, { w: s, h: s, stroke: color, strokeWidth: sw, ...(fill ? { fill } : {}), ...(rest as object) });
}

// ---------------------------------------------------------------- chips

export interface ChipOpts {
  x: Anim<number>;
  y: Anim<number>;
  ax?: number;
  ay?: number;
  st: TS;
  /** Pill height (default 2.4 × font size). */
  h?: number;
  padX?: number;
  minW?: number;
  fill?: Paint;
  color: Paint;
  stroke?: string;
  strokeWidth?: number;
  dash?: number[];
  radius?: number;
  icon?: string;
  iconColor?: string;
  iconSW?: number;
  /** Put the icon after the label (CTA arrows). */
  iconRight?: boolean;
  /** Small dot before the label. */
  dot?: string;
  anim?: TextAnim;
  g?: Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>;
  /** Extra layers drawn on top of the pill background, in chip box space. */
  extra?: (w: number, h: number) => Layer[];
}

export interface Built {
  layer: GroupLayer;
  w: number;
  h: number;
}

/** Pill with optional icon/dot and a label, sized from the measured text. */
export function chip(x: Ctx, id: string, label: string, o: ChipOpts): Built {
  const r = res(x, o.st);
  const h = o.h ?? r.size * 2.4;
  const padX = o.padX ?? h * 0.45;
  const textW = tw(x, label, o.st);
  const iconS = o.icon ? r.size * 1.3 : o.dot ? r.size * 0.55 : 0;
  const gap = o.icon ? r.size * 0.5 : o.dot ? r.size * 0.55 : 0;
  const contentW = iconS + gap + textW;
  const w = Math.max(o.minW ?? 0, contentW + padX * 2);
  const left = (w - contentW) / 2;
  const kids: Layer[] = [
    rect(id + '-bg', {
      x: 0,
      y: 0,
      ax: 0,
      ay: 0,
      w,
      h,
      radius: o.radius ?? h / 2,
      ...(o.fill !== undefined ? { fill: o.fill } : {}),
      ...(o.stroke ? { stroke: o.stroke, strokeWidth: o.strokeWidth ?? Math.max(1, h * 0.04), ...(o.dash ? { dash: o.dash } : {}) } : {}),
    }),
  ];
  if (o.extra) kids.push(...o.extra(w, h));
  const iconX = o.iconRight ? left + textW + gap + iconS / 2 : left + iconS / 2;
  const textX = o.iconRight ? left : left + iconS + gap;
  if (o.icon) kids.push(icon(id + '-icon', o.icon, { x: iconX, y: h / 2, s: iconS, color: o.iconColor ?? (typeof o.color === 'string' ? o.color : '#000'), sw: o.iconSW ?? 2.2 }));
  if (o.dot) kids.push(circle(id + '-dot', iconS / 2, { x: iconX, y: h / 2, fill: o.dot }));
  kids.push(
    txt(x, id + '-t', label, o.st, {
      x: textX,
      y: h / 2,
      ax: 0,
      align: 'left',
      fill: o.color,
      ...(o.anim ? { anim: o.anim } : {}),
    }),
  );
  return {
    layer: group(id, kids, { x: o.x, y: o.y, w, h, ax: o.ax ?? 0.5, ay: o.ay ?? 0.5, ...(o.g ?? {}) }),
    w,
    h,
  };
}

/** Lay items into centred / left rows no wider than maxW. */
export function flow(widths: number[], maxW: number, gap: number): { rows: number[][]; rowW: number[] } {
  const rows: number[][] = [];
  const rowW: number[] = [];
  let cur: number[] = [];
  let cw = 0;
  widths.forEach((w, i) => {
    const add = cur.length ? gap + w : w;
    if (cur.length && cw + add > maxW) {
      rows.push(cur);
      rowW.push(cw);
      cur = [];
      cw = 0;
    }
    cw = cur.length ? cw + gap + w : w;
    cur.push(i);
  });
  if (cur.length) {
    rows.push(cur);
    rowW.push(cw);
  }
  return { rows, rowW };
}

// ---------------------------------------------------------------- stars

export interface StarOpts {
  x: Anim<number>;
  y: Anim<number>;
  ax?: number;
  ay?: number;
  size: number;
  gap?: number;
  rating?: number;
  color: string;
  empty: string;
  t0: number;
  stagger?: number;
  /** pop: each star springs in; sweep: a fill sweeps across (synced with a counter). */
  mode?: 'pop' | 'sweep';
  sweepDur?: number;
  sweepEase?: Ease;
  g?: Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>;
}

function starShape(id: string, cx: number, cy: number, s: number, fill: string, extra: object = {}) {
  return path(id, STAR, 100, 100, { x: cx, y: cy, w: s * 0.92, h: s * 0.92, fill, stroke: fill, strokeWidth: 7, lineJoin: 'round', ...extra });
}

export function stars(id: string, o: StarOpts): Built {
  const n = 5;
  const s = o.size;
  const gap = o.gap ?? s * 0.18;
  const rating = Math.max(0, Math.min(5, o.rating ?? 5));
  const w = n * s + (n - 1) * gap;
  const h = s;
  const stg = o.stagger ?? 0.09;
  const kids: Layer[] = [];
  for (let i = 0; i < n; i++) {
    const cx = i * (s + gap) + s / 2;
    kids.push(
      starShape(`${id}-e${i}`, cx, h / 2, s, o.empty, o.mode === 'sweep' ? { opacity: to(0, 1, o.t0 - 0.3 + i * 0.05, 0.4, 'outCubic') } : {}),
    );
  }
  if (o.mode === 'sweep') {
    const full = Math.floor(rating);
    const frac = rating - full;
    const fillW = full * (s + gap) + frac * s;
    kids.push(
      group(
        `${id}-sweep`,
        Array.from({ length: n }, (_, i) => starShape(`${id}-f${i}`, i * (s + gap) + s / 2, h / 2, s, o.color)),
        { x: 0, y: 0, ax: 0, ay: 0, h, w: to(0, fillW, o.t0, o.sweepDur ?? 1.6, o.sweepEase ?? 'outCubic'), clip: true },
      ),
    );
  } else {
    for (let i = 0; i < n; i++) {
      const frac = Math.max(0, Math.min(1, rating - i));
      if (frac <= 0) continue;
      const cx = i * (s + gap) + s / 2;
      const t = o.t0 + i * stg;
      const star = starShape(`${id}-f${i}`, s / 2, h / 2, s, o.color);
      const inner = frac < 1 ? group(`${id}-c${i}`, [star], { x: 0, y: 0, ax: 0, ay: 0, w: s * (0.04 + frac * 0.92), h, clip: true }) : star;
      kids.push(
        group(`${id}-p${i}`, [inner], {
          x: cx,
          y: h / 2,
          w: s,
          h,
          scale: [
            { t: t, v: 0 },
            { t: t + 0.55, v: 1, e: 'spring' },
          ],
          rotation: [
            { t: t, v: -40 },
            { t: t + 0.55, v: 0, e: 'outBack' },
          ],
        }),
      );
    }
  }
  return { layer: group(id, kids, { x: o.x, y: o.y, w, h, ax: o.ax ?? 0.5, ay: o.ay ?? 0.5, ...(o.g ?? {}) }), w, h };
}

// ---------------------------------------------------------------- avatar

export interface AvatarOpts {
  x: Anim<number>;
  y: Anim<number>;
  d: number;
  ax?: number;
  ay?: number;
  /** Ring paint (gradients allowed). */
  ring?: Paint;
  ringW?: number;
  /** Gap between ring and photo, filled with `gapFill`. */
  gap?: number;
  gapFill?: string;
  imgScale?: Anim<number>;
  g?: Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>>;
}

/** Circular photo with an optional (gradient) ring. */
export function avatar(id: string, src: string, o: AvatarOpts): Built {
  const ringW = o.ring ? o.ringW ?? o.d * 0.045 : 0;
  const gap = o.ring ? o.gap ?? o.d * 0.04 : 0;
  const D = o.d + 2 * (ringW + gap);
  const c = D / 2;
  const kids: Layer[] = [];
  if (o.ring) {
    kids.push(ellipse(id + '-ring', { x: c, y: c, w: D, h: D, fill: o.ring }));
    kids.push(ellipse(id + '-gap', { x: c, y: c, w: o.d + gap * 2, h: o.d + gap * 2, fill: o.gapFill ?? '#fff' }));
  }
  kids.push(
    group(
      id + '-photo',
      [image(id + '-img', src, { x: o.d / 2, y: o.d / 2, w: o.d, h: o.d, ...(o.imgScale !== undefined ? { scale: o.imgScale } : {}) })],
      { x: c, y: c, w: o.d, h: o.d, mask: { shape: 'circle', x: o.d / 2, y: o.d / 2, r: o.d / 2 } },
    ),
  );
  return { layer: group(id, kids, { x: o.x, y: o.y, w: D, h: D, ax: o.ax ?? 0.5, ay: o.ay ?? 0.5, ...(o.g ?? {}) }), w: D, h: D };
}

// ---------------------------------------------------------------- confetti

export interface ConfettiOpts {
  n: number;
  t0: number;
  colors: string[];
  /** Area where pieces come to rest. */
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Piece size (px). */
  s: number;
  /** Pieces start this far above the top edge. */
  from?: number;
  dur?: number;
  spread?: number;
  /** Rectangles [x0, y0, x1, y1] the pieces should not come to rest in (keeps text clean). */
  avoid?: [number, number, number, number][];
}

/** Confetti that drifts down and settles across an area (so the end frame is a clean scatter). */
export function confetti(x: Ctx, id: string, o: ConfettiOpts): Layer[] {
  const out: Layer[] = [];
  const r = x.rand;
  for (let i = 0; i < o.n; i++) {
    let ex = o.x0 + r() * (o.x1 - o.x0);
    let ey = o.y0 + r() * (o.y1 - o.y0);
    const pad = o.s * 1.2;
    const blocked = (px: number, py: number) => (o.avoid ?? []).some(([a, b, c, d]) => px > a - pad && px < c + pad && py > b - pad && py < d + pad);
    for (let tries = 0; tries < 24 && blocked(ex, ey); tries++) {
      ex = o.x0 + r() * (o.x1 - o.x0);
      ey = o.y0 + r() * (o.y1 - o.y0);
    }
    const sx = ex + (r() - 0.5) * (o.spread ?? o.s * 8);
    const sy = -(o.from ?? o.s * 3) - r() * o.s * 12;
    const t = o.t0 + r() * 0.7;
    const d = (o.dur ?? 2.2) * (0.8 + r() * 0.5);
    const color = o.colors[i % o.colors.length];
    const kind = r();
    const rot0 = r() * 360;
    const spin = (r() - 0.5) * 900;
    const common = {
      x: [
        { t, v: sx },
        { t: t + d, v: ex, e: 'outCubic' as Ease },
      ],
      y: [
        { t, v: sy },
        { t: t + d, v: ey, e: 'outCubic' as Ease },
      ],
      rotation: [
        { t, v: rot0 },
        { t: t + d * 1.2, v: rot0 + spin, e: 'outCubic' as Ease },
      ],
      sy: [
        { t, v: 1 },
        { t: t + d * 0.25, v: -0.4, e: 'inOutSine' as Ease },
        { t: t + d * 0.5, v: 1, e: 'inOutSine' as Ease },
        { t: t + d * 0.75, v: 0.3, e: 'inOutSine' as Ease },
        { t: t + d, v: 1, e: 'inOutSine' as Ease },
      ],
      start: t,
    };
    if (kind < 0.55) out.push(rect(`${id}-${i}`, { w: o.s * 0.7, h: o.s * 1.5, radius: o.s * 0.15, fill: color, ...common }));
    else if (kind < 0.8) out.push(circle(`${id}-${i}`, o.s * 0.5, { fill: color, ...common }));
    else
      out.push(
        path(`${id}-${i}`, 'M2 12c3-6 5-6 7 0s4 6 7 0 4-6 6 0', 24, 24, { w: o.s * 2, h: o.s * 2, stroke: color, strokeWidth: 3.2, ...common }),
      );
  }
  return out;
}

/** Soft radial glow disc (cheap alternative to a blur). */
export function glow(id: string, o: { x: Anim<number>; y: Anim<number>; r: number; color: string; a?: number } & Partial<GroupLayer>) {
  const { r, color, a = 0.5, ...rest } = o;
  return circle(id, r, {
    fill: { kind: 'radial', cx: 0.5, cy: 0.5, r: 0.71, stops: [{ o: 0, c: alpha(color, a) }, { o: 1, c: alpha(color, 0) }] },
    ...(rest as object),
  });
}

/** Brand row: logo mark + name. */
export function brandRow(
  x: Ctx,
  id: string,
  name: string,
  o: { x: Anim<number>; y: Anim<number>; ax?: number; ay?: number; logo: number; st: TS; color: string; logoColor?: string; anim?: TextAnim; g?: Partial<Omit<GroupLayer, 'type' | 'id' | 'children'>> },
): Built {
  const gap = o.logo * 0.38;
  const w0 = tw(x, name, o.st);
  const w = o.logo + gap + w0;
  const h = o.logo;
  return {
    layer: group(
      id,
      [
        x.logo(id + '-logo', { size: o.logo, x: o.logo / 2, y: h / 2, color: o.logoColor ?? o.color }),
        txt(x, id + '-name', name, o.st, { x: o.logo + gap, y: h / 2, ax: 0, align: 'left', fill: o.color, ...(o.anim ? { anim: o.anim } : {}) }),
      ],
      { x: o.x, y: o.y, w, h, ax: o.ax ?? 0.5, ay: o.ay ?? 0.5, ...(o.g ?? {}) },
    ),
    w,
    h,
  };
}

/** Parse a loose number ("2,847", "12.4K", "$120") → number or NaN. */
export function num(s: string): number {
  const m = s.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!m) return NaN;
  let v = parseFloat(m[0]);
  if (/k\b/i.test(s)) v *= 1000;
  if (/m\b/i.test(s)) v *= 1e6;
  return v;
}

/** Split "$120.00" into prefix / number / suffix for counters. */
export function splitNum(s: string): { pre: string; v: number; dec: number; suf: string } | null {
  const m = s.match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/);
  if (!m) return null;
  const raw = m[2].replace(/,/g, '');
  const v = parseFloat(raw);
  if (!isFinite(v)) return null;
  const dec = raw.includes('.') ? raw.split('.')[1].length : 0;
  return { pre: m[1], v, dec, suf: m[3] };
}
