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
import { placeFrame, poseFrame, TemplateCache, type Template } from './kit';
import { hasJoints, InstanceBatches, meshOf, NO_PITCH } from './instances';
import { aimOf, type AimNow } from './aim';
import { cameraTracks } from '../render/lookAids';
import type { Frame3, Vec3 } from '../race/geometry';
import { frameOfQuat, MotionModel } from './motion';
import { figureFor } from './match';
import { SWING_MACH } from './specs/swing';
import { classify, Domain, isEffectDomain, packWord, WORD_BASE, WORD_DEAD, WORD_MOVING } from './symbolClass';
import { deadAt, deathsOf } from '../data/deaths';
import { wreckColour } from './wreck';
import { chaffMetres, decoyAlpha, farLook, glyphPx } from '../render/symbols/lod';
import { dartMesh } from '../render/symbols/darts';

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
  /** Data units a figure's metre takes: 1 is true size in data of metres. */
  scale: number;
  /** What an unknown thing becomes: a soldier (data of people), or a box. */
  unknown: 'soldier' | 'box';
  /**
   * The smallest a figure is drawn, in pixels along its longest side, as
   * Tacview draws them: true size up close, and further off grown just enough
   * to stay this big on screen. 0 or absent: always `scale`.
   */
  minPixels?: number;
  /** Data units a pixel covers at a point (the camera's distance to it over the focal length in pixels). */
  pixelSize?: (x: number, y: number, z: number) => number;
  /** Each box's attitude, x y z w (from `MotionRefiner`), and 1 in `posed` where it has one. */
  poses?: Float32Array;
  posed?: Uint8Array;
  /** The playhead, seconds: where turrets and guns point now (`aim.ts`). Absent: as built. */
  time?: number;
  /** Far off (`render/symbols/lod.ts`): 0 figure, 1 arrow, 2 symbol; absent: figures only. */
  farMode?: number;
  /** Below this many pixels long at true size a unit is a symbol. */
  symbolThreshold?: number;
  symbolPx?: number;
  /** Each cube's position in double precision, x y z a cube (`MotionRefiner.exact`); the cube's own otherwise. */
  exact?: Float64Array;
  /**
   * Write the figures' positions relative to this point, for a view relative
   * to it (`FrameParams.viewProjRel`): worked out in double precision and only
   * then rounded, they keep their centimetres however far out the scene is.
   * Glyphs, darts' hit boxes and picking stay absolute.
   */
  origin?: ArrayLike<number>;
}

/** `fr` moved by minus `o`, for the instance buffers. */
function relativeFrame(fr: Frame3, o: ArrayLike<number> | undefined): Frame3 {
  return o ? { ...fr, o: [fr.o[0] - o[0], fr.o[1] - o[1], fr.o[2] - o[2]] } : fr;
}

/** The darts, one shape a domain (`render/symbols/darts.ts`). */
const DARTS = dartMesh();
/** A unit's model is a dart below this many pixels long at true size ("At a distance: arrow"). */
const CPU_DART_PX = 3;

const aimNow: AimNow = { yaw: NaN, pitch: NaN };

