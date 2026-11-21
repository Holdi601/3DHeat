/**
 * The shared layers: documents every member of a session sees the same -
 * the tactics board, the marks, the notes, whatever registers itself here.
 * A document is named collections of entities with an `id` plus its own
 * fields, changed by operations (`tactics/ops.ts`: add, set fields, delete,
 * the document's own fields); the last writer wins per field.
 *
 * In a session the host sequences every batch of operations, and each
 * viewer keeps two states per document: the confirmed one (every batch the
 * host numbered, in its order) and its own, the confirmed one with its own
 * batches not yet confirmed on top. A batch from someone else lands on the
 * confirmed state and the viewer's own are put back on top, so everyone ends
 * at the same state, and a batch the host refused simply falls away.
 *
 * Edits are gathered for a tenth of a second and sent as the difference
 * since the last send, so dragging a figure sends ten small batches a
 * second, not one per mouse move.
 *
 * Outside a session the documents are just the viewer's own state; the
 * session file (`sessionFile.ts`) reads and writes them through the same
 * registry.
 */

import { applyDocOps, diffDocs, type DocOp } from '../tactics/ops';
import { registerSharedDoc as registerInApp, sharedDoc as appDoc, sharedDocs as appDocs, type SharedDoc as AppSharedDoc } from '../state/sharedDocs';

type Fields = Record<string, unknown>;

/** A document as it travels and is saved: its own fields, and its collections. */
export interface DocState {
  meta: Fields;
  colls: Record<string, Fields[]>;
}

/**
 * A shared document (`state/sharedDocs.ts` is where the viewer's modules
 * register theirs: the tactics board, marks, notes, chart signs, ...).
 */
export type SharedDoc = AppSharedDoc;

/** The documents a viewer shares; one per viewer (tests make several). */
export class DocRegistry {
  private docs = new Map<string, SharedDoc>();
  private listeners = new Set<() => void>();

  /** Adds a document (once per key; again replaces it). */
  register(d: SharedDoc): void {
    this.docs.set(d.key, d);
    for (const l of this.listeners) l();
  }

  all(): SharedDoc[] {
    return [...this.docs.values()];
  }

  get(key: string): SharedDoc | undefined {
    return this.docs.get(key);
  }

