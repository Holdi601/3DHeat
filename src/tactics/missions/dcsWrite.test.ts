import { describe, expect, it } from 'vitest';
import { luaSpans, parseLuaAssignments, type LuaTable } from './lua';
import { applyEdits, luaFile, luaValue } from './luaWrite';
import { readMission } from './index';
import { missionToPlan } from './index';
import { planToMission, headingOfYaw } from './fromPlan';
import { alignRoute, dcsTaskEntries, newDcsMissionFiles, patchDcsMissionText, writeDcsMiz } from './dcsWrite';
import { dcsYaw, readDcsMission } from './dcs';
import { makeZip, rewriteZip } from '../../data/zipWrite';
import { zipEntries } from '../../data/zip';
import { readPlan, routeOf, type Plan } from '../plan';

const L = <T,>(...a: T[]) => Object.fromEntries(a.map((v, i) => [String(i + 1), v]));
const combo = (...tasks: LuaTable[]) => ({ id: 'ComboTask', params: { tasks: L(...tasks.map((t, i) => ({ enabled: true, auto: false, number: i + 1, ...t }))) } });
const point = (x: number, y: number, alt: number, extra: LuaTable = {}): LuaTable => ({ alt, type: 'Turning Point', action: 'Turning Point', alt_type: 'BARO', speed: 200, x, y, ETA: 0, ETA_locked: false, task: combo(), ...extra });

/** A small mission as the editor writes one (tabs, one entry a line), every value made up. */
function fixture(): string {
  const viper = {
    groupId: 1,
    name: 'Viper',
    task: 'CAP',
    x: 0,
    y: 0,
    route: {
      points: L(
        point(0, 0, 50, { type: 'TakeOffParking', action: 'From Parking Area', airdromeId: 13, ETA_locked: true, task: combo({ id: 'WrappedAction', auto: true, params: { action: { id: 'EPLRS', params: { value: true, groupId: 1 } } } }) }),
        point(20000, 0, 6000, {
          ETA: 120,
          ETA_locked: true,
          task: combo({ id: 'WrappedAction', params: { action: { id: 'Option', params: { name: 0, value: 4 } } } }, { id: 'Orbit', params: { pattern: 'Race-Track', altitude: 6000, speed: 220 } }),
        }),
        point(40000, 10000, 6000),
        point(1000, 500, 50, { type: 'Land', action: 'Landing', airdromeId: 13 }),
      ),
    },
    units: L(
      { type: 'F-16C_50', name: 'Viper 1-1', unitId: 1, x: 0, y: 0, alt: 50, heading: 1.5, psi: -1.5, skill: 'Client', payload: { pylons: {}, fuel: 3249 } },
      { type: 'F-16C_50', name: 'Viper 1-2', unitId: 2, x: -50, y: 30, alt: 50, heading: 1.5, psi: -1.5, skill: 'High' },
    ),
  };
  const sam = { groupId: 2, name: 'SAM', task: 'Ground Nothing', x: 30000, y: 5000, route: { points: L(point(30000, 5000, 0, { action: 'Off Road' })) }, units: L({ type: 'Tor 9A331', name: 'Tor 1', unitId: 3, x: 30000, y: 5000, heading: 0, skill: 'Average' }) };
  const tanks = { groupId: 3, name: 'Tanks', task: 'Ground Nothing', x: 35000, y: 6000, route: { points: L(point(35000, 6000, 0, { action: 'Off Road' }), point(36000, 7000, 0, { action: 'Off Road' })) }, units: L({ type: 'T-72B', name: 'Tank 1', unitId: 4, x: 35000, y: 6000, heading: 0, skill: 'Average' }) };
  const mission = {
    theatre: 'Caucasus',
    start_time: 28800,
    date: { Day: 3, Year: 2011, Month: 6 },
    weather: { season: { temperature: 15 }, wind: { atGround: { speed: 4, dir: 90 } }, clouds: { base: 2500, density: 3 }, visibility: { distance: 50000 }, qnh: 760 },
    coalition: {
      blue: { bullseye: { x: 1000, y: 2000 }, country: L({ id: 2, name: 'USA', plane: { group: L(viper) } }) },
      red: { country: L({ id: 0, name: 'Russia', vehicle: { group: L(sam, tanks) } }) },
      neutrals: { country: {} },
    },
    triggers: { zones: L({ name: 'Target area', x: 30000, y: 5000, radius: 2500, zoneId: 1 }) },
  };
  return luaFile('mission', mission as unknown as LuaTable);
}

const read = (text: string) => readDcsMission(parseLuaAssignments(text).mission as LuaTable, null, 'test.miz');
const planOf = (text: string) => missionToPlan(read(text));

