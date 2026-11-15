/**
 * Race-analysis demo set: the made-up closed course "Demo Ring" (a long
 * straight, a hairpin, a left-right chicane and four more corners, T1..T7) driven by made-up cars, as `heat3d-lap` JSON files in
 * <out>/race, plus a flat ribbon of the course as demo-ring.glb.
 *
 *   race/main/     "Demo GT": lap A (clean, driver A) and two laps of driver B
 *                  with faults (early braking into the hairpin T1, late throttle
 *                  out of T3, a lock into T6, wheelspin out of T4, a push at T7;
 *                  the other lap has a lock into the hairpin, the rear stepping out at T7)
 *   race/sprint/   two laps of the second car, "Demo Sprint", for the car profiles
 *   race/stats/    36 laps in three classes (C, B, S2) with faults scattered
 *                  over the corners and hot spots at the hairpin and T6
 *   race/demo-ring.glb
 *
 * The laps come from a point-mass model with a friction circle (corner speed
 * from the grip, a forward and a backward pass), with the driver's faults as
 * deviations from the quickest lap; slip, accelerations and the car's attitude
 * are made up from the same speeds, so the corner and car-control analyses find
 * what was put in. Deterministic: the same files on every run.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const DEG = Math.PI / 180;
const DS = 0.5;

// ------------------------------------------------------------------ the course

// Corner vertices of the course [x, z, radius]: x east, z north, run clockwise from
// the main straight, whose far end is the hairpin. Each vertex is rounded by an arc
// of its radius between its two legs, so the loop closes by construction.
const VERTICES = [
  [1000, 0, 24], // T1 hairpin
  [640, -110, 60], // T2 chicane, left
  [590, -190, 60], // T3 chicane, right
  [300, -250, 100], // T4 right
  [100, -190, 80], // T5 left
  [-190, -330, 45], // T6 right
  [-230, 10, 45], // T7 right onto the main straight
];

function pieces() {
  const out = [];
  const n = VERTICES.length;
  const info = VERTICES.map(([x, z, r], i) => {
    const [ax, az] = VERTICES[(i + n - 1) % n];
    const [bx, bz] = VERTICES[(i + 1) % n];
    const th0 = Math.atan2(x - ax, z - az);
    const th1 = Math.atan2(bx - x, bz - z);
    let d = th1 - th0;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return { x, z, r, th0, th1, d, t: r * Math.tan(Math.abs(d) / 2) };
  });
  // From the exit of the last corner round the lap.
  for (let i = 0; i < n; i++) {
    const a = info[(i + n - 1) % n];
    const b = info[i];
    const leg = Math.hypot(b.x - a.x, b.z - a.z);
    const len = leg - a.t - b.t;
    if (len < 8) throw new Error(`corners ${i} too close: ${len}`);
    out.push({ s: len });
    out.push({ a: (b.d * 180) / Math.PI, r: b.r });
  }
  out.th0 = info[n - 1].th1;
  out.x0 = info[n - 1].x + Math.sin(info[n - 1].th1) * info[n - 1].t;
  out.z0 = info[n - 1].z + Math.cos(info[n - 1].th1) * info[n - 1].t;
  return out;
}
const PIECES = pieces();

function build() {
  // Curvature along the piece list, smoothed over about 16 m like a real road
  // (a corner is eased in and out), then integrated.
  const kappa = [];
  const corners = [];
  for (const p of PIECES) {
    const start = kappa.length * DS;
    if (p.s !== undefined) {
      for (let i = 0; i < Math.round(p.s / DS); i++) kappa.push(0);
    } else {
      const len = Math.abs(p.a) * DEG * p.r;
      const k = Math.sign(p.a) / p.r;
      for (let i = 0; i < Math.round(len / DS); i++) kappa.push(k);
      corners.push({ start, end: start + len, radius: p.r, dir: Math.sign(p.a) });
    }
  }
  const n = kappa.length;
  const win = 16;
  const smooth = kappa.map((_, i) => {
    let s = 0;
    for (let j = -win; j <= win; j++) s += kappa[(i + j + n) % n];
    return s / (2 * win + 1);
  });
  const x = new Float64Array(n + 1);
  const z = new Float64Array(n + 1);
  const th = new Float64Array(n + 1);
  x[0] = PIECES.x0;
  z[0] = PIECES.z0;
  th[0] = PIECES.th0;
  for (let i = 0; i < n; i++) {
    th[i + 1] = th[i] + smooth[i] * DS;
    const mid = (th[i] + th[i + 1]) / 2;
    x[i + 1] = x[i] + Math.sin(mid) * DS;
    z[i + 1] = z[i] + Math.cos(mid) * DS;
  }
  return { n, kappa: smooth, x, z, th, corners };
}

function closedTrack() {
  const tr = build();
  // The little the smoothing leaves open, spread along the lap.
  const n = tr.n;
  const ex = tr.x[n] - tr.x[0];
  const ez = tr.z[n] - tr.z[0];
  for (let i = 0; i <= n; i++) {
    tr.x[i] -= (ex * i) / n;
    tr.z[i] -= (ez * i) / n;
  }
  return tr;
}
const TRACK = closedTrack();

// ------------------------------------------------------------------ the cars

const CARS = {
  gt: { name: 'Demo GT', ordinal: 8001, cls: 2, pi: 640, drive: 1, grip: 14, braking: 12, traction: 8, power: 260, drag: 0.0008 },
  sprint: { name: 'Demo Sprint', ordinal: 8002, cls: 1, pi: 520, drive: 0, grip: 12, braking: 10.5, traction: 7, power: 200, drag: 0.0009 },
  rocket: { name: 'Demo Rocket', ordinal: 8003, cls: 5, pi: 900, drive: 2, grip: 17, braking: 14, traction: 10.5, power: 420, drag: 0.0007 },
};
const DRIVEN = { 0: ['FL', 'FR'], 1: ['RL', 'RR'], 2: ['FL', 'FR', 'RL', 'RR'] };
const WHEELS = ['FL', 'FR', 'RL', 'RR'];

/** A bump 0..1 over [a, b] metres: eased in and out. */
const bump = (s, a, b) => {
  if (s <= a || s >= b) return 0;
  const u = (s - a) / (b - a);
  return Math.min(1, Math.sin(Math.PI * u) * 2.2);
};

