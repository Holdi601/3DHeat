import { describe, expect, it } from 'vitest';
import { VertexBuffer } from '../race/geometry';
import type { AttributeColumn, Dataset } from '../state/types';
import { CUBE_STRIDE } from '../data/tracks';
import { emptySample, MotionModel, MotionRefiner, rotate } from './motion';
import { FigureReplay } from './replay';
import { WeaponLayer } from '../render/weapons';
import { expand, InstanceBatches, meshOf } from './instances';
import { CATALOG } from './catalog';
import { placeFrame, poseFrame } from './kit';
import { figureGlslVs, figureWgsl } from '../render/figureShaders';
import { SUN_DIR } from './light';

/**
 * A synthetic match: tracks given as samples (t, x, y, z, heading deg, pitch deg, roll deg), each person's
 * rows interleaved in time order as an exporter writes them, with optional extra category columns.
 */
interface Row {
  p: number;
  t: number;
  x: number;
  y: number;
  z: number;
  yaw?: number;
  pitch?: number;
  roll?: number;
  event?: string;
  other?: string;
  weapon?: string;
  target?: [number, number, number];
}

function dataset(rows: Row[], persons: string[], vehicle = 'la-7'): Dataset {
  rows = [...rows].sort((a, b) => a.t - b.t);
  const n = rows.length;
  const cat = (name: string, values: string[]): AttributeColumn => {
    const labels = [...new Set(values)];
    return { name, kind: 'category', data: Uint32Array.from(values.map((v) => labels.indexOf(v))), min: 0, max: labels.length - 1, categories: labels };
  };
  const num = (name: string, values: number[]): AttributeColumn => ({ name, kind: 'number' as AttributeColumn['kind'], data: Float32Array.from(values), min: 0, max: 1 });
  const rad = (v: number | undefined) => ((v ?? 0) * Math.PI) / 180;
  return {
    id: 'synthetic',
    name: 'synthetic',
    count: n,
    px: Float32Array.from(rows, (r) => r.x),
    py: Float32Array.from(rows, (r) => r.y),
    pz: Float32Array.from(rows, (r) => r.z),
    time: Float32Array.from(rows, (r) => r.t),
    personId: Uint32Array.from(rows, (r) => r.p),
    personLabels: persons,
    personShared: null,
    sessionId: null,
    lifetime: null,
    yaw: Float32Array.from(rows, (r) => rad(r.yaw)),
    pitch: Float32Array.from(rows, (r) => rad(r.pitch)),
    bounds: { minX: -1e5, minY: 0, minZ: -1e5, maxX: 1e5, maxY: 1e4, maxZ: 1e5 },
    timeRange: [rows[0].t, rows[n - 1].t],
    attrs: [
      cat('event', rows.map((r) => r.event ?? 'position')),
      cat('Vehicle', rows.map(() => vehicle)),
      cat('kind', rows.map(() => 'aircraft')),
      cat('other', rows.map((r) => r.other ?? '')),
      cat('player', rows.map((r) => persons[r.p].split(' #')[0])),
      cat('weapon', rows.map((r) => r.weapon ?? '')),
      num('roll', rows.map((r) => r.roll ?? 0)),
      ...(rows.some((r) => r.target) ? [0, 1, 2].map((k) => num(['targetX', 'targetY', 'targetZ'][k], rows.map((r) => (r.target ? r.target[k] : NaN)))) : []),
    ],
  } as unknown as Dataset;
}

/** A circle flown at `speed` m/s, `radius` m, sampled every `dt` s: heading along it, banked into the turn. */
function circle(p: number, seconds: number, dt: number, speed = 100, radius = 800, bank = 50, t0 = 0): Row[] {
  const out: Row[] = [];
  for (let t = 0; t <= seconds + 1e-9; t += dt) {
    const a = (speed * t) / radius;
    // Clockwise seen from above (a right turn): heading grows.
    const x = radius * Math.sin(a);
    const z = -radius * Math.cos(a) + radius;
    // Viewer heading: atan2(dx, -dz) of the velocity (cos a, sin a)... here the velocity is (cos a, sin a) in x, z.
    const yaw = (Math.atan2(Math.cos(a), -Math.sin(a)) * 180) / Math.PI;
    out.push({ p, t: t0 + t, x, y: 2000, z, yaw, roll: bank });
  }
  return out;
}

const sample = emptySample();

