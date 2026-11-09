import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../../state/types';
import { emptySample, MotionModel } from '../../figures/motion';
import { CHUNK_KEYS, CHUNK_SHIFT, CHUNK_U32, decodeKey, FLAG_GAPS, GAP_BIT, gpuTrackStore, TRACK_U32 } from './store';
import { emptyPose, evaluateTrack } from './evaluate';
import { PLACE_WGSL, FINISH_WGSL } from './shader';
import { EVAL_GLSL_VS, TRAIL_GLSL_VS, TRAIL_SEGMENTS_GL } from './glsl';
import { GAP_FADE_S } from '../../data/gaps';

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

/** Units from rows (time order), no attitude. */
function plain(rows: { p: number; t: number; x: number; y: number; z: number }[], persons: number): Dataset {
  return {
    id: 'q', name: 'q', count: rows.length,
    px: Float32Array.from(rows, (r) => r.x), py: Float32Array.from(rows, (r) => r.y), pz: Float32Array.from(rows, (r) => r.z),
    time: Float32Array.from(rows, (r) => r.t), personId: Uint32Array.from(rows, (r) => r.p),
    personLabels: Array.from({ length: persons }, (_, p) => `u${p}`), personShared: null, personTeam: null, personSlot: null,
    teamSizes: null, sessionId: null, lifetime: null, yaw: null, pitch: null,
    bounds: { minX: -1e6, minY: 0, minZ: -1e6, maxX: 1e6, maxY: 1e4, maxZ: 1e6 },
    timeRange: [rows[0].t, rows[rows.length - 1].t], attrs: [],
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
    // Positions and times in 16-bit steps of each chunk's span (here 2.5 cm and 0.25 ms, which at
    // 100 m/s is 2.5 cm along the path): within those steps of the CPU curve.
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
    // Held past its last key for its own hold (a few sample intervals, `data/despawn.ts`), never past the lifetime.
    const hold = new Float32Array(s.trackData.buffer, s.trackData.byteOffset)[i * TRACK_U32 + 14] - 1;
    expect(hold).toBeGreaterThan(0);
    expect(hold).toBeLessThanOrEqual(3);
    expect(evaluateTrack(s, i, lastT + hold * 0.9, 5, p)).toBe(true);
    expect(evaluateTrack(s, i, lastT + hold + 0.05, 5, p)).toBe(false);
    expect(evaluateTrack(s, i, lastT + Math.min(hold, 0.1) * 0.5, Math.min(hold, 0.1) * 0.25, p)).toBe(false);
  });

  it('keep a long, theatre-sized track to centimetres: keys count from their chunk, not from the whole track', () => {
    // A jet 690 km out weaving at 250 m/s for five hours, sampled every 0.23 to 0.26 s, the times to 10 ms (a
    // DCS server's Tacview). Over the whole track 16 bits were 0.27 s and 18 m steps: the jet shook by metres.
    const rows: { p: number; t: number; x: number; y: number; z: number }[] = [];
    let seed = 7;
    for (let t = 0; t < 5 * 3600; ) {
      rows.push({ p: 0, t, x: 690000 + 250 * t * 0.2 + 3000 * Math.sin(t / 50), y: 6000 + 300 * Math.sin(t / 40), z: -560000 + 2000 * Math.cos(t / 50) });
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      t = Math.round((t + 0.23 + (seed / 0x7fffffff) * 0.03) * 100) / 100;
    }
    const d = plain(rows, 1);
    const s = gpuTrackStore(d, { maxKeys: 1e9 })!;
    expect(s.keys).toBe(rows.length);
    const k4 = [0, 0, 0, 0];
    let dx = 0, dt = 0;
    for (let j = 0; j < s.keys; j++) {
      decodeKey(s, 0, j, k4);
      const r = s.keyRow![j];
      dx = Math.max(dx, Math.hypot(k4[0] - d.px[r], k4[1] - d.py[r], k4[2] - d.pz[r]));
      dt = Math.max(dt, Math.abs(k4[3] - d.time![r]));
    }
    expect(dx).toBeLessThan(0.1);
    expect(dt).toBeLessThan(1e-3);
    // On the CPU curve wherever the playhead is.
    const m = MotionModel.of(d)!;
    const cpu = emptySample();
    const gpu = emptyPose();
    let worst = 0;
    for (let t = 10; t < 5 * 3600 - 10; t += 7.31) {
      expect(evaluateTrack(s, 0, t, 10, gpu)).toBe(true);
      m.at(0, t, -1, cpu);
      worst = Math.max(worst, Math.hypot(gpu.x - cpu.x, gpu.y - cpu.y, gpu.z - cpu.z));
    }
    expect(worst).toBeLessThan(0.3);
    // The chunk spans sit after the tracks, one per 64 keys: under a byte a key.
    expect(s.trackData.length).toBe(TRACK_U32 + Math.ceil(s.keys / CHUNK_KEYS) * CHUNK_U32);
  });

  it('leave out samples that only hold a moving unit\'s last place, and keep a unit that stops', () => {
    const rows: { p: number; t: number; x: number; y: number; z: number }[] = [];
    // A jet at 200 m/s, 4 Hz, whose sample at 10 s repeats the one before: its update came late.
    for (let t = 0; t <= 20; t += 0.25) rows.push({ p: 0, t, x: 200 * (t === 10 ? 9.75 : t), y: 3000, z: 0 });
    // A soldier at 64 Hz walking 5 m/s, who stops from 2 s to 2.5 s.
    for (let i = 0; i <= 320; i++) {
      const t = i / 64;
      rows.push({ p: 1, t, x: 5 * (t < 2 ? t : t < 2.5 ? 2 : t - 0.5), y: 0, z: 0 });
    }
    rows.sort((a, b) => a.t - b.t || a.p - b.p);
    const s = gpuTrackStore(plain(rows, 2), { maxKeys: 1e9 })!;
    const pose = emptyPose();
    const jet = s.trackOf[0];
    expect(evaluateTrack(s, jet, 10, 10, pose)).toBe(true);
    expect(Math.abs(pose.x - 2000)).toBeLessThan(0.5);
    expect(evaluateTrack(s, jet, 9.9, 10, pose)).toBe(true);
    expect(Math.abs(pose.vx - 200)).toBeLessThan(5);
    const soldier = s.trackOf[1];
    expect(evaluateTrack(s, soldier, 2.25, 10, pose)).toBe(true);
    expect(Math.abs(pose.x - 10)).toBeLessThan(0.01);
  });

  it('have shaders that use the store layout', () => {
    expect(PLACE_WGSL).toContain('const TRACK_U32 = 16u');
    expect(FINISH_WGSL).toContain('fn finish');
    // Keys from their chunk's span, times from the playhead (its f32 and the rest), the aim keys after the table.
    expect(PLACE_WGSL).toContain(`return spanChunks + ((j - spanFirst) >> ${CHUNK_SHIFT}u) * ${CHUNK_U32}u;`);
    expect(PLACE_WGSL).toContain('let ia = u.x.y + k;');
    expect(EVAL_GLSL_VS).toContain('spanChunks + ((j - spanFirst) >> 6) * 2');
    expect(TRAIL_GLSL_VS).toContain('float t = 0.0;');
  });

  it('draw trails and drop lines on WebGL2 as the WebGPU place shader writes them', () => {
    // WebGPU: the drop line after the trail's pieces, from the unit to the floor, 0.55 fading to 0.15.
    expect(PLACE_WGSL).toContain('let drop = u.m.z != 0u && P.y - floorY >= 1.0 && !noDrop;');
    expect(PLACE_WGSL).toContain('trail[v + 2u] = vec4<f32>(P.x, floorY, P.z, 1.0);');
    // WebGL2: one instance a placed track, the same number of pieces and the drop line last.
    expect(TRAIL_SEGMENTS_GL).toBe(48);
    expect(TRAIL_GLSL_VS).toContain('if (iTeam.w > -99.0) return;');
    expect(TRAIL_GLSL_VS).toContain('if (n == segs) {');
    expect(TRAIL_GLSL_VS).toContain('a = 0.8 * clamp(1.0 - (t - key.w) / W, 0.0, 1.0);');
    // The eval pass marks a placed unit with a gun elevation below -99 (what it is, `symbolClass.ts`), which the trail pass keys on.
    expect(EVAL_GLSL_VS).toContain('-1000.0 - float(word));');
  });

  it('fades a unit out in a gap in its samples, hides it there and brings it back where the next sample is', () => {
    // Unit 0 drives along x at 10 m/s (weaving: not a client's straight guess), sampled 4 times a second, unheard of from 10 s to 20 s; unit 1 stands still,
    // sampled the same way with the same silence; unit 2 is sampled every 5 s all along.
    const rows: { p: number; t: number; x: number; y: number; z: number }[] = [];
    const X = (t: number) => Math.fround(10 * t + 3 * Math.sin(1.3 * t));
    for (let t = 0; t <= 30; t += 0.25) {
      if (t > 10 && t < 20) continue;
      rows.push({ p: 0, t, x: X(t), y: 0, z: 4 * Math.cos(0.7 * t) }, { p: 1, t, x: 0, y: 0, z: 50 });
    }
    for (let t = 0; t <= 30; t += 5) rows.push({ p: 2, t, x: 3 * t, y: 0, z: 100 });
    rows.sort((a, b) => a.t - b.t || a.p - b.p);
    const d = plain(rows, 3);
    const s = gpuTrackStore(d, { maxKeys: 1e9 })!;
    const flags = (i: number) => s.trackData[i * TRACK_U32 + 5];
    expect(flags(s.trackOf[0]) & FLAG_GAPS).toBe(FLAG_GAPS);
    expect(flags(s.trackOf[1]) & FLAG_GAPS).toBe(0);
    expect(flags(s.trackOf[2]) & FLAG_GAPS).toBe(0);
    // One gap bit, on the key at 10 s.
    const i = s.trackOf[0];
    const first = s.trackData[i * TRACK_U32];
    const marked: number[] = [];
    for (let k = first; k < first + s.trackData[i * TRACK_U32 + 1]; k++) if (s.keysB[k] & GAP_BIT) marked.push(k - first);
    expect(marked).toEqual([40]);
    const m = MotionModel.of(d)!;
    expect(m.gapCount).toBe(1);
    const p = emptyPose();
    const cpu = emptySample();
    // Up to the first missed update (10.25 s): where the last sample was, whole; then fading; then gone.
    for (const [t, alpha] of [[10.1, 1], [10.25 + GAP_FADE_S / 2, 0.5]] as const) {
      expect(evaluateTrack(s, i, t, 60, p)).toBe(true);
      expect(p.alpha).toBeCloseTo(alpha, 2);
      expect(p.x).toBeCloseTo(X(10), 1);
      expect(m.fadeAt(0, t)).toBeCloseTo(alpha, 2);
      m.at(0, t, -1, cpu);
      expect(cpu.x).toBeCloseTo(X(10), 1);
    }
    for (const t of [10.6, 15, 19.9]) {
      expect(evaluateTrack(s, i, t, 60, p)).toBe(false);
      expect(m.fadeAt(0, t)).toBe(0);
    }
    // Back at once where the next sample has it, and on its own curve from there (not from before the gap).
    expect(evaluateTrack(s, i, 20.01, 60, p)).toBe(true);
    expect(p.alpha).toBe(1);
    expect(p.x).toBeCloseTo(X(20.01), 0);
    expect(evaluateTrack(s, i, 20.1, 60, p)).toBe(true);
    expect(Math.abs(p.vx - (X(20.25) - X(20)) / 0.25)).toBeLessThan(2);
    expect(m.fadeAt(0, 20.1)).toBe(1);
    // The one standing still and the one sampled seldom stay.
    expect(evaluateTrack(s, s.trackOf[1], 15, 60, p)).toBe(true);
    expect(evaluateTrack(s, s.trackOf[2], 12, 60, p)).toBe(true);
    expect(m.fadeAt(1, 15)).toBe(1);
    // The CPU trail breaks at the gap: no piece of it across 10 s to 20 s.
    const pts: [number, boolean][] = [];
    m.trail(0, 5, 25, 0.5, cpu, (q, t, join) => {
      pts.push([t, join]);
      return true;
    });
    for (let n = 1; n < pts.length; n++) if (pts[n][1]) expect(pts[n][0] - pts[n - 1][0]).toBeLessThan(1);
    // The shaders: the gap bit kept off the attitude's w, the fade, the trail stopping there.
    expect(PLACE_WGSL).toContain('fn gapAfter(j : u32) -> bool');
    expect(PLACE_WGSL).toContain('if (gaps && gapAfter(j - 1u)) { break; }');
    expect(PLACE_WGSL).toContain('f32(i32(v & 0x7fffffffu) >> 24u) / 127.0');
    expect(EVAL_GLSL_VS).toContain('gapA = gapFade(t - A0.w, before);');
    expect(TRAIL_GLSL_VS).toContain('n > int(-iUp.w - 1.5)');
  });
});
