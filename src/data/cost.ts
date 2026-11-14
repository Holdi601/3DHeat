/**
 * What things cost: money (or a game's own currency, or its resources) per row.
 *
 * Every load gets value columns beside its own, built here in the loader's
 * worker so the heat can weigh a row by what it cost rather than count it, and
 * the panels can total it. One naming scheme carries them all:
 *
 *   cost_<kind>_<currency>   kind: fired, spent, lost, destroyed, damage, fuel, total
 *   earn_[<kind>_]<currency> income: kill rewards, round bonuses, gathering
 *   net_<currency>           earned minus what was paid: spent and fuel where the
 *                            source counts spending, else fired, lost and fuel
 *
 * A converter that knows the game's economy writes such columns itself (War
 * Thunder's converter writes `cost_*_sl` and `earn_sl` from the user's own
 * install); those win, and the tables here are not asked for that currency.
 * Otherwise the game is recognised from the names in the data and priced from
 * its table (`data/costs/`): real-world dollars for the military sims, the
 * in-game economy where a game has one, several resources for strategy games.
 * What a table does not name gets its class average and says so in the
 * `Cost source` column, which filters like any category.
 *
 * Costs are attributed to the row where they happen: a weapon fired where it
 * left, a vehicle lost where it died, damage where it was dealt, fuel along
 * the track that burned it, money spent where it was spent.
 */

import { EVENT_KINDS, eventKindOf, VEHICLE_CLASSES, type CategoryInput, type VehicleClass } from './canonical';
import { COST_TABLES, type GameCosts, type Price } from './costs';
import { COST_ROLES, currencyUnit, parseValueColumn, roleRank, type ValueColumn } from './costs/columns';

export { currencyUnit, parseValueColumn, type ValueColumn };
import type { AttributeColumn } from '../state/types';

export const VALUE_KINDS = ['fired', 'spent', 'lost', 'destroyed', 'damage', 'fuel'] as const;
export type ValueKind = (typeof VALUE_KINDS)[number];
/** What one's own side paid: the net subtracts these from the income. */
export const OUTLAY_KINDS: readonly ValueKind[] = ['fired', 'spent', 'lost', 'fuel'];

/** The category column saying where a row's price came from. */
export const COST_SOURCE = 'Cost source';
export const COST_SOURCES = ['none', 'table', 'class average', 'estimate'] as const;

/** Euros a US dollar buys: the ECB reference rate's 2024 average. */
export const EUR_PER_USD = 0.92;

/** The value columns a dataset has, in a stable order: by currency, then flow and kind. */
export function valueColumnsOf(attrs: readonly { name: string; kind: string }[]): ValueColumn[] {
  const out = attrs.filter((a) => a.kind === 'number').flatMap((a) => parseValueColumn(a.name) ?? []);
  const order = (c: ValueColumn) => (c.flow === 'earn' ? 0 : c.flow === 'net' ? 9 : 1 + Math.max(0, [...VALUE_KINDS, 'total'].indexOf(c.kind ?? '')));
  return out.sort((a, b) => a.currency.localeCompare(b.currency) || order(a) - order(b));
}

/** Real money, which the viewer can show in dollars or euros. */
export const isMoney = (currency: string) => currency === 'usd';

/** A value in the currency shown: dollars become euros when asked, nothing else changes. */
export function shownValue(v: number, currency: string, money: 'usd' | 'eur', eurPerUsd = EUR_PER_USD): number {
  return isMoney(currency) && money === 'eur' ? v * eurPerUsd : v;
}

// ---------------------------------------------------------------------------
// Tables

/** Lowercase letters and digits: "F-16C_50" is "f16c50", "AK-47" is "ak47". */
export function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export interface Priced {
  price: Price;
  /** Per round fired. */
  shot: boolean;
  /** Spent when fired (a grenade, an ability), in a game that otherwise does not price shots. */
  use: boolean;
  reward: number | null;
}

/** A table's entry for a name, or null. */
export function priceOf(game: GameCosts, name: string): Priced | null {
  const n = normName(name);
  if (!n) return null;
  for (const it of game.items) if (it.m.test(n)) return { price: it.v, shot: !!it.shot, use: !!it.use, reward: it.reward ?? null };
  return null;
}

