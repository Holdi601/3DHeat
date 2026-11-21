import { describe, expect, it } from 'vitest';
import { arcSolve, flatFire, shellFor, shellKind, solveFlight, type Shell } from './ballistics';
import { descentOf, dirAtRest, effectiveThickness, impactAngle, nearestTriangle, triNormal } from './geometry';
import { extractHits, olderThan, type ScanColumns } from './scan';
import { HitStore } from './store';
import { compileFilter, plateColours, plateStats, rateOver, topBy, twoProportion, victimsOf, wilson } from './analyze';
import { EFFECT_BIT, FLAG_DIST, FLAG_POSE, FLAG_WON, R_KILL, R_NONPEN, R_PEN, type HitMatch } from './types';

const dart: Shell = { v0: 1700, k: 3.5e-5, indirect: false, powered: false, from: 'kind' };

describe('ballistics', () => {
  it('a dart at a kilometre comes in nearly flat, and a little slower', () => {
    const f = solveFlight(dart, 1000, 0)!;
    expect(f.descent).toBeGreaterThan(0);
    expect(f.descent).toBeLessThan(1);
    expect(f.speed).toBeLessThan(1700);
    expect(f.speed).toBeGreaterThan(1600);
    // The closed form agrees with the integrated flight.
    const num = arcSolve(dart, 1000, 0, false)!;
    expect(Math.abs(num.descent - f.descent)).toBeLessThan(0.05);
    expect(Math.abs(num.speed - f.speed)).toBeLessThan(3);
  });

  it('a howitzer shell at three kilometres comes down steeply, a mortar steeper', () => {
    const howitzer = shellFor('HE', 152, 300)!;
    const low = solveFlight(howitzer, 3000, 0)!;
    expect(low.descent).toBeGreaterThan(10);
    expect(low.descent).toBeGreaterThan(low.elevation);
    const high = arcSolve(howitzer, 3000, 0, true)!;
    expect(high.descent).toBeGreaterThan(45);
    const mortar = shellFor('HE', 120, 200, '120mm_mortar_he')!;
    expect(mortar.indirect).toBe(true);
    const m = solveFlight(mortar, 1000, 0)!;
    expect(m.arc).toBe('high');
    expect(m.descent).toBeGreaterThan(60);
  });

  it('loses speed with drag, more the farther it goes', () => {
    const ap = shellFor('AP', 75, 620)!;
    const near = solveFlight(ap, 300, 0)!;
    const far = solveFlight(ap, 2000, 0)!;
    expect(near.speed).toBeLessThan(620);
    expect(far.speed).toBeLessThan(near.speed - 50);
    // Without drag the flat-fire form keeps the speed (to the gravity's share).
    const vac = flatFire({ ...ap, k: 1e-12 }, 2000, 0)!;
    expect(vac.speed).toBeGreaterThan(619);
  });

  it('reads the round kinds as the converter writes them', () => {
    expect(shellKind('APFSDS')).toBe('APFSDS');
    expect(shellKind('apds_fs_long_tank')).toBe('APFSDS');
    expect(shellKind('he_frag_tank')).toBe('HE');
    expect(shellKind('heat_fs_tank')).toBe('HEAT-FS');
    expect(shellKind('kinetic')).toBe('kinetic');
    expect(shellKind('', '130mm_9m120_1')).toBe('ATGM');
    expect(shellFor('ATGM', 130, null)).toBeNull();
  });
});

