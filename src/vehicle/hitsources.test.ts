import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../state/types';
import { hitsFromDataset, type VehicleHit } from './hits';
import { boneRegion, regionOf } from './regions';
import { findPlaces, localFromWorld, placeOf } from './places';
import { inArea, countsByVolume, placeless } from './area';
import { figureOfVehicle } from './scene';
import { parseAcmi } from '../data/acmi';

type Row = Record<string, string | number> & { time: number; x?: number; y?: number; z?: number; yaw?: number; who?: string };

/**
 * A dataset of rows given as objects, with places (x, y, z in the world, y
 * up), headings (`yaw`, radians, clockwise from -z) and tracks (`who`): text
 * columns become categories, numbers numbers (NaN where a row has none).
 */
function dataset(rows: Row[], opts: { unitsPerMetre?: number } = {}): Dataset {
  const own = new Set(['time', 'x', 'y', 'z', 'yaw', 'who']);
  const names = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((n) => !own.has(n));
  const attrs: AttributeColumn[] = names.map((name) => {
    const isText = rows.some((r) => typeof r[name] === 'string');
    if (isText) {
      const cats = [''];
      const data = new Uint32Array(
        rows.map((r) => {
          const v = String(r[name] ?? '');
          let i = cats.indexOf(v);
          if (i < 0) i = cats.push(v) - 1;
          return i;
        }),
      );
      return { name, kind: 'category', data, min: 0, max: cats.length - 1, categories: cats };
    }
    const data = new Float32Array(rows.map((r) => (typeof r[name] === 'number' ? (r[name] as number) : NaN)));
    return { name, kind: 'number', data, min: 0, max: 0 };
  });
  const labels: string[] = [];
  const personId = new Uint32Array(
    rows.map((r) => {
      const w = r.who ?? '';
      let i = labels.indexOf(w);
      if (i < 0) i = labels.push(w) - 1;
      return i;
    }),
  );
  return {
    id: 't',
    name: 't',
    count: rows.length,
    attrs,
    px: new Float32Array(rows.map((r) => r.x ?? NaN)),
    py: new Float32Array(rows.map((r) => r.y ?? 0)),
    pz: new Float32Array(rows.map((r) => r.z ?? NaN)),
    time: new Float32Array(rows.map((r) => r.time)),
    timeSorted: true,
    yaw: rows.some((r) => r.yaw !== undefined) ? new Float32Array(rows.map((r) => r.yaw ?? NaN)) : null,
    pitch: null,
    personId,
    personLabels: labels,
    personTeam: null,
    sessionId: null,
    sessionLabels: [],
    entitySize: opts.unitsPerMetre ? opts.unitsPerMetre * 0.8 : undefined,
  } as unknown as Dataset;
}

const close = (a: number[] | null, b: number[], eps = 1e-3) => {
  expect(a).not.toBeNull();
  a!.forEach((v, i) => expect(v).toBeCloseTo(b[i], -Math.log10(eps)));
};

describe('bones and hit zones as body regions', () => {
  it('reads Unreal, Arma and Reforger names', () => {
    expect(regionOf('head')).toBe('head');
    expect(regionOf('neck_01')).toBe('head');
    expect(regionOf('spine_01')).toBe('stomach');
    expect(regionOf('spine_04')).toBe('chest');
    expect(regionOf('pelvis')).toBe('stomach');
    expect(regionOf('upperarm_l')).toBe('left_arm');
    expect(regionOf('hand_r')).toBe('right_arm');
    expect(regionOf('calf_l')).toBe('left_leg');
    expect(regionOf('rightupleg')).toBe('right_leg');
    expect(regionOf('leftforearm')).toBe('left_arm');
    expect(regionOf('LArm')).toBe('left_arm');
    expect(regionOf('RLeg')).toBe('right_leg');
    expect(regionOf('Abdomen')).toBe('stomach');
    expect(regionOf('spine3')).toBe('chest');
    // CS2's names that are no body part stay none.
    expect(regionOf('generic')).toBeNull();
    expect(regionOf('gear')).toBeNull();
    expect(boneRegion('')).toBeNull();
  });
});

