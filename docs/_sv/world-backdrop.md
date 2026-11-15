---
title: "Världsbakgrund"
parent: "Banor och bakgrundsgeometri"
nav_order: 5
has_children: true
lang: "sv"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Världsbakgrund

En världsbakgrund lägger den verkliga marken under en flygninspelning: kullar, vägar, floder, flygfält och byggnader, hämtade från fri öppen kartdata. Använd den när en Tacview-inspelning annars skulle sväva över ett tomt rutnät. Den är en [nivå](glossary.md), så värmen och figurerna ligger på den.

## Bygg en {#build-one}

1. Läs in en flygninspelning som anger var på jorden den är (en Tacview-fil `.acmi`), eller läs in ingenting och välj en krigsskådeplats i steg 3. Se [Få in data](getting-data-in.md).
2. Öppna **Bakgrund / nivå** i sidopanelen.
3. Tryck på **Verklig värld som bakgrund** för att bygga marken under dina data. Eller välj en spelkarta i **Krigsskådeplats** och tryck på **Bygg krigsskådeplatsens bakgrund** (eller **Strömma krigsskådeplatsen**).
4. Vänta. Panelen visar framstegen (*Höjdrutor*, *Kartrutor*, *Bygger bakgrunden*); **Avbryt** stoppar det.
5. Flyg runt. Källangivelsen för kartdatan skrivs nere till höger i vyn.

Den första byggningen laddar ner några tiotal megabyte. Webbläsaren behåller dem, så en andra byggning av samma område laddar inte ner något. **Glöm kartrutor** tar bort dem. Knappen **Verklig värld som bakgrund** visas bara när de inlästa data har en geografisk referens (nedan).

Allt byggs i en bakgrundsarbetare ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Resultatet ersätter den aktuella nivån och beter sig som varje [3D-nivå](model-levels.md): det döljer värmen bakom sig, skärs av snittet, har [utseendereglagen](level-appearance.md) och kan sparas i [biblioteket](level-library.md).

## Var datan finns: den geografiska referensen {#where-the-data-is-the-geographic-reference}

En datamängd får en geografisk referens bara från en källa som anger en:

- **En ACMI-inspelning**: dess huvuds `ReferenceLatitude` och `ReferenceLongitude`, och positioner som läsaren projicerar på planet som tangerar WGS84-ellipsoiden där (X österut, Y norrut, meter; höjderna är inspelningens höjd över havet). Referensen behålls när avbildningen tar **X** och **Y** som markaxlar - det gör inspelningens egna ledtrådar - och släpps när marken kommer från någon annan kolumn, till exempel ett spels egna platta **U** och **V**.
- **En Parquet-tabell vars `heat3d`-ledtrådar har en `geo`-post** - [Watcher](https://github.com/Holdi601/3DHeat-Watcher):s tabeller för DCS, MSFS, X-Plane och IL-2 (Tacview). Posten beskrivs under [För utvecklare](#for-developers).

När flera filer läses in behålls referensen bara när alla delar samma. Alla andra inläsare påverkas inte och har ingen.

Bakgrunden projiceras på samma sätt och går sedan genom inläsningens axelavbildning, så den hamnar under datan oavsett vilka spegling eller skala avbildningen gör.

## Krigsskådeplatser {#theatres}

Väljaren **Krigsskådeplats** listar verkliga kartor för DCS World (Kaukasus, Nevada, Normandie 2, Kanalen, Syrien, Persiska viken, Marianerna, Marianerna WWII, Sydatlanten, Sinai, Afghanistan, Kola, Tyskland kalla kriget, Irak) och IL-2 Great Battles (Stalingrad, Moskva, Kuban, Rheinland, Normandie, Prokhorovka, Velikie Luki, Arras, Odessa, Finska viken / Leningrad, Korea), var och en med sin ruta på jorden ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS-rutorna är redigerarnas utsträckning beräknad från de publicerade projektionerna; IL-2-rutorna, och de DCS-rutor som är märkta så, är uppskattningar utifrån kartornas publicerade storlekar och städerna vid deras kanter - panelen säger vilka.

**Bygg krigsskådeplatsens bakgrund** bygger två detaljnivåer i ett nät:

| Nivå | Område | Terräng | Karta |
|---|---|---|---|
| Krigsskådeplats | hela rutan | den djupaste zoomen upp till 10 som behöver högst 64 höjdrutor (cirka 3 km per hörn över Kaukasus, 1 km över Normandie) | havet, sjöar, marktäcke och motorvägar från högst 64 vektorrutor vid zoom 4 till 9 |
| Detaljerat område | **Under data**, **Runt en punkt** (latitud, longitud, 12 till 400 km), eller inget | upp till zoom 12 i högst 100 rutor, högst 500 000 hörn | allt nedan, från högst 1 500 vektorrutor vid den djupaste zoomen upp till 14 som ryms |

Det detaljerade området skär ett hål i krigsskådeplatsens rutnät, bredare till hela celler så att båda näten delar sina kantlinjer, och en tunn vägg sluter skarven där de samplar höjderna olika.

Med data inlästa byggs krigsskådeplatsen på datans plan, så den hamnar under den som den byggs. Utan data byggs den runt krigsskådeplatsens egen referenspunkt (hela grader nära dess detaljerade område). Data som läses in senare på en annan referens - en ACMI-fil anger sin egen - flyttar bakgrunden under dem: den exakta förflyttningen mellan de två projektionerna räknas på ett 256 × 256-rutnät över bakgrunden och läses mellan noderna, inom en meter eller två över en hel krigsskådeplats ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). En bakgrund som sparas i biblioteket behåller sin plats och flyttas på samma sätt när den läses in under andra data.