/** The longest side of a template, metres. */
function longest(t: Template): number {
  return Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1);
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
  /** Per person, how many times true size it was drawn last frame. */
  readonly drawnScale = new Map<number, number>();
  /** Every figure the last build drew: which box and row it stands for, its figure, where and how big. */
  readonly placed: { box: number; row: number; kind: string; fr: Frame3; scale: number; min: Vec3; max: Vec3 }[] = [];
  /** Per box of the last build, its figure ('' for none) - which are weapons, for their smoke. */
  kindsDrawn: string[] = [];
  /**
   * What is drawn as triangles placed on the CPU: the effects and weapons
   * the other layers add. The figures themselves are `batches`, GPU instances.
   */
  readonly tris = new VertexBuffer();
  /** The figures, as instances of meshes uploaded once (`instances.ts`). */
  readonly batches = new InstanceBatches();
  /** Place the figures' triangles on the CPU into `tris` instead, as before instancing: for comparing the two. */
  cpuPlace = false;
  /** The boxes that stay boxes, in the cube layout. */
  rest = new Float32Array(0);
  restCount = 0;
  /** The far-off glyphs of the last build: figure instances (`render/symbols/shaders.ts`). */
  readonly glyphs = { data: new Float32Array(64 * 16), count: 0 };
  /** Per person: its symbol word without the moving bit (`symbolClass.ts`). */
  private readonly words = new Map<number, number>();
  /** Per person: when its first row is, for a decoy's age, and its last. */
  private readonly lives = new Map<number, [number, number]>();

  /** The symbol word for a row (cached per person). */
  wordOf(d: Dataset, row: number, kind: string | null): number {
    if (d !== this.dataset) this.attach(d);
    const p = d.personId ? d.personId[row] : -1 - row;
    let w = this.words.get(p);
    if (w === undefined) {
      const team = d.personTeam && d.personId ? d.personTeam[d.personId[row]] : null;
      w = packWord(classify(kind, this.typeText(d, row)), team);
      this.words.set(p, w);
    }
    return w;
  }

  /** When a person's first and last rows are: every person's, worked out in one pass the first time one is asked for. */
  private lifeOf(d: Dataset, p: number): [number, number] {
    if (!this.lives.size && d.time && d.personId) {
      for (let r = 0; r < d.count; r++) {
        const q = d.personId[r];
        const l = this.lives.get(q);
        if (!l) this.lives.set(q, [d.time[r], d.time[r]]);
        else {
          if (d.time[r] < l[0]) l[0] = d.time[r];
          if (d.time[r] > l[1]) l[1] = d.time[r];
        }
      }
    }
    return this.lives.get(p) ?? [0, 0];
  }

  private glyph(x: number, y: number, z: number, px: number, f: ArrayLike<number>, alpha: number, u: ArrayLike<number>, team: ArrayLike<number>, word: number): void {
    const g = this.glyphs;
    if ((g.count + 1) * 16 > g.data.length) {
      const next = new Float32Array(g.data.length * 2);
      next.set(g.data);
      g.data = next;
    }
    g.data.set([x, y, z, px, f[0], f[1], f[2], alpha, u[0], u[1], u[2], 0, team[0], team[1], team[2], -WORD_BASE - word], g.count * 16);
    g.count++;
  }

  private attach(d: Dataset): void {
    this.dataset = d;
    this.kinds.clear();
    this.words?.clear();
    this.lives?.clear();
    this.specials.clear();
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

  /** The row's type labels joined (what `classOfType` reads); its names where the data has no types. */
  typeText(d: Dataset, row: number): string {
    if (d !== this.dataset) this.attach(d);
    const cols = this.types.length ? this.types : this.names;
    return cols.map((a) => a.categories![(a.data as Uint32Array)[row]] ?? '').join('+');
  }

  private readonly specials = new Map<string, string>();

  /** '~projectile' for a bullet or shell, '~explosion' for an explosion (by the type columns), else ''. */
  specialOf(d: Dataset, row: number): string {
    if (d !== this.dataset) this.attach(d);
    if (!this.types.length) return '';
    const key = this.types.map((a) => a.categories![(a.data as Uint32Array)[row]] ?? '').join('');
    let k = this.specials.get(key);
    if (k === undefined) {
      k = /projectile|bullet|\bshell\b|tracer/i.test(key) ? '~projectile' : /explosion/i.test(key) ? '~explosion' : '';
      this.specials.set(key, k);
    }
    return k;
  }

  templateOf(kind: string): Template | null {
    return this.template(kind);
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
    this.batches.reset();
    this.drawnScale.clear();
    this.placed.length = 0;
    this.kindsDrawn.length = count;
    if (this.rest.length < cubes.length) this.rest = new Float32Array(cubes.length);
    this.restCount = 0;
    this.glyphs.count = 0;
    if (d !== this.dataset) this.attach(d);
    const aim = o.time !== undefined ? aimOf(d) : null;
    const far = o.farMode ?? -1;
    // A recorded camera is drawn as a camera with the display aids, not as a figure.
    const cams = cameraTracks(d);
    // Wrecks: drawn charred from the death the data says until the unit is gone (`data/deaths.ts`).
    const deaths = o.time !== undefined && d.personId ? deathsOf(d) : null;
    for (let i = 0; i < count; i++) {
      const c = i * CUBE_STRIDE;
      const row = rows[i];
      if (cams.any && row >= 0 && d.personId && cams.persons[d.personId[row]]) {
        this.kindsDrawn[i] = '';
        continue;
      }
      let kind = row >= 0 ? this.kindOf(d, row) : null;
      // Bullets, shells and explosions are drawn by the weapons layer, as streaks and fireballs.
      const special = !kind && row >= 0 ? this.specialOf(d, row) : '';
      if (special) {
        this.kindsDrawn[i] = special;
        continue;
      }
      const word = far >= 0 && row >= 0 ? this.wordOf(d, row, kind) : 0;
      const dom = (word >>> 16) & 15;
      if (far >= 0 && isEffectDomain(dom) && dom !== Domain.Shell) {
        this.kindsDrawn[i] = '';
        if (o.pixelSize && d.personId) {
          const p = d.personId[row];
          const [t0, t1] = this.lifeOf(d, p);
          const age = (o.time ?? t0) - t0;
          const ps = o.pixelSize(cubes[c], cubes[c + 1], cubes[c + 2]);
          const px = dom === Domain.Chaff ? Math.min(96, Math.max(3, (chaffMetres(age) * o.scale) / ps)) : glyphPx(dom, o.symbolPx ?? 28, far);
          const yaw = cubes[c + 6];
          this.glyph(cubes[c], cubes[c + 1], cubes[c + 2], px, [Math.sin(yaw), 0, -Math.cos(yaw)], decoyAlpha(dom, age, t1 - t0, p, o.time ?? 0), [0, 1, 0], [cubes[c + 3], cubes[c + 4], cubes[c + 5]], word);
        }
        continue;
      }
      if (!kind && o.unknown === 'soldier') kind = 'soldier';
      if (kind) kind = this.sweptKind(d, row, kind);
      const dead = !!deaths && deaths.any && row >= 0 && deadAt(deaths, d.personId![row], o.time!);
      // A wreck's colour, and the dead bit that crosses out its symbol; an instance carries the colour negated.
      const wreck = dead ? wreckColour([cubes[c + 3], cubes[c + 4], cubes[c + 5]]) : null;
      const shown: [number, number, number] = wreck ? wreck : [cubes[c + 3], cubes[c + 4], cubes[c + 5]];
      const deadBit = dead ? WORD_DEAD : 0;
      const t = kind ? this.template(kind) : null;
      this.kindsDrawn[i] = t ? kind! : '';
      if (!t && far === 2 && o.pixelSize && dom !== Domain.Marker) {
        const yaw = cubes[c + 6];
        this.glyph(cubes[c], cubes[c + 1], cubes[c + 2], glyphPx(dom, o.symbolPx ?? 28, far), [Math.sin(yaw), 0, -Math.cos(yaw)], 1, [0, 1, 0], shown, (word | deadBit) >>> 0);
        continue;
      }
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
      // How it is drawn by its size on screen (`render/symbols/lod.ts`).
      const ps = o.pixelSize ? o.pixelSize(cubes[c], cubes[c + 1], cubes[c + 2]) : 0;
      const trueLen = ps > 0 ? (longest(t) * o.scale) / ps : Infinity;
      const look = far >= 0 ? farLook(far, dom, trueLen, true, o.symbolThreshold ?? 36, far === 1 ? CPU_DART_PX : 0) : null;
      // True size, or as big as it takes to stay `minPixels` long on screen; weapons always true size.
      let scale = o.scale;
      if (o.minPixels && o.minPixels > 0 && o.pixelSize && !(look && look.trueSize)) {
        const need = (o.minPixels * o.pixelSize(cubes[c], cubes[c + 1], cubes[c + 2])) / longest(t);
        if (need > scale) scale = need;
      }
      if (row >= 0 && d.personId) this.drawnScale.set(d.personId[row], scale / Math.max(1e-9, o.scale));
      const team: [number, number, number] = wreck ? [-wreck[0], -wreck[1], -wreck[2]] : shown;
      // Ground figures keep level; aircraft and missiles take the pitch, and the roll where the data has one.
      const air = t.anchor === 'centre';
      let fr: Frame3;
      const ex = o.exact && o.exact.length >= (i + 1) * 3 ? o.exact : null;
      const px = ex ? ex[i * 3] : cubes[c];
      const py = ex ? ex[i * 3 + 1] : cubes[c + 1];
      const pz = ex ? ex[i * 3 + 2] : cubes[c + 2];
      if (air && o.poses && o.posed && o.posed[i]) {
        fr = frameOfQuat(o.poses.subarray(i * 4, i * 4 + 4), [px, py, pz]);
      } else {
        const roll = air && this.roll && row >= 0 ? ((this.roll.data as Float32Array)[row] * Math.PI) / 180 : 0;
        const sign = air && row >= 0 ? (MotionModel.of(d)?.rollSign ?? 1) : 1;
        fr = poseFrame({
          x: px,
          y: py,
          z: pz,
          yaw: Math.PI - yaw,
          pitch: air ? cubes[c + 7] : 0,
          roll: Number.isFinite(roll) ? sign * roll : 0,
        });
      }
      // Under about 120 px long on screen, the figure's coarse build where it has one: the same shape, fewer triangles.
      const small = o.pixelSize ? (longest(t) * scale) / Math.max(1e-9, o.pixelSize(cubes[c], cubes[c + 1], cubes[c + 2])) < 120 : false;
      const drawn = small ? (t.coarse?.() ?? t) : t;
      if (look && (look.glyph > 0 || look.dart)) {
        const moving = dom !== Domain.Person && dom !== Domain.Static && dom !== Domain.Unknown;
        const w = (word | (moving && !dead ? WORD_MOVING : 0) | deadBit) >>> 0;
        if (look.dart) this.batches.add(DARTS, relativeFrame(fr, o.origin), Math.max(o.scale, ((o.minPixels ?? 0) * ps) || o.scale), team, 1, 0, -WORD_BASE - w);
        if (look.glyph > 0) this.glyph(fr.o[0], fr.o[1], fr.o[2], glyphPx(dom, o.symbolPx ?? 28, far), fr.f, look.glyph, fr.u, shown, w);
        if (look.figure <= 0) {
          this.placed.push({ box: i, row, kind: kind!, fr, scale, min: t.min, max: t.max });
          continue;
        }
      }
      const alpha = look ? look.figure : 1;
      if (this.cpuPlace) placeFrame(this.tris, drawn, fr, scale, shown);
      else if (aim && o.time !== undefined && hasJoints(drawn)) {
        // Its turret turned and its gun raised as the data has them now.
        aim.at(row, o.time, aimNow);
        this.batches.add(meshOf(drawn), relativeFrame(fr, o.origin), scale, team, alpha, Number.isFinite(aimNow.yaw) ? aimNow.yaw : 0, Number.isFinite(aimNow.pitch) ? aimNow.pitch : NO_PITCH);
      } else this.batches.add(meshOf(drawn), relativeFrame(fr, o.origin), scale, team, alpha);
      this.placed.push({ box: i, row, kind: kind!, fr, scale, min: t.min, max: t.max });
    }
  }

  /**
   * The figure a ray goes through first, as the index of its box in the last
   * build (-1 for none): the figure's own box, turned and sized as drawn, so a
   * click on a wing picks the aircraft whose wing it is.
   */
  hit(origin: Vec3, dir: Vec3): number {
    let best = -1;
    let bestT = Infinity;
    for (const p of this.placed) {
      const t = entry(p, origin, dir);
      if (t < bestT) {
        bestT = t;
        best = p.box;
      }
    }
    return best;
  }

  /** How far along a ray it enters the figure drawn for box `box` (Infinity: it misses). */
  entry(box: number, origin: Vec3, dir: Vec3): number {
    const p = this.placed.find((q) => q.box === box);
    return p ? entry(p, origin, dir) : Infinity;
  }
}

