import { describe, expect, it } from 'vitest';
import { parseSpawnPoints, spawnOwners, spawnShown, spawnState, vehicleKindIndex, VEHICLE_KINDS } from './layoutSpawns';
import { parseLevelLayouts } from './levelLayouts';
import { NO_HEADING, SPAWN_INSTANCE_FLOATS, SpawnMarkLayer, spawnGlslFs, spawnGlslVs, spawnInstances, spawnWgsl } from '../render/spawnMarks';
import type { ObjectiveTimeline } from './objectives';

const objectives = [
  { id: 'A', type: 'capture_zone', letter: 'A', name: 'Storage', position: [100, 0, 0], radius: 15 },
  { id: 'HQ1', type: 'base', team: 1, letter: '', name: 'HQ', position: [-500, 0, 0] },
];
const spawns = [
  { type: 'spawn', team: 1, position: [102, 0, 4], heading: 90, base: 'A', baseId: 'A', baseSource: 'link', rule: 'flag' },
  { type: 'spawn', team: null, position: [98, 0, -4], heading: 270, base: 'A', baseId: 'A', baseSource: 'link', rule: 'flag' },
  { type: 'vehicle_spawn', team: 1, position: [-490, 0, 0], heading: 0, base: 'HQ', baseId: 'HQ1', rule: 'hq', vehicleKind: 'tank' },
  { type: 'spawn', team: 2, position: [0, 0, 0.5], stage: 2, stages: [2, 3] },
  { type: 'spawn', position: [5, 0, 5] },
  { type: 'spawn', team: 1 },
];

describe('layout spawn points', () => {
  const owners = spawnOwners(objectives);
  const points = parseSpawnPoints(spawns, owners);

  it('reads every spawn with a position, its owner, rule and vehicle', () => {
    expect(points).toHaveLength(5);
    expect(points[0]).toMatchObject({ owner: 'A', rule: 'flag', team: 1, heading: 90, vehicle: false, ownerSource: 'link' });
    expect(points[2]).toMatchObject({ owner: 'HQ1', rule: 'hq', vehicle: true, kind: VEHICLE_KINDS.indexOf('tank') });
    expect(points[3]).toMatchObject({ rule: 'stage', stages: [2, 3] });
    // Another game's layout: a position and nothing else is a spawn anyone can use.
    expect(points[4]).toMatchObject({ rule: 'free', team: null, heading: null, owner: '' });
  });

  it('knows a vehicle by its kind or its class', () => {
    expect(vehicleKindIndex('helicopter')).toBe(VEHICLE_KINDS.indexOf('helicopter'));
    expect(vehicleKindIndex('', 'heli_attack')).toBe(VEHICLE_KINDS.indexOf('helicopter'));
    expect(vehicleKindIndex('', 'tank_mbt')).toBe(VEHICLE_KINDS.indexOf('tank'));
    expect(vehicleKindIndex('', 'static_aa')).toBe(VEHICLE_KINDS.indexOf('stationary'));
    expect(vehicleKindIndex('', 'mystery')).toBe(0);
  });

  it("reads another game's kind word as the vehicle", () => {
    const wt = parseSpawnPoints(
      [
        { type: 'spawn', team: 1, vehicle: 'ground', position: [0, 0, 0] },
        { type: 'vehicle_spawn', vehicle: 'aircraft', position: [0, 0, 0] },
        { type: 'vehicle_spawn', vehicle: 'ship', position: [0, 0, 0] },
        { type: 'vehicle_spawn', vehicle: 'helicopter', position: [0, 0, 0] },
        { type: 'vehicle_spawn', vehicle: 'convoy', position: [0, 0, 0] },
        { type: 'spawn', vehicle: 'hero', position: [0, 0, 0] },
      ],
      new Map(),
    );
    expect(wt.map((p) => (p.vehicle ? VEHICLE_KINDS[p.kind] : 'soldier'))).toEqual(['tank', 'plane', 'boat', 'helicopter', 'car', 'soldier']);
  });

  it('filters by flag, team and stage', () => {
    const all = { owner: null, team: null, stage: null };
    expect(points.filter((p) => spawnShown(p, all))).toHaveLength(5);
    expect(points.filter((p) => spawnShown(p, { ...all, owner: 'A' }))).toHaveLength(2);
    // A spawn of no team is shown with either team's.
    expect(points.filter((p) => spawnShown(p, { ...all, team: 2 }))).toHaveLength(3);
    expect(points.filter((p) => spawnShown(p, { ...all, stage: 3 }))).toHaveLength(5);
    expect(points.filter((p) => spawnShown(p, { ...all, stage: 1 }))).toHaveLength(4);
  });

  it('is in use while its side holds the flag, and a flag spawn of no team is its holder', () => {
    expect(spawnState(points[0], () => 1)).toEqual({ active: true, team: 1 });
    expect(spawnState(points[0], () => 2)).toEqual({ active: false, team: 1 });
    expect(spawnState(points[1], () => 2)).toEqual({ active: true, team: 2 });
    expect(spawnState(points[1], () => 0)).toEqual({ active: false, team: null });
    // No word of the flag in the replay: in use.
    expect(spawnState(points[0], () => undefined)).toEqual({ active: true, team: 1 });
    // A headquarters' spawn always.
    expect(spawnState(points[2], () => 2).active).toBe(true);
  });

  it('come with a parsed layout, stage by stage', () => {
    const doc = parseLevelLayouts({ format: '3dheat-layouts', game: 'g', level: 'l', layouts: [{ id: 'm', objectives, zones: [], spawns }] });
    const whole = doc!.layouts.find((l) => l.stage === null)!;
    expect(whole.spawnPoints).toHaveLength(5);
    expect(whole.spawnOwners.get('HQ1')?.team).toBe(1);
  });
});

