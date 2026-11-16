import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset, FilterSpec, SplitRule } from '../state/types';
import {
  PERSON_FILTER_COLUMN,
  buildActiveFilters,
  filterColumnData,
  activeFilterFlags,
  packFilterTable,
  rowPasses,
  buildSplitTable,
  frameSignTables,
  packSignTables,
  sideScales,
  splitSideCounts,
} from './filterTables';
import { FILTER_MASK_CAPACITY, type ActiveFilter } from './types';
import { FILTER_PASS_FS, HEAT_VS, LINE_HEAT_VS } from './webgl2/shaders';
import { FILTER_PASS_WGSL, HEAT_WGSL, LINE_HEAT_WGSL } from './webgpu/shaders';

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
    px: new Float32Array(6),
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

  it('applies every filter however many there are, the person filter included', () => {
    const ds = dataset();
    const columns: FilterSpec[] = [
      { kind: 'categories', column: 'build', allowed: [0] },
      { kind: 'range', column: 'speed', min: 2, max: 5 },
      { kind: 'categories', column: 'build', allowed: [1] },
      { kind: 'range', column: 'speed', min: 1, max: 3 },
      { kind: 'categories', column: 'build', allowed: [0, 2] },
      { kind: 'range', column: 'speed', min: 1.5, max: 6 },
    ];
    const persons: FilterSpec = { kind: 'persons', allowed: [2] };
    const filters = [...columns, { kind: 'teams', allowed: [0] } as FilterSpec, persons];
    expect(activeFilterFlags(ds, filters)).toEqual([true, true, true, true, true, true, false, true]);
    const active = buildActiveFilters(ds, filters);
    expect(active).toHaveLength(7);
    expect(active[6].column).toBe(PERSON_FILTER_COLUMN);
  });

  it('does not count a filter that lets everything through', () => {
    const ds = dataset(3);
    expect(activeFilterFlags(ds, [{ kind: 'persons', allowed: [0, 1, 2] }])).toEqual([false]);
    const noPeople = { ...ds, personId: null } as Dataset;
    expect(activeFilterFlags(noPeople, [{ kind: 'persons', allowed: [0] }])).toEqual([false]);
    // A range over the whole column is no restriction either.
    expect(activeFilterFlags(ds, [{ kind: 'range', column: 'speed', min: 0, max: 9 }])).toEqual([false]);
    // Every value ticked, in any order: nothing restricted.
    expect(activeFilterFlags(ds, [{ kind: 'categories', column: 'build', allowed: [2, 0, 1] }])).toEqual([false]);
    // Repeats and ids the column does not have do not make up for a missing value.
    expect(activeFilterFlags(ds, [{ kind: 'categories', column: 'build', allowed: [0, 0, 1, 7] }])).toEqual([true]);
    expect(buildActiveFilters(ds, [{ kind: 'categories', column: 'build', allowed: [0, 1, 2] }])).toEqual([]);
  });

  it('ANDs across filters and ORs the values within one', () => {
    const ds = dataset();
    const filters = buildActiveFilters(ds, [
      { kind: 'categories', column: 'build', allowed: [0, 2] }, // rows 0 2 3 5
      { kind: 'range', column: 'speed', min: 2, max: 5 }, // rows 1 2 3 4
      { kind: 'persons', allowed: [2, 3, 4] }, // rows 2 3 4
    ]);
    const data = filters.map((f) => filterColumnData(ds, f.column)!);
    const pass = Array.from({ length: ds.count }, (_, i) => rowPasses(filters, data, i));
    expect(pass).toEqual([false, false, true, true, false, false]);
    // Excluding a value is leaving it out: everything but 'a'.
    const notA = buildActiveFilters(ds, [{ kind: 'categories', column: 'build', allowed: [1, 2] }]);
    const notAData = [filterColumnData(ds, 'build')!];
    expect(Array.from({ length: 6 }, (_, i) => rowPasses(notA, notAData, i))).toEqual([false, true, true, false, true, true]);
  });

  it('packs any number of filters into one table for the WebGPU filter pass', () => {
    const ds = dataset();
    const filters = buildActiveFilters(ds, [
      { kind: 'range', column: 'speed', min: 2, max: 5 },
      { kind: 'categories', column: 'build', allowed: [1] },
      { kind: 'persons', allowed: [40] },
      ...Array.from({ length: 9 }, (_, k): FilterSpec => ({ kind: 'range', column: 'speed', min: k, max: 9 })).slice(2),
    ]);
    const table = packFilterTable(filters);
    const f32 = new Float32Array(table.buffer);
    expect(table[0]).toBe(filters.length);
    expect(filters.length).toBeGreaterThan(4);
    expect([table[4], f32[5], f32[6]]).toEqual([1, 2, 5]);
    // The category filter: mode, length, bitset start; only id 1 set.
    expect([table[8], table[10]]).toEqual([2, 3]);
    expect(table[table[11]]).toBe(0b10);
    // The person filter's bitset follows; id 40 is past its five people, so none set.
    expect(table[12]).toBe(2);
    expect(table[15]).toBe(table[11] + 1);
    // Nothing set past the table's own bits.
    expect(table.length).toBe(table[15] + 1);
  });

  it('reads one pass bit a row in both renderers, built from every filter', () => {
    expect(HEAT_VS).toContain('texelFetch(uPassTex, tc, 0)');
    expect(HEAT_VS).not.toContain('uFilterTex0');
    for (const src of [HEAT_WGSL, LINE_HEAT_WGSL]) {
      expect(src).toContain('passBits[row >> 5u]');
      expect(src).toContain('if (!passFilters(row)) { reject = true; }');
    }
    expect(FILTER_PASS_WGSL).toContain('bits[w] = bits[w] & acc;');
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
    expect(FILTER_PASS_FS).toContain(`c < ${FILTER_MASK_CAPACITY}`);
    expect(FILTER_PASS_WGSL).toContain(`FILTER_MASK_CAPACITY : u32 = ${FILTER_MASK_CAPACITY}u`);
  });
});

