/**
 * The vehicle heatmap on the engine's stage: the scene built from the loaded
 * data and the settings each frame (nothing rebuilt while nothing changed),
 * the colour ramp the heatmap uses, and the turntable - the camera kept on a
 * circle round the vehicle, turning by itself while the turntable is on,
 * and turned by hand otherwise: the mouse looks, which on the circle is
 * walking round it; W and S go in and out.
 */

import { Vector3 } from 'three';
import type { Dataset, HeatColorScheme } from '../state/types';
import { usePlateHover, useVehicleStore } from '../state/vehicleStore';
import { buildColorLut } from '../render/colors';
import type { FlyCamera } from '../render/camera';
import { templateOfFigure, VehicleScene, type VehicleFrame } from './scene';
import { offsetFor, shiftHits } from './fit';
import type { Vec3 } from '../race/geometry';
import { vehicleView } from './view';
import { atRest, namesOf, packUnitOf, plateAt, plateCounts, platesOf, platesOfHits, platesVersion, type Plate, type PlateCount } from './plates';
import { aimOf, type AimNow } from '../figures/aim';
import { placesOf } from './places';
import type { VehicleHit } from './hits';

/** What the plate view shows now (the stage's last build), for the overlay's card: the unit's plates and their hits. */
export interface PlateView {
  list: Plate[];
  counts: PlateCount[];
}
let shownPlates: PlateView | null = null;
export function plateView(): PlateView | null {
  return shownPlates;
}

export type Box = { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number };

export class VehicleStage {
  readonly scene = new VehicleScene();
  private lut: Uint8Array = new Uint8Array(0);
  private lutScheme: HeatColorScheme | null = null;
  private lutKey = 0;
  private figure: string | null = null;
  private frameWanted = false;
  /** The box of the vehicle drawn (world), null when none is. */
  box: Box | null = null;
  /** How far the hits were moved to lie on the figure (m, figure frame). */
  offset: Vec3 = [0, 0, 0];
  private readonly fwd = new Vector3();
  private plateKey: unknown[] = [];
  private plateAtHit: Map<number, number> = new Map();
  private plateCounts: PlateCount[] = [];
  /** Hits on turret and gun plates, their points turned back to the turret's rest (`restPoints`). */
  private atRest = new Map<number, Vec3>();
  private hoverAt: { x: number; y: number } | null = null;
  private hoverT = 0;

  build(d: Dataset | null, scheme: HeatColorScheme): [VehicleFrame, boolean] {
    const s = useVehicleStore.getState();
    const view = vehicleView(d, s);
    if (scheme !== this.lutScheme) {
      this.lutScheme = scheme;
      this.lut = buildColorLut(scheme, this.lut.length ? this.lut : undefined);
      this.lutKey++;
    }
    if (view.figure !== this.figure) {
      this.figure = view.figure;
      this.frameWanted = view.figure !== null;
    }
    this.box = view.figure ? this.scene.bounds(view.figure) : null;
    const tpl = view.figure ? templateOfFigure(view.figure) : null;
    this.offset = tpl && s.fit && view.fits ? offsetFor(tpl, view.placed) : [0, 0, 0];
    // The plates, when asked for and the pack has them: which plate each hit struck (once per hit list), what struck each.
    let plates: { list: Plate[]; counts: PlateCount[]; picked: number } | null = null;
    const list = s.plates ? platesOf(view.figure) : null;
    shownPlates = null;
    if (list && list.length) {
      const unit = packUnitOf(view.figure)!;
      const names = namesOf(unit.game);
      const key = [list, view.all, names, view.hits, platesVersion()];
      if (!same(key, this.plateKey)) {
        if (this.plateKey[0] !== list || this.plateKey[1] !== view.all || this.plateKey[2] !== names) {
          this.plateAtHit = platesOfHits(view.all, list, names);
          this.atRest = d && view.set ? restPoints(d, view.set, view.all, list, this.plateAtHit, view.figure!) : new Map();
        }
        this.plateCounts = plateCounts(view.hits, list, this.plateAtHit);
        this.plateKey = key;
      }
      const hover = usePlateHover.getState().plate;
      plates = { list, counts: this.plateCounts, picked: hover < list.length ? hover : -1 };
      shownPlates = { list, counts: this.plateCounts };
    }
    return this.scene.build({
      plates,
      figure: view.figure ?? '',
      hits: shiftHits(plates && this.atRest.size ? view.hits.map((h) => (this.atRest.has(h.id) ? { ...h, local: this.atRest.get(h.id)! } : h)) : view.hits, this.offset),
      look: { radius: s.radius, exposure: s.exposure, showPoints: s.showPoints, showHeat: s.showHeat, showArrows: s.showArrows, colourBy: s.colourBy },
      lut: this.lut,
      lutKey: this.lutKey,
      selected: s.selected,
    });
  }

