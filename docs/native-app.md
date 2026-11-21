---
title: The native app
parent: "Reference"
nav_order: 20
---

# The native app

3DHeat also runs as a desktop app. It is the same viewer, with every feature of the browser version, in a window of its own. Behind it sits a native core that reads your files with every core of the machine and has the machine's whole memory to work with.

The app is new (Stage 2c of the native version). Today the core reads the files and, for Parquet tables, builds the whole dataset; the heat is still drawn by the viewer in the window, from chunks the core packed. A native viewport comes later.

## System requirements

| System | Requirement |
|---|---|
| Windows | Windows 10 or 11, 64-bit, with the Microsoft Edge WebView2 runtime (the installer fetches it when missing) |
| Linux | 64-bit, **a Wayland session**. X11 is not supported: the app refuses to start without `WAYLAND_DISPLAY` |

## What the core does

When you pick or drop files, they open in the viewer as always. On Windows the viewer also hands them to the core, which then reads them in place:

| Format | What the core does |
|---|---|
| Parquet (and the tables in a `.3dheat` file) | reads the columns the load plan kept, one row group per core, with the row pre-filter applied while reading |
| CSV and other delimited text | scans the file in parallel pieces, with the row pre-filter and the row step |
| Tacview ACMI (text and zipped) | parses the recording |
| `.3dheat` | opens the container and reads its tables in place |

The core gives the viewer exactly what the viewer's own readers would have built. This is checked by tests that compare both on the same inputs. A file the core does not read (an unusual Parquet type, a file made inside the viewer) is read by the viewer as in the browser, and the console says why.

On Linux the viewer reads its files itself for now.

### Datasets built by the core

A load of Parquet tables (plain or in `.3dheat` files) goes further: the core builds the whole dataset, not just its columns. It merges the files, puts the rows in time order, measures the extent, builds the roster, the sessions and each row's lifetime, and packs the GPU chunks the engine draws from, all with every core. The viewer then takes over:

