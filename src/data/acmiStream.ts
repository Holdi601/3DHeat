/**
 * Tacview ACMI recordings read as a stream, a piece of text at a time, for
 * recordings too big to hold as one string or one table (a DCS server's
 * evening is half a gigabyte of text and millions of rows): the same reading
 * as `parseAcmi` in `acmi.ts`, handed out row by row in the same order.
 *
 * Every row says whether it is at a real place (`placed`): an object's
 * position, or an event or removal at the object it names. The rest - a
 * comment, an event about no object seen, an object that never got a
 * position - sit at the reference point, as `parseAcmi` puts them, and a
 * reader that draws positions keeps them apart.
 *
 * No other imports than `acmi.ts`, so Node runs it as it is (the converter in
 * tools/acmi-to-parquet.mjs).
 */

import { tangentPlane } from './acmi.ts';

export { tangentPlane };

/** One row as it is handed out; the reader reuses the object, so take what is needed before the next. */
export interface AcmiStreamRow {
  /** The object's id, lower-case hex; '' for the recording's own rows. */
  id: string;
  /** Seconds after the reference time. */
  t: number;
  /** Degrees, the reference already added; the reference point for an unplaced row. */
  lon: number;
  lat: number;
  alt: number;
  roll: number;
  pitch: number;
  yaw: number;
  u: number;
  v: number;
  heading: number;
  /** The object's properties as they stand at this row; they change in place as the reading goes on. */
  props: ReadonlyMap<string, string>;
  /** '' for a position; else the event's kind and text ("Destroyed", "Removed", "Comment: ..."). */
  event: string;
  /** Every object id the event names, space-separated. */
  objects: string;
  placed: boolean;
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

/** Properties that are text whatever their values look like (as `parseAcmi`). */
export const ACMI_TEXT_KEYS: ReadonlySet<string> = new Set(['T', 'Type', 'Name', 'Pilot', 'Group', 'Country', 'Coalition', 'Color', 'Shape', 'Parent', 'Next', 'CallSign', 'Registration', 'Squawk', 'ICAO24', 'Label', 'FocusedTarget', 'LockedTarget', 'Importance', 'Debug']);

const NO_PROPS: ReadonlyMap<string, string> = new Map();

/** Splits a line on commas that are not escaped. */
function splitFields(line: string): string[] {
  if (line.indexOf('\\') < 0) return line.split(',');
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

export class AcmiStreamReader {
  refLon = 0;
  refLat = 0;
  /** Unix seconds of time 0, when the recording says. */
  refTime: number | null = null;
  title: string;
  /** The recording's own properties as they stand now. */
  readonly globals: Record<string, string> = {};
  /** Goes up each time `globals` changes. */
  globalsVersion = 0;
  /** Properties seen with a number, and those seen with anything else (text wins). */
  readonly numericKeys = new Set<string>();
  readonly textKeys = new Set<string>();
  /** Rows handed out, and of them those with U and V. */
  rows = 0;
  rowsWithUV = 0;
  /** The file's lines by kind (`parseAcmi`'s completeness counts). */
  readonly kinds: Record<string, number> = {};
  unplaced = 0;

  private t = 0;

  /** The time the reading is at, seconds after the reference time. */
  get lastTime(): number {
    return this.t;
  }
  private readonly objects = new Map<string, ObjState>();
  private carry = '';
  private acc = '';
  private readonly row: AcmiStreamRow = { id: '', t: 0, lon: 0, lat: 0, alt: 0, roll: NaN, pitch: NaN, yaw: NaN, u: NaN, v: NaN, heading: NaN, props: NO_PROPS, event: '', objects: '', placed: false };
  private readonly onRow: (r: AcmiStreamRow) => void;

  constructor(onRow: (r: AcmiStreamRow) => void, name = 'recording') {
    this.onRow = onRow;
    this.title = name;
  }

  /** Reads the next piece of text; a line cut at its end waits for the next piece. */
  push(text: string): void {
    let s = this.carry ? this.carry + text : text;
    let at = 0;
    for (;;) {
      const nl = s.indexOf('\n', at);
      if (nl < 0) break;
      let end = nl;
      if (end > at && s.charCodeAt(end - 1) === 13) end--;
      this.raw(s.slice(at, end));
      at = nl + 1;
    }
    this.carry = at < s.length ? s.slice(at) : '';
    s = '';
  }

  /** The end of the text: the last line, then the objects that never got a position. */
  end(): void {
    if (this.carry) {
      const c = this.carry.endsWith('\r') ? this.carry.slice(0, -1) : this.carry;
      this.carry = '';
      this.raw(c);
    }
    if (this.acc) {
      const a = this.acc;
      this.acc = '';
      this.line(a);
    }
    for (const [id, o] of this.objects) {
      if (o.seen) continue;
      this.unplaced++;
      this.atReference(id, o.props, 'Unplaced', '');
    }
  }

  /** A physical line: joined to the next when it ends in a backslash. */
  private raw(r: string): void {
    if (r.endsWith('\\') && !r.endsWith('\\\\')) {
      this.acc += r.slice(0, -1) + '\n';
      return;
    }
    if (this.acc) {
      const a = this.acc + r;
      this.acc = '';
      this.line(a);
    } else this.line(r);
  }

  private count(kind: string): void {
    this.kinds[kind] = (this.kinds[kind] ?? 0) + 1;
  }

  private setGlobal(key: string, value: string): void {
    if (this.globals[key] === value) return;
    this.globals[key] = value;
    this.globalsVersion++;
  }

  private emit(id: string, o: ObjState, event: string, objects: string): void {
    const r = this.row;
    r.id = id;
    r.t = this.t;
    r.lon = this.refLon + o.lon;
    r.lat = this.refLat + o.lat;
    r.alt = o.alt;
    r.roll = o.roll;
    r.pitch = o.pitch;
    r.yaw = o.yaw;
    r.u = o.u;
    r.v = o.v;
    r.heading = o.heading;
    r.props = o.props;
    r.event = event;
    r.objects = objects;
    r.placed = true;
    this.rows++;
    if (Number.isFinite(o.u) && Number.isFinite(o.v)) this.rowsWithUV++;
    this.onRow(r);
  }

  /** A row of the recording's own, or of an object never placed: at the reference point. */
  private atReference(id: string, props: ReadonlyMap<string, string>, event: string, objects: string): void {
    const r = this.row;
    r.id = id;
    r.t = this.t;
    r.lon = this.refLon;
    r.lat = this.refLat;
    r.alt = 0;
    r.roll = r.pitch = r.yaw = r.u = r.v = r.heading = NaN;
    r.props = props;
    r.event = event;
    r.objects = objects;
    r.placed = false;
    this.rows++;
    this.onRow(r);
  }

  private line(line: string): void {
    if (!line) return;
    if (line.startsWith('//')) {
      this.count('comment');
      this.atReference('', NO_PROPS, `Comment: ${line.slice(2).trim()}`, '');
      return;
    }
    if (line.startsWith('FileType=') || line.startsWith('FileVersion=')) {
      this.count('header');
      const eq = line.indexOf('=');
      this.setGlobal(line.slice(0, eq), line.slice(eq + 1));
      return;
    }
    const c0 = line.charCodeAt(0);
    if (c0 === 0x23 /* # */) {
      this.count('time');
      const v = Number(line.slice(1));
      if (Number.isFinite(v)) this.t = v;
      return;
    }
    if (c0 === 0x2d /* - */) {
      this.count('removed');
      const gone = line.slice(1).trim().toLowerCase();
      const o = this.objects.get(gone);
      if (o && o.seen) this.emit(gone, o, 'Removed', '');
      this.objects.delete(gone);
      return;
    }
    const fields = splitFields(line);
    const id = fields[0].trim().toLowerCase();
    if (id === '0') {
      this.globalLine(line, fields);
      return;
    }
    let o = this.objects.get(id);
    if (!o) {
      // An altitude never written is sea level, as Tacview reads it (and `parseAcmi`): DCS writes ships with none.
      o = { lon: NaN, lat: NaN, alt: 0, roll: NaN, pitch: NaN, yaw: NaN, u: NaN, v: NaN, heading: NaN, props: new Map(), seen: false };
      this.objects.set(id, o);
    }
    let moved = false;
    for (let k = 1; k < fields.length; k++) {
      const f = fields[k];
      const eq = f.indexOf('=');
      if (eq < 0) continue;
      const key = f.slice(0, eq);
      const value = f.slice(eq + 1);
      if (key === 'T') {
        const p = value.split('|');
        const num = (i: number, prev: number) => (p[i] === undefined || p[i] === '' ? prev : Number(p[i]));
        o.lon = num(0, o.lon);
        o.lat = num(1, o.lat);
        o.alt = num(2, o.alt);
        if (p.length === 5) {
          o.u = num(3, o.u);
          o.v = num(4, o.v);
        } else if (p.length === 6) {
          o.roll = num(3, o.roll);
          o.pitch = num(4, o.pitch);
          o.yaw = num(5, o.yaw);
        } else if (p.length >= 9) {
          o.roll = num(3, o.roll);
          o.pitch = num(4, o.pitch);
          o.yaw = num(5, o.yaw);
          o.u = num(6, o.u);
          o.v = num(7, o.v);
          o.heading = num(8, o.heading);
        }
        moved = true;
      } else {
        // Changed in place: a row is handed out at once, with the properties of its moment.
        o.props.set(key, value);
        if (ACMI_TEXT_KEYS.has(key) || (value !== '' && !Number.isFinite(Number(value)))) this.textKeys.add(key);
        else if (value !== '') this.numericKeys.add(key);
      }
    }
    if (moved && Number.isFinite(o.lon) && Number.isFinite(o.lat)) {
      this.count('position');
      o.seen = true;
      this.emit(id, o, '', '');
    } else this.count('properties');
  }

  /** A line of object 0: the recording's own properties, or an event. */
  private globalLine(line: string, fields: string[]): void {
    this.count(/(^|,)Event=/.test(line) ? 'event' : 'global');
    for (let k = 1; k < fields.length; k++) {
      const f = fields[k];
      const eq = f.indexOf('=');
      if (eq < 0) continue;
      const key = f.slice(0, eq);
      const value = f.slice(eq + 1);
      if (key === 'ReferenceLongitude') this.refLon = Number(value) || 0;
      else if (key === 'ReferenceLatitude') this.refLat = Number(value) || 0;
      else if (key === 'ReferenceTime') {
        const ms = Date.parse(value);
        if (Number.isFinite(ms)) this.refTime = ms / 1000;
        // Kept as written too: the mission's start, for the Match tab.
        this.setGlobal(key, value);
      } else if (key === 'Event') {
        // Kind|id|id...|text, or named fields (SourceId:507|TargetId:201|...), as `parseAcmi` reads them.
        const parts = value.split('|');
        const kind = parts[0].trim();
        const named = parts.length > 2 && parts.slice(1).every((x) => !x.trim() || /^\s*[A-Za-z]+\s*:/.test(x));
        const ids = named
          ? parts.slice(1).filter((x) => /^\s*(SourceId|TargetId)\s*:/i.test(x)).map((x) => x.slice(x.indexOf(':') + 1).trim().toLowerCase()).filter(Boolean)
          : parts.slice(1, Math.max(1, parts.length - 1)).map((x) => x.trim().toLowerCase()).filter(Boolean);
        const text = named ? parts.slice(1).map((x) => x.trim()).filter(Boolean).join('|') : parts.length > 1 ? parts[parts.length - 1] : '';
        const label = kind + (text ? `: ${text}` : '');
        const at = ids.find((x) => this.objects.get(x)?.seen);
        if (at) this.emit(at, this.objects.get(at)!, label, ids.join(' '));
        else this.atReference('', NO_PROPS, label, ids.join(' '));
      } else {
        if (key === 'Title') this.title = value;
        this.setGlobal(key, value);
      }
    }
  }

  /** `parseAcmi`'s completeness: every line kind read whole, a property line in part, none lost. */
  completeness(): Record<string, { seen: number; decoded: number; partial: number; raw: number; lost: number }> {
    const out: Record<string, { seen: number; decoded: number; partial: number; raw: number; lost: number }> = {};
    for (const [kind, n] of Object.entries(this.kinds)) {
      const part = kind === 'properties' ? n : 0;
      out[kind] = { seen: n, decoded: n - part, partial: part, raw: 0, lost: 0 };
    }
    if (this.unplaced) out.unplacedObjects = { seen: this.unplaced, decoded: this.unplaced, partial: 0, raw: 0, lost: 0 };
    return out;
  }
}

/** The label `parseAcmi` gives an object's rows: pilot, (name) and #id; "(recording)" for the recording's own. */
export function acmiObjectLabel(id: string, props: ReadonlyMap<string, string>): string {
  if (!id) return '(recording)';
  const name = props.get('Name') ?? '';
  const pilot = props.get('Pilot') ?? '';
  return `${pilot ? `${pilot} ` : ''}${name ? `(${name}) ` : ''}#${id}`.trim();
}