describe('geometry', () => {
  // One square plate in the plane x = 1 (two triangles), its normal along x.
  const tris = new Float32Array([1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1]);
  it('finds the plate under a point and its normal', () => {
    const { k, d2 } = nearestTriangle([1.02, 0.2, 0.3], tris);
    expect(k).toBe(0);
    expect(d2).toBeCloseTo(0.0004, 6);
    const n = triNormal(tris, k);
    expect(Math.abs(n[0])).toBeCloseTo(1, 6);
  });

  it('measures the angle from the normal and the armour along the way', () => {
    const n = triNormal(tris, 0);
    expect(impactAngle([1, 0, 0], n)).toBeCloseTo(0, 6);
    expect(impactAngle([-1, 0, 0], n)).toBeCloseTo(0, 6);
    const a = (60 * Math.PI) / 180;
    expect(impactAngle([Math.cos(a), Math.sin(a), 0], n)).toBeCloseTo(60, 4);
    expect(effectiveThickness(100, 60)).toBeCloseTo(200, 6);
    expect(effectiveThickness(100, 0)).toBeCloseTo(100, 6);
    // Grazing is capped, not infinite.
    expect(effectiveThickness(100, 90)).toBeLessThan(1200);
  });

  it('turns a turret hit\'s direction back to the rest pose, and says the descent', () => {
    const d = dirAtRest([1, 0, 0], 'turret', Math.PI / 2, 0);
    expect(d[0]).toBeCloseTo(0, 6);
    expect(Math.abs(d[2])).toBeCloseTo(1, 6);
    expect(dirAtRest([1, 0, 0], 'hull', Math.PI / 2, 0)).toEqual([1, 0, 0]);
    expect(descentOf([Math.cos(0.5), -Math.sin(0.5), 0])).toBeCloseTo((0.5 * 180) / Math.PI, 4);
  });
});

/** Made-up rows of one match: text columns from plain lists. */
function columns(rows: Record<string, string | number>[]): ScanColumns {
  const num: ScanColumns['num'] = {};
  const txt: ScanColumns['txt'] = {};
  const names = new Set(rows.flatMap((r) => Object.keys(r)));
  for (const c of names) {
    if (c === 'time') continue;
    if (rows.some((r) => typeof r[c] === 'number')) num[c] = Float32Array.from(rows, (r) => (typeof r[c] === 'number' ? (r[c] as number) : NaN));
    else {
      const dict = [''];
      const ids = Uint32Array.from(rows, (r) => {
        const v = String(r[c] ?? '');
        let k = dict.indexOf(v);
        if (k < 0) k = dict.push(v) - 1;
        return k;
      });
      txt[c] = { ids, dict };
    }
  }
  return { rows: rows.length, time: Float64Array.from(rows, (r) => r.time as number), num, txt };
}

const match: HitMatch = { id: 'm1', file: 0, map: 'test_map', mode: 'RB ground', started: Date.UTC(2026, 10, 1), gameVersion: '200000', converterVersion: '0.2.4', winner: '2' };

function shot(time: number, o: Record<string, string | number>): Record<string, string | number> {
  return { time, event: 'shot', player: 'shooter', team: '1', Vehicle: 'tank_b', other: 'victim', otherVehicle: 'tank_a', otherLife: '7#1', x: 0, y: 0, z: 0, targetX: 1000, targetY: 0, targetZ: 0, hitLocalX: 2, hitLocalY: 1, hitLocalZ: 0, hitDirX: -1, hitDirY: 0, hitDirZ: 0, hitPart: 0x80 | 2, calibre: 120, ammoType: 'APFSDS', ammoName: '120mm_dart', hitOutcome: 'penetration', ...o };
}

