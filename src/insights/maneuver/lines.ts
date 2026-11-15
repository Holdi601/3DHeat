/**
 * The maneuvers drawn in the 3D view: each group's way as a line with an
 * arrowhead (envelopment arcs are the arms' ways), the outlines of the groups
 * at the key moment, the enemy's front, and a short mast at the place - the
 * engine's top lines, seven floats a vertex, built once when the pick
 * changes and copied after the other top lines, so a frame costs nothing.
 * The picked maneuver full, the match's others faint (when shown); sides in
 * their colours, the enemy's outlines in the other side's.
 */

import { create } from 'zustand';
import type { Maneuver, ManeuverKind } from './types';

type Lines = { data: Float32Array; count: number } | null;

export const useManeuverLines = create<{ lines: Lines }>(() => ({ lines: null }));

const SIDES: [number, number, number][] = [
  [0.35, 0.65, 1],
  [1, 0.4, 0.35],
  [0.45, 0.9, 0.45],
  [1, 0.8, 0.3],
  [0.8, 0.5, 1],
  [0.3, 0.9, 0.9],
];
const NEUTRAL: [number, number, number] = [0.9, 0.9, 0.9];
const FRONT: [number, number, number] = [1, 1, 1];

const BLUE = /\b(blue|allies|allied|ct|nato|west|friendly|coalition)\b/i;
const RED = /\b(red|axis|t|terrorists?|east|opfor|enemy|hostile)\b/i;

/** A side's colour: by its name where it says one (blue, red and their usual stand-ins), else by its index. */
export function sideColor(team: number, label?: string): [number, number, number] {
  if (label && BLUE.test(label)) return SIDES[0];
  if (label && RED.test(label)) return SIDES[1];
  return team >= 0 ? SIDES[team % SIDES.length] : NEUTRAL;
}

/** Which outlines are the enemy's, by kind (index into `outlines`). */
const ENEMY_OUTLINE: Partial<Record<ManeuverKind, number[]>> = {
  frontalAssault: [0],
  flank: [0],
  pincer: [0],
  encirclement: [0],
  penetration: [0],
  withdrawal: [0],
  ambush: [1],
  crossingT: [1],
};

/** The lines of maneuvers, `focus` full and the rest at `faint`. */
export function maneuverLines(list: Maneuver[], focus: string | null, teams: string[] = [], faint = 0.3): Lines {
  const out: number[] = [];
  const seg = (a: [number, number, number], b: [number, number, number], c: [number, number, number], alpha: number) => out.push(a[0], a[1], a[2], c[0], c[1], c[2], alpha, b[0], b[1], b[2], c[0], c[1], c[2], alpha);
  for (const m of list) {
    const alpha = focus === null || focus === m.id ? 0.95 : faint;
    const own = sideColor(m.team, teams[m.team]);
    const lift = Math.max(m.place.radius * 0.01, 0.5);
    for (const p of m.paths) {
      let len = 0;
      for (let i = 1; i < p.length; i++) {
        seg([p[i - 1][0], p[i - 1][1] + lift, p[i - 1][2]], [p[i][0], p[i][1] + lift, p[i][2]], own, alpha);
        len += Math.hypot(p[i][0] - p[i - 1][0], p[i][2] - p[i - 1][2]);
      }
      // The arrowhead: two barbs at the end, a twelfth of the way long.
      if (p.length >= 2 && len > 0) {
        const a = p[p.length - 2];
        const b = p[p.length - 1];
        const d = Math.hypot(b[0] - a[0], b[2] - a[2]) || 1;
        const ux = (b[0] - a[0]) / d;
        const uz = (b[2] - a[2]) / d;
        const h = Math.max(len / 12, lift * 4);
        for (const s of [-1, 1]) {
          const c = Math.cos((s * 25 * Math.PI) / 180);
          const sn = Math.sin((s * 25 * Math.PI) / 180);
          const bx = -(ux * c - uz * sn) * h;
          const bz = -(ux * sn + uz * c) * h;
          seg([b[0], b[1] + lift, b[2]], [b[0] + bx, b[1] + lift, b[2] + bz], own, alpha);
        }
      }
    }
    const enemy = ENEMY_OUTLINE[m.kind] ?? [];
    m.outlines.forEach((ring, i) => {
      const col = enemy.includes(i) ? sideColor(m.against, teams[m.against]) : own;
      const y = m.place.y + lift;
      for (let k = 0; k < ring.length; k++) {
        const a = ring[k];
        const b = ring[(k + 1) % ring.length];
        seg([a[0], y, a[1]], [b[0], y, b[1]], col, alpha * 0.8);
      }
    });
    if (m.front) seg([m.front[0][0], m.place.y + lift, m.front[0][1]], [m.front[1][0], m.place.y + lift, m.front[1][1]], FRONT, alpha);
    // A mast at the place, so a maneuver far below or above the eye is found.
    seg([m.place.x, m.place.y, m.place.z], [m.place.x, m.place.y + Math.max(m.place.radius * 0.25, lift * 10), m.place.z], own, alpha);
  }
  return out.length ? { data: Float32Array.from(out), count: out.length / 7 } : null;
}

let merged: { base: unknown; lines: unknown; out: { data: Float32Array; count: number } } | null = null;

/** The engine's top lines with the maneuvers' after them (the same arrays again while neither changes). */
export function withManeuverLines(base: Lines): Lines {
  const lines = useManeuverLines.getState().lines;
  if (!lines) return base;
  if (!base) return lines;
  if (merged && merged.base === base && merged.lines === lines) return merged.out;
  const data = new Float32Array((base.count + lines.count) * 7);
  data.set(base.data.subarray(0, base.count * 7));
  data.set(lines.data.subarray(0, lines.count * 7), base.count * 7);
  merged = { base, lines, out: { data, count: base.count + lines.count } };
  return merged.out;
}
