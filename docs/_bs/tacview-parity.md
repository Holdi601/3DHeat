---
title: "Paritet s Tacviewom"
parent: "Reprodukcija meča"
grand_parent: "Reprodukcija"
nav_order: 1
lang: "bs"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Paritet s Tacviewom

Tacview je popularan program za gledanje snimaka letova. Ako ga poznajete, ova stranica pokazuje gdje je svaki njegov alat u 3DHeat-u.

Navodi se svaka funkcija Tacview 1.9 (njegov priručnik, njegova tabela tekstova korisničkog interfejsa i format datoteke ACMI 2.2) i gdje je [reprodukcija meča](match-replay.md) u odnosu na nju. Cilj: ono što Tacview može za reprodukciju i njene podatke, 3DHeat može takođe.

**Stanje:**
- **gotovo**: već je u 3DHeat-u.
- **novo**: napravljeno da odgovara funkciji Tacviewa.
- **još nije**: važi, ali nije napravljeno.
- **n/a**: ovdje se ne primjenjuje, s razlogom.

Gdje naći funkcije: karticu **Meč**, **Reprodukcija figura** (ili **Preklapanje figura** na kartici Toplotna mapa), te odjeljke bočne trake **Reprodukcija**, **Jedinice**, **Događaji**, **Zabilješke**, **Taktički prikaz**, **Statistika**, **Pomak u vremenu i skraćivanje**, **Mapa i položaj**, **Zvuk i video** i **Oznake**. Vidi [Reprodukcija meča](match-replay.md).

## Kamere {#cameras}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Pogled iz kokpita (F5), horizont se okreće s letjelicom | **Kokpit**: izvan jedinice duž njenog položaja, kako ga model kretanja daje. Vlastita figura jedinice je odsječena. Prevucite za gledanje oko sebe; **Opet pogled naprijed** vraća. | novo |
| HUD u pogledu iz kokpita (izbor IAS/CAS/TAS) | **Pokazivač na vjetrobranu** (H): horizont i lestvica nagiba stvarnog pogleda, oznaka putanje leta, traka kursa, IAS, visina, TAS, Mach, G, ugao napada, vertikalna brzina, AGL | novo |
| 3D instrumenti kokpita, praćenje glave pilota (PilotHead*), TrackIR | Nema modela kokpita; uglovi glave se prikazuju na kartici jedinice, u prikazu **Sirovo** | n/a (nema modela kokpita; praćenje glave je hardver za živo letenje) |
| Spoljni pogled (F6): kruženje oko primarnog objekta | **Iza** (okreće se s jedinicom) i **Orbita** (zadržava vlastiti smjer) | gotovo |
| Kamera za borbu iz blizine, „Gledaj u cilj" (zaključavanje) | **Zaključavanje**: iz kokpita, usmjereno na cilj | novo |
| Kamera za borbu iz blizine, „Centrirano" / „Gledaj naprijed" | **Cilj**: iza jedinice, na liniji od cilja, gledajući pored njega u cilj. **Fiksna** na azimutu 0 gleda naprijed sprijeda. | novo |
| Zamjena primarnog i sekundarnog | **Zamijeni** pored cilja | novo |
| Satelitski pogled (F7), ortografski, odozgo | **Satelit**: ravno odozgo na jedinicu, sjever gore; prevucite za okretanje. 2D karta je ortografski plan. | novo |
| Slobodna kamera (F8), W/A/S/D, E/C | Slobodna letačka kamera (W/A/S/D, Space/Q, Shift/Alt) | gotovo |
| Dodatna kamera Head-On; spoljna kamera vezana za objekt | **Fiksna**: mjesto oko jedinice koje se okreće i naginje s njom; prevucite da ga pomjerite (iza, vrh krila, čeono) | novo |
| Dodatna kamera Lock (zamrzava položaj) | Prestanak praćenja (Esc): kamera ostaje gdje je bila | gotovo |
| Strateški pogled (udaljavanje na cijelu Zemlju) | [Pozadina svijeta](world-backdrop.md) i okvir cijelog snimka na 2D karti | gotovo |
| Postavka vidnog polja | **Kamera i scena**, FOV | gotovo |
| Prebacivanje pogleda tipkama | **V** sljedeći pogled, **Shift+V** nazad | novo |

