---
title: World backdrop - sources and terms
parent: World backdrop
grand_parent: Levels and background geometry
nav_order: 1
---

# World backdrop: sources and terms

The map data of a [world backdrop](world-backdrop.md) comes from open services. This page lists each source, its licence, and how 3DHeat stays inside the terms.

| Source | Terms (as read on 7 November 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - OpenMapTiles-schema vector tiles from OpenStreetMap, current build named by `https://tiles.openfreemap.org/planet` | Free, no key, commercial use allowed. The [terms](https://openfreemap.org/tos/) forbid collecting data "in automated ways, except for offline downloads": an app may let users download an area for offline use if each download is at most 3,000 tiles or 50 MB, made with at most 4 parallel requests, with a User-Agent identifying the app. Attribution is required: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (the OpenFreeMap part optional). The service may end without notice. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) data | ODbL 1.0. Fetching it at run time and drawing it locally is private use; the drawn view is a Produced Work that needs a visible credit, and so are screenshots and videos made from it. |
| [OpenMapTiles](https://openmaptiles.org) schema | CC BY 4.0 for the schema; credit "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Released into the public domain; no key. The credit "Runways: OurAirports (public domain)" is shown as a courtesy. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | The 2016 layer is CC BY 4.0 (later years are CC BY-NC-SA, not used). EOX's service page invites use of the endpoints in applications, as a demo service without guarantee and with rate limiting; it says nothing about caching, which CC BY allows. Credit, shown on the canvas: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", linked. CORS: the request's origin is echoed. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-encoded 512 px lossless WebP, no key, open CORS. Sources under CC BY, public domain and similar open licences (none non-commercial or share-alike); credit "© Mapterhorn" and, for the global layer, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". No published usage policy for the public endpoint. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) orthoimagery, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction"; it asks for credit, e.g. "(Product or data name) courtesy of the U.S. Geological Survey". The service names its source "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, also a federal public-domain work); that is the credit shown. No key, open CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | The Géoplateforme terms list the WMTS as "Non soumis à limite d'usage" (no usage limit; WMS is limited to 40-50 requests a second); data are "soumises à la licence choisie et renseignée par le Fournisseur de données", by default the Etalab Licence Ouverte, under which BD ORTHO has been open since 2021; users must "ne pas nuire, entraver ou fausser le bon fonctionnement des API". Caching is not addressed; the Licence Ouverte allows reuse with the source credited: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". No key, open CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Open data from many sources, each with its own credit ([list](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); no key, no service guarantee, served with open CORS. Heights decode as `R × 256 + G + B / 256 − 32768` metres. |

## How the backdrop stays inside those terms

- A backdrop under a recording downloads at most 36 elevation tiles and 300 vector tiles; a theatre built once at most 64 + 100 elevation tiles and 64 + 1,500 vector tiles; a streamed theatre one tile of each source at a time per map tile, as the camera goes. Four requests at a time per source.
- **A theatre built once is one download**, and downloads at most 1,000 vector tiles or 40 MB (OpenFreeMap's terms allow 3,000 tiles or 50 MB). Tiles are asked for centre first; past the allowance the build takes only tiles already in the cache and says how many are still to come. Building again fetches the next chunk, and so on: a large area arrives in pieces, each one cached.
- Measured on synthetic flights: a theatre with a 25 km detailed area takes about 370 tiles and 20 MB the first time. Built again, or followed back over, nothing is downloaded.
- Tiles are downloaded only when **World backdrop** is pressed, never in the background.
- A browser does not let a page set its own User-Agent; the requests carry the browser's, and the page's origin as `Origin`/`Referer`. A desktop build of the viewer should send its own.
- **Nothing derived from OpenStreetMap is ever shipped** with the viewer or committed to its repository: ODbL's share-alike applies to a distributed derived database. Backdrops are built on the user's machine and kept only in that browser (the tile cache and, if saved, the level library).
