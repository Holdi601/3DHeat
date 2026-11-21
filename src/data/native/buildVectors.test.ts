/**
 * The dataset build's shared vectors (`native/vectors/build`): what the web
 * app's own build makes of each case, written down in `expected.json`. The
 * native core's build is held to the same file
 * (`native/crates/core/tests/build_vectors.rs`), so the two cannot drift apart.
 *
 *   UPDATE_VECTORS=1 npx vitest run src/data/native/buildVectors.test.ts
 *
 * rewrites `expected.json` after a deliberate change to the build; without it
 * the test checks the web build still makes exactly what the file says.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ingestFiles } from '../ingestFiles';
import { emptyColumnMapping, type ColumnMapping, type Dataset } from '../../state/types';
import { describeBuilt } from './build';

const dir = join(__dirname, '..', '..', '..', 'native', 'vectors', 'build');
interface Case {
  name: string;
  files: string[];
  mapping: Partial<ColumnMapping>;
  stride: number;
}
const cases = JSON.parse(readFileSync(join(dir, 'cases.json'), 'utf8')) as Case[];
const expectedPath = join(dir, 'expected.json');
const update = !!process.env.UPDATE_VECTORS;

/** A case's dataset as the web app builds it, in the form both tests compare. */
async function webBuild(c: Case) {
  const files = c.files.map((f) => new File([readFileSync(join(dir, f))], f));
  const mapping: ColumnMapping = { ...emptyColumnMapping(), ...c.mapping } as ColumnMapping;
  const { dataset, failures } = await ingestFiles({ files, mapping, columns: [], name: 'vectors', stride: c.stride });
  return describeBuilt(dataset as Dataset, failures.map((f) => f.file));
}

/** The vector files a case needs that are not on disk (they are committed; `make-build-vectors.mjs` makes them again). */
const missing = cases.flatMap((c) => c.files).filter((f) => !existsSync(join(dir, f)));

describe('the dataset build vectors', () => {
  it('are on disk', () => {
    expect(missing, `missing build vectors - run: node native/vectors/make-build-vectors.mjs`).toEqual([]);
  });

  it.skipIf(missing.length > 0)('are what the web build makes', async () => {
    const got: Record<string, unknown> = {};
    for (const c of cases) got[c.name] = await webBuild(c);
    if (update || !existsSync(expectedPath)) {
      writeFileSync(expectedPath, JSON.stringify(got, null, 1) + '\n');
      return;
    }
    const expected = JSON.parse(readFileSync(expectedPath, 'utf8')) as Record<string, unknown>;
    expect(JSON.parse(JSON.stringify(got))).toEqual(expected);
  }, 60_000);
});
