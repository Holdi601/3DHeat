/**
 * A loaded recording written out again, after a trim or a time shift: as CSV
 * (every row, in the data's own frame and column names, so the file loads
 * back as it was), or, for a recording placed on the earth, as a Tacview
 * ACMI 2.2 text file that Tacview and 3DHeat both open.
 */

import type { Dataset } from '../state/types';
import { worldToData } from '../render/pose';
import { geoFrame } from '../world/geoFrame';
import { sourceSeconds } from './reshape';
import { say } from './msg';

function csvField(v: string | number): string {
  const s = typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : v;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** A row's value of an attribute as text. */
function attrText(a: Dataset['attrs'][number], row: number): string {
  if (a.kind === 'category') return a.categories?.[(a.data as Uint32Array)[row]] ?? '';
  const v = (a.data as Float32Array)[row];
  // Kept as float32: written to the digits it holds, not its binary tail.
  return Number.isFinite(v) ? String(Number(v.toPrecision(7))) : '';
}

/**
 * The rows as CSV: time (the file's own seconds: Unix seconds where the
 * recording has a date), position in the data's frame, look angles in
 * degrees, the track, team and session, then every kept column.
 */
export function recordingCsv(d: Dataset): string {
  const rc = d.roleColumns ?? {};
  const head = [
    rc.time ?? 'time',
    rc.x ?? 'x',
    rc.y ?? 'y',
    rc.z ?? 'z',
    ...(d.yaw ? ['yaw_deg'] : []),
    ...(d.pitch ? ['pitch_deg'] : []),
    ...(d.personId ? [rc.person ?? 'person'] : []),
    ...(d.teamId ? [rc.team ?? 'team'] : []),
    ...(d.sessionId ? [rc.session ?? 'session'] : []),
  ];
  const taken = new Set(head);
  const attrs = d.attrs.filter((a) => !taken.has(a.name));
  const lines = [[...head, ...attrs.map((a) => a.name)].map(csvField).join(',')];
  const deg = 180 / Math.PI;
  for (let r = 0; r < d.count; r++) {
    const p = worldToData({ x: d.px[r], y: d.py[r], z: d.pz[r] }, d.axes);
    const f: (string | number)[] = [d.time ? Number(sourceSeconds(d, d.time[r]).toFixed(3)) : '', p.x, p.y, p.z];
    if (d.yaw) f.push(Number((d.yaw[r] * deg).toFixed(3)));
    if (d.pitch) f.push(Number((d.pitch[r] * deg).toFixed(3)));
    if (d.personId) f.push(d.personLabels[d.personId[r]] ?? '');
    if (d.teamId) f.push(d.teamLabels[d.teamId[r]] ?? '');
    if (d.sessionId) f.push(d.sessionLabels[d.sessionId[r]] ?? '');
    for (const a of attrs) f.push(attrText(a, r));
    lines.push(f.map(csvField).join(','));
  }
  return lines.join('\n') + '\n';
}

/** Whether a recording can be written as ACMI: it is placed on the earth and has time and tracks. */
export function canWriteAcmi(d: Dataset): boolean {
  return !!geoFrame(d) && !!d.time && !!d.personId;
}

/** Properties ACMI writes as an object's own (text), when the recording has them. */
const TEXT_PROPS = ['Name', 'Type', 'Pilot', 'Group', 'Country', 'Coalition', 'Color', 'CallSign', 'Parent', 'Label', 'LockedTarget', 'FocusedTarget'];
/** Columns the table makes of ACMI's own fields, not properties to write back. */
const NOT_PROPS = new Set(['latitude', 'longitude', 'altitude', 'roll', 'pitch', 'heading', 'yaw', 'x', 'y', 'u', 'v', 'event', 'eventobjects', 'recordinginfo', 'object', 'recording', 'source file', 'time']);

function acmiValue(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/\r?\n/g, '\\\n');
}

/**
 * The recording as ACMI 2.2 text. Positions as longitude, latitude and
 * altitude from where the rows are drawn; roll from a Roll column, pitch and
 * heading from the look angles; events (Event column) as events, "Removed" as
 * the object leaving; every other kept column a property, written when it
 * changes. Null when the recording cannot be (see `canWriteAcmi`).
 */
