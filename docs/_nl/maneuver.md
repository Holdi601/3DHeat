---
title: "Manoeuvres"
parent: "Inzichten"
nav_order: 4
lang: "nl"
source: "maneuver.md"
source_hash: "2160eca678e0"
translated: true
outdated: false
---

# Manoeuvres: hoe groepen bewegen

**Inzichten → Manoeuvres** volgt hoe de eenheden van elke kant *als groep* bewegen
en noemt de manoeuvres die ze maken - een flankaanval, een tang, een doorbraak,
een hinderlaag, een terugtrekking, een raketverdediging, de T oversteken - elk
met hoe zeker het is, de cijfers erachter, of het loonde, en de parallellen in
doctrine en geschiedenis. **Massa-analyse → Manoeuvres** telt ze over
duizenden matches: hoe vaak elke manoeuvre per kaart, modus en kant wordt
gemaakt, en hoe vaak ze loont.

Alles wordt in je browser berekend, in een eigen worker
(`src/insights/maneuver`); een match met een paar honderd eenheden duurt
10-500 ms, een twee uur durende luchtoorlog met duizenden objecten ongeveer
een seconde.

## Gebruik {#using-it}

- Open **Inzichten**, tabblad **Manoeuvres**. Het telt bij het eerste openen;
  **Opnieuw zoeken** na het wijzigen van filters.
- **Zeker / Waarschijnlijk / Mogelijk** zet de getoonde zekerheid
  (standaard Waarschijnlijk).
- De **tijdlijn** heeft een baan per kant en een balk per manoeuvre; de
  **lijst** eronder toont hetzelfde, op tijd. Een klik schakelt over naar de
  replay bij het begin ervan, vliegt de camera daarheen en tekent hem in 3D:
  de weg van elke groep als pijl (de twee armen van een tang zijn twee bogen),
  de omtrekken van de groepen op het sleutelmoment (de vijand in de kleur van
  zijn kant), het front van de vijand als witte lijn. **Alle in 3D tekenen**
  voegt de andere manoeuvres van de match toe, zwak. De lijnen gaan één keer
  naar de grafische kaart, wanneer de keuze verandert, niet elk beeld: met
  480 manoeuvres die tijdens het afspelen getekend worden, zijn de beeldtijden
  op een echte GPU (WebGL2 en WebGPU, p99 18,0-18,5 ms, max 19,5-20,8 ms)
  gelijk aan die zonder.
- Een geopende manoeuvre toont zijn uitkomst (kills en verliezen van de
  eenheden die hem maakten, terwijl hij liep en er vlak na, tegenover de ruil
  van de kant over de match), zijn bewijs, en de items uit de kennisbank
  erover - de doctrine en de historische parallellen (Cannae voor een tang,
  Sedan 1940 voor een doorbraak, Tsushima voor de T oversteken, Operatie Bolo
  voor een schijnaanval...).
- De kleine tabel aan het eind: per soort en kant, gemaakt en loonde.

![Een tang op de synthetische demomatch: de pijlen van beide armen, het vijandelijke lichaam en zijn front](../assets/img/en/maneuvers.webp)

## Hoe groepen gevonden worden {#how-groups-are-found}

Elke eenheid wordt op een gemeenschappelijke tijdlijn gezet (een stap van 1 s
te voet, anders 2 s, langer voor zeer grote bestanden), en stil gehouden bij
een dood, zodat een herspawn geen lijn over de kaart trekt. Bij elke stap
worden de eenheden van een kant en een soort (vliegtuigen, voertuigen,
schepen, infanterie) aan elkaar gekoppeld als ze dicht bij elkaar zijn - 18 m
te voet, 170 m voor voertuigen, 3 km voor schepen, 5 km voor vliegtuigen - en
gelijk bewegen (snelheden binnen de helft van de snelste, of allebei stilstaand).
Een cluster houdt het id van de groep waar de meeste leden in zaten.
Een eenheid zonder klasse wordt te voet, in een voertuig of in de lucht gezet
op basis van haar snelheid.

De **vorm** van een groep wordt gelezen ten opzichte van haar richting: een
colonne of een linie aan de hand van de spreiding langs en dwars, een wig
waar het midden voorop loopt, een echelon waar de leden naar één kant
achteruitstappen, een vierkant waar ze de hoeken bezetten.

Alles wordt beoordeeld op de eigen schaal van de match: de **gevechtsafstand** `R`
is het 75e percentiel van de afstand tussen een doder en zijn slachtoffer
(begrensd door de zin van het domein), en de tijden van een manoeuvre schalen
mee met de soort eenheid (infanterie een derde van die op de grond).

## Wat er gevonden wordt {#what-it-finds}

