/**
 * The app's icons, from `crates/app-tauri/icons/icon.svg` (the logo's small mark,
 * `public/brand/icon.svg`, without its width and height; docs/brand.md): the
 * SVG drawn at 1024 px by the repository's Playwright Chromium, then every size
 * Tauri bundles made by `tauri icon`. Generated, not committed.
 *
 *   node tools/icons.mjs
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const icons = join(here, '..', 'crates', 'app-tauri', 'icons');
const svg = readFileSync(join(icons, 'icon.svg'), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg width="1024" height="1024" ')}</body></html>`);
const png = join(icons, 'source.png');
writeFileSync(png, await page.screenshot({ omitBackground: true }));
await browser.close();
execFileSync(process.execPath, [join(here, '..', 'node_modules', '@tauri-apps', 'cli', 'tauri.js'), 'icon', png, '-o', icons], { stdio: 'inherit' });
