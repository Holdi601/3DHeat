/**
 * Box replay with figures: each live box becomes the figure of what it is -
 * a soldier on foot, the tank someone is driving, the aircraft a Tacview track
 * is - at its place, heading and (for aircraft) pitch and roll, in its box's
 * colour. What the data does not say anything about stays a box, or, when the
 * data is of people, becomes a soldier.
 *
 * What each person is comes from the dataset's own columns: name-like columns
 * (Name, Vehicle, Unit, Model...) are matched against the catalogue, type-like
 * ones (Type, Class, Icon...) against the class rules. The answer is cached
 * per label, so a frame costs the placing only.
 *
 * A swing-wing aircraft is drawn at the sweep its speed calls for: spread when
 * slow, swept when fast, between them its usual sweep. The speed is the
 * data's own (a Mach, TAS, IAS or speed column), else the distance between
 * its samples over the time between them.
 */

import { VertexBuffer } from '../race/geometry';
import type { AttributeColumn, Dataset } from '../state/types';
import { CUBE_STRIDE } from '../data/tracks';
import { CATALOG } from './catalog';
import { place, TemplateCache, type Template } from './kit';
import { figureFor } from './match';
import { SWING_MACH } from './specs/swing';

const NAME_COLUMN = /^(name|vehicle|vehicle.?name|unit|unit.?type|model|aircraft|plane|tank|ship|craft|loadout|kit|figure)$/i;
const TYPE_COLUMN = /^(type|class|kind|category|icon|role|domain|vehicle.?type|vehicle.?class)$/i;
const MACH_COLUMN = /^mach(.?number)?$/i;
const TAS_COLUMN = /^(tas|true.?air.?speed)$/i;
const IAS_COLUMN = /^(ias|cas|indicated.?air.?speed|calibrated.?air.?speed)$/i;
const SPEED_COLUMN = /^(speed|air.?speed|ground.?speed|velocity|spd)\b/i;
const ALTITUDE_COLUMN = /^(altitude|alt|height.?asl)$/i;

/** A swing wing's three states: spread (slow), its usual sweep, swept (fast). */
export type Sweep = 'spread' | 'mid' | 'swept';

/**
 * The sweep for a Mach: spread below `at[0]`, swept above `at[1]`, else the
 * middle. Once in a state it stays until the Mach is 0.03 past the threshold,
 * so a track flying at one doesn't flicker. Null when the Mach is unknown.
 */
export function sweepFor(mach: number, at: [number, number], prev: Sweep | null): Sweep | null {
  if (!Number.isFinite(mach)) return null;
  const band = 0.03;
  const lo = at[0] + (prev === 'spread' ? band : prev === 'mid' ? -band : 0);
  const hi = at[1] + (prev === 'swept' ? -band : prev === 'mid' ? band : 0);
  return mach < lo ? 'spread' : mach > hi ? 'swept' : 'mid';
}

/** The standard atmosphere at a height (metres): the speed of sound, m/s, and the density over sea level's. */
export function atmosphere(h: number): { sound: number; density: number } {
  const z = Number.isFinite(h) ? Math.max(-500, h) : 0;
  const t = z < 11000 ? 288.15 - 0.0065 * z : 216.65;
  const density = z < 11000 ? Math.pow(t / 288.15, 4.2559) : 0.2971 * Math.exp(-(z - 11000) / 6341.6);
  return { sound: 20.0468 * Math.sqrt(t), density };
}

/** A speed column's unit to metres a second, by its name ("Speed (km/h)", "speed_kts"). */
function speedUnit(name: string): number {
  if (/km.?h|kph/i.test(name)) return 1 / 3.6;
  if (/kn|kts?\b|knot/i.test(name)) return 0.514444;
  if (/mph/i.test(name)) return 0.44704;
  return 1;
}

export interface FigureReplayOptions {
  /** 1 is true size. */
  scale: number;
  /** What an unknown thing becomes: a soldier (data of people), or a box. */
  unknown: 'soldier' | 'box';
}

