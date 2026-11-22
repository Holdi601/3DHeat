
struct C {
  eye: vec4f,
  ax: vec4f,
  rt: vec4f,
  up: vec4f,
};
@group(0) @binding(0) var<uniform> c: C;
struct V {
  @builtin(position) pos: vec4f,
  @location(0) d: vec3f,
};
@vertex
fn vsCapture(@location(0) pos: vec3f) -> V {
  let d = pos - c.eye.xyz;
  let w = dot(d, c.ax.xyz);
  var o: V;
  o.pos = vec4f(dot(d, c.rt.xyz), dot(d, c.up.xyz), w - c.ax.w, w);
  o.d = d;
  return o;
}
@fragment
fn fsCapture(v: V) -> @builtin(frag_depth) f32 {
  let dist = length(v.d);
  let slope = fwidth(dist);
  if (dist > c.eye.w) { discard; }
  return min(1.0, (dist + 1.5 * slope) / c.eye.w);
}
