import { int } from '../i18n';
import { describe, expect, it } from 'vitest';
import {
  datasetCapabilities,
  categoryRowCounts,
  defaultColumnSplit,
  defaultSplitRule,
  modeBlockedReason,
  splitHasTwoSides,
  validateMapping,
} from './validate';
import { useStore } from '../state/store';
import type { AttributeColumn, SplitRule } from '../state/types';
import {
  MAX_TAB_ARRAY_BYTES,
  MIN_GPU_BUDGET,
  MIN_RAM_BUDGET,
  bytesPerRow,
  checkFit,
  clampBudgets,
  detectBudgets,
  estimateFootprint,
} from './memory';
import { MAX_SORTABLE_ROWS } from './sort';
import { emptyColumnMapping, type ColumnMapping, type Dataset } from '../state/types';
import type { SourcePreview } from './sourcePreview';

function mapping(p: Partial<ColumnMapping> = {}): ColumnMapping {
  return { ...emptyColumnMapping(), ...p };
}

function preview(p: Partial<SourcePreview> = {}): SourcePreview {
  return {
    format: 'parquet',
    fileName: 'f.parquet',
    columns: ['X', 'Y', 'Z', 'time', 'Name', 'team', 'label'],
    rows: [['1', '2', '3', '100', 'a', 'red', 'x']],
    numeric: [true, true, true, true, false, false, false],
    rowCount: 100,
    rowCountExact: true,
    fileBytes: 1000,
    delimiter: ',',
    logicalTypes: {},
    hints: null,
    ...p,
  };
}

describe('validateMapping — position axes', () => {
  it('requires at least two axes', () => {
    expect(validateMapping(mapping(), preview()).ok).toBe(false);
    expect(validateMapping(mapping({ x: 'X' }), preview()).ok).toBe(false);
    expect(validateMapping(mapping({ x: 'X', y: 'Y' }), preview()).ok).toBe(true);
  });

  it('explains what is needed when too few are mapped', () => {
    const v = validateMapping(mapping(), preview());
    expect(v.errors.join(' ')).toMatch(/at least two/i);
    expect(v.errors.join(' ')).toMatch(/X \/ Y \/ Z/);
  });

  it('accepts any pair and reports which plane it will draw on', () => {
    for (const pair of [
      { x: 'X', y: 'Y' },
      { y: 'Y', z: 'Z' },
      { x: 'X', z: 'Z' },
    ]) {
      const v = validateMapping(mapping(pair), preview());
      expect(v.ok, JSON.stringify(pair)).toBe(true);
      expect(v.capabilities.canRender).toBe(true);
      expect(v.capabilities.flatAxes.length).toBe(1);
      expect(v.notes.join(' ')).toMatch(/plane/i);
    }
  });

  it('rejects the same column on two axes', () => {
    const v = validateMapping(mapping({ x: 'X', y: 'X' }), preview());
    expect(v.ok).toBe(false);
    expect(v.errors.join(' ')).toMatch(/more than one position axis/i);
  });

  it('rejects a non-numeric position column before spending the load', () => {
    const v = validateMapping(mapping({ x: 'X', y: 'Name' }), preview());
    expect(v.ok).toBe(false);
    expect(v.errors.join(' ')).toMatch(/does not look numeric/i);
  });

  it('rejects a column that is not in the file', () => {
    const v = validateMapping(mapping({ x: 'X', y: 'Y', time: 'nope' }), preview());
    expect(v.ok).toBe(false);
    expect(v.errors.join(' ')).toMatch(/not in this file/i);
  });

  it('rejects a zero unit scale', () => {
    const m = mapping({ x: 'X', y: 'Y' });
    m.axes = { ...m.axes, scale: 0 };
    expect(validateMapping(m, preview()).ok).toBe(false);
  });
});

describe('validateMapping — capabilities and communication', () => {
  it('says the timeline is unavailable with no time column', () => {
    const v = validateMapping(mapping({ x: 'X', y: 'Y' }), preview());
    expect(v.capabilities.canTimeline).toBe(false);
    expect(v.notes.join(' ')).toMatch(/timeline is unavailable/i);
  });

  it('needs both time and person for lifetime', () => {
    expect(
      validateMapping(mapping({ x: 'X', y: 'Y', time: 'time' }), preview()).capabilities.canLifetime,
    ).toBe(false);
    expect(
      validateMapping(mapping({ x: 'X', y: 'Y', personId: 'Name' }), preview()).capabilities
        .canLifetime,
    ).toBe(false);
    expect(
      validateMapping(mapping({ x: 'X', y: 'Y', time: 'time', personId: 'Name' }), preview())
        .capabilities.canLifetime,
    ).toBe(true);
  });

  it('warns that a DATE column is not a usable time axis', () => {
    const v = validateMapping(
      mapping({ x: 'X', y: 'Y', time: 'time' }),
      preview({ logicalTypes: { time: 'DATE' } }),
    );
    expect(v.warnings.join(' ')).toMatch(/DATE column/i);
    // A warning, not an error: it loads, it just plays a day at a time.
    expect(v.ok).toBe(true);
  });

  it('warns when a look mode has no columns behind it', () => {
    const v = validateMapping(mapping({ x: 'X', y: 'Y', lookMode: 'yawPitch' }), preview());
    expect(v.warnings.join(' ')).toMatch(/no yaw column/i);
  });

  it('warns before the load when the group column looks like an id', () => {
    // Cheaper to say here than after reading 650MB and dropping the grouping at
    // the end, which is what the load has to do when the column really is an id.
    const rows = Array.from({ length: 200 }, (_, i) => ['1', '2', '3', '100', 'a', `s${i}`, 'x']);
    const v = validateMapping(mapping({ x: 'X', y: 'Y', teamId: 'team' }), preview({ rows }));
    expect(v.warnings.join(' ')).toMatch(/looks like an id/i);
    // Still loadable: it is a warning about grouping, not about the rows.
    expect(v.ok).toBe(true);
  });

  it('does not call a varied but small category column an id', () => {
    const rows = Array.from({ length: 200 }, (_, i) => [
      '1',
      '2',
      '3',
      '100',
      'a',
      `squad${i % 25}`,
      'x',
    ]);
    const v = validateMapping(mapping({ x: 'X', y: 'Y', teamId: 'team' }), preview({ rows }));
    expect(v.warnings.join(' ')).not.toMatch(/looks like an id/i);
  });
});