### Strömma en krigsskådeplats {#streaming-a-theatre}

**Strömma krigsskådeplatsen** visar krigsskådeplatsen så som en flygsimulators kartvisare gör: marken kommer som många små rutor runt kameran, lästa när den flyger och släppta när de är utom räckhåll ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Ett quadtree av Web Mercator-rutor.** Rötter vid zoom 5 täcker 1 500 km runt kameran, så marken når förbi krigsskådeplatsens ruta till horisonten. En ruta delas i sina fyra barn medan kameran är närmare än 1,4 gånger dess bredd, ner till zoom 15 (cirka 1 km per ruta, 15 m mellan terrängens hörn): detaljen avtar med avståndet som den avtar på skärmen.
- **Varje ruta ett eget nät**, byggt i en arbetare ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): ett 65 × 65 terrängnät med en kant runt sin rand (så att grannar med olika detalj aldrig visar en spricka), marktäcke och havet målat på det, vägar, järnvägar, sjöar, floder, flygfält, uppmätta rullbanor och byggnader ovanpå, och valfritt satellitbilden av sin kvadrat. Renderaren ritar rutorna med nivåns utseende och djupregler, så de döljer värmen bakom sig som vilken nivå som helst.
- **Grovt först.** Rutor begärs grova och nära först, fyra nedladdningar åt gången per källa; medan en rutas barn laddas står rutan in för dem, så vyn fylls direkt och skärps.
- **Minne**: byggda rutor behålls upp till 600 MB, de som ritats senast längst bort släpps först. **Nedladdningar** ligger kvar i rutcachen, begränsad till en budget på 2 GB, äldst ut först: att flyga tillbaka över ett område kostar ingenting, och det finns inget tak per byggning.
- **Sparas i biblioteket** som det som strömmas - krigsskådeplatsen, dess alternativ och dess plats på jorden - inte som rutor: inläsning strömmar igen, från rutcachen där rutorna fortfarande finns. Klick och inspektören träffar rutorna som de träffar vilken nivå som helst.
- Båda renderarna ritar rutorna: kontrollerat sida vid sida på en riktig GPU (WebGPU och WebGL2 på samma kort), även värme som döljs bakom en ås.
- Med data inlästa byggs rutorna på datans plan; data som läses in senare på ett annat plan bygger om dem där (från cachen).
- Uppmätt på syntetiska flygningar över tre platser (Normandie, Nevada, Syrien): cirka 63, 45 och 24 MB vid första besöket med bilder; ett andra besök laddar inte ner något.

## Vad som byggs {#what-is-built}

