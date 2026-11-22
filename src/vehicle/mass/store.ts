/**
 * The hits of a mass load, held in the analysis worker: the columns of
 * `types.ts` grown as files arrive, the dictionaries they share (vehicles,
 * players, teams, ammunition), the matches, and what is worked out from them
 * once: each hit's impact speed and descent (recorded where the replay has
 * them, a ballistic estimate otherwise, `ballistics.ts`), and per vehicle
 * model shown, the plate each hit struck with the angle and the armour along
 * its way (`geometry.ts`).
 */

import type { Vec3 } from '../../race/geometry';
import { atRest } from '../plates';
import { FlightCache, shellFor, shellKind, type ShellKind } from './ballistics';
import { descentOf, dirAtRest, effectiveThickness, impactAngle, nearestTriangle, rayEntry, triNormal } from './geometry';
import {
  BYTES_PER_HIT,
  COLUMN_NAMES,
  COLUMN_TYPES,
  FLAG_DIR,
  FLAG_DIST,
  FLAG_LOCAL,
  FLAG_POSE,
  FLAG2_DIR_DERIVED,
  FLAG2_LOCAL_EST,
  FLAG2_SPEED,
  NONE16,
  type HitBlock,
  type HitColumns,
  type HitMatch,
  type VehicleMeta,
} from './types';

/** Where a derived value came from, per hit. */
export const SRC_UNKNOWN = 0, SRC_RECORDED = 1, SRC_DERIVED = 2, SRC_BALLISTIC = 3;

class Dict {
  readonly list: string[] = [''];
  private readonly m = new Map<string, number>([['', 0]]);
  code(s: string): number {
    let c = this.m.get(s);
    if (c === undefined) {
      c = this.list.length;
      this.list.push(s);
      this.m.set(s, c);
    }
    return c;
  }
  get(s: string): number | undefined {
    return this.m.get(s);
  }
}

/** A plate as the worker gets it: name, model part, thickness, triangles. */
export interface PlateGeometry {
  name: string;
  part: string;
  mm: number | null;
  tris: Float32Array;
}

/** What one vehicle model's plates make of its hits: per hit of `rows`, the plate, angle, armour along the way, rest point and normal. */
export interface PlateHits {
  key: string;
  rows: Uint32Array;
  plate: Int16Array;
  /** Degrees from the plate's normal; NaN unknown. */
  angle: Float32Array;
  /** Where the angle's shell direction came from (`SRC_*`). */
  angleSrc: Uint8Array;
  effMm: Float32Array;
  /** Rest-pose point and normal, x3. */
  point: Float32Array;
  normal: Float32Array;
}

export class HitStore {
  n = 0;
  private cap = 0;
  cols: HitColumns = { n: 0 } as HitColumns;
  readonly vehicles = new Dict();
  readonly players = new Dict();
  readonly teams = new Dict();
  readonly ammoTypes = new Dict();
  readonly ammoNames = new Dict();
  readonly matches: HitMatch[] = [];
  /** Per vehicle code, from the catalogue (filled by the page). */
  meta: (VehicleMeta | null)[] = [];
  /** Impact speed (m/s), descent (0.01 degrees, + down) and where each came from. */
  speed = new Uint16Array(0);
  speedSrc = new Uint8Array(0);
  descent = new Int16Array(0);
  descentSrc = new Uint8Array(0);
  /** Hits whose speed and descent are worked out (they are, in order, from 0). */
  derived = 0;
  /** Muzzle speeds the install's catalogue lists, by shell name. */
  catalogue = new Map<string, number>();
  readonly flights = new FlightCache();
  readonly plateHits = new Map<string, PlateHits>();
  kinds: ShellKind[] = [];

  constructor() {
    this.grow(1024);
  }

  /** Bytes the hits take (columns and what is worked out per hit). */
  bytes(): number {
    return this.cap * (BYTES_PER_HIT + 6);
  }

  private grow(need: number): void {
    if (need <= this.cap) return;
    const cap = Math.max(need, Math.ceil(this.cap * 1.5), 1024);
    const next = { n: this.n } as HitColumns;
    for (const k of COLUMN_NAMES) {
      const a = new COLUMN_TYPES[k](cap);
      const old = (this.cols as unknown as Record<string, Uint8Array | undefined>)[k];
      if (old) a.set(old.subarray(0, this.n) as never);
      (next as unknown as Record<string, unknown>)[k] = a;
    }
    this.cols = next;
    const sp = new Uint16Array(cap), ss = new Uint8Array(cap), de = new Int16Array(cap), ds = new Uint8Array(cap);
    sp.set(this.speed.subarray(0, this.n));
    ss.set(this.speedSrc.subarray(0, this.n));
    de.set(this.descent.subarray(0, this.n));
    ds.set(this.descentSrc.subarray(0, this.n));
    this.speed = sp;
    this.speedSrc = ss;
    this.descent = de;
    this.descentSrc = ds;
    this.cap = cap;
  }

