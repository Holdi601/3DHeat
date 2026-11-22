import { describe, expect, it } from 'vitest';
import { il2BinaryText, il2BinaryToText, isIl2Binary, readIl2Binary } from './il2Bin';
import { il2Mission, readIl2Mission } from './il2';
import { writeIl2Mission } from './il2Write';
import { missionToPlan } from './index';
import { planToMission } from './fromPlan';

/** Writes the binary form the way the reader reads it, for a made-up mission (test only). */
class Out {
  bytes: number[] = [];
  private dv = new DataView(new ArrayBuffer(8));
  private put(n: number) {
    for (let i = 0; i < n; i++) this.bytes.push(this.dv.getUint8(i));
  }
  u8(v: number) {
    this.bytes.push(v & 255);
  }
  u16(v: number) {
    this.dv.setUint16(0, v, true);
    this.put(2);
  }
  i16(v: number) {
    this.dv.setInt16(0, v, true);
    this.put(2);
  }
  u32(v: number) {
    this.dv.setUint32(0, v >>> 0, true);
    this.put(4);
  }
  i32(v: number) {
    this.dv.setInt32(0, v, true);
    this.put(4);
  }
  f32(v: number) {
    this.dv.setFloat32(0, v, true);
    this.put(4);
  }
  f64(v: number) {
    this.dv.setFloat64(0, v, true);
    this.put(8);
  }
  str(s: string) {
    this.u32(s.length);
    for (const c of s) this.bytes.push(c.charCodeAt(0));
  }
  list(xs: number[]) {
    this.u32(xs.length);
    for (const x of xs) this.u32(x);
  }
  table(size: number, rows: string[]) {
    this.u32(size);
    this.u16(rows.length);
    for (const _ of rows) this.u16(1);
    for (const r of rows) for (let i = 0; i < size; i++) this.bytes.push(i < r.length ? r.charCodeAt(i) : 0);
  }
  head(type: number, index: number, x: number, y: number, z: number, yaw = 0) {
    this.u32(type);
    this.u32(index);
    this.f64(x);
    this.f64(y);
    this.f64(z);
    this.u16(0);
    this.u16(Math.round(yaw / 0.006));
    this.u16(0);
  }
  mcu(name: number, targets: number[], objects: number[]) {
    this.i16(name);
    this.i16(0);
    this.i32(-1);
    this.u8(1);
    this.list(targets);
    this.list(objects);
  }
}

const NAMES = ['Hawk Lead', 'Hawk Two', 'Plane entity', 'WP1', 'Mission Begin', 'Go', 'Flight'];

/** Two planes (a lead and a wingman following it), a waypoint, a start and a timer, in a group. */
function sample(): Uint8Array {
  const o = new Out();
  // Header: version 30, single player, date 5.7.1943, 9:15:00.
  for (const v of [30, 0, 0, 5, 7, 1943, 0, 15, 9]) o.u32(v);
  for (const s of ['graphics\\LANDSCAPE_Test_su\\height.hini', 'graphics\\LANDSCAPE_Test_su\\textures.tini', '', '', 'test-summer', 'su']) o.str(s);
  o.u32(0);
  o.u32(2);
  o.u32(1);
  o.str('');
  o.u32(0);
  for (const v of [1200, 6000, 0, 0]) o.u32(v);
  for (const v of [1, 0, 20, 760, 0.2]) o.f64(v);
  o.u32(0);
  o.str('summer\\01_Light_00\\sky.ini');
  o.u32(1);
  o.u32(2);
  for (const v of [0, 90, 3, 500, 90, 5]) o.f64(v);
  o.u32(3);
  for (const v of [0, 0, 101, 1, 201, 2]) o.u32(v);
  // Tables: names, descriptions, models, skins, scripts, damage states.
  o.u32(6);
  o.u8(0);
  o.u8(0);
  o.u8(0);
  o.table(32, NAMES);
  o.table(32, ['']);
  o.table(128, ['graphics\\planes\\yak1s69\\yak1s69.mgm']);
  o.table(128, ['']);
  o.table(128, []);
  o.u32(128);
  o.u16(0);
  // Records: one group of seven.
  o.u32(1);
  o.head(6, 1, 1000, 0, 1000);
  o.i16(6);
  o.i16(0);
  o.i32(-1);
  o.u32(7);
  const plane = (name: number, index: number, entity: number, x: number) => {
    o.head(3, index, x, 300, 2000, 90);
    o.i16(name);
    o.i16(0);
    o.i16(0);
    o.i16(0);
    o.u32(entity);
    o.u8(1);
    o.u32(50);
    o.str('LuaScripts\\WorldObjects\\Planes\\yak1s69.txt');
    for (const v of [101, 2]) o.u32(v);
    for (const v of [0, 1, 0, 0]) o.u8(v);
    o.u32(0);
    o.u32(60);
    for (const v of [1, 1, 1]) o.u8(v);
    o.i32(-1);
    o.u32(0);
    o.u32(1);
    o.u8(0);
    o.u8(1);
    o.f32(1);
    o.str('  ');
    o.str('00');
  };
  const entity = (index: number, x: number, targets: number[]) => {
    o.head(30, index, x, 300, 2000);
    o.mcu(2, targets, []);
    o.u32(0);
    o.u32(index - 1);
    o.u32(0);
  };
  plane(0, 2, 3, 1000);
  entity(3, 1000, []);
  plane(1, 4, 5, 1050);
  entity(5, 1050, [3]);
  o.head(42, 6, 9000, 1500, 2000);
  o.mcu(3, [], [3]);
  o.f64(500);
  o.f64(400);
  o.u32(2);
  o.head(28, 7, 800, 0, 1800);
  o.mcu(4, [8], []);
  o.head(41, 8, 820, 0, 1800);
  o.mcu(5, [6], []);
  o.f64(1);
  o.u8(100);
  return new Uint8Array(o.bytes);
}

