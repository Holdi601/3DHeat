/**
 * One frame for the native viewport (Stage 5), as bytes.
 *
 * The page keeps the engine - camera, sampling plan, accumulation, exposure -
 * and the native app's renderer (`native/crates/viewport`) draws what it asks
 * for. Each frame goes over as one packet: a header, then sections, each a tag,
 * its length in words and its words. The frame's numbers are one section of
 * f32 in the order `FRAME_FIELDS` gives; the Rust side reads them by the
 * indices generated from that list (`native/crates/viewport/src/generated.rs`,
 * written by `shaderExport.test.ts`), so the two cannot drift.
 *
 * What changes seldom - the colour and curve tables, the group signs, the
 * filters, the volumes - rides along only on the frames it changed.
 */

import { SAMPLE_BLOCK, type ActiveFilter, type FrameParams } from '../types';
import { INSTANCE_STRIDE, type FigureBatch } from '../../figures/instances';
import type { ViewMode } from '../../state/types';
import { PERSON_FILTER_COLUMN } from '../filterTables';

export const PACKET_MAGIC = 0x46563348; // "H3VF"
export const PACKET_VERSION = 1;

/** Section tags. */
export const SECTION = {
  frame: 1,
  plan: 2,
  colorLut: 3,
  curveLut: 4,
  signs: 5,
  filters: 6,
  volumes: 7,
  /** The difference split's column and the value weight's (core names, '' for none). */
  values: 8,
  /**
   * The figures' instances (`FrameParams.figureBatches`), relative to `origin`: per batch its
   * mesh id (the mesh sent before by `viewport_mesh`), its count, its instances.
   */
  figures: 9,
  /** The box replay's cubes (`FrameParams.cubes`): count, then eight floats each. */
  cubes: 10,
  /**
   * The scene's own triangles and lines, seven floats a vertex (xyz, rgba), each a vertex count
   * and its floats: `sceneTris` (figures' weapons and effects, the race tab's lines), `trailVerts`,
   * `overlayVerts` (the ruler and probe, drawn without depth).
   */
  geometry: 11,
  /**
   * The far-off glyphs the CPU placed (`FrameParams.symbols`): style, mode, ticks, the 16 sides'
   * colours (64 floats), then the instance count and the instances (the atlas goes once, by
   * `viewport_glyphs`).
   */
  symbols: 12,
  /**
   * The objectives' marks and the lines over the finished picture, seven floats a vertex:
   * `topVerts` (count, floats); `topStatic` (version, count, then 1 and the floats when the
   * version is new to the viewport, else 0); `topTris` and `groundTris` (count, then 1 and the
   * floats when the array is new, else 0); `objectivesUnder` (0, or 1, a line count, its floats).
   */
  top: 13,
  /**
   * The overlays over the scene, in three parts. Zones (`objectiveZones`): 0, or 1, on the ground
   * (0/1), xray, the smallest radius in device pixels, the vertex count, the zones' state
   * (`MAX_ZONES * ZONE_STATE_FLOATS`), then 1 and the vertices when new to the viewport, else 0.
   * Spawn marks (`spawnMarks`): the count; when any, the lines (0/1), the pixel ratio, then 1 and
   * the instances when new, else 0. Volume contours (`volumeContours`, with a level): 0, or 1, the
   * volumes' block (`VOLUME_BLOCK_FLOATS`), their colours (`MAX_GPU_VOLUMES` x 4), the inverse view.
   */
  overlays: 14,
  /**
   * The engagement ranges (`FrameParams.ranges`, `ranges/`): the shell count, where the cones
   * start, the sphere's and the cone's vertex counts; 1 and the mesh's floats (`shellMesh`) when
   * new to the viewport, else 0; the shells' uniforms (`SHELL_UNIFORM_BYTES`), the instances
   * (`SHELL_FLOATS` each); 0, or 1 and the ground's uniforms (`GROUND_UNIFORM_BYTES`); the faces
   * to take from the level this frame, each its layer and its 16 capture floats.
   */
  ranges: 15,
  /**
   * The GPU tracks' frame (`FrameParams.gpuTracks`, `nativeTracks.ts`): the store's id (sent
   * before by `viewport_tracks`), the place shader's uniform (`TRACKS_UNIFORM_BYTES`), then the
   * visibility words' count and the words when they changed (0 otherwise).
   */
  tracks: 20,
} as const;

