import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, Repeat, ChevronRight, ChevronDown, Type, Square, Circle, Image as ImageIcon, Spline, Folder } from 'lucide-react';
import { keyframeTimes, layerSpan, type Layer, type Scene } from '../engine';
import { useClock, useEditor } from './store';

export function layerLabel(L: Layer): string {
  if (L.name) return L.name;
  if (L.type === 'text' && L.text) return L.text.length > 28 ? L.text.slice(0, 26) + '…' : L.text;
  const s = L.id.replace(/^user-/, '').replace(/[-_]+/g, ' ').replace(/\s\w{6,}$/, '').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function LayerIcon({ L, size = 14 }: { L: Layer; size?: number }) {
  const I = L.type === 'text' ? Type : L.type === 'rect' ? Square : L.type === 'ellipse' ? Circle : L.type === 'image' ? ImageIcon : L.type === 'path' ? Spline : Folder;
  return <I size={size} />;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/** Drives playback and shows layer timing; drag a bar to retime a layer. */
export function Timeline({ scene }: { scene: Scene }) {
  const { time, playing, loop, setTime, setPlaying, setLoop } = useClock();
  const selected = useEditor((s) => s.selected);
  const select = useEditor((s) => s.select);
  const project = useEditor((s) => s.project);
  const setOverride = useEditor((s) => s.setOverride);
  const setParams = useEditor((s) => s.setParams);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackW, setTrackW] = useState(600);
  const dur = scene.duration;
  const speed = scene.speed ?? 1;

  // Playback loop.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let holdUntil = 0;
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      raf = requestAnimationFrame(step);
      if (holdUntil) {
        // Brief hold on the final frame before looping.
        if (now < holdUntil) return;
        holdUntil = 0;
        setTime(0);
        return;
      }
      const { time: t0, loop: lp } = useClock.getState();
      const t = t0 + dt;
      if (t >= dur) {
        setTime(dur);
        if (lp) holdUntil = now + 600;
        else setPlaying(false);
        return;
      }
      setTime(Math.max(0, t));
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, dur, setTime, setPlaying]);

  useEffect(() => {
    if (time > dur) setTime(dur);
  }, [dur, time, setTime]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setTrackW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pps = trackW / Math.max(0.1, dur);
  const scrubFrom = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    setTime(Math.max(0, Math.min(dur, (clientX - r.left) / pps)));
  };

  const onRulerDown = (e: React.PointerEvent) => {
    setPlaying(false);
    scrubFrom(e.clientX);
    const move = (ev: PointerEvent) => scrubFrom(ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onBarDown = (e: React.PointerEvent, L: Layer) => {
    e.stopPropagation();
    select(L.id);
    const startX = e.clientX;
    const dt0 = project?.overrides[L.id]?.dt ?? 0;
    const move = (ev: PointerEvent) => {
      const d = (ev.clientX - startX) / pps;
      // dt is stored in recipe time (before playback speed).
      setOverride(L.id, { dt: Math.round((dt0 + d * speed) * 100) / 100 }, 'dt:' + L.id);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const ticks: number[] = [];
  const stepT = dur > 12 ? 2 : dur > 5 ? 1 : 0.5;
  for (let t = 0; t <= dur + 1e-6; t += stepT) ticks.push(t);

  const rows: { L: Layer; depth: number; offset: number }[] = [];
  const walk = (ls: Layer[], depth: number, offset: number) => {
    for (let i = ls.length - 1; i >= 0; i--) {
      const L = ls[i];
      rows.push({ L, depth, offset });
      if (L.type === 'group' && open[L.id]) walk(L.children, depth + 1, offset + (L.dt ?? 0));
    }
  };
  walk(scene.layers, 0, 0);

  return (
    <div className="ed-timeline">
      <div className="tl-bar">
        <button className="btn btn-icon btn-sm btn-ghost" aria-label="Back to start" onClick={() => setTime(0)}>
          <SkipBack />
        </button>
        <button
          className="btn btn-icon btn-primary"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => {
            if (!playing && time >= dur - 0.01) setTime(0);
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause /> : <Play />}
        </button>
        <button className={`btn btn-icon btn-sm ${loop ? 'btn-soft' : 'btn-ghost'}`} aria-pressed={loop} aria-label="Loop" title="Loop" onClick={() => setLoop(!loop)}>
          <Repeat />
        </button>
        <span className="timecode" style={{ textAlign: 'left' }}>
          {time.toFixed(2)}s <span style={{ opacity: 0.5 }}>/ {dur.toFixed(2)}s</span>
        </span>
        <div style={{ flex: 1 }} />
        <label className="tl-speed">
          Speed
          <select className="input" value={project?.params.speed ?? 1} onChange={(e) => setParams({ speed: Number(e.target.value) })}>
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="tl-body">
        <div className="tl-names">
          <div className="tl-ruler-spacer">Layers</div>
          {rows.map(({ L, depth }) => (
            <button
              key={L.id}
              className={`tl-name ${selected === L.id ? 'on' : ''} ${project?.overrides[L.id]?.hidden ? 'off' : ''}`}
              style={{ paddingLeft: 8 + depth * 14 }}
              onClick={() => select(L.id)}
            >
              {L.type === 'group' ? (
                <span
                  className="tl-twisty"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen({ ...open, [L.id]: !open[L.id] });
                  }}
                >
                  {open[L.id] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </span>
              ) : (
                <span className="tl-twisty" />
              )}
              <LayerIcon L={L} size={13} />
              <span className="tl-label">{layerLabel(L)}</span>
            </button>
          ))}
        </div>
        <div className="tl-tracks">
          <div ref={trackRef} className="tl-ruler" onPointerDown={onRulerDown}>
            {ticks.map((t) => (
              <span key={t} style={{ left: t * pps }}>
                {Number.isInteger(t) ? `${t}s` : ''}
              </span>
            ))}
          </div>
          {rows.map(({ L, offset }) => {
            const [a, b] = layerSpan(L, dur * speed, offset);
            const kfs = [...new Set(keyframeTimes(L, offset).map((k) => Math.round(k * 100) / 100))];
            return (
              <div key={L.id} className={`tl-row ${selected === L.id ? 'on' : ''}`} onPointerDown={onRulerDown}>
                <div
                  className={`tl-clip t-${L.type}`}
                  style={{ left: (a / speed) * pps, width: Math.max(6, ((b - a) / speed) * pps) }}
                  onPointerDown={(e) => onBarDown(e, L)}
                  title="Drag to retime"
                >
                  {kfs.map((k) => (
                    <i key={k} style={{ left: ((k - a) / speed) * pps }} />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="tl-playhead" style={{ left: time * pps }} />
        </div>
      </div>
    </div>
  );
}
