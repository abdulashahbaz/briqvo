/**
 * Client-side exporters. Everything renders frame-by-frame from the same
 * deterministic renderer as the preview, so exports are frame-accurate and
 * cost nothing to serve.
 *
 * MP4 (H.264) and WebM (VP9) use WebCodecs + a muxer; GIF uses gifenc;
 * PNG sequences and carousel slide sets are zipped with fflate.
 */
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4Target } from 'mp4-muxer';
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmTarget } from 'webm-muxer';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { zipSync } from 'fflate';
import { assets, renderFrame, type Scene } from '../engine';

export type ExportKind = 'mp4' | 'webm' | 'gif' | 'png' | 'png-seq';

export interface ExportOptions {
  kind: ExportKind;
  /** Output pixels per scene pixel (scene short side is 1080). */
  scale: number;
  fps: number;
  transparent?: boolean;
  /** Carousels: one file per slide (zipped) or one wide panorama. */
  slideMode?: 'separate' | 'panorama';
  /** PNG still: time in seconds. */
  time?: number;
  gifMaxSide?: number;
  fileBase: string;
  onProgress?: (p: number, label?: string) => void;
  signal?: AbortSignal;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  bytes: number;
}

export const EXPORT_KINDS: { id: ExportKind; label: string; hint: string }[] = [
  { id: 'mp4', label: 'MP4', hint: 'H.264 video · best for social' },
  { id: 'webm', label: 'WebM', hint: 'VP9 video · web, supports transparency' },
  { id: 'gif', label: 'GIF', hint: 'Looping image · email, docs, chat' },
  { id: 'png', label: 'PNG', hint: 'Single frame · posters & thumbnails' },
  { id: 'png-seq', label: 'PNG sequence', hint: 'Every frame, zipped · for editors' },
];

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
const tick = () => new Promise<void>((r) => setTimeout(r, 0));

class Aborted extends Error {
  constructor() {
    super('Export cancelled');
  }
}

interface View {
  ox: number;
  w: number;
  h: number;
  name: string;
}

function views(scene: Scene, opts: ExportOptions): View[] {
  if (scene.slides && scene.slides > 1 && opts.slideMode !== 'panorama') {
    const sw = scene.w / scene.slides;
    return Array.from({ length: scene.slides }, (_, i) => ({ ox: i * sw, w: sw, h: scene.h, name: `slide-${i + 1}` }));
  }
  return [{ ox: 0, w: scene.w, h: scene.h, name: '' }];
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { alpha: true, willReadFrequently: false })!;
  return { c, ctx };
}

function canvasBlob(c: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Canvas export failed'))), type));
}

function h264Codecs(w: number, h: number, fps: number): string[] {
  const load = w * h * fps;
  const all = ['avc1.640028', 'avc1.64002A', 'avc1.640032', 'avc1.640033', 'avc1.640034'];
  if (load <= 1920 * 1088 * 30) return all;
  if (load <= 1920 * 1088 * 60) return all.slice(1);
  if (load <= 2560 * 1440 * 60) return all.slice(2);
  return all.slice(3);
}

export function webCodecsAvailable(): boolean {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;
}

async function pickConfig(candidates: VideoEncoderConfig[]): Promise<VideoEncoderConfig | null> {
  for (const c of candidates) {
    try {
      const s = await VideoEncoder.isConfigSupported(c);
      if (s.supported) return s.config ?? c;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function encodeVideo(scene: Scene, v: View, opts: ExportOptions, kind: 'mp4' | 'webm', progress: (p: number) => void): Promise<Blob> {
  const W = even(v.w * opts.scale);
  const H = even(v.h * opts.scale);
  const fps = opts.fps;
  const bitrate = Math.min(60e6, Math.max(2e6, W * H * fps * 0.14));
  const alpha = kind === 'webm' && !!opts.transparent;

  const config =
    kind === 'mp4'
      ? await pickConfig(h264Codecs(W, H, fps).map((codec) => ({ codec, width: W, height: H, bitrate, framerate: fps, avc: { format: 'avc' as const } })))
      : await pickConfig([
          ...(alpha ? [{ codec: 'vp09.00.10.08', width: W, height: H, bitrate, framerate: fps, alpha: 'keep' as const }] : []),
          { codec: 'vp09.00.10.08', width: W, height: H, bitrate, framerate: fps },
          { codec: 'vp8', width: W, height: H, bitrate, framerate: fps },
        ]);
  if (!config) throw new Error(`${kind.toUpperCase()} encoding at ${W}×${H} isn't supported by this browser. Try a lower resolution or another format.`);

  const useAlpha = alpha && (config as VideoEncoderConfig & { alpha?: string }).alpha === 'keep';
  const mp4 = kind === 'mp4' ? new Mp4Muxer({ target: new Mp4Target(), video: { codec: 'avc', width: W, height: H, frameRate: fps }, fastStart: 'in-memory' }) : null;
  const webm =
    kind === 'webm'
      ? new WebmMuxer({ target: new WebmTarget(), video: { codec: config.codec.startsWith('vp8') ? 'V_VP8' : 'V_VP9', width: W, height: H, frameRate: fps, alpha: useAlpha } })
      : null;

  let failure: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      if (mp4) mp4.addVideoChunk(chunk, meta);
      else webm!.addVideoChunk(chunk, meta);
    },
    error: (e) => {
      failure = e;
    },
  });
  encoder.configure(config);

  const { c, ctx } = makeCanvas(W, H);
  const frames = Math.max(1, Math.round(scene.duration * fps));
  const scale = W / v.w;
  for (let i = 0; i < frames; i++) {
    if (opts.signal?.aborted) {
      encoder.close();
      throw new Aborted();
    }
    if (failure) throw failure;
    const t = Math.min(scene.duration, i / fps);
    renderFrame(ctx, scene, t, { scale, ox: v.ox, transparent: useAlpha });
    const frame = new VideoFrame(c, { timestamp: Math.round((i * 1e6) / fps), duration: Math.round(1e6 / fps), alpha: useAlpha ? 'keep' : 'discard' });
    encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();
    while (encoder.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 2));
    if (i % 4 === 0) {
      progress(i / frames);
      await tick();
    }
  }
  await encoder.flush();
  encoder.close();
  if (failure) throw failure;
  if (mp4) {
    mp4.finalize();
    return new Blob([mp4.target.buffer], { type: 'video/mp4' });
  }
  webm!.finalize();
  return new Blob([webm!.target.buffer], { type: 'video/webm' });
}

