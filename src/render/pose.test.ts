import { describe, expect, it } from 'vitest';
import { DEFAULT_AXIS_MAPPING, type AxisMapping } from '../state/types';
import {
  convertYaw,
  dataToWorld,
  directionFromYawPitch,
  formatPose,
  lookAtDistance,
  parseNumber,
  parsePose,
  rowLookDirection,
  worldToData,
  yawPitchFromDirection,
} from './pose';

const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe('parsing a typed point', () => {
  it('reads a decimal point or a decimal comma', () => {
    expect(parseNumber('-321.6')).toBe(-321.6);
    expect(parseNumber('-321,6')).toBe(-321.6);
    expect(parseNumber('1.234,5')).toBe(1234.5);
    expect(parseNumber('1,234.5')).toBe(1234.5);
    expect(parseNumber('−59,9')).toBe(-59.9);
    expect(parseNumber('1,2,3')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
  });

  it('reads x, y, z however it is separated', () => {
    const want = { x: -321.6, y: 137.8, z: -59.9 };
    expect(parsePose('-321.6, 137.8, -59.9')).toEqual(want);
    expect(parsePose('-321.6 137.8 -59.9')).toEqual(want);
    expect(parsePose('-321,6 137,8 -59,9')).toEqual(want);
    expect(parsePose('-321,6; 137,8; -59,9')).toEqual(want);
    expect(parsePose('-321,6, 137,8, -59,9')).toEqual(want);
    expect(parsePose('  -321.6,137.8,-59.9  ')).toEqual(want);
    expect(parsePose('1,5,2,5,3,5')).toEqual({ x: 1.5, y: 2.5, z: 3.5 });
    expect(parsePose('1,2,3')).toEqual({ x: 1, y: 2, z: 3 });
  });

  it('takes a yaw and pitch as a fourth and fifth number', () => {
    expect(parsePose('-321,59 137,82 -59,86 31,5 -11,71')).toEqual({ x: -321.59, y: 137.82, z: -59.86, yaw: 31.5, pitch: -11.71 });
  });

  it('reads labelled text, and reads back what the readout and the pose box copy', () => {
    expect(parsePose('x=1 y=2 z=3')).toEqual({ x: 1, y: 2, z: 3 });
    const text = formatPose({ x: -321.59, y: 137.82, z: -59.86 }, 31.5, -11.71, 'game');
    expect(parsePose(text)).toEqual({ x: -321.59, y: 137.82, z: -59.86, yaw: 31.5, pitch: -11.71, convention: 'game' });
    expect(parsePose('pos 1.00 2.00 3.00 · yaw 10.00 · pitch -5.00')).toEqual({ x: 1, y: 2, z: 3, yaw: 10, pitch: -5 });
    expect(parsePose('x -1,5 y 2,25 z 3')).toEqual({ x: -1.5, y: 2.25, z: 3 });
  });

  it('refuses what is not a point', () => {
    expect(parsePose('')).toBeNull();
    expect(parsePose('1 2')).toBeNull();
    expect(parsePose('1 2 3 4')).toBeNull();
    expect(parsePose('here')).toBeNull();
  });
});

describe('yaw conventions', () => {
  // A row of the locate tool's output: its yaw and pitch, and the direction
  // vector it wrote beside them, `(cos p cos y, sin p, -cos p sin y)`.
  const locate = { yaw: 31.501811, pitch: -11.711517, dir: { x: 0.834874, y: -0.202984, z: -0.511648 } };

  it("puts the game's yaw where the capture tools do", () => {
    const d = directionFromYawPitch('game', locate.yaw, locate.pitch);
    close(d.x, locate.dir.x, 1e-5);
    close(d.y, locate.dir.y, 1e-5);
    close(d.z, locate.dir.z, 1e-5);
  });

  it('says the same direction as viewer yaw = game yaw - 90', () => {
    const v = yawPitchFromDirection('viewer', locate.dir);
    close(v.yaw, locate.yaw - 90, 1e-3);
    close(v.pitch, locate.pitch, 1e-3);
    close(convertYaw(locate.yaw, 'game', 'viewer'), locate.yaw - 90);
    close(convertYaw(-58.5, 'viewer', 'game'), 31.5);
    // And the viewer's own: 0 looks along -Z, 90 along -X.
    const z = directionFromYawPitch('viewer', 0, 0);
    close(z.z, -1);
    close(directionFromYawPitch('viewer', 90, 0).x, -1);
    close(directionFromYawPitch('game', 0, 0).x, 1);
    close(directionFromYawPitch('game', 90, 0).z, -1);
  });

  it('round-trips through a direction in both', () => {
    for (const conv of ['viewer', 'game'] as const) {
      for (const [y, p] of [[0, 0], [31.5, -11.7], [-170, 40], [179, -89]]) {
        const back = yawPitchFromDirection(conv, directionFromYawPitch(conv, y, p));
        close(back.yaw, y, 1e-9);
        close(back.pitch, p, 1e-9);
      }
    }
  });

  it("turns a row's stored look into the same direction the tool wrote", () => {
    // What buildLookFrom stores for a direction vector: atan2(x, -z).
    const yaw = Math.atan2(locate.dir.x, -locate.dir.z);
    const pitch = Math.atan2(locate.dir.y, Math.hypot(locate.dir.x, locate.dir.z));
    const d = rowLookDirection(yaw, pitch);
    close(d.x, locate.dir.x, 1e-5);
    close(d.y, locate.dir.y, 1e-5);
    close(d.z, locate.dir.z, 1e-5);
  });
});

describe("the data's own frame", () => {
  it('is the world itself for a Y-up, unscaled load', () => {
    const p = { x: -321.6, y: 137.8, z: -59.9 };
    expect(worldToData(p, { ...DEFAULT_AXIS_MAPPING, up: 'y' })).toEqual(p);
  });

  it('undoes a Z-up, flipped, scaled mapping, and back', () => {
    const axes: AxisMapping = { up: 'z', flipX: true, flipY: false, flipZ: true, scale: 0.01 };
    // remapAxesInPlace: world = (x*sx, z*sz, y*sy) for a source (x, y, z).
    const source = { x: 100, y: 200, z: 300 };
    const world = { x: -1, y: -3, z: 2 };
    const back = worldToData(world, axes);
    close(back.x, source.x);
    close(back.y, source.y);
    close(back.z, source.z);
    const there = dataToWorld(source, axes);
    close(there.x, world.x);
    close(there.y, world.y);
    close(there.z, world.z);
  });
});

describe('looking at a point', () => {
  it('stays where it is when that is sensible, and clamps otherwise', () => {
    expect(lookAtDistance(30, 2000)).toBe(30);
    expect(lookAtDistance(5000, 2000)).toBe(60);
    expect(lookAtDistance(0.5, 2000)).toBe(6);
    expect(lookAtDistance(Number.NaN, 2000)).toBe(60);
  });
});
