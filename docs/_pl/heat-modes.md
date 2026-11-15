---
title: "Tryby ciepła"
nav_order: 4
has_children: true
lang: "pl"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Tryby ciepła

Każda kropka dodaje odrobinę blasku, blaski się piętrzą, a stos jest malowany kolorami. Tryby to pięć sposobów malowania, a każdy odpowiada na jedno pytanie.

Pasek trybów na górze paska bocznego karty Mapa cieplna wybiera, jak rysowany jest [zbiór danych](glossary.md). Klawisze 1-4 wybierają Ciepło, Różnicę, Ciepło drużyn i Linie. Nakładka sylwetek nie ma klawisza.

![Pasek trybów z Ciepło, Różnica, Ciepło drużyn, Nałożone figury i Linie](../assets/img/en/heat-modes-bar.webp)

| Tryb | Pytanie, na które odpowiada |
|---|---|
| **Ciepło** | Gdzie to się działo i ile tego było? |
| **Różnica** | Która strona robiła tego więcej? |
| **Ciepło drużyn** | Czyje to było? |
| **Linie** | Którędy szli ludzie? |
| **Nałożone figury** | Kto był gdzie i kiedy? |

![Te same dane w czterech trybach: Ciepło, Różnica, Ciepło drużyn i Linie](../assets/img/en/heat-modes-grid.webp)

| Tryb (etykieta na pasku) | Klawisz | Co rysuje | Potrzebuje |
|---|---|---|---|
| **Ciepło** | 1 | Gęstość addytywna: każdy widoczny wiersz dodaje promieniowy sprite zwrócony do kamery. [Ciepło](heat.md) | zbioru danych |
| **Różnica** | 2 | Gęstość ze znakiem: jedna populacja dodaje, inna odejmuje. [Różnica](difference.md) | dwóch stron: co najmniej dwóch grup albo podziału po zachowanej kolumnie |
| **Ciepło drużyn** | 3 | Gęstość pokolorowana według grupy: barwa dla każdej grupy, mieszana tam, gdzie grupy się nakładają. [Ciepło drużyn](team-heat.md) | kolumny grupy |
| **Nałożone figury** | - | Figura (albo pudełko) dla każdej osoby, poruszająca się po osi czasu: powtórka. [Nakładka sylwetek](box-replay.md), [Powtórka meczu](match-replay.md) | kolumny osoby |
| **Linie** | 4 | Ciepło liniowe: linia od każdej próbki osoby do jej następnej, z ciepłem opadającym na boki. [Ciepło liniowe](line-heat.md) | kolumny osoby i czasu |

Tryb, którego dane nie obsługują, jest wyszarzony, a jego podpowiedź podaje powód, na przykład *Niedostępne - tryb Różnica potrzebuje dwóch grup albo zachowanej kolumny do podziału; te dane mają jedną grupę.* Gdy nowy zbiór danych nie obsługuje bieżącego trybu, widok wraca do **Ciepło**.

Klawisze 1-4 są sprawdzane wobec danych tak samo: klawisz trybu wyszarzonego nic nie robi.

## Które panele pokazuje każdy tryb {#which-panels-each-mode-shows}

| Panel | Ciepło | Różnica | Ciepło drużyn | Nałożone figury | Linie |
|---|---|---|---|---|---|
| Trasy ([ciepło liniowe](line-heat.md)) | | | | | tak |
| Kształt ciepła (z **Podążaj za widokiem** i **Ta sama gęstość przy każdym powiększeniu**), Kolory ciepła, Ograniczenia pikseli sprite'ów, Głębia, Odrzucanie według odległości | tak | tak | tak | | tak |
| Kierunek ([ciepło kierunkowe](directional-heat.md)), Wartość ([ważenie wartością](value-weighting.md)) | tak | tak | tak | | tak |
| Widok drużyn ([nakładka sylwetek](box-replay.md)) | | | | tak | |
| Podział różnicy ([różnica](difference.md)) | | tak | | | |
| [Drużyny](teams-list.md), [Obiekty](entities.md), [Filtry](filters.md), Tło / poziom, [Przekrój](slice.md), [Pomiar](measure.md), Ścieżka kamery i render, Wydajność, Kamera i scena | tak | tak | tak | tak | tak |

## Co wspólnego mają wszystkie tryby ciepła {#what-every-heat-mode-shares}

Wszystkie cztery tryby ciepła (wszystko poza nakładką sylwetek) to ta sama maszyna z różnymi wejściami ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Które wiersze.** [Oś czasu](timeline.md) wybiera ciągły zakres wierszy posortowanych według czasu; [filtry](filters.md), widoczność grup, podział różnicy, [odrzucanie według odległości](depth-and-culling.md#distance-culling) i [przekrój](slice.md) decydują dla każdego wiersza, w shaderze wierzchołków, czy i jak mocno się liczy.
2. **Splatting.** Każdy wiersz, który się liczy, jest rysowany jako sprite (albo w trybie Linie jako odcinek) do zmiennoprzecinkowego **celu ciepła**, dodając swoją wartość z rampy. Gdy wierszy jest więcej, niż klatka udźwignie, rysowana jest warstwowo wybrana próbka wierszy, ważona tak, by to wyrównać. Zob. [Próbkowanie i budżety](sampling-and-budgets.md).
3. **Akumulacja.** Dopóki nic się nie zmienia, klatki są łączone, aż każdy wiersz wniesie dokładnie jeden wkład. Zob. [Akumulacja](accumulation.md).
4. **Kompozycja.** Zakumulowana wartość w każdym pikselu jest dzielona przez **punkt nasycenia**, kształtowana przez **odpowiedź gęstości**, podnoszona przez **minimalne ciepło** i odczytywana z **rampy kolorów**, której przezroczystość miesza ją ze sceną. Zob. [Kolor i ekspozycja](colour-and-exposure.md).

Wszystko z kroku 4 jest stosowane przy kompozycji, więc przeciąganie tych suwaków nigdy nie zaczyna akumulacji od nowa; wszystko z kroków 1-2 - zaczyna.

## Strony w tej sekcji {#pages-in-this-section}

- [Ciepło](heat.md) - zwykły tryb ciepła i przegląd jego paneli
  - [Kształt sprite'a](sprite-shape.md) - promień, intensywności, opadanie, edytor krzywej, ograniczenia pikseli, spłaszczanie
  - [Kolor i ekspozycja](colour-and-exposure.md) - edytor rampy, punkt nasycenia, automatyczna ekspozycja, minimalne ciepło, odpowiedź gęstości
  - [Głębia i odrzucanie](depth-and-culling.md) - zasłanianie przez poziom, ukrywanie za terenem, odrzucanie według odległości
- [Różnica](difference.md) - podział różnicy
- [Ciepło drużyn](team-heat.md)
- [Ciepło liniowe](line-heat.md) - trasy
- [Nakładka sylwetek](box-replay.md) - tryb powtórki (plik wciąż nosi nazwę box-replay)
- [Ciepło kierunkowe](directional-heat.md)
- [Ważenie wartością](value-weighting.md)
