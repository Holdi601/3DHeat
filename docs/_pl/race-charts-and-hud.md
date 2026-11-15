---
title: "Wykresy i HUD"
parent: "Analiza wyścigowa"
nav_order: 53
lang: "pl"
source: "race-charts-and-hud.md"
source_hash: "e28a1df357bf"
translated: true
outdated: false
---

# Wykresy i HUD

Wykresy ustawiają okrążenia obok siebie metr po metrze, dzięki czemu widać, gdzie
kierowca hamował później albo wcześniej zdjął gaz. Karty w lewym górnym rogu widoku
pokazują, co w tej chwili robi każdy samochód i kierowca.

![Wykresy pod widokiem: wiersze różnicy, prędkości, gazu, hamulca i skrętu dla dwóch okrążeń, paski czasu i przyczyn u góry oraz kursor z kartami](../assets/img/en/race-charts-rows.webp)

## Wykresy {#the-charts}

Każde okrążenie na jednej osi odległości - metry wzdłuż wzorca (zobacz
[jedna oś odległości](race-corner-analysis.md#one-distance-axis)) - więc ten sam x
to to samo miejsce na torze dla każdego okrążenia. Jedno okrążenie jest rysowane
samo (i odtwarza się); drugie okrążenie tej samej trasy jest rysowane względem niego.
Gdy nie ma wczytanych okrążeń (albo analiza się nie powiodła), obszar pisze: "Wykresy
pojawią się po wczytaniu okrążenia; wczytaj kolejne z tej samej trasy, żeby porównać
dwa."

### Co na nich jest {#what-is-on-them}

- **Legenda**: kolor i etykieta każdego narysowanego okrążenia, wzorzec oznaczony
  "(wzorzec)"; "+N więcej narysowanych, nie na wykresie", gdy widać więcej okrążeń,
  niż jest na wykresie; **Wykresy (N) ▾**; **Całe okrążenie**, gdy jest przybliżone;
  jedna linia podpowiedzi.
- **Dwa paski** u góry, dla skupionego okrążenia:
  - *czas*: [mapa czasu](race-replay-and-scene.md#time-map-where) jako pasek,
    czerwony - tracące, zielony - zyskujące;
  - *przyczyna*: każda jego strata jako słupek nad miejscem, gdzie leży jej przyczyna,
    w kolorze przyczyny; najechanie na słupek pokazuje tytuł i koszt.
- **Pasy zakrętów**: zacieniony pas od wejścia do wyjścia każdego zakrętu (jak
  znaleziono go na wzorcu) i jego nazwa (`T1` …) pod osią, przy wierzchołku.
- **Wybrane ustalenie**: pas w kolorze jego przyczyny nad jego zasięgiem.
- **Wiersze** (wykresy), jeden na wybrany kanał, każdy z nazwą i górną oraz dolną
  wartością zakresu po lewej; linia zera tam, gdzie zakres przechodzi przez zero.
  Każde okrążenie to linia w swoim kolorze: skupione okrążenie 2 px szerokie i
  pełne, wzorzec pełny, pozostałe 1,5 px przy 75%. Wiersz różnicy pomija wzorzec
  (jest zerem wobec siebie).
- **Kursor**: pionowa linia tam, gdzie jest samochód wzorcowy (albo gdzie jest wskaźnik),
  i kropka dla każdego samochodu na każdym wierszu poza różnicą - przy kursorze każdy
  samochód jest na tym samym metrze; w innym wypadku własna odległość każdego samochodu
  przy zegarze powtórki.

Najwyżej **8** okrążeń jest na wykresie: najpierw skupione, najlepsze z jego klasy
i wzorzec, potem pozostałe w kolejności wczytania.

### Wiersze i ich wysokości {#rows-and-their-heights}

Wiersze dzielą wysokość wykresu według wagi, żaden nie niższy niż 16 px:

| Wiersz | Waga |
|---|---|
| Różnica (do wzorca, sekundy, ze znakiem) | 1,7 |
| Prędkość (km/h) | 1,7 |
| pedał (gaz, hamulec, sprzęgło) | 1 |
| skręt | 1,1 |
| bieg | 0,8 |
| lampka (hamulec ręczny, ABS …) | 0,55 |
| cokolwiek innego | 1 |

Kanał ze stałym zakresem wyświetlania w tabeli (pedały 0-100%) używa go; pozostałe
dopasowywane są do widocznego odcinka okrążeń. Nazwa wiersza za długa na miejsce
(długie słowo w innym języku) przenosi górną wartość o linijkę niżej, gdy wiersz jest
dość wysoki, a gdzie nie jest - jest ucinana wielokropkiem; pełna nazwa jest w podpowiedzi.

### Domyślne wykresy {#the-default-graphs}

Dopóki nie wybierze się wykresów: **różnica**, potem każdy kanał oznaczony w tabeli
jako `graph`, który mają okrążenia - gaz, hamulec, sprzęgło, hamulec ręczny, skręt,
bieg, prędkość - z wyjątkiem pedału albo lampki, którą pomija się, chyba że jakieś
okrążenie przesuwa ją powyżej 0,02 (sprzęgło, którego nigdy nie wciśnięto, nie jest
wykresem). Kolejność jest z tabeli.

### Wybór wykresów {#the-graph-picker}

**Wykresy (N) ▾** otwiera panel nad przyciskiem:

- pole filtra (dopasowuje nazwę albo identyfikator kanału);
- **Domyślne** (powrót do domyślnego zestawu; jego podpowiedź mówi, ile ich jest) i
  **Zamknij**;
- *Różnica do wzorca*, potem każdy kanał, który niosą narysowane okrążenia, pogrupowany
  (ruch, sterowanie, silnik, wspomaganie, opony, hamulce, zawieszenie, koła, inne,
  czas, pozycja), z polem wyboru przy każdym; kanał przypisany do koła to jedna linia
  z żetonem na każde koło (FL, FR, RL, RR).

Zaznaczanie zachowuje kolejność z tabeli, bez względu na kolejność zaznaczania. Wybór
trzyma się do **Domyślne** albo przeładowania. Kanały, których tabela nie zna, są
oferowane w grupie *inne*, nazwane od swojego identyfikatora ("brakeLinePress" →
"Brake line press").

### Najechanie, kółko, przybliżenie, kliknięcie {#hover-wheel-zoom-click}

| Wejście | Robi |
|---|---|
| najechanie | każdy samochód, jego karta i jego sterowanie przesuwają się na ten metr; słupek zaznacza go na torze; tabela wypisuje wartość każdego narysowanego okrążenia na każdym wierszu tam (różnica pokazana jako "ref" dla wzorca); nad kartami "przy N m - kursor wykresów". Zjechanie z wykresu oddaje sterowanie powtórce |
| kółko | przesuwa powtórkę po okrążeniu o 1/200 widocznego odcinka na ząbek (Shift: 5×), wstrzymując powtórkę; przy przybliżeniu widok podąża za kursorem |
| Ctrl+kółko (Cmd+kółko) | przybliża oś odległości wokół wskaźnika, 1,25× w oddalenie / 0,8× w zbliżenie na ząbek, nigdy węziej niż 40 m; oddalenie do całego okrążenia kończy przybliżenie |
| kółko w bok | przesuwa przy przybliżeniu (10% odcinka na 100 jednostek przewijania) |
| podwójne kliknięcie, **Całe okrążenie** | oddala |
| kliknięcie | przeskakuje powtórkę tam, gdzie wzorzec dochodzi do tego metra |
| Shift+kliknięcie | ustawia samochody w linii tam (zobacz [ustawianie w linii](race-replay-and-scene.md#lining-up)) |

Wykresy rysują się na nowo w bieżącym języku, gdy się on zmieni.

Linia podpowiedzi w legendzie mówi to samo krótko: "Najechanie: wszystkie samochody tam · kółko: przesuwanie po okrążeniu · Ctrl+kółko: przybliżanie · kliknięcie: skok · Shift+kliknięcie: ustaw w linii".

## Karty samochodów (HUD) {#the-car-cards-hud}

Lewy górny róg widoku, karta na każde widoczne okrążenie - najwyżej **6**, pierwsze
sześć widocznych okrążeń w kolejności wczytania - dla chwili, w której stoi powtórka
(albo kursor wykresów).

**Nagłówek:** kolor i etykieta okrążenia; bieżąca różnica - czas tego okrążenia, by
dojechać do obecnej odległości, minus czas wzorca, by dojechać do tej samej odległości,
"+0,48 s" - albo "wzorzec"; **⋯**, by pokazać lub ukryć wszystkie inne wartości (to samo
co *Wszystkie wartości na kartach*). Karta ściganego samochodu jest wyróżniona.

**Samochód z góry:** kontur nadwozia w kolorze okrążenia ze strzałką z przodu, cztery
opony (przednie skręcone do 28° razem ze sterowaniem), każda pokolorowana według
temperatury, z tymi samymi znakami co samochód 3D rysowany płasko: pierścień poślizgu,
pasek zawieszenia, żar hamulca, pas zużycia, pasek obciążenia.

**Odczyty:** prędkość w km/h, czas samego okrążenia, jego odległość wzdłuż wzorca.

**Sterowanie:**

- kierownica obracana przez wejście skrętu (pełne wychylenie rysowane jako 180°) z procentem
  pod nią;
- pasek na każdy pedał, od lewej do prawej jak w zestawie pedałów - sprzęgło, hamulec,
  gaz - każdy z procentem i krótką nazwą, w swoim kolorze (tylko pedały, które okrążenie ma);
- bieg (R dla wstecznego, N dla luzu);
- mała lampka na każdy kanał włącz/wyłącz, który ma okrążenie - hamulec ręczny, ABS, TC,
  DRS, ogranicznik pit, w powietrzu - zapalona w swoim kolorze, gdy włączona (powyżej
  połowy zakresu);
- odczyt na każdy kanał poziomowy: rozdział hamowania, ustawienia ABS i TC, doładowanie, paliwo.

**Ślad sterowania:** ostatnie **6 sekund** każdego pedału (jeden pas, każdy w swoim kolorze)
i skrętu (własny pas, wyśrodkowany), kończący się w tej chwili - co kierowca robił, wjeżdżając
w nią. Do 160 punktów.

**Wszystkie wartości** (⋯ albo *Wszystkie wartości na kartach*): każda inna wielkość
okrążenia w tej chwili, potem każdy kanał przypisany do koła jako cztery wartości (FL FR
RL RR), nazwane z tabeli kanałów albo z własnej nazwy kanału, uporządkowane według grupy.

## Dla programistów {#for-developers}

Kod: [`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx),
[`src/race/graphs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/graphs.ts),
[`src/ui/race/RaceHud.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHud.tsx),
[`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts).

### Tabela kanałów {#the-channel-table}

`CHANNELS` w [`src/race/schema.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/schema.ts)
to jedyne miejsce, w którym opisany jest kanał: jego jednostka, czy to jedna wartość na
próbkę, czy jedna na koło (zapisywana jako `name.FL` …), jego grupa, zakres wyświetlania,
sposób rysowania na samochodzie (`glyph`), sposób pojawiania się na karcie (`input`:
`pedal`, `steering`, `gear`, `lamp`, `level`), czy jest domyślnym wykresem, czy przeskakuje
zamiast płynnie przechodzić (bieg, flagi) i jak jest pokazywany (skala, jednostka, cyfry).
Etykiety i krótkie nazwy są komunikatami w każdym języku (`race.channel.<name>.label` /
`.short`).

Kanały z rysunkiem albo domyślnym wykresem:

| Kanał | Jednostka | Rysowany jako | Domyślny wykres |
|---|---|---|---|
| `throttle`, `brake`, `clutch` | 0..1 | pedał (zielony, czerwony, …), pokazany w % | tak |
| `handbrake` | 0..1 | lampka | tak |
| `steer` | -1..1, prawo dodatnie | kierownica | tak |
| `gear` | - | bieg | tak |
| `speed` | m/s, pokazany w km/h | - | tak |
| `absActive`, `tcActive`, `drs`, `pitLimiter`, `airborne` | 0..1 | lampka | - |
| `brakeBias`, `absLevel`, `tcLevel`, `boost`, `fuel` | - | odczyt poziomu | - |
| `tireTemp` (na koło) | °C, wyświetlane 40-130 | kolor opony | - |
| `tireTempInner/Middle/Outer` | °C | - | - |
| `slipRatio`, `slipAngle` (na koło) | tak, jak skaluje je gra, wyświetlane ±1,5 | pierścień poślizgu | - |
| `combinedSlip`, `slipIndex` (na koło) | wyświetlane 0-1,5, 0-1 | pierścień poślizgu | - |
| `suspension` (na koło) | 0..1 | pasek zawieszenia | - |
| `brakeTemp` (na koło) | °C, wyświetlane 100-900 | żar hamulca | - |
| `tireWear` (na koło) | 0..1 | pas zużycia | - |
| `wheelLoad` (na koło) | N, wyświetlane 0-12 000 | pasek obciążenia | - |

Inne w tabeli (rysowane na wykresie i wypisywane, nie rysowane na samochodzie):
`latAcc`, `longAcc`, `vertAcc`, `yaw`, `pitch`, `roll`, `yawRate`, `latVel`, `longVel`,
`vertVel`, `bodySlip` (kąt dryfu), `loose`, `lateral` (odchylenie od wzorca), `rpm`,
`power`, `torque`, `waterTemp`, `oilTemp`, `tirePressure`, `camber`, `padLife`, `discLife`,
`suspensionM`, `wheelSpeed`, `wheelSurfaceSpeed`, a także `time`, `distance`, `x`, `y`, `z`.

**Kanał, którego nie ma w tabeli**, nadal jest czytany, rysowany na wykresie (w grupie
*inne*) i wypisywany na kartach, z etykietą od własnej nazwy. **Aby nadać mu właściwą
nazwę, jednostkę i rysunek**, dodaj jeden wpis do tabeli (i jego komunikat z etykietą do
każdego `src/i18n/locales/<język>/race-channels.json`). Nowy *rodzaj* rysunku koła to jeden
wpis w `WHEEL_GLYPHS` (glyph.ts) i jego płaski odpowiednik `CARD_GLYPHS` (RaceHud.tsx); oba
są typowane według rodzaju, więc budowanie się nie uda, dopóki oba nie istnieją.
`src/race/extensible.test.ts` sprawdza, że nieznane kanały trafiają na wykresy, że każdy
znak z tabeli da się narysować i że lampki się zapalają.