/** The table the names in the data match best; the military one when nothing stands out. */
export function detectGame(names: Iterable<string>, columns: readonly string[] = [], tables: readonly GameCosts[] = COST_TABLES): GameCosts {
  const score = new Map<GameCosts, number>(tables.map((t) => [t, 0]));
  const lower = new Set(columns.map((c) => c.toLowerCase()));
  // Columns only one game's converter writes.
  const hint = (id: string, cols: string[]) => {
    const t = tables.find((x) => x.id === id);
    if (t && cols.some((c) => lower.has(c))) score.set(t, (score.get(t) ?? 0) + 1000);
  };
  hint('cs2', ['cashspent', 'cashspenttotal', 'roundstartequipment']);
  for (const raw of names) {
    const n = normName(raw);
    if (n.length < 2) continue;
    for (const t of tables) if (t.items.some((it) => it.m.test(n))) score.set(t, (score.get(t) ?? 0) + 1);
  }
  let best = tables[0];
  let top = 0;
  for (const [t, s] of score) if (s > top) [best, top] = [t, s];
  return best;
}

// ---------------------------------------------------------------------------
// The columns

const WEAPON_COL = COST_ROLES.weapon;
const OWN_COL = COST_ROLES.own;
const TARGET_COL = COST_ROLES.target;
const TYPE_COL = COST_ROLES.type;
const EVENT_COL = /^(events?|event.?type|event.?name)$/i;
const VICTIM_COL = COST_ROLES.victim;
const RESOURCE_COL = COST_ROLES.resource;
const MUNITION_WORD = /(missile|bomb(?!er)|rocket|torpedo|shell|grenade|bullet|projectile)/i;

const num = (re: RegExp) => (nums: ValueInput['nums']) => nums.find((c) => re.test(c.name.trim()))?.data ?? null;
const DAMAGE = num(COST_ROLES.damage);
const FUEL = num(COST_ROLES.fuel);
const THROTTLE = num(COST_ROLES.throttle);
const BURNER = num(COST_ROLES.burner);
const EQUIP = num(COST_ROLES.equip);
const CASH = num(COST_ROLES.cash);
const AMOUNT = num(COST_ROLES.amount);

export interface ValueInput {
  n: number;
  /** Every category column of the load. */
  cats: CategoryInput[];
  nums: { name: string; data: Float32Array }[];
  /** The canonical columns (`canonical.ts`) where the load has them. */
  event: CategoryInput | null;
  vehicleClass: CategoryInput | null;
  targetClass: CategoryInput | null;
  person: Uint32Array | null;
  personLabels: readonly string[] | null;
  session: Uint32Array | null;
  /** Seconds, row-aligned. */
  time: Float32Array | null;
  /** Rows in time order, or null when they already are. */
  order: Uint32Array | null;
  /** Resource weights a viewer chose, by game id, over the tables' own. */
  exchange?: Readonly<Record<string, Readonly<Record<string, number>>>>;
  /** Force a table by id rather than recognise it. */
  game?: string;
}

/** Most seconds a gap between two samples of a track burns fuel for. */
const FUEL_GAP = 30;
/** A second death of the same track this soon after the first is the same death, logged twice. */
const DEATH_DEDUP = 2;

