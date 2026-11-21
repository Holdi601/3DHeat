---
title: Extractors
parent: Levels and background geometry
nav_order: 6
---

# Extractors

The extractors are separate programs, one per game or tool, that read a game from your own install (its levels, its replays) and write files 3DHeat opens: levels as `.glb`, matches as tables. Each one has its own public repository and its own releases on GitHub. 3DHeat does not contain them; it can install and start them for you, or you download them yourself.

## The Extractors panel (the 3DHeat app)

In the app, **Heatmap › Load › Extractors** (or Ctrl+K, "Extractors") lists every extractor with the games it reads, the version installed, the latest version released, and its state: not installed, installed, update available, running or error.

- **Install** downloads the latest release for your system from GitHub, checks it against the release's `SHA256SUMS` (and the checksum GitHub reports for the file), and unpacks it into its own folder. A download that does not match is deleted and nothing is installed.
- **Update** and **Update all** first show the new version(s) with their release notes and ask: **Update now**, **Later**, or **Skip this version** (that version is not offered again; a newer one is, and **Offer again** undoes it). Update now installs the release beside the old one, switches to it once it is complete, then deletes the old version. **Look for updates** asks GitHub again (otherwise the answer is kept for a few hours).
- **Update automatically** (off by default): when on, looking for updates installs them without asking, except a version you skipped. The setting and the skipped versions are kept in `extractors/manager.json` in the app data folder below, nowhere else.
- **Run** opens the extractor's own window, as a program of its own. It writes into the levels folder shown at the top of the panel; the level library picks the levels up from there.
- **Check** asks the extractor what it needs and shows the answer: whether the game install was found, whether a file it reads from your install is there, and whether there is enough free disk space.
- **Remove** deletes the extractor's folder.

An extractor that is open, or extracting maps, cannot be updated or removed until it is done.

### New maps

For each installed map extractor the panel shows, per game, how many maps of your install are **new** (not extracted yet), **changed** (the game's files differ from those extracted), **outdated** (extracted by an older version of the extractor) or no longer in the install. **Extract** extracts the new ones, **Extract changed and outdated** the others, and **Choose maps…** lists every map to pick single ones. Maps are extracted one at a time, and the panel follows each: which map, how many of how many, and why one failed. **Stop** ends an extract after the map in progress. The counts are taken again when an extract finishes and when you **Look for updates**.

Behind it the manager runs the extractor's `status --json` (it only reads) and `extract ... --progress-json`, with the levels folder below. Readers of replays only have no maps and show none.

Where things go:

| | Windows | Linux | macOS |
|---|---|---|---|
| The extractors | `%LOCALAPPDATA%\3DHeat\extractors\<id>\<version>\` | `${XDG_DATA_HOME:-~/.local/share}/3dheat/extractors/<id>/<version>/` | `~/Library/Application Support/3DHeat/extractors/<id>/<version>/` |
| The levels they write | `%LOCALAPPDATA%\3DHeat\levels` | `${XDG_DATA_HOME:-~/.local/share}/3dheat/levels` | `~/Library/Application Support/3DHeat/levels` |

Builds exist for Windows (x64) for every extractor, for Linux (x64; native games and Steam/Proton installs) for those whose games run there, and for macOS (Apple silicon) for those whose games exist on it; the panel shows the others as not built for your system.

What is installed is read from these folders; the panel keeps no other record, and nothing about your games or folders goes into a session file.

When you host a session with `3dheat serve`, the panel works in your own browser (it carries your host token). Members of the session do not reach it: they see the download links below.

## Get the extractors yourself

In the web viewer (and for session members) the panel shows **Get the extractors** instead: one link per extractor to its latest release on GitHub. Download the archive for your system, unpack it anywhere and start the program inside. Each one runs on your own machine and reads your own install; nothing of a game is downloaded by any of them.

By default an extractor writes into the levels folder above, asks before it updates itself, and updates without asking only when you turn on its own "Update automatically". To use another folder, set `HEAT3D_LEVELS` before starting it. A dev or preview server of the viewer reads the same default folder when it exists (see [Level library](level-library.md)).

## The manager's state, for other parts of the viewer

`GET /__heat3d/extractors` (the owner only, as above) answers the panel's state as JSON, `"format": "3dheat-extractors-state"`, with `platform`, `levels` (the levels folder), `free` (bytes), `settings` (`autoUpdate`, `skip`: id → skipped version) and `extractors`, one object per extractor of the index:

| field | |
|---|---|
| `id`, `name`, `games`, `what`, `repo`, `supported` | from the index; `supported`: built for this system |
| `installed`, `latest`, `notes`, `published`, `skipped` | the installed version, the latest release, its notes, its date, whether it is the skipped version |
| `running`, `job`, `check` | the window open, an install under way (`phase`, `done`, `total`, `error`), the last requirements check |
| `status` | the last map status, or `null` until taken: `{version, levels, at, error, games: [{game, label, found, build, counts: {new, changed, outdated, current, missing}, maps: [{id, title, state, extractedVersion}]}]}`; kept until **Look for updates** or an extract finishes |
| `extract` | the last extract: `{running, total, ok, failed, finished, error, maps: [{index, id, state, detail}]}` |

`POST /__heat3d/extractors/status/<id>` takes the map status when none is kept (`?fresh=1`: again) and answers it.
