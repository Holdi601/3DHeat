/**
 * One match's summary (`types.ts`) from its table, in one streaming pass a
 * row group at a time: the same in Node (`tools/3dheat-summarize.mjs`, over a
 * file's byte range) and in the browser (a worker, over a `File` slice).
 *
 * Columns are found the way the many-match loader finds them (`leanSpec`:
 * time, position, unit, team, event) and the rest the way `data/canonical.ts`
 * reads them (vehicle names and types, player or AI, the other party), so a
 * summary counts what the loaded rows would show.
 */

import { parquetMetadataAsync, parquetRead, parquetReadObjects, type AsyncBuffer, type Compressors, type FileMetaData } from 'hyparquet';
import { decompress as zstd } from 'fzstd';
import { EVENT_KINDS, VEHICLE_CLASSES, eventKindOf, vehicleClassOf } from '../data/canonical';
import { parseValueColumn } from '../data/costs/columns';
import { leanSpec } from '../overlay/lean/spec';
import type { Columns, LeanSpec } from '../overlay/lean/scan';
import {
  BANDS, GRID_CELLS, GRID_KINDS, HEIGHT_EDGES, MAX_PLAYERS, SLICE_CELLS, MAX_TEAMS, MAX_WEAPONS, MINUTE_BINS, MINUTE_SECONDS, PHASE_BINS, PRESENCE_GAP, SUMMARY_FORMAT, SUMMARY_VERSION,
  type EventCounts, type MatchSummary, type PlayerStat, type SummaryGrid, type TeamStat, type VehicleStat,
} from './types';
import { analyseMatch } from '../insights/maneuver/analyse';
import { ManeuverCollector } from '../insights/maneuver/collect';
import { CqbCollector } from '../insights/cqb/summary';
import { maneuverSection } from '../insights/maneuver/summary';
import type { EvKind, ManeuverMatch } from '../insights/maneuver/types';

export const COMPRESSORS: Compressors = { ZSTD: (input, outputLength) => zstd(input, new Uint8Array(outputLength)) };

/** What is known of the match besides its table: the container's manifest and match document. */
export interface SummaryInfo {
  id: string;
  manifest?: { game?: string | null; map?: string | null; mode?: string | null; started?: string | null; match?: string | null } | null;
  /** The match document (`<match>.match.json`), when there is one. */
  doc?: Record<string, unknown> | null;
  by?: string;
  /** Handed the match's movement analysis in full (the summary keeps only its counts). */
  onManeuvers?: (m: ManeuverMatch | null) => void;
}

/** The canonical events the movement analysis reads (`insights/maneuver`). */
const MV_KIND: Record<string, EvKind> = { kill: 'kill', death: 'death', destroyed: 'death', crash: 'death', fire: 'fire', launch: 'launch', hit: 'hit', capture: 'capture' };

const NAME_KEY = /^(vehicle|unit.?type|model|aircraft|plane|tank|ship|craft|name)$/i;
const NAME_LABEL = /^(vehicle.?name|display.?name)$/i;
const TYPE_COLUMN = /^(type|class|kind|category|vehicle.?type|vehicle.?class)$/i;
const AI_COLUMN = /^(ai|is.?ai|bot|is.?bot|actor)$/i;
const PLAYER_FLAG = /^(is.?player|human)$/i;
const USER_ID = /^(user.?id|steam.?id|account.?id)$/i;
const PLAYER_NAME = /^(player|pilot|callsign|player.?name)$/i;
const GROUP = /^group$/i;
const WEAPON = [/^weapon.?name$/i, /^weapon$/i];
const OTHER_NAME = /^(other.?vehicle|target.?vehicle|victim.?vehicle)$/i;
const OTHER_TYPE = /^(other.?type|target.?type|victim.?type)$/i;
const ACTOR_REF = /^(shooter|launcher|attacker|killer)$/i;
const WON = /^won$/i;
const TIER = /^(br|battle.?rating|tier|era)$/i;
const MISSION = /^(recording|scenario)$/i;
const FLOOR = /^(floor|storey|story|deck)$/i;
const TRUE = /^(1|1\.0|true|yes|y|ai|bot)$/i;
const FALSE = /^(0|0\.0|false|no|n|player|human)$/i;
const STATIC_TYPE = /(^|\+)(Sea|Watercraft|Static|Building|Bullseye|Navaid)(\+|$)/i;
const GROUND_TYPE = /^Ground\+/;

/** Events credited to whoever the row names as its doer (a Tacview weapon's shooter), not the row's own unit. */
const BY_ACTOR = new Set(['kill', 'hit', 'launch', 'fire', 'miss']);
/** One end a unit: a second report of it within this many seconds is the same one (War Thunder's `dead` and `death`). */
const DEATH_TWICE = 0.5;
const DEATHS = new Set(['death', 'destroyed', 'crash']);
const WEAPON_KINDS = new Set(['kill', 'hit', 'launch', 'fire', 'miss', 'damage']);
/** Cells held while counting before the grid is made coarser. */
const MAX_CELLS = 200_000;
/** Rows read at once from a row group larger than this. */
const READ_ROWS = 400_000;

const EV = EVENT_KINDS.length;
const KIND_OF = new Map<string, number>(EVENT_KINDS.map((k, i) => [k, i]));
const POSITION = KIND_OF.get('position')!;
const GRID_OF = new Int8Array(EV).fill(-1);
GRID_KINDS.forEach((k, i) => (GRID_OF[KIND_OF.get(k)!] = i));
const K = GRID_KINDS.length;
const C = VEHICLE_CLASSES.length;
const CLS_OF = new Map<string, number>(VEHICLE_CLASSES.map((c, i) => [c, i]));
const SLOTS = MAX_TEAMS + 1;
const B = BANDS;
/** One event key's span past its cell: kind, team slot, class, band. */
const SPAN = K * SLOTS * C * B;
/** Slice keys: coarse cell offset, minutes, and kinds plus presence. */
const SO = 2 ** 19;
const SK = K + 1;

