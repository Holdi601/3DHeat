import { describe, expect, it } from 'vitest';
import { tangentPlane } from '../data/acmi';
import type { AxisMapping, GeoPlacement, GeoReference } from '../state/types';
import { buildBackdrop, OPENFREEMAP_TILEJSON, type BackdropIo } from './backdrop';
import { GEOM_LINE, GEOM_POLYGON } from './mvt';
import { bytes, commands, feature, layer, str } from './mvtWriter';
import { reproject, samePlacement } from './reproject';
import { csvFields, parseRunways, runwaysIn, OURAIRPORTS_RUNWAYS } from './runways';
import { THEATRES, theatreAt, theatreById, theatreGeo } from './theatres';
import { boxAround, dataOfEastNorth, eastNorthOf, planeForward, planeInverse } from './tiles';
import { DCS_PROJECTIONS, fromDcs, toDcs } from './dcsProjection';
import { renderSet, selectTiles, MAX_ZOOM, ROOT_ZOOM } from './stream';
import { orthoFor } from './tileBuild';
import { geoOfHints, parseHints } from '../data/automap';

const ACMI_AXES: AxisMapping = { up: 'z', flipX: false, flipY: true, flipZ: false, scale: 1 };
const WATCHER_AXES: AxisMapping = { up: 'y', flipX: false, flipY: false, flipZ: true, scale: 1 };

/**
 * Flat ground at 100 m everywhere, the sea in every vector tile's top half,
 * one motorway across it, and one runway in the list.
 */
function fakeIo(urls: string[] = []): BackdropIo {
  const tile = new Uint8Array([
    ...bytes(3, layer('water', [feature(1, GEOM_POLYGON, [0, 0], commands([[0, 0, 4096, 0, 4096, 2048, 0, 2048]], true))], ['class'], [str(1, 'ocean')])),
    ...bytes(3, layer('transportation', [feature(2, GEOM_LINE, [0, 0], commands([[0, 3000, 4096, 3000]], false))], ['class'], [str(1, 'motorway')])),
  ]);
  const runways = [
    '"id","airport_ref","airport_ident","length_ft","width_ft","surface","lighted","closed","le_ident","le_latitude_deg","le_longitude_deg","le_elevation_ft","le_heading_degT","le_displaced_threshold_ft","he_ident","he_latitude_deg","he_longitude_deg","he_elevation_ft","he_heading_degT","he_displaced_threshold_ft"',
    '1,1,"UGKO",8200,148,"ASP",1,0,"07",42.17,42.46,,70,,"25",42.18,42.50,,250,',
  ].join('\n');
  return {
    async fetch(url) {
      urls.push(url);
      if (url === OPENFREEMAP_TILEJSON) {
        return { bytes: new TextEncoder().encode(JSON.stringify({ tiles: ['https://tiles.example/v1/{z}/{x}/{y}.pbf'] })).buffer as ArrayBuffer, cached: false };
      }
      if (url === OURAIRPORTS_RUNWAYS) return { bytes: new TextEncoder().encode(runways).buffer as ArrayBuffer, cached: false };
      if (url.endsWith('.pbf')) return { bytes: tile.slice().buffer, cached: true };
      return { bytes: new ArrayBuffer(8), cached: false };
    },
    async decodePng() {
      const rgba = new Uint8ClampedArray(256 * 256 * 4);
      const v = 100 + 32768;
      for (let i = 0; i < 256 * 256; i++) rgba.set([Math.floor(v / 256), v % 256, 0, 255], i * 4);
      return { width: 256, height: 256, rgba };
    },
    progress() {},
  };
}

describe('theatres', () => {
  it('know their boxes, origins and detailed areas', () => {
    expect(THEATRES.filter((t) => t.game === 'dcs')).toHaveLength(14);
    for (const t of THEATRES) {
      expect(t.box.south).toBeLessThan(t.box.north);
      expect(t.box.west).toBeLessThan(t.box.east);
      for (const p of [t.origin, t.detail]) {
        expect(p.lat).toBeGreaterThanOrEqual(t.box.south);
        expect(p.lat).toBeLessThanOrEqual(t.box.north);
        expect(p.lon).toBeGreaterThanOrEqual(t.box.west);
        expect(p.lon).toBeLessThanOrEqual(t.box.east);
      }
      // Whole degrees, so the Watcher's DCS tables can name the same point.
      expect(Number.isInteger(t.origin.lat) && Number.isInteger(t.origin.lon)).toBe(true);
    }
    expect(theatreGeo(theatreById('Caucasus')!)).toEqual({ lat0: 42, lon0: 42, projection: 'tangent-plane' });
    // Batumi is in the Caucasus; the smallest box wins where boxes overlap.
    expect(theatreAt(41.6, 41.6)?.id).toBe('Caucasus');
    expect(theatreAt(50.3, 2.8)?.id).toBe('il2-arras');
    expect(theatreAt(0, 0)).toBeUndefined();
  });
});

