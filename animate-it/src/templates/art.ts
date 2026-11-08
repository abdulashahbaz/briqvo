/**
 * Procedural artwork used as default imagery in templates (no stock photos,
 * no licensing). Every function returns an SVG data URI tuned to a palette.
 * Users replace these with their own uploads in the editor.
 */
import type { Palette } from './catalog';
import { rng } from '../engine/anim';
import { shade, alpha } from '../engine/color';

const enc = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/\s+/g, ' ').trim());

export type ArtKind = 'landscape' | 'blobs' | 'portrait' | 'product' | 'sphere' | 'grid' | 'waves' | 'city' | 'food' | 'abstract';

export function landscape(p: Palette, seed = 1): string {
  const r = rng(seed);
  const sunX = 30 + r() * 40;
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(p.accent2, 0.35)}"/><stop offset="0.65" stop-color="${shade(p.accent, 0.55)}"/><stop offset="1" stop-color="${shade(p.accent, 0.8)}"/></linearGradient></defs>
  <rect width="800" height="600" fill="url(#s)"/>
  <circle cx="${sunX * 8}" cy="300" r="78" fill="${shade(p.accent2, 0.85)}"/>
  <path d="M0 380 L120 300 L210 350 L330 240 L450 340 L560 280 L680 330 L800 270 L800 600 L0 600Z" fill="${shade(p.accent, 0.15)}" opacity=".85"/>
  <path d="M0 430 L160 360 L290 420 L420 350 L560 430 L700 380 L800 410 L800 600 L0 600Z" fill="${shade(p.accent, -0.25)}"/>
  <path d="M0 500 Q200 450 400 500 T800 490 L800 600 L0 600Z" fill="${shade(p.accent, -0.55)}"/>
  </svg>`);
}

export function blobs(p: Palette, seed = 1): string {
  const r = rng(seed * 31 + 7);
  const cols = [p.accent, p.accent2, shade(p.accent, 0.4), shade(p.accent2, -0.2)];
  const circles = cols
    .map((c, i) => `<circle cx="${100 + r() * 600}" cy="${80 + r() * 440}" r="${160 + r() * 140}" fill="${c}" opacity="${0.75 - i * 0.08}"/>`)
    .join('');
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
  <defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter></defs>
  <rect width="800" height="600" fill="${p.bg2}"/><g filter="url(#b)">${circles}</g></svg>`);
}

export function portrait(p: Palette, seed = 1): string {
  const r = rng(seed * 17 + 3);
  const skin = ['#F2C6A8', '#D9A07B', '#A86B4A', '#7A4A33', '#EBC1A0'][Math.floor(r() * 5)];
  const hair = ['#1E1714', '#3B2A20', '#6B4A2E', '#C99A5B', '#151515'][Math.floor(r() * 5)];
  const shirt = [p.accent, p.accent2, shade(p.fg, 0.2), shade(p.accent, -0.3)][Math.floor(r() * 4)];
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(p.accent2, 0.6)}"/><stop offset="1" stop-color="${shade(p.accent, 0.35)}"/></linearGradient></defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <path d="M60 400 Q70 290 200 280 Q330 290 340 400Z" fill="${shirt}"/>
  <rect x="172" y="230" width="56" height="60" rx="20" fill="${shade(skin, -0.12)}"/>
  <ellipse cx="200" cy="180" rx="72" ry="84" fill="${skin}"/>
  <path d="M124 176 Q120 92 200 88 Q284 90 278 178 Q262 128 200 126 Q146 128 124 176Z" fill="${hair}"/>
  </svg>`);
}

export function product(p: Palette, seed = 1): string {
  const r = rng(seed * 13 + 5);
  const body = r() > 0.5 ? p.accent : shade(p.accent2, -0.1);
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs>
  <radialGradient id="bg" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${shade(p.bg2, 0.4)}"/><stop offset="1" stop-color="${p.bg2}"/></radialGradient>
  <linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="${shade(body, -0.25)}"/><stop offset=".35" stop-color="${shade(body, 0.25)}"/><stop offset=".6" stop-color="${body}"/><stop offset="1" stop-color="${shade(body, -0.35)}"/></linearGradient>
  <linearGradient id="c" x1="0" x2="1"><stop offset="0" stop-color="#222"/><stop offset=".4" stop-color="#555"/><stop offset="1" stop-color="#111"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="505" rx="130" ry="20" fill="${alpha('#000000', 0.18)}"/>
  <rect x="215" y="190" width="170" height="315" rx="36" fill="url(#b)"/>
  <rect x="250" y="120" width="100" height="80" rx="14" fill="url(#c)"/>
  <rect x="235" y="300" width="130" height="90" rx="10" fill="${alpha('#ffffff', 0.85)}"/>
  <rect x="255" y="322" width="90" height="12" rx="6" fill="${shade(body, -0.3)}"/>
  <rect x="270" y="345" width="60" height="8" rx="4" fill="${alpha(shade(body, -0.3), 0.6)}"/>
  <rect x="232" y="205" width="22" height="280" rx="11" fill="${alpha('#ffffff', 0.25)}"/>
  </svg>`);
}

