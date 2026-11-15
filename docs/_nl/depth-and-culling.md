---
title: "Diepte en culling"
parent: "Warmtemodi"
nav_order: 4
lang: "nl"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---

# Diepte en afknippen

Diepte zorgt dat heuvels en muren de warmte erachter verbergen, zoals een echte muur een persoon verbergt. Afstandsculling houdt alleen de warmte over tussen een nabije en een verre afstand van de camera.

![Een lage camera achter een heuvel, met Verbergen achter terrein uit (links) en aan (rechts)](../assets/img/en/depth-and-culling-terrain.webp)

![Afstandsculling met Ver op 400 m en Ook het level afsnijden aan: een plak van de kaart rond de camera](../assets/img/en/depth-and-culling-far.webp)

Zonder diepte is een warmtekaart over een 3D-[niveau](levels.md) een platte laag: alles wat de dataset bevat, gloeit met volle sterkte door elke muur heen, de dieptesignalen die het niveau geeft, vallen weg, en een hotspot binnen een gebouw ziet er hetzelfde uit als een op het dak. Het gedeelte **Diepte** laat het niveau verbergen wat erachter ligt; **Afstandsculling** beperkt de warmte tot een schil of plak rond de camera; de [Doorsnede](slice.md) snijdt een plak uit de wereld. Alle drie werken op de warmtemodi en veranderen welke rijen meetellen, dus als je ze wijzigt, begint de accumulatie opnieuw.

## Diepte {#depth}