| Manoeuvre | Gevonden als |
|---|---|
| Formatie | een groep houdt 30 s lang één vorm op 60% van haar bewegende stappen |
| Frontale aanval | een groep sluit van buiten gevechtsafstand tot contact, ¾ R of meer, binnen 35° van de richting waarin de vijand kijkt |
| Flankaanval | hetzelfde vanuit 50-130° (de achterkant voorbij dat); zeker alleen met een eigen *vastzettende macht* die de vijand daar bestrijdt (kills in beide richtingen) |
| Tang | twee flankaanvallen van één kant op hetzelfde vijandelijke lichaam, van tegenover elkaar (100° of meer uit elkaar), binnen 90 s; zeker als de armen het bestrijden |
| Omsingeling | een compacte vijandelijke groep met minstens evenveel van de andere kant eromheen binnen 1,5 R, van twee of meer groepen, geen gat groter dan 100°, een minuut lang, afgesneden van de eigen kant; zeker als de ring met ½ R was dichtgegaan en de pocket bestreden werd |
| Doorbraak | een groep passeert een vastgehouden linie (vijanden die 30 s stilstaan, links en rechts ervan, het midden van hun kant voorbij hen); zeker als ze ½ R verder komt, 20 s blijft en daar vecht; een doorbraak een verdere R voorbij |
| Sprongsgewijs oprukken met dekking | in een kleine groep beweegt een deel terwijl de rest stilstaat, de rollen wisselen vier keer of vaker, met dekkend vuur van het stilstaande deel |
| Krachtconcentratie / spreiding | het aandeel van een kant nabij haar dichtste punt stijgt van 35% naar 60% (eenheden die 1,5 R of meer komen, daarna contact) - of daalt doordat de kant zich spreidt |
| Schijnaanval | een klein onderdeel in contact trekt twee of meer vijanden van elders; een grotere groep slaat dan vier afstanden verder toe waar de vijand minder heeft |
| Terugtrekking / achtervolging | een groep in contact draait zich om en neemt R afstand van waar ze vocht; zeker als een vijand daar er net één van haar had gedood en de groep 2 R van die doder kwam (nooit te voet: zie hieronder); vijanden die dezelfde kant op gaan en bijblijven, achtervolgen |
| Verdediging in de diepte | stilstaande eenheden in twee of meer gordels dwars op de as van de vijand, R diep, de vijand komt eraan, vuur vanuit de gordels |
| Tegenhelling | drie of meer kills op korte afstand door stilstaande eenheden op slachtoffers die over een kam kwamen |
| Hinderlaag | een bewegende groep ontmoet vijanden die 45 s stilstonden; zij schieten eerst en de bewegers verliezen twee of de helft van de groep |
| Scherm | één of twee eenheden die voor een lichaam van drie of meer uit bewegen, en als eerste de vijand ontmoeten |
| Binnenlijnen | de groepen van een kant liggen dicht bij elkaar tussen die van de ander, haar eenheden schuiven tussen hen heen en weer |
| Tempo | een kant die op contact antwoordt (draaien, snelheidsverandering, eerste schot) 1,5 keer sneller, Mann-Whitney p onder 0,05 |
| Crank, notch, drag, pump | het doelwit van een raketlancering draait de schutter naar 35-70°, 75-105°, voorbij 140°, of sleept hem en draait terug |
| Luchttang, muur, lead-trail, grinder | een paar dat zich op één vijand splitst; drie naast elkaar op de vijand; een element 5-20 km achter een ander; twee die om één punt cirkelen op een afstand van één |
| Gevechtsluchtpatrouille | cirkelt drie minuten rond een station |
| Energie- / hoekengevecht | in een nauw gevecht - koersen 30° uit elkaar, elk houdt om beurten de ander op de neus, of een kill tussen hen - hoogte gebruikt en klimmend, of plat en hard draaiend terwijl het vertraagt; zeker als de ene de andere doodde |
| Aanvalspakket, SEAD | een luchtgroep met gemengde rollen, waarvan sommige de grond raken; luchtverdedigingskills vóór de meeste andere grondkills |
| Slaglinie, de T oversteken | drie schepen in colonne; een colonne vierkant over het hoofd van een vijandelijke colonne |

Elke manoeuvre zegt welke **patronen** uit de kennisbank hij laat zien
(`patterns-maneuver.ts`: formatie, frontale aanval, dubbele omvatting,
omsingeling, doorbraak, vuur en beweging, schijnaanval, terugtrekking,
achtervolging, verdediging in de diepte, afscherming, spreiding,
raketverdediging, hoekengevecht, gevechtsluchtpatrouille, aanvalspakket,
slaglinie, de T oversteken) en de items om eerst te lezen; oudere items dragen
de nieuwe patronen via `knowledge/maneuver-tags.ts`. Zie [De kennislens](knowledge.md).

**Loonde** vergelijkt de uitwisseling van de eenheden terwijl hij liep (en een
minuut erna) met die van hun kant over de match; een terugtrekking loont als er
na het draaien minder eenheden verloren gingen dan ervoor, een raketverdediging
als het vliegtuig een minuut blijft leven, een omsingeling als de pocket de
helft verliest.

## Over veel matches {#over-many-matches}

