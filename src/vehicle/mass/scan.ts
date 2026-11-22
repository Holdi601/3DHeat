/**
 * One match's hits on vehicles, read for the mass analysis (a DCS World
 * recording's: `scanAcmi.ts`; an IL-2 mission report's: `il2Report.ts`):
 * from a War Thunder table only the rows that are hits or what follows them (the
 * shots, deaths, fires lit, modules lost), only the columns the analysis
 * uses, and - for the turret's pose at each hit - the victims' turret yaw and
 * gun elevation from their own samples. Everything else in the file is never
 * decoded into rows.
 *
 * `extractHits` is the pure part (columns in, a `HitBlock` out), so it is
 * tested on made-up columns; `scanFile` reads a file with the browser's
 * Parquet reader or the native core's (`ParquetColumnReader`).
 */

import { parquetMetadataAsync } from 'hyparquet';
import { asyncBufferFromFile, type ColumnRequest } from '../../data/parquet';
import { readSelectedColumns, selectRows, type RowFilterClause } from '../../data/rowFilter';
import type { ParquetColumnReader } from '../../data/ingestParquet';
import { isContainer, openContainer } from '../../data/container';
import { partNumber } from '../plates';
import { ACMI_HIT_EVENTS, ACMI_NUMBER_COLUMNS, ACMI_TEXT_COLUMNS, extractAcmiHits, isAcmiTable } from './scanAcmi';
import { IL2_REPORT, il2Match, il2ReportHits } from './il2Report';
import {
  allocColumns,
  componentOf,
  EFFECT_BIT,
  FATAL_WINDOW,
  FIRE_WINDOW,
  FLAG_ATTACKER_AI,
  FLAG_DIR,
  FLAG_DIST,
  FLAG_LOCAL,
  FLAG_POSE,
  FLAG_RESULT_KNOWN,
  FLAG_VICTIM_AI,
  FLAG_WON,
  MODULE_WINDOW,
  NONE16,
  NONE8,
  R_CRIT,
  R_KILL,
  R_NONPEN,
  R_PEN,
  R_UNKNOWN,
  sliceColumns,
  type HitBlock,
  type HitMatch,
} from './types';

/** The events a hit load keeps: the hits themselves and what ties effects to them. */
export const HIT_EVENTS = ['shot', 'death', 'fire_on', 'module_destroyed'];
/** The columns it reads from those rows (those a file lacks are left out). */
export const HIT_NUMBER_COLUMNS = ['x', 'y', 'z', 'targetX', 'targetY', 'targetZ', 'hitLocalX', 'hitLocalY', 'hitLocalZ', 'hitDirX', 'hitDirY', 'hitDirZ', 'hitPart', 'calibre'];
export const HIT_TEXT_COLUMNS = ['event', 'Vehicle', 'player', 'team', 'life', 'other', 'otherVehicle', 'otherLife', 'hitOutcome', 'ammoType', 'ammoName', 'weapon', 'fireId', 'ai'];
/** And from the victims' own samples, for the turret's pose. */
export const POSE_NUMBER_COLUMNS = ['turretYaw', 'gunPitch'];
export const POSE_TEXT_COLUMNS = ['life', 'team', 'ai'];

/** A text column read as codes into its own list. */
export interface TextColumn {
  ids: Uint32Array;
  dict: string[];
}

/** The hit rows' columns, in file order; a column the file does not have is missing. */
export interface ScanColumns {
  rows: number;
  time: Float64Array;
  num: Partial<Record<string, Float32Array>>;
  txt: Partial<Record<string, TextColumn>>;
}

/** The victims' samples: their life, time, turret pose, team and whether the mission drove them. */
export interface PoseColumns {
  rows: number;
  time: Float64Array;
  num: Partial<Record<string, Float32Array>>;
  txt: Partial<Record<string, TextColumn>>;
}

const RESULT_OF: Record<string, number> = { nonpenetration: R_NONPEN, penetration: R_PEN, critical: R_CRIT, kill: R_KILL };

