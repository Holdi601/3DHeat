---
title: World backdrop
parent: Levels and background geometry
nav_order: 5
---

# World backdrop

A recording made in the real world - a Tacview ACMI file from DCS, IL-2, MSFS or anything else Tacview records - says where on the earth it is. For such a dataset the **Background / level** panel offers **World backdrop**: it downloads open map data for the area under the data and builds it into a level, in the same metres as the data. Terrain, roads, railways, water, runways and buildings, simplified, and nothing else.

The button is shown only when the loaded dataset carries a geographic reference (below). Everything is built in a background worker ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)) with a progress line and **Cancel**: *Elevation tiles: N of M*, *Map tiles: N of M*, *Building the backdrop*. The result replaces the current level and behaves as any [3D level](model-levels.md): it occludes the heat, is cut by the slice, has the [appearance controls](level-appearance.md), and can be saved to the [library](level-library.md).

## Where the data is: the geographic reference

A dataset gets a geographic reference only from a source that states one. Today that is an ACMI recording: its header's `ReferenceLatitude` and `ReferenceLongitude`, and positions that the reader projects onto the plane touching the WGS84 ellipsoid there (X east, Y north, metres; heights are the recording's altitude above sea level). The reference is kept when the mapping takes **X** and **Y** as the ground axes - the recording's own hints do - and dropped when the ground comes from any other column, such as a game's own flat-world **U** and **V**. A load of several recordings keeps it only when all share the same reference point. Every other loader is unaffected and carries none.

The backdrop is projected the same way and then put through the load's axis mapping, so it lands under the data whatever flips or scale the mapping applies.

## What is built

| Part | Source | How |
|---|---|---|
| Terrain | AWS Terrain Tiles (Terrarium PNG) | A height grid over the box: the zoom is the deepest up to 12 (about 28 m a pixel at 43° N) that needs at most 36 tiles, and the grid is thinned to at most 400,000 vertices. Drawn as ground with the usual relief cues. |
| Roads, railways | OpenFreeMap vector tiles, `transportation` layer | Flat ribbons draped on the terrain, densified to the terrain's spacing and lifted a few per cent of it so they do not fight with it. Widths by class, from 16 m (motorway) to 3 m (track, rail); never narrower than the box's diagonal / 5000. Paths, ferries and tunnels are left out. |
| Airfields | `aeroway` layer | Runway, taxiway, apron and helipad polygons draped as ground; runway and taxiway lines as 45 m and 18 m ribbons. |
| Water | `water` layer | The sea flat at 0 m, lakes and ponds flat at their lowest shore, rivers draped. Drawn as water: flat-shaded, no contours. |
| Buildings | `building` layer | Footprints extruded from `render_min_height` to `render_height` (6 m when missing) above the lowest ground under them; `hide_3d` parts skipped. Drawn as structures. |

Vector tiles are read at zoom 14 (the only zoom with buildings) when the box needs at most 300 of them, else at the deepest zoom that does, down to 8. A larger area gets terrain only.

### Simplification and budget

- Buildings under 20 m² are dropped; 60 m² when the box is more than 30 km across, 150 m² beyond 80 km. The rest are added largest first until the buildings reach 1.5M triangles.
- Minor roads, service roads and tracks are dropped beyond 60 km across; beyond 150 km only motorways, trunk, primary and secondary roads remain.
- The whole backdrop stays under about 3M triangles. The import note says how many buildings were left out.

### Look

A backdrop starts with **Show captured colour** on - colour is what tells a light road from the grey ground it lies on, a dark runway from its apron - and with the ground's triangle edges off, since a regular grid says nothing. Everything else is a model level's default look.

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
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Open data from many sources, each with its own credit ([list](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); no key, no service guarantee, served with open CORS. Heights decode as `R × 256 + G + B / 256 − 32768` metres. |

How the backdrop stays inside those terms:

- One build downloads at most 36 elevation tiles and 300 vector tiles, four requests at a time per source. A test sortie round 43° N, 42° E took 175 tiles, 1.2 MB, and about 3 s to build.
- Tiles are downloaded only when **World backdrop** is pressed, never in the background.
- A browser does not let a page set its own User-Agent; the requests carry the browser's, and the page's origin as `Origin`/`Referer`. A desktop build of the viewer should send its own.
- **Nothing derived from OpenStreetMap is ever shipped** with the viewer or committed to its repository: ODbL's share-alike applies to a distributed derived database. Backdrops are built on the user's machine and kept only in that browser (the tile cache and, if saved, the level library).

## The tile cache

Every tile, and the vector tiles' TileJSON, is kept in the browser's Cache API under `3dheat-world-tiles-v1`, by URL. A second build of the same area makes no requests at all and works offline: the TileJSON is asked for first and, when that fails, its cached copy names the tiles already held. Tiles the server does not have (open sea, 404) are remembered as absent too.

Vector tile URLs carry the map's build date, so after OpenFreeMap publishes a new build the next backdrop downloads fresh tiles and the old ones stay until cleared. **Forget map tiles** deletes the whole cache. The cache needs a secure origin (`https://` or `localhost`); elsewhere every build downloads again.

## Limits and what comes later

- **Terrain resolution**: about 30 m at best, and coarser in large boxes. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFFs on AWS, no key, a fixed credit text) is the better source: 30 m everywhere, GLO-90 where GLO-30 has gaps (Armenia and Azerbaijan, which DCS Caucasus covers). It needs a GeoTIFF reader and is not used yet.
- **Curvature**: heights are not lowered for the earth's curve, matching how the ACMI reader places the data (altitude as height). Far from the reference both drift together, by under a part in a thousand at 100 km.
- **Present-day world only**: DCS and IL-2 maps are historical or stylised. Historical backdrops (period maps as textures, period airfields) are planned separately; so are DCS map extents (backdrops sized to a theatre rather than to a recording).
- **No globe mode**: a backdrop is a flat local patch round the data. A whole-earth view is planned.
- **Only ACMI recordings** carry a geographic reference so far.
- No airport data beyond OpenStreetMap's `aeroway`: OurAirports' runway list (public domain) adds nothing the aeroway polygons and lines do not already draw.
- Roads are widened in large boxes so they stay visible; up close they are wider than life.
