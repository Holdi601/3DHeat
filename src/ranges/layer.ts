/**
 * The engagement ranges of a frame: which units get them (the ones in
 * question, their team, or all - nearest the camera first, at most
 * `maxUnits`), what each carries (`catalog.ts`, `loadout.ts`), the shells
 * (`shells.ts`) and, for the first `MAX_VIEWS` of them with a weapon the line
 * of sight limits, their views (`viewshed.ts`), each in a slot it keeps while
 * it is shown.
 */

import { create } from 'zustand';
import type { Dataset } from '../state/types';
import type { RangeDraw } from '../render/types';
import { CATALOG } from '../figures/catalog';
import { RANGES, detectRangeGame, unitWeapons, type GameCatalogue, type UnitWeapon, type WeaponRange } from './catalog';
import { Loadouts } from './loadout';
import { buildShells, dropReach, weaponColour, type RangeUnit } from './shells';
import type { RangeSettings } from './settings';
import { MAX_VIEWS } from './viewshedShaders';
import type { RangeView } from './viewshed';
import { VIEW_ASPECT, VIEW_REACH, ViewFov, gameViewDistance } from './view';
import { PASSIVE_SENSOR, RecordedRadars, gameSensors, sectorShape, sensorBands, sensorsFor, type SensorSpec } from './sensors';
import { localRangesReady, localSight } from './local';

/** Counts the local catalogues' arrivals (`local.ts`): the units' weapons and sensors are worked out again. */
let localStamp = 0;
void localRangesReady.then((games) => {
  if (games.length) localStamp++;
});

/** The units shown and their weapons, for the panel (changes when the set does, not every frame). */
export const useRangeInfo = create<{ units: { person: number; weapons: UnitWeapon[]; colours: [number, number, number][]; fov: number | null; sensors: SensorSpec[] }[]; reading: boolean; game: string | null }>(() => ({ units: [], reading: false, game: null }));

export interface RangeTrack {
  person: number;
  row: number;
  x: number;
  y: number;
  z: number;
  fwd: [number, number, number];
  /** Where it looks, when the data says (a player's view, a sight); else its nose. */
  look?: [number, number, number] | null;
  /** Where its turret points (the hull's pitch) and its gun, when the data says; turret- and gun-mounted sensors follow them. */
  turret?: [number, number, number] | null;
  gun?: [number, number, number] | null;
  team: number;
}

export interface RangeContext {
  settings: RangeSettings;
  /** The figure of a row. */
  kindOf: (row: number) => string | null;
  /** The vehicle a person is in, as the data names it ('' none). */
  vehicleOf: (person: number) => string;
  /** Persons in question (followed, selected, target, measured). */
  selected: ReadonlySet<number>;
  colourOf: (person: number) => [number, number, number];
  camera: ArrayLike<number>;
  origin: ArrayLike<number>;
  /** Data units a metre. */
  k: number;
  /** Data seconds now. */
  t: number;
  /** The floor the data stands on, for a bomb's fall. */
  floorY: number;
}

/** Eye above the unit's position, metres, by figure domain. */
const EYE: Record<string, number> = { person: 1.6, ground: 2.5, sea: 10, air: 0, heli: 0 };
/** Faces of the views retaken a frame at most (a setting for probes; 3 by default). */
export const rangeTuning = { facesPerFrame: 3 };

export class RangeLayer {
  readonly loadouts = new Loadouts();
  private d: Dataset | null = null;
  private version = -1;
  private readonly weapons = new Map<string, UnitWeapon[]>();
  private readonly slots = new Map<number, number>();
  private readonly last = new Map<number, { x: number; y: number; z: number; t: number; speed: number }>();
  private readonly out = { data: new Float32Array(0), count: 0, coneStart: 0 };
  private infoKey = '';
  /** The game the table is from (`catalog.ts`), worked out again once all its weapon names are read. */
  private game: GameCatalogue | null = null;
  private readonly fov = new ViewFov();
  private readonly radars = new RecordedRadars();
  private gameSensorList: { game: GameCatalogue | null; list: SensorSpec[] } = { game: null, list: [] };
  /** The local catalogues' arrival this layer has taken in (`local.ts`). */
  private localSeen = -1;

  /** A unit's sensors now: the recorded radar where the recording has it on (over the specification's radar), and the specified others. */
  private sensorsNow(d: Dataset, row: number, vehicle: string, figure: string | null): SensorSpec[] {
    if (this.gameSensorList.game !== this.game) this.gameSensorList = { game: this.game, list: gameSensors(this.game) };
    const spec = sensorsFor(this.gameSensorList.list, vehicle, figure, this.game);
    const rec = this.radars.at(d, row);
    if (!rec) return spec;
    const radar = spec.find((s) => s.kind === 'radar');
    const hw = Number.isFinite(rec.h) ? rec.h / 2 : radar ? (radar.az[1] - radar.az[0]) / 2 : 60;
    const vw = Number.isFinite(rec.v) ? rec.v / 2 : radar ? (radar.el[1] - radar.el[0]) / 2 : 30;
    const recorded: SensorSpec = { id: 'recorded-radar', kind: 'radar', name: radar?.name ?? 'Radar', match: /(?!)/, range: rec.range, az: [rec.az - hw, rec.az + hw], el: [rec.el - vw, rec.el + vw], rcsRef: radar?.rcsRef ?? null, src: 'game', recorded: true };
    return [recorded, ...spec.filter((s) => s !== radar)];
  }

