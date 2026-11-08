/**
 * Visual properties the user would otherwise only find by looking.
 *
 * Three of them, each over every setting it can depend on: heat that keeps its
 * colour as the camera zooms, an exposure that neither pumps nor flickers as the
 * camera nudges about, and units that move smoothly in every replay path and
 * follow view. This is the pure half - the arithmetic the shaders and the engine
 * run, checked where it can be checked without a GPU. The rendered half, which
 * reads the same properties back off real frames, is `npm run check:visual`
 * (tools/check-visual.mjs).
 */
import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { autoExposure } from './exposure';
import { DEFAULT_FOLLOW, ExposureFollower } from './exposureFollow';
import { axesOf, FollowRig, type RigCamera, type RigMode, type Vec3 } from './followRig';
import { HEAT_VS, LINE_HEAT_VS } from './webgl2/shaders';
import { HEAT_WGSL, LINE_HEAT_WGSL } from './webgpu/shaders';
import { emptySample, MotionModel } from '../figures/motion';
import { gpuTrackStore, unpackAim } from './gpuTracks/store';
import { aimOf } from '../figures/aim';
import { emptyPose, evaluateTrack } from './gpuTracks/evaluate';

/** A small deterministic generator, so a failure reproduces. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------ zoom

/**
 * What one sprite adds, as both point heat vertex shaders weight it: its drawn
 * pixel radius and the heat weight. See HeatUniforms.zoomInvariant.
 */
function pointSplat(truePx: number, minPx: number, maxPx: number, conserve: boolean): { px: number; weight: number } {
  const px = Math.min(maxPx, Math.max(minPx, truePx));
  const ratio = truePx / Math.max(1e-6, px);
  return { px, weight: conserve ? ratio * ratio : 1 };
}

/** The same for one segment of line heat: its drawn half-width and weight, never under 2.5 px. */
function lineSplat(truePx: number, minPx: number, maxPx: number, conserve: boolean): { px: number; weight: number } {
  let px = Math.min(maxPx, Math.max(minPx, truePx));
  let weight = conserve ? truePx / Math.max(1e-6, px) : 1;
  if (px < 2.5) {
    weight *= px / 2.5;
    px = 2.5;
  }
  return { px, weight };
}

/**
 * Expected heat at a pixel over a uniform field of `density` rows per square
 * metre, seen straight down from `height` with a focal length of `focal` pixels.
 *
 * A sprite drawn `px` pixels wide covers (px * height / focal)^2 of ground, so
 * the expected sum at a pixel is density x weight x that area x the sprite's
 * own integral; lines the same with one power, crossing density x drawn width.
 */
function fieldHeat(kind: 'point' | 'line', density: number, radius: number, height: number, focal: number, conserve: boolean): number {
  const truePx = (radius * focal) / height;
  const s = (kind === 'point' ? pointSplat : lineSplat)(truePx, 1, 96, conserve);
  const ground = (s.px * height) / focal;
  return kind === 'point' ? density * s.weight * Math.PI * ground * ground : density * s.weight * 2 * ground;
}

describe('heat keeps its colour from far and near', () => {
  // From a sprite a fraction of a pixel wide to one well past the 96 px clamp.
  const heights = [3, 10, 50, 300, 2000, 12000];
  const focal = 560 / (2 * Math.tan((50 * Math.PI) / 360));

  for (const kind of ['point', 'line'] as const) {
    it(`${kind} heat: the same ground reads the same heat at every height, both clamps included`, () => {
      const near = fieldHeat(kind, 4, 1, heights[0], focal, true);
      for (const h of heights) expect(fieldHeat(kind, 4, 1, h, focal, true) / near).toBeCloseTo(1, 6);
    });

    it(`${kind} heat: and without the weighting it would not, so the check has teeth`, () => {
      const mid = fieldHeat(kind, 4, 1, 50, focal, false);
      expect(fieldHeat(kind, 4, 1, 12000, focal, false) / mid).toBeGreaterThan(5);
    });
  }

  it('is what the shaders do, on both backends', () => {
    // Point heat: weighted by the area the clamp gave or took.
    for (const src of [HEAT_VS, HEAT_WGSL]) {
      expect(src).toMatch(/ratio\s*=\s*trueRadius\s*\/\s*max\(1e-6,\s*pixRadius\)/);
      expect(src).toMatch(/fade\s*\*\s*ratio\s*\*\s*ratio/);
    }
    // Line heat: by the width, the one dimension a line has across it, and
    // only after the clamp, before the 2.5 px floor that dims by itself.
    for (const src of [LINE_HEAT_VS, LINE_HEAT_WGSL]) {
      expect(src).toMatch(/trueRadius\s*\/\s*max\(1e-6,\s*pixRadius\)/);
      // Its round caps are half discs: weighted once more, by area.
      expect(src).toMatch(/capRadius\s*\/\s*pixRadius/);
    }
  });
});

