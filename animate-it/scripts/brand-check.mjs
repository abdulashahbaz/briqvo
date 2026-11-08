#!/usr/bin/env node
/** Screenshot the gallery with a brand kit applied. */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out = 'brand.png', route = '#/templates', port = '5173'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await page.addInitScript(() => {
  localStorage.setItem('ai.brand', JSON.stringify({ enabled: true, name: 'Kestrel', primary: '#FF5A1F', secondary: '#FFC145', dark: '#1B1712', light: '#FFF8EE', fonts: 'outfit', logoSrc: '', logoTint: false }));
  localStorage.setItem('ai.autoplay', 'false');
});
await page.goto(`http://127.0.0.1:${port}/${route}`, { waitUntil: 'networkidle' });
await page.mouse.wheel(0, 700);
await page.waitForTimeout(3500);
await page.screenshot({ path: out });
await browser.close();
console.log('saved', out);
