/**
 * Tacview's tactical display aids in the replay's 3D view, as lines drawn
 * with the trails: each unit's velocity vector (where its speed and course
 * take it in so many seconds), its path ahead (where it really goes), its
 * nose and lift lines, radar scan cones, lines to locked and focused targets,
 * and the domes of engagement ranges - from the recording's ACMI properties
 * where it has them (RadarMode, RadarAzimuth, RadarElevation, RadarRoll,
 * RadarRange, Radar...Beamwidth, LockedTarget..9, FocusedTarget,
 * LockedTargetMode/Azimuth/Elevation/Range, EngagementMode, EngagementRange,
 * VerticalEngagementRange and their "2" twins).
 *
 * Which units get which aid is the viewer's choice (`DisplayAids`): none,
 * the ones in question, all, or one kind of object.
 *
 * Radar and lock angles are against the unit's own axes, as the ACMI spec
 * says: azimuth to the right, elevation up, roll right wing down.
 * Ranges are metres, angles degrees.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import { MotionModel, emptySample, rotate } from '../figures/motion';
import { useReplayStore, type DisplayAids, type Scope } from '../state/replayStore';
import { unitsOf } from '../ui/replay/units';
import { unitCategory } from '../ui/replay/objectType';
import { unitsPerMetre } from '../ui/replay/replayData';
import { unitShape } from '../ui/replay/objectType';
import { useStore } from '../state/store';
import { aimOf, type AimNow } from '../figures/aim';
import { cameraGlyph, cameraTracks, fovAt, viewCone, type LookFrame } from './lookAids';

export type Vec3 = [number, number, number];

/** A live track as the engine has it. */
export interface TacticalTrack {
  person: number;
  row: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch?: number;
  /** Attitude, x y z w, turning the figure frame (x forward, y up, z right) into the world; null without one. */
  q?: ArrayLike<number> | null;
}

const RAD = Math.PI / 180;
const STRIDE = 7;

/** How far ahead a cockpit view clips (metres at true size): past the unit's own nose, short of anything else. */
const CLIP: Record<string, number> = { air: 30, ground: 8, sea: 150, weapon: 4 };

/** The cockpit view's near plane for a person (data units at true size): its own figure is clipped away. */
export function cockpitClip(d: Dataset | null, person: number): number {
  if (!d) return 0;
  // A recorded camera has no figure of its own to clip away.
  if (cameraTracks(d).persons[person]) return 0.05 * unitsPerMetre(d);
  const index = unitsOf(d);
  const u = index.units[index.personUnit[person]];
  return (u ? CLIP[unitCategory(d, u)] : CLIP.ground) * unitsPerMetre(d);
}

/** The unit's forward, up and right in the world: from its attitude, else its heading and pitch. */
export function axesOfTrack(t: TacticalTrack): { fwd: Vec3; up: Vec3; right: Vec3 } {
  if (t.q)
    return {
      fwd: rotate(t.q, [1, 0, 0]),
      up: rotate(t.q, [0, 1, 0]),
      right: rotate(t.q, [0, 0, 1]),
    };
  const p = t.pitch ?? 0;
  const sy = Math.sin(t.yaw);
  const cy = Math.cos(t.yaw);
  const fwd: Vec3 = [sy * Math.cos(p), Math.sin(p), -cy * Math.cos(p)];
  const right: Vec3 = [cy, 0, sy];
  const up: Vec3 = [
    right[1] * fwd[2] - right[2] * fwd[1],
    right[2] * fwd[0] - right[0] * fwd[2],
    right[0] * fwd[1] - right[1] * fwd[0],
  ];
  return { fwd, up, right };
}

/** A direction in the unit's frame - azimuth right, elevation up, degrees - in the world. */
export function bodyDirection(
  axes: { fwd: Vec3; up: Vec3; right: Vec3 },
  az: number,
  el: number,
): Vec3 {
  const ca = Math.cos(az * RAD);
  const sa = Math.sin(az * RAD);
  const ce = Math.cos(el * RAD);
  const se = Math.sin(el * RAD);
  const { fwd, up, right } = axes;
  return [
    fwd[0] * ce * ca + right[0] * ce * sa + up[0] * se,
    fwd[1] * ce * ca + right[1] * ce * sa + up[1] * se,
    fwd[2] * ce * ca + right[2] * ce * sa + up[2] * se,
  ];
}

