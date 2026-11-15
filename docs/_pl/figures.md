---
title: "Sylwetki"
nav_order: 11
has_children: true
lang: "pl"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figury

**Figura** to mały model 3D tego, czym naprawdę jest jednostka: czołgiem, odrzutowcem, okrętem, żołnierzem. [Powtórka](match-replay.md) rysuje każdą jednostkę jako jej figurę w rozmiarze prawdziwym, zamiast zwykłego pudełka.

Jest około 2000 nazwanych pojazdów, samolotów, okrętów, broni i żołnierzy, wszystkie zbudowane przez samą przeglądarkę.

![Czołgi z demo narysowane jako własne figury](../assets/img/en/replay-tanks.webp)

## Co jest w katalogu {#what-is-in-the-catalogue}

| Dziedzina | Przykłady |
|---|---|
| Ludzie | żołnierz stojący, kucający, leżący; snajper, przeciwpancerny, medyk, załoga |
| Ląd | czołgi, bojowe wozy piechoty, obrona przeciwlotnicza, artyleria, ciężarówki i samochody, pociągi i tramwaje |
| Powietrze | myśliwce, samoloty szturmowe, bombowce, transportowce, helikoptery, od dwupłatów po nowoczesne odrzutowce |
| Morze | okręty wojenne według klas, lotniskowce, okręty podwodne, łodzie, statki handlowe |
| Uzbrojenie | rakiety, pociski kierowane, bomby, torpedy, flary i plewy |
| Znaczniki | granaty dymne, błyskowe i zapalające, podłożone bomby, flagi, spawny, punkty trasy |

## Jak powstają figury {#how-the-figures-are-made}

- **Zbudowane z publicznych wymiarów.** Większość figur powstaje w budowniczym figur przeglądarki z publicznych liczb: długość, szerokość, wysokość, koła jezdne, wieża i działo, skrzydła i ogon. Ich kształt jest następnie dostrajany według publicznych zdjęć, rysunków i opublikowanych wymiarów. Nie używa się modeli żadnej gry.
- **Darmowe modele.** Kilka figur używa darmowych modeli 3D (CC0 albo CC BY) tam, gdzie są prawdziwsze, czasem łącznie ze zbudowanym kadłubem. Autorzy prac CC BY są wymienieni na [Autorzy sylwetek](figure-credits.md); prace CC0 nie wymagają podpisu i nie są tam wypisywane.
- Każda figura ma wersję pełną, uproszczoną i dalekiego zasięgu (poziomy szczegółowości, LOD), dzięki czemu można narysować tysiące naraz.

## Jaką figurę dostaje jednostka {#which-figure-a-unit-gets}

Przeglądarka patrzy na własne kolumny danych:

1. **Nazwy** - kolumny o nazwach *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* albo *Figure* - są dopasowywane do katalogu: dokładnie, przez około 4000 aliasów (identyfikatory jednostek z kilku gier), przez najdłuższy znany początek (`F-16C_50` to F-16C) albo przez najkrótszą nazwę figury, która się od niego zaczyna.
2. Nazwa, której figura nie pasuje do **typu** jednostki, nie jest używana (ciężarówka nazwana *Typhoon* nie jest myśliwcem).
3. **Typy** - kolumny o nazwach *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* albo *Domain* - dają figurę klasy: znaczniki Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikony map albo zwykłe słowa (tank, helicopter, infantry).
4. Dane z żadną z nich to dane o ludziach: każdy jest żołnierzem.

Najprostszy sposób na właściwe figury to więc kolumna `vehicle` z prawdziwymi nazwami albo kolumna `type` ze znacznikami Tacview.

**Moja jednostka pokazuje się jako sześcian albo żołnierz.** Dodaj kolumnę `vehicle` z prawdziwą nazwą albo kolumnę `type` ze znacznikiem Tacview. Najedź na jednostkę, aby zobaczyć, która nazwa została dopasowana. Dane mające takie kolumny, ale nic nie mówiące o danej jednostce, zostawiają ją jako sześcian; dane bez żadnej z nich są rysowane jako żołnierze.

## Ustawienia {#settings}

Sekcja **Figury** w pasku bocznym powtórki ustawia rozmiar, najmniejszy rozmiar na ekranie, to, czym stają się jednostki z daleka (figura, strzałka, symbol), oraz efekty rysowane na nich. Zob. [Powtórka meczu](match-replay.md#figures). Dym, ogień i inne efekty z czasem: [Sylwetki w nakładce](figure-replay.md).

## Opcjonalny lokalny pakiet figur {#an-optional-local-figure-pack}

Możesz trzymać na własnym komputerze opcjonalny pakiet własnych figur. Jego figury zastępują figury katalogu o tych samych nazwach. Nigdy nie jest częścią repozytorium ani opublikowanej wersji; bez niego nic się nie zmienia.
