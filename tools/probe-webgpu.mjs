/**
 * Find a headless Chromium configuration that exposes a WebGPU adapter.
 *
 * Shipping a GPU backend that has never executed is not acceptable, and the
 * flags needed for software WebGPU in headless Chromium are both
 * version-dependent and undocumented, so this probes combinations rather than
 * guessing one.
 */
import { chromium } from 'playwright';

const BASE = [
  '--enable-unsafe-webgpu',
  '--enable-features=Vulkan',
  '--disable-vulkan-surface',
  '--ignore-gpu-blocklist',
];

const CANDIDATES = [
  { label: 'headless-shell + swiftshader adapter', channel: undefined, headless: true, args: [...BASE, '--use-webgpu-adapter=swiftshader'] },
  { label: 'headless-shell + vulkan swiftshader', channel: undefined, headless: true, args: [...BASE, '--use-vulkan=swiftshader'] },
  { label: 'chromium channel + swiftshader adapter', channel: 'chromium', headless: true, args: [...BASE, '--use-webgpu-adapter=swiftshader'] },
  { label: 'chromium channel + vulkan swiftshader', channel: 'chromium', headless: true, args: [...BASE, '--use-vulkan=swiftshader'] },
  { label: 'chromium channel, real gpu', channel: 'chromium', headless: true, args: [...BASE] },
  { label: 'chromium channel, headed', channel: 'chromium', headless: false, args: [...BASE, '--use-webgpu-adapter=swiftshader'] },
  { label: 'chrome channel, headed', channel: 'chrome', headless: false, args: [...BASE] },
  { label: 'chrome channel, headless', channel: 'chrome', headless: true, args: [...BASE, '--use-webgpu-adapter=swiftshader'] },
];

for (const c of CANDIDATES) {
  let browser = null;
  try {
    browser = await chromium.launch({
      ...(c.channel ? { channel: c.channel } : {}),
      headless: c.headless,
      args: c.args,
    });
    const page = await browser.newPage();
    // navigator.gpu is only exposed in a secure context, and about:blank is not
    // reliably one — so probe on the dev server's origin.
    await page.goto('http://127.0.0.1:5273/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    const result = await page.evaluate(async () => {
      if (!navigator.gpu) return { ok: false, why: 'navigator.gpu missing' };
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) return { ok: false, why: 'requestAdapter returned null' };
        const features = [...adapter.features];
        const device = await adapter.requestDevice();
        return {
          ok: true,
          features,
          info: adapter.info
            ? `${adapter.info.vendor ?? '?'} ${adapter.info.architecture ?? ''}`.trim()
            : 'no info',
          maxStorage: adapter.limits.maxStorageBufferBindingSize,
          hasDevice: !!device,
        };
      } catch (e) {
        return { ok: false, why: String(e) };
      }
    });
    console.log(
      `${result.ok ? 'OK  ' : 'no  '} ${c.label}` +
        (result.ok
          ? ` — ${result.info}, storage ${(result.maxStorage / 1e6).toFixed(0)}MB, features: ${result.features.join(',') || 'none'}`
          : ` — ${result.why}`),
    );
    if (result.ok) {
      console.log(`\nUse: channel=${c.channel ?? 'default'} headless=${c.headless}`);
      console.log(`args: ${JSON.stringify(c.args)}`);
      await browser.close();
      process.exit(0);
    }
  } catch (e) {
    console.log(`err  ${c.label} — ${String(e).split('\n')[0]}`);
  } finally {
    await browser?.close().catch(() => {});
  }
}
console.log('\nNo configuration produced a WebGPU adapter.');
process.exit(1);
