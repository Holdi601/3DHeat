---
title: "Profile pojazdów i porównanie"
parent: "Analiza wyścigowa"
nav_order: 56
lang: "pl"
source: "race-car-profiles.md"
source_hash: "178f6511a289"
translated: true
outdated: false
---


# Profile pojazdów i porównanie

Samochód potrafi hamować, skręcać i przyspieszać tylko tak mocno. Widz mierzy, jak mocno, z twoich własnych okrążeń, więc nigdy nie każe ci zrobić czegoś, czego twój samochód nie potrafi. To też wyjaśnia, jaka część straconej sekundy była winą samochodu, a jaka twoja.

![Porównanie samochodów: dwa samochody obok siebie z ich przyczepnością, hamowaniem i ciągiem](../assets/img/en/race-cars-compared.webp)

Analiza mówi okrążeniu tylko, żeby hamowało mocniej, niosło więcej prędkości albo przyspieszało wcześniej tam, gdzie jego samochód pokazał, że potrafi, i odejmuje od straty to, co wyjaśniają same samochody. Dlatego ograniczenia każdego samochodu (jego *obwiednia*, niżej) i charakter (jego *profil*) są mierzone z każdego wczytanego okrążenia tego samochodu. Ta strona opisuje obwiednię, profil, sekcję **Porównanie samochodów** i to, co samochody decydują w każdym zakręcie.

**Jeden samochód** = okrążenia z tym samym numerem samochodu (albo nazwą, bez numeru) i tym samym indeksem wydajności: inne strojenie to inny samochód.

## Obwiednia: co samochód potrafi przy każdej prędkości {#the-envelope-what-the-car-can-do-at-each-speed}

Dla każdego samochodu, z każdego wczytanego jego okrążenia, w **przedziałach prędkości co 5 m/s** (24 przedziały, do 120 m/s). Próbki w powietrzu, wyhamowywanie przez 0,3 s po lądowaniu i od 0,1 s przed każdym uderzeniem do 1 s po nim są pomijane, a przyspieszenia 80 m/s² lub więcej są ignorowane (powyżej tego, co utrzymuje jakikolwiek samochód z docisku).

| Obwiednia | Próbki | Wartość w przedziale | Wymaga |
|---|---|---|---|
| **przyczepność boczna** | boczne przyspieszenie **utrzymane przez pół sekundy** (średnia wartości bezwzględnej w wyśrodkowanym oknie 0,5 s), tylko tam, gdzie samochód skręcał: co najmniej jedna trzecia 99. percentyla całości | 95. percentyl | 6 próbek |
| **hamowanie** | hamulec > 0,3; przyspieszenie wzdłużne jako mediana każdej próbki i jej dwóch sąsiadów | 95. percentyl opóźnienia | 4 próbki |
| **pełny ciąg** | gaz > 0,95, hamulec poniżej 0,05; ta sama mediana z trzech | 90. percentyl | 4 próbki |

Dlaczego utrzymane przez pół sekundy: krawężnik, poślizg wracający na miejsce i samochód łapany przez kierowcę podnoszą boczne przyspieszenie na chwilę, a samochód, który tak robi często, wyglądał na mocniej trzymający, niż jest. Dlaczego mediana z trzech: przy odstępie pięciu metrów jedna próbka to długi kawałek drogi, a pojedyncza próbka-kolec to krawężnik, wybój albo ściana.

Odczyt obwiedni przy danej prędkości interpoluje między środkami przedziałów, a gdy przedział jest pusty, bierze najbliższy przedział z danymi.

**O dwóch rodzajach nawierzchni.** Gdy okrążenia samochodu przejechały jedną piątą albo więcej swoich próbek zarówno na asfalcie, jak i na luźnej nawierzchni, trzymana jest osobna obwiednia dla każdej z nich, a każdy zakręt jest oceniany według nawierzchni pod samochodem w jego najwolniejszym punkcie.

**Punkt przecięcia.** Prędkość, od której ciąg spada jak `1/v` (ograniczony mocą), a nie utrzymuje się płasko (ograniczony trakcją): pierwszy przedział, którego `a·v` jest w granicach 15% najwyższego widzianego `a·v`.

## Profil: jakim samochodem jest {#the-profile-what-kind-of-car-it-is}

