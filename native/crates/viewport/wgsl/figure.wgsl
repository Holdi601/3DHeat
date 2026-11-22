
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct FigureOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) colour : vec4<f32>,
  @location(1) world : vec3<f32>,
  @location(2) edge : vec3<f32>,
  @location(3) @interpolate(flat) solid : f32,
};
// 0 every part, 1 the solid parts only, 2 the see-through ones only (SEE_THROUGH_BELOW): a constant of the pipeline.
override alphaPass : f32 = 0.0;

fn shadeFigure(base : vec3<f32>, n : vec3<f32>, gloss : f32) -> vec3<f32> {
  if (n.x == 0.0 && n.y == 0.0 && n.z == 0.0) { return min(vec3<f32>(1.0), base * 1.0); }
  let sun = max(0.0, dot(n, vec3<f32>(0.4561, 0.7906, 0.4358)));
  let h = 0.5 + 0.5 * n.y;
  let up = max(0.0, n.y);
  let sheen = gloss * (0.07 + 0.3 * up * up);
  let ground = vec3<f32>(0.27, 0.26, 0.25);
  let light = 0.06 + ground + (vec3<f32>(0.46, 0.48, 0.52) - ground) * h + vec3<f32>(0.82, 0.8, 0.76) * sun;
  let c = base * light + sheen * vec3<f32>(0.78, 0.88, 1.0);
  return min(c, vec3<f32>(0.7)) + 0.3 * (1.0 - exp(-max(c - vec3<f32>(0.7), vec3<f32>(0.0)) / 0.3));
}

fn edgeOf(code : f32) -> vec3<f32> {
  if (code < 0.5) { return vec3<f32>(1.0); }
  let c = u32(code - 0.5);
  let k = c % 3u;
  let m = c / 3u;
  let b = vec3<f32>(select(0.0, 1.0, k == 0u), select(0.0, 1.0, k == 1u), select(0.0, 1.0, k == 2u));
  return max(b, vec3<f32>(f32(m & 1u), f32((m >> 1u) & 1u), f32((m >> 2u) & 1u)));
}

fn edgeShade(e : vec3<f32>) -> f32 {
  let w = max(fwidth(e), vec3<f32>(1e-6));
  let px = e / w;
  let near = min(px.x, min(px.y, px.z));
  let across = mix(1.0 / w, vec3<f32>(1e6), step(vec3<f32>(0.999), e));
  let size = min(across.x, min(across.y, across.z));
  let line = (1.0 - smoothstep(0.35, 1.35, near)) * smoothstep(3.0, 9.0, size);
  return 1.0 - 0.5 * line;
}

fn articulate(v0 : vec3<f32>, yaw : f32, pitch0 : f32, point : bool, art0 : vec4<f32>, art1 : vec4<f32>, art2 : vec4<f32>) -> vec3<f32> {
  var v = v0;
  let kind = art0.x;
  // Landing gear up (GEAR_UP off the slot): a gear part folds into its pivot.
  let gearUp = pitch0 < -250.0 && pitch0 > -999.0;
  var pitch = pitch0;
  if (gearUp) { pitch = pitch0 + 200.0; }
  if (kind > 4.5) {
    if (gearUp && point) { return art0.yzw; }
    return v;
  }
  if (kind > 3.5) {
    var power = 1.0;
    if (pitch < -100.5) { power = clamp((-101.0 - pitch) / 98.0, 0.0, 1.0); }
    let a = u.camera.w * art1.w * power;
    let k = art1.xyz;
    var c0 = vec3<f32>(0.0);
    if (point) { c0 = art0.yzw; }
    let w = v - c0;
    return c0 + w * cos(a) + cross(k, w) * sin(a) + k * dot(k, w) * (1.0 - cos(a));
  }
  if (kind >= 1.5 && pitch > -50.0) {
    let d = vec3<f32>(cos(art1.w), 0.0, sin(art1.w));
    var tr = vec3<f32>(0.0);
    if (point) { tr = art1.xyz; }
    let w = v - tr;
    let along = dot(w, d);
    let side = w - d * along - vec3<f32>(0.0, w.y, 0.0);
    let a = pitch - art2.x;
    let c = cos(a);
    let s = sin(a);
    v = tr + d * (along * c - w.y * s) + vec3<f32>(0.0, along * s + w.y * c, 0.0) + side;
  }
  if (kind > 0.5 && kind < 2.5) {
    let a = yaw - art0.w;
    let c = cos(a);
    let s = sin(a);
    var cp = vec2<f32>(0.0);
    if (point) { cp = art0.yz; }
    let r = v.xz - cp;
    let q = cp + vec2<f32>(r.x * c - r.y * s, r.x * s + r.y * c);
    v = vec3<f32>(q.x, v.y, q.y);
  }
  return v;
}

@vertex
fn vsFigure(
  @location(0) position : vec3<f32>,
  @location(1) colour : vec4<f32>,
  @location(2) normal : vec4<f32>,
  @location(3) tint : f32,
  @location(4) origin : vec4<f32>,
  @location(5) forward : vec4<f32>,
  @location(6) upAxis : vec4<f32>,
  @location(7) team : vec4<f32>,
  @location(8) art0 : vec4<f32>,
  @location(9) art1 : vec4<f32>,
  @location(10) art2 : vec4<f32>,
) -> FigureOut {
  var out : FigureOut;
  // Not drawn: a dart's vertex of another domain's shape (`symbols/darts.ts`).
  var dom = 0.0;
  if (team.w <= -999.5) { dom = f32((u32(-team.w - 999.5) >> 16u) & 15u); }
  dom = max(dom, 1.0);
  if (origin.w <= 0.0 || (art2.y > 0.5 && abs(art2.y - 1.0 - dom) > 0.5)) {
    out.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    out.colour = vec4<f32>(0.0);
    out.world = vec3<f32>(0.0);
    out.edge = vec3<f32>(1.0);
    out.solid = 1.0;
    return out;
  }
  let f = forward.xyz;
  let up = upAxis.xyz;
  let r = cross(f, up);
  let p = articulate(position, upAxis.w, team.w, true, art0, art1, art2) * origin.w;
  let world = origin.xyz + f * p.x + up * p.y + r * p.z;
  let an = articulate(normal.xyz, upAxis.w, team.w, false, art0, art1, art2);
  let n = f * an.x + up * an.y + r * an.z;
  var base = colour.rgb;
  if (tint > 0.5) { base = team.rgb * colour.rgb; }
  // A wreck (`figures/wreck.ts`): the whole figure charred, its own shade kept as detail.
  if (team.r < 0.0) { base = -team.rgb * (0.55 + 0.9 * dot(colour.rgb, vec3<f32>(0.299, 0.587, 0.114))); }
  out.colour = vec4<f32>(shadeFigure(base, n, normal.w), colour.a * forward.w);
  out.world = world;
  out.edge = edgeOf(art2.z);
  out.solid = select(0.0, 1.0, colour.a >= 0.995);
  out.pos = u.viewProj * vec4<f32>(world, 1.0);
  return out;
}

@fragment
fn fsFigure(in : FigureOut) -> @location(0) vec4<f32> {
  if (alphaPass > 0.5 && (alphaPass < 1.5) != (in.solid > 0.5)) { discard; }
  let k = edgeShade(in.edge);
  let d = distance(in.world, u.camera.xyz);
  let fade = 1.0 - smoothstep(u.cfg.x, u.cfg.y, d);
  if (fade <= 0.001) { discard; }
  return vec4<f32>(in.colour.rgb * k, in.colour.a * fade);
}
