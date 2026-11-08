/**
 * The hits on vehicles a recording holds, each in the frame of the vehicle
 * that was hit, with what the hit did: what the vehicle heatmap shows on its
 * figure.
 *
 * Read from columns any converter can write (the convention, metres in the
 * figure frame: x forward, y up, z right):
 *
 *   hitLocalX/Y/Z   the hit point on the unit hit, in its own frame
 *   hitDirX/Y/Z     the way the shot travelled, in the same frame (optional)
 *   otherVehicle    the vehicle hit, when the row is the shooter's
 *   otherLife       that unit's life, to tie hits to its death (optional)
 *   hitPart         a number the game gives the hit (optional)
 *   hitgroup        the body part hit (CS2)
 *   hitComponent, hitU/V/W, hitExitU/V/W
 *                   a collision component and where the shell went in and
 *                   where its path ended, as fractions of the component's
 *                   box (World of Tanks; placed on the figure by `boxes.ts`)
 *
 * Per game, the rows:
 *
 *   War Thunder   `shot` - the shooter's row, the unit hit `other`; what a
 *                 hit did from the `hit_critical`, `hit_severe`,
 *                 `module_destroyed` and death rows that follow it
 *   CS2           `hurt` - the victim's row, the attacker `other`, with the
 *                 damage, the armour's and the health left
 *   World of Tanks `struck` - the victim's row, one a point, the damage on
 *                 the first (none: it bounced or did not get through)
 *   World of Warships `impact` - the shooter's row; on a ship it names the
 *                 ship and the point in its frame, `reason` the hit type
 */

import type { AttributeColumn, Dataset } from '../state/types';
import type { Vec3 } from '../race/geometry';

export type HitKind = 'hit' | 'module';

/**
 * What a hit did, worst first: it killed (the killing shot), destroyed a
 * module, was a critical or a severe hit (the game's words), did damage,
 * did none (bounced or did not get through), or nothing is known.
 */
export type Outcome = 'kill' | 'module' | 'critical' | 'severe' | 'damage' | 'nodamage' | 'hit';
export const OUTCOMES: Outcome[] = ['kill', 'module', 'critical', 'severe', 'damage', 'nodamage', 'hit'];
const RANK: Record<Outcome, number> = { kill: 0, module: 1, critical: 2, severe: 3, damage: 4, nodamage: 5, hit: 6 };

/** A World of Tanks point as sent: its component and where in that component's box (0..1 each axis). */
export interface BoxPoint {
  component: number;
  entry: Vec3;
  exit: Vec3 | null;
  /** The victim's turret yaw then, radians, + to the right; null when not known. */
  turret: number | null;
}

export interface VehicleHit {
  /** The vehicle hit, as the data names it (a War Thunder id, "soldier" for a shooter's people). */
  vehicle: string;
  victim: string;
  /** The victim's life ('' when unknown): hits of one life end in one death. */
  life: string;
  shooter: string;
  shooterVehicle: string;
  weapon: string;
  match: string;
  time: number;
  /** The dataset row it came from. */
  row: number;
  /** The point in the vehicle's frame (m: x forward, y up, z right); null when only a region or a box is known. */
  local: Vec3 | null;
  /** Where the shell's path ended (a penetration's exit), same frame; null when not known. */
  exit: Vec3 | null;
  /** A point in a component's box, to be placed on the figure (World of Tanks). */
  box: BoxPoint | null;
  /** The way the shot travelled in the vehicle's frame, a unit vector; null when not known. */
  dir: Vec3 | null;
  /** The body region (CS2 hitgroup), or null. */
  region: string | null;
  /** A destroyed module's number, or the hit's part number as sent; null when none. */
  part: number | null;
  /** The game's own code for the hit (a hit type, a flag), '' when none. */
  code: string;
  damage: number | null;
  armorDamage: number | null;
  /** The victim's health after the hit, where the data says. */
  healthAfter: number | null;
  outcome: Outcome;
  /** The hit was among those that killed: on the life, by its killer, in the moments before it died. */
  fatal: boolean;
  /** The one hit that killed: the killer's last before the death (or the hurt that left no health). */
  killingShot: boolean;
  /** Seconds from the hit to the death of the life it struck; null when that life did not die in the data. */
  toDeath: number | null;
  /** The killing shot's share of all the damage that life took (0..1); null where damage is not known. */
  share: number | null;
  /** Modules destroyed right after it (War Thunder). */
  modules: number;
  kind: HitKind;
}

