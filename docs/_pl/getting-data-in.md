---
title: "Wczytywanie danych"
nav_order: 3
has_children: true
lang: "pl"
source: "getting-data-in.md"
source_hash: "35eb9e47859c"
translated: true
outdated: false
---

# Wczytywanie danych

Zanim 3DHeat cokolwiek narysuje, potrzebuje tabeli: każdy wiersz mówi, gdzie coś było i - jeśli to wiesz - kiedy i kto. Ta sekcja pokazuje, jak plik staje się obrazem. Nie masz jeszcze danych? Wypróbuj [dane demonstracyjne](demo-data.md).

**Zrób to teraz:**

1. W pasku bocznym Mapy cieplnej otwórz **Źródło** i naciśnij **Pliki…** (albo upuść plik lub folder na strefę upuszczania).
2. Zerknij na **Mapowanie kolumn**: pola są zwykle już wypełnione.
3. Sprawdź, czy **Szacowana pamięć** mówi *mieści się*.
4. Naciśnij **Wczytaj**.

```mermaid
flowchart LR
  A["Źródło<br/>wybierz pliki lub folder"] --> B["Podgląd<br/>pierwsze wiersze"]
  B --> C["Mapowanie kolumn<br/>X, Y, Z, czas, osoba, drużyna"]
  C --> D["Szacowana pamięć<br/>mieści się, ciasno lub się nie zmieści"]
  D --> E["Wczytaj"]
  E --> F["Obraz"]
```

Wszystko, co pokazuje karta Mapa cieplna, pochodzi z jednego **zbioru danych**: tabeli wierszy, każdy z pozycją i opcjonalnie czasem, osobą, grupą, sesją, kierunkiem patrzenia i dowolną liczbą dodatkowych kolumn zachowanych do filtrowania. Ta sekcja wyjaśnia, jak powstaje zbiór danych.

## Droga od plików do obrazu {#the-path-from-files-to-picture}

1. **Wybierz pliki** w panelu **Źródło** - jeden plik, kilka, drzewo folderów albo przez upuszczenie. Przyjmowane są Parquet, CSV, Tacview, ślady GPS i więcej; pełna lista jest w [Formaty danych](data-formats.md#files). Zob. [Wczytywanie plików](loading-files.md).
2. **Podgląd.** Otwierany jest pierwszy plik wyboru: jego nazwy kolumn, pierwsze 50 wierszy, które kolumny wyglądają na liczbowe, a w Parquet typ logiczny każdej kolumny i własne instrukcje odczytu pliku, czyli wpis stopki `heat3d`.
3. **Automatyczne mapowanie.** Kolumny są przypisywane do ról - X, Y, Z, czas, osoba, sesja, grupa, kierunek patrzenia - a kilka zachowywanych do filtrowania. Każde zgadnięcie widać w panelu **Mapowanie kolumn** i można je zmienić. Zob. [Mapowanie kolumn](column-mapping.md) i [Osie, jednostki i czas](axes-units-and-time.md).
4. **Liczenie.** Odczytywana jest liczba wierszy każdego pliku (dokładnie ze stopek Parquet, szacunkowo dla CSV), więc panel może powiedzieć, zanim cokolwiek zostanie wczytane, ile pamięci potrzeba i czy się zmieści. Jeśli nie, proponuje wczytanie co *N*-ty wiersz. Zob. [Pamięć i budżety](memory-and-budgets.md).
5. **Wczytaj.** Proces roboczy w tle parsuje tylko zmapowane kolumny każdego pliku - kilka plików naraz, w ramach budżetu [wątków parsera](memory-and-budgets.md#parser-threads) - i łączy je w kolejności wyboru w jeden zbiór danych: jeden wspólny słownik osób, grup i sesji dla wszystkich plików, jeden wspólny początek czasu, wszystkie wiersze posortowane według czasu. Zob. [Sesje, osoby i grupy](sessions-persons-groups.md).
6. **Wysłanie.** Wątek główny zgłasza „Wysyłanie N wierszy do GPU” na jedną klatkę, a potem upycha wiersze w pamięci GPU w ramach budżetu GPU. Zob. [Pamięć GPU](gpu-memory.md).
7. **Pierwszy obraz.** Kamera ustawia widok na dane, promień i nasycenie sprite'ów są ustawiane z zasięgu danych i liczby wierszy, a po 8 wyrenderowanych klatkach nasycenie jest mierzone z samego obrazu ([Kolor i ekspozycja](colour-and-exposure.md)).

## Wymagania sprawdzane przed wczytaniem {#requirements-checked-before-a-load}

| Potrzeba | Co się dzieje bez niej |
|---|---|
| **Co najmniej dwie z X / Y / Z** | Wczytanie jest odrzucane. Przy dokładnie dwóch trzecia oś ma wartość 0 i dane są rysowane jako płaska płaszczyzna w scenie 3D - czego chce mapa cieplna widziana z góry. |
| Kolumna czasu | Opcjonalna. Bez niej oś czasu jest wyłączona, widok zostaje w trybie **Wszystko**, a pasek boczny to mówi. |
| Kolumna osoby | Opcjonalna. Potrzebna do [nakładki sylwetek](box-replay.md) (sylwetka dla każdej osoby), [ciepła liniowego](line-heat.md) (trasa każdej osoby), interpolacji, śladów i historii **Czas życia**. |
| Kolumna grupy | Opcjonalna. Potrzebna do [ciepła drużyn](team-heat.md) i trybu [różnica](difference.md) (co najmniej dwie grupy). |

Tryb, którego wczytane dane nie obsługują, jest wyszarzony na pasku trybów; najechanie na niego mówi dlaczego.

## Bez własnych danych {#without-your-own-data}

Panel **Zbiór danych** (pod **Źródło**) ma [generator syntetyczny](synthetic-generator.md), który tworzy zbiór danych w kształcie battle royale o dowolnym rozmiarze - przydatny do wypróbowania przeglądarki i sprawdzenia, z czym poradzi sobie komputer.

## Strony w tej sekcji {#pages-in-this-section}

- [Wczytywanie plików](loading-files.md) - wybieranie, foldery, przeciąganie i upuszczanie, łączenie wielu plików, reguła pliku ruchu, postęp i anulowanie
- [Mapowanie kolumn](column-mapping.md) - każde pole panelu mapowania, jak automatyczne mapowanie zgaduje, podpowiedzi `heat3d`
- [Osie, jednostki i czas](axes-units-and-time.md) - oś pionowa, odwrócenia, skala jednostek, jednostki czasu, kierunek patrzenia
- [Sesje, osoby i grupy](sessions-persons-groups.md) - co robi każde z nich, limity, wspólne nazwy, rozmiar obiektu, panel Zbiór danych
- [Generator syntetyczny](synthetic-generator.md)
- [Pamięć i budżety](memory-and-budgets.md) - model zużycia pamięci, sprawdzenie dopasowania, decymacja, limit sortowania, budżety zasobów
