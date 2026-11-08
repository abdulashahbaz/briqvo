import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build runs from any sub-path (GitHub Pages, CDN, preview hosts).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
});