/** Value columns for the load: the tables' prices per row, totals and net per currency. */
export function valueColumns(inp: ValueInput): AttributeColumn[] {
  const { n, cats, nums } = inp;
  if (n === 0) return [];
  const existing = new Set([...cats.map((c) => c.name), ...nums.map((c) => c.name)]);
  const fileCols = nums.flatMap((c) => {
    const p = parseValueColumn(c.name);
    return p ? [{ ...p, data: c.data }] : [];
  });
  const out: AttributeColumn[] = [];

  const ownCols = cats.filter((c) => OWN_COL.test(c.name.trim())).sort((a, b) => rank(OWN_COL, a.name) - rank(OWN_COL, b.name));
  const names = new Set<string>();
  for (const c of [...ownCols, ...cats.filter((c) => WEAPON_COL.test(c.name.trim()))]) for (const l of c.labels) if (l) names.add(l);
  const game = (inp.game && COST_TABLES.find((t) => t.id === inp.game)) || detectGame(names, [...existing]);
  const resources = game.resources ?? [game.currency];
  // A file's plain income or any cost of its own in the game's currency replaces
  // the table. Income by kind alone (`earn_round_cs2`, a converter's exact round
  // rewards) replaces only that kind's: the table still prices the rest.
  const ours = (c: ValueColumn) => resources.includes(c.currency) || c.currency === game.currency;
  const tableWanted = !fileCols.some((c) => ours(c) && (c.flow !== 'earn' || !c.kind));
  const skipEarn = new Set(fileCols.filter((c) => ours(c) && c.flow === 'earn' && c.kind).flatMap((c) => (c.kind === 'round' ? ['round', 'plant', 'defuse'] : [c.kind!])));

  const derived: { kind: string; flow: 'cost' | 'earn'; res: string; data: Float32Array }[] = [];
  let source: Uint32Array | null = null;
  if (tableWanted) {
    const r = priceRows(inp, game, ownCols, skipEarn);
    derived.push(...r.cols);
    source = r.source;
  }
  // Each resource its own column; a multi-resource game's combined value beside them.
  const multi = resources.length > 1;
  const weights = { ...(game.exchange ?? {}), ...(inp.exchange?.[game.id] ?? {}) };
  const byKey = new Map<string, Float32Array>();
  for (const d of derived) {
    const cur = multi ? d.res : game.currency;
    const name = d.flow === 'earn' ? `earn_${cur}` : `cost_${d.kind}_${cur}`;
    byKey.set(name, d.data);
    if (multi) {
      const comb = d.flow === 'earn' ? `earn_${game.currency}` : `cost_${d.kind}_${game.currency}`;
      let acc = byKey.get(comb);
      if (!acc) byKey.set(comb, (acc = new Float32Array(n)));
      const w = weights[d.res] ?? 1;
      for (let i = 0; i < n; i++) if (d.data[i] !== 0) acc[i] += d.data[i] * w;
    }
  }
  for (const [name, data] of byKey) if (!existing.has(name)) out.push(numberColumn(name, data));
  if (source) out.push({ name: COST_SOURCE, kind: 'category', data: source, min: 0, max: COST_SOURCES.length - 1, categories: [...COST_SOURCES] });

  // Totals and net per currency, over the file's columns and the derived ones alike.
  const all = [...fileCols.map((c) => ({ name: c.name, flow: c.flow, kind: c.kind, currency: c.currency, data: c.data })), ...out.flatMap((c) => {
    const p = parseValueColumn(c.name);
    return p && c.kind === 'number' ? [{ ...p, data: c.data as Float32Array }] : [];
  })];
  for (const cur of new Set(all.map((c) => c.currency))) {
    if (multi && resources.includes(cur)) continue;
    const outlay = all.filter((c) => c.currency === cur && c.flow === 'cost' && OUTLAY_KINDS.includes(c.kind as ValueKind));
    // What was bought is counted once: where money is spent, what it bought being
    // fired or lost later is not spent again.
    const spends = outlay.some((c) => c.kind === 'spent');
    const paid = spends ? outlay.filter((c) => c.kind === 'spent' || c.kind === 'fuel') : outlay;
    const earn = all.filter((c) => c.currency === cur && c.flow === 'earn');
    const totalName = `cost_total_${cur}`;
    if (outlay.length > 1 && !existing.has(totalName) && !all.some((c) => c.name === totalName)) out.push(numberColumn(totalName, sum(n, outlay.map((c) => c.data))));
    const netName = `net_${cur}`;
    if (earn.length && !existing.has(netName)) {
      const net = sum(n, earn.map((c) => c.data));
      for (const c of paid) for (let i = 0; i < n; i++) if (c.data[i] === c.data[i]) net[i] -= c.data[i];
      out.push(numberColumn(netName, net));
    }
  }
  return out;
}

const rank = roleRank;

function sum(n: number, cols: Float32Array[]): Float32Array {
  const out = new Float32Array(n);
  for (const c of cols) for (let i = 0; i < n; i++) if (c[i] === c[i]) out[i] += c[i];
  return out;
}

function numberColumn(name: string, data: Float32Array): AttributeColumn {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { name, kind: 'number', data, min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 0 };
}

/** A price in each of the game's resources (a plain number is its one currency). */
function parts(game: GameCosts, p: Price): [string, number][] {
  return typeof p === 'number' ? [[game.resources?.[0] ?? game.currency, p]] : Object.entries(p);
}

