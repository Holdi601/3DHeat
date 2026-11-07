/**
 * What kind of object a unit is, as label rules, display aids and the map
 * sort them: something that flies, something on the ground, a ship, or a
 * weapon in flight. Read from what the data says the unit is - Tacview's type
 * tags (`Air+FixedWing`, `Sea+Watercraft`), War Thunder's kinds (`aircraft`,
 * `spaa`, `tank`), a vehicle name the figure catalogue knows - and nothing
 * else: a unit nothing is known about is on the ground.
 *
 * Worked out once per unit and dataset.
 */

import type { AttributeColumn, Dataset } from '../../state/types';
import { personRows } from '../../data/flight';
import { domainOfType, figureFor } from '../../figures/match';
import { CATALOG, type FigureDomain } from '../../figures/catalog';
import type { Unit } from './units';

export type ObjectCategory = 'air' | 'ground' | 'sea' | 'weapon';

/** The finer kind, for the map's symbols: a helicopter is drawn apart from a jet, a person from a tank. */
export type ObjectShape = 'jet' | 'heli' | 'ground' | 'person' | 'sea' | 'weapon';

const TYPE_COLUMNS = ['Type', 'type', 'kind', 'unitType', 'class'];
const NAME_COLUMNS = ['Name', 'Vehicle', 'vehicle', 'VehicleName'];

function attrs(d: Dataset, names: string[]): AttributeColumn[] {
  const out: AttributeColumn[] = [];
  for (const n of names) {
    const a = d.attrs.find((x) => x.kind === 'category' && x.name.trim() === n);
    if (a && !out.includes(a)) out.push(a);
  }
  return out;
}

function text(a: AttributeColumn, row: number): string {
  return a.categories?.[(a.data as Uint32Array)[row]] ?? '';
}

/** The shape a domain is drawn as. */
export function shapeOfDomain(domain: FigureDomain | null): ObjectShape | null {
  switch (domain) {
    case 'air':
      return 'jet';
    case 'heli':
      return 'heli';
    case 'sea':
      return 'sea';
    case 'missile':
      return 'weapon';
    case 'ground':
      return 'ground';
    case 'person':
      return 'person';
    default:
      return null;
  }
}

/** The category of a shape. */
export function categoryOfShape(s: ObjectShape): ObjectCategory {
  return s === 'jet' || s === 'heli'
    ? 'air'
    : s === 'sea'
      ? 'sea'
      : s === 'weapon'
        ? 'weapon'
        : 'ground';
}

/**
 * A thing's shape from its type texts and names: a type tag first (it says
 * the domain plainly), then the figure the names match, else null.
 */
export function shapeOf(types: string[], names: string[]): ObjectShape | null {
  for (const t of types) {
    // A combined Tacview tag ("Ground+Light+Human+Air+Parachutist") is read whole by the rules.
    const s = shapeOfDomain(domainOfType(t));
    if (s) return s;
  }
  const f = figureFor(names.filter(Boolean), types.filter(Boolean));
  return f ? shapeOfDomain(CATALOG[f]?.domain ?? null) : null;
}

const cache = new WeakMap<Dataset, Map<string, ObjectShape>>();

/** A unit's shape: a weapon is one whatever else it says. */
export function unitShape(d: Dataset, u: Unit): ObjectShape {
  if (u.kind === 'weapon') return 'weapon';
  let m = cache.get(d);
  if (!m) cache.set(d, (m = new Map()));
  const hit = m.get(u.key);
  if (hit) return hit;
  const idx = personRows(d);
  const types = attrs(d, TYPE_COLUMNS);
  const names = attrs(d, NAME_COLUMNS);
  let shape: ObjectShape | null = null;
  if (idx) {
    for (const p of u.persons) {
      if (idx.start[p + 1] === idx.start[p]) continue;
      const row = idx.rows[idx.start[p]];
      shape = shapeOf(
        types.map((a) => text(a, row)),
        [...names.map((a) => text(a, row)), u.vehicle],
      );
      if (shape) break;
    }
  }
  // Nothing said: a player of a shooter walks, anything else is a vehicle on the ground.
  const out = shape ?? (d.entitySize ? 'person' : 'ground');
  m.set(u.key, out);
  return out;
}

/** A unit's category. */
export function unitCategory(d: Dataset, u: Unit): ObjectCategory {
  return categoryOfShape(unitShape(d, u));
}
