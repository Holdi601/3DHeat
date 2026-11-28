/**
 * The WebGPU engine's shaders and constants, as the native viewport takes them.
 *
 * The native renderer (`native/crates/viewport`) runs the same WGSL the page
 * does, compiled by naga instead of Dawn: the splat, the compute binning of
 * Stage 0 (bin, resolve, kernel table, fold, listed splat), the filter pass,
 * the accumulation merge, the composite, the level's mesh, the lines, the figures,
 * the cubes and their look lines, the far-off glyphs, the capture zones' discs,
 * the spawn marks, the volumes' contours, the engagement ranges (shells, the
 * units' views, the ground they see), the GPU tracks' place and finish passes. The texts are
 * built here from the same sources, constants and all, and written beside the
 * crate as `.wgsl` files with a `generated.rs` of the numbers the Rust side
 * packs uniforms by. `shaderExport.test.ts` keeps the committed copies equal to
 * what this builds (`UPDATE_WGSL=1` rewrites them).
 */

import {
  BIN_APRON,
  BIN_LIST_ROWS,
  BIN_MAX_BYTES,
  BIN_RMAX,
  BIN_SLOTS,
  BIN_SPARSE,
  BIN_ABS,
  BIN_RADIUS,
  BIN_TEAM,
  FOLD_WGSL,
  LIST_HEAD,
  LUT_LEVELS,
  LUT_SIDE,
  LUT_STEP,
  LUT_WGSL,
  RESOLVE_WGSL,
  SCALE_R,
  SCALE_W,
  TILE,
  binWgsl,
  listHeatWgsl,
} from '../webgpu/heatBin';
import {
  COMPOSITE_UNIFORM_BYTES,
  COMPOSITE_WGSL,
  CUBE_WGSL,
  DECAY_WGSL,
  FILTER_PASS_WGSL,
  FLAG_CONSERVE,
  FLAG_GROUND_PROJECTED,
  FLAG_HAS_DIRS,
  FLAG_PERSPECTIVE,
  FLAG_RATE,
  FLAG_SMOOTH_RAMP,
  FLAG_TEAM_COLORS,
  FLAG_USE_CURVE,
  FLAG_USE_LIFETIME,
  FLAG_USE_TEAM_SIGN,
  HEAT_UNIFORM_BYTES,
  HEAT_WGSL,
  LINE_HEAT_WGSL,
  LINE_WGSL,
  BOX_WGSL,
  LOOK_WGSL,
  MAP_UNIFORM_BYTES,
  PEEL_BOX_WGSL,
  TERRAIN_WGSL,
  MAP_WGSL,
  MERGE_WGSL,
  MESH_WGSL,
  PEEL_UNIFORM_BYTES,
  PEEL_WGSL,
  WIRE_WGSL,
} from '../webgpu/shaders';
import { ARROW_WGSL, STREAM_WGSL } from '../webgpu/dirField';
import { FIELD_ARROW_VERTS } from '../dirFieldShared';
import { CHUNK_ROWS, FILTER_MASK_WIDTH, HEAT_DEPTH_LAYERS, MAX_PLAN_BLOCKS, SAMPLE_BLOCK } from '../types';
import { PEEL_EPSILON_REVERSE } from '../depth';
import { ATLAS_MIP_LEVELS } from '../../data/atlas';
import { LEVEL_DROP, LEVEL_IMAGE, LEVEL_MAP, LEVEL_MESH, LEVEL_NONE } from './levelMessages';
import { LEVEL_BOXES, LEVEL_TERRAIN, LEVEL_TERRAIN_TILE, TERRAIN_LAYERS } from './nativeTerrain';
import { BOX_FLOATS } from '../../world/terrainObjects';
import { INSTANCE_FLOATS as TERRAIN_INSTANCE_FLOATS } from '../../world/terrainStream';
import { LUT_HEIGHT, LUT_WIDTH } from '../colors';
import { CURVE_LUT_SIZE } from '../../state/curve';
import { VOLUME_BLOCK_FLOATS } from '../../volumes/gpu';
import { figureWgsl, SEE_THROUGH_BELOW } from '../figureShaders';
import { INSTANCE_STRIDE, MESH_STRIDE } from '../../figures/instances';
import { ATLAS_HEIGHT, ATLAS_WIDTH } from '../symbols/atlas';
import { SYMBOL_UNIFORM_FLOATS, symbolWgsl } from '../symbols/shaders';
import { FRAME_FIELDS, FRAME_WORDS, PACKET_MAGIC, PACKET_VERSION, SECTION } from './framePacket';
import { MAX_ZONES, ZONE_MIN_PX, ZONE_STATE_FLOATS, ZONE_UNIFORM_BYTES, ZONE_VERTEX_FLOATS, ZONE_WGSL } from '../zoneShaders';
import { SPAWN_INSTANCE_FLOATS, SPAWN_UNIFORM_FLOATS, spawnWgsl } from '../spawnMarks';
import { CONTOUR_UNIFORM_BYTES, volumeContourWgsl } from '../volumeContours';
import { MAX_GPU_VOLUMES } from '../../volumes/gpu';
import { SHELL_UNIFORM_BYTES, SHELL_WGSL } from '../../ranges/shellShaders';
import { SHELL_FLOATS } from '../../ranges/shells';
import { FINISH_WGSL, MARKS_WGSL, PLACE_WGSL, TRAIL_WGSL } from '../gpuTracks/shader';
import { TRACKS_UNIFORM_BYTES, TRAIL_ROOM } from '../gpuTracks/gpuLayout';
import { TRACK_U32 } from '../gpuTracks/store';
import { HEAT_TILES_WGSL, TILE_INST_FLOATS, TILE_LAYERS, TILE_LAYERS_RGBA, TILE_UPLOADS_PER_FRAME } from '../webgpu/heatTilesPass';
import { TILE as HEAT_TILE } from '../heatTiles/tileFormat';
import { CAPTURE_UNIFORM_BYTES, CAPTURE_WGSL, GROUND_UNIFORM_BYTES, GROUND_WGSL, MAX_VIEWS, VIEW_FACE, VIEW_LAYERS } from '../../ranges/viewshedShaders';

