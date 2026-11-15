---
title: "Updates"
nav_order: 18
lang: "de"
source: "updates.md"
source_hash: "0d33b694a31d"
translated: true
outdated: false
---

# Updates

Der Viewer sagt dir, wenn es eine neuere Version gibt, und aktualisiert sich nur, wenn du ja sagst. Auf deinem Computer wird nichts ohne deine Antwort geändert.

## Den Viewer aktualisieren {#update-the-viewer}

1. **In der Seite.** Wenn es eine neuere Version gibt, erscheint unter dem Namen oben in der Seitenleiste ein Kasten: „Eine neuere Version von 3DHeat ist verfügbar“. Klicke auf **Jetzt aktualisieren**. Die Seite lädt sich danach selbst neu. **Später** blendet den Kasten aus, bis du die Seite neu lädst.
2. **Wenn dort steht, dass du restart.bat ausführen sollst**, schließe das Serverfenster (das schwarze Fenster, das `start.bat` geöffnet hat) und doppelklicke `restart.bat`.
3. **Beim Start des Viewers.** `start.bat` prüft ebenfalls. Gibt es eine neuere Version, fragt es **Update now? [Y/N]**. Drücke `Y`, um zu aktualisieren. Drücke `N` oder warte 60 Sekunden ohne Antwort, um die Version zu starten, die du hast.

![Der Update-Hinweis mit Jetzt aktualisieren und Später](../assets/img/de/updates-notice.webp)

Eine Kopie mit eigenen Änderungen wird nie für dich aktualisiert; der Kasten sagt nur, dass ein Update wartet, und dass du deine Änderungen committen oder stashen und `git pull` ausführen sollst. Eine Kopie, die nicht mit git installiert wurde (etwa eine ZIP-Datei), zeigt nichts.

So funktioniert die Prüfung Schritt für Schritt:

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## Die Sicherheitsregeln {#the-safety-rules}

- **Nur Fast-Forward** (`git pull --ff-only`): ein Update führt nie einen Merge aus, rebased nichts und schreibt nichts um.
- **Keine lokalen Änderungen**: Eine Kopie mit nicht committeten Änderungen an verfolgten Dateien (`git status --porcelain --untracked-files=no` ist nicht leer) wird nie automatisch aktualisiert – die Arbeit eines Menschen ist nicht etwas, das ein Update überschreiben darf. Ihr wird nur gesagt, dass ein Update wartet. Nicht verfolgte Dateien (Daten, Exporte) zählen nicht als Änderungen.
- **Keine lokalen Commits**: Eine Kopie mit Commits, die der Upstream nicht hat („divergiert“), wird nicht aktualisiert – ein Fast-Forward kann sie nicht heraufbringen, und ein Merge ist `git pull` von Hand vorbehalten. Die Seite und `start.bat` sagen beide dasselbe in denselben Worten, und `start.bat` startet die Version, die dort ist.
- **Nur von der Seite selbst**: Die Update-Anfrage des Entwicklungsservers muss einen eigenen Header tragen und, wenn der Browser einen `Origin` sendet, von dem eigenen Host des Servers kommen (unten).
- Nur ein git-Checkout mit einem Upstream-Branch wird je aktualisiert; alles andere (eine Kopie ohne `.git`, kein git installiert, ein statischer Build) bleibt unberührt und sagt nichts.

## Was start.bat tut {#what-startbat-does}

`start.bat` (doppelklicken; das Fenster ist der Server) macht der Reihe nach:

