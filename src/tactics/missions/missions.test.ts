import { describe, expect, it } from 'vitest';
import { luaList, parseLuaAssignments } from './lua';
import { isBinarisedSqm, parseSqm, sqmItems } from './sqm';
import { dcsYaw, readDcsMission } from './dcs';
import { armaCategory, readArmaMission } from './arma';
import { missionToPlan, readMission } from './index';
import { routeOf } from '../plan';
import { speedChecks } from '../timing';

const MISSION = `mission =
{
    ["theatre"] = "Caucasus",
    ["coalition"] =
    {
        ["blue"] =
        {
            ["bullseye"] = { ["x"] = 1000, ["y"] = 2000, }, -- end of ["bullseye"]
            ["country"] =
            {
                [1] =
                {
                    ["name"] = "USA",
                    ["plane"] =
                    {
                        ["group"] =
                        {
                            [1] =
                            {
                                ["name"] = "DictKey_GroupName_1",
                                ["route"] =
                                {
                                    ["points"] =
                                    {
                                        [1] = { ["x"] = 0, ["y"] = 0, ["alt"] = 500, ["speed"] = 200, ["airdromeId"] = 13, ["type"] = "TakeOff", },
                                        [2] = { ["x"] = 20000, ["y"] = 0, ["alt"] = 6000, ["speed"] = 220, ["ETA"] = 120, ["ETA_locked"] = true, },
                                        [3] = { ["x"] = 40000, ["y"] = 10000, ["alt"] = 6000, ["speed"] = 220, ["ETA"] = 300, ["ETA_locked"] = false, },
                                    },
                                },
                                ["units"] =
                                {
                                    [1] = { ["type"] = "F-16C_50", ["name"] = "Viper 1-1", ["x"] = 0, ["y"] = 0, ["alt"] = 500, ["heading"] = 1.5707963, ["skill"] = "Client", },
                                    [2] = { ["type"] = "F-16C_50", ["name"] = "Viper 1-2", ["x"] = -50, ["y"] = 30, ["alt"] = 500, ["heading"] = 1.5707963, ["skill"] = "High", },
                                },
                            },
                        },
                    },
                    ["static"] = { ["group"] = { [1] = { ["name"] = "farp", ["units"] = { [1] = { ["type"] = "Invisible FARP", ["name"] = "London", ["x"] = 500, ["y"] = 500, }, }, }, }, },
                },
            },
        },
        ["red"] =
        {
            ["country"] =
            {
                [1] = { ["vehicle"] = { ["group"] = { [1] = { ["name"] = "SAM \\"North\\"", ["units"] = { [1] = { ["type"] = "Tor 9A331", ["name"] = "Tor 1", ["x"] = 30000, ["y"] = 5000, ["heading"] = 0, }, }, }, }, }, },
            },
        },
    },
    ["triggers"] = { ["zones"] = { [1] = { ["name"] = "Target area", ["x"] = 30000, ["y"] = 5000, ["radius"] = 2500, }, }, },
} -- end of mission
`;

/** A stored (uncompressed) zip of named files, as a .miz may be written. */
function zip(files: Record<string, string>): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const u16 = (v: number) => [v & 255, (v >> 8) & 255];
  const u32 = (v: number) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
  for (const [name, text] of Object.entries(files)) {
    const n = enc.encode(name);
    const d = enc.encode(text);
    const local = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...n, ...d]);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...n]));
    parts.push(local);
    offset += local.length;
  }
  const cd = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length), ...u32(cd), ...u32(offset), ...u16(0)]);
  const all = [...parts, ...central, end];
  const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
  let at = 0;
  for (const p of all) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

