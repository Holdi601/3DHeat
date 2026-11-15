---
title: "Wnętrze renderowania"
nav_order: 22
has_children: true
lang: "pl"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Wnętrze renderowania

Przeglądarka rysuje miliony kropek jako świecące plamy i sumuje je. Ta sekcja wyjaśnia sztuczki, które utrzymują to w szybkości, oraz co znaczą liczby w nakładce statystyk. Przeczytaj ją, jeśli przeglądarka wydaje się wolna albo chcesz pracować nad rendererem.

```
dane -> okno czasowe -> filtry GPU -> plan próbkowania -> splat -> akumulacja -> kolor -> ekran
```

Aby sprawdzić, jak radzi sobie twój komputer, spójrz na pole statystyk w prawym górnym rogu widoku: [Panel wydajności i statystyki](performance-and-stats.md). Nowe słowa (GPU, wiersz, sprite, mapa ciepła) są w [słowniku pojęć](glossary.md).

## Główny problem {#the-core-problem}

Suma nakładających się radialnych rampek kosztuje *N* × π*r*² zmieszanych fragmentów na klatkę. Przy 100 milionach sprite'ów o promieniu 8 px to 2 × 10¹⁰ fragmentów - około sekundy pracy na wysokiej klasy GPU. Nie da się tego liczyć siłą co klatkę, więc przeglądarka łączy:

- **wiersze posortowane czasowo** - okno osi czasu to dwa wyszukiwania binarne, a koszt odtwarzania zależy od wierszy w oknie, a nie od całego zbioru danych;
- **zero pracy na wiersz po stronie CPU na klatkę** - wiersze leżą w pamięci GPU, skwantowane; filtry, znaki grup, test czasu życia, okno, odrzucanie i przekrój są liczone w shaderze wierzchołków;
- **próbkowanie warstwowe** z wagami kompensującymi, gdy klatka nie może narysować każdego wiersza, oraz **akumulację progresywną**, która zbiega do dokładnego wyniku dla wszystkich wierszy, dopóki widok stoi w miejscu ([Próbkowanie i budżety](sampling-and-budgets.md), [Akumulacja](accumulation.md));
- **dwustopniowe ograniczanie**, które wymienia sprite'y na klatkę, a potem rozdzielczość ciepła, na szybkość klatek ([Próbkowanie i budżety](sampling-and-budgets.md#the-adaptive-budget));
- **egzekwowane budżety pamięci**, dzięki czemu zbiór, który się nie mieści, zostaje widocznie obcięty zamiast powodować awarię ([Pamięć GPU](gpu-memory.md)).

## Jedna klatka {#one-frame}

Pętlę klatek prowadzi [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Wszystko, co zmienia się z częstotliwością klatek - kamera, głowica odtwarzania, budżet - żyje w silniku, a nie w stanie aplikacji, więc klatka nie kosztuje pracy Reacta; stan jest odczytywany raz na klatkę i zapisywany z powrotem tylko dla rzadko odświeżanych odczytów.

1. **Nowe dane?** Nowy zbiór jest zapowiadany (*Wysyłanie N wierszy do GPU*) w jednej klatce i wysyłany w następnej, więc komunikat zdąży się wyświetlić, zanim praca zablokuje wątek. Nowy poziom trafia do renderera; trasy ciepła linii są budowane lub zwalniane.
2. **Głowica odtwarzania** rusza naprzód (najwyżej 0,1 s czasu rzeczywistego na klatkę), zapętla się albo zatrzymuje.
3. **Kamera** odczytuje klawisze, mysz i pada; lustro osi wchodzi w macierz widoku; w WebGPU macierz remapowania głębi zamienia zakres głębi w stylu OpenGL z three.js na zakres WebGPU.
4. **Co jest widoczne**: zakres czasu z osi czasu i historii; tabela znaków grup (widoczność tylko przy podziale po kolumnie); do czterech filtrów - filtry kolumn i wybór Obiektów; podział różnicy.
5. **Tabele kolorów i krzywych** są przebudowywane, jeśli zmieniły się ich ustawienia.
6. **Budżet**: kontroler adaptacyjny ustawia budżet sprite'ów i rozdzielczość ciepła tej klatki; przy *Rysuj każdy wiersz w każdej klatce* budżet zostaje podniesiony tak, by objąć każdy kandydujący wiersz.
7. **Sygnatury** decydują, co bufor akumulacji nadal oznacza: zmiana czegokolwiek, co zmienia, które wiersze wnoszą wkład lub jak (*geometria*), okna czasowego albo tylko sposobu kolorowania wyniku (*kompozycja*). Zobacz [Akumulacja](accumulation.md#what-restarts-it).
8. **Plan próbkowania**: które bloki wierszy rysować ([Próbkowanie i budżety](sampling-and-budgets.md)).
9. **Tryb akumulacji**: reset, rozszerzenie, średnia krocząca, średnia bieżąca albo bezczynność.
10. **Geometria powtórki pudełek** (sześciany, ślady) po stronie CPU, tylko w tym trybie i tylko gdy nie jest bezczynna.
11. **Renderowanie**: silnik rysuje scenę (poziom, siatkę, osie, pudełka, ślady, linijkę), rozpyla ciepło do celu ciepła, scala je z akumulatorem i składa ciepło nad sceną na płótno.
12. **Auto-ekspozycja** uruchamia się, gdy odliczanie dojdzie do zera; sonda ciepła linijki czyta najwyżej jeden piksel co 120 ms; odczyty są publikowane.

Bezczynna klatka - zbieżna, nic się nie zmieniło - pomija scenę i rozpylanie, ale nadal **składa ponownie**: płótno WebGL utworzone bez `preserveDrawingBuffer` ma po składaniu nieokreśloną zawartość, więc zaufanie, że pokaże ostatnią klatkę, jest niebezpieczne. Cele sceny i ciepła są buforami ramki należącymi do przeglądarki i je zachowują, więc bezczynna klatka kosztuje jedno przejście pełnoekranowe.

## Strony w tej sekcji {#pages-in-this-section}

- [Dwa silniki](backends.md) - WebGPU i WebGL2, jak wybierany jest jeden, przełączniki w adresie URL
- [Akumulacja](accumulation.md) - reset, rozszerzenie, średnia krocząca, średnia bieżąca
- [Próbkowanie i budżety](sampling-and-budgets.md) - próbkowanie warstwowe, dokładny tryb, adaptacyjny budżet
- [Akumulacja half-float](half-float-accumulation.md) - zakres i precyzja na celach 16-bitowych
- [Pamięć GPU](gpu-memory.md) - skwantowane przechowywanie wierszy i egzekwowany budżet GPU
- [Wykrywanie renderowania programowego](software-rendering.md)
- [Panel wydajności i statystyki](performance-and-stats.md)
