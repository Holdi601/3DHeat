---
title: "Mapowanie kolumn"
parent: "Wczytywanie danych"
nav_order: 2
lang: "pl"
source: "column-mapping.md"
source_hash: "9d5e1f5e0c62"
translated: true
outdated: false
---

# Mapowanie kolumn

Plik to tabela, a 3DHeat musi wiedzieć, która kolumna zawiera położenie wschód-zachód, która
czas, która imię gracza i tak dalej. Ten panel mówi, co program zgadł, i pozwala poprawić błędne
zgadnięcie.

![Panel Mapowanie kolumn po wczytaniu pliku Parquet: wszystkie pola już wypełnione - 1 X, 2 Y, 3 Z, 4 Czas, 5 Identyfikator osoby, 6 Sesja / mecz, 7 Drużyna / grupa](../assets/img/en/column-mapping-panel.webp)

*Plik sam nazwał swoje kolumny, więc każde pole jest już wypełnione.*

Na przykład CSV z nagłówkiem `x,y,z,t,player,team` mapuje się sam: x, y i z stają się położeniem,
`t` czasem, `player` [osobą](glossary.md), a `team` [grupą](glossary.md).

Po wybraniu plików pod panelem Źródło otwiera się panel **Mapowanie kolumn**. Mówi, która kolumna
pełni jaką rolę. Jest wypełniany automatycznie i każde pole można zmienić przed naciśnięciem
**Wczytaj**; mapowanie jest odczytywane w chwili wczytania, więc zmiana po fakcie wymaga wczytania
ponownie.

## Pola {#the-fields}

Wszystkie menu kolumn wypisują każdą kolumnę pierwszego pliku oraz *- brak -*.

