---
title: "Camera en bediening"
nav_order: 14
has_children: true
lang: "nl"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Camera en bediening

Je vliegt door de scène als een vogel: **W A S D** om te bewegen, sleep met de muis om te kijken. Gebruik deze pagina om te vliegen, om naar een boven- of zijaanzicht te springen, en om precies te zien waar de camera staat.

## Vliegen in 4 stappen {#fly-in-4-steps}

1. Klik één keer op het beeld, zodat het de toetsen krijgt.
2. Houd **W** ingedrukt om vooruit te vliegen, **S** achteruit, **A** en **D** opzij, **Spatie** omhoog, **Q** omlaag.
3. Houd de linker of rechter muisknop ingedrukt en sleep om rond te kijken.
4. Druk op **F** om alle data weer in beeld te brengen.

De camera is een vrije vliegcamera met een perspectief- en een parallelprojectie, vooraf ingestelde aanzichten, een ingetypte pose en scherptediepte. De instellingen staan in het paneel **Camera & scène** onderaan de zijbalk (ook zichtbaar in de tabbladen Race-analyse en Match). De code staat in [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Vliegen {#flying}

| Invoer | Effect |
|---|---|
| `W` `A` `S` `D` of de pijltjestoetsen | Vooruit (langs het zicht, inclusief de stamphoek), links, achteruit, rechts |
| `Spatie` of `E` | Omhoog (wereld omhoog) |
| `Q` of linker `Ctrl` | Omlaag |
| `Shift` (ingedrukt) | 6× sneller |
| linker `Alt` (ingedrukt) | 15% snelheid |
| Slepen met de linker of rechter muisknop | Rondkijken. De aanwijzer is vergrendeld tijdens het slepen. |
| Muiswiel | Vliegsnelheid ×1,5 per klik (perspectief); zoomen (parallel) |
| `F` | De data in beeld brengen |
| Klik (zonder slepen) | Toont wat onder de aanwijzer ligt ([Het beeld bekijken](#inspecting-the-view)) |
| `C` | Kopieert de positie, gierhoek en stamphoek van de camera |
| `G` | Naar een ingetypt punt gaan |
| `Esc` | Sluit de kaart met de keuze (en stopt met het volgen van een eenheid) |

### Terwijl je een eenheid volgt {#while-following-a-unit}

Als de camera in een replay een eenheid volgt ([Matchreplay](match-replay.md)), doen de vliegtoetsen iets anders:

| Invoer | Effect |
|---|---|
| Wiel, `W` / `S` | Dichterbij / verder weg van de eenheid (hoger / lager in het satellietaanzicht) |
| `A` / `D`, `Q` / `E` | Omcirkelen rond de eenheid (achtervolg- en omcirkelaanzichten) |
| Slepen | Rondkijken rond de eenheid (cockpit: rondkijken binnenin) |
| `V` / `Shift+V` | Volgend / vorig cameraaanzicht |
| `Esc` | Eerst stoppen met kijken naar de tweede eenheid, daarna stoppen met volgen |

Bewegingstoetsen tellen op bij een [gamepad](gamepad.md). Zie het [toetsenbordoverzicht](keyboard-reference.md) voor de rest. Toetsen worden genegeerd als een tekstvak of keuzelijst focus heeft. De stamhoek wordt net onder recht omhoog en recht omlaag begrensd.

## Paneel Camera & scène {#camera--scene-panel}

![Het paneel Camera & scène: Projectie, knoppen Vooraanzichten, Gezichtsveld, Vliegsnelheid en Pose](../assets/img/en/camera-panel.webp)

### Projectie {#projection}

**Projectie**: *Perspectief* (standaard) of *Parallel*.

*Parallel* (orthografisch) haalt de verkorting weg. Twee hotspots met gelijke dichtheid zien er dan even groot uit, waar ze ook in het beeld staan. Dat is de vergelijking waarvoor een kaartwarmtebeeld bestaat. Het maakt ook een isometrisch aanzicht isometrisch. In de parallelmodus zoomt het muiswiel (er is geen vooruitbeweging die de schaal verandert), en de [snelheidsweergave](#fly-speed) is verborgen.

**Schakelen houdt het onderwerp even groot.** Een parallelprojectie heeft geen gezichtsveld, dus de hoogte van het frustum hangt niet samen met de afstand van de camera. Zonder aanpassing zoomt het wild of toont het niets. Bij overschakelen naar parallel wordt de hoogte van het frustum gelijkgesteld aan wat de perspectiefcamera op de scherpstelafstand bestrijkt (2 × afstand × tan(gezichtsveld / 2); de scherpstelafstand is de afstand van de laatste kadrering). Terugschakelen herstelt de perspectiefpose die je verliet, op dezelfde schijnbare schaal, in plaats van waar het parallelaanzicht ondertussen heen is gedwaald.

### Vooraanzichten {#preset-views}

| Groep | Knoppen | Oriëntatie |
|---|---|---|
| **Isometrisch** | **NO**, **NW**, **ZO**, **ZW** | Parallel, stamhoek -35,264° (= atan(1/√2), de hoek waarbij alle drie de assen even lang worden geprojecteerd), gierhoek -45°, 45°, -135°, 135°. Vier hoeken, omdat één hoek altijd de helft van de kaart verbergt achter wat dichterbij staat. |
| **Aanzichten** | **Boven**, **Onder**, **Voor**, **Achter**, **Links**, **Rechts** | Parallel. Boven kijkt recht omlaag (stamhoek -89,9°), Onder recht omhoog, Voor langs -Z (gierhoek 0°), Achter langs +Z (180°), Links langs -X (-90°), Rechts langs +X (90°). |
| | **Terug naar perspectief** | Keert terug naar de perspectiefpose die je verliet. Uitgeschakeld in perspectief. |
| | **Driekwartaanzicht** | Perspectief, gierhoek -35°, stamhoek -28°. |

Elk vooraanzicht schakelt de projectie zelf om. Onder perspectief convergeert een "bovenaanzicht" nog naar een verdwijnpunt, en dan lijken gelijke oppervlakken niet meer gelijk. Het brengt de data ook in beeld vanuit die richting.

### Gezichtsveld {#field-of-view}

**Gezichtsveld** - de verticale hoek. Standaard 65°, 10-140° op de schuif (179° met de greep), met de knoppen **Vlak 20°**, **Tele 35°**, **Normaal 50°**, **Breed 65°**, **Zeer breed 90°**. Smal maakt het perspectief vlakker en lijkt meer op een parallelprojectie. Breed overdrijft de diepte en maakt afstanden moeilijk in te schatten. Het blijft live in de parallelmodus. Daar bepaalt het de schaal die het terugschakelen oplost, en de afstand die **Dataset passend maken** gebruikt.

### Vliegsnelheid {#fly-speed}

**Vliegsnelheid** - wereldeenheden (meters) per seconde op volle gas. Standaard 120. Bij elk laden de horizontale omvang van de data / 12. Logaritmisch, 0,02-20.000 (200.000 met de greep; de greep verandert hem met verhoudingen, niet met bedragen). Het muiswiel vermenigvuldigt of deelt hem met 1,5 per klik, binnen 0,02-200.000.

Dezelfde waarde staat rechtsonder in het beeld (alleen perspectief): de snelheid in m/s of km/s, en de tijd die je nodig hebt om de data over te steken (of het niveau, als een 3D-niveau geladen is) bij die snelheid. Sleep omhoog of omlaag om de snelheid te veranderen.

### Nabij en ver {#near-and-far}

**Nabij** (standaard 0,5) en **Ver** (standaard 40.000) zijn de afstanden waarop wordt afgeknipt. Beide worden bij elk laden opnieuw berekend uit de data (nabij = max(0,05; omvang / 20.000), ver = omvang × 12). Een groter 3D-niveau maakt ze alleen breder, nooit smaller ([Niveaus](levels.md#what-a-level-does-for-the-heat)). Hun verhouding bepaalt de dieptenauwkeurigheid waar [occlusie](depth-and-culling.md) op rust. Een heel klein nabij met een heel groot ver maakt die dus zwakker. Vanuit buiten de scène of hoog boven de grond gezien, schuift het gebruikte nabije vlak op naar 2% van die afstand. Daardoor houdt een kaart die van ver boven wordt gezien genoeg dieptenauwkeurigheid, zodat water en kust niet flikkeren. Het vak toont nog steeds de ingestelde waarde.

### Overige instellingen {#other-controls}

| Instelling | Standaard | Betekenis |
|---|---|---|
| **Y omkeren** | uit | Keert het omhoog en omlaag kijken met de muis om. |
| **Scherptediepte** | uit | Zie hieronder. |
| **Gamepad** | aan | Zie [Gamepad en HOTAS](gamepad.md). |
| **Pose** | | Zie hieronder. |
| **Inspecteren** | | De camerameting, klik-om-te-kiezen, de gierhoekconventie en *Naar een punt gaan*; zie [Het beeld bekijken](#inspecting-the-view). |
| **Dataset passend maken (F)** | | Past de data (in het tabblad Race-analyse: de rondes) aan het beeld aan, met behoud van de huidige richting. De camera staat op r / tan(gezichtsveld / 2) van het midden, waarbij r de halve diagonaal van de grenzen van de data is. |
| **Raster**, **Assen** | aan, aan | Een grondraster met een schaal van 1/2/5 × 10ⁿ, ongeveer 1/40 van de spanwijdte van de data (loopt door tot 1,5 × de data, tussen 8 en 120 rasterstappen), en gekleurde assen. |
| **Wereldas omkeren** X, Y, Z | uit | Zie hieronder. |

### Pose {#pose}

Vijf getalvakken - **X**, **Y**, **Z** en **gierhoek °**, **stamhoek °** - die de camera volgen zolang geen van hen focus heeft. Typ een waarde en druk op `Enter` (of verlaat het vak) om de camera daarheen te verplaatsen. **kopiëren** zet `pos X Y Z · gierhoek A · stamhoek B` op het klembord (met `(spelgierhoek)` erachter wanneer die conventie is gekozen). Vliegen is hoe je verkent. Coördinaten zijn hoe je een aanzicht reproduceert. Het zijn dezelfde getallen als de [camerameting](#camera-readout): de eigen coördinaten van de data, ook als een as is omgekeerd, en de gierhoek in de gekozen [conventie](#yaw-conventions).

### Wereldas omkeren {#invert-world-axis}

**Wereldas omkeren X / Y / Z** tekent de wereld met die as omgekeerd. Een spel dat een linkshandige wereld gebruikt, komt in deze rechtshandige viewer gespiegeld uit: rechtse bochten worden als linkse getekend. Het omkeren van X of Z zet dat recht. **Alleen het tekenen verandert**: de data, de analyse en elke coördinaat die de hulpmiddelen tonen (pose, meetlat, snede) blijven die van het spel zelf. Het aanzicht draait op zijn plek, zodat je naar dezelfde plek blijft kijken. Deze instelling wordt in de browser onthouden (`localStorage`-sleutel `heat3d.mirror`). Vergelijk de [omkeringen](axes-units-and-time.md#flips) bij het laden, die de data wél veranderen.

## Het beeld bekijken {#inspecting-the-view}

Waar de camera staat, wat onder de aanwijzer ligt, en naar een punt gaan: het blok **Inspecteren** van het paneel Camera & scène, en twee overlays linksboven in het beeld. De code staat in [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) en [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Instelling | Standaard | Betekenis |
|---|---|---|
| **Camerapositie boven het beeld** | aan | De camerameting, hieronder. Sluit ook met de **×**. |
| **Klik toont wat er is** | aan | Klik-om-te-kiezen, hieronder. |
| **Gierhoekconventie** | Viewer | Welke gierhoek de meting, de posevakken en het springvak tonen en lezen. |

Deze drie worden in de browser onthouden (`localStorage`-sleutel `heat3d.inspect`).

### Cameramling {#camera-readout}

Linksboven in het beeld: de **x**, **y**, **z**, **gierhoek** en **stamhoek** van de camera, live, met een label dat de gierhoekconventie noemt. Het toont dezelfde getallen als de vakken van [Pose](#pose), en kost niets tijdens het vliegen (het wordt op de klok van het beeld naar de pagina geschreven, zonder de panelen opnieuw te tekenen).

- **kopiëren** (of `C` overal buiten een tekstvak) zet `x X y Y z Z gierhoek A stamhoek B (viewer-gierhoek)` op het klembord, met `.` als decimaalteken, wat de taal ook is. Een regel die het springvak, en elk script, weer kan lezen.
- **ga naar** (of `G`) opent een vak eronder: plak een punt en druk op `Enter` om het te bekijken, of plak een hele gekopieerde pose om in dat aanzicht te staan. `Esc` sluit het vak.

### Coördinaten: het eigen kader van de data {#coordinates-the-datas-own-frame}

Elke coördinaat die de inspectiehulpmiddelen tonen of accepteren, staat in het **eigen kader van de geladen data**: de [assenindeling](axes-units-and-time.md) van het laden (omhoog-as, omkeringen, schaal) is ongedaan gemaakt. Een positie die je van het beeld aflees, is het getal dat de brontabel bevat. Een getal uit de tabel dat je in het springvak typt, komt op die plek uit. Als de indeling niets verandert (een Y-omhoog laden zonder schaal, zoals de opnametools en de niveau-exporters schrijven), is dit gewoon de wereld. Anders heeft de meting een label **datastelsel**. Zonder dataset zijn coördinaten wereldcoördinaten. Gier en stamhoek zijn altijd rond de wereld van de viewer, Y omhoog.

### Gierhoekconventies {#yaw-conventions}

| Conventie | Gierhoek 0° kijkt langs | Groeit richting | Gebruikt door |
|---|---|---|---|
| **Viewer** | -Z | -X | de vliegcamera, [vooraanzichten](#preset-views) |
| **Spel / opnametools** | +X | -Z | de kolommen `yaw` en poses van de opnametools; in een niveau dat in het kader van de viewer is geëxporteerd, de eigen gierhoek van het spel |

De stamhoek is in beide hetzelfde: omhoog vanaf de horizontaal. De twee verschillen alleen met een kwartslag:

> viewer-gierhoek = spelgierhoek - 90°

Een richting `d` is `(cos p · cos y, sin p, -cos p · sin y)` in de spelconventie en `(-sin y · cos p, sin p, -cos y · cos p)` in die van de viewer. Kies **Spel / opnametools** om een gierhoek rechtstreeks uit een opnametabel over te typen, of om de meting met zo'n tabel te vergelijken.

### Naar een punt gaan {#going-to-a-point}

**Naar een punt gaan**, in het blok Inspecteren (en het vak **ga naar** van de meting):

- het tekstvak accepteert `x, y, z` of `x y z` (of `x; y; z`), met een punt of een komma als decimaalteken. `-321.6, 137.8, -59.9` en `-321,6 137,8 -59,9` zijn hetzelfde punt. Vijf getallen voegen een gierhoek en stamhoek toe. Een pose die uit de meting of de posevakken is gekopieerd, wordt in zijn geheel gelezen, met labels en conventie;
- **gierhoek °** en **stamhoek °** (optioneel) draaien de camera, in de gekozen conventie;
- **Bekijken** behoudt de richting (naar beneden gekanteld tot minstens 20° als die vlak keek) en gaat langs die richting terug naar de huidige afstand. Die wordt tussen 0,3% en 3% van de breedte van de scène gehouden: 6 tot 60 m op een niveau van twee kilometer. De scherpstelafstand, de hoogte van het parallelaanzicht en de vliegsnelheid volgen, zodat het aanzicht bruikbaar aankomt;
- **Hier staan** zet de camera op het punt, gedraaid naar de opgegeven gierhoek en stamhoek, of zoals hij was.

Een geplakte pose met eigen gierhoek en stamhoek staat altijd in dat aanzicht.

### Klik-om-te-kiezen {#click-to-pick}

Een klik op het beeld - indrukken en loslaten zonder meer dan 4 pixels te slepen; slepen kijkt nog steeds rond - toont een kaart linksboven met wat onder de aanwijzer ligt. Terwijl de [meetlat](measure.md) aan staat, gaan klikken naar de meetlat.

**Een getekend datapunt wint.** Het dichtstbijzijnde sample binnen 8 pixels van de klik, van de punten die echt getekend worden: de rijen in het tijdvenster en de levensduur, die door de [filters](filters.md) komen, de getoonde groepen en de verdeling van het verschil, binnen de afstandsafsnijding en een snede die de warmte afknipt. In de boxreplay: een box onder de aanwijzer (waar ook op de box). De kaart toont elke kolom die de rij bevat, onder de eigen kolomnamen van de bron: tijd (kloktijd, of de eigen seconden van het bestand met `m:ss.ss`), persoon, groep, sessie, elke bewaarde kolom, de positie en de kijkrichting, en de afstand tot de camera. Alleen kolommen die het laden heeft bewaard, zitten in het geheugen. Een kolom die niet als [filterkolom](column-mapping.md) is gekozen, wordt niet getoond.

**Anders het oppervlak van het niveau**: het punt waar de straal van de klik de echte driehoeken van het niveau raakt (niet het referentievlak van de meetlat), met het **onderdeel** waartoe het behoort (de naam van de exporter, `structure:props`, `ground:terrain …`), zijn **soort** (grond, structuur, water, kaartafbeelding), de coördinaten en de afstand. Geometrie die een snede of de afstandsafsnijding verbergt, wordt doorgelaten. Waar het niveau een [navigatiemesh](model-levels.md#navigation-meshes) heeft, noemt een regel die en zegt hij of de plek erop ligt (✓). Een onderdeelnaam met een voorvoegsel `≈` is geraden uit de begrenzingskaders van de onderdelen, omdat dat deel van het niveau bij het laden is vereenvoudigd.

De kaart blijft staan tot je hem sluit (**×**, `Esc`), een andere klik iets anders beantwoordt, of op een lege plek wordt geklikt. Er wordt een cyaan kruis op het punt in de scène getekend, en er staat een ring overheen op het scherm. De knoppen: **kopiëren** (elke waarde, en de coördinaten als `x, y, z`), **Bekijken** en **Hier staan** (bij een datapunt, kijkend zoals de rij keek als die een kijkrichting heeft; bij een oppervlak, 1,7 m erboven).

Het niveau wordt geïndexeerd voor het kiezen bij de eerste klik die dat nodig heeft: een raster van kolommen over de voetafdruk, een paar milliseconden per keer tussen de beelden, zodat het beeld nooit stopt (ongeveer een seconde werk voor een niveau van enkele miljoenen driehoeken). Dat blijft tot het niveau verandert. Tot die tijd toont de kaart *Het niveau wordt voorbereid voor het kiezen* met een percentage, en beantwoordt de klik zodra het klaar is. Een zoektocht naar een datapunt over meer dan vier miljoen getekende rijen wordt op dezelfde manier over beelden verdeeld.

## Scherptediepte {#depth-of-field}

Een inklapbaar blok in Camera & scène, met de titel *Scherptediepte - aan* zolang het aan staat. Standaard uit: het is een presentatie-effect, en het standaardaanzicht moet de data tonen en geen interpretatie daarvan.

| Instelling | Standaard | Bereik (draaiknop) | Betekenis |
|---|---|---|---|
| **Ingeschakeld** | uit | | |
| **Scherpstellen op wat passend is gemaakt** | aan | | Scherpstellen op de afstand die de laatste kadrering gebruikte (*Scherpgesteld op N m.*). |
| **Scherpstelafstand** | 1000 | 1-200.000, logaritmisch (10.000.000) | Zichtbaar als het scherpstellen handmatig is. |
| **Diafragma** | ±35% | ±2% tot ±200%, logaritmisch (±3200%) | De diepte die scherp blijft, als deel van de scherpstelafstand. Relatief in plaats van een f-getal, omdat scènes variëren van een kamer tot een kaart van acht kilometer. |
| **Maximale vervaging** | 12 px | 1-48 (256) | De grootste vervagingsstraal. De kosten schalen ermee. |

Het vervaagt het **niveau, het raster en de boxen** - *niet de warmte*. Warmte in een pixel is de som van sprites op veel dieptes, dus er is geen enkele diepte waarop ze onscherp kan zijn. Haar vervagen met wat er achter ligt, zou fout zijn waar ze ervoor zweeft. Scherpe data boven zacht context is bovendien het nuttigste van de twee. De vervaging is een gather van 24 taps met de gouden hoek, in de compositiestap gewogen, zodat een scherpe voorgrond niet naar buiten wordt uitgesmeerd door de vage achtergrond erachter. Bij elke wijziging wordt opnieuw getekend, zonder de opbouw van de warmte opnieuw te starten.

## Resolutie van het canvas {#canvas-resolution}

Het canvas wordt getekend op de pixelverhouding van het scherm, begrensd op 2. De warmtebuffer mag op een lagere resolutie worden getekend dan dat ([Warmteresolutie](performance-and-stats.md)).

## Pagina's in deze sectie {#pages-in-this-section}

- [Gamepad en HOTAS](gamepad.md)
- [Toetsenbord- en muisoverzicht](keyboard-reference.md)