describe('the Lua writer', () => {
  it('writes tables the editor way and reads back the same', () => {
    const t = { a: 1.5, s: 'q"x\\y\nz', b: true, list: L('x', 'y'), deep: { e: {} } } as unknown as LuaTable;
    const text = luaFile('t', t);
    expect(text).toContain('["deep"] = \n\t{\n\t\t["e"] = {},\n\t}, -- end of ["deep"]');
    expect(parseLuaAssignments(text).t).toEqual(t);
    expect(luaValue(1 / 3)).toBe('0.33333333333333');
  });

  it('says where every entry stands, and an edit there changes only it', () => {
    const text = 'a = { ["x"] = 1, ["t"] = { [1] = "q", }, y = 2 } -- end';
    const spans = luaSpans();
    const a = parseLuaAssignments(text, spans).a as LuaTable;
    const e = spans.tables.get(a)!.entries.get('x')!;
    expect(text.slice(e.valueStart, e.valueEnd)).toBe('1');
    const inner = spans.tables.get(a.t as LuaTable)!;
    expect(text.slice(inner.start, inner.end)).toBe('{ [1] = "q", }');
    expect(applyEdits(text, [{ start: e.valueStart, end: e.valueEnd, text: '42' }])).toBe(text.replace('= 1,', '= 42,'));
  });
});

describe('zips written', () => {
  it('copies the files it does not touch as they were stored', async () => {
    const z = await makeZip({ mission: new TextEncoder().encode('mission = {}'), 'l10n/DEFAULT/dictionary': new TextEncoder().encode('dictionary = {}'.repeat(50)) });
    const again = await rewriteZip(z, { mission: new TextEncoder().encode('mission = { ["x"] = 1 }') });
    const files = zipEntries(again);
    expect(files.map((f) => f.name)).toEqual(['mission', 'l10n/DEFAULT/dictionary']);
    expect(new TextDecoder().decode(await files[0].bytes())).toBe('mission = { ["x"] = 1 }');
    expect(new TextDecoder().decode(await files[1].bytes())).toBe('dictionary = {}'.repeat(50));
  });
});

