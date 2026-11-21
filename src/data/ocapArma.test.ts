import { describe, expect, it } from 'vitest';
import { gzipSync } from 'node:zlib';
import { isOcapName, ocapHints, parseOcap } from './ocap';
import { ingestOcap, ocapTableOf } from './ingestOcap';
import { applyHints, type MappingHints } from './automap';
import { armaLevelFor, armaWorldOf, armaWorldsOfLabels } from './armaWorlds';
import { arma3RealVehicle, reforgerUnitId, winnerOfText } from './armaUnits';
import { eventKindOf } from './canonical';
import { summarizeColumns } from '../mass/summarize';
import { readMission } from '../tactics/missions';
import { readOcapMission } from '../tactics/missions/ocap';
import type { CatalogItem } from './catalogIndex';
import type { ColumnMapping } from '../state/types';
import { DEFAULT_AXIS_MAPPING } from '../state/types';

// Synthetic recordings of our own; no real recording is ever committed.

/** Arma 3 (OCAP2 layout): two sides, a vanilla tank, a kill, BLUFOR named the winner. */
const A3 = {
  missionName: 'Synthetic A3',
  worldName: 'Enoch',
  captureDelay: 1,
  endFrame: 4,
  extensionBuild: 'Wed Jul 28 2021',
  times: [{ frameNum: 0, systemTimeUTC: '2026-11-21T19:00:00.000' }],
  entities: [
    {
      id: 0,
      type: 'unit',
      name: 'Blue',
      side: 'WEST',
      group: 'Alpha 1-1',
      role: 'Rifleman',
      isPlayer: 1,
      startFrameNum: 0,
      positions: [
        [[1000, 2000, 50], 90, 1, 0, 'Blue', 1],
        [[1010, 2000, 50], 90, 1, 0, 'Blue', 1],
        [[1020, 2000, 50], 90, 1, 0, 'Blue', 1],
        [[1030, 2000, 50], 90, 1, 0, 'Blue', 1],
        [[1040, 2000, 50], 90, 1, 0, 'Blue', 1],
      ],
    },
    {
      id: 1,
      type: 'unit',
      name: 'Red',
      side: 'EAST',
      group: 'Bravo',
      isPlayer: 0,
      startFrameNum: 0,
      positions: [
        [[1200, 2000, 50], 270, 1, 0, 'Red', 0],
        [[1200, 2000, 50], 270, 1, 0, 'Red', 0],
        [[1200, 2000, 50], 270, 0, 0, 'Red', 0],
      ],
    },
    {
      id: 2,
      type: 'vehicle',
      name: 'M2A4 Slammer',
      class: 'tank',
      startFrameNum: 0,
      positions: [[[900, 1900, 49], 0, 1, [0], [0, 4]]],
    },
    {
      id: 3,
      type: 'vehicle',
      name: 'Hunter',
      class: 'car',
      startFrameNum: 0,
      positions: [[[950, 1950, 49], 0, 1, [], [0, 4]]],
    },
  ],
  events: [
    [2, 'killed', 1, [0, 'MX 6.5 mm'], 180],
    [4, 'endMission', ['WEST', 'BLUFOR triumphed!']],
  ],
  Markers: [['hd_objective', 'Objective Oak', 0, 4, -1, '000000', -1, [[0, [1500, 2500, 0], 0]]]],
};

/** OCAP2's recorder for Reforger, as its receiver builds it: positions [x, up, north], world a world file, gaps null. */
const RF = {
  addonVersion: '0.1.0',
  extensionVersion: '0.1.0',
  extensionBuild: 'reforger',
  missionName: 'Synthetic RF',
  missionAuthor: 'x',
  worldName: 'worlds/MP/CTI_Campaign_Eden.ent',
  endFrame: 2,
  captureDelay: 1,
  tags: '',
  times: [],
  Markers: [],
  entities: [
    {
      id: 0,
      name: 'US soldier',
      group: '',
      side: 'WEST',
      isPlayer: 1,
      type: 'unit',
      role: 'Rifleman',
      startFrameNum: 0,
      framesFired: [],
      positions: [
        [[4800, 12, 6900], 0, 1, 0, 'US soldier', 1, 'Rifleman'],
        [[4800, 12, 6910], 0, 1, 2, 'US soldier', 1, 'Rifleman'],
        [[4800, 12, 6920], 90, 1, 2, 'US soldier', 1, 'Rifleman'],
      ],
    },
    null,
    {
      id: 2,
      name: '{5A2F07A4A9C1F2C9}Prefabs/Vehicles/Wheeled/M151A2/M151A2_transport.et',
      side: 'WEST',
      isPlayer: 0,
      type: 'vehicle',
      class: 'car',
      startFrameNum: 0,
      framesFired: [],
      positions: [[], [[4800, 12, 6910], 0, 1, [0]], [[4800, 12, 6920], 90, 1, [0]]],
    },
  ],
  events: [[2, 'endMission', ['WEST', 'US wins']]],
};

