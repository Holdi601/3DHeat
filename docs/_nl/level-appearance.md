---
title: "Uiterlijk van niveau"
parent: "Niveaus en achtergrondgeometrie"
nav_order: 3
lang: "nl"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Uiterlijk van niveau

Met deze instellingen verander je hoe een 3D-niveau eruitziet, zodat de warmte eruit springt en je de plek nog steeds kunt lezen. Niets hier verandert de data.

## Snelle start {#quick-start}

1. Laad een 3D-niveau ([3D-niveaus](model-levels.md)).
2. Verlaag onder **Achtergrond / level** de **Helderheid** tot de warmte het helderste is wat je op het scherm ziet.
3. Open **Grondreliëf** en verhoog **Hellingsschaduw** of **Sterkte van de hoogtelijnen** tot je een heuvel van een vlakte kunt onderscheiden.
4. Open **Structuren**. Verlaag **Dekking vlakken** om in gebouwen te kijken, of zet **Structuurtextuur** aan om ze massief te zien.
5. Als de grond een afbeelding heeft, probeer **Grondtextuur** uit en weer aan.

![De gedeelten Grondreliëf en Structuren open, met het niveau met reliëfsignalen](../assets/img/en/level-appearance-sections.webp)

Met een geladen [3D-niveau](model-levels.md) toont het paneel Achtergrond / level deze instellingen. De standaardwaarden zijn die van een net geïmporteerd niveau ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Ze veranderen alleen de scène opnieuw; de warmteaccumulatie blijft behouden.

## Het hele niveau {#the-whole-level}

| Regelaar | Standaard | Bereik | Betekenis |
|---|---|---|---|
| **Dekking** | 100% | 0-100% | Onder 100% wordt het niveau gemengd en schrijft het geen diepte meer, dus het [verbergt](depth-and-culling.md) de warmte niet meer. |
| **Helderheid** | 0,9 | 0-2 (schuifregelaar 64) | |

Het niveau wordt ontkleurd getekend - grijze grond, een getinte schil - zodat de warmte het enige verzadigde is op het scherm. Anders dan een [kaartafbeelding](map-images.md) heeft een 3D-niveau geen schuifregelaar voor Ontkleuren.

## Grondreliëf {#ground-relief}

Van ver weg lijken een heuvel en een vlakte even grijs, dus de viewer voegt drie aanwijzingen toe. Elk beantwoordt een ander probleem:

| Regelaar | Standaard | Betekenis |
|---|---|---|
| **Afstand tussen hoogtelijnen** | uit het hoogtebereik van de grond | Hoogte tussen de hoogtelijnen, logaritmisch van 1/4000 tot 1/2 van het hoogtebereik van het niveau; de onderkant van de baan is *uit*. De standaard is 1/40 van het hoogtebereik van de grond, afgerond op een stap 1/2/5 - lijnen van 10 m passen bij een heuvelhelling en zijn nutteloos op de bodem van een groeve. Elke 5e lijn is sterker getekend. Hoogtelijnen worden in schermruimte getekend, dus ze blijven één pixel breed bij elke zoom, en ze zijn het enige signaal dat overblijft bij grond die te vlak is om nog te schaduwen. |
| **Sterkte van de hoogtelijnen** | 35% | 0-100% |
| **Hellingsschaduw** | 55% | Verdonkert naar steilheid, zodat taluds en kliffen vanuit elke camerahoek leesbaar zijn - anders dan een lichtbron, die alles vlak maakt zodra je ernaar kijkt. |
| **Hoogteverloop** | 50% | Lage grond donkerder, hoge grond lichter, over het hoogtebereik van de grond: de vorm op grote schaal. |

De kop van het gedeelte toont de stand van de hoogtelijnen: *elke N m*, de afstand tussen de hoogtelijnen, of *geen hoogtelijnen* als de afstand uit staat.

## Grondoppervlak {#ground-surface}

