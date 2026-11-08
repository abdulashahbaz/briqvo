import { sample, clamp, rng } from './anim';
import { ease } from './easing';
import type { TextLayer, TextUnitState, TextAnim, Counter } from './types';

export interface CharL {
  ch: string;
  x: number; // relative to word start
  w: number;
}
export interface WordL {
  text: string;
  x: number; // relative to line start
  w: number;
  chars: CharL[];
}
export interface LineL {
  x: number; // alignment offset inside box
  top: number;
  w: number;
  words: WordL[];
}
export interface TextLayout {
  lines: LineL[];
  w: number;
  h: number;
  lineH: number;
  baseline: number; // offset from line top to alphabetic baseline
  font: string;
  trackPx: number;
}

let measureCtx: CanvasRenderingContext2D | null = null;
function mctx(): CanvasRenderingContext2D {
  if (!measureCtx) {
    const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(8, 8) : document.createElement('canvas');
    measureCtx = c.getContext('2d') as CanvasRenderingContext2D;
  }
  return measureCtx;
}

const widthCache = new Map<string, number>();
function measure(font: string, s: string): number {
  const key = font + '\u0000' + s;
  let v = widthCache.get(key);
  if (v === undefined) {
    const c = mctx();
    c.font = font;
    v = c.measureText(s).width;
    if (widthCache.size > 20000) widthCache.clear();
    widthCache.set(key, v);
  }
  return v;
}

const metricCache = new Map<string, { asc: number; desc: number }>();
function metrics(font: string, size: number) {
  let m = metricCache.get(font);
  if (!m) {
    const c = mctx();
    c.font = font;
    const tm = c.measureText('Hgjy');
    const asc = tm.fontBoundingBoxAscent ?? tm.actualBoundingBoxAscent ?? size * 0.8;
    const desc = tm.fontBoundingBoxDescent ?? tm.actualBoundingBoxDescent ?? size * 0.2;
    m = { asc, desc };
    metricCache.set(font, m);
  }
  return m;
}

const layoutCache = new Map<string, TextLayout>();

/** Call when web fonts finish loading so measurements are redone. */
export function invalidateTextCache() {
  widthCache.clear();
  metricCache.clear();
  layoutCache.clear();
}

export function fontString(family: string, weight = 400, size = 16, italic = false): string {
  return `${italic ? 'italic ' : ''}${weight} ${Math.max(0.5, size)}px "${family}", system-ui, sans-serif`;
}

export function formatCounter(c: Counter, t: number): string {
  const p = ease(c.ease ?? 'outCubic', clamp((t - c.start) / Math.max(0.0001, c.dur)));
  const v = c.from + (c.to - c.from) * p;
  let s = v.toFixed(c.decimals ?? 0);
  if (c.separator !== false) {
    const [i, d] = s.split('.');
    s = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? '.' + d : '');
  }
  return (c.prefix ?? '') + s + (c.suffix ?? '');
}

