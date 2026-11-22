
struct U {
  viewProj : mat4x4<f32>,
  cam : vec4<f32>,   // camera xyz, playhead t
  px : vec4<f32>,    // focal length in px (0: orthographic), px size when orthographic, min px, stale s
  lod : vec4<f32>,   // units a metre, scale at true size, full figure from px, figure (not dart) from px
  n : vec4<u32>,     // tracks, meshes, trail vertex room, most trail segments a unit
  trail : vec4<f32>, // trail seconds (0: none), weapon streak seconds (<0: weapons hidden), marker seconds, marker px
  m : vec4<u32>,     // markers, 1 when every track is shown, 1 for drop lines, the floor's height (f32 bits)
  x : vec4<u32>,     // the playhead's remainder below cam.w (f32 bits), where the aim keys start in tracks, where the greyed bits start in vis (0: none)
  sym : vec4<f32>,   // far mode (0 figure, 1 arrow, 2 symbol), symbol threshold px, symbol px, 1: drop lines on weapons
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

const TRACK_U32 = 16u;
const KEYS_PER_BUFFER = 268369920u;

fn keyRaw(j : u32) -> vec2<u32> {
  if (j < KEYS_PER_BUFFER) { return keysA[j]; }
  return keysA1[j - KEYS_PER_BUFFER];
}

fn unpackQ(v : u32) -> vec4<f32> {
  return vec4<f32>(
    f32(i32(v << 24u) >> 24u) / 127.0,
    f32(i32(v << 16u) >> 24u) / 127.0,
    f32(i32(v << 8u) >> 24u) / 127.0,
    f32(i32(v & 0x7fffffffu) >> 24u) / 127.0);
}

// A gap in the samples follows key j (`store.ts` GAP_BIT, the top bit of its attitude word; w is 0 or more).
fn gapAfter(j : u32) -> bool {
  return (keysB[j] & 0x80000000u) != 0u;
}

fn gapFade(since : f32, before : f32) -> f32 {
  var lead = 0.5;
  if (before > 0.0) { lead = clamp(before, 0.05, 1.2); }
  return clamp(1.0 - (since - lead) / 0.3, 0.0, 1.0);
}


fn rot(q : vec4<f32>, v : vec3<f32>) -> vec3<f32> {
  let t = 2.0 * cross(q.xyz, v);
  return v + q.w * t + cross(q.xyz, t);
}

// The track, set per thread before its keys are read: where it is in tracks, its first key, its chunk spans (0: none).
var<private> spanTrack : u32;
var<private> spanFirst : u32;
var<private> spanChunks : u32;
// The playhead as cam.w plus the rest that a f32 of it leaves out: key times are taken relative to it.
var<private> tLo : f32;

// Where key j's span is (origin xyz, position step, first time, time step): its chunk's, else the track's.
fn spanOf(j : u32) -> u32 {
  if (spanChunks == 0u) { return spanTrack + 8u; }
  return spanChunks + ((j - spanFirst) >> 6u) * 8u;
}

// Key j's time, seconds from the playhead: the span's first time less the playhead's f32 is exact near it.
fn timeAt(j : u32) -> f32 {
  let o = spanOf(j);
  return (bitcast<f32>(tracks[o + 4u]) - u.cam.w) + f32(keyRaw(j).y >> 16u) * bitcast<f32>(tracks[o + 5u]) - tLo;
}

// Key j: position, and time from the playhead.
fn keyAt(j : u32) -> vec4<f32> {
  let o = spanOf(j);
  let k = keyRaw(j);
  let O = vec3<f32>(bitcast<f32>(tracks[o]), bitcast<f32>(tracks[o + 1u]), bitcast<f32>(tracks[o + 2u]));
  let t = (bitcast<f32>(tracks[o + 4u]) - u.cam.w) + f32(k.y >> 16u) * bitcast<f32>(tracks[o + 5u]) - tLo;
  return vec4<f32>(O + vec3<f32>(f32(k.x & 0xffffu), f32(k.x >> 16u), f32(k.y & 0xffffu)) * bitcast<f32>(tracks[o + 3u]), t);
}

fn vel(j : u32, first0 : u32, last0 : u32, gaps : bool) -> vec3<f32> {
  let o = keyAt(j);
  // A gap ends the track there, either way.
  var first = first0;
  var last = last0;
  if (gaps) {
    if (j < last && gapAfter(j)) { last = j; }
    if (j > first && gapAfter(j - 1u)) { first = j; }
  }
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

// `symbols/lod.ts` farLook: the model's alpha, the glyph's, 1 for a dart, 1 for true size.
fn farLook(dom : u32, trueLen : f32, hasMesh : bool) -> vec4<f32> {
  if (dom == 13u) { return vec4<f32>(0.0, 0.0, 0.0, 1.0); }
  if (dom == 11u || dom == 12u || dom == 15u) {
    if (dom == 15u && hasMesh && trueLen >= 14.0) { return vec4<f32>(1.0, 0.0, 0.0, 1.0); }
    return vec4<f32>(0.0, 1.0, 0.0, 1.0);
  }
  if (dom >= 3u && dom <= 5u) {
    var fa = 0.0;
    if (hasMesh) { fa = smoothstep(14.0 * 0.7, 14.0, trueLen); }
    return vec4<f32>(fa, 1.0 - fa, 0.0, 1.0);
  }
  if (dom == 14u) { return vec4<f32>(select(0.0, 1.0, hasMesh), 0.0, 0.0, 0.0); }
  if (u.sym.x > 1.5) {
    var fa = 0.0;
    if (hasMesh) { fa = smoothstep(u.sym.y * 0.7, u.sym.y, trueLen); }
    return vec4<f32>(fa, 1.0 - fa, 0.0, 0.0);
  }
  let fig = hasMesh && trueLen >= u.lod.w;
  let dartable = dom <= 2u || (dom >= 6u && dom <= 10u);
  return vec4<f32>(select(0.0, 1.0, fig), 0.0, select(0.0, 1.0, !fig && dartable), 0.0);
}

fn dartIndex(dom : u32) -> u32 {
  if (dom == 2u) { return 1u; }
  if (dom == 6u) { return 2u; }
  if (dom == 7u) { return 3u; }
  if (dom == 8u) { return 4u; }
  if (dom == 9u) { return 5u; }
  if (dom == 10u) { return 6u; }
  return 0u;
}

fn glyphPx(dom : u32) -> f32 {
  if (dom == 3u) { return select(22.0, u.sym.z, u.sym.x > 1.5); }
  if (dom == 5u) { return 16.0; }
  if (dom == 4u) { return 13.0; }
  if (dom == 11u) { return 12.0; }
  if (dom == 12u) { return 10.0; }
  if (dom == 15u) { return 6.0; }
  return u.sym.z;
}

fn chaffMetres(age : f32) -> f32 { return 3.0 + 12.0 * min(1.0, max(0.0, age) / 3.0); }

fn decoyAlpha(dom : u32, age : f32, life : f32, seed : f32) -> f32 {
  let left = max(0.15, 1.0 - max(0.0, age) / max(0.5, life));
  if (dom == 11u) { return left * (0.8 + 0.2 * sin(seed * 1.7 + u.cam.w * 31.0)); }
  return 0.75 * left;
}

// A trail's colour (x < 0: the team's) and longest seconds (w < 0: as set), by what it is.
fn trailLook(dom : u32) -> vec4<f32> {
  if (dom == 13u) { return vec4<f32>(1.0, 0.82, 0.4, 0.06); }
  if (dom == 11u) { return vec4<f32>(0.78, 0.78, 0.76, 1.2); }
  if (dom == 4u) { return vec4<f32>(0.7, 0.7, 0.7, 1.0); }
  if (dom == 3u || dom == 5u) { return vec4<f32>(0.93, 0.93, 0.92, -1.0); }
  return vec4<f32>(-1.0, 0.0, 0.0, -1.0);
}

// A motor's burn, seconds, by class: the smoke is thick while it burns, thin after.
fn burnSeconds(dom : u32, cls : u32) -> f32 {
  if (dom == 5u) { return 1.5; }
  if (cls == 13u) { return 8.0; }
  if (cls == 14u) { return 5.0; }
  if (cls == 15u) { return 0.0; }
  return 6.0;
}

fn trailAlpha(dom : u32, cls : u32, age : f32) -> f32 {
  if (dom == 13u) { return 1.0; }
  if (dom == 11u) { return 0.5; }
  if (dom == 4u) { return 0.2; }
  if (dom == 3u || dom == 5u) { return select(0.25, 0.85, age < burnSeconds(dom, cls)); }
  return 0.8;
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
  // Times are from the playhead.
  let t = 0.0;
  if (count == 0u) { return; }
  // Hidden by a team toggle or a filter; a weapon while weapons are off.
  if (u.m.y == 0u && ((vis[i >> 5u] >> (i & 31u)) & 1u) == 0u) { return; }
  let weapon = (flags & 4u) != 0u;
  if (weapon && u.trail.y < 0.0) { return; }
  spanTrack = b;
  spanFirst = first;
  spanChunks = tracks[b + 7u];
  tLo = bitcast<f32>(u.x.x);
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
  // A gap in its samples after this key (`data/gaps.ts`): held there, faded out once its next update is late, then hidden.
  let gaps = (flags & 16u) != 0u;
  let inGap = gaps && k < last && gapAfter(k);
  var gapA = 1.0;
  if (inGap) {
    var before = -1.0;
    if (k > first && !gapAfter(k - 1u)) { before = A0.w - timeAt(k - 1u); }
    gapA = gapFade(t - A0.w, before);
    if (gapA <= 0.0) { return; }
  }
  if (inGap) {
    P = A0.xyz;
    V = vel(k, first, last, true);
  } else if (k == last) {
    let hold = bitcast<f32>(tracks[b + 14u]);
    if (hold < 1e8 && t - A0.w > select(u.px.w, min(u.px.w, hold - 1.0), hold > 0.5)) { return; }
    P = A0.xyz;
    V = vel(k, first, last, gaps);
  } else {
    kb = k + 1u;
    let A1 = keyAt(k + 1u);
    let h = A1.w - A0.w;
    let s = clamp((t - A0.w) / h, 0.0, 1.0);
    sP = s;
    let va = vel(k, first, last, gaps);
    let vb = vel(k + 1u, first, last, gaps);
    let C = A1.xyz - A0.xyz;
    let cap = 1.5 * length(C);
    var m0 = length(va) * h;
    var m1 = length(vb) * h;
    if (m0 > cap) { m0 = (cap / m0) * h; } else { m0 = h; }
    if (m1 > cap) { m1 = (cap / m1) * h; } else { m1 = h; }
    let s2 = s * s;
    let s3 = s2 * s;
    let h10 = s3 - 2.0 * s2 + s;
    let h01 = -2.0 * s3 + 3.0 * s2;
    let h11 = s3 - s2;
    let d00 = 6.0 * s2 - 6.0 * s;
    let d10 = 3.0 * s2 - 4.0 * s + 1.0;
    let d11 = 3.0 * s2 - 2.0 * s;
    // From A0 (h00 = 1 - h01): no sum of two big coordinates.
    P = A0.xyz + (h10 * va * m0 + h01 * C + h11 * vb * m1);
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

  // How big on screen at true size, and so how it is drawn (`symbols/lod.ts`): its model, its domain's dart, its glyph or symbol.
  var pxSize = u.px.y;
  if (u.px.x > 0.0) { pxSize = distance(P, u.cam.xyz) / u.px.x; }
  let longest = bitcast<f32>(tracks[b + 4u]);
  let meshes = tracks[b + 3u];
  let trueLen = longest * u.lod.y / pxSize;
  var word = tracks[b + 15u];
  if (word == 0u) { word = select(393216u, 65537u, (flags & 1u) != 0u); }
  let dom = (word >> 16u) & 15u;
  let cls = word & 255u;
  if (speed > 0.5 * u.lod.x) { word = word | 1048576u; }
  let look = farLook(dom, trueLen, meshes != 0u);
  // Seconds since its first key: a decoy's bloom and fade, a motor's burn.
  let age = -timeAt(first);
  let c = tracks[b + 2u];
  var team = vec3<f32>(f32(c & 255u) / 255.0, f32((c >> 8u) & 255u) / 255.0, f32((c >> 16u) & 255u) / 255.0);
  // Out of combat, not destroyed (ACMI Disabled, `visibility.ts` withHidden): its colour half way to grey.
  if (u.x.z != 0u && ((vis[u.x.z + (i >> 5u)] >> (i & 31u)) & 1u) != 0u) { team = team * 0.5 + 0.25; }
  // A wreck between its death and its return to life (`store.ts` setDeadSpan, as fractions of its keys): charred grey,
  // which its model's instance carries negated (`figures/wreck.ts`), and its symbol crossed out.
  var tsign = 1.0;
  let dA = tracks[b + 5u] >> 16u;
  if (dA != 0u) {
    let frac = age / max(timeAt(last) + age, 1e-6);
    let dB = tracks[b + 6u] >> 16u;
    if (frac >= f32(dA - 1u) / 65534.0 && (dB == 0u || frac < f32(dB - 1u) / 65534.0)) {
      team = vec3<f32>(0.15) + 0.06 * team;
      tsign = -1.0;
      word = (word & ~1048576u) | 2097152u;
    }
  }
  // Below the gun's "as built": what it is, for the dart's shape and the glyph (`symbolClass.ts`).
  let tag = -1000.0 - f32(word);
  var glyphA = look.y;
  var dart = look.z > 0.5;
  if (look.x > 0.0) {
    // Full when big as drawn (after the smallest-figure growth), coarse from a third of that, far below.
    var scale = u.lod.y;
    if (look.w < 0.5) { scale = max(u.lod.y, u.px.z * pxSize / longest); }
    let drawnLen = longest * scale / pxSize;
    var mesh = meshes & 0xffffu;
    if (drawnLen < u.lod.z) { mesh = meshes >> 16u; }
    if (drawnLen < u.lod.z / 3.0) { mesh = tracks[b + 6u] & 0xffffu; }
    let slot = atomicAdd(&counts[mesh], 1u);
    if (slot < runs[mesh].y) {
      let o = (runs[mesh].x + slot) * 4u;
      // The turret and gun, where the store has them after the tracks: between keys the short way round.
      var tYaw = 0.0;
      var gPitch = -100.0;
      if ((flags & 8u) != 0u) {
        let ia = u.x.y + k;
        let ib = u.x.y + kb;
        if (ib < arrayLength(&tracks)) {
          let wa = tracks[ia];
          let wb = tracks[ib];
          if ((wa & 0xffffu) < 0xfffeu) {
            let ya = f32(wa & 0xffffu) / 65534.0 * 6.2831853 - 3.14159265;
            var yb = ya;
            if ((wb & 0xffffu) < 0xfffeu) { yb = f32(wb & 0xffffu) / 65534.0 * 6.2831853 - 3.14159265; }
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
          // Landing gear up at the key (store.ts GEAR_UP_WORD): figures/instances.ts GEAR_UP off the slot.
          if ((wa & 0xffffu) == 0xfffeu) { gPitch = -300.0; }
        }
      }
      inst[o] = vec4<f32>(P, scale);
      inst[o + 1u] = vec4<f32>(f, look.x * gapA);
      inst[o + 2u] = vec4<f32>(up, tYaw);
      inst[o + 3u] = vec4<f32>(team * tsign, gPitch);
    } else if (u.sym.x > 1.5 || look.w > 0.5) {
      // Its mesh's run is full: its symbol or glyph.
      glyphA = 1.0;
    } else {
      dart = true;
    }
  }
  if (dart) {
    // Its domain's dart, from that dart's own run (`symbols/darts.ts`).
    let dm = dartIndex(dom);
    let slot = atomicAdd(&counts[dm], 1u);
    if (slot < runs[dm].y) {
      let o = (runs[dm].x + slot) * 4u;
      inst[o] = vec4<f32>(P, max(u.lod.y, u.px.z * pxSize));
      inst[o + 1u] = vec4<f32>(f, gapA);
      inst[o + 2u] = vec4<f32>(up, 0.0);
      inst[o + 3u] = vec4<f32>(team * tsign, tag);
    }
  }
  if (glyphA > 0.0) {
    var gpx = glyphPx(dom);
    var ga = glyphA * gapA;
    if (dom == 11u || dom == 12u) {
      let life = timeAt(last) + age;
      ga = ga * decoyAlpha(dom, age, life, f32(i));
      if (dom == 12u) { gpx = clamp(chaffMetres(age) * u.lod.x / pxSize, 3.0, 96.0); }
    }
    let slot = atomicAdd(&counts[u.n.y + 1u], 1u);
    if (slot < runs[u.n.y].y) {
      let o = (runs[u.n.y].x + slot) * 4u;
      inst[o] = vec4<f32>(P, gpx);
      inst[o + 1u] = vec4<f32>(f, ga);
      inst[o + 2u] = vec4<f32>(up, 0.0);
      inst[o + 3u] = vec4<f32>(team, tag);
    }
  }

  // Its trail: from where it is back through its keys over the last seconds, fading with age; a weapon's streak.
  var W = u.trail.x;
  if (weapon) { W = max(W, u.trail.y); }
  // A weapon's smoke, a flare's falling smoke, a shell's tracer: their own colour and length (`trailLook`).
  let tl = trailLook(dom);
  var tc = team;
  if (tl.x >= 0.0) { tc = tl.xyz; }
  if (tl.w >= 0.0) { W = min(max(W, 0.001), tl.w); }
  if (dom == 12u || dom == 15u) { W = 0.0; }
  // A wreck leaves no trail.
  if ((word & 2097152u) != 0u) { W = 0.0; }
  let ta0 = trailAlpha(dom, cls, age);
  // Its drop line, as Tacview draws it: straight down to the data's floor; none for weapons (unless asked) and decoys.
  let floorY = bitcast<f32>(u.m.w);
  let noDrop = (dom >= 3u && dom <= 5u && u.sym.w < 0.5) || (dom >= 11u && dom <= 13u) || dom == 15u;
  let drop = u.m.z != 0u && P.y - floorY >= 1.0 && !noDrop;
  if (W <= 0.0 && !drop) { return; }
  if (dom == 13u) {
    // A tracer: a short bright line back along its flight, however far apart its keys are.
    let tb = atomicAdd(&counts[u.n.y], 2u);
    if (tb + 2u > u.n.z) { return; }
    trail[tb * 2u] = vec4<f32>(P, 1.0);
    trail[tb * 2u + 1u] = vec4<f32>(tc, 1.0);
    trail[tb * 2u + 2u] = vec4<f32>(P - V * 0.06, 1.0);
    trail[tb * 2u + 3u] = vec4<f32>(tc, 0.0);
    return;
  }
  var segs = 0u;
  if (W > 0.0) {
    segs = 1u;
    var j = k;
    loop {
      if (j <= first || segs >= u.n.w) { break; }
      if (timeAt(j) < t - W) { break; }
      // It breaks where a gap in the samples was.
      if (gaps && gapAfter(j - 1u)) { break; }
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
    // A piece within a metre of where the unit is, at both ends, is not drawn: a thing that stays put
    // (a parked tank, a burnt-out tram) draws nothing, however its samples wobble.
    let near = distance(a, P) < u.lod.x && distance(key.xyz, P) < u.lod.x;
    let fade = select(1.0, 0.0, near);
    trail[v] = vec4<f32>(a, 1.0);
    trail[v + 1u] = vec4<f32>(tc, fade * ta0 * clamp(1.0 - (t - ta) / W, 0.0, 1.0));
    trail[v + 2u] = vec4<f32>(key.xyz, 1.0);
    trail[v + 3u] = vec4<f32>(tc, fade * ta0 * clamp(1.0 - (t - key.w) / W, 0.0, 1.0));
    a = key.xyz;
    ta = key.w;
    if (kk > first) { kk = kk - 1u; }
  }
}
