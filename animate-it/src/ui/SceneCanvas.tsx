import { useEffect, useRef, useState } from 'react';
import { assets, renderFrame, type Scene } from '../engine';
import { onFrame } from '../lib/player';

interface Props {
  scene: Scene;
  /** 'play' loops in real time, 'still' shows `time` (or the end frame). */
  playing: boolean;
  time?: number;
  /** Seconds to hold the final frame before looping. */
  hold?: number;
  /** Cap render rate (gallery uses ~30). */
  fps?: number;
  /** Max device-pixel ratio used for the backing store. */
  maxDpr?: number;
  onTime?: (t: number) => void;
  className?: string;
  style?: React.CSSProperties;
  /** Restart from 0 whenever this changes. */
  restartKey?: unknown;
}

/**
 * Canvas that fills its parent box (set the aspect-ratio on the parent) and
 * renders a scene, either looping or at a fixed time.
 */
export function SceneCanvas({ scene, playing, time, hold = 0.9, fps = 60, maxDpr = 2, onTime, className, style, restartKey }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const startRef = useRef(0);
  const lastDraw = useRef(0);
  const [assetVersion, setAssetVersion] = useState(assets.version);

  useEffect(() => assets.subscribe(() => setAssetVersion(assets.version)), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Make sure fonts and images are requested for this scene.
  useEffect(() => {
    void assets.prepare(scene);
  }, [scene]);

  const draw = (t: number) => {
    const c = ref.current;
    if (!c || !size.w) return;
    const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
    const pw = Math.max(1, Math.round(size.w * dpr));
    const ph = Math.max(1, Math.round(size.h * dpr));
    if (c.width !== pw || c.height !== ph) {
      c.width = pw;
      c.height = ph;
    }
    const scale = Math.min(pw / scene.w, ph / scene.h);
    renderFrame(c.getContext('2d')!, scene, t, { scale });
  };

  useEffect(() => {
    startRef.current = performance.now();
  }, [restartKey, scene]);

  useEffect(() => {
    if (!playing) {
      draw(time ?? scene.duration);
      return;
    }
    const minGap = 1000 / fps - 2;
    return onFrame((now) => {
      if (now - lastDraw.current < minGap) return;
      lastDraw.current = now;
      const cycle = scene.duration + hold;
      const e = ((now - startRef.current) / 1000) % cycle;
      const t = Math.min(e, scene.duration);
      draw(t);
      onTime?.(t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, scene, size.w, size.h, time, assetVersion, fps, hold]);

  return <canvas ref={ref} className={className} style={{ width: '100%', height: '100%', ...style }} />;
}
