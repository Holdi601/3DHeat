# 3DHeat

Realtime 3D telemetry heatmap and team viewer for very large positional datasets.

Loads CSV and Parquet — a single file, several files, or a whole folder tree —
maps their columns to position/time/person/group, and renders them as an additive
sprite heatmap or as per-person cubes moving along a timeline.

Measured on the exports in `TestData/`: **14,398,932 rows from 4 Parquet files
(654 MB) ingest in 12.2 s** (1.18M rows/s), occupy 662 MB of RAM and 173 MB of
GPU memory, and render at 60fps.

Runs on **WebGPU** where available and falls back to **WebGL2**; both backends are
verified by the same 96-check headless suite.

> **Note on `old_tool/`** — the Unity version's assets are excluded from the dev
> server's file watcher in `vite.config.ts`, along with `TestData/`. Crawling
> multi-gigabyte directories costs about a gigabyte of resident memory and leaves
> Vite unable to answer its first request. Nothing in `src/` references that
> folder, so deleting it changes nothing.

## Running it

On Windows, double-click **`start.bat`**. It finds Node even when it is not on
`PATH`, installs dependencies on first run, refuses to start a second server on a
port that already has one, and opens the browser when the server is ready. Leave
that window open — it *is* the server. **`restart.bat`** stops and restarts it;
**`stop.bat`** just stops it, killing by port rather than by process name so it
cannot take down unrelated Node processes.

Vite hot-reloads source edits by itself, so a restart is only needed after
changing `vite.config.ts`, adding a dependency, or when the server has wedged.

**Updates.** `start.bat` brings a clean checkout up to the newest version of the
branch it follows before it starts (`git pull --ff-only`, the pinned extractors,
and `npm install` when the dependencies changed), and says so. A copy with local
changes is only told an update is waiting, and so is one with commits of its own
that the newest version does not have - a fast-forward cannot bring it up, and
merging is for `git pull` by hand. While it runs, the viewer asks the server now
and then whether its checkout is behind, and shows a notice with **Update now**
when it is - the server fast-forwards, and the page reloads, or asks for
`restart.bat` and says why: the dependencies changed, or only the server's
settings (`vite.config.ts`). When there turns out to be nothing to bring in (the
copy was brought up meanwhile), the notice says so and does not reload; local
changes and commits of its own are refused with the same words `start.bat` uses.
The update request is accepted only from the page itself (a custom header and a
same-origin check).

Or by hand:

```bash
npm install
npm run dev      # http://127.0.0.1:5273
```

The tools around the viewer are separate public projects, each with its own
MIT licence, releases, wiki and update check, pinned here as git submodules
under `exporters/`:

| Folder | Repository |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - courses and levels out of games' own archives |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - lap telemetry recorders; levels from gameplay video |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor plugin |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 demos and maps |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - records play in the background |

Clone with `git clone --recursive`, or run `git submodule update --init` after a
plain clone. Changes to a tool are committed and pushed in its own folder first,
then the new pin here.

```bash
npm run build     # production bundle
npm run typecheck # tsc, no emit
npm test          # unit + integration tests (vitest)
npm run smoke     # drives the real app in headless Chromium
```

The smoke test is the one that matters for rendering. A broken shader or an
incomplete framebuffer produces a silently black canvas rather than a build
error, so `npm run smoke` launches the actual app in a real GL context, loads
real Parquet through the real worker, and asserts the canvas has data-coloured
pixels in it. Screenshots land in `tools/.smoke/`.

## Languages

The viewer speaks 40 languages: every language of Europe's states - the 24 of
the EU, and Norwegian, Icelandic, Ukrainian, Russian, Belarusian, Serbian,
Bosnian, Macedonian, Albanian, Turkish, Luxembourgish and Catalan - plus
Japanese, Korean and Chinese, simplified and traditional. It starts in the
browser's language (the first of the browser's languages it speaks, English
otherwise); the menu beside the name at the top of the sidebar picks another,
kept in this browser. Everything it shows comes from the catalogs - the panels,
the hints, the warnings, the race analysis' every sentence, the car
comparisons, the course statistics, the match analysis - with numbers, decimal
marks and lists written the language's way and plurals by its own rules.
Switching language re-works the race analysis in it.

The catalogs are `src/i18n/locales/<language>/*.json`, in the ICU message
syntax (`{laps, plural, one {# lap} other {# laps}}`); English is the source,
and a message a language lacks is said in English. The translations were made
with an AI model from the English, with a glossary of racing terms, and the
race texts read over a second time with the values filled in; a native
speaker's corrections are welcome - each is one line of JSON. Labels longer
than the English wrap, hyphenated where the language allows, rather than run
out of the sidebar. The tests check
that every language has every message, that each parses, and that it keeps the
English one's values and choices.

## Getting data in

**Source** panel → *One file*, *Files*, or *Folder* (recursive), or drop files or
a folder onto the drop zone. Everything selected is merged into **one** dataset:
person and group dictionaries are shared across files, and all files are placed
on a common time origin, so the same player across several exports is one person
with one continuous track.

Columns are auto-mapped on selection and every guess is shown and overridable.
The mapper reads column names, sampled values and (for Parquet) logical types, so
it distinguishes an event timestamp from a whole-day `DATE` and from a session
start, and it recognises a player-versus-AI flag as a usable group column when
nothing is literally called "team".

**Requirements, enforced before a load starts:**

- **At least two of X / Y / Z.** Any pair. The third is optional and is treated
  as 0, drawing the data as a plane inside the 3D scene — which is what a
  top-down map heatmap wants.
- **A time column is optional.** Without one the timeline is disabled outright
  and the view stays in *All* mode; the UI says so rather than showing an empty
  viewport.
- **Person and group columns are optional**, and the modes that need them are
  disabled with a reason when they are absent.

