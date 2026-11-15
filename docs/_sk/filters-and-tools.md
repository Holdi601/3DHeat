---
title: "Filtre a nástroje"
nav_order: 6
has_children: true
lang: "sk"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtre a nástroje

Tieto panely vám umožnia vybrať, *ktoré* dáta pozeráte, a zmerať to, čo vidíte. Použite ich, keď je obraz priveľmi preplnený: ukážte jeden tím, jedného hráča, jedno miesto alebo jedno poschodie budovy.

Každý panel dáta zužuje a fungujú spolu: riadok sa nakreslí, len ak prejde **všetkými** (A zároveň).

```
všetky riadky -> Filtre -> Tímy -> Entity -> Rez -> obrázok
                   A         A        A        A
```

Príklad: v Filtroch odškrtnite *Tank*, v Tímoch skryte tím Red a v Entitách vyberte jedného hráča. Vidíte len pohyby toho hráča, ktoré nie sú tanky.

| Panel | Čo robí | Režimy tepla | Prekrytie figúrok |
|---|---|---|---|
| [Filtre](filters.md) | Rozsahové a kategóriové filtre na ľubovoľnom stĺpci ponechanom pri načítaní. | Áno | Nie (len filtre stĺpcov) |
| [Rozdelenie rozdielu](difference.md#the-difference-split-panel) | Ktoré riadky pripočítavajú a ktoré odpočítavajú, v režime Rozdiel. | Len Rozdiel | Nie |
| [Tímy](teams-list.md) | Zobrazí alebo skryje každý tím; dá tímy na stranu + alebo -. | Áno | Áno |
| [Entity](entities.md) | Výber jednotlivých hráčov. | Áno | Áno |
| [Rez](slice.md) | Vyrežte z levelu a tepla plát, aby ste videli dnu do budov. | Áno, a level | Nie |
| [Meranie](measure.md) | Pravítko a hodnota tepla pod kurzorom. | Áno | Áno |
| [Objemy a porovnanie](volumes.md) | Kreslite 3D tvary a pýtajte sa, čo sa v nich stalo. Môžu aj filtrovať. | Áno | Áno |
| [Rozpis](breakdown.md) | Ktoré vozidlo, hráč alebo zbraň si na mieste vedie najlepšie. | nie je relevantné | nie je relevantné |

Analýza zásahov má vlastný filter oblasti v karte **Vozidlá**: pozri [Analýza zásahov](hit-analysis.md).

Pojmy ako heatmapa, riadok, osoba a skupina sú vysvetlené v [slovníku](glossary.md).

## Kde sú panely {#where-the-panels-are}

Bočný panel karty Heatmapa zhora nadol:

1. Lišta režimov a výber relácie
2. Zdroj, Mapovanie stĺpcov, Dátová sada
3. Cesty (režim Čiary)
4. Panely tepla alebo Zobrazenie tímov
5. Rozdelenie rozdielu
6. Tímy
7. Entity
8. Filtre
9. Pozadie / level
10. Rez
11. Meranie
12. Dráha kamery a renderovanie
13. Výkon
14. Kamera a scéna

Karta Zápas zobrazuje lištu režimov, výber relácie, svoj vlastný panel, Filtre, Pozadie / level a Kamera a scéna.
