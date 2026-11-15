/**
 * The behaviour analysis for one match's summary (`mass/summarize.ts`): fed
 * the summary builder's own units, positions and events as it streams the
 * table, finished into the summary's `behaviour` section, so the mass
 * analysis has every match's crowd, cohesion, morale and decision measures
 * without reading a row again (docs/mass-analysis.md, the extension point).
 */

import { BehaviourAcc, DEATH, FIRE, HURT, KILL, SPAWN } from './acc';
import type { BehaviourMetrics } from './types';

/** Columns a round-based table carries (a CS2 demo's round, equipment value and round clock). */
export interface TapColumns {
  round: string | null;
  equip: string | null;
  clock: string | null;
}

const ROUND = /^(round|round_?num)$/i;
const EQUIP = /^(equipment|equip_?value|round_?start_?equipment)$/i;
const CLOCK = /^round_?time$/i;

export function tapColumns(columns: string[], numeric: (c: string) => boolean): TapColumns {
  const one = (re: RegExp) => columns.find((c) => re.test(c.trim()) && numeric(c)) ?? null;
  // The equipment carried now before the value at the round's start (that is before buying).
  const equip = columns.find((c) => /^equipment$/i.test(c.trim()) && numeric(c)) ?? one(EQUIP);
  return { round: one(ROUND), equip, clock: one(CLOCK) };
}

const KIND: Record<string, number> = { kill: KILL, death: DEATH, destroyed: DEATH, crash: DEATH, fire: FIRE, launch: FIRE, damage: HURT, spawn: SPAWN };
/** Events of the row's own unit; the rest are the doer's. */
const OWN = new Set(['death', 'destroyed', 'crash', 'damage', 'spawn']);

export class BehaviourTap {
  private readonly acc = new BehaviourAcc({ upm: 1 });
  private readonly track = new Map<number, number>();
  private n = 0;

  private unit(u: number, team: number): number {
    let k = this.track.get(u);
    if (k === undefined) this.track.set(u, (k = this.acc.track(0, team)));
    return k;
  }

  /** A movement sample of unit `u` (the builder's index) on side `team` (-1 none). */
  pos(u: number, team: number, t: number, x: number, z: number): void {
    this.acc.pos(this.unit(u, team), t, x, z);
    this.n++;
  }

  /** A canonical event: `own` is the row's unit, `doer` who did it (a weapon's shooter). */
  event(kind: string, own: number, doer: number, team: (u: number) => number, t: number): void {
    const k = KIND[kind];
    if (k === undefined) return;
    const u = OWN.has(kind) ? own : doer;
    if (u < 0) return;
    this.acc.event(k, this.unit(u, team(u)), t);
  }

  /** Unit `u` seen in `round` at `t`, with its equipment value and the round's clock where the table has them. */
  round(u: number, team: number, round: number, t: number, equip: number, clock: number): void {
    if (!(round === round)) return;
    this.acc.loadout(this.unit(u, team), round, t, equip, clock === clock ? clock >= 0 : true);
  }

  /** The section, or null for a match with too little movement to say anything. */
  finish(upm: number): BehaviourMetrics | null {
    if (this.n < 100) return null;
    try {
      this.acc.upm = upm > 0 ? upm : 1;
      const b = this.acc.finish();
      return b.tracks ? b : null;
    } catch (e) {
      console.warn('behaviour summary failed', e);
      return null;
    }
  }
}
