import { describe, expect, it } from 'vitest';
import { il2Groups, il2List, il2Num, parseIl2, readIl2Mission, il2Mission } from './il2';
import { newIl2MissionText, patchIl2MissionText, writeIl2Mission } from './il2Write';
import { missionToPlan } from './index';
import { planToMission } from './fromPlan';
import { routeOf } from '../plan';

/** A small mission as the IL-2 editor saves one; every name and number made up. */
const MISSION = [
  '# Mission File Version = 1.0;',
  '',
  'Options',
  '{',
  '  LCName = 0;',
  '  PlayerConfig = "";',
  '  Time = 9:15:0;',
  '  Date = 5.7.1943;',
  '  HMap = "graphics\\LANDSCAPE_Test_su\\height.hini";',
  '  Textures = "graphics\\LANDSCAPE_Test_su\\textures.tini";',
  '  GuiMap = "test-summer";',
  '  SeasonPrefix = "su";',
  '  CloudLevel = 1200;',
  '  CloudConfig = "summer\\01_Light_00\\sky.ini";',
  '  Temperature = 20;',
  '  Pressure = 760;',
  '  WindLayers',
  '  {',
  '    0 :     90 :     3;',
  '    500 :     90 :     5;',
  '  }',
  '  Countries',
  '  {',
  '    0 : 0;',
  '    101 : 1;',
  '    201 : 2;',
  '  }',
  '}',
  '',
  'Plane',
  '{',
  '  Name = "Hawk Lead";',
  '  Index = 10;',
  '  LinkTrId = 11;',
  '  XPos = 2000.000;',
  '  YPos = 1500.000;',
  '  ZPos = 1000.000;',
  '  XOri = 0.00;',
  '  YOri = 90.00;',
  '  ZOri = 0.00;',
  '  Script = "LuaScripts\\WorldObjects\\Planes\\bf109f4.txt";',
  '  Model = "graphics\\planes\\bf109f4\\bf109f4.mgm";',
  '  Country = 201;',
  '  AILevel = 3;',
  '}',
  '',
  'MCU_TR_Entity',
  '{',
  '  Index = 11;',
  '  Name = "entity";',
  '  Targets = [];',
  '  Objects = [];',
  '  XPos = 2000.000;',
  '  YPos = 1500.200;',
  '  ZPos = 1000.000;',
  '  MisObjID = 10;',
  '}',
  '',
  'Plane',
  '{',
  '  Name = "Hawk 2";',
  '  Index = 12;',
  '  LinkTrId = 13;',
  '  XPos = 1980.000;',
  '  YPos = 1500.000;',
  '  ZPos = 980.000;',
  '  YOri = 90.00;',
  '  Script = "LuaScripts\\WorldObjects\\Planes\\bf109f4.txt";',
  '  Model = "graphics\\planes\\bf109f4\\bf109f4.mgm";',
  '  Country = 201;',
  '  AILevel = 2;',
  '}',
  '',
  'MCU_TR_Entity',
  '{',
  '  Index = 13;',
  '  Name = "entity";',
  '  Targets = [11];',
  '  Objects = [];',
  '  XPos = 1980.000;',
  '  YPos = 1500.200;',
  '  ZPos = 980.000;',
  '  MisObjID = 12;',
  '}',
  '',
  'MCU_TR_MissionBegin',
  '{',
  '  Index = 20;',
  '  Targets = [21];',
  '  Objects = [];',
  '  XPos = 2100.000;',
  '  YPos = 0.000;',
  '  ZPos = 1000.000;',
  '}',
  '',
  'MCU_Timer',
  '{',
  '  Index = 21;',
  '  Name = "1s";',
  '  Targets = [22];',
  '  Objects = [];',
  '  XPos = 2100.000;',
  '  YPos = 0.000;',
  '  ZPos = 1050.000;',
  '  Time = 1;',
  '}',
  '',
  'MCU_Waypoint',
  '{',
  '  Index = 22;',
  '  Name = "wp1";',
  '  Targets = [23];',
  '  Objects = [11];',
  '  XPos = 6000.000;',
  '  YPos = 1500.000;',
  '  ZPos = 1000.000;',
  '  Area = 500;',
  '  Speed = 360;',
  '  Priority = 1;',
  '}',
  '',
  'MCU_Waypoint',
  '{',
  '  Index = 23;',
  '  Name = "wp2";',
  '  Targets = [24];',
  '  Objects = [11];',
  '  XPos = 6000.000;',
  '  YPos = 1500.000;',
  '  ZPos = 5000.000;',
  '  Area = 500;',
  '  Speed = 360;',
  '  Priority = 1;',
  '}',
  '',
  'MCU_CMD_AttackArea',
  '{',
  '  Index = 24;',
  '  Name = "attack";',
  '  Targets = [];',
  '  Objects = [11];',
  '  XPos = 6500.000;',
  '  YPos = 50.000;',
  '  ZPos = 5200.000;',
  '  AttackGround = 1;',
  '  AttackAir = 0;',
  '  AttackArea = 400;',
  '  Time = 600;',
  '}',
  '',
  'Group',
  '{',
  '  Name = "Armour";',
  '  Index = 30;',
  '  Desc = "";',
  '  Vehicle',
  '  {',
  '    Name = "Tank One";',
  '    Index = 31;',
  '    LinkTrId = 32;',
  '    XPos = 3000.000;',
  '    YPos = 120.000;',
  '    ZPos = 4000.000;',
  '    YOri = 180.00;',
  '    Script = "LuaScripts\\WorldObjects\\vehicles\\_t34-76stz.txt";',
  '    Model = "graphics\\vehicles\\_t34-76stz\\_t34-76stz.mgm";',
  '    Country = 101;',
  '  }',
  '',
  '  MCU_TR_Entity',
  '  {',
  '    Index = 32;',
  '    Targets = [];',
  '    Objects = [];',
  '    XPos = 3000.000;',
  '    YPos = 120.200;',
  '    ZPos = 4000.000;',
  '    MisObjID = 31;',
  '  }',
  '',
  '}',
  '',
  'Block',
  '{',
  '  Name = "House";',
  '  Index = 40;',
  '  LinkTrId = 0;',
  '  XPos = 3100.000;',
  '  YPos = 120.000;',
  '  ZPos = 4100.000;',
  '  Model = "graphics\\blocks\\house.mgm";',
  '}',
  '',
  'Airfield',
  '{',
  '  Name = "Field";',
  '  Index = 50;',
  '  XPos = 1900.000;',
  '  YPos = 100.000;',
  '  ZPos = 900.000;',
  '  Country = 201;',
  '  Planes',
  '  {',
  '    Plane',
  '    {',
  '      Model = "graphics\\planes\\bf109f4\\bf109f4.mgm";',
  '      Script = "LuaScripts\\WorldObjects\\Planes\\bf109f4.txt";',
  '    }',
  '  }',
  '}',
  '',
  '',
  '',
  '# end of file',
].join('\r\n');

