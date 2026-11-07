import { describe, expect, it } from 'vitest';
import { decodeGeometry, decodeTile, GEOM_LINE, GEOM_POINT, GEOM_POLYGON, polygonsOf } from './mvt';
import { bytes, commands, double, feature, float, key, layer, str, uint, varint, zigzag } from './mvtWriter';


describe('vector tiles', () => {
  // A building with a courtyard, clockwise outside and anticlockwise hole
  // (on screen, y down), a road, and a point with one value of each kind.
  const outer = [100, 100, 900, 100, 900, 900, 100, 900];
  const hole = [300, 300, 300, 700, 700, 700, 700, 300];
  const road = [0, 2048, 1000, 2000, 4096, 2100];
  const tile = new Uint8Array([
    ...bytes(
      3,
      layer(
        'building',
        [feature(7, GEOM_POLYGON, [0, 0, 1, 1], commands([outer, hole], true))],
        ['render_height', 'render_min_height'],
        [double(3, 12.5), uint(5, 3)],
      ),
    ),
    ...bytes(
      3,
      layer('transportation', [feature(8, GEOM_LINE, [0, 0, 1, 1], commands([road], false))], ['class', 'brunnel'], [str(1, 'primary'), str(1, 'bridge')], 512),
    ),
    ...bytes(
      3,
      layer(
        'poi',
        [feature(9, GEOM_POINT, [0, 0, 1, 1, 2, 2, 3, 3], commands([[10, 20]], false))],
        ['a', 'b', 'c', 'd'],
        [float(2, 1.5), [...key(6, 0), ...varint(zigzag(-42))], [...key(7, 0), 1], [...key(4, 0), 0xfb, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01]],
      ),
    ),
  ]);

  const layers = decodeTile(tile);

  it('reads layers, extents, ids and properties of every value kind', () => {
    expect([...layers.keys()]).toEqual(['building', 'transportation', 'poi']);
    expect(layers.get('transportation')!.extent).toBe(512);
    const b = layers.get('building')!.features[0];
    expect(b.id).toBe(7);
    expect(b.type).toBe(GEOM_POLYGON);
    expect(b.props).toEqual({ render_height: 12.5, render_min_height: 3 });
    expect(layers.get('transportation')!.features[0].props).toEqual({ class: 'primary', brunnel: 'bridge' });
    expect(layers.get('poi')!.features[0].props).toEqual({ a: 1.5, b: -42, c: true, d: -5 });
  });

  it('decodes geometry commands back into the parts drawn', () => {
    expect(layers.get('building')!.features[0].parts).toEqual([outer, hole]);
    expect(layers.get('transportation')!.features[0].parts).toEqual([road]);
    expect(layers.get('poi')!.features[0].parts).toEqual([[10, 20]]);
    // Several points in one MoveTo.
    expect(decodeGeometry([(1 & 7) | (2 << 3), zigzag(5), zigzag(5), zigzag(-2), zigzag(3)])).toEqual([[5, 5], [3, 8]]);
  });

  it('groups rings into polygons by their winding', () => {
    const polys = polygonsOf(layers.get('building')!.features[0].parts);
    expect(polys).toHaveLength(1);
    expect(polys[0].outer).toEqual(outer);
    expect(polys[0].holes).toEqual([hole]);
    // A second outer ring starts a second polygon.
    const two = polygonsOf([outer, hole, [1000, 1000, 1100, 1000, 1100, 1100]]);
    expect(two).toHaveLength(2);
    expect(two[1].holes).toEqual([]);
  });
});
