/**
 * What the breakdown can rank a dataset by and measure, and running the pass
 * (`breakdown.ts`) off the main thread a chunk at a time, as the volume
 * comparison does (`volumes/compareRun.ts`): the main thread copies slices of
 * the columns it needs and never visits a row.
 *
 * Dimensions: the groups, the persons and the matches; every category column
 * (a vehicle, a weapon, a side, a buy, an agent or kit...); every number
 * column, binned (a 0/1 column is two groups, armour or a loadout's value a
 * few ranges); and what is derived from a column's labels - a weapon's class,
 * and how many pieces of utility a list column (an inventory) holds.
 *
 * Factors (the "with against without" view), named so a converter can add
 * more without the viewer changing (docs/breakdown.md):
 *
 *   state_<name>   a state at the time: a number is on while non-zero, a
 *                  category is one factor per value (`state_ammo` = AP...)
 *   active_<name>  the same, for something switched on or recently used
 *                  (an ability, an ultimate, a gadget, a buff)
 *   a list column  one factor per item (`a|b|c`): `inventory`, `loadout`,
 *                  `perks`, `abilities`, `attachments`, `modules`, `buffs`...
 *   gear flags     the 0/1 columns games log already (helmet, defuser,
 *                  scoped, airborne, ducking, flashed...)
 *   shell type     `ammoType` and its kin: the round last fired
 *
 * Money: `earn_*` columns are income, `cost_*` columns money lost or spent
 * (the cost model's, `data/cost.ts`). Results: a 0/1 `won` column says whether
 * the row's side won the round (or the match); `round` splits a match into
 * rounds.
 */

import { CANON } from '../data/canonical';
import { ensureSituations, situationColumns } from '../insights/cqb/factors';
import { buildSplitTable, buildGroupTable, filterColumnData } from '../render/filterTables';
import { lowerBound } from '../render/sampling';
import type { AttributeColumn, Dataset, SplitRule } from '../state/types';
import { dwellCapOf } from '../volumes/stats';
import {
  createBreakdown,
  EV_DEATH,
  EV_KILL,
  EV_OTHER,
  EV_POSITION,
  finishBreakdown,
  stepBreakdown,
  type BreakdownChunk,
  type BreakdownMeta,
  type BreakdownResult,
  type BreakdownScope,
  type ColumnSlice,
  type DimSpec,
  type FactorSource,
  type Region,
  type SideRule,
} from './breakdown';

export const BREAKDOWN_CHUNK = 1 << 18;
const IN_FLIGHT = 3;
/** Most factors one pass measures. */
export const MAX_FACTORS = 256;

// ---------------------------------------------------------------------------
// What the dataset offers

export type DimKind = 'team' | 'person' | 'session' | 'category' | 'number' | 'weaponClass' | 'utility';

export interface Dimension {
  id: string;
  kind: DimKind;
  /** The column read (category and number, and the derived ones' source). */
  column: string | null;
}

const WEAPON_COLUMN = /^(weapon|weapon.?name|gun|killer.?weapon|weapon.?used|item|ability)$/i;
const OTHER_COLUMN = /^(other|other.?player|other.?name|victim|victim.?name|target|target.?name|opponent)$/i;
const WON_COLUMN = /^(won|win|is.?win(ner)?|winner|victory|round.?won|match.?won)$/i;
const ROUND_COLUMN = /^(round|round.?num(ber)?|round.?index|round.?no)$/i;
const LIST_COLUMN = /^(inventory|loadout|items|gear|perks|buffs|debuffs|effects|abilities|attachments|mods|modules|modifications|upgrades|specs?|specialisations?|specializations?)$/i;
const FACTOR_PREFIX = /^(state|active)_/i;
const GEAR_FLAG = /^(helmet|has.?helmet|defuser|has.?defuser|has.?kit|armou?r|scoped|zoom(ed)?|duck(ing)?|crouch(ing)?|prone|walking|sprint(ing)?|airborne|defusing|planting|reloading|flash(ed)?|blind(ed)?|burning|on.?fire|suppressed|ads|afterburner)$/i;
const SHELL_COLUMN = /^(ammo.?type|shell.?type|ammo.?kind|round.?type|ammo.?name)$/i;
/** Columns that are positions, times or ids, never a group worth ranking. */
const NOT_A_DIMENSION = /^(x|y|z|time|tick|t|ts|timestamp|.*Raw|dir[XYZ]|hit(Local|Dir)[XYZ]|fireLocal[XYZ]|target[XYZ]|v[xyz]|life|uid|id|seq|entity|steamid|user.?id)$/i;
const MISSING = /^(|nan|null|none|-|n\/a|undefined)$/i;

