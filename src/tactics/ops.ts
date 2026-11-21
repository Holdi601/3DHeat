/**
 * The tactics board as an operation log: every change to a plan is a batch
 * of operations on its collections by id - add an entity, set some of its
 * fields, delete it - or a change to the plan's own fields (`meta`). A batch
 * applied to the plan it was made from gives the plan it was made to, so a
 * later shared session sends batches, not plans: two people editing
 * different figures never overwrite each other, and the same field set by
 * two is the later one's (last writer wins per field).
 *
 * The store makes a batch from every edit by comparing the plans before and
 * after (`diffPlans`), so code that edits a plan does not have to speak in
 * operations; a remote batch is applied with `applyOps`.
 */

import type { Plan } from './plan';

/** The plan's collections of entities with an `id`. */
export const COLLECTIONS = ['layers', 'figures', 'arrows', 'areas', 'notes', 'drawings'] as const;
export type Collection = (typeof COLLECTIONS)[number];

type Fields = Record<string, unknown>;

export type PlanOp =
  /** A new entity, at `index` in its collection (the end when absent or past it). */
  | { op: 'add'; coll: Collection; id: string; value: Fields; index?: number }
  /** Fields of an entity changed; `unset` ones removed. */
  | { op: 'set'; coll: Collection; id: string; fields: Fields; unset?: string[] }
  | { op: 'del'; coll: Collection; id: string }
  /** Fields of the plan itself (title, game, sides, steps, sizes). */
  | { op: 'meta'; fields: Fields; unset?: string[] };

/** One edit: its operations, who made it and when; `id` is unique across sessions. */
export interface OpBatch {
  id: string;
  author: string;
  /** Milliseconds since 1970. */
  at: number;
  ops: PlanOp[];
}

const isColl = new Set<string>(COLLECTIONS);

const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

/** What changed between two versions of an entity (or the plan's own fields): set and unset fields. */
function fieldDiff(a: Fields, b: Fields, skip?: Set<string>): { fields: Fields; unset: string[] } | null {
  const fields: Fields = {};
  const unset: string[] = [];
  for (const k of Object.keys(b)) {
    if (skip?.has(k)) continue;
    if (!(k in a) || !same(a[k], b[k])) fields[k] = b[k];
  }
  for (const k of Object.keys(a)) if (!skip?.has(k) && !(k in b)) unset.push(k);
  return Object.keys(fields).length || unset.length ? { fields, unset } : null;
}

/** The operations that turn `a` into `b`. */
export function diffPlans(a: Plan, b: Plan): PlanOp[] {
  const ops: PlanOp[] = [];
  const meta = fieldDiff(a as unknown as Fields, b as unknown as Fields, isColl);
  if (meta) ops.push({ op: 'meta', fields: meta.fields, ...(meta.unset.length ? { unset: meta.unset } : {}) });
  for (const coll of COLLECTIONS) {
    const xs = ((a as unknown as Record<string, Fields[]>)[coll] ?? []) as Fields[];
    const ys = ((b as unknown as Record<string, Fields[]>)[coll] ?? []) as Fields[];
    if (xs === ys) continue;
    const before = new Map(xs.map((x) => [String(x.id), x]));
    const after = new Set(ys.map((y) => String(y.id)));
    for (const x of xs) if (!after.has(String(x.id))) ops.push({ op: 'del', coll, id: String(x.id) });
    ys.forEach((y, index) => {
      const id = String(y.id);
      const x = before.get(id);
      if (!x) {
        ops.push({ op: 'add', coll, id, value: y, index });
        return;
      }
      if (x === y) return;
      const d = fieldDiff(x, y);
      if (d) ops.push({ op: 'set', coll, id, fields: d.fields, ...(d.unset.length ? { unset: d.unset } : {}) });
    });
  }
  return ops;
}

/**
 * A plan with operations applied: a new plan object, its untouched
 * collections and entities shared with the old. An operation on an entity
 * that is not there (deleted by someone else meanwhile) does nothing; an add
 * of one that is there replaces it.
 */
export function applyOps(plan: Plan, ops: PlanOp[]): Plan {
  const out = { ...plan } as unknown as Record<string, unknown>;
  const copied = new Set<string>();
  const coll = (c: Collection): Fields[] => {
    if (!copied.has(c)) {
      out[c] = [...((out[c] as Fields[] | undefined) ?? [])];
      copied.add(c);
    }
    return out[c] as Fields[];
  };
  for (const o of ops) {
    if (o.op === 'meta') {
      for (const [k, v] of Object.entries(o.fields)) if (!isColl.has(k)) out[k] = structuredClone(v);
      for (const k of o.unset ?? []) if (!isColl.has(k)) delete out[k];
      continue;
    }
    if (!isColl.has(o.coll)) continue;
    const xs = coll(o.coll);
    const i = xs.findIndex((x) => x.id === o.id);
    if (o.op === 'add') {
      const v = structuredClone(o.value);
      if (i >= 0) xs[i] = v;
      else xs.splice(Math.max(0, Math.min(xs.length, o.index ?? xs.length)), 0, v);
    } else if (o.op === 'del') {
      if (i >= 0) xs.splice(i, 1);
    } else if (i >= 0) {
      const v = { ...xs[i], ...structuredClone(o.fields) };
      for (const k of o.unset ?? []) delete v[k];
      xs[i] = v;
    }
  }
  return out as unknown as Plan;
}

/** Whether a value is a batch this viewer can apply (from a file or a peer). */
export function isOpBatch(v: unknown): v is OpBatch {
  const b = v as Partial<OpBatch>;
  return (
    !!b &&
    typeof b.id === 'string' &&
    Array.isArray(b.ops) &&
    b.ops.every((o) => !!o && typeof o === 'object' && (o.op === 'meta' ? typeof o.fields === 'object' : isColl.has((o as { coll?: string }).coll ?? '') && typeof (o as { id?: unknown }).id === 'string'))
  );
}
