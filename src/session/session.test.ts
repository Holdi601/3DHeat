import { describe, expect, it, vi } from 'vitest';
import { applyDocOps, type DocOp } from '../tactics/ops';
import { chunkOps, DocRegistry, registerSharedDoc, SharedSync, toDocState, type DocState, type OutBatch, type SharedDoc } from './shared';
import { captureSession, openSession, readSessionBlob, readSessionJson, sessionBlob, SESSION_SCHEMA } from './sessionFile';
import { fingerprint, loadedData, matchDataFiles, noteDataFiles, type DataRef } from './dataRefs';
import { sameLevel } from './levelRequest';
import { restoreSession, useSessionOpen } from './sessionOpen';
import { registerBuiltInDocs } from './docs';
import { useNotes } from '../notes/store';
import { EMPTY_BOOK } from '../notes/model';

type Pins = { title?: string; pins: { id: string; x?: number; label?: string }[] };

/** A viewer: its own document and the sync that shares it. */
function viewer(start: Pins, send: (b: OutBatch) => void) {
  let state: object = start;
  const reg = new DocRegistry();
  const doc: SharedDoc = { key: 'marks', colls: ['pins'], get: () => state, set: (s) => (state = s), empty: () => ({ pins: [] }) };
  reg.register(doc);
  const sync = new SharedSync(send, () => {}, reg);
  return {
    get: () => state as Pins,
    edit: (f: (s: Pins) => Pins) => (state = f(state as Pins)),
    sync,
  };
}

/** A session server in miniature: numbers batches, keeps the state, can refuse. */
function server() {
  let seq = 0;
  let state: object = {};
  const inbox: { from: number; b: OutBatch }[] = [];
  return {
    inbox,
    /** Numbers what is waiting, in arrival order; returns what everyone is sent. */
    run(refuse: (from: number, b: OutBatch) => boolean = () => false) {
      const out: { seq: number; b: OutBatch; from: number; refused: boolean }[] = [];
      for (const x of inbox.splice(0)) {
        if (refuse(x.from, x.b)) {
          out.push({ seq: 0, b: x.b, from: x.from, refused: true });
          continue;
        }
        state = applyDocOps(state, x.b.ops, ['pins']);
        out.push({ seq: ++seq, b: x.b, from: x.from, refused: false });
      }
      return out;
    },
    state: () => state,
  };
}

