import { num, t } from '../i18n';
import type { Engine } from '../render/engine';
import {
  dataToWorld,
  directionFromYawPitch,
  parsePose,
  plain,
  rowLookDirection,
  worldToData,
  yawPitchFromDirection,
  type ParsedPose,
  type Vec3,
  type YawConvention,
} from '../render/pose';
import type { AxisMapping, Dataset } from '../state/types';

/**
 * What the inspection tools show, worked out once for all of them: the camera
 * readout, the pose and jump boxes and the pick card must say the same numbers
 * for the same thing, or a value copied from one and typed into another lands
 * somewhere else.
 *
 * Positions are said in the data's own frame (the load's axis mapping undone)
 * and yaw in the convention chosen in the View panel. Directions do not take
 * the mapping's scale or swap: yaw and pitch are about the viewer's world, Y up,
 * which for the capture tools' Y-up exports is the data's frame as well.
 */

/** The camera as the tools say it. */
export function cameraInFrame(
  engine: Engine,
  axes: AxisMapping | null | undefined,
  convention: YawConvention,
): { position: Vec3; yaw: number; pitch: number } {
  const pose = engine.cameraPose();
  const { yaw, pitch } = yawPitchFromDirection(convention, pose.forward);
  return { position: worldToData(pose.position, axes), yaw, pitch };
}

/**
 * A typed pose in world terms: the position through the axis mapping, and the
 * direction, when yaw is given, from the convention it is in. A pitch alone
 * keeps the camera's heading.
 */
export function poseToWorld(
  engine: Engine,
  pose: ParsedPose,
  axes: AxisMapping | null | undefined,
  convention: YawConvention,
): { position: Vec3; forward: Vec3 | null } {
  const position = dataToWorld(pose, axes);
  if (pose.yaw === undefined && pose.pitch === undefined) return { position, forward: null };
  const conv = pose.convention ?? convention;
  const now = yawPitchFromDirection(conv, engine.cameraPose().forward);
  return { position, forward: directionFromYawPitch(conv, pose.yaw ?? now.yaw, pose.pitch ?? now.pitch) };
}

/**
 * Go where a typed text says: a point to look at (or stand on, per `mode`), or
 * a whole pose pasted with its angles, which always means "stand in this view".
 * Returns why not, or null when the camera moved.
 */
export function jumpFromText(
  engine: Engine,
  text: string,
  mode: 'look' | 'stand',
  axes: AxisMapping | null | undefined,
  convention: YawConvention,
  angles?: { yaw: number | null; pitch: number | null },
): string | null {
  const pose = parsePose(text);
  if (!pose) return text.trim() ? t('heat.inspect.jump.unreadable') : t('heat.inspect.jump.empty');
  const pasted = pose.yaw !== undefined || pose.pitch !== undefined;
  // Angles typed in boxes of their own are the later edit, and win.
  if (angles?.yaw !== null && angles?.yaw !== undefined) {
    pose.yaw = angles.yaw;
    pose.convention = undefined;
  }
  if (angles?.pitch !== null && angles?.pitch !== undefined) pose.pitch = angles.pitch;
  const world = poseToWorld(engine, pose, axes, convention);
  engine.jumpTo(world.position, pasted ? 'stand' : mode, world.forward);
  return null;
}

/** A coordinate for reading: the language's decimal mark, two places. */
export function coord(v: number): string {
  return num(v, 2);
}

/** Decimals that suit a value: none for whole numbers, fewer the larger it is. */
function auto(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return num(v, 0);
  const a = Math.abs(v);
  return num(v, a >= 1000 ? 1 : a >= 1 ? 3 : 4);
}

/** As `auto`, with `.` decimals for the clipboard. */
function autoPlain(v: number): string {
  if (!Number.isFinite(v)) return 'NaN';
  if (Number.isInteger(v)) return String(v);
  const a = Math.abs(v);
  return plain(v, a >= 1000 ? 1 : a >= 1 ? 3 : 4);
}

/** One line of the pick card: a label, the value shown, and the value copied. */
export interface Field {
  label: string;
  value: string;
  copy: string;
}

/**
 * Every column a row carries, labelled with the source's own column names.
 *
 * Generic over whatever the dataset kept: the roles first (time, who, which
 * group and session), then each retained column in load order, then where
 * it stood and where it looked. A column the load did not keep - one not
 * chosen as a filter column - is not in memory and so not here.
 */
export function rowFields(ds: Dataset, row: number, convention: YawConvention): Field[] {
  const out: Field[] = [];
  const names = ds.roleColumns ?? {};
  if (ds.time) {
    const rel = ds.time[row];
    if (ds.epochMs !== null) {
      const iso = new Date(ds.epochMs + rel * 1000).toISOString().replace('T', ' ');
      out.push({ label: names.time ?? t('heat.inspect.field.time'), value: iso, copy: iso });
    } else {
      const s = rel + (ds.timeOrigin ?? 0);
      out.push({
        label: names.time ?? t('heat.inspect.field.time'),
        value: t('heat.inspect.seconds', { value: num(s, 2), clock: clock(s) }),
        copy: plain(s, 3),
      });
    }
  }
  if (ds.personId) {
    const v = ds.personLabels[ds.personId[row]] ?? '';
    out.push({ label: names.person ?? t('heat.inspect.field.person'), value: v || '—', copy: v });
  }
  if (ds.teamId) {
    const v = ds.teamLabels[ds.teamId[row]] ?? '';
    out.push({ label: names.team ?? t('heat.inspect.field.group'), value: v || '—', copy: v });
  }
  if (ds.sessionId) {
    const v = ds.sessionLabels[ds.sessionId[row]] ?? '';
    out.push({ label: names.session ?? t('heat.inspect.field.session'), value: v || '—', copy: v });
  }
  for (const a of ds.attrs) {
    const raw = a.data[row];
    if (a.kind === 'category') {
      const v = a.categories?.[raw] ?? '';
      out.push({ label: a.name, value: v || '—', copy: v });
    } else {
      out.push({ label: a.name, value: auto(raw), copy: autoPlain(raw) });
    }
  }
  const p = worldToData({ x: ds.px[row], y: ds.py[row], z: ds.pz[row] }, ds.axes);
  out.push({ label: names.x ?? 'x', value: coord(p.x), copy: plain(p.x, 3) });
  out.push({ label: names.y ?? 'y', value: coord(p.y), copy: plain(p.y, 3) });
  out.push({ label: names.z ?? 'z', value: coord(p.z), copy: plain(p.z, 3) });
  if (ds.yaw) {
    // The row's look, in the same yaw the readout speaks, so "stand here" and
    // the readout afterwards agree with this line.
    const look = yawPitchFromDirection(convention, rowLookDirection(ds.yaw[row], ds.pitch ? ds.pitch[row] : 0));
    out.push({
      label: t('heat.inspect.field.look'),
      value: t('heat.inspect.lookValue', { yaw: num(look.yaw, 1), pitch: num(look.pitch, 1) }),
      copy: `yaw ${plain(look.yaw)} pitch ${plain(look.pitch)}`,
    });
  }
  return out;
}

/** mm:ss.ss, or h:mm:ss.ss, beside a time in seconds. */
function clock(seconds: number): string {
  const neg = seconds < 0;
  const s = Math.abs(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s - h * 3600 - m * 60;
  const ss = num(sec, 2).padStart(5, '0');
  const body = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
  return neg ? `-${body}` : body;
}

/** Copy text to the clipboard; false where the browser refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
