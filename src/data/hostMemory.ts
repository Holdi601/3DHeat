/**
 * The machine's real memory, from the process serving the page.
 *
 * Every in-browser signal about memory is either capped or absent:
 * `navigator.deviceMemory` is truncated at 8GiB by specification to limit
 * fingerprinting, so a 16GB laptop and a 256GB workstation report the same
 * number; nothing reports *free* memory; nothing reports VRAM. A budget derived
 * from those is sized for the smallest machine consistent with what the browser
 * was willing to say, which is how a viewer ends up telling someone with plenty
 * of RAM that their load is "close to the budget".
 *
 * The dev server has no such limits, so it is asked instead — see
 * `HOST_MEMORY_ROUTE` in `vite.config.ts`. When the endpoint is missing the
 * capped heuristic remains, unchanged, as the fallback: that is the case for any
 * static deployment, where there is no server behind the bundle.
 *
 * Fetched once and remembered. Free memory does drift, but re-reading it per
 * question would make the budget move under the user while they are reading it;
 * the panel's Re-detect button is the deliberate way to take a fresh reading.
 * The native app is the exception: there the budgets follow the machine, read
 * again every few seconds (`liveBudget.ts`), and a user's own choice stays.
 */

export interface HostMemory {
  /** Installed physical memory in bytes. */
  totalBytes: number;
  /** Physical memory the OS reports as free, at the moment of the reading. */
  freeBytes: number | null;
  cpus: number | null;
  platform: string | null;
  /**
   * The GPU's memory in bytes, and where the figure came from.
   *
   * There is no VRAM size API in WebGL or WebGPU at all — not clamped, absent —
   * so without this the ceiling is inferred from the largest texture a context
   * admits to, which tells an integrated part from a discrete one and nothing
   * finer. That inference defaulted to 2GB and refused a 2.32GB load on a 16GB
   * card.
   */
  vramBytes: number | null;
  vramSource: string | null;
  /**
   * The OS's budget for one process on that card (DXGI `QueryVideoMemoryInfo`,
   * Vulkan `VK_EXT_memory_budget`), bytes: what the system means to give before
   * it starts paging out. The native app only.
   */
  vramBudgetBytes?: number | null;
  /** Whether that budget already leaves out what other processes hold (Vulkan's does; DXGI's does not). */
  vramBudgetNet?: boolean;
  /** Held on the card by every program together, this app included (Windows' GPU memory counters). */
  vramUsedBytes?: number | null;
  /** Held on the card by this app's own processes, the window's among them. */
  vramOwnBytes?: number | null;
  /** When the reading was taken (`performance.now()`). */
  at?: number;
}

/**
 * How long to wait before giving up and using the heuristic.
 *
 * Short on purpose. This runs before the first dataset can be sized, so a slow
 * or hanging answer delays the panel; and the fallback is the behaviour that
 * shipped before this existed, so losing the probe costs accuracy rather than
 * function.
 */
const TIMEOUT_MS = 1500;

const ROUTE = '/__host/memory';

let cached: HostMemory | null | undefined;
let inflight: Promise<HostMemory | null> | null = null;

function parse(raw: unknown): HostMemory | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const total = typeof r.totalBytes === 'number' && r.totalBytes > 0 ? r.totalBytes : null;
  // Total is the one field that makes the answer worth having; without it there
  // is nothing here the heuristic does not already provide.
  if (total === null) return null;
  const free = typeof r.freeBytes === 'number' && r.freeBytes >= 0 ? r.freeBytes : null;
  const vram = typeof r.vramBytes === 'number' && r.vramBytes > 0 ? r.vramBytes : null;
  const bytes = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);
  // The card's figures only beside a card, and none above what the machine could address.
  const vramBudget = vram !== null ? bytes(r.vramBudgetBytes) : null;
  const vramUsed = vram !== null ? bytes(r.vramUsedBytes) : null;
  const vramOwn = vramUsed !== null ? bytes(r.vramOwnBytes) : null;
  return {
    totalBytes: total,
    // Free above total is not a reading, it is a bug somewhere; drop it rather
    // than budget from it.
    freeBytes: free !== null && free <= total ? free : null,
    // Likewise a card claiming more memory than the machine has: possible in
    // principle, but far more likely to be a misparsed hex value.
    vramBytes: vram !== null && vram <= total ? vram : null,
    vramSource: typeof r.vramSource === 'string' && r.vramSource ? r.vramSource : null,
    vramBudgetBytes: vramBudget !== null && vramBudget > 0 && vramBudget <= vram! * 1.01 ? vramBudget : null,
    vramUsedBytes: vramUsed !== null && vramUsed <= vram! * 1.01 ? vramUsed : null,
    // Own above everyone's is two readings taken apart; the smaller is the truer.
    vramOwnBytes: vramOwn !== null ? Math.min(vramOwn, vramUsed!) : null,
    vramBudgetNet: r.vramBudgetNet === true,
    at: typeof performance !== 'undefined' ? performance.now() : Date.now(),
    cpus: typeof r.cpus === 'number' && r.cpus > 0 ? r.cpus : null,
    platform: typeof r.platform === 'string' ? r.platform : null,
  };
}

/** Ask the host, or return null if it cannot be reached. */
export async function probeHostMemory(force = false): Promise<HostMemory | null> {
  if (!force && cached !== undefined) return cached;
  if (!force && inflight) return inflight;
  if (typeof fetch !== 'function') {
    cached = null;
    return null;
  }

  const run = (async (): Promise<HostMemory | null> => {
    // The native app answers itself (its `host_memory` command), card memory included.
    const tauri = (globalThis as unknown as { __TAURI_INTERNALS__?: { invoke(cmd: string): Promise<unknown> } }).__TAURI_INTERNALS__;
    if (tauri) {
      const got = await tauri.invoke('host_memory').catch(() => null);
      if (got) return parse(got);
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(ROUTE, { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) return null;
        // A static host that answers every path with index.html would give a 200
        // and a page of HTML here, so the body has to be checked rather than the
        // status. `res.json()` throwing on that is the check.
        return parse(await res.json());
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return null;
    }
  })();

  inflight = run;
  try {
    const out = await run;
    cached = out;
    return out;
  } finally {
    inflight = null;
  }
}

/** Forget the reading, so the next probe goes back to the host. */
export function resetHostMemory(): void {
  cached = undefined;
  inflight = null;
}

/** What the last probe found, without starting one. */
export function knownHostMemory(): HostMemory | null {
  return cached ?? null;
}
