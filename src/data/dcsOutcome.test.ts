import { describe, expect, it } from 'vitest';
import { AcmiEventFinder } from './acmiEvents';
import { AcmiStreamReader } from './acmiStream';
import { AcmiSorties, DcsRounds, PadOwners, dcsMission, dcsServer, roundAt, wonIn, type Capture, type DcsRoundsFile } from './dcsOutcome';

describe('DCS servers', () => {
  it('names a known server by its Title, Author or Comments, and the mission without version or month', () => {
    expect(dcsServer({ Title: 'BlueFlag_Caucasus_2014_04', Author: 'BlueFlag' })).toEqual({ server: 'Blue Flag', mission: 'BlueFlag Caucasus', kind: 'pvp' });
    expect(dcsServer({ Title: 'SPS-Contention-Syria-SARH-E1', Author: 'SPS Admin' })).toMatchObject({ server: 'SPS Contention', mission: 'SPS-Contention-Syria-SARH-E1' });
    expect(dcsServer({ Title: 'Server_1_Operation_Test_V7.7.99', Author: 'GS Admin' })).toMatchObject({ server: 'Growling Sidewinder', mission: 'Server 1 Operation Test' });
    expect(dcsServer({ Title: 'Some_Mission', Author: 'Admin', Comments: 'Welcome to the Growling Sidewinder Open Conflict Server.' }).server).toBe('Growling Sidewinder');
  });

  it('falls back to an Author that names someone, and to none; --server names it outright', () => {
    expect(dcsServer({ Title: 'Training_Range_v2.1', Author: 'Test Squadron' })).toEqual({ server: 'Test Squadron', mission: 'Training Range', kind: null });
    expect(dcsServer({ Title: 'Capture_Zones_1.3', Author: 'Admin' }).server).toBe('');
    expect(dcsServer({ Title: 'Capture_Zones_1.3', Author: 'Admin' }, 'Test Server').server).toBe('Test Server');
    expect(dcsMission('Operation_Test_Version_4.1.5')).toBe('Operation Test');
    expect(dcsMission('Test_Times_v.16.9')).toBe('Test Times');
    expect(dcsMission('BlueFlag_Caucasus_2014')).toBe('BlueFlag Caucasus');
  });
});

describe('DCS rounds', () => {
  const file: DcsRoundsFile = {
    format: 'heat3d-dcs-rounds',
    version: 1,
    server: 'Test Server',
    source: 'a test page, read 2026-11-15',
    rounds: [
      { id: 7, title: '^Test-Map-A$', start: '2026-11-01T00:00:00', end: '2026-11-03T00:00:00Z', winner: 'Blue', endReason: 'capture', state: 'won' },
      { id: 8, title: '^Test-Map-A$', start: '2026-11-03T00:00:00Z', end: '2026-11-03T00:01:00Z', winner: null, state: 'rotated' },
      { id: 9, title: '^Test-Map-B$', start: '2026-11-01T00:00:00Z', end: null, winner: null, state: 'in progress' },
    ],
  };
  const at = (s: string) => Date.parse(s) / 1000;

  it('picks a recording’s rounds by server, title and time, UTC where no zone is written', () => {
    const r = new DcsRounds([file, { format: 'other' }]);
    const a = r.forRecording('Test Server', 'Test-Map-A', at('2026-11-02T22:00:00Z'), at('2026-11-03T00:30:00Z'));
    expect(a.rounds.map((x) => x.id)).toEqual([7, 8]);
    expect(a.source).toBe('a test page, read 2026-11-15');
    expect(r.forRecording('Other Server', 'Test-Map-A', at('2026-11-02T00:00:00Z'), at('2026-11-02T01:00:00Z')).rounds).toEqual([]);
    expect(r.forRecording('Test Server', 'Test-Map-B', at('2026-11-20T00:00:00Z'), at('2026-11-20T01:00:00Z')).rounds.map((x) => x.id)).toEqual([9]);
  });

  it('gives a row its side’s result in the round it falls in, empty without a winner or a side', () => {
    const { rounds } = new DcsRounds([file]).forRecording('Test Server', 'Test-Map-A', at('2026-11-02T22:00:00Z'), at('2026-11-03T00:30:00Z'));
    const won = roundAt(rounds, at('2026-11-02T23:00:00Z'));
    expect(won?.id).toBe(7);
    expect(wonIn(won, 'Blue')).toBe(1);
    expect(wonIn(won, 'Red')).toBe(0);
    expect(wonIn(won, 'Grey')).toBeNaN();
    const rotated = roundAt(rounds, at('2026-11-03T00:00:30Z'));
    expect(rotated?.id).toBe(8);
    expect(wonIn(rotated, 'Blue')).toBeNaN();
    expect(roundAt(rounds, at('2026-11-03T00:10:00Z'))).toBeNull();
  });
});

