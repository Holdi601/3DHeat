import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '../state/store';
import { useShareIndex, type CatalogEntry } from './assets';
import { useLacks, setMyLacks, myLacks } from './lacks';
import { hostRoom, needId, publishRoom, unsharedLacks, updateHostAsk, useHostAsk, useRoom } from './room';
import { useSessionStore } from './store';

const item = (path: string, kind: CatalogEntry['kind'], game: string, name: string, size = 1000, extra: Partial<CatalogEntry> = {}): CatalogEntry => ({
  path,
  kind,
  game,
  name,
  size,
  total: size * 2,
  extracted: kind === 'model-pack',
  confidential: false,
  ...extra,
});

const items = [
  item('wt/berlin/berlin.glb', 'level', 'wt', 'berlin'),
  item('wt/catalog.json', 'catalog', 'wt', 'wt'),
  item('model-packs/wt/model-pack.json', 'model-pack', 'wt', 'wt'),
  item('cs2/dust.glb', 'level', 'cs2', 'dust'),
];

function loadLevel(name: string | null) {
  useStore.setState({ level: name ? ({ kind: 'model', name } as never) : null });
}

describe('the host room', () => {
  beforeEach(() => {
    useShareIndex.setState({ index: { available: true, items, blocked: 0, shared: [] }, at: 0 });
    useSessionStore.setState({ members: [], info: null });
    useLacks.setState({ by: {}, version: 0 });
    useHostAsk.setState({ ask: null, declined: new Set() });
    loadLevel(null);
  });

  it('names the loaded map with its game catalogue and model pack, never a path', () => {
    loadLevel('berlin.glb');
    const r = hostRoom();
    expect(r.needs.map((n) => n.kind)).toEqual(['level', 'catalog', 'model-pack']);
    expect(r.level).toBe(needId('level', 'berlin'));
    expect(r.needs[0]).toMatchObject({ name: 'berlin', game: 'wt', size: 2000 });
    expect(JSON.stringify(r)).not.toContain('/');
    // A map of another game takes that game's (none here).
    loadLevel('dust.glb');
    expect(hostRoom().needs.map((n) => n.kind)).toEqual(['level']);
  });

  it('ids are short and safe to travel in presence', () => {
    for (const k of ['level', 'catalog', 'model-pack', 'data'] as const) expect(needId(k, 'Some Map Name With Spaces')).toMatch(/^[a-z0-9_-]{1,24}$/);
    expect(needId('level', 'a')).not.toBe(needId('level', 'b'));
    setMyLacks(['lvabc', 'BAD ID', 'ct1']);
    expect(myLacks()).toBe('lvabc,ct1');
    setMyLacks([]);
  });

  it('shared items answer their need and the host is asked only for what members lack', () => {
    loadLevel('berlin.glb');
    publishRoom();
    const lv = needId('level', 'berlin');
    const mp = needId('model-pack', 'wt');
    useSessionStore.setState({
      members: [
        { id: 1, name: 'Host', role: 'host', muted: false, mutedUntil: 0, connected: true },
        { id: 2, name: 'Alice', role: 'viewer', muted: false, mutedUntil: 0, connected: true },
        { id: 3, name: 'Bob', role: 'viewer', muted: false, mutedUntil: 0, connected: true },
      ],
    });
    useLacks.setState({ by: { 2: [lv, mp], 3: [mp] }, version: 1 });
    expect([...unsharedLacks().entries()]).toEqual([
      [lv, ['Alice']],
      [mp, ['Alice', 'Bob']],
    ]);
    updateHostAsk();
    const ask = useHostAsk.getState().ask!;
    expect(ask.members).toEqual(['Alice', 'Bob']);
    expect(ask.who[mp]).toEqual(['Alice', 'Bob']);
    // The level is shared: it is offered, and no longer asked about.
    useShareIndex.setState({
      index: { available: true, items, blocked: 0, shared: [{ id: 'x1', kind: 'level', game: 'wt', name: 'berlin', size: 2000, files: 3, manifest: 'a'.repeat(64), path: 'wt/berlin/berlin.glb' }] },
      at: 1,
    });
    publishRoom();
    expect(useRoom.getState().doc.offers).toMatchObject([{ id: 'x1', need: lv }]);
    expect([...unsharedLacks().keys()]).toEqual([mp]);
  });
});
