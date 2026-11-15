---
title: "Ozadje sveta - viri in pogoji"
parent: "Ozadje sveta"
grand_parent: "Ravni in geometrija ozadja"
nav_order: 1
lang: "sl"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Ozadje sveta: viri in pogoji

Podatki o zemljevidu [ozadja sveta](world-backdrop.md) prihajajo iz odprtih storitev. Ta stran navaja vsak vir, njegovo licenco in to, kako 3DHeat ostaja znotraj pogojev.

| Vir | Pogoji (kot so prebrani 7. novembra 2026) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) – vektorske ploščice sheme OpenMapTiles iz OpenStreetMap, trenutna izdaja, imenovana `https://tiles.openfreemap.org/planet` | Brezplačno, brez ključa, komercialna uporaba dovoljena. [Pogoji](https://openfreemap.org/tos/) prepovedujejo zbiranje podatkov »na avtomatiziran način, razen za prenose brez povezave«: aplikacija lahko uporabnikom dovoli prenos območja za uporabo brez povezave, če je vsak prenos največ 3.000 ploščic ali 50 MB, narejen z največ 4 vzporednimi zahtevami, z User-Agent, ki identificira aplikacijo. Navedba avtorstva je obvezna: »OpenFreeMap © OpenMapTiles Data from OpenStreetMap« (del OpenFreeMap je neobvezen). Storitev se lahko konča brez opozorila. |
| Podatki [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL 1.0. Njihovo pridobivanje ob izvajanju in risanje lokalno je zasebna uporaba; prikazani pogled je Produced Work, ki potrebuje vidno navedbo, enako kot posnetki zaslona in videi iz njega. |
| Shema [OpenMapTiles](https://openmaptiles.org) | CC BY 4.0 za shemo; navedba »© OpenMapTiles«. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Izdano v javno last; brez ključa. Navedba »Runways: OurAirports (public domain)« je prikazana kot prijaznost. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Sloj iz leta 2016 je CC BY 4.0 (kasnejših let, CC BY-NC-SA, ne uporabljamo). Stran storitve EOX vabi k uporabi končnih točk v aplikacijah kot demo storitve brez jamstva in z omejitvijo hitrosti; o predpomnjenju ne govori nič, kar CC BY dovoljuje. Navedba, prikazana na platnu: »EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)«, povezana. CORS: izvor zahteve se vrne nazaj. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Brezizgubni WebP 512 px, kodiran Terrarium, brez ključa, odprt CORS. Viri so pod CC BY, v javni lasti in podobnih odprtih licencah (nobena ni nekomercialna ali deljena pod enakimi pogoji); navedba »© Mapterhorn« in za globalni sloj »produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA«. Za javno končno točko ni objavljene politike uporabe. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofoto, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: »Večina informacij U.S. Geological Survey (USGS) je v javni lasti in se lahko uporablja brez omejitev«; prosi za navedbo, npr. »(ime izdelka ali podatkov) courtesy of the U.S. Geological Survey«. Storitev svoj vir imenuje »USDA, USGS The National Map: Orthoimagery« (USDA NAIP, tudi delo javne lasti zvezne vlade); ta navedba je prikazana. Brez ključa, odprt CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | Pogoji Géoplateforme navajajo WMTS kot »Non soumis à limite d'usage« (brez omejitve uporabe; WMS je omejen na 40–50 zahtevkov na sekundo); podatki so »soumises à la licence choisie et renseignée par le Fournisseur de données«, privzeto Etalab Licence Ouverte, pod katero je BD ORTHO odprt od leta 2021; uporabniki ne smejo »nuire, entraver ou fausser le bon fonctionnement des API«. Predpomnjenje ni obravnavano; Licence Ouverte dovoljuje ponovno uporabo z navedbo vira: »Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0«. Brez ključa, odprt CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Odprti podatki iz mnogih virov, vsak s svojo navedbo ([seznam](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); brez ključa, brez jamstva storitve, strežen z odprtim CORS. Višine se dekodirajo kot `R × 256 + G + B / 256 − 32768` metrov. |

## Kako ozadje ostaja znotraj teh pogojev {#how-the-backdrop-stays-inside-those-terms}

- Ozadje pod posnetkom prenese največ 36 ploščic višin in 300 vektorskih ploščic; enkrat zgrajeno bojišče največ 64 + 100 ploščic višin in 64 + 1.500 vektorskih ploščic; pretočno bojišče po eno ploščico vsakega vira naenkrat na zemljevidno ploščico, ko se kamera premika. Štiri zahteve naenkrat na vir.
- **Enkrat zgrajeno bojišče je en prenos**, in prenese največ 1.000 vektorskih ploščic ali 40 MB (pogoji OpenFreeMap dovoljujejo 3.000 ploščic ali 50 MB). Ploščice se najprej zahtevajo od sredine; čez dovoljeno količino gradnja vzame samo ploščice, ki so že v predpomnilniku, in pove, koliko jih še manjka. Ponovna gradnja prenese naslednji kos itd.: veliko območje prispe po delih, vsak predpomnjen.
- Izmerjeno na sintetičnih letih: bojišče s podrobnim območjem 25 km se prvič prenese približno 370 ploščic in 20 MB. Če je ponovno zgrajeno ali če se vanj vrnemo, se ne prenese nič.
- Ploščice se prenesejo samo, ko je pritisnjen **Resnični svet kot ozadje**, nikoli v ozadju.
- Brskalnik strani ne dovoli nastaviti lastnega User-Agent; zahteve nosijo brskalnikov, izvor strani pa kot `Origin`/`Referer`. Namizna izdaja pregledovalnika bi morala poslati svojega.
- **Nič, kar je izpeljano iz OpenStreetMap, se ne pošlje** skupaj s pregledovalnikom ali zapiše v njegov repozitorij: deljenje pod enakimi pogoji po ODbL velja za distribuirano izpeljano bazo. Ozadja se zgradijo na uporabnikovem računalniku in se hranijo samo v tem brskalniku (predpomnilnik ploščic in, če je shranjeno, knjižnica ravni).