/**
 * A synthetic DCS server recording, one frame a second: a Blue jet stands,
 * takes off, shoots down a Red jet that started in the air and lands; a Red
 * attacker's pilot ejects; a Blue jet never leaves the ramp; another is still
 * flying at the end. A FARP is written again in Blue, an airfield removed and
 * written again at its place in Blue.
 */
function recording(): string {
  const lat0 = 42;
  const lon0 = 41;
  const k = 111320;
  const T = (x: number, y: number, z: number) => `${(x / (k * Math.cos((lat0 * Math.PI) / 180))).toFixed(7)}|${(y / k).toFixed(7)}|${z.toFixed(1)}`;
  const jet = (t: number): [number, number, number] => {
    if (t < 30) return [0, 0, 100];
    if (t < 60) return [80 * (t - 30), 0, 100 + 20 * Math.max(0, t - 40)];
    if (t < 100) return [2400 + 80 * (t - 60), 0, 500];
    if (t < 120) return [5600 + 70 * (t - 100), 0, Math.max(100, 500 - 25 * (t - 100))];
    if (t < 130) return [7000 + 15 * (t - 120), 0, 100];
    return [7150, 0, 100];
  };
  const lines = [
    'FileType=text/acmi/tacview',
    'FileVersion=2.2',
    '0,ReferenceTime=2014-06-01T06:00:00Z',
    '0,RecordingTime=2026-11-02T22:00:00Z',
    '0,Title=Test-Map-A',
    '0,DataSource=DCS 2.9',
    '0,Author=Test Admin',
    `0,ReferenceLongitude=${lon0}`,
    `0,ReferenceLatitude=${lat0}`,
  ];
  const end = 260;
  for (let t = 0; t <= end; t++) {
    lines.push(`#${t}`);
    if (t === 0) {
      lines.push(`f1,T=${T(5000, 5000, 100)},Type=Ground+Static+Aerodrome,Name=FARP Alpha,Color=Red,Coalition=Allies`);
      lines.push(`f2,T=${T(-3000, 0, 100)},Type=Ground+Static+Aerodrome,Name=Airfield North,Color=Red,Coalition=Allies`);
    }
    if (t === 150) lines.push(`f1,T=${T(5000, 5000, 100)},Color=Blue,Coalition=Enemies`);
    if (t === 120) lines.push('-f2');
    if (t === 125) lines.push(`f3,T=${T(-3000, 0, 100)},Type=Ground+Static+Aerodrome,Name=Airfield North,Color=Blue,Coalition=Enemies`);
    // a1: Blue, from the ramp, lands at about 116 s and stays.
    lines.push(`a1,T=${T(...jet(t))}${t === 0 ? ',Type=Air+FixedWing,Name=F-16C_50,Pilot=Viper 1,Color=Blue,Coalition=Enemies' : ''}`);
    // b1: Red, starts in the air at 60 s heading west; a1's missile meets it near 77 s.
    if (t >= 60 && t <= 77) lines.push(`b1,T=${T(9000 - 100 * (t - 60), 0, 500)}${t === 60 ? ',Type=Air+FixedWing,Name=MiG-29S,Pilot=Fulcrum 1,Color=Red,Coalition=Allies' : ''}`);
    if (t === 78) lines.push('-b1');
    if (t >= 70 && t <= 76) lines.push(`m1,T=${T(3200 + 600 * (t - 70), 0, 500)}${t === 70 ? ',Type=Weapon+Missile,Name=AIM_120C,Color=Blue,Coalition=Enemies' : ''}`);
    if (t === 77) lines.push('-m1');
    // c1: Red, in the air from the start, its pilot ejects at 50 s.
    if (t <= 50) lines.push(`c1,T=${T(0, 20000 + 150 * t, 2000)}${t === 0 ? ',Type=Air+FixedWing,Name=Su-25T,Pilot=Frogfoot 1,Color=Red,Coalition=Allies' : ''}`);
    if (t === 50) lines.push(`c2,T=${T(0, 20000 + 150 * 50, 1990)},Type=Parachutist,Name=Pilot,Color=Red,Coalition=Allies`);
    if (t === 52) lines.push('-c1');
    // d1: Blue, never leaves the ramp, removed at 100 s.
    if (t < 100) lines.push(`d1,T=${T(-3000, 300, 100)}${t === 0 ? ',Type=Air+FixedWing,Name=F-15C,Pilot=Eagle 1,Color=Blue,Coalition=Enemies' : ''}`);
    if (t === 100) lines.push('-d1');
    // e1: Blue, in the air from 200 s to the end.
    if (t >= 200) lines.push(`e1,T=${T(-20000 + 200 * (t - 200), 10000, 3000)}${t === 200 ? ',Type=Air+FixedWing,Name=FA-18C_hornet,Pilot=Hornet 1,Color=Blue,Coalition=Enemies' : ''}`);
  }
  return lines.join('\n');
}

