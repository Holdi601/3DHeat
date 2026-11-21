/**
 * Local model packs: per-unit vehicle models kept on this machine only,
 * outside the repository, one pack per game, drawn in place of the catalogue
 * figure a unit would otherwise get. Without a pack nothing changes, and a
 * unit no pack covers keeps its figure.
 *
 * A pack is a folder: `model-pack.json` and one `.glb` per unit. The index is
 * `{ format: '3dheat-model-pack', version: 1, game, gameBuild, source, units:
 * { <unit id>: { file, name, names?, aliases?, kind, domain, type, ... } } }`:
 * `name` is the real vehicle's name, neutral over games ("T-80UD", "M1A2
 * SEP"), `aliases` further ids that share the file. A unit's file holds a
 * root node `unit` and, under it, `lod0`, `lod1` and `lod2` (full, coarse and
 * far), each with a mesh node per part: `hull`, `gear` (running gear, drawn
 * in the track colour), `turret` (extras `{ joint: 'yaw', pivot }`) and `gun`
 * (extras `{ joint: 'pitch', pivot, parent }`). Positions are float32 metres
 * in the figure frame (x forward, y up, z right) about the unit's own origin,
 * where the game puts it. A `dm` node may hold further parts (damage-model
 * parts with their armour in extras); they are not drawn.
 *
 * The dev and preview servers hand out every pack at `MODEL_PACK_ROUTE`, from
 * `HEAT3D_MODEL_PACK` or the `modelPack` entry of the git-ignored
 * `tools/local-data.json` (vite.config.ts): the index as `{ version: 1, packs:
 * [{ game, units: { <unit id>: { tag, domain, type, name, names, aliases } } }] }`,
 * and each unit's model, converted on the server to a pack figure
 * (`figurepackBin.ts`), at `/u/<game>/<unit id>?v=<tag>`.
 *
 * A unit is drawn as, in turn: its own game's model (the data names the unit's
 * id), another game's model of the same vehicle (the catalogue figure both
 * ids stand for, or the real vehicle's name), then the built figure
 * (`installModelPackIndex` in `figurepack.ts`). Each model joins the catalogue
 * as a variant of the figure it replaces (`<figure>@model:<game>:<unit id>`),
 * so it is placed, lit, jointed and drawn by the same code as every figure.
 */

type Vec3 = [number, number, number];

/** One part of a model as a mesh figure part (`MeshPart` in `meshfig.ts`). */
export interface ModelPart {
  name: string;
  pivot: Vec3;
  joint?: 'yaw' | 'pitch';
  parent?: number;
  track?: boolean;
}

/**
 * A model as a mesh figure (`MeshFigureData` in `meshfig.ts`, which it fits; this module imports nothing, so the
 * servers' config can take it).
 */
export interface ModelFigure {
  anchor: 'ground' | 'centre';
  box: number[];
  parts: ModelPart[];
  crease?: number;
  lods: Uint16Array[];
}

/** Where the servers serve the model packs' index (204 when there is none); a unit's model is at `/u/<game>/<unit>?v=<tag>` under it. */
export const MODEL_PACK_ROUTE = '/__heat3d/model-pack';

export interface ModelPackUnit {
  tag: string;
  domain?: string;
  type?: string;
  /** The real vehicle's name, the same in every game's pack ("T-80UD"): what other games' units are matched on. */
  name?: string;
  /** More names of the same vehicle (a long form beside the short one). */
  names?: string[];
  /** Further unit ids drawn with the same file. */
  aliases?: string[];
}

export interface ModelPackIndex {
  version: 1;
  /** In order of precedence where two packs could stand for the same vehicle. */
  packs: { game: string; units: Record<string, ModelPackUnit> }[];
}

/** A name as names are matched across games: lower case, letters and digits only ("M1A2 SEP" -> "m1a2sep"). */
export function vehicleKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** The parts a pack model may have, in the order they are packed. */
const PARTS = ['hull', 'gear', 'turret', 'gun', 'rotor'] as const;

interface GltfNode {
  name?: string;
  mesh?: number;
  children?: number[];
  extras?: Record<string, unknown>;
}

interface Gltf {
  nodes: GltfNode[];
  meshes: { primitives: { attributes: { POSITION: number }; indices: number }[] }[];
  accessors: { bufferView: number; componentType: number; count: number; byteOffset?: number }[];
  bufferViews: { byteOffset?: number; byteLength: number }[];
}

