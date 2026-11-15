---
title: "Pozadina svijeta - izvori i pojmovi"
parent: "Pozadina svijeta"
grand_parent: "Razine i geometrija pozadine"
nav_order: 1
lang: "hr"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Stvarni svijet kao pozadina: izvori i uvjeti

Podaci karte [stvarnog svijeta kao pozadine](world-backdrop.md) dolaze iz otvorenih usluga. Ova stranica navodi svaki izvor, njegovu licencu i kako se 3DHeat drži njihovih uvjeta.

| Izvor | Uvjeti (kako su pročitani 7. studenoga 2026.) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - vektorske pločice sheme OpenMapTiles iz OpenStreetMapa, aktualna verzija označena s `https://tiles.openfreemap.org/planet` | Besplatno, bez ključa, komercijalna upotreba dopuštena. [Uvjeti](https://openfreemap.org/tos/) zabranjuju prikupljanje podataka "na automatizirane načine, osim za preuzimanja za rad bez mreže": aplikacija smije korisnicima dopustiti preuzimanje područja za rad bez mreže ako je svako preuzimanje najviše 3000 pločica ili 50 MB, učinjeno s najviše 4 paralelna zahtjeva, uz User-Agent koji identificira aplikaciju. Potrebno je navesti autorstvo: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (dio OpenFreeMap je neobavezan). Usluga može prestati bez najave. |
| Podaci [OpenStreetMapa](https://www.openstreetmap.org/copyright) | ODbL 1.0. Dohvaćanje za vrijeme rada i lokalno crtanje je privatna upotreba; nacrtani prikaz je Produced Work koji treba vidljivo navesti autora, kao i snimke zaslona i videi napravljeni od njega. |
| Shema [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 za shemu; navod "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Objavljeno u javnoj domeni; bez ključa. Navod "Runways: OurAirports (public domain)" prikazuje se kao ljubaznost. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Sloj iz 2016. je CC BY 4.0 (kasnije godine su CC BY-NC-SA, ne koriste se). EOX-ova stranica usluge poziva na korištenje krajnjih točaka u aplikacijama, kao demo usluge bez jamstva i uz ograničenje brzine zahtjeva; ne govori ništa o predmemoriranju, što CC BY dopušta. Navod, prikazan na platnu: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", s poveznicom. CORS: izvor zahtjeva se vraća. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP bez gubitka od 512 px, kodiran Terrariumom, bez ključa, otvoreni CORS. Izvori su pod CC BY, javnom domenom i sličnim otvorenim licencama (nijedna nije nekomercijalna ni dijeljena po istim uvjetima); navod "© Mapterhorn" i, za globalni sloj, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Za javnu krajnju točku nema objavljenih pravila korištenja. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofoto snimke, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Većina informacija Geološkog zavoda SAD-a (USGS) pripada javnoj domeni i može se koristiti bez ograničenja"; traži navod, npr. "(naziv proizvoda ili podataka) courtesy of the U.S. Geological Survey". Usluga svoj izvor navodi kao "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, također savezno djelo u javnoj domeni); to je navod koji se prikazuje. Bez ključa, otvoreni CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Uvjeti Géoplateforme navode WMTS kao "Non soumis à limite d'usage" (bez ograničenja upotrebe; WMS je ograničen na 40–50 zahtjeva u sekundi); podaci su "soumises à la licence choisie et renseignée par le Fournisseur de données", prema zadanoj Etalab Licence Ouverte, prema kojoj je BD ORTHO otvoren od 2021.; korisnici moraju "ne pas nuire, entraver ou fausser le bon fonctionnement des API" (ne smiju štetiti, ometati niti narušavati ispravan rad API-ja). Predmemoriranje nije uređeno; Licence Ouverte dopušta ponovnu upotrebu uz navod izvora: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Bez ključa, otvoreni CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Otvoreni podaci iz mnogo izvora, svaki sa svojim navodom ([popis](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); bez ključa, bez jamstva usluge, poslužuje se s otvorenim CORS-om. Visine se dekodiraju kao `R × 256 + G + B / 256 − 32768` metara. |

## Kako pozadina ostaje unutar tih uvjeta {#how-the-backdrop-stays-inside-those-terms}

- Pozadina ispod snimke preuzima najviše 36 pločica visina i 300 vektorskih pločica; kazalište izgrađeno jednom najviše 64 + 100 pločica visina i 64 + 1500 vektorskih pločica; kazalište u streamingu jednu pločicu svakog izvora istodobno po pločici karte, kako se kamera kreće. Četiri zahtjeva istodobno po izvoru.
- **Kazalište izgrađeno jednom je jedno preuzimanje**, a preuzimanja su najviše 1000 vektorskih pločica ili 40 MB (uvjeti OpenFreeMapa dopuštaju 3000 pločica ili 50 MB). Pločice se traže prvo za središte; nakon dopuštene količine gradnja uzima samo pločice koje su već u predmemoriji i kaže koliko ih još nedostaje. Ponovna gradnja dohvaća sljedeći dio, i tako dalje: veliko područje stiže u komadima, a svaki je predmemoriran.
- Izmjereno na sintetičkim letovima: kazalište s detaljnim područjem od 25 km uzme oko 370 pločica i 20 MB prvi put. Kad se ponovno izgradi ili se po njemu vraćate, ništa se ne preuzima.
- Pločice se preuzimaju samo kad se pritisne **Stvarni svijet kao pozadina**, nikad u pozadini.
- Preglednik ne dopušta stranici da postavi vlastiti User-Agent; zahtjevi nose onaj preglednika, a izvor stranice kao `Origin`/`Referer`. Desktop verzija prikaza trebala bi slati svoj.
- **Ništa izvedeno iz OpenStreetMapa nikad se ne isporučuje** uz prikaz niti se obvezuje u njegov repozitorij: ODbL-ova obveza dijeljenja po istim uvjetima vrijedi za distribuiranu izvedenu bazu. Pozadine se grade na korisnikovu računalu i čuvaju se samo u tom pregledniku (predmemorija pločica i, ako se spremi, biblioteka razina).