/** A small growing dictionary: code 0 is ''. */
class Dict {
  readonly list: string[] = [''];
  private readonly m = new Map<string, number>([['', 0]]);
  code(s: string): number {
    let c = this.m.get(s);
    if (c === undefined) {
      c = this.list.length;
      this.list.push(s);
      this.m.set(s, c);
    }
    return c;
  }
}

/** Whether a converter version is older than `want` (`0.2.3`); unknown versions are not. */
export function olderThan(version: string, want: string): boolean {
  if (!/^\d+(\.\d+)*$/.test(version.trim())) return false;
  const a = version.trim().split('.').map(Number), b = want.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return d < 0;
  }
  return false;
}

const q16 = (v: number, scale: number) => (Number.isFinite(v) ? Math.max(-32767, Math.min(32767, Math.round(v * scale))) : NONE16);
const q8 = (v: number) => (Number.isFinite(v) ? Math.max(-127, Math.min(127, Math.round(v * 127))) : NONE8);

/** The index of the sample of `times` (sorted) nearest `t`, or -1. */
function nearest(times: number[], t: number): number {
  if (!times.length) return -1;
  let lo = 0, hi = times.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] < t) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(times[lo - 1] - t) <= Math.abs(times[lo] - t)) lo--;
  return lo;
}

/**
 * The hits of one match from its rows. Effects are tied to a hit by the victim's life and the time: a fire listed
 * on it within `FIRE_WINDOW` (the server sends both at the hit's moment), a module lost within `MODULE_WINDOW`, its
 * death within `FATAL_WINDOW` by the hit's shooter (the shooter's last such hit is the killing shot).
 */