/** The shaders, by file name. */
export function nativeShaders(): Record<string, string> {
  return {
    'heat_splat.wgsl': HEAT_WGSL,
    'heat_line.wgsl': LINE_HEAT_WGSL,
    'dir_arrow.wgsl': ARROW_WGSL,
    'dir_stream.wgsl': STREAM_WGSL,
    'heat_bin.wgsl': binWgsl(),
    'heat_list.wgsl': listHeatWgsl(),
    'heat_resolve.wgsl': RESOLVE_WGSL,
    'heat_lut.wgsl': LUT_WGSL,
    'heat_fold.wgsl': FOLD_WGSL,
    'filter_pass.wgsl': FILTER_PASS_WGSL,
    'decay.wgsl': DECAY_WGSL,
    'merge.wgsl': MERGE_WGSL,
    'composite.wgsl': COMPOSITE_WGSL,
    'mesh.wgsl': MESH_WGSL,
    'map.wgsl': MAP_WGSL,
    'terrain.wgsl': TERRAIN_WGSL,
    'box.wgsl': BOX_WGSL,
    'peel_box.wgsl': PEEL_BOX_WGSL,
    'wire.wgsl': WIRE_WGSL,
    'peel.wgsl': PEEL_WGSL,
    'line.wgsl': LINE_WGSL,
    'figure.wgsl': figureWgsl(),
    'cube.wgsl': CUBE_WGSL,
    'look.wgsl': LOOK_WGSL,
    'symbol.wgsl': symbolWgsl(),
    'zone.wgsl': ZONE_WGSL,
    'spawn.wgsl': spawnWgsl(),
    'volume_contour.wgsl': volumeContourWgsl(),
    'range_shell.wgsl': SHELL_WGSL,
    'range_ground.wgsl': GROUND_WGSL,
    'range_capture.wgsl': CAPTURE_WGSL,
    'tracks_place.wgsl': PLACE_WGSL,
    'tracks_finish.wgsl': FINISH_WGSL,
    'tracks_marks.wgsl': MARKS_WGSL,
    'tracks_trail.wgsl': TRAIL_WGSL,
    'heat_tiles.wgsl': HEAT_TILES_WGSL,
  };
}