/**
 * The rim of a radar beam: `n` points at `range` around the beam's axis
 * (azimuth, elevation, roll against the unit), as wide and as tall as the
 * beamwidths (full angles, degrees). Unit-free: `range` in the caller's units.
 */
export function beamRim(
  axes: { fwd: Vec3; up: Vec3; right: Vec3 },
  az: number,
  el: number,
  roll: number,
  hBeam: number,
  vBeam: number,
  range: number,
  n: number,
): Vec3[] {
  const a = bodyDirection(axes, az, el);
  // The beam's own right (level in the unit's frame) and up, then rolled about its axis.
  let r = bodyDirection(axes, az + 90, 0);
  // Square to the axis: at an elevation the level right is not quite.
  const d = r[0] * a[0] + r[1] * a[1] + r[2] * a[2];
  r = norm([r[0] - a[0] * d, r[1] - a[1] * d, r[2] - a[2] * d]);
  let u = cross(r, a);
  if (roll) {
    const c = Math.cos(roll * RAD);
    const s = Math.sin(roll * RAD);
    const r2: Vec3 = [r[0] * c - u[0] * s, r[1] * c - u[1] * s, r[2] * c - u[2] * s];
    const u2: Vec3 = [u[0] * c + r[0] * s, u[1] * c + r[1] * s, u[2] * c + r[2] * s];
    r = r2;
    u = u2;
  }
  const th = Math.tan(Math.min(89, hBeam / 2) * RAD);
  const tv = Math.tan(Math.min(89, vBeam / 2) * RAD);
  const out: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const w = (i / n) * 2 * Math.PI;
    const p = norm([
      a[0] + r[0] * th * Math.cos(w) + u[0] * tv * Math.sin(w),
      a[1] + r[1] * th * Math.cos(w) + u[1] * tv * Math.sin(w),
      a[2] + r[2] * th * Math.cos(w) + u[2] * tv * Math.sin(w),
    ]);
    out.push([p[0] * range, p[1] * range, p[2] * range]);
  }
  return out;
}

/**
 * A dome over a point: `rings` circles of latitude and `meridians` half
 * circles, `h` across and `v` high (an ovoid where they differ), each line a
 * pair of points, relative to the centre.
 */
export function domeLines(
  h: number,
  v: number,
  rings: number,
  meridians: number,
  seg: number,
): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = [];
  for (let k = 0; k < rings; k++) {
    const lat = (k / rings) * (Math.PI / 2);
    const rr = h * Math.cos(lat);
    const y = v * Math.sin(lat);
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * 2 * Math.PI;
      const a1 = ((i + 1) / seg) * 2 * Math.PI;
      out.push([
        [Math.cos(a0) * rr, y, Math.sin(a0) * rr],
        [Math.cos(a1) * rr, y, Math.sin(a1) * rr],
      ]);
    }
  }
  const half = seg >> 1;
  for (let m = 0; m < meridians; m++) {
    const lon = (m / meridians) * Math.PI;
    for (let i = 0; i < half; i++) {
      const l0 = (i / half) * Math.PI;
      const l1 = ((i + 1) / half) * Math.PI;
      const pt = (l: number): Vec3 => [
        Math.cos(l) * h * Math.cos(lon),
        Math.sin(l) * v,
        Math.cos(l) * h * Math.sin(lon),
      ];
      out.push([pt(l0), pt(l1)]);
    }
  }
  return out;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function norm(a: Vec3): Vec3 {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}

/** The ACMI properties the aids read, found once per dataset. */
interface Columns {
  radarMode: Float32Array | null;
  radarAz: Float32Array | null;
  radarEl: Float32Array | null;
  radarRoll: Float32Array | null;
  radarRange: Float32Array | null;
  radarH: Float32Array | null;
  radarV: Float32Array | null;
  gateAz: Float32Array | null;
  gateEl: Float32Array | null;
  gateMin: Float32Array | null;
  gateMax: Float32Array | null;
  gateH: Float32Array | null;
  gateV: Float32Array | null;
  lockMode: Float32Array | null;
  lockAz: Float32Array | null;
  lockEl: Float32Array | null;
  lockRange: Float32Array | null;
  /** LockedTarget, LockedTarget2..9: hex object ids. */
  locked: AttributeColumn[];
  focused: AttributeColumn | null;
  /** Parent (a weapon's launcher) and Next (the following waypoint): hex object ids. */
  parent: AttributeColumn | null;
  next: AttributeColumn | null;
  engage: { mode: Float32Array | null; range: Float32Array; vertical: Float32Array | null }[];
  /** Where the pilot looks, against the unit's axes (PilotHeadYaw, PilotHeadPitch, or a head or view yaw and pitch). */
  headYaw: Float32Array | null;
  headPitch: Float32Array | null;
  /** Hex object id (as ACMI writes it) -> person. */
  byId: Map<string, number>;
  any: boolean;
}

