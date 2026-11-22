
struct SU { viewProj : mat4x4<f32>, view : vec4<f32>, cam : vec4<f32> };
@group(0) @binding(0) var<uniform> u : SU;

struct MOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
  @location(1) @interpolate(flat) rgb : vec4<f32>,
  @location(2) @interpolate(flat) tick : vec4<f32>,
};

fn corner(vi : u32) -> vec2<f32> {
  let c = vi % 6u;
  return vec2<f32>(select(-1.0, 1.0, c == 1u || c == 2u || c == 4u), select(-1.0, 1.0, c == 2u || c == 4u || c == 5u));
}

fn sdBox(p : vec2<f32>, b : vec2<f32>) -> f32 {let d = abs(p) - b; return length(max(d, vec2<f32>(0.0))) + min(max(d.x, d.y), 0.0);}
fn sdSeg(p : vec2<f32>, a : vec2<f32>, b : vec2<f32>) -> f32 {let pa = p - a; let ba = b - a; let h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h);}
fn sdTri(p : vec2<f32>) -> f32 {let k = 1.7320508; var q = vec2<f32>(abs(p.x) - 0.36, p.y + 0.2); if (q.x + k * q.y > 0.0) { q = vec2<f32>(q.x - k * q.y, -k * q.x - q.y) / 2.0; } q.x = q.x - clamp(q.x, -0.72, 0.0); return -length(q) * sign(q.y);}
fn glyph(p : vec2<f32>, kind : u32) -> f32 {
  if (kind == 1u) { return min(sdBox(p - vec2<f32>(0.0, -0.12), vec2<f32>(0.42, 0.2)), sdBox(p - vec2<f32>(0.0, 0.22), vec2<f32>(0.07, 0.3))); }
  if (kind == 2u) { return sdTri(p); }
  if (kind == 3u) { return min(length(p - vec2<f32>(0.0, -0.08)) - 0.24, sdBox(p - vec2<f32>(0.0, 0.3), vec2<f32>(0.46, 0.06))); }
  if (kind == 4u) { return max(length(p - vec2<f32>(0.0, 0.12)) - 0.44, p.y - 0.06); }
  if (kind == 5u) { return min(sdBox(p - vec2<f32>(0.0, 0.26), vec2<f32>(0.4, 0.07)), sdBox(p - vec2<f32>(0.0, -0.06), vec2<f32>(0.07, 0.34))); }
  if (kind == 6u) { return sdBox(p, vec2<f32>(0.42, 0.18)) - 0.06; }
  if (kind == 7u) { return abs(length(p) - 0.26) - 0.08; }
  if (kind == 8u) { return min(sdBox(p - vec2<f32>(0.0, 0.06), vec2<f32>(0.5, 0.08)), sdBox(p, vec2<f32>(0.08, 0.44))); }
  if (kind == 9u) { return min(min(sdBox(p - vec2<f32>(0.0, 0.26), vec2<f32>(0.4, 0.06)), sdBox(p, vec2<f32>(0.4, 0.06))), sdBox(p - vec2<f32>(-0.12, -0.26), vec2<f32>(0.28, 0.06))); }
  return length(p) - 0.16;}

@vertex
fn vsMark(@builtin(vertex_index) vi : u32, @location(0) a : vec4<f32>, @location(1) b : vec4<f32>, @location(2) c : vec4<f32>) -> MOut {
  var o : MOut;
  let q = corner(vi);
  let clip = u.viewProj * vec4<f32>(a.xyz, 1.0);
  let flags = u32(b.w + 0.5);
  let px = select(5.5, 7.5, (flags & 1u) != 0u) * u.view.z * 1.35;
  o.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  o.uv = q * 1.35;
  o.rgb = b;
  o.tick = vec4<f32>(0.0);
  if (clip.w <= 0.0) { return o; }
  o.pos = vec4<f32>(clip.xy + q * px * 2.0 / u.view.xy * clip.w, 0.0, clip.w);
  if (a.w > -999.0) {
    let fw = vec3<f32>(sin(a.w), 0.0, cos(a.w));
    let k = 0.02 * distance(a.xyz, u.cam.xyz) + 0.01;
    let c2 = u.viewProj * vec4<f32>(a.xyz + fw * k, 1.0);
    if (c2.w > 0.0) {
      let d = (c2.xy / c2.w - clip.xy / clip.w) * u.view.xy;
      let l = length(d);
      if (l > 1e-4) { o.tick = vec4<f32>(d / l, 1.0, 0.0); }
    }
  }
  return o;
}