## 3D prikaz i opcije prikaza {#d-view-and-display-options}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Tragovi kao vrpce, klizač dužine | Tragovi (sekunde) u prikazu tima | gotovo |
| Trag koji predviđa (putanja naprijed) | **Putanja naprijed**: kuda jedinica stvarno ide u narednih nekoliko sekundi | novo |
| Linije visine objekta / zidovi | **Okomite linije** | gotovo (linije; zidovi nisu napravljeni) |
| Vektori odabranog objekta: smjer (tačkasto), kurs (puna linija), uzgon | **Vektori brzine** (kurs i brzina za toliko sekundi, sa savjetom) i **Linije nosa i uzgona** (nos crtkano, uzgon kratko i tamno) | novo |
| Linija pogleda pilota | **Linija pogleda pilota**: crtkana cijan linija duž PilotHeadYaw/PilotHeadPitch (ili kolone HeadYaw, ViewYaw ili LookYaw) naspram osa jedinice | novo |
| Smrtonosne zone dometa SAM/AAA (EngagementRange, VerticalEngagementRange, EngagementMode, dvojnici „2") | **Zone djelovanja**: kupole, jajolike gdje se vertikalni domet razlikuje, isključene dok je EngagementMode 0 | novo |
| Radarska zaključavanja (LockedTarget..9) s oznakama | **Zaključavanja**: crvene linije do svakog zaključanog objekta; isprekidana jantarna do FocusedTarget; duž LockedTargetAzimuth/Elevation/Range gdje nije imenovan nijedan objekt. **Oznake zaključavanja**: ime cilja i domet na svakoj liniji zaključavanja | novo |
| Radarski konus (RadarMode, Azimuth, Elevation, Roll, Range, širine snopa) i radarska vrata dometa | **Radarski čunjevi**: obod i srednji prsten snopa okrenut azimutom, elevacijom i valjanjem naspram jedinice; vrata dometa kao dva žuta oboda. Bez širina snopa, samo osa snopa. | novo |
| Linija vida između dva odabrana objekta (zeleno / crveno tačkasto kad teren blokira) | Linija izmjerenog para postaje crvena i crtkana kad je teren između njih | novo |
| Automatsko povećanje udaljenih objekata | Najmanja figura na ekranu (pikseli) | gotovo |
| Mreža geografske širine i dužine | **Mapa i položaj → Mreža**: linije geografske širine i dužine na tlu ispod kamere, na okrugloj razmaku za visinu (10° do 1'), označene; ili kilometarska mreža **MGRS** UTM zone, s prikazanom zonom i kvadratom 100 km. Mreža 2D karte ostaje kakva je bila | novo |
| Prstenovi Bullseye | Prstenovi oko bullseye-a svakog tima na 2D karti | novo (samo 2D) |
| Prikaz kliznih putanja | **Klizne putanje**: putanje od 3° s krajevima pune skale ±0,7° na oba kraja svake piste blizu snimka, iz izmjerenih pragova i nadmorskih visina OurAirports (preuzeto jednom, čuva se van mreže), oznaka na svakoj nautičkoj milji, imenovana po aerodromu i pisti | novo |
| Ograničenja visine (alarm za plafon/pod) | **Ograničenje visine**: pod i plafon; oznake jedinica izvan njih postaju crvene, i svaki prelaz (ispod poda, iznad plafona, nazad unutra) je naveden - klik vodi tamo i prati jedinicu | novo |
| Uništeni objekti sivi, uklonjeni poslije 15 min | Život se završava s njegovim tragom; mrtva jedinica je zatamnjena na spisku jedinica | gotovo |
| Svojstva Visible / Disabled | Prikazana na **Sirovo**; ništa se ne skriva zbog njih | još nije |
| Prikaz položaja palice/gasa/pedala | Vrijednosti gasa i motora u poljima; upravljački unosi na **Sirovo** | gotovo (kao vrijednosti) |
| Komentari kao titlovi | **Poruke kao titlovi** (Oznake): događaji ACMI Message i Comment, i ćaskanje iz bilo koje igre (događaji Chat, Say ili Radio, ili kolona za ćaskanje), na dnu prikaza s imenom onoga ko je rekao, šest sekundi | novo |
| Prikaz datuma i UTC vremena | Sat na vremenskoj liniji s UTC-om tamo gdje snimak ima referentno vrijeme | gotovo |
| Položaj miša u geografskoj širini/dužini, MGRS, bullseye | Kartica izbora (klik na tačku) daje geografsku širinu/dužinu u stepenima, minutama i sekundama te MGRS pored svjetskih metara; bullseye po jedinici (polje) | novo |
| Prilagođeni logo | Nije napravljeno | n/a (brendiranje) |
| 3D modeli, najbliži kad nisu poznati | Vlastiti katalog figura, najbliži parnjak, prava veličina | gotovo |
| Više angažmana (linije između svih parova) | **Linije angažovanja**: od svake jedinice u opsegu do svakog protivnika u zadanom dometu (1-200 km), svaka sa svojim dometom, najbližih 60 parova; izmjereni par kao i prije | novo |

## Oznake {#labels}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Oznake uključene/isključene, posebno za odabrane i neodabrane objekte | **Oznake** s pravilima za **Odabrane**, **Zrakoplovi**, **Kopno**, **Brodovi**, **Oružje** i **AI**: prikazano ili ne, vlastite vrijednosti, prioritet | novo |
| Polja oznaka: ime, pozivni znak, pilot, brzine (TAS/CAS/IAS/Mach/GS), visine (ASL/AGL), VS, AOA, AOS, G (vertikalno, bočno, uzdužno), brzina skretanja i radijus, energija, gorivo po težini/zapremini/protoku, kurs/put, valjanje/posrtanje, puls | Svaka vrijednost iz `fields.ts`: isti spisak, izračunato gdje nije zabilježeno (procjene označene ~). Brzina valjanja i SpO2 samo preko Sirovo. | gotovo |
| Položaj bullseye-a u oznakama | Polje **Bullseye (azimut / udaljenost)** | novo |
| Odstupanja ILS-a, preleteno rastojanje | Sirove vrijednosti; preleteno rastojanje u statistici | gotovo (djelimično) |
| Razmak nepraćene telemetrije | **Razmakni oznake**, poredane po prioritetu svakog pravila | gotovo / novo |
| Oznaka svih zemaljskih objekata / samo prijetnji | Pravila Kopno i AI | novo |
| Skala oznaka | **Veličina oznaka** (60-250 %) | novo |
| Metričke / imperijalne jedinice | Metričke / imperijalne | gotovo (dvije postavke, ne osam) |

## Podaci o objektu i telemetrija {#object-info-and-telemetry}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Primarni i sekundarni odabir | Klik prati i bira; shift-klik na dva za mjerenje; izbor **Cilj** | gotovo / novo |
| Domet / azimut / aspekt / približavanje između dva objekta | Linija BRAA izmjerenog para; polja Domet, Azimut, Aspekt i Približavanje od praćene jedinice | gotovo |
| Relativni azimut, brzina linije vida | Polja **Relativni azimut** (od nosa praćene jedinice, L/D) i **Ugaona brzina linije vida** (°/s) | novo |
| Prozori telemetrije | Kartica jedinice i kartica pri lebdenju | gotovo |
| Sirova telemetrija (svako zabilježeno svojstvo, i nepoznata) | **Sirovo** na kartici jedinice: svaka kolona u redu jedinice kako je zapisana | novo |
| Spisak aktivnih objekata | **Jedinice**: igrači, AI, oružje u letu; žive svijetle | gotovo |
| Prozor svojstava snimka (naslov, autor, brifing...) | Čuva se kao kolona RecordingInfo; prikazuje se na Sirovo | gotovo (bez prozora) |
| Formati položaja DMS/MGRS, magnetni sjever | **Položaj (širina / dužina)** u DMS i polja **MGRS**; polje **Magnetni kurs**; **Magnetni kursevi** piše kurs, put i smjer magnetni (°M) i prikazuje kompas s oba sjevera i deklinacijom - Svjetski magnetni model 2025 (koeficijenti u javnom domenu), izračunat ovdje za mjesto i datum jedinice | novo |

## Grafici {#charts}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Grafik jednog objekta, do 4 vrijednosti | **Kroz vrijeme** (i grafik pod Reprodukcija) | gotovo |
| Crtanje do 4 objekta istovremeno | **Poređenje**: jedna vrijednost za do 8 jedinica na jednoj skali | novo |
| Vrijednost naspram vrijednosti (stil energija-manevarske sposobnosti) | **Vrijednost naspram vrijednosti**: brzina skretanja naspram brzine ili bilo kojeg para, svaka jedinica je linija, njena tekuća tačka obilježena | novo |
| X osa po vremenu; zumiranje; pomicanje vremena s grafika | Točkić zumira u vremenu, dvostruki klik vraća, klik ide do trenutka | novo |
| X osa po rastojanju u vazduhu ili na tlu | **Vrijeme / Rastojanje u vazduhu / Rastojanje na tlu** na grafikonima vremena i poređenja; zumiranje i klik-za-odlazak rade isto | novo |
| Unaprijed zadani grafici (energija, ubrzanje...) | Može se izabrati bilo koja vrijednost (visina energije i njena brzina su vrijednosti) | gotovo |

## Statistika, dnevnik leta, događaji {#statistics-flight-log-events}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Dnevnik leta: uzletio, sletio, pucao, pogođen od, uništen od, napustio područje | **Statistika** po jedinici: životi, pobjede, smrti, pucnji, pogoci, odnos pogodaka, uzleti, sletanja, vrijeme u vazduhu, najveći G (i najmanji), najveća brzina, visina i Mach, rastojanje. Uzleti dolaze iz događaja TakenOff/Landed, OnGround, AGL ili procjene označene ~. | novo |
| Dodaci za tablu rezultata i izvještaj o misiji | Sažetak po timu i najviše pobjeda; vlastita tabla rezultata sažetka meča | novo / gotovo |
| Izvoz dnevnika leta u XML/CSV | **Izvezi CSV** statistike i događaja kakvi su navedeni | novo (samo CSV) |
| Izvoz telemetrije u CSV po brzini | **Telemetrija odabrane jedinice**: svaka vrijednost, 1-20 u sekundi | novo |
| Dnevnik događaja, dvostruki klik za odlazak i odabir | Spisak **Događaji**, filtriran po vrsti i jedinici; klik vodi tamo | gotovo |
| Prethodni / sljedeći događaj (Ctrl+←/→) | **Page Up / Page Down** | novo |
| Pauza na događaju | **Pauza na događaju** | novo |
| Oznake na vremenskoj liniji (ispuštanja, pogoci, uništenja; odabrane jedinice u plavoj; zabilješke crveno) | Ubistva i smrti kao traka gustoće, praćene jedinice u plavoj, zabilješke crveno; klik za odlazak | novo |
| Uklanjanje događaja, uklanjanje ubistava | Nije napravljeno | n/a (događaji pripadaju snimku; filteri ih skrivaju) |

## Zabilješke {#bookmarks}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Umetanje zabilješke s odabirom i tačkom gledanja | **Dodaj zabilješku** (B): trenutak, slobodna kamera ili praćena jedinica s pogledom, rastojanjem i ciljem; imenovana; čuva se u ovom pregledaču po snimku | novo |
| Uklanjanje zabilješke | × na spisku | novo |
| Zabilješke na vremenskoj liniji i u dnevnicima | Crvene oznake; spisak | novo |
| Event=Bookmark u ACMI | Navedena pod oznakama snimka, s ubistvima, smrtima i porukama | novo |
| Prečica kopiraj/zalijepi (dijeljenje pogleda) | **Izvezi / Uvezi** zabilješke kao datoteku; C kopira položaj kamere | novo |

## Puštanje {#playback}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Pusti/pauza, na početak, brzina, pomicanje vremenske linije | Vremenska linija | gotovo |
| Kadar po kadar | **,** i **.** sekundu unazad i unaprijed (Shift: deset) | novo |
| Reprodukcija unazad | **◀** na vremenskoj liniji, **J** (**L** unaprijed; isti taster ponovo pauzira): pušta od kraja ka početku izabranom brzinom, u petlji ili staje na početku | novo |
| Dijalog skoka u vremenu | Vremenska linija i spisak događaja | gotovo |
| Pomak vremena jedne jedinice (duh) | **Pomak u vremenu i skraćivanje**: pomjera let jedne jedinice, ili cijelog snimka, za toliko sekundi; **Uskladi snimke** pomjera više snimaka da počnu zajedno i pušta ih odjednom (dva izleta na različite dane jedan pored drugog). Snimak se ponovo gradi, pa tragovi, događaji, grafici i statistika slijede | novo |
| Skraćivanje prije/poslije | **Od sada / Do sada / Isijeci na ovaj raspon** (poništavanje čuva pomake), zatim **Izvezi CSV** (učitava se nazad u 3DHeat) ili **Izvezi ACMI** (tekst Tacview 2.2, za snimak postavljen na Zemlju) | novo |

## Teren i mapa {#terrain-and-map}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Pravi teren, prilagođena visina i teksture | Nivoi (vlastita mapa igre kao 3D model), pločice pozadine svijeta | gotovo |
| Režimi terena: ravan / prazan / visokog kontrasta | [Izgled nivoa](level-appearance.md): reljef tla, površina i strukture prikazani ili ne | gotovo (nisu isti režimi) |
| 2D taktička mapa (Tacview nema; ima satelitski pogled) | **2D karta**: ugao ili cijeli prikaz, simboli po vrsti i timu (popunjeni igrači, obrisani AI) okrenuti smjeru kretanja, tragovi, imena, skala, prstenovi dometa oko praćene jedinice, prstenovi bullseye-a, mjesto 3D kamere, nedavna uništenja; prevucite, točkić, klik za praćenje (M) | novo |
| Statički objekti (aerodromi, piste, tačke, područja, KML) | Izmjerene piste (OurAirports) u pozadini svijeta i njihove klizne putanje; tačke GPX i oznake KML učitavaju se kao stojeći objekti; [Tabla taktike](tactics-board.md) crta područja i rute | novo |

## Uvoz, izvoz, snimanje {#import-export-recording}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| ACMI tekst i zip | [Tacview ACMI](tacview-acmi.md) | gotovo |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (staze, rute, tačke; puls, kadenca, snaga, temperatura iz Garmina), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC i GGA bilo kojeg govornika, provjerene kontrolne sume, preko ponoći), **IGC** (zapisi B, datum, pilot i jedrilica), **FIT** (poruke zapisa, sažeti vremenski žigovi) - svaki postavljen po geografskoj širini i dužini u ravan na sredini staza, tako da se pozadina svijeta poklapa; smjer, nagib i brzina iz datoteke ili od tačke do tačke. CSV i Parquet kao i prije | novo (DIS n/a: živi mrežni protokol) |
| Izvorni snimači (DCS, BMS, IL-2, MSFS...) | Vlastiti konverteri 3DHeat-a (War Thunder, CS2, Squad, Arma i drugi) | gotovo (vlastiti) |
| Telemetrija u stvarnom vremenu preko TCP-a, ADS-B | Nije napravljeno | n/a (reprodukuje se poslije meča) |
| Sinhronizovani zvuk/video | **Zvuk i video**: lokalna datoteka se pušta, pauzira, pomjera i mijenja brzinu uz vremensku liniju od zadanog početka (**Počinje sada**, ±0,1 s); video u panelu koji se može mijenjati veličine preko prikaza, ili slika u slici. Datoteka ostaje u pregledaču | novo |
| Izvoz videa | [Putanja kamere i video](camera-path-and-video.md) | gotovo |

## Ostalo {#other}

| Tacview | 3DHeat | Stanje |
|---|---|---|
| Dodaci u Lua | Nije napravljeno | n/a (otvoreni kod: mijenja se sam pregledač) |
| Online debrifing (zajednička sesija) | Nije napravljeno | n/a (Tacviewova je hostovana sesija koja drži sve na jednoj glavi reprodukcije. 3DHeat nema server i čuva snimke na mašini pregledača, a čak i peer-to-peer veza treba server za signalizaciju. Debrifing se dijeli kao datoteke: skraćeni snimak (Izvezi ACMI ili CSV) i datoteka zabilješki, koje se otvaraju u istim trenucima i pogledima) |
| Daljinsko upravljanje instruktora | Nije napravljeno | n/a (upravlja pokrenutim simulatorom) |
| Uređivanje objekata (dodavanje, izmjena, uklanjanje objekata) | [Tabla taktike](tactics-board.md) za planirane objekte; snimci su samo za čitanje | n/a |
| Jezici | 40 jezika | gotovo |
| Autentifikacija snimaka | Nije napravljeno | n/a |

## Za programere: svojstva ACMI 2.2 {#for-developers-acmi-22-properties}

Čita ih `data/acmi.ts`; numerička svojstva postaju kolone brojeva, tekstualna kolone kategorija. Sva se prikazuju na **Sirovo** na kartici jedinice. Ovo se čita s razlogom:

| Svojstva | Upotreba |
|---|---|
| T (sva četiri oblika), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Položaj, stav, figura, ime jedinice, tim |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Polja, grafici, HUD, otkrivanje uzletanja i sletanja |
| VerticalGForce, LongitudinalGForce, LateralGForce | Polja G |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Polja |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Polja goriva, zbir po rezervoarima |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Radarski čunjevi i vrata dometa |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Linije zaključavanja |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Kupole angažmana |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Polja |
| Health | Polje |
| Događaji: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Spisak događaja, statistika (smrti, uzleti, sletanja), zabilješke; Message i Comment kao titlovi |
| PilotHeadYaw, PilotHeadPitch | Linija pogleda pilota |
| Oznaka tipa Bullseye (Navaid+Static+Bullseye) | Polje bullseye-a i prstenovi na karti |
| Sve ostalo (PilotHeadRoll, upravljanja, površine, odstupanja ILS-a, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, veličine...) | Prikazano kako je zapisano na **Sirovo** |

Uglovi radara i zaključavanja mjere se u odnosu na vlastite ose jedinice: azimut udesno, elevacija gore, valjanje desno krilo dolje. ACMI specifikacija kaže da su relativni prema letjelici, ali ne kaže koji smjer je pozitivan; ovo čitanje prati njenu transformaciju (yaw u smjeru kazaljke, pitch gore, roll desno).