describe('the Lua reader', () => {
  it('reads tables, keys, strings with escapes, numbers, booleans and comments', () => {
    const v = parseLuaAssignments('a = { [3] = 1.5e2, ["s"] = "q\\"x\\\\y\\\nz", b = true, -- note\n c = nil, "pos", [2] = -3 } x = [[long\nstring]]');
    const a = v.a as Record<string, unknown>;
    expect(a['3']).toBe(150);
    expect(a['1']).toBe('pos');
    expect(a.s).toBe('q"x\\y\nz');
    expect(a.b).toBe(true);
    expect(a.c).toBeNull();
    expect(a['2']).toBe(-3);
    expect(luaList(v.a)).toEqual(['pos', -3, 150]);
    expect(v.x).toBe('long\nstring');
    expect(() => parseLuaAssignments('a = { [1] = }')).toThrow(/line 1/);
  });
});

describe('DCS missions', () => {
  it('reads the coalitions, groups, routes, airbases, FARPs, zones and bullseye', async () => {
    const miz = zip({ mission: MISSION, 'l10n/DEFAULT/dictionary': 'dictionary = { ["DictKey_GroupName_1"] = "Viper 1", }' });
    const m = await readMission('Strike.miz', miz);
    expect(m.map).toBe('DCS: Caucasus');
    expect(m.groups.map((g) => g.name)).toEqual(['Viper 1', 'SAM "North"']);
    const viper = m.groups[0];
    expect(viper.units[0]).toMatchObject({ name: 'Viper 1-1', type: 'F-16C_50', category: 'air', player: true, at: { x: 0, y: 500, z: 0 } });
    // Heading east: world +z, box yaw pi.
    expect(Math.abs(viper.units[0].yaw)).toBeCloseTo(Math.PI, 5);
    expect(viper.route[1]).toMatchObject({ at: { x: 20000, y: 6000, z: 0 }, speed: 220, eta: 120 });
    expect(viper.route[2].eta).toBeUndefined();
    expect(m.places.map((p) => p.kind).sort()).toEqual(['airbase', 'bullseye', 'farp', 'zone']);
    expect(dcsYaw(0)).toBeCloseTo(Math.PI / 2);
  });

  it('makes a plan of it: a layer per side, figures, routes with the held times and speeds', () => {
    const m = readDcsMission(parseLuaAssignments(MISSION).mission as never, null, 'x.miz');
    const p = missionToPlan(m);
    expect(p.game).toBe('air');
    expect(p.layers.map((l) => l.name)).toEqual(['Base', 'Blue', 'Red', 'Mission places']);
    const lead = p.figures.find((f) => f.label === 'Viper 1-1')!;
    const wing = p.figures.find((f) => f.label === 'Viper 1-2')!;
    expect(lead.kind).toBe('f-16c');
    expect(lead.layer).toBe(p.layers[1].id);
    expect(lead.speeds).toEqual({ cruise: 220 });
    const r = routeOf(p, lead.id, 0)!;
    expect(r.at).toEqual([null, 120, null]);
    // The wingman flies the lead's points, kept where it is from the lead.
    const w = routeOf(p, wing.id, 0)!;
    expect(w.points[1].x).toBeCloseTo(20000 - 50);
    expect(w.points[1].z).toBeCloseTo(30);
    // 20 km in 120 s is 167 m/s: within an F-16's top speed, so the time holds.
    expect(speedChecks(p).filter((c) => c.kind === 'late')).toEqual([]);
    expect(p.areas[0]).toMatchObject({ radius: 2500, label: 'Target area' });
    expect(p.figures.filter((f) => f.kind === 'forward-base').map((f) => f.label).sort()).toEqual(['Airfield 13', 'London']);
  });

  it('names airbases from the theatre layouts where it has them', () => {
    const m = readDcsMission(parseLuaAssignments(MISSION).mission as never, null, 'x.miz', new Map([[13, 'Krasnodar-Center']]));
    expect(m.places.filter((p) => p.kind === 'airbase').map((p) => p.name)).toEqual(['Krasnodar-Center']);
  });

  it('refuses what is not a mission', async () => {
    await expect(readMission('x.miz', zip({ other: '1' }))).rejects.toThrow(/no "mission"/);
    await expect(readMission('x.txt', new Uint8Array(4))).rejects.toThrow(/no mission reader/);
  });
});

