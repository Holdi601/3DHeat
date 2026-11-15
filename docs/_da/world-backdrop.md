---
title: "Verdensbaggrund"
parent: "Baner og baggrundsgeometri"
nav_order: 5
has_children: true
lang: "da"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Verdensbaggrund

En verdensbaggrund lægger det virkelige terræn under en flyveoptagelse: bakker, veje, floder, flyvepladser og bygninger, hentet fra gratis åbne kortdata. Brug den, når en Tacview-optagelse ellers ville svæve over et tomt gitter. Den er et [niveau](glossary.md), så varmen og figurerne står på den.

## Byg en {#build-one}

1. Indlæs en flyveoptagelse, der siger, hvor på jorden den er (en Tacview-fil `.acmi`), eller indlæs ingenting og vælg en krigsskueplads i trin 3. Se [Indlæs data](getting-data-in.md).
2. Åbn **Baggrund / bane** i sidepanelet.
3. Tryk på **Virkelig verden som baggrund** for at bygge terrænet under dine data. Eller vælg et spilkort under **Krigsskueplads** og tryk på **Byg krigsskuepladsens baggrund** (eller **Stream skuepladsen**).
4. Vent. Panelet viser fremskridtet (*Højdefliser*, *Kortfliser*, *Bygger baggrunden*); **Annullér** stopper det.
5. Flyv rundt. Kildeangivelsen for kortdataene skrives nederst til højre i visningen.

Den første opbygning henter nogle titals megabyte. Browseren gemmer dem, så en ny opbygning af samme område henter intet. **Glem kortfliser** sletter dem. Knappen **Virkelig verden som baggrund** vises kun, når de indlæste data har en geografisk reference (nedenfor).

Alt bygges i en baggrundsproces ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Resultatet erstatter det aktuelle niveau og opfører sig som ethvert [3D-niveau](model-levels.md): det skjuler varmen bag sig, skæres af snittet, har [udseendeindstillingerne](level-appearance.md) og kan gemmes i [biblioteket](level-library.md).

## Hvor dataene er: den geografiske reference {#where-the-data-is-the-geographic-reference}

Et datasæt får kun en geografisk reference fra en kilde, der angiver en:

- **En ACMI-optagelse**: dens header-felter `ReferenceLatitude` og `ReferenceLongitude`, og positioner, som læseren projicerer på planet, der tangerer WGS84-ellipsoiden dér (X mod øst, Y mod nord, meter; højder er optagelsens højde over havet). Referencen beholdes, når afbildningen bruger **X** og **Y** som jordakser – det gør optagelsens egne hints – og droppes, når jorden kommer fra en anden kolonne, fx et spils egen flade verdens **U** og **V**.
- **En Parquet-tabel, hvis `heat3d`-hints har en `geo`-post** – [Watcher](https://github.com/Holdi601/3DHeat-Watcher)'s DCS-, MSFS-, X-Plane- og IL-2 (Tacview)-tabeller. Posten er beskrevet under [Til udviklere](#for-developers).

En indlæsning af flere filer beholder kun referencen, når de alle deler den samme. Alle andre indlæsere påvirkes ikke og har ingen.

Baggrunden projiceres på samme måde og sendes derefter gennem indlæsningens aksekortlægning, så den lander under dataene, uanset hvilke vendinger eller skalaer kortlægningen laver.

## Skueplad {#theatres}

Vælgeren **Krigsskueplads** lister de virkelige kort i DCS World (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) og IL-2 Great Battles (Stalingrad, Moskva, Kuban, Rheinland, Normandie, Prokhorovka, Velikie Luki, Arras, Odessa, Finske Bugt / Leningrad, Korea), hver med sin boks på jorden ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS-boksene er redigørernes udstrækninger beregnet ud fra de offentliggjorte projektioner; IL-2-boksene, og de DCS-bokse, der er markeret som sådan, er skøn ud fra kortenes offentliggjorte størrelser og byerne ved deres kanter – panelet siger, hvilke der er hvilke.

**Byg krigsskuepladsens baggrund** bygger to detaljeniveauer i ét net:

| Niveau | Område | Terræn | Kort |
|---|---|---|---|
| Krigsskueplads | hele boksen | den dybeste zoom op til 10, der kræver højst 64 højdefliser (ca. 3 km pr. hjørnepunkt over Caucasus, 1 km over Normandie) | havet, søer, arealdække og motorveje fra højst 64 vektorfliser ved zoom 4 til 9 |
| Detaljeret område | **Under dataene**, **Omkring et punkt** (breddegrad, længdegrad, 12 til 400 km), eller ingen | op til zoom 12 i højst 100 fliser, højst 500.000 hjørnepunkter | alt ovenstående, fra højst 1.500 vektorfliser ved den dybeste zoom op til 14, der passer |

Det detaljerede område skærer et hul i skueplads-gitteret, udvidet til hele celler, så begge gitre deler deres kantlinjer, og en tynd væg lukker sømmen, hvor de samples højderne forskelligt.

Med data indlæst bygges skuepladsen på dataenes plan, så den lander under dem, som den er bygget. Uden data bygges den omkring skuepladsens eget referencepunkt (hele grader ved dens detaljerede område). Data, der indlæses bagefter på en anden reference – en ACMI-fil angiver sin egen – flytter baggrunden under dem: den nøjagtige flytning mellem de to projektioner beregnes på et 256 × 256 gitter over baggrunden og læses mellem knuderne, inden for en meter eller to over en hel skueplads ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). En baggrund gemt i biblioteket beholder sin plads og flytter sig på samme måde, når den indlæses under andre data.

### Stream af en skueplads {#streaming-a-theatre}

**Stream skuepladsen** viser skuepladsen, som en flysimulator-kortviser gør: jorden kommer som mange små fliser omkring kameraet, indlæses, mens der flyves, og slippes, når de er uden for rækkevidde ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Et kvadtræ af Web Mercator-fliser.** Rødder ved zoom 5 dækker 1.500 km omkring kameraet, så jorden når forbi skueplads-boksen til horisonten. En flise deles i sine fire børn, mens kameraet er nærmere end 1,4 gange dens bredde, ned til zoom 15 (ca. 1 km pr. flise, 15 m mellem terrænets hjørnepunkter): detaljen falder med afstanden, ligesom den falder på skærmen.
- **Hver flise sit eget net**, bygget i en baggrundsproces ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): et 65 × 65 terrængitter med en kant rundt om (så naboer med forskellig detalje aldrig viser en revne), arealdække og havet malet på det, veje, jernbaner, søer, floder, flyvepladser, opmålte landingsbaner og bygninger ovenpå, og eventuelt satellitbilledet af dens firkant. Renderen tegner fliserne med niveauets udseende og dybderegler, så de skjuler varmen bag dem som ethvert niveau.
- **Grovt først.** Fliserne bestilles grove og nære først, fire hentninger ad gangen pr. kilde; mens en flises børn indlæses, står flisen i deres sted, så visningen fyldes med det samme og bliver skarpere.
- **Hukommelse**: byggede fliser holdes op til 600 MB, og den mindst for nylig tegnede droppes først. **Hentninger** bliver i flisecachen, holdt til et budget på 2 GB, med de ældste ud først: at flyve tilbage over et område koster intet, og der er ingen loft pr. opbygning.
- **Gemt i biblioteket** som det, den streamer – skueplads, dens valg og dens plads på jorden – ikke som fliser: indlæses den, streames den igen, fra flisecachen, hvor fliserne stadig er der. Klik og inspektøren rammer fliserne, som de rammer ethvert niveau.
- Begge renderere tegner fliserne: kontrolleret side om side på en rigtig GPU (WebGPU og WebGL2 på samme kort), også varme skjult bag en højderyg.
- Med data indlæst bygges fliserne på dataenes plan; data, der indlæses senere på et andet plan, bygger dem om dér (fra cachen).
- Målt på syntetiske flyvninger over tre steder (Normandie, Nevada, Syrien): ca. 63, 45 og 24 MB ved første besøg med billeder; et andet besøg henter intet.