/** Where a ray enters a placed figure's box, as a distance along it; Infinity when it misses. */
function entry(p: { fr: Frame3; scale: number; min: Vec3; max: Vec3 }, origin: Vec3, dir: Vec3): number {
  const { o, f, u, r } = p.fr;
  // The ray in the figure's frame (x forward, y up, z right), in template metres.
  const dx = origin[0] - o[0];
  const dy = origin[1] - o[1];
  const dz = origin[2] - o[2];
  const lo = [(dx * f[0] + dy * f[1] + dz * f[2]) / p.scale, (dx * u[0] + dy * u[1] + dz * u[2]) / p.scale, (dx * r[0] + dy * r[1] + dz * r[2]) / p.scale];
  const ld = [(dir[0] * f[0] + dir[1] * f[1] + dir[2] * f[2]) / p.scale, (dir[0] * u[0] + dir[1] * u[1] + dir[2] * u[2]) / p.scale, (dir[0] * r[0] + dir[1] * r[1] + dir[2] * r[2]) / p.scale];
  let t0 = 0;
  let t1 = Infinity;
  for (let k = 0; k < 3; k++) {
    if (Math.abs(ld[k]) < 1e-12) {
      if (lo[k] < p.min[k] || lo[k] > p.max[k]) return Infinity;
      continue;
    }
    let a = (p.min[k] - lo[k]) / ld[k];
    let b = (p.max[k] - lo[k]) / ld[k];
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
    if (t0 > t1) return Infinity;
  }
  // In template metres along a unit-length ray scaled by 1/scale: back to world distance.
  return t0 * p.scale;
}
/** A swing-wing figure's name in a state. */
function named(kind: string, state: Sweep | null): string {
  return state === 'spread' || state === 'swept' ? `${kind}@${state}` : kind;
}
