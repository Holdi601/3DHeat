---
title: "Paritet s Tacviewom"
parent: "Reprodukcija utakmice"
grand_parent: "Reprodukcija"
nav_order: 1
lang: "hr"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Paritet s Tacviewom

Tacview je popularan program za gledanje snimki letova. Ako ga poznajete, ova stranica pokazuje gdje je svaki njegov alat u 3DHeat-u.

Navodi svaku značajku Tacview 1.9 (njegov priručnik, tablicu njegovih nizova sučelja i format datoteke ACMI 2.2) i gdje je [reprodukcija utakmice](match-replay.md) u odnosu na nju. Cilj: ono što Tacview može učiniti za reprodukciju i njezine podatke, 3DHeat može učiniti također.

**Status:**
- **gotovo**: već je u 3DHeat-u.
- **nova**: napravljena da odgovara značajci Tacviewa.
- **još nije**: vrijedi, ali nije napravljena.
- **n/p**: ne vrijedi ovdje, razlog je naveden.

Gdje naći značajke: karticu **Meč**, **Reprodukcija figura** (ili **Preklapanje figura** u kartici Toplinska karta), u odjeljcima bočne trake **Reprodukcija**, **Jedinice**, **Događaji**, **Zabilješke**, **Taktički prikaz**, **Statistika**, **Pomak u vremenu i skraćivanje**, **Karta i položaj**, **Zvuk i video** i **Oznake**. Vidi [Reprodukcija utakmice](match-replay.md).

## Kamere {#cameras}

| Tacview | 3DHeat | Status |
|---|---|---|
| Cockpit view (F5), the horizon rolling with the aircraft | **Kokpit**: iz jedinice duž njezina stava, kako to daje model kretanja. Vlastita figura jedinice je odrezana. Povucite mišem za gledanje oko sebe; **Opet pogled naprijed** vraća pogled. | nova |
| HUD in the cockpit view (IAS/CAS/TAS choice) | **Pokazivač na vjetrobranu** (H): horizont i ljestve nagiba stvarnog pogleda, oznaka putanje leta, traka kursa, IAS, visina, TAS, Mach, G, kut napada, vertikalna brzina, AGL | nova |
| 3D cockpit instruments, pilot head tracking (PilotHead*), TrackIR | Nema modela kokpita; kutovi glave prikazuju se u prikazu **Sirovo** kartice jedinice | n/p (nema modela kokpita; hardver za praćenje glave služi za letenje uživo) |
| External view (F6): orbit the primary object | **Iza** (okreće se s jedinicom) i **Orbita** (zadržava svoj smjer) | gotovo |
| Dogfight camera, "Look at target" (padlock) | **Zaključavanje**: iz kokpita, držano na cilju | nova |
| Dogfight camera, "Centered" / "Look forward" | **Cilj**: iza jedinice, na liniji od cilja, gleda pored nje na cilj. **Fiksna** na azimutu 0 gleda naprijed s prednje strane. | nova |
| Swap primary and secondary | **Zamijeni** uz cilj | nova |
| Satellite view (F7), orthographic top-down | **Satelit**: ravno dolje na jedinicu, sjever gore; povucite za okretanje. 2D karta je ortografski tlocrt. | nova |
| Free camera (F8), W/A/S/D, E/C | Slobodna kamera za letenje (W/A/S/D, Space/Q, Shift/Alt) | gotovo |
| Add-on Head-On camera; external camera fixed to the object | **Fiksna**: mjesto oko jedinice koje se okreće i naginje s njom; povucite da ga pomaknete (straga, vrh krila, čeono) | nova |
| Add-on Lock Camera (freeze the position) | Prestanite pratiti (Esc): kamera ostaje gdje je bila | gotovo |
| Strategic view (zoom out to the whole Earth) | [Pozadina svijeta](world-backdrop.md) i okvir cijelog snimka u 2D karti | gotovo |
| Field of view setting | **Kamera i scena**: vidno polje (FOV) | gotovo |
| Cycle views with keys | **V** sljedeći pogled, **Shift+V** natrag | nova |

## 3D prikaz i mogućnosti prikaza {#d-view-and-display-options}

