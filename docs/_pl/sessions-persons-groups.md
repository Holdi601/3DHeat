---
title: "Sesje, osoby i grupy"
parent: "Wczytywanie danych"
nav_order: 4
lang: "pl"
source: "sessions-persons-groups.md"
source_hash: "5c87185b09ff"
translated: true
outdated: false
---

# Sesje, osoby i grupy

**Osoba** to jedna poruszająca się rzecz (gracz, samochód). **Drużyna/grupa** to strona, do której
należy. **Sesja** to jeden mecz albo jedno okrążenie. Zobacz [słownik pojęć](glossary.md).

Jeden wiersz pliku może nazwać wszystkie trzy:

| x | y | czas | gracz | drużyna | mecz |
|---|---|---|---|---|---|
| 10.5 | -30.2 | 12.0 | Blue 1 | Blue | Mecz 01 |

`player` to osoba, `team` to grupa, `match` to sesja.

Trzy opcjonalne kolumny opisują, *kto* i *w którym miejscu historii* należy dany wiersz. Każda jest
kodowana słownikowo przy wczytywaniu: wartości tekstowe stają się małymi identyfikatorami liczbowymi
na wiersz plus jedną listą etykiet, wspólną dla wszystkich plików wczytania.

## Osoba {#person}

Kolumna **Identyfikator osoby** nazywa rzecz poruszającą się, do której należy wiersz: gracza, bota,
samochód. Jest zapisywana jako 32-bitowy identyfikator na wiersz.

Mając kolumnę osoby i kolumnę czasu, wczytanie oblicza **czas życia** każdego wiersza: czas do następnej
próbki tej samej osoby *w tej samej sesji*, albo "brak" (wartość wartownicza, -1), gdy nie ma następnej
próbki - osoba zginęła, wyszła albo dziennik się skończył. Czasy życia zasilają historię **Czas życia**
[osi czasu](timeline.md), interpolację i nieaktualność w [nakładce pudełkowej](box-replay.md) oraz przerwy
tras [ciepła liniowego](line-heat.md). To, co robi wiersz bez następnika, jest ustawieniem oglądania
(*Zapasowy czas życia*), a nie częścią danych.

Każda osoba dostaje grupę swojego **pierwszego** wiersza w czasie; to przypisanie koloruje jej pudełko
w nakładce pudełkowej i decyduje, przełącznik widoczności której grupy ją tam ukrywa. Tryby ciepła używają
własnej grupy każdego wiersza.

### Nazwy noszone przez kilka rzeczy naraz {#names-worn-by-several-things-at-once}

Nazwa nie zawsze oznacza jedną jednostkę: w niektórych eksportach każdy bot każdego meczu loguje się pod
jedną nazwą. Połączenie dwóch próbek takiej "osoby" - przez interpolację, ślad albo trasę - rysuje linię
między dwoma różnymi stworzeniami przez mapę.

Przy wczytywaniu ([`computeLifetimes`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts))
nazwa jest oznaczana jako **wspólna**, gdy dwa jej rekordy

- są w tej samej sesji,
- mają ten sam czas,
- są tego samego rodzaju (każda zachowana kolumna kategorii ma tę samą wartość), i
- leżą dalej od siebie niż 1% przekątnej zasięgu danych.

Wspólne nazwy są rysowane jako pojedyncze próbki - bez interpolacji, bez śladu, bez trasy ciepła
liniowego. Wszystko inne o nich (ich ciepło) pozostaje bez zmian. Panel Zbiór danych wypisuje, ile nazw
oznaczono, z do trzema przykładami, a panel nakładki pudełkowej powtarza tę liczbę.

## Sesja {#session}

Kolumna **Sesja / mecz** mówi, do którego meczu, rajdu, rundy, przejazdu albo okrążenia należy wiersz.
To ona sprawia, że próbki osoby tworzą jeden ciągły ślad: prawdziwa telemetria często przeplata równoległe
mecze, a próbka gracza tuż przed głowicą i ta tuż po niej mogą pochodzić z różnych meczów oddalonych o setki
metrów. Przy kolumnie sesji:

- interpolacja, ślady i trasy ciepła liniowego nigdy nie przekraczają zmiany sesji;
- czas życia wiersza kończy się na końcu jego własnej sesji;
- wybór **Sesji** pojawia się na górze paska bocznego, pod paskiem trybów.

Kolumna sesji bardzo często jest *znacznikiem czasu* - chwilą początku meczu, powtórzoną w każdym wierszu tego
meczu. Automatyczne mapowanie szuka nazw sesji przed osobą i grupą właśnie dlatego ([Mapowanie kolumn](column-mapping.md#session-person-group)).
Okrążenie albo przejazd w wyścigu też jest sesją: dwóch okrążeń tego samego samochodu nie wolno połączyć w jeden ślad.

### Wybór sesji {#the-session-picker}

![Wybór sesji otwarty przy pliku z dziesięcioma meczami: Wszystkie sesje (10), Mecz 01, Mecz 02 i tak dalej](../assets/img/en/sessions-persons-groups-picker.webp)

*Dziesięć meczów w jednym pliku: wybierz jeden albo zobacz wszystkie.*

Pokazywany, gdy zbiór danych ma wypisane sesje (zobacz limit niżej).

| Część | Znaczenie |
|---|---|
| Etykieta po prawej | Liczba wierszy wybranej sesji albo *wszystkie naraz*. |
| Menu | *Wszystkie sesje (N)*, potem każda sesja, najbardziej zajęta najpierw, jako `etykieta - N wierszy, zasięg` (zasięg w sekundach poniżej 90 s, w minutach poniżej 90 min, w godzinach powyżej). |
| Bursztynowa podpowiedź | Pokazywana przy *Wszystkie sesje*: położenia nadal nigdy nie są łączone między sesjami, ale równoległe mecze stawiają na mapie razem niepowiązanych graczy. |
| Podpowiedź | Pokazywana w trybach ciepła, gdy wybrano jedną sesję: wybór tylko przesuwa głowicę odtwarzania. |

Przy wczytywaniu wybierana jest najbardziej zajęta sesja. Wybór sesji przewija głowicę do początku tej sesji.

Co zmienia wybór:

- W **[nakładce pudełkowej](box-replay.md)** decyduje, którą sesję odtwarzać: rysowane są tylko pudełka
  i ślady tej sesji, a zakres osi czasu staje się własnym zakresem sesji.
- W **trybach ciepła** nie ogranicza on ciepła, a podpowiedź pod wyborem to mówi: *W trybach ciepła to tylko
  przesuwa głowicę na początek sesji; ciepło nadal liczy wszystkie sesje. Nakładka pudełkowa odtwarza tylko
  wybraną sesję.* Aby ograniczyć ciepło do jednej sesji, zachowaj też kolumnę sesji jako kolumnę filtra
  (*Zachowaj do filtrowania*) i filtruj po niej. Kolumna może być jednocześnie kolumną sesji i kolumną filtra:
  wczytywacz czyta każdą zaznaczoną kolumnę filtra osobno, bez względu na to, jaką rolę pełni też.

### Zbyt wiele sesji {#too-many-sessions}

Wypisywanych jest najwyżej **100 000** sesji. Powyżej tego kolumna jest tak naprawdę identyfikatorem (folder
z milionami sesji po kilka wierszy każda), a wysyłanie tylu etykiet z wątku do strony zawiesza kartę z powodu
braku pamięci. Wczytanie wtedy zachowuje **identyfikatory** sesji - więc granice nadal są egzekwowane wszędzie - ale
odrzuca etykiety i wybór, a panel Zbiór danych o tym mówi.

## Grupa {#group}

Kolumna **Drużyna / grupa** to dowolna kolumna o małej liczbie wartości: drużyna, strona, oddział, frakcja,
flaga gracz-kontra-AI, klasa samochodu. Jest zapisywana jako 16-bitowy identyfikator na wiersz i steruje:

- [listą drużyn](teams-list.md) (widoczność na grupę, strony + / −),
- [ciepłem drużyn](team-heat.md) (odcień na grupę),
- podziałem [różnicy](difference.md) według grup,
- kolorami pudełek w [nakładce pudełkowej](box-replay.md) (rodzina odcieni na grupę, cień na członka).

### Limity {#limits}

Najwyżej **4 096** różnych grup. Identyfikator grupy jedzie w czwartym kanale teksela pozycji każdego wiersza
na GPU, a każda grupa potrzebuje teksela w tablicy znaków 4 096 na szerokość, którą shader czyta, by zdecydować
*ukryty*, *dodany* albo *odjęty*. Kolumna z większą liczbą różnych wartości jest identyfikatorem, a nie grupą:
**wczytanie zachowuje każdy wiersz i odrzuca tylko grupowanie**, z ostrzeżeniem przy zbiorze danych, które
sugeruje zmapowanie jej jako kolumny osoby albo zachowanie jej jako kolumny filtra.

To samo limit 4 096 dotyczy zachowanej kolumny filtra *kategorii*; szersza nie jest zachowywana, a zbiór danych
o tym mówi. Kolumna liczbowa (na przykład znacznik czasu) nie ma takiego limitu jako filtr *zakresu*.

Wartości grupy `0`, pusta wartość, `none`, `unknown`, `null` i `-1` (bez względu na wielkość liter) oznaczają
"bez grupy" dla [ciepła drużyn](team-heat.md), które rysuje je neutralnie szarymi, a nie jako pewny kolor.

## Rozmiar obiektu {#entity-size}

Jak duża jest jedna śledzona rzecz - pudełko kolizji gracza, samochód - decyduje, jak duże są pudełka i promienie
patrzenia [nakładki pudełkowej](box-replay.md). Nie ma na to pola w panelu; pochodzi ze
[wskazówek `heat3d`](data-formats.md#the-heat3d-hints) pliku (`entity.size`, w jednostkach samego pliku; konwerter
CS2 zapisuje 32). Wczytanie mnoży to przez skalę jednostek.

Przy każdym wczytaniu ([`calibrate`](https://github.com/Holdi601/3DHeat/blob/main/src/data/calibrate.ts)), gdzie
*zasięg* to większa z osi X i Z danych:

| Ustawienie | Z rozmiarem obiektu | Bez niego |
|---|---|---|
| Rozmiar sześcianu | rozmiar obiektu | zasięg / 500 |
| Długość promienia patrzenia | rozmiar obiektu × 4 | zasięg / 200 |
| Promień sprite'a | zasięg / 120 | zasięg / 120 |
| Punkt nasycenia | analityczne oszacowanie (potem mierzone) | tak samo |
| Prędkość lotu | zasięg / 12 | tak samo |
| Płaszczyzna daleka | zasięg × 12 | tak samo |
| Płaszczyzna bliska | max(0,05; zasięg / 20 000) | tak samo |

## Panel Zbiór danych {#the-dataset-panel}

Pod panelem Źródło. Gdy zbiór danych jest wczytany, pokazuje:

- **nazwę** zbioru - wybór, liczbę wierszy, liczbę plików, krok, jeśli go użyto;
- **`N drużyn · N osób · zasięg Ns`**;
- każde **ostrzeżenie**, jakie wczytanie wytworzyło, na bursztynowo, tak długo, jak zbiór jest wczytany: grupy albo
  kolumna filtra odrzucone z powodu zbyt wielu wartości, sesje niewypisane, wspólne nazwy, brakujące wiersze, pominięte pliki;
- [generator syntetyczny](synthetic-generator.md);
- **Zwolnij**, które usuwa zbiór danych.

Liczba wierszy jest pokazana w nagłówku panelu.
