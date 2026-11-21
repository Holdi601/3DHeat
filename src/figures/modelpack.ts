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
 * far), each with a mesh node per part: `hull`, `aerial` (antennas and other
 * thin parts: drawn, left out of the figure's size), `gear` (running gear,
 * drawn in the track colour; an aircraft's landing gear with extras
 * `{ retract: true, pivot }`, down on the ground and when slow and low, folded
 * away in flight), `turret` (extras `{ joint: 'yaw', pivot }`) and `gun`
 * (extras `{ joint: 'pitch', pivot, parent }`); numbered ones for units with
 * several (`turret.2`, its `gun.2` with `parent: 'turret.2'`, a turret's
 * `rest`: the yaw it was built facing) and `rotor.N` (a propeller or rotor:
 * extras `{ spin: 'rotor', pivot, axis, diameter }`). Positions are float32 metres
 * in the figure frame (x forward, y up, z right) about the unit's own origin,
 * where the game puts it. A `dm` node may hold further parts (damage-model
 * parts with their armour in extras); they are not drawn. A unit whose `kind`
 * is `static` (a barrier, building or container) stands for no unit.
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
  joint?: 'yaw' | 'pitch' | 'spin' | 'gear';
  parent?: number;
  /** A spinning part's shaft and turns, radians a second at full power. */
  axis?: Vec3;
  rate?: number;
  /** A turret's yaw as built, radians, right positive (PI: a ship's after turret). */
  rest?: number;
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
  /** An aircraft's propeller: drawn with the faint disc of a turning one. */
  prop?: { at: Vec3; diameter: number };
  /** The box of the body without its `aerial` parts (antennas, whips): what the figure's size is taken from. */
  bounds?: number[];
}

/** Where the servers serve the model packs' index (204 when there is none); a unit's model is at `/u/<game>/<unit>?v=<tag>` under it. */
export const MODEL_PACK_ROUTE = '/__heat3d/model-pack';

export interface ModelPackUnit {
  tag: string;
  domain?: string;
  type?: string;
  /** What the game's tool calls the unit ("helicopter", "mbt"): tells a helicopter from an aeroplane. */
  kind?: string;
  /** The real vehicle's name, the same in every game's pack ("T-80UD"): what other games' units are matched on. */
  name?: string;
  /** More names of the same vehicle (a long form beside the short one). */
  names?: string[];
  /** Further unit ids drawn with the same file. */
  aliases?: string[];
}

/**
 * What a pack unit or a figure is, as far as one may stand for the other: a helicopter's model never sits on a
 * fighter's figure, a drone's never on a crewed aircraft's, a ship's never on a tank's. `static` (a game's barriers,
 * buildings, containers) stands for no unit at all.
 */
export type UnitSide = 'air' | 'heli' | 'drone' | 'ground' | 'sea' | 'person' | 'item' | 'static' | 'other';

const DRONE = /\b(uav|ucav|drones?|quadcopter|multicopter)\b|drone-/i;

/** A pack unit's side from its domain, its tool's kind word and its type word. */
export function packSide(info: Pick<ModelPackUnit, 'domain' | 'kind' | 'type'>): UnitSide {
  // A pack without domains is of ground vehicles, as packs began.
  const d = (info.domain ?? 'ground').toLowerCase();
  const words = `${info.kind ?? ''} ${info.type ?? ''}`.toLowerCase();
  if (d === 'static' || /(^|\s)static(\s|$)/.test(words)) return 'static';
  if (d === 'heli' || d === 'air') {
    if (DRONE.test(words)) return 'drone';
    return d === 'heli' || /heli|rotorcraft/.test(words) ? 'heli' : 'air';
  }
  if (d === 'ground' || d === 'sea' || d === 'person' || d === 'item') return d;
  return 'other';
}

/** A catalogue figure's side from its domain and class. */
export function figureSide(e: { domain?: string; cls?: string } | undefined): UnitSide {
  if (!e) return 'other';
  const cls = e.cls ?? '';
  if (e.domain === 'heli') return /drone/.test(cls) ? 'drone' : 'heli';
  if (e.domain === 'air') return /drone/.test(cls) ? 'drone' : 'air';
  if (e.domain === 'ground') return cls === 'building' ? 'static' : 'ground';
  if (e.domain === 'sea' || e.domain === 'person') return e.domain;
  return 'other';
}

