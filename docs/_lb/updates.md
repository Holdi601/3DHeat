---
title: "Updates"
nav_order: 21
lang: "lb"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Updates

De Viewer seet Iech Bescheed, wann et eng méi nei Versioun gëtt, an aktualiséiert sech nëmme, wann Dir jo sot. Ouni Är Äntwert gëtt op Ärem Rechner näischt geännert.

## D'Viewer aktualiséieren {#update-the-viewer}

1. **Op der Säit.** Wann et eng méi nei Versioun gëtt, erschéngt e Kaschte ënner dem Numm uewen an der Säitelleescht: "A newer version of 3DHeat is available" (Eng méi nei Versioun vum 3DHeat ass verfügbar). Klickt **Elo aktualiséieren**. D'Säit lued sech vun alleng nei, wann et fäerdeg ass. **Méi spéit** verstoppt de Kaschte, bis Dir d'Säit nei lued.
2. **Wann et seet, restart.bat ze lafen**, maacht d'Serverfënster zou (dat schwaarzt Fënster, dat `start.bat` opgemaach huet) a duebelklickt `restart.bat`.
3. **Wann Dir den Viewer startet.** `start.bat` kuckt och. Wann et eng méi nei Versioun gëtt, freet et **Elo aktualiséieren? [J/N]**. Drëckt `J`, fir ze aktualiséieren. Drëckt `N`, oder waart 60 Sekonnen ouni Äntwert, fir d'Versioun ze starten, déi Dir hutt.

![D'Aktualiséierungsnotiz mat Elo aktualiséieren an Méi spéit](../assets/img/en/updates-notice.webp)

Eng Kopie mat eegene Ännerungen gëtt ni fir Iech aktualiséiert; de Kaschte seet nëmmen, datt en Update waart, a seet, Dir sollt Är Ännerungen comitten oder stashen an `git pull` ausféieren. Eng Kopie, déi net mat git installéiert gouf (zum Beispill als Zip-Datei), weist guer näischt.

Wéi d'Kontroll funktionéiert, Schrëtt fir Schrëtt:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## D'Sécherheetsreegelen {#the-safety-rules}

- **Nëmmen Fast-forward** (`git pull --ff-only`): e Update mécht ni e Merge,
  e Rebase oder schreift iergendeppes ëm.
- **Keng lokal Ännerungen**: eng Kopie mat net gespäichert Ännerungen un verfollegte Dateien
  (`git status --porcelain --untracked-files=no` ass net eidel) gëtt ni automatesch aktualiséiert - dem Mënsch seng eegen Aarbecht ass net dat, wat e Update iwwerschreift. Si kritt nëmmen gesot, datt e Update waart. Net verfollegt Dateien (Daten, Exporter) zielen net als Ännerungen.
- **Keng lokal Commits**: eng Kopie mat Commits, déi de Upstream net huet ("diverged"), gëtt net aktualiséiert - e Fast-forward kann se net bréngen, a Mergen ass fir `git pull` vun Hand. D'Säit an `start.bat` soen dat mat deenselwechten Wieder, an `start.bat` start d'Versioun, déi do ass.
- **Nëmmen vun der Säit selwer**: d'Update-Ufro vum dev-Server muss en eegene Header droen an, wann de Browser en `Origin` schéckt, vum eegene Host vum Server kommen (weider ënnen).
- Nëmme eng git-Kopie mat engem Upstream-Branch gëtt ëmmer aktualiséiert; alles anerts (eng Kopie ohne `.git`, kee git installéiert, en statesche Build) bleift a seet näischt.

## Wat start.bat mécht {#what-startbat-does}

`start.bat` (duebelklickt se; d'Fënster ass de Server) mécht, an dëser Reiefolleg:

1. Fënnt Node.js - am `PATH`, soss an `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` oder `%LOCALAPPDATA%\Programs\nodejs` - a bitt un, en mat `winget install -e --id OpenJS.NodeJS.LTS` z'installéieren, wann e feelt (gefrot, J/N; duerno muss d'Fënster nei opgemaach ginn, sou datt Windows den neien `PATH` gesäit).
2. **Aktualiséierungen**, wann git installéiert ass an de Dossier `.git` huet:
   - `git fetch --quiet` (kee Netz oder kee Upstream: iwwersprongen, ouni ze schwätzen);
   - zielt `git rev-list --count HEAD..@{u}`; näischt hannendrun: näischt gesot;
   - lokal Ännerungen: "A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull." (Eng méi nei Versioun vum 3DHeat ass verfügbar, mee dës Kopie huet lokal Ännerungen, dofir gëtt se net aktualiséiert. Comitt oder stasht se, dann `git pull` ausféieren.) - an et start d'Versioun, déi do ass;
   - eegen Commits (`git rev-list --count @{u}..HEAD` ass net 0): "A newer version of 3DHeat is available (N changes), but this copy has commits of its own that the newest version does not, so it is not updated. Update it with git pull." - an et start d'Versioun, déi do ass;
   - soss "A newer version of 3DHeat is available (N changes)." an d'Fro **Elo aktualiséieren? [J/N]**. `N`, oder keng Äntwert fir 60 Sekonnen, schreift "Not updated; starting the version you have." a start d'Versioun, déi do ass. Bei `J`: "Updating...", seet, ob `package.json` oder `package-lock.json` sech änneren,
     féiert `git pull --ff-only` aus (wann dat nach ëmmer feelt - zum Beispill wéinst dem Netz -:
     "The update did not go through; starting the version you have."), dann `git submodule update --init`
     (d'festgeleeten Werkzeich, kuckt [D'Dokumentatioun pflegen](maintaining.md#the-tools-under-exporters)), dann `npm install`, wann d'Packagedateien sech geännert hunn an `node_modules` existéiert, a "Updated." (Aktualiséiert.)
3. Verhënnert, datt en zweeten Server startet: wann eppes schonn op Port **5273** lauschtert, seet et dat a verweist op `restart.bat` / `stop.bat`.
4. Beim éischte Lafen (ouni `node_modules`) freet et, ier d'Abhängegkeeten erofgeluede ginn (ongeféier 300 MB an `node_modules\`, näischt systemwäit).
5. Start den Dev-Server op `127.0.0.1:5273` (`--strictPort`) an mécht den Browser op, wann e prett ass.

`restart.bat` stoppt de Server (iwwer de Port) a leeft `start.bat` nees, also freet et déiselwecht Fro. `stop.bat` stoppt nëmmen.

## Fir Entwéckler {#for-developers}

### Wärend et leeft: d'Update-Route {#while-it-runs-the-update-route}

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

### The notice in the page {#the-notice-in-the-page}

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
