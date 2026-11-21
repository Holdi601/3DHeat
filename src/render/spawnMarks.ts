/**
 * A level layout's spawn points one by one (`match/layoutSpawns.ts`), drawn
 * by the GPU: one instance a point, a screen-facing marker of constant pixel
 * size in its team's colour - a disc for soldiers, a rounded square with the
 * vehicle's glyph for vehicles - with a tick for its heading, and, where
 * asked, a thin line to the capture point or headquarters it belongs to.
 * Over the finished picture without depth, so a marker behind a hill still
 * shows and reads the same at any zoom, in the heat, the replay and on the
 * tactics board alike.
 *
 * Instance (12 floats): x, y, z, heading (radians from +z towards +x;
 * `NO_HEADING` for none), r, g, b, flags (1 vehicle, 2 out of use at the
 * playhead, kind x 4: `VEHICLE_KINDS`), the owner's x, y, z, 1 when there is
 * an owner to draw a line to.
 *
 * The CPU writes the instances only when what they show changes - the
 * layout, the choices, the colours, a flag changing hands at the playhead -
 * so a still frame costs one instanced draw of six vertices a point, tens of
 * thousands of points included.
 */

import type { LevelLayout } from '../match/levelLayouts';
import { spawnShown, spawnState, type SpawnFilter, type SpawnPoint } from '../match/layoutSpawns';
import type { ObjectiveTimeline } from '../match/objectives';
import { zoneAt } from '../match/objectives';

export const SPAWN_INSTANCE_FLOATS = 12;
export const NO_HEADING = -1000;
/** The glyph kind of a data note's pin (`notes/pins.ts`): three lines of text on the marker. */
export const NOTE_GLYPH = 9;
/** Uniform floats: viewProj, view (w, h, pixel ratio, -), camera (xyz, -). */
export const SPAWN_UNIFORM_FLOATS = 16 + 4 + 4;
/** A marker's half size in CSS pixels: soldiers', vehicles'. */
export const SPAWN_PX = 5.5;
export const SPAWN_VEHICLE_PX = 7.5;
/** Above the ground, so a marker is not cut by the ground it stands on. */
const LIFT = 1.2;

const NEUTRAL: [number, number, number] = [0.86, 0.86, 0.82];

/** What the renderers draw (`FrameParams.spawnMarks`). */
export interface SpawnMarkDraw {
  data: Float32Array;
  count: number;
  /** Lines to the owners too. */
  lines: boolean;
}

export interface SpawnMarkFrame {
  layout: LevelLayout | null;
  mode: 'off' | 'groups' | 'points';
  lines: boolean;
  filter: SpawnFilter;
  /** A team's colour (1, 2...). */
  teamColor: (team: number) => [number, number, number];
  /** Who holds each capture point at the playhead, where a replay says. */
  timeline: ObjectiveTimeline | null;
  /** Timeline seconds at the playhead. */
  t: number;
}

/** Writes the instances of `points` into `out` (grown as needed); how many. */
export function spawnInstances(
  points: readonly SpawnPoint[],
  owners: LevelLayout['spawnOwners'],
  filter: SpawnFilter,
  teamColor: (team: number) => [number, number, number],
  ownerOf: (owner: string) => number | undefined,
  out: { data: Float32Array },
): number {
  if (out.data.length < points.length * SPAWN_INSTANCE_FLOATS) out.data = new Float32Array(points.length * SPAWN_INSTANCE_FLOATS);
  const d = out.data;
  let n = 0;
  for (const p of points) {
    if (!spawnShown(p, filter)) continue;
    const st = spawnState(p, ownerOf);
    const rgb = st.team ? teamColor(st.team) : NEUTRAL;
    const o = n * SPAWN_INSTANCE_FLOATS;
    d[o] = p.position[0];
    d[o + 1] = p.position[1] + LIFT;
    d[o + 2] = p.position[2];
    d[o + 3] = p.heading === null ? NO_HEADING : (p.heading * Math.PI) / 180;
    d[o + 4] = rgb[0];
    d[o + 5] = rgb[1];
    d[o + 6] = rgb[2];
    d[o + 7] = (p.vehicle ? 1 : 0) + (st.active ? 0 : 2) + p.kind * 4;
    const owner = p.owner ? owners.get(p.owner) : undefined;
    d[o + 8] = owner ? owner.position[0] : 0;
    d[o + 9] = owner ? owner.position[1] + LIFT : 0;
    d[o + 10] = owner ? owner.position[2] : 0;
    d[o + 11] = owner ? 1 : 0;
    n++;
  }
  return n;
}

