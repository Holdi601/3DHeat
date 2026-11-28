/**
 * The GPU tracks' shared vectors (`native/vectors/tracks`): synthetic rows and
 * the keys the page's store builds of them, written down so the native core's
 * port (`native/crates/core/tests/track_vectors.rs`) is held to the same
 * numbers on the same rows.
 *
 *   UPDATE_VECTORS=1 npx vitest run src/render/gpuTracks/coreKeys.test.ts
 *
 * rewrites them after a deliberate change to the store's keys; without it the
 * test checks the page still builds exactly what the files say. Everything in
 * them is made up here.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../../state/types';
import { FLAG_GAPS, gpuTrackStore, TRACK_U32, type GpuTrackStore } from './store';
import { coreTracksRequest, coreTrackTable, CORE_HEAD_U32, parseCoreKeys, PERSON_U32 } from './coreKeys';

const dir = join(__dirname, '..', '..', '..', 'native', 'vectors', 'tracks');
const update = !!process.env.UPDATE_VECTORS;

/** A deterministic generator, so the vectors never change unless this file does. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface Row {
  p: number;
  t: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  ev: number;
}

const PERSONS = 18;
const SHARED = 10;

/**
 * Rows of every kind the keys care about: long circling flights (many chunks, attitudes), held
 * samples, doubled times, a gap, rows with no position, a shared name, a person with no rows and
 * one with a single row, shots and impacts (not own positions), NaN pitch and roll, a parked unit
 * sampled seldom, a theatre far from the origin, a slow walker.
 */
function rows(): Row[] {
  const r = rng(7);
  const out: Row[] = [];
  const put = (p: number, t: number, x: number, y: number, z: number, yaw = 0, pitch = 0, roll = 0, ev = 0) => out.push({ p, t, x, y, z, yaw, pitch, roll, ev });
  for (let p = 0; p < 6; p++) {
    const R = 500 + 90 * p;
    const t0 = p * 0.37;
    for (let t = 0; t <= 240; t += 0.25 + (p % 3) * 0.05) {
      const a = (120 * t) / R;
      put(p, t0 + t, R * Math.sin(a) + p * 40, 1500 + 30 * Math.sin(t / 7) + p, -R * Math.cos(a), a + Math.PI / 2, 0.1 * Math.sin(t / 5), 25 + 5 * Math.sin(t / 3));
    }
  }
  // Held samples: moving, a run at one place, then on where its speed would have taken it.
  for (let k = 0, x = 0; k < 200; k++) {
    const held = k % 40 >= 20 && k % 40 < 23;
    if (!held) x = k * 10;
    put(6, k * 0.5, x, 10, 5, 0.3, 0, 0);
  }
  // Doubled times.
  for (let k = 0; k < 150; k++) {
    put(7, k * 0.2, k * 3, 2, r() * 2);
    if (k % 9 === 0) put(7, k * 0.2 + 0.0004, k * 3 + 0.5, 2, 0);
  }
  // A gap: 12 s without a sample, somewhere else after it.
  for (let k = 0; k < 120; k++) put(8, k < 60 ? k * 0.5 : 42 + k * 0.5, k < 60 ? k * 4 : 800 + k * 4, 0, 0, 1.2, 0.05, 0);
  // Rows with no position.
  for (let k = 0; k < 100; k++) put(9, k * 0.3, k % 7 === 3 ? NaN : k * 2, 1, k, 2.5, 0, 0);
  // A shared name.
  for (let k = 0; k < 50; k++) put(SHARED, k, k, 0, 0);
  // 11: no rows. 12: one row.
  put(12, 5, 1, 2, 3, 0.5, 0.2, 10);
  // Shots and impacts among the positions.
  for (let k = 0; k < 160; k++) put(13, k * 0.25, k * 5, 3, 1, 0.7, 0, 0, k % 5 === 1 ? 1 : k % 11 === 2 ? 2 : 0);
  // NaN pitch and roll now and then.
  for (let k = 0; k < 140; k++) put(14, k * 0.25, k * 6, 100 + k, -k, -0.4 + k * 0.01, k % 6 === 0 ? NaN : 0.2, k % 4 === 0 ? NaN : -15);
  // Parked: a sample every 10 s, never moved.
  for (let k = 0; k < 30; k++) put(15, k * 10, 50, 0, 50, 1, 0, 0);
  // Far from the origin, fast.
  for (let k = 0; k < 400; k++) put(16, 3 + k * 0.1, 250000 + k * 30 + r(), 8000 + r() * 3, -180000 - k * 12, 2, 0.05, 40 * Math.sin(k / 9));
  // A slow walker with jittered times.
  for (let k = 0; k < 300; k++) put(17, k * 0.5 + r() * 0.01, k * 0.6 + r() * 0.05, 0.2 * r(), 30 + k * 0.1, k * 0.01, 0, 0);
  out.sort((a, b) => a.t - b.t || a.p - b.p);
  return out;
}

