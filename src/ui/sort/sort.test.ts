import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { naturalCompare, orderOf, sortList } from './order';
import { naturalDir, useSort, useSorted, type Sort, type SortOption } from './useSort';

describe('natural order', () => {
  it('reads digits as numbers, ignores case and accents', () => {
    const maps = ['MP_10', 'mp_2', 'MP_1', 'Zone', 'école', 'Echo', 'ärzte', 'Arzt'];
    expect([...maps].sort((a, b) => naturalCompare(a, b))).toEqual([
      'Arzt',
      'ärzte',
      'Echo',
      'école',
      'MP_1',
      'mp_2',
      'MP_10',
      'Zone',
    ]);
    expect(naturalCompare('a', 'A')).toBe(0);
    expect(naturalCompare('Team 9', 'Team 10')).toBeLessThan(0);
  });

  it('is stable and puts missing keys last both ways', () => {
    const keys = ['b', '', 'a', null, 'B', 'a'];
    expect([...orderOf(keys, 'text', 'asc')]).toEqual([2, 5, 0, 4, 1, 3]);
    expect([...orderOf(keys, 'text', 'desc')]).toEqual([0, 4, 2, 5, 1, 3]);
    expect([...orderOf([3, NaN, 1, 3, undefined, 2], 'number', 'desc')]).toEqual([0, 3, 5, 2, 1, 4]);
  });

  it('keeps the list order for a keyless option, reversed descending', () => {
    expect(sortList([1, 2, 3], null, 'text', 'asc')).toEqual([1, 2, 3]);
    expect(sortList([1, 2, 3], null, 'text', 'desc')).toEqual([3, 2, 1]);
  });

  it('sorts a hundred thousand names in one pass', () => {
    const names = Array.from({ length: 100_000 }, (_, i) => `unit_${(i * 7919) % 100_000}`);
    const out = sortList(names, (n) => n, 'text', 'asc');
    expect(out[0]).toBe('unit_0');
    expect(out[9]).toBe('unit_9');
    expect(out[10]).toBe('unit_10');
    expect(out[99_999]).toBe('unit_99999');
  });
});

interface Row {
  name: string;
  kills: number;
}
const ROWS: Row[] = [
  { name: 'MP_10', kills: 1 },
  { name: 'MP_2', kills: 5 },
  { name: 'alpha', kills: 3 },
];

/** Renders a list through the hooks and returns its order and the sort it used. */
function renderList(by: string): { order: string[]; sort: Sort<Row> } {
  let sort!: Sort<Row>;
  let order: string[] = [];
  const options: SortOption<Row>[] = [
    { id: 'name', label: 'Name', key: (r) => r.name },
    { id: 'kills', label: 'Kills', key: (r) => r.kills, kind: 'number' },
    { id: 'order', label: 'As listed', key: null },
  ];
  function List() {
    sort = useSort<Row>('test.list', options, by);
    order = useSorted(ROWS, sort).map((r) => r.name);
    return null;
  }
  renderToString(createElement(List));
  return { order, sort };
}

describe('useSort', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('works without storage, from the default', () => {
    vi.stubGlobal('localStorage', undefined);
    const { order, sort } = renderList('name');
    expect(order).toEqual(['alpha', 'MP_2', 'MP_10']);
    expect(sort.dir).toBe('asc');
    expect(() => sort.set('kills')).not.toThrow();
  });

  it('ranks numbers highest first and remembers the choice per list', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
    expect(renderList('kills').order).toEqual(['MP_2', 'alpha', 'MP_10']);
    renderList('kills').sort.set('name', 'desc');
    expect(JSON.parse(store.get('heat3d.sort.test.list')!)).toEqual({ by: 'name', dir: 'desc' });
    const again = renderList('kills');
    expect(again.sort.by).toBe('name');
    expect(again.order).toEqual(['MP_10', 'MP_2', 'alpha']);
    // A stored option the list no longer has falls back to the default.
    store.set('heat3d.sort.test.list', JSON.stringify({ by: 'gone', dir: 'asc' }));
    expect(renderList('kills').sort.by).toBe('kills');
    expect(renderList('kills').sort.dir).toBe('desc');
  });

  it('gives each option its natural direction', () => {
    expect(naturalDir({ id: 'n', label: '', key: null })).toBe('asc');
    expect(naturalDir({ id: 'k', label: '', key: () => 1, kind: 'number' })).toBe('desc');
    expect(naturalDir({ id: 't', label: '', key: () => 1, kind: 'number', dir: 'asc' })).toBe('asc');
  });
});