export function sphere(p: Palette): string {
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs><radialGradient id="s" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".2" stop-color="${shade(p.accent2, 0.3)}"/><stop offset=".7" stop-color="${p.accent}"/><stop offset="1" stop-color="${shade(p.accent, -0.6)}"/></radialGradient></defs>
  <circle cx="300" cy="300" r="260" fill="url(#s)"/></svg>`);
}

export function grid(p: Palette, seed = 1): string {
  const r = rng(seed * 7 + 1);
  let cells = '';
  for (let y = 0; y < 6; y++)
    for (let x = 0; x < 8; x++) {
      const v = r();
      const c = v > 0.8 ? p.accent : v > 0.6 ? p.accent2 : v > 0.35 ? shade(p.bg2, -0.06) : p.bg2;
      const shape = r() > 0.5 ? `<circle cx="${x * 100 + 50}" cy="${y * 100 + 50}" r="46" fill="${c}"/>` : `<rect x="${x * 100 + 4}" y="${y * 100 + 4}" width="92" height="92" rx="${r() > 0.5 ? 46 : 8}" fill="${c}"/>`;
      cells += shape;
    }
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"><rect width="800" height="600" fill="${p.bg}"/>${cells}</svg>`);
}

export function waves(p: Palette): string {
  let paths = '';
  for (let i = 0; i < 7; i++) {
    const y = 120 + i * 60;
    paths += `<path d="M0 ${y} C200 ${y - 80} 400 ${y + 80} 800 ${y - 20} L800 600 L0 600Z" fill="${shade(p.accent, 0.5 - i * 0.12)}" opacity="0.9"/>`;
  }
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"><rect width="800" height="600" fill="${shade(p.accent2, 0.6)}"/>${paths}</svg>`);
}

export function city(p: Palette, seed = 1): string {
  const r = rng(seed * 11 + 2);
  let b = '';
  let x = 0;
  while (x < 800) {
    const w = 50 + r() * 70;
    const h = 150 + r() * 300;
    b += `<rect x="${x}" y="${600 - h}" width="${w - 6}" height="${h}" fill="${shade(p.accent, -0.4 - r() * 0.3)}"/>`;
    for (let wy = 600 - h + 20; wy < 580; wy += 28)
      for (let wx = x + 10; wx < x + w - 18; wx += 18) if (r() > 0.55) b += `<rect x="${wx}" y="${wy}" width="8" height="12" fill="${shade(p.accent2, 0.5)}" opacity=".8"/>`;
    x += w;
  }
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(p.accent, -0.6)}"/><stop offset="1" stop-color="${shade(p.accent2, -0.1)}"/></linearGradient></defs>
  <rect width="800" height="600" fill="url(#s)"/><circle cx="620" cy="140" r="50" fill="${shade(p.accent2, 0.8)}"/>${b}</svg>`);
}

export function food(p: Palette, seed = 1): string {
  const r = rng(seed * 5 + 9);
  let toppings = '';
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const d = 40 + r() * 120;
    toppings += `<circle cx="${300 + Math.cos(a) * d}" cy="${300 + Math.sin(a) * d}" r="${12 + r() * 16}" fill="${r() > 0.5 ? '#C8342B' : '#3E8E41'}"/>`;
  }
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="${p.bg2}"/>
  <circle cx="300" cy="310" r="230" fill="${alpha('#000000', 0.12)}"/>
  <circle cx="300" cy="300" r="230" fill="#F4F1EA"/>
  <circle cx="300" cy="300" r="190" fill="#E8B04B"/>
  <circle cx="300" cy="300" r="170" fill="#F3D27A"/>${toppings}</svg>`);
}

