import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Wand2, Download, Heart, Palette } from 'lucide-react';
import { Modal } from './Modal';
import { SceneCanvas } from './SceneCanvas';
import { ExportDialog } from './ExportDialog';
import { TemplateCard } from './TemplateCard';
import { allTemplates, formatsOf, type Template } from '../templates/registry';
import { CATEGORY_MAP, FORMATS, type FormatId } from '../templates/catalog';
import { templateScene } from '../lib/scenes';
import { useBrand, useUI } from '../lib/store';
import { href, navigate } from '../lib/router';

export function TemplateDetail({ t, onClose }: { t: Template; onClose: () => void }) {
  const brand = useBrand((s) => s.brand);
  const setBrand = useBrand((s) => s.setBrand);
  const setBrandOpen = useUI((s) => s.setBrandOpen);
  const fav = useUI((s) => s.favorites.includes(t.id));
  const toggleFavorite = useUI((s) => s.toggleFavorite);
  const formats = formatsOf(t.recipe);
  const [format, setFormat] = useState<FormatId>(t.params.format);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [exporting, setExporting] = useState(false);
  const rangeRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => setFormat(t.params.format), [t]);

  const scene = useMemo(() => templateScene(t, brand, format), [t, brand, format]);
  const siblings = useMemo(() => allTemplates().filter((x) => x.recipe.id === t.recipe.id), [t]);
  const related = useMemo(
    () => allTemplates().filter((x) => x.category === t.category && x.recipe.id !== t.recipe.id && x.variantIndex === 0).slice(0, 4),
    [t],
  );
  const cat = CATEGORY_MAP[t.category];
  const isCarousel = format === 'carousel';
  const aspect = scene.w / scene.h;
  const stageW = isCarousel ? '100%' : aspect >= 1 ? 'min(100%, 620px)' : `min(100%, ${Math.round(440 * aspect * 1.25)}px)`;

  const onTime = (tt: number) => {
    if (rangeRef.current) rangeRef.current.value = String(tt);
    if (codeRef.current) codeRef.current.textContent = `${tt.toFixed(2)}s / ${scene.duration.toFixed(1)}s`;
  };

  const customize = () => navigate(`/editor/new?t=${encodeURIComponent(t.id)}&f=${format}`);

  return (
    <Modal onClose={onClose} label={`${t.name} template`}>
      <div className={`detail ${isCarousel ? 'wide' : ''}`}>
        <div className="detail-stage">
          <div className="detail-canvas">
            <div style={{ width: stageW, aspectRatio: `${scene.w} / ${scene.h}`, position: 'relative' }}>
              <SceneCanvas scene={scene} playing={playing} time={time} onTime={onTime} restartKey={format} />
              {isCarousel && (
                <div className="slide-seams">
                  {Array.from({ length: scene.slides ?? 1 }, (_, i) => (
                    <span key={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="scrubber">
            <button className="btn btn-icon btn-outline" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)}>
              {playing ? <Pause /> : <Play />}
            </button>
            <input
              ref={rangeRef}
              type="range"
              min={0}
              max={scene.duration}
              step={0.01}
              defaultValue={0}
              aria-label="Scrub"
              onChange={(e) => {
                setPlaying(false);
                const v = Number(e.target.value);
                setTime(v);
                onTime(v);
              }}
            />
            <span ref={codeRef} className="timecode">
              0.00s / {scene.duration.toFixed(1)}s
            </span>
          </div>
          {formats.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="label" style={{ margin: 0 }}>
                Magic resize
              </span>
              {formats.map((f) => (
                <button key={f} className="chip" aria-pressed={format === f} onClick={() => setFormat(f)}>
                  {FORMATS[f].label} <span style={{ opacity: 0.6 }}>{FORMATS[f].ratio}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-side">
          <div>
            <a className="eyebrow" href={href(`/templates/${t.category}`)}>
              {cat.name}
            </a>
            <h2>{t.name}</h2>
            <div className="muted" style={{ marginTop: 4 }}>
              {t.variantName} · {isCarousel ? `${scene.slides} slides` : FORMATS[format].ratio} · {scene.duration.toFixed(1)}s
            </div>
          </div>
          {t.recipe.description && <p style={{ margin: 0, color: 'var(--ink-2)' }}>{t.recipe.description}</p>}

          {siblings.length > 1 && (
            <div>
              <span className="label">Styles</span>
              <div className="variant-row">
                {siblings.map((s) => (
                  <a
                    key={s.id}
                    href={href(`/template/${s.id}`)}
                    className="variant-dot"
                    aria-pressed={s.id === t.id}
                    title={s.variantName}
                    style={{ background: `linear-gradient(135deg, ${s.params.palette.bg} 50%, ${s.params.palette.accent} 50%)` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 14 }}>
            <span style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, fontWeight: 600 }}>
              <Palette size={18} color="var(--blue)" /> Preview in my brand
            </span>
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setBrandOpen(true)}>
                Edit
              </button>
              <button className="toggle" role="switch" aria-checked={brand.enabled} aria-label="Preview in my brand" onClick={() => setBrand({ enabled: !brand.enabled })} />
            </span>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <button className="btn btn-primary btn-lg" onClick={customize}>
              <Wand2 /> Customize this template
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setExporting(true)}>
                <Download /> Quick export
              </button>
              <button className="btn btn-outline btn-icon" style={{ width: 40, height: 40 }} aria-pressed={fav} aria-label="Favourite" onClick={() => toggleFavorite(t.id)}>
                <Heart fill={fav ? '#e5484d' : 'none'} color={fav ? '#e5484d' : 'currentColor'} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {t.tags
              .filter((x) => x !== 'new')
              .map((tag) => (
                <a key={tag} className="badge" style={{ background: 'var(--bg-sunk)', color: 'var(--muted)' }} href={href(`/templates?q=${encodeURIComponent(tag)}`)}>
                  #{tag}
                </a>
              ))}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div style={{ padding: '8px 32px 32px' }}>
          <div className="section-head" style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: 22 }}>More {cat.name.toLowerCase()}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, alignItems: 'start' }}>
            {related.map((r) => (
              <TemplateCard key={r.id} t={r} compact />
            ))}
          </div>
        </div>
      )}
      {exporting && <ExportDialog scene={scene} fileBase={`${t.name}-${t.variantName}`} onClose={() => setExporting(false)} />}
    </Modal>
  );
}
