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
- **Update** and **Update all** install a newer release beside the old one, switch to it once it is complete, then delete the old version. **Look for updates** asks GitHub again (otherwise the answer is kept for a few hours).
- **Run** opens the extractor's own window, as a program of its own. It writes into the levels folder shown at the top of the panel; the level library picks the levels up from there.
- **Check** asks the extractor what it needs and shows the answer: whether the game install was found, whether a file it reads from your install is there, and whether there is enough free disk space.
- **Remove** deletes the extractor's folder.

An extractor that is open cannot be updated or removed until you close it.

Where things go:

| | Windows | Linux |
|---|---|---|
| The extractors | `%LOCALAPPDATA%\3DHeat\extractors\<id>\<version>\` | `${XDG_DATA_HOME:-~/.local/share}/3dheat/extractors/<id>/<version>/` |
| The levels they write | `%LOCALAPPDATA%\3DHeat\levels` | `${XDG_DATA_HOME:-~/.local/share}/3dheat/levels` |

What is installed is read from these folders; the panel keeps no other record, and nothing about your games or folders goes into a session file.

When you host a session with `3dheat serve`, the panel works in your own browser (it carries your host token). Members of the session do not reach it: they see the download links below.

## Get the extractors yourself

In the web viewer (and for session members) the panel shows **Get the extractors** instead: one link per extractor to its latest release on GitHub. Download the archive for your system, unpack it anywhere and start the program inside. Each one runs on your own machine and reads your own install; nothing of a game is downloaded by any of them.

By default an extractor writes into the levels folder above. To use another folder, set `HEAT3D_LEVELS` before starting it. A dev or preview server of the viewer reads the same default folder when it exists (see [Level library](level-library.md)).
