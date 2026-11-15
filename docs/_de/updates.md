---
title: "Updates"
nav_order: 21
lang: "de"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Updates

Der Viewer sagt dir, wenn es eine neuere Version gibt, und aktualisiert sich nur, wenn du zustimmst. Auf deinem Rechner wird nichts ohne deine Antwort geändert.

## Den Viewer aktualisieren {#update-the-viewer}

1. **In der Seite.** Wenn es eine neuere Version gibt, erscheint ein Kasten unter dem Namen oben in der Seitenleiste: „Eine neuere Version von 3DHeat ist verfügbar“. Klicke auf **Jetzt aktualisieren**. Die Seite lädt sich danach selbst neu. **Später** blendet den Kasten aus, bis du die Seite neu lädst.
2. **Wenn es heißt, restart.bat auszuführen**, schließe das Serverfenster (das schwarze Fenster, das `start.bat` geöffnet hat) und doppelklicke `restart.bat`.
3. **Beim Starten des Viewers.** `start.bat` prüft ebenfalls. Gibt es eine neuere Version, fragt es **Jetzt aktualisieren? [J/N]**. Drücke `J`, um zu aktualisieren. Drücke `N` oder warte 60 Sekunden ohne Antwort, um die Version zu starten, die du hast.

![Der Update-Hinweis mit Jetzt aktualisieren und Später](../assets/img/en/updates-notice.webp)

Eine Kopie mit eigenen Änderungen wird nie für dich aktualisiert; der Kasten sagt nur, dass ein Update wartet, und dass du deine Änderungen committen oder stashen und dann `git pull` ausführen sollst. Eine Kopie, die nicht mit Git installiert wurde (etwa eine Zip-Datei), zeigt nichts.

So funktioniert die Prüfung, Schritt für Schritt:

```
Seite ---(nach 4 s, dann alle 6 h)---> Entwicklungsserver ---> git fetch
   zurück?  nein -> es wird nichts angezeigt
            ja   -> eigene Änderungen oder Commits?  ja -> nur Hinweis
                                                     nein -> [Jetzt aktualisieren] -> git pull
                                                            -> neu laden, oder „restart.bat ausführen“
```

## Die Sicherheitsregeln {#the-safety-rules}

- **Nur Fast-Forward** (`git pull --ff-only`): Ein Update führt nie zusammen,
  rebased oder überschreibt etwas.
- **Keine lokalen Änderungen**: Eine Kopie mit nicht committeten Änderungen an verfolgten Dateien
  (`git status --porcelain --untracked-files=no` nicht leer) wird nie automatisch aktualisiert – die
  Arbeit eines Menschen ist nicht dazu da, von einem Update überschrieben zu werden. Sie erfährt
  nur, dass ein Update wartet. Nicht verfolgte Dateien (Daten, Exporte) zählen nicht als Änderungen.
- **Keine lokalen Commits**: Eine Kopie mit Commits, die der Upstream nicht hat („divergiert“), wird nicht
  aktualisiert – ein Fast-Forward kann sie nicht hochbringen, und das Zusammenführen ist Sache von `git pull`
  von Hand. Die Seite und `start.bat` sagen es mit denselben Worten, und `start.bat` startet die Version, die dort liegt.
- **Nur von der Seite selbst**: Die Update-Anfrage des Entwicklungsservers muss einen eigenen Header
  tragen und, wenn der Browser einen `Origin` mitschickt, vom eigenen Host des Servers kommen (unten).
- Nur ein Git-Checkout mit einem Upstream-Branch wird je aktualisiert; alles andere
  (eine Kopie ohne `.git`, kein Git installiert, ein statischer Build) bleibt unberührt und sagt nichts.

## Was start.bat tut {#what-startbat-does}

`start.bat` (doppelklicken; das Fenster ist der Server) macht der Reihe nach:

1. Findet Node.js – im `PATH`, sonst in `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` oder `%LOCALAPPDATA%\Programs\nodejs` – und bietet an,
   es mit `winget install -e --id OpenJS.NodeJS.LTS` zu installieren, wenn es fehlt (gefragt, J/N; danach muss das Fenster neu geöffnet werden, damit Windows den neuen `PATH` übernimmt).
2. **Aktualisiert**, wenn Git installiert ist und der Ordner `.git` hat:
   - `git fetch --quiet` (kein Netz oder kein Upstream: still übersprungen);
   - zählt `git rev-list --count HEAD..@{u}`; nichts zurück: nichts gesagt;
   - lokale Änderungen: „Eine neuere Version von 3DHeat ist verfügbar (N Änderungen), aber diese Kopie hat lokale Änderungen, daher wird sie nicht aktualisiert. Committe oder stashe sie, dann führe git pull aus.“ – und es startet die Version, die dort liegt;
   - eigene Commits (`git rev-list --count @{u}..HEAD` ungleich 0): „Eine neuere Version von 3DHeat ist verfügbar (N Änderungen), aber diese Kopie hat eigene Commits, die die neueste Version nicht hat, daher wird sie nicht aktualisiert. Aktualisiere sie mit git pull.“ – und es startet die Version, die dort liegt;
   - sonst „Eine neuere Version von 3DHeat ist verfügbar (N Änderungen).“ und die Frage **Jetzt aktualisieren? [J/N]**. `N`, oder keine Antwort innerhalb von 60 Sekunden, gibt „Nicht aktualisiert; die Version, die du hast, wird gestartet.“ aus und startet sie. Bei `J`: „Aktualisiere…“, meldet, ob sich `package.json` oder `package-lock.json` ändern,
     führt `git pull --ff-only` aus (schlägt das trotzdem fehl – etwa wegen des Netzes –:
     „Das Update ist nicht durchgegangen; die Version, die du hast, wird gestartet.“), dann `git submodule update --init`
     (die festgelegten Werkzeuge, siehe [Pflege der Dokumentation](maintaining.md#the-tools-under-exporters)), dann `npm install`, wenn sich die Paketdateien geändert haben und `node_modules` existiert, und „Aktualisiert.“
3. Verhindert einen zweiten Serverstart: Lauscht schon etwas auf Port **5273**, sagt es das und verweist auf `restart.bat` / `stop.bat`.
4. Beim ersten Start (kein `node_modules`) fragt es, bevor die Abhängigkeiten geladen werden (etwa 300 MB in `node_modules\`, nichts systemweit).
5. Startet den Entwicklungsserver auf `127.0.0.1:5273` (`--strictPort`) und öffnet den Browser, sobald er bereit ist.

`restart.bat` stoppt den Server (über den Port) und führt `start.bat` erneut aus, es stellt also dieselbe Frage. `stop.bat` stoppt ihn nur.


## Für Entwickler {#for-developers}

### While it runs: the update route {#while-it-runs-the-update-route}

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
