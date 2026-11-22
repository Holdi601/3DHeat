import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parquetMetadataAsync, parquetReadObjects } from 'hyparquet';
import type { AttributeColumn, Dataset } from '../state/types';
import { openContainer } from '../data/container';
import { parseHints } from '../data/automap';
import { trackGround } from '../data/trackGround';
import { detectRangeGame } from '../ranges/catalog';
import { isGhpcMatch, parseGhpcMatch } from '../match/ghpcMatch';
import { figureFor } from '../figures/match';
import { CATALOG } from '../figures/catalog';
import { GHPC_ALIASES } from '../figures/specs/aliases-ghpc';
import { hitsFromDataset } from './hits';

/**
 * A Gunner, HEAT, PC! mission as the recorder mod writes it. The file is made
 * up: `mods/ghpc/tests/synthetic` in the 3DHeat Watcher writes it through the
 * mod's own writer (C#: its Parquet, Snappy and ZIP code), with no game
 * involved. Here it is read by the viewer's own container reader and hyparquet,
 * and the rows go through the hit analysis as a loaded dataset would.
 */
const FILE = path.join(__dirname, 'vectors', 'ghpc-synthetic.3dheat');

type Row = Record<string, unknown>;

/** The table's rows as a dataset: text columns categories, numbers numbers, tracks from `track`. */
function dataset(rows: Row[]): Dataset {
  const skip = new Set(['x', 'y', 'z', 'time']);
  const names = Object.keys(rows[0]).filter((n) => !skip.has(n));
  const attrs: AttributeColumn[] = names.map((name) => {
    if (rows.some((r) => typeof r[name] === 'string')) {
      const cats = [''];
      const index = new Map([['', 0]]);
      const data = new Uint32Array(rows.map((r) => {
        const v = r[name] === null || r[name] === undefined ? '' : String(r[name]);
        let i = index.get(v);
        if (i === undefined) index.set(v, (i = cats.push(v) - 1));
        return i;
      }));
      return { name, kind: 'category', data, min: 0, max: cats.length - 1, categories: cats };
    }
    const data = new Float32Array(rows.map((r) => (typeof r[name] === 'number' ? (r[name] as number) : NaN)));
    return { name, kind: 'number', data, min: 0, max: 0 };
  });
  const labels: string[] = [];
  const personId = new Uint32Array(rows.map((r) => {
    const w = String(r.track ?? '');
    let i = labels.indexOf(w);
    if (i < 0) i = labels.push(w) - 1;
    return i;
  }));
  // The hints mirror z (Unity's world is left-handed); the viewer's place is (x, y, -z).
  return {
    id: 'ghpc',
    name: 'ghpc-synthetic',
    count: rows.length,
    attrs,
    px: new Float32Array(rows.map((r) => r.x as number)),
    py: new Float32Array(rows.map((r) => r.y as number)),
    pz: new Float32Array(rows.map((r) => -(r.z as number))),
    time: new Float32Array(rows.map((r) => r.time as number)),
    timeSorted: false,
    yaw: null,
    pitch: null,
    personId,
    personLabels: labels,
    personTeam: null,
    sessionId: null,
    sessionLabels: [],
  } as unknown as Dataset;
}

async function load() {
  const bytes = readFileSync(FILE);
  const c = await openContainer(new File([bytes], 'ghpc-synthetic.3dheat'));
  const table = c.table!;
  const buf = { byteLength: table.size, slice: (s: number, e?: number) => table.slice(s, e ?? table.size).arrayBuffer() };
  const metadata = await parquetMetadataAsync(buf);
  const rows = (await parquetReadObjects({ file: buf, metadata })) as Row[];
  return { c, metadata, rows, doc: await c.json('match') };
}

