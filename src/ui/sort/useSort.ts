/**
 * A list's sort: what it is sorted by and which way, remembered per list.
 *
 * `useSort(listId, options, by)` holds the choice; `useSorted(items, sort)`
 * gives the items in it; `SortControl` and `SortTh` (SortControl.tsx) let the
 * user change it. The choice is kept in this browser under the list's id, so a
 * panel opens sorted the way it was left; without storage (a private window,
 * blocked site data) it simply starts from the list's default.
 *
 * A list longer than `OFF_PAGE` is sorted in a worker: its keys go across, an
 * order comes back, and until it does the list shows its previous order. A
 * shorter one is sorted on the page, memoised, which is quicker than the trip.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { lang, useLang } from '../../i18n';
import { orderOf, sortList, type SortDir, type SortKey, type SortKind } from './order';

export type { SortDir, SortKind, SortKey } from './order';

/** Longer lists than this are sorted in the worker. */
export const OFF_PAGE = 10_000;

export interface SortOption<T> {
  /** Kept in storage and named by `SortTh`. */
  id: string;
  /** As the dropdown says it, in the viewer's language. */
  label: string;
  /** The value sorted by; `null` for the list's own order (as the data has it). */
  key: ((item: T) => SortKey) | null;
  /** Default 'text'. */
  kind?: SortKind;
  /** Which way it runs when picked: names A-Z, numbers highest first unless given. */
  dir?: SortDir;
}

export interface Sort<T> {
  list: string;
  by: string;
  dir: SortDir;
  options: SortOption<T>[];
  /** The option `by` names (the first, if the stored one is gone). */
  option: SortOption<T>;
  /** Sort by `by`, its own direction unless one is given. */
  set: (by: string, dir?: SortDir) => void;
  /** Flip the direction. */
  flip: () => void;
  /** A column header clicked: that column, or the other way if it already is. */
  click: (by: string) => void;
}

const PREFIX = 'heat3d.sort.';

function read(list: string): { by: string; dir: SortDir } | null {
  try {
    const raw = localStorage.getItem(PREFIX + list);
    if (!raw) return null;
    const v = JSON.parse(raw) as { by?: unknown; dir?: unknown };
    if (typeof v.by !== 'string' || (v.dir !== 'asc' && v.dir !== 'desc')) return null;
    return { by: v.by, dir: v.dir };
  } catch {
    return null;
  }
}

function write(list: string, by: string, dir: SortDir): void {
  try {
    localStorage.setItem(PREFIX + list, JSON.stringify({ by, dir }));
  } catch {
    /* no storage: the choice lasts as long as the panel */
  }
}

/** The direction an option runs in when picked. */
export function naturalDir<T>(o: SortOption<T> | undefined): SortDir {
  return o?.dir ?? (o && o.kind === 'number' ? 'desc' : 'asc');
}

/**
 * A list's sort choice. `list` names it for storage ("filter.values"), `by`
 * is the option it starts on.
 */
export function useSort<T>(list: string, options: SortOption<T>[], by: string, dir?: SortDir): Sort<T> {
  const [state, setState] = useState(() => {
    const kept = read(list);
    return kept ?? { by, dir: dir ?? naturalDir(options.find((o) => o.id === by)) };
  });
  const option = options.find((o) => o.id === state.by) ?? options.find((o) => o.id === by) ?? options[0];
  const cur = option.id === state.by ? state : { by: option.id, dir: dir ?? naturalDir(option) };
  const optsRef = useRef(options);
  optsRef.current = options;
  const curRef = useRef(cur);
  curRef.current = cur;

  const set = useCallback(
    (nextBy: string, nextDir?: SortDir) => {
      const d = nextDir ?? naturalDir(optsRef.current.find((o) => o.id === nextBy));
      write(list, nextBy, d);
      setState({ by: nextBy, dir: d });
    },
    [list],
  );
  const flip = useCallback(() => {
    const c = curRef.current;
    set(c.by, c.dir === 'asc' ? 'desc' : 'asc');
  }, [set]);
  const click = useCallback(
    (col: string) => {
      const c = curRef.current;
      if (c.by === col) set(col, c.dir === 'asc' ? 'desc' : 'asc');
      else set(col);
    },
    [set],
  );
  return { list, by: cur.by, dir: cur.dir, options, option, set, flip, click };
}

let worker: Worker | null = null;
let workerFailed = false;
let nextId = 1;
const waiting = new Map<number, (order: Uint32Array) => void>();

/** The order of `keys`, worked out in the worker (or here, where there is none). */
function orderOffPage(keys: SortKey[], kind: SortKind, dir: SortDir, locale: string): Promise<Uint32Array> {
  if (!workerFailed && typeof Worker !== 'undefined') {
    try {
      if (!worker) {
        worker = new Worker(new URL('./sortWorker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (e: MessageEvent<{ id: number; order: Uint32Array }>) => {
          waiting.get(e.data.id)?.(e.data.order);
          waiting.delete(e.data.id);
        };
        worker.onerror = () => {
          workerFailed = true;
          worker = null;
        };
      }
      const id = nextId++;
      const w = worker;
      return new Promise((resolve) => {
        waiting.set(id, resolve);
        w.postMessage({ id, keys, kind, dir, locale });
      });
    } catch {
      workerFailed = true;
    }
  }
  return Promise.resolve(orderOf(keys, kind, dir, locale));
}

/**
 * `items` in `sort`'s order. `deps` are what the option's key reads besides the
 * item (a count worked out later, say), so the list re-sorts when they change.
 */
export function useSorted<T>(items: readonly T[], sort: Sort<T>, deps: readonly unknown[] = []): readonly T[] {
  const language = useLang();
  const { option, dir } = sort;
  const big = items.length > OFF_PAGE && option.key !== null;
  const here = useMemo(
    () => (big ? null : sortList(items, option.key, option.kind ?? 'text', dir, language)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [big, items, option.id, dir, language, ...deps],
  );
  const [away, setAway] = useState<{ items: readonly T[]; out: readonly T[] } | null>(null);
  useEffect(() => {
    if (!big || !option.key) return;
    let live = true;
    const key = option.key;
    const keys = items.map(key);
    void orderOffPage(keys, option.kind ?? 'text', dir, lang()).then((order) => {
      if (!live) return;
      const out = new Array<T>(order.length);
      for (let i = 0; i < order.length; i++) out[i] = items[order[i]];
      setAway({ items, out });
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [big, items, option.id, dir, language, ...deps]);
  if (here) return here;
  // Until the worker answers: the last order of these items, else as they are.
  return away && away.items === items ? away.out : items;
}

/**
 * When each item of a list was last used (picked, opened), for a "recently
 * used" option. Kept in this browser, the newest 200 per list.
 */
export function useRecent(list: string): { at: (id: string) => number | null; touch: (id: string) => void } {
  const [map, setMap] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + list + '.recent');
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });
  const at = useCallback((id: string) => map[id] ?? null, [map]);
  const touch = useCallback(
    (id: string) => {
      setMap((m) => {
        const next = Object.fromEntries(
          Object.entries({ ...m, [id]: Date.now() })
            .sort((a, b) => b[1] - a[1])
            .slice(0, 200),
        );
        try {
          localStorage.setItem(PREFIX + list + '.recent', JSON.stringify(next));
        } catch {
          /* no storage */
        }
        return next;
      });
    },
    [list],
  );
  return { at, touch };
}
