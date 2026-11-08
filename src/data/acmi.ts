/**
 * Tacview ACMI recordings (format 2.x, text, or zipped as `.zip.acmi`), read
 * into a table the viewer loads like any other: one row each time an object's
 * position is written, and one row per event at the object's place.
 *
 * The format is Tacview's public "universal" flight-recording format
 * (https://www.tacview.net/documentation/acmi/): a header, global properties on
 * object 0 (ReferenceTime, ReferenceLongitude/Latitude, Title, ...), `#t` lines
 * that set the time in seconds after ReferenceTime, object lines `id,Key=Value,...`
 * (hex ids; only changed properties are written), `-id` when an object is gone,
 * and `0,Event=Kind|id|text`. A line ending in `\` continues on the next; `\,`
 * is a comma inside a value.
 *
 * Positions, `T=`, come in four shapes, empty fields meaning unchanged:
 *   lon|lat|alt
 *   lon|lat|alt|u|v
 *   lon|lat|alt|roll|pitch|yaw
 *   lon|lat|alt|roll|pitch|yaw|u|v|heading
 * lon and lat are offsets from the reference point, degrees; alt in metres.
 * Positions are projected on a plane touching the earth at the reference
 * point - true distances and bearings near it, a drift of under a part in a
 * thousand at 100 km - for every recording, so all share one projection with a
 * backdrop of the real world. U and V, the game's own flat-world metres (DCS
 * writes them), are kept as columns when the whole recording has them.
 *
 * Columns: X east and Y north (metres), Altitude, Time (seconds, or Unix
 * seconds when the recording has a ReferenceTime), Object (name, pilot and
 * id), Coalition, Heading/Pitch/Roll (degrees), Type, Name, Pilot, Group,
 * Country, Color, Event, Latitude, Longitude, EventObjects (every object an
 * event names), RecordingInfo (the recording's own properties - DataSource,
 * DataRecorder, Author, Briefing, Comments... - as JSON, as they stand at
 * that moment), then every other property the recording carries: numeric
 * ones as numbers (IAS, Mach, AOA, FuelWeight, ...), the rest as text
 * (Parent, CallSign, LockedTarget, Label, Shape, ...).
 *
 * Every event is a row: at the first object it names that has been seen,
 * else - a bookmark, a message to all - at the reference point, as the
 * object "(recording)". An object's removal (`-id`) is an event, "Removed",
 * where it was last.
 */

const EARTH = 6378137;
const F = 1 / 298.257223563;
const E2 = F * (2 - F);

export interface AcmiTable {
  columns: string[];
  /** Per column: numbers (NaN for absent) or strings. */
  data: (Float64Array | string[])[];
  numeric: boolean[];
  rows: number;
  /** The recording's title, or the file's name. */
  title: string;
  /** Unix seconds of time 0, when the recording says. */
  referenceTime: number | null;
  reference: { lon: number; lat: number };
  /** Whether positions are the game's flat-world U/V. */
  flatWorld: boolean;
  /** The recording's own properties (object 0's), as they stood at its end. */
  globals: Record<string, string>;
}

interface ObjState {
  lon: number;
  lat: number;
  alt: number;
  roll: number;
  pitch: number;
  yaw: number;
  u: number;
  v: number;
  heading: number;
  props: Map<string, string>;
  seen: boolean;
}

/** Splits a line on commas that are not escaped. */
function splitFields(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\' && i + 1 < line.length) {
      cur += line[++i];
      continue;
    }
    if (c === ',') {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

/** The text of an ACMI file, unzipping a `.zip.acmi` (or any zip) first. */
export async function acmiText(file: Blob): Promise<string> {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) return unzipFirst(new Uint8Array(await file.arrayBuffer()));
  const buf = new Uint8Array(await file.arrayBuffer());
  // UTF-8 with or without a BOM; Tacview writes UTF-8.
  return new TextDecoder('utf-8').decode(buf);
}

