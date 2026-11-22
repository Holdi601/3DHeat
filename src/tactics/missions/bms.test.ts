import { describe, expect, it } from 'vitest';
import { bmsAt, bmsDtc, bmsFeet, readBmsCampaign, readBmsDtc, writeBmsDtc } from './bms';
import { missionToPlan, readMission } from './index';
import { planToMission } from './fromPlan';
import { routeOf } from '../plan';

/** A made-up pilot cartridge: one other section, three steerpoints, two threats, one line. */
function cartridge(): string {
  const l: string[] = ['[EWS]', 'Flare Bingo=5', 'PGM=2', '[STPT]'];
  const unused = '0.000000, 0.000000, 0.000000, -1, Not set';
  const steer = ['100000.000000, 200000.000000, -50.000000, 1, Not set', '160000.000000, 260000.000000, 0.000000, 0, Not set', '220000.000000, 240000.000000, -10.000000, 7, Home'];
  for (let i = 0; i < 24; i++) l.push(`target_${i}=${steer[i] ?? unused}`);
  for (let i = 80; i < 99; i++) l.push(`target_${i}=${i === 80 ? '150000.000000, 150000.000000, 0.000000, -1, Not set' : unused}`);
  const ppt = ['300000.000000, 310000.000000, 0.000000, 72913.390625, SA3', '320000.000000, 330000.000000, 0.000000, 0.100000, AWC'];
  for (let i = 0; i < 15; i++) l.push(`ppt_${i}=${ppt[i] ?? '0.000000, 0.000000, 0.000000, 0.000000,'}`);
  for (let i = 0; i < 24; i++) l.push(`lineSTPT_${i}=${i < 3 ? `${400000 + i * 10000}.000000, 500000.000000, 0.000000` : '0.000000, 0.000000, 0.000000'}`);
  for (let i = 0; i < 100; i++) l.push(`wpntarget_${i}=${unused}`);
  l.push('[MFD]', 'AA_Left=FCR', '');
  return l.join('\r\n');
}
const bytes = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const text = (b: Uint8Array) => String.fromCharCode(...b);

