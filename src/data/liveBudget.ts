/**
 * The budgets following the machine, in the native app: the card's and the
 * system's memory read again every few seconds (`host_memory`, which asks the
 * OS for its live budget and what other programs hold), and the budgets made
 * again from it. A budget the user left at the detected figure follows; one
 * they chose stays, capped by what the system allows now (`refreshBudgets`).
 *
 * When the GPU figure drops below what the rows hold, the engine gives chunks
 * back, one every tick of its own timer, never in a frame (`applyGpuBudget`).
 *
 * The reading is kept here as well, apart from the budgets, for the Memory
 * panel's live line: the budgets are only set when they move, so the panels
 * reading them are not rendered every few seconds for nothing.
 */
import { create } from 'zustand';
import { probeHostMemory, type HostMemory } from './hostMemory';
import { detectBudgets, setHeldProvider, type GpuHint, type Held } from './memory';
import { useStore } from '../state/store';

/** How often the app reads the machine again. */
export const RECHECK_MS = 5000;

export interface LiveMemory {
  /** The last reading, and when it was taken (`Date.now()`). */
  host: HostMemory | null;
  at: number;
}

export const useLiveMemory = create<LiveMemory>(() => ({ host: null, at: 0 }));

/** Whether this page runs in the native app (`data/native/core.ts`, without its protocol imports). */
function inApp(): boolean {
  return typeof globalThis !== 'undefined' && '__TAURI_INTERNALS__' in globalThis;
}

/**
 * Re-read the machine every `RECHECK_MS` in the native app, and tell the budgets
 * what this viewer holds (`held`), so a reading does not count it as taken.
 * Returns the stop.
 */
export function startLiveBudgets(gpu: () => GpuHint | null, held: () => Held): () => void {
  setHeldProvider(held);
  if (!inApp()) return () => setHeldProvider(null);
  let busy = false;
  const tick = async () => {
    if (busy) return;
    busy = true;
    try {
      const host = await probeHostMemory(true);
      if (!host) return;
      useLiveMemory.setState({ host, at: Date.now() });
      useStore.getState().refreshBudgets(detectBudgets(gpu(), host));
    } finally {
      busy = false;
    }
  };
  const timer = setInterval(() => void tick(), RECHECK_MS);
  return () => {
    clearInterval(timer);
    setHeldProvider(null);
  };
}
