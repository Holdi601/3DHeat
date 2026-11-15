---
title: "Галоўная"
nav_order: 1
lang: "be"
source: "index.md"
source_hash: "b93bb646bdad"
translated: true
outdated: false
---

# 3DHeat

3DHeat паказвае, дзе ў гульні што адбывалася: куды хадзілі гульцы, дзе білася і дзе гінулі. Гэта колеры, што свецяцца, праз якія можна лётаць, або маленькія 3D-фігуркі, якія пераказваюць матч.

Загрузіце пазіцыі - CSV, Parquet, запісы Tacview, канвертаваныя паўторы, адзін файл, папку або тысячы матчаў - і ўбачыце іх як **цеплавую карту, праз якую можна лётаць**, як **фігуры, якія пераказваюць матч**, як лініі ўздоўж маршрутаў, якімі ішлі людзі, або як адну групу супраць другой. Праграма сама знаходзіць, што выдзяляецца, і працуе цалкам у вашым браўзеры: нічога нікуды не загружаецца.

![Цяпло дзесяці матчаў танкаў над дэма-далінай](../assets/img/en/heat-hero.webp)

**Упершыню тут?** Стварыце [дэма-даныя](demo-data.md) і прайдзіце іх сем крокаў. Кожная карцінка на гэтым сайце зроблена з імі.

## Што ўмее {#what-it-does}

