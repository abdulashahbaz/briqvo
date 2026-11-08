import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Undo2, Redo2, Download, Check, Loader2 } from 'lucide-react';
import { renderFrame } from '../engine';
import { useClock, useEditor } from './store';
import { Stage } from './Stage';
import { Timeline } from './Timeline';
import { LeftPanel } from './Panels';
import { Inspector } from './Inspector';
import { getProject, newProject, projectScene, saveProject } from '../lib/project';
import { templateById, formatsOf } from '../templates/registry';
import { templateParams } from '../lib/scenes';
import { href, navigate, type Route } from '../lib/router';
import { useBrand } from '../lib/store';
import { ExportDialog } from '../ui/ExportDialog';
import { BrandMark } from '../ui/Brand';
import type { FormatId } from '../templates/catalog';
import type { Scene } from '../engine/types';

function thumbnail(scene: Scene): string {
  const max = 360;
  const s = Math.min(max / scene.w, max / scene.h);
  const c = document.createElement('canvas');
  c.width = Math.round(scene.w * s);
  c.height = Math.round(scene.h * s);
  renderFrame(c.getContext('2d')!, scene, scene.duration, { scale: s });
  return c.toDataURL('image/jpeg', 0.82);
}

export function EditorPage({ route }: { route: Route }) {
  const id = route.parts[1];
  const brand = useBrand((s) => s.brand);
  const project = useEditor((s) => s.project);
  const load = useEditor((s) => s.load);
  const dirty = useEditor((s) => s.dirty);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<'saved' | 'saving'>('saved');
  const [exporting, setExporting] = useState(false);
  const saveTimer = useRef<number>(0);

  // Load or create.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (id === 'new') {
        const t = templateById(route.query.get('t') ?? '');
        if (!t) return setError('Template not found.');
        const f = route.query.get('f') as FormatId | null;
        const p = newProject(t, templateParams(t, brand, f && formatsOf(t.recipe).includes(f) ? f : undefined));
        await saveProject(p);
        if (cancelled) return;
        load(p);
        useClock.setState({ time: 0, playing: true });
        navigate(`/editor/${p.id}`, { replace: true });
        return;
      }
      if (useEditor.getState().project?.id === id) return;
      const p = await getProject(id);
      if (cancelled) return;
      if (!p) return setError('This project isn’t saved in this browser.');
      load(p);
      useClock.setState({ time: 0, playing: true });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const scene = useMemo(() => (project ? projectScene(project) : null), [project]);

  // Autosave.
  useEffect(() => {
    if (!project || !scene || dirty === 0) return;
    setSaved('saving');
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      saveTimer.current = 0;
      await saveProject({ ...project, thumb: thumbnail(scene) });
      setSaved('saved');
    }, 700);
  }, [dirty, project, scene]);

  // Flush the pending autosave if the tab is hidden or closed mid-debounce.
  useEffect(() => {
    const flush = () => {
      const p = useEditor.getState().project;
      if (!p || !saveTimer.current) return;
      window.clearTimeout(saveTimer.current);
      saveTimer.current = 0;
      const s = projectScene(p);
      void saveProject({ ...p, thumb: s ? thumbnail(s) : p.thumb });
    };
    const onVis = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Keyboard shortcuts.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const mod = e.metaKey || e.ctrlKey;
      const ed = useEditor.getState();
      const clock = useClock.getState();
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) ed.redo();
        else ed.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        ed.redo();
      } else if (e.key === ' ') {
        e.preventDefault();
        clock.setPlaying(!clock.playing);
      } else if (e.key === 'Escape') {
        ed.select(null);
      } else if (e.key === 'Home') {
        clock.setTime(0);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && ed.selected) {
        if (ed.project?.extra.some((l) => l.id === ed.selected)) ed.removeExtra(ed.selected);
        else ed.setOverride(ed.selected, { hidden: true });
      } else if (ed.selected && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const n = e.shiftKey ? 10 : 1;
        const o = ed.project?.overrides[ed.selected] ?? {};
        const dx = e.key === 'ArrowLeft' ? -n : e.key === 'ArrowRight' ? n : 0;
        const dy = e.key === 'ArrowUp' ? -n : e.key === 'ArrowDown' ? n : 0;
        ed.setOverride(ed.selected, { dx: (o.dx ?? 0) + dx, dy: (o.dy ?? 0) + dy }, 'nudge:' + ed.selected);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  if (error)
    return (
      <div className="empty" style={{ paddingTop: 140 }}>
        <h3 style={{ color: 'var(--ink)' }}>{error}</h3>
        <a className="btn btn-primary" href={href('/templates')}>
          Browse templates
        </a>
      </div>
    );
  if (!project || !scene)
    return (
      <div className="empty" style={{ paddingTop: 140 }}>
        <Loader2 className="spin" />
      </div>
    );

  return (
    <div className="editor">
      <header className="ed-top">
        <a className="btn btn-icon btn-ghost" href={href('/templates')} aria-label="Back to templates">
          <ChevronLeft />
        </a>
        <a href={href('/')} aria-label="Animate It home">
          <BrandMark size={28} />
        </a>
        <input
          className="ed-name"
          value={project.name}
          aria-label="Project name"
          onChange={(e) => useEditor.getState().edit((p) => ({ ...p, name: e.target.value }), 'name')}
        />
        <span className="ed-saved">
          {saved === 'saving' ? (
            'Saving…'
          ) : (
            <>
              <Check size={14} /> Saved
            </>
          )}
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn btn-icon btn-ghost" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={() => useEditor.getState().undo()}>
          <Undo2 />
        </button>
        <button className="btn btn-icon btn-ghost" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={() => useEditor.getState().redo()}>
          <Redo2 />
        </button>
        <button className="btn btn-primary" onClick={() => setExporting(true)}>
          <Download /> Export
        </button>
      </header>
      <LeftPanel scene={scene} />
      <main className="ed-main">
        <Stage scene={scene} />
      </main>
      <Inspector scene={scene} />
      <Timeline scene={scene} />
      {exporting && <ExportDialog scene={scene} fileBase={project.name} stillTime={useClock.getState().time} onClose={() => setExporting(false)} />}
    </div>
  );
}
