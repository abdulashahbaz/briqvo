import type { Layer, Scene, Paint, Anim } from '../engine/types';
import { offsetAnim, scaleAnim } from '../engine/anim';
import { buildScene, recipeById, templateById, type Template, type TemplateParams } from '../templates/registry';
import { idb } from './idb';

/** Non-destructive per-layer edits, re-applied whenever the recipe is rebuilt. */
export interface LayerOverride {
  dx?: number;
  dy?: number;
  dt?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  hidden?: boolean;
  fill?: string;
  text?: string;
}

export interface Project {
  id: string;
  name: string;
  templateId: string;
  recipeId: string;
  variantIndex: number;
  params: TemplateParams;
  overrides: Record<string, LayerOverride>;
  extra: Layer[];
  createdAt: number;
  updatedAt: number;
  thumb?: string;
}

export interface ProjectMeta {
  id: string;
  name: string;
  templateId: string;
  updatedAt: number;
  thumb?: string;
  format: string;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function newProject(t: Template, params?: TemplateParams): Project {
  const now = Date.now();
  return {
    id: uid(),
    name: `${t.name} · ${t.variantName}`,
    templateId: t.id,
    recipeId: t.recipe.id,
    variantIndex: t.variantIndex,
    params: structuredClone(params ?? t.params),
    overrides: {},
    extra: [],
    createdAt: now,
    updatedAt: now,
  };
}

function applyOverride(L: Layer, o: LayerOverride | undefined, map: Record<string, LayerOverride>): Layer {
  let out: Layer = L;
  if (o) {
    const next: Record<string, unknown> = { ...L };
    if (o.dx) next.x = offsetAnim(L.x, o.dx);
    if (o.dy) next.y = offsetAnim(L.y, o.dy);
    if (o.dt) next.dt = (L.dt ?? 0) + o.dt;
    if (o.scale !== undefined && o.scale !== 1) next.scale = scaleAnim(L.scale, o.scale);
    if (o.rotation) next.rotation = offsetAnim(L.rotation as Anim<number> | undefined, o.rotation);
    if (o.opacity !== undefined && o.opacity !== 1) next.opacity = scaleAnim(L.opacity, o.opacity);
    if (o.hidden) next.hidden = true;
    if (o.fill !== undefined && 'fill' in L) next.fill = o.fill as Paint;
    if (o.fill !== undefined && L.type === 'path' && L.fill === undefined) next.stroke = o.fill;
    if (o.fill !== undefined && L.type === 'image') next.tint = o.fill;
    if (o.text !== undefined && L.type === 'text') next.text = o.text;
    out = next as unknown as Layer;
  }
  if (out.type === 'group') {
    const kids = out.children.map((c) => applyOverride(c, map[c.id], map));
    out = { ...out, children: kids };
  }
  return out;
}

export function projectScene(p: Project): Scene | null {
  const r = recipeById(p.recipeId);
  if (!r) return null;
  const base = buildScene(r, p.params);
  const layers = [...base.layers, ...p.extra].map((L) => applyOverride(L, p.overrides[L.id], p.overrides));
  return { ...base, layers };
}

export function templateOf(p: Project) {
  return templateById(p.templateId);
}

// ---------------------------------------------------------------- persistence

const INDEX = 'projects:index';

export async function listProjects(): Promise<ProjectMeta[]> {
  return ((await idb.get<ProjectMeta[]>(INDEX)) ?? []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<Project | undefined> {
  return idb.get<Project>('project:' + id);
}

export async function saveProject(p: Project): Promise<void> {
  const meta: ProjectMeta = { id: p.id, name: p.name, templateId: p.templateId, updatedAt: p.updatedAt, thumb: p.thumb, format: p.params.format };
  await idb.set('project:' + p.id, p);
  const idx = (await idb.get<ProjectMeta[]>(INDEX)) ?? [];
  await idb.set(INDEX, [meta, ...idx.filter((m) => m.id !== p.id)]);
}

export async function deleteProject(id: string): Promise<void> {
  await idb.del('project:' + id);
  const idx = (await idb.get<ProjectMeta[]>(INDEX)) ?? [];
  await idb.set(INDEX, idx.filter((m) => m.id !== id));
}

export async function duplicateProject(id: string): Promise<Project | undefined> {
  const p = await getProject(id);
  if (!p) return undefined;
  const now = Date.now();
  const copy: Project = { ...structuredClone(p), id: uid(), name: p.name + ' (copy)', createdAt: now, updatedAt: now };
  await saveProject(copy);
  return copy;
}

export { uid };
