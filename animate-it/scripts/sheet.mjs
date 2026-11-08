#!/usr/bin/env node
/**
 * Screenshot the dev contact sheet.
 *   node scripts/sheet.mjs "pack=logo-a&variants=all" /path/out.png [port]
 * Requires the dev server: npx vite --port 5173 (already running in the session).
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const query = process.argv[2] ?? '';
const out = process.argv[3] ?? 'sheet.png';
const port = process.argv[4] ?? '5173';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
await page.goto(`http://127.0.0.1:${port}/dev.html?${query}`, { waitUntil: 'networkidle' });
await page.waitForSelector('body[data-ready="1"]', { timeout: 60000 });
await page.screenshot({ path: out, fullPage: true });
const count = await page.evaluate(() => document.querySelectorAll('.row').length);
console.log(`rows: ${count} -> ${out}`);
if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
await browser.close();
