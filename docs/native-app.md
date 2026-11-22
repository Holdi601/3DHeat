---
title: The native app
parent: "Reference"
nav_order: 20
---

# The native app

3DHeat also runs as a desktop app. It is the same viewer, with every feature of the browser version, in a window of its own. Behind it sits a native core that reads your files with every core of the machine and has the machine's whole memory to work with.

The app is new (Stage 2c of the native version). Today the core reads the files and, for Parquet tables, builds the whole dataset; the heat is drawn by the viewer in the window, from chunks the core packed. A native viewport, where the app draws the view itself, is in preview behind a setting (see [Native viewport (preview)](#native-viewport-preview)).

## System requirements

| System | Requirement |
|---|---|
| Windows | Windows 10 (version 1809 or later) or 11, 64-bit, with the Microsoft Edge WebView2 runtime (the installer fetches it when missing), and a graphics card with a DirectX 12 driver |
| Linux | 64-bit, **a Wayland session**, and a Vulkan driver. X11 is not supported: the app refuses to start without `WAYLAND_DISPLAY`, and says so in a dialog |

## Downloads

Each release on the [releases page](https://github.com/Holdi601/3DHeat/releases) carries:

| File | What it is |
|---|---|
| `3DHeat_<version>_x64-setup.exe` | Windows: the app's installer (for the current user, no administrator rights) |
| `3DHeat_<version>_x64_en-US.msi` | Windows: the app as an MSI package, for managed installs |
| `3DHeat_<version>_amd64.AppImage` | Linux: the app in one file, with what it can bundle (WebKitGTK, the Vulkan loader); updates itself |
| `3DHeat_<version>_amd64.deb`, `3DHeat-<version>-1.x86_64.rpm` | Linux: the app as a package for apt (Debian, Ubuntu) or dnf/zypper (Fedora, openSUSE) |
| `3dheat-server-<version>-windows-x64.zip` | Windows: the headless server, portable (unpack and run) |
| `3dheat-server-<version>-linux-x64.tar.gz`, `...-linux-arm64.tar.gz` | Linux: the headless server, portable |
| `3dheat-server_<version>_amd64.deb`, `..._arm64.deb` | Linux: the headless server as a package, with a systemd unit installed **disabled** |
| `SHA256SUMS` | the SHA-256 of every file above |
| `*.sig`, `latest.json` | the updater's signatures and manifest |

Check a download with `sha256sum -c SHA256SUMS --ignore-missing` (Linux) or `Get-FileHash <file>` (Windows, compare with its line).

The server's packages hold the program and the web viewer it serves (`dist/`, beside the program; `/usr/share/3dheat/dist` in the .deb). The .deb's service (`3dheat.service`) runs as its own unprivileged user with its state in `/var/lib/3dheat`; its options go in `/etc/default/3dheat`, and it starts only after `sudo systemctl enable --now 3dheat`.

### As a container

`native/packaging/docker/` holds a `Dockerfile` for the server with the web viewer, and an example `compose.yaml`. The image runs as an unprivileged user (65532) on a read-only filesystem, keeps its state in the `/state` volume, and has a health check (`3dheat healthcheck`). It is not in a registry yet: build it from the repository root,

```
docker build -f native/packaging/docker/Dockerfile -t 3dheat-server:local .
HEAT3D_SESSION_PASSWORD=... docker compose -f native/packaging/docker/compose.yaml up -d
```

and take the Host address from `docker compose ... logs`. The release workflow builds the image for amd64 and arm64 and keeps it as a workflow artifact (`docker load < 3dheat-server-<version>-docker-<arch>.tar.gz`).

## What the installers check

| Where | Checked | When something is missing |
|---|---|---|
| Windows installer (NSIS) | 64-bit Windows 10 1809 or later | says so and installs nothing |
| | the WebView2 runtime | installs it (Microsoft's bootstrapper, embedded in the installer) |
| | the graphics card: a DirectX 12 device, Vulkan, the memory (`3dheat-app --check-requirements`, once the files are in place) | says what is missing, with the card maker's driver page. Drivers cannot be installed by 3DHeat |
| MSI | 64-bit Windows 10 or 11, the WebView2 runtime | as above; the card is checked at the first start |
| .deb and .rpm | WebKitGTK 4.1, GTK 3, the Vulkan loader (`libvulkan1` / `vulkan-loader`) as dependencies; Mesa's Vulkan drivers recommended | the package manager installs them |
| AppImage | bundles WebKitGTK and the Vulkan loader; the driver must be the system's | checked at the first start |

The Visual C++ runtime is linked into both programs (`3dheat-app.exe` and `3dheat.exe`), so no Visual C++ redistributable is needed; what they use besides is the Universal CRT, which Windows 10 and 11 ship. The release workflow checks this with `dumpbin /dependents`.

**The system check.** At its first start (once per version), the app checks the machine and opens its system check page when anything is missing: Windows and WebView2, or the Wayland session; the graphics card with DirectX 12 or Vulkan (a software-only Vulkan device counts as missing on Linux); the memory; and whether the window gets a WebGPU adapter. Each line says what was found, and **Fix** opens the page that fixes it: the card maker's driver page (NVIDIA, AMD, Intel), the WebView2 download, Windows Update, or the Linux notes below. Settings › **System check…** opens it again.

### Linux

The app runs on Wayland only (GNOME, KDE Plasma and most desktops offer a Wayland session at the login screen). It draws with Vulkan: install the loader and your card's Vulkan driver, for example `sudo apt install libvulkan1 mesa-vulkan-drivers` (Debian, Ubuntu) or `sudo dnf install vulkan-loader mesa-vulkan-drivers` (Fedora); NVIDIA's own driver brings its Vulkan driver with it. `vulkaninfo --summary` shows what the system offers.

**The server** checks what would stop it before it starts, and says so plainly: a port another program holds (`--port N` picks another), a port below 1024 that the user may not open, a `--bind` address that is not the machine's, `--cert`/`--key` files that are missing, unreadable or not PEM, and a `--web` folder without the web build.

## Updates

**The app asks before it updates.** It checks the releases on GitHub about 20 seconds after it starts and every six hours. When a newer version is out, a notice shows the version, an excerpt of its notes and three buttons: **Update now** (downloads it, checks its signature, installs it and starts again), **Later** (asks again at the next start), and **Skip this version** (not offered again; **Check now** in Settings offers it anyway).

With Settings › **Update automatically** on, the app updates without asking: it downloads the new version in the background, checks its signature, and installs it when the app closes, so a session in progress is never cut. The Windows installer and the AppImage update in place; a .deb or .rpm install is updated by the package manager, so there the notice opens the release page instead.

**The server asks too.** `3dheat serve` checks at start and every six hours, in the way the other 3DHeat tools do (one request to GitHub, the answer kept six hours, quiet when offline), and prints a notice: `[3dheat] 3DHeat 0.2.0 is out (this is 0.1.0). <release page>`. Then:

| Command | What it does |
|---|---|
| `3dheat --check-update` | says whether a newer release is out, with the first lines of its notes |
| `3dheat update` | asks `Update now? [Y/n]`, then updates the folder the program is in; `--yes` skips the question |
| `3dheat serve --auto-update` (or `"autoUpdate": true` in the server's `local.json`) | updates by itself when a newer release is out; the new version is used from the next start, so a running session is never cut |
| `3dheat serve --no-update-check` (or `"updateCheck": false`, or `HEAT3D_NO_UPDATE=1`) | no check at all |

Only the portable server (zip, tar.gz) updates itself. The .deb is updated by the package manager, and a container by its new image; for those there is only the notice.

**Signatures.** Every update is checked before it is installed: the app's updater and the server both verify the release's minisign signature (`.sig`) against the public key built into them, and refuse a package that does not match. The signatures are made on the maintainer's own machine; the private key is not on GitHub, not even as a secret. How a release comes about:

1. A version tag (or a manual run of the `release` workflow) builds every package above, unsigned, writes `SHA256SUMS`, and leaves everything in a **draft** release. The workflow never publishes.
2. The maintainer runs `native/tools/sign-release.ps1 -Tag v<version> -KeyFile <private key> -PasswordFile <password file>`: it downloads the draft, checks every file against `SHA256SUMS`, signs the Windows setup, the AppImage and the server archives, writes `latest.json` (the app updater's manifest: version, notes, and per platform the installer and its signature), and uploads those to the draft.
3. Publishing the draft (`gh release edit v<version> --draft=false`) is a separate, deliberate step. From then on the updaters offer the version.

The key pair is made once with `npx tauri signer generate -w <file>` (in `native/`); only its public half goes into the app (`plugins.updater.pubkey` in `tauri.conf.json`) and the server (`crates/server/src/update.rs`; a test keeps the two equal). Lose the private key and no update can be signed for the installed copies any more, so keep a backup of it offline.

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

## Native viewport (preview)

Settings > **Native viewport (preview)** lets the app draw the 3D view itself instead of the page. It is off by default, and it applies when the window loads again (the setting offers **Reload now**). Windows only for now.

With it on, the window has two layers. The app's own renderer draws into the window with the graphics card's native interface (Vulkan, with DirectX 12 as the fallback), and the page lies on top of it, transparent where the view is. Every panel, button and label is still the page, and the page still gets every click, drag and key: it moves the camera as before and sends each frame to the app, with the camera, the heat settings, the filters, the time window and the mode in it. The app draws that frame with the very shaders the page's WebGPU engine runs (the same WGSL, compiled by wgpu instead of the browser), so the picture is the same.

The rows of a load the core built go to the graphics card straight from the core: nothing of them passes through the page. A load the page built (CSV, Tacview, a mixed selection) is packed by the page and handed over chunk by chunk.

What the preview draws:

- the heat as points, binned on the GPU or splatted exactly as the web engine decides, in plain heat, team colours and the difference (by group, or split by a column), and heat weighed by a value column
- filters (any number, folded into one bit a row on the GPU; changing one moves no rows), the time window, lifetimes and their fade, the slice and the distance cut
- the accumulation across frames, the colour ramp, the floor and the response curve; the exposure reads the native heat
- a model level's ground (the mesh, relief, contours and its colours), the grid and the axes
- the box replay: units as their figures (each model sent to the app once, a slice a frame, then drawn instanced from the frame's positions) or as cubes with their look lines, the weapons and effects drawn on the figures, the trails, and the ruler's and probe's lines

What it does not draw yet: units placed on the graphics card (large recordings are placed on the processor instead, as on a card without that path) and the far-off symbols, structures and the wall layers that dim heat behind them, image levels, world tiles, line heat, direction wedges and arrows, the rate map, objectives, zones, spawn marks, depth of field, volume outlines and the other lines drawn over the finished picture. Those parts of the view are missing while the preview is on. The heat under the cursor is read from the viewport.

Measured on the PC above (`native/tools/probe-native-viewport.mjs`: the same app and the same load, once with the page's WebGPU engine, once with the native viewport), 10 million rows of the synthetic row-ceiling table, while another 3D program shared the graphics card:

| | Web engine (WebView2) | Native viewport |
|---|---|---|
| Heat field after converging (plain, team colours, a filter, a time window) | | identical: p50, p90 and p99 of the lit texels within 0.01 %, SSIM 1.000 |
| The picture | | 0.1/255 apart on average, 0.4 % of pixels by more than 8/255 (line edges) |
| Until every row is on the GPU | 1.3 s | 1.1 to 2.4 s |
| Frames with the camera turning and the timeline playing (p50 / p99 / max) | 16.7 / 17.3 / 17.9 ms | the page 16.7 / 18.1 / 19.2 ms, the viewport's presents 16.6 / 19.2 / 22.8 ms (DX12) and 16.8 / 23.4 / 24.4 ms (Vulkan), none past 25 ms |

The viewport presents each of the page's frames as it comes (mailbox), so the page's clock paces the view. With vsync of its own (Fifo) it fell into the 14/21 ms beat of this PC's mixed 60 and 144 Hz screens, and under Vulkan held a frame for four refreshes now and then. Loads of 100 million rows and more were not measured yet.

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

## The Library

`3dheat-app --library` opens the Library in a window of its own (the Start menu entry **3DHeat Library**); in the viewer, the Library button at the top of the side panel opens it over the view. It catalogues your replays, recordings, matches and levels, converts them with the installed converters, and opens them in 3DHeat: [The Library](library.md).

## For developers

Everything lives in `native/`, a Rust workspace:

| Crate | What it is |
|---|---|
| `crates/proto` | the protocol between a viewer and a core (`proto/heat3d/v1/heat3d.proto`), generated for Rust at build time; `npm run proto` in `native/` generates the TypeScript side into `src/data/native/gen` |
| `crates/core` | the readers, the parallel sort, the dataset build (`build.rs`: everything the viewer's build does after reading), the built datasets held by handle (`dataset.rs`: columns, chunks packed on request, columns read on demand), and the request handler. No Tauri in it. `cargo test -p heat3d-core` |
| `crates/library` | the Library ([The Library](library.md)): the SQLite catalogue of replays, recordings, matches and levels, the scanner and metadata readers, thumbnails, and the conversion queue that runs the installed converters. `cargo test -p heat3d-library` |
| `crates/session` | the multiplayer session server (roles, waiting room, presence, the shared layers' op log); its messages are in `proto/heat3d/session/v1` |
| `crates/server` | the data API over HTTP and WebSocket, the window's loopback server, and `3dheat serve` (session plus data API, headless) |
| `crates/app-tauri` | the desktop app (`3DHeat`), a thin layer: the window, loaded from its own loopback server (`/v1` with a key only the window gets), the file handover, and the server embedded |
| `crates/viewport` | the native viewport (preview): the web engine's WGSL on wgpu (Vulkan, DX12 fallback), fed one packet a frame by the page (`src/render/native/framePacket.ts`) and the rows straight from the core. The shaders and the packet's layout are exported from the TypeScript (`src/render/native/shaderExport.ts`; after a shader change `UPDATE_WGSL=1 npx vitest run src/render/native/shaderExport.test.ts`), and `cargo test -p heat3d-viewport` checks naga compiles every one; its `gpu_smoke` test draws a frame offscreen on whatever GPU there is, and on lavapipe (Mesa's software Vulkan) in the Linux CI job |

`vectors/` holds test inputs both sides are held to: `.3dheat` files read by the TypeScript and the Rust reader (`container/`), and Parquet loads built by the viewer's build and by the core's (`build/`: `node native/vectors/make-build-vectors.mjs` makes the files, `UPDATE_VECTORS=1 npx vitest run src/data/native/buildVectors.test.ts` writes what the viewer builds of them, `cargo test -p heat3d-core --test build_vectors` checks the core against it).

Building:

```
npm ci && (cd native && npm ci && npm run icons)
cd native && npx tauri build
```

The installers land in `target/release/bundle/` (NSIS and MSI on Windows, AppImage, deb and rpm on Linux). The server's packages: `bash native/packaging/server-package.sh <version> <windows-x64|linux-x64|linux-arm64> <program> dist <out folder>`. `.github/workflows/release.yml` builds all of them on a version tag, and the container image, into a draft release (see Updates). `node native/tools/smoke-shell.mjs` starts the built app (`3dheat-app.exe` in the build folder), picks a synthetic Parquet file, loads it through the core and checks that the heat draws, then builds two of the shared vectors' loads both ways (core and viewer) and checks every column is the same. `node native/tools/probe-native-load.mjs --dir <row-ceiling folder> --rows 100,400` measures loads in the app: time until every row is on the GPU, the page's and the core's memory, and frame times under camera motion with the timeline playing (`--path page` for the viewer building the dataset, as before).