@fragment
fn fsMark(i : MOut) -> @location(0) vec4<f32> {
  let flags = u32(i.rgb.w + 0.5);
  let vehicle = (flags & 1u) != 0u;
  let idle = (flags & 2u) != 0u;
  let p = i.uv;
  let d = select(length(p) - 0.62, sdBox(p, vec2<f32>(0.5)) - 0.14, vehicle);
  let aa = max(fwidth(d), 1e-3);
  let body = 1.0 - smoothstep(-aa, aa, d);
  let rim = 1.0 - smoothstep(-aa, aa, d - 0.22);
  var fill = i.rgb.rgb;
  var fa = 1.0;
  if (idle) { fill = mix(vec3<f32>(0.55), fill, 0.4); fa = 0.22; }
  // Premultiplied, layer over layer: the dark rim, the fill, the glyph, the heading tick.
  var col = vec3<f32>(0.04) * rim * 0.85;
  var al = rim * 0.85;
  col = fill * body * fa + col * (1.0 - body * fa);
  al = body * fa + al * (1.0 - body * fa);
  if (vehicle) {
    let gd = glyph(p, flags >> 2u);
    let g = (1.0 - smoothstep(-aa, aa, gd)) * body * select(0.9, 0.6, idle);
    col = vec3<f32>(0.04) * g + col * (1.0 - g);
    al = g + al * (1.0 - g);
  }
  if (i.tick.z > 0.5) {
    let r0 = select(0.6, 0.66, vehicle);
    let sd = sdSeg(p, i.tick.xy * r0, i.tick.xy * 1.3);
    let edge = 1.0 - smoothstep(-aa, aa, sd - 0.2);
    let core = 1.0 - smoothstep(-aa, aa, sd - 0.1);
    col = vec3<f32>(0.04) * edge + col * (1.0 - edge);
    al = edge + al * (1.0 - edge);
    col = fill * core + col * (1.0 - core);
    al = core + al * (1.0 - core);
  }
  return vec4<f32>(col, al);
}

struct LOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) @interpolate(flat) rgb : vec4<f32>,
};

@vertex
fn vsLine(@builtin(vertex_index) vi : u32, @location(0) a : vec4<f32>, @location(1) b : vec4<f32>, @location(2) c : vec4<f32>) -> LOut {
  var o : LOut;
  o.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  let flags = u32(b.w + 0.5);
  o.rgb = vec4<f32>(b.rgb * 0.8, select(0.7, 0.2, (flags & 2u) != 0u));
  if (c.w < 0.5) { return o; }
  let ca = u.viewProj * vec4<f32>(a.xyz, 1.0);
  let cb = u.viewProj * vec4<f32>(c.xyz, 1.0);
  if (ca.w <= 0.0 || cb.w <= 0.0) { return o; }
  let sa = ca.xy / ca.w * u.view.xy;
  let sb = cb.xy / cb.w * u.view.xy;
  let dl = length(sb - sa);
  if (dl < 1.0) { return o; }
  let n = vec2<f32>(-(sb - sa).y, (sb - sa).x) / dl * 1.1 * u.view.z * 2.0 / u.view.xy;
  let q = corner(vi);
  let e = select(ca, cb, q.x > 0.0);
  o.pos = vec4<f32>(e.xy + n * q.y * e.w, 0.0, e.w);
  return o;
}

@fragment
fn fsLine(i : LOut) -> @location(0) vec4<f32> {
  return vec4<f32>(i.rgb.rgb * i.rgb.a, i.rgb.a);
}
