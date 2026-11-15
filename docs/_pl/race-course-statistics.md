---
title: "Statystyki trasy"
parent: "Analiza wyścigowa"
nav_order: 57
lang: "pl"
source: "race-course-statistics.md"
source_hash: "0c5c49eeef00"
translated: true
outdated: false
---

# Statystyki trasy

Wczytaj wiele okrążeń jednej trasy, a przeglądarka policzy błędy: który zakręt
kosztuje najwięcej czasu, na ilu okrążeniach tam coś poszło źle i dlaczego.
Użyj tego, by znaleźć zakręt wart treningu.

Wypróbuj: **Okrążenia demo** daje trzy okrążenia, wystarczająco, by ta sekcja się pojawiła.

![Statystyki trasy z mapą błędów: tor pokolorowany według tego, na ilu okrążeniach w każdym zakręcie stracono czas, i lista zakrętów](../assets/img/en/race-course-mistake-map.webp)

Wczytaj cały folder trasy - kilkadziesiąt okrążeń, kilka samochodów, kilka klas
osiągów - a każde okrążenie zostanie ocenione, a potem policzone. Ta strona
opisuje porównanie według klasy, co liczy się jako błąd, sekcję **Statystyki trasy**,
mapę błędów, eksport do mapy cieplnej, trasy z kilku torów oraz ograniczenia
wydajności przy wielu okrążeniach.

## Względem najlepszego we własnej klasie {#against-the-best-of-its-own-class}