## Hvad der bygges {#what-is-built}

| Del | Kilde | Hvordan |
|---|---|---|
| Billeder (streamede skueplads, valgfrit) | EOX Sentinel-2 cloudless 2016 | **Satellitbillede** lægger den skyfri mosaik fra 2016 (ca. 10 m pr. billedpunkt, zoom 14, dybere fliser forstørrer den) ud over jorden i stedet for det malede arealdække; veje, landingsbaner, bygninger og navne står ovenpå. |
| Finere billeder (USA, Frankrig) | USGS National Map-ortofotos; IGN BD ORTHO | Med **Satellitbillede** til tager en kortflise fra zoom 13, der ligger helt inde i det sammenhængende USA eller det franske storbyområde, i stedet det nationale ortofoto, to zoom dybere end flisen (seksten af dens fliser lagt i ét billede, ca. 1-2 m pr. billedpunkt tæt på). EOX alle andre steder. |
| Terræn (streamede skueplads) | Mapterhorn | Copernicus GLO-30 overalt (ca. 19 m pr. billedpunkt ved zoom 12), i meterskala, hvor et lands egen opmåling er med (Frankrig, USA og andre); læses to zoom grovere end hver flise. AWS Terrain Tiles, hvis Mapterhorn ikke kan nås. |
| Terræn | AWS Terrain Tiles (Terrarium-PNG) | Et højdegitter over boksen: zoomet er den dybeste op til 12 (ca. 28 m pr. billedpunkt ved 43° N), der kræver højst 36 fliser, og gitteret tyndes til højst 400.000 hjørnepunkter. Tegnet som jord med de sædvanlige relieffs. |
| Veje, jernbaner | OpenFreeMap vektorfliser, laget `transportation` | Flade bånd lagt over terrænet, fortættet til terrænets afstand og løftet nogle procent af den, så de ikke kæmper med det. Bredder efter klasse, fra 16 m (motorvej) til 3 m (spor, bane); aldrig smallere end boksens diagonal / 5000. Stier, færger og tunneller udelades. |
| Flyvepladser | laget `aeroway` | Landingsbane-, rullebane-, parkeringsplads- og helikopterplads-polygoner lagt som jord; landingsbane- og rullebanelinjer som bånd på 45 m og 18 m. |
| Vand | laget `water` | Havet fladt ved 0 m, søer og damme fladt ved deres laveste bred, floder lagt over terrænet. Tegnet som vand: fladt skygget, uden højdekurver. |
| Arealdække | lagene `landcover` og `landuse` | Malet på terrænets egne hjørnepunkter, ingen ekstra trekanter: skove, græs og parker grønt, landbrugsjord stråfarvet, vådområder, sand, klippe, is; boligområder, industri, erhverv, militær og stenbrud i dæmpede toner. Vand males også under vandfladen, så kysten ses fra enhver højde. Nøgen jord får en rolig højdetone (lavland grågrøn, højland brun, sne over 3.000 m). Læseligt ved terrænets opløsning: ca. 30-45 m i det detaljerede område, kilometer i skuepladsen. |
| Stednavne | lagene `place` og `aerodrome_label` | Byer, købstæder og landsbyer, og flyvepladser med deres ICAO-kode, skrevet over visningen; hvor langt hver slags vises, vokser med kameraets højde, højst 70 ad gangen. |
| Opmålte landingsbaner | [OurAirports](https://ourairports.com/data/) `runways.csv` (offentligt domæne) | Valgfrit (**Landingsbaner fra OurAirports**, til som standard): hver åben landingsbane med begge ender på listen, fra tærskel til tærskel i den angivne bredde, med sidestriber, en stiplet midterlinje og tærskelbjælker. Én liste på 4 MB, hentet én gang og gemt i cachen. |
| Bygninger | laget `building` | Fodaftryk trukket op fra `render_min_height` til `render_height` (6 m, når den mangler) over den laveste jord under dem; dele med `hide_3d` springes over. Tegnet som konstruktioner. |

Vektorfliser læses ved zoom 14 (det eneste zoom med bygninger), når boksen kræver højst 300 af dem, ellers ved det dybeste zoom, der gør det, ned til 8. Et større område får kun terræn.

### Udseende {#look}

En baggrund starter med **Vis optaget farve** slået til – farven er det, der adskiller en lys vej fra den grå jord, den ligger på, en mørk landingsbane fra sin rullebane – med jordens trekantkanter slået fra, da et regelmæssigt gitter ikke siger noget, svage højdekurver, et uigennemsigtigt hav (en bund under det ville kæmpe med overfladen om dybden langt væk), og bygninger lysegrå og næsten massive, som et kort tegner dem. Det åbne hav får slet ingen jordtrekanter. Alt andet er et modelniveaus standardudseende.

## Kreditering på lærredet {#credits-on-the-canvas}

Mens en baggrund er niveauet, skrives kildernes kreditering nederst til højre i visningen uden at kræve et klik, så skærmbilleder og gengivne videoer bærer den:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap-bidragydere · Højde: Terrain Tiles – SRTM, GMTED2010, 3DEP med venlig hilsen fra U.S. Geological Survey; ETOPO1: NOAA; og andre

Hver del linker til sin kildes navngivningsside (openstreetmap.org/copyright og Terrain Tiles' [liste over navngivning](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). En baggrund gemt i biblioteket beholder sine kreditter og viser dem igen, når den indlæses. Teksten oversættes med viewer'en; navnene oversættes ikke.

## Kilder og deres vilkår {#sources-and-their-terms}

Hver kilde, dens licens og hvordan baggrunden holder sig inden for vilkårene: [Verdensbaggrund: kilder og vilkår](world-backdrop-sources.md).

## Flisecachen {#the-tile-cache}

Hver flise, og vektorflisernes TileJSON, gemmes i browserens Cache API under `3dheat-world-tiles-v1`, efter URL. En ny opbygning af samme område laver slet ingen forespørgsler og virker offline: TileJSON spørges først, og når det fejler, navngiver dens cachede kopi de fliser, der allerede findes. Fliser, serveren ikke har (åbent hav, 404), huskes også som fraværende.

Vektorflisernes URL'er bærer kortets byggedato, så efter OpenFreeMap har udgivet en ny build, henter den næste baggrund friske fliser, og de gamle bliver, indtil de ryddes. Cachen holdes til 2 GB: ud over det slettes de fliser, der er gemt længst, først. **Glem kortfliser** sletter hele cachen. Cachen kræver en sikker oprindelse (`https://` eller `localhost`); ellers henter hver opbygning igen.

## Sammenlignet med Tacview {#compared-with-tacview}

Kontrolleret med øjet på ét sted pr. skueplads, med syntetiske optagelser: start-rullerne ligger på de tegnede landingsbanernes midterlinjer, kystoverfarter falder på kysten. Tacview-siden er fra dens dokumentation og dens offentliggjorte skærmbilleder (tacview.net, dens Steam-side), ikke fra at køre den her.

| | Tacview 1.9 | Denne baggrund, streamet |
|---|---|---|
| Udstrækning | hele kloden | 1.500 km omkring kameraet, uanset hvor det er |
| Terræn | ETOPO1 (ca. 1,25 km) indbygget; SRTM 25-75 m, hvis brugeren installerer filerne; DCS-terræn eksporteret fra DCS | Copernicus GLO-30 (Mapterhorn), i meterskala i Frankrig og USA |
| Billeder | ingen indbygget; teksturer, brugeren henter (Mapview, SAS Planet, tilføjelser såsom et Caucasus VFR-kort) | EOX Sentinel-2 cloudless 2016, ca. 10 m, streamet |
| Arealdække | ingen, medmindre i en tekstur | fra OpenStreetMap, malet på terrænet (uden billeder) |
| Veje, jernbaner | ingen, medmindre i en tekstur | hver klasse nær kameraet, større veje langt væk |
| Bygninger | ingen | trukne fodaftryk nær kameraet |
| Flyvepladser | etiketter og landingsbaner som flade kasser, uden markeringer | landingsbaner fra opmålte ender med sidestriber, midterlinje og tærskelbjælker; rulleveje, parkeringspladser; navne med ICAO-koder |
| Stednavne | nogle landsby- og bynavne | byer, købstæder, landsbyer, flyvepladser, efter afstand og højde |

Hvor den stadig kommer til kort:

- **Billedopløsning**: uden for USA og Frankrig er 10 m satellitmosaikken blød under ca. 2 km; Tacview med en brugerinstalleret zoom-17-tekstur er skarpere dér.
- **Terræn i DCS' egen form**: Tacview kan vise det terræn, DCS selv eksporterer; her er det den virkelige jord, som afviger fra DCS' terræn, hvor kortets modellører har ændret det.
- **Krumning**: jorden er et fladt plan, så horisonten er ikke en buet jords; Tacview tegner en kugle.
- **Hastighed**: første besøg på et sted henter titalls megabyte, før det er skarpt; i en softwaregengivet browser (skærmbillederne) tegnes det med få billeder i sekundet med flere hundrede fliser.

## Begrænsninger og hvad der kommer senere {#limits-and-what-comes-later}

- **Terrænopløsning**: ca. 30 m i bedste fald, og grovere i store områder. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFFs på AWS, ingen nøgle, en fast kreditteksttekst) er den bedre kilde: 30 m overalt, GLO-90 hvor GLO-30 har huller (Armenien og Aserbajdsjan, som DCS Caucasus dækker). Den kræver en GeoTIFF-læser og bruges endnu ikke.
- **Bedre terræn**: Copernicus GLO-30 på AWS sender ingen CORS-headere, så en browser kan ikke læse det; OpenTopographys spejl kan læses (CORS og intervaller), men deres vilkår for en offentlig apps kørsel er ukendte – de skal spørges, før noget bruges. Mapterhorn bærer GLO-30 allerede.
- **Krumning**: jorden er et fladt plan, og højder sænkes ikke for jordens krumning, i overensstemmelse med hvordan optagelserne placeres (højde som højde); langt fra referencen driver begge sammen, med under en tusindedel ved 100 km. At bøje kun fliserne ville skille dem fra dataene langt væk, så det tilbydes ikke. En buet horisont kræver det samme fald – afstanden fra kameraet i anden over to gange jordens radius – anvendt i hver gennemgang, der tegner en position (niveau, fliser, varme, linjer, bokse, etiketter, valg) som én fælles uniform; en rigtig globus kræver også jordcentrerede positioner for dataene og kamerarelativ rendering. Begge er planlagt med globustilstanden.
- **Kun nutidens verden**: DCS' og IL-2's historiske kort (Normandy 2, The Channel, Germany Cold War, alle IL-2-kort) tegnes med dagens byer, veje og kystarbejder; panelet siger det. Tidstypiske flyvepladser tegnes ikke.
- **Ingen globustilstand**: en baggrund er et fladt lokalt plan. En hel-jord-visning er planlagt.
- Veje gøres bredere i store områder, så de forbliver synlige; tæt på er de bredere end i virkeligheden.
- DCS-skuepladsnavne i Watcher's tabeller matches, som DCS giver dem i `mission.theatre`; et navn, der ikke står på listen, falder tilbage til det første fix afrundet til hele grader og kun til breddegrad og længdegrad.

## Historiske kort (endnu ikke bygget) {#historical-maps-not-built-yet}

Tidstypiske kort kan senere dække de historiske skuepladser som tekstur. US Army Map Service (AMS)-serien er amerikanske føderale regeringsværker, som generelt behandles som offentligt domæne (kontrollér hver scannings registrering; mange er genoptryk af britiske GSGS- eller tyske originaler, hvis Crown copyright eller anonyme værks løbetid også er udløbet):

| Skueplads | Serie | Hvor scannet |
|---|---|---|
| IL-2 Stalingrad, Moskva, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Østeuropa 1:250.000 (sammensat i 1950'erne ud fra sovjetiske og tyske kort) | UT Austin PCL; nogle blade georefereret hos UT GeoData |
| IL-2 Normandie, DCS Normandy 2 og The Channel | AMS **M661** / GSGS 4250, Frankrig 1:50.000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250.000 og **M841** 1:25.000 (Tyskland) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50.000 (udgaver fra 1951) og **L552** 1:250.000 | ANU Open Research (L751-blade, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | britiske verdenskrigs-skyttegravskort (ikke AMS) | McMaster University; National Library of Scotland (ikke-kommercielle vilkår) |

AMS-blade har breddegrad- og længdegradsmærker i deres hjørner, så hvert ville blive placeret ved en fire-hjørne-tilpasning og lagt på terrænet som tekstur, bygget og gemt lokalt ligesom fliserne.

## Til udviklere {#for-developers}

### `geo`-posten i en Parquet-tabel {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` og `up` navngiver de kolonner, der holder øst- og nord-meter på samme tangentplan ved (`lat0`, `lon0`) og højden. Indlæsningen beholder referencen, når dens kortlægning tager præcis de kolonner (øst som X, nord og højde som Y og Z, uanset hvilken vej rundt). Den valgfri `dcs`-post navngiver en DCS-tabels egne meter (x nord, y op, z øst) og dens skueplads: en indlæsning, der kortlægger disse kolonner, placeres i stedet gennem skuepladsens tværgående Mercator-projektion ([DCS-koordinater](#dcs-coordinates)). En tabel uden `geo` læses som før.

### DCS-koordinater {#dcs-coordinates}

Hver DCS-skueplads er en tværgående Mercator-projektion (WGS84, skala 0,9996) med sin egen centrale meridian og falske udgangspunkt; DCS' x er nordkoordinaten og z østkoordinaten. Konstanterne er dem, pydcs-projektet offentliggør; matematikken er Krügers række til sjette orden (Karney 2011), porteret til [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). En baggrund for DCS-meter bygges direkte i dem, så en Watcher DCS-tabel kortlagt via `dcs_x`/`dcs_y`/`dcs_z`, et niveau DCS-terrainkonverteren skrev og baggrunden deler alle ét koordinatsystem. Iraks konstanter er ikke offentliggjort; de er tilpasset offentliggjorte referencepunkter (4 cm kvadratisk middelfejl).

Watcher's DCS-tabeller ligger på et tangentplan ved skuepladsens faste referencepunkt (det samme punkt, skuepladsvælgeren bruger, nedenfor), så flere missioner på samme skueplads flettes med deres reference intakt og flugter med en skuepladsbaggrund uden at flytte den.

### Forenkling og budget {#simplification-and-budget}

- Bygninger under 20 m² udelades; 60 m², når boksen er mere end 30 km på tværs, 150 m² ud over 80 km. Resten tilføjes største først, indtil bygningerne når 1,5 mio. trekanter.
- Mindre veje, servicewej og spor udelades ud over 60 km på tværs; ud over 150 km forbliver kun motorveje, hovedveje, primære og sekundære veje.
- Hele baggrunden holder sig under ca. 3 mio. trekanter. Importnoten siger, hvor mange bygninger der blev udeladt.
