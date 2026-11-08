import { sample, clamp } from './anim';
import { assets } from './assets';
import { drawText, textLayoutFor } from './text';
import type {
  EllipseLayer,
  GroupLayer,
  ImageLayer,
  Layer,
  Mask,
  Paint,
  PathLayer,
  RectLayer,
  Scene,
  TextLayer,
} from './types';

export interface RenderOptions {
  /** Canvas pixels per scene unit. */
  scale: number;
  /** Scene-space origin of the viewport (used to crop carousel slides). */
  ox?: number;
  oy?: number;
  /** Skip painting the scene background (transparent export). */
  transparent?: boolean;
}

interface Env {
  scale: number;
  canBlur: boolean;
  depth: number;
}

let blurSupport: boolean | null = null;
function canvasBlurSupported(ctx: CanvasRenderingContext2D): boolean {
  if (blurSupport === null) {
    try {
      const prev = ctx.filter;
      ctx.filter = 'blur(1px)';
      blurSupport = ctx.filter === 'blur(1px)';
      ctx.filter = prev;
    } catch {
      blurSupport = false;
    }
  }
  return blurSupport;
}

// ---------------------------------------------------------------- paint

function makePaint(ctx: CanvasRenderingContext2D, p: Paint, w: number, h: number): string | CanvasGradient {
  if (typeof p === 'string') return p;
  if (p.kind === 'linear') {
    const a = (p.angle * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const half = Math.abs((w / 2) * dx) + Math.abs((h / 2) * dy);
    const cx = w / 2;
    const cy = h / 2;
    const g = ctx.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half);
    for (const s of p.stops) g.addColorStop(clamp(s.o), s.c);
    return g;
  }
  const r = (p.r * Math.hypot(w, h)) / 2;
  const g = ctx.createRadialGradient(p.cx * w, p.cy * h, 0, p.cx * w, p.cy * h, Math.max(0.01, r));
  for (const s of p.stops) g.addColorStop(clamp(s.o), s.c);
  return g;
}

export function roundRectPath(ctx: CanvasRenderingContext2D | Path2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  if (rr <= 0.01) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

// ---------------------------------------------------------------- offscreen pool

const pool: HTMLCanvasElement[] = [];
function offscreen(depth: number, w: number, h: number): CanvasRenderingContext2D {
  let c = pool[depth];
  if (!c) {
    c = document.createElement('canvas');
    pool[depth] = c;
  }
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  const ctx = c.getContext('2d')!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.clearRect(0, 0, w, h);
  return ctx;
}

// ---------------------------------------------------------------- path helpers

const pathCache = new Map<string, Path2D>();
function path2d(d: string): Path2D {
  let p = pathCache.get(d);
  if (!p) {
    p = new Path2D(d);
    pathCache.set(d, p);
  }
  return p;
}

const lengthCache = new Map<string, number>();
let svgPathEl: SVGPathElement | null = null;
export function pathLength(d: string): number {
  let L = lengthCache.get(d);
  if (L === undefined) {
    try {
      if (!svgPathEl) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgPathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svg.appendChild(svgPathEl);
      }
      svgPathEl.setAttribute('d', d);
      L = svgPathEl.getTotalLength();
    } catch {
      L = 1000;
    }
    lengthCache.set(d, L);
  }
  return L;
}

// ---------------------------------------------------------------- tinting

const tintCache = new Map<string, HTMLCanvasElement>();
function tinted(img: HTMLImageElement, src: string, color: string): HTMLCanvasElement {
  const key = src.length > 200 ? src.slice(0, 120) + src.length + src.slice(-60) : src;
  const ck = key + '|' + color;
  let c = tintCache.get(ck);
  if (!c) {
    c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const x = c.getContext('2d')!;
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
    if (tintCache.size > 60) tintCache.clear();
    tintCache.set(ck, c);
  }
  return c;
}

// ---------------------------------------------------------------- layer box

export interface LayerBox {
  x: number;
  y: number;
  w: number;
  h: number;
  ax: number;
  ay: number;
}

