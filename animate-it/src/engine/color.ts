export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const cache = new Map<string, RGBA>();

export function parseColor(c: string): RGBA {
  const hit = cache.get(c);
  if (hit) return hit;
  let out: RGBA = { r: 0, g: 0, b: 0, a: 1 };
  const s = c.trim();
  if (s[0] === '#') {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map((ch) => ch + ch).join('');
    const n = parseInt(h.slice(0, 6), 16);
    out = {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: n & 255,
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  } else if (s.startsWith('rgb')) {
    const parts = s.slice(s.indexOf('(') + 1, s.indexOf(')')).split(/[\s,/]+/).filter(Boolean).map(Number);
    out = { r: parts[0] ?? 0, g: parts[1] ?? 0, b: parts[2] ?? 0, a: parts[3] ?? 1 };
  } else if (s === 'transparent') {
    out = { r: 0, g: 0, b: 0, a: 0 };
  } else if (s === 'white') {
    out = { r: 255, g: 255, b: 255, a: 1 };
  } else if (s === 'black') {
    out = { r: 0, g: 0, b: 0, a: 1 };
  }
  if (cache.size > 4000) cache.clear();
  cache.set(c, out);
  return out;
}

export function rgbaString({ r, g, b, a }: RGBA): string {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${+a.toFixed(4)})`;
}

export function lerpColor(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const A = parseColor(a);
  const B = parseColor(b);
  return rgbaString({
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
    a: A.a + (B.a - A.a) * t,
  });
}

/** Colour with alpha multiplied in: alpha('#2457ff', 0.3). */
export function alpha(c: string, a: number): string {
  const p = parseColor(c);
  return rgbaString({ ...p, a: p.a * a });
}

export function toHex(c: string): string {
  const { r, g, b } = parseColor(c);
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Relative luminance (WCAG). */
export function luminance(c: string): number {
  const { r, g, b } = parseColor(c);
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mix towards white (amt > 0) or black (amt < 0). */
export function shade(c: string, amt: number): string {
  return amt >= 0 ? lerpColor(c, '#ffffff', amt) : lerpColor(c, '#000000', -amt);
}

export function readableOn(bg: string, light = '#ffffff', dark = '#0b1220'): string {
  return contrast(bg, light) >= contrast(bg, dark) ? light : dark;
}
