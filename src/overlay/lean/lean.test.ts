import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../../state/types';
import { gpuTrackStore, TRACK_U32, FLAG_WEAPON } from '../../render/gpuTracks/store';
import { emptyPose, evaluateTrack } from '../../render/gpuTracks/evaluate';
import { KEY_LEVELS, scanPass1, scanPass2, specColumns, type Columns, type LeanSpec } from './scan';
import { LeanAssembler, planJobs, type LeanBuilt } from './assemble';
import { leanSpec } from './spec';
import { leanBudget, leanStore } from './load';

/** A file's rows: aircraft circling and tanks driving, in two matches, with shots and deaths among them, in time order. */
function rows(opts: { matches?: number; units?: number; seconds?: number; hz?: number } = {}) {
  const { matches = 2, units = 6, seconds = 60, hz = 4 } = opts;
  const r: Record<string, unknown>[] = [];
  for (let m = 0; m < matches; m++) {
    const start = 1000 + 37 * m;
    for (let u = 0; u < units; u++) {
      const air = u % 2 === 0;
      const R = 600 + 41 * u;
      const v = air ? 120 : 8;
      const t0 = start + (u % 3) * 0.75;
      for (let t = 0; t <= seconds; t += 1 / hz) {
        const a = (v * t) / R;
        const x = R * Math.sin(a) + 300 * u;
        const z = R * (1 - Math.cos(a)) + 2000 * m;
        const y = air ? 1500 + 20 * Math.sin(t / 3) : 40;
        // The way it goes, in the file's own frame.
        const dx = Math.cos(a), dz = Math.sin(a);
        r.push({ time: t0 + t, event: 'position', track: `u${u} #1`, match: `m${m}`, team: String(1 + (u % 2)), kind: air ? 'aircraft' : 'tank', Vehicle: air ? 'la-7' : 't-34-85', x, y, z, dirX: dx, dirY: 0, dirZ: dz, roll: air ? 25 : 0 });
        if (Math.abs(t - 20) < 1e-9) r.push({ time: t0 + t, event: 'shot', track: `u${u} #1`, match: `m${m}`, team: '1', kind: 'tank', Vehicle: 'x', x: x + 900, y, z, dirX: 0, dirY: 0, dirZ: 1, roll: 0 });
      }
      if (u === 1) r.push({ time: t0 + seconds, event: 'death', track: `u${u} #1`, match: `m${m}`, team: '2', kind: 'tank', Vehicle: 't-34-85', x: 5, y: 40, z: 7, dirX: 1, dirY: 0, dirZ: 0, roll: 0 });
    }
    // A missile in flight: its own track.
    for (let t = 0; t <= 6; t += 0.1) r.push({ time: start + 10 + t, event: 'position', track: `m #9`, match: `m${m}`, team: '1', kind: 'missile', Vehicle: 'aim-9b', x: 100 + 600 * t, y: 1500, z: 50, dirX: 1, dirY: 0, dirZ: 0, roll: 0 });
  }
  r.sort((a, b) => (a.time as number) - (b.time as number));
  return r;
}

const COLS = ['time', 'event', 'track', 'match', 'team', 'kind', 'Vehicle', 'x', 'y', 'z', 'dirX', 'dirY', 'dirZ', 'roll'];
const NUM = new Set(['time', 'x', 'y', 'z', 'dirX', 'dirY', 'dirZ', 'roll']);

function columns(r: Record<string, unknown>[]): Columns {
  const out: Columns = {};
  for (const c of COLS) out[c] = NUM.has(c) ? Float64Array.from(r, (x) => x[c] as number) : r.map((x) => x[c]);
  return out;
}

const HINTS = JSON.stringify({
  axes: { up: 'y', flipX: false, flipY: false, flipZ: true, scale: 1 },
  columns: { x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'seconds', personId: 'track', teamId: 'team', sessionId: 'match', lookMode: 'vector', dirX: 'dirX', dirY: 'dirY', dirZ: 'dirZ', extra: ['event', 'kind', 'Vehicle', 'roll'] },
});

