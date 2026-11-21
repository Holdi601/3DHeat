/**
 * Local usage statistics: whether they are kept, and keeping them.
 *
 * Off unless asked for. The user turns it on in Settings (kept in this
 * browser), or a local install turns it on with `"usageStats": true` in its
 * git-ignored `tools/local-data.json`, which the local server reports at
 * `/__heat3d/usage` - asked only when the viewer is served from this machine
 * (a loopback address), so a hosted copy makes no request at all. The user's
 * own choice in Settings always wins over the local file.
 *
 * Recording is a push onto an array: no work on the frame path, no I/O per
 * event. The buffer is written out when the browser is idle, every few
 * seconds at most: to IndexedDB in this browser, and, where the local server
 * keeps a file (`usage-YYYY-MM-DD.jsonl`), posted there as one batch. Nothing
 * goes anywhere else. Every event is checked against the schema before it is
 * kept; one that fails is dropped and counted.
 */

import { create } from 'zustand';
import { has } from '../i18n';
import { checkEvent, LIMITS, USAGE_VERSION, type UsageEvent } from './schema';
import { idbAdd } from './db';

export const USAGE_ROUTE = '/__heat3d/usage';
const CHOICE_KEY = 'heat3d.usage';

export type Choice = 'on' | 'off' | null;

interface UsageState {
  /** The user's choice in Settings; null when never made. */
  choice: Choice;
  /** The local server keeps a file (its key in tools/local-data.json is on). */
  local: boolean;
  /** Recording now. */
  enabled: boolean;
  /** Events kept since the page loaded, and dropped by the schema. */
  kept: number;
  dropped: number;
  setChoice: (c: Choice) => void;
}

function loadChoice(): Choice {
  try {
    const v = localStorage.getItem(CHOICE_KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch {
    return null;
  }
}

const enabledFor = (choice: Choice, local: boolean) => choice === 'on' || (choice === null && local);

export const useUsage = create<UsageState>((set, get) => ({
  choice: loadChoice(),
  local: false,
  enabled: enabledFor(loadChoice(), false),
  kept: 0,
  dropped: 0,
  setChoice: (choice) => {
    try {
      if (choice) localStorage.setItem(CHOICE_KEY, choice);
      else localStorage.removeItem(CHOICE_KEY);
    } catch {
      // Not kept: lasts the page.
    }
    const enabled = enabledFor(choice, get().local);
    if (!enabled) buf.length = 0;
    set({ choice, enabled });
  },
}));

/** Whether recording is on: one read, for the hot callers. */
export const usageOn = () => useUsage.getState().enabled;

/** This page load's id: random, so one visit's events read as one path. */
export const SESSION_ID = (() => {
  const b = new Uint8Array(6);
  try {
    crypto.getRandomValues(b);
  } catch {
    for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
  }
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
})();

/** An event without its time and page load, which `record` adds. */
export type Draft = Omit<UsageEvent, 't' | 's'>;

const buf: UsageEvent[] = [];
const beforeFlush: Array<() => void> = [];
let scheduled = 0;
let idleHandle = 0;

/** Keeps an event. O(1): a push, and a timer set once per batch. */
export function record(e: Draft): void {
  if (!useUsage.getState().enabled) return;
  buf.push({ t: Date.now(), s: SESSION_ID, ...e } as UsageEvent);
  schedule(buf.length >= 400 ? 200 : 5000);
}

/** Run before each flush: the aggregators (time, frame rate, exposure) write their totals then. */
export function onFlush(fn: () => void): void {
  beforeFlush.push(fn);
}

const ric: (cb: () => void, opts: { timeout: number }) => number =
  typeof requestIdleCallback === 'function' ? (cb, o) => requestIdleCallback(cb, o) : (cb) => window.setTimeout(cb, 0);

function schedule(ms: number): void {
  if (scheduled || idleHandle || typeof window === 'undefined') return;
  scheduled = window.setTimeout(() => {
    scheduled = 0;
    idleHandle = ric(() => {
      idleHandle = 0;
      void flush();
    }, { timeout: 10_000 });
  }, ms);
}

/** The buffered events that pass the schema, the buffer emptied. */
export function drain(): UsageEvent[] {
  for (const fn of beforeFlush) {
    try {
      fn();
    } catch {
      // An aggregator's slip loses its totals, not the batch.
    }
  }
  const out: UsageEvent[] = [];
  let dropped = 0;
  for (const e of buf.splice(0)) {
    if (checkEvent(e, has) === null) out.push(e);
    else dropped++;
  }
  if (dropped || out.length) useUsage.setState((s) => ({ dropped: s.dropped + dropped, kept: s.kept + out.length }));
  return out;
}

/** Splits events into batches the server takes (count and bytes). */
export function batches(events: UsageEvent[]): string[] {
  const out: string[] = [];
  let part: string[] = [];
  let bytes = 0;
  const close = () => {
    if (part.length) out.push(`{"v":${USAGE_VERSION},"events":[${part.join(',')}]}`);
    part = [];
    bytes = 0;
  };
  for (const e of events) {
    const s = JSON.stringify(e);
    if (part.length >= LIMITS.batch || bytes + s.length + 64 > LIMITS.bytes / 2) close();
    part.push(s);
    bytes += s.length + 1;
  }
  close();
  return out;
}

/** Writes the buffer out: IndexedDB, and the local file where there is one. `leaving`: the page is going. */
export async function flush(leaving = false): Promise<void> {
  if (!useUsage.getState().enabled) {
    buf.length = 0;
    return;
  }
  const events = drain();
  if (!events.length) return;
  const local = useUsage.getState().local;
  if (local) {
    for (const body of batches(events)) {
      if (leaving && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(USAGE_ROUTE, new Blob([body], { type: 'application/json' }));
      } else {
        void fetch(USAGE_ROUTE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: body.length < 60_000 }).catch(() => undefined);
      }
    }
  }
  await idbAdd(events).catch(() => undefined);
}

/**
 * Asks the local server whether this install keeps statistics: only when the
 * page is served from this machine, so a hosted viewer sends nothing.
 */
export async function probeLocal(): Promise<boolean> {
  if (typeof location === 'undefined' || !/^(127\.\d+\.\d+\.\d+|localhost|\[::1\])$/.test(location.hostname)) return false;
  try {
    const r = await fetch(USAGE_ROUTE, { cache: 'no-store' });
    if (r.status !== 200 || !/json/.test(r.headers.get('content-type') ?? '')) return false;
    const j = (await r.json()) as { enabled?: unknown };
    const local = j.enabled === true;
    useUsage.setState((s) => ({ local, enabled: enabledFor(s.choice, local) }));
    return local;
  } catch {
    return false;
  }
}

/** For tests: the buffer as it stands. */
export const _buffer = buf;