Before reading anything, the panel shows the exact row count (from Parquet
footers), the resident and peak memory the load will need, the GPU cost, and an
estimated duration. If it will not fit it refuses and offers a decimation stride:
heat is an average, so every *N*th row gives the same distribution with more
noise. The budgets it checks against are detected, and detection sets both the
default and the ceiling — see [Resource budgets](#resource-budgets).

Separator for delimited files is sniffed by *consistency* rather than frequency —
the delimiter that yields the same field count on every sampled line — and is
always overridable, including to a character you type.

## The heat modes

**Heat** — every visible row contributes a camera-facing radial ramp, and
overlapping sprites add in the colour channels. Radius, centre intensity, edge
intensity, falloff and the saturation point are all direct shader uniforms, so
dragging them costs nothing.

**Difference** — the same, signed. One population accumulates upward and another
downward; where they overlap evenly the result is zero and fully transparent.
Positive heat uses the warm ramp (transparent → red → yellow → white), negative
the cool one (transparent → green → blue → purple). Both ramps are editable stop
by stop, including alpha.

*Which* two populations is the whole question, so the split is a predicate over
any retained column, not just groups:

- **Group** — assign each group to a side with the `+` / `−` buttons in the Teams
  list.
- **Attribute value** — pick a categorical column and put one value, or a set of
  values, on each side. "This weapon against that one", "died against survived".
- **Attribute range** — pick a numeric column and give each side a range. "The
  first two minutes against the last two."
- **Two different loads** — selecting more than one file retains the file each row
  came from as an ordinary column called `Source file`, so comparing two exports
  is the same control as comparing two values. A single file does not pay for it: a
  constant column costs 4 bytes a row to say nothing.

Difference mode needs two sides, not two groups: on data with fewer than two
groups a load starts on a column split (the file of origin first), so comparing
two loads works on data with no groups at all. Only data with neither leaves the
mode unavailable.

Rows matching neither side are **left out**, not counted as zero. That is what
makes a split over two of many values compare exactly those two, and it composes
with the ordinary filters — filter down to one map, then split that by build.

**Team** — a cube per person, coloured by group (one hue family per group, one
shade per member), with optional look-direction rays and trails. When the
playhead sits between two samples of the same person the position is
interpolated, so playback reads as motion rather than a stroboscope.

**Lines** — line heat: a line from each of a person's samples to their next,
splatted with the same falloff a sprite has, across the line instead of round a
point. It shows where people *went* rather than where they stood: a corridor
run through once is as visible as a room camped in. A line only makes sense
between a beginning and an end, so the **Routes** panel says what bounds one:
the event column, one or more events that **start** a route (spawn, respawn,
deploy), one or more that **end** it (death, extraction, teleport - the line runs
up to the end itself), and optionally which events are **points along** it, for
columns that also hold rows placed elsewhere (a grenade's landing point). Without
an event column a route is a person's whole track in a session. A route never
crosses a session change, a gap the ingest decided has no successor, or a name
worn by several things at once, and the panel shows which of time, person,
session and events the data has. Played back, each person is a point moving
between their samples, drawing the route behind them; with a fixed time window
the tail fades over that window.

Each row keeps the row its segment came from, so segments stay in time order
and the window, the sampler, the filters and the group sign work on them as on
points. Both backends draw a segment from its end row as eighteen vertices -
round caps only where a route begins or ends, so joints do not bead - built on
screen and interpolated linearly there, so the falloff stays centred on the line
however it runs into the depth.

### Shaping the sprite

The ramp inside one sprite is what decides whether a hotspot reads as a tight dot
or a soft cloud, so there are two ways to set it.

**Falloff** is one exponent plus an optional S-curve. Quick to dial in, and the
right choice most of the time.

**Curve** is a piecewise cubic Bézier drawn in the panel: a literal cross-section
of a sprite, with distance from the centre across and intensity up. Double-click
adds a point, alt-click removes one, and the small circles bend each segment.
Presets cover the shapes worth starting from — a flat *Plateau* that reads as a
disc, a *Tight* core with a faint skirt, a *Shelf* that separates a dense core
from its surroundings, and a hollow *Ring* that shows where paths pass rather than
where they stop.

The curve is baked to a 256-entry table and sampled per fragment rather than
evaluated in the shader — solving a Bézier for x needs iteration, which has no
place in the hottest shader in the program. A table fetch is also cheaper than the
`pow()` it replaces, so the curve is not the slower of the two paths. The table is
`r16float`: eight bits shows as banding once a few thousand sprites have summed on
top of each other, and 16-bit half float is filterable in core WebGL2 where 32-bit
needs an extension.

### Exposure

The **saturation point** decides which accumulated density maps to the top of the
colour ramp, and getting it wrong is the difference between a heatmap and a blank
screen. It cannot be derived reliably: an analytic estimate has to assume a
peak-to-mean ratio, and telemetry clusters so hard — a spawn, a chokepoint, a
doorway — that the true ratio varies by an order of magnitude between datasets and
between camera angles on the same dataset. Assuming wrong leaves the interesting
part of the data in the bottom quarter of the ramp, which reads as "the heatmap is
barely there" rather than as a settings problem.

So it is **metered from the field the shader actually produced**: the heat target
is read back, subsampled, and the 98th percentile of the *lit* pixels is placed
near the top of the ramp. Empty pixels are excluded, for the same reason a camera
meter should not average in the black background — most of a heat field is empty,
and including it under-exposes everything. It runs automatically a few frames
after a dataset loads and after the filters change - filtering every position
down to a hundred kills changes the density by orders of magnitude - and on
demand from **Auto-expose from the field**. Metering
an empty field leaves the setting alone rather than driving it to a floor.

Measured effect at 4M synthetic rows: the hottest pixel moved from 54% of the ramp
to 74%, and in the smoke suite deliberately over-setting the saturation and then
metering takes bright pixels from 0.03% of the frame to 4.5%.

If the low-density areas are what you want to see rather than the peaks, that is
what the **log** density response is for — it lifts the bottom of the range, where
`saturating` and `linear` leave a sparse field dim.

### Minimum heat

Every pixel carrying any heat at all is lifted to at least this point on the ramp.
If what you want is to see *where something ever happened* rather than where it was
densest, turn the minimum up and the radius down: single datapoints become clearly
visible instead of sitting a hair above transparent. Leave it off when you are
judging density, since it flattens the bottom of the ramp by design.

Separately, while the camera moves each frame shows one heavily subsampled
estimate — bright, weight-scaled clumps — and when you stop, the field converges to
the truth, which at the same saturation is a smoother, calmer picture. That part is
expected: the moving frame is the noisy one.

### Density response

How accumulated density maps onto the colour ramp:

- **Saturating** (default) approaches the top of the ramp asymptotically, the way
  stacked translucent sprites do. Nothing ever clips to flat white, which makes it
  the safer default on an unfamiliar dataset.
- **Linear** is the only mapping where equal colour means equal count, so it is
  the one to use when comparing two runs or two time windows.
- **Log** compresses a long tail, so a single extreme hotspot stops flattening
  everything else to the bottom of the ramp.

### Distance culling

Near and far bounds, in world units, that restrict the splat to a shell around the
camera. Set a far bound to read density inside a building without the roof and the
far side of the map summing on top of it; set a near bound to fly through a
hotspot rather than into it. Both are evaluated in the vertex shader, so a culled
row costs one vertex invocation and no fragments at all.

## Timeline

Playback of a **cumulative** window *extends* the accumulated field rather than
re-estimating it. The window only grows, so the rows already accumulated are still
visible and the frame need only splat the ones that just became visible — a
fraction of a second of data, so it goes in exactly, at full weight, with nothing
decayed. The field builds up monotonically and pausing changes nothing, because
there is nothing left to arrive.

Re-estimating instead — which is what a sliding window has to do — makes each
frame light up a different random subset at full compensating weight and then fade
it, which reads as bursts flaring and vanishing, and leaves the paused frame still
filling in afterwards. Both are guarded: the suite asserts the accumulated total
climbs monotonically across playback and holds to within 0.02% across 2.5s paused.

Sliding windows (**Window** and **Lifetime**) genuinely change every frame and are
re-estimated as an exponential moving average, unbiased in steady state and much
quieter than starting over.

Two top-level modes, because they answer different questions:

- **All** ignores the playhead entirely and shows every datapoint (minus the
  filters). This is the "where does this happen" view, and it is not the same as
  scrubbing to the end.
- **Play** runs the data as a timelapse, with three notions of history:
  - *Cumulative* — everything from the start up to the playhead.
  - *Window* — a fixed span ending at the playhead.
  - *Lifetime* — each datapoint lives until that person's **next** sample, so
    exactly one position per person is current at any instant. A datapoint whose
    person never appears again — a death, a disconnect, the end of the log — has
    no next sample, so it falls back to a configurable duration rather than
    vanishing instantly or persisting forever. Datapoints **fade out** over the
    tail of their life rather than popping off: with one sample live per person,
    disappearing between one frame and the next makes the whole field flicker at
    the sample rate. The fraction of each life spent fading is adjustable, and
    setting it to zero restores the hard cut.

## Filters

Any retained column can filter the render live: numeric columns by range,
low-cardinality columns by category set. Filters are evaluated per row **in the
vertex shader**, so changing a threshold re-filters the whole dataset on the next
frame — no re-parse, no re-upload, no rebuilt buffer.

Which columns are retained is chosen at ingest time, because they have to be read
then. The auto-mapper keeps a small useful set rather than everything: each
retained column is a decode pass at load and 4 bytes per row in memory, and
auto-selecting all of them turned a 654 MB load from 11.8 s into 223 s.

## Background geometry

- **Map image**, georeferenced by two anchors — a pixel on the image and the
  world coordinate it sits at. Scale and offset follow from the pair, and *Fit to
  data bounds* stretches it across the loaded data as a starting point.
  Desaturated and dimmed by default: the background's job is to let you locate a
  hotspot, not to compete with it.
- **3D level mesh** — `.glb` `.gltf` `.obj` `.stl` `.ply`, simplified on import
  by edge collapse with quadric error metrics (meshoptimizer), so silhouettes and
  hard edges survive decimation. LOD target is selectable.
- **Level library** — processed levels are cached in IndexedDB, so a decimated
  mesh is never rebuilt twice.
- With nothing loaded: a dark scene with a scale-aware grid and coloured axes.

### Ground versus structures

A level mesh is split in two on import, because the ground and the buildings
standing on it want opposite treatments. The ground is a solid surface you read
position against. Buildings sit between the camera and the heat inside them, so
they render as a **transparent wireframe shell** — deduplicated edges plus a
barely-there face pass with a Fresnel rim, which makes a building read as a
volume rather than either a cage or a fog bank. Above 300k structure triangles
the edge overlay starts switched off: at a hundred thousand objects there is an
edge in every pixel and the whole district reads as flat white.

Structures are also **flat-shaded, from derivatives**. This is not a stylistic
choice, it is the only correct answer available. An exported level is welded and
carries no normals, so the normal the viewer derives at a box corner is the
average of the three faces meeting there and points along the diagonal — every
corner of every box comes out rounded, and a city of boxes reads as a heap of
melted foil. The obvious fix, splitting every shared vertex so each face can
carry its own normal, quadruples a level's vertex buffer - on a large level,
well over a hundred megabytes more. `cross(dFdx(world),
dFdy(world))` in the fragment shader is the same answer for nothing, and the
precision holds up easily — a level a few kilometres across spans about
±200,000cm, where a float32 step is 0.016cm, against 0.8cm for one pixel of a wall ten metres away. The ground is
left smooth: it is a sampled height grid, and faceting it would show the
sampling rather than the hill.

### Textured levels

A `.glb` whose parts carry base-colour textures is drawn in them — an extracted
Forza course carries one per terrain tile (25 cm a pixel) and one per placed
model. Every texture is packed into one atlas in the import worker, so the level
stays one draw, one sampler and one UV attribute in both backends. The atlas is
packed in shelves at each image's own size and shrinks only if it would not fit
8192 pixels either way; a grid of equal cells, which it used to be, cut the
ground's two 2048-pixel tiles to 800 pixels to make room for eighty small
barrier textures. Each cell has a 16-pixel gutter, and only the mip levels that
gutter protects are generated, so a distant billboard never samples its
neighbour's tyre tread.

A texture that repeats across its surface - a brick wall whose UV runs 0 to 40,
as the Battlefield 6 export writes it - cannot be wrapped by the atlas sampler,
which would wrap at the edge of the whole atlas. Such an image becomes a tile:
its vertices keep their own UVs and a tile number, and both backends' shaders
wrap the UV into the tile's rectangle per pixel (`rect.xy + fract(uv) *
rect.zw`), with the mip level taken from the unwrapped UV, in the colour and the
depth passes alike, so cut-out foliage stays cut out. A tile's gutter holds its
own opposite edge, so the seam where the UV wraps does not show.

Where the structures themselves are textured — kerbs, guardrails, tyre walls,
signs — they start **solid, in their own textures**, instead of as the tinted
shell: on a racetrack they are the edges of the road, not buildings to look
inside. *Structure texture* in the level panel switches back to the shell. A
textured structure is lit from the side the camera sees, because a sign is two
faces back to back and which one wins the depth test is down to rounding.

### Depth, relief and the slice

Three things make a level do its job rather than just be present:

**Datapoints behind geometry are dimmed, once per surface.** Without it the heat
is a flat overlay — everything the dataset contains glows through every wall at
full strength, the depth cues the level provides are cancelled out, and a hotspot
inside a warehouse looks identical to one on its roof.

Per surface, not per wall/no-wall, and that distinction is the feature. A single
depth comparison can only answer "is anything in front of this point", so a point
behind one wall and a point four rooms into a building dim identically and the
whole interior reads as one uniform faint smear — which loses exactly what a
heatmap of a building is for: which corridor, which floor. So the structure
geometry is depth-peeled into `HEAT_DEPTH_LAYERS` further layers, the splat
counts how many it is behind, and the dimming compounds.

Two different factors, because one compounded cannot do the job. The slider sets
what the *first* surface costs; each surface after it costs a gentler fixed
factor. Calibrated so a single wall leaves a few per cent — the look that reads as
"behind something" — a few per cent compounded would be nothing by the third
wall, and every interior would collapse to the floor with the wall count no longer
meaning anything. Measured on `tools/probe-layers.mjs`, at strength 0.5:
1.000 / 0.250 / 0.125 / 0.063 for zero to three walls.

And a floor: occluded heat never reaches zero unless the slider is pinned to
exactly 1.0. Hiding it outright means an empty room and a room full of hidden
traffic look identical, and nothing on screen suggests reaching for the slice tool
that would show you.

Three things had to be fixed before any of this worked at all, and each looked
like a different bug. Structures are drawn translucent, so they draw with depth
writes off — which left them out of the depth texture entirely, so for a long time
*nothing was ever occluded by a building* and the feature appeared to work only
because it was tested against terrain. The probe that tested it used a ground
wall, which is why. And the slider was linear, which on a saturated field removed
7% of the heat behind a wall at 0.5 and 19% at 0.8.

The comparison is per fragment against the scene's depth texture, and in **window
depth** rather than world distance. Both details were arrived at the hard way. A
vertex-stage fetch of a depth texture returns far everywhere on some drivers —
ANGLE's software rasteriser among them — so a per-point test silently did
nothing. And linearising both depths into metres cannot work with an ordinary
near/far pair: at 0.1 and 24000, a wall at 2000 units and a point at 3000 differ
by 1.5e-5 in window depth, and expanding that back out through the projection
turned a thousand units of separation into nineteen. Window space keeps the
difference small but exact, which is how the hardware depth test manages it. The
bias is one sprite radius converted into window units through dz/ddistance, plus
a few least-significant bits, so a datapoint resting on a surface does not shadow
itself.

**The ground shows its relief.** Terrain normals nearly all point up, so a key
light alone gives a whole landscape one flat grey and a valley reads like a
plateau. Three cues, each answering a different failure: slope darkening, which
works at any camera angle unlike a light that flattens whenever you face it;
contour lines, drawn in screen space so they stay a pixel wide at any zoom, and
the only cue that survives ground too shallow to shade at all; and a faint
elevation ramp for large-scale shape. The contour interval comes from the level's
own height range rounded to a 1/2/5 step, because 10m lines are right for a
hillside and useless on a quarry floor.

**A slice cuts through it.** The counterpart to occlusion: once the level
correctly hides what is behind it, the inside of a building is hidden too, and
that is often where the interesting heat is. One axis-aligned slab cuts geometry
and datapoints together — slicing only the level would leave heat floating where
its building used to be.

`tools/probe-occlusion.mjs` measures all three on geometry built for the purpose:
a wall a known distance in front of a known blob of data, half behind it and half
beside it. The real map is a bad instrument here, because a datapoint standing on
terrain is a metre above it and therefore only a metre *behind* it when seen from
below — the same margin as one standing on the ground seen from above, which must
not be suppressed.

The split between ground and structures is decided per part, from two signals:

- **The name the exporter gave it.** `Terrain`, `Landscape_02`, `ground_mesh`
  versus `House_03`, `Wall_North`, `crate_small`. Strongest signal when present,
  and OBJ `o`/`g` blocks and glTF node names are both preserved for it.
- **Geometry**, when names say nothing. Terrain is a few very large,
  mostly-upward-facing polygons covering most of the map; a building is many
  small polygons over a small footprint with vertical faces. The up-facing ratio
  is area-weighted, because counting triangles would call a house flat as soon as
  it has a roof.

An ambiguous part defaults to ground — a near-invisible wireframe default would
make the level look like a rendering failure. The panel lists every part with the
reason it was classified as it was. The two groups get separate LOD budgets
(structures take the larger share, since they lose their shape fastest under
decimation), and edges are deduplicated so a closed mesh yields one line per edge
rather than two.

## Race analysis

The **Race analysis** tab, beside **Heatmap** at the top of the sidebar, compares
two or more laps of one course: where one loses time to another, why, and what
to do about it. It shares the canvas, the camera and the course with the heat
viewer and nothing else.

**Getting laps in.** *Load lap files…*, *Folder…*, or drop files or folders on
the view:

| File | From | Carries |
|---|---|---|
| FH Companion lap `.json` | FH Companion's library, `%LOCALAPPDATA%/FHCompanion/laps` | position, speed, pedals, steering, g, gear, every ~5 m |
| FH Companion `.json.tele.gz` | beside each lap file; load both together and they are paired by name | Forza's whole Data Out for the lap: per wheel slip, suspension, surface; the car-frame velocity; the game's 64 Hz (repeated packets dropped) |
| `heat3d-lap` `.json` | `heat3d_capture telemetry --game ...` - Forza Horizon and Motorsport over Data Out, AC / ACC / AC EVO / AC Rally from their shared memory, EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 and Richard Burns Rally over UDP, BeamNG.drive through its protocol mod | everything the game sends, per wheel included |
| iRacing `.ibt` | iRacing's own telemetry files (Alt+L in the car) | everything the sim logs, 60 Hz; positions from its GPS channels |
| lap `.csv` | `heat3d_capture laps`, the Trackmania plugin, or any CSV with `x`, `z`, `time`/`elapsed` and a `lap` column | whatever columns it has |

How to record each game, and what each sends, is in
[`docs/other-games.md`](docs/other-games.md).

A folder holding laps of several courses - the whole lap library - offers
each course to load on its own: laps are compared one course at a time.

**Which car.** A lap is called by its car's whole name, as the game gives it.
Newer FH Companion lap files carry it; older ones only number the car, but FH
Companion's library names it in the folder the lap is in -
`<course>/<class>/<name> '<yy> (car<number>)/...` - so *Folder…* (a car's
folder, a course's, or the whole library) or a dropped folder names those laps
too. Once one lap has named a car, every lap of that car is called so, the
next time as well.

*Demo laps* loads three made-up laps of a made-up circuit - a clean one, one
with planted mistakes, one in a car with more power and less grip - to see what
the tab does before recording anything. Load a course model the usual way
(**Background / level**); without one, a road as wide as the laps spread is
drawn so the lines have something to sit on.

**Which lap is which.** Every lap gets its own colour, spaced round the colour
wheel exactly as the team heat mode spaces its groups, with alternating
lightness so neighbours stay apart for colour-blind eyes too (validated for two
to eight laps). The fastest complete lap is the reference everything is
compared against; ★ makes another lap the reference. Click a lap to see its
analysis - the reference too, against whichever lap was quickest through each
corner.

**Where to improve** judges every corner whole, from its braking zone to the
next one's, so a lap that brakes earlier to get the car turned and on the power
sooner is credited with the exit it bought, not told to brake later. Each corner
says who came out ahead and by how much, how the lead moved inside it (up to the
apex and after it), and why - braking early or gently, locking up, lifting where
the other stayed flat, coasting, a tighter radius or grip left unused through
the middle (split by `v² = a·R`), a late or hesitant throttle, running wide,
speed scrubbed at full throttle, a lift on the straight - naming both laps in
every sentence. Where a lap is quicker, it says what the other did wrong; where
two laps are level by different ways through, it says so. When the laps are in
different cars, what the cars' own grip, brakes and pull explain is taken out as
the car's, from what each car has shown across all its loaded laps. Every finding
ends with the line that suits the lap's car at that corner - a "V" or a "U",
where to apex - from what the corner leads onto and the car's measured
power-to-grip, downforce and drivetrain, and whether the lap drove it. Clicking a
finding lines the cars up just before it, replays it, and opens the
measurements: brake points, slowest points, full throttle, turn-in, radii, how
far inside or outside each car ran. **Corner by corner** lists the quickest lap
through each corner and the shape of its line, and the best corners put
together. **Cars compared** sets out each car's grip, braking and acceleration.
**Cars compared** says what kind of car each is from its laps - the grip it
holds for half a second, its pull at each speed, where it tops out on a
straight, its braking, how often its rear had to be caught - and, between two
cars, a sentence on each ("accelerates better, but cannot turn as hard and
loses the rear more easily") and how to drive each. In **Where to improve**,
each corner then says what of it the cars decide: the speed this car's grip
allows on the other's line (when it carried that, the gap is the car, and no
braking point changes it), a rear that let go, the other's pull and top speed
down the straight after - and where this car can win the time back instead.
The method and its sources are in [`docs/race-analytics.md`](docs/race-analytics.md).

**Course statistics.** Load a course's whole folder - dozens of laps, several
cars and classes - and every lap is judged against the fastest lap of its own
performance class, then counted: which mistakes are made where, and by how many
of the laps. "12 of 40 laps braked too early into T3, in 9 different cars -
about 0.21 s each", the laps listed worst first, each a click
from its replay; over the course, each kind of mistake with how many laps made
it and where most; for every class or some. The **Mistake map** paints along
the track how many laps made a mistake at each metre, with each corner's most
common one on the track, and **Show in the heatmap** puts every lap's mistakes
into the heatmap, grouped by kind, with the class and the corner to filter on.
Past eight laps only the ones looked at are drawn; *Show all* draws the rest.

**Car control** reads how each lap handled the car: locked wheels, wheelspin,
the rear stepping out, spins, the front pushing wide, ABS and traction control
acting, the handbrake, time in the air - and hits and crashes, from a jolt no
tyre can make or speed gone faster than any brake takes it, each marked in the
view with a burst (red a crash, amber a hit) and replayed with a click. Where grip ends is measured per car from
its own laps - the slip past which its braking, drive and cornering force fall
away - rather than taken from a book, because every game scales slip its own
way. Tarmac and loose ground are kept apart (Forza's surface rumble, Trackmania's
wheel materials, a rally stage), so a slide that is simply how a gravel corner
is driven is not called a mistake. Each event is laid against the other lap:
one both made is technique, one only this lap made is a fault when it cost time,
and the costliest becomes the corner's cause, with where, how far past the
limit against the other lap, and what to do instead. Laps without slip channels
are read from what they have. iRacing's carry the car's heading (`Yaw`), so
their drift angle - heading against the direction of travel - finds slides and
spins, and the steering against the path finds pushes. FH Companion lap files
without their telemetry have neither slip nor heading: pushes from the steering
and hits and crashes are still found, and the section says so (and that the
`.tele.gz` beside each lap adds the rest). The yaw rate against the lateral
acceleration stands in for the drift angle only on a lap that has a yaw rate but
no heading fitting its path. The hint under the table says what each lap could
be judged with.

**Rally.** On gravel and snow the analysis judges a corner the way it is
driven there: the car turned on the way in, not steered round. A stage run
that turned the car clearly less than the other and waited for the power is
told to turn it in with a lift or the left-foot brake (or the other run's
handbrake point); one that turned it too far, that it had to be straightened
first. A dab of the left foot with the power on is not taken for a braking
point, a longer flight over a crest is named as such, and what the car can do
is measured on the ground, apart for tarmac and gravel. A stage's surface comes
from the lap, the rally's name, or how the car was driven on it. See section 11
of [`docs/race-analytics.md`](docs/race-analytics.md).

**Mirrored worlds.** Forza keeps a left-handed world, so its courses and laps
come out mirrored in this right-handed viewer - a right-hand bend drawn as a
left-hand one. The laps' own steering and suspension give it away, and the race
tab offers *Invert X*; **Camera & scene → Invert world axis** reverses X, Y or Z
for any data. Only the drawing changes: the data, the analysis and every
coordinate shown stay the game's own.

**The two maps**, painted along the track and as strips above the charts:
*Time map*, red where the focused lap loses time and green where it gains;
*Cause map*, each loss drawn where its cause is, coloured by what caused it.

**Replay.** *From the line* runs every lap from its own start, the gap growing
as it did. *Lined up* puts every car on the same spot at the same moment and
lets them go - *Line up here*, or Shift+click a chart - so a difference is seen
from that point on, not from the start of the lap. *Side by side* holds every
car at the reference's distance, to compare speeds and inputs metre by metre.
⌖ chases a car with the camera. K plays and pauses, Home rewinds.

**The cars** are simplified open-wheelers in their lap's colour, so nothing
hides the wheels: round wheels, the front ones turned by the steering, each on
its wishbones, upright and pushrod; the body sinks, pitches and rolls on the
four corners' suspension travel, so the arms move as the car brakes, turns and
lands. Tyres are coloured by temperature (blue cold, green working, red hot), a
ring on the ground shows each tyre's slip (amber at the limit, red past it),
each pushrod is coloured by its travel, brake lights light with the brake, and a
brake glow shows where the game reports brake temperature. A lap that
does not carry a channel simply does not draw it, and a game with more
telemetry draws more - the channel table in `src/race/schema.ts` says how each
is shown. **Car size** scales them up for whole-circuit views.

**The driver's inputs** are on each car's card, top left: a steering wheel
turned as far as the steering input, a bar per pedal - throttle, brake, and the
clutch where the lap records it - the handbrake lighting when pulled, the gear,
and under them a trace of the last six seconds of throttle, brake and steering,
ending at this moment: what the driver did on the way into it. The card also
shows speed, the lap time, the distance, the live gap, and the car from above.

**The charts** below the view put every lap on one distance axis: gap to the
reference, speed, then the inputs - throttle, brake, clutch and handbrake (when
any lap uses them), steering, gear - with corner bands and each car's position
marked on the speed and input rows. **Hover** over them and every car, its
card and its inputs move to that metre of the lap, with a marker on the track
and a table of every lap's values; move away and the replay takes over again.
The **wheel** steps the replay along the lap (Shift for bigger steps),
**Ctrl+wheel** zooms the distance axis about the pointer and a sideways wheel
pans it (double-click or *Whole lap* to zoom out), a click jumps the replay
there, and Shift+click lines the cars up there.

**More telemetry shows more, without code changes.** Every view reads one
table, `CHANNELS` in [`src/race/schema.ts`](src/race/schema.ts), which says for
each channel how it is labelled, in which units it is read, which group it
belongs to, and how it is drawn:

- **Graphs.** *Graphs* above the charts offers every channel the loaded laps
  carry, grouped, a checkbox each - a per-wheel channel a chip per wheel. The
  default set is the gap and every channel marked `graph` that a lap uses.
- **Inputs.** Every channel with an `input` kind is drawn on the cards: a
  `pedal` as a bar in its colour (and a line in the input trace), `steering` as
  the wheel, `gear`, a `lamp` that lights while an aid acts or a switch is on
  (ABS, traction control, DRS, pit limiter, handbrake), a `level` as a readout
  (brake bias, boost, fuel, the aid settings).
- **The car.** Every per-wheel channel with a `glyph` is drawn on its wheel -
  `tyreColour`, `slipRing`, `suspensionBar`, `brakeGlow`, `wearBand`,
  `loadBar` - on the 3D car and on the card's car from above, and every lit
  `lamp` lights on the car's roof in its colour.
- **Everything else.** ⋯ on a card (or *All values on the cards*) lists every
  other value the lap carries at that moment.

A channel that is not in the table is still read, graphed and listed, labelled
from its own name (`brakeLinePress` becomes "Brake line press"); iRacing's
`.ibt` reader passes through every channel it does not map, so all of them are
there. To give a new channel a proper name, unit and drawing, add one line to
the table. A new *kind* of wheel drawing is one entry in `WHEEL_GLYPHS`
(glyph.ts) and its flat twin `CARD_GLYPHS` (RaceHud.tsx); both are typed by the
kind, so the build fails until both exist. `src/race/extensible.test.ts` checks
that unknown channels reach the graphs, that every glyph in the table can be
drawn and that lamps light.

The method, the research behind it and every rule's threshold are in
[`docs/race-analytics.md`](docs/race-analytics.md).

What is in place for iRacing, the Assetto Corsa games and Forza Motorsport,
and the plan for extracting their courses, is in
[`docs/other-games.md`](docs/other-games.md).

## Match analysis (Counter-Strike 2)

The **Match** tab is the scoreboard and round-by-round view of CS2 matches,
over the heatmap of the same matches. The data comes from the extractors'
demo converter (`python -m heat3d_cs2 demos <folder> -o out`, see
`exporters/cs2/README.md`): each match is a `.parquet` table, loaded in the
**Heatmap** tab like any other - every player's position eight times a
second and every kill, death, hit, shot, grenade and plant where it
happened - and a `.match.json` summary, loaded in the Match tab. The
table's footer says how to read it, so it opens with the player as the
person, the side as the group, each round as a session, the look direction
on, and the world the right way round (CS2's world is right-handed; read as
the default Z-up mapping it comes out mirrored). `heat3d_cs2 map de_mirage`
exports the map the players stand on, in the same frame.

For one match: the score, the halves and any overtime (MR12: rounds 1-12, 13-24, then
overtime on its own), a strip of rounds (who won and how -
elimination, bomb, defuse, time), and for a round its economy (each side's
equipment value and buy), the plant, the kill feed with openings, trades,
headshots, wallbangs and kills through smoke, clutches and who survived. The
scoreboard has kills, deaths, assists, ADR, KAST, headshots, opening duels
and clutches. Across every loaded match: how often each side won - overall,
on pistol rounds, on eco, force and full buys - plants per site and how
often the Ts converted them, where the opening duels happen and who wins
them, and every player over all their matches.

Everything links to the heatmap through its own filters, so it stays visible
and editable in the Filters panel: a round, a player's kills and deaths, the
smokes, flashes, molotovs, plants or openings of a match, a round or all of
them. **Replay round** plays it back as boxes from its start. The
conventions behind the numbers (a trade within 5 s, KAST, the buy types) are
the converter's and travel in each summary.

## Measuring

The **Measure** panel turns on a ruler: left-click drops a point, right-click
removes the last. It reports the last segment, the path total, the straight-line
distance and the ground-only distance, plus the accumulated heat under the
cursor — the same value the colour ramp is fed, so the number matches the colour.
Points land on the ground plane (the map's elevation when one is loaded), so it
measures across the map rather than along a line through it.

## Camera

Free-fly, with a **parallel** projection alongside the usual perspective one, and
a set of preset views.

**Isometric** — four corners (NE / NW / SE / SW), each a parallel projection at
35.264°, which is `atan(1/√2)`: the angle at which all three world axes project
to the same length, so a measurement along one is comparable to one along another.
Any other angle is axonometric — it looks similar and quietly isn't. Four corners
because a single one always hides half the map behind whatever is nearer.

**Elevations** — Top, Bottom, Front, Back, Left, Right, also parallel. These
switch projection on their own rather than leaving it to you to notice: under
perspective a "top view" still converges toward a vanishing point, so equal areas
stop reading as equal and the view no longer answers the question it exists to
answer.

**Switching projection keeps the subject the same size.** Parallel projection has
no field of view, so its frustum height is unrelated to how far away the camera
is; flipping between them naively either zooms wildly or shows nothing. The switch
solves for the other projection's parameter — the parallel height a perspective
camera covers at the focus distance, and back again. Leaving perspective also
remembers the pose, so **Back to perspective** lands where you left rather than
wherever the parallel view wandered to.

**Field of view** is adjustable from 10° to 140°, with named stops. Narrow
flattens perspective and reads more like a parallel projection; wide exaggerates
depth and makes distance hard to judge. It stays live in parallel mode too, since
it sets the scale the switch back solves for and the distance **Frame** uses.

**Depth of field** is available and off by default — it is a presentation effect,
and the default view should show the data rather than an interpretation of it. It
applies to the level, grid and cubes and *not* to the heat: heat at a pixel is the
sum of sprites at many different depths, so it has no single depth to be out of
focus at, and blurring it by whatever geometry happens to sit behind it would be
wrong wherever it floats in front. Sharp data over softened context is also the
more useful of the two. Focus follows whatever was last framed, or a manual
distance; aperture is expressed as a fraction of the focus distance rather than an
f-number, because these scenes span anything from a room to an eight-kilometre map
and an absolute aperture would need retuning for every dataset. Implementation is
a 24-tap golden-angle gather weighted so a sharp foreground is not smeared outward
by the blurry background behind it.

Free-fly by default, with **orthographic** as an alternative. Orthographic matters
for map work specifically: under perspective, two hotspots of equal density look
different sizes depending on where they sit in the frame, which is exactly the
comparison the view exists to support. Preset viewpoints (Top / Front / Side /
Iso) point the camera and frame the data in one step, and the pose can be typed in
or copied — flying is how you explore, coordinates are how you reproduce a view.

| | |
|---|---|
| `W` `A` `S` `D` | fly |
| `Space` / `Q` | up / down |
| drag | look |
| wheel | fly speed (frustum zoom in orthographic) |
| `Shift` / `Alt` | boost 6× / slow to 15% |
| `F` | frame the data |
| `K` | play / pause |
| `1` … `5` | Heat / Difference / Team heat / Box replay / Lines (a mode the data cannot show is skipped) |

### Gamepad

XInput pads work, along with anything else the browser maps to the standard
layout. The Gamepad API is poll-only, so the pad is read once per frame from the
render loop and its input adds to the keyboard's rather than replacing it — both
can be used at once.

| | |
|---|---|
| left stick | move |
| right stick | look |
| `LT` / `RT` | down / up (frustum zoom in orthographic) |
| `RB` / `LB` | boost 6× / slow to 15% |
| `A` | sprint 3× |
| `Y` | frame the data |

Look speed, deadzone and the stick response curve are adjustable, and the sticks
can be swapped. The deadzone is **radial**, not per-axis: a per-axis deadzone lets
a diagonal push through on one axis while the other is still suppressed, which
makes the camera drift sideways when you meant to go straight.

**Only standard-layout pads are followed.** The Gamepad API reports every HID
device with axes on it — flight sticks, throttles, pedals, wheels — and those do
not rest at centre: a twist axis or a throttle lever sits at full deflection when
nobody is touching it. Read as a stick, that is a permanent full-speed input no
deadzone can suppress. On the machine this was found on, a VKB Gunfighter and a
VPC MT-50 throttle reported axes 0 and 1 at -1.0 and +1.0 while sitting untouched
on the desk, and the camera yawed continuously and pitched into its +90° clamp
within a second and a half of load. Every heat mode then looked broken too,
because a moving camera resets progressive accumulation every frame.

So a device is followed only when the browser reports `mapping: "standard"`,
which is it saying "this is an XInput-style pad and the axes are where you expect
them". Everything else is listed in the camera panel and marked ignored, and can
be opted into explicitly if you actually want to fly the camera with a HOTAS.

One thing worth knowing rather than debugging: browsers hide a controller until it
has sent its first input, so a plugged-in pad that has not been touched genuinely
does not exist yet as far as the page is concerned. The camera panel says so
instead of silently showing nothing.

Append `?backend=webgl2` or `?backend=webgpu` to force a backend, which separates
"this renders wrong" from "this renders wrong on WebGPU".

## How it stays realtime

The core problem: a sum of overlapping radial ramps costs `N × πr²` blended
fragments per frame. At 100M sprites of 8px radius that is 2×10¹⁰ fragments,
about a second of work on a high-end GPU. It cannot be brute-forced.

**Stochastic progressive accumulation.** Each frame splats a stratified random
subset of the visible rows with weight scaled to compensate, which is
statistically unbiased — the expected heat is exact at any budget. Holding the
view still keeps merging frames until every row has contributed, converging to
the pixel-exact all-rows answer; the *Coverage* readout says how far along that
is, so a noisy frame is never mistaken for the finished picture. While the
playhead moves, frames combine as an exponential moving average instead, which is
unbiased in steady state and far quieter than re-estimating from scratch.

Frames merge as a **running mean** — scale the buffer by `1 - 1/n`, add `1/n` of a
fresh estimate — rather than as a sum divided by the frame count at the end. The
two are algebraically identical and the second is a frame cheaper, but the heat
target is `r16float` wherever float32 blending is unavailable, and a sum reaches
*n* times the field and saturates at 65504. Once it does, a divisor that keeps
growing makes the picture fade the longer the view sits still — while a moving
camera, which resets every frame, looks perfectly correct. The running mean keeps
the buffer at one field's worth however many frames are merged, and the smoke
suite asserts exactly that: 16 merged frames store **1.00×** what a single frame
does.

### Half-float accumulation

Worth its own section, because it is where the arithmetic gets genuinely hostile
and everything above is only correct if these two things are also handled.

A device without float32 blending gets an `r16float` accumulation target: **65504
maximum, 11 bits of mantissa**. A dense field reaches several hundred thousand, so
that target both clips and rounds. The rounding error scales with the accumulated
value, which is why it presents so specifically — the densest areas read far
cooler than they are while sparse areas look fine.

Two mechanisms, both fixed:

- **Range.** Every splat is scaled by a gain, divided back out at composite, so
  the field sits in the magnitude half float handles well. The gain is anchored to
  an analytic estimate of the field's size and quantised to a power of two — and
  deliberately *not* to the saturation point, because saturation is applied at
  composite so that dragging it never restarts convergence. Tie the gain to it and
  the buffer holds values written at the old gain while the composite divides by
  the new one; the two errors cancel exactly and the slider appears to do nothing.
- **Precision.** A fractional frame is rendered into a scratch target and blended
  in afterwards, rather than splatted into the accumulator at `1/n` weight.
  Splatting directly makes each sprite's contribution `1/n` of a running total it
  is being added to, and half float rounds those away — worse the denser the pixel.
  Accumulating a frame from zero keeps every addend comparable to the total it is
  joining, which is the same arithmetic a single unaccumulated frame already does.

Measured on the same scene, before and after, reading the field in matched units:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| f32 (reference) | 6051 | 60742 | 121199 | 232744 |
| f16 before | 1372 | 6972 | 7840 | 7840 |
| f16 after | 5996 | 59666 | 118824 | 210357 |

The peak went from **30× low to 0.90×**, and the composited frame now matches f32
to 0.1% of mean luma. `?heat=f16` forces this path on either backend — without a
way to select it, the arithmetic that only weaker GPUs run would only ever be
tested by the people running it. `npm run smoke:f16` runs the whole suite there.

**An idle frame still recomposites.** Once converged the frame skips the scene and
the sprite splatting, but never the final composite. Trusting the canvas to keep
showing the last frame is not safe: a WebGL drawing buffer created without
`preserveDrawingBuffer` has undefined contents after compositing, so it survives on
some drivers and drains on others. The scene and heat targets are our own
framebuffers and do retain, so an idle frame is one fullscreen pass.

**Two-stage throttle.** Stage one tunes sprites-per-frame to hold the target
framerate, trading noise for time. But sprite count is not the only cost — a
large radius makes each sprite cover thousands of pixels — so stage two drops the
heat buffer's resolution, which cuts fragment work quadratically and is nearly
invisible under a smooth ramp. Stage two only engages once stage one has nothing
left to give. Measured effect, on software rendering with 10M rows and
deliberately oversized sprites: **141 ms → 17 ms per frame.**

**Time-sorted rows.** Rows are stored ascending in time, so a timeline window is
two binary searches rather than a scan. Advancing the playhead moves two integers
and touches no row, which is why playback cost tracks the event rate rather than
the dataset size.

**Nothing per-row on the CPU per frame.** Rows live in quantised GPU textures
(8 bytes for position and group, 4 more for time and lifetime) and are reached
from `gl_VertexID` through a per-frame block index. Filters, group weights, the
lifetime test and the window test are all shader-side. The per-person track
cursor keeps `O(persons)` state and rides the global time order, rather than
keeping a person→rows index that would cost 4 bytes per row — 1.6 GB on a 400M
row dataset — to answer a question about a few hundred people.

**Enforced budgets.** WebGL accepts allocations it cannot service and then either
loses the context or falls back to system memory at ruinous cost, so the GPU
budget is enforced at upload: chunks that do not fit are not uploaded, a partial
chunk is taken rather than nothing, and the shortfall is reported in the overlay
as *Not resident*. A truncated dataset that looks complete is the worst failure
an analysis tool can have.

## Layout

```
src/
  data/          ingest, validation, memory budgeting, model parsing
    csv.ts             byte-level scanner; parses only mapped columns
    ingest.ts          CSV -> SourceBlock
    ingestParquet.ts   Parquet -> SourceBlock, via column chunks
    builder.ts         merges blocks into one time-sorted Dataset
    ingestFiles.ts     the multi-file path, testable outside the worker
    automap.ts         column-mapping heuristics
    validate.ts        capability checks and their explanations
    memory.ts          footprint model, budgets, fit verdicts
    sort.ts            radix sort by time
    modelParse.ts      GLB/OBJ/STL/PLY geometry, with named parts
    classify.ts        ground-versus-structure split and wireframe building
    simplify.ts        meshoptimizer decimation
    levelLibrary.ts    IndexedDB cache of processed levels
  render/
    engine.ts          the frame loop; owns everything frame-rate-paced
    sampling.ts        stratified sampler and the two-stage budget controller
    createRenderer.ts  backend selection, WebGPU with a WebGL2 fallback
    webgl2/            backend: GLSL shaders, renderer, GL helpers
    webgpu/            backend: WGSL shaders, renderer
    camera.ts          free-fly camera, perspective and orthographic
    gamepad.ts         XInput reading, deadzone and response shaping
    half.ts            binary16 encode/decode, needed by both backends
    level.ts           map georeferencing and structure appearance
    measure.ts         ruler and probe
  race/          the race tab: lap formats, alignment, analysis, replay, cars
    schema.ts          the channel table: names, units, groups, and how each is drawn
    graphs.ts          which graphs the charts show, from the channel table
    adapters.ts        FH Companion, heat3d-lap and CSV laps in
    ibt.ts             iRacing .ibt telemetry in
    align.ts           every lap on the reference's distance axis
    segments.ts        corners on the reference
    envelope.ts        what a car has shown it can do
    profile.ts         what kind of car it is, in numbers and in words
    impacts.ts         hits and crashes, from the lap's own samples
    stats.ts           many laps: which mistakes, where, in how many of them
    carNames.ts        car names from the lap library's folders, and remembered
    derive.ts          what a game does not send: slip from wheel speeds, drift angle, in the air
    control.ts         car control: tyre curves per car and ground, locks, wheelspin, slides
    line.ts            the driven line through a corner, and which line suits a car
    handedness.ts      whether a game's world comes out mirrored here
    analysis.ts        each corner judged whole: time account, causes, car against car, the maps
    replay.ts          each car's state at a moment; the three replay modes
    glyph.ts           the simplified car
    shapes.ts          round shapes for it: lofted bodies, wheels, rods
    scene.ts           the race tab's geometry, per frame
    synthetic.ts       a vehicle model on a demo circuit, for tests and demo laps
  i18n/          the viewer in 40 languages
    index.ts           t(), numbers and lists the language's way, the language picked
    message.ts         the ICU message syntax: values, plurals, choices
    languages.ts       the languages, and which a browser asks for
    locales/           a catalog per language and part of the viewer
  state/
    store.ts           zustand store, kept out of the render path
    raceStore.ts       the race tab's state, and its replay clock
    curve.ts           the editable sprite ramp: Bézier eval and LUT bake
  ui/                panels; nothing in the hot path
tools/
  smoke.mjs           headless browser test, both backends
  inspect-parquet.mjs schema/row dump for a Parquet file
  inspect-distinct.mjs distinct counts per column: group or id?
  probe-webgpu.mjs    find a headless config with a WebGPU adapter
  probe-present.mjs   find one that actually presents a canvas
  probe-input.mjs     what the browser reports for a drag and a wheel
  probe-fade.mjs      a still camera in every mode, watching for drift
  probe-fade-playback.mjs  the same with the timeline running
  probe-retain.mjs    whether an idle canvas keeps what was drawn
  probe-readback.mjs  hammers probeHeat/readHeatField/captureFrame for stability
  probe-modifiers.mjs Shift/Alt fly factors, with the held keys and frame counts
  probe-level.mjs     loads an exported level with real telemetry on it
  probe-occlusion.mjs depth occlusion, the slice and ground relief, measured
  probe-depth.mjs     the same three on the real exported map
  probe-layers.mjs    walls in a row: does occlusion count them or notice them
  probe-hotspot.mjs   where the real telemetry is densest, in world coordinates
  shot-level.mjs      photographs an export close enough to see whether a
                      house is a house — the report cannot tell you that
  shot-hotspot.mjs    triangles and pictures *where the data is*, which is a
                      different place from where the structures are densest
  shot-race.mjs       the race tab with the demo laps, on either backend
exporters/           the tools: each a public MIT repository and a git submodule
  unreal/            drop-in Unreal plugin: level -> .glb, from the editor
  gamecapture/       level reconstructed from gameplay video, from outside;
                     lap telemetry recorders for every supported game
  gamefiles/         level read out of a shipped game's own archives
  cs2/               CS2 demos into heatmap tables and match summaries
  watcher/           records play in the background from what games publish
datasources/
  csdemo/            CS2 match share codes and match history (private)
  convert-media.mjs   AVIF/video to PNG, for reading reference material
```

The tools are separate, public projects, each under its own MIT licence (see
the table above); the viewer is not. `LICENSES.md` is the
authority on which applies where.

## Testing

```bash
npm test              # 676 unit + integration checks (12 more skip without the local data)
npm run test:heavy    # adds the full-size 4-file, 14.4M-row load
npm run bench         # ingest benchmark -> tools/.smoke/ingest-bench.json
npm run smoke         # headless browser, 97 checks (WebGL2)
node tools/smoke.mjs "http://127.0.0.1:5273/?backend=webgpu"   # same 97 on WebGPU
npm run smoke:f16     # the whole suite on the half-float accumulation path
```

Both backends pass the whole smoke suite. The difference-split checks once
disagreed: WebGPU clamped a category id past the end of the sign table onto its
last entry and so handed it a side, where WebGL2 rejected it. Both now reject it,
and keep the group table and the split's table side by side, so *a value on
neither side is left out entirely* passes on either. The smoke suite needs the
dev server running (`npm run dev`, on `127.0.0.1:5273`). Two of its checks skip
when the loaded data has no numeric column to filter or split on.

The smoke suite drives the camera through **real** input — key, mouse and wheel
events dispatched through CDP, plus a synthetic pad injected over
`navigator.getGamepads` — not just the camera's API. That distinction earned its
keep immediately: it caught the camera continuing to steer from bare mouse
movement after a drag ended (pointer lock is released asynchronously, so gating on
the lock instead of on a held button leaves a window where any movement rotates
the view), and the mouse wheel's fly-speed change being overwritten from the store
on the very next frame, which made the documented wheel behaviour a no-op.

The harness aborts if the page restarts under it, rather than reporting the
fallout as test failures. A mid-run reload shows up as `page.evaluate` failing
with *"Execution context was destroyed, most likely because of a navigation"*
followed by several tests failing on `__3dheat` being undefined, which reads
exactly like an intermittent GPU crash. It is usually the dev server: edit a
source file while a run is in flight and HMR reloads the page under it. The abort
message names the cause and quotes what Vite said.

The sprite ramp is verified by measuring rather than by screenshot: one isolated
sprite, locate its centre, then walk outward reading the accumulated field. A
Linear curve must match `falloff = 1` exactly (it does, to 0.0%), and the hollow
*Ring* preset must measure hollow — it comes back at 0.16 of peak against a
designed 0.15, on both backends.

Tests run against the real exports in `TestData/` when present and skip
themselves when absent. They cover the cases synthetic fixtures cannot: Parquet
`TIMESTAMP` columns that decode to `Date`, Z-up centimetre coordinates, datasets
with no team column, several timestamp-typed columns of which only one is a
usable axis, 0-byte and schema-incompatible files in the same tree, and separate
exports merging into one time-ordered dataset.

## The two backends

WebGPU is preferred and WebGL2 is the fallback; a canvas can only hold one context
type, so the choice is made once before any drawing. WebGPU is not chosen for
novelty — rows live in storage buffers, so a row index is an array subscript
rather than a texture coordinate, and where the adapter offers
`float32-blendable` + `float32-filterable` the accumulation buffer is a true
32-bit float blended by fixed-function hardware.

Three things about WebGPU are worth knowing if you touch that backend:

- **`queue.writeBuffer` is queue-ordered, not interleaved with encoding.** Writing
  one uniform buffer per draw and then submitting means *every* draw reads the
  last write. Uniforms therefore go into a ring of 256-byte-aligned slots, one per
  draw, bound by offset. The symptom of getting this wrong is a plausible-looking
  wrong picture, not an error.
- **three.js emits OpenGL-convention projection matrices**, depth in [-1, 1];
  WebGPU clips to [0, 1]. Perspective survives by accident because most of the
  scene lands near z = +1, but orthographic depth is linear and lands almost
  entirely at negative z — the whole frame is clipped away silently. The engine
  premultiplies a depth-remap matrix when the backend is WebGPU.
- **Every attachment in a pass must be the same size.** Once the throttle drops
  the heat buffer below canvas resolution it can no longer share the scene's depth
  texture, so it gets its own.
- **`queue.writeTexture` copies raw bytes with no conversion.** An `r16float`
  texture — the sprite ramp table — has to be handed encoded half-float data, so
  `render/half.ts` does the encoding. Handing it `f32` data instead produces a
  garbage ramp rather than an error.

The heat pass uniform struct is exactly 256 bytes, one `UniformRing` slot. Adding
another `vec4` to it needs the ring's stride raised too; distance culling spends
its far bound in a spare `filterCfg` lane rather than a 17th `vec4` for that
reason.

Readback staging buffers are kept and reused rather than created per call, and a
flag keeps one reader in flight at a time. Auto-exposure reads the whole heat
target, which is megabytes; allocating and destroying that on every metering pass
churns the device for no reason, and a buffer cannot be mapped twice at once.

Headless Chromium renders WebGPU correctly but never composites its canvas, so the
backend exposes `captureFrame()` — the composite is run a second time into an
offscreen target and read back. Without it every WebGPU assertion would be a false
negative. `tools/probe-webgpu.mjs` and `tools/probe-present.mjs` diagnose adapter
and presentation availability if the harness stops working.

## Is it using the graphics card

Both backends ask for the discrete adapter (`powerPreference: 'high-performance'`),
which on a laptop with switchable graphics is what stops the page being handed
the integrated part. Beyond that the page has no say: hardware acceleration is a
browser setting and the driver blocklist is consulted before any page exists.

What it can do is notice. The renderer string is classified, and a browser that
has fallen back to a CPU rasteriser gets a banner saying so at the top of the
sidebar, with the setting to change. That is worth a banner rather than a line in
the diagnostics panel, because software rendering is experienced as *this viewer
is unusably slow with my data* — a symptom that points at the tool, not at a
switch in the browser.

Only a renderer positively identified as software raises it. An unrecognised
adapter says nothing at all: sending someone with a working GPU off to
reconfigure their browser is a worse failure than missing a case.

The resource panel also shows the adapter by its readable name — `NVIDIA GeForce
RTX 5080` rather than the full `ANGLE (NVIDIA, NVIDIA GeForce RTX 5080 (0x00002C02)
Direct3D11 vs_5_0 ps_5_0, D3D11)` blob, which is kept as the tooltip.

## Resource budgets

Under **Performance → Resource budgets**. RAM, GPU memory and parser thread count
are detected, and the detected figure is the default. The RAM and GPU sliders
reach past it to a ceiling, and a value there is marked *above detected*: it is
then the user's figure rather than a measurement, and it is used as set - by the
fit check and by the upload alike. Asking for more memory than the machine has
does not produce more memory; it produces an out-of-memory tab crash partway
through a load that may have been running for minutes, which is what the mark is
there to say.

Being blunt about what detection can actually see, because the numbers look more
authoritative than they are:

- **No browser API reports free memory.** The signals available are total
  installed RAM (which the browser rounds down to a power of two and caps at
  8 GiB for fingerprinting reasons) and this tab's own JS heap ceiling. The
  budget is a conservative share of those, not a measurement.
- **No API reports VRAM at all.** The GPU figure comes from the largest texture
  and buffer the live context admits to, which separates an integrated part from a
  discrete one and nothing finer. It is refined once a backend exists, so the
  first detection — which runs before there is a context to ask — is the pessimistic
  one.
- **Core count is reported directly**, and the default leaves a couple free. An
  ingest that saturates every core stops the page repainting, which reads as a
  hang even while it is making progress. A load of several files parses that many
  at once, each in a worker of its own, and fewer when the RAM budget has no room
  for another; they are merged in selection order either way.

The renderer enforces its own share per frame and reports what did not fit rather
than silently truncating.

## Licensing

The viewer and the extractors are **deliberately separate projects under
separate licences**, and [LICENSES.md](LICENSES.md) records which applies
where. The short version:

- **Viewer** — proprietary, all rights reserved. Every dependency is
  permissive (MIT / Apache-2.0 / BSD), so none restricts selling it.
- **Tools** (`exporters/<tool>/`) — free and open source, each under its own MIT
  licence in its own public repository (see [Running it](#running-it)). Each
  one's own `LICENSES.md` covers the packages and models it uses:
  - **Unreal exporter** — content-only plugin, no third-party dependency of its
    own. For developers, on their own game.
  - **Game capture** — depends on the depth model: the default is Apache-2.0
    and unrestricted, the larger variants are CC-BY-NC-4.0 and non-commercial.
    PySide6 is LGPL-3.0, which is satisfied by ordinary dynamic linking.
  - **Game files** — every dependency permissive; Oodle is found on the
    machine, never bundled.

The extractors' document also records the three routes to a level's geometry — an engine
export, reconstruction from video, and reading a game's own archives — what each
obliges, and why process injection is ruled out in all of them.

## Level exporters

`exporters/unreal/` is a drop-in plugin that writes a decimated, world-space
`.glb` of an Unreal level for this viewer. Content-only — Python, no C++ module —
so it needs no compilation and works in any Unreal 5.x project. Copy
`Heat3DExporter/` into a project's `Plugins/` and it appears under *Tools →
Export level for 3DHeat*; the menu and the command line are the same code, so
they behave identically apart from the settings a command line can name.

The triangle budget is the one setting that decides whether the result is usable,
and the menu has nowhere to put it, so an unset budget is derived from the level's
own size once its descriptors have been read. On a map several kilometres across
that picks 4M and lands the size cut at 6.4m — the same as the hand-tuned command
line.

```powershell
exporters\unreal\run-export.ps1 -Project C:\game\Game.uproject `
  -Map /Game/Maps/L_Example -Out C:\exports\L_Example.glb
```

It does the work the editor is in a position to do and the viewer is not:

- **Decimates with the source geometry available**, per asset, with a triangle
  allowance from each object's world size — a 40m warehouse earns more than a 3m
  crate — then again per spatial tile against the file's budget. An object whose
  allowance is too small to hold a shape gets its bounding box instead of a
  reduction, because twelve honest triangles beat forty spikes.
- **Classifies by what the engine knows.** A landscape is a different class from a
  building, so parts come out named `ground:<map>` and `structure:<map>` and the
  viewer takes a labelled part at its word instead of inferring from names and
  geometry.
- **Drops what is never worth drawing.** Grass, decals, small clutter, lights,
  volumes and markers, by class and by size. Stones and houses survive. On the
  test level this cuts hundreds of thousands of actors down to a small fraction:
  the size filter alone removes most of them, and they were most of the triangles.
- **Never loads the map to filter it.** World Partition descriptors carry class,
  label and world bounds, so a map of many gigabytes is filtered in seconds and
  only the survivors are paged in, a tile at a time.

The ground is *traced* rather than exported: a landscape has no mesh anyone can
ask for, so the exporter samples its collision with a grid of downward rays. That
also makes it engine-agnostic — terrain built from static meshes comes out the
same way.

On the test level — several kilometres across, hundreds of thousands of actor
descriptors, many gigabytes on disk — that is 185 MB in nine minutes, at a budget
it chooses itself: millions of ground triangles from traced rays at cells a few
metres wide, millions more of roads and rock formations routed to the ground
because a cliff drawn as a translucent shell is a glass crystal the size of a
hill, millions of structures, and every water surface — sea, lakes and rivers.

Four parts, not two: `ground:*`, `structure:*` and `water:*`, with roads and rock
in a second `ground:*` part. The split is about how each is *drawn* — the ground
opaque with slope shading and contour lines, water flat with neither since a
contour across a lake is nonsense, structures translucent so the heat inside a
building is visible at all.

The viewer's side of the contract is deliberately small, for the Unity, Godot and
Source exporters that follow: one self-contained `.glb`, float32 `POSITION`,
triangles, node names `ground:*` / `structure:*`, world-space Y-up coordinates in
whatever unit the telemetry uses. `exporters/unreal/README.md` has the details;
`src/data/levelExport.test.ts` checks a real export against the real parser,
`tools/probe-level.mjs` loads one into the viewer with real telemetry and reports
how much of the data's footprint falls inside the level, and
`tools/shot-level.mjs` photographs it — which is the one that has found every
real problem, none of which was visible in the report.

A map that size also resizes the frustum. The near and far planes are calibrated
from the *dataset*, and an imported level is routinely larger than the data on
it: framing several kilometres at a 65° field of view puts the camera hundreds of
thousands of units back, against a 40k default far plane, so the whole level renders behind it and the viewport is
simply empty with nothing on screen to say why. Loading a model level widens the
frustum to hold it — never narrows it — and moves the near plane with the far one,
because it is the ratio that sets the depth precision the heat occlusion test
depends on.

### Reconstructing a level from gameplay

> **Separate project, separate obligations.** See [exporters/unreal/LICENSES.md](exporters/unreal/LICENSES.md).
> The Unreal exporter above is for developers with the project open and is
> unrestricted; this one is for people who have only what the screen shows, and
> what it may be used for depends on which depth model is chosen.


`exporters/gamecapture/` is the other kind of exporter: for maps nobody can run
an engine export against. Walk a level slowly, or drive a track, and it turns
what the screen showed into the same `.glb` contract from the outside.

**It never touches the game process.** Frames come from Windows Graphics Capture —
the public API screen recorders use — and, for Forza, positions come from the
game's own documented UDP telemetry feed. Nothing is injected, nothing is hooked,
no memory is read, so it puts no account at risk with anti-cheat.

That constraint is also the accuracy ceiling, and it is worth stating plainly: the
game knows every pixel's depth exactly, and a hooked depth buffer would make this
near-perfect. Estimating depth from the picture instead is strictly worse, and
deliberately so. What gets the accuracy back is taking *scale* from a source that
genuinely knows it — exact, frame by frame, where a game publishes telemetry, and
pinned once per capture where it does not.

The whole pipeline is built: capture, depth on the GPU, telemetry decoding, pose
estimation, voxel fusion, per-vertex colour, the live overlay and the GLB export.

Poses can be found two ways, and the choice is not a preference. Tracking frame
to frame is live and works wherever there is structure to hold on to. A racetrack
is the case where it fails — a smooth ribbon of road, a horizon that barely moves,
and nothing later that pulls a drifting pose back — so there is a second path that
hands a window of frames to a model solving all their cameras at once. That one is
offline, slower, and uses `facebook/VGGT-1B`, which is **non-commercial**. See
`exporters/gamecapture/README.md` and `exporters/gamecapture/LICENSES.md`.

### A third route: the game's own files

`exporters/gamefiles/` reads level data straight out of the archives a shipped
game already contains — Unreal `.pak` and Unreal 5 IoStore, Unity
`SerializedFile`, Frostbite `.toc`, ForzaTech, BeamNG's level archives. It is for
the case between the other two: someone with the build but not the project, who
wants exact geometry rather than an estimate.

For racing, `python -m heat3d_gamefiles course <lap>` turns a recorded lap into
the course around it - textured ground, road, kerbs, barriers, signs - from
Forza Horizon, BeamNG.drive and Assetto Corsa Rally, finding the installed game,
the level or stage, and (for AC Rally) which way its axes run from the lap
alone. Which other games can follow, and why some cannot, is in
[`docs/other-games.md`](docs/other-games.md).

It reads containers, which is ordinary file handling and what FModel, UModel and
AssetRipper have done in the open for years. **It ships no keys and recovers
none** — an encrypted archive opens only with a key the user already holds. What
anyone points it at remains subject to that game's licence. See
`exporters/gamefiles/README.md`.

## A note on silent texture allocation

Worth writing down, because it cost two long debugging sessions and the failure is
invisible by construction.

`texStorage2D` past `MAX_TEXTURE_SIZE` **does not throw**. The allocation is
dropped, every later `texSubImage2D` on that texture fails with
`INVALID_OPERATION`, and sampling it returns zero. So the picture is wrong and
nothing anywhere says so.

It happened twice. First a sign table sized by a column's cardinality, where a
high-cardinality column blew past the limit and took the GL context with it.
Then — much worse — the per-frame **block index texture**, declared as
`16384 × 1` while ANGLE's SwiftShader caps at 8192. It had never been allocated,
so every block-start upload had been failing since it was written, the shader read
zeros, and **the stochastic sampler drew only the first block of every chunk**. The
symptom was a heat field that did not grow as the timeline advanced — which looks
exactly like a timeline bug, and was chased as one.

Three things now prevent a third occurrence:

- `createTexture` checks both dimensions against `MAX_TEXTURE_SIZE` and throws
  with the offending size.
- The block index texture is two-dimensional (4096 wide), so it cannot outgrow a
  limit no matter how many blocks a frame needs.
- `src/render/limits.test.ts` pins every texture dimension against the limits
  worth supporting, so outgrowing one fails in CI rather than in a browser.

`?glcheck` additionally reads GL errors during the frame and surfaces them on
`renderer.heatDebug`. Off by default: `getError` is a pipeline sync point.

## Known limits

- **In-browser sorting caps at 80M rows.** Beyond that the time sort refuses
  rather than exhausting memory. Larger sets need the decimation stride, fewer
  files, or the time column unmapped (the rows then keep their file order and
  are never sorted).
- **glTF with external `.bin` files** is rejected with a message asking for a
  single `.glb`; binary `.ply` likewise asks for `.glb` or `.stl`.
- **Four simultaneous column filters.** Each costs a 4-bytes-per-row texture;
  beyond four the extras are marked as not applied rather than silently ignored.
  A person filter (the Entities panel, or a player focus from the Match tab)
  takes one of the four in the heat modes.
- **Up to 4096 distinct groups.** Two ceilings meet here and neither is a buffer
  size: the group id rides in the spare fourth channel of each row's position
  texel (RGBA16UI — x, y, z, group), which costs nothing but is 16 bits wide; and
  every group needs a texel in the sign table the shader reads to decide hidden /
  added / subtracted, which is `FILTER_MASK_WIDTH` wide. The second is smaller and
  it is the real one, because a group is something a person assigns by hand — a
  row in a list, a checkbox, a side of the difference.

  A column with more distinct values than that is an id, not a group: a session
  key, a player GUID, a per-match team id. **The load keeps every row and drops
  only the grouping**, saying so on the dataset — it does not fail. Getting this
  wrong used to throw away a finished multi-million-row read at the last step
  because of one mapping guess. The same ceiling applies to a retained category
  column, for the same reason, and `tools/inspect-distinct.mjs` answers "group or
  id?" for a file before you spend the load on it. A timestamp column is retained
  as a numeric range instead, which is both cheaper and usable: hundreds of
  thousands of match start times are a slider, not a list.
- **The sprite ramp curve must be a function of x.** Handles are clamped
  horizontally to their segment, so dragging one far past the next point flattens
  against it rather than folding the curve back — a curve that doubled back would
  make the baked table depend on which root the solver happened to find.