const colCache = new WeakMap<Dataset, Columns>();

function columnsOf(d: Dataset): Columns {
  const hit = colCache.get(d);
  if (hit) return hit;
  const num = (name: string): Float32Array | null => {
    const a = d.attrs.find(
      (x) => x.kind === 'number' && x.name.trim().toLowerCase() === name.toLowerCase(),
    );
    return a ? (a.data as Float32Array) : null;
  };
  const cat = (name: string): AttributeColumn | null =>
    d.attrs.find(
      (x) => x.kind === 'category' && x.name.trim().toLowerCase() === name.toLowerCase(),
    ) ?? null;
  const locked: AttributeColumn[] = [];
  for (const n of [
    'LockedTarget',
    'LockedTarget2',
    'LockedTarget3',
    'LockedTarget4',
    'LockedTarget5',
    'LockedTarget6',
    'LockedTarget7',
    'LockedTarget8',
    'LockedTarget9',
  ]) {
    const a = cat(n);
    if (a) locked.push(a);
  }
  const engage: Columns['engage'] = [];
  for (const suffix of ['', '2']) {
    const range = num(`EngagementRange${suffix}`);
    if (range)
      engage.push({
        mode: num(`EngagementMode${suffix}`),
        range,
        vertical: num(`VerticalEngagementRange${suffix}`),
      });
  }
  const byId = new Map<string, number>();
  d.personLabels.forEach((l, p) => {
    const m = /#([0-9a-f]+)$/i.exec(l ?? '');
    if (m) byId.set(m[1].toLowerCase(), p);
  });
  const c: Columns = {
    radarMode: num('RadarMode'),
    radarAz: num('RadarAzimuth'),
    radarEl: num('RadarElevation'),
    radarRoll: num('RadarRoll'),
    radarRange: num('RadarRange'),
    radarH: num('RadarHorizontalBeamwidth'),
    radarV: num('RadarVerticalBeamwidth'),
    gateAz: num('RadarRangeGateAzimuth'),
    gateEl: num('RadarRangeGateElevation'),
    gateMin: num('RadarRangeGateMin'),
    gateMax: num('RadarRangeGateMax'),
    gateH: num('RadarRangeGateHorizontalBeamwidth'),
    gateV: num('RadarRangeGateVerticalBeamwidth'),
    lockMode: num('LockedTargetMode'),
    lockAz: num('LockedTargetAzimuth'),
    lockEl: num('LockedTargetElevation'),
    lockRange: num('LockedTargetRange'),
    locked,
    focused: cat('FocusedTarget'),
    parent: cat('Parent'),
    next: cat('Next'),
    engage,
    headYaw: num('PilotHeadYaw') ?? num('HeadYaw') ?? num('ViewYaw') ?? num('LookYaw'),
    headPitch: num('PilotHeadPitch') ?? num('HeadPitch') ?? num('ViewPitch') ?? num('LookPitch'),
    byId,
    any: false,
  };
  c.any = !!(c.radarRange || c.lockAz || locked.length || c.focused || engage.length || c.headYaw || c.parent || c.next);
  colCache.set(d, c);
  return c;
}

/** What a recording has of the aids: radar, locks, engagement ranges. */
export function tacticalColumns(d: Dataset): {
  radar: boolean;
  locks: boolean;
  links: boolean;
  engagement: boolean;
  sight: boolean;
} {
  const c = columnsOf(d);
  return {
    radar: !!c.radarRange,
    locks: !!(c.locked.length || c.focused || c.lockAz),
    links: !!(c.parent || c.next),
    engagement: c.engage.length > 0,
    sight: !!c.headYaw,
  };
}

/**
 * What a unit has locked at a row: the persons it names (LockedTarget..9)
 * and, where it names none, the lock's range along its angles (metres), as
 * the lock lines are drawn.
 */
