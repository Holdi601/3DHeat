---
title: "Welt-Hannergrond - Quellen a Begrëffer"
parent: "Welt-Hannergrond"
grand_parent: "Levelen an Hannergrondgeometrie"
nav_order: 1
lang: "lb"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Richteg Welt als Hannergrond: Quellen a Konditioune

D'Kaartendaten vun engem [Richteg-Welt-Hannergrond](world-backdrop.md) kommen vun oppenen Dingschter. Dës Säit listet all Quell op, hir Lizenz, a wéi 3DHeat an de Konditioune bleift.

| Quell | Konditioune (wéi se den 7. November 2026 gelies goufen) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - Vektorkaachele vum OpenMapTiles-Schema aus OpenStreetMap, aktuelle Versioun mat `https://tiles.openfreemap.org/planet` | Gratis, ouni Schlëssel, kommerziell Notzung erlaabt. D'[Konditioune](https://openfreemap.org/tos/) verbidden, Daten "op automatiséiert Aart ze sammelen, ausser fir Offline-Downloads": eng App kann d'Benotzer e Gebitt fir Offline-Notzung lueden loossen, wann all Download héchstens 3.000 Kaachelen oder 50 MB ass, mat héchstens 4 parallele Ufroen, mat engem User-Agent, deen d'App identifizéiert. Attributioun ass néideg: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (de Bestanddeel OpenFreeMap ass fakultativ). De Service kann ouni Virwarnung ophalen. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright)-Daten | ODbL 1.0. Se beim Lafen ze huelen a lokal ze zeechnen ass privat Notzung; d'gezeechent Usiicht ass ee Produzéierte Wierk, dat eng sichtbar Crédit brauch, a genee sou Screenshotten a Videoen, déi doraus gemaach sinn. |
| [OpenMapTiles](https://openmaptiles.org)-Schema | CC BY 4.0 fir d'Schema; Crédit "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | An d'Ëffentlechkeet entlooss; ouni Schlëssel. D'Crédit "Runways: OurAirports (public domain)" gëtt als Courtoisie gewisen. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | D'Schicht vun 2016 ass CC BY 4.0 (spéider Joren sinn CC BY-NC-SA, déi net benotzt ginn). D'EOX-Servicesäit lued d'Endpunkte an Applikatiounen ze benotzen, als Demo-Service ouni Garantie a mat Ratelimit; si seet näischt iwwer Caching, wat CC BY erlaabt. Crédit, op der Leinwand gewisen: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", verlinkt. CORS: den Urspronk vum Ufro gëtt zréckgespillt. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-kodéiert, 512 px verlosslos WebP, ouni Schlëssel, oppent CORS. Quellen ënner CC BY, Ëffentlechkeet a ähnlech oppe Lizenzen (keng nëmmen-nicht-kommerziell oder share-alike); Crédit "© Mapterhorn" a fir d'weltwäit Schicht "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Keng publizéiert Notzungsregele fir de ëffentlechen Endpunkt. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map)-Orthobiller, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction"; si freet no engem Crédit, z. B. "(Produkt- oder Datennumm) courtesy of the U.S. Geological Survey". De Service nennt seng Quell "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, och e Bundes-Wierk an der Ëffentlechkeet); dat ass d'Crédit, dat gewisen gëtt. Ouni Schlëssel, oppent CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | D'Konditioune vun der Géoplateforme féieren den WMTS als "Non soumis à limite d'usage" (keng Notzungsgrenz; WMS ass op 40-50 Ufroen d'Sekonn begrenzt); d'Daten sinn "soumises à la licence choisie et renseignée par le Fournisseur de données", standardméisseg d'Etalab Licence Ouverte, ënner där BD ORTHO zënter 2021 oppen ass; d'Benotzer musse "ne pas nuire, entraver ou fausser le bon fonctionnement des API". Caching gëtt net adresséiert; d'Licence Ouverte erlaabt d'Wiederverwendung mat der Quell als Crédit: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Ouni Schlëssel, oppent CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Oppen Daten aus ville Quellen, all mat sengem eegene Crédit ([Lëscht](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); ouni Schlëssel, ouni Service-Garantie, mat oppenen CORS geliwwert. D'Héichte ginn als `R × 256 + G + B / 256 − 32768` Meter dekodéiert. |

## Wéi de Hannergrond an dësen Konditioune bleift {#how-the-backdrop-stays-inside-those-terms}

- E Hannergrond ënner enger Opnam lued héchstens 36 Héichtekaachelen an 300 Vektorkaachelen; en Theater, dat eemol gebaut gëtt, héchstens 64 + 100 Héichtekaachelen an 64 + 1.500 Vektorkaachelen; en gestreamt Theater, eng Kaachel vun all Quell op eemol pro Kaartkaachel, wéi d'Kamera geet. Véier Ufroe gläichzäiteg pro Quell.
- **En Theater, dat eemol gebaut gëtt, ass ee Download**, a lued héchstens 1.000 Vektorkaachelen oder 40 MB (d'Konditioune vun OpenFreeMap erlaaben 3.000 Kaachelen oder 50 MB). D'Kaachelen ginn zoerst am Zentrum ugefrot; no dem Kontingent hëlt de Bau nëmmen Kaachelen, déi schonn am Cache sinn, a seet, wéivill nach kommen. Nach eng Kéier bauen hëlt déi nächst Partie, a sou weider: e grousst Gebitt kënnt a Stécker, all ee gecacht.
- Gemooss op synthetesche Flich: e Theater mat engem detailléierte Gebitt vun 25 km brauch beim éischte Mol ongeféier 370 Kaachelen an 20 MB. Nach eng Kéier gebaut oder zréckverfollegt, gëtt näischt geluecht.
- Kaachele ginn nëmmen erofgeluecht, wann **Richteg Welt als Hannergrond** gedréckt gëtt, ni am Hannergrond.
- E Browser erlaabt enger Säit net, säin eegene User-Agent ze setzen; d'Ufroe droen deen vum Browser, an d'Urspronk vun der Säit als `Origin`/`Referer`. E Desktop-Build vum Viewer soll säin eegene schécken.
- **Näischt, wat aus OpenStreetMap ofgeleet ass, gëtt jeemools mam Viewer ausgeliwwert** oder an dat Repository ageliwwert: d'Share-alike-Klausel vun ODbL gëllt fir eng verdeelt ofgeleet Datebank. D'Hannergrënn ginn op dem Computer vum Benotzer gebaut a nëmmen an deem Browser gehalen (de Kaachelcache an, wann gespäichert, d'Level-Bibliothéik).