describe('a plan written back into its DCS mission', () => {
  it('leaves the file as it was when nothing changed on the board', () => {
    const text = fixture();
    const plan = planOf(text);
    expect(plan.mission?.groups.map((g) => g.ref)).toEqual(['1', '2', '3']);
    const r = patchDcsMissionText(text, planToMission(plan));
    expect(r.summary.changed).toEqual([]);
    expect(r.summary.untouched).toBe(3);
    expect(r.text).toBe(text);
  });

  it('survives being saved: the plan file keeps which figure is which unit', () => {
    const plan = planOf(fixture());
    const again = readPlan(JSON.stringify(plan));
    expect(again.mission).toEqual(plan.mission);
  });

  it('moves a waypoint and a unit in place, touching nothing else', () => {
    const text = fixture();
    const plan = planOf(text);
    const lead = plan.figures.find((f) => f.label === 'Viper 1-1')!;
    const route = routeOf(plan, lead.id, 0)!;
    route.points[2] = { ...route.points[2], x: 41000 };
    const tank = plan.figures.find((f) => f.label === 'Tank 1')!;
    tank.keys[0] = { ...tank.keys[0], z: 6100, yaw: dcsYaw(Math.PI / 2) };
    const r = patchDcsMissionText(text, planToMission(plan));
    expect(r.summary.changed.sort()).toEqual(['Tanks', 'Viper']);
    const m = read(r.text);
    expect(m.groups[0].route[2].at.x).toBe(41000);
    expect(m.groups[0].route[3].kind).toBe('Land');
    const t = m.groups.find((g) => g.name === 'Tanks')!.units[0];
    expect(t.at.z).toBe(6100);
    expect(headingOfYaw(t.yaw)).toBeCloseTo(Math.PI / 2, 6);
    // Line for line, only those values differ.
    const a = text.split('\n');
    const b = r.text.split('\n');
    expect(b.length).toBe(a.length);
    expect(a.filter((l, i) => l !== b[i]).length).toBe(5);
  });

  it('adds a waypoint and keeps what the others had: takeoff, landing, airfield, tasks', () => {
    const text = fixture();
    const plan = planOf(text);
    const lead = plan.figures.find((f) => f.label === 'Viper 1-1')!;
    const route = routeOf(plan, lead.id, 0)!;
    route.points.splice(3, 0, { x: 30000, y: 4000, z: 20000 });
    const r = patchDcsMissionText(text, planToMission(plan));
    const viper = read(r.text).groups[0];
    expect(viper.route.map((w) => w.kind)).toEqual(['TakeOffParking', 'Turning Point', 'Turning Point', 'Turning Point', 'Land']);
    expect(viper.route[3].at).toEqual({ x: 30000, y: 4000, z: 20000 });
    expect(viper.route[1].tasks?.map((t) => t.kind)).toEqual(['roe', 'orbit']);
    const spans = luaSpans();
    const raw = parseLuaAssignments(r.text, spans).mission as LuaTable;
    const pts = (((((raw.coalition as LuaTable).blue as LuaTable).country as LuaTable)['1'] as LuaTable).plane as LuaTable).group as LuaTable;
    const first = ((((pts['1'] as LuaTable).route as LuaTable).points as LuaTable)['1'] as LuaTable);
    expect(first.airdromeId).toBe(13);
  });

  it('changes a task where the board changed it and keeps the rest of the list', () => {
    const text = fixture();
    const plan = planOf(text);
    plan.tasks.find((t) => t.kind === 'roe')!.state = 'free';
    const r = patchDcsMissionText(text, planToMission(plan));
    const tasks = read(r.text).groups[0].route[1].tasks!;
    expect(tasks.map((t) => `${t.kind}${t.state ? `=${t.state}` : ''}`)).toEqual(['orbit', 'roe=free']);
    // The orbit's own entry is the file's, untouched.
    expect(r.text).toContain('["pattern"] = "Race-Track"');
    // EPLRS at the first waypoint is not one the board changed.
    expect(read(r.text).groups[0].route[0].tasks?.map((t) => t.name)).toEqual(['EPLRS']);
  });

  it('adds a figure placed on the board as a new group with its route and tasks', () => {
    const text = fixture();
    const plan = planOf(text);
    const blue = plan.layers.find((l) => l.name === 'Blue')!.id;
    plan.figures.push({ id: 'new1', kind: 'f-a-18c', team: 'blue', label: 'Hornet', keys: { 0: { x: 5000, y: 3000, z: 5000, yaw: dcsYaw(0) } }, from: 0, layer: blue });
    plan.arrows.push({ id: 'r-new', step: 0, team: 'blue', style: 'move', points: [{ x: 5000, y: 3000, z: 5000 }, { x: 25000, y: 3000, z: 5000 }, { x: 25000, y: 0, z: 25000 }], figure: 'new1', mode: 'cruise', layer: blue });
    plan.tasks.push({ id: 'k-new', kind: 'orbit', team: 'blue', figures: ['new1'], step: 0, on: { step: 0, from: 1 }, points: [{ x: 25000, y: 3000, z: 5000 }, { x: 25000, y: 3000, z: 25000 }], altitude: 4000, speed: 210 });
    const tor = plan.figures.find((f) => f.label === 'Tor 1')!;
    plan.tasks.push({ id: 'k-atk', kind: 'attack', team: 'blue', figures: ['new1'], step: 0, on: { step: 0, from: 2 }, target: tor.id });
    const r = patchDcsMissionText(text, planToMission(plan));
    expect(r.summary.added).toEqual(['Hornet']);
    const m = read(r.text);
    const hornet = m.groups.find((g) => g.name === 'Hornet')!;
    expect(hornet).toMatchObject({ ref: '4', side: 'blue', category: 'air' });
    expect(hornet.units[0]).toMatchObject({ type: 'FA-18C_hornet', ref: '5' });
    expect(hornet.route).toHaveLength(3);
    // Drawn on the ground at 0 m, flown at the height before it.
    expect(hornet.route[2].at.y).toBe(3000);
    expect(hornet.route[1].tasks?.map((t) => t.kind)).toEqual(['orbit', undefined]);
    expect(hornet.route[1].tasks?.[0]).toMatchObject({ altitude: 7000, speed: 210 });
    expect(hornet.route[2].tasks?.[0]).toMatchObject({ kind: 'attack', target: '2' });
    expect(r.summary.warnings.some((w) => w.code === 'new-air')).toBe(true);
    // Everything before the new group is as it was.
    expect(r.text.startsWith(text.slice(0, text.indexOf('["plane"]')))).toBe(true);
  });

  it('takes out a group whose figures were all taken off the board', () => {
    const text = fixture();
    const plan = planOf(text);
    plan.figures = plan.figures.filter((f) => f.label !== 'Tor 1');
    const r = patchDcsMissionText(text, planToMission(plan));
    expect(r.summary.removed).toEqual(['SAM']);
    const m = read(r.text);
    expect(m.groups.map((g) => g.name)).toEqual(['Viper', 'Tanks']);
    expect(r.summary.warnings.map((w) => w.code)).toContain('removed');
  });

  it('writes a .miz again with only the mission file changed', async () => {
    const text = fixture();
    const extra = new Uint8Array(3000).map((_, i) => (i * 7) & 255);
    const miz = await makeZip({ mission: new TextEncoder().encode(text), options: new TextEncoder().encode('options = {}'), 'l10n/DEFAULT/picture.jpg': extra });
    const plan = planOf(text);
    const same = await writeDcsMiz(planToMission(plan), miz);
    expect(same.bytes).toBe(miz);
    plan.figures = plan.figures.filter((f) => f.label !== 'Tank 1');
    const out = await writeDcsMiz(planToMission(plan), miz);
    const m = await readMission('out.miz', out.bytes);
    expect(m.groups.map((g) => g.name)).toEqual(['Viper', 'SAM']);
    const files = zipEntries(out.bytes);
    expect([...(await files[2].bytes())]).toEqual([...extra]);
  });
});