export function extractHits(c: ScanColumns, pose: PoseColumns | null, match: HitMatch, partNames: readonly string[] | null): Omit<HitBlock, 'rows' | 'kept' | 'ms' | 'native'> {
  const T = (name: string) => {
    const col = c.txt[name];
    return col ? (r: number) => col.dict[col.ids[r]] ?? '' : () => '';
  };
  const N = (name: string) => {
    const col = c.num[name];
    return col ? (r: number) => col[r] : () => NaN;
  };
  const event = T('event'), shooterVehicle = T('Vehicle'), player = T('player'), team = T('team'), life = T('life'), other = T('other');
  const otherVehicle = T('otherVehicle'), otherLife = T('otherLife'), outcome = T('hitOutcome');
  const ammoType = T('ammoType'), ammoName = T('ammoName'), weapon = T('weapon'), fireId = T('fireId'), ai = T('ai');
  const x = N('x'), y = N('y'), z = N('z'), tx = N('targetX'), ty = N('targetY'), tz = N('targetZ');
  const lx = N('hitLocalX'), ly = N('hitLocalY'), lz = N('hitLocalZ');
  const dx = N('hitDirX'), dy = N('hitDirY'), dz = N('hitDirZ'), part = N('hitPart'), calibre = N('calibre');
  // Before 0.2.3 a hit whose part number fits one byte had its point read a byte late: not where it struck.
  const lateOneByte = olderThan(match.converterVersion, '0.2.3');

  const vehicles = new Dict(), players = new Dict(), teams = new Dict(), types = new Dict(), names = new Dict();
  let shots = 0;
  for (let r = 0; r < c.rows; r++) if (event(r) === 'shot' && otherVehicle(r)) shots++;
  const out = allocColumns(shots);
  const lifeOfHit: string[] = new Array(shots);
  const deaths: { life: string; time: number; killer: string; team: string }[] = [];
  const fires: { life: string; time: number; name: string }[] = [];
  const modules: { life: string; time: number; part: number }[] = [];
  const teamSeen = new Set<string>();
  const teamOfLife = new Map<string, string>();
  let n = 0;
  for (let r = 0; r < c.rows; r++) {
    const ev = event(r);
    const t = c.time[r];
    const tm = team(r);
    if (tm) teamSeen.add(tm);
    if (ev === 'shot') {
      const vv = otherVehicle(r);
      if (!vv) continue;
      const i = n++;
      out.match[i] = 0;
      out.time[i] = t;
      out.victim[i] = vehicles.code(vv);
      out.attacker[i] = vehicles.code(shooterVehicle(r));
      out.victimPlayer[i] = players.code(other(r));
      out.attackerPlayer[i] = players.code(player(r));
      out.attackerTeam[i] = teams.code(tm);
      const w = part(r);
      out.part[i] = Number.isFinite(w) ? partNumber(w) : -1;
      let flags = 0;
      const trusted = !lateOneByte || !Number.isFinite(w) || (w & 0x80) !== 0;
      const px = lx(r), py = ly(r), pz = lz(r);
      if (trusted && Number.isFinite(px) && Number.isFinite(py) && Number.isFinite(pz)) {
        out.lx[i] = q16(px, 1000);
        out.ly[i] = q16(py, 1000);
        out.lz[i] = q16(pz, 1000);
        flags |= FLAG_LOCAL;
      } else out.lx[i] = out.ly[i] = out.lz[i] = NONE16;
      const ex = dx(r), ey = dy(r), ez = dz(r);
      const el = Math.hypot(ex, ey, ez);
      if (Number.isFinite(el) && el > 1e-6) {
        out.dx[i] = q8(ex / el);
        out.dy[i] = q8(ey / el);
        out.dz[i] = q8(ez / el);
        flags |= FLAG_DIR;
      } else out.dx[i] = out.dy[i] = out.dz[i] = NONE8;
      const sx = x(r), sy = y(r), sz = z(r), hx = tx(r), hy = ty(r), hz = tz(r);
      const d = Math.hypot(hx - sx, hy - sy, hz - sz);
      if (Number.isFinite(d)) {
        out.dist[i] = Math.min(0xfffe, Math.round(d * 4));
        out.dh[i] = q16(hy - sy, 4);
        flags |= FLAG_DIST;
      } else {
        out.dist[i] = 0xffff;
        out.dh[i] = NONE16;
      }
      out.yaw[i] = out.pitch[i] = NONE16;
      const cal = calibre(r);
      out.calibre[i] = Number.isFinite(cal) && cal > 0 ? Math.min(65535, Math.round(cal * 10)) : 0;
      out.ammoType[i] = Math.min(65535, types.code(ammoType(r)));
      out.ammoName[i] = Math.min(65535, names.code(ammoName(r)));
      const res = RESULT_OF[outcome(r)] ?? R_UNKNOWN;
      out.result[i] = res;
      let fx = 0;
      if (res === R_KILL) fx |= EFFECT_BIT.lethal;
      if (res >= R_CRIT) fx |= EFFECT_BIT.critical;
      out.effects[i] = fx;
      if (ai(r) === 'true' || ai(r) === '1') flags |= FLAG_ATTACKER_AI;
      out.flags[i] = flags;
      lifeOfHit[i] = otherLife(r) || `name:${other(r)}`;
    } else if (ev === 'death') {
      const lf = life(r) || `name:${player(r)}`;
      deaths.push({ life: lf, time: t, killer: other(r), team: tm });
      if (tm) teamOfLife.set(lf, tm);
    } else if (ev === 'fire_on') {
      const id = fireId(r);
      const g = Number(id.slice(id.indexOf(':') + 1));
      fires.push({ life: life(r) || `name:${player(r)}`, time: t, name: partNames && Number.isInteger(g) ? (partNames[g] ?? '') : '' });
    } else if (ev === 'module_destroyed') {
      const m = /^part (\d+)$/.exec(weapon(r));
      modules.push({ life: life(r) || `name:${player(r)}`, time: t, part: m ? Number(m[1]) : -1 });
    }
  }

  // The hits on each life, in time order: what deaths, fires and modules are tied to.
  const byLife = new Map<string, number[]>();
  for (let i = 0; i < n; i++) {
    const k = lifeOfHit[i];
    let l = byLife.get(k);
    if (!l) byLife.set(k, (l = []));
    l.push(i);
  }
  for (const l of byLife.values()) l.sort((a, b) => out.time[a] - out.time[b]);
  const latestBefore = (lf: string, t: number, window: number): number => {
    const l = byLife.get(lf);
    if (!l) return -1;
    let best = -1;
    for (const i of l) {
      const ti = out.time[i];
      if (ti > t + 0.02) break;
      if (ti >= t - window) best = i;
    }
    return best;
  };
  for (const d of deaths) {
    const l = byLife.get(d.life);
    if (!l) continue;
    let last = -1;
    for (const i of l) {
      const ti = out.time[i];
      if (ti > d.time + 0.2) break;
      if (ti < d.time - FATAL_WINDOW) continue;
      if (d.killer && players.list[out.attackerPlayer[i]] !== d.killer) continue;
      out.effects[i] |= EFFECT_BIT.lethal;
      last = i;
    }
    if (last >= 0) out.effects[last] |= EFFECT_BIT.killingShot | EFFECT_BIT.lethal;
  }
  for (const f of fires) {
    const i = latestBefore(f.life, f.time, FIRE_WINDOW);
    if (i < 0) continue;
    out.effects[i] |= EFFECT_BIT.fire;
    const comp = f.name ? componentOf(f.name) : null;
    if (comp) out.effects[i] |= EFFECT_BIT[comp];
  }
  for (const m of modules) {
    const i = latestBefore(m.life, m.time, MODULE_WINDOW);
    if (i < 0) continue;
    out.effects[i] |= EFFECT_BIT.module;
    const name = partNames && m.part >= 0 ? (partNames[m.part] ?? '') : '';
    const comp = name ? componentOf(name) : null;
    if (comp) out.effects[i] |= EFFECT_BIT[comp];
  }

  // The victims' own samples: the turret's pose at each hit, their team and whether the mission drove them.
  const aiOfLife = new Map<string, boolean>();
  // Turrets of server replays of game version 101421 on, converted before 0.2.1, were read off (`figures/aim.ts`).
  const poseTrusted = !(olderThan(match.converterVersion, '0.2.1') && Number(match.gameVersion) >= 101421);
  if (pose && pose.rows) {
    const pl = pose.txt.life, pt = pose.txt.team, pa = pose.txt.ai;
    const yawCol = pose.num.turretYaw, pitchCol = pose.num.gunPitch;
    const wanted = new Set(byLife.keys());
    const samples = new Map<string, { t: number[]; yaw: number[]; pitch: number[] }>();
    for (let r = 0; r < pose.rows; r++) {
      const lf = pl ? pl.dict[pl.ids[r]] : '';
      if (!lf || !wanted.has(lf)) continue;
      if (pt && !teamOfLife.has(lf)) {
        const tm = pt.dict[pt.ids[r]];
        if (tm) teamOfLife.set(lf, tm);
      }
      if (pa && !aiOfLife.has(lf)) aiOfLife.set(lf, pa.dict[pa.ids[r]] === 'true');
      const yv = yawCol && poseTrusted ? yawCol[r] : NaN;
      if (!Number.isFinite(yv)) continue;
      let s = samples.get(lf);
      if (!s) samples.set(lf, (s = { t: [], yaw: [], pitch: [] }));
      s.t.push(pose.time[r]);
      s.yaw.push(yv);
      s.pitch.push(pitchCol ? pitchCol[r] : NaN);
    }
    for (const [lf, l] of byLife) {
      const s = samples.get(lf);
      if (!s) continue;
      // Samples in time order (a converter writes them so; checked, not assumed).
      let sorted = true;
      for (let k = 1; k < s.t.length; k++) if (s.t[k] < s.t[k - 1]) sorted = false;
      if (!sorted) {
        const ord = s.t.map((_, k) => k).sort((a, b) => s.t[a] - s.t[b]);
        s.t = ord.map((k) => s.t[k]);
        s.yaw = ord.map((k) => s.yaw[k]);
        s.pitch = ord.map((k) => s.pitch[k]);
      }
      for (const i of l) {
        const k = nearest(s.t, out.time[i]);
        if (k < 0 || Math.abs(s.t[k] - out.time[i]) > 2) continue;
        // Degrees as the converter writes them (`turretYaw`, `gunPitch`), radians here.
        out.yaw[i] = q16((s.yaw[k] * Math.PI) / 180, 1e4);
        out.pitch[i] = Number.isFinite(s.pitch[k]) ? q16((s.pitch[k] * Math.PI) / 180, 1e4) : 0;
        out.flags[i] |= FLAG_POSE;
      }
    }
  }
  // The victim's side: its own rows', else the other of two sides.
  const sides = [...teamSeen];
  for (let i = 0; i < n; i++) {
    const lf = lifeOfHit[i];
    let tm = teamOfLife.get(lf) ?? '';
    if (!tm && sides.length === 2) {
      const at = teams.list[out.attackerTeam[i]];
      tm = at === sides[0] ? sides[1] : at === sides[1] ? sides[0] : '';
    }
    out.victimTeam[i] = teams.code(tm);
    if (aiOfLife.get(lf)) out.flags[i] |= FLAG_VICTIM_AI;
    if (match.winner) {
      out.flags[i] |= FLAG_RESULT_KNOWN;
      if (tm && tm === match.winner) out.flags[i] |= FLAG_WON;
    }
  }
  const cols = n === shots ? out : sliceColumns(out, n);
  return { cols, vehicles: vehicles.list, players: players.list, teams: teams.list, ammoTypes: types.list, ammoNames: names.list, match };
}