const EDEN = `version=54;
class EditorData { moveGridStep=1; };
class Mission
{
	class Intel { briefingName="Clear the town"; };
	class Entities
	{
		items=3;
		class Item0
		{
			dataType="Group";
			side="West";
			class Entities
			{
				items=2;
				class Item0 { dataType="Object"; class PositionInfo { position[]={1000,5.5,2000}; angles[]={0,1.5707964,0}; }; side="West"; class Attributes { isPlayer=1; name="lead"; }; id=1; type="B_Soldier_TL_F"; };
				class Item1 { dataType="Object"; class PositionInfo { position[]={1003,5.5,1998}; }; side="West"; class Attributes {}; id=2; type="B_MBT_01_cannon_F"; };
			};
			class Attributes { name="Alpha 1-1"; };
			class Waypoints { items=1; class Item0 { dataType="Waypoint"; position[]={1200,6,2300}; type="MOVE"; }; };
			id=0;
		};
		class Item1 { dataType="Marker"; position[]={1500,0,2500}; name="obj_1"; text="Town ""centre"""; type="mil_objective"; id=3; };
		class Item2 { dataType="Layer"; name="Enemy"; class Entities { items=1; class Item0 { dataType="Group"; side="East"; class Entities { items=1; class Item0 { dataType="Object"; class PositionInfo { position[]={1600,4,2600}; }; type="O_Soldier_F"; }; }; }; }; };
	};
};
`;

const LEGACY = `version=12;
class Mission
{
	class Groups { items=1; class Item0 { side="EAST"; class Vehicles { items=1; class Item0 { position[]={500,0,800}; azimut=90; vehicle="O_Heli_Light_02_F"; text="hind"; }; }; }; };
	class Markers { items=1; class Item0 { position[]={600,0,900}; name="m1"; text="LZ"; }; };
	class Sensors { items=1; class Item0 { position[]={700,0,1000}; a=150; b=80; text="AO"; }; };
};
`;

describe('Arma missions', () => {
  it('reads an Eden mission.sqm: groups with their units and waypoints, markers, layers', () => {
    expect(sqmItems(parseSqm(EDEN).Mission && (parseSqm(EDEN).Mission as never as { Entities: never }).Entities)).toHaveLength(3);
    const m = readArmaMission(EDEN, 'mission.sqm');
    expect(m.title).toBe('Clear the town');
    expect(m.groups.map((g) => [g.name, g.side])).toEqual([
      ['Alpha 1-1', 'blufor'],
      ['Group 2', 'opfor'],
    ]);
    const [tl, tank] = m.groups[0].units;
    // North is world -z.
    expect(tl).toMatchObject({ name: 'lead', category: 'infantry', player: true, at: { x: 1000, y: 5.5, z: -2000 } });
    expect(tl.yaw).toBeCloseTo(Math.PI / 2);
    expect(tank).toMatchObject({ category: 'ground', figure: 'mbt' });
    expect(m.groups[0].route[1].at).toEqual({ x: 1200, y: 6, z: -2300 });
    expect(m.places[0]).toMatchObject({ kind: 'objective', text: 'Town "centre"' });
    const p = missionToPlan(m);
    expect(p.game).toBe('arma');
    expect(p.figures.find((f) => f.label === 'B_MBT_01_cannon_F')!.kind).toBe('mbt');
    expect(p.arrows).toHaveLength(2);
  });

  it('reads the older layout, and refuses a binarised file with what to do', async () => {
    const m = readArmaMission(LEGACY, 'mission.sqm');
    expect(m.groups[0]).toMatchObject({ side: 'opfor', category: 'heli' });
    expect(m.groups[0].units[0].yaw).toBeCloseTo(Math.PI / 2);
    expect(m.places.map((p) => p.kind)).toEqual(['marker', 'zone']);
    expect(m.places[1].radius).toBe(150);
    const bin = new Uint8Array([0, 0x72, 0x61, 0x50, 1, 2]);
    expect(isBinarisedSqm(bin)).toBe(true);
    await expect(readMission('mission.sqm', bin)).rejects.toThrow(/binarised/);
    expect(armaCategory('B_Plane_CAS_01_F').category).toBe('air');
    expect(armaCategory('I_Boat_Transport_01_F').hint).toBe('patrol-boat');
  });
});