- **the columns**, without a copy: the core writes them into memory the window shares with it (WebView2 shared buffers), and from then on core and viewer read the same memory;
- **the GPU chunks**, already packed: the engine writes them to the GPU a slice a frame, as it does with its own, and gives each chunk's bytes back as soon as it is on the GPU;
- **columns left in the files** (the load plan's "read when needed"): the core reads them when the view asks, and keeps them; the viewer drops its copy when memory is short and asks again.

Past 200 million rows the viewer keeps every k-th row (say every 2nd of 400 million): tracks, replay, picking and the analyses work on that copy, while the heat on the GPU draws every row. Filters reach every row too; their columns come from the core a chunk at a time. The difference split's column, the value weight, the route heat and the direction wedges work on the viewer's copy only for such a load, and are not drawn over all rows yet.

The core builds exactly what the viewer's own build would have: tests compare both on shared inputs (`native/vectors/build`), and the app's smoke run compares both in the app. A load whose columns the viewer derives further columns from (an event type, a vehicle name, a cost or an AI flag; see the canonical and value columns) is built by the viewer, with the core reading the files as above, and so is any load with a file in another format. The console says which way a load went.

## Measured

On a 16-core PC (32 threads) with 61 GB of memory and an RTX 5080 (16 GB), on the synthetic 10-million-row tables of the row-ceiling probe (x, y, z, time, player, team; eight more measures left to be read when needed), while other work shared the machine (`native/tools/probe-native-load.mjs`, each load twice):

| Rows | Browser (Chromium tab) | App, the page building the dataset (Stage 2a) | App, the core building it (Stage 2c) |
|---|---|---|---|
| 100 million | 13 to 17 s, 8 GB | 19 s (42 s on the day the 2c numbers were taken), page 7 to 10 GB | **10 to 12 s** until every row is on the GPU, the dataset ready after 4.6 to 5.4 s; page 0.7 GB, core 3.9 to 5.4 GB at its peak and 0.85 GB after |
| 400 million | no result within 10 minutes (the tab's memory ceiling) | does not fit the page | **32 to 40 s** until all 400 million rows are on the GPU, the dataset ready after 16 to 19 s; page 0.6 GB, core 15 to 17.7 GB at its peak |
| 1 billion | | | not measured: it needs about 40 GB free, and the machine had about 20 |

The 400-million-row loads ran with the page's copy at 100 million rows (every 4th row, `heat3d.nativePageRows`), since the machine had only about 20 GB free; the default of 200 million adds about 3 GB of shared memory.

Frame times with the camera moving and the timeline playing, once loaded: p99 19 ms at 100 million rows, 21 to 23 ms at 400 million (p50 16.7 ms, the display's 60 Hz). Single frames of up to 69 ms happened on the shared machine, at 100 million rows as on the page's own path before.

The core's own share: at 100 million rows reading 2.1 s, merging 0.8 s, sorting 1.6 s, lifetimes 0.2 s; at 400 million reading 7 to 8 s, sorting 6.5 to 7 s. Alone (`heat3d-ingest --dataset`), 400 million rows build and pack in 18 s at a peak of 16 GB. What follows the build is the GPU upload: the engine writes the chunks a slice a frame, about 0.3 to 0.5 GB/s, so that no frame waits for it, while the chunks already there draw.

"Page" is the window's own memory (its private bytes). The columns the page took over are in memory it shares with the core, counted once, in neither; at 100 million rows that is about 3 GB. Every row's chunk bytes are given back as soon as they are on the GPU.

Moving bytes from the core into the page: about 0.6 GB/s through the app's loopback server, 1.1 to 1.3 GB/s through WebView2 shared memory (what the app uses for columns and chunks), 0.1 GB/s through a custom URL scheme. A shared buffer holds at most 2 GiB, which is one reason the page's copy stops at 200 million rows.

What limits a load now: the core's memory (about 40 bytes a row at its peak), and the GPU budget (12 bytes a row of chunks), both of them what the machine has free (see below). The page no longer does.

## Memory budget

The app budgets what the machine has free, not a fixed share of it, and reads it again every five seconds:

| | What the app reads | The budget |
|---|---|---|
| Graphics card | Windows: the OS's budget for one program (DXGI `QueryVideoMemoryInfo`), and what every program and the app itself hold on the card (the "GPU Adapter Memory" and "GPU Process Memory" counters). Linux: the Vulkan driver's budget (`VK_EXT_memory_budget`), else the card's size | the card, or the OS's budget where lower, less what other programs hold, less 1 GB or 5 % of the card (whichever is more), less what the app holds besides its rows (the level, the render targets) |
| System memory | installed, and available now | what is free less 5 % of the machine (at least 2 GB, at most 4 GB); the rows already loaded count as free |

A budget you left at the detected figure follows the machine; one you chose under Resource budgets stays. The GPU figure the system allows now caps either: when another program takes memory on the card, the budget drops within seconds, and the app gives rows back, one chunk at a time between frames (the least recently drawn first: those outside the time window, then the latest), never in a frame. Those rows then show as not resident, as for a load larger than the budget; loading again brings them back. A choice above what the system allows applies again once the other program gives its memory back.

The page's copy of a load the core built follows free memory too: about 30 bytes a row for the page beside about 40 for the core, at most 200 million rows (`heat3d.nativePageRows` sets it by hand).

The Memory panel shows the reading: the card, what the system allows, what other programs and 3DHeat hold, what is kept free, what the rows may use, the system memory, and how long ago it was read. In the browser the dev server reports the system memory and the card's size once; Re-detect reads them again.

## Letting others in: `3dheat serve`

The app and the browser version host multiplayer sessions with one server, `3dheat serve` ([Multiplayer](multiplayer.md)). It serves the web viewer, runs the session, and answers the native core's data API at `/v1`, so a session's browsers read the host's shared data through the host's core:

```
3dheat serve --web dist --password-env HEAT3D_SESSION_PASSWORD     # headless (built from native/crates/server)
3dheat-app serve --password-env HEAT3D_SESSION_PASSWORD            # the same, from the installed app
3dheat-app --host --password-env HEAT3D_SESSION_PASSWORD           # the app's window, and a session beside it
```

Beside the window, the session uses the same core as the window: what the host loaded, the session can serve. A browser from another machine can only use files the host shared, never name a path on the host.

## For developers

Everything lives in `native/`, a Rust workspace:

| Crate | What it is |
|---|---|
| `crates/proto` | the protocol between a viewer and a core (`proto/heat3d/v1/heat3d.proto`), generated for Rust at build time; `npm run proto` in `native/` generates the TypeScript side into `src/data/native/gen` |
| `crates/core` | the readers, the parallel sort, the dataset build (`build.rs`: everything the viewer's build does after reading), the built datasets held by handle (`dataset.rs`: columns, chunks packed on request, columns read on demand), and the request handler. No Tauri in it. `cargo test -p heat3d-core` |
| `crates/session` | the multiplayer session server (roles, waiting room, presence, the shared layers' op log); its messages are in `proto/heat3d/session/v1` |
| `crates/server` | the data API over HTTP and WebSocket, the window's loopback server, and `3dheat serve` (session plus data API, headless) |
| `crates/app-tauri` | the desktop app (`3DHeat`), a thin layer: the window, loaded from its own loopback server (`/v1` with a key only the window gets), the file handover, and the server embedded |

`vectors/` holds test inputs both sides are held to: `.3dheat` files read by the TypeScript and the Rust reader (`container/`), and Parquet loads built by the viewer's build and by the core's (`build/`: `node native/vectors/make-build-vectors.mjs` makes the files, `UPDATE_VECTORS=1 npx vitest run src/data/native/buildVectors.test.ts` writes what the viewer builds of them, `cargo test -p heat3d-core --test build_vectors` checks the core against it).

Building:

```
npm ci && (cd native && npm ci && npm run icons)
cd native && npx tauri build
```

The installers land in `target/release/bundle/` (NSIS and MSI on Windows, AppImage and deb on Linux). `node native/tools/smoke-shell.mjs` starts the built app (`3dheat-app.exe` in the build folder), picks a synthetic Parquet file, loads it through the core and checks that the heat draws, then builds two of the shared vectors' loads both ways (core and viewer) and checks every column is the same. `node native/tools/probe-native-load.mjs --dir <row-ceiling folder> --rows 100,400` measures loads in the app: time until every row is on the GPU, the page's and the core's memory, and frame times under camera motion with the timeline playing (`--path page` for the viewer building the dataset, as before).
