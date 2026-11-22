/**
 * Rows where heat tiles run out of detail (Stage 6): zoomed in past the
 * pyramid's leaf - the cells coarser than the sprite (`SWITCH_IN_CELLS` cells
 * a radius, where the parity probe sees the rows' detail go) - and with the
 * ground in view holding few enough rows to load, the rows of that ground are
 * loaded (the view grown by half each way, on leaf cell edges) and drawn in
 * place of the tiles there; zoomed out again, or the view off that ground,
 * the tiles come back.
 *
 * No pop: the rows go into the store as a dataset that changes nothing else
 * (`setDataset(..., { keepView })`: same sprite, exposure, camera, sides), and
 * once they are on the GPU the engine fades the tiles' cells inside the window
 * out and the rows in over `ROW_FADE_MS`, every fading frame drawn whole; the
 * tiles outside the window stay, so the edge is seamless. Leaving fades back
 * before the rows are let go.
 *
 * The rows' groups are put in the pyramid's channel order, so team colours and
 * the default sides of the difference are the same in both.
 */

import type { ColumnMapping, Dataset } from '../../state/types';
import type { RowFilterClause } from '../../data/rowFilter';
import { TILE } from './tileFormat';
import { ROW_FADE_MS, type HeatTileSource } from './source';

/** Fewer cells than this a sprite radius: rows show detail the tiles do not hold. */
export const SWITCH_IN_CELLS = 2;
/** Back to tiles past this (hysteresis: no flapping at the edge). */
export const SWITCH_OUT_CELLS = 3;
/** Rows a window may load at most, whatever the memory would take: a load of seconds, not minutes. */
export const WINDOW_MAX_ROWS = 8e6;

export interface RowWindowPick {
  files: File[];
  mapping: ColumnMapping;
  columns: string[];
  /** The x / y columns the pyramid is over. */
  x: string;
  y: string;
  /** Rows the memory budget takes (the window loads at most this and `WINDOW_MAX_ROWS`). */
  maxRows: number;
}

/** What loads the rows and hands them to the store: the app's loader and store, or a test's. */
export interface RowWindowHost {
  ingest(files: File[], mapping: ColumnMapping, columns: string[], expectedRows: number): Promise<Dataset>;
  dataset(): Dataset | null;
  setDataset(d: Dataset | null): void;
}

export type RowWindowState = 'tiles' | 'loading' | 'rows' | 'leaving';

/** `view` (world X / Z min, max) grown by half each way, on the leaf's cell edges, within the pyramid's square: in data (u0, v0, u1, v1) and world. */
export function windowRect(src: Pick<HeatTileSource, 'info' | 'placement'>, view: readonly number[]): { data: [number, number, number, number]; world: [number, number, number, number] } | null {
  const info = src.info;
  if (!info) return null;
  const { sx, sz } = src.placement;
  const gx = (view[2] - view[0]) / 2;
  const gz = (view[3] - view[1]) / 2;
  const u = [(view[0] - gx) / sx, (view[2] + gx) / sx].sort((a, b) => a - b);
  const v = [(view[1] - gz) / sz, (view[3] + gz) / sz].sort((a, b) => a - b);
  const n = TILE << info.leafLevel;
  const cell = info.size / n;
  const snap = (a: number, lo: number, up: boolean) => {
    const c = (up ? Math.ceil : Math.floor)((a - lo) / cell);
    return lo + Math.min(n, Math.max(0, c)) * cell;
  };
  const u0 = snap(u[0], info.x0, false);
  const u1 = snap(u[1], info.x0, true);
  const v0 = snap(v[0], info.y0, false);
  const v1 = snap(v[1], info.y0, true);
  if (!(u1 > u0 && v1 > v0)) return null;
  const a = [sx * u0, sx * u1].sort((p, q) => p - q);
  const b = [sz * v0, sz * v1].sort((p, q) => p - q);
  return { data: [u0, v0, u1, v1], world: [a[0], b[0], a[1], b[1]] };
}

/**
 * The window's rows' groups in the pyramid's channel order (named channels
 * first, every name present even without rows, any other group after them),
 * so a group has the same id - its colour, its side - in rows and tiles.
 */
export function alignGroups(ds: Dataset, names: readonly string[], other: boolean): void {
  const named = (other ? names.slice(0, -1) : names).filter((n) => n !== '');
  if (!ds.teamId || named.length === 0) return;
  const labels = [...named, ...ds.teamLabels.filter((l) => !named.includes(l))];
  const to = ds.teamLabels.map((l) => labels.indexOf(l));
  const ids = ds.teamId;
  for (let i = 0; i < ids.length; i++) ids[i] = to[ids[i]];
  if (ds.teamSizes) {
    const sizes = new Uint32Array(labels.length);
    ds.teamSizes.forEach((v, i) => (sizes[to[i]] = v));
    ds.teamSizes = sizes;
  }
  if (ds.personTeam) for (let i = 0; i < ds.personTeam.length; i++) ds.personTeam[i] = to[ds.personTeam[i]];
  ds.teamLabels = labels;
}

