---
title: "Analiza zakręt po zakręcie"
parent: "Analiza wyścigowa"
nav_order: 55
lang: "pl"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analiza zakręt po zakręcie

Dwa okrążenia tego samego toru porównuje się zakręt po zakręcie. Dla każdego zakrętu aplikacja mówi, kto był szybszy, ile czasu to było warte i dlaczego – za wcześnie hamował, za późno wszedł na gaz, wziął szerszą linię – dzięki czemu wiesz, co najpierw trenować.

![Znalezisko otwarte w sekcji Gdzie się poprawić, obok tabeli Zakręt po zakręcie](../assets/img/en/race-corner-finding.webp)

Przykład: w zakręcie 3 kierowca A hamuje 20 m wcześniej niż kierowca B i traci 0,15 s, żeby tam dojechać, ale wcześniej wchodzi na gaz i zyskuje 0,15 s na wyjściu. Wynik: 0,00 s. Zakręt jest równy i nikt nie dostaje wskazówki, żeby hamować później.

## Co widać {#what-you-see}

### Gdzie się poprawić {#where-to-improve}

Sekcja na pasku bocznym dla wybranego okrążenia („Wczytaj co najmniej dwa okrążenia jednej trasy.”, dopóki ich nie ma).

**Nagłówek:** „<okrążenie> <czas> wobec <referencja> <czas>” i różnica czasu okrążeń – albo, dla referencji, „wobec najszybszego innego okrążenia w każdym zakręcie (…)” i łączna strata. Obok strata podzielona na *jazdę* i *samochód / okoliczności*.

**Pasek podziału:** czas stracony według grup przyczyn (hamowanie, wejście, wyjście, prosta, samochód, okoliczności), w kolorach przyczyn, z legendą.

**Znaleziska**, trzy listy:

1. Straty kierowcy, najkosztowniejsze najpierw, najwyżej **12** – albo „Nigdzie nie widać miejsca, w którym inna jazda wyraźnie dałaby zysk czasu.”
2. **Pokaż, ile kosztował samochód lub sytuacja (X s)** – straty samochodu i okoliczności, najwyżej 8 (domyślnie włączone).
3. **Gdzie <okrążenie> jest szybsze albo w inny sposób równe (N)** – zyski i zakręty równe, najwyżej 10 (domyślnie włączone).

Każde znalezisko pokazuje swój numer, tytuł (zakręt i to, co się stało, a przy stracie także koszt), linię werdyktu, koszt (zyski z minusem) z paskiem oraz etykietkę: *hamowanie*, *wejście*, *wyjście*, *prosta* (straty kierowcy, z „· samochód X”, gdy samochód tłumaczy 0,02 s lub więcej), *samochód*, *okoliczności*, *szybsze* albo *równo*. **Kliknij je**, żeby ustawić samochody 40 m przed nim, wykadrować i odtworzyć je oraz otworzyć pomiary:

- **Hamowanie:** gdzie każde okrążenie hamowało (albo zdjęło gaz), z jakiej prędkości i o ile metrów wcześniej lub później (od 5 m);
- **Najwolniej:** najmniejsza prędkość każdego okrążenia i gdzie;
- **Pełny gaz:** gdzie każde było na pełnym gazie i o ile wcześniej lub później;
- **Linia:** różnica punktu wejścia w skręt, najciaśniejsze promienie, o ile każde szło bardziej wewnątrz lub na zewnątrz, kształt linii każdego okrążenia i jego wierzchołek;
- **Prosta do następnego zakrętu:** jej długość, obie prędkości tam, gdzie obie były na pełnym gazie, ile straciło lub zyskało i z czego – prędkość startowa, mocniejszy ciąg drugiego, zdjęcie gazu, wytracona prędkość, sposób prowadzenia (części od 0,02 s);
- **Samochód:** jaka część straty to samochód i z czego (ciąg, przyczepność, hamulce; gdy 0,02 s lub więcej);

