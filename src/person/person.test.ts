import { describe, expect, it } from 'vitest';
import { columnsOf } from './table';
import { extractCs2Hits, isCs2Table } from './readCs2';
import { SHIELD_SHARE, isValorantGame, valorantHits } from './readValorant';
import { isOcapRecording, ocapHits } from './readOcap';
import { extractR6Hits } from './readR6';
import { extractSquadHits } from './readSquad';
import { PersonStore } from './store';
import { armourEffect, compileFilter, coverageOf, facetsOf, falloff, headshotRate, hitDetail, hitRows, regionStats, selected, topBy, wholeDamage } from './analyze';
import { wallText } from './card';
import { datasetOf, wallbangs } from './dashSource';
import { catalogOf } from '../dashboards/fields';
import { finishTile, type TileData } from '../dashboards/finish';
import { NO_LINK, planTile } from '../dashboards/plan';
import { Engine, mergePartials, runAll } from '../dashboards/query';
import { queryColumns, storeOf } from '../dashboards/columns';
import type { Tile } from '../dashboards/model';
import { HG_BODY, HG_HEAD, SRC_DERIVED, SRC_ESTIMATE, SRC_RECORDED, SRC_UNKNOWN, angleFromFacing, hitGroupOf, regionOfGroup, zoneOfGroup, type PersonMatch } from './types';
import { armaAmmo, splitOcapWeapon } from './weapons';
import { armaMagazineFacts, armaRoleArmour, calibreOfAmmoId, setArmaFacts, type ArmaFact } from './armaGear';
import { bodyOfPlates, drawBody, genericBody } from './body';

const match = (game: PersonMatch['game'] = ''): PersonMatch => ({ id: 'm', file: 0, game, map: 'test map', mode: '', started: NaN, converterVersion: '', gameVersion: '' });

describe('hit groups', () => {
  it('reads every game’s words', () => {
    expect(hitGroupOf('head')).toBe(HG_HEAD);
    expect(hitGroupOf('HEAD')).toBe(HG_HEAD);
    expect(hitGroupOf('left_leg')).toBe(7);
    expect(hitGroupOf('right arm')).toBe(6);
    expect(hitGroupOf('BODY')).toBe(HG_BODY);
    expect(hitGroupOf('LEG')).toBe(10);
    expect(hitGroupOf('GENERAL')).toBe(0);
    expect(hitGroupOf('generic')).toBe(0);
    expect(regionOfGroup(hitGroupOf('stomach'))).toBe(2);
    expect(zoneOfGroup(HG_BODY)).toBe(1);
    expect(regionOfGroup(HG_BODY)).toBe(-1);
  });
  it('measures the angle against the facing', () => {
    expect(angleFromFacing(1, 0, 10, 0)).toBeCloseTo(0);
    expect(angleFromFacing(1, 0, -10, 0)).toBeCloseTo(180);
    expect(angleFromFacing(1, 0, 0, 5)).toBeCloseTo(90);
    expect(angleFromFacing(0, 0, 1, 0)).toBeNaN();
  });
});

describe('weapons', () => {
  it('reads an OCAP weapon text and its magazine', () => {
    expect(splitOcapWeapon('L85A3 [5.56 mm AP]')).toEqual({ weapon: 'L85A3', magazine: '5.56 mm AP' });
    expect(splitOcapWeapon('Steyr AUG A1 [Tan] [5.56x45mm]')).toEqual({ weapon: 'Steyr AUG A1 [Tan]', magazine: '5.56x45mm' });
    expect(splitOcapWeapon('LAV-25 []')).toEqual({ weapon: 'LAV-25', magazine: '' });
    expect(armaAmmo('5.56 mm AP')).toMatchObject({ calibre: 5.56, ammoType: 'AP' });
    expect(armaAmmo('7N10')).toMatchObject({ calibre: 5.45 });
    expect(armaAmmo('57-N-231')).toMatchObject({ calibre: 7.62, ammo: '7.62x39mm' });
    expect(armaAmmo('600RND 7.62mm Ball Box Tracer')).toMatchObject({ calibre: 7.62, ammoType: 'tracer' });
    expect(armaAmmo('', 'AK-12 7.62 mm')).toMatchObject({ calibre: 7.62 });
    expect(armaAmmo('Smoke')).toBeNull();
  });
});

