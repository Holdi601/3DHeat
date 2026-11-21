---
title: The native app
parent: "Reference"
nav_order: 20
---

# The native app

3DHeat also runs as a desktop app. It is the same viewer, with every feature of the browser version, in a window of its own. Behind it sits a native core that reads your files with every core of the machine and has the machine's whole memory to work with.

The app is new (Stage 2a of the native version). Today the core does the reading; the heat is still drawn by the viewer in the window, exactly as in the browser. A native viewport comes later.

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

## Measured

On a 16-core PC (32 threads) with 61 GB of memory, on the synthetic 10-million-row tables of the row-ceiling probe (x, y, z, time, player, team), while other work shared the machine:

| Rows | Browser (Chromium tab) | App, the page building the dataset | Core alone, to the engine's chunk layout |
|---|---|---|---|
| 100 million | 13 to 17 s, 8 GB | 19 s, 10 GB | **3.8 s**, 6.4 GB (read 1.6 s, sort 0.9 s, lifetimes 0.25 s, packing 0.45 s) |
| 400 million | no result within 10 minutes (the tab's memory ceiling) | does not fit the page | **16 s**, 18.5 GB |

Moving bytes from the core into the page: about 0.6 GB/s through the app's loopback server (what the app uses), 1.3 GB/s through WebView2 shared memory, 0.1 GB/s through a custom URL scheme.

What this means today: the core reads, sorts and packs four to five times faster than the browser and is not limited by a tab's memory, but in the app the page still builds the dataset the engine draws from, so a load is as fast, and as limited, as in the browser. The gain reaches the screen once the engine takes the core's packed chunks directly and frees its own copies after upload, and once the native viewport draws them.

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
| `crates/core` | the readers, the parallel sort, the engine's chunk layout and the request handler. No Tauri in it. `cargo test -p heat3d-core` |
| `crates/session` | the multiplayer session server (roles, waiting room, presence, the shared layers' op log); its messages are in `proto/heat3d/session/v1` |
| `crates/server` | the data API over HTTP and WebSocket, the window's loopback server, and `3dheat serve` (session plus data API, headless) |
| `crates/app-tauri` | the desktop app (`3DHeat`), a thin layer: the window, loaded from its own loopback server (`/v1` with a key only the window gets), the file handover, and the server embedded |

`vectors/` holds `.3dheat` test files read by both the TypeScript and the Rust reader.

Building:

```
npm ci && (cd native && npm ci && npm run icons)
cd native && npx tauri build
```

The installers land in `target/release/bundle/` (NSIS and MSI on Windows, AppImage and deb on Linux). `node native/tools/smoke-shell.mjs` starts the built app (`3dheat-app.exe` in the build folder), picks a synthetic Parquet file, loads it through the core and checks that the heat draws.
