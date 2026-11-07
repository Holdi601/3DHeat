import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cameraForExtent, horizontalExtent } from './calibrate';
import { classifyParts, splitByClass } from './classify';
import { compactGeometry } from './simplify';
import { parseGlb } from './modelParse';

/**
 * The game-capture exporter's half of the file format.
 *
 * `exporters/gamecapture/` is Python and writes GLB by hand; this is the parser
 * that has to read it. The two are edited independently and nothing connects
 * them but the bytes, so the failure mode is the familiar quiet one — a level
 * that loads as a single unclassified blob because the labels went on the meshes
 * instead of the nodes, or one that frames as a dot because the scale was left
 * in metres.
 *
 * Unlike `levelExport.test.ts`, this does not wait for someone to run an export.
 * The reference level is generated here, by the exporter's own writer, so the
 * contract is checked on every run on any machine. Skips only when there is no
 * Python to run it with.
 */

const EXPORTER = resolve(__dirname, '../../exporters/gamecapture');
const OUT = resolve(EXPORTER, '.out');
const REFERENCE = resolve(OUT, 'reference.test.glb');

/** Dimensions declared in `heat3d_capture/geometry/reference.py`. */
const GROUND_METRES = 400;
const BUILDING_HEIGHT = 12;
const METRES_TO_VIEWER = 100;
const EXPECTED_PARTS = 5; // ground + three buildings + water

function generate(): string | null {
  for (const python of ['python', 'python3', 'py']) {
    try {
      mkdirSync(OUT, { recursive: true });
      execFileSync(python, ['-m', 'heat3d_capture.geometry.reference', REFERENCE], {
        cwd: EXPORTER,
        stdio: 'pipe',
        timeout: 60_000,
      });
      if (existsSync(REFERENCE)) return python;
    } catch {
      /* try the next interpreter name */
    }
  }
  return null;
}

const python = generate();
const suite = python ? describe : describe.skip;