/**
 * Faults (corner numbers 1-based):
 *  brakeEarly {corner, metres}, lateThrottle {corner, metres}, lock {corner, before, length},
 *  wheelspin {corner, after, length}, push {corner}, oversteer {corner}, pace (factor on grip)
 */
function simulate(car, faults = [], dt = 1 / 60, noiseSeed = 1) {
  const tr = TRACK;
  const n = tr.n;
  const R = rng(noiseSeed);
  const cap = new Float64Array(n + 1).fill(90);
  const brakeF = new Float64Array(n + 1).fill(1);
  const accelF = new Float64Array(n + 1).fill(1);
  const windows = [];
  const pace = faults.find((f) => f.kind === 'pace')?.factor ?? 1;
  for (let i = 0; i <= n; i++) {
    const k = Math.abs(tr.kappa[i % n]);
    if (k > 1e-5) cap[i] = Math.min(cap[i], Math.sqrt((car.grip * pace) / k));
  }
  const corner = (c) => tr.corners[c - 1];
  const ix = (m) => Math.max(0, Math.min(n, Math.round(m / DS)));
  for (const f of faults) {
    const c = f.corner ? corner(f.corner) : null;
    if (f.kind === 'brakeEarly') {
      // Brakes this many metres sooner, then rolls to the corner at its speed.
      const v = Math.min(...Array.from({ length: ix(c.end) - ix(c.start) }, (_, i) => cap[ix(c.start) + i]));
      for (let i = ix(c.start - f.metres); i <= ix(c.start); i++) cap[i] = Math.min(cap[i], v * 1.02);
    } else if (f.kind === 'lateThrottle') {
      const v = Math.min(...Array.from({ length: ix(c.end) - ix(c.start) }, (_, i) => cap[ix(c.start) + i]));
      for (let i = ix(c.end); i <= ix(c.end + f.metres); i++) cap[i] = Math.min(cap[i], v * 1.04);
    } else if (f.kind === 'lock') {
      const a = c.start - f.before;
      const b = a + (f.length ?? 16);
      for (let i = ix(a); i <= ix(b); i++) brakeF[i] = 0.7;
      windows.push({ kind: 'lock', a, b, wheels: f.wheels ?? ['FL', 'FR'], size: f.size ?? 1.9 });
    } else if (f.kind === 'wheelspin') {
      const a = c.end + (f.after ?? -12);
      const b = a + (f.length ?? 34);
      for (let i = ix(a); i <= ix(b); i++) accelF[i] = 0.55;
      windows.push({ kind: 'spin', a, b, size: f.size ?? 1.9 });
    } else if (f.kind === 'push') {
      const a = c.start + (c.end - c.start) * 0.15;
      const b = c.end - (c.end - c.start) * 0.05;
      for (let i = ix(a); i <= ix(b); i++) cap[i] = Math.min(cap[i], cap[i] * 0.93);
      windows.push({ kind: 'push', a: a - 12, b, size: 1.9, dir: c.dir });
    } else if (f.kind === 'oversteer') {
      const a = c.start + (c.end - c.start) * 0.45;
      const b = c.end + 14;
      for (let i = ix(a); i <= ix(b); i++) cap[i] = Math.min(cap[i], cap[i] * 0.95);
      windows.push({ kind: 'over', a, b, dir: c.dir });
    }
  }
  const fric = (v, k) => Math.sqrt(Math.max(0.04, 1 - Math.min(1, (v * v * Math.abs(k)) / (car.grip * pace)) ** 2));
  const accelAt = (v, i) =>
    Math.min(car.traction, car.power / Math.max(v, 1)) * fric(v, tr.kappa[i % n]) * accelF[i] - car.drag * v * v;
  const v = new Float64Array(n + 1);
  v[0] = cap[0];
  for (let round = 0; round < 3; round++) {
    for (let i = 1; i <= n; i++) {
      v[i] = Math.min(cap[i], Math.sqrt(Math.max(1, v[i - 1] ** 2 + 2 * DS * accelAt(v[i - 1], i - 1))));
    }
    for (let i = n - 1; i >= 0; i--) {
      const b = car.braking * brakeF[i] * fric(v[i + 1], tr.kappa[i % n]) + car.drag * v[i + 1] ** 2;
      v[i] = Math.min(v[i], Math.sqrt(v[i + 1] ** 2 + 2 * DS * b));
    }
    v[0] = v[n] = Math.min(v[0], v[n]);
  }
  // Time at each metre mark, and the longitudinal acceleration there.
  const time = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) time[i] = time[i - 1] + (2 * DS) / (v[i - 1] + v[i]);
  const seconds = time[n];
  const along = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const a = Math.max(0, i - 2);
    const b = Math.min(n, i + 2);
    along[i] = (v[b] ** 2 - v[a] ** 2) / (2 * (b - a) * DS);
  }

  // The sample times: every dt, and four times as dense through a lock or a spin, so the
  // car's tyre curves (measured from the samples) see enough of them.
  const sAt = (t) => {
    let lo = 0;
    let hi = n;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (time[mid] <= t) lo = mid;
      else hi = mid;
    }
    return lo * DS;
  };
  const dense = windows.filter((w) => w.kind === 'lock' || w.kind === 'spin');
  const times = [];
  for (let t = 0; t < seconds; ) {
    times.push(t);
    const s = sAt(t);
    t += dense.some((w) => s >= w.a - 2 && s <= w.b + 2) ? dt / 4 : dt;
  }
  times.push(seconds);
  const count = times.length;
  const names = [
    'time', 'distance', 'x', 'y', 'z', 'speed', 'throttle', 'brake', 'steer', 'gear', 'rpm', 'latAcc', 'longAcc', 'yaw', 'yawRate', 'latVel', 'longVel',
    ...['slipRatio', 'suspension', 'tireTemp', 'wheelSpeed'].flatMap((c) => WHEELS.map((w) => `${c}.${w}`)),
  ];
  const ch = Object.fromEntries(names.map((c) => [c, new Array(count)]));
  const driven = DRIVEN[car.drive];
  const temp = { FL: 78, FR: 78, RL: 82, RR: 82 };
  let seg = 0;
  let psiPrev = 0;
  const psiAll = new Float64Array(count);
  const betaAll = new Float64Array(count);
  const win = (kind) => windows.filter((w) => w.kind === kind);
  for (let k = 0; k < count; k++) {
    const t = times[k];
    while (seg < n - 1 && time[seg + 1] < t) seg++;
    const f = (t - time[seg]) / Math.max(1e-9, time[seg + 1] - time[seg]);
    const s = (seg + f) * DS;
    const lerp = (arr) => arr[seg] + (arr[seg + 1] - arr[seg]) * f;
    const vel = lerp(v);
    const a = lerp(along);
    const kap = lerp(tr.kappa.concat(tr.kappa[0]));
    const th = lerp(tr.th);
    const lat = (vel * vel * kap) / car.grip; // signed, + = right-hand turn
    const lockW = Math.max(0, ...win('lock').map((w) => bump(s, w.a, w.b)));
    const spinW = Math.max(0, ...win('spin').map((w) => bump(s, w.a, w.b)));
    const pushW = Math.max(0, ...win('push').map((w) => bump(s, w.a, w.b)));
    const overW = Math.max(0, ...win('over').map((w) => bump(s, w.a, w.b)));
    const overDir = win('over').find((w) => bump(s, w.a, w.b) > 0)?.dir ?? 1;
    const noise = () => (R() - 0.5) * 0.03;

    const braking = a < -1.2;
    const brakeIn = braking ? Math.min(1, (-a / (car.braking * (lockW > 0.3 ? 0.7 : 1))) * 0.98 + (lockW > 0.3 ? 0.05 : 0)) : 0;
    const bindingCorner = (vel * vel * Math.abs(kap)) / car.grip > 0.55;
    let throttle = 0;
    if (!braking) throttle = a > 0.05 || !bindingCorner ? (spinW > 0.3 ? 1 : Math.min(1, 0.55 + a / Math.max(0.5, accelAt(vel, seg)))) : 0.32;
    if (!bindingCorner && !braking && a > -1.2) throttle = 1;
    const steerBase = Math.max(-1, Math.min(1, (kap * 2.7 * (1 + (vel * vel) / 1600)) / 0.4));
    // Steering is positive to the right; this world is drawn the right way round, so a turn
    // that grows the heading (a left-hander) steers negative.
    let steer = -steerBase * (1 + 0.9 * pushW);
    steer = steer * (1 - overW) + 0.35 * overDir * overW;
    // Attitude: the car's nose against its path.
    const beta = (0.012 * lat + 0.2 * overW * overDir) * 1; // rad, + = nose turned right of the path
    const psi = th + beta;
    betaAll[k] = beta;
    psiAll[k] = psi;
    ch.time[k] = t;
    ch.distance[k] = s;
    ch.x[k] = lerp(tr.x);
    ch.y[k] = 0.35;
    ch.z[k] = lerp(tr.z);
    ch.speed[k] = vel;
    ch.throttle[k] = Math.max(0, Math.min(1, throttle));
    ch.brake[k] = brakeIn;
    ch.steer[k] = steer;
    const gear = Math.min(6, 1 + Math.floor(vel / 11));
    ch.gear[k] = gear;
    ch.rpm[k] = 3000 + 5000 * ((vel % 11) / 11);
    // Lateral acceleration is lower while pushing or sliding: the tyres give less than they could.
    ch.latAcc[k] = -vel * vel * kap * (1 - 0.12 * pushW - 0.08 * overW);
    ch.longAcc[k] = a * (1 - 0.0 * lockW);
    ch.yaw[k] = psi;
    ch.latVel[k] = -vel * Math.sin(beta);
    ch.longVel[k] = vel * Math.cos(beta);
    // Wheels.
    const brakeFrac = Math.min(1, Math.max(0, -a / (car.braking * 1.3)));
    const driveFrac = Math.min(1, Math.max(0, a / car.traction));
    WHEELS.forEach((w) => {
      const front = w[0] === 'F';
      const left = w[1] === 'L';
      let ratio = braking ? -brakeFrac * 0.3 : 0;
      if (!braking && driven.includes(w)) ratio = driveFrac * 0.3;
      if (lockW > 0.05 && front) ratio = -(0.6 + 1.5 * lockW);
      if (lockW > 0.05 && !front) ratio = -0.35 - 0.25 * lockW;
      if (spinW > 0.05 && driven.includes(w)) ratio = 0.5 + 1.55 * spinW;
      const inner = (kap > 0) === left ? 1 : -1;
      const slipRatio = ratio + noise() * 0.1;
      ch[`slipRatio.${w}`][k] = slipRatio;
      // The outside of a turn compresses; weight moves forward under braking.
      const load = 0.5 + 0.3 * lat * (left ? -1 : 1) + (front ? 0.16 * brakeFrac : -0.1 * brakeFrac) + (front ? -0.08 : 0.08) * driveFrac;
      ch[`suspension.${w}`][k] = Math.max(0.02, Math.min(0.98, load + noise() * 0.3));
      const work = Math.abs(lat) * (0.6 + load) + brakeFrac * (front ? 1.1 : 0.5) + (driven.includes(w) ? driveFrac * 0.8 : 0) + Math.abs(slipRatio) * 0.6;
      temp[w] += (k ? ch.time[k] - ch.time[k - 1] : 0) * (work * 8 - (temp[w] - 74) * 0.05);
      ch[`tireTemp.${w}`][k] = temp[w];
      ch[`wheelSpeed.${w}`][k] = (vel * (1 + slipRatio) * (1 + inner * 0.02 * Math.abs(kap) * 20)) / 0.33;
    });
  }
  // Yaw rate from the heading, as the car turned.
  for (let k = 0; k < count; k++) {
    const a = Math.max(0, k - 1);
    const b = Math.min(count - 1, k + 1);
    ch.yawRate[k] = (psiAll[b] - psiAll[a]) / Math.max(1e-6, ch.time[b] - ch.time[a]);
  }
  void psiPrev;
  // Rounded for size.
  const digits = { time: 4, distance: 2, x: 2, y: 2, z: 2 };
  for (const c of names) {
    const d = digits[c] ?? (/Temp|rpm|wheelSpeed/.test(c) ? 1 : 4);
    for (let k = 0; k < count; k++) ch[c][k] = Number(ch[c][k].toFixed(d));
  }
  return { seconds, count, channels: ch };
}