export type HitSource = 'warthunder' | 'cs2' | 'wot' | 'wows' | 'generic' | 'none';

export interface HitSet {
  hits: VehicleHit[];
  source: HitSource;
  /** Hits whose rows name a vehicle but carry no point (converted before the columns existed). */
  unplaced: number;
  /** The same per vehicle hit. */
  unplacedBy: Map<string, number>;
  /** Per vehicle: the hits, and what the data says it is (its kind and display name, for the figure). */
  vehicles: Map<string, VehicleInfo>;
}

export interface VehicleInfo {
  id: string;
  name: string;
  kind: string;
  hits: number;
  modules: number;
}

/** A row's text in a category column, '' when the column is missing. */
type Text = (row: number) => string;
/** A row's number, NaN when missing. */
type Num = (row: number) => number;

function find(d: Dataset, ...names: string[]): AttributeColumn | null {
  for (const n of names) {
    const lower = n.toLowerCase();
    const a = d.attrs.find((c) => c.name.toLowerCase() === lower);
    if (a) return a;
  }
  return null;
}

function text(d: Dataset, ...names: string[]): Text {
  const a = find(d, ...names);
  if (!a) return () => '';
  if (a.kind === 'category' && a.categories) {
    const ids = a.data as Uint32Array;
    const cats = a.categories;
    return (r) => cats[ids[r]] ?? '';
  }
  const data = a.data as Float32Array;
  return (r) => (Number.isFinite(data[r]) ? String(data[r]) : '');
}

const NONE: Num = () => NaN;

function num(d: Dataset, ...names: string[]): Num | null {
  const a = find(d, ...names);
  if (!a || a.kind === 'category') return null;
  const data = a.data as Float32Array;
  return (r) => data[r];
}

const fin = (v: number): number | null => (Number.isFinite(v) ? v : null);

/** Events that end a life. */
const DEATH = /^(death|dead|destroyed|killed|player_death)$/i;
/** Seconds before a death in which its killer's hits count as the killing ones. */
export const FATAL_WINDOW = 2.5;
/** Seconds before a destroyed module in which the last hit on the unit is where it was. */
export const MODULE_WINDOW = 0.6;
/** Seconds round a War Thunder critical or severe hit record in which the shooter's hit is the one it means. */
export const MARK_WINDOW = 0.6;

const CS2_HIT = /^(hurt|player_hurt)$/i;
const WT_SHOT = /^shot$/i;
const WOT_STRUCK = /^struck$/i;
const WOWS_IMPACT = /^impact$/i;
const MODULE = /^module_destroyed$/i;
const MARK = /^hit_(critical|severe)$/i;
const PART = /(\d+)\s*$/;

/** A unit vector from three columns at a row, or null. */
function unit(a: Num, b: Num, c: Num, r: number): Vec3 | null {
  const x = a(r), y = b(r), z = c(r);
  const n = Math.hypot(x, y, z);
  return Number.isFinite(n) && n > 1e-6 ? [x / n, y / n, z / n] : null;
}

/**
 * Every hit on a vehicle the dataset holds, with what it did. One pass over
 * the rows; nothing is kept of rows that are not hits.
 */