suite('game-capture GLB round-trips through the viewer parser', () => {
  const mesh = () => parseGlb(toArrayBuffer(readFileSync(REFERENCE)));

  it('parses into the parts the exporter wrote', () => {
    const m = mesh();
    expect(m.parts.length).toBe(EXPECTED_PARTS);
    expect(m.triangles).toBeGreaterThan(0);
    for (const part of m.parts) {
      expect(part.name, `part ${part.name}`).toMatch(/^(ground|structure|water):/);
    }
  });

  it('is classified by its labels rather than by geometry', () => {
    // The whole reason the exporter writes prefixes. If this falls through to
    // the heuristics, the labels are not reaching the parser — which is what
    // happens when they are put on meshes and not on nodes.
    const m = mesh();
    const c = classifyParts(m);
    m.parts.forEach((part, i) => {
      expect(c.classes[i], part.name).toBe(part.name.split(':')[0]);
      expect(c.reasons[i], part.name).toMatch(/exporter/);
    });
    expect(c.groundTriangles).toBeGreaterThan(0);
    expect(c.structureTriangles).toBeGreaterThan(0);
    expect(c.waterTriangles).toBeGreaterThan(0);
  });

  it('loses no triangles when split by class', () => {
    const m = mesh();
    const split = splitByClass(m, classifyParts(m).classes);
    expect(
      split.groundIndices.length + split.structureIndices.length + split.waterIndices.length,
    ).toBe(m.indices.length);
  });

  it('arrives at the scale the viewer expects, not in metres', () => {
    // A hundred-fold scale error still loads and still looks like a level. It
    // just sits at the wrong size next to real telemetry, which is exactly the
    // kind of fault nobody notices until positions stop lining up.
    const m = mesh();
    const width = m.bounds.maxX - m.bounds.minX;
    expect(width).toBeCloseTo(GROUND_METRES * METRES_TO_VIEWER, 0);
    const height = m.bounds.maxY - m.bounds.minY;
    // Tallest building above the ground, plus the pond below it.
    expect(height).toBeGreaterThan(BUILDING_HEIGHT * METRES_TO_VIEWER);
    expect(height).toBeLessThan(width);
  });

  it('points its ground upward', () => {
    // The winding test. A mirrored axis with the winding left alone gives every
    // normal the wrong sign, and the ground lights from below as a ceiling.
    const m = mesh();
    const ground = m.parts.find((p) => p.name.startsWith('ground:'));
    expect(ground).toBeDefined();
    expect(ground!.upFacing).toBeGreaterThan(0.9);
  });

  it('has finite bounds the camera can be solved for', () => {
    const m = mesh();
    for (const v of Object.values(m.bounds)) expect(Number.isFinite(v)).toBe(true);
    const widened = cameraForExtent({ near: 0.5, far: 40_000, flySpeed: 120 }, m.bounds);
    const framing = horizontalExtent(m.bounds) / 2 / Math.tan(((65 / 2) * Math.PI) / 180);
    expect(widened.far).toBeGreaterThan(framing);
    expect(widened.far / widened.near).toBeLessThanOrEqual(100_000);
  });

  it('indexes only vertices that exist', () => {
    const m = mesh();
    const vertexCount = m.vertices.length / 6;
    for (let i = 0; i < m.indices.length; i++) {
      expect(m.indices[i]).toBeLessThan(vertexCount);
    }
  });

  /**
   * Colour is what makes a reconstructed racetrack readable: the road is a flat
   * ribbon flowing into its surroundings, and no shading angle separates it from
   * the verge. So the exporter writes `COLOR_0` and the viewer has to arrive at
   * the same numbers on the same vertices.
   *
   * The reference level gives each class one exact colour, which is the only way
   * to tell "read the buffer" from "read a buffer" — a stride or offset mistake
   * still yields values in 0..1 that look like colours.
   */
  describe('vertex colour', () => {
    /** Matches `PART_COLOURS` in `heat3d_capture/geometry/reference.py`. */
    const PART_COLOURS: Record<string, [number, number, number]> = {
      ground: [0.25, 0.5, 0.75],
      structure: [1.0, 0.5, 0.0],
      water: [0.0, 0.25, 1.0],
    };

    it('survives the round trip, three floats per vertex', () => {
      const m = mesh();
      expect(m.colours).not.toBeNull();
      expect(m.colours!.length).toBe(m.vertices.length / 2);
    });

    it('keeps each class its own colour', () => {
      const m = mesh();
      const colours = m.colours!;
      for (const part of m.parts) {
        const cls = part.name.split(':')[0];
        const want = PART_COLOURS[cls];
        expect(want, `no expected colour for part ${part.name}`).toBeDefined();
        // Read through the indices, so a wrong vertex ordering is caught too.
        for (let i = part.start; i < part.start + part.count; i++) {
          const v = m.indices[i];
          expect(colours[v * 3]).toBeCloseTo(want[0], 5);
          expect(colours[v * 3 + 1]).toBeCloseTo(want[1], 5);
          expect(colours[v * 3 + 2]).toBeCloseTo(want[2], 5);
        }
      }
    });

    it('is carried through simplification', () => {
      // Decimation rewrites the vertex buffer entirely. Colour that is not
      // remapped alongside it comes back shifted by a vertex, which reads as a
      // level that is almost right — the worst kind of wrong.
      const m = mesh();
      const simplified = compactGeometry(m.vertices, m.indices, m.colours);
      expect(simplified.colours).not.toBeNull();
      expect(simplified.colours!.length).toBe(simplified.vertices.length / 2);

      const seen = new Set<string>();
      for (let v = 0; v < simplified.colours!.length / 3; v++) {
        seen.add(
          [0, 1, 2].map((c) => simplified.colours![v * 3 + c].toFixed(3)).join(','),
        );
      }
      // Exactly the three the exporter wrote, and nothing blended in between.
      expect(seen.size).toBe(3);
    });
  });
});

/** Node returns a Buffer that may be a view into a larger pool. */
function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}
