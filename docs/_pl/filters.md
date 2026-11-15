---
title: "Filtry"
parent: "Filtry i narzędzia"
nav_order: 1
lang: "pl"
source: "filters.md"
source_hash: "e957bf788bda"
translated: true
outdated: false
---

# Filtry

**Filtry** ukrywają wiersze, na których Ci nie zależy, na przykład jedną klasę pojazdów albo jeden rodzaj zdarzenia, a obraz od razu się aktualizuje. Panel wypisuje kolumny zachowane przy wczytaniu pod hasłem *Zachowaj do filtrowania* ([Mapowanie kolumn](column-mapping.md)), a także *Plik źródłowy*, gdy wczytano kilka plików.

## Wypróbuj {#try-it}

1. Wczytaj zbiór danych i otwórz **Filtry** w pasku bocznym.
2. W **Klasa pojazdu** odznacz *Tank*. Obraz zmienia się od razu.
3. Naciśnij **Wyczyść wszystkie filtry**, aby cofnąć.

![Panel Filtry: najpierw kolumny samej przeglądarki (Typ zdarzenia, Klasa pojazdu), a potem kolumny z Twojego pliku](../assets/img/en/filters.webp)

Pierwsze wiersze to kolumny samej przeglądarki (poniżej). Wiersze po nich pochodzą z Twojego pliku.

## Kolumny, które dodaje przeglądarka {#columns-the-viewer-adds}

Przy wczytaniu przeglądarka wyznacza cztery własne kolumny i wypisuje je **jako pierwsze**, z nazwami i wartościami w Twoim języku, tak aby ten sam filtr działał dla każdej gry i każdego źródła danych:

| Kolumna | Wartości | Wyznaczane z |
|---|---|---|
| **Typ zdarzenia** | 23 rodzaje: Pozycja, Oddany strzał, Wystrzelenie (pocisk, rakieta, bomba), Trafienie, Pudło (broń skończyła się blisko żadnego celu), Eksplozja, Obrażenia, Zabójstwo, Śmierć, Zniszczenie, Katastrofa, Katapultowanie / skok ze spadochronem, Pojawienie się, Zniknięcie, Start, Lądowanie, Kontakt z ziemią, Postój na ziemi, Ponowne uzbrojenie / tankowanie, Przejęcie / cel, Wabik, Wiadomość, Inne | kolumna o nazwie `event`, `events`, `event_type` albo `event_name`; słowa każdej gry (`shot`, `burst`, `fired`, `struck`, `flare`, `plant` ...) są przypisywane do tych rodzajów. Pełna tabela: [Typy i klasy zdarzeń](ref-event-types.md). |
| **Gracz lub SI** | Gracz, SI | kolumna `ai`, `is_ai`, `bot` albo `actor`; w przeciwnym razie `is_player` / `human`; w przeciwnym razie identyfikator konta (`user_id`, `steam_id`; pusty albo 0 to SI); dla nagrań Tacview - czy obiekt ma pilota |
| **Klasa pojazdu** | 17 klas: Myśliwiec, Samolot szturmowy, Bombowiec, Inny samolot, Helikopter, Czołg, Pojazd opancerzony, Obrona przeciwlotnicza, Artyleria, Ciężarówka / samochód, Okręt, Okręt podwodny, Piechota, Broń, Wabik, Konstrukcja, Inne | nazwa pojazdu albo jednostki (dopasowywana do [katalogu sylwetek](figures.md)) i kolumny typu |
| **Klasa celu** | te same klasy | pojazd drugiej strony (`other_vehicle`, `target_vehicle`, `victim_type` ...) |

Wypisywane są tylko rodzaje, które występują. Kolumny wartości (`cost_*`, `earn_*`, `net_*` oraz *Źródło kosztu*, zob. [Ważenie wartością](value-weighting.md)) można filtrować jak każdą kolumnę liczbową: na przykład odznacz *estimate* w *Źródło kosztu*, aby zostawić tylko wiersze z ceną.

Lista kategorii z więcej niż 12 wartościami dostaje pole wyszukiwania (*Szukaj n wartości*) i przycisk **Tylko te**, który pozwala dokładnie na pasujące wartości.

To, które kolumny można filtrować, jest ustalane przy wczytaniu, bo wtedy trzeba je odczytać. Gdy nie ma żadnej zachowanej kolumny, panel to mówi i wskazuje *Zachowaj do filtrowania*.

## Kolumny liczbowe (zakres) {#numeric-columns-range}

![Filtr zakresu (utracone pieniądze) z obiema końcówkami przeciągniętymi do środka](../assets/img/en/filters-numeric.webp)