/** Whether a model of one side may be drawn on a figure of the other: the same side, or a tiltrotor's either way. */
export function sidesMeet(model: UnitSide, figure: UnitSide, figureCls = ''): boolean {
  if (model === 'static' || model === 'item' || model === 'other' || figure === 'other') return false;
  if (model === figure) return true;
  return /tiltrotor|vtol/.test(figureCls) && (model === 'air' || model === 'heli');
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

/** The parts a pack model may have, by their name before any number (`turret.2`), in the order they are packed. */
const PARTS = ['hull', 'aerial', 'gear', 'turret', 'gun', 'rotor'] as const;
const PART_NAME = /^(hull|aerial|gear|turret|gun|rotor)(?:\.(\d+))?$/;

/** The order parts are packed in: unnumbered first, then by number, a turret before its gun. */
function partRank(name: string): [number, number] {
  const m = PART_NAME.exec(name)!;
  return [m[2] ? Number(m[2]) : 0, PARTS.indexOf(m[1] as (typeof PARTS)[number])];
}

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
export function figureFromModelGlb(bytes: Uint8Array, scale = 1): ModelFigure {
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
      if (n.mesh === undefined || !PART_NAME.test(n.name ?? '')) continue;
      const prim = g.meshes[n.mesh].primitives[0];
      parts.set(n.name!, { p: accessor(g, bin, prim.attributes.POSITION) as Float32Array, idx: accessor(g, bin, prim.indices) as Uint16Array, extras: n.extras });
    }
    return parts;
  });
  const present = [...new Set(lods.flatMap((l) => [...l.keys()]))].sort((a, b) => {
    const [ka, pa] = partRank(a);
    const [kb, pb] = partRank(b);
    return ka - kb || pa - pb;
  });
  const extrasOf = (name: string) => lods.map((l) => l.get(name)?.extras).find((e) => e);
  // Joints: a turret turns about its ring when it has a pivot; a gun raises about its trunnion, on its turret when
  // there is one (`parent` counts jointed parts). Rotors are drawn where they stand (figures have no spinning joint);
  // a propeller gets the faint disc of a turning one.
  const parts: ModelPart[] = [];
  const order: string[] = [];
  const jointIndex = new Map<string, number>();
  let prop: ModelFigure['prop'];
  for (const name of present) {
    const base = PART_NAME.exec(name)![1];
    const x = extrasOf(name) ?? {};
    const pivot = vec3(x.pivot);
    const unnumbered = name === base;
    // An aircraft's landing gear (`retract`) is down on the ground and when slow and low, up in flight (`GEAR_UP`
    // in instances.ts): drawn in its own colour, folded into its pivot when up. A ground unit's is running gear.
    if (base === 'gear' && x.retract === true && pivot) {
      jointIndex.set(name, jointIndex.size);
      parts.push({ name, pivot, joint: 'gear' });
    } else if (base === 'gear') parts.push({ name, pivot: [0, 0, 0], track: true });
    else if (base === 'turret' && pivot && (x.joint === 'yaw' || unnumbered)) {
      jointIndex.set(name, jointIndex.size);
      parts.push({ name, pivot, joint: 'yaw', ...(typeof x.rest === 'number' && Number.isFinite(x.rest) ? { rest: x.rest } : {}) });
    } else if (base === 'gun' && pivot && (x.joint === 'pitch' || unnumbered)) {
      const on = typeof x.parent === 'string' ? x.parent : unnumbered && present.includes('turret') ? 'turret' : null;
      const parent = on !== null ? jointIndex.get(on) : undefined;
      jointIndex.set(name, jointIndex.size);
      parts.push({ name, pivot, joint: 'pitch', ...(parent !== undefined ? { parent } : {}) });
    } else if (base === 'rotor' && pivot && vec3(x.axis)) {
      // A propeller or rotor spins on its own (a joint of its own kind): seen turning, not strobing at 60 frames a
      // second - a main rotor 3 turns a second, a tail rotor or propeller 4, the faint disc showing the speed. A
      // frame's turn stays within two fifths of the angle between two blades up to six blades (24 of 60 degrees; at 6
      // turns a second a five-blade propeller moved half its blade spacing a frame and read as standing or reversing).
      const axis = vec3(x.axis)!;
      const main = Math.abs(axis[1]) > 0.9;
      jointIndex.set(name, jointIndex.size);
      parts.push({ name, pivot, joint: 'spin', axis, rate: 2 * Math.PI * (main ? 3 : 4) });
      if (!prop && axis[0] > 0.9 && typeof x.diameter === 'number') prop = { at: pivot, diameter: x.diameter };
    } else parts.push({ name, pivot: [0, 0, 0] });
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
  // The body's box without the thin parts that stand off it (antennas): what the figure's size is taken from.
  const blo = [Infinity, Infinity, Infinity];
  const bhi = [-Infinity, -Infinity, -Infinity];
  let aerials = false;
  for (const [name, { p }] of lods[0]) {
    if (name.startsWith('aerial')) {
      aerials = true;
      continue;
    }
    for (let v = 0; v < p.length; v += 3)
      for (let a = 0; a < 3; a++) {
        if (p[v + a] < blo[a]) blo[a] = p[v + a];
        if (p[v + a] > bhi[a]) bhi[a] = p[v + a];
      }
  }
  const bounds = aerials && Number.isFinite(blo[0]) ? [...blo, ...bhi].map((x) => x * scale) : undefined;
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
  // A pack whose models are in another measure than its game's data (`scale` in its index): the box and the pivots
  // scaled, the 16-bit positions span the box whatever it is.
  if (scale !== 1) {
    for (const q of parts) q.pivot = [q.pivot[0] * scale, q.pivot[1] * scale, q.pivot[2] * scale];
    if (prop) prop = { at: [prop.at[0] * scale, prop.at[1] * scale, prop.at[2] * scale], diameter: prop.diameter * scale };
  }
  return {
    anchor: meta.anchor === 'centre' ? 'centre' : 'ground',
    box: [...lo, ...hi].map((x) => x * scale),
    parts,
    crease: 50,
    lods: words.slice(0, 3),
    ...(prop ? { prop } : {}),
    ...(bounds ? { bounds } : {}),
  };
}

