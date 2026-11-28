/**
 * Everyone's camera and pointer in the session, kept out of React: the
 * client writes it as frames arrive (ten a second at most), the overlay
 * reads it in its own animation frame, and nothing re-renders for it.
 */

import type { Engine } from '../render/engine';
import { useStore } from '../state/store';
import type { Pose } from './store';

type V3 = { x: number; y: number; z: number };

export interface PeerPresence {
  pose: Pose;
  /** What their pointer points at in the world. */
  cursor: V3 | null;
  /** When it last moved, `performance.now()` (a pointer left still fades out). */
  cursorMoved: number;
  tab: string;
  mode: string;
  /** When it arrived, `performance.now()`. */
  at: number;
}

/** Presence by member id. */
export const presence = new Map<number, PeerPresence>();

/** Counts the changes to `presence`: the overlay redraws only when it or the camera moved. */
export const presenceClock = { v: 0 };

/** A cheap signature of this viewer's camera, to tell whether anything drawn over the view must move. */
export function cameraSig(engine: Engine): number[] {
  const p = engine.cameraPose();
  return [p.position.x, p.position.y, p.position.z, p.forward.x, p.forward.y, p.forward.z, engine.canvas.clientWidth, engine.canvas.clientHeight, useStore.getState().camera.fov, engine.camera.orthoHeight];
}

export function sameSig(a: number[] | null, b: number[]): boolean {
  if (!a) return false;
  for (let i = 0; i < b.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** This viewer's camera as a pose. */
export function capturePose(engine: Engine): Pose {
  const p = engine.cameraPose();
  const cam = useStore.getState().camera;
  const w = engine.canvas.clientWidth || 1;
  const h = engine.canvas.clientHeight || 1;
  return {
    position: p.position,
    forward: p.forward,
    fov: cam.fov,
    aspect: Math.min(20, Math.max(0.05, w / h)),
    ortho: cam.projection === 'orthographic',
    orthoHeight: Math.max(0, engine.camera.orthoHeight || 0),
  };
}

/** Whether two poses differ enough to say so again. */
export function poseMoved(a: Pose | null, b: Pose): boolean {
  if (!a) return true;
  const d = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y, a.position.z - b.position.z);
  const f = Math.hypot(a.forward.x - b.forward.x, a.forward.y - b.forward.y, a.forward.z - b.forward.z);
  const scale = Math.max(1, Math.hypot(b.position.x, b.position.y, b.position.z) * 1e-5);
  return d > 0.01 * scale || f > 1e-3 || a.fov !== b.fov || a.aspect !== b.aspect || a.ortho !== b.ortho;
}

/** Puts this viewer's camera where a pose is; `k` below 1 moves only that part of the way (following smoothly). */
export function applyPose(engine: Engine, pose: Pose, k = 1): void {
  if (k >= 1) {
    engine.setCameraPose(pose.position, pose.forward);
    return;
  }
  const cur = engine.cameraPose();
  const lerp = (a: V3, b: V3): V3 => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
  engine.setCameraPose(lerp(cur.position, pose.position), lerp(cur.forward, pose.forward));
}

/** What the pointer points at in the world: the level, a unit, else the floor of the action (`Engine.pointAt`). */
export function pointerTarget(engine: Engine, cssX: number, cssY: number): V3 | null {
  const p = engine.pointAt(cssX, cssY);
  return p ? { x: p.x, y: p.y, z: p.z } : null;
}

/** The world point under a canvas position: the level's surface, else the ground plane y = 0. */
export function pointUnder(engine: Engine, cssX: number, cssY: number): V3 | null {
  const ray = engine.boardRay(cssX, cssY);
  if (!ray) return null;
  const hit = engine.inspector.surfaceHit(ray);
  if (hit) return { x: hit.x, y: hit.y, z: hit.z };
  if (Math.abs(ray.dir.y) < 1e-6) return null;
  const t = -ray.origin.y / ray.dir.y;
  if (!(t > 0) || !Number.isFinite(t)) return null;
  return { x: ray.origin.x + ray.dir.x * t, y: 0, z: ray.origin.z + ray.dir.z * t };
}
