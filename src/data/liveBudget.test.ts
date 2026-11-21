import { describe, expect, it } from 'vitest';
import type { HostMemory } from './hostMemory';
import { detectBudgets, gpuReading, nativePageRowsFor, setHeldProvider, VRAM_HEADROOM_MIN } from './memory';
import { effectiveGpuBudget } from '../render/budget';
import { leastUsedChunk } from '../render/evict';
import { useStore } from '../state/store';

const GiB = 1024 ** 3;

/** The app's reading of a 16 GiB card on a 64 GiB machine, as `host_memory` gives it. */
const app = (over: Partial<HostMemory> = {}): HostMemory => ({
  totalBytes: 64 * GiB,
  freeBytes: 40 * GiB,
  cpus: 32,
  platform: 'windows',
  vramBytes: 16 * GiB,
  vramSource: 'DXGI budget, GPU memory counters',
  vramBudgetBytes: 15.5 * GiB,
  vramUsedBytes: 4 * GiB,
  vramOwnBytes: 0,
  ...over,
});

describe('the live GPU budget', () => {
  it('is the card less what other programs hold and the headroom, not a share of it', () => {
    const r = gpuReading(app())!;
    expect(r.others).toBe(4 * GiB);
    expect(r.headroom).toBe(VRAM_HEADROOM_MIN);
    // 16 - 4 others - 1 headroom, under the OS's 15.5.
    expect(r.rows).toBeCloseTo(11 * GiB, -6);
    expect(r.live).toBe(true);
  });

  it('never above the OS budget for one process', () => {
    const r = gpuReading(app({ vramUsedBytes: 0 }))!;
    expect(r.rows).toBeCloseTo(14.5 * GiB, -6);
  });

  it('does not count its own rows as taken, so uploading them does not lower it', () => {
    // 6 GiB of rows and 0.5 GiB of level on the card, all of it this app's.
    const held = { gpuRows: 6 * GiB, gpuOther: 0.5 * GiB, ram: 0 };
    const before = gpuReading(app(), { gpuRows: 0, gpuOther: 0.5 * GiB, ram: 0 })!;
    const after = gpuReading(app({ vramUsedBytes: 10.7 * GiB, vramOwnBytes: 6.7 * GiB }), held)!;
    expect(after.rows).toBeCloseTo(before.rows, -6);
    // Nor what its own processes hold beyond that (a pool, a chunk given back but not yet freed): no chain of evictions.
    const pooled = gpuReading(app({ vramUsedBytes: 12.7 * GiB, vramOwnBytes: 8.7 * GiB }), { gpuRows: 4 * GiB, gpuOther: 0.5 * GiB, ram: 0 })!;
    expect(pooled.rows).toBeCloseTo(before.rows, -6);
  });

  it('drops when another program takes memory', () => {
    const quiet = gpuReading(app())!;
    const busy = gpuReading(app({ vramUsedBytes: 9 * GiB }))!;
    expect(busy.rows).toBeCloseTo(quiet.rows - 5 * GiB, -6);
  });

  it('adds back what it holds to a budget that already leaves it out (Vulkan)', () => {
    const vk = app({ vramUsedBytes: null, vramOwnBytes: null, vramBudgetBytes: 8 * GiB, vramBudgetNet: true, vramSource: 'Vulkan memory budget' });
    const r = gpuReading(vk, { gpuRows: 3 * GiB, gpuOther: 0, ram: 0 })!;
    expect(r.rows).toBeCloseTo(10 * GiB, -6);
    // And never past the card.
    expect(gpuReading(vk, { gpuRows: 30 * GiB, gpuOther: 0, ram: 0 })!.rows).toBeCloseTo(15 * GiB, -6);
  });

  it('takes the card less the headroom when only its size is known, and does not cap a choice then', () => {
    const plain = app({ vramBudgetBytes: null, vramUsedBytes: null, vramOwnBytes: null });
    const r = gpuReading(plain)!;
    expect(r.rows).toBeCloseTo(15 * GiB, -6);
    expect(r.live).toBe(false);
    expect(detectBudgets(null, plain).gpuLive).toBeNull();
  });

  it('caps any choice, the user’s too, while it lasts', () => {
    expect(effectiveGpuBudget(14 * GiB, 15 * GiB, 6 * GiB)).toBe(6 * GiB);
    expect(effectiveGpuBudget(4 * GiB, 15 * GiB, 6 * GiB)).toBe(4 * GiB);
    expect(effectiveGpuBudget(14 * GiB, 15 * GiB, null)).toBe(14 * GiB);
  });
});