function dataset(p: Partial<Dataset> = {}): Dataset {
  return {
    id: 'd',
    name: 'd',
    count: 2,
    px: new Float32Array([0, 1]),
    py: new Float32Array([0, 1]),
    pz: new Float32Array([0, 1]),
    time: null,
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: null,
    teamId: null,
    personLabels: [],
    teamLabels: [],
    sessionId: null,
    sessionLabels: [],
    sessionRows: null,
    sessionStart: null,
    sessionEnd: null,
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs: [],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1, maxY: 1, maxZ: 1 },
    timeRange: [0, 0],
    timeSorted: true,
    ...p,
  };
}

describe('datasetCapabilities', () => {
  it('reports nothing for no dataset', () => {
    expect(datasetCapabilities(null).canRender).toBe(false);
  });

  it('detects a missing time axis', () => {
    expect(datasetCapabilities(dataset()).canTimeline).toBe(false);
    expect(
      datasetCapabilities(dataset({ time: new Float32Array([0, 5]), timeRange: [0, 5] }))
        .canTimeline,
    ).toBe(true);
  });

  it('detects a time column with no actual span', () => {
    // Every row at one instant: technically a time column, useless as an axis.
    const ds = dataset({ time: new Float32Array([3, 3]), timeRange: [3, 3] });
    expect(datasetCapabilities(ds).canTimeline).toBe(false);
  });

  it('needs two groups for difference mode', () => {
    expect(datasetCapabilities(dataset({ teamLabels: ['a'] })).canDifference).toBe(false);
    expect(datasetCapabilities(dataset({ teamLabels: ['a', 'b'] })).canDifference).toBe(true);
  });

  it('detects a flat axis from zero-width bounds', () => {
    const ds = dataset({ bounds: { minX: 0, minY: 0, minZ: 0, maxX: 5, maxY: 0, maxZ: 5 } });
    expect(datasetCapabilities(ds).flatAxes).toEqual(['y']);
  });
});

describe('modeBlockedReason', () => {
  it('blocks difference mode without two groups', () => {
    const cap = datasetCapabilities(dataset({ teamLabels: ['only'] }));
    expect(modeBlockedReason('heat-difference', cap)).toMatch(/two groups/i);
    expect(modeBlockedReason('heat-simple', cap)).toBeNull();
  });

  it('blocks team mode without a person column', () => {
    const cap = datasetCapabilities(dataset());
    expect(modeBlockedReason('team', cap)).toMatch(/person column/i);
  });

  it('allows everything when the data supports it', () => {
    const cap = datasetCapabilities(
      dataset({
        time: new Float32Array([0, 1]),
        timeRange: [0, 1],
        personId: new Uint32Array([0, 1]),
        personLabels: ['a', 'b'],
        teamLabels: ['x', 'y'],
      }),
    );
    for (const m of ['heat-simple', 'heat-difference', 'team'] as const) {
      expect(modeBlockedReason(m, cap), m).toBeNull();
    }
  });
});

describe('memory budgeting', () => {
  it('charges per mapped column, not a flat rate', () => {
    const bare = bytesPerRow(mapping({ x: 'X', y: 'Y' }));
    const full = bytesPerRow(
      mapping({
        x: 'X',
        y: 'Y',
        z: 'Z',
        time: 'time',
        personId: 'Name',
        teamId: 'team',
        extra: ['a', 'b'],
      }),
    );
    expect(bare.steady).toBe(12);
    // 12 pos + 4 time + 4 lifetime + 4 person + 2 team + 8 attrs
    expect(full.steady).toBe(34);
    // The peak is the itemised transient cost *and* an overhead multiplier for
    // what itemising cannot see — the decoder's working set, the copy that trims
    // each column to length, buffers freed but not yet returned. Measured at 1.9x
    // the itemised figure on a real load, so the model carries 2x.
    expect(full.peak).toBe((34 + 8 + 12 + 4 + 4) * 2);
    expect(full.gpu).toBe(12);
  });

  it('counts the session column and the source tag, which no mapping lists', () => {
    // Both were missing, and both are full-length arrays: the model predicted 50
    // bytes a row where a loaded dataset held 58, found by listing what it
    // actually retains. An under-estimate is the direction that ends in a crash
    // after the app has said "fits".
    const base = mapping({ x: 'X', y: 'Y', z: 'Z', time: 't', personId: 'p' });
    const withSession = mapping({ ...base, sessionId: 's' });
    expect(bytesPerRow(withSession).steady - bytesPerRow(base).steady).toBe(4);
    // The source tag appears only when more than one file is merged, because that
    // is the only time ingest adds it.
    expect(bytesPerRow(base, 4).steady - bytesPerRow(base, 1).steady).toBe(4);
  });

  it('charges no sort scratch when there is no time column', () => {
    const m = bytesPerRow(mapping({ x: 'X', y: 'Y', z: 'Z' }));
    // Nothing to sort by, so no transient columns — but the overhead multiplier
    // still applies, because the decoder and the trimming copy do not care
    // whether the rows are being ordered.
    expect(m.peak).toBe(m.steady * 2);
  });

  it('lifetime costs nothing without both time and person', () => {
    expect(bytesPerRow(mapping({ x: 'X', y: 'Y', time: 't' })).steady).toBe(16);
    expect(bytesPerRow(mapping({ x: 'X', y: 'Y', time: 't', personId: 'p' })).steady).toBe(24);
  });

  it('passes a dataset that fits', () => {
    const budgets = { ...detectBudgets(null), ram: 8 * 1024 ** 3, gpu: 4 * 1024 ** 3 };
    const fp = estimateFootprint(mapping({ x: 'X', y: 'Y', z: 'Z' }), 14_400_000);
    const fit = checkFit(fp, budgets);
    expect(fit.verdict).toBe('fits');
    expect(fit.suggestedStride).toBe(1);
  });

  it('refuses a dataset that does not, with a stride that would', () => {
    const budgets = { ...detectBudgets(null), ram: 1 * 1024 ** 3, gpu: 1 * 1024 ** 3 };
    const m = mapping({ x: 'X', y: 'Y', z: 'Z', time: 't', personId: 'p', teamId: 'g' });
    const fp = estimateFootprint(m, 400_000_000);
    const fit = checkFit(fp, budgets);
    expect(fit.verdict).toBe('too-big');
    expect(fit.suggestedStride).toBeGreaterThan(1);
    expect(fit.limitedBy).toBeTruthy();
    expect(fit.messages.join(' ')).toMatch(/every \d+/i);

    // The suggested stride must actually bring it inside budget.
    const reduced = estimateFootprint(m, Math.floor(400_000_000 / fit.suggestedStride));
    expect(checkFit(reduced, budgets).verdict).not.toBe('too-big');
  });

  it('identifies which budget is binding', () => {
    const m = mapping({ x: 'X', y: 'Y', z: 'Z', time: 't', personId: 'p', extra: ['a', 'b', 'c'] });
    const fp = estimateFootprint(m, 100_000_000);
    // Generous GPU, tiny RAM -> RAM binds.
    expect(checkFit(fp, { ...detectBudgets(null), ram: 1e9, gpu: 64e9 }).limitedBy).toBe('ram');
    // Generous RAM, tiny GPU -> GPU binds.
    expect(checkFit(fp, { ...detectBudgets(null), ram: 64e9, gpu: 1e8 }).limitedBy).toBe('gpu');
  });
});

