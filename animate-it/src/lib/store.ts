import { create } from 'zustand';
import { DEFAULT_BRAND, type BrandKit } from '../templates/registry';
import { load, loadRaw, save } from './storage';

interface BrandState {
  brand: BrandKit;
  setBrand: (b: Partial<BrandKit>) => void;
}

export const useBrand = create<BrandState>((set, get) => ({
  brand: load('ai.brand', DEFAULT_BRAND),
  setBrand: (b) => {
    const brand = { ...get().brand, ...b };
    save('ai.brand', brand);
    set({ brand });
  },
}));

interface UIState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  autoplay: boolean;
  setAutoplay: (v: boolean) => void;
  brandOpen: boolean;
  setBrandOpen: (v: boolean) => void;
  toast: { id: number; text: string } | null;
  notify: (text: string) => void;
}

export const useUI = create<UIState>((set, get) => ({
  favorites: loadRaw<string[]>('ai.favorites', []),
  toggleFavorite: (id) => {
    const f = get().favorites;
    const next = f.includes(id) ? f.filter((x) => x !== id) : [id, ...f];
    save('ai.favorites', next);
    set({ favorites: next });
  },
  autoplay: loadRaw<boolean>('ai.autoplay', true),
  setAutoplay: (v) => {
    save('ai.autoplay', v);
    set({ autoplay: v });
  },
  brandOpen: false,
  setBrandOpen: (v) => set({ brandOpen: v }),
  toast: null,
  notify: (text) => {
    const id = Date.now();
    set({ toast: { id, text } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, 3200);
  },
}));