// ------------------------------------------------------------------ exposure

/** A heat field over the ground: a broad blob on a floor, with a little grain. */
function field(x: number, z: number, grain: () => number): number {
  const blob = 40 * Math.exp(-(x * x + z * z) / (2 * 300 * 300));
  return blob + 4 + (grain() - 0.5) * 0.8;
}

/** The field as a view of `half` metres either side of (cx, cz) sampled on an n x n grid. */
function view(cx: number, cz: number, half: number, n: number, seed: number): Float32Array {
  const g = rng(seed);
  const out = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) out[j * n + i] = field(cx + ((i + 0.5) / n - 0.5) * 2 * half, cz + ((j + 0.5) / n - 0.5) * 2 * half, g);
  return out;
}

describe('exposure neither pumps nor flickers', () => {
  it('meters the same view the same at any sampling density, as near and far views of one place are', () => {
    const coarse = autoExposure(view(0, 0, 900, 64, 1)).saturation!;
    const fine = autoExposure(view(0, 0, 900, 256, 2)).saturation!;
    expect(Math.abs(Math.log(fine / coarse))).toBeLessThan(0.05);
  });

  it('does not move the scale for a camera nudged around one place (follow exposure)', () => {
    const f = new ExposureFollower();
    let sat = autoExposure(view(0, 0, 900, 128, 3)).saturation!;
    const start = sat;
    let now = 0;
    for (let step = 0; step < 40; step++) {
      // A small pan or dolly, then rest until the follower meters.
      f.frame(true, true);
      const g = rng(100 + step);
      const half = 900 * (1 + (g() - 0.5) * 0.2);
      const reading = autoExposure(view((g() - 0.5) * 60, (g() - 0.5) * 60, half, 128, 200 + step)).saturation!;
      for (let k = 0; k < DEFAULT_FOLLOW.settleFrames + 30; k++) {
        now += 16.7;
        const due = f.frame(false, true);
        if (due !== null) f.propose(due, sat, reading, now);
        sat = f.value(now) ?? sat;
      }
    }
    expect(sat).toBe(start);
  });

  it('glides a real change monotonically, a bounded step per frame, and lands exactly', () => {
    const f = new ExposureFollower();
    f.frame(true, true);
    let due: number | null = null;
    for (let k = 0; k < DEFAULT_FOLLOW.settleFrames && due === null; k++) due = f.frame(false, true);
    expect(f.propose(due!, 10, 80, 0)).toBe(true);
    let prev = 10;
    let worst = 0;
    for (let now = 16.7; now < DEFAULT_FOLLOW.glideMs + 200; now += 16.7) {
      const v = f.value(now) ?? prev;
      expect(v).toBeGreaterThanOrEqual(prev);
      worst = Math.max(worst, Math.log(v / prev));
      prev = v;
    }
    expect(prev).toBeCloseTo(80, 9);
    // An eightfold change over the glide's smoothstep: never more than 15% in one frame.
    expect(worst).toBeLessThan(Math.log(1.15));
  });

  it('never leaves a glide running into a moving camera', () => {
    const f = new ExposureFollower();
    f.frame(true, true);
    let due: number | null = null;
    while (due === null) due = f.frame(false, true);
    f.propose(due, 10, 80, 0);
    f.frame(true, true);
    // A reading for the old view arriving after the move is dropped.
    expect(f.propose(due, 10, 5, 50)).toBe(false);
  });
});

// ------------------------------------------------------------------ motion

/** Positions and times as a dataset holds them: 32-bit floats. */
const f32 = Math.fround;

interface Flight {
  d: Dataset;
  /** The analytic path, for reference. */
  speed: number;
  radius: number;
  t0: number;
  t1: number;
}

