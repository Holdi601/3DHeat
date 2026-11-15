---
title: "Фон на света - източници и термини"
parent: "Фон на света"
grand_parent: "Нива и фонова геометрия"
nav_order: 1
lang: "bg"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Фон на света - източници и условия

Данните на картата на [фона на света](world-backdrop.md) идват от отворени услуги. Тази страница изброява всеки източник, лиценза му и как 3DHeat остава в рамките на условията.

| Източник | Условия (както са прочетени на 7 ноември 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - векторни плочки по схемата на OpenMapTiles от OpenStreetMap, текущата версия е посочена от `https://tiles.openfreemap.org/planet` | Безплатно, без ключ, търговската употреба е разрешена. [Условията](https://openfreemap.org/tos/) забраняват събиране на данни „по автоматизиран начин, освен за офлайн изтегляния“: приложение може да позволи на потребителите да изтеглят област за офлайн ползване, ако всяко изтегляне е най-много 3000 плочки или 50 MB, направено с най-много 4 паралелни заявки, с User-Agent, който идентифицира приложението. Указването на източника е задължително: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap“ (частта OpenFreeMap е по избор). Услугата може да спре без предупреждение. |
| Данни на [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1,0. Извличането им при изпълнение и локалното им рисуване е лична употреба; показаният изглед е Produced Work, който изисква видимо посочване на източника, както и снимките и видеата, направени от него. |
| Схема [OpenMapTiles](https://openmaptiles.org) | CC BY 4,0 за схемата; посочване „© OpenMapTiles“. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Пуснат в публично достояние; без ключ. Посочването „Runways: OurAirports (public domain)“ се показва като любезност. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Слоят за 2016 е CC BY 4,0 (по-новите години са CC BY-NC-SA, не се използват). Страницата на услугата на EOX покана за ползване на крайните точки в приложения, като демо услуга без гаранция и с ограничаване на заявките; нищо не казва за кеширане, което CC BY позволява. Посочване, показвано върху платното: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)“, със връзка. CORS: произходът на заявката се връща обратно. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP без загуби 512 px, кодиран в Terrarium, без ключ, отворен CORS. Източниците са по CC BY, публично достояние и подобни отворени лицензи (нито един некомерсиален или със споделяне на същия лиценз); посочване „© Mapterhorn“ и, за глобалния слой, „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA“. Няма публикувана политика за ползване на публичната крайна точка. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ортофото, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Повечето информация на Геологическата служба на САЩ (USGS) е в публично достояние и може да се ползва без ограничения“; тя иска посочване, напр. „(име на продукта или данните) courtesy of the U.S. Geological Survey“. Услугата назовава източника си „USDA, USGS The National Map: Orthoimagery“ (USDA NAIP, също федерално произведение в публично достояние); това е показаното посочване. Без ключ, отворен CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Условията на Géoplateforme изброяват WMTS като „Non soumis à limite d'usage“ (без ограничение на употребата; WMS е ограничен до 40-50 заявки в секунда); данните са „soumises à la licence choisie et renseignée par le Fournisseur de données“, по подразбиране Etalab Licence Ouverte, по която BD ORTHO е отворена от 2021; ползвателите трябва да „ne pas nuire, entraver ou fausser le bon fonctionnement des API“. Кеширането не е уредено; Licence Ouverte позволява повторна употреба с посочен източник: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2,0“. Без ключ, отворен CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Отворени данни от много източници, всеки със собствено посочване ([списък](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); без ключ, без гаранция за услугата, предлагана с отворен CORS. Височините се декодират като `R × 256 + G + B / 256 − 32768` метра. |

## Как фонът остава в рамките на тези условия {#how-the-backdrop-stays-inside-those-terms}

- Фон под запис изтегля най-много 36 плочки на височина и 300 векторни плочки; театър, построен веднъж, - най-много 64 + 100 плочки на височина и 64 + 1500 векторни плочки; поточен театър - по една плочка от всеки източник наведнъж за всяка картна плочка, докато камерата се движи. Четири заявки наведнъж за източник.
- **Театър, построен веднъж, е едно изтегляне**, а изтеглянията са най-много 1000 векторни плочки или 40 MB (условията на OpenFreeMap позволяват 3000 плочки или 50 MB). Плочките се искат първо от центъра; след лимита построяването взима само плочките, които вече са в кеша, и казва колко още предстоят. Построяването отново взима следващата част и така нататък: голяма област пристига на части, като всяка се кешира.
- Измерено върху синтетични полети: театър с подробна област от 25 km взима около 370 плочки и 20 MB първия път. Построен отново или прелетян обратно, нищо не се изтегля.
- Плочките се изтеглят само когато се натисне **Фон на света**, никога във фонов режим.
- Браузърът не позволява на страницата да задава собствен User-Agent; заявките носят този на браузъра и произхода на страницата като `Origin`/`Referer`. Настолна версия на визуализатора трябва да изпраща своя.
- **Нищо, извлечено от OpenStreetMap, никога не се пуска** с визуализатора и не се добавя в хранилището му: споделянето на ODbL важи за разпространявана производна база данни. Фоновете се строят на машината на ползвателя и се пазят само в този браузър (кешът на плочките и, ако са запазени, библиотеката на нивата).
