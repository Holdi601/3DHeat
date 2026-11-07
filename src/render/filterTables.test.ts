import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset, FilterSpec } from '../state/types';
import {
  PERSON_FILTER_COLUMN,
  buildActiveFilters,
  filterColumnData,
  filterSlots,
  frameSignTables,
  packSignTables,
} from './filterTables';
import { FILTER_MASK_CAPACITY, MAX_FILTER_SLOTS, type ActiveFilter } from './types';
import { HEAT_VS, LINE_HEAT_VS } from './webgl2/shaders';
import { HEAT_WGSL, LINE_HEAT_WGSL } from './webgpu/shaders';

/**
 * A dataset of six rows: three groups, five people, one category column and one
 * numeric column. Only what the tables read is filled in.
 */
function dataset(people = 5): Dataset {
  const attrs: AttributeColumn[] = [
    {
      name: 'build',
      kind: 'category',
      data: new Uint32Array([0, 1, 2, 0, 1, 2]),
      min: 0,
      max: 2,
      categories: ['a', 'b', 'c'],
    },
    { name: 'speed', kind: 'number', data: new Float32Array([1, 2, 3, 4, 5, 6]), min: 1, max: 6 },
  ];
  return {
    count: 6,
    teamId: new Uint16Array([0, 1, 2, 0, 1, 2]),
    teamLabels: ['red', 'blue', 'green'],
    personId: new Uint32Array([0, 1, 2, 3, 4, 0]),
    personLabels: Array.from({ length: people }, (_, i) => `p${i}`),
    attrs,
  } as unknown as Dataset;
}

const scratch = () => ({ group: null as Int8Array | null, split: null as Int8Array | null });

describe('the sign tables', () => {
  it('keep hidden groups hidden under a category split', () => {
    // The defect: with a split by a column the renderers uploaded the split's
    // table *instead of* the group table, so unticking a group did nothing.
    const { teamSign, split } = frameSignTables(
      dataset(),
      'heat-difference',
      [0],
      [1, 2],
      { 1: false },
      [],
      { kind: 'categories', column: 'build', positive: [0], negative: [1] },
      scratch(),
    );
    expect(split.mode).toBe(1);
    expect([...split.sign!]).toEqual([1, -1, 0]);
    // Visibility only: the column decides the sign, the groups who is drawn.
    expect([...teamSign!]).toEqual([1, 0, 1]);
  });

  it('keep the group filter under a range split', () => {
    const { teamSign, split } = frameSignTables(
      dataset(),
      'heat-difference',
      [0],
      [1],
      {},
      [{ kind: 'teams', allowed: [0, 1] }],
      { kind: 'range', column: 'speed', positive: [1, 3], negative: [4, 6] },
      scratch(),
    );
    expect(split.mode).toBe(2);
    expect([...teamSign!]).toEqual([1, 1, 0]);
  });

  it('carry the signs when the difference splits by group', () => {
    const { teamSign, split } = frameSignTables(
      dataset(),
      'heat-difference',
      [0],
      [1],
      { 0: true, 1: true, 2: true },
      [],
      { kind: 'teams' },
      scratch(),
    );
    expect(split.mode).toBe(0);
    expect([...teamSign!]).toEqual([1, -1, 0]);
  });

  it('ignore a column split outside difference mode', () => {
    const { teamSign, split } = frameSignTables(
      dataset(),
      'heat-simple',
      [0],
      [1],
      { 2: false },
      [],
      { kind: 'categories', column: 'build', positive: [0], negative: [1] },
      scratch(),
    );
    expect(split.mode).toBe(0);
    expect([...teamSign!]).toEqual([1, 1, 0]);
  });

  it('pack groups and categories side by side, each with its own default', () => {
    const packed = packSignTables(new Int8Array([1, 0]), new Int8Array([-1, 1, 0]), 4);
    // Groups past the table draw; categories past it are on neither side.
    expect([...packed]).toEqual([1, 0, 1, 1, -1, 1, 0, 0]);
    expect([...packSignTables(null, null, 2)]).toEqual([1, 1, 0, 0]);
  });
});

