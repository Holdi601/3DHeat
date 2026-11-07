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
 */

import { VertexBuffer } from '../race/geometry';
import type { AttributeColumn, Dataset } from '../state/types';
import { CUBE_STRIDE } from '../data/tracks';
import { CATALOG } from './catalog';
import { place, TemplateCache, type Template } from './kit';
import { figureFor } from './match';

const NAME_COLUMN = /^(name|vehicle|vehicle.?name|unit|unit.?type|model|aircraft|plane|tank|ship|craft|loadout|kit|figure)$/i;
const TYPE_COLUMN = /^(type|class|kind|category|icon|role|domain|vehicle.?type|vehicle.?class)$/i;

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
    const cats = d.attrs.filter((a) => a.kind === 'category' && a.categories);
    this.names = cats.filter((a) => NAME_COLUMN.test(a.name.trim()));
    this.types = cats.filter((a) => TYPE_COLUMN.test(a.name.trim()));
    this.roll = d.attrs.find((a) => a.kind !== 'category' && /^roll$/i.test(a.name.trim())) ?? null;
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
