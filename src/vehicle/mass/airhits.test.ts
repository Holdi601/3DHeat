import { describe, expect, it } from 'vitest';
import { AcmiEventFinder, toUnitFrame, type AcmiEvent } from '../../data/acmiEvents';
import { dcsAmmo, il2Ammo } from './ammo';
import { extractAcmiHits, labelParts, type AcmiScanColumns } from './scanAcmi';
import { crewRole, groupIl2Reports, il2Fields, il2Match, il2ReportHits } from './il2Report';
import { rayEntry } from './geometry';
import { HitStore, SRC_DERIVED } from './store';
import { armourKnown, EFFECT_BIT, FLAG_DIR, FLAG_DIST, FLAG_LOCAL, FLAG_VICTIM_AI, FLAG2_DAMAGE, FLAG2_DIR_DERIVED, FLAG2_LOCAL_EST, FLAG2_RESULT_DERIVED, FLAG2_SPEED, R_KILL, R_UNKNOWN, type HitMatch } from './types';

const match: HitMatch = { id: 'm', file: 0, map: '', mode: '', started: NaN, gameVersion: '', converterVersion: '', winner: '' };

describe('weapon names', () => {
  it('reads DCS shell calibres and types from their ids', () => {
    expect(dcsAmmo('weapons.shells.M61_20_HE_gr', 'Projectile+Shell')).toMatchObject({ calibre: 20, type: 'HE', kind: 'round', src: 'name' });
    expect(dcsAmmo('weapons.shells.7_62x51tr', 'Projectile+Shell')).toMatchObject({ calibre: 7.62, type: 'ball (tracer)' });
    expect(dcsAmmo('weapons.shells.2A46M_125_AP', 'Projectile+Shell')).toMatchObject({ calibre: 125, type: 'APFSDS' });
    expect(dcsAmmo('weapons.shells.UOF_17_100HE', 'Projectile+Shell').calibre).toBe(100);
    expect(dcsAmmo('weapons.shells.N37_37x155_HEI_T', 'Projectile+Shell')).toMatchObject({ calibre: 37, type: 'HEIT' });
    expect(dcsAmmo('weapons.shells.53-UOR-281U', 'Projectile+Shell')).toMatchObject({ calibre: 57, src: 'table' });
    expect(dcsAmmo('weapons.shells.50Browning_API_M8', 'Projectile+Shell')).toMatchObject({ calibre: 12.7, type: 'API' });
  });

  it('types DCS missiles, rockets and bombs by their ids', () => {
    expect(dcsAmmo('AIM_120C', 'Weapon+Missile')).toMatchObject({ type: 'missile ARH AAM', kind: 'missile', src: 'table' });
    expect(dcsAmmo('AIM-9L', 'Weapon+Missile').type).toBe('missile IR AAM');
    expect(dcsAmmo('AIM-7MH', 'Weapon+Missile').type).toBe('missile SARH AAM');
    expect(dcsAmmo('Vikhr_M', 'Weapon+Missile').type).toBe('missile ATGM');
    expect(dcsAmmo('C_8', 'Weapon+Rocket')).toMatchObject({ kind: 'rocket', calibre: 80 });
    expect(dcsAmmo('GBU_12', 'Weapon+Bomb').type).toBe('bomb guided');
    expect(dcsAmmo('Mk_82', 'Weapon+Bomb').type).toBe('bomb GP');
    expect(dcsAmmo('something new', 'Weapon+Missile')).toMatchObject({ kind: 'missile', src: 'unknown' });
  });

  it('gives DCS missiles and bombs their body diameter', () => {
    expect(dcsAmmo('AIM_120C', 'Weapon+Missile').calibre).toBe(178);
    expect(dcsAmmo('AIM-9L', 'Weapon+Missile').calibre).toBe(127);
    expect(dcsAmmo('P_27PE', 'Weapon+Missile').calibre).toBe(260);
    expect(dcsAmmo('P_27T', 'Weapon+Missile').calibre).toBe(230);
    expect(dcsAmmo('AGM_65D', 'Weapon+Missile').calibre).toBe(305);
    expect(dcsAmmo('FIM_92C', 'Weapon+Missile').calibre).toBe(70);
    expect(dcsAmmo('SA9M311', 'Weapon+Missile').calibre).toBe(170);
    expect(dcsAmmo('Mk_82', 'Weapon+Bomb').calibre).toBe(273);
    expect(dcsAmmo('GBU_31', 'Weapon+Bomb').calibre).toBe(457);
    expect(dcsAmmo('P_33E', 'Weapon+Missile')).toMatchObject({ type: 'missile SARH AAM', calibre: 380 });
    expect(dcsAmmo('Rb 74', 'Weapon+Missile').type).toBe('missile IR AAM');
    expect(dcsAmmo('ARAKM70BHE', 'Weapon+Rocket')).toMatchObject({ kind: 'rocket', calibre: 135 });
  });

  it("reads the F-4E's numbered shells as its 20 mm rounds", () => {
    expect(dcsAmmo('supply.shells.1', 'Projectile+Shell')).toMatchObject({ calibre: 20, kind: 'round', name: 'supply.shells.1', src: 'table' });
  });

  it("reads IL-2's own object names, from its mission reports and its Tacview recordings", () => {
    expect(il2Ammo('BULLET_GER_7-92x57_AP')).toMatchObject({ calibre: 7.92, type: 'AP', kind: 'round' });
    expect(il2Ammo('BULLET_USA_12-7x99_AP').calibre).toBe(12.7);
    expect(il2Ammo('SHELL_GER_75_CV')).toMatchObject({ calibre: 75, type: 'APHE' });
    expect(il2Ammo('SHELL_RUS_76_SPHV').type).toBe('APCR');
    expect(il2Ammo('SHELL_GER_88_HT').type).toBe('HEAT');
    expect(il2Ammo('SHELL_GER_150_HE').calibre).toBe(150);
    expect(il2Ammo('NPC_BULLET_GER_7-92_AP').calibre).toBe(7.92);
    expect(il2Ammo('RKT_USA_M8')).toMatchObject({ kind: 'rocket', calibre: 114 });
    expect(il2Ammo('RKT_RUS_M8').calibre).toBe(82);
    expect(il2Ammo('BOMB_GER_SC250')).toMatchObject({ kind: 'bomb', calibre: 368, type: 'bomb GP' });
    expect(il2Ammo('CLUSTER_RUS_PTAB2515').type).toBe('bomb cluster');
    // A Tacview recording IL-2 writes goes through the DCS path: the same answer.
    expect(dcsAmmo('SHELL_GER_20x82_HE', 'Projectile+Shell')).toEqual(il2Ammo('SHELL_GER_20x82_HE'));
    expect(dcsAmmo('BOMB_GER_SC50', 'Medium+Weapon+Bomb')).toMatchObject({ kind: 'bomb', calibre: 200 });
  });

  it('reads IL-2 ammunition words', () => {
    expect(il2Ammo('BULLET_GER_792x57_SS')).toMatchObject({ calibre: 7.92, type: 'ball', kind: 'round' });
    expect(il2Ammo('BULLET_USA_127x99_API')).toMatchObject({ calibre: 12.7, type: 'API' });
    expect(il2Ammo('SHELL_GER_20x82_MGsch')).toMatchObject({ calibre: 20, type: 'HE (mine)' });
    expect(il2Ammo('SHELL_RUS_37x195_AP').calibre).toBe(37);
    expect(il2Ammo('ROCKET_RS82')).toMatchObject({ kind: 'rocket', calibre: 82 });
    expect(il2Ammo('BOMB_SC250_TYPE1').kind).toBe('bomb');
  });
});

