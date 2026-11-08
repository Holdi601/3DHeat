/**
 * What the vehicle heatmap shows, from the loaded data and the settings: the
 * hits the data holds, the vehicle picked (the most-hit one until one is),
 * the figure it is drawn as, its hits placed on that figure (World of Tanks'
 * component points, `boxes.ts`), and those that pass the filters. Kept while
 * neither changes, so the engine can ask every frame.
 */

import type { Dataset } from '../state/types';
import type { VehicleState } from '../state/vehicleStore';
import { filterList, hitsOf, type HitSet, type VehicleHit, type VehicleInfo } from './hits';
import { figureOfVehicle, templateOfFigure } from './scene';
import { placeBoxHits } from './boxes';
import { CATALOG } from '../figures/catalog';
import { areaKeep, inArea } from './area';

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
  /** Hits on the vehicle without a point (an old conversion). */
  unplaced: number;
  /**
   * Whether the hits are moved onto the figure (`fit.ts`): for points in a
   * game model's own frame, not for those already in the figure's (CS2's
   * body, World of Tanks' component boxes).
   */
  fits: boolean;
  /** Whether the volumes drawn on the level restrict the hits, and how many of the vehicle's hits of the layer they leave out. */
  area: boolean;
  areaOut: number;
  /** The vehicle's hits of the layer before the area: what the area's counts are of. */
  beforeArea: VehicleHit[];
  /** Whether any hit of the vehicle has a point or a body part to show on the figure. */
  anyPoint: boolean;
}

const EMPTY: VehicleView = { set: null, vehicle: null, figure: null, hits: [], all: [], placed: [], unplaced: 0, fits: false, area: false, areaOut: 0, beforeArea: [], anyPoint: false };

const vehicleCache = new WeakMap<HitSet, Map<string, { all: VehicleHit[]; placed: VehicleHit[] }>>();

/** A vehicle's hits placed on its figure, and those with a point: kept per hit set so the fit is made once. */
function hitsOfVehicle(set: HitSet, vehicle: string, figure: string): { all: VehicleHit[]; placed: VehicleHit[] } {
  let m = vehicleCache.get(set);
  if (!m) vehicleCache.set(set, (m = new Map()));
  const key = `${vehicle}\u0000${figure}`;
  let v = m.get(key);
  if (!v) {
    const own = set.hits.filter((h) => h.vehicle === vehicle);
    const t = templateOfFigure(figure);
    const all = t ? placeBoxHits(own, t.min, t.max) : own;
    v = { all, placed: all.filter((h) => h.local !== null && h.kind === 'hit') };
    m.set(key, v);
  }
  return v;
}

type Choice = Pick<VehicleState, 'vehicle' | 'matches' | 'shooters' | 'weapons' | 'layer' | 'outcomes' | 'areaBy'>;
const KEYS: (keyof Choice)[] = ['vehicle', 'matches', 'shooters', 'weapons', 'layer', 'outcomes', 'areaBy'];
let last: { d: Dataset | null; s: Choice; keep: ReturnType<typeof areaKeep>; out: VehicleView } | null = null;

export function vehicleView(d: Dataset | null, s: Choice): VehicleView {
  const keep = areaKeep();
  if (last && last.d === d && last.keep === keep && KEYS.every((k) => last!.s[k] === s[k])) return last.out;
  let out = EMPTY;
  if (d) {
    const set = hitsOf(d);
    const list = [...set.vehicles.values()].sort((a, b) => b.hits + b.modules - (a.hits + a.modules));
    const vehicle = (s.vehicle ? set.vehicles.get(s.vehicle) : undefined) ?? list[0] ?? null;
    if (vehicle) {
      const figure = figureOfVehicle(vehicle);
      const own = hitsOfVehicle(set, vehicle.id, figure);
      const layer = filterList(own.all, { vehicle: null, matches: null, shooters: null, weapons: null, layer: s.layer });
      // The area first: the filter lists offer what is in it.
      const all = keep ? inArea(d, set, layer, keep, s.areaBy) : layer;
      const hits = filterList(all, { vehicle: null, matches: s.matches, shooters: s.shooters, weapons: s.weapons, outcomes: s.outcomes, layer: s.layer });
      const person = CATALOG[figure]?.domain === 'person';
      const fits = !person && !own.all.some((h) => h.box !== null);
      const anyPoint = own.all.some((h) => h.local !== null || h.box !== null || h.region !== null);
      out = { set, vehicle, figure, hits, all, placed: own.placed, unplaced: set.unplacedBy.get(vehicle.id) ?? 0, fits, area: !!keep, areaOut: layer.length - all.length, beforeArea: layer, anyPoint };
    } else out = { ...EMPTY, set };
  }
  last = { d, keep, s: { vehicle: s.vehicle, matches: s.matches, shooters: s.shooters, weapons: s.weapons, layer: s.layer, outcomes: s.outcomes, areaBy: s.areaBy }, out };
  return out;
}