Okrążenie jest porównywane zakręt po zakręcie z **najszybszym pełnym okrążeniem
własnej klasy osiągów** (wzorcem, w klasie wzorca). Samo to okrążenie porównuje
się z najszybszym w swojej klasie przez każdy zakręt, a gdy jest w klasie samo,
z każdym okrążeniem. Samochody są grupowane według klasy osiągów z gry (w Forzie
od D do X; C i S2 to dwie z nich). Punkt hamowania samochodu klasy C obok punktu
samochodu S2 nic nie mówi o jeździe. Mapa czasu, różnice na liście okrążeń
i tabela *Zakręt po zakręcie* korzystają z tego samego porównania (zobacz
[z kim porównuje się każde okrążenie](race-corner-analysis.md#who-each-lap-is-compared-with)).

Statystyki są zbudowane na analizie każdego okrążenia, a nie obok niej.

## Co liczy się jako błąd {#what-counts-as-a-mistake}

**Wystąpienie** to błąd jednego okrążenia w jednym zakręcie (segmencie). Błędy
okrążenia w zakręcie to:

1. **Przyczyna jazdy**, którą analiza znalazła dla jego straty tam - ustalenie,
   że to strata, przypisana kierowcy (a nie samochodowi ani sytuacji), kosztująca
   **0,05 s** lub więcej względem okrążenia porównawczego. Jego koszt to strata w zakręcie.
2. **Każdy błąd w kontroli samochodu**, jaki tam zrobiło, a którego drugie
   okrążenie nie zrobiło (niewspólny), kosztujący **0,03 s** lub więcej - blokada,
   buksowanie, uciekający tył, wypychanie, obrót. Jego koszt to koszt zdarzenia.
3. **Każde uderzenie i wypadek**, wspólne albo nie, bez względu na koszt.

W jednym zakręcie może ich być kilka; każdy rodzaj liczy się **raz na okrążenie
i zakręt**. Zyski, udział samochodu i późniejszy przyjazd wynikający z błędu
w poprzednim zakręcie nie są błędami.

### Od ustaleń do błędów {#from-findings-to-mistakes}

| Ustalenie | Błąd |
|---|---|
| za szybko na wejściu, wolno na wyjściu, bo hamowano kilka metrów później niż drugie okrążenie | Hamowano za późno |
| hamowano wcześnie | Hamowano za wcześnie |
| hamowano łagodnie | Hamowano za słabo |
| blokada jako przyczyna | Zablokowane koło |
| toczenie się | Toczenie się |
| przyczepność w zapasie, wolniej do wierzchołka, hamowano tam, gdzie drugie tylko zdjęło gaz | Za wolno w środku zakrętu |
| zbyt ciasna linia | Za ciasna linia |
| wypchnięty szeroko | Wypchnięty szeroko |
| obrócono samochód za mało / za bardzo | Źle obrócony samochód |
| gaz później, pełny gaz później, zawahanie | Spóźniony gaz |
| wolniej na wyjściu z zakrętu | Wolniejsze wyjście |
| buksowanie | Buksowanie kół |
| tył uciekł, bokiem przez środek | Uciekający tył |
| wyniesiony szeroko | Szeroko na wyjściu |
| tracona prędkość | Tracona prędkość |
| zdjęty gaz (na wejściu albo na prostej) | Zdjęty gaz |
| prawie stanięcie, obrót, uderzenie albo wypadek jako przyczyna | Obrócił się / Uderzył w coś / Rozbił się, gdy zdarzenia okrążenia tam to wskazują (najpierw wypadek, potem obrót, potem uderzenie); w innym razie Prawie się zatrzymał |
| dłuższy lot | Poleciał za daleko |

Dwa wzorce liczą się jako przyczyna w nich zawarta, według tej samej tabeli.
*Oddał za dużo na wejściu, a wyjście nie odzyskało* to błąd przyczyny swojego
wpisu: wczesne hamowanie to *Hamowano za wcześnie*, blokada *Zablokowane koło*,
toczenie się *Toczenie się*, niewykorzystana przyczepność *Za wolno w środku zakrętu*.
*Za szybko na wejściu, wolno na wyjściu* to *Hamowano za późno*, gdy okrążenie
hamowało później niż drugie; w innym razie błąd przyczyny jego wyjścia -
*Spóźniony gaz*, *Buksowanie kół*, *Uciekający tył*, *Szeroko na wyjściu*,
*Wolniejsze wyjście*. Wzorzec, którego przyczyna leży po stronie samochodu albo
w późniejszym przyjeździe, nie jest liczony.

Nie liczy się: wolniejszy przyjazd, start, każde ustalenie *samochodu* (ciąg,
przyczepność, hamulce, napęd) i każdy zysk albo zakręt poziomy.

### Rodzaje i ich kolejność {#the-kinds-in-their-order}

Hamowanie: *Hamowano za późno*, *Hamowano za wcześnie*, *Hamowano za słabo*,
*Zablokowane koło*. Wejście: *Toczenie się*, *Za wolno w środku zakrętu*,
*Za ciasna linia*, *Wypchnięty szeroko*, *Źle obrócony samochód*. Wyjście:
*Spóźniony gaz*, *Wolniejsze wyjście*, *Buksowanie kół*, *Uciekający tył*,
*Szeroko na wyjściu*, *Tracona prędkość*. Prosta: *Zdjęty gaz*. Incydenty:
*Obrócił się*, *Uderzył w coś*, *Rozbił się*, *Prawie się zatrzymał*, *Poleciał za daleko*.

## Sekcja Statystyki trasy {#the-course-statistics-section}

Pokazywana od **3** okrążeń, między **Okrążenia** a **Gdzie się poprawić**.

- **Podsumowanie**: "40 okrążeń 9 samochodów, 3 klasy: każdy oceniony zakręt po
  zakręcie względem najszybszego okrążenia we własnej klasie." (samochody liczone
  według numeru samochodu albo nazwy).
- **Znaczniki klas** (gdy jest kilka klas): **Wszystko** i jeden znacznik na klasę,
  każdy z liczbą okrążeń, w kolejności gry (D, C, B, A, S1, S2, R, X, potem
  inne). Kliknij klasę, by zobaczyć tylko jej okrążenia; **Shift+klik** dodaje
  albo usuwa jedną. Wszystko poniżej - listy, mapa, eksport do mapy cieplnej -
  podąża za wybranymi klasami.
- **Co najczęściej idzie źle**: każdy rodzaj błędu, najpierw ten z największą
  liczbą okrążeń (potem z największą liczbą razy, potem z największym kosztem),
  najwyżej 8 (**Wszystkie N rodzajów** pokazuje resztę, **Mniej** znów je chowa).
  Każdy wiersz: nazwa, "N z M okrążeń", pasek tego udziału i "K razy · około X s ·
  najczęściej w T3 (5), T7 (4), T1 (2)" - jak często wystąpił (okrążenie po zakręcie),
  ile kosztował razem i trzy zakręty, w których najwięcej okrążeń go popełniło.
  **Kliknij wiersz**, by pokazać go na mapie błędów (i ją włączyć); kliknij
  ponownie, by zobaczyć wszystkie błędy.
- **Zakręt po zakręcie** (albo *Zakręt po zakręcie - <błąd>*, gdy jeden jest
  wybrany): dla każdego segmentu "N z M straciło czas · X s" - okrążenia, które
  przejechały cały zakręt, te, które straciły tam **0,05 s** lub więcej względem
  najlepszego z klasy, i cały czas, który straciły. Po zwinięciu pokazuje trzy
  najczęstsze błędy z liczbą okrążeń. **Kliknij zakręt**, by go otworzyć, objąć
  go kamerą i przełączyć na mapę błędów: dla każdego błędu (albo tylko wybranego)
  linia w rodzaju "12 z 40 okrążeń hamowało tu za wcześnie. W 9 różnych
  samochodach - około 0,21 s każde." oraz okrążenia, które go popełniły,
  **najgorsze najpierw**, każde z kosztem - najwyżej 8, "+N więcej" dla reszty.
  **Kliknij okrążenie**, by je zaznaczyć i odtworzyć ten błąd (ustawiony 40 m przed nim).
- **Pokaż na mapie cieplnej**: zobacz niżej. "Budowanie mapy cieplnej…" podczas
  pracy; wyłączone, gdy nie ma błędów.

## Mapa błędów {#the-mistake-map}

**Widok → Mapa błędów** maluje wzdłuż ścieżki wzorcowej, ile okrążeń (z wybranych
klas) popełniło błąd na każdym metrze - każdego rodzaju albo tego wybranego
w statystykach. Każde okrążenie liczy się raz na metr; zasięg każdego wystąpienia
(tam, gdzie była jego przyczyna albo zdarzenie) jest poszerzony o 6 m w obie strony,
żeby krótkie też były widoczne. Szersza i jaśniejsza tam, gdzie więcej okrążeń:
szerokość `3 + 10 · (okrążeń tutaj / najwięcej okrążeń wszędzie)` metrów, kolor od
przygaszonego brązu do jasnej pomarańczy; szary pasek 2 m tam, gdzie nikt nie popełnił
błędu. Legenda: *mało okrążeń ↔ najwięcej okrążeń*.

Przy włączonych **Etykietach** wierzchołek każdego zakrętu niesie jego najczęstszy
błąd: "T3 · 12/40 wczesne hamowanie" (okrążenia, które go popełniły / okrążenia,
które przejechały zakręt), "T3 · 12/40" przy wybranym rodzaju, "T3 · czysto" bez
wybranego. Najechanie na etykietę wypisuje straty zakrętu i jego pięć najczęstszych
błędów; kliknięcie otwiera albo zamyka ten zakręt w statystykach.

## Pokaż na mapie cieplnej {#show-in-the-heatmap}

**Pokaż na mapie cieplnej** przekazuje to samo do zakładki mapy cieplnej jako zbiór
danych o nazwie "Błędy na <tor>" (albo "Błędy na trasie"), więc cały zestaw narzędzi
mapy cieplnej - tryby ciepła, filtry, oś czasu, przekroje - działa na tym, gdzie
okrążenia się mylą.

To CSV budowany w pamięci (`mistakeTable`), jeden wiersz na punkt siatki (co 2 m)
każdego wystąpienia, w **własnej pozycji tego okrążenia** w tym miejscu:

| Kolumna | Zawartość |
|---|---|
| `x`, `y`, `z` | pozycja okrążenia na tym metrze (współrzędne gry) |
| `elapsed` | czas okrążenia tam, s |
| `lap` | etykieta okrążenia |
| `car` | nazwa samochodu (albo "car 1234") |
| `mistake` | nazwa błędu w bieżącym języku |
| `car_class` | klasa, `-` gdy brak |
| `corner` | etykieta zakrętu, `T3` |
| `cost` | koszt wystąpienia, s |

Wczytywane jest przez własny wczytywacz mapy cieplnej z podpowiedziami mapowania:
Y w górę, bez odwracania osi, skala 1; czas `elapsed` w sekundach; **osoba** = `car`,
**grupa** = `mistake`, **sesja** = `lap`; bez kierunku patrzenia; `car_class`,
`corner` i `cost` zachowane jako kolumny filtrów. Zakładka przełącza się wtedy na
**Mapa cieplna** i obejmuje dane. Eksportowane są tylko klasy wybrane w statystykach.

## Trasy z kilku torów {#courses-from-several-tracks}

Okrążenia analizuje się **jedną trasę naraz**. Folder z okrążeniami kilku tras -
cała biblioteka okrążeń - oferuje każdą trasę do wczytania osobno (z jej liczbą
okrążeń, najwięcej najpierw); okrążenia przejazdów, które nigdy się nie skończyły
(`unfinished/` z FH Companion), idą z ich trasą, oznaczone jako *częściowe*.
Okrążenia kilku nazwanych torów wybrane jako pliki są oferowane tak samo, a okrążenia
bez nazwy toru idą z tym, który jest wybrany. Wczytanie okrążeń innego nazwanego toru
niż te już wczytane zastępuje je. Szczegóły:
[Wczytywanie okrążeń](race-loading-laps.md#folders-and-courses).

## Wydajność przy wielu okrążeniach {#performance-with-many-laps}

Kilkadziesiąt okrążeń analizuje się w sekundę albo dwie (zawsze wszystkie). To, co
jest rysowane, jest ograniczone, żeby widok trzymał liczbę klatek:

| Limit | Wartość | Skutek |
|---|---|---|
| okrążenia rysowane domyślnie | 8 (`SHOW_ALL_UP_TO`) | ponad 8 wczytanych okrążeń nowo dodane są ukryte, chyba że są wzorcem, skupionym okrążeniem albo najlepszym ze swojej klasy. **Pokaż wszystkie** rysuje każde okrążenie; **Tylko oglądane** wraca. Skupienie okrążenia odkrywa je i najlepsze z jego klasy |
| zwykłe samochody i cienkie linie | ponad 10 widocznych (`PLAIN_PAST`) | okrążenia inne niż skupione, ścigany samochód i wzorzec: punkt linii co 6 m (zamiast co 1,5 m), samochody rysowane zwyczajnie |
| okrążenia na wykresie | 8 (`CHART_LAPS`) | najpierw skupione, jego najlepsze z klasy i wzorzec; "+N więcej narysowanych, nie na wykresie" |
| karty HUD | 6 | pierwsze sześć widocznych okrążeń |
| statystyki | od 3 okrążeń | sekcja jest ukryta poniżej tego |
| wypisane ustalenia | 12 kierowcy, 8 samochodu/kontekstu, 10 zysków | na skupione okrążenie |
| pokazywane pary samochodów | 3 | ponad 3 pary, jedna para z wyborem |

Wystąpienia błędów są liczone raz przy każdej analizie i zapamiętywane w pamięci
podręcznej; gęstość mapy błędów jest zapamiętywana dla każdego wyboru klas i błędu.

## Dla programistów {#for-developers}

Kod: [`src/race/stats.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/stats.ts),
[`src/ui/race/StatsSection.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/StatsSection.tsx),
`openMistakesInHeatmap` w [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts).
