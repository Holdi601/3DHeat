---
title: "Världsbakgrund: källor och termer"
parent: "Världsbakgrund"
grand_parent: "Banor och bakgrundsgeometri"
nav_order: 1
lang: "sv"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Världsbakgrund: källor och termer

Kartdatan i en [världsbakgrund](world-backdrop.md) kommer från öppna tjänster. Den här sidan listar varje källa, dess licens och hur 3DHeat håller sig inom villkoren.

| Källa | Villkor (så som de lästes den 7 november 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org): vektorrutor i OpenMapTiles-schemat från OpenStreetMap, nuvarande version angiven av `https://tiles.openfreemap.org/planet` | Gratis, ingen nyckel, kommersiell användning tillåten. [Villkoren](https://openfreemap.org/tos/) förbjuder insamling av data "på automatiserade sätt, utom för offlinenedladdningar". En app får låta användare ladda ner ett område för offlineanvändning om varje nedladdning är högst 3 000 rutor eller 50 MB, görs med högst 4 parallella begäranden och med ett User-Agent som identifierar appen. En källangivelse krävs: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (delen OpenFreeMap är valfri). Tjänsten kan upphöra utan förvarning. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright)-data | ODbL 1.0. Att hämta den vid körning och rita den lokalt är privat användning. Den ritade vyn är ett Produced Work som kräver en synlig källangivelse, och det gäller även skärmbilder och videor som görs av den. |
| [OpenMapTiles](https://openmaptiles.org)-schemat | CC BY 4.0 för schemat. Källangivelse "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Släppt till allmän egendom. Ingen nyckel. Källangivelsen "Runways: OurAirports (public domain)" visas som en artighet. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Lagret från 2016 är CC BY 4.0. Senare år är CC BY-NC-SA och används inte. EOX:s tjänstesida uppmanar till att använda slutpunkterna i appar, som en demotjänst utan garanti och med hastighetsbegränsning. Den säger ingenting om cachning, vilket CC BY tillåter. Källangivelse, visad på canvasen: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", med länk. CORS: begärans ursprung ekas tillbaka. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-kodad förlustfri WebP på 512 px. Ingen nyckel, öppen CORS. Källorna är under CC BY, allmän egendom och liknande öppna licenser (ingen icke-kommersiell eller share-alike). Källangivelsen "© Mapterhorn" och, för det globala lagret, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Det finns ingen publicerad användningspolicy för den publika slutpunkten. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map)-ortofoto, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction" (den mesta informationen från USGS är allmän egendom och får användas utan begränsning). USGS ber om en källangivelse, till exempel "(Product or data name) courtesy of the U.S. Geological Survey". Tjänsten anger sin källa som "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, också ett federalt verk i allmän egendom). Det är den källangivelse som visas. Ingen nyckel, öppen CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateformens villkor anger WMTS som "Non soumis à limite d'usage" (ingen användningsgräns. WMS är begränsad till 40–50 begäranden per sekund). Data är "soumises à la licence choisie et renseignée par le Fournisseur de données" (underkastade den licens som datatillhandahållaren väljer och anger). Som standard är det Etalab Licence Ouverte, enligt vilken BD ORTHO har varit öppen sedan 2021. Användare ska "ne pas nuire, entraver ou fausser le bon fonctionnement des API" (inte skada, hindra eller förvrida API:ernas funktion). Cachning tas inte upp. Licence Ouverte tillåter återanvändning om källan anges: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Ingen nyckel, öppen CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Öppna data från många källor, var och en med sin egen källangivelse ([lista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). Ingen nyckel och ingen tjänstegaranti. Levereras med öppen CORS. Höjder avkodas som `R × 256 + G + B / 256 − 32768` meter. |

## Så håller sig bakgrunden inom villkoren {#how-the-backdrop-stays-inside-those-terms}

- En bakgrund under en inspelning laddar ner högst 36 höjdrutor och 300 vektorrutor. En teater som byggs en gång högst 64 + 100 höjdrutor och 64 + 1 500 vektorrutor. En strömmad teater en ruta från varje källa i taget per kartruta, allteftersom kameran rör sig. Fyra begäranden åt gången per källa.
- **En teater som byggs en gång är en nedladdning**, och den laddar ner högst 1 000 vektorrutor eller 40 MB. (OpenFreeMaps villkor tillåter 3 000 rutor eller 50 MB.) Rutorna efterfrågas med mitten först. När gränsen är nådd tar bygget bara rutor som redan finns i cachen och säger hur många som återstår. Att bygga igen hämtar nästa del, och så vidare. Ett stort område kommer i bitar, och varje bit cachas.
- Uppmätt på syntetiska flygningar: en teater med ett detaljerat område på 25 km tar ungefär 370 rutor och 20 MB första gången. Byggs den igen, eller flygs tillbaka över den, laddas inget ner.
- Rutor laddas bara ner när **Världsbakgrund** trycks in, aldrig i bakgrunden.
- En webbläsare låter inte en sida ange sin egen User-Agent. Begäranden bär webbläsarens, och sidans ursprung som `Origin`/`Referer`. En skrivbordsversion av visaren ska skicka sin egen.
- **Inget som härletts från OpenStreetMap levereras någonsin** med visaren eller checkas in i dess förråd. ODbL:s share-alike gäller en distribuerad härledd databas. Bakgrunder byggs på användarens dator och sparas bara i den webbläsaren (rutcachen och, om den sparas, banbiblioteket).
