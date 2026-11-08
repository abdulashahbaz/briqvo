import type { Layer, Scene } from './types';
import { invalidateTextCache } from './text';

type Listener = () => void;

/** Shared image + font loader. Renderers read synchronously; listeners re-render on load. */
class AssetStore {
  private images = new Map<string, HTMLImageElement>();
  private pending = new Map<string, Promise<void>>();
  private listeners = new Set<Listener>();
  private fontsRequested = new Set<string>();
  private fontPromises = new Map<string, Promise<void>>();
  private cssReady: Promise<void> = Promise.resolve();
  version = 0;

  /** Inject a font stylesheet (e.g. Google Fonts). Font loads wait for it to parse. */
  useFontStylesheet(href: string): Promise<void> {
    if (typeof document === 'undefined') return this.cssReady;
    const existing = document.querySelector(`link[data-ai-fonts]`) as HTMLLinkElement | null;
    if (existing && existing.href === href) return this.cssReady;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.aiFonts = '1';
    this.cssReady = new Promise<void>((resolve) => {
      link.onload = () => resolve();
      link.onerror = () => resolve();
      setTimeout(resolve, 8000);
    });
    document.head.appendChild(link);
    this.fontPromises.clear();
    return this.cssReady;
  }

  constructor() {
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.addEventListener?.('loadingdone', () => {
        invalidateTextCache();
        this.bump();
      });
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private bump() {
    this.version++;
    this.listeners.forEach((l) => l());
  }

  image(src: string): HTMLImageElement | undefined {
    const img = this.images.get(src);
    if (img && img.complete && img.naturalWidth > 0) return img;
    if (!img) void this.loadImage(src);
    return undefined;
  }

  loadImage(src: string): Promise<void> {
    const existing = this.pending.get(src);
    if (existing) return existing;
    const p = new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      if (!src.startsWith('data:') && !src.startsWith('blob:')) img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.bump();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = src;
      this.images.set(src, img);
    });
    this.pending.set(src, p);
    return p;
  }

  loadFont(spec: string): Promise<void> {
    const hit = this.fontPromises.get(spec);
    if (hit) return hit;
    if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
    const parts = spec.split(':');
    const family = parts[0];
    const italic = parts.includes('italic');
    const weight = parts[parts.length - 1] && /^\d+$/.test(parts[parts.length - 1]) ? parts[parts.length - 1] : '400';
    this.fontsRequested.add(spec);
    const p = this.cssReady
      .then(() => document.fonts.load(`${italic ? 'italic ' : ''}${weight} 40px "${family}"`))
      .then((faces) => {
        if (!faces || faces.length === 0) this.fontPromises.delete(spec); // retry on next request
        invalidateTextCache();
        this.bump();
      })
      .catch(() => {
        this.fontPromises.delete(spec);
      });
    this.fontPromises.set(spec, p);
    return p;
  }

  /** Resolve once every image and font the scene uses is ready (used before export). */
  async prepare(scene: Scene): Promise<void> {
    const srcs = new Set<string>();
    const fonts = new Set<string>(scene.fonts ?? []);
    const walk = (ls: Layer[]) => {
      for (const l of ls) {
        if (l.type === 'image') srcs.add(l.src);
        if (l.type === 'text') fonts.add(`${l.font}${l.italic ? ':italic' : ''}:${l.weight ?? 400}`);
        if (l.type === 'group') walk(l.children);
      }
    };
    walk(scene.layers);
    await Promise.all([...[...srcs].map((s) => this.loadImage(s)), ...[...fonts].map((f) => this.loadFont(f))]);
  }
}

export const assets = new AssetStore();
