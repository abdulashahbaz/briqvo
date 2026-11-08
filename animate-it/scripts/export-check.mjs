#!/usr/bin/env node
/** Encodes one template in every export format inside headless Chromium and reports sizes. */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const id = process.argv[2] ?? 'orbit-reveal--midnight';
const port = process.argv[3] ?? '5173';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror', String(e)));
await page.goto(`http://127.0.0.1:${port}/#/pricing`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => (window).__ai);
const res = await page.evaluate(async (id) => {
  const ai = window.__ai;
  const t = ai.templateById(id);
  const scene = ai.buildScene(t.recipe, t.params);
  const out = {};
  for (const kind of ['mp4', 'webm', 'gif', 'png', 'png-seq']) {
    const t0 = performance.now();
    try {
      const r = await ai.exportScene(scene, { kind, scale: kind === 'png-seq' ? 0.25 : 2 / 3, fps: kind === 'png-seq' ? 6 : 30, fileBase: 'test', slideMode: 'separate' });
      out[kind] = `${r.filename} ${(r.bytes / 1024).toFixed(0)}KB in ${((performance.now() - t0) / 1000).toFixed(1)}s`;
    } catch (e) {
      out[kind] = 'ERROR ' + e.message;
    }
  }
  return out;
}, id);
console.log(JSON.stringify(res, null, 2));
await browser.close();
