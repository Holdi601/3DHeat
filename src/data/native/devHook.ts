/**
 * `window.__heat3dNative`, in the native app only: what its smoke run and
 * benchmarks drive (`native/tools/smoke-shell.mjs`).
 *
 *   hello()                 the core's version, threads, memory and requests served
 *   loadFiles(files)        a load of picked files, mapped automatically, shown
 *   echo(bytes)             one reply of `bytes` from the core: the transfer rate
 *   chunks(paths, roles)    the engine's chunk layout built by the core, then read over
 *   buildStats()            timings of the last dataset the core built (`nativeBuild`)
 *   uploading()             whether rows are still on their way to the GPU
 *   play(on)                the timeline playing or not
 *   parity(files, mapping)  the same load built by the core and by the page, every column compared
 *   budget(gpu?)            the budgets, the live reading and the rows on the GPU; with `gpu`, that GPU budget chosen
 */

import { call, coreEndpoint } from './core';
import { nativeRefs } from './files';
import { ChunkPart } from './gen/heat3d/v1/heat3d_pb';

export function installNativeHook(): void {
  const at = coreEndpoint();
  const hook = {
    async endpoint() {
      return (await at).url;
    },

    async hello() {
      const r = await call(await at, { case: 'hello', value: { client: '3dheat-web' } }, 'helloReply');
      return {
        core: r.body.core,
        version: r.body.coreVersion,
        threads: r.body.threads,
        memoryBytes: Number(r.body.memoryBytes),
        served: Object.fromEntries(Object.entries(r.body.served).map(([k, v]) => [k, Number(v)])),
      };
    },

    async tokens(files: File[]) {
      return nativeRefs(files);
    },

    /** `mapping` overrides what the automatic mapping chose (`ColumnMapping` fields). */
    async loadFiles(files: File[], stride = 1, mapping?: Record<string, unknown>, show = true) {
      const { loader } = await import('../loader');
      const { autoMap } = await import('../automap');
      const { useStore } = await import('../../state/store');
      const t0 = performance.now();
      const preview = await loader.preview(files[0]);
      const guessed = autoMap({
        columns: preview.columns,
        rows: preview.rows,
        numeric: preview.numeric,
        logicalTypes: preview.logicalTypes,
        hints: preview.hints,
        constant: preview.constant,
        fileCount: files.length,
      });
      if (mapping) Object.assign(guessed, mapping);
      const size = await loader.measure(files);
      const t1 = performance.now();
      const dataset = await loader.ingest(files, guessed, preview.columns, `native (${files.length})`, stride, size.rows);
      const t2 = performance.now();
      if (show) {
        const { prepareUnits } = await import('../../ui/replay/units');
        await prepareUnits(dataset);
        useStore.getState().setDataset(dataset);
      }
      return { rows: dataset.count, people: dataset.personLabels.length, groups: dataset.teamLabels.length, previewMs: t1 - t0, ingestMs: t2 - t1 };
    },

    async buildStats() {
      const { nativeBuildStats } = await import('./build');
      return nativeBuildStats.last;
    },

    uploading() {
      const eng = (globalThis as unknown as { __3dheat_engine?: { renderer?: { dataPending?: boolean } } }).__3dheat_engine;
      return !!eng?.renderer?.dataPending;
    },

    async budget(gpu?: number) {
      const { useStore } = await import('../../state/store');
      const { useLiveMemory } = await import('../liveBudget');
      if (typeof gpu === 'number') useStore.getState().setBudgets({ ...useStore.getState().budgets, gpu });
      const b = useStore.getState().budgets;
      const l = (globalThis as unknown as { __3dheat_engineLive?: { gpuBytes: number; residentRows: number; droppedRows: number } }).__3dheat_engineLive;
      return {
        gpu: b.gpu,
        gpuMax: b.gpuMax,
        gpuCeiling: b.gpuCeiling,
        gpuLive: b.gpuLive ?? null,
        ram: b.ram,
        gpuSource: b.gpuSource,
        ramSource: b.ramSource,
        host: useLiveMemory.getState().host,
        at: useLiveMemory.getState().at,
        gpuBytes: l?.gpuBytes ?? 0,
        residentRows: l?.residentRows ?? 0,
        droppedRows: l?.droppedRows ?? 0,
      };
    },

    async play(on: boolean) {
      const { useStore } = await import('../../state/store');
      useStore.getState().patchTimeline({ playing: on });
    },

    /** Builds `files` both ways and names what differs (`describeBuilt`); empty when nothing does. */
    async parity(files: File[], mapping: Record<string, unknown>) {
      const { loader } = await import('../loader');
      const { emptyColumnMapping } = await import('../../state/types');
      const { describeBuilt } = await import('./build');
      const m = { ...emptyColumnMapping(), ...mapping } as import('../../state/types').ColumnMapping;
      const was = localStorage.getItem('heat3d.nativeBuild');
      const build = async (how: 'on' | 'off') => {
        localStorage.setItem('heat3d.nativeBuild', how);
        const ds = await loader.ingest(files, m, [], 'parity', 1, 0);
        return { native: !!ds.native, d: JSON.parse(JSON.stringify(describeBuilt(ds, []))) as Record<string, unknown> };
      };
      try {
        const core = await build('on');
        const page = await build('off');
        const differs = Object.keys(page.d).filter((k) => k !== 'failed' && JSON.stringify(page.d[k]) !== JSON.stringify(core.d[k]));
        return { coreBuilt: core.native, rows: core.d.count, differs };
      } finally {
        if (was === null) localStorage.removeItem('heat3d.nativeBuild');
        else localStorage.setItem('heat3d.nativeBuild', was);
      }
    },

    async echo(bytes: number) {
      const r = await call(await at, { case: 'echo', value: { payloadBytes: BigInt(bytes) } }, 'echo');
      return { bytes: r.frame.byteLength, ms: r.ms, gbPerS: r.frame.byteLength / 1e9 / (r.ms / 1e3) };
    },

    /** The same bytes through WebView2 shared memory (Windows): the fastest path the app has. */
    async sharedEcho(bytes: number) {
      const w = globalThis as unknown as {
        chrome?: { webview?: { addEventListener(t: string, f: (e: { additionalData: { heat3d?: string; id?: number }; getBuffer(): ArrayBuffer }) => void): void; releaseBuffer(b: ArrayBuffer): void } };
        __TAURI_INTERNALS__?: { invoke(cmd: string, args: unknown): Promise<unknown> };
      };
      const wv = w.chrome?.webview;
      if (!wv || !w.__TAURI_INTERNALS__) return null;
      const id = Math.floor(Math.random() * 1e9);
      const t0 = performance.now();
      const got = new Promise<number>((resolve) =>
        wv.addEventListener('sharedbufferreceived', (e) => {
          if (e.additionalData?.id !== id) return;
          const buf = e.getBuffer();
          const n = buf.byteLength;
          // Touch every page, as a reader would.
          const v = new Uint8Array(buf);
          let sum = 0;
          for (let i = 0; i < v.length; i += 4096) sum += v[i];
          wv.releaseBuffer(buf);
          resolve(n + (sum & 0));
        }),
      );
      await w.__TAURI_INTERNALS__.invoke('shared_echo', { bytes, id });
      const n = await got;
      const ms = performance.now() - t0;
      return { bytes: n, ms, gbPerS: n / 1e9 / (ms / 1e3) };
    },

    async chunks(paths: string[], roles: Record<string, string>) {
      const files = paths.map((p) => ({ source: { case: 'path' as const, value: p }, member: '' }));
      const t0 = performance.now();
      const set = await call(await at, { case: 'buildChunks', value: { files, timeScale: 1, ...roles } }, 'chunkSet');
      const t1 = performance.now();
      let bytes = 0;
      for (const c of set.body.chunks) {
        for (const part of [ChunkPart.POSITIONS, ChunkPart.TIMES]) {
          const r = await call(await at, { case: 'readChunk', value: { handle: set.body.handle, index: c.index, part } }, 'chunkData');
          bytes += Number(r.body.data?.length ?? 0);
        }
      }
      const t2 = performance.now();
      await call(await at, { case: 'closeDataset', value: { handle: set.body.handle } }, 'closed');
      return {
        rows: Number(set.body.rows),
        chunks: set.body.chunks.length,
        buildMs: t1 - t0,
        coreMs: set.body.timing?.totalMs,
        peakBytes: Number(set.body.peakMemoryBytes),
        transferBytes: bytes,
        transferMs: t2 - t1,
        gbPerS: bytes / 1e9 / ((t2 - t1) / 1e3),
      };
    },
  };
  (globalThis as unknown as { __heat3dNative: typeof hook }).__heat3dNative = hook;
}