describe('a new DCS mission from a plan', () => {
  it('makes a whole mission for the theatre with the plan\'s groups', async () => {
    const plan: Plan = { ...planOf(fixture()), mission: undefined };
    const { files, summary } = newDcsMissionFiles('Syria', planToMission(plan));
    expect(Object.keys(files)).toEqual(['mission', 'options', 'warehouses', 'theatre', 'l10n/DEFAULT/dictionary', 'l10n/DEFAULT/mapResource']);
    expect(summary.mode).toBe('new');
    for (const [name, text] of Object.entries(files)) if (name !== 'theatre') expect(() => parseLuaAssignments(text)).not.toThrow();
    const m = read(files.mission);
    expect(m.map).toBe('DCS: Syria');
    expect(m.groups.map((g) => g.name).sort()).toEqual(['Tank 1', 'Tor 1', 'Viper 1-1']);
    const raw = parseLuaAssignments(files.mission).mission as LuaTable;
    expect(((raw.coalition as LuaTable).blue as LuaTable).country).toMatchObject({ 1: { id: 80, name: 'CJTF Blue' } });
    const miz = await writeDcsMiz(planToMission(plan), null, 'Syria');
    expect((await readMission('new.miz', miz.bytes)).groups).toHaveLength(3);
  });
});

describe('board tasks as DCS tasks', () => {
  const ctx = { category: 'air' as const, at: { x: 0, y: 5000, z: 0 }, speed: 200, groupId: (k: string) => (k === 'g7' ? 7 : undefined) };
  it('maps patrol to an orbit with an air engagement, attack on a group to AttackGroup, sweep and SEAD to zones', () => {
    const orbit = dcsTaskEntries({ name: 'patrol', kind: 'patrol', points: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 9000 }] }, ctx);
    expect('entries' in orbit && orbit.entries.map((e) => e.id)).toEqual(['Orbit', 'EngageTargets']);
    const atk = dcsTaskEntries({ name: 'attack', kind: 'attack', target: 'g7' }, ctx);
    expect('entries' in atk && atk.entries[0]).toMatchObject({ id: 'AttackGroup', params: { groupId: 7 } });
    const sweep = dcsTaskEntries({ name: 'sweep', kind: 'sweep', points: [{ x: 0, y: 0, z: 0 }, { x: 8000, y: 0, z: 0 }] }, ctx);
    expect('entries' in sweep && sweep.entries[0]).toMatchObject({ id: 'EngageTargetsInZone', params: { zoneRadius: 8000, targetTypes: { 1: 'Air' } } });
    const sead = dcsTaskEntries({ name: 'sead', kind: 'sead', points: [{ x: 0, y: 0, z: 0 }] }, ctx);
    expect('entries' in sead && sead.entries[0]).toMatchObject({ params: { targetTypes: { 1: 'Air Defence' } } });
    const held = dcsTaskEntries({ name: 'defend', kind: 'defend', duration: 300 }, { ...ctx, category: 'ground' });
    expect('entries' in held && held.entries[0]).toMatchObject({ id: 'ControlledTask', params: { task: { id: 'Hold' }, stopCondition: { duration: 300 } } });
    expect(dcsTaskEntries({ name: 'patrol', kind: 'patrol' }, { ...ctx, category: 'ground' })).toEqual({ warn: 'patrol-ground' });
    expect(dcsTaskEntries({ name: 'seize', kind: 'seize' }, ctx)).toEqual({ warn: 'no-task' });
  });

  it('pairs a route\'s waypoints with the file\'s: kept, moved, added', () => {
    const old = [{ x: 0, z: 0 }, { x: 100, z: 0 }, { x: 200, z: 0 }, { x: 300, z: 0 }];
    expect(alignRoute(old, old)).toEqual([0, 1, 2, 3]);
    expect(alignRoute([old[0], old[1], { x: 150, z: 900 }, old[2], old[3]], old)).toEqual([0, 1, -1, 2, 3]);
    expect(alignRoute([old[0], { x: 100, z: 700 }, old[2], old[3]], old)).toEqual([0, 1, 2, 3]);
    expect(alignRoute([old[0], old[3]], old)).toEqual([0, 3]);
  });
});
