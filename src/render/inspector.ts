import { useInspectStore, type PickedSurface } from '../state/inspectStore';
import type { Dataset } from '../state/types';
import { mapQuadFromAnchors, type Level, type ModelLevel } from './level';
import {
  buildSurfaceIndex,
  nearestDrawnRow,
  nearestPoint,
  partByBounds,
  partOfTriangle,
  raycastSurface,
  type DrawnRows,
  type Ray,
  type ScreenSpace,
  type SurfaceIndex,
} from './pick';
import { rowLookDirection, type Vec3 } from './pose';
import { raycastTiles, type TileHit } from './tilePick';
import type { WorldTile } from '../world/tileSet';
import { t } from '../i18n';

/**
 * Pick radius around a click, in CSS pixels: "a few pixels", wide enough to hit
 * a sample without pixel-hunting and narrow enough that in a dense field the
 * nearest one is still the one under the pointer.
 */
export const PICK_RADIUS_PX = 8;

/** Rows past which the scan says it is working rather than leaving the click unanswered. */
const ANNOUNCE_SCAN_ROWS = 4_000_000;

/** Everything a click is answered against, captured at the moment of the click. */
export interface PickContext {
  /** CSS pixels on the canvas. */
  click: { x: number; y: number };
  /** The click's ray, world space. */
  ray: Ray;
  /** The camera, world space. */
  eye: Vec3;
  screen: ScreenSpace;
  /** Size of one CSS pixel at distance t along the ray, world units. */
  worldPerPixel: (t: number) => number;
  dataset: Dataset | null;
  /** The heat rows drawn last frame; null when no heat is drawn. */
  drawn: DrawnRows | null;
  /** The box replay's boxes, when that is what is drawn. */
  cubes: { data: Float32Array; stride: number; count: number; rows: Int32Array; size: number } | null;
  level: Level | null;
  /** Whether the view draws the level at a point: the slice and the distance cull. */
  accept: ((x: number, y: number, z: number) => boolean) | null;
}

/**
 * Runs a slice generator a few milliseconds at a time, handing the thread back
 * between slices. Resolves null when `cancelled` turns true first.
 */
function runSliced<T>(
  gen: Generator<unknown, T, void>,
  cancelled: () => boolean,
  onYield?: (v: unknown) => void,
  budgetMs = 10,
): Promise<T | null> {
  return new Promise((resolve) => {
    const step = () => {
      if (cancelled()) {
        resolve(null);
        return;
      }
      const until = performance.now() + budgetMs;
      for (;;) {
        const r = gen.next();
        if (r.done) {
          resolve(r.value);
          return;
        }
        onYield?.(r.value);
        if (performance.now() >= until) break;
      }
      setTimeout(step, 0);
    };
    step();
  });
}

/** The level's indexes: what is drawn, and the navigation mesh, which is not. */
interface LevelIndex {
  main: SurfaceIndex;
  nav: SurfaceIndex | null;
}

/** Both indexes, built one after the other, progress over the pair. */
function* buildLevelIndex(level: ModelLevel): Generator<{ fraction: number }, LevelIndex, void> {
  const sets = [
    { name: 'ground' as const, indices: level.indices },
    { name: 'structure' as const, indices: level.structureIndices ?? new Uint32Array(0) },
    { name: 'water' as const, indices: level.waterIndices ?? new Uint32Array(0) },
  ];
  const nav = level.navIndices ?? new Uint32Array(0);
  const share = level.indices.length + (level.structureIndices?.length ?? 0) + (level.waterIndices?.length ?? 0);
  const k = share / Math.max(1, share + nav.length);
  const main = buildSurfaceIndex(level.vertices, sets);
  for (;;) {
    const r = main.next();
    if (r.done) {
      if (nav.length === 0) return { main: r.value, nav: null };
      const navGen = buildSurfaceIndex(level.vertices, [{ name: 'nav', indices: nav }]);
      for (;;) {
        const n = navGen.next();
        if (n.done) return { main: r.value, nav: n.value };
        yield { fraction: k + (1 - k) * n.value.fraction };
      }
    }
    yield { fraction: k * r.value.fraction };
  }
}

/**
 * Answers clicks: the drawn sample under the pointer, or failing that the
 * surface of the level, written to the inspect store for the pick card.
 *
 * The level's index is built the first time a click needs it, in slices of a
 * few milliseconds between frames - the test level's nine million triangles
 * take a couple of seconds that way, against a hitch of over a second built in
 * one go - and kept until the level changes. While it builds, the card says
 * so, and the click is answered when it is ready.
 */
export class Inspector {
  /** Where the marker is drawn, world space; null for none. */
  marker: Vec3 | null = null;
  private level: Level | null = null;
  /**
   * The streamed world tiles drawn with the level (src/world/tileSet), as the
   * renderer was last handed them. Each is indexed on its own when a ray first
   * comes near it (src/render/tilePick), so the set changing costs nothing here.
   */
  private tiles: readonly WorldTile[] = [];
  private index: LevelIndex | null = null;
  private building: Promise<LevelIndex | null> | null = null;
  private buildFraction = 0;
  private buildToken = 0;
  private pickId = 0;