export function layerBox(L: Layer, t: number): LayerBox {
  let w = sample(L.w, t, 0);
  let h = sample(L.h, t, 0);
  if (L.type === 'text') {
    const lay = textLayoutFor(L, t);
    if (L.w === undefined) w = lay.w;
    if (L.h === undefined) h = lay.h;
  }
  return { x: sample(L.x, t, 0), y: sample(L.y, t, 0), w, h, ax: L.ax ?? 0.5, ay: L.ay ?? 0.5 };
}

/** Local time of a layer given its parent's time. */
export function localTime(L: Layer, t: number): number {
  return t - (L.dt ?? 0);
}

export function isVisibleAt(L: Layer, t: number): boolean {
  if (L.hidden) return false;
  if (L.start !== undefined && t < L.start) return false;
  if (L.end !== undefined && t >= L.end) return false;
  return true;
}

// ---------------------------------------------------------------- draw

function applyMask(ctx: CanvasRenderingContext2D, m: Mask, t: number) {
  const x = sample(m.x, t, 0);
  const y = sample(m.y, t, 0);
  ctx.beginPath();
  if (m.invert) ctx.rect(-1e5, -1e5, 2e5, 2e5);
  if (m.shape === 'circle') {
    const r = Math.max(0, sample(m.r, t, 0));
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, Math.PI * 2, !!m.invert);
  } else {
    const w = sample(m.w, t, 0);
    const h = sample(m.h, t, 0);
    roundRectPath(ctx, x, y, w, h, sample(m.r, t, 0));
  }
  ctx.clip(m.invert ? 'evenodd' : 'nonzero');
}

function drawRect(ctx: CanvasRenderingContext2D, L: RectLayer, t: number, w: number, h: number) {
  const r = sample(L.radius, t, 0);
  ctx.beginPath();
  roundRectPath(ctx, 0, 0, w, h, r);
  if (L.fill !== undefined) {
    ctx.fillStyle = makePaint(ctx, sample<Paint>(L.fill, t, '#000'), w, h);
    ctx.fill();
  }
  const sw = sample(L.strokeWidth, t, 0);
  if (L.stroke !== undefined && sw > 0) {
    ctx.strokeStyle = sample(L.stroke, t, '#000');
    ctx.lineWidth = sw;
    if (L.dash) ctx.setLineDash(L.dash);
    ctx.stroke();
  }
}