describe('motion between samples', () => {
  it('goes through every sample on a curve without corners', () => {
    const d = dataset(circle(0, 20, 0.25), ['a']);
    const m = MotionModel.of(d)!;
    // Through the samples.
    for (let k = 0; k < d.count; k += 7) {
      expect(m.at(0, d.time![k], -1, sample)).toBe(true);
      expect(Math.hypot(sample.x - d.px[k], sample.y - d.py[k], sample.z - d.pz[k])).toBeLessThan(1e-3);
    }
    // Frame to frame at 60 fps the path turns by about the circle's own rate, never by a corner.
    let worst = 0;
    let prev: number[] | null = null;
    let last: number[] | null = null;
    for (let t = 1; t < 19; t += 1 / 60) {
      m.at(0, t, -1, sample);
      const cur = [sample.x, sample.z];
      if (prev && last) {
        const a = [last[0] - prev[0], last[1] - prev[1]];
        const b = [cur[0] - last[0], cur[1] - last[1]];
        const turn = Math.abs(Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1]));
        worst = Math.max(worst, turn);
      }
      prev = last;
      last = cur;
    }
    const own = 100 / 800 / 60; // radians a frame
    expect(worst).toBeLessThan(own * 1.5);
    // A straight line between the same samples turns by the whole step at every sample.
    expect((100 / 800) * 0.25).toBeGreaterThan(own * 10);
  });

  it('leaves out a client dead reckoning run and the sample that jumps back', () => {
    const rows = circle(0, 10, 0.25);
    // 2.0 s to 4.0 s: the client's straight-line guess from the 1.75 s sample on, then the update.
    const from = rows.findIndex((r) => r.t >= 1.75);
    const v = [(rows[from].x - rows[from - 1].x) / 0.25, (rows[from].z - rows[from - 1].z) / 0.25];
    for (let i = from + 1; rows[i].t <= 4; i++) {
      const dt = rows[i].t - rows[from].t;
      rows[i] = { ...rows[i], x: rows[from].x + v[0] * dt, z: rows[from].z + v[1] * dt, roll: 50 + 30 * (i - from) };
    }
    // 7.0 s: one sample 30 m back along the track.
    const j = rows.findIndex((r) => r.t >= 7);
    rows[j] = { ...rows[j], x: rows[j].x - 30 };
    const d = dataset(rows, ['a']);
    const m = MotionModel.of(d)!;
    expect(m.reckoned).toBeGreaterThanOrEqual(7);
    expect(m.outliers).toBe(1);
    // Between the update before and after, the curve stays near the true circle (the guess was 20+ m off).
    const truth = circle(0, 10, 0.25);
    for (const t of [3.5, 7]) {
      const k = truth.findIndex((r) => r.t >= t);
      m.at(0, t, -1, sample);
      expect(Math.hypot(sample.x - truth[k].x, sample.z - truth[k].z)).toBeLessThan(3);
    }
  });

  it('turns over a roll that counts the other way, and rolls the short way across 180', () => {
    expect(MotionModel.of(dataset(circle(0, 30, 0.25, 100, 800, 50), ['a']))!.rollSign).toBe(1);
    expect(MotionModel.of(dataset(circle(0, 30, 0.25, 100, 800, -50), ['a']))!.rollSign).toBe(-1);
    // Inverted, rolling from 170 to -170 degrees: through 180, not through 0.
    const rows: Row[] = [0, 0.25, 0.5, 0.75].map((t, i) => ({ p: 0, t, x: 100 * t, y: 2000, z: 0, yaw: 90, roll: [160, 170, -170, -160][i] }));
    const m = MotionModel.of(dataset(rows, ['a']))!;
    m.at(0, 0.375, -1, sample);
    const up = rotate(sample.q, [0, 1, 0]);
    expect(up[1]).toBeLessThan(-0.95);
  });
});

describe('track cuts', () => {
  it('ends a track where its unit goes on as the next one, instead of holding it beside it', () => {
    const all = circle(0, 10, 0.25);
    const rows = [...all.filter((r) => r.t <= 5), ...all.filter((r) => r.t > 5).map((r) => ({ ...r, p: 1 }))];
    const d = dataset(rows, ['a #1', 'a #2']);
    const ref = new MotionRefiner();
    const last0 = d.time!.lastIndexOf(5) >= 0 ? rows.findIndex((r) => r.t === 5) : -1;
    const cubes = new Float32Array(2 * CUBE_STRIDE);
    const at = (t: number) => {
      const lastOf = (person: number) => {
        let r = -1;
        for (let i = 0; i < d.count; i++) if (d.personId![i] === person && d.time![i] <= t) r = i;
        return r;
      };
      const r0 = lastOf(0);
      const r1 = lastOf(1);
      const ids = Int32Array.from([r0, r1].filter((r) => r >= 0));
      ref.refine(d, cubes, CUBE_STRIDE, ids.length, ids, t, -1);
      return ref.count;
    };
    expect(last0).toBeGreaterThanOrEqual(0);
    expect(at(4)).toBe(1);
    expect(at(7)).toBe(1);
  });
});

