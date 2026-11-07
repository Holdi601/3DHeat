import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cameraForExtent, horizontalExtent } from './calibrate';
import { classifyParts, splitByClass } from './classify';
import { parseGlb } from './modelParse';
import { simplifyMesh } from './simplify';

/**
 * The other half of the level exporters.
 *
 * `exporters/unreal/` writes a .glb that this viewer has to read: world-space
 * geometry, float positions, no compression, and parts named so the ground and
 * the structures separate. Both halves are easy to change independently and the
 * failure mode is quiet — a level that loads but sits at the wrong scale, or
 * arrives as one grey blob because the naming contract drifted.
 *
 * So the real exported file is parsed here by the real parser. Skips when no
 * export is present, like the tests against `TestData/`.
 */

const OUT = resolve(__dirname, '../../exporters/unreal/.out');

/**
 * The most recent exports, newest first — not every export ever made.
 *
 * The cap is the point. This parses whole .glb files, and a working directory
 * accumulates them: a handful of runs of one map came to gigabytes, and parsing
 * all of them alongside the rest of the suite produced a string of failures that
 * were purely resource exhaustion. Every one of them passed when the file was run on its own,
 * which is the worst kind of red — it says the export is broken, and what is
 * broken is how many old copies of it are lying about.
 *
 * Two is enough for what this is for: the newest export must be readable, and
 * the one before it gives the comparison a regression needs. Older ones have
 * already been checked by earlier runs and are not going to change.
 */
const KEEP = 2;

function exports_(): string[] {
  if (!existsSync(OUT)) return [];
  return readdirSync(OUT)
    .filter((f) => f.toLowerCase().endsWith('.glb'))
    .map((f) => join(OUT, f))
    .filter((p) => statSync(p).size > 0)
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
    .slice(0, KEEP);
}

const files = exports_();
const suite = files.length > 0 ? describe : describe.skip;

/**
 * Every test in this block reads and parses a whole export, and an export is now
 * several hundred megabytes. Reading that off a cold page cache and walking it
 * takes longer than vitest's five second default on its own, so the first test
 * to touch each file failed while the five after it passed on the warmed cache. That reads as "the newest export is
 * broken" when nothing is broken but the clock.
 *
 * The budget is per test and generous on purpose: it exists to stop a slow disk
 * from being reported as a corrupt export, not to police parse speed. Real
 * regressions here fail on the assertions.
 */
const PARSE_BUDGET = 120_000;

suite('exported Unreal levels', { timeout: PARSE_BUDGET }, () => {
  for (const path of files) {
    const name = path.split(/[\\/]/).pop();

    it(`${name} parses into named parts`, () => {
      const mesh = parseGlb(toArrayBuffer(readFileSync(path)));
      expect(mesh.triangles).toBeGreaterThan(0);
      expect(mesh.parts.length).toBeGreaterThan(0);
      // The exporter labels every part; an unlabelled one means the naming
      // contract has drifted and the viewer is back to guessing.
      for (const part of mesh.parts) {
        expect(part.name, `part ${part.name}`).toMatch(/^(ground|structure|water):/);
      }
    });

    it(`${name} is classified by its labels, not by guesswork`, () => {
      const mesh = parseGlb(toArrayBuffer(readFileSync(path)));
      const classification = classifyParts(mesh);
      mesh.parts.forEach((part, i) => {
        const expected = part.name.split(':')[0];
        expect(classification.classes[i], part.name).toBe(expected);
        expect(classification.reasons[i]).toMatch(/exporter/);
      });
      const split = splitByClass(mesh, classification.classes);
      // Every triangle lands in exactly one of the three sets. A part that got
      // dropped by the split would be geometry that simply never renders.
      expect(
        split.groundIndices.length + split.structureIndices.length + split.waterIndices.length,
      ).toBe(mesh.indices.length);
    });

    it(`${name} has finite world-space geometry`, () => {
      const mesh = parseGlb(toArrayBuffer(readFileSync(path)));
      for (const v of Object.values(mesh.bounds)) {
        expect(Number.isFinite(v)).toBe(true);
      }
      // Unreal centimetres: a level is tens of metres at least, and a
      // kilometre-scale map is thousands of them. Catches a scale factor
      // applied twice or not at all.
      const width = mesh.bounds.maxX - mesh.bounds.minX;
      expect(width).toBeGreaterThan(1000);
      expect(width).toBeLessThan(5e7);

      // Y is up in viewer space, and a level is far wider than it is tall.
      const height = mesh.bounds.maxY - mesh.bounds.minY;
      const depth = mesh.bounds.maxZ - mesh.bounds.minZ;
      expect(height).toBeLessThan(Math.max(width, depth));
    });

    // Longer still than the block's budget: this one parses *and* decimates, and
    // meshoptimizer earns its time on millions of triangles. The default timeout
    // turned a passing test into a failing one purely because the exporter got
    // better.
    it(`${name} survives the import-time decimation`, { timeout: 180_000 }, async () => {
      // The viewer decimates again on import — an exported level must be
      // something meshoptimizer can actually work on, not a triangle soup of
      // degenerate slivers that collapses to nothing.
      const mesh = parseGlb(toArrayBuffer(readFileSync(path)));
      const target = Math.max(1000, Math.floor(mesh.triangles / 4));
      const r = await simplifyMesh(mesh, target);
      expect(r.skipped).toBe(false);
      expect(r.mesh.triangles).toBeGreaterThan(target / 10);
      expect(r.mesh.triangles).toBeLessThanOrEqual(mesh.triangles);
      const vertexCount = r.mesh.vertices.length / 6;
      for (let i = 0; i < r.mesh.indices.length; i += 997) {
        expect(r.mesh.indices[i]).toBeLessThan(vertexCount);
      }
    });

    it(`${name} fits inside the frustum the viewer gives it`, () => {
      // An exported map is far larger than any dataset: the test level is
      // several kilometres across, and framing that puts the camera hundreds of
      // thousands of units back — well behind the 40k default far plane, so the
      // whole level renders to an empty viewport with nothing on screen to say
      // why. This is that arithmetic, on the real file.
      const mesh = parseGlb(toArrayBuffer(readFileSync(path)));
      const widened = cameraForExtent({ near: 0.5, far: 40_000, flySpeed: 120 }, mesh.bounds);
      const extent = horizontalExtent(mesh.bounds);
      // The distance a 65 degree field of view needs to frame the whole extent.
      const framing = extent / 2 / Math.tan(((65 / 2) * Math.PI) / 180);
      expect(widened.far).toBeGreaterThan(framing);
      // ...without giving up so much depth precision that the occlusion test
      // cannot tell a wall from what is behind it.
      expect(widened.far / widened.near).toBeLessThanOrEqual(100_000);
    });

    it(`${name} points its ground upward`, () => {
      // The Y/Z swap that takes Unreal into viewer space mirrors the world, so
      // the exporter reverses its triangle winding to compensate. If it did not,
      // every normal would point into the surface: the ground would light from
      // below and read as a ceiling.
      const mesh = parseGlb(toArrayBuffer(readFileSync(path)));
      const ground = mesh.parts.find((p) => p.name.startsWith('ground:'));
      if (!ground) return;
      expect(ground.upFacing).toBeGreaterThan(0.8);
    });
  }
});

/** Node returns a Buffer that may be a view into a larger pool. */
function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}
