# Licences and third-party components

This repository holds two projects under two licences, kept apart on purpose:

| Part | Licence | Where |
|---|---|---|
| **The viewer** (`src/`, `tools/`, `datasources/`, everything not under `exporters/`) | **Proprietary, all rights reserved.** No licence is granted. | this repository |
| **The tools** (`exporters/`: game files, game capture, the Unreal exporter, the CS2 converter, the watcher, and the optional converters under `exporters/ext/`) | **MIT** — free and open source | each in its own public repository (3DHeat-GameFiles, -GameCapture, -UnrealExporter, -CS2, -Watcher, -Ext-*), pinned here as git submodules; see the [README](README.md#related-repositories) |

The extractors are free so that anyone can get their courses, levels and laps
out of a game whether or not they use the viewer; the viewer is what is sold.
Each tool's own third-party components, model licences and the obligations
of reading game files are recorded in the `LICENSES.md` of its repository, which
travels with it.

Every licence below was read off the package metadata in September 2026, not
recalled. Where a component's terms changed after that, the source is what
counts, not this file.

---

## The viewer — everything outside `exporters/`

Every runtime and build dependency is permissive. Nothing here restricts
commercial use, and nothing imposes a copyleft obligation.

| Package | Licence | Used for |
|---|---|---|
| react, react-dom | MIT | Interface |
| three | MIT | Maths and scene helpers |
| zustand | MIT | State |
| hyparquet | MIT | Reading Parquet telemetry |
| hyparquet-writer | MIT | Writing Parquet (volume export, tools) |
| fzstd | MIT | Reading Zstandard-compressed data |
| meshoptimizer | MIT | Level decimation |
| vite | MIT | Build and dev server |
| @vitejs/plugin-react | MIT | Build (React for Vite) |
| vitest | MIT | Tests |
| typescript | Apache-2.0 | Build |
| playwright | Apache-2.0 | Smoke tests (development only) |
| @webgpu/types | BSD-3-Clause | Type definitions |
| @types/\* | MIT | Type definitions |

Data and model credits that come with the viewer are listed on their own pages: [figure credits](docs/figure-credits.md) (drawings and free models under CC BY) and [world backdrop sources](docs/world-backdrop-sources.md) (map data and imagery providers and their terms).

---

This document is a record of what the licences say. It is not legal advice, and
the commercial question for any particular use is one for whoever is answerable
for that use.
