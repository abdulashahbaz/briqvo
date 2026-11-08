import { create } from 'zustand';
import type { Project, LayerOverride } from '../lib/project';
import type { Layer } from '../engine/types';
import type { TemplateParams } from '../templates/registry';

type Snapshot = Pick<Project, 'params' | 'overrides' | 'extra' | 'name'>;

const snap = (p: Project): Snapshot => ({ params: p.params, overrides: p.overrides, extra: p.extra, name: p.name });

interface EditorState {
  project: Project | null;
  past: Snapshot[];
  future: Snapshot[];
  lastKey: string | null;
  lastAt: number;
  selected: string | null;
  dirty: number;
  load: (p: Project) => void;
  /** Apply an edit. Edits sharing `key` within 700ms merge into one undo step. */
  edit: (fn: (p: Project) => Project, key?: string) => void;
  setParams: (patch: Partial<TemplateParams>, key?: string) => void;
  setOverride: (id: string, patch: Partial<LayerOverride> | null, key?: string) => void;
  addLayer: (L: Layer) => void;
  removeExtra: (id: string) => void;
  undo: () => void;
  redo: () => void;
  select: (id: string | null) => void;
}

export const useEditor = create<EditorState>((set, get) => ({
  project: null,
  past: [],
  future: [],
  lastKey: null,
  lastAt: 0,
  selected: null,
  dirty: 0,
  load: (p) => set({ project: p, past: [], future: [], selected: null, lastKey: null, dirty: 0 }),
  edit: (fn, key) => {
    const { project, past, lastKey, lastAt } = get();
    if (!project) return;
    const now = performance.now();
    const merge = key && key === lastKey && now - lastAt < 700;
    const next = { ...fn(project), updatedAt: Date.now() };
    set({
      project: next,
      past: merge ? past : [...past.slice(-80), snap(project)],
      future: [],
      lastKey: key ?? null,
      lastAt: now,
      dirty: get().dirty + 1,
    });
  },
  setParams: (patch, key) => get().edit((p) => ({ ...p, params: { ...p.params, ...patch } }), key),
  setOverride: (id, patch, key) =>
    get().edit((p) => {
      const overrides = { ...p.overrides };
      if (patch === null) delete overrides[id];
      else overrides[id] = { ...overrides[id], ...patch };
      return { ...p, overrides };
    }, key),
  addLayer: (L) => {
    get().edit((p) => ({ ...p, extra: [...p.extra, L] }));
    set({ selected: L.id });
  },
  removeExtra: (id) => {
    get().edit((p) => {
      const overrides = { ...p.overrides };
      delete overrides[id];
      return { ...p, extra: p.extra.filter((l) => l.id !== id), overrides };
    });
    set({ selected: null });
  },
  undo: () => {
    const { project, past, future } = get();
    if (!project || !past.length) return;
    const prev = past[past.length - 1];
    set({ project: { ...project, ...prev, updatedAt: Date.now() }, past: past.slice(0, -1), future: [snap(project), ...future], lastKey: null, dirty: get().dirty + 1 });
  },
  redo: () => {
    const { project, past, future } = get();
    if (!project || !future.length) return;
    const nxt = future[0];
    set({ project: { ...project, ...nxt, updatedAt: Date.now() }, past: [...past, snap(project)], future: future.slice(1), lastKey: null, dirty: get().dirty + 1 });
  },
  select: (id) => set({ selected: id }),
}));

/** Playback clock lives in its own store so 60fps updates only touch the stage & timeline. */
interface ClockState {
  time: number;
  playing: boolean;
  loop: boolean;
  setTime: (t: number) => void;
  setPlaying: (v: boolean) => void;
  setLoop: (v: boolean) => void;
}

export const useClock = create<ClockState>((set) => ({
  time: 0,
  playing: true,
  loop: true,
  setTime: (t) => set({ time: t }),
  setPlaying: (v) => set({ playing: v }),
  setLoop: (v) => set({ loop: v }),
}));
