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
// Which icon.svg these were made from: the app's build.rs refuses icons made from another one
// (a stale icon.ico survives a checkout, as the icons are not committed).
writeFileSync(join(icons, 'source.stamp'), `${svgStamp(svg)}\n`);

/** FNV-1a 64 of the SVG with its line ends as LF, in hex; build.rs computes the same. */
function svgStamp(text) {
  let h = 0xcbf29ce484222325n;
  for (const b of Buffer.from(text.replace(/\r/g, ''), 'utf8')) {
    h ^= BigInt(b);
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, '0');
}