/** 3DHeat's own Reforger recorder (`.jsonl`). */
const JSONL =
  [
    {
      type: 'header',
      format: 'heat3d-reforger',
      version: 1,
      world: 'Arland',
      worldFile: 'worlds/Arland/Arland.ent',
      mission: 'Synthetic JSONL',
      captureDelay: 1,
      startedUtc: '2026-11-21T20:00:00Z',
    },
    {
      type: 'entity',
      id: 0,
      kind: 'unit',
      frame: 0,
      name: 'Player',
      playerId: 1,
      faction: 'USSR',
      group: 3,
      prefab: 'Character_USSR_Rifleman',
    },
    {
      type: 'entity',
      id: 1,
      kind: 'vehicle',
      frame: 0,
      name: 'BTR70',
      class: 'car',
      faction: 'USSR',
      prefab: 'BTR70',
    },
    {
      type: 'frame',
      frame: 0,
      ms: 0,
      units: [[0, 100, 5, 200, 0, 1, -1, 1]],
      vehicles: [[1, 110, 5, 210, 45, 1, []]],
    },
    { type: 'event', event: [0, 'getin', 0, 1] },
    {
      type: 'frame',
      frame: 2,
      ms: 2000,
      units: [[0, 110, 5, 210, 45, 1, 1, 1]],
      vehicles: [[1, 110, 5, 215, 45, 1, [0]]],
    },
    {
      type: 'event',
      event: [2, 'endMission', ['USSR', 'ENDREASON_SCORELIMIT']],
    },
    { type: 'end', frame: 3, reason: 'game end' },
  ]
    .map((l) => JSON.stringify(l))
    .join('\n') + '\n{"type":"frame","frame":4,"uni';

const col = <T extends Float64Array | string[]>(t: ReturnType<typeof parseOcap>, name: string) => t.data[t.columns.indexOf(name)] as T;

