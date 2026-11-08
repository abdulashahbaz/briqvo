#!/usr/bin/env node
/** Measures rAF rate and average render cost on the gallery with autoplay on. */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [route = '#/templates', port = '5173'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`http://127.0.0.1:${port}/${route}`, { waitUntil: 'networkidle' });
await page.mouse.wheel(0, 1300);
await page.waitForTimeout(3000);
const r = await page.evaluate(async () => {
  let frames = 0;
  let worst = 0;
  let last = performance.now();
  const t0 = last;
  await new Promise((res) => {
    const f = (now) => {
      frames++;
      worst = Math.max(worst, now - last);
      last = now;
      if (now - t0 < 4000) requestAnimationFrame(f);
      else res();
    };
    requestAnimationFrame(f);
  });
  return { fps: +(frames / 4).toFixed(1), worstFrameMs: +worst.toFixed(1), canvases: document.querySelectorAll('canvas').length };
});
console.log(JSON.stringify(r));
await browser.close();
