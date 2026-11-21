/**
 * A vehicle's armour plates on the vehicle heatmap: the damage-model parts a
 * local model pack carries with each unit (`modelpack.ts`), each with its
 * thickness where the game gives one, and which plate each hit struck.
 *
 * The server hands them out per unit, only when the view asks (`/dm/<game>/
 * <unit>` under the model pack route), and per game the names its replays
 * number hit parts by (`/hit-parts/<game>`): a hit's part word (`hitPart`)
 * names its plate there. A hit whose word names no plate of the unit is put
 * on the plate nearest its point. Fetched once and kept; nothing of it runs
 * on the frame path.
 */

import type { Vec3, VertexBuffer } from '../race/geometry';
import { MODEL_PACK_ROUTE } from '../figures/modelpack';
import { HitPart } from '../figures/snap';
import type { VehicleHit } from './hits';

export interface Plate {
  name: string;
  /** The model part it moves with: `hull`, `turret`, `gun`, `turret.2`... */
  part: string;
  mm: number | null;
  cls: string;
  /** Triangles, three corners each (x, y, z): the figure frame, metres. */
  tris: Float32Array;
  min: Vec3;
  max: Vec3;
}

/** Per plate, what struck it: every hit, and those that went through, did not, bounced, or killed. */
export interface PlateCount {
  hits: number;
  through: number;
  stopped: number;
  ricochet: number;
  kills: number;
}

const plates = new Map<string, Plate[] | null | Promise<void>>();
const names = new Map<string, string[] | null | Promise<void>>();
let version = 0;

/** Moves on whenever plates or names arrive: for views that keep what they built from them. */
export function platesVersion(): number {
  return version;
}

/** The game and unit a pack figure name stands for (`mbt@model:warthunder:us_m1a2_sep`), or null. */
export function packUnitOf(figure: string | null): { game: string; unit: string } | null {
  const m = figure ? /@model:([^:]+):(.+)$/.exec(figure) : null;
  return m ? { game: m[1], unit: m[2] } : null;
}

const b64 = (s: string): Uint8Array => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

function decode(doc: { plates?: { name: string; part?: string; mm?: number; cls?: string; v: string; i: string; wide?: boolean }[] }): Plate[] {
  const out: Plate[] = [];
  for (const p of doc.plates ?? []) {
    const vb = b64(p.v);
    const ib = b64(p.i);
    const v = new Float32Array(vb.buffer, vb.byteOffset, vb.byteLength >> 2);
    const idx = p.wide ? new Uint32Array(ib.buffer, ib.byteOffset, ib.byteLength >> 2) : new Uint16Array(ib.buffer, ib.byteOffset, ib.byteLength >> 1);
    const tris = new Float32Array(idx.length * 3);
    const min: Vec3 = [Infinity, Infinity, Infinity];
    const max: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (let k = 0; k < idx.length; k++)
      for (let a = 0; a < 3; a++) {
        const x = v[idx[k] * 3 + a];
        tris[k * 3 + a] = x;
        if (x < min[a]) min[a] = x;
        if (x > max[a]) max[a] = x;
      }
    if (!idx.length) continue;
    out.push({ name: p.name, part: p.part ?? 'hull', mm: typeof p.mm === 'number' ? p.mm : null, cls: p.cls ?? '', tris, min, max });
  }
  return out;
}