describe('detected budgets', () => {
  it('starts at its own ceiling, so the default is the most the machine allows', () => {
    const b = detectBudgets(null);
    expect(b.ram).toBe(b.ramMax);
    expect(b.gpu).toBe(b.gpuMax);
  });

  it('leaves cores free for the render loop', () => {
    const b = detectBudgets(null);
    expect(b.cpu).toBeGreaterThanOrEqual(1);
    expect(b.cpu).toBeLessThanOrEqual(b.cpuMax);
    if (b.cpuMax > 4) expect(b.cpu).toBeLessThan(b.cpuMax);
  });

  it('reports where every figure came from', () => {
    const b = detectBudgets(null);
    for (const s of [b.ramSource, b.gpuSource, b.cpuSource]) {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    }
  });

  it('raises the GPU ceiling for a context that looks discrete', () => {
    const modest = detectBudgets({ maxTextureSize: 8192 });
    const discrete = detectBudgets({ maxTextureSize: 16384 });
    expect(discrete.gpuMax).toBeGreaterThan(modest.gpuMax);
  });

  it('uses a reported buffer limit when it implies more than the texture size does', () => {
    const b = detectBudgets({ maxTextureSize: 16384, maxBufferBytes: 2 * 1024 ** 3 });
    expect(b.gpuMax).toBeGreaterThan(4 * 1024 ** 3);
    expect(b.gpuSource).toMatch(/max buffer/);
  });

  it('never lets a chosen budget exceed the ceiling', () => {
    // The whole point of a ceiling: asking for more memory than exists does not
    // produce more memory, it produces a crash partway through a load. Asserted
    // against the *ceiling* rather than the detected default, because the two
    // differ whenever the detected figure is an inference rather than a
    // measurement — which for the GPU is always, no API reporting VRAM.
    const b = detectBudgets({ maxTextureSize: 8192 });
    const greedy = clampBudgets({
      ...b,
      ram: b.ramCeiling * 100,
      gpu: b.gpuCeiling * 100,
      cpu: b.cpuMax + 64,
    });
    expect(greedy.ram).toBe(b.ramCeiling);
    expect(greedy.gpu).toBe(b.gpuCeiling);
    expect(greedy.cpu).toBe(b.cpuMax);
  });

  it('allows anything below the ceiling, down to a usable floor', () => {
    const b = detectBudgets(null);
    const small = clampBudgets({ ...b, ram: MIN_RAM_BUDGET, gpu: MIN_GPU_BUDGET, cpu: 1 });
    expect(small.ram).toBe(MIN_RAM_BUDGET);
    expect(small.gpu).toBe(MIN_GPU_BUDGET);
    expect(small.cpu).toBe(1);
    // And not below it, so a stray 0 cannot make the tool refuse every dataset.
    const zero = clampBudgets({ ...b, ram: 0, gpu: 0, cpu: 0 });
    expect(zero.ram).toBe(MIN_RAM_BUDGET);
    expect(zero.gpu).toBe(MIN_GPU_BUDGET);
    expect(zero.cpu).toBe(1);
  });

  it('is idempotent, so re-clamping a clamped value changes nothing', () => {
    const once = clampBudgets(detectBudgets({ maxTextureSize: 16384 }));
    expect(clampBudgets(once)).toEqual(once);
  });
});

/**
 * The RAM ceiling when the browser refuses to say how much there is.
 *
 * `navigator.deviceMemory` is capped at 8GiB by specification, so a 16GB laptop
 * and a 256GB workstation report the identical number and 60% of it is 4.8GB on
 * both. Treating that as the machine's limit is treating a privacy measure as a
 * measurement — it is the difference between "we budgeted for your hardware" and
 * "we budgeted for the smallest hardware consistent with what we were told".
 *
 * The rule these pin down: the detected figure stays the *default*, and only what
 * the user can reach goes up.
 */