export function locksAt(d: Dataset, row: number): { persons: number[]; range: number; az: number; el: number } | null {
  const cols = columnsOf(d);
  if (row < 0 || !(cols.locked.length || cols.lockAz)) return null;
  if (fin(cols.lockMode, row, 1) === 0) return null;
  const persons: number[] = [];
  for (const col of cols.locked) {
    const id = (col.categories?.[(col.data as Uint32Array)[row]] ?? '').trim().toLowerCase();
    const other = id ? cols.byId.get(id) : undefined;
    if (other !== undefined) persons.push(other);
  }
  const range = fin(cols.lockRange, row);
  const az = fin(cols.lockAz, row);
  if (!persons.length && !(range > 0 && Number.isFinite(az))) return null;
  return { persons, range, az, el: fin(cols.lockEl, row, 0) };
}

/** A recorded camera's horizontal field of view at a zoom of 1, degrees, where the data gives only the zoom. */
const CAMERA_FOV = 80;
const CAMERA_COLOUR = [1, 0.85, 0.3];
/** Where a vehicle's player looks (`aimLines`): dashed, near white. */
const VIEW_COLOUR = [0.92, 0.94, 0.97];

const zoomCols = new WeakMap<Dataset, Float32Array | null>();

/** A camera's magnification at a row (War Thunder's `zoom`), or NaN. */
function zoomAt(d: Dataset, row: number): number {
  let z = zoomCols.get(d);
  if (z === undefined) {
    const a = d.attrs.find((x) => x.kind === 'number' && /^zoom$/i.test(x.name.trim()));
    z = a ? (a.data as Float32Array) : null;
    zoomCols.set(d, z);
  }
  return z && row >= 0 ? z[row] : NaN;
}

const fin = (a: Float32Array | null, row: number, d = NaN) => {
  if (!a || row < 0) return d;
  const v = a[row];
  return Number.isFinite(v) ? v : d;
};

/**
 * Builds the aids' line vertices (x y z r g b a, a line a pair) after
 * `base`'s first `baseCount` vertices, into a buffer of its own.
 */
export class TacticalLayer {
  private buf = new Float32Array(0);
  private n = 0;
  private readonly sample = emptySample();

  private reserve(verts: number): void {
    const need = (this.n + verts) * STRIDE;
    if (this.buf.length >= need) return;
    const next = new Float32Array(Math.max(need, this.buf.length * 2, 4096));
    next.set(this.buf.subarray(0, this.n * STRIDE));
    this.buf = next;
  }

  private line(a: Vec3, b: Vec3, c: ArrayLike<number>, alpha: number, alphaB = alpha): void {
    this.reserve(2);
    let o = this.n * STRIDE;
    const B = this.buf;
    B[o++] = a[0];
    B[o++] = a[1];
    B[o++] = a[2];
    B[o++] = c[0];
    B[o++] = c[1];
    B[o++] = c[2];
    B[o++] = alpha;
    B[o++] = b[0];
    B[o++] = b[1];
    B[o++] = b[2];
    B[o++] = c[0];
    B[o++] = c[1];
    B[o++] = c[2];
    B[o++] = alphaB;
    this.n += 2;
  }

  /** A dashed line: `dash` long dashes with gaps as long. */
  private dashed(a: Vec3, b: Vec3, c: ArrayLike<number>, alpha: number, dash: number): void {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.min(200, Math.max(1, Math.floor(len / Math.max(1e-9, dash))));
    for (let i = 0; i < n; i += 2) {
      const u0 = i / n;
      const u1 = Math.min(1, (i + 1) / n);
      this.line(
        [a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0, a[2] + (b[2] - a[2]) * u0],
        [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1, a[2] + (b[2] - a[2]) * u1],
        c,
        alpha,
      );
    }
  }

  private readonly aimNow: AimNow = { yaw: NaN, pitch: NaN };