| Regelaar | Standaard | Zichtbaar als | Betekenis |
|---|---|---|---|
| **Water** | aan | het niveau heeft water | Meren, rivieren en de zee, plat getekend in een bleek blauwgrijs: geen van de terreinsignalen geldt voor een oppervlak dat per definitie vlak is. |
| **Dekking water** | 60% | Water staat aan | De kustlijn en de grond onder de ondiepten schijnen door het doorschijnende water heen. |
| **Gronddriehoeken** | 30% (0 bij een niveau met textuur) | altijd | De eigen randen van het terrein, getekend over het beschaduwde oppervlak, die tussen 6% en 25% van de breedte van het niveau vanaf de camera uitdoven. Laat zien hoe grof de grond is bemonsterd en geeft een helling iets om afstand op te schatten. Wordt bij het eerste gebruik gemaakt, wat op een groot niveau even duurt. |
| **Grond alleen als draadmodel** | uit | altijd | Vervangt het terreinoppervlak door zijn randen. Volledig schematisch - ook de schaduw, de hoogtelijnen en de bedekking verdwijnen, dus *Gronddriehoeken* is meestal de betere keuze. |
| **Grondtextuur** | aan | het niveau heeft texturen | Tekent de grond in de texturen die het bestand bevat (asfalt, berm, gras). De verlichting van het oppervlaknet wordt er zacht bovenop toegepast, omdat de textuur zijn eigen fijne reliëf al bevat. **Helderheid** is de manier om hem onder de warmte stiller te zetten; Ontkleuren hoort bij kaartafbeeldingen. |
| **Vastgelegde kleur** | uit | het niveau heeft kleuren per hoekpunt | Schakeert de grond met de kleur die een scan heeft vastgelegd in plaats van grijs - een gereconstrueerde weg is anders niet te onderscheiden van de berm. Exports van engines bevatten die niet; als ze ontbreken, zegt het paneel *Dit niveau bevat geen kleur.* |

## Structuren {#structures}

De kop **Structuren** toont het aantal driehoeken van de structuren; de hint eronder zegt hoe ze worden getekend (*massief getekend in hun eigen texturen* of *als doorzichtige schil getekend zodat je de warmte erin ziet*) en hoeveel delen structuren zijn.

| Regelaar | Standaard | Betekenis |
|---|---|---|
| **Structuurtextuur** | aan als de structuren texturen dragen | Teken structuren massief, in hun eigen texturen. Aanzetten stelt de dekking van de vlakken op 100% en zet de randen uit; uitzetten keert terug naar de getinte doorzichtige schil op 25%. Een gestructureerde structuur wordt verlicht vanaf de kant die de camera ziet, omdat een bord twee vlakken rug aan rug is en het van de afronding afhangt welke de dieptetest wint. |
| **Draadmodelranden** | aan; uit boven 300.000 driehoeken van structuren of bij textuur | Ontdubbelde randen van de structuren, één lijn per rand. |
| **Dekking randen** | 50% | |
| **Schilvlakken** | aan | Een zwak oppervlak met een heldere Fresnel-rand, zodat een gebouw als volume leest in plaats van als kooi of mistbank. |
| **Dekking vlakken** | 25% (35% boven 300.000 driehoeken van structuren, 100% met textuur) | 0-60% op de baan, tot 100% met het handvat. Houd hem laag: massieve structuren verbergen de data erin. |
| **Scherpe randen** | aan (uit bij textuur) | Schaduwt elke driehoek naar zijn eigen normaal, berekend in de fragmentshader uit afgeleiden in schermruimte. Geëxporteerde niveaus zijn samengelast en dragen gemiddelde normalen, wat elke hoek van een doos afrondt tot "gesmolten folie"; elk hoekpunt splitsen om dat te verhelpen zou de buffer van hoekpunten vermenigvuldigen. Zet hem uit voor een niveau waarvan de gebogen oppervlakken belangrijker zijn dan de hoeken. |
| **Tint van structuren** | Cyaan | Een kleurkiezer en de presets **Cyaan**, **Amber**, **Violet**, **Wit**. |
| **Toon deelclassificatie (N)** | | Elk deel, zijn klasse en de reden; zie [3D-niveaus](model-levels.md#ground-structures-and-water). |

## Het niveau afsnijden {#cutting-the-level}

De [Doorsnede](slice.md) en, met *Ook het level afsnijden*, [afstandsculling](depth-and-culling.md#distance-culling) snijden de grond, structuren en het water af op dezelfde vlakken als de warmte.