/** A pack unit's plates: the list once here, null when it has none, undefined while they are asked for (asked now). */
export function platesOf(figure: string | null): Plate[] | null | undefined {
  const u = packUnitOf(figure);
  if (!u) return null;
  const key = `${u.game}/${u.unit}`;
  const had = plates.get(key);
  if (had === undefined) {
    plates.set(
      key,
      fetch(`${MODEL_PACK_ROUTE}/dm/${encodeURIComponent(u.game)}/${encodeURIComponent(u.unit)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((doc) => void plates.set(key, doc ? decode(doc) : null))
        .catch(() => void plates.set(key, null))
        .finally(() => version++),
    );
    namesOf(u.game);
    return undefined;
  }
  return had instanceof Promise ? undefined : had;
}

/** A game's hit part names, in the order its replays number them; null when the pack has none (asked once). */
export function namesOf(game: string): string[] | null | undefined {
  const had = names.get(game);
  if (had === undefined) {
    names.set(
      game,
      fetch(`${MODEL_PACK_ROUTE}/hit-parts/${encodeURIComponent(game)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((doc: { names?: unknown } | null) => void names.set(game, doc && Array.isArray(doc.names) ? (doc.names as string[]) : null))
        .catch(() => void names.set(game, null))
        .finally(() => version++),
    );
    return undefined;
  }
  return had instanceof Promise ? undefined : had;
}

/**
 * The part number in a War Thunder hit's part word (the two bytes as sent, little-endian): bit 0 of the first a
 * flag, bits 1-6 the low six bits, bit 7 set when the second byte carries the bits above.
 */
export function partNumber(word: number): number {
  const lo = word & 0xff;
  return ((lo >> 1) & 63) | (lo & 0x80 ? ((word >> 8) & 0x7f) << 6 : 0);
}

/** The damage-model part a hit names, or null (no word, no names, a number past them). */
export function hitPartName(h: Pick<VehicleHit, 'part'>, list: string[] | null | undefined): string | null {
  if (!list || h.part === null || !Number.isFinite(h.part)) return null;
  return list[partNumber(h.part)] ?? null;
}

/**
 * Whether a hit's point as sent can be trusted: a War Thunder hit whose part number fits the first byte sends its
 * point a byte earlier than the converter read it (`hitPart`'s bit 7 clear), so the point is not where it struck.
 */
export function pointSent(h: Pick<VehicleHit, 'part'>): boolean {
  return h.part === null || !Number.isFinite(h.part) || (h.part & 0x80) !== 0;
}

/** Which way a part name lies for the hit marks (`HitPart`): on the turret (or its gun), on the hull, or not known. */
export function hitPartSide(name: string | null): HitPart {
  if (!name) return HitPart.Any;
  if (/^(turret|gun|cannon|mantlet|ex_\w*turret|optic_turret|commander|ammo_turret|composite_armor_turret|ex_era_turret)/.test(name)) return HitPart.Turret;
  if (/^(body|superstructure|track|wheel|suspension|ex_armor_body|ex_decor_body|ex_era_hull|composite_armor_hull|engine|transmission|fuel_tank|driver)/.test(name)) return HitPart.Hull;
  return HitPart.Any;
}

function boxDistance(p: Vec3, pl: Plate): number {
  let s = 0;
  for (let a = 0; a < 3; a++) {
    const d = Math.max(pl.min[a] - p[a], 0, p[a] - pl.max[a]);
    s += d * d;
  }
  return Math.sqrt(s);
}

/** Per hit (by `id`), the plate it struck: by the part its word names, else the plate nearest its point; -1 none. */
export function platesOfHits(hits: readonly VehicleHit[], list: Plate[], hitNames: string[] | null | undefined): Map<number, number> {
  const byName = new Map<string, number>();
  list.forEach((p, i) => byName.set(p.name.replace(/_dm$/, ''), i));
  const out = new Map<number, number>();
  for (const h of hits) {
    const named = hitPartName(h, hitNames);
    let at = named !== null ? (byName.get(named) ?? -1) : -1;
    if (at < 0 && h.local && pointSent(h)) {
      let best = 0.25;
      for (let i = 0; i < list.length; i++) {
        const d = boxDistance(h.local, list[i]);
        // The thinnest of the plates the point lies on: an outer plate before the box round the whole hull.
        if (d < best || (d === 0 && best === 0 && list[i].mm !== null && (list[at]?.mm ?? Infinity) > list[i].mm!)) {
          best = d;
          at = i;
        }
      }
    }
    out.set(h.id, at);
  }
  return out;
}

/** What struck each plate, summed over `hits` (every match the filters and the volumes keep). */
export function plateCounts(hits: readonly VehicleHit[], list: Plate[], at: Map<number, number>): PlateCount[] {
  const out = list.map(() => ({ hits: 0, through: 0, stopped: 0, ricochet: 0, kills: 0 }));
  for (const h of hits) {
    const i = at.get(h.id) ?? -1;
    if (i < 0) continue;
    const c = out[i];
    c.hits++;
    if (h.killingShot || h.outcome === 'kill') c.kills++;
    if (/ricochet|bounce/i.test(h.code)) c.ricochet++;
    else if (h.outcome === 'nodamage') c.stopped++;
    else if (h.outcome !== 'hit') c.through++;
  }
  return out;
}

/** The plate under a screen point: `project` takes a figure point (lifted) to pixels; nearest along the view wins. */
export function plateAt(list: Plate[], project: (x: number, y: number, z: number) => [number, number, number] | null, at: [number, number]): number {
  let best = -1;
  let bestZ = Infinity;
  for (let i = 0; i < list.length; i++) {
    // A plate whose box does not cover the point on the screen is passed over whole.
    const { min, max } = list[i];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, behind = false;
    for (let c = 0; c < 8; c++) {
      const s = project(c & 1 ? max[0] : min[0], c & 2 ? max[1] : min[1], c & 4 ? max[2] : min[2]);
      if (!s) {
        behind = true;
        break;
      }
      if (s[0] < x0) x0 = s[0];
      if (s[0] > x1) x1 = s[0];
      if (s[1] < y0) y0 = s[1];
      if (s[1] > y1) y1 = s[1];
    }
    if (!behind && (at[0] < x0 || at[0] > x1 || at[1] < y0 || at[1] > y1)) continue;
    const t = list[i].tris;
    for (let k = 0; k + 8 < t.length; k += 9) {
      const a = project(t[k], t[k + 1], t[k + 2]);
      const b = project(t[k + 3], t[k + 4], t[k + 5]);
      const c = project(t[k + 6], t[k + 7], t[k + 8]);
      if (!a || !b || !c) continue;
      const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(d) < 1e-9) continue;
      const l1 = ((b[1] - c[1]) * (at[0] - c[0]) + (c[0] - b[0]) * (at[1] - c[1])) / d;
      const l2 = ((c[1] - a[1]) * (at[0] - c[0]) + (a[0] - c[0]) * (at[1] - c[1])) / d;
      const l3 = 1 - l1 - l2;
      if (l1 < 0 || l2 < 0 || l3 < 0) continue;
      const z = l1 * a[2] + l2 * b[2] + l3 * c[2];
      if (z < bestZ) {
        bestZ = z;
        best = i;
      }
    }
  }
  return best;
}

const LIGHT_DIR: Vec3 = [0.35 / 1.0, 0.85 / 1.0, 0.4 / 1.0].map((c) => c / Math.hypot(0.35, 0.85, 0.4)) as Vec3;

/**
 * The plates as the surface of the vehicle heatmap: each in its own colour, the ramp over its hits (the most-hit
 * plate the top of the ramp), unhit ones the paint; lit flat by the heatmap's light. Returns each plate's first
 * vertex and vertex count in `out`.
 */
export function paintPlates(list: Plate[], counts: PlateCount[], ramp: (t: number, out: number[]) => void, out: VertexBuffer, lift: number, heat: boolean): [number, number][] {
  const ranges: [number, number][] = [];
  let most = 0;
  for (const c of counts) if (c.hits > most) most = c.hits;
  const col = [0, 0, 0, 0];
  for (let i = 0; i < list.length; i++) {
    const t = list[i].tris;
    const n = heat && most > 0 ? counts[i].hits / most : 0;
    let r = 0.66, g = 0.68, b = 0.7;
    if (n > 0) {
      ramp(Math.max(0.08, n), col);
      const a = Math.max(0.55, col[3]);
      r = r * (1 - a) + col[0] * a;
      g = g * (1 - a) + col[1] * a;
      b = b * (1 - a) + col[2] * a;
    }
    ranges.push([out.count, t.length / 3]);
    for (let k = 0; k + 8 < t.length; k += 9) {
      const ux = t[k + 3] - t[k], uy = t[k + 4] - t[k + 1], uz = t[k + 5] - t[k + 2];
      const vx = t[k + 6] - t[k], vy = t[k + 7] - t[k + 1], vz = t[k + 8] - t[k + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      // Both sides lit alike: the plates' windings are the game's, not always outward.
      const lit = 0.55 + 0.45 * Math.abs((nx * LIGHT_DIR[0] + ny * LIGHT_DIR[1] + nz * LIGHT_DIR[2]) / len);
      for (let c = 0; c < 9; c += 3) out.vertex(t[k + c], t[k + c + 1] + lift, t[k + c + 2], r * lit, g * lit, b * lit, 1);
    }
  }
  return ranges;
}
