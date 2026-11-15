---
title: "Pozadí světa - zdroje a pojmy"
parent: "Pozadí světa"
grand_parent: "Levely a geometrie pozadí"
nav_order: 1
lang: "cs"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Pozadí světa: zdroje a pojmy

Data map [pozadí světa](world-backdrop.md) pocházejí z otevřených služeb. Tato stránka uvádí každý zdroj, jeho licenci a to, jak 3DHeat zůstává v jeho podmínkách.

| Zdroj | Podmínky (jak byly čteny 7. listopadu 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) – vektorové dlaždice schématu OpenMapTiles z OpenStreetMap, aktuální sestavení označené `https://tiles.openfreemap.org/planet` | Zdarma, bez klíče, komerční použití povoleno. [Podmínky](https://openfreemap.org/tos/) zakazují sběr dat „automatizovanými způsoby, s výjimkou offline stahování“: aplikace smí uživatelům dovolit stáhnout oblast pro použití offline, pokud každé stažení má nejvýše 3 000 dlaždic nebo 50 MB, a dělá se nejvýše 4 paralelními požadavky, s User-Agent, který aplikaci určuje. Uvedení zdroje je povinné: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap“ (část OpenFreeMap je nepovinná). Služba může skončit bez upozornění. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) data | ODbL 1.0. Stahování za běhu a kreslení lokálně je soukromé použití; kreslený pohled je Produced Work, který potřebuje viditelné uvedení zdroje, stejně jako snímky a videa z něj vytvořené. |
| Schéma [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 pro schéma; uvedení „© OpenMapTiles“. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Uvolněno do veřejné domény; bez klíče. Uvedení „Runways: OurAirports (public domain)“ se zobrazuje jako zdvořilost. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Vrstva 2016 je CC BY 4.0 (pozdější roky jsou CC BY-NC-SA, nepoužívají se). Stránka služby EOX zve k používání koncových bodů v aplikacích, jako demo služby bez záruky a s omezením rychlosti; o ukládání do mezipaměti nic neříká, což CC BY dovoluje. Uvedení, zobrazené na plátně: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)“, odkazované. CORS: původ požadavku se vrací zpět. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Bezztrátové WebP 512 px kódované Terrarium, bez klíče, otevřené CORS. Zdroje pod CC BY, veřejnou doménou a podobnými otevřenými licencemi (žádná nekomerční ani s povinností sdílet dál); uvedení „© Mapterhorn“ a u globální vrstvy „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA“. Pro veřejný koncový bod není zveřejněna žádná zásada používání. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofotomapa, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Většina informací U.S. Geological Survey (USGS) je ve veřejné doméně a smí se používat bez omezení“; žádá uvedení zdroje, například „(název produktu nebo dat) courtesy of the U.S. Geological Survey“. Služba uvádí svůj zdroj jako „USDA, USGS The National Map: Orthoimagery“ (USDA NAIP, také federální dílo ve veřejné doméně); to je zobrazované uvedení. Bez klíče, otevřené CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Podmínky Géoplateforme uvádějí WMTS jako „Non soumis à limite d'usage“ (bez limitu použití; WMS je omezeno na 40–50 požadavků za sekundu); data jsou „soumises à la licence choisie et renseignée par le Fournisseur de données“, ve výchozím stavu Etalab Licence Ouverte, podle které je BD ORTHO otevřená od roku 2021; uživatelé nesmějí „ne pas nuire, entraver ou fausser le bon fonctionnement des API“. Ukládání do mezipaměti se neřeší; Licence Ouverte dovoluje opětovné použití se uvedeným zdrojem: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0“. Bez klíče, otevřené CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Otevřená data z mnoha zdrojů, každý se svým uvedením ([seznam](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); bez klíče, bez záruky služby, podává se s otevřeným CORS. Výšky se dekódují jako `R × 256 + G + B / 256 − 32768` metrů. |

## Jak pozadí zůstává v těchto podmínkách {#how-the-backdrop-stays-inside-those-terms}

- Pozadí pod nahrávkou stáhne nejvýše 36 výškových dlaždic a 300 vektorových dlaždic; divadlo postavené jednou nejvýše 64 + 100 výškových dlaždic a 64 + 1 500 vektorových dlaždic; streamované divadlo jednu dlaždici každého zdroje najednou na každou dlaždici mapy, jak se kamera pohybuje. Čtyři požadavky najednou na každý zdroj.
- **Divadlo postavené jednou je jedno stažení**, a stahuje nejvýše 1 000 vektorových dlaždic nebo 40 MB (podmínky OpenFreeMap dovolují 3 000 dlaždic nebo 50 MB). Dlaždice se žádají nejdřív ve středu; po překročení limitu stavba vezme jen dlaždice, které už jsou v mezipaměti, a řekne, kolik ještě zbývá. Opětovné sestavení stáhne další část a tak dál: velká oblast přijde po kouscích, každý ukládaný do mezipaměti.
- Měřeno na syntetických letech: divadlo s podrobnou oblastí 25 km zabere poprvé zhruba 370 dlaždic a 20 MB. Při opětovném sestavení nebo při přeletu zpět se nic nestahuje.
- Dlaždice se stahují jen po stisknutí **Skutečný svět jako pozadí**, nikdy na pozadí.
- Prohlížeč nedovolí stránce nastavit vlastní User-Agent; požadavky nesou ten prohlížeče a původ stránky jako `Origin`/`Referer`. Desktopová verze prohlížeče by měla posílat vlastní.
- **Nic odvozeného z OpenStreetMap se nikdy nedodává** s prohlížečem ani se neukládá do jeho repozitáře: sdílení ODbL platí pro distribuovanou odvozenou databázi. Pozadí se staví na počítači uživatele a drží se jen v tom prohlížeči (mezipaměť dlaždic a, pokud se uloží, knihovna levelů).