export function hitsFromDataset(d: Dataset): HitSet {
  const event = text(d, 'event', 'events', 'event type', 'eventType');
  const player = text(d, 'player', 'name');
  const other = text(d, 'other');
  const vehicleCol = text(d, 'Vehicle', 'vehicle');
  const otherVehicle = text(d, 'otherVehicle');
  const otherType = text(d, 'otherType');
  /** What the shooter's rows say the vehicle hit is, where the vehicle's own rows cannot be read back. */
  const typeOf = new Map<string, string>();
  const life = text(d, 'life');
  const otherLife = text(d, 'otherLife');
  const weapon = text(d, 'weaponName', 'weapon');
  const weaponRaw = text(d, 'weapon');
  const hitgroup = text(d, 'hitgroup');
  const reason = text(d, 'reason');
  const matchCol = find(d, 'match') ? text(d, 'match') : null;
  const session = d.sessionId;
  const match: Text = matchCol ?? ((r) => (session ? (d.sessionLabels[session[r]] ?? '') : ''));
  const lx = num(d, 'hitLocalX') ?? NONE;
  const ly = num(d, 'hitLocalY') ?? NONE;
  const lz = num(d, 'hitLocalZ') ?? NONE;
  const dx = num(d, 'hitDirX') ?? NONE;
  const dy = num(d, 'hitDirY') ?? NONE;
  const dz = num(d, 'hitDirZ') ?? NONE;
  const partCol = num(d, 'hitPart') ?? NONE;
  const flagCol = num(d, 'hitFlag') ?? NONE;
  const comp = num(d, 'hitComponent') ?? NONE;
  const bu = num(d, 'hitU') ?? NONE, bv = num(d, 'hitV') ?? NONE, bw = num(d, 'hitW') ?? NONE;
  const eu = num(d, 'hitExitU') ?? NONE, ev_ = num(d, 'hitExitV') ?? NONE, ew = num(d, 'hitExitW') ?? NONE;
  const turretCol = num(d, 'turretYaw') ?? NONE;
  const damageCol = num(d, 'damage', 'value') ?? NONE;
  const armorCol = num(d, 'armorDamage') ?? NONE;
  const healthCol = num(d, 'health') ?? NONE;
  const time = d.time;
  const hasEvents = !!find(d, 'event', 'events', 'event type', 'eventType');
  const hasLocal = !!find(d, 'hitLocalX');

  const hits: VehicleHit[] = [];
  const modules: { row: number; part: number | null }[] = [];
  const marks: { victim: string; shooter: string; time: number; match: string; severity: Outcome }[] = [];
  const deaths: { life: string; victim: string; killer: string; time: number; match: string }[] = [];
  /** A vehicle's display name and kind, from the first row that names it (that gives its name, if any does). */
  const infoRow = new Map<string, number>();
  const nameCol = text(d, 'VehicleName');
  const kindCol = text(d, 'kind', 'type');
  const vehicleAttr = find(d, 'Vehicle', 'vehicle');
  if (vehicleAttr?.kind === 'category') {
    const ids = vehicleAttr.data as Uint32Array;
    // 1: a row seen, 2: a row with the name seen.
    const seen = new Uint8Array(vehicleAttr.categories!.length);
    for (let r = 0; r < d.count; r++) {
      const id = ids[r];
      if (seen[id] === 2) continue;
      const v = vehicleAttr.categories![id];
      if (!v) continue;
      const named = nameCol(r) !== '';
      if (seen[id] === 0 || named) infoRow.set(v, r);
      seen[id] = named ? 2 : 1;
    }
  }
  let unplaced = 0;
  const unplacedBy = new Map<string, number>();
  const sources = new Set<HitSource>();
  if (!hasEvents && !hasLocal) return { hits, source: 'none', unplaced, unplacedBy: new Map(), vehicles: new Map() };

  const base = (r: number, t: number): Omit<VehicleHit, 'vehicle' | 'victim' | 'shooter' | 'shooterVehicle' | 'life'> => ({
    weapon: weapon(r),
    match: match(r),
    time: t,
    row: r,
    local: null,
    exit: null,
    box: null,
    dir: unit(dx, dy, dz, r),
    region: null,
    part: null,
    code: '',
    damage: null,
    armorDamage: null,
    healthAfter: null,
    outcome: 'hit',
    fatal: false,
    killingShot: false,
    toDeath: null,
    share: null,
    modules: 0,
    kind: 'hit',
  });
  const localAt = (r: number): Vec3 | null => {
    const x = lx(r), y = ly(r), z = lz(r);
    // A file without the columns reads 0 where another has them: no point.
    return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) && (x !== 0 || y !== 0 || z !== 0) ? [x, y, z] : null;
  };
  // World of Tanks sends a hit's points as rows of their own; the damage is on the first.
  let lastStruck: VehicleHit | null = null;

  for (let r = 0; r < d.count; r++) {
    const ev = event(r);
    const t = time ? time[r] : 0;
    if (DEATH.test(ev)) {
      deaths.push({ life: life(r), victim: player(r), killer: other(r), time: t, match: match(r) });
      continue;
    }
    if (MODULE.test(ev)) {
      const m = PART.exec(weaponRaw(r));
      modules.push({ row: r, part: m ? Number(m[1]) : null });
      continue;
    }
    const mark = MARK.exec(ev);
    if (mark) {
      marks.push({ victim: player(r), shooter: other(r), time: t, match: match(r), severity: mark[1].toLowerCase() as Outcome });
      continue;
    }
    if (WOT_STRUCK.test(ev)) {
      const c = comp(r);
      const dmg = damageCol(r);
      const same = lastStruck && lastStruck.time === t && lastStruck.victim === player(r) && !Number.isFinite(dmg);
      const h: VehicleHit = {
        ...base(r, t),
        vehicle: vehicleCol(r),
        victim: player(r),
        life: '',
        shooter: other(r),
        shooterVehicle: '',
        damage: fin(dmg),
        code: Number.isFinite(c) ? String(c) : '',
      };
      if (Number.isFinite(c)) {
        const exit: Vec3 = [eu(r), ev_(r), ew(r)];
        h.box = { component: c, entry: [bu(r), bv(r), bw(r)], exit: exit.every(Number.isFinite) ? exit : null, turret: fin(turretCol(r)) };
      }
      // A later point of the same shell shares the first's damage and what it did.
      if (same && lastStruck) h.outcome = lastStruck.outcome;
      else h.outcome = Number.isFinite(dmg) ? (dmg > 0 ? 'damage' : 'nodamage') : 'hit';
      if (!h.box && !h.dir) {
        unplaced++;
        unplacedBy.set(h.vehicle, (unplacedBy.get(h.vehicle) ?? 0) + 1);
      }
      hits.push(h);
      lastStruck = h;
      sources.add('wot');
      continue;
    }
    if (CS2_HIT.test(ev)) {
      const g = hitgroup(r).trim().toLowerCase();
      if (!g) continue;
      const dmg = damageCol(r);
      const health = healthCol(r);
      hits.push({
        ...base(r, t),
        vehicle: 'soldier',
        victim: player(r),
        life: '',
        shooter: other(r),
        shooterVehicle: '',
        local: localAt(r),
        region: g,
        code: g,
        damage: fin(dmg),
        armorDamage: fin(armorCol(r)),
        healthAfter: fin(health),
        outcome: Number.isFinite(health) && health <= 0 ? 'kill' : Number.isFinite(dmg) && dmg > 0 ? 'damage' : 'nodamage',
        // The hurt that leaves no health is the one that killed.
        fatal: Number.isFinite(health) && health <= 0,
        killingShot: Number.isFinite(health) && health <= 0,
      });
      sources.add('cs2');
      continue;
    }
    // A hit with a point: the shooter's row naming the vehicle hit (War Thunder, World of Warships, any converter).
    const vehicle = otherVehicle(r);
    const wt = WT_SHOT.test(ev);
    if (!wt && !(WOWS_IMPACT.test(ev) && vehicle) && !(hasLocal && vehicle)) continue;
    if (!vehicle) continue;
    const local = localAt(r);
    if (!local) {
      if (wt || WOWS_IMPACT.test(ev)) {
        unplaced++;
        unplacedBy.set(vehicle, (unplacedBy.get(vehicle) ?? 0) + 1);
      }
      continue;
    }
    const part = partCol(r);
    const flag = flagCol(r);
    if (!typeOf.has(vehicle)) {
      const ty = otherType(r);
      if (ty) typeOf.set(vehicle, ty);
    }
    hits.push({
      ...base(r, t),
      vehicle,
      victim: other(r),
      life: otherLife(r),
      shooter: player(r),
      shooterVehicle: vehicleCol(r),
      local,
      part: fin(part),
      code: wt ? (Number.isFinite(flag) ? String(flag) : Number.isFinite(part) ? String(Math.floor(part / 256)) : '') : reason(r),
    });
    sources.add(wt ? 'warthunder' : WOWS_IMPACT.test(ev) ? 'wows' : 'generic');
  }

  // Hits by life (or by victim where lives are not named), in time order, for deaths, marks and modules.
  const byLife = new Map<string, VehicleHit[]>();
  const byVictim = new Map<string, VehicleHit[]>();
  const keyOf = (lifeId: string, victim: string, m: string) => (lifeId ? `L${m}\u0000${lifeId}` : `V${m}\u0000${victim}`);
  for (const h of hits) {
    for (const [map, k] of [
      [byLife, keyOf(h.life, h.victim, h.match)],
      [byVictim, `${h.match}\u0000${h.victim}`],
    ] as const) {
      let list = map.get(k);
      if (!list) map.set(k, (list = []));
      list.push(h);
    }
  }
  for (const list of byLife.values()) list.sort((a, b) => a.time - b.time);
  for (const list of byVictim.values()) list.sort((a, b) => a.time - b.time);
  const better = (h: VehicleHit, o: Outcome) => {
    if (RANK[o] < RANK[h.outcome]) h.outcome = o;
  };

  // War Thunder's critical and severe hit records: the shooter's hit on the victim nearest in time.
  for (const m of marks) {
    const list = byVictim.get(`${m.match}\u0000${m.victim}`);
    if (!list) continue;
    let best: VehicleHit | null = null;
    for (const h of list) {
      if (m.shooter && h.shooter && h.shooter !== m.shooter) continue;
      if (h.time < m.time - MARK_WINDOW || h.time > m.time + 0.1) continue;
      if (!best || Math.abs(h.time - m.time) < Math.abs(best.time - m.time)) best = h;
    }
    if (best) better(best, m.severity);
  }

  for (const m of modules) {
    const r = m.row;
    const t = time ? time[r] : 0;
    const victim = player(r);
    const lifeId = life(r);
    const list = byLife.get(keyOf(lifeId, victim, match(r))) ?? findLife(byLife, lifeId, victim);
    let last: VehicleHit | null = null;
    if (list) {
      for (const h of list) {
        if (h.time > t + 0.1) break;
        if (h.time >= t - MODULE_WINDOW && h.local) last = h;
      }
    }
    if (last) {
      last.modules++;
      better(last, 'module');
    }
    hits.push({
      ...base(r, t),
      dir: last?.dir ?? null,
      vehicle: vehicleCol(r),
      victim,
      life: lifeId,
      shooter: other(r) || last?.shooter || '',
      shooterVehicle: last?.shooterVehicle ?? '',
      weapon: last?.weapon ?? '',
      local: last?.local ?? null,
      part: m.part,
      code: m.part === null ? '' : String(m.part),
      outcome: 'module',
      kind: 'module',
    });
  }

  // Deaths: the killing shot, the hits in its moments, every hit's time to the death and the killing shot's share.
  const dead = new Set<VehicleHit[]>();
  for (const death of deaths) {
    const list = byLife.get(keyOf(death.life, death.victim, death.match)) ?? findLife(byLife, death.life, death.victim);
    // CS2's people die many times a match under one name: their hurts are tied to deaths below, by health.
    if (!list || dead.has(list) || list[0].region !== null) continue;
    dead.add(list);
    let killing: VehicleHit | null = null;
    let total = 0;
    let known = true;
    for (const h of list) {
      if (h.kind !== 'hit' || h.time > death.time + 0.2) continue;
      h.toDeath = Math.max(0, death.time - h.time);
      if (h.damage === null) known = false;
      else total += h.damage;
      if (h.time < death.time - FATAL_WINDOW) continue;
      if (death.killer && h.shooter && death.killer !== h.shooter) continue;
      h.fatal = true;
      if (h.local || h.box || h.region) killing = h;
    }
    // CS2 says which hurt killed; elsewhere the killer's last hit before the death.
    const own = list.find((h) => h.killingShot) ?? killing;
    if (own) {
      own.killingShot = true;
      better(own, 'kill');
      if (known && total > 0 && own.damage !== null) own.share = own.damage / total;
    }
  }
  // CS2 lives are not named: a victim's hurts up to the one that left no health are that life's.
  for (const list of byVictim.values()) {
    let from = 0;
    for (let i = 0; i < list.length; i++) {
      const h = list[i];
      if (!h.killingShot || h.region === null) continue;
      let total = 0;
      for (let j = from; j <= i; j++) {
        total += list[j].damage ?? 0;
        list[j].toDeath = h.time - list[j].time;
      }
      if (total > 0 && h.damage !== null) h.share = h.damage / total;
      from = i + 1;
    }
  }

  const vehicles = new Map<string, VehicleInfo>();
  for (const h of hits) {
    if (!h.vehicle) continue;
    let v = vehicles.get(h.vehicle);
    if (!v) {
      const row = infoRow.get(h.vehicle);
      v = {
        id: h.vehicle,
        name: row !== undefined ? nameCol(row) || h.vehicle : h.vehicle,
        kind: (row !== undefined ? kindCol(row) : '') || typeOf.get(h.vehicle) || (h.vehicle === 'soldier' ? 'person' : ''),
        hits: 0,
        modules: 0,
      };
      vehicles.set(h.vehicle, v);
    }
    if (h.kind === 'module') v.modules++;
    else v.hits++;
  }
  const source: HitSource = sources.size === 0 ? 'none' : sources.size === 1 ? [...sources][0] : 'generic';
  return { hits, source, unplaced, unplacedBy, vehicles };
}

