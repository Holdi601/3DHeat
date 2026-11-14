/**
 * The box a dataset's rows lie in (`Dataset.bounds`), for the camera, grid and
 * floor, robust to a recorder's garbage. Worked out once in the load
 * (`builder.ts`).
 */

/** A coordinate past this is a recorder's garbage, not a place (DCS writes the odd missile at 1e20 m; `overlay/lean/scan.ts`). */
const FAR = 1e9;
/** Rows sampled for where most of the data lies. */
const EXTENT_SAMPLE = 65536;
/** How far past where nearly all of it lies (in its own widths) a row still counts. */
const EXTENT_REACH = 10;

/**
 * The box the rows lie in, for the camera, grid and floor: every row with a
 * real place, so nothing real is cut off. A non-finite or absurd coordinate
 * (past `FAR`) is no place; and a row far out beyond where nearly all lie
 * (more than `EXTENT_REACH` times the width of the middle 98% past it, the
 * widest axis's width at least) is a stray one too. The rows stay; only the
 * box leaves them out.
 */
export function extentOf(px: ArrayLike<number>, py: ArrayLike<number>, pz: ArrayLike<number>, n: number, b: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }): void {
  const ok = (v: number) => v > -FAR && v < FAR;
  const step = Math.max(1, Math.floor(n / EXTENT_SAMPLE));
  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[] = [];
  for (let i = 0; i < n; i += step) {
    if (!ok(px[i]) || !ok(py[i]) || !ok(pz[i])) continue;
    xs.push(px[i]);
    ys.push(py[i]);
    zs.push(pz[i]);
  }
  const lo = [-FAR, -FAR, -FAR];
  const hi = [FAR, FAR, FAR];
  if (xs.length) {
    const qs = [xs, ys, zs].map((a) => {
      const s = Float64Array.from(a).sort();
      return [s[Math.floor((s.length - 1) * 0.01)], s[Math.ceil((s.length - 1) * 0.99)]];
    });
    const widest = Math.max(...qs.map(([a, c]) => c - a));
    qs.forEach(([a, c], k) => {
      const reach = EXTENT_REACH * Math.max(c - a, widest, 1e-6);
      lo[k] = Math.max(-FAR, a - reach);
      hi[k] = Math.min(FAR, c + reach);
    });
  }
  for (let i = 0; i < n; i++) {
    const x = px[i];
    const y = py[i];
    const z = pz[i];
    if (!(x >= lo[0] && x <= hi[0] && y >= lo[1] && y <= hi[1] && z >= lo[2] && z <= hi[2])) continue;
    if (x < b.minX) b.minX = x;
    if (x > b.maxX) b.maxX = x;
    if (y < b.minY) b.minY = y;
    if (y > b.maxY) b.maxY = y;
    if (z < b.minZ) b.minZ = z;
    if (z > b.maxZ) b.maxZ = z;
  }
}