function spec(r: Record<string, unknown>[]): LeanSpec {
  const res = leanSpec({ columns: COLS, rows: r.slice(0, 50).map((x) => COLS.map((c) => String(x[c]))), numeric: COLS.map((c) => NUM.has(c)), hints: HINTS, timestamps: [] });
  if (!res.ok) throw new Error(res.reason);
  return res.spec;
}

function slice(c: Columns, a: number, b: number): Columns {
  const out: Columns = {};
  for (const [k, v] of Object.entries(c)) out[k] = v instanceof Float64Array ? v.subarray(a, b) : (v as unknown[]).slice(a, b);
  return out;
}

/** The whole load, inline: the rows as row groups of `group` rows, both passes, assembled. */
function load(r: Record<string, unknown>[], maxKeys = 1e9, group = 1e9, totals?: (keys: number[]) => void): LeanBuilt {
  const s = spec(r);
  const c = columns(r);
  const groups: number[] = [];
  for (let i = 0; i < r.length; i += group) groups.push(Math.min(group, r.length - i));
  const files = [{ name: 'one.parquet', rowGroups: groups }];
  const jobs = planJobs(files, group);
  const asm = new LeanAssembler(files, jobs, s, r.length > maxKeys);
  jobs.forEach((j, k) => asm.addPass1(k, scanPass1(slice(c, j.rowStart, j.rowEnd), j.rowEnd - j.rowStart, s, j.rowStart, asm.levels)));
  totals?.(asm.totals().keys);
  if (!asm.plan(maxKeys)) throw new Error('too big');
  jobs.forEach((j, k) => {
    const inp = asm.pass2Input(k);
    asm.addPass2(k, scanPass2(slice(c, j.rowStart, j.rowEnd), j.rowEnd - j.rowStart, s, inp.spans, inp.alloc, inp.level));
  });
  return asm.finish('test');
}

/** The same rows through the generic route: a dataset as the generic loader makes it (flipZ, yaw and pitch from the vector). */
function generic(r: Record<string, unknown>[]): { d: Dataset; min: number } {
  const own = r.filter((x) => x.event === 'position' || x.event === 'shot' || x.event === 'death');
  const n = own.length;
  const min = Math.min(...own.map((x) => x.time as number));
  const persons: string[] = [];
  const pid = own.map((x) => {
    const k = `${x.track} · ${x.match}`;
    let i = persons.indexOf(k);
    if (i < 0) i = persons.push(k) - 1;
    return i;
  });
  const cat = (name: string, values: string[]): AttributeColumn => {
    const labels = [...new Set(values)];
    return { name, kind: 'category', data: Uint32Array.from(values.map((v) => labels.indexOf(v))), min: 0, max: labels.length - 1, categories: labels };
  };
  const d = {
    id: 'g',
    name: 'g',
    count: n,
    px: Float32Array.from(own, (x) => x.x as number),
    py: Float32Array.from(own, (x) => x.y as number),
    pz: Float32Array.from(own, (x) => -(x.z as number)),
    time: Float32Array.from(own, (x) => (x.time as number) - min),
    personId: Uint32Array.from(pid),
    personLabels: persons,
    personShared: null,
    personTeam: new Uint16Array(persons.length),
    personSlot: null,
    teamSizes: null,
    sessionId: null,
    lifetime: null,
    yaw: Float32Array.from(own, (x) => Math.atan2(x.dirX as number, (x.dirZ as number))),
    pitch: new Float32Array(n),
    bounds: { minX: -1e5, minY: 0, minZ: -1e5, maxX: 1e5, maxY: 1e4, maxZ: 1e5 },
    timeRange: [0, 100],
    attrs: [cat('event', own.map((x) => x.event as string)), cat('Vehicle', own.map((x) => x.Vehicle as string)), cat('kind', own.map((x) => x.kind as string)), { name: 'roll', kind: 'number', data: Float32Array.from(own, (x) => x.roll as number), min: 0, max: 1 } as AttributeColumn],
  } as unknown as Dataset;
  return { d, min };
}

