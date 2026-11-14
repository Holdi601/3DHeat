import type { Dataset } from '../state/types';
import type { HeatSettings } from '../state/store';
import { useInspectStore } from '../state/inspectStore';
import { useDirectionStore } from '../state/directionStore';
import { useVolumeStore } from '../volumes/store';
import { exportTest } from '../volumes/export';
import { filterColumnData } from './filterTables';
import { rowDrawn, type DrawnRows } from './pick';
import type { DirectionDraw, Renderer } from './types';
import { curveSignature, evalCurve } from '../state/curve';
import {
  bearingOf,
  computeDirections,
  spotDirections,
  wedgeCentroid,
  wedgeUniforms,
  type DirectionData,
  type DirSource,
} from './direction';

/** A wedge sprite's cost against a disc's, at least: its vertex work does not shrink with it. */
const WEDGE_COST_FLOOR = 0.15;

/** Rows a scan handles between looks at the clock, about a millisecond's worth; it hands the thread back after a few. */
const YIELD_ROWS = 1 << 16;

/** What the controller needs from the engine. */
export interface DirectionHost {
  dataset(): Dataset | null;
  /** The rows the heat drew last frame, by the shaders' rules. */
  drawn(): DrawnRows | null;
  heat(): HeatSettings;
  /** Something changed that the picture should show. */
  invalidate(): void;
}

/**
 * Directional heat's state beside the engine: each row's bearing for the
 * current dataset and source, worked out off the frame path a slice at a time
 * and handed to the renderer; the wedge and field settings as the frame wants
 * them; and the directions at a clicked spot or in a volume.
 */
export class DirectionController {
  data: DirectionData | null = null;
  /** Bumped when the bearings change, for the heat's accumulation signature. */
  generation = 0;
  private key = '';
  private job = 0;
  private applied: { renderer: Renderer; data: DirectionData | null } | null = null;
  private wedgeKey = '';
  private wedge = { half: Math.PI, soft: 0, norm: 1, centroid: 0 };
  private scan = 0;
  private arrow: { data: Float32Array; count: number } | null = null;
  private merged: { base: unknown; arrow: unknown; out: { data: Float32Array; count: number } } | null = null;
  private readonly unsub: Array<() => void> = [];

  constructor(private readonly host: DirectionHost) {
    this.unsub.push(
      useInspectStore.subscribe((s, prev) => {
        if (s.pick !== prev.pick) this.onPick();
      }),
      useDirectionStore.subscribe((s, prev) => {
        if (s.volumeAsk !== prev.volumeAsk && s.volumeAsk) void this.volume(s.volumeAsk.id);
      }),
    );
  }

  /** Whether anything wants the bearings: a wedge, the field, or directions on click. */
  static wanted(h: HeatSettings): boolean {
    return h.wedgeOpening < 360 || h.dirField !== 'off' || h.dirOnClick;
  }

  /** Once a frame: start or finish working out the bearings, and hand them to the renderer. */
  update(renderer: Renderer): void {
    const ds = this.host.dataset();
    const h = this.host.heat();
    const want = ds !== null && DirectionController.wanted(h);
    const key = want ? `${ds!.id}|${ds!.count}|${h.dirSource}|${JSON.stringify(h.dirSourceBy)}` : '';
    if (key !== this.key) {
      this.key = key;
      this.data = null;
      this.generation++;
      useDirectionStore.getState().set({ counts: null, spot: null });
      const job = ++this.job;
      if (want) void this.compute(ds!, h.dirSource, h.dirSourceBy, job);
    }
    if (!this.applied || this.applied.renderer !== renderer || this.applied.data !== this.data) {
      renderer.setDirections?.(this.data ? this.data.angles : null);
      this.applied = { renderer, data: this.data };
    }
  }

  private async compute(ds: Dataset, source: DirSource, by: Record<string, DirSource>, job: number): Promise<void> {
    const data = await computeDirections(ds, source, { yieldRows: YIELD_ROWS, cancelled: () => job !== this.job, by });
    if (job !== this.job || !data) return;
    this.data = data;
    this.generation++;
    useDirectionStore.getState().set({ counts: { ...data.counts } });
    this.host.invalidate();
    // A click made while they were being worked out is answered now.
    this.onPick();
  }