  /** Follow the level in the store; a new one drops the old index and any surface pick on it. */
  setLevel(level: Level | null): void {
    if (level === this.level) return;
    this.level = level;
    this.index = null;
    this.building = null;
    this.buildToken++;
    const pick = useInspectStore.getState().pick;
    if (pick && pick.kind !== 'data') this.clear();
  }

  /** Follow the world tiles the renderer draws; a surface pick already made stays, as it does when the camera moves. */
  setTiles(tiles: readonly WorldTile[]): void {
    this.tiles = tiles;
  }

  /** Drop a pick that refers to a dataset no longer loaded. */
  setDataset(dataset: Dataset | null): void {
    const pick = useInspectStore.getState().pick;
    if (pick?.dataset && pick.dataset !== dataset) this.clear();
  }

  clear(): void {
    this.pickId++;
    this.marker = null;
    useInspectStore.getState().setPick(null);
  }

  /** How the level's index stands: absent, being built (0..1), or ready. */
  get surfaceState(): { ready: boolean; building: boolean; fraction: number } {
    return { ready: !!this.index, building: !!this.building && !this.index, fraction: this.buildFraction };
  }

  async pick(ctx: PickContext): Promise<void> {
    const id = ++this.pickId;
    const stale = () => id !== this.pickId;
    const store = useInspectStore.getState();

    // ---- a drawn sample, which wins over the surface behind it
    const ds = ctx.dataset;
    let found: { row: number; point: Vec3 } | null = null;
    if (ds && ctx.cubes && ctx.cubes.count > 0) {
      const c = ctx.cubes;
      // A box is bigger than a few pixels up close: anywhere on it counts.
      const hit = nearestPoint(ctx.screen, ctx.click, c.data, c.stride, c.count, (w) =>
        Math.max(PICK_RADIUS_PX, (c.size * 0.6) / Math.max(1e-9, ctx.worldPerPixel(w))),
      );
      if (hit) {
        const o = hit.index * c.stride;
        found = { row: c.rows[hit.index], point: { x: c.data[o], y: c.data[o + 1], z: c.data[o + 2] } };
      }
    } else if (ds && ctx.drawn && ctx.drawn.rowHi > ctx.drawn.rowLo) {
      if (ctx.drawn.rowHi - ctx.drawn.rowLo > ANNOUNCE_SCAN_ROWS) {
        store.setPick({ id, kind: 'pending', point: null, distance: 0, progress: null });
      }
      const r = await runSliced(
        nearestDrawnRow(ds, ctx.drawn, ctx.screen, ctx.click, ctx.ray, ctx.worldPerPixel, PICK_RADIUS_PX),
        stale,
      );
      if (stale()) return;
      if (r) found = { row: r.row, point: r.point };
    }
    if (found && ds) {
      const look = ds.yaw ? rowLookDirection(ds.yaw[found.row], ds.pitch ? ds.pitch[found.row] : 0) : null;
      this.marker = found.point;
      store.setPick({
        id,
        kind: 'data',
        point: found.point,
        distance: distance(ctx.eye, found.point),
        row: found.row,
        dataset: ds,
        look,
      });
      return;
    }

    // ---- the level
    const level = ctx.level;
    if (level?.kind === 'image') {
      const q = mapQuadFromAnchors(level);
      const d = ctx.ray.dir;
      const o = ctx.ray.origin;
      const t = Math.abs(d.y) > 1e-12 ? (q.y - o.y) / d.y : -1;
      if (!q.degenerate && t > 0) {
        const p = { x: o.x + d.x * t, y: q.y, z: o.z + d.z * t };
        if (p.x >= q.minX && p.x <= q.maxX && p.z >= q.minZ && p.z <= q.maxZ && (!ctx.accept || ctx.accept(p.x, p.y, p.z))) {
          this.publishSurface(id, ctx, p, { part: level.name, cls: 'map', approximate: false });
          return;
        }
      }
    } else if (level?.kind === 'model') {
      if (!this.index) {
        store.setPick({ id, kind: 'pending', point: null, distance: 0, progress: this.buildFraction });
      }
      const index = await this.ensureIndex(level, (f) => {
        const cur = useInspectStore.getState().pick;
        if (!stale() && cur?.id === id && cur.kind === 'pending') {
          useInspectStore.getState().setPick({ ...cur, progress: f });
        }
      });
      if (stale() || !index || level !== this.level) return;
      const hit = raycastSurface(index.main, level.vertices, ctx.ray, Infinity, ctx.accept);
      // The world tiles round a streamed theatre are drawn with the level, so a
      // click meets whichever of the two is nearer.
      const tile = raycastTiles(this.tiles, ctx.ray, hit ? hit.t : Infinity, ctx.accept);
      if (tile) {
        this.publishSurface(id, ctx, tile.point, tileSurface(tile));
        return;
      }
      if (hit) {
        const surface = this.nameSurface(level, index.main, hit.set, hit.triangle, hit.point);
        surface.nav = this.navAt(level, index.nav, ctx, hit.t);
        this.publishSurface(id, ctx, hit.point, surface);
        return;
      }
    }

    // Nothing under the pointer: the click closes the card, as a click on empty
    // space closes any popup.
    if (!stale()) this.clear();
  }

