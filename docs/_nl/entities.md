---
title: "Entiteiten"
parent: "Filters en hulpmiddelen"
nav_order: 3
lang: "nl"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entiteiten

Met **Entiteiten** kies je één speler (of een paar) om alleen te zien waar die speler is geweest. Gebruik het om je eigen beweging of één tegenstander te volgen.

Het paneel wordt getoond wanneer de dataset een kolom met personen heeft. De kop toont het aantal personen, of `geselecteerd van totaal` terwijl er een selectie actief is (een *persoon* is één speler of AI, zie de [woordenlijst](glossary.md)).

## Een speler kiezen {#pick-a-player}

1. Open **Entiteiten** in de zijbalk.
2. Typ een deel van de naam in het zoekvak.
3. Vink de speler aan. De kop leest bijvoorbeeld `2 van 10`, en al het andere verdwijnt.
4. **Wissen** toont iedereen weer.

![Entiteiten met twee van de tien spelers geselecteerd](../assets/img/en/entities-selected.webp)

De selectie toont alleen de geselecteerde personen, in de warmtemodi (punten, lijnen, verschil, teamwarmte) en ook in de sporen, figuren en paden van de [figurenreplay](box-replay.md). Laat het leeg om iedereen te tonen; alles selecteren is hetzelfde als niemand selecteren.

## Het paneel {#the-panel}

| Onderdeel | Betekenis |
|---|---|
| Zoekvak | *Zoek in N entiteiten...* - filtert de lijst op een deel van de naam, ongevoelig voor hoofdletters. Toont `N treffers`, of `N treffers, de eerste 200 getoond`; *Niets komt overeen met "..."* wanneer de zoekactie niets vindt. |
| Lijst | Tot 200 personen (de eerste 200 die passen), elk met een vinkje, een staaltje van de kleur van de persoon, en de naam (*(zonder naam)* bij een lege naam). |
| Hint bij afspelen | Wanneer de tijd loopt, bevat de lijst de personen die *op de afspeelkop actief zijn*; een zoekactie vindt ze allemaal. |
| **AI (n)** | Een invouwbare groep met de door AI bestuurde eenheden, los van de spelers. |
| **Getoonde toevoegen** | Voegt iedereen die nu in de lijst staat toe aan de selectie. |
| **Alleen getoonde** | Maakt de selectie precies die personen die in de lijst staan. |
| **Wissen** | Leegt de selectie. |

## Grenzen {#limits}

In de warmte is de selectie een filter en gebruikt het een van de vier [filterplaatsen](filters.md#rules). Wanneer de andere filters alle vier al gebruiken, zegt het paneel *Niet toegepast op de warmte: alle filterplaatsen zijn bezet. De figurenreplay toont nog steeds alleen deze entiteiten. Haal een filter weg onder Filters om er een vrij te maken.* Haal een filter weg om een plaats vrij te maken.

De selectie wordt bij elke nieuwe dataset gewist. Het tabblad Match zet dezelfde selectie wanneer het op één speler inzoomt.

## Voor ontwikkelaars {#for-developers}

De selectie wordt opgeslagen als een filter *personen* ([Filters](filters.md#for-developers)). Het masker van de shader bevat 65.536 persoon-id's; een persoon daarbovenuit wordt in de warmte niet getekend zolang een selectie actief is.