  /**
   * A click at canvas pixel (x, y) of a w x h canvas: the hit drawn nearest
   * it is selected (its card opens), or the selection cleared when none is.
   * `viewProj` is the view's world-to-clip matrix (OpenGL depth, mirror in).
   */
  click(x: number, y: number, w: number, h: number, viewProj: Float32Array): void {
    const m = viewProj;
    const project = (px: number, py: number, pz: number): [number, number] | null => {
      const cw = m[3] * px + m[7] * py + m[11] * pz + m[15];
      if (cw <= 1e-6) return null;
      const cx = (m[0] * px + m[4] * py + m[8] * pz + m[12]) / cw;
      const cy = (m[1] * px + m[5] * py + m[9] * pz + m[13]) / cw;
      return [((cx + 1) / 2) * w, ((1 - cy) / 2) * h];
    };
    useVehicleStore.getState().patch({ selected: this.scene.pick(project, [x, y]) });
  }

  /**
   * The pointer at canvas pixel (x, y) (null: off the canvas): the plate under it is the one the overlay names and the
   * view lights. Only while plates are shown, and only when the pointer moved.
   */
  hover(at: { x: number; y: number } | null, w: number, h: number, viewProj: Float32Array): void {
    const shown = shownPlates;
    const was = usePlateHover.getState().plate;
    if (!shown || !at) {
      this.hoverAt = null;
      if (was !== -1) usePlateHover.setState({ plate: -1 });
      return;
    }
    // Asked again when the pointer moved two pixels or more, at most every 40 ms.
    const now = performance.now();
    if (this.hoverAt && (Math.abs(this.hoverAt.x - at.x) + Math.abs(this.hoverAt.y - at.y) < 2 || now - this.hoverT < 40)) return;
    this.hoverAt = { x: at.x, y: at.y };
    this.hoverT = now;
    const m = viewProj;
    const lift = this.scene.lift;
    const project = (px: number, py: number, pz: number): [number, number, number] | null => {
      py += lift;
      const cw = m[3] * px + m[7] * py + m[11] * pz + m[15];
      if (cw <= 1e-6) return null;
      const cx = (m[0] * px + m[4] * py + m[8] * pz + m[12]) / cw;
      const cy = (m[1] * px + m[5] * py + m[9] * pz + m[13]) / cw;
      return [((cx + 1) / 2) * w, ((1 - cy) / 2) * h, cw];
    };
    const i = plateAt(shown.list, project, [at.x, at.y]);
    if (i !== was) usePlateHover.setState({ plate: i });
  }

  /** Whether the view should frame the vehicle (a new one is shown); asked once. */
  takeFrameRequest(): boolean {
    const w = this.frameWanted;
    this.frameWanted = false;
    return w && this.box !== null;
  }

