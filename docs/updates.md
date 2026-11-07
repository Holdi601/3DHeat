---
title: Updates
nav_order: 80
---

# Updates

The viewer runs from a git checkout, so "the newest version" is whatever the
branch it follows has upstream. It keeps itself current in two places: when
it starts (`start.bat`), and while it runs (a route on the dev server and a
notice in the page). Both follow the same safety rules. The tools under
`exporters/` are pinned git submodules that move with it.

Code: [`start.bat`](https://github.com/Holdi601/3DHeat/blob/main/start.bat),
`selfUpdate` in [`vite.config.ts`](https://github.com/Holdi601/3DHeat/blob/main/vite.config.ts),
[`src/ui/UpdateBanner.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/UpdateBanner.tsx).

## The safety rules

- **Fast-forward only** (`git pull --ff-only`): an update never merges,
  rebases or rewrites anything.
- **No local changes**: a checkout with uncommitted changes to tracked files
  (`git status --porcelain --untracked-files=no` not empty) is never updated
  automatically - someone's own work is not an update's to overwrite. It is
  only told an update is waiting. Untracked files (data, exports) do not
  count as changes.
- **No local commits**: a checkout with commits the upstream does not have
  ("diverged") is not updated - a fast-forward cannot bring it up, and
  merging is for `git pull` by hand. The page and `start.bat` both say so in
  the same words, and `start.bat` starts the version there is.
- **Only from the page itself**: the dev server's update request must carry
  a custom header and, when the browser sends an `Origin`, come from the
  server's own host (below).
- Only a git checkout with an upstream branch is ever updated; anything else
  (a copy without `.git`, no git installed, a static build) is left alone
  and says nothing.

## When it starts: start.bat

`start.bat` (double-click it; the window is the server) does, in order:

1. Finds Node.js - on `PATH`, else in `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` or `%LOCALAPPDATA%\Programs\nodejs` - and
   offers to install it with `winget install -e --id OpenJS.NodeJS.LTS` when
   it is missing (asked, Y/N; afterwards the window has to be reopened so
   Windows picks up the new `PATH`).
2. **Updates**, when git is installed and the folder has `.git`:
   - `git fetch --quiet` (no network or no upstream: skipped silently);
   - counts `git rev-list --count HEAD..@{u}`; nothing behind: nothing said;
   - local changes: "A newer version of 3DHeat is available (N changes), but
     this copy has local changes, so it is not updated. Commit or stash them,
     then run git pull." - and it starts the version there is;
   - commits of its own (`git rev-list --count @{u}..HEAD` not 0): "A newer
     version of 3DHeat is available (N changes), but this copy has commits of
     its own that the newest version does not, so it is not updated. Update it
     with git pull." - and it starts the version there is;
   - otherwise "A newer version of 3DHeat is available (N changes).
     Updating...", notes whether `package.json` or `package-lock.json` change,
     runs `git pull --ff-only` (should that still fail - the network, say:
     "The update did not go through; starting the version you have."), then `git submodule update --init`
     (the pinned tools), then `npm install` when the package files changed and
     `node_modules` exists, and "Updated."
3. Refuses to start a second server: when something already listens on port
   **5273** it says so and points at `restart.bat` / `stop.bat`.
4. On the first run (no `node_modules`), asks before downloading the
   dependencies (about 300 MB into `node_modules\`, nothing system-wide).
5. Starts the dev server on `127.0.0.1:5273` (`--strictPort`) and opens the
   browser when it is ready.

`restart.bat` stops the server (by port) and runs `start.bat` again, so a
restart also updates. `stop.bat` only stops it.

## While it runs: the update route

The dev server (Vite plugin `heat3d-self-update` in `vite.config.ts`) serves
`/__heat3d/update`. It exists only on the dev server - not in a static build
and not in `vite preview`.

**`GET /__heat3d/update`** answers whether the checkout is behind:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` when the folder is not a git checkout;
- it runs `git fetch --quiet` **at most every 30 minutes** (asks in between
  answer from what was last fetched);
- `behind` / `ahead` from `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`,
  `dirty` from `git status --porcelain --untracked-files=no`, `latest` the
  subject of the upstream's newest commit;
- with no upstream branch, `upstream: null` and `behind: 0`.

**`POST /__heat3d/update/apply`** brings the checkout up:

1. Refused with `403 { ok: false, reason: "forbidden" }` unless the request has
   the header `X-Heat3d-Update: 1` and, when it carries an `Origin`, that
   origin's host is the request's `Host`. A cross-site form cannot send a
   custom header without a CORS preflight, which this server never grants.
2. Nothing to do (not a checkout, no upstream, not behind):
   `{ ok: true, updated: false }`.
3. Local changes: `{ ok: false, reason: "dirty" }`; local commits:
   `{ ok: false, reason: "diverged" }`.
4. Otherwise: notes the files that change (`git diff --name-only HEAD @{u}`),
   `git pull --ff-only` (2 min timeout), `git submodule update --init`
   (failure ignored), `npm install` when `package.json` or
   `package-lock.json` changed (15 min timeout), and answers
   `{ ok: true, updated: true, restart }` - `restart` says why the running
   server cannot pick the update up: `"dependencies"` when they were
   reinstalled, `"config"` when only a `vite.config` file changed, `false`
   when nothing needs a restart.
5. A failing git or npm command answers `{ ok: false, reason: "<the error,
   up to 300 characters>" }`.

Responses are JSON with `Cache-Control: no-store`. The server listens on
`127.0.0.1` only, so the route is not reachable from the network.

## The notice in the page

`UpdateBanner`, under the name at the top of the sidebar:

- It asks the route **4 seconds** after the page loads (not in the first
  seconds: the page has a dataset to load and a GPU to start) and again
  **every 6 hours** while the page stays open.
- It shows **nothing** when there is no such route (a static build), the
  folder is not a checkout, or nothing is newer - a notice on every start is
  one people learn to ignore.
- Behind, with no local changes: "A newer version of 3DHeat is available (N
  changes, the newest: <subject>)." with **Update now** and **Later**
  (*Later* hides it until the page is reloaded).
- Behind, with local changes: the same sentence and "This copy has local
  changes, so it is not updated automatically; commit or stash them, then
  run git pull." - no button.
- **Update now** posts to `/apply` ("Updating..."). Then:
  - "Updated. The page reloads." - and it reloads 1.5 s later (the server
    already serves the new files);
  - when the dependencies were reinstalled: "Updated. Its dependencies
    changed: close the server window and run **restart.bat** to finish.";
  - when only the server's settings changed: "Updated. Its server settings
    changed: close the server window and run **restart.bat** to finish.";
  - nothing to bring in after all (`updated: false` - the copy was brought up
    meanwhile, by `start.bat` say): "Nothing to update: this copy is already
    the newest version." - and no reload;
  - refused: the *dirty* sentence, or "This copy has commits of its own that
    the newest version does not; update it with git pull.", or "The update
    did not go through: <reason>".

## The tools under exporters/

The tools around the viewer are separate public projects, each with its own
MIT licence, releases, wiki and update check, pinned in this repository as
git submodules:

| Folder | Repository |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - courses and levels out of games' own archives |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - lap telemetry recorders; levels from gameplay video |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor plugin |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 demos and maps |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - records play in the background |

**Pinned** means this repository records one exact commit of each tool. A
checkout of the viewer gets those commits:

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# or, after a plain clone:
git submodule update --init
```

Both update paths above run `git submodule update --init` after pulling, so
the tools follow the viewer to the commits its newest version pins - not
the tools' own newest commits. A tool's newer release reaches the viewer
when the pin here is moved: changes to a tool are committed and pushed in
its own folder (its own repository) first, then the new pin is committed
here. Each tool also checks for its own newer releases; that is documented
in its own repository.
