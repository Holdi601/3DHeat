/**
 * How a person holds themselves, from a table's own columns, in one place for
 * every game: the stance (standing, crouching, prone on the belly, supine on
 * the back) and the lean (left -1 ... right +1, partial in between).
 *
 * Columns: `stance` (also `posture`, `pose`) and `lean` (also `leaning`,
 * `peek`). Words games use are accepted (standing, upright, crouched,
 * kneeling, duck, crawl, lying, on back...), and numbers: a stance code 0
 * stand, 1 crouch, 2 prone, 3 supine; a lean from -1 (left) to 1 (right), or
 * -100 to 100 (per cent), or an angle in degrees beyond that (+-45 a full
 * lean).
 *
 * Figures show the stance as their pose (`posed`) and the lean as their upper
 * body turned about the forward axis, up to `LEAN_MAX`.
 */

import type { Stance } from './infantry';

/** The lean of a full lean: the upper body this far over, radians. */
export const LEAN_MAX = (25 * Math.PI) / 180;

/** A stance from a column's text or number; null for none said. */
export function stanceFrom(v: string | number | null | undefined): Stance | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return null;
    const c = Math.round(v);
    return c <= 0 ? 'stand' : c === 1 ? 'crouch' : c === 2 ? 'prone' : 'supine';
  }
  const t = v.trim().toLowerCase();
  if (!t) return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) return stanceFrom(Number(t));
  if (/supine|on.?(the.?)?back|back|lying.?up|face.?up/.test(t)) return 'supine';
  if (/prone|crawl|belly|lying|lie|laying|face.?down|down/.test(t)) return 'prone';
  if (/crouch|kneel|duck|squat|low/.test(t)) return 'crouch';
  if (/stand|upright|erect|up|walk|run|sprint|normal|idle/.test(t)) return 'stand';
  return null;
}

/** A lean from a column's text or number, -1 (left) ... 1 (right); 0 for none said. */
export function leanFrom(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return 0;
    const a = Math.abs(v);
    const x = a <= 1 ? v : a <= 100 && Number.isInteger(v) && a > 45 ? v / 100 : v / 45;
    return Math.max(-1, Math.min(1, x));
  }
  const t = v.trim().toLowerCase();
  if (!t) return 0;
  if (/^-?\d+(\.\d+)?$/.test(t)) return leanFrom(Number(t));
  if (/left|^l$|^q$/.test(t)) return -1;
  if (/right|^r$|^e$/.test(t)) return 1;
  return 0;
}

const STANCE_PART = /-(crouch|prone|supine)$/;
const SIDE_PART = /-(attack|defense)$/;

/**
 * A person figure's name in a stance: the same figure's variant
 * (`soldier-prone`, `operator-smg-crouch-attack`, `op-ash-rifle-supine-attack`),
 * or the plain soldier's when the figure has none; `kind` itself when neither
 * exists (`has` says which names do).
 */
export function posed(kind: string, stance: Stance, has: (name: string) => boolean): string {
  const side = SIDE_PART.exec(kind)?.[0] ?? '';
  const base = kind.slice(0, kind.length - side.length).replace(STANCE_PART, '');
  const want = `${base}${stance === 'stand' ? '' : `-${stance}`}${side}`;
  if (want === kind || has(want)) return want;
  const plain = stance === 'stand' ? 'soldier' : `soldier-${stance}`;
  return has(plain) ? plain : kind;
}