describe('hits of the other replay sources', () => {
  it('reads OCAP hits and kills: victim, killer, weapon, distance, no point', () => {
    const d = dataset([
      { time: 1, who: 'Alpha', x: 0, z: 0, Event: '', Victim: '', Killer: '', Weapon: '', Type: 'Infantry', Vehicle: '' },
      { time: 2, who: 'Bravo', x: 100, z: 0, Event: '', Victim: '', Killer: '', Weapon: '', Type: 'Tank', Vehicle: 'T-72' },
      { time: 10, who: 'Alpha', x: 0, z: 0, Event: 'hit ← Bravo (125mm, 100 m)', Victim: 'Alpha', Killer: 'Bravo', Weapon: '125mm', Type: 'Infantry', Vehicle: '', Distance: 100 },
      { time: 10, who: 'Bravo', x: 100, z: 0, Event: 'hit → Alpha (125mm, 100 m)', Victim: 'Alpha', Killer: 'Bravo', Weapon: '125mm', Type: 'Tank', Vehicle: 'T-72', Distance: 100 },
      { time: 11, who: 'Alpha', x: 0, z: 0, Event: 'killed ← Bravo (125mm, 100 m)', Victim: 'Alpha', Killer: 'Bravo', Weapon: '125mm', Type: 'Infantry', Vehicle: '', Distance: 100 },
      { time: 20, who: 'Bravo', x: 100, z: 0, Event: 'hit ← Alpha (RPG, 90 m)', Victim: 'Bravo', Killer: 'Alpha', Weapon: 'RPG', Type: 'Tank', Vehicle: 'T-72', Distance: 90 },
    ]);
    const set = hitsFromDataset(d);
    expect(set.source).toBe('ocap');
    // The killer's own "hit →" row is not a second hit.
    expect(set.hits).toHaveLength(3);
    const [hit, kill, onTank] = set.hits;
    expect(hit).toMatchObject({ vehicle: 'soldier', victim: 'Alpha', shooter: 'Bravo', weapon: '125mm', distance: 100, local: null, fatal: true });
    expect(kill).toMatchObject({ outcome: 'kill', killingShot: true });
    expect(onTank).toMatchObject({ vehicle: 'T-72', victim: 'Bravo', shooter: 'Alpha', outcome: 'hit' });
    expect(set.vehicles.get('soldier')!.kind).toBe('person');
    expect(set.vehicles.get('T-72')!.kind).toBe('Tank');
  });

  it("reads Dota 2's hurts: the hero, the attacker, the ability, the damage; the killer's last is the killing one", () => {
    const d = dataset([
      { time: 1, who: 'p1', player: 'p1', hero: 'Doom', life: '1', event: 'hurt', other: 'hero_hoodwink', value: 46, text: '', x: 0, z: 0 },
      { time: 2, who: 'p1', player: 'p1', hero: 'Doom', life: '1', event: 'hurt', other: 'hero_hoodwink', value: 120, text: 'hoodwink_bushwhack', x: 0, z: 0 },
      { time: 2.5, who: 'p1', player: 'p1', hero: 'Doom', life: '1', event: 'death', other: 'hero_hoodwink', x: 0, z: 0 },
    ]);
    const set = hitsFromDataset(d);
    expect(set.source).toBe('dota');
    expect(set.hits).toHaveLength(2);
    expect(set.hits[0]).toMatchObject({ vehicle: 'Doom', shooter: 'hero_hoodwink', damage: 46, weapon: '', outcome: 'damage', toDeath: 1.5 });
    expect(set.hits[1]).toMatchObject({ weapon: 'hoodwink_bushwhack', killingShot: true, outcome: 'kill' });
    expect(set.hits[1].share).toBeCloseTo(120 / 166);
    expect(figureOfVehicle(set.vehicles.get('Doom')!)).toBe('soldier');
  });

  it("places Squad's vehicle hits in the vehicle's frame from its own rows, with the damage of the moment", () => {
    // A vehicle facing east (yaw 90 deg), 100 units a metre; struck 2 m ahead and 1 m to its right, 0.5 m up.
    const yaw = Math.PI / 2;
    const d = dataset(
      [
        { time: 0, who: 'BP_Tank', player: 'BP_Tank', pawn: 'BP_Tank', entity: '7', event: 'spawn', health: 1000, x: 1000, y: 0, z: 2000, yaw, detail: '' },
        { time: 5, who: 'BP_Tank', player: 'BP_Tank', pawn: 'BP_Tank', entity: '7', event: 'vehicle', health: NaN, x: 1000, y: 0, z: 2000, yaw, detail: '' },
        { time: 6, who: 'BP_Tank', player: 'BP_Tank', pawn: 'BP_Tank', entity: '7', event: 'hit', x: 1200, y: 50, z: 2100, yaw: 0, detail: 'SQDamageType_AP' },
        { time: 6, who: 'BP_Tank', player: 'BP_Tank', pawn: 'BP_Tank', entity: '7', event: 'damaged', health: 700, x: 1000, y: 0, z: 2000, yaw, detail: '' },
        { time: 7, who: 'BP_Tank', player: 'BP_Tank', pawn: 'BP_Tank', entity: '7', event: 'destroyed', health: 0, x: 1000, y: 0, z: 2000, yaw, detail: '' },
      ],
      { unitsPerMetre: 100 },
    );
    const set = hitsFromDataset(d);
    expect(set.source).toBe('squad');
    expect(set.hits).toHaveLength(1);
    const h = set.hits[0];
    close(h.local, [2, 0.5, 1]);
    expect(h).toMatchObject({ vehicle: 'BP_Tank', weapon: 'SQDamageType_AP', damage: 300, healthAfter: 700, outcome: 'kill', killingShot: true, life: '7' });
  });

  it('turns a world point into a unit frame by its heading', () => {
    const d = dataset([{ time: 0, who: 'a', x: 0, y: 0, z: 0, yaw: 0 }]);
    // Heading north (-z): 3 m north is ahead, 1 m east is right.
    close(localFromWorld(d, 0, 1, 2, -3), [3, 2, 1]);
  });

  it("reads IL-2's hits on the player's aircraft, in its frame, with the force", () => {
    const d = dataset([{ time: 3, who: 'me', player: 'me', Vehicle: 'Bf 109 G-6', event: 'hit', local_x: 1.5, local_y: 0.2, local_z: -3, force: 870, force_x: 0, force_y: 0, force_z: 2 }]);
    const set = hitsFromDataset(d);
    expect(set.source).toBe('il2');
    expect(set.hits[0]).toMatchObject({ vehicle: 'Bf 109 G-6', local: [1.5, Math.fround(0.2), -3], dir: [0, 0, 1], code: 'hit 870 N' });
  });

  it("reads a victim's row naming a bone: a soldier hit on that body part", () => {
    const d = dataset([{ time: 3, who: 'Joe', player: 'Joe', event: 'impact', other: 'Ann', hitBone: 'upperarm_l', damage: 30, health: 70 }]);
    const set = hitsFromDataset(d);
    expect(set.hits[0]).toMatchObject({ vehicle: 'soldier', victim: 'Joe', shooter: 'Ann', region: 'upperarm_l', damage: 30, outcome: 'damage' });
    expect(regionOf(set.hits[0].region!)).toBe('left_arm');
  });
});