/** How a file's columns are read: here, or by the native core. */
export type ReaderFor = (table: File) => ParquetColumnReader | null;

/** Reads the columns of `wanted` that `available` has, for the rows `clauses` keep. */
async function readColumns(
  table: File,
  metadata: Awaited<ReturnType<typeof parquetMetadataAsync>>,
  available: Set<string>,
  clauses: RowFilterClause[],
  numbers: string[],
  texts: string[],
  reader: ParquetColumnReader | null,
  timeColumn = 'time',
): Promise<ScanColumns> {
  const buf = asyncBufferFromFile(table);
  let count: number;
  let sel: Awaited<ReturnType<typeof selectRows>> | null = null;
  const nums = numbers.filter((c) => available.has(c));
  const txts = texts.filter((c) => available.has(c));
  if (reader) count = (await reader.count(clauses)).count;
  else {
    sel = await selectRows(buf, metadata, clauses, [timeColumn, ...nums, ...txts]);
    count = sel.count;
  }
  const time = new Float64Array(count);
  const requests: ColumnRequest[] = [{ name: timeColumn, numbers: time }];
  const num: ScanColumns['num'] = {};
  const txt: ScanColumns['txt'] = {};
  for (const c of nums) requests.push({ name: c, numbers: (num[c] = new Float32Array(count)) });
  for (const c of txts) {
    const d = new Dict();
    const ids = new Uint32Array(count);
    txt[c] = { ids, dict: d.list };
    requests.push({ name: c, ids, intern: (s) => d.code(s) });
  }
  if (count > 0) {
    if (reader) await reader.read(requests, clauses, false, () => {});
    else await readSelectedColumns(sel!, requests);
  }
  return { rows: count, time, num, txt };
}

