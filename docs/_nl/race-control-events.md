---
title: "Gebeurtenissen bij wagenbeheersing"
parent: "Race-analyse"
nav_order: 54
lang: "nl"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Gebeurtenissen bij wagenbeheersing

De viewer kijkt hoe elke ronde gereden is, en markeert waar de bestuurder de auto liet slippen, draaien, ergens tegenaan ging of grip verspilde. Dat is nuttig, want een fout die tijd kostte, is het snelst te verbeteren.

![Het gedeelte Autobeheersing: hoe vaak elke ronde een wiel blokkeerde, draaide of naar buiten duwde, en de lijst van fouten met één geopend](../assets/img/en/race-control-table.webp)

## In gewone woorden {#in-plain-words}

- **Blokkeren**: je remt zo hard dat een wiel stopt met draaien en schuift. De auto remt slechter en kan niet meer sturen.
- **Wielspin**: je trapt het gas zo diep in dat de aangedreven wielen sneller draaien dan de auto rijdt. Je verliest trekkracht.
- **Overstuur**: de achterkant van de auto schuift wijd weg. Draait hij helemaal rond, dan is dat een **spin**.
- **Onderstuur**: de voorkant van de auto schuift wijd weg ("duwen"); meer aan het stuur draaien helpt niet.
- **Contact** en **neerstorting**: de auto raakte iets (een contact is een tik of schaafwond, een neerstorting is een hard ding).
- **ABS**, **TC**: de eigen hulpsystemen van de auto, die tegen blokkeren en wielspin werken. Het zijn geen fouten.

## Het gedeelte Autobeheersing (wat je ziet) {#the-car-control-section-what-you-see}

Voor de gekozen ronde, met wat de rondes ook bevatten. Zonder bandenslip en zonder slipshoek toont het wat nog gevonden kan worden, in plaats van niets (hieronder).

**De tabel**: één rij per soort die een van beide rondes laat zien: Geblokkeerde wielen, Wielspin, Achterkant schuift weg (overstuur en spins), Naar buiten duwen (onderstuur), Neerstortingen, Contacten, ABS actief, Tractiecontrole actief, Handrem, In de lucht. Elke cel is "aantal · seconden", voor de gekozen ronde en de ronde waarmee die wordt vergeleken. En *Grootste slipshoek* als er een slipshoek is (de grootste op het asfalt).

**De lijst**: de niet-gedeelde fouten die minstens 0,02 s kosten, de duurste eerst, hoogstens 12, elk met zijn titel en kosten (en het label van zijn soort). Klik op een fout om de tip te lezen, de auto's 40 m ervoor naast elkaar te zetten, en de fout af te spelen. **Ook wat beide rondes daar deden** voegt elke fout toe, ook de gedeelde (label "beide deden het", kosten "—" onder 0,01 s). Zonder fouten: "Niets wat X met de banden deed, kostte tijd dat Y niet ook deed."

**De hint eronder** zegt waarmee de detectie kon kijken: "Uit de slip en de slipshoek van elk wiel, en de slipshoek van de auto." (of slip en slipshoek, slip en slipshoek van de auto, alleen slip, of "Alleen uit de slipshoek van de auto - deze rondes bevatten geen bandenslip."). Ook noemt hij de ondergrond waarvoor de grenzen zijn gemeten (asfalt, los, gemengd: boven 80% losse samples is het los, onder 20% asfalt), tegen welke ronde de gebeurtenissen zijn gelegd, en hoe de kosten worden geteld.

Bij **geen bandenslip en geen slipshoek** (een FH Companion-rondebestand zonder zijn telemetrie) worden de tabel en de lijst toch getoond, en zegt de hint wat er nog gevonden kon worden uit wat de rondes bevatten: "Deze rondes bevatten geen bandenslip en geen slipshoek, dus blokkeren en wielspin kunnen niet worden vastgesteld. Wel gevonden: naar buiten duwen, uit het stuur ten opzichte van het pad; contacten en neerstortingen, uit de snelheid en versnelling." Slippen uit de giersnelheid worden ook genoemd waar de rondes die hebben; naar buiten duwen alleen waar ze stuurdata hebben. De zin over de slip- en slipgrenzen valt weg, en een tweede hint zegt: "Kies voor Forza Horizon ook het bestand `.tele.gz` naast elk FH Companion-rondebestand: dat is de volledige telemetrie, de slip van elk wiel 64 keer per seconde."

