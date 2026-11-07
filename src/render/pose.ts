import type { AxisMapping } from '../state/types';

/**
 * Camera poses as people write them down: parsing, the two yaw conventions, and
 * the data's own frame.
 *
 * Pure, so the arithmetic every inspection tool shares - the camera readout,
 * the jump box, the pick card - is tested once and cannot drift between them.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Which way "yaw 0" points, and which way it grows.
 *
 * `viewer` is the fly camera's own: 0 looks along -Z and growing turns towards
 * -X. `game` is the convention the capture tools write (the locate tool's
 * camera.py): 0 looks along +X and growing turns towards -Z, which in a level
 * exported in the viewer's frame is the game's own yaw. The two differ by a
 * quarter turn and nothing else - `viewer = game - 90` - and pitch is the same
 * in both: up from the horizontal.
 */
export type YawConvention = 'viewer' | 'game';

const RAD = Math.PI / 180;

/** Unit view direction in the viewer's world (Y up) for a yaw and pitch in degrees. */
export function directionFromYawPitch(convention: YawConvention, yawDeg: number, pitchDeg: number): Vec3 {
  const y = yawDeg * RAD;
  const cp = Math.cos(pitchDeg * RAD);
  const sp = Math.sin(pitchDeg * RAD);
  if (convention === 'game') return { x: Math.cos(y) * cp, y: sp, z: -Math.sin(y) * cp };
  return { x: -Math.sin(y) * cp, y: sp, z: -Math.cos(y) * cp };
}

/** Yaw and pitch, in degrees, of a direction; yaw in (-180, 180]. */
export function yawPitchFromDirection(convention: YawConvention, d: Vec3): { yaw: number; pitch: number } {
  const len = Math.hypot(d.x, d.y, d.z) || 1;
  const pitch = Math.asin(Math.max(-1, Math.min(1, d.y / len))) / RAD;
  // Straight up or down has no yaw of its own; zero rather than whatever the
  // rounding of a near-zero horizontal component happens to point at.
  if (Math.hypot(d.x, d.z) < 1e-12) return { yaw: 0, pitch };
  const yaw = convention === 'game' ? Math.atan2(-d.z, d.x) : Math.atan2(-d.x, -d.z);
  return { yaw: wrapDegrees(yaw / RAD), pitch };
}

/** A yaw in one convention, said in the other. */
export function convertYaw(yawDeg: number, from: YawConvention, to: YawConvention): number {
  if (from === to) return yawDeg;
  return wrapDegrees(from === 'game' ? yawDeg - 90 : yawDeg + 90);
}

/** Degrees into (-180, 180]. */
export function wrapDegrees(deg: number): number {
  let d = deg % 360;
  if (d <= -180) d += 360;
  if (d > 180) d -= 360;
  // -0 prints as "-0.0", which reads as a sign that means something.
  return d === 0 ? 0 : d;
}

/**
 * The look direction stored with a data row, as a world vector.
 *
 * The dataset keeps yaw and pitch in radians in a third convention, the one
 * `buildLookFrom` writes and the look-ray shader reads: `(sin y, ., -cos y)`.
 * Named here so "stand where this row stood, looking where it looked" turns it
 * into the camera's without anyone having to rediscover which sign flips.
 */
export function rowLookDirection(yawRad: number, pitchRad: number): Vec3 {
  const cp = Math.cos(pitchRad);
  return { x: Math.sin(yawRad) * cp, y: Math.sin(pitchRad), z: -Math.cos(yawRad) * cp };
}

// ------------------------------------------------------------------ frames

/**
 * True when the load's axis mapping changed nothing, so world and data
 * coordinates are the same numbers.
 */
export function isIdentityAxes(axes: AxisMapping | null | undefined): boolean {
  return !axes || (axes.up === 'y' && !axes.flipX && !axes.flipY && !axes.flipZ && (axes.scale || 1) === 1);
}

/**
 * A world point in the data's own frame: the load's axis mapping undone.
 *
 * The inverse of `remapAxesInPlace`, which scales, flips and, for a Z-up
 * source, swaps Y and Z. Every coordinate the inspection tools show goes
 * through here, so a number read off the view is a number the source table
 * would contain - and typed back into the jump box lands where it came from.
 */