| Del | Källa | Hur |
|---|---|---|
| Bilder (strömmade krigsskådeplatser, valfritt) | EOX Sentinel-2 cloudless 2016 | **Satellitbilder** lägger den molnfria mosaiken från 2016 (cirka 10 m per bildpunkt, zoom 14, djupare rutor förstorar den) över marken i stället för det målade marktäcket; vägar, rullbanor, byggnader och namn ligger kvar ovanpå. |
| Finare bilder (USA, Frankrike) | USGS National Map-ortofoton; IGN BD ORTHO | Med **Satellitbilder** på tar en kartruta från zoom 13 som helt ligger inom de sammanhängande USA eller storstadsregionen Frankrike i stället det nationella ortofotot, två zoomnivåer djupare än rutan (sexton av dess rutor lagda till en bild, cirka 1-2 m per bildpunkt på nära håll). EOX överallt annars. |
| Terräng (strömmade krigsskådeplatser) | Mapterhorn | Copernicus GLO-30 överallt (cirka 19 m per bildpunkt vid zoom 12), måttskala där ett lands egen mätning finns med (Frankrike, USA och andra); läses två zoomnivåer grövre än varje ruta. AWS Terrain Tiles om Mapterhorn inte går att nå. |
| Terräng | AWS Terrain Tiles (Terrarium-PNG) | Ett höjdnät över rutan: zoomen är den djupaste upp till 12 (cirka 28 m per bildpunkt vid 43° N) som behöver högst 36 rutor, och nätet gallras till högst 400 000 hörn. Ritas som mark med vanliga reliefmarkeringar. |
| Vägar, järnvägar | OpenFreeMap-vektorrutor, lagret `transportation` | Platta band lagda över terrängen, tätare än terrängens avstånd och lyfta några procent av det så att de inte slåss med den. Bredder efter klass, från 16 m (motorväg) till 3 m (spår, järnväg); aldrig smalare än rutans diagonal / 5000. Stigar, färjor och tunnlar utelämnas. |
| Flygfält | lagret `aeroway` | Rullbanor, taxibanor, uppställningsplatser och helikopterplattor som polygoner lagda som mark; rullbane- och taxibanelinjer som 45 m och 18 m band. |
| Vatten | lagret `water` | Havet platt på 0 m, sjöar och dammar platta vid sin lägsta strand, floder lagda över. Ritas som vatten: platt skuggning, inga höjdlinjer. |
| Marktäcke | lagren `landcover` och `landuse` | Målat på terrängens egna hörn, inga extra trianglar: skog, gräs och parker gröna, åkermark halmgul, våtmark, sand, berg, is; bostads-, industri-, handels-, militär- och stenbrottsområden i dämpade toner. Vatten målas under vattenytan också, så stranden syns från varje höjd. Bar mark får en lugn höjdnyans (låglandet grågrönt, höglandet brunt, snö över 3 000 m). Läsbart i terrängens upplösning: cirka 30-45 m i det detaljerade området, kilometer i krigsskådeplatsen. |
| Ortnamn | lagren `place` och `aerodrome_label` | Städer, orter och byar, och flygfält med deras ICAO-kod, skrivna över vyn; hur långt varje slag visas växer med kamerans höjd, högst 70 på en gång. |
| Uppmätta rullbanor | [OurAirports](https://ourairports.com/data/) `runways.csv` (allmän egendom) | Valfritt (**Rullbanor från OurAirports**, på som standard): varje öppen rullbana med båda ändarna i listan, från tröskel till tröskel i dess angivna bredd, med sidostreck, streckad mittlinje och tröskelstreck. En 4 MB-lista, laddad ner en gång och behållen i cachen. |
| Byggnader | lagret `building` | Fotavtryck extruderade från `render_min_height` till `render_height` (6 m när det saknas) över den lägsta marken under dem; delar med `hide_3d` hoppas över. Ritas som konstruktioner. |

Vektorrutor läses vid zoom 14 (den enda zoomen med byggnader) när rutan behöver högst 300 av dem, annars vid den djupaste zoomen som gör det, ner till 8. Ett större område får bara terräng.

### Utseende {#look}

En bakgrund startar med **Visa inspelad färg** på - färgen är det som skiljer en ljus väg från den grå marken den ligger på, en mörk rullbana från dess uppställningsplats - med markens triangelkanter av, eftersom ett regelbundet nät inte säger något, svaga höjdlinjer, ett ogenomskinligt hav (ett golv under det skulle slåss med ytan om djupet långt bort), och byggnader ljusgråa och nästan fasta, som en karta ritar dem. Det öppna havet får inga markytrianglar alls. Allt annat är en modellnivås standardutseende.

## Upphovsrätt på duken {#credits-on-the-canvas}

Medan en bakgrund är nivån skrivs dess källors upphovsrätt nere till höger i vyn, utan att något klick behövs, så att skärmbilder och renderade videor bär den:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Höjd: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; och andra

Varje del länkar till sin källas källangivelsessida (openstreetmap.org/copyright och Terrain Tiles [förteckning över källangivelser](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). En bakgrund som sparas i biblioteket behåller sina upphovsrättsangivelser och visar dem igen när den läses in. Texten översätts med visaren; namnen inte.

## Källor och deras villkor {#sources-and-their-terms}

Varje källa, dess licens och hur bakgrunden håller sig inom villkoren: [Världsbakgrund: källor och villkor](world-backdrop-sources.md).

## Rutcachen {#the-tile-cache}

Varje ruta, och vektorrutornas TileJSON, behålls i webbläsarens Cache API under `3dheat-world-tiles-v1`, efter URL. En andra byggning av samma område gör inga förfrågningar alls och fungerar offline: TileJSON efterfrågas först och, när det misslyckas, anger dess cachade kopia de rutor som redan finns. Rutor som servern inte har (öppet hav, 404) minns också som frånvarande.

Vektorrutornas URL:er bär kartans byggdatum, så efter att OpenFreeMap publicerat en ny version hämtar nästa bakgrund nya rutor och de gamla ligger kvar tills de rensas. Cachen hålls till 2 GB: när den överskrids tas de rutor som lagrats längst sedan bort först. **Glöm kartrutor** tar bort hela cachen. Cachen kräver en säker källa (`https://` eller `localhost`); annars laddas allt ner igen varje gång.

## Jämfört med Tacview {#compared-with-tacview}

Kontrollerat med ögat på en plats per krigsskådeplats, med syntetiska inspelningar: startrullningarna ligger på de ritade rullbanornas mittlinjer, kustpassager faller på kusten. Tacviews sida är hämtad från dess dokumentation och dess publicerade skärmbilder (tacview.net, dess Steam-sida), inte från att köra det här.

| | Tacview 1.9 | Den här bakgrunden, strömmad |
|---|---|---|
| Utsträckning | hela jordklotet | 1 500 km runt kameran, var den än är |
| Terräng | ETOPO1 (cirka 1,25 km) inbyggd; SRTM 25-75 m om användaren installerar filerna; DCS-terräng exporterad från DCS | Copernicus GLO-30 (Mapterhorn), måttskala i Frankrike och USA |
| Bilder | inga inbyggda; texturer som användaren laddar ner (Mapview, SAS Planet, tillägg som en Kaukasus VFR-karta) | EOX Sentinel-2 cloudless 2016, cirka 10 m, strömmad |
| Marktäcke | inget, om det inte finns i en textur | från OpenStreetMap, målat på terrängen (utan bilder) |
| Vägar, järnvägar | inget, om det inte finns i en textur | varje klass nära kameran, större vägar långt bort |
| Byggnader | inga | extruderade fotavtryck nära kameran |
| Flygfält | etiketter och rullbanor som platta lådor, utan markeringar | rullbanor från uppmätta ändar med sidostreck, mittlinje och tröskelstreck; taxibanor, uppställningsplatser; namn med ICAO-koder |
| Ortnamn | några byar- och stadsetiketter | städer, orter, byar, flygfält, efter avstånd och höjd |

Där den ändå brister:

- **Bildupplösning**: utanför USA och Frankrike är 10 m-satellitmosaiken mjuk under cirka 2 km; Tacview med en användarinstallerad zoom-17-textur är skarpare där.
- **Terräng i DCS egen form**: Tacview kan visa den terräng som DCS självt exporterar; här är det den verkliga jorden, som skiljer sig från DCS terräng där kartans modellerare ändrat den.
- **Krökning**: marken är ett platt plan, så horisonten är inte en krökt jords; Tacview ritar en sfär.
- **Hastighet**: första besöket på en plats laddar ner tiotals megabyte innan den är skarp; i en webbläsare med programvarurendering (skärmbilderna) ritas den med några bildrutor per sekund med flera hundra rutor.

## Gränser och vad som kommer senare {#limits-and-what-comes-later}

- **Terrängupplösning**: cirka 30 m i bästa fall, och grövre på stora områden. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF på AWS, ingen nyckel, en fast källangivelsetext) är den bättre källan: 30 m överallt, GLO-90 där GLO-30 har luckor (Armenien och Azerbajdzjan, som DCS Kaukasus täcker). Den behöver en GeoTIFF-läsare och används inte än.
- **Bättre terräng**: Copernicus GLO-30 på AWS skickar inga CORS-huvuden, så en webbläsare kan inte läsa den; OpenTopographys spegel kan läsas (CORS och intervall), men deras villkor för en publik apps körtid är okända - ska frågas innan någon användning. Mapterhorn har redan GLO-30.
- **Krökning**: marken är ett platt plan och höjderna sänks inte för jordens krökning, i enlighet med hur inspelningarna placeras (altitud som höjd); långt från referensen driver båda ihop, med under en tusendel vid 100 km. Att böja bara rutorna skulle skilja dem från datan långt bort, så det erbjuds inte. En krökt horisont behöver samma sänkning - avståndet från kameran i kvadrat delat med två gånger jordens radie - tillämpad i varje pass som ritar en position (nivå, rutor, värme, linjer, lådor, etiketter, plockning) som en gemensam uniform; ett sant jordklot behöver jordcentrerade positioner för datan också och kamerarelativ rendering. Båda är planerade med globläget.
- **Bara dagens värld**: DCS:s och IL-2:s historiska kartor (Normandie 2, Kanalen, Tyskland kalla kriget, varje IL-2-karta) ritas med dagens städer, vägar och kustarbeten; panelen säger det. Historiska flygfält ritas inte.
- **Inget globläge**: en bakgrund är ett platt lokalt plan. En vy över hela jorden är planerad.
- Vägar breddas på stora områden så att de förblir synliga; på nära håll är de bredare än verkligheten.
- DCS-krigsskådeplatsnamn i Watcher-tabellerna matchas som DCS anger dem i `mission.theatre`; ett namn som inte finns i listan faller tillbaka till första fixen avrundad till hela grader, och till latitud och longitud ensam.

## Historiska kartor (inte byggda än) {#historical-maps-not-built-yet}

Historiska kartor kan texturera de historiska krigsskådeplatserna senare. Den amerikanska Army Map Service-serien (AMS) är verk från den amerikanska federala regeringen, i allmänhet behandlade som allmän egendom (kontrollera varje skanning och dess uppgifter; många är nytryck av brittiska GSGS- eller tyska original, vars Crown copyright eller anonymt verksskydd också har gått ut):

| Krigsskådeplats | Serie | Var skannad |
|---|---|---|
| IL-2 Stalingrad, Moskva, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Östeuropa 1:250 000 (sammanställd på 1950-talet från sovjetiska och tyska kartor) | UT Austin PCL; vissa blad georefererade vid UT GeoData |
| IL-2 Normandie, DCS Normandie 2 och Kanalen | AMS **M661** / GSGS 4250, Frankrike 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250 000 och **M841** 1:25 000 (Tyskland) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (utgåvor från 1951) och **L552** 1:250 000 | ANU Open Research (L751-blad, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | brittiska första världskrigets skyttegravskartor (inte AMS) | McMaster University; National Library of Scotland (icke-kommersiella villkor) |

AMS-blad har latitud- och longitudmarkeringar vid sina hörn, så varje skulle placeras med en anpassning via fyra hörn och läggas på terrängen som en textur, byggd och sparad lokalt på samma sätt som rutorna.


## För utvecklare {#for-developers}

### `geo`-posten i en Parquet-tabell {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` och `up` anger de kolumner som håller öst- och nordmeter på samma tangentplan vid (`lat0`, `lon0`) och höjden. Inläsningen bär referensen när dess avbildning tar exakt de kolumnerna (öst som X, norr och höjd som Y och Z åt vilket håll som helst). Den valfria posten `dcs` anger en DCS-tabells egna meter (x norr, y upp, z öst) och dess krigsskådeplats: en inläsning som avbildar de kolumnerna placeras i stället genom krigsskådeplatsens tvärgående Mercator-projektion ([DCS-koordinater](#dcs-coordinates)). En tabell utan `geo` läses som förut.

### DCS-koordinater {#dcs-coordinates}

Varje DCS-krigsskådeplats är en tvärgående Mercator-projektion (WGS84, skala 0,9996) med sin egen mittmeridian och sitt falska origo; DCS x är nordkoordinaten och z ostkoordinaten. Konstanterna är de som pydcs-projektet publicerar; matematiken är Krügers serie till sjätte ordningen (Karney 2011), portad till [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). En bakgrund för DCS-meter byggs direkt i dem, så att en Watcher-DCS-tabell avbildad med `dcs_x`/`dcs_y`/`dcs_z`, en nivå som DCS-terrängkonverteraren skrev och bakgrunden delar alla samma ram. Irak-konstanterna är inte publicerade; de är anpassade till publicerade referenspunkter (4 cm kvadratiskt medelfel).

Watcher:s DCS-tabeller ligger på ett tangentplan vid krigsskådeplatsens fasta referenspunkt (samma punkt som krigsskådeplatsväljaren använder, nedan), så flera uppdrag på en krigsskådeplats slås ihop med sin referens intakt och ligger i linje med en krigsskådeplatsbakgrund utan att flytta den.

### Förenkling och budget {#simplification-and-budget}

- Byggnader under 20 m² tas bort; 60 m² när rutan är över 30 km tvärs över, 150 m² bortom 80 km. Resten läggs till störst först tills byggnaderna når 1,5 miljoner trianglar.
- Mindre vägar, servicevägar och stigar tas bort bortom 60 km tvärs över; bortom 150 km finns bara motorvägar, huvudvägar, primära och sekundära vägar kvar.
- Hela bakgrunden håller sig under cirka 3 miljoner trianglar. Importnoteringen säger hur många byggnader som lämnades ut.
