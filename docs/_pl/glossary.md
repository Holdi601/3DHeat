---
title: "Słownik pojęć"
nav_order: 21
lang: "pl"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Słownik pojęć

Krótkie znaczenia słów, których używa ta strona, prostym językiem. Każde hasło prowadzi do strony, która wyjaśnia je w całości.

## Dane {#data}

**Wiersz.** Jedna linia twoich danych: jedno zdarzenie w jednym miejscu i czasie, na przykład „gracz 7 był tutaj w sekundzie 12”. Widok rysuje każdy wiersz. [Formaty danych](data-formats.md)

**Kolumna.** Jeden rodzaj wartości w wierszach, na przykład x, y, z, czas albo drużyna. Widok zgaduje, która kolumna jest którą, a zgadnięcie możesz zmienić. [Mapowanie kolumn](column-mapping.md)

**CSV.** Zwykła tabela tekstowa: jeden wiersz w linii, wartości oddzielone przecinkami. Prawie każdy program potrafi ją zapisać. [Wczytywanie plików](loading-files.md)

**Parquet.** Zwarty plik tabeli, który szybko się czyta, nawet przy milionach wierszy. To najlepszy format do podania widokowi. [Wczytywanie plików](loading-files.md)

**Zdarzenie.** Coś, co się stało, na przykład strzał, trafienie, zabójstwo albo start. Wiersz może być zdarzeniem albo tylko informacją „byłem tutaj”. [Filtry](filters.md)

**Osoba.** Ten, kto stworzył wiersze: gracz, pilot, samochód albo czołg. Jedna osoba to jedna linia pozycji w czasie. [Sesje, osoby i grupy](sessions-persons-groups.md)

**Grupa (drużyna).** Zbiór osób pokazanych tym samym kolorem, na przykład Niebiescy i Czerwoni. [Sesje, osoby i grupy](sessions-persons-groups.md)

**Sesja (mecz, runda).** Jeden przebieg gry. Mecz albo runda to sesja. Widok może pokazać jedną sesję albo nałożyć wiele na siebie. [Sesje, osoby i grupy](sessions-persons-groups.md)

**Poziom.** Trójwymiarowa mapa, na której działo się wszystko: grunt, budynki, ściany. Wiersze pojawiają się tam, gdzie zdarzyły się na poziomie. [Poziomy i geometria tła](levels.md)

## Oglądanie danych {#looking-at-the-data}

**Mapa cieplna.** Obraz, na którym miejsca dotykane przez wiele wierszy świecą mocniej. Zimne miejsca są spokojne, gorące - ruchliwe. [Ciepło](heat.md)

**Ciepło.** Ile się działo w danym miejscu. Widok sumuje świecenie każdego wiersza w każdym miejscu, a suma to ciepło. [Ciepło](heat.md)

**Sprite.** Mała świecąca plama, którą widok rysuje dla jednego wiersza. Wiele nakładających się sprite'ów sumuje się w ciepło. [Kształt sprite'a](sprite-shape.md)

**Ekspozycja.** Jak jasny jest obraz. Jak aparat: za duża ekspozycja zamienia wszystko w biel, a za mała chowa szczegóły. [Kolor i ekspozycja](colour-and-exposure.md)

**Nasycenie.** Ilość ciepła, która liczy się jako „tak gorąco, jak sięgają kolory”. Obniż, by pokazać spokojne miejsca; podnieś, by widzieć tylko najgorętsze. [Kolor i ekspozycja](colour-and-exposure.md)

**Objętość.** Sześcian albo kształt, który stawiasz w widoku trójwymiarowym. Widok liczy, co jest w środku, i może porównywać objętości między sobą. [Objętości i porównanie](volumes.md)

**Filtr.** Reguła, która ukrywa wiersze, których nie chcesz, na przykład „tylko zabójstwa” albo „tylko drużyna Czerwoni”. [Filtry](filters.md)

## Powtórka {#replay}

**Figura.** Mały model czołgu, samolotu, samochodu albo żołnierza, który porusza się tam, gdzie dane mówią, że był. [Figury](figures.md)

**LOD (poziom szczegółowości).** Każda figura ma wersję szczegółową, prostszą i bardzo prostą. Bliskie używają szczegółowej, a dalekie prostej, więc można narysować tysiące naraz. [Figury](figures.md)

## Wyścigi {#racing}

**Okrążenie.** Jeden przejazd trasy, od linii z powrotem do linii. [Wczytywanie okrążeń](race-loading-laps.md)

**Okrążenie referencyjne.** Okrążenie, do którego porównuje się wszystkie inne. Różnice pokazują się jako „szybciej” albo „wolniej” niż ono. [Wczytywanie okrążeń](race-loading-laps.md)

**Wierzchołek.** Punkt zakrętu, w którym samochód jest najbliżej wewnętrznej krawędzi. [Analiza zakręt po zakręcie](race-corner-analysis.md)

**Poślizg.** Jak bardzo opona się ślizga. Lekki poślizg daje najwięcej przyczepności; za dużo i samochód się zarzuca. [Analityka wyścigowa: metoda](race-analytics.md)

**Obwiednia.** To, co samochód potrafi przy każdej prędkości: jak mocno może skręcić, hamować i przyspieszać, zanim się ześlizgnie. [Analityka wyścigowa: metoda](race-analytics.md)

## Liczby lotnicze {#aircraft-numbers}

**ALT.** Wysokość: wysokość nad ziemią albo poziomem morza. [Powtórka meczu](match-replay.md#labels-and-statistics)

**TAS.** Prędkość rzeczywista względem powietrza: jak szybko samolot porusza się w powietrzu. [Powtórka meczu](match-replay.md#labels-and-statistics)

## Komputer {#computer}

**GPU.** Karta graficzna albo układ graficzny. Rysuje obraz i jest dużo szybszy od głównego procesora w rysowaniu milionów plam. [Dwa backendy](backends.md)

**WebGPU / WebGL2.** Dwa sposoby, w jakie przeglądarka pozwala stronie używać GPU. WebGPU jest nowszy. Widok może używać któregokolwiek i wybiera najlepszy, jaki ma twoja przeglądarka. [Dwa backendy](backends.md)

## Słownictwo Counter-Strike {#counter-strike-words}

**Runda.** Jedna krótka walka wewnątrz meczu. Jedna strona ją wygrywa i wynik rośnie o jeden.

**Eko, zakup wymuszony, pełny zakup.** Ile pieniędzy strona wydaje na broń na początku rundy. Eko oszczędza i kupuje prawie nic (średnio poniżej 1500 $ na gracza). Zakup wymuszony wydaje to, co ma (poniżej 4000 $). Pełny zakup kupuje wszystko, co może. [Analiza meczu](match-analysis.md)

**Wymiana.** Zabójstwo, które spłaca zabójstwo: zostajesz trafiony, a kolega z drużyny strzela w twojego zabójcę w ciągu 5 sekund. [Analiza meczu](match-analysis.md)

**KAST.** Udział rund, w których gracz zdobył zabójstwo, asystę, przeżył albo został wymieniony. Wyższa liczba oznacza, że gracz pomagał w większej liczbie rund. [Analiza meczu](match-analysis.md)

**ADR.** Średnie obrażenia na rundę: ile zdrowia gracz stracił od wrogów w każdej rundzie. [Analiza meczu](match-analysis.md)
