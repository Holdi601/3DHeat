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