/** What a container's manifest and match document say of the match. */
async function matchOf(file: File, index: number): Promise<{ match: HitMatch; table: File | null; effects: () => Promise<File | null> }> {
  const stem = file.name.replace(/\.(3dheat|parquet)$/i, '');
  const base: HitMatch = { id: stem, file: index, map: '', mode: '', started: NaN, gameVersion: '', converterVersion: '', winner: '' };
  if (!isContainer(file.name)) return { match: base, table: file, effects: async () => null };
  const c = await openContainer(file);
  const m = c.manifest;
  const econ = (m.extensions?.['heat3d/economy'] ?? null) as { winnerTeam?: string } | null;
  let winner = typeof econ?.winnerTeam === 'string' ? econ.winnerTeam : '';
  let gameVersion = '';
  try {
    const doc = (await c.json('match')) as { replayVersion?: unknown; result?: { winner?: unknown } } | null;
    if (doc && doc.replayVersion !== undefined && doc.replayVersion !== null) gameVersion = String(doc.replayVersion);
    if (!winner && typeof doc?.result?.winner === 'string') winner = doc.result.winner;
  } catch {
    // A match document that cannot be read leaves the version unknown.
  }
  return {
    match: {
      ...base,
      id: m.match ?? stem,
      map: m.map ?? '',
      mode: m.mode ?? '',
      started: m.started ? Date.parse(m.started) : NaN,
      gameVersion,
      converterVersion: m.converter?.version ?? '',
      winner,
    },
    table: c.table,
    // A Tacview recording's shells, bullets and flares, kept apart by the converter (`effects`).
    effects: () => c.member('effects').catch(() => null),
  };
}

