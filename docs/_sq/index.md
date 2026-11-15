---
title: "Kryefaqja"
nav_order: 1
lang: "sq"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat tregon se ku ndodhën gjërat në një lojë - ku shkuan lojtarët, ku luftuan dhe ku ranë - si ngjyra që shkëlqejnë, nëpër të cilat mund të fluturosh, ose si figura të vogla 3D që riluajnë ndeshjen.

Ngarko pozicionet - CSV, Parquet, regjistrime Tacview, riluajtje të konvertuara, një skedar i vetëm, një dosje ose mijëra ndeshje - dhe shiko them si **hartë nxehtësie nëpër të cilën mund të fluturosh**, si **figura që riluajnë ndeshjen**, si vija përgjatë rrugëve që ndoqën njerëzit, ose si një popullatë kundër një tjetre. Ajo gjen vetë ato që dallojnë, dhe punon tërësisht në shfletuesin tënd: asgjë nuk ngarkohet askund.

![Nxehtësia e dhjetë ndeshjeve me tanke mbi demo valley](../assets/img/en/heat-hero.webp)

**Je i ri këtu?** Krijo [të dhënat demo](demo-data.md) dhe ndiq shtatë hapat e tyre. Çdo foto në këtë faqe u bë me to.

## Çfarë bën {#what-it-does}