export class FigureReplay {
  private dataset: Dataset | null = null;
  private names: AttributeColumn[] = [];
  private types: AttributeColumn[] = [];
  private roll: AttributeColumn | null = null;
  /** The data's speed: a Mach, or metres a second (`airspeed` true, `indicated` to be corrected for height). */
  private mach: AttributeColumn | null = null;
  private airspeed: { col: AttributeColumn; unit: number; indicated: boolean } | null = null;
  private altitude: AttributeColumn | null = null;
  /** Per person, the swing-wing state drawn last, the row it was worked out at, and the Mach then. */
  private readonly sweeps = new Map<number, { row: number; mach: number; state: Sweep | null }>();
  private readonly kinds = new Map<string, string | null>();
  /** Per person, where they were drawn last and which way they went: the heading when the data has none. */
  private readonly lastSeen = new Map<number, { x: number; z: number; yaw: number }>();
  private readonly templates = new TemplateCache();
  readonly tris = new VertexBuffer();
  /** The boxes that stay boxes, in the cube layout. */
  rest = new Float32Array(0);
  restCount = 0;

  private attach(d: Dataset): void {
    this.dataset = d;
    this.kinds.clear();
    this.lastSeen.clear();
    this.sweeps.clear();
    const cats = d.attrs.filter((a) => a.kind === 'category' && a.categories);
    this.names = cats.filter((a) => NAME_COLUMN.test(a.name.trim()));
    this.types = cats.filter((a) => TYPE_COLUMN.test(a.name.trim()));
    this.roll = d.attrs.find((a) => a.kind !== 'category' && /^roll$/i.test(a.name.trim())) ?? null;
    const num = (re: RegExp) => d.attrs.find((a) => a.kind !== 'category' && re.test(a.name.trim())) ?? null;
    this.mach = num(MACH_COLUMN);
    const tas = num(TAS_COLUMN);
    const ias = num(IAS_COLUMN);
    const speed = num(SPEED_COLUMN);
    this.airspeed = tas ? { col: tas, unit: 1, indicated: false } : ias ? { col: ias, unit: 1, indicated: true } : speed ? { col: speed, unit: speedUnit(speed.name), indicated: false } : null;
    this.altitude = num(ALTITUDE_COLUMN);
  }

  /** The Mach a row's data gives, NaN when it has none. */
  private machAt(row: number): number {
    const v = (c: AttributeColumn | null) => (c ? (c.data as Float32Array)[row] : NaN);
    const m = v(this.mach);
    if (Number.isFinite(m)) return m;
    const air = atmosphere(v(this.altitude));
    if (this.airspeed) {
      const s = v(this.airspeed.col) * this.airspeed.unit;
      if (Number.isFinite(s)) return (this.airspeed.indicated ? s / Math.sqrt(air.density) : s) / air.sound;
    }
    return NaN;
  }

  /**
   * A figure's name at the sweep its speed calls for: `<kind>@spread` or
   * `<kind>@swept` for a swing-wing aircraft, else the kind itself. The speed
   * is the row's own, else the distance from the person's row before over the
   * time between; without either the figure keeps its usual sweep.
   */
  sweptKind(d: Dataset, row: number, kind: string): string {
    const at = SWING_MACH.get(kind);
    if (!at || row < 0) return kind;
    if (d !== this.dataset) this.attach(d);
    const person = d.personId ? d.personId[row] : -1 - row;
    const last = this.sweeps.get(person);
    if (last && last.row === row) return named(kind, last.state);
    let mach = this.machAt(row);
    if (!Number.isFinite(mach) && last && d.time && d.personId && (!d.sessionId || d.sessionId[row] === d.sessionId[last.row])) {
      const dt = Math.abs(d.time[row] - d.time[last.row]);
      if (dt > 0 && dt <= 30) {
        const units = d.entitySize ? d.entitySize / 0.8 : 1;
        const dist = Math.hypot(d.px[row] - d.px[last.row], d.py[row] - d.py[last.row], d.pz[row] - d.pz[last.row]) / units;
        mach = dist / dt / atmosphere(this.altitude ? (this.altitude.data as Float32Array)[row] : NaN).sound;
      } else mach = last.mach;
    } else if (!Number.isFinite(mach) && last) mach = last.mach;
    const state = sweepFor(mach, at, last?.state ?? null) ?? last?.state ?? null;
    this.sweeps.set(person, { row, mach, state });
    return named(kind, state);
  }

