---
title: "Pasaules fons - avoti un termini"
parent: "Pasaules fons"
grand_parent: "Līmeņi un fona ģeometrija"
nav_order: 1
lang: "lv"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Pasaules fons - avoti un termini

Kartes dati [pasaules fonam](world-backdrop.md) nāk no atvērtiem pakalpojumiem. Šī lapa uzskaita katru avotu, tā licenci un to, kā 3DHeat paliek ietvaros, kas paredzēts noteikumos.

| Avots | Noteikumi (kā lasīti 2026. gada 7. novembrī) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) — OpenMapTiles shēmas vektoru flīzes no OpenStreetMap, pašreizējā būve nosaukta ar `https://tiles.openfreemap.org/planet` | Bez maksas, bez atslēgas, komerciāla lietošana atļauta. [Noteikumi](https://openfreemap.org/tos/) aizliedz datu vākšanu "automatizētos veidos, izņemot bezsaistes lejupielādes": lietotne drīkst ļaut lietotājiem lejupielādēt apgabalu lietošanai bezsaistē, ja katra lejupielāde ir ne vairāk kā 3000 flīzes vai 50 MB, veikta ar ne vairāk kā 4 paralēliem pieprasījumiem un ar User-Agent, kas identificē lietotni. Ir jānorāda autors: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (OpenFreeMap daļa neobligāta). Pakalpojums var beigties bez brīdinājuma. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) dati | ODbL 1.0. Datu iegūšana izpildes laikā un zīmēšana lokāli ir privāta lietošana; zīmētais skats ir atvasināts darbs (Produced Work), kam vajag redzamu norādi, tāpat kā ekrānuzņēmumiem un video, kas no tā veidoti. |
| [OpenMapTiles](https://openmaptiles.org) shēma | CC BY 4.0 shēmai; autors "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Publicēts publiskajā domēnā; bez atslēgas. Autors "Runways: OurAirports (public domain)" tiek rādīts kā pieklājība. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | 2016. slānis ir CC BY 4.0 (vēlākie gadi ir CC BY-NC-SA, netiek izmantoti). EOX pakalpojuma lapa aicina lietot galapunktus lietotnēs kā demonstrācijas pakalpojumu bez garantijas un ar ātruma ierobežojumu; tā nerunā par kešatmiņu, ko CC BY atļauj. Autors, kas rādīts uz audekla: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", ar saiti. CORS: pieprasījuma izcelsme tiek atspoguļota. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium kodēts 512 px bezzudumu WebP, bez atslēgas, atvērts CORS. Avoti ir CC BY, publiskais domēns un līdzīgas atvērtas licences (nav nekomerciālu vai dalīšanas-līdzīgu); autors "© Mapterhorn" un globālajam slānim "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Publiskajam galapunktam nav publicētas lietošanas politikas. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofoto, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction"; tas lūdz autoru, piemēram, "(Produkta vai datu nosaukums) courtesy of the U.S. Geological Survey". Pakalpojums savu avotu nosauc par "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, arī federāls publiskā domēna darbs); tas ir rādītais autors. Bez atslēgas, atvērts CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Géoplateforme noteikumi WMTS uzskaita kā "Non soumis à limite d'usage" (bez lietošanas ierobežojuma; WMS ir ierobežots līdz 40–50 pieprasījumiem sekundē); dati ir "soumises à la licence choisie et renseignée par le Fournisseur de données", pēc noklusējuma Etalab Licence Ouverte, saskaņā ar kuru BD ORTHO ir atvērts kopš 2021. gada; lietotājiem jāt "ne pas nuire, entraver ou fausser le bon fonctionnement des API". Kešatmiņa nav aplūkota; Licence Ouverte atļauj atkalizmantošanu ar norādītu avotu: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Bez atslēgas, atvērts CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Atvērti dati no daudziem avotiem, katram savs autors ([saraksts](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); bez atslēgas, bez pakalpojuma garantijas, sniegts ar atvērtu CORS. Augstumi tiek atkodēti kā `R × 256 + G + B / 256 − 32768` metri. |

## Kā fons paliek šajos noteikumos {#how-the-backdrop-stays-inside-those-terms}

- Fons zem ieraksta lejupielādē ne vairāk kā 36 augstuma flīzes un 300 vektoru flīzes; reiz uzbūvēts teātris ne vairāk kā 64 + 100 augstuma flīzes un 64 + 1500 vektoru flīzes; straumēts teātris — pa vienai flīzei no katra avota vienlaikus uz kartes flīzi, kamēr kamera virzās. Četri pieprasījumi vienlaikus katram avotam.
- **Reiz uzbūvēts teātris ir viena lejupielāde**, un lejupielādes ne vairāk kā 1000 vektoru flīžu vai 40 MB (OpenFreeMap noteikumi atļauj 3000 flīzes vai 50 MB). Flīzes tiek pieprasītas vispirms centrā; pārsniedzot pieļauto, būvēšana izmanto tikai jau kešatmiņā esošās flīzes un saka, cik vēl jāatnāk. Atkārtota būvēšana iegūst nākamo daļu, un tā tālāk: liels apgabals ierodas gabalos, katrs kešots.
- Mērīts sintētiskos lidojumos: teātris ar 25 km detalizētu apgabalu pirmoreiz prasa aptuveni 370 flīzes un 20 MB. Ja to atkal uzbūvē vai pāri lido atpakaļ, nekas netiek lejupielādēts.
- Flīzes tiek lejupielādētas tikai tad, kad nospiež **Reālā pasaule kā fons**, nekad fonā.
- Pārlūks neļauj lapai iestatīt savu User-Agent; pieprasījumi nes pārlūka, un lapas izcelsmi kā `Origin`/`Referer`. Skatītāja darbvirsmas versijai vajadzētu sūtīt savu.
- **Nekas, kas atvasināts no OpenStreetMap, nekad netiek piegādāts** kopā ar skatītāju vai iekļauts tā repozitorijā: ODbL dalīšanas-līdzīgais nosacījums attiecas uz izplatītu atvasinātu datubāzi. Foni tiek veidoti lietotāja datorā un glabāti tikai šajā pārlūkā (flīžu kešatmiņā un, ja saglabāts, līmeņu bibliotēkā).
