---
title: "Фон світу: джерела і терміни"
parent: "Фон світу"
grand_parent: "Рівні та фонова геометрія"
nav_order: 1
lang: "uk"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Світове тло: джерела й умови

Дані мапи [світового тла](world-backdrop.md) походять з відкритих сервісів. Ця сторінка перелічує кожне джерело, його ліцензію і те, як 3DHeat лишається в межах його умов.

| Джерело | Умови (як прочитано 7 листопада 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - векторні плитки за схемою OpenMapTiles з OpenStreetMap, поточна збірка має назву `https://tiles.openfreemap.org/planet` | Безкоштовно, без ключа, комерційне використання дозволено. [Умови](https://openfreemap.org/tos/) забороняють збирати дані «автоматизованими способами, крім офлайн-завантажень»: застосунок може дозволити користувачам завантажити ділянку для офлайн-використання, якщо кожне завантаження не більше 3 000 плиток або 50 МБ, зроблене не більш ніж 4 паралельними запитами, з User-Agent, що ідентифікує застосунок. Потрібне зазначення авторства: «OpenFreeMap © OpenMapTiles Data from OpenStreetMap» (частина OpenFreeMap необов’язкова). Сервіс може припинити роботу без попередження. |
| Дані [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Їх завантаження під час роботи і локальне малювання - це приватне використання; намальований вигляд є Produced Work, якому потрібне видиме зазначення авторства, так само як скріншотам і відео, зробленим з нього. |
| Схема [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 для схеми; зазначення «© OpenMapTiles». |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Оприлюднено в суспільне надбання; без ключа. Зазначення «Runways: OurAirports (public domain)» показується як люб’язність. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Шар 2016 року під CC BY 4.0 (пізніші роки під CC BY-NC-SA, не використовуються). Сторінка сервісу EOX запрошує використовувати кінцеві точки в застосунках як демо-сервіс без гарантій і з обмеженням частоти запитів; про кешування нічого не сказано, а CC BY його дозволяє. Зазначення, показане на полотні: «EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)», з посиланням. CORS: походження запиту повертається назад. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-кодовані 512 px без втрат WebP, без ключа, відкритий CORS. Джерела під CC BY, суспільне надбання та подібні відкриті ліцензії (жодна не некомерційна і не з вимогою share-alike); зазначення «© Mapterhorn» і, для глобального шару, «produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA». Для публічної кінцевої точки не опубліковано політики використання. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ортофотознімки, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: «Більшість інформації U.S. Geological Survey (USGS) належить до суспільного надбання і може використовуватися без обмежень»; вона просить зазначення, наприклад «(назва продукту або даних) courtesy of the U.S. Geological Survey». Сервіс називає своє джерело «USDA, USGS The National Map: Orthoimagery» (USDA NAIP, теж федеральна робота суспільного надбання); це і є показане зазначення. Без ключа, відкритий CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Умови Géoplateforme вказують WMTS як «Non soumis à limite d'usage» (без обмеження використання; WMS обмежено 40-50 запитами на секунду); дані «soumises à la licence choisie et renseignée par le Fournisseur de données», за замовчуванням Etalab Licence Ouverte, за якою BD ORTHO відкрито з 2021 року; користувачі мусять «ne pas nuire, entraver ou fausser le bon fonctionnement des API» (не шкодити, не заважати й не спотворювати роботу API). Кешування не згадано; Licence Ouverte дозволяє повторне використання з зазначенням джерела: «Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0». Без ключа, відкритий CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Відкриті дані з багатьох джерел, кожне зі своїм зазначенням ([список](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); без ключа, без гарантій сервісу, віддається з відкритим CORS. Висоти декодуються як `R × 256 + G + B / 256 − 32768` метрів. |

## Як тло лишається в межах цих умов {#how-the-backdrop-stays-inside-those-terms}

- Тло під записом завантажує не більше 36 плиток висот і 300 векторних плиток; театр, побудований один раз, - не більше 64 + 100 плиток висот і 64 + 1 500 векторних плиток; театр, що стримується потоком, - по одній плитці кожного джерела на одну плитку мапи, у міру руху камери. Чотири запити одночасно на джерело.
- **Театр, побудований один раз, - це одне завантаження**, і воно завантажує не більше 1 000 векторних плиток або 40 МБ (умови OpenFreeMap дозволяють 3 000 плиток або 50 МБ). Плитки запитуються спершу з центру; після ліміту побудова бере лише плитки, які вже є в кеші, і повідомляє, скільки ще лишилося. Повторна побудова забирає наступну порцію, і так далі: велика ділянка приходить частинами, кожна з яких кешується.
- За виміром на синтетичних польотах: театр із детальною ділянкою 25 км завантажує близько 370 плиток і 20 МБ при першій побудові. Побудований знову або пролетінний назад, нічого не завантажується.
- Плитки завантажуються лише коли натиснуто **Світове тло**, ніколи у фоновому режимі.
- Браузер не дозволяє сторінці задавати власний User-Agent; запити несуть User-Agent браузера, а походження сторінки - як `Origin`/`Referer`. Настільна збірка переглядача має надсилати свій.
- **Нічого, похідного від OpenStreetMap, ніколи не поставляється** з переглядачем і не комітиться в його репозиторій: share-alike за ODbL діє на розповсюджувану похідну базу даних. Тла будуються на машині користувача і зберігаються лише в цьому браузері (кеш плиток і, якщо збережено, бібліотека рівнів).
