import { describe, expect, it } from 'vitest';
import { gzipSync } from 'node:zlib';
import { isOcapName, NotOcapError, ocapHints, ocapText, parseOcap } from './ocap';
import { ingestOcap, ocapTableOf } from './ingestOcap';
import { applyHints, type MappingHints } from './automap';
import { detectFormat } from './sourcePreview';
import { figureFor } from '../figures/match';
import type { ColumnMapping } from '../state/types';
import { DEFAULT_AXIS_MAPPING } from '../state/types';

// A mission of our own, in both layouts OCAP writes: unit 0 in OCAP2's
// (x, y, z, role, vehicle id in place of the flag), unit 1 in the original's
// (x, y only); vehicle 2 with OCAP2's frame ranges, starting late.
const REC = {
  missionName: 'Test op',
  worldName: 'Altis',
  captureDelay: 2,
  endFrame: 5,
  missionAuthor: 'Someone',
  addonVersion: '2.0.0',
  times: [
    { frameNum: 0, systemTimeUTC: '2026-11-07T20:00:00.000', date: '2035-05-01T18:00:00', timeMultiplier: 1 },
    { frameNum: 3, systemTimeUTC: '2026-11-07T20:00:06.000', date: '2035-05-01T18:00:06', timeMultiplier: 2 },
  ],
  entities: [
    {
      id: 0,
      type: 'unit',
      name: 'Alpha',
      side: 'WEST',
      group: 'Alpha 1-1',
      role: 'Rifleman',
      isPlayer: 1,
      startFrameNum: 0,
      positions: [
        [[100, 200, 10], 90, 1, 0, 'Alpha', 1, 'Leader'],
        [[101, 200, 10], 90, 1, 0, '', 1, 'Leader'],
        [[110, 210, 11], 45, 1, 2, 'Alpha', 1, 'Leader'],
        [[120, 220, 12], 45, 1, 2, 'Alpha', 1, 'Leader'],
        [],
        [[130, 230, 13], 45, 1, 0, 'Alpha', 1, 'Leader'],
      ],
      framesFired: [
        [1, [150, 250]],
        [1, [151, 251]],
      ],
    },
    {
      id: 1,
      type: 'unit',
      name: 'Ivan',
      side: 'EAST',
      group: 'Bravo',
      isPlayer: 0,
      startFrameNum: 1,
      positions: [
        [[300, 400], 180, 1, 0, 'Ivan', 0],
        [[300, 401], 180, 1, 0, 'Ivan', 0],
        [[300, 402], 180, 0, 0, 'Ivan', 0],
        [[300, 402], 180, 0, 0, 'Ivan', 0],
        [[300, 402], 180, 0, 0, 'Ivan', 0],
      ],
    },
    {
      id: 2,
      type: 'vehicle',
      name: 'Hunter',
      class: 'car',
      startFrameNum: 1,
      positions: [
        [[110, 210, 11], 45, 1, [], [1, 1]],
        [[110, 210, 11], 45, 1, [0], [2, 3]],
        [[125, 225, 12], 50, 1, [], [4, 5]],
      ],
    },
  ],
  events: [
    [0, 'connected', 'Alpha'],
    [3, 'killed', 1, [0, 'MX 6.5 mm'], 212.4],
    [3, 'hit', 0, ['null'], -1],
    [2, 'getin', 0, 2],
    [5, 'endMission', ['WEST', 'BLUFOR wins']],
    [5, 'respawnTickets', [-1, 10, 10, -1]],
  ],
  Markers: [
    ['hd_warning', 'Mines', 1, 4, 0, 'D9D900', 0, [[1, [500, 600], 0], [3, [510, 600], 0]]],
    ['mil_dot', '', 0, 5, -1, '000000', -1, [[0, [700, 800, 5], 0, 0]], [75, 75], 'RECTANGLE', 'grid'],
  ],
};
const TEXT = JSON.stringify(REC);

