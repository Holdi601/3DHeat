/**
 * The view cone: what a player sees - the frustum from their eyes along where
 * they look, as wide as their game's field of view, narrower while they aim
 * or look through a scope, sight or binoculars where the data says so, and as
 * long as a sensible visual range. Cut by the line of sight like the ranges.
 *
 * The field of view: the game's default (`data/games/<id>.json`, `fov`), else
 * 90 degrees across at 16:9. Narrowed by, first found: a `fov` column
 * (degrees across), a magnification or zoom column (`zoom`, `magnification`,
 * `scopeLevel` - above 1: that many times), a sight-name column matched
 * against the game's optics, or an aiming flag (`ads`, `aiming`, `scoped`:
 * the game's first optic, else 1.5 times). The width eases to a new value over
 * a fifth of a second, as the game's own zoom does.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import type { GameCatalogue } from './catalog';

/** Width over height of the view drawn. */
export const VIEW_ASPECT = 16 / 9;
const DEFAULT_FOV = 90;
/** Visual range when the game does not say, metres, by figure domain. */
export const VIEW_REACH: Record<string, number> = { person: 400, ground: 2000, sea: 15000, air: 10000, heli: 6000 };

interface Optic {
  match: RegExp;
  fov: number | null;
  magnification: number | null;
}

/** The game's default view across, degrees, from its catalogue's `fov.default` (a vertical one turned across at 16:9). */
export function gameFov(game: GameCatalogue | null): number {
  const d = ((game?.fov ?? {}) as { default?: { horizontal?: unknown; vertical?: unknown } }).default;
  if (d && typeof d.horizontal === 'number' && d.horizontal > 0) return d.horizontal;
  if (d && typeof d.vertical === 'number' && d.vertical > 0) return acrossOf(d.vertical);
  return DEFAULT_FOV;
}

/** The game's visual range, metres, or null. */
export function gameViewDistance(game: GameCatalogue | null): number | null {
  const v = ((game?.fov ?? {}) as { viewDistance?: unknown }).viewDistance;
  return typeof v === 'number' && v > 0 ? v : null;
}

/** Degrees across for degrees up, at `VIEW_ASPECT`. */
export function acrossOf(vertical: number): number {
  return (2 * Math.atan(Math.tan((vertical * Math.PI) / 360) * VIEW_ASPECT) * 180) / Math.PI;
}

/** Degrees up for degrees across, at `VIEW_ASPECT`. */
export function upOf(across: number): number {
  return (2 * Math.atan(Math.tan((across * Math.PI) / 360) / VIEW_ASPECT) * 180) / Math.PI;
}

/** The view across through an optic magnifying `m` times, from the unaided `fov`. */
export function magnified(fov: number, m: number): number {
  return (2 * Math.atan(Math.tan((fov * Math.PI) / 360) / Math.max(1, m)) * 180) / Math.PI;
}

function optics(game: GameCatalogue | null): Optic[] {
  const z = ((game?.fov ?? {}) as { zoom?: unknown }).zoom;
  const out: Optic[] = [];
  for (const o of Array.isArray(z) ? (z as Record<string, unknown>[]) : []) {
    try {
      if (typeof o.match !== 'string') continue;
      const fov = typeof o.fov === 'number' && o.fov > 0 ? o.fov : null;
      const magnification = typeof o.magnification === 'number' && o.magnification > 0 ? o.magnification : null;
      if (fov || magnification) out.push({ match: new RegExp(o.match, 'i'), fov, magnification });
    } catch {
      // A broken pattern: that optic is left out.
    }
  }
  return out;
}

const FOV_COLUMN = /^(fov|field ?of ?view|zoom ?fov)$/i;
const MAG_COLUMN = /^(zoom|zoom ?level|magnification|scope ?level|optic ?zoom|zoom ?factor)$/i;
const SIGHT_COLUMN = /^(sight|optic|scope|zoom ?mode|sight ?mode|scope ?name)$/i;
const AIM_FLAG = /^(ads|aiming|aim ?down ?sights?|is ?scoped|scoped|is ?aiming|zoomed)$/i;

export class ViewFov {
  private d: Dataset | null = null;
  private game: GameCatalogue | null = null;
  private base = DEFAULT_FOV;
  private optics: Optic[] = [];
  private fov: AttributeColumn | null = null;
  private mag: AttributeColumn | null = null;
  private sight: AttributeColumn | null = null;
  private flag: AttributeColumn | null = null;
  /** Per person: the width drawn last and when (data seconds). */
  private readonly eased = new Map<number, { fov: number; t: number }>();

  private attach(d: Dataset, game: GameCatalogue | null): void {
    this.d = d;
    this.game = game;
    this.base = gameFov(game);
    this.optics = optics(game);
    const num = (re: RegExp) => d.attrs.find((a) => a.kind !== 'category' && re.test(a.name.trim())) ?? null;
    this.fov = num(FOV_COLUMN);
    this.mag = num(MAG_COLUMN);
    this.sight = d.attrs.find((a) => a.kind === 'category' && SIGHT_COLUMN.test(a.name.trim())) ?? null;
    this.flag = d.attrs.find((a) => AIM_FLAG.test(a.name.trim())) ?? null;
    this.eased.clear();
  }

  /** The unaided view across, degrees. */
  baseFov(d: Dataset, game: GameCatalogue | null): number {
    if (d !== this.d || game !== this.game) this.attach(d, game);
    return this.base;
  }

  /** The view across a row's data asks for, degrees. */
  wanted(d: Dataset, game: GameCatalogue | null, row: number): number {
    if (d !== this.d || game !== this.game) this.attach(d, game);
    if (row < 0) return this.base;
    const v = (c: AttributeColumn | null) => (c ? (c.data as Float32Array)[row] : NaN);
    const f = v(this.fov);
    if (f > 1 && f < 179) return f;
    const m = v(this.mag);
    if (m > 1.01) return magnified(this.base, m);
    if (this.sight) {
      const name = this.sight.categories?.[(this.sight.data as Uint32Array)[row]] ?? '';
      for (const o of this.optics) if (name && o.match.test(name)) return o.fov ?? magnified(this.base, o.magnification!);
    }
    if (this.flag) {
      const raw = this.flag.kind === 'category' ? (this.flag.categories?.[(this.flag.data as Uint32Array)[row]] ?? '') : v(this.flag);
      const on = typeof raw === 'number' ? raw > 0.5 : /^(1|true|yes|on|ads|scoped|aiming)$/i.test(raw.trim());
      if (on) {
        const o = this.optics.find((x) => x.magnification && x.magnification > 1) ?? this.optics[0];
        return o ? (o.fov ?? magnified(this.base, o.magnification!)) : magnified(this.base, 1.5);
      }
    }
    return this.base;
  }

  /** The view across drawn for a person now: eased towards what the row asks for (a fifth of a second). */
  at(d: Dataset, game: GameCatalogue | null, person: number, row: number, t: number): number {
    const want = this.wanted(d, game, row);
    const last = this.eased.get(person);
    let fov = want;
    if (last && Number.isFinite(t) && t >= last.t && t - last.t < 2) fov = want + (last.fov - want) * Math.exp(-(t - last.t) / 0.2);
    this.eased.set(person, { fov, t });
    return fov;
  }
}