export function abstract(p: Palette, seed = 1): string {
  const r = rng(seed * 3 + 4);
  return enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
  <rect width="800" height="800" fill="${p.accent}"/>
  <circle cx="${200 + r() * 100}" cy="${250 + r() * 100}" r="220" fill="${p.accent2}"/>
  <rect x="${380 + r() * 60}" y="${380 + r() * 60}" width="340" height="340" rx="40" fill="${p.bg}" transform="rotate(${r() * 30 - 15} 550 550)"/>
  <path d="M0 800 L320 520 L560 800Z" fill="${p.fg}" opacity=".9"/>
  </svg>`);
}

export function art(kind: ArtKind, p: Palette, seed = 1): string {
  switch (kind) {
    case 'landscape':
      return landscape(p, seed);
    case 'blobs':
      return blobs(p, seed);
    case 'portrait':
      return portrait(p, seed);
    case 'product':
      return product(p, seed);
    case 'sphere':
      return sphere(p);
    case 'grid':
      return grid(p, seed);
    case 'waves':
      return waves(p);
    case 'city':
      return city(p, seed);
    case 'food':
      return food(p, seed);
    case 'abstract':
      return abstract(p, seed);
  }
}

// ------------------------------------------------------------- sample logos
// Original monochrome marks (tinted at render time). Users upload their own.

const mark = (inner: string) =>
  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${inner}</svg>`);

export const SAMPLE_LOGOS: Record<string, { name: string; src: string }> = {
  orbit: {
    name: 'Orbit',
    src: mark(`<path fill="#000" fill-rule="evenodd" d="M100 20a80 80 0 1 1 0 160a80 80 0 0 1 0-160zm0 36a44 44 0 1 0 0 88a44 44 0 0 0 0-88z"/><circle cx="160" cy="44" r="22" fill="#000"/>`),
  },
  prism: {
    name: 'Prism',
    src: mark(`<path fill="#000" d="M100 14 L186 166 H14 Z M100 70 L60 140 H140 Z" fill-rule="evenodd"/>`),
  },
  bolt: {
    name: 'Bolt',
    // Bolt is cut out (even-odd) so tinting keeps the shape readable.
    src: mark(`<path fill="#000" fill-rule="evenodd" d="M58 10H142A48 48 0 0 1 190 58V142A48 48 0 0 1 142 190H58A48 48 0 0 1 10 142V58A48 48 0 0 1 58 10Z M112 34 L58 112 H96 L86 166 L142 86 H104 Z"/>`),
  },
  petal: {
    name: 'Petal',
    src: mark(`<path fill="#000" d="M100 100 C100 40 60 14 30 30 C14 60 40 100 100 100Z M100 100 C160 100 186 60 170 30 C140 14 100 40 100 100Z M100 100 C100 160 140 186 170 170 C186 140 160 100 100 100Z M100 100 C40 100 14 140 30 170 C60 186 100 160 100 100Z"/>`),
  },
  stack: {
    name: 'Stack',
    src: mark(`<rect x="20" y="28" width="160" height="36" rx="18" fill="#000"/><rect x="40" y="82" width="140" height="36" rx="18" fill="#000"/><rect x="20" y="136" width="120" height="36" rx="18" fill="#000"/>`),
  },
  knot: {
    name: 'Knot',
    src: mark(`<path fill="none" stroke="#000" stroke-width="30" stroke-linecap="round" d="M60 60 L140 140 M140 60 L60 140"/><circle cx="100" cy="100" r="82" fill="none" stroke="#000" stroke-width="18"/>`),
  },
  wave: {
    name: 'Wave',
    src: mark(`<path fill="#000" d="M20 100 C50 40 80 40 100 100 C120 160 150 160 180 100 L180 170 Q180 180 170 180 H30 Q20 180 20 170Z"/><circle cx="56" cy="44" r="20" fill="#000"/>`),
  },
  arc: {
    name: 'Arc',
    src: mark(`<path fill="#000" d="M20 180 A80 80 0 0 1 180 180 H140 A40 40 0 0 0 60 180 Z"/><circle cx="100" cy="46" r="26" fill="#000"/>`),
  },
};

export const SAMPLE_LOGO_IDS = Object.keys(SAMPLE_LOGOS);
