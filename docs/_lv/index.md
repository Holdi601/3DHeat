---
title: "Sākums"
nav_order: 1
lang: "lv"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat parāda, kur kas notika spēlē - kur spēlētāji devās, cīnījās un krita - kā spožas krāsas, pa kurām var "lidot", vai kā mazas 3D figūriņas, kas atkārto spēli. 

Ielādējiet pozīcijas - CSV, Parquet, Tacview ierakstus, konvertētus atkārtojumus, vienu failu, mapi vai tūkstošiem spēļu - un skatiet tās kā **siltumkarti, pa kuru var lidot**, kā **figūras, kas atkārto spēli**, kā līnijas pa maršrutiem, pa kuriem gāja cilvēki, vai kā vienu populāciju pret otru. Tā pati atrod, kas izceļas, un darbojas pilnībā jūsu pārlūkprogrammā: nekas nekur netiek augšupielādēts.

![Dažu tanku spēļu siltums demonstrācijas ielejā](../assets/img/en/heat-hero.webp)

**Jauns šeit?** Izveidojiet [demonstrācijas datus](demo-data.md) un izpildiet tās septiņus soļus. Katrs attēls šajā vietnē ir uzņemts ar tiem.

## Ko tas dara {#what-it-does}

| | |
|---|---|
| ![Starpība](../assets/img/en/heat-difference.webp) | **[Siltuma režīmi](heat-modes.md)** - siltums, [starpība](difference.md) (sarkana, kur vienā pusē bija vairāk, zilganzaļa, kur otrā), [komandu siltums](team-heat.md), [līniju siltums](line-heat.md); [virziena siltums](directional-heat.md) ar sektoriem, bultu laukiem un polārajām diagrammām; siltums [svērts pēc vērtības](value-weighting.md): ko maksā ieroči, transportlīdzekļi un degviela. |
| ![Atkārtojums](../assets/img/en/replay-tanks.webp) | **[Spēles atkārtojums](match-replay.md)** - katra vienība kā [figūra](figures.md) ar to, kas tā ir, NATO vai krievu simboli tālākiem objektiem, raķetes un trasieri, trāpījumu zīmes, sagrautās vienības, ugunsgrēki, torņi, mērķi, Tacview stila kameras un taktiskais attēlojums; [daudzas spēles vienlaikus](many-matches.md). |
| ![Atziņas](../assets/img/en/insights.webp) | **[Atziņas](insights.md)** - spēcīgas pozīcijas, nāvējoša zeme, spawn slazdi, sašaurinājumi un izcili spēlētāji, atrasti un sarindoti ar pierādījumiem; rakstisks secinājumu kopsavilkums, pēc izvēles ar jūsu izvēlētu MI; komentētāja režīms vienai spēlei; [zināšanu lēca](knowledge.md). |
| ![Tilpumi](../assets/img/en/compare.webp) | **[Tilpumi](volumes.md)** - zīmējiet kastes, prizmas, cilindrus un sfēras, filtrējiet pēc tiem, saskaitiet, kas tajos notiek, eksportējiet un salīdziniet vietas blakus; [sadalījums](breakdown.md) - kas un kas labi darbojas vietā. |
| ![Filtri](../assets/img/en/filters.webp) | **[Filtri](filters.md)** - pēc notikuma tipa, spēlētāja vai MI, transportlīdzekļa klases, vērtības, jebkuras kolonnas, grafikas kartē jebkurā datu apjomā. |
| ![Līmenis](../assets/img/en/level-panel.webp) | **[Līmeņi](levels.md)** - karšu attēli, 3D līmeņi, kas veidoti ar [datu rīkiem](#related-repositories), vienkāršošana, [pasaules fons](world-backdrop.md) ar reālu reljefu lidojuma datiem. |

Vēl: cilne [Sacīkšu analīze](race-analysis.md) sacīkšu spēļu apļiem, cilne [Mačs](match-analysis.md) Counter-Strike 2 kopsavilkumiem, [taktikas tāfele](tactics-board.md) plāniem uz līmeņa, [trāpījumu analīze](hit-analysis.md) pa transportlīdzekļiem, [masveida analīze](mass-analysis.md) tūkstošiem spēļu, [kameras ceļi un video](camera-path-and-video.md), [40 valodas](languages.md), [metriskās vai angļu mērvienības](settings.md).

## Cilnes {#the-tabs}

Cilnes atrodas sānjoslas augšdaļā, zem nosaukuma, mērvienībām un valodas izvēlnes.

| Cilne | Kam tā paredzēta |
|---|---|
| **Siltumkarte** | Jebkura pozīciju tabula: siltuma režīmi, figūru pārklājums, filtri, tilpumi, atziņas, līmeņi, mērīšana un video. |
| **Sacīkšu analīze** | Divi vai vairāk apļi vienā trasē: kur tiek zaudēts laiks, kāpēc un ko mainīt. |
| **Mačs** | Spēles figūru atkārtojums un Counter-Strike 2 spēļu kopsavilkumi. |
| **Taktika** | Plāni uz līmeņa: figūras, maršruti, mestā palīgiekārta, zonas un piezīmes soļos, kas atskaņojas. |
| **Tehnika** | Kur katrs transportlīdzeklis tika trāpīts, kurš un ar ko. |

## Instalēšana un palaišana {#install-and-run}

### Windows, vienkāršais veids {#windows-the-easy-way}

Repozitorija saknē ir trīs paketes faili.

| Fails | Ko tas dara |
|---|---|
| `start.bat` | Palaiž skatītāju. Atrod Node.js pat tad, ja tas nav `PATH` (meklē `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` un `%LOCALAPPDATA%\Programs\nodejs`), un, ja Node.js nav, piedāvā instalēt LTS versiju ar `winget install -e --id OpenJS.NodeJS.LTS`. Pirmajā palaišanā tas pirms atkarību lejupielādes jautā (apmēram 300 MB mapē `node_modules\` šajā mapē, nekas nav instalēts sistēmā). Tas neatver, ja portā 5273 jau kaut kas klausās, un norāda uz `restart.bat`. Ja mape ir git kopija bez lokālām izmaiņām un ir jaunāka versija, tas jautā, vai atjaunināt (Y/N; bez atbildes 60 s laikā paliek šī versija; skatiet [Atjauninājumi](updates.md)). Tad palaiž izstrādes serveri `http://127.0.0.1:5273/` un atver pārlūku. **Logs ir serveris**: atstājiet to atvērtu; aizveriet vai nospiediet Ctrl+C, lai apturētu. |
| `restart.bat` | Izpilda `stop.bat quiet`, tad `start.bat`. Nepieciešams tikai pēc `vite.config.ts` maiņas, atkarības pievienošanas vai ja serveris ir iestrēdzis - pirmkoda izmaiņas tiek ielādētas karsti. |
| `stop.bat` | Aptur to, kas klausās portu 5273, pēc procesa identifikatora, kas atrasts ar `netstat`, nekad pēc attēla nosaukuma, tāpēc citi Node.js procesi datorā paliek neskarti. Gaida apmēram divas sekundes, līdz ligzda tiek atbrīvota. Ar argumentu `quiet` nepauzē beigās. |

### Ar rokām (jebkura OS) {#by-hand-any-os}


```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

Mape `exporters/` satur atsevišķos datu rīkus kā git apakšmoduļus, katrs ir sava repozitorija; pēc parastas klonēšanas palaidiet `git submodule update --init`. Pats skatītājs tiem nav vajadzīgs, lai darbotos. Mape `exporters/ext/` satur papildu konvertētājus (War Thunder, World of Tanks, World of Warships, Squad atkārtojumi; DCS un IL-2 kartes), turēti atsevišķi, lai problēma ar vienu neietekmētu citus.

Ar šo nekādi spēļu dati nenāk: līmeņi, kartes un ieraksti tiek veidoti jūsu datorā ar rīkiem, no spēlēm, kas jums pieder.

### npm skripti {#npm-scripts}

| Skripts | Ko tas palaiž |
|---|---|
| `npm run dev` | Vite izstrādes serveris portā 5273, piesaistīts pie `127.0.0.1`. |
| `npm run build` | Tipu pārbaude (`tsc --noEmit`) un ražošanas kopums mapē `dist/`. |
| `npm run preview` | Rāda ražošanas kopumu. |
| `npm run typecheck` | Tikai tipu pārbaude. |
| `npm test` / `npm run test:watch` | Vienību un integrācijas testi (vitest). |
| `npm run smoke` | Vada īsto lietotni bezgalvas Chromium un pārbauda, vai audekls satur datu krāsas pikseļus; ekrānuzņēmumi tiek saglabāti `tools/.smoke/`. Sagaida, ka izstrādes serveris darbojas. |
| `npm run smoke:f16` | Tas pats komplekts ar `?heat=f16`, piespiežot pusprecizitātes uzkrāšanas ceļu (skatiet [Pusprecizitātes uzkrāšana](half-float-accumulation.md)). |
| `npm run bench` | Ievades testējums, raksta `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Testi, kam nepieciešami lieli reāli datu faili; ja faili nav, tie paši izlaiž sevi. |
| `npm run inspect -- <file.parquet>` | Izdrukā Parquet faila shēmu un dažas rindas (`tools/inspect-parquet.mjs`). |

### Ko pievieno izstrādes serveris {#what-the-dev-server-adds}

Skatītājs ir statiska tīmekļa lapa, bet izstrādes serveris (skatiet `vite.config.ts`) pievieno divus lokālus maršrutus, kādu statiskai `dist/` izvietošanai nav:

- `/__host/memory` ziņo par datora uzstādīto un brīvo RAM un, ja to var nolasīt, grafikas kartes atmiņu (no `nvidia-smi`, vai Windows sistēmā no displeja adaptera reģistra ieraksta). Tas ļauj [atmiņas budžetiem](memory-and-budgets.md) izmantot reālus skaitļus, nevis pārlūka ierobežotos minējumus.
- `/__heat3d/update` pārbauda, vai kopija ir novecojusi, un var to ātri atjaunināt ([Atjauninājumi](updates.md)).

Serveris piesaistās tikai pie `127.0.0.1`, tāpēc neviens no maršrutiem nav sasniedzams no tīkla. Atveriet to kā `http://127.0.0.1:5273`: `localhost` var atrisināties uz IPv6 atpakaļcilpu `::1`, kur neviens neklausās. Tas nesūta starpnozaru izolācijas galvenes (COOP/COEP): skatītājā nekas neizmanto `SharedArrayBuffer`, un darbinieki nodod datus ar pārsūtīšanu, kam tās nav vajadzīgas.

## Pārlūka un GPU prasības {#browser-and-gpu-requirements}

- **Pārlūks ar WebGPU vai WebGL2.** Vispirms tiek izmēģināts WebGPU (Chrome un Edge to atbalsta); bez tā tiek izmantots WebGL2 backend. WebGL2 jāpiedāvā `EXT_color_buffer_float` (renderēšana peldošā komata tekstūrās), citādi skatītājs rāda "Cannot initialise the renderer." Skatiet [Abas renderēšanas metodes](backends.md). Skatītājs tiek izstrādāts un testēts Chromium; citi pārlūki nav pārbaudīti.
- **Ieslēgta aparatūras paātrināšana.** Ja pārlūks zīmē uz procesora (SwiftShader, llvmpipe, Microsoft Basic Render Driver un līdzīgi), sānjoslas augšdaļā parādās sarkans baneris, kas to paziņo un norāda, kā to labot. Skatiet [Programmatūras renderēšanas noteikšana](software-rendering.md).
- **Diskrēta GPU palīdz, bet nav obligāta.** Abi backend pieprasa augstas veiktspējas adapteri. Datu apjoms, ko var turēt GPU, ir budžets, ko var redzēt un mainīt ([Atmiņa un budžeti](memory-and-budgets.md)).
- **Pēc izvēles funkcijas** izmanto vēl citus pārlūka API: video renderēšanai nepieciešams WebCodecs `VideoEncoder` ar VP9 vai VP8 ([Kameras ceļš un video](camera-path-and-video.md)); līmeņu tīkla vienkāršošanai - WebAssembly; mapju velkot un nomest, tiek izmantots File and Directory Entries API; līmeņu bibliotēka izmanto IndexedDB; spēļu pultis izmanto Gamepad API.

## Dokumentācijas karte {#documentation-map}

**Sākums**: [Demonstrācijas dati](demo-data.md) · [Datu ievade](getting-data-in.md) ([failu ielāde](loading-files.md), [kolonnu atbilstība](column-mapping.md), [asis, mērvienības un laiks](axes-units-and-time.md), [sesijas, personas un grupas](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [konvertētāji](converters.md), [.3dheat](container.md), [atmiņa un budžeti](memory-and-budgets.md))

**Skatīt**: [Siltuma režīmi](heat-modes.md) ([siltums](heat.md), [sprite forma](sprite-shape.md), [krāsa un ekspozīcija](colour-and-exposure.md), [dziļums un nogriešana](depth-and-culling.md), [starpība](difference.md), [komandu siltums](team-heat.md), [līniju siltums](line-heat.md), [kastes atkārtojums](box-replay.md), [virziena siltums](directional-heat.md), [vērtības svēršana](value-weighting.md)) · [Laika skala](timeline.md) · [Līmeņi](levels.md) ([karšu attēli](map-images.md), [3D līmeņi](model-levels.md), [izskats](level-appearance.md), [bibliotēka](level-library.md), [pasaules fons](world-backdrop.md), [tā avoti](world-backdrop-sources.md)) · [Kamera](camera.md) ([spēļu pults](gamepad.md), [taustiņi](keyboard-reference.md)) · [Kameras ceļš un video](camera-path-and-video.md)

**Analizēt**: [Filtri un rīki](filters-and-tools.md) ([filtri](filters.md), [komandas](teams-list.md), [vienības](entities.md), [griezums](slice.md), [mērīšana](measure.md), [tilpumi](volumes.md), [sadalījums](breakdown.md)) · [Atziņas](insights.md) ([zināšanu lēca](knowledge.md)) · [Masveida analīze](mass-analysis.md)

**Atkārtojums**: [Spēles atkārtojums](match-replay.md) · [Daudzas spēles vienlaikus](many-matches.md) · [Figūras](figures.md) ([figūru pārklājumā](figure-replay.md), [autori](figure-credits.md)) · [Tacview paritāte](tacview-parity.md) · [Trāpījumu analīze](hit-analysis.md)

**Citas cilnes**: [Sacīkšu analīze](race-analysis.md) ([metode](race-analytics.md), [citas spēles](other-games.md)) · [Spēles analīze](match-analysis.md) · [Taktikas tāfele](tactics-board.md) ([ātrumi](tactics-speeds.md))

**Skatītājs**: [Glosārijs](glossary.md) · [Iestatījumi, mērvienības un taustiņi](settings.md) · [Valodas](languages.md) · [Atjauninājumi](updates.md) · [Renderēšanas iekšējā uzbūve](rendering-internals.md) ([backend](backends.md), [uzkrāšana](accumulation.md), [paraugu ņemšana un budžeti](sampling-and-budgets.md), [pusprecizitāte](half-float-accumulation.md), [GPU atmiņa](gpu-memory.md), [programmatūras renderēšana](software-rendering.md), [veiktspēja un statistika](performance-and-stats.md)) · [Datu formāti](data-formats.md) · [Uzziņa](reference.md) · [Dokumentācijas uzturēšana](maintaining.md)

## Saistītās repozitorijas {#related-repositories}

Skatītājs lasa datus; šie rīki tos veido. Katrs ir sava publiska repozitorija (MIT) ar savu dokumentāciju. Neviens no tiem nepiegādā spēļu datus: līmeņi, kartes un ieraksti tiek veidoti jūsu datorā, no spēlēm, kas jums pieder.

| Repozitorija | Ko tā dara | Noderīga |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Nolasa trases un līmeņus no arhīviem, ko spēles piegādā (Forza Horizon, BeamNG, Assetto Corsa Rally; Unreal, Unity, Frostbite un Source 2 lasītāji) kā glTF | 3D līmenis zem jūsu siltuma vai atkārtojuma |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Ieraksta apļu telemetriju no saskarnēm, ko publicē sacīkšu spēles, un atjauno līmeņus no spēles video | apļi Sacīkšu analīzei; līmenis, kur failus nevar nolasīt |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Unreal Editor spraudnis, kas eksportē līmeni kā vienu glTF failu | jūsu pašu Unreal projektu līmeņi |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Counter-Strike 2 demo ierakstus pārvērš siltuma tabulās un spēļu kopsavilkumos, CS2 kartes - ģeometrijā | CS2 siltums, atkārtojumi un cilne Mačs |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Fonā ieraksta jūsu spēli no tā, ko spēles publicē: telemetriju, spēles stāvokļa integrācijas, žurnālus, atkārtojumus | jūsu pašu statistika bez manuāla darba |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | War Thunder atkārtojumi (`.wrpl`) tabulās: gaisa un zemes trajektorijas, šāvieni, trāpījumi, nogalinājumi, torņi, mērķi | War Thunder atkārtojumi, trāpījumu zīmes un atziņas |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | World of Tanks atkārtojumi tabulās: katra transportlīdzekļa pozīcija, nāves un nogalinājumi | World of Tanks siltums un atkārtojumi |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | World of Warships atkārtojumi tabulās: katra kuģa pozīcija un nogremdēšanas | World of Warships siltums un atkārtojumi |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Squad servera demo tabulās: katra spēlētāja pozīcija, komanda un vienība | Squad siltums un atkārtojumi |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | DCS World reljefi no jūsu pašu instalācijas līmeņos: zeme, ceļi, pilsētas, lidlauki, lauki, ūdens | DCS un Tacview ieraksti uz to reālā reljefa |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | IL-2 Great Battles kartes līmeņos | IL-2 ieraksti uz to kartes |

## Pirmkoda izkārtojums, īsumā {#source-layout-briefly}

| Mape | Saturs |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | Failu izvēle, CSV un Parquet ievade, automātiska saistīšana, validācija, atmiņas modelis, datu kopas veidotājs, modeļu nolasīšana, klasifikācija, vienkāršošana, līmeņu bibliotēka |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | Kadru cikls (`engine.ts`), paraugu ņemšana, abi backend, kamera, spēļu pults, mērīšana, kameras ceļš, video ierakstīšana |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | Lietotnes stāvoklis (`store.ts`) ar katru noklusējumu, domēna tipi (`types.ts`), sprite līkne |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | Sānjoslas paneļi, laika skala, pārklājumi |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | Cilnes Sacīkšu analīze un Spēle |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Tulkojumi |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Atziņas: detektori, secinājumi, kastera režīms, MI pakalpojumu sniedzēji, zināšanu lēca |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Masveida analīze pār daudzām spēlēm |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Tilpumi, to statistika, eksports un salīdzināšana |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Sadalījums un faktori |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | Daudzspēļu pārklājums |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | Figūru katalogs un tā veidotājs |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Trāpījumu analīze (cilne Tehnika) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | Taktikas tāfele |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | Pasaules fons |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Mērvienības |
