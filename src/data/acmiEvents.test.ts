import { describe, expect, it } from 'vitest';
import { AcmiEventFinder, type AcmiEvent } from './acmiEvents';
import { extentOf } from './extent';
import { CANON, canonicalColumns } from './canonical';

type Ev = AcmiEvent<string, number, string>;

/** Samples of each object, every `dt` seconds, in time order with removals after a frame's samples. */
function run(objects: { key: string; type: string; from: number; to: number; at: (t: number) => [number, number, number]; removed?: boolean }[], dt = 0.25): Ev[] {
  const out: Ev[] = [];
  const f = new AcmiEventFinder<string, number, string>((e) => out.push(e));
  const end = Math.max(...objects.map((o) => o.to));
  for (let k = 0; k * dt <= end + 1e-9; k++) {
    const t = k * dt;
    for (const o of objects) if (t >= o.from - 1e-9 && t <= o.to + 1e-9) f.sample(o.key, k, t, ...o.at(t), o.type, o.key);
    for (const o of objects) if (o.removed && Math.abs(t - o.to - dt) < 1e-6) f.removed(o.key, -k, t);
  }
  f.finish();
  return out;
}

describe('ACMI events worked out', () => {
  it('finds a missile’s launch, hit and kill: its launcher, its target, both sides', () => {
    const ev = run([
      { key: 'A', type: 'Air+FixedWing', from: 0, to: 20, at: (t) => [200 * t, 0, 3000] },
      { key: 'B', type: 'Air+FixedWing', from: 0, to: 13.75, at: (t) => [8000 - 200 * t, 0, 3000], removed: true },
      // Fired at 5 s, meets B at 12.5 s, last sampled 12.25 s.
      { key: 'M', type: 'Weapon+Missile', from: 5, to: 12.25, at: (t) => [1000 + 600 * (t - 5), 0, 3000], removed: true },
    ]);
    const of = (k: string) => ev.filter((e) => e.kind === k);
    expect(of('launch')).toHaveLength(1);
    expect(of('launch')[0].shooter).toBe('A');
    expect(of('hit')).toHaveLength(1);
    expect(of('hit')[0]).toMatchObject({ subject: 'M', shooter: 'A', target: 'B', detail: 'air', targetInfo: 'B' });
    expect(Math.abs(of('hit')[0].x - (8000 - 200 * 12.5))).toBeLessThan(250);
    expect(of('damage')[0]).toMatchObject({ subject: 'B', shooter: 'A' });
    expect(of('kill')).toHaveLength(1);
    expect(of('kill')[0]).toMatchObject({ subject: 'A', target: 'B', weapon: 'M', detail: 'shot down' });
    expect(of('death')[0]).toMatchObject({ subject: 'B', shooter: 'A', weapon: 'M' });
    expect(of('miss')).toHaveLength(0);
    expect(of('crash')).toHaveLength(0);
  });

  it('calls a bomb that ends near no unit a miss on the ground, and a unit removed unhit no kill', () => {
    const ev = run([
      { key: 'T', type: 'Ground+Vehicle', from: 0, to: 10, at: () => [0, 0, 50], removed: true },
      { key: 'J', type: 'Air+FixedWing', from: 0, to: 10, at: (t) => [-3000 + 200 * t, 0, 1500] },
      { key: 'K', type: 'Weapon+Bomb', from: 2, to: 6, at: (t) => [-2600 + 200 * (t - 2), 300, 1500 - 360 * (t - 2)], removed: true },
    ]);
    expect(ev.filter((e) => e.kind === 'miss')).toMatchObject([{ subject: 'K', shooter: 'J', detail: 'ground' }]);
    expect(ev.some((e) => e.kind === 'hit' || e.kind === 'kill' || e.kind === 'death')).toBe(false);
  });

  it('tells a take-off, a landing at its touchdown, a stop and a rearm between two flights', () => {
    // Stands 30 s, rolls and climbs, flies, comes down, rolls out, stands 150 s, flies again.
    const at = (t: number): [number, number, number] => {
      if (t < 30) return [0, 0, 100];
      if (t < 60) return [80 * (t - 30), 0, 100 + 20 * Math.max(0, t - 40)];
      if (t < 100) return [2400 + 80 * (t - 60), 0, 500];
      if (t < 120) return [5600 + 70 * (t - 100), 0, Math.max(100, 500 - 25 * (t - 100))];
      if (t < 130) return [7000 + 15 * (t - 120), 0, 100];
      if (t < 280) return [7150, 0, 100];
      return [7150 + 90 * (t - 280), 0, 100 + 20 * Math.max(0, t - 285)];
    };
    const ev = run([{ key: 'C', type: 'Air+FixedWing', from: 0, to: 300, at }], 0.5);
    const kinds = ev.map((e) => e.kind);
    expect(kinds.filter((k) => k === 'takeoff')).toHaveLength(2);
    const landing = ev.filter((e) => e.kind === 'landing');
    expect(landing).toHaveLength(1);
    // Down at 116 s; slow enough to be on the ground some seconds later.
    expect(landing[0].t).toBeGreaterThan(115);
    expect(landing[0].t).toBeLessThan(118);
    expect(ev.filter((e) => e.kind === 'stop').map((e) => e.detail)).toContain('parked');
    expect(kinds).toContain('rearm');
    expect(kinds).not.toContain('touchdown');
  });
});