/**
 * One aircraft flying a circle at `speed`, sampled about 5 times a second at
 * irregular intervals, a DCS theatre's distance from the origin.
 */
function flight(hours: number, speed = 250, radius = 3000, cx = 700_000, cz = -650_000): Flight {
  const g = rng(7);
  const rows: { t: number; x: number; y: number; z: number; yaw: number }[] = [];
  const end = hours * 3600;
  for (let t = 0; t <= end; t += 0.2 * (0.6 + 0.8 * g())) {
    // The time first, as the file stores it; the position at exactly that time.
    const tt = f32(t);
    const a = (speed * tt) / radius;
    rows.push({ t: tt, x: f32(cx + radius * Math.sin(a)), y: f32(5000 + 30 * Math.sin(tt / 7)), z: f32(cz - radius * Math.cos(a)), yaw: a });
  }
  const n = rows.length;
  const d = {
    id: `flight${hours}`,
    name: 'flight',
    count: n,
    px: Float32Array.from(rows, (r) => r.x),
    py: Float32Array.from(rows, (r) => r.y),
    pz: Float32Array.from(rows, (r) => r.z),
    time: Float32Array.from(rows, (r) => r.t),
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: Float32Array.from(rows, (r) => r.yaw),
    pitch: new Float32Array(n),
    personId: new Uint32Array(n),
    teamId: new Uint16Array(n),
    personLabels: ['u0'],
    teamLabels: ['blue'],
    sessionId: null,
    sessionLabels: [],
    sessionRows: null,
    sessionStart: null,
    sessionEnd: null,
    personTeam: Uint16Array.of(0),
    personSlot: null,
    teamSizes: null,
    attrs: [],
    warnings: [],
    bounds: { minX: cx - radius, minY: 4900, minZ: cz - radius, maxX: cx + radius, maxY: 5100, maxZ: cz + radius },
    timeRange: [rows[0].t, rows[n - 1].t],
    timeSorted: true,
  } as unknown as Dataset;
  return { d, speed, radius, t0: rows[0].t, t1: rows[n - 1].t };
}

/**
 * How unevenly a position moves from frame to frame: the largest deviation of
 * the second difference from the true path's (v^2 / R h^2), as a fraction of
 * one frame's travel. A smooth path at 60 fps reads well under 1%.
 */
function jitter(at: (t: number) => [number, number, number] | null, fl: Flight, from: number, seconds: number, fps = 60): number {
  const h = 1 / fps;
  const expect2 = (fl.speed * fl.speed) / fl.radius * h * h;
  const step = fl.speed * h;
  let worst = 0;
  let a = at(from);
  let b = at(from + h);
  for (let k = 2; k < seconds * fps; k++) {
    const c = at(from + k * h);
    if (a && b && c) {
      const d2 = Math.hypot(c[0] - 2 * b[0] + a[0], c[1] - 2 * b[1] + a[1], c[2] - 2 * b[2] + a[2]);
      worst = Math.max(worst, Math.abs(d2 - expect2) / step);
    }
    a = b;
    b = c;
  }
  return worst;
}

/** Points along a flight worth checking: its start, middle and end. */
const spots = (fl: Flight) => [fl.t0 + 5, (fl.t0 + fl.t1) / 2, fl.t1 - 25];

const JITTER_LIMIT = 0.01;

