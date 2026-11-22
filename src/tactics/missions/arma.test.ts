import { describe, expect, it } from 'vitest';
import { derapify, derapifyText, parseSqm, sqmClass, sqmItems, sqmSpan, sqmStr } from './sqm';
import { armaSqm, pboMissionSqm, readArmaMission } from './arma';
import { newArmaMissionText, patchArmaMissionText, replaceInPbo, writeArmaMission } from './armaWrite';
import { missionToPlan } from './index';
import { planToMission } from './fromPlan';
import { routeOf, type Plan } from '../plan';

/** A small Eden mission as the editor writes one, every name and number made up. */
const EDEN = [
  'version=54;',
  'class EditorData',
  '{',
  '\tclass ItemIDProvider',
  '\t{',
  '\t\tnextID=9;',
  '\t};',
  '};',
  'binarizationWanted=0;',
  'class Mission',
  '{',
  '\tclass Intel',
  '\t{',
  '\t\tbriefingName="Test raid";',
  '\t\tyear=2035;',
  '\t\tmonth=7;',
  '\t\tday=8;',
  '\t\thour=6;',
  '\t\tminute=30;',
  '\t};',
  '\tclass Entities',
  '\t{',
  '\t\titems=3;',
  '\t\tclass Item0',
  '\t\t{',
  '\t\t\tdataType="Group";',
  '\t\t\tside="West";',
  '\t\t\tclass Entities',
  '\t\t\t{',
  '\t\t\t\titems=4;',
  '\t\t\t\tclass Item0',
  '\t\t\t\t{',
  '\t\t\t\t\tdataType="Object";',
  '\t\t\t\t\tclass PositionInfo',
  '\t\t\t\t\t{',
  '\t\t\t\t\t\tposition[]={1000,5.5,2000};',
  '\t\t\t\t\t\tangles[]={0,1.5707964,0};',
  '\t\t\t\t\t};',
  '\t\t\t\t\tside="West";',
  '\t\t\t\t\tflags=6;',
  '\t\t\t\t\tclass Attributes',
  '\t\t\t\t\t{',
  '\t\t\t\t\t\tname="lead";',
  '\t\t\t\t\t};',
  '\t\t\t\t\tid=1;',
  '\t\t\t\t\ttype="B_Soldier_TL_F";',
  '\t\t\t\t};',
  '\t\t\t\tclass Item1',
  '\t\t\t\t{',
  '\t\t\t\t\tdataType="Object";',
  '\t\t\t\t\tclass PositionInfo',
  '\t\t\t\t\t{',
  '\t\t\t\t\t\tposition[]={1003,5.5,1998};',
  '\t\t\t\t\t};',
  '\t\t\t\t\tside="West";',
  '\t\t\t\t\tflags=4;',
  '\t\t\t\t\tid=2;',
  '\t\t\t\t\ttype="B_Soldier_F";',
  '\t\t\t\t};',
  '\t\t\t\tclass Item2',
  '\t\t\t\t{',
  '\t\t\t\t\tdataType="Waypoint";',
  '\t\t\t\t\tposition[]={1200,6,2300};',
  '\t\t\t\t\ttype="Move";',
  '\t\t\t\t\tclass Effects',
  '\t\t\t\t\t{',
  '\t\t\t\t\t};',
  '\t\t\t\t\tshowWP="NEVER";',
  '\t\t\t\t\tid=3;',
  '\t\t\t\t};',
  '\t\t\t\tclass Item3',
  '\t\t\t\t{',
  '\t\t\t\t\tdataType="Waypoint";',
  '\t\t\t\t\tposition[]={1400,7,2600};',
  '\t\t\t\t\ttype="SeekAndDestroy";',
  '\t\t\t\t\tcombatMode="RED";',
  '\t\t\t\t\tcombat="COMBAT";',
  '\t\t\t\t\tclass Effects',
  '\t\t\t\t\t{',
  '\t\t\t\t\t};',
  '\t\t\t\t\tshowWP="NEVER";',
  '\t\t\t\t\tid=4;',
  '\t\t\t\t};',
  '\t\t\t};',
  '\t\t\tclass Attributes',
  '\t\t\t{',
  '\t\t\t};',
  '\t\t\tid=0;',
  '\t\t};',
  '\t\tclass Item1',
  '\t\t{',
  '\t\t\tdataType="Group";',
  '\t\t\tside="East";',
  '\t\t\tclass Entities',
  '\t\t\t{',
  '\t\t\t\titems=1;',
  '\t\t\t\tclass Item0',
  '\t\t\t\t{',
  '\t\t\t\t\tdataType="Object";',
  '\t\t\t\t\tclass PositionInfo',
  '\t\t\t\t\t{',
  '\t\t\t\t\t\tposition[]={1600,4,2600};',
  '\t\t\t\t\t};',
  '\t\t\t\t\tside="East";',
  '\t\t\t\t\tflags=6;',
  '\t\t\t\t\tid=6;',
  '\t\t\t\t\ttype="O_Soldier_F";',
  '\t\t\t\t};',
  '\t\t\t};',
  '\t\t\tclass Attributes',
  '\t\t\t{',
  '\t\t\t};',
  '\t\t\tid=5;',
  '\t\t};',
  '\t\tclass Item2',
  '\t\t{',
  '\t\t\tdataType="Marker";',
  '\t\t\tposition[]={1500,0,2500};',
  '\t\t\tname="obj_1";',
  '\t\t\ttype="mil_objective";',
  '\t\t\tid=7;',
  '\t\t};',
  '\t};',
  '\tclass Connections',
  '\t{',
  '\t\tclass Links',
  '\t\t{',
  '\t\t\titems=1;',
  '\t\t\tclass Item0',
  '\t\t\t{',
  '\t\t\t\tlinkID=0;',
  '\t\t\t\titem0=6;',
  '\t\t\t\titem1=3;',
  '\t\t\t};',
  '\t\t};',
  '\t};',
  '};',
  '',
].join('\r\n');

