---
title: "Entity"
parent: "Filtry a nástroje"
nav_order: 3
lang: "cs"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entity

**Entity** vám umožní vybrat jednoho hráče (nebo několik) a vidět jen, kam ten hráč šel. Použijte ho, když chcete sledovat svůj vlastní pohyb nebo jednoho protivníka.

Panel se ukáže, když datová sada má sloupec osoby. Jeho záhlaví ukazuje počet osob, nebo `vybráno z celkem`, když je výběr aktivní (*osoba* je jeden hráč nebo AI, viz [slovníček](glossary.md)).

## Výběr hráče {#pick-a-player}

1. Otevřete **Entity** v postranním panelu.
2. Napište do vyhledávacího pole část jména.
3. Zaškrtněte hráče. Záhlaví ukáže například `2 z 10` a všechno ostatní zmizí.
4. **Vymazat** zobrazí všechny znovu.

![Entity s dvěma z deseti hráčů vybranými](../assets/img/en/entities-selected.webp)

Výběr ukazuje jen vybrané osoby, v režimech tepla (body, čáry, rozdíl, týmové teplo) i v trasách, figurách a stopách [překryvu figur](box-replay.md). Když je prázdný, ukazuje všechny; vybrat všechny je totéž jako nevybrat nikoho.

## Panel {#the-panel}

| Část | Význam |
|---|---|
| Vyhledávací pole | *Hledat N entit...* – filtruje seznam podle podřetězce názvu bez ohledu na velikost písmen. Ukáže `N shod`, nebo `N shod, zobrazeno prvních 200`; *Nic neodpovídá „...“*, když hledání nic nenajde. |
| Seznam | Až 200 osob (prvních 200 shodných), každá se zaškrtávacím políčkem, vzorkem barvy osoby a názvem (*(bez názvu)* u prázdného názvu). |
| Nápověda o hře | Když běží čas, seznam drží ty, *které hrají v playheadu*; hledání najde všechny. |
| **AI (n)** | Sbalitelná skupina s jednotkami řízenými AI, odděleně od hráčů. |
| **Přidat zobrazené** | Přidá do výběru všechny právě uvedené. |
| **Jen zobrazené** | Nastaví výběr přesně na uvedené. |
| **Vymazat** | Vyprázdní výběr. |

## Limity {#limits}

V teplu je výběr filtr a používá jeden ze čtyř [slotů filtrů](filters.md#rules). Když ostatní filtry už zabírají všechny čtyři, panel napíše *Na teplo se nepoužije: všechny sloty filtrů jsou obsazené. Překryv figur stále ukazuje jen tyto entity. Vymažte filtr v Filtrech, abyste uvolnili jeden.* Vymažte filtr, abyste uvolnili slot.

Výběr se vymaže při každé nové datové sadě. Karta Zápas nastaví stejný výběr, když zaostří na jednoho hráče.

## Pro vývojáře {#for-developers}

Výběr se ukládá jako filtr *persons* ([Filtry](filters.md#for-developers)). Maska shaderu drží 65 536 id osob; osoba za tím se v teple, je-li výběr aktivní, nekreslí.
