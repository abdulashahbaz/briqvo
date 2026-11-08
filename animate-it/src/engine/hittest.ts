import { sample } from './anim';
import { isVisibleAt, layerBox, localTime } from './render';
import type { Layer, Scene } from './types';

export interface Placed {
  layer: Layer;
  /** Scene-space matrix that maps the layer's box space (0..w, 0..h) to scene coords. */
  m: DOMMatrix;
  w: number;
  h: number;
  /** Matrix of the parent space (where x/y live). */
  parent: DOMMatrix;
  t: number;
  depth: number;
}

function place(L: Layer, parentT: number, parent: DOMMatrix, depth: number): Placed | null {
  const t = localTime(L, parentT);
  if (!isVisibleAt(L, t)) return null;
  if (sample(L.opacity, t, 1) <= 0.01) return null;
  const b = layerBox(L, t);
  const s = sample(L.scale, t, 1);
  const sx = s * sample(L.sx, t, 1);
  const sy = s * sample(L.sy, t, 1);
  if (Math.abs(sx) < 1e-4 || Math.abs(sy) < 1e-4) return null;
  const rot = sample(L.rotation, t, 0);
  const skew = sample(L.skewX, t, 0);
  let m = parent.translate(b.x, b.y);
  if (rot) m = m.rotate(rot);
  if (sx !== 1 || sy !== 1) m = m.scale(sx, sy);
  if (skew) m = m.skewX(skew);
  m = m.translate(-b.ax * b.w, -b.ay * b.h);
  return { layer: L, m, w: b.w, h: b.h, parent, t, depth };
}

/** Every visible layer, in paint order, with its scene-space transform. */
export function placeAll(scene: Scene, t: number): Placed[] {
  const out: Placed[] = [];
  const tt = Math.max(0, Math.min(t, scene.duration)) * (scene.speed ?? 1);
  const walk = (ls: Layer[], pt: number, parent: DOMMatrix, depth: number) => {
    for (const L of ls) {
      const p = place(L, pt, parent, depth);
      if (!p) continue;
      out.push(p);
      if (L.type === 'group') walk(L.children, p.t, p.m, depth + 1);
    }
  };
  walk(scene.layers, tt, new DOMMatrix(), 0);
  return out;
}

function contains(p: Placed, x: number, y: number, pad = 0): boolean {
  const inv = p.m.inverse();
  const q = inv.transformPoint(new DOMPoint(x, y));
  return q.x >= -pad && q.y >= -pad && q.x <= p.w + pad && q.y <= p.h + pad;
}

/** Top-most leaf layer under a scene-space point (groups are returned only if no child hits). */
export function hitTest(scene: Scene, t: number, x: number, y: number): Placed | null {
  const all = placeAll(scene, t);
  for (let i = all.length - 1; i >= 0; i--) {
    const p = all[i];
    if (p.layer.type === 'group') continue;
    if (p.w * p.h <= 0) continue;
    // Ignore full-bleed backdrops so clicks reach the content.
    if (p.depth === 0 && p.layer.type === 'rect' && p.w >= scene.w * 0.98 && p.h >= scene.h * 0.98) continue;
    if (contains(p, x, y)) return p;
  }
  for (let i = all.length - 1; i >= 0; i--) {
    const p = all[i];
    if (p.layer.type === 'group' && contains(p, x, y)) return p;
  }
  return null;
}

export function findPlaced(scene: Scene, t: number, id: string): Placed | null {
  return placeAll(scene, t).find((p) => p.layer.id === id) ?? null;
}

export function corners(p: Placed): DOMPoint[] {
  return [
    p.m.transformPoint(new DOMPoint(0, 0)),
    p.m.transformPoint(new DOMPoint(p.w, 0)),
    p.m.transformPoint(new DOMPoint(p.w, p.h)),
    p.m.transformPoint(new DOMPoint(0, p.h)),
  ];
}

/** Convert a scene-space delta into the parent space of a placed layer (for dragging). */
export function deltaToParent(p: Placed, dx: number, dy: number): { dx: number; dy: number } {
  const inv = p.parent.inverse();
  const a = inv.transformPoint(new DOMPoint(0, 0));
  const b = inv.transformPoint(new DOMPoint(dx, dy));
  return { dx: b.x - a.x, dy: b.y - a.y };
}

export function findLayer(layers: Layer[], id: string): Layer | null {
  for (const L of layers) {
    if (L.id === id) return L;
    if (L.type === 'group') {
      const f = findLayer(L.children, id);
      if (f) return f;
    }
  }
  return null;
}
