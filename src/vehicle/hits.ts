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
 *   Squad         `hit` - a vehicle's row where a shell struck it (the impact
 *                 in the world, placed in the vehicle's frame from its own
 *                 rows when the converter gives no point), the damage type in
 *                 `detail`, the damage from the `damaged` row of the moment
 *   Arma (OCAP)   `hit ← …` / `killed ← …` - the victim's row, `Killer`,
 *                 `Weapon`, `Distance`: who, with what, from how far; no point
 *   Dota 2        `hurt` without a hitgroup - the hero's row, the attacker
 *                 `other`, the damage `value`, the ability `text`; no point
 *   IL-2          `hit` / `damage` with `local_x/y/z` - the player's own
 *                 aircraft, the point in its frame, the force
 *   Any           a victim's row (`hit`, `impact`, `hurt`, `wounded`...) with
 *                 `hitBone` (a skeleton bone, a hit zone, an Arma selection)
 *                 or `hitLocalX/Y/Z`
 *   Tacview ACMI  see `acmiHits.ts`
 */

import type { AttributeColumn, Dataset } from '../state/types';
import type { Vec3 } from '../race/geometry';
import { regionOf } from './regions';
import { acmiHits, isAcmiData } from './acmiHits';
import { localFromWorld } from './places';

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
  /** The hit's index in its set's `hits`. */
  id: number;
  /** Whose place the dataset row `row` holds: the victim's (a hurt, a struck) or the shooter's (a shot). */
  side: 'victim' | 'shooter';
  /** The victim's and the shooter's tracks (person ids) where the data ties them; -1: found by name. */
  victimPerson: number;
  shooterPerson: number;
  /** Metres from the shooter to the victim, where the data says. */
  distance: number | null;
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
  /** The shell's calibre, mm, where the data says (War Thunder: per shot). */
  calibre: number | null;
  /** The round's type where the data says: a specific one (APFSDS, HEAT, HESH...), else 'explosive' or 'kinetic'; null when not known. */
  ammoType: string | null;
  /** The round's own name in the game (War Thunder: e.g. 125mm_3bm46), and the slot it was loaded in; null when not known. */
  ammoName: string | null;
  ammoSlot: string | null;
  /** Modules destroyed right after it (War Thunder). */
  modules: number;
  kind: HitKind;
}

export type HitSource = 'warthunder' | 'cs2' | 'wot' | 'wows' | 'squad' | 'ocap' | 'acmi' | 'il2' | 'dota' | 'generic' | 'none';

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
/** OCAP's victim rows: "hit ← killer (weapon, 120 m)", "killed"; not the killer's "hit → victim". */
const OCAP_HIT = /^(hit|killed)\b(?!\s*→)/i;
/** A victim's row that names a bone or a point. */
const VICTIM_HIT = /^(hit|impact|hurt|wound(ed)?|damage(d)?|hit_?part)$/i;
const SQUAD_HIT = /^hit$/i;
const IL2_HIT = /^(hit|damage)$/i;
const WT_SHOT = /^shot$/i;
const WOT_STRUCK = /^struck$/i;
const WOWS_IMPACT = /^impact$/i;
const MODULE = /^module_destroyed$/i;
const MARK = /^hit_(critical|severe)$/i;
const PART = /(\d+)\s*$/;
/** The War Thunder converter's `hitOutcome` as an outcome: a penetration did damage, a non-penetration none. */
const WT_OUTCOME: Record<string, Outcome> = { kill: 'kill', critical: 'critical', penetration: 'damage', nonpenetration: 'nodamage' };

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
  return drain(hitsSteps(d));
}

