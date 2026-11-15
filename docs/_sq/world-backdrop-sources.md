---
title: "Sfondi botëror - burimet dhe kushtet"
parent: "Sfondi botëror"
grand_parent: "Nivelet dhe gjeometria e sfondit"
nav_order: 1
lang: "sq"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---


# Sfondi botëror: burimet dhe kushtet

Të dhënat e hartës të një [sfondi botëror](world-backdrop.md) vijnë nga shërbime të hapura. Kjo faqe liston çdo burim, licencën e tij, dhe si 3DHeat qëndron brenda kushteve.

| Burimi | Kushtet (siç u lexuan më 7 nëntor 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) - pllaka vektoriale të skemës OpenMapTiles nga OpenStreetMap, ndërtimi aktual i emëruar nga `https://tiles.openfreemap.org/planet` | Falas, pa çelës, përdorimi komercial lejohet. [Kushtet](https://openfreemap.org/tos/) ndalojnë mbledhjen e të dhënave "në mënyra të automatizuara, përveç shkarkimeve jashtë linje": një aplikacion mund t'i lejojë përdoruesit të shkarkojnë një zonë për përdorim jashtë linje nëse çdo shkarkim është deri në 3 000 pllaka ose 50 MB, i bërë me deri në 4 kërkesa paralele, me një User-Agent që e identifikon aplikacionin. Atribuimi kërkohet: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" (pjesa OpenFreeMap opsionale). Shërbimi mund të mbarojë pa njoftim. |
| të dhënat e [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Marrja e tyre gjatë ekzekutimit dhe vizatimi lokal është përdorim privat; pamja e vizatuar është një Produkt i Punuar që ka nevojë për një kredit të dukshëm, dhe po ashtu edhe pamjet dhe videot e bëra prej saj. |
| skema [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 për skemën; kredia "© OpenMapTiles". |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | I lëshuar në domenin publik; pa çelës. Kredia "Runways: OurAirports (public domain)" shfaqet si mirësjellje. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Shtresa e 2016 është CC BY 4.0 (vitet e mëvonshme janë CC BY-NC-SA, të pa përdorura). Faqja e shërbimit të EOX fton përdorimin e pikave të fundit në aplikacione, si një shërbim demo pa garanci dhe me kufizim të shpejtësisë; nuk thotë asgjë për ruajtjen në memorje, të cilën CC BY e lejon. Kredia, e shfaqur në kanavacë: "EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)", e lidhur. CORS: origjina e kërkesës riflet. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | WebP 512 px pa humbje, i koduar Terrarium, pa çelës, CORS i hapur. Burimet janë nën CC BY, domenin publik dhe licenca të ngjashme të hapura (asnjë jo-komercial ose me ndarje të njëjtës licencë); kredia "© Mapterhorn" dhe, për shtresën globale, "produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA". Nuk ka politikë të publikuar përdorimi për pikën publike. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofotografia, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: "Pjesa më e madhe e informacionit të Shërbimit Gjeologjik të SHBA-së (USGS) është në Domenin Publik dhe mund të përdoret pa kufizime"; kërkon kredi, p.sh. "(Emri i produktit ose i të dhënave) courtesy of the U.S. Geological Survey". Shërbimi e emëron burimin "USDA, USGS The National Map: Orthoimagery" (USDA NAIP, gjithashtu vepër federale në domenin publik); ajo është kredia që shfaqet. Pa çelës, CORS i hapur. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Kushtet e Géoplateforme e listojnë WMTS-në si "Non soumis à limite d'usage" (pa kufi përdorimi; WMS kufizohet në 40-50 kërkesa në sekondë); të dhënat janë "soumises à la licence choisie et renseignée par le Fournisseur de données", si parazgjedhje Etalab Licence Ouverte, sipas së cilës BD ORTHO është e hapur që nga 2021; përdoruesit duhet "ne pas nuire, entraver ou fausser le bon fonctionnement des API". Ruajtja në memorje nuk trajtohet; Licence Ouverte lejon ripërdorimin me burimin e kredituar: "Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0". Pa çelës, CORS i hapur. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Të dhëna të hapura nga shumë burime, secili me kredinë e vet ([lista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); pa çelës, pa garanci shërbimi, i shërbyer me CORS të hapur. Lartësitë dekodohen si `R × 256 + G + B / 256 − 32768` metra. |

## Si qëndron sfondi brenda atyre kushteve {#how-the-backdrop-stays-inside-those-terms}

- Një sfond nën një regjistrim shkarkon deri në 36 pllaka lartësie dhe 300 pllaka vektoriale; një teatër i ndërtuar një herë deri në 64 + 100 pllaka lartësie dhe 64 + 1 500 pllaka vektoriale; një teatër i transmetuar një pllakë nga çdo burim njëherësh për çdo pllakë harte, ndërsa kamera lëviz. Katër kërkesa njëherësh për burim.
- **Një teatër i ndërtuar një herë është një shkarkim i vetëm**, dhe shkarkon deri në 1 000 pllaka vektoriale ose 40 MB (kushtet e OpenFreeMap lejojnë 3 000 pllaka ose 50 MB). Pllakat kërkohen fillimisht nga qendra; pas kufirit, ndërtimi merr vetëm pllakat që janë tashmë në memorje dhe thotë sa ka akoma për të ardhur. Ndërtimi përsëri merr copën e radhës, e kështu me radhë: një zonë e madhe vjen në pjesë, secila e ruajtur në memorje.
- Të matura në fluturime sintetike: një teatër me një zonë të detajuar 25 km merr rreth 370 pllaka dhe 20 MB herën e parë. I ndërtuar përsëri, ose i ndjekur prapa, nuk shkarkohet asgjë.
- Pllakat shkarkohen vetëm kur shtypet **Sfondi botëror**, kurrë në sfond.
- Një shfletues nuk lejon një faqe të vendosë User-Agent-in e vet; kërkesat e mbartin atë të shfletuesit, dhe origjinën e faqes si `Origin`/`Referer`. Një version desktop i shikuesit duhet të dërgojë të vetin.
- **Asgjë e nxjerrë nga OpenStreetMap nuk shpërndahet kurrë** me shikuesin ose nuk regjistrohet në depon e tij: klauzola e ndarjes së së njëjtës licencë e ODbL zbatohet për një bazë të dhënash të nxjerrë të shpërndarë. Sfondet ndërtohen në kompjuterin e përdoruesit dhe mbahen vetëm në atë shfletues (memorja e pllakave dhe, nëse ruhet, biblioteka e niveleve).
