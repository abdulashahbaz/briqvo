import type { Scene, Layer } from '../engine/types';
import { rng } from '../engine/anim';
import { lerpColor, luminance, parseColor, readableOn, shade } from '../engine/color';
import { art, SAMPLE_LOGOS } from './art';
import { FONTS, FORMATS, PALETTES, RESIZABLE_FORMATS, type FontPair, type FormatId, type Palette, type CategoryId } from './catalog';
import type { Ctx, Recipe, TextOpts } from './kit';
import { linear } from './kit';
import { PACKS } from './packs';

export interface TemplateParams {
  format: FormatId;
  palette: Palette;
  fonts: FontPair;
  copy: Record<string, string>;
  logoSrc: string;
  logoTint: boolean;
  /** Per image slot: '' = generated default art. */
  images: string[];
  speed: number;
  seed: number;
}

export interface Template {
  id: string;
  recipe: Recipe;
  variantIndex: number;
  name: string;
  variantName: string;
  category: CategoryId;
  tags: string[];
  params: TemplateParams;
  isNew: boolean;
  /** Stable pseudo-popularity used for "Popular" sorting until real analytics exist. */
  popularity: number;
}

export function formatsOf(r: Recipe): FormatId[] {
  return r.formats ?? (r.slides ? ['carousel'] : RESIZABLE_FORMATS);
}

