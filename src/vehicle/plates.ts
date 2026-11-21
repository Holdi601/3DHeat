/**
 * A vehicle's armour plates and hit regions on the vehicle heatmap: the
 * damage-model parts a local model pack carries with each unit
 * (`modelpack.ts`), each with its thickness where the game gives one, and
 * which one each hit struck. Every game's the same way: War Thunder's armour
 * plates and modules, Battlefield's direction zones (a part's front, rear,
 * sides and top) and destructible pieces, Arma Reforger's hit zones and
 * armour by thickness, DCS World's collision shells - each region with the
 * model part it moves with.
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
  /** What kind of region, where the pack says: `zone`, `piece`, `shell`, `armour`, `engine`, `fuel`... ('' none). */
  group: string;
  /** A direction zone's side: `front`, `rear`, `left`, `right`, `top` ('' none). */
  zone: string;
  /** Hit points, where the game gives them. */
  hp: number | null;
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

function decode(doc: { plates?: { name: string; part?: string; mm?: number; cls?: string; group?: string; zone?: string; hp?: number; v: string; i: string; wide?: boolean }[] }): Plate[] {
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
    out.push({
      name: p.name,
      part: p.part ?? 'hull',
      mm: typeof p.mm === 'number' ? p.mm : null,
      cls: p.cls ?? '',
      group: p.group ?? '',
      zone: p.zone ?? '',
      hp: typeof p.hp === 'number' ? p.hp : null,
      tris,
      min,
      max,
    });
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
        .then((r) => (r.ok && r.status !== 204 ? r.json() : null))
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
        .then((r) => (r.ok && r.status !== 204 ? r.json() : null))
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
 * Whether a hit's point can be trusted: a War Thunder hit whose part number fits the first byte (`hitPart`'s bit 7
 * clear) had its point read a byte late by converters before 0.2.3, so it is not where it struck. `oneByte`: the
 * file's one-byte points were found to lie on the parts they name (`oneBytePointsHold`), as 0.2.3 reads them.
 */
export function pointSent(h: Pick<VehicleHit, 'part'>, oneByte = false): boolean {
  return oneByte || h.part === null || !Number.isFinite(h.part) || (h.part & 0x80) !== 0;
}

/**
 * Whether the one-byte hits' points lie on the plates they name (median within 5 cm of the plate's box): read by a
 * converter that places them right (0.2.3 on, median 1 mm), whatever version the file does not say.
 */
export function oneBytePointsHold(hits: readonly VehicleHit[], list: Plate[], hitNames: string[] | null | undefined): boolean {
  const byName = new Map<string, Plate>();
  for (const p of list) byName.set(p.name.replace(/_dm$/, ''), p);
  const d: number[] = [];
  for (const h of hits) {
    if (!h.local || h.part === null || !Number.isFinite(h.part) || h.part & 0x80) continue;
    const named = hitPartName(h, hitNames);
    const p = named !== null ? byName.get(named) : undefined;
    if (p) d.push(boxDistance(h.local, p));
    if (d.length >= 200) break;
  }
  if (d.length < 5) return false;
  d.sort((a, b) => a - b);
  return d[d.length >> 1] <= 0.05;
}

/** A pack unit's plates when they are here already (never asks for them): null otherwise. */
export function platesHere(figure: string | null): Plate[] | null {
  const u = packUnitOf(figure);
  const had = u ? plates.get(`${u.game}/${u.unit}`) : undefined;
  return Array.isArray(had) ? had : null;
}

/** Which way a model part lies for the hit marks: a turret or its gun on the turret, the hull and its gear on the hull. */
export function partSide(part: string): HitPart {
  const base = part.split('.')[0];
  return base === 'turret' || base === 'gun' ? HitPart.Turret : base === 'hull' || base === 'gear' ? HitPart.Hull : HitPart.Any;
}

/**
 * Which way a part name lies for the hit marks (`HitPart`): on the turret (or its gun), on the hull, or not known. A
 * region of the unit's plates (`list`) of that name says by the model part it moves with, whatever the game calls it;
 * else the name's own words (War Thunder's, Battlefield's `<part>_<zone>`).
 */
