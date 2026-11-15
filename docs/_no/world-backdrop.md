---
title: "Verdensbakgrunn"
parent: "Baner og bakgrunnsgeometri"
nav_order: 5
has_children: true
lang: "no"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Verdensbakgrunn

En verdensbakgrunn legger det virkelige bakkeunderlaget under en flyopptak: åser, veier, elver, flyplasser og bygninger, lastet ned fra gratis åpne kartdata. Bruk den når et Tacview-opptak ellers ville sveve over et tomt rutenett. Den er et [nivå](glossary.md), så varmen og figurene står på den.

## Bygg en {#build-one}

1. Last inn et flyopptak som sier hvor på jorden det er (en Tacview-fil `.acmi`), eller last inn ingenting og velg en krigsskueplass i steg 3. Se [Få data inn](getting-data-in.md).
2. Åpne **Bakgrunn / nivå** i sidefeltet.
3. Trykk **Bakgrunn fra den virkelige verden** for å bygge bakken under dataene dine. Eller velg et spillkart under **Krigsskueplass** og trykk **Bygg bakgrunn for krigsskueplassen** (eller **Strøm krigsskueplassen**).
4. Vent. Panelet viser fremdriften (*Høydefliser*, *Kartfliser*, *Bygger bakgrunnen*); **Avbryt** stopper den.
5. Fly rundt. Kreditteksten for kartdataene står nederst til høyre i visningen.

Den første byggingen laster ned noen titalls megabyte. Nettleseren beholder dem, så en ny bygging av samme område laster ikke ned noe. **Glem kartfliser** sletter dem. Knappen **Bakgrunn fra den virkelige verden** vises bare når dataene som er lastet inn har en geografisk referanse (se under).

Alt bygges i en bakgrunnsarbeider ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Resultatet erstatter det nåværende nivået og oppfører seg som et vanlig [3D-nivå](model-levels.md): det skjuler varmen bak seg, skjæres av snittet, har [utseendekontrollene](level-appearance.md), og kan lagres i [biblioteket](level-library.md).

## Hvor dataene er: den geografiske referansen {#where-the-data-is-the-geographic-reference}

Et datasett får bare en geografisk referanse fra en kilde som oppgir en:

