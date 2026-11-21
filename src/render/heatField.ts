/**
 * The heat field the labels and a pick's relative heat read: the frame's drawn
 * rows binned into places (render/heatStack.ts `buildHeatField`), built a few
 * milliseconds at a time between frames and kept until what is drawn changes.
 *
 * Never on the frame path and never a GPU readback: the rows are already on
 * this thread, and the frame only hands over a copy of which of them it drew.
 * While the playhead runs the drawn rows change every frame, so a build is
 * started only when none is running - the field trails playback by one build,
 * a fraction of a second on a few million rows.
 */

import { buildHeatField, type HeatField, type HeatReading } from './heatStack';
import { runSliced } from './inspector';

/** What a field was built from: equal signatures, equal fields. */
export function readingSignature(r: HeatReading): string {
  const d = r.drawn;
  const k = r.kernel;
  return [
    r.dataset.id,
    r.mode,
    d.rowLo,
    d.rowHi,
    d.filters.map((f) => f.key).join(';'),
    d.useSign ? 1 : 0,
    d.teamSign ? Array.from(d.teamSign).join(',') : '',
    d.splitMode,
    d.splitColumn ?? '',
    d.splitSign ? Array.from(d.splitSign).join(',') : '',
    d.splitPositive.join(','),
    d.splitNegative.join(','),
    // A lifetime window moves on with the playhead even where the rows do not.
    d.lifetime ? Math.round(d.lifetime.now * 4) / 4 : '',
    d.cull ? `${d.cull.near},${d.cull.far},${d.cull.eye.x.toFixed(0)},${d.cull.eye.y.toFixed(0)},${d.cull.eye.z.toFixed(0)}` : '',
    d.slice ? `${d.slice.axis},${d.slice.min},${d.slice.max}` : '',
    d.groundY ?? '',
    k.radius,
    r.weight ? r.weight.scale : '',
  ].join('|');
}

/** Cells two sprite radii across: a place the size of one hot spot. */
export function fieldCell(radius: number): number {
  return Math.max(1e-3, radius * 2);
}

export class HeatFieldService {
  private field: HeatField | null = null;
  private sig = '';
  private building: Promise<HeatField | null> | null = null;
  private buildingSig = '';
  private token = 0;
  /** Bumped each time a new field is ready. */
  version = 0;
  /** 0..1 of the running build, 1 when none runs. */
  progress = 1;

  constructor(private readonly read: () => HeatReading | null) {}

  /** The latest field built, current or not; null before the first. */
  get latest(): HeatField | null {
    return this.field;
  }

  /** Whether the latest field is what the frame draws now. */
  isCurrent(): boolean {
    const r = this.read();
    return !!r && !!this.field && readingSignature(r) === this.sig;
  }

  /** Drop the field (a new dataset, the labels switched off and no pick waiting). */
  clear(): void {
    this.token++;
    this.field = null;
    this.sig = '';
    this.building = null;
    this.progress = 1;
  }

  /**
   * The field for what is drawn now: the latest when it is current, else a
   * build - the one already running if there is one. Null when no heat is drawn.
   */
  ensure(): Promise<HeatField | null> {
    const r = this.read();
    if (!r) return Promise.resolve(null);
    const sig = readingSignature(r);
    if (this.field && sig === this.sig) return Promise.resolve(this.field);
    if (this.building) return this.buildingSig === sig ? this.building : this.building.then(() => this.ensure());
    const token = ++this.token;
    const groups = r.mode === 'heat-teams' ? r.dataset.teamLabels.length : 0;
    this.buildingSig = sig;
    this.progress = 0;
    this.building = runSliced(
      buildHeatField(r.dataset, r.drawn, fieldCell(r.kernel.radius), r.weight, groups),
      () => token !== this.token,
      (v) => {
        if (typeof v === 'number') this.progress = v;
      },
      6,
    ).then((field) => {
      if (token !== this.token) return null;
      this.building = null;
      this.progress = 1;
      if (field) {
        this.field = field;
        this.sig = sig;
        this.version++;
      }
      return field;
    });
    return this.building;
  }
}