describe('units move smoothly in every replay path', () => {
  const short = flight(0.1);
  const long = flight(5);

  for (const fl of [short, long]) {
    it(`the CPU replay (figure overlay, match replay) over ${fl.t1 > 3600 ? '5 h' : '6 min'} far from the origin`, () => {
      const m = MotionModel.of(fl.d)!;
      const s = emptySample();
      const at = (t: number): [number, number, number] | null => (m.at(0, t, -1, s) ? [s.x, s.y, s.z] : null);
      for (const t of spots(fl)) expect(jitter(at, fl, t, 20)).toBeLessThan(JITTER_LIMIT);
    });
  }

  const gpuJitter = (fl: Flight) => {
    const store = gpuTrackStore(fl.d, { maxKeys: 1e9 })!;
    const pose = emptyPose();
    const at = (t: number): [number, number, number] | null => (evaluateTrack(store, 0, t, 10, pose) ? [pose.x, pose.y, pose.z] : null);
    return Math.max(...spots(fl).map((t) => jitter(at, fl, t, 20)));
  };

  // The store's keys and their interpolation as the CPU evaluates them for the
  // followed unit; the shaders' own 32-bit arithmetic is checked on rendered
  // frames by check:visual.
  for (const fl of [short, long]) {
    it(`the GPU tracks keys over ${fl.t1 > 3600 ? '5 h' : '6 min'} far from the origin`, () => {
      expect(gpuJitter(fl)).toBeLessThan(JITTER_LIMIT);
    });
  }

  const camera = (): RigCamera => {
    const position = {
      x: 0,
      y: 0,
      z: 0,
      set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
      },
    };
    return { position, yaw: 0, pitch: 0, roll: 0, moved: false };
  };

  for (const mode of ['cockpit', 'fixed', 'padlock', 'target', 'satellite'] as RigMode[]) {
    it(`the ${mode} follow camera keeps the unit steady in view, 5 h far from the origin`, () => {
      const fl = long;
      const m = MotionModel.of(fl.d)!;
      const s = emptySample();
      const rig = new FollowRig();
      const c = camera();
      const h = 1 / 60;
      const from = fl.t1 - 25;
      // The unit in camera axes, per frame: for a view tied to the unit it should not shake.
      const rel: Vec3[] = [];
      for (let k = 0; k < 600; k++) {
        const t = from + k * h;
        if (!m.at(0, t, -1, s)) continue;
        const sp = Math.hypot(s.vx, s.vz) || 1;
        const fwd: Vec3 = [s.vx / sp, 0, s.vz / sp];
        // A wingman a kilometre off the nose, for the padlock and target views.
        rig.update(c, {
          mode,
          person: 0,
          pos: [s.x, s.y, s.z],
          fwd,
          up: [0, 1, 0],
          target: [s.x + fwd[0] * 1000, s.y, s.z + fwd[2] * 1000],
          distance: 60,
          units: 1,
          eyeAhead: 0,
          eyeUp: 2,
          reset: 0,
        });
        const ax = axesOf(c.yaw, c.pitch, c.roll);
        const d: Vec3 = [s.x - c.position.x, s.y - c.position.y, s.z - c.position.z];
        const dot = (a: Vec3) => a[0] * d[0] + a[1] * d[1] + a[2] * d[2];
        const right: Vec3 = [ax.fwd[1] * ax.up[2] - ax.fwd[2] * ax.up[1], ax.fwd[2] * ax.up[0] - ax.fwd[0] * ax.up[2], ax.fwd[0] * ax.up[1] - ax.fwd[1] * ax.up[0]];
        const r = dot(right);
        const u = dot(ax.up);
        const f = dot(ax.fwd);
        // Where it lands on screen, as a tangent: what a pixel offset is in proportion to.
        rel.push([f > 1e-6 ? r / f : r, f > 1e-6 ? u / f : u, f]);
      }
      expect(rel.length).toBeGreaterThan(500);
      let worst = 0;
      for (let k = 2; k < rel.length; k++) {
        for (let i = 0; i < 2; i++) worst = Math.max(worst, Math.abs(rel[k][i] - 2 * rel[k - 1][i] + rel[k - 2][i]));
      }
      // A tenth of a pixel at 560 px over a 50 degree view, about 1/1200 of a tangent.
      expect(worst).toBeLessThan(1 / 1200 / 10);
    });
  }
});

// ------------------------------------------------------------------ turrets

/**
 * A tank driving a slow circle with its gun held on one point, firing at it
 * every couple of seconds - the way War Thunder's server replays write it: the
 * gun's world heading (`aimHeading`) on every position row, the turret's own
 * angle (`turretYaw`) only on some, and each shot's direction as its row's yaw.
 */
