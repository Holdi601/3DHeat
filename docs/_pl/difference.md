---
title: "Różnica"
parent: "Tryby ciepła"
nav_order: 5
lang: "pl"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: false
---

# Różnica

Na czerwono tam, gdzie drużyna A była częściej, na zielononiebiesko tam, gdzie była drużyna B, a nic tam, gdzie były równo.

**Różnica** (klawisz 2) to ciepło ze znakiem. Wiersze jednej populacji dodają ciepło; wiersze innej je odejmują. Tam, gdzie oba zbiory nakładają się równo, wynik to zero i pełna przezroczystość; tam, gdzie jeden dominuje, widać go w kolorach tej strony - domyślnie ciepłych (przezroczysty → czerwony → żółty → biały) dla strony **+** i chłodnych (przezroczysty → zielony → niebieski → fioletowy) dla strony **−**.

![Ciepło różnicy: na czerwono tam, gdzie strona + była częściej, na zielono i niebiesko tam, gdzie częściej była strona -](../assets/img/en/difference-split.webp)

## Jak tego używać {#how-to-use-it}

1. Naciśnij `2` (albo wybierz **Różnica** na pasku trybów).
2. Otwórz **Podział różnicowy** w pasku bocznym.
3. Wybierz, co **Podziel według**: zwykle *Grupy*.
4. Ustaw jedną grupę (albo wartość) na **+**, a inną na **−**.
5. Czytaj kolory: ciepły oznacza stronę +, chłodny - stronę −. Panel ostrzega, jeśli jedna strona nie ma wierszy (zob. [Komunikaty, które możesz zobaczyć](#messages-you-may-see)).

*Które* dwie populacje - to jest całe pytanie, więc podziałem może być dowolna zachowana kolumna, nie tylko grupy. Wiersze, które nie trafiają na **żadną** stronę, są **pomijane**, a nie liczone jako zero: dzięki temu podział po dwóch z wielu wartości porównuje dokładnie te dwie i współpracuje z [filtrami](filters.md) - przefiltruj do jednej mapy, a potem podziel to według wersji.

Tryb wymaga dwóch stron: kolumny grupy z co najmniej dwiema grupami albo podziału po kolumnie zachowanej do filtrowania. Na danych z mniej niż dwiema grupami wczytanie zaczyna od podziału po kolumnie - najpierw kolumnę *Plik źródłowy* przy wczytaniu wielu plików, w przeciwnym razie pierwszą kolumnę kategorii z dwiema wartościami, a w ostateczności pierwszą kolumnę liczbową o rozpiętości - więc *porównaj dwa wczytania* działa także na danych bez grup. Tryb jest niedostępny tylko wtedy, gdy nie ma żadnej z tych możliwości; także wtedy, gdy podział po kolumnie zostawia pustą jedną stronę.

## Panel Podział różnicowy {#the-difference-split-panel}

Pokazywany w trybie Różnica, pod panelami ciepła.

**Podziel według** oferuje:

| Opcja | Pokazywane jako | Reguła podziału |
|---|---|---|
| Grupy | *Grupa (N)* (gdy jest kolumna grupy) | Każda grupa na +, − albo na żadnej, ustawiana w [Lista drużyn](teams-list.md) |
| Kolumna kategorii | *kolumna (N wartości)* | Wartości na +, − albo na żadnej |
| Kolumna liczbowa | *kolumna (liczbowa)* | Zakres wartości dla każdej strony |
| Plik pochodzenia | *Plik źródłowy - porównaj dwa wczytania* (gdy wczytano kilka plików) | Pliki na +, − albo na żadnej |

Oferowane są tylko kolumny zaznaczone jako *Zachowaj do filtrowania* przy wczytywaniu.

### Porównuj udziały, nie liczebności {#compare-shares-not-counts}

**Porównuj udziały, nie liczebności** (domyślnie wyłączone) waży każdą stronę jednym podzielonym przez jej własną liczbę wierszy, więc strona z pięciokrotnie większą liczbą wierszy nie wygrywa samą liczbą. Kolor pokazuje wtedy, gdzie każda strona jest proporcjonalnie częstsza niż druga. Używaj tego, gdy obie strony mają bardzo różne ilości danych, na przykład dwie sesje o różnej długości.

### Komunikaty, które możesz zobaczyć {#messages-you-may-see}

Panel ostrzega, gdy obraz nie jest prawdziwą różnicą:

| Komunikat | Znaczenie |
|---|---|
| *N + / M −* (albo *N + / M − / K nieużytych*) | Ile wartości leży po każdej stronie (i na żadnej). |
| Żaden wiersz w oknie nie jest po stronie **+** | Rysowana jest tylko strona **−**. Przesuń okno osi czasu albo zmień podział. |
| Żaden wiersz w oknie nie jest po stronie **−** | Rysowana jest tylko strona **+**. |
| Żadna wartość nie leży po żadnej stronie | Różnica nic nie rysuje. Ustaw co najmniej jedną wartość na **+** lub **−**. |
| *kolumna* nie może być podzielona w ten sposób | Wybrana kolumna nie pasuje do podziału. Wybierz kolumnę ponownie. |
| Kolumna podziału nie zmieściła się w pamięci GPU dla N z M porcji | Te wiersze nie są rysowane. Podnieś budżet GPU w Wydajność → Budżety zasobów albo wczytaj mniej wierszy. |

### Według grupy {#by-group}

Panel tylko wskazuje [Lista drużyn](teams-list.md), gdzie każda grupa ma przyciski **+** i **−**. Przy każdym wczytaniu pierwsza połowa grup (zaokrąglona w górę) trafia na +, reszta na −; **Podziel równo** w Liście drużyn robi to samo jeszcze raz. Grupa na żadnej stronie albo ukryta swoim polem wyboru nie wnosi nic.

### Według wartości kategorii {#by-category-values}

| Część | Znaczenie |
|---|---|
| `a + / b − / c nieużytych` | Ile wartości leży po każdej stronie i na żadnej. |
| **Wyczyść** | Ustawia każdą wartość na żadnej stronie. |
| Lista wartości | Każda wartość z przyciskiem **+** i **−** (kliknij aktywny ponownie, aby zdjąć ją z tej strony). Pusta wartość jest wymieniona jako *(brak)*. |
| Uwaga o limicie | Wypisywanych jest tylko pierwszych 200 wartości: *Pokazano pierwsze 200 z N wartości. Tak szeroką kolumnę lepiej najpierw zawęzić filtrem albo podzielić zakresem, jeśli jej wartości są uporządkowane.* |

Wybór kolumny kładzie jej pierwszą wartość na + i drugą na −. Gdy żadna strona nie ma wartości, podział wraca do grup zamiast pokazywać pustą ramkę. *Plik źródłowy* działa tak samo, jedna wartość na plik - tak porównuje się dwa eksporty, dwa przebiegi testów albo dwie wersje.

### Według zakresu {#by-range}

| Część | Znaczenie |
|---|---|
| Podpowiedź | Najmniejsza i największa wartość kolumny. |
| **Zakres dodatni (+)**, **od** / **do** | Wiersze z wartością w tym zakresie, włącznie z obu końców, dodają. |
| **Zakres ujemny (−)**, **od** / **do** | Wiersze w tym zakresie odejmują. |
| **Podziel w połowie** | Ustawia + na [minimum, środek], a − na [środek, maksimum] - to samo, co robi wybór kolumny. |

Wartość w obu zakresach liczy się jako +. Zakresy nie muszą pokrywać kolumny; wartości poza nimi są pomijane. *Pierwsze dwie minuty kontra ostatnie dwie* to podział zakresowy na kolumnie w rodzaju czasu.

## Kolory {#colours}

Sekcja **Kolory ciepła** pokazuje w tym trybie dwa edytory gradientów: **Dodatni (drużyny dodające)** i **Ujemny (drużyny odejmujące)**, każdy ze swoim przyciskiem przywracania (*Przywróć: przezroczysty → czerwony → żółty → biały*, *Przywróć: przezroczysty → zielony → niebieski → fioletowy*). Kompozycja bierze wartość bezwzględną wypadkowego ciepła przez [punkt nasycenia i odpowiedź](colour-and-exposure.md) i wybiera gradient ujemny tam, gdzie wypadkowe jest poniżej zera. Zob. [Kolor i ekspozycja](colour-and-exposure.md#the-ramp-editor).

Używaj odpowiedzi *Liniowej* gęstości, gdy liczy się wielkość różnicy: to jedyna odpowiedź, w której ten sam kolor oznacza tę samą liczbę.

## Jak to działa {#how-it-works}

Każdy wiersz dostaje znak +1, -1 albo 0 w shaderze wierzchołków ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); 0 odrzuca wiersz, zanim narysowany zostanie jakikolwiek fragment.

- Przy podziale po grupie znak pochodzi z tabeli grup o 4096 pozycjach, indeksowanej identyfikatorem grupy wiersza (identyfikator grupy jedzie w czwartym kanale teksela pozycji wiersza).
- Przy podziale po kategorii znak pochodzi z drugiej tabeli o 4096 pozycjach, wypełnianej dla każdej wartości kategorii, a wartość wiersza jest odczytywana z tekstury filtra kolumny; wartość za końcem tabeli jest odrzucana na obu silnikach.
- Przy podziale po zakresie wartość wiersza jest porównywana z dwoma zakresami.

Zmiana podziału restartuje akumulację.

**Ukryte grupy pozostają ukryte przy każdym podziale.** Przy podziale po kolumnie tabela grup nie przenosi już znaków; trzyma 1 dla pokazanej grupy i 0 dla ukrytej ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), a obie tabele trafiają do shadera razem - dwa wiersze jednej tekstury znaków na WebGL2, dwie połówki jednego bufora pamięci na WebGPU. Wiersz jest rysowany tylko wtedy, gdy jego grupa jest pokazana *i* jego wartość kolumny leży po jakiejś stronie. Zatem grupa odznaczona w [Liście drużyn](teams-list.md) albo pominięta przez skupienie na stronie w karcie Mecz nie wnosi nic, bez względu na sposób podziału różnicy.
