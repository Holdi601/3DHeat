/**
 * GPS tracks from the formats devices and maps write - GPX, KML and KMZ,
 * NMEA 0183 sentences, IGC flight logs and Garmin FIT activity files - read
 * into one table the viewer loads like a Tacview recording: each fix a row,
 * placed by latitude and longitude on the plane touching the earth at the
 * tracks' middle (`tangentPlane`), so the world backdrop lines up under them.
 *
 * Each reader is small and only reads what places a track in space and
 * time, and the values devices log beside it (heart rate, cadence, power,
 * temperature, speed). A track without times (a planned route, a KML line)
 * gets one second a point; a waypoint or a placemark without time stands
 * where it is for the whole recording.
 *
 * Columns: Time (Unix seconds, or seconds for untimed tracks), X east and Y
 * north (metres), Altitude, Track, Source, Latitude, Longitude, Heading
 * and Pitch (from the track's own course where recorded, else from fix to
 * fix), Speed (m/s, likewise), Event (a waypoint's name), then whatever the
 * file logs: HeartRate, Cadence, Power, Temperature, Satellites, HDOP,
 * PressureAltitude.
 */

import { tangentPlane } from './acmi';
import { isZip, zipEntries } from './zip';

export type GeoFormat = 'gpx' | 'kml' | 'kmz' | 'nmea' | 'igc' | 'fit';

/** One fix. Time is Unix seconds, NaN when the file has none. */
export interface GeoPoint {
  t: number;
  lat: number;
  lon: number;
  /** Metres above sea level; NaN when unknown. */
  alt: number;
  speed?: number;
  course?: number;
  extra?: Record<string, number>;
}

export interface GeoTrack {
  name: string;
  points: GeoPoint[];
  /** A place rather than a path: stands for the whole recording. */
  fixed?: boolean;
  /** A waypoint's name, as the event at its place. */
  label?: string;
}

/** The format of a file by its name; null when it is none of these. */
export function geoFormatOf(name: string): GeoFormat | null {
  const m = /\.(gpx|kml|kmz|nmea|nma|igc|fit)$/i.exec(name);
  if (!m) return null;
  const e = m[1].toLowerCase();
  return e === 'nma' ? 'nmea' : (e as GeoFormat);
}

// ---------------------------------------------------------------- XML, simply

