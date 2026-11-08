import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { assets } from './engine';
import { GOOGLE_FONTS_HREF } from './templates/catalog';
import './styles/app.css';
import './styles/editor.css';

// One stylesheet serves both the UI fonts and every template font family.
void assets.useFontStylesheet(GOOGLE_FONTS_HREF);
void assets.loadFont('Bricolage Grotesque:800');
void assets.loadFont('Inter:500');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Dev-only hook for automated export checks (scripts/export-check.mjs).
if (import.meta.env.DEV) {
  void Promise.all([import('./lib/export'), import('./templates/registry')]).then(([ex, reg]) => {
    (window as unknown as Record<string, unknown>).__ai = { ...ex, ...reg };
  });
}
