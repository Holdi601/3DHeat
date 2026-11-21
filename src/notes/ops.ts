/**
 * Notes and analysis documents as an operation log, in the tactics board's
 * form (`tactics/ops.ts`): every change is a batch of operations on the
 * book's collections by id - add an entity, set some of its fields, delete
 * it - signed with who made it and when. A shared session sends batches, not
 * books: two people editing different notes never overwrite each other, and
 * one field set by two is the later one's (last writer wins per field).
 *
 * The store makes a batch from every edit by comparing the book before and
 * after (`diffBooks`); a batch from a peer or a session file goes in with
 * `applyBookOps`.
 */

import type { NotesBook } from './model';

export const NOTE_COLLECTIONS = ['notes', 'docs'] as const;
export type NoteCollection = (typeof NOTE_COLLECTIONS)[number];

type Fields = Record<string, unknown>;

export type NoteOp =
  /** A new entity, at `index` in its collection (the end when absent or past it). */
  | { op: 'add'; coll: NoteCollection; id: string; value: Fields; index?: number }
  /** Fields of an entity changed; `unset` ones removed. */
  | { op: 'set'; coll: NoteCollection; id: string; fields: Fields; unset?: string[] }
  | { op: 'del'; coll: NoteCollection; id: string };

/** One edit: its operations, who made it and when; `id` is unique across sessions. */
export interface NoteBatch {
  id: string;
  author: string;
  /** Milliseconds since 1970. */
  at: number;
  ops: NoteOp[];
}

const isColl = new Set<string>(NOTE_COLLECTIONS);

const same = (a: unknown, b: unknown) => a === b || JSON.stringify(a) === JSON.stringify(b);

function fieldDiff(a: Fields, b: Fields): { fields: Fields; unset: string[] } | null {
  const fields: Fields = {};
  const unset: string[] = [];
  for (const k of Object.keys(b)) if (!(k in a) || !same(a[k], b[k])) fields[k] = b[k];
  for (const k of Object.keys(a)) if (!(k in b)) unset.push(k);
  return Object.keys(fields).length || unset.length ? { fields, unset } : null;
}

/** The operations that turn `a` into `b`. */
export function diffBooks(a: NotesBook, b: NotesBook): NoteOp[] {
  const ops: NoteOp[] = [];
  for (const coll of NOTE_COLLECTIONS) {
    const xs = (a[coll] ?? []) as unknown as Fields[];
    const ys = (b[coll] ?? []) as unknown as Fields[];
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
 * A book with operations applied: a new book, its untouched collections and
 * entities shared with the old. An operation on an entity that is not there
 * (deleted by someone else meanwhile) does nothing; an add of one that is
 * there replaces it. The `id` field is never changed by a set.
 */
export function applyBookOps(book: NotesBook, ops: readonly NoteOp[]): NotesBook {
  const out = { ...book } as unknown as Record<NoteCollection, Fields[]>;
  const copied = new Set<string>();
  const coll = (c: NoteCollection): Fields[] => {
    if (!copied.has(c)) {
      out[c] = [...(out[c] ?? [])];
      copied.add(c);
    }
    return out[c];
  };
  for (const o of ops) {
    if (!isColl.has(o.coll)) continue;
    const xs = coll(o.coll);
    const i = xs.findIndex((x) => x.id === o.id);
    if (o.op === 'add') {
      const v = { ...structuredClone(o.value), id: o.id };
      if (i >= 0) xs[i] = v;
      else xs.splice(Math.max(0, Math.min(xs.length, o.index ?? xs.length)), 0, v);
    } else if (o.op === 'del') {
      if (i >= 0) xs.splice(i, 1);
    } else if (i >= 0) {
      const v: Fields = { ...xs[i], ...structuredClone(o.fields), id: o.id };
      for (const k of o.unset ?? []) if (k !== 'id') delete v[k];
      xs[i] = v;
    }
  }
  return out as unknown as NotesBook;
}

/** Whether a value is a batch this viewer can apply (from a file or a peer). */
export function isNoteBatch(v: unknown): v is NoteBatch {
  const b = v as Partial<NoteBatch>;
  return (
    !!b &&
    typeof b.id === 'string' &&
    typeof b.at === 'number' &&
    Array.isArray(b.ops) &&
    b.ops.every(
      (o) =>
        !!o &&
        typeof o === 'object' &&
        isColl.has((o as { coll?: string }).coll ?? '') &&
        typeof (o as { id?: unknown }).id === 'string' &&
        (o.op === 'del' || (o.op === 'add' && typeof o.value === 'object' && !!o.value) || (o.op === 'set' && typeof o.fields === 'object' && !!o.fields)),
    )
  );
}