De **totale** kosten van wagenbeheersing van een ronde (gebruikt in samenvattingen) tellen overlappende fouten - een blokkering en de slip die ermee begint, binnen 40 m - één keer, tegen de duurste van het cluster.

## Hoe het wordt gedetecteerd {#how-it-is-detected}

De rest van deze pagina is het regelboek: elke soort, elke drempel.

Code: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
De redenering en de literatuur staan in [de methode](race-analytics.md).

## De soorten {#the-kinds}

| Soort | Tabelrij | Een fout? | Kortste die telt |
|---|---|---|---|
| `lock` | Geblokkeerde wielen | ja | 0,1 s |
| `wheelspin` | Wielspin | ja | 0,15 s |
| `oversteer` | Achterkant schuift weg | ja | 0,2 s |
| `spin` | (geteld bij Achterkant schuift weg) | ja | 0,1 s |
| `understeer` | Naar buiten duwen | ja | 0,25 s |
| `crash` | Neerstortingen | ja | - |
| `hit` | Contacten | ja | - |
| `abs` | ABS actief | nee | 0,2 s |
| `tc` | Tractiecontrole actief | nee | 0,2 s |
| `handbrake` | Handrem | nee | 0,1 s |
| `airborne` | In de lucht | nee | 0,15 s |

Kortere reeksen zijn ruis (een stoeprand, een hobbel, één sample). Reeksen van rasterpunten (elke 2 m) die een test halen, worden samengevoegd over gaten van hoogstens 2 punten. Alleen **fouten** kunnen een vergissing zijn en hebben kosten; de andere zijn wat de auto en de bestuurder deden.

## Wat elke toets nodig heeft {#what-every-test-needs}

### Afgeleide kanalen {#derived-channels}

Voordat iets beoordeeld wordt, krijgt elke ronde wat het spel niet stuurt, onder kanonieke namen (een eigen waarde van het spel wint altijd):

| Kanaal | Uit |
|---|---|
| `bodySlip` (slipshoek) | de snelheid in het kader van de auto, `atan2(latVel, abs(longVel))`, waar het spel die stuurt (0 onder 3 m/s); anders de koers (de gier van het spel, gepast op de rijrichting naar teken en offset over samples sneller dan 10 m/s, alleen vertrouwd bij een circulaire variantie onder 0,05) tegen de rijrichting (posities minstens 2 m uit elkaar), bij snelheden boven 3 m/s |
| `yawRate` | de verandering van `yaw` in de tijd, waar wel een koers is maar geen snelheid |
| `airborne` | het contact met de grond van elk wiel uit (≤ 0,5); anders de belasting van elk wiel onder 5% van zijn mediaan; anders elke vering op of onder 0,02 (volledig uitgeveerd). Eén losse sample is geen vlucht |
| `slipRatio.<W>` | `(oppervlaktesnelheid van het wiel - snelheid van de auto) / snelheid van de auto` boven 3 m/s, waar het spel de oppervlaktesnelheid van de wielen stuurt; of uit de draaiing van het wiel × een rolstraal gemeten op de ronde - de mediaan van `snelheid / draaiing` tijdens rechtdoor rollen (snelheid > 10 m/s, gas < 0,3, rem < 0,05, abs(langsversnelling) < 3 m/s², niet in de lucht; elk sample boven 10 m/s als er minder dan 20 zijn), geaccepteerd tussen 0,1 en 1 m. Gemarkeerd als `physical` |
| `loose` | het trillen van het oppervlak van Forza op minstens 2 wielen (> 0,001) gedurende minstens 0,33 s (een stoeprand is korter), gaten onder 1 s overbrugd |

### Op de grond en gesetteld {#on-the-ground-and-settled}