const isCat = (a: AttributeColumn) => a.kind === 'category' && !!a.categories;
const listy = (a: AttributeColumn) => {
  if (!isCat(a)) return false;
  if (LIST_COLUMN.test(a.name) || (FACTOR_PREFIX.test(a.name) && /s$/i.test(a.name))) return true;
  const c = a.categories!;
  let bars = 0;
  for (const l of c) if (l.includes('|')) bars++;
  return c.length >= 4 && bars >= c.length * 0.5;
};

export function weaponColumn(ds: Dataset): AttributeColumn | null {
  return ds.attrs.find((a) => isCat(a) && WEAPON_COLUMN.test(a.name)) ?? null;
}

export function otherColumn(ds: Dataset): AttributeColumn | null {
  return ds.personId ? ds.attrs.find((a) => isCat(a) && OTHER_COLUMN.test(a.name)) ?? null : null;
}

export function wonColumn(ds: Dataset): AttributeColumn | null {
  // The round's outcome before the match's, where a file has both (`data/outcome.ts`).
  const flags = ds.attrs.filter((a) => a.kind !== 'category' && WON_COLUMN.test(a.name) && a.min >= 0 && a.max <= 1);
  return flags.find((a) => !/^match/i.test(a.name)) ?? flags[0] ?? null;
}

export function roundColumn(ds: Dataset): AttributeColumn | null {
  return ds.attrs.find((a) => ROUND_COLUMN.test(a.name) && (a.kind !== 'category' ? a.max < 10_000 : (a.categories?.length ?? 0) < 10_000)) ?? null;
}

/** Money columns: income and loss. */
export function moneyColumns(ds: Dataset): { earn: string[]; cost: string[] } {
  const num = ds.attrs.filter((a) => a.kind !== 'category');
  return {
    earn: num.filter((a) => /^earn_/i.test(a.name)).map((a) => a.name),
    cost: num.filter((a) => /^cost_/i.test(a.name)).map((a) => a.name),
  };
}

export function dimensionsOf(ds: Dataset): Dimension[] {
  const out: Dimension[] = [];
  if (ds.teamId && ds.teamLabels.length > 1) out.push({ id: 'team', kind: 'team', column: null });
  if (ds.personId && ds.personLabels.length > 1) out.push({ id: 'person', kind: 'person', column: null });
  if (ds.sessionId && ds.sessionLabels.length > 1) out.push({ id: 'session', kind: 'session', column: null });
  const w = weaponColumn(ds);
  if (w) out.push({ id: `wclass:${w.name}`, kind: 'weaponClass', column: w.name });
  for (const a of ds.attrs) {
    if (a.name === CANON.event || NOT_A_DIMENSION.test(a.name)) continue;
    if (isCat(a)) {
      if (listy(a)) out.push({ id: `util:${a.name}`, kind: 'utility', column: a.name });
      else if (a.categories!.length > 1) out.push({ id: `cat:${a.name}`, kind: 'category', column: a.name });
    } else if (a.max > a.min && !/^(earn|cost)_/i.test(a.name) && !WON_COLUMN.test(a.name)) out.push({ id: `num:${a.name}`, kind: 'number', column: a.name });
  }
  return out;
}

