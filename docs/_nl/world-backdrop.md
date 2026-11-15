---
title: "Wereldachtergrond"
parent: "Niveaus en achtergrondgeometrie"
nav_order: 5
has_children: true
lang: "nl"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Wereldachtergrond

Een wereldachtergrond legt het echte terrein onder een vluchtopname: heuvels, wegen, rivieren, vliegvelden en gebouwen, gedownload uit vrije open kaartgegevens. Gebruik hem wanneer een Tacview-opname anders boven een leeg raster zou zweven. Het is een [level](glossary.md), dus de warmte en de figuren staan erop.

## Een bouwen {#build-one}

1. Laad een vluchtopname die zegt waar op de aarde hij is (een Tacview-bestand `.acmi`), of laad niets en kies in stap 3 een strijdtoneel. Zie [Gegevens binnenhalen](getting-data-in.md).
2. Open **Achtergrond / level** in het zijpaneel.
3. Druk op **Echte-wereldachtergrond** om het terrein onder je gegevens te bouwen. Of kies een spelkaart bij **Strijdtoneel** en druk op **Achtergrond van strijdtoneel bouwen** (of **Strijdtoneel streamen**).
4. Wacht. Het paneel toont de voortgang (*Hoogtetegels*, *Kaarttegels*, *Achtergrond opbouwen*); **Annuleren** stopt het.
5. Vlieg rond. De bronvermelding van de kaartgegevens staat rechtsonder in de weergave.

De eerste keer downloadt de bouw enkele tientallen megabytes. De browser bewaart ze, dus een tweede bouw van hetzelfde gebied downloadt niets. **Kaarttegels vergeten** verwijdert ze. De knop **Echte-wereldachtergrond** wordt alleen getoond als de geladen gegevens een geografische verwijzing hebben (hieronder).

Alles wordt gebouwd in een achtergrondworker ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Het resultaat vervangt het huidige level en gedraagt zich als elk [3D-level](model-levels.md): het verbergt de warmte erachter, wordt door de snede gesneden, heeft de [weergave-instellingen](level-appearance.md), en kan worden opgeslagen in de [bibliotheek](level-library.md).

## Waar de gegevens staan: de geografische verwijzing {#where-the-data-is-the-geographic-reference}

Een gegevensset krijgt alleen een geografische verwijzing van een bron die er één opgeeft:

- **Een ACMI-opname**: de `ReferenceLatitude` en `ReferenceLongitude` in de koptekst, en posities die de lezer projecteert op het vlak dat de WGS84-ellipsoïde daar raakt (X oost, Y noord, in meter; hoogtes zijn de hoogte van de opname boven zeeniveau). De verwijzing blijft bewaard als de afbeelding **X** en **Y** als grondassen neemt - de eigen aanwijzingen van de opname doen dat - en vervalt als de grond uit een andere kolom komt, zoals de vlakke wereld **U** en **V** van een spel.
- **Een Parquet-tabel waarvan de `heat3d`-aanwijzingen een `geo`-item hebben** - de DCS-, MSFS-, X-Plane- en IL-2 (Tacview)-tabellen van de [Watcher](https://github.com/Holdi601/3DHeat-Watcher). Het item wordt beschreven onder [Voor ontwikkelaars](#for-developers).

Een load van meerdere bestanden houdt de verwijzing alleen als ze allemaal dezelfde hebben. Elke andere lader werkt zoals voorheen en heeft er geen.

De achtergrond wordt op dezelfde manier geprojecteerd en daarna door de assenafbeelding van de load gehaald, dus hij komt onder de gegevens terecht, wat voor omkeringen of schaal de afbeelding ook toepast.

## Strijdtonelen {#theatres}

De keuzelijst **Strijdtoneel** toont de kaarten van echte locaties van DCS World (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) en IL-2 Great Battles (Stalingrad, Moskou, Kuban, Rheinland, Normandië, Prokhorovka, Velikie Luki, Arras, Odessa, Finse Golf / Leningrad, Korea), elk met zijn kader op de aarde ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). De DCS-kaders zijn de omvang van de editors, berekend uit de gepubliceerde projecties; de IL-2-kaders, en de DCS-kaders die dat zo aangeven, zijn schattingen uit de gepubliceerde formaten van de kaarten en de steden aan hun randen - het paneel zegt welke.