describe('Falcon BMS data cartridge', () => {
  it('maps feet north/east/down to board metres and back', () => {
    const p = bmsAt(1000, 2000, -300);
    expect(p).toEqual({ x: 2000 * 0.3048, y: 300 * 0.3048, z: -1000 * 0.3048 });
    const [x, y, z] = bmsFeet(p);
    expect(x).toBeCloseTo(1000, 9);
    expect(y).toBeCloseTo(2000, 9);
    expect(z).toBeCloseTo(-300, 9);
  });

  it('reads the steerpoints as a route, threats as zones, lines as lines', () => {
    const m = readBmsDtc(cartridge(), 'Pilot.ini');
    expect(m.format).toBe('bms-dtc');
    expect(m.title).toBe('Pilot');
    expect(m.groups).toHaveLength(1);
    const g = m.groups[0];
    expect(g.route.map((w) => w.name)).toEqual(['STPT 1', 'STPT 2', 'STPT 3 Home']);
    expect(g.route[0].kind).toBe('Takeoff');
    expect(g.route[2].kind).toBe('Land');
    expect(g.units[0].at).toEqual(g.route[0].at);
    const sa3 = m.places.find((p) => p.name === 'SA3')!;
    expect(sa3.kind).toBe('zone');
    expect(sa3.radius).toBeCloseTo(72913.390625 * 0.3048);
    expect(m.places.find((p) => p.name === 'AWC')?.radius).toBeCloseTo(0.1 * 0.3048);
    expect(m.places.find((p) => p.name === 'STPT 81')?.kind).toBe('marker');
    expect(m.lines).toHaveLength(1);
    expect(m.lines![0].points).toHaveLength(3);
  });

  it('writes an unchanged plan back as the very same file', async () => {
    const src = bytes(cartridge());
    const m = await readMission('Pilot.ini', src);
    const plan = missionToPlan(m);
    expect(plan.drawings).toHaveLength(1);
    const r = writeBmsDtc(planToMission(plan), src);
    expect(text(r.bytes)).toBe(cartridge());
    expect(r.summary.changed).toEqual([]);
  });

  it("patches only the steerpoints, threats and lines, keeping the pilot's other settings", async () => {
    const src = bytes(cartridge());
    const plan = missionToPlan(await bmsDtc.read(src, 'Pilot.ini'));
    const lead = plan.figures.find((f) => f.label === 'Ownship')!;
    const route = routeOf(plan, lead.id, 0)!;
    route.points[1] = { ...route.points[1], x: route.points[1].x + 3048 };
    plan.areas[0].radius = 10000;
    const out = text(writeBmsDtc(planToMission(plan), src).bytes);
    const before = cartridge().split('\r\n');
    const after = out.split('\r\n');
    expect(after).toHaveLength(before.length);
    const changed = after.flatMap((l, i) => (l === before[i] ? [] : [l.split('=')[0]]));
    expect(changed).toEqual(['target_1', 'ppt_0']);
    expect(out).toContain('[EWS]\r\nFlare Bingo=5');
    expect(out).toMatch(/target_1=160000\.000000, 270000\.000000/);
    expect(out).toMatch(/ppt_0=300000\.000000, 310000\.000000, 0\.000000, 32808\.39\d+, SA3/);
  });

  it('adds [STPT] to a cartridge without one, and makes a new cartridge', async () => {
    const plan = missionToPlan(readBmsDtc(cartridge(), 'Pilot.ini'));
    const m = planToMission(plan);
    const out = text(writeBmsDtc(m, bytes('[EWS]\r\nPGM=2\r\n')).bytes);
    // The board keeps no waypoint actions: a steerpoint the cartridge did not have is written without one.
    expect(out.slice(0, 80)).toBe('[EWS]\r\nPGM=2\r\n[STPT]\r\ntarget_0=100000.000000, 200000.000000, -50.000000, -1, Not set\r\n'.slice(0, 80));
    expect(out.split('\r\n').filter((l) => l.includes('='))).toHaveLength(2 + 24 + 19 + 15 + 24 + 100 - 1);
    const fresh = writeBmsDtc(m, null);
    expect(fresh.summary.warnings.map((w) => w.code)).toContain('bms-new');
    const back = readBmsDtc(text(fresh.bytes), 'x.ini');
    expect(back.groups[0].route).toHaveLength(3);
    expect(back.places.filter((p) => p.kind === 'zone')).toHaveLength(2);
    expect(back.lines?.[0].points).toHaveLength(3);
  });

  it('says what does not fit', () => {
    const m = readBmsDtc(cartridge(), 'Pilot.ini');
    m.groups[0].route = Array.from({ length: 30 }, (_, i) => ({
      at: bmsAt(1000 * i, 1000, 0),
    }));
    m.places.push({
      name: 'Big SAM site',
      kind: 'zone',
      at: bmsAt(1, 2, 0),
      radius: 1000,
    });
    const codes = writeBmsDtc(m, null).summary.warnings.map((w) => w.code);
    expect(codes).toContain('bms-stpt-many');
    expect(codes).toContain('bms-ppt-code');
  });
});

describe('Falcon BMS campaign and TE files', () => {
  it('reads the directory and the teams of the text part', () => {
    const te = ':Teams\n2\n:Team\n1 0 0\n:TeamName\nBlue Force\n:TeamFlag\n1\n:Team\n2 0 0\n:TeamName\nRed Force\n:TeamFlag\n6\n';
    const parts: [string, Uint8Array][] = [
      ['Sample.te', bytes(te)],
      ['Sample.ver', bytes('110')],
      ['Sample.cmp', new Uint8Array([9, 9, 9, 9])],
    ];
    let off = 4;
    const body: number[] = [];
    const dir: number[] = [];
    const u32 = (a: number[], v: number) => a.push(v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >> 24) & 255);
    u32(dir, parts.length);
    for (const [name, data] of parts) {
      dir.push(name.length, ...bytes(name));
      u32(dir, off);
      u32(dir, data.length);
      body.push(...data);
      off += data.length;
    }
    const head: number[] = [];
    u32(head, off);
    const file = new Uint8Array([...head, ...body, ...dir]);
    const m = readBmsCampaign(file, 'Sample.tac');
    expect(m.sides.map((s) => s.name)).toEqual(['Blue Force', 'Red Force']);
    expect(m.groups).toHaveLength(0);
    expect(m.notes[0]).toMatch(/TE file \(version 110\)/);
    expect(() => readBmsCampaign(new Uint8Array(12), 'x.cam')).toThrow(/campaign/);
  });
});
