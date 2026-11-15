---
title: "Фон свету: крыніцы і тэрміны"
parent: "Фон свету"
grand_parent: "Узроўні і фонавая геаметрыя"
nav_order: 1
lang: "be"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Фон свету: крыніцы і тэрміны

Даныя карты для [Рэальнага свету як фону](world-backdrop.md) паходзяць з адкрытых сэрвісаў. Гэтая старонка пералічвае кожную крыніцу, яе ліцэнзію і тое, як 3DHeat застаецца ў межах умоў.

| Крыніца | Умовы (паводле стану на 7 лістапада 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - вектарныя пліткі са схемай OpenMapTiles з OpenStreetMap, бягучая зборка называецца `https://tiles.openfreemap.org/planet` | Бясплатна, без ключа, камерцыйнае выкарыстанне дазволена. [Умовы](https://openfreemap.org/tos/) забараняюць збіраць даныя «спосабам, які аўтаматызаваны, за выключэннем афлайн-загрузак»: праграма можа дазволіць карыстальнікам загрузіць вобласць для працы без сеткі, калі кожная загрузка не больш за 3000 пліткаў або 50 МБ, зробленая не больш як у 4 паралельных запытах, з User-Agent, які ідэнтыфікуе праграму. Атрыбуцыя абавязковая: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (частка OpenFreeMap неабавязковая). Сэрвіс можа спыніцца без папярэджання. |
| Даныя [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Загрузка ў час работы і лакальнае малюванне - прыватнае выкарыстанне; намаляваны выгляд - гэта Produced Work, якое патрабуе бачнага пазначэння аўтара, і так жа скрыншоты і відэа, зробленыя з яго. |
| Схема [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 для схемы; пазначэнне "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Выпушчана ў публічны дамен; без ключа. Пазначэнне "Runways: OurAirports (public domain)" паказваецца як даброзычлівасць. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Слой 2016 года - CC BY 4.0 (пазнейшыя гады - CC BY-NC-SA, не выкарыстоўваюцца). Старонка сэрвісу EOX запрашае выкарыстоўваць канчаткі ў праграмах, як дэма-сэрвіс без гарантый і з абмежаваннем запытаў; пра кэшаванне яна нічога не кажа, а CC BY яго дазваляе. Пазначэнне, якое паказваецца на палатне: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", са спасылкай. CORS: паходжанне запыту адлюстроўваецца. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-кадаваны WebP 512 px без страт, без ключа, адкрыты CORS. Крыніцы пад CC BY, публічным доменам і падобнымі адкрытымі ліцэнзіямі (ніводная не некамерцыйная і не з умовай захавання ліцэнзіі); пазначэнне "© Mapterhorn" і, для глабальнага слоя, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Для публічнага канчатка няма апублікаванай палітыкі выкарыстання. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ортафота, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction"; ён просіць пазначэння, напрыклад "(Product or data name) courtesy of the U.S. Geological Survey". Сэрвіс называе сваю крыніцу "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, таксама федэральная праца ў публічным доменце); гэта і паказваецца як пазначэнне. Без ключа, адкрыты CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Умовы Géoplateforme называюць WMTS "Non soumis à limite d'usage" (без абмежавання выкарыстання; WMS абмежаваны 40-50 запытамі ў секунду); даныя "soumises à la licence choisie et renseignée par le Fournisseur de données", па змаўчанні Etalab Licence Ouverte, па якой BD ORTHO адкрыта з 2021 года; карыстальнікі павінны "ne pas nuire, entraver ou fausser le bon fonctionnement des API". Кэшаванне не разглядаецца; Licence Ouverte дазваляе паўторнае выкарыстанне з пазначэннем крыніцы: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Без ключа, адкрыты CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Адкрытыя даныя з многіх крыніц, кожная са сваім пазначэннем ([спіс](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); без ключа, без гарантыі сэрвісу, аддаецца з адкрытым CORS. Вышыні дэкадуюцца як `R × 256 + G + B / 256 − 32768` метры. |

## Як фон застаецца ў гэтых умовах {#how-the-backdrop-stays-inside-those-terms}

- Фон пад запісам загружае не больш за 36 пліткаў вышыні і 300 вектарных пліткаў; тэатр, пабудаваны аднойчы, - не больш за 64 + 100 пліткаў вышыні і 64 + 1 500 вектарных пліткаў; струменевы тэатр - па адной пліцы кожнай крыніцы адначасова на пліткі карты, па меры руху камеры. Чатыры запыты адначасова на адну крыніцу.
- **Тэатр, пабудаваны аднойчы, - гэта адна загрузка**, і загрузкі не больш за 1 000 вектарных пліткаў або 40 МБ (умовы OpenFreeMap дазваляюць 3000 пліткаў або 50 МБ). Пліткі запытваюцца спачатку з цэнтра; пасля ліміту пабудова бярэ толькі тыя пліткі, што ўжо ў кэшы, і кажа, колькі яшчэ засталося. Паўторная пабудова загружае наступны кавалак і гэтак далей: вялікая вобласць прыходзіць часткамі, кожная з якіх кэшуецца.
- Пры вымярэнні на сінтэтычных палётах: тэатр з падрабязнай вобласцю 25 км займае прыблізна 370 пліткаў і 20 МБ першы раз. Пры паўторнай пабудове або вяртанні назад нічога не загружаецца.
- Пліткі загружаюцца толькі пры націску **Рэальны свет як фон**, ніколі ў фоне.
- Браўзер не дазваляе старонцы ставіць уласны User-Agent; запыты нясуць User-Agent браўзера, а паходжанне старонкі - як `Origin`/`Referer`. Настольная зборка праглядальніка павінна сама адпраўляць свой.
- **Нішто, атрыманае з OpenStreetMap, ніколі не пастаўляецца** разам з праглядальнікам і не фіксуецца ў яго рэпазіторыі: умова захавання ліцэнзіі ODbL дзейнічае на распаўсюджваную вытворную базу. Фоны будуюцца на машыне карыстальніка і захоўваюцца толькі ў гэтым браўзеры (кэш пліткаў і, калі захавана, бібліятэка ўзроўняў).
