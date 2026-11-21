/**
 * A chart sign: a chart of the rows inside one volume, standing in the world
 * beside it (docs/volume-charts.md).
 *
 * It hangs from its volume's top corner (`signAnchor`): a billboard faces the
 * screen and keeps its size in pixels, offset from the corner in pixels; a
 * fixed board stands in the world at an offset in world units, turned to a
 * heading, sized in world units, so it reads as a board on the ground.
 */

import { normalizeSpec, type ChartSpec } from '../../charts/types';
import { volumeBounds, type Vec3, type Volume } from '../volume';

export type SignMode = 'billboard' | 'fixed';

export interface Sign {
  id: string;
  volumeId: string;
  /** Empty: said from the spec. */
  title: string;
  spec: ChartSpec;
  mode: SignMode;
  /** Billboard: pixels from the corner's place on screen (x right, y down) to the sign's top left. */
  px: [number, number];
  /** Fixed: world units from the corner to the board's bottom centre, and the heading it faces (radians, 0 = +z). */
  offset: Vec3;
  yaw: number;
  /** Size: 1 is 300 x 190 pixels for a billboard; for a board, its width is the volume's width times this. */
  scale: number;
  collapsed: boolean;
  /** In playback: everything up to the playhead, whatever the window. */
  upToNow: boolean;
  /** The chart as a table. */
  table: boolean;
}

export const SIGN_W = 300;
export const SIGN_H = 190;
/** The header strip above the chart, pixels at scale 1. */
export const SIGN_HEAD = 24;

export function newSignId(): string {
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** The corner a volume's button and signs hang from: the top of its bounds, at the +x / -z corner. */
export function signAnchor(v: Volume): Vec3 {
  const b = volumeBounds(v);
  return [b.max[0], b.max[1], b.min[2]];
}

/** The volume's widest horizontal extent, world units: what a board's width is measured against. */
export function volumeWidth(v: Volume): number {
  const b = volumeBounds(v);
  return Math.max(1e-3, b.max[0] - b.min[0], b.max[2] - b.min[2]);
}

/** A new sign for a volume, the `index`-th on it: billboards above the corner, two abreast, rows stacked up, so they do not cover each other. */
export function makeSign(volumeId: string, spec: Partial<ChartSpec>, index: number, extra: Partial<Sign> = {}): Sign {
  const col = index % 2;
  const row = Math.floor(index / 2);
  return {
    id: newSignId(),
    volumeId,
    title: '',
    spec: normalizeSpec(spec),
    mode: 'billboard',
    px: [col === 0 ? -SIGN_W - 8 : 8, -(SIGN_H + SIGN_HEAD) - 18 - row * (SIGN_H + SIGN_HEAD + 12)],
    offset: [0, 0, 0],
    yaw: 0,
    scale: 1,
    collapsed: false,
    upToNow: false,
    table: false,
    ...extra,
  };
}

/** A sign read from JSON (a file, a peer, a saved view); null when it is not one. */
export function parseSign(raw: unknown): Sign | null {
  const o = raw as Partial<Sign> | null;
  if (!o || typeof o !== 'object' || typeof o.id !== 'string' || typeof o.volumeId !== 'string') return null;
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  const vec = (v: unknown, n: number, d: number[]): number[] => (Array.isArray(v) && v.length === n && v.every((x) => typeof x === 'number' && Number.isFinite(x)) ? v : d);
  return {
    id: o.id,
    volumeId: o.volumeId,
    title: typeof o.title === 'string' ? o.title.slice(0, 120) : '',
    spec: normalizeSpec(o.spec),
    mode: o.mode === 'fixed' ? 'fixed' : 'billboard',
    px: vec(o.px, 2, [8, -(SIGN_H + SIGN_HEAD) - 18]) as [number, number],
    offset: vec(o.offset, 3, [0, 0, 0]) as Vec3,
    yaw: num(o.yaw, 0),
    scale: Math.max(0.4, Math.min(4, num(o.scale, 1))),
    collapsed: !!o.collapsed,
    upToNow: !!o.upToNow,
    table: !!o.table,
  };
}
