import { describe, expect, it } from 'vitest';
import { parseAcmi } from './acmi';
import { AcmiStreamReader, acmiObjectLabel, type AcmiStreamRow } from './acmiStream';

// Recordings of our own, as in acmi.test.ts: every T= shape, events, removals, continued lines, a comment, an unplaced object.
const RECORDINGS = [
  [
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
    '0,Event=Message||Hello',
    '#2.5',
    '-b02',
    'b02,T=0.2|0.2|0,Name=Wreck\\',
    ' part two',
  ].join('\r\n'),
  [
    '﻿FileType=text/acmi/tacview',
    'FileVersion=2.2',
    '0,ReferenceLongitude=10',
    '0,ReferenceLatitude=50',
    '// a note in the file',
    '#0',
    'a01,T=0.1|0.2|3000|0|5|90|100|200|91,Name=F-16C',
    'b02,T=0.1|0.2|3000,Name=Su-27',
    'f0f,Type=Navaid+Static,Name=Beacon',
    'a01,FuelWeight=2000',
    'b02,T=0.12|0.2|3000||||5|6|',
    'd04,T=0.3|0.3||||90|7|8|91,Type=Sea+Watercraft,Name=Ship',
  ].join('\n'),
];

function streamRows(text: string, piece: number) {
  const rows: Omit<AcmiStreamRow, 'props'>[] = [];
  const names: string[] = [];
  const labels: string[] = [];
  const r = new AcmiStreamReader((row) => {
    const { props, ...rest } = row;
    rows.push({ ...rest });
    names.push(props.get('Name') ?? '');
    labels.push(acmiObjectLabel(row.id, props));
  }, 'file');
  // The BOM a TextDecoder would take off.
  const body = text.replace(/^﻿/, '');
  for (let i = 0; i < body.length; i += piece) r.push(body.slice(i, i + piece));
  r.end();
  return { r, rows, names, labels };
}

describe('ACMI as a stream', () => {
  for (const [k, text] of RECORDINGS.entries())
    for (const piece of [1, 3, 7, 64, 1 << 20])
      it(`reads recording ${k} in pieces of ${piece} as parseAcmi reads it whole`, () => {
        const t = parseAcmi(text.replace(/^﻿/, ''), 'file');
        const col = <T>(name: string) => t.data[t.columns.indexOf(name)] as unknown as T;
        const { r, rows, names, labels } = streamRows(text, piece);
        expect(rows.length).toBe(t.rows);
        expect(r.title).toBe(t.title);
        expect(r.refTime).toBe(t.referenceTime);
        expect(r.globals).toEqual(t.globals);
        expect(r.completeness()).toEqual(t.completeness);
        const lat = col<Float64Array>('Latitude');
        const lon = col<Float64Array>('Longitude');
        const alt = col<Float64Array>('Altitude');
        const time = col<Float64Array>('Time');
        const ev = col<string[]>('Event');
        const evo = col<string[]>('EventObjects');
        const obj = col<string[]>('Object');
        const name = col<string[]>('Name');
        rows.forEach((s, i) => {
          expect(s.lat).toBeCloseTo(lat[i], 9);
          expect(s.lon).toBeCloseTo(lon[i], 9);
          expect(s.alt).toBe(alt[i]);
          expect((r.refTime ?? 0) + s.t).toBe(time[i]);
          expect(s.event).toBe(ev[i]);
          expect(s.objects).toBe(evo[i]);
          expect(labels[i]).toBe(obj[i]);
          expect(names[i]).toBe(name[i]);
        });
        // Rows at the reference point are the ones not placed.
        expect(rows.filter((s) => !s.placed).map((s) => s.event)).toEqual(k === 0 ? ['Message: Hello'] : ['Comment: a note in the file', 'Unplaced']);
      });

  it('puts an object whose altitude is never written at sea level, as Tacview does', () => {
    const { rows, names } = streamRows(RECORDINGS[1], 9);
    expect(rows[names.indexOf('Ship')].alt).toBe(0);
  });

  it('sorts properties into numbers and text as parseAcmi does', () => {
    const { r } = streamRows(RECORDINGS[0], 5);
    expect([...r.numericKeys]).toEqual(['IAS']);
    expect([...r.textKeys].sort()).toEqual(['Coalition', 'Name', 'Parent', 'Pilot', 'Type']);
  });
});