**Achtergrond van strijdtoneel bouwen** bouwt twee detailniveaus in één mesh:

| Niveau | Gebied | Terrein | Kaart |
|---|---|---|---|
| Strijdtoneel | het hele kader | de diepste zoom tot 10 die hoogstens 64 hoogtetegels nodig heeft (ongeveer 3 km per hoekpunt over de Caucasus, 1 km over Normandië) | de zee, meren, landbedekking en snelwegen uit hoogstens 64 vectortegels bij zoom 4 tot 9 |
| Gedetailleerd gebied | **Onder de data**, **Rond een punt** (breedtegraad, lengtegraad, 12 tot 400 km), of geen | tot zoom 12 in hoogstens 100 tegels, hoogstens 500.000 hoekpunten | alles hieronder, uit hoogstens 1.500 vectortegels op het diepste zoomniveau tot 14 dat past |

Het gedetailleerde gebied snijdt een gat in het raster van het strijdtoneel, verbreed tot hele cellen zodat beide rasters hun randlijnen delen, en een dunne wand sluit de naad waar ze de hoogtes verschillend bemonsteren.

Met gegevens geladen wordt het strijdtoneel gebouwd op het vlak van de gegevens, zodat het eronder komt zoals het gebouwd is. Zonder gegevens wordt het gebouwd rond het eigen referentiepunt van het strijdtoneel (hele graden naast het gedetailleerde gebied). Gegevens die daarna geladen worden op een andere verwijzing - een ACMI-bestand noemt zijn eigen - verschuiven de achtergrond eronder: de exacte verschuiving tussen de twee projecties wordt berekend op een raster van 256 × 256 over de achtergrond en tussen de knooppunten afgelezen, binnen een meter of twee over een heel strijdtoneel ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Een achtergrond die in de bibliotheek is opgeslagen, houdt zijn plek en verschuift op dezelfde manier als hij onder andere gegevens geladen wordt.

### Een strijdtoneel streamen {#streaming-a-theatre}

**Strijdtoneel streamen** toont het strijdtoneel zoals een kaartviewer voor vluchtsimulators doet: het terrein komt als vele kleine tegels rond de camera, geladen terwijl je vliegt en weggegooid als ze buiten bereik zijn ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Een quadtree van Web Mercator-tegels.** Wortels bij zoom 5 bestrijken 1.500 km rond de camera, zodat het terrein voorbij het kader van het strijdtoneel tot aan de horizon reikt. Een tegel wordt in zijn vier kinderen gesplitst zolang de camera dichterbij is dan 1,4 keer zijn breedte, tot zoom 15 (ongeveer 1 km per tegel, 15 m tussen terreinhoekpunten): het detail neemt af met de afstand, zoals het op het scherm afneemt.
- **Elke tegel een eigen mesh**, gebouwd in een worker ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): een terreinraster van 65 × 65 met een rand eromheen (zodat buren op verschillend detail nooit een barst laten zien), landbedekking en de zee erop geschilderd, wegen, spoorwegen, meren, rivieren, vliegvelden, gemeten landingsbanen en gebouwen erbovenop, en optioneel de satellietfoto van hun vierkant. De renderer tekent de tegels met de look en de diepteregels van het level, dus ze verbergen de warmte erachter zoals elk level.
- **Grof eerst.** Tegels worden eerst grof en dichtbij gevraagd, vier downloads tegelijk per bron; terwijl de kinderen van een tegel laden, staat de tegel voor hen, zodat het beeld meteen vult en daarna scherper wordt.
- **Geheugen**: gebouwde tegels worden tot 600 MB bewaard, de tegel die het langst niet getekend is, het eerst weggegooid. **Downloads** blijven in de tegelcache, beperkt tot een budget van 2 GB, de oudste eerst eruit: terugvliegen over een gebied kost niets, en er is geen limiet per bouw.
- **Opgeslagen in de bibliotheek** als wat het streamt - het strijdtoneel, zijn opties en zijn plek op de aarde - niet als tegels: laden streamt opnieuw, uit de tegelcache waar de tegels er nog zijn. Klikken en de inspecteur raken de tegels zoals ze elk level raken.
- Beide renderers tekenen de tegels: naast elkaar gecontroleerd op een echte GPU (WebGPU en WebGL2 op dezelfde kaart), ook warmte die achter een rug verborgen is.
- Met gegevens geladen worden de tegels op het vlak van de gegevens gebouwd; gegevens die later op een ander vlak geladen worden, bouwen ze daar opnieuw (uit de cache).
- Gemeten op gesimuleerde vluchten boven drie plekken (Normandië, Nevada, Syrië): ongeveer 63, 45 en 24 MB bij het eerste bezoek met beelden; een tweede bezoek downloadt niets.