- **Et ACMI-opptak**: headerens `ReferenceLatitude` og `ReferenceLongitude`, og posisjoner som leseren projiserer på planet som tangerer WGS84-ellipsoiden der (X øst, Y nord, meter; høyder er opptakets høyde over havet). Referansen beholdes når avbildningen bruker **X** og **Y** som bakkeakser - opptakets egne hint gjør det - og fjernes når bakken kommer fra en annen kolonne, for eksempel et spills egen flate verden med **U** og **V**.
- **En Parquet-tabell der `heat3d`-hintene har en `geo`-oppføring** - [Watcher](https://github.com/Holdi601/3DHeat-Watcher)s DCS-, MSFS-, X-Plane- og IL-2 (Tacview)-tabeller. Oppføringen beskrives under [For utviklere](#for-developers).

Når flere filer lastes inn, beholdes referansen bare når alle deler den samme. Alle andre innlastere påvirkes ikke og har ingen.

Bakgrunnen projiseres på samme måte og sendes deretter gjennom innlastingens aksemapping, så den havner under dataene uansett hvilke speilinger eller skalering mappingen gjør.

## Krigsskueplasser {#theatres}

Velgeren **Krigsskueplass** lister de virkelige kartene i DCS World (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) og IL-2 Great Battles (Stalingrad, Moskva, Kuban, Rheinland, Normandie, Prokhorovka, Velikie Luki, Arras, Odessa, Finskebukta / Leningrad, Korea), hver med sin boks på jorden ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS-boksene er redigeringsutvidelsene regnet ut fra de publiserte projeksjonene; IL-2-boksene, og de DCS-boksene som er merket slik, er anslag fra kartenes publiserte størrelser og byene langs kantene - panelet sier hvilke.

**Bygg bakgrunn for krigsskueplassen** bygger to detaljnivåer i ett nett:

| Nivå | Område | Terreng | Kart |
|---|---|---|---|
| Krigsskueplass | hele boksen | den dypeste zoomen opp til 10 som trenger høyst 64 høydefliser (omtrent 3 km per toppunkt over Caucasus, 1 km over Normandie) | havet, innsjøer, arealdekke og motorveier fra høyst 64 vektorfliser på zoom 4 til 9 |
| Detaljert område | **Under dataene**, **Rundt et punkt** (breddegrad, lengdegrad, 12 til 400 km), eller ingen | opp til zoom 12 inn på høyst 100 fliser, høyst 500 000 toppunkter | alt over, fra høyst 1 500 vektorfliser på den dypeste zoomen opp til 14 som passer |

Det detaljerte området skjærer et hull i krigsskueplassens rutenett, utvidet til hele celler slik at begge rutenettene deler kantlinjene, og en tynn vegg lukker skjøten der de samples høydene ulikt.

Når data er lastet inn, bygges krigsskueplassen på dataenes plan, så den havner under dem slik den ble bygget. Uten data bygges den rundt krigsskueplassens eget referansepunkt (hele grader nær det detaljerte området). Data som lastes senere med en annen referanse - en ACMI-fil oppgir sin egen - flytter bakgrunnen under dem: den eksakte forflyttingen mellom de to projeksjonene regnes ut på et rutenett på 256 × 256 over bakgrunnen og leses mellom nodene, innen en meter eller to over en hel krigsskueplass ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). En bakgrunn lagret i biblioteket beholder sin plass og flyttes på samme måte når den lastes under andre data.

### Strøm en krigsskueplass {#streaming-a-theatre}

**Strøm krigsskueplassen** viser krigsskueplassen slik et flysimulator-kartvisningsprogram gjør: bakken kommer som mange små fliser rundt kameraet, lastet inn etter hvert som det flys og sluppet når de er utenfor rekkevidde ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Et quadtre av Web Mercator-fliser.** Rotfliser på zoom 5 dekker 1 500 km rundt kameraet, så bakken når forbi krigsskueplassens boks til horisonten. En flis deles i sine fire barn så lenge kameraet er nærmere enn 1,4 ganger bredden, ned til zoom 15 (omtrent 1 km per flis, 15 m mellom terrengtoppunktene): detaljen avtar med avstanden, slik den gjør på skjermen.
- **Hver flis sitt eget nett**, bygget i en arbeider ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): et 65 × 65 terrengrutenett med en skjørt rundt kanten (så naboer med ulik detalj aldri viser en sprekk), arealdekke og havet malt på det, veier, jernbaner, innsjøer, elver, flyplasser, målte rullebaner og bygninger oppå, og eventuelt satellittbildet av sin firkant. Rendereren tegner flisene med nivåets utseende og dybderegler, så de skjuler varmen bak seg som ethvert nivå.
- **Grovt først.** Fliser etterspørres grove og nære først, fire nedlastinger om gangen per kilde; mens en flis' barn lastes, står flisen for dem, så visningen fylles med en gang og skjerpes.
- **Minne**: bygde fliser beholdes opp til 600 MB, den minst nylig tegnede sløyfes først. **Nedlastinger** blir i flisbufferen, holdt til et budsjett på 2 GB, eldst ut først: å fly tilbake over et område koster ingenting, og det er ingen grense per bygging.
- **Lagret i biblioteket** som det den strømmer - krigsskueplassen, dens valg og dens plass på jorden - ikke som fliser: å laste den strømmer den igjen, fra flisbufferen der flisene fortsatt er. Klikk og inspektøren treffer flisene slik de treffer ethvert nivå.
- Begge rendererne tegner flisene: sjekket side om side på en ekte GPU (WebGPU og WebGL2 på samme kort), også med varme skjult bak en rygg.
- Med data lastet bygges flisene på dataenes plan; data lastet senere på et annet plan bygger dem på nytt der (fra bufferen).
- Målt på syntetiske flyvninger over tre steder (Normandie, Nevada, Syria): omtrent 63, 45 og 24 MB ved første besøk med bilder; et nytt besøk laster ikke ned noe.