function drawEllipse(ctx: CanvasRenderingContext2D, L: EllipseLayer, t: number, w: number, h: number) {
  const a0 = sample(L.arcStart, t, 0);
  const a1 = sample(L.arcEnd, t, 1);
  const full = a0 <= 0 && a1 >= 1;
  const start = -Math.PI / 2 + a0 * Math.PI * 2;
  const end = -Math.PI / 2 + a1 * Math.PI * 2;
  if (!full && a1 - a0 <= 0.0001) return;
  if (L.fill !== undefined) {
    ctx.beginPath();
    if (full) ctx.ellipse(w / 2, h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
    else {
      ctx.moveTo(w / 2, h / 2);
      ctx.ellipse(w / 2, h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, start, end);
      ctx.closePath();
    }
    ctx.fillStyle = makePaint(ctx, sample<Paint>(L.fill, t, '#000'), w, h);
    ctx.fill();
  }
  const sw = sample(L.strokeWidth, t, 0);
  if (L.stroke !== undefined && sw > 0) {
    ctx.beginPath();
    const rx = Math.max(0, w / 2 - sw / 2);
    const ry = Math.max(0, h / 2 - sw / 2);
    if (full) ctx.ellipse(w / 2, h / 2, rx, ry, 0, 0, Math.PI * 2);
    else ctx.ellipse(w / 2, h / 2, rx, ry, 0, start, end);
    ctx.strokeStyle = sample(L.stroke, t, '#000');
    ctx.lineWidth = sw;
    ctx.lineCap = L.lineCap ?? 'round';
    ctx.stroke();
  }
}

function drawImageLayer(ctx: CanvasRenderingContext2D, L: ImageLayer, t: number, w: number, h: number) {
  const img = assets.image(L.src);
  const r = sample(L.radius, t, 0);
  if (r > 0) {
    ctx.beginPath();
    roundRectPath(ctx, 0, 0, w, h, r);
    ctx.clip();
  }
  if (!img) {
    ctx.fillStyle = 'rgba(120,140,180,0.12)';
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  let dx = 0;
  let dy = 0;
  let dw = w;
  let dh = h;
  const fit = L.fit ?? 'cover';
  if (fit !== 'fill') {
    const s = fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
    dw = iw * s;
    dh = ih * s;
    dx = (w - dw) / 2;
    dy = (h - dh) / 2;
  }
  const tint = L.tint !== undefined ? sample(L.tint, t, '') : '';
  const source: CanvasImageSource = tint ? tinted(img, L.src, tint) : img;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, dx, dy, dw, dh);
}

function drawPath(ctx: CanvasRenderingContext2D, L: PathLayer, t: number, w: number, h: number) {
  const p = path2d(L.d);
  const sx = L.vw ? w / L.vw : 1;
  const sy = L.vh ? h / L.vh : 1;
  ctx.scale(sx, sy);
  if (L.fill !== undefined) {
    ctx.fillStyle = makePaint(ctx, sample<Paint>(L.fill, t, '#000'), L.vw, L.vh);
    ctx.fill(p);
  }
  const sw = sample(L.strokeWidth, t, 0);
  if (L.stroke !== undefined && sw > 0) {
    const ts = clamp(sample(L.trimStart, t, 0));
    const te = clamp(sample(L.trimEnd, t, 1));
    if (te - ts <= 0.0005) return;
    ctx.strokeStyle = sample(L.stroke, t, '#000');
    ctx.lineWidth = sw;
    ctx.lineCap = L.lineCap ?? 'round';
    ctx.lineJoin = L.lineJoin ?? 'round';
    if (ts > 0 || te < 1) {
      const len = pathLength(L.d);
      ctx.setLineDash([len * (te - ts), len * 2]);
      ctx.lineDashOffset = -len * ts;
    }
    ctx.stroke(p);
  }
}

function drawTextLayer(ctx: CanvasRenderingContext2D, L: TextLayer, t: number, w: number, env: Env) {
  const lay = textLayoutFor(L, t);
  const paint = makePaint(ctx, sample<Paint>(L.fill, t, '#000'), Math.max(1, w), Math.max(1, lay.h));
  const stroke = L.stroke !== undefined ? sample(L.stroke, t, '#000') : undefined;
  // Text box may be wider than the layout when w is set; layout already aligned within wrap width.
  drawText(ctx, L, lay, t, paint, stroke, env);
}

function drawLayer(ctx: CanvasRenderingContext2D, L: Layer, parentT: number, env: Env) {
  const t = localTime(L, parentT);
  if (!isVisibleAt(L, t)) return;
  const opacity = sample(L.opacity, t, 1);
  if (opacity <= 0.001) return;
  const box = layerBox(L, t);
  const { w, h } = box;
  const s = sample(L.scale, t, 1);
  const sx = s * sample(L.sx, t, 1);
  const sy = s * sample(L.sy, t, 1);
  if (Math.abs(sx) < 1e-5 || Math.abs(sy) < 1e-5) return;
  const rot = sample(L.rotation, t, 0);
  const skew = sample(L.skewX, t, 0);

  ctx.save();
  ctx.translate(box.x, box.y);
  if (rot) ctx.rotate((rot * Math.PI) / 180);
  if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
  if (skew) ctx.transform(1, 0, Math.tan((skew * Math.PI) / 180), 1, 0, 0);
  ctx.translate(-box.ax * w, -box.ay * h);
  ctx.globalAlpha *= clamp(opacity);
  if (L.blend) ctx.globalCompositeOperation = L.blend;
  const blur = sample(L.blur, t, 0);
  if (blur > 0.05 && env.canBlur) ctx.filter = `blur(${(blur * env.scale).toFixed(2)}px)`;
  if (L.shadow) {
    ctx.shadowColor = L.shadow.color;
    ctx.shadowBlur = L.shadow.blur * env.scale;
    ctx.shadowOffsetX = (L.shadow.x ?? 0) * env.scale;
    ctx.shadowOffsetY = (L.shadow.y ?? 0) * env.scale;
  }

  switch (L.type) {
    case 'rect':
      drawRect(ctx, L, t, w, h);
      break;
    case 'ellipse':
      drawEllipse(ctx, L, t, w, h);
      break;
    case 'text':
      drawTextLayer(ctx, L, t, w, env);
      break;
    case 'image':
      drawImageLayer(ctx, L, t, w, h);
      break;
    case 'path':
      drawPath(ctx, L, t, w, h);
      break;
    case 'group':
      drawGroup(ctx, L, t, w, h, env);
      break;
  }
  ctx.restore();
}

function drawGroup(ctx: CanvasRenderingContext2D, L: GroupLayer, t: number, w: number, h: number, env: Env) {
  // Shadows on groups would apply per child; drop them for children.
  ctx.shadowColor = 'transparent';
  if (L.clip) {
    ctx.beginPath();
    roundRectPath(ctx, 0, 0, w, h, sample(L.clipRadius, t, 0));
    ctx.clip();
  }
  if (L.mask) applyMask(ctx, L.mask, t);

  if (L.isolate && typeof document !== 'undefined') {
    const canvas = ctx.canvas as HTMLCanvasElement;
    const off = offscreen(env.depth + 1, canvas.width, canvas.height);
    off.setTransform(ctx.getTransform());
    const childEnv = { ...env, depth: env.depth + 1 };
    for (const c of L.children) drawLayer(off, c, t, childEnv);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(off.canvas, 0, 0);
    ctx.restore();
    return;
  }
  // Children should not inherit the group's filter twice; filter on a group is applied per child.
  for (const c of L.children) drawLayer(ctx, c, t, env);
}

/** Render `scene` at time `t` into the canvas context. */
export function renderFrame(ctx: CanvasRenderingContext2D, scene: Scene, t: number, opts: RenderOptions) {
  const env: Env = { scale: opts.scale, canBlur: canvasBlurSupported(ctx), depth: 0 };
  const canvas = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(opts.scale, opts.scale);
  ctx.translate(-(opts.ox ?? 0), -(opts.oy ?? 0));
  if (!opts.transparent) {
    ctx.fillStyle = makePaint(ctx, scene.background, scene.w, scene.h);
    ctx.fillRect(0, 0, scene.w, scene.h);
  }
  const tt = Math.max(0, Math.min(t, scene.duration)) * (scene.speed ?? 1);
  for (const L of scene.layers) drawLayer(ctx, L, tt, env);
}

/** Collect every keyframe time in a layer subtree (scene time), for the timeline UI. */
export function keyframeTimes(L: Layer, offset = 0): number[] {
  const out: number[] = [];
  const o = offset + (L.dt ?? 0);
  const props = ['x', 'y', 'w', 'h', 'rotation', 'scale', 'sx', 'sy', 'opacity', 'blur', 'skewX'] as const;
  for (const p of props) {
    const v = (L as unknown as Record<string, unknown>)[p];
    if (Array.isArray(v)) for (const f of v as { t: number }[]) if (typeof f === 'object' && 't' in f) out.push(f.t + o);
  }
  if (L.type === 'text' && L.anim) out.push(L.anim.start + o);
  if (L.type === 'group') for (const c of L.children) out.push(...keyframeTimes(c, o));
  return out;
}

/** Time span where a layer is active (scene time), for the timeline UI. */
export function layerSpan(L: Layer, duration: number, offset = 0): [number, number] {
  const o = offset + (L.dt ?? 0);
  const ks = keyframeTimes(L, offset);
  const s = L.start !== undefined ? L.start + o : ks.length ? Math.min(...ks) : 0;
  const e = L.end !== undefined ? L.end + o : duration;
  return [Math.max(0, Math.min(s, duration)), Math.max(0, Math.min(e, duration))];
}