describe('figures in replay', () => {
  it('points the nose along the flight, rolled the data way, at true size near and a minimum on screen far', () => {
    const d = dataset(circle(0, 30, 0.25), ['a']);
    const fr = new FigureReplay();
    const ref = new MotionRefiner();
    const cubes = new Float32Array(CUBE_STRIDE);
    const rows = new Int32Array(1);
    for (const t of [5.1, 12.37, 20.6]) {
      const k = d.time!.findIndex((v) => v > t) - 1;
      cubes.set([d.px[k], d.py[k], d.pz[k], 1, 0, 0, d.yaw![k], d.pitch![k]]);
      rows[0] = k;
      ref.refine(d, cubes, CUBE_STRIDE, 1, rows, t, -1);
      expect(ref.posed[0]).toBe(1);
      ref.refine(d, cubes, CUBE_STRIDE, 1, rows, t, -1);
      const m = MotionModel.of(d)!;
      m.at(0, t, -1, sample);
      const sp = Math.hypot(sample.vx, sample.vy, sample.vz);
      const f = rotate(ref.poses.subarray(0, 4), [1, 0, 0]);
      const cos = (f[0] * sample.vx + f[1] * sample.vy + f[2] * sample.vz) / sp;
      expect(Math.acos(Math.min(1, cos))).toBeLessThan(0.02);
      // Banked into the (right) turn: the right wing (local z) points down.
      const right = rotate(ref.poses.subarray(0, 4), [0, 0, 1]);
      expect(right[1]).toBeLessThan(-0.6);
      // True size up close: about 8.6 m long for a La-7 seen from 50 m.
      const near = { scale: 1, unknown: 'box' as const, minPixels: 36, pixelSize: () => 50 / 1000, poses: ref.poses, posed: ref.posed };
      fr.build(d, cubes, 1, rows, near);
      expect(fr.drawnScale.get(0)).toBe(1);
      const drawn = new VertexBuffer();
      for (const b of fr.batches.list) expand(b, drawn);
      const len = extentAlong(drawn, f);
      expect(len).toBeGreaterThan(8);
      expect(len).toBeLessThan(9.5);
      // 10 km off, at 1000 px focal: grown to stay 36 px.
      fr.build(d, cubes, 1, rows, { ...near, pixelSize: () => 10000 / 1000 });
      expect(fr.drawnScale.get(0)!).toBeGreaterThan(30);
    }
  });
});

describe('instanced figures', () => {
  it('draw exactly what placing them on the CPU drew: same vertices, same light', () => {
    for (const name of ['la-7', 'b-26-marauder', 'soldier', 'mbt']) {
      const t = CATALOG[name].build();
      const fr = poseFrame({ x: 120, y: 2000, z: -40, yaw: 0.7, pitch: 0.2, roll: 2.1 });
      const team: [number, number, number] = [0.9, 0.3, 0.2];
      const cpu = new VertexBuffer();
      placeFrame(cpu, t, fr, 3, team);
      const gpu = new VertexBuffer();
      const b = new InstanceBatches();
      b.add(meshOf(t), fr, 3, team);
      expand(b.list[0], gpu);
      expect(gpu.count, name).toBe(cpu.count);
      // The mesh holds the fixed part, then the team part, as placeFrame writes them.
      let worst = 0;
      for (let i = 0; i < cpu.count * 7; i++) worst = Math.max(worst, Math.abs(gpu.data[i] - cpu.data[i]));
      expect(worst, name).toBeLessThan(1e-3);
    }
  });

  it('light in the shaders with the constants of light.ts', () => {
    for (const src of [figureGlslVs(), figureWgsl()]) {
      expect(src).toContain('shadeFigure');
      expect(src).toContain(String(Number(SUN_DIR[0].toPrecision(9))));
    }
    // The same mesh object for a template every time: uploaded once.
    const t = CATALOG['la-7'].build();
    expect(meshOf(t)).toBe(meshOf(t));
  });
});