describe('a column split that cannot be drawn', () => {
  // The defect: each of these fell back to the group split, so a difference
  // split by a column the user had just chosen drew the teams instead.
  it('draws nothing when neither side has a value, and says why', () => {
    const t = buildSplitTable(dataset(), { kind: 'categories', column: 'build', positive: [], negative: [] });
    expect(t.problem).toBe('noSides');
    // Mode 1 over no column: both renderers skip such a chunk.
    expect(t.mode).toBe(1);
    expect(t.column).toBeNull();
  });

  it('draws nothing for a column that is gone or of the wrong kind', () => {
    expect(buildSplitTable(dataset(), { kind: 'categories', column: 'gone', positive: [0], negative: [1] }).problem).toBe('noColumn');
    expect(buildSplitTable(dataset(), { kind: 'range', column: 'build', positive: [0, 1], negative: [1, 2] }).problem).toBe('wrongKind');
    expect(buildSplitTable(dataset(), { kind: 'categories', column: 'speed', positive: [0], negative: [1] }).problem).toBe('wrongKind');
  });

  it('keeps the group table visibility-only, so no team split appears', () => {
    const { teamSign, split } = frameSignTables(
      dataset(),
      'heat-difference',
      [0],
      [1, 2],
      {},
      [],
      { kind: 'categories', column: 'build', positive: [], negative: [] },
      scratch(),
    );
    expect(split.mode).not.toBe(0);
    expect([...teamSign!]).toEqual([1, 1, 1]);
  });

  it('draws one side alone when only one side has values', () => {
    const t = buildSplitTable(dataset(), { kind: 'categories', column: 'build', positive: [2], negative: [] });
    expect(t.problem).toBeNull();
    expect([...t.sign!]).toEqual([0, 0, 1]);
  });
});

describe('rows on each side of the difference', () => {
  const rule: SplitRule = { kind: 'categories', column: 'build', positive: [0], negative: [1, 2] };

  it('counts by the split, and the groups still decide who is drawn', () => {
    const ds = dataset();
    const { teamSign, split } = frameSignTables(ds, 'heat-difference', [], [], { 2: false }, [], rule, scratch());
    // Rows: build a,b,c,a,b,c in groups 0,1,2,0,1,2; group 2 hidden.
    expect(splitSideCounts(ds, 0, 6, [], teamSign, split)).toEqual({ positive: 2, negative: 2, exact: true });
    // The window bounds the rows.
    expect(splitSideCounts(ds, 0, 3, [], teamSign, split)).toEqual({ positive: 1, negative: 1, exact: true });
  });

  it('applies the filters and the group split', () => {
    const ds = dataset();
    const filters = buildActiveFilters(ds, [{ kind: 'range', column: 'speed', min: 1, max: 3 }]);
    const cols = frameSignTables(ds, 'heat-difference', [], [], {}, [], rule, scratch());
    expect(splitSideCounts(ds, 0, 6, filters, cols.teamSign, cols.split)).toEqual({ positive: 1, negative: 2, exact: true });
    const groups = frameSignTables(ds, 'heat-difference', [0], [1], {}, [], { kind: 'teams' }, scratch());
    expect(splitSideCounts(ds, 0, 6, [], groups.teamSign, groups.split)).toEqual({ positive: 2, negative: 2, exact: true });
  });

  it('samples a large window and scales up', () => {
    const ds = dataset();
    const { teamSign, split } = frameSignTables(ds, 'heat-difference', [], [], {}, [], rule, scratch());
    const c = splitSideCounts(ds, 0, 6, [], teamSign, split, 3);
    expect(c.exact).toBe(false);
    // Every second row: a, c, b -> one positive, two negative, times two.
    expect(c).toEqual({ positive: 2, negative: 4, exact: false });
  });

  it('counts nothing for a split that cannot be drawn', () => {
    const ds = dataset();
    const split = buildSplitTable(ds, { kind: 'categories', column: 'build', positive: [], negative: [] });
    expect(splitSideCounts(ds, 0, 6, [], null, split)).toEqual({ positive: 0, negative: 0, exact: true });
  });

  it('weights each side to half the total when comparing shares', () => {
    // Five times as many on one side: each then weighs as if it held half.
    const [p, n] = sideScales({ positive: 500, negative: 100 });
    expect(p * 500).toBeCloseTo(300);
    expect(n * 100).toBeCloseTo(300);
    expect(sideScales({ positive: 10, negative: 0 })).toEqual([1, 1]);
  });
});

describe('the heat shaders, for the split and the zoom', () => {
  it('scale each side and never fall back to the group split', () => {
    for (const src of [HEAT_VS, LINE_HEAT_VS]) expect(src).toContain('uSideScale.x : uSideScale.y');
    for (const src of [HEAT_WGSL, LINE_HEAT_WGSL]) expect(src).toContain('sgn * u.teamCfg.z');
  });

  it('keeps the heat of a clamped point sprite when asked', () => {
    expect(HEAT_VS).toContain('vFade = fade * ratio * ratio;');
    expect(HEAT_WGSL).toContain('out.fade = out.fade * ratio * ratio;');
  });
});
