---
title: "Zgodność z Tacview"
parent: "Powtórka meczu"
grand_parent: "Replay"
nav_order: 1
lang: "pl"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Zgodność z Tacview

Tacview to popularny program do oglądania nagrań lotów. Jeśli go znasz, ta strona pokazuje, gdzie w 3DHeat jest każde z jego narzędzi.

Wymienia każdą funkcję Tacview 1.9 (jego podręcznik, tabelę tekstów interfejsu i format pliku ACMI 2.2) i to, na jakim etapie jest [powtórka meczu](match-replay.md) w 3DHeat. Cel: wszystko, co Tacview potrafi zrobić z powtórką i jej danymi, 3DHeat też ma móc zrobić.

**Stan:**
- **done**: już jest w 3DHeat.
- **new**: zbudowane, żeby odpowiadać funkcji Tacview.
- **not yet**: dotyczy, ale nie zbudowane.
- **n/a**: nie dotyczy tutaj, z powodem.

Gdzie szukać funkcji: karta **Mecz**, **Powtórka z figurami** (albo **Nałożone figury** w karcie Heatmap), w sekcjach paska bocznego **Powtórka**, **Jednostki**, **Zdarzenia**, **Zakładki**, **Wyświetlanie taktyczne**, **Statystyki**, **Przesunięcie w czasie i przycinanie**, **Mapa i pozycja**, **Dźwięk i wideo** i **Etykiety**. Zob. [Powtórka meczu](match-replay.md).

## Kamery {#cameras}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Widok z kokpitu (F5), horyzont obraca się z samolotem | **Kokpit**: z jednostki wzdłuż jej postawy, tak jak ma to model ruchu. Własna figura jednostki jest odcinana. Przeciągnij, by się rozejrzeć; **Znów patrz do przodu** resetuje. | new |
| HUD w widoku z kokpitu (wybór IAS/CAS/TAS) | **Wyświetlacz HUD** (H): horyzont i drabinka pochylenia rzeczywistego widoku, znacznik toru lotu, taśma kursu, IAS, wysokość, TAS, Mach, G, kąt natarcia, prędkość pionowa, AGL | new |
| Trójwymiarowe przyrządy kokpitu, śledzenie głowy pilota (PilotHead*), TrackIR | Brak modeli kokpitów; kąty głowy są pokazane w widoku **Surowe** karty jednostki | n/a (brak modeli kokpitów; sprzęt do śledzenia głowy służy do lotów na żywo) |
| Widok zewnętrzny (F6): krążenie wokół głównego obiektu | **Pościg** (obraca się razem z jednostką) i **Orbita** (zachowuje swój własny kierunek) | done |
| Kamera dogfight, „Look at target” (padlock) | **Padlock**: z kokpitu, utrzymywana na celu | new |
| Kamera dogfight, „Centered” / „Look forward” | **Cel**: za jednostką, na linii od celu, patrząc za nią na cel. **Stała** przy azymucie 0 patrzy do przodu z przodu. | new |
| Zamiana głównego i drugiego obiektu | **Zamień** obok celu | new |
| Widok satelitarny (F7), rzut ortogonalny z góry | **Satelita**: prosto w dół na jednostkę, północ u góry; przeciągnij, by obrócić. Mapa 2D to rzut ortogonalny planu. | new |
| Kamera swobodna (F8), W/A/S/D, E/C | Swobodna kamera lotu (W/A/S/D, Spacja/Q, Shift/Alt) | done |
| Dodatek Head-On camera; kamera zewnętrzna przypięta do obiektu | **Stała**: miejsce wokół jednostki, które obraca się i przechyla razem z nią; przeciągnij, by je przesunąć (z tyłu, na końcówce skrzydła, z przodu) | new |
| Dodatek Lock Camera (zamrożenie pozycji) | Stop following (Esc): kamera zostaje tam, gdzie była | done |
| Widok strategiczny (oddalenie do całej Ziemi) | [Tło świata](world-backdrop.md) i ramka całego nagrania w mapie 2D | done |
| Ustawienie pola widzenia | **Kamera i scena** FOV | done |
| Przełączanie widoków klawiszami | **V** następny widok, **Shift+V** poprzedni | new |