describe('lean overlay loader', () => {
  it('reads the generic loader’s roles from the file’s hints', () => {
    const s = spec(rows());
    expect(s.track).toBe('track');
    expect(s.match).toBe('match');
    expect(s.team).toBe('team');
    expect(s.event).toBe('event');
    expect(s.look).toBe('vector');
    expect(s.roll).toBe('roll');
    expect(s.axes.flipZ).toBe(true);
    expect(s.meta).toEqual(expect.arrayContaining(['kind', 'Vehicle']));
    expect(specColumns(s, 1)).not.toContain('dirX');
    expect(specColumns(s, 2)).toContain('dirX');
  });

  it('keeps every sample when it fits, one track a unit of a match, and puts them where the generic route does', () => {
    const r = rows();
    const b = load(r);
    // 2 matches x (6 units + 1 missile).
    expect(b.tracks).toBe(14);
    expect(b.level).toBe(0);
    const positions = r.filter((x) => x.event === 'position').length;
    expect(b.samples).toBe(positions);
    expect(b.keys).toBe(positions);
    expect(b.dataset.personLabels.length).toBe(14);
    const store = leanStore(b, 'team');
    const { d, min } = generic(r.filter((x) => x.match === 'm0'));
    const g = gpuTrackStore(d, { maxKeys: 1e9 })!;
    const a = emptyPose();
    const c = emptyPose();
    let worst = 0;
    let worstF = 0;
    let n = 0;
    for (let i = 0; i < store.tracks; i++) {
      const label = b.dataset.personLabels[store.personOf[i]];
      if (!label.endsWith('· m0')) continue;
      const gi = g.trackOf[d.personLabels.indexOf(label)];
      expect(gi).toBeGreaterThanOrEqual(0);
      const grp = b.trackGroup[i];
      const off = b.groupStart[grp] + b.origin;
      for (let tf = min + 1; tf < min + 59; tf += 0.37) {
        const okA = evaluateTrack(store, i, tf - off, 2, a);
        const okC = evaluateTrack(g, gi, tf - min, 2, c);
        expect(okA).toBe(okC);
        if (!okA) continue;
        n++;
        worst = Math.max(worst, Math.hypot(a.x - c.x, a.y - c.y, a.z - c.z));
        worstF = Math.max(worstF, Math.acos(Math.min(1, a.f[0] * c.f[0] + a.f[1] * c.f[1] + a.f[2] * c.f[2])));
      }
    }
    expect(n).toBeGreaterThan(500);
    // Both quantise to 16 bits of each track's span: within a few of those steps.
    expect(worst).toBeLessThan(0.15);
    expect(worstF).toBeLessThan(0.02);
  });

  it('lays out the same keys whether a file is one job or many', () => {
    const r = rows();
    const one = load(r);
    const many = load(r, 1e9, 397);
    expect(many.keys).toBe(one.keys);
    expect(Array.from(many.keysA)).toEqual(Array.from(one.keysA));
    expect(Array.from(many.keysB)).toEqual(Array.from(one.keysB));
    expect(Array.from(many.trackData)).toEqual(Array.from(one.trackData));
  });

  it('thins only when the keys would not fit, to the least tolerance that fits, and stays near the full curve', () => {
    const r = rows({ units: 8, hz: 10 });
    const full = load(r);
    const cap = Math.floor(full.keys / 4);
    let ladder: number[] = [];
    const thin = load(r, cap, 2000, (k) => (ladder = k));
    expect(thin.level).toBeGreaterThan(0);
    expect(thin.keys).toBeLessThanOrEqual(cap);
    // Not more than needed: the level below would not have fitted.
    expect(ladder[thin.level - 1]).toBeGreaterThan(cap);
    // Every level thins at least as much as the one before.
    for (let l = 1; l < ladder.length; l++) expect(ladder[l]).toBeLessThanOrEqual(ladder[l - 1]);
    const sf = leanStore(full, 'team');
    const st = leanStore(thin, 'team');
    const a = emptyPose();
    const c = emptyPose();
    let worst = 0;
    for (let i = 0; i < st.tracks; i++) {
      for (let t = 1; t < 60; t += 0.23) {
        if (!evaluateTrack(st, i, t, 2, a) || !evaluateTrack(sf, i, t, 2, c)) continue;
        worst = Math.max(worst, Math.hypot(a.x - c.x, a.y - c.y, a.z - c.z));
      }
    }
    expect(worst).toBeLessThan(4 * thin.tolerance + 1);
    expect(KEY_LEVELS[thin.level]).toBe(thin.tolerance);
  });

  it('writes in pass 2 exactly what pass 1 counted', () => {
    const r = rows({ units: 5, hz: 10 });
    const s = spec(r);
    const c = columns(r);
    const levels = KEY_LEVELS.map((_, i) => i);
    const p1 = scanPass1(c, r.length, s, 0, levels);
    for (const level of [0, 3, 7]) {
      const alloc = Uint32Array.from({ length: p1.units }, (_, u) => p1.keys[u * levels.length + level]);
      const spans = new Float64Array(p1.units * 6);
      for (let u = 0; u < p1.units; u++) {
        const o = u * 8;
        spans.set([p1.box[o], p1.box[o + 1], p1.box[o + 2], Math.max(p1.box[o + 3] - p1.box[o], p1.box[o + 4] - p1.box[o + 1], p1.box[o + 5] - p1.box[o + 2]) / 65535, p1.box[o + 6], (p1.box[o + 7] - p1.box[o + 6]) / 65535], u * 6);
      }
      const p2 = scanPass2(c, r.length, s, spans, alloc, level);
      expect(Array.from(p2.used)).toEqual(Array.from(alloc));
    }
  });

  it('starts each match at its own zero, keeps deaths as markers, and knows a missile for a weapon', () => {
    const r = rows();
    const b = load(r);
    // Each match's units start within a second of its first row (the missile ten seconds in).
    for (let i = 0; i < b.tracks; i++) if (!b.dataset.personLabels[i].startsWith('m #9')) expect(new Float32Array(b.trackData.buffer)[i * TRACK_U32 + 12]).toBeLessThan(1.6);
    expect(b.markers.count).toBe(2);
    expect(b.markers.data[3]).toBeGreaterThan(59);
    expect(b.markers.data[3]).toBeLessThan(62);
    const store = leanStore(b, 'team');
    const missile = b.dataset.personLabels.findIndex((l) => l.startsWith('m #9'));
    expect(store.trackData[missile * TRACK_U32 + 5] & FLAG_WEAPON).toBeTruthy();
    const tank = b.dataset.personLabels.findIndex((l) => l.startsWith('u1 #1'));
    expect(store.trackData[tank * TRACK_U32 + 5] & FLAG_WEAPON).toBe(0);
    // Its row in the standing-in dataset says what it is.
    const kind = b.dataset.attrs.find((a) => a.name === 'kind')!;
    expect(kind.categories![(kind.data as Uint32Array)[b.trackRow[tank]]]).toBe('tank');
  });

  it('sizes the load by the GPU buffer, its memory and the machine', () => {
    const b = leanBudget({ gpuMaxBufferBytes: 4e9, vramBytes: 16e9, freeBytes: 30e9, totalBytes: 64e9, deviceMemoryGB: 8 });
    expect(b.maxKeys).toBe(Math.floor(4e9 / 8));
    expect(b.limit).toBe('gpuBuffer');
    const small = leanBudget({ gpuMaxBufferBytes: 4e9, vramBytes: null, freeBytes: null, totalBytes: null, deviceMemoryGB: 8 });
    expect(small.limit).toBe('ram');
    expect(small.maxKeys).toBe(Math.floor(2e9 / 12));
  });
});
