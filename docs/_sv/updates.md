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

1. **I sidan.** När en nyare version finns visas en ruta under namnet överst i sidofältet: ”A newer version of 3DHeat is available”. Klicka på **Update now**. Sidan laddas om av sig själv när det är klart. **Senare** döljer rutan tills du laddar om sidan.
2. **Om den säger att du ska köra restart.bat** stänger du serverfönstret (det svarta fönstret som `start.bat` öppnade) och dubbelklickar på `restart.bat`.
3. **När du startar visaren.** `start.bat` kontrollerar också. Om en nyare version finns frågar den **Update now? [Y/N]**. Tryck `Y` för att uppdatera. Tryck `N`, eller vänta 60 sekunder utan svar, för att starta den version du har.

![Uppdateringsnotisen med Update now och Later](../assets/img/sv/updates-notice.webp)

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


### Medan den körs: uppdateringsrutten {#while-it-runs-the-update-route}

Utvecklingsservern (Vite-insticksprogrammet `heat3d-self-update` i `vite.config.ts`) serverar `/__heat3d/update`. Den finns bara på utvecklingsservern, inte i en statisk build och inte i `vite preview`.

**`GET /__heat3d/update`** svarar på om kopian ligger efter:

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- `checkout: false` när mappen inte är en git-kopia;
- den kör `git fetch --quiet` **högst var 30:e minut** (förfrågningar emellan svarar utifrån det som hämtades senast);
- `behind` / `ahead` från `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`, `dirty` från `git status --porcelain --untracked-files=no`, `latest` är ämnesraden för uppströmsgrenens senaste incheckning;
- utan uppströmsgren blir `upstream: null` och `behind: 0`.

**`POST /__heat3d/update/apply`** hämtar in uppdateringen i kopian:

1. Nekas med `403 { ok: false, reason: "forbidden" }` om inte förfrågan bär headern `X-Heat3d-Update: 1` och, när den bär en `Origin`, att originens värd är förfrågans `Host`. Ett formulär från en annan sajt kan inte skicka en egen header utan en CORS-preflight, och den servern ger aldrig en sådan.
2. Inget att göra (ingen git-kopia, ingen uppström, inte efter): `{ ok: true, updated: false }`.
3. Lokala ändringar: `{ ok: false, reason: "dirty" }`; egna incheckningar: `{ ok: false, reason: "diverged" }`.
4. Annars: noterar vilka filer som ändras (`git diff --name-only HEAD @{u}`), kör `git pull --ff-only` (tidsgräns 2 min), `git submodule update --init` (fel ignoreras), `npm install` när `package.json` eller `package-lock.json` har ändrats (tidsgräns 15 min), och svarar `{ ok: true, updated: true, restart }`. `restart` anger varför den körande servern inte kan plocka upp uppdateringen: `"dependencies"` när beroendena installerats om, `"config"` när bara en `vite.config`-fil ändrats, `false` när inget behöver startas om.
5. Ett misslyckat git- eller npm-kommando svarar `{ ok: false, reason: "<felet, upp till 300 tecken>" }`.

Svaren är JSON med `Cache-Control: no-store`. Servern lyssnar bara på `127.0.0.1`, så rutten går inte att nå från nätverket.

### Noticen på sidan {#the-notice-in-the-page}

`UpdateBanner`, under namnet överst i sidofältet:

- Den frågar rutten **4 sekunder** efter att sidan laddats (inte under de första sekunderna, då sidan har en datamängd att läsa in och en GPU att starta) och igen **var sjätte timme** så länge sidan är öppen.
- Den visar **ingenting** när det inte finns någon sådan rutt (en statisk build), mappen inte är en kopia, eller inget är nyare. En notis vid varje start är något folk lär sig att ignorera.
- Efter, utan lokala ändringar: "A newer version of 3DHeat is available (N changes, the newest: <subject>)." med **Update now** och **Later** (*Senare* döljer den tills sidan laddas om).
- Efter, med lokala ändringar: samma mening och "This copy has local changes, so it is not updated automatically; commit or stash them, then run git pull." Ingen knapp.
- **Update now** skickar till `/apply` ("Updating..."). Sedan:
  - "Updated. The page reloads." och sidan laddas om 1,5 s senare (servern serverar redan de nya filerna);
  - när beroendena installerats om: "Updated. Its dependencies changed: close the server window and run **restart.bat** to finish.";
  - när bara serverns inställningar ändrats: "Updated. Its server settings changed: close the server window and run **restart.bat** to finish.";
  - inget att hämta efter allt (`updated: false`, kopian uppdaterades under tiden, till exempel av `start.bat`): "Nothing to update: this copy is already the newest version." Ingen omladdning;
  - nekat: meningen om *dirty*, eller "This copy has commits of its own that the newest version does not; update it with git pull.", eller "The update did not go through: <reason>".