/** A weapon's class by its name, across games; `other` when none fits. */
export const WEAPON_CLASSES = ['rifle', 'sniper', 'smg', 'shotgun', 'mg', 'pistol', 'melee', 'utility', 'launcher', 'vehicle', 'other'] as const;
export type WeaponClass = (typeof WEAPON_CLASSES)[number];
const WEAPON_CLASS_RULES: [RegExp, WeaponClass][] = [
  [/knife|bayonet|karambit|dagger|machete|melee|axe|hammer|wrench|fist|shovel|katana|blade|zeus|taser/, 'melee'],
  [/grenade|flashbang|\bflash\b|smoke|molotov|incendiary|decoy|^he$|frag|c4|explosive|claymore|\bmine\b|satchel|c-4|semtex/, 'utility'],
  [/awp|ssg ?08|scout|g3sg1|scar-?20|sniper|operator|marshal|outlaw|kar ?98|mosin|m24|l96|svd|dragunov|barrett|m82|dmr/, 'sniper'],
  [/nova|xm1014|mag-?7|sawed|shotgun|judge|bucky|m870|spas|saiga|m1014/, 'shotgun'],
  [/negev|m249|lmg|\bmg ?\d|machine ?gun|odin|ares|pkm|rpk|m60|mg42|bren/, 'mg'],
  [/rpg|launcher|bazooka|panzer|at4|javelin|stinger|law\b|smaw|carl ?gustaf|igla/, 'launcher'],
  [/mp9|mp7|mp5|mac-?10|ump|p90|bizon|smg|spectre|stinger|uzi|vector|ppsh|thompson|sten|mp40/, 'smg'],
  [/glock|usp|p2000|p250|five-?seven|tec-?9|cz75|deagle|desert eagle|berettas|\br8\b|revolver|pistol|classic|shorty|frenzy|ghost|sheriff|m1911|makarov|\bm9\b|handgun/, 'pistol'],
  [/ak-?\d|m4a1|m4a4|galil|famas|sg ?553|\baug\b|rifle|vandal|phantom|bulldog|guardian|carbine|m16|g36|scar|hk416|\bfal\b|garand|stg|ar-?15|ak74/, 'rifle'],
  [/cannon|missile|rocket|bomb|torpedo|shell|^ap|^he_|^hvap|^apds|^apfsds|heat|aim-|r-\d|kh-|agm|gbu|mk-?\d|\bgun\b|machinegun|\d+ ?mm/, 'vehicle'],
];

export function weaponClassOf(label: string): WeaponClass | null {
  const s = label.trim().toLowerCase();
  if (MISSING.test(s)) return null;
  for (const [re, c] of WEAPON_CLASS_RULES) if (re.test(s)) return c;
  return 'other';
}

const UTILITY_ITEM = /grenade|flashbang|\bflash\b|smoke|molotov|incendiary|decoy|frag|\bhe\b|stun|concussion|gadget|c4|claymore|satchel/i;

/** Items of a list label. */
export function listItems(label: string): string[] {
  return label.split('|').map((s) => s.trim()).filter((s) => s && !MISSING.test(s));
}

export interface BuiltDim {
  spec: DimSpec;
  labels: string[];
  /** The column the pass reads; null for team, person and session (their own ids). */
  column: string | null;
}

/** Bin edges for a number column from its range alone (no pass over the rows). */
export function binEdges(min: number, max: number): Float64Array {
  if (Number.isInteger(min) && Number.isInteger(max) && max - min <= 12) {
    const e = new Float64Array(max - min + 2);
    for (let i = 0; i < e.length; i++) e[i] = min - 0.5 + i;
    return e;
  }
  const raw = (max - min) / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const n = Math.max(1, Math.ceil((max - lo) / step + 1e-9));
  const e = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) e[i] = lo + i * step;
  return e;
}

