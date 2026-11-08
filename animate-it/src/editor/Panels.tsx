import { useMemo, useState } from 'react';
import { Upload, RotateCcw, Eye, EyeOff, Type, Square, Circle, Image as ImageIcon, Shapes, Trash2 } from 'lucide-react';
import type { Layer, Scene } from '../engine/types';
import { k } from '../engine/anim';
import { useEditor } from './store';
import { recipeById, type TemplateParams } from '../templates/registry';
import { FONT_LIST, PALETTE_LIST, PALETTES, type Palette } from '../templates/catalog';
import { ICONS } from '../templates/kit';
import { art } from '../templates/art';
import { pickFile, readImage } from '../lib/files';
import { uid } from '../lib/project';
import { useUI } from '../lib/store';
import { ColorField } from '../ui/BrandKitDialog';
import { LayerIcon, layerLabel } from './Timeline';

type Tab = 'content' | 'style' | 'layers';

export function LeftPanel({ scene }: { scene: Scene }) {
  const [tab, setTab] = useState<Tab>('content');
  return (
    <aside className="ed-left">
      <div className="ed-tabs" role="tablist">
        {(['content', 'style', 'layers'] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t === 'content' ? 'Content' : t === 'style' ? 'Style' : 'Layers'}
          </button>
        ))}
      </div>
      <div className="ed-scroll">
        {tab === 'content' && <ContentTab />}
        {tab === 'style' && <StyleTab />}
        {tab === 'layers' && <LayersTab scene={scene} />}
      </div>
    </aside>
  );
}

