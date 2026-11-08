/**
 * The compute shaders of the GPU tracks: `place` puts every track at the
 * playhead (`evaluate.ts` line for line), culls it to the view, picks how
 * it is drawn - the full figure when it is big on screen at true size (120 px),
 * the coarse one from 40 px, the far one below, the dart when tiny - and appends its instance to
 * that mesh's run; `finish` writes each run's count into the indirect draw
 * arguments, no more than the run has room for.
 *
 * Instance (4 x vec4, as `figures/instances.ts`): origin + scale, forward +
 * alpha, up + turret yaw, team colour + gun elevation (from the aim keys
 * after the tracks where the store has them, `store.ts`).
 */

import { KEYS_PER_BUFFER, TRACK_U32 } from './store';

export const PLACE_WGSL = /* wgsl */ `
struct U {
  viewProj : mat4x4<f32>,
  cam : vec4<f32>,   // camera xyz, playhead t
  px : vec4<f32>,    // focal length in px (0: orthographic), px size when orthographic, min px, stale s
  lod : vec4<f32>,   // units a metre, scale at true size, full figure from px, figure (not dart) from px
  n : vec4<u32>,     // tracks, meshes, trail vertex room, most trail segments a unit
  trail : vec4<f32>, // trail seconds (0: none), weapon streak seconds (<0: weapons hidden), marker seconds, marker px
  m : vec4<u32>,     // markers, 1 when every track is shown, 1 for drop lines, the floor's height (f32 bits)
};
@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read> tracks : array<u32>;
@group(0) @binding(2) var<storage, read> keysA : array<vec2<u32>>;
@group(0) @binding(3) var<storage, read> keysB : array<u32>;
@group(0) @binding(4) var<storage, read> runs : array<vec2<u32>>;   // per mesh: first instance, room
@group(0) @binding(5) var<storage, read_write> counts : array<atomic<u32>>;
@group(0) @binding(6) var<storage, read_write> inst : array<vec4<f32>>;
@group(0) @binding(7) var<storage, read_write> trail : array<vec4<f32>>;   // per vertex: position, then colour
@group(0) @binding(8) var<storage, read> vis : array<u32>;   // a bit a track: shown
@group(0) @binding(9) var<storage, read> keysA1 : array<vec2<u32>>;   // the keys past the first buffer's room

const TRACK_U32 = ${TRACK_U32}u;
const KEYS_PER_BUFFER = ${KEYS_PER_BUFFER}u;

fn keyRaw(j : u32) -> vec2<u32> {
  if (j < KEYS_PER_BUFFER) { return keysA[j]; }
  return keysA1[j - KEYS_PER_BUFFER];
}

fn unpackQ(v : u32) -> vec4<f32> {
  return vec4<f32>(
    f32(i32(v << 24u) >> 24u) / 127.0,
    f32(i32(v << 16u) >> 24u) / 127.0,
    f32(i32(v << 8u) >> 24u) / 127.0,
    f32(i32(v) >> 24u) / 127.0);
}

fn rot(q : vec4<f32>, v : vec3<f32>) -> vec3<f32> {
  let t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

// The track's span, set per thread before its keys are read: origin, position step, first time, time step.
var<private> spanO : vec3<f32>;
var<private> spanStep : f32;
var<private> spanT0 : f32;
var<private> spanTS : f32;

fn keyAt(j : u32) -> vec4<f32> {
  let k = keyRaw(j);
  return vec4<f32>(spanO + vec3<f32>(f32(k.x & 0xffffu), f32(k.x >> 16u), f32(k.y & 0xffffu)) * spanStep, spanT0 + f32(k.y >> 16u) * spanTS);
}

fn timeAt(j : u32) -> f32 {
  return spanT0 + f32(keyRaw(j).y >> 16u) * spanTS;
}

fn vel(j : u32, first : u32, last : u32) -> vec3<f32> {
  let o = keyAt(j);
  if (j > first && j < last) {
    let p = keyAt(j - 1u);
    let n = keyAt(j + 1u);
    let h0 = o.w - p.w;
    let h1 = n.w - o.w;
    return ((o.xyz - p.xyz) / h0) * (h1 / (h0 + h1)) + ((n.xyz - o.xyz) / h1) * (h0 / (h0 + h1));
  }
  if (j < last) {
    let n = keyAt(j + 1u);
    return (n.xyz - o.xyz) / (n.w - o.w);
  }
  if (j > first) {
    let p = keyAt(j - 1u);
    return (o.xyz - p.xyz) / (o.w - p.w);
  }
  return vec3<f32>(0.0);
}

fn noseWeight(v : f32) -> f32 {
  if (v <= 25.0) { return 0.0; }
  if (v >= 40.0) { return 1.0; }
  let x = (v - 25.0) / 15.0;
  return x * x * (3.0 - 2.0 * x);
}

fn turnTowards(a : vec3<f32>, d : vec3<f32>, w : f32) -> vec3<f32> {
  let c = clamp(dot(a, d), -1.0, 1.0);
  let th = acos(c);
  var k0 = 1.0 - w;
  var k1 = w;
  if (th > 1e-4) {
    let sn = sin(th);
    if (sn > 1e-6) { k0 = sin((1.0 - w) * th) / sn; k1 = sin(w * th) / sn; }
  }
  let r = a * k0 + d * k1;
  let l = length(r);
  if (l < 1e-12) { return a; }
  return r / l;
}

fn square(f : vec3<f32>, u0 : vec3<f32>) -> vec3<f32> {
  var r = u0 - f * dot(u0, f);
  var l = length(r);
  if (l < 1e-4) {
    r = vec3<f32>(0.0, 1.0, 0.0) - f * f.y;
    l = max(length(r), 1e-12);
  }
  return r / l;
}

@compute @workgroup_size(64)
fn place(@builtin(global_invocation_id) gid : vec3<u32>, @builtin(num_workgroups) nwg : vec3<u32>) {
  // More than 65535 groups of 64 go in rows of them.
  let i = gid.x + gid.y * nwg.x * 64u;
  if (i >= u.n.x) { return; }
  let b = i * TRACK_U32;
  let first = tracks[b];
  let count = tracks[b + 1u];
  let flags = tracks[b + 5u];
  let t = u.cam.w;
  if (count == 0u) { return; }
  // Hidden by a team toggle or a filter; a weapon while weapons are off.
  if (u.m.y == 0u && ((vis[i >> 5u] >> (i & 31u)) & 1u) == 0u) { return; }
  let weapon = (flags & 4u) != 0u;
  if (weapon && u.trail.y < 0.0) { return; }
  spanO = vec3<f32>(bitcast<f32>(tracks[b + 8u]), bitcast<f32>(tracks[b + 9u]), bitcast<f32>(tracks[b + 10u]));
  spanStep = bitcast<f32>(tracks[b + 11u]);
  spanT0 = bitcast<f32>(tracks[b + 12u]);
  spanTS = bitcast<f32>(tracks[b + 13u]);
  if (timeAt(first) > t) { return; }
  let last = first + count - 1u;
  var lo = first;
  var hi = last + 1u;
  loop {
    if (hi - lo <= 1u) { break; }
    let mid = (lo + hi) >> 1u;
    if (timeAt(mid) <= t) { lo = mid; } else { hi = mid; }
  }
  let k = lo;
  let A0 = keyAt(k);
  var P : vec3<f32>;
  var V : vec3<f32>;
  var sP = 0.0;
  var kb = k;
  if (k == last) {
    let hold = bitcast<f32>(tracks[b + 14u]);
    if (hold < 1e8 && t - A0.w > select(u.px.w, min(u.px.w, hold - 1.0), hold > 0.5)) { return; }
    P = A0.xyz;
    V = vel(k, first, last);
  } else {
    kb = k + 1u;
    let A1 = keyAt(k + 1u);
    let h = A1.w - A0.w;
    let s = clamp((t - A0.w) / h, 0.0, 1.0);
    sP = s;
    let va = vel(k, first, last);
    let vb = vel(k + 1u, first, last);
    let C = A1.xyz - A0.xyz;
    let cap = 1.5 * length(C);
    var m0 = length(va) * h;
    var m1 = length(vb) * h;
    if (m0 > cap) { m0 = (cap / m0) * h; } else { m0 = h; }
    if (m1 > cap) { m1 = (cap / m1) * h; } else { m1 = h; }
    let s2 = s * s;
    let s3 = s2 * s;
    let h00 = 2.0 * s3 - 3.0 * s2 + 1.0;
    let h10 = s3 - 2.0 * s2 + s;
    let h01 = -2.0 * s3 + 3.0 * s2;
    let h11 = s3 - s2;
    let d00 = 6.0 * s2 - 6.0 * s;
    let d10 = 3.0 * s2 - 4.0 * s + 1.0;
    let d11 = 3.0 * s2 - 2.0 * s;
    P = h00 * A0.xyz + h10 * va * m0 + h01 * A1.xyz + h11 * vb * m1;
    V = (d00 * -C + d10 * va * m0 + d11 * vb * m1) / h;
  }

  // Off screen: nothing to draw (a margin for big figures near the edges).
  let clip = u.viewProj * vec4<f32>(P, 1.0);
  if (clip.w <= 0.0) { return; }
  let ndc = clip.xy / clip.w;
  if (abs(ndc.x) > 1.3 || abs(ndc.y) > 1.3) { return; }

  // Forward and up.
  let speed = length(V);
  var f = vec3<f32>(1.0, 0.0, 0.0);
  var up = vec3<f32>(0.0, 1.0, 0.0);
  if ((flags & 2u) != 0u) {
    let qa = unpackQ(keysB[k]);
    var qb = unpackQ(keysB[kb]);
    var d = dot(qa, qb);
    if (d < 0.0) { qb = -qb; d = -d; }
    var k0 = 1.0 - sP;
    var k1 = sP;
    if (d < 0.9995) {
      let th = acos(min(1.0, d));
      let sn = sin(th);
      k0 = sin((1.0 - sP) * th) / sn;
      k1 = sin(sP * th) / sn;
    }
    let q = normalize(qa * k0 + qb * k1);
    f = rot(q, vec3<f32>(1.0, 0.0, 0.0));
    up = rot(q, vec3<f32>(0.0, 1.0, 0.0));
    let w = noseWeight(speed / u.lod.x);
    if (w > 0.0) {
      f = turnTowards(f, V / speed, w);
      up = square(f, up);
    }
  } else if (speed > 0.2 * u.lod.x) {
    f = V / speed;
    up = square(f, vec3<f32>(0.0, 1.0, 0.0));
  }
  if ((flags & 1u) == 0u) {
    let l = length(f.xz);
    if (l > 1e-6) { f = vec3<f32>(f.x / l, 0.0, f.z / l); } else { f = vec3<f32>(1.0, 0.0, 0.0); }
    up = vec3<f32>(0.0, 1.0, 0.0);
  }

  // How big: true size, or as big as it takes to stay min px long; and so which mesh.
  var pxSize = u.px.y;
  if (u.px.x > 0.0) { pxSize = distance(P, u.cam.xyz) / u.px.x; }
  let longest = bitcast<f32>(tracks[b + 4u]);
  let meshes = tracks[b + 3u];
  let trueLen = longest * u.lod.y / pxSize;
  var mesh = 0u;
  var size = longest;
  if (meshes != 0u && trueLen >= u.lod.w) {
    // Full when big at true size, coarse from a third of that, far below.
    mesh = meshes & 0xffffu;
    if (trueLen < u.lod.z) { mesh = meshes >> 16u; }
    if (trueLen < u.lod.z / 3.0) { mesh = tracks[b + 6u]; }
  } else {
    size = 1.0;
  }
  var scale = max(u.lod.y, u.px.z * pxSize / size);
  var slot = atomicAdd(&counts[mesh], 1u);
  let run = runs[mesh];
  if (slot >= run.y) {
    // Its mesh's run is full: a dart.
    mesh = 0u;
    scale = max(u.lod.y, u.px.z * pxSize);
    slot = atomicAdd(&counts[0], 1u);
    if (slot >= runs[0].y) { return; }
  }
  let o = (runs[mesh].x + slot) * 4u;
  let c = tracks[b + 2u];
  // The turret and gun, where the store has them after the tracks: between keys the short way round.
  var tYaw = 0.0;
  var gPitch = -100.0;
  if ((flags & 8u) != 0u) {
    let ia = u.n.x * TRACK_U32 + k;
    let ib = u.n.x * TRACK_U32 + kb;
    if (ib < arrayLength(&tracks)) {
      let wa = tracks[ia];
      let wb = tracks[ib];
      if ((wa & 0xffffu) != 0xffffu) {
        let ya = f32(wa & 0xffffu) / 65534.0 * 6.2831853 - 3.14159265;
        var yb = ya;
        if ((wb & 0xffffu) != 0xffffu) { yb = f32(wb & 0xffffu) / 65534.0 * 6.2831853 - 3.14159265; }
        var dy = yb - ya;
        if (dy > 3.14159265) { dy = dy - 6.2831853; }
        if (dy < -3.14159265) { dy = dy + 6.2831853; }
        tYaw = ya + dy * sP;
      }
      if ((wa >> 16u) != 0xffffu) {
        let pa = f32(wa >> 16u) / 65534.0 * 3.14159265 - 1.57079633;
        var pb = pa;
        if ((wb >> 16u) != 0xffffu) { pb = f32(wb >> 16u) / 65534.0 * 3.14159265 - 1.57079633; }
        gPitch = pa + (pb - pa) * sP;
      }
    }
  }
  inst[o] = vec4<f32>(P, scale);
  inst[o + 1u] = vec4<f32>(f, 1.0);
  inst[o + 2u] = vec4<f32>(up, tYaw);
  let team = vec3<f32>(f32(c & 255u) / 255.0, f32((c >> 8u) & 255u) / 255.0, f32((c >> 16u) & 255u) / 255.0);
  inst[o + 3u] = vec4<f32>(team, gPitch);

  // Its trail: from where it is back through its keys over the last seconds, fading with age; a weapon's streak.
  var W = u.trail.x;
  if (weapon) { W = max(W, u.trail.y); }
  // Its drop line, as Tacview draws it: straight down to the data's floor.
  let floorY = bitcast<f32>(u.m.w);
  let drop = u.m.z != 0u && P.y - floorY >= 1.0;
  if (W <= 0.0 && !drop) { return; }
  var segs = 0u;
  if (W > 0.0) {
    segs = 1u;
    var j = k;
    loop {
      if (j <= first || segs >= u.n.w) { break; }
      if (timeAt(j) < t - W) { break; }
      j = j - 1u;
      segs = segs + 1u;
    }
  }
  let lines = segs + select(0u, 1u, drop);
  let base = atomicAdd(&counts[u.n.y], lines * 2u);
  if (base + lines * 2u > u.n.z) { return; }
  if (drop) {
    let v = (base + segs * 2u) * 2u;
    trail[v] = vec4<f32>(P, 1.0);
    trail[v + 1u] = vec4<f32>(team, 0.55);
    trail[v + 2u] = vec4<f32>(P.x, floorY, P.z, 1.0);
    trail[v + 3u] = vec4<f32>(team, 0.15);
  }
  var a = P;
  var ta = t;
  var kk = k;
  for (var n = 0u; n < segs; n = n + 1u) {
    let key = keyAt(kk);
    let v = (base + n * 2u) * 2u;
    trail[v] = vec4<f32>(a, 1.0);
    trail[v + 1u] = vec4<f32>(team, 0.8 * clamp(1.0 - (t - ta) / W, 0.0, 1.0));
    trail[v + 2u] = vec4<f32>(key.xyz, 1.0);
    trail[v + 3u] = vec4<f32>(team, 0.8 * clamp(1.0 - (t - key.w) / W, 0.0, 1.0));
    a = key.xyz;
    ta = key.w;
    if (kk > first) { kk = kk - 1u; }
  }
}
`;