describe('ACMI events of a recording converted before', () => {
  it('relabels the rows they stand on: the weapon’s end its kill, the target’s removal its death', () => {
    const objs = [
      { key: 'A', type: 'Air+FixedWing', to: 20, at: (t: number) => [200 * t, 0, 3000] },
      { key: 'B', type: 'Air+FixedWing', to: 13.75, at: (t: number) => [8000 - 200 * t, 0, 3000], removed: true },
      { key: 'M', type: 'Weapon+Missile', from: 5, to: 12.25, at: (t: number) => [1000 + 600 * (t - 5), 0, 3000], removed: true },
    ];
    const rows: { p: number; t: number; x: number; y: number; z: number; ev: string; type: string }[] = [];
    objs.forEach((o, p) => {
      for (let t = o.from ?? 0; t <= o.to + 1e-9; t += 0.25) {
        const [x, y, z] = o.at(t);
        rows.push({ p, t, x, y, z, ev: '', type: o.type });
      }
      if (o.removed) {
        const [x, y, z] = o.at(o.to);
        rows.push({ p, t: o.to + 0.25, x, y, z, ev: 'Removed', type: o.type });
      }
    });
    const cat = (name: string, v: string[]) => {
      const labels = [...new Set(v)];
      return { name, labels, data: Uint32Array.from(v, (x) => labels.indexOf(x)) };
    };
    const cols = canonicalColumns({
      n: rows.length,
      cats: [cat('Event', rows.map((r) => r.ev)), cat('Type', rows.map((r) => r.type))],
      person: Uint32Array.from(rows, (r) => r.p),
      session: null,
      time: Float32Array.from(rows, (r) => r.t),
      // The dataset's y is up.
      px: Float32Array.from(rows, (r) => r.x),
      py: Float32Array.from(rows, (r) => r.z),
      pz: Float32Array.from(rows, (r) => r.y),
      units: 1,
    });
    const ev = cols.find((c) => c.name === CANON.event)!;
    const kind = (r: number) => ev.categories![(ev.data as Uint32Array)[r]];
    const removal = (p: number) => rows.findIndex((r) => r.p === p && r.ev === 'Removed');
    expect(kind(removal(2))).toBe('kill');
    expect(kind(removal(1))).toBe('death');
    expect(kind(rows.findIndex((r) => r.p === 2))).toBe('launch');
  });
});

describe('dataset extent', () => {
  it('leaves garbage and stray rows out of the box, and every real row in', () => {
    const n = 1000;
    const px = new Float32Array(n);
    const py = new Float32Array(n);
    const pz = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      px[i] = (i % 100) * 10;
      py[i] = (i % 7) * 100;
      pz[i] = -(i % 50) * 20;
    }
    px[3] = 5000; // A real excursion, five widths out: kept.
    py[10] = 1e18; // Garbage.
    px[11] = NaN;
    pz[12] = -Infinity;
    py[13] = 3e7; // A stray: thousands of widths out.
    const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
    extentOf(px, py, pz, n, b);
    expect(b.maxX).toBe(5000);
    expect(b.minX).toBe(0);
    expect(b.maxY).toBe(600);
    expect(b.minZ).toBe(-980);
  });
});