export function layoutText(
  text: string,
  family: string,
  weight: number,
  italic: boolean,
  size: number,
  wrapW: number | undefined,
  tracking: number,
  lineHeight: number,
  align: 'left' | 'center' | 'right',
): TextLayout {
  const font = fontString(family, weight, size, italic);
  const key = [font, text, wrapW ?? -1, tracking, lineHeight, align].join('|');
  const hit = layoutCache.get(key);
  if (hit) return hit;

  const trackPx = tracking * size;
  const spaceW = measure(font, ' ') + trackPx;
  const mkWord = (w: string): WordL => {
    const chars: CharL[] = [];
    const glyphs = Array.from(w);
    let prefix = '';
    for (let i = 0; i < glyphs.length; i++) {
      const x = measure(font, prefix) + i * trackPx;
      const cw = measure(font, glyphs[i]);
      chars.push({ ch: glyphs[i], x, w: cw });
      prefix += glyphs[i];
    }
    const width = measure(font, w) + Math.max(0, glyphs.length - 1) * trackPx;
    return { text: w, x: 0, w: width, chars };
  };

  const lines: LineL[] = [];
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    const words = para.split(/ +/).filter((s, _i, arr) => s.length > 0 || arr.length === 1);
    let cur: WordL[] = [];
    let curW = 0;
    const flush = () => {
      lines.push({ x: 0, top: 0, w: curW, words: cur });
      cur = [];
      curW = 0;
    };
    for (const raw of words) {
      const wd = mkWord(raw);
      const add = cur.length ? spaceW + wd.w : wd.w;
      if (wrapW !== undefined && cur.length && curW + add > wrapW + 0.5) flush();
      wd.x = cur.length ? curW + spaceW : 0;
      curW = cur.length ? curW + spaceW + wd.w : wd.w;
      cur.push(wd);
    }
    flush();
  }

  const lineH = size * lineHeight;
  const m = metrics(font, size);
  const baseline = (lineH - (m.asc + m.desc)) / 2 + m.asc;
  const maxW = Math.max(0, ...lines.map((l) => l.w));
  const boxW = wrapW ?? maxW;
  lines.forEach((l, i) => {
    l.top = i * lineH;
    l.x = align === 'center' ? (boxW - l.w) / 2 : align === 'right' ? boxW - l.w : 0;
  });
  const out: TextLayout = { lines, w: boxW, h: lines.length * lineH, lineH, baseline, font, trackPx };
  if (layoutCache.size > 3000) layoutCache.clear();
  layoutCache.set(key, out);
  return out;
}

export function resolveText(L: TextLayer, t: number): string {
  let s = L.counter ? formatCounter(L.counter, t) : L.text;
  if (L.uppercase) s = s.toUpperCase();
  return s;
}

export function textLayoutFor(L: TextLayer, t: number): TextLayout {
  const size = sample(L.size, t, 48);
  const wrap = L.w === undefined ? undefined : sample(L.w, t, 0);
  return layoutText(
    resolveText(L, t),
    L.font,
    L.weight ?? 400,
    !!L.italic,
    size,
    wrap,
    L.tracking ?? 0,
    L.lineHeight ?? 1.15,
    L.align ?? 'left',
  );
}

interface Unit {
  text: string;
  x: number; // left in box
  w: number;
  line: number;
  top: number;
}

function units(layout: TextLayout, by: TextAnim['by']): Unit[] {
  const out: Unit[] = [];
  layout.lines.forEach((ln, li) => {
    if (by === 'line') {
      out.push({ text: ln.words.map((w) => w.text).join(' '), x: ln.x, w: ln.w, line: li, top: ln.top });
      return;
    }
    for (const wd of ln.words) {
      if (by === 'word') {
        out.push({ text: wd.text, x: ln.x + wd.x, w: wd.w, line: li, top: ln.top });
      } else {
        for (const c of wd.chars) out.push({ text: c.ch, x: ln.x + wd.x + c.x, w: c.w, line: li, top: ln.top });
      }
    }
  });
  return out;
}

function orderIndex(n: number, order: TextAnim['order'] = 'forward'): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  switch (order) {
    case 'reverse':
      return idx.map((i) => n - 1 - i);
    case 'center': {
      const mid = (n - 1) / 2;
      return idx.map((i) => Math.round(Math.abs(i - mid)));
    }
    case 'edges': {
      const mid = (n - 1) / 2;
      return idx.map((i) => Math.round(mid - Math.abs(i - mid)));
    }
    case 'random': {
      const r = rng(n * 7919 + 13);
      const shuffled = [...idx].sort(() => r() - 0.5);
      const pos = new Array<number>(n);
      shuffled.forEach((v, i) => (pos[v] = i));
      return pos;
    }
    default:
      return idx;
  }
}

function mixState(from: TextUnitState, p: number) {
  const q = 1 - p;
  return {
    x: (from.x ?? 0) * q,
    y: (from.y ?? 0) * q,
    opacity: 1 + ((from.opacity ?? 1) - 1) * q,
    scale: 1 + ((from.scale ?? 1) - 1) * q,
    rotation: (from.rotation ?? 0) * q,
    blur: (from.blur ?? 0) * q,
  };
}

export interface TextDrawEnv {
  scale: number;
  canBlur: boolean;
}

