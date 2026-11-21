import type { Dataset } from '../state/types';

/**
 * What a loaded dataset holds in memory, column by column.
 *
 * Counted from the arrays themselves rather than from the estimate the load
 * panel made beforehand, so the memory panel shows what is resident and not
 * what was predicted. Every typed array reachable from the dataset's own fields
 * counts once (two fields sharing a buffer are one allocation); text tables
 * (category labels, names) are estimated at two bytes a character plus the
 * engine's per-string overhead, because no API reports a string's size.
 */

export interface ResidentColumn {
  /** The field or attribute name. */
  name: string;
  /** `attr` for a column kept for filtering, `core` for the dataset's own fields. */
  kind: 'core' | 'attr';
  bytes: number;
}

/** Bytes a JavaScript string costs, roughly: two a character and a header. */
export function stringBytes(s: string): number {
  return 24 + s.length * 2;
}

function labelsBytes(list: readonly string[] | undefined): number {
  if (!list) return 0;
  let b = 8 * list.length;
  for (const s of list) b += stringBytes(s);
  return b;
}

/** Every column the dataset holds, biggest first. */
export function residentColumns(ds: Dataset): ResidentColumn[] {
  const seen = new Set<ArrayBufferLike>();
  const out: ResidentColumn[] = [];
  const add = (name: string, kind: ResidentColumn['kind'], v: unknown, extra = 0) => {
    let bytes = extra;
    if (ArrayBuffer.isView(v) && !seen.has(v.buffer)) {
      seen.add(v.buffer);
      bytes += v.byteLength;
    }
    if (bytes > 0) out.push({ name, kind, bytes });
  };
  for (const [key, value] of Object.entries(ds as unknown as Record<string, unknown>)) {
    if (key === 'attrs') continue;
    if (ArrayBuffer.isView(value)) add(key, 'core', value);
    else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && /Labels$/.test(key)) {
      add(key, 'core', null, labelsBytes(value as string[]));
    }
  }
  for (const a of ds.attrs ?? []) add(a.name, 'attr', a.data, labelsBytes(a.categories));
  return out.sort((a, b) => b.bytes - a.bytes);
}

/** All of it, in bytes. */
export function residentBytes(ds: Dataset): number {
  return residentColumns(ds).reduce((a, c) => a + c.bytes, 0);
}
