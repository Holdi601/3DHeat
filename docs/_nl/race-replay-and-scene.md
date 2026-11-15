---
title: "Replay en de 3D-scène"
parent: "Race-analyse"
nav_order: 52
lang: "nl"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Replay en de 3D-scène

Speel je rondes samen af, als een race, en kijk waar de ene auto voor de andere uit loopt. Alles wat je ziet in de 3D-weergave van het tabblad **Race-analyse** staat hier beschreven: de gereden lijnen, de kleuren op de baan, de auto's en de labels.

![Oorzakenkaart met de auto's opgesteld 40 m voor een bocht: gekleurde baan, twee auto's en de vlaggenpaal](../assets/img/en/race-replay-lined-up.webp)

## De replayklok {#the-replay-clock}

Eén klok stuurt elke ronde aan: seconden van de **referentie**-ronde. De engine verhoogt hem elk frame tijdens het afspelen (met de frametijd × de replaysnelheid); aan het eind gaat hij terug naar 0 als **Herhalen** aan staat, anders stopt hij. De klok hoort bewust niet in de opslag, zodat het zijpaneel niet bij elk frame opnieuw getekend wordt; de HUD en de grafieken volgen hem en worden hooguit één keer per frame bijgewerkt.

**De lengte van de replay** is de langste tijd die een ronde op de klok loopt: de rondetijd van elke ronde (min zijn verschuiving in *Opgesteld*), of de tijd van de referentie in *Naast elkaar*.

## De bedieningsbalk {#the-transport-bar}

Onder de weergave, van links naar rechts:

| Bedieningselement | Doet |
|---|---|
| ⏮ | terug naar het begin (ook **Home**) |
| ▶ / ❚❚ | afspelen / pauzeren (ook **K**) |
| snelheid | 0,25×, 0,5×, 1×, 2×, 4× |
| schuifregelaar | zet de klok direct, in stappen van 0,01 s |
| klok | `tijd / lengte · meters`: de klok als rondetijd, de lengte van de replay, en hoe ver de auto van de referentie langs de referentie is |
| *Vanaf de start* / *Opgesteld* / *Naast elkaar* | de replaymodus (hieronder) |
| **Hier opstellen** | zet elke auto waar de referentie nu is, en gaat vanaf daar verder |
| **Herhalen** | begint opnieuw aan het eind (standaard aan) |
| **Grafieken verbergen** / **Grafieken tonen** | de afstandsgrafieken onder de balk |

De knoppen zijn uitgeschakeld tot er rondes geladen zijn (één ronde is genoeg om hem af te spelen; vergelijkingen hebben er twee nodig).

## Replaymodi {#replay-modes}

Hoe de eigen tijd van elke ronde uit de klok volgt:

| Modus | Eigen tijd van elke ronde | Wat het toont |
|---|---|---|
| **Vanaf de start** (`start`) | de klok zelf | elke ronde vanaf zijn eigen start: een race onderling, met het verschil dat groeit zoals het op de baan deed |
| **Opgesteld** (`anchor`) | de klok plus de verschuiving van de ronde | elke auto op dezelfde plek op hetzelfde moment, daarna loslaten - wat er vanaf dat punt gebeurt, niet vanaf de start van de ronde |
| **Naast elkaar** (`locked`) | het tijdstip waarop de ronde de huidige afstand van de referentie bereikte | elke auto de hele ronde op de afstand van de referentie gehouden: snelheden en bediening meter voor meter vergeleken |

Gebruik het wanneer:

- **Vanaf de start**: je wilt zien wie voorligt en hoe het verschil groeit.
- **Opgesteld**: je wilt weten wat er in één bocht of op één rechtstuk gebeurt, met iedereen daar gelijk begonnen.
- **Naast elkaar**: je wilt vergelijken wat de bestuurders met pedalen en stuur op dezelfde plek op de baan doen.