`profile`, z tych samych okrążeń (próbki na ziemi, nieuderzone, szybsze niż 8 m/s):

| Miara | Jak |
|---|---|
| **utrzymana przyczepność** (m/s²) | 95. percentyl utrzymanego przez pół sekundy bocznego przyspieszenia |
| **ciąg** do 50 km/h, 50–120, 120–200, powyżej 200 (m/s²) | średnia pełnego ciągu obwiedni w zakresach 3–14, 14–33, 33–56 i 56–90 m/s, przy prędkościach, jakie samochód osiągnął (do jego najszybszej + 2 m/s), z co najmniej trzech kroków po 1 m/s; i najwięcej, jakie pokazał, i gdzie |
| **hamowanie** (m/s²) | hamowanie obwiedni uśrednione od 60 do 160 km/h (16,7–44,4 m/s), pasmo, które nazywa porównanie |
| **najszybszy** | najwyższa prędkość, jaką osiągnął |
| **wyhamowuje przy** | gdzie przestał przyspieszać przy pełnym gazie na prostej (poniżej) |
| **wciąż ciągnie przy najszybszej** | ciąg obwiedni przy jego najszybszej prędkości: ile jeszcze miał do przejechania |
| **tył złapany, na okrążenie** | ile razy na okrążenie ślizgał się i trzeba go było złapać (poniżej) |
| **udział na gazie** | z nich udział tych, które zaczęły się od gazu > 0,5 i bez hamulca |
| **puszcza przy** | mediana utrzymanego bocznego przyspieszenia 0,15 s przed każdym poślizgiem, jako udział przyczepności |
| **powyżej 10° dryfu, przy mocnym skręcie** | spośród próbek skręcających przy 60% przyczepności lub więcej, udział ślizgających się (10° na asfalcie, 20° na luźnej); potrzeba 30 próbek |
| **mediana dryfu** | po tych samych próbkach |
| **równowaga** | kąt poślizgu przodu minus tyłu (wielokrotności nominalnego szczytu) przy mocnym skręcie bez ślizgu, średnia z co najmniej 30 próbek: + pcha na zewnątrz |
| **nawierzchnia** | powyżej 80% próbek luźnych: luźna; poniżej 20%: asfalt; inaczej mieszana |

**Wyhamowywanie.** Próbka się liczy, gdy sekunda wokół niej (±0,5 s, co najmniej 0,9 s danych) była cała na pełnym gazie (> 0,95, bez hamulca), na ziemi, prowadzona **prosto** (|boczne| poniżej większego z 4 m/s² i jednej czwartej przyczepności), zyskując poniżej **0,35 m/s²**, szybciej niż 25 m/s i w granicach 90% najszybszej prędkości okrążenia — pełny gaz pod górę albo przez długi zakręt też przestaje przyspieszać, na długo przed prędkością maksymalną samochodu. Gdy na wszystkich okrążeniach jest co najmniej **jedna sekunda** takiego płaskiego odcinka, mediana tych prędkości to miejsce, w którym samochód wyhamowuje. W przeciwnym razie nie ma prędkości maksymalnej: tam, gdzie żadna prosta nie była dość długa, *wciąż ciągnie przy najszybszej* mówi, jak daleko było do niej. Bez zgadywania ponad to, co pokazują okrążenia — przełożenia i ogranicznik kończą ciąg samochodu na długo przed oporem powietrza.

**Tracenie tyłu.** Liczone tam, gdzie kierowca musiał go złapać: skręcanie przy 60% przyczepności lub więcej, ślizganie się (dryf powyżej 10° na asfalcie, 20° na luźnej), z kierownicą (powyżej 0,06) skręconą **przeciwko** zakrętowi. To, który znak kierownicy zgadza się z którym znakiem siły bocznej, jest mierzony na każdym okrążeniu osobno (próbki skręcające bez ślizgu). Poślizg liczy się raz, dopóki samochód się nie przestanie ślizgać. Samochód prowadzony trochę bokiem celowo nic nie traci; ten, który potrzebuje kontrskrętu, traci. Liczone tak samo dla każdego samochodu, więc dwa samochody można porównać. Potrzebuje kierownicy i kąta dryfu.

## Porównanie samochodów {#cars-compared}

