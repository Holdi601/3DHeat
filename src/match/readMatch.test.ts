import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parquetWriteBuffer } from 'hyparquet-writer';
import { readMatchFile } from './readMatch';

const ROOT = path.resolve(__dirname, '../..');

function table(n: number): Uint8Array {
  return new Uint8Array(
    parquetWriteBuffer({
      columnData: [
        { name: 'time', data: Float64Array.from({ length: n }, (_, i) => i / 10), type: 'DOUBLE' },
        { name: 'x', data: Float64Array.from({ length: n }, (_, i) => Math.sin(i) * 1000), type: 'DOUBLE' },
        { name: 'y', data: Float64Array.from({ length: n }, () => 10), type: 'DOUBLE' },
        { name: 'z', data: Float64Array.from({ length: n }, (_, i) => Math.cos(i) * 1000), type: 'DOUBLE' },
        { name: 'player_id', data: Array.from({ length: n }, (_, i) => `u${i % 7}`), type: 'STRING' },
        { name: 'team', data: Array.from({ length: n }, (_, i) => (i % 7 < 4 ? 'Blue' : 'Red')), type: 'STRING' },
      ],
      rowGroupSize: 4096,
    }),
  );
}

/** One match's loose files packed into a container by the CLI; the container as a File. */
function pack(stem: string, extra: Record<string, Uint8Array>): { dir: string; file: File } {
  const dir = mkdtempSync(path.join(tmpdir(), '3dheat-readmatch-'));
  writeFileSync(path.join(dir, `${stem}.parquet`), table(5000));
  for (const [n, b] of Object.entries(extra)) writeFileSync(path.join(dir, n), b);
  execFileSync(process.execPath, [path.join(ROOT, 'tools/3dheat-pack.mjs'), dir, '--settle', '0', '--delete-loose'], { stdio: 'pipe' });
  const p = path.join(dir, `${stem}.3dheat`);
  return { dir, file: new File([readFileSync(p)], path.basename(p)) };
}

const json = (v: unknown) => new TextEncoder().encode(JSON.stringify(v));

// Each test packs its file with the CLI, a node process of its own: room for it while the whole suite runs.
describe("a loaded match's scoreboard, from its own file", { timeout: 60_000 }, () => {
  it("reads a battle's match document", async () => {
    const stem = 'm_RB_Dom_2026-01-01_10-00-00_aa';
    const { dir, file } = pack(stem, { [`${stem}.match.json`]: json({ format: 'heat3d-wt-replay-match', match: stem, map: 'm', started: '2026-01-01T10:00:00Z', players: [{ name: 'p1', team: '1', kills: 2 }] }) });
    try {
      const r = await readMatchFile(file);
      expect(r.kind).toBe('game');
      if (r.kind === 'game') expect(r.game.players.map((p) => p.name)).toEqual(['p1']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reads a container's own summary where it has no match document", async () => {
    const stem = 'recording_1';
    const summary = { format: '3dheat-summary', version: 2, id: stem, map: 'm', teams: [{ name: 'Blue', units: 3, players: 0, presence: 1, kills: 4, deaths: 1, won: 1, val: [] }], playerStats: [], grid: { cell: 1 } };
    const { dir, file } = pack(stem, { [`${stem}.summary.json`]: json(summary) });
    try {
      const r = await readMatchFile(file);
      expect(r.kind).toBe('summary');
      if (r.kind === 'summary') {
        expect(r.summary.teams[0]).toMatchObject({ name: 'Blue', kills: 4 });
        // The grid is the mass analysis', not the match tab's.
        expect(r.summary.grid).toBeNull();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('works one out from the table where the container holds neither', async () => {
    const { dir, file } = pack('recording_2', {});
    try {
      const r = await readMatchFile(file);
      expect(r.kind).toBe('summary');
      if (r.kind === 'summary') {
        expect(r.summary.units).toBeGreaterThan(0);
        expect(r.summary.teams.length).toBeGreaterThan(0);
      }
      expect((await readMatchFile(file, false)).kind).toBe('none');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
