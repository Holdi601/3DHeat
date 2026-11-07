import { describe, expect, it } from 'vitest';
import { acmiHints, parseAcmi } from './acmi';
import { applyHints, type MappingHints } from './automap';
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
});
