---
title: "Grafieken en de HUD"
parent: "Race-analyse"
nav_order: 53
lang: "nl"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Grafieken en de HUD

Grafieken leggen je rondes meter voor meter naast elkaar, zodat je ziet waar de ene bestuurder later remde of eerder gas losliet. De kaarten linksboven in het beeld tonen wat elke auto en bestuurder op dit moment doet.

![Grafieken onder het beeld: rijen voor verschil, snelheid, gas, rem en stuur voor twee rondes, de tijd- en oorzaakstroken bovenaan, en de cursor met de kaarten](../assets/img/en/race-charts-rows.webp)

## De grafieken {#the-charts}

Elke ronde op één afstandsas - meters langs de referentie (zie
[één afstandsas](race-corner-analysis.md#one-distance-axis)) - zodat dezelfde x
voor elke ronde dezelfde plek op de baan is. Eén ronde wordt op zichzelf getekend
(en speelt af); een tweede ronde van dezelfde baan wordt ertegenover getekend.
Zonder geladen rondes (of als de analyse mislukte) staat in het vlak: "Grafieken
verschijnen zodra een ronde geladen is; laad nog een van dezelfde baan om de twee
te vergelijken."

### Wat erop staat {#what-is-on-them}

- **De legenda**: de kleur en het label van elke getekende ronde, de referentie
  gemarkeerd als "(referentie)"; "+N meer getekend, niet in de grafiek" als er meer
  rondes zichtbaar zijn dan er in de grafiek staan; **Grafieken (N) ▾**; **Hele
  ronde** als er ingezoomd is; een regel met een hint.
- **Twee stroken** bovenaan, voor de gefocuste ronde:
  - *tijd*: de [tijdkaart](race-replay-and-scene.md#time-map-where) als strook,
    rood verliezend, groen winnend;
  - *oorzaak*: elk van zijn verliezen als balk boven de plek van de oorzaak, in de
    kleur van de oorzaak; zweef over een balk voor de titel en de kosten.
- **Bochtbanden**: een gearceerde band van de ingang tot de uitgang van elke bocht
  (zoals gevonden op de referentie) en zijn naam (`T1` …) onder de as bij het apex.
- **De gekozen bevinding**: een band in haar oorzaakkleur over haar bereik.
- **De rijen** (grafieken), één per gekozen kanaal, elk met zijn naam en de boven-
  en onderkant van zijn bereik links, een nullijn waar het bereik door nul gaat.
  Elke ronde is een lijn in haar kleur: de gefocuste ronde 2 px breed en ondoorzichtig,
  de referentie ondoorzichtig, de andere 1,5 px op 75%. De verschilrij laat de
  referentie weg (die is met zichzelf nul).
- **De cursor**: een verticale lijn waar de referentieauto is (of waar de aanwijzer
  is), en een stip per auto op elke rij behalve het verschil - bij de cursor zit
  elke auto op dezelfde meter; anders de eigen afstand van elke auto op de klok
  van de replay.

Hoogstens **8** rondes staan in de grafiek: de gefocuste ronde, de beste van haar
klasse en de referentie eerst, dan de andere in laadvolgorde.

### Rijen en hun hoogte {#rows-and-their-heights}

De rijen delen de hoogte van de grafiek naar gewicht, geen kleiner dan 16 px:

| Rij | Gewicht |
|---|---|
| Verschil (met de referentie, seconden, met teken) | 1,7 |
| Snelheid (km/h) | 1,7 |
| een pedaal (gas, rem, koppeling) | 1 |
| stuur | 1,1 |
| versnelling | 0,8 |
| een lampje (handrem, ABS …) | 0,55 |
| al het andere | 1 |

Een kanaal met een vast weergavebereik in de tabel (pedalen 0-100%) gebruikt dat;
de andere worden op het zichtbare stuk van de rondes ingepast. Een rijnaam die te
lang is voor de ruimte (een lang woord in een andere taal) schuift de bovenste
waarde een regel omlaag waar de rij hoog genoeg is, en wordt met een puntjesrand
afgekapt waar dat niet kan; de volledige naam staat in de tooltip.

### De standaardgrafieken {#the-default-graphs}

Tot er grafieken gekozen zijn: het **verschil**, dan elk kanaal dat de tabel als
`graph` markeert en dat de rondes hebben - gas, rem, koppeling, handrem, stuur,
versnelling, snelheid - behalve dat een pedaal- of lampkanaal wordt weggelaten
tenzij een ronde het voorbij 0,02 beweegt (een koppeling die nooit ingetrapt
wordt, is geen grafiek). De volgorde is die van de tabel.

### De grafiekkiezer {#the-graph-picker}

**Grafieken (N) ▾** opent een paneel boven de knop:

- een filterveld (zoekt op de naam of het id van een kanaal);
- **Standaard** (terug naar de standaardset; de tooltip zegt hoeveel) en **Sluiten**;
- *Verschil met de referentie*, dan elk kanaal dat de getekende rondes hebben,
  gegroepeerd (beweging, invoer, motor, hulpmiddelen, banden, remmen, ophanging,
  wielen, overig, tijdmeting, positie), elk met een vinkje; een kanaal per wiel is
  één regel met een chip per wiel (VL, VR, AL, AR).

Aanvinken houdt de volgorde van de tabel, wat de volgorde van aanvinken ook is.
De keuze blijft tot **Standaard** of een herlading. Kanalen die de tabel niet kent,
worden aangeboden onder *overig*, genoemd naar hun eigen id ("brakeLinePress" →
"Brake line press").

### Zweven, wiel, zoomen, klikken {#hover-wheel-zoom-click}

| Invoer | Doet |
|---|---|
| zweven | elke auto, zijn kaart en zijn invoer schuiven naar die meter; een paal markeert het op de baan; een tabel toont de waarde van elke getekende ronde op elke rij daar (verschil als "ref" voor de referentie); boven de kaarten, "op N m - de cursor van de grafieken". Weggaan van het vlak geeft het weer over aan de replay |
| wiel | zet de replay stap voor stap langs de ronde, 1/200 van de zichtbare spanne per klik (Shift: 5×), en pauzeert de replay; ingezoomd volgt het beeld de cursor |
| Ctrl+wiel (Cmd+wiel) | zoomt de afstandsas rond de aanwijzer, 1,25× uit / 0,8× in per klik, nooit smaller dan 40 m; uitzoomen tot de hele ronde beëindigt het zoomen |
| zijwaarts wiel | verschuift terwijl ingezoomd (10% van de spanne per 100 eenheden scrollen) |
| dubbelklik, **Hele ronde** | uitzoomen |
| klik | springt de replay naar waar de referentie die meter bereikt |
| Shift+klik | zet de auto's daar op één lijn (zie [op één lijn zetten](race-replay-and-scene.md#lining-up)) |

De grafieken worden opnieuw getekend in de huidige taal als die verandert.

De hintregel in de legenda zegt kort hetzelfde: "Zweven: elke auto daar · wiel: stap langs de ronde · Ctrl+wiel: zoom · klik: spring · Shift+klik: op één lijn zetten".

## De autokaarten (HUD) {#the-car-cards-hud}

Linksboven in het beeld, een kaart per zichtbare ronde - hoogstens **6**, de eerste
zes zichtbare rondes in laadvolgorde - voor het moment waarop de replay (of de
cursor van de grafieken) staat.

**Kop:** de kleur en het label van de ronde; het live verschil - de tijd van deze
ronde om zijn huidige afstand te bereiken min de tijd van de referentie om
dezelfde afstand te bereiken, "+0,48 s" - of "referentie"; **⋯** om elke andere
waarde te tonen of te verbergen (hetzelfde als *Alle waarden op de kaarten*). De
kaart van de achtervolgde auto is gemarkeerd.

**De auto van bovenaf:** de carrosserie-omtrek in de kleur van de ronde met een
pijl aan de voorkant, vier banden (de voorwielen tot 28° gedraaid met het stuur),
elk gekleurd naar zijn temperatuur, met dezelfde symbolen als de 3D-auto, plat
getekend: slipring, veerstaaf, remgloed, slijtageband, belastingsbalk.

**Uitlezingen:** snelheid in km/h, de eigen tijd van de ronde, zijn afstand langs
de referentie.

**Invoer:**

- een stuurwiel dat meedraait met de stuurinvoer (volledig uitgeslagen getekend als
  180°), met het percentage eronder;
- een balk per pedaal, van links naar rechts zoals in een pedaalblok - koppeling,
  rem, gas - elk met zijn percentage en korte naam, in zijn kleur (alleen de pedalen
  die de ronde heeft);
- de versnelling (R voor achteruit, N voor neutraal);
- een klein lampje per aan/uit-kanaal dat de ronde heeft - handrem, ABS, TC, DRS,
  pitbegrenzer, in de lucht - dat in zijn kleur brandt terwijl het aan staat (boven
  de helft van zijn bereik);
- een uitlezing per niveaukanaal: remverdeling, ABS- en TC-instellingen, boost, brandstof.

**Het invoerspoor:** de laatste **6 seconden** van elk pedaal (één baan, elk in zijn
kleur) en het stuur (zijn eigen baan, gecentreerd), eindigend op dit moment - wat de
bestuurder deed op weg ernaartoe. Tot 160 punten.

**Alle waarden** (⋯ of *Alle waarden op de kaarten*): elke andere scalaire waarde die
de ronde op dit moment heeft, dan elk kanaal per wiel als vier waarden (VL VR AL AR),
genoemd naar de kanaaltabel of naar de eigen naam van het kanaal, gesorteerd per groep.

## Voor ontwikkelaars {#for-developers}

Code: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### De kanaaltabel {#the-channel-table}

`CHANNELS` in [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
is de ene plek waar een kanaal beschreven wordt: zijn eenheid, of het één waarde per
monster is of één per wiel (opgeslagen als `name.FL` …), zijn groep, een weergavebereik,
hoe het op de auto getekend wordt (`glyph`), hoe het op de kaart verschijnt (`input`:
`pedal`, `steering`, `gear`, `lamp`, `level`), of het een standaardgrafiek is, of het
stapsgewijs verspringt in plaats van overgaat (versnelling, vlaggen), en hoe het
getoond wordt (schaal, eenheid, cijfers). Labels en korte namen zijn berichten in elke
taal (`race.channel.<name>.label` / `.short`).

Kanalen met een tekening of een standaardgrafiek:

| Kanaal | Eenheid | Getekend als | Standaardgrafiek |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedaal (groen, rood, …), getoond in % | ja |
| `handbrake` | 0..1 | lampje | ja |
| `steer` | -1..1, rechts positief | stuurwiel | ja |
| `gear` | - | versnelling | ja |
| `speed` | m/s, getoond km/h | - | ja |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampje | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | niveau-uitlezing | - |
| `tireTemp` (per wiel) | °C, weergave 40-130 | bandkleur | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (per wiel) | zoals het spel schaalt, weergave ±1,5 | slipring | - |
| `combinedSlip`, `slipIndex` (per wiel) | weergave 0-1,5, 0-1 | slipring | - |
| `suspension` (per wiel) | 0..1 | veerstaaf | - |
| `brakeTemp` (per wiel) | °C, weergave 100-900 | remgloed | - |
| `tireWear` (per wiel) | 0..1 | slijtageband | - |
| `wheelLoad` (per wiel) | N, weergave 0-12 000 | belastingsbalk | - |

Andere kanalen in de tabel (in grafiek en lijst, niet getekend): `latAcc`, `longAcc`,
`vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`, `vertVel`,
`bodySlip` (driftoek), `loose`, `lateral` (afwijking van de referentie), `rpm`,
`power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`,
`discLife`, `suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, plus `time`, `distance`,
`x`, `y`, `z`.

**Een kanaal dat niet in de tabel staat** wordt nog steeds gelezen, in een grafiek
getoond (onder *overig*) en op de kaarten, met een label uit zijn eigen naam. **Om het
een goede naam, eenheid en tekening te geven**, voeg je één regel toe aan de tabel (en
zijn labelbericht aan elk `src/i18n/locales/<taal>/race-channels.json`). Een nieuw
*soort* wieltekening is één regel in `WHEEL_GLYPHS` (glyph.ts) en zijn platte tegenhanger
`CARD_GLYPHS` (RaceHud.tsx); beide zijn getypt op de soort, dus de build faalt tot beide
bestaan. `src/race/extensible.test.ts` controleert dat onbekende kanalen de grafieken
bereiken, dat elk symbool in de tabel getekend kan worden en dat lampjes oplichten.
