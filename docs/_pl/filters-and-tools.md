---
title: "Filtry i narzędzia"
nav_order: 6
has_children: true
lang: "pl"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtry i narzędzia

Te panele pozwalają wybrać, *które* dane oglądasz, i zmierzyć to, co widzisz. Używaj ich, gdy obraz jest zbyt zagmatwany: pokaż jedną drużynę, jednego gracza, jedno miejsce albo jedno piętro budynku.

Każdy panel zawęża dane, a działają razem: wiersz jest rysowany tylko wtedy, gdy przechodzi przez **wszystkie** z nich (I).

```
all rows -> Filters -> Teams -> Entities -> Slice -> picture
              AND       AND       AND        AND
```

Przykład: odznacz *Tank* w Filtrach, ukryj drużynę Red w Drużynach i wybierz jednego gracza w Obiektach. Widzisz tylko ruchy tego gracza, bez czołgów.

| Panel | Co robi | Tryby ciepła | Nakładka sylwetek |
|---|---|---|---|
| [Filtry](filters.md) | Filtry zakresu i kategorii na dowolnej kolumnie zachowanej przy wczytaniu. | Tak | Nie (tylko filtry kolumn) |
| [Podział różnicy](difference.md#the-difference-split-panel) | Które wiersze dodają, a które odejmują, w trybie Różnica. | Tylko Różnica | Nie |
| [Drużyny](teams-list.md) | Pokazuje albo ukrywa każdą drużynę; ustawia drużyny po stronie + lub -. | Tak | Tak |
| [Obiekty](entities.md) | Wybór pojedynczych graczy. | Tak | Tak |
| [Przekrój](slice.md) | Wycina warstwę poziomu i ciepła, aby zajrzeć do budynków. | Tak, i poziom | Nie |
| [Pomiar](measure.md) | Linijka i wartość ciepła pod kursorem. | Tak | Tak |
| [Wolumeny i porównanie](volumes.md) | Rysuje kształty 3D i pyta, co się w nich działo. Może też filtrować. | Tak | Tak |
| [Podział](breakdown.md) | Który pojazd, gracz albo broń radzi sobie najlepiej w danym miejscu. | nie dotyczy | nie dotyczy |

Analiza trafień ma własny filtr obszaru w karcie **Pojazdy**: zob. [Analiza trafień](hit-analysis.md).

Pojęcia takie jak mapa cieplna, wiersz, osoba i grupa są wyjaśnione w [słowniku pojęć](glossary.md).

## Gdzie są panele {#where-the-panels-are}

Pasek boczny karty Mapa cieplna, od góry do dołu:

1. Pasek trybów i selektor sesji
2. Źródło, Mapowanie kolumn, Zbiór danych
3. Trasy (tryb Linie)
4. Panele ciepła albo Widok drużyn
5. Podział różnicy
6. Drużyny
7. Obiekty
8. Filtry
9. Tło / poziom
10. Przekrój
11. Pomiar
12. Ścieżka kamery i render
13. Wydajność
14. Kamera i scena

Karta Mecz pokazuje pasek trybów, selektor sesji, swój własny panel, Filtry, Tło / poziom oraz Kamerę i scenę.