/** Who holds a capture point at `t`, from a replay's timeline: by the owner's letter (its id, else its name). */
export function ownerLookup(layout: LevelLayout, timeline: ObjectiveTimeline | null, t: number): (owner: string) => number | undefined {
  if (!timeline) return () => undefined;
  return (id) => {
    const o = layout.spawnOwners.get(id);
    if (!o || o.type !== 'capture_zone') return undefined;
    const tl = timeline.zones.get(o.letter || o.id) ?? timeline.zones.get(o.name);
    return tl ? zoneAt(tl, t, o.start).owner : undefined;
  };
}

/** The spawn markers of a frame, made again only when what they show changes. */
export class SpawnMarkLayer {
  private key = '';
  private layout: LevelLayout | null = null;
  private buf = { data: new Float32Array(0) };
  private draw: SpawnMarkDraw | null = null;

  build(f: SpawnMarkFrame): SpawnMarkDraw | null {
    const l = f.layout;
    if (!l || f.mode !== 'points' || !l.spawnPoints.length) {
      this.layout = null;
      this.key = '';
      this.draw = null;
      return null;
    }
    const ownerOf = ownerLookup(l, f.timeline, f.t);
    // The flags' holders at the playhead: the markers change only when one does.
    let held = '';
    if (f.timeline) for (const id of l.spawnOwners.keys()) held += `${ownerOf(id) ?? '-'},`;
    const c1 = f.teamColor(1);
    const c2 = f.teamColor(2);
    const key = `${f.lines}|${f.filter.owner}|${f.filter.team}|${f.filter.stage}|${c1.join(',')}|${c2.join(',')}|${f.teamColor(3).join(',')}|${held}`;
    if (l === this.layout && key === this.key && this.draw) return this.draw;
    this.layout = l;
    this.key = key;
    // A new array each time, so a renderer uploads it once by its identity.
    this.buf = { data: new Float32Array(0) };
    const count = spawnInstances(l.spawnPoints, l.spawnOwners, f.filter, f.teamColor, ownerOf, this.buf);
    this.draw = count ? { data: this.buf.data, count, lines: f.lines } : null;
    return this.draw;
  }
}

// ------------------------------------------------------------------ shaders

/** The shapes, in the marker's own square (-1.35..1.35, y up), as signed distances: shared by both languages. */
function shapes(g: boolean): string {
  const v2 = g ? 'vec2' : 'vec2<f32>';
  const fn = (name: string, args: string, body: string) =>
    g ? `float ${name}(${args.replace(/(\w+) : ([\w<>]+)/g, (_, n, t) => `${t.replace('vec2<f32>', 'vec2').replace('f32', 'float').replace('u32', 'uint')} ${n}`)}) {${body}}` : `fn ${name}(${args}) -> f32 {${body}}`;
  const let_ = g ? 'vec2' : 'let';
  const letf = g ? 'float' : 'let';
  return [
    fn('sdBox', `p : ${v2}, b : ${v2}`, `${let_} d = abs(p) - b; return length(max(d, ${v2}(0.0))) + min(max(d.x, d.y), 0.0);`),
    fn('sdSeg', `p : ${v2}, a : ${v2}, b : ${v2}`, `${let_} pa = p - a; ${let_} ba = b - a; ${letf} h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h);`),
    fn('sdTri', `p : ${v2}`, `${letf} k = 1.7320508; ${g ? 'vec2' : 'var'} q = ${v2}(abs(p.x) - 0.36, p.y + 0.2); if (q.x + k * q.y > 0.0) { q = ${v2}(q.x - k * q.y, -k * q.x - q.y) / 2.0; } q.x = q.x - clamp(q.x, -0.72, 0.0); return -length(q) * sign(q.y);`),
    // A vehicle's glyph by kind (VEHICLE_KINDS): tank, jet, helicopter, boat, gun, car, horse, plane; a note's lines (NOTE_GLYPH); a dot for any other.
    fn(
      'glyph',
      `p : ${v2}, kind : ${g ? 'uint' : 'u32'}`,
      `
  if (kind == 1u) { return min(sdBox(p - ${v2}(0.0, -0.12), ${v2}(0.42, 0.2)), sdBox(p - ${v2}(0.0, 0.22), ${v2}(0.07, 0.3))); }
  if (kind == 2u) { return sdTri(p); }
  if (kind == 3u) { return min(length(p - ${v2}(0.0, -0.08)) - 0.24, sdBox(p - ${v2}(0.0, 0.3), ${v2}(0.46, 0.06))); }
  if (kind == 4u) { return max(length(p - ${v2}(0.0, 0.12)) - 0.44, p.y - 0.06); }
  if (kind == 5u) { return min(sdBox(p - ${v2}(0.0, 0.26), ${v2}(0.4, 0.07)), sdBox(p - ${v2}(0.0, -0.06), ${v2}(0.07, 0.34))); }
  if (kind == 6u) { return sdBox(p, ${v2}(0.42, 0.18)) - 0.06; }
  if (kind == 7u) { return abs(length(p) - 0.26) - 0.08; }
  if (kind == 8u) { return min(sdBox(p - ${v2}(0.0, 0.06), ${v2}(0.5, 0.08)), sdBox(p, ${v2}(0.08, 0.44))); }
  if (kind == 9u) { return min(min(sdBox(p - ${v2}(0.0, 0.26), ${v2}(0.4, 0.06)), sdBox(p, ${v2}(0.4, 0.06))), sdBox(p - ${v2}(-0.12, -0.26), ${v2}(0.28, 0.06))); }
  return length(p) - 0.16;`,
    ),
  ].join('\n');
}