const EVENTS = ['position', 'shot', 'impact'];

function dataset(rs: Row[], entitySize?: number): Dataset {
  const n = rs.length;
  const cat = (name: string, labels: string[], data: Uint32Array): AttributeColumn => ({ name, kind: 'category', data, min: 0, max: labels.length - 1, categories: labels }) as AttributeColumn;
  return {
    id: 'v',
    name: 'v',
    count: n,
    px: Float32Array.from(rs, (r) => r.x),
    py: Float32Array.from(rs, (r) => r.y),
    pz: Float32Array.from(rs, (r) => r.z),
    time: Float32Array.from(rs, (r) => r.t),
    personId: Uint32Array.from(rs, (r) => r.p),
    personLabels: Array.from({ length: PERSONS }, (_, p) => `u${p}`),
    personShared: Uint8Array.from({ length: PERSONS }, (_, p) => (p === SHARED ? 1 : 0)),
    personTeam: Uint16Array.from({ length: PERSONS }, (_, p) => p % 2),
    personSlot: null,
    teamSizes: null,
    sessionId: null,
    lifetime: null,
    yaw: Float32Array.from(rs, (r) => r.yaw),
    pitch: Float32Array.from(rs, (r) => r.pitch),
    bounds: { minX: -1e6, minY: -1e4, minZ: -1e6, maxX: 1e6, maxY: 1e4, maxZ: 1e6 },
    timeRange: [rs[0].t, rs[n - 1].t],
    attrs: [cat('Event', EVENTS, Uint32Array.from(rs, (r) => r.ev)), { name: 'roll', kind: 'number', data: Float32Array.from(rs, (r) => r.roll), min: -90, max: 90 } as AttributeColumn],
    warnings: [],
    ...(entitySize ? { entitySize } : {}),
  } as unknown as Dataset;
}

/** The input rows as the Rust test reads them: n, persons, then the columns, then the shared flags. */
function rowsFile(d: Dataset, roll: Float32Array, ev: Uint32Array): Uint8Array {
  const n = d.count;
  const parts: ArrayBufferView[] = [new Uint32Array([n, PERSONS]), d.px, d.py, d.pz, d.time!, d.yaw!, d.pitch!, roll, d.personId!, ev, d.personShared!];
  const bytes = parts.reduce((a, p) => a + p.byteLength, 0);
  const out = new Uint8Array(bytes);
  let at = 0;
  for (const p of parts) {
    out.set(new Uint8Array(p.buffer, p.byteOffset, p.byteLength), at);
    at += p.byteLength;
  }
  return out;
}