**Verschuivingen in *Opgesteld*:** voor een ankerpunt op `s` meter langs de referentie is de verschuiving van elke ronde zijn eigen tijd op `s` min de tijd van de referentie op `s`, beide gelezen uit de uitgelijnde rondes (zie [één afstandsas](race-corner-analysis.md#one-distance-axis)). Een ronde die `s` niet bereikt, houdt verschuiving 0. Kiest u *Opgesteld* uit de modusknoppen, dan ligt het anker op de huidige afstand van de referentie.

Een witte paal met een vlag (14 m hoog) markeert het anker in de modus *Opgesteld*.

### Opstellen {#lining-up}

| Actie | Anker | Klok |
|---|---|---|
| **Hier opstellen** | waar de referentie nu is | ongewijzigd |
| Shift+klik op de grafieken | de aangeklikte meter | 1,5 s voordat de referentie hem bereikt |
| een bevinding in *Waar tijd te winnen is*, een genummerd label op de baan, een rij van *Bocht voor bocht* met een bevinding | 40 m voor waar de oorzaak van de bevinding begint | 1,5 s voor dat punt; daarna speelt hij af |
| een gebeurtenis bij wagenbeheersing, het label van een klap | 40 m voor de gebeurtenis | 1,5 s ervoor; daarna speelt hij af |
| een ronde in de baanstatistieken | als zijn bevinding of gebeurtenis | zoals hierboven, met die ronde in de focus |

Een bevinding bekijken kadert haar ook met de camera - een bol rond het midden van het bereik van de bevinding, met straal het grootste van 40 m en de helft van zijn lengte plus 30 m (60 m voor een gebeurtenis) - tenzij de camera een auto volgt.

### Volgcamera {#chase-camera}

⌖ in de lijst met rondes laat de camera die auto volgen: 2,5 + 4 × de grootte van de auto meter erachter en 0,9 + 1,1 × de grootte van de auto meter erboven, kijkend in zijn rijrichting, naar beneden gericht op de auto, en geleidelijk (20% van de weg elk frame), zodat hij niet bij elke schommeling trilt. ⌖ nogmaals laat hem los. De gevolgde auto wordt iets lichter getekend, met een witte ring op de grond, en zijn kaartje wordt gemarkeerd.

## De sectie Weergave {#the-view-section}

| Bedieningselement | Standaard | Doet |
|---|---|---|
| **Lijnen** / **Tijdkaart** / **Oorzakenkaart** / **Foutenkaart** | Tijdkaart | wat langs de baan geschilderd wordt (hieronder); *Lijnen* schildert niets |
| legenda | - | *wint ↔ verliest* voor de tijdkaart, de oorzaakkleuren voor de oorzakenkaart, *weinig rondes ↔ de meeste rondes* voor de foutenkaart |
| **Gereden lijnen** | aan | de lijn van elke zichtbare ronde in zijn kleur |
| **Auto's** | aan | de auto's, en de bronnen van de HUD-kaartjes |
| **Banden & ophanging** | aan | bandtemperatuur, slipringen, ophangingsstangen en andere symbolen per wiel, en dakverlichting op de auto's |
| **Labels** | aan | baannamen van bochten, genummerde labels, labels van klappen, de baannamen van de foutenkaart |
| **Baan uit de rondes** | aan | een wegoppervlak voor een baan zonder uitgepakt model (verborgen terwijl een banenmodel geladen is) |
| **Alle waarden op de kaartjes** | uit | elk kanaal dat op elk HUD-kaartje staat |
| **Echte autovormen** | aan | elke auto in de vorm van zijn tegenhanger (zie [De auto's](#the-cars)); uit: de open eenzitter, die niets van de telemetrie verbergt |
| **Autogrootte** | 1× | 1× tot 10× in stappen van 0,5; 1× is de echte grootte van de auto, zo lang en breed als in het spel. Alleen deze schuifregelaar verandert hem |

## Gereden lijnen {#driven-lines}

Het pad van elke zichtbare ronde door zijn eigen samples, in zijn kleur, getekend 0,12 m onder de opgenomen positie (de opgenomen positie van een auto is zijn referentiepunt, 0,28 tot 0,47 m boven de weg op uitgepakte Forza-banen). Elke 1,5 m wordt een punt bewaard; bij meer dan 10 zichtbare rondes houden de rondes die niet bekeken worden elke 6 m een punt (elk hoekpunt gaat elk frame naar de GPU).

## De kaarten {#the-maps}

Alle drie zijn linten langs het pad van de **referentie**, 0,2 m onder de opgenomen posities, één vierhoek per rasterstap van 2 m.

### Tijdkaart (`where`) {#time-map-where}

Voor de ronde in de focus: seconden gewonnen of verloren per meter ten opzichte van de ronde waarmee hij op dat punt vergeleken wordt (de beste van zijn klasse, of voor de referentie de snelste andere ronde door elk segment), uit de verandering van de uitgelijnde delta per rasterstap, geglad over ±10 m. Rood waar tijd verloren gaat, groen waar tijd gewonnen wordt, grijs daartussen; de kleurschaal is het 95e percentiel van de absolute waarden, zodat pieken worden afgesneden en het grootste deel van de ronde binnen het bereik valt. 6 m breed.

### Oorzakenkaart (`why`) {#cause-map-why}

Voor de ronde in de focus: elk verlies geschilderd over het bereik waar zijn **oorzaak** ligt (niet waar de tijd zichtbaar wordt), gekleurd naar de groep van de oorzaak; de duurste bevinding wint waar twee elkaar overlappen. Breedte `3 + 9·√(kosten / hoogste kosten)` meter; waar niets verloren werd, een grijze strook van 2 m. De bevinding die geselecteerd is in *Waar tijd te winnen is*, wordt wit geschilderd.

| Groep | Kleur | Bevindingen |
|---|---|---|
| remmen | oranje | verlies door rijstijl in de remfase |
| ingang | magenta | verlies door rijstijl bij het insturen en door het midden |
| uitgang | blauw | verlies door rijstijl bij de uitgang |
| recht stuk | geel | verlies door rijstijl op het rechte stuk |
| auto | grijs | wat de auto verklaart |
| omstandigheden | donkergrijs | de situatie (een race-start tegenover een vliegende ronde) |

### Foutenkaart {#mistake-map}

Hoeveel van alle rondes (van de klassen die gekozen zijn in de baanstatistieken) een fout maakten op elke meter - van elke soort, of alleen de soort die in de statistieken gekozen is. Elke ronde telt één keer per meter; het bereik van elke fout wordt aan beide kanten met 6 m verbreed, zodat een korte fout zichtbaar is. Breedte `3 + 10·(rondes / meeste rondes)` meter en een kleur van dof bruin tot helder oranje; grijs van 2 m waar geen ronde een fout maakte. Zie [Baanstatistieken](race-course-statistics.md#the-mistake-map).

## Baan uit de rondes {#track-from-the-laps}

Voor een spel waarvan de baan niet uitgepakt is, wordt een weg onder de lijnen getekend: even breed als de rondes zich over de referentie verspreiden (zijdelingse verschuivingen binnen 25 m tellen mee) plus 2 m aan elke kant, minstens 4 m aan elke kant van de referentielijn, geglad over ±8 rasterpunten (±16 m), in asfaltgrijs met lichte randlijnen, 0,3 m onder de opgenomen posities. Verborgen terwijl een banenmodel geladen is in **Niveau**.
## Klappen en botsingen op de baan {#hits-and-crashes-on-the-track}

Elke klap en botsing van elke zichtbare ronde (zie [Gebeurtenissen bij wagenbeheersing](race-control-events.md#hits-and-crashes)) wordt gemarkeerd waar hij gebeurde, zodra lijnen of auto's getekend worden: een ster met punten - rood voor een botsing, amber voor een klap - op een paal, met een ring in de kleur van de ronde aan de voet, op de grootte van de auto (botsingen groter). Zodra een auto het moment van een klap passeert, breidt er 0,8 s lang een schokring uit.

## Helpmodus {#help-mode}

**?** naast de taalkeuze, of de toets **?** of **F1**, zet een legenda aan voor elke kleur op het scherm, op alle drie de tabbladen ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). De keuze blijft in deze browser.

- **De legenda** in de hoek van de weergave toont de kleuren voor het tabblad en de modus die gebruikt worden. Elke kleurenreeks komt van waar de weergave hem vandaan haalt, dus een warmtekleurenreeks die je bewerkt hebt, wordt als bewerkt getoond. Op het racetabblad worden alleen de dingen getoond die de geladen rondes bevatten.
- **Het kaartje van elke auto** krijgt een tabel van wat op zijn wielen getekend wordt, op naam, met de waarde van elk wiel in de kleur waarin het getekend wordt.
- **De auto in de focus** krijgt bij elk wiel een label met hetzelfde, buiten bij de hoeken geplaatst. Verborgen als de auto op het scherm te klein is om ze te laten passen.

## De auto's {#the-cars}

**Elke auto in zijn eigen vorm**, in de kleur van zijn ronde en op zijn echte grootte. De vormen komen uit een autobestand, één keer gemaakt op de computer waarop het spel draait:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Zonder zo'n bestand wordt elke auto getekend als **de eigen auto van de viewer** van zijn soort en tijdperk: sedan, coupé, hatchback, stationwagen, sportwagen, supercar, muscle car, terreinwagen, pick-up, bestelwagen of microcar, elk als klassieker (voor 1980), uit de jaren 80 en 90, of modern ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Die worden hier gebouwd uit algemene verhoudingen: geen logo's, geen modelnamen en niets uit de bestanden van een spel, dus ze worden met de viewer meegeleverd. De soort komt uit de naam van de auto, het tijdperk uit het jaartal erin; een auto zonder beide wordt uit zijn klasse afgeleid. Van ongeveer honderd echte generaties zijn de gepubliceerde lengte, breedte, hoogte en wielbasis bekend ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); één regel per auto, afgerond), dus een 3 Serie uit de jaren 90 krijgt de grootte en houding van die auto, nog steeds als een gewone vorm zonder embleem of grill.

Het autobestand wordt gemaakt op je eigen computer, uit je eigen kopie van het spel. Het bevat een model met weinig detail van elke auto, ongeveer 900 driehoeken, met de posities van de wielen (zie [de opdracht `cars` van de extractor](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)).
**Autobestand laden...** in de weergave-instellingen, of het bestand op het racetabblad slepen, laadt het; het blijft in deze browser. Het bevat de vormen van het spel, dus het is niet iets om door te geven, en de viewer levert er geen mee.

Welke auto voor de auto van een ronde staat, wordt elke keer bepaald uit wat geladen is en nooit opgeslagen, dus een auto zonder tegenhanger vandaag krijgt zijn eigen zodra een nieuwer bestand die heeft ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Auto van de ronde | Getekend als |
|---|---|
| zijn nummer staat in het bestand voor hetzelfde spel | precies die auto |
| zelfde merk, en een woord van het model in de naam | dat model, het dichtst bij in jaren |
| zelfde merk, zelfde generatie | de auto van dat merk die het dichtst bij in jaren ligt |
| al het andere, met een autobestand | het dichtstbijzijnde van hetzelfde merk als er is, anders dezelfde carrosserievorm, het dichtst bij in jaren |
| een open-wielauto, aan zijn naam | de eenzitter hieronder |
| geen van de eerste twee, en de viewer kent de auto aan zijn grootte | de eigen auto van de viewer op de echte grootte van die auto, met of zonder bestand |
| al het andere zonder bestand | de eigen auto van de viewer van die soort en dat tijdperk |

Dus een ronde van de 3 Serie van BMW uit 1990 in een ander spel toont een BMW van ongeveer dat jaar, en een auto die nieuwer is dan het bestand toont zijn dichtstbijzijnde verwant tot het bestand opnieuw gemaakt wordt. De tooltip van een ronde, en de regel onder de autogrootte voor de ronde in de focus, zeggen hoe hij getekend wordt en hoe dicht dat bij ligt.

De eigen auto's van de viewer hebben donkere ramen. De modellen uit een autobestand zijn overal één kleur, omdat het bestand geen verf of glas heeft waarop het kan afgaan. De wielen, achterlichten, lampen en telemetriesymbolen hieronder worden getekend zoals op de eenzitter; de duwstang loopt langs de buitenkant van het wiel, waar hij te zien is, en de wishbones worden weggelaten.

**De eenzitter** is een open-wielauto in de kleur van de ronde, zodat de voorkant vanuit elke hoek duidelijk is en niets de wielen verbergt: de romp, de motorkap, de zijkanten, de cockpit met een helm, de halo, de bodem, de voor- en achtervleugel; vier ronde wielen, de voorwielen gedraaid door het stuur (tot 0,5 rad bij volle uitslag), elk op twee wishbones met een spindel, een stuurstang (voor) of aandrijfas (achter), en een duwstang. Het model wordt 0,3 m onder de opgenomen positie gelegd, zodat de wielen op de weg staan, en geschaald door **Autogrootte**.

**De carrosserie beweegt op haar veren**: als de ronde alle vier de veerwegen bevat, zakt elk hoekpunt met zijn veerweg (overdreven tot 0,12 m van volledige uitveer tot volledige indrukking, zodat het ook vanuit een volgcamera zichtbaar is), en zakt, kantelt en rolt de carrosserie op het vlak door de vier punten.

**Wat uit de telemetrie getekend wordt** (met *Banden & ophanging* aan) volgt de [kanaaltabel](race-charts-and-hud.md#the-channel-table):

| Symbool | Uit | Tekening |
|---|---|---|
| kleur van de band | `tireTemp` | de band zelf, van blauw koud → cyaan → groen werkend → geel → rood heet, over 40-130 °C |
| slipring | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (de grootste) | een ring op de grond onder het wiel, groen met grip over, amber bij 0,66, rood bij 1 (de rand van de grip zoals het spel die meldt); flauw onder 0,3 |
| ophangingsstaaf | `suspension` (0..1) | de duwstang gekleurd naar de veerweg: blauw uitgeveerd, wit in het midden, rood ingedrukt |
| remgloed | `brakeTemp` (100-900 °C) | een schijf op de buitenkant van het wiel, van donker naar oranje |
| slijtageband | `tireWear` (0..1) | een band rond de rand van het loopvlak, wit nieuw → rood versleten |
| belastingsbalk | `wheelLoad` (0-12 000 N) | een paal naast het wiel, zo hoog als de belasting |

Remlichten (regenlicht en de eindplaten van de vleugel) branden met het rempedaal. Elk kanaal `lamp` dat aan staat (boven de helft van zijn bereik) doet een lamp boven de luchtinlaat branden in zijn kleur: ABS in werking, tractiecontrole in werking, DRS, pitbegrenzer, handrem, in de lucht.

**In een drukte** (meer dan 10 zichtbare) worden de auto's die niet bekeken worden eenvoudig getekend: alleen carrosserie, vleugels, wielen en remlicht.

## Labels {#labels}

Vastgemaakt aan de baan en elk frame geplaatst volgens de projectie van de camera (buiten beeld of achter de camera: verborgen). Met **Labels** aan:

| Label | Waar | Klik |
|---|---|---|
| baannamen van bochten (`T1`, `T2` …) | boven het mikpunt van elke bocht op de referentie | - |
| genummerde labels 1-5 | de vijf grootste verliezen door rijstijl van de ronde in de focus, in het midden van het bereik van elke oorzaak, omlijnd in de kleur van de oorzaak; zweef erop voor titel en kosten | de bevinding opstellen en afspelen |
| labels van klappen en botsingen | boven elk moment van de **gefocuste** ronde: "Botsing −45 km/u" / "Klap −12 km/u"; zweef erop voor de volledige beschrijving en de tip | de klap of botsing opstellen en afspelen |
| labels van de foutenkaart (in plaats van de baannamen en labels, als de kaart de foutenkaart is) | het mikpunt van elke bocht: "T3 · 5/40 vroeg remmen" (de meest voorkomende fout, rondes die hem maakten / rondes die de bocht reden), "T3 · 5/40" als één soort gekozen is, "T3 · schoon" als geen; zweef erop voor de verliezen van de bocht en zijn vijf meest voorkomende fouten | die bocht openen of sluiten in de baanstatistieken |

## Gespiegelde werelden {#mirrored-worlds}

De wereld van de viewer is rechtshandig met Y omhoog: van bovenaf gezien draait een auto naar links als zijn rijrichting `atan2(dx, dz)` toeneemt. Een spel met een linkshandige wereld - Forza onder andere - komt gespiegeld binnen: elke rechter bocht wordt getekend als een linker bocht, baan en rondes samen.

De rondes zeggen het zelf ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): door elke ronde een paar meter (3 m) tegelijk te doorlopen, wordt het draaien van zijn pad vergeleken met de indrukking van de ophanging aan de buitenkant (`suspension.FR` min `suspension.FL`) en, zonder ophangingsdata, met het stuur (positief naar rechts in elke adapter). Een ronde die in totaal minder dan π draait, zegt niets; bewijs telt mee als het meer dan 2% van het draaien is. De rondes stemmen; bij een gelijke stand is het "kan niet zeggen".

Als het oordeel van de rondes niet overeenkomt met de huidige omkering van de assen (een oneven aantal omgekeerde assen in **Camera & scène → Wereldas omkeren**), zegt het deel **Rondes** dat onder de lijst:

- het spel is gespiegeld en er is niets omgekeerd: "Deze rondes sturen naar rechts waar de baan buigt naar links getekend …" met **X omkeren**;
- de assen zijn omgekeerd maar de rondes zijn niet gespiegeld: "De omgekeerde assen tekenen deze rondes gespiegeld …" met **Assen herstellen**.

Alleen de tekening verandert: een spiegeling in de view-matrix. De data, de analyse en elke coördinaat die de tools tonen, blijven van het spel zelf. De omkering blijft in de browser bewaard. De analyse benoemt bochten links of rechts met dezelfde meting (een onbekende wereld wordt als gespiegeld genomen, zoals die van Forza).

## Voor ontwikkelaars {#for-developers}

Code: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Wat een auto op een moment is {#what-a-car-is-at-a-moment}

`stateAt` interpoleert elk kanaal tussen de twee samples rond de tijd van de ronde. Kanalen die in stappen veranderen (versnelling, vlaggen) nemen het dichtstbijzijnde sample. Een ronde die klaar is, blijft op de finish staan.

**Koers.** De rijrichting komt uit posities een paar meter uit elkaar (minstens 2 m aan elke kant, zodat een schommeling de auto niet laat draaien). De richting van de carrosserie komt pas uit de gier van het spel als die op de rijrichting is ingepast - teken en offset, door een cirkelgemiddelde over samples sneller dan 10 m/s (minstens 20) - en alleen als hij dan ermee overeenkomt (cirkelvariantie onder 0,05, ongeveer 18° spreiding); anders wijst de carrosserie langs de rijrichting. Zo blijft een slide zichtbaar (carrosserie en rijrichting uit elkaar) zonder de hoekconventie van een spel te vertrouwen.

**Stuur en zijden.** In welke richting een positief stuur de auto draait, en aan welke kant de rechterwielen van het spel horen, worden uit de ronde gemeten: het stuur tegenover het draaien van het pad, en welke kant van de ophanging indrukt aan de buitenkant van bochten (zonder ophangingsdata worden Forza-spellen als gespiegeld genomen).
