---
title: "Позадина на светот - извори и термини"
parent: "Позадина на светот"
grand_parent: "Нивоа и геометрија на позадината"
nav_order: 1
lang: "mk"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Позадина на светот - извори и услови

Податоците за картата на [позадината на светот](world-backdrop.md) доаѓаат од отворени услуги. Оваа страница ги наведува секој извор, неговата лиценца и како 3DHeat останува во рамките на условите.

| Извор | Услови (како што се читаат на 7 ноември 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - векторски плочки во шемата OpenMapTiles од OpenStreetMap, тековната верзија именувана со `https://tiles.openfreemap.org/planet` | Бесплатно, без клуч, комерцијална употреба дозволена. [Условите](https://openfreemap.org/tos/) забрануваат собирање податоци „на автоматски начини, освен за преземања за офлајн употреба“: апликација може да му дозволи на корисник да преземе област за офлајн користење ако секое преземање е најмногу 3 000 плочки или 50 MB, направено со најмногу 4 паралелни барања, со User-Agent што ја идентификува апликацијата. Потребно е наведување: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap“ (делот OpenFreeMap е изборен). Услугата може да прекине без најава. |
| Податоци од [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Нивното преземање при работа и исцртување локално е приватна употреба; прикажаниот приказ е Produced Work што бара видно наведување, а истото важи и за снимките од екранот и видеата направени од него. |
| Шема на [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 за шемата; наведување „© OpenMapTiles“. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Објавено во јавен домен; без клуч. Наведувањето „Runways: OurAirports (public domain)“ се прикажува како учтивост. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Слојот од 2016 е CC BY 4.0 (подоцнежните години се CC BY-NC-SA, не се користат). Страницата на услугата на EOX ја покани употребата на крајните точки во апликации, како демо услуга без гаранција и со ограничување на бројот барања; ништо не вели за кеширање, што CC BY го дозволува. Наведување, прикажано на платното: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)“, поврзано. CORS: потеклото на барањето се враќа. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-кодирани 512 px без загуби WebP, без клуч, отворен CORS. Извори под CC BY, јавен домен и слични отворени лиценци (ниедна некомерцијална или со споделување под истите услови); наведување „© Mapterhorn“ и, за глобалниот слој, „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA“. Нема објавена политика за употреба на јавната крајна точка. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ортофото, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Повеќето информации на Геолошкиот завод на САД (USGS) се во јавен домен и може да се користат без ограничување“; бара наведување, на пример „(Име на производот или податоците) courtesy of the U.S. Geological Survey“. Услугата го именува својот извор „USDA, USGS The National Map: Orthoimagery“ (USDA NAIP, исто така федерално дело во јавен домен); тоа е наведувањето што се прикажува. Без клуч, отворен CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Условите на Géoplateforme го наведуваат WMTS како „Non soumis à limite d'usage“ (без ограничување на употребата; WMS е ограничен на 40-50 барања во секунда); податоците се „soumises à la licence choisie et renseignée par le Fournisseur de données“, по стандард Etalab Licence Ouverte, според која BD ORTHO е отворена од 2021; корисниците мора „ne pas nuire, entraver ou fausser le bon fonctionnement des API“. Кеширањето не е решено; Licence Ouverte дозволува повторна употреба со наведување на изворот: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0“. Без клуч, отворен CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Отворени податоци од многу извори, секој со свое наведување ([список](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); без клуч, без гаранција на услугата, послужено со отворен CORS. Висините се декодираат како `R × 256 + G + B / 256 − 32768` метри. |

## Како позадината останува во овие услови {#how-the-backdrop-stays-inside-those-terms}

- Позадината под снимка презема најмногу 36 плочки на висина и 300 векторски плочки; теренот изграден еднаш најмногу 64 + 100 плочки на висина и 64 + 1 500 векторски плочки; теренот што се пренесува еден плочка од секој извор во исто време по плочка на картата, како што камерата се движи. Четири барања во исто време по извор.
- **Теренот изграден еднаш е едно преземање**, и се преземаат најмногу 1 000 векторски плочки или 40 MB (условите на OpenFreeMap дозволуваат 3 000 плочки или 50 MB). Плочките се бараат најпрво центарот; по дозволеното, изградбата ги зема само плочките веќе во кешот и кажува колку уште остануваат. Повторната изградба го зема следниот дел, и така натаму: голема област пристигнува на парчиња, секое кеширано.
- Измерено на синтетички летови: теренот со детално подрачје од 25 km зема околу 370 плочки и 20 MB првпат. Изградени повторно, или летани над него, ништо не се презема.
- Плочките се преземаат само кога ќе се притисне **Вистинскиот свет како позадина**, никогаш во позадина.
- Прелистувачот не дозволува страница да поставува свој User-Agent; барањата го носат на прелистувачот, а потеклото на страницата како `Origin`/`Referer`. Десктоп-верзијата на приказникот треба да испраќа свој.
- **Ништо изведено од OpenStreetMap никогаш не се испорачува** со приказникот или не се префрла во неговото складиште: споделувањето под истите услови на ODbL важи за дистрибуирана изведена база. Позадините се градат на машината на корисникот и се чуваат само во тој прелистувач (кешот на плочките и, ако се зачува, библиотеката на нивоа).