/** The frame's numbers, in packet order, with how many floats each takes. */
export const FRAME_FIELDS: ReadonlyArray<readonly [string, number]> = [
  ['viewProj', 16],
  ['cameraPos', 3],
  ['cameraForward', 3],
  ['proj5', 1],
  ['near', 1],
  ['far', 1],
  ['perspective', 1],
  ['width', 1],
  ['height', 1],
  ['heatScale', 1],
  ['mode', 1],
  ['accum', 1],
  ['blendAlpha', 1],
  ['heatGain', 1],
  ['sampleWeight', 1],
  ['spriteTexels', 1],
  ['compositeOnly', 1],
  ['radius', 1],
  ['centre', 1],
  ['edge', 1],
  ['falloff', 1],
  ['saturation', 1],
  ['floor', 1],
  ['minPx', 1],
  ['maxPx', 1],
  ['zoomInvariant', 1],
  ['groundProjected', 1],
  ['groundY', 1],
  ['signed', 1],
  ['teamColors', 1],
  ['teamCount', 1],
  ['teamNeutral', 1],
  ['teamSlices', 1],
  ['teamBoost', 1],
  ['smoothRamp', 1],
  ['useCurve', 1],
  ['response', 1],
  ['cullNear', 1],
  ['cullFar', 1],
  ['cullPlanar', 1],
  ['cullGeometry', 1],
  ['occlusion', 1],
  ['occlusionFloor', 1],
  ['occludedExtra', 1],
  ['hideBehindGround', 1],
  ['lifeOn', 1],
  ['lifeNow', 1],
  ['lifeDefault', 1],
  ['lifeFade', 1],
  ['useTeamSign', 1],
  ['splitMode', 1],
  ['splitPositive', 2],
  ['splitNegative', 2],
  ['splitScale', 2],
  ['weightScale', 1],
  ['sliceOn', 1],
  ['sliceAxis', 1],
  ['sliceMin', 1],
  ['sliceMax', 1],
  ['sliceOutside', 1],
  ['sliceClipHeat', 1],
  ['palette', 1],
  ['levelOn', 1],
  ['levelOpacity', 1],
  ['levelBrightness', 1],
  ['levelWireframe', 1],
  ['levelColours', 1],
  ['reliefSlope', 1],
  ['reliefSpacing', 1],
  ['reliefStrength', 1],
  ['reliefIndexEvery', 1],
  ['reliefElevRange', 1],
  ['reliefLowY', 1],
  ['reliefHighY', 1],
  /** The model level's structures and water (`LevelDraw.structure`, `.water`). */
  ['structFaceOpacity', 1],
  ['structWireOpacity', 1],
  ['structTint', 3],
  ['structFaces', 1],
  ['structWire', 1],
  ['structFlat', 1],
  ['waterOpacity', 1],
  ['waterTint', 3],
  ['waterShow', 1],
  ['rateOn', 1],
  ['directionOn', 1],
  ['lineHeat', 1],
  /** The rate map's composite settings (`HeatParams.rate`, render/rateMap.ts). */
  ['rateOverall', 1],
  ['ratePrior', 1],
  ['rateMin', 1],
  ['rateSpan', 1],
  /** Directional heat (`FrameParams.direction`): the wedge, and the field over the heat. */
  ['dirHalf', 1],
  ['dirSoft', 1],
  ['dirNorm', 1],
  ['dirCentroid', 1],
  ['dirField', 1],
  ['dirCell', 1],
  ['dirTime', 1],
  /** Line heat's playback (`FrameParams.lineTrail`): the playhead and the tail, 0 off. */
  ['lineTrailNow', 1],
  ['lineTrailTail', 1],
  ['timeLo', 1],
  ['timeHi', 1],
  ['dofBlur', 1],
  /** Where the canvas sits in the window, device pixels: the viewport draws there. */
  ['viewX', 1],
  ['viewY', 1],
  ['showGrid', 1],
  ['showAxes', 1],
  ['gridSpacing', 1],
  ['gridExtent', 1],
  /** The figures' view: relative to `origin` (`FrameParams.viewProjRel`). */
  ['viewProjRel', 16],
  ['origin', 3],
  /** The spinning parts' clock, seconds (the page's, so both draw the same turn). */
  ['spinTime', 1],
  ['cubeSize', 1],
  ['showLook', 1],
  ['lookLength', 1],
];