describe('a theatre backdrop', () => {
  const caucasus = theatreById('Caucasus')!;
  // A small theatre round Kutaisi, to keep the test quick.
  const context = boxAround(42.2, 42.5, 120);
  const box = boxAround(42.17, 42.48, 12);

  it('builds coarse terrain round a detailed area, with a hole where the detail is', async () => {
    const urls: string[] = [];
    const r = await buildBackdrop({ geo: theatreGeo(caucasus), axes: ACMI_AXES, context, box, runways: true }, fakeIo(urls));
    const s = r.stats;
    expect(s.context).not.toBeNull();
    expect(s.context!.terrainZoom).toBeLessThan(s.terrainZoom);
    expect(s.context!.terrainSpacing).toBeGreaterThan(s.terrainSpacing * 3);
    // The detailed box grew to whole coarse cells, so it holds the one asked for.
    expect(s.box.south).toBeLessThanOrEqual(box.south);
    expect(s.box.north).toBeGreaterThanOrEqual(box.north);
    expect(s.box.west).toBeLessThanOrEqual(box.west);
    expect(s.box.east).toBeGreaterThanOrEqual(box.east);
    // The mesh spans the theatre: 120 km across.
    const m = r.mesh;
    expect(m.bounds.maxX - m.bounds.minX).toBeGreaterThan(115_000);
    expect(m.bounds.maxZ - m.bounds.minZ).toBeGreaterThan(115_000);
    // No coarse ground triangle lies inside the detailed area: every ground
    // triangle whose middle is inside it is a fine one (a few hundred metres at most).
    const fwd = tangentPlane(42, 42);
    const [w, sN] = fwd(s.box.south, s.box.west);
    const [e, nN] = fwd(s.box.north, s.box.east);
    let inside = 0;
    for (let i = 0; i < m.indices.length; i += 3) {
      const v = [m.indices[i], m.indices[i + 1], m.indices[i + 2]].map((k) => [m.vertices[k * 6], -m.vertices[k * 6 + 2]]);
      const cx = (v[0][0] + v[1][0] + v[2][0]) / 3;
      const cy = (v[0][1] + v[1][1] + v[2][1]) / 3;
      if (cx < w + 50 || cx > e - 50 || cy < sN + 50 || cy > nN - 50) continue;
      inside++;
      const span = Math.max(...v.map((a) => Math.hypot(a[0] - v[0][0], a[1] - v[0][1])));
      expect(span).toBeLessThan(800);
    }
    expect(inside).toBeGreaterThan(100);
    // Flat ground at 100 m on both levels, so the wall between them is flat too.
    expect(m.groundBand.minY).toBeCloseTo(100, 0);
    expect(m.groundBand.maxY).toBeCloseTo(100, 0);
    // The sea painted on the ground of both layers (it is the terrain, not a
    // sheet: see SEA_FLOOR), a motorway, and the surveyed runway.
    let painted = 0;
    for (let i = 0; i < m.colours.length; i += 3) if (Math.abs(m.colours[i] - 0.55) < 1e-6 && Math.abs(m.colours[i + 2] - 0.8) < 1e-6) painted++;
    expect(painted).toBeGreaterThan(1000);
    expect(m.waterIndices.length).toBe(0);
    expect(s.roads).toBeGreaterThan(0);
    expect(s.runways).toBe(1);
    expect(r.credits).toEqual(['openfreemap', 'terrarium', 'ourairports']);
    expect(urls).toContain(OURAIRPORTS_RUNWAYS);
  });

  it('builds the whole theatre coarsely when no area is picked', async () => {
    const r = await buildBackdrop({ geo: theatreGeo(caucasus), axes: ACMI_AXES, context }, fakeIo());
    expect(r.stats.context).not.toBeNull();
    expect(r.stats.vectorZoom).toBeNull();
    expect(r.mesh.indices.length).toBeGreaterThan(0);
    expect(r.mesh.structureIndices.length).toBe(0);
  });

  it('takes only cached map tiles once a build has downloaded its share', async () => {
    const io = fakeIo();
    const inner = io.fetch;
    let asked = 0;
    io.fetch = async (url, mode) => {
      if (!url.endsWith('.pbf')) return inner(url, mode);
      asked++;
      if (mode === 'cache-only') return { bytes: null, cached: false, missing: true };
      return { ...(await inner(url, mode)), cached: false };
    };
    // About 1,300 zoom-14 tiles: more than one build may download.
    const r = await buildBackdrop({ geo: theatreGeo(caucasus), axes: ACMI_AXES, box: boxAround(42.2, 42.5, 65) }, io);
    expect(r.stats.vectorZoom).toBe(14);
    expect(r.stats.vectorTiles).toBeGreaterThan(1000);
    expect(asked).toBe(r.stats.vectorTiles);
    // The allowance, overshot by at most the requests already in flight.
    expect(r.stats.vectorTiles - r.stats.deferred).toBeLessThanOrEqual(1000 + 4);
    expect(r.stats.deferred).toBeGreaterThan(0);
    expect(r.notes.some((n) => n.key === 'heat.world.note.deferred')).toBe(true);
  }, 60_000);
});