| | |
|---|---|
| ![Diferenca](../assets/img/en/heat-difference.webp) | **[Mënyrat e nxehtësisë](heat-modes.md)** - nxehtësi, [diferencë](difference.md) (e kuqe aty ku njëra palë ishte më shumë, e gjelbër-blu aty ku ishte tjetra), [nxehtësi ekipi](team-heat.md), [nxehtësi vijash](line-heat.md); [nxehtësi sipas drejtimit](directional-heat.md) me sektorë, fusha shigjetash dhe grafikë polarë; nxehtësi [e peshuar sipas vlerës](value-weighting.md): sa kushtojnë armët, mjetet dhe karburanti. |
| ![Riluajtja](../assets/img/en/replay-tanks.webp) | **[Riluajtja e ndeshjes](match-replay.md)** - çdo njësi si [figura](figures.md) e asaj që është, simbole NATO ose ruse kur është larg, raketa dhe tracerë, shenja goditjesh, mbetje, zjarre, kulla, objektiva, kamera në stilin e Tacview dhe ekran taktik; [shumë ndeshje njëherësh](many-matches.md). |
| ![Vëzhgime](../assets/img/en/insights.webp) | **[Vëzhgime](insights.md)** - pozicione të forta, tokë vdekjeprurëse, kurthe lindjeje, grykë dhe lojtarë që dallohen, të gjetura dhe të renditura me provat; një përmbledhje me shkrim, opsionalisht nga një IA sipas zgjedhjes sate; një komentues për një ndeshje; [lente e njohurive](knowledge.md). |
| ![Vëllime](../assets/img/en/compare.webp) | **[Vëllime](volumes.md)** - vizato kuti, prizma, cilindra dhe sfera, filtro sipas tyre, numëro çfarë ndodh brenda, eksporto dhe krahaso vende një pranë tjetrit; [zbërthimi](breakdown.md) i asaj që del më mirë, kush dhe çfarë, në një vend. |
| ![Filtrat](../assets/img/en/filters.webp) | **[Filtrat](filters.md)** - sipas llojit të ngjarjes, lojtarit ose IA-së, klasës së mjetit, vlerës, çdo kolone, në kartën grafike me çfarëdo madhësie të dhënash. |
| ![Niveli](../assets/img/en/level-panel.webp) | **[Nivelet](levels.md)** - imazhe hartash, nivele 3D të bëra me [veglat e të dhënave](#related-repositories), thjeshtim, [sfondi botëror](world-backdrop.md) me terren real për të dhënat e fluturimit. |

Gjithashtu: skeda [Analiza e garës](race-analysis.md) për xhiro të lojërave me makina, skeda [Ndeshja](match-analysis.md) për përmbledhjet e Counter-Strike 2, [Tabela e taktikave](tactics-board.md) për plane mbi një nivel, [analiza e goditjeve](hit-analysis.md) për çdo mjet, [analiza masive](mass-analysis.md) e mijëra ndeshjeve, [rrugët e kamerës dhe videoja](camera-path-and-video.md), [40 gjuhë](languages.md), [njësi metrike ose imperiale](settings.md).

## Skedat {#the-tabs}

Skedat ndodhen lart në shiritin anësor, nën emrin, njësitë dhe menynë e gjuhës.

| Skeda | Për çfarë është |
|---|---|
| **Harta e nxehtësisë** | Çdo tabelë pozicionesh: mënyrat e nxehtësisë, mbivendosja e figurave, filtrat, vëllimet, vëzhgimet, nivelet, matjet dhe videoja. |
| **Analiza e garës** | Dy ose më shumë xhiro të një pisteje: ku humbet koha, pse, dhe çfarë duhet ndryshuar. |
| **Ndeshja** | Riluajtja me figura e një ndeshjeje, dhe përmbledhjet e ndeshjeve të Counter-Strike 2. |
| **Taktika** | Plane mbi një nivel: figura, rrugë, hedhje, zona dhe shënime në hapa që luhen. |
| **Mjetet** | Ku u goditi çdo njësi, nga kush dhe me çfarë. |

## Instalimi dhe ekzekutimi {#install-and-run}

### Windows, mënyra e lehtë {#windows-the-easy-way}

Rrënja e depos përmban tre skedarë batch.

| Skedari | Çfarë bën |
|---|---|
| `start.bat` | Nis shikuesin. Gjen Node.js edhe kur nuk është në `PATH` (kërkon në `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` dhe `%LOCALAPPDATA%\Programs\nodejs`), dhe kur Node.js mungon, ofron ta instalojë versionin LTS me `winget install -e --id OpenJS.NodeJS.LTS`. Në nisjen e parë pyet para se të shkarkojë varësitë (rreth 300 MB në `node_modules\` brenda dosjes, asgjë në nivel sistemi). Refuzon të nisë kur diçka dëgjon tashmë portin 5273, dhe të drejton te `restart.bat`. Kur dosja është një checkout git pa ndryshime lokale dhe ekziston një version më i ri, pyet nëse do të përditësohet (Y/N; pa përgjigje për 60 s mban këtë version; shih [Përditësimet](updates.md)). Pastaj nis serverin e zhvillimit në `http://127.0.0.1:5273/` dhe hap shfletuesin. **Dritarja është serveri**: lëre të hapur, mbylle ose shtyp Ctrl+C për ta ndalur. |
| `restart.bat` | Nis `stop.bat quiet`, pastaj `start.bat`. Nevojitet vetëm pasi ndryshohet `vite.config.ts`, shtohet një varësi, ose kur serveri është ngecur - ndryshimet në kod ringarkohen vetë. |
| `stop.bat` | Ndal çfarëdo që dëgjon portin 5273, duke gjetur ID-në e procesit me `netstat`, kurrë sipas emrit të imazhit, kështu që proceset e tjera Node.js në kompjuter lihen rehat. Pret rreth dy sekonda që soketi të lirohet. Me argumentin `quiet` nuk pauzon në fund. |

### Me dorë (çdo OS) {#by-hand-any-os}


```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

Dosja `exporters/` mban veglat e veçanta të të dhënave si git submodules, secila depo e vet; pas një klonimi të thjeshtë ekzekuto `git submodule update --init`. Vetë shikuesi nuk ka nevojë për to për të punuar. `exporters/ext/` mban konvertuesit opsionalë (War Thunder, World of Tanks, World of Warships, riluajtjet e Squad; hartat e DCS dhe IL-2), të ndarë që një problem me njërin të mos prekë asnjërin tjetër.

Asnjë e dhënë loje nuk vjen me asgjë nga këto: nivelet, hartat dhe regjistrimet bëhen në kompjuterin tënd me veglat, nga lojërat që zotëron.

### Skriptet e npm {#npm-scripts}

| Skripti | Çfarë ekzekuton |
|---|---|
| `npm run dev` | Serveri Vite i zhvillimit në portin 5273, i lidhur me `127.0.0.1`. |
| `npm run build` | Kontroll i tipeve (`tsc --noEmit`) dhe një paketë prodhimi në `dist/`. |
| `npm run preview` | Shërben paketën e prodhimit. |
| `npm run typecheck` | Vetëm kontrolli i tipeve. |
| `npm test` / `npm run test:watch` | Testet e njësive dhe të integrimit (vitest). |
| `npm run smoke` | Drejton aplikacionin e vërtetë në Chromium pa ekran dhe kontrollon që kanvasi ka piksele me ngjyra të dhënash; pamjet shkojnë në `tools/.smoke/`. Pret që serveri i zhvillimit të jetë i ndezur. |
| `npm run smoke:f16` | I njëjti grup me `?heat=f16`, duke detyruar rrugën e grumbullimit me gjysmë-pikë lundruese (shih [Grumbullimi me gjysmë-pikë lundruese](half-float-accumulation.md)). |
| `npm run bench` | Test shpejtësie i futjes së të dhënave, shkruan `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Testet që kanë nevojë për skedarë të mëdhenj të dhënash reale; kalojnë vetë kur skedarët mungojnë. |
| `npm run inspect -- <file.parquet>` | Shfaq skemën e një skedari Parquet dhe disa rreshta (`tools/inspect-parquet.mjs`). |

### Çfarë shton serveri i zhvillimit {#what-the-dev-server-adds}

Shikuesi është një faqe web statike, por serveri i zhvillimit (shih `vite.config.ts`) shton dy rrugë lokale që një shpërndarje statike e `dist/` nuk i ka:

- `/__host/memory` raporton RAM-in e instaluar dhe të lirë të kompjuterit dhe, aty ku mund ta lexojë, kujtesën e kartës grafike (nga `nvidia-smi`, ose në Windows nga regjistri i kartës së ekranit). Kjo lejon që [buxhetet e kujtesës](memory-and-budgets.md) të përdorin shifra reale në vend të vlerësimeve të kufizuara të shfletuesit.
- `/__heat3d/update` kontrollon nëse checkout-i është pas dhe mund ta përditësojë me fast-forward ([Përditësimet](updates.md)).

Serveri lidhet vetëm me `127.0.0.1`, kështu që asnjëra prej rrugëve nuk arrihet nga rrjeti. Hape si `http://127.0.0.1:5273`: `localhost` mund të zgjidhet në loopback-un IPv6 `::1`, ku nuk dëgjon askush. Nuk dërgon header-a të izolimit ndërburimor (COOP/COEP): asgjë në shikues nuk përdor `SharedArrayBuffer`, dhe punëtorët i dorëzojnë të dhënat me transfer, që nuk kërkon asgjë tjetër.

## Kërkesat e shfletuesit dhe të GPU-së {#browser-and-gpu-requirements}

- **Një shfletues me WebGPU ose WebGL2.** WebGPU provohet e para (Chrome dhe Edge e kanë); pa të përdoret backend-i WebGL2. WebGL2 duhet të ofrojë `EXT_color_buffer_float` (vizatim në tekstura me pikë lundruese), përndryshe shikuesi shfaq «Renderuesi nuk mund të inicializohet.» Shih [Dy backend-et](backends.md). Shikuesi zhvillohet dhe testohet në Chromium; shfletuesit e tjerë nuk janë verifikuar.
- **Akseleratori i harduerit i ndezur.** Kur shfletuesi vizaton në CPU (SwiftShader, llvmpipe, Microsoft Basic Render Driver dhe të ngjashme), një banderolë e kuqe në krye të shiritit anësor e thotë këtë dhe si ta rregullosh. Shih [Zbulimi i vizatimit me softuer](software-rendering.md).
- **Një GPU e veçantë ndihmon, por nuk kërkohet.** Të dy backend-et kërkojnë adaptorin me performancë të lartë. Sasia e të dhënave që mund të mbahen në GPU është një buxhet që e sheh dhe e ndryshon ([Kujtesa dhe buxhetet](memory-and-budgets.md)).
- **Veçoritë opsionale** përdorin API të tjera të shfletuesit: vizatimi i videos kërkon `VideoEncoder` të WebCodecs me VP9 ose VP8 ([Rruga e kamerës dhe videoja](camera-path-and-video.md)); thjeshtimi i rrjetës së niveleve kërkon WebAssembly; hedhja e dosjeve përdor File and Directory Entries API; biblioteka e niveleve përdor IndexedDB; gamepad-et përdorin Gamepad API.

## Harta e dokumentacionit {#documentation-map}

**Fillimi**: [Të dhëna demo](demo-data.md) · [Si të futni të dhënat](getting-data-in.md) ([ngarkimi i skedarëve](loading-files.md), [përcaktimi i kolonave](column-mapping.md), [boshtet, njësitë dhe koha](axes-units-and-time.md), [seancat, personat dhe grupet](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [konvertuesit](converters.md), [.3dheat](container.md), [kujtesa dhe buxhetet](memory-and-budgets.md))

**Shiko**: [Mënyrat e nxehtësisë](heat-modes.md) ([nxehtësi](heat.md), [forma e sprite-it](sprite-shape.md), [ngjyra dhe ekspozimi](colour-and-exposure.md), [thellësia dhe heqja e pjesëve të padukshme](depth-and-culling.md), [diferenca](difference.md), [nxehtësi ekipi](team-heat.md), [nxehtësi vijash](line-heat.md), [riluajtja e kutive](box-replay.md), [nxehtësi sipas drejtimit](directional-heat.md), [peshimi i vlerave](value-weighting.md)) · [Kronologjia](timeline.md) · [Nivelet](levels.md) ([imazhe hartash](map-images.md), [nivele 3D](model-levels.md), [pamja](level-appearance.md), [biblioteka](level-library.md), [sfondi botëror](world-backdrop.md), [burimet e tij](world-backdrop-sources.md)) · [Kamera](camera.md) ([gamepad](gamepad.md), [tastet](keyboard-reference.md)) · [Rruga e kamerës dhe videoja](camera-path-and-video.md)

**Analizo**: [Filtrat dhe mjetet](filters-and-tools.md) ([filtrat](filters.md), [skuadrat](teams-list.md), [entitetet](entities.md), [prerja](slice.md), [matja](measure.md), [vëllimet](volumes.md), [zbërthimi](breakdown.md)) · [Vëzhgime](insights.md) ([lente e njohurive](knowledge.md)) · [Analiza masive](mass-analysis.md)

**Riluajtja**: [Riluajtja e ndeshjes](match-replay.md) · [Shumë ndeshje njëherësh](many-matches.md) · [Figurat](figures.md) ([në mbivendosje figurash](figure-replay.md), [kreditet](figure-credits.md)) · [Barazia me Tacview](tacview-parity.md) · [Analiza e goditjeve](hit-analysis.md)

**Skedat e tjera**: [Analiza e garës](race-analysis.md) ([metoda](race-analytics.md), [lojëra të tjera](other-games.md)) · [Analiza e ndeshjes](match-analysis.md) · [Tabela e taktikave](tactics-board.md) ([shpejtësitë](tactics-speeds.md))

**Shikuesi**: [Fjalor](glossary.md) · [Cilësimet, njësitë dhe tastet](settings.md) · [Gjuhët](languages.md) · [Përditësimet](updates.md) · [Brendësitë e vizatimit](rendering-internals.md) ([backend-et](backends.md), [grumbullimi](accumulation.md), [mostrimi dhe buxhetet](sampling-and-budgets.md), [gjysmë-pikë lundruese](half-float-accumulation.md), [kujtesa e GPU](gpu-memory.md), [vizatimi me softuer](software-rendering.md), [performanca dhe statistikat](performance-and-stats.md)) · [Formatet e të dhënave](data-formats.md) · [Referenca](reference.md) · [Mirëmbajtja e dokumentacionit](maintaining.md)

## Repot e lidhura {#related-repositories}

Shikuesi lexon të dhëna; këto vegla i krijojnë. Secila është depo publike e vetë (MIT) me dokumentacionin e saj. Asnjëra nuk vjen me të dhëna loje: nivelet, hartat dhe regjistrimet bëhen në kompjuterin tënd, nga lojërat që zotëron.

| Depoja | Çfarë bën | E dobishme për |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Lexon pistat dhe nivelet nga arkivat që lojërat i japin (Forza Horizon, BeamNG, Assetto Corsa Rally; lexues për Unreal, Unity, Frostbite dhe Source 2) si glTF | një nivel 3D nën nxehtësinë ose riluajtjen tënde |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Regjistron telemetrinë e xhirove nga ndërfaqet që publikojnë lojërat me makina, dhe rindërton nivele nga video e lojës | xhiro për Analizën e garës; një nivel kur skedarët nuk mund të lexohen |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Shtojcë për Unreal Editor që eksporton një nivel si një skedar të vetëm glTF | nivele të projekteve të tua Unreal |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Demot e Counter-Strike 2 në tabela nxehtësie dhe përmbledhje ndeshjesh, hartat e CS2 në gjeometri | nxehtësia e CS2, riluajtjet dhe skeda Ndeshja |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Regjistron lojën tënde në sfond nga ajo që publikojnë lojërat: telemetri, integrime të gjendjes së lojës, regjistra, riluajtje | statistikat e tua pa bërë asgjë me dorë |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | Riluajtjet e War Thunder (`.wrpl`) në tabela: gjurmët ajrore dhe tokësore, të shtënat, goditjet, vrasjet, kullat, objektivat | riluajtjet e War Thunder, shenjat e goditjeve dhe vëzhgimet |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | Riluajtjet e World of Tanks në tabela: pozicioni i çdo mjeti, vdekjet dhe vrasjet | nxehtësia dhe riluajtjet e World of Tanks |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | Riluajtjet e World of Warships në tabela: pozicioni i çdo anijeje dhe fundosjet | nxehtësia dhe riluajtjet e World of Warships |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Demot e serverëve Squad në tabela: pozicioni, ekipi dhe skuadra e çdo lojtari | nxehtësia dhe riluajtjet e Squad |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | Terrenet e DCS World nga instalimi yt, në nivele: toka, rrugët, qytetet, aeroportet, fushat, uji | DCS dhe regjistrimet Tacview në terrenin e tyre real |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | Hartat e IL-2 Great Battles si nivele | regjistrimet e IL-2 në hartën e tyre |

## Struktura e burimit, shkurtimisht {#source-layout-briefly}

| Dosja | Përmbajtja |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | Zgjedhja e skedarëve, ngarkimi CSV dhe Parquet, përshtatja automatike, validimi, modeli i kujtesës, ndërtuesi i grupit të të dhënave, leximi i modeleve, klasifikimi, thjeshtimi, biblioteka e niveleve |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | Cikli i kornizave (`engine.ts`), mostrimi, të dy backend-et, kamera, gamepad, matja, rruga e kamerës, regjistrimi i videos |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | Gjendja e aplikacionit (`store.ts`) me çdo parazgjedhje, llojet e domenit (`types.ts`), kurba e sprite-it |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | Panelet e shiritit anësor, kronologjia, mbivendosjet |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | Skedat Analiza e garës dhe Ndeshja |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Përkthimet |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Vëzhgimet: detektorët, përmbledhja, komentuesi, ofruesit e IA-së, lente e njohurive |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Analiza masive e shumë ndeshjeve |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Vëllimet, statistikat e tyre, eksportimi dhe krahasimi |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Zbërthimi dhe faktorët |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | Mbivendosja e shumë ndeshjeve |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | Katalogu i figurave dhe ndërtuesi i tij |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Analiza e goditjeve (skeda Mjetet) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | Tabela e taktikave |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | Sfondi botëror |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Njësitë e matjes |