potem wskazówka, **Samochody:** (w różnych samochodach, zobacz [Profile samochodów](race-car-profiles.md#what-the-cars-decide-in-a-corner)) i rada dotycząca linii.

### Zakręt po zakręcie {#corner-by-corner}

Tabela (przy dwóch lub więcej okrążeniach), jeden wiersz na odcinek, dla klasy wybranego okrążenia, gdy jest kilka klas:

| Kolumna | Pokazuje |
|---|---|
| Zakręt | `T3`, `T11-T12` |
| Najszybszy | okrążenie najszybsze w nim (jego własny czas od początku do końca odcinka) |
| przewaga | jego przewaga nad drugim najszybszym, s |
| linia | kształt linii najszybszego okrążenia i wierzchołek („V · późny”, „U/V · środkowy”); po najechaniu – jego najciaśniejszy, wejściowy i wyjściowy promień; „oba warianty” dla mieszanego kompleksu |
| (wybrane okrążenie) | o ile było za najszybszym, albo ✓, gdy było najszybsze |

Kliknięcie wiersza otwiera tam znalezisko wybranego okrążenia (albo ustawia samochody 40 m przed odcinkiem). Pod tabelą, gdy każdy zakręt ma czas: „Najszybsze przejazdy wszystkich zakrętów razem: <czas> (różnica względem referencji / względem najlepszego w klasie X)” – najlepsze odcinki plus najszybszy przejazd do pierwszego zakrętu, gdy to jego własny odcinek.

## Jak to się liczy {#how-it-is-worked-out}

Zasada nadrzędna: **zakręt ocenia się w całości**, od strefy hamowania przed nim do strefy hamowania przed następnym. Okrążenie, które hamuje wcześniej, żeby szybciej ustawić samochód i wcześniej wejść na gaz, dostaje uznane wyjście, które za to zyskało – nie dostaje wskazówki, żeby hamować później.

## Jedna oś dystansu {#one-distance-axis}

Okrążenia porównuje się po dystansie, nie po czasie – sekundę za, dwa okrążenia są w innych zakrętach. Nie po własnym licznikiem kilometrów każdego okrążenia (ciaśniejsza linia pokonuje mniej metrów). **Osią** jest droga przejechana przez **okrążenie referencyjne**:

- Próbki każdego innego okrążenia są **rzutowane** na ścieżkę referencji: każda próbka dostaje `s` – jak daleko wzdłuż referencji się znajduje – i `d` – jak daleko w lewo (dodatnie) lub w prawo. Szukanie idzie do przodu od poprzedniego dopasowania (od 8 odcinków ścieżki wstecz do 40 w przód), więc okrążenie, które przecina się samo ze sobą, nigdy nie przeskoczy na drugie skrzyżowanie. Pierwsza próbka jest szukana w pierwszej ćwiartce ścieżki (na torze zamkniętym start i meta się pokrywają); gdy nic nie leży w promieniu 30 m, bierze się najbliższy punkt w dowolnym miejscu, który nie leży za ostatnim dopasowaniem (po obrocie lub wyjeździe poza tor). `s` nigdy nie maleje: próbka, która rzutuje się za poprzednią, zostaje wstrzymana.
- Każdy kanał jest **przeliczany** na jedną siatkę, **co 2 m**, liniowo; kanały skokowe (bieg, flagi) według najbliższej próbki. Poza własnym zakresem okrążenia wartości są puste.
- Pierwsza i ostatnia próbka okrążenia rzutują się nieco wewnątrz końców referencji, więc każde okrążenie jest **przedłużane o 15 m** poza końce, z prędkością, jaką miało (czas rośnie o dystans podzielony przez prędkość, reszta się trzyma) – dzięki temu jego delta na linii mety to różnica czasów okrążeń.
- `delta` = czas okrążenia w każdym punkcie siatki minus czas referencji: różnica. `lateral` = `d` na siatce.

Czas, jaki jedno okrążenie zajęło więcej niż drugie między dwoma punktami siatki, to różnica ich delt: `rel(s)`. Wszystko poniżej jest na tym zbudowane.

## Zakręty {#corners}

Znajdowane na **referencji** (`findCorners`), z jej prędkością wygładzoną na ±6 m i krzywizną (zmiana kursu na ±5 próbkach, wygładzona na ±10 m):

1. **Minima prędkości z wyróżnieniem.** Punkt, który jest najniższy w promieniu ±40 m i którego spadek od najwyższej prędkości po każdej stronie (przed niższym minimum) wynosi co najmniej `max(2,5 m/s, 6% prędkości)`.
2. **Załamania.** Lokalny szczyt krzywizny ciaśniejszy niż promień **300 m**, bez minimum prędkości w promieniu 80 m: płaskie załamanie to też zakręt, który trzeba przejechać.
3. **Fazy.** Od każdego wierzchołka wstecz, dopóki referencja hamuje (> 0,1) albo nie jest na pełnym gazie (< 0,95): wejście; do przodu, dopóki nie ma pełnego gazu: wyjście. Załamanie przejechane płasko dostaje ±30 m. Nakładające się zakręty zostają osobno, ale są ułożone tak, by pokryć okrążenie.
4. Numerowane T1, T2 … w kolejności okrążenia; **w lewo albo w prawo** według znaku krzywizny i tego, czy świat jest odbity lustrzanie (nieznane traktuje się jako odbite).

**Okno zakrętu** (miejsce, w którym referencja skręca): od najciaśniejszego punktu w promieniu ±40 m od wierzchołka na zewnątrz, dopóki krzywizna pozostaje powyżej jednej szóstej swojego szczytu, plus 10 m z każdej strony. Jego strona wskazuje, co jest „wewnątrz”.

## Odcinki: od strefy hamowania do strefy hamowania {#segments-braking-zone-to-braking-zone}

Każdy zakręt posiada drogę do połowy odległości do wierzchołków po obu stronach. W niej:

- **Najwolniejszy punkt każdego okrążenia** to prawdziwe zagłębienie prędkości – nic nie jest wolniejsze w promieniu 6 m (3 punkty siatki) z żadnej strony, patrząc poza końce odcinka, tak żeby wyjście z poprzedniego zakrętu, wciąż przyspieszające, nigdy nie zostało pomylone z nim. Szukane od 15 m przed oknem zakrętu do 10 m za nim. Okrążenie, które tam nie zwolniło, dostaje punkt przy wierzchołku.
- **Miejsce, w którym okrążenie zaczęło zwalniać** (`entryOf`): wstecz od swojego najwolniejszego punktu, przez hamowanie albo zdjęcie gazu, ponad krótkimi muśnięciami pełnego gazu, aż miało nogę na gazie (gaz ≥ 0,95, hamulec ≤ 0,1) przez **10 m**; gaz podniesiony ponownie w ostatnich **30 m** przed najwolniejszym punktem nadal należy do zakrętu; jeśli cały czas jechało na pełnym gazie, jest to sam najwolniejszy punkt. Okrążenie bez kanału gazu albo które nie miało nogi na gazie od poprzedniego zakrętu zaczyna się w swoim najszybszym punkcie pomiędzy.
- **Odcinek zaczyna się** od pierwszego z wszystkich okrążeń, które zaczęły zwalniać przed nim (4 m wcześniej), i biegnie do początku następnego, więc całe hamowanie każdego okrążenia mieści się w nim, a odcinki pokrywają okrążenie bez luk.

**Kompleksy.** Kolejne zakręty, między którymi referencja nigdy nie jedzie na pełnym gazie – mniej niż **40 m** pełnego gazu – tworzą jeden odcinek „T11-T12”, przejeżdżany jako całość; kompleks ma najwyżej **trzy** zakręty (kręta sekcja, nigdy nie jechana na pełnym gazie, zaczyna nowy). Kompleks, który skręca w obie strony, jest *mieszany*: nie mierzy się dla niego żadnego kształtu linii.

**Na torze zamkniętym** (koniec referencji w promieniu 50 m od startu) ostatnia prosta odcinka biegnie dalej przez linię do pierwszego punktu hamowania: przejazd z linii na okrążeniu lotnym liczy się do ostatniego zakrętu. Okrążenie, które zaczęło z postoju albo ze startu wyścigu (zobacz [Start](#the-start)), trzyma ten przejazd osobno.

### Dokąd prowadzi zakręt {#what-a-corner-leads-onto}

Mierzone na referencji: metry na pełnym gazie po zakręcie (od jego pełnego gazu do końca odcinka, plus przejazd przez linię) i przed nim (poprzedni odcinek „po” albo od startu).

| Typ | Reguła |
|---|---|
| **między dwiema prostymi** (`both`) | 200 m lub więcej przed **i** 120 m lub więcej po |
| **na prostą** | 200 m lub więcej po albo 120 m lub więcej po i co najmniej tyle, ile przed |
| **po prostej** | 200 m lub więcej przed |
| **łącznik** | cokolwiek innego |

## Co każde okrążenie zrobiło w zakręcie {#what-each-lap-did-in-a-corner}

`cornerMetrics`, dla każdego okrążenia i odcinka, na siatce (krok 2 m). Pedały: hamulec liczy się powyżej 0,1, pełny gaz to 0,95 i więcej.

| Miara | Reguła |
|---|---|
| **punkt hamowania** | pierwsze hamowanie, przy którym gaz został zdjęty (poniżej 0,5), albo które trwało **15 m** – muśnięcie lewą nogą przy włączonym gazie nie jest miejscem, gdzie zaczęło się hamowanie; gdy są same muśnięcia, pierwsze muśnięcie |
| **zdjęty gaz** | gdy nie ma hamowania: pierwszy punkt, w którym gaz spadł poniżej 0,8 |
| (bez pedałów) | punkt, w którym okrążenie zaczęło zwalniać (wyżej) |
| **puszczenie hamulca** | ostatnie hamowanie do 30 m za najwolniejszym punktem |
| **prędkość w punkcie hamowania**, **metry hamowania** | do najwolniejszego punktu |
| **szczytowe hamowanie**, **szczytowe opóźnienie** | w strefie hamowania (przyspieszenia powyżej 45 m/s² pomijane) |
| **hamowanie w zakręcie** | metry z hamulcem > 0,05 i \|skręt\| > 0,1 |
| **poślizg blokady** | najbardziej ujemny współczynnik poślizgu koła w strefie (gdy okrążenie ma poślizg) |
| **najwolniejszy punkt**, **minimalna prędkość** | jak wyżej |
| **gaz włączony** | po puszczeniu (albo najwolniejszym punkcie) pierwszy gaz > 0,15 bez hamulca |
| **pełny gaz** | pierwszy punkt po tym, utrzymany na ≥ 0,95 przez 10 m |
| **toczenie się** | metry od puszczenia do włączenia gazu, z hamulcem i gazem poniżej 0,05 |
| **spadki gazu** | razy, gdy gaz spadł o więcej niż 0,25 poniżej swojego bieżącego szczytu między włączeniem gazu a pełnym gazem |
| **szczytowe boczne przyspieszenie** | największe boczne przyspieszenie od 20 m przed puszczeniem do późniejszego z: pełnego gazu i 20 m za najwolniejszym punktem |
| **bieg w wierzchołku** | w najwolniejszym punkcie |
| **poślizg napędzanych kół** | największy współczynnik poślizgu napędzanych kół między włączeniem gazu a pełnym gazem |
| **równowaga** | przedni minus tylny kąt znoszenia przez środek (+ podsterowność) |
| **prosta na pełnym gazie** | udział odcinka po pełnym gazie (i przejeździe przez linię) przy ≥ 0,95; najdłuższe zdjęcie gazu na nim |
| **wytracona prędkość** | największa utrata prędkości od wysokiego punktu przy gazie ≥ 0,9, bez hamulca, na ziemi |
| **znoszenie przy wejściu** | największy kąt dryfu od punktu hamowania do 5 m za najwolniejszym punktem, na ziemi |
| **hamulec ręczny** | miejsce włączenia (> 0,2), do 10 m za najwolniejszym punktem |
| **w powietrzu** | sekundy w powietrzu w odcinku i jego najdłuższy lot |

## Z kim porównuje się każde okrążenie {#who-each-lap-is-compared-with}

- Okrążenie porównuje się z **najszybszym pełnym okrążeniem własnej klasy wydajności** (referencja – w klasie referencji).
- To najlepsze okrążenie klasy (i referencja) porównuje się, odcinek po odcinku, z **tym innym okrążeniem swojej klasy, które było na nim najszybsze** – albo z każdym okrążeniem, gdy jest samo w swojej klasie.

Mapa czasu, różnice w liście okrążeń, zdarzenia kontroli samochodu i tabela zakrętów idą za tym samym porównaniem.

## Bilans czasu zakrętu {#the-time-account-of-a-corner}

`compareCorner`, dla okrążenia względem drugiego na danym odcinku:

- **netto** = `rel(koniec) - rel(początek)` (plus przejazd przez linię na okrążeniu lotnym): werdykt. Bliżej niż **0,03 s** to **równo**.
- **Podział** – miejsce w zakręcie, w którym prowadzący skręcił: na odcinku od pierwszego punktu hamowania albo najwolniejszego punktu któregokolwiek z okrążeń do późniejszego z ich pełnego gazu i najwolniejszych punktów – największa huśtawka, jaką okrążenie wtedy oddało albo odzyskało, gdy ta huśtawka przekracza **0,04 s**; w przeciwnym razie późniejszy z dwóch najwolniejszych punktów.
- **Do wierzchołka** = `rel(podział) - rel(początek)`; **za nim** = netto minus to. Gdy oba są co najmniej 0,04 s i mają przeciwne znaki, okrążenie **wymieniło** jedno na drugie.
- **Za nim** podział następuje jeszcze raz tam, gdzie oba okrążenia jadą na pełnym gazie: **wyjście** (podział do późniejszego pełnego gazu) i **prosta** (od tego miejsca do końca).
- **Prosta** dzieli się na trzy:
  - *prędkość na wyjściu* (`byExit`) – zmierzona, nie modelowana: wolniejszy samochód przechodzi przez startową prędkość szybszego trochę dalej na prostej, a od tego miejsca jego własny zapis to, co zrobiłby z tej prędkości, z własnym przełożeniem, oporem i nachyleniem. Przesunięty z powrotem do tego punktu (i puszczony dalej z prędkością końcową na metrach, które zyskuje) jest jego czasem od szybszego startu; różnica to koszt prędkości na wyjściu. Gdy wolniejszy samochód nigdy nie dociera do tej prędkości (albo tylko w 2 ostatnich próbkach), jego własne przyspieszenie na odcinku wkłada się z powrotem jako moc (`a·v` utrzymane), nigdy mocniej niż pokazuje jego obwiednia przy tej prędkości (dwukrotność zmierzonego przyspieszenia, gdy nie ma obwiedni).
  - *moc samochodów* (`byPower`) – tylko w różnych samochodach: oba samochody od tej samej prędkości na tych samych metrach, na pełnym gazie, całkując przyspieszenie na pełnym gazie, jakie każdy pokazał przy każdej prędkości.
  - *sposób prowadzenia* (`driven`) – reszta: zdjęcie gazu, wytracona prędkość na pełnym gazie.

  Prędkość na wyjściu nigdy nie tłumaczy więcej niż koszt prostej (i nigdy ze znakiem przeciwnym), chyba że zdjęcie gazu albo wytracona prędkość zabrały część z powrotem. Okrążenie **zdjęło gaz** na prostej, gdy jego udział na pełnym gazie jest poniżej zarówno 0,9, jak i udziału drugiego pomniejszonego o 0,05. Wytracona prędkość się liczy, gdy różnią się o więcej niż 1 m/s. Niezgodność poniżej 0,02 s co do znaku ustawia się na 0.

Netto każdego odcinka sumuje się do różnicy czasów okrążeń, a „do wierzchołka” i „za nim” każdego zakrętu – do jego netto (testy sprawdzają obie sumy).

### Udział samochodu {#the-cars-share}

Tylko gdy okrążenia są w **różnych samochodach** i okrążenie straciło czas (`carShare`):

- **moc**: moc samochodów na prostej (wyżej), do wysokości straty;
- **przyczepność**: gdy okrążenie było na granicy swojego samochodu (boczne przyspieszenie w środku co najmniej **90%** tego, co jego samochód utrzymuje przy tej prędkości), a drugi samochód trzyma o ponad **5%** więcej: z niższej minimalnej prędkości, nie wyjaśnionej ciaśniejszym promieniem, udział `½ ln(przyczepność_drugiego / przyczepność_mojego) / ln(v_drugiego / v_mojej)` pozostałej straty;
- **hamulce**: gdy okrążenie hamowało (nie zdejmowało gazu), drugi samochód hamuje o ponad **5%** mocniej, a **średnie** opóźnienie okrążenia w strefie było co najmniej **80%** tego, co jego samochód potrafi: od `u` do `v` przy `a1` wobec `a2`, kończąc w tym samym punkcie, `(1/a1 - 1/a2)(u - v)² / 2u`, do tego, co zostało.

Koszt samochodu to suma, najwyżej równa stracie.

## Werdykt i znalezisko {#the-verdict-and-the-finding}

`cornerFinding` zapisuje najwyżej jedno znalezisko na okrążenie i zakręt, sprawdzając w tej kolejności:

| Przypadek | Znalezisko | Wynik |
|---|---|---|
| netto w granicach ±0,03 s, wymiana, mniejsza strona ≥ **0,1 s** | **równo, dwiema drogami** – kto był wolny na wejściu i szybki na wyjściu, a kto na odwrót; z prostą za nim (na prostą albo między dwiema) ta droga „wolno wejść, szybko wyjść” jest tą, na której warto budować: zachować jej wczesny gaz, odzyskać wejście przez mocniejsze hamowanie, a nie późniejsze | równo |
| netto w granicach ±0,03 s w pozostałych przypadkach | nic się nie mówi | - |
| zyskało, wymiana, straciło do wierzchołka | **wolne wejście, szybkie wyjście się opłaciło**: zachowaj to, tutaj wyjście jest warte więcej | zysk |
| zyskało, wymiana, zyskało do wierzchołka | **szybsze na wejściu**: wejście jest dobre, wcześniejszy pełny gaz zachowałby więcej | zysk |
| zyskało, a drugie okrążenie ma tu stratę | **szybsze – przez to, co zrobiło drugie**; jego przyczyna i wskazówka mówią „Dla drugiego okrążenia: …” | zysk |
| zyskało w inny sposób | **szybsze na wejściu / wyjściu**, zależnie od tego, która połowa zyskała więcej (późniejsze hamowanie, więcej prędkości przez środek; albo wcześniej pełny gaz, mocniejszy ciąg) | zysk |
| straciło, a **uderzenie lub wypadek** kosztowały co najmniej `max(0,05 s, 40% straty)` | uderzenie jest historią zakrętu, przed samochodami | strata |
| straciło, a **udział samochodu** wynosi 60% lub więcej | **samochód**: jego ciąg na prostej, przyczepność przez środek albo hamulce – największa część; z częścią kierowcy (≥ 0,03 s) podaną jako „Drugie X s: …” | strata |
| straciło, a jedna niepodzielona **usterka kontroli samochodu** kosztowała co najmniej `max(0,05 s, 40%)` | ta usterka (zobacz niżej), z tym, jak czas przesunął się wokół niej | strata |
| straciło, a **dłuższy lot** kosztował co najmniej `max(0,05 s, 40%)` | lot | strata |
| straciło, wymiana, zyskało do wierzchołka | **za szybko na wejściu, wolno na wyjściu**: przyczyna wyjścia; oddaj trochę wejścia, żeby wcześniej skręcić i płasko wyjechać, z punktami hamowania i pełnego gazu drugiego okrążenia. Jego korzeń (`cause`, który liczą [statystyki](race-course-statistics.md)): późniejsze hamowanie, gdy hamowało o kilka metrów później niż drugie; w pozostałych przypadkach przyczyna wyjścia | strata |
| straciło, wymiana, straciło do wierzchołka | **oddało na wejściu więcej, niż wyjście odzyskało**: przyczyna wejścia, która jest też jego korzeniem (`cause`); zachowaj wyjście, a na wejściu trać mniej | strata |
| straciło, zdjęło gaz na prostej, a napędzana część była ponad połową straty | **nie na pełnym gazie na prostej**: udział pełnego gazu wobec drugiego, gdzie i jak długo było zdjęcie gazu | strata |
| straciło, ciąg samochodów ponad 60% straty, a prosta ponad połowę | **ciąg samochodu na prostej** (z ciągiem obu samochodów przy 160 km/h) | strata |
| straciło w pozostałych przypadkach | przyczyna połowy, która straciła więcej (do wierzchołka ≥ za nim: wejścia; inaczej wyjścia). Wolniej na wyjściu tylko dlatego, że wolniej przez środek (o ponad 1 m/s): zamiast tego przyczyna środka | strata |

Na znalezisko ze stratą może też kończyć się zdanie **Także:** – utrata prędkości na pełnym gazie albo zdjęcie gazu na prostej – gdy napędzana część prostej kosztowała więcej niż 0,04 s, a nie była już przyczyną.

Znaleziska są sortowane: najpierw straty, najkosztowniejsze najpierw; potem zyski i zakręty równe.

### Przyczyny na wejściu {#causes-on-the-way-in}

`entryCause`, pierwsza, która pasuje (różnice prędkości minimalnej są w m/s; „5 m” to próg, przy którym wcześniejszy albo późniejszy punkt się liczy):

| # | Przyczyna (błąd) | Reguła |
|---|---|---|
| 1 | uderzenie lub wypadek na wejściu | niepodzielone uderzenie zaczynające się do 10 m za najwolniejszym punktem |
| 2 | **prawie stanął** (incydent) | najmniejsza prędkość poniżej **60%** tego, na co pozwala przyczepność tego samochodu tam, gdzie drugi przejechał (`v_drugiego · √(przyczepność_moja / przyczepność_drugiego)`, gdy drugi trzyma więcej, inaczej prędkość drugiego), a drugie okrążenie powyżej 8 m/s – obrót, kontakt albo przestrzelony zakręt |
| 3 | usterka kontroli samochodu na wejściu | niepodzielona blokada, pchanie, obrót albo poślizg nie na gazie, zaczynające się do 10 m za najwolniejszym punktem, koszt ≥ 0,02 s |
| 4 | dłuższy lot przed najwolniejszym punktem | zobacz [rajd](#rally-rotation-and-flights) |
| 5 | **zdjęty gaz**, gdy drugi jechał płasko albo zdjął gaz 5 m lub później | to okrążenie tylko zdjęło gaz |
| 6 | **hamowało tam, gdzie drugi tylko zdejmował gaz** albo jechał płasko | i było wolniejsze przez środek o ponad 0,5 m/s |
| 7 | **hamowało łagodnie** | hamowało (nie zdjęło gazu), miało zapas, by hamować mocniej – z danymi opon, jego poślizg blokady poniżej **60%** poślizgu, przy którym hamulce tego samochodu dają najlepszy wynik; bez nich szczytowe opóźnienie poniżej **85%** tego, co pokazuje przy tej prędkości – pedał poniżej 0,95, a szczytowe opóźnienie drugiego o ponad **15%** wyższe |
| 8 | **hamowało za wcześnie** – albo **hamulce samochodu** | hamowało ponad 5 m przed drugim. W innym samochodzie, którego hamulce są ponad 5% mocniejsze, i z nie więcej niż 10 m zapasu względem drogi, jakiej ten samochód potrzebuje przy swoim opóźnieniu: hamulce samochodu. Inaczej hamowało za wcześnie, z „Hamuj później – około N m” (w innym samochodzie: metry ponad to, czego potrzebuje) |
| 9 | **toczyło się** | ponad 10 m bez żadnego pedału i 5 m więcej niż drugie |
| 10 | **wolniej przez środek** | ponad 0,5 m/s wolniej w najwolniejszym punkcie; rozdzielone przez `v² = a·R` (niżej) |
| 11 | **wjechało wolniej** | ponad 1 m/s wolniej w punkcie hamowania, bez wczesnego hamowania: rozstrzygnięte wcześniej – przez poprzedni zakręt i ciąg samochodu, albo przez lot w poprzednim zakręcie o 0,2 s dłuższy. Samochodu, gdy samochody się różnią |
| 12 | wolniej do wierzchołka | w pozostałych przypadkach: puszczać hamulec łagodniej i wtoczyć więcej prędkości w środek |

**Wolniej przez środek** (`middleSplit`): promień każdego okrążenia w najwolniejszym punkcie mierzy się z jego własnej ścieżki (±8 m), jego boczne przyspieszenie to `v²/R`, i

`ln(v_drugiego / v_mojej) = ½ ln(a_drugiego / a_mojego) + ½ ln(R_drugiego / R_mojego)`.

- Promień tłumaczy **połowę lub więcej**: **za ciasna linia** – „wykorzystaj więcej drogi”, z obydwoma promieniami i udziałem.
- Na granicy samochodu (ślizg powyżej 10° driftu na asfalcie / 20° na luźnej nawierzchni, albo boczne przyspieszenie co najmniej 90% tego, co trzyma przy tej prędkości), a drugi samochód trzyma o ponad 5% więcej: **przyczepność samochodu**; zamiast tego chroń wyjście.
- Ślizg przez zakręt (dryf powyżej 10° / 20°), a drugie okrążenie nie (jego dryf przy wejściu co najmniej 4° mniejszy): **bokiem** – poza przyczepnością, a nie poniżej niej; wjedź trochę wolniej. Mówione jako samochodowe, gdy ten samochód łapie tył co najmniej raz na okrążenie częściej niż drugi.
- W innym samochodzie, który trzyma poniżej **96%** przyczepności drugiego, a okrążenie utrzymało się w granicach 1 m/s od `v_drugiego · √(przyczepność_moja / przyczepność_drugiego)`: **przyczepność samochodu** – „późniejsze hamowanie tego nie zamknie”.
- W pozostałych przypadkach **zapas przyczepności**: boczne przyspieszenie względem drugiego na podobnym promieniu i to, co ten samochód trzyma; wnieś więcej prędkości do wierzchołka. Tam, gdzie tylny koniec tego samochodu puszcza, zanim wykorzysta swoją przyczepność (jego ślizgi zaczynają się poniżej 85% przyczepności, a okrążenie było na 80% tego), resztę znajdź małymi krokami.

### Przyczyny na wyjściu {#causes-on-the-way-out}

`exitCause`, pierwsza, która pasuje:

| # | Przyczyna (błąd) | Reguła |
|---|---|---|
| 1 | usterka kontroli samochodu na wyjściu | niepodzielony poślizg kół napędowych, obrót, ślizg albo uderzenie, kończące się najpóźniej 10 m przed najwolniejszym punktem |
| 2 | **wytracona prędkość** | ponad 1 m/s więcej prędkości straconej na pełnym gazie niż u drugiego; ponad **7 m/s (25 km/h)** – „bardziej kontakt albo obrót niż poślizg” |
| 3 | **źle skręcony samochód** (luźna nawierzchnia) | zobacz [rajd](#rally-rotation-and-flights) |
| 4 | **gaz później** | włączenie gazu ponad 5 m później, liczone też od własnego najwolniejszego punktu okrążenia (okrążenie, którego najwolniejszy punkt jest później, nie jest winne późniejszego gazu) |
| 5 | **wahanie na gazie** | więcej spadków gazu niż u drugiego |
| 6 | **jechało za szeroko i czekało** | ponad 1,5 m na zewnątrz drugiego, gdy oba były płasko, i pełny gaz ponad 5 m później od własnego najwolniejszego punktu |
| 7 | **pełny gaz później** | pełny gaz ponad 5 m później, także od własnego najwolniejszego punktu; z przyspieszeniem samochodu w tym miejscu |
| 8 | **napęd samochodu** | w innym samochodzie, który ciągnie poniżej 95% drugiego przy tej prędkości, a ciąg tłumaczył część prostej |
| 9 | **wolniej z zakrętu** | w pozostałych przypadkach: późniejszy wierzchołek, więc samochód wcześniej jest prosto |

Gdy oba okrążenia były na różnych biegach w najwolniejszym punkcie, wskazówka kończy się zdaniem: „Bieg N w wierzchołku; drugie użyło M.”

### Usterki kontroli samochodu i uderzenia {#car-control-faults-and-impacts}

Usterka z [zdarzeń kontroli samochodu](race-control-events.md) jako przyczyna: blokada to przyczyna *hamowania*, poślizg kół albo ślizg na gazie przyczyna *wyjścia*, reszta *wejścia*; uderzenie po najwolniejszym punkcie to *wyjście*, przed nim *wejście*. Wskazówka to własna wskazówka zdarzenia, potem „Kosztowało około X s do 40 m za nim” (albo „do chwili, gdy samochód odzyskał prędkość” dla uderzenia). Blokada, przy której punkt hamowania jest ponad 5 m wcześniej niż u drugiego, dodaje, że okrążenie też hamowało za wcześnie – gdyby koła się obracały, nie musiałoby hamować tak wcześnie.

### Rajd: obrót i loty {#rally-rotation-and-flights}

Na **luźnej nawierzchni**, z kątami dryfu na obu okrążeniach, a to okrążenie na mocy (albo płasko) ponad 5 m później:

- **Obrócił samochód mniej**: drugie miało samochód obrócony o **12°** lub więcej do najwolniejszego punktu i co najmniej o **8°** więcej niż to okrążenie. Wskazówka: zdjęcie gazu albo muśnięcie lewą nogą hamulca, gdy wchodzi w zakręt, z punktem użycia ręcznego drugiego okrążenia, gdy użyło go tylko ono, albo ręczny w zakręcie wolniejszym niż 15 m/s (54 km/h).
- **Obrócił za bardzo**: to okrążenie miało go obróconego o 12° lub więcej i co najmniej o **12°** więcej niż drugie: trzeba go było wyprostować, zanim moc mogła pójść na koła.

**Dłuższy lot**: w powietrzu o 0,2 s lub więcej dłużej niż drugie, kosztujący co najmniej 0,03 s od 10 m przed wybiciem do 40 m po lądowaniu (albo końca odcinka). Przed najwolniejszym punktem to przyczyna wejścia; staje się historią zakrętu, gdy tłumaczy 40% lub więcej. Wskazówka: przy wybiciu trzymaj gaz, a nad garbem jedź trochę wolniej albo z muśnięciem hamulca.

### Start {#the-start}

Przed pierwszym zakrętem, na sprincie albo gdy któreś z okrążeń zaczęło z postoju (poniżej 5 m/s, gdy oba są najpierw na osi) albo ze startu wyścigu (poniżej 60% prędkości drugiego), przejazd do pierwszego punktu hamowania jest własnym znaleziskiem (zakręt 0), gdy różni się o więcej niż 0,03 s: *Ruszenie*, *Start wyścigu* albo *Do pierwszego zakrętu*. Strata tam przypisywana jest sytuacji (*okoliczności*), gdy jedno okrążenie zaczęło od startu wyścigu, a drugie w prędkości; samochodowi, gdy okrążenia są w różnych samochodach; a kierowcy w pozostałych przypadkach. Wskazówki: w innym samochodzie z postoju „przeważnie samochód”; start z postoju w tym samym samochodzie – ruszaj z mniejszym poślizgiem kół i zmieniaj biegi na górze zakresu mocy; start wyścigu – porównaj go z pierwszym okrążeniem drugiego; start w ruchu – lepsze wyjście z ostatniego zakrętu przenosi się przez linię.

## Linia jazdy {#the-driven-line}

`lineMetrics`, dla każdego okrążenia i odcinka (nie dla mieszanych kompleksów), wyłącznie z pozycji (wygładzone ±2 próbki) na oknie zakrętu:

| Miara | Reguła |
|---|---|
| krzywizna | zmiana kursu na ±8 m ścieżki samego okrążenia |
| **najciaśniejszy promień** | 1 / szczytowa krzywizna |
| **wejście w skręt** / **wyjście ze skrętu** | gdzie krzywizna po raz pierwszy / ostatni raz przekracza jedną piątą swojego szczytu |
| **środek** | gdzie okrążenie skręciło o połowę swojej zmiany kursu |
| promień wejścia / wyjścia | metry przejechane powyżej połowy zmiany kursu, przed / po środku |
| **kształt** | najciaśniejszy promień przez średni promień podczas skrętu: poniżej **0,55** – **V**, powyżej **0,75** – **U**, pomiędzy – „U/V” |
| **wierzchołek** | promień wyjścia przez promień wejścia: powyżej **1,25** – późny, poniżej **0,8** – wczesny, inaczej środkowy |
| **wierzchołek prędkości** | najwolniejszy punkt ponad **15 m** przed środkiem: wolno wchodzi, szybko wychodzi; ponad 15 m po: nadal hamuje za środkiem |

Względem drugiego okrążenia: jak daleko wewnątrz (+) albo na zewnątrz szło przy wejściu w skręt, przez najciaśniejszą część i tam, gdzie oba były płasko (mówione od 1 m); gdzie każde weszło w skręt (mówione od 8 m).

### Która linia pasuje do tego samochodu tutaj {#which-line-suits-this-car-here}

`lineFor`, z tego, dokąd prowadzi zakręt i z charakteru samochodu w tym zakręcie:

- **moc-do-przyczepności** = przyspieszenie samochodu na pełnym gazie przy prędkości wyjścia podzielone przez jego przyczepność przy minimalnej prędkości (z obwiedni). **Wrzuć i jedź** od **0,45** wzwyż; **pęd** od **0,25** w dół.
- **docisk**: przyczepność przy 151–252 km/h podzielona przez przyczepność przy 54–108 km/h wynosi **1,15** lub więcej, dla zakrętu przejechanego z **144 km/h** (40 m/s) lub szybciej – wtedy to zakręt pędowy, cokolwiek z mocą. Nie ocenia się tego na luźnej nawierzchni.

| Typ zakrętu | Samochód | Linia |
|---|---|---|
| po prostej | wrzuć i jedź / inny | V / U, wierzchołek w środku: „strefa hamowania to nagroda” |
| między dwiema prostymi | pęd / inny | U / V, późny wierzchołek |
| łącznik | pęd / inny | U / V, wierzchołek w środku: „jedź go pod wyjście następnego” |
| na prostą | pęd (albo szybki zakręt z docisku) | szerokie, okrągłe U, lekko późny wierzchołek |
| na prostą | wrzuć i jedź | V: hamuj prosto, wchodź późno, obróć w krótkim, ciasnym środku, wcześnie na prostą |
| na prostą | pomiędzy | U z późnym wierzchołkiem: wolno wchodź, szybko wychodź |

Tam, gdzie wyjście ma znaczenie (na prostą, między dwiema), napęd dodaje zdanie: **FWD** (napęd na przód) – obracaj na hamulcach, dokładaj moc dopiero, gdy koło się rozkręca; **RWD** z mocą-do-przyczepności 0,35 lub więcej – wyprostuj przed pełnym gazem; **AWD** – może brać moc, nadal skręcając. Na luźnej nawierzchni każda linia dodaje: obróć samochód już na wejściu.

Zdanie mówi wtedy, co okrążenie przejechało i czy to pasuje: *najwolniejszy późno wiąże wyjście* albo *wczesny wierzchołek wiąże wyjście*, gdy chciano późnego wierzchołka, a okrążenie nie miało późnego wierzchołka ani nie było wcześnie najwolniejsze; *bardziej okrągłe, niż ten samochód chce*, gdy chciano V; *bardziej kanciaste, niż ten samochód chce*, gdy chciano U; w pozostałych przypadkach *to pasuje*.

## Dla deweloperów {#for-developers}

Kod: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Uzasadnienie i źródła: [metoda](race-analytics.md).