describe('picking figures', () => {
  it('picks the figure a click lands on, wing tip included, not the track whose centre is nearest', () => {
    // A La-7 at the origin and, 300 m off, a bomber drawn 60 times true size: its wing reaches over the La-7.
    const rows: Row[] = [
      { p: 0, t: 0, x: 0, y: 2000, z: 0, yaw: 90 },
      { p: 1, t: 0, x: 0, y: 2000, z: -300, yaw: 0 },
    ];
    const d = dataset(rows, ['Pilot7 #1', 'bomber #2']);
    const fr = new FigureReplay();
    const cubes = new Float32Array(2 * CUBE_STRIDE);
    const rowsOf = Int32Array.from([0, 1]);
    for (let i = 0; i < 2; i++) cubes.set([d.px[i], d.py[i], d.pz[i], 1, 0, 0, d.yaw![i], 0], i * CUBE_STRIDE);
    fr.build(d, cubes, 2, rowsOf, { scale: 60, unknown: 'box' });
    expect(fr.placed.length).toBe(2);
    // Straight down onto the bomber's wing, 200 m out to its side: the bomber, though the La-7's centre is nearer.
    expect(fr.hit([200, 5000, -300], [0, -1, 0])).toBe(1);
    // Straight down on the La-7's middle, where the bomber's figure is not: the La-7.
    fr.build(d, cubes, 2, rowsOf, { scale: 1, unknown: 'box' });
    expect(fr.hit([0, 5000, 0], [0, -1, 0])).toBe(0);
    expect(fr.hit([200, 5000, -300], [0, -1, 0])).toBe(-1);
  });
});

describe('weapons', () => {
  it('draws rounds from the attacker that arrive at a hit, a flash on the victim, and nothing before', () => {
    const rows = [...circle(0, 10, 0.25, 100, 800, 30), ...circle(1, 10, 0.25, 100, 800, 30).map((r) => ({ ...r, x: r.x + 300 }))];
    rows.push({ p: 1, t: 5, x: rows.find((r) => r.p === 1 && r.t >= 5)!.x, y: 2000, z: rows.find((r) => r.p === 1 && r.t >= 5)!.z, event: 'hit_severe', other: 'a', weapon: 'la-7' });
    const d = dataset(rows, ['a #1', 'b #2']);
    const layer = new WeaponLayer();
    const out = new VertexBuffer();
    const view = (t: number) => ({
      t,
      session: -1,
      eye: [0, 3000, 0] as [number, number, number],
      pixelSize: () => 1,
      motion: MotionModel.of(d),
      kindOfRow: () => 'la-7',
      colorOfPerson: () => [1, 1, 1] as [number, number, number],
    });
    const live = { cubes: new Float32Array(0), stride: CUBE_STRIDE, count: 0, rows: new Int32Array(0), kinds: [] };
    out.reset();
    expect(layer.build(d, view(3), live, out)).toBe(0);
    out.reset();
    // 300 m at 850 m/s is 0.35 s: at 4.9 s the first rounds are on their way.
    expect(layer.build(d, view(4.9), live, out)).toBeGreaterThan(0);
    expect(out.count).toBeGreaterThan(0);
    out.reset();
    expect(layer.build(d, view(5.2), live, out)).toBeGreaterThan(0);
    out.reset();
    expect(layer.build(d, view(8), live, out)).toBe(0);
  });
});

describe('shots', () => {
  it('flies a round written at its hit from where the shooter was when it fired to the hit point', () => {
    const rows = [...circle(0, 10, 0.25, 100, 800, 30)];
    const k = rows.findIndex((r) => r.t >= 5);
    const hit: [number, number, number] = [rows[k].x + 400, 2000, rows[k].z];
    rows.push({ p: 0, t: 5, x: rows[k].x, y: 2000, z: rows[k].z, event: 'shot', target: hit, other: 'b' });
    const d = dataset(rows, ['a #1']);
    const layer = new WeaponLayer();
    const out = new VertexBuffer();
    const view = (t: number) => ({ t, session: -1, eye: [0, 3000, 0] as [number, number, number], pixelSize: () => 1, motion: MotionModel.of(d), kindOfRow: () => 'la-7', colorOfPerson: () => [1, 1, 1] as [number, number, number] });
    const live = { cubes: new Float32Array(0), stride: CUBE_STRIDE, count: 0, rows: new Int32Array(0), kinds: [] };
    // 400 m at 850 m/s: fired 0.47 s before the hit.
    expect(layer.build(d, view(4.4), live, out)).toBe(0);
    out.reset();
    expect(layer.build(d, view(4.8), live, out)).toBe(1);
    // The head of the round is on the line to the hit point, short of it.
    let far = 0;
    for (let i = 0; i < out.count; i++) far = Math.max(far, Math.hypot(out.data[i * 7] - hit[0], out.data[i * 7 + 2] - hit[2]));
    expect(far).toBeLessThan(400);
    out.reset();
    expect(layer.build(d, view(5.2), live, out)).toBe(0);
  });
});

/** The length of what was drawn along a direction. */
function extentAlong(b: VertexBuffer, f: number[]): number {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < b.count; i++) {
    const v = b.data[i * 7] * f[0] + b.data[i * 7 + 1] * f[1] + b.data[i * 7 + 2] * f[2];
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return hi - lo;
}
