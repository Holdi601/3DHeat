import { describe, expect, it } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import { FIT_EPOCH, geoFormatOf, geoHints, geoTable, kmzText, parseFit, parseGpx, parseIgc, parseKml, parseNmea, readGeoTracks } from './geoTracks';
import { ingestGeo } from './ingestGeo';
import { applyHints, type MappingHints } from './automap';
import { detectFormat } from './sourcePreview';
import { emptyColumnMapping } from '../state/types';

const GPX = `<?xml version="1.0"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <wpt lat="47.001" lon="8.001"><ele>500</ele><name>Start &amp; finish</name></wpt>
  <trk><name>Morning ride</name>
    <trkseg>
      <trkpt lat="47.0000" lon="8.0000"><ele>500</ele><time>2026-05-01T10:00:00Z</time>
        <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>120</gpxtpx:hr><gpxtpx:cad>80</gpxtpx:cad></gpxtpx:TrackPointExtension></extensions></trkpt>
      <trkpt lat="47.0010" lon="8.0000"><ele>505</ele><time>2026-05-01T10:00:10Z</time>
        <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>125</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions></trkpt>
      <trkpt lat='47.0020' lon='8.0000'><ele>510</ele><time>2026-05-01T10:00:20Z</time></trkpt>
    </trkseg>
  </trk>
  <rte><name>Plan</name><rtept lat="47.0" lon="8.01"/><rtept lat="47.01" lon="8.01"/></rte>
</gpx>`;

const KML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
<Document><name>Doc</name>
  <Placemark><name>Flight</name>
    <gx:Track>
      <when>2026-05-01T10:00:00Z</when><when>2026-05-01T10:00:05Z</when>
      <gx:coord>8.0 47.0 1000</gx:coord><gx:coord>8.001 47.0 1010</gx:coord>
    </gx:Track>
  </Placemark>
  <Placemark><name><![CDATA[Route <A>]]></name><LineString><coordinates>8.0,47.0,0 8.0,47.01,0
    8.0,47.02,0</coordinates></LineString></Placemark>
  <Placemark><name>Tower</name><Point><coordinates>8.002,47.002,450</coordinates></Point></Placemark>