describe('a Tacview hit geometry', () => {
  it('turns world offsets into the unit frame (forward, up, right)', () => {
    const north = { head: 0, pitch: 0, roll: 0 };
    expect(toUnitFrame(north, 0, 1, 0)!.map((v) => +v.toFixed(6) + 0)).toEqual([1, 0, 0]);
    expect(toUnitFrame(north, 1, 0, 0)!.map((v) => +v.toFixed(6) + 0)).toEqual([0, 0, 1]);
    // Heading east: north is on the left.
    expect(toUnitFrame({ head: 90, pitch: 0, roll: 0 }, 0, 1, 0)!.map((v) => +v.toFixed(6) + 0)).toEqual([0, 0, -1]);
    // Rolled right 90 degrees: straight down is to the right.
    expect(toUnitFrame({ head: 0, pitch: 0, roll: 90 }, 0, 0, -1)!.map((v) => +v.toFixed(6) + 0)).toEqual([0, 0, 1]);
    // Nose up 90 degrees: up is forward.
    expect(toUnitFrame({ head: 0, pitch: 90, roll: 0 }, 0, 0, 1)!.map((v) => +v.toFixed(6) + 0)[0]).toBe(1);
    expect(toUnitFrame({ head: NaN, pitch: 0, roll: 0 }, 1, 0, 0)).toBeNull();
  });

  it('a shell from the west striking a tank facing north comes in from its left at its speed', () => {
    const events: AcmiEvent<string, number, string>[] = [];
    const f = new AcmiEventFinder<string, number, string>((e) => events.push(e));
    const tank = { head: 0, pitch: 0, roll: 0 };
    f.sample('tank', 0, 0, 0, 0, 0, 'Ground+Heavy+Armor+Vehicle+Tank', 'tank', null, NaN, tank);
    f.sample('gun', 1, 0, -2000, 1, 2, 'Ground+Heavy+Armor+Vehicle+Tank', 'gun', null, NaN, tank);
    // The shell's samples: 1,000 m/s east, a metre above the tank's reference, removed past it.
    for (let k = 0; k <= 3; k++) {
      f.sample('tank', 10 + k, k * 0.5, 0, 0, 0, 'Ground+Heavy+Armor+Vehicle+Tank', 'tank', null, NaN, tank);
      f.sample('shell', 20 + k, k * 0.5, -1800 + k * 500, 0, 1, 'Projectile+Shell', 'shell', 'gun');
    }
    f.removed('shell', 30, 1.8);
    f.finish();
    const hit = events.find((e) => e.kind === 'hit')!;
    expect(hit.target).toBe('tank');
    const g = hit.hit!;
    expect(g.speed).toBeCloseTo(1000, 3);
    expect(g.dir![2]).toBeCloseTo(1, 3);
    expect(g.local![1]).toBeCloseTo(1, 3);
    expect(Math.abs(g.local![2])).toBeLessThan(1e-6);
    expect(g.miss).toBeCloseTo(1, 3);
    expect(g.launchDistance).toBeCloseTo(1800, 0);
    expect(g.descent).toBeCloseTo(0, 6);
    expect(events.find((e) => e.kind === 'damage')!.hit).toBe(g);
  });
});

