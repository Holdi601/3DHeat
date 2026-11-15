---
title: "Nagrania Tacview (ACMI)"
parent: "Wczytywanie danych"
nav_order: 7
lang: "pl"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Nagrania Tacview (ACMI)

Tacview to program, który nagrywa loty w symulatorach lotniczych; jego pliki kończą się na `.acmi`. 3DHeat je otwiera, abyś mógł zobaczyć, gdzie leciał każdy samolot.

Nagrania lotów Tacview wczytują się jak każda tabela: wybierz albo upuść `.acmi` (tekstowy, `.txt.acmi`, albo spakowany, `.zip.acmi`) i naciśnij **Wczytaj**. Dostajesz wtedy ciepło wszystkich lotów, a w karcie **Mecz** powtórkę z figurami, śladami i listą zdarzeń ([Powtórka meczu](match-replay.md)). ACMI to publiczny format plików Tacview ([dokumentacja](https://www.tacview.net/documentation/acmi/)); DCS (przez eksporter Tacview), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS i inne zapisują w nim, więc czytnik obsługuje każdy z nich.

## Czym staje się nagranie {#what-a-recording-becomes}

Jeden wiersz za każdym razem, gdy zapisywana jest pozycja obiektu, jeden wiersz na zdarzenie w miejscu obiektu i jeden wiersz, gdy obiekt odchodzi (`Removed`, gdzie był ostatnio). Zdarzenie dotyczące obiektu, którego jeszcze nie widziano - zakładka, wiadomość do wszystkich - jest wierszem obiektu `(recording)` w punkcie odniesienia. Nagranie niesie własne instrukcje odczytu, więc krok mapowania wypełnia się sam. Czytnik zapisuje te kolumny: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, a potem wszelkie dalsze właściwości, jakie ma nagranie. Ich role:

| Kolumna | Rola | Znaczenie |
|---|---|---|
| Time | czas | Sekundy po ReferenceTime nagrania; sekundy Unix, gdy je ma, więc zegar pokazuje prawdziwy czas. |
| X, Y | pozycja | Wschód i północ, w metrach, na płaszczyźnie stycznej do Ziemi w punkcie odniesienia nagrania: odległości i kierunki są w jego pobliżu prawdziwe, a przy 100 km odchylają się o mniej niż promil. Północ staje się światowym -Z. |
| Altitude | pozycja (w górę) | Metry. |
| Object | osoba | Pilot i nazwa obiektu z jego id, np. `Viper 1 (F-16C_50) #a01`; obiekt bezzałogowy `(T-90A) #401`. |
| Coalition | drużyna | Strona (albo kolor, gdy nie ma koalicji). |
| Heading, Pitch | spojrzenie | Stopnie; kurs 0 to północ. |
| Recording | sesja | Tytuł nagrania albo nazwa pliku: kilka nagrań wczytuje się obok siebie bez łączenia ich śladów. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | filtry | Zachowane do filtrowania; Type i Name wybierają [figurę](figures.md) każdego obiektu, Event zasila listę zdarzeń w podsumowaniu, Roll przechyla samolot. |
| U, V | | Płaskie metry świata gry, gdy każda próbka je ma (DCS je zapisuje). |
| EventObjects | filtry | Każdy obiekt, o którym mówi zdarzenie (`Message|a01|b02|...`), po id. |
| RecordingInfo | | Własne właściwości nagrania w chwili zdarzenia - DataSource, DataRecorder, Author, Category, Briefing, Comments, ... - jako JSON. |
| IAS, Mach, AOA, FuelWeight, ... | filtry | Każda inna liczbowa właściwość, jaką niesie nagranie. |
| Parent, CallSign, LockedTarget, Label, Shape, ... | filtry | Każda inna tekstowa właściwość, jaką niesie nagranie; właściwość, której wartość nie jest liczbą, jest tekstem. |

Odczytywane są wszystkie cztery formy pozycji Tacview (`lon|lat|alt`, z `u|v`, z `roll|pitch|yaw` i ze wszystkimi naraz oraz kursem); puste pola zachowują ostatnią wartość; `-id` usuwa obiekt, a id użyte ponownie po nim to nowy obiekt. Obsługiwane są przecinki z ucieczką i kontynuowane wiersze.

Pozycje są zawsze rzutowane z szerokości i długości geograficznej, nigdy nie są brane z U/V, więc nagrania ze wszystkich gier mają jeden rzut z tłem prawdziwego świata.

## Serwery DCS: kto wygrał i jak skończył się każdy wylot {#dcs-servers-who-won-and-how-each-sortie-ended}

Serwer wieloosobowy DCS nagrywa swoje misje przez Tacview przez całą dobę, a trwały serwer PvP prowadzi kampanię przez wiele z nich: strona wygrywa, gdy zajmie każde lotnisko, FARP i strefę drugiej strony, co trwa dni i wymaga wielu restartów misji. Nagrania zawierają loty, nie kampanię: żaden komunikat nie mówi, kto co zajął, lotniska są zapisywane raz na początku, i żaden nie mówi, kto wygrał. Konwerter Tacview (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) dodaje do każdego wiersza to, co da się wiedzieć, a puste zostawia to, czego się nie da - nigdy nie zgaduje.

| Kolumna | Znaczenie |
|---|---|
| `server` | serwer albo kampania, z nagłówka nagrania (jego Title, Author i Comments nazywają znane publiczne serwery - Blue Flag, SPS Contention, Growling Sidewinder; w przeciwnym razie Author, który kogoś nazywa); `--server Name` nadaje nazwę dla całego folderu. Nagranie, którego nagłówek nie nazywa żadnego serwera - Author taki jak `Admin`, Title i Comments, jakich nie pisze żaden znany serwer - pozostaje nieprzypisane: `server` pusty, nawet jeśli pobrano je ze strony nagrań serwera, bo ta strona może zawierać także misje innych społeczności |
| `mission` | Title nagrania bez wersji i miesiąca kampanii: `Operation_Example_V7.7.99` staje się `Operation Example` |
| `campaign` | runda kampanii, do której należy nagranie, według serwera, mapy i numeru: `Example Server North 3`. Jedno nagranie to jedna sesja (od restartu do restartu); runda trwa przez wiele sesji, dni lub tygodni |
| `round` | numer tej rundy: ten serwera, jeśli go publikuje, w przeciwnym razie n-ta widziana runda tego serwera i tej mapy; z pliku rund (niżej), bez niego pusty |
| `session` | miejsce nagrania wśród sesji rundy, 1, 2, ...; `sessionStart` jej prawdziwy początek (sekundy Unix) |
| `heldRed`, `heldBlue` | sporne miejsca, które każda strona utrzymywała na początku sesji, z łańcuchowego pliku rund (niżej) |
| `won`, `matchWon` | 1, gdy strona wiersza (jego Color, Red lub Blue) wygrała tę kampanię, 0, gdy przegrała; puste tam, gdzie żaden plik rund nie nazywa zwycięzcy, i w wierszach neutralnych. Kampania jest jednocześnie rundą i meczem, więc obie kolumny mają tę samą wartość |
| `roundEndReason` | `capture` dla kampanii wygranej przez zajęcie wszystkiego |
| `won`, `matchWon` w każdej sesji rundy | wynik rundy, zapisany w każdym jej nagraniu, gdy tylko jej koniec jest znany |
| `sortie` | w wierszach samolotu: jego lot, 1, 2, ... od startu do startu; czas na ziemi przed pierwszym startem i po lądowaniu liczy się do lotu, do którego należy |
| `sortieResult` | jak ten lot się skończył: `landed`, `landed damaged` (po trafieniu w powietrzu), `ejected`, `shot down`, `destroyed` (na ziemi), `crashed`, `despawned` (zniknął w powietrzu bez widocznej przyczyny - gracz, który wychodzi), `airborne at end`, `no takeoff` |
| `sortieKills` | zestrzelenia przypisane samolotowi w tym locie |

Na trwałym serwerze to wylot jest jednostką, która coś znaczy: filtruj po `sortieResult` = `shot down`, żeby zobaczyć, gdzie tracono loty, albo rozbij ciepło według `sortieResult` lub `server` w [zestawieniu](breakdown.md). Starty, lądowania, katapultowania, zestrzelenia i rozbicia, z których się składa, to zdarzenia, które konwerter wyprowadza z tego, jak poruszają się samoloty (wyżej).

Miejsca zajęte między dwiema sesjami rundy - znane z pliku rund, niżej - są zdarzeniami `capture` na początku późniejszego nagrania: `Object` `(campaign)`, w tym miejscu, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Lotnisko lub FARP, które zmienia stronę tam, gdzie nagranie to pokazuje - zapisane ponownie w drugim kolorze albo usunięte i w ciągu pięciu minut zapisane ponownie w swoim miejscu w drugim kolorze - staje się zdarzeniem `capture` przy lądowisku: `Event` = `capture`, `Airfield` jego nazwa, `Detail` `Red to Blue`, `Coalition` jego nowa strona. Lądowisko zapisane po raz pierwszy w jakimś kolorze nie jest przejęciem. Serwery sprawdzone do tej pory zapisują swoje lądowiska tylko raz, więc ich nagrania nie zawierają przejęć.

### Pliki rund {#rounds-files}

Plik rund podaje dla każdego serwera jego rundy kampanii, kto je wygrał i sesje każdej z nich. Pochodzi z tego, co serwer publikuje, albo z samych nagrań (niżej).

Kto wygrał kampanię, publikuje serwer - dziennik kampanii na swojej stronie internetowej -, nie ma tego w nagraniu. Niesie to plik rund, a konwerter czyta go przez `--rounds file.json` (można podać więcej niż jeden):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Nagranie należy do tych rund swojego `server`, których `title` (wyrażenie regularne) pasuje do jego Title; każdy wiersz należy do rundy, w którą wypada jego prawdziwy czas - RecordingTime nagrania plus sekundy wiersza, nie data misji w grze. Czasy są w UTC. Runda bez zwycięzcy (zmieniona, wciąż trwa) daje swoim wierszom numer rundy i pusty wynik.

Odpowiednik w dokumencie meczu, stopka `acmi`, mówi, skąd pochodzi wynik, tak jak `result.source` w meczu War Thunder: `outcome.result` to `{ winner, round, endReason, source }`, gdzie `source` to `source` pliku rund albo `null`, gdy nic nie nazwało zwycięzcy. `outcome` wymienia też rundy nagrania, jego przejęcia i jego wyloty według tego, jak się skończyły:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Wiersz pilota `Viper 1 (F-16C_50) #a01` po stronie niebieskiej w tej kampanii brzmi wtedy: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Rundy z samych nagrań {#rounds-from-the-recordings-themselves}

Trwały serwer zachowuje kampanię między restartami, a każde nagranie zaczyna się od jednostek naziemnych i obiektów statycznych obu stron tam, gdzie zostawiła je kampania. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` czyta pierwsze minuty każdego nagrania ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), ustawia w kolejności czasu nagrania każdego serwera z jednej mapy i łączy je w łańcuch:

- **Miejsca**: teren w komórkach o boku około 2 km; komórka należy do strony, gdy trzy czwarte jednostek w niej na początku sesji jest jej. Miejsca *sporne* to te, które widziano w rękach obu stron.
- **Przejęcia**: miejsce, które na początku następnej sesji trzyma druga strona - zajęte między misjami albo w trakcie wcześniejszej.
- **Nowa runda**: sesja, której miejsca różnią się od miejsc poprzedniej w ponad 60 % - początkowy układ nowej rundy, a nie krok starej. Runda kończy się też, gdy serwer przechodzi na inną mapę (jej sesje zaczynają się po ostatniej i trwają dalej).
- **Kto wygrał**: w zakończonej rundzie strona, która na początku jej ostatniej sesji trzymała każde miejsce (`capture`, pewność wysoka), w przeciwnym razie strona, która trzymała więcej spornych miejsc (średnia przy dwa razy większej liczbie niż druga, w przeciwnym razie niska; niska, gdy runda skończyła się zmianą mapy). Otwarta runda nie ma zwycięzcy, ale każda sesja mówi, ile miejsc trzymała każda strona na jej początku, więc widać, kto prowadził.
- Serwer, którego wszystkie sesje zaczynają się tak samo, nie zachowuje stanu między nimi: nie jest łączony w łańcuch.

Początek ostatniej sesji może być wiele godzin przed końcem rundy, dlatego pewność ma znaczenie. Sprawdzone na serwerze, który publikuje swoich zwycięzców: łańcuch znalazł każdą nową rundę w sesji, w której zaczynała się opublikowana runda, a strona prowadząca przy ostatnim początku była opublikowanym zwycięzcą w każdej z 9 rund, które dało się sprawdzić. `--official file.json` zachowuje opublikowane rundy takiego serwera i dodaje do nich sesje z łańcucha; `validation` w pliku mówi, na ile łańcuch się zgadzał. W zmyślonej kampanii:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Oglądanie rundy kampanii jako serii {#watching-a-campaign-round-as-a-series}

Wczytaj razem nagrania jednej rundy - pliki z tą samą `campaign` - a przeglądarka odtworzy je jako jedną serię: sesja po sesji w ich prawdziwej kolejności, a godziny czy dni między dwiema sesjami skrócone do minutowej przerwy. Oś czasu zaznacza początek każdej sesji na żółto, a przerwy jako ciemne pasy, a zegar mówi, która sesja jest odtwarzana, i podaje jej prawdziwą datę (`session 4/12 · 2026-11-02 12:38 UTC`). Ciepło, powtórka, filtry i Wnioski działają na całą serię jak na wszystkie wczytane dane. Sekcja **Runda kampanii** w karcie Mecz wymienia sesje z ich datami, ile spornych miejsc trzymała każda strona na każdym początku - także jako wykres w ciągu rundy - i ile zajęto przed nim; kliknięcie przenosi do początku sesji. Nagranie wczytane samodzielnie mówi tam, którą rundą i sesją jest. Nagrania różnych rund wczytane razem nie są serią: każde zaczyna się od zera, jak osobne mecze. Wczytywanie wielu meczów (**Wiele meczów naraz**) też odtwarza rundę jako serię, strumieniowo i w rozmiarze dopasowanym do GPU, dla rund o wielu gigabajtach.

Miejsca, które w trakcie rundy przeszły z rąk do rąk, są rysowane na mapie jako strefy przejęcia, w kolorze strony, która trzymała każde z nich na początku odtwarzanej sesji, i zmieniają się na granicach sesji; każda zmiana jest przejęciem na liście zdarzeń powtórki. Są wyliczane z wczytanych wierszy - jednostek naziemnych i obiektów statycznych każdej sesji w jej pierwszych minutach, w komórkach około 2 km, tak jak robi to łańcuch - więc wymagają pełnego wczytywania (wczytywanie wielu meczów zachowuje za mało z każdego wiersza).

**Wczytywanie całej rundy z jednego z jej nagrań.** W zwykłej przeglądarce internetowej przeglądarka 3DHeat nie może otwierać plików, których nie wybrałeś: wczytaj pliki rundy razem. Gdy udostępnia ją lokalny serwer przeglądarki (`npm run dev` albo `npm run preview`), może: dodaj do ignorowanego przez git pliku `tools/local-data.json` wpis `campaigns`, który podaje folder plików rund i foldery przekonwertowanych nagrań, a sekcja Runda kampanii pojedynczego nagrania zaproponuje **Wczytaj całą rundę**, pobierze znalezione tam sesje rundy i wczyta je przez wczytywanie wielu meczów:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Udostępniane są tylko nagrania, które wymienia plik rund (`tools/campaign-files.mjs`); sesja, której nie ma w tych folderach, jest liczona, a nie wczytywana.

Co publikują znane serwery:

| Serwer | Runda | Jak strona wygrywa | Gdzie można odczytać zwycięzcę |
|---|---|---|---|
| SPS Contention | kampania na jednej mapie i w jednej epoce (dni), przez wiele restartów | zajęte każde lotnisko, FARP i twierdza; kampania zakończona bez zwycięzcy została zmieniona na następną | publiczny dziennik kampanii serwera (zwycięzca, początek, koniec każdej kampanii) |
| Blue Flag | runda kampanii przez wiele 5-godzinnych misji; `_YYYY_MM` w Title przesuwa się o miesiąc przy każdym restarcie | zajęta każda pozycja wroga; starsze rundy wskazywały stronę, która po ustalonym czasie trzymała więcej | nie opublikowano w żadnej dotąd znalezionej formie; łańcuch nagrań śledzi każdą rundę i to, kto ile trzyma na każdym początku |
| Growling Sidewinder | jedno uruchomienie (6 godzin) misji otwartego konfliktu | zajęte strefy i lotniska | jego strona statystyk pokazuje pilotów, nie wyniki; każda sesja zaczyna się tak samo, więc żadna runda nie obejmuje wielu sesji: puste |
| Misje przeciw SI (misje zajmowania stref) | jedno uruchomienie misji | strona graczy przeciw SI misji: brak wyniku PvP | puste |
| Nieprzypisane (nagłówek nie nazywa serwera) | - | - | puste, `server` też pusty |
