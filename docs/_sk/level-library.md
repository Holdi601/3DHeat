---
title: "Knižnica levelov"
parent: "Levely a geometria pozadia"
nav_order: 4
lang: "sk"
source: "level-library.md"
source_hash: "23ff3290af7e"
translated: true
outdated: false
---


# Knižnica úrovní

Knižnica uchováva vaše úrovne v tomto prehliadači, takže ich nemusíte znovu načítať a zjednodušovať. **Vymazanie údajov stránky v prehliadači vymaže knižnicu a neexistuje export.** Uschovajte si pôvodné súbory.

Spracovanie úrovne - rozbor, klasifikácia, zváranie, decimácia, balenie textúr - je pomalé a výsledok je zakaždým rovnaký. **Knižnica** v dolnej časti panela Pozadie / úroveň uchováva spracované úrovne v tomto prehliadači, takže zjednodušená sieť sa nikdy nestavia dvakrát ([`levelLibrary.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/levelLibrary.ts)).

## Uloženie a znovunačítanie úrovne {#save-and-reload-a-level}

1. Načítajte obraz mapy alebo 3D model a skontrolujte, že vyzerá správne.
2. Stlačte **Uložiť do knižnice**. Panel napíše *Uložené. Ďalší raz sa načíta okamžite.*
3. Nabudúce otvorte zoznam **Knižnica** a stlačte ▸ pri úrovni.
4. Stlačte ✕, ak odstránite položku, ktorú už nepotrebujete.

## Používanie {#using-it}

| Ovládač | Účinok |
|---|---|
| **Uložiť do knižnice** | Uloží aktuálnu úroveň. Obraz mapy sa uloží ako PNG s oboma kotvami; model ako jeho spracované buffery. Panel napíše *Uložené. Ďalší raz sa načíta okamžite.* |
| Zoznam knižnice | Jeden riadok na uloženú úroveň: názov (s jej uloženou veľkosťou po podržaní myši), trojuholníky pri modeli alebo šírka v pixeloch pri obraze. |
| ▸ (*Načítať*) | Načíta položku ako aktuálnu úroveň. |
| ✕ (*Vymazať*) | Odstráni položku. |
| Riadok využitia | `Používa sa X z Y.` - odhad úložiska prehliadača pre túto stránku. |

Keď nič nie je uložené, zoznam napíše *Prázdne. Načítajte mapu alebo model, potom „Uložiť do knižnice“.*

## Čo sa ukladá {#what-is-stored}

| Druh | Uložené | Neuložené |
|---|---|---|
| Obraz mapy | Obraz (PNG), jeho veľkosť, jeho kotvy | Výška, prevrátenie, nepriehľadnosť, jas, odfarbenie - obnoví sa na predvolené hodnoty (výška = najnižšie Y aktuálneho datasetu, prevrátenie zapnuté) |
| 3D úroveň | Vrcholy, farby vrcholov, súradnice textúr, ich dlaždice a atlas textúr, trojuholníky terénu / štruktúr / vody, hrany štruktúr, počty trojuholníkov | Názvy častí a dôvody klasifikácie a každé nastavenie vzhľadu - obnoví sa na predvolené hodnoty čerstvého importu |

Model načítaný z knižnice nemá zoznam častí a jeho hranice a pás výšky terénu sa prepočítajú z jeho vrcholov.

## Kde sa nachádza {#where-it-lives}

V IndexedDB prehliadača, databáza `3dheat`, úložisko objektov `levels`, pre pôvod stránky (adresa v adresnom riadku prehliadača). Je lokálna pre tento profil prehliadača: iný prehliadač, iný profil alebo iná adresa (napríklad `localhost` namiesto `127.0.0.1`) vidí inú, prázdnu knižnicu. Vymazanie údajov stránky v prehliadači ju odstráni. Položky uložené staršími verziami bez štruktúr, farieb alebo vody sa stále načítajú.