function lapFile(car, driver, faults, opts = {}) {
  const sim = simulate(car, faults, opts.dt ?? 1 / 60, opts.seed ?? 1);
  return {
    format: 'heat3d-lap',
    game: 'forza-horizon',
    track: 'Demo Ring',
    car: { carOrdinal: car.ordinal, name: driver ? `${car.name} (${driver})` : car.name, carClass: car.cls, carPI: car.pi, drivetrain: car.drive },
    lap: { seconds: Number(sim.seconds.toFixed(3)), complete: true },
    meta: { slip: 'peak' },
    channels: sim.channels,
  };
}

// ------------------------------------------------------------------ the course as a model

function glb(file, parts) {
  const chunks = [];
  let offset = 0;
  const views = [];
  const accessors = [];
  const add = (arr, target, type, count, minmax) => {
    const bytes = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
    chunks.push(bytes);
    views.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, target });
    offset += bytes.length;
    const acc = { bufferView: views.length - 1, componentType: arr instanceof Uint32Array ? 5125 : 5126, count, type };
    if (minmax) Object.assign(acc, minmax);
    accessors.push(acc);
    return accessors.length - 1;
  };
  const meshes = parts.map((p, i) => {
    const m = p.pos.length / 3;
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let k = 0; k < p.pos.length; k++) {
      min[k % 3] = Math.min(min[k % 3], p.pos[k]);
      max[k % 3] = Math.max(max[k % 3], p.pos[k]);
    }
    const P = add(p.pos, 34962, 'VEC3', m, { min, max });
    const N = add(p.nor, 34962, 'VEC3', m);
    const C = add(p.col, 34962, 'VEC3', m);
    const I = add(p.idx, 34963, 'SCALAR', p.idx.length);
    return { name: p.name, primitives: [{ attributes: { POSITION: P, NORMAL: N, COLOR_0: C }, indices: I, material: i }] };
  });
  const json = {
    asset: { version: '2.0', generator: '3DHeat demo-race' },
    scene: 0,
    scenes: [{ nodes: parts.map((_, i) => i) }],
    nodes: parts.map((p, i) => ({ name: p.name, mesh: i })),
    meshes,
    materials: parts.map((p) => ({ name: p.name, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 } })),
    accessors,
    bufferViews: views,
    buffers: [{ byteLength: offset }],
  };
  const pad = (b, fill) => (b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4), fill)]) : b);
  const jb = pad(Buffer.from(JSON.stringify(json)), 0x20);
  const bb = pad(Buffer.concat(chunks), 0);
  const head = Buffer.alloc(12);
  head.writeUInt32LE(0x46546c67, 0);
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(12 + 8 + jb.length + 8 + bb.length, 8);
  const hd = (len, type) => {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(len, 0);
    b.writeUInt32LE(type, 4);
    return b;
  };
  writeFileSync(file, Buffer.concat([head, hd(jb.length, 0x4e4f534a), jb, hd(bb.length, 0x004e4942), bb]));
}