  /** Adds one file's hits, its codes moved onto the shared dictionaries. Returns the match's index. */
  add(b: HitBlock): number {
    const m = this.matches.length;
    this.matches.push(b.match);
    const c = b.cols;
    this.grow(this.n + c.n);
    const remap = (list: string[], d: Dict) => Uint32Array.from(list, (s) => d.code(s));
    const veh = remap(b.vehicles, this.vehicles), pl = remap(b.players, this.players), tm = remap(b.teams, this.teams);
    const at = remap(b.ammoTypes, this.ammoTypes), an = remap(b.ammoNames, this.ammoNames);
    const o = this.cols, s = this.n;
    for (let i = 0; i < c.n; i++) {
      const j = s + i;
      o.match[j] = m;
      o.time[j] = c.time[i];
      o.victim[j] = veh[c.victim[i]];
      o.attacker[j] = veh[c.attacker[i]];
      o.victimPlayer[j] = pl[c.victimPlayer[i]];
      o.attackerPlayer[j] = pl[c.attackerPlayer[i]];
      o.victimTeam[j] = tm[c.victimTeam[i]];
      o.attackerTeam[j] = tm[c.attackerTeam[i]];
      o.ammoType[j] = Math.min(65535, at[c.ammoType[i]]);
      o.ammoName[j] = Math.min(65535, an[c.ammoName[i]]);
    }
    for (const k of ['part', 'lx', 'ly', 'lz', 'dx', 'dy', 'dz', 'yaw', 'pitch', 'dist', 'dh', 'calibre', 'result', 'effects', 'flags', 'flags2', 'speed', 'damage'] as const) {
      (o[k] as Uint8Array).set(c[k] as unknown as Uint8Array, s);
    }
    this.n += c.n;
    o.n = this.n;
    return m;
  }

  /** The kind of a hit's shell (by its type and name), kept per ammunition type code. */
  kindOf(i: number): ShellKind {
    const t = this.cols.ammoType[i];
    let k = this.kinds[t];
    if (k === undefined) k = this.kinds[t] = shellKind(this.ammoTypes.list[t] ?? '');
    if (k === 'kinetic' || k === 'explosive' || k === 'unknown') {
      const byName = shellKind('', this.ammoNames.list[this.cols.ammoName[i]] ?? '');
      if (byName === 'ATGM') return 'ATGM';
    }
    return k;
  }

  /**
   * Speed and descent at the hit for every hit not worked out yet: the descent recorded where the replay has the
   * shell's way (in the vehicle's frame; derived where the source works the way out, a Tacview recording from the
   * weapon's motion), else the ballistic flight's; the speed the source's own where it has one (a Tacview weapon's
   * over its last samples, derived), else the ballistic estimate's (War Thunder replays carry the impact speed, the
   * converter does not export it yet). Returns how many hits it worked on.
   */
  deriveFlights(limit = Infinity): number {
    const c = this.cols;
    const end = Math.min(this.n, this.derived + limit);
    for (let i = this.derived; i < end; i++) {
      const dir = c.flags[i] & FLAG_DIR ? ([c.dx[i] / 127, c.dy[i] / 127, c.dz[i] / 127] as Vec3) : null;
      let desc = NaN, descSrc = SRC_UNKNOWN, sp = NaN, spSrc = SRC_UNKNOWN;
      if (dir) {
        desc = descentOf(dir);
        descSrc = c.flags2[i] & FLAG2_DIR_DERIVED ? SRC_DERIVED : SRC_RECORDED;
      }
      if (c.flags2[i] & FLAG2_SPEED && c.speed[i] > 0) {
        sp = c.speed[i];
        spSrc = SRC_DERIVED;
      } else if (c.flags[i] & FLAG_DIST) {
        const kind = this.kindOf(i);
        const name = this.ammoNames.list[c.ammoName[i]] ?? '';
        const shell = shellFor(kind, c.calibre[i] / 10, this.catalogue.get(name.toLowerCase()) ?? null, name);
        const d = c.dist[i] / 4, dh = c.dh[i] === NONE16 ? 0 : c.dh[i] / 4;
        const range = Math.sqrt(Math.max(0, d * d - dh * dh));
        const f = shell && range > 1 ? this.flights.solve(shell, range, dh) : null;
        if (f) {
          sp = f.speed;
          spSrc = SRC_BALLISTIC;
          if (descSrc === SRC_UNKNOWN) {
            desc = f.descent;
            descSrc = SRC_BALLISTIC;
          }
        }
      }
      this.speed[i] = Number.isFinite(sp) ? Math.min(65535, Math.round(sp)) : 0;
      this.speedSrc[i] = spSrc;
      this.descent[i] = Number.isFinite(desc) ? Math.round(desc * 100) : NONE16;
      this.descentSrc[i] = descSrc;
    }
    const did = end - this.derived;
    this.derived = end;
    return did;
  }

