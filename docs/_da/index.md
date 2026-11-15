---
title: "Start"
nav_order: 1
lang: "da"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat viser, hvor ting skete i et spil – hvor spillerne bevægede sig, kæmpede og faldt – som lysende farver, du kan flyve igennem, eller som små 3D-figurer, der genafspiller kampen.

Indlæs positioner – CSV, Parquet, Tacview-optagelser, konverterede replays, en enkelt fil, en mappe eller tusindvis af kampe – og se dem som et **heatmap, du kan flyve igennem**, som **figurer, der genafspiller kampen**, som linjer langs de ruter, folk tog, eller som én population mod en anden. Det finder selv det, der skiller sig ud, og det kører helt i din browser: intet uploades nogen steder.

![Varme fra ti tankkampe over Demo Valley](../assets/img/en/heat-hero.webp)

**Ny her?** Lav [demodataene](demo-data.md) og følg dens syv trin. Alle billeder på dette websted er taget med dem.

## Hvad den gør {#what-it-does}

| | |
|---|---|
| ![Forskel](../assets/img/en/heat-difference.webp) | **[Varmetilstande](heat-modes.md)** – varme, [forskel](difference.md) (rødt hvor den ene side var flest, grøn-blå hvor den anden var), [holdvarme](team-heat.md), [linjevarme](line-heat.md); [retningsvarme](directional-heat.md) med kiler, pilfelter og polardiagrammer; varme [vægtet efter værdi](value-weighting.md): hvad våben, køretøjer og brændstof koster. |
| ![Replay](../assets/img/en/replay-tanks.webp) | **[Kamp-replay](match-replay.md)** – hver enhed som den [figur](figures.md), den er, NATO- eller russiske symboler på afstand, missiler og sporstoffer, træfmærker, vrag, brande, tårne, mål og Tacview-lignende kameraer og taktisk visning; [mange kampe på én gang](many-matches.md). |
| ![Indsigter](../assets/img/en/insights.webp) | **[Indsigter](insights.md)** – stærke positioner, farligt terræn, spawn-fælder, flaskehalse og markante spillere, fundet og rangeret med beviserne; en skriftlig gennemgang, eventuelt af en AI efter dit valg; en kommentator for én kamp; [vidensobjektivet](knowledge.md). |
| ![Volumener](../assets/img/en/compare.webp) | **[Volumener](volumes.md)** – tegn bokse, prismer, cylindre og kugler, filtrér til dem, tæl det, der sker indeni, eksportér det, og sammenlign steder side om side; [opdeling](breakdown.md) af, hvem og hvad der klarer sig bedst et sted. |
| ![Filtre](../assets/img/en/filters.webp) | **[Filtre](filters.md)** – efter hændelsestype, spiller eller AI, køretøjsklasse, værdi og enhver kolonne, i grafikkortet ved enhver datamængde. |
| ![Bane](../assets/img/en/level-panel.webp) | **[Baner](levels.md)** – kortbilleder, 3D-baner lavet med [dataværktøjerne](#related-repositories), forenkling, [verdensbaggrunden](world-backdrop.md) med rigtigt terræn til flydata. |

Desuden: fanen [Løbsanalyse](race-analysis.md) til omgange i racerspil, fanen [Kamp](match-analysis.md) til opsummeringer af Counter-Strike 2, [Taktiktavlen](tactics-board.md) til planer på en bane, [træfanalyse](hit-analysis.md) pr. køretøj, [massanalyse](mass-analysis.md) af tusindvis af kampe, [kamerabaner og video](camera-path-and-video.md), [40 sprog](languages.md) og [metriske eller imperiale enheder](settings.md).

## Fanerne {#the-tabs}

Fanerne sidder øverst i sidebjælken, under navnet, enhederne og sprogmenuen.

| Fane | Til hvad den bruges |
|---|---|
| **Heatmap** | Enhver positionstabel: varmetilstandene, figuroverlejringen, filtre, volumener, indsigter, baner, måling og video. |
| **Løbsanalyse** | To eller flere omgange på samme bane: hvor tid går tabt, hvorfor, og hvad der skal ændres. |
| **Kamp** | Figur-replayet af en kamp og opsummeringer af Counter-Strike 2-kampe. |
| **Taktik** | Planer på en bane: figurer, ruter, kastet hjælpemidler, områder og noter i trin, der kan afspilles. |
| **Køretøjer** | Hvor hver enhed blev ramt, af hvem og med hvad. |

## Installation og kørsel {#install-and-run}

### Windows, den nemme vej {#windows-the-easy-way}

Repositoriets rodmappe indeholder tre batch-filer.

| Fil | Hvad den gør |
|---|---|
| `start.bat` | Starter vieweren. Finder Node.js, også når det ikke er på `PATH` (den kigger i `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` og `%LOCALAPPDATA%\Programs\nodejs`), og mangler Node.js, tilbyder den at installere LTS-udgaven med `winget install -e --id OpenJS.NodeJS.LTS`. Ved første kørsel spørger den, før den henter afhængighederne (ca. 300 MB i `node_modules\` inde i mappen, intet systemvidt). Den nægter at starte, når noget allerede lytter på port 5273, og henviser i stedet til `restart.bat`. Når mappen er et git-checkout uden lokale ændringer, og en nyere version findes, spørger den, om den vil opdatere (Y/N; uden svar i 60 s beholdes denne version; se [Opdateringer](updates.md)). Derefter kører den udviklingsserveren på `http://127.0.0.1:5273/` og åbner browseren. **Vinduet er serveren**: lad det være åbent, eller luk det, eller tryk Ctrl+C for at stoppe. |
| `restart.bat` | Kører `stop.bat quiet` og derefter `start.bat`. Kun nødvendig efter ændring af `vite.config.ts`, tilføjelse af en afhængighed, eller når serveren er gået i stå – ændringer i kildekoden indlæses automatisk igen (hot reload). |
| `stop.bat` | Stopper det, der lytter på port 5273, efter proces-id fundet via `netstat`, aldrig efter programnavn, så andre Node.js-processer på maskinen lades i fred. Venter ca. to sekunder, før porten frigives. Med argumentet `quiet` pauser den ikke til sidst. |

### Manuelt (alle systemer) {#by-hand-any-os}

```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

`exporters/`-mappen indeholder de særskilte dataværktøjer som git-submoduler, hver sit eget repositorium; efter en almindelig kloning kør `git submodule update --init`. Vieweren selv har ikke brug for dem for at køre. `exporters/ext/` indeholder de valgfrie konvertere (War Thunder, World of Tanks, World of Warships, Squad-replays; DCS- og IL-2-kort), holdt adskilt, så et problem med én af dem ikke påvirker noget andet.

Der følger ingen spildata med: baner, kort og optagelser laves på din egen maskine med værktøjerne, ud fra spil du ejer.

### npm-scripts {#npm-scripts}

| Script | Hvad det kører |
|---|---|
| `npm run dev` | Vite-udviklingsserveren på port 5273, bundet til `127.0.0.1`. |
| `npm run build` | Typetjek (`tsc --noEmit`) og en produktionsbundle i `dist/`. |
| `npm run preview` | Serverer produktionsbundlen. |
| `npm run typecheck` | Typetjekket alene. |
| `npm test` / `npm run test:watch` | Enheds- og integrationstests (vitest). |
| `npm run smoke` | Kører den rigtige app i headless Chromium og kontrollerer, at canvas har datafarvede pixels; skærmbilleder gemmes i `tools/.smoke/`. Forventer, at udviklingsserveren kører. |
| `npm run smoke:f16` | Samme suite med `?heat=f16`, som tvinger stien med akkumulering i halv præcision (se [Akkumulering i halv præcision](half-float-accumulation.md)). |
| `npm run bench` | Indlæsningsbenchmark, skriver `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Tests, der kræver store rigtige datafiler; de springer sig selv over, når filerne mangler. |
| `npm run inspect -- <file.parquet>` | Udskriver en Parquet-fils skema og nogle rækker (`tools/inspect-parquet.mjs`). |

### Hvad udviklingsserveren tilføjer {#what-the-dev-server-adds}

Vieweren er en statisk websside, men udviklingsserveren (se `vite.config.ts`) tilføjer to lokale ruter, som en statisk udrulning af `dist/` ikke har:

- `/__host/memory` rapporterer maskinens installerede og ledige RAM og, hvor det kan læses, grafikkortets hukommelse (fra `nvidia-smi`, eller på Windows fra skærmadapterens registreringsdatabase). Det er det, der gør, at [hukommelsesbudgetterne](memory-and-budgets.md) bruger rigtige tal i stedet for browserens begrænsede gæt.
- `/__heat3d/update` tjekker, om checkout'et er bagud, og kan hente de nyeste ændringer ([Opdateringer](updates.md)).

Serveren binder kun til `127.0.0.1`, så ingen af ruterne kan nås fra netværket. Åbn den som `http://127.0.0.1:5273`: `localhost` kan blive til IPv6-loopback `::1`, hvor intet lytter. Den sender ingen cross-origin isolation-headere (COOP/COEP): intet i vieweren bruger `SharedArrayBuffer`, og workerne overfører deres data ved transfer, hvilket ikke kræver dem.

## Krav til browser og GPU {#browser-and-gpu-requirements}

- **En browser med WebGPU eller WebGL2.** WebGPU prøves først (Chrome og Edge har det); uden det bruges WebGL2-backend'en. WebGL2 skal tilbyde `EXT_color_buffer_float` (rendering til float-teksturer), ellers viser vieweren "Kan ikke initialisere rendereren." Se [De to backends](backends.md). Vieweren udvikles og testes i Chromium; andre browsere er ikke verificeret.
- **Hardwareacceleration slået til.** Når browseren tegner på processoren (SwiftShader, llvmpipe, Microsoft Basic Render Driver og lignende), viser et rødt banner øverst i sidebjælken det og, hvordan det rettes. Se [Registrering af softwarerendering](software-rendering.md).
- **Et dedikeret grafikkort hjælper, men er ikke påkrævet.** Begge backends beder om den højtydende adapter. Mængden af data, der kan holdes på grafikkortet, er et budget, du kan se og ændre ([Hukommelse og budgetter](memory-and-budgets.md)).
- **Valgfrie funktioner** bruger yderligere browser-API'er: videooptagelse kræver WebCodecs `VideoEncoder` med VP9 eller VP8 ([Kamerabane og video](camera-path-and-video.md)); mesh-forenkling af baner kræver WebAssembly; slip af mapper bruger File and Directory Entries API; banebiblioteket bruger IndexedDB; gamepads bruger Gamepad API.

## Dokumentationskort {#documentation-map}

**Start**: [Demodata](demo-data.md) · [Indlæs data](getting-data-in.md) ([indlæsning af filer](loading-files.md), [kolonnetilknytning](column-mapping.md), [akser, enheder og tid](axes-units-and-time.md), [sessioner, personer og grupper](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [konvertere](converters.md), [.3dheat](container.md), [hukommelse og budgetter](memory-and-budgets.md))

**Se**: [Varmetilstande](heat-modes.md) ([varme](heat.md), [spriteform](sprite-shape.md), [farve og eksponering](colour-and-exposure.md), [dybde og culling](depth-and-culling.md), [forskel](difference.md), [holdvarme](team-heat.md), [linjevarme](line-heat.md), [boksreplay](box-replay.md), [retningsvarme](directional-heat.md), [værdivægtning](value-weighting.md)) · [Tidslinje](timeline.md) · [Baner](levels.md) ([kortbilleder](map-images.md), [3D-baner](model-levels.md), [udseende](level-appearance.md), [bibliotek](level-library.md), [verdensbaggrund](world-backdrop.md), [dens kilder](world-backdrop-sources.md)) · [Kamera](camera.md) ([gamepad](gamepad.md), [taster](keyboard-reference.md)) · [Kamerabane og video](camera-path-and-video.md)

**Analysér**: [Filtre og værktøjer](filters-and-tools.md) ([filtre](filters.md), [hold](teams-list.md), [enheder](entities.md), [snit](slice.md), [måling](measure.md), [volumener](volumes.md), [opdeling](breakdown.md)) · [Indsigter](insights.md) ([vidensobjektivet](knowledge.md)) · [Massanalyse](mass-analysis.md)

**Replay**: [Kamp-replay](match-replay.md) · [Mange kampe på én gang](many-matches.md) · [Figurer](figures.md) ([i figuroverlejringen](figure-replay.md), [kreditering](figure-credits.md)) · [Tacview-paritet](tacview-parity.md) · [Træfanalyse](hit-analysis.md)

**Andre faner**: [Løbsanalyse](race-analysis.md) ([metoden](race-analytics.md), [andre spil](other-games.md)) · [Kampanalyse](match-analysis.md) · [Taktiktavlen](tactics-board.md) ([hastigheder](tactics-speeds.md))

**Vieweren**: [Ordliste](glossary.md) · [Indstillinger, enheder og taster](settings.md) · [Sprog](languages.md) · [Opdateringer](updates.md) · [Renderingens indre](rendering-internals.md) ([backends](backends.md), [akkumulering](accumulation.md), [sampling og budgetter](sampling-and-budgets.md), [halv præcision](half-float-accumulation.md), [GPU-hukommelse](gpu-memory.md), [softwarerendering](software-rendering.md), [ydelsespanel og statistik](performance-and-stats.md)) · [Dataformater](data-formats.md) · [Reference](reference.md) · [Vedligeholdelse af dokumentationen](maintaining.md)

## Relaterede repositorier {#related-repositories}

Vieweren læser data; disse værktøjer laver dem. Hvert er sit eget offentlige repositorium (MIT) med egen dokumentation. Ingen af dem leverer spildata: baner, kort og optagelser laves på din egen maskine, ud fra spil du ejer.

| Repositorium | Hvad det gør | Nyttigt til |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Læser racerbaner og baner ud af de arkiver, spil leverer (Forza Horizon, BeamNG, Assetto Corsa Rally; læsere til Unreal, Unity, Frostbite og Source 2), som glTF | en 3D-bane under din varme eller dit replay |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Optager omgangstelemetri fra de grænseflader, racerspil udgiver, og genskaber baner ud fra spilvideo | omgange til Løbsanalyse; en bane, hvor ingen filer kan læses |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Unreal Editor-plugin, der eksporterer en bane som én glTF-fil | baner i dine egne Unreal-projekter |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Counter-Strike 2-demoer til heatmap-tabeller og kampopsummeringer, CS2-kort til geometri | CS2-varme, replays og fanen Kamp |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Optager dit spil i baggrunden ud fra det, spil udgiver: telemetri, game-state-integrationer, logfiler, replays | din egen statistik uden at gøre noget manuelt |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | War Thunder-replays (`.wrpl`) til tabeller: spor i luften og på jorden, skud, træffere, drab, tårne, mål | War Thunder-replays, træfmærker og indsigter |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | World of Tanks-replays til tabeller: hvert køretøjs position, dødsfald og drab | World of Tanks-varme og replays |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | World of Warships-replays til tabeller: hvert skibs position og sænkninger | World of Warships-varme og replays |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Squad-serverdemoer til tabeller: hver spillers position, hold og trop | Squad-varme og replays |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | DCS World-terræner fra din egen installation til baner: jord, veje, byer, flyvepladser, marker, vand | DCS- og Tacview-optagelser på deres rigtige terræn |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | IL-2 Great Battles-kort til baner | IL-2-optagelser på deres kort |

## Kildekodens opbygning, kort {#source-layout-briefly}

| Mappe | Indhold |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | Filvalg, CSV- og Parquet-indlæsning, automatisk tilknytning, validering, hukommelsesmodel, datasætbygger, modelparsing, klassificering, forenkling, banebibliotek |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | Billedløkken (`engine.ts`), sampling, begge backends, kamera, gamepad, måling, kamerabane, videooptagelse |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | Applikationens tilstand (`store.ts`) med alle standardværdier, domænetyperne (`types.ts`), sprite-kurven |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | Sidebjælkens paneler, tidslinje, overlejringer |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | Fanerne Løbsanalyse og Kamp |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Oversættelser |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Indsigter: detektorer, gennemgang, kommentator, AI-udbydere, vidensobjektivet |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Massanalyse over mange kampe |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Volumener, deres statistik, eksport og sammenligning |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Opdeling og faktorer |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | Overlejringen for mange kampe |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | Figurkataloget og dets bygger |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Træfanalyse (fanen Køretøjer) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | Taktiktavlen |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | Verdensbaggrunden |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Måleenheder |
