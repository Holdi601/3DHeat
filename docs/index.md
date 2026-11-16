---
title: Home
nav_order: 1
---

# 3DHeat

3DHeat shows where things happened in a game - where players went, fought and fell - as glowing colours you can fly through, or as little 3D figures that replay the match.

Load positions - CSV, Parquet, Tacview recordings, converted replays, a single file, a folder or thousands of matches - and see them as a **heatmap you can fly through**, as **figures replaying the match**, as lines along the routes people took, or as one population against another. It finds what stands out by itself, and it runs entirely in your browser: nothing is uploaded anywhere. 3DHeat and all its tools are free and open source under the [MIT licence](https://github.com/Holdi601/3DHeat/blob/main/LICENSE).

![Heat of ten tank matches over the demo valley](assets/img/en/heat-hero.webp)

**New here?** Make the [demo data](demo-data.md) and follow its seven steps. Every picture on this site was taken with it.

## What it does

| | |
|---|---|
| ![Difference](assets/img/en/heat-difference.webp) | **[Heat modes](heat-modes.md)** - heat, [difference](difference.md) (red where one side was more, green-blue where the other was), [team heat](team-heat.md), [line heat](line-heat.md); [directional heat](directional-heat.md) with wedges, arrow fields and polar charts; heat [weighed by value](value-weighting.md): what weapons, vehicles and fuel cost. |
| ![Replay](assets/img/en/replay-tanks.webp) | **[Match replay](match-replay.md)** - every unit as the [figure](figures.md) of what it is, NATO or Russian symbols far off, missiles and tracers, hit marks, wrecks, fires, turrets, objectives, Tacview-style cameras and tactical display; [many matches at once](many-matches.md). |
| ![Insights](assets/img/en/insights.webp) | **[Insights](insights.md)** - strong positions, deadly ground, spawn traps, chokes and standout players, found and ranked with the evidence; a written debrief, optionally by an AI of your choice; a caster for one match; the [knowledge lens](knowledge.md). |
| ![Volumes](assets/img/en/compare.webp) | **[Volumes](volumes.md)** - draw boxes, prisms, cylinders and spheres, filter to them, count what happens inside, export it, and compare places side by side; [breakdown](breakdown.md) of who and what does best in a place. |
| ![Filters](assets/img/en/filters.webp) | **[Filters](filters.md)** - by event type, player or AI, vehicle class, value, any column, in the graphics card at any data size. |
| ![Level](assets/img/en/level-panel.webp) | **[Levels](levels.md)** - map images, 3D levels made with the [data tools](#related-repositories), simplification, the [world backdrop](world-backdrop.md) with real terrain for flight data. |

Also: the [Race analysis](race-analysis.md) tab for laps of racing games, the [Match](match-analysis.md) tab for Counter-Strike 2 summaries, the [Tactics board](tactics-board.md) for plans on a level, [hit analysis](hit-analysis.md) per vehicle, [mass analysis](mass-analysis.md) of thousands of matches, [camera paths and video](camera-path-and-video.md), [40 languages](languages.md), [metric or imperial units](settings.md).

## The tabs

The tabs sit at the top of the sidebar, under the name, the units and the language menu.

| Tab | What it is for |
|---|---|
| **Heatmap** | Any positional table: the heat modes, the figure overlay, filters, volumes, insights, levels, measuring and video. |
| **Race analysis** | Two or more laps of one course: where time is lost, why, and what to change. |
| **Match** | The figure replay of a match, and Counter-Strike 2 match summaries. |
| **Tactics** | Plans on a level: figures, routes, thrown utility, areas and notes in steps that play. |
| **Vehicles** | Where each unit was hit, by whom and with what. |

## Install and run

3DHeat is free to use, change and share (MIT licence), and so is every tool listed under [Related repositories](#related-repositories).

### Windows, the easy way

The repository root holds three batch files.

| File | What it does |
|---|---|
| `start.bat` | Starts the viewer. Finds Node.js even when it is not on `PATH` (it looks in `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` and `%LOCALAPPDATA%\Programs\nodejs`), and when Node.js is missing it offers to install the LTS release with `winget install -e --id OpenJS.NodeJS.LTS`. On first run it asks before downloading the dependencies (about 300 MB into `node_modules\` inside the folder, nothing system-wide). It refuses to start when something already listens on port 5273, and points at `restart.bat` instead. When the folder is a git checkout with no local changes and a newer version exists, it asks whether to update (Y/N; with no answer in 60 s it keeps this version; see [Updates](updates.md)). Then it runs the dev server on `http://127.0.0.1:5273/` and opens the browser. **The window is the server**: leave it open, close it or press Ctrl+C to stop. |
| `restart.bat` | Runs `stop.bat quiet`, then `start.bat`. Only needed after changing `vite.config.ts`, adding a dependency, or when the server has wedged - source edits are hot-reloaded. |
| `stop.bat` | Stops whatever listens on port 5273, by process id found through `netstat`, never by image name, so other Node.js processes on the machine are left alone. Waits about two seconds for the socket to be released. With the argument `quiet` it does not pause at the end. |

### By hand (any OS)


```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

The `exporters/` folder holds the separate data tools as git submodules, each its own repository; after a plain clone run `git submodule update --init`. The viewer itself does not need them to run. `exporters/ext/` holds the optional converters (War Thunder, World of Tanks, World of Warships, Squad replays; DCS and IL-2 maps), each its own project.

No game data comes with any of it: levels, maps and recordings are made on your own machine with the tools, from games you own.

### npm scripts

| Script | What it runs |
|---|---|
| `npm run dev` | The Vite dev server on port 5273, bound to `127.0.0.1`. |
| `npm run build` | Type check (`tsc --noEmit`) and a production bundle into `dist/`. |
| `npm run preview` | Serves the production bundle. |
| `npm run typecheck` | The type check alone. |
| `npm test` / `npm run test:watch` | Unit and integration tests (vitest). |
| `npm run smoke` | Drives the real app in headless Chromium and checks that the canvas has data-coloured pixels; screenshots go to `tools/.smoke/`. Expects the dev server to be running. |
| `npm run smoke:f16` | The same suite with `?heat=f16`, forcing the half-float accumulation path (see [Half-float accumulation](half-float-accumulation.md)). |
| `npm run bench` | Ingest benchmark, writes `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Tests that need large real data files; they skip themselves when the files are absent. |
| `npm run inspect -- <file.parquet>` | Prints a Parquet file's schema and some rows (`tools/inspect-parquet.mjs`). |

### What the dev server adds

The viewer is a static web page, but the dev server (see `vite.config.ts`) adds two local routes that a static deployment of `dist/` does not have:

- `/__host/memory` reports the machine's installed and free RAM and, where it can read it, the graphics card's memory (from `nvidia-smi`, or on Windows from the display adapter's registry entry). This is what lets the [memory budgets](memory-and-budgets.md) use real figures instead of the browser's capped guesses.
- `/__heat3d/update` checks whether the checkout is behind and can fast-forward it ([Updates](updates.md)).

The server binds to `127.0.0.1` only, so neither route is reachable from the network. Open it as `http://127.0.0.1:5273`: `localhost` can resolve to the IPv6 loopback `::1`, where nothing listens. It sends no cross-origin isolation headers (COOP/COEP): nothing in the viewer uses `SharedArrayBuffer`, and the workers hand their data over by transfer, which needs none.

## Browser and GPU requirements

- **A browser with WebGPU or WebGL2.** WebGPU is tried first (Chrome and Edge have it); without it the WebGL2 backend is used. WebGL2 must offer `EXT_color_buffer_float` (rendering to float textures), otherwise the viewer shows "Cannot initialise the renderer." See [The two backends](backends.md). The viewer is developed and tested in Chromium; other browsers are unverified.
- **Hardware acceleration switched on.** When the browser draws on the CPU (SwiftShader, llvmpipe, the Microsoft Basic Render Driver and similar) a red banner at the top of the sidebar says so and how to fix it. See [Software rendering detection](software-rendering.md).
- **A discrete GPU helps, but is not required.** Both backends ask for the high-performance adapter. The amount of data that can be held on the GPU is a budget you can see and change ([Memory and budgets](memory-and-budgets.md)).
- **Optional features** use further browser APIs: video rendering needs WebCodecs `VideoEncoder` with VP9 or VP8 ([Camera path and video](camera-path-and-video.md)); mesh simplification of levels needs WebAssembly; dropping folders uses the File and Directory Entries API; the level library uses IndexedDB; gamepads use the Gamepad API.

## Documentation map

**Start**: [Demo data](demo-data.md) · [Getting data in](getting-data-in.md) ([loading files](loading-files.md), [column mapping](column-mapping.md), [axes, units and time](axes-units-and-time.md), [sessions, persons and groups](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [converters](converters.md), [.3dheat](container.md), [memory and budgets](memory-and-budgets.md))

**See**: [Heat modes](heat-modes.md) ([heat](heat.md), [sprite shape](sprite-shape.md), [colour and exposure](colour-and-exposure.md), [depth and culling](depth-and-culling.md), [difference](difference.md), [team heat](team-heat.md), [line heat](line-heat.md), [box replay](box-replay.md), [directional heat](directional-heat.md), [value weighting](value-weighting.md)) · [Timeline](timeline.md) · [Levels](levels.md) ([map images](map-images.md), [3D levels](model-levels.md), [appearance](level-appearance.md), [library](level-library.md), [world backdrop](world-backdrop.md), [its sources](world-backdrop-sources.md)) · [Camera](camera.md) ([gamepad](gamepad.md), [keys](keyboard-reference.md)) · [Camera path and video](camera-path-and-video.md)

**Analyse**: [Filters and tools](filters-and-tools.md) ([filters](filters.md), [teams](teams-list.md), [entities](entities.md), [slice](slice.md), [measure](measure.md), [volumes](volumes.md), [breakdown](breakdown.md)) · [Insights](insights.md) ([knowledge lens](knowledge.md)) · [Mass analysis](mass-analysis.md)

**Replay**: [Match replay](match-replay.md) · [Many matches at once](many-matches.md) · [Figures](figures.md) ([in the figure overlay](figure-replay.md), [credits](figure-credits.md)) · [Tacview parity](tacview-parity.md) · [Hit analysis](hit-analysis.md)

**Other tabs**: [Race analysis](race-analysis.md) ([the method](race-analytics.md), [other games](other-games.md)) · [Match analysis](match-analysis.md) · [Tactics board](tactics-board.md) ([speeds](tactics-speeds.md))

**The viewer**: [Glossary](glossary.md) · [Settings, units and keys](settings.md) · [Languages](languages.md) · [Updates](updates.md) · [Rendering internals](rendering-internals.md) ([backends](backends.md), [accumulation](accumulation.md), [sampling and budgets](sampling-and-budgets.md), [half-float](half-float-accumulation.md), [GPU memory](gpu-memory.md), [software rendering](software-rendering.md), [performance and stats](performance-and-stats.md)) · [Data formats](data-formats.md) · [Reference](reference.md) · [Maintaining the docs](maintaining.md)

## Related repositories

The viewer reads data; these tools make it. Each is its own public repository (MIT) with its own documentation. None of them ships game data: levels, maps and recordings are made on your own machine, from games you own. Each game reader is its own small project with its own licence file, releases and issue tracker, so it can be installed, updated, maintained - or withdrawn on a rights holder's request - on its own, without affecting the viewer or the other tools.

| Repository | What it does | Useful for | Documentation |
|---|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Reads courses and levels out of the archives games ship (Forza Horizon, BeamNG, Assetto Corsa Rally; Unreal, Unity, Frostbite and Source 2 readers) as glTF | a 3D level under your heat or replay | [site](https://holdi601.github.io/3DHeat-GameFiles/) |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Records lap telemetry from the interfaces racing games publish, and rebuilds levels from gameplay video | laps for Race analysis; a level where no files can be read | [site](https://holdi601.github.io/3DHeat-GameCapture/) |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Unreal Editor plugin that exports a level as one glTF file | levels of your own Unreal projects | [site](https://holdi601.github.io/3DHeat-UnrealExporter/) |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Counter-Strike 2 demos into heatmap tables and match summaries, CS2 maps into geometry | CS2 heat, replays and the Match tab | [site](https://holdi601.github.io/3DHeat-CS2/) |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Records your play in the background from what games publish: telemetry, game-state integrations, logs, replays | your own statistics without doing anything by hand | [site](https://holdi601.github.io/3DHeat-Watcher/) |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | War Thunder replays (`.wrpl`) to tables: air and ground tracks, shots, hits, kills, turrets, objectives | War Thunder replays, hit marks and insights | [site](https://holdi601.github.io/3DHeat-Ext-WarThunder/) |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | World of Tanks replays to tables: every vehicle's position, deaths and kills | World of Tanks heat and replays | [site](https://holdi601.github.io/3DHeat-Ext-WoT/) |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | World of Warships replays to tables: every ship's position and sinkings | World of Warships heat and replays | [site](https://holdi601.github.io/3DHeat-Ext-WoWs/) |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Squad server demos to tables: every player's position, team and squad | Squad heat and replays | [site](https://holdi601.github.io/3DHeat-Ext-Squad/) |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | DCS World terrains from your own install to levels: ground, roads, towns, airfields, fields, water | DCS and Tacview recordings on their real terrain | [site](https://holdi601.github.io/3DHeat-Ext-DCS/) |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | IL-2 Great Battles maps into levels | IL-2 recordings on their map | [site](https://holdi601.github.io/3DHeat-Ext-IL2/) |
| [3DHeat-Ext-Dota](https://github.com/Holdi601/3DHeat-Ext-Dota) | The Dota 2 map from your own install as a 3D level: ground, cliffs, river, every tree and the buildings | Dota 2 replays on the real map | [site](https://holdi601.github.io/3DHeat-Ext-Dota/) |
| [3DHeat-Ext-DotaReplay](https://github.com/Holdi601/3DHeat-Ext-DotaReplay) | Dota 2 replays (`.dem`) to tables: every hero's path, kills, towers, wards, pings and orders, and the whole match | Dota 2 heat, replays and the Match tab | [site](https://holdi601.github.io/3DHeat-Ext-DotaReplay/) |
| [3DHeat-Ext-Riot](https://github.com/Holdi601/3DHeat-Ext-Riot) | League of Legends (`.rofl`) and VALORANT (`.vrf`) replays: what each file carries in the open - League's box score and header, VALORANT's map, agents and timeline of kills, rounds and spikes | keeping your League and VALORANT matches' numbers | [site](https://holdi601.github.io/3DHeat-Ext-Riot/) |
| [3DHeat-Ext-Forza](https://github.com/Holdi601/3DHeat-Ext-Forza) | Forza courses from your own install round a lap you drove: road, verge, kerbs, barriers, signs, buildings and the race's own layer; every car at low detail | Forza laps on the real track in Race analysis | [site](https://holdi601.github.io/3DHeat-Ext-Forza/) |
| [3DHeat-Ext-Battlefield](https://github.com/Holdi601/3DHeat-Ext-Battlefield) | Battlefield 6 levels from your own install as 3D levels: terrain, every placed mesh, the backdrop, and on request colour maps, roads and walkable surfaces; Battlefield 4 and Battlefield 1 multiplayer levels with terrain and placed meshes | Battlefield matches on their real level | [site](https://holdi601.github.io/3DHeat-Ext-Battlefield/) |
| [3DHeat-Ext-BeamNG](https://github.com/Holdi601/3DHeat-Ext-BeamNG) | BeamNG.drive courses from your own install round your lap: ground with its baked texture, roads, kerbs, barriers, signs, buildings and water | BeamNG laps on the real road in Race analysis | [site](https://holdi601.github.io/3DHeat-Ext-BeamNG/) |
| [3DHeat-Ext-ACRally](https://github.com/Holdi601/3DHeat-Ext-ACRally) | Assetto Corsa Rally stages from your own install round your run: road and terrain in the game's baked colours, barriers, signs and buildings | rally runs on the real stage in Race analysis | [site](https://holdi601.github.io/3DHeat-Ext-ACRally/) |
| [3DHeat-Ext-Reforger](https://github.com/Holdi601/3DHeat-Ext-Reforger) | Arma Reforger worlds from your own install as 3D levels: terrain in its ground colours, the sea, every placed building and object as a box | Arma Reforger recordings on their world | [site](https://holdi601.github.io/3DHeat-Ext-Reforger/) |
| [3DHeat-Ext-R6](https://github.com/Holdi601/3DHeat-Ext-R6) | Rainbow Six Siege Match Replays (`.rec`) to matches: every player's position, operators as picked, loadouts, kills, plants and defuses, callouts, marks on the level | Siege heat, replays and the Match tab | [site](https://holdi601.github.io/3DHeat-Ext-R6/) |
| [3DHeat-Ext-R6-Maps](https://github.com/Holdi601/3DHeat-Ext-R6-Maps) | Rainbow Six Siege maps from your own installation as 3D levels: floors, stairs and walls in the replays' frame, each breakable object as its own part | Siege replays on the real building, floor by floor | [site](https://holdi601.github.io/3DHeat-Ext-R6-Maps/) |

## Source layout, briefly

| Folder | Contents |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | File picking, CSV and Parquet ingest, auto-mapping, validation, memory model, dataset builder, model parsing, classification, simplification, level library |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | The frame loop (`engine.ts`), sampling, both backends, camera, gamepad, measure, camera path, video recording |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | The application state (`store.ts`) with every default, the domain types (`types.ts`), the sprite curve |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | The sidebar panels, timeline, overlays |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | The Race analysis and Match tabs |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Translations |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Insights: detectors, debrief, caster, AI providers, the knowledge lens |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Mass analysis over many matches |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Volumes, their statistics, export and comparison |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Breakdown and factors |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | The many-match overlay |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | The figure catalogue and its builder |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Hit analysis (Vehicles tab) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | The tactics board |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | The world backdrop |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Units of measure |
