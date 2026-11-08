/**
 * What the replay's panels and overlays share with the view: the ground under
 * a unit, a team's name, and a camera flight to a place.
 */

import type { Engine } from '../../render/engine';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import type { Dataset } from '../../state/types';
import { t } from '../../i18n';
import { unitsPerMetre } from './replayData';

let probe: { level: unknown; cells: Map<string, { y: number | null; at: number }> } = { level: null, cells: new Map() };

/**
 * The height of the level's surface under a point (data units), or null
 * where there is no level or it cannot say yet (its index still building).
 * Asked straight down from above the data; kept on a 20 m grid, so a label
 * over a hundred units does not cast a hundred rays a frame.
 */
export function groundProbe(engine: Engine, d: Dataset): (x: number, y: number, z: number) => number | null {
  const level = useStore.getState().level;
  if (!level) return () => null;
  if (probe.level !== level) probe = { level, cells: new Map() };
  const k = unitsPerMetre(d);
  const cell = 20 * k;
  const top = d.bounds.maxY + 5000 * k;
  return (x, y, z) => {
    const key = `${Math.round(x / cell)},${Math.round(z / cell)}`;
    const now = performance.now();
    const hit = probe.cells.get(key);
    if (hit && (hit.y !== null || now - hit.at < 2000)) return hit.y;
    if (probe.cells.size > 20000) probe.cells.clear();
    const h = engine.inspector.surfaceHit({ origin: { x, y: Math.max(top, y + 10 * k), z }, dir: { x: 0, y: -1, z: 0 } });
    const v = h ? h.y : null;
    probe.cells.set(key, { y: v, at: now });
    return v;
  };
}

/** A team's name: its label, or "Team 1" where the label is only a number. */
export function teamName(d: Dataset, team: number): string {
  const label = d.teamLabels[team] ?? '';
  return /^\d+$/.test(label.trim()) ? t('replay.team', { n: label.trim() }) : label;
}

let flight = 0;

type Dir = [number, number, number];

/**
 * A direction to look at `at` along from `dist` away with a clear line of sight
 * and the camera above the ground. `first` is tried first; then its pitch from
 * twelve headings around the target, then 25, 40 and 60 degrees down from each.
 * The level is asked by raycast; with no level loaded every view is clear.
 */
export function clearView(engine: Engine, at: { x: number; y: number; z: number }, first: Dir, dist: number, k: number): Dir {
  const surface = (origin: { x: number; y: number; z: number }, dir: Dir) =>
    engine.inspector.surfaceHit({ origin, dir: { x: dir[0], y: dir[1], z: dir[2] } });
  // Aim a little above the point itself, so the ground the event lies on does not block it.
  const target = { x: at.x, y: at.y + 1.5 * k, z: at.z };
  const clear = (f: Dir): boolean => {
    const back: Dir = [-f[0], -f[1], -f[2]];
    const hit = surface(target, back);
    if (hit && Math.hypot(hit.x - target.x, hit.y - target.y, hit.z - target.z) < dist) return false;
    const cam = { x: at.x - f[0] * dist, y: at.y - f[1] * dist, z: at.z - f[2] * dist };
    const ground = surface({ x: cam.x, y: cam.y + 10000 * k, z: cam.z }, [0, -1, 0]);
    return !ground || cam.y > ground.y + 3 * k;
  };
  if (clear(first)) return first;
  const flat = Math.hypot(first[0], first[2]) || 1;
  const hx = first[0] / flat;
  const hz = first[2] / flat;
  const pitch0 = Math.asin(Math.max(-1, Math.min(1, -first[1])));
  const tries = [pitch0, 25, 40, 60].map((p, i) => (i === 0 ? p : (p * Math.PI) / 180));
  for (const down of tries) {
    for (let s = 0; s < 12; s++) {
      const yaw = ((s % 2 ? 1 : -1) * Math.ceil(s / 2) * Math.PI) / 6;
      const c = Math.cos(yaw);
      const sn = Math.sin(yaw);
      const f: Dir = [Math.cos(down) * (hx * c - hz * sn), -Math.sin(down), Math.cos(down) * (hx * sn + hz * c)];
      if (clear(f)) return f;
    }
  }
  // Nothing clear: straight from above, which at worst looks down onto a roof.
  return [hx * 0.26, -0.966, hz * 0.26];
}

/**
 * Fly the camera to a world point (data units) and look at it from `metres`
 * away: along the current line of sight, so the view turns toward it rather
 * than jumping, over half a second. Stops following.
 */
export function flyTo(engine: Engine, d: Dataset, at: { x: number; y: number; z: number }, metres: number): void {
  useReplayStore.getState().stopFollow();
  const k = unitsPerMetre(d);
  const from = engine.cameraPose();
  let dx = at.x - from.position.x;
  let dy = at.y - from.position.y;
  let dz = at.z - from.position.z;
  let len = Math.hypot(dx, dy, dz);
  if (len < 1e-6) {
    dx = from.forward.x;
    dy = from.forward.y;
    dz = from.forward.z;
    len = 1;
  }
  // Never straight down or up: a view along the vertical has no heading to keep.
  let fx = dx / len;
  let fy = Math.max(-0.85, Math.min(0.5, dy / len));
  let fz = dz / len;
  const fl = Math.hypot(fx, fy, fz);
  fx /= fl;
  fy /= fl;
  fz /= fl;
  const dist = metres * k;
  // A view with nothing in the way: the approach along the current line of
  // sight first, then the same pitch from other sides, then ever steeper from
  // above. Without this the camera landed behind a hill or inside a building
  // whenever one stood on the line it came in along.
  [fx, fy, fz] = clearView(engine, at, [fx, fy, fz], dist, k);
  const to = { x: at.x - fx * dist, y: at.y - fy * dist, z: at.z - fz * dist };
  const start = performance.now();
  const id = ++flight;
  const p0 = from.position;
  const f0 = from.forward;
  const step = () => {
    if (id !== flight) return;
    const u = Math.min(1, (performance.now() - start) / 550);
    const e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
    const fwd = { x: f0.x + (fx - f0.x) * e, y: f0.y + (fy - f0.y) * e, z: f0.z + (fz - f0.z) * e };
    const n = Math.hypot(fwd.x, fwd.y, fwd.z) || 1;
    engine.setCameraPose(
      { x: p0.x + (to.x - p0.x) * e, y: p0.y + (to.y - p0.y) * e, z: p0.z + (to.z - p0.z) * e },
      { x: fwd.x / n, y: fwd.y / n, z: fwd.z / n },
    );
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
