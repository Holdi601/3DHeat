

struct FsOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@vertex
fn vsFullscreen(@builtin(vertex_index) vid : u32) -> FsOut {
  var out : FsOut;
  let p = vec2<f32>(f32((vid & 1u) << 1u), f32(vid & 2u));
  out.uv = vec2<f32>(p.x, 1.0 - p.y);
  out.pos = vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
  return out;
}


struct CompositeUniforms {
  // 1/frames, saturation, signed flag, response curve (0 linear, 1 sat, 2 log)
  cfg : vec4<f32>,
  // floor, dof max blur px, dof focus distance, dof aperture
  cfg2 : vec4<f32>,
  // near, far, texel width, texel height
  cfg3 : vec4<f32>,
  // perspective depth flag, team-colour flag, chroma boost, rate-map flag
  cfg4 : vec4<f32>,
  // The rate map (render/rateMap.ts): overall share, prior rows, fewest rows, span
  cfg5 : vec4<f32>,
};

@group(0) @binding(0) var<uniform> u : CompositeUniforms;
@group(0) @binding(1) var sceneTex : texture_2d<f32>;
@group(0) @binding(2) var heatTex : texture_2d<f32>;
@group(0) @binding(3) var lutTex : texture_2d<f32>;
@group(0) @binding(4) var samp : sampler;
@group(0) @binding(5) var depthTex : texture_depth_2d;


fn depthBehind(a : f32, b : f32) -> bool { return a < b; }
fn depthSky(d : f32) -> bool { return d <= 0.0; }
fn depthToDistance(d : f32, n : f32, f : f32, persp : bool) -> f32 {
  if (persp) { return (n * f) / max(1e-30, n + d * (f - n)); }
  return f - d * (f - n);
}
fn towardCamera(d : f32, bias : f32) -> f32 { return d + max(bias, d * 5e-7); }
fn depthError(z : f32, n : f32) -> f32 { return abs(z) * 1e-6; }

/** Depth sample -> distance from the camera along the view axis (reverse-Z: render/depth.ts). */
fn viewDistance(depth : f32) -> f32 {
  return depthToDistance(depth, u.cfg3.x, u.cfg3.y, u.cfg4.x > 0.5);
}

// Blur radius in pixels for a pixel at distance dist from the camera.
fn circleOfConfusion(dist : f32) -> f32 {
  let focus = max(1e-3, u.cfg2.z);
  let band = max(1e-4, focus * u.cfg2.w);
  return u.cfg2.y * clamp(abs(dist - focus) / band, 0.0, 1.0);
}

/**
 * Gather-blur the scene by its own circle of confusion.
 *
 * Taps sit on a golden-angle spiral, which covers a disc far more evenly than a
 * grid at this few samples. Each tap is weighted by whether *its* blur circle
 * reaches the centre pixel, which is what stops a sharp foreground from being
 * smeared outward by the blurry background behind it.
 */
fn sceneWithDof(uv : vec2<f32>) -> vec3<f32> {
  let texel = u.cfg3.zw;
  // Depth is read with integer fetches rather than sampled. Interpolating depth
  // across a silhouette produces a distance that exists nowhere in the scene, and
  // WGSL only accepts an integer mip level for a depth texture anyway.
  let dims = vec2<f32>(textureDimensions(depthTex));
  let centre = vec2<i32>(uv * dims);
  let maxPx = vec2<i32>(dims) - vec2<i32>(1, 1);
  let centreCoc = circleOfConfusion(viewDistance(textureLoad(depthTex, centre, 0)));
  // textureSampleLevel rather than textureSample: the early return below makes
  // this non-uniform control flow, and an implicit-derivative sample is only
  // allowed in uniform control flow. Naming the level explicitly sidesteps it.
  var sum = textureSampleLevel(sceneTex, samp, uv, 0.0).rgb;
  var weight = 1.0;
  if (centreCoc < 1.0) { return sum; }

  let TAPS = 24;
  let GOLDEN = 2.39996323;
  for (var i = 0; i < TAPS; i = i + 1) {
    let fi = f32(i) + 0.5;
    // sqrt for equal-area spacing: without it the taps bunch at the centre.
    let r = sqrt(fi / f32(TAPS)) * centreCoc;
    let a = fi * GOLDEN;
    let offset = vec2<f32>(cos(a), sin(a)) * r;
    let tapUv = uv + offset * texel;
    let tapPx = clamp(centre + vec2<i32>(offset), vec2<i32>(0, 0), maxPx);
    let tapCoc = circleOfConfusion(viewDistance(textureLoad(depthTex, tapPx, 0)));
    let w = clamp(tapCoc - r + 1.0, 0.0, 1.0);
    sum = sum + textureSampleLevel(sceneTex, samp, tapUv, 0.0).rgb * w;
    weight = weight + w;
  }
  return sum / max(1e-4, weight);
}

/**
 * Oklab to sRGB, Björn Ottosson's matrices plus the transfer function.
 *
 * A copy of oklabToRgb in colors.ts, and the two are tested against each other
 * through the headless probe rather than trusted to stay in step: the matrices are
 * twelve hand-typed constants and one wrong sign produces a picture that looks
 * like a plausible palette rather than like a bug. (One of them, the blue row's
 * -0.0041960863, was wrong here in an earlier draft and only the round trip
 * caught it.)
 */