describe('IL-2 binary missions (.msnbin)', () => {
  it('reads every record, nested in its group', () => {
    const bytes = sample();
    expect(isIl2Binary(bytes)).toBe(true);
    expect(isIl2Binary(new TextEncoder().encode('# Mission File Version = 1.0;\r\nOptions\r\n{\r\n}\r\n'))).toBe(false);
    const m = readIl2Binary(bytes);
    expect(m.options.version).toBe(30);
    expect(m.options.values.Date).toBe('5.7.1943');
    expect(m.records.map((r) => r.cls)).toEqual(['Group', 'Plane', 'MCU_TR_Entity', 'Plane', 'MCU_TR_Entity', 'MCU_Waypoint', 'MCU_TR_MissionBegin', 'MCU_Timer']);
    expect(m.records.slice(1).every((r) => r.depth === 1)).toBe(true);
    expect(m.records[1].fields.Name).toBe('Hawk Lead');
    expect(m.records[1].ori[1]).toBeCloseTo(90, 2);
  });

  it('writes the editor text, which the text reader makes the same board of', () => {
    const text = il2BinaryText(sample());
    expect(text).toContain('Group\r\n{\r\n  Name = "Flight";');
    expect(text).toContain('    WMMask = 1;');
    expect(text).toContain('    TCode = "%20%20";');
    expect(text.endsWith('# end of file\r\n')).toBe(true);
    const state = readIl2Mission(text, 'sample.Mission');
    expect(state.groups).toHaveLength(1);
    const g = state.groups[0];
    expect(g.units.map((u) => u.name)).toEqual(['Hawk Lead', 'Hawk Two']);
    expect(g.side).toBe('blue');
    expect(g.route).toHaveLength(2);
    expect(g.route[1].at).toEqual({ x: 2000, y: 1500, z: -9000 });
    expect(g.route[1].speed).toBeCloseTo(400 / 3.6);
    expect(state.info?.date).toEqual({ year: 1943, month: 7, day: 5 });
  });

  it('opens through the mission reader and saves back as text, saying why not as .msnbin', async () => {
    const bytes = sample();
    const m = await il2Mission.read(bytes, 'sample.msnbin');
    expect(m.title).toBe('sample');
    expect(m.notes[0]).toMatch(/msnbin/);
    const plan = missionToPlan(m);
    const lead = plan.figures.find((f) => f.label === 'Hawk Lead')!;
    lead.keys[0] = { ...lead.keys[0], x: 2100 };
    const r = writeIl2Mission(planToMission(plan), bytes);
    expect(r.summary.warnings.map((w) => w.code)).toContain('il2-binary');
    const back = readIl2Mission(new TextDecoder().decode(r.bytes), 'sample.Mission');
    expect(back.groups[0].units[0].at.x).toBeCloseTo(2100);
    expect(il2BinaryToText(readIl2Binary(bytes))).toBe(il2BinaryText(bytes));
  });

  it('says where a file it does not know ends or breaks', () => {
    const bytes = sample();
    expect(() => readIl2Binary(bytes.slice(0, bytes.length - 3))).toThrow(/ends early/);
    const bad = bytes.slice();
    bad[bad.length - 68] = 99; // the timer's type
    expect(() => readIl2Binary(bad)).toThrow(/type 99/);
  });
});