export function spawnWgsl(): string {
  return /* wgsl */ `
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

${shapes(false)}

@vertex
fn vsMark(@builtin(vertex_index) vi : u32, @location(0) a : vec4<f32>, @location(1) b : vec4<f32>, @location(2) c : vec4<f32>) -> MOut {
  var o : MOut;
  let q = corner(vi);
  let clip = u.viewProj * vec4<f32>(a.xyz, 1.0);
  let flags = u32(b.w + 0.5);
  let px = select(${SPAWN_PX.toFixed(1)}, ${SPAWN_VEHICLE_PX.toFixed(1)}, (flags & 1u) != 0u) * u.view.z * 1.35;
  o.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  o.uv = q * 1.35;
  o.rgb = b;
  o.tick = vec4<f32>(0.0);
  if (clip.w <= 0.0) { return o; }
  o.pos = vec4<f32>(clip.xy + q * px * 2.0 / u.view.xy * clip.w, 0.0, clip.w);
  if (a.w > ${NO_HEADING + 1}.0) {
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
`;
}

const GLSL_HEAD = `#version 300 es
precision highp float;
precision highp int;
`;

export function spawnGlslVs(line: boolean): string {
  return `${GLSL_HEAD}
layout(location = 0) in vec4 iA;
layout(location = 1) in vec4 iB;
layout(location = 2) in vec4 iC;
uniform mat4 uViewProj;
uniform vec4 uView;
uniform vec4 uCam;
out vec2 vUv;
flat out vec4 vRgb;
flat out vec4 vTick;
vec2 corner(int c) {
  return vec2(c == 1 || c == 2 || c == 4 ? 1.0 : -1.0, c == 2 || c == 4 || c == 5 ? 1.0 : -1.0);
}
void main() {
  vec2 q = corner(gl_VertexID % 6);
  uint flags = uint(iB.w + 0.5);
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  vUv = q * 1.35;
  vRgb = iB;
  vTick = vec4(0.0);
${
  line
    ? `  vRgb = vec4(iB.rgb * 0.8, (flags & 2u) != 0u ? 0.2 : 0.7);
  if (iC.w < 0.5) return;
  vec4 ca = uViewProj * vec4(iA.xyz, 1.0);
  vec4 cb = uViewProj * vec4(iC.xyz, 1.0);
  if (ca.w <= 0.0 || cb.w <= 0.0) return;
  vec2 sa = ca.xy / ca.w * uView.xy;
  vec2 sb = cb.xy / cb.w * uView.xy;
  float dl = length(sb - sa);
  if (dl < 1.0) return;
  vec2 n = vec2(-(sb - sa).y, (sb - sa).x) / dl * 1.1 * uView.z * 2.0 / uView.xy;
  vec4 e = q.x > 0.0 ? cb : ca;
  gl_Position = vec4(e.xy + n * q.y * e.w, 0.0, e.w);`
    : `  vec4 clip = uViewProj * vec4(iA.xyz, 1.0);
  if (clip.w <= 0.0) return;
  float px = ((flags & 1u) != 0u ? ${SPAWN_VEHICLE_PX.toFixed(1)} : ${SPAWN_PX.toFixed(1)}) * uView.z * 1.35;
  gl_Position = vec4(clip.xy + q * px * 2.0 / uView.xy * clip.w, 0.0, clip.w);
  if (iA.w > ${NO_HEADING + 1}.0) {
    vec3 fw = vec3(sin(iA.w), 0.0, cos(iA.w));
    float k = 0.02 * distance(iA.xyz, uCam.xyz) + 0.01;
    vec4 c2 = uViewProj * vec4(iA.xyz + fw * k, 1.0);
    if (c2.w > 0.0) {
      vec2 d = (c2.xy / c2.w - clip.xy / clip.w) * uView.xy;
      float l = length(d);
      if (l > 1e-4) vTick = vec4(d / l, 1.0, 0.0);
    }
  }`
}
}
`;
}

