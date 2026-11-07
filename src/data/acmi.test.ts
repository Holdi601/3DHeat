import { describe, expect, it } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import { acmiHints, acmiText, parseAcmi, tangentPlane, ACMI_FIXED_COLUMNS } from './acmi';
import { ingestAcmi } from './ingestAcmi';
import { applyHints, type MappingHints } from './automap';
import type { ColumnMapping } from '../state/types';
import { DEFAULT_AXIS_MAPPING } from '../state/types';

// A recording of our own: two aircraft and a missile, in every T= shape.
const RECORDING = [
  'FileType=text/acmi/tacview',
  'FileVersion=2.2',
  '0,ReferenceTime=2026-11-07T10:00:00Z',
  '0,ReferenceLongitude=42',
  '0,ReferenceLatitude=43',
  '0,Title=Test\\, sortie',
  '#0',
  'a01,T=0.1|0.2|3000|0|5|90,Type=Air+FixedWing,Name=F-16C,Pilot=Viper 1,Coalition=Allies,IAS=210.5',
  'b02,T=0.15|0.25|2000,Type=Air+Rotorcraft,Name=Mi-24P,Coalition=Enemies',
  '#1.5',
  'a01,T=0.11||3100',
  'b02,T=|0.26|',
  '#2',
  'c03,T=0.11|0.2|3050|0|0|85,Type=Weapon+Missile,Name=AIM-9M,Parent=a01,Coalition=Allies',
  '0,Event=Destroyed|b02|',
  '#2.5',
  '-b02',
  'b02,T=0.2|0.2|0,Name=Wreck\\',
  ' part two',
].join('\n');

describe('ACMI', () => {
  const t = parseAcmi(RECORDING, 'file');

  it('reads every sample, with unchanged fields carried over', () => {
    const name = t.data[t.columns.indexOf('Name')] as string[];
    const alt = t.data[t.columns.indexOf('Altitude')] as Float64Array;
    const lat = t.data[t.columns.indexOf('Latitude')] as Float64Array;
    // a01 twice, b02 twice and the event, c03 once, the new b02 once.
    expect(t.rows).toBe(7);
    expect(t.title).toBe('Test, sortie');
    const second = name.indexOf('F-16C', 1);
    expect(alt[second]).toBe(3100);
    // b02 at 1.5 s kept its longitude and altitude, changed its latitude.
    const b = name.indexOf('Mi-24P', name.indexOf('Mi-24P') + 1);
    expect(lat[b]).toBeCloseTo(43.26, 10);
    expect(alt[b]).toBe(2000);
  });

  it('places events at the object and keeps a removed id apart from its successor', () => {
    const ev = t.data[t.columns.indexOf('Event')] as string[];
    const obj = t.data[t.columns.indexOf('Object')] as string[];
    const i = ev.indexOf('Destroyed');
    expect(i).toBeGreaterThan(0);
    expect(obj[i]).toContain('Mi-24P');
    const last = (t.data[t.columns.indexOf('Name')] as string[])[t.rows - 1];
    expect(last).toBe('Wreck\n part two');
  });

  it('keeps time against the reference and reads headings', () => {
    const time = t.data[t.columns.indexOf('Time')] as Float64Array;
    const head = t.data[t.columns.indexOf('Heading')] as Float64Array;
    expect(time[0]).toBe(Date.parse('2026-11-07T10:00:00Z') / 1000);
    expect(time[t.rows - 1] - time[0]).toBe(2.5);
    expect(head[0]).toBe(90);
    expect(t.columns.slice(ACMI_FIXED_COLUMNS)).toEqual(['IAS']);
  });

  it('projects lat/lon onto true metres round the reference', () => {
    const p = tangentPlane(43, 42);
    const [e, n] = p(44, 42);
    expect(n).toBeGreaterThan(111000);
    expect(n).toBeLessThan(111300);
    expect(Math.abs(e)).toBeLessThan(1);
    const [e2] = p(43, 43);
    // A degree of longitude at 43 degrees north, about 81.5 km.
    expect(e2).toBeGreaterThan(81000);
    expect(e2).toBeLessThan(82000);
  });

  it('keeps the flat-world U/V as columns and positions from latitude and longitude', () => {
    const flat = parseAcmi(['FileType=text/acmi/tacview', '#0', '1,T=0|0|100|5000|-2000,Name=x', '#1', '1,T=0|0.001|100|5100|-2000'].join('\n'));
    expect(flat.flatWorld).toBe(true);
    expect((flat.data[flat.columns.indexOf('U')] as Float64Array)[1]).toBe(5100);
    // A thousandth of a degree north is about 111 m.
    expect((flat.data[flat.columns.indexOf('Y')] as Float64Array)[1]).toBeCloseTo(110.6, 0);
  });

  it('opens a zipped recording', async () => {
    const body = Buffer.from(RECORDING, 'utf-8');
    const comp = deflateRawSync(body);
    const name = Buffer.from('rec.txt.acmi');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(8, 8);
    local.writeUInt32LE(comp.length, 18);
    local.writeUInt32LE(body.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(8, 10);
    central.writeUInt32LE(comp.length, 20);
    central.writeUInt32LE(body.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(0, 42);
    const cdOffset = local.length + name.length + comp.length;
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(1, 8);
    end.writeUInt16LE(1, 10);
    end.writeUInt32LE(central.length + name.length, 12);
    end.writeUInt32LE(cdOffset, 16);
    const zip = Buffer.concat([local, name, comp, central, name, end]);
    const text = await acmiText(new Blob([zip]));
    expect(text).toBe(RECORDING);
  });

  it('loads into a block by its own hints, north-up with headings as yaw', async () => {
    const file = new File([RECORDING], 'sortie.txt.acmi');
    const t2 = parseAcmi(RECORDING);
    const base: ColumnMapping = {
      x: null, y: null, z: null, lookMode: 'none', yaw: null, pitch: null, dirX: null, dirY: null, dirZ: null,
      angleUnit: 'radians', personId: null, teamId: null, sessionId: null, time: null, timeUnit: 'seconds',
      extra: [], extraNumeric: {}, delimiter: ',', axes: { ...DEFAULT_AXIS_MAPPING },
    };
    const mapping = applyHints(base, acmiHints(t2) as MappingHints, t2.columns, t2.numeric);
    const block = await ingestAcmi(file, mapping, () => {});
    expect(block.rows).toBe(7);
    expect(block.personLabels.length).toBe(4);
    expect(block.teamLabels).toContain('Allies');
    expect(block.timeIsAbsolute).toBe(true);
    // Altitude is world up; north is world -z.
    expect(block.py[0]).toBe(3000);
    expect(block.pz[0]).toBeLessThan(0);
    expect(block.yaw![0]).toBeCloseTo(Math.PI / 2, 6);
  });
});