const LEGACY = [
  'version=12;',
  'class Mission',
  '{',
  '\tclass Groups',
  '\t{',
  '\t\titems=1;',
  '\t\tclass Item0',
  '\t\t{',
  '\t\t\tside="EAST";',
  '\t\t\tclass Vehicles',
  '\t\t\t{',
  '\t\t\t\titems=1;',
  '\t\t\t\tclass Item0',
  '\t\t\t\t{',
  '\t\t\t\t\tposition[]={500,10,800};',
  '\t\t\t\t\tazimut=90;',
  '\t\t\t\t\tid=0;',
  '\t\t\t\t\tside="EAST";',
  '\t\t\t\t\tvehicle="O_MBT_02_cannon_F";',
  '\t\t\t\t\tleader=1;',
  '\t\t\t\t};',
  '\t\t\t};',
  '\t\t\tclass Waypoints',
  '\t\t\t{',
  '\t\t\t\titems=1;',
  '\t\t\t\tclass Item0',
  '\t\t\t\t{',
  '\t\t\t\t\tposition[]={900,10,1200};',
  '\t\t\t\t\tcombat="SAFE";',
  '\t\t\t\t};',
  '\t\t\t};',
  '\t\t};',
  '\t};',
  '};',
  '',
].join('\n');

const plan = (text: string, name = 'raid.Stratis/mission.sqm') => missionToPlan(readArmaMission(text, name));
const back = (text: string, p: Plan) => patchArmaMissionText(text, planToMission(p));

