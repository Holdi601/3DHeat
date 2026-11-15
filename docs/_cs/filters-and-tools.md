---
title: "Filtry a nástroje"
nav_order: 6
has_children: true
lang: "cs"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtry a nástroje

Tyto panely vám umožní vybrat, *která* data sledujete, a změřit to, co vidíte. Použijte je, když je obrázek příliš přeplněný: ukažte jeden tým, jednoho hráče, jedno místo nebo jedno patro budovy.

Každý panel data zúží a spolupracují: řádek se nakreslí, jen když projde **všemi** (AND, tedy zároveň).

```
všechny řádky -> Filtry -> Týmy -> Entity -> Řez -> obrázek
                 A        A        A         A
```

Příklad: odškrtněte *Tank* v Filtrech, skryjte červený tým v Týmech a vyberte jednoho hráče v Entitách. Uvidíte jen pohyby toho hráče, které nejsou tank.

| Panel | Co dělá | Režimy tepla | Překryv figur |
|---|---|---|---|
| [Filtry](filters.md) | Filtry rozsahu a kategorií na libovolném sloupci ponechaném při načtení. | Ano | Ne (jen filtry sloupců) |
| [Rozdílové rozdělení](difference.md#the-difference-split-panel) | Které řádky přidávají a které odečítají, v režimu Rozdíl. | Jen Rozdíl | Ne |
| [Týmy](teams-list.md) | Zobrazit nebo skrýt každý tým; dát týmy na stranu + nebo -. | Ano | Ano |
| [Entity](entities.md) | Výběr jednotlivých hráčů. | Ano | Ano |
| [Řez](slice.md) | Vyřízne vrstvu z levelu a tepla, abyste viděli dovnitř budov. | Ano, a level | Ne |
| [Měření](measure.md) | Pravítko a hodnota tepla pod kurzorem. | Ano | Ano |
| [Objemy a porovnání](volumes.md) | Kreslí 3D tvary a ptá se, co se uvnitř stalo. Umí také filtrovat. | Ano | Ano |
| [Rozpis](breakdown.md) | Které vozidlo, hráč nebo zbraň si na místě vede nejlépe. | nedostupné | nedostupné |

Analýza zásahů má vlastní filtr oblasti na kartě **Vozidla**: viz [Analýza zásahů](hit-analysis.md).

Pojmy jako teplotní mapa, řádek, osoba a skupina jsou vysvětleny ve [slovníčku](glossary.md).

## Kde jsou panely {#where-the-panels-are}

Postranní panel karty Teplotní mapa shora dolů:

1. Lišta režimů a výběr relace
2. Zdroj, Mapování sloupců, Datová sada
3. Trasy (režim Čáry)
4. Panely tepla, nebo Týmové zobrazení
5. Rozdílové rozdělení
6. Týmy
7. Entity
8. Filtry
9. Pozadí / úroveň
10. Řez
11. Měření
12. Trasa kamery a vykreslení
13. Výkon
14. Kamera a scéna

Karta Zápas ukazuje lištu režimů, výběr relace, svůj vlastní panel, Filtry, Pozadí / úroveň a Kamera a scéna.