/** Made-up converted rows: hits, damage, a death. */
function acmiTable(rows: Record<string, string | number>[]): AcmiScanColumns {
  const n = rows.length;
  const out: AcmiScanColumns = { rows: n, time: new Float64Array(n), num: {}, txt: {} };
  const keys = new Set(rows.flatMap((r) => Object.keys(r)));
  for (const k of keys) {
    if (k === 'Time') continue;
    if (rows.some((r) => typeof r[k] === 'number')) {
      const a = new Float32Array(n).fill(NaN);
      rows.forEach((r, i) => (a[i] = typeof r[k] === 'number' ? (r[k] as number) : NaN));
      out.num[k] = a;
    } else {
      const dict: string[] = [];
      const ids = new Uint32Array(n);
      rows.forEach((r, i) => {
        const v = String(r[k] ?? '');
        let c = dict.indexOf(v);
        if (c < 0) c = dict.push(v) - 1;
        ids[i] = c;
      });
      out.txt[k] = { ids, dict };
    }
  }
  rows.forEach((r, i) => (out.time[i] = r.Time as number));
  return out;
}

describe('DCS hits for the mass analysis', () => {
  const shooter = 'Viper 1-1 (F-16C_50) #a1';
  const target = 'Red 2-1 (MiG-29A) #b2';
  const hit = (t: number, extra: Record<string, number> = {}) => ({ Time: t, Event: 'hit', Name: 'weapons.shells.M61_20_HE_gr', Type: 'Projectile+Shell', Shooter: shooter, Target: target, OtherVehicle: 'MiG-29A', Actor: 'player', Coalition: 'Enemies', ...extra });

  it('takes the weapon, the geometry and the kill', () => {
    const t = acmiTable([
      hit(100, { hitLocalX: 1, hitLocalY: 0.5, hitLocalZ: -2, hitDirX: 0.8, hitDirY: 0, hitDirZ: 0.6, impactSpeed: 780, launchDistance: 600 }),
      hit(100.5),
      { Time: 100.5, Event: 'damage', Object: target, Coalition: 'Allies', Actor: 'ai' },
      { Time: 104, Event: 'death', Object: target, Shooter: shooter, Coalition: 'Allies', Actor: 'ai' },
    ]);
    const b = extractAcmiHits([t], match);
    expect(b.cols.n).toBe(2);
    const c = b.cols;
    expect(b.vehicles[c.victim[0]]).toBe('MiG-29A');
    expect(b.vehicles[c.attacker[0]]).toBe('F-16C_50');
    expect(b.players[c.attackerPlayer[0]]).toBe('Viper 1-1');
    expect(c.calibre[0]).toBe(200);
    expect(b.ammoTypes[c.ammoType[0]]).toBe('HE');
    expect(c.flags[0] & (FLAG_LOCAL | FLAG_DIR | FLAG_DIST)).toBe(FLAG_LOCAL | FLAG_DIR | FLAG_DIST);
    expect(c.flags2[0] & (FLAG2_LOCAL_EST | FLAG2_DIR_DERIVED | FLAG2_SPEED)).toBe(FLAG2_LOCAL_EST | FLAG2_DIR_DERIVED | FLAG2_SPEED);
    expect(c.speed[0]).toBe(780);
    expect(c.dist[0] / 4).toBe(600);
    expect(c.flags[1] & FLAG_LOCAL).toBe(0);
    expect(c.flags[0] & FLAG_VICTIM_AI).toBe(FLAG_VICTIM_AI);
    expect(b.teams[c.victimTeam[0]]).toBe('Allies');
    expect(c.effects[1] & EFFECT_BIT.killingShot).toBeTruthy();
    expect(c.effects[0] & EFFECT_BIT.lethal).toBeTruthy();
    expect(c.effects[0] & EFFECT_BIT.killingShot).toBe(0);
    // The killing shot's result is the kill, marked as worked out: no armour result for the penetration rate.
    expect(c.result[1]).toBe(R_KILL);
    expect(c.flags2[1] & FLAG2_RESULT_DERIVED).toBeTruthy();
    expect(c.result[0]).toBe(R_UNKNOWN);
    expect(armourKnown(c, 1)).toBe(false);
  });

  it('reads a Tacview label', () => {
    expect(labelParts('ABRA 1-1 | X (F-16C_50) #a105')).toEqual({ pilot: 'ABRA 1-1 | X', vehicle: 'F-16C_50' });
    expect(labelParts('(Ataka_9M120) #4c06')).toEqual({ pilot: '', vehicle: 'Ataka_9M120' });
  });

  it('keeps the derived speed and puts an estimated point on the model where its way enters', () => {
    const t = acmiTable([hit(10, { hitLocalX: 0, hitLocalY: 0, hitLocalZ: 3, hitDirX: 0, hitDirY: 0, hitDirZ: -1, impactSpeed: 650, launchDistance: 400 })]);
    const s = new HitStore();
    s.add(extractAcmiHits([t], match) as never);
    s.deriveFlights();
    expect(s.speed[0]).toBe(650);
    expect(s.speedSrc[0]).toBe(SRC_DERIVED);
    // A wall 1 m to the right of the centre (z = 1), facing right: the way in (towards -z) passes the point at z = 3 ... enters at z = 1.
    const wall = new Float32Array([-1, -1, 1, 1, -1, 1, 0, 2, 1]);
    const ph = s.platesFor('k', new Uint32Array([0]), [{ name: 'side', part: 'hull', mm: null, tris: wall }], null, null, null);
    expect(ph.plate[0]).toBe(0);
    expect(ph.point[2]).toBeCloseTo(1, 4);
    expect(ph.angle[0]).toBeCloseTo(0, 3);
    expect(ph.angleSrc[0]).toBe(SRC_DERIVED);
  });

  it('a ray misses a model it does not pass', () => {
    expect(rayEntry([0, 5, 0], [1, 0, 0], [{ tris: new Float32Array([0, 0, -1, 0, 0, 1, 0, 1, 0]) }], 10)).toBeNull();
  });
});