export function buildDim(ds: Dataset, d: Dimension, mode: 'own' | 'opponent'): BuiltDim | null {
  const identity = (n: number) => Int32Array.from({ length: n }, (_, i) => i);
  if (d.kind === 'team') return { spec: { mode, remap: identity(ds.teamLabels.length), edges: null, groups: ds.teamLabels.length }, labels: ds.teamLabels, column: null };
  if (d.kind === 'person') return { spec: { mode, remap: identity(ds.personLabels.length), edges: null, groups: ds.personLabels.length }, labels: ds.personLabels, column: null };
  if (d.kind === 'session') return { spec: { mode, remap: identity(ds.sessionLabels.length), edges: null, groups: ds.sessionLabels.length }, labels: ds.sessionLabels, column: null };
  const a = ds.attrs.find((c) => c.name === d.column);
  if (!a) return null;
  if (d.kind === 'number') {
    if (a.kind === 'category') return null;
    const edges = binEdges(a.min, a.max);
    const labels: string[] = [];
    const integral = edges[0] % 1 === -0.5 || edges[0] % 1 === 0.5;
    for (let i = 0; i + 1 < edges.length; i++) labels.push(integral ? String(edges[i] + 0.5) : `${edges[i]}–${edges[i + 1]}`);
    return { spec: { mode, remap: null, edges, groups: edges.length - 1 }, labels, column: a.name };
  }
  if (!a.categories) return null;
  const cats = a.categories;
  const remap = new Int32Array(cats.length).fill(-1);
  const labels: string[] = [];
  const index = new Map<string, number>();
  const put = (c: number, label: string | null) => {
    if (label === null) return;
    let g = index.get(label);
    if (g === undefined) {
      g = labels.length;
      labels.push(label);
      index.set(label, g);
    }
    remap[c] = g;
  };
  for (let c = 0; c < cats.length; c++) {
    const l = cats[c];
    if (d.kind === 'category') put(c, MISSING.test(l.trim()) ? null : l);
    else if (d.kind === 'weaponClass') put(c, weaponClassOf(l));
    else put(c, String(Math.min(4, listItems(l).filter((i) => UTILITY_ITEM.test(i)).length)));
  }
  // Classes and counts in their natural order.
  if (d.kind !== 'category') {
    const order = d.kind === 'weaponClass' ? labels.map((l) => WEAPON_CLASSES.indexOf(l as WeaponClass)) : labels.map(Number);
    const sorted = labels.map((_, i) => i).sort((x, y) => order[x] - order[y]);
    const back = new Int32Array(labels.length);
    sorted.forEach((old, i) => (back[old] = i));
    for (let c = 0; c < remap.length; c++) if (remap[c] >= 0) remap[c] = back[remap[c]];
    const relabelled = sorted.map((i) => labels[i]);
    return { spec: { mode, remap, edges: null, groups: labels.length }, labels: relabelled, column: a.name };
  }
  return { spec: { mode, remap, edges: null, groups: labels.length }, labels, column: a.name };
}

export interface Factor {
  /** Column it is read from, and the value: a category index, an item, or null for a flag. */
  column: string;
  kind: 'flag' | 'cat' | 'list';
  /** What it is called: the column's name without its prefix, and the value. */
  name: string;
  value: string | null;
}

export interface BuiltFactors {
  sources: FactorSource[];
  columns: string[];
  factors: Factor[];
}

const factorName = (column: string) => column.replace(FACTOR_PREFIX, '');

