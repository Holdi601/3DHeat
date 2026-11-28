/**
 * Shared documents: the collections of a session that are edited as
 * operation logs, in the tactics board's style (`tactics/ops.ts`) - every
 * edit a batch of `add` / `set` / `del` operations by id, a peer's batch
 * applied with `applyRemote`, the same field set by two people the later
 * one's.
 *
 * A document registers itself under its key (the `doc` of the session
 * protocol's `Batch`: "tactics", "notes", "signs", ...) with its collections
 * and how to get and set its state; the session file and the multiplayer
 * sync go through the registry, so a new collection needs no change to
 * either. The shape is the session layer's (`session/shared.ts`, Stage 2b):
 * until that lands this module is the registry, and then it hands over to it.
 */

type Fields = Record<string, unknown>;

export type DocOp =
  | { op: 'add'; coll: string; id: string; value: Fields; index?: number }
  | { op: 'set'; coll: string; id: string; fields: Fields; unset?: string[] }
  | { op: 'del'; coll: string; id: string };

export interface DocBatch {
  /** The document's key. */
  doc: string;
  /** Unique across sessions; a batch applied twice is applied once. */
  id: string;
  author: string;
  /** Milliseconds since 1970. */
  at: number;
  ops: DocOp[];
}

export interface SharedDoc {
  /** Its name on the wire and in a session file: `[a-z0-9_-]`, at most 32. */
  key: string;
  /** Its collections of entities with an `id`. */
  colls: readonly string[];
  /** The document as the viewer has it now (an immutable object: a new one per edit). */
  get(): object;
  /** Replaces it with a state from elsewhere: not an edit of this viewer's. */
  set(state: object): void;
  /** An empty document. */
  empty(): object;
  /** Whether a state has anything worth keeping. */
  hasContent?(state: object): boolean;
  /**
   * Text fields that several people may type in at once, by collection: an
   * edit of one merges with the others' instead of replacing them
   * (`session/textMerge.ts`). An entity with `private: true` is never shared
   * in a session (any document): it stays with the viewer who made it.
   */
  text?: Readonly<Record<string, readonly string[]>>;
  /** Which entities are private, when that is not each one's own `private` (a private dashboard's pages and tiles). */
  privacy?: (state: object) => (coll: string, e: Record<string, unknown>) => boolean;
}

const docs = new Map<string, SharedDoc>();

/** Adds a document (once per key; again replaces it). */
export function registerSharedDoc(d: SharedDoc): void {
  docs.set(d.key, d);
}

export function sharedDoc(key: string): SharedDoc | undefined {
  return docs.get(key);
}

export function sharedDocs(): SharedDoc[] {
  return [...docs.values()];
}

const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

/** The operations that turn one list of entities (with `id`) into another. */
export function diffCollection(coll: string, a: readonly Fields[], b: readonly Fields[]): DocOp[] {
  if (a === b) return [];
  const ops: DocOp[] = [];
  const before = new Map(a.map((x) => [String(x.id), x]));
  const after = new Set(b.map((y) => String(y.id)));
  for (const x of a) if (!after.has(String(x.id))) ops.push({ op: 'del', coll, id: String(x.id) });
  b.forEach((y, index) => {
    const id = String(y.id);
    const x = before.get(id);
    if (!x) {
      ops.push({ op: 'add', coll, id, value: y, index });
      return;
    }
    if (x === y) return;
    const fields: Fields = {};
    const unset: string[] = [];
    for (const k of Object.keys(y)) if (!(k in x) || !same(x[k], y[k])) fields[k] = y[k];
    for (const k of Object.keys(x)) if (!(k in y)) unset.push(k);
    if (Object.keys(fields).length || unset.length) ops.push({ op: 'set', coll, id, fields, ...(unset.length ? { unset } : {}) });
  });
  return ops;
}

/**
 * A list with a collection's operations applied: a new array, untouched
 * entities shared. An operation on an entity that is not there does nothing;
 * an add of one that is there replaces it.
 */
export function applyCollectionOps<T extends { id: string }>(list: readonly T[], coll: string, ops: readonly DocOp[]): T[] {
  const xs = [...list];
  for (const o of ops) {
    if (o.coll !== coll) continue;
    const i = xs.findIndex((x) => x.id === o.id);
    if (o.op === 'add') {
      const v = structuredClone(o.value) as unknown as T;
      if (i >= 0) xs[i] = v;
      else xs.splice(Math.max(0, Math.min(xs.length, o.index ?? xs.length)), 0, v);
    } else if (o.op === 'del') {
      if (i >= 0) xs.splice(i, 1);
    } else if (i >= 0) {
      const v = { ...xs[i], ...(structuredClone(o.fields) as Partial<T>) } as T;
      for (const k of o.unset ?? []) delete (v as Record<string, unknown>)[k];
      xs[i] = v;
    }
  }
  return xs;
}

/** Whether a value is a batch for a document (from a file or a peer). */
export function isDocBatch(v: unknown, doc?: string): v is DocBatch {
  const b = v as Partial<DocBatch>;
  return (
    !!b &&
    typeof b.id === 'string' &&
    typeof b.doc === 'string' &&
    (doc === undefined || b.doc === doc) &&
    Array.isArray(b.ops) &&
    b.ops.every((o) => !!o && typeof o === 'object' && typeof o.coll === 'string' && typeof o.id === 'string' && (o.op === 'add' || o.op === 'set' || o.op === 'del'))
  );
}

export function newBatchId(): string {
  return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
