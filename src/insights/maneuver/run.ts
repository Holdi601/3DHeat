/**
 * Running the movement analysis on the loaded data, in its own worker: the
 * columns the insight pass reads (`../run.ts`, `volumes/compareRun.ts`),
 * copied over a few slices at a time, with the shooter of weapon rows so a
 * launch is credited to the aircraft that fired it. The whole time of the
 * data is analysed; the filters, hidden teams and match picked apply.
 */

import { EVENT_KINDS } from '../../data/canonical';
import { deathsOf } from '../../data/deaths';
import { isUnassignedLabel } from '../../render/colors';
import type { Dataset } from '../../state/types';
import type { CompareScope } from '../../volumes/compare';
import { chunkAt, COMPARE_CHUNK, prepareCompare } from '../../volumes/compareRun';
import { analysisScope } from '../run';
import type { ManeuverOptions } from './pass';
import type { ManeuverReport } from './types';

const IN_FLIGHT = 3;
/** Columns naming the unit that fired or launched a row's weapon (as `../run.ts`). */
const SHOOTER_COLUMNS = ['Shooter', 'Launcher', 'shooter', 'launcher', 'attacker', 'Attacker'];

function shooterOf(ds: Dataset): { col: Uint32Array; map: Int32Array } | null {
  const a = SHOOTER_COLUMNS.map((n) => ds.attrs.find((x) => x.name === n && x.categories)).find(Boolean);
  if (!a || !a.categories) return null;
  const byLabel = new Map<string, number>();
  const byId = new Map<string, number>();
  ds.personLabels.forEach((l, i) => {
    byLabel.set(l, i);
    const id = /#[0-9a-f]+$/i.exec(l)?.[0];
    if (id) byId.set(id, byId.has(id) ? -1 : i);
  });
  const map = Int32Array.from(a.categories, (c) => byLabel.get(c) ?? byId.get(/#[0-9a-f]+$/i.exec(c)?.[0] ?? '') ?? -1);
  return map.some((v) => v >= 0) ? { col: a.data as Uint32Array, map } : null;
}

/** The options the pass needs from the dataset. */
export function maneuverOptions(ds: Dataset): { opt: ManeuverOptions; shooter: ReturnType<typeof shooterOf> } {
  const ev = (k: string) => EVENT_KINDS.indexOf(k as (typeof EVENT_KINDS)[number]);
  const shooter = shooterOf(ds);
  // When each person is dead: a wreck's rows are not movement, and its death rows are one death.
  const d = deathsOf(ds);
  return {
    opt: {
      // Units in a metre, as the replay reckons it (`replayData.unitsPerMetre`).
      upm: ds.entitySize ? ds.entitySize / 0.8 : 1,
      events: { kill: ev('kill'), death: ev('death'), destroyed: ev('destroyed'), crash: ev('crash'), fire: ev('fire'), launch: ev('launch'), hit: ev('hit'), capture: ev('capture') },
      shooterMap: shooter?.map,
      ...(d.any ? { dead: { start: d.start, from: d.from, to: d.to } } : {}),
      sideless: ds.teamLabels.flatMap((l, i) => (isUnassignedLabel(String(l)) ? [i] : [])),
    },
    shooter,
  };
}

/** The movement analysis of the data; rejects with an AbortError when `signal` is aborted. */
export function runManeuvers(ds: Dataset, sc: CompareScope, opts: { signal?: AbortSignal; onProgress?: (f: number) => void } = {}): Promise<ManeuverReport> {
  const scope = analysisScope(sc);
  const cmp = prepareCompare(ds, [], scope, null);
  cmp.meta.hasDir = false;
  const { opt, shooter } = maneuverOptions(ds);
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    let next = cmp.lo;
    let inFlight = 0;
    let finishing = false;
    let over = false;
    const total = cmp.hi - cmp.lo;
    const end = () => {
      over = true;
      worker.terminate();
    };
    const fail = (e: unknown) => {
      if (over) return;
      end();
      reject(e);
    };
    opts.signal?.addEventListener('abort', () => fail(new DOMException('aborted', 'AbortError')), { once: true });
    const pump = () => {
      while (!over && inFlight < IN_FLIGHT && next < cmp.hi) {
        const n = Math.min(COMPARE_CHUNK, cmp.hi - next);
        const { chunk, transfer } = chunkAt(cmp, next, n);
        let sh: Uint32Array | null = null;
        if (shooter) {
          sh = shooter.col.slice(next, next + n);
          transfer.push(sh.buffer as ArrayBuffer);
        }
        worker.postMessage({ type: 'chunk', chunk: { ...chunk, target: null, shooter: sh } }, transfer);
        next += n;
        inFlight++;
      }
      if (!over && !finishing && next >= cmp.hi && inFlight === 0) {
        finishing = true;
        worker.postMessage({ type: 'finish' });
      }
    };
    worker.onmessage = (e: MessageEvent<{ type: 'ack' } | { type: 'done'; report: ManeuverReport } | { type: 'error'; message: string }>) => {
      if (over) return;
      const m = e.data;
      if (m.type === 'ack') {
        inFlight--;
        opts.onProgress?.(total > 0 ? Math.max(0, next - cmp.lo - inFlight * COMPARE_CHUNK) / total : 1);
        pump();
      } else if (m.type === 'done') {
        end();
        resolve(m.report);
      } else fail(new Error(m.message));
    };
    worker.onerror = (e) => fail(new Error(e.message || 'movement analysis worker failed'));
    if (opts.signal?.aborted) return fail(new DOMException('aborted', 'AbortError'));
    worker.postMessage({ type: 'start', meta: cmp.meta, scope: cmp.scope, opt });
    pump();
  });
}
