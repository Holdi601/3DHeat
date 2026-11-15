---
title: "Lista drużyn"
parent: "Filtry i narzędzia"
nav_order: 2
lang: "pl"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Lista drużyn

Panel **Drużyny** pozwala ukryć drużynę albo postawić ją po jednej stronie porównania. Użyj go, by patrzeć tylko na Niebieskich albo zapytać „dokąd idzie Niebieski, czego nie robi Czerwony?”.

*Grupa* to drużyna albo strona, na przykład Niebiescy i Czerwoni ([Grupy](sessions-persons-groups.md#group)). Panel jest pokazywany, gdy zbiór danych ma kolumnę grupy; liczba grup jest w jego nagłówku. W trybie Ciepło drużyn pasek boczny ma też sekcję o nazwie **Widok drużyn** z własnymi ustawieniami; ta strona dotyczy listy **Drużyny**.

## Ukryj drużynę {#hide-a-team}

1. Otwórz **Drużyny** w pasku bocznym.
2. Odznacz pole wyboru (*Widoczna*) drużyny, którą chcesz ukryć. Obraz od razu się aktualizuje.
3. Naciśnij **Pokaż wszystkie**, aby przywrócić każdą drużynę.

![Lista drużyn: Niebiescy 5p, Czerwoni 5p, z Pokaż wszystkie](../assets/img/en/teams-list.webp)

## Każdy wiersz {#each-row}

| Część | Znaczenie |
|---|---|
| Pole wyboru (*Widoczna*) | Pokazuje lub ukrywa grupę. |
| Próbka | Kolor grupy: jej [kolor ciepła drużyn](team-heat.md) w trybie Ciepło drużyn, jej kolor podstawowy w pozostałych trybach. |
| Nazwa | Etykieta grupy (pełna etykieta po najechaniu). |
| **+** / **-** (tryb Różnica) | Stawia grupę po dodatniej albo ujemnej stronie [różnicy](difference.md); kliknij ponownie aktywny przycisk, aby nie była po żadnej stronie. |
| `Np` (pozostałe tryby) | Liczba osób, których pierwszy wiersz jest w tej grupie. |

![Tryb Różnica: Niebiescy po stronie +, Czerwoni po stronie -](../assets/img/en/teams-list-difference.webp)

## Przyciski {#buttons}

| Przycisk | Efekt |
|---|---|
| **Pokaż wszystkie** | Sprawia, że każda grupa znów jest widoczna. |
| **Podziel równo** (tryb Różnica) | Pierwsza połowa grup (zaokrąglona w górę) po stronie +, reszta po stronie -; ten sam podział, od którego zaczyna się każde wczytanie. |

## Co robi ukrycie grupy {#what-hiding-a-group-does}

- W **Cieple**, **Cieple drużyn** i **Liniach** wiersze grupy niczego nie wnoszą.
- W **Różnicy** ukryta grupa nic nie wnosi, po której stronie by nie była, także przy podziale według innej kolumny (zobacz [Różnica](difference.md#for-developers)).
- W **nakładce sylwetek** nie są rysowane osoby, których pierwszy wiersz jest w tej grupie.
- W **Cieple drużyn** pozostałe grupy zachowują swoje kolory: odcienie są przydzielane z łącznej liczby grup, a nie z tego, co jest widoczne, więc dwa obrazy pozostają porównywalne.

Zmiana widoczności restartuje akumulację. Przy każdym nowym zbiorze danych każda grupa jest znów widoczna.

Podpowiedź panelu zmienia się zależnie od trybu: w Różnicy wyjaśnia + i -; w Cieple drużyn - że próbki to kolory, jakimi rysuje każda grupa.
