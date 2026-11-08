import { useEffect, useRef, useState } from 'react';
import { assets, renderFrame, type Scene } from '../engine';
import { corners, deltaToParent, findPlaced, hitTest } from '../engine/hittest';
import { useClock, useEditor } from './store';

/** The editable canvas: renders the scene at the clock time and handles select / drag. */
export function Stage({ scene }: { scene: Scene }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const time = useClock((s) => s.time);
  const selected = useEditor((s) => s.selected);
  const select = useEditor((s) => s.select);
  const setOverride = useEditor((s) => s.setOverride);
  const project = useEditor((s) => s.project);
  const [assetV, setAssetV] = useState(0);
  const drag = useRef<{ id: string; sx: number; sy: number; dx0: number; dy0: number; moved: boolean } | null>(null);

  useEffect(() => assets.subscribe(() => setAssetV((v) => v + 1)), []);
  useEffect(() => {
    void assets.prepare(scene);
  }, [scene]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = 32;
  const s = box.w ? Math.min((box.w - pad * 2) / scene.w, (box.h - pad * 2) / scene.h) : 0;
  const cw = scene.w * s;
  const ch = scene.h * s;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !s) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pw = Math.round(cw * dpr);
    const ph = Math.round(ch * dpr);
    if (c.width !== pw || c.height !== ph) {
      c.width = pw;
      c.height = ph;
    }
    renderFrame(c.getContext('2d')!, scene, time, { scale: s * dpr });
  }, [scene, time, s, cw, ch, assetV]);

  const placed = selected ? findPlaced(scene, time, selected) : null;
  const pts = placed ? corners(placed).map((p) => `${p.x * s},${p.y * s}`).join(' ') : '';

  const toScene = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  };

  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const pt = toScene(e);
    const hit = hitTest(scene, time, pt.x, pt.y);
    // Keep dragging the current selection if the click is inside it.
    const current = placed && hit && (hit.layer.id === placed.layer.id) ? placed : hit;
    if (!current) {
      select(null);
      return;
    }
    select(current.layer.id);
    const o = project?.overrides[current.layer.id];
    drag.current = { id: current.layer.id, sx: pt.x, sy: pt.y, dx0: o?.dx ?? 0, dy0: o?.dy ?? 0, moved: false };
    (e.target as Element).setPointerCapture(e.pointerId);
    useClock.getState().setPlaying(false);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const pt = toScene(e);
    const p = findPlaced(scene, time, d.id);
    if (!p) return;
    const raw = { dx: pt.x - d.sx, dy: pt.y - d.sy };
    if (!d.moved && Math.hypot(raw.dx * s, raw.dy * s) < 3) return;
    d.moved = true;
    const local = deltaToParent(p, raw.dx, raw.dy);
    setOverride(d.id, { dx: Math.round(d.dx0 + local.dx), dy: Math.round(d.dy0 + local.dy) }, 'drag:' + d.id);
  };

  const onUp = () => {
    drag.current = null;
  };

  return (
    <div ref={wrapRef} className="ed-stage">
      {s > 0 && (
        <div className="ed-canvas" style={{ width: cw, height: ch }}>
          <canvas
            ref={canvasRef}
            style={{ width: cw, height: ch }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onDoubleClick={() => {
              // Double-click a text layer to jump straight to editing its words.
              const ta = document.querySelector<HTMLTextAreaElement>('.ed-right textarea');
              ta?.focus();
              ta?.select();
            }}
          />
          {scene.slides && scene.slides > 1 && (
            <div className="slide-seams" style={{ pointerEvents: 'none' }}>
              {Array.from({ length: scene.slides }, (_, i) => (
                <span key={i} />
              ))}
            </div>
          )}
          {placed && (
            <svg className="ed-sel" width={cw} height={ch}>
              <polygon points={pts} />
              {corners(placed).map((p, i) => (
                <rect key={i} x={p.x * s - 4} y={p.y * s - 4} width={8} height={8} rx={2} />
              ))}
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