async function encodeGif(scene: Scene, v: View, opts: ExportOptions, progress: (p: number) => void): Promise<Blob> {
  const maxSide = opts.gifMaxSide ?? 720;
  const s = Math.min(opts.scale, maxSide / Math.max(v.w, v.h));
  const W = Math.round(v.w * s);
  const H = Math.round(v.h * s);
  const fps = Math.min(opts.fps, 25);
  const { ctx } = makeCanvas(W, H);
  const gif = GIFEncoder();
  const frames = Math.max(1, Math.round(scene.duration * fps));
  const delay = Math.round(1000 / fps);
  for (let i = 0; i < frames; i++) {
    if (opts.signal?.aborted) throw new Aborted();
    renderFrame(ctx, scene, Math.min(scene.duration, i / fps), { scale: s, ox: v.ox });
    const { data } = ctx.getImageData(0, 0, W, H);
    const palette = quantize(data, 256, { format: 'rgb565' });
    const index = applyPalette(data, palette, 'rgb565');
    gif.writeFrame(index, W, H, { palette, delay, repeat: 0 });
    if (i % 2 === 0) {
      progress(i / frames);
      await tick();
    }
  }
  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: 'image/gif' });
}

async function encodePngSeq(scene: Scene, v: View, opts: ExportOptions, progress: (p: number) => void): Promise<Record<string, Uint8Array>> {
  const W = even(v.w * opts.scale);
  const H = even(v.h * opts.scale);
  const { c, ctx } = makeCanvas(W, H);
  const frames = Math.max(1, Math.round(scene.duration * opts.fps));
  const out: Record<string, Uint8Array> = {};
  for (let i = 0; i < frames; i++) {
    if (opts.signal?.aborted) throw new Aborted();
    renderFrame(ctx, scene, Math.min(scene.duration, i / opts.fps), { scale: W / v.w, ox: v.ox, transparent: opts.transparent });
    const b = await canvasBlob(c);
    out[`frame-${String(i).padStart(5, '0')}.png`] = new Uint8Array(await b.arrayBuffer());
    if (i % 3 === 0) progress(i / frames);
  }
  return out;
}

export async function exportScene(scene: Scene, opts: ExportOptions): Promise<ExportResult> {
  await assets.prepare(scene);
  const vs = views(scene, opts);
  const report = opts.onProgress ?? (() => undefined);
  const base = opts.fileBase.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '').toLowerCase() || 'animate-it';
  const files: { name: string; blob: Blob }[] = [];

  for (let vi = 0; vi < vs.length; vi++) {
    const v = vs[vi];
    const label = vs.length > 1 ? `Slide ${vi + 1} of ${vs.length}` : undefined;
    const prog = (p: number) => report((vi + p) / vs.length, label);
    const suffix = v.name ? `-${v.name}` : '';
    switch (opts.kind) {
      case 'mp4':
      case 'webm': {
        if (!webCodecsAvailable()) throw new Error('Video export needs a browser with WebCodecs (Chrome, Edge, Safari 17+, Firefox 130+).');
        files.push({ name: `${base}${suffix}.${opts.kind}`, blob: await encodeVideo(scene, v, opts, opts.kind, prog) });
        break;
      }
      case 'gif':
        files.push({ name: `${base}${suffix}.gif`, blob: await encodeGif(scene, v, opts, prog) });
        break;
      case 'png': {
        const W = even(v.w * opts.scale);
        const H = even(v.h * opts.scale);
        const { c, ctx } = makeCanvas(W, H);
        renderFrame(ctx, scene, Math.min(scene.duration, opts.time ?? scene.duration), { scale: W / v.w, ox: v.ox, transparent: opts.transparent });
        files.push({ name: `${base}${suffix}.png`, blob: await canvasBlob(c) });
        prog(1);
        break;
      }
      case 'png-seq': {
        const frames = await encodePngSeq(scene, v, opts, prog);
        const zipped = zipSync(Object.fromEntries(Object.entries(frames).map(([k, b]) => [(v.name ? v.name + '/' : '') + k, b])), { level: 0 });
        files.push({ name: `${base}${suffix}-frames.zip`, blob: new Blob([zipped as BlobPart], { type: 'application/zip' }) });
        break;
      }
    }
  }
  report(1);

  if (files.length === 1) return { blob: files[0].blob, filename: files[0].name, bytes: files[0].blob.size };
  const entries: Record<string, Uint8Array> = {};
  for (const f of files) entries[f.name] = new Uint8Array(await f.blob.arrayBuffer());
  const zipped = zipSync(entries, { level: 0 });
  const blob = new Blob([zipped as BlobPart], { type: 'application/zip' });
  return { blob, filename: `${base}-carousel.zip`, bytes: blob.size };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function isAbort(e: unknown): boolean {
  return e instanceof Aborted;
}