export function hitPartSide(name: string | null, list?: Plate[] | null): HitPart {
  if (!name) return HitPart.Any;
  if (list) {
    const p = list.find((q) => q.name === name || q.name.replace(/_dm$/, '') === name);
    if (p && partSide(p.part) !== HitPart.Any) return partSide(p.part);
  }
  if (/^(turret|gun|cannon|mantlet|ex_\w*turret|optic_turret|commander|ammo_turret|composite_armor_turret|ex_era_turret)/.test(name)) return HitPart.Turret;
  if (/^(hull|body|superstructure|track|wheel|suspension|ex_armor_body|ex_decor_body|ex_era_hull|composite_armor_hull|engine|transmission|fuel_tank|driver)/.test(name)) return HitPart.Hull;
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

/** The squared distance from a point to the nearest of a plate's triangles. */
function triDistance2(p: Vec3, t: Float32Array): number {
  let best = Infinity;
  for (let k = 0; k + 8 < t.length; k += 9) {
    const d = pointTri2(p[0], p[1], p[2], t, k);
    if (d < best) best = d;
  }
  return best;
}

/** Squared distance from (px, py, pz) to the triangle at `k` of `t` (Ericson's closest point on a triangle). */
function pointTri2(px: number, py: number, pz: number, t: Float32Array, k: number): number {
  const ax = t[k], ay = t[k + 1], az = t[k + 2];
  const abx = t[k + 3] - ax, aby = t[k + 4] - ay, abz = t[k + 5] - az;
  const acx = t[k + 6] - ax, acy = t[k + 7] - ay, acz = t[k + 8] - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  let qx: number, qy: number, qz: number;
  if (d1 <= 0 && d2 <= 0) [qx, qy, qz] = [ax, ay, az];
  else {
    const bpx = px - t[k + 3], bpy = py - t[k + 4], bpz = pz - t[k + 5];
    const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
    const cpx = px - t[k + 6], cpy = py - t[k + 7], cpz = pz - t[k + 8];
    const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
    const vc = d1 * d4 - d3 * d2, vb = d5 * d2 - d1 * d6, va = d3 * d6 - d5 * d4;
    if (d3 >= 0 && d4 <= d3) [qx, qy, qz] = [t[k + 3], t[k + 4], t[k + 5]];
    else if (d6 >= 0 && d5 <= d6) [qx, qy, qz] = [t[k + 6], t[k + 7], t[k + 8]];
    else if (vc <= 0 && d1 >= 0 && d3 <= 0) {
      const v = d1 / (d1 - d3);
      [qx, qy, qz] = [ax + abx * v, ay + aby * v, az + abz * v];
    } else if (vb <= 0 && d2 >= 0 && d6 <= 0) {
      const w = d2 / (d2 - d6);
      [qx, qy, qz] = [ax + acx * w, ay + acy * w, az + acz * w];
    } else if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
      const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
      [qx, qy, qz] = [t[k + 3] + (t[k + 6] - t[k + 3]) * w, t[k + 4] + (t[k + 7] - t[k + 4]) * w, t[k + 5] + (t[k + 8] - t[k + 5]) * w];
    } else {
      const den = 1 / (va + vb + vc);
      const v = vb * den, w = vc * den;
      [qx, qy, qz] = [ax + abx * v + acx * w, ay + aby * v + acy * w, az + abz * v + acz * w];
    }
  }
  return (px - qx) ** 2 + (py - qy) ** 2 + (pz - qz) ** 2;
}

/** Per hit (by `id`), the plate it struck: by the part its word names, else the plate nearest its point; -1 none. */
export function platesOfHits(hits: readonly VehicleHit[], list: Plate[], hitNames: string[] | null | undefined): Map<number, number> {
  const byName = new Map<string, number>();
  list.forEach((p, i) => byName.set(p.name.replace(/_dm$/, ''), i));
  const out = new Map<number, number>();
  const oneByte = oneBytePointsHold(hits, list, hitNames);
  for (const h of hits) {
    const named = hitPartName(h, hitNames);
    let at = named !== null ? (byName.get(named) ?? -1) : -1;
    if (at < 0 && h.local && pointSent(h, oneByte)) {
      let best = 0.25;
      const inside: number[] = [];
      for (let i = 0; i < list.length; i++) {
        const d = boxDistance(h.local, list[i]);
        if (d === 0) inside.push(i);
        // The thinnest of the plates the point lies on: an outer plate before the box round the whole hull.
        if (d < best || (d === 0 && best === 0 && list[i].mm !== null && (list[at]?.mm ?? Infinity) > list[i].mm!)) {
          best = d;
          at = i;
        }
      }
      // Regions without thicknesses whose boxes the point lies in alike (a part's direction zones share its box):
      // the one whose surface is nearest.
      if (inside.length > 1 && list[at].mm === null) {
        let near = Infinity;
        for (const i of inside) {
          const d = triDistance2(h.local, list[i].tris);
          if (d < near) {
            near = d;
            at = i;
          }
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

/**
 * A point struck on a turned turret (its gun raised) back where the model holds it at rest: turned back about the
 * turret's vertical by the yaw, then lowered about the trunnion by the elevation (radians, right and up positive) -
 * so a hit on the turret lies on its plate whichever way the turret faced. `part` is the plate's: the main turret's
 * (`turret`, `gun`) turn back, any other (the hull's, a ship's numbered mounts', whose yaw the rows do not carry) stays.
 * Which part a plate rides is the pack's to say (War Thunder: the damage model's own node tree - many plates named
 * for the turret hang from the hull and do not turn).
 */
export function atRest(p: Vec3, part: string, yaw: number, pitch: number, turret: Vec3 | null, gun: Vec3 | null): Vec3 {
  let [x, y, z] = p;
  if ((part === 'turret' || part === 'gun') && turret && Number.isFinite(yaw)) {
    const c = Math.cos(-yaw), s = Math.sin(-yaw);
    const dx = x - turret[0], dz = z - turret[2];
    x = turret[0] + dx * c - dz * s;
    z = turret[2] + dx * s + dz * c;
  }
  if (part === 'gun' && gun && Number.isFinite(pitch)) {
    const c = Math.cos(-pitch), s = Math.sin(-pitch);
    const dx = x - gun[0], dy = y - gun[1];
    x = gun[0] + dx * c - dy * s;
    y = gun[1] + dx * s + dy * c;
  }
  return [x, y, z];
}
