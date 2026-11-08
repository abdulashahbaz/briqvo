/**
 * Dev contact sheet: renders templates at several moments so recipes can be
 * reviewed as a single screenshot (see scripts/sheet.mjs).
 *
 * Query params:
 *   pack=logo-a       only recipes from that pack folder (matches recipe ids in PACK_IDS)
 *   cat=logo          only that category
 *   recipe=orbit-reveal
 *   variants=all|first (default first)
 *   format=story      force a format (magic-resize check)
 *   times=0.15,0.4,0.7,1   fractions of duration
 *   h=220             thumbnail height in css px
 */
import { renderFrame, assets } from '../engine';
import { GOOGLE_FONTS_HREF, type FormatId } from '../templates/catalog';
import { allTemplates, buildScene, duplicateLayerIds, formatsOf } from '../templates/registry';
import { PACKS } from '../templates/packs';

const PACK_NAMES = ['starter', 'logo-a', 'logo-b', 'carousel', 'social', 'motion', 'product'];

assets.useFontStylesheet(GOOGLE_FONTS_HREF);

const q = new URLSearchParams(location.search);
const pack = q.get('pack');
const cat = q.get('cat');
const recipe = q.get('recipe');
const allVariants = q.get('variants') === 'all';
const forceFormat = q.get('format') as FormatId | null;
const times = (q.get('times') ?? '0.12,0.3,0.55,1').split(',').map(Number);
const thumbH = Number(q.get('h') ?? 220);

const packIds = pack ? new Set(PACKS[PACK_NAMES.indexOf(pack)]?.map((r) => r.id) ?? []) : null;

let list = allTemplates().filter(
  (t) => (!packIds || packIds.has(t.recipe.id)) && (!cat || t.category === cat) && (!recipe || t.recipe.id === recipe),
);
if (!allVariants) list = list.filter((t) => t.variantIndex === 0);

async function main() {
  const root = document.getElementById('root')!;
  const summary = document.createElement('div');
  summary.style.padding = '8px 14px';
  summary.textContent = `${list.length} templates`;
  root.appendChild(summary);
  const jobs: (() => void)[] = [];
  for (const t of list) {
    const row = document.createElement('div');
    row.className = 'row';
    const meta = document.createElement('div');
    meta.className = 'meta';
    root.appendChild(row);
    row.appendChild(meta);
    try {
      const params = { ...t.params };
      if (forceFormat && formatsOf(t.recipe).includes(forceFormat)) params.format = forceFormat;
      const scene = buildScene(t.recipe, params);
      const dups = duplicateLayerIds(scene.layers);
      meta.innerHTML = `<b>${t.name}</b><span>${t.id}<br>${t.category} · ${params.format} · ${scene.duration.toFixed(1)}s</span>${
        dups.length ? `<div class="err">duplicate ids: ${dups.join(', ')}</div>` : ''
      }`;
      await assets.prepare(scene);
      const scale = thumbH / scene.h;
      const maxW = scene.slides ? 1400 : 99999;
      const s = Math.min(scale, maxW / scene.w);
      for (const f of times) {
        const c = document.createElement('canvas');
        c.width = Math.round(scene.w * s * 2);
        c.height = Math.round(scene.h * s * 2);
        c.style.width = c.width / 2 + 'px';
        c.style.height = c.height / 2 + 'px';
        c.title = `t=${(f * scene.duration).toFixed(2)}s`;
        row.appendChild(c);
        jobs.push(() => renderFrame(c.getContext('2d')!, scene, f * scene.duration - 1e-4, { scale: s * 2 }));
      }
    } catch (e) {
      meta.innerHTML = `<b>${t.name}</b><div class="err">${(e as Error).stack ?? e}</div>`;
    }
  }
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 300));
  jobs.forEach((j) => j());
  // Re-render once more after any late font/image loads.
  await new Promise((r) => setTimeout(r, 600));
  jobs.forEach((j) => j());
  document.body.dataset.ready = '1';
}

main();