describe('a re-check of the machine', () => {
  it('moves a budget left at the detected figure, keeps one the user chose, and caps both', () => {
    const s = useStore.getState();
    s.setBudgets(detectBudgets(null, app()));
    expect(useStore.getState().budgets.gpu).toBeCloseTo(11 * GiB, -6);
    // Another program takes 5 GiB: the default follows.
    s.refreshBudgets(detectBudgets(null, app({ vramUsedBytes: 9 * GiB })));
    expect(useStore.getState().budgets.gpu).toBeCloseTo(6 * GiB, -6);
    expect(useStore.getState().budget.gpuBudgetLive).toBeCloseTo(6 * GiB, -6);
    // The user chooses 13 GiB; the program goes; the choice stays, the live figure caps it.
    s.setBudgets({ ...useStore.getState().budgets, gpu: 13 * GiB });
    s.refreshBudgets(detectBudgets(null, app()));
    const b = useStore.getState();
    expect(b.budgets.gpu).toBe(13 * GiB);
    expect(effectiveGpuBudget(b.budget.gpuBudgetBytes, b.budget.gpuBudgetMax, b.budget.gpuBudgetLive)).toBeCloseTo(11 * GiB, -6);
  });

  it('sets nothing when nothing moved', () => {
    const s = useStore.getState();
    s.setBudgets(detectBudgets(null, app()));
    const before = useStore.getState().budgets;
    s.refreshBudgets(detectBudgets(null, app({ freeBytes: 40 * GiB + 10 * 1024 ** 2 })));
    expect(useStore.getState().budgets).toBe(before);
  });
});

describe('the page rows of a core-built load', () => {
  it('follow free memory, after what the core needs', () => {
    const host = app({ freeBytes: 20 * GiB });
    // 400M rows: the core's 16 GB leave about 2 GB for the page; 500M nothing: the 10M floor.
    expect(nativePageRowsFor(host, 400_000_000, 200_000_000)).toBe(Math.floor((20 * GiB - 3.2 * GiB - 16e9) / 30));
    expect(nativePageRowsFor(host, 500_000_000, 200_000_000)).toBe(10_000_000);
    // 50M rows: 2 GB for the core, the rest for the page, up to the cap.
    expect(nativePageRowsFor(host, 50_000_000, 200_000_000)).toBe(200_000_000);
    expect(nativePageRowsFor(app({ freeBytes: 12 * GiB }), 100_000_000, 200_000_000)).toBe(Math.floor((12 * GiB - 3.2 * GiB - 4e9) / 30));
    expect(nativePageRowsFor(null, 100_000_000, 200_000_000)).toBe(200_000_000);
  });
});

describe('the chunk given back first', () => {
  it('is the least recently drawn, the latest in time of a tie, and none twice', () => {
    const chunks = [
      { drawnFrame: 10, start: 0, evicted: false },
      { drawnFrame: 4, start: 100, evicted: false },
      { drawnFrame: 4, start: 200, evicted: false },
      { drawnFrame: 2, start: 300, evicted: true },
    ];
    expect(leastUsedChunk(chunks)).toBe(2);
    chunks[2].evicted = true;
    expect(leastUsedChunk(chunks)).toBe(1);
    chunks[1].evicted = true;
    chunks[0].evicted = true;
    expect(leastUsedChunk(chunks)).toBe(-1);
  });
});

describe('what is held', () => {
  it('comes from the provider the app registers, and nothing when none is', () => {
    setHeldProvider(() => ({ gpuRows: 2 * GiB, gpuOther: 0, ram: 0 }));
    try {
      const r = detectBudgets(null, app({ vramUsedBytes: 6 * GiB, vramOwnBytes: 2 * GiB }));
      expect(r.gpuMax).toBeCloseTo(11 * GiB, -6);
    } finally {
      setHeldProvider(null);
    }
  });
});