| | |
|---|---|
| ![Розніца](../assets/img/en/heat-difference.webp) | **[Рэжымы цяпла](heat-modes.md)** - цяпло, [розніца](difference.md) (чырвоным там, дзе больш было адной стараны, зелена-сінім - там, дзе другой), [Каманды](team-heat.md), [лінейнае цяпло](line-heat.md); [направленае цяпло](directional-heat.md) з клінамі, палямі стрэлак і палярнымі графікамі; цяпло, [узважанае па кошце](value-weighting.md): колькі каштуюць зброя, тэхніка і паліва. |
| ![Прайграванне](../assets/img/en/replay-tanks.webp) | **[Прайграванне матчу](match-replay.md)** - кожная адзінка як [фігура](figures.md) таго, чым яна з'яўляецца, сімвалы NATO або рускія далёка, ракеты і трасіры, адзнакі пападанняў, падбітая тэхніка, пажары, вежы, мэты, камеры ў стылі Tacview і тактычны дысплей; [многа матчаў адначасова](many-matches.md). |
| ![Высновы](../assets/img/en/insights.webp) | **[Высновы](insights.md)** - моцныя пазіцыі, смяротная мясцовасць, пасткі пры нараджэнні, вузкія месцы і вылучаныя гульцы: знойдзены і ранжыраваны разам з доказамі; пісьмовы разбор, пры жаданні з дапамогай ШІ на ваш выбар; каментатар аднаго матчу; [лінза ведаў](knowledge.md). |
| ![Аб'ёмы](../assets/img/en/compare.webp) | **[Аб'ёмы](volumes.md)** - малюйце кубы, прызмы, цыліндры і сферы, фільтруйце па іх, падлічвайце, што адбываецца ўнутры, экспартуйце і параўноўвайце месцы побач; [разбіўка](breakdown.md) таго, хто і што дае лепшы вынік у месцы. |
| ![Фільтры](../assets/img/en/filters.webp) | **[Фільтры](filters.md)** - па тыпе падзеі, гульцу або ШІ, класе тэхнікі, кошце, любому слупку відэакартай пры любым памеры даных. |
| ![Узровень](../assets/img/en/level-panel.webp) | **[Узроўні](levels.md)** - выявы карт, 3D-узроўні, зробленыя з [інструментамі даных](#related-repositories), спрашчэнне, [фон свету](world-backdrop.md) з сапраўдным рэльефам для даных палёту. |

Таксама: укладка [Аналіз заездаў](race-analysis.md) для кругоў гоншчыкіх гульняў, укладка [Матч](match-analysis.md) для зводак Counter-Strike 2, [Дошка тактык](tactics-board.md) для планаў на ўзроўні, [аналіз трапленняў](hit-analysis.md) па кожнай тэхніцы, [масавы аналіз](mass-analysis.md) тысяч матчаў, [шляхі камеры і відэа](camera-path-and-video.md), [40 моў](languages.md), [метрычныя або імперскія адзінкі](settings.md).

## Укладкі {#the-tabs}

Укладкі знаходзяцца ўверсе бакавой панэлі, пад назвай, адзінкамі і меню мовы.

| Укладка | Для чаго |
|---|---|
| **Цеплавая карта** | Любая табліца з пазіцыямі: рэжымы цяпла, накладанне фігур, фільтры, аб'ёмы, высновы, узроўні, вымярэнне і відэа. |
| **Аналіз заездаў** | Два і больш кругоў аднаго маршруту: дзе губляецца час, чаму і што змяніць. |
| **Матч** | Фігурнае прайграванне матчу і зводкі матчаў Counter-Strike 2. |
| **Тактыка** | Планы на ўзроўні: фігуры, маршруты, кінутыя сродкі, зоны і нататкі ў крокі, якія прайграюцца. |
| **Тэхніка** | Куды трапілі па кожнай адзінцы, хто і чым. |

## Усталяванне і запуск {#install-and-run}

### Windows, лёгкі спосаб {#windows-the-easy-way}

Каранёвая папка рэпазіторыя змяшчае тры пакетныя файлы.

| Файл | Што робіць |
|---|---|
| `start.bat` | Запускае праглядальнік. Знаходзіць Node.js, нават калі яго няма ў `PATH` (шукае ў `%ProgramFiles%\nodejs`, `%ProgramFiles(x86)%\nodejs` і `%LOCALAPPDATA%\Programs\nodejs`), і калі Node.js адсутнічае, прапануе ўсталяваць выпуск LTS з `winget install -e --id OpenJS.NodeJS.LTS`. Пры першым запуску пытаецца, перш чым спампаваць залежнасці (каля 300 МБ у `node_modules\` у сярэдзіне папкі, нічога на ўсю сістэму). Адмаўляецца запускацца, калі на порце 5273 ужо нешта слухае, і адсылае да `restart.bat`. Калі папка - git-копія без лакальных змяненняў і ёсць больш новая версія, пытаецца, ці абнаўляць (Y/N; без адказу за 60 с застаецца гэтая версія; гл. [Абнаўленні](updates.md)). Потым запускае сервер распрацоўкі на `http://127.0.0.1:5273/` і адкрывае браўзер. **Акно - гэта сервер**: не закрывайце яго; каб спыніць, зачыніце або націсніце Ctrl+C. |
| `restart.bat` | Выконвае `stop.bat quiet`, потым `start.bat`. Патрэбны толькі пасля змены `vite.config.ts`, даданні залежнасці або калі сервер завіс - змены крыніцы перазагружаюцца адразу. |
| `stop.bat` | Спыняе тое, што слухае порт 5273, па ідэнтыфікатары працэсу, знойдзенаму праз `netstat`, ніколі па назве вобраза, так што іншыя працэсы Node.js на кампутары не чапаюцца. Чакае каля дзвух секунд, пакуль вызваліцца сокет. З аргументам `quiet` не спыняецца ў канцы. |

### Уручную (любая АС) {#by-hand-any-os}

```bash
git clone --recursive https://github.com/Holdi601/3DHeat.git
cd 3DHeat
npm install
npm run dev      # http://127.0.0.1:5273
```

Папка `exporters/` змяшчае асобныя інструменты даных як git-падмадулі, кожны - уласны рэпазіторый; пасля звычайнага клону выканайце `git submodule update --init`. Сам праглядальнік для запуску іх не патрабуе. `exporters/ext/` змяшчае дадатковыя канвертары (War Thunder, World of Tanks, World of Warships, паўторы Squad; карты DCS і IL-2), захаваныя асобна, каб праблема з адным з іх не закранула нічога іншага.

Ніякіх ігравых даных у камплекце няма: узроўні, карты і запісы робяцца на вашым кампутары інструментамі з гульняў, якія вам належаць.

### npm-скрыпты {#npm-scripts}

| Скрыпт | Што запускае |
|---|---|
| `npm run dev` | Сервер распрацоўкі Vite на порце 5273, прывязаны да `127.0.0.1`. |
| `npm run build` | Праверка тыпаў (`tsc --noEmit`) і прадуктыўны зборка ў `dist/`. |
| `npm run preview` | Падае прадуктыўную зборку. |
| `npm run typecheck` | Толькі праверка тыпаў. |
| `npm test` / `npm run test:watch` | Модульныя і інтэграцыйныя тэсты (vitest). |
| `npm run smoke` | Кіруе сапраўдным дадаткам у безгаловым Chromium і правярае, ці ёсць на палатне пікселі ў колерах даных; здымкі экрана ідуць у `tools/.smoke/`. Чакае, што сервер распрацоўкі запушчаны. |
| `npm run smoke:f16` | Той жа набор з `?heat=f16`, які прымусова ўключае шлях накаплення half-float (гл. [Накапленне ў half-float](half-float-accumulation.md)). |
| `npm run bench` | Тэст хуткасці загрузкі, запісвае `tools/.smoke/ingest-bench.json`. |
| `npm run test:heavy` | Тэсты, якім патрэбны вялікія сапраўдныя файлы даных; пры іх адсутнасці прапускаюцца самі. |
| `npm run inspect -- <file.parquet>` | Выводзіць схему Parquet-файла і некалькі радкоў (`tools/inspect-parquet.mjs`). |

### Што дадае сервер распрацоўкі {#what-the-dev-server-adds}

Праглядальнік - гэта статычная вэб-старонка, але сервер распрацоўкі (гл. `vite.config.ts`) дадае два лакальныя маршруты, якіх няма ў статычным разгортванні `dist/`:

- `/__host/memory` паведамляе ўсталяваную і вольную аператыўную памяць кампутара і, дзе магчыма прачытаць, памяць відэакарты (з `nvidia-smi`, або ў Windows - з запісу адаптара дысплэя ў рэестры). Дзякуючы гэтаму [бюджэты памяці](memory-and-budgets.md) выкарыстоўваюць рэальныя лічбы, а не абмежаваныя ацэнкі браўзера.
- `/__heat3d/update` правярае, ці адстае копія, і можа яе абнавіць дагнаць яе ([Абнаўленні](updates.md)).

Сервер прывязаны толькі да `127.0.0.1`, таму ні адзін з маршрутаў недаступны з сеткі. Адкрывайце яго як `http://127.0.0.1:5273`: `localhost` можа азначацца як IPv6-пятля `::1`, дзе нічога не слухае. Ён не адпраўляе загалоўкаў cross-origin isolation (COOP/COEP): нічога ў праглядальніку не выкарыстоўвае `SharedArrayBuffer`, а воркеры перадаюць свае даныя перадачай, якая гэтага не патрабуе.

## Патрабаванні да браўзера і GPU {#browser-and-gpu-requirements}

- **Браўзер з WebGPU або WebGL2.** WebGPU пробуецца першым (Chrome і Edge яго маюць); без яго выкарыстоўваецца бэкэнд WebGL2. WebGL2 павінен падтрымліваць `EXT_color_buffer_float` (рэндэрынг у float-тэкстуры), інакш праглядальнік паказвае «Cannot initialise the renderer.». Гл. [Два бэкэнды](backends.md). Праглядальнік распрацоўваецца і правяраецца ў Chromium; іншыя браўзеры не правераны.
- **Апаратнае паскарэнне ўключана.** Калі браўзер малюе на ЦП (SwiftShader, llvmpipe, Microsoft Basic Render Driver і падобныя), чырвоны банер уверсе бакавой панэлі гэта кажа і падказвае, як выправіць. Гл. [Выяўленне праграмнага рэндэрынгу](software-rendering.md).
- **Дыскрэтны GPU дапамагае, але не патрэбны.** Абодва бэкэнды просяць высокапрадукцыйны адаптар. Колькасць даных, якую можна трымаць на GPU, - гэта бюджэт, які вы бачыце і можаце змяніць ([Памяць і бюджэты](memory-and-budgets.md)).
- **Дадатковыя магчымасці** выкарыстоўваюць іншыя API браўзера: запіс відэа патрабуе WebCodecs `VideoEncoder` з VP9 або VP8 ([Шлях камеры і відэа](camera-path-and-video.md)); спрашчэнне сетак узроўняў патрабуе WebAssembly; перацягванне папак выкарыстоўвае File and Directory Entries API; бібліятэка ўзроўняў - IndexedDB; геймпады - Gamepad API.

## Карта дакументацыі {#documentation-map}

**Пачатак**: [Дэма-даныя](demo-data.md) · [Загрузка даных](getting-data-in.md) ([загрузка файлаў](loading-files.md), [супастаўленне слупкоў](column-mapping.md), [восі, адзінкі і час](axes-units-and-time.md), [сесіі, асобы і групы](sessions-persons-groups.md), [Tacview](tacview-acmi.md), [канвертары](converters.md), [.3dheat](container.md), [памяць і бюджэты](memory-and-budgets.md))

**Глядзець**: [Рэжымы цяпла](heat-modes.md) ([цяпло](heat.md), [форма спрайта](sprite-shape.md), [колер і экспазіцыя](colour-and-exposure.md), [глыбіня і адсячэнне](depth-and-culling.md), [розніца](difference.md), [Каманды](team-heat.md), [лінейнае цяпло](line-heat.md), [прайграванне ў кубе](box-replay.md), [направленае цяпло](directional-heat.md), [узважанне значэнняў](value-weighting.md)) · [Стужка часу](timeline.md) · [Узроўні](levels.md) ([выявы карт](map-images.md), [3D-узроўні](model-levels.md), [выгляд](level-appearance.md), [бібліятэка](level-library.md), [фон свету](world-backdrop.md), [яго крыніцы](world-backdrop-sources.md)) · [Камера](camera.md) ([геймпад](gamepad.md), [клавішы](keyboard-reference.md)) · [Шлях камеры і відэа](camera-path-and-video.md)

**Аналіз**: [Фільтры і інструменты](filters-and-tools.md) ([фільтры](filters.md), [каманды](teams-list.md), [сутнасці](entities.md), [зрэз](slice.md), [вымярэнне](measure.md), [аб'ёмы](volumes.md), [разбіўка](breakdown.md)) · [Высновы](insights.md) ([лінза ведаў](knowledge.md)) · [Масавы аналіз](mass-analysis.md)

**Прайграванне**: [Прайграванне матчу](match-replay.md) · [Шмат матчаў адначасова](many-matches.md) · [Фігуры](figures.md) ([у накладанні фігур](figure-replay.md), [аўтары](figure-credits.md)) · [Паралельнасць з Tacview](tacview-parity.md) · [Аналіз трапленняў](hit-analysis.md)

**Іншыя ўкладкі**: [Аналіз заездаў](race-analysis.md) ([метад](race-analytics.md), [іншыя гульні](other-games.md)) · [Аналіз матчу](match-analysis.md) · [Дошка тактык](tactics-board.md) ([хуткасці](tactics-speeds.md))

**Праглядальнік**: [Слоўнік](glossary.md) · [Налады, адзінкі і клавішы](settings.md) · [Мовы](languages.md) · [Абнаўленні](updates.md) · [Унутраная будова рэндэрынгу](rendering-internals.md) ([бэкэнды](backends.md), [накапленне](accumulation.md), [выбарка і бюджэты](sampling-and-budgets.md), [half-float](half-float-accumulation.md), [памяць GPU](gpu-memory.md), [праграмны рэндэрынг](software-rendering.md), [прадукцыйнасць і статыстыка](performance-and-stats.md)) · [Фарматы даных](data-formats.md) · [Даведнік](reference.md) · [Падтрымка дакументацыі](maintaining.md)

## Звязаныя рэпазіторыі {#related-repositories}

Праглядальнік чытае даныя; гэтыя інструменты іх робяць. Кожны - асобны публічны рэпазіторый (MIT) з уласнай дакументацыяй. Ніводзін не ўтрымлівае ігравых даных: узроўні, карты і запісы робяцца на вашым кампутары з гульняў, якія вам належаць.

| Рэпазіторый | Што робіць | Карысна для |
|---|---|---|
| [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) | Чытае трасы і ўзроўні з архіваў, якія пастаўляюць гульні (Forza Horizon, BeamNG, Assetto Corsa Rally; чытальнікі Unreal, Unity, Frostbite і Source 2) у фармат glTF | 3D-ўзровень пад вашым цяплом або паўторам |
| [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) | Запісвае тэлеметрыю кругоў з інтэрфейсаў, якія публікуюць гоншчыя гульні, і аднаўляе ўзроўні з відэа гульні | кругі для Аналізу заездаў; ўзровень там, дзе файлы не чытаюцца |
| [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) | Плагін Unreal Editor, які экспартуе ўзровень у адзін файл glTF | ўзроўні вашых уласных праектаў Unreal |
| [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) | Дэма Counter-Strike 2 у табліцы цяпла і зводкі матчаў, карты CS2 у геаметрыю | цяпло CS2, паўторы і ўкладка Матч |
| [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) | Запісвае вашу гульню ў фоне з таго, што публікуюць гульні: тэлеметрыя, інтэграцыі стану гульні, логі, паўторы | вашу статыстыку без ручной працы |
| [3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder) | Паўторы War Thunder (`.wrpl`) у табліцы: трэкі ў паветры і на зямлі, стрэлы, пападанні, забойствы, вежы, мэты | паўторы War Thunder, адзнакі пападанняў і высновы |
| [3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT) | Паўторы World of Tanks у табліцы: пазіцыя кожнай тэхнікі, смерці і забойствы | цяпло і паўторы World of Tanks |
| [3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs) | Паўторы World of Warships у табліцы: пазіцыя і патапленні кожнага карабля | цяпло і паўторы World of Warships |
| [3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad) | Дэма з сервераў Squad у табліцы: пазіцыя, каманда і атрад кожнага гульца | цяпло і паўторы Squad |
| [3DHeat-Ext-DCS](https://github.com/Holdi601/3DHeat-Ext-DCS) | Мясцовасці DCS World з вашай уласнай устаноўкі ў ўзроўні: зямля, дарогі, гарады, аэрадромы, палі, вада | DCS і запісы Tacview на іх сапраўднай мясцовасці |
| [3DHeat-Ext-IL2](https://github.com/Holdi601/3DHeat-Ext-IL2) | Карты IL-2 Great Battles у ўзроўні | запісы IL-2 на іх карце |

## Структура крыніц коратка {#source-layout-briefly}

| Папка | Змест |
|---|---|
| [`src/data/`](https://github.com/Holdi601/3DHeat/tree/main/src/data) | Выбар файлаў, загрузка CSV і Parquet, аўтаматычнае супастаўленне, праверка, мадэль памяці, пабудоўка набору даных, разбор мадэляў, класіфікацыя, спрашчэнне, бібліятэка ўзроўняў |
| [`src/render/`](https://github.com/Holdi601/3DHeat/tree/main/src/render) | Цыкл кадраў (`engine.ts`), выбарка, абодва бэкэнды, камера, геймпад, вымярэнне, шлях камеры, запіс відэа |
| [`src/state/`](https://github.com/Holdi601/3DHeat/tree/main/src/state) | Стан дадатку (`store.ts`) з усімі значэннямі па змаўчанні, тыпы дамена (`types.ts`), крывая спрайта |
| [`src/ui/`](https://github.com/Holdi601/3DHeat/tree/main/src/ui) | Панэлі бакавой панэлі, стужка часу, накладкі |
| [`src/race/`](https://github.com/Holdi601/3DHeat/tree/main/src/race), [`src/match/`](https://github.com/Holdi601/3DHeat/tree/main/src/match) | Укладкі Аналіз заездаў і Матч |
| [`src/i18n/`](https://github.com/Holdi601/3DHeat/tree/main/src/i18n) | Пераклады |
| [`src/insights/`](https://github.com/Holdi601/3DHeat/tree/main/src/insights) | Высновы: дэтэктары, разбор, каментатар, пастаўшчыкі ШІ, лінза ведаў |
| [`src/mass/`](https://github.com/Holdi601/3DHeat/tree/main/src/mass) | Масавы аналіз многіх матчаў |
| [`src/volumes/`](https://github.com/Holdi601/3DHeat/tree/main/src/volumes) | Аб'ёмы, іх статыстыка, экспарт і параўнанне |
| [`src/breakdown/`](https://github.com/Holdi601/3DHeat/tree/main/src/breakdown) | Разбіўка і фактары |
| [`src/overlay/`](https://github.com/Holdi601/3DHeat/tree/main/src/overlay) | Накладка многіх матчаў |
| [`src/figures/`](https://github.com/Holdi601/3DHeat/tree/main/src/figures) | Каталог фігур і яго пабудоўшчык |
| [`src/vehicle/`](https://github.com/Holdi601/3DHeat/tree/main/src/vehicle) | Аналіз трапленняў (укладка Тэхніка) |
| [`src/tactics/`](https://github.com/Holdi601/3DHeat/tree/main/src/tactics) | Дошка тактык |
| [`src/world/`](https://github.com/Holdi601/3DHeat/tree/main/src/world) | Фон свету |
| [`src/units/`](https://github.com/Holdi601/3DHeat/tree/main/src/units) | Адзінкі вымярэння |