describe('IL-2 mission reports', () => {
  const report = [
    'T:0 AType:0 GDate:1943.7.5 GTime:6:0:0 MFile:Multiplayer/Dogfight/test.msnbin MID: GType:2 CNTRS:0:0,101:1,201:2 SETTS:0 MODS:0 PRESET:0 AQMID:0 ROUNDS:1 POINTS:500',
    'T:10 AType:12 ID:100 TYPE:Yak-1 ser.69 COUNTRY:101 NAME:Plane PID:-1',
    'T:10 AType:12 ID:101 TYPE:BotPilot_Yak1 COUNTRY:101 NAME:BotPilot_Yak1 PID:100',
    'T:10 AType:10 PLID:100 PID:101 BUL:1200 SH:0 BOMB:0 RCT:0 (0,0,0) IDS:x LOGIN:y NAME:RedOne TYPE:Yak-1 ser.69 COUNTRY:101 FORM:0 FIELD:0 INAIR:2 PARENT:-1 ISPL:1 ISTSTART:1 PAYLOAD:0 FUEL:1.000 SKIN: WM:1',
    'T:12 AType:12 ID:200 TYPE:Bf 109 G-2 COUNTRY:201 NAME:Plane PID:-1',
    'T:12 AType:12 ID:201 TYPE:BotPilot_Bf109 COUNTRY:201 NAME:BotPilot_Bf109 PID:200',
    'T:5000 AType:2 AMMO:SHELL_GER_20x82_MGsch AID:200 TID:100',
    'T:5000 AType:3 DMG:0.120 AID:200 TID:100 POS(1000.0,2000.0,3000.0)',
    'T:5000 AType:2 AMMO:SHELL_GER_20x82_MGsch AID:200 TID:101',
    'T:5010 AType:2 AMMO:BULLET_GER_792x57_SS AID:200 TID:100',
    'T:5010 AType:3 DMG:0.030 AID:200 TID:100 POS(1001.0,2000.0,3000.0)',
    'T:5100 AType:4 AID:200 TID:101 POS(1002.0,1990.0,3000.0)',
    'T:5200 AType:4 AID:200 TID:100 POS(1003.0,1980.0,3000.0)',
  ].join('\n');

  it('reads its fields', () => {
    const f = il2Fields('AMMO:BULLET_GER_792x57_SS AID:419839 TID:321535 POS(1.5,2,3)');
    expect(f.get('AMMO')).toBe('BULLET_GER_792x57_SS');
    expect(f.get('TID')).toBe('321535');
    expect(f.get('POS')).toBe('1.5,2,3');
    expect(il2Fields('ID:5 TYPE:Bf 109 G-2 COUNTRY:201').get('TYPE')).toBe('Bf 109 G-2');
  });

  it('puts hits, damage, crew and the kill on the aircraft', () => {
    const b = il2ReportHits(report, il2Match(report, 'missionReport(2026-01-02_03-04-05)[0].txt', 0));
    const c = b.cols;
    expect(c.n).toBe(2);
    expect(b.vehicles[c.victim[0]]).toBe('Yak-1 ser.69');
    expect(b.vehicles[c.attacker[0]]).toBe('Bf 109 G-2');
    expect(b.players[c.victimPlayer[0]]).toBe('RedOne');
    expect(b.teams[c.victimTeam[0]]).toBe('Allies');
    expect(b.teams[c.attackerTeam[0]]).toBe('Axis');
    expect(c.time[0]).toBe(100);
    expect(c.calibre[0]).toBe(200);
    expect(c.calibre[1]).toBe(79);
    expect(c.flags2[0] & FLAG2_DAMAGE).toBeTruthy();
    expect(c.damage[0]).toBe(120);
    // The pilot hit in the same tick, then killed.
    expect(c.effects[0] & EFFECT_BIT.pilot).toBeTruthy();
    expect(c.effects[0] & EFFECT_BIT.crewKilled).toBeTruthy();
    // The aircraft's kill: the last hit the killing shot, the one before within the window lethal too.
    expect(c.effects[1] & EFFECT_BIT.killingShot).toBeTruthy();
    expect(c.effects[0] & EFFECT_BIT.lethal).toBeTruthy();
    expect(c.result[1]).toBe(R_KILL);
    expect(c.flags2[1] & FLAG2_RESULT_DERIVED).toBeTruthy();
    expect(c.flags[0] & FLAG_DIST).toBe(0);
    const m = il2Match(report, 'missionReport(2026-01-02_03-04-05)[0].txt', 0);
    expect(m.map).toBe('test');
    expect(m.started).toBe(Date.UTC(2026, 0, 2, 3, 4, 5));
  });

  it("puts a tank's hits, its crew and the kill on the tank (IL-2 Tank Crew)", () => {
    const tank = [
      'T:0 AType:0 GDate:1943.7.5 GTime:5:0:0 MFile:Multiplayer/test.Mission MID: GType:2 CNTRS:0:0,101:1,201:2 SETTS:0 MODS:0 PRESET:0 AQMID:0 ROUNDS: 1 POINTS: 0',
      'T:10 AType:12 ID:300 TYPE:T-34/76 UTZ (1943) COUNTRY:101 NAME:Tank PID:-1',
      'T:10 AType:12 ID:301 TYPE:BotTankT3476UTZ43_Driver COUNTRY:101 NAME:Driver PID:300',
      'T:10 AType:12 ID:302 TYPE:BotTankT3476UTZ43_Radist COUNTRY:101 NAME:Radio PID:300',
      'T:12 AType:12 ID:400 TYPE:Pz.Kpfw.IV Ausf.G COUNTRY:201 NAME:Tank PID:-1',
      'T:5000 AType:2 AMMO:SHELL_GER_75_CV AID:400 TID:300',
      'T:5000 AType:3 DMG:0.300 AID:400 TID:300 POS(1000.0,10.0,3000.0)',
      'T:5000 AType:2 AMMO:SHELL_GER_75_CV AID:400 TID:301',
      'T:5000 AType:2 AMMO:SHELL_GER_75_CV AID:400 TID:302',
      'T:5050 AType:4 AID:400 TID:301 POS(1000.0,10.0,3000.0)',
      'T:6000 AType:2 AMMO:SHELL_GER_75_HV AID:400 TID:300',
      'T:6000 AType:4 AID:400 TID:300 POS(1000.0,10.0,3000.0)',
    ].join('\n');
    const b = il2ReportHits(tank, il2Match(tank, 'missionReport(2026-01-02_03-04-05)[0].txt', 0));
    const c = b.cols;
    expect(c.n).toBe(2);
    expect(b.vehicles[c.victim[0]]).toBe('T-34/76 UTZ (1943)');
    expect(b.vehicles[c.attacker[0]]).toBe('Pz.Kpfw.IV Ausf.G');
    expect(c.calibre[0]).toBe(750);
    expect(b.ammoTypes[c.ammoType[0]]).toBe('APHE');
    expect(b.ammoTypes[c.ammoType[1]]).toBe('APCR');
    expect(c.effects[0] & EFFECT_BIT.driver).toBeTruthy();
    expect(c.effects[0] & EFFECT_BIT.machineGunner).toBeTruthy();
    expect(c.effects[0] & EFFECT_BIT.crewKilled).toBeTruthy();
    expect(c.effects[1] & EFFECT_BIT.killingShot).toBeTruthy();
    expect(c.result[1]).toBe(R_KILL);
  });

  it('names the crew roles of aircraft and tanks', () => {
    expect(crewRole('BotPilot_Yak1')).toBe('pilot');
    expect(crewRole('BotGunner_He111')).toBe('gunner');
    expect(crewRole('BotTankPz4G_Commander')).toBe('commander');
    expect(crewRole('BotTankPz4G_Loader1')).toBe('loader');
    expect(crewRole('BotTankPz4G_MGunner')).toBe('machineGunner');
    expect(crewRole('BotTankPz4G_CoAimer')).toBe('gunner');
    expect(crewRole('BotDriver1')).toBe('driver');
    expect(crewRole('Pz.Kpfw.IV Ausf.G')).toBe('');
  });

  it('reads a mission in pieces as one', async () => {
    const a = new File(['T:1 AType:0'], 'missionReport(2026-01-02_03-04-05)[1].txt');
    const b = new File(['T:0 AType:0'], 'missionReport(2026-01-02_03-04-05)[0].txt');
    const g = groupIl2Reports([a, b, new File([''], 'x.3dheat')]);
    expect(g.length).toBe(2);
    expect((await g[1].text()).startsWith('T:0')).toBe(true);
  });
});