1. Findet Node.js – im `PATH`, sonst in `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` oder `%LOCALAPPDATA%\Programs\nodejs` – und bietet an, es mit `winget install -e --id OpenJS.NodeJS.LTS` zu installieren, wenn es fehlt (gefragt, Y/N; danach muss das Fenster neu geöffnet werden, damit Windows den neuen `PATH` übernimmt).
2. **Updates**, wenn git installiert ist und der Ordner `.git` hat:
   - `git fetch --quiet` (kein Netzwerk oder kein Upstream: stillschweigend übersprungen);
   - zählt `git rev-list --count HEAD..@{u}`; nichts zurück: nichts gesagt;
   - lokale Änderungen: „Diese Kopie hat lokale Änderungen und wird deshalb nicht automatisch aktualisiert; committe oder stashe sie und führe dann git pull aus.“ – und es startet die Version, die dort ist;
   - eigene Commits (`git rev-list --count @{u}..HEAD` ungleich 0): „Diese Kopie hat eigene Commits, die die neueste Version nicht hat; aktualisiere sie mit git pull.“ – und es startet die Version, die dort ist;
   - sonst „A newer version of 3DHeat is available (N changes).“ und die Frage **Update now? [Y/N]**. `N` oder keine Antwort innerhalb von 60 Sekunden gibt „Not updated; starting the version you have.“ aus und startet die Version, die dort ist. Bei `Y`: „Updating...“, meldet, ob sich `package.json` oder `package-lock.json` ändern, führt `git pull --ff-only` aus (sollte das auch noch fehlschlagen – etwa wegen des Netzwerks: „The update did not go through; starting the version you have.“), dann `git submodule update --init` (die festgelegten Werkzeuge, siehe [Die Dokumentation pflegen](maintaining.md#the-tools-under-exporters)), dann `npm install`, wenn sich die Paketdateien geändert haben und `node_modules` existiert, und „Updated.“.
3. Verweigert, einen zweiten Server zu starten: Hört schon etwas auf Port **5273**, sagt es das und verweist auf `restart.bat` / `stop.bat`.
4. Beim ersten Start (kein `node_modules`) wird vor dem Herunterladen der Abhängigkeiten gefragt (etwa 300 MB in `node_modules\`, nichts systemweit).
5. Startet den Entwicklungsserver auf `127.0.0.1:5273` (`--strictPort`) und öffnet den Browser, wenn er bereit ist.

`restart.bat` stoppt den Server (über den Port) und führt `start.bat` erneut aus, es stellt also dieselbe Frage. `stop.bat` stoppt nur.

## Für Entwickler {#for-developers}

### Während er läuft: die Update-Route {#while-it-runs-the-update-route}

Der Entwicklungsserver (Vite-Plugin `heat3d-self-update` in `vite.config.ts`) bietet `/__heat3d/update` an. Sie existiert nur auf dem Entwicklungsserver – nicht in einem statischen Build und nicht in `vite preview`.

**`GET /__heat3d/update`** antwortet, ob der Checkout zurückliegt:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false`, wenn der Ordner kein git-Checkout ist;
- führt `git fetch --quiet` **höchstens alle 30 Minuten** aus (Anfragen dazwischen antworten aus dem, was zuletzt geholt wurde);
- `behind` / `ahead` aus `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` aus `git status --porcelain --untracked-files=no`, `latest` der Betreff des neuesten Commits des Upstreams;
- ohne Upstream-Branch: `upstream: null` und `behind: 0`.

**`POST /__heat3d/update/apply`** bringt den Checkout auf den neuesten Stand:

1. Abgelehnt mit `403 { ok: false, reason: "forbidden" }`, außer die Anfrage hat den Header `X-Heat3d-Update: 1` und, wenn sie ein `Origin` trägt, ist der Host dieses Origins der `Host` der Anfrage. Ein seitenübergreifendes Formular kann keinen eigenen Header ohne CORS-Preflight senden, den dieser Server nie gewährt.
2. Nichts zu tun (kein Checkout, kein Upstream, nicht zurück): `{ ok: true, updated: false }`.
3. Lokale Änderungen: `{ ok: false, reason: "dirty" }`; lokale Commits: `{ ok: false, reason: "diverged" }`.
4. Sonst: notiert die Dateien, die sich ändern (`git diff --name-only HEAD @{u}`), `git pull --ff-only` (Zeitlimit 2 Min), `git submodule update --init` (Fehler ignoriert), `npm install`, wenn sich `package.json` oder `package-lock.json` geändert haben (Zeitlimit 15 Min), und antwortet `{ ok: true, updated: true, restart }` – `restart` sagt, warum der laufende Server das Update nicht übernehmen kann: `"dependencies"`, wenn sie neu installiert wurden, `"config"`, wenn nur eine `vite.config`-Datei geändert wurde, `false`, wenn nichts einen Neustart braucht.
5. Ein fehlschlagender git- oder npm-Befehl antwortet `{ ok: false, reason: "<der Fehler, bis zu 300 Zeichen>" }`.

Antworten sind JSON mit `Cache-Control: no-store`. Der Server hört nur auf `127.0.0.1`, daher ist die Route aus dem Netzwerk nicht erreichbar.

### Der Hinweis in der Seite {#the-notice-in-the-page}

`UpdateBanner`, unter dem Namen oben in der Seitenleiste:

- Er fragt die Route **4 Sekunden** nach dem Laden der Seite (nicht in den ersten Sekunden: die Seite hat einen Datensatz zu laden und eine GPU zu starten) und danach **alle 6 Stunden**, solange die Seite offen bleibt.
- Er zeigt **nichts**, wenn es die Route nicht gibt (ein statischer Build), der Ordner kein Checkout ist oder nichts neuer ist – ein Hinweis bei jedem Start ist einer, den Menschen lernen zu ignorieren.
- Zurückliegend, ohne lokale Änderungen: „Eine neuere Version von 3DHeat ist verfügbar (N Änderungen, die neueste: <Betreff>).“ mit **Jetzt aktualisieren** und **Später** (*Später* blendet ihn aus, bis die Seite neu geladen wird).
- Zurückliegend, mit lokalen Änderungen: derselbe Satz und „Diese Kopie hat lokale Änderungen und wird deshalb nicht automatisch aktualisiert; committe oder stashe sie und führe dann git pull aus.“ – ohne Knopf.
- **Jetzt aktualisieren** sendet an `/apply` („Wird aktualisiert…“). Dann:
  - „Aktualisiert. Die Seite wird neu geladen.“ – und sie lädt 1,5 s später neu (der Server liefert schon die neuen Dateien aus);
  - wenn die Abhängigkeiten neu installiert wurden: „Aktualisiert. Die Abhängigkeiten haben sich geändert: Schließ das Serverfenster und starte **restart.bat**, um abzuschließen.“;
  - wenn nur die Einstellungen des Servers sich geändert haben: „Aktualisiert. Die Servereinstellungen haben sich geändert: Schließ das Serverfenster und starte **restart.bat**, um abzuschließen.“;
  - am Ende nichts zu holen (`updated: false` – die Kopie wurde inzwischen aktualisiert, etwa durch `start.bat`): „Nichts zu aktualisieren: Diese Kopie ist bereits die neueste Version.“ – und kein Neuladen;
  - abgelehnt: der Satz zu *dirty* („Diese Kopie hat lokale Änderungen und wird deshalb nicht automatisch aktualisiert; committe oder stashe sie und führe dann git pull aus.“), oder „Diese Kopie hat eigene Commits, die die neueste Version nicht hat; aktualisiere sie mit git pull.“, oder „Die Aktualisierung hat nicht geklappt: <Grund>“.
