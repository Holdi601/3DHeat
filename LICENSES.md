# Licences and third-party components

This repository holds two projects under two licences, kept apart on purpose:

| Part | Licence | Where |
|---|---|---|
| **The viewer** (`src/`, `tools/`, `datasources/`, everything not under `exporters/`) | **Proprietary, all rights reserved.** No licence is granted. | this repository |
| **The extractors** (`exporters/`: game files, game capture and the telemetry recorders, the Unreal exporter) | **MIT** — free and open source | their own public repository, [3DHeat-Extractors](https://github.com/Holdi601/3DHeat-Extractors), pinned here as a git submodule |

The extractors are free so that anyone can get their courses, levels and laps
out of a game whether or not they use the viewer; the viewer is what is sold.
The extractors' own third-party components, model licences and the obligations
of reading game files are recorded in [`exporters/LICENSES.md`](exporters/LICENSES.md), which
travels with them.

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
| meshoptimizer | MIT | Level decimation |
| vite | MIT | Build and dev server |
| vitest | MIT | Tests |
| typescript | Apache-2.0 | Build |
| playwright | Apache-2.0 | Smoke tests (development only) |
| @webgpu/types | BSD-3-Clause | Type definitions |
| @types/\* | MIT | Type definitions |

---

This document is a record of what the licences say. It is not legal advice, and
the commercial question for any particular use is one for whoever is answerable
for that use.