/** One damage-model part of a pack model (`dm:<name>` under its `dm` node): its triangles and its armour. */
export interface ModelPlate {
  name: string;
  /** The model part it moves with (`hull`, `turret`, `gun`, `turret.2`...); `hull` when the pack names none of them. */
  part: string;
  /** Thickness, mm, where the game gives one (`mm`, or `thickness`). */
  mm?: number;
  /** The armour or material class. */
  cls?: string;
  /**
   * What kind of region it is, where the pack says (`group`): `zone` (a part's face toward one side: Battlefield's
   * direction zones), `piece` (a destructible piece), `shell` (a collision shell), `armour`, `engine`, `fuel`...
   */
  group?: string;
  /** A direction zone's side: `front`, `rear`, `left`, `right`, `top`, `bottom`. */
  zone?: string;
  /** Its hit points, where the game gives them. */
  hp?: number;
  pos: Float32Array;
  idx: Uint16Array | Uint32Array;
}

const num = (x: unknown): number | undefined => (typeof x === 'number' && Number.isFinite(x) ? x : undefined);
const str = (x: unknown): string | undefined => (typeof x === 'string' && x ? x : undefined);

/** A pack model's damage-model parts (none when it has no `dm` node). */
export function platesFromModelGlb(bytes: Uint8Array): ModelPlate[] {
  const { json: g, bin } = readGlb(bytes);
  const dm = g.nodes.find((n) => n.name === 'dm');
  const out: ModelPlate[] = [];
  for (const ci of dm?.children ?? []) {
    const n = g.nodes[ci];
    if (n.mesh === undefined || !n.name?.startsWith('dm:')) continue;
    const prim = g.meshes[n.mesh].primitives[0];
    const x = n.extras ?? {};
    // A region's `part` is the model part it moves with where it names one (Reforger's names the hit zone itself).
    const part = str(x.part);
    const mm = num(x.mm) ?? num(x.thickness);
    out.push({
      name: n.name.slice(3),
      part: part && PART_NAME.test(part) ? part : 'hull',
      ...(mm !== undefined ? { mm } : {}),
      ...(str(x.class) ? { cls: str(x.class) } : str(x.material) ? { cls: str(x.material) } : {}),
      ...(str(x.group) ? { group: str(x.group) } : {}),
      ...(str(x.zone) ? { zone: str(x.zone) } : {}),
      ...(num(x.hp) !== undefined ? { hp: num(x.hp) } : {}),
      pos: accessor(g, bin, prim.attributes.POSITION) as Float32Array,
      idx: accessor(g, bin, prim.indices) as Uint16Array | Uint32Array,
    });
  }
  return out;
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

/**
 * The figures a pack unit without an alias stands in for, by its side and its kind and type words: figure names or
 * classes (the class's first figure), the first the catalogue has.
 */
const TYPE_KIN: Record<string, [RegExp, string[]][]> = {
  ground: [
    [/static|stationary|emplacement|fortif/i, ['emplacement-gun']],
    [/spaa|anti.?air|\baaa?\b|flak/i, ['spaa']],
    [/\bsam\b|missile/i, ['sam']],
    [/light|destroyer/i, ['light-tank', 'mbt']],
    [/\bifv\b/i, ['ifv']],
    [/\bapc\b|armou?red.?car/i, ['apc-wheeled', 'apc-tracked']],
    [/artillery|howitzer/i, ['sp-artillery']],
    [/mlrs|rocket/i, ['mlrs']],
    [/horse|cavalry/i, ['horse']],
    [/\b(car|jeep|buggy)\b/i, ['jeep']],
    [/truck|vehicle|trailer|rail/i, ['truck']],
    [/./, ['mbt']],
  ],
  air: [
    [/bomber/i, ['ww2-bomber', 'bomber']],
    [/assault|attack|stormovik/i, ['ww2-attack', 'attack']],
    [/transport|cargo|tanker|awacs|patrol/i, ['transport']],
    [/airship|zeppelin|blimp/i, ['zeppelin']],
    [/./, ['ww2-fighter', 'fighter', 'multirole']],
  ],
  heli: [
    [/attack|gunship/i, ['attack-helicopter', 'heli-attack']],
    [/scout|light|recon/i, ['scout-helicopter', 'heli-scout']],
    [/./, ['transport-helicopter', 'heli-transport']],
  ],
  drone: [
    [/heli|rotor|copter/i, ['quadcopter', 'drone-rotary']],
    [/./, ['drone-fixed']],
  ],
  sea: [
    [/carrier/i, ['carrier']],
    [/submarine/i, ['submarine']],
    [/boat|launch/i, ['patrol-boat', 'rhib']],
    [/./, ['destroyer', 'patrol-boat']],
  ],
  // A game's people (CS2's agents) stand in for the soldier; its weapons and items stand in for nothing.
  person: [[/./, ['soldier']]],
};

/**
 * The catalogue figure a pack unit is a variant of: its alias when that figure is of the unit's side, else the
 * first figure its side and kind and type words name. A static object (a game's barrier, building, container) and an
 * item is none: they stand for no unit. `entry` looks a figure up, `byClass` a class's first figure.
 */
export function kinFor(
  unit: string,
  info: ModelPackUnit,
  entry: (name: string) => { domain?: string; cls?: string } | undefined,
  aliases: Record<string, string>,
  byClass: (cls: string) => string | null = () => null,
): string | null {
  const side = packSide(info);
  if (side === 'static' || side === 'item' || side === 'other') return null;
  const a = aliases[unit.toLowerCase()];
  const ae = a ? entry(a.indexOf('@') > 0 ? a.slice(0, a.indexOf('@')) : a) : undefined;
  if (a && ae && sidesMeet(side, figureSide(ae), ae.cls)) return a;
  const words = `${info.kind ?? ''} ${info.type ?? ''}`;
  for (const [re, names] of TYPE_KIN[side] ?? []) {
    if (!re.test(words)) continue;
    for (const n of names) {
      const f = entry(n) ? n : byClass(n);
      if (f && sidesMeet(side, figureSide(entry(f)), entry(f)?.cls)) return f;
    }
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