/** Each field's first float. */
export const FRAME_AT: Readonly<Record<string, number>> = (() => {
  const at: Record<string, number> = {};
  let i = 0;
  for (const [name, n] of FRAME_FIELDS) {
    at[name] = i;
    i += n;
  }
  return at;
})();

export const FRAME_WORDS = FRAME_FIELDS.reduce((a, [, n]) => a + n, 0);

const MODES: Record<ViewMode, number> = { 'heat-simple': 0, 'heat-difference': 1, 'heat-teams': 2, 'heat-lines': 3, team: 4 };
const ACCUM: Record<FrameParams['accumMode'], number> = { reset: 0, mean: 1, ema: 2, extend: 3 };

/** The core's name for a filter's column. */
export function coreColumnName(column: string): string {
  return column === PERSON_FILTER_COLUMN ? '@person' : column;
}

/** Growable word buffer: one packet a frame, no allocation once it has grown. */
export class PacketWriter {
  private buf = new ArrayBuffer(1 << 16);
  private u32 = new Uint32Array(this.buf);
  private f32 = new Float32Array(this.buf);
  private at = 0;
  private sections = 0;
  private sectionAt = -1;

  begin(seq: number): void {
    this.at = 0;
    this.sections = 0;
    this.ensure(4);
    this.u32[0] = PACKET_MAGIC;
    this.u32[1] = PACKET_VERSION;
    this.u32[2] = seq >>> 0;
    this.u32[3] = 0;
    this.at = 4;
  }

  private ensure(words: number): void {
    if ((this.at + words) * 4 <= this.buf.byteLength) return;
    let size = this.buf.byteLength;
    while ((this.at + words) * 4 > size) size *= 2;
    const next = new ArrayBuffer(size);
    new Uint32Array(next).set(this.u32.subarray(0, this.at));
    this.buf = next;
    this.u32 = new Uint32Array(next);
    this.f32 = new Float32Array(next);
  }

  open(tag: number): void {
    this.ensure(2);
    this.u32[this.at] = tag;
    this.sectionAt = this.at;
    this.at += 2;
  }

  close(): void {
    this.u32[this.sectionAt + 1] = this.at - this.sectionAt - 2;
    this.sections++;
    this.u32[3] = this.sections;
  }

  word(v: number): void {
    this.ensure(1);
    this.u32[this.at++] = v >>> 0;
  }

  float(v: number): void {
    this.ensure(1);
    this.f32[this.at++] = v;
  }

  words(a: ArrayLike<number>, n = a.length): void {
    this.ensure(n);
    for (let i = 0; i < n; i++) this.u32[this.at + i] = a[i] >>> 0;
    this.at += n;
  }

  floats(a: ArrayLike<number>, n = a.length): void {
    this.ensure(n);
    for (let i = 0; i < n; i++) this.f32[this.at + i] = a[i];
    this.at += n;
  }

  /** Room for `n` floats, written by the caller through the returned view (valid until the next write). */
  reserveFloats(n: number): Float32Array {
    this.ensure(n);
    const at = this.at;
    this.at += n;
    return this.f32.subarray(at, at + n);
  }

  /** Bytes, padded to whole words. */
  bytes(b: Uint8Array): void {
    const n = Math.ceil(b.length / 4);
    this.ensure(n);
    new Uint8Array(this.buf, this.at * 4, n * 4).fill(0).set(b);
    this.at += n;
  }

  /** A UTF-8 string: its byte length, then its bytes. */
  string(s: string): void {
    const b = new TextEncoder().encode(s);
    this.word(b.length);
    this.bytes(b);
  }

  /** The packet so far, as a view of the writer's buffer (valid until the next `begin`). */
  view(): Uint8Array {
    return new Uint8Array(this.buf, 0, this.at * 4);
  }
}

