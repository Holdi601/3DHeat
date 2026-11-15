---
title: "Wnioski"
nav_order: 7
has_children: true
lang: "pl"
source: "insights.md"
source_hash: "8232fe145807"
translated: true
outdated: false
---

# Wnioski

**Wnioski** przeglądają wczytane dane w poszukiwaniu tego, co się wyróżnia - mocnych pozycji, zabójczego terenu, pułapek na odrodzeniu, wąskich gardeł, graczy znacznie ponad rówieśnikami - i mówią o tym, od najmocniejszego, wraz z dowodami. Użyj ich, by w minutę dowiedzieć się, gdzie mecz został wygrany albo przegrany. Mogą potem napisać podsumowanie, a w jednej powtórce działają jak komentator, który przeskakuje do wielkich momentów.

Wszystko jest liczone w przeglądarce. Nic nie opuszcza komputera, chyba że włączysz zewnętrzną SI (zob. [Zewnętrzna SI](#external-ai)).

![Wnioski na demo czołgów: 14 ustaleń, od najmocniejszego](../assets/img/en/insights.webp)

Sekcja **Wnioski** znajduje się w pasku bocznym kart Mapa cieplna i Mecz. Ma trzy zakładki: **Ustalenia**, **Podsumowanie** i **Komentator**.

## Ustalenia {#findings}

1. Wczytaj dane i otwórz **Wnioski**. Naciśnij **Znajdź wnioski** („Liczenie… n%” pokazuje postęp).
2. Czytaj listę. Każde ustalenie ma pasek siły, zdanie, to jak mocne są dowody (*Mocne dowody*, *Dobre dowody* albo *Pewne dowody*), który detektor je znalazł oraz klasę pojazdu, gdy ma to znaczenie.
3. **Kliknij ustalenie**: przeglądarka stosuje jego filtry, przelatuje kamerą do miejsca i przeskakuje do czasu, po czym otwiera szczegóły: efekt z 95% przedziałem ufności, wartości p i q, policzone dowody oraz **Wolumen tutaj**, który rysuje [wolumen](volumes.md) wokół miejsca.
4. **Przywróć filtry** przywraca Twoje filtry. **Kopiuj JSON** kopiuje cały raport.

Liczenie używa bieżących filtrów, ukrytych grup i wybranego meczu w całym zakresie czasu. Gdy później zmienisz filtry, pojawi się uwaga; wtedy naciśnij **Policz ponownie**.

Linie na górze listy (na przykład sumy pieniędzy) streszczają cały zbiór danych przed ustaleniami.

![Otwarte ustalenie: strefa gęstych strzałów, jej liczby i pasujący fragment z literatury](../assets/img/en/insights-finding.webp)

### Detektory {#the-detectors}

| Detektor | Co znajduje | Potrzebuje w danych |
|---|---|---|
| **Pozycje siły** | Miejsca z dużo lepszym stosunkiem zabójstw do zgonów niż reszta mapy oraz *bezpieczny teren*, na którym mało kto ginie w stosunku do czasu spędzonego | zdarzenia zabójstw i zgonów |
| **Gorące i zimne strefy** | Miejsca, gdzie rodzaj zdarzenia (strzały, trafienia, przejęcia ...) zdarza się znacznie częściej albo rzadziej, niż przewiduje czas spędzony tam | kolumna zdarzeń |
| **Otwarty teren i osłona** | Zgony na otwartym terenie przy bliskiej geometrii poziomu oraz powolne ruchy przy szybkim ruchu | zgony; poziom 3D dla części geometrycznej |
| **Spawny** | Mocne spawny, pułapki na odrodzeniu, bezpieczne spawny, czas do pierwszego kontaktu | czas i osoby |
| **Klasa wg miejsca** | Klasa pojazdu albo gracze kontra SI, radzący sobie znacznie lepiej lub gorzej na danym obszarze | zabójstwa plus kolumna klasy pojazdu albo gracza/SI |
| **Gracze** | Gracze zabijający lub giniący znacznie częściej albo rzadziej niż inni w tej samej klasie | osoby i zabójstwa |
| **Wąskie gardła i flanki** | Wąskie gardła (znacznie więcej przejść niż okoliczny teren) i trasy flankujące (rzadko używane, ale prowadzące do zabójstw) | osoby |
| **Wartość** | *Kosztowny teren* i *Zarabiający teren* | [kolumny wartości](value-weighting.md) |

Detektory, których nie da się uruchomić na danych, są wypisane na dole z powodem.

### Jak ustalenia są uszeregowane {#how-findings-are-ranked}

Każde miejsce albo grupa jest testowane względem reszty mapy (dokładne testy dwumianowe albo współczynników). Stopa fałszywych odkryć jest utrzymywana na poziomie 5% (Benjamini-Hochberg). Przypadek potrafi wyglądać jak wzorzec; to ogranicza fałszywe alarmy: wśród pokazanych ustaleń spodziewany jest najwyżej mniej więcej jeden na dwadzieścia wynikający z przypadku. Efekty z małej liczby zdarzeń są przed uszeregowaniem przyciągane ku „brakowi efektu”. Wypisywanych jest najwyżej 60 ustaleń, a każdy detektor dostaje kilka miejsc blisko szczytu.

## Podsumowanie {#debrief}

Zakładka **Podsumowanie** spisuje ustalenia jako krótki tekst: wstęp, najwyraźniejsze ustalenie, jedno o taktyce, jedno o równowadze, reszta pogrupowana według detektora oraz to, ile opiera się na słabszych dowodach. Każdy akapit ma ponumerowane przyciski pokazujące jego ustalenia. **Kopiuj tekst** kopiuje go.

![Podsumowanie napisane przez wbudowanego narratora](../assets/img/en/debrief.webp)

Wbudowany narrator działa offline, w Twoim języku. Wybór **Soczewka** nad nim (zob. [Soczewka wiedzy](knowledge.md)) decyduje, którą literaturę cytują akapity.

### Zewnętrzna SI {#external-ai}

**Ustawienia SI** pozwalają, by podsumowanie napisał wybrany model SI:

| Ustawienie | Znaczenie |
|---|---|
| **Dostawca** | Anthropic (Claude), OpenAI (ChatGPT), OpenRouter, Ollama (lokalny), LM Studio (lokalny), serwer llama.cpp (lokalny) albo dowolny punkt zgodny z OpenAI |
| **Bazowy URL**, **Model** | Wypełniane przez dostawcę; **Wyświetl modele** pyta serwer |
| **Klucz API** | Wysyłany tylko do bazowego URL. Nigdy nie jest logowany ani zapisywany w widokach, eksportach czy plikach `.3dheat`. Większość lokalnych serwerów go nie potrzebuje. |
| **Zapamiętaj klucz w tej przeglądarce** | Domyślnie wyłączone: klucz jest zapominany po zamknięciu strony |
| **Użyj zewnętrznej SI** | Domyślnie wyłączone |
| **Wysyłaj nazwy graczy** | Domyślnie wyłączone: gracze są wysyłani jako P1, P2 ... |

Potem wpisz opcjonalne pytanie i naciśnij **Napisz z pomocą SI**. Wysyłane są tylko ustalenia i ich liczby - nigdy wiersze Twoich danych. Odpowiedź napływa strumieniowo; cytowane ustalenia stają się przyciskami.

## Komentator {#caster}

Dla **jednego meczu** (wybierz go, jeśli wczytano kilka) **Komentator** znajduje momenty warte obejrzenia: pierwszą krew, wielokrotne zabójstwa, wymiany, clutche, zwroty przy celach, powroty, wyróżniających się graczy, długie strzały.

![Momenty komentatora z jednej rundy demo strzelanki](../assets/img/en/caster.webp)

- Kliknij moment: widok przechodzi na powtórkę, przeskakuje tuż przed nim, przelatuje tam i podąża za graczem.
- **Odtwórz momenty** odtwarza każdy do końca i idzie dalej; **Poprzedni** / **Następny** przechodzą krok po kroku.
- Przy włączonej zewnętrznej SI **Komentarz SI** pisze komentarz z listy momentów (rodzaje, czasy, nazwy lub pseudonimy, drużyny, klasy, odległości).

Potrzebuje osób i zdarzeń zabójstw i zgonów (albo przejęć); kolumna `other`/`victim` umożliwia wymiany i długie strzały.

## Soczewka wiedzy {#knowledge-lens}

Ustalenie można czytać przez **soczewkę** ugruntowanej wiedzy: doktryny wojskowej, walki powietrznej i morskiej, operacji miejskich, projektowania gier i e-sportu (albo *Auto*, wybierane przez jednostki w danych). Otwarte ustalenie pokazuje wtedy najbliższy wpis **doktryny i literatury** oraz **historyczną analogię** z odnośnikami, a **Miary soczewki** liczą na danych miary z tej literatury (dopasowania Lanchestera, stosunki wymian, stosunki sił, pola ostrzału, kluczowy teren, wymiany, inicjatywę). Podsumowanie i prompt SI je zawierają. Wszystko o tym: [Soczewka wiedzy](knowledge.md).

Miary soczewki mierzą też, jak gracze zachowują się jako tłum i jako grupa - zgodność i krążenie, pędzenie tras, pasy i ślady, tłok, liderów i podążających, maruderów, punkt załamania przy stratach, ryzyko po utracie życia, serie, zgodność zakupów i reakcję na nadlatujący ogień - każde z własnym modelem zerowym: [Zachowanie zbiorowe](collective-behaviour.md).

## Dane, dzięki którym wnioski działają {#data-that-makes-insights-work}

- pozycje z **czasem**, kolumną **osoby** i **drużyny**;
- kolumna **zdarzeń** z zabójstwami i zgonami (`kill`, `death`) oraz innymi (`hit`, `fire`, `capture` ...);
- kolumna **drugiej strony** (`other`, `victim`) dla wymian i kierunków;
- kolumna **pojazdu** albo **typu** dla klas; kolumna `ai` dla graczy kontra SI;
- kolumna **sesji** / **meczu** / **rundy**, gdy jest kilka meczów.

[Dane demonstracyjne](demo-data.md) mają wszystkie z nich.