| Część | Znaczenie |
|---|---|
| Nazwa i `min ... max` | Kolumna oraz bieżący zakres (pełny zakres kolumny, dopóki nie ustawiono filtra). |
| Pierwszy wiersz: pole liczbowe i suwak | Dolna granica. Przeciągnięcie suwaka powyżej górnej granicy przesuwa ją razem z nią. |
| Drugi wiersz: pole liczbowe i suwak | Górna granica. Przeciągnięcie poniżej dolnej granicy przesuwa też ją. |
| **Przywróć *kolumnę***  | Usuwa ten filtr. |

Suwaki obejmują od minimum do maksimum kolumny w 1000 krokach; pola liczbowe przyjmują dowolną wartość. Wiersz przechodzi, gdy jego wartość leży w zakresie, z oboma końcami włącznie. Duże wartości są pokazywane w zapisie wykładniczym (`1.23e6`).

## Kolumny kategorii {#category-columns}

| Część | Znaczenie |
|---|---|
| Nazwa i `dozwolone/razem` | Kolumna oraz ile jej wartości jest dozwolonych. |
| Lista wartości | Pole wyboru przy każdej wartości; pusta wartość jest pokazywana jako *(pusta)*. |
| **Wszystkie** / **Żadne** | Dozwolona każda wartość / żadna wartość. |

Dozwolenie każdej wartości usuwa filtr.

## Zasady {#rules}

- **Cztery filtry naraz.** Nagłówek pokazuje `aktywne/4`. Piąty filtr nie jest stosowany, a panel to mówi. Wybór w [Obiektach](entities.md) (albo skupienie na graczu w karcie Mecz) zajmuje jeden z tych czterech. Filtr obejmujący całą kolumnę nie zajmuje żadnego.
- **Kolumna kategorii ma najwyżej 4096 wartości**; szersza nie jest zachowywana przy wczytaniu.
- **Filtry łączą się przez i**, a także z widocznością drużyn, podziałem różnicy, oknem czasu, odrzucaniem według odległości i [przekrojem](slice.md).
- **Zmiana filtra restartuje akumulację i kilka klatek później ponownie mierzy ekspozycję**, bo filtrowanie może mocno zmienić gęstość ([Kolor i ekspozycja](colour-and-exposure.md#auto-exposure)).
- **Wyczyść wszystkie filtry** usuwa każdy filtr kolumny. Widoczność drużyn i wybory graczy ustawione gdzie indziej zostają.
- Filtry kolumn zmieniają tryby ciepła. Nie zmieniają sylwetek [powtórki z figurami](box-replay.md), które podążają za widocznością drużyn i wyborem w Obiektach. Wybór w Obiektach zmienia oba.
- W [cieple liniowym](line-heat.md) filtr jest sprawdzany na wierszu, w którym kończy się dany odcinek.
- Przy każdym nowym zbiorze danych wszystkie filtry są czyszczone.

## Dla programistów {#for-developers}

**Sloty.** Każdy aktywny filtr zajmuje jeden z czterech slotów GPU ([`MAX_FILTER_SLOTS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)), czyli teksturę o 4 bajtach na wiersz. Sloty przypadają filtrom w kolejności ich ostatniej zmiany ([`filterSlots`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts), wspólne dla shadera i obu paneli). Po czwartym pojawia się błąd *Stosowane są tylko pierwsze 4 filtry. Usuń jeden - reszta jest ignorowana, a nie po cichu łączona*, a nazwy dodatkowych filtrów brzmią *kolumna (nie zastosowano)*. Filtry działają na wiersz w shaderze wierzchołków, więc zmiana progu nie wymaga ponownego parsowania ani ponownego wysyłania danych.

**Filtry, których panel nie pokazuje.** W stanie aplikacji istnieją jeszcze dwa rodzaje ([`FilterSpec`](https://github.com/Holdi601/3DHeat/blob/main/src/state/types.ts)):

- filtr **grup**, ustawiany przez kartę Mecz, gdy skupia się na jednej stronie. Ukrywa pozostałe grupy we wszystkich trybach, także w podziale [różnicy](difference.md) po kolumnie.
- filtr **osób**, ustawiany przez panel [Obiekty](entities.md) i przez kartę Mecz, gdy skupia się na jednym graczu. Ogranicza powtórkę z figurami i tryby ciepła. W cieple jest filtrem kategorii po identyfikatorach osób i zajmuje jeden z czterech slotów. Jego maska mieści 65 536 identyfikatorów ([`FILTER_MASK_CAPACITY`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)); osoba poza tym zakresem nie jest rysowana w cieple, gdy filtr jest aktywny, nawet jeśli jest wybrana. Powtórka z figurami nadal ją pokazuje.
