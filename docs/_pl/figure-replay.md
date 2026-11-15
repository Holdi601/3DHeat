---
title: "Sylwetki w nakładce"
parent: "Sylwetki"
grand_parent: "Replay"
nav_order: 2
lang: "pl"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figury w nakładce figur

Ta strona opowiada o zamianie pudełek w małe figury 3D tego, czym naprawdę była każda jednostka, oraz o dymie i ogniu, które figury zostawiają za sobą. Sterowanie samą powtórką jest opisane na stronie [Powtórka meczu](match-replay.md).

W [powtórce pudełek](box-replay.md) i w powtórce figur w karcie Mecz opcja **Figury zamiast sześcianów** (domyślnie włączona) rysuje każdą żywą osobę jako figurę tego, kim jest: żołnierza na piechotę, czołg, którym ktoś jedzie, albo samolot, którym jest ślad Tacview. Figura ma kolor, miejsce i kierunek pudełka. Dla samolotów i pocisków ma też pochylenie i, gdy dane mają kolumnę Roll, przechył. **Rozmiar figur** je skaluje; 1 razy to rozmiar prawdziwy. Kliknięcia na figurę działają tak, jak działały na jej pudełko.

## Która figura {#which-figure}

Decydują własne kolumny nazwy i typu z danych. Pełne zasady, z nazwami kolumn, są na stronie [Figury](figures.md#which-figure-a-unit-gets). Dane bez żadnego z tych rodzajów kolumn to dane o ludziach: każdy jest żołnierzem.

Dopasowanie jest zapamiętywane dla każdej etykiety, więc klatka kosztuje tylko ustawienie figury. Jednostka danych to metr, chyba że dane mówią, jak duża jest jedna śledzona rzecz (eksport CS2 mówi, że gracz ma 32 jednostki szerokości); figury są skalowane do tego.

Opcjonalny pakiet własnych figur może zastąpić figury z katalogu na twoim komputerze; zobacz [Figury](figures.md#an-optional-local-figure-pack).

## Efekty {#effects}

Wiersze zdarzeń, które na chwilę zostawiają coś po sobie, są rysowane tam, gdzie się wydarzyły, tak długo, jak trwają, w kolorze tego, kto je spowodował: dym (około 18 s), koktajl Mołotowa albo zapalający (7 s), błysk (około sekundy) i wybuch HE (poniżej sekundy), wabik (15 s), podłożona bomba (40 s). Pochodzą z kolumny zdarzeń (Event, Events), której etykieta to `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` albo `plant` - eksport CS2 zapisuje je w chwili detonacji.

## Powtórka meczu: narzędzia Tacview {#match-replay-tacviews-tools}

Kamery, zakładki, wyświetlacz taktyczny, statystyki, etykiety, **Linie pionowe**, lista zdarzeń i okno wykresów są opisane na stronie [Powtórka meczu](match-replay.md). [Zgodność z Tacview](tacview-parity.md) wymienia każdą funkcję Tacview i to, na jakim jest etapie.