Niets wordt beoordeeld in de lucht of **0,3 s na een landing**. De vering slaat dan door en de versnellingen schieten omhoog, en dat is geen grip, remmen of aandrijving. Een sample moet ook **bewegen**: sneller dan 5 m/s.

### De ondergrond {#the-ground}

De ondergrond van elk sample is **los** waar het kanaal `loose` van de ronde dat zegt (het trillen van het oppervlak van Forza, de wielmaterialen van Trackmania), anders het oppervlak van de ronde (zie [discipline en oppervlak](race-loading-laps.md#discipline-and-surface)): asfalt, of los voor al het andere. Curven, slipgewoonten en drempels worden voor asfalt en losse ondergrond apart gehouden.

### Slip, als veelvoud van de nominale piek van de band {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Spellen schalen slip anders. `meta.slip` zegt hoe, en elke slip wordt gedeeld door een schaal zodat ongeveer 1 de nominale piek van de band is:

| `meta.slip` | Betekenis | Gedeeld door |
|---|---|---|
| `peak` | door het spel genormaliseerd: na 1 is grip verloren (Forza Data Out) | 1 |
| `scaled` | fysieke slip gedeeld door een piek op asfalt (de recorder van Kunos) | de nominale piek van de ondergrond gedeeld door die op asfalt |
| `index` | een slipmaat van 0..1 (SlipCoef van Trackmania) | 0,5 |
| `physical` (of onbekend) | slipverhouding als breuk, slipshoek in radialen | de nominale piek van de ondergrond |

Nominale pieken, als er niets beters bekend is:

| Ondergrond | Slipverhouding | Slipshoek |
|---|---|---|
| asfalt | 0,12 | 8° |
| gemengd | 0,18 | 12° |
| los (grind) | 0,25 | 15° |
| sneeuw | 0,25 | 15° |
| ijs | 0,10 | 6° |

### Waar grip eindigt: de bandencurven van elke auto {#where-grip-ends-each-cars-tyre-curves}

Waar een band niet meer grip geeft, wordt **per auto gemeten**, uit elke geladen ronde ervan (`measureTyres`), apart voor asfalt en losse ondergrond:

| Curve | Samples (snelheid > 10 m/s, gesetteld, versnellingen onder 45 m/s²) | Slip (x) | Kracht (y) |
|---|---|---|---|
| remmen | rem > 0,3, handrem ≤ 0,2, rechtdoor rijdend (zijdelings onder 30% van het hardst) | abs(gemiddelde slipverhouding van de vier wielen) | vertraging |
| trekkracht | gas > 0,8, rem ≤ 0,05, rechtdoor, de volle-gastrekkracht van de auto bij die snelheid > 0,5 m/s² | de slipverhouding van het zwaarst aangedreven wiel | versnelling als aandeel van die trekkracht |
| voor | zijdelings boven 30% van het hardst, de grip van de auto bij die snelheid > 1 m/s² | de grootste slipshoek voor | zijdelingse versnelling als aandeel van die grip |
| achter | hetzelfde | de grootste slipshoek achter | hetzelfde |

"Het hardst" is het 99e percentiel van de abs(zijdelingse versnelling) van de ronde op die ondergrond (alle ondergrond als die minder dan 50 samples heeft). De aandrijflijn bepaalt de aangedreven wielen (voorwielaandrijving: voor, achterwielaandrijving: achter, vierwielaandrijving: alle; onbekend: alle).

Vanaf minstens **150 samples** wordt de slip in 6 tot 14 gelijke-aantalbakken verdeeld (één per 40 samples). De kracht van elke bak is het bovenste kwartiel (wat de band gaf toen de bestuurder erom vroeg), uitgevlakt over de naburige bakken. De **beste** is de bak met de meeste kracht; de **grens** is de eerste bak erna waarbij de kracht met **8%** is gedaald. Een curve die in de data nooit daalt, heeft geen grens (oneindig): voorbij de "piek" kost niets in dat spel, en slip alleen markeert daar niets (de curven van bochten en trekkracht van Forza Horizon zijn zo). Met te weinig samples op de ene ondergrond worden die van de andere gebruikt; met te weinig in totaal de **nominale** grens: 1,5 keer de nominale piek.

Elke auto krijgt ook:

- zijn **slipgewoonte**: het bovenste kwartiel van zijn slipshoek waar hij bocht op 60% van zijn hardst of meer (vereist 100 samples);
- zijn **stuurgedrag per kromming** (`steerGain`), per band van 5 m/s: de mediaan van abs(stuur) / kromming van het pad tijdens stevig bochten maar ruim binnen zijn grip (30-60% van zijn hardst, kromming krapper dan een straal van 400 m, stuur boven 0,02; 25 samples per band). De kromming van het pad is de giersnelheid gedeeld door de snelheid waar het spel een giersnelheid stuurt, anders uit de posities ±5 m.

## Detectie, soort voor soort {#detection-kind-by-kind}

| Soort | Toets (op bewegende, gesetteld samples) | `peak` en `limit` |
|---|---|---|
| **lock** | rem > 0,05, handrem niet boven 0,2, en de slipverhouding van een wiel onder min de remgrens | de meest negatieve slip (veelvouden van de nominale piek); de grens als negatief |
| **wielspin** | gas > 0,2 (of geen gaskanaal), en de slipverhouding van een aangedreven wiel boven de tractiegrens | de grootste aangedreven slip; de grens |
| **overstuur** (slipshoek van de auto) | de slipshoek van de auto boven het grootste van de vloer van de ondergrond en 1,5 × de slipgewoonte van de auto daar | de grootste slipshoek, radialen |
| **overstuur** (slipshoeken van de banden, geen slipshoek van de auto) | de grootste slipshoek achter boven de achtergrens en meer dan 0,25 boven de grootste voorste | de slipshoek achter (veelvouden van de piek) |
| **overstuur** (geen slipshoek van de auto, maar giersnelheid en zijdelingse versnelling) | de "houdingssnelheid" - abs(giersnelheid) min abs(zijdelingse versnelling) / snelheid, boven 8 m/s - boven 0,2 rad/s, met het stuur tegen de bocht in | rad/s; grens 0,2 |
| **spin** | een reeks overstuur waarvan de slipshoek boven **60°** piekte | als overstuur |
| **onderstuur** (slipshoeken) | niet slippend, de grootste slipshoek voor boven de voorste grens en meer dan 0,3 boven die achter | de slipshoek voor; de grens |
| **onderstuur** (geen slipshoeken) | sneller dan 12 m/s, niet slippend, niet tegenstuurd, zijdelingse versnelling boven de helft van het hardst van de ronde (99e percentiel), pad krapper dan een straal van 300 m, en stuur meer dan **1,6 keer** wat het eigen stuurgedrag per kromming van de auto zegt dat het pad nodig had | keer het nodige stuur; grens 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` boven 0,5 | - |
| **handbrake** | `handbrake` boven 0,2 | - |
| **airborne** | `airborne` boven 0,5 | - |
| **contact**, **neerstorting** | zie [Contacten en neerstortingen](#hits-and-crashes) | snelheid die de klap kostte |

Slipshoek-drempels per ondergrond: asfalt **7°**, gemengd **10°**, los en sneeuw **15°**, ijs **10°**. Een auto die vanzelfsprekend meer slipt - een arcade-bandenmodel, een grind-specialist - krijgt een eigen, hogere drempel uit zijn eigen rondes (1,5 × zijn gewoonte).

**Welke kant de auto op draait** (voor "tegen de bocht in"): de verandering van de koers van het eigen pad van de ronde over ±6 m (minstens 2 rasterpunten); krapper dan een straal van 600 m telt als bochten; rechts of links naargelang de wereld gespiegeld is. Het stuur is **tegen** de bocht in wanneer abs(stuur) > 0,05 en het teken tegengesteld is aan de bocht: een slip die **wordt opgevangen** met tegenstuur.

**De pedalen toen het begon** (`pedal`): *remmen* wanneer de rem boven 0,1 is; *gas* boven 0,3; *los* wanneer het gas in de 8 rasterpunten (16 m) ervoor boven 0,5 was; anders *uitrollen* (of zonder gaskanaal).

## Gelegd naast de andere ronde {#laid-against-the-other-lap}

Elke gebeurtenis wordt beoordeeld tegen de ronde waarmee de gekozen ronde in dat segment wordt vergeleken (de beste van zijn klasse; voor die ronde zelf wie van zijn klasse het snelst door het segment ging):

1. **Hoe ver de andere ronde ging** over dezelfde meters, ±8 m: de eigen gebeurtenissen van de andere ronde van dezelfde familie (een spin telt als overstuur, een neerstorting als contact), gemeten in dezelfde eenheden, zonder drempels, met de bandencurven van de andere auto.
2. **Gedeeld** wanneer de andere ronde **80%** of meer zo ver ging: zo wordt de bocht gereden, geen vergissing. Soorten die geen fout zijn, zijn altijd "gedeeld".
3. **Kosten**, voor een niet-gedeelde fout: de tijd die deze ronde verloor tegenover de andere, van 5 m voor de gebeurtenis tot **40 m erna** (bij een contact of neerstorting tot de auto zijn snelheid terug heeft: de meters om die te herwinnen met zijn eigen trekkracht, 40 tot 400 m; zonder gemeten trekkracht 5 m/s²). Nooit negatief.
4. **Weggegeven snelheid** tot de grens van de auto: bij een blokkering de vertraging die de auto bij die snelheid kan halen min wat hij deed, opgeteld over de gebeurtenis; bij wielspin zijn volle-gastrekkracht min wat hij deed; bij een klap de snelheid die hij kostte. Genoemd wanneer boven 0,5 m/s (1,8 km/h).

Een fout die niet gedeeld is en minstens **0,02 s** kostte, wordt vermeld ([de rondestatistieken](race-course-statistics.md) tellen alleen fouten van **0,03 s** of meer, zodat een vergissing die over veel rondes wordt geteld een duidelijke is), en kan de oorzaak worden van het verlies van een bocht (zie [Bocht-voor-bocht-analyse](race-corner-analysis.md#car-control-faults-and-impacts)).

## Contacten en neerstortingen {#hits-and-crashes}

`impacts.ts` leest contacten uit de **eigen samples** van de ronde, voordat ze opnieuw worden bemonsterd. Een contact is in honderdsten van een seconde voorbij. Banden kunnen de krachten van een contact niet voortbrengen, dus een contact wordt gemeten tegen de eigen auto van de ronde:

- **Zijn grip `G`**: het 99e percentiel van zijn horizontale versnelling `√(lat² + long²)` over de ronde, op de grond en sneller dan 5 m/s. Zonder versnellingskanalen (of onder 3 m/s²): 15 m/s², de grip van een wegauto.
- **Drempel**: `max(1,8 G, G + 18, 30)` m/s².
- **Geraakt sample**: de horizontale versnelling boven de drempel *en* springend meer dan de helft van `G` ten opzichte van het vorige sample; **of** de snelheid die binnen 0,1 s daalt met meer dan de drempel zou kosten in 0,1 s plus 1,5 m/s. Alleen op de grond en gesetteld, en alleen als de auto sneller was dan 5 m/s.
- Geraakte samples binnen **0,4 s** zijn één contact.
- **Voor / na**: de hoogste snelheid in de 0,15 s ervoor; de laagste tot 0,3 s na het laatste geraakte sample.
- **Geen contact**: snelheid weg zonder kracht erachter. De piek horizontale versnelling binnen 0,1 s onder het grootste van `G` en 25 m/s² is het spel dat de auto terugspoelt of reset.
- **Neerstorting** wanneer het **30 km/h** of meer kostte, of de auto minder dan de helft van zijn snelheid liet; anders **contact**: een tik, een schaafwond langs een muur.
- **Richting**: de langsversnelling groter dan de zijdelingse en negatief: *frontaal*; positief: *van achteren*; de zijdelingse groter: *langs de zijkant*. Zonder versnellingen: frontaal.

Wat een auto kan, wordt gemeten met elk contact weggelaten, van 0,1 s ervoor tot 1 s erna (`struckMask`).

## De teksten {#the-texts}

Elke gebeurtenis wordt gezegd met beide rondes erbij genoemd, met waar (meters langs de referentie), de snelheid waarmee ze begon, hoe ver over de grens tegenover de andere ronde, en een tip. De tip volgt uit de soort en wat er gemeten is:

| Gebeurtenis | Tip |
|---|---|
| blokkering, alleen voor | een geblokkeerd voorwiel kan niet sturen: minder druk bovenaan de zone, laat hem wegvloeien de bocht in |
| blokkering, alleen achter | een geblokkeerd achterwiel laat de auto draaien: rem meer in een rechte lijn, laat los wanneer je instuurt; verschuif de remverdeling naar voren als het blijft gebeuren |
| blokkering, losse ondergrond | een geblokkeerd wiel ploegt door: knijp tot net voor het blokkeren |
| blokkering, overig | te veel pedaal voor de grip: knijp geleidelijker |
| wielspin | geef het gas toe terwijl het stuur ontspant; schakel kort waar de trekkracht begrensd is (op losse ondergrond verzacht een hogere versnelling het koppel) |
| spin / overstuur | naar het pedaal: onder het remmen (te hard trailbraken, te vroeg terugschakelen), losgelaten (overstuur bij loslaten: houd het gas gelijkmatig), op het gas (te veel terwijl je nog gedraaid bent), geen van beide (te snel ingestuurd); "opgevangen met tegenstuur" wanneer er tegengestuurd werd; op losse ondergrond of in een rally: "een zekere hoek is de snelle weg - de andere run had genoeg" |
| onderstuur | meer stuur helpt niet zodra de voorkant is weggegaan: kom langzamer aan, trail een beetje rem om de voorkant te belasten, ontspan; op losse ondergrond draai je de auto met loslaten of een tik met links |
| contact / neerstorting | langs de zijkant: een meter marge kost minder dan de schaafwond; van achteren: een andere auto of achteruit glijden; een frontale neerstorting: rem eerder; een tik aan de voorkant: iets geraakt. "X raakte daar ook." wanneer gedeeld |

In Trackmania zegt een slip ook: onder ongeveer **400 km/h** (**300** op losse ondergrond: zand, gras, plastic) geeft een slip minder aandrijving dan grip; daarboven wint een speedslide onder de juiste hoek, en deze kostte tijd, dus zijn hoek klopte niet.

## Wat elke bron toelaat {#what-each-source-allows}

| Rondes bevatten | Blokkeren / wielspin | Overstuur / spin | Onderstuur |
|---|---|---|---|
| slipverhouding en slipshoek per wiel, snelheid van de auto (Forza Data Out, de AC-spellen) | uit slip | uit de slipshoek van de auto, of de slipshoek achter | uit slipshoeken |
| wielsnelheden, wereldsnelheid (rallyspellen, BeamNG) | uit afgeleide slip | uit afgeleide slipshoek van de auto | uit stuurgedrag per kromming |
| gier en giersnelheid, geen slip (iRacing) | - | uit de slipshoek van de auto (de gepaste gier tegen de rijrichting); uit de houdingssnelheid met tegenstuur alleen wanneer de gier niet vertrouwd kan worden | uit stuurgedrag per kromming |
| alleen koers | - | uit koers tegen rijrichting | uit stuurgedrag per kromming |
| alleen een FH Companion-rondebestand (geen gier, geen slip) | - | - | uit stuurgedrag per kromming (er is stuur en versnelling) |

Contacten en neerstortingen hebben alleen snelheid nodig (beter met versnellingen), dus elke bron heeft ze. Het gedeelte **Autobeheersing** toont wat elke bron toelaat: met alleen een FH Companion-rondebestand zijn dat het naar buiten duwen uit het stuur en de contacten, plus de hint om het `.tele.gz` te laden voor de rest.