describe('one match\'s hits', () => {
  it('keeps the shots, ties fires, modules and the death to them, and the turret pose', () => {
    const c = columns([
      shot(10, { hitOutcome: 'nonpenetration' }),
      shot(20, {}),
      { time: 20, event: 'fire_on', player: 'victim', life: '7#1', fireId: '12:2' },
      shot(30, { hitOutcome: 'kill' }),
      { time: 30.5, event: 'death', player: 'victim', life: '7#1', other: 'shooter', team: '2' },
      { time: 31, event: 'shot', player: 'x', otherVehicle: '' },
    ]);
    const pose = columns([
      { time: 19.9, life: '7#1', team: '2', ai: 'false', turretYaw: 90, gunPitch: 5 },
      { time: 29.9, life: '7#1', team: '2', ai: 'false', turretYaw: 0, gunPitch: 0 },
    ]);
    const b = extractHits(c, pose, match, ['hull_front', 'turret_front', 'engine']);
    expect(b.cols.n).toBe(3);
    expect(b.cols.result[0]).toBe(R_NONPEN);
    expect(b.cols.result[1]).toBe(R_PEN);
    expect(b.cols.result[2]).toBe(R_KILL);
    // The fire at the second hit, in the engine (part 2 of the list).
    expect(b.cols.effects[1] & EFFECT_BIT.fire).toBeTruthy();
    expect(b.cols.effects[1] & EFFECT_BIT.engine).toBeTruthy();
    // The death half a second after the third hit by its shooter: the killing shot; the first two are within 2.5 s? no.
    expect(b.cols.effects[2] & EFFECT_BIT.killingShot).toBeTruthy();
    expect(b.cols.effects[0] & EFFECT_BIT.lethal).toBe(0);
    // A kilometre, flat.
    expect(b.cols.flags[0] & FLAG_DIST).toBeTruthy();
    expect(b.cols.dist[0] / 4).toBeCloseTo(1000, 0);
    // The pose nearest each hit, in radians.
    expect(b.cols.flags[1] & FLAG_POSE).toBeTruthy();
    expect(b.cols.yaw[1] / 1e4).toBeCloseTo(Math.PI / 2, 3);
    // The victim's side won.
    expect(b.vehicles[b.cols.victim[0]]).toBe('tank_a');
    expect(b.vehicles[b.cols.attacker[0]]).toBe('tank_b');
    expect(b.cols.flags[0] & FLAG_WON).toBeTruthy();
    // The part word decoded.
    expect(b.cols.part[0]).toBe(1);
  });

  it('drops one-byte points of converters before 0.2.3 and old misread turrets', () => {
    const c = columns([shot(10, { hitPart: 4 })]);
    const pose = columns([{ time: 10, life: '7#1', turretYaw: 10, gunPitch: 0 }]);
    const b = extractHits(c, pose, { ...match, converterVersion: '0.2.0', gameVersion: '101421' }, null);
    expect(b.cols.lx[0]).toBe(-32768);
    expect(b.cols.flags[0] & FLAG_POSE).toBe(0);
    expect(olderThan('0.2.0', '0.2.3')).toBe(true);
    expect(olderThan('0.2.4', '0.2.3')).toBe(false);
    expect(olderThan('', '0.2.3')).toBe(false);
  });
});

/** A store of made-up hits on one plate model: plate 0 (front, 100 mm) and plate 1 (side, 30 mm). */
function storeOf(): { s: HitStore; ph: ReturnType<HitStore['platesFor']> } {
  const s = new HitStore();
  const rows: Record<string, string | number>[] = [];
  // Front: 40 hits, 10 through, square on. Side: 20 hits, 18 through, 60 degrees.
  for (let k = 0; k < 40; k++) rows.push(shot(k, { hitOutcome: k < 10 ? 'penetration' : 'nonpenetration', hitPart: 0x80 | 0, hitLocalX: 3, hitLocalY: 1, hitLocalZ: 0 }));
  const a = (60 * Math.PI) / 180;
  for (let k = 0; k < 20; k++) rows.push(shot(100 + k, { hitOutcome: k < 18 ? 'penetration' : 'nonpenetration', hitPart: 0x80 | 2, calibre: 30, ammoType: 'APDS', ammoName: '30mm_apds', hitLocalX: 0, hitLocalY: 1, hitLocalZ: 1, hitDirX: -Math.sin(a), hitDirY: 0, hitDirZ: -Math.cos(a) }));
  // The victim's side from its own row (a death long after the hits).
  rows.push({ time: 5000, event: 'death', player: 'victim', life: '7#1', other: '', team: '2' });
  s.add(extractHits(columns(rows), null, match, ['front', 'side']) as never);
  s.add(extractHits(columns([...rows.slice(0, 10), rows[rows.length - 1]]), null, { ...match, id: 'm2', winner: '1', gameVersion: '200001' }, ['front', 'side']) as never);
  s.deriveFlights();
  // The plates: front in the plane x = 3, side in z = 1.
  const front = new Float32Array([3, 0, -1, 3, 2, -1, 3, 0, 1]);
  const side = new Float32Array([-2, 0, 1, 2, 0, 1, -2, 2, 1]);
  const all = new Uint32Array(s.n).map((_, i) => i);
  const ph = s.platesFor('k', all, [{ name: 'front', part: 'hull', mm: 100, tris: front }, { name: 'side', part: 'hull', mm: 30, tris: side }], ['front', 'side'], null, null);
  return { s, ph };
}

