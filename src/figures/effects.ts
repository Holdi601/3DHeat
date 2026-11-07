/**
 * Effects in box replay: what a match's event rows leave behind for a while -
 * a smoke's cloud, a molotov's fire, a flash and an HE's burst, a decoy, the
 * planted bomb - shown where the event happened for as long as it lasts, in
 * the side's colour, at true size. The rows are any dataset's: an event column
 * (named like Event) whose label is one of `EFFECTS` below.
 *
 * Durations are the games' own: a CS2 smoke blooms for about 18 s and a
 * molotov burns 7 s; a bomb stays until its round ends (taken as 40 s, the
 * timer).
 */

import { VertexBuffer } from '../race/geometry';
import type { Dataset } from '../state/types';
import { CATALOG } from './catalog';
import { place, TemplateCache, type Template } from './kit';

export const EFFECTS: Record<string, { figure: string; seconds: number }> = {
  smoke: { figure: 'cs2-smoke', seconds: 18 },
  molotov: { figure: 'cs2-molotov', seconds: 7 },
  incendiary: { figure: 'cs2-molotov', seconds: 7 },
  flash: { figure: 'cs2-flash', seconds: 1.2 },
  he: { figure: 'cs2-he', seconds: 0.8 },
  decoy: { figure: 'cs2-decoy', seconds: 15 },
  plant: { figure: 'cs2-bomb', seconds: 40 },
};

const LONGEST = Math.max(...Object.values(EFFECTS).map((e) => e.seconds));

interface EffectRows {
  rows: Uint32Array;
  times: Float64Array;
  figures: string[];
  seconds: Float32Array;
}

const cache = new WeakMap<Dataset, EffectRows | null>();

function effectRows(d: Dataset): EffectRows | null {
  if (cache.has(d)) return cache.get(d)!;
  const col = d.attrs.find((a) => a.kind === 'category' && a.categories && /^events?$/i.test(a.name.trim()));
  if (!col || !col.categories || !d.time) {
    cache.set(d, null);
    return null;
  }
  // Which category ids are effects.
  const kinds = col.categories.map((c) => EFFECTS[c.trim().toLowerCase()] ?? null);
  if (!kinds.some(Boolean)) {
    cache.set(d, null);
    return null;
  }
  const ids = col.data as Uint32Array;
  const rows: number[] = [];
  for (let i = 0; i < d.count; i++) if (kinds[ids[i]]) rows.push(i);
  rows.sort((a, b) => d.time![a] - d.time![b]);
  const out: EffectRows = {
    rows: Uint32Array.from(rows),
    times: Float64Array.from(rows.map((r) => d.time![r])),
    figures: rows.map((r) => kinds[ids[r]]!.figure),
    seconds: Float32Array.from(rows.map((r) => kinds[ids[r]]!.seconds)),
  };
  cache.set(d, out);
  return out;
}

export class EffectLayer {
  private readonly templates = new TemplateCache();

  private template(kind: string): Template | null {
    const e = CATALOG[kind];
    return e ? this.templates.get(kind, e.build) : null;
  }

  /**
   * Appends to `out` every effect alive at `now` in `session` (-1 for all),
   * in the colour of its row's person (`colorOf`), scaled by `unitsPerMetre`
   * (the data's units in a metre). Returns how many were drawn.
   */
  build(d: Dataset, now: number, session: number, unitsPerMetre: number, colorOf: (row: number) => [number, number, number], out: VertexBuffer): number {
    const e = effectRows(d);
    if (!e) return 0;
    // The first row that can still be alive: binary search on the start time.
    let lo = 0;
    let hi = e.times.length;
    const from = now - LONGEST;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (e.times[mid] < from) lo = mid + 1;
      else hi = mid;
    }
    let n = 0;
    for (let i = lo; i < e.times.length && e.times[i] <= now; i++) {
      const age = now - e.times[i];
      if (age > e.seconds[i]) continue;
      const row = e.rows[i];
      if (session >= 0 && d.sessionId && d.sessionId[row] !== session) continue;
      const t = this.template(e.figures[i]);
      if (!t) continue;
      // Fade in over the first half second and out over the last second.
      const alpha = Math.min(1, age / 0.5, (e.seconds[i] - age) / 1);
      place(out, t, { x: d.px[row], y: d.py[row], z: d.pz[row], yaw: 0, scale: unitsPerMetre }, colorOf(row), Math.max(0.05, alpha));
      n++;
    }
    return n;
  }
}