  /** The heat pass's view of the settings; null when it draws discs and no field. */
  frame(dpr: number, now: number): DirectionDraw | null {
    const h = this.host.heat();
    if (!this.data) return null;
    const key = `${h.wedgeOpening}|${h.wedgeSoftness}|${h.centerIntensity}|${h.edgeIntensity}|${h.falloff}|${h.smoothRamp}|${h.useCurve ? curveSignature(h.curve) : ''}`;
    if (key !== this.wedgeKey) {
      this.wedgeKey = key;
      const w = wedgeUniforms(h.wedgeOpening, h.wedgeSoftness);
      // The sprite's radial ramp, as the splat shaders evaluate it.
      const ramp = (d: number) => {
        let t = h.useCurve ? evalCurve(h.curve, d) : Math.pow(1 - d, Math.max(0.01, h.falloff));
        if (!h.useCurve && h.smoothRamp) t = t * t * (3 - 2 * t);
        return h.edgeIntensity + (h.centerIntensity - h.edgeIntensity) * t;
      };
      this.wedge = { ...w, centroid: wedgeCentroid(w.half, w.soft, ramp) };
    }
    const field = h.dirField === 'arrows' ? 1 : h.dirField === 'streams' ? 2 : h.dirField === 'both' ? 3 : 0;
    if (field === 0 && this.wedge.half >= Math.PI) return null;
    return {
      ...this.wedge,
      field,
      cell: Math.max(8, h.dirFieldSpacing) * dpr,
      time: field & 2 && h.dirFieldAnimate ? (now / 1000) % 3600 : -1,
    };
  }

  /**
   * What one sprite costs against a disc's, for the sprite budget: a wedge
   * lights about its opening's share of the disc's pixels (it is drawn as its
   * own tight triangle), but never below WEDGE_COST_FLOOR, since its vertices
   * cost what a disc's do. The budget counts disc-sized sprites, so a narrow
   * wedge draws that many times more rows in the same GPU time - fewer, heavier
   * sprites are what makes a narrow wedge sparkle.
   */
  costShare(): number {
    const h = this.host.heat();
    if (!this.data || h.wedgeOpening >= 360) return 1;
    return Math.max(WEDGE_COST_FLOOR, Math.min(1, h.wedgeOpening / 360));
  }

  /** Whether the frame has to be redrawn every frame: flowing streamlines. */
  animating(): boolean {
    const h = this.host.heat();
    return this.data !== null && (h.dirField === 'streams' || h.dirField === 'both') && h.dirFieldAnimate;
  }

  /** For the heat's accumulation signature: what changes what the heat pass writes. */
  sig(): string {
    const h = this.host.heat();
    if (!this.data) return '';
    return `${this.generation}|${h.wedgeOpening}|${h.wedgeSoftness}|${h.dirField}|${h.dirFieldSpacing}|${this.wedge.centroid}`;
  }

  /** `base`'s lines and the clicked spot's resultant arrow, as one list. */
  top(base: { data: Float32Array; count: number } | null): { data: Float32Array; count: number } | null {
    const a = this.arrow;
    if (!a) return base;
    if (!base) return a;
    const m = this.merged;
    if (m && m.base === base && m.arrow === a) return m.out;
    const data = new Float32Array((base.count + a.count) * 7);
    data.set(base.data.subarray(0, base.count * 7));
    data.set(a.data.subarray(0, a.count * 7), base.count * 7);
    const out = { data, count: base.count + a.count };
    this.merged = { base, arrow: a, out };
    return out;
  }

  private onPick(): void {
    const pick = useInspectStore.getState().pick;
    if (!pick || !pick.point || pick.kind === 'pending') {
      if (!pick) this.clearSpot();
      return;
    }
    const ds = this.host.dataset();
    const drawn = this.host.drawn();
    if (!ds || !this.data || !drawn || !this.host.heat().dirOnClick) return;
    const h = this.host.heat();
    const p = pick.point;
    const radius = Math.max(1e-6, h.radius * 1.5);
    const r2 = radius * radius;
    const flat = h.groundProjected;
    const inside = (i: number) => {
      const dx = ds.px[i] - p.x;
      const dz = ds.pz[i] - p.z;
      const dy = flat ? 0 : ds.py[i] - p.y;
      return dx * dx + dy * dy + dz * dz <= r2;
    };
    void this.run(ds, drawn, inside, { id: pick.id, point: p, radius });
  }