describe('spawn markers', () => {
  const doc = parseLevelLayouts({ format: '3dheat-layouts', game: 'g', level: 'l', layouts: [{ id: 'm', objectives, zones: [], spawns }] })!;
  const layout = doc.layouts[0];
  const colour = (t: number): [number, number, number] => (t === 1 ? [0, 0, 1] : t === 2 ? [1, 0, 0] : [0, 1, 0]);

  it('write one instance a shown point: place, heading, colour, flags, owner', () => {
    const out = { data: new Float32Array(0) };
    const n = spawnInstances(layout.spawnPoints, layout.spawnOwners, { owner: null, team: null, stage: null }, colour, () => undefined, out);
    expect(n).toBe(5);
    const d = out.data;
    expect(d[0]).toBe(102);
    expect(d[3]).toBeCloseTo(Math.PI / 2);
    expect([d[4], d[5], d[6]]).toEqual([0, 0, 1]);
    expect(d[7]).toBe(0);
    expect([d[8], d[10], d[11]]).toEqual([100, 0, 1]);
    // The tank at the HQ: a vehicle of its kind, a line to the HQ.
    const v = 2 * SPAWN_INSTANCE_FLOATS;
    expect(d[v + 7]).toBe(1 + VEHICLE_KINDS.indexOf('tank') * 4);
    expect(d[v + 8]).toBe(-500);
    // No heading, no owner.
    const f = 4 * SPAWN_INSTANCE_FLOATS;
    expect(d[f + 3]).toBe(NO_HEADING);
    expect(d[f + 11]).toBe(0);
  });

  it('are made again only when a flag changes hands', () => {
    const zones = new Map([['A', { owner: [0, 1], times: [0, 10], progress: [0, 0] }]]);
    const timeline = { zones, events: [] } as unknown as ObjectiveTimeline;
    const layer = new SpawnMarkLayer();
    const frame = { layout, mode: 'points' as const, lines: true, filter: { owner: null, team: null, stage: null }, teamColor: colour, timeline, t: 1 };
    const a = layer.build(frame);
    expect(layer.build({ ...frame, t: 5 })).toBe(a);
    const b = layer.build({ ...frame, t: 12 });
    expect(b).not.toBe(a);
    expect(layer.build({ ...frame, mode: 'groups' })).toBeNull();
  });

  it('have shaders for both backends', () => {
    expect(spawnWgsl()).toContain('fn vsMark');
    expect(spawnWgsl()).toContain('fn fsLine');
    for (const line of [false, true]) {
      expect(spawnGlslVs(line)).toContain('void main()');
      expect(spawnGlslFs(line)).toContain('outColor');
    }
  });
});