fn oklabToSrgb(L : f32, a : f32, b : f32) -> vec3<f32> {
  let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  let s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  let l = l_ * l_ * l_;
  let m = m_ * m_ * m_;
  let s = s_ * s_ * s_;
  let lin = clamp(vec3<f32>(
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ), vec3<f32>(0.0), vec3<f32>(1.0));
  // Per-channel clamp rather than a gamut-preserving projection. It shifts the
  // hue of a boosted mixture that leaves sRGB, which is a real inaccuracy, but the
  // alternative costs a search per pixel and the boost is a legibility control
  // being dragged by hand — it is looked at, not measured.
  return select(
    1.055 * pow(lin, vec3<f32>(1.0 / 2.4)) - 0.055,
    lin * 12.92,
    lin <= vec3<f32>(0.0031308),
  );
}

@fragment
fn fsComposite(in : FsOut) -> @location(0) vec4<f32> {
  // Heat is deliberately not blurred: it is the sum of sprites at many depths, so
  // it has no single depth to be out of focus at, and blurring it by whatever
  // geometry happens to sit behind it would be wrong wherever it floats in front.
  var scene : vec3<f32>;
  if (u.cfg2.y > 0.0) {
    scene = sceneWithDof(in.uv);
  } else {
    scene = textureSample(sceneTex, samp, in.uv).rgb;
  }
  let hv = textureSample(heatTex, samp, in.uv);
  if (u.cfg4.w > 0.5) {
    // The rate map: the + side's share here, pulled toward the overall share by
    // the rows it rests on, coloured by how far it lies above or below it. A copy
    // of rateComposite in render/rateMap.ts; the tests hold the two together.
    let rr = max(hv.r * u.cfg.x, 0.0);
    let pp = max(hv.g * u.cfg.x, 0.0);
    let ss = max(hv.b * u.cfg.x, 1e-30);
    let n = rr * rr / ss;
    let raw = pp / max(rr, 1e-30);
    let m = max(u.cfg5.y, 0.0);
    let p = (raw * n + m * u.cfg5.x) / max(n + m, 1e-30);
    let d = p - u.cfg5.x;
    var rt = min(abs(d) / max(u.cfg5.w, 1e-6), 1.0);
    let lo = max(u.cfg5.z, 0.0);
    var fade = select(0.0, 1.0, rr > 1e-12);
    if (lo > 0.0) { fade = smoothstep(lo * 0.5, lo, n); }
    if (u.cfg2.x > 0.0 && fade > 0.0) { rt = mix(u.cfg2.x, 1.0, rt); }
    let rc = textureSample(lutTex, samp, vec2<f32>(rt, select(0.25, 0.75, d < 0.0)));
    return vec4<f32>(mix(scene, rc.rgb, rc.a * fade), 1.0);
  }
  let h = hv.r * u.cfg.x;
  let k = abs(h) / max(u.cfg.y, 1e-6);
  var t = k;
  if (u.cfg.w > 1.5) {
    // Log. Compresses a long tail so one extreme hotspot stops flattening
    // everything else to the bottom of the ramp.
    t = log2(1.0 + k * 7.0) / 3.0;
  } else if (u.cfg.w > 0.5) {
    // Saturating. Reproduces the feel of accumulating with alpha-over blending,
    // where each layer covers only a fraction of what is left, so a hotspot
    // approaches the top of the ramp without a hard clip.
    t = 1.0 - exp(-k);
  }
  t = clamp(t, 0.0, 1.0);
  // Lift anything that carries heat at all up to the floor, so one datapoint is
  // visible rather than sitting a hair above transparent. The threshold keeps
  // genuinely empty pixels empty; without it the floor would flood the frame.
  if (u.cfg2.x > 0.0 && k > 1e-4) { t = mix(u.cfg2.x, 1.0, t); }
  // Two-row LUT: row 0 positive, row 1 negative. Sample at the row centres.
  var row = 0.25;
  if (u.cfg.z > 0.5 && h < 0.0) { row = 0.75; }
  let c = textureSample(lutTex, samp, vec2<f32>(t, row));
  var rgb = c.rgb;
  if (u.cfg4.y > 0.5) {
    // The mixture: the density-weighted mean of the groups present, recovered by
    // dividing the weighted sum in G,B by the weight in R.
    //
    // Dividing by the accumulated weight rather than by anything derived from
    // the ramp is what makes the hue independent of how much data is here — so a
    // group's colour does not drift as more of its own samples land, and every
    // control that shapes density (the response curve, the saturation point, the
    // floor, the sprite ramp) goes on acting on t alone and keeps working
    // unchanged. Hue and density are carried on separate axes on purpose.
    //
    // The frame gain cancels in the ratio, so it is left out of both sides.
    let w = max(abs(hv.r), 1e-6);
    let ab = vec2<f32>(hv.g, hv.b) / w * max(0.0, u.cfg4.z);
    // The groups' mean lightness from A: a palette colour keeps its own.
    rgb = oklabToSrgb(clamp(abs(hv.a) / w, 0.0, 1.0), ab.x, ab.y);
  }
  // Alpha still comes from the LUT even in team mode, which is the whole reason
  // the two axes were separated: transparent where there is nothing, opaque at
  // the top of the ramp, with the colour saying who rather than how much.
  return vec4<f32>(mix(scene, rgb, c.a), 1.0);
}
