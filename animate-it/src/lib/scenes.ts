import type { Scene } from '../engine/types';
import type { FormatId } from '../templates/catalog';
import { applyBrand, buildScene, formatsOf, type BrandKit, type Template, type TemplateParams } from '../templates/registry';

const cache = new Map<string, Scene>();

function brandKey(b: BrandKit) {
  return b.enabled ? [b.name, b.primary, b.secondary, b.dark, b.light, b.fonts, b.logoSrc.length, b.logoSrc.slice(-40), b.logoTint].join(',') : '';
}

export function templateParams(t: Template, brand: BrandKit, format?: FormatId): TemplateParams {
  let p = applyBrand(t.params, brand);
  if (format && format !== p.format && formatsOf(t.recipe).includes(format)) p = { ...p, format };
  return p;
}

/** Memoised scene for gallery previews (template × brand × format). */
export function templateScene(t: Template, brand: BrandKit, format?: FormatId): Scene {
  const key = `${t.id}|${format ?? ''}|${brandKey(brand)}`;
  let s = cache.get(key);
  if (!s) {
    s = buildScene(t.recipe, templateParams(t, brand, format));
    if (cache.size > 800) cache.clear();
    cache.set(key, s);
  }
  return s;
}
