/**
 * Which faces of the units' views (`viewshedShaders.ts`) to take this frame,
 * shared by both backends. A face is taken again when its unit has moved more
 * than the view's tolerance since it was taken, when the slot changed unit or
 * when the level changed; the most out of date first, at most a few a frame,
 * so a moving unit's line of sight follows it without a frame ever drawing the
 * level more than a few extra times. A unit standing still costs nothing.
 */

import { MAX_VIEWS } from './viewshedShaders';

/** A unit's view as the engine asks for it. */
export interface RangeView {
  /** Who it is (a person id): a slot given to someone else is taken anew. */
  id: number;
  /** Its eye, world coordinates. */
  eye: [number, number, number];
  /** How far the view reaches, data units. */
  far: number;
  /** Moving less than this (data units) keeps the faces taken. */
  tolerance: number;
  /** The ground shaded: least, best, most range (data units), and its colour. */
  band: [number, number, number];
  colour: [number, number, number];
  /** The ground shaded only inside this view cone (its axis, tangent of half its width), else all round. */
  cone?: { fwd: [number, number, number]; tanH: number } | null;
}

interface Face {
  id: number;
  eye: [number, number, number];
  far: number;
  /** Whether the depth holds a picture for `eye`. */
  taken: boolean;
}

export class ViewshedPlan {
  readonly faces: Face[] = Array.from({ length: MAX_VIEWS * 6 }, () => ({ id: -1, eye: [0, 0, 0], far: 0, taken: false }));
  private level: unknown = null;
  /** Whether faces are still waiting to be taken (the engine keeps drawing frames until they are). */
  pending = false;

  /** Forget every face (a new level). */
  invalidate(): void {
    for (const f of this.faces) f.taken = false;
  }

  /**
   * The faces to take this frame, slot * 6 + face, at most `budget`; each is
   * marked taken at its view's eye now (the caller draws it this frame).
   */
  plan(views: readonly (RangeView | null)[], level: unknown, budget: number): number[] {
    if (level !== this.level) {
      this.level = level;
      this.invalidate();
    }
    const want: [number, number][] = [];
    for (let s = 0; s < MAX_VIEWS; s++) {
      const v = views[s];
      for (let f = 0; f < 6; f++) {
        const face = this.faces[s * 6 + f];
        if (!v) {
          face.id = -1;
          face.taken = false;
          continue;
        }
        if (face.id !== v.id || !face.taken || Math.abs(face.far - v.far) > v.tolerance) {
          // Never taken, or someone else's: first.
          want.push([s * 6 + f, Number.POSITIVE_INFINITY]);
          continue;
        }
        const moved = Math.hypot(face.eye[0] - v.eye[0], face.eye[1] - v.eye[1], face.eye[2] - v.eye[2]);
        if (moved > v.tolerance) want.push([s * 6 + f, moved / v.tolerance]);
      }
    }
    want.sort((a, b) => b[1] - a[1]);
    const out = want.slice(0, Math.max(0, budget)).map((w) => w[0]);
    for (const i of out) {
      const v = views[Math.floor(i / 6)]!;
      const face = this.faces[i];
      if (face.id !== v.id) face.taken = false;
      face.id = v.id;
      face.eye = [v.eye[0], v.eye[1], v.eye[2]];
      face.far = v.far;
      face.taken = true;
    }
    this.pending = want.length > out.length;
    return out;
  }

  /**
   * The shaders' `views`: per face its eye relative to `origin` and its reach
   * (0 for a face not taken, whose directions all count as seen).
   */
  uniforms(views: readonly (RangeView | null)[], origin: ArrayLike<number>, out = new Float32Array(MAX_VIEWS * 6 * 4)): Float32Array {
    for (let i = 0; i < this.faces.length; i++) {
      const f = this.faces[i];
      const v = views[Math.floor(i / 6)];
      const ok = f.taken && !!v && f.id === v.id;
      // A face not taken yet stands at the unit's eye now: the first face is where the shaders measure from.
      const e = ok || !v ? f.eye : v.eye;
      out[i * 4] = e[0] - origin[0];
      out[i * 4 + 1] = e[1] - origin[1];
      out[i * 4 + 2] = e[2] - origin[2];
      out[i * 4 + 3] = ok ? f.far : 0;
    }
    return out;
  }
}