## Hva som bygges {#what-is-built}

| Del | Kilde | Hvordan |
|---|---|---|
| Bilder (strømmede krigsskueplasser, valgfritt) | EOX Sentinel-2 cloudless 2016 | **Satellittbilder** legger det skyfrie mosaikkbildet fra 2016 (omtrent 10 m per piksel, zoom 14, dypere fliser forstørrer det) over bakken i stedet for det malte arealdekket; veier, rullebaner, bygninger og navn ligger oppå. |
| Finere bilder (USA, Frankrike) | USGS National Map-ortofoto; IGN BD ORTHO | Med **Satellittbilder** på tar en kartflis fra zoom 13 som ligger helt innenfor det sammenhengende USA eller storbyregionen i Frankrike, i stedet det nasjonale ortofotoet, to zoomnivåer dypere enn flisen (seksten av flisene lagt i ett bilde, omtrent 1-2 m per piksel på nært hold). EOX ellers. |
| Terreng (strømmede krigsskueplasser) | Mapterhorn | Copernicus GLO-30 overalt (omtrent 19 m per piksel på zoom 12), metermål der et lands egen oppmåling finnes (Frankrike, USA og andre); leses to zoomnivåer grovere enn hver flis. AWS Terrain Tiles hvis Mapterhorn ikke kan nås. |
| Terreng | AWS Terrain Tiles (Terrarium-PNG) | Et høyderutenett over boksen: zoomen er den dypeste opp til 12 (omtrent 28 m per piksel på 43° N) som trenger høyst 36 fliser, og rutenettet tynnes til høyst 400 000 toppunkter. Tegnes som bakke med de vanlige reliefsignalene. |
| Veier, jernbaner | OpenFreeMap-vektorfliser, laget `transportation` | Flate bånd lagt over terrenget, tettet til terrengets avstand og løftet noen prosent av den så de ikke slåss med det. Bredder etter klasse, fra 16 m (motorvei) til 3 m (spor, bane); aldri smalere enn boksens diagonal / 5000. Stier, ferger og tunneler utelates. |
| Flyplasser | laget `aeroway` | Rullebane-, taxibane-, apron- og helikopterplass-polygoner lagt som bakke; rullebane- og taxibanelinjer som 45 m og 18 m bånd. |
| Vann | laget `water` | Havet flatt på 0 m, innsjøer og dammer flatt på sin laveste strandlinje, elver lagt over. Tegnes som vann: flatt skyggelagt, uten høydelinjer. |
| Arealdekke | lagene `landcover` og `landuse` | Malt på terrengets egne toppunkter, uten ekstra trekanter: skog, gress og parker grønne, jordbruksland halmgult, våtmark, sand, fjell, is; boligområder, industri, kommersielle områder, militære områder og steinbrudd i dempede toner. Vann males også under vannoverflaten, så strandlinjen leses fra enhver høyde. Naken bakke får en rolig høydetone (lavland grågrønt, høyland brunt, snø over 3 000 m). Lesbart i terrengets oppløsning: omtrent 30-45 m i det detaljerte området, kilometer i krigsskueplassen. |
| Stedsnavn | lagene `place` og `aerodrome_label` | Byer, tettsteder og landsbyer, og flyplasser med ICAO-koden, skrevet over visningen; hvor langt hver type vises vokser med kameraets høyde, høyst 70 om gangen. |
| Målte rullebaner | [OurAirports](https://ourairports.com/data/) `runways.csv` (offentlig eiendom) | Valgfri (**Rullebaner fra OurAirports**, på som standard): hver åpen rullebane med begge ender i listen, fra terskel til terskel i sin oppgitte bredde, med sidestriper, stiplet midtlinje og terskelstriper. Én liste på 4 MB, lastet ned én gang og beholdt i bufferen. |
| Bygninger | laget `building` | Fotavtrykk ekstrudert fra `render_min_height` til `render_height` (6 m når den mangler) over den laveste bakken under dem; `hide_3d`-deler hoppes over. Tegnes som konstruksjoner. |

Vektorfliser leses på zoom 14 (den eneste zoomen med bygninger) når boksen trenger høyst 300 av dem, ellers på den dypeste zoomen som gjør det, ned til 8. Et større område får bare terreng.

### Utseende {#look}

En bakgrunn starter med **Vis fanget farge** på - farge er det som forteller en lys vei fra det grå bakkenivået den ligger på, en mørk rullebane fra apronen - med bakkens trekantkanter av, fordi et regelmessig rutenett ikke sier noe, svake høydelinjer, et ugjennomsiktig hav (et gulv under det ville slåss med overflaten om dybden langt unna), og bygninger i lys grått og nesten fulle, slik et kart tegner dem. Det åpne havet får ingen bakketrekanter i det hele tatt. Alt annet er et modellnivås vanlige utseende.

## Kreditter på lerretet {#credits-on-the-canvas}

Mens en bakgrunn er nivået, skrives kildenes kreditt nederst til høyre i visningen, uten at man må klikke, slik at skjermbilder og gjengitte videoer bærer den:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Hver del lenker til kildens attribusjonsside (openstreetmap.org/copyright og Terrain Tiles' [attribusjonsliste](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). En bakgrunn lagret i biblioteket beholder sine kreditter og viser dem igjen når den lastes. Teksten oversettes sammen med visningen; navnene gjør ikke det.
## Kilder og deres vilkår {#sources-and-their-terms}

Hver kilde, dens lisens og hvordan bakgrunnen holder seg innenfor vilkårene: [Verdensbakgrunn: kilder og vilkår](world-backdrop-sources.md).

## Flisbufferen {#the-tile-cache}

Hver flis, og vektorflisenes TileJSON, lagres i nettleserens Cache API under `3dheat-world-tiles-v1`, etter URL. En ny bygging av samme område gjør ingen forespørsler i det hele tatt og fungerer frakoblet: TileJSON spørres først, og når det mislykkes, sier den bufrede kopien hvilke fliser som allerede finnes. Fliser serveren ikke har (åpent hav, 404), huskes også som borte.

Vektorflis-URL-er har kartets byggedato, så etter at OpenFreeMap publiserer et nytt bygg, laster neste bakgrunn ned friske fliser, og de gamle blir værende til de tømmes. Bufferen holdes til 2 GB: over det slettes flisene som ble lagret for lengst siden først. **Glem kartfliser** sletter hele bufferen. Bufferen krever en sikker opprinnelse (`https://` eller `localhost`); ellers lastes alt ned på nytt ved hver bygging.

## Sammenlignet med Tacview {#compared-with-tacview}

Sjekket med øynene på ett sted per krigsskueplass, med syntetiske opptak: start-rullingen ligger på de tegnede rullebanenes midtlinjer, kystkryssinger faller på kysten. Tacviews side er hentet fra dens dokumentasjon og publiserte skjermbilder (tacview.net, Steam-siden), ikke fra å kjøre den her.

| | Tacview 1.9 | Denne bakgrunnen, strømmet |
|---|---|---|
| Omfang | hele kloden | 1 500 km rundt kameraet, uansett hvor det er |
| Terreng | ETOPO1 (omtrent 1,25 km) innebygd; SRTM 25-75 m hvis brukeren installerer filene; DCS-terreng eksportert fra DCS | Copernicus GLO-30 (Mapterhorn), metermål i Frankrike og USA |
| Bilder | ingen innebygd; teksturer brukeren laster ned (Mapview, SAS Planet, tillegg som et Caucasus-VFR-kart) | EOX Sentinel-2 cloudless 2016, omtrent 10 m, strømmet |
| Arealdekke | ingen, med mindre i en tekstur | fra OpenStreetMap, malt på terrenget (uten bilder) |
| Veier, jernbaner | ingen, med mindre i en tekstur | hver klasse nær kameraet, større veier langt unna |
| Bygninger | ingen | ekstruderte fotavtrykk nær kameraet |
| Flyplasser | etiketter og rullebaner som flate bokser, uten merking | rullebaner fra målte ender med sidestriper, midtlinje og terskelstriper; taxibaner, apron; navn med ICAO-koder |
| Stedsnavn | noen landsby- og byetiketter | byer, tettsteder, landsbyer, flyplasser, etter avstand og høyde |

Der den fortsatt kommer til kort:

- **Bildeoppløsning**: utenfor USA og Frankrike er 10 m satellittmosaikken uskarp under omtrent 2 km; Tacview med en brukerinstallert zoom-17-tekstur er skarpere der.
- **Terreng i DCS sin egen form**: Tacview kan vise terrenget DCS selv eksporterer; her er det den virkelige jorden, som avviker fra DCS' terreng der kartets modellerere endret det.
- **Krumning**: bakken er et flatt plan, så horisonten er ikke en buet jords; Tacview tegner en kule.
- **Hastighet**: første besøk på et sted laster ned titalls megabyte før det blir skarpt; i en programvarerendret nettleser (skjermbildene) tegnes det med noen få bilder per sekund med flere hundre fliser.

## Grenser og det som kommer senere {#limits-and-what-comes-later}

- **Terrengoppløsning**: omtrent 30 m i beste fall, og grovere i store områder. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFFs på AWS, ingen nøkkel, en fast kredittekst) er den bedre kilden: 30 m overalt, GLO-90 der GLO-30 har hull (Armenia og Aserbajdsjan, som DCS Caucasus dekker). Den trenger en GeoTIFF-leser og er ikke brukt ennå.
- **Bedre terreng**: Copernicus GLO-30 på AWS sender ingen CORS-headere, så en nettleser kan ikke lese den; OpenTopographys speil kan leses (CORS og områder), men vilkårene deres for en offentlig apps kjøretidsbruk er ukjent - de skal spørres før noen bruk. Mapterhorn har GLO-30 allerede.
- **Krumning**: bakken er et flatt plan, og høyder senkes ikke for jordens krumning, i samsvar med hvordan opptakene plasseres (høyde som høyde); langt fra referansen driver begge sammen, med under en tusendel ved 100 km. Å bøye bare flisene ville skille dem fra dataene langt unna, så det tilbys ikke. En buet horisont krever samme fall - kvadrert avstand fra kameraet delt på to ganger jordradien - brukt i hvert pass som tegner en posisjon (nivå, fliser, varme, linjer, bokser, etiketter, plukking) som én felles uniform; en ekte klode krever jordsentriske posisjoner også for dataene og kamerarelativ rendering. Begge er planlagt med kloden-modusen.
- **Bare dagens verden**: DCS' og IL-2s historiske kart (Normandy 2, The Channel, Germany Cold War, alle IL-2-kartene) tegnes med dagens byer, veier og kystverk; panelet sier det. Tidsriktige flyplasser tegnes ikke.
- **Ingen klodemodus**: en bakgrunn er et flatt lokalt plan. En visning av hele jorden er planlagt.
- Veier gjøres bredere i store områder, så de forblir synlige; på nært hold er de bredere enn livet.
- DCS-krigsskueplassnavn i Watcher-tabellene matches slik DCS gir dem i `mission.theatre`; et navn som ikke står i listen, faller tilbake til første fiks avrundet til hele grader, og til breddegrad og lengdegrad alene.

## Historiske kart (ikke bygget ennå) {#historical-maps-not-built-yet}

Tidsriktige kart kan dekke de historiske krigsskueplassene senere. US Army Map Service (AMS)-seriene er amerikanske føderale regjeringsverk, som generelt regnes som offentlig eiendom (sjekk hver skannings oppføring; mange er opptrykk av britiske GSGS- eller tyske originaler, der Crown copyright eller vilkåret for anonyme verk også har løpt ut):

| Krigsskueplass | Serie | Hvor skannet |
|---|---|---|
| IL-2 Stalingrad, Moskva, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Øst-Europa 1:250 000 (satt sammen på 1950-tallet fra sovjetiske og tyske kart) | UT Austin PCL; noen blad georeferert hos UT GeoData |
| IL-2 Normandie, DCS Normandy 2 og The Channel | AMS **M661** / GSGS 4250, Frankrike 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250 000 og **M841** 1:25 000 (Tyskland) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (utgavene fra 1951) og **L552** 1:250 000 | ANU Open Research (L751-blad, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britiske kart over skyttergraver fra første verdenskrig (ikke AMS) | McMaster University; National Library of Scotland (ikke-kommersielle vilkår) |

AMS-blad har breddegrad- og lengdegradmerker i hjørnene, så hvert ville bli plassert med en tilpasning av fire hjørner og lagt over terrenget som en tekstur, bygget og lagret lokalt som flisene.

## For utviklere {#for-developers}

### `geo`-oppføringen i en Parquet-tabell {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` og `up` nevner kolonnene som holder øst- og nordmeter på samme tangentplan ved (`lat0`, `lon0`) og høyden. Innlastingen beholder referansen når dens avbildning tar nøyaktig disse kolonnene (øst som X, nord og høyde som Y og Z begge veier). Den valgfrie `dcs`-oppføringen nevner en DCS-tabells egne meter (x nord, y opp, z øst) og dens krigsskueplass: en innlasting som avbilder disse kolonnene, plasseres i stedet gjennom krigsskueplassens transversale Mercator-projeksjon ([DCS-koordinater](#dcs-coordinates)). En tabell uten `geo` leses som før.

### DCS-koordinater {#dcs-coordinates}

Hver DCS-krigsskueplass er en transversal Mercator-projeksjon (WGS84, skala 0,9996) med sin egen sentralmeridian og falske origo. DCS x er nordkoordinaten og z østkoordinaten. Konstantene er de pydcs-prosjektet publiserer; matematikken er Krügers rekke til sjette orden (Karney 2011), overført til [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). En bakgrunn for DCS-meter bygges direkte i dem, så en Watcher-DCS-tabell avbildet med `dcs_x`/`dcs_y`/`dcs_z`, et nivå DCS-terrengkonverteren skrev og bakgrunnen deler alle ett koordinatsystem. Irak sine konstanter er ikke publisert; de er tilpasset publiserte referansepunkter (4 cm midlere kvadratfeil).

Watcherens DCS-tabeller ligger på et tangentplan i krigsskueplassens faste referansepunkt (samme punkt som krigsskueplassvelgeren bruker, under), så flere oppdrag på én krigsskueplass slås sammen med referansen intakt og flukter med en krigsskueplassbakgrunn uten å flytte den.

### Forenkling og budsjett {#simplification-and-budget}

- Bygninger under 20 m² droppes; 60 m² når boksen er mer enn 30 km på tvers, 150 m² utover 80 km. Resten legges til største først til bygningene når 1,5 M trekanter.
- Mindre veier, tjenesteveier og stier droppes utover 60 km på tvers; utover 150 km er bare motorveier, hovedveier, primærveier og sekundærveier igjen.
- Hele bakgrunnen holder seg under omtrent 3 M trekanter. Importnotatet sier hvor mange bygninger som ble utelatt.
