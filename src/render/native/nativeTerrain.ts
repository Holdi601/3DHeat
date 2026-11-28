/**
 * A tiled terrain for the native viewport (Stage 5): what `GpuTerrain` and `GpuBoxes` upload on
 * WebGPU, sent over `viewport_level` (one after the other with the level's messages), and what a
 * frame draws, in the packet's `SECTION.terrain`.
 *
 * - `LEVEL_TERRAIN`: side, layers, the node grid's vertex floats and index count, the unit cube's
 *   vertex floats and index count, then the palette (64 floats), the grid (vertices, u32 indices)
 *   and the cube (vertices, u32 indices); side 0: no terrain (its tiles and boxes go);
 * - `LEVEL_TERRAIN_TILE`: a layer, its heights (u16, padded to a word) and classes (u8, padded);
 * - `LEVEL_BOXES`: a cell's id, its object count and `BOX_FLOATS` floats each; count 0 lets the
 *   cell go (id `0xffffffff`: every cell).
 *
 * The frame section: the node count, 0/1 for the classes' colours, the nodes (`INSTANCE_FLOATS`
 * each), then the cells in view (count, ids) - culled here as `GpuBoxes.inView` does.
 */
import { nodeGrid } from '../../world/terrainLod';
import { BOX_FLOATS, unitCube, type TerrainBoxes } from '../../world/terrainObjects';
import { INSTANCE_FLOATS, UPLOADS_PER_FRAME, type TerrainStream } from '../../world/terrainStream';
import { boxOutsideFrustum, frustumPlanes } from '../worldTiles';
import type { FrameParams } from '../types';
import type { PacketWriter } from './framePacket';

export const LEVEL_TERRAIN = 5;
export const LEVEL_TERRAIN_TILE = 6;
export const LEVEL_BOXES = 7;

/** Tile layers held, at most (`GpuTerrain`'s `MAX_LAYERS`). */
export const TERRAIN_LAYERS = 256;
/** Box instance bytes sent a frame, at most (one cell always), as `GpuBoxes` writes them. */
const BOX_BYTES = 1024 * 1024;

export class NativeTerrain {
  private stream: TerrainStream | null = null;
  private readonly held = new Map<string, { src: TerrainBoxes; id: number }>();
  private queue: TerrainBoxes[] = [];
  private version = -1;
  private nextId = 1;
  private readonly planes = new Float32Array(24);

  constructor(private readonly send: (bytes: Uint8Array) => void) {}

  /** Before the frame's packet: the stream taken on (or let go), its tiles and cells that arrived. */
  prepare(p: FrameParams): void {
    const t = p.level?.kind === 'model' ? (p.terrain ?? null) : null;
    const st = t?.stream ?? null;
    if (st !== this.stream) {
      this.stream = st;
      this.held.clear();
      this.queue = [];
      this.version = -1;
      this.send(st ? begin(st) : new Uint8Array(new Uint32Array([LEVEL_TERRAIN, 0, 0, 0, 0, 0, 0]).buffer));
      st?.attach(TERRAIN_LAYERS);
    }
    if (!st) return;
    const side = st.side;
    const pad = (n: number) => Math.ceil(n / 4) * 4;
    for (const up of st.takeUploads(UPLOADS_PER_FRAME)) {
      const hb = pad(side * side * 2);
      const out = new Uint8Array(8 + hb + pad(side * side));
      new Uint32Array(out.buffer, 0, 2).set([LEVEL_TERRAIN_TILE, up.slot]);
      out.set(new Uint8Array(up.heights.buffer, up.heights.byteOffset, side * side * 2), 8);
      out.set(up.classes.subarray(0, side * side), 8 + hb);
      this.send(out);
    }
    // `GpuBoxes.sync`: the cells gone let go at once, the new ones sent a megabyte a frame.
    if (st.boxVersion !== this.version) {
      this.version = st.boxVersion;
      const want = new Map(st.boxes.map((s) => [s.id, s]));
      for (const [key, h] of this.held) {
        if (want.get(key) === h.src) continue;
        this.held.delete(key);
        this.send(new Uint8Array(new Uint32Array([LEVEL_BOXES, h.id, 0]).buffer));
      }
      this.queue = st.boxes.filter((s) => !this.held.has(s.id) && s.count > 0);
    }
    let sent = 0;
    while (this.queue.length && (sent === 0 || sent < BOX_BYTES)) {
      const s = this.queue.shift()!;
      const id = this.nextId;
      this.nextId = this.nextId >= 0xfffffffe ? 1 : this.nextId + 1;
      const out = new Uint8Array(12 + s.count * BOX_FLOATS * 4);
      new Uint32Array(out.buffer, 0, 3).set([LEVEL_BOXES, id, s.count]);
      new Float32Array(out.buffer, 12, s.count * BOX_FLOATS).set(s.instances.subarray(0, s.count * BOX_FLOATS));
      this.send(out);
      this.held.set(s.id, { src: s, id });
      sent += s.instances.byteLength;
    }
    // More cells to send: the next frame is wanted even with the camera still.
    if (this.queue.length) st.onChange?.();
  }

  /** The frame's nodes and the cells in view, when there is a terrain. */
  write(w: PacketWriter, p: FrameParams, section: number): void {
    const t = p.level?.kind === 'model' ? (p.terrain ?? null) : null;
    if (!t || t.stream !== this.stream) return;
    const f = t.frame;
    w.open(section);
    w.word(f.count);
    w.word(t.colours ? 1 : 0);
    w.reserveFloats(f.count * INSTANCE_FLOATS).set(f.instances.subarray(0, f.count * INSTANCE_FLOATS));
    frustumPlanes(p.viewProj, this.planes);
    const ids: number[] = [];
    for (const h of this.held.values()) if (!boxOutsideFrustum(this.planes, h.src.bounds)) ids.push(h.id);
    w.word(ids.length);
    for (const id of ids) w.word(id);
    w.close();
  }
}

function begin(st: TerrainStream): Uint8Array {
  const g = nodeGrid();
  const c = unitCube();
  const words = 7 + 64 + g.vertices.length + g.indices.length + c.vertices.length + c.indices.length;
  const buf = new ArrayBuffer(words * 4);
  const u = new Uint32Array(buf);
  const f = new Float32Array(buf);
  u.set([LEVEL_TERRAIN, st.side, TERRAIN_LAYERS, g.vertices.length, g.indices.length, c.vertices.length, c.indices.length]);
  let at = 7;
  f.set(st.palette.subarray(0, 64), at);
  at += 64;
  f.set(g.vertices, at);
  at += g.vertices.length;
  u.set(g.indices, at);
  at += g.indices.length;
  f.set(c.vertices, at);
  at += c.vertices.length;
  u.set(c.indices, at);
  return new Uint8Array(buf);
}
