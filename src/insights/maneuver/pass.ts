/**
 * The movement analysis' pass over the rows (`run.ts`, `worker.ts`): the
 * chunks the insight pass and the lens read (`../pass.ts`, `../lensMetrics.ts`), folded into a
 * `ManeuverCollector` - movement samples by person and match, the events
 * with their doer (a weapon's launch credited to its shooter) - and analysed
 * once at the end, match by match.
 */

import type { CompareMeta, CompareScope } from '../../volumes/compare';
import { rowShown } from '../../volumes/compare';
import type { LensChunk } from '../lensMetrics';
import { analyseAll } from './analyse';
import { ManeuverCollector } from './collect';
import type { EvKind, ManeuverReport } from './types';

/** EVENT_KINDS indices of the events read (kept out of the worker's imports); -1 where absent. */
export interface ManeuverEvents {
  kill: number;
  death: number;
  destroyed: number;
  crash: number;
  fire: number;
  launch: number;
  hit: number;
  capture: number;
}

export interface ManeuverOptions {
  upm: number;
  events: ManeuverEvents;
  /** Shooter column category -> person index (-1 none). */
  shooterMap?: Int32Array;
  /**
   * When each person is dead (`data/deaths.ts`): its spans start at
   * `start[p]` and end before `start[p + 1]` in `from`/`to`. A wreck's rows in
   * a span are not the unit moving, and a span's death rows are one death.
   */
  dead?: { start: Int32Array; from: Float64Array; to: Float64Array };
  /** Team slots whose label says no side (unassigned): not a side to judge against. */
  sideless?: number[];
}

export interface ManeuverJob {
  meta: CompareMeta;
  scope: CompareScope;
  c: ManeuverCollector;
  /** Taxonomy index -> event read. */
  kinds: Map<number, EvKind>;
  shooterMap: Int32Array | null;
  dead: ManeuverOptions['dead'] | null;
  /** Dead spans whose death has been counted (index into `dead.from`). */
  counted: Set<number>;
  sideless: number[];
}

/** Seconds a death row may lie from its dead span's start and still be that death. */
const SPAN_SLACK = 0.5;

/** The dead span of person `p` that time `t` falls in (-1 none); `slack` widens its start. */
export function deadSpan(dead: NonNullable<ManeuverOptions['dead']>, p: number, t: number, slack = 0): number {
  if (p < 0 || p + 1 >= dead.start.length) return -1;
  for (let i = dead.start[p]; i < dead.start[p + 1]; i++) if (t >= dead.from[i] - slack && t < dead.to[i]) return i;
  return -1;
}

/** VEHICLE_CLASSES indices of weapon, decoy and structure: not units. */
const NOT_UNITS = new Set([13, 14, 15]);
/** VEHICLE_CLASSES `weapon`. */
const WEAPON = 13;

export function createManeuverJob(meta: CompareMeta, scope: CompareScope, opt: ManeuverOptions): ManeuverJob {
  const e = opt.events;
  const kinds = new Map<number, EvKind>();
  const put = (i: number, k: EvKind) => i >= 0 && kinds.set(i, k);
  put(e.kill, 'kill');
  put(e.death, 'death');
  put(e.destroyed, 'death');
  put(e.crash, 'death');
  put(e.fire, 'fire');
  put(e.launch, 'launch');
  put(e.hit, 'hit');
  put(e.capture, 'capture');
  const c = new ManeuverCollector(opt.upm > 0 ? opt.upm : 1);
  if (meta.sessionStart) for (let s = 0; s < meta.sessions; s++) c.setStart(s, meta.sessionStart[s]);
  return { meta, scope, c, kinds, shooterMap: opt.shooterMap ?? null, dead: opt.dead && opt.dead.from.length ? opt.dead : null, counted: new Set(), sideless: opt.sideless ?? [] };
}

export function stepManeuver(job: ManeuverJob, ch: LensChunk): void {
  const { meta, scope, c } = job;
  const { px, py, pz, time, person, team, session, event, cls } = ch;
  if (!time || !person) return;
  const POS = meta.position;
  const shooter = ch.shooter && job.shooterMap ? ch.shooter : null;
  for (let j = 0; j < ch.n; j++) {
    const x = px[j];
    const z = pz[j];
    if (!(x === x && z === z) || !rowShown(scope, ch, j)) continue;
    const t = time[j];
    const k = cls && meta.classMap ? (meta.classMap[cls[j]] ?? -1) : -1;
    const kind = event && meta.eventMap ? (meta.eventMap[event[j]] ?? -1) : -1;
    const s = session ? session[j] : -1;
    const p = person[j];
    const tm = team ? team[j] : -1;
    const ev = kind >= 0 ? job.kinds.get(kind) : undefined;
    if (NOT_UNITS.has(k)) {
      // A weapon's launch or shot: its shooter's.
      if (shooter && (ev === 'launch' || ev === 'fire')) {
        const sp = job.shooterMap![shooter[j]] ?? -1;
        if (sp >= 0) c.event(ev, sp, s, -1, t, x, py[j], z);
      }
      // A weapon in flight (not a decoy or a structure), until it is gone.
      if (k === WEAPON && POS >= 0 && kind === POS && !(job.dead && deadSpan(job.dead, p, t) >= 0)) c.weapon(p, s, tm, t, x, py[j], z);
      continue;
    }
    if (meta.personShared && meta.personShared[p] === 1) continue;
    if (POS < 0 || kind === POS) {
      // A wreck's rows (dead, not yet removed) are not the unit moving.
      if (job.dead && deadSpan(job.dead, p, t) >= 0) continue;
      c.sample(p, s, tm, k, t, x, py[j], z);
    } else if (ev === 'death' && job.dead) {
      // A death is its dead span's start: one row of it counts, the wreck's further `dead` rows do not.
      const span = deadSpan(job.dead, p, t, SPAN_SLACK);
      if (span >= 0) {
        if (job.counted.has(span)) continue;
        job.counted.add(span);
      }
      c.event(ev, p, s, tm, t, x, py[j], z);
    } else if (ev) c.event(ev, p, s, tm, t, x, py[j], z);
  }
}

export function finishManeuverJob(job: ManeuverJob): ManeuverReport {
  const matches = job.c.finish(job.meta.teams);
  if (job.sideless.length) for (const m of matches) m.sideless = job.sideless;
  return analyseAll(matches);
}
