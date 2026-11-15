---
title: "Sylwetki"
parent: "Replay"
nav_order: 3
has_children: true
lang: "pl"
source: "figures.md"
source_hash: "7040eba3b7ac"
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
| Walka na bliskim dystansie | żołnierze w kamizelkach na płyty z karabinem szturmowym, pistoletem maszynowym, strzelbą, DMR, LMG, pistoletem albo tarczą; drony, kamery, drut kolczasty, tarcze, wzmocnienia ścian, barykady, ładunki wyważające, pułapki, okna, granaty, rozbrajacz |

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

## Figury do walki na bliskim dystansie (Rainbow Six Siege) {#close-quarters-figures-rainbow-six-siege}

Tabele zapisane tak jak w czytniku powtórek Rainbow Six Siege (kolumny `operator`, `pawn`, `primaryClass`, `side`) dostają własne figury:

- **Gracze** są swoim agentem: każdy z 78 agentów ma własną figurę, około 1,8 m wzrostu, we własnym ubraniu. Dwa lub trzy kolory kurtki, spodni i wyposażenia odpowiadają jego zwykłemu publicznemu wyglądowi (czarny, oliwkowy, piaskowy, miejski szary, biały, granatowy, z czerwonym, pomarańczowym lub morskim wyposażeniem). Ma też własne kształty, o jedną trzecią większe niż w rzeczywistości tam, gdzie muszą być widoczne z góry: nakrycie głowy (hełmy, przyłbica albo ciężki hełm, czapki z daszkiem, czapki zimowe, berety, szeroki kapelusz polowy albo futrzana czapka, kaptury, szaliki, włosy), twarz (gogle, maska przeciwgazowa, okulary, maska, broda, gogle z trzema soczewkami), lekka, średnia albo ciężka budowa (ciężcy są szerocy, z dużymi naramiennikami i kołnierzem), długi płaszcz albo garnitur, strój ghillie, to, co nosi na plecach (młot, ładunki, drony, kanistry, zbiornik paliwa, rurę wyrzutni, kuszę, panele, zagłuszacz, tarczę) albo na ramieniu (wyrzutnię, metalowe ramię), własna tarcza (wysoka, policyjna, z lampami) i kolor akcentu na barkach. Trzyma klasę swojej broni głównej. Agent, którego przeglądarka nie zna, to zwykły żołnierz w kamizelce na płyty w kolorze drużyny.
- **Strona** jest widoczna niezależnie od ubrania: pierścień na ziemi pod każdym agentem, **bursztynowy dla ataku, jasnocyjanowy dla obrony**, z kolorem drużyny w środku, oraz opaski na ramię i na głowę w tym samym kolorze. Kolumna `stance` (stand, crouch, prone) nadaje im postawę; bez niej stoją.
- **Rozróżnialni z odległości powtórki:** narysowani na 48 pikseli wysokości, z góry i w widoku trzy czwarte, każdych dwóch agentów jednej strony różni się wyraźnie kolorem albo innym kształtem (sprawdzają to testy przeglądarki).
- **Etykiety** podają gracza i agenta, którym gra w danej chwili, z rolą agenta jako symbolem: ✸ twarde wyważanie, ⚒ miękkie wyważanie, ➤ wejście, ✦ fragger, ✚ wsparcie, ⬟ tarcza, ◉ rozpoznanie, ◇ elastyczny, ↺ straż flanki, ⚓ kotwica, ✕ pułapki, ⇄ roamer, ↯ antygadżet, ▣ przeciw wyważaniu.
- **Drony** to rzucany dron na dwóch kołach, około 30 cm szerokości. Każdy jest osobnym śladem, nazwanym od właściciela („Ash · drone 2”).
- **Postawione gadżety** stoją tam, gdzie je postawiono, od tej chwili do końca rundy. Każdy jest figurą tego, co robi: kamera, drut kolczasty, rozkładana tarcza, ładunek wyważający, ciężki ładunek wyważający, mały ładunek przylepny, pułapka podłogowa, mina claymore z laserem wyzwalającym, okno jednostronne, panel pancerny, granat, kanister z gazem, zagłuszacz, czujnik, bramka laserowa, skrzynka z zaopatrzeniem. Jedna figura służy wszystkim gadżetom o tym samym zadaniu. Gadżet, którego rodzaju dane nie podają, to małe urządzenie ze światełkiem.
- **Rozbrajacz** stoi tam, gdzie go podłożono, przez swoje 45 sekund.

Każdy dron i każdy gadżet staje się osobnym śladem przy wczytywaniu pliku. Dzięki temu figura gracza zostaje przy jego ciele. Agenci to uproszczone kształty według ich publicznych opisów i grafik (co noszą, urządzenie będące ich zdolnością). Gadżety mają kształt tego, co robią. Wszystko to są własne projekty przeglądarki w prawdziwej wielkości danej rzeczy (mina claymore ma około 22 cm szerokości, panel wielkości drzwi 1 m na 2,1 m), a nie modele z gry.

## Ustawienia {#settings}

Sekcja **Figury** w pasku bocznym powtórki ustawia rozmiar, najmniejszy rozmiar na ekranie, to, w co zmieniają się odległe jednostki (figura, strzałka, symbol), oraz efekty rysowane na nich. Zobacz [Powtórka meczu](match-replay.md#figures). Dym, ogień i inne efekty czasowe: [Figury w nakładce figur](figure-replay.md).

## Opcjonalny lokalny pakiet figur {#an-optional-local-figure-pack}

Możesz trzymać na swoim komputerze opcjonalny pakiet własnych figur. Jego figury zastępują figury z katalogu o tych samych nazwach. Nigdy nie jest częścią repozytorium ani opublikowanej wersji; bez niego nic się nie zmienia.
