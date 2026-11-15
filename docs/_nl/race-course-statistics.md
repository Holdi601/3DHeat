---
title: "Baanstatistieken"
parent: "Race-analyse"
nav_order: 57
lang: "nl"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Baanstatistieken

Laad veel rondes van één baan en de viewer telt de fouten: welke bocht de meeste tijd kost, in hoeveel rondes het daar misging, en waarom. Gebruik het om de bocht te vinden die het waard is om te oefenen.

Probeer het: **Demorondes** geeft drie rondes, genoeg om dit deel te laten verschijnen.

![Baanstatistieken met de foutenkaart: de baan ingekleurd naar hoeveel rondes in elke bocht tijd verloren, en de lijst met bochten](../assets/img/en/race-course-mistake-map.webp)

Laad de hele map van een baan - tientallen rondes, meerdere auto's, meerdere prestatieklassen - en elke ronde wordt beoordeeld, en daarna geteld. Deze pagina behandelt de vergelijking per klasse, wat als fout telt, het deel **Baanstatistieken**, de foutenkaart, de export naar de heatmap, banen van meerdere circuits, en de prestatiegrenzen bij veel rondes.

## Tegen de beste van de eigen klasse {#against-the-best-of-its-own-class}

Een ronde wordt bocht voor bocht vergeleken met de **snelste volledige ronde van
de eigen prestatieklasse** (de referentie, in de klasse van de referentie); die
ronde zelf met wie er in zijn klasse het snelst door elke bocht ging, of met elke
ronde als hij alleen in zijn klasse zit. Auto's worden gegroepeerd op de
prestatieklasse van het spel (in Forza D tot en met X; C en S2 zijn er twee van).
Het rempunt van een C-auto naast dat van een S2-auto zegt niets over het rijden.
De tijdkaart, de verschillen in de ronde-lijst en de tabel *Bocht voor bocht*
volgen dezelfde vergelijking (zie [met wie elke ronde vergeleken wordt](race-corner-analysis.md#who-each-lap-is-compared-with)).

De statistieken zijn gebouwd op de analyse van elke ronde, niet ernaast.

## Wat als fout telt {#what-counts-as-a-mistake}

Een **voorval** is de fout van één ronde in één bocht (segment). De fouten van een
ronde in een bocht zijn:

1. **De rijoorzaak** die de analyse daar vond voor zijn verlies - een bevinding
   die een verlies is, toegeschreven aan de bestuurder (niet aan de auto of de
   situatie), en die **0,05 s** of meer kost ten opzichte van de vergelijkingsronde.
   De kosten ervan zijn het verlies in de bocht.
2. **Elke fout in de wagenbeheersing** die hij daar maakte en die de andere ronde
   niet maakte (niet gedeeld), en die **0,03 s** of meer kost - blokkeren,
   wielspin, achterkant die uitbreekt, onderstuur, slingeren. De kosten ervan zijn
   die van het voorval zelf.
3. **Elke botsing en elk ongeluk**, gedeeld of niet, wat het ook kostte.

In één bocht kunnen er meerdere zijn; elke soort wordt **één keer per ronde en
bocht** geteld. Winst, het aandeel van de auto en een latere aankomst die in de
bocht ervoor beslist werd, zijn geen fouten.

### Van bevindingen naar fouten {#from-findings-to-mistakes}

| Bevinding | Fout |
|---|---|
| te snel erin, langzaam eruit, door een paar meter later te remmen dan de andere | Te laat geremd |
| vroeg geremd | Te vroeg geremd |
| zacht geremd | Te zacht geremd |
| een blokkerend wiel als oorzaak | Een wiel geblokkeerd |
| gerold | Gerold |
| grip over, langzamer naar het apex, geremd waar de ander alleen het gas losliet | Te traag door het midden |
| een te krappe lijn | Een te krappe lijn |
| naar buiten gedrukt | Naar buiten gedrukt |
| de auto te weinig / te ver gedraaid | De auto verkeerd gedraaid |
| later op het gas, later vol gas, geaarzeld | Laat op het gas |
| langzamer uit de bocht | Langzamer uit |
| wielspin | Wielspin |
| de achterkant brak uit, zijwaarts door het midden | Achterkant brak uit |
| liep wijd | Liep wijd |
| snelheid verloren door schuren | Snelheid verloren |
| gas gelost (op de weg erin, of op de rechte) | Gas gelost |
| bijna stilstand, slingeren, een treffer of botsing als oorzaak | Gespind / Iets geraakt / Gecrasht, als de gebeurtenissen van de ronde daar het zeggen (eerst crash, dan slingeren, dan treffer); anders Bijna stilgevallen |
| een langere vlucht | Te ver gevlogen |

De twee patronen tellen mee als de oorzaak die erin gevonden werd, volgens
dezelfde tabel. *Gaf meer weg bij het erin gaan dan de uitgang terugwon* is de
fout van de oorzaak van de ingang: vroeg remmen is *Te vroeg geremd*, een
blokkade *Een wiel geblokkeerd*, rollen *Gerold*, grip die niet benut werd *Te
traag door het midden*. *Te snel erin, langzaam eruit* is *Te laat geremd* waar
de ronde later remde dan de andere; anders de fout van de oorzaak van zijn
uitgang - *Laat op het gas*, *Wielspin*, *Achterkant brak uit*, *Liep wijd*,
*Langzamer uit*. Een patroon waarvan de oorzaak bij de auto ligt, of een latere
aankomst, telt niet mee.

Niet geteld: latere aankomst, de start, elke bevinding over de *auto* (trek, grip,
remmen, aandrijving) en elke winst of bocht op niveau.

### De soorten, in hun volgorde {#the-kinds-in-their-order}

Remmen: *Te laat geremd*, *Te vroeg geremd*, *Te zacht geremd*, *Een wiel
geblokkeerd*. Ingang: *Gerold*, *Te traag door het midden*, *Een te krappe
lijn*, *Naar buiten gedrukt*, *De auto verkeerd gedraaid*. Uitgang: *Laat op het
gas*, *Langzamer uit*, *Wielspin*, *Achterkant brak uit*, *Liep wijd*, *Snelheid
verloren*. Rechte stuk: *Gas gelost*. Incidenten: *Gespind*, *Iets geraakt*,
*Gecrasht*, *Bijna stilgevallen*, *Te ver gevlogen*.

## Het deel Baanstatistieken {#the-course-statistics-section}

Het verschijnt vanaf **3** rondes, tussen **Rondes** en **Waar tijd te winnen is**.

- **De samenvatting**: "40 rondes in 9 auto's, 3 klassen: elke bocht beoordeeld
  tegen de snelste ronde van de eigen klasse." (auto's geteld op autonummer, of
  naam).
- **Klassekeuze** (bij meerdere klassen): **Alles** en één keuze per klasse, elk met
  het aantal rondes, in de volgorde van het spel (D, C, B, A, S1, S2, R, X, dan
  de rest). Klik op een klasse voor alleen zijn rondes; **Shift+klik** voegt er één
  toe of haalt er één weg. Alles hieronder - de lijsten, de kaart, de export naar
  de heatmap - volgt de gekozen klassen.
- **Waar het het vaakst misgaat**: elke soort fout, met de meeste rondes eerst (dan
  de meeste keren, dan de meeste kosten), hoogstens 8 (**Alle N soorten** toont de
  rest, **Minder** verbergt ze weer). Elke rij: de naam, "N van M rondes", een balk
  van dat aandeel, en "K keer · ongeveer X s · meest in T3 (5), T7 (4), T1 (2)" -
  hoe vaak hij gemaakt werd (ronde per bocht), wat hij in totaal kostte, en de drie
  bochten waar de meeste rondes hem maakten. **Klik op een rij** om hem op de
  foutenkaart te tonen (en de kaart aan te zetten); klik nogmaals voor elke fout.
- **Bocht voor bocht** (of *Bocht voor bocht - <fout>* met er één gekozen): per
  segment, "N van M verloren tijd · X s" - rondes die de hele bocht reden, die daar
  **0,05 s** of meer verloren tegenover de beste van hun klasse, en alle tijd die
  ze verloren. Ingeklapt staan er de drie meest voorkomende fouten met hun
  aantallen rondes. **Klik op een bocht** om hem te openen, hem met de camera in
  beeld te brengen en naar de foutenkaart over te schakelen: voor elke fout (of
  alleen de gekozen) een regel zoals "12 van 40 rondes remden hier te vroeg. In 9
  verschillende auto's - ongeveer 0,21 s per keer." en de rondes die hem maakten,
  **de ergste eerst**, elk met zijn kosten - hoogstens 8, "+N meer" voor de rest.
  **Klik op een ronde** om haar te focussen en die fout af te spelen (uitgelijnd
  40 m ervoor).
- **Toon in de heatmap**: zie hieronder. "Heatmap wordt opgebouwd…" terwijl het
  loopt; uitgeschakeld als er geen fouten zijn.

## De foutenkaart {#the-mistake-map}

**Beeld → Foutenkaart** schildert langs het referentiepad hoeveel van de rondes
(van de gekozen klassen) op elke meter een fout maakten - van elke soort, of de
ene die in de statistieken gekozen is. Elke ronde telt één keer per meter; het
bereik van elk voorval (waar zijn oorzaak of gebeurtenis lag) wordt aan beide
kanten met 6 m verbreed, zodat een kort voorval zichtbaar is. Breder en helderder
waar meer rondes waren: breedte `3 + 10 · (rondes hier / meeste rondes overal)`
meter, kleur van dof bruin tot helder oranje; een grijze strook van 2 m waar er
geen waren. Legenda: *weinig rondes ↔ meeste rondes*.

Met **Labels** aan draagt het apex van elke bocht zijn meest voorkomende fout:
"T3 · 12/40 vroeg remmen" (rondes die hem maakten / rondes die de bocht reden),
"T3 · 12/40" met één soort gekozen, "T3 · schoon" zonder. Als je over een label
zweeft, staan de verliezen van de bocht en zijn vijf meest voorkomende fouten
erin; klikken erop opent of sluit die bocht in de statistieken.

## Toon in de heatmap {#show-in-the-heatmap}

**Toon in de heatmap** geeft hetzelfde aan het tabblad heatmap als dataset met de
naam "Fouten op <baan>" (of "Fouten op de baan"), zodat de hele gereedschapskist
van de heatmap - warmtemodi, filters, de tijdlijn, snijden - werkt op waar de
rondes misgaan.

Het is een CSV die in het geheugen gebouwd wordt (`mistakeTable`), één rij per
rasterpunt (elke 2 m) van elk voorval, op de **eigen positie van de ronde** daar:

| Kolom | Inhoud |
|---|---|
| `x`, `y`, `z` | de positie van de ronde op die meter (spelcoördinaten) |
| `elapsed` | de tijd van de ronde daar, s |
| `lap` | het label van de ronde |
| `car` | de naam van de auto (of "car 1234") |
| `mistake` | de naam van de fout, in de huidige taal |
| `car_class` | de klasse, `-` als er geen is |
| `corner` | het label van de bocht, `T3` |
| `cost` | de kosten van het voorval, s |

Hij wordt geladen via de eigen lader van de heatmap met koppelingshints: Y omhoog,
geen omkeringen van assen, schaal 1; tijd `elapsed` in seconden; **persoon** =
`car`, **groep** = `mistake`, **sessie** = `lap`; geen kijkrichting; `car_class`,
`corner` en `cost` bewaard als filterkolommen. Het tabblad schakelt dan naar
**Heatmap** en brengt de data in beeld. Alleen de klassen die in de statistieken
gekozen zijn, worden geëxporteerd.

## Banen van meerdere circuits {#courses-from-several-tracks}

Rondes worden **één baan per keer** geanalyseerd. Een map met rondes van meerdere
banen - de hele rondebibliotheek - biedt elke baan apart aan om te laden (met het
aantal rondes, meeste eerst); rondes van runs die nooit af zijn (de `unfinished/`
van FH Companion) horen bij hun baan en krijgen het merkteken *gedeeltelijk*.
Rondes van meerdere benoemde banen die als bestanden gekozen zijn, worden op
dezelfde manier aangeboden; rondes zonder baannaam gaan bij welke gekozen baan
ook. Rondes laden van een andere benoemde baan dan de geladen vervangt die. Details:
[Rondes laden](race-loading-laps.md#folders-and-courses).

## Prestaties bij veel rondes {#performance-with-many-laps}

Tientallen rondes worden in een of twee seconden geanalyseerd (altijd alle). Wat
getekend wordt, is beperkt zodat het beeld op framesnelheid blijft:

| Grens | Waarde | Effect |
|---|---|---|
| standaard getekende rondes | 8 (`SHOW_ALL_UP_TO`) | boven 8 geladen rondes worden nieuw toegevoegde rondes verborgen, tenzij het de referentie, de gefocuste ronde of de beste van zijn klasse is. **Toon alle** tekent elke ronde; **Alleen de bekeken** gaat terug. Een ronde focussen maakt haar en de beste van haar klasse weer zichtbaar |
| gewone auto's en dunne lijnen | meer dan 10 zichtbaar (`PLAIN_PAST`) | rondes anders dan de focus, de achtervolgde auto en de referentie: een lijnpunt elke 6 m (in plaats van 1,5 m), auto's getekend zonder details |
| rondes in de grafiek | 8 (`CHART_LAPS`) | eerst de focus, zijn beste van de klasse en de referentie; "+N meer getekend, niet in de grafiek" |
| HUD-kaarten | 6 | de eerste zes zichtbare rondes |
| statistieken | vanaf 3 rondes | het deel is verborgen onder die grens |
| getoonde bevindingen | 12 bestuurder, 8 auto/context, 10 winsten | per gefocuste ronde |
| getoonde autoparen | 3 | boven 3 paren één paar met een keuzelijst |

Fouten worden één keer per analyse berekend en gecachet; de dichtheid op de
foutenkaart wordt gecachet per klasseselectie en fout.

## Voor ontwikkelaars {#for-developers}

Code: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` in [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
