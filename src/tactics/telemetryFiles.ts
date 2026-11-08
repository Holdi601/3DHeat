/**
 * Match tables read for the board's telemetry: CS2 demo Parquet files, only
 * the columns needed, through the axis mapping their footer gives.
 */

import { parquetMetadataAsync } from 'hyparquet';
import { asyncBufferFromFile, readParquetColumns, type ColumnRequest } from '../data/parquet';
import { AIRBORNE, CROUCH, sideCode, TrackBuilder, WALKING, STATE_UNKNOWN, type Tracks } from './telemetry';

type Axes = { up: 'y' | 'z'; flipX?: boolean; flipY?: boolean; flipZ?: boolean; scale?: number };

export async function readMatchFiles(files: File[]): Promise<Tracks> {
  const b = new TrackBuilder();
  for (const file of files) {
    const buf = asyncBufferFromFile(file);
    const meta = await parquetMetadataAsync(buf);
    const n = Number(meta.num_rows);
    const names = new Set(meta.schema.map((s) => s.name));
    let axes: Axes = { up: 'z', flipY: true };
    const hint = meta.key_value_metadata?.find((k) => k.key === 'heat3d')?.value;
    if (hint) {
      try {
        axes = (JSON.parse(hint) as { axes?: Axes }).axes ?? axes;
      } catch {
        // The CS2 tool's convention stands.
      }
    }
    const dict: string[] = [];
    const ids = new Map<string, number>();
    const intern = (s: string) => {
      let i = ids.get(s);
      if (i === undefined) {
        ids.set(s, (i = dict.length));
        dict.push(s);
      }
      return i;
    };
    const num = (name: string) => (names.has(name) ? new Float32Array(n).fill(NaN) : null);
    const str = (name: string) => (names.has(name) ? new Uint32Array(n) : null);
    const cols = { x: num('x'), y: num('y'), z: num('z'), roundTime: num('roundTime'), walking: num('walking'), duck: num('duck'), airborne: num('airborne') };
    const strs = { event: str('event'), phase: str('phase'), player: str('player'), side: str('side'), roundId: str('roundId'), weapon: str('weapon') };
    if (!cols.x || !cols.y || !cols.z || !cols.roundTime || !strs.player) throw new Error(`${file.name}: not a match table (needs x, y, z, roundTime, player)`);
    const reqs: ColumnRequest[] = [];
    for (const [name, a] of Object.entries(cols)) if (a) reqs.push({ name, numbers: a });
    for (const [name, a] of Object.entries(strs)) if (a) reqs.push({ name, ids: a, intern });
    await readParquetColumns(buf, meta, reqs, n);
    const s = axes.scale || 1;
    const fx = (axes.flipX ? -1 : 1) * s;
    const fy = (axes.flipY ? -1 : 1) * s;
    const fz = (axes.flipZ ? -1 : 1) * s;
    const position = ids.get('position');
    const live = ids.get('live');
    const hasState = !!(cols.walking || cols.duck);
    for (let i = 0; i < n; i++) {
      if (strs.event && position !== undefined && strs.event[i] !== position) continue;
      if (strs.phase && live !== undefined && strs.phase[i] !== live) continue;
      const x = cols.x[i] * fx;
      const y = cols.y[i] * fy;
      const z = cols.z[i] * fz;
      // World is y up: a z-up table's z is the height and its y the depth.
      const [wx, wy, wz] = axes.up === 'z' ? [x, z, y] : [x, y, z];
      let state = hasState ? 0 : STATE_UNKNOWN;
      if (cols.walking && cols.walking[i] > 0.5) state |= WALKING;
      if (cols.duck && cols.duck[i] >= 0.5) state |= CROUCH;
      if (cols.airborne && cols.airborne[i] > 0.5) state |= AIRBORNE;
      const round = strs.roundId ? dict[strs.roundId[i]] : file.name;
      b.add(`${file.name}|${round}`, dict[strs.player[i]], strs.side ? sideCode(dict[strs.side[i]]) : 2, cols.roundTime[i], wx, wy, wz, state, strs.weapon ? dict[strs.weapon[i]] : '');
    }
  }
  return b.build();
}
