---
title: "Accumulatie"
parent: "Renderinginterne werking"
nav_order: 2
lang: "nl"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Accumulatie

Als de viewer niet alle stippen in één frame kan tekenen, tekent hij een deel, dan een ander deel, en telt de beelden bij elkaar op zolang je stilstaat. Het beeld wordt scherper, zoals een foto die ontwikkelt. De camera verplaatsen begint opnieuw. De regel **Dekking** van de statistiekenlaag laat zien hoe ver het is.

![De statistiekenlaag: Dekking toont een percentage terwijl het beeld zich ontwikkelt en *exact* als het klaar is](../assets/img/en/performance-stats-overlay.webp)

## Voor ontwikkelaars {#for-developers}

Wanneer één frame niet alle rijen kan tekenen, tekent het een monster en weegt het op; het beeld is dan een onvertekende maar ruisige schatting. **Accumulatie** voegt opeenvolgende frames samen, zodat de schatting naar het exacte antwoord convergeert zolang er niets verandert. Elk frame kiest één van vijf modi ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); de laatst gebruikte staat op `engine.live.accumMode`.

| Modus | Wanneer | Wat er met de accumulator gebeurt |
|---|---|---|
| **reset** | de camera is verplaatst, iets dat het veld verandert is veranderd, progressieve verfijning is uit, een groeiend venster begint (eerste frame van het afspelen, na een zoekactie), of lijnwarmte uit een afspeelsessie is verschoven | Vervangen door de schatting van dit frame. |
| **extend** | een **Cumulatief** venster dat sinds het vorige frame alleen is gegroeid | Dit frame tekent alleen de rijen die net zichtbaar zijn geworden, op volle gewicht, en telt ze op. Niets vervalt. |
| **ema** | een schuivend venster (**Venster**, **Levensduur**) is verschoven | `acc = acc × (1 - 0,34) + frame × 0,34` - een exponentieel voortschrijdend gemiddelde van ongeveer drie frames. |
| **mean** | er is niets veranderd en de schatting is niet compleet | `acc = acc × (1 - 1/n) + frame × 1/n` bij het *n*-de frame: een lopend gemiddelde. |
| **skip** (inactief) | geconvergeerd en niets veranderd | Er wordt niets getekend; het frame componeert alleen opnieuw. |

### Waarom elk {#why-each}

- **Lopend gemiddelde, geen som.** De buffer schalen met 1 - 1/n en 1/n van het nieuwe frame erbij optellen is algebraïsch hetzelfde als optellen en aan het eind delen door *n*, maar de buffer bevat altijd de waarde van één veld. Een som bereikt *n* keer het veld, en op een doel van 16 bits verzadigt hij bij 65.504; met een deler die steeds groter wordt, zou een stilstaand beeld dan des te meer vervagen naarmate het langer stil staat - terwijl een bewegende camera, die elk frame reset, volkomen correct lijkt. De rooktest bevestigt dat 16 samengevoegde frames 1,00× vasthouden van wat één frame doet.
- **Extend voor cumulatief afspelen.** De rijen die al zijn opgeteld, blijven zichtbaar, dus een frame heeft alleen het deel van een seconde nodig dat net binnenkwam - wat in één frame past, dus het gaat er exact in. Opnieuw schatten zou elk frame een andere willekeurige deelverzameling laten oplichten en laten vervagen, wat leest als uitbarstingen die oplichten en verdwijnen, en een gepauzeerd frame zou blijven bijvullen. De test bevestigt dat het totaal tijdens het afspelen monotoon stijgt en binnen 0,02% blijft over 2,5 s gepauzeerd.
- **Voortschrijdend gemiddelde voor schuivende vensters.** Die veranderen echt elk frame. Een vast menggewicht volgt het bewegende venster (een gemiddelde over alle frames sinds het afspelen begon, zou achter de afspeelkop aan lopen) en is veel rustiger dan opnieuw beginnen.
- **Reset voor afgespeelde lijnen.** De koppen van lijnwarmte bewegen elk frame; een voortschrijdend gemiddelde zou elk ervan in een streep uitsmeren, dus elk frame wordt volledig getekend en de uitdoving van de staart is het eigen beeld.
- **Gedeeltelijke frames gaan door een tijdelijk doel.** Een frame dat op een deel van het volle gewicht wordt samengevoegd, wordt vanaf nul in een apart doel gesplat en daarna in de accumulator gemengd, in plaats van rechtstreeks op 1/n-gewicht gesplat. Rechtstreeks zou elke sprite worden opgeteld op 1/n van de grootte van het totaal waarbij hij hoort, wat een half-float-doel wegafrondt - het ergst waar het het dichtst is ([Half-float-accumulatie](half-float-accumulation.md)).

### Convergentie {#convergence}

Het plan voor elk frame weet hoeveel kandidaatrijen er zijn en hoeveel het indient, dus het aantal frames dat nodig is om elke rij te dekken, is ⌈kandidaten / ingediend⌉. Zodra zoveel frames zijn samengevoegd, is het beeld **geconvergeerd**: de regel *Dekking* van de statistiekenlaag springt van een percentage naar *exact*, en verdere frames blijven inactief. Met **Elke rij in elk frame tekenen** aan (de standaard) dekt één frame meestal alles, dus convergentie is onmiddellijk, en de progressieve machinerie is alleen nodig wanneer het venster meer rijen bevat dan één tekenplan kan dragen (ongeveer 67 miljoen).

### Wat hem opnieuw start {#what-restarts-it}

De instellingen vallen in drie groepen, naar gelang wat de geaccumuleerde buffer nog betekent nadat ze zijn veranderd:

| Groep | Wijzigingen | Effect |
|---|---|---|
| **Geometrie** - welke rijen meetellen en hoeveel | weergavemodus; lijnroutes; spritestraal, intensiteit in het midden en aan de rand, afval, zacht verloop, de curve, pixelgrenzen, afvlakken; afstandsculling nabij, ver en vlak; occlusie en verbergen achter terrein; de doorsnede; canvasgrootte; heatmapresolutie; groepszichtbaarheid en tekens; de splitsing Verschil; Alles / Afspelen; de geschiedenis; de kolomfilters en de selectie van Entiteiten; de half-float-versterking | Reset. |
| **Venster** - het tijdbereik | de afspeelkop die verschuift; de terugval en vervaging van de levensduur | Uitbreiden (cumulatief) of voortschrijdend gemiddelde (schuivend). |
| **Samenstelling** - alleen de kleuring | verzadiging, dichtheidsrespons, minimale intensiteit, de kleurenrampes; het niveau afsnijden; raster en assen; instellingen en sessie van de figuurlaag; scherptediepte | Opnieuw tekenen zonder de warmte aan te raken. |

Een cameraverplaatsing reset altijd. Het slepen van de verzadiging of de rampe kost dus niets; het slepen van de spritestraal start de convergentie bij elke stap opnieuw.