describe('Arma 3 missions read for writing back', () => {
  it('reads Eden waypoint entities, behaviours, ids, the world from the folder', () => {
    const m = readArmaMission(EDEN, 'raid.Stratis/mission.sqm');
    expect(m.map).toBe('Arma 3: Stratis');
    expect(m.groups.map((g) => g.ref)).toEqual(['g:0', 'g:5']);
    expect(m.groups[0].units.map((u) => u.ref)).toEqual(['1', '2']);
    expect(m.groups[0].route.map((w) => w.at)).toEqual([
      { x: 1000, y: 5.5, z: -2000 },
      { x: 1200, y: 6, z: -2300 },
      { x: 1400, y: 7, z: -2600 },
    ]);
    expect(m.groups[0].route[2].tasks?.map((t) => `${t.kind}=${t.state ?? ''}`)).toEqual(['sweep=', 'roe=free', 'alarm=combat']);
    expect(m.info).toMatchObject({ date: { year: 2035, month: 7, day: 8 }, start: 6 * 3600 + 30 * 60 });
  });

  it('keeps where each value lies', () => {
    const root = parseSqm(EDEN);
    const g = sqmItems(sqmClass(sqmClass(root.Mission)!.Entities)!)[0];
    const e = sqmSpan(g)!.entries.side;
    expect(EDEN.slice(e.valueStart, e.valueEnd)).toBe('"West"');
    expect(EDEN.slice(sqmSpan(g)!.start, sqmSpan(g)!.end)).toMatch(/^class Item0[\s\S]*\};$/);
  });
});