  /**
   * Frames the vehicle: from the front left and a little above unless the
   * view is kept, as close as the whole of it fits however the turntable
   * turns it - its longest side across the view, its height (and, seen from
   * above, its length) up it.
   */
  frameCamera(cam: FlyCamera, fovDeg: number, aspect: number, mirror: [number, number, number], keep: boolean): void {
    const b = this.box;
    if (!b) return;
    // From ahead and to the left (yaw 130: looking back along -x, towards +z).
    if (!keep) cam.setOrientationDegrees(130, -18);
    const across = Math.max(b.maxX - b.minX, b.maxZ - b.minZ);
    const height = b.maxY - b.minY;
    const p = Math.abs(cam.pitch);
    const tv = Math.tan((fovDeg * Math.PI) / 360);
    const th = tv * Math.max(0.2, aspect);
    const up = 0.5 * (height * Math.cos(p) + across * Math.sin(p)) * 1.1;
    const side = 0.5 * across * 1.05;
    // The near half of the vehicle is nearer the eye than its middle: back off by a quarter of it.
    const dist = Math.max(up / tv, side / th) + across * 0.25;
    const f = cam.forward(this.fwd);
    const cx = ((b.minX + b.maxX) / 2) * mirror[0], cy = ((b.minY + b.maxY) / 2) * mirror[1], cz = ((b.minZ + b.maxZ) / 2) * mirror[2];
    cam.position.set(cx - f.x * dist, cy - f.y * dist, cz - f.z * dist);
    cam.speed = Math.max(0.5, across * 0.5);
    cam.focusDistance = dist;
    cam.orthoHeight = 2.2 * Math.max(up, side / Math.max(0.2, aspect));
    cam.moved = true;
  }

  /**
   * Keeps the camera on its circle round the vehicle's middle, looking at it,
   * at the distance it is at; turns it round while the turntable is on.
   * `mirror` is the view's axis mirror (display = world x mirror). True when
   * the camera moved.
   */
  orbit(cam: FlyCamera, dt: number, mirror: [number, number, number]): boolean {
    const b = this.box;
    if (!b) return false;
    const s = useVehicleStore.getState();
    const cx = ((b.minX + b.maxX) / 2) * mirror[0];
    const cy = ((b.minY + b.maxY) / 2) * mirror[1];
    const cz = ((b.minZ + b.maxZ) / 2) * mirror[2];
    const size = Math.max(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ, 0.5);
    if (s.turntable && s.spin !== 0) cam.yaw += ((s.spin * Math.PI) / 180) * Math.min(dt, 0.1);
    const dist = Math.max(size * 0.3, Math.min(size * 20, cam.position.distanceTo(new Vector3(cx, cy, cz))));
    const f = cam.forward(this.fwd);
    const x = cx - f.x * dist, y = cy - f.y * dist, z = cz - f.z * dist;
    const moved = Math.abs(x - cam.position.x) + Math.abs(y - cam.position.y) + Math.abs(z - cam.position.z) > 1e-6;
    if (moved) {
      cam.position.set(x, y, z);
      cam.moved = true;
    }
    return moved;
  }
}

function same(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

/**
 * The hits on turret and gun plates with their points where the model holds those plates at rest: the victim's turret
 * yaw and gun elevation at the hit (`aim.ts`, from its row then) turned back about the figure's turret and trunnion.
 */
function restPoints(d: Dataset, set: NonNullable<ReturnType<typeof vehicleView>['set']>, hits: VehicleHit[], list: Plate[], at: Map<number, number>, figure: string): Map<number, Vec3> {
  const out = new Map<number, Vec3>();
  const aim = aimOf(d);
  const t = templateOfFigure(figure);
  const turret = t?.joints?.find((j) => j.kind === 'yaw' && j.parent < 0)?.pivot ?? null;
  const gun = t?.joints?.find((j) => j.kind === 'pitch')?.pivot ?? null;
  if (!aim || !turret) return out;
  const places = placesOf(d, set);
  const now: AimNow = { yaw: NaN, pitch: NaN };
  for (const h of hits) {
    const i = at.get(h.id) ?? -1;
    if (i < 0 || !h.local || !/^(turret|gun)/.test(list[i].part)) continue;
    const row = places.rows[h.id * 2] ?? -1;
    if (row < 0) continue;
    aim.at(row, h.time, now);
    if (!Number.isFinite(now.yaw)) continue;
    out.set(h.id, atRest(h.local, list[i].part, now.yaw, now.pitch, turret as Vec3, gun as Vec3 | null));
  }
  return out;
}