function ribbonModel(file) {
  const tr = TRACK;
  const half = 7;
  const step = 4; // every 2 m
  const pts = [];
  for (let i = 0; i < tr.n; i += step) pts.push(i);
  const m = pts.length;
  const pos = new Float32Array(m * 2 * 3);
  const col = new Float32Array(m * 2 * 3);
  const nor = new Float32Array(m * 2 * 3);
  pts.forEach((i, j) => {
    const th = tr.th[i];
    // Right of the direction of travel (sin, cos) is (cos, -sin).
    const rx = Math.cos(th);
    const rz = -Math.sin(th);
    pos.set([tr.x[i] - rx * half, 0, tr.z[i] - rz * half], j * 6);
    pos.set([tr.x[i] + rx * half, 0, tr.z[i] + rz * half], j * 6 + 3);
    for (let q = 0; q < 2; q++) {
      nor.set([0, 1, 0], j * 6 + q * 3);
      const stripe = Math.floor(i / 40) % 2 ? 0.02 : 0;
      col.set([0.2 + stripe, 0.21 + stripe, 0.23 + stripe], j * 6 + q * 3);
    }
  });
  const idx = [];
  for (let j = 0; j < m; j++) {
    const a = j * 2;
    const b = ((j + 1) % m) * 2;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  // Wound so the top faces up whichever way the points run.
  const up = new Uint32Array(idx);
  const ax = pos[3] - pos[0];
  const az = pos[5] - pos[2];
  const bx = pos[6] - pos[0];
  const bz = pos[8] - pos[2];
  if (az * bx - ax * bz < 0) for (let q = 0; q < up.length; q += 3) [up[q + 1], up[q + 2]] = [up[q + 2], up[q + 1]];
  const size = 3000;
  const gpos = new Float32Array([-size, -0.2, -size, size, -0.2, -size, size, -0.2, size, -size, -0.2, size]);
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i <= tr.n; i++) {
    minX = Math.min(minX, tr.x[i]);
    maxX = Math.max(maxX, tr.x[i]);
    minZ = Math.min(minZ, tr.z[i]);
    maxZ = Math.max(maxZ, tr.z[i]);
  }
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  for (let i = 0; i < 4; i++) {
    gpos[i * 3] += cx;
    gpos[i * 3 + 2] += cz;
  }
  const gnor = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
  const gcol = new Float32Array(12).fill(0).map((_, i) => [0.3, 0.4, 0.26][i % 3]);
  const gidx = new Uint32Array([0, 2, 1, 0, 3, 2]);
  glb(file, [
    { name: 'ground:Demo Ring grass', pos: gpos, nor: gnor, col: gcol, idx: gidx },
    { name: 'ground:Demo Ring road', pos, nor, col, idx: up },
  ]);
}

