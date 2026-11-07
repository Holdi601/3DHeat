/**
 * What the auto-mapper makes of a file: which column becomes what, and which
 * ones are retained as filterable attributes.
 *
 *   node tools/probe-mapping.mjs [path-under-TestData]
 */
import { chromium } from 'playwright';
import { localSample } from './local-data.mjs';

const target =
  process.argv[2] ?? localSample('primary', 0);
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('  pageerror:', e.message));
await page.goto('http://127.0.0.1:5273/?backend=webgl2', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(globalThis.__3dheat_engine), null, { timeout: 40000 });

const out = await page.evaluate(async (target) => {
  const { previewSource } = await import('/src/data/sourcePreview.ts');
  const { autoMap } = await import('/src/data/automap.ts');
  const { ingestFiles } = await import('/src/data/ingestFiles.ts');
  const bytes = await (await fetch('/' + target)).arrayBuffer();
  const file = new File([bytes], target.split('/').pop());
  const p = await previewSource(file);
  const mapping = autoMap({
    columns: p.columns,
    rows: p.rows,
    numeric: p.numeric,
    logicalTypes: p.logicalTypes,
    fileCount: 1,
  });
  const ds = (await ingestFiles({ files: [file], mapping, columns: p.columns, name: 'm' })).dataset;
  return {
    mapping,
    attrs: ds.attrs.map((a) => ({
      name: a.name,
      kind: a.kind,
      values: a.categories ? a.categories.length : null,
      sample: a.categories ? a.categories.slice(0, 4) : [a.min, a.max],
    })),
    rows: ds.count,
  };
}, target);

console.log(JSON.stringify(out, null, 1));
await browser.close();