describe('Tacview hits', () => {
  const acmi = [
    'FileType=text/acmi/tacview',
    'FileVersion=2.2',
    '0,ReferenceLongitude=0,ReferenceLatitude=0',
    '#0',
    '101,T=0|0|5000|0|0|0,Type=Air+FixedWing,Name=F-16C_50,Pilot=Viper,Coalition=Allies',
    '201,T=0.02|0|5000|0|0|90,Type=Air+FixedWing,Name=MiG-29A,Pilot=Fulcrum,Coalition=Enemies,Health=1',
    '301,T=0.001|0|5000|0|0|90,Type=Weapon+Missile,Name=AIM-120C,Parent=101',
    '#10',
    '201,T=0.02|0|5000|0|0|90,Health=1',
    '301,T=0.0199|0|5000|0|0|90',
    '#10.5',
    '-301',
    '#11',
    '201,T=0.02|0|5000|0|0|90,Health=0.4',
    '0,Event=Timeout|SourceId:101|AmmoType:AIM-120C|TargetId:201|Outcome:Kill',
    '#12',
    '0,Event=Destroyed|201|',
    '#20',
    '101,T=0|0|5000|0|0|0',
  ].join('\n');

  function load(): Dataset {
    const t = parseAcmi(acmi, 'test');
    // Rows as the viewer loads them: X east, Altitude up, Y north as -z; Heading as the yaw.
    const col = (n: string) => t.data[t.columns.indexOf(n)];
    const rows: Row[] = [];
    for (let i = 0; i < t.rows; i++) {
      const r: Row = { time: (col('Time') as Float64Array)[i], who: (col('Object') as string[])[i] };
      r.x = (col('X') as Float64Array)[i];
      r.y = (col('Altitude') as Float64Array)[i];
      r.z = -(col('Y') as Float64Array)[i];
      r.yaw = ((col('Heading') as Float64Array)[i] * Math.PI) / 180;
      for (const n of ['Type', 'Name', 'Event', 'EventObjects', 'Parent']) if (t.columns.includes(n)) r[n] = (col(n) as string[])[i] ?? '';
      if (t.columns.includes('Health')) r.Health = (col('Health') as Float64Array)[i];
      if (t.columns.includes('Roll')) r.Roll = (col('Roll') as Float64Array)[i];
      rows.push(r);
    }
    // Their own rows by track and time, as the viewer keeps them.
    rows.sort((a, b) => a.time - b.time);
    return dataset(rows);
  }

  it('keeps every field of a Timeout event', () => {
    const t = parseAcmi(acmi, 'test');
    const ev = t.data[t.columns.indexOf('Event')] as string[];
    expect(ev).toContain('Timeout: SourceId:101|AmmoType:AIM-120C|TargetId:201|Outcome:Kill');
  });

  it('places a missile that ended at an aircraft on it, from its launcher, with the outcome and the damage', () => {
    const d = load();
    const set = hitsFromDataset(d);
    expect(set.source).toBe('acmi');
    expect(set.hits).toHaveLength(1);
    const h = set.hits[0];
    expect(h.vehicle).toBe('MiG-29A');
    expect(h.shooter).toMatch(/Viper/);
    expect(h.weapon).toBe('AIM-120C');
    expect(h.killingShot).toBe(true);
    expect(h.outcome).toBe('kill');
    expect(h.damage).toBeCloseTo(60);
    // The missile ended ~11 m short of the MiG along its own way: behind it (the MiG heads east, the missile came from the west).
    expect(h.local).not.toBeNull();
    expect(h.local![0]).toBeLessThan(-5);
    expect(Math.abs(h.local![2])).toBeLessThan(1);
    expect(h.dir![0]).toBeGreaterThan(0.9);
    expect(set.vehicles.get('MiG-29A')!.kind).toBe('Air+FixedWing');
  });
});