describe('IL-2 missions', () => {
  it('reads groups, routes, commands, sides and options', () => {
    const m = readIl2Mission(MISSION, 'test.Mission');
    expect(m.format).toBe('il2-mission');
    expect(m.map).toBe('IL-2: landscape_test_su');
    expect(m.groups).toHaveLength(2);
    const [flight, tank] = m.groups;
    expect(flight.ref).toBe('10');
    expect(flight.units.map((u) => u.ref)).toEqual(['10', '12']);
    expect(flight.side).toBe('red');
    expect(flight.category).toBe('air');
    expect(flight.units[0].skill).toBe('High');
    // x east = game z, z = -north.
    expect(flight.units[0].at).toEqual({ x: 1000, y: 1500, z: -2000 });
    expect(flight.units[0].yaw).toBeCloseTo(Math.PI / 2);
    expect(flight.route.map((w) => w.at)).toEqual([
      { x: 1000, y: 1500, z: -2000 },
      { x: 1000, y: 1500, z: -6000 },
      { x: 5000, y: 1500, z: -6000 },
    ]);
    expect(flight.route[1].speed).toBeCloseTo(100);
    const attack = flight.route[2].tasks?.[0];
    expect(attack?.kind).toBe('cas');
    expect(attack?.duration).toBe(600);
    expect(tank.side).toBe('blue');
    expect(tank.category).toBe('ground');
    expect(tank.units[0].type).toBe('_t34-76stz');
    expect(tank.route).toEqual([]);
    expect(m.places.some((p) => p.kind === 'airbase' && p.name === 'Field')).toBe(true);
    expect(m.info?.start).toBe(9 * 3600 + 15 * 60);
    expect(m.info?.date).toEqual({ year: 1943, month: 7, day: 5 });
    expect(m.info?.weather?.windSpeed).toBe(3);
  });

  it('refuses the binary form', async () => {
    await expect(il2Mission.read(new Uint8Array([2, 0, 0, 0, 1, 0]), 'x.msnbin')).rejects.toThrow(/binary/);
  });

  it('writes an unchanged plan back as the very same file', () => {
    const plan = missionToPlan(readIl2Mission(MISSION, 'test.Mission'));
    const r = patchIl2MissionText(MISSION, planToMission(plan));
    expect(r.text).toBe(MISSION);
    expect(r.summary.changed).toEqual([]);
    expect(r.summary.untouched).toBe(2);
    const bytes = new TextEncoder().encode(MISSION);
    expect(writeIl2Mission(planToMission(plan), bytes).bytes).toBe(bytes);
  });

  it('moves a unit and its entity, turns it, and moves a waypoint', () => {
    const plan = missionToPlan(readIl2Mission(MISSION, 'test.Mission'));
    const tank = plan.figures.find((f) => f.label === 'Tank One')!;
    tank.keys[0] = { ...tank.keys[0], x: 4100, yaw: Math.PI / 2 };
    const lead = plan.figures.find((f) => f.label === 'Hawk Lead')!;
    const r0 = routeOf(plan, lead.id, 0)!;
    r0.points[2] = { ...r0.points[2], x: 5300 };
    const r = patchIl2MissionText(MISSION, planToMission(plan));
    const root = parseIl2(r.text);
    const { groups, byIndex } = il2Groups(root);
    const t = groups.find((g) => g.units[0].index === 31)!.units[0].block;
    expect(il2Num(t, 'ZPos')).toBeCloseTo(4100);
    expect(il2Num(t, 'YOri')).toBeCloseTo(90);
    expect(il2Num(byIndex.get(32), 'ZPos')).toBeCloseTo(4100);
    expect(il2Num(byIndex.get(23), 'ZPos')).toBeCloseTo(5300);
    expect(r.summary.changed.sort()).toEqual(['Hawk Lead', 'Tank One']);
    // The rest stays as it was.
    expect(r.text).toContain('  Name = "Hawk 2";\r\n  Index = 12;');
  });

  it('adds and removes waypoints, linking them in', () => {
    const plan = missionToPlan(readIl2Mission(MISSION, 'test.Mission'));
    const lead = plan.figures.find((f) => f.label === 'Hawk Lead')!;
    const r0 = routeOf(plan, lead.id, 0)!;
    // A new waypoint between wp1 and wp2, and one at the end.
    r0.points.splice(2, 0, { x: 3000, y: 1500, z: -6000 });
    r0.points.push({ x: 9000, y: 1500, z: -9000 });
    const r = patchIl2MissionText(MISSION, planToMission(plan));
    const again = readIl2Mission(r.text, 'x');
    const route = again.groups[0].route.map((w) => [Math.round(w.at.x), Math.round(w.at.z)]);
    expect(route).toEqual([
      [1000, -2000],
      [1000, -6000],
      [3000, -6000],
      [5000, -6000],
      [9000, -9000],
    ]);
    // The attack still follows wp2.
    expect(again.groups[0].route[3].tasks?.[0]?.name).toBe('AttackArea');
    // Taking wp1 out: the timer leads to the next one.
    const p2 = missionToPlan(readIl2Mission(MISSION, 'test.Mission'));
    const l2 = p2.figures.find((f) => f.label === 'Hawk Lead')!;
    routeOf(p2, l2.id, 0)!.points.splice(1, 1);
    const r2 = patchIl2MissionText(MISSION, planToMission(p2));
    const b2 = il2Groups(parseIl2(r2.text)).byIndex;
    expect(b2.has(22)).toBe(false);
    expect(il2List(b2.get(21), 'Targets')).toEqual([23]);
    expect(readIl2Mission(r2.text, 'x').groups[0].route).toHaveLength(2);
  });

  it('adds a new flight and takes a group out', () => {
    const plan = missionToPlan(readIl2Mission(MISSION, 'test.Mission'));
    const tank = plan.figures.find((f) => f.label === 'Tank One')!;
    plan.figures = plan.figures.filter((f) => f.id !== tank.id);
    plan.figures.push({ id: 'new1', kind: 'il-2', team: 'blue', label: 'Storm', keys: { 0: { x: 0, y: 800, z: 0, yaw: 0 } }, from: 0 });
    plan.arrows.push({ id: 'a1', step: 0, team: 'blue', style: 'move', figure: 'new1', points: [{ x: 0, y: 800, z: 0 }, { x: 0, y: 800, z: -3000 }] });
    const r = patchIl2MissionText(MISSION, planToMission(plan));
    expect(r.summary.removed).toEqual(['Tank One']);
    expect(r.summary.added).toEqual(['Storm']);
    const again = readIl2Mission(r.text, 'x');
    expect(again.groups.map((g) => g.name).sort()).toEqual(['Hawk Lead', 'Storm']);
    const storm = again.groups.find((g) => g.name === 'Storm')!;
    expect(storm.side).toBe('blue');
    expect(storm.category).toBe('air');
    expect(storm.route.map((w) => Math.round(w.at.z) + 0)).toEqual([0, -3000]);
    expect(r.text.endsWith('# end of file')).toBe(true);
    expect(r.text).not.toContain('Tank One');
  });

  it('makes a new mission on a map', () => {
    const plan = missionToPlan(readIl2Mission(MISSION, 'test.Mission'));
    const r = newIl2MissionText('landscape_test_w', planToMission(plan));
    const again = readIl2Mission(r.text, 'new');
    expect(again.map).toBe('IL-2: landscape_test_w');
    expect(again.groups).toHaveLength(2);
    expect(again.groups[0].units).toHaveLength(2);
    expect(again.groups[0].route).toHaveLength(3);
    expect(again.info?.date).toEqual({ year: 1943, month: 7, day: 5 });
    expect(r.text).toContain('SeasonPrefix = "wi";');
    expect(r.summary.mode).toBe('new');
  });
});