const SCREAM = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

/** The Rust constants: the engine's numbers and the packet's layout. */
export function nativeConstants(): string {
  const lines: string[] = [
    '// Generated by src/render/native/shaderExport.ts (UPDATE_WGSL=1 npx vitest run src/render/native). Do not edit.',
    '#![allow(dead_code)]',
    '',
  ];
  const int = (name: string, v: number) => lines.push(`pub const ${name}: u32 = ${v};`);
  const flt = (name: string, v: number) => lines.push(`pub const ${name}: f32 = ${Number.isInteger(v) ? `${v}.0` : String(v)};`);
  int('PACKET_MAGIC', PACKET_MAGIC);
  int('PACKET_VERSION', PACKET_VERSION);
  for (const [k, v] of Object.entries(SECTION)) int(`SECTION_${SCREAM(k)}`, v);
  int('SAMPLE_BLOCK', SAMPLE_BLOCK);
  int('MAX_PLAN_BLOCKS', MAX_PLAN_BLOCKS);
  int('CHUNK_ROWS', CHUNK_ROWS);
  int('FILTER_MASK_WIDTH', FILTER_MASK_WIDTH);
  int('HEAT_UNIFORM_BYTES', HEAT_UNIFORM_BYTES);
  int('COMPOSITE_UNIFORM_BYTES', COMPOSITE_UNIFORM_BYTES);
  int('VOLUME_BLOCK_FLOATS', VOLUME_BLOCK_FLOATS);
  int('LUT_WIDTH', LUT_WIDTH);
  int('LUT_HEIGHT', LUT_HEIGHT);
  int('CURVE_LUT_SIZE', CURVE_LUT_SIZE);
  int('MESH_STRIDE', MESH_STRIDE);
  int('INSTANCE_STRIDE', INSTANCE_STRIDE);
  flt('SEE_THROUGH_BELOW', SEE_THROUGH_BELOW);
  int('ATLAS_WIDTH', ATLAS_WIDTH);
  int('ATLAS_HEIGHT', ATLAS_HEIGHT);
  int('SYMBOL_UNIFORM_FLOATS', SYMBOL_UNIFORM_FLOATS);
  int('MAX_ZONES', MAX_ZONES);
  int('ZONE_VERTEX_FLOATS', ZONE_VERTEX_FLOATS);
  int('ZONE_STATE_FLOATS', ZONE_STATE_FLOATS);
  int('ZONE_UNIFORM_BYTES', ZONE_UNIFORM_BYTES);
  flt('ZONE_MIN_PX', ZONE_MIN_PX);
  int('SPAWN_INSTANCE_FLOATS', SPAWN_INSTANCE_FLOATS);
  int('SPAWN_UNIFORM_FLOATS', SPAWN_UNIFORM_FLOATS);
  int('CONTOUR_UNIFORM_BYTES', CONTOUR_UNIFORM_BYTES);
  int('MAX_GPU_VOLUMES', MAX_GPU_VOLUMES);
  int('SHELL_FLOATS', SHELL_FLOATS);
  int('SHELL_UNIFORM_BYTES', SHELL_UNIFORM_BYTES);
  int('GROUND_UNIFORM_BYTES', GROUND_UNIFORM_BYTES);
  int('CAPTURE_UNIFORM_BYTES', CAPTURE_UNIFORM_BYTES);
  int('MAX_VIEWS', MAX_VIEWS);
  int('VIEW_FACE', VIEW_FACE);
  int('VIEW_LAYERS', VIEW_LAYERS);
  int('FIELD_ARROW_VERTS', FIELD_ARROW_VERTS);
  int('HEAT_DEPTH_LAYERS', HEAT_DEPTH_LAYERS);
  int('PEEL_UNIFORM_BYTES', PEEL_UNIFORM_BYTES);
  int('MAP_UNIFORM_BYTES', MAP_UNIFORM_BYTES);
  for (const [k, v] of Object.entries({ LEVEL_NONE, LEVEL_MESH, LEVEL_IMAGE, LEVEL_MAP, LEVEL_DROP, LEVEL_TERRAIN, LEVEL_TERRAIN_TILE, LEVEL_BOXES, TERRAIN_LAYERS, BOX_FLOATS })) int(k, v);
  int('TERRAIN_INSTANCE_FLOATS', TERRAIN_INSTANCE_FLOATS);
  int('ATLAS_MIP_LEVELS', ATLAS_MIP_LEVELS);
  flt('PEEL_EPSILON_REVERSE', PEEL_EPSILON_REVERSE);
  int('TRACKS_UNIFORM_BYTES', TRACKS_UNIFORM_BYTES);
  int('TRACKS_TRAIL_ROOM', TRAIL_ROOM);
  int('TRACK_U32', TRACK_U32);
  int('TILE_LAYERS', TILE_LAYERS);
  int('TILE_LAYERS_RGBA', TILE_LAYERS_RGBA);
  int('TILE_UPLOADS_PER_FRAME', TILE_UPLOADS_PER_FRAME);
  int('TILE_INST_FLOATS', TILE_INST_FLOATS);
  int('TILE_SIDE', HEAT_TILE);
  for (const [k, v] of Object.entries({
    FLAG_PERSPECTIVE,
    FLAG_GROUND_PROJECTED,
    FLAG_USE_TEAM_SIGN,
    FLAG_USE_LIFETIME,
    FLAG_SMOOTH_RAMP,
    FLAG_USE_CURVE,
    FLAG_TEAM_COLORS,
    FLAG_CONSERVE,
    FLAG_HAS_DIRS,
    FLAG_RATE,
  }))
    int(k, v);
  int('BIN_RMAX', BIN_RMAX);
  int('BIN_APRON', BIN_APRON);
  int('BIN_SLOTS', BIN_SLOTS);
  int('BIN_LIST_HEAD', LIST_HEAD);
  int('BIN_LIST_ROWS', BIN_LIST_ROWS);
  int('BIN_SPARSE', BIN_SPARSE);
  int('BIN_TILE', TILE);
  int('BIN_FLAG_RADIUS', BIN_RADIUS);
  int('BIN_FLAG_ABS', BIN_ABS);
  int('BIN_FLAG_TEAM', BIN_TEAM);
  int('BIN_MAX_BYTES', BIN_MAX_BYTES);
  int('BIN_LUT_LEVELS', LUT_LEVELS);
  int('BIN_LUT_SIDE', LUT_SIDE);
  flt('BIN_LUT_STEP', LUT_STEP);
  flt('BIN_SCALE_W', SCALE_W);
  flt('BIN_SCALE_R', SCALE_R);
  lines.push('');
  lines.push('/// Where each of the frame section\'s numbers sits (src/render/native/framePacket.ts FRAME_FIELDS).');
  let at = 0;
  for (const [name, n] of FRAME_FIELDS) {
    lines.push(`pub const F_${SCREAM(name)}: usize = ${at};`);
    at += n;
  }
  lines.push(`pub const FRAME_WORDS: usize = ${FRAME_WORDS};`);
  return `${lines.join('\n')}\n`;
}
