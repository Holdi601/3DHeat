---
title: "Wereldachtergrond - bronnen en termen"
parent: "Wereldachtergrond"
grand_parent: "Niveaus en achtergrondgeometrie"
nav_order: 1
lang: "nl"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Wereldachtergrond: bronnen en voorwaarden

De kaartdata van een [wereldachtergrond](world-backdrop.md) komt van open diensten. Deze pagina somt elke bron op, de licentie ervan, en hoe 3DHeat binnen de voorwaarden blijft.

| Bron | Voorwaarden (zoals gelezen op 7 november 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - vectortegels in het OpenMapTiles-schema uit OpenStreetMap, huidige build aangeduid met `https://tiles.openfreemap.org/planet` | Gratis, geen sleutel, commercieel gebruik toegestaan. De [voorwaarden](https://openfreemap.org/tos/) verbieden het verzamelen van data "op geautomatiseerde wijze, behalve voor downloads voor offline gebruik": een app mag gebruikers een gebied laten downloaden voor offline gebruik als elke download hoogstens 3.000 tegels of 50 MB is, gemaakt met hoogstens 4 parallelle verzoeken, met een User-Agent die de app aanduidt. Naamsvermelding is verplicht: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (het deel OpenFreeMap is optioneel). De dienst kan zonder bericht stoppen. |
| Data van [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Die bij het uitvoeren ophalen en lokaal tekenen is privégebruik; het getekende beeld is een Produced Work dat een zichtbare vermelding nodig heeft, en dat geldt ook voor schermafbeeldingen en video's die ervan gemaakt worden. |
| Het schema van [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 voor het schema; vermelding "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Vrijgegeven in het publieke domein; geen sleutel. De vermelding "Runways: OurAirports (public domain)" wordt als blijk van waardering getoond. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | De laag van 2016 is CC BY 4.0 (latere jaren zijn CC BY-NC-SA, die niet gebruikt worden). De servicepagina van EOX nodigt uit om de eindpunten in applicaties te gebruiken, als demodienst zonder garantie en met snelheidsbeperking; ze zegt niets over caching, wat CC BY toestaat. Vermelding, op het canvas getoond: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", met link. CORS: de oorsprong van het verzoek wordt teruggestuurd. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Verliesvrije WebP van 512 px, gecodeerd in Terrarium, geen sleutel, open CORS. Bronnen onder CC BY, het publieke domein en vergelijkbare open licenties (geen niet-commerciële of share-alike licentie); vermelding "© Mapterhorn" en, voor de wereldlaag, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Geen gepubliceerd gebruiksbeleid voor het publieke eindpunt. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) luchtfoto's, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction" (het meeste informatie van de USGS valt onder het publieke domein en mag zonder beperking worden gebruikt); het vraagt om een vermelding, bijvoorbeeld "(Product or data name) courtesy of the U.S. Geological Survey". De dienst noemt zijn bron "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, ook een federaal werk in het publieke domein); dat is de vermelding die getoond wordt. Geen sleutel, open CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | De voorwaarden van de Géoplateforme noemen de WMTS "Non soumis à limite d'usage" (geen gebruikslimiet; WMS is beperkt tot 40-50 verzoeken per seconde); de data zijn "soumises à la licence choisie et renseignée par le Fournisseur de données" (onderworpen aan de licentie die de dataleverancier kiest en invult), standaard de Etalab Licence Ouverte, waaronder BD ORTHO sinds 2021 open is; gebruikers moeten "ne pas nuire, entraver ou fausser le bon fonctionnement des API" (de werking van de API's niet schaden, belemmeren of verstoren). Caching wordt niet behandeld; de Licence Ouverte staat hergebruik toe met vermelding van de bron: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Geen sleutel, open CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Open data uit vele bronnen, elk met een eigen vermelding ([lijst](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); geen sleutel, geen dienstgarantie, geleverd met open CORS. Hoogtes worden gedecodeerd als `R × 256 + G + B / 256 − 32768` meter. |

## Zo blijft de achtergrond binnen die voorwaarden {#how-the-backdrop-stays-inside-those-terms}

- Een achtergrond onder een opname downloadt hoogstens 36 hoogtetegels en 300 vectortegels; een eenmaal gebouwd theater hoogstens 64 + 100 hoogtetegels en 64 + 1.500 vectortegels; een gestreamd theater één tegel van elke bron tegelijk per kaarttegel, terwijl de camera beweegt. Vier verzoeken tegelijk per bron.
- **Een eenmaal gebouwd theater is één download**, en downloads zijn hoogstens 1.000 vectortegels of 40 MB (de voorwaarden van OpenFreeMap staan 3.000 tegels of 50 MB toe). Tegels worden eerst voor het midden opgevraagd; na het toegestane aantal gebruikt de bouw alleen tegels die al in de cache staan en zegt hij hoeveel er nog komen. Opnieuw bouwen haalt het volgende deel op, enzovoort: een groot gebied komt in stukken binnen, elk stuk in de cache.
- Gemeten op synthetische vluchten: een theater met een gedetailleerd gebied van 25 km neemt de eerste keer ongeveer 370 tegels en 20 MB. Opnieuw gebouwd, of teruggevlogen, wordt er niets gedownload.
- Tegels worden alleen gedownload wanneer **Wereldachtergrond** wordt ingedrukt, nooit op de achtergrond.
- Een browser staat een pagina niet toe om zijn eigen User-Agent in te stellen; de verzoeken dragen die van de browser, en de oorsprong van de pagina als `Origin`/`Referer`. Een desktopversie van de viewer moet zijn eigen versturen.
- **Niets dat van OpenStreetMap is afgeleid, wordt ooit meegeleverd** met de viewer of in zijn repository vastgelegd: de share-alike-regel van ODbL geldt voor een verspreide afgeleide database. Achtergronden worden op de computer van de gebruiker gebouwd en alleen in die browser bewaard (de tegelcache en, als je ze opslaat, de niveaubibliotheek).