/** Every state factor the dataset holds, by the convention above. */
export function buildFactors(ds: Dataset): BuiltFactors {
  const sources: FactorSource[] = [];
  const columns: string[] = [];
  const factors: Factor[] = [];
  const room = () => factors.length < MAX_FACTORS;
  // The dataset's columns, and the close-quarters situations once worked out (`insights/cqb/factors.ts`).
  for (const a of [...ds.attrs, ...situationColumns(ds)]) {
    if (!room()) break;
    const prefixed = FACTOR_PREFIX.test(a.name);
    if (a.kind !== 'category') {
      if (!(prefixed || GEAR_FLAG.test(a.name)) || !(a.max > 0 || a.min < 0)) continue;
      sources.push({ kind: 'flag', factor: factors.length });
      columns.push(a.name);
      factors.push({ column: a.name, kind: 'flag', name: factorName(a.name), value: null });
    } else if (a.categories && listy(a)) {
      const itemIndex = new Map<string, number>();
      const offs = new Int32Array(a.categories.length + 1);
      const items: number[] = [];
      a.categories.forEach((l, c) => {
        offs[c] = items.length;
        for (const it of new Set(listItems(l))) {
          let f = itemIndex.get(it);
          if (f === undefined) {
            if (!room()) continue;
            f = factors.length;
            itemIndex.set(it, f);
            factors.push({ column: a.name, kind: 'list', name: factorName(a.name), value: it });
          }
          items.push(f);
        }
      });
      offs[a.categories.length] = items.length;
      if (itemIndex.size === 0) continue;
      sources.push({ kind: 'list', offs, items: Int32Array.from(items) });
      columns.push(a.name);
    } else if (a.categories && (prefixed || SHELL_COLUMN.test(a.name))) {
      const factorOf = new Int32Array(a.categories.length).fill(-1);
      a.categories.forEach((l, c) => {
        if (MISSING.test(l.trim()) || !room()) return;
        factorOf[c] = factors.length;
        factors.push({ column: a.name, kind: 'cat', name: factorName(a.name), value: l });
      });
      if (factorOf.some((f) => f >= 0)) {
        sources.push({ kind: 'cat', factorOf });
        columns.push(a.name);
      }
    }
  }
  return { sources, columns, factors };
}

function missingOf(a: AttributeColumn | undefined): Uint8Array | null {
  if (!a?.categories) return null;
  return Uint8Array.from(a.categories, (l) => (MISSING.test(l.trim()) ? 1 : 0));
}

// ---------------------------------------------------------------------------
// One run

export interface BreakdownRequest {
  scope: BreakdownScope;
  region: Region;
  /** The difference split, or null outside difference mode (every row is layer A). */
  split: { rule: SplitRule; positiveTeams: number[]; negativeTeams: number[]; visibility: Record<number, boolean> } | null;
  dim: Dimension | null;
  mode: 'own' | 'opponent';
  earn: string | null;
  cost: string | null;
}

export interface BreakdownPrep {
  ds: Dataset;
  meta: BreakdownMeta;
  scope: BreakdownScope;
  side: SideRule;
  region: Region;
  dim: BuiltDim | null;
  factors: BuiltFactors;
  splitColumn: string | null;
  req: BreakdownRequest;
  lo: number;
  hi: number;
}

function upperBound(time: Float32Array, t: number): number {
  let a = 0;
  let b = time.length;
  while (a < b) {
    const m = (a + b) >>> 1;
    if (time[m] <= t) a = m + 1;
    else b = m;
  }
  return a;
}