function readGlb(bytes: Uint8Array): { json: Gltf; bin: Uint8Array } {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('not a glb');
  let o = 12;
  let json: Gltf | null = null;
  let bin: Uint8Array | null = null;
  while (o + 8 <= bytes.length) {
    const len = dv.getUint32(o, true);
    const type = dv.getUint32(o + 4, true);
    const body = bytes.subarray(o + 8, o + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(body)) as Gltf;
    else if (type === 0x004e4942) bin = body;
    o += 8 + len;
  }
  if (!json || !bin) throw new Error('glb without its JSON or binary chunk');
  return { json, bin };
}

function accessor(g: Gltf, bin: Uint8Array, i: number): Float32Array | Uint16Array | Uint32Array {
  const a = g.accessors[i];
  const v = g.bufferViews[a.bufferView];
  const at = bin.byteOffset + (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
  const src = bin.buffer.slice(at, at + v.byteLength - (a.byteOffset ?? 0));
  if (a.componentType === 5126) return new Float32Array(src, 0, a.count * 3);
  if (a.componentType === 5123) return new Uint16Array(src, 0, a.count);
  if (a.componentType === 5125) return new Uint32Array(src, 0, a.count);
  throw new Error(`accessor type ${a.componentType} not read`);
}

const vec3 = (x: unknown): Vec3 | null =>
  Array.isArray(x) && x.length === 3 && x.every((c) => typeof c === 'number' && Number.isFinite(c)) ? [x[0], x[1], x[2]] : null;

/**
 * A pack model (`.glb` bytes in the layout above) as a mesh figure: its three levels of detail, 16-bit over their
 * common box, with the turret and gun as jointed parts. Throws on a file of another layout.
 */
export function figureFromModelGlb(bytes: Uint8Array): ModelFigure {
  const { json: g, bin } = readGlb(bytes);
  const root = g.nodes.find((n) => n.name === 'unit');
  if (!root) throw new Error('no unit node');
  const meta = root.extras ?? {};
  const lodNodes = (root.children ?? []).map((i) => g.nodes[i]).filter((n) => /^lod\d$/.test(n.name ?? '')).sort((a, b) => (a.name! < b.name! ? -1 : 1));
  if (!lodNodes.length) throw new Error('no levels of detail');
  const lods = lodNodes.map((ln) => {
    const parts = new Map<string, { p: Float32Array; idx: Uint16Array | Uint32Array; extras?: Record<string, unknown> }>();
    for (const ci of ln.children ?? []) {
      const n = g.nodes[ci];
      if (n.mesh === undefined || !PARTS.includes(n.name as (typeof PARTS)[number])) continue;
      const prim = g.meshes[n.mesh].primitives[0];
      parts.set(n.name!, { p: accessor(g, bin, prim.attributes.POSITION) as Float32Array, idx: accessor(g, bin, prim.indices) as Uint16Array, extras: n.extras });
    }
    return parts;
  });
  const present = PARTS.filter((name) => lods.some((l) => l.has(name)));
  const extrasOf = (name: string) => lods.map((l) => l.get(name)?.extras).find((e) => e);
  // Joints: the turret turns about its ring when it has a pivot; the gun raises about its trunnion, on the turret when there is one.
  const turret = vec3(extrasOf('turret')?.pivot);
  const gun = vec3(extrasOf('gun')?.pivot);
  const parts: ModelPart[] = [];
  const order: string[] = [];
  for (const name of present) {
    if (name === 'hull') parts.push({ name, pivot: [0, 0, 0] });
    else if (name === 'gear') parts.push({ name, pivot: [0, 0, 0], track: true });
    else if (name === 'turret') parts.push(turret ? { name, pivot: turret, joint: 'yaw' } : { name, pivot: [0, 0, 0] });
    // A helicopter's main rotor: drawn where it stands (figures have no spinning joint).
    else if (name === 'rotor') parts.push({ name, pivot: [0, 0, 0] });
    else parts.push(gun ? { name, pivot: gun, joint: 'pitch', ...(turret && present.includes('turret') ? { parent: 0 } : {}) } : { name, pivot: [0, 0, 0] });
    order.push(name);
  }
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (const l of lods)
    for (const { p } of l.values())
      for (let v = 0; v < p.length; v += 3)
        for (let a = 0; a < 3; a++) {
          if (p[v + a] < lo[a]) lo[a] = p[v + a];
          if (p[v + a] > hi[a]) hi[a] = p[v + a];
        }
  if (!Number.isFinite(lo[0])) throw new Error('no geometry');
  for (let a = 0; a < 3; a++) if (hi[a] - lo[a] < 1e-3) hi[a] = lo[a] + 1e-3;
  const words = lods.map((l) => {
    const counts: number[] = [order.length];
    const body: number[][] = [];
    for (const name of order) {
      const q = l.get(name);
      const nv = q ? q.p.length / 3 : 0;
      const nt = q ? q.idx.length / 3 : 0;
      if (nv > 0xffff) throw new Error(`${name}: ${nv} vertices, over 16 bits`);
      counts.push(nv, nt);
      const w = new Array<number>(nv * 3 + nt * 3);
      for (let v = 0; v < nv * 3; v++) {
        const a = v % 3;
        w[v] = Math.round(((q!.p[v] - lo[a]) / (hi[a] - lo[a])) * 65535);
      }
      for (let t = 0; t < nt * 3; t++) w[nv * 3 + t] = q!.idx[t];
      body.push(w);
    }
    const out = new Uint16Array(counts.length + body.reduce((s, b) => s + b.length, 0));
    out.set(counts, 0);
    let o = counts.length;
    for (const b of body) {
      out.set(b, o);
      o += b.length;
    }
    return out;
  });
  while (words.length < 3) words.push(words[words.length - 1]);
  return {
    anchor: meta.anchor === 'centre' ? 'centre' : 'ground',
    box: [...lo, ...hi],
    parts,
    crease: 50,
    lods: words.slice(0, 3),
  };
}

/** The variant name a pack unit is drawn as: the figure it would have been, marked as this game's unit's model. */
export function modelVariantName(kin: string, game: string, unit: string): string {
  const at = kin.indexOf('@');
  return `${at > 0 ? kin.slice(0, at) : kin}@model:${game}:${unit.toLowerCase()}`;
}

/** Whether a figure name is a pack model of the given unit id itself (not another unit's or game's model standing in). */
export function isOwnModel(figure: string, unit: string): boolean {
  return figure.includes('@model:') && figure.endsWith(`:${unit.toLowerCase()}`);
}

/** The figure a unit without an alias stands in for: by the game's type word, within its domain. */
const TYPE_KIN: Record<string, [RegExp, string[]][]> = {
  ground: [
    [/spaa|anti.?air/i, ['spaa']],
    [/light|destroyer/i, ['light-tank', 'mbt']],
    [/./, ['mbt']],
  ],
  air: [
    [/helicopter/i, ['heli-attack', 'heli-transport']],
    [/bomber/i, ['ww2-bomber', 'bomber']],
    [/assault|attack/i, ['ww2-attack', 'attack']],
    [/./, ['ww2-fighter', 'fighter', 'multirole']],
  ],
  sea: [
    [/boat/i, ['patrol-boat', 'rhib']],
    [/./, ['destroyer', 'patrol-boat']],
  ],
  // A game's people (CS2's agents) stand in for the soldier; its weapons and items stand in for nothing.
  person: [[/./, ['soldier']]],
  item: [],
};

/** The catalogue figure a pack unit is a variant of: its alias, else the first figure its type word names. */
export function kinFor(unit: string, info: ModelPackUnit, has: (name: string) => boolean, aliases: Record<string, string>): string | null {
  const a = aliases[unit.toLowerCase()];
  if (a && has(a.indexOf('@') > 0 ? a.slice(0, a.indexOf('@')) : a)) return a;
  for (const [re, names] of TYPE_KIN[info.domain ?? 'ground'] ?? TYPE_KIN.ground) {
    if (!re.test(info.type ?? '')) continue;
    for (const n of names) if (has(n)) return n;
  }
  return null;
}

/** The pack's index the server hands out, or null (no route, no pack: 204 or 404). Never throws. */
export async function fetchModelPackIndex(): Promise<ModelPackIndex | null> {
  try {
    const r = await fetch(MODEL_PACK_ROUTE, { cache: 'no-cache' });
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
    const p = (await r.json()) as ModelPackIndex;
    return p && p.version === 1 && Array.isArray(p.packs) ? p : null;
  } catch {
    return null;
  }
}
