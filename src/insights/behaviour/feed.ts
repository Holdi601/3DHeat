/**
 * The behaviour analysis in the insight worker: fed the same chunks as the
 * lens metrics (`../lensMetrics.ts`), in the same walk. A unit is a person in
 * a match (session); a weapon row's launch or shot is credited to its shooter.
 * Rounds and loadouts come from the dataset's own columns where it has them
 * (`behaviourColumns`: a CS2 demo's round and equipment value).
 */

import type { Dataset } from '../../state/types';
import type { CompareScope } from '../../volumes/compare';
import { rowShown } from '../../volumes/compare';
import type { LensChunk, LensEvents } from '../lensMetrics';
import type { InsightMeta } from '../pass';
import { BehaviourAcc, DEATH, FIRE, HURT, KILL, SPAWN } from './acc';
import type { BehaviourMetrics } from './types';

/** VEHICLE_CLASSES indices of what is not a unit (weapon, decoy, structure), kept out of the worker's imports. */
const NOT_UNIT = new Set([13, 14, 15]);

export interface BehaviourColumns {
  round: Float32Array | null;
  equip: Float32Array | null;
  /** 1 once the round's buying is over (its clock at or past zero). */
  live: Uint8Array | null;
}

/** Chunk columns the behaviour analysis adds to the insight chunk (`run.ts`). */
export interface BehaviourChunk {
  bround?: Float32Array | null;
  bequip?: Float32Array | null;
  blive?: Uint8Array | null;
}

const ROUND = ['round', 'Round', 'round_num', 'roundNum'];
const EQUIP = ['equipment', 'Equipment', 'equip_value', 'equipValue', 'roundStartEquipment'];
const CLOCK = ['roundTime', 'round_time'];

/** The round, loadout value and round clock columns of a dataset, when it has them. */
export function behaviourColumns(ds: Dataset): BehaviourColumns | null {
  const num = (names: string[]) => {
    for (const n of names) {
      const a = ds.attrs.find((c) => c.name === n && !c.categories);
      if (a) return a.data as Float32Array;
    }
    return null;
  };
  const round = num(ROUND);
  if (!round) return null;
  const clock = num(CLOCK);
  return { round, equip: num(EQUIP), live: clock ? Uint8Array.from(clock, (v) => (v >= 0 ? 1 : 0)) : null };
}

export interface BehaviourJob {
  acc: BehaviourAcc;
  meta: InsightMeta;
  scope: CompareScope;
  ev: LensEvents | null;
  shooterMap: Int32Array | null;
  damage: number;
  keys: Map<number, number>;
}

export function createBehaviourJob(meta: InsightMeta, scope: CompareScope, opt: { upm: number; events?: LensEvents; shooterMap?: Int32Array }): BehaviourJob {
  return {
    acc: new BehaviourAcc({ upm: opt.upm }),
    meta,
    scope,
    ev: opt.events ?? null,
    shooterMap: opt.shooterMap ?? null,
    // `contact` lists fire, launch, hit, damage, kill, death (`run.ts`).
    damage: meta.contact[3] ?? -1,
    keys: new Map(),
  };
}

function unitOf(job: BehaviourJob, person: number, session: number, team: number): number {
  const key = person * (job.meta.sessions + 1) + (session + 1);
  let k = job.keys.get(key);
  if (k === undefined) job.keys.set(key, (k = job.acc.track(session, team)));
  return k;
}

export function stepBehaviour(job: BehaviourJob, ch: LensChunk & BehaviourChunk): void {
  const { meta, scope, acc } = job;
  const POS = meta.position;
  const { px, pz, time, person, team, session, event, cls } = ch;
  if (!time || !person) return;
  const shooter = ch.shooter && job.shooterMap ? ch.shooter : null;
  const ev = job.ev;
  for (let j = 0; j < ch.n; j++) {
    const x = px[j];
    const z = pz[j];
    const t = time[j];
    if (!(x === x && z === z && t === t) || !rowShown(scope, ch, j)) continue;
    const s = session ? session[j] : -1;
    const k0 = cls && meta.classMap ? meta.classMap[cls[j]] ?? -1 : -1;
    const kind = event && meta.eventMap ? meta.eventMap[event[j]] ?? -1 : -1;
    if (NOT_UNIT.has(k0)) {
      if (shooter && ev && (kind === ev.launch || kind === ev.fire)) {
        const sp = job.shooterMap![shooter[j]] ?? -1;
        if (sp >= 0) acc.event(FIRE, unitOf(job, sp, s, -1), t);
      }
      continue;
    }
    const p = person[j];
    if (p < 0 || (meta.personShared && meta.personShared[p] === 1)) continue;
    const k = unitOf(job, p, s, team ? team[j] : -1);
    if (POS < 0 || kind === POS) {
      acc.pos(k, t, x, z);
      if (ch.bround) {
        const rd = ch.bround[j];
        if (rd === rd) acc.loadout(k, rd, t, ch.bequip ? ch.bequip[j] : NaN, ch.blive ? ch.blive[j] === 1 : true);
      }
      continue;
    }
    if (kind === meta.kill) acc.event(KILL, k, t);
    else if (kind === meta.death) acc.event(DEATH, k, t);
    else if (ev && (kind === ev.fire || kind === ev.launch)) acc.event(FIRE, k, t);
    else if (kind === job.damage) acc.event(HURT, k, t);
    else if (kind === meta.spawn) acc.event(SPAWN, k, t);
  }
}

export function finishBehaviour(job: BehaviourJob): BehaviourMetrics | undefined {
  try {
    const b = job.acc.finish();
    return b.tracks ? b : undefined;
  } catch (e) {
    console.warn('behaviour analysis failed', e);
    return undefined;
  }
}