export function prepareBreakdown(ds: Dataset, req: BreakdownRequest): BreakdownPrep {
  const dim = req.dim ? buildDim(ds, req.dim, req.mode) : null;
  const factors = buildFactors(ds);
  const ev = ds.attrs.find((a) => a.name === CANON.event);
  const other = otherColumn(ds);
  let otherPerson: Int32Array | null = null;
  if (other && ds.personId) {
    const index = new Map(ds.personLabels.map((l, i) => [l, i]));
    otherPerson = Int32Array.from(other.categories!, (l) => index.get(l) ?? -1);
  }
  const won = wonColumn(ds);
  const round = won ? roundColumn(ds) : null;
  const rounds = round ? (round.kind === 'category' ? round.categories!.length : Math.max(1, Math.floor(round.max) + 1)) : 1;
  const dimAttr = dim?.column ? ds.attrs.find((a) => a.name === dim.column) : undefined;
  const meta: BreakdownMeta = {
    persons: ds.personId ? ds.personLabels.length : 0,
    sessions: ds.sessionId ? ds.sessionLabels.length : 1,
    dwellCap: dwellCapOf(ds),
    eventCode: ev?.categories
      ? Int8Array.from(ev.categories, (k) => (k === 'kill' ? EV_KILL : k === 'death' ? EV_DEATH : k === 'position' ? EV_POSITION : EV_OTHER))
      : null,
    otherPerson,
    missing: [missingOf(dimAttr), ...factors.columns.map((c) => missingOf(ds.attrs.find((a) => a.name === c)))],
    dim: dim ? dim.spec : null,
    factors: factors.sources,
    factorCount: factors.factors.length,
    hasEarn: !!req.earn,
    hasCost: !!req.cost,
    hasWon: !!won,
    rounds,
  };
  let side: SideRule = { mode: -1, teamSign: null, sign: null, positive: [0, 0], negative: [0, 0] };
  let splitColumn: string | null = null;
  if (req.split) {
    const st = buildSplitTable(ds, req.split.rule, null);
    const teamSign = buildGroupTable(ds, st.mode === 0, req.split.positiveTeams, req.split.negativeTeams, req.split.visibility, [], null);
    if (!st.problem) {
      side = { mode: st.mode, teamSign: teamSign ? teamSign.slice() : null, sign: st.sign ? st.sign.slice() : null, positive: st.positiveRange, negative: st.negativeRange };
      splitColumn = st.mode !== 0 ? st.column : null;
    }
  }
  const sc = req.scope;
  let lo = 0;
  let hi = ds.count;
  if (ds.time && ds.timeSorted) {
    if (sc.lifetimeNow !== null) {
      lo = lowerBound(ds.time, sc.lifetimeNow - Math.max(ds.maxLifetimeGap, sc.defaultLifetime));
      hi = upperBound(ds.time, sc.lifetimeNow);
    } else if (sc.timeHi < Infinity) hi = upperBound(ds.time, sc.timeHi);
    // The state carried into the window comes from rows before it: start at the window
    // only when nothing is carried.
    if (sc.lifetimeNow === null && sc.timeLo > -Infinity && !dim?.column && factors.sources.length === 0) lo = lowerBound(ds.time, sc.timeLo);
  }
  return { ds, meta, scope: sc, side, region: req.region, dim, factors, splitColumn, req, lo, hi: Math.max(lo, hi) };
}

/** Rows `[lo, lo + n)`, copied, with the buffers to transfer. */
export function breakdownChunk(p: BreakdownPrep, lo: number, n: number): { chunk: BreakdownChunk; transfer: ArrayBuffer[] } {
  const { ds } = p;
  const hi = lo + n;
  const transfer: ArrayBuffer[] = [];
  const cut = <T extends ColumnSlice>(a: T | null | undefined): T | null => {
    if (!a) return null;
    const c = a.slice(lo, hi) as T;
    transfer.push(c.buffer as ArrayBuffer);
    return c;
  };
  const col = (name: string | null) => (name ? (((ds.attrs.find((a) => a.name === name) ?? situationColumns(ds).find((a) => a.name === name))?.data as ColumnSlice | undefined) ?? null) : null);
  const d = p.dim;
  const dimData = !d ? null : d.column ? col(d.column) : p.req.dim!.kind === 'team' ? ds.teamId : p.req.dim!.kind === 'person' ? ds.personId : ds.sessionId;
  const chunk: BreakdownChunk = {
    n,
    px: cut(ds.px)!,
    py: cut(ds.py)!,
    pz: cut(ds.pz)!,
    time: cut(ds.time),
    life: cut(ds.lifetime),
    person: cut(ds.personId),
    team: cut(ds.teamId),
    session: cut(ds.sessionId),
    event: p.meta.eventCode ? (cut(col(CANON.event)) as Uint32Array | null) : null,
    other: p.meta.otherPerson ? (cut(col(otherColumn(ds)!.name)) as Uint32Array | null) : null,
    split: cut(col(p.splitColumn)),
    dim: cut(dimData),
    factors: p.factors.columns.map((c) => cut(col(c))),
    earn: cut(col(p.req.earn)) as Float32Array | null,
    cost: cut(col(p.req.cost)) as Float32Array | null,
    won: p.meta.hasWon ? (cut(col(wonColumn(ds)!.name)) as Float32Array | null) : null,
    round: p.meta.hasWon ? cut(col(roundColumn(ds)?.name ?? null)) : null,
    filt: p.scope.filters.map((f) => {
      const data = filterColumnData(ds, f.column);
      return data ? cut(data as ColumnSlice) : null;
    }),
  };
  return { chunk, transfer };
}

