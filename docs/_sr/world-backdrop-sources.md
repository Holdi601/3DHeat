---
title: "Позадина света - извори и појмови"
parent: "Позадина света"
grand_parent: "Нивои и геометрија позадине"
nav_order: 1
lang: "sr"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Позадина света: извори и услови

Подаци мапе [позадине света](world-backdrop.md) долазе из отворених услуга. Ова страница наводи сваки извор, његову лиценцу и како 3DHeat остаје у оквиру услова.

| Извор | Услови (како су прочитани 7. новембра 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - векторске плочице шеме OpenMapTiles из OpenStreetMap-а, текућа верзија именована са `https://tiles.openfreemap.org/planet` | Бесплатно, без кључа, комерцијална употреба дозвољена. [Услови](https://openfreemap.org/tos/) забрањују прикупљање података „на аутоматизоване начине, осим за преузимања ван мреже”: апликација може дозволити корисницима да преузму област за рад ван мреже ако је свако преузимање највише 3.000 плочица или 50 MB, направљено с највише 4 паралелна захтева, са User-Agent-ом који идентификује апликацију. Потребно је приписивање: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap” (део OpenFreeMap је необавезан). Услуга може престати без најаве. |
| Подаци [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Преузимање при извршавању и локално цртање је приватна употреба; нацртани приказ је Produced Work који захтева видљиво приписивање, а то важи и за снимке екрана и видео-снимке направљене од њега. |
| Шема [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 за шему; приписивање „© OpenMapTiles”. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Објављено у јавном домену; без кључа. Приписивање „Runways: OurAirports (public domain)” се показује као љубазност. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Слој из 2016. је CC BY 4.0 (каснији у години су CC BY-NC-SA, не користе се). EOX-ова страница услуге позива на коришћење крајњих тачака у апликацијама, као демо услугу без гаранције и уз ограничење брзине; о кеширању не говори ништа, што CC BY дозвољава. Приписивање, приказано на платну: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)”, с везом. CORS: порекло захтева се враћа. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium кодиране, 512 px, без губитка WebP, без кључа, отворен CORS. Извори под CC BY, јавним доменом и сличним отвореним лиценцама (ниједна некомерцијална или са дељењем под истим условима); приписивање „© Mapterhorn” и, за глобални слој, „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA”. Нема објављене политике коришћења за јавну крајњу тачку. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ортофото, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Већина информација Геолошког завода САД (USGS) припада јавном домену и може се користити без ограничења”; тражи приписивање, на пример „(назив производа или података) courtesy of the U.S. Geological Survey”. Услуга свој извор именује „USDA, USGS The National Map: Orthoimagery” (USDA NAIP, такође федерално дело у јавном домену); то је приписивање које се приказује. Без кључа, отворен CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Услови Géoplateforme-а наводе WMTS као „Non soumis à limite d'usage” (без ограничења коришћења; WMS је ограничен на 40-50 захтева у секунди); подаци су „soumises à la лиценце choisie et renseignée par le Fournisseur de données”, подразумевано Etalab Licence Ouverte, по којој је BD ORTHO отворен од 2021; корисници треба да „ne pas nuire, entraver ou fausser le bon fonctionnement des API”. Кеширање није обрађено; Licence Ouverte дозвољава поновно коришћење уз навођење извора: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0”. Без кључа, отворен CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Отворени подаци из многих извора, сваки са својим приписивањем ([списак](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); без кључа, без гаранције услуге, послужено с отвореним CORS-ом. Висине се декодирају као `R × 256 + G + B / 256 − 32768` метара. |

## Како позадина остаје у оквиру тих услова {#how-the-backdrop-stays-inside-those-terms}

- Позадина под снимком преузима највише 36 плочица висина и 300 векторских плочица; позориште направљено једном највише 64 + 100 плочица висина и 64 + 1.500 векторских плочица; позориште које се тока - по једну плочицу сваког извора по плочици мапе, како камера иде. Четири захтева истовремено по извору.
- **Позориште направљено једном је једно преузимање**, и преузима највише 1.000 векторских плочица или 40 MB (услови OpenFreeMap-а дозвољавају 3.000 плочица или 50 MB). Плочице се траже прво са центра; преко дозвољеног, израда узима само плочице које су већ у кешу и каже колико их још предстоји. Поновна израда преузима следећи део, и тако даље: велика област стиже у деловима, а сваки се кешира.
- Мерено на синтетичким летовима: позориште са детаљном површином од 25 km узима око 370 плочица и 20 MB први пут. Поново направљено, или праћено уназад, ништа се не преузима.
- Плочице се преузимају само кад се притисне **Позадина света**, никад у позадини.
- Прегледач не дозвољава страници да постави свој User-Agent; захтеви носе прегледачев, а порекло странице као `Origin`/`Referer`. Десктоп верзија приказивача треба да шаље свој.
- **Ништа изведено из OpenStreetMap-а се никад не испоручује** уз приказивач нити се уписује у његов репозиторијум: ODbL-ово дељење под истим условима важи за дистрибуирану изведену базу. Позадине се праве на рачунару корисника и чувају се само у том прегледачу (кеш плочица и, ако је сачувано, библиотека нивоа).
