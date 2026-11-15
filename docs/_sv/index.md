---
title: "Start"
nav_order: 1
lang: "sv"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat visar var saker hände i ett spel – var spelare rörde sig, stred och föll – som glödande färger du kan flyga igenom, eller som små 3D-figurer som spelar upp matchen igen.

Läs in positioner – CSV, Parquet, Tacview-inspelningar, konverterade repriser, en enda fil, en mapp eller tusentals matcher – och se dem som en **värmekarta du kan flyga igenom**, som **figurer som spelar upp matchen**, som linjer längs rutterna folk tog, eller som en population mot en annan. Den hittar själv vad som sticker ut, och den körs helt i webbläsaren: ingenting laddas upp någonstans.

![Värme från tio stridsvagnsmatcher över demo valley](../assets/img/en/heat-hero.webp)

**Ny här?** Gör [demodata](demo-data.md) och följ dess sju steg. Varje bild på den här webbplatsen togs med den.

## Vad den gör {#what-it-does}

| | |
|---|---|
| ![Differens](../assets/img/en/heat-difference.webp) | **[Värmelägen](heat-modes.md)** - värme, [differens](difference.md) (rött där ena sidan var mer, grönblått där den andra var), [lagvärme](team-heat.md), [linjevärme](line-heat.md); [riktningsvärme](directional-heat.md) med kilar, pilfält och polardiagram; värme [viktad efter värde](value-weighting.md): vad vapen, fordon och bränsle kostar. |
| ![Repris](../assets/img/en/replay-tanks.webp) | **[Matchrepris](match-replay.md)** - varje enhet som [figuren](figures.md) av vad den är, NATO- eller ryska symboler på långt avstånd, robotar och spårljus, träffmärken, vrak, bränder, torn, mål, Tacview-liknande kameror och taktisk vy; [många matcher samtidigt](many-matches.md). |
| ![Insikter](../assets/img/en/insights.webp) | **[Insikter](insights.md)** - starka positioner, dödlig mark, spawn-fällor, flaskhalsar och framträdande spelare, hittade och rangordnade med underlaget; en skriftlig genomgång, valfritt av en AI du väljer; en kommentator för en match; [kunskapslinsen](knowledge.md). |
| ![Volymer](../assets/img/en/compare.webp) | **[Volymer](volumes.md)** - rita lådor, prismor, cylindrar och sfärer, filtrera till dem, räkna vad som händer inuti, exportera det och jämför platser sida vid sida; [uppdelning](breakdown.md) av vem och vad som gör det bäst på en plats. |
| ![Filter](../assets/img/en/filters.webp) | **[Filter](filters.md)** - efter händelsetyp, spelare eller AI, fordonsklass, värde, valfri kolumn, i grafikkortet oavsett datastorlek. |
| ![Bana](../assets/img/en/level-panel.webp) | **[Banor](levels.md)** - kartbilder, 3D-banor gjorda med [datverktygen](#related-repositories), förenkling, [världsbakgrunden](world-backdrop.md) med riktig terräng för flygdata. |

Dessutom: [Racinganalys](race-analysis.md)-fliken för varv från racingspel, [Match](match-analysis.md)-fliken för sammanfattningar av Counter-Strike 2, [Taktiktavlan](tactics-board.md) för planer på en bana, [träffanalys](hit-analysis.md) per fordon, [massanalys](mass-analysis.md) av tusentals matcher, [kameravägar och video](camera-path-and-video.md), [40 språk](languages.md), [metriska eller engelska enheter](settings.md).

## Flikarna {#the-tabs}

Flikarna sitter överst i sidofältet, under namnet, enheterna och språkmenyn.

| Flik | Vad den är till för |
|---|---|
| **Värmekarta** | Vilken positionstabell som helst: värmelägena, figuröverlägget, filter, volymer, insikter, banor, mätning och video. |
| **Racinganalys** | Två eller fler varv på en bana: var tid går förlorad, varför och vad som ska ändras. |
| **Match** | Figuruppspelningen av en match och sammanfattningar av Counter-Strike 2-matcher. |
| **Taktik** | Planer på en bana: figurer, rutter, kastad utrustning, områden och anteckningar i steg som spelas upp. |
| **Fordon** | Var varje enhet träffades, av vem och med vad. |

## Installera och köra {#install-and-run}

### Windows, det enkla sättet {#windows-the-easy-way}

Förrådets rotmapp innehåller tre batchfiler.

| Fil | Vad den gör |
|---|---|
| `start.bat` | Startar visaren. Hittar Node.js även när det inte finns i `PATH` (den letar i `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` och `%LOCALAPPDATA%\Programs\nodejs`), och när Node.js saknas erbjuder den att installera LTS-versionen med `winget install -e --id OpenJS.NodeJS.LTS`. Vid första körningen frågar den innan den laddar ner beroendena (cirka 300 MB i `node_modules\` i mappen, inget systemomfattande). Den vägrar starta när något redan lyssnar på port 5273 och hänvisar i stället till `restart.bat`. När mappen är en git-kopia utan lokala ändringar och en nyare version finns, frågar den om du vill uppdatera (Y/N; utan svar på 60 s behåller den den här versionen; se [Uppdateringar](updates.md)). Sedan kör den utvecklingsservern på `http://127.0.0.1:5273/` och öppnar webbläsaren. **Fönstret är servern**: lämna det öppet, stäng det eller tryck Ctrl+C för att stoppa. |
| `restart.bat` | Kör `stop.bat quiet` och sedan `start.bat`. Behövs bara efter att du ändrat `vite.config.ts`, lagt till ett beroende eller när servern har fastnat – källkodsändringar laddas om automatiskt. |
| `stop.bat` | Stoppar det som lyssnar på port 5273, med processens id som hittas via `netstat`, aldrig via programnamn, så att andra Node.js-processer på datorn lämnas ifred. Väntar cirka två sekunder tills uttaget har frigjorts. Med argumentet `quiet` pausar den inte i slutet. |

### För hand (valfritt OS) {#by-hand-any-os}


```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

Mappen `exporters/` innehåller de separata datverktygen som git-submoduler, var och en som ett eget förråd; efter en vanlig klon kör du `git submodule update --init`. Visaren i sig behöver dem inte för att köras. `exporters/ext/` innehåller de valfria konverterarna (War Thunder, World of Tanks, World of Warships, Squad-repriser; DCS- och IL-2-kartor), hållna åtskilda så att ett problem med en av dem inte påverkar något annat.

Ingen speldata följer med något av det här: banor, kartor och inspelningar görs på din egen dator med verktygen, från spel du äger.

### npm-skript {#npm-scripts}

| Skript | Vad det kör |
|---|---|
| `npm run dev` | Vite-utvecklingsservern på port 5273, bunden till `127.0.0.1`. |
| `npm run build` | Typkontroll (`tsc --noEmit`) och ett produktionspaket i `dist/`. |
| `npm run preview` | Serverar produktionspaketet. |
| `npm run typecheck` | Enbart typkontrollen. |
| `npm test` / `npm run test:watch` | Enhets- och integrationstester (vitest). |
| `npm run smoke` | Styr den riktiga appen i headless Chromium och kontrollerar att canvasen har datafärgade pixlar; skärmbilder sparas i `tools/.smoke/`. Kräver att utvecklingsservern körs. |
| `npm run smoke:f16` | Samma svit med `?heat=f16`, som tvingar fram vägen för ackumulering i halvprecision (se [Ackumulering i halvprecision](half-float-accumulation.md)). |
| `npm run bench` | Inläsningsbenchmark, skriver `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Tester som behöver stora riktiga datafiler; de hoppar över sig själva när filerna saknas. |
| `npm run inspect -- <file.parquet>` | Skriver ut en Parquet-fils schema och några rader (`tools/inspect-parquet.mjs`). |

### Vad utvecklingsservern lägger till {#what-the-dev-server-adds}

Visaren är en statisk webbsida, men utvecklingsservern (se `vite.config.ts`) lägger till två lokala rutter som en statisk publicering av `dist/` inte har:

- `/__host/memory` rapporterar datorns installerade och lediga RAM och, där det går att läsa, grafikkortets minne (från `nvidia-smi`, eller på Windows från skärmadapterns registerpost). Det är det som gör att [minnesbudgetarna](memory-and-budgets.md) använder riktiga siffror i stället för webbläsarens begränsade gissningar.
- `/__heat3d/update` kontrollerar om kopian ligger efter och kan snabbspola fram den ([Uppdateringar](updates.md)).

Servern binder bara till `127.0.0.1`, så ingen av rutterna går att nå från nätverket. Öppna den som `http://127.0.0.1:5273`: `localhost` kan lösas till IPv6-loopback `::1`, där ingenting lyssnar. Den skickar inga headers för korsursprungsisolering (COOP/COEP): ingenting i visaren använder `SharedArrayBuffer`, och arbetarna lämnar över sin data genom överföring, vilket inte kräver något.

## Krav på webbläsare och GPU {#browser-and-gpu-requirements}

- **En webbläsare med WebGPU eller WebGL2.** WebGPU prövas först (Chrome och Edge har det); utan det används WebGL2-bakänden. WebGL2 måste erbjuda `EXT_color_buffer_float` (rendering till flyttalstexturer), annars visar visaren "Cannot initialise the renderer." Se [De två bakändarna](backends.md). Visaren utvecklas och testas i Chromium; andra webbläsare är inte verifierade.
- **Hårdvaruacceleration påslagen.** När webbläsaren ritar på processorn (SwiftShader, llvmpipe, Microsoft Basic Render Driver och liknande) visar en röd banderoll överst i sidofältet det och hur man åtgärdar det. Se [Identifiering av programvarurendering](software-rendering.md).
- **Ett dedikerat grafikkort hjälper, men krävs inte.** Båda bakändarna begär den högpresterande adaptern. Mängden data som kan hållas i grafikkortet är en budget du kan se och ändra ([Minne och budgetar](memory-and-budgets.md)).
- **Valfria funktioner** använder ytterligare webbläsar-API:er: videorendering kräver WebCodecs `VideoEncoder` med VP9 eller VP8 ([Kameraväg och video](camera-path-and-video.md)); förenkling av banor kräver WebAssembly; att släppa in mappar använder File and Directory Entries API; banbiblioteket använder IndexedDB; gamepads använder Gamepad API.

## Dokumentationskarta {#documentation-map}

**Start**: [Demodata](demo-data.md) · [Läsa in data](getting-data-in.md) ([läsa in filer](loading-files.md), [kolumnmappning](column-mapping.md), [axlar, enheter och tid](axes-units-and-time.md), [sessioner, personer och grupper](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [konverterare](converters.md), [.3dheat](container.md), [minne och budgetar](memory-and-budgets.md))

**Se**: [Värmelägen](heat-modes.md) ([värme](heat.md), [spriteform](sprite-shape.md), [färg och exponering](colour-and-exposure.md), [djup och bortsortering](depth-and-culling.md), [differens](difference.md), [lagvärme](team-heat.md), [linjevärme](line-heat.md), [boxrepris](box-replay.md), [riktningsvärme](directional-heat.md), [värdeviktning](value-weighting.md)) · [Tidslinje](timeline.md) · [Banor](levels.md) ([kartbilder](map-images.md), [3D-banor](model-levels.md), [utseende](level-appearance.md), [bibliotek](level-library.md), [världsbakgrund](world-backdrop.md), [dess källor](world-backdrop-sources.md)) · [Kamera](camera.md) ([handkontroll](gamepad.md), [tangenter](keyboard-reference.md)) · [Kameraväg och video](camera-path-and-video.md)

**Analysera**: [Filter och verktyg](filters-and-tools.md) ([filter](filters.md), [lagslista](teams-list.md), [entiteter](entities.md), [snitt](slice.md), [mätning](measure.md), [volymer](volumes.md), [uppdelning](breakdown.md)) · [Insikter](insights.md) ([kunskapslinsen](knowledge.md)) · [Massanalys](mass-analysis.md)

**Repris**: [Matchrepris](match-replay.md) · [Många matcher samtidigt](many-matches.md) · [Figurer](figures.md) ([i figuröverlägget](figure-replay.md), [krediter](figure-credits.md)) · [Tacview-paritet](tacview-parity.md) · [Träffanalys](hit-analysis.md)

**Andra flikar**: [Racinganalys](race-analysis.md) ([metoden](race-analytics.md), [andra spel](other-games.md)) · [Matchanalys](match-analysis.md) · [Taktiktavla](tactics-board.md) ([hastigheter](tactics-speeds.md))

**Visaren**: [Ordlista](glossary.md) · [Inställningar, enheter och tangenter](settings.md) · [Språk](languages.md) · [Uppdateringar](updates.md) · [Rendering i detalj](rendering-internals.md) ([bakändarna](backends.md), [ackumulering](accumulation.md), [sampling och budgetar](sampling-and-budgets.md), [halvprecision](half-float-accumulation.md), [GPU-minne](gpu-memory.md), [programvarurendering](software-rendering.md), [prestanda och statistik](performance-and-stats.md)) · [Dataformat](data-formats.md) · [Referens](reference.md) · [Underhålla dokumentationen](maintaining.md)

## Relaterade förråd {#related-repositories}

Visaren läser data; de här verktygen skapar den. Vart och ett är ett eget offentligt förråd (MIT) med egen dokumentation. Inget av dem levererar speldata: banor, kartor och inspelningar skapas på din egen dator, från spel du äger.

| Förråd | Vad det gör | Användbart för |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Läser ut banor och nivåer ur arkiven som spel levererar (Forza Horizon, BeamNG, Assetto Corsa Rally; läsare för Unreal, Unity, Frostbite och Source 2) som glTF | en 3D-bana under din värme eller repris |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Spelar in varvtelemetri från gränssnitten som racingspel publicerar, och bygger upp banor från spelvideo | varv för Racinganalys; en bana där inga filer kan läsas |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Insticksprogram för Unreal Editor som exporterar en bana som en glTF-fil | banor i egna Unreal-projekt |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Counter-Strike 2-demos till värmetabeller och matchsammanfattningar, CS2-kartor till geometri | CS2-värme, repriser och fliken Match |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Spelar in ditt spelande i bakgrunden från det som spel publicerar: telemetri, spelintegrationer, loggar, repriser | din egen statistik utan att göra något för hand |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | War Thunder-repriser (`.wrpl`) till tabeller: luft- och markspår, skott, träffar, dödningar, torn, mål | War Thunder-repriser, träffmärken och insikter |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | World of Tanks-repriser till tabeller: varje fordons position, dödsfall och dödningar | World of Tanks-värme och repriser |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | World of Warships-repriser till tabeller: varje fartygs position och sänkningar | World of Warships-värme och repriser |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Squad-serverdemos till tabeller: varje spelares position, lag och squad | Squad-värme och repriser |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | DCS World-terräng från din egen installation till banor: mark, vägar, samhällen, flygfält, fält, vatten | DCS- och Tacview-inspelningar på deras riktiga terräng |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | IL-2 Great Battles-kartor till banor | IL-2-inspelningar på deras karta |

## Källkodens struktur, kort {#source-layout-briefly}

| Mapp | Innehåll |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | Filval, CSV- och Parquet-inläsning, automatisk mappning, validering, minnesmodell, datamängdsbyggare, modelltolkning, klassificering, förenkling, banbibliotek |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | Bildloopen (`engine.ts`), sampling, båda bakändarna, kamera, gamepad, mätning, kameraväg, videoinspelning |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | Programtillståndet (`store.ts`) med alla standardvärden, domäntyperna (`types.ts`), spritekurvan |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | Sidofältets paneler, tidslinje, överlägg |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | Flikarna Racinganalys och Match |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Översättningar |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Insikter: detektorer, genomgång, kommentator, AI-leverantörer, kunskapslinsen |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Massanalys över många matcher |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Volymer, deras statistik, export och jämförelse |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Uppdelning och faktorer |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | Överlägget för många matcher |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | Figurkatalogen och dess byggare |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Träffanalys (fliken Fordon) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | Taktiktavlan |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | Världsbakgrunden |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Måttenheter |