/** The converter's reading, without the Parquet: the events, each aircraft's sorties, the pads that changed sides. */
function readRecording(text: string) {
  const sorties = new AcmiSorties<string>();
  const caps: Capture<string>[] = [];
  const pads = new PadOwners<string>((c) => caps.push(c));
  const live = new Map<string, string>();
  const finder = new AcmiEventFinder<string, null, { id: string; type: string }>((e) => {
    if (AcmiSorties.isAircraft(e.subjectInfo.type)) sorties.event(e.subjectInfo.id, e.kind, e.t, e.detail);
  });
  const k = 111320;
  const reader = new AcmiStreamReader((row) => {
    if (!row.placed || !row.id) return;
    const type = row.props.get('Type') ?? '';
    const x = (row.lon - 41) * k * Math.cos((42 * Math.PI) / 180);
    const y = (row.lat - 42) * k;
    if (row.event === 'Removed') {
      if (AcmiSorties.isAircraft(type)) sorties.removed(row.id, row.t, finder.airborne(row.id));
      live.delete(row.id);
      if (PadOwners.isPad(type)) pads.removed(row.id, row.t);
      finder.removed(row.id, null, row.t);
      return;
    }
    if (row.event) return;
    if (AcmiSorties.isAircraft(type)) live.set(row.id, row.id);
    if (PadOwners.isPad(type)) pads.sample(row.id, row.t, x, y, row.alt, row.props.get('Color') ?? '', row.props.get('Name') ?? '');
    finder.sample(row.id, null, row.t, x, y, row.alt, type, { id: row.id, type });
  }, 'test');
  reader.push(text);
  reader.end();
  finder.finish();
  sorties.finish(reader.lastTime, (key) => (live.has(key) ? finder.airborne(key) : null));
  return { sorties, caps, finder };
}

describe('Sorties and captures from a synthetic server recording', () => {
  const { sorties, caps } = readRecording(recording());

  it('ends each sortie as it ended: landed with its kill, shot down, ejected, never flown, still flying', () => {
    expect(sorties.of('a1')).toMatchObject([{ n: 1, flown: true, result: 'landed', kills: 1 }]);
    expect(sorties.of('a1')[0].takeoff).toBeGreaterThan(30);
    expect(sorties.of('a1')[0].end).toBeGreaterThan(110);
    expect(sorties.of('b1')).toMatchObject([{ n: 1, flown: true, result: 'shot down', kills: 0 }]);
    expect(sorties.of('c1')).toMatchObject([{ n: 1, flown: true, result: 'ejected' }]);
    expect(sorties.of('d1')).toMatchObject([{ n: 1, flown: false, result: 'no takeoff' }]);
    expect(sorties.of('e1')).toMatchObject([{ n: 1, flown: true, result: 'airborne at end' }]);
    // Every row of an aircraft's has its sortie, the ground time before the take-off too.
    expect(sorties.at('a1', 0)?.n).toBe(1);
    expect(sorties.at('a1', 250)?.n).toBe(1);
    expect(sorties.at('m1', 72)).toBeNull();
  });

  it('starts a second sortie at the next take-off', () => {
    const s = new AcmiSorties<string>();
    s.event('x', 'spawn', 0);
    s.event('x', 'takeoff', 10);
    s.event('x', 'kill', 50);
    s.event('x', 'landing', 100, 'damaged');
    s.event('x', 'takeoff', 300);
    s.event('x', 'eject', 400);
    s.event('x', 'death', 410, 'shot down');
    s.finish(500);
    expect(s.of('x')).toMatchObject([
      { n: 1, result: 'landed damaged', kills: 1 },
      { n: 2, start: 300, result: 'shot down', kills: 0 },
    ]);
    expect(s.at('x', 200)?.n).toBe(1);
    expect(s.at('x', 350)?.n).toBe(2);
  });

  it('tells a FARP written again in another colour and an airfield written again at its place, and nothing at the start', () => {
    expect(caps.map((c) => [c.key, c.name, c.from, c.to])).toEqual([
      ['f3', 'Airfield North', 'Red', 'Blue'],
      ['f1', 'FARP Alpha', 'Red', 'Blue'],
    ]);
    expect(caps[0].t).toBe(125);
    expect(caps[1].t).toBe(150);
  });
});