  private async volume(id: string): Promise<void> {
    const ds = this.host.dataset();
    const drawn = this.host.drawn();
    if (!ds || !this.data || !drawn) return;
    const vols = useVolumeStore.getState().volumes;
    const v = vols.find((u) => u.id === id);
    if (!v) return;
    const test = exportTest(vols, id);
    await this.run(ds, drawn, (i) => test(ds.px[i], ds.py[i], ds.pz[i]), { id: -1, point: null, radius: 0, volume: v.name });
  }

  private async run(
    ds: Dataset,
    drawn: DrawnRows,
    inside: (i: number) => boolean,
    where: { id: number; point: { x: number; y: number; z: number } | null; radius: number; volume?: string },
  ): Promise<void> {
    const data = this.data!;
    const scan = ++this.scan;
    const resolved = drawn.filters.map((f) => ({ f, data: filterColumnData(ds, f.column) }));
    const split = drawn.splitColumn ? filterColumnData(ds, drawn.splitColumn) : null;
    const isDrawn = (i: number) => rowDrawn(ds, i, drawn, resolved, split);
    useDirectionStore.getState().set({ busy: true });
    const result = await spotDirections(ds, data, drawn.rowLo, drawn.rowHi, inside, isDrawn, {
      yieldRows: YIELD_ROWS,
      cancelled: () => scan !== this.scan,
    });
    if (scan !== this.scan) return;
    useDirectionStore.getState().set({ busy: false });
    if (!result) return;
    useDirectionStore.getState().set({ spot: { ...where, source: data.source, result } });
    // Drawn over the picture on every frame, idle ones too: nothing to invalidate.
    this.arrow = where.point && result.outgoing.n > 0 ? arrowLines(where.point, where.radius, result.outgoing.mean, result.outgoing.r) : null;
  }

  private clearSpot(): void {
    this.arrow = null;
    this.scan++;
    useDirectionStore.getState().set({ spot: null, busy: false });
  }

  dispose(): void {
    for (const u of this.unsub) u();
    this.job++;
    this.scan++;
  }
}

/**
 * The resultant arrow on the ground at a spot, as top lines (seven floats a
 * vertex): the mean bearing, as long as the spot is wide times the mean
 * resultant length, so a spot whose rows all point one way gets a full arrow
 * and one pointing every way a stub.
 */
export function arrowLines(p: { x: number; y: number; z: number }, radius: number, bearing: number, r: number): { data: Float32Array; count: number } {
  const len = Math.max(radius * 0.15, radius * 2 * r);
  const dx = Math.sin(bearing);
  const dz = -Math.cos(bearing);
  const tip = [p.x + dx * len, p.y, p.z + dz * len];
  const head = len * 0.3;
  const back = (side: number) => {
    const a = bearingOf(dx, dz) + Math.PI + side * 0.45;
    return [tip[0] + Math.sin(a) * head, p.y, tip[2] - Math.cos(a) * head];
  };
  const c = [1, 0.98, 0.9, 1];
  const ring: number[][] = [];
  const N = 32;
  for (let k = 0; k < N; k++) {
    const a0 = (k / N) * Math.PI * 2;
    const a1 = ((k + 1) / N) * Math.PI * 2;
    ring.push([p.x + Math.sin(a0) * radius, p.y, p.z - Math.cos(a0) * radius], [p.x + Math.sin(a1) * radius, p.y, p.z - Math.cos(a1) * radius]);
  }
  const segs: number[][] = [[p.x, p.y, p.z], tip, tip, back(1), tip, back(-1), ...ring];
  const data = new Float32Array(segs.length * 7);
  segs.forEach((v, i) => {
    data.set(v, i * 7);
    data.set(i < 6 ? c : [1, 1, 1, 0.45], i * 7 + 3);
  });
  return { data, count: segs.length };
}
