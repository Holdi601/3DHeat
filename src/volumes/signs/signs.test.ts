import { describe, expect, it } from 'vitest';
import { applyCollectionOps, diffCollection, isDocBatch, sharedDoc } from '../../state/sharedDocs';
import { makeSign, parseSign, type Sign } from './sign';
import { onLocalSignBatch, SIGNS_DOC, useSignStore } from './store';
import { aggScopes, specColumns, windowMinutes } from '../../charts/data';
import { FULL_SCOPE } from '../stats';
import type { Dataset } from '../../state/types';

const list = () => [makeSign('v1', { kind: 'bar', group: 'team' }, 0), makeSign('v1', { kind: 'line' }, 1)];

describe('chart signs as operations', () => {
  it('turn one list into another and back by operations', () => {
    const a = list();
    const b: Sign[] = [{ ...a[0], title: 'Kills', scale: 2 }, makeSign('v2', { kind: 'pie' }, 0)];
    const ops = diffCollection('signs', a as never, b as never);
    expect(ops.map((o) => o.op).sort()).toEqual(['add', 'del', 'set']);
    expect(applyCollectionOps(a, 'signs', ops)).toEqual(b);
  });

  it('apply a peer batch once, and ignore operations on signs that are gone', () => {
    const st = useSignStore;
    st.setState({ signs: list(), log: [], rev: 0 });
    const id = st.getState().signs[0].id;
    const batch = { doc: SIGNS_DOC, id: 'p1', author: 'peer', at: 1, ops: [{ op: 'set' as const, coll: 'signs', id, fields: { title: 'Bridge' } }, { op: 'del' as const, coll: 'signs', id: 'nope' }] };
    st.getState().applyRemote(batch);
    st.getState().applyRemote(batch);
    expect(st.getState().signs[0].title).toBe('Bridge');
    expect(st.getState().log.filter((b) => b.id === 'p1').length).toBe(1);
    expect(st.getState().signs.length).toBe(2);
  });

  it('log local edits as batches, a drag as one', () => {
    const st = useSignStore;
    st.setState({ signs: list(), log: [], rev: 0 });
    const sent: unknown[] = [];
    const off = onLocalSignBatch((b) => sent.push(b));
    const id = st.getState().signs[0].id;
    st.getState().update(id, { collapsed: true });
    for (let i = 0; i < 10; i++) st.getState().preview(id, { px: [i, i] });
    st.getState().settle();
    st.getState().remove(st.getState().signs[1].id);
    off();
    expect(st.getState().log.length).toBe(3);
    expect(sent.length).toBe(3);
    expect(sent.every((b) => isDocBatch(b, SIGNS_DOC))).toBe(true);
    const drag = st.getState().log[1].ops[0];
    expect(drag).toMatchObject({ op: 'set', fields: { px: [9, 9] } });
  });

  it('keep a session file state and read it back', () => {
    const st = useSignStore;
    st.setState({ signs: list() });
    const doc = sharedDoc(SIGNS_DOC)!;
    expect(doc.colls).toEqual(['signs']);
    const snap = JSON.parse(JSON.stringify(doc.get()));
    expect(doc.hasContent!(snap)).toBe(true);
    doc.set(doc.empty());
    expect(st.getState().signs.length).toBe(0);
    doc.set(snap);
    expect(st.getState().signs.length).toBe(2);
    expect(parseSign({ id: 'x', volumeId: 'v', spec: { kind: 'nope' }, scale: 99 })).toMatchObject({ spec: { kind: 'bar' }, scale: 4 });
    expect(parseSign({ id: 1 })).toBe(null);
  });
});

describe('what the signs ask of the data', () => {
  const ds = {
    timeRange: [0, 600],
    sessionStart: new Float32Array([0, 300]),
    sessionEnd: new Float32Array([240, 600]),
  } as unknown as Dataset;

  it('read only the columns their charts and filters need', () => {
    const meta = { won: 'won', event: 'Event type' };
    expect(specColumns({ kind: 'bar', group: 'col:weapon', measure: { kind: 'median', column: 'speed' }, diff: 'outcome', sort: 'label' }, meta).sort()).toEqual(['speed', 'weapon', 'won']);
    expect(specColumns({ kind: 'tiles', group: 'none', measure: { kind: 'count' }, diff: 'none', sort: 'label' }, meta).sort()).toEqual(['Event type', 'won']);
  });

  it('count minutes over the matches a window covers', () => {
    expect(windowMinutes(ds, -Infinity, Infinity, -1)).toBeCloseTo(540 / 60, 9);
    expect(windowMinutes(ds, 200, 360, -1)).toBeCloseTo(100 / 60, 9);
    expect(windowMinutes(ds, 200, 360, 1)).toBeCloseTo(60 / 60, 9);
  });

  it('give "up to now" the start to the playhead, whatever the window', () => {
    const { scope, upTo } = aggScopes(ds, { ...FULL_SCOPE, timeLo: 100, timeHi: 160 }, 160);
    expect(scope.minutes).toBeCloseTo(1, 9);
    expect(upTo).toMatchObject({ timeLo: -Infinity, timeHi: 160 });
    expect(upTo.minutes).toBeCloseTo(160 / 60, 9);
    const all = aggScopes(ds, FULL_SCOPE, null);
    expect(all.upTo).toBe(all.scope);
  });
});