/** The elements `tag` (any namespace prefix) in `xml`, each its attributes and inner text. */
function elements(xml: string, tag: string): { attrs: string; body: string }[] {
  const out: { attrs: string; body: string }[] = [];
  const re = new RegExp(`<(?:[\\w-]+:)?${tag}(\\s[^>]*?)?(\\/>|>([\\s\\S]*?)<\\/(?:[\\w-]+:)?${tag}\\s*>)`, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push({ attrs: m[1] ?? '', body: m[3] ?? '' });
  return out;
}

/** The text of the first `tag` in `xml`, entities and CDATA undone; '' when there is none. */
function text(xml: string, tag: string): string {
  const e = elements(xml, tag)[0];
  if (!e) return '';
  return e.body
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>|<[^>]+>/g, (_m, cdata?: string) => cdata ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

function attr(attrs: string, name: string): string {
  const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`).exec(attrs);
  return m ? (m[2] ?? m[3] ?? '') : '';
}

const num = (s: string): number => (s.trim() === '' ? NaN : Number(s));
const isoTime = (s: string): number => {
  const ms = Date.parse(s.trim());
  return Number.isFinite(ms) ? ms / 1000 : NaN;
};

// ---------------------------------------------------------------- GPX

/** Device values GPX extensions carry (Garmin's TrackPointExtension and others), by tag. */
const GPX_EXTRA: Record<string, string> = { hr: 'HeartRate', heartrate: 'HeartRate', cad: 'Cadence', cadence: 'Cadence', power: 'Power', watts: 'Power', atemp: 'Temperature', temp: 'Temperature' };

function gpxPoint(e: { attrs: string; body: string }): GeoPoint | null {
  const lat = num(attr(e.attrs, 'lat'));
  const lon = num(attr(e.attrs, 'lon'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const p: GeoPoint = { lat, lon, alt: num(text(e.body, 'ele')), t: isoTime(text(e.body, 'time')) };
  const speed = num(text(e.body, 'speed'));
  if (Number.isFinite(speed)) p.speed = speed;
  const course = num(text(e.body, 'course'));
  if (Number.isFinite(course)) p.course = course;
  const ext = elements(e.body, 'extensions')[0]?.body;
  if (ext) {
    for (const [tag, col] of Object.entries(GPX_EXTRA)) {
      const v = num(text(ext, tag));
      if (Number.isFinite(v)) (p.extra ??= {})[col] ??= v;
    }
  }
  const sat = num(text(e.body, 'sat'));
  if (Number.isFinite(sat)) (p.extra ??= {}).Satellites = sat;
  const hdop = num(text(e.body, 'hdop'));
  if (Number.isFinite(hdop)) (p.extra ??= {}).HDOP = hdop;
  return p;
}

/** GPX 1.0 and 1.1: tracks (each segment of a track one path), routes, waypoints. */
export function parseGpx(xml: string, fallbackName = 'track'): GeoTrack[] {
  const out: GeoTrack[] = [];
  let n = 0;
  for (const trk of elements(xml, 'trk')) {
    const name = text(trk.body.replace(/<trkseg[\s\S]*$/, ''), 'name') || `${fallbackName} ${++n}`;
    const segs = elements(trk.body, 'trkseg');
    segs.forEach((seg, i) => {
      const points = elements(seg.body, 'trkpt').map(gpxPoint).filter((p): p is GeoPoint => !!p);
      if (points.length) out.push({ name: segs.length > 1 ? `${name} (${i + 1})` : name, points });
    });
  }
  for (const rte of elements(xml, 'rte')) {
    const name = text(rte.body.replace(/<rtept[\s\S]*$/, ''), 'name') || `${fallbackName} ${++n}`;
    const points = elements(rte.body, 'rtept').map(gpxPoint).filter((p): p is GeoPoint => !!p);
    if (points.length) out.push({ name, points });
  }
  for (const w of elements(xml, 'wpt')) {
    const p = gpxPoint(w);
    if (!p) continue;
    const name = text(w.body, 'name') || `${fallbackName} ${++n}`;
    out.push({ name, points: [p], fixed: true, label: name });
  }
  return out;
}

// ---------------------------------------------------------------- KML

function kmlCoords(s: string): GeoPoint[] {
  const out: GeoPoint[] = [];
  for (const tuple of s.trim().split(/\s+/)) {
    const [lon, lat, alt] = tuple.split(',').map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lon)) out.push({ lat, lon, alt: Number.isFinite(alt) ? alt : NaN, t: NaN });
  }
  return out;
}

/** KML 2.2: gx:Track (times and places), LineStrings (paths, untimed), Points (places). */
export function parseKml(xml: string, fallbackName = 'track'): GeoTrack[] {
  const out: GeoTrack[] = [];
  let n = 0;
  for (const pm of elements(xml, 'Placemark')) {
    const name = text(pm.body.replace(/<(?:gx:)?(Track|MultiTrack|LineString|Point|MultiGeometry)[\s\S]*$/, ''), 'name') || `${fallbackName} ${++n}`;
    const tracks = elements(pm.body, 'Track');
    if (tracks.length) {
      tracks.forEach((tr, i) => {
        const when = elements(tr.body, 'when').map((w) => isoTime(w.body));
        const coord = elements(tr.body, 'coord').map((c) => c.body.trim().split(/\s+/).map(Number));
        const points: GeoPoint[] = [];
        for (let k = 0; k < coord.length; k++) {
          const [lon, lat, alt] = coord[k];
          if (Number.isFinite(lat) && Number.isFinite(lon)) points.push({ lat, lon, alt: Number.isFinite(alt) ? alt : NaN, t: when[k] ?? NaN });
        }
        if (points.length) out.push({ name: tracks.length > 1 ? `${name} (${i + 1})` : name, points });
      });
      continue;
    }
    const lines = elements(pm.body, 'LineString');
    lines.forEach((l, i) => {
      const points = kmlCoords(text(l.body, 'coordinates'));
      if (points.length) out.push({ name: lines.length > 1 ? `${name} (${i + 1})` : name, points });
    });
    if (lines.length) continue;
    const pt = elements(pm.body, 'Point')[0];
    if (pt) {
      const p = kmlCoords(text(pt.body, 'coordinates'))[0];
      const when = isoTime(text(pm.body, 'when'));
      if (p) out.push({ name, points: [{ ...p, t: when }], fixed: !Number.isFinite(when), label: name });
    }
  }
  return out;
}

/** A KMZ's main document: doc.kml, else its first .kml. */
export async function kmzText(bytes: Uint8Array): Promise<string> {
  if (!isZip(bytes)) return new TextDecoder('utf-8').decode(bytes);
  const entries = zipEntries(bytes).filter((e) => /\.kml$/i.test(e.name));
  const main = entries.find((e) => /(^|\/)doc\.kml$/i.test(e.name)) ?? entries[0];
  if (!main) throw new Error('no KML document in the KMZ');
  return new TextDecoder('utf-8').decode(await main.bytes());
}

// ---------------------------------------------------------------- NMEA 0183

/** ddmm.mmmm with its hemisphere as signed degrees. */
function nmeaAngle(v: string, hemi: string): number {
  if (!v) return NaN;
  const dot = v.indexOf('.');
  const degLen = (dot < 0 ? v.length : dot) - 2;
  const d = Number(v.slice(0, degLen));
  const m = Number(v.slice(degLen));
  const a = d + m / 60;
  return hemi === 'S' || hemi === 'W' ? -a : a;
}

function nmeaChecksumOk(line: string): boolean {
  const star = line.lastIndexOf('*');
  if (star < 0) return true;
  let c = 0;
  for (let i = 1; i < star; i++) c ^= line.charCodeAt(i);
  return c === parseInt(line.slice(star + 1, star + 3), 16);
}

const tod = (s: string): number => (s.length >= 6 ? Number(s.slice(0, 2)) * 3600 + Number(s.slice(2, 4)) * 60 + Number(s.slice(4)) : NaN);

/**
 * NMEA 0183 sentences from any talker (GP, GN, GL...): RMC for place, date,
 * speed and course, GGA for place, height, satellites and HDOP, joined by
 * their time of day. Sentences with a wrong checksum are left out. Without
 * an RMC date the times are seconds of the day.
 */
export function parseNmea(text: string, name = 'track'): GeoTrack[] {
  const byTime = new Map<number, GeoPoint & { tod: number }>();
  const order: number[] = [];
  // The day the running time of day counts from: the first RMC date less the midnights crossed before it.
  let base = NaN;
  let lastTod = -1;
  let dayShift = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const start = line.indexOf('$');
    if (start < 0) continue;
    const s = line.slice(start);
    if (!nmeaChecksumOk(s)) continue;
    const f = s.replace(/\*[0-9A-Fa-f]{2}$/, '').split(',');
    const type = f[0].slice(3);
    if (type !== 'RMC' && type !== 'GGA') continue;
    const time = tod(f[1]);
    if (!Number.isFinite(time)) continue;
    if (type === 'RMC' && f[2] !== 'A') continue;
    if (type === 'GGA' && f[6] === '0') continue;
    if (lastTod >= 0 && time < lastTod - 43200) dayShift += 86400;
    lastTod = time;
    const key = dayShift + time;
    if (type === 'RMC' && !Number.isFinite(base) && f[9]?.length === 6) {
      const dd = f[9];
      const y = 2000 + Number(dd.slice(4, 6));
      base = Date.UTC(y >= 2080 ? y - 100 : y, Number(dd.slice(2, 4)) - 1, Number(dd.slice(0, 2))) / 1000 - dayShift;
    }
    let p = byTime.get(key);
    if (!p) {
      p = { t: NaN, lat: NaN, lon: NaN, alt: NaN, tod: key };
      byTime.set(key, p);
      order.push(key);
    }
    if (type === 'RMC') {
      p.lat = nmeaAngle(f[3], f[4]);
      p.lon = nmeaAngle(f[5], f[6]);
      const kn = num(f[7] ?? '');
      if (Number.isFinite(kn)) p.speed = (kn * 1852) / 3600;
      const crs = num(f[8] ?? '');
      if (Number.isFinite(crs)) p.course = crs;
    } else {
      p.lat = nmeaAngle(f[2], f[3]);
      p.lon = nmeaAngle(f[4], f[5]);
      p.alt = num(f[9] ?? '');
      const sats = num(f[7] ?? '');
      const hdop = num(f[8] ?? '');
      if (Number.isFinite(sats)) (p.extra ??= {}).Satellites = sats;
      if (Number.isFinite(hdop)) (p.extra ??= {}).HDOP = hdop;
    }
  }
  const points: GeoPoint[] = [];
  for (const k of order) {
    const { tod: at, ...p } = byTime.get(k)!;
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) continue;
    // Without any date, the seconds of the day: read as Unix seconds they are the right UTC time on 1970-01-01.
    p.t = (Number.isFinite(base) ? base : 0) + at;
    points.push(p);
  }
  return points.length ? [{ name, points }] : [];
}

// ---------------------------------------------------------------- IGC

/**
 * IGC flight logs (gliders, paragliders): the date (HFDTE), pilot and glider
 * from the header, and every B record's fix - GNSS altitude where the logger
 * has one, else pressure altitude - with the day rolling over at midnight.
 */
export function parseIgc(text: string, name = 'flight'): GeoTrack[] {
  let date = NaN;
  let pilot = '';
  let glider = '';
  let id = '';
  const points: GeoPoint[] = [];
  let lastTod = -1;
  let shift = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('HFDTE')) {
      const m = /(\d{2})(\d{2})(\d{2})/.exec(line.slice(5));
      if (m) date = Date.UTC(2000 + Number(m[3]) - (Number(m[3]) >= 80 ? 100 : 0), Number(m[2]) - 1, Number(m[1])) / 1000;
    } else if (/^HFPLT/i.test(line)) pilot = line.slice(line.indexOf(':') + 1).trim();
    else if (/^HFGTY/i.test(line)) glider = line.slice(line.indexOf(':') + 1).trim();
    else if (/^HFGID/i.test(line)) id = line.slice(line.indexOf(':') + 1).trim();
    else if (line.startsWith('B') && line.length >= 35) {
      const time = tod(line.slice(1, 7));
      const lat = (Number(line.slice(7, 9)) + Number(line.slice(9, 14)) / 60000) * (line[14] === 'S' ? -1 : 1);
      const lon = (Number(line.slice(15, 18)) + Number(line.slice(18, 23)) / 60000) * (line[23] === 'W' ? -1 : 1);
      const pressure = Number(line.slice(25, 30));
      const gnss = Number(line.slice(30, 35));
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(time)) continue;
      if (lastTod >= 0 && time < lastTod - 43200) shift += 86400;
      lastTod = time;
      const p: GeoPoint = { t: (Number.isFinite(date) ? date : 0) + shift + time, lat, lon, alt: gnss || pressure };
      if (Number.isFinite(pressure)) p.extra = { PressureAltitude: pressure };
      points.push(p);
    }
  }
  const who = [pilot, glider || id].filter(Boolean).join(' · ');
  return points.length ? [{ name: who || name, points }] : [];
}

// ---------------------------------------------------------------- FIT

/** Seconds from the Unix epoch to FIT's (1989-12-31T00:00:00Z). */
export const FIT_EPOCH = 631065600;
const SEMI = 180 / 2 ** 31;

interface FitField {
  num: number;
  size: number;
  type: number;
}
interface FitDef {
  global: number;
  little: boolean;
  fields: FitField[];
  devBytes: number;
}

/** The value of one field (its first element), null when invalid. */
function fitValue(dv: DataView, at: number, f: FitField, little: boolean): number | null {
  const base = f.type & 0x1f;
  const read = (size: number): number | null => {
    if (at + size > dv.byteLength || f.size < size) return null;
    switch (base) {
      case 0x01: {
        const v = dv.getInt8(at);
        return v === 0x7f ? null : v;
      }
      case 0x00:
      case 0x02:
      case 0x0a:
      case 0x0d: {
        const v = dv.getUint8(at);
        return v === 0xff || (base === 0x0a && v === 0) ? null : v;
      }
      case 0x03: {
        const v = dv.getInt16(at, little);
        return v === 0x7fff ? null : v;
      }
      case 0x04:
      case 0x0b: {
        const v = dv.getUint16(at, little);
        return v === 0xffff || (base === 0x0b && v === 0) ? null : v;
      }
      case 0x05: {
        const v = dv.getInt32(at, little);
        return v === 0x7fffffff ? null : v;
      }
      case 0x06:
      case 0x0c: {
        const v = dv.getUint32(at, little);
        return v === 0xffffffff || (base === 0x0c && v === 0) ? null : v;
      }
      case 0x08: {
        const v = dv.getFloat32(at, little);
        return Number.isFinite(v) ? v : null;
      }
      case 0x09: {
        const v = dv.getFloat64(at, little);
        return Number.isFinite(v) ? v : null;
      }
      default:
        return null;
    }
  };
  const sizes: Record<number, number> = { 0: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 4, 6: 4, 8: 4, 9: 8, 10: 1, 11: 2, 12: 4, 13: 1 };
  const s = sizes[base];
  return s ? read(s) : null;
}

/**
 * Garmin FIT activity files: every record message (position in semicircles,
 * altitude, speed, heart rate, cadence, power, temperature; the enhanced
 * altitude and speed where written), with compressed timestamps. The
 * checksum is not checked: a file cut short still gives what it holds.
 */
export function parseFit(bytes: Uint8Array, name = 'activity'): GeoTrack[] {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 12) throw new Error('not a FIT file: too short');
  const headerSize = bytes[0];
  if (String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) !== '.FIT') throw new Error('not a FIT file');
  const dataSize = dv.getUint32(4, true);
  const end = Math.min(bytes.length, headerSize + dataSize);
  const defs = new Map<number, FitDef>();
  const points: GeoPoint[] = [];
  let at = headerSize;
  let lastTs = NaN;
  while (at < end) {
    const h = bytes[at++];
    if (h & 0x80) {
      // Compressed timestamp header: the low five bits of the time.
      const local = (h >> 5) & 0x3;
      const offset = h & 0x1f;
      if (Number.isFinite(lastTs)) {
        let ts = (lastTs & ~0x1f) + offset;
        if (offset < (lastTs & 0x1f)) ts += 0x20;
        lastTs = ts;
      }
      const def = defs.get(local);
      if (!def) break;
      at = readData(def, at, lastTs);
      continue;
    }
    const local = h & 0x0f;
    if (h & 0x40) {
      const little = bytes[at + 1] === 0;
      const global = little ? dv.getUint16(at + 2, true) : dv.getUint16(at + 2, false);
      const n = bytes[at + 4];
      at += 5;
      const fields: FitField[] = [];
      for (let i = 0; i < n; i++, at += 3) fields.push({ num: bytes[at], size: bytes[at + 1], type: bytes[at + 2] });
      let devBytes = 0;
      if (h & 0x20) {
        const nd = bytes[at++];
        for (let i = 0; i < nd; i++, at += 3) devBytes += bytes[at + 1];
      }
      defs.set(local, { global, little, fields, devBytes });
      continue;
    }
    const def = defs.get(local);
    if (!def) break;
    at = readData(def, at, NaN);
  }

  function readData(def: FitDef, start: number, ts: number): number {
    let p = start;
    const v = new Map<number, number | null>();
    for (const f of def.fields) {
      v.set(f.num, fitValue(dv, p, f, def.little));
      p += f.size;
    }
    p += def.devBytes;
    const own = v.get(253);
    if (own !== undefined && own !== null) lastTs = own;
    if (def.global !== 20) return p;
    const time = own ?? ts;
    const lat = v.get(0);
    const lon = v.get(1);
    if (lat === null || lat === undefined || lon === null || lon === undefined || !Number.isFinite(time)) return p;
    const alt5 = v.get(78) ?? v.get(2);
    const speed = v.get(73) ?? v.get(6);
    const pt: GeoPoint = { t: FIT_EPOCH + time, lat: lat * SEMI, lon: lon * SEMI, alt: alt5 === null || alt5 === undefined ? NaN : alt5 / 5 - 500 };
    if (speed !== null && speed !== undefined) pt.speed = speed / 1000;
    const extra: Record<string, number> = {};
    const put = (k: string, x: number | null | undefined, scale = 1) => {
      if (x !== null && x !== undefined) extra[k] = x * scale;
    };
    put('HeartRate', v.get(3));
    put('Cadence', v.get(4));
    put('Power', v.get(7));
    put('Temperature', v.get(13));
    put('Distance', v.get(5), 0.01);
    if (Object.keys(extra).length) pt.extra = extra;
    points.push(pt);
    return p;
  }

  return points.length ? [{ name, points }] : [];
}

// ---------------------------------------------------------------- reading a file

/** A file's tracks, by its format. */
export async function readGeoTracks(file: Blob, fileName: string): Promise<GeoTrack[]> {
  const fmt = geoFormatOf(fileName);
  const base = fileName.replace(/\.[^.]+$/, '');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const textOf = () => new TextDecoder('utf-8').decode(bytes);
  switch (fmt) {
    case 'gpx':
      return parseGpx(textOf(), base);
    case 'kml':
      return parseKml(textOf(), base);
    case 'kmz':
      return parseKml(await kmzText(bytes), base);
    case 'nmea':
      return parseNmea(textOf(), base);
    case 'igc':
      return parseIgc(textOf(), base);
    case 'fit':
      return parseFit(bytes, base);
    default:
      return [];
  }
}

// ---------------------------------------------------------------- the table

export interface GeoTable {
  columns: string[];
  data: (Float64Array | string[])[];
  numeric: boolean[];
  rows: number;
  title: string;
  reference: { lat: number; lon: number };
  /** Whether the times are Unix seconds (else seconds from the start). */
  absolute: boolean;
}

/** The columns the table always has, before what the file logs. */
export const GEO_FIXED_COLUMNS = ['Time', 'X', 'Y', 'Altitude', 'Track', 'Source', 'Latitude', 'Longitude', 'Heading', 'Pitch', 'Speed', 'Event'];

const RAD = Math.PI / 180;

/** Ground distance (m) and initial bearing (deg) between two places, on a sphere: enough from fix to fix. */
function leg(a: GeoPoint, b: GeoPoint): { dist: number; bearing: number } {
  const p1 = a.lat * RAD;
  const p2 = b.lat * RAD;
  const dl = (b.lon - a.lon) * RAD;
  const x = Math.sin(dl) * Math.cos(p2);
  const y = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  const h = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return { dist: 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h))), bearing: ((Math.atan2(x, y) / RAD) + 360) % 360 };
}

/** The tracks of one or more files as one table, `source` naming the file. */
export function geoTable(tracks: GeoTrack[], source: string): GeoTable {
  const paths = tracks.filter((t) => !t.fixed && t.points.length);
  const absolute = paths.some((t) => t.points.some((p) => Number.isFinite(p.t)));
  // Untimed paths: one second a point, from the start of the timed ones.
  let t0 = Infinity;
  let t1 = -Infinity;
  for (const tr of paths)
    for (const p of tr.points)
      if (Number.isFinite(p.t)) {
        t0 = Math.min(t0, p.t);
        t1 = Math.max(t1, p.t);
      }
  if (!Number.isFinite(t0)) {
    t0 = 0;
    t1 = Math.max(0, ...paths.map((tr) => tr.points.length - 1));
  }
  // The reference: the middle of every place.
  let la0 = Infinity;
  let la1 = -Infinity;
  let lo0 = Infinity;
  let lo1 = -Infinity;
  for (const tr of tracks)
    for (const p of tr.points) {
      la0 = Math.min(la0, p.lat);
      la1 = Math.max(la1, p.lat);
      lo0 = Math.min(lo0, p.lon);
      lo1 = Math.max(lo1, p.lon);
    }
  const ref = { lat: (la0 + la1) / 2, lon: (lo0 + lo1) / 2 };
  const project = tangentPlane(ref.lat, ref.lon);
  const extraKeys = [...new Set(tracks.flatMap((tr) => tr.points.flatMap((p) => Object.keys(p.extra ?? {}))))].sort();
  type Row = { t: number; lat: number; lon: number; alt: number; track: string; head: number; pitch: number; speed: number; event: string; extra?: Record<string, number> };
  const rows: Row[] = [];
  const names = new Map<string, number>();
  const unique = (n: string) => {
    const k = names.get(n) ?? 0;
    names.set(n, k + 1);
    return k ? `${n} (${k + 1})` : n;
  };
  for (const tr of tracks) {
    if (!tr.points.length) continue;
    const name = unique(tr.name);
    if (tr.fixed) {
      // A place: there from the first moment to the last, its name the event at the start.
      const p = tr.points[0];
      const alt = Number.isFinite(p.alt) ? p.alt : 0;
      rows.push({ t: t0, lat: p.lat, lon: p.lon, alt, track: name, head: NaN, pitch: NaN, speed: NaN, event: tr.label ? `Waypoint: ${tr.label}` : '', extra: p.extra });
      if (t1 > t0) rows.push({ t: t1, lat: p.lat, lon: p.lon, alt, track: name, head: NaN, pitch: NaN, speed: NaN, event: '', extra: p.extra });
      continue;
    }
    const timed = tr.points.some((p) => Number.isFinite(p.t));
    const pts = (timed ? tr.points.filter((p) => Number.isFinite(p.t)) : tr.points.map((p, i) => ({ ...p, t: t0 + i }))).slice().sort((a, b) => a.t - b.t);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      const l = a !== b ? leg(a, b) : { dist: 0, bearing: NaN };
      const dt = b.t - a.t;
      const dAlt = Number.isFinite(b.alt) && Number.isFinite(a.alt) ? b.alt - a.alt : 0;
      const head = p.course ?? (l.dist > 0.5 ? l.bearing : NaN);
      rows.push({
        t: p.t,
        lat: p.lat,
        lon: p.lon,
        alt: Number.isFinite(p.alt) ? p.alt : 0,
        track: name,
        head,
        pitch: l.dist > 0.5 ? Math.atan2(dAlt, l.dist) / RAD : NaN,
        speed: p.speed ?? (dt > 0 ? Math.hypot(l.dist, dAlt) / dt : NaN),
        event: '',
        extra: p.extra,
      });
    }
  }
  // Headings held over a stop rather than lost.
  const lastHead = new Map<string, number>();
  for (const r of rows) {
    if (Number.isFinite(r.head)) lastHead.set(r.track, r.head);
    else if (lastHead.has(r.track)) r.head = lastHead.get(r.track)!;
  }
  rows.sort((a, b) => a.t - b.t);
  const n = rows.length;
  const f64 = () => new Float64Array(n);
  const T = f64();
  const X = f64();
  const Y = f64();
  const ALT = f64();
  const LAT = f64();
  const LON = f64();
  const HEAD = f64();
  const PITCH = f64();
  const SPEED = f64();
  const extras = extraKeys.map(() => f64().fill(NaN));
  const track: string[] = [];
  const src: string[] = [];
  const event: string[] = [];
  rows.forEach((r, i) => {
    const [e, nn] = project(r.lat, r.lon);
    T[i] = r.t;
    X[i] = e;
    Y[i] = nn;
    ALT[i] = r.alt;
    LAT[i] = r.lat;
    LON[i] = r.lon;
    HEAD[i] = Number.isFinite(r.head) ? r.head : 0;
    PITCH[i] = Number.isFinite(r.pitch) ? r.pitch : 0;
    SPEED[i] = r.speed;
    track.push(r.track);
    src.push(source);
    event.push(r.event);
    extraKeys.forEach((k, j) => {
      const v = r.extra?.[k];
      if (v !== undefined) extras[j][i] = v;
    });
  });
  const data: (Float64Array | string[])[] = [T, X, Y, ALT, track, src, LAT, LON, HEAD, PITCH, SPEED, event, ...extras];
  return {
    columns: [...GEO_FIXED_COLUMNS, ...extraKeys],
    data,
    numeric: data.map((d) => d instanceof Float64Array),
    rows: n,
    title: source,
    reference: ref,
    absolute,
  };
}

/** How the viewer reads a GPS table: as an ACMI recording, north up, placed on the earth. */
export function geoHints(t: GeoTable): {
  axes: { up: 'z'; flipY: boolean };
  columns: Record<string, unknown>;
  geo: { lat0: number; lon0: number; projection: 'tangent-plane'; east: string; north: string; up: string };
} {
  return {
    axes: { up: 'z', flipY: true },
    columns: {
      x: 'X',
      y: 'Y',
      z: 'Altitude',
      time: 'Time',
      timeUnit: t.absolute ? 'unix_seconds' : 'seconds',
      personId: 'Track',
      sessionId: 'Source',
      lookMode: 'yawPitch',
      yaw: 'Heading',
      pitch: 'Pitch',
      angleUnit: 'degrees',
      extra: ['Event', 'Speed', 'Altitude', 'Latitude', 'Longitude', ...t.columns.slice(GEO_FIXED_COLUMNS.length)],
    },
    geo: { lat0: t.reference.lat, lon0: t.reference.lon, projection: 'tangent-plane', east: 'X', north: 'Y', up: 'Altitude' },
  };
}