  /**
   * The plates a vehicle model's hits struck: by the part the hit names (`names`, the game's part list), else the
   * plate nearest its point; on a turret or gun plate the point and the shell's way turned back to the rest pose by
   * the turret's yaw and the gun's elevation at the hit. Then the plate's normal there, the angle and the armour.
   */
  platesFor(key: string, rows: Uint32Array, plates: PlateGeometry[], names: readonly string[] | null, turret: Vec3 | null, gun: Vec3 | null): PlateHits {
    const had = this.plateHits.get(key);
    if (had && had.rows.length === rows.length) return had;
    const c = this.cols;
    const byName = new Map<string, number>();
    plates.forEach((p, i) => byName.set(p.name.replace(/_dm$/, ''), i));
    const boxes = plates.map((p) => {
      const mn: Vec3 = [Infinity, Infinity, Infinity], mx: Vec3 = [-Infinity, -Infinity, -Infinity];
      for (let k = 0; k < p.tris.length; k += 3) for (let a = 0; a < 3; a++) {
        const v = p.tris[k + a];
        if (v < mn[a]) mn[a] = v;
        if (v > mx[a]) mx[a] = v;
      }
      return [mn, mx] as const;
    });
    const n = rows.length;
    const out: PlateHits = {
      key,
      rows,
      plate: new Int16Array(n).fill(-1),
      angle: new Float32Array(n).fill(NaN),
      angleSrc: new Uint8Array(n),
      effMm: new Float32Array(n).fill(NaN),
      point: new Float32Array(n * 3).fill(NaN),
      normal: new Float32Array(n * 3).fill(NaN),
    };
    for (let j = 0; j < n; j++) {
      const i = rows[j];
      const name = names && c.part[i] >= 0 ? names[c.part[i]] : undefined;
      let at = name !== undefined ? (byName.get(name) ?? -1) : -1;
      const has = (c.flags[i] & FLAG_LOCAL) !== 0;
      let p: Vec3 | null = has ? [c.lx[i] / 1000, c.ly[i] / 1000, c.lz[i] / 1000] : null;
      if (at < 0 && p && !(c.flags2[i] & FLAG2_LOCAL_EST)) {
        let best = 0.25;
        for (let k = 0; k < plates.length; k++) {
          const [mn, mx] = boxes[k];
          let s = 0;
          for (let a = 0; a < 3; a++) {
            const d = Math.max(mn[a] - p[a], 0, p[a] - mx[a]);
            s += d * d;
          }
          const d = Math.sqrt(s);
          if (d < best || (d === 0 && best === 0 && (plates[k].mm ?? Infinity) < (plates[at]?.mm ?? Infinity))) {
            best = d;
            at = k;
          }
        }
      }
      let dir: Vec3 | null = c.flags[i] & FLAG_DIR ? [c.dx[i] / 127, c.dy[i] / 127, c.dz[i] / 127] : null;
      // A point that is only where the weapon's path passed nearest the unit: where that path enters the model.
      // A path that enters none (a proximity fuse's burst beside it) strikes no plate.
      const est = (c.flags2[i] & FLAG2_LOCAL_EST) !== 0;
      if (est && p && dir) {
        const l = Math.hypot(dir[0], dir[1], dir[2]) || 1;
        dir = [dir[0] / l, dir[1] / l, dir[2] / l];
        const e = rayEntry(p, dir, plates, 80);
        at = e ? e.plate : -1;
        p = e ? e.point : p;
      } else if (est) at = -1;
      out.plate[j] = at;
      if (at < 0 || !p) continue;
      const pl = plates[at];
      if (/^(turret|gun)/.test(pl.part) && c.flags[i] & FLAG_POSE && c.yaw[i] !== NONE16) {
        const yaw = c.yaw[i] / 1e4, pitch = c.pitch[i] === NONE16 ? 0 : c.pitch[i] / 1e4;
        p = atRest(p, pl.part, yaw, pitch, turret, gun);
        if (dir) dir = dirAtRest(dir, pl.part, yaw, pitch);
      }
      const tri = nearestTriangle(p, pl.tris);
      if (tri.k < 0) continue;
      const nrm = triNormal(pl.tris, tri.k);
      out.point.set(p, j * 3);
      // The normal turned to face where the shell came from, so a mark sits on the side it struck.
      const facing = dir ? -(dir[0] * nrm[0] + dir[1] * nrm[1] + dir[2] * nrm[2]) >= 0 : true;
      out.normal.set(facing ? nrm : [-nrm[0], -nrm[1], -nrm[2]], j * 3);
      if (dir) {
        const a = impactAngle(dir, nrm);
        out.angle[j] = a;
        out.angleSrc[j] = c.flags2[i] & FLAG2_DIR_DERIVED ? SRC_DERIVED : SRC_RECORDED;
        if (pl.mm !== null && pl.mm > 0) out.effMm[j] = effectiveThickness(pl.mm, a);
      }
    }
    this.plateHits.set(key, out);
    return out;
  }
}
