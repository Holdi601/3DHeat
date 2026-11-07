---
title: World backdrop
parent: Levels and background geometry
nav_order: 5
---

# World backdrop

A recording made in the real world - a Tacview ACMI file from DCS, IL-2, MSFS or anything else Tacview records - says where on the earth it is. For such a dataset the **Background / level** panel offers **World backdrop**: it downloads open map data for the area under the data and builds it into a level, in the same metres as the data. Terrain, roads, railways, water, runways and buildings, simplified, and nothing else.

The button is shown only when the loaded dataset carries a geographic reference (below). Below it, a **Theatre** picker builds a whole real-world game map - a DCS terrain or an IL-2 map - with or without data loaded ([Theatres](#theatres)). Everything is built in a background worker ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)) with a progress line and **Cancel**: *Elevation tiles: N of M*, *Map tiles: N of M*, *Building the backdrop*. The result replaces the current level and behaves as any [3D level](model-levels.md): it occludes the heat, is cut by the slice, has the [appearance controls](level-appearance.md), and can be saved to the [library](level-library.md).

## Where the data is: the geographic reference

A dataset gets a geographic reference only from a source that states one:

- **An ACMI recording**: its header's `ReferenceLatitude` and `ReferenceLongitude`, and positions that the reader projects onto the plane touching the WGS84 ellipsoid there (X east, Y north, metres; heights are the recording's altitude above sea level). The reference is kept when the mapping takes **X** and **Y** as the ground axes - the recording's own hints do - and dropped when the ground comes from any other column, such as a game's own flat-world **U** and **V**.
- **A Parquet table whose `heat3d` hints carry a `geo` entry** - the [Watcher](https://github.com/Holdi601/3DHeat-Watcher)'s DCS, MSFS, X-Plane and IL-2 (Tacview) tables:

  ```json
  "geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
          "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
  ```

  `east`, `north` and `up` name the columns holding east and north metres on the same tangent plane at (`lat0`, `lon0`) and the altitude. The load carries the reference when its mapping takes exactly those columns (east as X, north and height as Y and Z either way round). The optional `dcs` entry names a DCS table's own metres (x north, y up, z east) and its theatre: a load that maps those columns is placed through the theatre's transverse Mercator projection instead ([DCS coordinates](#dcs-coordinates)). A table without `geo` reads as before.

A load of several files keeps the reference only when all share the same one. Every other loader is unaffected and carries none.

The backdrop is projected the same way and then put through the load's axis mapping, so it lands under the data whatever flips or scale the mapping applies.

### DCS coordinates

Each DCS theatre is a Transverse Mercator projection (WGS84, scale 0.9996) with its own central meridian and false origin, DCS x being the northing and z the easting. The constants are the ones the pydcs project publishes; the maths is Krüger's series to sixth order (Karney 2011), ported from the DCS terrain converter's own `projection.py` to [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). A backdrop for DCS metres is built straight in them, so a Watcher DCS table mapped by `dcs_x`/`dcs_y`/`dcs_z`, a level the DCS terrain converter wrote and the backdrop all share one frame. Iraq's constants are not published; they are fitted to the 43 beacons the theatre's own `beacons.lua` gives both ways (4 cm root mean square; the same fit gives Caucasus, Syria and Sinai back to the millimetre).

The Watcher's DCS tables are on a tangent plane at the theatre's fixed reference point (the same point the theatre picker uses, below), so several missions on one theatre merge with their reference intact and line up with a theatre backdrop without moving it.

## Theatres

The **Theatre** picker lists the real-world maps of DCS World (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) and IL-2 Great Battles (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), each with its box on the earth ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). The DCS boxes are the editors' extents computed from the published projections; the IL-2 boxes, and the DCS ones marked so, are estimates from the maps' published sizes and the towns at their edges - the panel says which.

**Build theatre backdrop** builds two levels of detail in one mesh:

| Level | Area | Terrain | Map |
|---|---|---|---|
| Theatre | the whole box | the deepest zoom up to 10 that needs at most 64 elevation tiles (about 3 km a vertex over the Caucasus, 1 km over Normandy) | the sea, lakes, land cover and motorways from at most 64 vector tiles at zoom 4 to 9 |
| Detailed area | **Under the data**, **Round a point** (latitude, longitude, 12 to 400 km), or none | up to zoom 12 in at most 100 tiles, at most 500,000 vertices | everything below, from at most 1,500 vector tiles at the deepest zoom up to 14 that fits |

The detailed area cuts a hole in the theatre's grid, widened to whole cells so both grids share their edge lines, and a thin wall closes the seam where they sample the heights differently.

With data loaded the theatre is built on the data's plane, so it lands under it as built. Without data it is built round the theatre's own reference point (whole degrees near its detailed area). Data loaded afterwards on another reference - an ACMI file names its own - moves the backdrop under it: the exact move between the two projections is computed on a 256 × 256 grid over the backdrop and read between the nodes, within a metre or two across a whole theatre ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). A backdrop saved to the library keeps its place and moves the same way when loaded under other data.

### Streaming a theatre

**Stream theatre** shows the theatre the way a flight-sim map viewer does: the ground comes as many small tiles round the camera, loaded as it flies and dropped when out of reach ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **A quadtree of Web Mercator tiles.** Roots at zoom 5 cover 1,500 km round the camera, so the ground reaches past the theatre's box to the horizon. A tile is split into its four children while the camera is nearer than 1.4 times its width, down to zoom 15 (about 1 km a tile, 15 m between terrain vertices): detail falls off with distance as it falls off on screen.
- **Each tile its own mesh**, built in a worker ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): a 65 × 65 terrain grid with a skirt round its edge (so neighbours at different detail never show a crack), land cover and the sea painted on it, roads, railways, lakes, rivers, airfields, surveyed runways and buildings on top, and optionally the satellite picture of its square. The renderer draws the tiles with the level's look and depth rules, so they hide the heat behind them like any level.
- **Coarse first.** Tiles are asked for coarse and near first, four downloads at a time per source; while a tile's children load, the tile stands in for them, so the view fills at once and sharpens.
- **Memory**: built tiles are kept up to 600 MB, the least recently drawn dropped first. **Downloads** stay in the tile cache, kept to a 2 GB budget, oldest first out: flying back over an area costs nothing, and there is no per-build cap.
- With data loaded the tiles are built on the data's plane; data loaded later on another plane rebuilds them there (from the cache).
- Measured on the test spots, first visit with imagery: Normandy round Carpiquet 63 MB, Nevada round Nellis 45 MB, Syria round Latakia 24 MB (Mapterhorn's height tiles are the largest part); a second visit downloads nothing.


## What is built

| Part | Source | How |
|---|---|---|
| Imagery (streamed theatres, optional) | EOX Sentinel-2 cloudless 2016 | **Satellite imagery** drapes the cloud-free 2016 mosaic (about 10 m a pixel, zoom 14, deeper tiles enlarge it) over the ground in place of the painted land cover; roads, runways, buildings and names stay on top. |
| Terrain (streamed theatres) | Mapterhorn | Copernicus GLO-30 everywhere (about 19 m a pixel at zoom 12), metre-scale where a country's own survey is in it (France, the US and others); read two zooms coarser than each tile. The AWS Terrain Tiles if Mapterhorn cannot be reached. |
| Terrain | AWS Terrain Tiles (Terrarium PNG) | A height grid over the box: the zoom is the deepest up to 12 (about 28 m a pixel at 43° N) that needs at most 36 tiles, and the grid is thinned to at most 400,000 vertices. Drawn as ground with the usual relief cues. |
| Roads, railways | OpenFreeMap vector tiles, `transportation` layer | Flat ribbons draped on the terrain, densified to the terrain's spacing and lifted a few per cent of it so they do not fight with it. Widths by class, from 16 m (motorway) to 3 m (track, rail); never narrower than the box's diagonal / 5000. Paths, ferries and tunnels are left out. |
| Airfields | `aeroway` layer | Runway, taxiway, apron and helipad polygons draped as ground; runway and taxiway lines as 45 m and 18 m ribbons. |
| Water | `water` layer | The sea flat at 0 m, lakes and ponds flat at their lowest shore, rivers draped. Drawn as water: flat-shaded, no contours. |
| Land cover | `landcover` and `landuse` layers | Painted onto the terrain's own vertices, no extra triangles: woods, grass and parks green, farmland straw, wetland, sand, rock, ice; residential, industrial, commercial, military and quarry areas in muted tones. Water is painted under the water surface too, so the shore reads from any height. Bare ground gets a quiet height tint (lowland grey-green, upland brown, snow above 3,000 m). Readable at the terrain's resolution: about 30-45 m in the detailed area, kilometres in the theatre. |
| Place names | `place` and `aerodrome_label` layers | Cities, towns and villages, and airfields with their ICAO code, written over the view; how far each kind shows grows with the camera's height, at most 70 at once. |
| Surveyed runways | [OurAirports](https://ourairports.com/data/) `runways.csv` (public domain) | Optional (**Runways from OurAirports**, on by default): every open runway with both ends in the list, from threshold to threshold at its listed width, with side stripes, a dashed centre line and threshold bars. One 4 MB list, downloaded once and kept in the cache. |
| Buildings | `building` layer | Footprints extruded from `render_min_height` to `render_height` (6 m when missing) above the lowest ground under them; `hide_3d` parts skipped. Drawn as structures. |

Vector tiles are read at zoom 14 (the only zoom with buildings) when the box needs at most 300 of them, else at the deepest zoom that does, down to 8. A larger area gets terrain only.

### Simplification and budget

- Buildings under 20 m² are dropped; 60 m² when the box is more than 30 km across, 150 m² beyond 80 km. The rest are added largest first until the buildings reach 1.5M triangles.
- Minor roads, service roads and tracks are dropped beyond 60 km across; beyond 150 km only motorways, trunk, primary and secondary roads remain.
- The whole backdrop stays under about 3M triangles. The import note says how many buildings were left out.

### Look

A backdrop starts with **Show captured colour** on - colour is what tells a light road from the grey ground it lies on, a dark runway from its apron - with the ground's triangle edges off, since a regular grid says nothing, faint contours, an opaque sea (a floor under it would fight the surface for depth far off), and buildings light grey and nearly solid, as a map draws them. The open sea gets no ground triangles at all. Everything else is a model level's default look.

## Credits on the canvas

While a backdrop is the level, its sources' credit is written bottom right of the view, without needing a click, so that screenshots and rendered videos carry it:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Each part links to its source's attribution page (openstreetmap.org/copyright and the Terrain Tiles [attribution list](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). A backdrop saved to the library keeps its credits and shows them again when loaded. The text is translated with the viewer; the names are not.

## Sources and their terms

| Source | Terms (as read on 7 November 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - OpenMapTiles-schema vector tiles from OpenStreetMap, current build named by `https://tiles.openfreemap.org/planet` | Free, no key, commercial use allowed. The [terms](https://openfreemap.org/tos/) forbid collecting data "in automated ways, except for offline downloads": an app may let users download an area for offline use if each download is at most 3,000 tiles or 50 MB, made with at most 4 parallel requests, with a User-Agent identifying the app. Attribution is required: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (the OpenFreeMap part optional). The service may end without notice. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) data | ODbL 1.0. Fetching it at run time and drawing it locally is private use; the drawn view is a Produced Work that needs a visible credit, and so are screenshots and videos made from it. |
| [OpenMapTiles](https://openmaptiles.org) schema | CC BY 4.0 for the schema; credit "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Released into the public domain; no key. The credit "Runways: OurAirports (public domain)" is shown as a courtesy. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | The 2016 layer is CC BY 4.0 (later years are CC BY-NC-SA, not used). EOX's service page invites use of the endpoints in applications, as a demo service without guarantee and with rate limiting; it says nothing about caching, which CC BY allows. Credit, shown on the canvas: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", linked. CORS: the request's origin is echoed. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-encoded 512 px lossless WebP, no key, open CORS. Sources under CC BY, public domain and similar open licences (none non-commercial or share-alike); credit "© Mapterhorn" and, for the global layer, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". No published usage policy for the public endpoint. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Open data from many sources, each with its own credit ([list](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); no key, no service guarantee, served with open CORS. Heights decode as `R × 256 + G + B / 256 − 32768` metres. |

How the backdrop stays inside those terms:

- A backdrop under a recording downloads at most 36 elevation tiles and 300 vector tiles; a theatre built once at most 64 + 100 elevation tiles and 64 + 1,500 vector tiles; a streamed theatre one tile of each source at a time per map tile, as the camera goes. Four requests at a time per source.
- **A theatre built once is one download**, and downloads at most 1,000 vector tiles or 40 MB (OpenFreeMap's terms allow 3,000 tiles or 50 MB). Tiles are asked for centre first; past the allowance the build takes only tiles already in the cache and says how many are still to come. Building again fetches the next chunk, and so on: a large area arrives in pieces, each one cached.
- Measured on the test sorties: the Caucasus theatre with a 25 km area round Batumi, 372 tiles, 19 MB, the first time; Normandy 2 with 25 km round Caen, 371 tiles, 24 MB. Built again, or followed back over, nothing is downloaded.
- Tiles are downloaded only when **World backdrop** is pressed, never in the background.
- A browser does not let a page set its own User-Agent; the requests carry the browser's, and the page's origin as `Origin`/`Referer`. A desktop build of the viewer should send its own.
- **Nothing derived from OpenStreetMap is ever shipped** with the viewer or committed to its repository: ODbL's share-alike applies to a distributed derived database. Backdrops are built on the user's machine and kept only in that browser (the tile cache and, if saved, the level library).

## The tile cache

Every tile, and the vector tiles' TileJSON, is kept in the browser's Cache API under `3dheat-world-tiles-v1`, by URL. A second build of the same area makes no requests at all and works offline: the TileJSON is asked for first and, when that fails, its cached copy names the tiles already held. Tiles the server does not have (open sea, 404) are remembered as absent too.

Vector tile URLs carry the map's build date, so after OpenFreeMap publishes a new build the next backdrop downloads fresh tiles and the old ones stay until cleared. The cache is kept to 2 GB: past it, the tiles stored longest ago are deleted first. **Forget map tiles** deletes the whole cache. The cache needs a secure origin (`https://` or `localhost`); elsewhere every build downloads again.

## Compared with Tacview

Checked by eye on the same spots - Batumi (Caucasus), Carpiquet (Normandy 2), Nellis (Nevada) and Latakia (Syria) - with synthetic recordings where there was one: the take-off rolls lie on the drawn runways' centre lines, coast crossings fall on the coast. Tacview's side is from its documentation and its published screenshots (tacview.net, its Steam page), not from running it here.

| | Tacview 1.9 | This backdrop, streamed |
|---|---|---|
| Extent | the whole globe | 1,500 km round the camera, wherever it is |
| Terrain | ETOPO1 (about 1.25 km) built in; SRTM 25-75 m if the user installs the files; DCS terrain exported from DCS | Copernicus GLO-30 (Mapterhorn), metre-scale in France and the US |
| Imagery | none built in; textures the user downloads (Mapview, SAS Planet, add-ons such as a Caucasus VFR chart) | EOX Sentinel-2 cloudless 2016, about 10 m, streamed |
| Land cover | none, unless in a texture | from OpenStreetMap, painted on the terrain (without imagery) |
| Roads, railways | none, unless in a texture | every class near the camera, major roads far off |
| Buildings | none | extruded footprints near the camera |
| Airfields | labels and runways as flat boxes, no markings | runways from surveyed ends with side stripes, centre line and threshold bars; taxiways, aprons; names with ICAO codes |
| Place names | some village and city labels | cities, towns, villages, airfields, by distance and height |

Where it still falls short:

- **Imagery resolution**: 10 m is soft below about 2 km; Tacview with a user-installed zoom-17 texture is sharper close up. The USGS (US) and IGN (France) orthophoto services are public and would give metre-scale imagery there; they are not wired in yet.
- **Terrain in DCS's own shape**: Tacview can show the terrain DCS itself exports; here it is the real earth, which differs from DCS's terrain where the map's modellers changed it.
- **Curvature**: the ground is a flat plane, so the horizon is not a curved earth's; Tacview draws a sphere.
- **Speed**: the first visit to a spot downloads tens of megabytes before it is sharp; in a software-rendered browser (the screenshots) it draws at a few frames a second with several hundred tiles.
- **Clicks**: the inspector does not pick the streamed tiles yet, and a streamed theatre cannot be saved to the level library (a theatre built once can).

## Limits and what comes later

- **Terrain resolution**: about 30 m at best, and coarser in large areas. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFFs on AWS, no key, a fixed credit text) is the better source: 30 m everywhere, GLO-90 where GLO-30 has gaps (Armenia and Azerbaijan, which DCS Caucasus covers). It needs a GeoTIFF reader and is not used yet.
- **Better terrain**: Copernicus GLO-30 on AWS sends no CORS headers, so a browser cannot read it; OpenTopography's mirror can be read (CORS and ranges), but their terms for a public app's runtime use are unknown - to be asked before any use. Mapterhorn carries GLO-30 already.
- **Curvature**: heights are not lowered for the earth's curve, matching how the ACMI reader places the data (altitude as height). Far from the reference both drift together, by under a part in a thousand at 100 km.
- **Present-day world only**: DCS's and IL-2's historical maps (Normandy 2, The Channel, Germany Cold War, every IL-2 map) are drawn with today's towns, roads and coast works; the panel says so. Period airfields are not drawn.
- **No globe mode**: a backdrop is a flat local plane. A whole-earth view is planned.
- Roads are widened in large areas so they stay visible; up close they are wider than life.
- DCS theatre names in the Watcher's tables are matched as DCS gives them in `mission.theatre`; a name not in the list falls back to the first fix rounded to whole degrees, and to latitude and longitude only.

## Historical maps (not built yet)

Period maps could texture the historical theatres later. The US Army Map Service (AMS) series are US federal government works, generally treated as public domain (check each scan's record; many are reprints of British GSGS or German originals, whose Crown copyright or anonymous-work term has also run out):

| Theatre | Series | Where scanned |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Eastern Europe 1:250,000 (compiled in the 1950s from Soviet and German maps) | UT Austin PCL; some sheets georeferenced at UT GeoData |
| IL-2 Normandy, DCS Normandy 2 and The Channel | AMS **M661** / GSGS 4250, France 1:50,000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250,000 and **M841** 1:25,000 (Germany) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50,000 (1951 editions) and **L552** 1:250,000 | ANU Open Research (L751 sheets, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | British WWI trench maps (not AMS) | McMaster University; National Library of Scotland (non-commercial terms) |

AMS sheets carry latitude and longitude ticks at their corners, so each would be placed by a four-corner fit and draped on the terrain as a texture, built and kept locally like the tiles.
