---
title: "Wiele meczów naraz"
nav_order: 10
lang: "pl"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: false
---

# Wiele meczów naraz

**Wiele meczów naraz** odtwarza mnóstwo meczów jeden na drugim, dzięki czemu widać, gdzie zwykle chodzą gracze każdego meczu. Użyj go, by porównać setki albo tysiące meczów na jednym obrazie.

Każdy mecz zaczyna od swojego własnego początku, a jego jednostki poruszają się jako figury. Pliki trafiają wprost do karty graficznej i nie buduje się żadnej pełnej tabeli, więc odtwarzanie jest płynne tam, gdzie zwykłe wczytanie skończyłoby pamięć.

![Dziesięć meczów czołgów nałożonych na siebie, jeden kolor na mecz](../assets/img/en/many-matches.webp)

## Jak tego używać {#how-to-use-it}

1. Otwórz **Wiele meczów naraz** w pasku bocznym Mapy cieplnej.
2. Naciśnij **Pliki…** (wybierz wiele plików), **Folder…** (folder i jego podfoldery) albo **Dodaj folder…** (dołącz do tego, co już wczytano).
3. Przeglądarka przełącza się na nakładkę sylwetek i zaczyna od początku. Naciśnij **Odtwórz**.

Każdy plik to jeden mecz (albo kilka). Działają pliki Parquet i kontenery [`.3dheat`](container.md). Plik potrzebuje kolumny pozycji, czasu i jednostki; kolumny nazwy, typu i strony są zachowywane. Inne pliki, a także pliki towarzyszące konwerterów (lot, wiadomości, zdarzenia, czat, cele), są pomijane. Zwykłą tabelę opisuje [Wczytywanie danych](getting-data-in.md).

## Ustawienia {#settings}

| Ustawienie | Co robi |
|---|---|
| **Według drużyn** / **Według meczów** | Kolor według strony albo kolor na mecz. |
| **Zaznacz, gdzie zginęły jednostki** | Znacznik w miejscu, gdzie zginęła każda jednostka, przez 10 s, 30 s, 120 s albo wszystko dotąd. |

Panel pokazuje, ile meczów, jednostek, wierszy i pozycji odczytano, zużytą pamięć i czas wczytania. *Miejsce na* to ile jeszcze pozycji karta graficzna mogłaby przyjąć. *Figury od* to rozmiar na ekranie, poniżej którego jednostka jest rysowana jako mała strzałka zamiast figury.

Wygląd figur używa tych samych pól co [powtórka meczu](match-replay.md#figures): **Rozmiar figur**, **Najmniejsza figura na ekranie** i **Z daleka**.

## Wskazówki {#tips}

- Gdy wszystko nie zmieściłoby się w pamięci, pozycje są przerzedzane (zachowywana jest tylko pozycja co kilka metrów), a panel to mówi.
- Tryby ciepła działają też na danych nakładki.
- Statystyki z tysięcy meczów bez ich rysowania: zob. [Analiza zbiorcza](mass-analysis.md).