export class RowWindow {
  state: RowWindowState = 'tiles';
  /** Rows the last window loaded (0 while none). */
  rows = 0;
  private gen = 0;
  private disposed = false;

  constructor(
    private readonly src: HeatTileSource,
    private readonly pick: RowWindowPick,
    private readonly host: RowWindowHost,
  ) {}

  /** A few times a second (tileHeat.ts): switch to rows, or back, when the view says so. */
  tick(now = performance.now()): void {
    if (this.disposed) return;
    const src = this.src;
    const info = src.info;
    const w = src.window;
    if (this.state === 'leaving') {
      if (!w || w.done || this.host.dataset() !== w.dataset) this.drop();
      return;
    }
    if (this.state === 'loading' || !info?.complete) return;
    const view = src.stats.viewRect;
    if (this.state === 'rows') {
      // Someone else's rows now (a Load): theirs; the tiles draw whole again.
      if (!w || this.host.dataset() !== w.dataset) {
        src.window = null;
        this.state = 'tiles';
        this.rows = 0;
        return;
      }
      const inside = !!view && view[0] >= w.rect[0] && view[1] >= w.rect[1] && view[2] <= w.rect[2] && view[3] <= w.rect[3];
      if (src.stats.radiusCells >= SWITCH_OUT_CELLS || !inside) {
        // Fade back from where the fade in got to.
        const a = w.t0 < 0 ? 0 : Math.min(1, (now - w.t0) / ROW_FADE_MS);
        w.dir = 'out';
        w.t0 = now - (1 - a) * ROW_FADE_MS;
        w.done = false;
        this.state = 'leaving';
      }
      return;
    }
    // Rows of a load are never replaced.
    if (this.host.dataset()) return;
    if (!(src.stats.radiusCells < SWITCH_IN_CELLS) || !view || !(view[2] > view[0] && view[3] > view[1])) return;
    const r = windowRect(src, view);
    if (!r) return;
    const rows = src.rowsIn(r.world);
    if (rows === null || rows > Math.min(WINDOW_MAX_ROWS, this.pick.maxRows)) return;
    void this.load(r, rows);
  }

  private async load(r: { data: [number, number, number, number]; world: [number, number, number, number] }, rows: number): Promise<void> {
    const gen = ++this.gen;
    this.state = 'loading';
    const [u0, v0, u1, v1] = r.data;
    const m = this.pick.mapping;
    const window: RowFilterClause[] = [
      { column: this.pick.x, kind: 'range', min: u0, max: u1 },
      { column: this.pick.y, kind: 'range', min: v0, max: v1 },
    ];
    // Positions and groups only: no timeline (the tiles hold every row at once), no tracks.
    const mapping: ColumnMapping = {
      ...m,
      time: null,
      personId: null,
      sessionId: null,
      extra: [],
      byHand: [],
      onDemand: [],
      rowFilter: [...(m.rowFilter ?? []), ...window],
    };
    let ds: Dataset | null = null;
    try {
      ds = await this.host.ingest(this.pick.files, mapping, this.pick.columns, Math.round(rows));
    } catch {
      ds = null;
    }
    if (this.disposed || gen !== this.gen) return;
    const info = this.src.info;
    // Failed, or a load came first: tiles stay.
    if (!ds || !info || this.host.dataset()) {
      this.state = 'tiles';
      return;
    }
    alignGroups(ds, info.channelNames ?? [], !!info.otherChannel);
    // Before the store: the engine knows these rows for the tiles' when it sees them.
    this.src.window = { rect: r.world, dataset: ds, dir: 'in', t0: -1, done: false };
    this.rows = ds.count;
    this.state = 'rows';
    this.host.setDataset(ds);
  }

  private drop(): void {
    const w = this.src.window;
    this.src.window = null;
    this.state = 'tiles';
    this.rows = 0;
    if (w && this.host.dataset() === w.dataset) this.host.setDataset(null);
  }

  /** Tiles stopped: the window's rows let go with them. */
  dispose(): void {
    this.disposed = true;
    this.gen++;
    const w = this.src.window;
    this.src.window = null;
    if (w && this.host.dataset() === w.dataset) this.host.setDataset(null);
  }
}