/**
 * Deaths as markers: each one dead within the last marker seconds a small
 * cross in its team's colour, fading as it ages, kept some pixels big; its
 * three lines go into the trail buffer, drawn with the trails.
 */
export const MARKS_WGSL = /* wgsl */ `
struct U {
  viewProj : mat4x4<f32>,
  cam : vec4<f32>,
  px : vec4<f32>,
  lod : vec4<f32>,
  n : vec4<u32>,
  trail : vec4<f32>,
  m : vec4<u32>,
};
@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read> markPos : array<vec4<f32>>;   // x, y, z, time
@group(0) @binding(2) var<storage, read> markColour : array<u32>;
@group(0) @binding(3) var<storage, read_write> counts : array<atomic<u32>>;
@group(0) @binding(4) var<storage, read_write> trail : array<vec4<f32>>;

@compute @workgroup_size(64)
fn marks(@builtin(global_invocation_id) gid : vec3<u32>, @builtin(num_workgroups) nwg : vec3<u32>) {
  let i = gid.x + gid.y * nwg.x * 64u;
  if (i >= u.m.x) { return; }
  let mk = markPos[i];
  let age = u.cam.w - mk.w;
  let W = u.trail.z;
  if (age < 0.0 || age > W) { return; }
  let clip = u.viewProj * vec4<f32>(mk.xyz, 1.0);
  if (clip.w <= 0.0) { return; }
  let ndc = clip.xy / clip.w;
  if (abs(ndc.x) > 1.1 || abs(ndc.y) > 1.1) { return; }
  var pxSize = u.px.y;
  if (u.px.x > 0.0) { pxSize = distance(mk.xyz, u.cam.xyz) / u.px.x; }
  let r = 0.5 * u.trail.w * pxSize;
  let c = markColour[i];
  let a = 0.95 * clamp(1.0 - age / W, 0.3, 1.0);
  let col = vec4<f32>(f32(c & 255u) / 255.0, f32((c >> 8u) & 255u) / 255.0, f32((c >> 16u) & 255u) / 255.0, a);
  let base = atomicAdd(&counts[u.n.y], 6u);
  if (base + 6u > u.n.z) { return; }
  let axes = array<vec3<f32>, 3>(vec3<f32>(r, 0.0, r), vec3<f32>(r, 0.0, -r), vec3<f32>(0.0, 1.4 * r, 0.0));
  for (var k = 0u; k < 3u; k = k + 1u) {
    let v = (base + k * 2u) * 2u;
    trail[v] = vec4<f32>(mk.xyz - axes[k], 1.0);
    trail[v + 1u] = col;
    trail[v + 2u] = vec4<f32>(mk.xyz + axes[k], 1.0);
    trail[v + 3u] = col;
  }
}
`;

