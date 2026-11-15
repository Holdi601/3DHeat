---
title: "Fundalul lumii - surse și termeni"
parent: "Fundalul lumii"
grand_parent: "Niveluri și geometria fundalului"
nav_order: 1
lang: "ro"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Fundalul lumii: surse și termeni

Datele hărții unui [fundal al lumii](world-backdrop.md) vin din servicii deschise. Această pagină listează fiecare sursă, licența ei și felul în care 3DHeat rămâne în limitele termenilor.

| Sursă | Termeni (așa cum au fost citiți la 7 noiembrie 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - dale vectoriale în schema OpenMapTiles din OpenStreetMap, build-ul curent numit de `https://tiles.openfreemap.org/planet` | Gratuit, fără cheie, utilizare comercială permisă. [Termenii](https://openfreemap.org/tos/) interzic colectarea de date „în mod automatizat, cu excepția descărcărilor offline”: o aplicație poate lăsa utilizatorii să descarce o zonă pentru utilizare offline dacă fiecare descărcare are cel mult 3.000 de dale sau 50 MB, făcută cu cel mult 4 cereri paralele, cu un User-Agent care identifică aplicația. Atribuirea este obligatorie: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap” (partea OpenFreeMap opțională). Serviciul poate înceta fără preaviz. |
| Date [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Preluarea lor la rulare și desenarea local este utilizare privată; vederea desenată este o Lucrare Produsă care are nevoie de o creditare vizibilă, la fel și capturile de ecran și videoclipurile făcute din ea. |
| Schema [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 pentru schemă; creditul „© OpenMapTiles”. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Lansat în domeniul public; fără cheie. Creditul „Runways: OurAirports (public domain)” este arătat ca o politețe. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Stratul din 2016 este CC BY 4.0 (anii ulteriori sunt CC BY-NC-SA, nefolosiți). Pagina serviciului EOX invită la folosirea endpoint-urilor în aplicații, ca un serviciu demonstrativ, fără garanție și cu limitare de rată; nu spune nimic despre cache, ce permite CC BY. Creditul, arătat pe canvas: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)”, cu legătură. CORS: originea cererii este reflectată. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP fără pierderi de 512 px, codat Terrarium, fără cheie, CORS deschis. Surse sub CC BY, domeniu public și licențe deschise asemănătoare (niciuna necomercială sau cu partajare la fel); creditul „© Mapterhorn” și, pentru stratul global, „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA”. Nicio politică de utilizare publicată pentru endpoint-ul public. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortoimagini, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction”; cere credit, de exemplu „(Product or data name) courtesy of the U.S. Geological Survey”. Serviciul își numește sursa „USDA, USGS The National Map: Orthoimagery” (USDA NAIP, tot o lucrare federală în domeniul public); acesta este creditul arătat. Fără cheie, CORS deschis. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Termenii Géoplateforme listează WMTS ca „Non soumis à limite d'usage” (fără limită de utilizare; WMS este limitat la 40-50 de cereri pe secundă); datele sunt „soumises à la licence choisie et renseignée par le Fournisseur de données”, implicit Licența Deschisă Etalab, sub care BD ORTHO este deschisă din 2021; utilizatorii trebuie „ne pas nuire, entraver ou fausser le bon fonctionnement des API”. Cache-ul nu este tratat; Licența Deschisă permite refolosirea cu sursa creditată: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0”. Fără cheie, CORS deschis. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Date deschise din multe surse, fiecare cu propriul credit ([lista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); fără cheie, fără garanție de serviciu, servit cu CORS deschis. Înălțimile se decodează ca `R × 256 + G + B / 256 − 32768` metri. |

## Cum rămâne fundalul în limitele acestor termeni {#how-the-backdrop-stays-inside-those-terms}

- Un fundal sub o înregistrare descarcă cel mult 36 de dale de altitudine și 300 de dale vectoriale; un teatru construit o dată cel mult 64 + 100 de dale de altitudine și 64 + 1.500 de dale vectoriale; un teatru transmis în flux, câte un dale din fiecare sursă pe dală de hartă, pe măsură ce se mișcă camera. Patru cereri în același timp pentru fiecare sursă.
- **Un teatru construit o dată este o singură descărcare**, și descarcă cel mult 1.000 de dale vectoriale sau 40 MB (termenii OpenFreeMap permit 3.000 de dale sau 50 MB). Dalele sunt cerute mai întâi cele din centru; după limită, construcția ia doar dalele deja din cache și spune câte mai sunt de venit. Construirea din nou aduce următorul fragment, și așa mai departe: o zonă mare sosește în bucăți, fiecare păstrată în cache.
- Măsurat pe zboruri sintetice: un teatru cu o zonă detaliată de 25 km ia aproximativ 370 de dale și 20 MB prima dată. Construit din nou, sau urmărit înapoi, nu se descarcă nimic.
- Dalele se descarcă doar când se apasă **Fundalul lumii**, niciodată în fundal.
- Un browser nu lasă o pagină să își seteze propriul User-Agent; cererile poartă pe cel al browserului, iar originea paginii ca `Origin`/`Referer`. O versiune desktop a vizualizatorului ar trebui să trimită pe al său.
- **Nimic derivat din OpenStreetMap nu este livrat** odată cu vizualizatorul și nici nu este trimis în depozitul lui: clauza de partajare la fel a ODbL se aplică unei baze de date derivate distribuite. Fundalurile sunt construite pe calculatorul utilizatorului și păstrate doar în acel browser (cache-ul de dale și, dacă sunt salvate, biblioteca de niveluri).