describe('OCAP', () => {
  const t = parseOcap(TEXT, '2026_11_07__20_00_Test');
  const col = <T extends Float64Array | string[]>(name: string) => t.data[t.columns.indexOf(name)] as T;
  const rowsOf = (object: string) => [...col<string[]>('Object').keys()].filter((i) => col<string[]>('Object')[i] === object && !col<string[]>('Event')[i]);

  it('knows its files by name and by content', async () => {
    expect(isOcapName('2026_11_07__20_00_Test.json')).toBe(true);
    expect(isOcapName('mission.json.gz')).toBe(true);
    expect(detectFormat('mission.json.gz')).toBe('ocap');
    expect(detectFormat('sortie.acmi')).toBe('acmi');
    expect(await ocapText(new Blob([gzipSync(Buffer.from(TEXT))]))).toBe(TEXT);
    expect(await ocapText(new Blob([TEXT]))).toBe(TEXT);
    expect(() => parseOcap('{"foo": 1}')).toThrow(NotOcapError);
    expect(() => parseOcap('not json')).toThrow(NotOcapError);
    await expect(ocapTableOf(new File(['{"a": []}'], 'settings.json'))).rejects.toMatchObject({ msg: { key: 'data.ocap.notOcap' } });
  });

  it('reads a row per entity per frame, with time from the capture delay', () => {
    const time = col<Float64Array>('Time');
    const z = col<Float64Array>('Z');
    const alpha = rowsOf('Alpha #0');
    // Six frames; the empty one repeats the one before.
    expect(alpha.map((i) => time[i])).toEqual([0, 2, 4, 6, 8, 10]);
    expect(col<Float64Array>('X')[alpha[4]]).toBe(120);
    expect(z[alpha[0]]).toBe(10);
    // A blank name keeps the last one.
    expect(col<string[]>('Role')[alpha[1]]).toBe('Leader');
    expect(col<Float64Array>('Heading')[alpha[0]]).toBe(90);
    expect(col<Float64Array>('Shots')[alpha[1]]).toBe(2);
    expect(col<string[]>('Recording')[0]).toBe('Test op (2026-11-07 20:00)');
    expect(col<string[]>('World')[0]).toBe('Altis');
    // The original layout has no height.
    expect(z[rowsOf('Ivan #1')[0]]).toBe(0);
  });

  it('keeps the dead once, where they died', () => {
    const ivan = rowsOf('Ivan #1');
    const alive = col<Float64Array>('Alive');
    expect(ivan.map((i) => alive[i])).toEqual([1, 1, 0]);
    expect(col<Float64Array>('Frame')[ivan[2]]).toBe(3);
  });

  it('spreads a vehicle over its frame ranges and knows who rides in it', () => {
    const hunter = rowsOf('Hunter #2');
    const frame = col<Float64Array>('Frame');
    expect(hunter.map((i) => frame[i])).toEqual([1, 2, 3, 4, 5]);
    expect(col<Float64Array>('Crew')[hunter[1]]).toBe(1);
    // A vehicle is on the side of its crew, then of its last crew; unused, civilian.
    expect(hunter.map((i) => col<string[]>('Side')[i])).toEqual(['CIV', 'WEST', 'WEST', 'WEST', 'WEST']);
    expect(col<string[]>('Type')[hunter[0]]).toBe('Car');
    expect(col<string[]>('Vehicle')[hunter[0]]).toBe('Hunter');
    const alpha = rowsOf('Alpha #0');
    expect(col<string[]>('Riding')[alpha[2]]).toBe('Hunter');
    expect(col<Float64Array>('InVehicle')[alpha[2]]).toBe(1);
    // Frame 4 repeats frame 3, where the vehicle id still stood in the flag.
    expect(col<string[]>('Riding')[alpha[4]]).toBe('Hunter');
    expect(col<Float64Array>('InVehicle')[alpha[5]]).toBe(0);
  });

  it('puts a rider of the original layout (no height of its own) as high as its vehicle', () => {
    // A helicopter at its height above the ground, whole metres, its pilot east and north only.
    const rec = {
      worldName: 'Malden',
      captureDelay: 1,
      endFrame: 2,
      entities: [
        { id: 0, type: 'unit', name: 'Pilot', side: 'WEST', startFrameNum: 0, positions: [[[10, 20], 0, 1, 0, 'Pilot', 1], [[10, 20], 0, 1, 1, 'Pilot', 1], [[50, 60], 0, 1, 1, 'Pilot', 1]] },
        { id: 1, type: 'vehicle', name: 'Heli', class: 'heli', startFrameNum: 0, positions: [[[10, 20, 0], 0, 1, []], [[10, 20, 3], 0, 1, [0]], [[50, 60, 150], 0, 1, [0]]] },
      ],
      events: [],
    };
    const u = parseOcap(JSON.stringify(rec), 'old');
    const c = <T extends Float64Array | string[]>(name: string) => u.data[u.columns.indexOf(name)] as T;
    const pilot = [...c<string[]>('Object').keys()].filter((i) => c<string[]>('Object')[i] === 'Pilot #0');
    expect(pilot.map((i) => c<Float64Array>('Z')[i])).toEqual([0, 3, 150]);
  });

  it("turns an Arma 3 vehicle's turret and gun toward where its crew's shots went", () => {
    // A tank heading east (90), its gunner shooting at frame 1 to the south (right of the hull) and up, at frame 2
    // north-east with no height (the original layout: no pitch).
    const rec = {
      worldName: 'Altis',
      captureDelay: 1,
      endFrame: 2,
      entities: [
        { id: 0, type: 'unit', name: 'Gunner', side: 'WEST', startFrameNum: 0, positions: [[[100, 100, 10], 90, 1, 1, 'Gunner', 1], [[100, 100, 10], 90, 1, 1, 'Gunner', 1], [[100, 100, 10], 90, 1, 1, 'Gunner', 1]], framesFired: [[1, [100, 0, 110]], [2, [200, 200]]] },
        { id: 1, type: 'vehicle', name: 'Slammer', class: 'tank', startFrameNum: 0, positions: [[[100, 100, 10], 90, 1, [0]], [[100, 100, 10], 90, 1, [0]], [[100, 100, 10], 90, 1, [0]]] },
      ],
      events: [],
    };
    const u = parseOcap(JSON.stringify(rec), 'aim');
    const c = <T extends Float64Array | string[]>(name: string) => u.data[u.columns.indexOf(name)] as T;
    const tank = [...c<string[]>('Object').keys()].filter((i) => c<string[]>('Object')[i] === 'Slammer #1');
    const yaw = tank.map((i) => c<Float64Array>('TurretYaw')[i]);
    const pitch = tank.map((i) => c<Float64Array>('GunPitch')[i]);
    expect(yaw[0]).toBeNaN();
    expect(yaw[1]).toBeCloseTo(90);
    expect(pitch[1]).toBeCloseTo(45);
    expect(yaw[2]).toBeCloseTo(-45);
    expect(pitch[2]).toBeNaN();
    // The gunner's own rows say nothing of a turret.
    const gunner = [...c<string[]>('Object').keys()].filter((i) => c<string[]>('Object')[i] === 'Gunner #0');
    expect(gunner.every((i) => Number.isNaN(c<Float64Array>('TurretYaw')[i]))).toBe(true);
  });

  it('places events where they happened, naming both sides', () => {
    // The full account is the Detail; the Event its kind, a word a filter can list.
    const ev = col<string[]>('Detail');
    const kind = col<string[]>('Event');
    const obj = col<string[]>('Object');
    const at = (s: string) => ev.findIndex((e) => e.startsWith(s));
    const killed = at('killed');
    expect(ev[killed]).toBe('killed ← Alpha (MX 6.5 mm, 212 m)');
    expect(kind[killed]).toBe('killed');
    expect(obj[killed]).toBe('Ivan #1');
    expect(col<Float64Array>('X')[killed]).toBe(300);
    expect(col<Float64Array>('Distance')[killed]).toBeCloseTo(212.4);
    expect(col<string[]>('Killer')[killed]).toBe('Alpha');
    const kill = at('kill →');
    expect(ev[kill]).toBe('kill → Ivan (MX 6.5 mm, 212 m)');
    expect(kind[kill]).toBe('kill');
    expect(obj[kill]).toBe('Alpha #0');
    // A hit by nobody: no killer, no distance.
    expect(ev[at('hit')]).toBe('hit');
    expect(ev[at('connected')]).toBe('connected: Alpha');
    expect(ev[at('getin')]).toBe('getin → Hunter');
    // What happened nowhere in particular: the mission's, in the middle of everything.
    const end = at('endMission');
    expect(ev[end]).toBe('endMission: BLUFOR wins');
    expect(kind[end]).toBe('endMission');
    expect(kind[at('getin')]).toBe('getin');
    expect(obj[end]).toBe('Mission');
    expect(col<string[]>('Side')[end]).toBe('WEST');
    expect(col<string[]>('Type')[end]).toBe('Mission');
    const tickets = at('respawnTickets');
    expect(col<string[]>('Text')[tickets]).toBe('[-1,10,10,-1]');
  });

  it('keeps every shot with where it went, the markers, the clock and the recording\'s own fields', () => {
    const ev = col<string[]>('Detail');
    const fired = [...ev.keys()].filter((i) => ev[i].startsWith('fired'));
    expect(fired.length).toBe(2);
    const f = fired[0];
    expect(col<string[]>('Object')[f]).toBe('Alpha #0');
    expect(col<Float64Array>('TargetX')[f]).toBe(150);
    expect(col<Float64Array>('Distance')[f]).toBeCloseTo(Math.hypot(150 - 101, 250 - 200, 10 - 10), 6);
    const mines = [...ev.keys()].filter((i) => col<string[]>('Object')[i] === 'marker Mines #M1');
    expect(mines.map((i) => ev[i])).toEqual(['marker hd_warning: Mines', '', 'marker gone: Mines']);
    expect(col<Float64Array>('X')[mines[1]]).toBe(510);
    expect(col<string[]>('Color')[mines[0]]).toBe('D9D900');
    expect(col<string[]>('Side')[mines[0]]).toBe('EAST');
    const dot = [...ev.keys()].find((i) => col<string[]>('Object')[i] === 'marker mil_dot #M2')!;
    expect(col<string[]>('Shape')[dot]).toBe('RECTANGLE grid 75x75');
    expect(col<string[]>('Side')[dot]).toBe('GLOBAL');
    const alpha = rowsOf('Alpha #0');
    expect(col<string[]>('GameDate')[alpha[4]]).toBe('2035-05-01T18:00:06');
    expect(col<Float64Array>('TimeMultiplier')[alpha[0]]).toBe(1);
    expect(JSON.parse(col<string[]>('Info')[0])).toMatchObject({ missionAuthor: 'Someone', addonVersion: '2.0.0', endFrame: 5 });
  });

  it('says what things are in words the figures know', () => {
    const type = col<string[]>('Type');
    const veh = col<string[]>('Vehicle');
    const fig = (i: number) => figureFor([veh[i]], [type[i]]);
    expect(fig(rowsOf('Alpha #0')[0])).toBe('soldier');
    expect(fig(rowsOf('Hunter #2')[0])).not.toBeNull();
    // A marker's text names no vehicle, whatever it says.
    const mines = col<string[]>('Object').indexOf('marker Mines #M1');
    expect(mines).toBeGreaterThanOrEqual(0);
    expect(veh[mines]).toBe('');
  });

  it('loads into a block by its own hints, north-up with headings as yaw', async () => {
    const file = new File([gzipSync(Buffer.from(TEXT))], '2026_11_07__20_00_Test.json.gz');
    const base: ColumnMapping = {
      x: null, y: null, z: null, lookMode: 'none', yaw: null, pitch: null, dirX: null, dirY: null, dirZ: null,
      angleUnit: 'radians', personId: null, teamId: null, sessionId: null, time: null, timeUnit: 'seconds',
      extra: [], extraNumeric: {}, delimiter: ',', axes: { ...DEFAULT_AXIS_MAPPING },
    };
    const mapping = applyHints(base, ocapHints() as MappingHints, t.columns, t.numeric);
    const block = await ingestOcap(file, mapping, () => {});
    expect(block.rows).toBe(t.rows);
    expect(block.personLabels).toEqual(expect.arrayContaining(['Alpha #0', 'Ivan #1', 'Hunter #2']));
    expect(block.teamLabels).toEqual(expect.arrayContaining(['WEST', 'EAST']));
    expect(block.sessionLabels).toEqual(['Test op (2026-11-07 20:00)']);
    expect(block.attrs.map((a) => a.name)).toContain('Event');
    // Height is world up; north is world -z; a bearing of 90 looks east.
    expect(block.py[0]).toBe(10);
    expect(block.pz[0]).toBe(-200);
    expect(block.yaw![0]).toBeCloseTo(Math.PI / 2, 6);
  });
});