// ------------------------------------------------------------------ the sets

export default async function (outDir) {
  const dir = join(outDir, 'race');
  rmSync(dir, { recursive: true, force: true });
  for (const sub of ['main', 'sprint', 'stats']) mkdirSync(join(dir, sub), { recursive: true });
  const write = (sub, name, doc) => {
    writeFileSync(join(dir, sub, name), JSON.stringify(doc));
    return doc.lap.seconds;
  };
  ribbonModel(join(dir, 'demo-ring.glb'));
  const gt = CARS.gt;
  // The corner numbers here are the course's own (T1..T8).
  const faultsB1 = [
    { kind: 'brakeEarly', corner: 1, metres: 24 },
    { kind: 'lateThrottle', corner: 3, metres: 14 },
    { kind: 'lock', corner: 6, before: 46, length: 34 },
    { kind: 'wheelspin', corner: 4, after: -8, length: 36 },
    { kind: 'wheelspin', corner: 6, after: -6, length: 34 },
    { kind: 'push', corner: 7 },
  ];
  const faultsB2 = [
    { kind: 'lock', corner: 1, before: 40, length: 34 },
    { kind: 'oversteer', corner: 7 },
    { kind: 'wheelspin', corner: 6, after: -6, length: 34 },
    { kind: 'wheelspin', corner: 4, after: -6, length: 32 },
  ];
  const t = [];
  t.push(write('main', 'demo-ring-driver-a-lap1.json', lapFile(gt, 'A', [], { seed: 11 })));
  t.push(write('main', 'demo-ring-driver-b-lap1.json', lapFile(gt, 'B', faultsB1, { seed: 12 })));
  t.push(write('main', 'demo-ring-driver-b-lap2.json', lapFile(gt, 'B', faultsB2, { seed: 13 })));
  console.log('race main laps', t.map((x) => x.toFixed(2)).join(' '), 'course', (TRACK.n * DS).toFixed(0), 'm');
  const sp = CARS.sprint;
  write('sprint', 'demo-ring-sprint-lap1.json', lapFile(sp, '', [], { seed: 21 }));
  write('sprint', 'demo-ring-sprint-lap2.json', lapFile(sp, '', [{ kind: 'lock', corner: 1, before: 40, length: 30 }, { kind: 'wheelspin', corner: 6, after: -8, length: 32 }], { seed: 22 }));

  // The course statistics set: 36 laps, three classes.
  const R = rng(20261116);
  const rand = (a, b) => a + (b - a) * R();
  const classes = [
    { car: CARS.sprint, laps: 12 },
    { car: CARS.gt, laps: 14 },
    { car: CARS.rocket, laps: 10 },
  ];
  let no = 0;
  for (const { car, laps } of classes) {
    for (let i = 0; i < laps; i++) {
      no++;
      const faults = [{ kind: 'pace', factor: rand(0.96, 1.0) }];
      const maybe = (p, f) => R() < p && faults.push(f);
      // Hot spots: the hairpin's braking and T6's exit; a scatter elsewhere.
      maybe(0.55, { kind: 'lock', corner: 1, before: rand(30, 46), length: rand(24, 34) });
      maybe(0.45, { kind: 'wheelspin', corner: 6, after: -8, length: rand(28, 40) });
      maybe(0.18, { kind: 'brakeEarly', corner: 1, metres: rand(12, 26) });
      maybe(0.15, { kind: 'push', corner: 7 });
      maybe(0.12, { kind: 'oversteer', corner: 4 });
      maybe(0.12, { kind: 'lateThrottle', corner: 3, metres: rand(8, 18) });
      maybe(0.1, { kind: 'lock', corner: 6, before: rand(30, 46), length: rand(22, 30) });
      maybe(0.1, { kind: 'wheelspin', corner: 4, after: -4, length: 30 });
      write('stats', `demo-ring-${String(no).padStart(2, '0')}.json`, lapFile(car, '', faults, { dt: 0.05, seed: 100 + no }));
    }
  }
  console.log('race stats laps', no);
}
