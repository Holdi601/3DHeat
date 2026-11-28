import { describe, expect, it } from 'vitest';
import { applyDocOps } from '../tactics/ops';
import { applySplice, merge3, moveCaret, spliceOf } from './textMerge';
import { DocRegistry, SharedSync, toDocState, type OutBatch, type SharedDoc } from './shared';

describe('text merging', () => {
  it('keeps both edits made in different places', () => {
    const base = 'one two three';
    expect(merge3(base, 'one 1 two three', 'one two three 3')).toBe('one 1 two three 3');
    expect(merge3(base, 'two three', 'one two 3')).toBe('two 3');
  });

  it('finds the place by the nearest text when the far context changed', () => {
    const base = 'Alpha.\n\nBravo.\n\nCharlie.';
    const now = 'Alpha one.\n\nBravo three.\n\nCharlie.';
    expect(merge3(base, 'Alpha.\n\nBravo.\n\nCharlie two.', now)).toBe('Alpha one.\n\nBravo three.\n\nCharlie two.');
  });

  it('keeps both inserts made in the same place', () => {
    const out = merge3('ab', 'aXb', 'aYb');
    expect(out.includes('X') && out.includes('Y')).toBe(true);
  });

  it('a splice onto the same text is the edit itself', () => {
    const sp = spliceOf('hello world', 'hello there world')!;
    expect(applySplice('hello world', sp, 'hello there world')).toBe('hello there world');
    expect(applySplice('oh, hello world!', sp)).toBe('oh, hello there world!');
  });

  it('moves a caret with the text around it', () => {
    expect(moveCaret('abc def', 'XX abc def', 5)).toBe(8);
    expect(moveCaret('abc def', 'abc def!', 2)).toBe(2);
  });
});

/** A viewer with one note document whose `text` merges. */
function viewer(send: (b: OutBatch) => void) {
  let state: object = { notes: [{ id: 'n', text: 'Alpha. Bravo. Charlie.' }] };
  const reg = new DocRegistry();
  const doc: SharedDoc = {
    key: 'notes',
    colls: ['notes'],
    get: () => state,
    set: (s) => (state = s),
    empty: () => ({ notes: [] }),
    text: { notes: ['text'] },
  };
  reg.register(doc);
  const sync = new SharedSync(send, () => {}, reg);
  return {
    text: () => (state as { notes: { text: string }[] }).notes.find((n) => (n as { id?: string }).id === 'n')?.text,
    type: (f: (t: string) => string) =>
      (state = {
        notes: (state as { notes: { id: string; text: string }[] }).notes.map((n) => ({ ...n, text: f(n.text) })),
      }),
    makePrivate: (id: string) =>
      (state = {
        notes: [...(state as { notes: object[] }).notes, { id, text: 'mine', private: true }],
      }),
    has: (id: string) => (state as { notes: { id: string }[] }).notes.some((n) => n.id === id),
    sync,
  };
}

describe('shared text and private entities', () => {
  it('two typing in one note at once end with both words, and the server is corrected', () => {
    let server: object = {
      notes: [{ id: 'n', text: 'Alpha. Bravo. Charlie.' }],
    };
    const inbox: { b: OutBatch }[] = [];
    const host = viewer((b) => inbox.push({ b }));
    const a = viewer((b) => inbox.push({ b }));
    const b = viewer((b) => inbox.push({ b }));
    const snap = { notes: toDocState(server, ['notes']) };
    host.sync.snapshot(snap, true);
    a.sync.snapshot(snap, false);
    b.sync.snapshot(snap, false);
    const run = () => {
      for (let round = 0; round < 5 && inbox.length; round++) {
        for (const x of inbox.splice(0)) {
          server = applyDocOps(server, x.b.ops, ['notes']);
          for (const v of [host, a, b]) v.sync.remote('notes', x.b.id, x.b.ops);
        }
        for (const v of [host, a, b]) v.sync.tick();
      }
    };
    a.type((t) => t.replace('Alpha.', 'Alpha one.'));
    b.type((t) => t.replace('Charlie.', 'Charlie two.'));
    a.sync.tick();
    b.sync.tick();
    run();
    for (const v of [host, a, b]) expect(v.text()).toBe('Alpha one. Bravo. Charlie two.');
    // The host's correction reached the server: a late joiner gets the merged text.
    const text = (server as { notes: { text: string }[] }).notes[0].text;
    expect(text).toBe('Alpha one. Bravo. Charlie two.');
  });

  it('a private entity is never sent and stays through what arrives', () => {
    const sent: OutBatch[] = [];
    const a = viewer((b) => sent.push(b));
    a.sync.snapshot({ notes: toDocState({ notes: [{ id: 'n', text: 'x' }] }, ['notes']) }, false);
    a.makePrivate('p');
    a.sync.tick();
    expect(sent.flatMap((b) => b.ops).some((o) => o.op === 'add' && o.id === 'p')).toBe(false);
    a.sync.remote('notes', 'other', [{ op: 'add', coll: 'notes', id: 'q', value: { id: 'q', text: 'theirs' } }]);
    expect(a.has('p') && a.has('q')).toBe(true);
  });
});