## Wat gebouwd wordt {#what-is-built}

| Onderdeel | Bron | Hoe |
|---|---|---|
| Beelden (gestreamde strijdtonelen, optioneel) | EOX Sentinel-2 cloudless 2016 | **Satellietbeelden** legt de wolkenvrije mozaïek van 2016 (ongeveer 10 m per pixel, zoom 14; diepere tegels vergroten hem) over het terrein, in plaats van de geschilderde landbedekking; wegen, landingsbanen, gebouwen en namen blijven erbovenop. |
| Fijnere beelden (VS, Frankrijk) | USGS National Map orthoimagery; IGN BD ORTHO | Met **Satellietbeelden** aan, neemt een kaarttegel vanaf zoom 13 die volledig binnen de aaneengesloten Verenigde Staten of het Franse vasteland ligt, in plaats daarvan de nationale orthofoto, twee zooms dieper dan de tegel (zestien van zijn tegels samen in één beeld, ongeveer 1-2 m per pixel van dichtbij). Elders EOX. |
| Terrein (gestreamde strijdtonelen) | Mapterhorn | Copernicus GLO-30 overal (ongeveer 19 m per pixel bij zoom 12), op meterschaal waar het eigen landmeetwerk van een land erin zit (Frankrijk, de VS en andere); gelezen twee zooms grover dan elke tegel. De AWS Terrain Tiles als Mapterhorn niet bereikbaar is. |
| Terrein | AWS Terrain Tiles (Terrarium-PNG) | Een hoogteraster over het kader: de zoom is de diepste tot 12 (ongeveer 28 m per pixel op 43° N) die hoogstens 36 tegels nodig heeft, en het raster wordt uitgedund tot hoogstens 400.000 hoekpunten. Getekend als grond met de gebruikelijke reliëfaanwijzingen. |
| Wegen, spoorwegen | OpenFreeMap-vectortegels, laag `transportation` | Platte linten op het terrein gelegd, verdicht tot de afstand van het terrein en een paar procent ervan opgetild, zodat ze niet met het terrein vechten. Breedtes per klasse, van 16 m (snelweg) tot 3 m (pad, spoor); nooit smaller dan de diagonaal van het kader / 5000. Paden, veerboten en tunnels worden weggelaten. |
| Vliegvelden | laag `aeroway` | Landingsbaan-, rolbaan-, platform- en helikopterplaatsvlakken, als grond op het terrein gelegd; lijnen van landingsbaan en rolbaan als linten van 45 m en 18 m. |
| Water | laag `water` | De zee vlak op 0 m, meren en vijvers vlak op hun laagste oever, rivieren op het terrein gelegd. Getekend als water: vlakke schaduw, geen contourlijnen. |
| Landbedekking | lagen `landcover` en `landuse` | Op de eigen hoekpunten van het terrein geschilderd, zonder extra driehoeken: bossen, gras en parken groen, landbouwgrond stroogeel, moeras, zand, rots, ijs; woon-, industrie-, handels-, militaire en steengroeves in gedempte tinten. Water wordt ook onder het wateroppervlak geschilderd, zodat de oever vanaf elke hoogte leesbaar is. Kale grond krijgt een rustige hoogtetint (laagland grijsgroen, hoogland bruin, sneeuw boven 3.000 m). Leesbaar op de resolutie van het terrein: ongeveer 30-45 m in het gedetailleerde gebied, kilometers in het strijdtoneel. |
| Plaatsnamen | lagen `place` en `aerodrome_label` | Steden, stadjes en dorpen, en vliegvelden met hun ICAO-code, over de weergave geschreven; hoe ver elke soort getoond wordt, groeit met de hoogte van de camera, hoogstens 70 tegelijk. |
| Gemeten landingsbanen | [OurAirports](https://ourairports.com/data/) `runways.csv` (publiek domein) | Optioneel (**Landingsbanen van OurAirports**, standaard aan): elke open landingsbaan waarvan beide uiteinden in de lijst staan, van drempel tot drempel op de vermelde breedte, met zijstroken, een gestreepte middellijn en drempelbalken. Eén lijst van 4 MB, één keer gedownload en in de cache bewaard. |
| Gebouwen | laag `building` | Voetafdrukken uitgetrokken van `render_min_height` tot `render_height` (6 m als die ontbreekt) boven de laagste grond eronder; delen met `hide_3d` worden overgeslagen. Getekend als constructies. |

Vectortegels worden gelezen op zoom 14 (de enige zoom met gebouwen) als het kader er hoogstens 300 nodig heeft, anders op de diepste zoom die dat wel doet, tot 8. Een groter gebied krijgt alleen terrein.

### Uitstraling {#look}

Een achtergrond begint met **Vastgelegde kleur tonen** aan - kleur is wat een lichte weg onderscheidt van de grijze grond waarop hij ligt, en een donkere landingsbaan van zijn platform - met de driehoekranden van de grond uit, omdat een regelmatig raster niets zegt, zwakke contourlijnen, een ondoorzichtige zee (een vloer eronder zou in de verte om de diepte vechten met het oppervlak), en gebouwen lichtgrijs en bijna massief, zoals een kaart ze tekent. De open zee krijgt helemaal geen gronddriehoeken. Al het andere is de standaarduitstraling van een modellevel.

## Credits in beeld {#credits-on-the-canvas}

Zolang een achtergrond het level is, wordt zijn bronvermelding rechtsonder in de weergave geschreven, zonder dat er geklikt hoeft te worden, zodat schermafbeeldingen en gerenderde video's die meedragen:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Hoogte: Terrain Tiles – SRTM, GMTED2010, 3DEP met dank aan de U.S. Geological Survey; ETOPO1: NOAA; en anderen

Elk onderdeel linkt naar de bronpagina van zijn bron (openstreetmap.org/copyright en de [lijst met bronvermeldingen](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) van de Terrain Tiles). Een achtergrond die in de bibliotheek is opgeslagen, bewaart zijn bronvermeldingen en toont ze opnieuw bij het laden. De tekst wordt met de viewer vertaald; de namen niet.

## Bronnen en hun voorwaarden {#sources-and-their-terms}

Elke bron, haar licentie en hoe de achtergrond binnen de voorwaarden blijft: [Wereldachtergrond: bronnen en voorwaarden](world-backdrop-sources.md).

## De tegelcache {#the-tile-cache}

Elke tegel, en de TileJSON van de vectortegels, wordt bewaard in de Cache API van de browser onder `3dheat-world-tiles-v1`, op URL. Een tweede bouw van hetzelfde gebied doet helemaal geen verzoeken en werkt offline: de TileJSON wordt eerst gevraagd en, als dat mislukt, noemt zijn gecachte kopie de tegels die al bewaard zijn. Tegels die de server niet heeft (open zee, 404) worden ook als afwezig onthouden.

Vectortegel-URL's bevatten de bouwdatum van de kaart, dus nadat OpenFreeMap een nieuwe bouw publiceert, downloadt de volgende achtergrond verse tegels en blijven de oude bewaard tot ze gewist worden. De cache is beperkt tot 2 GB: boven die grens worden de tegels die het langst geleden zijn opgeslagen, eerst verwijderd. **Kaarttegels vergeten** verwijdert de hele cache. De cache heeft een beveiligde oorsprong nodig (`https://` of `localhost`); anders downloadt elke bouw opnieuw.

## Vergeleken met Tacview {#compared-with-tacview}

Met het oog gecontroleerd op één plek per strijdtoneel, met gesimuleerde opnamen: de startrollen liggen op de middellijnen van de getekende landingsbanen, kustovergangen vallen op de kust. De kant van Tacview komt uit de documentatie en de gepubliceerde schermafbeeldingen (tacview.net, zijn Steam-pagina), niet uit het hier zelf draaien ervan.

| | Tacview 1.9 | Deze achtergrond, gestreamd |
|---|---|---|
| Omvang | de hele aardbol | 1.500 km rond de camera, waar die ook is |
| Terrein | ETOPO1 (ongeveer 1,25 km) ingebouwd; SRTM 25-75 m als de gebruiker de bestanden installeert; DCS-terrein geëxporteerd uit DCS | Copernicus GLO-30 (Mapterhorn), op meterschaal in Frankrijk en de VS |
| Beelden | niets ingebouwd; texturen die de gebruiker downloadt (Mapview, SAS Planet, add-ons zoals een Caucasus VFR-kaart) | EOX Sentinel-2 cloudless 2016, ongeveer 10 m, gestreamd |
| Landbedekking | geen, tenzij in een textuur | uit OpenStreetMap, op het terrein geschilderd (zonder beelden) |
| Wegen, spoorwegen | geen, tenzij in een textuur | elke klasse dicht bij de camera, grote wegen ver weg |
| Gebouwen | geen | uitgetrokken voetafdrukken dicht bij de camera |
| Vliegvelden | labels en landingsbanen als platte dozen, zonder markering | landingsbanen met gemeten uiteinden, zijstroken, middellijn en drempelbalken; rolbanen, platforms; namen met ICAO-codes |
| Plaatsnamen | sommige dorps- en stadslabels | steden, stadjes, dorpen, vliegvelden, naar afstand en hoogte |

Waar het nog tekortschiet:

- **Resolutie van de beelden**: buiten de VS en Frankrijk is de satellietmozaïek van 10 m onder ongeveer 2 km zacht; Tacview met een door de gebruiker geïnstalleerde textuur van zoom 17 is daar scherper.
- **Terrein in de eigen vorm van DCS**: Tacview kan het terrein tonen dat DCS zelf exporteert; hier is het de echte aarde, die afwijkt van het terrein van DCS waar de modelmakers van de kaart het veranderden.
- **Kromming**: de grond is een vlak, dus de horizon is niet die van een gekromde aarde; Tacview tekent een bol.
- **Snelheid**: het eerste bezoek aan een plek downloadt tientallen megabytes voordat hij scherp is; in een browser met softwarerendering (de schermafbeeldingen) tekent hij met enkele honderden tegels op een paar beelden per seconde.

## Grenzen en wat later komt {#limits-and-what-comes-later}

- **Resolutie van het terrein**: ongeveer 30 m op zijn best, en grover in grote gebieden. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFFs op AWS, zonder sleutel, een vaste bronvermeldingstekst) is de betere bron: 30 m overal, GLO-90 waar GLO-30 gaten heeft (Armenië en Azerbeidzjan, die DCS Caucasus dekt). Het heeft een GeoTIFF-lezer nodig en wordt nog niet gebruikt.
- **Beter terrein**: Copernicus GLO-30 op AWS stuurt geen CORS-headers, dus een browser kan het niet lezen; de spiegel van OpenTopography kan wel gelezen worden (CORS en bereiken), maar hun voorwaarden voor het gebruik van een openbare app zijn onbekend - dat wordt eerst gevraagd voordat het gebruikt wordt. Mapterhorn heeft GLO-30 al.
- **Kromming**: de grond is een vlak en hoogtes worden niet verlaagd voor de kromming van de aarde, in overeenstemming met hoe de opnamen geplaatst worden (hoogte als hoogte); ver van de referentie lopen beide samen, met minder dan een promille op 100 km. Alleen de tegels laten buigen zou ze ver weg van de gegevens scheiden, dus dat wordt niet aangeboden. Een gebogen horizon heeft dezelfde daling nodig - afstand tot de camera in het kwadraat, gedeeld door tweemaal de straal van de aarde - toegepast in elke doorgang die een positie tekent (level, tegels, warmte, lijnen, kaders, labels, selectie) als één gedeelde uniform; een echte bol heeft ook aardmiddelpuntposities voor de gegevens nodig en camerarelatief tekenen. Beide zijn gepland met de bolmodus.
- **Alleen de wereld van nu**: de historische kaarten van DCS en IL-2 (Normandy 2, The Channel, Germany Cold War, elke IL-2-kaart) worden getekend met de steden, wegen en kustwerken van vandaag; het paneel zegt dat. Historische vliegvelden worden niet getekend.
- **Geen bolmodus**: een achtergrond is een vlak, lokaal kaderwerk. Een weergave van de hele aarde is gepland.
- Wegen worden in grote gebieden breder gemaakt, zodat ze zichtbaar blijven; van dichtbij zijn ze breder dan in het echt.
- DCS-strijdtoneelnamen in de tabellen van de Watcher worden gekoppeld zoals DCS ze geeft in `mission.theatre`; een naam die niet op de lijst staat, valt terug op de eerste meting afgerond op hele graden, en alleen op breedte- en lengtegraad.