| Pole | Rola | Uwagi |
|---|---|---|
| **Separator** | Tylko CSV: znak rozdzielający pola. | Menu: *Przecinek ,*, *Średnik ;*, *Tabulator*, *Kreska pionowa \|*, *Spacja*; albo wpisz dowolny pojedynczy znak w *lub wpisz jeden znak*. Wykrywany automatycznie (zobacz niżej). Zmiana uruchamia automatyczne mapowanie od nowa, więc wcześniejsze poprawki przepadają. |
| **X**, **Y**, **Z** | Położenie. | Wymagane są co najmniej dwie; niezmapowana trzecia oś to 0 (dane leżą na płaszczyźnie). Ta sama kolumna na dwóch osiach to błąd. |
| **Oś pionowa w źródle** | Która oś źródła wskazuje w górę. | *Z to góra (większość silników gier)* albo *Y to góra (konwencja grafiki)*. Zobacz [Osie, jednostki i czas](axes-units-and-time.md). |
| **Skala jednostek** | Mnoży każde położenie. | Przyciski *1 (m)* i *0,01 (cm→m)*, albo wpisz wartość. |
| **Odwróć X / Odwróć Y / Odwróć Z** | Neguje oś źródła. | Stosowane do położeń i do wektorów kierunku patrzenia. |
| **Czas** | Oś czasu. | Opcjonalne. Bez niego nie ma osi czasu. |
| **Jednostka czasu** | Jak czytać kolumnę czasu. | Siedem jednostek; zobacz [Osie, jednostki i czas](axes-units-and-time.md#time). Ignorowane dla kolumn Parquet `TIMESTAMP`/`DATE`, co panel mówi. |
| **Identyfikator osoby** | Kogo albo czego dotyczy wiersz. | Opcjonalne. Umożliwia ścieżki, czasy życia, nakładkę pudełkową i ciepło liniowe. |
| **Sesja / mecz** | Do którego meczu, rajdu, rundy, przejazdu albo okrążenia należy wiersz. | Opcjonalne. Położenia nigdy nie są interpolowane, nie ciągną śladu i nie są łączone w trasę przez zmianę sesji. Zobacz [Sesje, osoby i grupy](sessions-persons-groups.md). |
| **Drużyna / grupa** | Dowolna kolumna o małej liczbie wartości. | Opcjonalne. Steruje kolorami grup, ciepłem drużyn i podziałem różnicy według grup. |
| **Kierunek patrzenia** | *Brak*, *Kolumny odchylenia / pochylenia* albo *Kolumny wektora kierunku*. | Z odchyleniem/pochyleniem: **Odchylenie**, **Pochylenie** i **Jednostka kąta** (*Stopnie* / *Radiany*). Z wektorem: **Kierunek X**, **Kierunek Y**, **Kierunek Z**. Używane do promieni patrzenia [nakładki pudełkowej](box-replay.md). |
| **Zachowaj do filtrowania** | Dodatkowe kolumny trzymane w pamięci. | Pole wyboru przy każdej kolumnie, a dla każdej zaznaczonej *zakres* (liczbowa) albo *kategoria*. Każda kosztuje 4 bajty na wiersz i przebieg dekodowania przy wczytywaniu. Tylko zachowane kolumny mogą być [filtrowane](filters.md), użyte do [podziału różnicy](difference.md) albo jako kolumna zdarzeń [ciepła liniowego](line-heat.md). |
| **Pokaż przykładowe wiersze** | Tabela pierwszych 12 próbkowanych wierszy, wszystkie kolumny. | Do sprawdzania zgadnięć. |

Zaznaczona kolumna filtra, która nie ma jawnie ustawionego typu, jest czytana jako *zakres*; kolumna
identyfikatora wyglądająca na liczbową bywa bardziej przydatna jako *kategoria*. Naraz może być aktywnych
tylko 4 filtry ([Filtry](filters.md)).

## Jak działa automatyczne mapowanie {#how-the-auto-mapping-guesses}

Zgadywanie jest w [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts).
Patrzy na nazwy kolumn, na to, które kolumny są liczbowe w próbkowanych wierszach (ponad 90% niepustych
wartości daje się przeczytać jako liczby), na to, ile różnych wartości ma każda kolumna w próbce, oraz na
typy logiczne Parquet. Wzorce nazw są próbowane po kolei, bez względu na wielkość liter, i wygrywa pierwszy
wzorzec, który pasuje do jakiejkolwiek wolnej kolumny.

### Położenie {#position}

| Oś | Wzorce nazw, po kolei (tylko kolumny liczbowe) |
|---|---|
| X | `x`, `…_x` / `… x`, `pos…x`, `x…pos`, `loc…x`, `lon…`, `longitude` |
| Y | `y`, `…_y`, `pos…y`, `y…pos`, `loc…y`, `lat…`, `latitude` |
| Z | `z`, `…_z`, `pos…z`, `z…pos`, `loc…z`, `…alt…`, `…height…`, `…elev…` |

Jeśli oś wciąż jest pusta, wypełniają ją po kolei pierwsze wolne kolumny liczbowe (z pominięciem `filename`,
`level`, `year`, `month`, `day`, `hour`, `location`). Błędne zgadnięcie widać od razu na ekranie; pusta
oś zostawiłaby pusty widok.

### Czas {#time}

- **Najpierw kolumny znaczników czasu Parquet.** Spośród kolumn, których typ logiczny to `TIMESTAMP` albo
  `DATE`, najlepsza wybierana jest według wyniku: +10 000, gdy nazwa pasuje do wzorca czasu, -5 000 za zwykłe
  `DATE`, plus liczba różnych wartości w próbce. Data całego dnia i stały początek sesji mają prawie zero
  różnych wartości, więc wygrywa moment zdarzenia. Jednostką jest wtedy *znacznik czasu Unix (ms)*.
- **Potem po nazwie:** `time`, `timestamp`, `ts`, `…event…time…`, `…time…stamp…`, `t`, `…date…time…`, `when`,
  `tick`, `…frame…`, a następnie nazwy czasu, który upłynął (`gdur`, `g_duration`, `…duration…`, `…elapsed…`,
  `…match time…`, `…round time…`, `…game time…`, `…minute from start…`, `…since start…`, `age`). Jednostkę
  zgaduje się wtedy z wartości: ISO-8601, gdy wartość wygląda jak `RRRR-MM-DDT…` albo `RRRR-MM-DD …`; w innym
  razie według największej wielkości: powyżej 10^17 nanosekund, powyżej 10^14 mikrosekund, powyżej 10^11 milisekund
  Unix, powyżej 10^8 sekund Unix, powyżej 10^6 milisekund, w przeciwnym razie sekundy.

Gdy wybrana jest kolumna czasu, który upłynął, panel zaznacza, że każda sesja jest wtedy wyrównana do własnego
początku - dobre do nakładania meczów, nie do oglądania ich w prawdziwej kolejności.

### Sesja, osoba, grupa {#session-person-group}

Sesja jest przydzielana **po** osi czasu i **przed** osobą i grupą, bo kolumna sesji bywa znacznikiem czasu
(moment początku meczu w każdym wierszu meczu).

| Rola | Wzorce nazw, po kolei |
|---|---|
| Sesja | `session` / `session_id`, `match…`, `round…`, `raid…`, `game…`, `run…`, `replay…`, `instance…`, `lap…`, `stint…` (każde dokładnie, opcjonalnie z `_id`) |
| Osoba | `name`, `…player…id/name…`, `…user…`, `…account…`, `persona…`, `…character…`, `victim`, `actor`, `…puuid…`, `…steam id…`, `subject…`, potem `driver` / `driver_id` / `driver_name`, `car` / `car_id` / `car_name` (dane wyścigowe: to samochód się porusza) |
| Grupa | `spawn_team`, `real_team`, `team` / `team_id` / `team_name`, `squad…`, `side`, `…faction…`, `clan…`, `party…`, `alliance…`, `car_class` |
| Grupa, zapasowo | `…victim_ai…`, `…killer_ai…`, `…is_ai/bot/npc…`, `target_type`, `survived`, `outcome`, `result`, `event_env`, `playtest_id` |

Kandydat na grupę, który przyjmuje różną wartość w większości próbkowanych wierszy (więcej niż max(48, 60% próbki)),
jest identyfikatorem, a nie grupą: staje się kolumną osoby, jeśli żadnej nie znaleziono, i nie jest używany jako
grupa. Jeśli nie znaleziono żadnej kolumny grupy, używana jest kolumna nieliczbowa z najmniejszą liczbą różnych
wartości od 2 do 12.

### Kierunek patrzenia {#look-direction}

Kolumna liczbowa o nazwie `yaw`, `…rot…yaw…`, `…heading…`, `azimuth…`, `…view…yaw…` albo `rot_z` / `rotation_z`
przełącza kierunek patrzenia na odchylenie/pochylenie; pochylenie szuka się jako `pitch`, `…rot…pitch…`,
`…elevation…angle…`, `…view…pitch…`. Zakłada się stopnie, gdy którekolwiek próbkowane odchylenie przekracza 7
co do wielkości, w przeciwnym razie radiany. Wektora kierunku nigdy nie zgaduje się; pochodzi on ze wskazówek
poniżej albo od ciebie.

### Kolumny filtrów {#filter-columns}

Automatycznie zachowuje się najwyżej **6** kolumn, uszeregowanych:

1. `region`, `sessionMode`, `actor` - kolumny, które istnieją po to, by na nich filtrować (wynik 1200);
2. kolumny kategorii, które zmieniają się w próbce, mniej różnych wartości najpierw (1000 minus liczba);
3. kolumna stała w próbce, ale tylko gdy wczytano kilka plików - może różnić się między plikami, jak region albo
   identyfikator przebiegu testowego (600);
4. kolumny liczbowe (500).

Kolumny, które już pełnią rolę, wymienione wyżej nazwy szumu, kolumny stałe przy wczytaniu jednego pliku i kolumny
tekstu swobodnego (ponad max(16, połowa próbki) różnych wartości) nie są oferowane automatycznie. Każdą kolumnę
nadal można zaznaczyć ręcznie.

### Oś pionowa {#up-axis}

Gdy wszystkie trzy osie są zmapowane, za pionową przyjmuje się oś o mniejszym rozrzucie Y i Z w próbce (mapa jest
znacznie szersza niż wysoka); w przeciwnym razie zakłada się Z w górę.

## Wskazówki `heat3d` w stopce Parquet {#the-heat3d-hints-in-a-parquet-footer}

Plik Parquet może powiedzieć, jak ma być czytany. Jeśli metadane klucz/wartość w stopce pliku mają wpis o kluczu
**`heat3d`**, jego wartość jest parsowana jako JSON i nakładana na zgadywania ([`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)).
Konwerter demo CS2 zapisuje taki wpis, więc jego tabele otwierają się z graczem jako osobą, stroną jako grupą,
każdą rundą jako sesją, włączonym kierunkiem patrzenia i światem ustawionym jak trzeba.

Wskazówki czyta się tylko z **pierwszego** pliku wyboru. Każdy wpis jest opcjonalny, a każda wskazana wartość nadal
pojawia się w panelu i można ją zmienić. Pełny opis schematu, z przykładem i sposobem zapisu, jest w
[Opisie formatów danych](data-formats.md#the-heat3d-hints).

Zasady, krótko:

- Kolumna nazwana we wskazówce jest stosowana tylko wtedy, gdy plik ma tę kolumnę.
- `lookMode: "vector"` działa tylko, gdy ustawione są `dirX`, `dirY` i `dirZ`; `"yawPitch"` tylko, gdy ustawione jest `yaw`.
- `extra`, gdy jest obecne, zastępuje automatyczną listę filtrów (nieznane nazwy i kolumny, które już pełnią rolę,
  są odrzucane); typ zakres/kategoria każdej z nich zależy od tego, czy wyglądała na liczbową. Gdy brak, automatyczna
  lista zostaje, bez kolumn, którym wskazówka nadała rolę.
- `axes.up` musi być `"y"` albo `"z"`, odwrócenia muszą być wartościami logicznymi, `scale` musi być dodatnie.
- `entity.size`, gdy jest dodatnie, to rozmiar jednej śledzonej rzeczy w jednostkach pliku ([rozmiar obiektu](sessions-persons-groups.md#entity-size));
  to jedyny sposób, by go ustawić.

## Znany problem: nadpisanie separatora CSV {#known-issue-overriding-the-csv-separator}

Gdy zmienisz separator na inny niż wykryty, lista kolumn i przykładowe wiersze się nie zmieniają (podgląd nadal
dzieli według wykrytego separatora). Wybrany separator jest nadal używany do samego wczytania. Jeśli wykryty
separator jest błędny:

1. Otwórz plik w edytorze tekstu.
2. Zamień separator na przecinek wszędzie (a przecinki dziesiętne na kropki).
3. Zapisz, a potem wczytaj plik ponownie.

Przyczyna leży w [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts).
