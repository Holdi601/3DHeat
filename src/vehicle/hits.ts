/**
 * The hits on vehicles a recording holds, each in the frame of the vehicle
 * that was hit: what the vehicle heatmap paints on its figure.
 *
 * Read from columns any converter can write (the convention, metres in the
 * figure frame: x forward, y up, z right):
 *
 *   hitLocalX/Y/Z   the hit point on the unit hit, in its own frame
 *   hitDirX/Y/Z     the way the shot travelled, in the same frame (optional)
 *   otherVehicle    the vehicle hit, when the row is the shooter's
 *   otherLife       that unit's life, to tie hits to its death (optional)
 *   hitPart         a number the game gives the hit (optional)
 *   hitgroup        the body part hit (a shooter's people: no point, a region)
 *
 * War Thunder's converter writes these on its `shot` rows (the shooter's row,
 * the unit hit as `other`); a CS2 table its `hurt` rows (the victim's row,
 * the attacker as `other`, the region as `hitgroup`). A War Thunder
 * `module_destroyed` row names the unit and a part number only; it is placed
 * where the last hit on that unit landed just before.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import type { Vec3 } from '../race/geometry';

export type HitKind = 'hit' | 'module';

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
  /** The point in the vehicle's frame (m: x forward, y up, z right); null when only a region is known. */
  local: Vec3 | null;
  /** The way the shot travelled in the vehicle's frame, a unit vector; null when not known. */
  dir: Vec3 | null;
  /** The body region (CS2 hitgroup), or null. */
  region: string | null;
  /** A destroyed module's number, or the hit's part number as sent; null when none. */
  part: number | null;
  damage: number | null;
  /** The hit was among those that killed: on the life, by its killer, in the moments before it died. */
  fatal: boolean;
  kind: HitKind;
}

export type HitSource = 'warthunder' | 'cs2' | 'generic' | 'none';

