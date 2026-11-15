---
title: "Analityka wyścigów: metoda"
parent: "Analiza wyścigowa"
nav_order: 58
lang: "pl"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analityka wyścigów: metoda

W skrócie:

- Okrążenia porównuje się **po dystansie**, nie po czasie, więc to samo miejsce na torze się zgadza.
- Każdy zakręt ocenia się **w całości**, od jednej strefy hamowania do następnej.
- Stracony czas jest **rozdzielany** na to, gdzie go stracono (hamowanie, wejście, wyjście, prosta) i ile z niego tłumaczy samochód.
- Przyczynę **wyjaśnia się słowami**, z poradą.
- Żeby z tego korzystać, a nie tylko czytać, jak to działa: zobacz [Analiza wyścigowa](race-analysis.md).

To jest metoda stojąca za zakładką **Analiza wyścigowa**: co mierzy, jak ustala, gdzie uciekł czas, i jak zamienia to na poradę. Jest to specyfikacja, której trzyma się kod analizy (`src/race/`), więc każda reguła tutaj ma swój odpowiednik tam i test, który ją przypina.

## Co robią profesjonalne narzędzia {#what-the-professional-tools-do}

Ustalone narzędzia zbiegają się w tym samym rdzeniu i różnią się głównie tym, jak daleko idą w stronę *przyczyn*:

- **Wszystko porównuje się po dystansie, nie po czasie.** Dwa okrążenia przelicza się na jedną oś dystansu; bieżąca różnica czasu w tym samym dystansie to *delta* (MoTeC nazywa to time variance, inni time slip albo delta trace). Jej nachylenie mówi, gdzie czas jest tracony w tej chwili: płytkie nachylenie to przyspieszenie, opór albo stała przyczepność; strome – różnica w hamowaniu albo gazie; falująca w górę i w dół – wymiana między prędkością wejścia a wyjścia.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Każdy zakręt dzieli się na fazy**: hamowanie, wejście, środek, wyjście – punkt hamowania, szczytowe hamowanie i puszczenie, najmniejsza prędkość i gdzie się ona pojawia, bieg, podniesienie gazu, powrót do pełnego gazu, prędkość na wyjściu.
  ([Driver61: sześć faz](https://driver61.com/uni/corner-phases/),
  [przewodnik iRacing po analizie okrążeń](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-sektory na zakręt i teoretyczny najlepszy czas** złożony z najszybszych z każdego. ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Przejechaną linię też się porównuje**, ale nigdy samą: „linia na obrazku nic nie znaczy, dopóki nie znasz czynników, które na nią wpływają” – czyta się ją razem z wykresem prędkości i deltą.
  ([Track Titan: jak analizować telemetrię](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: linie wyścigowe](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Przyczyna, nie objaw.** Czy strata na prostej to naprawdę gaz, czy zły wjazd zmusił do późnego gazu? Błędy układa się według kosztu w czasie okrążenia i wyjaśnia prostym językiem.
  ([Track Titan: procesy coachingu](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Co poszło źle w pierwszej wersji i dlaczego to ważne {#what-went-wrong-in-the-first-version-and-why-it-matters}

Pierwsza wersja liczyła każdą *fazę* osobno i patrzyła tylko na straty. Okrążenie, które hamowało wcześniej, traciło czas w fazie hamowania i dostawało radę, żeby hamować później – nawet wtedy, gdy to wcześniejsze hamowanie pozwalało wcześniej ustawić samochód, wcześniej wejść na gaz i szybciej wyjechać z zakrętu, i odrabiało wszystko na prostej. W jednym teście powiedziała okrążeniu, które tak zrobiło, żeby „hamowało dużo później”, podczas gdy drugie okrążenie – które hamowało później – minęło wierzchołek, wyszło szeroko i straciło dokładnie to, co zyskało. Dane czasowe mówiły, że obie drogi są równe; rada mówiła co innego.

Poprawką jest reguła, z którą zgadzają się wszystkie źródła powyżej: **zakręt ocenia się w całości**, od strefy hamowania przed nim do strefy hamowania przed następnym, bo „czasem oddanie kilku tysięcznych sekundy w zakręcie może poprawić czas całego okrążenia, bo pozwala na szybsze odcinki potem”
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Wiedza o jeździe, którą zakodowano w regułach {#racing-knowledge-the-rules-encode}

**Prędkość na wyjściu liczy się bardziej niż prędkość na wejściu** – a im dłuższa następna prosta, tym bardziej: „czas spędzony na prostych dominuje nad czasem spędzonym w zakrętach”, a strata prędkości na wyjściu jest przenoszona do następnego punktu hamowania. Najszybszy sposób przejazdu przez zakręt i prostą to często wolniej wejść w zakręt, żeby wcześniej wejść na gaz – *wolno wejść, szybko wyjść*.
([Race & Track Driving: kolejność poprawy czasu okrążenia](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: priorytety zakrętów](https://driver61.com/uni/prioritising-corners/))
Planer czasu minimalnego, który nagradza też prędkość na wyjściu, przesuwa wierzchołki później i dostaje *szybsze* okrążenie; nagroda, która te dwie rzeczy równoważy, jest warta `L / v²` na jednostkę prędkości na wyjściu dla prostej o długości `L` przy prędkości `v` – czas, jaki kosztuje różnica prędkości na prostej, rośnie z jej długością i maleje z kwadratem prędkości
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Zakręty według tego, dokąd prowadzą.** Zakręt prowadzący na prostą: maksymalizować prędkość na wyjściu, późny wierzchołek, jak najszybciej z powrotem na gaz. Zakręt na końcu prostej: maksymalizować prędkość wniesioną w niego, hamować jak najpóźniej; wcześniejszy wierzchołek jest dopuszczalny. Zakręt między zakrętami: kompromis na korzyść tego, który liczy się po nim. Zakręt, który może być jednym i drugim, traktuje się jak prowadzący na prostą. Szybsze zakręty ważą więcej: przy prędkości samochód słabo przyspiesza i straconego km/h nie odrobi się.
([Allen Berg: trzy typy zakrętów](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: priorytety zakrętów](https://driver61.com/uni/prioritising-corners/),
[Driver61: różne zakręty, różne techniki](https://driver61.com/uni/different-corner-technique/))

**Krąg tarcia.** Opona ma jeden budżet przyczepności, wydawany na hamowanie, pokonywanie zakrętu i przyspieszanie w dowolnej mieszance; całkowite przyspieszenie to `sqrt(lat² + long²)`. Hamowanie w zakręcie (trail braking) idzie brzegiem tego kręgu: hamulec puszcza się, gdy rośnie skręt i obciążenie boczne.
([krąg tarcia](https://www.yourdatadriven.com/friction-circle-introduction/),
[diagram g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Toczenie się** – żaden pedał niewciśnięty – to najwolniejszy sposób tracenia prędkości i samodzielny mierzony wskaźnik efektywności.
([Racecar Engineering / OptimumG: współczynnik toczenia](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Poślizg.** Siła wzdłużna osiąga szczyt przy współczynniku poślizgu około 10–20%, potem maleje; powyżej tego koło blokuje się przy hamowaniu albo buksuje pod mocą. Forza podaje poślizg znormalizowany: 0 to pełna przyczepność, wartość powyżej 1 oznacza utratę przyczepności.
([poślizg wzdłużny](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Podsterowność i nadsterowność.** Kąt znoszenia przodu większy niż tyłu to podsterowność; tyłu większy niż przodu – nadsterowność. Bez kątów znoszenia: samochód skręca mniej, niż wymaga kierownica (skręt powyżej kąta Ackermanna `L/R`, którego samochód potrzebuje przy małej prędkości).
([podsterowność, przegląd](https://www.sciencedirect.com/topics/engineering/understeer),
[Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Geometria linii {#the-geometry-of-a-line}

Prędkość, jaką samochód może utrzymać na promieniu `R`, to `v = sqrt(a R)`, gdzie `a` to przyspieszenie boczne, jakie dają opony (plus to, co dodaje docisk, rosnący z `v²`). Więc **prędkość rośnie z pierwiastkiem promienia**: linia przez środek na promieniu o 20% większym jest tam mniej więcej o 10% szybsza.
([maksymalna prędkość w zakręcie](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: pokonywanie zakrętów](https://www.formula1-dictionary.net/cornering_tech.html))

**Linia geometryczna** to największy łuk przez zakręt: od zewnętrznej krawędzi, dotykając wewnętrznej w wierzchołku, z powrotem na zewnątrz. Dla zakrętu skręcającego o `θ` na drodze szerokiej `w` (minus szerokość samochodu) łuk styczny do obu zewnętrznych krawędzi i dotykający wewnętrznego narożnika ma `R = w / (1 - cos(θ/2))` (plus promień własny wewnętrznej krawędzi) – dla kąta prostego około `3,4 w`, dla zakrętu ostrego `w`. Dlatego wykorzystanie szerokości ma największe znaczenie w średnich zakrętach, a najmniejsze w zakrętach ostrych.
([Linia wyścigowa](https://en.wikipedia.org/wiki/Racing_line))

**Późny wierzchołek** wchodzi w skręt później i głębiej, na początku na ciaśniejszym promieniu, a na wyjściu go otwiera: wolniej przez środek, wcześniej na prostą, wcześniej płasko – „nieco niższa minimalna prędkość, ale mocniejszy profil przyspieszenia na wyjściu”. **Wczesny wierzchołek** jest odwrotnością: szybciej na wejściu, a promień zaciska się na wyjściu i trzyma gaz w ryzach – w większości błąd, poza bardzo małą przyczepnością, gdzie prędkości straconej na wejściu nie da się odrobić na wyjściu.
([Linia wyścigowa](https://en.wikipedia.org/wiki/Racing_line),
[Słownik telemetrii wyścigowej](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[matematyka linii wyścigowej](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**„V” i „U”.** U to klasyczna okrągła linia: najszerszy promień, najmniejsza zmiana kierownicy. V wchodzi wcześniej, idzie głębiej, szybko obraca samochód w środku i ustawia wyjście, żeby przejazd był prostszy: hamowanie zostaje proste (więc może być późniejsze), minimalna prędkość jest niższa, ale osiągana później, a pełny gaz pojawia się znacznie wcześniej.
([Track Titan: linia V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Krzywizna względem dystansu.** Najszybsza linia to kompromis między najkrótszą drogą a najmniej zakrzywioną; na szerokości toru krzywizna waży więcej, a linia o najmniejszej krzywiźnie zbliża się do linii czasu minimalnego wszędzie tam, gdzie samochód jest na granicy – odchodzi od niej tam, gdzie samochód mógłby przyspieszać.
([Globalne planowanie trajektorii czasu minimalnego](https://www.nature.com/articles/s41598-025-21211-2),
[TUM: globalna optymalizacja trajektorii wyścigowej](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Zakręty jeden za drugim** – podwójny wierzchołek, szykana – to jeden problem: linia wyjścia z jednego jest linią wejścia w następny, a jedzie się je wstecz od tego, który prowadzi na prostą.
([Driver61: różne zakręty, różne techniki](https://driver61.com/uni/different-corner-technique/))

## Która linia pasuje do którego samochodu {#which-line-suits-which-car}

Decyduje o tym **moc względem przyczepności** samochodu przy prędkościach tego zakrętu – „pęd to przyczepność kontra moc, sprawa stosunku”.
([Ross Bentley: samochody pędowe](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[pęd ponad moc](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Samochód w tym zakręcie | Linia | Dlaczego |
|---|---|---|
| Mocno przyspiesza jak na swoją przyczepność („wrzuć i jedź”) | V: hamować prosto i późno, obrócić w krótkim, ciasnym środku, wcześnie prosto i płasko | czas wygrywa się pełnym gazem, a nie minimalną prędkością |
| Słabo przyspiesza jak na swoją przyczepność („pęd”) | szerokie U, lekko późny wierzchołek, utrzymać wysoką minimalną prędkość | nie odrobi prędkości, którą wytraca |
| Pośrodku | wolno wejść, szybko wyjść: U z późnym wierzchołkiem | klasyczny kompromis |
| Szybki zakręt, a tym bardziej z dociskiem | U, blisko linii geometrycznej | przyspieszenie przy prędkości jest słabe; przyczepność z docisku rośnie z `v²`, więc prędkość przez środek opłaca się podwójnie |
| Bardzo mała przyczepność (mokro, śnieg) | wcześniejszy wierzchołek | prędkości straconej na wejściu nie da się odrobić |
| Moc daleko ponad przyczepność | linia ma mniejsze znaczenie | o wyjściu decyduje trakcja, a nie linia |

„Im szybszy zakręt, tym bliżej linii geometrycznej; im wolniejszy, tym bardziej się ją zmienia późniejszym wierzchołkiem.”
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[matematyka linii wyścigowej](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: linia V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: przyczepność](https://driver61.com/uni/grip/))

Układ napędowy zmienia sposób przejazdu linii bardziej niż samą linię: samochód z napędem na przód obraca się na hamulcach (trail braking) i dostaje moc dopiero, gdy koło się rozkręca, inaczej szerzej wyjeżdża; mocny samochód z napędem na tył musi być prosto przed pełnym gazem, inaczej tył się wysuwa; napęd na cztery koła może brać moc, wciąż skręcając, więc gaz podnosi wcześniej.
([technika FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD vs RWD w zakrętach](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Aplikacja mierzy stosunek mocy do przyczepności samochodu przy każdym zakręcie z jego własnej jazdy – przyspieszenie na pełnym gazie przy prędkości wyjścia podzielone przez przyczepność boczną przy minimalnej prędkości – i nazywa to „wrzuć i jedź” od 0,45 wzwyż, „pęd” od 0,25 w dół. Samochód, którego przyczepność przy 150–250 km/h jest o ponad 15% wyższa niż przy 55–110 km/h, ma działający docisk.

## Metoda {#the-method}

Poniższe liczby to uzasadnienie. Progi, których używa kod, są opisane osobno na każdej stronie, a te strony są wzorcem, gdy liczba tutaj się różni: [Analiza zakręt po zakręcie](race-corner-analysis.md), [Zdarzenia kontroli samochodu](race-control-events.md), [Profile samochodów i porównanie](race-car-profiles.md) oraz [Statystyki toru](race-course-statistics.md).

### 1. Jedna oś dystansu {#one-distance-axis}

Najszybsze okrążenie jest referencją, chyba że użytkownik wybierze inne. Jego przejechana ścieżka jest osią: próbki każdego innego okrążenia rzutuje się na nią, nadając każdej próbce odległość wzdłuż referencji `s` i znak przesunięcia bocznego `d`. Rzutowanie szuka tylko do przodu od poprzedniego dopasowania, więc okrążenie, które przecina się samo ze sobą, nigdy nie przeskoczy na złą stronę mostu. Okrążenia są potem przeliczane na jedną siatkę, co 2 m, dla każdego kanału. Każde okrążenie jest przeciągane o kilka ostatnich metrów z prędkością, jaką miało, więc jego delta na linii mety to różnica czasów okrążeń.

### 2. Zakręty i udział każdego zakrętu w okrążeniu {#corners-and-each-corners-share-of-the-lap}

Jak znajduje się zakręty, odcinki i kompleksy: [Analiza zakręt po zakręcie](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Bilans czasu zakrętu {#the-time-account-of-a-corner}

Netto, podział, prędkość na wyjściu i ciąg samochodów: [Analiza zakręt po zakręcie](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Werdykt i przyczyna {#the-verdict-and-the-cause}

Wzorce werdyktów i przyczyny na wejściu i na wyjściu: [Analiza zakręt po zakręcie](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Samochód kontra kierowca {#the-car-against-the-driver}

Gdy okrążenia są w różnych samochodach, ze straty wyjmuje się część, którą tłumaczy samochód, według części:

- **ciąg**: samochody od tej samej prędkości na prostej, jak wyżej;
- **przyczepność**: z niższej minimalnej prędkości nie wyjaśnionej ciaśniejszym promieniem udział `½ ln(przyczepność_drugiego / przyczepność_mojego) / ln(v_drugiego / v_mojej)`, gdy okrążenie było na granicy swojego samochodu (90% tego, co samochód pokazał przy tej prędkości);
- **hamulce**: od `u` do `v` przy opóźnieniu `a1` wobec `a2`, kończąc w tym samym punkcie, kosztuje `(1/a1 - 1/a2)(u - v)² / 2u` – tylko wtedy, gdy okrążenie hamowało średnio prawie tak mocno, jak samochód potrafi w strefie, a nie tylko w szczycie.

To, co samochód potrafi, pochodzi ze wszystkich wczytanych okrążeń tego samochodu: przyczepność boczna, hamowanie i przyspieszenie na pełnym gazie dla każdego przedziału prędkości co 5 m/s (95., 95. i 90. percentyl). Przyczepność to to, co samochód **utrzymał przez pół sekundy** – przyspieszenie boczne uśrednione przez 0,5 s – a nie to, czego dotknęła pojedyncza próbka: krawężnik, odbicie poślizgu, łapanie samochodu podbijają ją na chwilę, a samochód, który tak często robi, wygląda na bardziej przyczepny, niż jest. (Sprawdzono na zapisach okrążeń dwóch różnych samochodów: miara dla pojedynczej próbki stawiała je blisko siebie; utrzymana przez pół sekundy rozdziela je tak, jak rozdzielają ich czasy okrążeń.) Hamowanie i ciąg biorą każdą próbkę jako medianę z niej samej i jej sąsiadów. Powietrze, uspokajanie się po lądowaniu i każde uderzenie (sekcja 6), dopóki samochód nie odzyska równowagi, są pomijane.

**Jakim samochodem jest każdy** (`profile.ts`): z tych samych okrążeń,

- **utrzymana przyczepność**: 95. percentyl tego bocznego przyspieszenia uśrednionego przez pół sekundy;
- **ciąg** na pełnym gazie do 50 km/h, 50–120, 120–200 i powyżej 200, oraz największy, jaki pokazał;
- **hamowanie** od 60 do 160 km/h;
- **prędkość maksymalna**: tam, gdzie przestał zyskiwać na pełnym gazie przez sekundę na prostej – jechanej prosto, a nie długim zakrętem wziętym płasko, gdzie samochód wytraca prędkość przy każdej mocy. Gdy żadna prosta nie była dość długa, to, z jakim ciągiem wciąż przyspieszał przy najwyższej prędkości, mówi, jak daleko był od niej. Bez zgadywania poza to, co pokazują okrążenia: dopasowanie mocy w funkcji prędkości do oporu postawiło zwykły samochód 100 km/h powyżej jego prawdziwej prędkości maksymalnej, bo przełożenia i ogranicznik kończą ciąg samochodu dużo wcześniej niż opór;
- **utrata tyłu**: ile razy na okrążenie ślizgnął się ponad 10° driftu (20° na luźnej nawierzchni), z kołem skręconym przeciwnie do zakrętu – złapany kontrą – ile z tych ślizgów zaczęło się na gazie i przy jakim udziale przyczepności się zaczęły. Samochód prowadzony trochę bokiem celowo niczego nie traci; taki, który trzeba łapać, traci. Liczone tak samo dla każdego samochodu, więc dwa samochody można porównać;
- **równowaga**, gdzie okrążenia niosą kąty znoszenia: przód względem tyłu na granicy.

**Porównanie samochodów** ustawia samochody obok siebie – tabelę i po jednym zdaniu o tym, czym samochód jest w porównaniu z drugim („X przyspiesza lepiej, ale nie skręca tak mocno, potrzebuje dłużej na zatrzymanie i łatwiej traci tył”), każdą wyraźną różnicę (4% przyczepności, 5% ciągu albo hamowania, 4 km/h prędkości maksymalnej, tył łapany co najmniej raz na okrążenie częściej i o połowę więcej), i jak jeździć każdym. Przy jednym samochodzie mówi, czym ten samochód jest.

**W każdym zakręcie**, gdy okrążenia są w różnych samochodach, znalezisko mówi, co z tego decydują samochody i jak wycisnąć z tego jak najwięcej:

- **przez środek**: na linii drugiego samochodu przyczepność tego pozwala na `v_drugiego · √(przyczepność_moja / przyczepność_drugiego)`. Jeśli okrążenie tyle utrzymało, różnica to samochód i żadne punkty hamowania jej nie zmienią – tak się mówi i zakręt przypisuje się samochodowi, a nie kierowcy; jeśli utrzymało mniej, reszta jest do wzięcia i mówi się, ile. Potem, gdzie czas można zyskać zamiast tego: na prostą albo w samochodzie, który ciągnie mocniej, za wierzchołkiem – hamować prosto, wchodzić później, wcześnie ustawić na wyjście; w pozostałych przypadkach najszerszy promień, na jaki pozwala droga, bo większy promień to jedyny sposób na więcej prędkości bez więcej przyczepności;
- **tył, który puścił** tutaj, w samochodzie, który traci go łatwiej niż drugi: co robić w tym samochodzie – gaz dodawany w miarę rozkręcania koła albo hamulec puszczany łagodnie bez zdejmowania gazu w połowie zakrętu, zależnie od tego, jak zaczynają się jego ślizgi;
- **prosta za nim**: co zabrał mocniejszy ciąg drugiego samochodu od tej samej prędkości i gdzie ten samochód zabrakło ciągu na prostej;
- **wcześniejszy punkt hamowania** w samochodzie, który hamuje mniej mocno.

Okrążenie, które poślizgnęło się przez środek zakrętu (ponad 10° driftu na asfalcie), było poza przyczepnością, a nie przed nią: nigdy nie dostaje informacji, że miało tam przyczepność w zapasie. A gdy tył samochodu puścił na tym okrążeniu przy mniejszym bocznym przyspieszeniu, niż zakręt wymagał, „zapas przyczepności” mówi, żeby go szukać małymi krokami.

### 6. Sterowanie samochodem: blokady, buksowanie, ślizgi i pchanie, uderzenia i wypadki {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Każde okrążenie czyta się też pod kątem tego, jak samochód był prowadzony – gdzie koło się zablokowało, gdzie napędzane koła buksowały, gdzie tył się wysunął, gdzie przód szeroko wyjechał – bo to błędy, których sam czas nie nazwie. Trzy rzeczy sprawiają, że to działa w różnych grach i na różnych nawierzchniach.

**Miejsce, w którym kończy się przyczepność, mierzy się z własnej jazdy samochodu.** Inżynierowie ustawiają próg blokady dla każdego samochodu przy poślizgu, który dawał najwięcej opóźnienia (kanały MoTeC w serii o hamowaniu OptimumG używają -0,07 dla jednego samochodu), a nie przy wartości z książki, a wartości z książek i tak się rozjeżdżają: siła osiąga szczyt przy poślizgu 5–20% na asfalcie zależnie od opony i modelu, przy 6% albo 20–60% na śniegu zależnie od źródła, a żadne źródło nie podaje jej dla żwiru. Gry skalują poślizg jeszcze inaczej: poślizg Forzy jest „znormalizowany”, tak że powyżej 1 przyczepność jest utracona – a jednak hamulce samochodu mogą dawać najwięcej dużo poniżej albo dużo powyżej 1, a zwykłe strefy hamowania potrafią przekroczyć 1. Więc dla każdego samochodu, na wszystkich wczytanych jego okrążeniach, siłę, jaką wytworzył, grupuje się względem poślizgu, przy którym jechał – opóźnienie względem poślizgu kół przy hamowaniu po prostej, przyspieszenie (jako udział tego, co samochód daje przy tej prędkości) względem poślizgu napędzanych kół, przyczepność w zakręcie (jako udział przyczepności samochodu przy tej prędkości) względem kąta znoszenia każdej osi – a granicą jest poślizg za najlepszym punktem, gdzie siła spadła o 8%. Krzywa, która w danych nigdy nie opada – przyczepność w zakrętach i trakcja w Forza Horizon – nie ma granicy, a sam poślizg niczego tam nie oznacza. Przy zbyt małej liczbie danych granica to półtora raza nominalny szczyt.

**Nawierzchnię zna się próbka po próbce**, gdy gra ją podaje: Forza wstrząsa oponami na żwirze, błocie i trawie (mało próbek na asfaltowym torze, wiele na szutrze i trasach terenowych), Trackmania podaje materiał pod każdym kołem, a nawierzchnię odcinka rajdowego znajduje się tak, jak mówi sekcja 11. Krzywe, nawyki dryfu i progi trzyma się osobno dla asfaltu i dla luźnej nawierzchni.

**Każde zdarzenie kładzie się na drugim okrążeniu na tych samych metrach.** Na żwirze, na śniegu, w zręcznościówce pełnej dryfu ślizgiem jedzie się zakręt: badania optymalnego sterowania znajdują rozwiązania „o małym dryfie” na asfalcie i „agresywne, o dużym dryfie, nawet z kontrą” poza drogą, dane rajdowe pokazują opony „daleko w obszarze nieliniowym”, a blokowanie koła na bardzo luźnym podłożu potrafi nawet zatrzymać samochód szybciej. Więc zdarzenie, które zrobiło też drugie okrążenie – 80% tego lub więcej – to sposób jazdy w zakręcie, a nie błąd, a takie, którego ono nie zrobiło, jest usterką tylko wtedy, gdy kosztowało czas: stracony czas od tuż przed nim do 40 m po nim. Usterka, która tłumaczy 40% lub więcej straty zakrętu, staje się przyczyną tego zakrętu.

Progi wykrywania, test drugiego okrążenia, uderzenia i wypadki oraz teksty porad: [Zdarzenia kontroli samochodu](race-control-events.md).

### 6b. Wiele okrążeń: statystyki toru {#b-many-laps-the-courses-statistics}

Porównanie klas, co liczy się jako błąd, statystyki i mapa błędów: [Statystyki toru](race-course-statistics.md).

### 7. Przejechana linia {#the-driven-line}

Dla każdego okrążenia i zakrętu, wyłącznie z pozycji: gdzie zaczęło skręcać (jedna piąta jego najciaśniejszej krzywizny), jego najciaśniejszy promień (na ±8 m), średni promień w pierwszej i drugiej połowie zmiany kursu, i tak dalej:

- **kształt**: najciaśniejszy promień przez średni poniżej 0,55 to V, powyżej 0,75 to U;
- **wierzchołek**: promień wyjścia przez promień wejścia powyżej 1,25 to późny, poniżej 0,8 wczesny;
- **wierzchołek prędkości**: jego najwolniejszy punkt ponad 15 m przed połową skrętu to wolno wejść, szybko wyjść; ponad 15 m po – nadal zwalnia za środkiem.

Względem drugiego okrążenia: jak daleko wewnątrz albo na zewnątrz szło przy wejściu w skręt, przez najciaśniejszą część i tam, gdzie oba były płasko, i gdzie każde weszło w skręt. Każde znalezisko kończy się linią, która pasuje do samochodu okrążenia w tym zakręcie – z tego, dokąd prowadzi zakręt, i z zmierzonego stosunku mocy do przyczepności, docisku i układu napędowego – oraz tym, czy okrążenie tak ją przejechało. Tabela „Zakręt po zakręcie” wymienia najszybsze okrążenie przez każdy zakręt z kształtem jego linii, a najlepsze zakręty składa się razem.

### 8. Dwie mapy {#two-maps}

- **Gdzie**: tor pokolorowany według `dΔt/ds` względem referencji, na czerwono tam, gdzie czas się traci, na zielono tam, gdzie się zyskuje.
- **Dlaczego**: każda strata narysowana tam, gdzie jest jej przyczyna, pokolorowana według grupy przyczyny – hamowanie, wejście, wyjście, prosta, samochód – i szersza dla droższej.

### 9. Odtwarzanie {#replay}

Jeden zegar, trzy sposoby zamiany go na czas każdego okrążenia: od linii, wyrównane (każde okrążenie dociera do jednego punktu toru w tym samym momencie, a potem jest puszczane) i obok siebie (każde okrążenie trzymane na dystansie referencji).

### 10. W którą stronę jest świat {#which-way-round-the-world-is}

Świat aplikacji jest prawoskrętny z osią Y w górę. Gra z lewoskrętnym światem (między innymi Forza) wychodzi w nim odbity lustrzanie: każdy zakręt w prawo rysuje się jako zakręt w lewo, zarówno tor, jak i okrążenia. Same okrążenia to mówią – dodatni skręt kierownicą jest w prawo w każdym adapterze, a zewnętrzne zawieszenie zakrętu się ściska – więc zakładka analizy wyścigowej proponuje to poprawić, a **Kamera i scena → Odwróć oś świata** to robi: X, Y albo Z rysowane odwrotnie. Zmienia się tylko rysunek – odbicie wmontowane w macierz widoku; kamera leci w rysowanym świecie, a dane, analiza i każda współrzędna pokazywana przez narzędzia zostają grą. Analiza nazywa zakręty w lewo lub w prawo tym samym pomiarem.

### 11. Rajd: poślizg, lewa noga, powietrze {#rally-the-slide-the-left-foot-the-air}

Odcinek rajdowy to nie tor jechany przy gorszej przyczepności. Na żwirze i śniegu zakręt bierze się poślizgiem: samochód obraca się w zakręt, przenosząc ciężar – „hamulce przenoszą ciężar samochodu do przodu … przednie opony zyskują przyczepność, tylne ją tracą, a samochód obraca się, ślizgając w zakręt”, a potem gaz wraca, gdy samochód jest „ustawiony w kierunku, w którym chcesz jechać” ([DirtFish: jak używać hamulców](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Lewa noga hamuje, żeby gaz i hamulec dało się grać przeciwko sobie; hamulec ręczny obraca samochód w ciasnych zakrętach ([RallySport Ontario: jazda rajdowa, podstawy](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/), [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)), a samochód odrywa się od ziemi. Sekcja 6 już czyta poślizgi względem drugiego okrążenia; te reguły niosą resztę.

- **Nawierzchnia.** To, co mówi okrążenie (`meta.surface`, opcja `--surface` nagrywarek rajdowych), potem nazwa imprezy – rajdy na asfalcie (Hiszpania, Chorwacja, Europa Środkowa, Niemcy, Japonia, Korsyka, Ypres), zimowe (śnieg), asfalt Monte z lodem i śniegiem (mieszana) – a dopiero potem to, jak jechano samochodem. Limit boczny samochodu Rally2 to 0,7–0,9 g na żwirze i 1,3–1,4 g na asfalcie ([grenzbereich, wartości orientacyjne](https://github.com/GitCrush/grenzbereich)), a na żwirze dryfu jest dużo więcej (sekcja 6). Więc odcinek, na którym samochód ciągnął 10 m/s² lub więcej (95. percentyl, przy prędkości, na nawierzchni), z medianą dryfu poniżej 6 stopni wszędzie tam, gdzie skręcał w 70% tego lub mniej, był asfaltem; wszystko inne albo za mało, żeby stwierdzić, jest luźne.
- **Co samochód potrafi, na nawierzchni, na której to robił.** Przyczepność, hamowanie i ciąg (sekcja 5) mierzy się oddzielnie dla asfaltu i luźnej nawierzchni, gdy okrążenia przejechały jedną piątą lub więcej swoich próbek na każdej z nich, a każdy zakręt ocenia się z nawierzchnią pod samochodem w jego najwolniejszym punkcie. Próbki w powietrzu i przez 0,3 s po lądowaniu są pomijane we wszystkim, co mierzy samochód – obwiednie, krzywe opon, blokady i buksowanie: lądowanie szarpie samochodem bardziej, niż opony mogą wytrzymać, a koła kręcące się w powietrzu nie są buksowaniem. Docisku nie ocenia się na luźnej nawierzchni, gdzie szybkie i wolne odcinki etapu to różne drogi.
- **Muśnięcie lewą nogą to nie hamowanie.** Lekkie dotknięcie hamulca przy gazie na połowie lub więcej, na mniej niż 15 m, ustawia samochód albo go obraca; miejsce, w którym okrążenie zaczęło hamować przed zakrętem, to pierwsze hamowanie, przy którym gaz został zdjęty, albo to, które trwało dłużej.
- **Samochód obrócony na wejściu.** Dla każdego okrążenia i zakrętu – największy kąt dryfu od jego hamowania do 5 m za najwolniejszym punktem. Na luźnej nawierzchni okrążenie, które miało samochód obrócony o 8 stopni lub więcej mniej niż drugie (które obróciło go o 12 lub więcej) i wchodziło na moc albo płasko później, **obróciło samochód mniej**: porada to zdjąć gaz albo muśnąć lewą nogą hamulec, gdy samochód wchodzi w zakręt, żeby tył się obrócił – z punktem użycia ręcznego drugiego okrążenia, gdy tylko ono go użyło, albo ręcznym w zakręcie wolniejszym niż 54 km/h – i mieć go skierowanego na wyjście przed wierzchołkiem. Okrążenie, które obróciło go o 12 stopni lub więcej ponad drugie i mimo to wchodziło na moc później, **obróciło go za bardzo**: trzeba go było wyprostować, zanim moc mogła zejść na koła. Jedno i drugie jest przyczyną zakrętu na wyjściu, po usterce kontroli samochodu. Porada dotycząca linii na luźnej nawierzchni mówi to samo dla każdego zakrętu.
- **Powietrze.** Lot o 0,2 s lub więcej dłuższy niż na drugim okrążeniu, który kosztował czas od 10 m przed wybiciem do 40 m po lądowaniu (albo końca zakrętu), jest przyczyną, gdy tłumaczy 40% lub więcej straty zakrętu; a zakręt po nim, wchodzony wolniej, to mówi. W powietrzu samochód nie może skręcać, hamować ani napędzać. Porada zachowuje gaz przy wybiciu – „nie zdejmuj gazu przy wybiciu”, bo to opuszcza przód – i pokonuje garb nieco wolniej albo z muśnięciem hamulca, żeby samochód został nisko ([DirtFish: jak skakać rajdowym samochodem](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Kompleksy z co najwyżej trzema zakrętami.** Kręta sekcja, jechana nigdy nie płasko, nie jest jednym długim kompleksem: po trzech zakrętach zaczyna się nowy.

`src/race/rally.test.ts` trzyma analizę w ryzach wobec tego wszystkiego na etapach jeżdżonych prostym modelem: samochód obrócony mniej i późno na mocy, dłuższy lot, muśnięcia lewą nogą, kręta sekcja, asfalt kontra żwir.

## Dane i to, na co pozwala każde źródło {#data-and-what-each-source-allows}

| Źródło | Częstotliwość | Kanały | Pozwala na |
|---|---|---|---|
| Pliki okrążeń FH Companion | ~5 m | pozycja, prędkość, gaz, hamulec, kierownica, przyspieszenie wzdłużne i boczne, bieg | wszystko oprócz kontroli samochodu, która potrzebuje telemetrii obok nich |
| `.tele.gz` FH Companion, obok każdego pliku okrążenia | 64 Hz w grze (nagrywarka zachowująca każdy pakiet zapisuje ~110 na sekundę; powtórzenia są pomijane) | cały Data Out Forzy: poślizg, kąt poślizgu, poślizg łączony, obrót, zawieszenie, dudnienie nawierzchni dla każdego koła; prędkość w układzie samochodu; prędkość obrotu | wszystko, z kontrolą samochodu |
| Forza Data Out, nagrany przez `heat3d_capture telemetry` | 60 Hz | wszystko powyższe oraz dla każdego koła: temperatura opony, poślizg, kąt poślizgu, poślizg łączony, skok zawieszenia, prędkość koła, pasy dudniące; obroty, moc, moment, prędkość obrotu | wszystko |
| Assetto Corsa, ACC, AC EVO, AC Rally (pamięć dzielona, `heat3d_capture telemetry --game ...`) | 60–333 Hz | nadzbiór: temperatura rdzenia opony i wewnętrznej/środkowej/zewnętrznej, ciśnienia, temperatury hamulców, obciążenia kół, kąt pochylenia, poślizg i kąt poślizgu; prędkość w układzie samochodu; działający ABS i TC (ACC, EVO, AC Rally) | wszystko |
| `.ibt` iRacing, czytany bezpośrednio | 60 Hz | pozycja z GPS, pedały, kierownica, g, yaw, temperatura osnowy każdego koła, ugięcie amortyzatora, ciśnienie, zużycie | wszystko; kontrola samochodu z kąta dryfu (jego yaw względem kierunku jazdy) i kierownicy, bez poślizgu (nie jest zapisywany) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | na klatkę; 100 Hz | pozycja, prędkość w świecie i osie samochodu, prędkość w plamie styku każdego koła i zawieszenie, pedały, kierownica, zegar i długość odcinka | wszystko; poślizg i kąt dryfu wyliczane |
| Richard Burns Rally (NGP UDP) | na krok fizyki | pozycja, własne prędkości samochodu, ugięcie sprężyny i siła dla każdego koła, pedały | wszystko oprócz poślizgu kół |
| BeamNG.drive (mod protokołu `heat3d`) | do 100 Hz | pozycja, prędkość w świecie i osie, prędkość powierzchni każdego koła, obrót, obciążenie i styk z podłożem | wszystko; poślizg i kąt dryfu wyliczane |
| Trackmania (wtyczka Openplanet) | na klatkę | pozycja, prędkość przednia i boczna, pedały (hamulec wł./wył.), kierownica, współczynnik poślizgu każdego koła i luźne podłoże, w powietrzu | wszystko; kąt dryfu z prędkości bocznej |

Każde źródło zamienia się na jeden format okrążenia, `heat3d-lap`, którego kanały mają kanoniczne nazwy (`speed`, `throttle`, `tireTemp[FL]` ...). Ikona samochodu i wykresy rysują te kanały, które okrążenie ma.

## Źródła {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections: time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta w dziedzinie dystansu)](https://github.com/taishiliu25/lap-delta-analyzer)
- [Przewodnik iRacing po analizie okrążeń](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: okrążenia sesji](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analiza linii wyścigowych](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: teoretyczny najlepszy czas z sektorów](https://overcut.gg/)
- [Track Titan: jak analizować telemetrię](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: KPI hamowania, blokady i stabilności (wrzesień 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: gaz (styczeń 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: kluczowe wskaźniki efektywności kierowców wyścigowych (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modele tarcia opona-droga i optymalny poślizg (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: tarcie opona-nawierzchnia, poślizg przy szczycie na śniegu i lodzie](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: współczynniki tarcia opon, szczytowe i poślizgowe](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: siły wzdłużne](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: siły boczne](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Stabilność pojazdu, granice kąta poślizgu bocznego (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Jazda rajdowa przy dużym kącie poślizgu (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manewry rajdowe o minimalnym czasie (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Referencyjna prędkość obrotu ESC (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Wykrywanie podsterowności i nadsterowności przez kierowanie względem yaw (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: kąt skrętu, Ackermann i współczynnik podsterowności](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: kanały matematyczne (Kus, połączone g)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: miernik nadsterowności i podsterowności](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Hamowanie kadencyjne: blokowanie na bardzo luźnych nawierzchniach](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: zapis danych na rajdach po żwirze](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: jak używać hamulców](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: jak skakać rajdowym samochodem](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: jazda rajdowa, podstawy](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dynamika pojazdów rajdowych, wartości orientacyjne](https://github.com/GitCrush/grenzbereich)
- [Trenażer dryfu w Trackmanii, wtyczka (stałe)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Opis poślizgów w Trackmanii](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: procesy coachingu](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: linia V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (prędkość na wyjściu a czas minimalny)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: kolejność poprawy czasu okrążenia](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: trzy typy zakrętów](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: priorytety zakrętów](https://driver61.com/uni/prioritising-corners/)
- [Driver61: różne zakręty, różne techniki](https://driver61.com/uni/different-corner-technique/)
- [Driver61: sześć faz zakrętu](https://driver61.com/uni/corner-phases/)
- [Driver61: przyczepność](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (fragment)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: czym jest samochód pędowy](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Spór o pęd ponad moc](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matematyka linii wyścigowej, część 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, część 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [Technika FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD w zakrętach](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Linia wyścigowa](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: technika pokonywania zakrętów](https://www.formula1-dictionary.net/cornering_tech.html)
- [Maksymalna prędkość w zakręcie](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Słownik telemetrii wyścigowej](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Globalne planowanie trajektorii czasu minimalnego z uwzględnieniem krzywizny i dystansu](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: globalna optymalizacja trajektorii wyścigowej](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: współczynnik toczenia](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Wprowadzenie do kręgu tarcia](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: diagram g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Poślizg wzdłużny](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Podsterowność, przegląd](https://www.sciencedirect.com/topics/engineering/understeer)
- [Understeer and oversteer](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Dokumentacja Forza Motorsport Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: przyspieszenie ograniczone trakcją](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: przyspieszenie ograniczone mocą](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO: pamięć dzielona](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally: czytnik telemetrii](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT: parsowanie](https://github.com/teamjorge/ibt)
