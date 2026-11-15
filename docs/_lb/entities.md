---
title: "Entitéiten"
parent: "Filteren a Werkzeich"
nav_order: 3
lang: "lb"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---


# Entitéiten

Mat **Entitéiten** wielt Dir ee Spiller (oder e puer) aus, a gesitt nëmmen, wou dee Spiller higaang ass. Benotzt en, fir Är eege Bewegung ze verfolgen oder ee Géigner.

De Panel gëtt gewisen, wann de Datesaz eng Persoun-Kolonn huet. Säi Titel weist d'Zuel vun de Persounen, oder `ausgewielt vun total`, wann eng Auswiel aktiv ass (eng *Persoun* ass ee Spiller oder KI, kuckt d'[Glossar](glossary.md)).

## E Spiller auswielen {#pick-a-player}

1. Maacht **Entitéiten** an der Säitelëscht op.
2. Tippt en Deel vum Numm an d'Sichfeld.
3. Markéiert de Spiller. De Titel liest dann zum Beispill `2 vun 10`, an alles anescht verschwënnt.
4. **Läschen** weist all Persounen erëm.

![Entitéiten mat zwee vu zéng Spiller ausgewielt](../assets/img/en/entities-selected.webp)

D'Auswiel weist nëmmen déi ausgewielte Persounen, an den Heat-Modi (Punkten, Linnen, Ënnerscheed, Equipen-Heat) wéi och an de Spuere, Figuren a Schweifen vum [Figuren-Replay](box-replay.md). Loosst se eidel, fir jiddereen ze weisen; wann Dir jiddereen auswielt, ass dat dat selwecht wéi kee auswielen.

## De Panel {#the-panel}

| Deel | Bedeitung |
|---|---|
| Sichfeld | *Sichen no N Entitéiten...* - filtert d'Lëscht no engem Stéck vum Numm, ouni Ënnerscheed vu Gréisst- a Klengbuschtawen. Weist `N Treffer`, oder `N Treffer, déi éischt 200 ginn gewisen`; *Näischt passt op "..."*, wann d'Sich näischt fënnt. |
| Lëscht | Bis zu 200 Persounen (déi éischt 200, déi passen), jiddereng mat engem Kästchen, engem Faarfmuster vun der Faarf vun der Persoun a dem Numm (*(ouni Numm)*, wann de Numm eidel ass). |
| Hiweis Am Spill | Wann d'Zäit leeft, enthält d'Lëscht déi, *déi um Afspillkopp am Spill sinn*; eng Sich fënnt all. |
| **KI (n)** | Eng ausklappbar Gruppe mat de vum Computer gesteierten Eenheeten, getrennt vun de Spiller. |
| **Derbäi ugewisen** | Setzt jiddereen, deen elo an der Lëscht steet, an d'Auswiel. |
| **Nëmmen ugewisen** | Mécht d'Auswiel genau dat, wat op der Lëscht steet. |
| **Läschen** | Leert d'Auswiel. |

## Grenzen {#limits}

Bei der Hëtzt ass d'Auswiel e Filter an benotzt ee vun de véier [Filterplazen](filters.md#rules). Wann d'anere Filter schonn all véier benotzen, seet de Panel: *Net op d'Hëtzt ugewannt: all Filterplazen sinn besat. Den Figuren-Replay weist nach ëmmer nëmmen dës Entitéiten. Läscht e Filter ënner Filtere, fir eng Plaz frai ze maachen.* Läscht e Filter, fir eng Plaz frai ze maachen.

D'Auswiel gëtt bei all neie Datesaz geläscht. De Tab Match setzt déiselwecht Auswiel, wann e Spiller fokusséiert gëtt.

## Fir Entwéckler {#for-developers}

D'Auswiel gëtt als *Persounen*-Filter gespäichert ([Filtere](filters.md#for-developers)). D'Maske vum Shader hält 65.536 Persoun-IDen; eng Persoun dodriwwer gëtt bei der Hëtzt net gezeechent, solang eng Auswiel aktiv ass.