describe('the area filter of the hit analysis', () => {
  const rows: Row[] = [
    { time: 0, who: 'Red', player: 'Red', x: 0, z: 0, event: 'position' },
    { time: 0, who: 'Blue', player: 'Blue', x: 500, z: 0, event: 'position' },
    // Shooter rows (War Thunder's way): Red fires on Blue, Blue on Red.
    { time: 5, who: 'Red', player: 'Red', Vehicle: 'tank_a', x: 0, z: 0, event: 'shot', other: 'Blue', otherVehicle: 'tank_b', hitLocalX: 1, hitLocalY: 1, hitLocalZ: 1 },
    { time: 5.5, who: 'Blue', player: 'Blue', x: 500, z: 0, event: 'position' },
    { time: 6, who: 'Blue', player: 'Blue', Vehicle: 'tank_b', x: 500, z: 0, event: 'shot', other: 'Red', otherVehicle: 'tank_a', hitLocalX: 1, hitLocalY: 1, hitLocalZ: 1 },
    { time: 6.2, who: 'Red', player: 'Red', x: 0, z: 0, event: 'position' },
  ];

  it("finds both parties' places: the row's own, the other's nearest sample", () => {
    const d = dataset(rows);
    const set = hitsFromDataset(d);
    const p = findPlaces(d, set.hits);
    const onB = set.hits.find((h) => h.vehicle === 'tank_b')!;
    expect(placeOf(p, onB, 'shooter')).toEqual([0, 0, 0]);
    expect(placeOf(p, onB, 'victim')).toEqual([500, 0, 0]);
    expect(onB.distance).toBeCloseTo(500);
    expect(p.victims).toBe(2);
  });

  it('keeps the hits whose victim, or shooter, was inside', () => {
    const d = dataset(rows);
    const set = hitsFromDataset(d);
    const nearOrigin = (x: number, _y: number, z: number) => Math.hypot(x, z) < 100;
    expect(inArea(d, set, set.hits, nearOrigin, 'victim').map((h: VehicleHit) => h.vehicle)).toEqual(['tank_a']);
    expect(inArea(d, set, set.hits, nearOrigin, 'shooter').map((h: VehicleHit) => h.vehicle)).toEqual(['tank_b']);
    expect(placeless(d, set, set.hits, 'victim')).toBe(0);
    const box = { id: 'v1', name: 'Box 1', color: '#fff', visible: true, op: 'include' as const, shape: { kind: 'box' as const, center: [0, 0, 0], size: [200, 50, 200], yaw: 0, pitch: 0, roll: 0 } };
    const counts = countsByVolume(d, set, set.hits, [box as never], 'victim');
    expect(counts.get('v1')).toBe(1);
  });
});