export function worldToData(p: Vec3, axes: AxisMapping | null | undefined): Vec3 {
  if (!axes) return { ...p };
  const s = axes.scale || 1;
  const fx = axes.flipX ? -1 : 1;
  const fy = axes.flipY ? -1 : 1;
  const fz = axes.flipZ ? -1 : 1;
  // remapAxesInPlace for Z up: world (x, y, z) = (x*sx, z*sz, y*sy).
  if (axes.up === 'z') return { x: (p.x / s) * fx, y: (p.z / s) * fy, z: (p.y / s) * fz };
  return { x: (p.x / s) * fx, y: (p.y / s) * fy, z: (p.z / s) * fz };
}

/** A data-frame point in the viewer's world: the load's axis mapping applied. */
export function dataToWorld(p: Vec3, axes: AxisMapping | null | undefined): Vec3 {
  if (!axes) return { ...p };
  const s = axes.scale || 1;
  const fx = axes.flipX ? -1 : 1;
  const fy = axes.flipY ? -1 : 1;
  const fz = axes.flipZ ? -1 : 1;
  if (axes.up === 'z') return { x: p.x * fx * s, y: p.z * fz * s, z: p.y * fy * s };
  return { x: p.x * fx * s, y: p.y * fy * s, z: p.z * fz * s };
}

// ----------------------------------------------------------------- parsing

export interface ParsedPose {
  x: number;
  y: number;
  z: number;
  /** Present when the text named them: a pasted pose rather than a point. */
  yaw?: number;
  pitch?: number;
  /** Set when the text said which yaw it is: the readout's copy marks a game yaw. */
  convention?: YawConvention;
}

/**
 * One number as a person typed it: `.` or `,` as the decimal mark.
 *
 * With both present the later one is the decimal mark and the other grouping -
 * `1.234,5` and `1,234.5` are both one thousand two hundred and thirty-four and
 * a half - which is how a figure copied out of a German spreadsheet arrives.
 */
