/**
 * Mapbox Vector Tiles (MVT 2.1), read without a dependency.
 *
 * A tile is a protocol buffer: layers, each with features, each feature a
 * geometry of drawing commands in tile units (0..extent, y down) and tags that
 * index into the layer's shared keys and values. Only reading is needed, and
 * only the handful of wire types the format uses, so the reader below is the
 * whole of protobuf this needs.
 *
 * Spec: https://github.com/mapbox/vector-tile-spec/tree/master/2.1
 */

/** A protobuf reader over one buffer: varints, fixed widths, lengths. */
export class Pbf {
  pos = 0;
  readonly end: number;
  private readonly view: DataView;

  constructor(
    readonly buf: Uint8Array,
    start = 0,
    end = buf.length,
  ) {
    this.pos = start;
    this.end = end;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  /** An unsigned varint, exact up to 2^53. */
  varint(): number {
    let result = 0;
    let shift = 1;
    for (let i = 0; i < 10; i++) {
      if (this.pos >= this.end) throw new Error('truncated varint');
      const b = this.buf[this.pos++];
      result += (b & 0x7f) * shift;
      if (b < 0x80) return result;
      shift *= 128;
    }
    throw new Error('varint too long');
  }

  /** A zigzag-encoded signed varint. */
  svarint(): number {
    const v = this.varint();
    return v % 2 === 1 ? (v + 1) / -2 : v / 2;
  }

  /** An int64 varint, two's complement for negatives (ten bytes, so read wide). */
  int64(): number {
    let r = 0n;
    let shift = 0n;
    for (let i = 0; i < 10; i++) {
      if (this.pos >= this.end) throw new Error('truncated varint');
      const b = this.buf[this.pos++];
      r |= BigInt(b & 0x7f) << shift;
      if (b < 0x80) return Number(BigInt.asIntN(64, r));
      shift += 7n;
    }
    throw new Error('varint too long');
  }

  fixed32Float(): number {
    const v = this.view.getFloat32(this.pos, true);
    this.pos += 4;
    return v;
  }

  fixed64Double(): number {
    const v = this.view.getFloat64(this.pos, true);
    this.pos += 8;
    return v;
  }

  /** The end of a length-delimited field that starts here. */
  lengthEnd(): number {
    const len = this.varint();
    const e = this.pos + len;
    if (e > this.end) throw new Error('truncated field');
    return e;
  }

  string(): string {
    const e = this.lengthEnd();
    const s = new TextDecoder('utf-8').decode(this.buf.subarray(this.pos, e));
    this.pos = e;
    return s;
  }

  /** Packed unsigned varints. */
  packed(): number[] {
    const e = this.lengthEnd();
    const out: number[] = [];
    while (this.pos < e) out.push(this.varint());
    return out;
  }

  skip(wire: number): void {
    if (wire === 0) this.varint();
    else if (wire === 1) this.pos += 8;
    else if (wire === 2) this.pos = this.lengthEnd();
    else if (wire === 5) this.pos += 4;
    else throw new Error(`unknown wire type ${wire}`);
  }

  /** Each field of the message up to `end`: the callback reads it, or it is skipped. */
  fields(end: number, read: (field: number, wire: number) => boolean): void {
    while (this.pos < end) {
      const key = this.varint();
      const field = Math.floor(key / 8);
      const wire = key & 7;
      const at = this.pos;
      if (!read(field, wire)) {
        this.pos = at;
        this.skip(wire);
      }
    }
  }
}

export type MvtValue = string | number | boolean;

/** Point, line or polygon, as the format numbers them. */
export const GEOM_POINT = 1;
export const GEOM_LINE = 2;
export const GEOM_POLYGON = 3;

export interface MvtFeature {
  id: number | null;
  type: number;
  props: Record<string, MvtValue>;
  /**
   * The geometry's parts in tile units, each a flat [x0, y0, x1, y1, ...]: one
   * per point, per line, or per polygon ring (without the closing point).
   */
  parts: number[][];
}

export interface MvtLayer {
  name: string;
  extent: number;
  features: MvtFeature[];
}

/** Every layer of a tile, by name. A gzipped tile must be inflated first (see `inflateIfGzip`). */
export function decodeTile(bytes: Uint8Array): Map<string, MvtLayer> {
  const pbf = new Pbf(bytes);
  const layers = new Map<string, MvtLayer>();
  pbf.fields(pbf.end, (field, wire) => {
    if (field !== 3 || wire !== 2) return false;
    const end = pbf.lengthEnd();
    const layer = readLayer(pbf, end);
    pbf.pos = end;
    // Two layers of one name are one layer split; keep both's features.
    const had = layers.get(layer.name);
    if (had) had.features.push(...layer.features);
    else layers.set(layer.name, layer);
    return true;
  });
  return layers;
}

function readLayer(pbf: Pbf, end: number): MvtLayer {
  let name = '';
  let extent = 4096;
  const keys: string[] = [];
  const values: MvtValue[] = [];
  // Features refer to keys and values that may come after them, so their
  // places are kept and they are read once the layer is.
  const raw: Array<[number, number]> = [];
  pbf.fields(end, (field, wire) => {
    if (field === 1 && wire === 2) name = pbf.string();
    else if (field === 2 && wire === 2) {
      const e = pbf.lengthEnd();
      raw.push([pbf.pos, e]);
      pbf.pos = e;
    } else if (field === 3 && wire === 2) keys.push(pbf.string());
    else if (field === 4 && wire === 2) values.push(readValue(pbf, pbf.lengthEnd()));
    else if (field === 5 && wire === 0) extent = pbf.varint();
    else return false;
    return true;
  });
  const features: MvtFeature[] = [];
  for (const [s, e] of raw) {
    pbf.pos = s;
    features.push(readFeature(pbf, e, keys, values));
  }
  return { name, extent, features };
}

function readValue(pbf: Pbf, end: number): MvtValue {
  let v: MvtValue = '';
  pbf.fields(end, (field, wire) => {
    if (field === 1 && wire === 2) v = pbf.string();
    else if (field === 2 && wire === 5) v = pbf.fixed32Float();
    else if (field === 3 && wire === 1) v = pbf.fixed64Double();
    else if (field === 4 && wire === 0) v = pbf.int64();
    else if (field === 5 && wire === 0) v = pbf.varint();
    else if (field === 6 && wire === 0) v = pbf.svarint();
    else if (field === 7 && wire === 0) v = pbf.varint() !== 0;
    else return false;
    return true;
  });
  pbf.pos = end;
  return v;
}

function readFeature(pbf: Pbf, end: number, keys: string[], values: MvtValue[]): MvtFeature {
  let id: number | null = null;
  let type = 0;
  let tags: number[] = [];
  let geometry: number[] = [];
  pbf.fields(end, (field, wire) => {
    if (field === 1 && wire === 0) id = pbf.varint();
    else if (field === 2 && wire === 2) tags = pbf.packed();
    else if (field === 3 && wire === 0) type = pbf.varint();
    else if (field === 4 && wire === 2) geometry = pbf.packed();
    else return false;
    return true;
  });
  pbf.pos = end;
  const props: Record<string, MvtValue> = {};
  for (let i = 0; i + 1 < tags.length; i += 2) {
    const k = keys[tags[i]];
    const v = values[tags[i + 1]];
    if (k !== undefined && v !== undefined) props[k] = v;
  }
  return { id, type, props, parts: decodeGeometry(geometry) };
}

/** Drawing commands into parts: MoveTo starts one, LineTo extends it, ClosePath ends a ring. */
export function decodeGeometry(cmds: number[]): number[][] {
  const parts: number[][] = [];
  let x = 0;
  let y = 0;
  let cur: number[] | null = null;
  let i = 0;
  const zz = (v: number) => (v % 2 === 1 ? (v + 1) / -2 : v / 2);
  while (i < cmds.length) {
    const c = cmds[i++];
    const id = c & 7;
    const count = c >>> 3;
    if (id === 1 || id === 2) {
      for (let k = 0; k < count && i + 1 < cmds.length; k++) {
        x += zz(cmds[i++]);
        y += zz(cmds[i++]);
        if (id === 1) {
          cur = [x, y];
          parts.push(cur);
        } else if (cur) cur.push(x, y);
      }
    } else if (id === 7) {
      cur = null;
    } else {
      break;
    }
  }
  return parts;
}

/**
 * Twice a ring's signed area, in tile units. Positive is an outer ring: the
 * format draws them clockwise on screen, which with y down is positive here.
 */
export function ringArea2(ring: number[]): number {
  let a = 0;
  const n = ring.length;
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    a += ring[i] * ring[j + 1] - ring[j] * ring[i + 1];
  }
  return a;
}

/** A polygon feature's rings as polygons: each outer ring with the holes after it. */
export function polygonsOf(parts: number[][]): Array<{ outer: number[]; holes: number[][] }> {
  const out: Array<{ outer: number[]; holes: number[][] }> = [];
  for (const ring of parts) {
    if (ring.length < 6) continue;
    const a = ringArea2(ring);
    if (a === 0) continue;
    if (a > 0) out.push({ outer: ring, holes: [] });
    else if (out.length) out[out.length - 1].holes.push(ring);
  }
  return out;
}

/** A tile's bytes, inflated when the server sent them gzipped without saying so. */
export async function inflateIfGzip(bytes: Uint8Array): Promise<Uint8Array> {
  if (bytes.length < 2 || bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes;
  const stream = new Blob([bytes.slice()]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
