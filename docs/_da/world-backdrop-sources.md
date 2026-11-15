---
title: "Verdensbaggrund: kilder og begreber"
parent: "Verdensbaggrund"
grand_parent: "Baner og baggrundsgeometri"
nav_order: 1
lang: "da"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Verdensbaggrund: kilder og begreber

Kortdataene i en [verdensbaggrund](world-backdrop.md) kommer fra åbne tjenester. Denne side viser hver kilde, dens licens, og hvordan 3DHeat holder sig inden for vilkårene.

| Kilde | Vilkår (som læst den 7. november 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - vektorfliser i OpenMapTiles-skemaet fra OpenStreetMap, nuværende build angivet af `https://tiles.openfreemap.org/planet` | Gratis, ingen nøgle, kommerciel brug tilladt. [vilkårene](https://openfreemap.org/tos/) forbyder at indsamle data "på automatiserede måder, undtagen til offline-download": en app må lade brugere hente et område til offline-brug, hvis hver download højst er 3.000 fliser eller 50 MB, lavet med højst 4 parallelle forespørgsler, med en User-Agent der identificerer appen. Kreditering er påkrævet: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (OpenFreeMap-delen valgfri). Tjenesten kan ophøre uden varsel. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright)-data | ODbL 1.0. At hente dem under kørsel og tegne dem lokalt er privat brug; den viste visning er et Produced Work, der kræver en synlig kredit, og det samme gælder skærmbilleder og videoer lavet af den. |
| [OpenMapTiles](https://openmaptiles.org)-skemaet | CC BY 4.0 for skemaet; kredit "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Udgivet til det offentlige domæne; ingen nøgle. Kreditten "Runways: OurAirports (public domain)" vises som høflighed. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Laget fra 2016 er CC BY 4.0 (senere år er CC BY-NC-SA, bruges ikke). EOX' tjenesteside inviterer til brug af endpoints i applikationer, som en demotjeneste uden garanti og med hastighedsbegrænsning; den siger intet om caching, hvilket CC BY tillader. Kredit, vist på lærredet: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", linket. CORS: forespørgslens oprindelse gentages. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-kodet 512 px tabsfri WebP, ingen nøgle, åben CORS. Kilder under CC BY, det offentlige domæne og lignende åbne licenser (ingen ikke-kommercielle eller share-alike); kredit "© Mapterhorn" og, for det globale lag, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Ingen offentliggjort brugspolitik for det offentlige endpoint. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map)-ortofotos, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction" (det meste af USGS' information er i det offentlige domæne og må bruges uden begrænsninger); de beder om kredit, fx "(Product or data name) courtesy of the U.S. Geological Survey". Tjenesten navngiver sin kilde "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, også et føderalt værk i det offentlige domæne); det er den kredit, der vises. Ingen nøgle, åben CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateformens vilkår angiver WMTS som "Non soumis à limite d'usage" (ingen brugsgrænse; WMS er begrænset til 40-50 forespørgsler i sekundet); data er "soumises à la licence choisie et renseignée par le Fournisseur de données" (underlagt den licens, dataleverandøren har valgt og angivet), som standard Etalab Licence Ouverte, hvorunder BD ORTHO har været åben siden 2021; brugere skal "ne pas nuire, entraver ou fausser le bon fonctionnement des API" (ikke skade, hindre eller forvrænge API'ernes korrekte funktion). Caching er ikke behandlet; Licence Ouverte tillader genbrug, når kilden krediteres: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Ingen nøgle, åben CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Åbne data fra mange kilder, hver med sin egen kredit ([liste](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); ingen nøgle, ingen tjenestegaranti, serveret med åben CORS. Højder afkodes som `R × 256 + G + B / 256 − 32768` meter. |

## Hvordan baggrunden holder sig inden for disse vilkår {#how-the-backdrop-stays-inside-those-terms}

- En baggrund under en optagelse henter højst 36 højdefliser og 300 vektorfliser; et teater bygget én gang højst 64 + 100 højdefliser og 64 + 1.500 vektorfliser; et streamet teater én flise fra hver kilde ad gangen pr. kortflise, efterhånden som kameraet bevæger sig. Fire forespørgsler ad gangen pr. kilde.
- **Et teater bygget én gang er én download**, og downloads er højst 1.000 vektorfliser eller 40 MB (OpenFreeMaps vilkår tillader 3.000 fliser eller 50 MB). Fliser efterspørges med centrum først; efter kvoten tager opbygningen kun de fliser, der allerede er i cachen, og siger, hvor mange der stadig mangler. Bygges igen, hentes den næste bid, og så videre: et stort område kommer i stykker, og hver del caches.
- Målt på syntetiske flyvninger: et teater med et 25 km detaljeret område tager omkring 370 fliser og 20 MB første gang. Bygges det igen, eller flyves tilbage over det, hentes intet.
- Fliser hentes kun, når **Virkelig verden som baggrund** trykkes, aldrig i baggrunden.
- En browser lader ikke en side sætte sin egen User-Agent; forespørgslerne bærer browserens, og sidens oprindelse som `Origin`/`Referer`. En desktopversion af viseren bør sende sin egen.
- **Intet afledt af OpenStreetMap leveres nogensinde** sammen med viseren eller committes til dens repository: ODbL's share-alike gælder for en distribueret afledt database. Baggrunde bygges på brugerens maskine og gemmes kun i den browser (fliscachen og, hvis gemt, banebiblioteket).