Sekcja na pasku bocznym to **Samochód** przy jednym samochodzie, **Porównanie samochodów** przy kilku.

**Tabela**: kolumna na samochód, wiersz na każdą miarę, którą jakikolwiek samochód ma wartość: Utrzymana przyczepność; Ciąg do 50 km/h, 50–120, 120–200, powyżej 200; Hamowanie; Najszybszy; Wyhamowuje przy („wciąż ciągnie”, gdy nigdy nie wyhamował); Wciąż ciągnie przy najszybszej; Tył złapany, na okrążenie; Powyżej 10° dryfu, przy mocnym skręcie. Gdy samochody różnią się o więcej niż 3%, lepsza wartość jest zaznaczona (wyższa dla przyczepności, ciągu, hamowania, prędkości; niższa dla poślizgów tyłu).

**Jeden samochód sam**: zdania o tym, czym jest według okrążeń — przyczepność, jaką trzyma (m/s² i g), jego ciąg w każdym paśmie, gdzie przestawał przyspieszać na długich prostych (albo że nigdy nie wyhamował i przy czym wciąż ciągnął przy najszybszej), jak często trzeba było łapać tył („prawie nigdy” poniżej raz na okrążenie, „głównie na gazie”, gdy 60% lub więcej zaczynało się od gazu).

**Dwa samochody**: dla każdej pary zdanie o tym, czym jeden samochód jest wobec drugiego („X przyspiesza lepiej, ale nie może skręcać tak mocno, potrzebuje dłużej, by się zatrzymać i łatwiej traci tył”), tabela, każda wyraźna różnica od największej, a potem **Jak jeździć każdym**. Przy więcej niż **3** parach pokazywana jest jedna para: samochód wybranego okrążenia wobec samochodu wybranego z listy rozwijanej (domyślnie samochód najlepszego okrążenia jego klasy, w przeciwnym razie odniesienia, a potem pierwszy inny).

Różnica jest mówiona tylko wtedy, gdy okrążenia pokazują ją wyraźnie:

| Różnica | Mówione od | Zdanie |
|---|---|---|
| przyczepność | **4%** | „X trzyma N% więcej przyczepności w zakrętach … to M% więcej prędkości przez środek każdego zakrętu” (prędkość = √ stosunku przyczepności) |
| ciąg | **5%**, w pierwszym paśmie, jakie oba samochody mają z 120–200, 50–120, powyżej 200 km/h | „X przyspiesza N% mocniej od 120 do 200 km/h”; także ze startu, albo „choć Y rusza z miejsca mocniej”, gdy start różni się o 8% |
| prędkość maksymalna | **4 km/h** | „X wyhamowuje wyżej: przestał przyspieszać przy …” |
| prędkość maksymalna, tylko jednego | jeden samochód wyhamował, drugi nie | „Y skończył ciąg przy …; X wciąż przyspieszał, gdy hamował” |
| prędkość maksymalna, żadnego | żaden nie wyhamował | co każdy wciąż przyspieszał przy najszybszej |
| hamowanie | **5%** | „X zatrzymuje się N% mocniej … Y musi hamować wcześniej” |
| tracenie tyłu | przynajmniej raz na okrążenie więcej **i** półtora raza częściej | „X łatwiej traci tył: wyślizguje się tak daleko, że musi kontrskręcać N razy na okrążenie, a M …” — głównie na gazie (60%+) albo głównie przy wchodzeniu w zakręt z puszczonym gazem (30% lub mniej), od około P% swojej przyczepności; na luźnej nawierzchni „część tego to sposób, w jaki samochód jest skręcany; łapanie nie” |
| bokiem | **12 punktów procentowych** mocnego skręcania ponad progiem dryfu | „X jedzie bardziej bokiem na granicy” |
| równowaga przodu | **0,3** nominalnego szczytu | „X pcha bardziej przodem … chce, żeby go wyhamować i skręcić przed wierzchołkiem” |