  /** Whether the data has columns that say what things are; without them everything is a person. */
  knowsTypes(d: Dataset): boolean {
    if (d !== this.dataset) this.attach(d);
    return this.names.length > 0 || this.types.length > 0;
  }

  /** The figure for a row, by its name and type labels; null for none. */
  kindOf(d: Dataset, row: number): string | null {
    if (d !== this.dataset) this.attach(d);
    if (!this.names.length && !this.types.length) return null;
    const names = this.names.map((a) => a.categories![(a.data as Uint32Array)[row]] ?? '');
    const types = this.types.map((a) => a.categories![(a.data as Uint32Array)[row]] ?? '');
    const key = `${names.join('\u0001')}\u0002${types.join('\u0001')}`;
    let k = this.kinds.get(key);
    if (k === undefined) {
      k = figureFor(names, types);
      this.kinds.set(key, k);
    }
    return k;
  }

  private template(kind: string): Template | null {
    const e = CATALOG[kind];
    return e ? this.templates.get(kind, e.build) : null;
  }

  /**
   * Figures for the live cubes (x, y, z, r, g, b, yaw, pitch each, `rows` the
   * row each stands for); what has no figure is left in `rest`.
   */
  build(d: Dataset, cubes: Float32Array, count: number, rows: Int32Array, o: FigureReplayOptions): void {
    this.tris.reset();
    if (this.rest.length < cubes.length) this.rest = new Float32Array(cubes.length);
    this.restCount = 0;
    for (let i = 0; i < count; i++) {
      const c = i * CUBE_STRIDE;
      const row = rows[i];
      let kind = row >= 0 ? this.kindOf(d, row) : null;
      if (!kind && o.unknown === 'soldier') kind = 'soldier';
      if (kind) kind = this.sweptKind(d, row, kind);
      const t = kind ? this.template(kind) : null;
      if (!t) {
        this.rest.set(cubes.subarray(c, c + CUBE_STRIDE), this.restCount * CUBE_STRIDE);
        this.restCount++;
        continue;
      }
      let yaw = cubes[c + 6];
      if (!d.yaw && row >= 0 && d.personId) {
        // No heading in the data: the way the figure last moved.
        const p = d.personId[row];
        const seen = this.lastSeen.get(p);
        const x = cubes[c];
        const z = cubes[c + 2];
        if (!seen) this.lastSeen.set(p, { x, z, yaw: 0 });
        else {
          const dx = x - seen.x;
          const dz = z - seen.z;
          if (dx * dx + dz * dz > 1e-4) {
            seen.yaw = Math.atan2(dx, -dz);
            seen.x = x;
            seen.z = z;
          }
          yaw = seen.yaw;
        }
      }
      // Ground figures keep level; aircraft and missiles take the pitch, and the roll where the data has one.
      const air = t.anchor === 'centre';
      const roll = air && this.roll && row >= 0 ? ((this.roll.data as Float32Array)[row] * Math.PI) / 180 : 0;
      place(
        this.tris,
        t,
        {
          x: cubes[c],
          y: cubes[c + 1],
          z: cubes[c + 2],
          yaw: Math.PI - yaw,
          pitch: air ? cubes[c + 7] : 0,
          roll: Number.isFinite(roll) ? roll : 0,
          scale: o.scale,
        },
        [cubes[c + 3], cubes[c + 4], cubes[c + 5]],
      );
    }
  }
}

/** A swing-wing figure's name in a state. */
function named(kind: string, state: Sweep | null): string {
  return state === 'spread' || state === 'swept' ? `${kind}@${state}` : kind;
}
