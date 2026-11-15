---
title: "Pozadie sveta - zdroje a pojmy"
parent: "Pozadie sveta"
grand_parent: "Levely a geometria pozadia"
nav_order: 1
lang: "sk"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Pozadie sveta: zdroje a podmienky

Mapové dáta [skutočného sveta ako pozadia](world-backdrop.md) pochádzajú z otvorených služieb. Táto stránka uvádza každý zdroj, jeho licenciu a to, ako 3DHeat zostáva v rámci podmienok.

| Zdroj | Podmienky (ako boli čítané 7. novembra 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) – vektorové dlaždice v schéme OpenMapTiles z OpenStreetMap, aktuálny build označený `https://tiles.openfreemap.org/planet` | Zadarmo, bez kľúča, komerčné použitie povolené. [Podmienky](https://openfreemap.org/tos/) zakazujú zber dát „automatizovanými spôsobmi, okrem offline sťahovania“: aplikácia môže používateľom dovoliť stiahnuť oblasť na offline použitie, ak každé stiahnutie má najviac 3 000 dlaždíc alebo 50 MB, vykonáva sa najviac 4 paralelnými požiadavkami a má User-Agent, ktorý identifikuje aplikáciu. Uvedenie zdroja je povinné: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap“ (časť OpenFreeMap je voliteľná). Služba môže skončiť bez upozornenia. |
| Dáta [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Ich stiahnutie za behu a lokálne vykreslenie je súkromné použitie; vykreslený pohľad je Produced Work, ktorý potrebuje viditeľné uvedenie zdroja, rovnako ako snímky obrazovky a videá z neho. |
| Schéma [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 pre schému; uvedenie „© OpenMapTiles“. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Uvoľnené do verejnej domény; bez kľúča. Uvedenie „Runways: OurAirports (public domain)“ sa zobrazuje ako zdvorilosť. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Vrstva 2016 je CC BY 4.0 (neskoršie roky sú CC BY-NC-SA, nepoužité). Stránka služby EOX vyzýva na použitie koncových bodov v aplikáciách ako demo službu bez záruky a s obmedzením počtu požiadaviek; nehovorí nič o ukladaní do vyrovnávacej pamäte, čo CC BY povoľuje. Uvedenie, zobrazené na plátne: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)“, s odkazom. CORS: pôvod požiadavky sa vracia späť. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Bezstratový WebP 512 px kódovaný Terrarium, bez kľúča, otvorené CORS. Zdroje pod CC BY, verejnou doménou a podobnými otvorenými licenciami (žiadna nekomerčná ani zdieľaná-rovnako); uvedenie „© Mapterhorn“ a pre globálnu vrstvu „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA“. Pre verejný koncový bod nie je zverejnená žiadna pravidla používania. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofotomapy, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Väčšina informácií U.S. Geological Survey (USGS) patrí do verejnej domény a môže sa používať bez obmedzenia“; žiada uvedenie zdroja, napr. „(názov produktu alebo dát) courtesy of the U.S. Geological Survey“. Služba uvádza svoj zdroj ako „USDA, USGS The National Map: Orthoimagery“ (USDA NAIP, tiež federálne dielo vo verejnej doméne); to je zobrazené uvedenie. Bez kľúča, otvorené CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Podmienky Géoplateforme uvádzajú WMTS ako „Non soumis à limite d'usage“ (bez limitu použitia; WMS je obmedzené na 40-50 požiadaviek za sekundu); dáta sú „soumises à la licence choisie et renseignée par le Fournisseur de données“, štandardne Etalab Licence Ouverte, podľa ktorej je BD ORTHO otvorené od roku 2021; používatelia nesmú „ne pas nuire, entraver ou fausser le bon fonctionnement des API“ (poškodzovať, brzdiť ani skresľovať správne fungovanie API). Ukladanie do vyrovnávacej pamäte nie je riešené; Licence Ouverte povoľuje opätovné použitie s uvedením zdroja: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0“. Bez kľúča, otvorené CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Otvorené dáta z mnohých zdrojov, každý s vlastným uvedením ([zoznam](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); bez kľúča, bez záruky služby, podávané s otvoreným CORS. Výšky sa dekódujú ako `R × 256 + G + B / 256 − 32768` metrov. |

## Ako pozadie zostáva v rámci týchto podmienok {#how-the-backdrop-stays-inside-those-terms}

- Pozadie pod nahrávkou stiahne najviac 36 dlaždíc výšok a 300 vektorových dlaždíc; divadlo postavené raz najviac 64 + 100 dlaždíc výšok a 64 + 1 500 vektorových dlaždíc; streamované divadlo jednu dlaždicu z každého zdroja naraz na mapovú dlaždicu, ako sa kamera pohybuje. Štyri požiadavky naraz na zdroj.
- **Divadlo postavené raz je jedno stiahnutie**, a sťahuje najviac 1 000 vektorových dlaždíc alebo 40 MB (podmienky OpenFreeMap povoľujú 3 000 dlaždíc alebo 50 MB). Dlaždice sa pýtajú najprv zo stredu; po prekročení limitu build berie len dlaždice už v vyrovnávacej pamäti a hovorí, koľko ešte chýba. Ďalšie zostavenie stiahne ďalší kus a tak ďalej: veľká oblasť príde po častiach, každá uložená do vyrovnávacej pamäte.
- Merané na syntetických letoch: divadlo s podrobnou oblasťou 25 km zaberie prvýkrát asi 370 dlaždíc a 20 MB. Keď sa zostaví znova alebo sa po ňom letí späť, nič sa nestiahne.
- Dlaždice sa sťahujú, len keď sa stlačí **Skutočný svet ako pozadie**, nikdy na pozadí.
- Prehliadač nedovolí stránke nastaviť vlastný User-Agent; požiadavky nesú ten prehliadača a pôvod stránky ako `Origin`/`Referer`. Desktopový build prehliadača by mal posielať vlastný.
- **Nič odvodené z OpenStreetMap sa nikdy nedodáva** s prehliadačom ani sa necommituje do jeho repozitára: zdieľanie-rovnako z ODbL platí pre distribuovanú odvodenú databázu. Pozadia sa stavajú na počítači používateľa a uchovávajú sa len v tom prehliadači (vyrovnávacia pamäť dlaždíc a, ak sa uložia, knižnica levelov).
