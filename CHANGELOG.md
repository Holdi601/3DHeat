# Changelog

What changed for people who use the viewer, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/). Releases have no version tags yet; the sections are dated.

## Unreleased (since 2026-11-14)

### Added
- **Hits on people, Arma 3:** with your install's catalogue (`heat3d-arma3-maps catalog` 0.4.0) a magazine the recording names gives its ammunition's calibre, and a unit whose role is one of the game's soldiers gets that soldier's default vest and helmet as its armour (an estimate: OCAP keeps no loadout) ([Hits on people](docs/person-hits.md)).
- **Vehicle hits, DCS World and IL-2:** a vehicle whose hits have no armour result colours its plates by hits instead of an empty penetration rate; the killing shot's result is `kill` (worked out from the death, labelled derived); missiles and bombs have their body diameter as calibre, the F-4E's numbered 20 mm rounds are named, IL-2's own object names (mission reports and the Tacview recordings it writes) give calibre and type, tank crews (Tank Crew) count on their tank by role, and an IL-2 aircraft's damage-model pieces say which region they are ([Vehicle hits](docs/vehicle-hits.md#dcs-world-and-il-2)).
- **Extractor windows:** every extractor and tool (21 of them) opens a window in the 3DHeat look, dark or light, with the logo and its own icon (the 3DHeat cube with a text badge for its game): a rail with the steps and what was found, a page that fills the window - find the game, choose maps or a job, progress with time left and cancel, done with Open in 3DHeat and, for a failure, what to do. No console window on Windows. The Extractors panel and the Library show each extractor's icon.
- **Replay readers share two verbs:** `convert <replay> -o <out> [--progress-json]` and `info <replay> --json` (what a replay holds, read from its header) in every replay reader ([Extractors](docs/extractors.md)).
- **The server, double-clicked on Windows,** says what it is for and points to the app's Host window, instead of flashing a console.
- **New logo:** a glass cube holding a heat terrain, with the 3DHEAT wordmark - in the side panel (the mark alone on a narrow panel), on the start screen, in the help panel, as the browser tab and app icon, in the installers, the docs and the README. All files, sizes and colours: [docs/brand.md](docs/brand.md).
- **DCS servers:** converted Tacview recordings of a DCS server say which server and mission they come from (`server`, `mission`), each aircraft's sortie and how it ended (landed, landed damaged, ejected, shot down, crashed, ...) with its kills, airfields and FARPs changing sides where a recording shows it, and who won the campaign where the server publishes it (a rounds file, its source named) - so outcome filters, the win-rate map and the breakdown work per server. A campaign round spans many recordings: `campaign` and `session` say which round and which session, the places taken between sessions are capture events, and rounds can be worked out from the recordings themselves by chaining each session's starting layout (`tools/dcs-campaign-rounds.mjs`). A round's recordings play as one series - session after session on one timeline, in the full and the many-match loader - with the places that changed hands drawn on the map by who held them at each session's start; served locally, the viewer loads a whole round from one of its recordings.
- **Win rate:** a win-rate map - each place coloured by how often the side of the rows there went on to win the round (or the match), against the overall rate, small samples pulled toward it - and outcome filters (round won or lost, match won or lost, how the round ended); a volume's statistics show its win rate. The outcome columns every converter writes are documented for new games.
- **Directional heat:** heat drawn as wedges that point the way each row faced, a field of arrows or streamlines over the heat, and a polar chart of the directions at a clicked spot or in a volume.
- **Value weighting:** what weapons, munitions, vehicles and fuel cost, as heat weights and totals, in real-world money or the game's own currency.
- **Filters for every source:** Event type, Player or AI, Vehicle class and Target class are worked out for every dataset; long category lists can be searched.
- **Volume comparison:** two or more volumes side by side - table, bars, over the match, visits and flow.
- **Breakdown:** who and what does best and worst in a spot, the view or a volume, and which factors (gear, states, utility) help or hurt.
- **Insights:** built-in detectors find what stands out and rank it with evidence; a written debrief by the built-in narrator or an external AI of your choice; a caster that plays the big moments of one match.
- **Knowledge lens:** findings read through doctrine, operations research, historical battles and game design literature, with measures from that literature.
- **Mass analysis:** thousands of `.3dheat` matches analysed from short per-match summaries, with drill-down into the 3D view.
- **Objectives:** capture zones, spawns, airfields and targets drawn on the level, with owner and capture progress.
- **Documentation site** with how-tos and pictures, generated reference pages, demo data and a glossary.

### Changed
- Number boxes show and accept numbers in the viewer's language; a point and a comma both work.
- Replay labels show what fits the unit: speed for ground units, height and airspeed for aircraft, speed and heading for ships.
- The level's simplification target applies to the level already loaded.
- Recordings far apart in time start together.

### Fixed
- The search at the top of the side panel is no longer cut off: the top row fits its width, the search drops its words, then its key, and on a narrow panel session and help fold into a "More" menu.
- Figures in the many-match overlay are drawn at the detail of the size they appear at, no longer as slabs.
- Value totals are spaced and grouped.
- A thrown object's flight is no longer counted as its thrower's position.

## 2026-11-07 to 2026-11-09 - first public version

### Added
- Heatmap, difference, team heat, line heat and the figure overlay over CSV, Parquet, Tacview ACMI and OCAP data, from one file to folder trees of tens of millions of rows, on WebGPU or WebGL2.
- Match replay with Tacview-style cameras, 2D map, bookmarks, tactical display, statistics and labels; tracers, weapons and decoys; hit marks on the units by calibre and outcome; wrecks and fires; turning turrets.
- Many matches at once: hundreds of recordings laid over each other, straight into the graphics card.
- `.3dheat` containers: one file a match, read in place.
- A figure catalogue of about 2,000 vehicles, aircraft, ships, weapons and soldiers built from published dimensions, plus free models; an optional local figure pack.
- World backdrop with terrain for flight data; DCS terrain and buildings; levels from the related tools.
- Volumes: boxes, prisms, cylinders and spheres drawn in 3D, with statistics, filtering and export.
- Race analysis, CS2 match analysis, the tactics board, hit analysis, camera paths and video, 40 languages, metric and imperial units.
- Visual checks for heat zoom invariance, flicker and jitter; budgets that hold the frame rate.

## Docs map

Where each feature is documented on the [documentation site](https://holdi601.github.io/3DHeat/) (pages under `docs/`):

| Feature | Page |
|---|---|
| First steps with made-up data | `demo-data.md` |
| Loading data, file types, column mapping, units and time | `getting-data-in.md`, `loading-files.md`, `column-mapping.md`, `axes-units-and-time.md`, `sessions-persons-groups.md`, `data-formats.md`, `ref-columns.md` |
| Tacview, converters, `.3dheat` | `tacview-acmi.md`, `converters.md`, `container.md` |
| Synthetic data, memory | `synthetic-generator.md`, `memory-and-budgets.md` |
| Heat modes | `heat-modes.md`, `heat.md`, `sprite-shape.md`, `colour-and-exposure.md`, `depth-and-culling.md`, `difference.md`, `team-heat.md`, `line-heat.md`, `box-replay.md` |
| Directional heat | `directional-heat.md` |
| Value weighting | `value-weighting.md`, `ref-value-tables.md` |
| Timeline and playback | `timeline.md` |
| Filters, teams, entities, slice, measure | `filters-and-tools.md`, `filters.md`, `teams-list.md`, `entities.md`, `slice.md`, `measure.md`, `ref-event-types.md` |
| Volumes and comparison, breakdown | `volumes.md`, `breakdown.md` |
| Insights, knowledge lens, mass analysis | `insights.md`, `knowledge.md`, `mass-analysis.md` |
| Match replay, Tacview parity, many matches | `match-replay.md`, `tacview-parity.md`, `many-matches.md` |
| Figures | `figures.md`, `figure-replay.md`, `figure-credits.md` |
| Hit analysis (Vehicles tab) | `hit-analysis.md` |
| Match analysis (CS2) | `match-analysis.md` |
| Race analysis | `race-analysis.md` and its child pages |
| Tactics board | `tactics-board.md`, `tactics-speeds.md` |
| Levels and world backdrop | `levels.md`, `map-images.md`, `model-levels.md`, `level-appearance.md`, `level-library.md`, `world-backdrop.md`, `world-backdrop-sources.md` |
| Camera, gamepad, keys, video | `camera.md`, `gamepad.md`, `keyboard-reference.md`, `camera-path-and-video.md`, `ref-browser-keys.md` |
| Settings, languages, updates | `settings.md`, `languages.md`, `ref-languages.md`, `ref-settings-storage.md`, `updates.md` |
| Rendering and performance | `rendering-internals.md` and its child pages |
| Words used | `glossary.md` |
| Command-line tools | `ref-tools.md` |
| Keeping the docs current | `maintaining.md`, `tools/docs-translate.md` |