/** Draws a text layer into its own box space (0,0 top-left). */
export function drawText(
  ctx: CanvasRenderingContext2D,
  L: TextLayer,
  layout: TextLayout,
  t: number,
  paint: string | CanvasGradient | CanvasPattern,
  stroke: string | undefined,
  env: TextDrawEnv,
) {
  const size = sample(L.size, t, 48);
  ctx.font = layout.font;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.fillStyle = paint;
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = L.strokeWidth ?? 2;
    ctx.lineJoin = 'round';
  }
  const trackSupported = 'letterSpacing' in (ctx as object);
  const drawStr = (s: string, x: number, y: number) => {
    if (L.fill !== 'transparent') ctx.fillText(s, x, y);
    if (stroke) ctx.strokeText(s, x, y);
  };
  const drawRun = (s: string, x: number, y: number) => {
    if (!layout.trackPx) return drawStr(s, x, y);
    if (trackSupported) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${layout.trackPx}px`;
      drawStr(s, x, y);
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
      return;
    }
    let cx = x;
    const c2 = ctx as CanvasRenderingContext2D;
    for (const ch of Array.from(s)) {
      drawStr(ch, cx, y);
      cx += c2.measureText(ch).width + layout.trackPx;
    }
  };

  const reveal = L.reveal === undefined ? 1 : clamp(sample(L.reveal, t, 1));
  const anim = L.anim;

  // Fast path: no per-unit animation.
  if (!anim && reveal >= 1) {
    for (const ln of layout.lines) {
      for (const wd of ln.words) drawRun(wd.text, ln.x + wd.x, ln.top + layout.baseline);
    }
    return;
  }

  if (!anim) {
    // Typewriter
    const all = units(layout, 'char');
    const visible = Math.floor(all.length * reveal + 1e-6);
    for (let i = 0; i < visible; i++) {
      const u = all[i];
      drawStr(u.text, u.x, u.top + layout.baseline);
    }
    return;
  }

  const us = units(layout, anim.by);
  const n = us.length;
  const ord = orderIndex(n, anim.order);
  const ordOut = anim.out ? orderIndex(n, anim.out.order ?? anim.order) : null;
  const visibleCount = reveal >= 1 ? n : Math.floor(n * reveal);
  let lastLine = -1;
  let clipped = false;

  for (let i = 0; i < Math.min(n, visibleCount); i++) {
    const u = us[i];
    const delay = anim.start + ord[i] * anim.stagger;
    const p = ease(anim.ease ?? 'outCubic', clamp((t - delay) / Math.max(0.0001, anim.dur)));
    let s = mixState(anim.from, p);
    if (anim.out && ordOut) {
      const d2 = anim.out.start + ordOut[i] * anim.out.stagger;
      const p2 = ease(anim.out.ease ?? 'inCubic', clamp((t - d2) / Math.max(0.0001, anim.out.dur)));
      if (p2 > 0) {
        const o = mixState(anim.out.to, 1 - p2);
        s = {
          x: s.x + o.x,
          y: s.y + o.y,
          opacity: s.opacity * o.opacity,
          scale: s.scale * o.scale,
          rotation: s.rotation + o.rotation,
          blur: s.blur + o.blur,
        };
      }
    }
    if (s.opacity <= 0.001) continue;

    if (anim.mask && u.line !== lastLine) {
      if (clipped) ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.rect(-size * 2, u.top - size * 0.05, layout.w + size * 4, layout.lineH + size * 0.18);
      ctx.clip();
      clipped = true;
      lastLine = u.line;
    }

    ctx.save();
    const cx = u.x + u.w / 2;
    const cy = u.top + layout.lineH / 2;
    ctx.translate(cx + s.x * size, cy + s.y * size);
    if (s.rotation) ctx.rotate((s.rotation * Math.PI) / 180);
    if (s.scale !== 1) ctx.scale(s.scale, s.scale);
    ctx.globalAlpha *= clamp(s.opacity);
    if (s.blur > 0.05 && env.canBlur) ctx.filter = `blur(${(s.blur * env.scale).toFixed(2)}px)`;
    const bx = -u.w / 2;
    const by = -layout.lineH / 2 + layout.baseline;
    if (anim.by === 'char') drawStr(u.text, bx, by);
    else drawRun(u.text, bx, by);
    ctx.restore();
  }
  if (clipped) ctx.restore();
}
