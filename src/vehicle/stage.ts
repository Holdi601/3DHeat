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
import { useVehicleStore } from '../state/vehicleStore';
import { buildColorLut } from '../render/colors';
import type { FlyCamera } from '../render/camera';
import { templateOfFigure, VehicleScene, type VehicleFrame } from './scene';
import { offsetFor, shiftHits } from './fit';
import type { Vec3 } from '../race/geometry';
import { vehicleView } from './view';

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
    this.offset = tpl && s.fit ? offsetFor(tpl, view.placed) : [0, 0, 0];
    return this.scene.build({
      figure: view.figure ?? '',
      hits: shiftHits(view.hits, this.offset),
      look: { radius: s.radius, exposure: s.exposure, showPoints: s.showPoints, showArrows: s.showArrows, colourBy: s.colourBy },
      lut: this.lut,
      lutKey: this.lutKey,
    });
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
    if (!keep) cam.setOrientationDegrees(-130, -18);
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