Beide regelaars hebben een [niveau](levels.md) nodig - een kaartafbeelding of een 3D-model. Zonder geladen niveau is er niets om achter te verbergen, en doen ze niets. Beide staan uit zolang [Plat op het grondvlak](sprite-shape.md#flatten-onto-ground-plane) aan staat.

### Verbergen achter terrein {#hide-behind-terrain}

**Verbergen achter terrein** (standaard aan): een datapunt waarvan het dichtstbijzijnde oppervlak richting de camera de *grond* is (en geen bouwwerk), wordt helemaal weggelaten, niet alleen verduisterd.

Terrein en muren zijn op verschillende manieren ondoorzichtig. Je kijkt *door* een muur heen met opzet, om te zien op welke verdieping het verkeer was; je wilt nooit door een heuvel heen kijken, want achter een heuvel ligt de andere kant van de kaart - op een kaart van kilometers is dat het grootste deel van de data, en die telt bij elkaar op tot een band die helderder is dan alles op de voorgrond. Eén verduistering kan niet voor beide dienen, dus krijgt het terrein een afkapgrens en houden muren de verduistering hieronder.

### Verborgen achter geometrie {#hidden-behind-geometry}

**Verborgen achter geometrie** (standaard 0,8): hoe sterk een datapunt achter niveaugeometrie wordt onderdrukt. De waarde betekent *schijnt erdoorheen* bij 0, *N% donkerder* daartussen (de stand van de schuifregelaar, niet de gemeten verduistering), *helemaal verborgen* bij 1.

Elke muur of vloer tussen een punt en de camera maakt het verder donker: één muur laat bij de standaard enkele procenten over, en elk extra oppervlak halveert wat overblijft, tot vier oppervlakken. Bij 1 wordt niets achter geometrie getekend, en dat is de goedkoopste instelling.

Zie ook [Uiterlijk van niveau](level-appearance.md).

## Afstandsculling {#distance-culling}

**Afstandsculling** (standaard dicht) beperkt de warmte tot rijen tussen een nabije en een verre grens vanaf de camera. Zet een verre grens om de dichtheid binnen een gebouw te lezen zonder dat de verre kant van de kaart erbovenop optelt; zet een nabije grens om *door* een hotspot te vliegen in plaats van erin.

| Regelaar | Standaard | Bereik (schuifregelaar) | Betekenis |
|---|---|---|---|
| **Nabij** | uit | 0,5-5000 m, logaritmisch, de onderste 5% van de baan = uit (200.000) | Rijen die dichterbij zijn, worden overgeslagen. |
| **Ver** | uit | 1-200.000 m, logaritmisch, onderkant = uit (10.000.000) | Rijen die verder weg zijn, worden overgeslagen. |
| **Afsnijden op een vlak** | aan | | Meet de grenzen langs de kijkas in plaats van vanuit het oog, zodat de snede een vlak is dat evenwijdig is aan het scherm in plaats van een bol rond jou. De rand van een bol buigt weg over het beeld en schuift zodra je draait; een vlak blijft waar je het zet. |
| **Ook het level afsnijden** | aan | | Snijd de grond, bouwwerken en water op dezelfde grenzen af. Laat je het niveau heel, dan verwijdert de snede de datapunten en blijft het gebouw ervoor staan; snij je beide af, dan is het een doorsnede door de kaart en staan de punten tegen hun muren en vloeren. Deze regelaar tekent alleen opnieuw; hij begint de accumulatie niet opnieuw. |

### Toetsenbord {#keyboard}

De verre grens is een regelaar die je doorloopt - loop er met een gebouw doorheen en kijk op welke verdieping het verkeer verschijnt - dus hij staat op het toetsenbord terwijl je vliegt ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Toets | Effect |
|---|---|
| `]` | Duw de verre grens naar buiten met een factor 1,12 (Shift: 1,35) |
| `[` | Trek hem met dezelfde factor naar binnen |
| `\` | Zet de verre grens uit, of weer aan op de afstand waar hij is gebleven (de eerste keer 6000) |

De stappen zijn geometrisch omdat het bruikbare bereik vier ordes van grootte beslaat, van een kamer tot een kaart. Het toetsenbord houdt de verre grens tussen 100 en 400.000. De toetsen doen niets zolang een tekstvak of menu de focus heeft.

## Voor ontwikkelaars {#for-developers}

### Verbergen achter terrein {#hide-behind-terrain}

De bouwwerken worden in een eigen dieptetextuur getekend. Een fragment dat achter de diepte van de scène ligt, maar *niet* achter de diepte van de bouwwerken, ligt achter de grond en wordt weggegooid. Dat kost één dieptepass over de bouwwerken, die wordt overgeslagen als de schakelaar uit staat.

### Verborgen achter geometrie {#hidden-behind-geometry}

Het wordt **per oppervlak** geteld. Eén dieptevergelijking kan alleen zeggen "er staat iets voor", dus een punt achter één muur en een punt vier kamers diep in een gebouw zouden even donker worden, en het interieur zou als één vage vlek lezen. In plaats daarvan wordt de bouwwerkgeometrie **diepte-gepeeld** in maximaal 3 extra lagen ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); elk fragment telt hoeveel oppervlakken er voor liggen (de eigen diepte van de scène plus de gepeelde lagen: maximaal vier), en de verduistering werkt cumulatief:

```
sterkte       = 1 - (1 - schuifregelaar)²          (schuifregelaar 1 → 1)
zichtbaarheid = (1 - sterkte) × 0,5 ^ (oppervlakken - 1)
zichtbaarheid = max(zichtbaarheid, 0,006)          (geen ondergrens bij schuifregelaar 1)
```

| Schuifregelaar | 1 oppervlak | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (standaard) | 4% | 2% | 1% | 0,6% (ondergrens) |
| 1,0 | niet getekend | niet getekend | niet getekend | niet getekend |

Waarom twee factoren: de schuifregelaar is zo gekalibreerd dat één muur enkele procenten laat staan - het beeld dat leest als "achter iets" - en enkele procenten cumulatief zouden bij de derde muur niets meer betekenen; halveren per extra oppervlak houdt vier onderscheidbare stappen over. Waarom kwadratisch: lineair liet een verzadigd veld achter een muur nog steeds verzadigd; een vierde macht wiste het bij 0,8 helemaal uit. Waarom een ondergrens: door verborgen warmte volledig te verbergen, lijkt een kamer vol verborgen verkeer op een lege kamer, zonder iets wat je naar de [Doorsnede](slice.md) doet grijpen. Alleen een schuifregelaar die vastzit op 1 verbergt het helemaal - en dat is de goedkoopste instelling, omdat verborgen punten dan worden weggegooid.

Hoe ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), de shaders van de puntwarmte): de vergelijking gebeurt per fragment, tegen de dieptetextuur van de scène, in **vensterdiepte** in plaats van wereldafstand. Een dieptetextuurlezing in de vertexfase leest op sommige stuurprogramma's overal "ver" (onder meer de software-rasteriser van ANGLE), en het lineariseren van beide dieptes naar meters verliest de scheiding door precisie bij een brede nabij-ver-range. De bias is één sprite-straal omgezet in vensterunits plus enkele minst significante bits, zodat een datapunt dat op een oppervlak rust zichzelf niet overschaduwt.

Bouwwerken worden doorzichtig getekend, maar ze worden getekend in de diepte die de occlusie leest; een niveau waarvan de bouwwerken de dieptetextuur niet hadden gehaald, zou alleen tegen terrein occluderen.

### Afstandsculling {#distance-culling}

Beide grenzen worden in de vertexshader geëvalueerd, dus een weggesnoeide rij kost één vertex en geen fragmenten.
