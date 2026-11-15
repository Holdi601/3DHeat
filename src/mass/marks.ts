/**
 * Marks on the level per surface, for the mass analysis' R6 surfaces tab:
 * Rainbow Six Siege's converter writes each mark (a bullet hole and the like)
 * as an `impact` row with the level object it sits on (`surface`, the map's
 * own id, the same in every match of one map version), its kind (`markKind`),
 * the room it is in (`callout`) and, where worked out, who made it
 * (`byPlayer`, `byOperator`, `byItemClass`). `MarkCollector` counts one
 * match's marks per surface for its summary (`summarize.ts`); `surfaceRows`
 * adds the matches the filter keeps: marks per surface, per round of its map,
 * the kinds, the shooters' operators and weapon classes, and where on the
 * surface (cells of a quarter metre, the heat of its marks).
 */

import type { Columns, LeanSpec } from '../overlay/lean/scan';
import type { MassStore } from './store';

/** Surfaces a match's summary keeps (the most marked). */
const MAX_SURFACES = 400;
/** Cells a surface keeps per match, and over all matches. */
const MAX_CELLS = 160;
const MAX_CELLS_ALL = 600;
/** Rows the tab lists, and the matches a row keeps for its drill-down. */
const MAX_ROWS = 300;
const MAX_IDS = 500;
/** Cell size of the marks' places on a surface, data units (metres). */
export const MARK_CELL = 0.25;

export interface SurfaceCount {
  n: number;
  /** Marks a player was worked out for. */
  shot: number;
  kinds: Record<string, number>;
  ops: Record<string, number>;
  cls: Record<string, number>;
  rooms: Record<string, number>;
  /** Marks by cell `ix,iy,iz` (`MARK_CELL`, the data's own axes). */
  cells: Record<string, number>;
}

/** One match's marks per surface; additive over matches. */
export interface MarkCounts {
  rounds: number;
  marks: number;
  surfaces: Record<string, SurfaceCount>;
}

const text = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'string' ? v : String(v));
const bump = (o: Record<string, number>, k: string, by = 1) => {
  if (k) o[k] = (o[k] ?? 0) + by;
};

interface Cols {
  surface: string;
  kind: string;
  op: string | null;
  cls: string | null;
  who: string | null;
  room: string | null;
  round: string | null;
}

export class MarkCollector {
  private readonly per = new Map<string, SurfaceCount>();
  private readonly rounds = new Set<string>();
  private marks = 0;

  /** The columns the collector reads; empty for data without marks on surfaces (`surface`, `markKind`). */
  static columnsOf(columns: readonly string[]): string[] {
    const c = MarkCollector.pick(columns);
    return c ? [c.surface, c.kind, c.op, c.cls, c.who, c.room, c.round].filter((x): x is string => !!x) : [];
  }

  private static pick(columns: readonly string[]): Cols | null {
    const has = (n: string) => (columns.includes(n) ? n : null);
    const surface = has('surface');
    const kind = has('markKind');
    if (!surface || !kind) return null;
    return { surface, kind, op: has('byOperator'), cls: has('byItemClass'), who: has('byPlayer'), room: has('callout'), round: has('round') };
  }

  private readonly cols: Cols;

  constructor(
    private readonly spec: LeanSpec,
    columns: readonly string[],
  ) {
    this.cols = MarkCollector.pick(columns)!;
  }

  add(c: Columns, n: number): void {
    const k = this.cols;
    const sf = c[k.surface];
    if (!sf) return;
    const kind = c[k.kind];
    const op = k.op ? c[k.op] : undefined;
    const cls = k.cls ? c[k.cls] : undefined;
    const who = k.who ? c[k.who] : undefined;
    const room = k.room ? c[k.room] : undefined;
    const rd = k.round ? c[k.round] : undefined;
    const X = this.spec.x ? c[this.spec.x] : undefined;
    const Y = this.spec.y ? c[this.spec.y] : undefined;
    const Z = this.spec.z ? c[this.spec.z] : undefined;
    for (let i = 0; i < n; i++) {
      if (rd) this.rounds.add(text(rd[i]));
      const s = text(sf[i]);
      if (!s) continue;
      this.marks++;
      let e = this.per.get(s);
      if (!e) this.per.set(s, (e = { n: 0, shot: 0, kinds: {}, ops: {}, cls: {}, rooms: {}, cells: {} }));
      e.n++;
      if (kind) bump(e.kinds, text(kind[i]));
      if (who && text(who[i])) e.shot++;
      if (op) bump(e.ops, text(op[i]));
      if (cls) bump(e.cls, text(cls[i]));
      if (room) bump(e.rooms, text(room[i]));
      const x = Number(X?.[i]);
      const y = Number(Y?.[i]);
      const z = Number(Z?.[i] ?? 0);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z))
        bump(e.cells, `${Math.floor(x / MARK_CELL)},${Math.floor(y / MARK_CELL)},${Math.floor(z / MARK_CELL)}`);
    }
  }

  counts(): MarkCounts | null {
    if (!this.marks) return null;
    const top = [...this.per.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, MAX_SURFACES);
    const surfaces: Record<string, SurfaceCount> = {};
    for (const [id, e] of top) surfaces[id] = { ...e, cells: topOf(e.cells, MAX_CELLS) };
    return { rounds: this.rounds.size, marks: this.marks, surfaces };
  }
}