describe('Arma 3 missions written back', () => {
  it('gives the very same file when nothing changed', () => {
    expect(back(EDEN, plan(EDEN)).text).toBe(EDEN);
    expect(back(LEGACY, plan(LEGACY)).text).toBe(LEGACY);
  });

  it('moves and turns a unit, moves a waypoint and changes its task, value by value', () => {
    const p = plan(EDEN);
    const lead = p.figures.find((f) => f.label === 'lead')!;
    lead.keys[0] = { ...lead.keys[0], x: 1010, yaw: Math.PI };
    const r = routeOf(p, lead.id, 0)!;
    r.points[1] = { ...r.points[1], x: 1210 };
    p.tasks = p.tasks.filter((t) => t.kind !== 'sweep');
    const out = back(EDEN, p);
    expect(out.summary.changed).toEqual(['Group 1']);
    expect(out.text).toContain('position[]={1010,5.5,2000};');
    expect(out.text).toContain('angles[]={0,3.141592653589793,0};');
    expect(out.text).toContain('position[]={1210,6,2300};');
    expect(out.text).not.toContain('SeekAndDestroy');
    expect(out.text).toContain('combatMode="RED";');
    // Only those lines changed.
    const a = EDEN.split('\r\n');
    const b = out.text.split('\r\n');
    expect(b).toHaveLength(a.length);
    expect(a.filter((l, i) => l !== b[i])).toHaveLength(4);
    const again = readArmaMission(out.text, 'raid.Stratis/mission.sqm');
    expect(again.groups[0].route[2].tasks?.map((t) => t.name)).toEqual(['RED', 'COMBAT']);
  });

  it('adds a waypoint, takes a group and a unit out, adds a group with a crewed vehicle', () => {
    const p = plan(EDEN);
    const lead = p.figures.find((f) => f.label === 'lead')!;
    const r = routeOf(p, lead.id, 0)!;
    r.points.splice(2, 0, { x: 1300, y: 6, z: -2450 });
    const enemy = p.figures.find((f) => f.label === 'O_Soldier_F')!;
    const second = p.figures.find((f) => f.label === 'B_Soldier_F')!;
    p.figures = p.figures.filter((f) => f !== enemy && f !== second);
    p.figures.push({ id: 'tank', kind: 'mbt', team: 'blufor', label: 'Hammer', keys: { 0: { x: 3000, y: 10, z: -4000, yaw: 0 } }, from: 0 });
    const out = back(EDEN, p);
    expect(out.summary.removed).toEqual(['g:5']);
    expect(out.summary.added).toEqual(['Hammer']);
    expect(out.summary.warnings.map((w) => w.code)).toEqual(expect.arrayContaining(['removed', 'arma-crew']));
    const m = readArmaMission(out.text, 'raid.Stratis/mission.sqm');
    expect(m.groups.map((g) => g.units.map((u) => u.type))).toEqual([['B_Soldier_TL_F'], ['B_crew_F', 'B_crew_F', 'B_MBT_01_cannon_F']]);
    expect(m.groups[0].route.map((w) => w.at.x)).toEqual([1000, 1200, 1300, 1400]);
    // The link to the group taken out went with it; new ids past the provider's, which moved on.
    expect(out.text).not.toContain('item0=6;');
    expect(out.text).toMatch(/nextID=\d+;/);
    const ids = [...out.text.matchAll(/\bid=(\d+);/g)].map((x) => Number(x[1]));
    expect(new Set(ids).size).toBe(ids.length);
    const next = Number(/nextID=(\d+);/.exec(out.text)![1]);
    expect(Math.max(...ids)).toBeLessThan(next);
    expect(out.text).toContain('role=1;');
    // Items numbered from 0 with the count.
    const root = parseSqm(out.text);
    const top = sqmClass(sqmClass(root.Mission)!.Entities)!;
    expect(top.items).toBe(3);
    expect(sqmItems(top).map((it) => sqmStr(it.dataType))).toEqual(['Group', 'Marker', 'Group']);
    // The file's line ends kept.
    expect(out.text.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('writes the older layout: azimut, new waypoints in its own list', () => {
    const p = plan(LEGACY, 'old.Altis.pbo');
    const f = p.figures[0];
    f.keys[0] = { ...f.keys[0], yaw: 0 };
    routeOf(p, f.id, 0)!.points.push({ x: 1500, y: 10, z: -1500 });
    const out = back(LEGACY, p);
    expect(out.text).toContain('azimut=0;');
    expect(out.text).toContain('items=2;');
    expect(out.text).toContain('position[]={1500,10,1500};');
    expect(out.text).toContain('combat="SAFE";');
    expect(readArmaMission(out.text, 'old.Altis.pbo').groups[0].route).toHaveLength(3);
  });

  it('makes a new Eden mission', () => {
    const p = plan(EDEN);
    const r = newArmaMissionText('Altis', planToMission(p));
    expect(r.summary.mode).toBe('new');
    const m = readArmaMission(r.text, 'new.Altis/mission.sqm');
    expect(m.groups.map((g) => g.units.length)).toEqual([2, 1]);
    expect(m.groups[0].route).toHaveLength(3);
    expect(m.info?.date).toEqual({ year: 2035, month: 7, day: 8 });
    expect(r.summary.warnings.map((w) => w.code)).toContain('arma-new');
  });
});

/** A binarised config, as the game's tools write one: made by hand here. */
function rap(): Uint8Array {
  const out: number[] = [];
  const z = (s: string) => out.push(...new TextEncoder().encode(s), 0);
  const u32 = (n: number) => out.push(n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255);
  const f32 = (n: number) => out.push(...new Uint8Array(new Float32Array([n]).buffer));
  out.push(0, 0x72, 0x61, 0x50);
  u32(0);
  u32(8);
  u32(0);
  // The top: no base, 2 entries: version=12; class Mission (body later).
  z('');
  out.push(2);
  out.push(1, 2);
  z('version');
  u32(12);
  out.push(0);
  z('Mission');
  const at = out.length;
  u32(0);
  const body = out.length;
  out[at] = body & 255;
  out[at + 1] = body >> 8;
  // Mission: class Groups { items=1; class Item0 { side="WEST"; class Vehicles { items=1; class Item0 { position[]={...}; vehicle="..."; }; }; }; }
  const cls = (entries: () => void, n: number) => {
    z('');
    out.push(n);
    entries();
  };
  const sub = (name: string): number => {
    out.push(0);
    z(name);
    const p = out.length;
    u32(0);
    return p;
  };
  const fix = (p: number) => {
    const v = out.length;
    out[p] = v & 255;
    out[p + 1] = (v >> 8) & 255;
  };
  let pg = 0;
  cls(() => (pg = sub('Groups')), 1);
  fix(pg);
  let pi = 0;
  cls(() => {
    out.push(1, 2);
    z('items');
    u32(1);
    pi = sub('Item0');
  }, 2);
  fix(pi);
  let pv = 0;
  cls(() => {
    out.push(1, 0);
    z('side');
    z('WEST');
    pv = sub('Vehicles');
  }, 2);
  fix(pv);
  let pu = 0;
  cls(() => {
    out.push(1, 2);
    z('items');
    u32(1);
    pu = sub('Item0');
  }, 2);
  fix(pu);
  cls(() => {
    out.push(2);
    z('position');
    out.push(3, 1);
    f32(100.5);
    out.push(1);
    f32(3.25);
    out.push(1);
    f32(200);
    out.push(1, 1);
    z('azimut');
    f32(45);
    out.push(1, 0);
    z('vehicle');
    z('B_Soldier_F');
  }, 3);
  return new Uint8Array(out);
}

/** A .pbo holding a mission.sqm, with its checksum. */
async function pbo(sqm: Uint8Array): Promise<Uint8Array> {
  const out: number[] = [];
  const z = (s: string) => out.push(...new TextEncoder().encode(s), 0);
  const u32 = (n: number) => out.push(n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255);
  z('');
  u32(0x56657273);
  u32(0);
  u32(0);
  u32(0);
  u32(0);
  z('prefix');
  z('test');
  z('');
  z('mission.sqm');
  u32(0);
  u32(sqm.length);
  u32(0);
  u32(0);
  u32(sqm.length);
  z('');
  for (let i = 0; i < 20; i++) out.push(0);
  out.push(...sqm);
  const body = new Uint8Array(out);
  const sum = new Uint8Array(await crypto.subtle.digest('SHA-1', body));
  return new Uint8Array([...body, 0, ...sum]);
}

describe('binarised missions and mission .pbo files', () => {
  it('reads a binarised mission.sqm back as text', async () => {
    const bin = rap();
    expect(derapify(bin)).toEqual({ version: 12, Mission: { Groups: { items: 1, Item0: { side: 'WEST', Vehicles: { items: 1, Item0: { position: [100.5, 3.25, 200], azimut: 45, vehicle: 'B_Soldier_F' } } } } } });
    expect(derapifyText(bin)).toContain('position[]={100.5,3.25,200};');
    const m = await armaSqm.read(bin, 'mission.sqm');
    expect(m.groups[0].units[0]).toMatchObject({ type: 'B_Soldier_F', at: { x: 100.5, y: 3.25, z: -200 } });
    expect(m.notes.join(' ')).toMatch(/binarised/);
  });

  it('writes back into a binarised mission as text, the same bytes when nothing changed', async () => {
    const bin = rap();
    const p = missionToPlan(await armaSqm.read(bin, 'mission.sqm'));
    expect((await writeArmaMission(planToMission(p), bin, undefined, 'mission.sqm')).bytes).toBe(bin);
    p.figures[0].keys[0] = { ...p.figures[0].keys[0], x: 150 };
    const r = await writeArmaMission(planToMission(p), bin, undefined, 'mission.sqm');
    expect(new TextDecoder().decode(r.bytes)).toContain('position[]={150,3.25,200};');
    expect(r.summary.warnings.map((w) => w.code)).toContain('arma-text');
  });

  it('opens a mission .pbo and writes its mission.sqm back into it, checksum and all', async () => {
    const file = await pbo(new TextEncoder().encode(EDEN));
    const m = await armaSqm.read(file, 'raid.Stratis.pbo');
    expect(m.map).toBe('Arma 3: Stratis');
    const p = missionToPlan(m);
    expect((await writeArmaMission(planToMission(p), file, undefined, 'raid.Stratis.pbo')).bytes).toBe(file);
    const lead = p.figures.find((f) => f.label === 'lead')!;
    lead.keys[0] = { ...lead.keys[0], x: 1010 };
    const r = await writeArmaMission(planToMission(p), file, undefined, 'raid.Stratis.pbo');
    expect(r.ext).toBe('.pbo');
    const inner = new TextDecoder().decode(pboMissionSqm(r.bytes).bytes);
    expect(inner).toContain('position[]={1010,5.5,2000};');
    const body = r.bytes.subarray(0, r.bytes.length - 21);
    expect([...r.bytes.subarray(r.bytes.length - 20)]).toEqual([...new Uint8Array(await crypto.subtle.digest('SHA-1', body.slice()))]);
    expect((await replaceInPbo(file, 'mission.sqm', new TextEncoder().encode(EDEN))).length).toBe(file.length);
  });
});
