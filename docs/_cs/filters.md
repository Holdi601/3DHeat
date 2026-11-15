---
title: "Filtry"
parent: "Filtry a nástroje"
nav_order: 1
lang: "cs"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filtry

**Filtry** skryjí řádky, které nechcete vidět, například jednu třídu vozidel nebo jeden druh události, a obrázek se hned změní. Panel vypisuje sloupce ponechané při načtení pod *Ponechat pro filtrování* ([Mapování sloupců](column-mapping.md)), plus *Zdrojový soubor*, když bylo načteno více souborů.

## Vyzkoušejte to {#try-it}

1. Načtěte datovou sadu a otevřete **Filtry** v postranním panelu.
2. Pod **Třída vozidla** odškrtněte *Tank*. Obrázek se hned změní.
3. Stiskněte **Vymazat všechny filtry**, abyste to vrátili.

![Panel Filtry: nejdřív vlastní sloupce prohlížeče (Typ události, Třída vozidla), pak sloupce z vašeho souboru](../assets/img/en/filters.webp)

První řádky jsou vlastní sloupce prohlížeče (níže). Řádky za nimi pocházejí z vašeho souboru.

## Sloupce, které přidává prohlížeč {#columns-the-viewer-adds}

Při načtení prohlížeč odvodí čtyři vlastní sloupce a uvede je **jako první**, s názvy a hodnotami ve vašem jazyce, takže stejný filtr funguje pro každou hru a každý zdroj dat:

| Sloupec | Hodnoty | Odvozeno z |
|---|---|---|
| **Typ události** | 23 druhů: Pozice, Výstřel, Odpálení (raketa, střela, puma), Zásah, Minutí (zbraň skončila blízko žádného cíle), Výbuch, Poškození, Zabití, Smrt, Zničeno, Havárie, Katapultáž / výskok, Oživení, Zmizení, Vzlet, Přistání, Dotyk se zemí, Zastavení na zemi, Přezbrojení / doplnění, Dobytí / cíl, Návnada, Zpráva, Jiné | sloupec `event`, `events`, `event_type` nebo `event_name`; slova každé hry (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) se mapují na tyto druhy. Úplná tabulka: [Typy a třídy událostí](ref-event-types.md). |
| **Hráč nebo AI** | Hráč, AI | sloupec `ai`, `is_ai`, `bot` nebo `actor`; jinak `is_player` / `human`; jinak id účtu (`user_id`, `steam_id`; prázdné nebo 0 je AI); u záznamů Tacview, zda má objekt pilota |
| **Třída vozidla** | 17 tříd: Stíhačka, Útočné letadlo, Bombardér, Jiné letadlo, Vrtulník, Tank, Obrněné vozidlo, Protiletadlová obrana, Dělostřelectvo, Nákladní auto / auto, Loď, Ponorka, Pěchota, Zbraň, Návnada, Stavba, Jiné | název vozidla nebo jednotky (porovnaný s [katalogem figur](figures.md)) a sloupce typu |
| **Třída cíle** | stejné třídy | vozidlo protistrany (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Vypisují se jen druhy, které se vyskytují. Hodnotové sloupce (`cost_*`, `earn_*`, `net_*` a *Zdroj ceny*, viz [Vážení hodnotou](value-weighting.md)) se filtrují jako každý číselný sloupec: například odškrtnutím *odhad* pod *Zdroj ceny* ponecháte jen ocenění řádky.

Seznam kategorie s více než 12 hodnotami dostane vyhledávací pole (*Hledat n hodnot*) a tlačítko **Jen tyto**, které povolí přesně hodnoty odpovídající hledání.

To, které sloupce lze filtrovat, se rozhoduje při načítání, protože se musí přečíst tehdy. Bez ponechaného sloupce to panel řekne a odkáže na *Ponechat pro filtrování*.

## Číselné sloupce (rozsah) {#numeric-columns-range}

![Filtr rozsahu (ztracené peníze) s oběma konci posunutými](../assets/img/en/filters-numeric.webp)

| Část | Význam |
|---|---|
| Název a `min ... max` | Sloupec a aktuální rozsah (celý rozsah sloupce, dokud není nastaven filtr). |
| První řádek: číselné pole a posuvník | Dolní mez. Posunutí posuvníku nad horní mez s sebou táhne i horní mez. |
| Druhý řádek: číselné pole a posuvník | Horní mez. Posunutí pod dolní mez táhne i ji. |
| **Obnovit *sloupec*** | Odstraní tento filtr. |

Posuvníky pokrývají od minima do maxima sloupce v 1 000 krocích; číselná pole přijmou libovolnou hodnotu. Řádek projde, když jeho hodnota leží v rozsahu, včetně obou konců. Velké hodnoty se zobrazují v exponentovém tvaru (`1.23e6`).

## Kategoriální sloupce {#category-columns}

| Část | Význam |
|---|---|
| Název a `povoleno/celkem` | Sloupec a kolik jeho hodnot je povoleno. |
| Seznam hodnot | Zaškrtávátko u každé hodnoty; prázdná hodnota se zobrazuje jako *(prázdné)*. |
| **Vše** / **Nic** | Povolit každou hodnotu / žádnou hodnotu. |

Povolení všech hodnot filtr odstraní.

## Pravidla {#rules}

- **Čtyři filtry najednou.** Hlavička ukazuje `aktivní/4`. Pátý filtr se neuplatní a panel to řekne. Výběr v [Entitách](entities.md) (nebo zaměření na hráče na kartě Zápas) používá jeden ze čtyř. Filtr, který pokrývá celý sloupec, žádný nepoužije.
- **Kategoriální sloupec má nejvýš 4 096 hodnot**; širší se při načtení neponechá.
- **Filtry se kombinují logicky A**, a s viditelností týmů, rozdělením rozdílu, časovým oknem, vyřazením podle vzdálenosti a [řezem](slice.md).
- **Změna filtru restartuje akumulaci a o několik snímků později znovu změří expozici**, protože filtrování může hustotu hodně změnit ([Barva a expozice](colour-and-exposure.md#auto-exposure)).
- **Vymazat všechny filtry** odstraní každý filtr sloupce. Viditelnost týmů a výběry hráčů nastavené jinde zůstávají.
- Filtry sloupců mění režimy tepla. Nemění figury [přehrání figur](box-replay.md), které se řídí viditelností týmů a výběrem v Entitách. Výběr v Entitách mění obojí.
- V [čárovém teple](line-heat.md) se filtr testuje na řádku, kde úsek *končí*.
- Při každé nové datové sadě se všechny filtry vymažou.

## Pro vývojáře {#for-developers}

**Sloty.** Každý aktivní filtr zabírá jeden ze čtyř slotů GPU ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), texturu se 4 bajty na řádek. Sloty se přidělují filtrům v pořadí, v jakém se naposledy měnily ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), sdílené shaderem i oběma panely). Nad čtyři se objeví chyba *Only the first 4 filters are applied. Clear one - the rest are being ignored, not silently combined*, a názvy dalších filtrů čtou *sloupec (not applied)*. Filtry běží na řádek ve vertex shaderu, takže změna prahu nevyžaduje nové parsování ani nové nahrání.

**Filtry, které panel nezobrazuje.** V stavu aplikace existují ještě dva druhy ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- filtr **skupin**, nastavený kartou Zápas, když se zaměří na jednu stranu. Skryje ostatní skupiny ve všech režimech, včetně [rozdílu](difference.md) rozděleného podle sloupce.
- filtr **osob**, nastavený panelem [Entity](entities.md) a kartou Zápas, když se zaměří na jednoho hráče. Omezuje přehrání figur a režimy tepla. V teple je to kategoriální filtr přes id osob a zabírá jeden ze čtyř slotů. Jeho maska drží 65 536 id ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); osoba za tímto limitem se v teple nekreslí, dokud je filtr aktivní, i když je vybraná. Přehrání figur je stále zobrazuje.
