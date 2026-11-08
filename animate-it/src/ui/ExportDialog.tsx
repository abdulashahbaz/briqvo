import { useMemo, useRef, useState } from 'react';
import { Download, Film, Image as ImageIcon, Loader2, Check, FileArchive, Repeat } from 'lucide-react';
import { Modal } from './Modal';
import type { Scene } from '../engine/types';
import { downloadBlob, exportScene, formatBytes, isAbort, webCodecsAvailable, type ExportKind, type ExportResult } from '../lib/export';

const KINDS: { id: ExportKind; label: string; hint: string; icon: typeof Film }[] = [
  { id: 'mp4', label: 'MP4', hint: 'Video for every social app', icon: Film },
  { id: 'webm', label: 'WebM', hint: 'Web video, transparency', icon: Film },
  { id: 'gif', label: 'GIF', hint: 'Looping, docs & email', icon: Repeat },
  { id: 'png', label: 'PNG', hint: 'Still frame', icon: ImageIcon },
  { id: 'png-seq', label: 'PNG frames', hint: 'Every frame, zipped', icon: FileArchive },
];

const RES = [
  { id: '720', label: '720p', scale: 2 / 3 },
  { id: '1080', label: '1080p', scale: 1 },
  { id: '1440', label: '1440p', scale: 4 / 3 },
  { id: '2160', label: '4K', scale: 2 },
];

export function ExportDialog({ scene, fileBase, onClose, stillTime }: { scene: Scene; fileBase: string; onClose: () => void; stillTime?: number }) {
  const [kind, setKind] = useState<ExportKind>('mp4');
  const [res, setRes] = useState('1080');
  const [fps, setFps] = useState(30);
  const [transparent, setTransparent] = useState(false);
  const [slideMode, setSlideMode] = useState<'separate' | 'panorama'>('separate');
  const [progress, setProgress] = useState<{ p: number; label?: string } | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isCarousel = !!scene.slides && scene.slides > 1;
  const slideW = isCarousel ? scene.w / scene.slides! : scene.w;
  const scale = RES.find((r) => r.id === res)!.scale;
  const outW = Math.round(((isCarousel && slideMode === 'separate' ? slideW : scene.w) * scale) / 2) * 2;
  const outH = Math.round((scene.h * scale) / 2) * 2;
  const supportsAlpha = kind === 'webm' || kind === 'png' || kind === 'png-seq';
  const videoUnsupported = (kind === 'mp4' || kind === 'webm') && !webCodecsAvailable();

  const estimate = useMemo(() => {
    const frames = Math.round(scene.duration * fps);
    if (kind === 'png') return '1 image';
    return `${frames} frames · ${scene.duration.toFixed(1)}s`;
  }, [kind, fps, scene.duration]);

  const run = async () => {
    setError(null);
    setResult(null);
    const ac = new AbortController();
    abortRef.current = ac;
    setProgress({ p: 0 });
    try {
      const r = await exportScene(scene, {
        kind,
        scale,
        fps,
        transparent: supportsAlpha && transparent,
        slideMode,
        time: stillTime,
        fileBase,
        signal: ac.signal,
        onProgress: (p, label) => setProgress({ p, label }),
      });
      setResult(r);
      downloadBlob(r.blob, r.filename);
    } catch (e) {
      if (!isAbort(e)) setError((e as Error).message || 'Export failed');
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  };

  return (
    <Modal onClose={() => (abortRef.current?.abort(), onClose())} className="modal-sm" label="Export">
      <div style={{ padding: '28px 28px 24px' }}>
        <span className="eyebrow">Export</span>
        <h2 className="display" style={{ fontSize: 28, margin: '8px 0 18px' }}>
          Download your animation
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 18 }}>
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              aria-pressed={kind === k.id}
              title={k.hint}
              style={{
                border: `1.5px solid ${kind === k.id ? 'var(--blue)' : 'var(--line)'}`,
                background: kind === k.id ? 'var(--blue-50)' : '#fff',
                borderRadius: 12,
                padding: '12px 4px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: 13,
                color: kind === k.id ? 'var(--blue)' : 'var(--ink-2)',
              }}
            >
              <k.icon size={18} />
              {k.label}
            </button>
          ))}
        </div>
        <p className="muted" style={{ margin: '-8px 0 16px', fontSize: 13 }}>
          {KINDS.find((k) => k.id === kind)!.hint}
        </p>

        <div className="field">
          <span className="label">Resolution</span>
          <div className="seg">
            {RES.map((r) => (
              <button key={r.id} aria-pressed={res === r.id} onClick={() => setRes(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {kind !== 'png' && (
          <div className="field">
            <span className="label">Frame rate</span>
            <div className="seg">
              {(kind === 'gif' ? [12, 15, 24] : [24, 30, 60]).map((f) => (
                <button key={f} aria-pressed={fps === f} onClick={() => setFps(f)}>
                  {f} fps
                </button>
              ))}
            </div>
          </div>
        )}
        {isCarousel && (
          <div className="field">
            <span className="label">Carousel</span>
            <div className="seg">
              <button aria-pressed={slideMode === 'separate'} onClick={() => setSlideMode('separate')}>
                {scene.slides} slides (ZIP)
              </button>
              <button aria-pressed={slideMode === 'panorama'} onClick={() => setSlideMode('panorama')}>
                One panorama
              </button>
            </div>
          </div>
        )}
        {supportsAlpha && (
          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, marginBottom: 14 }}>
            <button className="toggle" role="switch" aria-checked={transparent} onClick={() => setTransparent(!transparent)} />
            Transparent background
          </label>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', padding: '12px 0', borderTop: '1px solid var(--line)' }}>
          <span>
            {outW} × {outH}px{isCarousel && slideMode === 'separate' ? ` × ${scene.slides}` : ''}
          </span>
          <span>{estimate}</span>
        </div>

        {videoUnsupported && (
          <p style={{ color: 'var(--danger)', fontSize: 13.5 }}>This browser can't encode video. Use Chrome, Edge, Safari 17+ or Firefox 130+, or export a GIF.</p>
        )}
        {error && <p style={{ color: 'var(--danger)', fontSize: 13.5 }}>{error}</p>}

        {progress ? (
          <div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-sunk)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.round(progress.p * 100)}%`, height: '100%', background: 'var(--blue)', transition: 'width .15s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 13, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Loader2 size={15} className="spin" /> Rendering{progress.label ? ` · ${progress.label}` : ''} · {Math.round(progress.p * 100)}%
              </span>
              <button className="btn btn-sm btn-ghost" onClick={() => abortRef.current?.abort()}>
                Cancel
              </button>
            </div>
          </div>
        ) : result ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 600, color: 'var(--ok)' }}>
              <Check size={18} /> {result.filename} · {formatBytes(result.bytes)}
            </span>
            <button className="btn btn-outline" onClick={() => downloadBlob(result.blob, result.filename)}>
              <Download /> Download again
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={videoUnsupported} onClick={run}>
            <Download /> Export {KINDS.find((k) => k.id === kind)!.label}
          </button>
        )}
        <p className="muted" style={{ fontSize: 12.5, margin: '14px 0 0', textAlign: 'center' }}>
          Rendered on your device. Nothing is uploaded.
        </p>
      </div>
    </Modal>
  );
}