export function sceneSize(r: Recipe, format: FormatId): { w: number; h: number; slides: number } {
  if (format === 'carousel') {
    const slides = r.slides ?? 5;
    return { w: FORMATS.carousel.w * slides, h: FORMATS.carousel.h, slides };
  }
  const f = FORMATS[format];
  return { w: f.w, h: f.h, slides: 1 };
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function defaultParams(r: Recipe, variantIndex: number): TemplateParams {
  const v = r.variants[variantIndex];
  const copy: Record<string, string> = {};
  for (const f of r.fields) copy[f.key] = v.copy?.[f.key] ?? f.default;
  const formats = formatsOf(r);
  const format = v.format && formats.includes(v.format) ? v.format : r.defaultFormat ?? formats[0];
  const logo = SAMPLE_LOGOS[v.logo ?? 'orbit'] ?? SAMPLE_LOGOS.orbit;
  return {
    format,
    palette: PALETTES[v.palette] ?? PALETTES.azure,
    fonts: FONTS[v.fonts] ?? FONTS.grotesk,
    copy,
    logoSrc: logo.src,
    logoTint: true,
    images: (r.images ?? []).map(() => ''),
    speed: 1,
    seed: v.seed ?? variantIndex + 1,
  };
}

export function buildScene(r: Recipe, params: TemplateParams): Scene {
  const { w: W, h: H, slides } = sceneSize(r, params.format);
  const u = Math.min(params.format === 'carousel' ? FORMATS.carousel.w : W, H) / 100;
  const p = params.palette;
  const f = params.fonts;
  const imgs = (r.images ?? []).map((slot, i) => params.images[i] || art(slot.art, p, params.seed * 10 + i));
  const fmt = params.format;
  const x: Ctx = {
    W,
    H,
    u,
    cx: W / 2,
    cy: H / 2,
    format: fmt,
    aspect: W / H,
    isSquare: fmt === 'square',
    isPortrait: fmt === 'portrait' || fmt === 'carousel',
    isStory: fmt === 'story',
    isLandscape: fmt === 'landscape',
    tall: fmt === 'portrait' || fmt === 'story' || fmt === 'carousel',
    slides,
    slideW: W / slides,
    p,
    f,
    c: params.copy,
    logoSrc: params.logoSrc,
    logoTint: params.logoTint,
    img: imgs,
    seed: params.seed,
    rand: rng(params.seed * 9973 + 17),
    pick(o) {
      const v = (o as Record<string, unknown>)[fmt];
      return (v === undefined ? o.default : v) as never;
    },
    title(id, s, o: TextOpts) {
      const size = typeof o.size === 'number' ? o.size * f.displayScale : o.size;
      return {
        type: 'text',
        id,
        text: s,
        font: f.display,
        weight: f.displayWeight,
        tracking: f.displayTracking,
        lineHeight: 1.02,
        fill: p.fg,
        align: 'center',
        x: W / 2,
        y: H / 2,
        ...o,
        size,
      };
    },
    body(id, s, o: TextOpts) {
      return {
        type: 'text',
        id,
        text: s,
        font: f.body,
        weight: f.bodyWeight,
        lineHeight: 1.35,
        fill: p.fg,
        align: 'center',
        x: W / 2,
        y: H / 2,
        ...o,
      };
    },
    logo(id, o) {
      const { size, color, ...rest } = o;
      return {
        type: 'image',
        id,
        src: params.logoSrc,
        fit: 'contain',
        w: size,
        h: size,
        x: W / 2,
        y: H / 2,
        role: 'logo',
        ...(rest as object),
        ...(params.logoTint ? { tint: color ?? p.fg } : {}),
      };
    },
    grad(angle = 135, a = p.bg, b = p.bg2) {
      return linear(angle, a, b);
    },
  };
  const out = r.build(x);
  const baseDuration = out.duration ?? r.duration;
  const speed = params.speed || 1;
  return {
    w: W,
    h: H,
    duration: baseDuration / speed,
    speed,
    background: out.background ?? p.bg,
    layers: out.layers,
    slides: slides > 1 ? slides : undefined,
    fonts: [`${f.display}:${f.displayWeight}`, `${f.body}:${f.bodyWeight}`],
  };
}

// ---------------------------------------------------------------- brand kit

export interface BrandKit {
  enabled: boolean;
  name: string;
  primary: string;
  secondary: string;
  dark: string;
  light: string;
  fonts: string; // FONTS id
  logoSrc: string; // '' = keep template sample logo
  logoTint: boolean;
}

export const DEFAULT_BRAND: BrandKit = {
  enabled: false,
  name: 'Your Brand',
  primary: '#1F5BFF',
  secondary: '#5FA8FF',
  dark: '#0A1633',
  light: '#FFFFFF',
  fonts: 'grotesk',
  logoSrc: '',
  logoTint: false,
};

function saturation(c: string) {
  const { r, g, b } = parseColor(c);
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  return mx === 0 ? 0 : (mx - mn) / mx;
}

/** Map a brand kit onto a template palette, keeping the template's light/dark/vivid mood. */
export function brandPalette(base: Palette, b: BrandKit): Palette {
  const L = luminance(base.bg);
  const vivid = saturation(base.bg) > 0.45 && L > 0.08 && L < 0.75;
  let bg: string;
  let accent: string;
  let accent2: string;
  if (vivid) {
    bg = b.primary;
    accent = luminance(b.primary) > 0.5 ? b.dark : b.light;
    accent2 = b.secondary;
  } else if (L < 0.2) {
    bg = b.dark;
    accent = b.primary;
    accent2 = b.secondary;
  } else {
    bg = b.light;
    accent = b.primary;
    accent2 = b.secondary;
  }
  const fg = readableOn(bg, '#FFFFFF', b.dark);
  return {
    id: 'brand',
    name: 'Brand',
    bg,
    bg2: lerpColor(bg, vivid ? shade(b.primary, -0.3) : b.primary, vivid ? 0.6 : 0.12),
    surface: lerpColor(bg, fg, 0.06),
    fg,
    muted: lerpColor(fg, bg, 0.42),
    accent,
    accent2,
    onAccent: readableOn(accent, '#FFFFFF', b.dark),
  };
}

export function applyBrand(params: TemplateParams, b: BrandKit): TemplateParams {
  if (!b.enabled) return params;
  const copy = { ...params.copy };
  for (const key of ['brand', 'name', 'company', 'handle']) {
    if (key in copy && b.name) copy[key] = key === 'handle' ? '@' + b.name.toLowerCase().replace(/\s+/g, '') : b.name;
  }
  return {
    ...params,
    palette: brandPalette(params.palette, b),
    fonts: FONTS[b.fonts] ?? params.fonts,
    copy,
    logoSrc: b.logoSrc || params.logoSrc,
    logoTint: b.logoSrc ? b.logoTint : params.logoTint,
  };
}

// ---------------------------------------------------------------- catalogue

function buildTemplates(): Template[] {
  const out: Template[] = [];
  const seen = new Set<string>();
  const NEW_RECIPES = new Set<string>();
  for (const pack of PACKS) for (const r of pack) if (r.tags.includes('new')) NEW_RECIPES.add(r.id);
  for (const pack of PACKS) {
    for (const r of pack) {
      r.variants.forEach((v, i) => {
        let id = `${r.id}--${slugify(v.name)}`;
        while (seen.has(id)) id += '-x';
        seen.add(id);
        const rnd = rng(id.length * 131 + i * 7 + r.id.charCodeAt(0));
        out.push({
          id,
          recipe: r,
          variantIndex: i,
          name: r.name,
          variantName: v.name,
          category: r.category,
          tags: r.tags,
          params: defaultParams(r, i),
          isNew: NEW_RECIPES.has(r.id) || (i === 0 && rnd() > 0.8),
          popularity: Math.round(rnd() * 1000) + (i === 0 ? 400 : 0),
        });
      });
    }
  }
  return out;
}

let _templates: Template[] | null = null;
export function allTemplates(): Template[] {
  if (!_templates) _templates = buildTemplates();
  return _templates;
}

export function templateById(id: string): Template | undefined {
  return allTemplates().find((t) => t.id === id);
}

export function recipeById(id: string): Recipe | undefined {
  for (const pack of PACKS) for (const r of pack) if (r.id === id) return r;
  return undefined;
}

/** Ids must be unique inside a scene; helper for validation in dev. */
export function duplicateLayerIds(layers: Layer[]): string[] {
  const seen = new Set<string>();
  const dup: string[] = [];
  const walk = (ls: Layer[]) =>
    ls.forEach((l) => {
      if (seen.has(l.id)) dup.push(l.id);
      seen.add(l.id);
      if (l.type === 'group') walk(l.children);
    });
  walk(layers);
  return dup;
}