| Tacview | 3DHeat | Status |
|---|---|---|
| Ribbon trails, length slider | Tragovi (sekunde) u pregledniku tima | gotovo |
| Anticipatory trail (path ahead) | **Putanja naprijed**: kamo jedinica stvarno ide u sljedećih nekoliko sekundi | nova |
| Object height lines / walls | **Okomite linije** | gotovo (linije; zidovi nisu napravljeni) |
| Selected object vectors: heading (dotted), course (solid), lift | **Vektori brzine** (kurs i brzina toliko sekundi, s oznakom) i **Linije nosa i uzgona** (nos crtkano, uzgon kratko i tamno) | nova |
| Pilot line of sight | **Linija pogleda pilota**: crtkana cijan linija duž PilotHeadYaw/PilotHeadPitch (ili stupca HeadYaw, ViewYaw ili LookYaw) naspram osi jedinice | nova |
| SAM/AAA lethal range domes (EngagementRange, VerticalEngagementRange, EngagementMode, "2" twins) | **Zone djelovanja**: kupole, ovoidne tamo gdje se okomiti domet razlikuje, isključene dok je EngagementMode 0 | nova |
| Radar locks (LockedTarget..9) with labels | **Zaključavanja**: crvene linije do svakog zaključanog objekta; crtkano jantarno do FocusedTarget; duž LockedTargetAzimuth/Elevation/Range gdje nijedan objekt nije imenovan. **Oznake zaključavanja**: ime cilja i domet na svakoj liniji zaključavanja | nova |
| Radar cone (RadarMode, Azimuth, Elevation, Roll, Range, beamwidths) and range gate | **Radarski stošci**: obod i srednji prsten snopa, okrenut prema azimutu, elevaciji i valjanju naspram jedinice; vrata dometa kao dva žuta oboda. Bez širina snopa, samo os snopa. | nova |
| Line of sight between the two selected objects (green / red dotted when terrain blocks) | Linija izmjerenog para postaje crvena i crtkana kad je teren između njih | nova |
| Automatically scale up distant objects | Najmanja figura na zaslonu (pikseli) | gotovo |
| Latitude/longitude grid | **Karta i položaj → Mreža**: linije širine i dužine na tlu ispod kamere, u okruglim razmacima prema visini (od 10° do 1'), označene; ili **MGRS** kilometarska mreža UTM zone, s prikazanom zonom i kvadratom od 100 km. Mreža 2D karte ostaje kao prije | nova |
| Bullseye rings | Prstenovi oko bullseye-a svakog tima na 2D karti | nova (samo 2D) |
| Glideslope overlay | **Klizne putanje**: putanje od 3° s rubovima pune skale ±0,7° na oba kraja svake piste blizu snimka, iz izmjerenih pragova i visina OurAirports (preuzeto jednom, čuva se izvan mreže), oznaka na svaku nautičku milju, imenovano po aerodromu i pisti | nova |
| Altitude restrictions (ceiling/floor alarm) | **Ograničenje visine**: donja i gornja granica; oznake jedinica izvan nje postaju crvene, a svaki prijelaz (ispod donje, iznad gornje, natrag unutra) je naveden. Klik ide tamo i prati jedinicu | nova |
| Destroyed objects grey, removed after 15 min | Životi završavaju sa svojim tragom; mrtva jedinica je zatamnjena na popisu jedinica | gotovo |
| Visible / Disabled properties | Prikazano u **Sirovo**; ništa nije skriveno njima | još nije |
| Display stick/throttle/pedal positions | Gas i vrijednosti motora u poljima; ulazi upravljanja u **Sirovo** | gotovo (kao vrijednosti) |
| Comments as subtitles | **Poruke kao titlovi** (Oznake): ACMI događaji Message i Comment, te chat iz bilo koje igre (događaji Chat, Say ili Radio, ili stupac chata), pri dnu prikaza, s tim tko je rekao, šest sekundi | nova |
| Date and UTC time display | Sat na vremenskoj traci s UTC-om tamo gdje snimka ima referentno vrijeme | gotovo |
| Mouse position lat/long, MGRS, bullseye | Kartica odabira (klik na točku) daje širinu i dužinu u stupnjevima, minutama i sekundama te MGRS uz svjetske metre; bullseye po jedinici (polje) | nova |
| Custom logo | Nije napravljeno | n/p (branding) |
| 3D models, nearest when unknown | Vlastiti katalog figura, najbliži parnjak, stvarna veličina | gotovo |
| Multiple engagements (lines between all pairs) | **Linije angažiranja**: od svake jedinice u opsegu do svakog protivnika unutar zadanog dometa (1–200 km), svaka s dometom, najbližih 60 parova; izmjereni par kao i prije | nova |

## Oznake {#labels}

| Tacview | 3DHeat | Status |
|---|---|---|
| Labels on/off, separately for selected and unselected objects | **Oznake** s pravilima za **Odabrane**, **Zrakoplove**, **Kopno**, **Brodove**, **Oružje** i **UI**: prikazane ili ne, vlastite vrijednosti, prioritet | nova |
| Label fields: name, call sign, pilot, speeds (TAS/CAS/IAS/Mach/GS), heights (ASL/AGL), VS, AOA, AOS, G (vertical, lateral, longitudinal), turn rate and radius, energy, fuel weight/volume/flow, heading/track, roll/pitch, heart rate | Svaka vrijednost iz `fields.ts`: isti popis, izračunata tamo gdje nije zabilježena (procjene označene ~). Stopa valjanja i SpO2 samo kroz Sirovo. | gotovo |
| Bullseye position in labels | Polje **Bullseye (azimut / udaljenost)** | nova |
| ILS deviations, distance flown | Sirove vrijednosti; preleteni put u statistici | gotovo (djelomično) |
| Declutter unselected telemetry | **Razmakni oznake**, poredane po prioritetu svakog pravila | gotovo / nova |
| Label all ground objects / only threats | Pravila Kopno i UI | nova |
| Labels scale | **Veličina oznaka** (60–250 %) | nova |
| Metric / imperial units | Metričke / imperijalne | gotovo (dvije unaprijed postavke, ne osam) |

## Podaci o objektu i telemetrija {#object-info-and-telemetry}

| Tacview | 3DHeat | Status |
|---|---|---|
| Primary and secondary selection | Klik prati i odabire; shift-klik na dvije jedinice za mjerenje; birač **Cilj** | gotovo / nova |
| Range / bearing / aspect / closure between two objects | Linija BRAA izmjerenog para; polja Domet, Azimut, Aspekt i Zatvaranje iz praćene jedinice | gotovo |
| Relative bearing, LOS rate | Polja **Relativni azimut** (od nosa praćene jedinice, L/R) i **Kutna brzina linije vida** (°/s) | nova |
| Telemetry windows | Kartica jedinice i kartica pri lebdenju | gotovo |
| Raw telemetry (every recorded property, also unknown ones) | **Sirovo** na kartici jedinice: svaki stupac u retku jedinice, kako je zapisan | nova |
| Active objects list | **Jedinice**: igrači, UI, oružje u letu; živi su svijetli | gotovo |
| Recording properties window (title, author, briefing...) | Čuva se kao stupac RecordingInfo; prikazano u Sirovo | gotovo (bez prozora) |
| Position formats DMS/MGRS, magnetic north | **Položaj (širina / dužina)** u DMS-u i polje **MGRS**; polje **Magnetski kurs**; **Magnetski kursovi** upisuje kurs, putanju i smjer magnetski (°M) i prikazuje kompas s oba sjevera i varijacijom. Koristi Svjetski magnetski model 2025 (koeficijenti javne domene), izračunat za mjesto i datum jedinice | nova |

## Grafikoni {#charts}

| Tacview | 3DHeat | Status |
|---|---|---|
| Chart of one object, up to 4 values | **Kroz vrijeme** (i grafikon pod Reprodukcija) | gotovo |
| Plot up to 4 objects at once | **Usporedba**: jedna vrijednost do 8 jedinica na jednoj skali | nova |
| Value against value (energy-manoeuvrability style) | **Vrijednost naspram vrijednosti**: kutna brzina skretanja naspram brzine ili bilo kojeg drugog para; svaka jedinica je linija, a njezina trenutna točka je označena | nova |
| X axis by time; zoom; scrub time from the chart | Kotačić zumira u vremenu, dvostruki klik vraća, klik ide na trenutak | nova |
| X axis by air or ground distance | **Vrijeme / Zračna udaljenost / Udaljenost po tlu** na grafikonima vremena i usporedbe; zumiranje i klik za odlazak rade isto | nova |
| Predefined charts (energy, acceleration...) | Može se odabrati bilo koja vrijednost (visina energije i njezina brzina su vrijednosti) | gotovo |

## Statistika, dnevnik leta, događaji {#statistics-flight-log-events}

| Tacview | 3DHeat | Status |
|---|---|---|
| Flight log: taken off, landed, fired, hit by, destroyed by, left area | **Statistika** po jedinici: životi, ubojstva, smrti, pucnjevi, pogoci, omjer pogodaka, polijetanja, slijetanja, vrijeme u zraku, najveći G (i najmanji), najveća brzina, visina i Mach, udaljenost. Polijetanja dolaze iz događaja TakenOff/Landed, iz OnGround, AGL ili iz procjene označene ~. | nova |
| Scoreboard and mission report add-ons | Sažetak po timu i najviše ubojstava; vlastita tablica rezultata sažetka utakmice | nova / gotovo |
| Export flight log XML/CSV | **Izvezi CSV** statistike i događaja kako su navedeni | nova (samo CSV) |
| Export telemetry CSV at a rate | **Telemetrija odabrane jedinice**: svaka vrijednost, 1–20 u sekundi | nova |
| Event log, double-click to go there and select | Popis **Događaji**, filtriran po vrsti i jedinici; klik leti tamo | gotovo |
| Previous / next event (Ctrl+←/→) | **Page Up / Page Down** | nova |
| Pause on event | **Pauza na događaju** | nova |
| Timeline markers (releases, hits, destructions; the selected object's in blue; bookmarks red) | Ubojstva i smrti kao gustoća, praćene jedinice plavo, zabilješke crveno; klik za odlazak | nova |
| Remove an event, kill-remove | Nije napravljeno | n/p (događaji pripadaju snimci; filtri ih skrivaju) |

## Zabilješke {#bookmarks}

| Tacview | 3DHeat | Status |
|---|---|---|
| Insert bookmark with selection and point of view | **Dodaj zabilješku** (B): trenutak, slobodna kamera ili praćena jedinica s pogledom, udaljenost i cilj; imenovano; čuva se u ovom pregledniku po snimci | nova |
| Remove bookmark | × na popisu | nova |
| Bookmarks on the timeline and in the logs | Crvene oznake; popis | nova |
| Event=Bookmark in ACMI | Navedeno među oznakama snimke, uz ubojstva, smrti i poruke | nova |
| Copy/paste shortcut (share a view) | **Izvezi / Uvezi** zabilješke kao datoteku; C kopira položaj kamere | nova |

## Reprodukcija {#playback}

| Tacview | 3DHeat | Status |
|---|---|---|
| Play/pause, to start, speed, timeline scrub | Vremenska traka | gotovo |
| Frame by frame | **,** i **.** sekunda unatrag i naprijed (Shift: deset) | nova |
| Reverse playback | **◀** na vremenskoj traci, **J** (**L** naprijed; ista tipka opet pauzira): reproducira od kraja prema početku odabranom brzinom, ponavlja se ili staje na početku | nova |
| Time jump dialog | Vremenska traka i popis događaja | gotovo |
| Time shift one object (ghost) | **Pomak u vremenu i skraćivanje**: pomaknite let jedne jedinice ili cijelu snimku za toliko sekundi. **Uskladi snimke** pomiče nekoliko snimki da počnu zajedno i pušta ih odjednom (dva leta različitih dana jedan uz drugi). Snimka se ponovno gradi, pa tragovi, događaji, grafikoni i statistika slijede | nova |
| Trim before/after | **Od sada / Do sada / Izreži na ovaj raspon** (poništavanje čuva pomake), zatim **Izvezi CSV** (učitava se natrag u 3DHeat) ili **Izvezi ACMI** (tekst Tacview 2.2, za snimku postavljenu na Zemlju) | nova |

## Teren i karta {#terrain-and-map}

| Tacview | 3DHeat | Status |
|---|---|---|
| Real terrain, custom elevation and textures | Razine (vlastita karta igre kao 3D model), pločice pozadine svijeta | gotovo |
| Flat / empty / high-contrast terrain modes | [Izgled razine](level-appearance.md): reljef tla, površina i građevine prikazane ili ne | gotovo (nisu iste postavke) |
| 2D tactical map (Tacview has none: satellite view) | **2D karta**: kut ili cijeli prikaz, simboli po vrsti i timu (ispunjeni igrači, obrubljene UI jedinice) okrenuti prema svom kursu, tragovi, imena, traka mjerila, prstenovi dometa oko praćene jedinice, prstenovi bullseye-a, mjesto 3D kamere, nedavne smrti; povlačenje, kotačić, klik za praćenje (M) | nova |
| Static objects (airports, runways, waypoints, areas, KML) | Izmjerene piste (OurAirports) u pozadini svijeta i njihove klizne putanje; GPX točke i KML oznake učitavaju se kao stojeći objekti; [Taktička ploča](tactics-board.md) crta područja i rute | nova |

## Uvoz, izvoz, snimanje {#import-export-recording}

| Tacview | 3DHeat | Status |
|---|---|---|
| ACMI text and zip | [Tacview ACMI](tacview-acmi.md) | gotovo |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (staze, rute, točke; srčani ritam, kadenca, snaga i temperatura iz Garmina), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC i GGA bilo kojeg govornika, kontrolni zbrojevi provjereni, preko ponoći), **IGC** (zapisi B, datum, pilot i jedrilica), **FIT** (poruke zapisa, komprimirane vremenske oznake). Svaka se postavlja po širini i dužini u ravninu na sredini staza, tako da se pozadina svijeta poklapa; smjer, nagib i brzina su iz datoteke ili od točke do točke. CSV i Parquet kao prije | nova (DIS n/p: protokol mrežnog prijenosa uživo) |
| Native recorders (DCS, BMS, IL-2, MSFS...) | Vlastiti pretvarači 3DHeat-a (War Thunder, CS2, Squad, Arma i drugi) | gotovo (vlastiti) |
| Real-time telemetry over TCP, ADS-B | Nije napravljeno | n/p (reprodukcije su nakon utakmice) |
| Synchronised audio/video | **Zvuk i video**: lokalna datoteka se pušta, pauzira, pretražuje i mijenja brzinu uz vremensku traku od zadanog početka (**Počinje sada**, ±0,1 s); video u panelu promjenjive veličine preko prikaza, ili slika u slici. Datoteka ostaje u pregledniku | nova |
| Video export | [Put kamere i video](camera-path-and-video.md) | gotovo |

## Ostalo {#other}

| Tacview | 3DHeat | Status |
|---|---|---|
| Lua add-ons | Nije napravljeno | n/p (otvoren kod: promijenite sam preglednik) |
| Online debriefing (shared session) | Nije napravljeno | n/p (Tacviewov je hostirana sesija koja svima drži jednu reprodukcijsku glavu. 3DHeat nema poslužitelj i čuva snimke na računalu gledatelja, a i izravna veza između dva računala treba poslužitelj za signalizaciju. Izvješće se dijeli kao datoteke: skraćena snimka (Izvezi ACMI ili CSV) i datoteka zabilješki, koje se otvaraju u istim trenucima i pogledima) |
| Instructor remote control | Nije napravljeno | n/p (upravlja pokrenutim simulatorom) |
| Object editing (add, edit, remove objects) | [Taktička ploča](tactics-board.md) za planirane objekte; snimke su samo za čitanje | n/p |
| Languages | 40 jezika | gotovo |
| Authentication of recordings | Nije napravljeno | n/p |

## Za razvojne programere: svojstva ACMI 2.2 {#for-developers-acmi-22-properties}

Čita ih `data/acmi.ts`. Numerička svojstva postaju stupci brojeva, tekstualna stupci kategorija. Sva su prikazana pod **Sirovo** na kartici jedinice. Ova se čitaju s određenom svrhom:

| Svojstva | Namjena |
|---|---|
| T (sva četiri oblika), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Položaj, stav, figura, ime jedinice, tim |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Polja, grafikoni, HUD, otkrivanje polijetanja i slijetanja |
| VerticalGForce, LongitudinalGForce, LateralGForce | G polja |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Polja |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Polja goriva, zbrojena po spremnicima |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarski stošci i vrata dometa |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Linije zaključavanja |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Kupole djelovanja |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Polja |
| Health | Polje |
| Events: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Popis događaja, statistika (smrti, polijetanja, slijetanja), zabilješke; Message i Comment kao titlovi |
| PilotHeadYaw, PilotHeadPitch | Linija pogleda pilota |
| Type tag Bullseye (Navaid+Static+Bullseye) | Polje bullseye-a i prstenovi na karti |
| Sve ostalo (PilotHeadRoll, controls, surfaces, ILS deviations, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, sizes...) | Prikazano kako je zapisano pod **Sirovo** |

Kutovi radara i zaključavanja mjere se naspram vlastitih osi jedinice: azimut udesno, elevacija gore, valjanje desno krilo dolje. Specifikacija ACMI kaže da su relativni prema zrakoplovu, ali ne kaže koji je smjer pozitivan. Ovo čitanje slijedi njezinu transformaciju (zakret u smjeru kazaljke na satu, nagib prema gore, valjanje udesno).
