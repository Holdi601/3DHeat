---
title: "Sylwetki"
parent: "Replay"
nav_order: 3
has_children: true
lang: "pl"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figury

**Figura** to mały model 3D tego, czym jest jednostka naprawdę: czołg, odrzutowiec, statek, żołnierz. [Powtórka](match-replay.md) rysuje każdą jednostkę jako jej figurę w prawdziwym rozmiarze, zamiast zwykłego pudełka.

Jest około 2000 nazwanych pojazdów, samolotów, statków, broni i żołnierzy, wszystkie zbudowane przez samą przeglądarkę.

![Czołgi z wersji demonstracyjnej narysowane jako ich własne figury](../assets/img/pl/replay-tanks.webp)

## Co jest w katalogu {#what-is-in-the-catalogue}

| Dziedzina | Przykłady |
|---|---|
| Ludzie | żołnierz stojący, kucający, leżący; snajper, przeciwpancerny, medyk, załoga |
| Ląd | czołgi, bojowe wozy piechoty, obrona przeciwlotnicza, artyleria, ciężarówki i samochody, pociągi i tramwaje |
| Powietrze | myśliwce, samoloty szturmowe, bombowce, transportowe, helikoptery, od dwupłatów po nowoczesne odrzutowce |
| Morze | okręty wojenne według klasy, lotniskowce, okręty podwodne, łodzie, statki handlowe |
| Broń | pociski, rakiety, bomby, torpedy, flary i chaff |
| Znaczniki | granaty dymne, błyskowe i zapalające, podłożone bomby, flagi, miejsca pojawiania się, punkty trasy |

## Jak powstają figury {#how-the-figures-are-made}

- **Zbudowane z publikowanych wymiarów.** Większość figur tworzy własny konstruktor figur przeglądarki z publicznych liczb: długość, szerokość, wysokość, koła jezdne, wieża i działo, skrzydła i ogon. Ich kształt jest potem dostrajany według publicznych zdjęć, rysunków i opublikowanych wymiarów. Nie są używane modele żadnej gry.
- **Darmowe modele.** Kilka figur używa darmowych modeli 3D (CC0 lub CC BY), tam gdzie są bardziej wierne, czasem łącząc je ze zbudowanym kadłubem. Autorzy utworów CC BY są wymienieni w [Autorzy sylwetek](figure-credits.md); utwory CC0 nie wymagają podania autorstwa i nie są tam wymienione.
- Każda figura ma wersję pełną, uproszczoną i daleką (poziomy szczegółowości, LOD), dzięki czemu można narysować tysiące naraz.

## Jaką figurę dostaje jednostka {#which-figure-a-unit-gets}

Przeglądarka patrzy na własne kolumny danych:

1. **Nazwy** - kolumny o nazwach *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* albo *Figure* - są porównywane z katalogiem: dokładnie, przez około 4000 aliasów (identyfikatory jednostek w wielu grach), po najdłuższym znanym początku (`F-16C_50` to F-16C) albo po najkrótszej nazwie figury, która się od niego zaczyna.
2. Nazwa, której figura nie pasuje do **typu** jednostki, nie jest używana (ciężarówka o nazwie *Typhoon* nie jest myśliwcem).
3. **Typy** - kolumny o nazwach *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* albo *Domain* - dają figurę klasy: znaczniki Tacview (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), ikony mapy albo zwykłe słowa (tank, helicopter, infantry).
4. Dane bez żadnej z nich to dane o ludziach: każdy jest żołnierzem.

Najprostszy sposób na właściwe figury to więc kolumna `vehicle` z prawdziwymi nazwami albo kolumna `type` ze znacznikami Tacview.

**Moja jednostka pokazuje się jako pudełko albo żołnierz.** Dodaj kolumnę `vehicle` z prawdziwą nazwą albo kolumnę `type` ze znacznikiem Tacview. Najedź na jednostkę, aby zobaczyć, która nazwa została dopasowana. Dane, które mają takie kolumny, ale nic nie mówią o jednostce, zostawiają ją jako pudełko; dane bez żadnej z nich są rysowane jako żołnierze.

## Ustawienia {#settings}

Sekcja **Figury** w pasku bocznym powtórki ustawia rozmiar, najmniejszy rozmiar na ekranie, to, w co zmieniają się odległe jednostki (figura, strzałka, symbol), oraz efekty rysowane na nich. Zobacz [Powtórka meczu](match-replay.md#figures). Dym, ogień i inne efekty czasowe: [Figury w nakładce figur](figure-replay.md).

## Opcjonalny lokalny pakiet figur {#an-optional-local-figure-pack}

Możesz trzymać na swoim komputerze opcjonalny pakiet własnych figur. Jego figury zastępują figury z katalogu o tych samych nazwach. Nigdy nie jest częścią repozytorium ani opublikowanej wersji; bez niego nic się nie zmienia.