## Widok 3D i opcje wyświetlania {#d-view-and-display-options}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Smugi wstążkowe, suwak długości | Smugi (w sekundach) w przeglądarce drużyny | done |
| Smuga wyprzedzająca (tor przed nią) | **Tor przed nią**: dokąd jednostka naprawdę jedzie w najbliższych sekundach | new |
| Linie wysokości obiektu / ściany | **Linie pionowe** | done (linie; ścian nie zbudowano) |
| Wektory obiektu wybranego: kurs (kropkowany), trasa (ciągły), siła nośna | **Wektory prędkości** (trasa i prędkość przez tyle sekund, z podpowiedzią) oraz **Linie dziobu i siły nośnej** (dziób przerywany, siła nośna krótka i ciemna) | new |
| Linia widzenia pilota | **Linia wzroku pilota**: przerywana cyjanowa linia wzdłuż PilotHeadYaw/PilotHeadPitch (albo kolumny HeadYaw, ViewYaw lub LookYaw) względem osi jednostki | new |
| Śmiercionośne strefy SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, bliźniaki „2”) | **Strefy rażenia**: kopuły, owalne tam, gdzie zasięg pionowy jest inny; wyłączone, dopóki EngagementMode to 0 | new |
| Namierzenia radarowe (LockedTarget..9) z etykietami | **Namierzenia**: czerwone linie do każdego namierzonego obiektu; przerywane bursztynowe do FocusedTarget; wzdłuż LockedTargetAzimuth/Elevation/Range, gdy żaden obiekt nie jest wskazany. **Etykiety namierzeń**: nazwa celu i zasięg przy każdej linii namierzenia | new |
| Stożek radaru (RadarMode, Azimuth, Elevation, Roll, Range, szerokości wiązki) i bramka zasięgu | **Stożki radaru**: obwód i środkowy pierścień wiązki obróconej o azymut, elewację i przechył względem jednostki; bramka zasięgu jako dwa żółte obwody. Bez szerokości wiązki tylko oś wiązki. | new |
| Linia widzenia między dwoma wybranymi obiektami (zielona / czerwona przerywana, gdy teren je zasłania) | Linia zmierzonej pary zmienia kolor na czerwony i staje się przerywana, gdy między nimi jest poziom | new |
| Automatyczne powiększanie odległych obiektów | Najmniejsza figura na ekranie (piksele) | done |
| Siatka szerokości i długości geograficznej | **Mapa i pozycja → Siatka**: linie szerokości i długości na terenie pod kamerą, w okrągłym odstępie zależnym od wysokości (od 10° do 1'), podpisane; albo kilometrowa siatka **MGRS** strefy UTM z oznaczeniem strefy i kwadratu 100 km. Dotychczasowa siatka mapy 2D bez zmian | new |
| Pierścienie bullseye | Pierścienie wokół bullseye każdej drużyny na mapie 2D | new (tylko 2D) |
| Nakładka ścieżki schodzenia | **Ścieżki schodzenia**: ścieżki 3° z pełnoskalowymi krawędziami ±0,7° na obu końcach każdego pasa w pobliżu nagrania, z zmierzonych progów i wysokości OurAirports (pobrane raz, trzymane offline), znacznik przy każdej mili morskiej, nazwany lotniskiem i pasem | new |
| Ograniczenia wysokości (alarm pułapu i dolnej granicy) | **Ograniczenie wysokości**: dolna i górna granica; etykiety jednostek poza nimi stają się czerwone, a każde przekroczenie (poniżej dolnej, powyżej górnej, z powrotem w środku) jest wypisane — kliknięcie tam jedzie i podąża za jednostką | new |
| Zniszczone obiekty szare, usuwane po 15 min | Życie kończy się wraz z jego śladem; martwa jednostka jest przyciemniona na liście jednostek | done |
| Właściwości Visible / Disabled | Pokazane w **Surowe**; nic przez nie nie jest ukrywane | not yet |
| Wyświetlanie pozycji drążka, przepustnicy i pedałów | Przepustnica i wartości silnika w polach; wejścia sterowania w **Surowe** | done (jako wartości) |
| Komentarze jako napisy | **Wiadomości jako napisy** (Labels): zdarzenia ACMI Message i Comment oraz czat z każdej gry (zdarzenia Chat, Say lub Radio albo kolumna czatu), na dole widoku z nazwiskiem nadawcy, przez sześć sekund | new |
| Wyświetlanie daty i czasu UTC | Zegar osi czasu z UTC, gdy nagranie ma czas odniesienia | done |
| Pozycja myszy w szer./dł., MGRS, bullseye | Karta punktu (kliknięcie punktu) podaje szerokość/długość w stopniach, minutach i sekundach oraz MGRS obok metrów świata; bullseye dla każdej jednostki (pole) | new |
| Własne logo | Nie zbudowane | n/a (branding) |
| Modele 3D, najbliższy, gdy nieznany | Własny katalog figur, najbliższy odpowiednik, prawdziwy rozmiar | done |
| Wiele zaangażowań (linie między wszystkimi parami) | **Linie starć**: od każdej jednostki w zakresie do każdego przeciwnika w ustawionym zasięgu (1–200 km), każda z jej zasięgiem, najbliższe 60 par; zmierzona para jak dotąd | new |

## Etykiety {#labels}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Etykiety włączone/wyłączone osobno dla wybranych i niewybranych obiektów | **Etykiety** z regułami dla **Zaznaczone**, **Samoloty**, **Naziemne**, **Okręty**, **Uzbrojenie** i **SI**: pokazane lub nie, własne wartości, priorytet | new |
| Pola etykiety: nazwa, znak wywoławczy, pilot, prędkości (TAS/CAS/IAS/Mach/GS), wysokości (ASL/AGL), VS, AOA, AOS, G (pionowe, boczne, wzdłużne), prędkość i promień zakrętu, energia, paliwo (masa/objętość/przepływ), kurs/tor, przechył/pochylenie, tętno | Każda wartość z `fields.ts`: ta sama lista, obliczana tam, gdzie nie była zapisana (oznaczone ~). Prędkość przechyłu i SpO2 tylko przez Raw. | done |
| Pozycja bullseye w etykietach | Pole **Bullseye (namiar / odległość)** | new |
| Odchylenia ILS, przebyty dystans | Wartości surowe; przebyty dystans w statystykach | done (częściowo) |
| Odciążanie niewybranej telemetrii | **Rozsuwaj etykiety**, uporządkowane według priorytetu każdej reguły | done / new |
| Etykiety wszystkich obiektów naziemnych / tylko zagrożeń | Reguły Ground i AI | new |
| Skala etykiet | **Rozmiar etykiet** (60–250 %) | new |
| Jednostki metryczne / imperialne | Metryczne / imperialne | done (dwa ustawienia, nie osiem) |

## Informacje o obiekcie i telemetria {#object-info-and-telemetry}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Wybór podstawowy i drugorzędny | Kliknięcie podąża i zaznacza; shift-klik dwóch mierzy; wybór **Cel** | done / new |
| Zasięg / namiar / aspekt / zbliżanie między dwoma obiektami | Linia BRAA zmierzonej pary; pola Range, Bearing, Aspect i Closure z śledzonej jednostki | done |
| Namiar względny, prędkość kątowa linii widzenia | Pola **Namiar względny** (od dziobu śledzonej jednostki, L/P) i **Prędkość kątowa linii widzenia** (°/s) | new |
| Okna telemetrii | Karta jednostki i karta po najechaniu | done |
| Surowa telemetria (każda zapisana właściwość, także nieznane) | **Surowe** na karcie jednostki: każda kolumna w wierszu jednostki, tak jak zapisana | new |
| Lista aktywnych obiektów | **Jednostki**: gracze, AI, bronie w locie; żywe jasno | done |
| Okno właściwości nagrania (tytuł, autor, odprawa...) | Zachowane jako kolumna RecordingInfo; pokazane w Raw | done (bez okna) |
| Formaty pozycji DMS/MGRS, północ magnetyczna | **Pozycja (szer. / dł.)** w DMS i pola **MGRS**; pole **Kurs magnetyczny**; **Kursy magnetyczne** zapisuje kurs, trasę i namiar magnetyczne (°M) i pokazuje kompas z obiema północami oraz odchyleniem — World Magnetic Model 2025 (współczynniki w domenie publicznej), liczony tutaj dla miejsca i daty jednostki | new |

## Wykresy {#charts}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Wykres jednego obiektu, do 4 wartości | **W czasie** (oraz wykres w Replay) | done |
| Wykres do 4 obiektów naraz | **Porównanie**: jedna wartość do 8 jednostek na jednej skali | new |
| Wartość względem wartości (w stylu energia–manewrowość) | **Wartość do wartości**: współczynnik skrętu względem prędkości albo dowolnej pary; każda jednostka to linia, jej bieżący punkt zaznaczony | new |
| Oś X według czasu; zoom; przewijanie czasu z wykresu | Kółko powiększa w czasie, podwójne kliknięcie resetuje, kliknięcie idzie do chwili | new |
| Oś X według odległości w powietrzu lub na ziemi | **Time / Air distance / Ground distance** na wykresach czasu i porównania; zoom i kliknięcie działają tak samo | new |
| Gotowe wykresy (energia, przyspieszenie...) | Dowolną wartość można wybrać (wysokość energetyczna i jej tempo są wartościami) | done |

## Statystyki, dziennik lotu, zdarzenia {#statistics-flight-log-events}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Dziennik lotu: start, lądowanie, strzał, trafienie przez, zniszczenie przez, opuszczenie obszaru | **Statystyki** na jednostkę: życia, zestrzelenia, zgony, strzały, trafienia, współczynnik trafień, starty, lądowania, czas w powietrzu, maks. G (i min), maks. prędkość, wysokość i Mach, dystans. Starty pochodzą ze zdarzeń TakenOff/Landed, z OnGround, AGL albo z oszacowania oznaczonego ~. | new |
| Dodatki z tablicą wyników i raportem misji | Podsumowanie drużyn i najwięcej zestrzeleń; własna tablica podsumowania meczu | new / done |
| Eksport dziennika lotu XML/CSV | **Eksportuj CSV** statystyk i zdarzeń w postaci listy | new (tylko CSV) |
| Eksport telemetrii CSV w zadanym tempie | **Telemetria zaznaczonej jednostki**: każda wartość, 1–20 na sekundę | new |
| Dziennik zdarzeń, podwójne kliknięcie, by tam pojechać i zaznaczyć | Lista **Zdarzenia**, filtrowana rodzajem i jednostką; kliknięcie tam leci | done |
| Poprzednie / następne zdarzenie (Ctrl+←/→) | **Page Up / Page Down** | new |
| Pauza przy zdarzeniu | **Pauza przy zdarzeniu** | new |
| Znaczniki na osi czasu (zwolnienia, trafienia, zniszczenia; obiektu wybranego na niebiesko; zakładki na czerwono) | Zabójstwa i zgony jako pasek gęstości, śledzonej jednostki na niebiesko, zakładki na czerwono; kliknięcie idzie tam | new |
| Usunięcie zdarzenia, usunięcie zabójstwa | Nie zbudowane | n/a (zdarzenia należą do nagrania; filtry je ukrywają) |

## Zakładki {#bookmarks}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Wstawienie zakładki z wyborem i punktem widzenia | **Dodaj zakładkę** (B): chwila, swobodna kamera albo śledzona jednostka z widokiem, dystansem i celem; nazwana; trzymana w tej przeglądarce dla każdego nagrania | new |
| Usunięcie zakładki | × na liście | new |
| Zakładki na osi czasu i w dziennikach | Czerwone znaczniki; lista | new |
| Event=Bookmark w ACMI | Wypisane wśród znaczników nagrania, razem z zestrzeleniami, zgonami i wiadomościami | new |
| Skrót kopiuj/wklej (udostępnianie widoku) | **Export / Import** zakładek jako plik; C kopiuje pozę kamery | new |

## Odtwarzanie {#playback}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Odtwarzanie/pauza, na początek, prędkość, przewijanie osi czasu | Oś czasu | done |
| Klatka po klatce | **,** i **.** o sekundę wstecz i w przód (Shift: dziesięć) | new |
| Odtwarzanie wstecz | **◀** na osi czasu, **J** (**L** w przód; ten sam klawisz ponownie pauzuje): odtwarza od końca ku początkowi z wybraną prędkością, zapętlając lub zatrzymując się na początku | new |
| Okno skoku w czasie | Oś czasu i lista zdarzeń | done |
| Przesunięcie czasowe jednego obiektu (duch) | **Przesunięcie w czasie i przycinanie**: przesuń lot jednej jednostki albo całe nagranie o tyle sekund; **Zrównaj nagrania** przesuwa kilka nagrań, by zaczęły razem, i odtwarza je od razu (dwa loty z różnych dni obok siebie). Nagranie jest budowane od nowa, więc smugi, zdarzenia, wykresy i statystyki idą za tym | new |
| Przycinanie przed/po | **From now / To now / Cut to this span** (cofanie zachowuje przesunięcia), potem **Eksportuj CSV** (wczytuje się z powrotem do 3DHeat) albo **Eksportuj ACMI** (tekst Tacview 2.2, dla nagrania umieszczonego na Ziemi) | new |

## Teren i mapa {#terrain-and-map}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Prawdziwy teren, własna wysokość i tekstury | Poziomy (własny model 3D mapy gry), kafelki tła świata | done |
| Tryby terenu płaski / pusty / wysoki kontrast | [Wygląd poziomu](level-appearance.md): rzeźba terenu, nawierzchnia i budowle pokazane lub nie | done (nie te same tryby) |
| Taktyczna mapa 2D (Tacview nie ma; widok satelitarny) | **Mapa 2D**: widok narożnika lub całości, symbole według rodzaju i drużyny (wypełnieni gracze, obrysowana AI) obrócone do kursu, smugi, nazwy, skala, pierścienie zasięgu wokół śledzonej jednostki, pierścienie bullseye, miejsce kamery 3D, ostatnie zgony; przeciągnij, kółko, kliknij, by śledzić (M) | new |
| Obiekty statyczne (lotniska, pasy, punkty drogi, obszary, KML) | Pasy z OurAirports w tle świata i ich ścieżki schodzenia; punkty GPX i znaczniki KML ładują się jako obiekty stojące; [Tablica taktyczna](tactics-board.md) rysuje obszary i trasy | new |

## Import, eksport, nagrywanie {#import-export-recording}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Tekst i zip ACMI | [Tacview ACMI](tacview-acmi.md) | done |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (ścieżki, trasy, punkty; tętno, kadencja, moc, temperatura z Garmina), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC i GGA każdego nadawcy, sumy kontrolne sprawdzane, przez północ), **IGC** (rekordy B, data, pilot i szybowiec), **FIT** (komunikaty record, skompresowane znaczniki czasu) — każdy umieszczony wg szerokości i długości geograficznej na płaszczyźnie w środku ścieżek, tak aby tło świata się zgadzało; kurs, pochylenie i prędkość z pliku albo z odcinka między kolejnymi namiarami. CSV i Parquet jak dotąd | new (DIS n/a: protokół sieci na żywo) |
| Natywne rejestratory (DCS, BMS, IL-2, MSFS...) | Własne konwertery 3DHeat (War Thunder, CS2, Squad i inne) | done (własne) |
| Telemetria w czasie rzeczywistym przez TCP, ADS-B | Nie zbudowane | n/a (odtwarzanie po meczu) |
| Zsynchronizowany dźwięk/wideo | **Dźwięk i wideo**: lokalny plik odtwarza się, pauzuje, przewija i zmienia prędkość razem z osią czasu od ustalonego startu (**Zaczyna się teraz**, ±0,1 s); wideo w panelu o zmiennym rozmiarze nad widokiem albo obraz w obrazie. Plik zostaje w przeglądarce | new |
| Eksport wideo | [Ścieżka kamery i wideo](camera-path-and-video.md) | done |

## Inne {#other}

| Tacview | 3DHeat | Stan |
|---|---|---|
| Dodatki w Lua | Nie zbudowane | n/a (otwarte źródło: zmień sam przeglądarkę) |
| Online debriefing (wspólna sesja) | Nie zbudowane | n/a (u Tacview to hostowana sesja, która trzyma wszystkich przy jednej głowicy odtwarzania. 3DHeat nie ma serwera i trzyma nagrania na komputerze widza, a nawet połączenie peer-to-peer potrzebuje serwera sygnalizacji. Debrief udostępnia się jako pliki: przycięte nagranie (Export ACMI albo CSV) i plik zakładek, które otwierają się w tych samych chwilach i widokach) |
| Zdalne sterowanie przez instruktora | Nie zbudowane | n/a (steruje działającym symulatorem) |
| Edycja obiektów (dodawanie, edycja, usuwanie) | [Tablica taktyczna](tactics-board.md) dla planowanych obiektów; nagrania są tylko do odczytu | n/a |
| Języki | 40 języków | done |
| Uwierzytelnianie nagrań | Nie zbudowane | n/a |

## Dla programistów: właściwości ACMI 2.2 {#for-developers-acmi-22-properties}

Czytane przez `data/acmi.ts`; właściwości liczbowe stają się kolumnami liczbowymi, tekstowe kolumnami kategorii. Wszystkie są pokazane w **Surowe** na karcie jednostki. Są czytane w konkretnym celu:

| Właściwości | Zastosowanie |
|---|---|
| T (wszystkie cztery formy), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Pozycja, postawa, figura, nazwa jednostki, drużyna |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Pola, wykresy, HUD, wykrywanie startów i lądowań |
| VerticalGForce, LongitudinalGForce, LateralGForce | Pola G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Pola |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Pola paliwa, sumowane po zbiornikach |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Stożki radaru i bramka zasięgu |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Linie namierzenia |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Kopuły zaangażowania |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Pola |
| Health | Pole |
| Zdarzenia: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Lista zdarzeń, statystyki (zgony, starty, lądowania), zakładki; Message i Comment jako napisy |
| PilotHeadYaw, PilotHeadPitch | Linia widzenia pilota |
| Znacznik typu Bullseye (Navaid+Static+Bullseye) | Pole bullseye i pierścienie na mapie |
| Wszystko inne (PilotHeadRoll, sterowanie, powierzchnie, odchylenia ILS, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, rozmiary...) | Pokazane tak, jak zapisano, w **Surowe** |

Kąty radaru i namierzenia są brane względem własnych osi jednostki: azymut w prawo, elewacja w górę, przechył prawym skrzydłem w dół. Specyfikacja ACMI mówi, że są względem samolotu, ale nie, w którą stronę jest dodatnio; ten odczyt idzie za jej przekształceniem (odchylenie zgodnie z ruchem wskazówek zegara, pochylenie w górę, przechył w prawo).
