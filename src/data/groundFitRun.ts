/**
 * Runs the ground check (`groundFit.ts`) whenever a recording and a 3D level
 * are both loaded: each match's ground units measured against the level, a
 * match off by one height lifted onto it, and the result kept for the
 * dataset panel to say. Worked out in slices of a few milliseconds between
 * frames; the moved heights go in as a copy of the dataset, the way a load
 * would put them.
 */

import { create } from 'zustand';
import type { Dataset } from '../state/types';
import type { Level } from '../render/level';
import { isOverlay } from '../match/overlay';
import { t, num } from '../i18n';
import { toast } from '../ui/shell/kit';
import { fixedHeightsSteps, fixesOf, groundChecksSteps, groundPersons, heightGridSteps, snappedHeightsSteps, surfaceGridSteps, type GroundCheck, type GroundFix, type GroundSnap } from './groundFit';

interface GroundFitState {
  /** The dataset the checks are of, and the level they were made on. */
  dataset: Dataset | null;
  level: Level | null;
  checks: GroundCheck[];
  /** The matches moved onto the level, on the dataset shown (carried over from the one they were measured on). */
  fixes: GroundFix[];
  /** Ground units' rows put on the level's drawn ground, on the dataset shown; null when none were. */
  snap?: GroundSnap | null;
}

export const useGroundFit = create<GroundFitState>(() => ({ dataset: null, level: null, checks: [], fixes: [] }));

/** Datasets made here with moved heights: checked again, never moved again. */
const madeHere = new WeakMap<Dataset, GroundFix[]>();

/** Milliseconds of work a slice. */
const SLICE_MS = 6;

interface Host {
  getState: () => { dataset: Dataset | null; level: Level | null };
  setState: (p: { dataset: Dataset }) => void;
  subscribe: (fn: () => void) => () => void;
}

/** Data units a metre (`replayData.unitsPerMetre`, without its imports). */
function perMetre(d: Dataset): number {
  return d.entitySize ? d.entitySize / 0.8 : 1;
}

/** Runs `g` in slices between frames; resolves with its value, or null once `stale()` says the work is no longer wanted. */
function sliced<T>(g: Generator<void, T, void>, stale: () => boolean): Promise<T | null> {
  return new Promise((resolve) => {
    const step = () => {
      if (stale()) return resolve(null);
      const end = performance.now() + SLICE_MS;
      for (;;) {
        const r = g.next();
        if (r.done) return resolve(r.value);
        if (performance.now() >= end) break;
      }
      setTimeout(step, 0);
    };
    setTimeout(step, 0);
  });
}

/** Follows the store: once, at startup. */
export function installGroundFit(store: Host): () => void {
  let job = 0;
  let seen: [Dataset | null, Level | null] = [null, null];
  const run = async (d: Dataset, level: Level) => {
    const id = ++job;
    const stale = () => id !== job;
    const ground = groundPersons(d);
    if (!ground || level.kind !== 'model' || !d.count) {
      useGroundFit.setState({ dataset: d, level, checks: [], fixes: madeHere.get(d) ?? [] });
      return;
    }
    const k = perMetre(d);
    const b = d.bounds;
    const pad = 50 * k;
    const grid = await sliced(heightGridSteps(level.vertices, level.indices, { minX: b.minX - pad, maxX: b.maxX + pad, minZ: b.minZ - pad, maxZ: b.maxZ + pad }, 2 * k), stale);
    if (!grid) return;
    const checks = await sliced(groundChecksSteps(d, grid, k, ground), stale);
    if (!checks) return;
    const earlier = madeHere.get(d);
    const fixes = earlier ? [] : fixesOf(checks);
    useGroundFit.setState({ dataset: d, level, checks, fixes: earlier ?? [] });
    const fixed = fixes.length ? await sliced(fixedHeightsSteps(d, fixes, k, ground), stale) : null;
    if (fixes.length && !fixed) return;
    // Then each ground unit on the ground as drawn, where it is within a few metres of it (`snappedHeightsSteps`).
    const surface = await sliced(surfaceGridSteps(level.vertices, level.indices, { minX: b.minX - pad, maxX: b.maxX + pad, minZ: b.minZ - pad, maxZ: b.maxZ + pad }, k), stale);
    if (stale()) return;
    const snapped = surface ? await sliced(snappedHeightsSteps(fixed ? { ...d, py: fixed } : d, surface, k, ground), stale) : null;
    if (stale()) return;
    if (snapped) useGroundFit.setState({ snap: snapped.snap });
    const py = snapped?.py ?? fixed;
    if (!py || store.getState().dataset !== d) return;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < py.length; i++) {
      const y = py[i];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    // The heights as recorded (after a match's offset is mended) stay with the data, for what it says of a unit's height.
    const pyTrue = d.pyTrue ?? (snapped ? (fixed ?? d.py) : undefined);
    const next: Dataset = { ...d, py, ...(pyTrue ? { pyTrue } : {}), bounds: { ...d.bounds, minY: Math.min(d.bounds.minY, minY), maxY: Math.max(d.bounds.maxY, maxY) } };
    madeHere.set(next, fixes.length ? fixes : (earlier ?? []));
    store.setState({ dataset: next });
    if (!fixes.length) return;
    toast(
      fixes.length === 1
        ? t('heat.groundFit.toastOne', { match: fixes[0].label || '-', metres: signed(fixes[0].metres) })
        : t('heat.groundFit.toastMany', { n: fixes.length }),
      'info',
      6000,
    );
  };
  const check = () => {
    const s = store.getState();
    if (s.dataset === seen[0] && s.level === seen[1]) return;
    seen = [s.dataset, s.level];
    job++;
    if (!s.dataset || !s.level || isOverlay(s.dataset)) {
      useGroundFit.setState({ dataset: s.dataset, level: s.level, checks: [], fixes: s.dataset ? (madeHere.get(s.dataset) ?? []) : [] });
      return;
    }
    void run(s.dataset, s.level);
  };
  check();
  return store.subscribe(check);
}

/** Metres with their sign: "+9.8 m". */
export function signed(metres: number): string {
  return t('heat.groundFit.metres', { v: (metres > 0 ? '+' : '') + num(metres, 1) });
}
