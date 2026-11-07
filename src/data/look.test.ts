import { describe, expect, it } from 'vitest';
import { emptyColumnMapping, type ColumnMapping } from '../state/types';
import { buildLookFrom, remapAxesInPlace } from './ingest';

/**
 * A look direction has to go through exactly what the positions went through,
 * or the ray points somewhere the player was not looking. The renderer's ray
 * for yaw/pitch is (sin yaw cos pitch, sin pitch, -cos yaw cos pitch).
 */
function ray(yaw: number, pitch: number): [number, number, number] {
  return [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
}

function vectorMapping(axes: Partial<ColumnMapping['axes']>): ColumnMapping {
  const m = emptyColumnMapping();
  m.lookMode = 'vector';
  m.dirX = 'dx';
  m.dirY = 'dy';
  m.dirZ = 'dz';
  m.axes = { ...m.axes, ...axes };
  return m;
}

describe('look direction', () => {
  for (const axes of [{ up: 'z' as const }, { up: 'z' as const, flipY: true }, { up: 'y' as const, flipX: true }, { up: 'z' as const, flipZ: true }]) {
    it(`points the same way as a step along it, ${JSON.stringify(axes)}`, () => {
      const mapping = vectorMapping(axes);
      // Looking along +Y and a little down, from the origin; a point one unit along.
      const d = [0.3, 0.9, -0.3];
      const n = Math.hypot(...d);
      const [dx, dy, dz] = d.map((v) => v / n);
      const look = buildLookFrom(mapping, 1, {
        yawRaw: null,
        pitchRaw: null,
        dirX: Float32Array.of(dx),
        dirY: Float32Array.of(dy),
        dirZ: Float32Array.of(dz),
      });
      const step = remapAxesInPlace(
        { x: Float32Array.of(dx), y: Float32Array.of(dy), z: Float32Array.of(dz) },
        mapping,
        1,
      );
      const r = ray(look.yaw![0], look.pitch![0]);
      expect(r[0]).toBeCloseTo(step.px[0], 5);
      expect(r[1]).toBeCloseTo(step.py[0], 5);
      expect(r[2]).toBeCloseTo(step.pz[0], 5);
    });
  }
});
