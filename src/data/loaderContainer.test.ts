/**
 * A `.3dheat` container handed to the loader itself - not through a picker,
 * which opens it first - loads as its table and is never read as text. Checked
 * on the shared container vectors (`native/vectors/container`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Loader, tablesOf } from './loader';
import { ingestFiles } from './ingestFiles';
import { previewSource } from './sourcePreview';
import { autoMap } from './automap';

const dir = join(__dirname, '..', '..', 'native', 'vectors', 'container');
const container = (name: string) => new File([readFileSync(join(dir, name))], name);

/** The web loader with its worker replaced by a record of what it would be sent. */
class Recording extends Loader {
  sent: Array<{ kind: string; files?: File[]; file?: File }> = [];
  protected override send<T>(req: { kind: string; files?: File[]; file?: File }): Promise<T> {
    this.sent.push(req);
    return Promise.resolve({} as T);
  }
}

describe('a .3dheat container given to the loader', () => {
  it('is replaced by its tables, other files left as they are', async () => {
    const plain = new File(['x,y\n1,2\n'], 'other.csv');
    const out = await tablesOf([container('written.3dheat'), plain]);
    // The first table is named after the container (`expandContainers`).
    expect(out.map((f) => f.name)).toEqual(['written.parquet', 'other.csv']);
    expect(await tablesOf([plain])).toEqual([plain]);
  });

  it('reaches the worker as its table on every request', async () => {
    const l = new Recording();
    const c = container('two-tables.3dheat');
    await l.preview(c);
    await l.profile(c);
    await l.measure([c]);
    await l.count([c], []);
    await l.ingest([c], {} as never, [], 't', 1, 0, undefined, { threads: 1, ram: 1e9 });
    const names = l.sent.map((r) => (r.file ? [r.file.name] : (r.files ?? []).map((f) => f.name)));
    expect(names).toEqual([['two-tables.parquet'], ['two-tables.parquet'], ['two-tables.parquet', 'b.parquet'], ['two-tables.parquet', 'b.parquet'], ['two-tables.parquet', 'b.parquet']]);
  });

  it('loads its rows, positions and all', async () => {
    const [table] = await tablesOf([container('written.3dheat')]);
    const preview = await previewSource(table);
    expect(preview.format).toBe('parquet');
    const mapping = autoMap({
      columns: preview.columns,
      rows: preview.rows,
      numeric: preview.numeric,
      logicalTypes: preview.logicalTypes,
      hints: preview.hints,
      constant: preview.constant,
      fileCount: 1,
    });
    const { dataset } = await ingestFiles({ files: [table], mapping, columns: preview.columns, name: 't' });
    expect(dataset.count).toBeGreaterThan(0);
    expect(Number.isFinite(dataset.bounds.minX)).toBe(true);
  });
});
