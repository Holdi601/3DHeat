/**
 * Synthetic matches in the shape of a converted War Thunder folder, for the
 * folder-load probe (`probe-folder-load.mjs --synthetic N`): one `.3dheat`
 * container per match, a Parquet table of `rows` rows with the wide schema a
 * converter writes - positions, a look vector, a hundred filter columns, text
 * among them, one per-row text column that holds a different value on almost
 * every row - and the converter's reading instructions. Made up, all of it:
 * no game's data, no map's name.
 *
 *   node tools/synthetic-matches.mjs <out> [matches] [rows]
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parquetWriteBuffer } from 'hyparquet-writer';
import { writeContainer } from './container.mjs';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Numeric filter columns besides the roles: a converter's measures. */
const MEASURES = Array.from({ length: 80 }, (_, i) => `m${String(i).padStart(2, '0')}`);
/** Text filter columns with a handful of values each. */
const CATEGORIES = Array.from({ length: 16 }, (_, i) => `c${String(i).padStart(2, '0')}`);
/** A per-row text column with a value on almost every row its own (a vehicle's turret states). */
const PER_ROW = 'states';

export async function writeSyntheticMatches(out, matches = 45, rows = 300_000) {
  mkdirSync(join(out, '.tmp'), { recursive: true });
  const hints = {
    version: 1,
    kind: 'synthetic',
    game: 'Synthetic',
    axes: { up: 'y', flipX: false, flipY: false, flipZ: true, scale: 1 },
    columns: {
      x: 'x', y: 'y', z: 'z', time: 'time', timeUnit: 'seconds', personId: 'track', teamId: 'team', sessionId: 'match',
      lookMode: 'vector', dirX: 'dirX', dirY: 'dirY', dirZ: 'dirZ',
      extra: ['event', 'player', 'vehicle', ...CATEGORIES, ...MEASURES, PER_ROW],
    },
  };
  for (let m = 0; m < matches; m++) {
    const R = rng(1000 + m);
    const name = `synthetic_match_${String(m + 1).padStart(3, '0')}`;
    const units = 40;
    const col = (type) => ({ type, data: new Array(rows) });
    const cols = {
      time: col('DOUBLE'), match: col('STRING'), track: col('STRING'), team: col('STRING'), player: col('STRING'), vehicle: col('STRING'), event: col('STRING'),
      x: col('DOUBLE'), y: col('DOUBLE'), z: col('DOUBLE'), dirX: col('FLOAT'), dirY: col('FLOAT'), dirZ: col('FLOAT'),
      [PER_ROW]: col('STRING'),
    };
    for (const c of CATEGORIES) cols[c] = col('STRING');
    for (const c of MEASURES) cols[c] = col('FLOAT');
    const ux = Float64Array.from({ length: units }, () => (R() - 0.5) * 3000);
    const uz = Float64Array.from({ length: units }, () => (R() - 0.5) * 3000);
    for (let i = 0; i < rows; i++) {
      const u = i % units;
      ux[u] += (R() - 0.5) * 8;
      uz[u] += (R() - 0.5) * 8;
      cols.time.data[i] = Math.floor(i / units) * 0.25;
      cols.match.data[i] = name;
      cols.track.data[i] = `unit ${u}`;
      cols.team.data[i] = u % 2 ? 'Blue' : 'Red';
      cols.player.data[i] = `Player ${u}`;
      cols.vehicle.data[i] = `Vehicle ${u % 7}`;
      cols.event.data[i] = R() < 0.97 ? 'position' : R() < 0.5 ? 'fire' : 'hit';
      cols.x.data[i] = ux[u];
      cols.y.data[i] = 30 + R() * 2;
      cols.z.data[i] = uz[u];
      cols.dirX.data[i] = 1;
      cols.dirY.data[i] = 0;
      cols.dirZ.data[i] = 0;
      cols[PER_ROW].data[i] = `${(R() * 40).toFixed(2)} ${(R() * 4).toFixed(2)};${(R() * 40).toFixed(2)} 0.00`;
      for (let c = 0; c < CATEGORIES.length; c++) cols[CATEGORIES[c]].data[i] = `v${(u + c) % 5}`;
      for (let c = 0; c < MEASURES.length; c++) cols[MEASURES[c]].data[i] = R() * 100;
    }
    const columnData = Object.entries(cols).map(([n, c]) => ({ name: n, type: c.type, data: c.data }));
    const file = join(out, '.tmp', `${name}.parquet`);
    writeFileSync(file, Buffer.from(parquetWriteBuffer({ columnData, rowGroupSize: 100_000, kvMetadata: [{ key: 'heat3d', value: JSON.stringify(hints) }] })));
    await writeContainer(join(out, `${name}.3dheat`), [{ file, role: 'table' }], { game: 'synthetic', match: name, map: 'synthetic_map', mode: 'test' });
    rmSync(file);
  }
  rmSync(join(out, '.tmp'), { recursive: true, force: true });
}

if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/').replace(/^\//, '')}`) {
  const out = process.argv[2];
  if (!out) {
    console.log('usage: node tools/synthetic-matches.mjs <out> [matches] [rows]');
    process.exit(2);
  }
  await writeSyntheticMatches(out, Number(process.argv[3] ?? 45), Number(process.argv[4] ?? 300_000));
}