/** A life's hits found by its id alone or by the victim alone, whichever match the keys hold. */
function findLife(byLife: Map<string, VehicleHit[]>, lifeId: string, victim: string): VehicleHit[] | undefined {
  for (const [k, list] of byLife) {
    const id = k.slice(k.indexOf('\u0000') + 1);
    if (lifeId ? k[0] === 'L' && id === lifeId : k[0] === 'V' && id === victim) return list;
  }
  return undefined;
}

const cache = new WeakMap<Dataset, HitSet>();

/** `hitsFromDataset`, once per dataset. */
export function hitsOf(d: Dataset): HitSet {
  let s = cache.get(d);
  if (!s) {
    s = hitsFromDataset(d);
    cache.set(d, s);
  }
  return s;
}

/** What the view shows of the hits: one vehicle, and the filters. */
export interface HitFilter {
  vehicle: string | null;
  /** Null: all. */
  matches: string[] | null;
  shooters: string[] | null;
  weapons: string[] | null;
  outcomes?: Outcome[] | null;
  layer: 'all' | 'kills' | 'modules';
}

export function filterHits(set: HitSet, f: HitFilter): VehicleHit[] {
  return filterList(set.hits, f);
}

/** `filterHits` over any list of hits. */
export function filterList(list: VehicleHit[], f: HitFilter): VehicleHit[] {
  const ms = f.matches ? new Set(f.matches) : null;
  const ss = f.shooters ? new Set(f.shooters) : null;
  const ws = f.weapons ? new Set(f.weapons) : null;
  const os = f.outcomes ? new Set(f.outcomes) : null;
  return list.filter(
    (h) =>
      (f.vehicle === null || h.vehicle === f.vehicle) &&
      (f.layer === 'modules' ? h.kind === 'module' : h.kind === 'hit') &&
      (f.layer !== 'kills' || h.fatal) &&
      (!ms || ms.has(h.match)) &&
      (!ss || ss.has(h.shooter)) &&
      (!ws || ws.has(h.weapon || h.shooterVehicle)) &&
      (!os || os.has(h.outcome)),
  );
}

/** What a hit's weapon is shown as: its weapon, else the shooter's vehicle (War Thunder names no gun per hit). */
export function weaponOf(h: VehicleHit): string {
  return h.weapon || h.shooterVehicle;
}

/** Where a shot came from, as a pilot or a tank crew says it. */
export type Sector = 'front' | 'rear' | 'left' | 'right' | 'above' | 'below';

/** The side a shot travelling `dir` (vehicle frame) came in from. */
export function sectorOf(dir: Vec3): Sector {
  // It came from where it travelled away from.
  const fx = -dir[0], fy = -dir[1], fz = -dir[2];
  const ax = Math.abs(fx), ay = Math.abs(fy), az = Math.abs(fz);
  if (ay >= ax && ay >= az) return fy > 0 ? 'above' : 'below';
  if (ax >= az) return fx > 0 ? 'front' : 'rear';
  return fz > 0 ? 'right' : 'left';
}

export const SECTORS: Sector[] = ['front', 'rear', 'left', 'right', 'above', 'below'];

/** Whether an outcome says the shell got through (did damage or more); null when the data does not say. */
export function penetrated(o: Outcome): boolean | null {
  if (o === 'hit') return null;
  return o !== 'nodamage';
}
