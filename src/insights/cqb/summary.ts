/**
 * The close-quarters counts of one match for the many-match summary
 * (`mass/summarize.ts`): the summary builder hands each slice of raw columns
 * with its world positions, the collector resolves them into the walk's rows
 * (`walk.ts`) and `counts()` gives the additive per-match counts
 * (`finish.ts` CqbCounts). Several matches can share one walk (a session
 * base keeps their rounds apart) - the local validation pools them so.
 */

import { eventKindOf } from '../../data/canonical';
import type { Columns, LeanSpec } from '../../overlay/lean/scan';
import { cqbCounts, type CqbCounts } from './finish';
import { buyScore } from './buy';
import { canonKind, createWalk, K_POS, rawKind, stepWalk, type CqbWalk } from './walk';

const OTHER = /^(other|victim|killer|attacker)$/i;
const PLACE = /^(place|area|callout|zone|room|location|place.?name)$/i;
const WEAPON = /^(weapon|weapon.?name)$/i;
const ROUND = [/^round.?id$/i, /^round$/i];
const FLASHED = /^(state_flashed|flashed)$/i;
const PERSON = /^(player|player.?name|name)$/i;

function text(v: unknown): string {
  if (v === null || v === undefined) return '';
  return typeof v === 'string' ? v : String(v);
}
function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
}

interface Cols {
  person: string;
  round: string | null;
  other: string | null;
  place: string | null;
  weapon: string | null;
  won: string | null;
  flashed: string | null;
  buy: string | null;
}

export class CqbCollector {
  readonly walk: CqbWalk;
  private readonly cols: Cols;
  private readonly dict = { person: new Map<string, number>(), team: new Map<string, number>(), place: new Map<string, number>(), weapon: new Map<string, number>(), round: new Map<string, number>() };
  private readonly kindMemo = new Map<string, number>();

  /** The columns besides the spec's that the collector reads. */
  static columnsOf(spec: LeanSpec, columns: readonly string[]): string[] {
    // Only data with rounds: their deaths are final, and the counts mean what they say.
    if (!ROUND.some((re) => columns.some((c) => re.test(c.trim())))) return [];
    const c = CqbCollector.pick(spec, columns);
    return [c.person, c.round, c.other, c.place, c.weapon, c.won, c.flashed, c.buy, spec.dirX, spec.dirY, spec.dirZ].filter((x): x is string => !!x);
  }

  private static pick(spec: LeanSpec, columns: readonly string[]): Cols {
    const one = (re: RegExp) => columns.find((c) => re.test(c.trim())) ?? null;
    return {
      person: one(PERSON) ?? spec.track,
      round: ROUND.map(one).find(Boolean) ?? spec.match,
      other: one(OTHER),
      place: one(PLACE),
      weapon: one(WEAPON),
      won: one(/^won$/i),
      flashed: one(FLASHED),
      buy: one(/^buy$/i),
    };
  }

  constructor(
    private readonly spec: LeanSpec,
    columns: readonly string[],
    walk?: CqbWalk,
    private readonly sessionBase = 0,
  ) {
    this.cols = CqbCollector.pick(spec, columns);
    this.walk = walk ?? createWalk({ upm: spec.units > 0 ? spec.units : 1 });
  }

  private id(map: Map<string, number>, key: string): number {
    if (!key) return -1;
    let v = map.get(key);
    if (v === undefined) map.set(key, (v = map.size));
    return v;
  }

  private kind(label: string): number {
    let k = this.kindMemo.get(label);
    if (k === undefined) {
      const r = rawKind(label);
      k = r >= 0 ? r : canonKind(eventKindOf(label));
      this.kindMemo.set(label, k);
    }
    return k;
  }

  /** One slice: the raw columns and the world positions the summary builder worked out (x, z on the ground). */
  add(c: Columns, n: number, X: ArrayLike<number>, Y: ArrayLike<number>, Z: ArrayLike<number>): void {
    const s = this.spec;
    const k = this.cols;
    const time = c[s.time];
    if (!time) return;
    const col = (name: string | null) => (name ? c[name] : undefined);
    const per = col(k.person);
    const tm = s.team ? c[s.team] : undefined;
    const ev = s.event ? c[s.event] : undefined;
    const rd = col(k.round);
    const ot = col(k.other);
    const pl = col(k.place);
    const wp = col(k.weapon);
    const wn = col(k.won);
    const fl = col(k.flashed);
    const by = col(k.buy);
    const a = s.axes;
    const fx = a.flipX ? -1 : 1;
    const fy = a.flipY ? -1 : 1;
    const fz = a.flipZ ? -1 : 1;
    const dx = s.look === 'vector' && s.dirX ? c[s.dirX] : undefined;
    const dh = s.look === 'vector' ? (a.up === 'z' ? (s.dirY ? c[s.dirY] : undefined) : s.dirZ ? c[s.dirZ] : undefined) : undefined;
    const fh = a.up === 'z' ? fy : fz;
    const t = new Float64Array(n);
    const yaw = dx && dh ? new Float32Array(n) : null;
    const person = new Int32Array(n);
    const team = new Int32Array(n);
    const session = new Int32Array(n);
    const kind = new Int8Array(n);
    const other = ot ? new Int32Array(n) : null;
    const place = pl ? new Int32Array(n) : null;
    const weapon = wp ? new Int32Array(n) : null;
    const won = wn ? new Float32Array(n) : null;
    const flashed = fl ? new Float32Array(n) : null;
    const buy = by ? new Float32Array(n) : null;
    for (let i = 0; i < n; i++) {
      t[i] = num(time[i]) * s.timeScale;
      person[i] = per ? this.id(this.dict.person, text(per[i]).trim()) : -1;
      team[i] = tm ? this.id(this.dict.team, text(tm[i]).trim()) : -1;
      session[i] = rd ? this.sessionBase + this.id(this.dict.round, text(rd[i])) : this.sessionBase;
      kind[i] = ev ? this.kind(text(ev[i]).trim()) : K_POS;
      if (yaw) {
        const wx = num(dx![i]) * fx;
        const wz = num(dh![i]) * fh;
        yaw[i] = Number.isFinite(wx) && Number.isFinite(wz) && (wx || wz) ? Math.atan2(wx, -wz) : NaN;
      }
      if (other) other[i] = this.dict.person.get(text(ot![i]).trim()) ?? this.id(this.dict.person, text(ot![i]).trim());
      if (place) place[i] = this.id(this.dict.place, text(pl![i]).trim());
      if (weapon) weapon[i] = this.id(this.dict.weapon, text(wp![i]).trim());
      if (won) won[i] = num(wn![i]);
      if (flashed) flashed[i] = num(fl![i]);
      if (buy) buy[i] = buyScore(text(by![i]));
    }
    stepWalk(this.walk, { n, t, x: X, y: Y, z: Z, yaw, person, team, session, kind, other, place, weapon, won, flashed, buy });
  }

  /** Sessions used so far: the next match's base when matches share a walk. */
  get sessions(): number {
    return this.sessionBase + Math.max(1, this.dict.round.size);
  }

  names() {
    return { teams: [...this.dict.team.keys()], places: [...this.dict.place.keys()], weapons: [...this.dict.weapon.keys()], persons: [...this.dict.person.keys()] };
  }

  counts(): CqbCounts | null {
    try {
      return cqbCounts(this.walk, this.names());
    } catch {
      return null;
    }
  }
}
