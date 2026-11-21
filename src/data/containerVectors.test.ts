/**
 * The shared `.3dheat` test vectors (`native/vectors/container`), read by this
 * reader. The native core's reader is checked against the same files and the
 * same `expected.json` (`native/crates/core/tests/container_vectors.rs`),
 * so the two cannot drift apart.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { memberOf, openContainer } from './container';

const dir = join(__dirname, '..', '..', 'native', 'vectors', 'container');
interface Expected {
  formatVersion: string;
  roles: Record<string, string>;
  tables: string[];
  members: Array<{ name: string; method: number; compressed: number; size: number; dataOffset: number; sha256: string }>;
}
const expected = JSON.parse(readFileSync(join(dir, 'expected.json'), 'utf8')) as Record<string, Expected>;

describe('the shared .3dheat vectors', () => {
  for (const [name, want] of Object.entries(expected)) {
    it(name, async () => {
      const bytes = readFileSync(join(dir, name));
      const c = await openContainer(new File([bytes], name));
      expect(c.manifest.format_version).toBe(want.formatVersion);
      expect(c.manifest.roles).toEqual(want.roles);
      expect(c.tables.map((t) => memberOf(t)?.name)).toEqual(want.tables);
      expect([...c.entries.keys()]).toEqual(want.members.map((m) => m.name));
      for (const m of want.members) {
        const e = c.entries.get(m.name)!;
        expect([e.method, e.csize, e.usize]).toEqual([m.method, m.compressed, m.size]);
        const f = await c.open(m.name);
        const data = new Uint8Array(await f!.arrayBuffer());
        expect(createHash('sha256').update(data).digest('hex')).toBe(m.sha256);
      }
      // A table is its byte range of the container, read in place.
      for (const t of c.tables) {
        const m = want.members.find((x) => x.name === memberOf(t)!.name)!;
        expect(new Uint8Array(await t.arrayBuffer())).toEqual(new Uint8Array(bytes.subarray(m.dataOffset, m.dataOffset + m.size)));
      }
    });
  }
});