export function recordingAcmi(d: Dataset): string | null {
  const frame = geoFrame(d);
  if (!frame || !d.time || !d.personId) return null;
  const deg = 180 / Math.PI;
  const lower = (s: string) => s.trim().toLowerCase();
  const attrBy = (name: string) => d.attrs.find((a) => lower(a.name) === lower(name)) ?? null;
  const roll = attrBy('Roll');
  const event = d.attrs.find((a) => a.kind === 'category' && /^events?$/i.test(a.name.trim())) ?? null;
  const textProps = TEXT_PROPS.map((n) => ({ key: n, a: attrBy(n) })).filter((x) => x.a) as { key: string; a: Dataset['attrs'][number] }[];
  const named = new Set(TEXT_PROPS.map(lower));
  const otherProps = d.attrs.filter((a) => !NOT_PROPS.has(lower(a.name)) && !named.has(lower(a.name)) && a !== event);
  const props = [...textProps, ...otherProps.map((a) => ({ key: a.name.replace(/[^A-Za-z0-9_]/g, ''), a }))].filter((p) => p.key);
  // The team, as the coalition, where it is the load's team column rather than a property.
  const coalitionFromTeam = !attrBy('Coalition') && !!d.teamId;

  // Object ids: Tacview's own where the track name ends in one, else made up.
  const ids = new Map<number, string>();
  const used = new Set<string>();
  d.personLabels.forEach((l, p) => {
    const m = /#([0-9a-f]+)$/i.exec(l ?? '');
    if (m && m[1] !== '0' && !used.has(m[1].toLowerCase())) {
      ids.set(p, m[1].toLowerCase());
      used.add(m[1].toLowerCase());
    }
  });
  let next = 0x1000;
  const idOf = (p: number) => {
    let id = ids.get(p);
    if (!id) {
      while (used.has(next.toString(16))) next++;
      id = (next++).toString(16);
      ids.set(p, id);
      used.add(id);
    }
    return id;
  };
  const recordingPerson = d.personLabels.findIndex((l) => l === '(recording)');

  const [lat0, lon0] = frame.latLon(d.px[0], d.py[0], d.pz[0]);
  const refLat = Math.round(lat0);
  const refLon = Math.round(lon0);
  const t0 = d.time[0];
  const out: string[] = ['FileType=text/acmi/tacview', 'FileVersion=2.2'];
  if (d.epochMs !== null) out.push(`0,ReferenceTime=${new Date(d.epochMs + t0 * 1000).toISOString().replace(/\.\d+Z$/, 'Z')}`);
  out.push(`0,ReferenceLongitude=${refLon}`, `0,ReferenceLatitude=${refLat}`, `0,DataSource=3DHeat`, `0,Title=${acmiValue(d.said ? say(d.said.name) : d.name)}`);
  const lastProps = new Map<number, Map<string, string>>();
  const gone = new Set<number>();
  let lastT = NaN;
  const fx = (v: number, n: number) => (Number.isFinite(v) ? Number(v.toFixed(n)).toString() : '');
  for (let r = 0; r < d.count; r++) {
    const t = d.time[r] - t0;
    const p = d.personId[r];
    const ev = event ? attrText(event, r) : '';
    if (!(Math.abs(t - lastT) <= 1e-4)) {
      out.push(`#${fx(t, 2)}`);
      lastT = t;
    }
    if (ev) {
      if (ev === 'Removed' && p !== recordingPerson) {
        out.push(`-${idOf(p)}`);
        gone.add(p);
        continue;
      }
      const colon = ev.indexOf(':');
      const kind = colon < 0 ? ev : ev.slice(0, colon);
      const text = colon < 0 ? '' : ev.slice(colon + 1).trim();
      const who = p === recordingPerson ? '' : `|${idOf(p)}`;
      out.push(`0,Event=${acmiValue(`${kind}${who}|${text}`)}`);
      continue;
    }
    if (p === recordingPerson) continue;
    gone.delete(p);
    const [lat, lon, h] = frame.latLon(d.px[r], d.py[r], d.pz[r]);
    const rl = roll ? (roll.data as Float32Array)[r] : NaN;
    const pt = d.pitch ? d.pitch[r] * deg : NaN;
    const yw = d.yaw ? (((d.yaw[r] * deg) % 360) + 360) % 360 : NaN;
    const T = d.pitch || d.yaw || roll ? `${fx(lon - refLon, 7)}|${fx(lat - refLat, 7)}|${fx(h, 2)}|${fx(rl, 1)}|${fx(pt, 1)}|${fx(yw, 1)}` : `${fx(lon - refLon, 7)}|${fx(lat - refLat, 7)}|${fx(h, 2)}`;
    let line = `${idOf(p)},T=${T}`;
    let mine = lastProps.get(p);
    if (!mine) lastProps.set(p, (mine = new Map()));
    const fields = props.map(({ key, a }) => ({ key, v: attrText(a, r) }));
    if (coalitionFromTeam) fields.push({ key: 'Coalition', v: d.teamLabels[d.teamId![r]] ?? '' });
    for (const { key, v } of fields) {
      if (mine.get(key) === v || (!v && !mine.has(key))) continue;
      mine.set(key, v);
      line += `,${key}=${acmiValue(v)}`;
    }
    out.push(line);
  }
  return out.join('\n') + '\n';
}
