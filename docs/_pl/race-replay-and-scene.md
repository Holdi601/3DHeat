---
title: "Powtórka i scena 3D"
parent: "Analiza wyścigowa"
nav_order: 52
lang: "pl"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Powtórka i scena 3D

Odtwórz swoje okrążenia razem, jak wyścig, i zobacz, gdzie jeden samochód odjeżdża drugiemu. Wszystko, co widzisz w widoku 3D zakładki **Analiza wyścigowa**, jest tu opisane: przejechane linie, kolory namalowane na torze, samochody i etykiety.

![Mapa przyczyn z samochodami wyrównanymi 40 m przed zakrętem: pokolorowany tor, dwa samochody i słupek z flagą](../assets/img/en/race-replay-lined-up.webp)

## Zegar powtórki {#the-replay-clock}

Jeden zegar steruje każdym okrążeniem: sekundy okrążenia **referencyjnego**. Silnik przesuwa go w każdej klatce podczas odtwarzania (o czas klatki × prędkość powtórki); na końcu wraca do 0, gdy **Pętla** jest włączona, a w przeciwnym razie się zatrzymuje. Zegar celowo nie jest częścią magazynu, żeby panel boczny nie przerysowywał się w każdej klatce; HUD i wykresy go subskrybują i aktualizują się najwyżej raz na klatkę.

**Długość powtórki** to najdłuższe okrążenie na zegarze: czas każdego okrążenia (minus jego przesunięcie w trybie *Wyrównane*) albo czas referencji w trybie *Obok siebie*.

## Pasek sterowania {#the-transport-bar}

Pod widokiem, od lewej do prawej:

| Element | Co robi |
|---|---|
| ⏮ | wraca na początek (także **Home**) |
| ▶ / ❚❚ | odtwarza / pauzuje (także **K**) |
| prędkość | 0,25×, 0,5×, 1×, 2×, 4× |
| suwak przewijania | ustawia zegar bezpośrednio, co 0,01 s |
| zegar | `czas / długość · metry`: zegar jako czas okrążenia, długość powtórki i jak daleko wzdłuż referencji jest samochód referencyjny |
| *Od linii startu* / *Wyrównane* / *Obok siebie* | tryb powtórki (niżej) |
| **Wyrównaj tutaj** | ustawia każdy samochód tam, gdzie teraz jest referencja, i jedzie dalej stamtąd |
| **Pętla** | zaczyna od nowa na końcu (domyślnie włączona) |
| **Ukryj wykresy** / **Pokaż wykresy** | wykresy dystansu pod paskiem |

Przyciski są nieaktywne, dopóki nie wczytasz okrążeń (jedno wystarczy do odtworzenia; porównania potrzebują dwóch).

## Tryby powtórki {#replay-modes}

Jak czas każdego okrążenia wynika z zegara:

| Tryb | Czas każdego okrążenia | Co pokazuje |
|---|---|---|
| **Od linii startu** (`start`) | sam zegar | każde okrążenie od jego własnego startu: wyścig między nimi, z odstępem rosnącym tak, jak rósł na torze |
| **Wyrównane** (`anchor`) | zegar plus przesunięcie okrążenia | każdy samochód w tym samym miejscu w tym samym momencie, potem puszczony – co dzieje się od tego punktu, a nie od początku okrążenia |
| **Obok siebie** (`locked`) | czas, w którym okrążenie dotarło do bieżącego dystansu referencji | każdy samochód trzymany na dystansie referencji przez całe okrążenie: prędkości i sterowanie porównane metr po metrze |

Używaj, gdy:

- **Od linii startu**: chcesz zobaczyć, kto prowadzi i jak rośnie odstęp.
- **Wyrównane**: chcesz wiedzieć, co dzieje się w jednym zakręcie albo na jednej prostej, przy czym wszyscy zaczynają tam równo.
- **Obok siebie**: chcesz porównać, co kierowcy robią pedałami i kierownicą w tym samym miejscu toru.

