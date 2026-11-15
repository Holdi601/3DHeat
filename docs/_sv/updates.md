---
title: "Uppdateringar"
nav_order: 21
lang: "sv"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# Uppdateringar

Visaren talar om när en nyare version finns, och uppdaterar sig bara när du säger ja. Ingenting ändras på din dator utan ditt svar.

## Uppdatera visaren {#update-the-viewer}

1. **I sidan.** När en nyare version finns visas en ruta under namnet överst i sidofältet: ”A newer version of 3DHeat is available”. Klicka på **Update now**. Sidan laddas om av sig själv när det är klart. **Later** döljer rutan tills du laddar om sidan.
2. **Om den säger att du ska köra restart.bat** stänger du serverfönstret (det svarta fönstret som `start.bat` öppnade) och dubbelklickar på `restart.bat`.
3. **När du startar visaren.** `start.bat` kontrollerar också. Om en nyare version finns frågar den **Update now? [Y/N]**. Tryck `Y` för att uppdatera. Tryck `N`, eller vänta 60 sekunder utan svar, för att starta den version du har.

![Uppdateringsnotisen med Update now och Later](../assets/img/en/updates-notice.webp)

En kopia med egna ändringar uppdateras aldrig åt dig. Rutan talar bara om att en uppdatering väntar, och säger att du ska checka in eller stasha dina ändringar och köra `git pull`. En kopia som inte installerats med git (en zipfil till exempel) visar ingenting.

Så fungerar kontrollen, steg för steg:

```
sida ---(efter 4 s, sedan var 6 h)---> utvecklingsserver ---> git fetch
   efter?  nej  -> inget visas
           ja   -> egna ändringar eller incheckningar?  ja -> bara ett meddelande
                                                      nej -> [Update now] -> git pull
                                                             -> ladda om, eller "run restart.bat"
```

## Säkerhetsreglerna {#the-safety-rules}

- **Bara snabbspolning** (`git pull --ff-only`): en uppdatering slår aldrig ihop, rebasar eller skriver om något.
- **Inga lokala ändringar**: en kopia med ocheckade ändringar i spårade filer (`git status --porcelain --untracked-files=no` är inte tom) uppdateras aldrig automatiskt. Någons eget arbete är inte en uppdaterings att skriva över. Den får bara veta att en uppdatering väntar. Ospårade filer (data, exporter) räknas inte som ändringar.
- **Inga lokala incheckningar**: en kopia med incheckningar som uppströms saknar (”diverged”) uppdateras inte. En snabbspolning kan inte föra upp den, och sammanslagning är för `git pull` för hand. Sidan och `start.bat` säger det med samma ord, och `start.bat` startar den version som finns där.
- **Bara från sidan själv**: utvecklingsserverns uppdateringsbegäran måste bära en egen header och, när webbläsaren skickar en `Origin`, komma från serverns egen värd (nedan).
- Bara en git-kopia med en uppströms gren uppdateras någonsin. Allt annat (en kopia utan `.git`, ingen git installerad, en statisk build) lämnas ifred och säger ingenting.

## Vad start.bat gör {#what-startbat-does}

`start.bat` (dubbelklicka på den; fönstret är servern) gör, i ordning:

1. Hittar Node.js: i `PATH`, annars i `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` eller `%LOCALAPPDATA%\Programs\nodejs`. Saknas det erbjuds att installera det med `winget install -e --id OpenJS.NodeJS.LTS` (frågar, Y/N). Sedan måste fönstret öppnas igen så att Windows plockar upp den nya `PATH`.
2. **Uppdateringar**, när git är installerat och mappen har `.git`:
   - `git fetch --quiet` (utan nätverk eller uppström hoppas det över tyst);
   - räknar `git rev-list --count HEAD..@{u}`. Inget efter: inget sägs;
   - lokala ändringar: ”A newer version of 3DHeat is available (N changes), but this copy has local changes, so it is not updated. Commit or stash them, then run git pull.” Den startar den version som finns där;
   - egna incheckningar (`git rev-list --count @{u}..HEAD` är inte 0): ”A newer version of 3DHeat is available (N changes), but this copy has commits of its own …, so it is not updated. Update it with git pull.” Den startar den version som finns där;
   - annars ”A newer version of 3DHeat is available (N changes).” och frågan **Update now? [Y/N]**. `N`, eller inget svar på 60 sekunder, skriver ”Not updated; starting the version you have.” och startar den version som finns där. Vid `Y` skrivs ”Updating...”, det noteras om `package.json` eller `package-lock.json` ändras, och `git pull --ff-only` körs. Skulle det ändå misslyckas, till exempel på grund av nätverket, skrivs ”The update did not go through; starting the version you have.”. Sedan körs `git submodule update --init` (de fästa verktygen, se [Underhålla dokumentationen](maintaining.md#the-tools-under-exporters)), sedan `npm install` när paketfilerna ändrats och `node_modules` finns, och till sist ”Updated.”
3. Startar inte en andra server. När något redan lyssnar på port **5273** säger den det och hänvisar till `restart.bat` / `stop.bat`.
4. Vid första körningen (ingen `node_modules`) frågar den innan den laddar ner beroendena (cirka 300 MB i `node_modules\`, inget systemomfattande).
5. Startar utvecklingsservern på `127.0.0.1:5273` (`--strictPort`) och öppnar webbläsaren när den är redo.

`restart.bat` stoppar servern (via port) och kör `start.bat` igen, så den frågar samma fråga. `stop.bat` stoppar bara.

## För utvecklare {#for-developers}


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

