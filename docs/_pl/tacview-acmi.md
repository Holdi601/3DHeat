---
title: "Nagrania Tacview (ACMI)"
parent: "Wczytywanie danych"
nav_order: 7
lang: "pl"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
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
