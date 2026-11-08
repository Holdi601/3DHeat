import { describe, expect, it } from 'vitest';
import { acmiHints, parseAcmi } from './acmi';
import { ingestAcmi } from './ingestAcmi';
import { applyHints, type MappingHints } from './automap';
import { DatasetBuilder } from './builder';
import { applyReshape, alignStarts, reshapeOf, sourceSeconds } from './reshape';
import { canWriteAcmi, recordingAcmi, recordingCsv } from './exportRecording';
import { emptyColumnMapping, type Dataset } from '../state/types';

/** Two jets and a bookmark over 20 seconds, as Tacview writes it. */
const RECORDING = [
  'FileType=text/acmi/tacview',
  'FileVersion=2.2',
  '0,ReferenceTime=2026-05-01T10:00:00Z',
  '0,ReferenceLongitude=42',
  '0,ReferenceLatitude=42',
  '0,Title=Test fight',
  ...Array.from({ length: 21 }, (_, t) => [
    `#${t}`,
    `101,T=${(0.001 * t).toFixed(4)}|0.01|3000|0|2|90${t === 0 ? ',Name=F-16C,Pilot=Viper 1,Coalition=Allies,Type=Air+FixedWing,IAS=200' : ''}`,
    `102,T=0.05|${(0.01 + 0.001 * t).toFixed(4)}|4000|0|0|0${t === 0 ? ',Name=Su-27,Pilot=Flanker 1,Coalition=Enemies,Type=Air+FixedWing' : ''}`,
    ...(t === 10 ? ['0,Event=Bookmark|Merge'] : []),
  ]).flat(),
].join('\n');

async function load(text: string, name = 'fight.txt.acmi'): Promise<Dataset> {
  const t = parseAcmi(text);
  const mapping = applyHints(emptyColumnMapping(), acmiHints(t) as MappingHints, t.columns, t.numeric);
  const block = await ingestAcmi(new File([text], name), mapping, () => {});
  const b = new DatasetBuilder(block.rows);
  b.append(block);
  const d = b.finish('fight');
  d.geo = block.geo;
  d.axes = mapping.axes;
  d.roleColumns = { x: 'X', y: 'Y', z: 'Altitude', time: 'Time', person: 'Object', team: 'Coalition', session: 'Recording' };
  return d;
}

const person = (d: Dataset, pilot: string) => d.personLabels.findIndex((l) => l.includes(pilot));

describe('time shift and trim', () => {
  it('moves one track in time and keeps the rows in time order', async () => {
    const d = await load(RECORDING);
    const viper = person(d, 'Viper');
    const out = applyReshape(d, [{ name: 'viper', persons: [viper] }], { viper: 30 }, null);
    expect(out.count).toBe(d.count);
    for (let i = 1; i < out.count; i++) expect(out.time![i]).toBeGreaterThanOrEqual(out.time![i - 1]);
    const v2 = person(out, 'Viper');
    const times = Array.from({ length: out.count }, (_, i) => i).filter((i) => out.personId![i] === v2).map((i) => sourceSeconds(out, out.time![i]));
    expect(Math.min(...times)).toBeCloseTo(Date.UTC(2026, 4, 1, 10) / 1000 + 30, 3);
    expect(out.timeRange[1] - out.timeRange[0]).toBeCloseTo(50, 3);
    expect(reshapeOf(out)?.shifts).toEqual({ viper: 30 });
    // Undone from the reshaped one: the original again.
    expect(applyReshape(out, [{ name: 'viper', persons: [viper] }], {}, null)).toBe(d);
  });

  it('cuts to a span of the file\'s own time', async () => {
    const d = await load(RECORDING);
    const t0 = Date.UTC(2026, 4, 1, 10) / 1000;
    const out = applyReshape(d, [], {}, [t0 + 5, t0 + 12]);
    expect(sourceSeconds(out, out.timeRange[0])).toBeCloseTo(t0 + 5, 3);
    expect(sourceSeconds(out, out.timeRange[1])).toBeCloseTo(t0 + 12, 3);
    // 8 seconds of two jets, and the bookmark.
    expect(out.count).toBe(8 * 2 + 1);
    expect(out.geo).toEqual(d.geo);
  });

  it('lines recordings up by their starts', async () => {
    const d = await load(RECORDING);
    expect(alignStarts(d)).toEqual({});
  });
});

describe('writing a recording out', () => {
  it('writes CSV with the data\'s own columns', async () => {
    const d = await load(RECORDING);
    const csv = recordingCsv(d).split('\n');
    expect(csv[0].startsWith('Time,X,Y,Altitude,yaw_deg,pitch_deg,Object,Coalition,Recording')).toBe(true);
    expect(csv.length).toBe(d.count + 2);
  });

  it('writes ACMI that reads back to the same flights', async () => {
    const d = await load(RECORDING);
    expect(canWriteAcmi(d)).toBe(true);
    const text = recordingAcmi(d)!;
    expect(text).toContain('0,Event=Bookmark|Merge');
    const back = await load(text, 'back.txt.acmi');
    expect(back.count).toBe(d.count);
    const a = person(d, 'Viper');
    const b = person(back, 'Viper');
    const rowsA = Array.from({ length: d.count }, (_, i) => i).filter((i) => d.personId![i] === a);
    const rowsB = Array.from({ length: back.count }, (_, i) => i).filter((i) => back.personId![i] === b);
    expect(rowsB.length).toBe(rowsA.length);
    for (let k = 0; k < rowsA.length; k++) {
      const [ra, rb] = [rowsA[k], rowsB[k]];
      expect(sourceSeconds(back, back.time![rb])).toBeCloseTo(sourceSeconds(d, d.time![ra]), 2);
      // The reference point moves to whole degrees: compare places, not plane metres.
      expect(back.py[rb]).toBeCloseTo(d.py[ra], 1);
    }
    expect(back.personLabels.some((l) => l.includes('Flanker 1'))).toBe(true);
    expect(back.teamLabels).toEqual(expect.arrayContaining(['Allies', 'Enemies']));
    expect(text).toContain('IAS=200');
  });
});