export const FINISH_WGSL = /* wgsl */ `
@group(0) @binding(0) var<storage, read> runs : array<vec2<u32>>;
@group(0) @binding(1) var<storage, read> counts : array<u32>;
@group(0) @binding(2) var<storage, read_write> args : array<u32>;
@group(0) @binding(3) var<uniform> n : vec4<u32>;   // meshes, trail vertex room
@group(0) @binding(4) var<storage, read_write> trailArgs : array<u32>;

@compute @workgroup_size(64)
fn finish(@builtin(global_invocation_id) gid : vec3<u32>) {
  let m = gid.x;
  if (m == n.x) {
    // The trail's vertex count: whole segments that fitted.
    let c = counts[n.x];
    trailArgs[0] = min(c, n.y);
    return;
  }
  if (m > n.x) { return; }
  args[m * 4u + 1u] = min(counts[m], runs[m].y);
}
`;

/** Trails: line segments the place pass wrote, position + colour a vertex. */
export const TRAIL_WGSL = /* wgsl */ `
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct TrailOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) colour : vec4<f32>,
};

@vertex
fn vsTrail(@location(0) position : vec4<f32>, @location(1) colour : vec4<f32>) -> TrailOut {
  var out : TrailOut;
  out.colour = colour;
  out.pos = u.viewProj * vec4<f32>(position.xyz, 1.0);
  return out;
}

@fragment
fn fsTrail(in : TrailOut) -> @location(0) vec4<f32> {
  if (in.colour.a <= 0.002) { discard; }
  return in.colour;
}
`;