describe('moving a backdrop to another plane', () => {
  const at = (lat0: number, lon0: number, north?: 'z'): GeoReference => ({ lat0, lon0, projection: 'tangent-plane', ...(north ? { north } : {}) });

  it('puts it where a build on that plane would have', async () => {
    const box = boxAround(42.2, 42.5, 40);
    const from: GeoPlacement = { geo: at(42, 42), axes: ACMI_AXES };
    const to: GeoPlacement = { geo: at(43, 41, 'z'), axes: WATCHER_AXES };
    const a = await buildBackdrop({ geo: from.geo, axes: from.axes, box }, fakeIo());
    const b = await buildBackdrop({ geo: to.geo, axes: to.axes, box }, fakeIo());
    expect(samePlacement(from, to)).toBe(false);
    expect(samePlacement(from, { geo: { ...from.geo }, axes: { ...ACMI_AXES } })).toBe(true);
    const r = reproject(a.mesh.vertices, [a.mesh.indices], from, to);
    expect(r.vertices.length).toBe(b.mesh.vertices.length);
    let worst = 0;
    for (let i = 0; i < r.vertices.length; i += 6) {
      worst = Math.max(worst, Math.hypot(r.vertices[i] - b.mesh.vertices[i], r.vertices[i + 1] - b.mesh.vertices[i + 1], r.vertices[i + 2] - b.mesh.vertices[i + 2]));
    }
    expect(worst).toBeLessThan(0.5);
    // Both worlds are mirrored the same way, so the triangles keep their winding.
    expect(r.indices[0]).toBe(a.mesh.indices);
    // Normals still point up.
    for (let i = 0; i < Math.min(r.vertices.length, 6000); i += 6) expect(r.vertices[i + 4]).toBeGreaterThan(0.99);
    expect(r.band(100, 100)).toEqual({ lowY: 100, highY: 100 });
  });

  it('reads the frame of either kind of table', () => {
    const watcher = at(42, 42, 'z');
    expect(eastNorthOf(watcher, { x: 1, y: 2, z: 3 })).toEqual([1, 3]);
    expect(dataOfEastNorth(watcher, 1, 3, 2)).toEqual({ x: 1, y: 2, z: 3 });
    expect(eastNorthOf(at(42, 42), { x: 1, y: 2, z: 3 })).toEqual([1, 2]);
  });
});