function tank(): { d: Dataset; shots: number[]; bearing: (t: number) => number } {
  const target = [800, 0, -300];
  const rows: { t: number; x: number; z: number; yaw: number; ev: number; aimH: number; turret: number }[] = [];
  const at = (t: number) => {
    const a = t / 40;
    return { x: 200 * Math.sin(a), z: -200 * Math.cos(a) + 200, hull: a + Math.PI / 2 };
  };
  // Compass bearing from a point to the target: forward is (sin, 0, -cos).
  const bearingFrom = (x: number, z: number) => Math.atan2(target[0] - x, -(target[2] - z));
  for (let t = 0; t <= 120; t += 0.1) {
    const p = at(t);
    const b = bearingFrom(p.x, p.z);
    // The turret's own angle on every tenth row only, degrees right of the hull.
    const rel = (((b - p.hull) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    rows.push({ t: f32(t), x: p.x, z: p.z, yaw: p.hull, ev: 0, aimH: (b * 180) / Math.PI, turret: rows.length % 10 ? NaN : (rel * 180) / Math.PI });
    if (Math.abs((t % 2) - 1) < 0.05) rows.push({ t: f32(t), x: p.x, z: p.z, yaw: b, ev: 1, aimH: NaN, turret: NaN });
  }
  const n = rows.length;
  const num = (name: string, v: (r: (typeof rows)[number]) => number) => ({ name, kind: 'number', data: Float32Array.from(rows, v), min: 0, max: 1 });
  const d = {
    id: 'tank', name: 'tank', count: n,
    px: Float32Array.from(rows, (r) => r.x), py: new Float32Array(n), pz: Float32Array.from(rows, (r) => r.z),
    time: Float32Array.from(rows, (r) => r.t), epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
    yaw: Float32Array.from(rows, (r) => r.yaw), pitch: new Float32Array(n),
    personId: new Uint32Array(n), teamId: new Uint16Array(n), personLabels: ['t0'], teamLabels: ['a'],
    sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
    personTeam: Uint16Array.of(0), personSlot: null, teamSizes: null, warnings: [],
    attrs: [
      { name: 'event', kind: 'category', data: Uint32Array.from(rows, (r) => r.ev), min: 0, max: 1, categories: ['position', 'shot'] },
      { name: 'kind', kind: 'category', data: new Uint32Array(n), min: 0, max: 0, categories: ['tank'] },
      num('aimHeading', (r) => r.aimH),
      num('turretYaw', (r) => r.turret),
    ],
    bounds: { minX: -300, minY: 0, minZ: -300, maxX: 900, maxY: 10, maxZ: 500 },
    timeRange: [0, rows[n - 1].t], timeSorted: true,
  } as unknown as Dataset;
  const shots: number[] = [];
  rows.forEach((r, i) => r.ev === 1 && shots.push(i));
  return { d, shots, bearing: (t) => { const p = at(t); return bearingFrom(p.x, p.z); } };
}

const angleOff = (a: number, b: number) => Math.abs((((a - b) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);

describe('turrets point where the shots go', () => {
  const { d, shots, bearing } = tank();

  it('on the CPU figures: hull heading plus turret is the shot direction, within 3 degrees', () => {
    const aim = aimOf(d)!;
    expect(aim).not.toBeNull();
    const now = { yaw: NaN, pitch: NaN };
    let worst = 0;
    for (const r of shots) {
      const t = d.time![r];
      aim.at(r, t, now);
      // The hull at the shot: the position row written beside it.
      worst = Math.max(worst, angleOff(d.yaw![r - 1] + now.yaw, d.yaw![r]));
    }
    expect(shots.length).toBeGreaterThan(40);
    expect(worst).toBeLessThan((3 * Math.PI) / 180);
  });

  it('on the GPU tracks: the aim keys carry the same turret, packed and unpacked', () => {
    const s = gpuTrackStore(d, { maxKeys: 1e9 })!;
    expect(s.keysAim).toBeTruthy();
    let worst = 0;
    let n = 0;
    for (let k = 0; k < s.keysAim!.length; k++) {
      const r = s.keyRow![k];
      if (d.attrs[0].data[r] !== 0) continue;
      const [yaw] = unpackAim(s.keysAim![k]);
      worst = Math.max(worst, angleOff(d.yaw![r] + yaw, bearing(d.time![r])));
      n++;
    }
    expect(n).toBeGreaterThan(1000);
    expect(worst).toBeLessThan((3 * Math.PI) / 180);
  });

  it('a turret that never turned would fail it: the check has teeth', () => {
    // What the figures showed before the world aim was read: most of the
    // replay's tanks have no turret column, so their turret sat fore and aft.
    let worst = 0;
    for (const r of shots) worst = Math.max(worst, angleOff(d.yaw![r - 1], d.yaw![r]));
    expect(worst).toBeGreaterThan((30 * Math.PI) / 180);
  });
});