/** The frame's numbers (`FRAME_FIELDS`), into an open section. */
export function writeFrame(w: PacketWriter, p: FrameParams, palette: number, viewX = 0, viewY = 0, spinTime = 0): void {
  const f = new Float32Array(FRAME_WORDS);
  const set = (name: string, v: number | boolean) => {
    f[FRAME_AT[name]] = typeof v === 'boolean' ? (v ? 1 : 0) : v;
  };
  f.set(p.viewProj, FRAME_AT.viewProj);
  f.set(p.cameraPos.subarray(0, 3), FRAME_AT.cameraPos);
  f.set(p.cameraForward.subarray(0, 3), FRAME_AT.cameraForward);
  set('proj5', p.proj[5]);
  set('near', p.near);
  set('far', p.far);
  set('perspective', p.perspective);
  set('width', p.width);
  set('height', p.height);
  set('heatScale', p.heatScale);
  set('mode', MODES[p.mode] ?? 0);
  set('accum', ACCUM[p.accumMode] ?? 0);
  set('blendAlpha', p.blendAlpha);
  set('heatGain', p.heatGain);
  set('sampleWeight', p.sampleWeight);
  set('spriteTexels', p.spriteTexels ?? 0);
  set('compositeOnly', p.compositeOnly);
  const h = p.heat;
  set('radius', h.radius);
  set('centre', h.centerIntensity);
  set('edge', h.edgeIntensity);
  set('falloff', h.falloff);
  set('saturation', h.saturation);
  set('floor', h.floor);
  set('minPx', h.minPixelRadius);
  set('maxPx', h.maxPixelRadius);
  set('zoomInvariant', h.zoomInvariant);
  set('groundProjected', h.groundProjected);
  set('groundY', h.groundY);
  set('signed', h.signed);
  set('teamColors', h.teamColors);
  set('teamCount', h.teamCount);
  set('teamNeutral', h.teamNeutral);
  set('teamSlices', h.teamSlices);
  set('teamBoost', h.teamBoost);
  set('smoothRamp', h.smoothRamp);
  set('useCurve', h.useCurve);
  set('response', h.response);
  set('cullNear', h.cullNear);
  set('cullFar', h.cullFar);
  set('cullPlanar', h.cullPlanar);
  set('cullGeometry', h.cullGeometry);
  set('occlusion', h.occlusion);
  set('occlusionFloor', h.occlusionFloor);
  set('occludedExtra', h.occludedExtra);
  set('hideBehindGround', h.hideBehindGround);
  set('lifeOn', p.lifetime !== null);
  set('lifeNow', p.lifetime?.now ?? 0);
  set('lifeDefault', p.lifetime?.defaultLifetime ?? 0);
  set('lifeFade', p.lifetime?.fadeOut ?? 0);
  set('useTeamSign', p.useTeamSign);
  set('splitMode', p.splitMode);
  f[FRAME_AT.splitPositive] = p.splitPositive[0];
  f[FRAME_AT.splitPositive + 1] = p.splitPositive[1];
  f[FRAME_AT.splitNegative] = p.splitNegative[0];
  f[FRAME_AT.splitNegative + 1] = p.splitNegative[1];
  f[FRAME_AT.splitScale] = p.splitScale[0];
  f[FRAME_AT.splitScale + 1] = p.splitScale[1];
  set('weightScale', p.weightScale);
  const slice = p.slice ?? null;
  set('sliceOn', slice !== null);
  set('sliceAxis', slice?.axis ?? -1);
  set('sliceMin', slice?.min ?? 0);
  set('sliceMax', slice?.max ?? 0);
  set('sliceOutside', slice?.outside ?? 1);
  set('sliceClipHeat', slice?.clipHeat ?? false);
  set('palette', palette);
  const lv = p.level?.kind === 'model' ? p.level : null;
  set('levelOn', lv !== null);
  if (lv) {
    set('levelOpacity', lv.opacity);
    set('levelBrightness', lv.brightness);
    set('levelWireframe', lv.wireframe);
    set('levelColours', lv.vertexColours);
    set('reliefSlope', lv.relief.slope);
    set('reliefSpacing', lv.relief.contourSpacing);
    set('reliefStrength', lv.relief.contourStrength);
    set('reliefIndexEvery', lv.relief.contourIndexEvery);
    set('reliefElevRange', lv.relief.elevationRange);
    set('reliefLowY', lv.relief.lowY);
    set('reliefHighY', lv.relief.highY);
    set('structFaceOpacity', lv.structure.faceOpacity);
    set('structWireOpacity', lv.structure.wireOpacity);
    f.set(lv.structure.tint, FRAME_AT.structTint);
    set('structFaces', lv.structure.showFaces);
    set('structWire', lv.structure.showWire);
    set('structFlat', lv.structure.flat);
    set('waterOpacity', lv.water.opacity);
    f.set(lv.water.tint, FRAME_AT.waterTint);
    set('waterShow', lv.water.show);
  }
  set('rateOn', h.rate !== null);
  set('directionOn', !!p.direction && p.direction.half < Math.PI);
  set('lineHeat', p.lineHeat);
  set('rateOverall', h.rate?.overall ?? 0.5);
  set('ratePrior', h.rate?.prior ?? 0);
  set('rateMin', h.rate?.minSamples ?? 0);
  set('rateSpan', h.rate?.span ?? 1);
  const dir = p.direction ?? null;
  set('dirHalf', dir ? dir.half : Math.PI);
  set('dirSoft', dir?.soft ?? 0);
  set('dirNorm', dir?.norm ?? 1);
  set('dirCentroid', dir?.centroid ?? 0);
  set('dirField', dir?.field ?? 0);
  set('dirCell', dir?.cell ?? 0);
  set('dirTime', dir?.time ?? -1);
  set('lineTrailNow', p.lineTrail?.now ?? 0);
  set('lineTrailTail', p.lineTrail?.tail ?? 0);
  set('timeLo', p.timeLo);
  set('timeHi', p.timeHi);
  set('dofBlur', p.dof ? p.dof.maxBlur : 0);
  set('viewX', viewX);
  set('viewY', viewY);
  set('showGrid', p.showGrid);
  set('showAxes', p.showAxes);
  set('gridSpacing', p.gridSpacing);
  set('gridExtent', p.gridExtent);
  f.set(p.viewProjRel, FRAME_AT.viewProjRel);
  f.set(p.origin.slice(0, 3), FRAME_AT.origin);
  set('spinTime', spinTime);
  set('cubeSize', p.cubeSize);
  set('showLook', p.showLookDirection);
  set('lookLength', p.lookLength);
  w.floats(f);
}