describe('mission tasks', () => {
  it('reads DCS waypoint tasks and options as board tasks, unknown ones by their names', () => {
    const lua = `mission = { ["theatre"] = "Caucasus", ["coalition"] = { ["blue"] = { ["country"] = { [1] = { ["plane"] = { ["group"] = { [1] = { ["name"] = "Viper", ["task"] = "CAP",
      ["units"] = { [1] = { ["type"] = "F-16C_50", ["name"] = "Viper 1-1", ["x"] = 0, ["y"] = 0, ["alt"] = 500 } },
      ["route"] = { ["points"] = {
        [1] = { ["x"] = 0, ["y"] = 0, ["alt"] = 500 },
        [2] = { ["x"] = 9000, ["y"] = 0, ["alt"] = 5000, ["speed"] = 200, ["task"] = { ["id"] = "ComboTask", ["params"] = { ["tasks"] = {
          [1] = { ["id"] = "WrappedAction", ["enabled"] = true, ["params"] = { ["action"] = { ["id"] = "Option", ["params"] = { ["name"] = 0, ["value"] = 4 } } } },
          [2] = { ["id"] = "Orbit", ["enabled"] = true, ["params"] = { ["pattern"] = "Race-Track", ["altitude"] = 6000, ["speed"] = 220 } },
          [3] = { ["id"] = "Tanker", ["enabled"] = true, ["params"] = {} } } } } },
        [3] = { ["x"] = 9000, ["y"] = 20000, ["alt"] = 5000 } } } } } } } } } } }`;
    const plan = missionToPlan(readDcsMission(parseLuaAssignments(lua).mission as never, null, 'x.miz'));
    const kinds = plan.tasks.map((t) => `${t.kind}${t.game ? `:${t.game}` : ''}${t.state ? `=${t.state}` : ''}`);
    expect(kinds).toEqual(['game:CAP', 'roe=hold', 'orbit', 'game:Tanker']);
    const orbit = plan.tasks.find((t) => t.kind === 'orbit')!;
    expect(orbit.on).toEqual({ step: 0, from: 1 });
    expect(orbit.points?.map((p) => [p.x, p.z])).toEqual([[9000, 0], [9000, 20000]]);
    expect(orbit.altitude).toBe(1000);
    expect(orbit.speed).toBe(220);
    expect(orbit.figures).toEqual([plan.figures[0].id]);
  });

  it('reads Arma waypoint types, combat modes and behaviours as board tasks', () => {
    const sqm = EDEN.replace('type="MOVE"; }; };', 'type="SAD"; combatMode="GREEN"; behaviour="STEALTH"; }; };');
    const plan = missionToPlan(readArmaMission(sqm, 'mission.sqm'));
    const kinds = plan.tasks.map((t) => `${t.kind}${t.state ? `=${t.state}` : ''}`);
    expect(kinds).toEqual(['sweep', 'roe=return', 'alarm=stealth']);
    expect(plan.tasks[0].figures).toHaveLength(2);
    expect(plan.tasks[0].points).toHaveLength(2);
    const odd = missionToPlan(readArmaMission(EDEN.replace('type="MOVE"', 'type="GETOUT"'), 'mission.sqm'));
    expect(odd.tasks.map((t) => [t.kind, t.game])).toEqual([['game', 'GETOUT']]);
  });
});
