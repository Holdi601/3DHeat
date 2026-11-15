---
title: "Verschil"
parent: "Warmtemodi"
nav_order: 5
lang: "nl"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Verschil

Rood waar team A vaker was, groenblauw waar team B vaker was, niets waar ze even vaak waren.

**Verschil** (toets 2) is warmte met een teken. Rijen van de ene populatie tellen warmte op; rijen van een andere trekken die af. Waar de twee gelijkmatig overlappen is het resultaat nul en volledig transparant; waar één overheerst toont het zich in de kleuren van die kant - standaard warm (transparant → rood → geel → wit) voor de kant **+** en koel (transparant → groen → blauw → paars) voor de kant **−**.

![Verschilwarmte: rood waar de + kant vaker was, groen en blauw waar de - kant vaker was](../assets/img/en/difference-split.webp)

## Zo gebruik je het {#how-to-use-it}

1. Druk op `2` (of kies **Verschil** in de modusbalk).
2. Open **Verschilverdeling** in de zijbalk.
3. Kies waarop je **Verdelen op** wilt: meestal *Groepen*.
4. Zet één groep (of waarde) op **+** en een andere op **−**.
5. Lees de kleuren: warm betekent de kant +, koel betekent de kant −. Het paneel waarschuwt als een kant geen rijen heeft (zie [Meldingen die je kunt zien](#messages-you-may-see)).

*Welke* twee populaties is de hele vraag, dus de verdeling kan op elke bewaarde kolom, niet alleen op groepen. Rijen die op **geen van beide** kanten vallen worden **weggelaten**, niet als nul geteld: daardoor vergelijkt een verdeling over twee van veel waarden precies die twee, en werkt het samen met de [filters](filters.md) - filter eerst op één kaart, verdeel dat daarna op build.

De modus heeft twee kanten nodig: een groepskolom met minstens twee groepen, of een verdeling over een kolom die voor filteren bewaard is. Bij data met minder dan twee groepen begint een lading met een kolomverdeling - eerst de kolom *Bronbestand* van een lading met meerdere bestanden, anders de eerste categoriekolom met twee waarden, anders de eerste numerieke kolom met een spanne - zodat *twee ladingen vergelijken* ook werkt op data zonder groepen. Alleen data zonder één van beide maakt de modus onbeschikbaar; dat geldt ook voor een kolomverdeling die aan één kant niets overlaat.

## Het paneel Verschilverdeling {#the-difference-split-panel}

Wordt getoond in de modus Verschil, onder de warmtepanelen.

**Verdelen op** biedt:

| Optie | Getoond als | Verdelingsregel |
|---|---|---|
| Groepen | *Groep (N)* (als er een groepskolom is) | Elke groep op +, − of geen van beide, ingesteld in de [Teamlijst](teams-list.md) |
| Een categoriekolom | *kolom (N waarden)* | Waarden op +, − of geen van beide |
| Een numerieke kolom | *kolom (numeriek)* | Een waardebereik voor elke kant |
| Het bronbestand | *Bronbestand - twee ladingen vergelijken* (als er meerdere bestanden geladen zijn) | Bestanden op +, − of geen van beide |

Alleen kolommen die bij het laden onder *Bewaren voor filteren* zijn gehouden worden aangeboden.

### Aandelen vergelijken, geen aantallen {#compare-shares-not-counts}

**Aandelen vergelijken, geen aantallen** (standaard uit) weegt elke kant met één gedeeld door het eigen aantal rijen, zodat een kant met vijf keer zoveel rijen niet alleen op aantallen wint. De kleur toont dan waar elke kant verhoudingsgewijs vaker voorkomt dan de andere. Gebruik het als de twee kanten zeer verschillende hoeveelheden data hebben, bijvoorbeeld twee sessies van verschillende lengte.

### Meldingen die je kunt zien {#messages-you-may-see}

Het paneel waarschuwt wanneer het beeld geen echt verschil is:

| Melding | Betekenis |
|---|---|
| *N + / M −* (of *N + / M − / K ongebruikt*) | Hoeveel waarden aan elke kant liggen (en aan geen van beide). |
| Geen enkele rij in het venster is aan de kant **+** | Alleen de kant **−** wordt getekend. Verschuif het tijdlijnvenster of wijzig de verdeling. |
| Geen enkele rij in het venster is aan de kant **−** | Alleen de kant **+** wordt getekend. |
| Geen enkele waarde ligt aan een kant | Het verschil tekent niets. Zet minstens één waarde op **+** of **−**. |
| *kolom* kan zo niet verdeeld worden | De gekozen kolom past niet bij de verdeling. Kies de kolom opnieuw. |
| De verdelingskolom paste niet in het GPU-geheugen voor N van M blokken | Die rijen worden niet getekend. Verhoog het GPU-budget onder Prestaties → Resourcebudgetten, of laad minder rijen. |

### Op groep {#by-group}

Het paneel verwijst alleen naar de [Teamlijst](teams-list.md), waar elke groep een knop **+** en een knop **−** heeft. Bij elke lading komt de eerste helft van de groepen (naar boven afgerond) op +, de rest op −; **Gelijk verdelen** in de Teamlijst doet hetzelfde nog eens. Een groep aan geen van beide kanten, of verborgen met zijn selectievakje, draagt niets bij.

### Op waarden van een categorie {#by-category-values}

| Onderdeel | Betekenis |
|---|---|
| `a + / b − / c ongebruikt` | Hoeveel waarden aan elke kant en aan geen van beide liggen. |
| **Wissen** | Zet elke waarde aan geen van beide kanten. |
| Waardelijst | Elke waarde met een knop **+** en een knop **−** (klik de actieve nogmaals aan om hem van die kant te halen). Een lege waarde wordt getoond als *(ontbrekend)*. |
| Opmerking over het maximum | Alleen de eerste 200 waarden worden getoond: *De eerste 200 van N waarden worden getoond. Een zo brede kolom kun je beter eerst met een filter versmallen, of op bereik verdelen als de waarden geordend zijn.* |

Bij het kiezen van de kolom komt de eerste waarde op + en de tweede op −. Heeft geen van beide kanten een waarde, dan valt de verdeling terug op groepen in plaats van een lege weergave te tonen. *Bronbestand* werkt op dezelfde manier, met één waarde per bestand - zo vergelijk je twee exports, twee testruns of twee builds.

### Op bereik {#by-range}

| Onderdeel | Betekenis |
|---|---|
| Hint | Het minimum en maximum van de kolom. |
| **Positief bereik (+)**, **van** / **tot** | Rijen met een waarde in dit bereik, inclusief beide uiteinden, tellen op. |
| **Negatief bereik (−)**, **van** / **tot** | Rijen in dit bereik trekken af. |
| **In het midden verdelen** | Zet + op [minimum, midden] en − op [midden, maximum] - wat ook gebeurt als je de kolom kiest. |

Een waarde in beide bereiken telt als +. De bereiken hoeven de kolom niet volledig te dekken; waarden in geen van beide worden weggelaten. *De eerste twee minuten tegenover de laatste twee* is een bereikverdeling op een tijdachtige kolom.

## Kleuren {#colours}

Het gedeelte **Heatmapkleuren** toont in deze modus twee verlooplijsten: **Positief (additieve teams)** en **Negatief (subtractieve teams)**, elk met een eigen herstelknop (*Herstellen naar transparant → rood → geel → wit*, *Herstellen naar transparant → groen → blauw → paars*). De samenstelling neemt de absolute waarde van de netto warmte door het [verzadigingspunt en de respons](colour-and-exposure.md), en kiest het negatieve verloop waar het netto onder nul ligt. Zie [Kleur en belichting](colour-and-exposure.md#the-ramp-editor).

Gebruik de *Lineaire* dichtheidsrespons als de grootte van het verschil telt: het is de enige respons waarbij gelijke kleur gelijk aantal betekent.

## Hoe het werkt {#how-it-works}

Elke rij krijgt in de vertex-shader een teken van +1, -1 of 0 ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); een 0 wijst de rij af voordat er een fragment wordt getekend.

- Op groep komt het teken uit een groepstabel van 4.096 items die geïndexeerd wordt op het groeps-id van de rij (het groeps-id zit in het vierde kanaal van de positietexel van de rij).
- Op categorie komt het teken uit een tweede tabel van 4.096 items, per categoriewaarde gevuld, en de waarde van de rij wordt gelezen uit de filtertextuur van de kolom; een waarde voorbij het einde van de tabel wordt op beide backends afgewezen.
- Op bereik wordt de waarde van de rij vergeleken met de twee bereiken.

Het wijzigen van de verdeling start de accumulatie opnieuw.

**Verborgen groepen blijven bij elke verdeling verborgen.** Bij een verdeling op een kolom bevat de groepstabel geen tekens meer; ze bevat 1 voor een getoonde groep en 0 voor een verborgen groep ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), en beide tabellen gaan samen naar de shader - twee rijen van één tekentextuur op WebGL2, twee helften van één opslagbuffer op WebGPU. Een rij wordt alleen getekend als haar groep getoond wordt *en* haar kolomwaarde aan een kant ligt. Dus een groep die in de [Teamlijst](teams-list.md) is uitgevinkt, of door de zijfocus van het tabblad Match is weggelaten, draagt niets bij, hoe het verschil ook verdeeld wordt.