describe('a RAM ceiling that came from the browser cap', () => {
  const withDeviceMemory = <T,>(gib: number | undefined, fn: () => T): T => {
    const had = Object.prototype.hasOwnProperty.call(navigator, 'deviceMemory');
    const prev = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    Object.defineProperty(navigator, 'deviceMemory', { value: gib, configurable: true });
    try {
      return fn();
    } finally {
      if (had) Object.defineProperty(navigator, 'deviceMemory', { value: prev, configurable: true });
      else delete (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    }
  };

  it('is recognised as a cap, and opens headroom above itself', () => {
    const b = withDeviceMemory(8, () => detectBudgets(null));
    expect(b.ramCapped).toBe(true);
    expect(b.ramCeiling).toBeGreaterThan(b.ramMax);
    // 60% of 8GiB, which is the 4.8GB users see and ask about.
    expect(b.ramMax).toBeCloseTo(8 * 1024 ** 3 * 0.6, -6);
    expect(b.ramSource).toMatch(/clamp this figure at 8/);
  });

  it('but a figure below the cap is a real measurement, and stays the ceiling', () => {
    const b = withDeviceMemory(4, () => detectBudgets(null));
    expect(b.ramCapped).toBe(false);
    expect(b.ramCeiling).toBe(b.ramMax);
    expect(b.ramSource).not.toMatch(/clamp this figure/);
  });

  it('and a figure above it is a browser that is not clamping, so believe it', () => {
    // Not hypothetical: Playwright's bundled Chromium reports 32 on a 64GB
    // machine while Chrome reports 8. Testing `>= 8` — as the first version of
    // this did — labels that honest 32 as a cap and offers headroom above a
    // figure that needs none.
    const b = withDeviceMemory(32, () => detectBudgets(null));
    expect(b.ramCapped).toBe(false);
    expect(b.ramCeiling).toBe(b.ramMax);
    expect(b.ramMax).toBeCloseTo(Math.min(32 * 1024 ** 3 * 0.6, MAX_TAB_ARRAY_BYTES), -6);
  });

  it('still defaults to the detected figure rather than the headroom', () => {
    // The override changes what is reachable, not what is assumed. Defaulting to
    // the headroom would be asserting on the user's behalf that their machine has
    // memory nobody has measured.
    const b = withDeviceMemory(8, () => detectBudgets(null));
    expect(b.ram).toBe(b.ramMax);
    expect(b.ram).toBeLessThan(b.ramCeiling);
  });

  it('lets a deliberate override survive a re-clamp', () => {
    // The bug this prevents: the slider allows 12GB, the store re-clamps against
    // the *detected* 4.8GB, and the value springs back with no explanation.
    const b = withDeviceMemory(8, () => detectBudgets(null));
    const raised = clampBudgets({ ...b, ram: b.ramMax * 2 });
    expect(raised.ram).toBe(b.ramMax * 2);
    expect(clampBudgets(raised)).toEqual(raised);
  });

  it('and still refuses a request past the headroom', () => {
    // Opening the ceiling is not removing it: an unbounded slider would turn one
    // careless drag into an out-of-memory crash partway through a long load.
    const b = withDeviceMemory(8, () => detectBudgets(null));
    expect(clampBudgets({ ...b, ram: b.ramCeiling * 100 }).ram).toBe(b.ramCeiling);
  });

  /**
   * A load sized to land in the "tight" band, whatever the per-row cost is.
   *
   * Derived rather than hard-coded: a fixed row count is a bet on the column
   * costs never changing, and the first version of this test bet wrong — 62M rows
   * of bare xyz is 744MB, which fits comfortably, so it asserted on a message
   * that was never produced.
   */
  /** A load in the tight band, with the budget that puts it there. */
  const tightLoad = () => {
    const m = mapping({
      x: 'X',
      y: 'Y',
      z: 'Z',
      time: 't',
      personId: 'p',
      teamId: 'g',
      extra: ['a', 'b', 'c'],
    });
    // Rows first, under the sort ceiling, then the budget that this load fills to
    // 85% of — the other way round from before, and the change matters.
    //
    // Deriving the rows from the budget cannot work now that the sort has a
    // ceiling of its own: at a 4.8GB budget it asked for 53.7M rows, the ceiling
    // trimmed that to 48M, and 48M rows are only 62% of 4.8GB — so the verdict
    // came back "fits" and a test about the tight band never entered it.
    const rows = Math.floor(MAX_SORTABLE_ROWS * 0.6);
    const fp = estimateFootprint(m, rows);
    // A generous GPU figure, because RAM is the subject here.
    return { fp, ram: Math.floor(fp.peakBytes / 0.85), gpu: 512 * 1024 ** 3 };
  };

  it('is not consulted at all once the host has reported real memory', () => {
    // The whole point of asking the host: a 64GiB machine should get a budget
    // sized for 64GiB, not for the 8GiB the browser is willing to name. If the
    // capped figure still bound here, the endpoint would be decoration.
    const b = withDeviceMemory(8, () =>
      detectBudgets(null, { totalBytes: 64 * 1024 ** 3, freeBytes: 48 * 1024 ** 3, cpus: 16, platform: 'win32', vramBytes: null, vramSource: null }),
    );
    expect(b.ramCapped).toBe(false);
    expect(b.ramCeiling).toBe(b.ramMax);
    expect(b.ramMax).toBeGreaterThan(8 * 1024 ** 3);
    expect(b.ramSource).toMatch(/dev server/);
  });

  it('says the budget is a browser cap when a load comes out tight', () => {
    // Where it actually matters. "4.50 GB peak is close to the 4.80 GB budget"
    // gives no hint that the 4.80 is a privacy cap rather than this machine's
    // memory, so the reasonable reading is "my machine is nearly full" when the
    // truth is "the browser will not say".
    const b = withDeviceMemory(8, () => detectBudgets(null));
    const { fp, ram, gpu } = tightLoad();
    const fit = checkFit(fp, { ...b, ram, gpu });
    expect(fit.verdict).toBe('tight');
    expect(fit.messages.join(' ')).toMatch(/8GiB Chrome and Edge report as installed/);
  });

  it('and does not say it when the figure was real', () => {
    const b = withDeviceMemory(4, () => detectBudgets(null));
    const { fp, ram, gpu } = tightLoad();
    const fit = checkFit(fp, { ...b, ram, gpu });
    expect(fit.verdict).toBe('tight');
    expect(fit.messages.join(' ')).not.toMatch(/browser reports as installed/);
  });
});

/**
 * The GPU budget, which has no measurement behind it in the browser at all.
 *
 * `navigator.deviceMemory` is at least clamped; VRAM is simply absent from both
 * WebGL and WebGPU. The ceiling was therefore inferred from the largest texture
 * a context admits to — a signal that separates integrated from discrete and
 * stops — and defaulted to 2GB. That refused a 2.32GB load on a 16GB card while
 * the message underneath explained the *RAM* budget, which was not the blocker.
 */
describe('the GPU budget', () => {
  const gpuHost = (vramGiB: number | null) => ({
    totalBytes: 64 * 1024 ** 3,
    freeBytes: 40 * 1024 ** 3,
    vramBytes: vramGiB === null ? null : vramGiB * 1024 ** 3,
    vramSource: vramGiB === null ? null : 'nvidia-smi',
    cpus: 16,
    platform: 'win32',
  });

  it('uses the card the host measured, over any inference', () => {
    const inferred = detectBudgets({ maxTextureSize: 8192 });
    const measured = detectBudgets({ maxTextureSize: 8192 }, gpuHost(16));
    expect(measured.vramBytes).toBe(16 * 1024 ** 3);
    expect(measured.gpuMax).toBeCloseTo(16 * 1024 ** 3 * 0.7, -6);
    expect(measured.gpuMax).toBeGreaterThan(inferred.gpuMax * 8);
    expect(measured.gpuSource).toMatch(/on the card/);
  });

  it('leaves headroom below the card, for everything else on it', () => {
    // Row textures are not the only GPU allocation: the scene and depth targets,
    // the heat accumulator (four-channel float in team mode), the level geometry.
    const b = detectBudgets(null, gpuHost(16));
    expect(b.gpuMax).toBeLessThan(16 * 1024 ** 3);
    expect(b.gpuCeiling).toBeLessThan(16 * 1024 ** 3);
    expect(b.gpuCeiling).toBeGreaterThan(b.gpuMax);
  });

  it('opens the ceiling well above an inferred figure', () => {
    // The user's case: 2GB inferred, 16GB actually there. A hard stop at the
    // inference is a stop at a number with no relation to the hardware.
    const b = detectBudgets(null);
    expect(b.gpuMax).toBe(2 * 1024 ** 3);
    expect(b.gpuCeiling).toBeGreaterThanOrEqual(16 * 1024 ** 3);
    expect(clampBudgets({ ...b, gpu: 16 * 1024 ** 3 }).gpu).toBe(16 * 1024 ** 3);
  });

  it('but not above a measured one', () => {
    // Once the card is known, its memory is a real bound and the slider stops
    // inside it — asking for 40GB of a 16GB card is a crash, not a preference.
    const b = detectBudgets(null, gpuHost(16));
    expect(clampBudgets({ ...b, gpu: 40 * 1024 ** 3 }).gpu).toBe(b.gpuCeiling);
    expect(b.gpuCeiling).toBeLessThan(16 * 1024 ** 3);
  });

  it('explains the GPU, not the RAM, when the GPU is what refused the load', () => {
    // The misleading message this replaces: a 2GB GPU ceiling rejected the load
    // and the paragraph underneath discussed 63GB of system memory and which
    // programs to close. Someone following it would free memory that was never
    // short and try again to the same refusal.
    const b = detectBudgets(null, {
      ...gpuHost(null),
      freeBytes: 24 * 1024 ** 3,
    });
    const m = mapping({ x: 'X', y: 'Y', z: 'Z', time: 't', personId: 'p' });
    // Enough rows to blow the GPU ceiling while staying inside both the RAM
    // budget and the sort ceiling, so that "gpu" is unambiguously the reason.
    // 207M rows — the count from the original report — is now past
    // MAX_SORTABLE_ROWS and would be refused for that instead, which is correct
    // behaviour and a different test.
    const fp = estimateFootprint(m, 50_000_000);
    const fit = checkFit(fp, { ...b, gpu: 512 * 1024 ** 2 });
    expect(fit.verdict).toBe('too-big');
    expect(fit.limitedBy).toBe('gpu');
    const text = fit.messages.join(' ');
    expect(text).toMatch(/No API reports how much memory a GPU has/);
    expect(text).not.toMatch(/free right now/);
    expect(text).not.toMatch(/Closing other programs/);
  });
});

/**
 * The row ceiling the sort imposes, checked before the load rather than during it.
 *
 * The renderer needs rows ascending in time, so a mapped time column means a
 * permutation over every row, and past `MAX_SORTABLE_ROWS` that is not something
 * to attempt in a tab. The check existed — inside the sort itself, which runs
 * after every file has been read. A 207M-row selection was therefore read in
 * full, ten gigabytes and minutes of work, and refused at the last step with the
 * progress line still reading "Sorting by time". These make the refusal arrive
 * next to the Load button instead.
 */
describe('the sort ceiling', () => {
  const timed = (rows: number) =>
    estimateFootprint(mapping({ x: 'X', y: 'Y', z: 'Z', time: 't', personId: 'p' }), rows);
  const roomy = { ...detectBudgets(null), ram: 512 * 1024 ** 3, gpu: 512 * 1024 ** 3 };

  it('refuses more rows than can be put in time order, whatever the memory', () => {
    // Explicitly with budgets far larger than the load needs: this is not a
    // memory limit and must not be reported as one.
    const fit = checkFit(timed(MAX_SORTABLE_ROWS * 3), roomy);
    expect(fit.verdict).toBe('too-big');
    expect(fit.limitedBy).toBe('sort');
    expect(fit.messages.join(' ')).toContain(`past the ${int(MAX_SORTABLE_ROWS)}`);
    expect(fit.messages.join(' ')).toMatch(/Memory is not the constraint/);
  });

  it('and suggests a stride that brings it under the ceiling', () => {
    const fp = timed(MAX_SORTABLE_ROWS * 3);
    const fit = checkFit(fp, roomy);
    expect(fit.suggestedStride).toBeGreaterThan(1);
    // The suggestion has to actually work, which is the part worth asserting: a
    // stride that still leaves the load over the ceiling is not a suggestion.
    const strided = timed(Math.floor(fp.rows / fit.suggestedStride));
    expect(checkFit(strided, roomy).verdict).not.toBe('too-big');
  });

  it('says nothing about memory when the sort is the reason', () => {
    // The mistake this guards: appending the RAM explanation to a refusal that
    // has nothing to do with RAM, which sent someone closing programs to free
    // memory that was never short.
    const text = checkFit(timed(MAX_SORTABLE_ROWS * 3), roomy).messages.join(' ');
    expect(text).not.toMatch(/free right now/);
    expect(text).not.toMatch(/Closing other programs/);
    expect(text).not.toMatch(/Chrome and Edge/);
  });

  it('offers unmapping the time column, which removes the limit outright', () => {
    // True rather than merely encouraging: without a time column there is no
    // permutation, so the ceiling does not apply at all.
    const fit = checkFit(timed(MAX_SORTABLE_ROWS * 3), roomy);
    expect(fit.messages.join(' ')).toMatch(/Unmapping the time column/);
    const untimed = estimateFootprint(
      mapping({ x: 'X', y: 'Y', z: 'Z' }),
      MAX_SORTABLE_ROWS * 3,
    );
    expect(untimed.sorts).toBe(false);
    expect(checkFit(untimed, roomy).verdict).toBe('fits');
  });

  it('warns while still inside the ceiling, because the pass is slow and silent', () => {
    const fit = checkFit(timed(Math.floor(MAX_SORTABLE_ROWS * 0.9)), roomy);
    expect(fit.verdict).toBe('tight');
    expect(fit.messages.join(' ')).toContain(`near the ${int(MAX_SORTABLE_ROWS)}`);
  });

  it('leaves a comfortable load alone', () => {
    expect(checkFit(timed(1_000_000), roomy).verdict).toBe('fits');
  });
});

/**
 * A budget taken from the machine instead of inferred about it.
 *
 * The dev server can read `os.totalmem()` and `os.freemem()`, which the page
 * cannot, so it reports them and these pin down what is done with them. The rule
 * they enforce is that *free* memory can only ever lower the figure: a budget
 * proportional to installed RAM is a promise about hardware, and on a machine
 * whose RAM is currently spoken for it is a promise the OS cannot keep.
 */
describe('a RAM budget from the host', () => {
  const host = (totalGiB: number, freeGiB: number | null) => ({
    totalBytes: totalGiB * 1024 ** 3,
    freeBytes: freeGiB === null ? null : freeGiB * 1024 ** 3,
    cpus: 16,
    platform: 'win32',
    vramBytes: null,
    vramSource: null,
  });

  it('scales with installed memory, well past the browser cap', () => {
    const small = detectBudgets(null, host(16, 14));
    const large = detectBudgets(null, host(256, 200));
    // Scaling holds until the tab's own wall, which is where it must stop: a
    // 256GiB machine cannot spend 153GB in a renderer that tops out near 12.
    expect(large.ramMax).toBeGreaterThan(small.ramMax);
    expect(large.ramMax).toBe(MAX_TAB_ARRAY_BYTES);
    // And both are above the 4.8GB the capped heuristic produces, which is the
    // number that prompted all of this.
    for (const b of [small, large]) expect(b.ramMax).toBeGreaterThan(4.8 * 1024 ** 3);
  });

  it('is held down by free memory when free memory is the smaller figure', () => {
    // 64GiB installed but only 4GiB free: 60% of installed would be 38GiB, which
    // does not exist right now. Budgeting it means an out-of-memory crash partway
    // through a load, which is the one failure this whole module exists to avoid.
    const b = detectBudgets(null, host(64, 4));
    expect(b.ramMax).toBeLessThan(4 * 1024 ** 3);
    expect(b.ramSource).toMatch(/of free/);
  });

  it('but free memory decides the default, never the maximum', () => {
    // The complaint this answers: 64GB installed, 24GB free, and the app offers
    // 19GB with no way past it. Free memory is a snapshot — closing an editor
    // changes it — so pinning the ceiling there refuses a figure the hardware
    // plainly supports. The default stays conservative; the ceiling does not.
    // 16GiB installed with 6 free, deliberately: on the 64/24 machine that
    // prompted this both figures now land on the tab's 12GB wall and collapse
    // into each other, which would make the test pass while checking nothing.
    // Under the wall the two shares stay distinct and the rule is visible.
    const b = detectBudgets(null, host(16, 6));
    expect(b.ramMax).toBeCloseTo(6 * 1024 ** 3 * 0.8, -6);
    expect(b.ramCeiling).toBeCloseTo(16 * 1024 ** 3 * 0.6, -6);
    expect(b.ramCeiling).toBeGreaterThan(b.ramMax);
    // And raising it by hand has to stick.
    expect(clampBudgets({ ...b, ram: b.ramCeiling }).ram).toBe(b.ramCeiling);
  });

  it('and the ceiling stops at the hardware share, not above it', () => {
    // Opening the ceiling is not removing it: 60% of installed leaves the browser,
    // the decoder and the OS the rest. Asking for 64GB of a 64GB machine is not a
    // preference, it is a crash.
    const b = detectBudgets(null, host(64, 24));
    expect(clampBudgets({ ...b, ram: 64 * 1024 ** 3 }).ram).toBeCloseTo(
      Math.min(64 * 1024 ** 3 * 0.6, MAX_TAB_ARRAY_BYTES),
      -6,
    );
  });

  it('leaves no headroom when free memory is not the binding figure', () => {
    // A machine with almost everything free is already budgeted at its hardware
    // share, so there is nothing to raise and the panel must not offer a slider
    // range that does nothing.
    const b = detectBudgets(null, host(32, 31));
    expect(b.ramCeiling).toBe(b.ramMax);
  });

  it('reports the raw figures so the panel can explain the gap', () => {
    // Without these the hint can say "held down by free memory" but not "40GB of
    // your 64GB is in use", which is the half that answers the question.
    const b = detectBudgets(null, host(64, 24));
    expect(b.ramTotalBytes).toBe(64 * 1024 ** 3);
    expect(b.ramFreeBytes).toBe(24 * 1024 ** 3);
    const none = detectBudgets(null);
    expect(none.ramTotalBytes).toBeNull();
    expect(none.ramFreeBytes).toBeNull();
  });

  it('says why the budget is low when a load comes out tight', () => {
    // 16GiB with 6 free, for the same reason as the test above: on a 64/24 machine
    // both shares now land on the tab's 12GB wall, and the note only appears when
    // the ceiling is genuinely above the default.
    const b = detectBudgets(null, host(16, 6));
    const m = mapping({ x: 'X', y: 'Y', z: 'Z', time: 't', personId: 'p' });
    // Rows chosen under the sort ceiling, then a RAM budget this load fills to
    // 85% of. Deriving the rows from the 19GB budget instead asks for 250M of
    // them, which is past what can be sorted — so the verdict is "too-big" for
    // that reason and the RAM message under test never appears.
    const fp = estimateFootprint(m, Math.floor(MAX_SORTABLE_ROWS * 0.6));
    // Generous GPU, because RAM has to be the binding budget here.
    const fit = checkFit(fp, {
      ...b,
      ram: Math.floor(fp.peakBytes / 0.85),
      gpu: 512 * 1024 ** 3,
    });
    expect(fit.verdict).toBe('tight');
    const text = fit.messages.join(' ');
    expect(text).toMatch(/free right now/);
    // And the concrete numbers, not just the explanation.
    expect(text).toMatch(/16\.00 GB installed/);
    expect(text).toMatch(/in use/);
  });

  it('and by installed memory when free memory is the larger figure', () => {
    // A freshly booted machine reports nearly all of its RAM free, and taking 80%
    // of that would leave the browser, the decoder and the OS sharing the rest.
    const b = detectBudgets(null, host(32, 31));
    expect(b.ramMax).toBeCloseTo(Math.min(32 * 1024 ** 3 * 0.6, MAX_TAB_ARRAY_BYTES), -6);
    expect(b.ramSource).toMatch(/of installed/);
  });

  it('works with total alone when free memory is unavailable', () => {
    const b = detectBudgets(null, host(32, null));
    expect(b.ramMax).toBeCloseTo(Math.min(32 * 1024 ** 3 * 0.6, MAX_TAB_ARRAY_BYTES), -6);
    expect(b.ramCapped).toBe(false);
  });

  it('never offers more than one tab can allocate, whatever the machine has', () => {
    /**
     * The wall that free memory alone could not find.
     *
     * Chrome keeps `ArrayBuffer` backing stores in V8's sandbox, a fixed
     * reservation per renderer, so the limit belongs to the browser and not to the
     * hardware — measured at 15.75GB in an idle page by
     * `probe-alloc-ceiling.mjs`. Before this cap the host reported 24GB free, 80%
     * of it came to 19GB, and the panel offered a figure no tab can reach: the
     * numbers on screen had left the realm of the possible before anyone pressed
     * Load.
     */
    for (const gib of [64, 256, 1024]) {
      const b = detectBudgets(null, host(gib, gib - 4));
      expect(b.ramMax, `${gib}GiB installed`).toBeLessThanOrEqual(MAX_TAB_ARRAY_BYTES);
      expect(b.ramCeiling, `${gib}GiB ceiling`).toBeLessThanOrEqual(MAX_TAB_ARRAY_BYTES);
      // And the slider cannot be dragged past it either.
      expect(clampBudgets({ ...b, ram: 512 * 1024 ** 3 }).ram).toBeLessThanOrEqual(
        MAX_TAB_ARRAY_BYTES,
      );
    }
    // Said out loud, because a budget silently smaller than the machine's memory
    // is the thing that took three rounds to explain.
    expect(detectBudgets(null, host(256, 200)).ramSource).toMatch(/most one tab can allocate/);
  });

  it('leaves a machine below the wall untouched', () => {
    // The cap must not become a floor: an 8GiB machine is limited by its own
    // memory, and clamping it to 12GB would be inventing memory.
    const b = detectBudgets(null, host(8, 7));
    expect(b.ramMax).toBeLessThan(MAX_TAB_ARRAY_BYTES);
    expect(b.ramSource).not.toMatch(/most one tab can allocate/);
  });

  it('never drops below the usable floor, however little is free', () => {
    // A machine with nothing free would otherwise produce a budget that refuses
    // every dataset, including ones that would in fact load.
    const b = detectBudgets(null, host(64, 0));
    expect(b.ramMax).toBe(MIN_RAM_BUDGET);
  });

  it('ignores a nonsensical reading rather than budgeting from it', () => {
    // Free above total is not a reading, it is a bug somewhere upstream.
    const b = detectBudgets(null, { totalBytes: 8 * 1024 ** 3, freeBytes: 99 * 1024 ** 3, cpus: 8, platform: 'linux', vramBytes: null, vramSource: null });
    expect(b.ramMax).toBeLessThanOrEqual(8 * 1024 ** 3);
  });

  it('lets a big load fit that the capped guess would have strided', () => {
    // The user-visible point of the change, stated as a test: the same 62M-row
    // job, on the same machine, under the two ways of asking.
    const m = mapping({
      x: 'X',
      y: 'Y',
      z: 'Z',
      time: 't',
      personId: 'p',
      teamId: 'g',
      extra: ['a', 'b', 'c'],
    });
    // 55M rows: enough that 4.8GB is no longer comfortable — the point of the
    // comparison — while staying under 70% of the sort ceiling so the sort is not
    // what decides either verdict. 62M, the original figure, is 78% of that
    // ceiling and would make both sides "tight" regardless of memory.
    const fp = estimateFootprint(m, 55_000_000);
    const capped = detectBudgets(null);
    const real = detectBudgets(null, host(64, 40));
    expect(checkFit(fp, { ...capped, ram: 4.8 * 1024 ** 3 }).verdict).not.toBe('fits');
    expect(checkFit(fp, { ...real, gpu: 512 * 1024 ** 3 }).verdict).toBe('fits');
  });
});

describe('difference mode on a column split', () => {
  const files: AttributeColumn = {
    name: 'Source file',
    kind: 'category',
    data: new Uint32Array([0, 1]),
    min: 0,
    max: 1,
    categories: ['first.csv', 'second.csv'],
  };
  const speed: AttributeColumn = { name: 'speed', kind: 'number', data: new Float32Array([1, 9]), min: 1, max: 9 };
  const noGroups = dataset({ attrs: [speed, files] });

  it('opens difference mode without groups when the split has two sides', () => {
    const cap = datasetCapabilities(noGroups);
    const rule: SplitRule = { kind: 'categories', column: 'Source file', positive: [0], negative: [1] };
    expect(splitHasTwoSides(rule, noGroups)).toBe(true);
    expect(modeBlockedReason('heat-difference', cap, splitHasTwoSides(rule, noGroups))).toBeNull();
    // Without it the mode stays blocked, as before.
    expect(modeBlockedReason('heat-difference', cap, false)).toMatch(/group/i);
  });

  it('does not count a split with one side, groups, or a missing column', () => {
    expect(splitHasTwoSides({ kind: 'categories', column: 'Source file', positive: [0], negative: [] }, noGroups)).toBe(false);
    expect(splitHasTwoSides({ kind: 'categories', column: 'Source file', positive: [0], negative: [7] }, noGroups)).toBe(false);
    expect(splitHasTwoSides({ kind: 'teams' }, noGroups)).toBe(false);
    expect(splitHasTwoSides({ kind: 'range', column: 'gone', positive: [0, 1], negative: [1, 2] }, noGroups)).toBe(false);
    expect(splitHasTwoSides({ kind: 'range', column: 'speed', positive: [1, 5], negative: [5, 9] }, noGroups)).toBe(true);
  });

  it('picks the file of origin for data without groups, and nothing when no column can split', () => {
    expect(defaultColumnSplit(noGroups)).toEqual({
      kind: 'categories',
      column: 'Source file',
      positive: [0],
      negative: [1],
    });
    expect(defaultColumnSplit(dataset())).toBeNull();
  });

  it('gives a load without groups a column split, so the mode is reachable', () => {
    useStore.getState().setDataset(noGroups);
    const st = useStore.getState();
    expect(st.split).toEqual({ kind: 'categories', column: 'Source file', positive: [0], negative: [1] });
    expect(modeBlockedReason('heat-difference', datasetCapabilities(st.dataset), splitHasTwoSides(st.split, st.dataset))).toBeNull();
    useStore.getState().setDataset(null);
  });
});

describe('the default split of a category column', () => {
  // Dictionary-encoded columns keep the empty string as their first value
  // whether or not any row is empty. A default putting it on one side left that
  // side empty, and the toggles made the real comparison easy to lose.
  const events: AttributeColumn = {
    name: 'event',
    kind: 'category',
    data: new Uint32Array([2, 2, 2, 1, 2, 1]),
    min: 0,
    max: 2,
    categories: ['', 'killed', 'killer'],
  };

  it('counts rows per value', () => {
    expect([...categoryRowCounts(events)!]).toEqual([0, 2, 4]);
    expect(categoryRowCounts({ ...events, data: new Uint32Array(0) })).toBeNull();
  });

  it('puts the first two values rows actually have on the two sides', () => {
    expect(defaultSplitRule(events)).toEqual({ kind: 'categories', column: 'event', positive: [1], negative: [2] });
  });

  it('falls back to the first two values when the rows are not at hand', () => {
    expect(defaultSplitRule({ ...events, data: new Uint32Array(0) })).toEqual({
      kind: 'categories',
      column: 'event',
      positive: [0],
      negative: [1],
    });
  });
});

describe('validateMapping — an unusable time column', () => {
  it('refuses a text time column read as a number', () => {
    // 'Name' holds text in the sample; read as seconds it is NaN on every row.
    const v = validateMapping(mapping({ x: 'X', y: 'Y', time: 'Name', timeUnit: 'seconds' }), preview());
    expect(v.ok).toBe(false);
    expect(v.errors.join(' ')).toMatch(/Name/);
  });

  it('accepts ISO-8601 text read as ISO-8601, and refuses text that is no date', () => {
    const iso = preview({
      columns: ['X', 'Y', 'when'],
      rows: [['1', '2', '2025-01-01T00:00:00Z']],
      numeric: [true, true, false],
    });
    expect(validateMapping(mapping({ x: 'X', y: 'Y', time: 'when', timeUnit: 'iso8601' }), iso).ok).toBe(true);
    const words = preview({ columns: ['X', 'Y', 'when'], rows: [['1', '2', 'soon']], numeric: [true, true, false] });
    expect(validateMapping(mapping({ x: 'X', y: 'Y', time: 'when', timeUnit: 'iso8601' }), words).ok).toBe(false);
  });
});
