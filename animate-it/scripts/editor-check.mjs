#!/usr/bin/env node
/** Drives the editor: select, drag, edit text, add layer, undo, resize. Saves screenshots. */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const out = process.argv[2] ?? '.';
const port = process.argv[3] ?? '5173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/#/editor/new?t=headline-rise--azure`, { waitUntil: 'networkidle' });
await page.waitForSelector('.ed-canvas canvas');
await page.waitForTimeout(1500);
// pause & jump to end
await page.keyboard.press('Space');
await page.waitForTimeout(300);
const box = await page.locator('.ed-canvas canvas').boundingBox();
// click on headline area (left middle)
await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.5);
await page.waitForTimeout(300);
const selName = await page.locator('.insp-head b').textContent().catch(() => null);
// drag it
await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.42, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(300);
const dx = await page.locator('.num input').first().inputValue().catch(() => null);
// edit text via content tab
await page.locator('.ed-tabs button', { hasText: 'Content' }).click();
const ta = page.locator('.ed-left textarea').first();
await ta.fill('Animate it, own it.');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/ed-1.png` });
// add text layer
await page.locator('.ed-tabs button', { hasText: 'Layers' }).click();
await page.locator('.add-grid button', { hasText: 'Text' }).click();
await page.waitForTimeout(300);
const added = await page.locator('.layer-row .badge').count();
// undo twice
await page.keyboard.press('Escape');
await page.keyboard.press('Control+z');
await page.waitForTimeout(200);
const afterUndo = await page.locator('.layer-row .badge').count();
// magic resize to story
await page.keyboard.press('Escape');
await page.locator('.fmt-opt', { hasText: 'Story' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/ed-2.png` });
console.log(JSON.stringify({ selName, dx, added, afterUndo, url: page.url(), errors }, null, 2));
await browser.close();
