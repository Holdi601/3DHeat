/**
 * What the vehicle heatmap shows, from the loaded data and the settings: the
 * hits the data holds, the vehicle picked (the most-hit one until one is),
 * the figure it is drawn as, and the hits that pass the filters. Kept while
 * neither changes, so the engine can ask every frame.
 */

import type { Dataset } from '../state/types';
import type { VehicleState } from '../state/vehicleStore';
import { filterHits, hitsOf, type HitSet, type VehicleHit, type VehicleInfo } from './hits';
import { figureOfVehicle } from './scene';

export interface VehicleView {
  set: HitSet | null;
  vehicle: VehicleInfo | null;
  figure: string | null;
  /** The hits of the vehicle that pass the filters and the layer. */
  hits: VehicleHit[];
  /** All of the vehicle's hits of the layer's kind, before the other filters: what the filter lists offer. */
  all: VehicleHit[];
  /** Every hit on the vehicle with a point, whatever the layer and filters: what places them on the figure (`fit.ts`). */
  placed: VehicleHit[];
  /** Hits on the vehicle without a point (an old conversion, or a point in another frame). */
  unplaced: number;
}

const EMPTY: VehicleView = { set: null, vehicle: null, figure: null, hits: [], all: [], placed: [], unplaced: 0 };

const placedCache = new WeakMap<HitSet, Map<string, VehicleHit[]>>();

/** A vehicle's hits with a point, kept per hit set so the fit is made once. */
function placedOf(set: HitSet, vehicle: string): VehicleHit[] {
  let m = placedCache.get(set);
  if (!m) placedCache.set(set, (m = new Map()));
  let list = m.get(vehicle);
  if (!list) m.set(vehicle, (list = set.hits.filter((h) => h.vehicle === vehicle && h.local !== null && h.kind === 'hit')));
  return list;
}

let last: { d: Dataset | null; vehicle: string | null; matches: unknown; shooters: unknown; weapons: unknown; layer: string; out: VehicleView } | null = null;

export function vehicleView(d: Dataset | null, s: Pick<VehicleState, 'vehicle' | 'matches' | 'shooters' | 'weapons' | 'layer'>): VehicleView {
  if (last && last.d === d && last.vehicle === s.vehicle && last.matches === s.matches && last.shooters === s.shooters && last.weapons === s.weapons && last.layer === s.layer) return last.out;
  let out = EMPTY;
  if (d) {
    const set = hitsOf(d);
    const list = [...set.vehicles.values()].sort((a, b) => b.hits + b.modules - (a.hits + a.modules));
    const vehicle = (s.vehicle ? set.vehicles.get(s.vehicle) : undefined) ?? list[0] ?? null;
    if (vehicle) {
      const all = filterHits(set, { vehicle: vehicle.id, matches: null, shooters: null, weapons: null, layer: s.layer });
      const hits = filterHits(set, { vehicle: vehicle.id, matches: s.matches, shooters: s.shooters, weapons: s.weapons, layer: s.layer });
      out = { set, vehicle, figure: figureOfVehicle(vehicle), hits, all, placed: placedOf(set, vehicle.id), unplaced: set.unplacedBy.get(vehicle.id) ?? 0 };
    } else out = { ...EMPTY, set };
  }
  last = { d, vehicle: s.vehicle, matches: s.matches, shooters: s.shooters, weapons: s.weapons, layer: s.layer, out };
  return out;
}