describe('the analysis', () => {
  it('puts each hit on its plate with its angle and armour', () => {
    const { s, ph } = storeOf();
    expect(s.n).toBe(70);
    expect(ph.plate[0]).toBe(0);
    expect(ph.plate[45]).toBe(1);
    expect(ph.angle[0]).toBeCloseTo(0, 1);
    expect(ph.angle[45]).toBeCloseTo(60, 0);
    expect(ph.effMm[45]).toBeCloseTo(60, 0);
    // Ballistic speeds for the kilometre shots.
    expect(s.speedSrc[0]).toBe(3);
    expect(s.speed[0]).toBeGreaterThan(1500);
  });

  it('counts plates, intervals and colours', () => {
    const { s, ph } = storeOf();
    const st = plateStats(s, ph, 2, compileFilter(s, { gameVersions: ['200000'] }));
    expect(st[0].hits).toBe(40);
    expect(st[0].through).toBe(10);
    expect(st[0].rate).toBeCloseTo(0.25, 6);
    const [lo, hi] = wilson(10, 40);
    expect(st[0].ci[0]).toBeCloseTo(lo, 6);
    expect(lo).toBeCloseTo(0.1419, 3);
    expect(hi).toBeCloseTo(0.4019, 3);
    expect(st[1].rate).toBeCloseTo(0.9, 6);
    expect(st[1].angleMedian).toBeCloseTo(60, 0);
    expect(st[1].calibres[0]).toEqual([30, 20]);
    const col = plateColours(st, 'rate', 5);
    expect(col.diverging).toBe(true);
    expect(col.mid).toBeCloseTo(28 / 60, 6);
    expect(col.t[0]).toBeLessThan(0);
    expect(col.t[1]).toBeGreaterThan(0);
    // Too few hits: no colour.
    expect(Number.isNaN(plateColours(st, 'rate', 50).t[1])).toBe(true);
  });

  it('filters by calibre, angle, won and the effect bits', () => {
    const { s, ph } = storeOf();
    const at = new Int32Array(s.n).fill(-1);
    ph.rows.forEach((i, j) => (at[i] = j));
    const count = (f: Parameters<typeof compileFilter>[1]) => {
      const keep = compileFilter(s, f, { ph, at });
      let n = 0;
      for (let i = 0; i < s.n; i++) if (keep(i)) n++;
      return n;
    };
    expect(count({})).toBe(70);
    expect(count({ calibre: [100, null] })).toBe(50);
    expect(count({ calibre: [null, 50] })).toBe(20);
    expect(count({ angle: [50, 70] })).toBe(20);
    expect(count({ results: ['penetration'] })).toBe(28 + 10);
    expect(count({ won: 'won' })).toBe(60);
    expect(count({ won: 'lost' })).toBe(10);
    expect(count({ plates: [1] })).toBe(20);
    expect(count({ ammoTypes: ['APDS'] })).toBe(20);
    expect(count({ maps: ['other'] })).toBe(0);
    expect(count({ effects: ['fire'] })).toBe(0);
  });

  it('compares two halves and charts the rate over the angle', () => {
    const { s, ph } = storeOf();
    const d = twoProportion(10, 40, 18, 20);
    expect(d.diff).toBeCloseTo(-0.65, 6);
    expect(d.z).toBeLessThan(-3);
    const chart = rateOver(s, ph.rows, 'angle', () => true, ph, 'none', 5);
    expect(chart.kind).toBe('line');
    expect(chart.values[0][0]).toBeCloseTo(20 / 50, 6);
    expect(Math.max(...chart.values[0].filter(Number.isFinite))).toBeCloseTo(0.9, 6);
    const top = topBy(s, ph.rows, 'ammoName', () => true);
    expect(top[0].key).toBe('120mm_dart');
    expect(top[0].hits).toBe(50);
    expect(victimsOf(s, 'tank_a', 'model').size).toBe(1);
  });
});
