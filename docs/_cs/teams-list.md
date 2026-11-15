---
title: "Seznam týmů"
parent: "Filtry a nástroje"
nav_order: 2
lang: "cs"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Seznam týmů

Panel **Týmy** vám umožní skrýt tým, nebo ho dát na jednu stranu srovnání. Použijte ho, když chcete vidět jen Modré, nebo se zeptat „kam chodí Modří, kam Červení ne?“.

*Skupina* je tým nebo strana, například Modří a Červení ([Skupiny](sessions-persons-groups.md#group)). Panel se ukáže, když datová sada má sloupec skupiny; počet skupin je v jeho záhlaví. V režimu Týmové teplo má postranní panel také sekci **Týmové zobrazení** s vlastními nastaveními; tato stránka popisuje seznam **Týmy**.

## Skrytí týmu {#hide-a-team}

1. Otevřete **Týmy** v postranním panelu.
2. Odškrtněte zaškrtávací políčko (*Viditelné*) týmu, který chcete skrýt. Obraz se hned přepočítá.
3. Stiskněte **Zobrazit vše**, aby se všechny týmy vrátily.

![Seznam týmů: Blue 5p, Red 5p, s Zobrazit vše](../assets/img/en/teams-list.webp)

## Každý řádek {#each-row}

| Část | Význam |
|---|---|
| Zaškrtávací políčko (*Viditelné*) | Ukáže nebo skryje skupinu. |
| Vzorek | Barva skupiny: v režimu Týmové teplo její barva [týmového tepla](team-heat.md), v ostatních režimech její základní barva. |
| Název | Štítek skupiny (úplný štítek po najetí). |
| **+** / **-** (režim Rozdíl) | Dá skupinu na kladnou nebo zápornou stranu [rozdílu](difference.md); kliknutím na aktivní tlačítko znovu ji dáte na žádnou stranu. |
| `Np` (ostatní režimy) | Počet osob, jejichž první řádek je v této skupině. |

![Režim rozdílu: Modří na straně +, Červení na straně -](../assets/img/en/teams-list-difference.webp)

## Tlačítka {#buttons}

| Tlačítko | Účinek |
|---|---|
| **Zobrazit vše** | Znovu zviditelní každou skupinu. |
| **Rozdělit rovnoměrně** (režim Rozdíl) | První polovina skupin (zaokrouhleno nahoru) na +, zbytek na -; při každém načtení začíná stejné rozdělení. |

## Co dělá skrytí skupiny {#what-hiding-a-group-does}

- V **Teplu**, **Týmovém teple** a **Čarách** nepřispívají řádky skupiny vůbec.
- V **Rozdílu** nepřispívá skrytá skupina, ať je na jakékoli straně, ani při rozdělení podle jiného sloupce (viz [Rozdíl](difference.md#for-developers)).
- V **překryvu figur** se nekreslí osoby, jejichž první řádek je v této skupině.
- V **Týmovém teple** si ostatní skupiny barvy zachovají: odstíny se přiřazují podle celkového počtu skupin, ne podle toho, co je vidět, takže dva obrázky zůstanou srovnatelné.

Změna viditelnosti restartuje akumulaci. Při každé nové datové sadě jsou všechny skupiny znovu viditelné.

Nápověda panelu se mění podle režimu: v Rozdílu vysvětluje + a -; v Týmovém teple říká, že vzorky jsou barvy, kterými každá skupina kreslí.
