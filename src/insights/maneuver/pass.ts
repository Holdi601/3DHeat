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
}

export interface ManeuverJob {
  meta: CompareMeta;
  scope: CompareScope;
  c: ManeuverCollector;
  /** Taxonomy index -> event read. */
  kinds: Map<number, EvKind>;
  shooterMap: Int32Array | null;
}

/** VEHICLE_CLASSES indices of weapon, decoy and structure: not units. */
const NOT_UNITS = new Set([13, 14, 15]);

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
  return { meta, scope, c, kinds, shooterMap: opt.shooterMap ?? null };
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
      continue;
    }
    if (meta.personShared && meta.personShared[p] === 1) continue;
    if (POS < 0 || kind === POS) c.sample(p, s, tm, k, t, x, py[j], z);
    else if (ev) c.event(ev, p, s, tm, t, x, py[j], z);
  }
}

export function finishManeuverJob(job: ManeuverJob): ManeuverReport {
  return analyseAll(job.c.finish(job.meta.teams));
}
