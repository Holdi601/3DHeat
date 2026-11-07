import { describe, expect, it } from 'vitest';
import { acmiHints, parseAcmi } from './acmi';
import { applyHints, geoOfHints, parseHints, type MappingHints } from './automap';
import { DatasetBuilder, mergeGeo, type SourceBlock } from './builder';
import { ingestFiles } from './ingestFiles';
import { ingestAcmi } from './ingestAcmi';
import type { ColumnMapping, GeoReference } from '../state/types';
import { DEFAULT_AXIS_MAPPING } from '../state/types';

const recording = (lat: number, lon: number) =>
  [
    'FileType=text/acmi/tacview',
    'FileVersion=2.2',
    `0,ReferenceLongitude=${lon}`,
    `0,ReferenceLatitude=${lat}`,
    '#0',
    'a01,T=0.1|0.2|3000|0|5|90,Type=Air+FixedWing,Name=F-16C,Coalition=Allies',
    '#1',
    'a01,T=0.11|0.21|3100',
  ].join('\n');

const BASE: ColumnMapping = {
  x: null, y: null, z: null, lookMode: 'none', yaw: null, pitch: null, dirX: null, dirY: null, dirZ: null,
  angleUnit: 'radians', personId: null, teamId: null, sessionId: null, time: null, timeUnit: 'seconds',
  extra: [], extraNumeric: {}, delimiter: ',', axes: { ...DEFAULT_AXIS_MAPPING },
};

const mappingOf = (text: string) => {
  const t = parseAcmi(text);
  return applyHints(BASE, acmiHints(t) as MappingHints, t.columns, t.numeric);
};

/** A block from a source with no place on the earth. */
function plainBlock(): SourceBlock {
  return {
    rows: 1, px: Float32Array.of(1), py: Float32Array.of(2), pz: Float32Array.of(3), time: null, timeIsAbsolute: false,
    yaw: null, pitch: null, personIds: null, personLabels: [], teamIds: null, teamLabels: [], sessionIds: null,
    sessionLabels: [], attrs: [], rejected: 0,
  };
}

describe('geographic reference', () => {
  const geo: GeoReference = { lat0: 43, lon0: 42, projection: 'tangent-plane' };

  it('is set by an ACMI recording, from its reference point', async () => {
    const text = recording(43, 42);
    const block = await ingestAcmi(new File([text], 'a.txt.acmi'), mappingOf(text), () => {});
    expect(block.geo).toEqual(geo);
  });

  it('is not set when the ground is mapped from other columns', async () => {
    const text = recording(43, 42);
    const mapping = { ...mappingOf(text), x: 'Longitude', y: 'Latitude' };
    const block = await ingestAcmi(new File([text], 'a.txt.acmi'), mapping, () => {});
    expect(block.geo).toBeUndefined();
  });

  it('reaches the dataset through the whole load', async () => {
    const text = recording(43, 42);
    const { dataset } = await ingestFiles({ files: [new File([text], 'a.txt.acmi')], mapping: mappingOf(text), columns: [], name: 'sortie' });
    expect(dataset.geo).toEqual(geo);
    expect(dataset.axes).toEqual({ up: 'z', flipX: false, flipY: true, flipZ: false, scale: 1 });
  });

  it('is kept only when every file shares it', () => {
    expect(mergeGeo(undefined, geo)).toEqual(geo);
    expect(mergeGeo(geo, { ...geo })).toEqual(geo);
    expect(mergeGeo(geo, { ...geo, lat0: 44 })).toBeNull();
    expect(mergeGeo(geo, null)).toBeNull();
    expect(mergeGeo(null, geo)).toBeNull();

    const same = new DatasetBuilder();
    same.append({ ...plainBlock(), geo });
    same.append({ ...plainBlock(), geo: { ...geo } });
    expect(same.finish('two').geo).toEqual(geo);

    const apart = new DatasetBuilder();
    apart.append({ ...plainBlock(), geo });
    apart.append({ ...plainBlock(), geo: { ...geo, lon0: 41 } });
    expect(apart.finish('apart').geo).toBeUndefined();

    const mixed = new DatasetBuilder();
    mixed.append({ ...plainBlock(), geo });
    mixed.append(plainBlock());
    expect(mixed.finish('mixed').geo).toBeUndefined();
  });

  it('is absent from every other source', () => {
    const b = new DatasetBuilder();
    b.append(plainBlock());
    expect(b.finish('plain').geo).toBeUndefined();
  });

  it("comes from a table's hints when the mapping takes the columns they name", () => {
    // The Watcher's flight tables: x east, y altitude, z north.
    const hints = parseHints(
      JSON.stringify({ columns: { x: 'x', y: 'y', z: 'z' }, geo: { lat0: 42, lon0: 42, projection: 'tangent-plane', east: 'x', north: 'z', up: 'y' } }),
    );
    expect(geoOfHints(hints, { x: 'x', y: 'y', z: 'z' })).toEqual({ lat0: 42, lon0: 42, projection: 'tangent-plane', north: 'z' });
    // North and height the other way round, as an ACMI table has them.
    const acmiLike = parseHints(JSON.stringify({ geo: { lat0: 43, lon0: 41, east: 'X', north: 'Y', up: 'Alt' } }));
    expect(geoOfHints(acmiLike, { x: 'X', y: 'Y', z: 'Alt' })).toEqual({ lat0: 43, lon0: 41, projection: 'tangent-plane' });
    // Other columns, no hint, a broken hint or another projection: none.
    expect(geoOfHints(hints, { x: 'dcs_x', y: 'y', z: 'z' })).toBeNull();
    expect(geoOfHints(parseHints('{"columns":{}}'), { x: 'x', y: 'y', z: 'z' })).toBeNull();
    expect(geoOfHints(parseHints('{"geo":{"lat0":"42","lon0":42,"east":"x","north":"z","up":"y"}}'), { x: 'x', y: 'y', z: 'z' })).toBeNull();
    expect(geoOfHints(parseHints('{"geo":{"lat0":42,"lon0":42,"projection":"utm","east":"x","north":"z","up":"y"}}'), { x: 'x', y: 'y', z: 'z' })).toBeNull();
  });

  it('is kept across a load only when the north axis agrees too', () => {
    expect(mergeGeo(geo, { ...geo, north: 'z' })).toBeNull();
    expect(mergeGeo({ ...geo, north: 'z' }, { ...geo, north: 'z' })).toEqual({ ...geo, north: 'z' });
  });
});