**Przesunięcia w trybie *Wyrównane*:** dla kotwicy w `s` metrach wzdłuż referencji przesunięcie każdego okrążenia to jego własny czas w `s` minus czas referencji w `s`, oba odczytane z wyrównanych okrążeń (zobacz [jedna oś dystansu](race-corner-analysis.md#one-distance-axis)). Okrążenie, które nie sięga `s`, zachowuje przesunięcie 0. Wybranie *Wyrównane* z przycisków trybu stawia kotwicę na bieżącym dystansie referencji.

Biały słupek z flagą (14 m wysokości) zaznacza kotwicę w trybie *Wyrównane*.

### Wyrównywanie {#lining-up}

| Akcja | Kotwica | Zegar |
|---|---|---|
| **Wyrównaj tutaj** | gdzie referencja jest teraz | bez zmian |
| Shift+klik na wykresach | klikniety metr | 1,5 s przed tym, jak referencja go dojedzie |
| znalezisko w *Gdzie się poprawić*, numerowany znacznik na torze, wiersz *Zakręt po zakręcie* ze znaleziskiem | 40 m przed miejscem, w którym zaczyna się przyczyna znaleziska | 1,5 s przed tym punktem; potem odtwarza |
| zdarzenie kontroli samochodu, etykieta uderzenia | 40 m przed zdarzeniem | 1,5 s przed; potem odtwarza |
| okrążenie w statystykach toru | jak jego znalezisko albo zdarzenie | jak wyżej, z tym okrążeniem jako fokusem |

Patrzenie na znalezisko też ustawia je w kadrze kamery – kula wokół środka zakresu znaleziska, promień większy z 40 m i połowy jego długości plus 30 m (60 m dla zdarzenia) – chyba że kamera goni samochód.

### Kamera za samochodem {#chase-camera}

⌖ na liście okrążeń sprawia, że kamera podąża za tym samochodem: 2,5 + 4 × rozmiar samochodu metrów za nim i 0,9 + 1,1 × rozmiar samochodu metrów nad nim, patrząc w kierunku jazdy, pochylona w dół na samochód, wygładzona (20% drogi w każdej klatce), żeby nie drżała przy każdym podrzuceniu. Ponowne ⌖ ją zwalnia. Gonione auto rysuje się trochę jaśniej, z białym pierścieniem na ziemi, a jego karta jest podświetlona.

## Sekcja Widok {#the-view-section}

| Element | Domyślnie | Co robi |
|---|---|---|
| **Linie** / **Mapa czasu** / **Mapa przyczyn** / **Mapa błędów** | Mapa czasu | co jest namalowane wzdłuż toru (niżej); *Linie* nic nie maluje |
| legenda | - | *zyskuje ↔ traci* dla mapy czasu, kolory przyczyn dla mapy przyczyn, *mało okrążeń ↔ najwięcej okrążeń* dla mapy błędów |
| **Przejechane linie** | włączone | linia każdego widocznego okrążenia w jego kolorze |
| **Samochody** | włączone | samochody i źródła kart HUD |
| **Opony i zawieszenie** | włączone | temperatura opon, pierścienie poślizgu, drążki zawieszenia i inne znaki każdego koła, a na samochodach lampy dachowe |
| **Etykiety** | włączone | nazwy zakrętów, numerowane znaczniki, etykiety uderzeń, etykiety zakrętów na mapie błędów |
| **Tor z okrążeń** | włączone | nawierzchnia drogi dla trasy bez wyodrębnionego modelu (ukryta, gdy model trasy jest wczytany) |
| **Wszystkie wartości na kartach** | wyłączone | każdy kanał wymieniony na każdej karcie HUD |
| **Prawdziwe kształty samochodów** | włączone | każdy samochód w kształcie jego odpowiednika (zobacz [Samochody](#the-cars)); wyłączone: otwarty bolid, który niczego z telemetrii nie ukrywa |
| **Rozmiar samochodów** | 1× | od 1× do 10× co 0,5; 1× to prawdziwy rozmiar samochodu, tak długi i szeroki, jak jest w grze. Nic poza tym suwakiem go nie zmienia |

## Przejechane linie {#driven-lines}

Ścieżka każdego widocznego okrążenia przez jego własne próbki, w jego kolorze, rysowana 0,12 m poniżej zapisanej pozycji (zapisana pozycja samochodu to jego punkt odniesienia, 0,28–0,47 m nad drogą w wyodrębnionych torach Forzy). Punkt zachowuje się co 1,5 m; przy więcej niż 10 widocznych okrążeniach te, na które nie patrzysz, zachowują jeden co 6 m (każdy wierzchołek trafia na GPU w każdej klatce).

## Mapy {#the-maps}

Wszystkie trzy to wstęgi wzdłuż ścieżki **referencyjnej**, 0,2 m poniżej zapisanych pozycji, jeden czworokąt na krok siatki co 2 m.

### Mapa czasu (`where`) {#time-map-where}

Dla wybranego okrążenia: sekundy zyskane lub stracone na metr względem okrążenia, z którym jest porównywane w tym punkcie (najlepsze w swojej klasie, a dla referencji najszybsze inne okrążenie przez każdy odcinek), z zmiany wyrównanej delty na krok siatki, wygładzonej na ±10 m. Czerwone tam, gdzie traci czas, zielone tam, gdzie zyskuje, szare pomiędzy; skala kolorów to 95. percentyl wartości bezwzględnych, więc szczyty są obcinane, a większość okrążenia mieści się w zakresie. Szerokość 6 m.

### Mapa przyczyn (`why`) {#cause-map-why}

Dla wybranego okrążenia: każda strata malowana na zakresie, gdzie leży jej **przyczyna** (a nie tam, gdzie widać czas), kolorowana według grupy przyczyny; przy nakładaniu wygrywa najdroższe znalezisko. Szerokość `3 + 9·√(koszt / największy koszt)` metrów; tam, gdzie nic nie stracono, szary pasek 2 m. Znalezisko wybrane w *Gdzie się poprawić* jest malowane na biało.

| Grupa | Kolor | Znaleziska |
|---|---|---|
| hamowanie | pomarańczowy | straty kierowcy w fazie hamowania |
| wejście | purpurowy | straty kierowcy na wejściu i przez środek |
| wyjście | niebieski | straty kierowcy na wyjściu |
| prosta | żółty | straty kierowcy na prostej |
| samochód | szary | to, co tłumaczy samochód |
| okoliczności | ciemnoszary | sytuacja (start wyścigu przeciwko przejazdowi w biegu) |

### Mapa błędów {#mistake-map}

Ile z wszystkich okrążeń (z klas wybranych w statystykach toru) popełniło błąd na każdym metrze – każdego rodzaju albo tylko ten wybrany w statystykach. Każde okrążenie liczy się raz na metr; zakres każdego błędu jest poszerzony o 6 m z każdej strony, żeby krótki był widoczny. Szerokość `3 + 10·(okrążenia / najwięcej okrążeń)` metrów i kolor od przygaszonego brązu do jasnego pomarańczu; szara linia 2 m tam, gdzie żadne okrążenie nie popełniło błędu. Zobacz [Statystyki toru](race-course-statistics.md#the-mistake-map).

## Tor z okrążeń {#track-from-the-laps}

Dla gry, której tor nie został wyodrębniony, pod liniami rysuje się drogę: tak szeroką, jak okrążenia rozłożyły się wzdłuż referencji (liczą się przesunięcia boczne w promieniu 25 m) plus 2 m z każdej strony, co najmniej 4 m z każdej strony linii referencyjnej, wygładzoną na ±8 punktów siatki (±16 m), w szarości asfaltu z jasnymi liniami krawędzi, 0,3 m poniżej zapisanych pozycji. Ukryta, gdy model trasy jest wczytany w **Poziomie**.

## Uderzenia i wypadki na torze {#hits-and-crashes-on-the-track}

Uderzenia i wypadki każdego widocznego okrążenia (zobacz [Zdarzenia kontroli samochodu](race-control-events.md#hits-and-crashes)) są zaznaczone w miejscu, gdzie się zdarzyły, zawsze gdy rysuje się linie albo samochody: kolczasta gwiazdka – czerwona przy wypadku, bursztynowa przy uderzeniu – stojąca na słupku, z pierścieniem w kolorze okrążenia u podstawy, wielkości zależnej od rozmiaru samochodu (wypadki większe). Gdy samochód przejeżdża moment uderzenia, od niego przez 0,8 s rozchodzi się pierścień wstrząsu.


## Tryb pomocy {#help-mode}

**?** obok wyboru języka albo klawisz **?** lub **F1** włącza klucz do każdego koloru na ekranie, na wszystkich trzech zakładkach ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx), [`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Wybór zostaje w tej przeglądarce.

- **Klucz** w rogu widoku wypisuje kolory dla używanej zakładki i trybu. Każda skala pochodzi z miejsca, skąd widok ją bierze, więc edytowana skala cieplna pokazuje się jako edytowana. Na zakładce wyścigowej wypisuje się tylko to, co niosą wczytane okrążenia.
- **Karta każdego samochodu** dostaje tabelę tego, co jest rysowane na jego kołach, według nazwy, z wartością każdego koła w kolorze, w jakim jest rysowana.
- **Samochód w fokusie** dostaje przy każdym kole etykietę mówiącą to samo, ustawioną na zewnątrz narożników. Ukryta, gdy samochód jest na ekranie zbyt mały, żeby się zmieściła.

## Samochody {#the-cars}

**Każdy samochód w swoim kształcie**, w kolorze swojego okrążenia i w prawdziwym rozmiarze. Kształty pochodzą z pliku samochodów, zrobionego raz na komputerze, na którym stoi gra:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Bez niego każdy samochód rysuje się jako **własny samochód aplikacji** jego rodzaju i epoki: sedan, coupé, hatchback, kombi, samochód sportowy, supersamochód, muscle car, terenówka, pickup, van albo mikrosamochód, każdy jako klasyk (przed 1980), z lat 80. i 90. albo nowoczesny ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Są budowane tutaj z ogólnych proporcji: bez logo, bez nazw modeli i bez niczego z plików jakiejkolwiek gry, więc dostarczane są razem z aplikacją. Rodzaj pochodzi z nazwy samochodu, epoka z roku w niej zawartego; samochód bez obu bierze się z jego klasy. Około stu prawdziwych generacji jest znanych po opublikowanej długości, szerokości, wysokości i rozstawie osi ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); linia na każdy, zaokrąglona), więc BMW serii 3 z lat 90. dostaje rozmiar i postawę tego samochodu, nadal jako zwykły kształt bez znaczka i atrapy chłodnicy.

Plik samochodów robi się na twoim własnym komputerze z własnej kopii gry. Zawiera model o niskim stopniu szczegółowości każdego samochodu, około 900 trójkątów, z pozycjami kół (zobacz [polecenie `cars` ekstraktora](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Wczytaj plik z samochodami…** w ustawieniach widoku albo upuszczenie pliku na zakładkę wyścigową go wczytuje; zostaje w tej przeglądarce. Zawiera kształty z gry, więc nie jest czymś do przekazywania dalej, a aplikacja żadnego nie dostarcza.

Który samochód zastępuje samochód okrążenia, ustala się za każdym razem z tego, co jest wczytane, i nigdy nie zapisuje, więc samochód bez odpowiednika dzisiaj dostaje własny, gdy tylko nowszy plik go ma ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Samochód okrążenia | Rysowany jako |
|---|---|
| jego numer jest w pliku dla tej samej gry | dokładnie ten samochód |
| ta sama marka i słowo modelu w nazwie | ten model, najbliższy latami |
| ta sama marka, ta sama generacja | samochód tej marki najbliższy latami |
| cokolwiek innego, z plikiem samochodów | najbliższy z tej samej marki, jeśli jest, inaczej ten sam rodzaj nadwozia, najbliższy latami |
| samochód z otwartymi kołami, po nazwie | bolid poniżej |
| żadne z dwóch pierwszych, a aplikacja zna samochód po jego rozmiarze | własny samochód aplikacji w rozmiarze tego prawdziwego, z plikiem albo bez |
| cokolwiek innego bez pliku | własny samochód aplikacji tego rodzaju i epoki |

Więc okrążenie z samochodu BMW serii 3 z 1990 roku w innej grze pokazuje BMW z mniej więcej tego roku, a samochód nowszy niż plik pokazuje swojego najbliższego krewnego, dopóki plik nie zostanie zrobiony od nowa. Podpowiedź okrążenia i linia pod rozmiarem samochodu dla fokusowanego okrążenia mówią, jako co jest rysowany i jak blisko to jest.

Własne samochody aplikacji mają ciemne szyby. Modele z pliku samochodów są w jednym kolorze na całości, bo plik nie ma lakieru ani szkła, na podstawie których można by to odtworzyć. Koła, tylne światła, lampy i znaki telemetrii poniżej rysuje się jak w bolidzie; drążek zawieszenia biegnie po zewnętrznej stronie koła, gdzie go widać, a wahacze są pominięte.

**Bolid** to samochód z otwartymi kołami w kolorze okrążenia, więc przód jest widoczny z każdego kąta i nic nie zasłania kół: podwozie, pokrywa silnika, pontony, kabina z kaskiem, halo, podłoga, przednie i tylne skrzydła; cztery okrągłe koła, przednie skręcone kierownicą (do 0,5 rad przy pełnym skręcie), każde na dwóch wahaczach z zwrotnicą, drążkiem kierowniczym (przód) albo półosią napędową (tył), i drążek zawieszenia. Model jest obniżony o 0,3 m od zapisanej pozycji, żeby koła stały na drodze, i skalowany przez **Rozmiar samochodów**.

**Nadwozie porusza się na swoich sprężynach**: gdy okrążenie niesie wszystkie cztery skoki zawieszenia, każdy narożnik opada o swój skok (przerysowany do 0,12 m od pełnego odbicia do pełnego ściśnięcia, żeby było widać z kamery za samochodem), a nadwozie zapada się, przechyla i przechyla na boki na płaszczyźnie przechodzącej przez te cztery punkty.

**Co jest rysowane z telemetrii** (przy włączonych *Oponach i zawieszeniu*) wynika z [tabeli kanałów](race-charts-and-hud.md#the-channel-table):

| Znak | Z | Rysunek |
|---|---|---|
| kolor opony | `tireTemp` | sama opona: niebieska zimna → cyjanowa → zielona robocza → żółta → czerwona gorąca, w zakresie 40–130 °C |
| pierścień poślizgu | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (największy) | pierścień na ziemi pod kołem: zielony, gdy przyczepność jest w zapasie, bursztynowy przy 0,66, czerwony przy 1 (krawędź przyczepności według gry); bardzo słaby poniżej 0,3 |
| pasek zawieszenia | `suspension` (0..1) | drążek zabarwiony według skoku: niebieski wysunięty, biały w środku, czerwony ściśnięty |
| żar hamulca | `brakeTemp` (100–900 °C) | tarcza na zewnętrznej stronie koła, od ciemnego do pomarańczowego |
| pas zużycia | `tireWear` (0..1) | pasek wokół krawędzi bieżnika, od białego (nowa) do czerwonego (zużyta) |
| słupek obciążenia | `wheelLoad` (0–12 000 N) | słupek obok koła tak wysoki, jak obciążenie |

Światła hamowania (światło przeciwmgielne i krawędzie skrzydeł) świecą się z pedałem hamulca. Każdy kanał `lamp`, który jest włączony (powyżej połowy zakresu), zapala lampę nad wlotem powietrza w swoim kolorze: działający ABS, działająca kontrola trakcji, DRS, ogranicznik w alei serwisowej, hamulec ręczny, w powietrzu.

**W tłumie** (więcej niż 10 widocznych) samochody, na które nie patrzysz, rysuje się zwyczajnie: nadwozie, skrzydła, koła i światło hamowania.

## Etykiety {#labels}

Przypięte do toru i ustawiane w każdej klatce z rzutu kamery (poza ekranem albo za kamerą – ukryte). Przy włączonych **Etykietach**:

| Etykieta | Gdzie | Kliknięcie |
|---|---|---|
| nazwy zakrętów (`T1`, `T2` …) | nad wierzchołkiem każdego zakrętu na referencji | - |
| numerowane znaczniki 1–5 | pięć największych strat kierowcy wybranego okrążenia, w środku zakresu każdej przyczyny, obramowane kolorem przyczyny; po najechaniu tytuł i koszt | wyrównaj i odtwórz to znalezisko |
| etykiety uderzeń / wypadków | nad każdym wybuchem **fokusowanego** okrążenia: „Wypadek −45 km/h” / „Uderzenie −12 km/h”; po najechaniu pełny opis i podpowiedź | wyrównaj i odtwórz uderzenie |
| etykiety zakrętów na mapie błędów (zamiast nazw zakrętów i znaczników, gdy mapa jest mapą błędów) | nad wierzchołkiem każdego zakrętu: „T3 · 5/40 hamowanie za wcześnie” (najczęstszy błąd, okrążenia, które go popełniły / okrążenia, które przejechały zakręt), „T3 · 5/40”, gdy wybrano jeden rodzaj, „T3 · czysto”, gdy żadnego; po najechaniu straty w zakręcie i pięć najczęstszych błędów | otwórz albo zamknij ten zakręt w statystykach toru |

## Odbite światy {#mirrored-worlds}

Świat aplikacji jest prawoskrętny z osią Y w górę: patrząc z góry, samochód, którego kierunek jazdy `atan2(dx, dz)` rośnie, skręca w lewo. Gra z lewoskrętnym światem – między innymi Forza – wychodzi odbita lustrzanie: każdy zakręt w prawo rysuje się jako zakręt w lewo, zarówno tor, jak i okrążenia.

Same okrążenia to mówią ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): przechodząc każde okrążenie co kilka metrów (3 m), skręcanie jego ścieżki porównuje się ze ściskaniem zawieszenia po zewnętrznej stronie (`suspension.FR` minus `suspension.FL`), a bez zawieszenia – z kierownicą (dodatnią w prawo w każdym adapterze). Okrążenie, które skręca w sumie mniej niż π, nic nie mówi; dowód się liczy, gdy przekracza 2% skrętu. Okrążenia głosują; remis to „nie da się stwierdzić”.

Gdy werdykt okrążeń nie zgadza się z obecnym odwróceniem osi (nieparzysta liczba odwróconych osi w **Kamera i scena → Odwróć oś świata**), sekcja **Okrążenia** mówi to pod listą:

- gra jest odbita, a nic nie jest odwrócone: „Te okrążenia skręcają w prawo tam, gdzie tor jest rysowany jako zakręt w lewo …” z **Odwróć X**;
- osie są odwrócone, ale okrążenia nie są odbite: „Odwrócone osie rysują te okrążenia odbite …” z **Przywróć osie**.

Zmienia się tylko rysunek – odbicie wmontowane w macierz widoku; dane, analiza i każda współrzędna pokazywana przez narzędzia zostają grą. Odwrócenie zachowuje się w przeglądarce. Analiza nazywa zakręty w lewo lub w prawo tym samym pomiarem (świat nieznany traktuje się jako odbity, tak jak świat Forzy).

## Dla deweloperów {#for-developers}

Kod: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Gdzie jest samochód w danej chwili {#what-a-car-is-at-a-moment}

`stateAt` interpoluje każdy kanał między dwiema próbkami wokół czasu okrążenia. Kanały skokowe (bieg, flagi) biorą najbliższą próbkę. Okrążenie, które się skończyło, zatrzymuje się na linii.

**Kurs.** Kierunek jazdy pochodzi z pozycji oddalonych o kilka metrów (co najmniej 2 m z każdej strony, żeby drgnięcie nie obracało samochodu). Kurs nadwozia pochodzi z yaw gry dopiero wtedy, gdy jest dopasowany do kierunku jazdy – znak i przesunięcie, przez średnią kołową próbek szybszych niż 10 m/s (co najmniej 20) – i tylko gdy potem się z nim zgadza (wariancja kołowa poniżej 0,05, około 18° rozrzutu); w przeciwnym razie nadwozie wskazuje kierunek jazdy. To pozwala zobaczyć poślizg (nadwozie i kierunek jazdy osobno), bez ufania konwencji kąta danej gry.

**Kierownica i strony.** To, w którą stronę dodatni skręt obraca samochód i po której stronie są prawe koła gry, mierzy się z okrążenia: kierownicę względem skręcania ścieżki oraz to, która strona zawieszenia ściska się na zewnątrz zakrętów (bez danych o zawieszeniu gry Forzy są brane jako odbite lustrzanie).

