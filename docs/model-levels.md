---
title: 3D levels
parent: Levels and background geometry
nav_order: 2
---

# 3D levels

**3D model…** in the Background / level panel loads a level mesh. It is parsed, classified and simplified in a background worker ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) with a progress line and **Cancel**: *Reading model*, *Parsing file*, *Packing N textures*, *Classifying N parts*, *Simplifying ground (N tris)*, *Simplifying structures (N tris)*, *Building wireframe*.

## Formats

| Format | What is read | Limits |
|---|---|---|
| `.glb` | Every mesh primitive with `mode` 4 (triangles) or no mode, with each node's world transform applied; `POSITION`; `COLOR_0` (vec3 or vec4) as vertex colour; the material's `baseColorTexture` and its `TEXCOORD_n` as a texture; node and mesh names as part names. | Lines and points are skipped. |
| `.gltf` | The same. | Only with embedded buffers: a glTF that references an external `.bin` is refused with *Export as a single .glb so the geometry is embedded.* |
| `.obj` | Faces, with `o` and `g` blocks as parts. | Geometry only (no materials). |
| `.stl` | Binary and ASCII (`solid …`). | One part. |
| `.ply` | ASCII only. | Binary PLY is refused with *Convert to .glb or binary .stl.* |

Geometry only: positions, normals and triangles welded into one buffer, plus colours and texture coordinates where present ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). A model with no triangles is refused. The model must be in the same world space and unit as the data (Y up): nothing is transformed to fit.

## Ground, structures and water

A level is split into three classes on import, because they want opposite treatments ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Ground** - drawn opaque and shaded with relief cues (slope, contours, an elevation ramp) so position can be read against it.
- **Structures** - buildings and props stand between the camera and the heat inside them, so they are drawn as a **transparent shell** (faint faces with a bright rim, plus deduplicated edges) - or, when textured, solid in their textures.
- **Water** - flat, without terrain cues: a contour line across a lake is nonsense.

Each part (glTF node, OBJ object or group) is classified on its own, by the first rule that applies:

1. **The exporter's label.** A name starting with `ground:`, `structure:` or `water:` (or with `|` instead of `:`) is taken at its word. The project's own exporters label every part this way.
2. **Water names.** `water` as a word (not *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Ground names.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Structure names.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometry.** A part covering more than 25% of the map's X-Z area with more than 60% of its triangle area facing up is ground. A part with less than 45% facing up, or taller than 15% of the level's height while covering less than 10% of its area, is a structure. The up-facing share is weighted by area, so a house is not called flat for having a roof.
6. **Otherwise ground** - an ambiguous part defaults to ground, because a near-invisible shell default would make the level look like a rendering failure.

A model that is a single part classified as a structure is made ground instead (*single unnamed mesh - treated as ground*).

### Navigation meshes

A part named `nav:…` (a level exporter's `nav:walkable`) is a navigation mesh: where a soldier can stand. It is listed as ground (*navigation mesh - not drawn, as it lies on the ground; clicks still find it*) but **not drawn**. It is draped over the ground it was generated from, coplanar with it to within centimetres, and drawn as ground the two surfaces fought for every pixel: on a level with a baked ground texture the whole playable area showed as hard-edged patches of grey and beige, one per nav triangle. It is kept, unsimplified, so that [click-to-pick](camera.md#click-to-pick) can say whether a spot is walkable. Library entries do not keep it.

**Show part classification (N)** in the panel (shown for models with more than one part) lists every part with its class and the reason - *labelled by the exporter*, *name matches pattern*, *covers X% of the map, Y% up-facing*, *Y% up-facing, Z% of level height*, *ambiguous - defaulted to ground*. To change one, rename the part in the source model and import again; the split is baked into the index buffers.

## Simplification

**Simplification target** sets the triangle budget for the next import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Setting | Triangles |
|---|---|
| *Full - no simplification* (default) | all |
| *High - 8M triangles* | 8,000,000 |
| *Medium - 3M triangles* | 3,000,000 |
| *Low - 800k triangles* | 800,000 |
| *Silhouette - 100k triangles* | 100,000 |

The budget is split **60% to structures and 40% to the ground**, simplified separately - structures lose their shape fastest under decimation. Water is not simplified. Simplification is edge collapse with quadric error metrics ([meshoptimizer](https://github.com/zeux/meshoptimizer), via WebAssembly), after welding coincident vertices, so silhouettes and hard edges survive. The import note reports `source → now triangles, deviation X%`, the ground / structures / water split across the parts, and - when *Full* was used on a model above 8M triangles - suggests *High* (up to 30M) or *Medium* (above). Without WebAssembly the simplifier is unavailable and the import says so.

Levels from the project's own exporters are budgeted already; the target exists for raw art with no budget behind it.

## Textures

A `.glb` whose parts carry base-colour textures is drawn in them - an extracted racing course, for example, carries one per terrain tile and one per placed model. Every texture is packed into **one atlas** in the import worker ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), so the level stays one draw, one sampler and one texture-coordinate attribute on both backends:

- packed in shelves at each image's own size, shrunk only if the set would not fit **8192 px** either way (WebGPU's default texture size limit);
- a **16-pixel gutter** around every image, and only the 5 mip levels that gutter protects, so a distant sign never samples its neighbour's texture;
- **repeating textures** stay repeating. An image whose glTF sampler repeats (the glTF default) and whose texture coordinates leave 0..1 - a brick wall whose UV runs 0 to 40 along it - becomes a *tile*: its vertices keep their own coordinates and a 16-bit tile number, and the shaders wrap the coordinate into the tile's rectangle per pixel, taking the mip level from the unwrapped coordinate so the seams do not show. A tile's gutter holds its own opposite edge. An axis whose sampler clamps is clamped; an image whose coordinates stay inside 0..1 is drawn as before. A level with tiles costs 4 bytes a vertex more.

Ground texture is shown by default when present; structures that carry textures start **solid, in their own textures** (kerbs, guardrails, tyre walls and signs are the edges of a road, not buildings to look inside), with the wireframe off and flat shading off. See [Level appearance](level-appearance.md).

## Large levels

- Above **300,000** structure triangles the structure edges start switched off and the face opacity at 35%: with an edge in every pixel the district reads as flat white.
- The camera's far plane widens to fit the level ([Levels](levels.md#what-a-level-does-for-the-heat)).

## The exporter contract

What the viewer needs from a level, whatever made it:

- one self-contained `.glb`;
- float32 `POSITION`, triangle primitives;
- node names `ground:*`, `structure:*` and `water:*` (anything else is classified by the rules above), and `nav:*` for a navigation mesh, which is kept but not drawn;
- world-space coordinates, **Y up**, in the same unit as the telemetry, so the data sits on the level without any placement step.
