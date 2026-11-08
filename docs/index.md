---
title: Home
nav_order: 1
---

# 3DHeat

3DHeat is a realtime 3D telemetry viewer that runs in the browser. It loads positional data - CSV, Parquet and Tacview ACMI recordings, a single file, several files or a whole folder tree, tens of millions of rows - and shows it as a heatmap you can fly through, as moving boxes on a timeline, as lines along the routes people took, or as a comparison of two populations. Beside the heatmap it has a race analysis tab that compares laps of a racing game, and a match tab for Counter-Strike 2 match summaries.

It draws on the graphics card through **WebGPU** where the browser offers it and falls back to **WebGL2** otherwise. Nothing is uploaded anywhere: files are read by the browser from your disk, and the only server involved is the small local development server that `start.bat` runs.

## The tabs

The tabs sit at the top of the sidebar, under the name and the language menu.

| Tab | What it is for | Documentation |
|---|---|---|
| **Heatmap** | Any positional table: heat, difference, team heat, line heat and box replay over a timeline, with filters, levels, slicing, measuring and video rendering. | Most of this site, starting at [Getting data in](getting-data-in.md) |
| **Race analysis** | Two or more laps of one course: where time is lost, why, and what to change; replay of the cars. Shares the canvas, camera and level with the heatmap and nothing else. | [Race analysis](race-analysis.md), the method in [Race analytics](race-analytics.md), other games in [Other racing games](other-games.md) |
| **Match** | Counter-Strike 2 match summaries: scoreboards, rounds, economy; each linked to the heatmap through its filters. | [Match analysis](match-analysis.md) |
| **Tactics** | Plans on a level: figures, routes, thrown utility, areas and notes in steps that play; for CS2, Valorant, Battlefield, Squad, Arma and the flight and vehicle games. | [Tactics board](tactics-board.md) |

The three tabs share one canvas and one camera. The Heatmap and Match tabs also share the dataset, the view mode, the [filters](filters.md) and the [level](levels.md).

## Install and run

### Windows, the easy way

The repository root holds three batch files.

| File | What it does |
|---|---|
| `start.bat` | Starts the viewer. Finds Node.js even when it is not on `PATH` (it looks in `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` and `%LOCALAPPDATA%\Programs\nodejs`), and when Node.js is missing it offers to install the LTS release with `winget install -e --id OpenJS.NodeJS.LTS`. On first run it asks before downloading the dependencies (about 300 MB into `node_modules\` inside the folder, nothing system-wide). It refuses to start when something already listens on port 5273, and points at `restart.bat` instead. When the folder is a git checkout with no local changes it updates itself first (see [Updates](updates.md)). Then it runs the dev server on `http://127.0.0.1:5273/` and opens the browser. **The window is the server**: leave it open, close it or press Ctrl+C to stop. |
| `restart.bat` | Runs `stop.bat quiet`, then `start.bat`. Only needed after changing `vite.config.ts`, adding a dependency, or when the server has wedged - source edits are hot-reloaded. |
| `stop.bat` | Stops whatever listens on port 5273, by process id found through `netstat`, never by image name, so other Node.js processes on the machine are left alone. Waits about two seconds for the socket to be released. With the argument `quiet` it does not pause at the end. |

### By hand (any OS)


```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

The `exporters/` folder holds the separate data tools as git submodules, each its own repository; after a plain clone run `git submodule update --init`. The viewer itself does not need them to run. `exporters/ext/` holds the optional replay converters (War Thunder, World of Tanks, World of Warships, Squad), kept apart so that a problem with one of them affects nothing else.

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

**Heatmap tab**

- [Getting data in](getting-data-in.md) - [loading files](loading-files.md), [converters keep everything](converters.md), [column mapping](column-mapping.md), [axes, units and time](axes-units-and-time.md), [sessions, persons and groups](sessions-persons-groups.md), [the synthetic generator](synthetic-generator.md), [memory and budgets](memory-and-budgets.md)
- [Heat modes](heat-modes.md) - [heat](heat.md) with [sprite shape](sprite-shape.md), [colour and exposure](colour-and-exposure.md) and [depth and culling](depth-and-culling.md); [difference](difference.md), [team heat](team-heat.md), [line heat](line-heat.md), [box replay](box-replay.md)
- [Timeline and playback](timeline.md)
- [Filters and tools](filters-and-tools.md) - [filters](filters.md), [teams list](teams-list.md), [entities](entities.md), [slice](slice.md), [measure](measure.md)
- [Levels and background geometry](levels.md) - [map images](map-images.md), [3D levels](model-levels.md), [level appearance](level-appearance.md), [level library](level-library.md)
- [Camera and controls](camera.md) - [gamepad and HOTAS](gamepad.md), [keyboard and mouse reference](keyboard-reference.md)
- [Camera path and video](camera-path-and-video.md)
- [Rendering internals](rendering-internals.md) - [backends](backends.md), [accumulation](accumulation.md), [sampling and budgets](sampling-and-budgets.md), [half-float accumulation](half-float-accumulation.md), [GPU memory residency](gpu-memory.md), [software rendering](software-rendering.md), [performance panel and stats](performance-and-stats.md)
- [Data formats reference](data-formats.md)

**The other tabs and the viewer as a whole**

- [Race analysis](race-analysis.md) and its method, [Race analytics](race-analytics.md); [Other racing games](other-games.md)
- [Match analysis](match-analysis.md)
- [Languages](languages.md)
- [Updates](updates.md)

The tools that produce data for the viewer - lap recorders, level extractors, the CS2 demo converter, the background watcher - are separate public projects with their own documentation, listed in the repository's [README](https://github.com/Holdi601/3DHeat/blob/main/README.md).

## Source layout, briefly

| Folder | Contents |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | File picking, CSV and Parquet ingest, auto-mapping, validation, memory model, dataset builder, model parsing, classification, simplification, level library |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | The frame loop (`engine.ts`), sampling, both backends, camera, gamepad, measure, camera path, video recording |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | The application state (`store.ts`) with every default, the domain types (`types.ts`), the sprite curve |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | The sidebar panels, timeline, overlays |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | The Race analysis and Match tabs |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Translations |