describe('the shared layers', () => {
  it('converge when two members set the same field at once: the later in the host order wins', () => {
    const srv = server();
    const host = viewer({ title: 'Plan', pins: [{ id: 'p', x: 0, label: 'a' }] }, (b) => srv.inbox.push({ from: 0, b }));
    const bob = viewer({ pins: [{ id: 'mine', x: 9 }] }, (b) => srv.inbox.push({ from: 1, b }));
    // The host seeds an empty server with its own document.
    host.sync.snapshot({}, true);
    host.sync.tick();
    for (const x of srv.run()) host.sync.remote('marks', x.b.id, x.b.ops);
    // Bob joins: the session's state replaces his own.
    bob.sync.snapshot({ marks: toDocState(srv.state(), ['pins']) }, false);
    expect(bob.get().pins.map((p) => p.id)).toEqual(['p']);
    expect(bob.get().title).toBe('Plan');
    // Both change x before either hears of the other.
    host.edit((s) => ({ ...s, pins: s.pins.map((p) => ({ ...p, x: 1 })) }));
    bob.edit((s) => ({ ...s, pins: s.pins.map((p) => ({ ...p, x: 2, label: 'b' })) }));
    host.sync.tick();
    bob.sync.tick();
    const sent = srv.run();
    for (const v of [host, bob]) for (const x of sent) v.sync.remote('marks', x.b.id, x.b.ops);
    expect(host.get()).toEqual(bob.get());
    expect(host.get().pins[0]).toMatchObject({ x: 2, label: 'b' });
    expect(srv.state()).toEqual(host.get());
    // Bob leaves: his own document comes back.
    bob.sync.close(true);
    expect(bob.get().pins.map((p) => p.id)).toEqual(['mine']);
  });

  it('a batch the host refused falls away, the rest stays', () => {
    const srv = server();
    const a = viewer({ pins: [] }, (b) => srv.inbox.push({ from: 0, b }));
    a.sync.snapshot({}, true);
    a.edit((s) => ({ ...s, pins: [{ id: 'ok', x: 1 }] }));
    a.sync.tick();
    a.edit((s) => ({ ...s, pins: [...s.pins, { id: 'no', x: 2 }] }));
    a.sync.tick();
    let n = 0;
    for (const x of srv.run(() => n++ === 1)) {
      if (x.refused) a.sync.refused(x.b.id);
      else a.sync.remote('marks', x.b.id, x.b.ops);
    }
    expect(a.get().pins.map((p) => p.id)).toEqual(['ok']);
    expect(a.sync.pendingCount()).toBe(0);
  });

  it('edits made while others’ arrive are kept and sent', () => {
    const srv = server();
    const a = viewer({ pins: [] }, (b) => srv.inbox.push({ from: 0, b }));
    const b = viewer({ pins: [] }, (x) => srv.inbox.push({ from: 1, b: x }));
    a.sync.snapshot({}, true);
    b.sync.snapshot({}, false);
    a.edit((s) => ({ ...s, pins: [{ id: 'a1' }] }));
    a.sync.tick();
    const first = srv.run();
    // b edits, and before its tick a's batch arrives.
    b.edit((s) => ({ ...s, pins: [...s.pins, { id: 'b1' }] }));
    for (const x of first) b.sync.remote('marks', x.b.id, x.b.ops);
    expect(b.get().pins.map((p) => p.id).sort()).toEqual(['a1', 'b1']);
    for (const x of first) a.sync.remote('marks', x.b.id, x.b.ops);
    b.sync.tick();
    for (const x of srv.run()) for (const v of [a, b]) v.sync.remote('marks', x.b.id, x.b.ops);
    expect(a.get()).toEqual(b.get());
  });

  it('keeps every collection when the host seeds a document others then change', () => {
    let state: object = { pins: [{ id: 'a' }], strokes: [] };
    const reg = new DocRegistry();
    reg.register({ key: 'marks', colls: ['pins', 'strokes'], get: () => state, set: (s) => (state = s), empty: () => ({ pins: [], strokes: [] }) });
    const sent: OutBatch[] = [];
    const sync = new SharedSync((b) => sent.push(b), () => {}, reg);
    sync.snapshot({}, true);
    sync.tick();
    // Someone else's pin arrives before the seed is confirmed.
    sync.remote('marks', 'other', [{ op: 'add', coll: 'pins', id: 'b', value: { id: 'b' } }]);
    const s = state as { pins: unknown[]; strokes: unknown[] };
    expect(s.pins).toHaveLength(2);
    expect(s.strokes).toEqual([]);
  });

  it('a batch whose numbered copy was lost in a reconnect is not laid over later states', () => {
    const a = viewer({ pins: [] }, () => {});
    a.sync.snapshot({ marks: { meta: {}, colls: { pins: [] } } }, false);
    a.edit((s) => ({ ...s, pins: [{ id: 'm1' }] }));
    a.sync.tick();
    const [sent] = a.sync.unconfirmed();
    // The server applied it, the copy never arrived; the snapshot after the reconnect has it.
    a.sync.snapshot({ marks: toDocState({ pins: [{ id: 'm1' }] }, ['pins']) }, false);
    a.sync.acked(sent.id);
    expect(a.sync.pendingCount()).toBe(0);
    // Someone erases everything: it stays erased here.
    a.sync.remote('marks', 'other', [{ op: 'del', coll: 'pins', id: 'm1' }]);
    expect(a.get().pins).toEqual([]);
  });

  it('cuts big edits into batches that fit a message', () => {
    const ops: DocOp[] = Array.from({ length: 1000 }, (_, i) => ({ op: 'add', coll: 'pins', id: `p${i}`, value: { id: `p${i}`, text: 'x'.repeat(100) } }));
    const { chunks, tooBig } = chunkOps(ops);
    expect(tooBig).toEqual([]);
    expect(chunks.flat()).toHaveLength(1000);
    for (const c of chunks) expect(JSON.stringify(c).length).toBeLessThan(48_000);
    expect(chunkOps([{ op: 'add', coll: 'pins', id: 'huge', value: { t: 'x'.repeat(60_000) } }]).tooBig).toHaveLength(1);
  });
});