/** The first file of a zip, stored or deflated: what a `.zip.acmi` holds. */
async function unzipFirst(z: Uint8Array): Promise<string> {
  const dv = new DataView(z.buffer, z.byteOffset, z.byteLength);
  // Read sizes from the central directory: a streamed zip leaves them 0 in the local header.
  let eocd = -1;
  for (let i = z.length - 22; i >= Math.max(0, z.length - 65557); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('not a zip: no end of central directory');
  const cd = dv.getUint32(eocd + 16, true);
  if (dv.getUint32(cd, true) !== 0x02014b50) throw new Error('zip central directory not found');
  const method = dv.getUint16(cd + 10, true);
  const csize = dv.getUint32(cd + 20, true);
  const local = dv.getUint32(cd + 42, true);
  const nameLen = dv.getUint16(local + 26, true);
  const extraLen = dv.getUint16(local + 28, true);
  const start = local + 30 + nameLen + extraLen;
  const data = z.subarray(start, start + csize);
  if (method === 0) return new TextDecoder('utf-8').decode(data);
  if (method !== 8) throw new Error(`zip method ${method} is not supported`);
  const stream = new Blob([data.slice()]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text();
}

/** Parses ACMI text into the table. `name` titles a recording that has no Title. */
export function parseAcmi(text: string, name = 'recording'): AcmiTable {
  const lines = text.split(/\r?\n/);
  // Join continued lines.
  const logical: string[] = [];
  let acc = '';
  for (const raw of lines) {
    if (raw.endsWith('\\') && !raw.endsWith('\\\\')) {
      acc += raw.slice(0, -1) + '\n';
      continue;
    }
    logical.push(acc + raw);
    acc = '';
  }
  if (acc) logical.push(acc);

  let refLon = 0;
  let refLat = 0;
  let refTime: number | null = null;
  let title = name;
  let t = 0;
  const objects = new Map<string, ObjState>();
  // Raw samples first; projection needs to know whether all have U/V.
  type Sample = { id: string; t: number; lon: number; lat: number; alt: number; roll: number; pitch: number; yaw: number; u: number; v: number; heading: number; props: Map<string, string>; event: string; objects: string; info: string };
  const samples: Sample[] = [];
  const numericKeys = new Set<string>();
  // Keys with a value that is not a number: kept as text, whatever their other values.
  const textKeys = new Set<string>();
  const NOT_NUMERIC = new Set(['T', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Coalition', 'Color', 'Shape', 'Parent', 'Next', 'CallSign', 'Registration', 'Squawk', 'ICAO24', 'Label', 'FocusedTarget', 'LockedTarget', 'Importance', 'Debug']);
  // The recording's own properties (object 0's), as JSON as they stand: a sample keeps the text of its moment.
  const globals: Record<string, string> = {};
  let info = '';
  const NO_PROPS = new Map<string, string>();

  const sample = (id: string, o: ObjState, event: string, objects = '') => {
    samples.push({ id, t, lon: o.lon, lat: o.lat, alt: o.alt, roll: o.roll, pitch: o.pitch, yaw: o.yaw, u: o.u, v: o.v, heading: o.heading, props: o.props, event, objects, info });
  };

  for (const line of logical) {
    if (!line || line.startsWith('//')) continue;
    if (line.startsWith('FileType=') || line.startsWith('FileVersion=')) continue;
    const c0 = line.charCodeAt(0);
    if (c0 === 0x23 /* # */) {
      const v = Number(line.slice(1));
      if (Number.isFinite(v)) t = v;
      continue;
    }
    if (c0 === 0x2d /* - */) {
      const gone = line.slice(1).trim().toLowerCase();
      // The object leaves: an event where it was last.
      const o = objects.get(gone);
      if (o && o.seen) sample(gone, o, 'Removed');
      objects.delete(gone);
      continue;
    }
    const fields = splitFields(line);
    const id = fields[0].trim().toLowerCase();
    if (id === '0') {
      for (const f of fields.slice(1)) {
        const eq = f.indexOf('=');
        if (eq < 0) continue;
        const key = f.slice(0, eq);
        const value = f.slice(eq + 1);
        if (key === 'ReferenceLongitude') refLon = Number(value) || 0;
        else if (key === 'ReferenceLatitude') refLat = Number(value) || 0;
        else if (key === 'ReferenceTime') {
          const ms = Date.parse(value);
          if (Number.isFinite(ms)) refTime = ms / 1000;
        } else if (key === 'Event') {
          // Kind|id|id...|text: the ids are all but the last field, the text the last.
          const parts = value.split('|');
          const kind = parts[0];
          // Named fields instead (Timeout: SourceId:507|AmmoType:FOX2|TargetId:201|Outcome:Kill): the ids are
          // SourceId's and TargetId's, the text all the fields as written.
          const named = parts.length > 2 && parts.slice(1).every((x) => !x.trim() || /^\s*[A-Za-z]+\s*:/.test(x));
          const ids = named
            ? parts.slice(1).filter((x) => /^\s*(SourceId|TargetId)\s*:/i.test(x)).map((x) => x.slice(x.indexOf(':') + 1).trim().toLowerCase()).filter(Boolean)
            : parts.slice(1, Math.max(1, parts.length - 1)).map((x) => x.trim().toLowerCase()).filter(Boolean);
          const text = named ? parts.slice(1).filter((x) => x.trim()).join('|') : parts.length > 1 ? parts[parts.length - 1] : '';
          const label = kind + (text ? `: ${text}` : '');
          const at = ids.find((x) => objects.get(x)?.seen);
          if (at) sample(at, objects.get(at)!, label, ids.join(' '));
          else {
            // About no object seen: at the reference point, as the recording's own.
            sample('', { lon: 0, lat: 0, alt: 0, roll: NaN, pitch: NaN, yaw: NaN, u: NaN, v: NaN, heading: NaN, props: NO_PROPS, seen: true }, label, ids.join(' '));
          }
        } else {
          if (key === 'Title') title = value;
          globals[key] = value;
          info = JSON.stringify(globals);
        }
      }
      continue;
    }
    let o = objects.get(id);
    if (!o) {
      o = { lon: NaN, lat: NaN, alt: NaN, roll: NaN, pitch: NaN, yaw: NaN, u: NaN, v: NaN, heading: NaN, props: new Map(), seen: false };
      objects.set(id, o);
    }
    let moved = false;
    // Copy-on-write: samples keep a reference to the properties as they were;
    // the first change on a line gives the object a fresh map, so a recording
    // of millions of positions does not copy the properties for each one.
    let ownProps = false;
    for (const f of fields.slice(1)) {
      const eq = f.indexOf('=');
      if (eq < 0) continue;
      const key = f.slice(0, eq);
      const value = f.slice(eq + 1);
      if (key === 'T') {
        const p = value.split('|');
        const num = (s: string | undefined, prev: number) => (s === undefined || s === '' ? prev : Number(s));
        o.lon = num(p[0], o.lon);
        o.lat = num(p[1], o.lat);
        o.alt = num(p[2], o.alt);
        if (p.length === 5) {
          o.u = num(p[3], o.u);
          o.v = num(p[4], o.v);
        } else if (p.length === 6) {
          o.roll = num(p[3], o.roll);
          o.pitch = num(p[4], o.pitch);
          o.yaw = num(p[5], o.yaw);
        } else if (p.length >= 9) {
          o.roll = num(p[3], o.roll);
          o.pitch = num(p[4], o.pitch);
          o.yaw = num(p[5], o.yaw);
          o.u = num(p[6], o.u);
          o.v = num(p[7], o.v);
          o.heading = num(p[8], o.heading);
        }
        moved = true;
      } else {
        if (!ownProps) {
          o.props = new Map(o.props);
          ownProps = true;
        }
        o.props.set(key, value);
        if (NOT_NUMERIC.has(key) || (value !== '' && !Number.isFinite(Number(value)))) textKeys.add(key);
        else if (value !== '') numericKeys.add(key);
      }
    }
    if (moved && Number.isFinite(o.lon) && Number.isFinite(o.lat)) {
      o.seen = true;
      sample(id, o, '');
    }
  }

  const flatWorld = samples.length > 0 && samples.every((s) => Number.isFinite(s.u) && Number.isFinite(s.v));
  const n = samples.length;
  const X = new Float64Array(n);
  const Y = new Float64Array(n);
  const ALT = new Float64Array(n);
  const TIME = new Float64Array(n);
  const HEAD = new Float64Array(n);
  const PITCH = new Float64Array(n);
  const ROLL = new Float64Array(n);
  const LAT = new Float64Array(n);
  const LON = new Float64Array(n);
  const U = new Float64Array(n);
  const V = new Float64Array(n);
  const strCols: Record<string, string[]> = { Object: [], Coalition: [], Type: [], Name: [], Pilot: [], Group: [], Country: [], Color: [], Event: [], EventObjects: [], RecordingInfo: [] };
  const extraKeys = [...numericKeys].filter((k) => !['Heading', 'Altitude'].includes(k) && !textKeys.has(k)).sort();
  const extra = extraKeys.map(() => new Float64Array(n));
  // Text properties beyond the ones with columns of their own.
  const OWN_TEXT = new Set(['Type', 'Name', 'Pilot', 'Group', 'Country', 'Coalition', 'Color']);
  const textExtra = [...textKeys].filter((k) => !OWN_TEXT.has(k) && !strCols[k]).sort();
  const textCols = textExtra.map(() => new Array<string>(n));
  const project = tangentPlane(refLat, refLon);
  for (let i = 0; i < n; i++) {
    const s = samples[i];
    const lat = refLat + s.lat;
    const lon = refLon + s.lon;
    LAT[i] = lat;
    LON[i] = lon;
    ALT[i] = s.alt;
    // Always from latitude and longitude, so every game's recording shares one
    // projection with a backdrop of the real world; a game's own flat-world U/V
    // is kept beside it as columns U and V.
    const [e, nn] = project(lat, lon);
    X[i] = e;
    Y[i] = nn;
    U[i] = s.u;
    V[i] = s.v;
    TIME[i] = (refTime ?? 0) + s.t;
    // Heading: the given one, else the yaw (Tacview's yaw is a true heading).
    const head = Number.isFinite(s.heading) ? s.heading : s.yaw;
    HEAD[i] = Number.isFinite(head) ? head : NaN;
    PITCH[i] = s.pitch;
    ROLL[i] = s.roll;
    const p = s.props;
    const name = p.get('Name') ?? '';
    const pilot = p.get('Pilot') ?? '';
    strCols.Object.push(s.id ? `${pilot ? `${pilot} ` : ''}${name ? `(${name}) ` : ''}#${s.id}`.trim() : '(recording)');
    strCols.Coalition.push(p.get('Coalition') ?? p.get('Color') ?? '');
    strCols.Type.push(p.get('Type') ?? '');
    strCols.Name.push(name);
    strCols.Pilot.push(pilot);
    strCols.Group.push(p.get('Group') ?? '');
    strCols.Country.push(p.get('Country') ?? '');
    strCols.Color.push(p.get('Color') ?? '');
    strCols.Event.push(s.event);
    strCols.EventObjects.push(s.objects);
    strCols.RecordingInfo.push(s.info);
    extraKeys.forEach((k, j) => {
      const v = p.get(k);
      extra[j][i] = v === undefined || v === '' ? NaN : Number(v);
    });
    textExtra.forEach((k, j) => {
      textCols[j][i] = p.get(k) ?? '';
    });
  }
  const recording = new Array<string>(n).fill(title);
  const flat = flatWorld ? ['U', 'V'] : [];
  const columns = ['Time', 'X', 'Y', 'Altitude', 'Object', 'Coalition', 'Heading', 'Pitch', 'Roll', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Color', 'Event', 'Latitude', 'Longitude', 'Recording', 'EventObjects', 'RecordingInfo', ...flat, ...extraKeys, ...textExtra];
  const data: (Float64Array | string[])[] = [TIME, X, Y, ALT, strCols.Object, strCols.Coalition, HEAD, PITCH, ROLL, strCols.Type, strCols.Name, strCols.Pilot, strCols.Group, strCols.Country, strCols.Color, strCols.Event, LAT, LON, recording, strCols.EventObjects, strCols.RecordingInfo, ...(flatWorld ? [U, V] : []), ...extraKeys.map((_, j) => extra[j]), ...textCols];
  return {
    columns,
    data,
    numeric: data.map((d) => d instanceof Float64Array),
    rows: n,
    title,
    referenceTime: refTime,
    reference: { lon: refLon, lat: refLat },
    flatWorld,
    globals: { ...globals },
  };
}

/**
 * East and north metres on the plane touching the WGS84 ellipsoid at (lat0,
 * lon0): through earth-centred coordinates, so distances and bearings near the
 * reference are true.
 */
export function tangentPlane(lat0: number, lon0: number): (lat: number, lon: number, alt?: number) => [number, number, number] {
  const rad = Math.PI / 180;
  const ecef = (lat: number, lon: number, h: number): [number, number, number] => {
    const sl = Math.sin(lat * rad);
    const cl = Math.cos(lat * rad);
    const N = EARTH / Math.sqrt(1 - E2 * sl * sl);
    return [(N + h) * cl * Math.cos(lon * rad), (N + h) * cl * Math.sin(lon * rad), (N * (1 - E2) + h) * sl];
  };
  const o = ecef(lat0, lon0, 0);
  const sp = Math.sin(lat0 * rad);
  const cp = Math.cos(lat0 * rad);
  const sl = Math.sin(lon0 * rad);
  const cl = Math.cos(lon0 * rad);
  return (lat, lon, alt = 0) => {
    const p = ecef(lat, lon, alt);
    const dx = p[0] - o[0];
    const dy = p[1] - o[1];
    const dz = p[2] - o[2];
    const e = -sl * dx + cl * dy;
    const n = -sp * cl * dx - sp * sl * dy + cp * dz;
    const u = cp * cl * dx + cp * sl * dy + sp * dz;
    return [e, n, u];
  };
}

/** Columns every table has, before the recording's own properties (U and V, when there, count with these). */
export const ACMI_FIXED_COLUMNS = 21;

/** Whether a file name is an ACMI recording. */
export function isAcmiName(name: string): boolean {
  return /\.acmi$/i.test(name) || /\.zip\.acmi$/i.test(name) || /\.txt\.acmi$/i.test(name);
}

/** How the viewer reads the table: the columns' roles, a north-up world, headings in degrees. */
export function acmiHints(t: AcmiTable): {
  axes: { up: 'z'; flipY: boolean };
  columns: Record<string, unknown>;
} {
  const extra = ['Type', 'Name', 'Pilot', 'Group', 'Country', 'Event', 'Altitude', 'Roll', 'Latitude', 'Longitude', 'EventObjects', ...t.columns.slice(ACMI_FIXED_COLUMNS)];
  return {
    // Y north becomes the world's -Z, so a heading of 0 looks north as box yaw does.
    axes: { up: 'z', flipY: true },
    columns: {
      x: 'X',
      y: 'Y',
      z: 'Altitude',
      time: 'Time',
      timeUnit: t.referenceTime !== null ? 'unix_seconds' : 'seconds',
      personId: 'Object',
      teamId: 'Coalition',
      sessionId: 'Recording',
      lookMode: 'yawPitch',
      yaw: 'Heading',
      pitch: 'Pitch',
      angleUnit: 'degrees',
      extra,
    },
  };
}