function topOf(o: Record<string, number>, n: number): Record<string, number> {
  const e = Object.entries(o);
  if (e.length <= n) return o;
  return Object.fromEntries(e.sort((a, b) => b[1] - a[1]).slice(0, n));
}

export interface SurfaceRow {
  map: string;
  surface: string;
  marks: number;
  /** Marks a round of its map (over the matches of that map the filter keeps). */
  perRound: number;
  matches: number;
  /** Share of its marks a shooter was worked out for. */
  shot: number;
  room: string;
  kinds: [string, number][];
  ops: [string, number][];
  cls: [string, number][];
  /** Its marks' places: cells (`MARK_CELL`) with counts. */
  cells: [number, number, number, number][];
  matchIds: number[];
}

const sorted = (o: Record<string, number>, n = 8): [string, number][] =>
  Object.entries(o)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

/** The surfaces of the matches the filter keeps, the most marked first. */
export function surfaceRows(s: MassStore, mask: Uint8Array): { rows: SurfaceRow[]; matches: number; withMarks: number; maps: string[] } {
  const acc = new Map<string, SurfaceCount & { map: string; ids: number[] }>();
  const mapRounds = new Map<string, number>();
  let matches = 0;
  let withMarks = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    matches++;
    const m: MarkCounts | null = s.marks[i] ?? null;
    if (!m) continue;
    withMarks++;
    const map = s.str(s.m.map.get(i)) || '';
    mapRounds.set(map, (mapRounds.get(map) ?? 0) + m.rounds);
    for (const [id, e] of Object.entries(m.surfaces)) {
      const key = `${map}\u0001${id}`;
      let a = acc.get(key);
      if (!a) acc.set(key, (a = { map, n: 0, shot: 0, kinds: {}, ops: {}, cls: {}, rooms: {}, cells: {}, ids: [] }));
      a.n += e.n;
      a.shot += e.shot;
      for (const [k, v] of Object.entries(e.kinds)) bump(a.kinds, k, v);
      for (const [k, v] of Object.entries(e.ops)) bump(a.ops, k, v);
      for (const [k, v] of Object.entries(e.cls)) bump(a.cls, k, v);
      for (const [k, v] of Object.entries(e.rooms)) bump(a.rooms, k, v);
      for (const [k, v] of Object.entries(e.cells)) bump(a.cells, k, v);
      if (a.ids.length < MAX_IDS) a.ids.push(i);
    }
  }
  const rows: SurfaceRow[] = [...acc.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, MAX_ROWS)
    .map(([key, a]) => ({
      map: a.map,
      surface: key.split('\u0001')[1],
      marks: a.n,
      perRound: a.n / Math.max(1, mapRounds.get(a.map) ?? 0),
      matches: a.ids.length,
      shot: a.n ? a.shot / a.n : 0,
      room: sorted(a.rooms, 1)[0]?.[0] ?? '',
      kinds: sorted(a.kinds),
      ops: sorted(a.ops),
      cls: sorted(a.cls),
      cells: sorted(a.cells, MAX_CELLS_ALL).map(([k, v]) => {
        const [x, y, z] = k.split(',').map(Number);
        return [x, y, z, v] as [number, number, number, number];
      }),
      matchIds: a.ids,
    }));
  const maps = [...new Set(rows.map((r) => r.map))].sort();
  return { rows, matches, withMarks, maps };
}