  /** Reads more of the table's weapon names; true while there is more to read. */
  step(d: Dataset): boolean {
    return this.loadouts.step(d);
  }

  private weaponsOf(person: number, figure: string | null, vehicle: string): UnitWeapon[] {
    const key = `${person}\u0001${figure ?? ''}\u0001${vehicle}`;
    let w = this.weapons.get(key);
    if (!w) {
      w = unitWeapons(figure, this.loadouts.of(person), RANGES, this.game, vehicle);
      this.weapons.set(key, w);
    }
    return w;
  }

  build(d: Dataset, tracks: readonly RangeTrack[], c: RangeContext): RangeDraw | null {
    if (d !== this.d) {
      this.d = d;
      this.weapons.clear();
      this.slots.clear();
      this.last.clear();
    }
    if (this.loadouts.version !== this.version || this.localSeen !== localStamp) {
      this.version = this.loadouts.version;
      this.localSeen = localStamp;
      this.gameSensorList = { game: null, list: [] };
      this.weapons.clear();
      this.game = detectRangeGame(d.name ?? '', d.attrs.map((a) => a.name), this.loadouts.all());
    }
    const s = c.settings;
    const teams = new Set<number>();
    for (const tr of tracks) if (c.selected.has(tr.person)) teams.add(tr.team);
    const chosen: { tr: RangeTrack; figure: string | null; weapons: WeaponRange[]; colours: [number, number, number][]; palette: [number, number, number][]; all: UnitWeapon[]; sensors: SensorSpec[]; dist: number }[] = [];
    for (const tr of tracks) {
      const ok = s.units === 'all' || c.selected.has(tr.person) || (s.units === 'team' && tr.team >= 0 && teams.has(tr.team));
      if (!ok || tr.row < 0) continue;
      const figure = c.kindOf(tr.row);
      const all = this.weaponsOf(tr.person, figure, c.vehicleOf(tr.person));
      // Each weapon its colour in the team's family, by its place in all the unit carries (kept when kinds are turned off).
      const team = c.colourOf(tr.person);
      const palette = all.map((_, i) => weaponColour(team, i));
      const weapons: WeaponRange[] = [];
      const colours: [number, number, number][] = [];
      all.forEach((w, i) => {
        if (!s.weapons || !s.classes[w.weapon.cls]) return;
        weapons.push(w.weapon);
        colours.push(palette[i]);
      });
      const sensors = s.sensors ? this.sensorsNow(d, tr.row, c.vehicleOf(tr.person), figure) : [];
      if (!weapons.length && !s.view && !sensors.length) continue;
      const dist = Math.hypot(tr.x - c.camera[0], tr.y - c.camera[1], tr.z - c.camera[2]);
      chosen.push({ tr, figure, weapons, colours, palette, all, sensors, dist });
    }
    // The ones in question first, then the nearest.
    chosen.sort((a, b) => Number(c.selected.has(b.tr.person)) - Number(c.selected.has(a.tr.person)) || a.dist - b.dist);
    chosen.length = Math.min(chosen.length, s.maxUnits);

    // Views: slots kept by who holds them; the rest given out in order.
    const viewed = chosen.filter((u) => s.view || u.sensors.length || u.weapons.some((w) => w.los)).slice(0, MAX_VIEWS);
    const keep = new Set(viewed.map((u) => u.tr.person));
    for (const [p] of this.slots) if (!keep.has(p)) this.slots.delete(p);
    const used = new Set(this.slots.values());
    for (const u of viewed) {
      if (this.slots.has(u.tr.person)) continue;
      let slot = 0;
      while (used.has(slot)) slot++;
      this.slots.set(u.tr.person, slot);
      used.add(slot);
    }

    const views: (RangeView | null)[] = Array.from({ length: MAX_VIEWS }, () => null);
    const units: RangeUnit[] = [];
    const fovs = new Map<number, number>();
    for (const u of chosen) {
      const { tr } = u;
      const domain = u.figure ? (CATALOG[u.figure.replace(/@.*$/, '')]?.domain ?? 'person') : 'person';
      const eye = (EYE[domain] ?? 1.5) * c.k;
      // Speed from the last frame's place, for a bomb's throw.
      const prev = this.last.get(tr.person);
      let speed = prev?.speed ?? 0;
      if (prev && c.t > prev.t) speed = Math.hypot(tr.x - prev.x, tr.y - prev.y, tr.z - prev.z) / (c.t - prev.t) / c.k;
      this.last.set(tr.person, { x: tr.x, y: tr.y, z: tr.z, t: c.t, speed });
      const height = Math.max(0, (tr.y - c.floorY) / c.k);
      const slot = this.slots.get(tr.person) ?? -1;
      const y = tr.y + eye;
      // The view cone: as wide as the game's view (narrower through a sight), as long as the visual range.
      let view: RangeUnit['view'];
      let viewLength = 0;
      if (s.view) {
        const across = this.fov.at(d, this.game, tr.person, tr.row, c.t, localSight(this.game, c.vehicleOf(tr.person), u.figure));
        fovs.set(tr.person, across);
        viewLength = s.viewLength > 0 ? s.viewLength : (gameViewDistance(this.game) ?? VIEW_REACH[domain] ?? 400);
        const tanH = Math.tan((across * Math.PI) / 360);
        const team = c.colourOf(tr.person);
        view = { length: viewLength * c.k, tanH, tanV: tanH / VIEW_ASPECT, fwd: tr.look ?? tr.fwd, colour: [team[0] * 0.6 + 0.4, team[1] * 0.6 + 0.4, team[2] * 0.6 + 0.4] };
      }
      // The sensors' sectors about the nose, each in a pale shade of the side's colour.
      const sectors: NonNullable<RangeUnit['sectors']> = u.sensors.map((sn, i) => {
        // A turret's or a gun's sensor (a sight's rangefinder, a turret radar) turns with it where the data says.
        const base = (sn.mount === 'gun' ? (tr.gun ?? tr.turret) : sn.mount === 'turret' ? (tr.turret ?? tr.gun) : null) ?? tr.fwd;
        const shape = sectorShape(base, sn.az, sn.el);
        const b = sensorBands(sn);
        const col = weaponColour(c.colourOf(tr.person), 5 + i);
        return {
          bands: [b[0] * c.k, b[1] * c.k, b[2] * c.k] as [number, number, number],
          dome: shape.dome,
          el: sn.el,
          fwd: shape.dome ? base : shape.fwd,
          tanH: shape.dome ? 0 : shape.tanH,
          tanV: shape.dome ? 0 : shape.tanV,
          colour: [col[0] * 0.7 + 0.3, col[1] * 0.7 + 0.3, col[2] * 0.7 + 0.3] as [number, number, number],
          // Passive warning receivers and sonar are not limited by what is in view.
          los: !PASSIVE_SENSOR.test(sn.kind),
        };
      });
      units.push({ person: tr.person, x: tr.x - c.origin[0], y: y - c.origin[1], z: tr.z - c.origin[2], fwd: tr.fwd, height, speed, weapons: u.weapons, colours: u.colours, view, sectors, slot });
      if (slot >= 0) {
        const los = u.weapons.filter((w) => w.los);
        const reach = (w: WeaponRange) => (w.shape === 'drop' ? dropReach(w, height, speed) : w.max);
        const max = Math.max(viewLength, ...los.map(reach), ...u.sensors.filter((sn) => !PASSIVE_SENSOR.test(sn.kind)).map((sn) => sn.range));
        const far = max * c.k * 1.05;
        views[slot] = {
          id: tr.person,
          eye: [tr.x, y, tr.z],
          far,
          tolerance: Math.max(0.5 * c.k, far * 0.003),
          band: los.length ? [Math.min(...los.map((w) => w.min)) * c.k, Math.max(...los.map((w) => Math.min(w.opt, reach(w)))) * c.k, max * c.k] : [0, max * 0.5 * c.k, max * c.k],
          colour: c.colourOf(tr.person),
          // Only the view cone: the ground shaded is what lies in it.
          cone: !los.length && !u.sensors.length && view ? { fwd: view.fwd, tanH: view.tanH } : null,
        };
      }
    }
    buildShells(units, s, c.k, RANGES.colours, this.out);

    const key = chosen.map((u) => `${u.tr.person}:${u.all.length}:${Math.round(fovs.get(u.tr.person) ?? -1)}:${u.sensors.map((x) => x.id).join('+')}`).join(',') + `|${this.loadouts.done}`;
    if (key !== this.infoKey) {
      this.infoKey = key;
      useRangeInfo.setState({ units: chosen.map((u) => ({ person: u.tr.person, weapons: u.all, colours: u.palette, fov: fovs.get(u.tr.person) ?? null, sensors: u.sensors })), reading: !this.loadouts.done, game: this.game?.name ?? null });
    }
    if (!this.out.count && !views.some((v) => v)) return null;
    return {
      shells: this.out.data,
      count: this.out.count,
      coneStart: this.out.coneStart,
      opacity: s.opacity,
      faces: s.style !== 'lines',
      lines: s.style !== 'glass',
      los: s.los,
      ground: s.ground,
      views,
      facesPerFrame: rangeTuning.facesPerFrame,
      bias: 0.5 * c.k,
    };
  }

  /** Forget the panel's list (the ranges turned off). */
  clearInfo(): void {
    if (this.infoKey) {
      this.infoKey = '';
      useRangeInfo.setState({ units: [], reading: false, game: null });
    }
  }
}