  /** Calls back when a document registers (a module loaded late joins a session already running). */
  onChange(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

/** The viewer's own registry (`state/sharedDocs.ts`), seen through the same interface. */
class AppRegistry extends DocRegistry {
  register(d: SharedDoc): void {
    registerInApp(d);
  }
  all(): SharedDoc[] {
    return appDocs();
  }
  get(key: string): SharedDoc | undefined {
    return appDoc(key);
  }
}

export const registry: DocRegistry = new AppRegistry();

/** Adds a document to the shared layers (once per key; again replaces it). */
export function registerSharedDoc(d: SharedDoc): void {
  registry.register(d);
}

export function sharedDocs(): SharedDoc[] {
  return registry.all();
}

export function sharedDoc(key: string): SharedDoc | undefined {
  return registry.get(key);
}

/** A document's state as it travels. */
export function toDocState(state: object, colls: readonly string[]): DocState {
  const meta: Fields = {};
  const out: Record<string, Fields[]> = {};
  const isColl = new Set(colls);
  for (const [k, v] of Object.entries(state)) {
    if (isColl.has(k)) out[k] = (Array.isArray(v) ? v : []) as Fields[];
    else if (v !== undefined) meta[k] = v;
  }
  for (const c of colls) out[c] ??= [];
  return { meta, colls: out };
}

/** The viewer's state of a document from how it travels. */
export function fromDocState(ds: DocState, d: SharedDoc): object {
  const out: Fields = { ...(d.empty() as Fields), ...(ds.meta ?? {}) };
  // A collection the state does not name keeps the empty document's (a board's base layer).
  for (const c of d.colls) out[c] = Array.isArray(ds.colls?.[c]) ? ds.colls[c] : ((out[c] as Fields[] | undefined) ?? []);
  return out;
}

/** A document's state checked as it arrives: an object of an object and arrays of entities with ids. */
export function readDocState(v: unknown): DocState | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as { meta?: unknown; colls?: unknown };
  const meta = o.meta && typeof o.meta === 'object' && !Array.isArray(o.meta) ? (o.meta as Fields) : {};
  const colls: Record<string, Fields[]> = {};
  if (o.colls && typeof o.colls === 'object') {
    for (const [k, xs] of Object.entries(o.colls as Record<string, unknown>)) {
      if (!Array.isArray(xs)) return null;
      colls[k] = xs.filter((x): x is Fields => !!x && typeof x === 'object' && typeof (x as Fields).id === 'string');
    }
  }
  return { meta, colls };
}

// ---------------------------------------------------------------- the sync

export interface OutBatch {
  doc: string;
  id: string;
  ops: DocOp[];
}

/** A batch's operations, at most per message. */
const MAX_OPS = 400;
/** A batch's JSON, at most per message (the server takes 64 KiB a message). */
const MAX_BYTES = 40_000;

let nextBatch = 0;
const batchId = () => `b${Date.now().toString(36)}${(nextBatch = (nextBatch + 1) % 1e6).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Operations cut into batches that each fit one message; an operation too big alone is left out (returned). */
export function chunkOps(ops: DocOp[]): { chunks: DocOp[][]; tooBig: DocOp[] } {
  const chunks: DocOp[][] = [];
  const tooBig: DocOp[] = [];
  let cur: DocOp[] = [];
  let bytes = 0;
  for (const o of ops) {
    const n = JSON.stringify(o).length;
    if (n > MAX_BYTES) {
      tooBig.push(o);
      continue;
    }
    if (cur.length && (cur.length >= MAX_OPS || bytes + n > MAX_BYTES)) {
      chunks.push(cur);
      cur = [];
      bytes = 0;
    }
    cur.push(o);
    bytes += n;
  }
  if (cur.length) chunks.push(cur);
  return { chunks, tooBig };
}

interface DocSync {
  doc: SharedDoc | null;
  key: string;
  /** Every batch the host numbered, applied in its order; for a document no module here knows, its raw state. */
  confirmed: object;
  raw: DocState | null;
  /** This viewer's batches sent and not yet numbered, oldest first. */
  pending: OutBatch[];
  /** The viewer's state as of the last send or rebase: edits since are the next batch. */
  base: object;
}

/**
 * The shared layers of one session. Built when the viewer joins, dropped
 * when it leaves; `send` hands a batch to the connection.
 */
export class SharedSync {
  private byKey = new Map<string, DocSync>();
  /** Each document's own state from before the session, put back when the viewer leaves (not the host's). */
  private backup = new Map<string, object>();
  private unsub: () => void;
  private started = false;
  private host = false;

  constructor(
    private send: (b: OutBatch) => void,
    private onTooBig: (n: number) => void = () => {},
    private reg: DocRegistry = registry,
  ) {
    this.unsub = reg.onChange(() => this.adopt());
  }

  private adopt(): void {
    for (const d of this.reg.all()) {
      const s = this.byKey.get(d.key);
      if (!s) {
        if (this.started) this.attachNew(d);
      } else if (!s.doc) {
        // A module that registered after the snapshot: its document from the raw state.
        s.doc = d;
        if (!this.backup.has(d.key)) this.backup.set(d.key, d.get());
        s.confirmed = s.raw ? fromDocState(s.raw, d) : d.empty();
        s.raw = null;
        this.rebase(s);
      }
    }
  }

  /**
   * The whole state from the host (joining, or the host opened a session
   * file). As the host, a document the server lacks is seeded from this
   * viewer's own: everything in it goes out as the first batches.
   */
  snapshot(states: Record<string, DocState>, asHost: boolean): void {
    this.host = asHost;
    for (const s of this.byKey.values()) this.flush(s);
    const keys = new Set([...Object.keys(states), ...this.reg.all().map((d) => d.key)]);
    for (const key of keys) {
      const d = this.reg.get(key) ?? null;
      const st = states[key];
      let s = this.byKey.get(key);
      if (!s) {
        s = { doc: d, key, confirmed: {}, raw: null, pending: [], base: {} };
        this.byKey.set(key, s);
        if (d && !asHost && !this.started) this.backup.set(key, d.get());
      }
      if (!d) {
        s.raw = st ?? null;
        continue;
      }
      const empty = !st || Object.values(st.colls ?? {}).every((xs) => !xs.length) && !Object.keys(st.meta ?? {}).length;
      if (asHost && empty) {
        // The server has nothing: what this viewer has goes out, all of it
        // (from nothing, so every field is in it), onto an empty document here.
        s.confirmed = d.empty();
        s.base = {};
        continue;
      }
      s.confirmed = fromDocState(st ?? { meta: {}, colls: {} }, d);
      this.rebase(s);
    }
    this.started = true;
  }

  /** A batch the host numbered. */
  remote(doc: string, id: string, ops: DocOp[]): void {
    let s = this.byKey.get(doc);
    if (!s) {
      const d = this.reg.get(doc) ?? null;
      s = { doc: d, key: doc, confirmed: d ? d.empty() : {}, raw: d ? null : { meta: {}, colls: {} }, pending: [], base: d ? d.get() : {} };
      this.byKey.set(doc, s);
    }
    if (!s.doc) {
      // Kept raw for the session file; applied as plain data.
      const st = s.raw ?? { meta: {}, colls: {} };
      const colls = new Set<string>(Object.keys(st.colls));
      for (const o of ops) if (o.op !== 'meta') colls.add(o.coll);
      const obj = applyDocOps({ ...st.meta, ...st.colls } as object, ops, [...colls]);
      s.raw = toDocState(obj, [...colls]);
      return;
    }
    this.flush(s);
    s.confirmed = applyDocOps(s.confirmed, ops, s.doc.colls);
    const i = s.pending.findIndex((b) => b.id === id);
    if (i >= 0) {
      const [mine] = s.pending.splice(i, 1);
      // Ours, whole (the host dropped none of it), and nothing of anyone else's came between: the viewer has this already.
      if (i === 0 && mine.ops.length === ops.length) return;
    }
    this.rebase(s);
  }

  /** The host refused a batch of ours: it falls away. */
  refused(id: string): void {
    for (const s of this.byKey.values()) {
      const i = s.pending.findIndex((b) => b.id === id);
      if (i < 0) continue;
      this.flush(s);
      s.pending.splice(i, 1);
      this.rebase(s);
    }
  }

  /** The batches not yet numbered, to send again after a reconnect (the host applies each once). */
  unconfirmed(): OutBatch[] {
    return [...this.byKey.values()].flatMap((s) => s.pending);
  }

  pendingCount(): number {
    let n = 0;
    for (const s of this.byKey.values()) n += s.pending.length;
    return n;
  }

  /** Sends what was edited since the last send, for every document. Called ten times a second. */
  tick(): void {
    if (!this.started) return;
    for (const d of this.reg.all()) if (!this.byKey.has(d.key)) this.attachNew(d);
    if ([...this.byKey.values()].some((s) => !s.doc && this.reg.get(s.key))) this.adopt();
    for (const s of this.byKey.values()) this.flush(s);
  }

  /**
   * A document the session has not seen: the host's goes out whole (the
   * first batches seed it); a member's own is kept aside and the member
   * starts from the session's, empty.
   */
  private attachNew(d: SharedDoc): void {
    const s: DocSync = { doc: d, key: d.key, confirmed: d.empty(), raw: null, pending: [], base: this.host ? {} : d.empty() };
    this.byKey.set(d.key, s);
    if (this.host) return;
    this.backup.set(d.key, d.get());
    this.rebase(s);
  }

  private flush(s: DocSync): void {
    if (!s.doc) return;
    const cur = s.doc.get();
    if (cur === s.base) return;
    const ops = diffDocs(s.base, cur, s.doc.colls);
    s.base = cur;
    if (!ops.length) return;
    const { chunks, tooBig } = chunkOps(ops);
    if (tooBig.length) this.onTooBig(tooBig.length);
    for (const c of chunks) {
      const b: OutBatch = { doc: s.key, id: batchId(), ops: c };
      s.pending.push(b);
      this.send(b);
    }
  }

  private rebase(s: DocSync): void {
    if (!s.doc) return;
    let local = s.confirmed;
    for (const b of s.pending) local = applyDocOps(local, b.ops, s.doc.colls);
    // Every collection there, even one nobody has added to yet.
    const missing = s.doc.colls.filter((c) => !Array.isArray((local as Record<string, unknown>)[c]));
    if (missing.length) local = { ...local, ...Object.fromEntries(missing.map((c) => [c, []])) };
    s.base = local;
    s.doc.set(local);
  }

  /** Every document as it travels: for the session file, with those no module here knows. */
  states(): Record<string, DocState> {
    const out: Record<string, DocState> = {};
    for (const s of this.byKey.values()) {
      if (s.doc) out[s.key] = toDocState(s.doc.get(), s.doc.colls);
      else if (s.raw) out[s.key] = s.raw;
    }
    return out;
  }

  /** The session ended for this viewer: its own documents back (not for the host, whose they are). */
  close(restore: boolean): void {
    this.unsub();
    if (restore) for (const [key, state] of this.backup) this.reg.get(key)?.set(state);
    this.byKey.clear();
    this.backup.clear();
  }
}

/** Every registered document's state now (outside a session: the viewer's own). */
export function localStates(): Record<string, DocState> {
  const out: Record<string, DocState> = {};
  for (const d of sharedDocs()) out[d.key] = toDocState(d.get(), d.colls);
  return out;
}

/** Puts saved states into the registered documents; returns the keys no module here knows. */
export function loadLocalStates(states: Record<string, DocState>): string[] {
  const unknown: string[] = [];
  for (const [key, st] of Object.entries(states)) {
    const d = sharedDoc(key);
    if (!d) {
      unknown.push(key);
      continue;
    }
    d.set(fromDocState(st, d));
  }
  return unknown;
}