describe('OurAirports runways', () => {
  it('reads both ends, the width in metres, and skips runways without ends or closed', () => {
    expect(csvFields('1,"a, b","say ""hi""",')).toEqual(['1', 'a, b', 'say "hi"', '']);
    const text = [
      '"id","airport_ref","airport_ident","length_ft","width_ft","surface","lighted","closed","le_ident","le_latitude_deg","le_longitude_deg","le_elevation_ft","le_heading_degT","le_displaced_threshold_ft","he_ident","he_latitude_deg","he_longitude_deg","he_elevation_ft","he_heading_degT","he_displaced_threshold_ft"',
      '1,1,"AAAA",8000,150,"ASP",1,0,"09",42.0,42.0,,90,,"27",42.0,42.1,,270,',
      '2,2,"BBBB",3000,,"GRS",0,0,"N",,,,,,"S",,,,,',
      '3,3,"CCCC",3000,100,"ASP",0,1,"18",43.0,42.0,,180,,"36",42.9,42.0,,0,',
      '',
    ].join('\r\n');
    const r = parseRunways(text);
    expect(r).toHaveLength(1);
    expect(r[0].airport).toBe('AAAA');
    expect(r[0].width).toBeCloseTo(45.72, 2);
    expect(r[0].le).toEqual([42, 42]);
    expect(runwaysIn(r, boxAround(42, 42.05, 20))).toHaveLength(1);
    expect(runwaysIn(r, boxAround(45, 45, 20))).toHaveLength(0);
  });
});

describe('DCS World metres', () => {
  const caucasus = DCS_PROJECTIONS.Caucasus;

  it('match the DCS terrain converter (Krueger series, pydcs constants)', () => {
    // Batumi's runway end, and a point near Caen, as the converter computes them.
    const b = toDcs(caucasus, 41.616199, 41.590199);
    expect(b.x).toBeCloseTo(-355160.8377620084, 3);
    expect(b.z).toBeCloseTo(616475.09653491, 3);
    const c = toDcs(DCS_PROJECTIONS.Normandy, 49.18, -0.37);
    expect(c.x).toBeCloseTo(-34017.18395920191, 3);
    expect(c.z).toBeCloseTo(-3865.0361128993973, 3);
    const [lat, lon] = fromDcs(caucasus, -300000, 600000);
    expect(lat).toBeCloseTo(42.12220681563146, 9);
    expect(lon).toBeCloseTo(41.45963542079596, 9);
    const [la2, lo2] = fromDcs(caucasus, b.x, b.z);
    expect(la2).toBeCloseTo(41.616199, 9);
    expect(lo2).toBeCloseTo(41.590199, 9);
  });

  const DCS_GEO: GeoReference = { lat0: 42, lon0: 42, projection: 'dcs-tm', theatre: 'Caucasus' };

  it('are a frame the backdrop is built in, north as x and east as z', async () => {
    expect(planeForward(DCS_GEO)(41.616199, 41.590199)[0]).toBeCloseTo(616475.0965, 3);
    expect(planeInverse(DCS_GEO)(616475.09653491, -355160.8377620084)[0]).toBeCloseTo(41.616199, 9);
    const axes: AxisMapping = { up: 'y', flipX: false, flipY: false, flipZ: false, scale: 1 };
    const r = await buildBackdrop({ geo: DCS_GEO, axes, box: boxAround(41.61, 41.6, 6) }, fakeIo());
    const m = r.mesh;
    // World x is DCS x (north), world z is DCS z (east): Batumi lies inside.
    expect(m.bounds.minX).toBeLessThan(-355160);
    expect(m.bounds.maxX).toBeGreaterThan(-355160);
    expect(m.bounds.minZ).toBeLessThan(616475);
    expect(m.bounds.maxZ).toBeGreaterThan(616475);
    expect(m.bounds.maxX - m.bounds.minX).toBeGreaterThan(5500);
    // A little over 6 km: DCS's grid north is turned 5.7 degrees from true north here.
    expect(m.bounds.maxX - m.bounds.minX).toBeLessThan(7000);
    // Ground faces up in DCS's frame too.
    expect(m.vertices[4]).toBeGreaterThan(0.99);
  });

  it('come from a Watcher table whose load took the DCS columns', () => {
    const hints = parseHints(
      JSON.stringify({
        geo: { lat0: 42, lon0: 42, projection: 'tangent-plane', east: 'x', north: 'z', up: 'y', dcs: { theatre: 'Caucasus', x: 'dcs_x', y: 'dcs_y', z: 'dcs_z' } },
      }),
    );
    expect(geoOfHints(hints, { x: 'dcs_x', y: 'dcs_y', z: 'dcs_z' })).toEqual(DCS_GEO);
    expect(geoOfHints(hints, { x: 'x', y: 'y', z: 'z' })).toEqual({ lat0: 42, lon0: 42, projection: 'tangent-plane', north: 'z' });
    const unknown = parseHints(JSON.stringify({ geo: { lat0: 42, lon0: 42, east: 'x', north: 'z', up: 'y', dcs: { theatre: 'Nowhere', x: 'dcs_x', y: 'dcs_y', z: 'dcs_z' } } }));
    expect(geoOfHints(unknown, { x: 'dcs_x', y: 'dcs_y', z: 'dcs_z' })).toBeNull();
  });

  it('take a backdrop moved from a tangent plane to where a DCS build puts it', async () => {
    const box = boxAround(41.61, 41.6, 8);
    const from: GeoPlacement = { geo: { lat0: 42, lon0: 41, projection: 'tangent-plane' }, axes: ACMI_AXES };
    const to: GeoPlacement = { geo: DCS_GEO, axes: { up: 'y', flipX: false, flipY: false, flipZ: false, scale: 1 } };
    const a = await buildBackdrop({ geo: from.geo, axes: from.axes, box }, fakeIo());
    const b = await buildBackdrop({ geo: to.geo, axes: to.axes, box }, fakeIo());
    const r = reproject(a.mesh.vertices, [a.mesh.indices], from, to);
    let worst = 0;
    for (let i = 0; i < r.vertices.length; i += 6) {
      worst = Math.max(worst, Math.hypot(r.vertices[i] - b.mesh.vertices[i], r.vertices[i + 1] - b.mesh.vertices[i + 1], r.vertices[i + 2] - b.mesh.vertices[i + 2]));
    }
    // Float32 at six hundred kilometres from DCS's origin: a few centimetres.
    expect(worst).toBeLessThan(0.5);
  });
});

