---
title: "Entity"
parent: "Filtre a nástroje"
nav_order: 3
lang: "sk"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---


# Entity

**Entity** vám umožní vybrať jedného hráča (alebo niekoľkých) a vidieť len, kam ten hráč išiel. Použite ho na sledovanie vlastného pohybu alebo jedného súpera.

Panel sa zobrazí, keď dataset má stĺpec osôb. Jeho hlavička ukáže počet osôb, alebo `vybrané z celkových` počas aktívneho výberu (*osoba* je jeden hráč alebo AI, pozri [slovník](glossary.md)).

## Výber hráča {#pick-a-player}

1. Otvorte **Entity** na bočnom paneli.
2. Napíšte časť mena do vyhľadávacieho poľa.
3. Zaškrtnite hráča. Hlavička ukáže napríklad `2 z 10` a všetko ostatné zmizne.
4. **Vymazať** znovu ukáže všetkých.

![Entity s dvoma z desiatich hráčov vybranými](../assets/img/en/entities-selected.webp)

Výber ukáže len vybrané osoby, v režimoch tepla (body, čiary, rozdiel, teplo tímov), aj v stopách, figúrkach a záhradách [prehrávania figúrok](box-replay.md). Nechajte ho prázdny, ak chcete ukázať všetkých; vybrať všetkých je to isté ako nevybrať nikoho.

## Panel {#the-panel}

| Časť | Význam |
|---|---|
| Vyhľadávacie pole | *Hľadať N entít...* - filtruje zoznam podľa podreťazca mena bez ohľadu na veľkosť písmen. Zobrazí `N zhôd`, alebo `N zhôd, zobrazených prvých 200`; *Nič nezodpovedá „...“*, keď hľadanie nič nenájde. |
| Zoznam | Najviac 200 osôb (prvých 200 zhodných), každá s políčkom, vzorkou farby osoby a menom (*(bez mena)* pri prázdnom mene). |
| Nápoveda o hraní | Keď sa čas prehráva, zoznam obsahuje tie, ktoré sú *v hre pri prehrávacej hlave*; hľadanie nájde všetky. |
| **AI (n)** | Zbaliteľná skupina s jednotkami ovládanými AI, okrem hráčov. |
| **Pridať zobrazené** | Pridá do výberu každého, kto je teraz v zozname. |
| **Iba zobrazené** | Urobí výber presne z tých, čo sú v zozname. |
| **Vymazať** | Vyprázdni výber. |

## Limity {#limits}

V teple je výber filter a používa jeden zo štyroch [miest pre filtre](filters.md#rules). Keď ostatné filtre už používajú všetky štyri, panel napíše *Neuplatnené na teplo: všetky miesta pre filtre sú obsadené. Prehrávanie figúrok stále ukazuje len tieto entity. Vymažte filter v Filtroch, aby sa uvoľnilo miesto.* Vymažte filter, aby sa uvoľnilo miesto.

Výber sa vymaže pri každom novom datasete. Karta Zápas nastaví ten istý výber, keď sa zameria na jedného hráča.

## Pre vývojárov {#for-developers}

Výber sa ukladá ako filter *osôb* ([Filtre](filters.md#for-developers)). Maska shaderu drží 65 536 id osôb; osoba nad tento počet sa v teple pri aktívnom výbere nekreslí.