describe('the person filter', () => {
  it('reaches the heat as a slot over the person ids', () => {
    // The defect: only box replay honoured it, so a player focus showed
    // everyone's heat.
    const ds = dataset();
    const active = buildActiveFilters(ds, [{ kind: 'persons', allowed: [1, 3] }]);
    expect(active).toHaveLength(1);
    expect(active[0].column).toBe(PERSON_FILTER_COLUMN);
    expect(active[0].kind).toBe('categories');
    expect([...active[0].mask!]).toEqual([0, 255, 0, 255, 0]);
    expect(filterColumnData(ds, PERSON_FILTER_COLUMN)).toBe(ds.personId);
    expect(filterColumnData(ds, 'speed')).toBe(ds.attrs[1].data);
  });

  it('takes one of the four slots, and is the one left out when they are full', () => {
    const ds = dataset();
    const columns: FilterSpec[] = [
      { kind: 'categories', column: 'build', allowed: [0] },
      { kind: 'range', column: 'speed', min: 2, max: 5 },
      { kind: 'categories', column: 'build', allowed: [1] },
      { kind: 'range', column: 'speed', min: 1, max: 3 },
    ];
    const persons: FilterSpec = { kind: 'persons', allowed: [2] };
    const filters = [...columns, { kind: 'teams', allowed: [0] } as FilterSpec, persons];
    expect(filterSlots(ds, filters)).toEqual([0, 1, 2, 3, null, 4]);
    const active = buildActiveFilters(ds, filters);
    expect(active).toHaveLength(MAX_FILTER_SLOTS);
    expect(active.some((f) => f.column === PERSON_FILTER_COLUMN)).toBe(false);

    // First in the list, it gets a slot and the last column filter does not.
    expect(filterSlots(ds, [persons, ...columns])).toEqual([0, 1, 2, 3, 4]);
  });

  it('takes no slot when it restricts nothing', () => {
    const ds = dataset(3);
    expect(filterSlots(ds, [{ kind: 'persons', allowed: [0, 1, 2] }])).toEqual([null]);
    const noPeople = { ...ds, personId: null } as Dataset;
    expect(filterSlots(noPeople, [{ kind: 'persons', allowed: [0] }])).toEqual([null]);
    // A range over the whole column is no restriction either.
    expect(filterSlots(ds, [{ kind: 'range', column: 'speed', min: 0, max: 9 }])).toEqual([null]);
  });

  it('holds tens of thousands of people, and nobody past the capacity', () => {
    const ds = dataset(FILTER_MASK_CAPACITY + 10);
    const [f] = buildActiveFilters(ds, [{ kind: 'persons', allowed: [40_000, FILTER_MASK_CAPACITY + 5] }]);
    expect(f.mask!.length).toBe(FILTER_MASK_CAPACITY);
    expect(f.mask![40_000]).toBe(255);
    expect(FILTER_MASK_CAPACITY).toBeGreaterThanOrEqual(65_536);
  });

  it('changes its key, and so the accumulation, with the selection', () => {
    const ds = dataset();
    const cache = new WeakMap<FilterSpec, ActiveFilter>();
    const one: FilterSpec = { kind: 'persons', allowed: [1] };
    const a = buildActiveFilters(ds, [one], cache)[0];
    // The same spec is described once, not once a frame.
    expect(buildActiveFilters(ds, [one], cache)[0]).toBe(a);
    const b = buildActiveFilters(ds, [{ kind: 'persons', allowed: [2] }], cache)[0];
    expect(b.key).not.toBe(a.key);
  });
});

describe('the heat shaders', () => {
  it('read the group table under a column split, on both backends and in both heat kinds', () => {
    for (const src of [HEAT_VS, LINE_HEAT_VS]) {
      expect(src).toContain('if (groupSign == 0.0) reject = true;');
      expect(src).toContain('texelFetch(uTeamSignTex, ivec2(cat, 1), 0)');
    }
    for (const src of [HEAT_WGSL, LINE_HEAT_WGSL]) {
      expect(src).toContain('if (groupSign == 0.0) { reject = true; }');
      expect(src).toContain('teamSign[tableSize + cat]');
    }
  });

  it('size the filter masks for the person filter', () => {
    expect(HEAT_VS).toContain(`c >= ${FILTER_MASK_CAPACITY}`);
    expect(HEAT_WGSL).toContain(`FILTER_MASK_CAPACITY : u32 = ${FILTER_MASK_CAPACITY}u`);
  });
});