## Historische kaarten (nog niet gebouwd) {#historical-maps-not-built-yet}

Historische kaarten kunnen later de historische strijdtonelen van texturen voorzien. De kaartenreeksen van de US Army Map Service (AMS) zijn werken van de Amerikaanse federale overheid, en worden over het algemeen als publiek domein behandeld (controleer het record van elke scan; veel zijn herdrukken van Britse GSGS- of Duitse originelen, waarvan de Kroonauteursrecht- of anonieme-werktermijn ook verstreken is):

| Strijdtoneel | Reeks | Waar gescand |
|---|---|---|
| IL-2 Stalingrad, Moskou, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Oost-Europa 1:250.000 (in de jaren 50 samengesteld uit Sovjet- en Duitse kaarten) | UT Austin PCL; sommige bladen gegeoreferencet bij UT GeoData |
| IL-2 Normandië, DCS Normandy 2 en The Channel | AMS **M661** / GSGS 4250, Frankrijk 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 en **M841** 1:25.000 (Duitsland) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50.000 (uitgaven van 1951) en **L552** 1:250.000 | ANU Open Research (L751-bladen, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | Britse WO I-loopgravenkaarten (niet AMS) | McMaster University; National Library of Scotland (niet-commerciële voorwaarden) |

AMS-bladen hebben breedte- en lengtegraadmarkeringen op hun hoeken, dus elk zou geplaatst worden met een passing op vier hoeken en als textuur op het terrein gelegd, lokaal gebouwd en bewaard zoals de tegels.

## Voor ontwikkelaars {#for-developers}

### Het `geo`-item in een Parquet-tabel {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` en `up` noemen de kolommen met de oost- en noordmeters op hetzelfde raakvlak bij (`lat0`, `lon0`) en de hoogte. De load houdt de verwijzing als zijn afbeelding precies die kolommen neemt (oost als X, noord en hoogte als Y en Z, in beide volgordes). Het optionele `dcs`-item noemt de eigen meters van een DCS-tabel (x noord, y omhoog, z oost) en het strijdtoneel: een load die die kolommen afbeeldt, wordt in plaats daarvan geplaatst via de transversale Mercatorprojectie van het strijdtoneel ([DCS-coördinaten](#dcs-coordinates)). Een tabel zonder `geo` wordt gelezen zoals voorheen.

### DCS-coördinaten {#dcs-coordinates}

Elk DCS-strijdtoneel is een transversale Mercatorprojectie (WGS84, schaal 0,9996) met zijn eigen middenmeridiaan en valse oorsprong; DCS-x is de noordelijke afstand en z de oostelijke. De constanten zijn die welke het pydcs-project publiceert; de wiskunde is de reeks van Krüger tot de zesde orde (Karney 2011), overgezet naar [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Een achtergrond voor DCS-meters wordt er rechtstreeks in gebouwd, zodat een DCS-tabel van de Watcher die gekoppeld is aan `dcs_x`/`dcs_y`/`dcs_z`, een level dat de DCS-terreinconverter schreef, en de achtergrond allemaal één kader delen. De constanten van Irak zijn niet gepubliceerd; ze zijn gefit op gepubliceerde referentiepunten (4 cm kwadratisch gemiddelde).

De DCS-tabellen van de Watcher liggen op een raakvlak aan het vaste referentiepunt van het strijdtoneel (hetzelfde punt dat de strijdtoneelkiezer gebruikt, hieronder), dus verschillende missies op één strijdtoneel voegen samen met hun referentie intact en lijnen op één lijn met een strijdtoneelachtergrond zonder hem te verschuiven.

### Vereenvoudiging en budget {#simplification-and-budget}

- Gebouwen kleiner dan 20 m² worden weggelaten; 60 m² als het kader meer dan 30 km breed is, 150 m² voorbij 80 km. De rest wordt toegevoegd, het grootste eerst, tot de gebouwen 1,5 miljoen driehoeken bereiken.
- Kleine wegen, serviceweggen en paden worden weggelaten voorbij 60 km breedte; voorbij 150 km blijven alleen snelwegen, hoofdwegen, primaire en secundaire wegen over.
- De hele achtergrond blijft onder ongeveer 3 miljoen driehoeken. De notitie bij de import zegt hoeveel gebouwen er weggelaten zijn.
