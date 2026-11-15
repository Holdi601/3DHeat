# 3DHeat

3DHeat shows where things happened in a game - where players went, fought and fell - as **glowing colours you can fly through**, or as **little 3D figures that replay the match**, and it finds what stands out by itself. It handles millions of rows and thousands of matches, in the browser, on the graphics card (WebGPU, or WebGL2).

![Heat of ten tank matches over a demo valley](docs/assets/img/en/heat-hero.webp)

**Documentation, with pictures and step-by-step guides: <https://holdi601.github.io/3DHeat/>**

No game data comes with it. Levels, maps and recordings are made on your own machine with the [related tools](#related-repositories), from games you own. Nothing you load is uploaded anywhere.

## Quick start

1. Install [Node.js](https://nodejs.org/) (LTS) and use a Chromium browser (Chrome or Edge) with hardware acceleration on; see [browser and GPU requirements](https://holdi601.github.io/3DHeat/#browser-and-gpu-requirements).
2. Get the viewer and start it - the server keeps running in its window:
   ```bash
   git clone --recursive https://github.com/Holdi601/3DHeat.git
   cd 3DHeat
   npm install
   npm run dev                  # open http://127.0.0.1:5273
   ```
   On Windows, `start.bat` does this: it finds or installs Node.js, installs the dependencies, offers updates when there are any, and opens the browser.
3. Make some made-up demo data: `node tools/demo-data.mjs` (in a second window). It lands in `tools/.shots/demo/`.
4. In the viewer: **Background / level → 3D model…** and pick `demo-valley.glb`, then **Source → Files…** and pick `tanks.parquet` from the same folder (or drop it on the Source panel).

The [demo data](https://holdi601.github.io/3DHeat/demo-data.html) page takes it from there.

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

The viewer reads data; these tools make it. Each is a public repository under the MIT licence, pinned under `exporters/` as a git submodule.

| Repository | What it does | Useful for |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Reads courses and levels out of the archives games ship (Forza Horizon, BeamNG, Assetto Corsa Rally; Unreal, Unity, Frostbite and Source 2 readers) as glTF | a 3D level under your heat or replay |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Records lap telemetry from the interfaces racing games publish, and rebuilds levels from gameplay video | laps for Race analysis; a level where no files can be read |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Unreal Editor plugin that exports a level as one glTF file | levels of your own Unreal projects |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Counter-Strike 2 demos into heatmap tables and match summaries, CS2 maps into geometry | CS2 heat, replays and the Match tab |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Records your play in the background from what games publish: telemetry, game-state integrations, logs, replays | your own statistics without doing anything by hand |

Optional converters, under `exporters/ext/`, kept apart so a problem with one affects nothing else:

| Repository | What it does | Useful for |
|---|---|---|
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | War Thunder replays (`.wrpl`) to tables: air and ground tracks, shots, hits, kills, turrets, objectives | War Thunder replays, hit marks and insights |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | World of Tanks replays to tables: every vehicle's position, deaths and kills | World of Tanks heat and replays |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | World of Warships replays to tables: every ship's position and sinkings | World of Warships heat and replays |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Squad server demos to tables: every player's position, team and squad | Squad heat and replays |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | DCS World terrains from your own install to levels: ground, roads, towns, airfields, fields, water | DCS and Tacview recordings on their real terrain |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | IL-2 Great Battles maps into levels | IL-2 recordings on their map |

## Developing

`npm run dev`, `npm run build`, `npm test`, `npm run smoke` and `npm run check:visual`; every script and the source layout are on the [documentation's home page](https://holdi601.github.io/3DHeat/#install-and-run). The docs' reference pages and pictures are regenerated with `node tools/docs-refs.mjs` and `node tools/docs-shots.mjs`; see [Maintaining the docs](https://holdi601.github.io/3DHeat/maintaining.html). Changes: [CHANGELOG.md](CHANGELOG.md).

## Licence

The viewer (everything outside `exporters/`) is proprietary, all rights reserved; its source is public to read. The tools are MIT. Details and every third-party component: [LICENSES.md](LICENSES.md).