  /** The look aids of one track (`lookAids.ts`): its camera glyph, its gun's line, or its view cone. */
  private look(
    d: Dataset,
    tr: TacticalTrack,
    i: number,
    p: Vec3,
    colour: ArrayLike<number>,
    k: number,
    cams: ReturnType<typeof cameraTracks>,
    aim: ReturnType<typeof aimOf>,
    cone: boolean,
    gun: boolean,
    camera: boolean,
    fov: number,
    length: number,
    t: number,
    axesNow: () => { fwd: Vec3; up: Vec3; right: Vec3 },
    lines = false,
  ): void {
    void i;
    const aspect = 16 / 9;
    if (cams.persons[tr.person]) {
      // Not while the view is through it: its own frustum would frame the picture.
      const r = useReplayStore.getState();
      if (!camera || (r.follow === tr.person && (r.followMode === 'cockpit' || r.followMode === 'padlock'))) return;
      const a = axesNow();
      const zoom = zoomAt(d, tr.row);
      const f = fovAt(cams.fov, tr.row);
      const h = Number.isFinite(f) ? f : CAMERA_FOV / (zoom > 0.2 ? zoom : 1);
      const fr: LookFrame = { o: p, fwd: a.fwd, up: a.up, right: a.right };
      for (const [x, y] of cameraGlyph(fr, h, aspect, 1.6 * k, Math.max(12 * k, length))) this.line(x, y, CAMERA_COLOUR, 0.95);
      return;
    }
    if (lines && aim && tr.row >= 0 && this.aimLines(tr, p, colour, k, aim, length, t, axesNow)) return;
    if (gun && aim && tr.row >= 0) {
      aim.at(tr.row, t, this.aimNow);
      if (Number.isFinite(this.aimNow.yaw) || Number.isFinite(this.aimNow.pitch)) {
        const a = axesNow();
        const yaw = Number.isFinite(this.aimNow.yaw) ? this.aimNow.yaw : 0;
        const pitch = Number.isFinite(this.aimNow.pitch) ? this.aimNow.pitch : 0;
        const dir = bodyDirection(a, (yaw * 180) / Math.PI, (pitch * 180) / Math.PI);
        // From about where a turret ring sits, along the gun.
        const o: Vec3 = [p[0] + a.up[0] * 2.2 * k, p[1] + a.up[1] * 2.2 * k, p[2] + a.up[2] * 2.2 * k];
        const len = Math.max(100 * k, length);
        this.dashed(o, [o[0] + dir[0] * len, o[1] + dir[1] * len, o[2] + dir[2] * len], colour, 0.9, len / 30);
        return;
      }
    }
    if (!cone || tr.row < 0) return;
    const index = unitsOf(d);
    const u = index.units[index.personUnit[tr.person]];
    if (!u || unitShape(d, u) !== 'person') return;
    // From the eyes, about a person's height above where it stands.
    const a = axesOfTrack({ ...tr, q: null });
    const level = Math.hypot(a.fwd[0], a.fwd[2]) > 1e-6;
    const up: Vec3 = level ? a.up : [0, 1, 0];
    const eye: Vec3 = [p[0], p[1] + 1.6 * k, p[2]];
    const c = viewCone({ o: eye, fwd: a.fwd, up, right: a.right }, fov, aspect, Math.max(1e-6, length));
    for (const [x, y] of c.edges) this.line(x, y, colour, 0.85, 0.35);
    for (const [x, y] of c.mid) this.line(x, y, colour, 0.25);
  }

  /**
   * A vehicle's two lines (the figures' `aimLines`): its turret's gun, solid
   * (fainter where the turret is taken from the view, `Aim.derived`), and
   * where its player looks, dashed; both from about the turret ring. False
   * where the data says neither now.
   */
  private aimLines(
    tr: TacticalTrack,
    p: Vec3,
    colour: ArrayLike<number>,
    k: number,
    aim: NonNullable<ReturnType<typeof aimOf>>,
    length: number,
    t: number,
    axesNow: () => { fwd: Vec3; up: Vec3; right: Vec3 },
  ): boolean {
    const now = this.aimNow;
    aim.at(tr.row, t, now);
    const ty = now.yaw, tp = now.pitch;
    let vy = NaN, vp = NaN;
    if (aim.view) {
      aim.view.at(tr.row, t, now);
      vy = now.yaw;
      vp = now.pitch;
    }
    const turret = Number.isFinite(ty) || Number.isFinite(tp);
    const view = Number.isFinite(vy) || Number.isFinite(vp);
    if (!turret && !view) return false;
    const a = axesNow();
    const o: Vec3 = [p[0] + a.up[0] * 2.2 * k, p[1] + a.up[1] * 2.2 * k, p[2] + a.up[2] * 2.2 * k];
    const len = Math.max(100 * k, length);
    const deg = (v: number) => ((Number.isFinite(v) ? v : 0) * 180) / Math.PI;
    if (turret) {
      const dir = bodyDirection(a, deg(ty), deg(tp));
      this.line(o, [o[0] + dir[0] * len, o[1] + dir[1] * len, o[2] + dir[2] * len], colour, aim.derived?.[tr.person] === 1 ? 0.4 : 0.95);
    }
    if (view) {
      const dir = bodyDirection(a, deg(vy), deg(vp));
      this.dashed(o, [o[0] + dir[0] * len, o[1] + dir[1] * len, o[2] + dir[2] * len], VIEW_COLOUR, 0.85, len / 40);
    }
    return true;
  }