Cechy w podsumowaniu: *trzyma więcej przyczepności* / *nie może skręcać tak mocno*, *przyspiesza lepiej* / *ma mniejszy ciąg*, *wyhamowuje wyżej* / *wyhamowuje niżej*, *wciąż ciągnie na końcu prostych* / *kończy ciąg*, *hamuje mocniej* / *potrzebuje dłużej, by się zatrzymać*, *jest stabilniejszy* / *łatwiej traci tył* (*jest dużo bardziej ślizgowy …* przy dwa razy częściej plus jeden; *częściej trzeba go łapać* na luźnej nawierzchni), *pcha przodem*. „Mało do odróżnienia od Y na tych okrążeniach”, gdy nie ma żadnej różnicy.

**Jak jeździć każdym:**

- jeden samochód trzyma więcej przyczepności, a drugi ma więcej ciągu: niesiesz prędkość przez środek szerokiej, okrągłej linii (to „U”) w tym z przyczepnością; hamujesz prosto, obracasz go w krótkim, ciasnym środku i prostujesz wyjście (to „V”) w tym mocnym;
- jeden samochód jest gorszy w obu: jego najlepsze okrążenie jest najczystsze — hamuj prosto, na najszerszym promieniu, pełny gaz tak wcześnie, jak się utrzymuje;
- samochód, który łatwiej traci tył: dawkuj gaz dopiero wtedy, gdy kierownica się rozkręca, i zmieniaj biegi krótko (poślizgi na gazie), albo delikatnie puszczaj hamulec i utrzymuj równy gaz przez środek (poślizgi przy wejściu).

Podpowiedź pod sekcją powtarza, jak każde z tego jest mierzone.

## Co samochody decydują w zakręcie {#what-the-cars-decide-in-a-corner}

Gdy okrążenia są w różnych samochodach, każde stracone zdanie zakrętu kończy się **Samochody:** — tym, co z tego decydują samochody i jak wycisnąć z tego jednego najwięcej (`carNote`):

- **Przez środek**, gdy ten samochód trzyma poniżej 96% przyczepności drugiego, drugi był o ponad 0,5 m/s szybszy w najwolniejszym punkcie, a to okrążenie nie było daleko poniżej tego, co tłumaczy jego przyczepność (powyżej 70% tego): na linii drugiego samochodu przyczepność tego samochodu pozwala na `v_inny · √(przyczepność_moja / przyczepność_inny)`. Jeśli okrążenie to przeniosło (w granicach 1 m/s), różnicą jest samochód i żaden punkt hamowania tego nie zmieni; jeśli mniej, pokazuje, ile jeszcze jest do wzięcia. Potem gdzie czas można zyskać zamiast tego: na prostą, między dwoma zakrętami albo w samochodzie, który ciągnie o 5% mocniej — po wierzchołku (hamuj prosto, wchodź później, celuj wcześnie w wyjście); w przeciwnym razie najszerszy promień, jaki pozwala droga.
- **Tył, który tu puścił** (niezaliczony poślizg albo obrót albo dryf powyżej progu poślizgu na wejściu), w samochodzie, który traci go co najmniej raz na okrążenie częściej i półtora raza częściej: co robić w tym samochodzie — gaz dawkowany, gdy kierownica się rozkręca (jego poślizgi zaczynają się na mocy w 60% lub więcej przypadków), albo hamulec delikatnie puszczony bez odpuszczania gazu.
- **Prosta po**: gdy ciąg samochodów wyjaśniał 0,03 s lub więcej, mocniejszy ciąg drugiego samochodu z tej samej prędkości, z ciągiem obu samochodów od 120 do 200 km/h.
- **Prędkość maksymalna**: gdy to okrążenie osiągnęło 98% tego, gdzie jego samochód wyhamowuje na prostej dłuższej niż 150 m, a drugi jechał o 1,5 m/s szybciej: to jest prędkość maksymalna samochodu i każdy km/h więcej z zakrętu wciąż pomaga, aż do niej dojdziesz.
- **Hamowanie**: gdy drugi samochód hamuje o 5% mocniej, a to okrążenie hamowało o ponad 5 m wcześniej, to część wcześniejszego hamowania jest zasługą samochodu.

Udział samochodu jest też odejmowany od samego czasu — zob. [udział samochodu](race-corner-analysis.md#the-cars-share) — a zakręt, w którym samochód wyjaśnia 60% lub więcej, jest przypisywany samochodowi.

## Dla programistów {#for-developers}

Kod: [`src/race/envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
[`src/race/profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
`carNote` w [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
`CarsSection` w [`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
