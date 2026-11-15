---
title: "Pozadina svijeta - izvori i pojmovi"
parent: "Pozadina svijeta"
grand_parent: "Nivoi i geometrija pozadine"
nav_order: 1
lang: "bs"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Pozadina svijeta: izvori i uslovi

Podaci karte [pozadine svijeta](world-backdrop.md) dolaze iz otvorenih servisa. Ova stranica navodi svaki izvor, njegovu licencu i kako 3DHeat ostaje unutar uslova.

| Izvor | Uslovi (kako su pročitani 7. novembra 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - vektorske pločice po OpenMapTiles šemi iz OpenStreetMapa, tekuća verzija imenovana s `https://tiles.openfreemap.org/planet` | Besplatno, bez ključa, komercijalna upotreba dozvoljena. [Uslovi](https://openfreemap.org/tos/) zabranjuju prikupljanje podataka „na automatizovan način, osim za preuzimanja van mreže": aplikacija može dozvoliti korisnicima da preuzmu područje za rad van mreže ako je svako preuzimanje najviše 3.000 pločica ili 50 MB, rađeno s najviše 4 paralelna zahtjeva, uz User-Agent koji identifikuje aplikaciju. Potrebno je navođenje izvora: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (dio OpenFreeMap je opcionalan). Servis može prestati bez najave. |
| Podaci [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Preuzimanje u vrijeme rada i lokalno crtanje je privatna upotreba; prikazani pogled je Proizvedeno djelo kojem treba vidljivo navođenje, kao i snimci ekrana i videi napravljeni od njega. |
| Šema [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 za šemu; navođenje „© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Objavljeno u javnom domenu; bez ključa. Navođenje „Runways: OurAirports (public domain)" se prikazuje kao pristojnost. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Sloj iz 2016. je CC BY 4.0 (kasnije godine su CC BY-NC-SA, nisu korištene). EOXova stranica servisa poziva na korištenje krajnjih tačaka u aplikacijama, kao demo servis bez garancije i uz ograničenje broja zahtjeva; ništa ne kaže o keširanju, što CC BY dozvoljava. Navođenje, prikazano na platnu: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", povezano. CORS: porijeklo zahtjeva se vraća. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium kodirani 512 px bezgubitni WebP, bez ključa, otvoreni CORS. Izvori pod CC BY, javnim domenom i sličnim otvorenim licencama (nijedan nekomercijalan ili s dijeljenjem pod istim uslovima); navođenje „© Mapterhorn" i, za globalni sloj, „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Nema objavljene politike korištenja za javnu krajnju tačku. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofoto snimci, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Većina informacija Američkog geološkog zavoda (USGS) je u javnom domenu i može se koristiti bez ograničenja"; traži navođenje, npr. „(naziv proizvoda ili podataka) ljubaznošću Američkog geološkog zavoda". Servis svoj izvor imenuje „USDA, USGS The National Map: Orthoimagery" (USDA NAIP, također savezno djelo javnog domena); to je navođenje koje se prikazuje. Bez ključa, otvoreni CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Uslovi Géoplateforme navode WMTS kao „Non soumis à limite d'usage" (bez ograničenja korištenja; WMS je ograničen na 40-50 zahtjeva u sekundi); podaci su „soumises à la licence choisie et renseignée par le Fournisseur de données", po zadanom Etalab Licence Ouverte, pod kojom je BD ORTHO otvoren od 2021; korisnici moraju „ne pas nuire, entraver ou fausser le bon fonctionnement des API". Keširanje nije uređeno; Licence Ouverte dozvoljava ponovnu upotrebu uz navođenje izvora: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Bez ključa, otvoreni CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Otvoreni podaci iz mnogo izvora, svaki sa svojim navođenjem ([spisak](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); bez ključa, bez garancije servisa, poslužen s otvorenim CORS-om. Visine se dekodiraju kao `R × 256 + G + B / 256 − 32768` metara. |

## Kako pozadina ostaje unutar tih uslova {#how-the-backdrop-stays-inside-those-terms}

- Pozadina pod snimkom preuzima najviše 36 pločica visina i 300 vektorskih pločica; pozorište izgrađeno jednom najviše 64 + 100 pločica visina i 64 + 1.500 vektorskih pločica; pozorište u toku jedna pločica svakog izvora istovremeno po pločici karte, kako se kamera kreće. Četiri zahtjeva istovremeno po izvoru.
- **Pozorište izgrađeno jednom je jedno preuzimanje**, a preuzimanja su najviše 1.000 vektorskih pločica ili 40 MB (uslovi OpenFreeMapa dozvoljavaju 3.000 pločica ili 50 MB). Pločice se traže prvo od centra; nakon dozvoljene količine, izgradnja uzima samo pločice koje su već u kešu i kaže koliko ih još nedostaje. Ponovna izgradnja preuzima sljedeći dio, i tako dalje: veliko područje stiže u komadima, svaki keširan.
- Mjereno na sintetičkim letovima: pozorište sa 25 km detaljnog područja uzme oko 370 pločica i 20 MB prvi put. Ponovo izgrađeno, ili kada se vrati nazad, ništa se ne preuzima.
- Pločice se preuzimaju samo kad se pritisne **Pozadina svijeta**, nikad u pozadini.
- Browser ne dozvoljava stranici da postavi svoj User-Agent; zahtjevi nose browserov, a porijeklo stranice kao `Origin`/`Referer`. Desktop verzija prikaza treba slati svoj.
- **Ništa izvedeno iz OpenStreetMapa se nikad ne isporučuje** s prikazom niti se pohranjuje u njegov repozitorijum: ODbL-ovo dijeljenje pod istim uslovima važi za distribuiranu izvedenu bazu. Pozadine se grade na korisnikovoj mašini i čuvaju se samo u tom browseru (keš pločica i, ako je sačuvano, biblioteka nivoa).
