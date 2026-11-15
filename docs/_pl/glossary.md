---
title: "Słownik pojęć"
nav_order: 21
lang: "pl"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Słownik pojęć

Krótkie znaczenia słów, których używa ta strona, prostym językiem. Każde hasło prowadzi do strony, która wyjaśnia je w całości.

## Dane {#data}

**Wiersz.** Jedna linia Twoich danych: jedna rzecz, która wydarzyła się w jednym miejscu i czasie, na przykład „gracz 7 był tutaj w 12. sekundzie”. Przeglądarka rysuje każdy wiersz. [Formaty danych](data-formats.md)

**Kolumna.** Jeden rodzaj wartości w wierszach, na przykład x, y, z, czas albo drużyna. Przeglądarka zgaduje, która kolumna jest którą, a zgadnięcie możesz zmienić. [Mapowanie kolumn](column-mapping.md)

**CSV.** Zwykła tabela tekstowa: jeden wiersz w linii, wartości oddzielone przecinkami. Prawie każdy program potrafi ją zapisać. [Wczytywanie plików](loading-files.md)

**Parquet.** Zwarty plik tabeli, który szybko się czyta, nawet przy milionach wierszy. To najlepszy format do podania przeglądarce. [Wczytywanie plików](loading-files.md)

**Zdarzenie.** Coś, co się wydarzyło, na przykład strzał, trafienie, zabójstwo albo start. Wiersz może być zdarzeniem albo tylko informacją „byłem tutaj”. [Filtry](filters.md)

**Osoba.** Ten, kto stworzył wiersze: gracz, pilot, samochód albo czołg. Jedna osoba to jedna linia pozycji w czasie. [Sesje, osoby i grupy](sessions-persons-groups.md)

**Grupa (drużyna).** Zbiór osób pokazywanych tym samym kolorem, na przykład Blue i Red. [Sesje, osoby i grupy](sessions-persons-groups.md)

**Sesja (mecz, runda).** Jedno przejście gry. Mecz albo runda to sesja. Przeglądarka może pokazać jedną sesję albo nałożyć wiele na siebie. [Sesje, osoby i grupy](sessions-persons-groups.md)

**Poziom.** Trójwymiarowa mapa, na której działy się dane: grunt, budynki, mury. Wiersze pojawiają się tam, gdzie się wydarzyły, na poziomie. [Poziomy i geometria tła](levels.md)

## Patrzenie na dane {#looking-at-the-data}

**Mapa cieplna.** Obraz, na którym miejsca, których dotyka wiele wierszy, świecą mocniej. Zimne miejsca są ciche, gorące - zajęte. [Ciepło](heat.md)

**Ciepło.** Ile się działo w danym miejscu. Przeglądarka sumuje blask każdego wiersza w każdym miejscu; suma to ciepło. [Ciepło](heat.md)

**Sprite.** Mała świecąca plama, którą przeglądarka rysuje dla jednego wiersza. Wiele nachodzących sprite'ów sumuje się w ciepło. [Kształt sprite'a](sprite-shape.md)

**Ekspozycja.** Jak jasny jest obraz. Jak w aparacie: za dużo ekspozycji zamienia wszystko w biel, za mało ukrywa szczegóły. [Kolor i ekspozycja](colour-and-exposure.md)

**Nasycenie.** Ilość ciepła, która liczy się jako „tak gorące, jak tylko sięgają kolory”. Obniż, aby pokazać ciche miejsca; podnieś, aby widzieć tylko najgorętsze. [Kolor i ekspozycja](colour-and-exposure.md)

**Objętość.** Pudełko albo kształt, który umieszczasz w widoku 3D. Przeglądarka liczy, co jest w środku, i porównuje wolumeny między sobą. [Wolumeny i porównanie](volumes.md)

**Filtr.** Reguła, która ukrywa niechciane wiersze, na przykład „tylko zabójstwa” albo „tylko drużyna Red”. [Filtry](filters.md)

## Powtórka {#replay}

**Figura.** Mały model czołgu, samolotu, samochodu albo żołnierza, który porusza się tam, gdzie według danych był. [Sylwetki](figures.md)

**LOD (poziom szczegółowości).** Każda figura ma wersję szczegółową, prostszą i bardzo prostą. Bliskie używają szczegółowej, dalekie - prostej, dzięki czemu można narysować tysiące naraz. [Sylwetki](figures.md)

## Wyścigi {#racing}

**Okrążenie.** Jeden przejazd trasy, od linii do linii. [Wczytywanie okrążeń](race-loading-laps.md)

**Okrążenie odniesienia.** Okrążenie, z którym porównuje się wszystkie inne. Różnice są pokazywane jako „szybciej” albo „wolniej” od niego. [Wczytywanie okrążeń](race-loading-laps.md)

**Punkt wierzchołkowy.** Punkt zakrętu, w którym samochód jest najbliżej wewnętrznej krawędzi. [Analiza zakręt po zakręcie](race-corner-analysis.md)

**Poślizg.** Jak bardzo opona się ślizga. Lekki poślizg daje najwięcej przyczepności; za dużo i samochód zarzuca. [Analityka wyścigów: metoda](race-analytics.md)

**Obwiednia.** Co samochód potrafi przy każdej prędkości: jak mocno może skręcać, hamować i przyspieszać, zanim się ślizgnie. [Analityka wyścigów: metoda](race-analytics.md)

## Liczby lotnicze {#aircraft-numbers}

**ALT.** Wysokość: wysokość nad ziemią albo poziomem morza. [Powtórka meczu](match-replay.md#labels-and-statistics)

**TAS.** Prawdziwa prędkość względem powietrza: jak szybko samolot porusza się w powietrzu. [Powtórka meczu](match-replay.md#labels-and-statistics)

## Komputer {#computer}

**GPU.** Karta albo układ graficzny. Rysuje obraz i jest dużo szybszy od głównego procesora w rysowaniu milionów plam. [Dwa silniki](backends.md)

**WebGPU / WebGL2.** Dwa sposoby, w jakie przeglądarka pozwala stronie używać GPU. WebGPU jest nowszy. Przeglądarka może użyć któregokolwiek i wybiera najlepszy, jaki ma Twoja przeglądarka. [Dwa silniki](backends.md)

## Słowa z Counter-Strike {#counter-strike-words}

**Runda.** Jedna krótka walka wewnątrz meczu. Jedna strona ją wygrywa, a wynik rośnie o jeden.

**Eco, zakup wymuszony, pełny zakup.** Ile pieniędzy strona wydaje na broń na początku rundy. Eco oszczędza i kupuje prawie nic (poniżej 1500 $ na gracza średnio). Zakup wymuszony wydaje to, co ma (poniżej 4000 $). Pełny zakup kupuje wszystko, na co go stać. [Analiza meczu](match-analysis.md)

**Wymiana.** Zabójstwo, które odpłaca zabójstwo: giniesz, a kolega z drużyny zabija Twojego zabójcę w ciągu 5 sekund. [Analiza meczu](match-analysis.md)

**KAST.** Udział rund, w których gracz zdobył zabójstwo, asystę, przeżył albo został wymieniony. Wyższa liczba oznacza, że gracz pomagał w większej liczbie rund. [Analiza meczu](match-analysis.md)

**ADR.** Średnie obrażenia na rundę: ile zdrowia gracz odebrał wrogom w każdej rundzie. [Analiza meczu](match-analysis.md)