/** What the page's store says of its keys, in the core's answer layout plus its arrays. */
function expected(s: GpuTrackStore): Uint8Array {
  const head = Math.max(1, s.tracks) * TRACK_U32;
  const T = s.trackData;
  const F = new Float32Array(T.buffer, T.byteOffset, T.length);
  const chunks = T.subarray(head);
  const persons = new Uint32Array(PERSONS * PERSON_U32);
  const time = s.dataset.time!;
  for (let i = 0; i < s.tracks; i++) {
    const o = i * TRACK_U32;
    const q = s.personOf[i] * PERSON_U32;
    persons[q] = T[o];
    persons[q + 1] = T[o + 1];
    persons[q + 2] = T[o + 7] - head;
    for (let j = 0; j < 6; j++) persons[q + 3 + j] = T[o + 8 + j];
    new Float32Array(persons.buffer, (q + 9) * 4, 2).set([F[o + 12], time[s.keyRow![T[o] + T[o + 1] - 1]]]);
    persons[q + 11] = T[o + 5] & FLAG_GAPS ? 1 : 0;
  }
  const hdr = new Uint32Array(CORE_HEAD_U32);
  hdr.set([s.keys, chunks.length, PERSONS, 0, s.samples, 0]);
  new Float32Array(hdr.buffer).set([s.tolerance], 3);
  const parts = [hdr, persons, s.keysA, s.keysB, chunks];
  const out = new Uint8Array(parts.reduce((a, p) => a + p.byteLength, 0));
  let at = 0;
  for (const p of parts) {
    out.set(new Uint8Array(p.buffer, p.byteOffset, p.byteLength), at);
    at += p.byteLength;
  }
  return out;
}

const CASES = [
  { name: 'lossless', maxKeys: 1 << 24, entitySize: undefined },
  { name: 'reduced', maxKeys: 4200, entitySize: 2 },
];

describe('GPU tracks: the core keys vectors', () => {
  const rs = rows();
  const ev = Uint32Array.from(rs, (r) => r.ev);
  const roll = Float32Array.from(rs, (r) => r.roll);
  const file = rowsFile(dataset(rs), roll, ev);

  it('rows on disk are the generator`s', () => {
    const p = join(dir, 'rows.bin');
    if (update) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(p, file);
    }
    expect(existsSync(p)).toBe(true);
    expect(Buffer.compare(readFileSync(p), Buffer.from(file))).toBe(0);
  });

  for (const c of CASES) {
    it(`${c.name}: the store's keys are the vectors'`, () => {
      const d = dataset(rs, c.entitySize);
      const s = gpuTrackStore(d, { maxKeys: c.maxKeys })!;
      expect(s).toBeTruthy();
      if (c.name === 'reduced') expect(s.tolerance).toBeGreaterThan(0);
      else expect(s.tolerance).toBe(0);
      const want = expected(s);
      const p = join(dir, `${c.name}.bin`);
      const req = coreTracksRequest(d, c.maxKeys);
      const meta = { name: c.name, ...req };
      if (update) {
        writeFileSync(p, want);
        const all = existsSync(join(dir, 'cases.json')) ? (JSON.parse(readFileSync(join(dir, 'cases.json'), 'utf8')) as (typeof meta)[]) : [];
        const next = [...all.filter((x) => x.name !== c.name), meta].sort((a, b) => a.name.localeCompare(b.name));
        writeFileSync(join(dir, 'cases.json'), JSON.stringify(next, null, 2) + '\n');
      }
      expect(Buffer.compare(readFileSync(p), Buffer.from(want))).toBe(0);
      const cases = JSON.parse(readFileSync(join(dir, 'cases.json'), 'utf8')) as (typeof meta)[];
      expect(cases.find((x) => x.name === c.name)).toEqual(meta);

      // The table made for the core's keys, given the page's own answer, is the page's table.
      const buf = want.buffer.slice(want.byteOffset, want.byteOffset + (CORE_HEAD_U32 + PERSONS * PERSON_U32) * 4);
      const k = parseCoreKeys(buf as ArrayBuffer);
      expect(k.keys).toBe(s.keys);
      const table = coreTrackTable(s, k);
      expect(Array.from(table)).toEqual(Array.from(s.trackData.subarray(0, Math.max(1, s.tracks) * TRACK_U32)));
    });
  }
});