/** A made-up CS2 table: two players' samples, a body hit through kevlar and a killing headshot. */
function cs2Rows() {
  const rows: Record<string, unknown>[] = [];
  for (let k = 0; k < 20; k++) {
    const t = k * 0.125;
    rows.push({ time: t, event: 'position', player: 'V', side: 'T', x: 0, y: 0, z: 0, dirX: 1, dirY: 0, helmet: 0, walking: 0, duck: 0, airborne: 0, scoped: 0, steamid: '1' });
    rows.push({ time: t, event: 'position', player: 'S', side: 'CT', x: 1000 + k * 10, y: 0, z: 0, dirX: -1, dirY: 0, helmet: 1, walking: 0, duck: 0, airborne: 0, scoped: 1, steamid: '2' });
  }
  rows.push({ time: 1, event: 'hurt', player: 'V', other: 'S', side: 'T', x: 0, y: 0, z: 0, damage: 27, health: 73, armor: 93, armorDamage: 7, hitgroup: 'chest', weapon: 'AK-47', detail: '{"dmg_health":27,"dmg_armor":7}', hitDirX: -1, hitDirY: 0, hitDirZ: 0, hitLocalX: 0.1, hitLocalY: 1.3, hitLocalZ: 0, won: 0, steamid: '1' });
  rows.push({ time: 2, event: 'hurt', player: 'V', other: 'S', side: 'T', x: 0, y: 0, z: 0, damage: 73, health: 0, armor: 93, armorDamage: 0, hitgroup: 'head', weapon: 'AK-47', detail: '{"dmg_health":111,"dmg_armor":0}', won: 0, steamid: '1' });
  rows.push({ time: 2, event: 'kill', player: 'S', other: 'V', side: 'CT', penetrated: 1, throughSmoke: 0, distance: 28.5, hitgroup: 'head', weapon: 'AK-47', steamid: '2' });
  return rows;
}

describe('Counter-Strike 2', () => {
  it('takes the facing and the shooter written on the hit (CS2 tool 1.2.0) over the samples', () => {
    const c = columnsOf([
      { time: 1, event: 'hurt', player: 'V', other: 'S', side: 'T', attackerSide: 'CT', x: 0, y: 0, z: 0, dirX: 0, dirY: 1, attackerX: 0, attackerY: -400, attackerZ: 0, state_helmet: 1, damage: 20, health: 80, armor: 90, armorDamage: 10, hitgroup: 'stomach', weapon: 'M4A4', detail: '', steamid: '1' },
    ]);
    const b = extractCs2Hits(c, match('cs2'));
    expect(b.cols.num.angle[0]).toBeCloseTo(180);
    expect(b.cols.num.distance[0]).toBeCloseTo(400 * 0.0254);
    expect(b.cols.int.helmet[0]).toBe(1);
    expect(b.dicts.armor[b.cols.txt.armor[0]]).toBe('kevlar + helmet');
    expect(b.dicts.shooterSide[b.cols.txt.shooterSide[0]]).toBe('CT');
  });
  it('knows its tables', () => {
    expect(isCs2Table(new Set(['event', 'hitgroup', 'armorDamage', 'steamid']))).toBe(true);
    expect(isCs2Table(new Set(['event', 'hitgroup']))).toBe(false);
  });
  it('makes a hit of each hurt row, tied to the kill and the samples', () => {
    const b = extractCs2Hits(columnsOf(cs2Rows()), match('cs2'));
    expect(b.cols.n).toBe(2);
    const { num: N, int: I, src: S } = b.cols;
    // The body hit: kevlar, no helmet, armour kept off twice what it lost; the distance from the shooter's sample.
    expect(I.hitgroup[0]).toBe(3);
    expect(N.damage[0]).toBe(27);
    expect(N.armorBefore[0]).toBe(100);
    expect(N.absorbed[0]).toBe(14);
    expect(S.absorbed[0]).toBe(SRC_DERIVED);
    expect(b.dicts.armor[b.cols.txt.armor[0]]).toBe('kevlar');
    expect(I.helmet[0]).toBe(0);
    expect(I.kill[0]).toBe(0);
    expect(N.distance[0]).toBeCloseTo(1080 * 0.0254, 1);
    expect(S.distance[0]).toBe(SRC_DERIVED);
    expect(N.angle[0]).toBeCloseTo(0);
    expect(I.penetrated[0]).toBe(-1);
    expect(b.dicts.shooterState[b.cols.txt.shooterState[0]]).toMatch(/scoped/);
    expect(N.calibre[0]).toBeCloseTo(7.62);
    expect(S.calibre[0]).toBe(SRC_ESTIMATE);
    // The killing headshot: the kill row's penetration and distance, recorded.
    expect(I.hitgroup[1]).toBe(HG_HEAD);
    expect(I.kill[1]).toBe(1);
    expect(I.penetrated[1]).toBe(1);
    expect(S.penetration[1]).toBe(SRC_RECORDED);
    expect(N.distance[1]).toBeCloseTo(28.5);
    expect(S.distance[1]).toBe(SRC_RECORDED);
    expect(N.damageRaw[1]).toBe(111);
    expect(I.team[0]).toBe(0);
    expect(b.dicts.shooterSide[b.cols.txt.shooterSide[0]]).toBe('CT');
  });
});

