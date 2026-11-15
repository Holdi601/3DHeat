---
title: "Pamięć i budżety"
parent: "Wczytywanie danych"
nav_order: 6
lang: "pl"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---


# Pamięć, budżety i sprawdzenie zmieszczenia

Twój komputer ma ograniczoną pamięć. 3DHeat sumuje, czego potrzebują twoje pliki, i zanim naciśniesz **Wczytaj**, mówi, czy się zmieszczą.

![Szacowana pamięć z napisem nie zmieści się, z wstępnie wpisanym Wczytaj co [N] wiersz i przyciskiem Wczytaj opisanym Za duże - zmniejsz albo przerzedź](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Za duże jak na ten komputer? 3DHeat proponuje wczytanie co N-tego wiersza zamiast wszystkich.*

Karta przeglądarki, która w połowie wczytywania zabraknie pamięci, pada i traci minuty pracy, a GPU, któremu zażądano więcej, niż ma, albo traci kontekst, albo zwalnia do ślimaka. Dlatego przed startem wczytywania panel Źródło mówi, ile pamięci wczytanie potrzebuje, porównuje to z budżetami wykrytymi dla tego komputera i odmawia — z wyjściem — gdy się nie zmieści. Model jest w [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Szacowanie pamięci {#the-memory-estimate}

Pokazane nad przyciskiem **Wczytaj**, gdy wiersze zostały policzone.

| Linia | Znaczenie |
|---|---|
| **Szacowana pamięć** - *mieści się* / *ciasno* / *nie zmieści się* | Werdykt, zielony, bursztynowy albo czerwony. |
| `N wierszy · B B/wiersz` | Wiersze, które zostaną wczytane (po kroku przerzedzania), i stały rozmiar bajtowy wiersza. |
| `RAM X zajęte, Y szczyt podczas wczytywania` | Pamięć trzymana po wczytaniu i najwyższy poziom w czasie wczytywania. |
| `GPU Z · szac. wczytanie T` | Pamięć GPU dla wierszy i szacowany czas przy 1,2 miliona wierszy na sekundę. |
| nazwa GPU | Nazwa renderera, gdy sterownik ją podaje. |
| Komunikaty | Dlaczego się nie mieści albo jest ciasno i co zrobić. |
| **Wczytaj co [N] wiersz** | Krok przerzedzania (zob. niżej). |
| `Budżet: X RAM, Y GPU. Zmień w Wydajność → Budżety zasobów.` | Budżety, których użyło sprawdzenie. |

### Bajty na wiersz {#bytes-per-row}

| Kolumna | Stała (RAM) | Uwagi |
|---|---|---|
| Pozycja | 12 | Trzy 32-bitowe liczby zmiennoprzecinkowe, zawsze (płaska oś to nadal tablica) |
| Czas | 4 | Gdy zmapowany |
| Czas życia | 4 | Gdy zmapowane są czas i osoba |
| Osoba | 4 | Gdy zmapowana |
| Grupa | 2 | Gdy zmapowana |
| Sesja | 4 | Gdy zmapowana |
| `Plik źródłowy` | 4 | Gdy wczytano więcej niż jeden plik |
| Każda kolumna filtra | 4 | Za każdą zaznaczoną kolumnę *Zachowaj do filtrowania* |

**Szczyt** dodaje to, czego wczytywanie potrzebuje tylko chwilowo — 8 bajtów czasu 64-bitowego podczas scalania, 12 bajtów kluczy sortowania i indeksów, 4 bajty pomocniczej permutacji (wszystkie trzy, gdy czas jest zmapowany) i 4 bajty, dopóki kolumna grupy jest jeszcze 32-bitowa — i mnoży sumę przez **2,0**. Ten współczynnik został zmierzony (prawdziwe wczytanie wielu plików osiągnęło 1,9× policzonych tablic, z zestawu roboczego dekodera Parquet, kopii, które przycinają każdą kolumnę do długości, i pamięci zwolnionej, ale jeszcze nie oddanej) i zaokrąglony w górę, bo zbyt mała estymacja kosztuje padniętą kartę, a zbyt duża tylko niepotrzebny krok przerzedzania.

Na **GPU** każdy wiersz kosztuje 8 bajtów (pozycja i grupa, po 16 bitów każda), plus 4 bajty (czas i czas życia, po 16 bitów każdy), gdy zmapowane są czas i osoba. Zob. [Rezydencja pamięci GPU](gpu-memory.md). Tekstury filtrów (4 bajty na wiersz na aktywny filtr) i początki segmentów ciepła linii (8 bajtów na wiersz, gdy tryb Linie jest włączony) nie są częścią tego szacowania.

## Sprawdzenie zmieszczenia {#the-fit-check}

Porównywane są trzy ograniczenia ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- szczytowa pamięć RAM względem **budżetu RAM**,
- bajty GPU względem **budżetu GPU**,
- liczba wierszy względem **limitu sortowania** wynoszącego 400 000 000 wierszy, gdy zmapowana jest kolumna czasu.

Decyduje najgorszy z trzech stosunków: do 70% *mieści się*, do 100% *ciasno* (powinno się wczytać, ale będzie wolno), powyżej *nie zmieści się*. Gdy się nie mieści, panel nazywa ograniczenie decydujące i proponuje:

- wczytanie co *N*-tego wiersza, gdzie *N* = ⌈wiersze / wiersze, które się mieszczą⌉, wstępnie wpisane w pole kroku;
- usunięcie kolumn filtrów, odmapowanie kolumny czasu (co usuwa sortowanie i jego limit, kosztem osi czasu) albo podniesienie budżetu.

Gdy sam budżet nie jest faktem o sprzęcie — przeglądarka ograniczyła wartość RAM, domyślna wartość została obniżona przez to, co jest wolne w tej chwili, albo wartość GPU jest zgadywaniem — komunikat to mówi, żebyś nie sięgał po krok, którego nie potrzebujesz.

### Przerzedzanie {#decimation}

**Wczytaj co [N] wiersz** zachowuje jeden wiersz na *N*, liczone osobno dla każdego pliku. Ciepło to średnia, więc co *N*-ty wiersz daje ten sam rozkład z większym szumem — ten sam kompromis, który renderer i tak robi w każdej klatce. Pole startuje od 1 (*wiersz (wszystkie)*); gdy wybór się nie mieści, jest wstępnie wypełnione sugerowanym krokiem, chyba że coś w nim wpisałeś. Przycisk Wczytaj wtedy pokazuje *Wczytaj N plików (1 na K)*, a nazwa zbioru danych zapisuje `co K-ty wiersz`.

### Limit sortowania {#the-sort-ceiling}

Renderer potrzebuje wierszy w rosnącym porządku czasu, więc zmapowana kolumna czasu oznacza posortowanie każdego wiersza, sortowaniem radix po 32-bitowych kluczach ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Powyżej **400 milionów** wierszy to jest odrzucane zamiast próbowania w karcie. Jest to sprawdzane przed wczytaniem, więc wybór ponad limit jest odrzucany z sugestią kroku, zamiast być czytany w całości i paść na ostatnim kroku. Blisko limitu (*ciasno*) panel ostrzega, że sortowanie to długi przebieg bez własnego postępu. Bez kolumny czasu nie ma sortowania i żaden limit nie obowiązuje.

## Budżety zasobów {#resource-budgets}

**Wydajność → Budżety zasobów** (zwijana linia na dole panelu Wydajność, pokazująca `Budżety zasobów - RAM, GPU, rdzenie`). Budżety są wykrywane; wykryta wartość jest domyślna; a suwaki nie idą wyżej niż **sufit**, którym jest wykryta wartość, chyba że wiadomo, że wykrycie nie jest pomiarem.

| Kontrolka | Zakres | Znaczenie |
|---|---|---|
| **RAM na dane wierszy** | od 256 MiB do sufitu RAM, logarytmicznie | Budżet RAM dla sprawdzenia zmieszczenia. Oznaczony *(powyżej wykrytego)* za wykrytą wartością domyślną, *(maks.)* na suficie. |
| **GPU na dane wierszy** | od 128 MiB do sufitu GPU, logarytmicznie | Budżet GPU dla sprawdzenia zmieszczenia i wysyłania wierszy. Oznaczony *(powyżej wykrytego)* za wykrytą wartością domyślną, *(maks.)* na suficie. |
| **Wątki parsera** | od 1 do liczby rdzeni logicznych | Ile plików wczytanie parsuje naraz, każdy we własnym procesie roboczym. Domyślnie rdzenie - 2 (rdzenie - 1 przy czterech albo mniej). Zob. [Wątki parsera](#parser-threads) (w sekcji Dla programistów). |
| Linia źródeł | | Skąd pochodzi każda wartość (`RAM: …. GPU: …. CPU: ….`). |
| **Wykryj ponownie** | | Prosi serwer deweloperski o świeży odczyt pamięci i przelicza każdy budżet. |
| nazwa GPU | | Krótka nazwa karty; pełny ciąg renderera jest w podpowiedzi. |

### Podnoszenie budżetu GPU {#raising-the-gpu-budget}

Budżet GPU powyżej wykrytej wartości obowiązuje tak, jak ustawiony: sprawdzenie i wysyłanie biorą tę samą wartość z jednej funkcji ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), która ogranicza ją tylko do sufitu GPU, na którym zatrzymuje się suwak. Tak więc wczytanie, które sprawdzenie przepuszcza, jest wysyłane w całości. Powyżej wykrytej wartości suwak pokazuje *(powyżej wykrytego)*: liczba jest wtedy twoją oceną karty, a nie pomiarem, a ustawienie jej wyżej, niż ma karta, grozi utratą kontekstu albo ślimaczeniem.

## Ogromne zbiory danych: dźwignie {#huge-datasets-the-levers}

Od najtańszej do najbardziej drastycznej:

1. **Mniej kolumn filtrów.** Każda to 4 bajty na wiersz i przebieg dekodowania.
2. **Krok.** Co *N*-ty wiersz.
3. **Brak kolumny czasu.** Brak sortowania, brak limitu sortowania, brak 4–8 bajtów na wiersz czasu i czasu życia — i brak osi czasu.
4. **Podnieś budżety**, gdy wiesz, że pamięć tam jest.

Podczas renderowania duże zbiory danych są obsługiwane przez próbkowanie i progresywną akumulację, a nie przez zmniejszanie danych; zob. [Próbkowanie i budżety](sampling-and-budgets.md).

## Dla programistów {#for-developers}

### Wątki parsera {#parser-threads}

Wczytanie wielu plików parsuje naraz do **Wątków parsera** z nich, każdy w procesie roboczym parsera, uruchomionym przez proces roboczy przyjmowania dla tego wczytania ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Przy 1 albo dla jednego pliku pliki są parsowane jeden po drugim w samym procesie roboczym przyjmowania.

Uruchamianie kilku naraz nie luzuje sprawdzenia zmieszczenia:

- **Budowniczy liczony jest najpierw.** Scalone kolumny są przydzielane dla całego wyboru, zanim przeczytany zostanie pierwszy plik, więc pliki w locie dostają tylko to, co budżet RAM zostawia obok nich (`parseHeadroom`): pozycja, czas 64-bitowy, kąty patrzenia, osoba, grupa 32-bitowa, sesja, kolumny filtrów i `Plik źródłowy`, na wiersz, który ma być wczytany — pomnożone przez 2,6, gdy liczba wierszy jest szacunkiem z CSV, bo kolumna rośnie do większej.
- **Każdy plik rezerwuje swój koszt, zanim się zacznie** (`fileParseBytes`): jego wiersze (z stopki Parquet; udział CSV w szacunku według rozmiaru) razy te same kolumny, razy **8** — sam blok, kopia obok, dopóki wiersze bez pozycji są odrzucane, i zestaw roboczy dekodera, który dla kolumn tekstowych jest znacznie większy niż ich identyfikatory. Krok tego nie zmniejsza, bo pliki są czytane w całości, a dopiero potem przerzedzane. Liczba 8 jest zapasem ustawionym pomiarem: przy 3, albo przy 5, trzydzieści wątków parsera przekroczyło limit karty przy 86 milionach wierszy z nazwami osób i sesji; przy 8 nie przekroczyło.
- **Kolejny plik startuje tylko wtedy, gdy jego rezerwacja mieści się** w tym, co zostało. Plik, który skończył, ale czeka, aż wcześniejszy zostanie scalony, trzyma swoją rezerwację do scalenia.
- **Jeden plik zawsze działa.** Gdy nic nie jest zarezerwowane, następny plik startuje bez względu na koszt — to jest wczytywanie jeden po drugim, które sprawdzenie dopuściło, więc ciasny budżet cofa się do niego zamiast odmawiać.

Wartość *szczytu podczas wczytywania* to szczyt wczytywania jeden po drugim, który przypada na sortowanie, po przeczytaniu każdego pliku. Pliki parsowane obok siebie mogą zabrać pamięci ponad tę wartość podczas czytania; rezerwacje trzymają to w granicach budżetu RAM, o ile powyższe szacunki są trafne.

Kolejność scalania to kolejność wyboru, niezależnie od tego, w jakiej kolejności pliki się skończą, więc numeracja osób, grup i sesji, wiersze i wartości `Plik źródłowy` są identyczne z wczytaniem jeden po drugim. Plik, którego nie da się odczytać, jest pomijany i wypisywany dokładnie tak jak dawniej. Proces roboczy parsera, który padnie, kończy całe wczytanie, tak jak zawsze padnięcie procesu roboczego przyjmowania; każdy proces roboczy parsera jest zamykany, gdy wczytanie się kończy, niezależnie od tego, jak się skończy. Gdy procesów roboczych parsera nie da się w ogóle uruchomić, pliki są parsowane w procesie roboczym przyjmowania.

### Jak wykrywane są wartości {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) działa przy starcie, ponownie, gdy renderer już istnieje, i po **Wykryj ponownie**.

**RAM, z serwerem deweloperskim.** `start.bat` i `npm run dev` serwują stronę z procesu, który może czytać pamięć maszyny, pod `/__host/memory` (odpowiada w ciągu 1,5 s albo jest ignorowany). Wartość domyślna to mniejsza z 60% zainstalowanego RAM i 80% aktualnie wolnego RAM; sufit to 60% zainstalowanego. Gdy to wolna pamięć obniża wartość domyślną, panel to mówi i sugeruje zamknięcie programów i naciśnięcie **Wykryj ponownie**.

**RAM, bez niego** (wdrożenie statyczne): żadne API przeglądarki nie podaje wolnej pamięci, a `navigator.deviceMemory` jest zaokrąglane w dół do potęgi dwójki i ograniczane do 8 GiB przez Chrome i Edge. Wartość domyślna to 60% `deviceMemory`, dalej ograniczona do 4 × wolnego sterty JS karty, tam gdzie przeglądarka ją podaje, albo 4 GiB, gdy nic nie jest podane. Gdy `deviceMemory` wynosi dokładnie 8 (ograniczenie), wartość jest oznaczona jako *ograniczona*, a sufit to 4 × wartość domyślna, z notatką, że powyżej wartości domyślnej liczba jest twoim założeniem, a nie pomiarem.

**W obu przypadkach** wartość domyślna i sufit RAM są ograniczone do **12 GiB** — największa pamięć tablic typowanych, jaką może mieć jedna karta Chrome, bez względu na to, ile ma maszyna (strona osiągnęła około 15,75 GB i padła; 12 zostawia miejsce na resztę); nigdy nie schodzą poniżej 256 MiB.

**Pamięć GPU.** Żadne API sieciowe jej nie podaje.

- Z serwerem deweloperskim pamięć karty odczytuje `nvidia-smi` (największy adapter) albo, w Windows, z wartości rejestru karty graficznej `HardwareInformation.qwMemorySize`. Wartość domyślna to 70% tego, sufit 90%.
- Bez odczytu jest wnioskowana: domyślnie 2 GiB; 4 GiB, gdy największa tekstura ma 16 384 px lub więcej (karta dedykowana), 1 GiB, gdy mniej; albo 8 × `maxBufferSize` WebGPU, gdy to więcej. Sufit to wtedy 8 × wnioskowana wartość, bo wnioskowanie odróżnia zintegrowany układ od dedykowanego i nic drobniejszego. Panel mówi, że wartość jest wnioskowana.
- Nigdy poniżej 128 MiB.

**Procesor.** `navigator.hardwareConcurrency` (4, gdy nie jest podane).