/** The whole pass on this thread: for the tests and small data. */
export function breakdownSync(ds: Dataset, req: BreakdownRequest): { prep: BreakdownPrep; result: BreakdownResult } {
  const p = prepareBreakdown(ds, req);
  const job = createBreakdown(p.meta, p.scope, p.side, p.region);
  for (let lo = p.lo; lo < p.hi; lo += BREAKDOWN_CHUNK) stepBreakdown(job, breakdownChunk(p, lo, Math.min(BREAKDOWN_CHUNK, p.hi - lo)).chunk);
  return { prep: p, result: finishBreakdown(job) };
}

/** The pass in a worker; rejects with an AbortError when `signal` is aborted. */
export function runBreakdown(
  ds: Dataset,
  req: BreakdownRequest,
  opts: { signal?: AbortSignal; onProgress?: (fraction: number) => void } = {},
): Promise<{ prep: BreakdownPrep; result: BreakdownResult }> {
  // The close-quarters situations join the factors where the data has rounds; worked out once a dataset.
  return ensureSituations(ds, opts.signal).then(() => runBreakdownNow(ds, req, opts));
}

function runBreakdownNow(
  ds: Dataset,
  req: BreakdownRequest,
  opts: { signal?: AbortSignal; onProgress?: (fraction: number) => void },
): Promise<{ prep: BreakdownPrep; result: BreakdownResult }> {
  const p = prepareBreakdown(ds, req);
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./breakdownWorker.ts', import.meta.url), { type: 'module' });
    let next = p.lo;
    let inFlight = 0;
    let finishing = false;
    let over = false;
    const end = () => {
      over = true;
      worker.terminate();
    };
    const fail = (e: unknown) => {
      if (over) return;
      end();
      reject(e);
    };
    opts.signal?.addEventListener('abort', () => fail(new DOMException('aborted', 'AbortError')), { once: true });
    const pump = () => {
      while (!over && inFlight < IN_FLIGHT && next < p.hi) {
        const n = Math.min(BREAKDOWN_CHUNK, p.hi - next);
        const { chunk, transfer } = breakdownChunk(p, next, n);
        worker.postMessage({ type: 'chunk', chunk }, transfer);
        next += n;
        inFlight++;
      }
      if (!over && !finishing && next >= p.hi && inFlight === 0) {
        finishing = true;
        worker.postMessage({ type: 'finish' });
      }
    };
    worker.onmessage = (e: MessageEvent<{ type: 'ack' } | { type: 'done'; result: BreakdownResult }>) => {
      if (over) return;
      const m = e.data;
      if (m.type === 'ack') {
        inFlight--;
        const total = p.hi - p.lo;
        opts.onProgress?.(total > 0 ? (next - inFlight * BREAKDOWN_CHUNK - p.lo) / total : 1);
        pump();
      } else {
        end();
        resolve({ prep: p, result: m.result });
      }
    };
    worker.onerror = (e) => fail(new Error(e.message || 'breakdown worker failed'));
    if (opts.signal?.aborted) return fail(new DOMException('aborted', 'AbortError'));
    worker.postMessage({ type: 'start', meta: p.meta, scope: p.scope, side: p.side, region: p.region });
    pump();
  });
}
