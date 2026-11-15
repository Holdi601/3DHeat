---
title: "Updates"
nav_order: 21
lang: "nl"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Updates

De viewer laat je weten wanneer er een nieuwere versie bestaat, en werkt zichzelf alleen bij als je ja zegt. Er wordt niets op je computer veranderd zonder je antwoord.

## De viewer bijwerken {#update-the-viewer}

1. **In de pagina.** Wanneer er een nieuwere versie bestaat, verschijnt er een vak onder de naam bovenaan de zijbalk: "Er is een nieuwere versie van 3DHeat beschikbaar". Klik op **Nu bijwerken**. De pagina laadt zichzelf opnieuw als het klaar is. **Later** verbergt het vak tot je de pagina herlaadt.
2. **Als er staat dat je restart.bat moet draaien**, sluit je het servervenster (het zwarte venster dat `start.bat` opende) en dubbelklik je op `restart.bat`.
3. **Bij het starten van de viewer.** `start.bat` controleert ook. Als er een nieuwere versie bestaat, vraagt het **Nu bijwerken? [J/N]**. Druk op `J` om bij te werken. Druk op `N`, of wacht 60 seconden zonder antwoord, om de versie die je hebt te starten.

![De melding van een update met Nu bijwerken en Later](../assets/img/en/updates-notice.webp)

Een kopie met eigen wijzigingen wordt nooit voor je bijgewerkt; het vak vertelt alleen dat er een update klaarstaat, en zegt dat je je wijzigingen moet committen of stashen en `git pull` moet draaien. Een kopie die niet met git is geïnstalleerd (bijvoorbeeld een zipbestand) toont niets.

Hoe de controle werkt, stap voor stap:

```
pagina ---(na 4 s, daarna elke 6 u)---> dev-server ---> git fetch
   achter?  nee -> er wordt niets getoond
            ja  -> eigen wijzigingen of commits?  ja -> alleen melden
                                                  nee -> [Nu bijwerken] -> git pull
                                                        -> herladen, of "draai restart.bat"
```

## De veiligheidsregels {#the-safety-rules}

- **Alleen fast-forward** (`git pull --ff-only`): een update voegt nooit samen,
  rebaset nooit en herschrijft niets.
- **Geen lokale wijzigingen**: een checkout met niet-gecommitte wijzigingen in
  gevolgde bestanden (`git status --porcelain --untracked-files=no` is niet
  leeg) wordt nooit automatisch bijgewerkt - andermans eigen werk is niet aan
  een update om te overschrijven. Er wordt alleen verteld dat er een update
  klaarstaat. Niet-gevolgde bestanden (data, exports) tellen niet als wijzigingen.
- **Geen lokale commits**: een checkout met commits die de upstream niet heeft
  ("gedivergeerd") wordt niet bijgewerkt - een fast-forward kan dat niet
  brengen, en samenvoegen is voor `git pull` met de hand. De pagina en
  `start.bat` zeggen dat in dezelfde woorden, en `start.bat` start de versie
  die er is.
- **Alleen vanaf de pagina zelf**: het updateverzoek van de dev-server moet een
  eigen header meesturen en, als de browser een `Origin` meestuurt, van de
  eigen host van de server komen (hieronder).
- Alleen een git-checkout met een upstream-branch wordt ooit bijgewerkt; al het
  andere (een kopie zonder `.git`, geen git geïnstalleerd, een statische build)
  wordt met rust gelaten en zegt niets.

## Wat start.bat doet {#what-startbat-does}

`start.bat` (dubbelklik erop; het venster is de server) doet, in deze volgorde:

1. Vindt Node.js - op `PATH`, anders in `%ProgramFiles%\nodejs`,
   `%ProgramFiles(x86)%\nodejs` of `%LOCALAPPDATA%\Programs\nodejs` - en biedt
   aan het te installeren met `winget install -e --id OpenJS.NodeJS.LTS` als
   het ontbreekt (gevraagd, J/N; daarna moet het venster opnieuw geopend worden
   zodat Windows de nieuwe `PATH` oppakt).
2. **Updates**, als git geïnstalleerd is en de map `.git` heeft:
   - `git fetch --quiet` (geen netwerk of geen upstream: stilzwijgend overgeslagen);
   - telt `git rev-list --count HEAD..@{u}`; niets achter: er wordt niets gezegd;
   - lokale wijzigingen: "Er is een nieuwere versie van 3DHeat beschikbaar (N
     wijzigingen), maar deze kopie heeft lokale wijzigingen, dus hij wordt niet
     bijgewerkt. Commit of stash ze, en draai daarna git pull." - en hij start
     de versie die er is;
   - eigen commits (`git rev-list --count @{u}..HEAD` is niet 0): "Er is een
     nieuwere versie van 3DHeat beschikbaar (N wijzigingen), maar deze kopie
     heeft eigen commits die de nieuwste versie niet heeft, dus hij wordt niet
     bijgewerkt. Werk hem bij met git pull." - en hij start de versie die er is;
   - anders "Er is een nieuwere versie van 3DHeat beschikbaar (N wijzigingen)."
     en de vraag **Nu bijwerken? [J/N]**. `N`, of geen antwoord binnen 60 seconden,
     drukt "Niet bijgewerkt; de versie die je hebt wordt gestart." af en start de
     versie die er is. Bij `J`: "Bijwerken...", meldt of `package.json` of
     `package-lock.json` veranderen, draait `git pull --ff-only` (mislukt dat nog
     - het netwerk, bijvoorbeeld: "De update is niet gelukt; de versie die je
     hebt wordt gestart."), daarna `git submodule update --init` (de vastgepinde
     tools, zie [De documentatie onderhouden](maintaining.md#the-tools-under-exporters)),
     daarna `npm install` als de pakketbestanden veranderden en `node_modules`
     bestaat, en "Bijgewerkt."
3. Weigert een tweede server te starten: als er al iets op poort **5273** luistert, zegt het dat en wijst naar `restart.bat` / `stop.bat`.
4. Bij de eerste keer (geen `node_modules`) vraagt het of de afhankelijkheden
   gedownload mogen worden (ongeveer 300 MB in `node_modules\`, niets
   systeembreed).
5. Start de dev-server op `127.0.0.1:5273` (`--strictPort`) en opent de browser
   zodra die klaar is.

`restart.bat` stopt de server (op poort) en draait `start.bat` opnieuw, dus het stelt dezelfde vraag. `stop.bat` stopt alleen.

## Voor ontwikkelaars {#for-developers}

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
