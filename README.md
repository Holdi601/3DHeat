# 3DHeat

3DHeat shows where things happened in a game - where players went, fought and fell - as **glowing colours you can fly through**, or as **little 3D figures that replay the match**, and it finds what stands out by itself. It handles millions of rows and thousands of matches, in the browser, on the graphics card (WebGPU, or WebGL2).

![Heat of ten tank matches over a demo valley](docs/assets/img/en/heat-hero.webp)

**Documentation, with pictures and step-by-step guides: <https://holdi601.github.io/3DHeat/>**

No game data comes with it. Levels, maps and recordings are made on your own machine with the [related tools](#related-repositories), from games you own. Nothing you load is uploaded anywhere.

## Quick start

1. Install [Node.js](https://nodejs.org/) (LTS) and use a Chromium browser (Chrome or Edge) with hardware acceleration on; see [browser and GPU requirements](https://holdi601.github.io/3DHeat/#browser-and-gpu-requirements).
2. Get the viewer and start it - the server keeps running in its window. On Windows, **Code -> Download ZIP** above, unpack it and double-click `start.bat`: it finds or offers to install Node.js, installs the dependencies, offers updates when there are any, and opens the browser at <http://127.0.0.1:5273>. Or, with Git:
   ```bash
   git clone https://github.com/Holdi601/3DHeat.git
   cd 3DHeat
   npm install
   npm run dev                  # open http://127.0.0.1:5273
   ```
3. Make some made-up demo data: `node tools/demo-data.mjs` (in a second window). It lands in `tools/.shots/demo/`.
4. In the viewer: **Background / level → 3D model…** and pick `demo-valley.glb`, then **Source → Files…** and pick `tanks.parquet` from the same folder (or drop it on the Source panel).

The [demo data](https://holdi601.github.io/3DHeat/demo-data.html) page takes it from there.

## Getting started with your own games

The viewer only reads files; a small tool per game makes them from your own install, replays or recordings. Each tool's README starts with a **Quick start for new users**: what it needs, the one install line (Python 3.10 or later; no Git for the `pip` ones), the command and where its output goes. Then load the output in the viewer: a level (`.glb`) with **Background / level -> 3D model...**, a table or match (`.3dheat`, `.parquet`, `.csv`) with **Source -> Files...** (and the **Match** tab's **Load match files...** for scoreboards and rounds).

| Game | Tool | Makes |
|---|---|---|
| Battlefield 6, 4, 1 | [3DHeat-Ext-Battlefield](https://github.com/Holdi601/3DHeat-Ext-Battlefield#quick-start-for-new-users) | levels |
| Counter-Strike 2 | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#quick-start-for-new-users) | matches from demos, maps |
| War Thunder | [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#quick-start-for-new-users) | matches from replays, levels |
| World of Tanks / World of Warships | [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#quick-start-for-new-users), [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#quick-start-for-new-users) | matches from replays |
| Rainbow Six Siege | [3DHeat-Ext-R6](https://github.com/Holdi601/3DHeat-Ext-R6#quick-start-for-new-users), [3DHeat-Ext-R6-Maps](https://github.com/Holdi601/3DHeat-Ext-R6-Maps#quick-start-for-new-users) | matches from replays, maps |
| Dota 2 | [3DHeat-Ext-DotaReplay](https://github.com/Holdi601/3DHeat-Ext-DotaReplay#quick-start-for-new-users), [3DHeat-Ext-Dota](https://github.com/Holdi601/3DHeat-Ext-Dota#quick-start-for-new-users) | matches from replays, the map |
| Squad | [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#quick-start-for-new-users) | matches from server demos |
| League of Legends, VALORANT | [3DHeat-Ext-Riot](https://github.com/Holdi601/3DHeat-Ext-Riot#quick-start-for-new-users) | match numbers from replays |
| DCS World, IL-2 Great Battles | [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS#quick-start-for-new-users), [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2#quick-start-for-new-users) | terrains |
| Arma Reforger | [3DHeat-Ext-Reforger](https://github.com/Holdi601/3DHeat-Ext-Reforger#quick-start-for-new-users) | worlds |
| Forza, BeamNG.drive, Assetto Corsa Rally | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#quick-start-for-new-users) records laps; [3DHeat-Ext-Forza](https://github.com/Holdi601/3DHeat-Ext-Forza#quick-start-for-new-users), [3DHeat-Ext-BeamNG](https://github.com/Holdi601/3DHeat-Ext-BeamNG#quick-start-for-new-users), [3DHeat-Ext-ACRally](https://github.com/Holdi601/3DHeat-Ext-ACRally#quick-start-for-new-users) build the course round them | laps, courses |
| Many games, in the background | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher#quick-start-for-new-users) | sessions from telemetry, logs and replays |
| Unreal and other engines | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter#quick-start-for-new-users), [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles#quick-start-for-new-users) | levels |

Every tool says when a newer release is out and offers to update itself.

## Features

| Feature | What it does |
|---|---|
| [Getting data in](https://holdi601.github.io/3DHeat/getting-data-in.html) | CSV, Parquet, Tacview ACMI, converted replays and [`.3dheat` match files](https://holdi601.github.io/3DHeat/container.html); one file, a folder tree, or [thousands of matches at once](https://holdi601.github.io/3DHeat/many-matches.html); columns recognised by themselves |
| [Heat modes](https://holdi601.github.io/3DHeat/heat-modes.html) | heat, difference of two sides, team heat, line heat; [directional heat](https://holdi601.github.io/3DHeat/directional-heat.html) (wedges, arrow fields, polar charts); heat [weighed by value](https://holdi601.github.io/3DHeat/value-weighting.html) |
| [Filters](https://holdi601.github.io/3DHeat/filters.html) | event type, player or AI, vehicle class, value and any column, applied on the GPU |
| [Volumes](https://holdi601.github.io/3DHeat/volumes.html) | draw shapes in 3D, count and export what is inside, compare places side by side; [breakdown](https://holdi601.github.io/3DHeat/breakdown.html) of who and what does best where |
| [Insights](https://holdi601.github.io/3DHeat/insights.html) | detectors for strong positions, deadly ground, spawn traps, chokes and standout players, with the evidence; a debrief (built-in or by an AI you choose); a caster; the [knowledge lens](https://holdi601.github.io/3DHeat/knowledge.html); [mass analysis](https://holdi601.github.io/3DHeat/mass-analysis.html) |
| [Match replay](https://holdi601.github.io/3DHeat/match-replay.html) | each unit as the [figure](https://holdi601.github.io/3DHeat/figures.html) of what it is; NATO and Russian symbols; missiles, tracers, decoys; hit marks, wrecks, fires, turrets; objectives; Tacview-style cameras and tactical display |
| [Levels](https://holdi601.github.io/3DHeat/levels.html) | map images, 3D levels with simplification, a world backdrop with real terrain |
| [Timeline](https://holdi601.github.io/3DHeat/timeline.html) | play, pause, rewind and speed; a time window over the data |
| [Hit analysis](https://holdi601.github.io/3DHeat/hit-analysis.html) | the Vehicles tab: where each unit was hit, by whom and with what |
| [Match analysis](https://holdi601.github.io/3DHeat/match-analysis.html) | Counter-Strike 2 scoreboards, rounds and economy |
| [Camera path and video](https://holdi601.github.io/3DHeat/camera-path-and-video.html) | fly a recorded path and render it to a video |
| [Race analysis](https://holdi601.github.io/3DHeat/race-analysis.html) | laps of racing games compared corner by corner |
| [Tactics board](https://holdi601.github.io/3DHeat/tactics-board.html) | plans on a level in steps that play |
| [Settings](https://holdi601.github.io/3DHeat/settings.html) | 40 languages, metric / imperial / aviation / nautical units, help mode, keys that keep a session safe |
| [Performance](https://holdi601.github.io/3DHeat/rendering-internals.html) | GPU-first drawing, memory budgets, automated visual checks for zoom, flicker and jitter |

## Related repositories

The viewer reads data; these tools make it. Each is a public repository under the MIT licence, pinned under `exporters/` as a git submodule. Each game reader is its own small project with its own licence file, releases and issue tracker, so it can be installed, updated, maintained - or withdrawn on a rights holder's request - on its own, without affecting the viewer or the other tools.

| Repository | What it does | Useful for | Documentation |
|---|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Reads courses and levels out of the archives games ship (Forza Horizon, BeamNG, Assetto Corsa Rally; Unreal, Unity, Frostbite and Source 2 readers) as glTF | a 3D level under your heat or replay | [site](https://holdi601.github.io/3DHeat-GameFiles/) |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Records lap telemetry from the interfaces racing games publish, and rebuilds levels from gameplay video | laps for Race analysis; a level where no files can be read | [site](https://holdi601.github.io/3DHeat-GameCapture/) |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Unreal Editor plugin that exports a level as one glTF file | levels of your own Unreal projects | [site](https://holdi601.github.io/3DHeat-UnrealExporter/) |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Counter-Strike 2 demos into heatmap tables and match summaries, CS2 maps into geometry | CS2 heat, replays and the Match tab | [site](https://holdi601.github.io/3DHeat-CS2/) |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Records your play in the background from what games publish: telemetry, game-state integrations, logs, replays | your own statistics without doing anything by hand | [site](https://holdi601.github.io/3DHeat-Watcher/) |

Optional converters, under `exporters/ext/`, each its own project:

| Repository | What it does | Useful for | Documentation |
|---|---|---|---|
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
| [3DHeat-Ext-Battlefield](https://github.com/Holdi601/3DHeat-Ext-Battlefield) | Battlefield 6 levels from your own install as 3D levels: terrain, every placed mesh, the backdrop, and on request colour maps, roads and walkable surfaces | Battlefield matches on their real level | [site](https://holdi601.github.io/3DHeat-Ext-Battlefield/) |
| [3DHeat-Ext-BeamNG](https://github.com/Holdi601/3DHeat-Ext-BeamNG) | BeamNG.drive courses from your own install round your lap: ground with its baked texture, roads, kerbs, barriers, signs, buildings and water | BeamNG laps on the real road in Race analysis | [site](https://holdi601.github.io/3DHeat-Ext-BeamNG/) |
| [3DHeat-Ext-ACRally](https://github.com/Holdi601/3DHeat-Ext-ACRally) | Assetto Corsa Rally stages from your own install round your run: road and terrain in the game's baked colours, barriers, signs and buildings | rally runs on the real stage in Race analysis | [site](https://holdi601.github.io/3DHeat-Ext-ACRally/) |
| [3DHeat-Ext-Reforger](https://github.com/Holdi601/3DHeat-Ext-Reforger) | Arma Reforger worlds from your own install as 3D levels: terrain in its ground colours, the sea, every placed building and object as a box | Arma Reforger recordings on their world | [site](https://holdi601.github.io/3DHeat-Ext-Reforger/) |
| [3DHeat-Ext-R6](https://github.com/Holdi601/3DHeat-Ext-R6) | Rainbow Six Siege Match Replays (`.rec`) to matches: every player's position, operators as picked, loadouts, kills, plants and defuses, callouts, marks on the level | Siege heat, replays and the Match tab | [site](https://holdi601.github.io/3DHeat-Ext-R6/) |
| [3DHeat-Ext-R6-Maps](https://github.com/Holdi601/3DHeat-Ext-R6-Maps) | Rainbow Six Siege maps from your own installation as 3D levels: floors, stairs and walls in the replays' frame, each breakable object as its own part | Siege replays on the real building, floor by floor | [site](https://holdi601.github.io/3DHeat-Ext-R6-Maps/) |

## Developing

`npm run dev`, `npm run build`, `npm test`, `npm run smoke` and `npm run check:visual`; every script and the source layout are on the [documentation's home page](https://holdi601.github.io/3DHeat/#install-and-run). The docs' reference pages and pictures are regenerated with `node tools/docs-refs.mjs` and `node tools/docs-shots.mjs`; see [Maintaining the docs](https://holdi601.github.io/3DHeat/maintaining.html). Changes: [CHANGELOG.md](CHANGELOG.md).

## Licence

3DHeat and all its tools are MIT licensed ([LICENSE](LICENSE)). Every third-party component and its licence: [LICENSES.md](LICENSES.md).