/** Per-label lookups over one category column, worked out once per distinct label. */
class LabelPrices {
  private readonly cache: Int32Array;
  constructor(
    readonly col: CategoryInput,
    private readonly game: GameCosts,
    private readonly found: Priced[],
  ) {
    this.cache = new Int32Array(col.labels.length).fill(-2);
  }
  at(r: number): Priced | null {
    const li = this.col.data[r];
    if (li >= this.cache.length) return null;
    let c = this.cache[li];
    if (c === -2) {
      const p = priceOf(this.game, this.col.labels[li] ?? '');
      c = p ? this.found.push(p) - 1 : -1;
      this.cache[li] = c;
    }
    return c >= 0 ? this.found[c] : null;
  }
}

const SRC_TABLE = 1;
const SRC_CLASS = 2;
const SRC_EST = 3;

/** The table's prices per row, one array per kind and resource. */
function priceRows(inp: ValueInput, game: GameCosts, ownCols: CategoryInput[], skipEarn: ReadonlySet<string> = new Set()) {
  const { n, cats, nums } = inp;
  const found: Priced[] = [];
  const lp = (cols: CategoryInput[]) => cols.map((c) => new LabelPrices(c, game, found));
  const own = lp(ownCols);
  const weaponCols = cats.filter((c) => WEAPON_COL.test(c.name.trim())).sort((a, b) => rank(WEAPON_COL, a.name) - rank(WEAPON_COL, b.name));
  const weapon = lp(weaponCols);
  const target = lp(cats.filter((c) => TARGET_COL.test(c.name.trim())));
  const first = (ls: LabelPrices[], r: number) => {
    for (const l of ls) {
      const p = l.at(r);
      if (p) return p;
    }
    return null;
  };
  const typeCols = cats.filter((c) => TYPE_COL.test(c.name.trim()));
  const rawEvent = cats.find((c) => EVENT_COL.test(c.name.trim())) ?? null;
  const victimCol = cats.find((c) => VICTIM_COL.test(c.name.trim())) ?? null;
  const resourceCol = cats.find((c) => RESOURCE_COL.test(c.name.trim())) ?? null;
  const damage = DAMAGE(nums);
  const fuel = FUEL(nums);
  const throttle = THROTTLE(nums);
  const burner = BURNER(nums);
  const equip = EQUIP(nums);
  const cash = CASH(nums);
  const amount = AMOUNT(nums);

  // Event kind per row: the canonical column, else the raw one through the taxonomy.
  const kindOfLabel = (labels: readonly string[], raw: boolean) =>
    Int8Array.from(labels, (l) => (!l.trim() ? -1 : raw ? EVENT_KINDS.indexOf(eventKindOf(l)) : EVENT_KINDS.indexOf(l as (typeof EVENT_KINDS)[number])));
  const evCol = inp.event ?? rawEvent;
  const evKind = evCol ? kindOfLabel(evCol.labels, evCol === rawEvent) : null;
  // What the source itself logged, where the canonical column may have inferred more.
  const rawKind = rawEvent ? kindOfLabel(rawEvent.labels, true) : null;
  const rawName = rawEvent ? rawEvent.labels.map((l) => l.trim().toLowerCase()) : null;
  const E = (k: (typeof EVENT_KINDS)[number]) => EVENT_KINDS.indexOf(k);
  const [POS, FIRE, LAUNCH, HIT, DAMAGEK, KILL, DEATH, DESTROYED, SPAWN] = (['position', 'fire', 'launch', 'hit', 'damage', 'kill', 'death', 'destroyed', 'spawn'] as const).map(E);
  // Launches the source logged win over inferred ones (a weapon track's first sample): never both.
  let rawLaunches = false;
  if (rawEvent && rawKind) for (let r = 0; r < n && !rawLaunches; r++) if (rawKind[rawEvent.data[r]] === LAUNCH) rawLaunches = true;

  const clsIdx = (c: CategoryInput | null) => (c ? Int8Array.from(c.labels, (l) => VEHICLE_CLASSES.indexOf(l as VehicleClass)) : null);
  const vcls = clsIdx(inp.vehicleClass);
  const tcls = clsIdx(inp.targetClass);
  const WEAPON = VEHICLE_CLASSES.indexOf('weapon');
  const munitionOf = (r: number): number | null => {
    for (const c of [...weaponCols, ...typeCols]) {
      const m = MUNITION_WORD.exec(c.labels[c.data[r]] ?? '');
      if (m && game.munitionAvg) return game.munitionAvg[m[1].toLowerCase()] ?? game.munitionAvg.weapon ?? null;
    }
    return null;
  };
  const classPrice = (k: number): Price | null => (k >= 0 ? game.classAvg[VEHICLE_CLASSES[k]] ?? null : null);

  // Tracks: a person within a session, for what needs the samples before (fuel, equipment, spending).
  const S = inp.session ? maxPlus1(inp.session) : 1;
  const P = inp.person ? maxPlus1(inp.person) : 1;
  const direct = P * S <= 1 << 22;
  const slots = new Map<number, number>();
  const trackOf = (p: number, s: number) => {
    const key = p * S + s;
    if (direct) return key;
    let v = slots.get(key);
    if (v === undefined) slots.set(key, (v = slots.size));
    return v;
  };
  const cap = direct ? P * S : Math.min(n, 1 << 22);
  let size = direct ? cap : 1024;
  let lastT = new Float64Array(size).fill(NaN);
  let lastFuel = new Float32Array(size).fill(NaN);
  let lastEquip = new Float32Array(size).fill(NaN);
  let lastCash = new Float32Array(size).fill(NaN);
  let lastDeath = new Float64Array(size).fill(-Infinity);
  const ensure = (t: number) => {
    if (t < size) return;
    let m = size;
    while (m <= t) m *= 2;
    const grow = <A extends Float64Array | Float32Array>(a: A, fill: number): A => {
      const b = new (a.constructor as new (k: number) => A)(m);
      b.fill(fill);
      b.set(a);
      return b;
    };
    lastT = grow(lastT, NaN);
    lastFuel = grow(lastFuel, NaN);
    lastEquip = grow(lastEquip, NaN);
    lastCash = grow(lastCash, NaN);
    lastDeath = grow(lastDeath, -Infinity);
    size = m;
  };
  // A victim named by its player name: their track, for the equipment they carried.
  // By the person column's own labels, or by a player-name column beside it
  // (the person may be keyed by an id while the victim is named).
  const personIndex = new Map<string, number>();
  if (victimCol && inp.person) {
    const nameCol = cats.find((c) => c !== victimCol && /^(player|player.?name|name)$/i.test(c.name.trim()));
    if (nameCol) {
      const seen = new Uint8Array(nameCol.labels.length);
      for (let r = 0; r < n; r++) {
        const li = nameCol.data[r];
        if (li < seen.length && !seen[li]) {
          seen[li] = 1;
          personIndex.set(nameCol.labels[li], inp.person[r]);
        }
      }
    } else inp.personLabels?.forEach((l, i) => personIndex.set(l, i));
  }
  const victimPerson = victimCol ? Int32Array.from(victimCol.labels, (l) => personIndex.get(l) ?? -1) : null;

  // Fuel given as a fraction of full rather than kilograms.
  let fuelFraction = false;
  if (fuel) {
    let max = 0;
    for (let i = 0; i < n; i++) if (fuel[i] > max) max = fuel[i];
    fuelFraction = max > 0 && max <= 1.5;
  }

  const cols = new Map<string, { kind: string; flow: 'cost' | 'earn'; res: string; data: Float32Array }>();
  const add = (flow: 'cost' | 'earn', kind: string, r: number, price: Price, scale = 1) => {
    if (flow === 'earn' && skipEarn.has(kind)) return;
    for (const [res, v] of parts(game, price)) {
      const x = v * scale;
      if (!(x !== 0 && Number.isFinite(x))) continue;
      const key = `${flow}:${kind}:${res}`;
      let c = cols.get(key);
      if (!c) cols.set(key, (c = { kind, flow, res, data: new Float32Array(n) }));
      c.data[r] += x;
    }
  };
  const source = new Uint32Array(n);
  const flag = (r: number, s: number) => {
    if (source[r] === 0 || s > source[r]) source[r] = s;
  };
  const fuelTable = game.fuel;
  const earn = game.earn ?? {};

  for (let i = 0; i < n; i++) {
    const r = inp.order ? inp.order[i] : i;
    const p = inp.person ? inp.person[r] : 0;
    const s = inp.session ? inp.session[r] : 0;
    const tr = trackOf(p, s);
    ensure(tr);
    const t = inp.time ? inp.time[r] : NaN;
    const ek = evKind && evCol ? evKind[evCol.data[r]] : -1;
    const k = vcls && inp.vehicleClass ? vcls[inp.vehicleClass.data[r]] : -1;

    // What the track carries and has spent, as of this sample.
    if (equip) {
      const v = equip[r];
      if (v === v) lastEquip[tr] = v;
    }
    if (cash) {
      const v = cash[r];
      if (v === v) {
        const was = lastCash[tr];
        if (was === was && v > was) {
          add('cost', 'spent', r, v - was);
          flag(r, SRC_TABLE);
        }
        lastCash[tr] = v;
      }
    }

    // Fuel along the track.
    if (fuelTable && k >= 0 && (ek === POS || ek < 0)) {
      const cls = VEHICLE_CLASSES[k];
      const f = fuel ? fuel[r] : NaN;
      let kg = 0;
      if (f === f) {
        const was = lastFuel[tr];
        if (was === was && was > f) kg = (was - f) * (fuelFraction ? fuelTable.tankKg[cls] ?? 0 : 1);
        lastFuel[tr] = f;
      } else if (t === t) {
        const was = lastT[tr];
        const rate = fuelTable.kgPerHour[cls] ?? 0;
        if (rate > 0 && was === was && t > was) {
          let factor = 1;
          if (throttle) {
            const th = throttle[r];
            if (th === th) factor = 0.3 + 0.9 * Math.min(1, Math.max(0, th));
          }
          if (burner && burner[r] > 0) factor *= 3;
          kg = (rate / 3600) * Math.min(FUEL_GAP, t - was) * factor;
          if (kg > 0) flag(r, SRC_EST);
        }
      }
      if (kg > 0) add('cost', 'fuel', r, kg * fuelTable.perKg);
    }
    if (t === t) lastT[tr] = t;

    if (ek < 0 || ek === POS) {
      gatherAndRound(r);
      continue;
    }
    if (ek === FIRE || ek === LAUNCH) {
      // Launches the source logged, or inferred ones only where it logs none.
      const inferred = ek === LAUNCH && rawLaunches && rawKind && rawEvent && rawKind[rawEvent.data[r]] !== LAUNCH;
      if (!inferred) fired(r, k);
    } else if (ek === HIT || ek === DAMAGEK) {
      const dm = damage ? damage[r] : NaN;
      // Where the source counts damage, a row without any (a flash, a miss) did none.
      const share = dm === dm && dm > 0 ? Math.min(1, dm / 100) : damage ? 0 : ek === DAMAGEK ? 0.25 : 0.1;
      const v = share > 0 ? victimValue(r, ek === DAMAGEK) : null;
      if (v) {
        add('cost', 'damage', r, v.price, share);
        flag(r, v.src);
      }
    } else if (ek === DEATH || ek === DESTROYED) {
      if (t === t && t - lastDeath[tr] < DEATH_DEDUP) continue;
      if (t === t) lastDeath[tr] = t;
      const eq = lastEquip[tr];
      if (equip && eq === eq) {
        add('cost', 'lost', r, eq);
        flag(r, SRC_TABLE);
      } else {
        const v = ownValue(r, k);
        if (v) {
          add('cost', 'lost', r, v.price);
          flag(r, v.src);
        }
      }
    } else if (ek === KILL) {
      const v = victimValue(r, false);
      if (v) {
        add('cost', 'destroyed', r, v.price);
        flag(r, v.src);
      }
      const w = first(weapon, r);
      const reward = w?.reward ?? earn.kill;
      if (reward) add('earn', 'kill', r, reward);
    } else if (ek === SPAWN && game.spawnIsSpent) {
      const v = ownValue(r, k);
      if (v) {
        add('cost', 'spent', r, v.price);
        flag(r, v.src);
      }
    }
    gatherAndRound(r);
  }

  function fired(r: number, k: number) {
    const w = first(weapon, r) ?? (k === WEAPON ? first(own, r) : null);
    if (w) {
      if (game.realWorld || w.use || w.shot) {
        add('cost', 'fired', r, w.price);
        flag(r, SRC_TABLE);
      }
      return;
    }
    const m = munitionOf(r);
    if (m !== null && (game.realWorld || k === WEAPON)) {
      add('cost', 'fired', r, m);
      flag(r, SRC_CLASS);
      return;
    }
    const shot = k >= 0 && k !== WEAPON ? game.shotByClass?.[VEHICLE_CLASSES[k]] : undefined;
    if (shot) {
      add('cost', 'fired', r, shot);
      flag(r, SRC_CLASS);
    }
  }

  function ownValue(r: number, k: number): { price: Price; src: number } | null {
    const o = first(own, r);
    if (o && !o.shot) return { price: o.price, src: SRC_TABLE };
    const c = classPrice(k);
    return c !== null ? { price: c, src: SRC_CLASS } : null;
  }

  function victimValue(r: number, ownIsVictim: boolean): { price: Price; src: number } | null {
    const tv = first(target, r);
    if (tv && !tv.shot) return { price: tv.price, src: SRC_TABLE };
    // A victim named by player: what they carried.
    if (victimPerson && victimCol && equip) {
      const vp = victimPerson[victimCol.data[r]];
      if (vp >= 0) {
        const vt = trackOf(vp, inp.session ? inp.session[r] : 0);
        if (vt < size && lastEquip[vt] === lastEquip[vt]) return { price: lastEquip[vt], src: SRC_TABLE };
      }
    }
    const tk = tcls && inp.targetClass ? tcls[inp.targetClass.data[r]] : -1;
    const c = classPrice(tk);
    if (c !== null) return { price: c, src: SRC_CLASS };
    if (ownIsVictim) {
      const o = ownValue(r, vcls && inp.vehicleClass ? vcls[inp.vehicleClass.data[r]] : -1);
      if (o) return o;
    }
    // A shooter game's victim of unknown loadout: the class average of a player.
    const inf = game.classAvg.infantry;
    return !game.realWorld && inf !== undefined ? { price: inf, src: SRC_CLASS } : null;
  }

  /** Income the raw event names: the bomb, rounds, gathering. */
  function gatherAndRound(r: number) {
    if (!rawName || !rawEvent) return;
    const e = rawName[rawEvent.data[r]];
    if (!e) return;
    if (earn.plant && /^(plant|bomb_?planted|spike_?planted)$/.test(e)) add('earn', 'plant', r, earn.plant);
    else if (earn.defuse && /^(defuse|defused|bomb_?defused|spike_?defused)$/.test(e)) add('earn', 'defuse', r, earn.defuse);
    else if (earn.roundWin && /^round_?(won|win)$/.test(e)) add('earn', 'round', r, earn.roundWin);
    else if (earn.roundLoss && /^round_?(lost|loss)$/.test(e)) add('earn', 'round', r, earn.roundLoss[0]);
    else if (earn.gather && amount && /gather|harvest|mine|mining|income|collect|deliver/.test(e)) {
      const v = amount[r];
      if (v === v && v > 0) {
        const res = resourceCol ? normName(resourceCol.labels[resourceCol.data[r]] ?? '') : '';
        const known = game.resources?.includes(res) ? res : game.resources?.[0] ?? game.currency;
        add('earn', 'gather', r, { [known]: v });
      }
    }
  }

  // Earnings collapse into one income per resource; costs stay by kind.
  const merged = new Map<string, { kind: string; flow: 'cost' | 'earn'; res: string; data: Float32Array }>();
  for (const c of cols.values()) {
    if (c.flow === 'cost') {
      merged.set(`cost:${c.kind}:${c.res}`, c);
      continue;
    }
    const key = `earn:${c.res}`;
    const m = merged.get(key);
    if (!m) merged.set(key, { ...c, kind: 'earn', data: c.data });
    else for (let i = 0; i < n; i++) m.data[i] += c.data[i];
  }
  let any = false;
  for (let i = 0; i < n && !any; i++) if (source[i]) any = true;
  return { cols: [...merged.values()], source: any ? source : null };
}

function maxPlus1(a: Uint32Array): number {
  let m = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== 0xffffffff && a[i] >= m) m = a[i] + 1;
  return Math.max(1, m);
}