  /**
   * The aids for this frame, after the `baseCount` vertices of `base`; null
   * when none is drawn (the caller keeps its own buffer).
   * `colorOf(i)` is the i-th track's colour.
   */
  build(
    d: Dataset,
    tracks: TacticalTrack[],
    t: number,
    session: number,
    colorOf: (i: number) => ArrayLike<number>,
    base: Float32Array | null,
    baseCount: number,
  ): { data: Float32Array; count: number } | null {
    const r = useReplayStore.getState();
    const aids = r.aids;
    const cols = columnsOf(d);
    const wanted = (s: Scope) => s !== 'off';
    const motionAids = wanted(aids.vectors) || wanted(aids.pathAhead) || wanted(aids.attitudeLines);
    // Where people look: view cones (with the team panel's look direction on), turrets' aim, the recorded camera.
    const team = useStore.getState().team;
    const lookOn = team.showLookDirection && wanted(aids.look);
    const aim = wanted(aids.aim) || team.aimLines ? aimOf(d) : null;
    const cams = cameraTracks(d);
    const lookAids = lookOn || !!aim || (aids.camera && cams.any);
    if (!tracks.length || (!motionAids && !cols.any && !lookAids)) return null;
    this.n = 0;
    if (base && baseCount) {
      this.reserve(baseCount);
      this.buf.set(base.subarray(0, baseCount * STRIDE));
      this.n = baseCount;
    }
    const start = this.n;
    const k = unitsPerMetre(d);
    const index = unitsOf(d);
    const pos = new Map<number, Vec3>();
    for (const tr of tracks) pos.set(tr.person, [tr.x, tr.y, tr.z]);
    const selected = new Set<number>();
    if (r.follow !== null) selected.add(r.follow);
    if (r.targetPerson !== null) selected.add(r.targetPerson);
    if (r.pair) for (const p of r.pair) selected.add(p);
    const inScope = (s: Scope, tr: TacticalTrack): boolean => {
      if (s === 'off') return false;
      if (s === 'all') return true;
      const u = index.units[index.personUnit[tr.person]];
      if (s === 'selected') return selected.has(tr.person) || (!!u && u.key === r.selected);
      return !!u && unitCategory(d, u) === s;
    };
    const motion = motionAids ? MotionModel.of(d) : null;
    const s = this.sample;
    const white = [0.92, 0.94, 0.97];

    for (let i = 0; i < tracks.length; i++) {
      const tr = tracks[i];
      const p: Vec3 = [tr.x, tr.y, tr.z];
      const color = colorOf(i);
      const bright = [
        Math.min(1, color[0] * 0.6 + 0.4),
        Math.min(1, color[1] * 0.6 + 0.4),
        Math.min(1, color[2] * 0.6 + 0.4),
      ];
      let axes: ReturnType<typeof axesOfTrack> | null = null;
      const axesNow = () => (axes ??= axesOfTrack(tr));

      // ---- velocity vector, path ahead, nose and lift
      if (
        motion &&
        (inScope(aids.vectors, tr) ||
          inScope(aids.pathAhead, tr) ||
          inScope(aids.attitudeLines, tr)) &&
        motion.at(tr.person, t, session, s)
      ) {
        const v: Vec3 = [s.vx, s.vy, s.vz];
        const speed = Math.hypot(v[0], v[1], v[2]);
        const secs = aids.vectorSeconds;
        if (inScope(aids.vectors, tr) && speed > 0.5 * k) {
          const end: Vec3 = [p[0] + v[0] * secs, p[1] + v[1] * secs, p[2] + v[2] * secs];
          this.line(p, end, bright, 0.95, 0.75);
          // A tick across the end, so the vector's tip reads at a distance.
          const side = norm(cross(v, [0, 1, 0]));
          const w = Math.max(2 * k, speed * secs * 0.03);
          this.line(
            [end[0] - side[0] * w, end[1], end[2] - side[2] * w],
            [end[0] + side[0] * w, end[1], end[2] + side[2] * w],
            bright,
            0.9,
          );
        }
        if (inScope(aids.pathAhead, tr)) {
          const steps = 24;
          let prev = p;
          for (let j = 1; j <= steps; j++) {
            if (!motion.at(tr.person, t + (secs * j) / steps, session, s)) break;
            const q: Vec3 = [s.x, s.y, s.z];
            this.line(
              prev,
              q,
              color,
              0.8 * (1 - j / (steps + 4)),
              0.8 * (1 - (j + 1) / (steps + 4)),
            );
            prev = q;
          }
        }
        if (inScope(aids.attitudeLines, tr) && speed > 0.5 * k) {
          const a = axesNow();
          const len = Math.max(20 * k, speed * secs * 0.5);
          // The nose, dashed and pale, as Tacview draws the heading; the lift, short and dark.
          this.dashed(
            p,
            [p[0] + a.fwd[0] * len, p[1] + a.fwd[1] * len, p[2] + a.fwd[2] * len],
            white,
            0.7,
            len / 16,
          );
          this.line(
            p,
            [p[0] + a.up[0] * len * 0.35, p[1] + a.up[1] * len * 0.35, p[2] + a.up[2] * len * 0.35],
            [0.25, 0.28, 0.32],
            0.95,
          );
        }
      }

      // ---- where it looks: the recorded camera, a turret's gun, a player's eyes
      if (lookAids) this.look(d, tr, i, p, bright, k, cams, aim, lookOn && inScope(aids.look, tr), !!aim && inScope(aids.aim, tr), aids.camera, aids.lookFov, team.lookLength, t, axesNow, team.aimLines);

      const row = tr.row;
      if (row < 0 || !cols.any) continue;

      // ---- the pilot's line of sight, along the head's yaw and pitch
      if (cols.headYaw && inScope(aids.pilotSight, tr)) {
        const hy = fin(cols.headYaw, row);
        if (Number.isFinite(hy)) {
          const dir = bodyDirection(axesNow(), hy, fin(cols.headPitch, row, 0));
          const len = Math.max(300, aids.vectorSeconds * 150) * k;
          this.dashed(p, [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len], [0.4, 0.95, 1], 0.85, len / 24);
        }
      }

      // ---- radar cone and range gate
      if (cols.radarRange && inScope(aids.radar, tr)) {
        const mode = fin(cols.radarMode, row, 1);
        const range = fin(cols.radarRange, row);
        if (mode !== 0 && range > 0) {
          const a = axesNow();
          const az = fin(cols.radarAz, row, 0);
          const el = fin(cols.radarEl, row, 0);
          const roll = fin(cols.radarRoll, row, 0);
          const hb = fin(cols.radarH, row);
          const vb = fin(cols.radarV, row);
          const R = range * k;
          const rc = [0.45, 1, 0.55];
          if (hb > 0 && vb > 0) {
            const rim = beamRim(a, az, el, roll, hb, vb, R, 32);
            const mid = beamRim(a, az, el, roll, hb, vb, R / 2, 32);
            for (let j = 0; j < rim.length; j++) {
              const q0 = rim[j];
              const q1 = rim[(j + 1) % rim.length];
              this.line(
                [p[0] + q0[0], p[1] + q0[1], p[2] + q0[2]],
                [p[0] + q1[0], p[1] + q1[1], p[2] + q1[2]],
                rc,
                0.55,
              );
              const m0 = mid[j];
              const m1 = mid[(j + 1) % mid.length];
              this.line(
                [p[0] + m0[0], p[1] + m0[1], p[2] + m0[2]],
                [p[0] + m1[0], p[1] + m1[1], p[2] + m1[2]],
                rc,
                0.25,
              );
            }
            for (let j = 0; j < rim.length; j += 8)
              this.line(p, [p[0] + rim[j][0], p[1] + rim[j][1], p[2] + rim[j][2]], rc, 0.45, 0.2);
          } else {
            // No beamwidth in the recording: the beam's axis to its range.
            const dir = bodyDirection(a, az, el);
            this.line(p, [p[0] + dir[0] * R, p[1] + dir[1] * R, p[2] + dir[2] * R], rc, 0.7, 0.3);
          }
          // The range gate: the part of the beam the radar looks at now.
          const g0 = fin(cols.gateMin, row);
          const g1 = fin(cols.gateMax, row);
          if (g1 > 0 && g1 > g0) {
            const gaz = fin(cols.gateAz, row, az);
            const gel = fin(cols.gateEl, row, el);
            const gh = fin(cols.gateH, row, hb > 0 ? hb / 4 : 3);
            const gv = fin(cols.gateV, row, vb > 0 ? vb / 4 : 3);
            const gc = [1, 0.85, 0.35];
            for (const gr of [Math.max(0, g0), g1]) {
              const rim = beamRim(a, gaz, gel, roll, gh, gv, gr * k, 16);
              for (let j = 0; j < rim.length; j++) {
                const q0 = rim[j];
                const q1 = rim[(j + 1) % rim.length];
                this.line(
                  [p[0] + q0[0], p[1] + q0[1], p[2] + q0[2]],
                  [p[0] + q1[0], p[1] + q1[1], p[2] + q1[2]],
                  gc,
                  0.7,
                );
              }
            }
          }
        }
      }

      // ---- links: a weapon to its launcher (Parent, dashed), a waypoint to the next (Next), where both are there now
      if (inScope(aids.links, tr)) {
        for (const col of [cols.parent, cols.next]) {
          if (!col) continue;
          const id = (col.categories?.[(col.data as Uint32Array)[row]] ?? '').trim().toLowerCase();
          const other = id ? cols.byId.get(id) : undefined;
          const q = other !== undefined ? pos.get(other) : undefined;
          if (!q) continue;
          if (col === cols.parent) this.dashed(p, q, [0.7, 0.78, 0.9], 0.7, Math.max(5 * k, Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) / 30));
          else this.line(p, q, [0.45, 0.9, 0.6], 0.85, 0.85);
        }
      }

      // ---- locks: to the locked object where it is named, else along the lock's angles
      if (inScope(aids.locks, tr)) {
        const lockOn = fin(cols.lockMode, row, 1) !== 0;
        let drawn = false;
        if (lockOn) {
          for (const col of cols.locked) {
            const id = (col.categories?.[(col.data as Uint32Array)[row]] ?? '')
              .trim()
              .toLowerCase();
            const other = id ? cols.byId.get(id) : undefined;
            const q = other !== undefined ? pos.get(other) : undefined;
            if (!q) continue;
            this.line(p, q, [1, 0.3, 0.25], 0.9, 0.6);
            drawn = true;
          }
          if (!drawn && cols.lockAz) {
            const range = fin(cols.lockRange, row);
            const az = fin(cols.lockAz, row);
            if (range > 0 && Number.isFinite(az)) {
              const dir = bodyDirection(axesNow(), az, fin(cols.lockEl, row, 0));
              this.line(
                p,
                [p[0] + dir[0] * range * k, p[1] + dir[1] * range * k, p[2] + dir[2] * range * k],
                [1, 0.3, 0.25],
                0.9,
                0.5,
              );
            }
          }
        }
        if (cols.focused) {
          const id = (cols.focused.categories?.[(cols.focused.data as Uint32Array)[row]] ?? '')
            .trim()
            .toLowerCase();
          const other = id ? cols.byId.get(id) : undefined;
          const q = other !== undefined ? pos.get(other) : undefined;
          if (q)
            this.dashed(
              p,
              q,
              [1, 0.75, 0.3],
              0.8,
              Math.max(5 * k, Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) / 40),
            );
        }
      }

      // ---- engagement domes
      if (cols.engage.length && inScope(aids.engagement, tr)) {
        for (const e of cols.engage) {
          if (fin(e.mode, row, 1) === 0) continue;
          const h = fin(e.range, row);
          if (!(h > 0)) continue;
          const v = fin(e.vertical, row, h);
          const lines = domeLines(h * k, (v > 0 ? v : h) * k, 4, 6, 48);
          for (const [a, b] of lines)
            this.line(
              [p[0] + a[0], p[1] + a[1], p[2] + a[2]],
              [p[0] + b[0], p[1] + b[1], p[2] + b[2]],
              color,
              0.3,
            );
        }
      }
    }
    if (this.n === start) return null;
    return { data: this.buf, count: this.n };
  }
}

export type { DisplayAids };