describe('the session file', () => {
  let state: object = { pins: [{ id: 'n1', label: 'Bridge', x: 3 }], title: 'Night' };
  registerSharedDoc({ key: 'roundtrip', colls: ['pins'], get: () => state, set: (s) => (state = s), empty: () => ({ pins: [] }) });

  it('saves and opens to the same state', async () => {
    const file = captureSession(null, 'Test');
    const text = JSON.stringify(file);
    const before = structuredClone(state);
    state = { pins: [] };
    const back = readSessionJson(JSON.parse(text));
    expect(back.schema).toBe(SESSION_SCHEMA);
    const report = await openSession(null, back, []);
    expect(state).toEqual(before);
    expect(report.unknown).not.toContain('roundtrip');
    // Nothing secret goes in.
    expect(text).not.toMatch(/password|token|resume|bans/i);
  });

  it('keeps the notes and analyses, as a layer and with their history', async () => {
    registerBuiltInDocs();
    useNotes.getState().addDoc('Plan A', '# Push B');
    const file = readSessionJson(JSON.parse(JSON.stringify(captureSession(null))));
    expect(file.docs.notes.colls.docs).toHaveLength(1);
    expect(file.notes?.book.docs).toHaveLength(1);
    useNotes.setState({ book: EMPTY_BOOK });
    await openSession(null, file, []);
    expect(useNotes.getState().book.docs.map((d) => d.title)).toEqual(['Plan A']);
  });

  it('refuses a newer file and something else, and keeps layers no module knows', () => {
    expect(() => readSessionJson({ schema: 'heat3d.session/2' })).toThrow('newer');
    expect(() => readSessionJson({ schema: 'heat3d.views/1' })).toThrow('notSession');
    expect(() => readSessionJson(null)).toThrow('notSession');
    const f = readSessionJson({ schema: SESSION_SCHEMA, docs: { 'bad key!': {}, notes: { meta: {}, colls: { notes: [{ id: 'a' }, { noid: 1 }] } } } });
    expect(Object.keys(f.docs)).toEqual(['notes']);
    expect((f.docs.notes as DocState).colls.notes).toHaveLength(1);
  });

  it('packs the data in and gets it back out', async () => {
    const data = new File([new Uint8Array(3000).map((_, i) => i % 251)], 'match.parquet');
    noteDataFiles([data]);
    // The fingerprint is worked out in the background: waited for, not for a fixed 50 ms a busy machine can overrun.
    await vi.waitFor(() => expect(loadedData().refs).toHaveLength(1), { timeout: 10_000 });
    const blob = await sessionBlob(captureSession(null), true);
    const { file, packed } = await readSessionBlob(blob);
    expect(file.data).toHaveLength(1);
    expect(file.data[0]).toMatchObject({ name: 'match.parquet', size: 3000 });
    expect(packed).toHaveLength(1);
    expect(new Uint8Array(await packed[0].arrayBuffer())).toEqual(new Uint8Array(await data.arrayBuffer()));
    // Plain JSON has no data in it.
    const plain = await readSessionBlob(await sessionBlob(captureSession(null), false));
    expect(plain.packed).toEqual([]);
    expect(plain.file.data[0].fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('opening a session file whose data is not loaded', () => {
  const bytes = (n: number, seed: number) => new Uint8Array(n).map((_, i) => (i * 7 + seed) % 251);
  const ref = async (f: File): Promise<DataRef> => ({ name: f.name, size: f.size, fingerprint: await fingerprint(f) });

  it('finds its data in a pick by name, size and content, and nothing else', async () => {
    const a = new File([bytes(4000, 1)], 'a.parquet');
    const b = new File([bytes(5000, 2)], 'b.parquet');
    const want = [await ref(a), await ref(b)];
    // Same name and size, other content: not it. Another file: not read.
    const fake = new File([bytes(4000, 9)], 'a.parquet');
    const other = new File([bytes(10, 3)], 'notes.txt');
    const pick = [fake, other, b].map((file) => ({ file, relativePath: `folder/${file.name}` }));
    const r = await matchDataFiles(want, pick);
    expect(r.keep.map((k) => k.file)).toEqual([b]);
    expect(r.found.map((f) => f.name)).toEqual(['b.parquet']);
    expect(r.still.map((f) => f.name)).toEqual(['a.parquet']);
  });

  it('knows a level by its file name or its name', () => {
    expect(sameLevel('town.glb', { name: 'town', path: 'game/town.glb' })).toBe(true);
    expect(sameLevel('town.glb', { name: 'Town.glb' })).toBe(true);
    expect(sameLevel('town.glb', { name: 'town_snow', path: 'game/town_snow.glb' })).toBe(false);
  });

  it('keeps the view until its data is loaded, and the report follows the data', async () => {
    noteDataFiles([]);
    const data = new File([bytes(3000, 5)], 'round.parquet');
    const file = readSessionJson({
      schema: SESSION_SCHEMA,
      data: [await ref(data)],
      current: { camera: { position: { x: 1, y: 2, z: 3 } }, timeline: {}, filters: [] },
    });
    const report = await restoreSession(null, file, []);
    expect(report.missing).toHaveLength(1);
    // Not applied before the data is there: its filters would be dropped.
    expect(report.pendingView).not.toBeNull();
    expect(report.viewMissing).toEqual([]);
    expect(useSessionOpen.getState().missing).toHaveLength(1);
    noteDataFiles([data]);
    await vi.waitFor(() => expect(useSessionOpen.getState().missing).toHaveLength(0), { timeout: 10_000 });
  });
});
