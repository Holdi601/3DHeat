---
title: "Szűrők és eszközök"
nav_order: 6
has_children: true
lang: "hu"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Szűrők és eszközök

Ezekkel a panelekkel kiválaszthatja, *mely* adatot nézi, és megmérheti, amit lát. Akkor használja őket, ha a kép túl zsúfolt: mutasson egy csapatot, egy játékost, egy helyet vagy egy épület egy szintjét.

Minden panel szűkíti az adatot, és együtt működnek: egy sort csak akkor rajzolunk, ha **mindet** átmegy (ÉS-kapcsolat).

```
all rows -> Filters -> Teams -> Entities -> Slice -> picture
              AND       AND       AND        AND
```

Példa: vegye ki a *Harckocsi* jelölését a Szűrők alatt, rejtse el a Vörös csapatot a Csapatok alatt, és válasszon ki egy játékost az Entitások alatt. Csak ennek a játékosnak a nem harckocsis mozgásait látja.

| Panel | Mit csinál | Hőmódok | Figurás átfedés |
|---|---|---|---|
| [Szűrők](filters.md) | Tartomány- és kategóriaszűrők bármely betöltéskor megtartott oszlopon. | Igen | Nem (csak oszlopszűrők) |
| [Különbség-felosztás](difference.md#the-difference-split-panel) | Mely sorok adnak hozzá és melyek vesznek el, Különbség módban. | Csak Különbség | Nem |
| [Csapatok](teams-list.md) | Minden csapat megjelenítése vagy elrejtése; csapatok a + vagy - oldalra helyezése. | Igen | Igen |
| [Entitások](entities.md) | Egyes játékosok kiválasztása. | Igen | Igen |
| [Szelet](slice.md) | Egy réteg kivágása a pályából és a hőből, hogy az épületek belsejébe lehessen látni. | Igen, és a pálya | Nem |
| [Mérés](measure.md) | Vonalzó, és a kurzor alatti hőérték. | Igen | Igen |
| [Térfogatok és összehasonlítás](volumes.md) | 3D-s alakzatok rajzolása, és kérdezés, mi történt bennük. Szűrhet is. | Igen | Igen |
| [Bontás](breakdown.md) | Melyik jármű, játékos vagy fegyver teljesít a legjobban egy helyen. | nincs | nincs |

A találatelemzésnek saját területszűrője van a **Járművek** fülön: lásd [Találatelemzés](hit-analysis.md).

Az olyan fogalmakat, mint a hőtérkép, a sor, a személy és a csoport, a [szójegyzék](glossary.md) magyarázza.

## Hol vannak a panelek {#where-the-panels-are}

A Hőtérkép fül oldalsávja felülről lefelé:

1. Módválasztó sáv és munkamenet-választó
2. Forrás, Oszlop-hozzárendelés, Adatkészlet
3. Útvonalak (Vonalak mód)
4. A hőpanelek, vagy a Csapatnéző
5. Különbség-felosztás
6. Csapatok
7. Entitások
8. Szűrők
9. Háttér / pálya
10. Szelet
11. Mérés
12. Kameraútvonal és renderelés
13. Teljesítmény
14. Kamera és jelenet

A Meccs fül a módválasztó sávot, a munkamenet-választót, a saját panelét, a Szűrőket, a Háttér / pályát és a Kamera és jelenetet mutatja.