/**
 * The figures' instances into an open section, as they are: the figure replay writes them
 * relative to the frame's origin already (`FrameParams.viewProjRel`). `sent` says which
 * meshes the viewport has whole; the others are left out this frame, as the web leaves out a
 * mesh still on its way.
 */
export function writeFigures(w: PacketWriter, batches: readonly FigureBatch[], sent: (id: number) => boolean): void {
  let n = 0;
  for (const b of batches) if (b.count > 0 && sent(b.mesh.id)) n++;
  w.word(n);
  for (const b of batches) {
    if (!(b.count > 0) || !sent(b.mesh.id)) continue;
    w.word(b.mesh.id);
    w.word(b.count);
    w.reserveFloats(b.count * INSTANCE_STRIDE).set(b.data.subarray(0, b.count * INSTANCE_STRIDE));
  }
}

/**
 * The sampling plan: per entry its chunk, row bounds and block starts. Starts
 * a block apart are sent as runs (first, count), which is every plan that
 * draws all rows, else one by one, whichever is shorter.
 */
export function writePlan(w: PacketWriter, plan: FrameParams['plan'], maxBlocks: number): void {
  w.word(plan.length);
  let budget = maxBlocks;
  for (const e of plan) {
    const n = Math.max(0, Math.min(e.blockCount, budget));
    budget -= n;
    w.word(e.chunk);
    w.word(e.minRow);
    w.word(e.maxRow);
    w.word(n);
    let runs = 0;
    for (let b = 0; b < n; b++) if (b === 0 || e.blockStarts[b] !== e.blockStarts[b - 1] + SAMPLE_BLOCK) runs++;
    if (runs * 2 < n) {
      w.word(1);
      w.word(runs);
      let b = 0;
      while (b < n) {
        let k = 1;
        while (b + k < n && e.blockStarts[b + k] === e.blockStarts[b + k - 1] + SAMPLE_BLOCK) k++;
        w.word(e.blockStarts[b]);
        w.word(k);
        b += k;
      }
    } else {
      w.word(0);
      w.word(n);
      w.words(e.blockStarts, n);
    }
  }
}

/** The filters: each one's column (the core's name) and key, then the packed table. */
export function writeFilters(w: PacketWriter, filters: readonly ActiveFilter[], table: Uint32Array, generation: number): void {
  w.word(generation);
  w.word(filters.length);
  for (const f of filters) {
    w.string(coreColumnName(f.column));
    w.string(f.key);
  }
  w.word(table.length);
  w.words(table);
}