/** A made-up VALORANT game: two players, a body hit into a heavy shield, a killing headshot through a wall. */
function valorantDoc() {
  const meta = (t: number, extra: object = {}) => ({ metadata: { eventTime: { omittingPauses: `${t}s` }, gameVersion: '1.0', ...extra } });
  const snap = (t: number, hp: number, armor: number) => ({
    ...meta(t),
    snapshot: {
      players: [
        { playerId: { value: 1 }, aliveState: { health: 100, armor: 50, position: { x: 2000, y: 0, z: 0 }, viewVector: { x: -1, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, equippedItem: { displayName: 'Vandal', guid: 'g-vandal' } }, inventory: [{ displayName: 'Vandal', guid: 'G-VANDAL' }] },
        { playerId: { value: 2 }, aliveState: { health: hp, armor, position: { x: 0, y: 0, z: 0 }, viewVector: { x: 0, y: 1, z: 0 }, velocity: { x: 500, y: 0, z: 0 } } },
      ],
    },
  });
  return [
    { ...meta(0), platformGameId: 'x', configuration: { teams: [{ teamId: { value: 10 }, name: 'Red', playersInTeam: [{ value: 1 }] }, { teamId: { value: 11 }, name: 'Blue', playersInTeam: [{ value: 2 }] }], players: [{ playerId: { value: 1 }, displayName: 'A' }, { playerId: { value: 2 }, displayName: 'B' }], selectedMap: { fallback: { displayName: 'Test' } } } },
    { ...meta(1), roundStarted: { roundNumber: 1 } },
    snap(2, 100, 50),
    { ...meta(2.5), damageEvent: { location: 'BODY', causerId: { value: 1 }, victimId: { value: 2 }, damageAmount: 39, killEvent: false, wallPen: false, weapon: { fallback: { guid: 'g-vandal' } } } },
    snap(3, 87, 24),
    { ...meta(3.2), damageEvent: { location: 'HEAD', causerId: { value: 1 }, victimId: { value: 2 }, damageAmount: 111, damageDealt: 156, killEvent: true, wallPen: true } },
    { ...meta(4), roundDecided: { result: { roundNumber: 1, winningTeam: { value: 10 } } } },
  ];
}

describe('VALORANT', () => {
  it('knows its files', () => {
    expect(isValorantGame(valorantDoc())).toBe(true);
    expect(isValorantGame({ entities: [] })).toBe(false);
  });
  it('splits each hit into health and shield by the game’s rule', () => {
    const b = valorantHits(valorantDoc() as never, { ...match(), map: '' });
    expect(b.cols.n).toBe(2);
    const { num: N, int: I, src: S } = b.cols;
    expect(I.hitgroup[0]).toBe(HG_BODY);
    expect(N.armorBefore[0]).toBe(50);
    expect(N.absorbed[0]).toBeCloseTo(39 * SHIELD_SHARE);
    expect(N.damage[0]).toBeCloseTo(13);
    expect(b.dicts.armor[b.cols.txt.armor[0]]).toBe('heavy shield');
    expect(b.dicts.weapon[b.cols.txt.weapon[0]]).toBe('Vandal');
    expect(b.dicts.weaponClass[b.cols.txt.weaponClass[0]]).toBe('rifle');
    expect(N.distance[0]).toBeCloseTo(20);
    expect(N.angle[0]).toBeCloseTo(90);
    expect(S.angle[0]).toBe(SRC_DERIVED);
    expect(I.penetrated[0]).toBe(0);
    expect(I.won[0]).toBe(0);
    // The second: what the snapshot left of the shield, a wall, a kill.
    expect(N.armorBefore[1]).toBeCloseTo(24);
    expect(N.absorbed[1]).toBeCloseTo(24);
    expect(N.damage[1]).toBeCloseTo(87);
    expect(N.damageRaw[1]).toBeCloseTo(156 - 24);
    expect(I.kill[1]).toBe(1);
    expect(I.penetrated[1]).toBe(1);
    expect(S.penetration[1]).toBe(SRC_RECORDED);
    expect(b.dicts.weapon[b.cols.txt.weapon[1]]).toBe('Vandal');
    expect(S.weapon[1]).toBe(SRC_DERIVED);
    expect(b.match.map).toBe('Test');
  });
});

describe('Arma 3 (OCAP)', () => {
  const rec = {
    captureDelay: 1,
    worldName: 'test',
    entities: [
      { id: 0, type: 'unit', name: 'V', side: 'EAST', startFrameNum: 0, positions: [[[0, 0, 0], 0, 1, 0, 'V', 1], [[0, 1, 0], 0, 1, 0, 'V', 1], [[0, 2, 0], 0, 1, 0, 'V', 1]] },
      { id: 1, type: 'unit', name: 'S', side: 'WEST', startFrameNum: 0, positions: [[[0, 100, 0], 180, 1, 0, 'S', 1], [[0, 100, 0], 180, 1, 0, 'S', 1], [[0, 100, 0], 180, 1, 0, 'S', 1]] },
      { id: 2, type: 'vehicle', name: 'Car', class: 'car', positions: [] },
    ],
    events: [
      [1, 'hit', 0, [1, 'L85A3 [5.56 mm AP]'], 99],
      [2, 'killed', 0, [1, 'L85A3 [5.56 mm AP]'], 98],
      [2, 'hit', 2, [1, 'L85A3 [5.56 mm AP]'], 50],
      [2, 'endMission', ['WEST', 'won']],
    ],
  };
  it('makes one hit of a hit and the kill that follows it', () => {
    expect(isOcapRecording(rec)).toBe(true);
    const b = ocapHits(rec as never, match());
    expect(b.cols.n).toBe(1);
    const { num: N, int: I, src: S } = b.cols;
    expect(I.kill[0]).toBe(1);
    expect(N.distance[0]).toBe(99);
    expect(S.distance[0]).toBe(SRC_RECORDED);
    expect(N.calibre[0]).toBeCloseTo(5.56);
    expect(b.dicts.ammoType[b.cols.txt.ammoType[0]]).toBe('AP');
    expect(b.dicts.weaponClass[b.cols.txt.weaponClass[0]]).toBe('rifle');
    // Facing north, shot from the north: from the front.
    expect(N.angle[0]).toBeCloseTo(0);
    expect(N.victimSpeed[0]).toBeCloseTo(1);
    expect(I.won[0]).toBe(0);
    expect(I.hitgroup[0]).toBe(0);
    expect(S.damage[0]).toBe(0);
  });
});

describe('Arma 3 catalogue facts', () => {
  const facts: ArmaFact[] = [
    { id: '30Rnd_65x39_caseless_mag', kind: 'magazine', name: '6.5 mm 30Rnd STANAG Mag', short: '6.5 mm', ammo: 'B_65x39_Caseless' },
    { id: 'B_65x39_Caseless', kind: 'ammo', name: 'B_65x39_Caseless', class: 'bullet', hit: 10, caliber: 1, typicalSpeed: 820 },
    { id: 'V_PlateCarrier1_rgr', kind: 'vest', name: 'Carrier Lite (Green)', protection: { HitChest: { armor: 16, passThrough: 0.3 } } },
    { id: 'H_HelmetB', kind: 'helmet', name: 'Combat Helmet', protection: { HitHead: { armor: 6, passThrough: 0.5 } } },
    { id: 'B_Soldier_F', kind: 'man', name: 'Rifleman', side: 'west', vest: 'V_PlateCarrier1_rgr', helmet: 'H_HelmetB' },
  ];
  it('reads a magazine by its short name and a role by its soldier', () => {
    setArmaFacts(facts);
    expect(armaMagazineFacts('6.5 mm')).toMatchObject({ ammo: 'B_65x39_Caseless', hit: 10, typicalSpeed: 820, calibre: 6.5 });
    expect(armaMagazineFacts('7N10')).toBeNull();
    expect(armaRoleArmour('WEST', 'Rifleman')).toEqual({ vest: 'Carrier Lite (Green)', helmet: 'Combat Helmet', chest: 16, head: 6 });
    expect(armaRoleArmour('EAST', 'Rifleman')).toBeNull();
    expect(calibreOfAmmoId('B_556x45_Ball')).toBeCloseTo(5.56);
    expect(calibreOfAmmoId('B_127x99_Ball')).toBeCloseTo(12.7);
    expect(calibreOfAmmoId('B_9x21_Ball')).toBe(9);
    setArmaFacts(null);
  });

  it('puts the estimated armour and the catalogue calibre on an OCAP hit', () => {
    setArmaFacts(facts);
    const rec = {
      captureDelay: 1,
      entities: [
        { id: 0, type: 'unit', name: 'V', side: 'WEST', role: 'Rifleman', startFrameNum: 0, positions: [[[0, 0, 0], 0, 1, 0, 'V', 1]] },
        { id: 1, type: 'unit', name: 'S', side: 'EAST', startFrameNum: 0, positions: [[[0, 100, 0], 180, 1, 0, 'S', 1]] },
      ],
      events: [[0, 'hit', 0, [1, 'MX [6.5 mm 30Rnd STANAG Mag]'], 100]],
    };
    const b = ocapHits(rec as never, match());
    expect(b.dicts.armor[b.cols.txt.armor[0]]).toBe('Carrier Lite (Green) + Combat Helmet');
    expect(b.cols.src.armor[0]).toBe(SRC_ESTIMATE);
    expect(b.cols.num.calibre[0]).toBeCloseTo(6.5);
    setArmaFacts(null);
  });
});

describe('Rainbow Six Siege', () => {
  it('makes a hit of each kill', () => {
    const c = columnsOf([
      { time: 9.8, event: 'position', player: 'V', dirX: 0, dirY: 1, x: 0, y: 0, z: 0 },
      { time: 10, event: 'kill', player: 'S', other: 'V', otherOperator: 'Op', weapon: 'R4-C', weaponClass: 'assault rifle', side: 'attack', x: 0, y: -12, z: 0, headshot: 1, won: 1, round: 3 },
      { time: 10, event: 'death', player: 'V', side: 'defense', x: 0, y: 0, z: 0, headshot: 1, won: 0, round: 3 },
    ]);
    const b = extractR6Hits(c, match());
    expect(b.cols.n).toBe(1);
    expect(b.cols.int.hitgroup[0]).toBe(HG_HEAD);
    expect(b.cols.num.distance[0]).toBeCloseTo(12);
    expect(b.cols.num.angle[0]).toBeCloseTo(180);
    expect(b.cols.int.won[0]).toBe(0);
    expect(b.dicts.weaponClass[b.cols.txt.weaponClass[0]]).toBe('rifle');
    expect(b.dicts.victimRole[b.cols.txt.victimRole[0]]).toBe('Op');
  });
});

describe('Squad', () => {
  it('makes one hit of a wound and the death after it', () => {
    const c = columnsOf([
      { time: 1, event: 'wounded', player: 'V', pawn: 'Rifleman', faction: 'F1', x: 0, y: 0, z: 0, speed: 100 },
      { time: 5, event: 'death', player: 'V', pawn: 'Rifleman', faction: 'F1', x: 0, y: 0, z: 0, speed: 0 },
      { time: 6, event: 'death', player: 'W', pawn: 'Rifleman', faction: 'F2', x: 0, y: 0, z: 0, speed: 0, damage: 62, other: 'S', otherFaction: 'F1', weapon: 'M4' },
    ]);
    const b = extractSquadHits(c, match());
    expect(b.cols.n).toBe(2);
    expect(b.cols.int.kill[0]).toBe(1);
    expect(b.cols.num.damage[1]).toBe(62);
    expect(b.dicts.shooter[b.cols.txt.shooter[1]]).toBe('S');
  });
});

describe('the analysis', () => {
  const store = () => {
    const s = new PersonStore();
    s.add(extractCs2Hits(columnsOf(cs2Rows()), match('cs2')));
    s.add(valorantHits(valorantDoc() as never, match()));
    return s;
  };
  it('counts regions and zones, the coarse hits in their zone only', () => {
    const s = store();
    expect(s.n).toBe(4);
    const r = regionStats(s, selected(s, {}));
    // VALORANT's head is a region; its body only a zone.
    expect(r.fine).toBe(3);
    expect(r.coarse).toBe(1);
    expect(r.regions[0].hits).toBe(2);
    expect(r.regions[0].killRate).toBe(1);
    expect(r.zones[0].hits).toBe(2);
    expect(r.zones[1].hits).toBe(2);
    expect(r.regions[1].share).toBeCloseTo(1 / 3);
  });
  it('filters by every field', () => {
    const s = store();
    expect(selected(s, { games: ['valorant'] }).length).toBe(2);
    expect(selected(s, { penetrated: 'yes' }).length).toBe(2);
    expect(selected(s, { kill: 'no' }).length).toBe(2);
    expect(selected(s, { regions: ['head'] }).length).toBe(2);
    expect(selected(s, { regions: ['body'] }).length).toBe(2);
    expect(selected(s, { armors: ['kevlar'] }).length).toBe(2);
    expect(selected(s, { distance: [25, 30] }).length).toBe(2);
    expect(selected(s, { from: ['side'] }).length).toBe(2);
    expect(compileFilter(s, { weapons: ['AK-47'] })(0)).toBe(true);
  });
  it('draws the charts and the lists', () => {
    const s = store();
    const rows = selected(s, {});
    expect(wholeDamage(s, 0)).toBe(27 + 14);
    const f = falloff(s, rows, 1);
    expect(f.series.map((x) => x.key)).toContain('AK-47');
    // The VALORANT headshot names no weapon: the shooter's held one stands in.
    expect(headshotRate(s, rows, 1).rows).toBe(4);
    const a = armourEffect(s, rows);
    expect(a.groups.map((g) => g.key)).toContain('heavy shield');
    expect(topBy(s, rows, 'weapon')[0]).toMatchObject({ key: 'AK-47', hits: 2 });
    const cov = coverageOf(s);
    expect(cov.cs2.hits).toBe(2);
    expect(cov.cs2.fields.hitgroup[SRC_RECORDED]).toBe(2);
    expect(cov.valorant.fields.distance[SRC_DERIVED]).toBe(2);
  });
});

/**
 * The made-up CS2 table with the shots traced through the map (CS2 tool 1.3.0): the body hit through two surfaces and
 * a fence, the killing hit (the trace saw a clear line, the game says through a wall), a clear hit, a grenade not traced.
 */
function cs2TracedRows() {
  const rows = cs2Rows();
  Object.assign(rows.find((r) => r.event === 'hurt' && r.time === 1)!, { wallbang: 1, wallCount: 2, wallThickness: 0.14, wallSurfaces: 'wood_panel;concrete', wallGrates: 1 });
  Object.assign(rows.find((r) => r.event === 'hurt' && r.time === 2)!, { wallbang: 0, wallCount: 0, wallThickness: 0, wallSurfaces: '', wallGrates: 0 });
  const hurt = { event: 'hurt', player: 'V', other: 'S', side: 'T', x: 0, y: 0, z: 0, armor: 93, armorDamage: 0, hitgroup: 'stomach', detail: '', won: 0, steamid: '1' };
  rows.push({ ...hurt, time: 1.5, damage: 10, health: 63, weapon: 'AK-47', wallbang: 0, wallCount: 0, wallThickness: 0, wallSurfaces: '', wallGrates: 0 });
  rows.push({ ...hurt, time: 1.75, damage: 3, health: 60, weapon: 'hegrenade', wallbang: null, wallCount: null, wallThickness: null, wallSurfaces: '', wallGrates: null });
  return rows.sort((a, b) => (a.time as number) - (b.time as number));
}

describe('CS2 wallbangs on every hit', () => {
  const block = () => extractCs2Hits(columnsOf(cs2TracedRows()), match('cs2'));
  const at = (b: ReturnType<typeof block>, t: number) => Array.from(b.cols.num.time).indexOf(t);
  it('takes the traced shot on a hit that did not kill, as derived', () => {
    const b = block();
    const i = at(b, 1);
    const { int: I, src: S } = b.cols;
    expect(I.penetrated[i]).toBe(1);
    expect(S.penetration[i]).toBe(SRC_DERIVED);
    expect(I.walls[i]).toBe(2);
    expect(I.wallMm[i]).toBe(140);
    expect(I.grates[i]).toBe(1);
    expect(b.dicts.wallSurfaces[b.cols.txt.wallSurfaces[i]]).toBe('wood_panel;concrete');
    // A clear line: not through a wall, derived too.
    const j = at(b, 1.5);
    expect(I.penetrated[j]).toBe(0);
    expect(S.penetration[j]).toBe(SRC_DERIVED);
    expect(I.walls[j]).toBe(0);
  });
  it('keeps the game’s own answer on the killing hit', () => {
    const b = block();
    const i = at(b, 2);
    expect(b.cols.int.kill[i]).toBe(1);
    expect(b.cols.int.penetrated[i]).toBe(1);
    expect(b.cols.src.penetration[i]).toBe(SRC_RECORDED);
    expect(b.cols.int.walls[i]).toBe(0);
  });
  it('leaves a hit the tool did not trace, and every hit of an older table, not known', () => {
    const b = block();
    const g = at(b, 1.75);
    expect(b.cols.int.penetrated[g]).toBe(-1);
    expect(b.cols.src.penetration[g]).toBe(SRC_UNKNOWN);
    expect(b.cols.int.walls[g]).toBe(-1);
    expect(b.cols.int.wallMm[g]).toBe(-1);
    expect(b.cols.txt.wallSurfaces[g]).toBe(0);
    const old = extractCs2Hits(columnsOf(cs2Rows()), match('cs2'));
    expect(old.cols.int.penetrated[0]).toBe(-1);
    expect(old.cols.src.penetration[0]).toBe(SRC_UNKNOWN);
    expect(old.cols.int.walls[0]).toBe(-1);
    expect(old.cols.int.grates[0]).toBe(-1);
    expect(old.cols.int.penetrated[1]).toBe(1);
    expect(old.cols.src.penetration[1]).toBe(SRC_RECORDED);
  });
  const store = () => {
    const s = new PersonStore();
    s.add(block());
    return s;
  };
  it('filters by through a wall, the material and the thickness', () => {
    const s = store();
    const times = (f: Parameters<typeof selected>[1]) => Array.from(selected(s, f), (i) => s.cols.num.time[i]).sort();
    expect(times({ penetrated: 'yes' })).toEqual([1, 2]);
    expect(times({ penetrated: 'no' })).toEqual([1.5]);
    expect(times({ wallSurfaces: ['concrete'] })).toEqual([1]);
    expect(times({ wallSurfaces: ['glass'] })).toEqual([]);
    expect(times({ wallThickness: [10, 20] })).toEqual([1]);
    expect(times({ wallThickness: [0, 5] })).toEqual([1.5, 2]);
    expect(facetsOf(s).wallSurfaces).toEqual([
      ['wood_panel', 1],
      ['concrete', 1],
    ]);
  });
  it('says it on the hit’s card', () => {
    const s = store();
    const card = (t: number) => wallText(hitDetail(s, Array.from(s.cols.num.time.subarray(0, s.n)).indexOf(t))!);
    expect(card(1)).toBe('yes (2 surfaces: wood_panel, concrete, 14 cm, 1 fence or grate) - traced through the map');
    expect(card(1.5)).toBe('no - traced through the map');
    expect(card(2)).toBe('yes - recorded by the game');
    expect(card(1.75)).toBe('not known');
    expect(hitDetail(s, s.n)).toBeNull();
  });
  it('gives the Wallbangs dashboard its rate, thickness and materials', () => {
    const s = store();
    const r = hitRows(s, selected(s, {}), 1000);
    expect(r.nums.find((x) => x.name === 'wallThickness')!.data[0]).toBeCloseTo(14);
    const ds = datasetOf(r);
    const b = wallbangs();
    const cat = catalogOf(ds, b.dashboard);
    const page = { ...b.pages[0], filters: [] };
    const run = (tile: Tile): TileData => {
      const plan = planTile(cat, b.dashboard, page, tile, { pageId: page.id, selection: null, drill: {}, through: null }, NO_LINK)!;
      const e = new Engine(storeOf(ds, queryColumns(plan.queries)));
      const parts = runAll(e.run(plan.queries));
      const results = new Map(plan.queries.map((q, k) => [q.id, mergePartials(q, [parts[k]])]));
      return finishTile(cat, tile, plan, results);
    };
    const tile = (title: string) => b.tiles.find((x) => x.title === title)!;
    const kpi = (title: string) => {
      const d = run(tile(title));
      if (d.kind !== 'kpi') throw new Error(`not a kpi: ${d.kind}`);
      return d.value;
    };
    // Two of the four hits through a wall (the derived non-lethal one and the recorded kill); 14 cm passed.
    expect(kpi('Through a wall')).toBeCloseTo(0.5);
    expect(kpi('Wall passed (cm)')).toBeCloseTo(14);
    const t = run(tile('By material passed'));
    if (t.kind !== 'table') throw new Error(`not a table: ${t.kind}`);
    const row = t.rows.find((x) => x.labels[0] === 'wood_panel, concrete');
    expect(row?.values[0]).toBe(1);
    expect(row?.values[1]).toBeCloseTo(14);
  });
});

describe('the body', () => {
  it('has the seven regions, standing on the ground', () => {
    const b = genericBody();
    expect(new Set(b.parts.map((p) => p.region))).toEqual(new Set([0, 1, 2, 3, 4, 5, 6]));
    let lo = Infinity, hi = -Infinity;
    for (const p of b.parts)
      for (let k = 1; k < p.tris.length; k += 3) {
        lo = Math.min(lo, p.tris[k]);
        hi = Math.max(hi, p.tris[k]);
      }
    expect(lo).toBeGreaterThanOrEqual(-0.01);
    expect(hi).toBeLessThan(1.85);
  });
  it('takes a pack model’s hit groups as its regions', () => {
    const tri = new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 1]);
    const b = bodyOfPlates('x', [{ name: 'dm:head', group: 'head', tris: tri, max: [0, 1.9, 0] }, { name: 'dm:left_leg', group: 'left_leg', tris: tri, max: [0, 1, 0] }]);
    expect(b?.parts.map((p) => p.region)).toEqual([0, 5]);
    expect(b?.height).toBeCloseTo(1.9);
    expect(bodyOfPlates('y', [{ name: 'hull', group: '', tris: tri, max: [0, 1, 0] }])).toBeNull();
  });
  it('picks the region under a pixel', () => {
    const calls: string[] = [];
    const ctx = new Proxy({}, { get: (_t, k) => (k === 'fillStyle' || k === 'strokeStyle' || k === 'lineWidth' ? '' : () => calls.push(String(k))), set: () => true }) as unknown as CanvasRenderingContext2D;
    const pick = drawBody(ctx, 200, 400, genericBody(), { yaw: 0, pitch: 0, fill: [], noData: '#808080', background: '#000000', hover: -1 });
    // The head is near the top, in the middle; the feet's level holds a leg; beside the body is nothing.
    expect(pick(100, 400 / 2 - (1.64 - 0.9) * (400 * 0.86) / 1.8)).toBe(0);
    expect(pick(5, 200)).toBe(-1);
    expect(calls.length).toBeGreaterThan(100);
  });
});