describe('OCAP for Arma 3 and Arma Reforger', () => {
  it('names the game, the world as players know it, the real vehicle, and who won', () => {
    const t = parseOcap(JSON.stringify(A3), 'a3');
    expect(t.reforger).toBe(false);
    expect(col<string[]>(t, 'Game')[0]).toBe('Arma 3');
    expect(col<string[]>(t, 'Map')[0]).toBe('Livonia');
    const obj = col<string[]>(t, 'Object');
    const ev = col<string[]>(t, 'Event');
    const won = col<Float64Array>(t, 'Won');
    const at = (o: string) => obj.findIndex((x, i) => x === o && !ev[i]);
    expect(won[at('Blue #0')]).toBe(1);
    expect(won[at('Red #1')]).toBe(0);
    // The tank is on its crew's side, so it won too; the empty car is civilian, no side in the fight.
    expect(won[at('M2A4 Slammer #2')]).toBe(1);
    expect(won[at('Hunter #3')]).toBeNaN();
    expect(col<string[]>(t, 'Unit')[at('M2A4 Slammer #2')]).toBe('Merkava Mk.4');
    expect(col<string[]>(t, 'Unit')[at('Hunter #3')]).toBe('M-ATV');
    expect(col<string[]>(t, 'Winner')[0]).toBe('WEST');
    expect(col<string[]>(t, 'EndReason')[0]).toBe('BLUFOR triumphed!');
    expect(col<Float64Array>(t, 'Duration')[0]).toBe(4);
    expect(col<string[]>(t, 'Date')[0]).toBe('2026-11-21 19:00');
    expect(ocapHints(t).axes.flipY).toBe(true);
  });

  it('reads Reforger positions as east, north, height and keeps the engine frame for display', async () => {
    const t = parseOcap(JSON.stringify(RF), 'rf');
    expect(t.reforger).toBe(true);
    expect(t.game).toBe('Arma Reforger');
    expect(t.map).toBe('Everon');
    const obj = col<string[]>(t, 'Object');
    const ev = col<string[]>(t, 'Event');
    const rows = [...obj.keys()].filter((i) => obj[i] === 'US soldier #0' && !ev[i]);
    expect(rows.map((i) => col<Float64Array>(t, 'Y')[i])).toEqual([6900, 6910, 6920]);
    expect(col<Float64Array>(t, 'Z')[rows[0]]).toBe(12);
    // Who rides in the jeep, its catalogue id, its stock faction.
    expect(col<string[]>(t, 'Riding')[rows[1]]).toMatch(/M151A2_transport\.et$/);
    const jeep = [...obj.keys()].find((i) => obj[i].endsWith('#2') && !ev[i])!;
    expect(col<string[]>(t, 'Unit')[jeep]).toBe('M151A2_transport');
    expect(col<string[]>(t, 'Faction')[rows[0]]).toBe('US');
    expect(col<Float64Array>(t, 'Won')[rows[0]]).toBe(1);

    // In the viewer: north is +z, as in the Reforger levels; a bearing of 90 looks east.
    const file = new File([gzipSync(Buffer.from(JSON.stringify(RF)))], 'rf.json.gz');
    const hints = ocapHints(t) as MappingHints;
    expect(hints.axes!.flipY).toBe(false);
    const base: ColumnMapping = {
      x: null,
      y: null,
      z: null,
      lookMode: 'none',
      yaw: null,
      pitch: null,
      dirX: null,
      dirY: null,
      dirZ: null,
      angleUnit: 'radians',
      personId: null,
      teamId: null,
      sessionId: null,
      time: null,
      timeUnit: 'seconds',
      extra: [],
      extraNumeric: {},
      delimiter: ',',
      axes: { ...DEFAULT_AXIS_MAPPING },
    };
    const block = await ingestOcap(file, applyHints(base, hints, t.columns, t.numeric), () => {});
    const i = block.personLabels.indexOf('US soldier #0');
    const r = [...block.personIds!.keys()].filter((k) => block.personIds![k] === i);
    const last = r[r.length - 1];
    expect(block.pz[r[0]]).toBe(6900);
    expect(block.py[r[0]]).toBe(12);
    // yaw: 0 looks along -z, pi/2 along +x; the bearing 90 is +x.
    expect(Math.sin(block.yaw![last])).toBeCloseTo(1, 5);
    // Bearing 0 (north, +z): yaw pi.
    expect(Math.cos(block.yaw![r[0]])).toBeCloseTo(-1, 5);
  });

  it("reads 3DHeat's own Reforger recorder, a cut-off last line skipped", async () => {
    expect(isOcapName('2026_11_21_Arland.jsonl')).toBe(true);
    expect(isOcapName('3dheat-index.jsonl.gz')).toBe(false);
    const t = await ocapTableOf(new File([JSONL], '2026_11_21_Arland.jsonl'));
    expect(t.reforger).toBe(true);
    expect(t.map).toBe('Arland');
    const obj = col<string[]>(t, 'Object');
    const ev = col<string[]>(t, 'Event');
    const rows = [...obj.keys()].filter((i) => obj[i] === 'Player #0' && !ev[i]);
    // Frames 0 and 2 recorded, frame 1 holds the last.
    expect(rows.map((i) => col<Float64Array>(t, 'Frame')[i])).toEqual([0, 1, 2]);
    expect(col<Float64Array>(t, 'Y')[rows[2]]).toBe(210);
    expect(col<string[]>(t, 'Faction')[rows[0]]).toBe('USSR');
    expect(col<string[]>(t, 'Side')[rows[0]]).toBe('EAST');
    expect(col<string[]>(t, 'Riding')[rows[2]]).toBe('BTR70');
    expect(col<string[]>(t, 'Winner')[0]).toBe('EAST');
    expect(ev).toContain('getin → BTR70');
    const btr = [...obj.keys()].filter((i) => obj[i] === 'BTR70 #1' && !ev[i]);
    expect(btr.map((i) => col<Float64Array>(t, 'Frame')[i])).toEqual([0, 1, 2, 3]);
  });

  it('gives every event its kind in the shared taxonomy', () => {
    expect(eventKindOf('killed ← Blue (MX 6.5 mm, 180 m)')).toBe('death');
    expect(eventKindOf('kill → Red (MX 6.5 mm, 180 m)')).toBe('kill');
    expect(eventKindOf('fired (120 m)')).toBe('fire');
    expect(eventKindOf('hit')).toBe('hit');
    expect(eventKindOf('captured: Alpha')).toBe('capture');
    expect(eventKindOf('connected: Blue')).toBe('other');
    expect(eventKindOf('marker hd_dot: x')).toBe('other');
  });

  it('knows the worlds and finds their levels by world or island name', () => {
    expect(armaWorldOf('{ABCDEF0123456789}worlds/GameMaster/GM_Eden.ent')).toMatchObject({ game: 'arma-reforger', id: 'Eden', name: 'Everon' });
    expect(armaWorldOf('worlds/MP/CTI_Campaign_Cain.ent')).toMatchObject({
      id: 'Cain',
      name: 'Kolguyev',
    });
    expect(armaWorldOf('Altis')).toMatchObject({
      game: 'arma3',
      name: 'Altis',
    });
    const item = (path: string): CatalogItem => ({
      path,
      game: path.split('/')[0],
      kind: 'level',
      name: path
        .split('/')
        .pop()!
        .replace(/\.glb$/, ''),
      bytes: 1,
      mtime: 0,
      sha256: null,
      extractor: null,
      gameBuild: null,
    });
    const items = [item('arma-reforger/preview/Arland-4m-preview.glb'), item('arma-reforger/Eden.glb'), item('warthunder/Altis.glb')];
    expect(armaLevelFor(items, armaWorldOf('worlds/MP/CTI_Campaign_Eden.ent')!)?.path).toBe('arma-reforger/Eden.glb');
    expect(armaLevelFor(items, armaWorldOf('Arland', true)!)?.path).toBe('arma-reforger/preview/Arland-4m-preview.glb');
    // Another game's level of the same name is not Arma 3's.
    expect(armaLevelFor(items, armaWorldOf('Altis')!)).toBeNull();
    expect(armaWorldsOfLabels(['Enoch', 'worlds/Arland/Arland.ent'], ['Arma 3', 'Arma Reforger']).map((w) => `${w.game}:${w.name}`)).toEqual([
      'arma3:Livonia',
      'arma-reforger:Arland',
    ]);
    expect(armaWorldsOfLabels(['Altis'], ['War Thunder'])).toEqual([]);
  });

  it('tells vehicles and winners apart only where the words are sure', () => {
    expect(arma3RealVehicle('Hunter HMG', 'car')).toBe('M-ATV');
    // A "Hunter" that is no car is not the MRAP.
    expect(arma3RealVehicle('Hawker Hunter', 'plane')).toBe('');
    expect(reforgerUnitId('#AR-Vehicle_UAZ469_Name')).toBe('UAZ469');
    expect(reforgerUnitId('UAZ-469')).toBe('');
    expect(winnerOfText('OPFOR has won')).toBe('EAST');
    expect(winnerOfText('BLUFOR and OPFOR draw')).toBe('');
  });

  it('summarises a recording for the mass analysis, with its winner', () => {
    const t = parseOcap(JSON.stringify(A3), 'a3');
    const s = summarizeColumns(t, { id: 'a3', manifest: { game: t.game, map: t.map }, by: 'test' }, JSON.stringify(ocapHints(t)))!;
    expect(s).not.toBeNull();
    expect(s.map).toBe('Livonia');
    expect(s.winner).toBe('WEST');
    expect(s.teams.map((x) => x.name).sort()).toEqual(expect.arrayContaining(['EAST', 'WEST']));
    expect(s.units).toBeGreaterThanOrEqual(3);
  });

  it('loads a recording into the tactics board as its starting state', async () => {
    const m = readOcapMission(JSON.stringify(A3), 'a3.json');
    expect(m.map).toBe('Arma 3: Livonia');
    const alpha = m.groups.find((g) => g.name === 'Alpha 1-1')!;
    expect(alpha.side).toBe('blufor');
    // Arma 3's north is -z on the board.
    expect(alpha.units[0].at).toEqual({ x: 1000, y: 50, z: -2000 });
    expect(alpha.units[0].yaw).toBeCloseTo(Math.PI / 2, 6);
    const tank = m.groups.find((g) => g.name === 'M2A4 Slammer')!;
    expect(tank.side).toBe('blufor');
    expect(tank.units[0].type).toBe('Merkava Mk.4');
    expect(m.groups.find((g) => g.name === 'Hunter')!.side).toBe('civ');
    expect(m.places.map((p) => p.name)).toEqual(['Objective Oak']);
    // Reforger: north +z; through the board's reader, gzipped.
    const r = await readMission('rf.json.gz', new Uint8Array(gzipSync(Buffer.from(JSON.stringify(RF)))));
    expect(r.map).toBe('Arma Reforger: Everon');
    expect(r.groups[0].units[0].at).toEqual({ x: 4800, y: 12, z: 6900 });
  });
});