function text(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

/** The smallest power of two at least `v` (2^-8 at least). */
export function pow2At(v: number): number {
  if (!(v > 0)) return 1;
  return Math.max(2 ** -8, 2 ** Math.ceil(Math.log2(v) - 1e-9));
}

interface Unit {
  team: number;
  /** 0 unknown, 1 player, 2 AI. */
  actor: number;
  player: string;
  pname: string;
  veh: number;
  tier: string | null;
  lastT: number;
  lastX: number;
  lastY: number;
  lastZ: number;
  lastDeath: number;
  presence: number;
  ev: Float64Array;
  vs: Float64Array | null;
  val: Float64Array;
  wonSum: number;
  wonN: number;
}

/** Leaf column names of a Parquet file. */
export function leafColumns(md: FileMetaData): string[] {
  return md.schema.slice(1).filter((e) => !e.num_children).map((e) => e.name);
}

function display(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/** Which column is which, from the footer and the first rows (as the many-match loader asks it). */
export async function specOf(file: AsyncBuffer, md: FileMetaData): Promise<LeanSpec | null> {
  const columns = leafColumns(md);
  const n = Math.min(50, Number(md.num_rows));
  const sample = (await parquetReadObjects({ file, metadata: md, rowStart: 0, rowEnd: n, compressors: COMPRESSORS })) as Record<string, unknown>[];
  const rows = sample.map((r) => columns.map((c) => display(r[c])));
  const el = (c: string) => md.schema.find((e) => e.name === c);
  const numeric = columns.map((c) => {
    const e = el(c);
    return !!e && ['FLOAT', 'DOUBLE', 'INT32', 'INT64', 'BOOLEAN'].includes(String(e.type)) && (!e.converted_type || /^U?INT_/.test(String(e.converted_type)));
  });
  const timestamps = columns.filter((c) => {
    const e = el(c);
    const lt = e?.logical_type as { type?: string } | undefined;
    return !!e && ((!!lt?.type && /TIMESTAMP|DATE/i.test(lt.type)) || (!!e.converted_type && /TIMESTAMP|DATE/i.test(String(e.converted_type))));
  });
  const hints = md.key_value_metadata?.find((kv) => kv.key === 'heat3d')?.value ?? null;
  const r = leanSpec({ columns, rows, numeric, hints, timestamps });
  return r.ok ? r.spec : null;
}

/** The columns besides the spec's that the summary reads, by part. */
export interface SummaryColumns {
  names: string[];
  label: string | null;
  types: string[];
  ai: string | null;
  flag: string | null;
  uid: string | null;
  pname: string | null;
  group: string | null;
  weapon: string | null;
  otherName: string | null;
  otherType: string | null;
  actorRef: string | null;
  won: string | null;
  tier: string | null;
  mission: string | null;
  floor: string | null;
  values: { name: string; currency: string; flow: string }[];
  /** The close-quarters collector's columns (`insights/cqb/summary.ts`); empty without a round column. */
  cqb: string[];
}

export function summaryColumns(columns: string[], numeric: (c: string) => boolean, spec: LeanSpec): SummaryColumns {
  const taken = new Set([spec.time, spec.x, spec.y, spec.z, spec.track, spec.team, spec.event].filter(Boolean));
  const free = columns.filter((c) => !taken.has(c));
  const one = (re: RegExp, num?: boolean) => free.find((c) => re.test(c.trim()) && (num === undefined || numeric(c) === num)) ?? null;
  // Vehicle names: `vehicle` before `name` (a player's name is never a vehicle's).
  const names = free.filter((c) => NAME_KEY.test(c.trim()) && !numeric(c)).sort((a, b) => Number(/^name$/i.test(a)) - Number(/^name$/i.test(b)));
  const values = free.flatMap((c) => {
    const v = numeric(c) ? parseValueColumn(c) : null;
    return v ? [{ name: c, currency: v.currency, flow: v.flow }] : [];
  });
  const cqb = CqbCollector.columnsOf(spec, columns);
  return {
    names: names.slice(0, 2),
    label: one(NAME_LABEL, false),
    types: free.filter((c) => TYPE_COLUMN.test(c.trim()) && !numeric(c)).slice(0, 2),
    ai: one(AI_COLUMN),
    flag: one(PLAYER_FLAG),
    uid: one(USER_ID),
    pname: one(PLAYER_NAME, false),
    group: one(GROUP, false),
    weapon: WEAPON.map((re) => one(re, false)).find(Boolean) ?? null,
    otherName: one(OTHER_NAME, false),
    otherType: one(OTHER_TYPE, false),
    actorRef: one(ACTOR_REF, false),
    won: one(WON, true),
    tier: one(TIER),
    mission: one(MISSION, false),
    floor: one(FLOOR, true),
    values,
    cqb,
  };
}

/**
 * The summary of one match, fed its rows in any number of chunks (each the
 * spec's and `SummaryColumns`' columns over the same rows), finished once.
 */
export class SummaryBuilder {
  private readonly units: Unit[] = [];
  private readonly unitOf = new Map<string, number>();
  private readonly teamNames: string[] = [];
  private readonly teamOf = new Map<string, number>();
  private readonly vehKey: string[] = [];
  private readonly vehLabel: string[] = [];
  private readonly vehCls: number[] = [];
  private readonly vehOf = new Map<string, number>();
  private readonly classMemo = new Map<string, number>();
  private readonly kindMemo = new Map<string, number>();
  private readonly weapons = new Map<string, Float64Array>();
  private readonly events = new Float64Array(EV);
  private readonly valTotal: Float64Array;
  private readonly V: number;
  // Grid: cells in a hash, values in growing arrays.
  private cell = 0;
  private cellOf = new Map<number, number>();
  private cix: number[] = [];
  private ciz: number[] = [];
  private cp = new Float64Array(1024);
  private cpt = new Float64Array(1024 * SLOTS);
  private cy = new Float64Array(1024);
  private cfx = new Float64Array(1024);
  private cfz = new Float64Array(1024);
  private cy0 = new Float64Array(1024).fill(Infinity);
  private cev = new Map<number, number>();
  private rebinning = false;
  /** Presence by class `[cell * C + class]` and by band `[cell * B + band]`. */
  private cpc = new Map<number, number>();
  private cph = new Map<number, number>();
  /** Time slices: `((cx * 2^20 + cz) * MINUTE_BINS + minute) * SK + kind`, coarse cells offset by `SO`. */
  private cts = new Map<number, number>();
  private yFloor = 0;
  private upm = 1;
  // Phases: event kind (grid index) and time, for every counted event.
  private phK: number[] = [];
  private phT: number[] = [];
  private tMin = Infinity;
  private tMax = -Infinity;
  private rows = 0;
  private mission: string | null = null;
  private readonly started = performance.now();
  /** Tracks and events for the movement analysis (`insights/maneuver`). */
  private readonly mv = new ManeuverCollector(1);
  /** Duels, rounds and entries for the close-quarters counts (`insights/cqb`), where the data has rounds. */
  private readonly cqb: CqbCollector | null;

  constructor(
    readonly spec: LeanSpec,
    readonly cols: SummaryColumns,
    readonly info: SummaryInfo,
  ) {
    this.V = cols.values.length;
    this.valTotal = new Float64Array(this.V);
    this.cqb = cols.cqb.length && spec.event && spec.team ? new CqbCollector(spec, cols.cqb) : null;
  }

  /** Every column the builder reads. */
  static columnsOf(spec: LeanSpec, c: SummaryColumns): string[] {
    const list = [spec.time, spec.x, spec.y, spec.z, spec.track, spec.team, spec.event, ...c.names, c.label, ...c.types, c.ai, c.flag, c.uid, c.pname, c.group, c.weapon, c.otherName, c.otherType, c.actorRef, c.won, c.tier, c.floor, ...c.values.map((v) => v.name), ...c.cqb];
    return [...new Set(list.filter((x): x is string => !!x))];
  }

  private kindOf(label: string): number {
    let k = this.kindMemo.get(label);
    if (k === undefined) this.kindMemo.set(label, (k = KIND_OF.get(eventKindOf(label)) ?? KIND_OF.get('other')!));
    return k;
  }

  private classOf(names: string[], types: string[]): number {
    const key = names.join('\u0001') + '\u0002' + types.join('\u0001');
    let c = this.classMemo.get(key);
    if (c === undefined) this.classMemo.set(key, (c = CLS_OF.get(vehicleClassOf(names, types)) ?? C - 1));
    return c;
  }

  private teamSlot(name: string): number {
    if (!name) return MAX_TEAMS;
    let s = this.teamOf.get(name);
    if (s === undefined) {
      s = Math.min(this.teamNames.length, MAX_TEAMS - 1);
      if (this.teamNames.length < MAX_TEAMS) this.teamNames.push(name);
      this.teamOf.set(name, s);
    }
    return s;
  }

  // ---- grid

  private cellIndex(x: number, z: number): number {
    if (this.cell === 0) return -1;
    const ix = Math.floor(x / this.cell);
    const iz = Math.floor(z / this.cell);
    if (Math.abs(ix) >= 2 ** 25 || Math.abs(iz) >= 2 ** 25) return -1;
    const key = (ix + 2 ** 25) * 2 ** 26 + (iz + 2 ** 25);
    let i = this.cellOf.get(key);
    if (i === undefined) {
      if (this.cix.length >= MAX_CELLS && !this.rebinning) {
        this.rebin(2);
        return this.cellIndex(x, z);
      }
      i = this.cix.length;
      this.cellOf.set(key, i);
      this.cix.push(ix);
      this.ciz.push(iz);
      if (i >= this.cp.length) this.grow();
    }
    return i;
  }

  private grow(): void {
    const n = this.cp.length * 2;
    const g = (a: Float64Array, m = 1) => {
      const b = new Float64Array(n * m);
      b.set(a);
      return b;
    };
    this.cp = g(this.cp);
    this.cpt = g(this.cpt, SLOTS);
    this.cy = g(this.cy);
    this.cfx = g(this.cfx);
    this.cfz = g(this.cfz);
    const y0 = new Float64Array(n).fill(Infinity);
    y0.set(this.cy0);
    this.cy0 = y0;
  }

  /** The grid `f` times coarser: cells summed into their parents. */
  private rebin(f: number): void {
    const old = { ix: this.cix, iz: this.ciz, p: this.cp, pt: this.cpt, y: this.cy, y0: this.cy0, fx: this.cfx, fz: this.cfz, ev: this.cev, pc: this.cpc, ph: this.cph, ts: this.cts };
    this.rebinning = true;
    this.cell *= f;
    this.cellOf = new Map();
    this.cix = [];
    this.ciz = [];
    const cap = Math.max(1024, old.ix.length);
    this.cp = new Float64Array(cap);
    this.cpt = new Float64Array(cap * SLOTS);
    this.cy = new Float64Array(cap);
    this.cy0 = new Float64Array(cap).fill(Infinity);
    this.cfx = new Float64Array(cap);
    this.cfz = new Float64Array(cap);
    this.cev = new Map();
    this.cpc = new Map();
    this.cph = new Map();
    this.cts = new Map();
    const to = new Int32Array(old.ix.length);
    for (let i = 0; i < old.ix.length; i++) {
      const j = this.cellIndex((Math.floor(old.ix[i] / f) + 0.5) * this.cell, (Math.floor(old.iz[i] / f) + 0.5) * this.cell);
      to[i] = j;
      this.cp[j] += old.p[i];
      this.cy[j] += old.y[i];
      this.cy0[j] = Math.min(this.cy0[j], old.y0[i]);
      this.cfx[j] += old.fx[i];
      this.cfz[j] += old.fz[i];
      for (let s = 0; s < SLOTS; s++) this.cpt[j * SLOTS + s] += old.pt[i * SLOTS + s];
    }
    const remap = (from: Map<number, number>, into: Map<number, number>, span: number) => {
      for (const [key, n] of from) {
        const k = to[Math.floor(key / span)] * span + (key % span);
        into.set(k, (into.get(k) ?? 0) + n);
      }
    };
    remap(old.ev, this.cev, SPAN);
    remap(old.pc, this.cpc, C);
    remap(old.ph, this.cph, B);
    for (const [key, n] of old.ts) {
      const rest = key % (MINUTE_BINS * SK);
      const cc = Math.floor(key / (MINUTE_BINS * SK));
      const cx = Math.floor((Math.floor(cc / 2 ** 20) - SO) / f) + SO;
      const cz = Math.floor(((cc % 2 ** 20) - SO) / f) + SO;
      const k = (cx * 2 ** 20 + cz) * MINUTE_BINS * SK + rest;
      this.cts.set(k, (this.cts.get(k) ?? 0) + n);
    }
    this.rebinning = false;
  }

  /** A time slice's count: coarse cell of `x, z`, the minute from the match's first row, the kind (`K` for presence). */
  private slice(x: number, z: number, t: number, kind: number, v: number): void {
    const cc = this.cell * SLICE_CELLS;
    const cx = Math.floor(x / cc) + SO;
    const cz = Math.floor(z / cc) + SO;
    if (cx < 0 || cz < 0 || cx >= 2 ** 20 || cz >= 2 ** 20) return;
    const m = Math.max(0, Math.min(MINUTE_BINS - 1, Math.floor((t - this.tMin) / MINUTE_SECONDS)));
    const k = ((cx * 2 ** 20 + cz) * MINUTE_BINS + m) * SK + kind;
    this.cts.set(k, (this.cts.get(k) ?? 0) + v);
  }

  /** The height band of a row: its floor where the data has floors, else its height above the match floor. */
  private band(y: number, floor: number): number {
    if (this.cols.floor) return Number.isFinite(floor) ? Math.max(0, Math.min(B - 1, Math.round(floor))) : 0;
    const h = (y - this.yFloor) / this.upm;
    let b = 0;
    while (b < HEIGHT_EDGES.length && h >= HEIGHT_EDGES[b]) b++;
    return b;
  }

  /** The first cell size: the middle of the first chunk's positions over 1,024 cells. */
  private startGrid(x: Float64Array, y: Float64Array, z: Float64Array, n: number): void {
    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[] = [];
    const step = Math.max(1, Math.floor(n / 4000));
    for (let i = 0; i < n; i += step)
      if (Number.isFinite(x[i]) && Number.isFinite(z[i])) {
        xs.push(x[i]);
        zs.push(z[i]);
        if (Number.isFinite(y[i])) ys.push(y[i]);
      }
    if (xs.length < 2) return;
    xs.sort((a, b) => a - b);
    ys.sort((a, b) => a - b);
    zs.sort((a, b) => a - b);
    const q = (a: number[], f: number) => a[Math.min(a.length - 1, Math.floor(f * a.length))];
    const ext = Math.max(q(xs, 0.98) - q(xs, 0.02), q(zs, 0.98) - q(zs, 0.02), 1e-3);
    this.cell = pow2At(ext / 1024);
    this.yFloor = ys.length ? q(ys, 0.01) : 0;
    this.upm = Math.max(1e-6, (this.spec.units || 1) * (this.spec.axes.scale || 1));
  }

  // ---- rows

  private unitFor(key: string, team: string, r: number, c: Columns): number {
    let u = this.unitOf.get(key);
    if (u !== undefined) return u;
    u = this.units.length;
    this.unitOf.set(key, u);
    this.units.push({
      team: this.teamSlot(team),
      actor: this.actorAt(r, c),
      player: '',
      pname: '',
      veh: -1,
      tier: null,
      lastT: NaN,
      lastX: 0,
      lastY: 0,
      lastZ: 0,
      lastDeath: -Infinity,
      presence: 0,
      ev: new Float64Array(EV),
      vs: null,
      val: new Float64Array(this.V),
      wonSum: 0,
      wonN: 0,
    });
    return u;
  }

  /** Player (1), AI (2) or unknown (0), from the row's own columns (as `data/canonical.ts` reads them). */
  private actorAt(r: number, c: Columns): number {
    const s = this.cols;
    const v = (name: string | null) => (name ? text(c[name]?.[r]).trim() : '');
    if (s.ai) {
      const a = v(s.ai);
      if (TRUE.test(a)) return 2;
      if (FALSE.test(a)) return 1;
    }
    if (s.flag) {
      const a = v(s.flag);
      if (TRUE.test(a)) return 1;
      if (FALSE.test(a)) return 2;
    }
    if (s.uid) {
      const a = v(s.uid);
      return a && a !== '0' ? 1 : 2;
    }
    if (s.pname && s.group) {
      const p = v(s.pname).toLowerCase();
      if (!p) return 0;
      // Ships, ground units and fixed objects are the mission's (Tacview's `Ground+`, `Sea+`), whatever their pilot field says.
      if (s.types.some((t) => STATIC_TYPE.test(v(t)) || GROUND_TYPE.test(v(t)))) return 2;
      const g = v(s.group).toLowerCase();
      const nm = s.names.length ? v(s.names[0]).toLowerCase() : '';
      return (g && p.startsWith(g)) || p === nm ? 2 : 1;
    }
    return 0;
  }

  /** Fills in what a unit is at the first row that says it. */
  private learn(u: Unit, r: number, c: Columns): void {
    const s = this.cols;
    if (u.veh < 0 && (s.names.length || s.types.length)) {
      const names = s.names.map((n) => text(c[n]?.[r]).trim());
      const types = s.types.map((n) => text(c[n]?.[r]).trim());
      if (names.some(Boolean) || types.some(Boolean)) {
        const key = names.find(Boolean) ?? '';
        const label = (s.label ? text(c[s.label]?.[r]).trim() : '') || key;
        const id = key + '\u0001' + types.join('+');
        let v = this.vehOf.get(id);
        if (v === undefined) {
          v = this.vehKey.length;
          this.vehOf.set(id, v);
          this.vehKey.push(key || types.find(Boolean) || '');
          this.vehLabel.push(label || types.find(Boolean) || '');
          this.vehCls.push(this.classOf(names, types));
        }
        u.veh = v;
      }
    }
    if (u.actor === 1 && !u.player) {
      const name = s.pname ? text(c[s.pname]?.[r]).trim() : '';
      const id = s.uid ? text(c[s.uid]?.[r]).trim() : '';
      if (id || name) {
        u.player = id || name;
        u.pname = name || id;
      }
    }
    if (u.tier === null && s.tier) {
      const t = text(c[s.tier]?.[r]).trim();
      if (t) u.tier = t;
    }
  }

  /** Rows `[0, n)` of the columns. */
  add(c: Columns, n: number): void {
    const s = this.spec;
    const sc = this.cols;
    const time = c[s.time];
    const tr = c[s.track];
    const team = s.team ? c[s.team] : undefined;
    const ev = s.event ? c[s.event] : undefined;
    const xc = c[s.x];
    const yc = s.y ? c[s.y] : undefined;
    const zc = s.z ? c[s.z] : undefined;
    const won = sc.won ? c[sc.won] : undefined;
    const actorRef = sc.actorRef ? c[sc.actorRef] : undefined;
    const weapon = sc.weapon ? c[sc.weapon] : undefined;
    const vals = sc.values.map((v) => c[v.name]);
    const floorCol = sc.floor ? c[sc.floor] : undefined;
    if (!time || !xc) return;
    if (this.mission === null && sc.mission && c[sc.mission]) {
      const m = text(c[sc.mission]![0]).trim();
      this.mission = m.replace(/\s+\d{4}-\d\d-\d\d[ T]\d\d[:.]\d\d.*$/, '') || null;
    }
    // World positions as the viewer places them (the spec's axes).
    const a = s.axes;
    const sc0 = a.scale || 1;
    const fx = (a.flipX ? -1 : 1) * sc0;
    const fy = (a.flipY ? -1 : 1) * sc0;
    const fz = (a.flipZ ? -1 : 1) * sc0;
    const X = new Float64Array(n);
    const Y = new Float64Array(n);
    const Z = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const rx = num(xc[i]);
      const ry = yc ? num(yc[i]) : 0;
      const rz = zc ? num(zc[i]) : 0;
      X[i] = rx * fx;
      if (a.up === 'z') {
        Y[i] = rz * fz;
        Z[i] = ry * fy;
      } else {
        Y[i] = ry * fy;
        Z[i] = rz * fz;
      }
    }
    if (this.cell === 0) this.startGrid(X, Y, Z, n);
    this.cqb?.add(c, n, X, Y, Z);
    let lastLabel: unknown = undefined;
    let kind = POSITION;
    for (let i = 0; i < n; i++) {
      const t = num(time[i]) * s.timeScale;
      if (!Number.isFinite(t)) continue;
      this.rows++;
      if (t < this.tMin) this.tMin = t;
      if (t > this.tMax) this.tMax = t;
      if (ev) {
        const l = ev[i];
        if (l !== lastLabel) {
          kind = this.kindOf(text(l).trim());
          lastLabel = l;
        }
      }
      const key = tr ? text(tr[i]) : '';
      const uIdx = key ? this.unitFor(key, team ? text(team[i]).trim() : '', i, c) : -1;
      const u = uIdx >= 0 ? this.units[uIdx] : null;
      if (u) this.learn(u, i, c);
      const x = X[i];
      const z = Z[i];
      const placed = Number.isFinite(x) && Number.isFinite(z);
      if (u && won) {
        const w = num(won[i]);
        if (Number.isFinite(w)) {
          u.wonSum += w > 0 ? 1 : 0;
          u.wonN++;
        }
      }
      for (let j = 0; j < this.V; j++) {
        const v = num(vals[j]?.[i]);
        if (Number.isFinite(v) && v !== 0) {
          this.valTotal[j] += v;
          if (u) u.val[j] += v;
        }
      }
      if (kind === POSITION) {
        if (!u || !placed) continue;
        this.mv.sample(uIdx, -1, u.team < MAX_TEAMS ? u.team : -1, u.veh >= 0 ? this.vehCls[u.veh] : -1, t, x, Y[i], z);
        const dt = t - u.lastT;
        if (dt > 0 && dt <= PRESENCE_GAP) {
          u.presence += dt;
          const ci = this.cellIndex(u.lastX, u.lastZ);
          if (ci >= 0) {
            this.cp[ci] += dt;
            this.cpt[ci * SLOTS + u.team] += dt;
            this.cy[ci] += u.lastY * dt;
            if (u.lastY < this.cy0[ci]) this.cy0[ci] = u.lastY;
            const kc = ci * C + (u.veh >= 0 ? this.vehCls[u.veh] : C - 1);
            this.cpc.set(kc, (this.cpc.get(kc) ?? 0) + dt);
            const kh = ci * B + this.band(u.lastY, floorCol ? num(floorCol[i]) : NaN);
            this.cph.set(kh, (this.cph.get(kh) ?? 0) + dt);
            this.slice(u.lastX, u.lastZ, u.lastT, K, dt);
            const dx = x - u.lastX;
            const dz = z - u.lastZ;
            const d = Math.hypot(dx, dz);
            if (d > 0) {
              this.cfx[ci] += (dx / d) * dt;
              this.cfz[ci] += (dz / d) * dt;
            }
          }
        }
        if (!(dt < 0)) {
          u.lastT = t;
          u.lastX = x;
          u.lastY = Y[i];
          u.lastZ = z;
        }
        continue;
      }
      const kName = EVENT_KINDS[kind];
      // Whoever did it, where the row names the doer (a weapon's shooter): else the row's own unit.
      let by = u;
      let byI = uIdx;
      if (actorRef && BY_ACTOR.has(kName)) {
        const ref = text(actorRef[i]);
        const b = ref ? this.unitOf.get(ref) : undefined;
        if (b !== undefined) {
          by = this.units[b];
          byI = b;
        }
      }
      if (DEATHS.has(kName) && u) {
        if (t - u.lastDeath < DEATH_TWICE) continue;
        u.lastDeath = t;
      }
      this.events[kind]++;
      const mk = MV_KIND[kName];
      if (mk && placed) {
        // A death is the row's own unit's; the rest are the doer's.
        const di = mk === 'death' ? uIdx : byI;
        const d = di >= 0 ? this.units[di] : null;
        this.mv.event(mk, di, -1, d && d.team < MAX_TEAMS ? d.team : -1, t, x, Y[i], z);
      }
      if (by) {
        by.ev[kind]++;
        if (kName === 'kill' && (sc.otherName || sc.otherType)) {
          const on = sc.otherName ? text(c[sc.otherName]?.[i]).trim() : '';
          const ot = sc.otherType ? text(c[sc.otherType]?.[i]).trim() : '';
          if (on || ot) (by.vs ??= new Float64Array(C))[this.classOf([on], [ot])]++;
        }
      }
      if (weapon && WEAPON_KINDS.has(kName)) {
        const w = text(weapon[i]).trim();
        if (w) {
          let a2 = this.weapons.get(w);
          if (!a2) this.weapons.set(w, (a2 = new Float64Array(EV)));
          a2[kind]++;
        }
      }
      const g = GRID_OF[kind];
      if (g >= 0) {
        this.phK.push(g);
        this.phT.push(t);
        if (placed) {
          const ci = this.cellIndex(x, z);
          if (ci >= 0) {
            const slot = by ? by.team : MAX_TEAMS;
            const cls = by && by.veh >= 0 ? this.vehCls[by.veh] : C - 1;
            const band = this.band(Y[i], floorCol ? num(floorCol[i]) : NaN);
            const k = (((ci * K + g) * SLOTS + slot) * C + cls) * B + band;
            this.cev.set(k, (this.cev.get(k) ?? 0) + 1);
            this.slice(x, z, t, g, 1);
          }
        }
      }
    }
  }

  // ---- the summary

  private finishGrid(T: number): { grid: SummaryGrid | null; extent: MatchSummary['extent'] } {
    const n = this.cix.length;
    if (!n || this.cell === 0) return { grid: null, extent: null };
    // The robust extent: the cells that hold 99% of the presence (of the events, without presence).
    let total = 0;
    for (let i = 0; i < n; i++) total += this.cp[i];
    const weight = new Float64Array(n);
    if (total > 0) weight.set(this.cp.subarray(0, n));
    else {
      for (const [k, v] of this.cev) weight[Math.floor(k / SPAN)] += v;
      for (let i = 0; i < n; i++) total += weight[i];
    }
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => weight[b] - weight[a]);
    let acc = 0;
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    for (const i of order) {
      if (acc >= total * 0.99 && x0 <= x1) break;
      acc += weight[i];
      x0 = Math.min(x0, this.cix[i]);
      x1 = Math.max(x1, this.cix[i]);
      z0 = Math.min(z0, this.ciz[i]);
      z1 = Math.max(z1, this.ciz[i]);
    }
    const c0 = this.cell;
    const extent: [number, number, number, number] = [x0 * c0, z0 * c0, (x1 + 1) * c0, (z1 + 1) * c0];
    const want = pow2At(Math.max(extent[2] - extent[0], extent[3] - extent[1]) / GRID_CELLS);
    if (want > this.cell) this.rebin(want / this.cell);
    const m = this.cix.length;
    // Team slots as the summary lists them: the named teams, then none.
    const slotOut = (s: number) => (s >= T ? T : s);
    const grid: SummaryGrid = {
      cell: this.cell, ix: [], iz: [], p: [], pt: [], pc: [], ph: [], y: [], y0: [], fx: [], fz: [], e: [],
      bands: { by: this.cols.floor ? 'floor' : 'height', floor: round1(this.yFloor), unitsPerMetre: this.upm },
      ts: { cell: this.cell * SLICE_CELLS, minute: MINUTE_SECONDS, v: [] },
    };
    const keep = new Int32Array(m).fill(-1);
    const hasEv = new Uint8Array(m);
    for (const k of this.cev.keys()) hasEv[Math.floor(k / SPAN)] = 1;
    for (let i = 0; i < m; i++) {
      if (this.cp[i] < 0.05 && !hasEv[i]) continue;
      keep[i] = grid.ix.length;
      grid.ix.push(this.cix[i]);
      grid.iz.push(this.ciz[i]);
      grid.p.push(round1(this.cp[i]));
      for (let s = 0; s <= T; s++) {
        let v = 0;
        for (let q = 0; q < SLOTS; q++) if (slotOut(q) === s) v += this.cpt[i * SLOTS + q];
        grid.pt.push(round1(v));
      }
      grid.y.push(this.cp[i] > 0 ? round1(this.cy[i] / this.cp[i]) : 0);
      grid.y0.push(Number.isFinite(this.cy0[i]) ? round1(this.cy0[i]) : 0);
      grid.fx.push(round1(this.cfx[i]));
      grid.fz.push(round1(this.cfz[i]));
    }
    const sorted = (mp: Map<number, number>) => [...mp].sort((a, b) => a[0] - b[0]);
    for (const [k, v] of sorted(this.cpc)) {
      const ci = keep[Math.floor(k / C)];
      if (ci >= 0 && v >= 0.05) grid.pc.push(ci, k % C, round1(v));
    }
    for (const [k, v] of sorted(this.cph)) {
      const ci = keep[Math.floor(k / B)];
      if (ci >= 0 && v >= 0.05) grid.ph.push(ci, k % B, round1(v));
    }
    for (const [k, v] of sorted(this.cev)) {
      const band = k % B;
      const cls = Math.floor(k / B) % C;
      const slot = Math.floor(k / (B * C)) % SLOTS;
      const kind = Math.floor(k / (B * C * SLOTS)) % K;
      const ci = keep[Math.floor(k / SPAN)];
      if (ci >= 0) grid.e.push(ci, kind, slotOut(slot), cls, band, v);
    }
    for (const [k, v] of sorted(this.cts)) {
      const kind = k % SK;
      const minute = Math.floor(k / SK) % MINUTE_BINS;
      const cc = Math.floor(k / (SK * MINUTE_BINS));
      if (kind === K && v < 0.05) continue;
      grid.ts.v.push(Math.floor(cc / 2 ** 20) - SO, (cc % 2 ** 20) - SO, minute, kind, kind === K ? round1(v) : v);
    }
    return { grid, extent };
  }

  finish(): MatchSummary {
    const T = this.teamNames.length;
    const slotOut = (s: number) => (s >= T ? T : s);
    const { grid, extent } = this.finishGrid(T);
    const evOf = (a: Float64Array): EventCounts => {
      const o: EventCounts = {};
      for (let k = 0; k < EV; k++) if (a[k] && k !== POSITION && EVENT_KINDS[k] !== 'other') o[EVENT_KINDS[k]] = a[k];
      return o;
    };
    const kills = (a: Float64Array) => a[KIND_OF.get('kill')!];
    const deaths = (a: Float64Array) => a[KIND_OF.get('death')!] + a[KIND_OF.get('destroyed')!] + a[KIND_OF.get('crash')!];
    const won = (u: Unit) => (u.wonN ? u.wonSum / u.wonN : null);
    // A weapon or decoy flies for its launcher (Tacview gives it the player's name): no player's own life.
    const NOT_DRIVEN = new Set([CLS_OF.get('weapon'), CLS_OF.get('decoy')]);
    const driven = (u: Unit) => u.veh < 0 || !NOT_DRIVEN.has(this.vehCls[u.veh]);
    const teamPlayers = this.teamNames.map(() => new Set<string>());

    // Teams.
    const teams: TeamStat[] = this.teamNames.map((name) => ({ name, units: 0, players: 0, presence: 0, kills: 0, deaths: 0, won: null, val: new Array(this.V).fill(0) }));
    const teamWon = teams.map(() => ({ s: 0, n: 0 }));
    for (const u of this.units) {
      const s = slotOut(u.team);
      if (s >= T) continue;
      const tm = teams[s];
      tm.units++;
      if (u.actor === 1 && u.player && driven(u)) teamPlayers[s].add(u.player);
      tm.presence += u.presence;
      tm.kills += kills(u.ev);
      tm.deaths += deaths(u.ev);
      for (let j = 0; j < this.V; j++) tm.val[j] += u.val[j];
      if (u.wonN) {
        teamWon[s].s += u.wonSum;
        teamWon[s].n += u.wonN;
      }
    }
    teams.forEach((tm, i) => {
      tm.players = teamPlayers[i].size;
      tm.won = teamWon[i].n ? teamWon[i].s / teamWon[i].n : null;
      tm.presence = round1(tm.presence);
    });

    // Vehicles, by vehicle and team.
    const vByKey = new Map<string, VehicleStat & { _vs: Float64Array; _ev: Float64Array }>();
    for (const u of this.units) {
      const team = slotOut(u.team);
      const id = `${u.veh}|${team}`;
      let v = vByKey.get(id);
      if (!v) {
        v = {
          key: u.veh >= 0 ? this.vehKey[u.veh] : '',
          label: u.veh >= 0 ? this.vehLabel[u.veh] : '',
          cls: VEHICLE_CLASSES[u.veh >= 0 ? this.vehCls[u.veh] : C - 1],
          team,
          tier: u.tier,
          units: 0,
          players: 0,
          presence: 0,
          ev: {},
          vs: {},
          winSum: 0,
          winN: 0,
          val: new Array(this.V).fill(0),
          _vs: new Float64Array(C),
          _ev: new Float64Array(EV),
        };
        vByKey.set(id, v);
      }
      v.units++;
      if (u.actor === 1) v.players++;
      v.presence += u.presence;
      for (let k = 0; k < EV; k++) v._ev[k] += u.ev[k];
      if (u.vs) for (let k = 0; k < C; k++) v._vs[k] += u.vs[k];
      const w = won(u);
      if (w !== null) {
        v.winSum += w;
        v.winN++;
      }
      for (let j = 0; j < this.V; j++) v.val[j] += u.val[j];
      if (!v.tier && u.tier) v.tier = u.tier;
    }
    const vehicles: VehicleStat[] = [...vByKey.values()].map(({ _vs, _ev, ...v }) => {
      v.ev = evOf(_ev);
      for (let k = 0; k < C; k++) if (_vs[k]) v.vs[VEHICLE_CLASSES[k]] = _vs[k];
      v.presence = round1(v.presence);
      v.winSum = Math.round(v.winSum * 1000) / 1000;
      return v;
    });

    // Players.
    const pBy = new Map<string, PlayerStat & { _veh: Map<string, number> }>();
    for (const u of this.units) {
      if (u.actor !== 1 || !u.player || !driven(u)) continue;
      let p = pBy.get(u.player);
      if (!p) pBy.set(u.player, (p = { id: u.player, name: u.pname, team: slotOut(u.team), units: 0, presence: 0, kills: 0, deaths: 0, hits: 0, launches: 0, won: null, vehicles: [], _veh: new Map() }));
      p.units++;
      p.presence += u.presence;
      p.kills += kills(u.ev);
      p.deaths += deaths(u.ev);
      p.hits += u.ev[KIND_OF.get('hit')!];
      p.launches += u.ev[KIND_OF.get('launch')!];
      const w = won(u);
      if (w !== null) p.won = p.won === null ? w : Math.max(p.won, w);
      if (u.veh >= 0) p._veh.set(this.vehKey[u.veh], (p._veh.get(this.vehKey[u.veh]) ?? 0) + u.presence + 1);
    }
    const playerStats: PlayerStat[] = [...pBy.values()]
      .sort((a, b) => b.presence - a.presence)
      .slice(0, MAX_PLAYERS)
      .map(({ _veh, ...p }) => ({ ...p, presence: round1(p.presence), vehicles: [..._veh].sort((a, b) => b[1] - a[1]).slice(0, 5).map((e) => e[0]) }));

    const weapons = [...this.weapons]
      .map(([name, a]) => ({ name, ev: evOf(a), n: a.reduce((s, v) => s + v, 0) }))
      .sort((a, b) => b.n - a.n)
      .slice(0, MAX_WEAPONS)
      .map(({ name, ev }) => ({ name, ev }));

    // Phases over the match's length, and by the minute.
    const t0 = Number.isFinite(this.tMin) ? this.tMin : 0;
    const duration = Number.isFinite(this.tMax) ? Math.max(0, this.tMax - t0) : 0;
    const kindsH: Record<string, number[]> = {};
    const minutes: Record<string, number[]> = {};
    for (let i = 0; i < this.phK.length; i++) {
      const k = GRID_KINDS[this.phK[i]];
      const dt = this.phT[i] - t0;
      const b = duration > 0 ? Math.min(PHASE_BINS - 1, Math.floor((dt / duration) * PHASE_BINS)) : 0;
      (kindsH[k] ??= new Array(PHASE_BINS).fill(0))[b]++;
      (minutes[k] ??= new Array(MINUTE_BINS).fill(0))[Math.min(MINUTE_BINS - 1, Math.floor(dt / MINUTE_SECONDS))]++;
    }
    for (const k of Object.keys(minutes)) {
      const a = minutes[k];
      let e = a.length;
      while (e > 0 && !a[e - 1]) e--;
      a.length = e;
    }

    // The match: the manifest and the match document first, the rows after.
    const m = this.info.manifest ?? {};
    const doc = this.info.doc ?? null;
    const str = (v: unknown) => (typeof v === 'string' && v ? v : null);
    const result = doc && typeof doc.result === 'object' && doc.result ? (doc.result as Record<string, unknown>) : null;
    let winner = result ? (result.winner === null || result.winner === undefined ? null : String(result.winner)) : null;
    if (winner === null) {
      const w = teams.map((tm, i) => ({ i, w: tm.won ?? -1 })).sort((a, b) => b.w - a.w);
      if (w.length && w[0].w > 0.5 && (w.length < 2 || w[1].w < w[0].w)) winner = teams[w[0].i].name;
    }
    const docMode = doc ? [str(doc.difficulty), str(doc.gameMode)].filter(Boolean).join(' ') : '';
    const unitsPlayers = this.units.filter((u) => u.actor === 1 && driven(u));
    const players = new Set(unitsPlayers.map((u) => u.player).filter(Boolean)).size;
    const v = this.cols.values;
    const maneuvers = this.maneuvers();
    return {
      format: SUMMARY_FORMAT,
      version: SUMMARY_VERSION,
      id: this.info.id,
      game: m.game ?? null,
      map: m.map ?? str(doc?.map) ?? null,
      mode: m.mode ?? (docMode || null),
      mission: str(doc?.mission) ?? this.mission,
      started: m.started ?? str(doc?.started) ?? null,
      duration: round1(typeof doc?.timePlayed === 'number' && doc.timePlayed > 0 ? doc.timePlayed : duration),
      rows: this.rows,
      units: this.units.length,
      players,
      ai: this.units.filter((u) => u.actor === 2).length,
      teams,
      winner,
      events: evOf(this.events),
      vehicles,
      playerStats,
      weapons,
      economy: { columns: v.map((c, j) => ({ name: c.name, currency: c.currency, flow: c.flow, total: Math.round(this.valTotal[j] * 100) / 100 })) },
      phases: { bins: PHASE_BINS, kinds: kindsH, minute: MINUTE_SECONDS, minutes },
      extent,
      kinds: [...GRID_KINDS],
      classes: [...VEHICLE_CLASSES],
      grid,
      maneuvers,
      cqb: this.cqb?.counts() ?? null,
      built: { by: this.info.by ?? 'viewer', at: new Date().toISOString(), ms: Math.round(performance.now() - this.started) },
    };
  }

  /** The movement analysis of the match, as counts by kind and side; null when it cannot run. */
  private maneuvers(): MatchSummary['maneuvers'] {
    try {
      this.mv.upm = this.upm;
      const [m] = this.mv.finish(this.teamNames.length);
      const r = m ? analyseMatch(m) : null;
      this.info.onManeuvers?.(r);
      return maneuverSection(r);
    } catch {
      return null;
    }
  }
}

