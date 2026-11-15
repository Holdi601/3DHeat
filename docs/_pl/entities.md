---
title: "Obiekty"
parent: "Filtry i narzędzia"
nav_order: 3
lang: "pl"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Obiekty

**Obiekty** pozwala wybrać jednego gracza (albo kilku), by zobaczyć tylko to, dokąd ten gracz poszedł. Użyj go, by śledzić własny ruch albo jednego przeciwnika.

Panel jest pokazywany, gdy zbiór danych ma kolumnę osoby. Jego nagłówek pokazuje liczbę osób albo `wybrane z ogółu`, gdy wybór jest aktywny (*osoba* to jeden gracz albo SI, zobacz [słownik pojęć](glossary.md)).

## Wybierz gracza {#pick-a-player}

1. Otwórz **Obiekty** w pasku bocznym.
2. Wpisz część nazwy w pole wyszukiwania.
3. Zaznacz gracza. Nagłówek pokaże na przykład `2 z 10`, a wszystko inne zniknie.
4. **Wyczyść** pokazuje znów wszystkich.

![Obiekty z dwoma z dziesięciu graczy wybranymi](../assets/img/en/entities-selected.webp)

Wybór pokazuje tylko wybrane osoby w trybach ciepła (punkty, linie, różnica, ciepło drużyn), a także w śladach, sylwetkach i smugach [powtórki figur](box-replay.md). Zostaw pusty, aby pokazać wszystkich; wybranie wszystkich to to samo co nie wybranie nikogo.

## Panel {#the-panel}

| Część | Znaczenie |
|---|---|
| Pole wyszukiwania | *Szukaj N obiektów...* - filtruje listę po podciągu nazwy bez względu na wielkość liter. Pokazuje `N dopasowań`, albo `N dopasowań, pokazano pierwsze 200`; *Nic nie pasuje do „...”*, gdy wyszukiwanie nic nie znajdzie. |
| Lista | Do 200 osób (pierwsze 200 pasujących), każda z polem wyboru, próbką koloru osoby i nazwą (*(bez nazwy)* dla pustej nazwy). |
| Podpowiedź o grze | Gdy czas leci, lista zawiera te osoby, które są *w grze przy głowicy odtwarzania*; wyszukiwanie znajduje wszystkie. |
| **SI (n)** | Składana grupa z jednostkami sterowanymi przez SI, osobno od graczy. |
| **Dodaj widoczne** | Dodaje do wyboru wszystkich aktualnie wymienionych. |
| **Tylko widoczne** | Sprawia, że wybór to dokładnie wymienieni. |
| **Wyczyść** | Opróżnia wybór. |

## Ograniczenia {#limits}

W cieple wybór jest filtrem i zajmuje jeden z czterech [miejsc na filtry](filters.md#rules). Gdy pozostałe filtry już zajmują wszystkie cztery, panel pisze *Nie zastosowano do ciepła: wszystkie miejsca na filtry są zajęte. Powtórka figur nadal pokazuje tylko te obiekty. Wyczyść filtr w Filtrach, aby zwolnić miejsce.* Wyczyść filtr, aby zwolnić miejsce.

Wybór jest czyszczony przy każdym nowym zbiorze danych. Karta Mecz ustawia ten sam wybór, gdy skupia się na jednym graczu.

## Dla programistów {#for-developers}

Wybór jest zapisywany jako filtr *osób* ([Filtry](filters.md#for-developers)). Maska w shaderze trzyma 65 536 id osób; osoba poza tym zakresem nie jest rysowana w cieple, gdy wybór jest aktywny.
