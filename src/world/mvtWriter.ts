/**
 * A minimal vector tile writer: just enough protobuf to build tiles by hand,
 * for the tests of the reader and the backdrop builder. The viewer itself only
 * reads tiles (mvt.ts).
 */

export function varint(v: number): number[] {
  const out: number[] = [];
  while (v >= 0x80) {
    out.push((v % 128) | 0x80);
    v = Math.floor(v / 128);
  }
  out.push(v);
  return out;
}

export const zigzag = (v: number) => (v < 0 ? -2 * v - 1 : 2 * v);
export const key = (field: number, wire: number) => varint(field * 8 + wire);
export const bytes = (field: number, b: number[]) => [...key(field, 2), ...varint(b.length), ...b];
export const str = (field: number, s: string) => bytes(field, [...new TextEncoder().encode(s)]);
export const uint = (field: number, v: number) => [...key(field, 0), ...varint(v)];
export const packed = (field: number, vs: number[]) => bytes(field, vs.flatMap(varint));

export function double(field: number, v: number): number[] {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setFloat64(0, v, true);
  return [...key(field, 1), ...b];
}

export function float(field: number, v: number): number[] {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setFloat32(0, v, true);
  return [...key(field, 5), ...b];
}

/** Drawing commands for parts: each MoveTo, then LineTo the rest, ClosePath for rings. */

export function commands(parts: number[][], close: boolean): number[] {
  const out: number[] = [];
  let x = 0;
  let y = 0;
  for (const p of parts) {
    const n = p.length / 2;
    out.push((1 & 7) | (1 << 3), zigzag(p[0] - x), zigzag(p[1] - y));
    x = p[0];
    y = p[1];
    if (n > 1) {
      out.push((2 & 7) | ((n - 1) << 3));
      for (let i = 1; i < n; i++) {
        out.push(zigzag(p[i * 2] - x), zigzag(p[i * 2 + 1] - y));
        x = p[i * 2];
        y = p[i * 2 + 1];
      }
    }
    if (close) out.push((7 & 7) | (1 << 3));
  }
  return out;
}

export function feature(id: number, type: number, tags: number[], geometry: number[]): number[] {
  return [...uint(1, id), ...packed(2, tags), ...uint(3, type), ...packed(4, geometry)];
}

export function layer(name: string, features: number[][], keys: string[], values: number[][], extent = 4096): number[] {
  return [
    ...uint(15, 2),
    ...str(1, name),
    ...features.flatMap((f) => bytes(2, f)),
    ...keys.flatMap((k) => str(3, k)),
    ...values.flatMap((v) => bytes(4, v)),
    ...uint(5, extent),
  ];
}
