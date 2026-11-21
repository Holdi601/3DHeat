/**
 * Keyframes of the board's figures over playback time: where a turret
 * points, how high its gun is raised, which way the figure looks and where
 * its sensor points, each a channel of values at times (seconds from the
 * plan's start). Between two keys a value goes the short way round; before
 * the first and after the last it holds. Angles are radians, yaw from the
 * hull's forward with right positive (as the GPU figures turn turrets),
 * pitch up positive.
 */

import type { FigureTracks, PlanFigure, TrackChannel, Vec3 } from './plan';

const TAU = Math.PI * 2;

/** An angle in -pi..pi. */
export function wrapAngle(a: number): number {
  let x = a % TAU;
  if (x > Math.PI) x -= TAU;
  if (x < -Math.PI) x += TAU;
  return x;
}

/** Channels that are a direction round (the short way between keys); the rest are elevations. */
const ROUND: Record<TrackChannel, boolean> = { turret: true, gun: false, viewYaw: true, viewPitch: false, sensorYaw: true, sensorPitch: false };

/** A channel's value at a time, or undefined without keys. */
export function channelAt(tracks: FigureTracks | undefined, ch: TrackChannel, t: number): number | undefined {
  const keys = tracks?.[ch];
  if (!keys || !keys.length) return undefined;
  if (t <= keys[0].t) return keys[0].v;
  const last = keys[keys.length - 1];
  if (t >= last.t) return last.v;
  for (let i = 0; i + 1 < keys.length; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t > b.t) continue;
    const u = b.t > a.t ? (t - a.t) / (b.t - a.t) : 1;
    const d = ROUND[ch] ? wrapAngle(b.v - a.v) : b.v - a.v;
    const v = a.v + d * u;
    return ROUND[ch] ? wrapAngle(v) : v;
  }
  return last.v;
}

/** Keys closer than this in time are the same key. */
export const KEY_EPS = 0.05;

/** A figure's tracks with a key set (or, `v` null, removed) at `t`; undefined when none is left. */
export function withKey(tracks: FigureTracks | undefined, ch: TrackChannel, t: number, v: number | null): FigureTracks | undefined {
  const out: FigureTracks = { ...(tracks ?? {}) };
  const keys = (out[ch] ?? []).filter((k) => Math.abs(k.t - t) > KEY_EPS);
  if (v !== null && Number.isFinite(v)) keys.push({ t: Math.max(0, t), v: ROUND[ch] ? wrapAngle(v) : v });
  keys.sort((a, b) => a.t - b.t);
  if (keys.length) out[ch] = keys;
  else delete out[ch];
  return Object.keys(out).length ? out : undefined;
}

/** Every time a figure has a key at, of any channel, in order. */
export function keyTimes(f: PlanFigure): number[] {
  const ts: number[] = [];
  for (const keys of Object.values(f.tracks ?? {})) for (const k of keys ?? []) if (!ts.some((x) => Math.abs(x - k.t) <= KEY_EPS)) ts.push(k.t);
  return ts.sort((a, b) => a - b);
}

/** Whether any figure of a plan has a key that draws a line (where it looks, where its sensor points). */
export function hasDirectionTracks(figures: PlanFigure[]): boolean {
  return figures.some((f) => !!(f.tracks?.viewYaw || f.tracks?.viewPitch || f.tracks?.sensorYaw || f.tracks?.sensorPitch));
}

/** The yaw (from the hull's forward, right positive) and pitch from a figure at `from` heading `yaw` (box yaw) to a point. */
export function aimAt(from: Vec3, yaw: number, to: Vec3): { yaw: number; pitch: number } {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const world = Math.atan2(dx, -dz);
  return { yaw: wrapAngle(world - yaw), pitch: Math.atan2(to.y - from.y, Math.hypot(dx, dz)) };
}

/** A direction in the world from a figure's heading (box yaw) and a yaw and pitch off it. */
export function directionOf(yaw: number, rel: { yaw: number; pitch: number }): Vec3 {
  const h = yaw + rel.yaw;
  const c = Math.cos(rel.pitch);
  return { x: Math.sin(h) * c, y: Math.sin(rel.pitch), z: -Math.cos(h) * c };
}