export function parseNumber(text: string): number | null {
  let s = text.trim().replace(/−/g, '-').replace(/\s+/g, '');
  if (!s) return null;
  const dot = s.lastIndexOf('.');
  const comma = s.lastIndexOf(',');
  if (dot >= 0 && comma >= 0) {
    if (comma > dot) s = s.replace(/\./g, '').replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (comma >= 0) {
    if (s.indexOf(',') !== comma) return null;
    s = s.replace(',', '.');
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

/**
 * Three coordinates, and optionally a yaw and pitch, from whatever was pasted.
 *
 * Accepted: `x, y, z`, `x y z`, `x; y; z`, with `.` or `,` decimals - so
 * `-321.6, 137.8, -59.9`, `-321,6 137,8 -59,9` and `-321,6; 137,8; -59,9` are
 * all the same point - plus a fourth and fifth number for yaw and pitch. Text
 * with labels is read by its labels: `x=1 y=2 z=3`, the camera readout's
 * `x 1 y 2 z 3 yaw 4 pitch 5`, and the pose box's `pos 1 2 3 · yaw 4 · pitch 5`.
 *
 * The one ambiguous shape, commas as both separator and decimal mark with no
 * spaces (`1,5,2,5,3,5`), is read as three decimals when it splits into exactly
 * six whole numbers, and refused otherwise rather than guessed.
 */
export function parsePose(text: string): ParsedPose | null {
  const src = text.trim().replace(/−/g, '-');
  if (!src) return null;
  if (/[a-z]/i.test(src.replace(/e[+-]?\d/gi, ''))) return parseLabelled(src);
  const nums = splitNumbers(src);
  if (!nums || (nums.length !== 3 && nums.length !== 5)) return null;
  const [x, y, z, yaw, pitch] = nums;
  return nums.length === 5 ? { x, y, z, yaw, pitch } : { x, y, z };
}

function splitNumbers(src: string): number[] | null {
  let parts: string[];
  if (src.includes(';')) parts = src.split(';');
  else if (/\s/.test(src.replace(/,\s+/g, ','))) {
    // Whitespace separates, so a comma is a decimal mark - or, followed by a
    // space, a separator as well (`1,5, 2,5, 3,5`).
    parts = src.split(/\s+|,\s+/);
  } else {
    parts = src.split(/,\s*/);
    // `1,5,2,5,3,5`: six whole numbers can only be three decimals.
    if (parts.length === 6 && parts.every((p) => /^[+-]?\d+$/.test(p))) {
      parts = [0, 2, 4].map((i) => `${parts[i]},${parts[i + 1]}`);
    } else if (parts.length === 10 && parts.every((p) => /^[+-]?\d+$/.test(p))) {
      parts = [0, 2, 4, 6, 8].map((i) => `${parts[i]},${parts[i + 1]}`);
    }
  }
  const out: number[] = [];
  for (const p of parts) {
    if (!p.trim()) continue;
    const v = parseNumber(p);
    if (v === null) return null;
    out.push(v);
  }
  return out;
}

const NUMBER = String.raw`[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:e[+-]?\d+)?`;

function parseLabelled(src: string): ParsedPose | null {
  const take = (label: string): number | undefined => {
    const m = new RegExp(String.raw`(?:^|[^a-z])${label}\s*[:=]?\s*(${NUMBER})`, 'i').exec(src);
    if (!m) return undefined;
    return parseNumber(m[1]) ?? undefined;
  };
  let x = take('x');
  let y = take('y');
  let z = take('z');
  // The pose box's copy: `pos X Y Z`.
  const pos = new RegExp(String.raw`pos\s*[:=]?\s*(${NUMBER})[\s,;]+(${NUMBER})[\s,;]+(${NUMBER})`, 'i').exec(src);
  if (pos) {
    x = parseNumber(pos[1]) ?? undefined;
    y = parseNumber(pos[2]) ?? undefined;
    z = parseNumber(pos[3]) ?? undefined;
  }
  if (x === undefined || y === undefined || z === undefined) return null;
  const yaw = take('yaw');
  const pitch = take('pitch');
  const out: ParsedPose = { x, y, z };
  if (yaw !== undefined) out.yaw = yaw;
  if (pitch !== undefined) out.pitch = pitch;
  if (/game/i.test(src)) out.convention = 'game';
  else if (/viewer/i.test(src)) out.convention = 'viewer';
  return out;
}

/** Numbers for the clipboard: `.` decimals whatever the language, so any tool reads them. */
export function plain(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return 'NaN';
  const s = v.toFixed(digits);
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
}

/** A point as one pasteable line: `x, y, z`. */
export function formatPoint(p: Vec3, digits = 2): string {
  return `${plain(p.x, digits)}, ${plain(p.y, digits)}, ${plain(p.z, digits)}`;
}

/** A camera pose as one line the jump box reads back. */
export function formatPose(p: Vec3, yaw: number, pitch: number, convention: YawConvention): string {
  return `x ${plain(p.x)} y ${plain(p.y)} z ${plain(p.z)} yaw ${plain(yaw)} pitch ${plain(pitch)}${
    convention === 'game' ? ' (game yaw)' : ' (viewer yaw)'
  }`;
}

// ------------------------------------------------------------------ jumping

/**
 * How far from a point "look at it" stands.
 *
 * Where the camera already is, if that is a sensible distance - a jump to a
 * point already on screen should not lurch - and otherwise clamped into a band
 * scaled from the scene: close enough to see what is there, far enough to see
 * what is around it. Three thousandths to three hundredths of the scene's
 * extent is 6 to 60 m on a two-kilometre level.
 */
export function lookAtDistance(current: number, sceneExtent: number): number {
  const extent = Number.isFinite(sceneExtent) && sceneExtent > 0 ? sceneExtent : 1000;
  const lo = Math.max(2, extent * 0.003);
  const hi = Math.max(20, extent * 0.03);
  if (!Number.isFinite(current) || current <= 0) return hi;
  return Math.max(lo, Math.min(hi, current));
}

/**
 * A pitch that looks down at a point rather than past it.
 *
 * Looking at a spot on the ground from a level camera puts the spot on the
 * horizon, where it is a line. Keeps any pitch that already looks down by at
 * least twenty degrees, and otherwise tips the view to that.
 */
export function lookAtPitch(currentPitchDeg: number): number {
  return Math.min(currentPitchDeg, -20);
}
