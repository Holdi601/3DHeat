---
title: "Verdensbakgrunn: kilder og vilkår"
parent: "Verdensbakgrunn"
grand_parent: "Baner og bakgrunnsgeometri"
nav_order: 1
lang: "no"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Verdensbakgrunn: kilder og vilkår

Kartdataene til en [verdensbakgrunn](world-backdrop.md) kommer fra åpne tjenester. Denne siden lister hver kilde, lisensen og hvordan 3DHeat holder seg innenfor vilkårene.

| Kilde | Vilkår (slik de ble lest 7. november 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) – vektorfliser i OpenMapTiles-skjema fra OpenStreetMap, gjeldende bygg angitt av `https://tiles.openfreemap.org/planet` | Gratis, ingen nøkkel, kommersiell bruk tillatt. [vilkårene](https://openfreemap.org/tos/) forbyr innsamling av data «på automatiserte måter, unntatt for frakoblet nedlasting»: en app kan la brukere laste ned et område for frakoblet bruk hvis hver nedlasting er høyst 3 000 fliser eller 50 MB, gjort med høyst 4 parallelle forespørsler, med en User-Agent som identifiserer appen. Kreditering er påkrevd: «OpenFreeMap © OpenMapTiles Data from OpenStreetMap» (OpenFreeMap-delen valgfri). Tjenesten kan avsluttes uten varsel. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright)-data | ODbL 1.0. Å hente dem under kjøring og tegne dem lokalt er privat bruk; den tegnede visningen er et produsert verk som trenger en synlig kreditering, og det samme gjelder skjermbilder og videoer laget av den. |
| [OpenMapTiles](https://openmaptiles.org)-skjemaet | CC BY 4.0 for skjemaet; kreditering «© OpenMapTiles». |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Utgitt i det fri (public domain); ingen nøkkel. Krediteringen «Runways: OurAirports (public domain)» vises som en høflighet. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016-laget er CC BY 4.0 (senere år er CC BY-NC-SA, ikke brukt). EOX sin tjenesteside inviterer til bruk av endepunktene i applikasjoner, som en demotjeneste uten garanti og med hastighetsbegrensning; den sier ingenting om hurtigbufring, som CC BY tillater. Kreditering, vist på lerretet: «EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)», lenket. CORS: forespørselens opprinnelse ekkoes tilbake. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-kodede 512 px tapsfrie WebP-bilder, ingen nøkkel, åpen CORS. Kilder under CC BY, offentlig eiendom og lignende åpne lisenser (ingen ikke-kommersielle eller del-likt-lisenser); kreditering «© Mapterhorn» og, for det globale laget, «produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA». Ingen publisert bruksregel for det offentlige endepunktet. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map)-ortofoto, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: «Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction»; de ber om kreditering, for eksempel «(Product or data name) courtesy of the U.S. Geological Survey». Tjenesten oppgir kilden sin som «USDA, USGS The National Map: Orthoimagery» (USDA NAIP, også et føderalt verk i det fri); det er krediteringen som vises. Ingen nøkkel, åpen CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme-vilkårene lister WMTS som «Non soumis à limite d'usage» (ingen bruksgrense; WMS er begrenset til 40–50 forespørsler per sekund); data er «soumises à la licence choisie et renseignée par le Fournisseur de données», som standard Etalab Licence Ouverte, der BD ORTHO har vært åpen siden 2021; brukere må «ne pas nuire, entraver ou fausser le bon fonctionnement des API». Hurtigbufring er ikke omtalt; Licence Ouverte tillater gjenbruk med kilden kreditert: «Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0». Ingen nøkkel, åpen CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Åpne data fra mange kilder, hver med sin egen kreditering ([liste](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); ingen nøkkel, ingen tjenestegaranti, servert med åpen CORS. Høyder dekodes som `R × 256 + G + B / 256 − 32768` meter. |

## Slik holder bakgrunnen seg innenfor disse vilkårene {#how-the-backdrop-stays-inside-those-terms}

- En bakgrunn under et opptak laster ned høyst 36 høydefliser og 300 vektorfliser; et teater bygget én gang høyst 64 + 100 høydefliser og 64 + 1 500 vektorfliser; et strømmet teater én flis fra hver kilde om gangen per kartflis, etter hvert som kameraet beveger seg. Fire forespørsler om gangen per kilde.
- **Et teater bygget én gang er én nedlasting**, og nedlastingene er høyst 1 000 vektorfliser eller 40 MB (OpenFreeMaps vilkår tillater 3 000 fliser eller 50 MB). Flisene etterspørres midt i først; etter kvoten tar bygget bare fliser som allerede er i bufferen, og sier hvor mange som fortsatt gjenstår. Å bygge på nytt henter neste del, og så videre: et stort område kommer i biter, hver bufret.
- Målt på syntetiske flyvninger: et teater med et detaljert område på 25 km tar omtrent 370 fliser og 20 MB første gang. Bygget igjen, eller flydd tilbake over, lastes ingenting ned.
- Fliser lastes bare ned når **Bakgrunn fra den virkelige verden** trykkes, aldri i bakgrunnen.
- En nettleser lar ikke en side sette sin egen User-Agent; forespørslene bærer nettleserens, og sidens opprinnelse som `Origin`/`Referer`. En skrivebordsversjon av visningen bør sende sin egen.
- **Ingenting avledet fra OpenStreetMap blir noensinne sendt** med visningen eller committet til dens repositorium: ODbLs del-likt-regel gjelder for en distribuert avledet database. Bakgrunner bygges på brukerens maskin og lagres bare i den nettleseren (flisbufferen og, hvis lagret, nivåbiblioteket).