</Document></kml>`;

/** An NMEA sentence with its checksum. */
function nmea(body: string): string {
  let c = 0;
  for (const ch of body) c ^= ch.charCodeAt(0);
  return `$${body}*${c.toString(16).toUpperCase().padStart(2, '0')}`;
}

const NMEA = [
  nmea('GPRMC,235959.00,A,4700.000,N,00800.000,E,10.0,90.0,010526,,,A'),
  nmea('GPGGA,235959.00,4700.000,N,00800.000,E,1,08,0.9,500.0,M,47.0,M,,'),
  nmea('GNRMC,000001.00,A,4700.000,N,00800.010,E,10.0,90.0,020526,,,A'),
  nmea('GNGGA,000001.00,4700.000,N,00800.010,E,1,09,0.8,501.0,M,47.0,M,,'),
  '$GPGGA,000002.00,4700.000,N,00800.020,E,1,09,0.8,502.0,M,47.0,M,,*00',
  nmea('GPGSV,3,1,11,03,03,111,00,04,15,270,00,06,01,010,00,13,06,292,00'),
].join('\r\n');

const IGC = [
  'AXXXABC',
  'HFDTE010526',
  'HFPLTPILOTINCHARGE: Jane Doe',
  'HFGTYGLIDERTYPE: ASK 21',
  'B2359594700000N00800000EA0050000510',
  'B0000014700100N00800000EA0050500515',
].join('\n');

/** A FIT file of record messages: a definition, two full records and one with a compressed timestamp. */
function fit(): Uint8Array {
  const bytes: number[] = [];
  const u8 = (v: number) => bytes.push(v & 0xff);
  const u16 = (v: number) => (u8(v), u8(v >> 8));
  const u32 = (v: number) => (u16(v & 0xffff), u16((v >>> 16) & 0xffff));
  const semi = (deg: number) => Math.round((deg / 180) * 2 ** 31) >>> 0;
  // Definition, local 0: record (20): timestamp, lat, lon, altitude, heart rate, speed.
  u8(0x40);
  u8(0);
  u8(0);
  u16(20);
  u8(6);
  for (const [n, s, t] of [[253, 4, 0x86], [0, 4, 0x85], [1, 4, 0x85], [2, 2, 0x84], [3, 1, 0x02], [6, 2, 0x84]]) (u8(n), u8(s), u8(t));
  const ts = Date.UTC(2026, 4, 1, 10) / 1000 - FIT_EPOCH;
  const rec = (time: number, lat: number, hr: number) => {
    u32(time);
    u32(semi(lat));
    u32(semi(8));
    u16((500 + 500) * 5);
    u8(hr);
    u16(5000);
  };
  u8(0x00);
  rec(ts, 47, 130);
  u8(0x00);
  rec(ts + 1, 47.0001, 131);
  // Definition, local 1: record without its own timestamp, for the compressed header.
  u8(0x41);
  u8(0);
  u8(0);
  u16(20);
  u8(3);
  for (const [n, s, t] of [[0, 4, 0x85], [1, 4, 0x85], [3, 1, 0x02]]) (u8(n), u8(s), u8(t));
  // Compressed timestamp header: local 1, low five bits of ts + 3.
  u8(0x80 | (1 << 5) | ((ts + 3) & 0x1f));
  u32(semi(47.0003));
  u32(semi(8));
  u8(0xff);
  const head = [14, 0x20, 0x08, 0x08, ...[0, 0, 0, 0], 0x2e, 0x46, 0x49, 0x54, 0, 0];
  const size = bytes.length;
  head[4] = size & 0xff;
  head[5] = (size >> 8) & 0xff;
  return Uint8Array.from([...head, ...bytes, 0, 0]);
}

/** A zip of one stored-deflated file. */
function zip(name: string, text: string): Uint8Array<ArrayBuffer> {
  const data = deflateRawSync(Buffer.from(text, 'utf8'));
  const nameB = Buffer.from(name, 'utf8');
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(text.length, 22);
  local.writeUInt16LE(nameB.length, 26);
  const cd = Buffer.alloc(46);
  cd.writeUInt32LE(0x02014b50, 0);
  cd.writeUInt16LE(8, 10);
  cd.writeUInt32LE(data.length, 20);
  cd.writeUInt32LE(text.length, 24);
  cd.writeUInt16LE(nameB.length, 28);
  cd.writeUInt32LE(0, 42);
  const cdAt = 30 + nameB.length + data.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(46 + nameB.length, 12);
  end.writeUInt32LE(cdAt, 16);
  return new Uint8Array(Buffer.concat([local, nameB, data, cd, nameB, end]));
}

describe('GPS track formats', () => {
  it('knows the formats by name', () => {
    expect(geoFormatOf('ride.GPX')).toBe('gpx');
    expect(geoFormatOf('log.nma')).toBe('nmea');
    expect(geoFormatOf('a.csv')).toBeNull();
    expect(detectFormat('flight.igc')).toBe('geo');
    expect(detectFormat('run.fit')).toBe('geo');
  });

  it('reads GPX tracks, routes, waypoints and device values', () => {
    const t = parseGpx(GPX);
    expect(t.map((x) => x.name)).toEqual(['Morning ride', 'Plan', 'Start & finish']);
    const ride = t[0];
    expect(ride.points).toHaveLength(3);
    expect(ride.points[1]).toMatchObject({ lat: 47.001, lon: 8, alt: 505, t: Date.UTC(2026, 4, 1, 10, 0, 10) / 1000 });
    expect(ride.points[0].extra).toEqual({ HeartRate: 120, Cadence: 80 });
    expect(t[1].points.every((p) => Number.isNaN(p.t))).toBe(true);
    expect(t[2]).toMatchObject({ fixed: true, label: 'Start & finish' });
  });

  it('reads KML tracks, lines and points', () => {
    const t = parseKml(KML);
    expect(t.map((x) => x.name)).toEqual(['Flight', 'Route <A>', 'Tower']);
    expect(t[0].points[1]).toMatchObject({ lat: 47, lon: 8.001, alt: 1010, t: Date.UTC(2026, 4, 1, 10, 0, 5) / 1000 });
    expect(t[1].points).toHaveLength(3);
    expect(t[2]).toMatchObject({ fixed: true });
  });

  it('reads KML out of a KMZ', async () => {
    expect(await kmzText(zip('doc.kml', KML))).toBe(KML);
    const tracks = await readGeoTracks(new Blob([zip('files/doc.kml', KML).slice()]), 'trip.kmz');
    expect(tracks).toHaveLength(3);
  });

  it('reads NMEA, joining RMC and GGA, across midnight, skipping bad checksums', () => {
    const [tr] = parseNmea(NMEA);
    expect(tr.points).toHaveLength(2);
    const day = Date.UTC(2026, 4, 1) / 1000;
    expect(tr.points[0]).toMatchObject({ t: day + 86399, lat: 47, lon: 8, alt: 500, course: 90 });
    expect(tr.points[0].speed).toBeCloseTo(5.144, 3);
    expect(tr.points[1].t).toBe(day + 86401);
    expect(tr.points[1].lon).toBeCloseTo(8 + 0.01 / 60, 9);
    expect(tr.points[1].extra).toEqual({ Satellites: 9, HDOP: 0.8 });
  });

  it('reads IGC B records with the date, pilot and glider', () => {
    const [tr] = parseIgc(IGC);
    expect(tr.name).toBe('Jane Doe · ASK 21');
    expect(tr.points[0]).toMatchObject({ t: Date.UTC(2026, 4, 1, 23, 59, 59) / 1000, lat: 47, lon: 8, alt: 510 });
    expect(tr.points[1].t).toBe(Date.UTC(2026, 4, 2, 0, 0, 1) / 1000);
    expect(tr.points[1].lat).toBeCloseTo(47 + 0.1 / 60, 9);
  });

  it('reads FIT records, compressed timestamps included', () => {
    const [tr] = parseFit(fit());
    const t0 = Date.UTC(2026, 4, 1, 10) / 1000;
    expect(tr.points).toHaveLength(3);
    expect(tr.points[0].t).toBe(t0);
    expect(tr.points[0].lat).toBeCloseTo(47, 6);
    expect(tr.points[0].alt).toBeCloseTo(500, 6);
    expect(tr.points[0].speed).toBeCloseTo(5, 6);
    expect(tr.points[1].extra).toEqual({ HeartRate: 131 });
    expect(tr.points[2].t).toBe(t0 + 3);
    expect(tr.points[2].extra).toBeUndefined();
    expect(() => parseFit(new Uint8Array(20))).toThrow();
  });

  it('makes one table of the tracks, placed on the earth', () => {
    const t = geoTable(parseGpx(GPX), 'ride');
    expect(t.absolute).toBe(true);
    expect(t.columns).toContain('HeartRate');
    const time = t.data[0] as Float64Array;
    for (let i = 1; i < t.rows; i++) expect(time[i]).toBeGreaterThanOrEqual(time[i - 1]);
    // The ride heads north: heading 0, about 11 m/s.
    const track = t.data[t.columns.indexOf('Track')] as string[];
    const i = track.indexOf('Morning ride');
    expect((t.data[t.columns.indexOf('Heading')] as Float64Array)[i]).toBeCloseTo(0, 3);
    expect((t.data[t.columns.indexOf('Speed')] as Float64Array)[i]).toBeCloseTo(11.1, 0);
    // The waypoint stands from the first moment to the last, named as an event.
    expect(track.filter((x) => x === 'Start & finish')).toHaveLength(2);
    expect((t.data[t.columns.indexOf('Event')] as string[]).includes('Waypoint: Start & finish')).toBe(true);
  });

  it('loads into a block with a place on the earth', async () => {
    const file = new File([GPX], 'ride.gpx');
    const t = geoTable(parseGpx(GPX), 'ride');
    const mapping = applyHints(emptyColumnMapping(), geoHints(t) as MappingHints, t.columns, t.numeric);
    const block = await ingestGeo(file, mapping, () => {});
    expect(block.geo?.projection).toBe('tangent-plane');
    expect(block.timeIsAbsolute).toBe(true);
    expect(block.personLabels).toContain('Morning ride');
    // Altitude up, north is -z.
    expect(Math.max(...block.py)).toBe(510);
  });
});
