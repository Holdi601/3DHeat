/**
 * Writes src/ui/shell/commandIndex.json: every section of the side panel and
 * every labelled control in it, on every workspace and in the view modes that
 * show different panels, so the command palette (Ctrl+K) can find a setting
 * whose section is closed or on another workspace.
 *
 *   node tools/gen-command-index.mjs [url]     (dev server on :5273 by default)
 *
 * Opens every section with synthetic data loaded and reads the labels back to
 * their message keys (English), so the index holds keys and the palette says
 * them in the viewer's language. A label that is not a message without values
 * (a level's name, a column, a count) is left out. Run it again after adding
 * panels or controls; the palette also reads whatever is on the page when it
 * opens, so a missing entry only costs the search inside closed sections.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:5273/';
const OUT = resolve(import.meta.dirname, '..', 'src', 'ui', 'shell', 'commandIndex.json');

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, locale: 'en' });
page.on('pageerror', (e) => console.log('  pageerror', e.message));
// The page in English, whatever the machine's language.
await page.addInitScript(() => localStorage.setItem('heat3d.language', 'en'));
// No hot reload mid-run (see tools/smoke.mjs).
await page.route('**/@vite/client', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'text/javascript',
    body: `const s=new Map();export function updateStyle(i,c){let e=s.get(i);if(!e){e=document.createElement('style');document.head.appendChild(e);s.set(i,e)}e.textContent=c}
export function removeStyle(i){s.get(i)?.remove();s.delete(i)}
export function createHotContext(){const n=()=>{};return{accept:n,acceptExports:n,acceptDeps:n,dispose:n,prune:n,decline:n,invalidate:n,on:n,off:n,send:n,data:{}}}
export function injectQuery(u){return u}export class ErrorOverlay extends HTMLElement{}`,
  }),
);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForFunction(() => globalThis.__3dheat?.useStore.getState().stats.backend, null, { timeout: 60_000 });
await page.evaluate(() => globalThis.__3dheat.load(200_000));
await page.waitForTimeout(2000);

/** Opens every section on the page, the ones inside too, then reads them. */
async function read(tab, mode) {
  for (let pass = 0; pass < 5; pass++) {
    const opened = await page.evaluate(() => {
      let n = 0;
      for (const h of document.querySelectorAll('.sidebar .section:not(.open) > header')) {
        h.click();
        n++;
      }
      return n;
    });
    await page.waitForTimeout(600);
    if (!opened) break;
  }
  return page.evaluate(
    async ([tab, mode]) => {
      const seen = performance
        .getEntriesByType('resource')
        .map((e) => e.name)
        .filter((n) => new URL(n).pathname === '/src/i18n/index.ts');
      const { keyOf } = await import(seen.length ? seen[seen.length - 1] : '/src/i18n/index.ts');
      const out = [];
      for (const sec of document.querySelectorAll('.sidebar .section[data-section]')) {
        const path = [];
        for (let s = sec; s; s = s.parentElement?.closest('.section') ?? null) path.unshift(s.dataset.section ?? '');
        // Only sections whose titles are messages: a title with a value in it (a map's name) is no key.
        if (path.some((p) => !p || !/^[a-z][\w-]*(\.[\w-]+)+$/.test(p))) continue;
        out.push({ tab, mode, path });
        const body = sec.querySelector(':scope > .body');
        if (!body) continue;
        const labels = new Set();
        for (const el of body.querySelectorAll('.field > .label > span:first-child, label, button, summary')) {
          if (el.closest('.section') !== sec) continue;
          const text = el.textContent?.replace(/\s+/g, ' ').trim();
          if (!text || text.length > 60) continue;
          const key = keyOf(text);
          if (key && !labels.has(key)) {
            labels.add(key);
            out.push({ tab, mode, path, label: key });
          }
        }
      }
      return out;
    },
    [tab, mode],
  );
}

const PLAN = [
  ['heat', ['heat-simple', 'heat-lines', 'team']],
  ['match', ['team', 'heat-simple']],
  ['race', [null]],
  ['plan', [null]],
  ['vehicle', [null]],
];

const entries = new Map();
for (const [tab, modes] of PLAN) {
  await page.locator('[role=tab]').nth(['heat', 'race', 'match', 'plan', 'vehicle'].indexOf(tab)).click();
  await page.waitForTimeout(1200);
  for (const mode of modes) {
    if (mode) {
      await page.evaluate((m) => globalThis.__3dheat.useStore.getState().setMode(m), mode);
      await page.waitForTimeout(1000);
    }
    for (const e of await read(tab, mode)) {
      const sig = `${e.tab}|${e.path.join('>')}|${e.label ?? ''}`;
      // The mode it was first seen in: the palette switches to it when the section is not on the page.
      if (!entries.has(sig)) entries.set(sig, e);
    }
    console.log(`  ${tab}${mode ? ` (${mode})` : ''}: ${entries.size} so far`);
  }
}
await browser.close();

const list = [...entries.values()].map((e) => (e.mode == null ? { tab: e.tab, path: e.path, ...(e.label ? { label: e.label } : {}) } : e));
writeFileSync(OUT, `${JSON.stringify({ note: 'Written by tools/gen-command-index.mjs; do not edit.', entries: list }, null, 0).replace(/\},\{/g, '},\n{')}\n`);
console.log(`${list.length} entries -> ${OUT}`);
