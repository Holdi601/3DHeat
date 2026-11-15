---
title: "Tło świata - źródła i pojęcia"
parent: "Tło świata"
grand_parent: "Poziomy i geometria tła"
nav_order: 1
lang: "pl"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Tło świata: źródła i warunki

Dane mapy [tła świata](world-backdrop.md) pochodzą z otwartych usług. Ta strona wymienia każde źródło, jego licencję i to, jak 3DHeat trzyma się warunków.

| Źródło | Warunki (stan z 7 listopada 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - kafelki wektorowe w schemacie OpenMapTiles z OpenStreetMap, aktualna wersja wskazana przez `https://tiles.openfreemap.org/planet` | Darmowe, bez klucza, użycie komercyjne dozwolone. [Warunki](https://openfreemap.org/tos/) zakazują zbierania danych „w zautomatyzowany sposób, z wyjątkiem pobierania offline”: aplikacja może pozwolić użytkownikom pobrać obszar do pracy offline, jeśli każde pobranie ma najwyżej 3000 kafelków albo 50 MB, jest wykonane najwyżej 4 równoległymi żądaniami i ma User-Agent identyfikujący aplikację. Wymagane jest podanie autorstwa: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap” (część OpenFreeMap opcjonalna). Usługa może zakończyć działanie bez uprzedzenia. |
| Dane [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Pobieranie w czasie działania i rysowanie lokalnie to użytek prywatny; rysowany widok to Produced Work, który wymaga widocznego podania autorstwa, tak samo jak zrzuty ekranu i filmy z niego. |
| Schemat [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 dla schematu; podanie autorstwa „© OpenMapTiles”. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Wydane do domeny publicznej; bez klucza. Podanie „Runways: OurAirports (public domain)” jest pokazywane jako uprzejmość. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Warstwa z 2016 roku to CC BY 4.0 (późniejsze lata to CC BY-NC-SA, nieużywane). Strona usługi EOX zaprasza do używania punktów końcowych w aplikacjach, jako usługi demonstracyjnej bez gwarancji i z ograniczaniem liczby żądań; nic nie mówi o buforowaniu, które CC BY dopuszcza. Podanie autorstwa, pokazywane na płótnie: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)”, z linkiem. CORS: pochodzenie żądania jest odsyłane z powrotem. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Bezstratny WebP 512 px kodowany w formacie Terrarium, bez klucza, otwarte CORS. Źródła na licencjach CC BY, domeny publicznej i podobnych otwartych (żadna niekomercyjna ani typu share-alike); podanie „© Mapterhorn” oraz dla warstwy globalnej „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA”. Brak opublikowanej polityki użycia dla publicznego punktu końcowego. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofotomapa, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Większość informacji U.S. Geological Survey (USGS) znajduje się w domenie publicznej i może być używana bez ograniczeń”; prosi o podanie autorstwa, np. „(nazwa produktu lub danych) courtesy of the U.S. Geological Survey”. Usługa nazywa swoje źródło „USDA, USGS The National Map: Orthoimagery” (USDA NAIP, także utwór federalny w domenie publicznej); to podanie jest pokazywane. Bez klucza, otwarte CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Warunki Géoplateforme podają WMTS jako „Non soumis à limite d'usage” (bez limitu użycia; WMS ma limit 40-50 żądań na sekundę). Dane podlegają „soumises à la licence choisie et renseignée par le Fournisseur de données”, domyślnie Licencji Otwartej Etalab, na której BD ORTHO jest otwarte od 2021 roku. Użytkownicy muszą „ne pas nuire, entraver ou fausser le bon fonctionnement des API”. Buforowanie nie jest omówione; Licencja Otwarta pozwala na ponowne użycie z podaniem źródła: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0”. Bez klucza, otwarte CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Dane otwarte z wielu źródeł, każde z własnym podaniem autorstwa ([lista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); bez klucza, bez gwarancji usługi, podawane z otwartym CORS. Wysokości dekoduje się jako `R × 256 + G + B / 256 − 32768` metrów. |

## Jak tło trzyma się tych warunków {#how-the-backdrop-stays-inside-those-terms}

- Tło pod nagraniem pobiera najwyżej 36 kafelków wysokości i 300 kafelków wektorowych; teatr zbudowany raz najwyżej 64 + 100 kafelków wysokości i 64 + 1500 kafelków wektorowych; teatr strumieniowany jeden kafelek każdego źródła naraz na kafelek mapy, w miarę ruchu kamery. Cztery żądania naraz na źródło.
- **Teatr zbudowany raz to jedno pobranie.** Pobrania są ograniczone do 1000 kafelków wektorowych albo 40 MB (warunki OpenFreeMap dopuszczają 3000 kafelków albo 50 MB). Kafelki są żądane najpierw ze środka; po wykorzystaniu limitu budowa bierze tylko kafelki już w pamięci podręcznej i mówi, ile jeszcze zostało. Kolejna budowa pobiera następną porcję, i tak dalej: duży obszar przychodzi w kawałkach, każdy zbuforowany.
- Zmierzone na syntetycznych lotach: teatr z 25 km szczegółowego obszaru bierze za pierwszym razem około 370 kafelków i 20 MB. Zbudowany ponownie albo po powrocie nic się nie pobiera.
- Kafelki są pobierane tylko wtedy, gdy naciśniesz **Tło świata**, nigdy w tle.
- Przeglądarka nie pozwala stronie ustawić własnego User-Agent. Żądania niosą User-Agent przeglądarki, a pochodzenie strony jako `Origin`/`Referer`. Wersja desktopowa widoku powinna wysyłać własny.
- **Nic pochodzącego z OpenStreetMap nie jest nigdy dostarczane** z widokiem ani zapisywane w jego repozytorium: klauzula share-alike ODbL dotyczy rozprowadzanej bazy pochodnej. Tła są budowane na komputerze użytkownika i trzymane tylko w tej przeglądarce (pamięć podręczna kafelków i, jeśli zapisane, biblioteka poziomów).
