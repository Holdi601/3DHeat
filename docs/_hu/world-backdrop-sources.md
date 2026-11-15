---
title: "Világ-háttér – források és fogalmak"
parent: "Világ-háttér"
grand_parent: "Pályák és háttérgeometria"
nav_order: 1
lang: "hu"
source: "world-backdrop-sources.md"
source_hash: "c84aaa683dc8"
translated: true
outdated: false
---

# Világ-háttér: források és feltételek

A [világ-háttér](world-backdrop.md) térképadatai nyílt szolgáltatásokból származnak. Ez az oldal felsorolja minden forrást, annak licencét, és azt, hogyan marad a 3DHeat a feltételeken belül.

| Forrás | Feltételek (2026. november 7-én olvasva) |
|---|---|
| [OpenFreeMap](https://openfreemap.org) – OpenMapTiles-sémájú vektorcsempék az OpenStreetMap-ből, az aktuális build neve: `https://tiles.openfreemap.org/planet` | Ingyenes, kulcs nélkül, kereskedelmi használat engedélyezett. A [feltételek](https://openfreemap.org/tos/) tiltják az adatok „automatizált módon” gyűjtését, az „offline letöltések” kivételével: egy alkalmazás engedheti a felhasználóknak, hogy egy területet offline használatra letöltsenek, ha minden letöltés legfeljebb 3000 csempe vagy 50 MB, legfeljebb 4 párhuzamos kéréssel, és az alkalmazást azonosító User-Agenttel. A forrásmegjelölés kötelező: „OpenFreeMap © OpenMapTiles Data from OpenStreetMap” (az OpenFreeMap-rész elhagyható). A szolgáltatás figyelmeztetés nélkül megszűnhet. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) adatai | ODbL 1.0. Futás közbeni lekérése és helyi kirajzolása magánhasználat; a kirajzolt nézet egy Származtatott mű, amely látható forrásmegjelölést igényel, ugyanígy a belőle készült képernyőképek és videók is. |
| [OpenMapTiles](https://openmaptiles.org) séma | CC BY 4.0 a sémára; megjelölés: „© OpenMapTiles”. |
| [OurAirports](https://ourairports.com/data/) `runways.csv` | Közkincsként kiadva; kulcs nem kell. A „Runways: OurAirports (public domain)” megjelölés udvariasságból látszik. |
| [EOX Sentinel-2 cloudless](https://cloudless.eox.at) 2016, `tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | A 2016-os réteg CC BY 4.0 (a későbbi évek CC BY-NC-SA, nem használjuk). Az EOX szolgáltatási oldala alkalmazásokban való használatra hívja fel a végpontokat, demószolgáltatásként, garancia nélkül és sebességkorlátozással; a gyorsítótárazásról nem szól, amit a CC BY megenged. Megjelölés, a vásznon látszik: „EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)”, linkelve. CORS: a kérés eredete visszatükröződik. |
| [Mapterhorn](https://mapterhorn.com), `tiles.mapterhorn.com/{z}/{x}/{y}.webp` | Terrarium-kódolású, 512 px-es veszteségmentes WebP, kulcs nélkül, nyílt CORS. A források CC BY, közkincs és hasonló nyílt licencek (egyik sem kereskedelmi vagy megosztásra kötelező); megjelölés: „© Mapterhorn”, a globális rétegnél pedig „produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA”. A nyilvános végponthoz nincs közzétett használati szabály. |
| [USGS The National Map](https://www.usgs.gov/programs/national-geospatial-program/national-map) ortofotók, `basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}` | USGS: „Az USGS (U.S. Geological Survey) információinak nagy része közkincs, és korlátozás nélkül használható”; kéri a megjelölést, például „(terméknév vagy adatnév) courtesy of the U.S. Geological Survey”. A szolgáltatás a forrását „USDA, USGS The National Map: Orthoimagery”-nek nevezi (USDA NAIP, szintén szövetségi közkincs mű); ez a megjelölés látszik. Kulcs nem kell, nyílt CORS. |
| [IGN Géoplateforme](https://cartes.gouv.fr/cgu) BD ORTHO, `data.geopf.fr/wmts?…LAYER=ORTHOIMAGERY.ORTHOPHOTOS…TILEMATRIXSET=PM…` | A Géoplateforme feltételei a WMTS-t „Non soumis à limite d'usage” (nincs használati korlát; a WMS másodpercenként 40–50 kéréssel korlátozott) néven sorolják fel; az adatok „soumises à la licence choisie et renseignée par le Fournisseur de données” – alapértelmezésben az Etalab Licence Ouverte, amely alatt a BD ORTHO 2021 óta nyílt; a felhasználóknak „ne pas nuire, entraver ou fausser le bon fonctionnement des API”. A gyorsítótárazásról nem szól; a Licence Ouverte a forrás megjelölése mellett újrafelhasználást enged: „Orthophotos: © IGN – BD ORTHO, Licence Ouverte 2.0”. Kulcs nem kell, nyílt CORS. |
| [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (Mapzen / Tilezen), `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Nyílt adatok sok forrásból, mindegyik a saját megjelölésével ([lista](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)); kulcs nem kell, a szolgáltatásra nincs garancia, nyílt CORS-szal szolgálják. A magasságok így dekódolódnak: `R × 256 + G + B / 256 − 32768` méter. |

## Hogyan marad a háttér ezeken a feltételeken belül {#how-the-backdrop-stays-inside-those-terms}

- Egy felvétel alatti háttér legfeljebb 36 magassági csempét és 300 vektorcsempét tölt le; egyszer felépített színház legfeljebb 64 + 100 magassági csempét és 64 + 1500 vektorcsempét; egy streamelt színház forrásonként egyszerre egy csempét tölt le térképcsempénként, ahogy a kamera halad. Forrásonként egyszerre négy kérés.
- **Egy egyszer felépített színház egyetlen letöltés**, és legfeljebb 1000 vektorcsempét vagy 40 MB-ot tölt le (az OpenFreeMap feltételei 3000 csempét vagy 50 MB-ot engednek). A csempéket középről kérjük először; a keret túllépése után a felépítés csak a gyorsítótárban lévő csempéket veszi, és megmondja, hány van még hátra. Újraépítéskor a következő darab jön, és így tovább: a nagy terület darabokban érkezik, mindegyik gyorsítótárazva.
- Szintetikus repüléseken mérve: egy 25 km-es részletes területű színház először kb. 370 csempét és 20 MB-ot vesz igénybe. Újraépítéskor, vagy ha visszafelé követjük, nem töltődik le semmi.
- A csempék csak akkor töltődnek le, ha a **Valós világ háttérként** gombot megnyomják, soha nem a háttérben.
- A böngésző nem engedi az oldalnak saját User-Agentet beállítani; a kérések a böngészőét viszik, az oldal eredetét pedig `Origin`/`Referer` fejlécben. A megjelenítő asztali változatának sajátját kell küldenie.
- **Az OpenStreetMap-ből származó adatot soha nem szállítunk** a megjelenítővel, és nem commitoljuk a tárolójába: az ODbL megosztásra kötelező záradéka a terjesztett származtatott adatbázisra vonatkozik. A hátterek a felhasználó gépén készülnek, és csak abban a böngészőben maradnak meg (a csempe-gyorsítótárban, és ha elmentik, a pályakönyvtárban).
