import { RotateCcw, Eye, EyeOff, Trash2, MousePointerClick } from 'lucide-react';
import type { Layer, Scene } from '../engine/types';
import { findLayer } from '../engine/hittest';
import { sample } from '../engine/anim';
import { toHex } from '../engine/color';
import { useEditor } from './store';
import { recipeById, formatsOf } from '../templates/registry';
import { FORMATS } from '../templates/catalog';
import { ColorField } from '../ui/BrandKitDialog';
import { LayerIcon, layerLabel } from './Timeline';

function Num({ label, value, onChange, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; step?: number; suffix?: string }) {
  return (
    <label className="num">
      <span>{label}</span>
      <input type="number" className="input" step={step} value={Number.isFinite(value) ? +value.toFixed(2) : 0} onChange={(e) => onChange(Number(e.target.value))} />
      {suffix && <em>{suffix}</em>}
    </label>
  );
}

function baseFill(L: Layer): string | null {
  if (L.type === 'text' || L.type === 'rect' || L.type === 'ellipse' || (L.type === 'path' && L.fill !== undefined)) {
    const f = sample(L.fill as never, 0, '#000000' as never) as unknown;
    return typeof f === 'string' ? f : null;
  }
  if (L.type === 'path') return typeof L.stroke === 'string' ? L.stroke : null;
  if (L.type === 'image') return typeof L.tint === 'string' ? L.tint : null;
  return null;
}

export function Inspector({ scene }: { scene: Scene }) {
  const project = useEditor((s) => s.project)!;
  const selected = useEditor((s) => s.selected);
  const setOverride = useEditor((s) => s.setOverride);
  const setParams = useEditor((s) => s.setParams);
  const select = useEditor((s) => s.select);
  const recipe = recipeById(project.recipeId)!;
  const L = selected ? findLayer(scene.layers, selected) : null;

  if (!L) {
    const formats = formatsOf(recipe);
    return (
      <aside className="ed-right">
        <div className="ed-scroll">
          <div className="ed-section">
            <h4>Format</h4>
            <div style={{ display: 'grid', gap: 6 }}>
              {formats.map((f) => (
                <button key={f} className="fmt-opt" aria-pressed={project.params.format === f} onClick={() => setParams({ format: f })}>
                  <i style={{ aspectRatio: f === 'carousel' ? '3 / 1' : `${FORMATS[f].w} / ${FORMATS[f].h}` }} />
                  <span>
                    <b>
                      {FORMATS[f].label} {FORMATS[f].ratio}
                    </b>
                    <small>{FORMATS[f].hint}</small>
                  </span>
                </button>
              ))}
            </div>
            <h4>Scene</h4>
            <dl className="kv">
              <dt>Size</dt>
              <dd>
                {scene.w} × {scene.h}
                {scene.slides ? ` (${scene.slides} slides)` : ''}
              </dd>
              <dt>Duration</dt>
              <dd>{scene.duration.toFixed(2)}s</dd>
              <dt>Layers</dt>
              <dd>{scene.layers.length}</dd>
            </dl>
            <div className="hint">
              <MousePointerClick size={18} />
              Click anything on the canvas to select it. Drag to move, or drag its bar on the timeline to retime it.
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const o = project.overrides[L.id] ?? {};
  const key = (k: string) => `${k}:${L.id}`;
  const fill = baseFill(L);
  const fieldForText = L.type === 'text' ? recipe.fields.find((f) => (project.params.copy[f.key] ?? '') === L.text) : undefined;
  const isExtra = project.extra.some((e) => e.id === L.id);

  return (
    <aside className="ed-right">
      <div className="ed-scroll">
        <div className="ed-section">
          <div className="insp-head">
            <LayerIcon L={L} size={16} />
            <b>{layerLabel(L)}</b>
            <span className="muted" style={{ fontSize: 12 }}>
              {L.type}
            </span>
          </div>

          {L.type === 'text' && (
            <label className="field" style={{ display: 'block' }}>
              <span className="label">{fieldForText ? fieldForText.label : 'Text'}</span>
              <textarea
                className="input"
                rows={2}
                value={fieldForText ? project.params.copy[fieldForText.key] : o.text ?? L.text}
                onChange={(e) =>
                  fieldForText
                    ? setParams({ copy: { ...project.params.copy, [fieldForText.key]: e.target.value } }, 'copy:' + fieldForText.key)
                    : setOverride(L.id, { text: e.target.value }, key('text'))
                }
              />
            </label>
          )}

          {fill !== null && (
            <ColorField label={L.type === 'image' ? 'Tint' : L.type === 'path' && L.fill === undefined ? 'Stroke' : 'Colour'} value={o.fill ?? toHex(fill)} onChange={(v) => setOverride(L.id, { fill: v }, key('fill'))} />
          )}

          <h4>Transform</h4>
          <div className="num-grid">
            <Num label="X" value={o.dx ?? 0} onChange={(v) => setOverride(L.id, { dx: v }, key('dx'))} suffix="px" />
            <Num label="Y" value={o.dy ?? 0} onChange={(v) => setOverride(L.id, { dy: v }, key('dy'))} suffix="px" />
            <Num label="Scale" value={(o.scale ?? 1) * 100} onChange={(v) => setOverride(L.id, { scale: Math.max(0.01, v / 100) }, key('scale'))} suffix="%" />
            <Num label="Rotate" value={o.rotation ?? 0} onChange={(v) => setOverride(L.id, { rotation: v }, key('rot'))} suffix="°" />
            <Num label="Opacity" value={(o.opacity ?? 1) * 100} onChange={(v) => setOverride(L.id, { opacity: Math.max(0, Math.min(1, v / 100)) }, key('op'))} suffix="%" />
            <Num label="Delay" value={o.dt ?? 0} step={0.05} onChange={(v) => setOverride(L.id, { dt: v }, key('dt'))} suffix="s" />
          </div>
          <p className="muted" style={{ fontSize: 12, margin: '2px 0 14px' }}>
            Offsets are added on top of the template animation, so the motion is kept.
          </p>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className="btn btn-sm btn-outline" onClick={() => setOverride(L.id, { hidden: !o.hidden })}>
              {o.hidden ? <Eye /> : <EyeOff />} {o.hidden ? 'Show' : 'Hide'}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setOverride(L.id, null)} disabled={!project.overrides[L.id]}>
              <RotateCcw /> Reset
            </button>
            {isExtra && (
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => useEditor.getState().removeExtra(L.id)}>
                <Trash2 /> Delete
              </button>
            )}
          </div>
          <button className="btn btn-sm btn-ghost" style={{ marginTop: 14 }} onClick={() => select(null)}>
            ← Scene settings
          </button>
        </div>
      </div>
    </aside>
  );
}