describe('a Gunner, HEAT, PC! recorder file', () => {
  it('opens as a container of the game, its table stored and its hints in the footer', async () => {
    const { c, metadata, rows } = await load();
    expect(c.manifest.game).toBe('ghpc');
    expect(rows.length).toBe(c.manifest.members?.find((m: { role: string }) => m.role === 'table')?.rows);
    const hints = parseHints(metadata.key_value_metadata?.find((kv) => kv.key === 'heat3d')?.value);
    expect(hints?.columns?.personId).toBe('track');
    expect(hints?.columns?.teamId).toBe('team');
    expect(hints?.axes?.flipZ).toBe(true);
  });

  it("gives the Vehicles tab its hits: where they struck, what they did, and the killing shot", async () => {
    const { rows } = await load();
    const set = hitsFromDataset(dataset(rows));
    expect(set.source).toBe('ghpc');
    const hits = set.hits.filter((h) => h.kind === 'hit').sort((a, b) => a.time - b.time);
    expect(hits.map((h) => [h.vehicle, h.shooter, h.outcome])).toEqual([
      ['T72M1', 'Blue 1', 'nodamage'],
      ['T72M1', 'Blue 1', 'kill'],
    ]);
    const pen = hits[1];
    expect(pen.local![0]).toBeCloseTo(2, 5);
    expect(pen.local![1]).toBeCloseTo(1.9, 5);
    expect(pen.local![2]).toBeCloseTo(-0.4, 5);
    expect(pen.dir![0]).toBeLessThan(-0.9);
    expect(pen.killingShot).toBe(true);
    expect(pen.calibre).toBe(105);
    expect(pen.ammoType).toBe('APFSDS');
    expect(pen.ammoName).toBe('M774 APFSDS-T');
    expect(pen.distance).toBeCloseTo(760, 0);
    // A round into the ground hit no vehicle.
    expect(set.hits.some((h) => h.shooter === 'Red 2')).toBe(false);
  });

  it('gives the Match tab a scoreboard and the kill feed', async () => {
    const { doc } = await load();
    expect(isGhpcMatch(doc)).toBe(true);
    const m = parseGhpcMatch(doc as Record<string, unknown>);
    expect(m.game).toBe('ghpc');
    expect(m.teams).toEqual(['Blue', 'Red']);
    expect(m.author).toBe('Blue 1');
    expect(m.kills).toHaveLength(1);
    expect(m.kills[0]).toMatchObject({ killer: 'Blue 1', victim: 'Red 1', victimVehicle: 'T72M1', weapon: 'M774 APFSDS-T' });
    expect(m.players.find((p) => p.name === 'Blue 1')?.ground).toBe(1);
    expect(m.players.find((p) => p.name === 'Red 1')?.deaths).toBe(1);
    expect(m.duration).toBe(60);
  });

  it('is not taken for War Thunder by its hit columns', async () => {
    const { rows } = await load();
    expect(detectRangeGame('ghpc-synthetic.parquet', Object.keys(rows[0]), ['M68A1 105mm'])).toBeNull();
  });

  it('stands on a ground traced from its tracks when no level of its map exists', async () => {
    const { rows } = await load();
    const g = trackGround(dataset(rows))!;
    expect(g.flat).toBe(false);
    expect(g.samples).toBeGreaterThan(2000);
    // The units drove at y 98..102; the ground is there, and faces up.
    expect(g.model.groundBand.minY).toBeGreaterThan(95);
    expect(g.model.groundBand.maxY).toBeLessThan(103);
    const v = g.model.vertices;
    for (let i = 0; i < v.length; i += 6) expect(v[i + 4]).toBeGreaterThan(0.9);
    expect(g.model.bounds.minX).toBeLessThan(-500);
    expect(g.model.bounds.maxX).toBeGreaterThan(500);
    expect(g.model.indices.length).toBe(g.model.triangles * 3);
  });
});

describe('Gunner, HEAT, PC! vehicle names', () => {
  it('each maps to a ground figure of the catalogue', () => {
    const wrong = Object.entries(GHPC_ALIASES.aliases!).filter(([, f]) => !CATALOG[f] || CATALOG[f].domain !== 'ground');
    expect(wrong).toEqual([]);
  });

  it('the game\'s tanks and carriers are drawn as themselves', () => {
    expect(figureFor(['T-72M1'], ['tank'])).toBe('t-72a');
    expect(figureFor(['M1IP'], ['tank'])).toBe('m1ip-abrams');
    expect(figureFor(['BMP-1'], ['ifv'])).toBe('bmp-1');
    expect(figureFor(['M60A3 TTS'], ['tank'])).toBe('m60a3');
  });
});

describe('the ground traced from tracks', () => {
  const rowsOn = (n: number, f: (x: number, z: number) => number): Row[] =>
    Array.from({ length: n }, (_, i) => {
      const x = (i % 40) * 25 - 500, z = Math.floor(i / 40) * 25 - 250;
      return { time: i, x, y: f(x, z), z: -z, kind: 'tank', track: `u${i % 3}` };
    });

  it('follows a slope the units drove on', () => {
    const g = trackGround(dataset(rowsOn(800, (x) => 100 + x * 0.05)))!;
    const v = g.model.vertices;
    // Near x = -400 the ground is about 80 m up, near x = 400 about 120 m.
    let lo = NaN, hi = NaN;
    for (let i = 0; i < v.length; i += 6) {
      if (Math.abs(v[i] + 400) < g.cell / 2 && Math.abs(v[i + 2]) < g.cell) lo = v[i + 1];
      if (Math.abs(v[i] - 400) < g.cell / 2 && Math.abs(v[i + 2]) < g.cell) hi = v[i + 1];
    }
    expect(lo).toBeCloseTo(80, -1);
    expect(hi).toBeCloseTo(120, -1);
  });

  it('is flat with too few samples, and none without a place', () => {
    const few = trackGround(dataset(rowsOn(5, () => 42)))!;
    expect(few.flat).toBe(true);
    expect(few.model.groundBand.minY).toBe(42);
    expect(trackGround(dataset([{ time: 0, x: NaN, y: NaN, z: NaN, kind: 'tank', track: 'u' }]))).toBeNull();
  });

  it('leaves out what flies', () => {
    const rows = rowsOn(400, () => 10).concat(rowsOn(400, () => 900).map((r) => ({ ...r, kind: 'helicopter' })));
    expect(trackGround(dataset(rows))!.model.groundBand.maxY).toBeLessThan(11);
  });
});
