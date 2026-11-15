---
title: Updates
nav_order: 21
---

# Updates

The viewer tells you when a newer version exists, and updates itself only when you say yes. Nothing is changed on your computer without your answer.

## Update the viewer

1. **In the page.** When a newer version exists, a box appears under the name at the top of the sidebar: "A newer version of 3DHeat is available". Click **Update now**. The page reloads by itself when it is done. **Later** hides the box until you reload the page.
2. **If it says to run restart.bat**, close the server window (the black window that `start.bat` opened) and double-click `restart.bat`.
3. **When you start the viewer.** `start.bat` checks too. If a newer version exists it asks **Update now? [Y/N]**. Press `Y` to update. Press `N`, or wait 60 seconds without answering, to start the version you have.

![The update notice with Update now and Later](assets/img/en/updates-notice.webp)

A copy with changes of your own is never updated for you; the box only tells you an update is waiting, and says to commit or stash your changes and run `git pull`. A copy that was not installed with git (a zip file, say) shows nothing.

How the check works, step by step:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

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

## What start.bat does

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
   - otherwise "A newer version of 3DHeat is available (N changes)." and the question **Update now? [Y/N]**. `N`, or no answer for 60 seconds, prints "Not updated; starting the version you have." and starts the version there is. On `Y`: "Updating...", notes whether `package.json` or `package-lock.json` change,
     runs `git pull --ff-only` (should that still fail - the network, say:
     "The update did not go through; starting the version you have."), then `git submodule update --init`
     (the pinned tools, see [Maintaining the docs](maintaining.md#the-tools-under-exporters)), then `npm install` when the package files changed and
     `node_modules` exists, and "Updated."
3. Refuses to start a second server: when something already listens on port
   **5273** it says so and points at `restart.bat` / `stop.bat`.
4. On the first run (no `node_modules`), asks before downloading the
   dependencies (about 300 MB into `node_modules\`, nothing system-wide).
5. Starts the dev server on `127.0.0.1:5273` (`--strictPort`) and opens the
   browser when it is ready.

`restart.bat` stops the server (by port) and runs `start.bat` again, so it asks the same question. `stop.bat` only stops it.


## For developers

### While it runs: the update route

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

### The notice in the page

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

