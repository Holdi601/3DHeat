/**
 * What a team plans with besides units: thrown utility (a smoke's cloud, a
 * flash's burst, a molotov's fire, an HE's blast), the bomb, generic ability
 * shapes (a wall, a recon dart, a trap's wire, a heal), and map markers (an
 * objective flag, a spawn, a forward base, a rally point). Shapes of the
 * viewer's own, sized to the effect they stand for; nothing taken from a game.
 */

import { finish, newKit, PAINT, type Template } from './kit';
import { blob, block, fin, ring, tube } from './parts';
import type { Rgb } from '../race/geometry';

const grey = (k: number): Rgb => [k, k, k];

export type MarkerKind =
  | 'smoke'
  | 'flash'
  | 'fire'
  | 'blast'
  | 'decoy'
  | 'bomb'
  | 'wall'
  | 'recon'
  | 'trap'
  | 'heal'
  | 'flag'
  | 'spawn'
  | 'base'
  | 'rally'
  | 'waypoint';

export interface MarkerSpec {
  kind: MarkerKind;
  /** The effect's radius, or a wall's length, metres. */
  radius?: number;
  /** A wall's or cloud's height. */
  height?: number;
}

export function buildMarker(spec: MarkerSpec): Template {
  const k = newKit();
  const r = spec.radius ?? 3;
  const fr = k.fr;
  switch (spec.kind) {
    case 'smoke': {
      // A cloud of overlapping puffs, see-through, filling the radius.
      const h = spec.height ?? r * 1.1;
      const puffs: [number, number, number, number][] = [
        [0, 0, h * 0.45, 0.85],
        [r * 0.45, r * 0.2, h * 0.35, 0.6],
        [-r * 0.4, r * 0.3, h * 0.4, 0.62],
        [r * 0.1, -r * 0.5, h * 0.38, 0.6],
        [-r * 0.2, -r * 0.35, h * 0.7, 0.55],
        [r * 0.25, r * 0.35, h * 0.72, 0.5],
      ];
      for (const [x, s, u, m] of puffs) blob(k.fixed, fr, [x, s, u], [r * m, r * m, h * m * 0.55], grey(0.78), 0.42, 6, 12);
      ring(k.fixed, fr, 0, 0, 0.05, r, grey(0.7), 0.35, 32);
      break;
    }
    case 'flash': {
      // A bright core with rays.
      blob(k.fixed, fr, [0, 0, 1.6], [0.35, 0.35, 0.35], [1, 0.97, 0.75]);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const e = (i % 2 ? 0.5 : -0.3);
        tube(k.fixed, fr, [0, 0, 1.6], [Math.cos(a) * 1.4, Math.sin(a) * 1.4, 1.6 + e], 0.08, 0.01, [1, 0.92, 0.55], 4);
      }
      ring(k.fixed, fr, 0, 0, 0.05, r, [1, 0.95, 0.6], 0.18, 32);
      break;
    }
    case 'fire': {
      // A burning patch: the area, and tongues of flame on it.
      ring(k.fixed, fr, 0, 0, 0.04, r, [0.95, 0.38, 0.08], 0.5, 32);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + 0.3;
        const d = r * (i % 3 === 0 ? 0.2 : 0.65);
        tube(k.fixed, fr, [Math.cos(a) * d, Math.sin(a) * d, 0], [Math.cos(a) * d, Math.sin(a) * d, 0.7 + (i % 3) * 0.25], 0.25, 0.01, [1, 0.6, 0.12], 5, 0.85);
      }
      break;
    }
    case 'blast': {
      blob(k.fixed, fr, [0, 0, r * 0.35], [r, r, r * 0.7], [0.95, 0.35, 0.15], 0.22, 6, 14);
      blob(k.fixed, fr, [0, 0, 0.6], [0.5, 0.5, 0.5], [1, 0.75, 0.3]);
      break;
    }
    case 'decoy':
      blob(k.team, fr, [0, 0, 0.15], [0.15, 0.15, 0.15], grey(0.9));
      ring(k.fixed, fr, 0, 0, 0.04, r, grey(0.8), 0.15, 24, r * 0.9);
      break;
    case 'bomb':
      block(k.fixed, fr, [0, 0, 0.15], 0.45, 0.32, 0.3, [0.55, 0.15, 0.12]);
      block(k.fixed, fr, [0.05, 0, 0.32], 0.2, 0.18, 0.04, [0.9, 0.2, 0.15]);
      tube(k.fixed, fr, [-0.1, 0.08, 0.3], [-0.1, 0.08, 0.55], 0.015, 0.015, PAINT.dark, 4);
      ring(k.fixed, fr, 0, 0, 0.03, r, [0.9, 0.2, 0.15], 0.12, 32, r * 0.95);
      break;
    case 'wall': {
      // A see-through wall along the forward axis, `radius` long.
      const h = spec.height ?? 4;
      fin(k.team, fr, [[-r / 2, 0], [r / 2, 0], [r / 2, h], [-r / 2, h]], 0, 0.15, grey(0.95), 0.45);
      break;
    }
    case 'recon':
      tube(k.team, fr, [-0.3, 0, 1.0], [0.3, 0, 1.0], 0.08, 0.01, grey(0.95), 6);
      ring(k.fixed, fr, 0, 0, 0.05, r, [0.3, 0.85, 0.95], 0.12, 32, r * 0.92);
      break;
    case 'trap':
      block(k.team, fr, [0, 0, 0.1], 0.3, 0.3, 0.2, grey(0.85));
      tube(k.fixed, fr, [0, -r, 0.25], [0, r, 0.25], 0.02, 0.02, [0.95, 0.3, 0.3], 4);
      break;
    case 'heal':
      block(k.fixed, fr, [0, 0, 0.8], 0.2, 0.8, 0.25, [0.3, 0.9, 0.45]);
      block(k.fixed, fr, [0, 0, 0.8], 0.2, 0.25, 0.8, [0.3, 0.9, 0.45]);
      ring(k.fixed, fr, 0, 0, 0.04, r, [0.3, 0.9, 0.45], 0.15, 32);
      break;
    case 'flag':
      tube(k.fixed, fr, [0, 0, 0], [0, 0, 4], 0.06, 0.05, PAINT.metal, 6);
      fin(k.team, fr, [[0, 2.9], [1.6, 3.15], [1.6, 3.95], [0, 3.95]], 0, 0.04, grey(0.95));
      ring(k.team, fr, 0, 0, 0.04, r, grey(0.9), 0.18, 32, r * 0.93);
      break;
    case 'spawn':
      ring(k.team, fr, 0, 0, 0.04, r, grey(0.9), 0.3, 32, r * 0.8);
      tube(k.team, fr, [-r * 0.5, 0, 0.06], [r * 0.5, 0, 0.06], 0.2, 0.01, grey(0.95), 4);
      break;
    case 'base':
      // A tent-like shelter and its radius.
      fin(k.team, fr, [[-2, 0], [2, 0], [0, 2.4]], 0, 4, grey(0.75));
      ring(k.team, fr, 0, 0, 0.04, r, grey(0.9), 0.15, 40, r * 0.96);
      break;
    case 'rally':
      tube(k.fixed, fr, [0, 0, 0], [0, 0, 1.3], 0.05, 0.05, PAINT.metal, 6);
      block(k.team, fr, [0, 0, 0.3], 0.6, 0.5, 0.6, grey(0.8));
      break;
    case 'waypoint':
      tube(k.team, fr, [0, 0, 2.5], [0, 0, 0.1], 0.5, 0.02, grey(0.95), 8);
      break;
  }
  return finish(k, 'ground');
}