De samenvatting van elke match (`src/mass/summarize.ts`, zie [Massa-analyse](mass-analysis.md))
bevat een klein `maneuvers`-deel: per soort en kant, gemaakt (op Waarschijnlijk
of hoger), loonde, loonde niet, kills en verliezen. **Massa-analyse → Manoeuvres**
telt die op over de matches die het filter overhoudt - per kaart en modus, of
over alle - met het Wilson-interval van het loonpercentage; een rij laadt de
matches waarin hij gemaakt werd. Samenvattingen die geschreven zijn voordat dit
deel bestond, hebben er geen: draai `node tools/3dheat-summarize.mjs <map> --force`
om het toe te voegen.

## Hoe zeker het is {#how-sure-it-is}

Synthetische matches met ingebouwde manoeuvres (`synth.ts`, gedraaid door
`maneuver.test.ts`): alle 28 ingebouwde soorten worden gevonden op Waarschijnlijk
of hoger; van de 50 gemelde manoeuvres zijn er 31 de ingebouwde soort en zijn de
andere 19 ook echt aanwezig (de formatie van de bewegende groep, de frontale
nadering van de doorbrekende colonne); er is er geen fout. Op 30 nulmatches -
willekeurige wandelingen apart en gemengd, eenheden die willekeurig stilstaan,
vliegtuigen op rechte koersen, een menigte die rondhangt - wordt er niets
gemeld op Waarschijnlijk of hoger.

Op echte data (tientallen grondgevechten, een paar lange luchtoorlogsmissies,
een tiental schietmatches): frontale aanvallen, flanken, doorbraken en
omsingelingen in de tankslagen, formaties en nauwe gevechten in de lucht,
raketverdedigingen, CAP-patrouilles en lead-trail-paren in de luchtoorlogsmissies,
frontale executies, colonnes en een paar hinderlagen en sprongsgewijze paren in
de schieter. De drempels zijn de vormen uit de doctrine op de schaal van het
spel; lees een losse vondst met zijn bewijs, en de tabelpercentages van de massa
met hun intervallen.

### Tegen nulmodellen van dezelfde matches {#against-null-models-of-the-same-matches}

Een detector kan misleid worden door het terrein en de menigte: in een
vechtpartij heeft elke groep vijanden rondom. Daarom wordt elke soort ook gedraaid
op **nulmodellen** die uit dezelfde matches gebouwd zijn (`nulls.ts`), waarin de
kanten elkaar niet meer ontmoeten zoals ze deden: de tijdlijn van één kant
omgedraaid met een derde tot twee derde van de match (*shift*), of haar paden
omgedraaid rond het midden van de kaart (*rotate*); en de teamlabels door elkaar
gehusseld (*teams*, wat door de constructie ongeveer de helft van de echte
gevechten bewaart). Gevechten worden alleen geteld als kills gekoppeld aan hun
doden, de doder binnen 2 R en het slachtoffer op de plek - een nulmodel breekt
die koppeling. Vondsten op Waarschijnlijk of hoger, echt tegenover de nulmodellen
(30 tankslagen; 12 schietmatches):

| Soort | Tankslagen: echt / shift / rotate | Schieter: echt / shift / rotate |
|---|---|---|
| Omsingeling | 0 / 0 / 0 (was 1,3 / 1,2 / 0,8) | 0 / 0 / 0 |
| Doorbraak | 0,03 / 0,02 / 0,05 (was 1,6 / 1,8 / 1,4) | 0 / 0 / 0 |
| Flank | 0,33 / 0,07 / 0,10 | 1,0 / 0,08 / 0,21 |
| Frontale aanval | 0,87 / 0,47 / 0,12 | 14,4 / 6,5 / 4,3 |
| Terugtrekking | 0,03 / 0 / 0,02 | 0,08 / 0,08 / 0,5 (dus nooit zeker te voet) |
| Hinderlaag | - | 0,17 / 0,04 / 0,04 |
| Energiegevecht | 1,2 / 0,1 / 0,85 | - |
| Hoekengevecht | 0,6 / 0,07 / 0,3 | - |

Nauwe luchtgevechten boven het midden van een slagveld blijven staan bij een
draai rond dat midden, dus de rotate-kolom flatteert ze minder dan de
grondsoorten. Soorten binnen één kant - formatie, gevechtsluchtpatrouille,
grinder, aanvalspakket, SEAD, sprongsgewijs, scherm - hangen niet af van de
andere kant en worden zo niet getest. `maneuver.test.ts` controleert dat de
nulmodellen de ingebouwde flank, tang, omsingeling, doorbraak, hinderlaag en
terugtrekking uit de synthetische matches halen.

## Beperkingen {#limits}

- Groepen hebben posities over tijd nodig; een bestand met alleen gebeurtenissen heeft die niet.
- De richting van eenheden wordt niet uit de data gelezen: het front van de
  vijand ligt waar de vastzettende macht hem bestrijdt, anders waar hij beweegt,
  anders waar de aanvaller vandaan kwam.
- Het terrein wordt gelezen uit de eigen hoogtes van de eenheden (de
  tegenhelling); er is geen zichtlijntest.
- Zeer grote bestanden worden met langere stappen bemonsterd; korte luchtmanoeuvres
  daarin worden nog steeds gelezen uit stappen van 2-4 s.