/** Whether a file is an IL-2 mission report (or the pieces of one, read together: `groupIl2Reports`). */
export function isIl2Report(name: string): boolean {
  return IL2_REPORT.test(name);
}

/**
 * One file's hits: a container or a loose table (War Thunder, a DCS World recording converted), or an IL-2 mission
 * report. Null when it has no hits on vehicles.
 */
export async function scanFile(file: File, index: number, partNames: readonly string[] | null, opts: { pose: boolean; readerFor?: ReaderFor }): Promise<HitBlock | null> {
  const t0 = performance.now();
  if (isIl2Report(file.name)) {
    const text = await file.text();
    const block = il2ReportHits(text, il2Match(text, file.name, index));
    if (!block.cols.n) return null;
    return { ...block, rows: text.length, kept: block.cols.n, ms: performance.now() - t0, native: false };
  }
  const { match, table, effects } = await matchOf(file, index);
  if (!table) return null;
  const metadata = await parquetMetadataAsync(asyncBufferFromFile(table));
  const available = new Set(metadata.schema.slice(1).map((e) => e.name));
  if (isAcmiTable(available)) {
    const reader = opts.readerFor?.(table) ?? null;
    const clause: RowFilterClause[] = [{ column: 'Event', kind: 'set', values: ACMI_HIT_EVENTS }];
    const main = await readColumns(table, metadata, available, clause, ACMI_NUMBER_COLUMNS, ACMI_TEXT_COLUMNS, reader, 'Time');
    const parts = [main];
    let rows = Number(metadata.num_rows);
    const fx = await effects();
    if (fx) {
      const m2 = await parquetMetadataAsync(asyncBufferFromFile(fx));
      const a2 = new Set(m2.schema.slice(1).map((e) => e.name));
      if (a2.has('Event')) {
        parts.push(await readColumns(fx, m2, a2, clause, ACMI_NUMBER_COLUMNS, ACMI_TEXT_COLUMNS, null, 'Time'));
        rows += Number(m2.num_rows);
      }
    }
    const block = extractAcmiHits(parts, match);
    if (!block.cols.n) return null;
    return { ...block, rows, kept: parts.reduce((a, p) => a + p.rows, 0), ms: performance.now() - t0, native: reader !== null };
  }
  if (!available.has('event') || !available.has('otherVehicle') || !available.has('time')) return null;
  const reader = opts.readerFor?.(table) ?? null;
  const rows = Number(metadata.num_rows);
  const hits = await readColumns(table, metadata, available, [{ column: 'event', kind: 'set', values: HIT_EVENTS }], HIT_NUMBER_COLUMNS, HIT_TEXT_COLUMNS, reader);
  let pose: PoseColumns | null = null;
  if (opts.pose && available.has('turretYaw') && available.has('life') && hits.rows > 0) {
    // Only the samples of the lives that were hit.
    const lives = new Set<string>();
    const ol = hits.txt.otherLife, ev = hits.txt.event;
    if (ol && ev) for (let r = 0; r < hits.rows; r++) if (ev.dict[ev.ids[r]] === 'shot' && ol.dict[ol.ids[r]]) lives.add(ol.dict[ol.ids[r]]);
    if (lives.size) {
      pose = await readColumns(table, metadata, available, [{ column: 'event', kind: 'set', values: ['position'] }, { column: 'life', kind: 'set', values: [...lives] }], POSE_NUMBER_COLUMNS, POSE_TEXT_COLUMNS, reader);
    }
  }
  const block = extractHits(hits, pose, match, partNames);
  if (!block.cols.n) return null;
  return { ...block, rows, kept: hits.rows + (pose?.rows ?? 0), ms: performance.now() - t0, native: reader !== null };
}