/** Runs a generator of steps to its end. */
export function drain<T>(g: Generator<void, T, void>): T {
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

/** Rows a step of `hitsSteps` goes through before it yields. */
const STEP_ROWS = 2048;

/**
 * `hitsFromDataset` in steps: it yields every `STEP_ROWS` rows, so a caller
 * that must keep its frames short can spread the work over several.
 */
export function* hitsSteps(d: Dataset): Generator<void, HitSet, void> {
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
  // War Thunder's converter: what the hit did, as the server sent it, and the shell's calibre.
  const wtOutcome = text(d, 'hitOutcome');
  const calibreCol = num(d, 'calibre') ?? NONE;
  const ammoTypeCol = text(d, 'ammoType');
  const ammoNameCol = text(d, 'ammoName');
  const ammoSlotCol = text(d, 'ammoSlot');
  const comp = num(d, 'hitComponent') ?? NONE;
  const bu = num(d, 'hitU') ?? NONE, bv = num(d, 'hitV') ?? NONE, bw = num(d, 'hitW') ?? NONE;
  const eu = num(d, 'hitExitU') ?? NONE, ev_ = num(d, 'hitExitV') ?? NONE, ew = num(d, 'hitExitW') ?? NONE;
  const turretCol = num(d, 'turretYaw') ?? NONE;
  const damageCol = num(d, 'damage', 'value') ?? NONE;
  const armorCol = num(d, 'armorDamage') ?? NONE;
  const healthCol = num(d, 'health') ?? NONE;
  const time = d.time;
  const pid = d.personId;
  const personOf = (r: number) => (pid ? pid[r] : -1);
  // OCAP: the victim's and the killer's names, the distance; the victim's own kind.
  const ocap = !!find(d, 'Victim') && !!find(d, 'Killer');
  const victimCol = text(d, 'Victim');
  const killerCol = text(d, 'Killer');
  const distCol = num(d, 'Distance', 'distance') ?? NONE;
  const ocapType = text(d, 'Type');
  // Dota 2: the hero hurt and the ability that did it.
  const heroCol = find(d, 'hero') ? text(d, 'hero') : null;
  const abilityCol = find(d, 'inflictor', 'ability') ? text(d, 'inflictor', 'ability') : heroCol ? text(d, 'text') : null;
  // Squad: the actor a row is about, its blueprint, the damage type.
  const squad = !!find(d, 'entity') && !!find(d, 'pawn');
  const entityCol = text(d, 'entity');
  const pawnCol = text(d, 'pawn');
  const detailCol = text(d, 'detail');
  const boneCol = find(d, 'hitBone', 'hitZone', 'bone', 'selection') ? text(d, 'hitBone', 'hitZone', 'bone', 'selection') : null;
  // IL-2's telemetry: a hit on the player's aircraft, in its frame, and the force.
  const il2x = num(d, 'local_x'), il2y = num(d, 'local_y'), il2z = num(d, 'local_z');
  const forceCol = num(d, 'force') ?? NONE;
  const fx = num(d, 'force_x') ?? NONE, fy = num(d, 'force_y') ?? NONE, fz = num(d, 'force_z') ?? NONE;
  const lifeOf: Text = squad ? (r) => life(r) || entityCol(r) : life;
  const hasEvents = !!find(d, 'event', 'events', 'event type', 'eventType');
  const hasLocal = !!find(d, 'hitLocalX');
  const acmi = isAcmiData(d);

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
      if (r % STEP_ROWS === STEP_ROWS - 1) yield;
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
    id: 0,
    side: 'victim',
    victimPerson: personOf(r),
    shooterPerson: -1,
    distance: null,
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
    calibre: null,
    ammoType: null,
    ammoName: null,
    ammoSlot: null,
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
  const squadIndex = squad ? squadRows(d, event, entityCol, healthCol) : null;

  // A Tacview recording's hits are found apart (`acmiHits.ts`): the rows go round once there.
  for (let r = 0; r < (acmi ? 0 : d.count); r++) {
    if (r % STEP_ROWS === STEP_ROWS - 1) yield;
    const ev = event(r);
    const t = time ? time[r] : 0;
    if (ocap) {
      const m = OCAP_HIT.exec(ev);
      if (m) {
        const type = ocapType(r);
        const own = vehicleCol(r);
        const infantry = !own || /^(infantry|man|unit|soldier|person)$/i.test(type);
        const vehicle = infantry ? 'soldier' : own;
        if (!typeOf.has(vehicle)) typeOf.set(vehicle, infantry ? 'person' : type);
        const kill = m[1].toLowerCase() === 'killed';
        const victim = victimCol(r);
        const shooter = killerCol(r);
        hits.push({
          ...base(r, t),
          vehicle,
          victim,
          life: '',
          shooter,
          shooterVehicle: '',
          distance: fin(distCol(r)),
          outcome: kill ? 'kill' : 'hit',
          fatal: kill,
          killingShot: kill,
        });
        if (kill) deaths.push({ life: '', victim, killer: shooter, time: t, match: match(r) });
        sources.add('ocap');
        continue;
      }
    }
    if (DEATH.test(ev)) {
      deaths.push({ life: lifeOf(r), victim: player(r), killer: other(r), time: t, match: match(r) });
      continue;
    }
    if (squadIndex && SQUAD_HIT.test(ev) && !boneCol?.(r)) {
      const entity = entityCol(r);
      const ref = squadIndex.near(entity, t);
      const local = localAt(r) ?? (ref >= 0 ? localFromWorld(d, ref, d.px[r], d.py[r], d.pz[r]) : null);
      const drop = squadIndex.drop.get(`${entity}|${t}`);
      const vehicle = pawnCol(r) || player(r);
      if (!typeOf.has(vehicle)) typeOf.set(vehicle, SQUAD_HELI.test(vehicle) ? 'helicopter' : '');
      hits.push({
        ...base(r, t),
        victimPerson: ref >= 0 ? personOf(ref) : personOf(r),
        vehicle,
        victim: player(r),
        life: entity,
        shooter: '',
        shooterVehicle: '',
        local,
        weapon: detailCol(r),
        code: detailCol(r),
        damage: drop ? drop.damage : null,
        healthAfter: drop ? drop.health : null,
        outcome: drop ? (drop.health <= 0 ? 'kill' : drop.damage > 0 ? 'damage' : 'nodamage') : 'hit',
      });
      if (!local) {
        unplaced++;
        unplacedBy.set(vehicle, (unplacedBy.get(vehicle) ?? 0) + 1);
      }
      sources.add('squad');
      continue;
    }
    if (il2x && il2y && il2z && IL2_HIT.test(ev)) {
      const x = il2x(r), y = il2y(r), z = il2z(r);
      if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
        const vehicle = vehicleCol(r) || 'aircraft';
        if (!typeOf.has(vehicle)) typeOf.set(vehicle, 'aircraft');
        const f = forceCol(r);
        hits.push({
          ...base(r, t),
          vehicle,
          victim: player(r),
          life: life(r),
          shooter: other(r),
          shooterVehicle: '',
          local: [x, y, z],
          dir: unit(fx, fy, fz, r),
          code: Number.isFinite(f) ? `${ev.toLowerCase()} ${Math.round(f)} N` : ev.toLowerCase(),
          outcome: /^damage$/i.test(ev) ? 'damage' : 'hit',
        });
        sources.add('il2');
        continue;
      }
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
    if (CS2_HIT.test(ev) && !hitgroup(r).trim() && !boneCol?.(r) && !localAt(r)) {
      // A hurt with no body part (Dota 2's combat log): a hit on the unit, no point.
      const dmg = damageCol(r);
      const health = healthCol(r);
      const vehicle = heroCol?.(r) || vehicleCol(r) || player(r);
      if (!vehicle) continue;
      if (!typeOf.has(vehicle)) typeOf.set(vehicle, heroCol ? 'hero' : '');
      hits.push({
        ...base(r, t),
        vehicle,
        victim: player(r),
        life: life(r),
        shooter: other(r),
        shooterVehicle: '',
        weapon: abilityCol?.(r) || weapon(r),
        damage: fin(dmg),
        healthAfter: fin(health),
        outcome: Number.isFinite(health) && health <= 0 ? 'kill' : Number.isFinite(dmg) ? (dmg > 0 ? 'damage' : 'nodamage') : 'hit',
      });
      sources.add(heroCol ? 'dota' : 'generic');
      continue;
    }
    if (CS2_HIT.test(ev) && hitgroup(r).trim()) {
      const g = hitgroup(r).trim().toLowerCase();
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
    // A victim's row naming a bone or a point (Squad's impacts, Arma's hit parts, Reforger's hit zones, any converter).
    if (VICTIM_HIT.test(ev) && !otherVehicle(r)) {
      const bone = boneCol?.(r) ?? '';
      const local = localAt(r);
      if (bone || local) {
        const region = bone && regionOf(bone) ? bone : null;
        const vehicle = region !== null ? 'soldier' : vehicleCol(r) || pawnCol(r) || player(r);
        const dmg = damageCol(r);
        const health = healthCol(r);
        hits.push({
          ...base(r, t),
          vehicle,
          victim: player(r),
          life: lifeOf(r),
          shooter: other(r),
          shooterVehicle: '',
          local,
          region,
          code: bone || detailCol(r),
          damage: fin(dmg),
          healthAfter: fin(health),
          distance: fin(distCol(r)),
          outcome: Number.isFinite(health) && health <= 0 ? 'kill' : Number.isFinite(dmg) ? (dmg > 0 ? 'damage' : 'nodamage') : 'hit',
        });
        sources.add(squad ? 'squad' : 'generic');
        continue;
      }
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
      side: 'shooter',
      victimPerson: -1,
      shooterPerson: personOf(r),
      vehicle,
      victim: other(r),
      life: otherLife(r),
      shooter: player(r),
      shooterVehicle: vehicleCol(r),
      local,
      part: fin(part),
      code: wt ? (Number.isFinite(flag) ? String(flag) : Number.isFinite(part) ? String(Math.floor(part / 256)) : '') : reason(r),
      outcome: wt ? (WT_OUTCOME[wtOutcome(r)] ?? 'hit') : 'hit',
      calibre: fin(calibreCol(r)),
      ammoType: ammoTypeCol(r) || null,
      ammoName: ammoNameCol(r) || null,
      ammoSlot: ammoSlotCol(r) || null,
    });
    sources.add(wt ? 'warthunder' : WOWS_IMPACT.test(ev) ? 'wows' : 'generic');
  }

  yield;
  if (acmi) {
    const found = acmiHits(d);
    for (const h of found.hits) hits.push(h);
    for (const [k, v] of found.kinds) if (!typeOf.has(k)) typeOf.set(k, v);
    if (found.hits.length) sources.add('acmi');
  }

  yield;
  // Hits by life (or by victim where lives are not named), in time order, for deaths, marks and modules.
  const byLife = new Map<string, VehicleHit[]>();
  const byVictim = new Map<string, VehicleHit[]>();
  const keyOf = (lifeId: string, victim: string, m: string) => (lifeId ? `L${m}\u0000${lifeId}` : `V${m}\u0000${victim}`);
  let step = 0;
  for (const h of hits) {
    if (++step % STEP_ROWS === 0) yield;
    for (const [map, k] of [
      [byLife, keyOf(h.life, h.victim, h.match)],
      [byVictim, `${h.match}\u0000${h.victim}`],
    ] as const) {
      let list = map.get(k);
      if (!list) map.set(k, (list = []));
      list.push(h);
    }
  }
  // Sorted a few thousand hits a step: many lives' sorts at once are too long for one.
  let sorted = 0;
  for (const map of [byLife, byVictim]) {
    for (const list of map.values()) {
      list.sort((a, b) => a.time - b.time);
      sorted += list.length;
      if (sorted >= STEP_ROWS) {
        sorted = 0;
        yield;
      }
    }
  }
  yield;
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
    // Where no hit of the life has a point (OCAP, Dota 2), the killer's last hit is the killing one all the same.
    const placed = list.some((h) => h.local || h.box || h.region);
    for (const h of list) {
      if (h.kind !== 'hit' || h.time > death.time + 0.2) continue;
      h.toDeath = Math.max(0, death.time - h.time);
      if (h.damage === null) known = false;
      else total += h.damage;
      if (h.time < death.time - FATAL_WINDOW) continue;
      if (death.killer && h.shooter && death.killer !== h.shooter) continue;
      h.fatal = true;
      if (h.local || h.box || h.region || !placed) killing = h;
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

  yield;
  hits.forEach((h, i) => (h.id = i));
  const vehicles = new Map<string, VehicleInfo>();
  let counted = 0;
  for (const h of hits) {
    if (++counted % STEP_ROWS === 0) yield;
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

/** Squad's helicopters by their blueprints: the figure they are drawn as. */
const SQUAD_HELI = /heli|loach|uh60|uh1|mi8|mi17|ch146|sa330|mrh90|z8|cas_small|raven|bell|merlin/i;

/**
 * Squad's vehicle rows by actor: each actor's rows that place it (not its
 * hits, shots or seats), in time order, to place a hit in its frame; and the
 * damage of each `damaged` row - the fall of the health from the actor's
 * last before it - by actor and time.
 */
function squadRows(d: Dataset, event: Text, entity: Text, health: Num): { near: (entity: string, t: number) => number; drop: Map<string, { damage: number; health: number }> } {
  const rows = new Map<string, number[]>();
  const drop = new Map<string, { damage: number; health: number }>();
  const last = new Map<string, number>();
  const time = d.time;
  const order = time ? Array.from({ length: d.count }, (_, i) => i).sort((a, b) => time[a] - time[b]) : Array.from({ length: d.count }, (_, i) => i);
  for (const r of order) {
    const e = entity(r);
    if (!e) continue;
    const ev = event(r);
    if (/^(hit|fire|seat|position|wounded|revived|death)$/i.test(ev)) continue;
    let list = rows.get(e);
    if (!list) rows.set(e, (list = []));
    list.push(r);
    const h = health(r);
    if (!Number.isFinite(h)) continue;
    const before = last.get(e);
    if (/^(damaged|destroyed)$/i.test(ev) && before !== undefined) drop.set(`${e}|${time ? time[r] : 0}`, { damage: Math.max(0, before - h), health: h });
    last.set(e, h);
  }
  const near = (e: string, t: number): number => {
    const list = rows.get(e);
    if (!list || !list.length || !time) return list?.[0] ?? -1;
    let lo = 0, hi = list.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (time[list[mid]] < t) lo = mid + 1;
      else hi = mid;
    }
    // The nearer of the row at or after the time and the one before it.
    const a = list[lo];
    const b = lo > 0 ? list[lo - 1] : a;
    return Math.abs(time[a] - t) <= Math.abs(time[b] - t) ? a : b;
  };
  return { near, drop };
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
  return drain(hitsOfSteps(d));
}

/** `hitsOf` in steps (`hitsSteps`): the dataset's hits, worked out once whichever way they are asked for. */
export function* hitsOfSteps(d: Dataset): Generator<void, HitSet, void> {
  let s = cache.get(d);
  if (!s) {
    s = yield* hitsSteps(d);
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

/**
 * Whether a round's type (`VehicleHit.ammoType`) is one that bursts on the
 * surface or blasts through it: high explosive, HEAT, HESH, fragmentation,
 * rockets, missiles, bombs. Armour piercing rounds are kinetic, those with a
 * filler (APHE, APCBC) too: they burst inside, past the plate, not on it.
 */
export function explosiveAmmo(type: string | null): boolean {
  if (!type) return false;
  if (/^(kinetic|AP|ball|solid|shot|shrapnel)/i.test(type)) return false;
  return /explosive|HE|frag|ATGM|missile|rocket|bomb|mine|torpedo|grenade/i.test(type);
}

/** Whether an outcome says the shell got through (did damage or more); null when the data does not say. */
export function penetrated(o: Outcome): boolean | null {
  if (o === 'hit') return null;
  return o !== 'nodamage';
}