  private publishSurface(id: number, ctx: PickContext, point: Vec3, surface: PickedSurface): void {
    this.marker = point;
    useInspectStore.getState().setPick({ id, kind: 'surface', point, distance: distance(ctx.eye, point), surface });
  }

  /**
   * Whether the navigation mesh lies where the ray met the surface: within a
   * few centimetres of it, or a hundredth of the distance, whichever is more -
   * a nav mesh floats a little over the ground it was generated from.
   */
  private navAt(level: ModelLevel, nav: SurfaceIndex | null, ctx: PickContext, t: number): PickedSurface['nav'] {
    if (!nav) return null;
    const runs = level.partRuns?.nav ?? null;
    const names = level.partNames ?? [];
    const near = raycastSurface(nav, level.vertices, ctx.ray, t + Math.max(0.3, t * 0.01));
    const walkable = !!near && Math.abs(near.t - t) <= Math.max(0.3, t * 0.01);
    const part = near ? partOfTriangle(runs, near.triangle) : partOfTriangle(runs, 0);
    return { part: part >= 0 && part < names.length ? names[part] : 'nav', walkable };
  }

  private nameSurface(level: ModelLevel, index: SurfaceIndex, set: number, triangle: number, p: Vec3): PickedSurface {
    const cls = index.sets[set].name as PickedSurface['cls'] & ('ground' | 'structure' | 'water');
    const names = level.partNames ?? [];
    const runs = level.partRuns?.[cls];
    const part = partOfTriangle(runs, triangle);
    if (part >= 0 && part < names.length) return { part: names[part], cls, approximate: false };
    if (!runs) {
      const b = level.bounds;
      const slack = Math.hypot(b.maxX - b.minX, b.maxY - b.minY, b.maxZ - b.minZ) * 0.002;
      const guess = partByBounds(level.partBounds, level.partClasses, cls, p, slack);
      if (guess >= 0 && guess < names.length) return { part: names[guess], cls, approximate: true };
    }
    return { part: null, cls, approximate: false };
  }

  /** The level's index, building it in slices if it is not there yet. */
  /**
   * The level's surface along a ray, at once, for the tactics board: the hit
   * when the index is built, null otherwise - and the index is started then, so
   * the next frames have it. An image level is its map plane.
   */
  surfaceHit(ray: { origin: Vec3; dir: Vec3 }): Vec3 | null {
    const level = this.level;
    if (level?.kind === 'image') {
      const q = mapQuadFromAnchors(level);
      const t = Math.abs(ray.dir.y) > 1e-12 ? (q.y - ray.origin.y) / ray.dir.y : -1;
      return t > 0 ? { x: ray.origin.x + ray.dir.x * t, y: q.y, z: ray.origin.z + ray.dir.z * t } : null;
    }
    if (level?.kind !== 'model') return null;
    let hit: { t: number; point: Vec3 } | null = null;
    if (this.index) hit = raycastSurface(this.index.main, level.vertices, ray, Infinity, null);
    // Started once; the frames that ask meanwhile get the world tiles, which
    // need no index over the whole set, or the ground plane.
    else if (!this.building) this.ensureIndex(level, () => {}).catch(() => undefined);
    const tile = raycastTiles(this.tiles, ray, hit ? hit.t : Infinity, null);
    return (tile ?? hit)?.point ?? null;
  }

  private ensureIndex(level: ModelLevel, onProgress: (f: number) => void): Promise<LevelIndex | null> {
    if (this.index && this.level === level) return Promise.resolve(this.index);
    if (!this.building) {
      const token = this.buildToken;
      this.buildFraction = 0;
      this.building = runSliced(
        buildLevelIndex(level),
        () => token !== this.buildToken,
        (v) => {
          this.buildFraction = (v as { fraction: number }).fraction;
        },
      ).then((index) => {
        if (token !== this.buildToken) return null;
        this.index = index;
        this.building = null;
        return index;
      });
    }
    // Progress for whoever is waiting, on the frame clock rather than per slice.
    const building = this.building;
    let done = false;
    const tick = () => {
      if (done) return;
      onProgress(this.buildFraction);
      setTimeout(tick, 150);
    };
    tick();
    return building.then((index) => {
      done = true;
      return index;
    });
  }
}

/**
 * What a click on a world tile names. The tiles carry no source parts - each is
 * a piece of the earth, not of a level - so the part is the backdrop itself and
 * the kind is the triangle set hit: ground, building or water.
 */
function tileSurface(hit: TileHit): PickedSurface {
  return { part: t('heat.world.button'), cls: hit.cls, approximate: false, nav: null };
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}