/**
 * A match's summary from its table (any `AsyncBuffer`: a `File`'s slices, a
 * byte range of a container on disk), a row group at a time; null when the
 * table has no position, time or unit column.
 */
export async function summarizeTable(file: AsyncBuffer, info: SummaryInfo, metadata?: FileMetaData): Promise<MatchSummary | null> {
  const md = metadata ?? (await parquetMetadataAsync(file));
  const spec = await specOf(file, md);
  if (!spec) return null;
  const columns = leafColumns(md);
  const numericSet = new Set(
    columns.filter((c) => {
      const e = md.schema.find((s) => s.name === c);
      return !!e && ['FLOAT', 'DOUBLE', 'INT32', 'INT64', 'BOOLEAN'].includes(String(e.type));
    }),
  );
  const cols = summaryColumns(columns, (c) => numericSet.has(c), spec);
  const b = new SummaryBuilder(spec, cols, info);
  const want = SummaryBuilder.columnsOf(spec, cols).filter((c) => columns.includes(c));
  let start = 0;
  for (const rg of md.row_groups) {
    const rgRows = Number(rg.num_rows);
    for (let lo = 0; lo < rgRows; lo += READ_ROWS) {
      const hi = Math.min(rgRows, lo + READ_ROWS);
      const parts = new Map<string, { data: ArrayLike<unknown>; start: number }[]>();
      await parquetRead({
        file,
        metadata: md,
        columns: want,
        rowStart: start + lo,
        rowEnd: start + hi,
        compressors: COMPRESSORS,
        onChunk: (ch) => {
          let l = parts.get(ch.columnName);
          if (!l) parts.set(ch.columnName, (l = []));
          l.push({ data: ch.columnData as ArrayLike<unknown>, start: ch.rowStart });
        },
      });
      const n = hi - lo;
      const out: Columns = {};
      for (const [name, l] of parts) {
        if (l.length === 1 && l[0].start <= start + lo && l[0].start + l[0].data.length >= start + hi) {
          const d = l[0].data;
          const a = start + lo - l[0].start;
          out[name] = a === 0 && d.length === n ? d : ArrayBuffer.isView(d) ? (d as Float64Array).subarray(a, a + n) : Array.prototype.slice.call(d, a, a + n);
          continue;
        }
        const dst = new Array<unknown>(n);
        for (const p of l) {
          const from = Math.max(start + lo, p.start);
          const to = Math.min(start + hi, p.start + p.data.length);
          for (let r = from; r < to; r++) dst[r - start - lo] = p.data[r - p.start];
        }
        out[name] = dst;
      }
      b.add(out, n);
    }
    start += rgRows;
  }
  return b.finish();
}

/** The summary without its grid (what an index line and the panel hold). */
export function headOf(s: MatchSummary): Omit<MatchSummary, 'grid'> {
  const { grid: _grid, ...head } = s;
  return head;
}
