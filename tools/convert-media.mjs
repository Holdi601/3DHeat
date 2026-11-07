/**
 * Convert reference media into PNGs that can be read directly.
 *
 * Chromium decodes AVIF (and, with a real Chrome channel, H.264 video), so it is
 * the most dependency-free image/video decoder available here.
 *
 *   node tools/convert-media.mjs image <in.avif> <out.png>
 *   node tools/convert-media.mjs video <in.mp4> <outDir> [count]
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const [mode, input, output, countArg] = process.argv.slice(2);
if (!mode || !input || !output) {
  console.error('usage: node tools/convert-media.mjs image|video <in> <out> [count]');
  process.exit(1);
}

const channels = [undefined, 'chrome', 'msedge'];
let browser = null;
let usedChannel = 'chromium';
for (const channel of mode === 'video' ? channels.slice(1).concat([undefined]) : channels) {
  try {
    browser = await chromium.launch(channel ? { channel } : {});
    usedChannel = channel ?? 'chromium';
    break;
  } catch {
    /* try the next one */
  }
}
if (!browser) {
  console.error('no usable browser found');
  process.exit(1);
}
console.log(`using ${usedChannel}`);

const page = await browser.newPage();
const bytes = readFileSync(input);
const mime = mode === 'video' ? 'video/mp4' : `image/${input.split('.').pop()}`;
const dataUrl = `data:${mime};base64,${bytes.toString('base64')}`;

if (mode === 'image') {
  await page.setContent(
    `<body style="margin:0"><img id="i" src="${dataUrl}"></body>`,
  );
  const el = page.locator('#i');
  await el.waitFor({ state: 'visible', timeout: 30000 });
  const box = await page.evaluate(() => {
    const i = document.getElementById('i');
    return { w: i.naturalWidth, h: i.naturalHeight };
  });
  console.log(`decoded ${box.w}x${box.h}`);
  if (!box.w) {
    console.error('decode failed — format unsupported by this browser');
    process.exit(1);
  }
  await page.setViewportSize({ width: box.w, height: box.h });
  writeFileSync(output, await el.screenshot());
  console.log(`wrote ${output}`);
} else {
  const count = Number(countArg ?? 8);
  mkdirSync(output, { recursive: true });
  await page.setContent(
    `<body style="margin:0"><video id="v" src="${dataUrl}" muted></video></body>`,
  );
  const meta = await page.evaluate(
    () =>
      new Promise((res, rej) => {
        const v = document.getElementById('v');
        v.onloadedmetadata = () => res({ d: v.duration, w: v.videoWidth, h: v.videoHeight });
        v.onerror = () => rej(new Error(`video error code ${v.error?.code}: ${v.error?.message}`));
        setTimeout(() => rej(new Error('timeout waiting for metadata')), 30000);
      }),
  );
  console.log(`video ${meta.w}x${meta.h}, ${meta.d.toFixed(1)}s`);
  await page.setViewportSize({ width: meta.w, height: meta.h });

  for (let i = 0; i < count; i++) {
    // Skip the very start and end; leaders and outros carry no information.
    const t = meta.d * (0.06 + (0.88 * i) / Math.max(1, count - 1));
    const ok = await page.evaluate(
      (time) =>
        new Promise((res) => {
          const v = document.getElementById('v');
          v.onseeked = () => res(true);
          v.currentTime = time;
          setTimeout(() => res(false), 15000);
        }),
      t,
    );
    if (!ok) {
      console.error(`seek to ${t.toFixed(2)}s timed out`);
      continue;
    }
    const name = resolve(output, `${basename(input, '.mp4').slice(0, 24)}-${String(i).padStart(2, '0')}.png`);
    writeFileSync(name, await page.locator('#v').screenshot());
    console.log(`wrote ${name} @ ${t.toFixed(2)}s`);
  }
}

await browser.close();