function ContentTab() {
  const project = useEditor((s) => s.project)!;
  const setParams = useEditor((s) => s.setParams);
  const notify = useUI((s) => s.notify);
  const recipe = recipeById(project.recipeId)!;
  const p = project.params;

  const setCopy = (key: string, v: string) => setParams({ copy: { ...p.copy, [key]: v } }, 'copy:' + key);

  const uploadLogo = async () => {
    const f = await pickFile('image/png,image/svg+xml,image/jpeg,image/webp');
    if (!f) return;
    try {
      const src = await readImage(f, 1024);
      setParams({ logoSrc: src, logoTint: false });
    } catch (e) {
      notify((e as Error).message);
    }
  };
  const uploadImage = async (i: number) => {
    const f = await pickFile();
    if (!f) return;
    try {
      const src = await readImage(f, 1800);
      const images = [...p.images];
      images[i] = src;
      setParams({ images });
    } catch (e) {
      notify((e as Error).message);
    }
  };

  return (
    <div className="ed-section">
      <h4>Text</h4>
      {recipe.fields.map((f) => (
        <label key={f.key} className="field" style={{ display: 'block' }}>
          <span className="label">{f.label}</span>
          {f.multiline || (p.copy[f.key] ?? '').length > 34 ? (
            <textarea className="input" rows={2} value={p.copy[f.key] ?? ''} onChange={(e) => setCopy(f.key, e.target.value)} />
          ) : (
            <input className="input" value={p.copy[f.key] ?? ''} onChange={(e) => setCopy(f.key, e.target.value)} />
          )}
        </label>
      ))}
      {recipe.usesLogo && (
        <>
          <h4>Logo</h4>
          <div className="logo-drop">
            <div className="preview" style={{ background: p.logoTint ? '#fff' : p.palette.bg }}>
              <img src={p.logoSrc} alt="" style={p.logoTint ? { filter: 'brightness(0)', opacity: 0.8 } : undefined} />
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <button className="btn btn-sm btn-outline" onClick={uploadLogo}>
                <Upload /> Upload logo
              </button>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
                <button className="toggle" role="switch" aria-checked={p.logoTint} onClick={() => setParams({ logoTint: !p.logoTint })} />
                Recolour to palette
              </label>
            </div>
          </div>
        </>
      )}
      {(recipe.images ?? []).length > 0 && (
        <>
          <h4>Images</h4>
          {(recipe.images ?? []).map((slot, i) => (
            <div key={slot.key} className="img-slot">
              <img src={p.images[i] || art(slot.art, p.palette, p.seed * 10 + i)} alt="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{slot.label}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => uploadImage(i)}>
                    <Upload /> Replace
                  </button>
                  {p.images[i] && (
                    <button
                      className="btn btn-sm btn-ghost btn-icon"
                      aria-label="Reset image"
                      onClick={() => {
                        const images = [...p.images];
                        images[i] = '';
                        setParams({ images });
                      }}
                    >
                      <RotateCcw />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const TOKENS: { key: keyof Palette; label: string }[] = [
  { key: 'bg', label: 'Background' },
  { key: 'bg2', label: 'Background 2' },
  { key: 'fg', label: 'Text' },
  { key: 'muted', label: 'Muted text' },
  { key: 'accent', label: 'Accent' },
  { key: 'accent2', label: 'Accent 2' },
  { key: 'surface', label: 'Surface' },
  { key: 'onAccent', label: 'On accent' },
];

function StyleTab() {
  const project = useEditor((s) => s.project)!;
  const setParams = useEditor((s) => s.setParams);
  const p = project.params;
  return (
    <div className="ed-section">
      <h4>Palette</h4>
      <div className="pal-grid">
        {PALETTE_LIST.map((pal) => (
          <button key={pal.id} className="pal" aria-pressed={p.palette.id === pal.id} onClick={() => setParams({ palette: pal })} title={pal.name}>
            <span style={{ background: pal.bg }} />
            <span style={{ background: pal.accent }} />
            <span style={{ background: pal.fg }} />
            <em>{pal.name}</em>
          </button>
        ))}
      </div>
      <h4>Colours</h4>
      <div className="grid-2">
        {TOKENS.map((t) => (
          <ColorField
            key={t.key}
            label={t.label}
            value={p.palette[t.key]}
            onChange={(v) => setParams({ palette: { ...p.palette, id: 'custom', name: 'Custom', [t.key]: v } }, 'pal:' + t.key)}
          />
        ))}
      </div>
      {p.palette.id === 'custom' && (
        <button className="btn btn-sm btn-ghost" onClick={() => setParams({ palette: PALETTES.azure })}>
          <RotateCcw /> Reset colours
        </button>
      )}
      <h4>Fonts</h4>
      <div style={{ display: 'grid', gap: 6 }}>
        {FONT_LIST.map((f) => (
          <button key={f.id} className="font-opt" aria-pressed={p.fonts.id === f.id} onClick={() => setParams({ fonts: f })}>
            <span style={{ fontFamily: `"${f.display}"`, fontWeight: f.displayWeight, fontSize: 19, letterSpacing: `${f.displayTracking}em` }}>{f.display}</span>
            <span style={{ fontFamily: `"${f.body}"`, fontSize: 12 }} className="muted">
              with {f.body}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function newText(params: TemplateParams, scene: Scene): Layer {
  const u = Math.min(scene.w / (scene.slides ?? 1), scene.h) / 100;
  return {
    type: 'text',
    id: 'user-text-' + uid(),
    name: 'Text',
    text: 'Your text',
    font: params.fonts.display,
    weight: params.fonts.displayWeight,
    tracking: params.fonts.displayTracking,
    size: 9 * u,
    fill: params.palette.fg,
    align: 'center',
    x: scene.w / 2,
    y: scene.h / 2,
    anim: { by: 'word', start: 0.2, dur: 0.8, stagger: 0.08, ease: 'outExpo', from: { y: 1.1 }, mask: true },
  };
}

function LayersTab({ scene }: { scene: Scene }) {
  const project = useEditor((s) => s.project)!;
  const selected = useEditor((s) => s.selected);
  const select = useEditor((s) => s.select);
  const setOverride = useEditor((s) => s.setOverride);
  const addLayer = useEditor((s) => s.addLayer);
  const [icons, setIcons] = useState(false);
  const p = project.params;
  const u = Math.min(scene.w / (scene.slides ?? 1), scene.h) / 100;
  const extraIds = useMemo(() => new Set(project.extra.map((l) => l.id)), [project.extra]);

  const addShape = (kind: 'rect' | 'ellipse') =>
    addLayer({
      type: kind,
      id: `user-${kind}-${uid()}`,
      name: kind === 'rect' ? 'Rectangle' : 'Circle',
      x: scene.w / 2,
      y: scene.h / 2,
      w: 28 * u,
      h: 28 * u,
      ...(kind === 'rect' ? { radius: 3 * u } : {}),
      fill: p.palette.accent,
      scale: k([0.1, 0], [0.7, 1, 'outBack']),
    } as Layer);

  const addImage = async () => {
    const f = await pickFile();
    if (!f) return;
    const src = await readImage(f, 1800);
    const img = new Image();
    img.src = src;
    await img.decode().catch(() => undefined);
    const ar = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
    const w = 40 * u;
    addLayer({ type: 'image', id: 'user-image-' + uid(), name: 'Image', src, fit: 'contain', x: scene.w / 2, y: scene.h / 2, w, h: w / ar, opacity: k([0.1, 0], [0.6, 1, 'outCubic']), scale: k([0.1, 0.9], [0.8, 1, 'outExpo']) });
  };

  const addIcon = (name: string) => {
    setIcons(false);
    addLayer({
      type: 'path',
      id: 'user-icon-' + uid(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      d: ICONS[name],
      vw: 24,
      vh: 24,
      x: scene.w / 2,
      y: scene.h / 2,
      w: 18 * u,
      h: 18 * u,
      stroke: p.palette.accent,
      strokeWidth: 1.8,
      trimEnd: k([0.2, 0], [1.2, 1, 'inOutCubic']),
    });
  };

  const rows: { L: Layer; depth: number }[] = [];
  const walk = (ls: Layer[], depth: number) => {
    for (let i = ls.length - 1; i >= 0; i--) {
      rows.push({ L: ls[i], depth });
      const c = ls[i];
      if (c.type === 'group' && depth < 2) walk(c.children, depth + 1);
    }
  };
  walk(scene.layers, 0);

  return (
    <div className="ed-section">
      <h4>Add</h4>
      <div className="add-grid">
        <button onClick={() => addLayer(newText(p, scene))}>
          <Type /> Text
        </button>
        <button onClick={() => addShape('rect')}>
          <Square /> Box
        </button>
        <button onClick={() => addShape('ellipse')}>
          <Circle /> Circle
        </button>
        <button onClick={addImage}>
          <ImageIcon /> Image
        </button>
        <button onClick={() => setIcons(!icons)} aria-expanded={icons}>
          <Shapes /> Icon
        </button>
      </div>
      {icons && (
        <div className="icon-grid">
          {Object.entries(ICONS).map(([name, d]) => (
            <button key={name} title={name} onClick={() => addIcon(name)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={d} />
              </svg>
            </button>
          ))}
        </div>
      )}
      <h4>Layers</h4>
      <div className="layer-list">
        {rows.map(({ L, depth }) => {
          const hidden = !!project.overrides[L.id]?.hidden;
          return (
            <div key={L.id} className={`layer-row ${selected === L.id ? 'on' : ''} ${hidden ? 'off' : ''}`} style={{ paddingLeft: 8 + depth * 14 }} onClick={() => select(L.id)}>
              <LayerIcon L={L} />
              <span className="tl-label">{layerLabel(L)}</span>
              {extraIds.has(L.id) && <span className="badge" style={{ height: 18, fontSize: 10 }}>Added</span>}
              <button
                className="btn btn-icon btn-sm btn-ghost"
                aria-label={hidden ? 'Show layer' : 'Hide layer'}
                onClick={(e) => {
                  e.stopPropagation();
                  setOverride(L.id, { hidden: !hidden });
                }}
              >
                {hidden ? <EyeOff /> : <Eye />}
              </button>
            </div>
          );
        })}
      </div>
      {selected && extraIds.has(selected) && (
        <button className="btn btn-sm btn-ghost" style={{ marginTop: 8, color: 'var(--danger)' }} onClick={() => useEditor.getState().removeExtra(selected)}>
          <Trash2 /> Delete selected layer
        </button>
      )}
    </div>
  );
}