describe('streaming round the camera', () => {
  it('splits tiles near the camera down to the deepest zoom, and keeps far ones coarse', () => {
    // 500 m above Batumi.
    const low = selectTiles(41.61, 41.6, 500);
    const deepest = Math.max(...low.nodes.map((t) => t.z));
    expect(deepest).toBe(MAX_ZOOM);
    expect(low.nodes[0].z).toBe(ROOT_ZOOM);
    // Coarse first: zooms never go down along the list.
    for (let i = 1; i < low.nodes.length; i++) expect(low.nodes[i].z).toBeGreaterThanOrEqual(low.nodes[i - 1].z);
    // 40 km up: no tile finer than zoom 11 is wanted.
    const high = selectTiles(41.61, 41.6, 40_000);
    expect(Math.max(...high.nodes.map((t) => t.z))).toBeLessThanOrEqual(11);
    expect(high.nodes.length).toBeLessThan(low.nodes.length);
    // Not bound to a theatre: the roots reach 1,500 km.
    expect(low.nodes.filter((t) => t.z === ROOT_ZOOM).length).toBeGreaterThanOrEqual(9);
    expect(low.nodes.length).toBeLessThan(800);
  });

  it('draws a split tile in place of its children until all four are built', () => {
    const root = { z: 5, x: 20, y: 11 };
    const split = new Set(['5/20/11']);
    const kids = ['6/40/22', '6/41/22', '6/40/23', '6/41/23'];
    const built = new Set(['5/20/11', '6/40/22']);
    expect(renderSet([root], split, (k) => built.has(k))).toEqual(['5/20/11']);
    for (const k of kids) built.add(k);
    expect(renderSet([root], split, (k) => built.has(k)).sort()).toEqual([...kids].sort());
    // Neither the tile nor all its children: what there is.
    built.delete('5/20/11');
    built.delete('6/41/23');
    expect(renderSet([root], split, (k) => built.has(k)).sort()).toEqual(['6/40/22', '6/40/23', '6/41/22']);
  });
});

describe('national orthophotos', () => {
  const around = (lat: number, lon: number) => ({ south: lat - 0.01, north: lat + 0.01, west: lon - 0.01, east: lon + 0.01 });
  it('are used only for a tile wholly inside the country that publishes them', () => {
    expect(orthoFor(around(36.236, -115.034))?.id).toBe('usgs'); // Nellis
    expect(orthoFor(around(49.176, -0.456))?.id).toBe('ign'); // Carpiquet
    expect(orthoFor(around(51.13, 1.3))).toBeNull(); // Dover, across the Channel
    expect(orthoFor(around(41.61, 41.6))).toBeNull(); // Batumi
    expect(orthoFor({ south: 48, north: 52, west: -2, east: 3 })).toBeNull(); // a tile reaching into England
  });
});