export function spawnGlslFs(line: boolean): string {
  if (line)
    return `${GLSL_HEAD}
in vec2 vUv;
flat in vec4 vRgb;
flat in vec4 vTick;
out vec4 outColor;
void main() { outColor = vec4(vRgb.rgb * vRgb.a, vRgb.a); }
`;
  return `${GLSL_HEAD}
in vec2 vUv;
flat in vec4 vRgb;
flat in vec4 vTick;
out vec4 outColor;
${shapes(true)}
void main() {
  uint flags = uint(vRgb.w + 0.5);
  bool vehicle = (flags & 1u) != 0u;
  bool idle = (flags & 2u) != 0u;
  vec2 p = vUv;
  float d = vehicle ? sdBox(p, vec2(0.5)) - 0.14 : length(p) - 0.62;
  float aa = max(fwidth(d), 1e-3);
  float body = 1.0 - smoothstep(-aa, aa, d);
  float rim = 1.0 - smoothstep(-aa, aa, d - 0.22);
  vec3 fill = vRgb.rgb;
  float fa = 1.0;
  if (idle) { fill = mix(vec3(0.55), fill, 0.4); fa = 0.22; }
  vec3 col = vec3(0.04) * rim * 0.85;
  float al = rim * 0.85;
  col = fill * body * fa + col * (1.0 - body * fa);
  al = body * fa + al * (1.0 - body * fa);
  if (vehicle) {
    float gd = glyph(p, flags >> 2u);
    float g = (1.0 - smoothstep(-aa, aa, gd)) * body * (idle ? 0.6 : 0.9);
    col = vec3(0.04) * g + col * (1.0 - g);
    al = g + al * (1.0 - g);
  }
  if (vTick.z > 0.5) {
    float r0 = vehicle ? 0.66 : 0.6;
    float sd = sdSeg(p, vTick.xy * r0, vTick.xy * 1.3);
    float edge = 1.0 - smoothstep(-aa, aa, sd - 0.2);
    float core = 1.0 - smoothstep(-aa, aa, sd - 0.1);
    col = vec3(0.04) * edge + col * (1.0 - edge);
    al = edge + al * (1.0 - edge);
    col = fill * core + col * (1.0 - core);
    al = core + al * (1.0 - core);
  }
  outColor = vec4(col, al);
}
`;
}

/** The uniforms of a frame: viewProj, the viewport in pixels and the pixel ratio, the camera. */
export function spawnUniforms(out: Float32Array, viewProj: Float32Array, width: number, height: number, cameraPos: ArrayLike<number>): Float32Array {
  out.set(viewProj, 0);
  out[16] = width;
  out[17] = height;
  out[18] = globalThis.devicePixelRatio || 1;
  out[19] = 0;
  out[20] = cameraPos[0];
  out[21] = cameraPos[1];
  out[22] = cameraPos[2];
  out[23] = 0;
  return out;
}