export interface HitSet {
  hits: VehicleHit[];
  source: HitSource;
  /** Hits whose rows name a vehicle but carry no point (converted before the columns existed, or a point the game sent in another frame). */
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

function num(d: Dataset, ...names: string[]): Num | null {
  const a = find(d, ...names);
  if (!a || a.kind === 'category') return null;
  const data = a.data as Float32Array;
  return (r) => data[r];
}

/** Events that end a life. */
const DEATH = /^(death|dead|destroyed|killed|player_death)$/i;
/** Seconds before a death in which its killer's hits count as the killing ones. */
export const FATAL_WINDOW = 2.5;
/** Seconds before a destroyed module in which the last hit on the unit is where it was. */
export const MODULE_WINDOW = 0.6;

const CS2_HIT = /^(hurt|player_hurt)$/i;
const WT_SHOT = /^shot$/i;
const MODULE = /^module_destroyed$/i;
const PART = /(\d+)\s*$/;

/**
 * Every hit on a vehicle the dataset holds. One pass over the rows; nothing
 * is kept of rows that are not hits.
 */
export function hitsFromDataset(d: Dataset): HitSet {
  const event = text(d, 'event', 'events', 'event type', 'eventType');
  const player = text(d, 'player', 'name');
  const other = text(d, 'other');
  const vehicleCol = text(d, 'Vehicle', 'vehicle');
  const otherVehicle = text(d, 'otherVehicle');
  const life = text(d, 'life');
  const otherLife = text(d, 'otherLife');
  const weapon = text(d, 'weaponName', 'weapon');
  const weaponRaw = text(d, 'weapon');
  const hitgroup = text(d, 'hitgroup');
  const matchCol = find(d, 'match') ? text(d, 'match') : null;
  const session = d.sessionId;
  const match: Text = matchCol ?? ((r) => (session ? (d.sessionLabels[session[r]] ?? '') : ''));
  const lx = num(d, 'hitLocalX');
  const ly = num(d, 'hitLocalY');
  const lz = num(d, 'hitLocalZ');
  const dx = num(d, 'hitDirX');
  const dy = num(d, 'hitDirY');
  const dz = num(d, 'hitDirZ');
  const partCol = num(d, 'hitPart');
  const damageCol = num(d, 'damage', 'value');
  const healthCol = num(d, 'health');
  const time = d.time;
  const hasLocal = !!(lx && ly && lz);
  const hasGroups = !!find(d, 'hitgroup');
  const hasEvents = !!find(d, 'event', 'events', 'event type', 'eventType');

  const hits: VehicleHit[] = [];
  const modules: { row: number; part: number | null }[] = [];
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
  let source: HitSource = 'none';
  if (!hasEvents && !hasLocal) return { hits, source, unplaced, unplacedBy: new Map(), vehicles: new Map() };

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
    // A hit with a point: the shooter's row (War Thunder) or any row that names the vehicle hit.
    const x = hasLocal ? lx!(r) : NaN;
    const y = hasLocal ? ly!(r) : NaN;
    const z = hasLocal ? lz!(r) : NaN;
    const placed = Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) && (x !== 0 || y !== 0 || z !== 0);
    if (WT_SHOT.test(ev) || (placed && !CS2_HIT.test(ev))) {
      const vehicle = otherVehicle(r);
      if (!placed) {
        if (vehicle) {
          unplaced++;
          unplacedBy.set(vehicle, (unplacedBy.get(vehicle) ?? 0) + 1);
        }
        continue;
      }
      let dir: Vec3 | null = null;
      if (dx && dy && dz) {
        const a = dx(r), b = dy(r), c = dz(r);
        const n = Math.hypot(a, b, c);
        if (Number.isFinite(n) && n > 1e-6) dir = [a / n, b / n, c / n];
      }
      const part = partCol ? partCol(r) : NaN;
      hits.push({
        vehicle: vehicle || vehicleCol(r),
        victim: other(r),
        life: otherLife(r),
        shooter: player(r),
        shooterVehicle: vehicleCol(r),
        weapon: weapon(r),
        match: match(r),
        time: t,
        local: [x, y, z],
        dir,
        region: null,
        part: Number.isFinite(part) ? part : null,
        damage: null,
        fatal: false,
        kind: 'hit',
      });
      source = WT_SHOT.test(ev) ? 'warthunder' : source === 'none' ? 'generic' : source;
      continue;
    }
    if (hasGroups && CS2_HIT.test(ev)) {
      const g = hitgroup(r).trim().toLowerCase();
      if (!g) continue;
      const dmg = damageCol ? damageCol(r) : NaN;
      const health = healthCol ? healthCol(r) : NaN;
      hits.push({
        vehicle: 'soldier',
        victim: player(r),
        life: '',
        shooter: other(r),
        shooterVehicle: '',
        weapon: weapon(r),
        match: match(r),
        time: t,
        local: null,
        dir: null,
        region: g,
        part: null,
        damage: Number.isFinite(dmg) ? dmg : null,
        // The hurt that leaves no health is the one that killed.
        fatal: Number.isFinite(health) && health <= 0,
        kind: 'hit',
      });
      source = 'cs2';
    }
  }

  // Hits by life (or by victim where lives are not named), in time order, for deaths and modules.
  const byLife = new Map<string, VehicleHit[]>();
  const keyOf = (lifeId: string, victim: string, m: string) => (lifeId ? `L${m}\u0000${lifeId}` : `V${m}\u0000${victim}`);
  for (const h of hits) {
    if (h.local === null) continue;
    const k = keyOf(h.life, h.victim, h.match);
    let list = byLife.get(k);
    if (!list) byLife.set(k, (list = []));
    list.push(h);
  }
  for (const list of byLife.values()) list.sort((a, b) => a.time - b.time);

  for (const death of deaths) {
    const list = byLife.get(keyOf(death.life, death.victim, death.match)) ?? findLife(byLife, death.life, death.victim);
    if (!list) continue;
    for (const h of list) {
      if (h.time > death.time + 0.2 || h.time < death.time - FATAL_WINDOW) continue;
      if (death.killer && h.shooter && death.killer !== h.shooter) continue;
      h.fatal = true;
    }
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
        if (h.time >= t - MODULE_WINDOW) last = h;
      }
    }
    hits.push({
      vehicle: vehicleCol(r),
      victim,
      life: lifeId,
      shooter: other(r) || last?.shooter || '',
      shooterVehicle: last?.shooterVehicle ?? '',
      weapon: last?.weapon ?? '',
      match: match(r),
      time: t,
      local: last?.local ?? null,
      dir: last?.dir ?? null,
      region: null,
      part: m.part,
      damage: null,
      fatal: false,
      kind: 'module',
    });
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
        kind: row !== undefined ? kindCol(row) : h.vehicle === 'soldier' ? 'person' : '',
        hits: 0,
        modules: 0,
      };
      vehicles.set(h.vehicle, v);
    }
    if (h.kind === 'module') v.modules++;
    else v.hits++;
  }
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
  layer: 'all' | 'kills' | 'modules';
}

export function filterHits(set: HitSet, f: HitFilter): VehicleHit[] {
  const ms = f.matches ? new Set(f.matches) : null;
  const ss = f.shooters ? new Set(f.shooters) : null;
  const ws = f.weapons ? new Set(f.weapons) : null;
  return set.hits.filter(
    (h) =>
      (f.vehicle === null || h.vehicle === f.vehicle) &&
      (f.layer === 'modules' ? h.kind === 'module' : h.kind === 'hit') &&
      (f.layer !== 'kills' || h.fatal) &&
      (!ms || ms.has(h.match)) &&
      (!ss || ss.has(h.shooter)) &&
      (!ws || ws.has(h.weapon || h.shooterVehicle)),
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
