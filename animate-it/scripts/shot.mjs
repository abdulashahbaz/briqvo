#!/usr/bin/env node
/**
 * Screenshot an app route.
 *   node scripts/shot.mjs "#/templates" out.png [width=1440] [height=900] [full=0] [port=5173] [waitMs=2500]
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [route = '#/', out = 'shot.png', w = '1440', h = '900', full = '0', port = '5173', wait = '2500'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`http://127.0.0.1:${port}/${route}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(+wait);
await page.screenshot({ path: out, fullPage: full === '1' });
console.log('saved', out);
if (errors.length) console.log('ERRORS:\n' + errors.slice(0, 10).join('\n'));
await browser.close();
