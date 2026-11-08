import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../../state/types';
import { emptySample, MotionModel } from '../../figures/motion';
import { decodeKey, gpuTrackStore, TRACK_U32 } from './store';
import { emptyPose, evaluateTrack } from './evaluate';
import { PLACE_WGSL, FINISH_WGSL } from './shader';

/** Synthetic aircraft circling, each its own radius and start, sampled at 4 Hz. */
function dataset(n: number, seconds = 60): Dataset {
  const rows: { p: number; t: number; x: number; y: number; z: number; yaw: number; roll: number }[] = [];
  for (let p = 0; p < n; p++) {
    const R = 600 + 37 * p;
    const t0 = (p % 7) * 0.5;
    for (let t = 0; t <= seconds; t += 0.25) {
      const a = (100 * t) / R;
      rows.push({ p, t: t0 + t, x: R * Math.sin(a) + p * 50, y: 2000 + 10 * Math.sin(t), z: -R * Math.cos(a) + R, yaw: Math.atan2(Math.cos(a), -Math.sin(a)), roll: 30 });
    }
  }
  rows.sort((a, b) => a.t - b.t);
  const cnt = rows.length;
  const cat = (name: string, values: string[]): AttributeColumn => {
    const labels = [...new Set(values)];
    return { name, kind: 'category', data: Uint32Array.from(values.map((v) => labels.indexOf(v))), min: 0, max: labels.length - 1, categories: labels };
  };
  return {
    id: 'g',
    name: 'g',
    count: cnt,
    px: Float32Array.from(rows, (r) => r.x),
    py: Float32Array.from(rows, (r) => r.y),
    pz: Float32Array.from(rows, (r) => r.z),
    time: Float32Array.from(rows, (r) => r.t),
    personId: Uint32Array.from(rows, (r) => r.p),
    personLabels: Array.from({ length: n }, (_, p) => `u${p}`),
    personShared: null,
    personTeam: Uint16Array.from({ length: n }, (_, p) => p % 2),
    personSlot: null,
    teamSizes: null,
    sessionId: null,
    lifetime: null,
    yaw: Float32Array.from(rows, (r) => r.yaw),
    pitch: new Float32Array(cnt),
    bounds: { minX: -1e5, minY: 0, minZ: -1e5, maxX: 1e5, maxY: 1e4, maxZ: 1e5 },
    timeRange: [rows[0].t, rows[cnt - 1].t],
    attrs: [cat('Vehicle', rows.map((r) => (r.p % 2 ? 'la-7' : 'b-26b_c'))), cat('kind', rows.map(() => 'aircraft')), { name: 'roll', kind: 'number', data: Float32Array.from(rows, (r) => r.roll), min: 0, max: 1 } as AttributeColumn],
  } as unknown as Dataset;
}

describe('GPU tracks', () => {
  it('keep every sample when they fit, and put units exactly on the CPU curve', () => {
    const d = dataset(12);
    const s = gpuTrackStore(d, { maxKeys: 1e9 })!;
    expect(s.tolerance).toBe(0);
    expect(s.keys).toBe(s.samples);
    expect(s.keysA.length).toBe(s.keys * 2);
    expect(s.tracks).toBe(12);
    const m = MotionModel.of(d)!;
    const cpu = emptySample();
    const gpu = emptyPose();
    let worst = 0;
    let worstNose = 0;
    for (let i = 0; i < s.tracks; i++) {
      const p = s.personOf[i];
      for (let t = 4; t < 55; t += 0.37) {
        expect(evaluateTrack(s, i, t, 10, gpu)).toBe(true);
        m.at(p, t, -1, cpu);
        worst = Math.max(worst, Math.hypot(gpu.x - cpu.x, gpu.y - cpu.y, gpu.z - cpu.z));
        // Fast (100 m/s): the nose is along the flight on both.
        const sp = Math.hypot(cpu.vx, cpu.vy, cpu.vz);
        const c = (gpu.f[0] * cpu.vx + gpu.f[1] * cpu.vy + gpu.f[2] * cpu.vz) / sp;
        worstNose = Math.max(worstNose, Math.acos(Math.min(1, c)));
      }
    }
    // Positions and times in 16-bit steps of each track's span (here 3 cm and 0.9 ms, which at 100 m/s is 9 cm
    // along the path): within those steps of the CPU curve.
    expect(worst).toBeLessThan(0.1);
    expect(worstNose).toBeLessThan(2e-3);
  });

  it('reduce to a stated tolerance only when the keys would not fit, and stay within it', () => {
    const d = dataset(12);
    const full = gpuTrackStore(dataset(12), { maxKeys: 1e9 })!;
    const s = gpuTrackStore(d, { maxKeys: Math.floor(full.keys / 3) })!;
    expect(s.tolerance).toBeGreaterThan(0);
    expect(s.keys).toBeLessThanOrEqual(Math.floor(full.keys / 3));
    const a = emptyPose();
    const b = emptyPose();
    let worst = 0;
    for (let i = 0; i < s.tracks; i++) {
      for (let t = 4; t < 55; t += 0.29) {
        evaluateTrack(s, i, t, 10, a);
        evaluateTrack(full, i, t, 10, b);
        worst = Math.max(worst, Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z));
      }
    }
    // Between kept keys the curve may stray a little further than at the samples tested; a few times the tolerance.
    expect(worst).toBeLessThan(4 * s.tolerance + 1);
  });

  it('are not there before their first key, and held only as long as allowed after the last', () => {
    const d = dataset(3, 10);
    const s = gpuTrackStore(d, { maxKeys: 1e9 })!;
    const p = emptyPose();
    const i = s.trackOf[2];
    const k4 = [0, 0, 0, 0];
    decodeKey(s, i * TRACK_U32, s.trackData[i * TRACK_U32], k4);
    const first = k4[3];
    expect(evaluateTrack(s, i, first - 0.01, 5, p)).toBe(false);
    decodeKey(s, i * TRACK_U32, s.trackData[i * TRACK_U32] + s.trackData[i * TRACK_U32 + 1] - 1, k4);
    const lastT = k4[3];
    expect(evaluateTrack(s, i, lastT + 4, 5, p)).toBe(true);
    expect(evaluateTrack(s, i, lastT + 6, 5, p)).toBe(false);
  });

  it('have shaders that use the store layout', () => {
    expect(PLACE_WGSL).toContain('const TRACK_U32 = 16u');
    expect(FINISH_WGSL).toContain('fn finish');
  });
});
