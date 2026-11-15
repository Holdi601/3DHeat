---
title: "Фон мира: источники и условия"
parent: "Фон мира"
grand_parent: "Уровни и фоновая геометрия"
nav_order: 1
lang: "ru"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Фон мира: источники и условия

Данные карты для [фона мира](world-backdrop.md) берутся из открытых сервисов. На этой странице перечислен каждый источник, его лицензия и то, как 3DHeat остаётся в рамках условий.

| Источник | Условия (по состоянию на 7 ноября 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) — векторные тайлы по схеме OpenMapTiles из OpenStreetMap, текущая сборка с именем `https://tiles.openfreemap.org/planet` | Бесплатно, без ключа, коммерческое использование разрешено. [Условия](https://openfreemap.org/tos/) запрещают сбор данных «автоматическими способами, кроме офлайн-загрузок»: приложение может позволить пользователям загрузить область для офлайн-использования, если каждая загрузка не больше 3 000 тайлов или 50 МБ, выполняется не более чем 4 параллельными запросами и с User-Agent, который называет приложение. Атрибуция обязательна: «OpenFreeMap © OpenMapTiles Data from OpenStreetMap» (часть про OpenFreeMap необязательна). Сервис может прекратить работу без предупреждения. |
| Данные [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Загрузка во время работы и локальная отрисовка — это частное использование; нарисованный вид — производное произведение, которое требует видимой ссылки на источник, и её требуют скриншоты и видео, сделанные из него. |
| Схема [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 для схемы; ссылка «© OpenMapTiles». |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Выпущено в общественное достояние; без ключа. Ссылка «Runways: OurAirports (public domain)» показывается из вежливости. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Слой 2016 года — CC BY 4.0 (более поздние годы — CC BY-NC-SA, не используются). Страница сервиса EOX приглашает использовать конечные точки в приложениях как демонстрационный сервис без гарантий и с ограничением частоты запросов; о кэшировании она ничего не говорит, а CC BY его разрешает. Ссылка, показывается на холсте: «EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)», с ссылкой. CORS: происхождение запроса возвращается в ответе. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Без потерь WebP 512 px с кодировкой Terrarium, без ключа, открытый CORS. Источники под CC BY, общественным достоянием и подобными открытыми лицензиями (ни одна не некоммерческая и не с share-alike); ссылка «© Mapterhorn», а для глобального слоя — «produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA». Опубликованной политики использования для публичной конечной точки нет. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map), ортофото `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: «Большая часть информации Геологической службы США (USGS) находится в общественном достоянии и может использоваться без ограничений»; просит ссылку, например «(название продукта или данных) courtesy of the U.S. Geological Survey». Сервис называет свой источник «USDA, USGS The National Map: Orthoimagery» (USDA NAIP, тоже федеральная работа в общественном достоянии); эта ссылка и показывается. Без ключа, открытый CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu), BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Условия Géoplateforme перечисляют WMTS как «Non soumis à limite d'usage» (без ограничения использования; WMS ограничен 40–50 запросами в секунду). Данные «soumises à la licence choisie et renseignée par le Fournisseur de données», по умолчанию — Licence Ouverte Etalab, по которой BD ORTHO открыта с 2021 года; пользователи должны «ne pas nuire, entraver ou fausser le bon fonctionnement des API». Кэширование не оговорено; Licence Ouverte разрешает повторное использование с указанием источника: «Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0». Без ключа, открытый CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Открытые данные из многих источников, у каждого своя ссылка ([список](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); без ключа, без гарантий сервиса, отдаётся с открытым CORS. Высоты декодируются как `R × 256 + G + B / 256 − 32768` метров. |

## Как фон остаётся в рамках этих условий {#how-the-backdrop-stays-inside-those-terms}

- Фон под записью загружает не больше 36 тайлов высот и 300 векторных тайлов; театр, построенный один раз, — не больше 64 + 100 тайлов высот и 64 + 1 500 векторных тайлов; потоковый театр — по одному тайлу каждого источника за раз на каждый тайл карты, по мере движения камеры. Четыре запроса одновременно на каждый источник.
- **Театр, построенный один раз, — это одна загрузка.** Загрузка не превышает 1 000 векторных тайлов или 40 МБ (условия OpenFreeMap разрешают 3 000 тайлов или 50 МБ). Тайлы запрашиваются сначала центральные. За пределом лимита построение берёт только тайлы, которые уже есть в кэше, и сообщает, сколько ещё осталось. Повторное построение загружает следующую порцию, и так далее: большая область приходит кусками, и каждый кусок кэшируется.
- По синтетическим полётам измерено: театр с подробной областью 25 км при первом построении занимает около 370 тайлов и 20 МБ. Построенный снова или пройденный обратно, он ничего не загружает.
- Тайлы загружаются только тогда, когда нажата кнопка **Реальный мир как фон**, никогда в фоне.
- Браузер не позволяет странице задать собственный User-Agent: запросы несут User-Agent браузера, а происхождение страницы уходит в `Origin` и `Referer`. Настольная сборка просмотрщика должна отправлять свой.
- **Ничто, производное от OpenStreetMap, никогда не поставляется** вместе с просмотрщиком и не коммитится в его репозиторий: share-alike из ODbL действует на распространяемую производную базу. Фоны строятся на машине пользователя и хранятся только в этом браузере (кэш тайлов и, если сохранены, библиотека уровней).
